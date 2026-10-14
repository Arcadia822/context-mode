# Open PR map — batch P1 (45 PRs) vs v2-decisions.md

All 45 authors are external contributors (no maintainer, no bot PRs). CI: almost all have no runs (fork workflows wait for approval). Only #1211 and #1182 ran CI, and both have one FAILURE.

| # | title (short) | author | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 1227 | OMP: allow quoted HTTP refs, silent downloads | agammann | A | D10 (hard denies go away, hints only) | False positives matter less once it is only a hint. Overlaps #1124 |
| 1224 | ensure-deps backoff after failed install | Kenmege | A | D2 (ensure-deps removed) | — |
| 1220 | heal: keep project-scope installs out of user settings | rubenmarcus | A | D2 (heal scripts removed) | v2 install must respect scope; see "new decisions" |
| 1218 | win32 shell scripts: restore inherited PATH | fl4pj4ck | B | Executor shell on Windows must see the full inherited PATH | Given Win + Git Bash, When ctx_execute shell runs `where node`, Then it resolves like the parent PATH. tests/executor.test.ts case reusable |
| 1216 | cache-heal version filter anchor | rubenmarcus | A | D2 (heal removed) | — |
| 1211 | analytics: stop re-reading every sidecar | LukeMS | A | D17 + D3 (stats data model rebuilt) | CI FAILURE. Requirement: stats must not scan all DBs every 60 s |
| 1209 | Windows: run extensionless shim python/node via Git Bash | fl4pj4ck | B | ctx_execute must run a language whose only PATH entry is a `#!/bin/sh` shim | Given Win with only a shim `python`, When ctx_execute(python), Then the code runs. tests/runtime.test.ts reusable |
| 1207 | ctx_search accepts singular `query` | rubenmarcus | M + B | Schema must declare every arg the handler accepts | Given {query:"x"}, When ctx_search runs, Then it searches (no "provide query"). tests/core/search-singular-query.test.ts reusable |
| 1197 | reject unusable Bun shims | jeffscottward | A | D2 (Bun removed) | — |
| 1194 | OpenCode v2 dual support + non-LLM compaction | nathanpride | C | D14 (v2.0 adapter); compaction part conflicts with D9 | +3461. Overlaps #1171. Take the adapter design only |
| 1189 | curl/wget only in command position | rabbitholedotdev | A | D10 | Hints only; same as #1128/#1124 |
| 1183 | persist stable interpreter path, not versioned | brujack | B | Hook/MCP command must not pin a versioned node path (brew upgrade breaks it) | Given execPath under Cellar/<ver>, When install writes hooks, Then the command is a stable path. tests/hooks/windows-hooks-normalization.test.ts partly reusable |
| 1182 | Pi: honor AbortSignal, Esc cancels | rabi | B | Cancel from host must reach the executor and kill the child tree | Given running ctx_execute, When host aborts, Then the child tree dies and the call returns. tests/executor-cancel-1175.test.ts reusable. CI FAILURE; reviewer patch in comments |
| 1181 | align priority contract + minPriority | victor0777 | B | One priority polarity (1 = critical) across journal and ctx_resume | Given events of mixed priority, When resume filters by minPriority, Then critical events stay. D8/D9 rewrite the storage |
| 1180 | Pi: timestamp context-hook message | bubbleptr | M | Every injected message carries a numeric timestamp | Given Radius, When Pi injects context, Then message has finite timestamp. Fixes #1179 (400 on first turn) |
| 1178 | agy PreInvocation capture decisions | onurbcoban | C | v2.0 via D8 journal (agy hook), later | Rebuild on journal, not SessionDB |
| 1177 | batch: export NODE_OPTIONS for compound cmds | xecanto | M + B | Batch preload must not break `for`/`if`/`{}` commands | Given `for p in a b; do echo $p; done`, When ctx_batch_execute, Then output "a b". tests/core/server.test.ts case reusable |
| 1176 | surrogate-safe truncation | xecanto | M + B | No cut may emit a lone surrogate | Given text with emoji at cut point, When snippet/echo truncates, Then output is valid UTF-8. tests/truncate.test.ts reusable |
| 1172 | fetch: concise subprocess errors | 7487 | B | Fetch errors return the cause, not a Node stack | Given unreachable URL, When ctx_fetch_and_index, Then error is one line |
| 1171 | OpenCode 2 plugin API (V1/V2 dual export) | Scratchydisk | C + B | D14: OpenCode 2 must load | Given OpenCode 2.x, When plugin loads, Then ctx_* tools register. tests/opencode-plugin.test.ts reusable. Tested by users on 2.0.7/2.0.10 |
| 1170 | Pi: keep context across tool-loop requests | xwcq | A | D11/D9 (no per-request injection) | — |
| 1167 | Windows: in-process runtime probes, no `where` | armingx | B | No process spawn at server boot for runtime detection | Given Win, When server starts, Then zero `where` spawns before initialize. Bun parts drop (D2) |
| 1166 | Pi bridge: spawnable runtime on Windows | zhenda-hub | A | D2 (bridge spawns process.execPath) | Requirement: spawn absolute path, never bare `bun` |
| 1165 | Codex: honor sandbox state for file reads | jkoelho | C | v2.0 candidate (P3 thin adapter) | Needs decision on sandbox model ("not yet discussed") |
| 1164 | Pi: AbortSignal kill bridge tree | cxh0312 | D | Superseded by #1182 | Same bug (#1175) |
| 1161 | OpenCode/Kilo native ctx_* names | Fonsi44 | A | D11 (AGENTS.md routing removed) | Requirement: tool names in hints = names the host shows |
| 1160 | opencode: merge sibling plugin arrays | dragonyzl | M + B | Install must never drop user config entries | Given opencode.json with 3 plugins, When upgrade writes jsonc, Then all kept. tests/adapters/opencode.test.ts reusable |
| 1158 | evict least-important events first | xianjianlf2 | D | Superseded by #1181 (same polarity bug); D8 removes event cap | — |
| 1155 | redact secrets from debug report | HUAN2022A | D | Duplicate of #1144 (both fix #1141) | — |
| 1154 | Windows: windowsHide on probes | kantan-kanto | M + B | No visible console windows from child spawns | Given Win, When probes run, Then all spawns set windowsHide. tests/runtime.test.ts |
| 1153 | Codex: read effective hooks feature | L4XB | B | doctor checks effective state, not override key | Given no `[features].hooks`, When doctor, Then PASS if `codex features list` says enabled |
| 1149 | Pi: timestamp injected context | bubbleptr | D | Same author, same fix as #1180 | Keep #1180 |
| 1148 | bundle statusline analytics import | tmurphy24-lab | A | D17 (statusline removed) | — |
| 1147 | bound ctx_execute on Pi | fl4p | B | Every ctx_execute has a default timeout on every host (P2) | Given no timeout arg, When code hangs, Then call ends at default timeout |
| 1144 | ctx-debug: redact env blocks + secret keys | L4XB | M | Security: debug report leaks tokens into public issues | tests/cli/ctx-debug-redact.test.ts reusable for `ctx doctor` output |
| 1143 | cleanup TTL off last activity | chaucerj | M + B | D6: age = last activity, not start | Given session started 30 d ago, used today, When cleanup, Then kept. tests/session/cleanup-preserves-active-sessions.test.ts reusable |
| 1138 | HTML tables without rows | NickYCLin | M + B | Fetch must not crash on rowless tables | Given `<table><caption>x</caption></table>`, When convert, Then caption kept, no throw |
| 1137 | docs: session continuity wording | vortsghost2025 | A | D11 (install never writes CLAUDE.md template) | — |
| 1129 | pin ABI healing to running Node | Zhao0335 | A | D2 (better-sqlite3 + heal removed) | — |
| 1128 | curl/wget pipe + multiline bounds | Tiancheng-Xu | A | D10 | — |
| 1127 | configurable echo budgets | sammcj | C | Later / reject in v2.0 (new env knobs vs P1) | Needs decision on echo design |
| 1126 | Pi: remove unverified routing anchor | grundstrata | A | D11 | Draft; alternative to #1122 |
| 1124 | route network cmds by transfer output | aktanazat | A | D10 | Superset of #1227 |
| 1123 | enforce resume snapshot budget | mradwankhalil | A | D9 (no snapshot in prompt) | — |
| 1122 | Pi: routing anchor once per session | emschwartz | A | D11 (1–2 SessionStart lines only) | Data: anchor costs ~82 tok/turn; supports D11 |

## Merge-now candidates (v1.x)
- Security: #1144 (close #1155 as duplicate).
- Crash or data loss: #1180 (close #1149), #1143, #1160, #1176, #1177, #1207, #1138.
- Windows UX: #1154.
All need CI approval first (fork runs not started).

## New decisions needed
1. Does `ctx-debug` / debug report survive into v2, or does `ctx doctor` replace it (redaction rules carry over)?
2. Install scope: user vs project install, and how v2 writes host config without dropping user entries (#1220, #1160).
3. Codex sandbox state: does ctx_execute_file defer to host sandbox (#1165)?
4. Default exec timeout on all hosts, and how host cancel reaches the executor (#1147, #1182).
5. Echo of code/commands in results: fixed rule or env knob (#1127)?
6. OpenCode 2: adapter base — #1171 or #1194?
7. Event priority polarity in the journal (#1181).

## Contradictions with v2-decisions.md
- #1194 adds host compaction summaries; D9 says no snapshot goes into the prompt.
- #1170/#1122/#1126 keep per-turn Pi injection; D11 allows only SessionStart lines.
- Routing PRs (#1124/#1128/#1189/#1227) refine hard blocks; D10 removes them.
- Merging #1143 (v1 SessionDB TTL) is fine for 1.x, but D1 says 1.x gets security fixes only; the crash/data-loss M items break that rule unless D1 is widened.
