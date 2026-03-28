# Paperclip ↔ OpenClaw Deployment

This folder contains the Compose templates and runtime helpers for running the Paperclip controller, the OpenClaw gateway, and the new TypeScript adapter.

## Key files
- `paperclip-claw-compose.yml`: Option 1 – host-based OpenClaw plus Compose-run Paperclip + adapter
- `paperclip-openclaw-compose.yml`: Option 2 – Dockerized OpenClaw + Paperclip + adapter in a single Compose stack
- `paperclip-adapter.env`: template for the adapter’s required environment variables
- `paperclip-config/`: Paperclip controller configuration (allowed skills, OpenClaw endpoint)
- `paperclip-controller.env`: Paperclip controller runtime overrides

## Deployment options

### Option 1 – host-native OpenClaw
1. Run the OpenClaw gateway directly on the host (e.g., via sandbox or manual service) on port `18789` and export `OPENCLAW_GATEWAY_TOKEN`.
2. Populate `paperclip-adapter.env` with your gateway URL/token and the Paperclip callback URL.
3. From `deploy/`, start Compose: `docker compose -f paperclip-claw-compose.yml up -d`.
4. Paperclip will mount `paperclip-config/` and `trusted-skills.json` volumes for config & compliance; the adapter reads `paperclip-adapter.env` plus the runtime overrides above.

### Option 2 – self-contained Docker Compose
1. Ensure you have `OPENCLAW_GATEWAY_TOKEN` and `GITHUB_TOKEN` available (exported or defined in a `.env` file used by the Compose invocation).
2. Fill `paperclip-adapter.env` with the same gateway/callback values as above.
3. Run `docker compose -f paperclip-openclaw-compose.yml up --build -d` to bring up OpenClaw, Paperclip, and the adapter together.
4. `paperclip-openclaw-compose.yml` exposes `OPENCLAW_GATEWAY_URL` and `PAPERCLIP_CALLBACK_URL` so the adapter talks to the gateway and sends callbacks back to the Paperclip container.

## Environment notes
- The adapter honors the `TRUSTED_ACTIONS` list from `paperclip-adapter.env`; you can extend it when the list of read-only/mutating actions grows.
- Keep the `.env` file outside the repo if you store tokens there; the Compose files expect you to set `OPENCLAW_GATEWAY_TOKEN` and `GITHUB_TOKEN` in your shell or `.env`.
- Logs and audits are available under `../compliance` (mounted read-only into the adapter container) so you can tail them from the host.

## Troubleshooting
- If the adapter reports a schema error, verify the JSON you send matches the `handler` schemas in `services/paperclip-openclaw-adapter/src/handler.ts`.
- Update `paperclip-config/paperclip.yaml` when you add trusted skills or adjust OpenClaw endpoints; restart the controller so it re-reads the file.