# Verify: single shared DB (claims C1–C8)

Rule: VERIFIED only if a check found evidence and no skeptic refuted it with evidence. Each claim had 2 skeptic votes, and none refuted. Bench files are in the session scratchpad `bench/`. All runs used Node v26.8.1 on macOS.

## C1 — node:sqlite sleeps on SQLITE_BUSY, no CPU spin — VERIFIED (true)
- What is true: with `{timeout}`, node:sqlite calls `sqlite3_busy_timeout` (node `src/node_sqlite.cc:1107`, v26.8.1). The SQLite default busy handler calls `sqlite3OsSleep` (`src/main.c:1779,1789`). The wait still blocks the JS thread, because the API is sync.
- Numbers: B waited 2533 ms and used 4.0 ms CPU (0.16%). Skeptic re-runs: 4378 ms wait, 2.0 ms CPU (0.05%), and 2512 ms wait, 3.9 ms CPU.
- Not checked: Node 22, and the Node version that first added `timeout`.

## C2 — #985 came from better-sqlite3 in a Bun loop — FALSE
- What is true: the #985 CPU spin comes from our own `withRetry()` busy loop in `src/db-base.ts:446` (`while (Date.now() - start < delay) {}`, delays [100,500,2000] at line 432). This loop is still on main. better-sqlite3 caused only the second symptom: its sync `busy_timeout` (30000 ms, lines 557/565) freezes the event loop at low CPU. The reporter used Windows 11, node.exe and v1.0.169. The issue body does not mention Bun (`grep -iw bun` finds nothing). In the comments, bun:sqlite shows up only as a second engine where the same freeze happens.
- Numbers: one fully blocked op spins for 2.6 s. Load was 99% of one core and 665 CPU-s in total. One commenter saw a stall of about 125 s, which fits 4×30 s + 2.6 s.

## C3 — WAL: N processes write one DB, no errors, no spin — VERIFIED (true, with one rule)
- Rule: open every write transaction with `BEGIN IMMEDIATE`. A deferred BEGIN that reads, then writes after another process commits, gets SQLITE_BUSY at once (0 ms), and busy_timeout does not help.
- Numbers: 8 writers × 2000 rows, 4 FTS5 readers and a 20 MB indexer gave 0 busy errors and exact row counts (16,000 + 320). integrity_check and the FTS5 integrity-check both passed. Write p50 0.05–0.07 ms, p99 7–24 ms. 1 MB index tx p50 24 ms, p99 108 ms. FTS5 query p50 0.63 ms, p99 about 6 ms. A blocked writer used about 1 ms CPU over a 1.7–2.7 s wait. A lock held longer than the timeout fails with "database is locked" after about 5.2 s.
- Not checked: Bun, better-sqlite3, Node 22.

## C4 — hook INSERT fits in 20 ms CPU — FALSE
- What is true: Node startup alone costs about 28–37 ms CPU. The DB part (open, pragma, INSERT, close) costs only 0.8–1.0 ms CPU. A JSONL append is no cheaper (p50 38 ms). Startup breaks the budget, not SQLite.
- Numbers, CPU p50/p95: empty ESM 29.8/34.5. sqlite idle 30.3/32.6. sqlite under load 31.6/36.1. JSONL 38.1/45.3.
- Not proven: the wall-time numbers under load. The data file is garbled, so treat them as unknown.

## C5 — marketplace main tracking; ref "release" migrates users — PARTLY
- What is true: users track main (no ref, `source: "./"`), and main ships committed bundles (7 on GitHub main, not 8), so a main with no bundles breaks them. A `{github, ref:"release"}` source is the right fix, but it does not reach users on its own. They get it only with auto-update (off by default) or a manual `/plugin marketplace update` / `claude plugin update`, and only if the plugin.json version changes.
- Not checked: a real end-to-end switch.

## C6 — `npm deprecate` warns `npx context-mode` users — PARTLY
- What is true: the command changes only the registry entry and publishes no new version. npx shows the warning only on a fresh download (run 1 printed it, the cached run 2 did not). Most users run a global binary (19 `npm install -g` lines in the README, 1 npx line), and the Cursor, VS Code and JetBrains configs run `context-mode` directly. These users see the warning only when they reinstall.
- Not checked: whether MCP clients show npx stderr at all.

## C7 — v1 leftovers; other agents stay on v1 — PARTLY
- What is true: v1 writes hook and MCP entries into each agent's own config (Claude Code: `<configDir>/settings.json`, `claude-code/index.ts:116,210`). v1 does NOT auto-write CLAUDE.md or AGENTS.md. Those are templates the user copies by hand. Data lives under `<agentConfigDir>/context-mode/sessions/` for each agent (or `CONTEXT_MODE_DATA_DIR`), not only under `~/.claude`.
- Unknown: "other agents stay on v1" is a plan decision, so code cannot prove it. The JetBrains session dir was not checked.

## C8 — GitHub traffic API / install counters — PARTLY
- What is true: `traffic/clones` works with owner access and gives a 14-day window of daily count and uniques. Release `download_count` is a separate counter, and this repo's releases have 0 assets.
- Numbers: 406,880 clones and 46,327 unique cloners (2026-09-28 to 2026-10-11).
- Unknown: whether the marketplaces or galleries show install counts.

## Design consequences: one shared context.db per project, hooks insert directly

1. **Engine:** node:sqlite with `{timeout: 5000}` is safe from CPU spin (C1, C3). Do not use better-sqlite3's 30 s timeout in the server process, because the sync wait freezes the event loop (C2).
2. **Remove `withRetry` busy loop** in `db-base.ts:446`. It is the real cause of #985. Let `busy_timeout` handle waits. If a retry is still needed, it must sleep (`Atomics.wait` or an async timer), never spin.
3. **All writes use `BEGIN IMMEDIATE`** and short transactions. WAL + `synchronous=NORMAL`. No read-then-write in a deferred transaction (C3).
4. **Hook cost:** about 30 ms CPU per hook is Node startup, and you pay it whatever the storage is. The direct INSERT adds about 1 ms, so a direct insert is fine. A 20 ms budget is only reachable with no new process at all (for example a running daemon or a non-Node hook) (C4).
5. **Lock time:** keep server and indexer transactions small (about 1 MB chunks, p99 108 ms) so hooks never get near the 5 s timeout. A lock held longer than the timeout makes the hook fail with "database is locked". Hooks must catch this and drop the event, not crash.
6. **Server event loop:** big indexing writes on the server still block JS while they wait. Run them in a worker thread or in small chunks.
7. **Rollout:** shipping v2 to plugin users needs a version bump plus a `ref: "release"` source, and users must update. Deprecation warnings reach few users (C5, C6). Plan to migrate per-agent v1 session dirs (C7).
