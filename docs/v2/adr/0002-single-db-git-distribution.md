# ADR-0002: One context.db per project; git-only distribution

- Status: Accepted (G21 and G22 approved 2026-10-14)
- Related: README §4, §7, §10 · `tickets/verify-single-db.md` · `tickets/spike-distribution-verified.md`

## Context

- v1 keeps separate session and content DBs in each agent's config directory, and its stats code scans all of them (#1248, #1111 in `tickets/v2-issue-map.md`).
- v1 ships through npm, with runtime installs and heal scripts. About 10 of the open v1 issues were native-binding or ABI failures (first issue scan, 2026-10-12).
- `verify-single-db.md` measured, on Node v26.8.1:
  - **C1:** node:sqlite with `timeout` sleeps on SQLITE_BUSY. A 2.5 s wait cost about 4 ms of CPU.
  - The #985 CPU spin came from v1's own `withRetry` busy loop (`src/db-base.ts:446`).
  - 8 writers, 4 FTS readers and a 20 MB indexer, all using `BEGIN IMMEDIATE`, gave 0 busy errors.

## Decision

1. **One SQLite file per project:** `~/.context-mode/projects/<git-common-dir-hash>/context.db`.
   - Tables: `events`, `sources`, `chunks` (FTS5), `meta`.
   - Every row carries `session_id`, `worktree` and `agent`.
2. **Engine and write rules:**
   - Engine: node:sqlite with `{timeout: 5000}`.
   - Every write transaction starts with `BEGIN IMMEDIATE`.
   - Index writes go in chunks of about 1 MB.
   - No retry loop.
3. **Distribution:** CI builds a git `#release` branch. No npm publish, no CLI, and no npm install at runtime.
4. **Migration order (G22):**
   1. version bump
   2. marketplace `ref:"release"`
   3. docs and release note
   4. `npm deprecate`

   Each outward step is approved separately.

## Consequences

- No cross-DB scans: stats read one file.
- Node versions that lack a stable `node:sqlite` with `timeout` are not supported. Which Node version is the minimum was **not** checked; `verify-single-db.md` says "Not checked: Node 22". This is spike S-NODE in TECH-SPEC §9.

## Alternatives considered

- **Keep two DBs.** Rejected: `verify-single-db.md` found no benefit.
- **better-sqlite3.** Rejected: its native ABI breaks were a recurring v1 failure class.
