# HSCP (HSC Content Protection) Implementation Status

**Specification**: `schemas/hscp-format.md`  
**Worker Packager**: `services/worker/app/hscp.py`  
**Mobile Client Decryptor**: `apps/mobile/lib/hscp.ts`  
**License Handshake**: `supabase/functions/book-license/index.ts`  
**Device Key Management**: `apps/mobile/lib/deviceKeys.ts`  

---

## 1. Cryptographic Feature Matrix

| Feature / Subsystem | Implementation Location | Status | Details |
| :--- | :--- | :--- | :--- |
| **HSCP Magic Header & Container** | `services/worker/app/hscp.py`, `apps/mobile/lib/hscp.ts` | **COMPLETE** | Magic `HSCP0001` (8 bytes), uint32 big-endian header length, UTF-8 JSON header metadata. |
| **Chunked AES-256-GCM Encryption** | `services/worker/app/hscp.py` | **COMPLETE** | Chunks of 4 MB (`4194304` bytes) encrypted with 12-byte random nonces and 16-byte GCM auth tags. AAD is `${bookId}:${version}:${chunkIndex}`. |
| **SHA-256 Package & Chunk Checksums** | `services/worker/app/hscp.py`, `apps/mobile/lib/hscp.ts` | **COMPLETE** | Full file SHA-256 computed and stored in `book_versions.package_sha256` and header chunk table. |
| **Server Master Key Wrapping** | `services/worker/app/hscp.py`, `supabase/functions/book-license` | **COMPLETE** | Content key is wrapped using `CONTENT_MASTER_KEY_B64` with AES-256-GCM and stored in `book_secrets`. |
| **Device X25519 Keypair Generation** | `apps/mobile/lib/deviceKeys.ts` | **COMPLETE** | On-device key generation using `@noble/curves/ed25519` (X25519). Private key is stored securely in `expo-secure-store`. |
| **Ephemeral X25519 Key Exchange** | `supabase/functions/book-license/index.ts` | **COMPLETE** | Edge Function generates ephemeral X25519 keypair, derives HKDF-SHA256 shared secret with registered device public key, and wraps content key. |
| **On-Device License Decryption** | `apps/mobile/lib/license.ts` | **COMPLETE** | Client unwraps server response using local X25519 private key + HKDF + AES-GCM to obtain usable content key. |
| **Decrypted Cache Materialization** | `apps/mobile/lib/hscp.ts` | **COMPLETE** | Chunks decrypted in app sandbox cache (`FileSystem.cacheDirectory`) for native `react-native-pdf` viewer. |
| **Temporary Cache Auto-Purging** | `apps/mobile/src/features/reader/security/plaintextLifecycle.ts`, `apps/mobile/src/features/reader/hooks/useSecureReader.ts` | **COMPLETE** | Decrypted PDF cache file is securely deleted on reader unmount and when app transitions to background (`AppState !== 'active'`). |
| **Native In-Memory Page/Tile Renderer** | N/A | **NOT IMPLEMENTED** (Production Extension Point) | Current flow securely materializes temporary decrypted PDF on disk in app sandbox. Future version can render page tiles in memory. |

---

## 2. Threat Model & DRM Reality Boundary

> [!NOTE]
> **Defense in Depth**:
> 1. Raw PDF originals are never made public in Google Drive or Supabase.
> 2. Students download only encrypted `.hscp` files.
> 3. An offline `.hscp` package cannot be opened in standard PDF readers (Adobe, Chrome, Foxit).
> 4. To decrypt, an authenticated user must request a device-bound license key via Supabase Edge Function with a registered device public key.
> 5. Screen capture and recording are blocked at the OS level on protected reader routes.
> 6. Dynamic floating session watermarks discourage external camera capture.
