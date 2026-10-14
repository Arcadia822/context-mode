# ADR-0013: Maximum release automation: two owner acts per release

- Status: Accepted r2 (2026-10-14). Owner: releases are frequent; no SSH signing; one local skill does the release; workflows may go to `main`.
- Evidence: workflow `wf_8bf44d89-dc5`, topic `release-automation`: 16 findings verified, 5 unverified, 1 refuted. Raw output: `tickets/round5-evidence.json`.

## Today (v1)

- 5 workflows. Only `bundle.yml` and `update-stats.yml` push to the repo.
- The release itself is a manual runbook in the ops skill: `npm version`, push tags, `gh release create`, `npm publish`, branch sync, issue comments, Discord.

## Facts that shape the design

| Fact | Consequence |
|---|---|
| A push or tag made with `GITHUB_TOKEN` starts no other workflow; `workflow_dispatch` is the exception | build, publish and smoke must be jobs of **one** run |
| A push made by the owner does start workflows | the owner's signed tag can be the trigger |
| `claude plugin marketplace add` + `install` and `claude plugin validate` work in a clean HOME with no login | a keyless install smoke test can run in CI. It needs the npm package `@anthropic-ai/claude-code`; the npm package named `claude` is not Claude Code |
| `codex plugin marketplace add owner/repo@ref` also works with no login | same, for Codex |
| release-please and changesets assume an npm package or a manifest at the branch tip | they do not fit a `release` branch that holds only build output. A dependency-free script of about 50 lines is used instead |
| Pull requests are already disabled on the repo | no PR workflows and no Dependabot PRs |
| GitHub disables scheduled workflows after 60 days with no repo activity | the weekly traffic commit keeps the schedules alive [U] |

## Design

### The owner's one act per release

Type `/release` in Claude Code (repo skill `.claude/skills/release/SKILL.md`). Starting the skill is the approval. It runs the tests, the live harness (or `skip-live`), shows the version and notes, then starts `release.yml` with `gh workflow run` and watches it. No signed tag, no approval click.

### `release.yml` (on `v2`)

Trigger: `workflow_dispatch` only (input `sha`, or `mode: rollback`). The `/release` skill starts it; `workflow_dispatch` runs even when started from a token.

| Job | What it does |
|---|---|
| ci | GP1–GP11 on macOS, Linux and Windows (reuses `ci.yml`) |
| plan | `scripts/release/plan.mjs`: next version from Conventional Commits since the `Source-Commit:` trailer of the current `release` head (`!` → major, `feat` → minor, `fix`/`perf` → patch); release notes with `git-cliff` |
| build | bundles, every manifest generated from `adapters/table.ts`, 3 skills, no `package.json`; checks the tree; `claude plugin validate`; `SHA256SUMS`; build provenance attestation |
| publish | commit to `release` with the `Source-Commit:` trailer, tag `v2.x.y`, GitHub Release with the notes and `SHA256SUMS` |
| smoke | clean-HOME installs from `@release`: Claude Code plugin, Codex marketplace, Gemini extension (if the CLI installs) |

### Other workflows

On `main` (one owner-approved commit; `package.json` is not touched):
- `traffic.yml`: weekly
- `weekly.yml`: install smoke from `@release`, a check that repo settings have not drifted, `npm audit` of a v2 checkout
- removed at the same time: `bundle.yml`, `update-stats.yml`, `openclaw-e2e.yml`, `tier2-e2e-smoke.yml`

On `v2`:
- `ci.yml` on every push

### Done by hand, once

- create the `v2` branch
- the marketplace `ref: "release"` switch (G22 b, one approval)
- `npm deprecate` with the owner's OTP. **This step can never be automated.**

## Decided 2026-10-14

- Releases are frequent, so there is no per-release live-test gate in CI. The skill runs the live harness by default; `skip-live` is allowed and is written into the release notes.
- `traffic.yml` and `weekly.yml` go to `main` (owner: "main'e ekleyelim").
- No signed tags, no `release` environment approval.
