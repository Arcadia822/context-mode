# Owner questions, r3

Only the owner can answer these. Answer them in this order: the first ones unblock the most work.
Sources: ISSUE-OUTCOMES-r3.md (needs-decision), out/r3l/staff-*.json (ownerDecision), out/r3l/refire.json, REVIEW-r3.md blockers.

## Tier 1: unblock ADR-0008, ADR-0016 and GP3

**Q1. Does the external `mcp__*` tool output fall under v2 routing?** (#1231, #960, #897, #1212, #1222, #529)
- A: Yes. Add an `mcp__<other>__*` large-output row to ADR-0008 (ADR-0016 case C replace).
- B: No. Never touch other MCP tools (PRD-v2.md:103).
- Recommended: A. ADR-0016 MUST says large output never enters any context. v1 #529 (855e330d) added this routing on purpose. Keep PRD:103 for hints only.
- Unblocks: ADR-0008 table, ADR-0016 case C, map-P0 #1231, GP3 rows.

**Q2. What is the output byte cap after PostToolUse, and is it per tool or global?** (staff-enforcement ownerDecision)
- A: One global cap. B: A cap for each tool.
- Recommended: A, one global number in TECH-SPEC. No doc gives a number now. Do not reuse the 2 KB ctx_resume cap or the 4,096 B doctor cap.
- Unblocks: ADR-0016, ADR-0009 selection, #961, #962, GP3 and GP4 tests.

**Q3. How does ADR-0016 case B rewrite a Bash call?** (REVIEW-r3 blocker adr/0016:27)
- A: deny + reason with the rewritten command. B: replace with a ctx tool call.
- Recommended: A. v1 commit 4bc292fc shows Claude Code ignores `allow` + `updatedInput`. Never use allow.
- Unblocks: ADR-0016, GP3.

**Q4. When the shell parser fails, does v2 allow or deny?** (blocker adr/0008:51)
- Recommended: deny when a user deny rule could match; allow only for the curl/HTTP rule. Allow-always is fail-open.
- Unblocks: ADR-0008, GP3.

**Q5. Do v1 scope rules stay in full?** (blockers adr/0008:16, :24, :25)
- Recommended: Yes. Keep `permissions.deny` on ctx_execute, ctx_execute_file, ctx_batch_execute; unwrap sudo/env/time/nice/timeout/xargs/command and `$( )`; keep the #166 silent and verbose checks (v1 routing.mjs:745-765, tests 178,186). Owner rule: hard deny with v1 scope.
- Unblocks: ADR-0008 r3, GP3 golden rows.

## Tier 2: storage and process

**Q6. Who owns the WAL checkpoint for a shared context.db?** (#1056, #988; staff-storage-release Q2)
- Recommended: the server that closes last, plus a checkpoint on close (v1 939c5ca8). Add a GP8 case with 4 writers.
- Unblocks: ADR-0002, GP8, #1079, #1140.

**Q7. Retention rule for session DBs and the content store?** (#1079, #1140)
- A: age + live PID only (D6). B: also a size cap. C: also hash dedup.
- Recommended: A + a size cap. #962 shows growth with no bound.
- Unblocks: ADR-0002, #961, #962.

**Q8. Default ctx_execute timeout, and does it kill the whole process tree (Windows: Job Object)? Does it bound the whole batch handler?** (#936, #947, #959)
- Recommended: one fixed default, kill the process group, bound the whole handler. Keep v1 ab5aad90 (grep exit 1 is not an error; #1121 kill codes are not soft-fail).
- Unblocks: GP4, Pi abort.

**Q9. Does ctx_execute keep `background` and Rust?** (#975, #1237)
- Recommended: list the v2 languages in TECH-SPEC. Keep `background`: v1 used it for servers; dropping it breaks users.
- Unblocks: GP4, PRD tool schema.

**Q10. Minimum Node version (S-NODE)?** (staff-storage-release Q0)
- Recommended: the first Node with `node:sqlite`, timeout and no flag; verify with a spike. No npm for v2.
- Unblocks: install docs, CI matrix, #995.

## Tier 3: project source and hosts

**Q11. One fixed project source for Codex, Copilot CLI and Remote-WSL when no env var and no MCP roots?** (#1210, #1017, #1033, P1302)
- Recommended: name one source per host in ADR-0007; doctor reports the gap. No fallback chain.
- Unblocks: ADR-0007, GP7.

**Q12. Carrier for SessionStart lines on OpenCode and Pi that keeps the prompt cache stable?** (#1085, #1112, #1279)
- Recommended: tool description only, once after compaction. Unblocks: ADR-0009 §6, ADR-0011.

**Q13. Token budget for tool descriptions?** (#1031: about 6.2K tokens per call on Pi)
- Recommended: set a hard cap in ADR-0005 lint. Unblocks: ADR-0005, D11.

## Tier 4: release and repo

**Q14. Is "main frozen" enforced?** (staff-enforcement and staff-storage-release ownerDecision)
- A: Convention only. B: GitHub branch protection that blocks pushes.
- Recommended: B. Today only weekly.yml finds drift after the fact.
- Unblocks: ADR-0011, ADR-0013, M0.

**Q15. Which E2E replaces tier2-e2e-smoke.yml?** (refire, ADR-0015:50)
- Recommended: map it to the ADR-0012 keyless harness. Owner wants E2E, no API keys.

**Q16. Is `ctx uninstall` in v2.0, and does it stop the server and remove the cache?** (#1016, #1058; v1 eb4f2a8c)
- Recommended: yes, all three.

**Q17. Does the "no regex" rule cover CI lint too?** (refire, ADR-0005:44)
- Recommended: runtime code only; lint stays.

## Tier 5: intake and small scope

**Q18. What debug data must an agent send in a bug issue?** (blocker bug.yml:70; staff-enforcement Q4)
- Recommended: strip only secrets (tokens, .env values). Require paths, logs, versions, transcript excerpts and the doctor report. Owner rule: maximum debug data.
- Unblocks: ADR-0014, intake set.

**Q19. Small scope calls:** DeepSeek Harness adapter (#1258, recommend: no, D14); proxy env with SSRF check (#1039, recommend: check); drop code echo, add `summary` (#1047, recommend: yes); plan-mode read-only tool (#1048, recommend: accept host prompt); `--source` with path (#914); read host permission profiles (#944, recommend: Claude Code deny only, Q5); `query` field in ctx_search (#1230, recommend: reject with isError); hint in parallel batches (#1003); hint parity (#1069, recommend: same routing, not same text); hook CPU budget (#1261); ADR-0006 re-probe on Opus/Sonnet (refire).

## Sources
- docs/v2/review/ISSUE-OUTCOMES-r3.md
- docs/v2/review/REVIEW-r3.md
- docs/v2/review/out/r3l/staff-architect.json, staff-enforcement.json, staff-storage-release.json, refire.json
- docs/v2/adr/0002, 0005, 0007, 0008, 0009, 0011, 0012, 0014, 0015, 0016
