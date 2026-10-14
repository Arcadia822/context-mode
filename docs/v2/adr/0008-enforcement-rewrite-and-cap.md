# ADR-0008: Enforcement = v1's rule set, with the mechanisms that caused its issues replaced

- Status: Proposed r3 (2026-10-14). Owner: "v1'deki gibi olsun ama issue'lar da fixlensin." This replaces r2's generic size-prediction deny on every Bash call.
- Sources: v1 `hooks/core/routing.mjs` @ `5869f4fa` (lines 670–900); issue titles from `tickets/data/isall.json`; round-4 evidence `tickets/round4-evidence.json` (parser timing, `mcp_tool` hook, live deny on Haiku).

## Same scope as v1

| Tool / case | v1 | v2 |
|---|---|---|
| WebFetch | deny → `ctx_fetch_and_index` + `ctx_search` | **deny**, same alternative |
| curl/wget whose body goes to stdout | `modify` to an `echo` (works as a deny) | **deny** |
| inline HTTP in a shell command (`fetch(`, `requests.get(` …) | `modify` to an `echo` | **deny** |
| build tools (gradle, mvn, sbt) | `modify` to an `echo` that suggests `… \| tail -30` | **deny**; the alternative is `ctx_execute` with `intent` (no `tail`, nothing cut) |
| Read of a file > 50 KB | hint | hint |
| Grep, other Bash | hint, once per session | hint, once per session |
| user `permissions.deny` | deny | deny |

No new deny categories are added. The r2 deny of any Bash call whose predicted output is too large is dropped, so Read-before-Edit and ordinary commands behave as they did in v1.

## What changes, and which issues each change fixes

| # | v1 mechanism | v2 mechanism | Fixes |
|---|---|---|---|
| 1 | Regexes over a quote-stripped string | Own shell parser: lexer state machine + recursive descent, no regex, about 12 KB, 1.26 ms in the server. The decision looks at each simple command's argv0 and parsed flags | #1221 (curl inside quotes, grep patterns, heredocs), #1106 (regex matched argument words) |
| 2 | Any curl/wget in a compound command → the whole command replaced | Decide per pipeline. Allow when the body does not reach the tool output: written to a file (`-o file`, `-O`, `>`), or the pipeline ends in a bounded sink (`head -c N`, `wc`, `grep -c`, `jq` with a scalar …). Deny only when the body reaches stdout | #1269, #1125, #166, #792, #817 |
| 3 | `modify` to an `echo` command | A real deny with a reason (each agent's native field, ADR-0001 adapter table) | #1134 (Codex auto-review flagged the echo as instruction drift) |
| 4 | `isMCPReady()`: a machine-global PID marker file | Claude Code: the PreToolUse hook is `type:"mcp_tool"`, so it runs only while this session's server is connected; otherwise the tool runs. Pi, OpenCode 2: in-process, availability is known. Other agents: the server writes a `ready` row (agent, worktree, pid, heartbeat every 30 s) in `context.db`; the hook denies only if a row for the same agent and worktree is younger than 60 s | #1055, #1053, #347, #173, #230. Live check LV7: two concurrent sessions of a command-hook agent in one worktree |
| 5 | Subagents denied although they cannot call ctx tools | Read the subagent's tool list (`agent_type` → the agent file's `tools:`). No ctx tool → allow and journal | #794, #1037 |
| 6 | WebFetch denied for every URL | A host table that is never denied (the claude.ai artifact hosts). A user policy file with an `allowHosts` list | #1006, #984, #938, #908, #843 |
| 7 | Deny/hint state "once per process"; parallel batches slip through | Stateless per call for denies, so every call in a parallel batch is checked. Hints "once per session" are keyed by `session_id` in `context.db` | #1003, #1267 |
| 8 | Routing text injected into subagent prompts | No injection; routing lives in the tool descriptions (ADR-0004) | #967, #832 |
| 9 | Build-tool alternative cut the output with `tail -30` | `ctx_execute` with `intent`: full output indexed, the matching part returned | (owner rule: no truncation) |

## Deny message

Built from the input; the original text is kept as-is:

```
context-mode: <what> sends its body into the conversation.
Run it here instead; the full output is indexed and only the part that matches your intent comes back.
Tool: <exact tool name for this agent>
{"language":"shell","code":<original command>,"intent":<the description field, or "state what you need">}
```

- The exact tool name comes from the adapter table (TECH-SPEC §3.8), so `ToolSearch select:` loads the deferred tool in one step.
- For WebFetch the message names `ctx_fetch_and_index` with the URL, then `ctx_search`.
- **[V] live on Haiku:** the deny reached the model as an `is_error` tool result, and the model used the exact alternative.

## Parse errors

Constructs the parser does not handle (`[[`, `((`, `case`, functions, process substitution) raise `ParseError(code)`. Result: allow and journal the code, as one documented path. GP3 lists every code.

## Golden cases (GP3)

| Input | Expected | Issue |
|---|---|---|
| `curl -s https://x.io/a.json` | deny | — |
| `curl -sL -o out.bin https://x.io/f` | allow | #166 |
| `curl -s https://x.io \| head -c 200` | allow | #1125 |
| `git log --grep="curl"` | allow | #1221 |
| `cat <<EOF … curl … EOF` (curl only in the heredoc body) | allow | #1221 |
| `npm ci && curl -s https://x.io/a.json && npm test` | deny; the alternative runs the whole command in `ctx_execute` | #1269 |
| `./gradlew build` | deny; the alternative has no `tail` | — |
| WebFetch of a claude.ai artifact URL | allow | #1006 |
| WebFetch from a subagent without ctx tools | allow | #794 |
| Claude Code with the server not connected | the tool runs | #173 |
| Read of a 300 KB file | hint, not deny | — |

## Open

- **Hook budget (GS6):** bare Node is 45.6 ms p95 on the owner's Mac, so command hooks cannot meet "p95 ≤ 40 ms wall". Proposal: "≤ 20 ms CPU on top of bare Node" for the command-hook agents; Claude Code uses `mcp_tool` and starts no process.
- LV7 (above), and deny compliance on Opus and Sonnet, run in the live harness (ADR-0012).
