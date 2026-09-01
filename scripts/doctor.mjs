import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const required = [
  'apps/mobile/package.json',
  'apps/admin/package.json',
  'services/worker/pyproject.toml',
  'supabase/migrations/0001_init.sql',
  'supabase/functions/book-license/index.ts',
  'schemas/content-item.schema.json',
];

let ok = true;
for (const p of required) {
  if (!existsSync(p)) {
    console.error(`✗ Missing ${p}`);
    ok = false;
  } else console.log(`✓ ${p}`);
}

try {
  console.log(`✓ Node: ${execSync('node --version').toString().trim()}`);
} catch {
  console.error('✗ Node not available');
  ok = false;
}

try {
  console.log(`✓ Python: ${execSync('python --version').toString().trim()}`);
} catch {
  console.warn('! Python not found in PATH — install Python 3.12+ to run services/worker');
}

if (!ok) process.exit(1);
console.log('\n✓ HSC Study Platform workspace structure verified successfully.');
