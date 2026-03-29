# Dependency Overview

This integration has three dependency layers: runtime platform, containers, and adapter service packages.

## 1) Runtime platform

- **Node.js >= 18**
  - Required to build/run the adapter and health checks.
- **Docker Engine + Compose**
  - Used for deployment of Paperclip, OpenClaw, and Postgres.

## 2) Container images

- `paperclipai/paperclip:latest`
  - Paperclip controller runtime.
- `postgres:16-alpine`
  - External Postgres for Paperclip stability.
- `openclaw/local:latest`
  - Built from `vendor/openclaw` with `OPENCLAW_VARIANT=slim`.

## 3) Adapter service packages

From `services/paperclip-openclaw-adapter/package.json` (grouped by usage):

### Runtime / operations
- `axios` – HTTP client
- `express` – HTTP server framework
- `zod` – schema validation

### Build
- `typescript` – TypeScript compiler
- `esbuild` – fast TS/JS build pipeline

### Testing
- `vitest` – test runner
- `supertest` – HTTP testing helper
- `@types/supertest` – typings for tests

### Debugging / development ergonomics
- `ts-node` – run TS locally
- `eslint`, `prettier`, `@typescript-eslint/*` – linting + formatting
- `@types/node`, `@types/express` – typings

## Source of truth

- `DEPENDENCIES.md` (human‑readable)
- `DEPENDENCIES.json` (machine‑readable + category map)
