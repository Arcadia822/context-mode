# Agent issue intake (proposed files)

These files come from `out/r2/round1/review/agent-issue-form.json` (round 1 agent-issue-form review). They are proposed, not yet applied to the repo.

Target branch: `main` (default branch). GitHub requires issue templates and `issues:` workflows to live on the default branch, so these files have no effect on `v2`.

This is a carve-out from the "main stays frozen" rule: it covers only these non-code, issue-automation files (`.github/ISSUE_TEMPLATE/*`, `.github/workflows/issue-intake.yml`, `.github/scripts/issue-intake*.mjs`, `CONTRIBUTING.md`). No source code on `main` changes to ship this intake system.

These files need an explicit owner accept — including the Q18 free-text wording above — before they merge to `main`, since they set the rules an agent must follow when it files an issue.

## Files

- `.github/AGENT_ISSUE.md` — the format rules for an AI agent filing an issue. It names the exact body headings, the data to collect with `ctx_doctor`, the data to leave out, and the digest rule. This is the file an agent must read and follow; it is the core of this intake, since most issues come from `gh issue create` or the REST API, not the web form.
- `.github/ISSUE_TEMPLATE/bug.yml` — the web issue form. It is written for an AI agent to read and fill, same as `AGENT_ISSUE.md`; its required fields use the same headings so both paths parse the same way.
- `.github/ISSUE_TEMPLATE/config.yml` — issue chooser config.
- `.github/workflows/issue-intake.yml` — runs on `issues: opened/edited/reopened`. Calls `issue-intake.mjs` to check the body, then `issue-intake-act.mjs` to label, comment, close, or reopen.
- `.github/scripts/issue-intake.mjs` — checks a body against the required headings and recomputes the report digest. No regex; it parses by `### ` heading and `key: value` lines.
- `.github/scripts/issue-intake-act.mjs` — applies the check result: label `has-report`/`no-report`/`needs-report`, comment with the exact fix command, close as not planned, or reopen.
- `CONTRIBUTING.md` — states the repo takes issues only, points an agent at `AGENT_ISSUE.md`, and points a person at `/ctx-doctor`.

## Why this exists

Finding 1 in `agent-issue-form.json`: an issue form (dropdowns, required fields) only binds a person using the GitHub web UI. A coding agent filing with `gh issue create --body-file` or a REST POST skips the form, so a "required" field is not enforced for the reporter this intake targets. `AGENT_ISSUE.md` plus the `issue-intake` CI check are the enforcement for that path: invalid or thin bodies get closed with a comment naming exactly what is missing and the exact `gh issue edit --body-file` command to fix it.

## Rule this intake follows

The issue template is written for an AI agent, not a person. The agent reading it must send the most debug data it can: the full `ctx_doctor` typed report, plus real paths, logs, and command output in the free-text sections. Only secrets are stripped, everywhere (Q18).

## Open items from the review (see `agent-issue-form.json` for full evidence)

- Byte rule for the digest (which lines, LF, no fence) needs to go in ADR-0014.
- A `report:"issue"` input for `ctx_doctor` is proposed, to carry decision/hook-error rows, not yet built.
- Free-text fields ("what happened", "steps") keep raw paths, logs and command output per Q18; only secrets are stripped there, by the agent and by `issue-intake.mjs`'s substring scan — they do not get the typed-scanner redaction the `ctx_doctor` report block has, and are not meant to.
- ADR-0014 is status "Proposed", not yet "Accepted" — confirm acceptance before wiring this in.

## Changes

r4 fix pass: added the main-frozen carve-out for these files, the owner-accept gate, and corrected the open item that claimed free text needs a redaction pass (Q18 says the opposite: keep the raw detail, strip only secrets). Also fixed a leftover self-contradiction in "Rule this intake follows" (it still said "never free text with raw paths, commands, or secrets"), and fixed the same stale wording in `bug.yml`'s intro line, "What happened" hint, and checkbox label, which still told the agent to leave out paths/logs/transcripts.
