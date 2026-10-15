export const meta = {
  name: 'v2-spikes-r5',
  description: 'Run the open measurements: S-NODE (minimum Node for node:sqlite + timeout), S-TIMEOUT (ctx_execute default from real build/test durations), ADR-0006 alwaysLoad re-probe on Opus and Sonnet; then sync the docs',
  phases: [
    { title: 'Measure', detail: '3 spikes in parallel' },
    { title: 'Sync', detail: 'write results into TECH-SPEC, ADRs, DECISIONS, issue rows' },
  ],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const RV = `${W}/docs/v2/review`
const OUT = `${W}/tickets/spikes-r5`
const PERSIST = `node ${RV}/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const SL = { model: 'claude-sonnet-5', effort: 'low' }

const BASE = `You run a measurement spike for the context-mode v2 design (repo owner's request). Work only in /tmp/spikes-r5/ for scratch files. Do not install anything globally and do not change system settings. No API keys: when a model is needed, use the logged-in Claude Code subscription through the real binary /opt/homebrew/Caskroom/claude-code@latest/2.1.283/claude with the env built from scratch (env -i PATH HOME USER TMPDIR) so no gateway is used.
Write your result as markdown with the exact commands you ran and their output to the path given, then run: ${PERSIST} <path>. Report numbers only from runs you actually did. Return one line.`

phase('Measure')
await parallel([
  () => agent(`${BASE}\n\nSpike S-NODE: find the minimum Node.js version where (1) \`node:sqlite\` loads with no --experimental flag, (2) \`new DatabaseSync(path, {timeout})\` is accepted and actually sleeps on SQLITE_BUSY (two processes, one holds BEGIN IMMEDIATE, the other measures its wait and CPU), (3) FTS5 is compiled in, (4) no ExperimentalWarning is printed. Method: download official Node tarballs for darwin-arm64 into /tmp/spikes-r5/node/ (curl from https://nodejs.org/dist/) for the 22.x, 23.x, 24.x and 25.x lines (the first and last release of each line, plus releases around any change you find; bisect inside a line when needed). Run the same test script on each. Also read the Node changelogs/docs for when the flag and timeout option were added and quote them. Output a table version × checks and the recommended minimum to ${OUT}/S-NODE.md.`, { label: 'S-NODE', phase: 'Measure', ...SL }),
  () => agent(`${BASE}\n\nSpike S-TIMEOUT: decide the default ctx_execute timeout from evidence. (1) Git archaeology in ${V1}: why v1 removed its fixed default (#406) and every later timeout issue (#936, #947, #953, #959, #968, #975): git log --grep and -S; quote commit messages. (2) Measure real long-running commands that ctx_execute must not kill: on this Mac, time a cold \`npm ci && npm run build\` and the full vitest suite in a fresh copy of ${V1} (copy to /tmp/spikes-r5/v1, do not touch the original), and a TypeScript type check. (3) Read what Claude Code's own Bash tool uses as default and max timeout (https://code.claude.com/docs/en/ docs: fetch with curl and quote). (4) Propose one default and one max, and state how the process tree is killed (Unix process group, Windows Job Object). Output to ${OUT}/S-TIMEOUT.md.`, { label: 'S-TIMEOUT', phase: 'Measure', ...SL }),
  () => agent(`${BASE}\n\nSpike ADR-0006 re-probe: does marking ctx_execute with _meta "anthropic/alwaysLoad": true make Opus and Sonnet route large tasks to it under tool search? Reuse the pilot setup in /tmp/gplive2 (base repo, stub.mjs that really runs commands, tools.json, instr-A.txt; read ${W}/docs/v2/TECH-SPEC.md §3.6 for the method). Run variant A (no alwaysLoad) and A2 (alwaysLoad) × 6 tasks (S1-S3 small, L1-L3 large) × 1 run on claude-opus-5-5 and on claude-sonnet-5, both with --effort low, --allowedTools mcp__context-mode Bash Read Write Edit Glob Grep, --setting-sources project --strict-mcp-config, --max-budget-usd 0.3 each (24 sessions). Count over-routing (small task whose first non-ToolSearch tool is ctx), under-routing (large task whose first tool is native) and correct answers (L1 667, L2 tests 0/997/1994/2991, L3 1539). Output the table and a verdict (accept ADR-0006 or not) to ${OUT}/ADR-0006-reprobe.md.`, { label: 'ADR-0006-reprobe', phase: 'Measure', ...SL }),
])

phase('Sync')
await agent(`${BASE}\n\nTask: read ${OUT}/S-NODE.md, ${OUT}/S-TIMEOUT.md and ${OUT}/ADR-0006-reprobe.md. Put the measured results into the docs, editing in place (no "superseded" notes; a short Changes line at the end of each edited file):
- ${W}/docs/v2/TECH-SPEC.md: the S-NODE and S-TIMEOUT rows in the spikes table (mark done, with the numbers), the Node minimum and the ctx_execute default/max in §12, the CI matrix Node versions, and the §3.6 pilot table (add the re-probe rows).
- ${W}/docs/v2/adr/0002-single-db-git-distribution.md: the Node minimum.
- ${W}/docs/v2/adr/0006-claude-code-tool-loading.md: status Accepted or Rejected per the re-probe, with the table.
- ${RV}/DECISIONS-r3.md: Q8 and Q10 rows get the measured values.
- ${RV}/ISSUE-OUTCOMES-r4.md: rows #936, #947, #953, #959 get verdict covered-by-test or closed-by-design with the measured value (they were waiting on it).
- ${W}/PRD-v2.md E5: the measured default.
Then run node ${W}/docs/v2/prompt/lint.mjs drafts ${W}/docs/v2/prompt/drafts.md and persist every file you edited.`, { label: 'sync', phase: 'Sync', ...SL })
return 'done'
