# Protected Reader Security & Cryptographic Lifecycle

## 1. Security Model Overview

The HSC Study Platform separates **storage protection** from **render protection** to guarantee high-performance PDF rendering on mobile while maintaining strict content confidentiality.

---

## 2. Production Security Implementation

1. **Storage Protection**:
   - Downloaded packages (`.hscp`) are stored strictly within app-private directory (`Paths.documentDirectory`).
   - Packages are chunked (4MB max) and encrypted with AES-256-GCM using authenticated additional data (AAD) tied to `bookId` and `version`.

2. **Device-Bound Key Exchange**:
   - The device generates an X25519 key pair stored in hardware-backed keystore (`expo-secure-store` with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`).
   - The server delivers a wrapped content key via HKDF-SHA256 and ephemeral X25519 key exchange (`book-license` Supabase Edge Function).

3. **Transient Memory Sandbox**:
   - The decrypted PDF file is materialized with a randomized non-guessable filename strictly inside `Paths.cache`.
   - The transient cache is inaccessible to external Android gallery/file apps and other third-party applications.

4. **Lifecycle Auto-Purge**:
   - `SecurePdfViewerScreen` and `ProtectedReaderSession` register hooks on `AppState` changes.
   - When the user minimizes the app, locks the device, navigates back, or logs out, the temporary decrypted cache is deleted immediately.

5. **Screen Recording & Screenshot Deterrence**:
   - `expo-screen-capture` activates `preventScreenCaptureAsync` on component mount and releases on unmount.
   - Native OS displays a black screen or blocks screenshots during reader runtime.

6. **Dynamic Non-PII Watermarking**:
   - A dynamic floating badge `HSC STUDY • S:<HEX>` cycles across quadrants based on `pageNumber % 4`.
   - It deliberately displays only a non-sensitive session hash—never user passwords, email addresses, phone numbers, JWTs, or full internal database IDs.

---

## 3. Future Roadmap (Page-by-Page Tile Renderer)

For ultra-high-value proprietary content, the renderer can transition to an in-memory page/tile renderer without modifying the underlying HSCP container or license protocol:
- Decrypt only 4MB chunks containing requested page indices.
- Render into an in-memory Skia surface and deallocate immediately.
- Zero plaintext buffers from RAM after bitmap paint.
