from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from app.models import ImportJob


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
                  payload text not null,
                  status text not null,
                  created_at text not null,
                  updated_at text not null
                )
                """
            )
            c.execute("create index if not exists jobs_status_idx on jobs(status, created_at)")

    def put(self, job: ImportJob) -> None:
        job.updated_at = datetime.now(timezone.utc).isoformat()
        payload = job.model_dump_json()
        with self._lock, self._conn() as c:
            c.execute(
                "insert into jobs(id,payload,status,created_at,updated_at) values(?,?,?,?,?) "
                "on conflict(id) do update set payload=excluded.payload,status=excluded.status,updated_at=excluded.updated_at",
                (job.id, payload, job.status, job.created_at, job.updated_at),
            )

    def get(self, job_id: str) -> ImportJob | None:
        with self._conn() as c:
            row = c.execute("select payload from jobs where id=?", (job_id,)).fetchone()
        return ImportJob.model_validate_json(row["payload"]) if row else None

    def next_queued(self) -> ImportJob | None:
        with self._lock, self._conn() as c:
            c.execute("begin immediate")
            row = c.execute("select id,payload from jobs where status='queued' order by created_at limit 1").fetchone()
            if not row:
                c.commit()
                return None
            job = ImportJob.model_validate_json(row["payload"])
            job.status = "processing"
            job.stage = "quick_scan"
            job.message = "Worker claimed job"
            job.updated_at = datetime.now(timezone.utc).isoformat()
            c.execute("update jobs set payload=?,status=?,updated_at=? where id=?", (job.model_dump_json(), job.status, job.updated_at, job.id))
            c.commit()
            return job

    def list_recent(self, limit: int = 50) -> list[ImportJob]:
        with self._conn() as c:
            rows = c.execute("select payload from jobs order by created_at desc limit ?", (limit,)).fetchall()
        return [ImportJob.model_validate_json(r["payload"]) for r in rows]
