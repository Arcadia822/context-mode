# Spike: git-only distribution, verified per agent

Release model: CI pushes prebuilt bundles (server.mjs, hook.mjs, plugin entries, skills) to the `release` branch and tags v2.x.y. No npm.

Rule: VERIFIED = the investigator confirmed it with evidence and no skeptic refuted it. Everything else is DISPUTED or UNKNOWN.

## 1. Table

| Agent | Git install (exact) | Update detection + command | Needs npm/bun? | Zero-npm path | Status |
|---|---|---|---|---|---|
| Pi | `pi install git:github.com/<o>/context-mode@release` | Commit SHA (ls-remote vs HEAD). `pi update --extensions` or `pi update <source>`. A pinned ref gets no "update available" notice, but an explicit update still fetches the ref. | Yes, if ANY package.json exists (existsSync only), even with zero deps | No package.json on release. Root `index.js` is auto-detected as the entry. | VERIFIED from source (7bd01fb). Not live-tested. |
| Oh-My-Pi | Marketplace: `omp plugin marketplace add <git url>`, then install `name@marketplace`. Or `git clone` + `omp plugin link <dir>`. | Marketplace: `omp plugin marketplace update`, plus auto mode. Link: `git pull`. `omp plugin upgrade` keeps the pinned #ref. | `github:` install/upgrade spawns `bun` by name. Brew, curl and nix installs may have no bun on PATH. | Marketplace (git clone) or clone + link | DISPUTED: the marketplace path was not re-checked by a skeptic. Not live-tested. |
| OpenCode | `"plugins": ["git+https://github.com/<o>/context-mode.git#release"]`, OR git clone + absolute path in plugins. MCP added separately: `{type:"local", command:["node","/abs/server.mjs"]}`. | Git spec: 24h check that compares commit revisions. Apply with `plugin update` (no auto-apply proven). Local path: `git pull`, then the file watcher hot-reloads. | No binary. In-process arborist, with ignoreScripts. The registry is contacted if package.json has deps. | Clone + absolute path, with zero-deps prebuilt files | DISPUTED: all evidence is from main v2.0.27 (`plugins` key). Released 1.x used the `plugin` key and `bun add`. |
| Codex CLI | `codex plugin marketplace add <o>/context-mode --ref release`, then `codex plugin add cm@<marketplace>` | Commit SHA of the ref (ls-remote). `codex plugin marketplace upgrade`. A background auto-upgrade thread exists (timing unknown). A tag alone never triggers an update. | No. Only git and node. | Marketplace on the release branch | VERIFIED live (CLI 0.156.1) for install and update. Runtime UNKNOWN. |
| Codex Desktop | Assumed same as CLI | Unknown | Unknown | Unknown | UNKNOWN: closed source, not tested |
| Antigravity | CLI: `agy plugin install https://github.com/<o>/<repo>` (docs only). IDE: `git clone -b release <repo> ~/.gemini/config/plugins/context-mode` | No update command (install, uninstall, enable, disable, list only). CLI: uninstall + install. IDE clone: `git pull`. | None documented. node on PATH. | IDE git clone; the CLI install likely takes the default branch | UNKNOWN: closed source, docs only, not run |

## 2. Per-agent notes

### Pi (badlogic/pi-mono @ 7bd01fb)
- Clone + checkout: package-manager.ts:1916-1918.
- npm/bun install runs if package.json exists (existsSync only): 1920-1922, 1990-1993. The investigator's "zero-deps package.json" path was REFUTED.
- No package.json: the entry falls back to root index.ts/index.js (569-609).
- Pinned ref: skipped only by the update CHECK (1247). `pi update` still fetches the ref into FETCH_HEAD (1137-1145, 1938-1941). The investigator's claim "pinned never updates" was REFUTED: tracking `@release` works through an explicit update.
- Install path: `<agentDir>/git/<host>/<path>` (user) or `<cwd>/.pi/git/...` (project). The ref is not in the path (2160-2182).
- Update runs `git clean -fdx` (1981-1987). Runtime data must live outside the clone.
- MCP: registerMcpServer (types.ts:1894). Hooks: session_start/tool_call/tool_result/session_shutdown. Skills: resources_discover (726-733). Skills with no manifest are not verified end to end.
- CLI verb: docs/cli.md:276-277.

### Oh-My-Pi (can1357/oh-my-pi, HEAD now 7738a3f; line numbers drifted)
- `github:` spec: manager.ts:78-91. It runs `bun install` / `bun update` (564, 626). No execPath/BUN_BE_BUN fallback.
- The claim "bun is always on PATH" was REFUTED: README.md:40-56 lists prebuilt binary installs.
- upgrade reinstalls the recorded spec, so a pinned tag stays (741-769). Linked plugins cannot upgrade (748, 753).
- Marketplace path is plain git clone (marketplace/fetcher.ts:249-305). Only one side checked it.
- Plugins can ship .mcp.json, skills and hooks (discovery/omp-plugins.ts:276-318). A Claude-style .claude-plugin is also read.
- Version-drift checks (1154-1162) may warn after a manual `git checkout` in a linked dir.

### OpenCode (sst/opencode main @ a22754f, v2.0.27)
- Git specs: util/src/npm.ts:57-88. Arborist reify with ignoreScripts:true (225), so the release branch must hold built files.
- Only `path.isAbsolute` counts as local (core/src/plugin/module.ts:103-116). Docs must say "absolute path".
- Update check: supervisor.ts:184-200, update.ts:9 (24h), npm.ts:360-383. Auto-apply was REFUTED as unproven.
- No plugin API registers MCP. The MCP entry is a second config edit. A git-spec cache path is hashed, so the MCP command should point at a separate clone.
- Released 1.x (packages/opencode) uses the `plugin` key and Bun install. These findings may not match what users run today.

### Codex (openai/codex @ 0c329ad2)
- add/upgrade: cli/src/marketplace_cmd.rs:41-66, 96-108. ls-remote compare: marketplace_upgrade/git.rs, marketplace_upgrade.rs:241-255.
- Auto-upgrade thread: core-plugins/src/manager.rs:2835-2862. Startup sync: startup_sync.rs:666. Timing is not traced.
- Bundle: manifest.rs:62-68, 386-393. Plugin hooks are always on (features/src/lib.rs:1626-1629).
- MCP cwd default: plugin_config.rs:66-69, 141-183 (one skeptic found it), agent_plugin_config.rs:217. DISPUTED. Use `${PLUGIN_ROOT}` in args.
- Sources: file:// URLs and local paths with --ref are rejected (marketplace_add/source.rs:180-186).

### Antigravity (closed; https://antigravity.google/docs/plugins)
- plugin.json is REQUIRED. Its schema has additionalProperties:false and a required `name` (https://antigravity.google/schemas/v1/plugin.json), so a Claude-style manifest will fail.
- The claim "IDE and CLI share plugins" was REFUTED. The CLI stores plugins in `~/.gemini/antigravity-cli/plugins/<name>/` (a copy). The IDE reads `~/.gemini/config/plugins/` or `.agents/plugins/`.
- No ref syntax, so the install probably takes the default branch.
- Hooks schema (#1206 grouped Stop) is unknown. A plugin-root path variable for mcp_config.json is not documented.

## 3. Codex live test (CLI 0.156.1, sandbox CODEX_HOME, ~/.codex untouched)
- `codex plugin marketplace add http://127.0.0.1:8765/remote.git --ref release` worked. config.toml stored `ref="release"`.
- `codex plugin add cm@cmtest` installed to `plugins/cache/cmtest/cm/0.0.1/`.
- New commit with version 0.0.2, then `codex plugin marketplace upgrade`: "Upgraded 1". The cache moved to `0.0.2/` with no manual re-add.
- Same commit: "already up to date". New tag only, no commit: "already up to date".
- Not tested: MCP server start, cwd/env, hook firing, skill load (`codex exec` needs an API call), auto-upgrade timing.
- Fixtures: `/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/live/`

## 4. Open risks and live tests still needed
1. **Default branch.** Pi (unpinned), Antigravity CLI and probably others take the default branch. Decide: make `release` the default branch, or use a separate dist repo.
2. **package.json conflicts.** Pi runs npm if one exists. omp `github:` and the omp link path need one. OpenCode git specs read one. Antigravity needs its own strict plugin.json. Plan per-agent layouts and test them.
3. **CI rules.** Each release must be a new commit on `release` and must bump `version` in the Codex plugin.json (cache key). Tags alone do nothing for Codex or Pi.
4. **node on PATH.** GUI apps (Codex Desktop, Antigravity) on macOS get a small PATH.
5. **Runtime data.** Pi `git clean -fdx` wipes the clone, so keep DBs outside the clone.
6. **Live tests still needed (M0):** Pi install + `pi update --extensions` with no package.json; omp marketplace path on a brew-installed omp (no bun); OpenCode released 1.x AND 2.x; Codex runtime (MCP/hook/skill) + auto-upgrade timing; Codex Desktop sharing ~/.codex; Antigravity agy install, branch choice, hooks schema, IDE clone path.
