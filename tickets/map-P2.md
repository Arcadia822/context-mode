# Open PR map (batch P2) vs v2 decisions

Authors: all external contributors (no maintainer/bot PRs). CI: most show no runs (fork PRs waiting for approval). Green: #1087, #1030, #995, #980. Red: #1111 (2 fail).

| # | title (short) | author | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 1121 | pi: stream ctx_execute progress + stderr exit classify | hiiamtrong | B | Shell failure that writes stderr must be an error, not grep-style soft fail. Progress streaming = C (v2.0 ok) | Given `sh -c 'echo x >&2; exit 2'` When ctx_execute Then isError=true. tests/core/server.test.ts partly reusable |
| 1118 | db-base: SQL comments split exec | aktanazat | A | D2 (BunSQLiteAdapter removed) | node:sqlite exec takes multi-statement SQL |
| 1116 | omp: resume snapshot after compact | tahsinrahman | A | D9 (no snapshot injection) | resume is ctx_resume hint |
| 1113 | detect: wait MCP initialize | tahsinrahman | A | D4 + P1 (no config-dir detect chain) | Req: agent identity from clientInfo after initialize only. Given OMP clientInfo When server init Then platform=omp |
| 1111 | stats: stop heartbeat lifetime scans | koenvg | B | D17/D3: stats must never scan all DBs on a timer | Given 1000 project DBs When server idles 60s Then 0 DB opens outside own session |
| 1104 | codex: Code Mode `exec` in PreToolUse matcher | JAM924 | M | P3 adapter translate; tiny | Given Codex tool `exec` When PreToolUse Then hook fires. tests/adapters/codex.test.ts reusable |
| 1097 | CONTEXT_MODE_MAX_LIMIT env | lostpeanut09 | C (reject) | Search limits belong to D12 design; commits stray pr-body.md | - |
| 1095 | pi: strip echo preamble in collapsed render | danyal002 | M | Pi UI fix, 21 lines | no test; ask for one |
| 1093 | pi: Esc interrupt for ctx_* calls | stt-pafe | B | Cancel must kill the run | Given running ctx_execute When client sends abort/cancelled Then process tree dead, call settles <1s. tests/adapters/pi-mcp-bridge-cancel.test.ts reusable |
| 1092 | pi: live call preview + result tail | stt-pafe | C (v2.0 later) | Pi TUI polish | - |
| 1091 | search: guard FTS5 highlight on big rows (#878) | initguru | M + B | Search must never block event loop on oversized row | Given 5 MB row When ctx_search Then returns <1s. tests/store-bytecap.test.ts reusable |
| 1089 | derive plugin registry key for heal | 7487 | A | D2 (heal scripts removed) | - |
| 1087 | security: `//` and `~/` anchors in permission patterns (#1075) | meikocho1 | M + B | Security-policy denies kept (D10) must match Claude path forms (P3) | Given deny `Read(~/.ssh/**)` When Read ~/.ssh/id_rsa Then deny. tests/security.test.ts reusable |
| 1086 | routing: scan quotes left to right | casparml | A | D10 (curl/wget routing denies gone) | Req if security policy parses Bash: quote-aware parse. Given `git tag -m "it's curl"` Then not matched as curl |
| 1084 | codex: redirect broad home searches | gutocarollo | A | D10 (no hard denies) | could become a hint; reject as deny |
| 1082 | `timeout` -> `timeoutMs` | aktanazat | C | tool set consolidation (not decided) | new decision |
| 1076 | CONTEXT_MODE_TOOLS allow-list | alaleiwang | C | tool set consolidation (not decided) | new decision |
| 1073 | Kiro hooks 1.0 v1 schema | kevinmiao | M | config fix for current Kiro; D14 | Given install for Kiro When config written Then `version:"v1"`, hooks array |
| 1066 | omp: route broad calls, cap results 16 KiB | danzaio | A | D10 (routing) ; result cap = C | - |
| 1056 | db: no cross-process TRUNCATE checkpoint / mmap | HyeokjaeLee | A | D3 (one writer per file; ADR 0001 multi-writer gone) | Req: readers open read-only, never checkpoint others |
| 1044 | Mistral Vibe adapter | xavierpestel-ai | C (later) | D14: new adapters are separate scope | - |
| 1043 | precompact: platform ctx_search name | LHMQ878 | A + B | D9 removes snapshot; Req: hint must name the platform's tool name | Given Codex When SessionStart hint Then text uses `mcp__...ctx_resume` form for that agent |
| 1042 | stats: net returned bytes in reduction_pct | LHMQ878 | B | stats design (open) | Given 10 KB indexed, 2 KB returned Then kept_out=8 KB. tests/session/stats-reduction-pct.test.ts reusable |
| 1041 | opt-in proxy for ctx_fetch_and_index | vishnujayvel | C | sandbox security model (not decided) | new decision |
| 1040 | opencode cost as deltas | vishnujayvel | C | cost/usage tracking not in D17 list | new decision; if kept: Given 2-step turn cumulative cost Then sum = final cost |
| 1035 | pi: detect npm-managed install | guillemservera | B | doctor/install must find Pi installs via PI_CODING_AGENT_DIR | tests/adapters/pi-adapter.test.ts reusable |
| 1034 | self-identify subagent routing block | kaovilai | A | D11 (block removed) | - |
| 1033 | VS Code Remote-WSL project root | daniel-vincent-veriforce | B | D4: VSCODE_CWD is wrong source under remote | Given Remote-WSL, VSCODE_CWD=install dir When resolve project Then workspace root (or doctor error) |
| 1030 | retry transient SQLITE_IOERR | halindrome | A | D3 + P1 (no retry fallback) | - |
| 1029 | pi: MCP cancel to executor | YrFnS | D | dup of #1093 / #1009 | same contract as #1093 |
| 1019 | security: honor Pi project permissions | WAIXv | B | security policy source per adapter | new decision (P3 vs native settings) |
| 1010 | Hermes Agent support | ildunari | C (later) | D14 separate scope; Python plugin | - |
| 1009 | executor: kill abandoned trees on cancel | stgmt | B | core of cancel contract | tests/executor.test.ts reusable; preferred base over #1029 |
| 1002 | pi: context at system boundary | Tarun-joy | A + B | D9/D11 remove injection; Req: SessionStart hint goes in system prompt, never as user message | Given Pi before_agent_start Then hint in systemPrompt, 0 user msgs added |
| 1001 | MiniMax pricing rows | octo-patch | C | depends on #1040 decision | - |
| 996 | session_state label "compaction" | donwellsav | A | D9 | - |
| 995 | Windows vitest EPERM hang | skoll43 | B | CI (not decided); commits bundles + stats.json | Req: tests close all DB handles. Re-do clean |
| 991 | auto-index 5-100 KB exec output | niemst | B | D12: session exec output searchable | Given 50 KB output, no intent When ctx_search term Then hit labelled session |
| 988 | opportunistic PASSIVE WAL checkpoint | alove20 | A | D3 (single writer checkpoints own file) | - |
| 987 | Windows parent death via PID probe (#982) | alove20 | M + B | D6 needs PID-alive check on all OS | Given Windows, parent PID gone When guard ticks Then server exits. tests/lifecycle.test.ts reusable |
| 986 | Atomics.wait instead of busy-wait | alove20 | A | D2 (better-sqlite3 gone); use busy_timeout | - |
| 980 | batch: indexed byte/chunk budgets | Tomodad | B | ingestion must be bounded | tests/batch-ingestion-budgets.test.ts reusable |
| 975 | background=true w/o timeout hangs | ayuayue | M + B | 2-line crash/hang fix | Given background:true, no timeout When ctx_execute Then returns <2s |
| 974 | start.mjs: remove chdir | xav-ie | M + B | server must not chdir (D4: cwd = worktree) | Given start When server runs Then process.cwd() unchanged |
| 973 | find bun on $PATH | xav-ie | A | D2 (Bun removed) | - |

## Merge-now candidates (v1.x)
#1087 (security, CI green), #975, #974, #987, #1091, #1104, #1073, #1095. Optional: #1035.

## New decisions needed
1. Tool params: `timeoutMs` rename (#1082), tool allow-list env (#1076).
2. Proxy in fetch sandbox (#1041).
3. Cost/usage tracking + pricing catalog in v2 (#1040, #1001) - D17 is silent.
4. Security policy source per agent: Claude settings only, or native (Pi) settings (#1019).
5. Progress streaming + cancel as core contract for all agents (#1121, #1093, #1009).
6. Result size cap for non-ctx tools (#1066) - hint or nothing?
7. Policy on PRs that commit bundles (#995, #991, #1091, #980).

## Contradictions with v2-decisions.md
- D4 "one fixed source" vs #1033: VS Code's only env source (VSCODE_CWD) is wrong under Remote-WSL; need MCP roots for VS Code.
- D1 "1.x security fixes only" vs merge-now list: #975/#974/#987/#1091 are hang/crash fixes, not security. Widen D1 or drop them.
- P3 (Claude is reference) vs #1019: Pi users expect Pi settings to drive denies.
- #1082 targets `next` already; v2 work on `next` may conflict with open PRs based there.
