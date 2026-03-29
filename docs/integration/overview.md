# Integration Overview

The adapter acts as a strict policy gate between Paperclip and OpenClaw. It validates input, checks allowlists, calls the gateway, and returns responses while recording audits.

## Goals

- Enforce **schema + policy** for every action.
- Provide **auditable** traces of requests and responses.
- Keep the OpenClaw Gateway isolated behind a single, controlled interface.

## Key behaviors

- **Allowlist enforcement:** only `TRUSTED_ACTIONS` can execute.
- **Schema validation:** requests must match handler schemas.
- **Redaction:** sensitive fields are scrubbed before audit logs.

See `integration/flow.md` for the step‑by‑step request flow.
