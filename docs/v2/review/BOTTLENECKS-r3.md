# BOTTLENECKS r3

Source: `docs/v2/review/out/r3l/bottlenecks.json`. Re-check of r2/r3-A review output, not new evidence except where marked.

## Runtime

1. **[blocker]** Subagent large-output protection — ADR-0016 case B, Claude Code
   - File: `docs/v2/adr/0016-subagent-context-protection.md:27`
   - Claim: ADR-0016 names Case B (PreToolUse allow + `updatedInput.command` rewrite) as the default Bash truncation path. Claude Code does not apply `updatedInput.command` under `permissionDecision:allow` — the command runs with no change. So Case B does nothing. Full, untruncated output still reaches the subagent. This breaks the ADR-0016 MUST rule: large output must never enter any subagent context.
   - Evidence: ADR-0016.md:27 names Case B with no warning.
   - Archaeology: Introduced by `4bc292fc` (fix(hooks): claude-code Bash modify -> deny), Mert Koseoglu, 2026-05-31. Original intent (quoted): "CC v2.1.x Bash tool ignores updatedInput.command substitution under permissionDecision: allow -- the original command runs unchanged... Every bun-installed Claude Code user had been silently losing the context-saving intervention since #738 shipped -- high-impact regression." Regression risk: v2 brings back the exact bug `4bc292fc` fixed. Safe fix constraint: Case C (deny + re-issue a narrower command) or a hard deny must be the Claude Code default for Bash, until a live run on the pinned CC version proves Case B works.
   - Fix: Make Case C/deny the Claude Code default per the fix already proposed in REVIEW-r2.md. Add a CI check that repeats the `4bc292fc` forced-deny test against the pinned CC version before any Case B path ships.

2. **[blocker]** Release cache / rollback correctness — Claude Code marketplace cache
   - File: `docs/v2/review/RELEASE-AND-MIGRATION-r2.md:2`
   - Claim: Confirmed by test run: Claude Code caches the plugin bundle by version number. Pushing new content under the same version does nothing. Rolling back by writing an older version number serves the old cached bundle, not the new tree. ADR-0013 never defines `mode:rollback`, so a rollback run has no version-number rule and will serve stale content to every Claude Code user, not only at release time.
   - Evidence: RELEASE-AND-MIGRATION-r2.md section 1 row 2, and section 2 ("Claude Code cache: confirmed live").
   - Fix: `plan.mjs` must always set a version higher than the current release head, even in rollback mode. `release.yml` must fail the run if the new version is not higher than the current head (already proposed in RELEASE-AND-MIGRATION-r2.md).

3. **[blocker]** FTS index / DB contention under a single shared `context.db`
   - File: `docs/v2/adr/0002-single-db-git-distribution.md:17`
   - Claim: ADR-0002 moves every session, worktree and agent of a project onto one `context.db`, with no corruption rule. Under concurrent writes (many agents, many sessions) this is the one DB contention point for the whole project. The only existing recovery rule (PRD:84, "--fix deletes only that session DB") now deletes every session under the shared model, and names a CLI (`context-mode doctor --fix`) that ADR-0002 says does not exist.
   - Evidence: REVIEW-r2.md ADR-0002:17 blocker row; open issue #867 (mid-session SQLITE_CORRUPT), with no rule for it.
   - Fix: Add a corruption section: detect corruption at open and mid-session, stop with a hard error, and give a `ctx_doctor` fix step (a tool, not a CLI) that renames `context.db`/`-wal`/`-shm` to `.corrupt-<ts>` instead of deleting the shared DB.

## Delivery

1. **[blocker]** Test layer / ADR-0003 undefined — blocks all v1-test-pass and E2E gates
   - File: `docs/v2/adr/0003-e2e-only-golden-tests.md:1`
   - Claim: ADR-0003 still says v1 unit tests get deleted. This goes against the owner's rule: v1 unit tests stay until v2 passes the kept ones. 136 of 210 v1 test files import `src/` directly. So every other workstream that touches `src/` paths is blocked until this ADR is rewritten with a KEEP-PASS / PORT / RETIRED list — a list that TEST-TRIAGE-r2.md already has (131 KEEP-PASS, 52 PORT, 26 RETIRED). Release cannot gate on tests that do not exist yet.
   - Evidence: REVIEW-r2.md ADR-0003:1 and :22 blockers; TEST-TRIAGE-r2.md totals and QA blocker row ("ADR-0003 names no third layer... 136/210 v1 tests import src/ directly").
   - Fix: Put the TEST-TRIAGE-r2.md list into ADR-0003 as r2 text now (it is already drafted there). This one edit unblocks every workstream waiting on "tests pass".

2. **[major]** Owner-only release/CI decisions sit on one doc set, and the docs disagree
   - File: `docs/v2/review/RELEASE-AND-MIGRATION-r2.md:5`
   - Claim: ADR-0011 and ADR-0013 disagree on the release trigger (tag vs `workflow_dispatch` only). TECH-SPEC and ADR-0010/0011 disagree on "latest release tag" vs "latest release commit". TECH-SPEC says the runner is `node:test`, but the kept v1 tests run on vitest+TS. Each is a one-line pick, but no sub-team can pick it — these are release-pipeline decisions. They gate the `/release` skill and CI, so they block everything downstream of release until the owner picks.
   - Evidence: RELEASE-AND-MIGRATION-r2.md section 5; TEST-TRIAGE-r2.md QA major row on dual runners.
   - Fix: Pick `workflow_dispatch`-only and "commit" everywhere, in one pass across ADR-0010/0011/0013/TECH-SPEC. Keep both `node:test` and vitest in CI (this is already the real state) and say so in TECH-SPEC.

3. **[blocker]** ADR-0008 enforcement scope gaps block the most downstream work
   - File: `docs/v2/adr/0008-enforcement-rewrite-and-cap.md:16`
   - Claim: Four ADR-0008 gaps — ctx-tool deny scope, curl/wget stderr flood (regression of #166), dropped network-access deny text, ParseError fail-open on user deny rules — each touch the enforcement path every other hook and formatter calls. Each is a single point that many PORT-tagged tests depend on (the heaviest PORT cluster, per TEST-TRIAGE-r2.md, is tagged ADR-0008 r3) before those tests can be written.
   - Evidence: REVIEW-r2.md ADR-0008:16/:25/:38/:51 blockers; TEST-TRIAGE-r2.md PORT cluster note "mostly tagged ADR-0008 r3".
   - Fix: Resolve all four ADR-0008 rows in one pass (scope table, stderr check, deny text, ParseError split). The PORT test cluster cannot be written against a target that keeps moving.

## Decisions

1. **[blocker]** Codex install mode contradiction blocks README, ADR-0011, ADR-0013, PRD alignment and the release smoke job
   - File: `docs/v2/README.md:52`
   - Claim: README/ADR-0011/ADR-0013 say Codex installs as a plugin through the marketplace with `--ref release`. PRD E25 says Codex installs as a plain `config.toml` MCP entry, with no automatic project source. This one open question blocks: the release smoke job (which file to check), the v1→v2 migration order (RELEASE-AND-MIGRATION-r2.md section 4), and the Codex row of the detect table (ADR-0011 footprint gaps).
   - Evidence: REVIEW-r2.md README.md:52; RELEASE-AND-MIGRATION-r2.md section 1 row 1 and section 3 Codex row.
   - Fix: Pick plugin mode (it is the one already tested and partly working, per RELEASE-AND-MIGRATION-r2.md section 2), then fix the Codex marketplace ref gap in the same pass (ADR-0011:31).

2. **[blocker]** AI-agent-only issue intake has no enforcement path — blocks the owner's explicit rule
   - File: `docs/v2/adr/0014-issue-forms-and-debug-report.md:57`
   - Claim: Owner rule: issue templates must target AI agents only, and an agent reading them must follow our rules and send maximum debug data. ADR-0014 designs intake as a web form only. Coding agents file issues through `gh issue create --body-file` or REST `POST /issues`, where the web form's required-field check does not run. No workflow today checks issue bodies or re-checks the report digest, so nothing stops a low-debug-data issue from an agent. This open choice (web-form-only vs. a machine-readable spec) blocks the whole issue-intake system from meeting the owner's rule.
   - Evidence: REVIEW-r2.md ADR-0014:53 and :57 blockers.
   - Fix: Add `.github/AGENT_ISSUE.md` with the same fixed `###` headings as the web form, written for agents to read and follow, plus `.github/workflows/issue-intake.yml` that re-splits the body and checks the digest, and rejects bodies that skip required debug fields.

3. **[major]** Needs-decision issue backlog (71 open, 12 with no verdict) has no owner order
   - File: `docs/v2/review/ISSUE-OUTCOMES-r2.md:4`
   - Claim: 71 of 269 triaged issues are needs-decision, and 12 have no verdict at all. Several (#1261 hook CPU budget, #1258 ZCode/agent-removal scope, #1279 OpenCode 2 compact timing) block GS6/GP3/ADR-0009 work directly. With no single ranked list, each workstream picks its own order.
   - Evidence: ISSUE-OUTCOMES-r2.md totals table and rows #1261, #1258, #1279, #1271.
   - Fix: Owner picks one ranked batch of needs-decision issues per milestone, instead of deciding them one by one inside unrelated ADRs. Start with the three that already have a proposed answer in the Rows table (#1261, #1258, #1271).

## Release and migration risks

- Codex marketplace never follows the release ref (blocker, ADR-0011:31) — existing Codex installs stay silently on main forever.
- Claude Code rollback serves stale cache because `mode:rollback` is not defined (blocker) — a rollback during an incident makes the incident worse, not better.
- Smoke test runs after publish, not before (major) — a broken release is already live before smoke fails. Fix: stage the ref, then fast-forward.
- v1 footprint detect table misses: Gemini/Qwen/Kiro/Copilot-CLI/VS Code MCP entries, `~/.context-mode/platform.json` (holds the API key, must never be deleted), 3 of 4 `/tmp/context-mode-*` prefixes (one is a live-session ready-sentinel — deleting it while v1 runs breaks that session), and the Codex marketplace/plugins TOML entries.
- ADR-0011's current migration step order removes the npm global install before cleanup, which the doc itself admits breaks Copilot CLI/VS Code/Codex hooks mid-migration. Safe order: install v2 → restart → `ctx_upgrade` → restart → `ctx_doctor` clean → npm uninstall last.
- Two release runs at the same time can pick the same version and race on push (minor) — needs `concurrency: {group: release}` and `--force-with-lease`.

## Sources

- `docs/v2/review/REVIEW-r2.md`
- `docs/v2/review/ISSUE-OUTCOMES-r2.md`
- `docs/v2/review/TEST-TRIAGE-r2.md`
- `docs/v2/review/RELEASE-AND-MIGRATION-r2.md`
- `docs/v2/review/INTERN-QA-r2.md`
- `docs/v2/adr/0002-single-db-git-distribution.md`
- `docs/v2/adr/0003-e2e-only-golden-tests.md`
- `docs/v2/adr/0008-enforcement-rewrite-and-cap.md`
- `docs/v2/adr/0011-release-and-v1-transition.md`
- `docs/v2/adr/0013-release-automation.md`
- `docs/v2/adr/0014-issue-forms-and-debug-report.md`
- `docs/v2/adr/0016-subagent-context-protection.md`
- Git archaeology: commit `4bc292fc` in `cm-main` scratchpad worktree
