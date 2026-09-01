# Content Factory Dependencies & Hardware Requirements

## 1. Runtime Dependencies

### Python Worker (`services/worker/pyproject.toml`)
- `fastapi` >= 0.115.0
- `uvicorn[standard]` >= 0.32.0
- `pydantic` >= 2.9.0
- `pydantic-settings` >= 2.6.0
- `pymupdf` (`fitz`) >= 1.24.10 (High-performance PDF outline, text, image, and page pixmap extraction)
- `cryptography` >= 43.0.0 (AES-256-GCM chunked stream encryption)
- `google-api-python-client` >= 2.150.0 (Google Drive v3 pagination and upload)
- `google-auth` >= 2.35.0
- `supabase` >= 2.9.0

### Optional OCR Dependencies (for Scanned Books)
- `pytesseract` >= 0.3.10 with Tesseract 5.x (`tesseract-ocr-ben` and `tesseract-ocr-eng` trained data)
- Or Google Cloud Vision API for deep Bengali OCR fallback

---

## 2. Hardware Sizing & Concurrency Sizing

| Metric | Minimum Dev Machine | Production Worker Host |
| :--- | :--- | :--- |
| **CPU** | 4 Cores | 8–16 Cores |
| **RAM** | 8 GB | 16–32 GB |
| **Disk Space** | 20 GB SSD | 100+ GB NVMe |
| **Worker Concurrency** | 4 parallel jobs | 8–16 parallel jobs |
| **HSCP Encryption Speed** | ~120 MB/s | ~450 MB/s (AES-NI accelerated) |
| **Memory Per Worker** | ~150 MB (Constant chunked stream) | ~150 MB |
