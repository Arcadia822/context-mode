# BOTTLENECKS-r4

Ranked bottlenecks for the v2 release, built from `out/r4/A/round1/review/{bottlenecks,hooks-perf,storage,release-premortem}.json`. Round 2 has no matching files for these four roles, so this list uses round 1 only. Each item: what blocks, the number behind it, the evidence, and the fix. Decisions already settled in DECISIONS-r3.md (Q3, Q6, Q7, Q10, Q16) are not re-opened; the PRD text that still contradicts Q7 is flagged as a doc bug, not a new decision.

## 1. Hook runtime switch breaks the "no fallback chains" rule (BLOCKER, runtime)

- **Number**: bare Node startup is 45.6 ms p95 on the owner's Mac. The GS6 budget is 40 ms p95 wall for Claude Code hooks. Bare Node alone is already over budget.
- **Evidence**: `docs/v2/TECH-SPEC.md:39`; `src/runtime.ts` commit `4c74a1bf` ("add resolveHookRuntime + buildHookRuntimeCommand for bun auto-detection (#738)"); comment in `src/adapters/types.ts:401-403`: "cuts ~40-60ms of Node cold-start per tool call."
- **Why it blocks**: the only way the code meets GS6 today is try-Bun-else-Node. That is a fallback chain. The owner's rule is "no fallback chains." The spec and the rule contradict each other.
- **Fix**: pick one. (a) Name the Bun-then-Node switch as the one named exception to the no-fallback rule, with the cold-start number as the stated reason. (b) Set a GS6 number that plain Node can hit. (c) Make Bun a hard requirement for the 40 ms path and report "budget not met" when Bun is missing, instead of falling back silently.

## 2. Shared context.db has no corruption policy (BLOCKER, storage)

- **Number**: v2 merges all sessions, agents, and worktrees into one file (ADR-0002). v1's matching fix touched 1 file-handling rule per store type; v2 has 0 corruption rule for the merged file.
- **Evidence**: `docs/v2/adr/0002-single-db-git-distribution.md` lists engine, timeout, BEGIN IMMEDIATE, retention — no corruption clause. v1 commit `9e246a8e` ("fix: WAL checkpoint on exit + corrupt DB recovery (#244)") made SessionDB rename a corrupt file aside and made ContentStore delete-and-recreate it, because ContentStore was ephemeral. In v2 there is no ephemeral store left to delete — deleting would wipe every agent's history.
- **Why it blocks**: without a stated rule, the natural move (reuse the v1 delete path) destroys data for every session that shares the file, not just the one that found a corrupt DB.
- **Fix**: Add to ADR-0002: rename-only, never delete, for the shared file. Name the one process allowed to do the rename when multiple writers are open (matches Q6's "last writer" rule). State what the other open writers do once the path is renamed out from under them. Add a GP8-style multi-writer corruption test.

## 3. PRD still describes a deleted CLI command and the wrong delete scope (BLOCKER, delivery, doc bug against Q7/Q16)

- **Number**: 2 lines in PRD-v2.md (84 and 173) repeat the stale text.
- **Evidence**: `PRD-v2.md:84,173` says to run `context-mode doctor --fix`, a CLI command, and says it "deletes only one session's DB." ADR-0002 (Q7, accepted) replaced per-session DBs with one shared file. ADR-0010 (Q16, accepted) replaced the CLI with the `ctx_doctor`/`ctx_upgrade` MCP tools.
- **Why it blocks**: an agent that follows the PRD as written runs a command that does not exist, and if it improvised the old intent it would delete the whole project's shared DB, not one session.
- **Fix**: rewrite PRD-v2.md:84 and :173 to name `ctx_doctor`/`ctx_upgrade` tool calls (never a shell command) and the rename-aside recovery from item 2, not a delete.

## 4. #1261 (55-70 ms CPU per hook) has no fix and no retest plan (MAJOR, runtime)

- **Number**: 55-70 ms CPU measured per Bash call in v1, issue #1261, still open — `git log --all --grep=1261` and `git log --all -S 1261` on cm-main return no fixing commit.
- **Evidence**: `tickets/v2-issue-map.md:22,70`; `docs/v2/TECH-SPEC.md:39,291,342` states a GS6/GP3 budget but never shows the 55-70 ms figure retested against it; "PostToolUse async where host allows" is written as a requirement with no concrete mechanism named, and the current hook wiring (`src/adapters/claude-code/hooks.ts`) runs PostToolUse synchronously on every matched call.
- **Why it blocks**: GS6/GP3 cannot be marked pass/fail without a concrete async mechanism and a test that replays the #1261 case.
- **Fix**: name the async dispatch mechanism for PostToolUse on Claude Code (e.g., detached spawn, host does not wait on stdout) in the TECH-SPEC, keep index writes ordered before the next PreToolUse read, and add a GP3 case that replays #1261 (plain `ls`) with a pass/fail wall-time threshold.

## 5. No schema migration path for the shared DB (MAJOR, storage)

- **Number**: 0 migration mechanism named across ADR-0002 and TECH-SPEC; a grep for "user_version"/"migration"/"migrate" returns no hits beyond the bare words "schema version" in one doctor-check line.
- **Evidence**: `docs/v2/TECH-SPEC.md:228`; `docs/v2/adr/0002-single-db-git-distribution.md` §Decision 1 lists table names only, no version column. The owner's "frequent releases via /release" decision raises how often the schema can change.
- **Why it blocks**: with frequent releases and one long-lived shared file, an un-migrated schema change on first touch after upgrade is untested.
- **Fix**: add a `PRAGMA user_version` check at open, a migration step run once under the existing `BEGIN IMMEDIATE` discipline before any other writer proceeds, and a doctor check that reports a stale schema version separately from `integrity_check` failures.

## 6. GS6/GP3 state two numbers instead of one comparable number (MAJOR, runtime)

- **Number**: GS6 gives 40 ms wall for Claude Code hooks and "20 ms CPU on top of bare Node" (45.6 ms) for the other 9 command-hook agents — two different units, never added into one figure.
- **Evidence**: `docs/v2/TECH-SPEC.md:39`; `tickets/verify-single-db.md:20` ("Node startup alone costs about 28-37 ms CPU... Startup breaks the budget, not SQLite").
- **Why it blocks**: GP3's bench pass/fail line cannot be read without the reader doing the addition themselves, so a bench result near the line is ambiguous.
- **Fix**: one row per command-hook agent in TECH-SPEC §GS6/GP3: measured end-to-end wall time, spawn included, one pass/fail threshold.

## 7. release.yml still has no concurrency guard and no staging step (MAJOR, delivery — carried over, not new)

- **Number**: 2 prior rounds (r2, r3) already flagged this with the same fix; still 0 `concurrency:` block and 0 staging-ref step in the current ADR-0013 job table.
- **Evidence**: `docs/v2/adr/0013-release-automation.md` job table runs `publish` directly before `smoke`, no staging ref in between, no `concurrency:` key anywhere in the file.
- **Why it blocks**: a second release run during a first can publish twice before either smoke check lands; a bad build is published before anything verifies it.
- **Fix** (already specified twice, needs an owner decision, not another pass): add `concurrency: {group: release}` to the workflow; push to a staging ref, run smoke there, fast-forward to the release ref only after smoke passes.

## 8. DECISIONS-r3.md's "not edited yet" note is stale and risks false re-reports (MINOR, process)

- **Number**: of the 2 decisions spot-checked (Q3/ADR-0016, Q6+Q7+Q10/ADR-0002), both are already applied in the live ADR text, despite the file's closing line claiming none of the 19 have been edited into the docs yet.
- **Evidence**: `docs/v2/review/DECISIONS-r3.md` closing line vs. `docs/v2/adr/0016-subagent-context-protection.md` Case B (already matches Q3) and `docs/v2/adr/0002-single-db-git-distribution.md` "r3 decision" section (already has Q6/Q7/Q10) — but PRD-v2.md was missed for the same Q7 change (item 3 above).
- **Why it blocks**: a reviewer trusting the closing line would either skip checking applied changes or re-flag them as new, both wasted passes.
- **Fix**: add a per-row done/pending column to DECISIONS-r3.md instead of one closing sentence.

## Not a bottleneck, confirm only

- Codex plugin install (PRD-v2.md:179, E25) contradicts ADR-0011/0013 and a live-verified v1 install path (`codex plugin marketplace add`, spike result "Upgraded 1", v1 README.md:593). This is a doc-vs-ADR contradiction already raised in r3; the ADRs are right, fix the PRD line, not the ADRs.
- `45.6 ms p95` bare-Node figure (TECH-SPEC.md:39) has no named source script or dataset. Low severity, but name the benchmark so GS6 can be re-run, not just trusted.
- Node minimum version (ADR-0002 Decision 2) is still open, pending the S-NODE spike. Not new, restate as open rather than silent.
