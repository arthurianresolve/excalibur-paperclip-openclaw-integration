# Host‑Native OpenClaw

Use this when you already run OpenClaw on the host and only want Compose for Paperclip + Adapter.

## Files

- `deploy/compose/paperclip-claw-compose.yml`
- `deploy/adapter/paperclip-adapter.env`
- `deploy/paperclip/paperclip.yaml`

## Steps

1. Ensure OpenClaw is running on the host at `http://127.0.0.1:18789`.
2. Set `OPENCLAW_GATEWAY_TOKEN` in your shell or `deploy/.env`.
3. Start Compose:

```bash
cd deploy
docker compose -f compose/paperclip-claw-compose.yml up -d
```
