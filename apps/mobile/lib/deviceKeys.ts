import * as SecureStore from 'expo-secure-store';
import { x25519 } from '@noble/curves/ed25519.js';
import { toB64, fromB64 } from './base64';

const SECRET_KEY = 'hsc_device_x25519_secret_v1';
const PUBLIC_KEY = 'hsc_device_x25519_public_v1';

export type DeviceKeyPair = { secretKey: Uint8Array; publicKey: Uint8Array };

export async function getOrCreateDeviceKeyPair(): Promise<DeviceKeyPair> {
  const existingSecret = await SecureStore.getItemAsync(SECRET_KEY);
  const existingPublic = await SecureStore.getItemAsync(PUBLIC_KEY);
  if (existingSecret && existingPublic) {
    return { secretKey: fromB64(existingSecret), publicKey: fromB64(existingPublic) };
  }
  const pair = x25519.keygen();
  await SecureStore.setItemAsync(SECRET_KEY, toB64(pair.secretKey), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await SecureStore.setItemAsync(PUBLIC_KEY, toB64(pair.publicKey), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return pair;
}

export async function getDevicePublicKeyB64() {
  return toB64((await getOrCreateDeviceKeyPair()).publicKey);
}
