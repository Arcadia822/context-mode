# Issue map I1 → v2 plan

| # | title (short) | agent/OS | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 1069 | Pi does not route read/grep, only bash HTTP | Pi / macOS | B | P2: same hint set on every agent (no enforcement, D10) | Given Pi and Claude Code, When a Read of a >50KB file runs, Then both emit the same hint text. |
| 1075 | `//` and `~/` permission anchors never match; deny fails open | Claude Code / macOS | B | D10: user security-policy deny stays; must parse CC anchors | Given deny `Read(~/secret/**)`, When ctx_execute_file reads ~/secret/a, Then it is denied; same for `//abs/**`. |
| 1077 | ctx_* calls verbose in Codex; batch repeats sections per query | Codex | B | Output dedupe: one section once per batch reply | Given 2 queries hitting the same chunk, When ctx_batch_execute returns, Then that chunk appears once. |
| 1078 | cache-heal gates on wrong plugin key | Claude Code / macOS | A | D2 | Heal scripts are removed. |
| 1079 | cleanupStaleSources(14) drops unchanged sources by age | all | Q | D6 covers session DBs only | Content store retention rule is not decided. |
| 1081 | timeout unit (ms) missing from schema | OMP / all | B | Schema states unit | Given tool list, When schema is read, Then `timeout` description says milliseconds (or field is `timeout_ms`). |
| 1083 | Codex agent greps ~/.codex and ingests own history | Codex | C (later) | D10: hint only | Agent-home self-ingest hint is extra scope; not v2.0. |
| 1085 | OpenCode extra system message breaks Qwen single-system templates | OpenCode | B | D9/D11 remove snapshot and big block; remaining lines must not add a new system message | Given OpenCode, When SessionStart lines inject, Then output.system length is unchanged (merged into one entry). |
| 1088 | Show input/progress live for ctx_execute | Pi / CC | C (later) | Streaming progress | Not v2.0 core; depends on agent UI APIs. |
| 1090 | plugin.json command pinned to versioned node path | Claude Code / Homebrew | B | D2: install never writes a version-pinned node path | Given install under Homebrew node, When plugin.json is written, Then command is `node` (not process.execPath). |
| 1094 | Pi collapsed view shows only code fence | Pi | B | Reply text must render in collapsed views | Given Pi, When ctx_execute returns, Then first line is plain text, not a fence opener. |
| 1096 | healScript statSync ELOOP | Claude Code / macOS | A | D2 | Heal scripts are removed. |
| 1098 | Pi bridge failure after init is sticky | Pi | B | Bridge retries on next turn | Given tools/list fails once, When next before_agent_start fires, Then bootstrap runs again and tools register. |
| 1099 | OMP deny points to ctx_execute that is not registered | OMP | A | D10 | No deny/redirect exists; hints only. |
| 1100 | Server orphaned after session close (100% CPU) | Pi / Linux | B | Server exits on stdin EOF / parent death | Given server on stdio, When stdin closes, Then process exits within 2 s. |
| 1101 | same as 1100 | Pi | D | duplicate of #1100 | Same text. |
| 1105 | better-sqlite3 ABI rebuild loop | CC / nvm | A | D2 | node:sqlite; ensure-deps removed. |
| 1106 | curl regex matches `which curl` | CC | A | D10 | No command rewrite. |
| 1107 | guidanceOnce keyed on ppid never throttles; 2149 tmp dirs | CC / WSL2 | B | Throttle keyed by agent session id, state in journal (D8) | Given same session id, When 3 Reads fire, Then hint shows once and no /tmp dirs are made. |
| 1112 | Pi ephemeral tail injection breaks prompt cache | Pi | B | D9: inject once, persisted, stable prefix | Given a multi-request turn, When request 2 is built, Then its prefix equals request 1. |
| 1117 | NODE_OPTIONS prefix breaks `for`/`while` | all | B | Pass env via spawn env, not command text | Given shell code `for i in 1; do echo $i; done`, When ctx_execute runs, Then output is `1`. |
| 1119 | ctx_search negative limit | all | B | Validate limit | Given limit=-1, When ctx_search runs, Then it errors (or clamps to 1). |
| 1125 | curl pipe to head still redirected, block dropped | CC | A | D10 | No rewrite. |
| 1130 | CLAUDE.md says blocked, code does not block | CC | A | D11 | Install writes no CLAUDE.md. |
| 1131 | CLAUDE.md continuity contradicts routing block | CC | A | D11, D9 | Both texts removed. |
| 1134 | Codex auto-review rejects echo rewrite | Codex / Windows | A | D10 | No echo rewrite. |
| 1135 | fetch error returns raw Node crash stack | OpenCode / Windows | B | Errors are one-line messages | Given fetch fails, When ctx_fetch_and_index returns, Then text has no stack frames. |
| 1136 | empty `<table>` crashes turndown | OpenCode / Windows | B | HTML→MD survives empty tables | Given page with `<table></table>`, When fetched, Then it indexes without error. |
| 1139 | Windows npm install better-sqlite3 crashes | Windows | A | D2 | No native dep. |
| 1140 | cleanupOldSessions evicts active sessions | all | A | D6 | Live-PID DB never deleted; age from close time. |
| 1141 | ctx-debug.sh dumps secrets; template requires pasting | all | B | doctor output redacts env/secret values (also 1.x fix per D1) | Given settings.json env `X_TOKEN=abc`, When doctor/debug runs, Then `abc` is absent from output. |
| 1142 | hook cwd rewrite defeats permission allowlist | CC | B | D8: hooks never use updatedInput on ctx_* | Given allow rule for ctx_execute, When called without cwd, Then no permission prompt (hook returns no updatedInput). |
| 1150 | Pi renderCall drops args | Pi | B | Render key args | Given Pi, When ctx_execute is called, Then call row shows language and first code line. |
| 1151 | binary/HTTP bytes counted as saved tokens | all | B | D17: stats count only bytes kept from model text | Given readFileSync of a 1MB PNG, When stats update, Then saved tokens do not include it. |
| 1152 | doctor says Codex hooks off when default on | Codex / Windows | B | doctor reads effective flag | Given no `[features].hooks`, When codex reports hooks true, Then doctor passes. |
| 1156 | eviction deletes critical events first | all | A | D8 | Append-only journal; no priority eviction (see Q on cap). |
| 1159 | Windows runtime probes take 30 s before initialize | Codex / Windows | B | Lazy runtime discovery | Given cold start, When initialize arrives, Then reply < 1 s with no PATH probes run. |
| 1162 | start-http.mjs lacks turndown install (systemd) | Linux daemon | Q | HTTP daemon mode not in plan | Is the HTTP server mode kept in v2? If yes, bundling covers it. |
| 1163 | snippet slicing makes lone surrogates → 500s | all | B | Slice by code point | Given text with emoji at a cut, When snippet returns, Then it is valid UTF-8. |
| 1168 | Pi paths hardcoded to legacy ~/.pi dirs | Pi / macOS | B | D4/P3: adapter paths from Pi's real discovery dirs | Given Pi 0.85, When doctor runs, Then it reports the actual extension path. |
| 1173 | infinite compaction loop burns quota | CC / macOS | A | D9 | No snapshot injected on SessionStart; loop cause gone. |
| 1174 | start.mjs background npm install dies silently | CC / macOS | A | D2 + bundling | No runtime npm install (pending bundling decision). |
| 1175 | ctx_execute ignores Esc / no progress | Pi | B | Honor abort signal, kill child tree | Given running ctx_execute, When client cancels, Then child is killed within 1 s and a cancel reply returns. |
| 1179 | Pi context message without timestamp → 400 | Pi | B | Injected messages carry all fields the agent schema needs | Given Pi, When context hook injects, Then message has a finite timestamp. |

## New decisions needed
- Retention: rule for content store (fetched/indexed sources) age vs. content hash (#1079); size cap for append-only journal (#1156).
- Scope: keep HTTP/daemon server mode in v2? (#1162)
- Bundling: confirm turndown etc. are bundled so no runtime npm install exists (#1174, #1162).

## Contradictions with v2-decisions.md
- #1069 asks for enforcement; D10 says hints only. Answer is hint parity (P2), not blocks.
- #1142: today the hook injects cwd; D4 says commands run in the worktree but D8 bars hooks from changing input. The server must find the worktree itself (MCP roots/env).
- #1107: hint throttling needs per-session state; D8 forbids DB in hooks. Use the journal or a session-keyed marker; needs to be stated.
- #1085/#1112: D9/D11 still inject 1–2 lines. On OpenCode/Pi even that must be cache-stable and not add a system message.
