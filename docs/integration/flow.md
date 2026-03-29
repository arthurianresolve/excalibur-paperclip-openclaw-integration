# Request / Response Flow

## Sequence

1. **Paperclip → Adapter**
   - HTTP request containing an action + payload.
2. **Adapter: validate + authorize**
   - Schema validation (`zod`).
   - Policy check (allowlist + action rules).
3. **Adapter → OpenClaw**
   - Gateway call using `OPENCLAW_AUTH_TOKEN`.
4. **OpenClaw → Adapter**
   - Response with result or error.
5. **Adapter → Paperclip**
   - Forward response and record audit log.

## Error handling

- **Schema errors** → 400 with validation details.
- **Policy violations** → 403 with reason.
- **Gateway errors** → 502/504 depending on failure mode.

## Observability

- Health endpoint: `GET /health` on adapter (port 3210 by default).
- Audit logs: mounted from `compliance/` (read‑only).
