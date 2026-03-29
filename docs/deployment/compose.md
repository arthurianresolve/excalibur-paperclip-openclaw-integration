# Full Stack (Compose)

Runs OpenClaw, Paperclip, Adapter, and Postgres in a single Compose stack.

## Files

- `deploy/compose/paperclip-openclaw-compose.yml`
- `deploy/.env` (not committed; use `deploy/.env.example`)
- `deploy/adapter/paperclip-adapter.env`
- `deploy/paperclip/paperclip.yaml`

## Steps

```bash
cd deploy
cp .env.example .env
cp adapter/paperclip-adapter.env.example adapter/paperclip-adapter.env

# Start stack
docker compose -f compose/paperclip-openclaw-compose.yml up --build -d
```

## Health checks

```bash
docker ps
# adapter health
curl http://127.0.0.1:3210/health
```
