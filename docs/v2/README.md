# context-mode v2 — working notes (status 2026-10-13)

Main plan: [`../../PRD-v2.md`](../../PRD-v2.md). Where this file and the PRD differ, this file is newer (§ "Changes after the PRD").

Each statement is marked:
- **[V]** verified: source, docs or benchmark, with a link to the spike file
- **[D]** decision made by Mert
- **[O]** open

## 1. Evidence files

| File | Content |
|---|---|
| `tickets/v2-issue-map.md` (+ `map-I0..I3`, `map-P0..P3`) | 173 issues + 178 PRs, each classed A/B/C/D/Q/M, B rows carry a Given/When/Then test |
| `tickets/spike-project-source.md` | project dir source per agent |
| `tickets/spike-distribution.md`, `spike-distribution-verified.md` | git/no-npm install + update per agent (Codex CLI tested live) |
| `tickets/spike-hooks-verified.md` | 4 canonical hooks × 11 agents |
| `tickets/verify-single-db.md` | node:sqlite busy, #985 root cause, WAL benchmark, hook cost, upgrade, metrics |

## 2. Principles [D]

- No fallback chains: one path per behaviour.
- Same code on every agent.
- Claude Code's event model is the canonical contract, and adapters only translate.
- KISS / YAGNI: no CLI, no npm. No feature skills beyond `/ctx-stats`, `/ctx-doctor`, `/ctx-upgrade` (§9).

## 3. Scope

- **[D]** v2.0.0 only. No v1.x line. All open PRs close at v2. Their fixes become B contract tests.
- **[D]** v2.0 agents (10): Claude Code, Codex CLI, Gemini CLI, Qwen Code, Copilot CLI, VS Code Copilot, Kiro, ZCode, Pi, OpenCode 2.
- **[D]** Removed agents:
  - No git install: Cursor (git import is Teams/Enterprise only), Zed, JetBrains.
  - Kimi: repo archived.
  - Codex Desktop: closed source, unknown.
  - OpenClaw: no project source.
  - Antigravity/agy: no SessionStart, no UserPromptSubmit, no tool output in PostToolUse, #1206.
  - OpenCode 1.x.
- **[D]** Deferred past v2.0 GA (D14, new-adapter requests, no prior code history): DeepSeek Harness (#1258), Devin CLI (#957).
- **[O]** OMP (G20): there are 8 issues in total, 5 of them open, all removed by v2 decisions. Recommended: remove.
- **[D]** Statusline, `ctx_insight` and the pricing catalog are removed. Stats show bytes and tokens only.

## 4. Distribution — git only [V]

- CI builds the bundles and pushes them to the `release` branch. The branch has no `package.json` and no `node_modules`. Install commands always name the ref.
- Codex and Pi detect updates by **commit**, not by tag. So every release must be a new commit on `release`, and the Codex `plugin.json` version must go up. (spike-distribution-verified)
- Pi runs npm whenever a `package.json` exists, so the `release` branch must not have one.
- `pi update` runs `git clean -fdx`, so data lives outside the clone.
- The launcher does not write a node path at install time. It resolves `node` lazily, with a liveness-guard lookup, each time a hook runs. This covers both #1090 (non-versioned node path goes stale) and #841 (mise/asdf/nvm node upgrades break hooks).
- Install per agent:

  | Agent | Command |
  |---|---|
  | Claude Code | marketplace add + install, `ref: "release"` |
  | Codex CLI | config.toml entry: `[mcp_servers.context-mode]` pointing at the `release` checkout (no plugin marketplace — avoids #1210, plugin spawns in a cache dir with no `${VAR}` expansion) |
  | Gemini, Qwen | `extensions install <url> --ref release` |
  | Pi | `pi install git:…@release` |
  | OpenCode 2 | `git+https://…#release` |
  | Copilot CLI | **[O]** `copilot plugin marketplace add o/r` then `copilot plugin install ctx@mkt`, not yet tested live |
  | VS Code Copilot | **[O]** `/plugin install <git-repo>` in chat (Agent Plugins 1.0), not yet tested live |
  | Kiro | **[O]** UI only: Powers → Add Custom Power → Import from GitHub, not yet tested live |
  | ZCode | **[O]** UI: Settings → Plugins → Personal marketplace (Claude Code marketplace format), not yet tested live |

  Codex `config.toml` entry:
  ```toml
  [mcp_servers.context-mode]
  command = "node"
  args = ["<checkout-path>/release/bin/context-mode.mjs", "mcp"]
  ```
  Update = re-run the checkout step and re-write this entry; there is no `plugin.json` version bump for Codex.

## 5. Project identity [V]

- MCP `roots` is not used anywhere. It was deprecated in spec 2026-07-28 (SEP-2577).
- Source per agent: an env var, `${workspaceFolder}` or the spawn cwd (spike-project-source).
- Project key = git common dir, and every row stores its worktree.

## 6. Hooks — 4 canonical events [V, docs-only rows marked in the spike]

SessionStart · UserPromptSubmit · PreToolUse · PostToolUse. Each adapter maps every canonical event to one native event.

PreCompact is not a 5th canonical event. Only 3 of 10 agents fire it (Gemini, Copilot CLI, VS Code), and even there it cannot inject context (ADR-0009): it only sets a pending flag that the next prompt hook reads once. All re-injection after compaction goes through SessionStart(source=compact) instead (§6 gaps, ADR-0009).

Gaps:
- Gemini, Pi and OpenCode 2 have no hint on allow. On these agents the hint lives only in the tool descriptions.
- Gemini, Copilot CLI and VS Code do not fire SessionStart again after compaction.
- Pi's `session_start` cannot inject context. Use `before_agent_start` instead.
- OpenCode 2 has no SessionStart. Use the `context` hook with a once-per-session guard.
- Gemini and Copilot CLI block the tool when a hook fails, so hooks must never throw.
- Kiro does have SessionStart and PromptSubmit (docs dated 2026-10-10). My earlier claim that it lacked them was wrong.

**[O] G25:** whether hooks fire for MCP tools in Copilot CLI, ZCode, Pi and OpenCode 2. This needs a real model turn.

## 7. Storage — one DB per project

`~/.context-mode/projects/<git-common-dir-hash>/context.db`, with tables `events`, `sources`, `chunks` (FTS5) and `meta`. Every row has `session_id`, `worktree` and `agent`.

Benchmark results (verify-single-db) [V]:
- node:sqlite `timeout` sleeps and does not spin: a 2.5 s wait used about 4 ms of CPU. The wait still blocks the JS thread.
- **#985 root cause: our own `withRetry` busy loop in `src/db-base.ts:446`.** It was not better-sqlite3 or Bun. v2 deletes this loop.
- With 8 writers, 4 FTS readers and a 20 MB indexer: 0 busy errors, integrity OK, write p99 7–24 ms.
  - Rule: every write starts with `BEGIN IMMEDIATE`.
  - Index writes go in chunks of about 1 MB.
- Hook cost: Node startup is about 28–37 ms of CPU, and the insert adds about 1 ms. A JSONL append is not cheaper.

Open:
- **[O] G21:** single `context.db`. Recommended: yes.
- **[D] G26 (2026-10-13):** hook budget 40 ms, measured in CI. 20 ms is impossible without a daemon.

## 8. Scopes (worktree sharing) [D-pending]

- Identity and stats: repo level (#744).
- Search default: `worktree` (#1185). Wider: `project`. Narrower: `session`. Inside any scope, the current session ranks first (#895).
- Resume: one agent session.

## 9. Tools [D]

9 tools: `ctx_execute` (absorbs `execute_file`), `ctx_batch`, `ctx_index` (absorbs `fetch_and_index`), `ctx_search`, `ctx_resume`, `ctx_stats`, `ctx_doctor`, `ctx_upgrade`, `ctx_purge` (ADR-0010).

`ctx_doctor` and `ctx_upgrade` stay, rebuilt for v2: read-only checks, one path per update mode, no fallback. Uninstall is a mode of `ctx_upgrade` (`mode: uninstall`). 3 user commands wrap these as skills: `/ctx-stats`, `/ctx-doctor`, `/ctx-upgrade` (disable-model-invocation, each calls one matching tool). Other errors explain the fix in one line, no separate CLI.

## 10. Migration from v1 [V facts, O plan]

Facts:
- Plugin users track main, and main ships 7 bundles. `ref:"release"` reaches them only after a version bump and a user update, because auto-update is off by default.
- `npm deprecate` shows its warning only on a fresh download. The README tells users to install globally in 19 places and with npx in 1. Global users will not see the warning.
- v1 writes hook and MCP entries into each agent's config. It does not auto-write CLAUDE.md or AGENTS.md. v1 data lives in `<agentConfigDir>/context-mode/sessions`.

**[O] G22:** the order is version bump → marketplace `ref:"release"` → docs and release note → `npm deprecate`. Each outward step needs separate approval.

## 11. Usage metrics [V]

- GitHub traffic API, 14-day window: 406,880 clones, 46,327 unique cloners.
- The releases have no assets.
- Marketplace install counts: not checked.

**[O] G23:** a weekly CI job stores the traffic numbers.

## 12. Open for next session

- G20 OMP → removed (2026-10-14)
- G21 single DB → yes (2026-10-14)
- G22 migration order → approved (2026-10-14)
- G23 metrics job → approved (2026-10-14)
- G25 model-turn hook test
- G26 hook budget → 40 ms (2026-10-13)
- Confirm the `worktree` search default
- Codex hook timeout key (read from source, no login needed)
- Memory (cm-memory) quality review
- Clean up the superseded lines in PRD-v2.md

## Changes

2026-10-15: tools back to 9 (ctx_doctor, ctx_upgrade restored, A1); Codex install moved to a config.toml MCP entry (A2); launcher node path resolved lazily per hook run, not at install time (A12); PreCompact confirmed not a canonical event (B27); install rows added for Copilot CLI, VS Code Copilot, Kiro, ZCode, all [O] (B42); skills line narrowed to the 3 shipped command skills (B43); DeepSeek Harness and Devin CLI marked deferred past GA (I2-2).
