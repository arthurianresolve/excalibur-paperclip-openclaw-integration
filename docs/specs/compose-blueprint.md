# Paperclip ↔ OpenClaw Compose Blueprint

## Purpose

This document defines the recommended `paperclip-claw-compose.yml` shape for a Raspberry Pi 5 deployment.

This is a **blueprint**, not yet a final production compose file.
It defines:
- service boundaries
- mount policy
- environment layout
- health and restart expectations
- resource and dependency posture

---

## 1. Service Model

Preferred three-service composition:
- `openclaw-gateway`
- `paperclip-controller`
- `paperclip-adapter`

Optional fourth service later:
- `paperclip-postgres` if externalizing DB instead of using embedded Postgres

---

## 2. Responsibilities

### `openclaw-gateway`
Owns:
- OpenClaw runtime
- channels
- tools
- sessions
- OpenClaw config and workspace

### `paperclip-controller`
Owns:
- Paperclip control plane
- orchestration
- governance
- database and storage
- Paperclip API/UI

### `paperclip-adapter`
Owns:
- narrow policy-enforcing bridge between Paperclip and OpenClaw
- allowlist/schema enforcement
- audit logging for adapter actions
- compatibility insulation

---

## 3. Ports

Recommended fixed ports:
- `openclaw-gateway`: `18789`
- `paperclip-controller`: `3100`
- embedded Postgres inside Paperclip: internal only
- external Postgres later if adopted: explicit dedicated port, not host-exposed unless required

Policy:
- avoid auto-assigned ports
- document every host-exposed port
- keep internal-only services internal when possible

---

## 4. Volume and Mount Policy

### OpenClaw-owned writable paths
- `/home/george/.openclaw/openclaw.json`
- `/home/george/.openclaw/workspace`
- `/home/george/.openclaw/agents`
- `/home/george/.openclaw/backups`

### Paperclip-owned writable paths
- `/home/george/.paperclip/instances/paperclip-prod/config.json`
- `/home/george/.paperclip/instances/paperclip-prod/db`
- `/home/george/.paperclip/instances/paperclip-prod/logs`
- `/home/george/.paperclip/instances/paperclip-prod/data/storage`
- `/home/george/.paperclip/instances/paperclip-prod/data/backups`
- `/home/george/.paperclip/instances/paperclip-prod/workspaces`
- `/home/george/.paperclip/instances/paperclip-prod/secrets`

### Shared mount policy
If Paperclip needs visibility into OpenClaw workspace artifacts, mount:
- `/home/george/.openclaw/workspace`
into `paperclip-controller` and/or `paperclip-adapter`
- **read-only by default**

Allowed use cases:
- compliance artifact reads
- curated manifest reads
- transparency/audit reads
- other reference-only reads

Do not grant broad write access from Paperclip services to the shared OpenClaw workspace.

If an exception is required:
- use a dedicated subpath
- document the reason
- scope write access narrowly
- record ownership explicitly

---

## 5. Environment Layout

## 5.1 OpenClaw env/config
Use OpenClaw’s existing config and env discipline.
Do not duplicate its secrets into Paperclip unless strictly required.

## 5.2 Paperclip controller env
Recommended environment variables:
- `PAPERCLIP_HOME=/home/george/.paperclip`
- `PAPERCLIP_INSTANCE_ID=paperclip-prod`
- `PAPERCLIP_CONFIG=/home/george/.paperclip/instances/paperclip-prod/config.json`
- `PAPERCLIP_DEPLOYMENT_MODE=authenticated` or `local_trusted`
- `PAPERCLIP_DEPLOYMENT_EXPOSURE=private` when applicable

## 5.3 Adapter env
Recommended variables:
- `PAPERCLIP_BASE_URL=http://paperclip-controller:3100`
- `OPENCLAW_BASE_URL=http://openclaw-gateway:18789`
- `ADAPTER_TRUSTED_SKILLS_PATH=/workspace/trusted-skills.json`
- `ADAPTER_AUDIT_LOG_PATH=/workspace/compliance/paperclip.log`
- `ADAPTER_TIMEOUT_MS=<explicit>`
- `ADAPTER_MODE=production`

Policy:
- secrets should come from service env files or managed secret sources
- do not hardcode tokens in compose yaml
- do not log secret-bearing env vars

---

## 6. Healthchecks

### `openclaw-gateway`
Health should verify:
- gateway responds on configured port
- auth mode is live if required

### `paperclip-controller`
Health should verify:
- Paperclip API/UI responds
- DB/storage availability is good enough for operation

### `paperclip-adapter`
Health should verify:
- can reach Paperclip base URL
- can reach OpenClaw base URL
- can read required trusted skills / audit path configuration

Policy:
- unhealthy adapter should not silently forward actions
- health failures should be visible and bounded

---

## 7. Restart Policy

Recommended:
- `restart: unless-stopped` or equivalent
- bounded retry behavior if supported by the launcher
- no infinite silent crash loops without operator visibility

Service ordering:
1. start `paperclip-controller`
2. verify controller health
3. start `openclaw-gateway` if not already running
4. verify gateway health
5. start `paperclip-adapter`
6. verify adapter health and integration reachability

---

## 8. Resource Policy for Raspberry Pi 5

Because the host has 8 GB RAM, resource discipline matters.

Recommended:
- cap adapter memory conservatively
- cap controller memory reasonably
- avoid duplicate build trees and caches in containers
- keep logs and backups bounded
- monitor disk usage and memory pressure

Policy:
- adapter should stay lightweight
- avoid putting heavy build steps into startup path
- avoid container images that duplicate more of the runtime than needed

---

## 9. Suggested Compose Skeleton

```yaml
services:
  openclaw-gateway:
    # existing image or host-managed runtime
    # fixed config path
    # fixed port 18789
    # explicit healthcheck

  paperclip-controller:
    # paperclip service
    # fixed config path
    # fixed port 3100
    # persistent paperclip state volumes
    # explicit healthcheck

  paperclip-adapter:
    # lightweight adapter service
    # no broad filesystem write access
    # read-only mount to OpenClaw workspace by default
    # writable access only to adapter-owned audit/log path if needed
    # explicit healthcheck
```

---

## 10. Mount Blueprint Example

```yaml
services:
  paperclip-controller:
    volumes:
      - /home/george/.paperclip/instances/paperclip-prod:/paperclip-instance
      - /home/george/.openclaw/workspace:/openclaw-workspace:ro
      - /home/george/.openclaw/workspace/compliance:/shared-compliance

  paperclip-adapter:
    volumes:
      - /home/george/.openclaw/workspace:/openclaw-workspace:ro
      - /home/george/.openclaw/workspace/compliance:/shared-compliance
      - /home/george/.openclaw/workspace/trusted-skills.json:/workspace/trusted-skills.json:ro
```
```

Note:
- the example above is conceptual
- if `paperclip.log` is stored under workspace, prefer mounting only the specific compliance subpath writable instead of the whole workspace

---

## 11. Preferred Write Ownership

### OpenClaw writes
- OpenClaw config
- OpenClaw runtime state
- OpenClaw workspace files
- OpenClaw backups

### Paperclip writes
- Paperclip config
- Paperclip DB/storage/logs/backups
- Paperclip execution workspaces

### Adapter writes
- adapter-owned audit log
- adapter temp state if required

Policy:
- the adapter should not write broadly into OpenClaw-owned paths
- if audit logs live under `workspace/compliance/`, mount only that scoped path writable if necessary

---

## 12. Preflight Before Final Compose Authoring

Before writing the real compose file, decide:
1. Compose or systemd as primary launcher
2. whether OpenClaw remains host-native or becomes containerized here
3. exact adapter implementation form
4. exact audit log path ownership
5. whether Paperclip uses embedded Postgres or external Postgres

---

## 13. Final Recommendation

Author the real compose file only after the adapter contract and adapter structure specs are finalized.

The compose file should enforce:
- separate state roots
- narrow shared mounts
- read-only OpenClaw workspace visibility by default
- explicit healthchecks
- explicit env file usage
- explicit restart policy
- resource discipline
