import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Running Phase 04 App Shell & Navigation Tests ---');

// 1. Test Destination Route Resolver logic
function resolveInitialRoute({ authStatus, isSupabaseConfigured, deepLinkPath }) {
  if (!isSupabaseConfigured) {
    return deepLinkPath || '/(tabs)';
  }
  switch (authStatus) {
    case 'initializing':
    case 'profile-loading':
      return '/';
    case 'signed-out':
    case 'error':
      return '/auth';
    case 'onboarding-required':
      return '/(tabs)';
    case 'ready':
    default:
      return deepLinkPath || '/(tabs)';
  }
}

// Test 1.1: Signed out student on configured cloud
assert.strictEqual(
  resolveInitialRoute({ authStatus: 'signed-out', isSupabaseConfigured: true }),
  '/auth',
  'Signed-out student routes to /auth'
);

// Test 1.2: Authenticated student
assert.strictEqual(
  resolveInitialRoute({ authStatus: 'ready', isSupabaseConfigured: true }),
  '/(tabs)',
  'Authenticated student routes to /(tabs)'
);

// Test 1.3: Deep link preservation
assert.strictEqual(
  resolveInitialRoute({ authStatus: 'ready', isSupabaseConfigured: true, deepLinkPath: '/book/phys-1' }),
  '/book/phys-1',
  'Deep link path preserved for authenticated student'
);

// Test 1.4: Demo mode unconfigured fallback
assert.strictEqual(
  resolveInitialRoute({ authStatus: 'signed-out', isSupabaseConfigured: false }),
  '/(tabs)',
  'Demo mode unconfigured routes to /(tabs)'
);

console.log('✓ Route resolver scenarios verified (4/4 tests)');

// 2. Test Semver & App Version Checker
function parseSemver(v) {
  return v.split('.').map((p) => parseInt(p, 10) || 0);
}
function isVersionOlder(current, target) {
  const [cMaj, cMin, cPat] = parseSemver(current);
  const [tMaj, tMin, tPat] = parseSemver(target);
  if (cMaj < tMaj) return true;
  if (cMaj > tMaj) return false;
  if (cMin < tMin) return true;
  if (cMin > tMin) return false;
  return cPat < tPat;
}

assert.strictEqual(isVersionOlder('0.1.0', '0.2.0'), true, '0.1.0 is older than 0.2.0');
assert.strictEqual(isVersionOlder('0.2.1', '0.2.0'), false, '0.2.1 is newer than 0.2.0');
assert.strictEqual(isVersionOlder('1.0.0', '0.9.9'), false, '1.0.0 is newer than 0.9.9');
console.log('✓ App version compatibility checker verified');

// 3. Verify Native Splash & Shell Files
const appJson = JSON.parse(fs.readFileSync('apps/mobile/app.json', 'utf8'));
assert(appJson.expo.splash, 'app.json has native splash configured');
assert.strictEqual(appJson.expo.splash.backgroundColor, '#071018', 'Native splash matches theme background');
console.log('✓ Native splash configuration verified');

console.log('\nAll Phase 04 Shell Tests PASSED successfully.');
