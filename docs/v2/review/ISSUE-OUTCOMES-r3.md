# ISSUE-OUTCOMES-r3

Source: `out/r3l/issues-I.json` (issues) + `out/r3l/issues-P.json` (PR/doc findings). Re-verified against r2; not taken as truth.

## Totals

- Issues reviewed: 28
- PR/doc findings reviewed: 41
- Issues flagged r2_wrong: 0
- Issues with no verdict: 0
- PR findings with no severity (verdict): 11

### Issue verdict breakdown

- needs-decision: 23
- closed-by-design: 5

### PR finding severity breakdown

- blocker: 3
- major: 10
- minor: 17
- (none): 11

## Issues

| # | Verdict | Ref | Archaeology | r2_wrong | Question |
|---|---|---|---|---|---|
| #1210 | needs-decision | map-I0 #1210; ISSUE-OUTCOMES-r2 | - | no | Codex on Windows sets no workspace env var; what is the one fixed project-source for Codex under D4? |
| #1258 | needs-decision | map-I0 #1258; ISSUE-OUTCOMES-r2 | - | no | Is DeepSeek Harness (DSH) a v2.0 adapter, given D14 treats new adapters as separate scope and the issue gives no hook API detail? |
| #1261 | needs-decision | map-I0 #1261; ISSUE-OUTCOMES-r2 | 939c5ca8 — Detect parent death via ppid comparison, stdin close, and OS signals... Also adds WAL checkpoint on… | no | What CPU budget applies to PreToolUse (sync, blocks the tool call) vs PostToolUse (can be async)? |
| #1069 | needs-decision | map-I1 #1069; ISSUE-OUTCOMES-r2 | - | no | D10 says hints only, no enforcement — does 'hint parity' across Pi and Claude Code (P2) require identical hint text, or just equivalent rou… |
| #1079 | needs-decision | map-I1 #1079; ISSUE-OUTCOMES-r2 | 5e652e52 'feat(util/db-lock): per-DB lockfile primitive for single-writer enforcement' then 54ec1be7 'fix(util): delete db-lock.ts — single… | no | What is the retention rule for the content store (fetched/indexed sources): age-only, content-hash dedup, or liveness-gated like D6 session… |
| #1085 | needs-decision | map-I1 #1085/#1112; ISSUE-OUTCOMES-r2 | - | no | D9/D11 drop the big snapshot/block but still inject 1-2 lines on SessionStart. On OpenCode (single-system templates) and Pi (cache-stable p… |
| #1112 | needs-decision | map-I1 #1112; ISSUE-OUTCOMES-r2 (same as #1085) | - | no | Same as #1085 — Pi's ephemeral tail injection breaks cache; what carrier keeps the prefix stable across a multi-request turn? |
| #1140 | needs-decision | map-I1 #1140; ISSUE-OUTCOMES-r2 | 939c5ca8 (#103) introduced the parent-liveness/orphan-guard pattern (ppid + stdin close) that D6's 'live-PID safe' rule descends from. ORIG… | no | D6 fixes PID-liveness + 14-day age for session DBs — is that the full rule, or does a size cap also apply? |
| #1003 | needs-decision | map-I2 #1003; ISSUE-OUTCOMES-r2 | - | no | With D10 removing hard denies, does a hint still reach the model when Claude Code fires several tool calls in one parallel batch (hint for … |
| #1006 | closed-by-design | map-I2 #1006; ISSUE-OUTCOMES-r2 | 939c5ca8 lineage not directly relevant; deny path for WebFetch is a D10 policy choice, not a historical fix being re-broken. | no |  |
| #1016 | needs-decision | map-I2 #1016; ISSUE-OUTCOMES-r2 (tied to #1058) | eb4f2a8c 'feat(setup): add --uninstall flag for clean removal' — v1 already has an uninstall flag. ORIGINAL_INTENT: give users a clean remo… | no | Is `ctx uninstall` in v2.0 scope, and does it stop a running server before removing files? |
| #1017 | needs-decision | map-I2 #1017; ISSUE-OUTCOMES-r2 | - | no | What is Copilot CLI / Codex's one fixed project-source under D4 when no MCP roots are available? |
| #1031 | needs-decision | map-I2 #1031; ISSUE-OUTCOMES-r2 | - | no | D11 moves all routing prose into tool descriptions; #1031 shows that already costs ~6.2K tokens per call on Pi. What is the byte/token budg… |
| #1032 | closed-by-design | map-I2 #1032; ISSUE-OUTCOMES-r2 | - | no |  |
| #1039 | needs-decision | map-I2 #1039; ISSUE-OUTCOMES-r2 | - | no | Does honouring HTTP_PROXY/HTTPS_PROXY for ctx_fetch_and_index need an SSRF check on the resolved proxy target, or can it just pass the env … |
| #1047 | needs-decision | map-I2 #1047/#1067; ISSUE-OUTCOMES-r2 | - | no | Should ctx_execute drop the code-echo-first-line behaviour by default, and add an optional `summary` arg? |
| #1048 | needs-decision | map-I2 #1048; ISSUE-OUTCOMES-r2 | - | no | Plan mode (Claude Code 2.1.228+) blocks ctx_batch_execute entirely — add a read-only gather tool, or accept the host's own plan-mode prompt? |
| #1053 | closed-by-design | map-I2 #1053; ISSUE-OUTCOMES-r2 | Re-pointed per r2 note to ADR-0008 #6 + GP3. | no |  |
| #1055 | closed-by-design | map-I2 #1055; ISSUE-OUTCOMES-r2 | Re-pointed per r2 note to ADR-0008 #4 + LV7. | no |  |
| #1058 | needs-decision | map-I2 #1058; ISSUE-OUTCOMES-r2 (tied to #1016, #1005) | eb4f2a8c 'feat(setup): add --uninstall flag for clean removal' (precedent for cleanup scope); 2f457d2a 'fix(setup,adapters): resolve second… | no | Does uninstall remove the cache dir and stop the live MCP server, or only settings/hooks entries? |
| #914 | needs-decision | map-I3 #914; ISSUE-OUTCOMES-r2 | - | no | Should every ctx_index `--source` label include the path, or stay a bare label, given D12 ranks hits by labelled source? |
| #936 | needs-decision | map-I3 #936/#947/#959; ISSUE-OUTCOMES-r2 | Shell commands like grep exit 1 for no matches — not a real error. | no | What is the default server-side timeout value, and does kill-on-timeout target the whole process group (Windows: Job Object)? |
| #944 | needs-decision | map-I3 #944; ISSUE-OUTCOMES-r2 | - | no | Does v2 read host permission profiles (Codex settings, CC permissions) at all, or only its own config? |
| #947 | needs-decision | map-I3 #947/#936/#959; ISSUE-OUTCOMES-r2 | Same as #936 (ab5aad90 classifyNonZeroExit lineage). | no | Does the batch timeout bound the whole handler (exec + index + search), not just the child process? |
| #949 | closed-by-design | map-I3 #949; ISSUE-OUTCOMES-r2 | 939c5ca8 / D6 lineage (see #1140). | no |  |
| #959 | needs-decision | map-I3 #959/#936/#947; ISSUE-OUTCOMES-r2 | Same as #936. | no | Same timeout/kill-tree question as #936, specific to Pi's abort signal. |
| #961 | needs-decision | map-I3 #961/#962; ISSUE-OUTCOMES-r2 | - | no | What are the numeric total-byte and chunk budgets for indexing batch output, and what happens above the limit? |
| #962 | needs-decision | map-I3 #962; ISSUE-OUTCOMES-r2 | - | no | How is trigram/vocabulary growth bounded for logs/JSONL content — porter-stemming only above a size threshold, high-entropy token filtering… |

## Meta findings (on ISSUE-OUTCOMES-r2.md itself)

| File | Severity | Claim | Archaeology | Fix |
|---|---|---|---|---|
| docs/v2/review/ISSUE-OUTCOMES-r2.md | major | 71 rows are tagged needs-decision with no owner answer recorded; several (e.g. #1056/#988 multi-writer DB, #1121 soft-fail exit code) have … | 939c5ca8 'fix: add process lifecycle guard... Also adds WAL checkpoint on DB close to prevent SQLite lock contention'; ab5aad90 'fix: soft-… | Cite these commits directly in the ADR/decision text for #1056 (DB checkpoint ownership) and #1121 (kill exit codes must never be classifie… |
| tickets/map-I2.md:63 | minor | C1 (#1031 tool-description token budget) is flagged as an open contradiction but has no numeric cap proposed anywhere in the reviewed docs. | - | Set an explicit token budget for all tool descriptions combined (recommend <2K tokens) and add it to ADR-0011 or TECH-SPEC. |

## PR / doc findings (issues-P.json)

| File:Line | Severity | Category | Claim | Archaeology | Fix |
|---|---|---|---|---|---|
| tickets/map-P0.md:48 | blocker | regression-risk | #1231 verdict 'B: hints must cover external MCP tools' contradicts PRD-v2.md:103 'Never every mcp__ (#960 #897 #1212 #1222)', and ADR-0008 … | 855e330d — Adds PreToolUse matcher mcp__(?!plugin_context-mode_) to fire the context-guidance nudge for extern… | Verdict needs-decision: either add an ADR-0008 row 'external MCP tool (mcp__<other>__*): hint (or ADR-0016 case C replace)' with a GP3 case… |
| tickets/map-P0.md:12 | major | wrong-fact | #1290 verdict 'A: D8 hooks have no DB' is stale. Current ADRs make hooks read and write context.db: once-per-session hint keyed by session_… | 4f6f7cb6 | Verdict covered-by-test: GP3 bench (p95, per event) must include a PreToolUse case that opens context.db for the hint key; state in ADR-000… |
| tickets/map-P0.md:30 | major | wrong-fact | #1256 verdict 'A: D8 hooks no server socket/readiness files' is wrong now. ADR-0008 #4 keeps a readiness mechanism: mcp_tool hook on Claude… | 04569b12 — if MCP server hadn | Verdict closed-by-design ADR-0008 #4, test LV7 + GP3 case 'Claude Code with the server not connected → tool runs'. Add a GP3 case: ready ro… |
| tickets/map-P0.md:41 | minor | contradiction | #1240 (antigravity Stop hook) is marked 'B (+M) Reusable', but agy is removed from v2 (TECH-SPEC:47, PRD-v2.md:278). No v1.x line exists (P… | e479068a | Verdict wont-fix: agent removed in v2; v1 frozen. |
| tickets/map-P0.md:15 | minor | contradiction | #1285 (Cursor Windows PATH docs) is 'C (v2 docs)', but Cursor is removed in v2. | - | Verdict wont-fix: Cursor removed. |
| tickets/map-P0.md:36 | minor | wrong-fact | #1246 'Pi: MCP bridge per session workspace' expects '2 bridges'. v2 runs Pi as an in-process plugin, not over MCP, so there is no bridge. … | b70498a7 | Verdict closed-by-design (TECH-SPEC §3.7 in-process Pi) + GP7 case: 2 Pi sessions in 2 dirs resolve 2 projects. |
| tickets/map-P0.md:34 | minor | wrong-fact | #1249 'Pi incremental UTF-8 decode of MCP stdout' is 'M + B'. No v1.x line, and v2 Pi has no MCP stdout bridge. Only the general rule survi… | b70498a7 | Verdict closed-by-design (in-process Pi, no stdout bridge). |
| tickets/map-P0.md:21 | major | wrong-fact | #1277 'B: D6 owner-PID liveness needs cheap check' is stale. PRD E12 decides parent death = stdin EOF on every OS, no timers, no ps. So the… | 939c5ca8 | Verdict closed-by-design PRD E12 / GP9. Note that v1 tests/lifecycle.test.ts (readGrandparentPpid) fails by design and needs a ledger verdi… |
| tickets/map-P0.md:44 | major | gap | #1237 (Rust cwd + sandbox lifecycle) is 'B Reusable', but no v2 doc says whether ctx_execute keeps Rust (or other v1 languages). GP4 lists … | 60a1a254 | Verdict needs-decision: list the v2 ctx_execute languages. If rust stays, add a GP4 case 'rust runs in project cwd, temp dir removed' (#123… |
| tickets/map-P0.md:49 | minor | gap | #1230 'Schema declares every accepted field' conflicts with PRD-v2.md:127, which defines ctx_search as {queries[], ...} only. v1 server acc… | 103b41dd | Verdict needs-decision: declare `query` in the schema or reject it with isError and a one-line fix; add a GP5 case either way. |
| tickets/map-P0.md:25 | minor | test-gap | #1271 (JSONC comment boundaries) is 'Reusable', but v2 upgrade and cleanup edit host configs (ADR-0010 #4, ADR-0011) and GP11 does not list… | 7189ed6c | Verdict covered-by-test only after adding a GP11 case: JSONC config with '//' inside a URL string and a real comment; upgrade keeps both. |
| tickets/map-P0.md:19 | minor | wrong-fact | #1279 verdict 'A / B, D9 (no snapshot injection)' is stale: ADR-0009 r2 injects a state block after compaction, and OpenCode 2 delivery is … | - | Verdict needs-decision: fix the OpenCode 2 delivery path in ADR-0009 §6 with an 'exactly once after compaction, never on a plain plugin eve… |
| tickets/map-P0.md:13 | minor | wrong-fact | #1287 'C (later): stats design not yet decided' is stale. GP10 now lists #1287 ('per agent "no data" with the reason'); #1275 is addressed … | - | #1287 covered-by-test GP10; #1275 closed-by-design PRD §8 ctx_batch + needs a GP case. |
| tickets/map-P0.md:53 | minor | contradiction | 'Merge-now candidates (v1.x)' and 'New decisions needed: v1.x security only?' are void: G1 says no v1.x line, all PRs close at v2. #1245 (s… | INTRODUCED_BY (ctx-debug.sh): 4eba5aaf 2026-04-03 'feat: add cross-platform debug script + update issue/PR templates'. REGRESSION_RISK: non… | Mark the section superseded. #1247/#1243 closed-by-design ADR-0014; #1245 wont-fix for v1, plus a v2 needs-decision: audit the bundled @mod… |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:25 | major | wrong-fact | #1056 (and #988) closed as A by 'D3 one writer per file'. ADR-0002 now has many processes writing one context.db, so the premise is false a… | adds WAL checkpoint on DB close to prevent SQLite lock contention from stale connections | Change verdict to needs-decision: name the WAL checkpoint owner for a shared context.db; add a GP8 case. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:9 | major | risk | #975 contract 'Given background:true ... returns <2s' has no target: v2 ctx_execute has no background param. Dropping it changes v1 behavio… | enables starting HTTP servers and daemons from ctx_execute that subsequent ctx_execute calls can in… | needs-decision: keep `background` (then GP4 case) or drop it (wont-fix, state it in an ADR). |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:30 | major | contradiction | #1043 contract wants the hint to use the prefixed `mcp__...ctx_resume` name. TECH-SPEC §3.8 rule 1 says prompt text uses bare names and lin… | - | Verdict closed-by-design (ADR-0009, TECH-SPEC §3.8 Q12); GP6 asserts bare names (#1028). |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:10 | minor | wrong-fact | #1121 requirement 'stderr must be an error, not grep-style soft fail' reads as removing v1 soft-fail. v1 already returns isError for exit 2… | Shell commands like grep exit 1 for "no matches" — not a real error | Restate: keep exit-1 soft-fail or decide to drop it; GP4 'exit class' golden must list both cases. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:19 | minor | wrong-fact | #1086 and #1084 reasons cite 'curl/wget routing denies gone' / 'no hard denies'. ADR-0008 r3 keeps hard denies for curl/wget/WebFetch/build… | - | #1086: closed-by-design ADR-0008 #1 + GP3 `git log --grep="curl"`. #1084: wont-fix, ADR-0008 'No new deny categories'. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:17 | minor | contradiction | #1082 timeoutMs and #1041 proxy marked 'not decided'; PRD already decides both and GP4/GP5 test them. | - | #1082 closed-by-design; #1041 covered-by-test GP5. Also fix v2-not-closed.md:23 that lists them as no decision. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:40 | minor | unverified-claim | 'tests/... reusable' cites files not in the v1 tree: pi-mcp-bridge-cancel.test.ts (#1093), stats-reduction-pct.test.ts (#1042), batch-inges… | - | Point to GP4/GP10/GP5 cases instead; do not count them as kept v1 tests. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:57 | major | gap | #995 Windows vitest EPERM hang: owner keeps v1 unit tests and v2 is built until they pass, so this blocks v2 CI on Windows. Map says 'CI (n… | - | needs-decision: v2 CI runs v1 vitest on Windows; require DB handle close (#995 req) as a gate. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:47 | minor | ambiguity | #1033 contradiction note asks for MCP roots; README §5 and ADR-0007 decide no roots. The only verified WSL source in the spike is roots/lis… | INTRODUCED_BY 75ae6ae3 2026-03-05 'feat: multi-platform adapters, session continuity, hook scripts' (VSCODE_CWD in src/util/project-dir.ts:… | needs-decision: verify ${workspaceFolder} under Remote-WSL, or document the gap in doctor D7. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:51 | minor | contradiction | 'Merge-now candidates (v1.x)' and D1 note conflict with main frozen on v1 and 'No v1.x line'. | - | Mark the section superseded; all M rows become GP cases. |
| /Users/mksglu/.claude/claude-worktree-workspaces/oss-new/tickets/map-P2.md:40 | minor | wrong-fact | #1040/#1001 marked 'new decision'; README removes the pricing catalog. | - | wont-fix (README §3). |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| : |  |  |  | - |  |
| .github/ISSUE_TEMPLATE/bug.yml:70 | blocker | wrong-fact | Issue intake template 'Checks' list ('The body holds none of the items in "What you leave out"') tells filing agents to strip paths, file c… | - | Rewrite the template so the exclusion list only covers secrets/credentials (tokens, .env, API keys) and keeps everything else (paths, ctx_d… |
| tickets/v2-not-closed.md:6 | blocker | needs-decision | P1299 'hooks: route quoted curl/wget stdout destinations' is marked 'v2 hook routing must keep this as a contract test', but no ADR (0001-0… | - | Add the quoted-stdout-destination rule to the hook-routing ADR (or TECH-SPEC) before writing the GP contract test, or the test will assert … |
| tickets/v2-not-closed.md:7 | major | needs-decision | P1296 'server: wait for MCP handshake before platform storage' is marked as a contract test ('v2 project source must be read after initiali… | - | Classify P1296 against an explicit ADR row (server lifecycle / initialize ordering) before the contract test is written; otherwise mark nee… |
| tickets/v2-not-closed.md:8 | minor | needs-decision | P1302 'fix(codex): isolate project context for concurrent chats' is routed to 'GP7 contract test' from a title-only read (issues/PRs are di… | - | Keep P1302 as needs-decision until the v1 history (git log --grep '#1302' / '-S' on project-identity code) confirms GP7 is the right bucket. |
| tickets/v2-not-closed.md:15 | major | needs-decision | Of the 10 questions the v2 list says must be decided (I1048, I1047, I1031, I993, I962, I944, I867, I1204, I914, I1301), none appear in PRD-… | - | Add a 'Decisions needed' table to PRD-v2.md (or a new ADR-0017) enumerating these 10 ids with a decision owner and target date; otherwise v… |

## Rows without verdict

### Issues

- none

### PR findings

- :: 
- :: 
- :: 
- :: 
- :: 
- :: 
- :: 
- :: 
- :: 
- :: 
- :: 

## Open source docs

- PRD-v2.md
- docs/v2/README.md
- docs/v2/TECH-SPEC.md
- docs/v2/adr/0001-0016
