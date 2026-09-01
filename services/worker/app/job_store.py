from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from app.models import ImportGroup, ImportJob


class JobStore:
    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()
        self._init()

    def _conn(self):
        conn = sqlite3.connect(self.path, timeout=30)
        conn.row_factory = sqlite3.Row
        return conn

    def _init(self):
        with self._conn() as c:
            c.execute(
                """
                create table if not exists jobs (
                  id text primary key,
                  import_group_id text,
                  priority text not null default 'NORMAL',
                  status text not null,
                  stage text not null default 'upload',
                  lease_worker_id text,
                  lease_expires_at text,
                  heartbeat_at text,
                  payload text not null,
                  created_at text not null,
                  updated_at text not null
                )
                """
            )
            c.execute(
                """
                create table if not exists import_groups (
                  id text primary key,
                  name text not null,
                  source_type text not null,
                  status text not null default 'active',
                  total_files int not null default 0,
                  processed_files int not null default 0,
                  published_files int not null default 0,
                  failed_files int not null default 0,
                  created_by text,
                  created_at text not null,
                  updated_at text not null
                )
                """
            )
            c.execute("create index if not exists jobs_status_prio_idx on jobs(status, priority, created_at)")
            c.execute("create index if not exists jobs_group_idx on jobs(import_group_id)")

    def put(self, job: ImportJob) -> None:
        job.updated_at = datetime.now(timezone.utc).isoformat()
        payload = job.model_dump_json()
        with self._lock, self._conn() as c:
            c.execute(
                """
                insert into jobs(id, import_group_id, priority, status, stage, lease_worker_id, lease_expires_at, heartbeat_at, payload, created_at, updated_at)
                values(?,?,?,?,?,?,?,?,?,?,?)
                on conflict(id) do update set
                  import_group_id=excluded.import_group_id,
                  priority=excluded.priority,
                  status=excluded.status,
                  stage=excluded.stage,
                  lease_worker_id=excluded.lease_worker_id,
                  lease_expires_at=excluded.lease_expires_at,
                  heartbeat_at=excluded.heartbeat_at,
                  payload=excluded.payload,
                  updated_at=excluded.updated_at
                """,
                (
                    job.id,
                    job.import_group_id,
                    job.priority,
                    job.status,
                    job.stage,
                    job.lease_worker_id,
                    job.lease_expires_at,
                    job.heartbeat_at,
                    payload,
                    job.created_at,
                    job.updated_at,
                ),
            )
        if job.import_group_id:
            self.update_group_stats(job.import_group_id)

    def get(self, job_id: str) -> ImportJob | None:
        with self._conn() as c:
            row = c.execute("select payload from jobs where id=?", (job_id,)).fetchone()
        return ImportJob.model_validate_json(row["payload"]) if row else None

    def next_queued(self, worker_id: str, lease_seconds: int = 120) -> ImportJob | None:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        lease_expires = (now + timedelta(seconds=lease_seconds)).isoformat()

        with self._lock, self._conn() as c:
            c.execute("begin immediate")

            # 1. Recover stale leased jobs whose lease has expired
            c.execute(
                """
                update jobs set
                  status='queued',
                  lease_worker_id=null,
                  lease_expires_at=null,
                  updated_at=?
                where status='processing' and lease_expires_at is not null and lease_expires_at < ?
                """,
                (now_iso, now_iso),
            )

            # 2. Select next queued job ordered by Priority (HIGH > NORMAL > LOW) then created_at
            row = c.execute(
                """
                select id, payload from jobs
                where status='queued'
                order by
                  case priority when 'HIGH' then 1 when 'NORMAL' then 2 when 'LOW' then 3 else 2 end,
                  created_at asc
                limit 1
                """
            ).fetchone()

            if not row:
                c.commit()
                return None

            job = ImportJob.model_validate_json(row["payload"])
            job.status = "processing"
            job.lease_worker_id = worker_id
            job.lease_expires_at = lease_expires
            job.heartbeat_at = now_iso
            job.updated_at = now_iso

            c.execute(
                """
                update jobs set
                  status='processing',
                  lease_worker_id=?,
                  lease_expires_at=?,
                  heartbeat_at=?,
                  payload=?,
                  updated_at=?
                where id=?
                """,
                (worker_id, lease_expires, now_iso, job.model_dump_json(), now_iso, job.id),
            )
            c.commit()
            return job

    def heartbeat(self, job_id: str, worker_id: str, lease_seconds: int = 120) -> None:
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()
        lease_expires = (now + timedelta(seconds=lease_seconds)).isoformat()

        with self._lock, self._conn() as c:
            c.execute(
                """
                update jobs set
                  heartbeat_at=?,
                  lease_expires_at=?,
                  updated_at=?
                where id=? and lease_worker_id=? and status='processing'
                """,
                (now_iso, lease_expires, now_iso, job_id, worker_id),
            )

    def cancel(self, job_id: str) -> ImportJob | None:
        job = self.get(job_id)
        if not job or job.status in ("published", "completed"):
            return job
        job.status = "cancelled"
        job.message = "Job cancelled by admin"
        job.lease_worker_id = None
        job.lease_expires_at = None
        self.put(job)
        return job

    def retry(self, job_id: str, target_stage: str | None = None) -> ImportJob | None:
        job = self.get(job_id)
        if not job:
            return None
        job.status = "queued"
        job.error = None
        if target_stage:
            job.stage = target_stage
        else:
            job.stage = "upload"
            job.progress = 1
        job.lease_worker_id = None
        job.lease_expires_at = None
        job.message = f"Retrying from stage: {job.stage}"
        self.put(job)
        return job

    def list_recent(self, limit: int = 100, status: str | None = None, group_id: str | None = None) -> list[ImportJob]:
        with self._conn() as c:
            query = "select payload from jobs"
            params: list[Any] = []
            clauses = []
            if status:
                clauses.append("status = ?")
                params.append(status)
            if group_id:
                clauses.append("import_group_id = ?")
                params.append(group_id)
            if clauses:
                query += " where " + " and ".join(clauses)
            query += " order by created_at desc limit ?"
            params.append(limit)

            rows = c.execute(query, params).fetchall()
        return [ImportJob.model_validate_json(r["payload"]) for r in rows]

    # Import Groups management
    def create_group(self, group: ImportGroup) -> None:
        with self._lock, self._conn() as c:
            c.execute(
                """
                insert into import_groups(id, name, source_type, status, total_files, processed_files, published_files, failed_files, created_by, created_at, updated_at)
                values(?,?,?,?,?,?,?,?,?,?,?)
                on conflict(id) do update set
                  name=excluded.name,
                  status=excluded.status,
                  total_files=excluded.total_files,
                  processed_files=excluded.processed_files,
                  published_files=excluded.published_files,
                  failed_files=excluded.failed_files,
                  updated_at=excluded.updated_at
                """,
                (
                    group.id,
                    group.name,
                    group.source_type,
                    group.status,
                    group.total_files,
                    group.processed_files,
                    group.published_files,
                    group.failed_files,
                    group.created_by,
                    group.created_at,
                    group.updated_at,
                ),
            )

    def get_group(self, group_id: str) -> ImportGroup | None:
        with self._conn() as c:
            row = c.execute("select * from import_groups where id=?", (group_id,)).fetchone()
        if not row:
            return None
        return ImportGroup(
            id=row["id"],
            name=row["name"],
            source_type=row["source_type"],
            status=row["status"],
            total_files=row["total_files"],
            processed_files=row["processed_files"],
            published_files=row["published_files"],
            failed_files=row["failed_files"],
            created_by=row["created_by"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def list_groups(self, limit: int = 50) -> list[ImportGroup]:
        with self._conn() as c:
            rows = c.execute("select * from import_groups order by created_at desc limit ?", (limit,)).fetchall()
        return [
            ImportGroup(
                id=r["id"],
                name=r["name"],
                source_type=r["source_type"],
                status=r["status"],
                total_files=r["total_files"],
                processed_files=r["processed_files"],
                published_files=r["published_files"],
                failed_files=r["failed_files"],
                created_by=r["created_by"],
                created_at=r["created_at"],
                updated_at=r["updated_at"],
            )
            for r in rows
        ]

    def update_group_stats(self, group_id: str) -> None:
        with self._lock, self._conn() as c:
            stats = c.execute(
                """
                select
                  count(*) as total,
                  sum(case when status in ('ready_for_review','published') then 1 else 0 end) as processed,
                  sum(case when status='published' then 1 else 0 end) as published,
                  sum(case when status='failed' then 1 else 0 end) as failed
                from jobs where import_group_id=?
                """,
                (group_id,),
            ).fetchone()

            if stats:
                now_iso = datetime.now(timezone.utc).isoformat()
                c.execute(
                    """
                    update import_groups set
                      total_files=?,
                      processed_files=?,
                      published_files=?,
                      failed_files=?,
                      updated_at=?
                    where id=?
                    """,
                    (stats["total"], stats["processed"] or 0, stats["published"] or 0, stats["failed"] or 0, now_iso, group_id),
                )
