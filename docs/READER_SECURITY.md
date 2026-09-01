# Protected Reader Design

The starter deliberately separates **storage protection** from **render protection**.

## Shipping implementation

1. Download encrypted `.hscp` into app-private storage.
2. Obtain a short-lived device-bound wrapped content key from `book-license`.
3. Unwrap the key with the device X25519 private key held in SecureStore/OS keystore-backed storage.
4. Decrypt authenticated chunks with AES-256-GCM.
5. Materialize a temporary PDF only inside the app cache for `react-native-pdf`.
6. Block screen capture on the protected reader and overlay a moving session watermark.
7. Delete the temporary decrypted PDF on reader exit and when the app backgrounds.

This is strong against casual copying but not unbreakable DRM: a compromised/rooted device controls the execution environment.

## Stronger phase-2 renderer

For higher-value content, replace the temporary full-PDF materialization with a native page/tile renderer:

- decrypt only chunks required by the requested page;
- render into an in-memory bitmap/surface;
- zero/deallocate plaintext buffers immediately;
- cache only encrypted data;
- prefetch adjacent page tiles;
- keep per-page watermark data in the render pipeline.

The HSCP format and license protocol do not need to change when the renderer is upgraded.
