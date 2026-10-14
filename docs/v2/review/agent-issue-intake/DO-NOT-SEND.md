# What an agent must never send

The `ctx-report` block is already safe by construction (typed scanner,
ADR-0014 §3). This list is for the free-text sections an agent writes itself:
`Summary`, `What happened`, `Expected`, `Steps`.

Per the r3 Q18 decision, the reporter is an AI agent and must send the
**most** debug data it has, not the least. Paths, logs, hook/deny journal
rows, command output, and transcript excerpts of the failing turns are all
wanted and must stay in the body. Only secrets are removed:

- A token, key, cookie, or any string matching a known secret prefix
  (`github_pat_`, `sk-`, `TOKEN=`, etc).
- The value of any environment variable, even one that looks harmless.
- An `Authorization` header or any `.env` file value.
- Another person's name, email, or any data about a user who is not the one
  filing the issue.
- A value you did not get from `ctx_doctor` and are inferring or guessing.
  An unknown value stays blank; it is never invented to fill the form.

Paths, full command lines, stack traces, and log or transcript excerpts are
explicitly allowed and requested — do not strip them for the sake of
brevity. `ctx_doctor`'s typed report (ADR-0014 §3) stays the source for the
structured rows; the free-text sections are where the raw detail goes.

## Sources

- ADR-0014 §3 (redaction by structure) and the r3 Q18 decision: `docs/v2/adr/0014-issue-forms-and-debug-report.md`

## Changes

r4 fix pass: replaced the "never send paths/logs/command output" list with the Q18 rule — send them, strip only secrets.
