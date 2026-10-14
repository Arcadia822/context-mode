# ADR-0009: State after compaction = budgeted greedy selection over the session journal

- Status: Proposed r2 (2026-10-14). It replaces r1. The owner asked for an algorithm based on best practice.
- Evidence: workflow `wf_5b7e35b3-72f`, topic `compaction-algorithm`: 19 findings verified, 2 unverified, 1 refuted. Raw output: `tickets/round4-evidence.json`. Prototype: `/tmp/wf4/sk/`.

## Best practice (sources)

- **Anthropic context editing:** clear the oldest tool results first, put a placeholder in their place, keep the last N (default 3). This is *observation masking*.
- **Anthropic memory tool:** "memory preserves the information that must survive summarization", kept as a progress log in an external store.
- **JetBrains, "The Complexity Trap"** (arXiv 2508.21433): observation masking "halves cost … while matching … LLM summarization".
- **Generative Agents:** score = recency decay + importance; take the best items that fit the budget.
- **What Claude Code restores itself after compaction:** CLAUDE.md, auto memory, git status, the plan, and up to 5 recently changed files. Context that hooks added earlier is summarized away. So our block must **not** repeat file contents; paths are enough.
- **Only re-injection point:** SessionStart with `source=compact`. PreCompact cannot inject. [V] live: a 234 B block reached the model whole.

## v1 failures this fixes

- the snapshot had no byte budget
- text was cut (80 chars, 400 chars, 150 chars)
- the header contained the clock, so the output was not stable
- "unresolved errors" were never resolved, and resolution used regex
- eviction used fixed priority labels

## Decision

The block is a deterministic function of this session's journal rows. No LLM, no regex, and no text is ever cut: whole items are selected, or an item becomes a pointer.

### 1. Journal (in `context.db`)

```
events(seq PK, session_id, worktree, agent, kind, tool, key, path, ok, exit_code, bytes, body, turn)
INDEX (session_id, kind, seq), (session_id, kind, key, seq)
```

Rows by kind:
- `prompt`: user prompts
- `edit`: Write/Edit file path, ok/fail
- `cmd`: shell / `ctx_execute`; key = tool + canonical command
- `toolerr`: other failed tools; key = tool + stable JSON of the input
- `index`: `ctx_index` source

How the values are computed, with no regex:
- **Canonical command:** a quote-aware state machine that only folds whitespace outside quotes.
- **exit_code:** read from the first line of the error with `startsWith("Exit code ")` and a digit loop.
- **Claude Code also registers PostToolUseFailure.** Without it, failures are never recorded.

### 2. Candidates

Every query has `WHERE session_id = :current`. An empty id means nothing is injected.

| Section | Rule |
|---|---|
| last request | the newest prompt, always included (pinned) |
| open errors | keys whose last failure is newer than their last success: **resolved structurally**, when the same command or input later succeeds |
| changed files | paths, last write wins, with an edit count |
| earlier requests | the other prompts |
| indexed sources | `ctx_index` sources |

Each section gives at most 85 candidates. That is ⌊2048 / 24⌋, the shortest possible line, so no more lines could fit anyway.

### 3. Score (integers only)

```
w      = open error 900 · prompt 500 · edit 400 · index 200
age    = current turn − item turn
decay  = 0.25 + 0.75 · 2^(−age/4)        half-life 4 turns, from a checked-in integer table
bonus  = 1 + ⌊log2(repeat count)⌋
score  = w · decay · bonus
```

### 4. Selection: budgeted lazy greedy (knapsack by score/size)

- Budget **B = 2,048 UTF-8 bytes**: 5× under Claude Code's 10,000-char spill limit.
- `ratio = score · 0.7^k / bytes`, where k = lines already taken from that section. This decaying gain keeps the sections mixed.
- Take items in ratio order. An item that does not fit is skipped, and smaller ones may still fit.
- An item over 640 B is never cut. It becomes a pointer line: `#<seq> (<bytes> B) ctx_resume(seq:<seq>)`.
- `ctx_resume(seq:N)` is a primary-key read of the whole row, so a pointer is never a dead end.
- At most 340 candidates, O(m²) worst case: under 0.2 ms. Measured whole algorithm: 4.3–8.9 ms.

### 5. Render

```
<context_mode_state session="ID" upto="MAXSEQ">
… sections in a fixed order; lines in seq order …
more: ctx_search(queries:[…], scope:"session")
</context_mode_state>
```

- No clock, no user role, bare tool names, framed as data.
- **Same rows → same bytes.** [V] 10 runs out of 10 identical, and rows from other sessions are ignored.

### 6. Delivery: one path per agent

| Agent | Path |
|---|---|
| Claude Code, Codex, Qwen, ZCode | computed inside SessionStart(compact). No PreCompact hook, no precomputing |
| Gemini, Copilot CLI, VS Code | the compaction hook writes `meta('pending_compact:'+sid)`. The next prompt hook runs `DELETE … RETURNING` in a `BEGIN IMMEDIATE` transaction, so the injection happens exactly once |
| Pi | `session_compact` flag, then `before_agent_start`, once |
| OpenCode 2, Kiro | live test first (r1 notes still apply) |

### 7. Memory

- There is no injected memory, and the role/intent classifier is removed.
- What the user decided are the user's own prompts.
- Auto-memory is only a search source inside `ctx_search`.

## Golden cases (GP6)

- the block is ≤ 2,048 B for a journal of 10,000 rows (#1022)
- no foreign session rows (#1274)
- an error fixed later is not listed
- the same rows give identical bytes
- an item over 640 B becomes a pointer, and `ctx_resume(seq)` returns it whole
- not the user role (#1263), bare tool names (#1028), no "directive" text (#911, #1259)

## Open

- Hook budget: the whole SessionStart process is 48.6 ms p95, of which bare Node is 45.6 ms. See ADR-0008 "Open".

## r3 decision (2026-10-14, `docs/v2/review/DECISIONS-r3.md`)

- Q12: on OpenCode and Pi the state block is delivered once, through a channel that keeps the prompt cache stable.
- Q2: unrelated to the 2,048 B state budget here; the global output cap is 16,384 B.
