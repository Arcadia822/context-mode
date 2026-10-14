# Open PR map P0 (45 PRs) vs v2-decisions.md

All authors are external contributors (no maintainer or bot PRs). CI: no check runs on any PR (fork workflows wait for maintainer approval). Only #1228 has a review approval.

| # | title (short) | author | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 1295 | Unicode auto-memory word boundaries | rudycelekli | B | Memory search must match non-ASCII words | Given instruction file with Russian word, When auto-memory search runs that word, Then hit returned. Test reusable. |
| 1294 | contained dot-prefixed symlink targets (`..notes`) | rudycelekli | B (+M) | Path containment checks components, not prefix | Given symlink to `./..notes`, When dir indexed, Then included; `../x` still rejected. Test reusable. |
| 1293 | unlink dangling cache breadcrumbs | rudycelekli | A | D2/D7 (heal scripts, sessionstart.mjs removed) | Plugin-cache self-heal gone in v2 |
| 1292 | nested .gitignore in dir walks | rudycelekli | B | Dir index honors nested .gitignore + negations | Given `a/.gitignore` ignoring `x`, When index dir, Then `a/x` absent. Reusable. |
| 1291 | globstar zero-depth (`docs/**/*.md`) | rudycelekli | B (+M) | `**` matches zero dirs | Given `docs/top.md`, When include `docs/**/*.md`, Then included. Reusable. |
| 1290 | session-db bundle off PreToolUse path | oriastanjung | A | D8 (hooks have no DB) | v2 hooks never load DB |
| 1287 | stats: say why adapter Skipped | Micahscodingjourney | C (later) | D17 stats redesign | Stats design not yet decided |
| 1286 | executor: deleted cwd + FORCE_COLOR plain | Kenmege | M + B | Exec survives removed project dir; output has no ANSI | Given cwd deleted, When ctx_execute, Then runs, no crash. Given FORCE_COLOR=1, Then no escape codes. Reusable. |
| 1285 | Cursor Windows PATH docs | Ethereal49 | C (v2 docs) | D16 | Fold into docs/; README rewrite |
| 1284 | native Qoder plugin | shouldnotappearcalm | C (later) | D14 says new adapters are separate scope | Big, touches mjs hooks + bundle; rebuild on v2 adapter contract |
| 1283 | Gaia badge in README | mbtiongson1 | C (reject) | D16 | Promo badge; README rewritten |
| 1281 | report missing fetch deps / failed bg installs | csorbalazs306 | A | D2 (ensure-deps, background installs removed) | No runtime installs in v2 |
| 1279 | OpenCode: no resume injection into running session | rahul05ranjan | A / B | D9 (no snapshot injection) | Requirement kept: resume hint only at real session start. Given running session, When plugin event, Then no hint. |
| 1278 | bound dep-install retries, hide Win consoles | rahul05ranjan | A (+M?) | D2 | ensure-deps/heal-better-sqlite3 removed; M only if v1 install loops hit users |
| 1277 | procfs parent PID on Linux | rahul05ranjan | B | D6 owner-PID liveness needs cheap check | Given Linux, When parent pid read, Then no spawn of `ps`. Reusable. |
| 1276 | detect OpenCode from MCP clientInfo | rahul05ranjan | B | D4 one fixed source per adapter | Given clientInfo.name=opencode, Then adapter=opencode. Reusable. |
| 1275 | batch: query pointers instead of repeated excerpts | fl4p | C (v2.0) | Tool output design | Part of tool set consolidation (not discussed) |
| 1272 | subagent routing via SubagentStart | blentz | A | D11 (no prompt rewrite, no CLAUDE.md blocks) | v2 routing only in tool descriptions |
| 1271 | JSONC comment boundaries | ac1982 | M + B | Config edit must not break `//` inside strings | Given JSONC with URL string, When parse/edit, Then comments and strings kept. Reusable. |
| 1270 | once-per-session guidance for big Read | HootRock | A | D10 + D7 (routing.mjs rewrite; hints only) | Keep idea: hint once per session as v2 hint test |
| 1266 | Pi doctor uses real Pi paths | zichen0116 | B | Doctor checks per-adapter real paths (D4/D13) | Given Pi install, When doctor, Then checks `~/.pi/...`. Reusable. |
| 1265 | route PowerShell tool + Bash nudge cadence | rubenmarcus | B (+C) | PowerShell tool must get same hints as Bash (P2) | Given PowerShell call, When PreToolUse, Then same hint as Bash. Cadence part = hint design. |
| 1264 | Pi: inject context as system role | fl4pj4ck | B (+M) | Injected hints never use user role | Given SessionStart on Pi, Then message role=system. Reusable. |
| 1256 | MCP readiness per Claude session | phant0um | A | D8 (hooks no server socket/readiness files) | |
| 1253 | ensure-deps skip cache swap | phant0um | A | D2 | |
| 1252 | stats: don't count binary reads as saved | phant0um | B | Stats: savings only for text actually kept out | Given binary read, Then saved_bytes=0. Reusable for stats. |
| 1250 | shell exit 1 + stderr = error | agammann | M + B | Exit classify | Given `exit 1` with stderr, Then isError=true. Reusable. |
| 1249 | Pi: incremental UTF-8 decode of MCP stdout | aniruddhaadak80 | M + B | Multi-byte chars survive chunk split | Given split emoji over 2 chunks, Then decoded intact. Reusable. Body says "Fixes #000". |
| 1247 | re-exec scripts under bash for sh callers | sjoerd2025 | M | v1 crash fix; v2 scripts TBD | Supersedes #1243 |
| 1246 | Pi: MCP bridge per session workspace | koenvg | B | D4: project from session workspace, not process cwd | Given 2 Pi sessions in 2 dirs, Then 2 bridges, right project. Reusable. |
| 1245 | refresh express-rate-limit (ip-address CVE) | ChrisPrapas | M (security) | v1 security fix; only bun.lock changed | Check package-lock too; D2 drops bun.lock in v2 |
| 1244 | website URL in codex plugin.json | youngledo | M | trivial metadata | |
| 1243 | ctx-debug.sh re-exec under bash | sx4im | D | Superseded by #1247 | |
| 1241 | attribute MCP work to caller session | agammann | A / B | D8 (server never writes session records; PostToolUse credits ctx_* calls) | Requirement already in D8. Close. |
| 1240 | antigravity Stop hook flat form | rubenmarcus | B (+M) | Adapter config must match agy schema | Given generated hooks.json, Then agy accepts it. Reusable. |
| 1239 | gemini: keep sibling hooks on upgrade | rudycelekli | M + B | Install/upgrade never removes user hooks | Given user hook in settings, When upgrade, Then still present. Reusable. |
| 1238 | fetch: nested fenced code intact | rudycelekli | B (+M) | Markdown chunker keeps nested fences | Given ```` with inner ```, Then one block. Reusable. |
| 1237 | executor: Rust cwd + sandbox lifecycle | rudycelekli | B (+M) | Rust exec runs in project cwd, temp dir cleaned | Reusable. |
| 1236 | stats: probe session schema read-only | rudycelekli | A / B | D3 read-only sibling opens; D13 no v1 migration | Requirement: reads never migrate/write other DBs. Given sibling DB, When stats, Then file unchanged. |
| 1235 | copilot-cli: keep custom hooks on upgrade | rudycelekli | M + B | Same as #1239 | Reusable. |
| 1234 | codex: rollout timestamp over mtime (Windows) | STiFLeR7 | A | D4 (one fixed source; no rollout-file staleness heuristic), P1 | |
| 1231 | restore external MCP routing `mcp__.*` | Yi-111-a | B (+M) | Hints must cover external MCP tools | Given `mcp__foo__bar` call, Then PreToolUse fires. Reusable. |
| 1230 | ctx_search schema declares `query` | JoAdo07 | M + B | Schema declares every accepted field | Given strict host, When `{query:"x"}`, Then works. Reusable. |
| 1229 | scope session-event indexing to project | ayojeges | A (+M) | D8 (events.md removed), D3 | Real cross-project leak in v1: M worth it |
| 1228 | default hook timeouts | rubenmarcus | M + B | Every shipped hook has a timeout | Approved. Test reusable as-is. |

## Merge-now candidates (v1.x)
1228, 1230, 1229, 1250, 1271, 1286, 1249, 1239, 1235, 1245 (security), 1247 (close 1243), 1231, 1264, 1244. Second tier (small, safe): 1291, 1294, 1238, 1237, 1240.
All need CI approval first (no runs yet).

## New decisions needed
- Is v1.x "security only" (D1) or also crash/data-loss fixes? Merge list above assumes the latter.
- Install/upgrade rule: never remove user-owned hook entries (1235, 1239).
- Hook timeouts in v2 (1228): fixed values per event?
- Hint cadence: once per session vs repeat (1265, 1270).
- External MCP tools (`mcp__*`) in hint scope? (1231)
- New adapters policy (Qoder 1284).
- ADR files in PRs (docs/adr/0013–0017): accept contributor ADRs?

## Contradictions with v2-decisions.md
- D1 "security fixes only" vs many real crash/leak fixes waiting (1229, 1286, 1249).
- D4 "one fixed source" vs 1276 (clientInfo detection) and 1234 (rollout heuristics): v2 must pick the source per adapter.
- D9 hint at SessionStart vs 1279: hint must not repeat in running OpenCode sessions.
