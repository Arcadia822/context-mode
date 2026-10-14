# ADR-0004: No SKILL.md and no per-agent instruction files; prompts ship as MCP server instructions + tool descriptions

- Status: Proposed (2026-10-14). The user asked on 2026-10-14 for no skill file per adapter. Open details: Q2, Q7, Q10 and Q11 in TECH-SPEC §10.
- Related: TECH-SPEC §3 · ADR-0005 · ADR-0006

## Context

v1 (`origin/main` @ `5869f4fa`) ships prompt text in three places:

| Place | Files | Size |
|---|---|---|
| `SKILL.md` | 11: `skills/` ×8, `configs/copilot-cli/skills/context-mode`, `configs/antigravity-cli/skills/context-mode`, `.claude/skills/context-mode-ops` (maintainer only) | the routing skill alone is 16,683 B; its 3 copies are 300, 38 and 77 lines |
| Per-agent routing files in `configs/` | 13: `CLAUDE.md`, `AGENTS.md` ×6, `GEMINI.md` ×2, `QWEN.md`, `SYSTEM.md`, `copilot-instructions.md` ×2 | 55,870 B |
| Tool descriptions | 11 tools | 17,075 chars of descriptions + 9,749 chars of input schemas. 5 descriptions are longer than Claude Code's 2,048-char cut |

- Manifests that ship skills:
  - `.claude-plugin/plugin.json:30`
  - `.codex-plugin/plugin.json:24`
  - `.cursor-plugin/plugin.json:25`
  - `configs/antigravity-cli/plugin.json:11`
  - `configs/copilot-cli/.github/plugin/plugin.json:20`
  - `package.json:34` (`pi.skills`) and `package.json:68` (`files`)
- Adapters that write routing files into user space: Codex (`ROUTING_INSTRUCTIONS_PATH = "configs/codex/AGENTS.md"`), Kimi, OpenClaw, Qwen (`targetPath: "QWEN.md"`).
- The v1 server sends **no** `instructions`. `new McpServer({name, version})` at `src/server.ts:143`, and a live `initialize` returned `instructions: null`.

MCP defines one portable channel for this: `InitializeResult.instructions`.
- Schema 2025-11-25: "this information MAY be added to the system prompt".
- Schema 2026-07-28: instructions "should not duplicate information already in tool descriptions".

Which agents pass `instructions` to the model is in TECH-SPEC §3.1. Summary:
- **Confirmed** in source or by a live probe: Claude Code, Gemini CLI, Qwen Code, OpenCode 2, VS Code Copilot.
- **Pi:** first line only, through its MCP path.
- **Codex:** the instructions are wired to the tool namespace, but a live probe saw nothing at session start.
- **Copilot CLI:** probable (github/copilot-cli#1579 closed as completed); no source check.
- **Not supported:** Kiro (kirodotdev/Kiro#11096 is still open).
- **No evidence:** ZCode.

## Decision

1. **One prompt source in the repo:** `src/prompt/instructions.md` and `src/prompt/tools/<tool>.md`. The build inlines them into the bundle. No other file in the repo or in user space carries routing text.
2. **Two channels, split by job, with no duplication:**
   - **Server `instructions`:** what the server is for, when to search for and use its tools, and when not to.
   - **Tool descriptions:** what each tool does and how to call it. Each one is self-contained, because it is the only channel on agents that ignore `instructions`.
3. **Deleted:**
   - all 11 `SKILL.md` files
   - all 13 routing files
   - the `skills` keys in every manifest and in `package.json`
   - every adapter code path that writes `AGENTS.md`, `QWEN.md`, `GEMINI.md`, `CLAUDE.md` or `copilot-instructions.md`

   The maintainer skill `.claude/skills/context-mode-ops` is removed from the repo too (Q4, decided 2026-10-14).
4. Agents that ignore `instructions` (Kiro, possibly ZCode) get routing from tool descriptions only. No steering file is added for them.
5. Pi runs as an in-process plugin, not over MCP. It gets the same `instructions.md` bytes through its single plugin mechanism. Which mechanism that is: Q7.

## Consequences

- One text to review, lint (ADR-0005) and golden-test (GP2).
- On Claude Code with tool search on, `instructions` is the **only** context-mode text the model sees before it searches for a tool. This is verified by a live probe (TECH-SPEC §3.1). It makes ADR-0006 necessary.
- On Codex, the live probe showed neither instructions nor tool descriptions at session start. Routing quality on Codex has to be measured in E2E-live before release.
- User-owned instruction files are never touched again. This removes a v1 bug class: install and upgrade overwrote user hooks and config (#1235, #1239, #1160).

## Alternatives considered

- **Per-agent instruction files (AGENTS.md etc.).** Rejected: 13 diverging copies, written into user-owned files.
- **Skills.** Rejected: each agent packages them differently, MCP-only agents never load them, and they need one copy per agent.
- **MCP prompts.** Rejected for routing: the user has to invoke them. One prompt is kept as a user command: `ctx-stats` (TECH-SPEC §3.9).
