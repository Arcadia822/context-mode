# ADR-0006: Claude Code tool loading: instructions carry routing; `ctx_execute` loads up front

- Status: Proposed (2026-10-14), Q2 in TECH-SPEC §10
- Related: ADR-0004 · TECH-SPEC §3.1 and §3.6

## Context

Claude Code docs (code.claude.com/docs/en/mcp, fetched 2026-10-14):
- "Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start"
- "Tool search is enabled by default"
- "Server instructions help Claude understand when to search for your tools"
- Tool descriptions and instructions are cut at 2,048 chars (`CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH`, v2.1.280+).
- A server can mark a single tool with `_meta: {"anthropic/alwaysLoad": true}`. Whoever configures the server can override this per server.

Live probe, 2026-10-14, Claude Code 2.1.283, model `claude-haiku-4-5-20251001`. A stub MCP server sent an instructions phrase, a normal tool, and a tool marked `anthropic/alwaysLoad: true`. The model was asked to quote the phrases.

| Setting | Instructions | Normal tool description | alwaysLoad tool description |
|---|---|---|---|
| `ENABLE_TOOL_SEARCH=true` (user settings), 2 runs | visible | **NOT VISIBLE** | visible |
| `ENABLE_TOOL_SEARCH=false` | visible | visible | visible |

## Decision

1. The instructions are written for tool search. They say what kind of work the tools do and when to search for and use them (ADR-0004).
2. `ctx_execute` carries `_meta: {"anthropic/alwaysLoad": true}`, so its full description and schema are in context from the first turn. All other tools stay deferred.

## Consequences

- One description (≤ 1,024 chars, PR7) is always in context in Claude Code.
- The most common routing decision (run a command in the sandbox instead of Bash) needs no tool-search step.
- Other agents ignore `_meta`, so the change is harmless there.
- GP-LIVE-ROUTING compares "alwaysLoad on" with "alwaysLoad off" before release. If "off" routes as well as "on", the flag is removed.

## Alternatives considered

- **No alwaysLoad:** every context-mode call needs a ToolSearch step first.
- **alwaysLoad on all 7 tools:** about 8,000 chars always in context, which undoes the purpose of tool search.

## r3 decision (2026-10-14, `docs/v2/review/DECISIONS-r3.md`)

- Q19: re-probe alwaysLoad on Opus and Sonnet in the keyless harness before Accepted.
