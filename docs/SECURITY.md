# Security Model

## Threat model

The system protects against casual copying, leaked links, direct Drive browsing, normal file-manager access, sharing the encrypted file to another device, accidental screenshots/screen recording and unauthorized users.

It does **not** claim to defeat a determined attacker with root/jailbreak, runtime instrumentation, custom OS builds, memory scraping, patched APKs or an external camera.

## Protected book lifecycle

1. Original PDF stays private in the operator's Drive.
2. Worker generates random 32-byte content key.
3. PDF is encrypted into HSCP chunks with AES-256-GCM; each chunk has unique 12-byte nonce and authenticated additional data.
4. Content key is encrypted at rest with `CONTENT_MASTER_KEY_B64` and stored only as wrapped ciphertext.
5. Mobile generates X25519 device keypair. Private key is saved in SecureStore/Keychain/Keystore; public key is registered in Supabase.
6. `book-license` verifies user, device, entitlement and book state, decrypts the content key server-side, derives an ephemeral X25519 shared secret, HKDFs a wrapping key and returns the content key wrapped for that device.
7. App unwraps key and stores it in SecureStore until license expiry.
8. Encrypted HSCP can be copied, but another device lacks the unwrapping private key and entitlement.
9. Reader blocks screen capture while active and overlays a moving session watermark.
10. Starter renderer materializes the decrypted PDF only in app cache, deletes it on exit, and exposes no share/export action. For stronger production DRM, implement page/chapter-level native decryption so plaintext never becomes a filesystem PDF.

## Required production hardening

- Enable Play Integrity / App Attest checks before issuing premium/protected licenses.
- Rate-limit license and catalog endpoints.
- Add root/jailbreak/debug/instrumentation risk signals; do not rely on them alone.
- Use short license TTLs with offline grace windows.
- Rotate content master key using key-version metadata; never overwrite without migration.
- Keep admin/worker service credentials in secret stores, never `.env` committed to git.
- Lock Google OAuth scopes to Drive files owned/managed by this application when possible.
- Originals must never be shared publicly. Only encrypted HSCP artifacts may be public/direct-download if desired.
- Keep audit logs for imports, publication, key rotation and entitlement changes.
