# Exact issue body format

An agent builds the body as plain Markdown with these six headings, in this
order, nothing before `### Summary` and nothing between sections but one
blank line.

```markdown
### Summary
<one line, what is broken>

### ctx-report
```
ctx-report: 1
version: <semver>
commit: <hex40>
latest_release: <semver>
agent: <name> <version>
install_mode: <enum>
os: <enum>
node: <semver>
node_sqlite: <bool>
fts5: <bool>
mcp_protocol: <string>
enforcement_mode: <enum>
config_diff_count: <int>
v1_leftover_count: <int>
v1_leftover_1..8: <enum>
project_source: <enum>
has_space: <bool>
non_ascii: <bool>
max_len: <int>
db_integrity: <bool>
live_busy_probe: <bool>
index_count: <int>
hook_rt_median_ms: <int>
hook_rt_max_ms: <int>
hook_error_1..5: <enum>:<int>
hook_error_rest: <int>
deny_7d_total: <int>
deny_7d_followed: <int>
deny_7d_alt_failed: <int>
deny_7d_abandoned: <int>
check_d1..d10: <enum>
digest: <sha256>
```
### What happened
<free text, no paths, no env values, no command output — see DO-NOT-SEND.md>

### Expected
<free text>

### Steps
<numbered list; each step that was denied must name the denied tool and the
alternative `ctx_doctor` or the server gave it>

### Environment
node: <version from ctx-report, quoted, not retyped>
```

## How each field is collected

Every field in the `ctx-report` block comes from one call: the `ctx_doctor`
MCP tool. The agent does not compute, guess, or copy any of these values from
its own environment — only the tool's typed scanner (ADR-0014 §3) may emit
them, because only it is guaranteed to redact first.

## Redaction rules (inherited from `ctx_doctor`, ADR-0014 §3)

- Every value is typed: int, semver, hex40, date, enum, bool, or a JSON
  pointer whose segments are in the generated schema. Nothing else is a valid
  value.
- A value that fails the scanner becomes the literal `<invalid>`. It is
  dropped whole — never truncated, never partially shown.
- Paths, env values, config values, file bodies, raw error messages and
  command lines cannot appear in the `ctx-report` block, by construction, not
  by filtering.
- Error codes are members of the closed enum in `src/errors.ts`; an unknown
  code is also `<invalid>`.
- Free-text sections (`What happened`, `Expected`, `Steps`) are not covered
  by the typed scanner. The agent itself must not place a path, token, env
  value, or raw command line there — see `DO-NOT-SEND.md`.

## The digest

- `digest` is `sha256` over the exact bytes of every line from `ctx-report: 1`
  through the line before `digest:`, LF line endings, no trailing blank line,
  no code fence characters included.
- The validating Action recomputes this digest from the body it parses and
  rejects the block if it does not match (see `VALIDATION.md`).

## Sources

- ADR-0014 §2–3: `docs/v2/adr/0014-issue-forms-and-debug-report.md`
