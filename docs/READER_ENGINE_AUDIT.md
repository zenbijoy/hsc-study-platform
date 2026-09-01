# Reader PDF Engine Audit

**Component**: Protected PDF Study Reader Engine  
**Current Engine**: `react-native-pdf` (Android PdfiumCore / iOS PDFKit)  
**Security Status**: Ephemeral Sandbox with Auto-Purging  

---

## 1. Engine Capability Matrix

| Question / Capability | Current Status | Security & Technical Mitigation |
| :--- | :--- | :--- |
| **URI Requirement** | Requires `file://` URI path | Materialized inside app-private cache with unique ephemeral token (`session-<random>.tmp`) |
| **Direct Memory Buffers** | Unsupported in React Native JS bridge | Handled via controlled temporary file with deterministic lifecycle |
| **Content URI / Asset Provider** | Supported on Android | Native provider planned for Reader V2 |
| **Stream Range Requests** | No (Full PDF initialized) | HSCP encrypted container stores chunks; unsealed on demand |
| **Internal Engine Cache** | Disabled via `cache: false` | Zero secondary caches created by PdfiumCore |
| **Cache Path Control** | App-private sandbox directory | Strictly isolated from public `Downloads` and `Documents` |
| **Cleanup on Background** | Handled via `AppState` hook | Decrypted file purged instantly on app backgrounding or screen exit |

---

## 2. Plaintext File Lifecycle Guard

```text
[Materialize PDF] ➔ App-Private Temp Sandbox ➔ Render via react-native-pdf
                                                      │
         ┌────────────────────────────────────────────┴─────────────────────────────┐
         ▼                                                                          ▼
[App Background / Inactive]                                              [Reader Screen Unmount]
         │                                                                          │
         ▼                                                                          ▼
[secureDeleteCacheFile()]                                                [secureDeleteCacheFile()]
         │                                                                          │
         ▼                                                                          ▼
[File Deleted & Handle Zeroed]                                           [File Deleted & Handle Zeroed]
```

---

## 3. Recommended Reader V2 In-Memory Tile Roadmap
- Native C++/Kotlin module decoding AES-256-GCM chunks directly into in-memory page bitmaps without ever writing a full `.pdf` container to disk.
- Hardware surface rendering with direct Skia/OpenGL texture composition and per-page watermark baking.
