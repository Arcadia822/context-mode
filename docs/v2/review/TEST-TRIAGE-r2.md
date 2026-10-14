# Test Triage — r2

Source: `out/r2/round1/review/tests-1.json`, `tests-2.json`, `qa.json`.
Scope: this file sorts v1 tests into KEEP-PASS, PORT, or RETIRED. It does not re-open the owner decisions.

## Totals

| Verdict | Count |
|---|---|
| KEEP-PASS | 131 |
| PORT | 52 |
| RETIRED | 26 |
| **Total v1 tests** | **209** |

## Totals by folder

| Folder | KEEP-PASS | PORT | RETIRED |
|---|---|---|---|
| session/ | 49 | 2 | 0 |
| adapters/ | 30 | 18 | 0 |
| hooks/ | 15 | 18 | 0 |
| tests/ (misc: util, core, cli, scripts, integration, analytics, executor, plugins, security, lifecycle...) | 37 | 14 | 26 |

All 26 RETIRED rows are in `tests/`, and all give an ADR id (`no-npm-for-v2`, `no-fallback-chains`, `ADR-0016`, `ADR-0123-openclaw-removed`). No RETIRED row lacks a reason.

## Table per test file

Full per-file verdict, ADR, and linked issue numbers are in `tests-1.json` and `tests-2.json` (209 rows). Key groups:

**RETIRED (26) — reason given per owner decision:**
- `no-npm-for-v2` (18 files): cli-upgrade-verification, ctx-doctor-distinguishes-states, ctx-upgrade-platform-threading, heal-better-sqlite3(-python), heal-installed-plugins, package-deps-policy, postinstall-heal(-mcp-json), start-mjs-self-heal, start-mjs-no-poison, upgrade-mcp-json-assertion, upgrade-plugin-json-assertion, upgrade-rewrites-shell-snapshots, upgrade-verifies-binding, asymmetric-drift-assert, start-mjs-mcp-boot, start-mjs-reexec-teardown-862, start-mjs-win-install-861, version-sync.
- `no-fallback-chains` (2): search-project-filter, search.
- `ADR-0016` (3): store-bytecap, truncate-removal, truncate.
- `ADR-0123-openclaw-removed` (1): openclaw (plugin variant; the `adapters/openclaw*.test.ts` files are a different, kept test).

**PORT (52)** — needs a v2 rewrite, mostly tagged `ADR-0008 r3` (hard-deny v1 scope) or `ADR-0016` (pi bridge / subagent bytes). Heaviest clusters: `hooks/core-routing`, `hooks/integration`, `adapters/detect*`, `adapters/*-external-mcp-routing`, `tests/core/server.test.ts` (29 linked issues), `tests/core/cli.test.ts`.

**KEEP-PASS (131)** — stays as-is, v2 must keep the `src/` import paths and exports these use. `session/` (49) and most of `adapters/` (30) are almost untouched; `tests/` keeps 37, spanning analytics, executor, store, lifecycle, runtime, statusline.

## QA round-1 findings on this split (qa.json)

- **Blocker**: ADR-0003 names no third layer for kept v1 unit tests and no KEEP-PASS list; 136/210 v1 tests import `src/` directly, so v2 must keep those module paths or the tests cannot pass.
- **Major**: TECH-SPEC says runner = `node:test`, but kept v1 tests run on vitest+TS; both runners need to stay in CI.
- **Major**: `/release` skill only runs `node --test e2e/cases`; it never runs the kept v1 tests, so a release can ship on a broken KEEP-PASS test.
- **Major**: B-row-to-GP mapping is incomplete (53 of 124 B issues referenced; 0 GP refs in the issue map).
- **Major**: ADR-0012 harness case list is missing the ADR-0016 LV8-LV10 (subagent large-output, a MUST) and ADR-0008 LV1-LV2 cases.
- **Major**: GS3 (hooks on Copilot CLI/ZCode/Pi/OpenCode 2) can never pass — those 4 agents are skipped as not-installed.
- **Major (regression-risk)**: GP9 only checks stdin-EOF exit, not the TTY gate that `tests/server-stdin-eof-exit.test.ts` pins (end listener must NOT register on a TTY) — retiring that file without an equivalent GP9 case can re-break issue #534/#236.
- **Minor**: ADR-0003 item 4 still lists "truncation" as a kept algorithm, contradicting the no-truncation decision; `truncate.test.ts` is already correctly marked RETIRED here, so just drop the ADR-0003 wording.
- **Minor**: PRD-v2.md:147 unit-test line for stats savings is not in the superseded table.
- **Minor**: Release only runs Haiku; the 3-model A/B is not gated.

## Proposed ADR-0003 r2 text

> ### ADR-0003 r2 — Test layers
>
> Three layers, and nothing else:
>
> 1. **v1 kept unit tests** (vitest + TS, runs from `tests/`, `session/`, `adapters/`, `hooks/`). The r2 triage file (`TEST-TRIAGE-r2.md`) is the single source of truth for which test is KEEP-PASS, PORT, or RETIRED, and for the ADR that retires or rewrites each PORT/RETIRED file. v2 keeps the `src/` import paths and exports that every KEEP-PASS file uses, or the PR that changes a path updates the test in the same diff.
> 2. **E2E golden tests** (`node:test` against built `.mjs`, cases GP1-GP11 from TECH-SPEC §6).
> 3. **Live checks** (ADR-0012 harness), including the subagent large-output cases (ADR-0016 LV8-LV10) and the updated-I/O cases (ADR-0008 LV1-LV2).
>
> No algorithm gets its own test entry point outside these three layers. "Truncation" is removed from any kept-algorithm list; v2 has no truncation step (ADR-0016), so there is nothing to port.
>
> **v2.0 exit gate:** every KEEP-PASS test from layer 1 passes, AND GP1 through GP11 pass. `/release` runs layer 1 (vitest on the KEEP-PASS list) and layer 2 before it runs layer 3, and stops on the first failure in any layer.
