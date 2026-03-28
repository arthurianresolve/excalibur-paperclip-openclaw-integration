# Paperclip ↔ OpenClaw Integration Implementation Plan

## Purpose & Scope
This plan captures the stability-first integration path for the existing Paperclip ↔ OpenClaw surface. Paperclip remains the control plane, OpenClaw is the execution/runtime surface, and a dedicated adapter mediates the contract between them. The goal is to prove the composed topology, harden paths/ports/env, and deliver audited, deployable primitives without adding unnecessary layers.

## Architecture & Contract Fundamentals
- **Composed layout with an explicit adapter boundary.** Paperclip orchestrates goals and policy, the adapter validates/records actions, and OpenClaw executes trusted requests. Each layer owns its own config, workspace, and runtime state.
- **Canonical deployment surface.** OpenClaw runs on port `18789` with its stable `~/.openclaw` state roots. Paperclip runs under `~/.paperclip/instances/paperclip-prod`, with `PAPERCLIP_HOME`, `PAPERCLIP_INSTANCE_ID`, and `PAPERCLIP_CONFIG` exported by the managed service. The adapter only routes to the approved gateway URLs and callbacks.
- **Explicit workspace discipline.** Mutable workspaces are never shared by default; any shared OpenClaw workspace mounts are read-only. Paperclip workspaces live under its own instance, and the adapter stores logs/audit artifacts under its workspace-controlled directories.
- **Callback topology.** Each environment exposes a single canonical Paperclip hostname (e.g., `http://127.0.0.1:3100` in local mode). That URL is documented, allowlisted, and reused for all joins/callbacks.
- **Secret boundaries.** Each service keeps secrets in its native env/config. The adapter never becomes a secret bridge; it redacts tokens before auditing and enforces deny-by-default policies on unknown actions.

## Key Requirements (stability guardrails)
1. Freeze environment preparation before rollout: reserve ports, create directories, define env files, and fix the service working directories.
2. Harden path discovery: explicit `PAPERCLIP_*` overrides, fixed OpenClaw config path, canonical temp/workspace roots, and documented backups.
3. Adapter policy/audit: allowlist trusted actions, classify them (read-only vs mutating), validate schema, redact secrets, and audit both intent and outcome.
4. Workspace isolation: read-only reference mounts only, dedicated execution workspaces per agent, and no implicit shared `~/.openclaw/workspace` writes.
5. Validation and rollback woven into every phase: health checks, join smoke, restart/recovery, and tested restore procedures.

## Risk & Mitigation Summary
| Risk | Impact | Mitigation / Owner |
| --- | --- | --- |
| Config discovery ambiguity (ancestor `.paperclip/config.json`) | Paperclip picks up wrong instance, DB, secrets | Require service-managed `PAPERCLIP_HOME/INSTANCE_ID/CONFIG`, documented launch wrapper, and canonical working directory (Paperclip) | Paperclip service owner |
| Shared mutable workspace collisions | File clobbering, build state drift, non-deterministic behavior | Keep Paperclip workspaces under `~/.paperclip/instances/...`, OpenClaw under `~/.openclaw`, and enforce read-only mounts when sharing | Deployment/adapter team |
| Callback hostname drift (127.0.0.1 vs LAN vs Tailscale) | Join or wake requests succeed locally but cliff on callbacks | Document one canonical hostname per environment and allowlist it for callbacks | Adapter + Paperclip config |
| Secret duplication between services | Rotations become inconsistent; leakage risk | Keep secrets in service-owned env/config; adapter redacts before audit logs | All teams (adapter leads audit) |
| Port/backups collision | Services fail to start or restore | Reserve ports (Paperclip 3100, OpenClaw 18789, Postgres 54329) and keep backup roots separate (`~/.paperclip/.../backups`, `~/.openclaw/backups`) | Operations |
| `/tmp` instability in smoke tooling | Non-repeatable staging runs | Use service-local temp roots (`/var/tmp/openclaw-paperclip-smoke` or instance-local directories) instead of ad-hoc `/tmp` clones | Smoke/runbook authors |

## Phased Implementation Roadmap
1. **Phase 1 – Path/Naming Hardening**
   - Define deployment topology (same host, separate services) and finalize canonical hostname.
   - Reserve ports, create service directories, and lock down env files outside the repo.
   - Enforce `PAPERCLIP_HOME`/`INSTANCE_ID`/`CONFIG`, fixed working dirs, and OpenClaw config pointer.
   - Document canonical temp roots and backup locations.
2. **Phase 2 – Adapter & Paperclip Configuration**
   - Configure Paperclip deployment mode (`local_trusted` → private) and allowed hostnames.
   - Wire the adapter to OpenClaw (gateway URL, auth token path) and implement schema/policy/audit primitives.
   - Start with read-only actions and minimal handler scaffolding; add mutating actions once confidence grows.
3. **Phase 3 – Smoke & e2e Validation**
   - Run join smoke (`pnpm smoke:openclaw-join`) and gateway e2e from the adapter.
   - Verify callback URL, auth, and retry behavior; ensure the adapter logs outcomes.
4. **Phase 4 – Restart & Recovery Testing**
   - Restart Paperclip alone, restart OpenClaw alone, then both sequentially.
   - Reboot host if feasible; ensure adapter falls back gracefully and audit logs capture outages.
5. **Phase 5 – Observation/Burn-in**
   - Run repeated cycles of the join/wakeup/approval flows while monitoring disk headroom, logs, DB growth, and adapter audit entries.
   - Validate backups are current, retention policies enforced, and restore scripts work.
6. **Phase 6 – Production Cutover**
   - Lock the approved configuration, finalize service templates (systemd/compose), and promote the adapter to production routing.
   - Keep rollback steps accessible and ensure metrics/logging show the expected behavior.

## Workstreams → Phase Mapping
| Workstream | Owner | Phases | Deliverables |
| --- | --- | --- | --- |
| Environment Preparation | Ops | 1,6 | Ports/dirs reserved, env files outside repo, canonical hostname documented |
| Paperclip Instance Configuration | Paperclip service team | 1‑3 | Deployment mode, allowed hostnames, backed-up config, canonical callback URL |
| OpenClaw Integration Setup | Adapter/adapter service | 1‑5 | Gateway URL + auth configured, schema/policy/audit primitives, trust allowlist, handler scaffolding |
| Conflict Prevention | Deployment authors | 1‑4 | Workspace isolation rules, secret boundaries, temp root policy, documented canonical paths |
| Rollout Safety | Ops/QA | 4‑6 | Backup validation, restart/recovery test results, burn-in observations, completion documentation |

## Validation Gates (to prove stability)
- **Gate 1:** Paperclip and OpenClaw health endpoints respond under the managed service.
- **Gate 2:** Auth flow aligns with the targeted mode (`local_trusted` → `private` as needed); tokens resolve through the adapter.
- **Gate 3:** Reachability from Paperclip → OpenClaw gateway and from OpenClaw → Paperclip callback URL (single canonical hostname).
- **Gate 4:** Join/onboarding smoke command passes repeatedly with stable audit entries.
- **Gate 5:** Restart/recovery scenarios succeed without leaving stale adapter state.
- **Gate 6:** Backup and restore paths for both services are documented and tested.

## Rollback Outline
1. Stop Paperclip service; leave OpenClaw on its known-good state.
2. Restore Paperclip config/backups from the latest verified snapshot if the rollout changed them.
3. Revert hostname or callback changes (if any) and revalidate health endpoints independently.
4. Retry adapter rollout only after identifying the root cause and confirming recovery steps.

## Stability Checklist (condensed)
- [x] Explicit path roots for both Paperclip and OpenClaw documented.
- [ ] Managed services enforce fixed working directories and env overrides.
- [ ] Workspace isolation confirmed (no accidental shared writeable roots).
- [ ] Canonical hostname/callback URL is described and allowlisted.
- [ ] Join smoke + gateway e2e validated.
- [ ] Restart/recovery tests pass.
- [ ] Paperclip and OpenClaw backups exist with tested restore procedures.
- [ ] Secrets remain in service-owned files only; no repo-tracked secrets.
- [ ] Disk headroom and log retention policies are validated.
- [ ] Rollback steps documented and rehearsed.

## Appendix A: Detailed Conflict Reference
For the full rationale behind each risk listed above (shared workspaces, `.env` shadowing, callback host drift, etc.), refer to the original analysis in the prior sections; keep that narrative archived for audits but use the summary table above for day-to-day decision making.
