# Operations & Growth

## Daily content workflow

1. Drop files into Admin Studio or Drive Inbox.
2. Worker calculates source hash and checks duplicate import.
3. Fast pass: file metadata, PDF outline, title, page count, first-page cover candidate.
4. Structure pass: chapter candidates and canonical syllabus mapping.
5. Content pass: formulas/CQ/MCQ/text extraction.
6. Validation: schema, duplicate fingerprints, required fields and confidence.
7. Build draft content packs and encrypted package.
8. Review only uncertain/failed items.
9. Publish atomically.
10. Client receives a tiny catalog delta on next sync.

## Million-item import strategy

- JSONL streaming, never one huge JSON array.
- Process 5k–20k items per logical batch.
- Dedupe with deterministic normalized fingerprint before any AI call.
- Rule/regex/classifier first, AI only for uncertain cases.
- Each item stores confidence and provenance.
- Heavy bodies live in versioned object packs; Supabase stores pack metadata and user interaction state.

## Progressive PDF processing

A digital 700-page PDF with outline/bookmarks can get a chapter map quickly. OCR-heavy scans are slower. Present states such as:

`UPLOADED → QUICK_SCAN → STRUCTURE_READY → DEEP_EXTRACT → PACKING → REVIEW → PUBLISHED`

This gives users/admins fast feedback without pretending OCR is instantaneous.
