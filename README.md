# Excalibur Paperclip ↔ OpenClaw Integration

This repository contains the Paperclip ↔ OpenClaw integration stack: a policy‑enforced adapter service, deployment assets for Paperclip and OpenClaw, and documentation for running the system safely.

## What’s inside

- **Adapter service** (`services/paperclip-openclaw-adapter/`): enforces schema, policy, and audit rules between Paperclip and OpenClaw.
- **Deployment assets** (`deploy/`): Compose stacks, config, and environment templates.
- **Docs** (`docs/`): architecture, modules, dependencies, deployment guides, and integration flows.

## Quickstart (full Docker stack)

```bash
cd deploy
cp .env.example .env   # or export OPENCLAW_GATEWAY_TOKEN/GITHUB_TOKEN in your shell
cp adapter/paperclip-adapter.env.example adapter/paperclip-adapter.env

# Start the full stack
docker compose -f compose/paperclip-openclaw-compose.yml up --build -d
```

See **docs/index.md** for detailed architecture, deployment, and integration docs.

## Versioning

- Pre‑release tags: `vYYYY.MM.DD-alpha` or `vYYYY.MM.DD-rc.N`
- See **CHANGELOG.md** for release notes.
