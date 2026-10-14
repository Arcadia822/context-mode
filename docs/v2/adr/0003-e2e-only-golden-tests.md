# ADR-0003: E2E and E2E-style golden tests; v1 unit tests stay until v2 passes the kept ones

- Status: Proposed (2026-10-14). The user decided "delete all unit tests, keep only E2E and E2E-style, golden path" on 2026-10-14. Open details: Q1, Q8 and Q9 in TECH-SPEC §10.
- Related: TECH-SPEC §6 · `tickets/v2-test-ledger.md` · PRD-v2 §13 (superseded by this ADR)

## Context

Measured on the v1 tree at `1a1bed13`. Its `tests/` is identical to `origin/main` @ `5869f4fa`; the only diff between them is `stats.json`.

| Fact | Value |
|---|---|
| Test files (`*.test.*` / `*.spec.*`) | 210 |
| Lines | 81,072 |
| Files importing `../src/` (white-box) | 136 |
| Files that start processes (`child_process\|spawn\(\|execa\|execFile\|StdioClientTransport`) | 64 |
| Distinct bug ids cited (`#NN`–`#NNNN`) | 221: 164 closed issues, 46 merged PRs, 7 closed PRs, 1 open issue, 3 numbers that are not an issue or PR |

Most v2 requirements (B rows in the issue map) are contract breaks at a process boundary: hook stdin/stdout, MCP stdio, config files, child processes. A white-box test does not exercise those boundaries.

## Decision

1. **Two layers, and nothing else:**
   - **E2E-style** (every PR, deterministic). The built artifacts (`server.bundle.mjs`, hook entry) run as child processes. A *fake host* drives them over stdio with recorded native payloads. No model is involved.
   - **E2E-live** (by hand and on release-candidate tags; never on a schedule, TECH-SPEC §6.9). A real agent binary and a real model turn, against the real server. Asserts on the transcript and on DB rows.
2. **Process-boundary rule:** a test file must not import from `src/`. Its inputs are processes, stdio, files and env; its outputs are the same. CI lint fails on `from "../src` or `from "../../src` under `e2e/`.
3. **Golden files:** expected outputs and DB rows are JSON files under `e2e/golden/`.
   - Volatile values are normalized before comparison (TECH-SPEC §6.4).
   - A golden file is changed only with `UPDATE_GOLDEN=1` locally plus a reviewed diff. CI never writes golden files.
4. **Pure algorithms** (chunker, ranking, gitignore matching, truncation) are tested only through tool output, for example `ctx_index` → `ctx_search` golden hits. No algorithm gets its own test entry point.
5. **Deletion gate:** every row of `tickets/v2-test-ledger.md` gets exactly one verdict in its last column:
   - `GPn/<case>`
   - `REMOVED:<ADR or G/E id>`
   - `N/A`

   The v1 `tests/` tree is deleted in one commit, only when no row is empty and GP1–GP10 are green on macOS, Linux and Windows.

## Consequences

- Tests survive refactors, because they only see behaviour at boundaries.
- The suite is slower than unit tests. The per-PR wall-clock budget is TECH-SPEC §6.7.
- Recorded native payloads become fixtures. Each one is captured from a real agent once and stored with the agent version.
- A behaviour with no external effect has no test. That is intended: if nothing outside can observe it, it is not a contract.

## Alternatives considered

- **Keep unit tests for pure algorithms.** Rejected by the user's decision. Item 4 covers these algorithms through output.
- **In-process snapshot tests.** Rejected: they do not cross a process boundary.
- **E2E-live on every PR.** Rejected: it is non-deterministic and costly. Q8.

## r2 (2026-10-14, owner): supersedes the deletion decision above

- v1 unit tests are **not** deleted at the start. `docs/v2/review/TEST-TRIAGE-r2.md` classifies the 209 files: 131 KEEP-PASS, 52 PORT, 26 RETIRED.
- v2 is built until every KEEP-PASS test passes (after a mechanical import-path port where needed). PORT tests are rewritten; RETIRED tests are removed with their ADR named.
- E2E-style GP1–GP11 and the live harness are added on top (ADR-0017). The "no file under e2e/ imports src/" rule stays for the E2E layer only.
