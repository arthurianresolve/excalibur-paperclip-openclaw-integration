# Architecture Overview

The integration is a three‑component system that brokers controlled actions between Paperclip and OpenClaw.

```
Paperclip Controller ──► Adapter (policy + audit) ──► OpenClaw Gateway
         ▲                          │                         │
         └──────── callbacks ◄──────┘                         │
```

## Components

1. **Paperclip Controller**
   - Orchestrates workflows and requests actions.
   - Reads trusted skill allowlists from `deploy/paperclip/paperclip.yaml`.

2. **Adapter Service**
   - Validates schema and enforces policy.
   - Logs audits and restricts actions via an allowlist.
   - Lives in `services/paperclip-openclaw-adapter/`.

3. **OpenClaw Gateway**
   - Executes trusted skills and provides audit data.
   - Runs either host‑native or containerized.

## Trust boundaries

- **Paperclip → Adapter:** authenticated HTTP requests.
- **Adapter → OpenClaw:** token‑authenticated gateway calls.
- **Adapter → Compliance logs:** read‑only mount for audit artifacts.

## Data flow (high level)

1. Paperclip issues a request to the adapter.
2. The adapter validates and authorizes the action.
3. The adapter calls the OpenClaw Gateway.
4. Results are returned to Paperclip and audits are recorded.
