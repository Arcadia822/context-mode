# Issue map I3 → v2 plan

| # | title (short) | agent/OS | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 964 | Env knob to disable SessionStart routing block | Claude Code | A | D11 | ~4.6 KB ROUTING_BLOCK is removed; only 1–2 neutral lines stay. No knob needed. |
| 962 | RFC: bound trigram/vocab growth for logs/JSONL | all | Q | not discussed (storage/index policy) | Need decision on porter-only above threshold, high-entropy token filters. |
| 961 | RFC: indexed byte/chunk budgets for batch | all | B | Index must have total byte + chunk budgets, display separate from indexed input | Given a command printing 100 MiB, When ctx_batch_execute runs, Then indexed bytes <= max_total_indexed_bytes and reply says it was cut. |
| 960 | PreToolUse `mcp__` matcher hits all MCP tools | Claude Code | B | P2/D10: hooks are hints only; matcher must not fire on non-ctx observe-only tools | Given a call to mcp__grafana__get_datasource, When PreToolUse runs, Then no hook process is spawned (matcher excludes it). |
| 959 | Pi: hung ctx_execute cannot be aborted | Pi, macOS/Win | B | Server-side hard timeout + abort signal kills whole process group; event loop never blocks | Given ctx_execute running `sleep 999`, When host sends cancel or timeout hits, Then child tree is dead within 2 s and tool returns error. |
| 956 | prebuild-install deprecated warning | Antigravity | A | D2 | better-sqlite3 (pulls prebuild-install) removed; node:sqlite only. |
| 954 | execute_file rejects external worktrees, batch accepts | Pi | B | D4: one containment rule for all tools; worktrees of the project are allowed | Given a registered external git worktree, When ctx_execute_file and ctx_batch_execute target it, Then both accept (same rule). |
| 953 | Codex Desktop Win keeps one MCP server per task, os error 32 | Codex, Windows | B | Server exits on stdin close / parent death; no cache files held open | Given the host closes stdio, When 5 s pass, Then server process has exited and plugin dir can be deleted on Windows. |
| 951 | Stale cm-fs-preload-<pid>.js via NODE_OPTIONS leak | all | B | Sandbox must not leak NODE_OPTIONS / temp preload paths across processes | Given server A exited, When server B runs `node -v` in ctx_batch_execute, Then it succeeds (no MODULE_NOT_FOUND). |
| 950 | ctx_stats self-contradicts (part > whole) | Claude Code | B | D17: stats redesigned; totals derive from one source | Given any stats render, When computed, Then session kept-out <= project total <= all-time total, and 0 ctx calls ⇒ 0 savings. |
| 949 | sessions/ has no retention | all | A | D6 | v2 cleanup covers session DBs (14 d, live-PID safe); old sessions/ dir is v1 (D13 doctor lists it). |
| 947 | batch timeout does not bound indexing/search | Claude Code, Codex, Win/mac | B | Timeout bounds the whole handler (exec + index + search) | Given timeout 5000 and a huge output, When ctx_batch_execute runs, Then reply returns within 5 s + small margin. |
| 946 | Agent-prompt injection blocked by auto-mode classifier | Claude Code | A | D11 (+D10) | Routing block no longer appended to Agent prompts; subagent prompts untouched. |
| 944 | Codex external-file check reads wrong settings | Codex | Q | Windows/security model not discussed | Does v2 read host permission profiles at all, or only own config? |
| 941 | Codex guidance: JS default, not only | Codex | A | D11 | Install no longer writes AGENTS.md blocks; language guidance lives in tool descriptions. |
| 940 | OS-specific Codex guidance overlay | Codex | A | D11 | Same: no AGENTS.md block. OS hints, if any, go in tool description at runtime. |
| 938 | WebFetch redirect breaks claude.ai artifact URLs | Claude Code | A | D10 | No hard deny on WebFetch; native WebFetch works. |
| 936 | stdio ctx_execute hangs, no server timeout | Claude Code | B | same as 959/947: default server-side timeout for every host | Given no timeout arg, When code loops forever, Then tool returns timeout error after default limit. |
| 925 | Wrapper breaks commands starting with if/for/( | all | B | Env must be passed via spawn env, never string-prefixed into the command | Given command `if true; then echo ok; fi`, When ctx_batch_execute runs, Then output is `ok`. |
| 923 | start.mjs chdir breaks terminal cwd | Linux (VTE, herdr) | B | Server never changes process cwd (D2 removes start.mjs heal flow) | Given server started in /proj, When running, Then process.cwd() === /proj. |
| 919 | Support CommandCode CLI | CommandCode | C | D14: new adapters are separate scope | later — v2.0 freezes adapter set; accept via thin adapter after contract tests exist. |
| 915 | runPool `capped` true when jobs < concurrency | all | B | (small) | Given 2 jobs, concurrency 8, When runPool, Then capped === false. |
| 914 | index --source bare label vs indexDirectory | all | Q | ctx_index label scheme not decided | Should every label include path? Tied to D12 hit labels. |
| 911 | session_continuity framing trips auto-mode classifier | Claude Code | A | D9 + D11 | No snapshot / priority_instructions injected; only a short hint with session id. |
| 908 | Configurable redirect exclusions per domain | Claude Code | A | D10 | No redirects to exclude. |
| 905 | Pi bridge Bun SQLITE_IOERR | Pi, macOS | A | D2 | Bun and bun:sqlite removed. |
| 903 | SessionStart truncation splits UTF-16 surrogates | Claude Code | B | Any text cut must be code-point safe (D9 hint still exists, plus tool output truncation) | Given text with emoji at cut boundary, When truncated, Then result has no lone surrogate. |
| 902 | Resume snapshot stale, priority eviction | Claude Code | A | D8 + D9 | Snapshot and eviction removed; journal is append-only, ctx_resume reads it. |
| 901 | upgrade updates one tree, doctor reads other (Win) | OpenCode, Windows | Q | install/upgrade/doctor not discussed | One install path per agent? Who owns upgrade? |
| 895 | ctx_search ranks stale cross-session above fresh | all | A | D12 | Rank session > worktree > project by design. Contract test still needed in D12. |
| 894 | Statusline stuck, build/ missing | Claude Code | A | D17 (+packaging) | Statusline removed. Packaging gap see 889. |
| 891 | Emacs Lisp runtime | any | C | later | Not core; adds runtime surface. Revisit after tool consolidation. |
| 890 | omp: `with {type:"json"}` import breaks validator | oh-my-pi | B | D7 bundling: bundle inlines JSON, no import attributes in output | Given the built bundle, When grepped, Then no `with { type:` import attribute exists. |
| 889 | tarball missing scripts/*.mjs | all | A/B | D2 removes heal/postinstall scripts; packaging needs a test | Given `npm pack`, When listed, Then every file referenced at runtime is present. |
| 880 | cleanupStaleContentDBs race poisons store (Pi) | Pi | A | D3 + D6 | Per-session single writer; no WAL-mtime cleanup; live-PID DB never deleted. |
| 878 | chunkMarkdown oversized paragraphs | all | B | Hard chunk byte cap for every chunk path | Given a 1 MB single-line paragraph, When indexed, Then every stored chunk <= MAX_CHUNK_BYTES. |
| 874 | OMP tool_result never replaces output | oh-my-pi | Q | P2 says hooks never add behaviour; replacing output IS behaviour | Do v2 hooks ever rewrite tool output? |
| 873 | omp install does not copy SYSTEM.md | oh-my-pi | A | D11 | Install never writes routing files; tool descriptions carry the rules. |
| 867 | Self-heal only at open-time, mid-session corrupt | all | Q | P1 (no fallback) vs self-heal | v2: on SQLITE_CORRUPT, hard error + doctor, or recreate? |
| 865 | ctx_stats ignores $CLAUDE_CONFIG_DIR | Claude Code | A | D3 + D17 | Storage leaves agent config dirs; stats no longer enumerates adapter dirs. |
| 45 | Beta testers wanted | all OS | D | meta, not a bug | Keep for v2 beta; not a code item. |

## New decisions needed
- Storage/index policy: 962 (entropy/trigram limits), 961 (default budgets numbers), 878 (cap value), 914 (label scheme).
- Error handling under P1: 867 — corruption = hard error or recreate?
- Hook scope: 874 — may a hook replace tool output (OMP/Pi style), given P2?
- Install/upgrade/doctor: 901, 889 (one tree per agent, packaging test).
- Security model: 944 — honour host permission profiles?
- Process lifecycle / timeouts: 959, 936, 947, 953 — default timeout value and kill model (process group, Windows job object).

## Contradictions with v2-decisions.md
- P2 vs 874: OMP/Pi value comes from hooks replacing output; P2 forbids hooks adding behaviour.
- P1 vs 867/880 history: v1 relied on self-heal recreate; P1 forbids it but no failure rule is stated.
- D8 (hooks append journal) vs 951/953: hooks still spawn node per call; 960 shows hook cost on every MCP call, so matcher scope must be decided.
- D18 + D14 vs 919: "all adapters in v2.0" yet new adapters are "separate scope" — no rule for accepting new ones.
- D12 (OPEN) is the only fix for 895; leaving it open leaves a live bug.
