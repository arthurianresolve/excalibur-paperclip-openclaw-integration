# Component‑by‑Component Deployment

This section clarifies what is needed to deploy each component.

## OpenClaw Gateway

- **Containerized**: use `deploy/compose/paperclip-openclaw-compose.yml`
- **Host‑native**: run OpenClaw separately and provide `OPENCLAW_GATEWAY_TOKEN`
- **Config**: `deploy/openclaw/openclaw-container.json` (container only)

## Paperclip Controller

- Image: `paperclipai/paperclip:latest`
- Config: `deploy/paperclip/paperclip.yaml`
- Auth secret: `BETTER_AUTH_SECRET` (env)
- External DB: `postgres:16-alpine` (full stack only)

## Adapter Service

- Source: `services/paperclip-openclaw-adapter/`
- Image built by Compose
- Env: `deploy/adapter/paperclip-adapter.env`
- Health: `GET /health` on port 3210
