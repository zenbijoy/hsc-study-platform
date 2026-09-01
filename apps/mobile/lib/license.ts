import * as SecureStore from 'expo-secure-store';
import { x25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { gcm } from '@noble/ciphers/aes.js';
import { fromB64, toB64 } from './base64';
import { getOrCreateDeviceKeyPair } from './deviceKeys';
import { supabase } from './supabase';

export type LicenseEnvelope = {
  bookVersionId: string;
  ephemeralPublicKeyB64: string;
  nonceB64: string;
  saltB64: string;
  wrappedContentKeyB64: string;
  deliveryUrl: string;
  expiresAt: string;
};

const enc = new TextEncoder();

export async function unwrapLicense(envelope: LicenseEnvelope): Promise<Uint8Array> {
  const device = await getOrCreateDeviceKeyPair();
  const shared = x25519.getSharedSecret(device.secretKey, fromB64(envelope.ephemeralPublicKeyB64));
  const wrapKey = hkdf(
    sha256,
    shared,
    fromB64(envelope.saltB64),
    enc.encode(`hscp-license:${envelope.bookVersionId}`),
    32
  );
  const contentKey = gcm(wrapKey, fromB64(envelope.nonceB64)).decrypt(fromB64(envelope.wrappedContentKeyB64));
  await SecureStore.setItemAsync(`hscp-key:${envelope.bookVersionId}`, toB64(contentKey), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(`hscp-exp:${envelope.bookVersionId}`, envelope.expiresAt);
  return contentKey;
}

export async function getCachedContentKey(bookVersionId: string) {
  const key = await SecureStore.getItemAsync(`hscp-key:${bookVersionId}`);
  const exp = await SecureStore.getItemAsync(`hscp-exp:${bookVersionId}`);
  if (!key || !exp || Date.parse(exp) < Date.now()) return null;
  return fromB64(key);
}

export async function requestBookLicense(bookVersionId: string, deviceId: string): Promise<LicenseEnvelope> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  const url = process.env.EXPO_PUBLIC_LICENSE_FUNCTION_URL;
  if (!token || !url) throw new Error('License service is not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ bookVersionId, deviceId }),
  });
  if (!res.ok) throw new Error(`License request failed (${res.status})`);
  return res.json();
}
