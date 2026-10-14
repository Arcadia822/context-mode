# ADR-0008: Enforcement = rewrite the input + cap the output; deny only on user policy

- Status: Proposed (2026-10-14). Replaces D10 ("no hard denies, hints only"). Live checks LV1–LV5 must pass before it is Accepted.
- Evidence: workflow `wf_98d74014-ea1`, topic `enforcement`, with every finding re-checked by a skeptic agent. Raw output: `tickets/round3-evidence.json`.

## Problem

The owner's concern: a hint alone does not stop the agent. It runs Bash, Read or WebFetch anyway, the large output enters the context, and nothing is saved. v1 issues show this (#1003, #1026, #1212, #1052, #1069, #347).

A hard deny of the tool is not the answer either: it causes dead ends. v1 issues *caused* by denies or redirects: #1269, #1221, #1134, #1125, #1106, #1099, #1055, #1037, #1006, #1003, #984, #979, #938, #908, #843, #832, #817, #794, #792, #625, #230, #173, #166, #79 (24 titles).

What v1 denies today, on the Claude Code path:
- WebFetch: always.
- curl/wget to stdout, inline HTTP, gradle/mvn/sbt: the hook returns `modify` with an `echo`, and the Claude Code formatter turns that into a deny.

## What each agent can do (source/docs, verified)

| Agent | Deny + reason | Rewrite input | Replace output |
|---|---|---|---|
| Claude Code | yes | yes: `updatedInput` + `allow` | **yes**: `updatedToolOutput`, all tools; must match the tool's output shape, else ignored |
| Codex CLI | yes | yes: only with `allow` | as error: `decision:block`; or non-error text: `continue:false` + reason |
| Gemini CLI | yes | yes | as error: block; or `tailToolCallRequest`, which runs a second tool whose result replaces the first |
| Qwen Code | yes | yes (not for policy-owned calls) | as error: `continue:false` + `stopReason` |
| Copilot CLI | yes | yes: `modifiedArgs` | **yes**: `modifiedResult.textResultForLlm` |
| VS Code Copilot | yes | yes | no: can only append context |
| Kiro | yes (docs) | no evidence | no |
| ZCode | yes | yes | no (docs) |
| Pi | yes | yes | **yes**: `tool_result` |
| OpenCode 2 | yes | yes | **yes**: `tool.execute.after` result |

Sources: Claude Code docs `hooks.md` (updatedInput, updatedToolOutput; "The value must match the tool's output shape"); `codex_parser.rs:162-169, 435, 450`; Gemini `coreToolHookTriggers.ts:110-243`; Qwen `coreToolScheduler.ts:5622, 6471-6497`; Copilot hooks docs (modifiedArgs, modifiedResult); VS Code `chatHookService.ts:77-91`, `toolCalling.tsx:671-674`.

## Decision: "never deny the user's intent, always cap the bytes"

**1. Rewrite (primary).** PreToolUse returns `allow` + new input for commands that flood output:
- curl/wget to stdout
- build and test tools
- large find/grep/cat
- commands with no bound on output

The command becomes `node <bundle>/run.mjs -- <original>`. The original is passed base64 in an env var, not through string escaping (lesson from PR #926). The wrapper does three things:
- runs the real command and keeps its exit code,
- stores the full output in `context.db` (FTS),
- prints a capped head and tail, a source id and one line: "search the rest with ctx_search".

The command still runs, so there is no dead end. The wrapper does not need the MCP server to be running (#1053, #1055, #347).

Works on: Claude Code, Codex, Gemini, Qwen, Copilot CLI, VS Code, ZCode, Pi, OpenCode 2. **Not Kiro.**

**2. Cap after the run (safety net).** When a built-in tool's output is over a threshold (default 16 KB, one constant), the PostToolUse hook does three things: indexes the full output, replaces what the model sees with a head/tail + source id, and points to `ctx_search`. How each agent replaces the output:
- Real replacement: Claude Code (in the exact tool shape), Copilot CLI, Pi, OpenCode 2.
- Replacement as a reason or error: Codex, Gemini, Qwen.

This saves context only, because the tool has already run. It also fixes the WebFetch artifact bugs (#938, #984, #1006).

**3. Agents with no output replacement (VS Code, ZCode, Kiro).** Use rewrite (1) where possible. Add one `additionalContext` line on each such call, not once per session. Kiro: hints only. This gap is accepted and documented (ADR-0001 rule 4).

**4. Real denies** come only from the user's own `permissions.deny` / policy file.

**5. Stats** count only bytes that the rewrite or cap path really removed (GP10).

One path per agent: the adapter table names exactly which mechanism (1 or 2) each agent uses. There is no runtime choice between them (ADR-0001).

## Live checks before Accepted (in GP-LIVE)

| ID | Check |
|---|---|
| LV1 | Claude Code: does `allow` + `updatedInput` rewrite a Bash command today? A v1 comment (`hooks/core/formatters.mjs:23-28`) says no, but it was based on a deny-only probe |
| LV2 | Claude Code: the exact `updatedToolOutput` shapes for Read, Grep and WebFetch. A wrong shape is silently ignored |
| LV3 | Codex and Qwen: does `continue:false` end the whole turn, or only replace the output? |
| LV4 | Gemini: does `tailToolCallRequest` work with an MCP tool name? |
| LV5 | Do Claude Code auto mode and Codex auto-review accept the rewritten command (#1134, #967)? |

If LV1 fails, Claude Code uses mechanism 2 (cap) only, decided once in the adapter table.

## Consequences

- Savings no longer depend on the model obeying a hint.
- There are no dead ends, because the user's command always runs.
- New code: one wrapper `run.mjs`, plus one cap function shared by all adapters. GP3 golden cases cover each agent's output shape.
