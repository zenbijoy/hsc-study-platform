# Reader Compatibility Matrix

| Specification / Platform | Supported Target | Notes / Constraints |
| :--- | :--- | :--- |
| **HSCP Format Version** | `hscp-v1` (AES-256-GCM + X25519) | Validates magic header `HSCP01` |
| **Minimum App Version** | `0.1.0` | Enforces minimum compatibility before package unsealing |
| **PDF Engine** | `react-native-pdf` | Android PdfiumCore & iOS PDFKit |
| **Android Version Target** | Android 8.0 (API 26) through Android 15 (API 35) | Full `expo-screen-capture` FLAG_SECURE support |
| **iOS Version Target** | iOS 14.0 through iOS 18 | `isCaptured` prevention and watermark overlay |
| **Scanned Books Performance** | Supported up to 500 MB | Fast page flipping via cached viewports |
| **Original Mode** | 100% Faithful Render | Default clean textbook layout |
| **Sepia Mode** | Soft Amber Tone | Reduced blue light for extended nighttime study |
| **Dark & Midnight Modes** | AMOLED Black `#05090D` / Deep Navy `#081018` | Darkened reader chrome and high-contrast night study |
| **DRM Realism & Limitations** | Defense-in-depth | Physical external cameras cannot be blocked by software |
