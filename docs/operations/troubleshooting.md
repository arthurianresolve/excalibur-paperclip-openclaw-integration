# Troubleshooting

## Adapter fails healthcheck

- Confirm `TRUSTED_ACTIONS` and `OPENCLAW_AUTH_TOKEN` are set.
- Check logs: `docker logs deploy-paperclip-adapter-1`.

## Paperclip fails to start

- Ensure `BETTER_AUTH_SECRET` is set.
- Verify Postgres is running (full stack) and `DATABASE_URL` matches.

## OpenClaw container not healthy

- Check `OPENCLAW_GATEWAY_TOKEN` is set.
- Verify config path in `deploy/openclaw/openclaw-container.json`.

## Compose path issues

- Run from `deploy/` so relative paths resolve.
