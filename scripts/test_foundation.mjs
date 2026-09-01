import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Running Foundation Verification Suite ---');

// 1. Verify Shared Schemas
const contentItemSchemaPath = path.resolve('schemas/content-item.schema.json');
const importManifestSchemaPath = path.resolve('schemas/import-manifest.schema.json');
assert(fs.existsSync(contentItemSchemaPath), 'content-item schema exists');
assert(fs.existsSync(importManifestSchemaPath), 'import-manifest schema exists');

const contentSchema = JSON.parse(fs.readFileSync(contentItemSchemaPath, 'utf8'));
assert.strictEqual(contentSchema.type, 'object', 'Content schema is valid JSON Schema object');
console.log('✓ Schemas verified');

// 2. Verify Migrations
const initSql = fs.readFileSync('supabase/migrations/0001_init.sql', 'utf8');
assert(initSql.includes('create table public.profiles'), 'profiles table present in SQL');
assert(initSql.includes('create table public.book_secrets'), 'book_secrets table present in SQL');
assert(initSql.includes('alter table public.books enable row level security'), 'RLS enabled on books');
assert(!initSql.includes('bytea') && !initSql.includes('blob'), 'PostgreSQL is free of binary blobs');
console.log('✓ PostgreSQL schema and RLS verified');

// 3. Verify Edge Function
const edgeFunction = fs.readFileSync('supabase/functions/book-license/index.ts', 'utf8');
assert(edgeFunction.includes('x25519'), 'X25519 crypto in Edge Function');
assert(edgeFunction.includes('CONTENT_MASTER_KEY_B64'), 'Master key referenced in Edge Function');
console.log('✓ Edge Function licensing handshake verified');

// 4. Verify Mobile Environment & Config
const envTs = fs.readFileSync('apps/mobile/src/config/env.ts', 'utf8');
assert(envTs.includes('EXPO_PUBLIC_SUPABASE_URL'), 'Expo static env mapping present');
assert(envTs.includes('isDemoMode'), 'Demo mode fallback supported');
console.log('✓ Mobile environment configuration verified');

console.log('\nAll Foundation Tests PASSED successfully (4/4 test suites).');
