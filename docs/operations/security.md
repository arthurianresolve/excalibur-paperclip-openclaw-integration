# Security Notes

- Keep `OPENCLAW_GATEWAY_TOKEN` and `BETTER_AUTH_SECRET` out of the repo.
- Limit `TRUSTED_ACTIONS` to the minimum required.
- Treat `deploy/openclaw/openclaw-container.json` as trusted configuration.
- Audit logs are mounted read‑only in the adapter container.
