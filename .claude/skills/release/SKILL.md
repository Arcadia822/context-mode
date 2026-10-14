---
name: release
description: Release context-mode v2 from the v2 branch. Runs the checks, an optional live test, shows the next version and notes, then starts the release workflow.
disable-model-invocation: true
---
Release context-mode v2. The owner starts this skill, so starting it is the approval for this release. Stop and report at the first step that fails; do not retry a failed step with a different method.

1. Check the start state. Run `git status --porcelain`, `git branch --show-current` and `gh auth status`. The tree must be clean and the branch must be `v2`. Run `git pull --ff-only`.
2. Run the deterministic tests: `npm ci && npm run build && node --test e2e/cases`. Show the failing test names if any fail.
3. Live test. If the owner wrote `skip-live` after the command, skip this step and say so in the final report. Otherwise run `node e2e/live/run.mjs --models haiku` and show `report.md`. If a required case fails, stop.
4. Preview. Run `node scripts/release/plan.mjs --dry-run`. Show the next version and the release notes. If it says there is nothing to release, stop.
5. Start the release: `gh workflow run release.yml --ref v2 -f sha=$(git rev-parse HEAD)`. Then follow it with `gh run watch` on the new run.
6. Report in one short table: version, release commit on `release`, GitHub Release URL, live test (passed, or skipped), and the smoke-install result per agent.

This skill never runs these one-time steps: switching the marketplace to `ref: "release"`, adding workflows to `main`, and `npm deprecate`. Ask the owner about each one separately.

Note: `e2e/`, `scripts/release/plan.mjs` and `release.yml` are created in milestone M0. Until then, step 2 onward reports "not built yet" and stops.
