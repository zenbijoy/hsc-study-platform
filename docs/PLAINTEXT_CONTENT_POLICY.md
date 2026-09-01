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
[Materialized in Sandboxed App Cache]  <--- `FileSystem.cacheDirectory/decrypted-*.pdf`
           │
           │ Active reading session
           ▼
[Reader Exit / App Background / Crash Recovery]
           │
           │ `secureDeleteCacheFile()`
           ▼
[Cache File Destroyed]
```

---

## 3. Explicit Destruction Triggers

| Event Trigger | Action Executed | Code Location |
| :--- | :--- | :--- |
| **Reader Screen Unmount** | Immediately delete `cachePdfUri` | `apps/mobile/app/reader/[id].tsx` (cleanup function) |
| **App Transitions to Background** | `AppState !== 'active'` immediately invokes `secureDeleteCacheFile` | `apps/mobile/app/reader/[id].tsx` (`AppState.addEventListener`) |
| **App Startup Scan** | Clean all orphaned `decrypted-*.pdf` files from `cacheDirectory` left behind after an unexpected OS termination | `apps/mobile/src/services/startup.service.ts` |
| **Manual User Purge** | 1-tap "Purge Decrypted Cache" button | `apps/mobile/app/(tabs)/profile.tsx` |

---

## 4. Production Hardening Roadmap
While temporary cache materialization with immediate deletion is practical and robust for React Native PDF rendering, the production hardening milestone will introduce an in-memory, page-tile native renderer that decrypts individual pages directly into GPU texture memory, leaving zero temporary files on disk.
