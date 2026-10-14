# Issue map I2 → v2 plan

| # | title (short) | agent/OS | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 1068 | cm-fs preload marker leaks to grandchild stderr | CC / Linux | B | P1; fs-byte counting must use a side channel, never the child's stdio; NODE_OPTIONS not inherited past the direct child | Given a batch command that spawns a node grandchild asserting empty stderr, When run via ctx_batch_execute, Then the grandchild stderr is empty and the byte count is still reported. |
| 1067 | pi collapsed row shows ```javascript fence | Pi | B | Tool result first line must be a summary, not the code echo (ties to Q-echo) | Given ctx_execute on any adapter, When result returns, Then line 1 is a plain summary/output, not a code fence. |
| 1065 | Hosted Insights D1 SQL vars / owner team | Pi, hosted platform | C (reject for OSS) | D17 removes ctx_insight; hosted product is separate repo | Not OSS v2 scope; route to platform tracker. |
| 1063 | "Is the project abandoned?" | CC | D | Question, not a bug | Answer with v2 roadmap; close. |
| 1058 | Uninstall leaves cache-heal hook, cache dir, live MCP | CC / macOS | A + B | A: D2 removes heal scripts (cache-heal hook gone). B: uninstall removes every artifact install wrote; server exits on stdin close | Given install then uninstall, When settings/hooks dirs are diffed, Then no context-mode entry, file or process remains. |
| 1055 | isMCPReady counts sibling sessions → WebFetch denied | CC / multi-session | A | D10 (no hard denies), P2 (hooks don't gate on server state) | isMCPReady and deny path disappear. |
| 1053 | isMCPReady swallows redirects in OpenCode embedded mode | OpenCode | A | D10, D8 (hooks don't probe server), P2 | Gate removed; hints emitted unconditionally. |
| 1052 | OpenCode `webfetch` alias missing | OpenCode | B | P3: adapter tool-name map must cover every host tool name | Given OpenCode calls `webfetch`, When PreToolUse runs, Then the WebFetch hint is emitted. |
| 1050 | Pi single-row collapsed rendering | Pi | C (later) | Cosmetic adapter option | Not core; after v2.0 (maybe fold into #1067 fix). |
| 1049 | cache-heal re-injects duplicate absolute-path hook | CC / macOS | A | D2 (heal scripts removed), D11 (install writes nothing at runtime) | Code path removed. |
| 1048 | Plan mode blocks ctx_batch_execute | CC 2.1.228+ | Q | Need a read-only gather path vs honest annotations | See Q1. |
| 1047 | Configurable execution echo + summary arg | Codex | Q | Echo default not decided | See Q2. |
| 1046 | LongHorizon-Harness integration | n/a | C (reject) | D15/scope; third-party promo | Out of scope. |
| 1045 | neuforge-pay token metering | n/a | C (reject) | D15 (no external API), promo | Reject. |
| 1039 | ctx_fetch_and_index strips HTTP(S)_PROXY | Pi, Copilot CLI / macOS | B | Fetch honours HTTP_PROXY/HTTPS_PROXY/NO_PROXY | Given HTTPS_PROXY set, When ctx_fetch_and_index runs, Then the request goes through the proxy. |
| 1037 | WebFetch denied for subagents without ctx_* | CC subagents | A | D10 (hints only), P2 | Deny removed; subagent can still WebFetch. |
| 1036 | OpenCode cumulative cost appended per step | OpenCode | B | D17 keep stats data; usage events idempotent per turn | Given 3 step-finish events in one turn, When journaled, Then turn cost counted once. |
| 1032 | VS Code Remote-WSL root = VS Code install dir | VS Code Copilot / Win+WSL | B | D4: one fixed project source (MCP roots), never process cwd | Given Remote-WSL workspace in MCP roots, When ctx_execute_file reads a workspace file, Then it is allowed. |
| 1031 | Tool descriptions ~6.2K tokens | Pi | Q / B | D11 puts routing in tool descriptions → conflicts | See Q3; contradiction C1. |
| 1028 | PreCompact snapshot uses bare ctx_search | Codex/Kimi/Copilot | A | D9 (no snapshot; hint only) — but hint must use platform tool name | Given prefixed platform, When hint emitted, Then it names the real ctx_resume tool name. |
| 1026 | Bash nudge once-per-session vs periodic | CC | B | D10/D11 hints: one shared nudge policy for all tools | Given N bash calls, When cadence K set, Then nudge appears every K calls, same as MCP nudge. |
| 1025 | reduction_pct double-counts returned bytes | CC (shared) | B | D17 stats; one formula with unit test | Given 10,001 B stdout and 3,284 B returned, When stats computed, Then denominator counts returned bytes once. |
| 1024 | Stale DB cleanup deletes live idle sessions (WAL mtime) | all | A | D6 (PID liveness, 14 days, no WAL heuristics) | Code path removed; covered by D6 test. |
| 1023 | "ran N× longer" is byte ratio shown as time | all | B | D17 stats wording must match unit | Given stats report, When rendered, Then ratios are labelled as bytes, no time claim. |
| 1022 | Resume snapshot ignores maxBytes (196 KB) | all | A | D9 (no snapshot injected; ctx_resume tool) | Given ctx_resume, Then response obeys a byte budget (add to D9 tests). |
| 1021 | README says Pi hooks High not Full | Pi | A | D16 README rewrite; D18 capability table regenerated | Old table removed. |
| 1018 | CC tool naming assumes plugin install | CC standalone MCP | B | P3: tool prefix derived from actual install mode | Given standalone MCP install, When hint emitted, Then it names `mcp__context-mode__*`. |
| 1017 | Copilot CLI / Codex root = plugin install dir | Copilot CLI, Codex / Linux | B | D4 fixed source per adapter; missing = doctor error | Given Copilot CLI cwd=/repo, When ctx_execute_file reads /repo/AGENTS.md, Then allowed. |
| 1016 | Clean uninstall command | Copilot | C (v2.0) | Install/upgrade/doctor not yet discussed; needs `ctx uninstall` | Same test as #1058. |
| 1014 | No way to count docs per source; doctor PASS on empty index | all | C (v2.0) | D12: zero-hit reply states scope + source doc count | Given empty source X, When searched, Then reply says "source X has 0 docs". |
| 1006 | WebFetch deny breaks claude.ai artifact URLs | CC | A | D10 (no hard denies) | Deny removed. Dup of #984/#938. |
| 1005 | ctx upgrade writes old-version paths (bun) | CC / macOS | A | D2 (bun removed); install not yet discussed | Bun normalization branch gone; add upgrade test when install decided. |
| 1004 | buildRulesSection inlines AGENTS.md into resume | Codex / WSL2 | A | D9 (no snapshot), D11 | Code removed. |
| 1003 | Denies defeated by parallel batches; no WebFetch opt-out | CC | A (part) / Q | D10 removes deny; hint efficacy in parallel batches is open | See Q4. |
| 1000 | PreToolUse double-fires; no PostToolUse timeout | CC | B | D7 hooks.json generated; one matcher per tool; every hook has timeout | Given hooks.json, Then each tool matches exactly one entry and every hook has a timeout. |
| 999 | start.mjs busy-loop, 23 instances | CC / macOS | B | D17 (lifetime stats refresh likely gone); server idle = 0% CPU; exits on stdin close | Given idle server 60 s, Then CPU time grows < 1 s; When client closes stdin, Then process exits. |
| 993 | Windows hook commands fail under PowerShell | CC / Windows | Q | Windows shell not yet discussed | See Q5. |
| 992 | Bun SQLITE_IOERR wedge; doctor green | CC, Pi / Bun | A | D2 (bun:sqlite removed) | Also B: doctor must probe live handle. |
| 985 | Multi-session contention on shared DB, busy-wait | CC, Pi / Windows | A | D3 (one writer per file) | Shared-writer path removed; no busy-wait retry allowed. |
| 984 | WebFetch no exemption for artifact URLs | CC | D | Dup of #1006/#938; also A via D10 | Close as dup. |
| 983 | Pi reload leaks MCP helper | Pi / Linux | B | Server lifetime bound to parent; reload must not leak | Given Pi reload twice, Then one MCP helper process remains. |
| 982 | Windows MCP orphans spin after session end | CC / Windows | B | Parent-death detection on all OSes (stdin EOF primary) | Given client killed on Windows, Then server exits within 5 s. |
| 979 | Headless CC still denied (dead formatter) | CC headless | A | D10 (no denies), D7 (one TS hook path, no dead copies) | Code removed. |
| 967 | Injected <context_window_protection> trips auto-mode classifier | CC auto-mode | A | D11 (block removed) | Subagent prompts not modified. |

## New decisions needed
- **Tool surface**
  - Q1 (#1048): Plan mode blocks non-read-only tools. Add a read-only gather tool (search/read files, no shell) or accept prompts in plan mode?
  - Q2 (#1047, #1067): Drop code echo from execution results by default? Add optional `summary` arg?
  - Q3 (#1031): Tool descriptions budget (e.g. < 2K tokens total) given D11 moves routing into them.
- **Hints**
  - Q4 (#1003): Hints lose to parallel sibling results. Accept, or emit the hint via PostToolUse/next turn?
- **Windows**
  - Q5 (#993, #982): Hook command format for PowerShell vs cmd/bash; required parent-death method on Windows (stdin EOF only, or Job Object).
- **Install**
  - Q6 (#1058, #1016, #1005): Is `ctx uninstall` in v2.0, and does it kill running servers?

## Contradictions with v2-decisions.md
- C1: D11 moves routing prose into tool descriptions; #1031 reports descriptions already cost ~6.2K tokens per call on Pi. D11 needs a size cap.
- C2: D9 drops the snapshot, but #1028/#1018 show the SessionStart hint must use per-install tool names; P3 "thin translator" must own name mapping, which D9 does not mention.
- C3: D17 keeps "only data ctx_stats needs", yet #999 shows lifetime stats refresh caused CPU spin; unclear if lifetime (cross-session) stats survive D3 per-session storage.
