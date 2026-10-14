# ADR-0008: Hard deny, decided by a parse tree and measured sizes

- Status: Proposed r2 (2026-10-14). It replaces r1 ("rewrite + cap"). The owner rejected r1: "sert deny gerekli; truncate ve regex yasak; algoritmik yaklaş".
- Evidence: workflow `wf_5b7e35b3-72f`, topic `algorithmic-deny`, with every finding re-checked by a skeptic agent. Raw output: `tickets/round4-evidence.json`. Prototype: `/tmp/wf4/proto/sh.mjs`.

## Rules from the owner

1. A hard deny is required. A hint alone is ignored.
2. No regex and no truncation decide anything or shorten anything.
3. A deny is never a dead end: it names one exact call that works.

## Why v1 failed

- v1 decides Bash with about 63 regexes over a quote-stripped string (`hooks/core/routing.mjs:260-324`). It does not parse the shell.
- Result: false denies on quoted text, grep patterns and heredocs (#1221), and a whole compound command aborted (#1269). Other deny-caused issues: #1125, #1106, #817, and 19 more (ADR-0011 has the full list).

## Decision

**Deny when the predicted output size of a call is over one budget (16,384 B), and only then.** The prediction comes from a parse tree plus measured history, never from text patterns.

### 1. Where the decision runs

There is one module `decide.mjs`, and one transport per agent:

| Agent | Transport | Cost |
|---|---|---|
| Claude Code | PreToolUse hook `{type:"mcp_tool", server:"context-mode", tool:"ctx_route"}`. The hook calls a tool on the MCP server that is already running, so **no Node process starts**. If the server is not connected, the tool runs; this is the defined behaviour, not a fallback | 1.26 ms in the server, [V] live on 2.1.283 |
| Pi, OpenCode 2 | in-process: the extension imports `decide.mjs` | in-process |
| Codex, Gemini, Qwen, Copilot CLI, VS Code, Kiro, ZCode | command hook: one bundled file, `node --compile-cache`, read-only `SELECT` | about 16 ms CPU on top of Node startup |

### 2. Parser

Own code, about 12 KB, no dependency, no regex:
- character state machine for the lexer
- recursive descent for the grammar: list, pipeline, simple command, subshell, group, if, while, until, for, redirects, heredoc
- `$( )` and backticks parsed recursively, up to depth 8

Measured alternatives:
- tree-sitter-bash: 83 ms per spawn
- mvdan/sh wasm: 109 ms per spawn
- Both are too slow. The tree-sitter native build would also bring back the ABI problem.

Constructs the parser does not handle (`[[`, `((`, `case`, functions, process substitution) raise `ParseError(code)`.

**Parse error → allow + journal the error code.** This is the single, documented path, not a fallback. GP3 golden cases list every error code.

### 3. Size estimate

Typed tables, data rather than patterns:
- `WRAP`: timeout, time, nice, env, sudo, `command` (except `-v`), xargs …
- `PRODUCER[argv0]`: class (net, file, walk, search, build, vcs, tiny, unknown) and a prior size
- `SINK`: head/tail `-n N` gives N × mean line length; `wc`, `grep -c/-l/-q` give 64 B; redirect to a file gives 0
- Redirects are fd-aware: `2>/dev/null` is not counted as stdout.

Signature of a call:

```
sig = argv0 + subcommand + sorted flag names + argument kinds (+ first path for the walk class)
```

PostToolUse records the real output bytes per `sig` in `sig_stats`: a 32-bucket log2 histogram, plus line and byte sums.

Prediction:

```
pred = (k·prior + n·p90) / (k + n),   k = 3
```

- **Read:** the exact `stat` size of the file.
- **Network, first use (n = 0):** allow and record (fixes #817). A deny comes only after that host's p90 is measured over the budget.
- Hosts that are never denied (the claude.ai artifact hosts, #938 #984 #1006) are named entries in a table, not a pattern.

### 4. Decision per tool

| Tool | Rule |
|---|---|
| Bash | `pred > budget` and a ctx tool is reachable → DENY, **every time** (no repeat pass: a repeat would just flood the context). The alternative is the same command in `ctx_execute`, which runs it in the same directory and shell, so it always works. Class `interactive` (needs a TTY: editors, `git rebase -i`, …) → ALLOW |
| Read | with no offset/limit and `stat > budget` → DENY every time. Alternatives: Read with `offset/limit` (the model picks the range; we cut nothing), or `ctx_execute` with `intent`. Read with offset/limit → ALLOW. Live check LV6: does a partial Read satisfy Claude Code's read-before-edit rule? |
| Grep (content mode) | prediction over budget → DENY; the alternative is the same Grep with `output_mode:"count"`, or `ctx_execute rg` with an intent |
| Glob | ALLOW |
| WebFetch | ALLOW, except when the host's measured p90 is over the budget |
| Subagent whose tool list has no ctx tool | ALLOW + journal |
| User `permissions.deny` | always DENY |

### 5. Deny message: built from the input, the original text kept as-is

```
context-mode: predicted ~{b} B ({source}: n={n}, p90={p90}), budget 16384.
Run the same command here; the full output is indexed and only the part that matches your intent returns.
Tool: {exact tool name for this agent}
{"language":"shell","code":<original command>,"intent":<the description field, or "state what you need">}
```

The exact tool name comes from the adapter table (TECH-SPEC §3.8), so ToolSearch `select:` loads the deferred tool in one step.

**[V] live on Haiku:** the deny reason reached the model as an `is_error` tool result, and the model used the exact alternative it named.

### 6. Debug journal

One row per decision:

```
agent, transport, tool, sig, AST node types, parse result + ms, pred, n, p90, decision, repeat, decide ms
```

The issue debug report includes these rows (ADR-0014).

### 4b. No dead end, by construction

A deny happens only when the alternative can run in this session: on Claude Code the `mcp_tool` hook runs only while the server is connected; a subagent whose tool list has no ctx tool is never denied; interactive commands are never denied. A wrong (too high) prediction costs one turn: `ctx_execute` returns small output whole, and the real size goes into `sig_stats`, so the next prediction is right.

## Golden cases (GP3, besides the v1 issue cases)

| Input | Expected |
|---|---|
| `find / -name x \| grep -v foo 2>/dev/null` | deny |
| `command -v curl` | allow |
| `f(){ ls; }; f` | ParseError(func) → allow |
| a `while read` loop over a 1 MB file | deny |
| first `curl -s https://ifconfig.me` | allow + record |
| the same large `find` sent twice | deny both times |
| `git rebase -i HEAD~3` | allow (interactive) |
| curl to a host with p90 = 40 KB | deny |
| a 300 KB Read | deny, also on the identical retry; Read with offset/limit → allow |
| a Grep predicted at 50 KB | deny with `output_mode:count` |

## Open

- **Hook budget (GS6): blocks release.** Node startup alone is 45.6 ms p95 wall and 33 ms CPU on the owner's Mac, so **no command hook can meet "p95 ≤ 40 ms wall"**. Proposal: Claude Code uses `mcp_tool` (no process start); on the other agents the budget is "CPU added on top of bare Node ≤ 20 ms".
- Deny compliance was seen only on Haiku (2 runs). Opus and Sonnet go into the harness (ADR-0012).
- Built-in subagent types (Explore, Plan): do they have the MCP tools?
