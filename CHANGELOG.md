# Changelog

## v2026.03.28-alpha

- Added Postgres container and external `DATABASE_URL` for Paperclip stability.
- Added adapter and gateway health checks that don’t rely on curl/wget.
- Added minimal OpenClaw container config and runtime env wiring.
- Ignored local secrets and memory artifacts in version control.
- Removed obsolete Compose file version header.

