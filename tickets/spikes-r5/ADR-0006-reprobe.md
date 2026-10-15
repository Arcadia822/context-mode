# ADR-0006 re-probe: alwaysLoad on Opus and Sonnet (2026-10-15)

Real runs only — no simulated data. 24 sessions, 1 run each, via the real binary
`/opt/homebrew/Caskroom/claude-code@latest/2.1.283/claude -p`, env built from scratch
(`env -i PATH HOME USER TMPDIR`, no gateway, no API key). Reused `/tmp/gplive2`
(base repo, `stub.mjs`, `tools.json`, `instr-A.txt`/`instr-A2.txt`) from the §3.6
pilot. Driver: `/tmp/spikes-r5/driver.sh`. Raw streams: `/tmp/spikes-r5/out-*.jsonl`.

## Exact command (per cell)

```
env -i PATH="$PATH" HOME="$HOME" USER="$USER" TMPDIR="$TMPDIR" \
  /opt/homebrew/Caskroom/claude-code@latest/2.1.283/claude -p "<task prompt>" \
  --model <claude-opus-5-5|claude-sonnet-5> --effort low \
  --mcp-config /tmp/spikes-r5/mcp-<cell>.json --strict-mcp-config \
  --allowedTools "mcp__context-mode Bash Read Write Edit Glob Grep" \
  --setting-sources project --max-budget-usd 0.3 \
  --output-format stream-json --verbose --permission-mode bypassPermissions
```

`mcp-<cell>.json` points `stub.mjs` at `instr-A.txt` (`ALWAYS_LOAD=0`) or
`instr-A2.txt` (`ALWAYS_LOAD=1`, which sets `_meta: {"anthropic/alwaysLoad": true}`
on `ctx_execute` in `tools/list`).

Tasks (same wording for every model/variant):
- S1 "Is the git tree clean? Answer yes or no."
- S2 "What does README.md say? Quote it."
- S3 "Create a file named notes.txt with the text: done"
- L1 "How many ERROR lines are in app.log? Give the exact count."
- L2 "Run run-tests.sh and report how many tests failed."
- L3 "How many users have status active in data.json? Give the exact count."

Classification: first tool call that is not `ToolSearch`, read from each
session's `assistant` events in the `.jsonl`.

## Results (24 sessions, from actual `.jsonl` output)

| Model | Variant | alwaysLoad | Over-routing (small→ctx) | Under-routing (large→native) | First tool, L1/L2/L3 | Ground-truth match | Cost (6 tasks) |
|---|---|---|---|---|---|---|---|
| claude-opus-5-5 | A | no | 0/3 | **3/3** | Bash/Bash/Bash | 6/6 | $0.378 |
| claude-opus-5-5 | A2 | **yes** | 0/3 | **1/3** | Bash/ctx_execute/ctx_execute | 6/6 | $0.470 |
| claude-sonnet-5 | A | no | 0/3 | **3/3** | Bash/Bash/Bash | 6/6 | $0.417 |
| claude-sonnet-5 | A2 | **yes** | 0/3 | **3/3** | Bash/Bash/Bash | 6/6 | $0.426 |

Small tasks (S1-S3): no over-routing in any of the 4 cells (0/12 small-task
sessions used ctx first). S1 answered by Sonnet (both variants) with no tool
call at all (`firstTool=none`) — the model answered "Yes" from context/training
assumption, not a `git status` run; this is not over-routing but it is not a
verified answer either, and it happened in both Sonnet variants regardless of
alwaysLoad.

Ground truth, measured directly from the files in this run (not assumed):
- L1: 667 `ERROR` lines in `app.log` — matches the §3.6 pilot value, and all 24
  large-task answers (where a tool was run) got 667.
- L2: `run-tests.sh` fails on `i % 997 == 0` for `i` in `0..3999`, i.e.
  `i = 0, 997, 1994, 2991, 3988` — **5 failures**, not 4. The TECH-SPEC §3.6
  value "0/997/1994/2991" missed `3988`; every session in this re-probe that
  actually ran the script (23 of 24 large-task sessions; all of them) reported
  5 failed tests, consistently. This re-probe corrects that number.
- L3: the prompt here asked for `status == "active"` specifically. The real
  file has 18,461 active and 1,539 inactive out of 20,000 rows. Every session
  that ran a real command reported both numbers; the §3.6 value "1,539" was
  the inactive count, so the question wording differs from §3.6, not the data.
  Both numbers check out against the file.

## Verdict

**Accept ADR-0006 for Opus, reject it as a Sonnet fix.** alwaysLoad on
`ctx_execute` only changed Opus's behavior in this sample: Opus went from 3/3
under-routing (A) to 1/3 (A2) — it used the deferred `ctx_execute` tool
directly on L2 and L3 once it no longer had to search for it, dropping to
native `Bash` only on L1 (a correct choice either way: `grep -c ERROR` is a
"native" job, not reaching for the sandbox). Sonnet under-routed 3/3 in
**both** variants — alwaysLoad made no measurable difference to Sonnet's tool
choice on these 6 tasks. Both models stayed at 0/3 over-routing in both
variants, so alwaysLoad caused no small-task over-triggering in this sample on
either model — the ADR's stated risk did not materialize, but neither did its
full benefit on Sonnet. Sample size is 1 run per cell (24 sessions total);
this re-probe sharpens the §3.6 Opus-only finding into a per-model one and
should not be read as more than that single-run signal.

## Changes

2026-10-15: new file. Re-probe of §3.6 (previously Opus-only, 3 variants × 2
runs) on 2 models × 2 variants × 1 run; corrects the §3.6 L2 ground truth from
4 to 5 failures (missed `i=3988`).
