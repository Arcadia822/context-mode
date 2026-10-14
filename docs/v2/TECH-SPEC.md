# context-mode v2: Technical Specification (golden state)

- Status: DRAFT r2, 2026-10-14. It replaces r1 from the same day; §11 lists what changed.
- Decisions: `docs/v2/README.md` · ADRs: `docs/v2/adr/0001`–`0006` · Prompt texts: `docs/v2/prompt/drafts.md` · Prompt lint: `docs/v2/prompt/lint.mjs`
- Tags:
  - **[V]** verified; the source is cited next to it
  - **[U]** unverified; it must be checked before the milestone named next to it
  - **[D]** decided by the user
  - **[P]** proposed, waiting for the user (§10)

## 0. Sources this document is measured against

| Source | Version | How it was read |
|---|---|---|
| context-mode v1 | `origin/main` @ `5869f4fa` (2026-10-13). Its `tests/` is identical to clone `1a1bed13`; the only diff is `stats.json` | git tree; a live `initialize` + `tools/list` against `server.bundle.mjs` from that tree |
| Issues and PRs | snapshots `tickets/data/*.json`, last one 2026-10-14 01:59 +03: 590 issues and 659 PRs in all states; 174 + 183 = 357 open, which equals the frozen `open_issues_count` | `gh`. Issues and PRs were disabled afterwards, so the API now returns "disabled" |
| Gemini CLI | `51617c1` (2026-10-12) | local clone |
| Qwen Code | `18f80f5` (2026-10-12) | local clone |
| OpenCode | `1438073` (2026-10-12) | local clone |
| Pi | `7bd01fb` (2026-10-12) | local clone |
| Codex | default branch, 2026-10-14 | GitHub API (no commit pinned) |
| Codex CLI | 0.156.1 | live probe |
| VS Code | default branch, 2026-10-14 | GitHub API |
| Claude Code | 2.1.283 | live probes; docs `code.claude.com/docs/en/mcp.md` fetched 2026-10-14 |
| Prompting guide | "Prompting best practices", platform.claude.com, fetched 2026-10-14 | — |
| MCP spec | **2026-07-28** (latest; server target, ADR-0007), clients today send `initialize` at 2025-06-18 (Codex) / 2025-11-25 (Claude Code) | modelcontextprotocol/modelcontextprotocol `schema/*/schema.ts` |

## 1. Golden state: exit criteria

v2.0.0 is released only when **all** of these hold. Each one is checked by a machine.

| ID | Criterion | Check |
|---|---|---|
| GS1 | GP1–GP11 pass on macOS, Linux and Windows | per-PR CI (§6.6) |
| GS2 | GP-LIVE-ROUTING passes its thresholds (§6.5) on the 6 required agents (§6.9); tier-2 agents pass or carry a written reason; VS Code passes the contract E2E | RC job |
| GS3 | G25 is answered: do hooks fire for MCP tools on Copilot CLI, ZCode, Pi and OpenCode 2 (GP-LIVE-HOOKS) | release job |
| GS4 | v1 tests stay: every KEEP-PASS test in `docs/v2/review/TEST-TRIAGE-r2.md` (131) passes on v2; every ledger row has a verdict; no file under `e2e/` imports `src/` | CI lint + ledger script |
| GS5 | The repo has no SKILL.md other than the 3 command skills and `.claude/skills/release`, no removed-agent path (§3.10) and no `AGENTS.md`, `GEMINI.md`, `QWEN.md`, `CLAUDE.md`, `SYSTEM.md` or `copilot-instructions.md`; `lint.mjs` passes on the built `initialize` + `tools/list` | GP2 |
| GS6 | Claude Code (mcp_tool hook): p95 ≤ 40 ms wall. Command-hook agents: ≤ 20 ms CPU on top of bare Node (bare Node alone is 45.6 ms p95 on the owner's Mac) | GP3 bench |
| GS9 | Server passes GP1/GP2 as a 2026-07-28 stateless server (`server/discover`) and as a 2025-06-18 / 2025-11-25 `initialize` server, with identical bytes (ADR-0007) | per-PR CI |
| GS7 | Install and update from git `#release` with no npm step | GP1 |
| GS10 | v1 retention gates R1–R8 of ADR-0017 pass, incl. the v1-migration live case set | release |
| GS11 | Every implementation step has a green E2E case (ADR-0017) | CI + harness report |
| GS8 | Every item in `tickets/v2-not-closed.md` has an outcome: decided, closed as covered, or closed as won't-fix | review |

## 2. Scope

- **[D] Agents (10):** Claude Code, Codex CLI, Gemini CLI, Qwen Code, Copilot CLI, VS Code Copilot, Kiro, ZCode, Pi, OpenCode 2.
- **[D] Removed:** agy (PRD §15.5), OMP (G20), Cursor, JetBrains, Zed, Kimi, Kilo, OpenClaw, OpenCode 1.x, Codex Desktop.
- **[D]** One `context.db` per project (G21, ADR-0002). Git-only distribution, with no CLI and no skills (G12–G14, G22).

PRD lines this spec supersedes. They are kept in the PRD for history.

| PRD line | Superseded by |
|---|---|
| §6 "≤ 20 ms CPU", E6 | G26: 40 ms |
| §7 "Removed as tools → CLI only"; E9 uninstall; E16 `doctor --report`; E19 `doctor --fix`; G4 old text | G12–G14: no CLI. Errors explain the fix in one line inside the tool result |
| §13 contract tests as `test/contract/<n>.test.ts`; "adapter conformance" | ADR-0003 and §6 here |
| §14 M3 list (Cursor, Kimi, JetBrains, agy, Zed) | §2 here |
| §10 E3 / §7: `ctx_search` default `project` | conflicts with README §8 (`worktree`, #1185) → Q6 |

## 2b. New ADRs from round 3 (2026-10-14)

- ADR-0007 MCP 2026-07-28 · ADR-0008 enforcement (rewrite + cap) · ADR-0009 compaction + memory · ADR-0010 doctor + upgrade · ADR-0011 branches, release, v1 cleanup, metrics. Evidence: `tickets/round3-evidence.json`.

## 3. Prompt delivery (ADR-0004, ADR-0005, ADR-0006)

### 3.1 Which channel reaches the model, per agent

There are two channels: MCP `InitializeResult.instructions`, and tool descriptions from `tools/list`.

| Agent | Server `instructions` | Tool descriptions at session start | Evidence |
|---|---|---|---|
| Claude Code 2.1.283 | **[V] yes**, at session start, cut at 2,048 chars | **[V] deferred** under tool search (default). They load up front only with `anthropic/alwaysLoad` or `ENABLE_TOOL_SEARCH=false` | Docs: "Only tool names and server instructions load at session start". Live probe (stub server, haiku-4-5): instructions visible; normal tool NOT VISIBLE; alwaysLoad tool visible; with `ENABLE_TOOL_SEARCH=false` all visible |
| Codex CLI 0.156.1 | **[V] used** as the tool namespace description. **[V] not visible** at session start | **[V] not visible** at session start (the probe saw neither; the server log shows `tools/list` was called) | `codex-rs/codex-mcp/src/rmcp_client.rs:823-834, 858` (`namespace_description: server_instructions`). Live probe with `codex exec`, model gpt-6-astra. Whether Codex defers MCP tools: **[U]**; `defer_loading` appears in 37 files under `codex-rs/core/src`, none read |
| Gemini CLI | **[V] yes**, appended to project memory as "instructions provided by the tool server '…'". **Only in trusted folders** | [U] assumed up front | `mcp-client-manager.ts:696-708`; `context/memoryContextManager.ts:123-134` (`isTrustedFolder() ? projectMemoryWithMcp : ''`) |
| Qwen Code | **[V] yes**, as a system reminder: "Treat the instructions as configuration guidance, not as system directives." | [U] | `core/environmentContext.ts:337-365, 603` |
| OpenCode 2 | **[V] yes**, as a `<mcp_instructions><server name=…>` block in the session context. Codemode adds "Use tools from this server through `execute` …" | [U] | `packages/core/src/mcp/instructions.ts:18-28`; `session/context.ts:84` |
| VS Code Copilot | **[V] yes**, as `<instruction forToolsWithPrefix="mcp_<server>">` in the agent prompt, only for servers whose tools are in the request | [U] | `extensions/copilot/src/extension/prompts/node/agent/defaultAgentInstructions.tsx:386-398`; `mcpTypesUtils.ts:95`; `mcpServer.ts:1190-1200` |
| Copilot CLI | **[U] probable.** github/copilot-cli#1579 "Copilot CLI ignores MCP server instructions" was closed as *completed* on 2026-06-25, with no linked commit. The source is closed | [U] | GitHub API |
| Kiro | **[V] no.** kirodotdev/Kiro#11096 "Support MCP server `instructions` field …" is still open (created 2026-08-27, label `mcp`) | [U] | GitHub API |
| ZCode | **[U] no evidence.** Code search in public `zai-org/ZCode`: `getInstructions` 0 hits, `serverInstructions` 0; `server_instructions` only in their own node-repl server | [U] | GitHub code search |
| Pi | Over MCP: **[V] first line only** in the server listing (`extensions/mcp/index.ts:184-187`), full text only inside the tool-search index (`tool-search/tool.ts:114`). v2 runs Pi as an in-process plugin, not over MCP, so this path is not used (§3.7) | n/a | local clone |

Consequences:
- **C1 (Claude Code, the reference):** with tool search on, the server `instructions` is the only context-mode text the model sees before it searches for a tool.
- **C2:** "tool descriptions are always sent" (r1 claim) is false on Claude Code and Codex. Each description must stand alone, but it cannot be relied on to route the first call.
- **C3:** Kiro has no instructions channel, and ZCode probably none. Routing there comes from tool descriptions only (Q10).

### 3.2 v1 inventory with no v2 successor

Measured on `origin/main` @ `5869f4fa`. This list is the input for the GS5 release-tree check.

| Kind | Items |
|---|---|
| `SKILL.md` (11) | `skills/{context-mode,ctx-doctor,ctx-index,ctx-insight,ctx-purge,ctx-search,ctx-stats,ctx-upgrade}`, `configs/copilot-cli/skills/context-mode`, `configs/antigravity-cli/skills/context-mode`, `.claude/skills/context-mode-ops` (maintainer, not shipped, Q4) |
| Routing files (13, 55,870 B) | `configs/claude-code/CLAUDE.md`; `configs/{codex,kilo,openclaw,opencode,pi,zed}/AGENTS.md`; `configs/{antigravity,gemini-cli}/GEMINI.md`; `configs/qwen-code/QWEN.md`; `configs/omp/SYSTEM.md`; `configs/{jetbrains,vscode}-copilot/copilot-instructions.md` |
| Manifest keys | `.claude-plugin/plugin.json:30`, `.codex-plugin/plugin.json:24`, `.cursor-plugin/plugin.json:25`, `configs/antigravity-cli/plugin.json:11-12`, `configs/copilot-cli/.github/plugin/plugin.json:20-21`, `package.json:34-36` (`pi.skills`), `package.json:68` (`files: "skills"`) |
| Code that writes routing text into user space | `src/adapters/codex/hooks.ts:70` (`ROUTING_INSTRUCTIONS_PATH`) + `config.ts:9`; `src/adapters/kimi/hooks.ts:38`; `src/adapters/qwen-code/index.ts:389-393`; `src/adapters/openclaw/plugin.ts:105, 386-438, 812-902` |
| Machine-dependent prompt text | `src/server.ts:1246` `" (Bun detected — JS/TS runs 3-5x faster)"` |
| Server `instructions` | none: `src/server.ts:143` `new McpServer({name, version})`; live `initialize` → `instructions: null` |

Out of scope for ADR-0004: `src/search/auto-memory.ts` and the adapters' instruction-file *name lists* (`["AGENTS.md"]`, etc.). They **read** the user's own files for search; they do not write routing text.

### 3.3 v2 source of truth

```
src/prompt/instructions.md          → InitializeResult.instructions (Pi: the same bytes, §3.7)
src/prompt/tools/<tool>.md (×7)     → tools/list description
```

- The build inlines these files into `server.bundle.mjs`. Runtime code never adds to or changes them (PR9).
- No other file in the repo or in user space carries routing text.
- The draft texts are in `docs/v2/prompt/drafts.md`.

### 3.4 Rules

PR1–PR11 are listed in ADR-0005. The lint script is `docs/v2/prompt/lint.mjs`; in v2 CI it runs on the built server's live `initialize` and `tools/list` output.

### 3.5 Measured lengths and lint results (2026-10-14)

| Text | Chars | caps | doubt | tags | quoted | Budget (Q5) |
|---|---|---|---|---|---|---|
| v2 `instructions` (draft r2) | 925 | 0 | 0 | 0 | 0 | ≤ 2,048 |
| v2 `ctx_execute` | 698 | 0 | 0 | 0 | 0 | ≤ 1,024 |
| v2 other 6 descriptions | 163–400 each | 0 | 0 | 0 | 0 | ≤ 1,024 each |
| v2 all 7 descriptions | 2,353 | — | — | — | — | descriptions + schemas ≤ 8,000 (schemas not built yet) |
| v1 24 prompt files | 110,171 | 128 | 2 | 50 | — | — |
| v1 `skills/context-mode/SKILL.md` | 16,358 | 16 | 2 | 10 | 103 | — |
| v1 `.claude/skills/context-mode-ops/SKILL.md` | 24,100 | 56 | 0 | 30 | 41 | — |
| v1 11 tool descriptions (live `tools/list`) | 17,075 (+ 9,749 schema ≈ 6,706 tokens at chars/4) | 1 | 0 | — | — | 5 of 11 are longer than 2,048, so Claude Code cuts them: `ctx_execute` 3,105, `ctx_search` 3,351, `ctx_fetch_and_index` 2,240, `ctx_batch_execute` 2,128, `ctx_execute_file` 2,126 |

How to read this:
- The v1 tool descriptions are mostly fine in tone. Their problem is length and the Bun text.
- The tone problem is in the skill and routing files: "Default to context-mode for ALL commands", "When uncertain, use context-mode", `<mandatory_rule>`, and a 39-phrase trigger list.

### 3.6 Routing pilot on Opus 5.5 (evidence for ADR-0005 and ADR-0006)

Setup:
- Claude Code 2.1.283, `--model claude-opus-5-5`, gateway off (`ANTHROPIC_BASE_URL` unset, so tool search is on by default).
- `--setting-sources project --strict-mcp-config`.
- A stub server (`tickets/data/pilot-routing/stub.mjs`). `ctx_execute` and `ctx_batch` really run `sh`, `node` or `python3` in the project; the other 5 tools return a stub text.
- `--allowedTools mcp__context-mode Bash Read Write Edit Glob Grep`.
- 6 tasks in a fresh git repo:
  - Small: S1 "is the tree clean", S2 "what does README.md say", S3 "create notes.txt".
  - Large: L1 6,000-line `app.log`, L2 a 4,000-line test script, L3 a 20,000-row `data.json`.
- 3 variants × 2 runs = 36 sessions. Raw streams: `tickets/data/pilot-routing/`.

| Variant | Server instructions | `ctx_execute` alwaysLoad | Over-routing (small → ctx) | Under-routing (large → native) | Large answers correct | Bytes returned to model, 6 large runs | Cost, 12 runs |
|---|---|---|---|---|---|---|---|
| A | v2 draft (925 chars) | no | 0/6 | **5/6** | 6/6 | 3,169 | $0.95 |
| A2 | v2 draft | **yes** | **0/6** | **0/6** | 6/6 | 2,808 | $1.14 |
| B | v1 `SKILL.md` lines 20–40 (1,090 chars) | no | **2/6** (S1, both runs) | 0/6 | 6/6 | 3,777 | $0.97 |

Classification: the first tool call that is not `ToolSearch`. Correct answers: L1 667 ERROR lines; L2 tests 0, 997, 1994 and 2991 failed; L3 1,539 users.

Findings:
1. With tool search on, the v2 instructions alone did not make Opus use the deferred ctx tools on large tasks (A). Loading `ctx_execute` up front fixed this in this sample (A2). → ADR-0006.
2. The v1 text over-routed a 1-line `git status` into the sandbox in both runs. This is the overtriggering the guide warns about.
3. **The byte savings were small in every variant.** Opus filtered in plain Bash too (`grep -c`, `jq`), so the routing choice changed the returned bytes only slightly (2,808–3,777). This pilot does not measure the case where an agent would otherwise read raw output. GP-LIVE-ROUTING needs tasks that force that case (§6.5).

Limits:
- n = 2 per cell, one model, Claude Code only.
- The session init listed two user plugins (`agents-md`, `telemetry`) that `--setting-sources project` did not turn off. 0 hook events were seen.
- An earlier 12-run pilot without `--allowedTools` had 9 permission denials and was discarded.

### 3.7 Delivery per agent

| Agent | Instructions | Routing for the first call |
|---|---|---|
| Claude Code | server `instructions` | `ctx_execute` alwaysLoad (ADR-0006, Q2) |
| Codex CLI | server `instructions` (namespace description) | tool descriptions after discovery. Routing quality is measured in GP-LIVE-ROUTING before release (Q11). No `AGENTS.md` |
| Gemini CLI | server `instructions` (trusted folders only) | tool descriptions |
| Qwen Code, OpenCode 2, VS Code Copilot | server `instructions` | tool descriptions |
| Copilot CLI | server `instructions` [U] | tool descriptions |
| Kiro, ZCode | none | tool descriptions only (Q10) |
| Pi (in-process plugin) | the same `instructions.md` bytes, appended to the system prompt in `before_agent_start` (Q7) | plugin tool descriptions (same bytes as `tools/list`) |

Pi API evidence: `before_agent_start` events carry `systemPrompt` (`core/extensions/types.ts:935`) and results may return `systemPrompt` (`types.ts:1499`). An example that appends to it: `examples/extensions/preset.ts:386-389`.

### 3.8 Tool names as each agent shows them

The same MCP tool gets a different name on each agent. This matters in two places: (a) prompt text, (b) hook matchers and hook payload decoding.

| Agent | Model-visible / hook name of `ctx_execute` (server key `context-mode`) | Evidence |
|---|---|---|
| Claude Code (plain MCP) | `mcp__context-mode__ctx_execute` | [V] pilot transcripts `tickets/data/pilot-routing/out-A2-*.jsonl` |
| Claude Code (plugin) | `mcp__plugin_context-mode_context-mode__ctx_execute` | [V] docs plugins section: `mcp__plugin_<plugin-name>_<server-name>__<tool-name>` |
| Codex CLI | model: namespace `context-mode` + name `ctx_execute`; hooks: `mcp__context-mode__ctx_execute` | [V] `codex-rs/core/src/tools/handlers/mcp.rs:46-47, 108-132` (`ensure_mcp_prefix`, delimiter `__`) |
| Gemini CLI | `mcp_context-mode_ctx_execute` (**single** underscore; chars outside `[A-Za-z0-9_\-.:]` → `_`) | [V] `packages/core/src/tools/mcp-tool.ts:37, 328-330, 725-731` |
| Qwen Code | `mcp__context-mode__ctx_execute` | [V] `packages/core/src/tools/mcp-tool.ts:1209, 1241` |
| OpenCode 2 | `context-mode_ctx_execute` (no `mcp` prefix); with codemode the model calls it through `execute` → `tools["context-mode"]` | [V] `packages/core/src/tool/mcp.ts:16-17, 45`; `mcp/instructions.ts:21-23` |
| VS Code Copilot | `mcp_<server>_<tool>` | [V] comment + code `defaultAgentInstructions.tsx:390-392` |
| Pi (MCP path) | `mcp__context-mode__ctx_execute` | [V] `extensions/mcp/tools.ts:79-89` — not used by v2 (in-process plugin registers its own names) |
| Copilot CLI, Kiro, ZCode | [U] | S-NAMES (§9) |

Findings:
- **v1 is wrong about Gemini.** `src/adapters/gemini-cli/hooks.ts:52-64` says the Gemini wire shape is `mcp__<server>__<tool>` and matches `mcp__(?!.*context-mode)`. Gemini HEAD builds `mcp_<server>_<tool>` (single `_`), so that matcher cannot match MCP tools on current Gemini. [V] by source; not yet verified with a live Gemini run.
- v1 issues of this class: #1222, #960, #529, #1028/#1060 (bare `ctx_search` in a resume snapshot), #913, P56, P416, #1052.
- The pilot shows the model maps a bare name in the instructions to the prefixed tool: the v2 instructions say `ctx_execute`, and Opus called `mcp__context-mode__ctx_execute` in all 12 A2 runs.

Rules:
1. **Prompt text** (instructions, descriptions, the `ctx-stats` prompt, tool results) names tools **bare**: `ctx_execute`. Each agent shows the model its own prefixed name next to the description, so a bare name is never wrong, while a prefixed name is wrong on every other agent. Lint PR12 fails on `mcp__…ctx_`, `mcp_…ctx_`, `plugin_…ctx_`.
2. **Hooks**: each adapter row in `adapters/table.ts` holds the exact name pattern for that agent (one row per agent, one install mode per agent, PRD E14). Generated matchers are tested in GP3 against names taken from recorded native payloads, never against hand-written strings (#1222).
3. The server key is fixed: `context-mode` everywhere.

### 3.9 User commands as skills: `/ctx-stats`, `/ctx-doctor`, `/ctx-upgrade` [D 2026-10-14]

- No MCP prompts. Each command is one `SKILL.md` with `disable-model-invocation: true` that only calls the matching tool and shows its table (texts: `docs/v2/prompt/drafts.md` ids `skill_ctx-*`).
- One source dir `skills/` (3 files). Manifests point at it; no per-agent copies, no routing text in skills (routing stays in instructions + tool descriptions, ADR-0004).
- [V] Claude Code 2.1.283, plugin loaded with `--plugin-dir`, plugin name `context-mode`: both `/ctx-stats` and `/context-mode:ctx-stats` ran the skill (live probe 2026-10-14, haiku-4-5). Docs: plugin skills are namespaced `/plugin-name:skill-name`; the short name works when no other command uses it.
- Skill loaders exist in source for Gemini CLI (`core/src/skills/skillLoader.ts`), Qwen (`core/src/tools/skill.ts`), OpenCode (`core/src/skill.ts`), Pi (`core/skills.ts`), Codex (`codex-rs/core`, 36 files mention SKILL.md), VS Code Copilot (`tools/node/skillTool.ts`). Whether each one exposes a skill as a `/` command, and from which install path: **[U] S-SKILLS**. Agents without user-invocable skills: the user asks in words, the model calls the tool.
- `ctx_stats`, `ctx_doctor`, `ctx_upgrade` return Markdown tables (golden in GP10, GP11).

### 3.11 `ctx_doctor` and `ctx_upgrade` (kept, rebuilt for v2) [D 2026-10-14]

v1 issue titles mentioning doctor: 35 (8 open); upgrade/heal: 70 (18 open). Main classes: false FAIL / wrong report (#1152 Codex hooks, #1014 PASS on empty index, #548 path with space, #712 Gemini path), baked paths and versions (#711, #1005, #523, #1090), two install trees (#901), user settings reverted (#1226), npm/Bun/ABI (#514, #543).

**`ctx_doctor`** (read-only, one row per check, each FAIL row = cause + one-line fix):
| Check | Source of truth |
|---|---|
| version: running bundle vs latest `#release` tag | bundle constant; `git ls-remote` (no network → "unknown", not FAIL) |
| Node ≥ minimum, `node:sqlite` loads | process |
| host config for **this** agent: MCP entry + 4 hook entries match `adapters/table.ts` exactly, no v1 entries, no duplicate | the generated config, compared as data, not by path string |
| hook round-trip: run the hook entry with a recorded payload, check output + wall time ≤ 40 ms | GP3 fixture shipped in the bundle |
| MCP: this process is the one the host started (clientInfo = agent) | `initialize` |
| project + worktree resolved from the agent's one source | adapter table |
| `context.db`: `integrity_check`, FTS5 integrity, schema version | DB |
| index: sources and chunk counts per scope (fixes #1014: empty index is reported, not PASS) | DB |
Never spawns per tick, never writes, never installs.

**`ctx_upgrade`** (one path per install mode, no fallback):
1. Read the install mode from the adapter table (marketplace plugin, git checkout, in-process plugin).
2. Fetch the latest `#release` tag into a new version dir; verify the bundle hash.
3. Regenerate only context-mode's entries in the host config from `adapters/table.ts`; keep user keys and user-set values (hook timeouts, #1226); delete v1 entries; paths resolved at hook run time, never baked (#711, #1005).
4. Switch atomically (rename), keep the previous dir for one rollback; never touch user instruction files.
5. Return a table of changes + "restart needed"; the `/ctx-upgrade` skill then runs `ctx_doctor`.
Marketplace installs: the host's own update command is the path; `ctx_upgrade` reports it and only fixes config entries.

### 3.10 Removed-agent files [D]

Removed from the repo, not only from the release tree (paths from `origin/main` @ `5869f4fa`):
`.cursor-plugin/`, `.openclaw-plugin/`, `openclaw.plugin.json`, `configs/{antigravity,antigravity-cli,cursor,jetbrains-copilot,kilo,kimi,omp,openclaw,zed}/`, `hooks/{antigravity-cli,cursor,jetbrains-copilot,kimi}/`, `hooks/formatters/cursor.mjs`, `src/adapters/{antigravity,antigravity-cli,cursor,jetbrains-copilot,kimi,omp,openclaw,zed}/`, `docs/adapters/{kimi-code,openclaw}.md`, `docs/jetbrains-copilot.md`, `scripts/install-openclaw-plugin.sh`, `scripts/lib/register-openclaw-config.mjs`, `scripts/test-openclaw-e2e.sh`, `.github/workflows/openclaw-e2e.yml`, `.claude/skills/context-mode-ops/`, and the `openclaw` key in `package.json`. A CI check (GS5) fails if any of these names reappears.

## 4. Repository layout deltas

PRD §15.2 is the base. Changes:

```
src/prompt/instructions.md, src/prompt/tools/*.md     single prompt source (§3.3)
e2e/
  harness/  mcp-client.mjs   spawn server.bundle.mjs, speak MCP over stdio as a given clientInfo
            hook-runner.mjs  spawn hook entry with a recorded native payload on stdin; capture stdout, exit code, wall time
            db-dump.mjs      open context.db read-only with node:sqlite, dump normalized rows
            normalize.mjs    the volatile-field rules (§6.4)
            live/<agent>.mjs headless drivers (claude -p, codex exec, …)
  fixtures/<agent>/<agent-version>/<event>.json   recorded native hook payloads
  golden/GPn/<case>.json
  cases/GPn-<name>.e2e.mjs
  live/routing-tasks.json                          GP-LIVE-ROUTING task set
```

Proposed test runner: `node:test`. The tests run against built `.mjs` files, so no transform step is needed (Q9).

## 5. Requirement sources

- B rows (124) and M rows (33) in `tickets/v2-issue-map.md`. Each becomes a GP case assertion, never a unit test.
- From the 2026-10-14 rescan (`tickets/v2-not-closed.md`):
  - #1299: quoted curl/wget destinations → GP3
  - #1296: project source read after `initialize` → GP1
  - #1302: Codex concurrent chats, title only → GP7
- `tickets/v2-test-ledger.md`: 221 bug ids cited by v1 tests, each needing a verdict (§6.8).

## 6. Test strategy (ADR-0003)

### 6.1 Layers

| Layer | Runs | Model | Deterministic | Where |
|---|---|---|---|---|
| E2E-style (GP1–GP10) | every PR, 3 OS | none | yes | `e2e/cases` |
| E2E-live (GP-LIVE-ROUTING, GP-LIVE-HOOKS) | by hand (`workflow_dispatch`) + release-candidate tags `v*-rc*`; **no cron** | real | no; thresholds | `e2e/live` |

Hard rule: no test imports `src/`. Inputs and outputs are processes, stdio, files and env only.

### 6.2 Golden paths

| ID | Path | Inputs | Asserts (golden unless noted) | Requirement ids (examples) |
|---|---|---|---|---|
| GP1 | Install + handshake, ×10 adapters | release tree, generated host config | config valid for the host; server starts with no npm step; `initialize` (instructions bytes) and `tools/list` (7 tools); project read after `initialize` | #1206 #1282 #1183 #1090 #1222 #1226 #1000 #1296 |
| GP2 | Prompt surface | `initialize`, `tools/list`, Pi plugin system prompt | identical bytes on 3 OS; `lint.mjs` = 0 failures; budgets (Q5); no user-role injection | #1264 #864 #1031 |
| GP3 | Hooks, ×10 adapters × 4 events | `e2e/fixtures/<agent>/<ver>/*.json` | native stdout/exit code; hint once per session; never empty fields; never throws; PowerShell and quoted curl/wget routed; p95 ≤ 40 ms | #1107 #1299 #1212 #897 #910 #1179 #1261 |
| GP4 | `ctx_execute` | shell/js/python, `file`, `intent`, `timeoutMs`, cancel | exit class; output cut is code-point safe; process tree killed; env passed via spawn env; NODE_OPTIONS does not leak; deleted cwd; PATH shims | #1182 #1093 #1121 #1176 #903 #925 #1117 #951 #1068 #1286 #1209 #1218 |
| GP5 | `ctx_index` → `ctx_search` | folder with nested `.gitignore`, HTML, Markdown, non-ASCII text | ranked hits; `**` matches zero dirs; rowless tables; nested fences; byte caps; zero-hit reply states scope and source count; proxy env | #1292 #1291 #1295 #1138 #1136 #1238 #878 #898 #961 #1014 #1039 |
| GP6 | Journal + resume | PostToolUse payload sequence, then a compaction | `events` rows; `ctx_resume` ≤ 2 KB golden; priority polarity | #1181 #1156 |
| GP7 | Scope | 2 worktrees × 2 sessions × 2 agents | identity shared per repo; search default per Q6; session ranks first; path containment by components | #744 #1185 #895 #1294 #1302 |
| GP8 | Concurrency | 4 servers + hooks writing one `context.db` | 0 busy errors reach the tool result; `integrity_check` ok; no retry loop; idle CPU ≈ 0 | #985 #1213 #1248 · verify-single-db |
| GP9 | Lifecycle | stdin EOF, parent kill, on 3 OS | exit < 2 s; no spawn at boot; no `chdir` | #1100 #982 #953 #1167 #923 #924 #974 |
| GP11 | Doctor + upgrade | v1 install, broken config, empty index, user-set hook timeout | doctor table golden; upgrade keeps user values, removes v1 entries, no baked paths, rollback works | #1152 #1014 #901 #1226 #711 #1005 #548 |
| GP10 | Stats | a known sequence of tool calls | saved = sandbox bytes − returned bytes; idempotent per call id; per agent "no data" with the reason | #1151 #1252 #1036 #1287 |
| GP-LIVE-ROUTING | real agent + model | §6.5 | over-routing and under-routing within thresholds; answers correct | ADR-0005, ADR-0006 |
| GP-LIVE-HOOKS | real agent + model | an MCP tool call | hook fired yes/no per agent | G25 |

### 6.3 Fixtures

- A native hook payload is captured once from the real agent and stored under its agent version.
- When an agent's version changes, the fixture is recaptured and the golden diff is reviewed.
- Agents not installable in CI keep their last fixture. The fixture's age is reported in the GP3 output.

### 6.4 Golden files

- Format: one JSON file per case, `{ "input": …, "stdout": …, "exit": n, "db": [rows] }`.
- Normalized before comparison:
  - ISO timestamps → `<ts>`
  - PIDs → `<pid>`
  - temp home and project paths → `<home>`, `<proj>`
  - session ids → `<sid:n>` in order of first appearance
  - durations → `<ms>`
  - `\` → `/`
- `UPDATE_GOLDEN=1` rewrites golden files locally only. CI fails if a golden file changed in the PR without a diff in `e2e/golden/` being part of the PR review.

### 6.5 GP-LIVE-ROUTING (spec)

- **Tasks:** `e2e/live/routing-tasks.json`, 10 small and 10 large, each with a machine-checkable answer.
  - Large tasks include cases where a filtering Bash command is not obvious, for example "summarize the three most frequent stack traces", so that savings are measured and not only tool choice.
- **Models:** Opus, Sonnet and Haiku on Claude Code; the default model on Codex. Other agents run if they have a headless CLI.
- **Metrics:**
  - over-routing: small task whose first non-`ToolSearch` tool is a ctx tool
  - under-routing: large task whose first tool is native
  - answer correctness
  - bytes returned to the model
- **[P] Thresholds:** over-routing ≤ 1/10, under-routing ≤ 1/10, correctness 10/10 on large tasks, per model.
- The ADR-0006 alwaysLoad flag is A/B tested here before every release.

### 6.6 CI matrix

- **[P] Per PR:** macOS, Linux, Windows × the minimum Node version and the current Node version. The minimum is S-NODE (§9).
- **[P] Budget:** ≤ 10 minutes wall-clock per OS.
- **E2E-live:** no schedule. See §6.9.

### 6.7 Performance budgets

- Hook p95 ≤ 40 ms (G26, GP3)
- Server idle CPU ≈ 0 after 60 s (GP8, GP9)
- No process spawn at boot (#1167, GP9)

### 6.8 Deletion gate for v1 tests

- `tickets/v2-test-ledger.md` has 221 rows: 164 closed issues, 46 merged PRs, 7 closed PRs, 1 open issue (#45), 3 non-issues.
- Suggested buckets by title keywords (review needed): REMOVED 56 · GP4 44 · UNASSIGNED 22 · GP8 21 · GP3 19 · GP1 17 · GP9 16 · GP6 13 · GP5 7 · GP7 3 · not an issue 3.
- Each row gets exactly one verdict: `GPn/<case>`, `REMOVED:<ADR|G|E id>`, or `N/A`.
- v1 `tests/` (210 files, 81,072 lines; 136 import `../src/`; 64 start processes) is deleted in one commit, only when no row is empty and GS1 holds.

### 6.9 Live E2E job (`live-e2e.yml`) [D: no nightly]

Triggers: `workflow_dispatch` (input: which agents) and `push: tags: ['v*-rc*']`. Keys live in a GitHub environment with required reviewers. Models are pinned; `--max-budget-usd` is set where the CLI has it.

Each matrix cell (ubuntu-latest, one agent): install a pinned agent version → write config only to temp dirs → run `e2e/live/routing-tasks.json` (10 small + 10 large) and the G25 hook probe → parse the event stream (first non-ToolSearch tool, answer, bytes returned) → check §6.5 thresholds → upload raw JSONL.

| Agent | Tier | Headless command (from docs/source) | Auth secret | Temp config |
|---|---|---|---|---|
| Claude Code (Opus, Sonnet, Haiku) | required | `claude -p --output-format stream-json --verbose --plugin-dir <build> --strict-mcp-config --include-hook-events --max-budget-usd 0.5 --no-session-persistence` | ANTHROPIC_API_KEY | `--plugin-dir` |
| Codex CLI | required | `codex exec --json --skip-git-repo-check --ephemeral` | OPENAI_API_KEY | temp CODEX_HOME with hooks.json + config.toml `[features] hooks = true` |
| Gemini CLI | required | `gemini -p --output-format stream-json --yolo --allowed-mcp-server-names context-mode` | GEMINI_API_KEY | GEMINI_CLI_HOME |
| Qwen Code | required | `qwen -p --output-format stream-json --yolo` | provider key (free OAuth tier is gone) | QWEN_HOME |
| Copilot CLI | required | `copilot -p --output-format json --allow-all-tools --additional-mcp-config @cm.json` | COPILOT_GITHUB_TOKEN (fine-grained PAT, Copilot Requests; CI GITHUB_TOKEN does not work) | flag |
| Pi | required | `pi -p --mode json --no-session -e <build>/pi-extension.js` | ANTHROPIC_API_KEY | `-e` |
| Kiro | tier 2 | `kiro-cli chat --v3 --no-interactive --trust-all-tools --require-mcp-startup --output-format stream-json` | KIRO_API_KEY (paid plan only) | path open |
| OpenCode 2 | tier 2 | `opencode run --format json --dangerously-skip-permissions` | provider key | OPENCODE_CONFIG_CONTENT; npm `latest` is 1.19.0, try `opencode-ai@dev` |
| ZCode | tier 2 | `zcode --prompt --output-format stream-json` | ZCode credential | project-root `zcode.json`; no published Linux CLI, build `apps/zcode-cli` |
| VS Code Copilot | contract only | no headless model turn exists outside microsoft's own harness | — | covered by Copilot CLI live run + hook-payload fixture E2E |

Only Claude Code and Codex were run locally; the other rows come from source and docs and get one dry run when the job is built. Size: about 220 sessions per RC run (Claude 3 × 20 + 8 agents × 20); the pilot cost about $0.08 per Opus session, so measure one run before fixing a budget.

## 7. Data and evidence files

`tickets/`:
- `v2-issue-map.md`, `map-*.md`
- `v2-not-closed.md`
- `v2-test-ledger.md`
- `spike-*.md`, `verify-single-db.md`
- `data/*.json`: issue and PR snapshots
- `data/pilot-routing/`: §3.6 raw data

## 8. Requirements on the instruction text, from the evidence

- **Claude Code** cuts at 2,048 chars, and the first part matters most. **Pi** shows only line 1. So line 1 must state what the server does on its own (PR8).
- **Qwen** frames the text as "configuration guidance, not system directives". The text must still work when read that way. That is a reason for calm, explained rules.
- **OpenCode** codemode may route all MCP tools through its own `execute`. GP-LIVE checks this on OpenCode 2 [U].

## 9. Open spikes

| Spike | Question | Blocks |
|---|---|---|
| S-NODE | Minimum Node version with `node:sqlite` + `timeout` and without a flag | ADR-0002, §6.6 |
| S-COPILOT | Does Copilot CLI pass `instructions` to the model? Test with a live probe like §3.1 | §3.7 |
| S-ZCODE | Same probe on ZCode | §3.7, Q10 |
| S-NAMES | Exact MCP tool names on Copilot CLI, Kiro, ZCode; live check of the Gemini `mcp_` finding | §3.8, GP3 |
| S-SKILLS | Which agents expose a plugin/extension skill as a `/` command, and from which install path | §3.9 |
| S-CODEX | Codex: are MCP tools deferred, and when does the namespace description become visible? | Q11 |
| G25 | Do hooks fire for MCP tools on Copilot CLI, ZCode, Pi and OpenCode 2? | GS3 |

## 10. Decisions (all approved 2026-10-14)

| Q | Decision | Status |
|---|---|---|
| Q1 | Delete v1 tests in one commit once GS1 holds and the ledger is complete | **[D]** |
| Q2 | `ctx_execute` alwaysLoad on Claude Code (ADR-0006) | **[D]** |
| Q3 | **User commands = 3 skills** `/ctx-stats`, `/ctx-doctor`, `/ctx-upgrade` (§3.9); no MCP prompts | **[D]** |
| Q3b | **`ctx_doctor` and `ctx_upgrade` stay as tools, rebuilt for v2** (§3.11) | **[D]** |
| Q4 | **`.claude/skills/context-mode-ops` is removed from the repo** | **[D]** |
| Q4b | **Every file of a removed agent is removed from the repo** (§3.10) | **[D]** |
| Q5 | Budgets: instructions ≤ 2,048 chars; each description ≤ 1,024; descriptions + schemas ≤ 8,000 | **[D]** |
| Q6 | **`ctx_search` default scope = `worktree`** (PRD E3 superseded) | **[D]** |
| Q7 | Pi: same `instructions.md` bytes via `before_agent_start` | **[D]** |
| Q8 | E2E-live only by hand + on RC tags, never nightly (owner, 2026-10-14) | **[D]** |
| Q9 | **Test runner = `node:test`**; matrix 3 OS × min/current Node, ≤ 10 min per OS | **[D]** |
| Q10 | Kiro, ZCode: tool descriptions only | **[D]** |
| Q11 | **All 10 agents, Codex included, are supported and release-gated by GP-LIVE-ROUTING**; no `AGENTS.md` | **[D]** |
| Q12 | Prompt texts use bare tool names only (`ctx_execute`); host-prefixed names live only in the adapter name map (§3.8, PR12) | **[D]** |

## 11. Changes from r1 (same day)

| r1 said | r2 says | Why |
|---|---|---|
| "95 of 210 tests spawn processes" | 64 | r1 regex matched the bare word `spawn`; r2 regex is `child_process\|spawn\(\|execa\|execFile\|StdioClientTransport` |
| "Tool descriptions are always sent" | false on Claude Code and Codex | live probes, §3.1 |
| "6 agents unverified" for instructions | 3 verified more (Claude Code, Codex, VS Code), Copilot CLI probable, Kiro no, ZCode no evidence | §3.1 |
| Budget "≤ 1,500 tokens" for instructions | ≤ 2,048 chars | Claude Code's cut is in chars |
| "8 caps markers" in the routing skill | lint: 16 caps, 2 doubt, 10 tags, 103 quoted | `lint.mjs` with stated regexes |
| GP-LIVE "20 commands" | §6.5 spec + a measured pilot (§3.6) | — |

## 12. r3 decisions applied (2026-10-14)

Source: `docs/v2/review/DECISIONS-r3.md` (owner accepted all 19). These override older text in this file.

- **Output cap:** one constant, `OUTPUT_CAP = 16384` bytes, for ctx tool replies, the ADR-0016 replace and the ADR-0008 deny threshold. Not the 2 KB `ctx_resume` cap, not the 4 KB doctor cap (Q2).
- **ctx_execute:** one fixed default timeout, value set by measurement (not 120 s, v1 #406); kills the process tree (Windows Job Object) and bounds the whole handler incl. batch; grep exit 1 is not an error (Q8). `background` mode stays; languages: shell, powershell, javascript, typescript, python, plus runtimes found on PATH (Q9). Code echo removed, `summary` added; `ctx_search` rejects an unknown `query` field with `isError` (Q19).
- **Node minimum:** first version with `node:sqlite` + `timeout` and no flag, from spike S-NODE (Q10).
- **Fetch:** honours `HTTP(S)_PROXY`/`NO_PROXY`, with an SSRF check on the target host (Q19).
- **Tool descriptions:** 1,024 chars each, enforced by `lint.mjs` (Q13). "No regex" applies to runtime code only; CI tools may use regex (Q17).
- **Tests:** ADR-0003 r2 + ADR-0017: v1 tests stay; an E2E case at every step; live E2E on `claude-sonnet-5 --effort low`.
