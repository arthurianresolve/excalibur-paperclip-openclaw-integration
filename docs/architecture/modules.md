# Modular Overview

The integration is organized into clear modules so each component can be deployed or replaced independently.

## Adapter service modules

Location: `services/paperclip-openclaw-adapter/`

- **Routes + transport**
  - `src/routes.js`, `src/server.js`: HTTP server + routing
- **Policy enforcement**
  - `src/policy.js`, `src/handler.ts`: rules + schema validation
- **Audit + compliance**
  - `src/audit.js`, `src/lib/redact.*`: logging + redaction
- **OpenClaw client**
  - `src/openclaw-client.js`: Gateway API calls
- **Paperclip client**
  - `src/paperclip-client.js`: callback responses

## Deployment modules

Location: `deploy/`

- **Compose stacks** (`deploy/compose/`)
  - `deploy/compose/paperclip-openclaw-compose.yml`: full stack
  - `deploy/compose/paperclip-claw-compose.yml`: host‑native OpenClaw
- **Paperclip config** (`deploy/paperclip/`)
  - `deploy/paperclip/paperclip.yaml`: trusted skills + controller config
- **Adapter config** (`deploy/adapter/`)
  - `deploy/adapter/paperclip-adapter.env`: adapter environment
- **OpenClaw container config** (`deploy/openclaw/`)
  - `deploy/openclaw/openclaw-container.json`: minimal container config

## Documentation modules

Location: `docs/`

- `architecture/` – system and module view
- `integration/` – request/response flows
- `deployment/` – step‑by‑step deployment guidance
