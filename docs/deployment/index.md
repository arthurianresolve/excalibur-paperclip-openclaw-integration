# Deployment Guide

Choose a deployment model:

- **Full stack (Dockerized OpenClaw + Paperclip + Adapter)**
  - `deploy/compose/paperclip-openclaw-compose.yml`
- **Host‑native OpenClaw (Compose for Paperclip + Adapter)**
  - `deploy/compose/paperclip-claw-compose.yml`

## Common prerequisites

- Docker Engine + Compose
- `OPENCLAW_GATEWAY_TOKEN` available (env or `deploy/.env`)
- Paperclip auth secret (`BETTER_AUTH_SECRET`) for controller startup

## Next steps

- Full stack: `deployment/compose.md`
- Host‑native OpenClaw: `deployment/host-openclaw.md`
- Component‑by‑component: `deployment/components.md`
