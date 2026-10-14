# Owner questions after review r4

These are the choices only the owner can make. Decisions already closed in `DECISIONS-r3.md` (Q1-Q19) are not repeated here. Order: the question that frees the most other work comes first.

## Q1. Codex install: config file or plugin store?

PRD-v2.md (E25) says Codex must install through a plain `config.toml` entry, not a plugin. The reason: the plugin runs in a cache folder where `${VAR}` values do not expand (issue #1210). But ADR-0011, ADR-0013, and the README still describe a plugin-marketplace install for Codex. The two paths cannot both be true. The team needs one answer before it can write the installer or the release smoke test.

**Options:**
- A. Use `config.toml` only. Remove the plugin-marketplace path for Codex.
- B. Keep `config.toml` as the main path, but keep plugin-marketplace as a second, non-default path.
- C. Keep plugin-marketplace only (reverse E25).

**Recommended: A.** PRD-v2.md E25 already states this and gives the reason (#1210, spike S0). Pick A and edit ADR-0011, the README, and ADR-0013 to match.

**Unblocks:** the Codex installer, ADR-0011/0013 edits, the release smoke job, and ticket #1208/#1217 (Windows shell question, which depends on knowing how Codex is installed first).

---

## Q2. Windows shell: which one does `ctx_execute` launch, and in what order?

TECH-SPEC has no rule for picking a shell on Windows. v1 fixed this three times (commits for `resolveWindowsBash`, WSL/WindowsApps exclusion, and MSYS path handling for git calls only). None of that logic is written into v2 docs. Without a rule, GP4 tests cannot be written and #1208/#1217/#1212 stay open.

**Options:**
- A. Port v1's rule as-is: try the canonical bash path first, then `where bash` (skipping WSL and WindowsApps copies), then fall back to PowerShell. Keep MSYS path-conversion only for git commands.
- B. Design a new rule from scratch for v2.
- C. Drop bash support on Windows; PowerShell/cmd only.

**Recommended: A.** This is a working, tested rule from v1 with three known bug fixes behind it (commits 65012337, e2bce0b5 #826, 89f4e736 #782/#788). Re-deriving it risks repeating the same three bugs.

**Unblocks:** GP4 test writing, #1208, #1212, #1217.

---

## Q3. What is the actual timeout number for `ctx_execute`?

DECISIONS-r3 Q8 says the default timeout is "measured, not 120 s," pointing to a spike. The spike has not produced a number. v1 history shows the opposite of what was assumed: commit eea5877b *removed* a fixed 30-second default because it was killing long builds, and replaced it with "no timer unless the caller asks for one." So there may be no number to set at all.

**Options:**
- A. No server-side default. The timer only runs if the caller passes a `timeout` value; otherwise the host's own RPC timeout applies (this is what v1 ended up doing).
- B. Run the spike now and pick a fixed number anyway.
- C. Pick a long safety ceiling (e.g. 10 minutes) as a backstop, with no timer below that unless asked.

**Recommended: A.** It matches v1's last word on this exact bug and needs no new spike.

**Unblocks:** TECH-SPEC Q8, PRD E5, GP4 tests, and #975 (background-process timeout scope).

---

## Q4. What replaces the removed self-heal for plugin-cache mismatches?

v1 had code that auto-detected and fixed a stale plugin cache (#1215/#1191). In v2, `ctx doctor` is manual only — nothing runs this check automatically. If nothing replaces it, users with a stale cache get silent breakage until they happen to run doctor.

**Options:**
- A. Accept the gap. Manual `ctx doctor` only; document it clearly in the upgrade docs.
- B. Add an automatic check at server start or install time.

**Recommended: A, with a visible warning.** v2's design intent is fewer background watchers; add one line to the install docs telling users to run `ctx doctor` after any plugin-cache change. Confirm this is an accepted trade-off, not an oversight.

**Unblocks:** #1215, #1191, the install docs section, ADR-0010.

---

## Q5. Who renames the database aside on corruption, and what do other writers do?

ADR-0002 has no rule at all for a corrupt shared `context.db`. Several processes can hold the file open at once (Q6 already decided multiple writers are kept). v1's old rule — delete and recreate — assumed one writer; doing that on a file 4+ processes share would wipe everyone's history.

**Options:**
- A. The process that first hits `SQLITE_CORRUPT` renames the file aside (never deletes) and creates a fresh one; other open writers get a write error and must reopen the new file or ask the agent to restart.
- B. No process acts automatically; `ctx_doctor` reports corruption and gives the user a fix command to run by hand.

**Recommended: A**, matching the corruption-rename precedent from v1 (no v1 commit ever deletes-in-place for a multi-writer file) while adding the retry-reopen step v1 never needed.

**Unblocks:** ADR-0002, GP8/GP9 tests, PRD E19 (the `--fix` line review already flagged as contradicting the single-DB model).

---

## Q6. How does a headless agent (no chat window) confirm data deletion for `ctx_upgrade mode:uninstall`?

ADR-0010 says uninstall keeps user data unless the user confirms, but names no confirm channel. Agents such as Kiro, ZCode, and Pi have no interactive prompt in front of the MCP call, so there is currently no way for them to ever get real consent.

**Options:**
- A. Require a tool argument carrying an explicit confirmation string the user typed in this session. Missing or wrong argument = always keep the data, answer the agent, and ask it to get a clear yes from the user first.
- B. Only allow uninstall-with-data-removal on hosts known to support an interactive confirm step (Claude Code, Codex); block it everywhere else.

**Recommended: A.** Works the same on every host and needs no per-host interactive-support list to maintain.

**Unblocks:** ADR-0010, `ctx_upgrade` implementation, GP tests for uninstall.

---

## Q7. Is the retention size cap real, and if so what is the number?

ADR-0002 Q7 cites commit #962 for a size cap. That commit is unrelated — a stats/telemetry change, not a cap. No commit in v1 history adds a total-index size cap; only a per-chunk `MAX_CHUNK_BYTES=4096` exists. The cited evidence for this part of Q7 is wrong.

**Options:**
- A. No total-index cap; only the existing per-chunk 4096-byte limit applies. Retention stays age + live-PID only (the rest of Q7, already decided).
- B. Add a real total-index size cap now, with a chosen number.
- C. Leave it an open RFC (issue #962 itself is a "not yet discussed" RFC) and block nothing on it.

**Recommended: C**, since #962 is explicitly an open RFC, not a decided fix — closing it now would invent a number with no evidence behind it. Remove the wrong citation from ADR-0002 regardless of which option is picked.

**Unblocks:** ADR-0002's retention section, map-P1's open-decisions list.

---

## Q8. Does v2 keep the v1 fix that lets `ctx_execute`/host detect client platform from a cached `clientInfo` value?

ADR-0007 says identity must never come from the connection — only from request `_meta` and hook payloads. But v1 fixed two real bugs (#542, #539) by reading the one-time `clientInfo` value sent at connection setup, cached, to tell client platforms apart. ADR-0007 as written would forbid re-doing that fix.

**Options:**
- A. Narrow ADR-0007's rule to agent/session identity only. Allow reading the cached, one-time `clientInfo.name` from setup for client/platform detection (not for identity or security decisions).
- B. Keep the rule absolute and find a different platform-detection signal.

**Recommended: A.** It keeps the real security goal (no live connection state for identity) while not re-breaking #542/#539.

**Unblocks:** ADR-0007, GP1/GP2 tests, adapter routing code.

---

## Q9. Codex, OpenCode, Qwen Code, Copilot CLI: what is each one's single project-source signal?

Q11 already decided "one named source per host, no fallback chain" — but it only names a few hosts. Qwen Code and Copilot CLI still fall back through 2-3 signals in the current code, which Q11 forbids once applied to them.

**Options:**
- A. Extend Q11 now: Qwen Code uses `QWEN_PROJECT_DIR` only; Copilot CLI uses the hook payload's `cwd` only. Doctor reports "source missing," no fallback, for both.
- B. Leave these two hosts on their current fallback chains as an accepted exception.

**Recommended: A**, for consistency with Q11's own stated reason (predictable behavior over convenience).

**Unblocks:** adapter code for Qwen Code and Copilot CLI, GP7 tests, doctor's missing-source report.

---

## Q10. Kiro: six open findings and a paid-plan-only test requirement — ready for a ruling?

DECISIONS-r3 never mentions Kiro once, even though six Kiro findings were raised as far back as round 3 (tool-name matcher, session-id fallback, an API-key rule clash, release channel, project-source default, stdout format). Separately, the test plan requires `KIRO_API_KEY`, a paid-plan-only key, which breaks the "no API keys, keyless local harness" rule the owner already set.

**Options:**
- A. Rule on all six Kiro findings now as a batch, and replace the `KIRO_API_KEY` test with a local `kiro-cli login` session-token path.
- B. Mark Kiro tests skipped with a documented reason for now; decide the six findings later.

**Recommended: A** for the key issue (it directly breaks an existing rule); B is acceptable for the six smaller findings if time is short, but they should get a date, not stay silent.

**Unblocks:** Kiro adapter work, ADR-0012's keyless-harness guarantee, release test matrix.

---

## Q11. Concrete mechanism for the async hook / CPU-budget rule — name it and make it a CI gate?

TECH-SPEC states a CPU budget and "PostToolUse async where host allows" but names no real mechanism and no enforcement. A reviewer suggested "detached spawn, host does not wait on stdout," which is reasonable but was never written into the spec as the decided approach, so GP3 cannot test it.

**Options:**
- A. Adopt "detached spawn, host does not wait on stdout" as the named mechanism; add the actual CPU-budget number; make it a GP3 CI-enforced test, not just documentation.
- B. Leave it as a documentation-only budget with no CI check for this release.

**Recommended: A**, matching the existing owner preference (documented elsewhere) for CI-enforced limits over honor-system documentation.

**Unblocks:** TECH-SPEC's GP3 row, #1261, the hooks-perf implementation.

---

## Q12. Release automation: approve building the missing safety steps now?

Three gaps have been flagged the same way across rounds 2, 3, and 4 with no recorded objection: (1) no concurrency guard and no staging-ref smoke test before `release.yml` fast-forwards, (2) no named smoke-test script exists anywhere in the repo despite being described in prose, (3) the release skill runs `npm ci` and skips the 131 kept v1 unit tests before its end-to-end step. None of these are ambiguous choices — they just need the owner's go-ahead to spend the implementation time, since nothing else in this list depends on them.

**Options:**
- A. Approve all three: add `concurrency: {group: release}` plus a staging-ref smoke step in `release.yml`; write `scripts/release/smoke.mjs` with named checks; add a vitest KEEP-PASS step before the e2e step and drop or scope `npm ci`.
- B. Defer to a later release.

**Recommended: A.** No objection has been raised in three review rounds; this is confirmation, not a new design question.

**Unblocks:** `release.yml`, ADR-0013's job table, `.claude/skills/release/SKILL.md`.

---

## Dropped as already decided or not an owner question

- #1268 (ZCode adapter): reviewer recommendation to defer is clear and uncontested; no real ambiguity, left to the implementer.
- #1263 (Pi SessionStart carrier): the source doc already flags this as open with no new information this round; not a new decision.
- #1199/#1187 (did PR #1171 merge): a yes/no fact to check in git/tickets, not a choice for the owner.
- #1211, #1182 (per REVIEW-r4a #62, #63): already resolved by existing ADR-0002 and DECISIONS-r3 Q8 text; re-verdict them closed instead of needs-decision.
- #1258 (DeepSeek Harness scope): already covered by DECISIONS-r3 Q19 ("DeepSeek Harness adapter: no").
