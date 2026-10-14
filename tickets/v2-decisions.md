# context-mode v2 — decisions so far (grill session 2026-10-12)

Status: settled unless marked OPEN. Superseded by `../PRD-v2.md` (§10 decisions from evidence, §11 open grill items).

## Principles
- P1 No fallback chains anywhere. Each behaviour has exactly one code path.
- P2 Same code on every agent. Hooks only add timing (hints), never extra behaviour.
- P3 Claude Code is the reference contract; adapters are thin translators.

## Decisions
- D1 Release is v2.0.0 (major). 1.x gets security fixes only. v2 built on `next`, merged to main once.
- D2 Runtime: Node >= 22.5 only, `node:sqlite`. Remove Bun, bun:sqlite, better-sqlite3, ensure-deps, heal scripts.
- D3 Storage: writes are per session (one writer per file), reads are per project (read-only open of sibling session DBs). Storage moves out of agent config dirs to one shared root, e.g. `~/.context-mode/projects/<git-common-dir-hash>/`.
- D4 Project identity: each adapter takes project dir from ONE fixed source (env var / hook payload cwd / MCP roots). Missing source = hard error shown by `ctx doctor`. Key = git common dir (worktrees share a project); every event also stores its worktree path; commands run in the worktree. (OPEN: final confirm)
- D5 Explicit global mode `CONTEXT_MODE_PROJECT=global` (user choice, not detection). (OPEN)
- D6 Cleanup: closed session DBs kept 14 days; a DB whose owning PID is alive is never deleted. No WAL-mtime heuristics.
- D7 Hooks move to TypeScript under `src/`, bundled, type-checked.
- D8 Hooks are pure deciders: no DB, no server socket. Session events are appended by hooks to `<project>/journal/<agent-session-id>.jsonl` (append-only, single writer). PostToolUse also sees ctx_* calls, so all session work is credited to the right session. MCP server never writes session records and never moves/deletes journals. `events.md` is removed. (OPEN: final confirm)
- D9 Resume is a tool `ctx_resume(session)`. SessionStart/PreCompact hook adds one short hint containing the session id. No snapshot injected into the prompt. (OPEN: user accepts "model may skip hint" risk?)
- D10 No hard denies (curl/wget/WebFetch/build tools become hints). Only user-configured security-policy denies remain.
- D11 Routing rules live only in tool descriptions + 1–2 neutral SessionStart lines. Install never writes CLAUDE.md/AGENTS.md blocks. Big `<context_window_protection>` block removed.
- D12 ctx_search default scope "project", includes this session's fetched/batch content; rank session > worktree > project; every hit labelled (session/agent/worktree); zero-hit replies state the scope. (OPEN)
- D13 v1 data is not migrated. `ctx doctor` lists v1 paths + sizes and a delete command; never deletes without user consent.
- D14 All adapters are in v2.0 (all 17 + requested new ones are separate scope decisions).
- D15 No LLM / external API calls in v2.0.
- D16 Docs first, README last (README ~200 lines, details in docs/).
- D17 Statusline removed. `ctx_insight` removed. Keep only the data `ctx_stats` needs.
- D18 Hookless agents (Zed etc.): same ctx_* tools and search; no journal/resume (physically impossible without hooks).

## Not yet discussed
Tool set consolidation, stats design, install/upgrade/doctor, Windows shell, sandbox security model, contract tests + CI, bundling, dependency audit, memory/extract quality.
