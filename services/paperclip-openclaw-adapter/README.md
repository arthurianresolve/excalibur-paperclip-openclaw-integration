# Paperclip ↔ OpenClaw Adapter Service

A lightweight TypeScript/Node HTTP bridge that validates and audits trusted Paperclip actions before they reach the OpenClaw gateway.

## Highlights
- Fast schema/policy enforcement with `zod` + explicit trusted action allowlists
- Audit-friendly handler surface (read-only vs mutating) with redacted upstream logging
- Health/readiness endpoints plus health helpers for Compose/k8s probes
- License gate (`scripts/verify-license.js`) ensures only permissive dependencies are shipped

## Local development
1. Install dependencies and verify licensing:
   ```bash
   npm install
   npm run lint
   ```
2. Build the runtime [`npm run build`] and then launch for smoke testing:
   ```bash
   OPENCLAW_GATEWAY_URL=https://127.0.0.1:18789 \
     OPENCLAW_AUTH_TOKEN=your-token \
     PAPERCLIP_CALLBACK_URL=http://localhost:3100 \
     node dist/index.js
   ```
3. Use `npm run dev` to run the TypeScript source with `ts-node` during rapid iteration.

## Runtime contract
Environment variables the adapter expects:

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | HTTP port (default: `3000`) | `3210` |
| `OPENCLAW_GATEWAY_URL` | Base URL for the OpenClaw gateway | `http://openclaw:18789` |
| `OPENCLAW_ACTION_PATH` | Path suffix for adapter actions | `/gateway/actions` |
| `OPENCLAW_AUTH_TOKEN` | Gateway token for bearer auth | `secret-token` |
| `PAPERCLIP_CALLBACK_URL` | Paperclip callback base URL | `http://paperclip-controller:3100` |
| `TRUSTED_ACTIONS` | Comma list of allowed action names (order independent) | `queryAuditLogs,runTrustedSkill` |

The configuration loader (`src/config.ts`) normalizes these and defaults `OPENCLAW_ACTION_PATH` + `TRUSTED_ACTIONS` if they are missing.

## Docker build
The provided `Dockerfile` performs a multi-stage build. During development you can rebuild and start the container with:

```bash
cd services/paperclip-openclaw-adapter
docker build -t paperclip-openclaw-adapter ./
docker run --rm -e OPENCLAW_GATEWAY_URL=... ... -p 3210:3210 paperclip-openclaw-adapter
```

## Testing & linting
- `npm run lint` runs ESLint + `scripts/verify-license.js`
- `npm run build` compiles the TypeScript entrypoints to `dist/`
- `npm run test` is a placeholder for future Vitest coverage

## Philosophy
Start simple and split later: the current code keeps transport, handler, and clients in a few files so reviewers can reason about validation, schema, and audits without navigating dozen modules. When the action surface grows, break the handler into dedicated files but keep the same typed contracts.
