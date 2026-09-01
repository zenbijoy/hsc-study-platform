from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Iterable, Iterator

from app.dedupe import attach_fingerprint
from app.models import ContentItem


class StagingContentStore:
    """Disk-backed normalization/dedupe store.

    A million-row JSONL import is streamed into SQLite instead of being held in RAM. Fingerprints are
    unique keys, so duplicate elimination is O(log n) and idempotent within the import.
    """

    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.unlink(missing_ok=True)
        self.conn = sqlite3.connect(path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("pragma journal_mode=WAL")
        self.conn.execute("pragma synchronous=NORMAL")
        self.conn.execute("pragma temp_store=MEMORY")
        self.conn.execute(
            """
            create table items(
              fingerprint text primary key,
              type text not null,
              subject text not null,
              chapter text not null,
              confidence real not null,
              payload text not null
            ) without rowid
            """
        )
        self.conn.execute("create index items_group_idx on items(subject,chapter,type)")
        self.total = 0
        self.invalid = 0
        self.duplicates = 0

    def ingest(self, items: Iterable[ContentItem], commit_every: int = 5000) -> None:
        pending = 0
        for item in items:
            self.total += 1
            if item.type == "unknown" or item.confidence <= 0 or not item.canonical_text():
                self.invalid += 1
                continue
            attach_fingerprint(item)
            assert item.fingerprint
            cur = self.conn.execute(
                "insert or ignore into items(fingerprint,type,subject,chapter,confidence,payload) values(?,?,?,?,?,?)",
                (
                    item.fingerprint,
                    item.type,
                    item.subject.strip().lower() or "unknown",
                    item.chapter.strip().lower() or "unclassified",
                    float(item.confidence),
                    item.model_dump_json(exclude_none=True),
                ),
            )
            if cur.rowcount == 0:
                self.duplicates += 1
            pending += 1
            if pending >= commit_every:
                self.conn.commit()
                pending = 0
        self.conn.commit()

    @property
    def unique_count(self) -> int:
        return int(self.conn.execute("select count(*) from items").fetchone()[0])

    def count_type(self, content_type: str) -> int:
        return int(self.conn.execute("select count(*) from items where type=?", (content_type,)).fetchone()[0])

    def group_keys(self) -> list[tuple[str, str, str, int]]:
        rows = self.conn.execute(
            "select subject,chapter,type,count(*) as n from items group by subject,chapter,type order by subject,chapter,type"
        ).fetchall()
        return [(r["subject"], r["chapter"], r["type"], int(r["n"])) for r in rows]

    def iter_payloads(self, subject: str | None = None, chapter: str | None = None, content_type: str | None = None) -> Iterator[str]:
        if subject is None:
            cur = self.conn.execute("select payload from items order by fingerprint")
        else:
            cur = self.conn.execute(
                "select payload from items where subject=? and chapter=? and type=? order by fingerprint",
                (subject, chapter, content_type),
            )
        for row in cur:
            yield row["payload"]

    def iter_rows(self):
        yield from self.conn.execute("select fingerprint,type,subject,chapter,confidence,payload from items")

    def low_confidence(self, threshold: float = 0.80, limit: int = 100) -> list[dict]:
        rows = self.conn.execute(
            "select payload from items where confidence < ? order by confidence asc limit ?", (threshold, limit)
        ).fetchall()
        return [json.loads(r["payload"]) for r in rows]

    def close(self):
        self.conn.close()
