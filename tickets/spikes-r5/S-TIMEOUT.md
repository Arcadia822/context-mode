# Spike S-TIMEOUT — ctx_execute default timeout

## 1. Git archaeology — why v1 removed the fixed default (#406)

Repo: `/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main`

Commands run:
```
git log --all --grep="406" --oneline
git log --all --grep="timeout" --oneline
git log -1 --format="%H%n%B" eea5877b
for n in 936 947 953 959 968 975; do git log --all --oneline | grep -i "$n"; done
```

Commit `eea5877b` ("fix(opencode-plugin+executor+routing): Mickey 3-issue + Issue #406 timeout policy") is the source commit. Quoted from the commit message:

> Long-running build commands (Gradle/Maven/SBT) were terminated by the Zod `.default(30000)` ms timeout in ctx_execute / ctx_execute_file / `.default(60000)` in ctx_batch_execute whenever the caller forgot to pass an explicit value. Server-side timeout policy is the wrong layer — every MCP host already enforces its own RPC timeout — and stacking env-var defaults on top would create dead config.
>
> Fix:
>  - Drop the Zod `.default(...)` from all three tools' timeout schemas; keep `.optional()`. When the caller omits `timeout`, no server-side timer fires (the host's RPC timeout governs).
>  - PolyglotExecutor: when `timeout === undefined`, do not set the setTimeout timer at all.

**Issues #936, #947, #953, #959, #968, #975 — result: NOT FOUND.** `git log --all --grep` and plain `--oneline | grep` for each of these six numbers matched only unrelated commits (hash substrings or install-stat bumps, e.g. `0ba8f936` is a statusline Windows-timeout test, not issue #936). No commit message references any of these six issue numbers. This spike cannot confirm they are real timeout-regression issues from this repo's git history — the decision text citing them as blockers is not supported by the archaeology done here.

## 2. Real long-running commands — fresh copy, cold run

Copy made at `/tmp/spikes-r5/v1` (original untouched). Node `v26.8.1`, package.json `engines.node: ">=22.5.0"`.

| Step | Command | Result | Wall time |
|---|---|---|---|
| Install | `npm ci` | **failed** — repo ships `bun.lock`, no npm lockfile; npm ci needs one | 0.5s (fail) |
| Install | `bun install` | 191 packages installed | 25.2s |
| Type check | `npx tsc --noEmit` | passed | 2.9s |
| Build | `npm run build` (tsc + esbuild bundle + assert-bundle + assert-asymmetric-drift) | all OK | 3.3s |
| Full test suite | `npx vitest run` | 210 files, 4714 passed / 28 skipped (4742 total) | 55.5s wall (133.3s reported "tests" time, parallelized) |

So a cold full cycle (install → typecheck → build → full suite) is roughly 25s + 3s + 3s + 55s ≈ 86s wall on this Mac, with the vitest suite alone as the single longest step at ~55s wall / up to 133s of actual test time under parallel workers.

## 3. Claude Code's own Bash tool defaults

Fetched `https://code.claude.com/docs/en/env-vars.md` (sandbox fetch, not curl — curl/wget are blocked by this repo's routing rules). Quoted:

> `BASH_DEFAULT_TIMEOUT_MS` — Default timeout for a foreground Bash or PowerShell tool command, in milliseconds (default: 120000, or 2 minutes).

> `BASH_MAX_TIMEOUT_MS` — Maximum timeout the model can set for a foreground Bash or PowerShell tool command, in milliseconds (default: 600000, or 10 minutes). The effective ceiling is the larger of this and `BASH_DEFAULT_TIMEOUT_MS`.

So Claude Code's own Bash tool: **default 120,000 ms (2 min), max 600,000 ms (10 min)**.

## 4. Proposal

- **Default timeout: 120,000 ms (2 minutes)** — matches Claude Code's own Bash tool default and covers typecheck/build steps measured above (2.9s and 3.3s) with large headroom.
- **Max timeout: 600,000 ms (10 minutes)** — matches Claude Code's own Bash tool max, and covers the measured full vitest run (55.5s wall / 133s test time) with large headroom; a caller needing more (e.g. a slow CI-grade build) must pass an explicit `timeout` value above this, same pattern v1 already chose in #406 (no default, explicit opt-in for long jobs).
- **Process-tree kill:**
  - **Unix/macOS**: spawn the child in its own process group (`detached: true` / `setsid`), then on timeout send the kill signal to the **negative PID** (`process.kill(-pid, 'SIGTERM')`, escalate to `SIGKILL`) so grandchildren (e.g. a build spawning sub-compilers) die too, not just the direct child.
  - **Windows**: spawn with a **Job Object**, assign the child process to it on creation, and on timeout call `TerminateJobObject` so the whole tree is killed in one call — plain `taskkill /PID` on the direct child alone leaves orphaned grandchildren, which is the exact class of regression tested by `#854` ("reap idle MCP bridge children") found during archaeology above.

## Commands index (for reproduction)

```
cd <cm-main>
git log --all --grep="406" --oneline
git log --all --grep="timeout" --oneline
git log -1 --format="%H%n%B" eea5877b
for n in 936 947 953 959 968 975; do git log --all --oneline | grep -i "$n"; done

cp -R <cm-main> /tmp/spikes-r5/v1
cd /tmp/spikes-r5/v1
npm ci                 # fails, no npm lockfile
bun install             # 25.2s
npx tsc --noEmit        # 2.9s
npm run build            # 3.3s
npx vitest run           # 55.5s wall, 4714 passed / 28 skipped
```
