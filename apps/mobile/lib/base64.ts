import { fromByteArray, toByteArray } from 'base64-js';

export const toB64 = (bytes: Uint8Array) => fromByteArray(bytes);
export const fromB64 = (value: string) => toByteArray(value);
