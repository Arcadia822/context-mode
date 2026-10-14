# Spike: npm-free distribution (Oct 2026)

Legend: (U) = unverified / inferred, not confirmed in official docs this spike.

| Agent | Git install (cmd) | Skills / slash cmds in plugin | Update from git | Evidence |
|---|---|---|---|---|
| Claude Code | `claude plugin marketplace add owner/repo` then `claude plugin install ctx@mkt`; marketplace entry can pin `ref`/`sha` | Yes: `skills/`, `commands/` -> `/plugin:name` | Marketplace auto-update / `marketplace update`; new `version` in plugin.json or new commit | https://code.claude.com/docs/en/discover-plugins |
| Codex CLI | `codex plugin marketplace add owner/repo --ref <tag>` then install via `/plugins` | Yes: plugin ships skills; `.codex-plugin/plugin.json` | `codex plugin marketplace upgrade [name]` (git fetch of ref) | https://developers.openai.com/codex/plugins |
| Codex Desktop (U) | Shares Codex plugin marketplaces (U); IDE extension has no plugins | Skills (U) | Same as CLI (U) | https://developers.openai.com/codex/plugins |
| Gemini CLI | `gemini extensions install https://github.com/o/r --ref <tag> --auto-update` | Yes: `commands/*.toml` -> `/name`, `skills/*/SKILL.md` | `--auto-update` or `gemini extensions update` (compares git ref/release) | https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/index.md |
| Cursor | No user CLI git install. Team marketplace: Dashboard > Import from Repo (Teams/Enterprise). Public: reviewed submission | Yes: `.cursor-plugin` has skills, commands, hooks, MCP | Auto Refresh on push (GitHub, <=10 min) | https://cursor.com/docs/plugins |
| OpenCode | No git source. Local `.opencode/plugins/` or npm in `opencode.json` | Commands via `.opencode/command/` (U), not bundled in npm plugin (U) | No (npm only) | https://opencode.ai/docs/plugins |
| Pi | `pi install git:github.com/o/r@v1` | Yes: package has skills + prompt templates | Re-install / `pi update` (U) | pi-mono/packages/coding-agent/docs/packages.md |
| Oh-My-Pi | `omp plugin install 'github:o/r#v1.4.0'` or Claude-style marketplace | Yes: prompts, hooks, MCP, agents | Re-install at new ref (U) | https://omp.sh/docs/plugins |
| OpenClaw | `openclaw plugins install git:github.com/o/r@<ref>` | Partial: skill bundles detected, not all wired at runtime | `openclaw plugins update <id>` | https://docs.openclaw.ai/cli/plugins/install |
| Kiro | UI only: Powers > Add Custom Power > Import from GitHub (needs `plugin.json` or `POWER.md`) | Yes: MCP, skills, hooks, steering | Manual "Check for updates" | https://kiro.dev/docs/powers/installation/ |
| Qwen Code | `qwen extensions install <git-url>` (also Claude marketplace `<url>:<plugin>`) | Yes: Gemini-style commands + skills | `qwen extensions update` (U) | QwenLM/qwen-code docs/users/extension/introduction.md |
| Kimi CLI | `kimi plugin install https://github.com/o/r/tree/<branch>/path` | `plugin.json` (skills U) | Re-install (U). WARNING: repo archived, replaced by kimi-code (U plugins) | MoonshotAI/kimi-cli docs/en/customization/plugins.md |
| GitHub Copilot CLI | `copilot plugin marketplace add o/r` then `copilot plugin install ctx@mkt` | Yes: skills, agents, hooks, MCP (slash cmds U) | `copilot plugin update <name>` | https://docs.github.com/en/copilot/how-tos/copilot-cli |
| VS Code Copilot | `/plugin install <git-repo or mkt>` in chat (Agent Plugins 1.0 `plugin.json`) | Yes: skills, agents, hooks, MCP | `/plugin update <plugin>` | https://code.visualstudio.com/docs/copilot/customization/agent-plugins |
| JetBrains Copilot (U) | No agent-plugin git install found; only JetBrains Marketplace IDE plugin | Unknown | Unknown | https://plugins.jetbrains.com/plugin/17718 |
| Antigravity + agy | `agy plugin install https://github.com/o/r`; manual copy to `~/.gemini/config/plugins/` | Yes: skills/*/SKILL.md, agents, rules, hooks, MCP | Not documented (U) | https://antigravity.google/docs/plugins |
| Zed | No git URL install; clone + "Install Dev Extension". Published via zed-industries/extensions PR | MCP via extension; slash cmds (U); no skills | Registry updates only for published | https://zed.dev/docs/extensions |
| ZCode | UI: Settings > Plugins > Personal marketplace (Claude Code marketplace format) | Yes: skills, `/` commands, subagents, MCP, hooks | Via marketplace (U) | https://zcode.z.ai/en/docs/plugin |
