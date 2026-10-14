# Intern Q&A — round 2

Source: `out/r2/round1/intern/qa.json`. Each entry is a question an engineer would ask, its owner, the answer, the doc it comes from, and any gap found in the docs while answering it.

## Branch and release

**Q: Which branch do I develop on, and where does the built release live?** (architect)
Develop on `v2`. CI builds the `release` branch (orphan, built output only, no `package.json`). `main` stays frozen at the last v1 version so v1's `/ctx-upgrade` sees no change.
Evidence: ADR-0011 lines 8-17 (branch table). No doc gap.

## Storage

**Q: What is the DB path and schema I create in M0?** (storage)
One SQLite file: `~/.context-mode/projects/<git-common-dir-hash>/context.db`. Tables: events, sources, chunks (FTS5), meta. Engine `node:sqlite`, `{timeout:5000}`, every write starts `BEGIN IMMEDIATE`, no retry loop.
Evidence: ADR-0002 Decision 1-2.
**Doc gap (blocker):** PRD-v2.md §4 (lines 75-84) still describes the old per-session-DB model and a rule that `--fix` deletes only that session DB. In the new shared-DB model that rule would delete everything. ADR-0002 also has no corruption policy for the single file. Fix PRD §4 and add a corruption rule to ADR-0002 before coding storage.

## MCP protocol

**Q: What MCP protocol version do I target, and how do I read the client's identity (agent name)?** (mcp)
Target spec 2026-07-28, but keep answering 2025-xx `initialize` clients. Read agent identity from the SDK's normal accessor.
Evidence: ADR-0007 decision + context table.
**Doc gap (blocker):** ADR-0007 decision 4 as written says identity comes only from each request's `_meta`. Claude Code (2025-11-25) and Codex (2025-06-18) send `clientInfo` once, in `initialize`, and never again, so this text would re-break issue #542. Fix ADR-0007 decision 4 to say: `clientInfo` from `initialize` params for 2025-xx sessions, from `_meta` for 2026-07-28 requests, one shared accessor. Needed before writing the agent-detection module.

## Tool surface

**Q: What are the exact tool names I register, and what are the hard size limits?** (architect)
9 tools: `ctx_execute`, `ctx_batch`, `ctx_index`, `ctx_search`, `ctx_resume`, `ctx_stats`, `ctx_doctor`, `ctx_upgrade`, `ctx_purge`. Limits: instructions <= 2048 chars, each tool description <= 1024 chars, all descriptions + schemas <= 8000 chars.
Evidence: TECH-SPEC §10 Q3b/Q5; PRD-v2.md §16 tools line. No doc gap.

## Bash hook

**Q: How does the Bash-enforcement hook decide allow/deny/rewrite? Do I write regex?** (architect)
No regex, by owner rule. Write a real shell parser (lexer + recursive descent, about 12 KB, 1.26 ms) that reads each simple command's argv0 and parsed flags. Deny only when a command's body reaches stdout. Constructs the parser can't handle (`[[`, `((`, `case`, functions, process substitution) are allowed and logged as a `ParseError` code.
Evidence: ADR-0008 "What changes" table row 1, and "Parse errors" section.
**Doc gap (major):** ADR-0008 says "Claude Code starts no process" for its hook, but this is only true for `PreToolUse`/`PostToolUse` (`mcp_tool`). Claude Code's `SessionStart` hook at launch/`--continue`/`--resume` must be a `type:"command"` hook and pays bare-Node startup time, which has no budget row yet. Fix ADR-0008 (or the adapter table) with a per-event transport row before building the `SessionStart` hook.

## Large output

**Q: When output is too big, do I cut it, or pick parts of it?** (architect)
Never cut or truncate, by owner rule. Index the full output in `context.db`, then select whole chunks that best match the call's intent by BM25 score under a byte budget (budgeted greedy). Always end with one `more:` line the caller can run itself.
Evidence: ADR-0016 "Three cases" note; ADR-0008 row 9. No doc gap.

**Q: Inside a subagent that only has Bash/Read (no ctx tools), how do I keep a big command's output out of its context?** (architect)
Case B (has Bash): `PreToolUse` rewrites the command to run through the wrapper unchanged, indexes the full output, returns matched chunks plus a `more:` line the subagent's own Bash can run. Case C (no Bash either): `PostToolUse` replaces the tool's output the same way. An unknown built-in subagent type is always treated as case B or C, never a plain allow, until live check LV8 confirms its tool set.
Evidence: ADR-0016 "Three cases" table and "Golden cases".
**Doc gap:** ADR-0016 itself is status "Proposed" until live checks LV8-LV10 pass. Code to the conservative no-ctx-tools default until those checks land; do not assume LV8's tool-set table yet.

## Testing

**Q: What test runner and Node matrix do I target, and does v2 use npm at all?** (qa)
Test runner is `node:test` against built `.mjs` files, matrix 3 OS x min/current Node, <=10 min per OS. No `npm install` at runtime and no `npm publish` for v2 distribution.
Evidence: TECH-SPEC §10 Q9; ADR-0002 Decision 3.
**Doc gap (blocker):** Q9 fixes the runner as `node:test`, but the owner decision keeps v1's vitest+TypeScript unit tests alive until the kept parts pass, so vitest must also stay in devDependencies and CI; TECH-SPEC never says this. Also ADR-0002 flags the minimum Node version for stable `node:sqlite` as never checked (open spike S-NODE). Fix TECH-SPEC §9/Q9 to cover both runners, and close spike S-NODE, before setting up CI.

**Q: Do I delete v1's `tests/` folder in M0?** (qa)
No. Owner decision: v1 unit tests stay; keep building v2 until the tests covering kept parts pass on v2, plus the new E2E suite.
Evidence: owner's standing instruction (this conversation) and `tickets/v2-test-ledger.md` intent.
**Doc gap (blocker):** ADR-0003, TECH-SPEC GS4/§6.8/Q1, and ADR-0015 all still say "delete v1 `tests/` in one commit," which contradicts the kept-until-pass decision. 136 of 210 v1 test files import `../src/` directly, so v2 must keep those src module paths/exports or port them with a reviewed diff. Fix ADR-0003's status and text, GS4's wording, Q1, and ADR-0015's step list, and add a per-file KEEP-PASS/PORT/RETIRED verdict to `tickets/v2-test-ledger.md`, before deleting or changing any test file.

## Windows

**Q: On Windows, how do I kill a timed-out child process tree with no native addon?** (windows)
Use `taskkill /F /T /PID`, the same mechanism v1 already uses and that is proven to work. Do not build a Job Object path; Node has no Job Object API and a native addon would break the no-native-binding decision.
Evidence: windows.json finding fix note; v1 `src/executor.ts:196-206`.
**Doc gap (major/blocker):** TECH-SPEC §8 and PRD-v2.md:138 still say "Windows Job Object" with no build path named. Fix TECH-SPEC §8 and PRD-v2.md:138 to state `taskkill /F /T` explicitly, and add a GP4 Windows golden case (grandchild process killed on timeout), before writing the executor's kill code.

## Security

**Q: Does the user's existing `permissions.deny` (e.g. a denied Bash `rm -rf` pattern) also block the same command when it is sent through `ctx_execute`?** (security)
It must. v1 checked the same deny policy at the server layer for `ctx_execute`, `ctx_execute_file`, and `ctx_batch_execute`, not only at the hook layer.
Evidence: ADR-0001 "deny comes only from the user's policy file".
**Doc gap (blocker):** ADR-0008's "Same scope as v1" table never lists the ctx tools, and PRD G6 moves policy to a separately-imported `~/.context-mode/policy.json`. As written, a Bash deny rule in `.claude/settings.json` would not stop the same command sent to `ctx_execute`, reopening the bypass v1 closed. Fix ADR-0008 and PRD G6 to name the ctx tools as deny-checked before coding the sandbox executor.

## Issue intake

**Q: What exactly must the bug issue template collect from the agent reading it, and what is the governing rule?** (dx-docs)
The template is written for an AI agent, not a person; the agent reading it must follow our rules and send us maximum debug data. ADR-0014 `bug.yml`: tell the agent to run `/ctx-doctor` first (or call the `ctx_doctor` tool); a dropdown "did doctor run?" with fixed No-reasons; a required doctor-report textarea (`render: text`); a required `node --version` field; what happened / expected / steps, where steps must name the exact tool that was denied and the alternative it was given; 2 required checkboxes. No pull-request template; CONTRIBUTING.md says issues only, with the doctor report attached.
Evidence: ADR-0014 §5 "GitHub files" table.
**Doc gap:** ADR-0014 is still status "Proposed," not yet "Accepted." Confirm it is accepted before wiring the GitHub issue forms or CI around it.

**Q: What does the `ctx_doctor` debug report contain, and how is it kept safe to paste into a public issue (no secrets)?** (security)
A fixed list of key:value lines, starting `ctx-report: 1` and ending `digest: <sha256>`, at most 4096 bytes by construction (worst case 2652 B / 38 lines). Redaction is by structure, not regex: every value must pass a typed scanner (int, semver, hex40, date, enum, bool, or a JSON pointer into our own schema); anything that fails becomes `<invalid>` and is dropped whole, never cut. Paths, env values, file bodies, and command lines can never reach the output. The server never statically imports `node:sqlite`, so `ctx_doctor` still answers even in a degraded start.
Evidence: ADR-0014 §2-§3; test GP11. No doc gap.

## Migration

**Q: How do I detect leftover v1 files per agent for `ctx_doctor`/`ctx_upgrade`, and is this a fallback chain (which is banned)?** (architect)
Not a fallback chain: one pure `detectV1(agent)` function per agent, returning `{file, path, reason}`, that never edits anything. `ctx_doctor` reports what it finds; `ctx_upgrade` removes it. The exact file/path list per agent is a fixed table, not a search order.
Evidence: ADR-0011 "v1 cleanup" table.
**Doc gap (blocker):** The marketplace-ref switch (ADR-0011 step b) edits only `.claude-plugin/marketplace.json`. Codex reads `.agents/plugins/marketplace.json` first, whose source stays `'./'` on `main`, so Codex users who added the marketplace with no ref either stay on frozen v1 forever or later get the raw v2 source tree instead of the release build. Fix ADR-0011 step b to also update the Codex marketplace file on `main`, before scripting the release runbook.

## Compaction

**Q: What is the compaction/session-state format, and do I need to build any memory injection or role classifier?** (architect)
One session-keyed state block, at most 2 KB after compaction, stored at a per-agent path. Resume is a single hint line. No injected memory, and no role/intent classifier — do not build either.
Evidence: PRD-v2.md §16 "Compaction"; ADR-0009 (referenced size figure in `hooks-perf.json`: "the whole SessionStart process is 48.6 ms p95").
**Doc gap:** read ADR-0009 only through citations in other review files, not its full body. Re-read ADR-0009 directly before coding the compaction writer, in case it has detail beyond the PRD line.
