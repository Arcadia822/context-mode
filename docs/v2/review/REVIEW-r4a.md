# REVIEW-r4a — merged confirmed findings

Round 4a. Decisions already settled in DECISIONS-r3.md (Q1-Q19) are not reopened; findings below report only where a doc still contradicts a settled decision, or name a real gap/risk DECISIONS-r3 does not cover.

## BLOCKERS

1. **Tool count self-contradiction (README vs PRD/TECH-SPEC vs TECH-SPEC's own GP1 row).** README.md:101 lists 7 tools, dropping `ctx_doctor`/`ctx_upgrade`. PRD-v2.md:289, TECH-SPEC.md:215,409 all list 9 tools (both kept, per Q3b). TECH-SPEC.md:289 (GP1 test row) ALSO says "7 tools", contradicting TECH-SPEC's own 9-tool text two sections later. v1 history: `ctx_doctor`/`ctx_upgrade` are long-standing tested tools (4d2c771e added them, c71c2299 added a regression test), and ADR-0017 R3 depends on `ctx_upgrade` for the v1→v2 migration path. **Fix:** make every doc and every test row say 9 tools; re-run lint.mjs.

2. **Codex install mode: plugin-marketplace vs config.toml.** ADR-0011:41, README.md:52, ADR-0013:18,39 describe Codex install as a plugin-marketplace flow. PRD-v2.md:179 (E25) decided Codex must install as a plain `config.toml` MCP entry, specifically to avoid #1210. DECISIONS-r3 Q11 only covers project-source fallback, not install mode — this is unsettled. **Fix:** pick config.toml per E25/#1210; update ADR-0011, README, ADR-0013, release smoke job; remove plugin-marketplace commands for Codex.

3. **ADR-0007 decision 4 (never read identity off the connection) contradicts the v1 fix for #542/#539.** cm-main 7e67952c and 8b9d13a1 read the SDK's initialize-time `clientInfo` cache at tool-call time to detect 2025-xx client platforms — exactly what decision 4 forbids. **Fix:** scope decision 4 to session/user identity; explicitly allow reading the SDK's initialize-time clientInfo cache for 2025-xx clients; add a GP1/GP2 case replaying #542/#539 under a 2025-xx handshake.

4. **ADR-0009 assumes PostToolUse fires for the plugin's own MCP tools; it does not.** v1 commit 320ed3e5: "PostToolUse never fires for the plugin's OWN MCP tools... This is a server-emit fix, not a hook-extract fix." **Fix:** server must write journal rows for `ctx_execute`/`ctx_search`/`ctx_fetch_and_index`/`ctx_index` directly when its own handler returns; add a GP6 golden case covering a failed `ctx_execute` with no PostToolUse fixture.

5. **PRD `context-mode doctor --fix` CLI contradicts the single-shared-DB model and the MCP-tool-only doctor/upgrade decision.** PRD-v2.md:84,173 describe a CLI flag deleting "only that session DB (#867)"; ADR-0002:17 says one SQLite file per project; ADR-0010:22,42 make doctor/upgrade MCP tools only, no CLI; DECISIONS-r3 Q16 says "not a separate CLI." **Fix:** rewrite PRD E19 — corruption triggers a hard error naming `ctx_doctor`'s fix action (rename `context.db`/-wal/-shm aside; no per-session DB to delete).

6. **ADR-0008 Q5 mis-labels the new shell-wrapper-unwrapping parser (sudo/env/time/nice/timeout/xargs/command/bash -c/$()) as "full v1 scope."** `git log -S` for these wrapper tokens against v1 `hooks/core/routing.mjs` returns zero commits; v1 only ever detected curl/wget segments directly (routing.mjs:735-765). **Fix:** relabel Q5 as new scope, not v1 parity; add a GP3 golden case per wrapper type before release.

7. **ADR-0002 has no corruption policy for the one shared `context.db`.** v1's recovery model (SessionDB renames corrupt files; ContentStore deletes-and-recreates as ephemeral, commit 9e246a8e) does not map onto one file shared by 4+ live writers/worktrees — a naive port of the delete rule wipes everyone's history. **Fix:** add a corruption clause: rename-only, never delete; name the one process allowed to do it (Q6's last-writer rule); define what other live writers do when their open handle's path is renamed out from under them.

8. **TECH-SPEC's proxy/SSRF line for `ctx_fetch_and_index` has no concrete contract.** v1 (ef9eeaa4, PR #476) had exactly this gap: a parent-process SSRF pre-check passes but the fetch subprocess inherits `HTTP_PROXY`/`HTTPS_PROXY`/`ALL_PROXY` and does its own DNS lookup, letting a low-TTL DNS record or proxy route around the guard to blocked ranges (e.g. 169.254.169.254). **Fix:** TECH-SPEC must state the actual v1 contract — strip proxy env vars inside the `ctx_fetch_and_index` subprocess specifically (not the general exec deny list); re-run the SSRF classifier at connect time inside that subprocess, covering `dns.lookup`, `dns.promises.lookup`, `dns.resolve4/6`; block 169.254.0.0/16 always, loopback/RFC1918/::1/fc00::/7 under `CTX_FETCH_STRICT=1`; re-check every redirect hop; add a GP golden test mirroring v1 `tests/core/server.test.ts`.

9. **DECISIONS-r3.md has zero mentions of Kiro.** All six Kiro findings from REVIEW-r3 (native tool-name matcher, session-id fallback, `KIRO_API_KEY` rule clash, release channel, project-source default, stdout format) are still present verbatim in current docs with no owner ruling (`grep -c -i kiro DECISIONS-r3.md` = 0). **Fix:** add Kiro rows to the next owner-decision round (Q20+).

10. **`KIRO_API_KEY` (paid-plan-only) requirement violates the owner's "no API keys for tests, keyless local harness" MUST.** TECH-SPEC.md:367 requires it for the Kiro live row; `grep -c -i kiro ADR-0012` = 0 (no keyless alternative documented). **Fix:** replace with a local `kiro-cli login` session-token path, or mark Kiro live tests SKIPPED with a documented reason in ADR-0012.

11. **Release skill runs `npm ci && npm run build`, violating "no npm for v2."** `.claude/skills/release/SKILL.md` step 2 still runs npm against the lockfile/registry at release time, reopening the exact supply-chain surface ADR-0013 says it avoids ("no package.json", "~50-line dependency-free script"). **Fix:** change SKILL.md step 2 to the actual no-npm v2 build/test command, or explicitly scope why npm ci is intentionally kept (e.g. `--ignore-scripts`) if only for dev tooling.

12. **Release skill never runs the 131 KEEP-PASS v1 unit tests before the layer-2 e2e step.** SKILL.md step 2 runs only `npm ci && npm run build && node --test e2e/cases`. ADR-0003 r2's exit gate requires layer-1 (vitest KEEP-PASS) before layer 2. Flagged in r2 QA, still unfixed. **Fix:** add a vitest KEEP-PASS step before `node --test`, stop on first failure.

13. **No Windows shell-resolution rule in TECH-SPEC** (bash detection order, MSYS path-conversion scope); a naive v2 implementation re-breaks three chained v1 fixes (65012337, e2bce0b5 #826, 89f4e736 #782/#788: `resolveWindowsBash` probe order, WSL/WindowsApps exclusion, git-vs-non-git MSYS suppression split). Zero hits for MinGW/MSYS/WindowsApps/resolveWindowsBash in docs/v2. Flagged in REVIEW-r2 and still unresolved. **Fix:** add a Windows shell-resolution subsection near GP4: `resolveWindowsBash` order (canonical path → `where bash` excluding WSL/WindowsApps → pwsh fallback); MSYS conversion preserved only for native git calls, suppressed per-command (not globally) otherwise; add a GP4 case mixing a git call and a non-git call with WSL bash first on PATH.

14. **DECISIONS-r3 Q1 cites the wrong commit for the external-MCP-tool-hint rule.** Q1 says v2 "keeps v1 #529 (855e330d)," but 855e330d is the commit that CAUSED a context-flooding regression (one-shot nudge dropped by compaction, 55 Jira calls ballooning 24K→75K tokens in one session), fixed three days later by 752d5236/#593 (periodic re-fire, default every 10 calls, env-tunable). **Fix:** amend Q1 to cite 752d5236, or explicitly justify reverting to one-shot despite the known #593 regression.

15. **GP8/GP9 "last server to close runs the WAL checkpoint" (Q6 and ADR-0002:46) is not what the cited commit does.** `git show 939c5ca8 -- src/db-base.ts` shows `closeDB()` unconditionally attempts `wal_checkpoint(TRUNCATE)` on EVERY close, in a try/catch — no election, counter, or lock. **Fix:** rewrite both docs to say every server attempts a best-effort checkpoint on its own close (matching 939c5ca8); re-derive GP8's 4-writer case from that behavior, not an invented election mechanism. (This also means GP8's safety depends on the parent-death lifecycle guard, which v1 history shows was Linux/Bun-only — see #982/#1100/#1101 — so GP8/GP9 must run on real, non-skipped Windows CI before #987/#988 are called done.)

16. **TECH-SPEC's `highlight()` rewrite for #963 (size clip) must not drop the #341 XSS sanitization fix.** v1 commit ceb49688 fixed unsanitized `dangerouslySetInnerHTML` in the exact same code path #963 is bounding. **Fix:** state in the ADR/test that `highlight()` must be both size-bounded AND HTML-sanitized; cite #341 explicitly.

17. **`#1090`'s ask (write `plugin.json` command as a bare `'node'`) directly undoes `#841`'s fix** (b1cca82d/aec2b76a/25ddacc0: pinned `execPath` so mise/asdf/nvm Node version managers don't break hooks). Writing a bare `'node'` string again breaks hooks for every version-manager user. **Fix:** resolve the node binary lazily at hook-run time (shim or liveness-guard lookup), not a fixed string at install time, so both Homebrew (#1090) and version-manager (#841) users work.

18. **`copilot-cli` formatter bypasses the hard-deny-not-modify-to-echo rule ADR-0008 item #3 mandates for #1134.** `formatters.mjs:123-125` passes bash-command-redirects through as `modifiedArgs` unconditionally for the copilot-cli branch, unlike the claude-code/codex branches in the same file — and it's unverified whether Copilot CLI even honors `modifiedArgs`. **Fix:** add the same bash-command-redirect-to-deny special case used for claude-code/codex to the copilot-cli formatter branch; verify against the live binary whether `modifiedArgs` is honored before relying on it.

19. **`v2-issue-map.md:451` describes the v2 storage model backwards:** "D3 (one writer per file; ADR 0001 multi-writer gone)." v1's own ADR-0001 (11e39301, 54ec1be7) made SessionDB/ContentStore multi-writer-safe specifically because v1.0.128's single-writer lockfile caused a real regression (`DatabaseLockedError` blocking legitimate multi-window users). The accepted ADR-0002 KEEPS multiple writers via `BEGIN IMMEDIATE` + `node:sqlite` timeout; r3 Q6 only decides who checkpoints. **Fix:** correct `v2-issue-map.md:451` and `map-P2.md` #1056/#988 to "ADR-0002: multi-writer kept, one file per project; r3 Q6 decides who checkpoints" — do not let an implementer reintroduce the v1.0.128 single-writer-lock regression.

## MAJORS

20. ADR-0014 Q18 (owner decision) overrides ADR-0014's old "no path text" rule, but the row at ADR-0014 line ~33 still says "no path text" — only the file's own Q18 addendum (line ~42, "superseded by Q18") notes the change; the body row itself is unedited. Edit the row, re-run lint.mjs; also update GP11 to assert non-secret path bytes ARE sent, not just that they're hidden.

21. No module-ownership table for M0 in TECH-SPEC despite the ADR-0002 schema being shared across ADR-0008/0009/0016. Add an M0 module-ownership table naming one owner per DB table/responsibility.

22. ADR-0016 lines 18-19 (agent_id vs agent_type; disallowedTools) are unfixed since r3, with no tracking row in DECISIONS-r3.md. Add a tracking row so the fix isn't dropped.

23. Qwen Code's project source is undocumented; the shared base adapter falls back `QWEN_PROJECT_DIR ?? process.cwd()` — a fallback chain Q11 forbids (cm-main `claude-code-base.ts:64,77,86,113`; `qwen-code/index.ts:47`). Add a Qwen row naming `QWEN_PROJECT_DIR` as the single source, remove/gate the cwd fallback, add a GP7 case asserting doctor reports missing source rather than falling back.

24. Copilot CLI's project source is also undocumented and v1 used a 2-3 step fallback, not one source (`copilot-cli/index.ts:113-114,127,152`, introduced 9f34c6f1/#787, no justifying comment). Name the single source as hook-payload field `cwd`; on absence, doctor reports missing source, no fallback.

25. VS Code Copilot only gets MCP server instructions when its tools are "in the request" (TECH-SPEC.md:79) — the condition is never defined anywhere else. Add a row stating the exact condition and fallback behavior.

26. `chat.useClaudeHooks` can double-run context-mode hooks if both Claude Code and VS Code Copilot hooks are installed in the same repo (spike-hooks-verified.md:37); never carried into any ADR/TECH-SPEC/doctor check. Add detection in `ctx_doctor` plus a warning/fixture for the dual-install double-fire case.

27. ADR-0016 states flatly that hooks fire for ZCode subagent MCP tool calls ("Case A = yes"), but the project's own spike marks this UNKNOWN and TECH-SPEC/README both list it as open (G25). Mark ZCode's Case A as `[U]` pending G25/GP-LIVE-HOOKS instead of a flat yes.

28. OpenCode 2 subagent detection has no written rule (ADR-0016:18 only covers Claude Code), even though the per-agent table requires in-process mutate/replace specifically for OpenCode 2 subagents. OpenCode source: `promise/tool.ts` execute.before carries `sessionID`/`agent`, no `agent_type`; `session.ts:33` `parentID` marks a sub-session; `subagent.ts:286-292` `Permission.evaluate` decides visible tools. Add an OpenCode 2 row: detect via `session.parentID != null`, get tool set via `Permission.evaluate`.

29. `v1 cleanup` table for OpenCode says "keep 'context-mode' in `.plugin[]`" — wrong: v1's entry is a bare npm package spec (not an opaque id); keeping it alongside a v2 `git+https` entry double-loads v1 and v2 plugins and v1's default export fails the v2 Module schema, breaking startup (introduced 75ae6ae3). Change the row to: remove the bare `'context-mode'`/`'context-mode@*'` npm spec from `plugin[]`/`plugins[]`, then add the v2 git+https spec — never "keep."

30. Two ADRs assign OpenCode 2's upgrade mechanism to different owners: ADR-0010:43 says git-checkout (ctx_upgrade-owned); ADR-0011:44 says host-managed plugin spec, "disputed in the spike, test first." No r3 decision resolves this. Pick one mode before Accepted.

31. GS6 gives separate hook-wall-time and command-hook-CPU budgets with no single combined end-to-end wall-clock pass/fail number per agent, even though spawn time (28-37ms, per verify-single-db.md), not DB logic, dominates real latency. Add one measured end-to-end wall-time row per command-hook agent (spawn included) with a single threshold.

32. #1261 (hooks cost 55-70ms CPU per Bash) was never fixed in v1 and TECH-SPEC shows no concrete async mechanism for Claude Code PostToolUse to resolve it. Name the concrete async dispatch mechanism; add a GP3 case replaying #1261.

33. ADR-0008's "same selection as ADR-0009" claim for BM25 chunk selection is wrong — ADR-0009 scores journal rows by weight×recency-decay×repeat-bonus; ADR-0016 scores arbitrary tool output by BM25 against free-text intent. Only the greedy-shape is shared. Describe them as sharing the greedy shape only; add GP3 cases testing BM25 selection specifically.

34. TECH-SPEC lists "schema version" as a doctor check item with no migration mechanism defined anywhere (no `user_version`/migration hits in ADR-0002/TECH-SPEC). Add a `PRAGMA user_version` migration step to ADR-0002/TECH-SPEC, run once under `BEGIN IMMEDIATE` before other writers proceed; doctor must distinguish stale-schema from `integrity_check` failure.

35. `ctx_resume(seq:N)` is required by ADR-0009 for pointer items, but PRD §7 schema and drafts.md never mention `seq`; v1 history shows no `seq`-based precedent. Add `seq?` to the `ctx_resume` schema in PRD §7 and drafts.md; fix PRD-v2.md:128's claim that pointers go to `ctx_search`.

36. `ctx_route` (the `mcp_tool` hook target) is in no tool list anywhere, has no drafts.md entry, and listed-vs-hidden was never settled (same gap as r2, still open). Decide listed vs hidden in ADR-0007/0008; update TECH-SPEC/ADR-0007.

37. Kiro's cleanup rule is still "same as Claude Code" for `.hooks.*` flat entries, but v1 also wrote `configs/kiro/agent.json` (name "context-mode") and a `KIRO.md` steering doc via a separate template-install channel (163023a4); a cleanup following only the Claude Code rule leaves both on disk. Add a Kiro-specific cleanup line: scan `~/.kiro/agents/*.json` for `name == context-mode` and report (don't silently delete); flag `.kiro/steering/KIRO.md` for manual review.

38. Install/upgrade/doctor may resolve different plugin roots on the same host — already happened once for Codex (98d239b7, #771) and patched per-adapter; #901 (Windows/OpenCode variant) is treated as having no precedent. Decide on one shared `resolvePluginRoot(adapter)` function used by install/upgrade/doctor, not per-adapter patches.

39. ctx_upgrade `mode:uninstall` says "user data kept unless the user confirms" with no confirmation mechanism defined, and no handling for headless agents (Kiro, ZCode, Pi) that have no interactive TTY prompt channel. Require an explicit tool argument carrying real user consent; default to preserving data if absent, regardless of host UI capability, for both interactive and headless agents.

40. Generic config-rewrite rule doesn't mention OpenCode's `.jsonc`-over-`.json` write-target precedence or string-aware JSONC stripping — risks re-breaking two already-fixed v1 bugs (59e6df8d/#849: prefer `.jsonc` as write target since OpenCode merges it last and treats it as authoritative; 8ca114c4/#808: naive comment-stripping broke on string literals containing `//`/`/*`). Add explicit rule to TECH-SPEC §3/ADR-0010 step 4; cite #849/#808.

41. `v1-migration` E2E (ADR-0017 R8) should prove `install v2 → /ctx-upgrade → npm uninstall -g` keeps Copilot CLI and VS Code working, since both dispatch hooks through the bare global binary name (`copilot-cli/hooks.ts:77`, `vscode-copilot/hooks.ts:114`, deliberately introduced 9f34c6f1/#787) — but no named case actually exercises the npm-global scenario for these two hosts. Name the npm-global + Copilot-CLI/VS-Code migration case explicitly in R8 or `e2e/live/cases`.

42. `AGENT_ISSUE.md`/`DO-NOT-SEND.md`: free-text sections (Summary/What happened/Steps) have no automated secret/path scan in `issue-intake.mjs` — only instruction text; v1's regex redaction (flawed) at least covered the whole output, and v1 added connection-string regex (04182a3f) specifically because it leaked Supabase passwords. Add a non-regex substring scan over free text for known secret prefixes and path markers, same style as the existing Steps check.

43. ADR-0014 §3's typed-key redaction list is assumed to be a full superset of v1's env-key redaction allowlist, but this was never diffed line-by-line (v1 README redaction list is actively maintained separately, 48336daa/ccd5911e). Diff ADR-0014's typed-key list against v1's README list key-by-key before closing #1144; a missing category is a security regression.

44. ADR-0011's facts line (which agents break hooks after `npm uninstall`) omits Gemini and Kiro though the table above shows they use the same hook pattern — same gap flagged in r2, still unfixed. Add Gemini and Kiro to the facts-line agent list.

45. `release.yml` runs smoke AFTER publish with no staging ref and no concurrency guard — flagged twice before (RELEASE-AND-MIGRATION-r2 #3/#4, BOTTLENECKS-r3:70/73), unsettled by DECISIONS-r3. Confirmed still-open; apply the already-specified fix (concurrency group + staging ref before fast-forward) once the owner rules.

46. `#1251` ensure-deps removal (D2) is the tail of a 5-commit regression chain including the hardest case (Windows native module install: 0b5717c5→5b6ef81a→6471cf3b/#540→106bdab0/49860196 #634/#638→b3a26354/e918eac6 #861). Confirm v2 ships a prebuilt native module for every platform before calling #1251 closed; add a Windows cold-start-no-network GP test mirroring #861.

47. `#1090`'s plugin.json bare-'node' request undoes `#841` — duplicate of item 17 above (merged).

48. `#1100` ("server orphaned, 100% CPU") fix lives entirely in `start.mjs`'s Linux Bun re-exec proxy (dfff7b87/#862: stdin-EOF→SIGTERM 2s→SIGKILL 5s escalation). If v2 changes the Linux bootstrap, this exact contract must be carried forward explicitly, not left as an implicit side effect of old proxy code.

49. `#1112` (prompt cache broken by tail injection) is the same bug class `#822` already fixed by moving injection out of `systemPrompt` (4ced18cb). If D9's injected line still varies per turn, the cache-prefix bug returns under the new mechanism. State explicitly that D9's injected bytes must be constant across every request in a turn.

50. v1's UUID-heuristic fix for `#1140`/`#1156` (live-session-wipe on power-outage restart, wiped 1000+ events) is replaced by Q7's age+PID+size-cap rule with no ported test coverage. Port the 5 test behaviors from `cleanup-preserves-live-uuid-events.test.ts` into a v2 GP6/GP8 case before closing.

51. #1032 (VS Code Remote-WSL project root) was re-verdicted closed-by-design citing "-" with no citation; no ADR anywhere names the actual root-resolution mechanism for Remote-WSL (grep for workspaceFolder/MCP root/remote-wsl across all ADRs/TECH-SPEC = 0 hits). Revert to needs-decision until an ADR names the concrete mechanism.

52. `#1039` (ctx_fetch_and_index strips HTTP_PROXY) is classified as a plain bug, but reversing it without a check reopens a confirmed SSRF/DNS-rebinding gap (42448389/PR #476 — same root cause as item 8 above). Treat as a security decision: any fix to honor `HTTP_PROXY` must add a resolved-proxy-target SSRF check before deleting the `delete process.env.HTTP_PROXY` lines.

53. GP9's lifecycle test (stdin EOF + parent kill) omits `#999` (host-never-dies case on OpenCode/KiloCode) and the one historical fix for that exact case was reverted for breaking 12 hosts (ac11f103 introduced the gap by removing stdin-EOF handling in #471; a888cac6 reverted an idle-shutdown fix, #568/#595, for breaking 12 hosts via #602). Add #999 to GP9's issue list; explicitly decide whether v2 reintroduces an idle-shutdown timer (with #568's cross-host test matrix) or accepts process accumulation, and record the decision.

54. `#1017` (Copilot CLI/Codex fixed project source under D4) is still open; ADR-0007 was not confirmed to have concrete values for those two hosts despite Q11 promising them. Confirm ADR-0007's table has concrete values for Codex and Copilot CLI before marking closed.

55. `#960` (PreToolUse `mcp__` matcher firing on unrelated MCP tools) has no GP3 coverage despite being named in TECH-SPEC:199; matcher surface grew (e479068a, 9f34c6f1) with no name-filter fix. Add a GP3 case: call an unrelated `mcp__` tool, assert zero hook process spawned.

56. This project's own CLAUDE.md still has the exact MANDATORY/BLOCKED-caps routing-block pattern `#946` names as something that trips AI safety classifiers. Confirm whether this file is the v1 artifact ADR-0004 is supposed to delete for Claude Code, or scope it out explicitly.

57. P1 ("no fallback chains, hard deny") removes v1's real mid-session `SQLITE_CORRUPT` self-heal (50aafdce/a5c449df/8a1607e9, a lossless 3-step heal) with no stated replacement failure rule. Add an explicit ADR line: P1 trades mid-session self-heal for hard-error + doctor path — a named decision, not a silent loss.

58. `#880` cleanup race (deleting a live-PID DB) is closed by "live-PID DB never deleted," but v1's cleanup feature evolved incrementally (dc25a00a, 4d7a2f4d, 96990b27) without ever adding a check-inside-transaction guard — the stated fix restates the goal, not the mechanism preventing the check-then-delete race. Specify that the live-PID check happens inside the same transaction/lock as the delete; add a contract test for the race window.

59. `#874` ("can hooks replace tool_result") is listed as an open question, but v1 already built this exact capability for OMP (2ddae394, HookAPI tool_call/tool_result/session_before_compact) and DECISIONS-r3 does not appear to settle the P2-vs-874 contradiction map-I3.md itself names. Confirm whether DECISIONS-r3 settled P2 vs 874; if not, this is a real open gap.

60. ADR-0014's degraded-start `ctx_doctor` report (step 5) has no matching key shape in `issue-intake.mjs`'s fixed `ALLOWED_KEYS`. Define the degraded-report key set in ADR-0014 and mirror it in `issue-intake.mjs`.

61. store-directory.ts:251's symlink-escape check (`escapeRel.startsWith('..')`, f7499570/#687) is the broken version of a bug a later commit (d1ae5625/#852) fixed correctly elsewhere (`security.ts:710`, `rel === '..' || rel.startsWith('..'+sep)`) — ISSUE-OUTCOMES-r2 wrongly marked this covered-by-test. Route directory-walk symlink-escape checks through `security.ts`'s `isPathInsideProject` instead of the separate broken check.

62. `#1211` (stats re-reads every sidecar) was marked needs-decision ("no ADR covers stats rebuild") but ADR-0002:8,36 already decided "no cross-process scans: stats read one file," matching a v1 precedent (e6864fa8) that removed the same pattern for the statusline for identical reasons. Relabel #1211 closed-by-design; drop from map-P1's open-decisions list.

63. `#1182` (AbortSignal/Esc cancel) was marked needs-decision ("timeout/cancel path not decided") but TECH-SPEC's GP4 row already names #1182 and DECISIONS-r3 Q8 fixes the mechanism (one fixed default timeout, kills the whole process tree, Windows Job Object, citing ab5aad90/#1121/#406). Relabel covered-by-test.

64. map-P1.md's "contradictions" section says routing PRs (#1124/#1128/#1189/#1227) are removed by D10 — false. DECISIONS-r3 Q4/Q5 say the hard deny (and #166's silent/verbose curl checks) stays in full. ISSUE-OUTCOMES-r2 closed #1124/#1128/#1126/#1122 citing the stale D10 text. Re-verdict #1124/#1128 as closed-by-design under ADR-0008 r3 (not D10); #1122/#1126 stay closed-by-design as D11 cadence issues — don't lump all four together.

65. map-P2.md row #1086/#1084 cites "D10 (denies gone)" but ADR-0008 r3 states denies are KEPT and reimplemented with a real shell parser, not removed. Re-point citations to ADR-0008 r3 change #1 and its "no new deny categories" line.

66. #1033/#1032 are both filed as a fresh gap (VS Code Remote-WSL root) even though v1 already shipped a partial fix (3d3e4248/#692, VSCODE_CWD cascade) that reopened specifically for Remote-WSL, and #1032/#1033 may be duplicates of each other. Note the duplicate relationship and cite 3d3e4248 as the prior partial fix so a re-close doesn't assume the cascade fix covers Remote-WSL.

67. `#866` ("honor CLAUDE_CONFIG_DIR in stats") is marked a flat close under D3, but v1 has 6+ commits (fc928cb5, c7ba69a3, d49de3a2, 1277e8f0, 2f457d2a, 21e6c349) treating this env var as load-bearing for users who redirect their config dir. Confirm D3's single storage root still resolves via `CLAUDE_CONFIG_DIR` when set; otherwise re-verdict to needs-decision/migration-risk.

68. Codex's external settings-file read path (`#944`) has zero doc coverage anywhere, despite repeated v1 drift fixes (75ae6ae3, 98d239b7, 2a38f833) because the read path was never pinned down. Add an ADR line (extend ADR-0007/0011) stating when/how v2 reads the Codex external settings file, with a contract-test row.

69. ADR-0010 D7 says doctor reports a missing project source but gives no exact per-host output string. Add the exact doctor FAIL message text, one line per host (Codex, Copilot CLI, Remote-WSL).

70. Q14 (main branch protection) names no concrete settings (required checks, reviewer count, force-push/deletion policy) or application method; weekly.yml checks "settings have not drifted" against no source-of-truth list. Add a settings block (required status checks, 1 reviewer, no force-push/deletion) applied via a checked-in script so weekly.yml can diff against it.

71. ADR-0002 Q7 cites commit 962d0cce for the retention size cap, but that commit is an unrelated stats/telemetry commit (bytes_retrieved forwarding); no commit in v1 history introduces a total-index size cap — only a per-chunk `MAX_CHUNK_BYTES=4096` exists. Remove the #962 citation; reopen the size-cap number as an explicit owner decision (Q7b) distinct from `MAX_CHUNK_BYTES`.

## MINORS (unverified / flagged for follow-up, not blocking)

- Only Q6/Q7 were re-verified via git archaeology this pass; Q1-5, Q8-19 need a follow-up MUST-5 pass against ADR-0008/0009/0016.
- #1239/#1235 ("keep user hooks on upgrade") have no git evidence either way; add this rule explicitly to a future Q-item.
- GitHub extensions-install upgrade path for Gemini is untested against #1239's non-context-mode-hook-preservation requirement.
- `getRoutingInstructionsConfig` (Qwen) has no call site in source — verify live or mark dead code.
- Kiro's "no MCP instructions channel" claim rests on an open GitHub issue with no re-check date stamped (unlike the Copilot CLI row).
- No named Kiro fixture tests the plain-text-only PromptSubmit requirement (a real v1 bug, ff9a26/98f0025f lineage).
- Live Copilot CLI E2E needs a PAT, contradicting the keyless-harness decision; no doc resolves it (TECH-SPEC already has a fixture alternative for VS Code Copilot — mirror it).
- Q7 token is duplicated across ADR-0004 (marked open) and DECISIONS-r3 (a different, already-decided Q7) — de-duplicate.
- TECH-SPEC says instructions.md bytes are "appended" in `before_agent_start`, but Pi's API only supports full replace (packages/coding-agent/.../types.ts:1496-1499) — reword to "concatenate and return as full override."
- Pi's MCP readiness is claimed in-process/known with no live check, unlike the file-sentinel mechanism's tested v1 history (04569b12 #230, f4e8d2ac #354, ff5b0cff #844/5/6) — add an LV check.
- ZCode's install command/project-source rule is stated as fact with zero live evidence and no ZCode checkout available this round — tag `[U]` in the table, run S-ZCODE before release-ready.
- #1280 (turndown bundling) fix commit could not be located via git history — mark unverified rather than assumed covered by D2.
- ISSUE-OUTCOMES-r2 labels #1206/#1201 "wont-fix: agent removed," but the actual fix is D7 (static imports only), an architectural rule independent of which adapters ship — re-verdict as closed-by-design (D7).
- #1187 "duplicate of #1199/PR #1171" could not be confirmed (PR API disabled); check `tickets/data/*.json` PR snapshots before treating as resolved.
- The 45.6ms bare-Node p95 figure in GS6 has no named source script/dataset — name or add the benchmark.
- #993 (Windows hook shell format) has no Q-item in Q1-19 despite recurring MinGW path-conversion fixes (89f4e736/a2c82c62/adcc2cc8) — add a decision row before r4.
- #954 (execute_file vs batch_execute worktree containment) has no shared containment function found in git history — use one shared function across all three tools, add a cross-tool GP7 case.
- #878 (chunkMarkdown oversized-paragraph) is assumed covered by the plain-text byte cap (#789) by inference only, not direct test — re-run the original 1MB single-paragraph test directly before marking resolved.
- #901 (upgrade/doctor root mismatch) is treated as new, but the exact bug class already happened once for Codex (98d239b7/#771) and was patched per-adapter — duplicate of item 38 above (merged).
- #865 (ctx_stats ignoring CLAUDE_CONFIG_DIR) has 4 separate point-fixes across modules in v1 history — require one shared `resolveConfigDir()` used by storage, stats, cache-heal, and tests.
- Deny-message template never distinguishes a network/body-to-stdout reason from a size-prediction reason, though ADR-0008 treats them as separate deny paths.
- Working-notes README has no cross-link to where the live upgrade-guide text now lives (ADR-0011 §3c, ADR-0017 R3/R5/R7).
- ADR-0011 wrongly claims v1 checks npm `latest` hourly; `fetchLatestVersion()`'s only two callers are user-run `ctx_doctor`/`/ctx-upgrade` — no cron/timer/hook. Change the sentence; the downstream "no automatic outdated warning" conclusion is still true, just for a different reason.
- R8's v1-migration E2E lacks a named case for npm-global + Copilot-CLI/VS-Code — duplicate of item 41 above (merged).
- `#980`'s cited test file `tests/batch-ingestion-budgets.test.ts` could not be found in v1 history — verify it exists before relying on it as coverage.
- #975 (background:true without timeout hangs) — unspecified whether Q8's fixed default timeout bounds the launching call only, or the detached background child's lifetime too. State explicitly which, or #975 resurfaces in a new form.
- #929's "no npm for v2 removes the Windows postinstall ENOENT bug (#801)" relationship is implicit, not stated — make explicit.
- antigravity-cli's existing per-adapter exec timeout (e4f4379d) must be stated as superseded, not stacked, by the new single default timeout.
- #918/#864 (routing-block/Pi hidden context injection) are the same bug class v1 fixed once already (f2628529/#856, "casual phrases freezing as re-injected behavioral_directive") — confirm every v2 adapter (including in-process Pi) shares one no-user-role-injection primitive rather than reimplementing per adapter.
- round1 review for issues #1296/#1299/#1302 skipped git archaeology despite cheap, exact matches existing (fd4f89a5/9c28ff63 for #1296; 2731ca25 for #1299; ab73792c/ddd3b5bb for #1302) — round2's archaeology is the corrected record; use it.
- GP7's contract-test matrix (2 worktrees × 2 sessions × 2 agents) never names "concurrent chats within one Codex process," the literal shape of #1302, even though #1302 is cited in GP7's issue list — add this as an explicit fourth case.
- ADR-0008's "regexes over a quote-stripped string" row cites #1221/#1106 but not #1299, the same bug class — add #1299 to the citation list.

## PERSIST
Writing to docs/v2/review/REVIEW-r4a.md then running persist.mjs. persist.mjs pushes to the `v2-design` branch of `mksglu/context-mode` via the GitHub API — this is a remote push and requires the user's explicit go-ahead per the standing "never push to remote without approval" rule; flagging before running it.
