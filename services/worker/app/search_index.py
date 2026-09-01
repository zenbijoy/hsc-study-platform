from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from app.staging import StagingContentStore


def build_search_index(stage: StagingContentStore, path: Path) -> dict:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)
    conn = sqlite3.connect(path)
    try:
        conn.execute("pragma journal_mode=delete")
        conn.execute("pragma synchronous=normal")
        conn.execute("create virtual table docs using fts5(id unindexed, type, subject, chapter, title, body, tokenize='unicode61')")
        batch = []
        count = 0
        for row in stage.iter_rows():
            payload = json.loads(row["payload"])
            body = payload.get("question") or payload.get("answer") or payload.get("latex") or payload.get("title") or ""
            batch.append((row["fingerprint"], row["type"], row["subject"], row["chapter"], payload.get("title") or "", body))
            count += 1
            if len(batch) >= 5000:
                conn.executemany("insert into docs(id,type,subject,chapter,title,body) values(?,?,?,?,?,?)", batch)
                batch.clear()
        if batch:
            conn.executemany("insert into docs(id,type,subject,chapter,title,body) values(?,?,?,?,?,?)", batch)
        conn.execute("create table meta(key text primary key, value text not null)")
        conn.executemany("insert into meta(key,value) values(?,?)", [("schema", "1"), ("item_count", str(count))])
        conn.commit()
    finally:
        conn.close()
    return {"path": str(path), "count": count, "byte_size": path.stat().st_size, "codec": "sqlite-fts5"}
