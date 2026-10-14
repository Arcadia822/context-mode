# Spike: hook contract, verified (2026-10-13)

Contract: SessionStart (inject, re-fire on compact/resume), UserPromptSubmit (prompt + session id), PreToolUse (hint + deny, built-ins + MCP), PostToolUse (input + output + session id, MCP).

Rule: VERIFIED = primary evidence (source, binary/bundle, shipped .d.ts, or live run) and no skeptic refuted it. DOCS = docs only, not refuted. UNKNOWN = no evidence. Skeptic corrections are applied.

## 1) Matrix

Cell = native name | inject | deny | MCP | compact/resume | status

| Agent | SessionStart | UserPromptSubmit | PreToolUse | PostToolUse |
|---|---|---|---|---|
| Claude Code 2.1.283 | `SessionStart` \| yes \| n/a \| n/a \| yes (source=compact/resume, binary enum) \| VERIFIED | `UserPromptSubmit` \| opt \| opt \| n/a \| n/a \| VERIFIED | `PreToolUse` \| additionalContext \| permissionDecision=deny \| DOCS (mcp__.* regex rule in binary) \| - \| VERIFIED (MCP firing DOCS) | `PostToolUse` (+`PostToolUseFailure`) \| - \| - \| DOCS \| - \| VERIFIED |
| Codex CLI 0.156.1 | `SessionStart` \| additionalContext \| n/a \| n/a \| yes (startup/resume/clear/compact/fork, source) \| VERIFIED (source) | `UserPromptSubmit` \| yes \| yes \| n/a \| n/a \| VERIFIED (source) | `PreToolUse` \| additionalContext \| permissionDecision / exit 2 \| yes (mcp__server__tool, source) \| - \| VERIFIED (source) | `PostToolUse` \| - \| - \| yes (source) \| - \| VERIFIED (source) |
| Gemini CLI 0.63.0 | `SessionStart` \| additionalContext \| no \| n/a \| resume yes, compact NO \| VERIFIED | `BeforeAgent` \| yes \| yes \| n/a \| n/a \| VERIFIED | `BeforeTool` \| NO hint field \| decision deny/block, any exit ≠0,1 \| yes (mcp_<server>_<tool>) \| - \| VERIFIED | `AfterTool` \| additionalContext \| - \| yes \| - \| VERIFIED |
| Qwen Code 0.25.1 | `SessionStart` \| additionalContext \| n/a \| n/a \| compact yes (bundle), resume source-only \| VERIFIED | `UserPromptSubmit` \| yes \| yes \| n/a \| n/a \| VERIFIED | `PreToolUse` \| additionalContext (lands in tool result: UNVERIFIED) \| permissionDecision / exit 2 \| names yes (mcp__<sanitized>__tool), firing source-only \| - \| VERIFIED | `PostToolUse` (+Failure) \| - \| - \| source \| - \| VERIFIED |
| Copilot CLI 1.0.96 | `sessionStart`/`SessionStart` \| additionalContext \| n/a \| n/a \| resume yes, compact NO (enum startup/resume/new) \| VERIFIED | `userPromptSubmitted`/`UserPromptSubmit` \| additionalContext \| - \| n/a \| n/a \| VERIFIED | `preToolUse`/`PreToolUse` \| additionalContext \| permissionDecision / exit 2 / any error (fail-closed) \| UNKNOWN \| - \| VERIFIED except MCP | `postToolUse`/`PostToolUse` (+Failure) \| - \| - \| UNKNOWN \| - \| VERIFIED except MCP |
| VS Code Copilot 0.44.0 | `SessionStart` \| additionalContext \| n/a \| n/a \| NO (first turn only, source='new') \| VERIFIED (source) | `UserPromptSubmit` \| yes \| yes \| n/a \| n/a \| VERIFIED | `PreToolUse` \| additionalContext \| permissionDecision / exit 2 \| yes (shared code path, not live) \| - \| VERIFIED | `PostToolUse` \| - \| - \| yes (same path) \| - \| VERIFIED |
| Kiro (IDE + CLI V3) | `SessionStart` (legacy `agentSpawn`) \| stdout on exit 0 \| n/a \| n/a \| UNKNOWN \| DOCS | `PromptSubmit` (legacy `userPromptSubmit`) \| stdout (must stay silent) \| IDE only \| n/a \| n/a \| DOCS | `PreToolUse` \| stdout on exit 0 \| any exit ≠0 \| `@mcp` matcher, ids mcp_<server>_<tool> \| - \| DOCS | `PostToolUse` \| - \| - \| `@mcp` \| - \| DOCS |
| Antigravity agy | NONE → `PreInvocation` \| injectSteps ephemeralMessage \| n/a \| n/a \| UNKNOWN \| DOCS (missing confirmed) | NONE (prompt only via transcriptPath) \| - \| - \| - \| - \| MISSING | `PreToolUse` \| NO (reason only) \| decision=deny (seen working, #1206) \| UNKNOWN \| - \| DOCS+issue | `PostToolUse` \| - \| - \| UNKNOWN; NO tool output in payload \| - \| DOCS |
| ZCode | `SessionStart` \| additionalContext \| n/a \| n/a \| compact yes, resume UNKNOWN \| DOCS (+#1268) | `UserPromptSubmit` \| optional \| yes \| n/a \| n/a \| DOCS | `PreToolUse` \| additionalContext \| permissionDecision / exit 2 \| UNKNOWN \| - \| DOCS | `PostToolUse` (+Failure) \| - \| - \| UNKNOWN \| - \| DOCS (+#1268) |
| Pi 0.73.1 | `session_start` \| NO (use `before_agent_start` {message}) \| n/a \| n/a \| resume yes; compact = `session_compact` \| VERIFIED (live) | `input` \| - \| transform/handled \| n/a \| n/a \| VERIFIED (.d.ts) | `tool_call` \| NO hint \| {block,reason} \| no native MCP; ext-tools as custom tool_call \| - \| VERIFIED (.d.ts) | `tool_result` \| can rewrite \| - \| same as tool_call \| - \| VERIFIED (.d.ts) |
| OpenCode 2 (src 2.0.27; npm max 1.19.0) | NONE → session hook `context` (every request, push system[]) \| yes \| n/a \| n/a \| `compaction` hook \| VERIFIED (source) | session hook `prompt` \| - \| cannot fail \| n/a \| n/a \| VERIFIED (source) | tool `execute.before` \| NO hint \| fail with Tool.Error \| registry yes; codemode wrapper may hide per-tool calls \| - \| VERIFIED (MCP UNKNOWN) | tool `execute.after` \| - \| - \| same caveat \| - \| VERIFIED (MCP UNKNOWN) |

## 2) Per agent

**Claude Code** — `~/.claude/settings.json`, `.claude/settings*.json`, plugin `hooks/hooks.json`; `{hooks:{Event:[{matcher,hooks:[{type:"command",command,timeout,async}]}]}}`. Payload: session_id, prompt_id, transcript_path, cwd, permission_mode, hook_event_name; UPS adds prompt, session_title. Output: hookSpecificOutput.additionalContext / permissionDecision(+Reason) / updatedInput / updatedMCPToolOutput. Timeout: `timeout` s; defaults (600, UPS 30) DOCS only → set explicitly. Exit codes DOCS (0 ok, 2 block). Evidence: code.claude.com/docs/en/hooks.md; binary 2.1.274 grep (build != 2.1.283). Risks: `--bare`, disableAllHooks, allowManagedHooksOnly skip hooks. Live: strings only.

**Codex CLI** — `$CODEX_HOME/hooks.json`, config.toml layers, plugin hooks.json; Claude shape. Payload: session_id, turn_id, cwd, transcript_path, model, permission_mode, hook_event_name, agent_id, agent_type (+tool_*). Output: Claude fields. Timeout: internal `timeout_sec`; JSON key for command hooks DISPUTED (test cited used mcp_tool type). Exit: 0 JSON, 2 block. Tool names: `Bash`, `apply_patch`; no separate Read/Grep/WebFetch. Evidence: openai/codex@0c329ad codex-rs/hooks schema/generated/*. Live: `codex features list` → hooks stable=true; doctor clean; no hook list command.

**Gemini CLI** — `~/.gemini/settings.json`, `.gemini/settings.json` `hooks`. Payload: session_id, transcript_path, cwd, hook_event_name, timestamp (+source / prompt / tool_name, tool_input, tool_response, mcp_context, original_request_name). Output: hookSpecificOutput.additionalContext (wrapped in `<hook_context>`), decision deny/block. Timeout ms, default 60000 (bundle). Exit (bundle, corrected): 0 ok, 1 warning, any other non-zero = DENY. Tool names: run_shell_command, read_file. Evidence: gemini-cli@51617c1, bundle chunk-2V7FO5QV.js. Live: `gemini hooks migrate --from-claude` mapped UPS→BeforeAgent, PreToolUse→BeforeTool, PostToolUse→AfterTool.

**Qwen Code** — `~/.qwen/settings.json`, `.qwen/settings.json`; Claude shape. Payload: session_id, transcript_path, cwd, permission_mode, hook_event_name, timestamp (+tool_response object). Output: Claude fields. Timeout s, command default 60 (source only; DISPUTED in bundle). Exit 2 block. Tool ids run_shell_command/read_file/grep_search/web_fetch, Claude aliases accepted. Evidence: QwenLM/qwen-code@18f80f5, bundle 0.25.1. Live: grep only, no hooks CLI.

**Copilot CLI** — `.github/hooks/*.json`, `~/.copilot/hooks/`, settings.json; `{version:1,hooks:{...}}`, fields type, bash, powershell, command, cwd, env, `timeoutSec` (alias `timeout`), default 30. Payload: camelCase names → sessionId, toolName, toolArgs, toolResult; PascalCase names → snake_case (session_id, hook_event_name). Output: additionalContext, permissionDecision(+Reason), modifiedArgs. Exit: 2 deny; preToolUse errors fail closed. `-p` needs GITHUB_COPILOT_PROMPT_MODE_REPO_HOOKS. `preMcpToolCall` only edits _meta. Evidence: copilot-sdk/types.d.ts:1138-1481, changelog.json. Live: bundle grep, `help hooks` unknown.

**VS Code Copilot** — `.github/hooks/*.json`, `~/.copilot/hooks/`, .agent.md, plugins, `.claude/settings.json` if chat.useClaudeHooks (double-run risk). Payload: hook_event_name; session_id, transcript_path optional; cwd ONLY if hook config sets cwd; timestamp UNKNOWN. Matchers likely ignored → filter tool_name in script; names are VS Code names (runInTerminal). Timeout `timeout` s, default 30. Exit 0/2/other. Proposed API. Evidence: vscode-copilot-chat@5863f5a7 toolCallingLoop.ts:687, toolCalling.tsx:246-321,517, hookExecutor.ts. Live: not possible (GUI).

**Kiro** — `.kiro/hooks/<id>.json`, `~/.kiro/hooks/` (CLI V3); `{version:"v1",hooks:[{name,trigger,matcher,action:{type:"command",command},timeout,enabled}]}`, timeout s default 60. Plain text only: exit 0 stdout → context; any non-zero blocks Pre/Prompt with stderr. Payload: hook_event_name, cwd, session_id (docs say all hooks); tool_input in PreToolUse example; prompt in env USER_PROMPT. Legacy q-cli (agent JSON, timeout_ms, camelCase, no session_id) is superseded. Evidence: kiro.dev/docs/hooks, /types, /actions (updated 2026-10-10); amazon-q-developer-cli@15cc8f3. Live: not possible (login). **Correction: the claim "Kiro has no SessionStart/UserPromptSubmit" is false.**

**Antigravity agy** — `.agents/hooks.json`, `~/.gemini/config/hooks.json`, plugin root hooks.json. Top-level key = hook name, optional `enabled`; Pre/PostToolUse grouped `[{matcher,hooks:[...]}]`; PreInvocation/PostInvocation/Stop FLAT handler lists (our config breaks this → #1206). Handler `{type:"command",command,timeout}` s default 30. Events: PreToolUse, PostToolUse, PreInvocation, PostInvocation, Stop. Payload common: conversationId, workspacePaths, transcriptPath, artifactDirectoryPath, modelName; no cwd. Matcher regex. Output: decision allow|deny|ask|force_ask|deny_unless_prior_grant + reason; PreInvocation injectSteps. Evidence: antigravity.google/docs/hooks, issue #1206, src/adapters/antigravity-cli/index.ts. Live: no binary, npm 404. **Confirmed: no SessionStart, no UserPromptSubmit.**

**ZCode** — `~/.zcode/cli/config.json` with `hooks.enabled:true`, `hooks.events.<Event>`; plugin hooks/hooks.json; project hooks ignored. Handler type process|command, `timeoutMs` (or `timeout` s). Payload: Claude snake_case + camelCase twins. Output: Claude fields. Exit 0/2/other. Default 60000 ms DISPUTED (one skeptic: example only; other: docs say default). Evidence: zcode.z.ai/en/docs/hooks, issue #1268. Live: not possible.

**Pi** — TS/CJS extension, `pi.on(event, handler)`, load via `-e` or `.pi/agent` paths. ctx.cwd, ctx.sessionManager.getSessionId(). No matcher, timeout, exit code; handlers awaited in-process. Also `context` and `before_agent_start` for injection. Evidence: dist/core/extensions/types.d.ts 0.73.1. Live: session_start + session_shutdown fired with cwd + sid.

**OpenCode 2** — v2 Effect plugin `ctx.<domain>.hook(name, cb)`; v1 `.opencode/plugin/*.ts` loads (live) but v1 names are absent from v2 core. Payload: sessionID, no cwd (take `directory` from plugin init). Only `execute.before` can fail. Evidence: sst/opencode@a22754f plugin/src/effect/*.ts. No v2 on npm; v1 users need v1 mapping (tool.execute.before/after, chat.message, experimental.chat.system.transform).

## 3) Gaps

| Agent | Missing | Substitute | Lost |
|---|---|---|---|
| Gemini | SessionStart after compact | PreCompress saves marker → BeforeAgent additionalContext | re-inject waits for next prompt |
| Gemini | PreToolUse hint | deny reason, or AfterTool additionalContext | hint before call |
| Copilot CLI | SessionStart after compact | preCompact marker → next userPromptSubmitted/preToolUse additionalContext | timing |
| VS Code | SessionStart after compact/resume | PreCompact marker → UserPromptSubmit additionalContext | timing; resume not covered |
| agy | SessionStart | PreInvocation, invocationNum==0 + marker per conversationId, ephemeralMessage | none big; flat config needed |
| agy | UserPromptSubmit | parse transcriptPath in PreInvocation | format undocumented |
| agy | PreToolUse hint | deny + reason, or PreInvocation inject | hint without deny |
| agy | PostToolUse output | transcript or MCP proxy | output size |
| Pi | SessionStart inject | session_start/session_compact flag → before_agent_start message | none |
| Pi | PreToolUse hint | queue for before_agent_start / rewrite tool_result | hint before call |
| OpenCode 2 | SessionStart | session `context` hook once per session + `compaction` | runs per request, guard needed |
| OpenCode 2 | PreToolUse hint | Tool.Error deny or input rewrite | hint |
| Kiro | compact/resume refire | unknown | — |

Cannot meet full contract: **agy** (no SessionStart/UPS, no hint, no tool output), **Gemini/Copilot CLI/VS Code** (no re-fire after compaction), **Pi, OpenCode 2** (no hint on allow), **Gemini** (no hint). Full contract: Claude Code, Codex, Qwen, ZCode (MCP pending), Kiro (pending live).

## 4) Remaining unknowns (blocked by: no login / no model call allowed tonight)

- MCP firing: Copilot CLI, agy, ZCode, OpenCode 2 (codemode), Pi (no native MCP). Live checks for Claude/Qwen/VS Code are code-path only.
- Kiro: SessionStart re-fire on compact/resume; session_id on PromptSubmit/Post; JSON output.
- agy: exit codes, compact/resume, conversationId presence, transcript format.
- ZCode: resume source; default timeout wording.
- Codex: JSON timeout key for command hooks (config crate not cloned — readable without login; do next).
- Claude Code: default timeouts and exit codes are docs-only.
- Needed: one logged-in run per agent with a hook that dumps stdin to a file.
