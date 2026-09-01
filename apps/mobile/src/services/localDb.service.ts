import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('hsc_study_local.db');
  }
  return dbInstance;
}

export async function initLocalDatabase(): Promise<void> {
  const db = await getDb();

  // 1. Migrations table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  // Migration 001: Core Offline Cache & Sync Queue
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_subjects (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      accent TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cached_books (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      publisher TEXT,
      page_count INTEGER DEFAULT 0,
      chapter_count INTEGER DEFAULT 0,
      formula_count INTEGER DEFAULT 0,
      is_protected INTEGER DEFAULT 1,
      published_version_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cached_chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      start_page INTEGER NOT NULL,
      end_page INTEGER,
      formula_count INTEGER DEFAULT 0,
      cq_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reading_progress_queue (
      book_id TEXT PRIMARY KEY,
      page_number INTEGER NOT NULL,
      total_pages INTEGER NOT NULL,
      percentage REAL NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      last_synced_at TEXT NOT NULL
    );
  `);
}

/**
 * Execute operations within a safe database transaction.
 * Rolls back automatically if an error is thrown.
 */
export async function runInTransaction<T>(
  action: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDb();
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    const result = await action(db);
    await db.execAsync('COMMIT;');
    return result;
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    console.error('[SQLite] Transaction rolled back due to error:', error);
    throw error;
  }
}
