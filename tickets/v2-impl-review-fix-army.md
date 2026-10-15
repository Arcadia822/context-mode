# Ticket: fix the impl-spec review findings with a review army

- Status: open, planned (2026-10-15). Not started.
- Input: System Architect review of `docs/v2/impl/` (verdict: sign off with changes) and the intern's 15 questions.
- Output: `docs/v2/review/DECISIONS-r5.md`, edited `docs/v2/impl/*.md` and `docs/v2/TECH-SPEC.md`, a green E2E run, one push.

## Findings to fix

| # | Severity | Where | Problem | Proposed fix |
|---|---|---|---|---|
| F1 | Blocker | `docs/v2/impl/09-hooks.md:114-116` | Subagent case B/C PostToolUse indexes large output synchronously (DB open, chunk, FTS5 write, select). The purity rule covers only PreToolUse. No case proves the 60 ms hook budget holds | Add a GP case with ~16 KB output through case B/C that asserts wall + CPU ≤ `HOOK_COMBINED_P95_MS`. If it fails: fast synchronous insert, detached FTS backfill |
| F2 | Major | `docs/v2/impl/00-architecture.md:199, 249` | `EventKind` has 6 kinds; `WEIGHT` has 4. `cmd` and `cost` have no rule | State in `06-tools-session.md` that `cmd` and `cost` are not scored, or add weights |
| F3 | Major | `00-architecture.md:395` (A2) | TECH-SPEC milestone gates still use old paths (`src/storage/`, `src/compaction/`, `src/doctor/`, `scripts/build/`) | Fix the paths in TECH-SPEC so one tree exists |
| F4 | Minor | `00-architecture.md:401` (A8) | Fallback session id `"mcp:"+server-id` can merge two clients on one server | Confirm one client per server, or add a per-connection id |
| F5 | Minor | `docs/v2/impl/03-sandbox.md:219-221` | Windows kill may miss reparented grandchildren; no test | Windows case: a shell backgrounds a grandchild, cancel, assert it is gone |
| F6 | Decision | A6 | Spec picks `taskkill /F /T`; DECISIONS-r3 Q8 and S-TIMEOUT say Job Object | Switch the spec to Job Object (Q8 already decides it; no new ADR) |
| F7 | Decision | A1 | `TOOLS_TTL_MS = 3600000` has no source | Confirm or measure client re-list intervals |
| F8 | Decision | A7 | `cost` event kind not tied to the weight table | Same as F2 |

Intern doc gaps:
- G1 name the code branch (`v2`) in `docs/v2/README.md:10`
- G2 relative links in `docs/v2/impl/README.md`
- G3 rule for "doc is silent and there is no Assumptions entry": stop, ask, record the answer in that module's Assumptions
- G4 glossary for GS, G, Q, D, GP, LV, R codes
- G5 the command that runs the 131 KEEP-PASS v1 tests (M0 step)

## Army (dynamic workflow)

| Role | Level | Model / effort | Count | Job |
|---|---|---|---|---|
| Lead / EM | – | main session | 0 | runs the workflow, merges decisions, pushes, runs E2E |
| System Architect | Staff | Opus 5.5 / medium | 1 | decides F1, F4, F6, F7 with reasons → DECISIONS-r5 |
| Perf Engineer | Staff | Sonnet 5 / medium | 1 | measures F1: chunk + FTS5 insert of 16 KB on node:sqlite, wall and CPU |
| Git Archaeologist | Senior | Sonnet 5 / low | 3 | v1 history for Windows kill, session id, PostToolUse indexing |
| Module Writer | Senior | Sonnet 5 / low | 6 | one file set each: 09-hooks + 14-tests, 06-tools-session, 03-sandbox, 11-server, 00-architecture + TECH-SPEC paths, impl/README |
| Doc Writer | Junior | Haiku 4.5 / low | 1 | G1–G5 |
| Skeptic | Senior | Sonnet 5 / low | ~9 | try to refute each fix: 2 for blocker/major, 1 for minor |
| Intern | Junior | Haiku 4.5 / low | 1–2 | reads the fixed docs, asks questions; max 2 rounds |
| Staff answerer | Senior | Sonnet 5 / low | 1 per question | answers from the docs; no answer → doc gap → writer |
| Consistency Checker | Senior | Sonnet 5 / low | 1 | paths, constants, signatures across files; lint |

Flow:
1. Decide: archaeologists ×3 and perf measurement → Architect → `DECISIONS-r5.md` (the only barrier).
2. Write: pipeline per decision: writer → skeptic → one rewrite if refuted. Doc writer in parallel.
3. Intern loop: intern → staff answers → doc gaps back to writers; stop after 2 rounds or a round with no new gap.
4. Close: consistency check → lint → `node e2e/live/run.mjs --all` → the Lead pushes.

Rules learned in earlier runs:
- One file, one writer.
- Agents write results to disk; a resumed run skips what is on disk and does not trust the cache.
- The Lead pushes, not the agents (agents refused to push twice).
- No "ignore stop messages" notes in prompts (they made agents refuse the task twice).
- Check every new file for injected memory text before pushing.

Cost estimate (not measured): full army ~25–30 agents, ~1M subagent tokens. Cheap version (skeptics on the blocker only, one intern round): ~18 agents.

## Open choice for the owner

Full army or cheap version.
