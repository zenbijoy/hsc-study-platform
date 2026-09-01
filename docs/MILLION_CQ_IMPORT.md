# Million-CQ Streaming Import & Deduplication Pipeline

**Specification**: `docs/MILLION_CQ_IMPORT.md`  
**Applies To**: `services/worker`, `supabase`, `schemas/content-item.schema.json`  
**Purpose**: High-throughput, memory-bounded ingestion, deduplication, and atomic publishing pipeline for 1,000,000+ HSC Creative Questions.

---

## 1. Input Format & Streaming Contract

The canonical ingestion format for large question sets is **line-delimited JSON (JSONL)**. Each line represents an independent, valid `content-item` JSON object conforming to `schemas/content-item.schema.json`.

```jsonl
{"type":"cq","subject_id":"physics","paper_number":1,"chapter_id":"ch-vector","board":"dhaka","year":2025,"title":"নৌকা ও নদীর আপেক্ষিক বেগ","stimulus":"একটি নদীর প্রস্থ 1.5 km...","sub_questions":[{"letter":"a","banglaLetter":"ক","question":"একক ভেক্টর কাকে বলে?","marks":1,"solution":"যে ভেক্টরের মান এক একক..."}]}
```

> [!IMPORTANT]
> **Zero Memory Ingestion**: The importer processes files strictly as stream iterators (`for line in file:`), guaranteeing constant O(1) RAM usage regardless of whether the source file is 10 MB or 50 GB.

---

## 2. Ingestion Pipeline Stages

```text
[Stream JSONL Source] 
         │
         ▼
[Schema & Encoding Normalization] ➔ [Error Log: import-errors.jsonl]
         │
         ▼
[Deterministic Deduplication] ➔ Computes Fingerprint (SHA-256)
         │
         ▼
[Academic Classification] ➔ Subject, Chapter, Board, Difficulty, Importance
         │
         ▼
[Knowledge Graph Auto-Linking] ➔ Formula IDs & Textbook Page Links
         │
         ▼
[Disk-Backed Staging Table] ➔ Checkpointed every 5,000 records
         │
         ▼
[Pack Generation & Verification] ➔ SQLite / Content Pack (.pack)
         │
         ▼
[Atomic Publishing] ➔ Switches Active Version Pointer in Supabase
```

---

## 3. Deduplication Engine

Fingerprints are computed deterministically before staging:
- **Normalized Stem**: Lowercase, whitespace collapsed, Bangla punctuation unified.
- **Sub-Questions Sequence**: Sorted parts (`ক:...|খ:...|গ:...|ঘ:...`).
- **Exact Duplicate**: Identical fingerprint ➔ Silently merged / reference count incremented.
- **Near Duplicate**: High fuzzy similarity score (`>0.90`) with different year/board ➔ Routed to Admin Review Queue.

---

## 4. Atomic Publishing & Instant Rollback

- **No Partial Exposure**: Students continue reading published pack version `N` while version `N+1` is being generated and validated.
- **Instant Rollback**: If a data defect is discovered, updating the single `active_version` pointer in Supabase rolls back the entire 1,000,000 questions in `< 10ms` without deleting individual rows.
