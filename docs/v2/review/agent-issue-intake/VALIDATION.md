# The validating GitHub Action

File: `.github/workflows/issue-intake.yml`. Trigger: `issues: [opened, edited,
reopened]`. It runs a Node script, never a shell regex, because ADR-0014
rejects regex-based checks (that is the bug the old `ctx-debug.sh` had).

## What it checks

1. The body has the six headings from `BODY-FORMAT.md`, in order, each exactly
   once.
2. The `### ctx-report` section contains a fenced block starting with
   `ctx-report: 1` and ending with a `digest: <sha256>` line.
3. Every line between those two is `key: value`, and every key is one this
   intake defines (see `BODY-FORMAT.md`). An unknown key fails the check — it
   means the body was hand-edited, not produced by `ctx_doctor`.
4. The digest is recomputed over the exact bytes of the lines from
   `ctx-report: 1` to the line before `digest:` (LF endings, no fence
   characters) and compared to the stored value.
5. Each `Steps` line that mentions a denied tool also names the alternative
   it was given (a plain substring check, not a regex pattern over free
   text).

## What it does with the result

- All checks pass → label `has-report`, no comment.
- The report block is missing entirely → label `no-report`, comment that
  explains `ctx_doctor` was not run, quoting the one line from
  `AGENT_ISSUE.md` step 1, then close as not planned.
- The report block is present but fails a check (bad digest, unknown key,
  missing heading) → label `needs-report`, comment that names exactly which
  check failed and the exact `gh issue edit --body-file <path>` command to
  resend a corrected body. The issue stays open.
- A later edit event re-runs the same checks; if it now passes, the bot
  removes `needs-report`, adds `has-report`, and leaves a short confirmation
  comment.

## Files

- `.github/workflows/issue-intake.yml` — the trigger and job.
- `.github/scripts/issue-intake.mjs` — parses the body, checks headings,
  recomputes the digest, returns a structured result.
- `.github/scripts/issue-intake-act.mjs` — takes that result and applies the
  label/comment/close decision through the GitHub API.

Both scripts parse by splitting on `### ` headings and `key: value` lines —
no regex over the free-text sections, per the owner's "no regex/truncation as
decision" rule.

## Sources

- ADR-0014 §5: `docs/v2/adr/0014-issue-forms-and-debug-report.md`
