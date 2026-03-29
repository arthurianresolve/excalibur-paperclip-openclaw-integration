# Dependencies

## Runtime platform
- Node.js >= 18 (adapter runtime)
- Docker Engine / Docker Compose

## Container images
- `paperclipai/paperclip:latest`
- `postgres:16-alpine`
- `openclaw/local:latest` (built from `vendor/openclaw` with `OPENCLAW_VARIANT=slim`)

## Adapter service (services/paperclip-openclaw-adapter)
### Production dependencies
- axios ^1.7.2
- express ^4.19.2
- zod ^3.23.1

### Development dependencies
- @types/express ^4.17.15
- @types/node ^22.4.2
- @types/supertest ^2.0.12
- @typescript-eslint/eslint-plugin ^6.21.0
- @typescript-eslint/parser ^6.21.0
- esbuild ^0.27.4
- eslint ^8.57.1
- eslint-config-prettier ^9.0.0
- eslint-plugin-prettier ^5.1.5
- prettier ^3.5.0
- supertest ^7.2.2
- ts-node ^10.9.1
- typescript ^5.4.0
- vitest ^4.1.2

## Notes
- Dependency list derived from `services/paperclip-openclaw-adapter/package.json`.
