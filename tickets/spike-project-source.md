# Spike: one project-dir source per adapter (context-mode v2)

Date: 2026-10-12. Goal: each adapter reads the user's project dir from exactly ONE source inside the MCP stdio server. No fallback chain.

Legend: (a) MCP `roots/list` · (b) host env var for MCP child · (c) variable expansion in server config · (d) spawn cwd = project.

## Recommendation table

| Agent | Single source | Confidence | Evidence |
|---|---|---|---|
| Claude Code (plain `.mcp.json`) | env `CLAUDE_PROJECT_DIR` | verified | code.claude.com/docs/en/mcp, /hooks |
| Claude Code (plugin) | `env: {CONTEXT_MODE_PROJECT_DIR: "${CLAUDE_PROJECT_DIR}"}` in plugin.json (plugin config expands it) | verified | code.claude.com/docs/en/plugins-reference; cwd = plugin cache on respawn (#42687, local `start.mjs`) |
| Codex CLI | `process.cwd()` (or user `cwd` in config.toml) | likely | codex-rs/rmcp-client/src/stdio_server_launcher.rs L329-342 (`fallback_cwd`) |
| Codex Desktop | none (cwd = `/`) | verified gap | openai/codex #16390 |
| Codex plugin install | none (cwd = plugin cache, no `${VAR}`) | verified gap | openai/codex #37903 |
| Gemini CLI | `roots/list` | verified | packages/core/src/tools/mcp-client.ts L1861-1876 |
| Qwen Code | `process.cwd()` (follows worktree switch) | verified | qwen-code mcp-client.ts L1459-1472 |
| Kimi CLI | `process.cwd()` | likely | kimi-cli src/kimi_cli/soul/toolset.py:860 (fastmcp, no roots) |
| OpenCode | `process.cwd()` | verified | packages/core/src/mcp/client.ts:253 (roots marked deprecated, :191) |
| Cursor | `${workspaceFolder}` in args/env | verified | cursor.com/docs/context/mcp (spawn cwd is `/` or `$HOME`) |
| VS Code Copilot (+ Remote-WSL) | `roots/list` (Linux paths in WSL) | verified | microsoft/vscode src/vs/workbench/contrib/mcp/common/mcpServerRequestHandler.ts |
| GitHub Copilot CLI | `process.cwd()` | likely | changelog 0.0.354 / 0.0.408; no roots (copilot-cli #4617) |
| JetBrains Copilot | none | unknown | copilot-intellij-feedback #715, #318; IDEA_INITIAL_DIRECTORY = IDE launch dir (IJPL-35336) |
| Zed | `process.cwd()` | verified | crates/project/src/context_server_store.rs `resolve_root_path()` |
| Pi | `roots/list` (built-in MCP); our bridge: env from `ctx.cwd` | verified | pi-mono packages/coding-agent/src/extensions/mcp/runtime.ts:364 |
| Oh-My-Pi | `roots/list` | verified | oh-my-pi src/mcp/client.ts:59-62 |
| OpenClaw | none automatic (user sets `cwd`/env) | likely | openclaw src/agents/mcp-metadata.ts:9 (no roots), mcp-stdio.ts:40 |
| Kiro | `process.cwd()` for workspace `.kiro/settings/mcp.json` only | likely | kirodotdev/Kiro #10486; kiro.dev/docs/mcp/configuration |
| Antigravity + agy | none automatic (cwd = `$HOME`, `${workspaceFolder}` not expanded) | likely | antigravity.google/docs/mcp; forum 144974, 119313; agy cli#548 |

## Per-point matrix

| Agent | (a) roots | (b) env | (c) expansion | (d) cwd = project |
|---|---|---|---|---|
| Claude Code | yes (launch dir + add-dirs; list_changed since 2.1.203) | `CLAUDE_PROJECT_DIR` per mcp docs; plugins-reference table omits it | `${VAR}`, `${VAR:-x}`; plugin: `${CLAUDE_PROJECT_DIR}` | plain: yes; plugin: no |
| Codex | no (only elicitation) | no | no; has `cwd`, `env`, `env_vars` | CLI: likely; Desktop: `/`; plugin: cache dir |
| Gemini CLI | yes | hooks only | `$VAR`, `${VAR}`; has `cwd` | yes |
| Qwen Code | yes | hooks only | `$VAR`, `${VAR}`; has `cwd` | yes |
| Kimi CLI | no | no | none found | yes |
| OpenCode | yes (deprecated) | no | `{env:VAR}`, `{file:..}` | yes |
| Cursor | maybe (old client table) | `WORKSPACE_FOLDER_PATHS` (forum only) | `${workspaceFolder}`, `${env:X}` | no |
| VS Code Copilot | yes (not for extension-registered servers, vscode#272420) | no (`VSCODE_CWD` = launch dir) | `${workspaceFolder}`, `${env:X}` | yes |
| Copilot CLI | no | no | `$VAR` in env; `cwd` field | likely |
| JetBrains Copilot | unknown | no | no | no |
| Zed | no (PR #53155 closed) | no | no; no `cwd` | yes (none if no worktree) |
| Pi | yes | no | env only | yes |
| Oh-My-Pi | yes | no | `${VAR}` everywhere | yes |
| OpenClaw | no | no | `${VAR}` | no (gateway cwd) |
| Kiro | unknown | no | approved `${VAR}` only | workspace cfg: yes; user cfg: install dir |
| Antigravity / agy | unknown | no | no | no (`$HOME`) |

## Agents with NO reliable single source

- Codex Desktop, and Codex plugin installs
- JetBrains Copilot
- OpenClaw
- Antigravity IDE + agy CLI
- Kiro user-level config (`~/.kiro/settings/mcp.json`)

For these, the installer must write an absolute path into the config (`cwd` or `CONTEXT_MODE_PROJECT_DIR`) for each project. Otherwise the server has no project.

## Risks and open items

- OpenCode marks `roots` deprecated (2026-07-28 comment). Check the MCP spec before betting v2 on roots.
- Claude Code docs disagree on whether plugin MCP servers get `CLAUDE_PROJECT_DIR`. The explicit `${CLAUDE_PROJECT_DIR}` in plugin.json `env` avoids the question.
- Kiro, Antigravity and JetBrains roots support is unknown. A probe server that logs `initialize` would settle it.
- Local code (`src/util/project-dir.ts`) never calls `roots/list` today.
