# Google Drive 5 TB Integration

Drive is used as an **origin/warehouse**, not as Postgres and not as your forever high-traffic CDN.

## Folder model

```text
HSC_CONTENT_FACTORY/
  00_INBOX/
  10_ORIGINALS/
  20_SECURE_BOOKS/
  30_CONTENT_PACKS/
  40_ASSETS/
  90_BACKUPS/
```

The worker can also work with a single configured folder ID and identify files using `appProperties`; you do not have to manually create every subfolder.

## Personal Google account / Google One storage

For a personal 5 TB Drive, use OAuth 2.0 with a refresh token. The worker supports:

```env
STORAGE_PROVIDER=drive
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
```

Never put these values in the mobile app or Admin browser bundle.

## Getting a refresh token

1. Create a Google Cloud project and enable Google Drive API.
2. Configure OAuth consent screen.
3. Create an OAuth Desktop client.
4. Put `client_secret.json` on your own machine.
5. Run `python scripts/google_oauth_bootstrap.py --client-secret client_secret.json` from `services/worker`.
6. Sign in to the account owning the 5 TB Drive.
7. Copy the printed refresh token into the worker's local `.env`.

The bootstrap helper requests the minimal practical Drive scope needed by the configured mode. If you want the worker to manage only files it creates, prefer `drive.file` where your workflow allows it.

## Delivery

The recommended production flow is:

- **Original PDF:** always private.
- **HSCP encrypted package:** can be served through a controlled endpoint, or optionally made link-readable because ciphertext is not useful without a device license.
- **Popular packages:** mirror to Cloudflare R2 later for faster delivery and egress economics.

The mobile client stores a `delivery_url` supplied by the catalog/license response; it does not know or need Drive credentials.
