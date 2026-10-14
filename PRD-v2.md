# context-mode v2.0 — PRD

- Status: draft, open decisions G1–G10 in §11 (grill)
- Date: 2026-10-12 · Owner: Mert · Branch: `v2` (renamed from `next` on 2026-10-14)
- Inputs: `tickets/v2-decisions.md` (D1–D18), `tickets/v2-issue-map.md` (173 open issues, 178 open PRs, per-item class + contract test)

## 1. Goal

Every open issue and PR gets one explicit outcome, and every real bug becomes a contract test that v2 must pass.

| | Removed by design (A) | Re-solved + test (B) | v1.x merge (M) | Scope call (C) | Dup / fixed (D) | Decision (Q) |
|---|---|---|---|---|---|---|
| Issues (173) | 67 | 73 | – | 12 | 5 | 16 → decided in §10/§11 |
| PRs (178) | 60 | 51 | 33 | 26 | 8 | – |

"Done" for v2.0 = all A code is deleted, all B tests pass on macOS/Linux/Windows, all C/Q items have a written decision, every item is closed with a comment naming its outcome.

## 2. Principles

- **P1 One path.** No fallback chains. Missing input → one-line error that names the fix.
- **P2 Same code on every agent.** Agents differ only in transport: how events arrive and how replies leave.
- **P3 Claude Code's event model is the canonical contract.** Adapters translate to and from it.
- **P4 Hooks are pure.** No DB, no network, no spawn, ≤ 20 ms CPU.
- **P5 Idle server = 0 % CPU.** No timers that scan, no boot-time probes, no `ps`.
- **P6 Test first.** Each B item gets its contract test before its code.

## 3. Architecture

```
 hooks+mcp agents (CC, Codex, Gemini, Cursor, Kiro, Qwen, Kimi, Copilot, agy, JetBrains)
   │ hook stdin JSON                 │ MCP stdio
   ▼                                 ▼
 hook.mjs                          server.mjs
   adapter.decode                    core/tools registry ─► sandbox · store · stats
   core/policy  → hint | deny        (server-id = one MCP connection)
   core/journal.append (JSONL)
   adapter.encode

 plugin agents (OpenCode, Pi, OMP, OpenClaw)
   in-process adapter ─► same core/policy, core/journal, core/tools (no spawn, no MCP hop)

 mcp-only agents (Zed, …) ─► server.mjs only (tools + search; no journal, no resume)
```

Three layers, one build (esbuild, static imports only — #1201, #890):

1. **core/** — knows no agent. Tools, sandbox, store, project, journal, policy, stats, lifecycle.
2. **adapters/** — pure translation + install/doctor data. No business logic.
3. **entries/** — `server.mjs`, `hook.mjs`, `cli.mjs`, one plugin entry per plugin agent.

### 3.1 Module map and coverage

| Module | Job | Issues / PRs it closes (B items) |
|---|---|---|
| core/tools | One file per tool: zod schema + handler + description. One registry for MCP server and plugin adapters | #1200 #1052 #913 #1081 #1119 #1082 #1067 #1047 #1077 #1094 #1135 #1150 #1172 |
| core/sandbox | spawn, env, PATH, timeout, cancel, kill tree, Windows shell, containment | #925 #1117 #951 #1068 #969 #1237 #1217 #1218 #1209 #1208 #934 #959 #947 #936 #1147 #968 #1175 #1182 #1093 #1009 #904 #1121 #1294 #954 #756 |
| core/store | node:sqlite, FTS5, chunking, budgets, paging | #878 #898 #961 #962 #963 #980 #1238 #1292 #1291 #1136 #1163 #903 #907 |
| core/project | ProjectContext: project key, worktree path, containment root | #744 #434 #1210 #1032 #1033 #1017 #1246 #1276 #906 #954 |
| core/journal | Append-only JSONL per agent session, event schema, 5 MB cap | #1181 #899 #1156 #1107 #1198 #1214 |
| core/policy | Pure hint/deny decision for a canonical tool call | #1069 #1026 #1265 #1212 #897 #1231 #1003 #1075 #1267 |
| core/stats | On-demand stats from journal + session DBs (read-only) | #1151 #1252 #1025 #1023 #950 #1036 #1287 #1254 #1248 #1213 #1111 #1186 |
| core/lifecycle | Exit on stdin EOF, no timers, no chdir, lazy discovery | #1100 #982 #983 #953 #999 #1262 #1167 #1159 #923 #924 |
| adapters/* | decode/encode, tool-name map, install patch, doctor checks | #1199 #1206 #1240 #1179 #910 #1264 #864 #1263 #1085 #1112 #1018 #1028 #1222 #1168 #1035 #1266 #1152 #1153 |
| cli | install, doctor (+report), upgrade, uninstall | #1282 #1183 #1090 #1226 #1228 #1000 #1219 #1235 #1239 #1220 #1160 #1215 #1141 #1242 #901 #889 #1058 #1016 #1005 |

The full per-item list (with Given/When/Then) is in `tickets/v2-issue-map.md`. Each B row becomes `test/contract/<n>.test.ts`.

## 4. Storage

```
~/.context-mode/
  bin/context-mode[.cmd]                launcher; holds the non-versioned node path (#1282 #1183 #1090)
  policy.json                           user security policy (G6)
  projects/<sha256(git-common-dir)>/    or projects/global/ when CONTEXT_MODE_PROJECT=global (#737)
    sessions/<server-id>.db             content index of ONE MCP connection — single writer
    journal/<agent-session-id>.jsonl    hook events of ONE agent session — single writer, ≤ 5 MB
    owners/<server-id>.pid
```

- **Write:** only the owner writes its file. No shared writable DB → removes #985 #880 #992 #905 #1205.
- **Read:** search and stats open sibling DBs with `readOnly: true` (#1213).
- **Cleanup:** only at server start, never on a timer. Delete a session DB/journal older than 14 days whose owner PID is dead. Liveness = `process.kill(pid, 0)`, never `ps` (#1024 #1140 #1277 #970 #1262).
- **Content retention:** a source re-indexes when its content hash changes; it dies with its session DB (#1079).
- **Corruption:** hard error in the tool result naming `ctx_doctor`'s fix action: rename `context.db`/`-wal`/`-shm` aside. No silent recreate, no separate CLI (#867).
- **v1 data:** never read, never migrated. `doctor` lists v1 paths + sizes and prints a delete command (D13).

## 5. Project and session identity

- **ProjectContext** is resolved once, at server start (MCP) or plugin load, from the adapter's single `projectSource`. Missing → the server starts, every tool returns `project source <X> missing — run context-mode doctor`. Never process cwd unless the adapter's source *is* cwd. Never chdir (#923 #924).
- **Key** = git common dir → all worktrees of one repo share a project (#744). Each event and each indexed source also stores its worktree path; commands run in the session's worktree (#756 #1185).
- **Per-agent source table** = spike S0 (`tickets/spike-project-source.md`), done 2026-10-12:
  - `CLAUDE_PROJECT_DIR` — Claude Code (plain MCP: env; plugin: `"${CLAUDE_PROJECT_DIR}"` written into plugin.json `env`).
  - MCP `roots` is **not used anywhere**: deprecated in spec 2026-07-28 (SEP-2577), servers can no longer request it on their own (E26).
  - `${workspaceFolder}` in config — Cursor (spawn cwd is `/` or `$HOME`), VS Code Copilot (incl. Remote-WSL).
  - spawn `cwd` — Codex CLI (plain config.toml only), Gemini CLI, Pi, Oh-My-Pi, Qwen Code, Kimi CLI, OpenCode, Copilot CLI, Zed, Kiro (project-level config only).
  - **No automatic source** — Codex Desktop, Codex plugin install, JetBrains Copilot, OpenClaw, Antigravity + agy, Kiro user-level config → G11.
- **server-id** = random UUID per MCP connection. **agent-session-id** = from hook payload (hooks agents) or the plugin API (plugin agents).
- **Crediting:** PostToolUse sees `ctx_*` calls too, so the journal credits all work to the right agent session. Fixes #1198 (work credited to the newest session) and #1055 (sibling server checks) — there is no global "MCP ready" sentinel any more.

## 6. Hooks

- One entry: `context-mode hook <agent> <event>`. Host config (hooks.json, settings, TOML) is **generated** from the adapter table; every entry has a timeout (#1226 #1228 #1000).
- Matchers: `Bash|PowerShell|Read|Grep|WebFetch` + our own `ctx_*`. Never every `mcp__*` (#960 #897 #1212 #1222).
- Decisions: `allow` (no output) · `hint` (additionalContext) · `deny` (only from the user's `policy.json`).
- Hint cadence: once per session per hint type; the state lives in the journal (#1107 #1267 #1265 #1270).
- External MCP tools get their hint from tool descriptions, not from a hook (#1231 vs #960).
- Never `updatedInput` on `ctx_*` (#1142). Never user role (#1264 #864 #1263). Never empty fields (#910 #1179).
- Budget: ≤ 20 ms CPU per call, measured in CI (#1261). PostToolUse runs `async` where the host allows it.
- Parallel tool batches may show the hint after siblings ran — accepted, hints are advisory (#1003).

## 7. Tools (surface = G4)

Proposed set of 9: `ctx_execute`, `ctx_batch`, `ctx_index`, `ctx_search`, `ctx_resume`, `ctx_stats`, `ctx_doctor`, `ctx_upgrade`, `ctx_purge`.

Common contract for all tools:
- First line of every result = a one-line summary. No code echo (#1067 #1047 #1127 #1077).
- `timeoutMs`, default 120 000, bounds the whole handler (#1082 #1081 #1147 #968 #936 #947).
- MCP progress notifications while running; MCP cancellation → abort → kill the process tree (#1088 #1121 #1093 #1009 #1182 #904 #1175).
- All descriptions together ≤ 2 000 tokens, checked in CI. Routing advice lives here (D11, #1031).
- `readOnlyHint: true` on `ctx_search`, `ctx_resume`, `ctx_stats` — so plan mode allows them; `ctx_execute` is not read-only and asks (#1048).
- Errors: one line with the cause, never a Node stack (#1135 #1172).

Per tool:
- **ctx_execute** `{language, code, file?, intent?, timeoutMs?}` — absorbs `ctx_execute_file`. > 5 KB with intent → indexed + matching chunks; > 100 KB → indexed + pointer (kept from v1, it works).
- **ctx_batch** `{commands[], queries[]}` — renamed from `ctx_batch_execute`; queries search the whole session scope (#696); one footer, short (#922 #1275).
- **ctx_index** `{path | content | url, source?}` — absorbs `ctx_fetch_and_index`. Honors `HTTP(S)_PROXY`/`NO_PROXY` (#1039 #1041). Nested `.gitignore` + negations (#1292), `**` = zero or more dirs (#1291). Byte + chunk budgets, high-entropy tokens skipped (#961 #878 #962 #898 #980). turndown bundled, no runtime install (#1280 #1174).
- **ctx_search** `{queries[], scope?: "session"|"project", source?, offset?}` — default `project`, includes this session's own content (#835 #991); rank session > worktree > project; each hit labelled agent/session/worktree (#895); zero hits → states scope + doc counts (#1014); `source`+`offset` pages an indexed source (replaces the `ctx_page` request #1204); clip before highlight (#963). No call throttle: the per-call byte budget is the guard (#769 #920).
- **ctx_resume** `{session?, seq?: number}` — ≤ 2 KB summary from the journal: last task, last user request, files changed, open errors, decisions, pointers go to `ctx_resume(seq:N)`. Plugin agents know the session in-process; hook agents get the id in the SessionStart hint (D9, #1022 #902 #1274 #780).
- **ctx_stats** — see §9.
- **ctx_purge** `{session | source | project}` — absorbs `ctx_forget` (#939).

- **ctx_doctor** — diagnoses and fixes install/DB problems; see §4 corruption handling.
- **ctx_upgrade** — moves a v1 install to v2, removing v1 leftovers (ADR-0011).

Removed as a tool: `ctx_insight` → CLI only (TECH-SPEC §3.11/G4).

## 8. Sandbox

- `spawn(argv, { env })` — env never written into command text (#925 #1117). `NODE_OPTIONS` and preload files never leak past the direct child (#951 #1068). No long-lived temp files (#969 #1237).
- PATH = the parent's PATH. Runtimes found by PATH lookup, including `#!/bin/sh` shims (#1217 #1218 #1209 #1208). Lazy: found on first use, never at boot (#1167 #1159).
- Kill: Unix process group; Windows Job Object. Timeout and cancel both kill the whole tree.
- Windows `language: "shell"` = G7. `language: "powershell"` stays its own language.
- Shell exit ≠ 0 with stderr = error (#1121).
- Containment: path checks by path components, not string prefix (#1294); all worktrees of the project are inside (#954).
- Security policy source = G6 (#1019 #944 #1165 #1075).

## 9. Stats (D17)

- `ctx_stats` computes on demand: reads journals + session DBs read-only. No lifetime cache, no timer, no all-DB scan on a heartbeat (#1248 #1213 #1111 #999 #1186).
- One formula, one unit test: **saved = bytes produced in the sandbox − bytes returned to the model** (#1151 #1252 #1025 #1023 #950). Idempotent per tool-call id (#1036).
- Per agent: shows "no data" with the reason (#1287 #1254).
- Money: G5. Statusline and `ctx_insight` removed (D17).

## 10. Decided from issue evidence (no grill needed — override if you disagree)

| # | Decision | Evidence |
|---|---|---|
| E1 | Global mode `CONTEXT_MODE_PROJECT=global`, explicit only | #737 users rely on one shared DB |
| E2 | Journal per agent session (hooks write), server never writes session records | #1214 #1198 #1055 #1156 |
| E3 | (superseded: default `worktree`, Q6 r2) Search default `project`, session content included, ranking + labels | #895 #835 #827 #696 #1014 |
| E4 | Tool descriptions ≤ 2K tokens, CI-checked | #1031 (6.2K tokens on Pi) |
| E5 | (superseded by DECISIONS-r3 Q8: measured default, not 120 s) Default timeout 120 s, `timeoutMs`, kill tree, cancel via MCP | #959 #936 #947 #953 #1147 #968 #1082 #1182 |
| E6 | Hook matchers limited; ≤ 20 ms budget | #960 #1261 |
| E7 | Journal ≤ 5 MB/session; content dies with session DB (14 d); no lifetime stats store | #1156 #1079 #999 #1248 |
| E8 | HTTP daemon mode removed; no runtime npm install | #1162 #1174 #1280 |
| E9 | `context-mode uninstall` in v2.0 | #1058 #1016 #1005 |
| E10 | readOnlyHint on search/resume/stats only | #1048 |
| E11 | Pi/OMP/OpenClaw: no injected messages at all; session id from the plugin API | #1263 #1085 #1112 #864 |
| E12 | Parent death = stdin EOF on every OS; hook command `node "<launcher>" hook …` works in PowerShell/cmd/bash | #982 #993 #1100 |
| E13 | Install never removes entries it does not own; writes only the scope it was run in | #1235 #1239 #1220 #1160 #1215 |
| E14 | One install mode per agent; plugin + MCP both present = doctor error | #1186 |
| E15 | Launcher writes the PATH-resolved, non-versioned node path (e.g. `/opt/homebrew/bin/node`, not the Cellar path) | #1282 #1183 #1090 |
| E16 | `doctor --report` with secret redaction replaces `ctx-debug.sh` | #1242 #1141 |
| E17 | No search throttle; per-call byte budget instead | #769 #920 |
| E18 | Fetch honors standard proxy env vars | #1039 #1041 |
| E19 | Corruption = hard error naming `ctx_doctor`'s fix action (rename DB files aside) | #867 |
| E20 | PRs never commit bundles or generated files; CI rejects them | #995 #991 #1091 #980 #888 |
| E21 | ADRs are maintainer-only; contributor ADR files are not merged | P0 map (docs/adr/0013–0017) |
| E22 | Code echo removed; first line = summary; no echo env knob | #1067 #1047 #1127 |
| E23 | Firecrawl backend, pi-blackhole, LongHorizon, neuforge, hosted insights: not in v2.0 | #1184 #1192 #1046 #1045 #1065 |
| E24 | Live progress via MCP progress notifications (client decides how to render) | #1088 #1121 #1092 |
| E25 | Codex installs as a plain `config.toml` MCP entry, not a Codex plugin (plugin spawns in cache dir, no `${VAR}` expansion) | #1210, spike S0 |
| E26 | MCP `roots` is never used; each agent's source is env, `${workspaceFolder}` or spawn cwd | SEP-2577 (roots deprecated 2026-07-28), spike S0 |

## 11. Grill decisions (accepted 2026-10-13, as recommended)

| # | Decision |
|---|---|
| G1 | **Changed 2026-10-13:** no v1.x line. v1 is frozen; all PRs (incl. the 33 "M" candidates) close at v2; their fixes are B requirements in v2 |
| G2 | No tool-output replacement on any agent (Pi/OMP included); savings come from ctx_* tools only |
| G3 | Resume is the `ctx_resume` tool; risk "model skips the hint" accepted |
| G4 | 7 tools. **Changed 2026-10-13:** no user CLI and no npm. init/doctor/upgrade/uninstall are skills (`/context-mode:<name>`) that run one bundled script with `node` |
| G5 | Stats show bytes/tokens only; pricing catalog removed |
| G6 | Security policy from `~/.context-mode/policy.json` + `.context-mode/policy.json`; `context-mode policy import claude` is explicit |
| G7 | Windows `language:"shell"` = Git Bash; missing → hard error + doctor; PowerShell is its own language |
| G8 | v2.0 = existing 17 adapters + ZCode; others in v2.1 if official hook docs + conformance suite pass |
| G9 | **Changed 2026-10-13:** no npm. Distribution = git only (open: G12–G14) |
| G10 | OpenCode v2 plugin API only; OpenCode 1 users stay on context-mode 1.x |
| G12–G14 | **2026-10-13, KISS/YAGNI:** no CLI, no skills, no extra commands. Install/update = the host's own plugin/git mechanism (spike S2). No init/doctor/upgrade/uninstall/policy-import. Errors explain the fix in one line inside the tool result |
| G11 | **Superseded by G12–G14:** no `init`. Hosts without an automatic project source run in fixed global mode. Old text: No automatic project source: hosts with project config → `context-mode init` writes the absolute path; hosts without (Codex Desktop, JetBrains, OpenClaw) → fixed global mode, shown by doctor |

## 12. Removed in v2

Bun + bun:sqlite · better-sqlite3 · ensure-deps · heal scripts · `start.mjs` chdir/heal flow · `events.md` · snapshot injection · `<context_window_protection>` block · CLAUDE.md/AGENTS.md templates · hard denies (curl/wget/WebFetch/build tools) · statusline · `ctx_insight` · HTTP daemon · lifetime stats timer · `ps` liveness · WAL-mtime cleanup · global MCP-ready sentinel · search flood guard · runtime `npm install` · `ctx_doctor`/`ctx_upgrade` tools.

## 13. Tests and CI

- **Contract tests:** one per B row in the map (`test/contract/<n>.test.ts`), Given/When/Then from the map.
- **Adapter conformance:** recorded native payload fixtures per agent → decode/encode golden files; tool-name map round-trip.
- **Matrix:** macOS, Linux, Windows × Node 22, 24.
- **Budgets in CI:** hook ≤ 20 ms CPU; descriptions ≤ 2K tokens; server idle CPU = 0 after 60 s; bundle has no dynamic import and no JSON import attributes.
- **Release gate (manual, release.md):** real-agent smoke on CC, Codex, Gemini, Cursor, OpenCode, Pi.

## 14. Milestones

- **M0 Spikes:** S0 project source per agent · S1 plugin distribution ref.
- **M1 Core:** store, sandbox, lifecycle, tools + their contract tests.
- **M2 Reference adapters:** hook runtime, journal, policy, CC + Codex. Owner checkpoint before M3 starts: confirm the hook runtime contract, the journal schema, and the policy decision shape.
- **M3 Other hooks+mcp adapters:** Gemini, Cursor, Kiro, Qwen, Kimi, Copilot CLI, VS Code, JetBrains, agy, Zed.
- **M4 Plugin adapters:** OpenCode, Pi, OMP, OpenClaw.
- **M5 CLI + stats:** install, doctor, upgrade, uninstall, `ctx_stats`.
- **M6 Docs, then README.**
- **M7 Close-out:** comment + close every item with its outcome (needs your approval; outward-facing).

## 15. v2 layout (2026-10-13 update)

### 15.1 Agents in v2.0 — git-installable only

Kept (10): Claude Code, Codex CLI, Gemini CLI, Qwen Code, Copilot CLI, VS Code Copilot, Kiro, Antigravity/agy, ZCode (hooks+MCP) · Pi, OpenCode 2.x (plugin, in-process).
Removed (no git install or no users): Cursor (git import is Teams-only), Zed, JetBrains Copilot, Kimi (repo archived), Codex Desktop (closed, unknown), OpenClaw (no project source), OMP (5 open issues, Pi fork; pending G20), OpenCode 1.x.

### 15.2 Folder structure — one source of truth

```
src/
  core/                    # knows no agent
    events.ts              # canonical event + decision types = Claude Code hook schema
    tools/                 # one file per tool: schema + description + handler
      registry.ts          # the ONLY tool list; MCP server and plugins both read it
    sandbox/  store/  project/  journal/  policy/  stats/  lifecycle/
  adapters/
    table.ts               # ONE row per agent: install mode, project source, event-name map, tool-name map
    claude-code.ts         # identity mapping (canonical = CC)
    codex.ts gemini.ts qwen.ts copilot-cli.ts vscode.ts kiro.ts agy.ts zcode.ts   # ~30–80 lines: decode/encode only
    pi.ts opencode.ts      # in-process plugin glue → same core calls
  entries/
    server.ts              # MCP stdio: registry → MCP
    hook.ts                # `node hook.mjs <agent> <event>`: decode → policy/journal → encode
    pi.ts opencode.ts      # plugin entry files
build/
  manifests.ts             # GENERATES every host manifest + hooks config from adapters/table.ts
                           # (.claude-plugin, .codex-plugin, gemini-extension.json, agy plugin.json, …)
test/
  contract/<issue>.test.ts # one per B row of the issue map
  adapters/<agent>/        # recorded native payloads → golden decode/encode
release branch (CI output only, no package.json, no node_modules)
  server.mjs hook.mjs pi/index.js opencode/plugin.js + generated manifests
```

Rule: nothing host-specific is written by hand twice. Manifests, hook configs, matchers, tool-name maps and version fields all come from `adapters/table.ts` + `package.json` version at build time (replaces today's 11 hand-synced manifests).

### 15.3 Hooks used — four canonical events (Claude Code names)

| Canonical | Job | CC | Codex | Gemini | Qwen/ZCode/VS Code | Copilot CLI | Kiro | agy | Pi | OpenCode 2 |
|---|---|---|---|---|---|---|---|---|---|---|
| SessionStart | 1–2 line hint + `ctx_resume(id)` hint | SessionStart | SessionStart | SessionStart | SessionStart | sessionStart | – (verify) | verify | session_start | session.created |
| UserPromptSubmit | journal: user request | same | same | BeforeAgent | same | userPromptSubmitted | – | verify | before_agent_start | chat.message |
| PreToolUse | hint / user-policy deny | same | same | BeforeTool | same | preToolUse | PreToolUse | verify | tool_call | tool.execute.before |
| PostToolUse | journal: tool call, bytes, ctx_* credit | same | same | AfterTool | same | postToolUse | PostToolUse | verify | tool_result | tool.execute.after |

Not used: PreCompact (CC re-fires SessionStart with source=compact), Stop, SessionEnd (stdin EOF), Subagent*, PermissionRequest, PostToolBatch.

### 15.4 Worktree sharing (no setting)

Issues: #744 wants one repo = one project (stats split into 10 dirs). #1185 wants each parallel agent/worktree isolated. #895 wants own session first.
Answer — three fixed scopes, no knob:
- **Identity / stats:** repo (git common dir). All worktrees count as one project (#744).
- **Search default:** `worktree` — an agent sees only its own worktree's sessions (#1185). `scope:"project"` reads all worktrees; `scope:"session"` only this session. Ranking inside a scope: session first (#895).
- **Resume:** always one agent session.

### 15.5 Change 2026-10-13: Antigravity/agy removed
Reason (spike-hooks-verified.md): no SessionStart, no UserPromptSubmit, PostToolUse carries no tool output, current hooks config rejected (#1206). v2.0 agents = 10: Claude Code, Codex CLI, Gemini CLI, Qwen Code, Copilot CLI, VS Code Copilot, Kiro, ZCode, Pi, OpenCode 2. Lines above that list agy are superseded.

## 16. Round 3 changes (2026-10-14)

Each line supersedes the matching earlier PRD text.

- **Branch:** development on `v2`, built output on `release`, `main` frozen on v1 (ADR-0011).
- **MCP:** server targets spec 2026-07-28 and still answers 2025-xx `initialize` clients (ADR-0007).
- **Enforcement (replaces D10 "hints only"):** PreToolUse rewrites flood-prone commands to run through the sandbox wrapper; PostToolUse caps oversized output and indexes the rest; deny only from the user's policy (ADR-0008).
- **Compaction (changes D9):** one session-keyed state block ≤ 2 KB after compaction, per-agent path; resume = hint line; no injected memory, no role/intent classifier (ADR-0009).
- **Tools (replaces G4 "doctor/upgrade removed"):** 9 tools — ctx_execute, ctx_batch, ctx_index, ctx_search, ctx_resume, ctx_stats, ctx_doctor, ctx_upgrade, ctx_purge. User commands as skills: /ctx-stats, /ctx-doctor, /ctx-upgrade (ADR-0010, TECH-SPEC §3.9).
- **v1 users:** no data migration; doctor detects v1 leftovers, upgrade removes them (ADR-0011).
- **Live E2E:** by hand + RC tags only, no nightly; 6 required agents, 3 tier-2, VS Code contract-only (TECH-SPEC §6.9).

## 17. r3 decisions (2026-10-14)

All 19 answers in `docs/v2/review/DECISIONS-r3.md` are accepted and override earlier PRD text: external MCP output is routed (Q1); one 16 KB output cap (Q2); deny with the rewritten command, never allow+updatedInput (Q3); parse errors deny when a user rule could match (Q4); full v1 deny scope (Q5); WAL checkpoint by the last server + on close (Q6); retention = age + live PID + size cap (Q7); measured timeout, tree kill (Q8); background mode kept (Q9); Node minimum by spike (Q10); one project source per host (Q11); one cache-stable carrier on OpenCode/Pi (Q12); description cap in lint (Q13); main branch protection (Q14); keyless harness replaces tier2 smoke (Q15); uninstall as a ctx_upgrade mode (Q16); no-regex = runtime only (Q17); issues send maximum debug data, only secrets stripped (Q18); small calls (Q19).
New: ADR-0017: an E2E case at every step on Sonnet low; v1 users must not leave (R1–R8).

## 18. Changes (2026-10-15, r4 fixes)

§4/E19 corruption text now names `ctx_doctor`'s fix action instead of a deleted `--fix` CLI flag; `ctx_resume` takes `seq?` and its own pointers now resume by seq, not `ctx_search`; added an owner checkpoint at end of M2; §7 tool count fixed to 9, with `ctx_doctor`/`ctx_upgrade` listed as tools and only `ctx_insight` named as CLI-only, matching the r3 Q3b override.
