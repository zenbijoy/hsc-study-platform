# Bulk PDF Ingestion & Manifest Specification

## 1. Local Folder Hierarchy Ingestion

When dropping folders into the Content Factory, directory names are parsed for structural hints:

```text
D:/HSC Textbooks/
├── import-manifest.json        <-- Optional batch configuration
├── Physics/
│   ├── Paper 1/
│   │   ├── Ishaque_Physics_1st.pdf
│   │   └── Pramanik_Physics_1st.pdf
│   └── Paper 2/
│       └── Topon_Physics_2nd.pdf
└── Higher Math/
    └── Ketab_Uddin_Math_1st.pdf
```

The alias engine normalizes both Bengali and English naming:
- `Physics` / `পদার্থবিজ্ঞান` / `Phy` -> `subject = "physics"`
- `Paper 1` / `১ম পত্র` / `First Paper` -> `paper = 1`
- `Paper 2` / `২য় পত্র` / `Second Paper` -> `paper = 2`

---

## 2. Ingestion Manifest Schema (`import-manifest.json`)

```json
{
  "schemaVersion": 2,
  "groupName": "NCTB 2026 Curriculum Collection",
  "defaults": {
    "subject": "physics",
    "paper": 1,
    "rightsStatus": "LICENSED",
    "distributionAllowed": true,
    "offlineDownloadAllowed": true,
    "processingProfile": "STANDARD"
  },
  "files": [
    {
      "path": "Physics/Paper 1/Ishaque_Physics_1st.pdf",
      "title": "HSC Physics 1st Paper (Dr. Shahjahan Tapan)",
      "publisher": "Hasan Book House",
      "edition": "2026 Edition"
    },
    {
      "path": "Physics/Paper 2/Topon_Physics_2nd.pdf",
      "paper": 2,
      "customCoverPage": 2
    }
  ]
}
```
