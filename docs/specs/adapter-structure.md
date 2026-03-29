# Paperclip ↔ OpenClaw Adapter Skill/Service Structure Spec

## Purpose

This document defines the recommended structure for the Paperclip ↔ OpenClaw adapter implementation.

It answers:
- where the adapter should live
- whether it should be a service, skill, or both
- what files it should contain
- what each module should own
- how lifecycle, logging, and compatibility should be handled

---

## 1. Recommended Implementation Form

Preferred form:
- **primary adapter implementation as a dedicated lightweight service**
- optional **OpenClaw-side skill/helper** only if needed to reuse existing trusted OpenClaw primitives cleanly

Reason:
- keeps Paperclip ↔ OpenClaw bridge explicit
- keeps policy enforcement outside general runtime execution
- preserves clearer fault isolation
- avoids turning a normal OpenClaw skill into an oversized cross-system control layer

### 1.1 Best-practice split

#### Adapter service should own
- request intake
- schema validation
- policy enforcement
- audit logging
- upstream routing to Paperclip/OpenClaw
- compatibility normalization

#### Optional OpenClaw helper skill should own
- narrow reuse of existing OpenClaw-native trusted operations
- no broad policy logic
- no broad orchestration logic
- no broad secret bridging

---

## 2. Recommended Location

Recommended workspace-controlled locations:
- adapter service code:
  - `/home/george/.openclaw/workspace/services/paperclip-openclaw-adapter/`
- optional OpenClaw helper skill:
  - `/home/george/.openclaw/workspace/skills/paperclip-openclaw-adapter/`
- deployment assets:
  - `/home/george/.openclaw/workspace/deploy/`
- support scripts:
  - `/home/george/.openclaw/workspace/scripts/`
- adapter compliance/audit docs:
  - `/home/george/.openclaw/workspace/compliance/`

Reason:
- survives OpenClaw updates
- keeps local customization under the workspace
- makes backup behavior predictable

---

## 3. Service Directory Layout

Start with a deliberately lean scaffold. Combine related concerns until the surface area demands separate files—avoid overengineering with one module per function from day one. A minimal first version looks like:

```text
services/paperclip-openclaw-adapter/
  README.md
  package.json
  tsconfig.json
  src/
    index.ts           # bootstrap + config validation
    config.ts          # env/credential loading + safe defaults
    transport.ts       # server + routing + auth hooks
    handler.ts         # schema + policy + audit + action dispatch
    clients.ts         # OpenClaw/Paperclip call helpers
    lib/
      redact.ts        # safe redaction helpers
      ids.ts           # stable ID validation
      health.ts        # health/readiness helpers
  test/
    unit/
      schema.test.ts
      policy.test.ts
      audit.test.ts
```

As the surface grows, split `transport.ts` into `server.ts`/`routes.ts`, move auth into its own module, or add dedicated action handler files. The intent is to keep the initial implementation small and only refactor into more files once justified.

---

## 4. Module Responsibilities

### `index.ts`
- process entrypoint and coarse startup orchestration
- orchestrate config loading, health checks, and handler initialization

### `config.ts`
- load env/config
- validate required paths (audit log, trusted skills, gateway URL)
- expose safe defaults without ambient hidden magic

### `transport.ts`
- start the HTTP server
- register health/readiness routes
- wire auth + request limits
- offer a simple router that delegates to `handler`

### `handler.ts`
- combine schema validation, policy enforcement, and audit logging for now
- dispatch to action metadata (read-only vs mutating)
- redact sensitive fields before audit and response

### `clients.ts`
- wrap calls to OpenClaw and (if needed) Paperclip with timeouts
- normalize responses without embedding policy logic

### `lib/*`
- hold reusable helpers such as ID validation, redaction, health checks, and timeouts

As the codebase grows, split `transport.ts` into `server.ts`/`routes.ts`, give `auth` its own module, or move policy/audit into smaller pieces. The spec assumes a lean “start simple, split later” discipline.

---

## 5. OpenClaw Helper Skill Layout (Optional)

Use only if needed to reuse a narrow trusted helper. A minimal helper layout remains:

```text
skills/paperclip-openclaw-adapter/
  SKILL.md
  references/
    contract-summary.md
    trusted-action-policy.md
  scripts/
    run-trusted-skill.sh
    read-compliance-artifact.sh
```

Rules:
- keep it narrow and helper-oriented
- do not duplicate the adapter’s policy engine inside the skill
- avoid turning it into a generic remote execution gateway

---

## 6. Runtime Lifecycle

### Startup
1. load validated config
2. validate required paths and env
3. validate trusted skills path
4. validate audit path
5. initialize server
6. run health/readiness checks
7. begin accepting requests

### Request handling
1. authenticate request
2. validate schema
3. classify action (`read_only` or `mutating`)
4. enforce policy
5. write pre-execution audit record if required
6. call action handler
7. write outcome audit record
8. return structured response

### Shutdown
- stop accepting new requests
- finish or fail in-flight work explicitly
- flush audit writes if possible
- exit with clear status

---

## 7. Logging Policy

### Service logs
Should contain:
- startup/shutdown state
- health status
- action counts
- safe error summaries

Should not contain:
- raw tokens
- cookies
- full secret-bearing payloads
- unredacted auth headers

### Audit logs
Use the audit contract spec.

Preferred ownership:
- adapter writes adapter audit records
- Paperclip reads or aggregates them
- OpenClaw is not required to author adapter audit logs directly

---

## 8. Health and Readiness

### Liveness
- process is running
- server loop is active

### Readiness
- config valid
- trusted skills file readable
- audit path available
- OpenClaw base URL reachable if required
- Paperclip base URL reachable if required

Policy:
- not-ready adapter should refuse mutating actions
- optionally allow some read-only actions if explicitly safe

---

## 9. Testing Requirements

Minimum tests (required before rollout):
- schema validation tests
- policy allow/deny tests
- audit redaction tests
- error code tests
- upstream timeout tests
- duplicate/retry safety tests for mutating actions
- health/readiness tests

Recommended additional tests (optional for early scaffolding):
- integration tests against a local OpenClaw gateway
- integration tests against a staging Paperclip controller

---

## 10. Deployment Coupling Rules

The adapter must not:
- own Paperclip database state
- own OpenClaw runtime state
- write broadly into OpenClaw workspace
- become the only source of truth for policy if Paperclip already owns policy state
- expose arbitrary shell or command execution as a convenience shortcut

The adapter may:
- enforce policy at the runtime boundary
- normalize requests/responses
- maintain its own bounded logs/audit files
- cache safe read-only metadata if needed

---

## 11. Recommended Next Step After This Spec

Once this structure is accepted:
1. define the real transport (`HTTP`, local socket, or other)
2. choose the adapter runtime language/tooling
3. create the actual scaffold
4. write the real compose/systemd deployment assets
5. implement read-only actions first
6. implement mutating actions second

---

## 12. Final Recommendation

Implement the adapter primarily as a small dedicated service under the workspace, with an optional narrow OpenClaw helper skill only where reuse of existing trusted OpenClaw primitives is clearly beneficial.

Bias toward:
- small modules
- exact IDs
- explicit validation
- deny-by-default policy
- audit-first mutating behavior
- minimal coupling to either side
