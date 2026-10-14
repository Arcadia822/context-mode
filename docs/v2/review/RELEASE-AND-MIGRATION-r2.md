# Release and Migration — Round 2

Source: release-premortem.json (round1), v1-migration-sim.json (round1).

## 1. Failure modes: detection and rollback

| # | Failure mode | Severity | Detection | Rollback / fix |
|---|---|---|---|---|
| 1 | Codex marketplace stays on `.agents/plugins/marketplace.json` source `./` on main. `codex plugin marketplace upgrade` never moves to the release build. | Blocker | Smoke job must run the README command with no ref, then check `codex plugin list` for the release version. | Step b of ADR-0011 must also point this file to the release ref. If Codex cannot take a ref here, tell users to remove and re-add with `--ref release`. |
| 2 | `mode: rollback` is not defined. Claude Code caches by version number, so a rollback with an old version number serves stale cache. | Blocker | Rehearsed: same version → "already at latest", bundle unchanged. Rollback to a lower version → cache still holds old content. | Always roll forward: emit a version higher than the release head, even in rollback mode. `release.yml` must fail if new version <= current head. |
| 3 | Smoke test runs only after publish. A broken release is already live by the time smoke fails. | Major | Smoke job status after publish (too late). | Push to a staging ref first, smoke that ref, then fast-forward `release`. |
| 4 | Two release runs at once can pick the same version and race on the push. | Minor | No concurrency guard found in the workflow. | Add `concurrency: {group: release}`. Push with `--force-with-lease`. |

## 2. Rehearsal results (what was actually run, not assumed)

- **Codex, clean install, no ref**: `codex plugin marketplace add mksglu/context-mode` wrote a marketplace entry with no ref. This entry only ever reads `.agents/plugins/marketplace.json`, whose source is `./` on main — so it never reaches the release build.
- **Codex, local source**: `--ref` is rejected on local/file paths; this path could not be rehearsed end to end. The network form (`owner/repo@ref`) must be checked in CI, not assumed to work.
- **Claude Code cache**: confirmed live — pushing a new commit under the *same* version number is a no-op ("already at the latest version"); rolling back to an *old* version number serves the old cached bundle, not the new tree.
- **Claude Code v1 → v2 upgrade (marketplace path)**: this one worked. `claude plugin marketplace update` + `claude plugin update` moved an existing v1 install (1.0.169) to v2 (2.0.0) cleanly. Old (136 MB) and new cache dirs both exist side by side after the switch — the old one is host-owned and is not cleaned up by us.
- **`claude plugin validate`**: rejects a manifest shape that `claude plugin marketplace add` happily accepts — the broken manifest is only caught at install time, confirming failure mode #3.

## 3. Real v1 footprint vs. the ADR-0011 table

The ADR-0011 detect table is incomplete. Confirmed gaps, each checked against real files on disk:

| Surface | What ADR-0011 lists | What is actually there |
|---|---|---|
| Claude Code MCP | top-level `~/.claude.json .mcpServers` only | v1 README installs write to `.projects[<path>].mcpServers` instead; the top-level key is null. Table misses this, so v1 and v2 run side by side undetected. |
| Gemini / Qwen / Kiro / Copilot CLI / VS Code | hooks only | each of these also got an MCP server entry from the v1 README (`~/.gemini/settings.json`, `~/.qwen/settings.json`, `~/.kiro/settings/mcp.json` + project copy, `~/.copilot/mcp-config.json`, `.vscode/mcp.json`). None of these are in the detect table. |
| `~/.context-mode/` | marked "Delete" as one unit | this directory holds `platform.json` (a user API key) and v2's own content store, not just v1 leftovers. A blanket delete removes a live credential and v2 data. Needs per-path rules: delete `content/`, only report `platform.json` (and its Windows twin `%APPDATA%/context-mode/platform.json`), never delete it. |
| `/tmp/context-mode-*` cleanup | one glob, deleted outright | four different tmp prefixes exist (`context-mode-mcp-ready-`, `cm-fs-preload-`, `ctx-fetch-`, `ctx-upgrade-`); the ready-sentinel file is read by a live v1 session to find the MCP server. Deleting it while v1 is still running breaks that session. Must check the PID is dead first. |
| Codex marketplace entry | npm footprint only | the actual Codex state also has `[marketplaces.context-mode]` (no ref) and `[plugins."context-mode@context-mode"]`, which the detect step never looks at. |

## 4. Step order that keeps a v1 user working

ADR-0011's current order removes the npm global install before cleanup runs, which the doc itself admits breaks Copilot CLI, VS Code, and Codex hooks in between. A safe order:

1. Install v2 through the git/marketplace path (v1 install is untouched, still working).
2. Restart the agent, run `ctx_upgrade` — this is what removes the v1 entries.
3. Restart again.
4. Confirm `ctx_doctor` shows zero v1 findings.
5. Only now run `npm uninstall -g context-mode`.

This keeps one working install at every step instead of a gap where neither version's hooks run.

## 5. Other contradictions worth a one-line fix

- ADR-0011 says the release trigger is a tag or manual; ADR-0013 says tag in one place and "workflow_dispatch only, no tags" in another. Pick workflow_dispatch only and say so in both.
- TECH-SPEC says "latest release tag"; ADR-0010/0011 say "latest release commit" and note some agents only see commits. Use commit everywhere.
- ADR-0010 step 2 says marketplace installs skip downloading and "only do steps 3–5", but step 3 is the download. Should read "steps 4–6".
