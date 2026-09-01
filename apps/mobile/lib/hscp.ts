import { File, Paths } from 'expo-file-system';
import { gcm } from '@noble/ciphers/aes.js';

const MAGIC = 'HSCP0001';
const decoder = new TextDecoder();
const encoder = new TextEncoder();

export type HscpChunk = {
  index: number;
  offset: number;
  cipherLength: number;
  plainLength: number;
  nonceLength: number;
  sha256: string;
};

export type HscpHeader = {
  schema: 1;
  bookId: string;
  version: number;
  mediaType: string;
  originalName: string;
  originalSize: number;
  chunkSize: number;
  chunks: HscpChunk[];
};

function uint32be(bytes: Uint8Array) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false);
}

export function readHscpHeader(file: File): { header: HscpHeader; dataOffset: number } {
  const h = file.open();
  try {
    h.offset = 0;
    const magic = decoder.decode(h.readBytes(8));
    if (magic !== MAGIC) throw new Error('Invalid HSCP package');
    const headerLength = uint32be(h.readBytes(4));
    if (headerLength <= 0 || headerLength > 4 * 1024 * 1024) throw new Error('Invalid HSCP header length');
    const header = JSON.parse(decoder.decode(h.readBytes(headerLength))) as HscpHeader;
    return { header, dataOffset: 12 + headerLength };
  } finally {
    h.close();
  }
}

export async function materializePdfToCache(encryptedUri: string, contentKey: Uint8Array) {
  const input = new File(encryptedUri);
  const { header, dataOffset } = readHscpHeader(input);
  if (header.mediaType !== 'application/pdf') throw new Error('Package does not contain a PDF');

  const output = new File(Paths.cache, `hscp-${header.bookId}-v${header.version}-${Date.now()}.pdf`);
  if (output.exists) output.delete();
  output.create({ intermediates: true });

  const source = input.open();
  const target = output.open();
  try {
    for (const chunk of header.chunks) {
      source.offset = dataOffset + chunk.offset;
      const nonce = source.readBytes(chunk.nonceLength);
      const ciphertext = source.readBytes(chunk.cipherLength);
      const aad = encoder.encode(`${header.bookId}:${header.version}:${chunk.index}`);
      const plain = gcm(contentKey, nonce, aad).decrypt(ciphertext);
      target.writeBytes(plain);
      if (chunk.index % 2 === 1) await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } catch (e) {
    try { output.delete(); } catch {}
    throw e;
  } finally {
    source.close();
    target.close();
  }
  return output;
}

export function secureDeleteCacheFile(file: File | null) {
  if (!file) return;
  try { if (file.exists) file.delete(); } catch {}
}
