# Production Deployment Checklist

## 1. Supabase

1. Create a project.
2. Apply `0001_init.sql`, then `0002_seed_demo.sql`.
3. Never put the service-role key in the mobile app or browser bundle.
4. Configure the `book-license` Edge Function secrets: Supabase URL/service role plus the same content master key used by the worker.
5. Deploy the Edge Function and test with a real signed-in device.

## 2. Content Factory worker

The worker is a trusted publisher and should not be exposed as an anonymous public upload service.

- Run it on a private machine/VPS, through VPN/Cloudflare Access, or behind an authenticated reverse proxy.
- Keep Drive OAuth refresh tokens, Supabase service role and the content master key only on the worker/server.
- Persist `/data` when using Docker so jobs and local fallback catalog survive restarts.
- Start with `WORKER_CONCURRENCY=1` or `2` for large OCR/PDF workloads.

## 3. Google Drive origin

Use Drive as the canonical/original warehouse. Originals stay private. For direct app download, expose only encrypted `.hscp` packages if your threat model allows it. If download traffic becomes large, mirror hot encrypted packages to R2 and keep Drive as origin/archive.

## 4. Admin Studio

Admin Studio is an operator surface, not a public uploader. Restrict it to staff. In production, put it behind your identity provider/zero-trust access and keep the worker unreachable from the general internet whenever possible.

## 5. Mobile

1. Set Expo public Supabase URL/publishable key only.
2. Create a development build for testing native PDF/screen-capture behavior.
3. Build release with EAS after replacing `com.example.hscstudy` with your real Android/iOS identifiers.
4. Test app backgrounding, cache cleanup, screenshot blocking, device revoke, expired licenses and offline packages on physical devices.

## 6. Release gates

Before publishing a content version:

- rights/permission recorded;
- source hash stable and backup present;
- chapter map reviewed;
- low-confidence formulas/questions reviewed;
- answer keys spot-checked by a qualified reviewer;
- HSCP hash verified after upload;
- rollback version retained;
- no secret present in client bundle.
