# ADR-0009: After compaction, inject one session-keyed state block of 2 KB or less; memory is search-only

- Status: Proposed (2026-10-14). Changes D9 from "hint only" to "one bounded injection after compaction".
- Evidence: workflow `wf_98d74014-ea1`, topic `compaction-memory`. 11 findings verified, 1 unverified. Raw output: `tickets/round3-evidence.json`.

## v1 today (verified in `/private/tmp/cm5869`)

- **PreCompact** builds a resume snapshot from all session events. It has no size limit, although the docs say "< 2 KB".
- **SessionStart(compact)** on Claude Code injects a routing block, a `<session_knowledge>` directive and a `<session_state>` auto-injection. The directive holds a lot of content: last request, tasks, decisions, files, errors, git, rules, role, intent, plan mode, and more.
- **Resume:** if the new session id has no events, v1 takes the latest unconsumed snapshot from **any** session in the project. OpenCode does the same.
- **"Memory" in v1:**
  - `<behavioral_directive>`, `<rules>` and `<session_mode>`, built by a role/intent classifier from user prompts. Pi rebuilds them on every turn.
  - auto-memory search over agent memory dirs.
- **Claude Code limit:** `additionalContext` longer than 10,000 chars is written to a file, and the model sees only a 2,000-char preview (#1022, #840).

68 of the 590 issue titles are about compaction, resume, snapshot, memory or injection. Failure classes:

| Class | Issues |
|---|---|
| cross-session leak | #1274, #1233, #1214, #780 |
| size | #1022, #840, #1004, #902 |
| stale directive replayed as live | #1259, #856, #1103 |
| wrong role or channel | #1263, #1085, #911 |
| prompt-cache breakage | #1112, #1007, #598 |
| wrong tool name | #1028, #1043 |
| loops | #1173, #1140, #903 |
| ranking | #895 |

## Why "hint only" is not enough

After compaction the SessionStart hint is gone. On Gemini, Copilot CLI and VS Code, SessionStart does not fire again after compaction. The model then has no reason to call `ctx_resume`.

## Decision

1. **Journal facts only.** UserPromptSubmit and PostToolUse rows, keyed by `session_id` + `worktree`. No role or intent classifier, and no "directive" text.
2. **One injection after compaction, 2 KB or less.** The block holds exactly what `ctx_resume` returns, framed as data:
   - `<context_mode_state session="ID">`
   - last request, files changed, open errors, decisions the user stated, search terms for `ctx_search`

   It reads only rows `WHERE session_id = current`. It is cut at a code-point boundary. It never takes another session's rows. It never uses the user role. Tool names in it are bare (PR12).
3. **Delivery: one path per agent.**

| Agent | Path |
|---|---|
| Claude Code, Codex, Qwen, ZCode | SessionStart `source=compact` |
| Gemini | PreCompress writes a marker; the next BeforeAgent injects |
| Copilot CLI, VS Code | preCompact writes a marker; the next prompt hook injects |
| Pi | `session_compact` sets a flag; `before_agent_start` adds one message, once |
| OpenCode 2 | add the state to the compaction request (do **not** set `result.summary`, which replaces the model's summary), or inject once through the `context` hook with a guard. Picked by a live test |
| Kiro | hint only, until a live test shows that SessionStart fires again |

4. **Resume:** one hint line with the session id. Nothing more is injected. If the new id has no rows, nothing is injected.
5. **Memory:** there is no injected memory. Auto-memory stays as a search source inside `ctx_search` (read-only). The decision/intent classifier is removed.

## Tests (GP6 golden)

- block ≤ 2 KB, cut at a code-point boundary
- no row from another session (#1274)
- never user role (#1263)
- stable prompt prefix (#1112)
- bare tool names (#1028)
- no "directive" framing (#911, #1259)
- a 10 KB journal still yields ≤ 2 KB (#1022)

Live checks:
- Kiro and ZCode: does SessionStart fire again on resume and compaction?
- Gemini, Copilot CLI, VS Code: does the injection on the next prompt reach the model before its first tool call?
- OpenCode 2: which of the two paths keeps the state?
