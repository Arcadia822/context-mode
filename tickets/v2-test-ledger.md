# v2 test ledger — bug ids cited by the 210 v1 test files

Generated 2026-10-14 from the clone at `1a1bed13` (`tests/**/*.test.*`, regex `#NNN`). Its `tests/` is identical to `origin/main` @ `5869f4fa`; the only diff is `stats.json`. Titles and states come from `tickets/data/isall.json` and `prall.json` (590 issues, 659 PRs, snapshot 2026-10-14 01:59 +03, taken before issues and PRs were disabled).

Gate format: when a row is reviewed, its last column gets exactly one of `GPn/<case>`, `REMOVED:<ADR or G/E id>`, or `N/A`.

**GP column = keyword suggestion from the title, not a reviewed assignment.** Review every row before the deletion gate (TECH-SPEC §7.5). `NOT AN ISSUE/PR` = the number matched the regex but is not an issue or PR (line refs, ports, etc.).

Summary by suggested GP: REMOVED 56 · GP4 execute 44 · UNASSIGNED 22 · GP8 concurrency 21 · GP3 hooks 19 · GP1 install/config 17 · GP9 lifecycle 16 · GP6 journal/resume 13 · GP5 index/search 7 · GP7 scope 3 · NOT AN ISSUE/PR 3

By kind/state: issue/CLOSED 164 · PR/MERGED 46 · issue/OPEN 1 · PR/CLOSED 7 · -/- 3

| # | kind | state | v2 map | suggested GP | title | cited in |
|---|---|---|---|---|---|---|
| 16 | issue | CLOSED |  | UNASSIGNED | Swift support | adapters, util |
| 18 | PR | MERGED |  | GP8 concurrency | fix: use FTS5 highlight() for stemming-aware snippet extraction | util |
| 19 | issue | CLOSED |  | UNASSIGNED | Github Copilot and VS Code | analytics |
| 23 | issue | CLOSED |  | GP5 index/search | `search` returns low-relevance results for multi-word queries (OR instead of AND semantics | core |
| 38 | issue | CLOSED |  | GP4 execute | [Feature]: Support gradle language commands for Java and Kotlin languages | hooks |
| 42 | issue | CLOSED |  | UNASSIGNED | Feature Request: Official Codex support | session |
| 45 | issue | OPEN | D | UNASSIGNED | Beta testers wanted — 15 platforms × 3 operating systems | core, executor, integration, util |
| 67 | issue | CLOSED |  | GP4 execute | [Feature]:  Deduplicate/replace output from repeated command executions to prevent stale c | core |
| 74 | PR | CLOSED |  | UNASSIGNED | Test impl model | session |
| 79 | issue | CLOSED |  | GP8 concurrency | PreToolUse hooks are too invasive — blocks WebFetch, replaces curl/wget, injects prompts i | core |
| 94 | issue | CLOSED |  | REMOVED | Doctor reports PreToolUse/SessionStart as FAIL when hooks are registered via plugin hooks. | adapters |
| 99 | PR | CLOSED |  | GP4 execute | feat(executor): multi-file and directory mode for ctx_execute_file | session |
| 117 | issue | CLOSED |  | GP3 hooks | Session continuity hooks silently fail — build/session/ directory missing from marketplace | session-hooks-smoke.test.ts |
| 123 | issue | CLOSED |  | REMOVED | [Feature]: OpenClaw Plugin Support | session |
| 148 | issue | CLOSED |  | REMOVED | [Bug]: better-sqlite3 NODE_MODULE_VERSION mismatch with concurrent sessions using differen | core, hooks |
| 155 | issue | CLOSED |  | UNASSIGNED | [Bug]: Context Mode should not take over cc tool call that would run inside subagents | core |
| 163 | issue | CLOSED |  | GP1 install/config | [Opencode]: Plugin works but... | core |
| 166 | issue | CLOSED |  | GP8 concurrency | curl/wget hook blocks binary downloads with -o flag | hooks |
| 168 | issue | CLOSED |  | UNASSIGNED | MCP server not working on OpenCode | core |
| 172 | issue | CLOSED |  | GP3 hooks | SessionStart hook fails on every session: missing module in both v1.0.15 and v1.0.51 | core |
| 181 | issue | CLOSED |  | GP6 journal/resume | Auto-update deletes plugin cache directory used by active session | core, hooks |
| 183 | PR | MERGED |  | GP6 journal/resume | fix: defer AGENTS.md write to session_start to avoid cwd pollution | core |
| 185 | issue | CLOSED |  | REMOVED | [Bug]: ctx-upgrade fails with spawnSync /bin/sh ETIMEDOUT when invoked inside Claude Code | core |
| 186 | issue | CLOSED |  | GP4 execute | [Bug]: ctx_execute temp script.sh files auto-opened as VS Code tabs | core |
| 187 | issue | CLOSED |  | GP3 hooks | [Bug]: SessionStart:startup hook error | adapters, core |
| 190 | PR | MERGED |  | REMOVED | fix: use process.execPath and probe ~/.bun/bin for snap/PATH-limited envs | core, hook-runtime-resolution.test.ts, runtime.test.ts |
| 203 | issue | CLOSED |  | GP4 execute | Feature Request: Support custom Node.js path via environment variable | hooks |
| 206 | issue | CLOSED |  | REMOVED | FTS5/better-sqlite3: native binding missing on macOS global npm install with ignore-script | hooks |
| 218 | issue | CLOSED |  | GP8 concurrency | MCP server crashes under multi-session SQLite contention (SQLITE_BUSY) | store.test.ts |
| 225 | issue | CLOSED |  | GP3 hooks | Codex PostToolUse hook fails: `context-mode hook codex posttooluse` is not a valid CLI sub | core, hooks |
| 228 | issue | CLOSED |  | GP8 concurrency | Support alternative SQLite backends (node:sqlite) to avoid native addon SIGSEGV crashes | core, util |
| 229 | issue | CLOSED |  | GP3 hooks | PostToolUse hook matcher "" fires on ALL tools (TaskUpdate, TaskCreate, etc.) causing fals | adapters |
| 230 | issue | CLOSED |  | GP8 concurrency | Agent gets stuck when WebFetch is blocked but ctx_fetch_and_index MCP tool is unavailable | hooks |
| 233 | issue | CLOSED |  | GP6 journal/resume | Skip ctx_commands injection in subagent sessions | hooks |
| 236 | issue | CLOSED |  | GP9 lifecycle | Lifecycle guard stdin listeners cause spurious MCP -32000 Connection closed | lifecycle.test.ts, server-stdin-eof-exit.test.ts |
| 241 | issue | CLOSED |  | GP3 hooks | "Task" PreToolUse hook matcher incorrectly intercepts TaskCreate/TaskUpdate/TaskList todo  | adapters, core, hooks |
| 242 | issue | CLOSED |  | GP9 lifecycle | fix(hooks): AfterTool hang on large output or stdin stall in Gemini CLI | hooks |
| 243 | PR | CLOSED |  | GP8 concurrency | fix: wrap insertEvent with withRetry for concurrent PostToolUse hooks | session, util |
| 244 | issue | CLOSED |  | GP4 execute | MCP server dies on heavy ctx_execute workloads | session, store.test.ts |
| 247 | issue | CLOSED |  | REMOVED | ctx_doctor MCP tool crashes the server mid-session | core |
| 253 | PR | MERGED |  | GP4 execute | fix: use relative path in .mcp.json to silence CLAUDE_PLUGIN_ROOT warning | adapters, core, scripts, util |
| 256 | issue | CLOSED |  | GP4 execute | ctx_batch_execute rejects command objects missing 'label' field (common LLM output) | core |
| 289 | issue | CLOSED |  | GP4 execute | Hooks ignore CLAUDE_CONFIG_DIR — hardcode ~/.claude paths | hooks |
| 298 | issue | CLOSED |  | GP6 journal/resume | guidanceOnce() throttle does not work on Windows — guidance injected on every tool call in | guidance-throttle.test.ts, hooks |
| 299 | issue | CLOSED |  | UNASSIGNED | [Feature]: hide initial output | hooks |
| 311 | issue | CLOSED |  | GP9 lifecycle | Zombie MCP server processes consume 50-60% CPU each after session close | lifecycle.test.ts |
| 322 | PR | CLOSED |  | UNASSIGNED | fix: claude code startup error | hooks |
| 331 | issue | CLOSED |  | REMOVED | SIGSEGV coredumps from better-sqlite3 probe in ensure-deps.mjs on Node v24 (gap left by #2 | core, hooks, util |
| 344 | issue | CLOSED |  | REMOVED | Windows: spawnSync npm ENOENT/EINVAL during upgrade (Node v20+) | session |
| 347 | issue | CLOSED |  | GP8 concurrency | Regression in #230: PPID mismatch — mcpRedirect swallows all redirects when hook spawned v | hooks |
| 350 | issue | CLOSED |  | GP4 execute | ctx_index(path) indexes 0 sections when content is an empty string | store.test.ts |
| 365 | PR | MERGED |  | GP4 execute | fix(mcp): resolve ctx_index relative paths from project dir | core |
| 367 | PR | MERGED |  | GP5 index/search | feat: unified persistent memory & timeline search | core |
| 369 | issue | CLOSED |  | GP4 execute | fix: Windows bash shell — auto-deployed hook fails with bare `node` command (cjs/loader:14 | adapters, hook-runtime-resolution.test.ts, hooks |
| 372 | issue | CLOSED |  | REMOVED | SessionStart cache-heal hook fails on Windows + Git Bash when cwd is on non-C: drive (MSYS | adapters, hooks |
| 376 | PR | CLOSED |  | GP4 execute | feat(adaptation): enhance platform detection and cache path handling … | core, opencode-plugin.test.ts, session |
| 378 | issue | CLOSED |  | GP3 hooks | Windows Claude Code: repeated hook loader failures when plugin uses  | core, hooks |
| 384 | issue | CLOSED |  | GP4 execute | [Bug]: Shell execution silent/no output on Windows + .sh file association popup | executor.test.ts |
| 388 | issue | CLOSED |  | GP9 lifecycle | Zombie MCP server processes spin at ~95% CPU after session close (v1.0.103) — likely the u | lifecycle.test.ts, server-stdin-eof-exit.test.ts |
| 398 | PR | MERGED |  | GP6 journal/resume | fix(sessionstart): filter resume events by session id (cross-session bleed) | session |
| 401 | PR | MERGED |  | GP4 execute | v1.0.104 — Persistent stats, status line, and cross-platform shell hardening | analytics, core, runtime.test.ts, session, statusline-sqlite.test.ts |
| 406 | issue | CLOSED |  | GP4 execute | [Feature]: Server-enforced timeout policy for long-running build commands in execute tools | core, executor.test.ts, hooks |
| 408 | issue | CLOSED |  | REMOVED | Windows install can leave better-sqlite3 native binding missing in v1.0.107 | core, hooks, util |
| 410 | PR | MERGED |  | REMOVED | fix(install): self-heal missing better-sqlite3 binding on Windows (#408) | hooks |
| 411 | issue | CLOSED |  | GP4 execute | Cached .mcp.json hardcodes path to PREVIOUS version start.mjs — breaks reconnect after cle | cli, core, hooks, scripts, util |
| 413 | issue | CLOSED |  | GP6 journal/resume | [Feature]: Make it work with /resume | session |
| 414 | issue | CLOSED |  | REMOVED | Windows: intermittent UserPromptSubmit/SessionStart hook errors while ctx-doctor passes | core, hooks |
| 415 | issue | CLOSED |  | GP3 hooks | pretooluse.mjs over-deletes settings.json: drops sibling user hooks when matcher contains  | adapters, core |
| 418 | issue | CLOSED |  | REMOVED | `/ctx-upgrade` never `git pull`s the marketplace clone — installs stay frozen at the versi | core |
| 424 | PR | MERGED |  | REMOVED | fix(detect): update kilo platform detection to check KILO=1 and KILO_PID | adapters |
| 426 | issue | CLOSED |  | GP8 concurrency | Pi extension registers 0 tools — routing block tells LLM to use ctx_execute/ctx_search but | pi-extension.test.ts |
| 435 | PR | MERGED |  | GP7 scope | Fix worktree suffix project root detection | hooks |
| 441 | issue | CLOSED |  | REMOVED | Security: execSync string interpolation enables shell injection in ctx_insight | core |
| 442 | issue | CLOSED |  | GP4 execute | Security: ctx_index reads arbitrary file paths without deny-policy enforcement | core, store-directory.test.ts, store.test.ts |
| 448 | PR | MERGED |  | GP6 journal/resume | fix(opencode-plugin):add structured logging, remove per-session dedup sets, tighten plugin | opencode-plugin.test.ts |
| 451 | PR | MERGED |  | GP4 execute | fix(security): apply Read deny-policy to ctx_index path argument (#442) | security.test.ts |
| 452 | PR | MERGED |  | REMOVED | fix(security): replace ctx_insight execSync interpolation with spawnSync + tighten port sc | core |
| 453 | issue | CLOSED |  | GP6 journal/resume | Claude Code adapter ignores $CLAUDE_CONFIG_DIR — session data lands in ~/.claude | adapters, hooks, util |
| 454 | issue | CLOSED |  | GP9 lifecycle | Windows: commandExists('python3') matches Microsoft Store launcher stub → executor spawns  | guidance-throttle.test.ts, hooks, runtime.test.ts |
| 460 | PR | MERGED |  | GP1 install/config | fix(adapters): honor CLAUDE_CONFIG_DIR in Claude Code adapter (#453) | adapters, analytics, core, security.test.ts, util |
| 461 | issue | CLOSED |  | GP8 concurrency | FTS5 broken on Linux + Node 22.5+: Mr() picks node:sqlite which lacks FTS5 module | core, store.test.ts, util |
| 463 | issue | CLOSED |  | GP4 execute | Feature: user-configurable Bash command allowlist to skip flood-warning nudge | core, guidance-throttle.test.ts, hooks |
| 466 | issue | CLOSED |  | UNASSIGNED | Security policies silently fail-open when build/security.js is missing | hooks |
| 468 | PR | MERGED |  | UNASSIGNED | Fix/security fail open build missing | hooks |
| 469 | PR | MERGED |  | REMOVED | fix(ctx_insight): cap helper spawnSync + locale-independent Windows netstat parser | core |
| 470 | PR | MERGED |  | GP4 execute | fix(routing): skip Bash nudge for structurally-bounded commands (#463) | core |
| 472 | PR | MERGED |  | UNASSIGNED | fix(pi): bridge MCP tools into pi.registerTool() so the LLM can call them (#426) | pi-extension.test.ts |
| 473 | issue | CLOSED |  | GP1 install/config | Feature request: env var(s) to configure storage directory(ies) | adapters, pi-extension.test.ts |
| 476 | PR | MERGED |  | GP5 index/search | fix(security): close DNS rebinding gap in ctx_fetch_and_index SSRF guard | core |
| 482 | issue | CLOSED |  | GP1 install/config | [Feature]: Make normal-response communication style configurable | core, session |
| 487 | PR | MERGED |  | GP8 concurrency | fix(opencode): remove duplicate routing block injection and AGENTS.md capture | opencode-plugin.test.ts |
| 489 | PR | MERGED |  | REMOVED | feat(cursor): add Marketplace plugin packaging | adapters |
| 492 | PR | MERGED |  | GP3 hooks | [codex] add compact hook support | adapters |
| 506 | issue | CLOSED |  | REMOVED | Windows: spawn bun ENOENT when Bun installed via npm | hook-runtime-resolution.test.ts, runtime.test.ts |
| 511 | issue | CLOSED |  | UNASSIGNED | Dynamic require of "node:fs" is not supported | scripts, util |
| 513 | PR | MERGED |  | GP7 scope | fix(core): make project-dir transcript fallback ESM-safe | util |
| 514 | issue | CLOSED |  | REMOVED | Node 26 silently skips better-sqlite3; /ctx-upgrade does not recover | cli, util |
| 515 | - | - |  | NOT AN ISSUE/PR |  | statusline-sqlite.test.ts, statusline.test.ts, util |
| 516 | issue | CLOSED |  | GP1 install/config | [Bug]: Fork bomb in pi adapter: mcp-bridge.ts:76 spawns pi binary recursively | adapters |
| 517 | issue | CLOSED |  | GP4 execute | Feature: extend SAFE_COMMAND_PATTERNS with uname / realpath / ln / id | core |
| 520 | - | - |  | NOT AN ISSUE/PR |  | core, session |
| 521 | - | - |  | NOT AN ISSUE/PR |  | core, util |
| 523 | issue | CLOSED |  | REMOVED | Upgrade leaves stale Temp directory path in .claude-plugin/plugin.json mcpServers.args — M | cli, scripts, util |
| 528 | PR | MERGED |  | REMOVED | fix(ctx-upgrade): stop baking tmpdir path into hooks.json | hooks, util |
| 529 | issue | CLOSED |  | GP3 hooks | PreToolUse matchers miss external MCP namespaces; raw output enters context | adapters, hooks |
| 531 | issue | CLOSED |  | GP6 journal/resume | `.mcp.json` ships `./start.mjs` (relative) — Claude Code spawns from session CWD, MODULE_N | adapters, cli, core, hooks, scripts, util |
| 532 | PR | MERGED |  | GP3 hooks | feat(hooks): route external MCP tools through PreToolUse | adapters |
| 533 | issue | CLOSED |  | REMOVED | v1.0.119 better-sqlite3 rebuild fails when conda python3 is first in PATH (macOS arm64, No | util |
| 534 | issue | CLOSED |  | GP9 lifecycle | v1.0.121: nested pi --help spawns orphaned MCP servers spinning at 100% CPU | adapters, server-stdin-eof-exit.test.ts |
| 535 | issue | CLOSED |  | UNASSIGNED | [Feature]: UserPromptSubmit extract methods fail for non-English (e.g., Chinese) user  mes | session |
| 537 | PR | MERGED |  | GP1 install/config | fix: eliminate DEP0190 DeprecationWarning on Windows | runtime.test.ts |
| 539 | issue | CLOSED |  | GP3 hooks | Platform misdetection: VSCode-hosted Claude Code identified as Copilot, writes .github/hoo | adapters |
| 540 | PR | MERGED |  | REMOVED | fix(ensure-deps): skip rebuild when binary already loads on modern Node | core, util |
| 542 | issue | CLOSED |  | REMOVED | [Bug]:  `ctx_upgrade` misdetects Pi Coding Agent as Cursor | adapters, core, util |
| 543 | issue | CLOSED |  | REMOVED | upgrade: Native addon ABI cache missing when upgrade CLI runs under Bun runtime | core, hook-runtime-resolution.test.ts |
| 545 | issue | CLOSED |  | GP7 scope | Pi: `ctx_*` commands run in a completely different repo than the active worktree | adapters, core, integration, util |
| 546 | PR | MERGED |  | GP4 execute | feat(runtime): add C# support via dotnet-script | executor.test.ts |
| 547 | issue | CLOSED |  | GP3 hooks | Bug: Codex PreToolUse hook matcher uses unsupported regex lookahead | adapters |
| 548 | issue | CLOSED |  | REMOVED | ctx_doctor reports "Hook script: FAIL" when plugin path contains a space (Windows) | adapters, core |
| 550 | issue | CLOSED |  | REMOVED | 1.0.123 npm tarball missing server.bundle.mjs and start.mjs — MCP server silently fails on | adapters, core |
| 551 | issue | CLOSED |  | REMOVED | node:sqlite not used on macOS with Node.js 26 — better-sqlite3 fails to compile | core, util |
| 556 | issue | CLOSED |  | GP9 lifecycle | MCP server crashes with exit 139 (SIGSEGV) on first tool call from Claude Code (Linux) | core, util |
| 558 | issue | CLOSED |  | GP1 install/config | Marketplace plugin install (v1.0.126) missing build/security.js — silent fail-open; CONTEX | core, hooks |
| 559 | issue | CLOSED |  | REMOVED | ctx-upgrade leaves old server process running (zombie instance on upgrade) | cli, executor.test.ts, util |
| 560 | issue | CLOSED |  | GP8 concurrency | No exclusive lock on SQLite database — multiple server instances cause unbounded WAL growt | adapters, util |
| 561 | issue | CLOSED |  | UNASSIGNED | Pi bridge preserves claude-code identification env vars — spawned server misdetects as cla | adapters, util |
| 563 | issue | CLOSED |  | UNASSIGNED | [Bug]: context-purge has issue reported by claude code | core |
| 564 | issue | CLOSED |  | REMOVED | Linux: SIGSEGV on first tool call caused by node/bun runtime mismatch (with workaround) | core, scripts, util |
| 567 | issue | CLOSED |  | UNASSIGNED | [Bug]: Token usage not reduced when using context-mode with VS Code Copilot | hooks |
| 574 | issue | CLOSED |  | REMOVED | [Feature]: Plugin-only tool registration for ts-plugin adapters (OpenCode, KiloCode, OpenC | adapters, core, opencode-plugin.test.ts |
| 577 | issue | CLOSED |  | REMOVED | cache-heal hook hardcodes ~/.claude/ — doesn't respect CLAUDE_CONFIG_DIR | util |
| 582 | PR | MERGED |  | GP3 hooks | fix(linux): normalize hooks.json on Linux so bare node resolves for /bin/sh | hooks |
| 583 | issue | CLOSED |  | GP9 lifecycle | Pi ctx_* tools become stale after MCP idle shutdown (regression in 1.0.132) | adapters |
| 602 | PR | MERGED |  | GP9 lifecycle | revert: lifecycle idle-shutdown (#568 + #595) — restore tools on 12 hosts | lifecycle.test.ts |
| 603 | issue | CLOSED |  | GP3 hooks | Codex: duplicate context-mode hooks plus runaway codex-tui.log; MCP transport closed until | adapters |
| 604 | issue | CLOSED |  | GP4 execute | hooks.json keeps previous-version directory path after Claude Code plugin auto-update — ev | core, hooks |
| 609 | issue | CLOSED |  | GP1 install/config | .mcp.json missing from new version dir after auto-update — MCP server boots from stale dir | cli, core, hooks, scripts, util |
| 613 | issue | CLOSED |  | REMOVED | [Bug]: `ctx-upgrade` writes machine-local absolute Windows paths into `.github/hooks/conte | adapters, core, scripts |
| 618 | PR | CLOSED |  | GP1 install/config | fix(install): sweep stale .mcp.json post auto-update (closes #609) | core |
| 620 | PR | MERGED |  | GP3 hooks | fix(family-A): persistence-tier rules — drop stale .mcp.json + portable Tier C hooks | adapters, core, scripts |
| 621 | issue | CLOSED |  | GP4 execute | [Bug]: ctx_batch_execute handler receives undefined commands parameter from OpenCode adapt | opencode-plugin.test.ts |
| 623 | issue | CLOSED |  | GP1 install/config | v1.0.137+: MCP server no longer exposes ctx_* tools -- plugin-only tool registration break | core |
| 625 | issue | CLOSED |  | GP8 concurrency | Pi extension's BLOCKED_BASH_PATTERNS has no escape hatch — unrecoverable trap when MCP bri | pi-extension.test.ts |
| 627 | issue | CLOSED |  | GP5 index/search | [Bug]: ctx_search parameters incorrectly stringified by OpenCode adapter — Zod validation  | core, opencode-plugin.test.ts |
| 628 | issue | CLOSED |  | GP1 install/config | [Bug]: Built and installed v1.0.140 — GitHub pull failed (spawnSync cmd.exe ETIMEDOUT); st | cli |
| 634 | issue | CLOSED |  | GP4 execute | Codex CLI 0.131.0: MCP startup_timeout_sec=30s default trips when codex prewarm + cold-sta | scripts |
| 636 | issue | CLOSED |  | GP4 execute | PreToolUse hook fails on project paths containing spaces (macOS) | hooks |
| 637 | issue | CLOSED |  | GP3 hooks | OpenCode plugin registers hooks only -- never registers ctx_* tools | core |
| 639 | issue | CLOSED |  | REMOVED | test(B12): add live integration test for stdin EOF propagation in Bun re-exec path | hooks |
| 642 | issue | CLOSED |  | GP8 concurrency | [Bug]: SessionStart database is locked — NodeSQLiteAdapter drops busy_timeout on Node ≥22. | util |
| 643 | issue | CLOSED |  | GP4 execute | Make Pi MCP bridge `tools/call` timeout configurable via env var | adapters, lifecycle.test.ts |
| 644 | issue | CLOSED |  | GP6 journal/resume | sessionstart.mjs age-gated cleanup uses `statSync` (follows symlinks) — deletes fresh syml | core, hooks |
| 645 | issue | CLOSED |  | REMOVED | [BUG]:Pi and OMP adapters write SessionDB to `context-mode.db` but MCP server reads from ` | adapters, pi-extension.test.ts, plugins |
| 646 | issue | CLOSED |  | GP9 lifecycle | [BUG]: `ctx_search` source filter does not escape LIKE wildcards — unintended cross-source | store.test.ts |
| 647 | issue | CLOSED |  | GP4 execute | [BUG]: MCP bridge silently degrades on slow `initialize` — retry on timeout instead of fai | adapters |
| 648 | issue | CLOSED |  | GP5 index/search | [FEATURE]: `ctx_fetch_and_index` cache TTL is global — add per-call `ttl` parameter | core |
| 649 | issue | CLOSED |  | GP4 execute | [BUG]: Hardcoded storage path for many platforms | adapters |
| 650 | PR | MERGED |  | REMOVED | feat(opencode): streamline installation process and improve CLI upgrade | util |
| 654 | PR | CLOSED |  | GP8 concurrency | fix(hooks): reword WebFetch deny so agents don't read it as network block | core, hooks |
| 658 | issue | CLOSED |  | GP9 lifecycle | v1.0.146: plugin.json points to wrong skills path and stale MCP server path | scripts |
| 659 | issue | CLOSED |  | GP9 lifecycle | Preview truncation slices UTF-16 surrogate pairs, producing orphan `\uD83D` in tool_result | truncate.test.ts |
| 663 | issue | CLOSED |  | GP5 index/search | Feature: ctx_search with sort:timeline should scope to current projectDir | adapters, core |
| 665 | issue | CLOSED |  | UNASSIGNED | Pi crash on mixed-width CJK lines: rendered line exceeds terminal width | adapters |
| 677 | issue | CLOSED |  | GP1 install/config | [Feature]: Oh My Pi agent installation working. | adapters |
| 683 | PR | MERGED |  | GP3 hooks | fix(server): comprehensive ctx_* tool description audit + WebFetch refusal (substitutes #6 | core, hooks, session |
| 686 | PR | MERGED |  | REMOVED | fix(codex): report standalone doctor status accurately | adapters |
| 687 | issue | CLOSED |  | GP8 concurrency | [Bug]: ctx_index refuses directory paths, blocking project-wide indexing on all 4 tested c | core, store-directory.test.ts |
| 689 | PR | MERGED |  | REMOVED | fix(doctor): surface missing launch files when the integrity helper itself is absent | adapters, core |
| 696 | issue | CLOSED |  | GP4 execute | [Bug]: ctx_batch_execute.queries silently searches only batch output, not global index — A | core |
| 697 | issue | CLOSED |  | REMOVED | [Bug]: 3 remaining issues from cross-platform audit — ctx_insight Q&A, ctx_stats observabi | core |
| 698 | PR | MERGED |  | REMOVED | fix: query_scope for batch search, throttle visibility, cache observability, insight clari | core |
| 699 | PR | MERGED |  | REMOVED | fix(hooks): self-heal partial plugin cache install from marketplace clone | core |
| 708 | PR | MERGED |  | GP1 install/config | fix(opencode): handle host binary detection for in-process plugin platforms | runtime.test.ts |
| 710 | issue | CLOSED |  | REMOVED | Shell snapshot's PATH hardcodes previous-version bin/ — bash commands break after /ctx-upg | cli, hooks |
| 711 | issue | CLOSED |  | REMOVED | /ctx-upgrade bakes prior-version paths into new install's plugin.json and hooks.json | hooks, util |
| 712 | issue | CLOSED |  | REMOVED | [Bug]: `ctx doctor` reports missing Gemini CLI hooks due to hardcoded path mismatch in `cl | adapters |
| 713 | PR | MERGED |  | REMOVED | fix: stop baking stale version paths during upgrade (#711) | hooks |
| 717 | issue | CLOSED |  | GP4 execute | [Feature]: `ctx_execute` etc should show the commands the agent runs in Pi | core |
| 724 | issue | CLOSED |  | GP8 concurrency | Agent PreToolUse routing stalls read-only subagents: injected block omits the ToolSearch b | core |
| 728 | PR | MERGED |  | GP4 execute | fix: normalize stale version paths after CC auto-update (#727) | hooks |
| 729 | PR | MERGED |  | REMOVED | feat: add Kimi Code CLI hook integration | core |
| 731 | issue | CLOSED |  | GP4 execute | [Bug]: ctx_execute(language: "javascript") fails when OpenCode runs as self-contained bina | runtime.test.ts |
| 736 | issue | CLOSED |  | GP4 execute | [Improvement]: show ran commands in `ctx_batch_execute` | core |
| 737 | issue | CLOSED |  | GP8 concurrency | [Feature]: ctx_search `project:` filter — scope FTS5 ContentStore to current project when  | core |
| 738 | issue | CLOSED |  | REMOVED | Hooks run under `node`; emitting the generated commands as `bun` cuts ~40–60ms cold-start  | adapters, cli, hook-runtime-resolution.test.ts, hooks |
| 741 | PR | MERGED |  | REMOVED | feat(pi): fix adapter routing, MCP bridge, startup diet, and pricing | adapters, analytics |
| 756 | issue | CLOSED |  | GP4 execute | [Bug]: ctx_execute runs in the MCP server's process cwd (main repo), not the session's git | core, hooks |
| 760 | issue | CLOSED |  | UNASSIGNED | Pi: context-mode writes content under ~/.claude (platform misdetected as claude-code when  | adapters |
| 768 | issue | CLOSED |  | GP1 install/config | [v1.0.151] Three install-time manifests still bake stale prior version (1.0.25) — followup | scripts |
| 769 | issue | CLOSED |  | GP8 concurrency | [Bug]: ctx_search flood-guard counter is shared across concurrent subagents — parallel mul | core |
| 774 | issue | CLOSED |  | REMOVED | [Feature]: Antigravity-cli (agy) better integration | adapters |
| 780 | issue | CLOSED |  | GP6 journal/resume | Session resume re-injects stale events from previous legs as current (phantom tool calls,  | session |
| 781 | issue | CLOSED |  | GP8 concurrency | Plain-text chunker (#chunkPlainText) has no byte cap — large command output indexed as one | store-bytecap.test.ts |
| 782 | issue | CLOSED |  | GP4 execute | Maven (mvn) fails on Windows in ctx_execute sandbox due to MinGW path conversion issue | executor |
| 787 | PR | MERGED |  | REMOVED | Add GitHub Copilot CLI + Antigravity CLI (agy) support | core |
| 788 | issue | CLOSED |  | GP4 execute | [Bug]:  context-mode leaves `.ctx-mode-*` artifacts and non-shell `ctx_execute` runs outsi | executor |
| 791 | issue | CLOSED |  | GP4 execute | [Bug]: Windows: filesystem writes from one child process are invisible to the next inside  | executor, executor.test.ts |
| 794 | issue | CLOSED |  | GP8 concurrency | PreToolUse WebFetch deny hard-blocks subagents that cannot access ctx_* MCP tools (isMCPRe | hooks |
| 795 | issue | CLOSED |  | REMOVED | SessionStart cache-heal hook skips itself when ~/.claude is a symlink (path.resolve vs rea | core |
| 800 | issue | CLOSED |  | REMOVED | Fetch worker spawns via version-pinned process.execPath — breaks ctx_fetch_and_index after | hook-runtime-resolution.test.ts, runtime.test.ts |
| 803 | PR | MERGED |  | GP4 execute | fix(runtime): add liveness guard to resolveJavascriptRuntime for Homebrew Cellar ENOENT (# | hook-runtime-resolution.test.ts |
| 806 | issue | CLOSED |  | GP1 install/config | Incompatible with opencode.jsonc config | adapters, core |
| 807 | issue | CLOSED |  | GP9 lifecycle | Cleanup never re-creates breadcrumbs for orphaned version dirs still referenced by long-li | hooks |
| 809 | issue | CLOSED |  | GP1 install/config | [Bug]: Pi: After installing terminal hangs when running any pi command like pi list | adapters, pi-extension.test.ts |
| 814 | issue | CLOSED |  | GP6 journal/resume | sessionstart.mjs cleanup deletes old version dir without junction — breaks active sessions | hooks |
| 817 | issue | CLOSED |  | GP4 execute | PreToolUse/PostToolUse hooks intercept small Bash/WebFetch calls without a size threshold  | core |
| 826 | PR | MERGED |  | GP4 execute | fix(windows): preserve Git Bash path conversion for native git | executor |
| 827 | issue | CLOSED |  | GP5 index/search | Bug: ctx_search returns no results due to overly strict project filtering | core |
| 830 | issue | CLOSED |  | GP9 lifecycle | Orphaned MCP server pegs 100% CPU for hours after client exits (uncaughtException handler  | server-stdin-eof-exit.test.ts |
| 840 | issue | CLOSED |  | GP6 journal/resume | Session-resume `## Data References` inlines every captured tool-output into SessionStart c | session |
| 841 | issue | CLOSED |  | REMOVED | Hooks break after a mise Node patch upgrade (pinned execPath points at a deleted version d | hook-runtime-resolution.test.ts |
| 844 | issue | CLOSED |  | UNASSIGNED | MCP readiness sentinel can be deleted across shared /tmp and isolated PID namespaces | hooks |
| 845 | issue | CLOSED |  | GP3 hooks | Codex PreToolUse formatter drops modify/context despite current updatedInput support | hooks |
| 846 | issue | CLOSED |  | GP4 execute | Codex cancels context-mode MCP tool calls because ctx_* descriptors lack annotations | core |
| 849 | issue | CLOSED |  | GP1 install/config | writeSettings creates shadowing opencode.json when opencode.jsonc has the real config | adapters |
| 852 | issue | CLOSED |  | GP4 execute | [Bug]: Agents immediatly learn and than love to use context_mode:ctx_execute* to escape fr | security |
| 854 | issue | CLOSED |  | GP9 lifecycle | Pi host: MCP servers accumulate under a long-lived parent — self-shutdown gated entirely o | adapters, lifecycle.test.ts |
| 856 | issue | CLOSED |  | UNASSIGNED | Pi host: a casual user phrase gets frozen as behavioral_directive and re-injected every tu | core, pi-extension.test.ts, session |
| 861 | issue | CLOSED |  | REMOVED | Windows: boot-time turndown/better-sqlite3 npm install fails EPERM (C:\Windows\node_module | scripts |
| 862 | issue | CLOSED |  | GP9 lifecycle | MCP server orphans busy-spin at ~100% CPU after parent Claude session exits (no exit-on-st | scripts |
| 868 | issue | CLOSED |  | UNASSIGNED | [Bug]: Very intrusive message do not allow to type | adapters, lifecycle.test.ts, pi-extension.test.ts |
