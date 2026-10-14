# REVIEW-r3

Merges r3 outputs (`out/r3l/*.json`) with REVIEW-r2. One row per root cause. "Round" = round that found it (r2, r3, or both). Refuted blockers are dropped.

## Counts

| Severity | New in r3 | Merged with r2 | Dropped (refuted) |
|---|---|---|---|
| Blocker | 2 | 5 | 1 (v2-not-closed.md:6, P1299) |
| Major | 14 | 2 | 0 |
| Minor | 20 | 0 | 0 |

All r2 rows not named here stay open as written in REVIEW-r2.md.

## Blockers

| file:line | claim | archaeology | fix | target doc | round |
|---|---|---|---|---|---|
| adr/0008:16 | Same-scope table has no row for user `permissions.deny` on ctx_execute / ctx_execute_file / ctx_batch_execute. | v1 enforced deny on these tools; dropping it is a v1-scope loss. | Add explicit rows for each ctx tool. | ADR-0008 | r2+r3 (verified r3) |
| adr/0008:25 | "Body does not reach stdout" drops v1 silent-flag and verbose-flag checks; `curl -o f url` and `curl -s --verbose -o f` pass. | v1 hooks/core/routing.mjs:745-765, tests/hooks/core-routing.test.ts:178,186 (#166 stderr flood fix). Re-break = blocker. | Define "reaches output" to cover stderr: require silent flag, deny verbose/trace; keep both v1 tests in GP3. | ADR-0008 | r2+r3 (confirmed) |
| adr/0008:51 | ParseError -> allow is fail-open, also for user deny rules (`[[`, `((`, `case`, `<(`). | — | ParseError: deny when a user deny rule could match; allow only for the curl/HTTP rule. | ADR-0008 | r2+r3 |
| adr/0008:24 | Decision reads only argv0; wrappers (sudo, time, env, nice, timeout, xargs, command) and `$( )` hide curl/wget. | v1 scope covers these forms. | Unwrap known wrappers and walk substitutions before the decision; add GP3 golden rows. | ADR-0008 | r3 (new, not verified) |
| adr/0016:27 | Case B uses PreToolUse allow + updatedInput on Bash; Claude Code ignores it and skips the permission prompt. | v1 commit 4bc292fc "CC ignores" updatedInput. | Use deny + reason with a rewritten command, or replace via ctx tool; never allow. | ADR-0016 | r2+r3 (confirmed) |
| map-P0.md:48 | #1231 "hints cover external MCP tools" conflicts with PRD-v2.md:103 and ADR-0008 has no `mcp__` row; drops v1 #529 routing. | #529 added external MCP routing on purpose. | Decide one rule; add an `mcp__*` large-output row to ADR-0008 to meet ADR-0016 MUST. | PRD-v2, ADR-0008, map-P0 | r2+r3 |
| agent-issue-intake/.github/ISSUE_TEMPLATE/bug.yml:70 | Checks box tells agents to strip paths, logs, file contents, transcripts. Breaks the owner rule: maximum debug data. | Line 11 lists them as "Do not send". | Keep only secrets out (tokens, .env values); require paths, logs, versions, transcript excerpts, debug report. | ADR-0014, intake set | r3 (confirmed) |

Dropped: `tickets/v2-not-closed.md:6` (P1299 quoted curl/wget stdout) — refuted by verify-0.

## Majors by doc

### ADR-0009
- **0009:73** — Lazy greedy sort by ratio has no tie-break; output is not stable. Fix: tie-break by id then age. (r3)

### Intake set (docs/v2/review/agent-issue-intake)
- **BODY-FORMAT.md:1** — see intake.json finding 1; align body format with ADR-0008 r3 terms. (r3)

### tickets/ISSUE-OUTCOMES-r2.md
- **null** — 71 rows are needs-decision with no owner answer; #1056/#988, #1121 have v1 fixes at risk. Fix: list them for owner decision. (r3)

### tickets/map-P0.md
- **:12** #1290 "hooks have no DB" is stale; hooks now use context.db. (r3)
- **:30** #1256 "no readiness files" wrong; ADR-0008 #4 keeps readiness. (r3)
- **:21** #1277 PID liveness stale; PRD E12 uses stdin EOF. (r3)
- **:44** #1237 Rust in ctx_execute: no v2 doc says which languages stay. Fix: state language list in PRD GP4. (r3)

### tickets/map-P2.md
- **:25** #1056/#988 closed by "one writer per file"; ADR-0002 has many writers. Reopen. (r3)
- **:9** #975 background:true contract has no v2 target. Decide drop or keep. (r3)
- **:30** #1043 wants prefixed name; TECH-SPEC §3.8 rule 1 wants bare names. Pick one. (r3)
- **:57** #995 Windows vitest EPERM blocks kept v1 tests in CI. Make it a CI gate. (r3)

### tickets/v2-not-closed.md
- **:7** P1296 handshake-before-storage has no v2 target. (r3)
- **:15** 10 must-decide questions (I1048, I1047, I1031, I993, I962, I944, I867, I1204, I914, I1301) absent from PRD/ADRs. (r3)

## Minors

| file:line | claim | round |
|---|---|---|
| intake README.md:7 | Names target files not in this set | r3 |
| AGENT_ISSUE.md:1 | Agent-only rule met (note) | r3 |
| VALIDATION.md:1 | ADR-0016 not engaged by Actions intake (note) | r3 |
| map-I2.md:63 | #1031 token budget has no numeric cap | r3 |
| map-P0.md:41,15,36,34 | #1240 agy, #1285 Cursor, #1246/#1249 Pi bridge: platforms removed or no MCP bridge in v2 | r3 |
| map-P0.md:49 | #1230 schema vs PRD:127 ctx_search shape | r3 |
| map-P0.md:25 | #1271 JSONC not in GP11 | r3 |
| map-P0.md:19,13 | #1279, #1287 verdicts stale | r3 |
| map-P0.md:53, map-P2.md:51 | v1.x merge-now lists void (G1, main frozen) | r3 |
| map-P2.md:10 | #1121 soft-fail wording | r3 |
| map-P2.md:19 | #1086/#1084 cite "no hard denies" | r3 |
| map-P2.md:17 | #1082/#1041 already decided | r3 |
| map-P2.md:40 | cites test files not in v1 tree; #1040/#1001 pricing removed | r3 |
| map-P2.md:47 | #1033 asks for MCP roots, ADR-0007 says none | r3 |
| v2-not-closed.md:8 | P1302 routed from title only | r3 |
| issues-P #1227, #877 | reason/ref must cite ADR-0008 r3 / ADR-0016 | r3 |

## Sources

- docs/v2/review/REVIEW-r2.md
- docs/v2/review/out/r3l/*.json
- docs/v2/adr/0008-enforcement-rewrite-and-cap.md, 0009, 0014, 0016
- PRD-v2.md, docs/v2/TECH-SPEC.md
