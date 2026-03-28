

## QMD memory backend tuning (2026-03-12)

Preserve this setup across OpenClaw updates unless there is a clear reason to change it.

### Backend + command
- `memory.backend = "qmd"`
- `memory.qmd.command = "/opt/qmd/bin/qmd"`
- QMD is installed in a stable location at `/opt/qmd`
- The wrapper executable `/opt/qmd/bin/qmd` is required because OpenClaw expects an executable path, not a multi-word shell command

### Retrieval defaults
- Keep `memory.qmd.searchMode = "search"`
- Default to keyword/BM25 retrieval for maximum speed and lowest token use
- Do **not** default to `vsearch` or `query`
- Only escalate to semantic/hybrid retrieval when keyword search clearly fails

### Update cadence
- `memory.qmd.update.interval = "10m"`
- `memory.qmd.update.debounceMs = 30000`
- `memory.qmd.update.onBoot = true`
- `memory.qmd.update.waitForBootSync = false`
- `memory.qmd.includeDefaultMemory = true`

### Retrieval policy
- Use `memory_search` first for decisions, preferences, dates, people, and prior work
- Use QMD for local markdown docs, notes, and workspace knowledge
- Prefer narrow collection-scoped QMD searches before broad searches
- Prefer snippet-first retrieval and fetch full documents only when clearly needed
- Keep top hits small (generally 3–5)

### Recommended QMD collections
- `main-workspace` -> `/home/george/.openclaw/workspace`
- `donna-workspace` -> `/home/george/.openclaw/agents/donna/workspace`
- `merlin-workspace` -> `/home/george/.openclaw/agents/merlin/workspace`
- `solomon-workspace` -> `/home/george/.openclaw/agents/solomon/workspace`
- `solomon-master-ritualist` -> `/home/george/.openclaw/agents/solomon/workspace/master-ritualist`
- `shared-memory` -> `/home/george/.openclaw/workspace/memory`

### Operational guidance
- Do not run `qmd embed` by default; only do it if semantic/hybrid retrieval is explicitly needed
- Solomon and Master-Ritualist collections may remain empty until markdown files are added there
- The policy doc for this setup lives at `/home/george/.openclaw/workspace/QMD_RETRIEVAL_POLICY.md`

## VPN reconnect preference (2026-03-12)

On Excalibur, the preferred VPN reconnect path is the saved NetworkManager/OpenVPN profile, not transient tunnel instances and not the ExpressVPN app/daemon.

- Saved profile name: `expressvpn-nuremberg`
- Saved profile UUID: `c193246e-de31-4783-9560-96ba90f13b2c`
- Preferred reconnect: `nmcli connection down uuid c193246e-de31-4783-9560-96ba90f13b2c && sleep 2 && nmcli connection up uuid c193246e-de31-4783-9560-96ba90f13b2c`
- Recovery if already down: `nmcli connection up uuid c193246e-de31-4783-9560-96ba90f13b2c`
- Avoid using transient active tunnel UUIDs from `nmcli connection show --active` for reconnects.
- Avoid raw `kill` on `openvpn` except for cleanup of duplicate tunnels.

## Approval preference for updates/changes (2026-03-13)

George's rule:
- If there is **no meaningful operational impact** and **no functional impairment risk**, SPOC may proceed without asking first.
- Before deciding a change is low-risk enough to do automatically, SPOC should research how other OpenClaw users report the update/change behaving, to avoid negative surprises.
- If there is any real chance of outage, degraded behavior, reconnect churn, config drift, dependency breakage, restart/reboot impact, or similar user-visible risk, SPOC should ask for explicit approval first.

This preference applies especially to:
- OpenClaw updates/upgrades
- dependency upgrades
- service restarts with user impact
- network/security changes

## Skill authoring preference: ChatGPT 5.x micro-optimization (2026-03-13)

For all new local skills on Excalibur, apply a ChatGPT 5.x micro-optimization pass before considering them done.

This means:
- reduce repetition in `SKILL.md`
- keep trigger descriptions crisp and specific
- use progressive disclosure with `references/` where helpful
- make reference loading conditional and explicit
- keep default response shapes short and operator-grade
- avoid unnecessary context bloat while preserving operational clarity

This should be the default finishing step for newly created local skills unless there is a strong reason not to.

## Temporary subagent prompt preference (2026-03-14)

For temporary subagents, prefer a ChatGPT 5.x micro-optimized prompt shape:
- short role line
- one-sentence goal
- bullet scope
- explicit constraints
- optional single reference file
- tight output contract

Bias toward:
- low-noise prompts
- minimal findings (generally 3-5 max)
- exact evidence only when relevant
- smallest safe next step

Reference template stored at:
- `/home/george/.openclaw/workspace/TEMP_SUBAGENT_PROMPT_TEMPLATE.md`

## Backup preference (2026-03-27)

For future OpenClaw backups, default to a lean essentials-only archive unless George explicitly asks for a full backup.

Default excludes should include:
- `.venv`
- caches
- logs
- sessions
- `node_modules`
- `dist`
- `build`
- other rebuildable/transient files

Include the important durable data by default:
- `~/.openclaw/openclaw.json`
- workspace files
- memory files
- agent data when relevant

## Approval preference for updates/changes (2026-03-27)

George's rule:
- If there is **no meaningful operational impact** and **no functional impairment risk**, SPOC may proceed without asking first.
- Before deciding a change is low-risk enough to do automatically, SPOC should research how other OpenClaw users report the update/change behaving, to avoid negative surprises.
- If there is any real chance of outage, degraded behavior, reconnect churn, config drift, dependency breakage, restart/reboot impact, or similar user-visible risk, SPOC should ask for explicit approval first.

This preference applies especially to:
- OpenClaw updates/upgrades
- dependency upgrades
- service restarts with user impact
- network/security changes
