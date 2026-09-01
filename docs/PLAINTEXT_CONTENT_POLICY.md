# Temporary Plaintext & Cache Lifecycle Policy

**Specification**: `docs/PLAINTEXT_CONTENT_POLICY.md`  
**Applies To**: `apps/mobile` (Protected PDF Reader & Offline Storage)  
**Security Level**: High (Sandboxed Device Decryption)

---

## 1. Core Cryptographic Principle

> [!IMPORTANT]
> **Zero Plaintext at Rest**: Decrypted textbook PDFs, original publisher files, and unencrypted book chapters are **NEVER** stored permanently on the student's device filesystem.
> - On-disk persistence is strictly limited to encrypted `.hscp` binary containers (`HSCP0001` with chunked AES-256-GCM).
> - Public Android/iOS storage (e.g. `/sdcard/Download`, external storage) is **NEVER** used.

---

## 2. Decrypted Plaintext Lifecycle

```text
[Encrypted .hscp on Disk]
           │
           │ User opens Reader + License unwrapped
           ▼
[Materialized in Sandboxed App Cache]  <--- `Paths.cache/hscp-*.pdf`
           │
           │ Active reading session (Screenshot deterrence + Watermark)
           ▼
[Reader Exit / App Background / Crash Recovery]
           │
           │ `cleanupProtectedReaderFile(file)`
           ▼
[Cache File Destroyed]
```

---

## 3. Explicit Destruction Triggers

| Event Trigger | Action Executed | Code Location |
| :--- | :--- | :--- |
| **Reader Screen Unmount** | Immediately delete `tempPdfFile` | `ProtectedReaderSession.destroy()` |
| **App Transitions to Background** | `AppState !== 'active'` immediately flushes cache | `useReaderLifecycle.ts` |
| **App Startup Scan** | Clean all orphaned `hscp-*.pdf` files left behind after an unexpected OS kill | `services/startup.service.ts` |
| **User Sign Out / Account Switch** | Immediate wipe of SecureStore encryption keys & decrypted cache | `apps/mobile/lib/supabase.ts` |

---

## 4. Production Hardening Roadmap
While temporary cache materialization with immediate deletion is practical and robust for React Native PDF rendering, future iterations may introduce an in-memory, page-tile native renderer that decrypts individual pages directly into GPU texture memory, leaving zero temporary files on disk.
