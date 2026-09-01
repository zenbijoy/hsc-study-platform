import { createClient } from 'npm:@supabase/supabase-js@2';
import { x25519 } from 'npm:@noble/curves@2/ed25519.js';
import { gcm } from 'npm:@noble/ciphers@2/aes.js';
import { randomBytes } from 'npm:@noble/ciphers@2/utils.js';
import { hkdf } from 'npm:@noble/hashes@2/hkdf.js';
import { sha256 } from 'npm:@noble/hashes@2/sha2.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const enc = new TextEncoder();

function b64ToBytes(value: string): Uint8Array {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64(value: Uint8Array): string {
  let s = '';
  for (let i = 0; i < value.length; i++) s += String.fromCharCode(value[i]);
  return btoa(s);
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const auth = req.headers.get('authorization') ?? '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const masterKeyB64 = Deno.env.get('CONTENT_MASTER_KEY_B64')!;
    if (!supabaseUrl || !serviceKey || !masterKeyB64) return json({ error: 'server_not_configured' }, 500);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: userResult, error: userError } = await admin.auth.getUser(token);
    const user = userResult.user;
    if (userError || !user) return json({ error: 'unauthorized' }, 401);

    const { bookVersionId, deviceId } = await req.json();
    if (!bookVersionId || !deviceId) return json({ error: 'missing_fields' }, 400);

    const { data: device } = await admin.from('devices').select('id,user_id,public_key_b64,revoked_at').eq('id', deviceId).eq('user_id', user.id).maybeSingle();
    if (!device || device.revoked_at) return json({ error: 'device_not_allowed' }, 403);

    const { data: version } = await admin.from('book_versions').select('id,book_id,version,delivery_url,is_active').eq('id', bookVersionId).maybeSingle();
    if (!version || !version.is_active) return json({ error: 'book_version_unavailable' }, 404);

    const { data: book } = await admin.from('books').select('id,is_published,access_mode').eq('id', version.book_id).maybeSingle();
    if (!book?.is_published) return json({ error: 'book_unavailable' }, 404);

    if (book.access_mode !== 'free') {
      const now = new Date().toISOString();
      const { data: entitlement } = await admin.from('entitlements').select('id,expires_at,revoked_at').eq('user_id', user.id).eq('book_id', book.id).maybeSingle();
      if (!entitlement || entitlement.revoked_at || (entitlement.expires_at && entitlement.expires_at < now)) {
        return json({ error: 'not_entitled' }, 403);
      }
    }

    const { data: secret } = await admin.from('book_secrets').select('key_version,nonce_b64,ciphertext_b64').eq('book_version_id', version.id).maybeSingle();
    if (!secret) return json({ error: 'book_key_unavailable' }, 503);

    const masterKey = b64ToBytes(masterKeyB64);
    if (masterKey.length !== 32) return json({ error: 'invalid_master_key' }, 500);
    const contentKey = gcm(masterKey, b64ToBytes(secret.nonce_b64), enc.encode(`hscp-master-key:v${secret.key_version}`)).decrypt(b64ToBytes(secret.ciphertext_b64));

    const ephemeral = x25519.keygen();
    const shared = x25519.getSharedSecret(ephemeral.secretKey, b64ToBytes(device.public_key_b64));
    const salt = randomBytes(32);
    const wrapKey = hkdf(sha256, shared, salt, enc.encode(`hscp-license:${version.id}`), 32);
    const nonce = randomBytes(12);
    const wrappedContentKey = gcm(wrapKey, nonce).encrypt(contentKey);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await admin.from('devices').update({ last_seen_at: new Date().toISOString() }).eq('id', device.id);

    return json({
      bookVersionId: version.id,
      ephemeralPublicKeyB64: bytesToB64(ephemeral.publicKey),
      nonceB64: bytesToB64(nonce),
      saltB64: bytesToB64(salt),
      wrappedContentKeyB64: bytesToB64(wrappedContentKey),
      deliveryUrl: version.delivery_url,
      expiresAt,
    });
  } catch (error) {
    console.error(error);
    return json({ error: 'internal_error' }, 500);
  }
});
