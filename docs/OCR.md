# OCR strategy for scanned books

The quick scan first checks whether the PDF already contains text. If `text_ratio` is low, mark the job as OCR-recommended rather than blocking the whole import.

Recommended zero-cost progression:

1. **Digital PDF:** PyMuPDF text extraction only.
2. **Scanned PDF:** local Tesseract + Bengali language data on your own PC.
3. **Difficult layouts:** optional local vision model or paid OCR only for low-confidence pages.

Do not OCR all 700 pages just to locate chapters. Inspect front matter/TOC first, detect likely chapter pages, publish structure early, and deep-OCR in the background.
