# Issue Outcomes (round 2, round1 review)

Source: docs/v2/review/out/r2/round1/review/issues-*.json

## Totals by verdict

| Verdict | Count |
|---|---|
| closed-by-design | 86 |
| needs-decision | 71 |
| covered-by-test | 53 |
| wont-fix | 47 |
| **Total with verdict** | **257** |
| **No verdict** | **12** |

## Rows

| Issue/PR | Verdict | Ref / basis |
|---|---|---|
| #1302 | needs-decision | Title only; PRs are disabled so the body cannot be read, and this cannot be confirmed as fixed by design. Topic is project identity per Code |
| #1301 | needs-decision | New feature, not in PRD. No ADR covers per-agent opt-in or scoped indexing. Owner decisions (no fallback chains, no npm) do not settle this; |
| #1300 | closed-by-design | v2 keeps one context.db (ADR-0002). The lifetime scan over many session DBs this PR speeds up does not exist in v2, so the fix is moot. |
| #1299 | covered-by-test | ADR-0008 r3 keeps hard deny for curl/wget, fixed with a parser (not regex). This quoted-arg case must stay as a GP3 contract test row so the |
| #1298 | closed-by-design | The start.mjs heal flow does not exist in v2 (ADR-0002: no heal step). The filter this PR adds to that flow has nothing left to attach to. |
| #1297 | closed-by-design | Owner decision: no npm install step in v2. A flag for an install step that does not run cannot apply. |
| #1296 | covered-by-test | v2 reads the project source only after MCP initialize (ADR-0002/GP1, closes #1255). Add a GP1 row asserting storage writes do not start befo |
| #1295 | covered-by-test | GP5 lists #1295 (non-ASCII) |
| #1294 | covered-by-test | GP7 'path containment by components' #1294 |
| #1293 | closed-by-design | ADR-0002 (no heal scripts, git release) |
| #1292 | covered-by-test | GP5 #1292 |
| #1291 | covered-by-test | GP5 '** matches zero dirs' #1291 |
| #1290 | covered-by-test | GP3 bench p95 (finding: hooks now use context.db) |
| #1287 | covered-by-test | GP10 #1287 |
| #1286 | covered-by-test | GP4 deleted cwd #1286 |
| #1285 | wont-fix | Cursor removed (TECH-SPEC:47) |
| #1284 | wont-fix | 10 agents fixed; Qoder out of scope |
| #1283 | wont-fix | README rewritten (ADR-0015) |
| #1282 | wont-fix | Mark these wont-fix (agent removed). Keep only the agent-independent part: absolute node path (PRD E15), static imports (PRD:45). Remove #12 |
| #1281 | closed-by-design | ADR-0002 no runtime installs |
| #1279 | needs-decision | ADR-0009 §6 OpenCode 2 path open: exactly once after compact? |
| #1278 | closed-by-design | ADR-0002 |
| #1277 | closed-by-design | PRD E12 stdin EOF / GP9 (keep #236/#311 constraints) |
| #1276 | closed-by-design | ADR-0007 #4 agent from request _meta/clientInfo; GP1 |
| #1275 | closed-by-design | PRD §8 ctx_batch short footer; no GP case |
| #1272 | closed-by-design | ADR-0008 #8 no injection into subagent prompts; ADR-0016 |
| #1271 | needs-decision | add GP11 JSONC case (#808) |
| #1270 | closed-by-design | ADR-0008 table: Read >50KB hint, once per session |
| #1269 | closed-by-design | Verdict #1269: closed-by-design ADR-0008 #2, test GP3 row 62. #1221: wont-fix (OMP removed, TECH-SPEC:47), class covered by GP3 rows 60-61. |
| #1267 | covered-by-test | Verdict: covered-by-test GP3 'hint once per session', ADR-0008 #7. |
| #1266 | covered-by-test | ADR-0010 D3 + GP11 'v1 install on each agent' |
| #1265 | covered-by-test | GP3 'PowerShell ... routed', hint once per session |
| #1264 | covered-by-test | GP2 no user-role injection #1264 |
| #1261 | needs-decision | needs-decision: one budget (proposal ≤ 20 ms CPU above bare Node for command hooks; mcp_tool hook on Claude Code). Fix GS6 and GP3. |
| #1258 | needs-decision | Close Q1 (ZCode), Q2, Q3, Q4; keep #1258 as needs-decision (not in README agents or removed list). |
| #1256 | closed-by-design | ADR-0008 #4 ready row / mcp_tool; LV7 |
| #1253 | closed-by-design | ADR-0002 |
| #1252 | covered-by-test | GP10 #1252 |
| #1250 | covered-by-test | GP4 exit class |
| #1249 | closed-by-design | Pi in-process, no MCP stdout (TECH-SPEC:81) |
| #1247 | closed-by-design | ADR-0014 ctx_doctor replaces ctx-debug.sh |
| #1246 | closed-by-design | Pi in-process; add GP7 case for 2 Pi workspaces |
| #1245 | wont-fix | v1 frozen (G1); v2 bundle dep audit needs-decision |
| #1244 | wont-fix | manifests generated on release branch (ADR-0011) |
| #1243 | closed-by-design | ADR-0014 |
| #1241 | closed-by-design | ADR-0009 journal via PostToolUse |
| #1240 | wont-fix | agy removed |
| #1239 | covered-by-test | ADR-0010 #4 keep user keys; GP11 |
| #1238 | covered-by-test | GP5 nested fences #1238 |
| #1237 | needs-decision | does ctx_execute keep rust? |
| #1236 | closed-by-design | ADR-0002 one DB; ADR-0011 no data migration |
| #1235 | covered-by-test | ADR-0010 #4; GP11 |
| #1234 | closed-by-design | D4 one fixed source per adapter |
| #1231 | needs-decision | external mcp__ routing: PRD:103 drops it, #529 regression |
| #1230 | needs-decision | declare or reject singular query |
| #1229 | covered-by-test | ADR-0009 §2 WHERE session_id; GP6 no foreign rows |
| #1228 | covered-by-test | ADR-0010 D3 timeouts; GP11 user-set timeout #1226 |
| #1227 | wont-fix | ADR-0008 r3 - Hard deny stays; r3 drops the generic size-deny, not curl/wget denies. Old note said hints only once false positives matter le |
| #1224 | closed-by-design | ADR-0011 (v1 cleanup, ensure-deps) - ensure-deps/heal removed in v2. |
| #1221 | closed-by-design | Verdict #1269: closed-by-design ADR-0008 #2, test GP3 row 62. #1221: wont-fix (OMP removed, TECH-SPEC:47), class covered by GP3 rows 60-61. |
| #1220 | closed-by-design | ADR-0011 (v1 cleanup) - heal scripts removed; install scope is a v2 decision, not a v1 patch. |
| #1219 | wont-fix | Mark these wont-fix (agent removed). Keep only the agent-independent part: absolute node path (PRD E15), static imports (PRD:45). Remove #12 |
| #1218 | covered-by-test | tests/executor.test.ts - Keep as GP case for Windows PATH. |
| #1216 | closed-by-design | ADR-0011 (v1 cleanup) - heal removed. |
| #1211 | needs-decision | stats data model (not in ADR-0008/0009/0010/0011/0014/0016) - No ADR in this set covers the stats rebuild; question stands. |
| #1210 | needs-decision | needs-decision: confirm Codex CLI cwd on Windows (config.toml entry, PRD E25) in live harness; add a GP7 row for Codex. |
| #1209 | covered-by-test | tests/runtime.test.ts - Keep as GP case. |
| #1207 | covered-by-test | tests/core/search-singular-query.test.ts - Schema/handler mismatch; keep test. |
| #1206 | wont-fix | Mark these wont-fix (agent removed). Keep only the agent-independent part: absolute node path (PRD E15), static imports (PRD:45). Remove #12 |
| #1204 | wont-fix | README fixes the 7-tool set; there is no ctx_page. Paging is done through ctx_search offset (PRD). |
| #1201 | wont-fix | Mark these wont-fix (agent removed). Keep only the agent-independent part: absolute node path (PRD E15), static imports (PRD:45). Remove #12 |
| #1197 | closed-by-design | ADR-0011 (v1 cleanup, no npm/Bun for v2) - Bun removed. |
| #1194 | wont-fix | ADR-0009 - No LLM compaction, ever; adapter design only is still the right split. |
| #1189 | closed-by-design | ADR-0008 r3 - Own shell parser decides by argv0 and parsed flags, already covers command-position checks. |
| #1183 | covered-by-test | tests/hooks/windows-hooks-normalization.test.ts - Keep partial reuse. |
| #1182 | needs-decision | map doc new-decision #4 (not in ADR-0008/0009/0010/0011/0014/0016) - Timeout/cancel path not decided in the ADRs read. |
| #1181 | closed-by-design | ADR-0009 - v2 journal has no priority field at all; score is kind-weight times decay times bonus. The polarity bug cannot recur; new-decisio |
| #1180 | covered-by-test | kept v1 test / fixes #1179 - Still a real Pi bug, unrelated to ADR-0009's compaction block. |
| #1178 | closed-by-design | ADR-0009 §1 - Journal already lives in context.db events table, not SessionDB; matches old verdict exactly. |
| #1177 | covered-by-test | tests/core/server.test.ts - Keep GP case. |
| #1176 | covered-by-test | tests/truncate.test.ts - Keep GP case. |
| #1174 | closed-by-design | Both closed-by-design. |
| #1173 | covered-by-test | Verdict covered-by-test GP6 (≤2048 B); add a GP6 case: two compactions in a row do not grow the block or trigger a third. |
| #1172 | needs-decision | not in ADR-0008/0009/0010/0011/0014/0016 - No ADR here sets the fetch error format. |
| #1171 | covered-by-test | tests/opencode-plugin.test.ts - Keep GP case for ADR-0009 OpenCode 2 delivery path too (test first). |
| #1170 | closed-by-design | ADR-0009 - Only re-injection point is SessionStart(compact); no per-request injection, confirmed. |
| #1168 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1167 | needs-decision | not in this ADR set - No change. |
| #1166 | closed-by-design | ADR-0011 (v1 cleanup) - Bun bridge removed. |
| #1165 | needs-decision | map doc new-decision #3 - Sandbox model still undecided. |
| #1164 | wont-fix | superseded by #1182 - Same bug. |
| #1162 | closed-by-design | Both closed-by-design. |
| #1161 | closed-by-design | ADR-0008 r3 item 8 - Routing lives in tool descriptions, not injected text; tool names must match hints. |
| #1160 | covered-by-test | tests/adapters/opencode.test.ts - Also matches ADR-0011 'keep user keys' rule for upgrade. |
| #1158 | wont-fix | ADR-0009 §4 - Eviction by label is gone; budgeted greedy by score replaces the cap entirely. |
| #1156 | needs-decision | needs-decision: retention for events/sources rows in context.db (never rows of a live session), then a GP6/GP8 case. |
| #1155 | wont-fix | duplicate of #1144 - No change. |
| #1154 | covered-by-test | tests/runtime.test.ts - No change. |
| #1153 | closed-by-design | ADR-0010 check D3 - Doctor compares config as data against the generated adapter table; exact match to the PR's fix. |
| #1150 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1149 | wont-fix | superseded by #1180 - Keep #1180. |
| #1148 | closed-by-design | ADR-0011/stats removal - Statusline removed; no change. |
| #1147 | needs-decision | map doc new-decision #4 - Default timeout still undecided in this ADR set. |
| #1144 | closed-by-design | ADR-0014 §3 - Typed scanner replaces regex redaction exactly as the PR wanted; GP11 in ADR-0014 is the test, test file still reusable for ct |
| #1143 | needs-decision | map doc contradiction note (D1/D6, not in this ADR set) - No change; still needs D1 widened. |
| #1141 | covered-by-test | Verdict covered-by-test GP11 (ADR-0014 §3 typed redaction), no 1.x fix. |
| #1140 | needs-decision | needs-decision: retention for events/sources rows in context.db (never rows of a live session), then a GP6/GP8 case. |
| #1138 | covered-by-test | kept v1 test - No change. |
| #1137 | closed-by-design | ADR-0008 r3 item 8 / ADR-0009 delivery - Install never writes CLAUDE.md; routing text is not injected. |
| #1135 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1134 | closed-by-design | #1099 closed-by-design (OMP removed); #1106/#1125/#1134 covered-by-test GP3. |
| #1129 | closed-by-design | ADR-0011 (v1 cleanup) - better-sqlite3/heal removed. |
| #1128 | closed-by-design | ADR-0008 r3 GP3 case `curl -s https://x.io / head -c 200` - Bounded-sink pipe and heredoc bounds are already in the golden cases. |
| #1127 | needs-decision | map doc new-decision #5 - Echo budget knob still open. |
| #1126 | closed-by-design | ADR-0009 delivery table (Pi: session_compact flag, once) - Alternative to #1122, same resolution. |
| #1125 | closed-by-design | #1099 closed-by-design (OMP removed); #1106/#1125/#1134 covered-by-test GP3. |
| #1124 | closed-by-design | ADR-0008 r3 item 2 - Per-pipeline decision by whether the body reaches stdout already does what this PR asked; #1227/#1128/#1189 fold into t |
| #1123 | closed-by-design | ADR-0009 §4 - Budget is 2,048 B by construction; no separate snapshot budget needed. |
| #1122 | closed-by-design | ADR-0009 delivery table - SessionStart-only injection confirmed. |
| #1121 | needs-decision | Keep v1 soft-fail (ab5aad90 2026-03-06: shell exit 1 + stdout = not error, for grep) or not? Exit 2 + stderr is already isError in v1 (src/e |
| #1119 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1118 | closed-by-design | ADR-0002 (node:sqlite only) |
| #1116 | closed-by-design | README §3 OMP removed; ADR-0009 |
| #1113 | closed-by-design | README §3 OMP removed; GP1 #1296 project read after initialize |
| #1112 | needs-decision | needs-decision: only constant bytes in systemPrompt; dynamic compaction block via the context hook; GP2 asserts byte-stable prefix across 2  |
| #1111 | closed-by-design | ADR-0002 one file, stats read one file; GP10 |
| #1106 | closed-by-design | #1099 closed-by-design (OMP removed); #1106/#1125/#1134 covered-by-test GP3. |
| #1104 | covered-by-test | GP3 matchers from recorded Codex payloads (TECH-SPEC §3.8 rule 2); kept v1 tests/adapters/codex.test.ts |
| #1099 | closed-by-design | #1099 closed-by-design (OMP removed); #1106/#1125/#1134 covered-by-test GP3. |
| #1098 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1097 | wont-fix | search limit env; no v2 decision, stray file |
| #1095 | wont-fix | Pi rendering (v2-not-closed §3 P1050 class), no test |
| #1094 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1093 | covered-by-test | GP4 cancel: process tree killed. Cited test file is not in v1 tree |
| #1092 | wont-fix | live progress, v2-not-closed §3 |
| #1091 | covered-by-test | GP5 #878 byte caps; PRD 'clip before highlight'; kept tests/store-bytecap.test.ts |
| #1089 | closed-by-design | ADR-0002 no heal scripts |
| #1088 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1087 | covered-by-test | ADR-0008 keeps user permissions.deny; kept tests/security.test.ts |
| #1086 | closed-by-design | ADR-0008 r3 change #1 own shell parser; GP3 'git log --grep="curl"' allow. Old reason 'denies gone' is wrong |
| #1085 | needs-decision | needs-decision: only constant bytes in systemPrompt; dynamic compaction block via the context hook; GP2 asserts byte-stable prefix across 2  |
| #1084 | wont-fix | ADR-0008 r3: no new deny categories. Old reason 'no hard denies' is wrong |
| #1082 | closed-by-design | PRD §ctx_execute and GP4 already use timeoutMs |
| #1079 | needs-decision | needs-decision: retention for events/sources rows in context.db (never rows of a live session), then a GP6/GP8 case. |
| #1077 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1076 | needs-decision | tool allow-list env with 7 tools? |
| #1075 | wont-fix | Assign each to a GP case (GP3/GP4/GP5/GP11) or to a kept v1 test file, or mark wont-fix with reason. |
| #1073 | covered-by-test | GP1 config valid for Kiro |
| #1069 | needs-decision | needs-decision: state that Pi gets the Read/Grep hint only from tool descriptions, and make the test assert description text, not hook outpu |
| #1067 | closed-by-design | #983 closed-by-design ADR-0004; add GP3 Windows hook-line case and GP4 'line 1 is not a code fence' case. |
| #1066 | closed-by-design | OMP removed (README §3) |
| #1058 | needs-decision | needs-decision: host uninstall only (and data dir left?), or an uninstall mode in ctx_upgrade. Drop the 'same test as #1058' row until decid |
| #1056 | needs-decision | ADR-0002 now has many writers on one context.db; who checkpoints, and is v1 close-time TRUNCATE (939c5ca8, #103) kept? |
| #1055 | needs-decision | Re-point: #1055/#1053 -> ADR-0008 #4 + LV7; #1006/#984 -> ADR-0008 #6 + GP3; #1003 -> ADR-0008 #7. #979 (headless) -> needs-decision, no ADR |
| #1053 | needs-decision | Re-point: #1055/#1053 -> ADR-0008 #4 + LV7; #1006/#984 -> ADR-0008 #6 + GP3; #1003 -> ADR-0008 #7. #979 (headless) -> needs-decision, no ADR |
| #1048 | needs-decision | Not referenced in PRD or README. Owner's "no fallback chains" rule bears on this but does not by itself set the read-only path; needs an exp |
| #1047 | needs-decision | Mentioned in PRD but left undecided. No owner decision in this round sets the default; needs explicit choice before a GP row can cite it. |
| #1044 | wont-fix | new adapter, out of 10 |
| #1043 | closed-by-design | ADR-0009 no snapshot; TECH-SPEC §3.8 rule 1 bare names. Map contract (prefixed name) contradicts PR12 lint |
| #1042 | covered-by-test | GP10 saved formula. Cited test file not in v1 tree |
| #1041 | covered-by-test | PRD E18 + GP5 'proxy env'. Map says not decided |
| #1040 | wont-fix | README §3 pricing catalog removed |
| #1039 | needs-decision | needs-decision: honour proxy only with a proxy-aware SSRF check (validate target host before CONNECT), or keep stripping and close #1039 won |
| #1037 | closed-by-design | closed-by-design ADR-0016; test = GP3 subagent rows + LV10. |
| #1035 | needs-decision | No npm in v2: is PI_CODING_AGENT_DIR still the Pi config source for doctor D3 / upgrade? |
| #1034 | closed-by-design | ADR-0008 r3 #8, ADR-0004 |
| #1033 | needs-decision | README §5 no roots; VS Code source = ${workspaceFolder}. Does it give the Linux path under Remote-WSL? spike-project-source.md:21 verified o |
| #1032 | needs-decision | needs-decision: VS Code source = ${workspaceFolder} arg; Codex plugin source unresolved. Add GP7 cases. |
| #1031 | needs-decision | Mentioned in PRD, no number fixed. Owner's reduction-mechanism rule (no truncation as the reduction mechanism) rules out one possible answer |
| #1030 | closed-by-design | ADR-0002 no retry loop, timeout 5000 |
| #1029 | closed-by-design | dup of #1093/#1009 |
| #1028 | closed-by-design | Pick one: bare names everywhere (fix ADR-0008) or exempt deny reason from PR12. Map verdict for #1018/#1028: closed-by-design TECH-SPEC §3.8 |
| #1026 | wont-fix | wont-fix, keep v1 once-per-session. |
| #1024 | closed-by-design | closed-by-design ADR-0002 for the per-session-file case; add a retention decision for rows in context.db. |
| #1019 | needs-decision | policy source per agent: Claude settings only or Pi native? |
| #1018 | closed-by-design | Pick one: bare names everywhere (fix ADR-0008) or exempt deny reason from PR12. Map verdict for #1018/#1028: closed-by-design TECH-SPEC §3.8 |
| #1017 | needs-decision | needs-decision: VS Code source = ${workspaceFolder} arg; Codex plugin source unresolved. Add GP7 cases. |
| #1016 | needs-decision | needs-decision: host uninstall only (and data dir left?), or an uninstall mode in ctx_upgrade. Drop the 'same test as #1058' row until decid |
| #1010 | wont-fix | new adapter |
| #1009 | covered-by-test | GP4 process tree killed; kept tests/executor.test.ts |
| #1006 | needs-decision | Re-point: #1055/#1053 -> ADR-0008 #4 + LV7; #1006/#984 -> ADR-0008 #6 + GP3; #1003 -> ADR-0008 #7. #979 (headless) -> needs-decision, no ADR |
| #1003 | needs-decision | Re-point: #1055/#1053 -> ADR-0008 #4 + LV7; #1006/#984 -> ADR-0008 #6 + GP3; #1003 -> ADR-0008 #7. #979 (headless) -> needs-decision, no ADR |
| #1002 | closed-by-design | TECH-SPEC §3 Pi systemPrompt; GP2 no user-role injection |
| #1001 | wont-fix | README §3 pricing removed |
| #996 | closed-by-design | ADR-0009 |
| #995 | needs-decision | v1 unit tests are kept and must pass on 3 OS: Windows vitest EPERM hang now blocks v2 CI. Map 'CI not decided' is stale |
| #993 | needs-decision | Mentioned in PRD, undecided. A related PowerShell routing case is covered elsewhere (GP3), but this hook-registration question is still open |
| #991 | covered-by-test | PRD ctx_search includes session content (#991); needs a GP5/GP6 case, not listed |
| #988 | needs-decision | same as #1056 (multi-writer single DB) |
| #987 | covered-by-test | GP9 parent kill on 3 OS; kept tests/lifecycle.test.ts |
| #986 | closed-by-design | ADR-0002 timeout, no busy-wait |
| #984 | needs-decision | Re-point: #1055/#1053 -> ADR-0008 #4 + LV7; #1006/#984 -> ADR-0008 #6 + GP3; #1003 -> ADR-0008 #7. #979 (headless) -> needs-decision, no ADR |
| #983 | closed-by-design | #983 closed-by-design ADR-0004; add GP3 Windows hook-line case and GP4 'line 1 is not a code fence' case. |
| #980 | covered-by-test | GP5 byte caps; PRD #980. Cited test file not in v1 tree |
| #979 | needs-decision | Re-point: #1055/#1053 -> ADR-0008 #4 + LV7; #1006/#984 -> ADR-0008 #6 + GP3; #1003 -> ADR-0008 #7. #979 (headless) -> needs-decision, no ADR |
| #975 | needs-decision | v2 ctx_execute schema has no `background` (PRD); v1 117e15f2 added it for servers/daemons. Drop or keep? |
| #974 | covered-by-test | GP9 no chdir |
| #973 | closed-by-design | ADR-0002 Bun removed |
| #972 | wont-fix | - - test-only v1.x portability fix, not a v2 ADR topic |
| #971 | closed-by-design | dup of #910 - covered by #910's fix |
| #970 | needs-decision | - - session retention (D6) not in any reviewed ADR |
| #969 | needs-decision | - - executor temp-file durability not addressed by reviewed ADRs |
| #968 | wont-fix | ADR-0008 owner rule - opt-in env timeout knob conflicts with P1 'one fixed default, no opt-in env' |
| #963 | covered-by-test | ADR-0009 GP6 / ADR-0016 GP3 - budgeted selection + whole-chunk rule bounds large rows |
| #962 | needs-decision | Mentioned in PRD, undecided. ADR-0016 (large output never enters subagent context) governs output handling, not the index's own growth bound |
| #961 | needs-decision | needs-decision: what happens above a size limit without dropping bytes. |
| #959 | needs-decision | Mark 936/947 needs-decision; keep kill-tree on cancel (GP4); no fixed default that kills builds, or decide per adapter row; keep the #406 te |
| #958 | closed-by-design | ADR-0011 v1 cleanup - cache-heal script removed entirely in v2 |
| #957 | needs-decision | - - new adapter scope (D14) explicitly open |
| #955 | closed-by-design | ADR-0008 item 8 - routing lives in tool descriptions, no prompt-file injection |
| #953 | wont-fix | GP9 stdin-EOF covers lifecycle; Desktop part wont-fix. |
| #952 | needs-decision | - - stats redesign (D17) not in reviewed ADRs |
| #949 | needs-decision | needs-decision: row retention in context.db (age, size), tested in GP8. |
| #948 | closed-by-design | ADR-0008 item 8 - same as #955, no AGENTS.md routing injection |
| #947 | needs-decision | Mark 936/947 needs-decision; keep kill-tree on cancel (GP4); no fixed default that kills builds, or decide per adapter row; keep the #406 te |
| #945 | covered-by-test | ADR-0008 GP3 / table item 6 - claude.ai artifact hosts explicitly allow-listed, never denied |
| #944 | needs-decision | Mentioned in PRD, undecided. No ADR fixes how v2 reads Codex settings kept in an external file. |
| #939 | needs-decision | - - tool-set consolidation not decided |
| #938 | closed-by-design | Re-verdict both closed-by-design ADR-0008 r3 #6, test GP3 artifact URL case. |
| #936 | needs-decision | Mark 936/947 needs-decision; keep kill-tree on cancel (GP4); no fixed default that kills builds, or decide per adapter row; keep the #406 te |
| #935 | needs-decision | - - stats UI trims (D17) not decided |
| #934 | needs-decision | - - batch tool's compound-command handling is separate from the hook parser in ADR-0008; not explicitly covered |
| #932 | wont-fix | - - small v1.x correctness fix, outside v2 ADR scope |
| #931 | closed-by-design | ADR-0011 - context-mode's own statusline feature removed (D17); user-added statusLine only reported, not fixed this way |
| #930 | wont-fix | - - docs-only v1.x fix, no v2 ADR affected |
| #929 | closed-by-design | ADR-0011 v1 cleanup - postinstall/heal scripts removed in v2 |
| #928 | wont-fix | - - skill docs text only, no v2 ADR affected |
| #927 | wont-fix | ADR-0008 (same scope table) - owner decision keeps WebFetch as a hard deny; advisory would reopen the r2 debate ADR-0008 closed |
| #924 | wont-fix | - - v1.x bugfix, not a v2 decision point |
| #922 | needs-decision | - - tool output format (batch footer) folded into an undecided tool redesign |
| #921 | needs-decision | - - ADR-0016/0009 select whole chunks by score but do not state a cross-query dedup rule |
| #920 | needs-decision | - - throttle message design not decided |
| #918 | closed-by-design | ADR-0008 item 8 - routing block injection removed; lives in tool descriptions only |
| #914 | needs-decision | Not referenced in PRD or README at all. The owner's issue-intake decision (AI-agent-only template, max debug data) does not set a label sche |
| #913 | needs-decision | - - tool name prefix source not pinned in reviewed ADRs |
| #910 | covered-by-test | kept v1 test (reusable) - adapters must never emit empty fields; test carries over |
| #908 | closed-by-design | Re-verdict both closed-by-design ADR-0008 r3 #6, test GP3 artifact URL case. |
| #907 | closed-by-design | ADR-0009 Decision - v2 never cuts text (whole items or pointers), so UTF-16-safe truncation is moot, not a reusable truncation test |
| #906 | covered-by-test | ADR-0010 D3 / ADR-0011 config regen - config compared and regenerated as data from one adapter-table source |
| #904 | needs-decision | - - abort-signal propagation for tools not addressed by reviewed ADRs |
| #901 | covered-by-test | covered-by-test GP11. |
| #899 | closed-by-design | ADR-0009 journal design - exit_code comes from a structured hook field, not text scanning, so stdout text containing 'Error' can't trigger a |
| #898 | covered-by-test | ADR-0009 GP6 - oversized chunk becomes a pointer, never cut mid-chunk |
| #897 | needs-decision | - - PowerShell hook matcher on Windows not addressed; live harness (ADR-0012) is Mac-only |
| #892 | wont-fix | - - docs-only; stats.json hunk is out of scope pending D17 stats redesign |
| #890 | wont-fix | wont-fix (G20). |
| #888 | closed-by-design | D3 per-session writers - stale PR, empty body; superseded by per-session writer design |
| #884 | needs-decision | - - ticket cites 'D16 docs rewrite', but the actual ADR-0016 reviewed here is subagent context protection, not docs; the docs-rewrite decisi |
| #880 | covered-by-test | covered-by-test GP8. |
| #877 | closed-by-design | ADR-0016 - accepted requirement: the same output budget applies in the main session and every subagent, via rewrite/replace per case A/B/C |
| #876 | closed-by-design | ADR-0011 / ADR-0008 item 8 - v1 never wrote routing text into user instruction files and v2 keeps no injection into prompt files |
| #871 | closed-by-design | ADR-0011 v1 cleanup / owner rule - heal-on-corrupt is a fallback; owner rule bars fallback chains, and heal scripts are removed |
| #867 | wont-fix | ADR-0002 removes the heal step entirely (also closes #1191/P1298). A self-heal-on-corruption feature has no step left to run in; v2 restarts |
| #866 | wont-fix | ADR-0010 D3 / ADR-0011 D3-D4 (map Contradictions) - honoring CLAUDE_CONFIG_DIR per-agent conflicts with the single shared-root/single-source |
| #864 | covered-by-test | ADR-0009 GP6 ('not the user role') - matches the decided rule, but CI is FAILURE so the implementation needs rework before the test is green |
| #863 | closed-by-design | ADR-0010 D2 / ADR-0014 decision 1 - v2 uses built-in node:sqlite, not better-sqlite3, so its Windows install path doesn't apply |
| #406 | needs-decision | Mark 936/947 needs-decision; keep kill-tree on cancel (GP4); no fixed default that kills builds, or decide per adapter row; keep the #406 te |

## Rows without a verdict

| Issue/PR | Note |
|---|---|
| #1262 | Add #1262 + 'zero child processes over N ticks' + 'parent killed with launcher in chain → exit' to GP9; mark the lifecycle.test.ts grandpare |
| #1248 | Owner decision needed: heartbeat-free readiness for command-hook agents (e.g. row written once at connect + pid liveness via process.kill(pi |
| #1225 | Point to ADR-0013 weekly.yml audit of the v2 source lockfile. |
| #1200 | Add #1200 to GP5 ('each declared param accepted'). |
| #1142 | Add GP7 case: Claude Code, no cwd arg, shell `pwd` returns the session worktree; keep tests/util/project-dir.test.ts. |
| #1090 | Replace the test: the MCP/hook command uses a stable launcher resolved at run time; GP1 runs it on Windows Git Bash and a snap node. |
| #960 | Keep external MCP output in scope via a no-spawn path (mcp_tool hook or PostToolUse replace); fix only the cost of #960; GP3 case for mcp__g |
| #903 | Close #903 by ADR-0009; replace the GP4 assertion with 'no cut; chunk boundaries code-point safe'. Archaeology 16b1b40b (#273). |
| #889 | GP1 checks every runtime file on #release. |
| #529 | Keep external MCP output in scope via a no-spawn path (mcp_tool hook or PostToolUse replace); fix only the cost of #960; GP3 case for mcp__g |
| #369 | Replace the test: the MCP/hook command uses a stable launcher resolved at run time; GP1 runs it on Windows Git Bash and a snap node. |
| #190 | Replace the test: the MCP/hook command uses a stable launcher resolved at run time; GP1 runs it on Windows Git Bash and a snap node. |
