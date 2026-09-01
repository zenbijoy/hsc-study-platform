import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('hsc-study.db');
let initialized = false;

export function initLocalDb() {
  if (initialized) return;
  db.execSync(`
    pragma journal_mode = WAL;
    create table if not exists local_progress(
      book_id text primary key,
      page_number integer not null,
      percentage real not null default 0,
      dirty integer not null default 1,
      updated_at text not null
    );
    create table if not exists cached_catalog(
      cache_key text primary key,
      payload text not null,
      version text,
      updated_at text not null
    );
    create table if not exists pending_events(
      id integer primary key autoincrement,
      event_type text not null,
      payload text not null,
      created_at text not null
    );
  `);
  initialized = true;
}

export async function saveLocalProgress(bookId: string, page: number, totalPages: number) {
  initLocalDb();
  const percentage = totalPages > 0 ? page / totalPages : 0;
  await db.runAsync(
    `insert into local_progress(book_id,page_number,percentage,dirty,updated_at)
     values(?,?,?,?,?)
     on conflict(book_id) do update set page_number=excluded.page_number,percentage=excluded.percentage,dirty=1,updated_at=excluded.updated_at`,
    bookId,
    page,
    percentage,
    1,
    new Date().toISOString()
  );
}

export async function getLocalProgress(bookId: string) {
  initLocalDb();
  return db.getFirstAsync<{ page_number: number; percentage: number }>(
    'select page_number,percentage from local_progress where book_id=?',
    bookId
  );
}

export async function cacheCatalog(key: string, value: unknown, version = '') {
  initLocalDb();
  await db.runAsync(
    `insert into cached_catalog(cache_key,payload,version,updated_at) values(?,?,?,?)
     on conflict(cache_key) do update set payload=excluded.payload,version=excluded.version,updated_at=excluded.updated_at`,
    key,
    JSON.stringify(value),
    version,
    new Date().toISOString()
  );
}

export async function readCachedCatalog<T>(key: string): Promise<T | null> {
  initLocalDb();
  const row = await db.getFirstAsync<{ payload: string }>('select payload from cached_catalog where cache_key=?', key);
  return row ? JSON.parse(row.payload) as T : null;
}

export async function getDirtyProgress(limit = 50) {
  initLocalDb();
  return db.getAllAsync<{ book_id: string; page_number: number; percentage: number; updated_at: string }>(
    'select book_id,page_number,percentage,updated_at from local_progress where dirty=1 order by updated_at limit ?',
    limit
  );
}

export async function markProgressClean(bookId: string) {
  initLocalDb();
  await db.runAsync('update local_progress set dirty=0 where book_id=?', bookId);
}
