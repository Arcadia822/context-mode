# ADR-0010: `ctx_doctor` and `ctx_upgrade` stay, rebuilt for v2

- Status: Accepted (2026-10-14, owner: "doctor ve upgrade kalsın, v2'ye göre geliştirelim")
- Related: TECH-SPEC §3.9 (skills `/ctx-doctor`, `/ctx-upgrade`), §3.11 · ADR-0011 (v1 cleanup) · GP11

## Context

v1 issue titles that mention doctor: 35 (8 open). Upgrade or heal: 70 (18 open). The failure classes:

| Class | Issues |
|---|---|
| False FAIL, or PASS on a broken state | #1152 (Codex hooks on by default), #1014 (PASS on an empty index), #548 (path with a space), #712 (Gemini path) |
| Paths and versions baked into config | #711, #1005, #523, #1090 |
| Two install trees | #901 |
| User settings reverted | #1226 (hook timeouts) |
| npm, Bun, ABI | #514, #543, #889 |

Root cause: v1 doctor compares path *strings* against guesses. v1 upgrade runs npm and writes absolute versioned paths into the config.

## Decision

### `ctx_doctor`: read-only, one table row per check

Each FAIL row gives the cause and a one-line fix. Doctor never writes files, never installs anything, and never spawns on a timer.

| # | Check | How |
|---|---|---|
| D1 | version: running bundle vs latest `release` commit | bundle constant; `git ls-remote`. No network gives "unknown", not FAIL |
| D2 | Node is at or above the minimum, and `node:sqlite` loads | process |
| D3 | host config for **this** agent | parse the config and compare it **as data** with what `adapters/table.ts` generates: MCP entry, 4 hooks, timeouts |
| D4 | v1 leftovers | the ADR-0011 detect function; each finding is listed with its fix |
| D5 | hook round trip | run the hook entry with the recorded fixture shipped in the bundle; check the output shape and that wall time is ≤ 40 ms |
| D6 | MCP | this process was started by the host: client name and protocol version from the request |
| D7 | project and worktree | resolved from the agent's single source |
| D8 | `context.db` | `integrity_check`, FTS5 integrity, schema version |
| D9 | index | source and chunk counts per scope. An empty index is reported as such (#1014) |
| D10 | enforcement mode for this agent | rewrite, cap or hint (ADR-0008) |

### `ctx_upgrade`: one path per install mode, no fallback

1. Read the install mode from the adapter table: marketplace plugin, git checkout, or in-process plugin.
2. **Marketplace or host-managed** (Claude Code, Codex, Gemini, Qwen, Copilot CLI): print the host's own update command. ctx_upgrade does not download anything itself; it only does steps 3–5.
3. **Git checkout** (Pi, OpenCode 2, manual installs):
   - fetch the latest `release` commit into a new version dir
   - verify the bundle hash
   - switch to it atomically (rename)
   - keep the previous dir for one rollback
4. **Config:** regenerate only context-mode's entries from `adapters/table.ts`.
   - Keep user keys and user-set values (#1226).
   - Remove v1 entries using the ADR-0011 rules.
   - Paths are resolved when the hook runs and never baked into the config (#711, #1005).
5. **Never** touch user instruction files or data dirs that were not created by context-mode.
6. Return a table of the changes plus "restart needed". The `/ctx-upgrade` skill then runs `ctx_doctor`.

## Tests (GP11)

Cases:
- a v1 install on each agent
- a broken config
- an empty index
- a user-set hook timeout
- a path that contains a space
- two install trees

Golden: the doctor table, the upgrade diff, rollback, and no baked paths.

## r3 decision (2026-10-14, `docs/v2/review/DECISIONS-r3.md`)

- Q16: uninstall is a mode of `ctx_upgrade` (`mode: uninstall`): stops the server, removes the cache and context-mode's own config entries; user data is kept unless the user confirms.
