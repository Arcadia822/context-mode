# REVIEW-r2

Merged from `out/r2/round1/review/*.json` (36 reviewer files) and `out/r2/verify/*.json` (4 verify files).
Findings with the same root cause (same file + line, raised by more than one reviewer) are merged into one row.

## Counts

| Severity | Raw findings | Merged (same root cause) | Verified |
|---|---|---|---|
| Blocker | 29 | 27 | 27/27 (26 confirmed, 1 downgraded, 0 refuted) |
| Major | 155 | 128 | 0 (not verified — token budget) |
| Minor | 114 | 108 | 0 (not verified — token budget) |

No blocker was refuted. One blocker (ADR-0016 identity detection on Gemini CLI) was downgraded: its claim rests on an external repo not present in this worktree, so it is listed below with that caveat instead of as a plain confirmed blocker.

---

## Blockers (confirmed)

Each row: `file:line` — claim — fix. Sorted by file.

### PRD-v2.md

- **PRD-v2.md:75** — Section 4 still describes the old storage model (per-session DB, JSONL journal, "No shared writable DB"), which ADR-0002 (Accepted) replaces with one `context.db` per project. **Fix:** rewrite PRD §4 to the ADR-0002 layout; re-map the storage issues (#985, #880, #992, #905, #1205) to the new mechanism.
- **PRD-v2.md:192** — G7 and §8 ("runtimes found by PATH lookup") do not say how Git Bash is found on Windows; plain PATH lookup can hit WSL `bash.exe` or `WindowsApps` first. **Fix:** add the exact Windows bash-resolution rule (exclusions + canonical path) to TECH-SPEC §8, with a GP4 test where WSL bash is first on PATH.
- **PRD-v2.md:254** — Release layout puts the Pi entry at `pi/index.js` with no `package.json`; without one, Pi's manifest-less auto-scan never loads a bare file at that path. **Fix:** move the Pi entry under `release:/extensions/` as the only file/dir there.

### docs/v2/README.md

- **README.md:52** — README §4, ADR-0011:41 and ADR-0013:18 install Codex as a plugin (`codex plugin marketplace add --ref release`), but PRD E25 says Codex installs as a plain `config.toml` MCP entry with no automatic project source. **Fix:** pick one Codex install mode; if plugin, state how the server gets the project dir.

### docs/v2/TECH-SPEC.md

- **TECH-SPEC.md:37** — GS4, Q1 and ADR-0003 make deleting v1 tests an exit criterion, with no gate requiring v1 tests of kept parts to pass — against the owner decision that v1 unit tests stay until v2 passes them. **Fix:** add an exit criterion "v1 tests mapped to kept behaviour run against v2 and PASS"; retitle ADR-0003.
- **TECH-SPEC.md:38** — GS5 requires "the repo has no SKILL.md", but §3.9, ADR-0004, ADR-0010, ADR-0013 and the repo's own `.claude/skills/release/SKILL.md` all require SKILL.md files; GS5 can never pass. **Fix:** change GS5 to "exactly these SKILL.md files: `skills/ctx-{stats,doctor,upgrade}/SKILL.md` and `.claude/skills/release/SKILL.md`".
- **TECH-SPEC.md:175** — Pi delivery paths contradict each other (systemPrompt append vs. compaction-block carrier), re-opening a v1 cache bug. **Fix:** state one rule — Pi appends only the static `instructions.md` bytes on every `before_agent_start`.

### docs/v2/adr/0002-single-db-git-distribution.md

- **ADR-0002:17** — No corruption policy. The only rule anywhere (PRD:84, "`--fix` deletes only that session DB") now deletes every session/worktree/agent of the project under the shared-DB model, and names a `context-mode doctor --fix` CLI that ADR-0002 itself says does not exist ("no CLI"). Open #867 (mid-session `SQLITE_CORRUPT`) has no rule. **Fix:** add a Corruption section — detect at open and mid-session, hard error with a `ctx_doctor` fix step (tool, not CLI) that renames `context.db`/`-wal`/`-shm` to `.corrupt-<ts>`.

### docs/v2/adr/0003-e2e-only-golden-tests.md

- **ADR-0003:1** — ADR-0003, TECH-SPEC GS4/§6.8/Q1 and ADR-0015 still say v1 unit tests are deleted — the opposite of the owner decision that they stay until v2 passes the kept parts. **Fix:** rewrite ADR-0003 with a KEEP-PASS/GPn/REMOVED:`<id>` ledger per test file; E2E is an added layer, not a replacement.
- **ADR-0003:22** — "Two layers, and nothing else" / "no algorithm gets its own test entry point" leaves no layer for the kept v1 unit tests; 136 of 210 v1 test files import `../src/`, so they only pass if v2 keeps compatible module paths. **Fix:** add a third "v1-kept" layer with a per-file KEEP-PASS/PORT/RETIRED list and a src-API-contract rule.

### docs/v2/adr/0007-mcp-2026-07-28.md

- **ADR-0007:47** — Decision 4 identifies the agent from request `_meta` and "never from the connection", but Claude Code and Codex send `clientInfo` only once, at `initialize` — v2 loses that platform signal for every current client and re-breaks the #542 fix. **Fix:** rewrite decision 4 to read `clientInfo` from `initialize` params or per-request `_meta`, both via one SDK accessor.

### docs/v2/adr/0008-enforcement-rewrite-and-cap.md

- **ADR-0008:16** — v1 enforced the user's `permissions.deny` on `ctx_execute`/`ctx_execute_file`/`ctx_batch_execute`; the "same scope as v1" table lists only "user `permissions.deny`" with no row for the ctx tools, and PRD G6 moves the policy into an explicitly-imported `policy.json`. **Fix:** add the ctx tools to the ADR-0008 scope table, checked server-side against host deny rules.
- **ADR-0008:25** — curl/wget allow condition ("body does not reach tool output") drops v1's silent-flag and verbose-flag checks, so the stderr progress-meter flood that #166 fixed comes back. **Fix:** define "reaches tool output" over stdout AND stderr; add golden cases for `-o -`, `-O`, `--verbose -o f`.
- **ADR-0008:38** — Deny message drops v1's "full network access" statement and the transient-DNS retry hint, so models read a deny as a hard network block. **Fix:** keep a one-line network-access + retry-on-transient-DNS-error note in the deny text.
- **ADR-0008:51** — "ParseError → allow" is fail-open; if the same parser gates the user's deny rule, any command containing `[[`, `((`, `case`, a function or `<(` skips the deny entirely. **Fix:** split the rule — ParseError may allow for routing/size, but must deny (fail closed) for user deny checks.

### docs/v2/adr/0011-release-and-v1-transition.md

- **ADR-0011:31** — The marketplace-ref switch edits only `.claude-plugin/marketplace.json`; Codex reads `.agents/plugins/marketplace.json` first, whose source stays `url: "./"` on `main`, so existing Codex installs never follow the release-ref switch. **Fix:** switch the Codex marketplace file too (or document re-add with `@release`), and test it in the smoke job.

### docs/v2/adr/0013-release-automation.md

- **ADR-0013:31** — `mode: rollback` is never defined; Claude Code caches by version, so a rollback that reuses an older version number serves the stale cached tree. **Fix:** define rollback as roll-forward — `plan.mjs` always emits a version higher than the release head, even in rollback mode.

### docs/v2/adr/0014-issue-forms-and-debug-report.md

- **ADR-0014:53** — No workflow validates issue bodies; nothing recomputes the report digest, so invalid or stale-format bodies reach the queue unchecked. **Fix:** add `.github/workflows/issue-intake.yml` running an intake script that re-splits the body and checks the digest.
- **ADR-0014:57** — ADR-0014 designs intake as a web form only; coding agents file via `gh issue create --body-file` or REST `POST /issues`, where required-field enforcement does not apply — a direct gap against the owner rule that issue intake must target AI agents and extract maximum debug data from them. **Fix:** add a machine-readable `.github/AGENT_ISSUE.md` with the same fixed `### ` headings as the web form, so an agent reading it produces a body the intake check can still validate.

### docs/v2/adr/0016-subagent-context-protection.md

- **ADR-0016:18** — *(downgraded, not plain-confirmed)* Identity detection reads `agent_type` from the hook payload; Gemini CLI payloads carry no such field, so the Gemini row is unsupported as claimed. Verify could not check this against the actual (external) gemini-cli source from this worktree, so treat as plausible-but-unverified pending a live check. **Fix:** add a Gemini row to "how the subagent's tools are known" stating identity is unknown there, with a safe fallback.
- **ADR-0016:27** — Case B on Claude Code relies on PreToolUse `allow` + `updatedInput.command` for Bash; v1 already found Claude Code ignores this and the original command runs unchanged (commit `4bc292fc`, "CC ignores `updatedInput.command` substitution under `permissionDecision: allow`"). The ADR does not cite this and still plans case B as the main Claude Code path, re-shipping the same silent no-op that floods subagent context, breaking the ADR-0016 MUST. **Fix:** cite `4bc292fc`; make case C (or deny) the Claude Code default until a live run confirms case B on the pinned CC version.
- **ADR-0016:43** — Kiro row is "hint only (no rewrite, no replace) / documented gap", letting large tool output reach a Kiro subagent uncut — against the owner MUST that large output never enters any subagent context. **Fix:** make Kiro case A = deny (exit 2); cases B/C = deny naming an alternative.

### tickets/map-I1.md

- **map-I1.md:14** — #1090 test "command is `node` (not `process.execPath`)" re-breaks the Windows Git Bash fix (#369) and the snap fix (#190). **Fix:** replace the test with a stable launcher resolved at run time; GP1 must run it on Windows Git Bash and a snap node.

### tickets/map-I2.md

- **map-I2.md:19** — #1039 verdict "fetch honours `HTTP(S)_PROXY`" (also PRD E18, GP5) re-breaks a v1 security fix and a kept v1 test. **Fix:** needs-decision — honour the proxy only with a proxy-aware SSRF check, or keep stripping it and close #1039 wontfix.

### tickets/map-I3.md

- **map-I3.md:8** — #960 "no hook for non-ctx MCP tools" re-opens closed #529 and breaks the ADR-0016 MUST (large output never enters any context) for tools like `mcp__grafana__get_datasource`. **Fix:** keep external MCP output in scope via a no-spawn path (`mcp_tool` hook or PostToolUse replace).
- **map-I3.md:22** — #936/#959/#947 and PRD E5 set a 120s server default timeout for every host; v1 removed exactly that default in #406 because it killed long builds, and ADR-0008 r3 now routes gradle/mvn/sbt through `ctx_execute`. **Fix:** needs-decision — no fixed default that kills long builds, or a per-adapter override; keep the #406 regression tests.

### tickets/map-P0.md

- **map-P0.md:48** — #1231 verdict "hints must cover external MCP tools" contradicts PRD-v2.md:103 ("never every `mcp__*`") and ADR-0008 r3 has no `mcp__` row — v2 drops the external-MCP routing v1 added on purpose (#529), against the ADR-0016 MUST. **Fix:** needs-decision — add an ADR-0008 row for external MCP tools, or record wontfix with the #529 regression accepted by the owner.

---

## Majors (not verified — token budget), grouped by doc

Each row: `line` — claim — fix.

### PRD-v2.md (18)
- 23 — P4 says hooks do no DB work, but ADR-0009 computes the compaction block inside the Claude Code `SessionStart(compact)` hook. **Fix:** use an `mcp_tool` SessionStart hook for Claude Code, or move the compute server-side.
- 59 — PRD says the journal is append-only JSONL per session; ADR-0002/README §7 say it is the `events` table in one `context.db`. **Fix:** change PRD:36/:59 to match ADR-0002.
- 80 — PRD still describes per-session DBs and `doctor --fix` deleting one session DB; conflicts with ADR-0002. **Fix:** move PRD §6 storage lines to the TECH-SPEC superseded table.
- 91 — ZCode has no project-source row; ProjectContext "must come from the adapter" has no ZCode entry. **Fix:** run spike S0 for ZCode and add the row.
- 95 — PRD lists Copilot CLI under "spawn cwd"; open #1017 says Copilot CLI's plugin install root differs. **Fix:** mark Copilot CLI plugin install `[U]` until verified live.
- 102 — PRD says every hook is one `context-mode hook <agent> <event>` command; ADR-0008 #4 says Claude Code PreToolUse is `mcp_tool`. **Fix:** update PRD §6 per-adapter transport.
- 103 — Hook matchers list is incomplete against ADR-0009 (Write/Edit rows) and ADR-0016 (subagent events). **Fix:** split matchers per event in the adapter table.
- 108 — "PostToolUse runs async where the host allows it" conflicts with ADR-0016 case C needing synchronous `updatedToolOutput`. **Fix:** make PostToolUse synchronous wherever it may replace output.
- 138 — "Windows Job Object" kill has no build path; Node has no Job Object API without a native addon (against no-npm/no-native-binary). **Fix:** state the real mechanism (`taskkill /F /T /PID`, proven in v1).
- 166 — E12/E15 give two different shapes for the hook launch command across shells. **Fix:** pick one shape per host shell.
- 187 — PRD G2 "no tool-output replacement on any agent" conflicts with ADR-0016 Pi case C "replace result in-process". **Fix:** map G2 → ADR-0008 r3 / ADR-0016 in the supersede table.
- 191 — G6's project-level `.context-mode/policy.json` with an `allowHosts` row lets a cloned repo ship broadened network access. **Fix:** `allowHosts`/allow rules from the user file only; project file may only add deny rules.
- 226 — "Kept (10)" lists 11 agents; PRD:30/:39 still list removed agents. **Fix:** reconcile the agent count across PRD §15.1, the diagram and README.
- 249 — Manifest list names `gemini-extension.json` but not `qwen-extension.json`; Qwen picks its own manifest first. **Fix:** generate a separate `qwen-extension.json`.
- 257 — Generated matchers carry no rule that Codex matchers must be literal names (Codex's Rust regex has gaps). **Fix:** document the literal-name-only constraint for Codex matchers.
- 261 — PRD §15.3 OpenCode 2 column still uses v1 hook names. **Fix:** replace with the v2 session/tool hook names.
- 263 — §15.3 Kiro SessionStart/UserPromptSubmit cells disagree with later docs. **Fix:** set definite values or mark `[U]` consistently.
- 268 — PRD §15.3 says PreCompact is unused, but ADR-0009 §6 needs the Copilot CLI preCompact hook for the pending_compact marker. **Fix:** add the compaction-marker event row for Gemini/Copilot CLI/VS Code.

### docs/v2/TECH-SPEC.md (23)
- 35 — GS2/§6.1/§6.9/Q8/ADR-0003/PRD §16 still describe the old CI live-E2E job with API keys and RC tags, superseded by ADR-0012. **Fix:** replace with pointers to ADR-0012.
- 38 — see Blockers (same line, same root cause as the GS5 blocker above).
- 39 — GS6 (hook p95 ≤ 40ms) cannot hold: ADR-0008 measured bare Node alone at 45.6ms p95. **Fix:** replace GS6/GP3/D5 with one metric once the owner decides the baseline.
- 48 — Old "no skills / no doctor / 7 tools" text was not updated after ADR-0010/§3.9 (9 tools, 3 skills). **Fix:** update every count.
- 72 — `ctx_route` is in no tool list; no doc says if `tools/list` shows it. **Fix:** decide listed-vs-hidden in ADR-0008/0007.
- 74 — Doc says only server `instructions` are lost in untrusted folders; Gemini actually starts no MCP server at all there. **Fix:** rewrite the row — "untrusted folder = no context-mode tools at all".
- 107 — Tool count is 7 in README/PRD §7/TECH-SPEC §3.3/GP1 but 9 in the PRD addendum/§3.11. **Fix:** pick 9 and update every count.
- 190 — Doc does not decide how OpenCode 2 gets ctx tools (MCP server vs. plugin hooks). **Fix:** state one path in the adapter table.
- 192 — Pi tool-name row says "registers its own names" with no actual name. **Fix:** fix the registered name (bare `ctx_execute` recommended).
- 193 — Kiro tool name is `[U]` with two unrecorded candidates. **Fix:** list both candidates with sources; add an S-NAMES golden test.
- 202 — No rule for how the Gemini row tells its own MCP server apart from external ones (#529). **Fix:** matcher prefix `mcp_`, decide own-vs-external from `mcp_context...`.
- 211 — ADR-0014 says the report is a fixed `key: value` block; TECH-SPEC §3.9 and the skill draft want a table. **Fix:** specify both outputs — table for humans, one fenced block for machines.
- 251 — GP3 hook-runner has no harness lane for the `mcp_tool` path (Claude Code, the reference agent). **Fix:** add a GP3 `mcp_tool` lane.
- 265 — "B rows (124) each become a GP case" has no mapping; only 53 of 124 ids appear anywhere. **Fix:** add a "GP case" column to every B/M row in `v2-issue-map.md`.
- 290 — GP4 lists no Windows-only v1 fixes (#384, #1154, #826, #782, #791). **Fix:** add them to GP4 and the §8 Windows rules.
- 295 — GP9 asserts stdin-EOF exit but not the non-TTY gate that `server-stdin-eof-exit.test.ts` pins. **Fix:** mark that file KEEP-PASS or add equivalent GP9 cases.
- 360–364 — CI live matrix lists `OPENAI_API_KEY`/`GEMINI_API_KEY`/Qwen key/`COPILOT_GITHUB_TOKEN`/`ANTHROPIC_API_KEY` as auth secrets for Codex, Gemini, Qwen, Copilot CLI and Pi — against the owner decision "no API keys for tests"; ADR-0012 already supersedes this for some agents. **Fix:** mark §6.9 superseded in place; add the keyless path per agent (or record no-known-path for Qwen).
- 367 — ZCode live-E2E row uses project-root `zcode.json`, but ZCode ignores hooks in project config, so the G25 hook probe cannot fire. **Fix:** use a temp HOME with `~/.zcode/cli/config.json`.
- 415 — Q9 fixes the runner as `node:test` against built `.mjs`; kept v1 tests run on vitest/TypeScript. **Fix:** state two runners — vitest for `tests/` (v1 kept), `node:test` for `e2e/`.

### docs/v2/adr/0016-subagent-context-protection.md (10)
- 17 — Subagent detection covers only Claude Code; nothing says how VS Code subagents are found. **Fix:** add a VS Code row or state the safe default (no ctx tools).
- 18 — see Blockers (downgraded entry, same line).
- 19 — Subagent tool discovery (`.claude/agents/<type>.md` parsing) is Claude-Code-specific logic with no adapter abstraction. **Fix:** move resolution into core with an adapter-supplied capability row.
- 27 — see Blockers (`4bc292fc` entry is at this same line's claim; this major covers a second aspect: shipping `run.mjs`/`search.mjs` as a CLI surface against "no CLI"). **Fix:** record the bundle-internal exception explicitly.
- 30 — Chunk-selection budget has no fixed number; v1 chunks up to 4,096B could exceed ADR-0009's 2,048B budget in one top chunk. **Fix:** fix the budget B in bytes and require `MAX_CHUNK_BYTES ≤ B`.
- 32 — No rule for which subagent Bash calls get rewritten. **Fix:** state one rule — every Bash call of a subagent without ctx tools goes through `run.mjs`.
- 39 — Case C on Copilot CLI cites `modifiedResult`, a field the verified spike does not list for `postToolUse`. **Fix:** mark `[U]`, add a live check.
- 40 — Pi row says "mutate/replace in-process" but tool detection relies on Claude-only signals. **Fix:** decide the case per process from `pi.getActiveTools()`.
- 41 — Codex rewrite "supported" has no minimum version; it only honors `updatedInput` from 0.141.0. **Fix:** state the minimum version in the adapter table.
- 42 — "VS Code: rewrite supported" has no evidence; the hook spike lists only `additionalContext`/`permissionDecision`. **Fix:** mark `[U]`, add a source check.

### docs/v2/adr/0011-release-and-v1-transition.md (10)
- 11 — Issue workflows/templates only take effect from the default branch, but `main` stays frozen on v1. **Fix:** state in ADR-0014 how `.github/ISSUE_TEMPLATE/*` and `.github/AGENT_ISSUE.md` still apply.
- 23 — Release-job trigger rule conflicts between ADR-0011 and ADR-0013 r2. **Fix:** ADR-0011 step 0 should point to ADR-0013 as the single approval rule.
- 46 — npm uninstall-then-git-install order leaves a known-broken window; line 76 admits Copilot CLI/VS Code are affected. **Fix:** order per agent — install v2 first, then clean up.
- 62 — v2 deletes the v1 cache-heal hook with no replacement for the Claude Code plugin cache mismatch it fixed. **Fix:** add a doctor check for `installed_plugins.json` path/bundle mismatch.
- 64 — Gemini/Qwen/Kiro/Copilot CLI/VS Code rows cover hooks only; v1 README also told users to add an MCP entry per host. **Fix:** add the matching `mcpServers["context-mode"]` entries to the upgrade rows.
- 66 — v1 cleanup for Copilot CLI misses the v1 MCP entry. **Fix:** apply the Claude Code "remove only entries whose command has 'context-mode'" rule here too.
- 68 — No v2 Kiro install target is named; v1 and current Kiro use different paths. **Fix:** add a Kiro row to `adapters/table.ts`.
- 70 — "Keep 'context-mode' in `.plugin[]`" treats an npm package spec as an id. **Fix:** remove the bare npm spec, add the git+ref spec.
- 71 — "ZCode: v1 footprint none" is wrong — #1268 shows users ran v1 on ZCode through the Codex adapter. **Fix:** add a ZCode row covering `~/.zcode/cli/config.json` hook entries.
- 72 — "All: `~/.context-mode/` delete" conflicts with v2 using that same root. **Fix:** replace with exact per-subpath rules.

### docs/v2/adr/0008-enforcement-rewrite-and-cap.md (9)
- 10 — WebFetch deny names `ctx_fetch_and_index`, a tool v2 removes (absorbed into `ctx_index`). **Fix:** name `ctx_index` with `{url}` then `ctx_search`.
- 12 — No rule for inline HTTP living inside a quoted `-e`/`-c` interpreter argument. **Fix:** add a literal-token scan rule for interpreter argv0 with an eval flag.
- 24 — Decision looks only at each simple command's argv0; wrapper commands (`sudo`, `time`, `env`, `nice`, `timeout`, `xargs`, `command`) are not handled. **Fix:** specify the fixed wrapper list and promote the next operand.
- 25 — see Blockers (same line).
- 27 — The `mcp_tool` hook was only proven with a stub server via `--mcp-config`; v2 ships as a plugin, untested that way. **Fix:** add a live check for the plugin path.
- 30 — Parallel batches fire PreToolUse concurrently; "hint once per session" has no atomic claim mechanism. **Fix:** specify an atomic `INSERT ... ON CONFLICT DO NOTHING RETURNING`.
- 41 — Deny message prints the prefixed tool name, but TECH-SPEC rule 1/PR12 forbid that elsewhere. **Fix:** state the deny-reason exemption from PR12 explicitly.
- 51 — see Blockers (same line, broader framing: any command with `[[`/`((`/`case`/a function is fully allowed).
- 71 — "Claude Code uses `mcp_tool` and starts no process" is only true for PreToolUse; other events still spawn. **Fix:** add a per-event transport row for Claude Code.

### tickets/map-I1.md (6), tickets/map-I2.md (6)
- map-I1.md:5 — #1069 asks for the same Read/Grep hint on Pi and Claude Code; ADR-0008 r3 restores v1 deny scope instead. **Fix:** needs-decision — Pi gets the hint from tool descriptions only.
- map-I1.md:6 — #1075/#1077/#1094/#1098/#1119/#1135/#1150/#1168/#1088 have no GP case or kept v1 test in the current spec. **Fix:** assign each to a GP case or a kept test file, or mark wontfix.
- map-I1.md:24 — #1112/#1085 conflict with current Pi/OpenCode delivery (systemPrompt append vs. dynamic block). **Fix:** needs-decision — constant bytes only in systemPrompt.
- map-I1.md:36 — #1142 drops the hook cwd pin with no v2 test proving `ctx_execute` cwd = session project. **Fix:** add a GP7 case.
- map-I1.md:40 — #1156/#1079/#1140 rest on retired refs (per-session DBs, JSONL journal, 5MB cap). **Fix:** needs-decision on retention for the shared `context.db`.
- map-I1.md:45 — #1173's "no snapshot injected on SessionStart" is false; ADR-0009 injects on `SessionStart(compact)`. **Fix:** re-verdict covered-by-test GP6.
- map-I2.md:7 — #1055/#1053/#1006/#984/#1003/#979 cite "D10 no hard denies"; ADR-0008 r3 keeps hard deny with v1 scope. **Fix:** re-point each to the correct ADR-0008 row.
- map-I2.md:9 — #1058/#1016 assume a v2.0 uninstall command that does not exist. **Fix:** needs-decision on uninstall scope.
- map-I2.md:12 — #1048 (plan mode) is still open; only PRD E10 answers it. **Fix:** needs-decision, then a GP1 golden test.
- map-I2.md:20 — #1037 "deny removed; subagent can still WebFetch" contradicts ADR-0016 ("never a plain allow"). **Fix:** re-verdict closed-by-design.
- map-I2.md:21 — #1032 test relies on "MCP roots", which v2 does not use; #1017 has no source for Codex plugin installs. **Fix:** needs-decision on both project-source questions.
- map-I2.md:28 — #1018/#1028 require prefixed tool names in hints; TECH-SPEC Q12/PR12 forbid them, yet the ADR-0008 deny message still prints a prefixed name. **Fix:** pick one convention everywhere.

### tickets/map-I3.md (4), tickets/map-P0.md (4), tickets/map-P2.md (4), tickets/map-I0.md (3)
- map-I3.md:7 — #961's truncating-index-budget verdict violates the owner's no-truncation rule and the ADR-0016 "full output" MUST. **Fix:** needs-decision on behavior above a size limit without dropping bytes.
- map-I3.md:15 — #949 relies on per-session-DB 14-day cleanup; ADR-0002's shared `context.db` has no row-retention rule. **Fix:** needs-decision on row retention.
- map-I3.md:21 — #938/#908 rest on "no hard deny on WebFetch"; ADR-0008 r3 denies WebFetch via a host table + allowHosts. **Fix:** re-verdict closed-by-design.
- map-I3.md:31 — #903 and TECH-SPEC GP4 require a "code-point safe output cut", against the owner's no-truncation rule. **Fix:** replace with "no cut; chunk boundaries code-point safe".
- map-P0.md:12 — #1290 "hooks have no DB" is stale; current ADRs make hooks read/write `context.db`. **Fix:** re-verdict covered-by-test with a GP3 bench case.
- map-P0.md:21 — #1277 "owner-PID liveness needs cheap check" is stale; PRD E12 decides stdin-EOF on every OS. **Fix:** re-verdict closed-by-design.
- map-P0.md:30 — #1256 "no server socket/readiness files" is wrong now; ADR-0008 #4 keeps an `mcp_tool`-based readiness mechanism. **Fix:** re-verdict closed-by-design.
- map-P0.md:44 — #1237 (Rust cwd + sandbox lifecycle) is "Reusable", but no doc says whether `ctx_execute` keeps Rust. **Fix:** needs-decision — list the v2 `ctx_execute` languages.
- map-P2.md:9 — #975 wants a `background:true` param that v2's `ctx_execute` does not have. **Fix:** needs-decision — keep or drop, record either way.
- map-P2.md:25 — #1056/#988 closed by "one writer per file", a premise ADR-0002 removes (many writers, one `context.db`). **Fix:** re-verdict needs-decision, name the WAL checkpoint owner.
- map-P2.md:30 — #1043 wants the hint to use a prefixed tool name; TECH-SPEC §3.8 rule 1 says bare names. **Fix:** re-verdict closed-by-design, bare names.
- map-P2.md:57 — #995 (Windows vitest EPERM hang) blocks v2 CI on Windows now that v1 unit tests are kept until they pass. **Fix:** needs-decision — require the DB-handle-close fix as a gate.
- map-I0.md:7 — #1269/#1221 say "no hard denies, hints only"; ADR-0008 r3 keeps denies. **Fix:** re-verdict closed-by-design / wontfix.
- map-I0.md:14 — #1261's "PreToolUse <15ms" contract has no source; G26/ADR-0008 measurements disagree. **Fix:** needs-decision on one budget number.
- map-I0.md:29 — #1210 relies on MCP roots, which v2 does not use; no verified Codex-on-Windows project source. **Fix:** needs-decision, confirm via the live harness.

### Remaining docs with majors (not yet listed above)
- `.claude/skills/release/SKILL.md:9` — `/release` runs only `node --test e2e/cases`, never the kept v1 tests. **Fix:** add `npx vitest run <KEEP-PASS list>` to the release skill and CI job; stop on failure.
- `docs/v2/adr/0005-prompt-style-opus.md:40` — ADR says CI lints the built `tools/list`/`initialize` output; `lint.mjs` has no such "live" mode. **Fix:** add a live mode to `lint.mjs`.
- `docs/v2/adr/0007-mcp-2026-07-28.md:18` — inputSchema "any JSON Schema 2020-12 keyword" silently drops tools on Gemini CLI/agy when using `const`/other unsupported keywords. **Fix:** restrict schemas to the Gemini-safe subset.
- `docs/v2/adr/0007-mcp-2026-07-28.md:46` — "No per-connection state" conflicts with v1's in-memory session state needed for stats/search throttling. **Fix:** state per-session counters live in `context.db` keyed by session id.
- `docs/v2/adr/0007-mcp-2026-07-28.md:51` — ADR-0007 says `tools/list` returns 9 tools; README and GP1 say 7. **Fix:** pick 9, update README/GP1.
- `docs/v2/adr/0007-mcp-2026-07-28.md:62` — Byte-identical tools/list test conflicts with decision 5 adding `resultType`/`ttlMs`/`cacheScope`. **Fix:** define exactly which bytes are compared.
- `docs/v2/adr/0009-compaction-and-memory.md:44` — ADR-0009 adds `PostToolUseFailure` as a 5th Claude Code hook; ADR-0001/README §6/PRD §15.3/doctor D3 all say 4. **Fix:** state the canonical-to-concrete-event mapping explicitly.
- `docs/v2/adr/0009-compaction-and-memory.md:73` — Ratio-sort has no tie-break; equal ratios are common. **Fix:** state a total order (ratio desc, then seq desc/asc).
- `docs/v2/adr/0010-doctor-and-upgrade.md:42` — `ctx_upgrade` install modes do not cover VS Code Copilot (or Kiro, ZCode), which have host-plugin update paths. **Fix:** add VS Code to the host-managed list.
- `docs/v2/adr/0010-doctor-and-upgrade.md:43` — OpenCode 2 is "git checkout" mode in ADR-0010 but ADR-0011:44 disagrees. **Fix:** pick one per agent in `adapters/table.ts`.
- `docs/v2/adr/0012-keyless-live-harness.md:26` — The harness `--cases` list has no case for live checks other ADRs assign to it (ADR-0016 LV8-LV10). **Fix:** add a "subagent" and an "updated-io" case.
- `docs/v2/adr/0012-keyless-live-harness.md:52` — GS3 needs G25 answered for agents the harness does not install. **Fix:** rewrite GS3 like GS2 (answered per agent or SKIPPED with reason).
- `docs/v2/adr/0013-release-automation.md:31` — `release.yml` publishes any `sha` with no check it is on `origin/v2` or green CI. **Fix:** plan job must fail unless `git merge-base --is-ancestor` and CI green.
- `docs/v2/adr/0013-release-automation.md:39` — Smoke runs after publish; a failed smoke means users already got the broken commit. **Fix:** push to a staging ref first, smoke it, then fast-forward.
- `docs/v2/adr/0014-issue-forms-and-debug-report.md:25` — Digest is not defined precisely enough to recompute (which bytes, LF vs CRLF, trailing newline). **Fix:** define it exactly (sha256 hex of every report line from `ctx-report: 1`).
- `docs/v2/adr/0014-issue-forms-and-debug-report.md:30` — Report holds only 7-day aggregates; owner wants maximum debug data. **Fix:** add a `report:"issue"` input appending up to 20 typed decision rows.
- `docs/v2/adr/0014-issue-forms-and-debug-report.md:56` — The bug form speaks to a person; the owner rule requires the template to target AI agents and make them follow the project's rules. **Fix:** add an "If you are an AI agent" block at the top of every form listing the required steps.
- `docs/v2/adr/0014-issue-forms-and-debug-report.md:57` — Redaction covers only the report block, not free-text fields an agent might paste configs/secrets into. **Fix:** list in `AGENT_ISSUE.md` what must never be sent (configs, `.env`, MCP lists, logs, transcripts).
- `docs/v2/adr/0015-readme-and-repo-cleanup.md:15` — "a row gets a command only after a live install test passes" names no test id, owner, or evidence location. **Fix:** define the gate (test id, agent version, date).
- `docs/v2/adr/0015-readme-and-repo-cleanup.md:16` — Upgrading section misses v1 Gemini CLI/Kiro hooks and the Gemini manifest in the "calls the global binary" list. **Fix:** list every v1 agent whose hooks/MCP entry call the bare `context-mode` bin.
- `docs/v2/adr/0015-readme-and-repo-cleanup.md:21` — Privacy row understates network use (`ctx_index` on URLs, `ctx_execute` network calls). **Fix:** state network calls happen only when the user asks (index/upgrade/execute).
- `docs/v2/prompt/drafts.md:44` — ADR-0009 pointer lines tell the model to call `ctx_resume(seq:N)`; `ctx_resume`'s description/PRD signature has no `seq` param. **Fix:** add `seq` to the PRD signature and the tool description.
- `docs/v2/prompt/lint.mjs:20` — drafts mode never fails (prints `fail[]`, exits 0), so "lint = 0 failures" (GP2) is unenforced. **Fix:** set `process.exitCode = 1` on any failure, in both modes.

---

## Minors (not verified — token budget)

| file:line | claim (short) | target doc |
|---|---|---|
| .claude/skills/release/SKILL.md:9 | release skill runs `npm ci`/`npm audit`; owner decided no npm for v2 | .claude/skills/release/SKILL.md |
| docs/v2/adr/0003-e2e-only-golden-tests.md:29 | "truncation" listed as a kept algorithm; owner bans truncation as a reduction mechanism | ADR-0003 |
| docs/v2/adr/0003-e2e-only-golden-tests.md:35 | gates on GP1-GP10 though GP11 exists; GS1 says GP1-GP11 | ADR-0003 |
| docs/v2/adr/0004-no-skills-mcp-instructions.md:66 | keeps an MCP prompt for ctx-stats; TECH-SPEC §3.9 says no MCP prompts | ADR-0004 |
| docs/v2/adr/0006-claude-code-tool-loading.md:37 | counts 7 tools; ADR-0007/PRD addendum say 9 | ADR-0006 |
| docs/v2/adr/0007-mcp-2026-07-28.md:28 | probes only Claude Code/Codex; Qwen/OpenCode untested for server/discover | ADR-0007 |
| docs/v2/adr/0007-mcp-2026-07-28.md:36 | SDK version/date/constants.ts citation has no saved evidence | ADR-0007 |
| docs/v2/adr/0008-enforcement-rewrite-and-cap.md:24 | "1.26ms in the server" attributes ctx_route time to the v2 parser | ADR-0008 |
| docs/v2/adr/0008-enforcement-rewrite-and-cap.md:41 | deny message's prefixed tool name vs. TECH-SPEC/PR12 bare-name rule | ADR-0008 |
| docs/v2/adr/0008-enforcement-rewrite-and-cap.md:42 | literal "state what you need" fallback text when description is empty | ADR-0008 |
| docs/v2/adr/0009-compaction-and-memory.md:13 | no evidence file for the "234B" block-size figure | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:44 | events beyond the 4 canonical hooks not reconciled elsewhere | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:53 | no rule for a failed edit (kind=edit) open-error key | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:60 | "integers only" contradicts the stated non-integer formula | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:77 | 5 sections × 85 = 425 candidates vs. §4's cap of 340 | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:82 | resume block uses pseudo-XML that PR5 may forbid | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:95 | Codex compaction relies only on `source=compact`, not fully verified | ADR-0009 |
| docs/v2/adr/0009-compaction-and-memory.md:98 | Kiro compaction path "live test first" with no result/no-refire plan | ADR-0009 |
| docs/v2/adr/0010-doctor-and-upgrade.md:42 | "not download anything" contradicted by its own step 3 | ADR-0010 |
| docs/v2/adr/0010-doctor-and-upgrade.md:46 | atomic rename of version dir fails on Windows EPERM/EBUSY | ADR-0010 |
| docs/v2/adr/0011-release-and-v1-transition.md:13 | release branch ships "skills" while relying on a `/ctx-upgrade` skill, vs PRD G12-G14 | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:23 | trigger text conflicts with ADR-0013:16's signed-tag rule | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:42 | Gemini update step removes only the MCP entry, not v1 hooks | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:45 | ZCode install/update "test first" with only a UI-marketplace path known | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:62 | Claude Code data-dir row has no Rule-column action | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:63 | Codex row covers npm footprint, not marketplace footprint | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:65 | Qwen v1-footprint row omits the mcpServers entry | ADR-0011 |
| docs/v2/adr/0011-release-and-v1-transition.md:67 | VS Code v1-footprint row omits session data under the project dir | ADR-0011 |
| docs/v2/adr/0012-keyless-live-harness.md:56 | default run is Haiku-only; per-model thresholds unaddressed | ADR-0012 |
| docs/v2/adr/0013-release-automation.md:18 | marketplace-add-with-no-login claim could not be rehearsed offline | ADR-0013 |
| docs/v2/adr/0013-release-automation.md:31 | no concurrency rule; two dispatches can race on plan/push | ADR-0013 |
| docs/v2/adr/0014-issue-forms-and-debug-report.md:25 | digest test proves no accidental change only, not tamper-proofing | ADR-0014 |
| docs/v2/adr/0014-issue-forms-and-debug-report.md:61 | keeps CONTRIBUTING.md text the round-5 README design drops | ADR-0014 |
| docs/v2/adr/0014-issue-forms-and-debug-report.md:68 | "create the labels" names no labels | ADR-0014 |
| docs/v2/adr/0014-issue-forms-and-debug-report.md:71 | GP11 tests the report, not the intake check itself | ADR-0014 |
| docs/v2/adr/0015-readme-and-repo-cleanup.md:8 | "~165 lines" target vs. section budgets summing to 129 | ADR-0015 |
| docs/v2/adr/0015-readme-and-repo-cleanup.md:12 | clones badge needs a cron job; schedule mechanism unstated | ADR-0015 |
| docs/v2/adr/0015-readme-and-repo-cleanup.md:16 | "steps in ADR-0011 order" points to the maintainer order, ambiguous for readers | ADR-0015 |
| docs/v2/adr/0015-readme-and-repo-cleanup.md:22 | issues row targets humans only; owner rule wants AI-agent-first intake with maximum debug data | ADR-0015 |
| docs/v2/prompt/drafts.md:5 | ctx_search default scope marked open though TECH-SPEC Q6 is decided | drafts.md |
| docs/v2/prompt/lint.mjs:8 | PR6 comment sits on the PR12 line; quoted regex misses non-double-quote triggers | lint.mjs |
| docs/v2/README.md:25 | "no skills" and ADR list stale against decided §3.9 | README.md |
| docs/v2/README.md:60 | VS Code project source `${workspaceFolder}` doesn't expand for extension-registered servers | README.md |
| docs/v2/README.md:66 | `chat.useClaudeHooks` + `.claude/settings.json` double-fire risk | README.md |
| docs/v2/README.md:71 | context-hook rule drops the #1085 merge-into-existing-systemPrompt constraint | README.md |
| docs/v2/README.md:72 | "Gemini blocks the tool when a hook fails" wrong for a plain Node crash (exit 1) | README.md |
| docs/v2/README.md:79 | single-DB table list misses tables other ADRs add (e.g. hook_error_data) | README.md |
| docs/v2/README.md:103 | says "no doctor" while issue intake depends on ctx_doctor | README.md |
| docs/v2/README.md:131 | "Codex hook timeout key" listed open though source already answers it | README.md |
| docs/v2/TECH-SPEC.md:58 | supersede table still shows "→ Q6" though Q6 is decided | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:73 | Codex [V] citations not checkable against local source | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:77 | VS Code Copilot line numbers don't match local source; two files missing | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:79 | Kiro#11096 cited from GitHub API with no local snapshot | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:97 | Qwen adapter citation mischaracterized (reads, doesn't write) | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:116 | PR numbering: PR12 listed before PR11 | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:137 | path-component containment check doesn't cover Windows case/drive-letter rules | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:174 | Kiro "tool descriptions only" vs its SessionStart stdout injection | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:186 | two Claude Code tool names listed; PRD E14 wants one install mode per agent | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:189 | Qwen tool name given as one value though install path can differ | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:191 | VS Code tool-name pattern doesn't flag the v1 naming difference | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:193 | ZCode tool name `[U]` but hook matcher decoding depends on it | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:196 | "v1 is wrong about Gemini" cites only one of two matching v1 files | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:202 | generated hook matchers may be ignored by VS Code | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:209 | skills-loader section omits ZCode | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:210 | S-SKILLS marked open for Gemini though source answers it | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:232 | "latest #release tag" vs ADR-0010's "latest release" wording mismatch | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:294 | GP8 doesn't check the deferred-begin rule that makes busy_timeout useless | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:365 | PromptSubmit may fire only in Kiro IDE, not kiro-cli | TECH-SPEC.md |
| docs/v2/TECH-SPEC.md:386 | OpenCode 2 codemode hook firing left `[U]`/G25 though source answers it | TECH-SPEC.md |
| PRD-v2.md:95 | Pi project source listed as "spawn cwd"; v2 runs Pi in-process (no spawn) | PRD-v2.md |
| PRD-v2.md:147 | "one formula, one unit test" vs TECH-SPEC placing it in GP10 (E2E) | PRD-v2.md |
| PRD-v2.md:193 | G8 "17 adapters + ZCode" not marked superseded against §15.1/15.5/README:30 | PRD-v2.md |
| PRD-v2.md:263 | §15.3 Pi SessionStart mapping disagrees with README §6/hooks spike | PRD-v2.md |
| PRD-v2.md:268 | "not used: PreCompact" vs ADR-0009 §6 needing a compaction marker | PRD-v2.md |
| tickets/map-I0.md:5 | #1282/#1206/#1201/#1219/#1221 class B/A for removed agents (Cursor, agy, OpenClaw, Codex Desktop, OMP) | tickets/map-I0.md |
| tickets/map-I0.md:9 | #1267 "Read guidance block removed" vs ADR-0008 r3 keeping it | tickets/map-I0.md |
| tickets/map-I0.md:13 | #1262 grandparent-probe removal safe only without an npm-exec layer | tickets/map-I0.md |
| tickets/map-I0.md:22 | #1225 `npm audit` test can't run; release branch has no package.json | tickets/map-I0.md |
| tickets/map-I0.md:34 | #1200 (ctx_search "query") has a contract test but no GP row | tickets/map-I0.md |
| tickets/map-I0.md:36 | Q1-Q4 listed open though already decided elsewhere | tickets/map-I0.md |
| tickets/map-I1.md:18 | #1099/#1106/#1125/#1134 reasons conflict with current hint/rewrite design | tickets/map-I1.md |
| tickets/map-I1.md:35 | #1141 cites a non-existent "1.x" line | tickets/map-I1.md |
| tickets/map-I1.md:42 | #1162/#1174 still "pending" though decided | tickets/map-I1.md |
| tickets/map-I2.md:17 | #1031 still Q3 with a now-resolved contradiction | tickets/map-I2.md |
| tickets/map-I2.md:25 | #1026 "nudge every K calls" contradicts ADR-0008 "once per session" | tickets/map-I2.md |
| tickets/map-I2.md:26 | #1024 cites a 14-day PID-liveness rule no longer present | tickets/map-I2.md |
| tickets/map-I2.md:35 | #983/#993 test obsolete MCP-helper/hook-command shapes | tickets/map-I2.md |
| tickets/map-I3.md:12 | #953 targets removed Codex Desktop | tickets/map-I3.md |
| tickets/map-I3.md:33 | #901 "install/upgrade/doctor not discussed" vs v2-not-closed note | tickets/map-I3.md |
| tickets/map-I3.md:37 | #890 bundle test targets removed OMP | tickets/map-I3.md |
| tickets/map-I3.md:38 | #889 test uses `npm pack`; v2 has no npm | tickets/map-I3.md |
| tickets/map-I3.md:39 | #880 "per-session single writer" reason superseded by ADR-0002 | tickets/map-I3.md |
| tickets/map-P0.md:13 | #1287 "stats design not yet decided" is stale vs GP10 | tickets/map-P0.md |
| tickets/map-P0.md:15 | #1285 (Cursor Windows PATH docs) targets a removed agent | tickets/map-P0.md |
| tickets/map-P0.md:19 | #1279 "no snapshot injection" stale vs ADR-0009 r2 | tickets/map-P0.md |
| tickets/map-P0.md:25 | #1271 (JSONC boundaries) "Reusable" though upgrade/cleanup edit host configs | tickets/map-P0.md |
| tickets/map-P0.md:34 | #1249 (Pi incremental UTF-8 MCP stdout decode) — v2 Pi has no MCP stdout | tickets/map-P0.md |
| tickets/map-P0.md:36 | #1246 (Pi MCP bridge per workspace) expects 2 bridges; v2 Pi is in-process | tickets/map-P0.md |
| tickets/map-P0.md:41 | #1240 (antigravity Stop hook) targets removed agy | tickets/map-P0.md |
| tickets/map-P0.md:49 | #1230 schema-declares-every-field conflicts with PRD-v2.md:127 | tickets/map-P0.md |
| tickets/map-P0.md:53 | "merge-now v1.x" / "new decisions v1.x security" void under G1 (no v1.x line) | tickets/map-P0.md |
| tickets/map-P2.md:10 | #1121 stderr-must-be-error reading removes a v1 soft-fail case | tickets/map-P2.md |
| tickets/map-P2.md:17 | #1082/#1041 marked "not decided" though PRD/GP4/GP5 already decide them | tickets/map-P2.md |
| tickets/map-P2.md:19 | #1086/#1084 cite "denies gone"; ADR-0008 r3 keeps hard denies | tickets/map-P2.md |
| tickets/map-P2.md:40 | "reusable" tests cite files not in the v1 tree | tickets/map-P2.md |
| tickets/map-P2.md:47 | #1033 asks for MCP roots; README §5/ADR-0007 decide no roots | tickets/map-P2.md |
| tickets/map-P2.md:51 | "merge-now v1.x" / D1 conflict with main frozen on v1 | tickets/map-P2.md |
| tickets/v2-issue-map.md:18 | #1268 still class Q though owner decided ZCode is in v2 | tickets/v2-issue-map.md |

