# Large PDF Processing & Resilience Guide (300 MB – 2 GB)

**Specification**: `docs/LARGE_PDF_PROCESSING.md`  
**Applies To**: `services/worker`, `apps/admin`  

---

## 1. Large File Memory Management

1. **Stream Operations Only**:
   - The worker never reads full 300 MB+ files into a single Python `bytes` object.
   - Resumable upload chunks are appended directly to disk in `8 MB` segments.
   - HSCP encryption streams `4 MB` chunks from the input file, generating AES-256-GCM ciphertext directly into temporary file storage.
2. **PyMuPDF Page Iterator**:
   - PyMuPDF opens PDF page trees lazily (`doc.load_page(page_idx)`), freeing page resources immediately after text/image extraction.
3. **Scanned PDF & OCR Handling**:
   - PDFs with `< 20%` text ratio are flagged as `is_scanned = True` and `ocr_recommended = True`.
   - OCR runs in batches of 10–25 pages with intermediate checkpointing to prevent memory bloat and allow crash recovery.
