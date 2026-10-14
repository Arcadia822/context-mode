# What an agent must never send

The `ctx-report` block is already safe by construction (typed scanner,
ADR-0014 §3). This list is for the free-text sections an agent writes itself:
`Summary`, `What happened`, `Expected`, `Steps`.

Never put any of these in a free-text section:

- A file path, home directory, or project directory name.
- An environment variable value (even one that looks harmless).
- A token, key, cookie, or any string matching a known secret prefix
  (`github_pat_`, `sk-`, `TOKEN=`, etc).
- Raw command output, a stack trace, or a log excerpt. Ask `ctx_doctor` for
  the typed row instead; if no row covers it, say so in plain words.
- A full command line that contains a flag value, URL, or argument the user
  typed. Name the command, not its arguments.
- Another person's name, email, or any data about a user who is not the one
  filing the issue.
- A value you did not get from `ctx_doctor` and are inferring or guessing.
  An unknown value stays blank; it is never invented to fill the form.

If removing one of these leaves "What happened" or "Steps" too thin to be
useful, that is expected: the `ctx-report` block carries the debug weight,
not the free text.

## Sources

- ADR-0014 §3 (redaction by structure): `docs/v2/adr/0014-issue-forms-and-debug-report.md`
