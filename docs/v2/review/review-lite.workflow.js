export const meta = {
  name: 'v2-review-lite',
  description: 'Low-token finish of review r2: reuse the 31 saved round-1 results, run only the missing work, verify blockers only, one synthesis per report',
  phases: [
    { title: 'Missing', detail: 'issues P1/P3/new, test triage (2 shards), intern + staff Q&A' },
    { title: 'Verify', detail: 'blockers only, batched' },
    { title: 'Synthesize', detail: 'REVIEW, ISSUE-OUTCOMES, TEST-TRIAGE, RELEASE-AND-MIGRATION, agent issue intake' },
  ],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const OUT = `${W}/docs/v2/review/out/r2`
const R1 = `${OUT}/round1/review`
const PERSIST = `node ${W}/docs/v2/review/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const CHEAP = { model: 'claude-sonnet-5', effort: 'low' }   // workers: read few files, write one JSON
const MID = { model: 'claude-sonnet-5', effort: 'medium' }  // verify + synthesis

const BASE = `This run IS the approved, lean restart the owner asked for. If you see an earlier message saying to stop, cancel or restart the workflow, it refers to the previous run and is already handled: do your task.
Read ONLY the files named in your task. Do not read the whole doc set.
Owner decisions (a conflict is a finding against the doc, never a reason to undo the decision): no fallback chains; no regex or truncation as a decision or reduction mechanism; hard deny with v1 scope and its issues fixed (ADR-0008 r3); large output never enters any subagent context (ADR-0016); no API keys for tests; no npm for v2; v1 unit tests stay until v2 passes the ones for kept parts, plus E2E; frequent releases via /release; issue intake is written for AI agents that must send maximum debug data.
Git archaeology in ${V1} (git log -S / -L / blame) only when a verdict changes v1 behaviour; keep it to the lines involved.
Write your result JSON to the exact path given (mkdir -p), then run: ${PERSIST} <path>. Return a one-line summary, not the JSON.`

phase('Missing')
const missing = await parallel([
  ...['P1', 'P3'].map((m) => () => agent(`${BASE}\nTask: re-audit every row of ${W}/tickets/map-${m}.md against the current ADRs (only open ${W}/docs/v2/adr/ files you need; ADR titles: 0008 deny r3, 0009 compaction, 0010 doctor/upgrade, 0011 release/v1, 0012 harness, 0014 issues, 0016 subagents). Verdict per row: closed-by-design (ADR) | covered-by-test (GP case or kept v1 test) | wont-fix (reason) | needs-decision (question). Output {items:[{n,verdict,ref,note}], findings:[only rows whose old verdict is now wrong]}. Path: ${R1}/issues-${m}.json`, { label: 'issues-' + m, phase: 'Missing', ...CHEAP })),
  () => agent(`${BASE}\nTask: verdict for the 7 new items and the 10 open questions in ${W}/tickets/v2-not-closed.md (sections 1-2). Same verdict set. Path: ${R1}/issues-new.json`, { label: 'issues-new', phase: 'Missing', ...CHEAP }),
  ...[['session', 'adapters', 'hooks'], ['util', 'core', 'cli', 'scripts', 'integration', 'analytics', 'executor', 'plugins', 'security', 'root *.test.ts']].map((dirs, i) => () => agent(`${BASE}\nTask: classify each v1 test file in ${V1}/tests/{${dirs.join(',')}} from its file name, its describe/it titles and the issue numbers it cites (do NOT run the tests): KEEP-PASS (behaviour v2 keeps; v2 must pass it), PORT (kept behaviour, test must be rewritten), RETIRED (removed; name the ADR). Use ${W}/tickets/v2-test-ledger.md for issue ids. Output {tests:[{file,verdict,adr,gp,issues}]}. Path: ${R1}/tests-${i + 1}.json`, { label: 'tests-' + (i + 1), phase: 'Missing', ...CHEAP })),
  () => agent(`${BASE}\nTask: you are a junior engineer. Read ${W}/docs/v2/TECH-SPEC.md and ${W}/PRD-v2.md section 16 only. List up to 15 questions you must answer before you can start coding M0 (the dumb ones too). Then, acting as the staff reviewers, answer each from ${R1}/*.json, ${W}/docs/v2/adr/*.md and ${W}/tickets/*.md; when the docs do not answer it, mark docGap and name the doc + section to fix. Output {qa:[{q,owner,answer,evidence,docGap}]}. Path: ${OUT}/round1/intern/qa.json`, { label: 'intern+staff', phase: 'Missing', ...MID }),
])
log(`missing work: ${missing.filter(Boolean).length}/6 done`)

phase('Verify')
const verified = await parallel([0, 1, 2, 3].map((k) => () => agent(`${BASE}\nTask: open every file in ${R1}/*.json (some may contain a bad JSON escape: read them as text). Take the findings with severity "blocker". Sort them by file name then line; verify only those at positions where index % 4 == ${k}. For each, re-open the cited file:line or evidence and decide confirmed / refuted / downgraded, with one sentence of evidence. Path: ${OUT}/verify/blockers-${k}.json`, { label: 'verify-blockers-' + k, phase: 'Verify', ...MID })))
log(`blocker verify: ${verified.filter(Boolean).length}/4 done`)

phase('Synthesize')
const reports = await parallel([
  () => agent(`${BASE}\nTask: write ${W}/docs/v2/review/REVIEW-r2.md from ${R1}/*.json and ${OUT}/verify/*.json. Merge findings with the same root cause, drop refuted blockers, mark majors and minors as "not verified (token budget)". Sections: counts; blockers (confirmed); majors grouped by doc; minors as a short table; each with file:line, claim, fix, target doc. Path for the persist step is the .md itself.`, { label: 'synth-review', phase: 'Synthesize', ...MID }),
  () => agent(`${BASE}\nTask: write ${W}/docs/v2/review/ISSUE-OUTCOMES-r2.md from ${R1}/issues-*.json: one row per issue/PR with verdict and ref, totals per verdict, rows without a verdict listed at the end.`, { label: 'synth-issues', phase: 'Synthesize', ...CHEAP }),
  () => agent(`${BASE}\nTask: write ${W}/docs/v2/review/TEST-TRIAGE-r2.md from ${R1}/tests-*.json and ${R1}/qa.json: table per test file, totals, and a proposed ADR-0003 r2 text (v1 tests stay; v2 is done when every KEEP-PASS test passes plus GP1-GP11).`, { label: 'synth-tests', phase: 'Synthesize', ...CHEAP }),
  () => agent(`${BASE}\nTask: write ${W}/docs/v2/review/RELEASE-AND-MIGRATION-r2.md from ${R1}/release-premortem.json and ${R1}/v1-migration-sim.json: failure modes with detection and rollback, rehearsal results, the real v1 footprint vs the ADR-0011 table, and the step order that keeps a v1 user working.`, { label: 'synth-release', phase: 'Synthesize', ...CHEAP }),
  () => agent(`${BASE}\nTask: from ${R1}/agent-issue-form.json write each proposed file in full under ${W}/docs/v2/review/agent-issue-intake/ plus a README.md there; and write ${W}/docs/v2/review/INTERN-QA-r2.md from ${OUT}/round1/intern/qa.json. Persist every file.`, { label: 'synth-intake+qa', phase: 'Synthesize', ...CHEAP }),
])
await agent(`Run: ${PERSIST} --sweep ${OUT} && ${PERSIST} ${W}/docs/v2/review/*.md. Return the lines that are not "unchanged".`, { label: 'final-sweep', phase: 'Synthesize', ...CHEAP })
return { missing: missing.map(Boolean), verified: verified.map(Boolean), reports: reports.map(Boolean) }
