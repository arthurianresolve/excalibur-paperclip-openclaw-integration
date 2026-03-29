# Paperclip ↔ OpenClaw Deployment

This folder contains deployment assets for running the Paperclip controller, the OpenClaw gateway, and the Paperclip ↔ OpenClaw adapter.

## Layout
- `compose/`
  - `paperclip-claw-compose.yml`: Option 1 – host-based OpenClaw + Compose-run Paperclip + adapter
  - `paperclip-openclaw-compose.yml`: Option 2 – full Dockerized OpenClaw + Paperclip + adapter stack
- `adapter/`
  - `paperclip-adapter.env`: adapter environment template
- `paperclip/`
  - `paperclip.yaml`: Paperclip controller configuration
  - `paperclip-controller.env`: Paperclip controller runtime overrides
- `openclaw/`
  - `openclaw-container.json`: minimal OpenClaw config used by the containerized stack

## Deployment options

### Option 1 – host-native OpenClaw
1. Run the OpenClaw gateway directly on the host (e.g., via sandbox or manual service) on port `18789` and export `OPENCLAW_GATEWAY_TOKEN`.
2. Copy `deploy/adapter/paperclip-adapter.env.example` to `deploy/adapter/paperclip-adapter.env` and set your gateway URL/token + Paperclip callback URL.
3. From `deploy/`, start Compose: `docker compose -f compose/paperclip-claw-compose.yml up -d`.
4. Paperclip mounts `deploy/paperclip/paperclip.yaml` and `trusted-skills.json` for config & compliance; the adapter reads `deploy/adapter/paperclip-adapter.env` plus the runtime overrides above.

### Option 2 – self-contained Docker Compose
1. Ensure you have `OPENCLAW_GATEWAY_TOKEN` and `GITHUB_TOKEN` available (exported or defined in `deploy/.env` using `deploy/.env.example`).
2. Fill `deploy/adapter/paperclip-adapter.env` with the same gateway/callback values as above.
3. Run `docker compose -f compose/paperclip-openclaw-compose.yml up --build -d` to bring up OpenClaw, Paperclip, and the adapter together.
4. `compose/paperclip-openclaw-compose.yml` exposes `OPENCLAW_GATEWAY_URL` and `PAPERCLIP_CALLBACK_URL` so the adapter talks to the gateway and sends callbacks back to the Paperclip container.

## Environment notes
- The adapter honors the `TRUSTED_ACTIONS` list from `deploy/adapter/paperclip-adapter.env`; you can extend it when the list of read-only/mutating actions grows.
- Keep the `.env` file outside the repo if you store tokens there; the Compose files expect you to set `OPENCLAW_GATEWAY_TOKEN` and `GITHUB_TOKEN` in your shell or `.env`.
- Logs and audits are available under `../compliance` (mounted read-only into the adapter container) so you can tail them from the host.

## Troubleshooting
- If the adapter reports a schema error, verify the JSON you send matches the `handler` schemas in `services/paperclip-openclaw-adapter/src/handler.ts`.
- Update `deploy/paperclip/paperclip.yaml` when you add trusted skills or adjust OpenClaw endpoints; restart the controller so it re-reads the file.
