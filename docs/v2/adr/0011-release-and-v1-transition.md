# ADR-0011: Branches, release, v1 user transition, v1 cleanup, metrics

- Status: Accepted for the order (G22, 2026-10-14). Each outward step still needs its own approval. Agents marked "test first" are open.
- Decided by the owner on 2026-10-14: branch `v2` (not `next`); no data migration.
- Evidence: workflow `wf_98d74014-ea1`, topics `release` and `v1-settings`. Raw output: `tickets/round3-evidence.json`.

## Branches

| Branch | Content |
|---|---|
| `main` | v1, frozen. `package.json` stays at the last v1 version |
| `v2` | development. CI runs on `[main, v2]` (today `ci.yml:5-8` says `next`) |
| `release` | **built output only**: bundles, generated manifests, skills. No `package.json`, because Pi runs npm when that file exists. Every release is a new commit with a higher `version` in `plugin.json` / `.codex-plugin/plugin.json`. Codex and Pi see only new commits, not tags; Claude Code keeps a cached copy unless the version changes |

Why `main` stays frozen: v1 `/ctx-upgrade` clones `main` and compares the `package.json` version (`cli.ts:1308-1321`). If the versions are equal, it prints "Already on latest" and builds nothing. So v1 users cannot be broken by v2 work.

When v2 is released, `main` gets the v2 source (docs, README) but keeps the frozen v1 `package.json`. v1 `/ctx-upgrade` then still does nothing.

## Release steps

Every outward step needs its own approval.

0. **CI release job** (on `v2`, triggered by tag `v2.*` or by hand):
   - build
   - `git switch --orphan release` the first time, later fetch `release`
   - copy the build output, commit `release vX.Y.Z`, push
   - `bundle.yml` stops committing bundles to `main`
1. **a) Version bump:**
   - set `"version": "2.0.0"` in `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` on `release`
   - do not set a version in the marketplace entry (v1 sets it in both places)
2. **b) Marketplace ref.** On `main`, edit only `.claude-plugin/marketplace.json` `plugins[0]`:
   - set `"source": {"source":"github","repo":"mksglu/context-mode","ref":"release"}`
   - remove its `version`
   - run `claude plugin validate .`
   - test in a clean HOME: `claude plugin marketplace add mksglu/context-mode`, then `claude plugin install context-mode@context-mode`
3. **c) Docs and release note**, with the exact update commands:

| Agent | Command |
|---|---|
| Claude Code | `claude plugin marketplace update context-mode && claude plugin update context-mode@context-mode` (auto-update is off by default for third-party marketplaces) |
| Codex | `codex plugin marketplace upgrade` (tested live in the distribution spike) |
| Gemini / Qwen | remove the v1 MCP entry, then `gemini extensions install https://github.com/mksglu/context-mode --ref release --auto-update` (Qwen: same form) |
| Pi | `pi install git:github.com/mksglu/context-mode@release` (source only, test first) |
| OpenCode 2 | `git+https://github.com/mksglu/context-mode.git#release` (disputed in the spike, test first) |
| Copilot CLI, VS Code, Kiro, ZCode | test first, then document |
| npm users | `npm uninstall -g context-mode`, then the agent's git install. On first run, `ctx_doctor` lists the v1 leftovers and `ctx_upgrade` removes them |

4. **d) npm deprecate.** The owner runs it with `--otp`:

   ```
   npm deprecate context-mode@"<2.0.0" "v1 is frozen. v2 installs from git: https://github.com/mksglu/context-mode#install"
   ```

   Only people who install or reinstall see this warning. Global users do not. v1 checks npm `latest` every hour, and nothing new will be published there, so v1 users get no "outdated" warning. **The README and the release note are the main channel.**

## v1 cleanup (no data migration)

There is one pure `detectV1(agent)` per agent. It returns `{file, path, reason}` and never edits. `ctx_doctor` reports the findings; `ctx_upgrade` removes them.

| Agent | v1 footprint | Rule |
|---|---|---|
| Claude Code | `settings.json` `.hooks.*` inner hooks; `hooks/context-mode-cache-heal.{mjs,sh}` + its SessionStart entry; `~/.claude.json` `.mcpServers["context-mode"]`; data `<configDir>/context-mode/` | Remove an inner hook only when its command contains `context-mode` **and** either a v1 script name or `context-mode hook`. Drop entries left empty. Delete the cache-heal files. A user-added MCP entry or `statusLine` (`context-mode statusline`) is reported with a fix, not removed |
| Codex | `hooks.json` entries (`context-mode hook codex`, `hooks/codex/*.mjs`); `config.toml` `[mcp_servers.context-mode*]`; data `<codexHome>/context-mode/` | Remove the entries and sections. Keep `[features] hooks` |
| Gemini | `~/.gemini/settings.json` `.hooks.*` commands with `context-mode`; data `~/.gemini/context-mode/` | Remove the entries. Delete data **only after a prompt**, because Antigravity shares this dir |
| Qwen | `~/.qwen/settings.json` `.hooks.*`; data `~/.qwen/context-mode/` | Same rule as Claude Code |
| Copilot CLI | whole file `~/.copilot/hooks/context-mode.json`; data `~/.copilot/context-mode/` | Delete the file |
| VS Code | whole file `<project>/.github/hooks/context-mode.json` | Delete the file (project scope) |
| Kiro | `~/.kiro/agents/default.json` `.hooks.*` flat entries; data `~/.kiro/context-mode/` | Same rule as Claude Code |
| Pi | `~/.pi/agent/settings.json` `packages[]` `"npm:context-mode"`; data `~/.pi/context-mode/` | Replace with the git entry |
| OpenCode | `"context-mode"` in `.plugin[]` of the first config found | Keep it if v2 uses the same id |
| ZCode | none | — |
| All | `~/.context-mode/` (v1 content), tmp files `context-mode-*` | Delete |

Facts:
- v1 **never** wrote routing text into user instruction files, and it has no markers. Those files are only reported, never edited.
- Copilot CLI, VS Code and Codex v1 hooks call the global `context-mode` bin. After `npm uninstall -g`, these hooks fail until the cleanup runs. The release note says so.

## Metrics (G23)

- New workflow `traffic.yml`:
  - cron `0 3 * * 1` (weekly)
  - `permissions: contents: write`
  - token: secret `TRAFFIC_TOKEN`, a fine-grained PAT with Administration: read
- It runs:
  - `gh api "repos/$GITHUB_REPOSITORY/traffic/clones?per=day"`
  - `gh api "repos/$GITHUB_REPOSITORY/traffic/views?per=day"`
- It merges the results into `metrics/traffic.json` by timestamp. The 14-day window spans two weekly runs, so one failed run loses nothing.
- It commits only when the file changed.
- Retire `update-stats.yml`: it adds all-time npm counts to 14-day clone counts every 6 hours. Point the README badges at `metrics/traffic.json`.

## r3 decision (2026-10-14, `docs/v2/review/DECISIONS-r3.md`)

- Q14: `main` is protected by GitHub branch protection.
- ADR-0017 R3: upgrade order is install v2 → `/ctx-upgrade` → `npm uninstall -g` last.
