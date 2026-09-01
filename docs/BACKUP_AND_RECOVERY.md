# Backup, Disaster Recovery & Storage Reconciliation

This document establishes the operational procedures for database backups, storage replication, disaster recovery, and artifact reconciliation in the HSC Study Platform.

---

## 1. Storage Tiers & Recovery Principles

1. **Tier 1: Original Source PDFs (`10_ORIGINALS/`)** — *CRITICAL IRREPLACEABLE ASSETS*
   - Original source PDFs in Google Drive 5TB cannot be reconstructed if lost.
   - Standard Google Drive retention and versioning protect against accidental deletion.
2. **Tier 2: PostgreSQL Database (Supabase)** — *RELATIONAL METADATA & PROGRESS*
   - Contains book catalog metadata, active version pointers, chapter mappings, reading progress, and bookmarks.
   - Backed up via daily pg_dump / Supabase automated backups.
3. **Tier 3: Processed Artifacts (`20_SECURE_BOOKS/`, `30_SEARCH_PACKS/`, `50_COVERS/`)** — *RECONSTRUCTABLE*
   - If encrypted packages or search indexes are corrupted or lost, they can be 100% reconstructed by re-running the worker pipeline against the Tier 1 Original PDFs using the master key.

---

## 2. Database Backup & Export Command

To perform a manual logical backup of PostgreSQL:
```bash
pg_dump --clean --if-exists --no-owner --no-privileges \
  -h "db.xyz.supabase.co" -U "postgres" -d "postgres" \
  -f "hsc_backup_$(date +%Y%m%d_%H%M%S).sql"
```

To restore:
```bash
psql -h "db.xyz.supabase.co" -U "postgres" -d "postgres" -f "hsc_backup_YYYYMMDD.sql"
```

---

## 3. Storage Reconciliation & Artifact Repair

If the Quality Dashboard flags broken packages (`broken_packages > 0`):
1. Navigate to `/quality` in the Admin Studio.
2. Click **Broken Packages** to filter affected books.
3. In the Book Studio, navigate to the **Reader & Security** tab.
4. Click **Rebuild Secure Package**. The worker reads the Tier 1 original PDF, generates a new validated candidate, and promotes it to active status.

---

## 4. Temporary Cache & Disk Cleanup

The worker temp directory (`/data/inbox/sessions`) cleans up completed resumable uploads automatically. To manually purge stale session chunks older than 24 hours:
```bash
find /data/inbox/sessions -type d -mtime +1 -exec rm -rf {} +
```
