# Paperclip ↔ OpenClaw Adapter Contract Spec

## Purpose

This document defines the adapter contract between Paperclip and OpenClaw.

It is intended to turn the high-level implementation plan into a narrow, stable, auditable interface.

Goals:
- small action surface
- stable machine-readable schemas
- clear deny behavior
- exact auditability
- low ambiguity for future implementation

---

## 1. Contract Design Rules

1. prefer a small number of purpose-specific actions
2. prefer exact stable IDs over names where available
3. validate input at the boundary
4. deny by default on unknown, malformed, or out-of-policy requests
5. separate read-only actions from mutating actions
6. keep outputs structured and machine-safe
7. include correlation/audit identifiers on all mutating actions
8. never use the adapter as an unrestricted remote execution tunnel

---

## 2. Action Classes

## 2.1 Read-only / observability
These inspect state and should not change OpenClaw-owned state.

Examples:
- `query_audit_logs`
- `get_transparency_notice`
- `check_trusted_models`
- `read_compliance_artifact`
- `get_skill_policy_status`

## 2.2 Mutating / execution
These may trigger actual runtime behavior and therefore need stricter policy.

Examples:
- `run_trusted_skill`
- `run_approved_workflow`
- `refresh_curated_models`

---

## 3. Common Request Envelope

All adapter actions should use a common envelope shape.

```json
{
  "requestId": "uuid-or-stable-correlation-id",
  "action": "run_trusted_skill",
  "actor": {
    "type": "board|system|workflow",
    "id": "stable-actor-id"
  },
  "context": {
    "goalId": "optional-stable-id",
    "workflowId": "optional-stable-id",
    "reason": "short operator-safe reason"
  },
  "payload": {}
}
```

Rules:
- `requestId` is required
- `action` is required and must be allowlisted
- `actor.id` should be a stable ID, not a display name
- `payload` must match the action schema exactly

---

## 4. Common Response Envelope

```json
{
  "requestId": "same-as-request",
  "ok": true,
  "action": "run_trusted_skill",
  "result": {},
  "audit": {
    "correlationId": "stable-correlation-id",
    "logged": true
  },
  "error": null
}
```

Failure shape:

```json
{
  "requestId": "same-as-request",
  "ok": false,
  "action": "run_trusted_skill",
  "result": null,
  "audit": {
    "correlationId": "stable-correlation-id",
    "logged": true
  },
  "error": {
    "code": "POLICY_DENIED",
    "message": "Skill not trusted for adapter execution.",
    "details": {
      "skillId": "example-skill"
    }
  }
}
```

---

## 5. Action Specs

## 5.1 `query_audit_logs`

### Purpose
Read adapter or compliance audit entries.

### Request payload
```json
{
  "source": "adapter|compliance",
  "limit": 100,
  "after": "optional-cursor"
}
```

### Validation
- `source` must be allowlisted
- `limit` must be bounded
- `after` optional

### Response result
```json
{
  "entries": [],
  "nextCursor": "optional-cursor"
}
```

---

## 5.2 `get_transparency_notice`

### Purpose
Return the current transparency/compliance notice text.

### Request payload
```json
{}
```

### Response result
```json
{
  "notice": "string",
  "sourcePath": "stable-path-or-id"
}
```

---

## 5.3 `check_trusted_models`

### Purpose
Report whether current model configuration matches the curated policy.

### Request payload
```json
{
  "scope": "default|all|specific",
  "targetId": "optional-stable-id"
}
```

### Response result
```json
{
  "status": "ok|drift|unknown",
  "checkedTargets": [],
  "mismatches": []
}
```

---

## 5.4 `read_compliance_artifact`

### Purpose
Read a known compliance artifact by exact ID.

### Request payload
```json
{
  "artifactId": "stable-artifact-id"
}
```

### Validation
- use exact artifact IDs, not fuzzy names
- artifact must be on allowlist or known registry

### Response result
```json
{
  "artifactId": "stable-artifact-id",
  "content": "string-or-structured-payload"
}
```

---

## 5.5 `run_trusted_skill`

### Purpose
Run a trusted OpenClaw skill through the adapter boundary.

### Request payload
```json
{
  "skillId": "stable-skill-id",
  "inputs": {},
  "timeoutMs": 30000
}
```

### Validation
- `skillId` must match exact trusted ID
- `inputs` must match the skill input schema or adapter schema
- `timeoutMs` must be bounded
- mutating audit fields must be present in request envelope

### Response result
```json
{
  "skillId": "stable-skill-id",
  "status": "started|completed|blocked|denied",
  "executionId": "stable-execution-id",
  "summary": "operator-safe summary"
}
```

---

## 5.6 `run_approved_workflow`

### Purpose
Run a pre-approved workflow by exact ID.

### Request payload
```json
{
  "workflowId": "stable-workflow-id",
  "inputs": {},
  "timeoutMs": 60000
}
```

### Validation
- workflow must be allowlisted
- exact workflow ID required
- input schema must match
- approval/policy context must be present if required

### Response result
```json
{
  "workflowId": "stable-workflow-id",
  "status": "started|completed|blocked|denied",
  "executionId": "stable-execution-id",
  "summary": "operator-safe summary"
}
```

---

## 6. Deny / Error Codes

Recommended codes:
- `UNKNOWN_ACTION`
- `SCHEMA_INVALID`
- `POLICY_DENIED`
- `UNTRUSTED_SKILL`
- `UNKNOWN_TARGET_ID`
- `TIMEOUT_LIMIT_EXCEEDED`
- `AUDIT_REQUIRED`
- `AUDIT_WRITE_FAILED`
- `UPSTREAM_UNAVAILABLE`
- `UPSTREAM_AUTH_FAILED`
- `INTERNAL_ERROR`

Rules:
- errors must be operator-useful
- errors must not leak secrets
- mutating failures should preserve enough context for audit and retry decisions

---

## 7. Audit Contract

Mutating actions must carry:
- `requestId`
- stable actor id
- action name
- target stable id
- reason/context

Audit record minimum fields:
```json
{
  "timestamp": "iso-time",
  "requestId": "stable-id",
  "correlationId": "stable-id",
  "actorId": "stable-id",
  "action": "run_trusted_skill",
  "actionClass": "mutating",
  "targetId": "stable-id",
  "result": "allow|deny|error",
  "reason": "short safe string"
}
```

Audit redaction rules:
- never log raw tokens
- never log cookies/session secrets
- never log full secret-bearing payloads unless intentionally redacted
- prefer IDs and safe summaries

---

## 8. Timeout and Retry Policy

### Read-only actions
- shorter timeout
- retry allowed only for transient upstream availability errors

### Mutating actions
- bounded timeout
- no blind retry on unknown state
- if upstream state becomes uncertain, surface explicit error instead of duplicating execution

Policy:
- retry logic must be explicit per action class
- avoid duplicate skill/workflow execution from naive retries

---

## 9. Versioning Policy

Add a contract version field when implementation begins.

Example:
```json
{
  "contractVersion": "1"
}
```

Rules:
- additive changes preferred
- breaking shape changes require version bump
- Paperclip, adapter, and OpenClaw compatibility should be checked after changes

---

## 10. Final Recommendation

Implement the adapter against this contract rather than a broad free-form command surface.

Bias toward:
- exact IDs
- typed schemas
- deny-by-default behavior
- minimal mutating actions
- explicit auditability
