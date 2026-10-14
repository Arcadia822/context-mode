# AGENT_ISSUE.md — read this before filing a context-mode issue

This file is for an AI coding agent, not a person. A person asks their agent to
"file a context-mode issue"; the agent then reads this file and follows it.

## 1. How an agent finds this file

- `CONTRIBUTING.md` at the repo root links here first. Any agent that reads
  the repo before filing (most do) sees the link.
- The web issue form (`.github/ISSUE_TEMPLATE/bug.yml`) repeats the same
  instructions inline, so an agent that only sees the form still gets them.
- `ctx_doctor`'s output ends with this file's raw URL, so an agent that only
  called the tool, and never opened the repo, still gets a path to it.

## 2. Steps, in order

1. Call the `ctx_doctor` tool. Do not write your own diagnostic script.
2. Copy its `ctx-report:` block into the issue body unchanged — same lines,
   same order, same digest line at the end.
3. Fill the sections below the report block. Use the exact headings in
   section 3. Do not rename, merge, or drop a heading.
4. File with `gh issue create --body-file <path>` or the REST API. Do not
   paste the body into a comment or a PR; pull requests are not accepted.
5. If `ctx_doctor` itself fails or is missing, say so under "What happened"
   and still send the degraded-start report it is required to return (ADR-0014
   §1) — never substitute hand-written text for the report block. The report's
   keys are the fixed list in `BODY-FORMAT.md` (`version`, `commit`,
   `latest_release`, `agent`, `install_mode`, `os`, `node`, `node_sqlite`,
   `fts5`, `mcp_protocol`, `enforcement_mode`, `config_diff_count`,
   `v1_leftover_count`, `v1_leftover_1..8`, `project_source`, `has_space`,
   `non_ascii`, `max_len`, `db_integrity`, `live_busy_probe`, `index_count`,
   `hook_rt_median_ms`, `hook_rt_max_ms`, `hook_error_1..5`, `hook_error_rest`,
   `deny_7d_total`, `deny_7d_followed`, `deny_7d_alt_failed`,
   `deny_7d_abandoned`, `check_d1..d10`, `digest`) — this must match
   `issue-intake.mjs`'s `ALLOWED_KEYS` exactly.

## 3. Required headings, in this order

```
### Summary
### ctx-report
### What happened
### Expected
### Steps
### Environment
```

See `BODY-FORMAT.md` in this folder for what goes under each heading.

## 4. Rules this agent must follow

- Send the most debug data `ctx_doctor` can produce. Do not shorten, summarize,
  or paraphrase the report block.
- Never hand-write a value the report already carries (version, commit,
  enforcement mode). Quote the tool's value only.
- Never invent a value the tool did not return. An empty row stays empty.
- See `DO-NOT-SEND.md` in this folder for what must never appear in the body.
- If a check fails this file's format (see `VALIDATION.md`), the intake bot
  comments the exact `gh issue edit --body-file` command to fix it. Run that
  command; do not open a second issue.

## Sources

- ADR-0014: Issues only, with a typed `ctx_doctor` debug report; no pull requests — `docs/v2/adr/0014-issue-forms-and-debug-report.md`
- ADR-0016: Large output must not enter a subagent's context either — `docs/v2/adr/0016-subagent-context-protection.md`
- Review evidence: `tickets/round4-evidence.json`

## Changes

r4 fix pass: step 5 now spells out the exact key list, to match `issue-intake.mjs`'s `ALLOWED_KEYS`.
