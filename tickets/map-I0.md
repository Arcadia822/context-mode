# Issue map I0 (44 issues) vs v2-decisions.md

| # | title (short) | agent/OS | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 1282 | Cursor MCP spawn fails, bare npx not on PATH | Cursor / Windows | B | Install writes absolute `node` path + bundled entry, never bare `npx` | Given Cursor on Windows with no npx on GUI PATH, When MCP + hooks start, Then both launch via absolute node path |
| 1280 | turndown missing, silent bg install fails | Claude Code / macOS | A | D2 (no ensure-deps/runtime installs; deps bundled) | Runtime npm install path removed; turndown ships in bundle |
| 1274 | OpenCode resume snapshot injected into other session | OpenCode / any | A | D9 (no snapshot injected; `ctx_resume(session)` is explicit) | claimLatestUnconsumedResume path disappears |
| 1269 | curl detector aborts whole compound command | Claude Code / any | A | D10 (no hard denies, hints only) | Deny path removed; command always runs |
| 1268 | Native ZCode adapter | ZCode / Windows | Q | D14 says requested new adapters are separate scope decisions | See Q1 |
| 1267 | Read tip re-injected every Read >50 KB (`??` fallback) | Claude Code / Linux | A | D11 + P1 (no per-tool tips; no fallback chains) | Read guidance block removed; routing only in tool descriptions |
| 1263 | Pi injects memory as role:"user" | Pi / any | A (partly B) | D9/D11 (no memory/snapshot replay into prompt) | B if Pi keeps 1–2 SessionStart lines: Given Pi, When context-mode adds a hint, Then it is a system/custom-role message, never role "user" |
| 1262 | parent-liveness spawns `ps` every 30 s | Claude Code / Linux | B | Liveness check must not spawn processes per tick | Given server running 1 h, When guard ticks, Then zero child processes are spawned (stdin close / signal only) |
| 1261 | Pre/PostToolUse hooks cost 55-70 ms CPU per Bash | Claude Code / Linux | B | D7/D8: bundled TS hooks, no DB; matcher limited; PostToolUse async where host allows | Given a plain `ls`, When hooks run, Then PreToolUse is not spawned (or <15 ms) and PostToolUse is async append-only |
| 1259 | intent classifier replayed as live directive on Pi | Pi / any | A | D9/D11 (no replay into prompt) | Replay block and `source="compaction"` literal removed |
| 1258 | DeepSeek Harness support | DSH Desktop | Q | D14 scope | See Q1 (no detail on hook API) |
| 1255 | opencode missing from clientInfo map, wrong store | OpenCode MCP / Linux | A | D3 + D4 (one shared root; no platform-probe for storage) | Storage path no longer depends on detected platform |
| 1254 | ctx_stats skips OpenCode (v1 layout only) | OpenCode / Linux | A | D3 + D17 (single store, stats reads own data only) | Multi-adapter importer removed |
| 1251 | ensure-deps npm retry storm, console windows | Codex / Windows | A | D2 (ensure-deps, better-sqlite3 removed) | Code path gone |
| 1248 | stats heartbeat reopens every session DB each minute | Claude Code / macOS | B | D3 reads + D17: stats must not open all DBs on a timer | Given 500 session DBs, When server idles 10 min, Then no DB file is opened and nothing is written |
| 1242 | ctx-debug.sh fails under POSIX sh | Codex / macOS | A | D2/D7 (shell scripts replaced by TS `ctx doctor`) | Script removed |
| 1226 | hooks.json has no default timeouts | Claude Code / Linux | B | Every shipped hook entry has a timeout | Given generated hook config for any adapter, Then each entry has a timeout field (<=10 s) |
| 1225 | vulnerable ip-address dep chain | all | B | Dependency audit (not yet discussed) | Given release build, When `npm audit --omit=dev` runs, Then zero high/critical |
| 1222 | bare `mcp__` matcher matches nothing (CC 2.1.195) | Claude Code / any | B | P3: matchers must be valid for CC regex semantics | Given hooks.json, When each matcher is tested against real tool names, Then each matches >=1; doctor checks this |
| 1221 | OMP hard-blocks curl in quotes/grep | OMP / any | A | D10 + P2 (no hard deny; one shared decider) | Adapter-local pattern list removed |
| 1219 | No docs for Codex Desktop install | Codex Desktop / Windows | B | D16 docs: one install page per host incl. Codex Desktop | Docs check: each supported host has an install section |
| 1217 | ctx_execute shell has PATH stripped to /usr/bin:/bin | any / Windows | B | Windows shell (not yet discussed): sandbox inherits parent PATH | Given Windows, When ctx_execute shell runs `gh --version`, Then it resolves |
| 1215 | project-scope plugin enabled globally by heal | Claude Code / macOS | A | D2 (heal scripts removed) | Self-heal Layer 4 gone; install never writes user settings |
| 1214 | server takes every project's events.md | all | A | D8 (events.md removed; server never moves journals) | Code path gone |
| 1213 | stats opens every session DB read-write | Claude Code / macOS | B | D3: sibling DBs opened read-only only | Given sibling DBs, When ctx_stats runs, Then every open is `readOnly` and mtimes stay unchanged |
| 1212 | PowerShell tool not routed; Bash nudge once | Claude Code / Windows | B | P2/P3: PowerShell treated as a shell tool like Bash | Given tool "PowerShell", When PreToolUse fires, Then same hint as Bash |
| 1210 | Codex Windows project dir falls back to plugin cache | Codex / Windows | B | D4: one fixed source (MCP roots or per-server resolve once); no rollout-mtime heuristic | Given Codex sessions A (dir X) and B (dir Y) 6 min apart, Then A allows X only and B allows Y only |
| 1208 | ctx_execute python/node fails with shell-script shims | any / Windows | B | Windows shell: runner resolution handles shims or gives exact error | Given only a pyenv-win shim, When ctx_execute python runs, Then it runs or the error names the shim |
| 1206 | agy rejects hooks.json (grouped Stop) | Antigravity CLI | B | Per-adapter hook config is schema-validated; doctor validates full file | Given generated agy hooks.json, When validated against agy schema, Then it passes |
| 1205 | Pi bridge on Bun spins, disk I/O error | Pi / macOS | A | D2 (Bun removed) + D3 (one writer per file) | Bun path and shared-writer race gone |
| 1204 | index-time preview + ctx_page tool | all | Q | Tool set consolidation not yet discussed | See Q2 |
| 1201 | OpenClaw capture breaks computed import paths | OpenClaw / Docker | B | D7 bundling: adapters use static imports only; init rejection handled | Given adapter bundle copied alone to a temp dir, When loaded, Then no ERR_MODULE_NOT_FOUND |
| 1200 | ctx_search rejects singular `query` | Claude Code / Linux | B | Schema and handler agree (one param form, P1) | Given each param the schema declares, When called, Then no validation error |
| 1199 | OpenCode 2.x plugin fails to load | OpenCode v2 | B | D14: OpenCode adapter targets v2 plugin API | Given OpenCode 2.x, When plugin loads, Then default export has id + setup |
| 1198 | ctx_* events credited to latest session | Claude Code / macOS | A | D8 (hooks write ctx_* work to caller's journal; server never writes) | getLatestSessionId heuristic gone |
| 1196 | ensure-deps re-codesigns .node every hook | Claude Code / macOS | A | D2 | Code path gone |
| 1193 | Bun seed writes ABI-mismatched cache | Linux | A | D2 | Code path gone |
| 1192 | integrate with pi-blackhole | Pi | C | later | Third-party package interop; not core v2.0 |
| 1191 | healScript version filter unanchored | Claude Code / macOS | A | D2 | heal scripts removed |
| 1188 | ensure-deps dlopen then rebuild, SIGSEGV | Linux | A | D2 | Code path gone |
| 1187 | OpenCode V2 support | OpenCode v2 / Windows | D | Duplicate of #1199 (and PR #1171) | Track under 1199 |
| 1186 | Windows ctx_stats 4 s + 1.6 s execSync probes; coexistence detector | OpenCode / Windows | B | D17 stats + no startup execSync probes | Given Windows, When ctx_stats called, Then <300 ms; startup spawns no sync probes. Coexistence (plugin+MCP both expose ctx_*) needs Q3 |
| 1185 | multi-agent context isolation per worktree | Worktrunk / any | C | in v2.0, covered by D3/D4/D12 (per-session writes, worktree label, ranking) | Given two worktrees, When ctx_search, Then hits labelled by worktree and own session ranked first |
| 1184 | fetch via Firecrawl API | sandboxed agents | Q | D15 says no external API calls | See Q4 |

## New decisions needed
- **Q1 New adapters (#1268 ZCode, #1258 DeepSeek Harness):** add in v2.0, or later? ZCode is CC-compatible (cheap). DSH has no hook spec in issue.
- **Q2 Tool set (#1204):** add `ctx_page` / index-time preview, or keep pointer-only output?
- **Q3 Dual registration (#1186 comment):** when an agent has both plugin and MCP server, which one owns ctx_* tools?
- **Q4 Fetch backend (#1184):** does D15 forbid a user-configured fetch proxy (Firecrawl URL)? It is user infra, not an LLM call.
- **Q5 Windows shell (#1217, #1208, #1212, #1282):** Git Bash vs PowerShell vs cmd as the one shell path.

## Contradictions with v2-decisions.md
- None break a decision. Notes:
  - #1210 shows Codex sets no workspace env var; D4 "one fixed source" for Codex must be MCP roots (unverified that Codex answers roots/list) or per-server resolve once. D4 stays OPEN until tested.
  - #1263: if Pi keeps SessionStart lines (D11), Pi has no system-role hook path today; D11 needs a Pi-specific carrier.
  - #1261: D8 keeps PostToolUse on every tool call; per-call process cost stays unless hooks are async. Not a contradiction, but a perf budget is needed.
