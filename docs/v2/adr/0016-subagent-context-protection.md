# ADR-0016: Large output must not enter a subagent's context either

- Status: Accepted as a requirement (2026-10-14, owner: "subagent'ların context'ine girmemeli … bunu fixle, MUST"). The mechanism is Proposed until live checks LV8–LV10 pass.
- Related: ADR-0008 r3 (deny scope), ADR-0012 (live harness). Replaces ADR-0008 r3 change #5 ("subagent without ctx tools → allow").

## Problem

A subagent has its own context window. If a big tool output lands there, the subagent fills its token limit, compacts or fails. v1 had two bad options:
- deny with a ctx alternative the subagent cannot call: a dead end (#794, #1037)
- allow: the subagent's context floods

## Rule

**The same output budget applies in every context: the main session and every subagent.** What changes per subagent is only *which* alternative the deny or the rewrite names, so that it is always one the subagent can actually call.

## How the subagent's tools are known

- The hook payload carries `agent_type` for tool calls made inside a subagent.
- A custom agent: the server reads `.claude/agents/<type>.md` (project, then user dir) and parses the `tools:` list from the frontmatter. No `tools:` line means the agent inherits all tools, MCP included.
- A built-in agent type (Explore, Plan, general-purpose, …): its tool set is a fixed row in the adapter table, filled from the live check LV8. Until LV8 runs, a built-in type is treated as having no ctx tools (case B or C below), which is the safe side for the context.

## Three cases, one path each

| Case | Subagent has | Mechanism | Context gets |
|---|---|---|---|
| A | ctx tools | the same deny as the main session (ADR-0008) | only what ctx tools return |
| B | Bash, no ctx tools | **rewrite**: PreToolUse returns `allow` + `updatedInput`. The command becomes `node <bundle>/run.mjs <base64 of the original>`. The wrapper runs the original command unchanged (same cwd, same exit code), indexes the full output in `context.db`, and prints the chunks that best match the intent (the call's `description` field) up to the budget, then one line: `more: node <bundle>/search.mjs <source-id> "<terms>"`. The subagent can run that line with its own Bash | selected whole chunks + a follow-up it can call |
| C | neither ctx tools nor Bash | **replace after the run**: PostToolUse `updatedToolOutput` (Claude Code, all tools). The full output is indexed; the subagent sees the best-matching whole chunks up to the budget plus the source id. For Read, the deny names Read with `offset`/`limit`, which the subagent has | selected whole chunks |

No case cuts text: the wrapper and the replacement **select whole chunks** by BM25 score against the intent, under a byte budget (budgeted greedy, the same selection as ADR-0009). Nothing is truncated mid-chunk.

The same applies to WebFetch and to the curl/wget/build cases of ADR-0008 in every context.

## Per agent

| Agent | Case A | Case B (rewrite) | Case C (replace) |
|---|---|---|---|
| Claude Code | yes | `updatedInput` + `allow` (LV1) | `updatedToolOutput`, must match the tool's output shape (LV2) |
| Copilot CLI | yes | `modifiedArgs` | `modifiedResult` |
| Pi, OpenCode 2 | yes | mutate input in-process | replace result in-process |
| Codex, Gemini, Qwen | yes | rewrite supported | replace only as a reason/error text; the selected chunks go in that text |
| VS Code, ZCode | yes | rewrite supported | no output replacement: case C falls to the deny with an alternative the subagent has (Read `offset`/`limit`, Grep `output_mode:"count"`) |
| Kiro | hint only (no rewrite, no replace) | — | documented gap |

## Live checks (ADR-0012 harness)

| ID | Check |
|---|---|
| LV8 | Which tools do Claude Code's built-in subagent types have? Does Explore / Plan / general-purpose see MCP tools? |
| LV9 | Case B on Claude Code: a subagent with `tools: Bash, Read` runs a 5 MB output command; assert its transcript holds ≤ budget bytes from that call and the subagent used the `more:` line |
| LV10 | Case C on Claude Code: a subagent with `tools: Read, Grep, WebFetch` reads a 300 KB file and greps a large tree; assert ≤ budget bytes reached it and the task still finished |
| LV1, LV2 | from ADR-0008: `allow` + `updatedInput` on Bash, and `updatedToolOutput` shapes for Read, Grep, WebFetch |

If LV1 fails on Claude Code, case B uses case C instead, decided once in the adapter table (not at run time).

## Golden cases (GP3)

- Subagent type with `tools: Bash` + `curl -s https://x.io/big.json` → rewritten to `run.mjs`, output ≤ budget, `more:` line present
- Subagent type with `tools: Read` + Read of a 300 KB file → deny naming Read with `offset`/`limit`
- Subagent type with no `tools:` line → same deny as the main session
- Unknown built-in type before LV8 → case B or C, never a plain allow
