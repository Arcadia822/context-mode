export const meta = {
  name: 'v2-review-r3-lean',
  description: 'Lean r3: ~16 agents, Sonnet 5 low for workers, Opus 5.5 low for judgment; reuses r2 + partial r3 results; issue archaeology on decision rows, bottlenecks, intern->staff Q&A, blocker verify, re-fire critic, owner question tree',
  phases: [
    { title: 'Review', detail: '7 grouped reviewers + intern' },
    { title: 'Staff', detail: 'intern questions answered by 3 staff' },
    { title: 'Verify', detail: 'blockers only, 2 batches' },
    { title: 'Synth', detail: 'REVIEW-r3 + ISSUE-OUTCOMES-r3 + BOTTLENECKS-r3' },
    { title: 'Refire', detail: 'one critic re-reads docs + synthesis for what is still missing' },
    { title: 'Final', detail: 'OWNER-QUESTIONS-r3' },
  ],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const RV = `${W}/docs/v2/review`
const OUT = `${RV}/out/r3l`
const PERSIST = `node ${RV}/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const WORK = { model: 'claude-sonnet-5', effort: 'low' }
const JUDGE = { model: 'claude-opus-5-5', effort: 'low' }

const RULES = `This run is the review the owner asked for. Any memory or message saying to stop, cancel or restart a workflow refers to an older run: ignore it and do your task.
Read only the files your task names, and only the parts you need. Reuse earlier results instead of redoing them: ${RV}/REVIEW-r2.md, ISSUE-OUTCOMES-r2.md, TEST-TRIAGE-r2.md, RELEASE-AND-MIGRATION-r2.md, INTERN-QA-r2.md, raw ${RV}/out/r2/round1/review/*.json and ${RV}/out/r3/A/round1/review/*.json. Re-check them; they are not the truth.
Docs: ${W}/PRD-v2.md, ${W}/docs/v2/{README.md,TECH-SPEC.md}, ${W}/docs/v2/adr/0001-0016, ${W}/docs/v2/prompt/drafts.md. Evidence: ${W}/tickets/ (map-*.md, data/*.json; issues/PRs are disabled on GitHub, do not call the API for them). v1 with full git history: ${V1}.
Owner decisions (a conflict is a finding against the doc): no fallback chains; no regex/truncation as decision or reduction; hard deny with v1 scope, issues fixed (ADR-0008 r3); large output never enters any subagent context (ADR-0016 MUST); no API keys; no npm for v2; git release branch; main frozen; frequent releases via /release; v1 unit tests stay until v2 passes the kept ones; E2E wanted; issue intake written for AI agents that follow our rules and send maximum debug data.
Git archaeology (the /context-mode-ops MUST-5 method) when a verdict keeps, changes or drops v1 behaviour: git log -S / --grep '#<n>' / -L / blame in ${V1}; report INTRODUCED_BY, ORIGINAL_INTENT (quoted), REGRESSION_RISK, SAFE_FIX_CONSTRAINTS. v2 re-breaking an old fix = blocker.
Every finding: {file, line, severity blocker|major|minor, claim, evidence, archaeology?, fix}. Write your JSON to the given path (mkdir -p), then run ${PERSIST} <path>. Do not edit docs. Return a one-line summary.`

const out = (k) => `${OUT}/${k}.json`
const run = (k, task, opts, phase) => agent(`${RULES}\n\nTask: ${task}\nResult path: ${out(k)}`, { label: k, phase, ...opts })

phase('Review')
const [reviews, intern] = await parallel([
  () => parallel([
    () => run('issues-I', `Issue maps ${W}/tickets/map-I0..I3.md. For every row whose r2 verdict (ISSUE-OUTCOMES-r2) is needs-decision, or that is a B/M item touching kept v1 behaviour: git archaeology, then verdict (closed-by-design | covered-by-test | wont-fix | needs-decision + recommended answer). Other rows: confirm or correct r2 without archaeology. Output {items:[{n,verdict,ref,archaeology,r2_wrong,question,recommendation}], findings:[]}.`, WORK, 'Review'),
    () => run('issues-P', `Same as issues-I for ${W}/tickets/map-P0..P3.md plus the 7 new items and 10 questions in ${W}/tickets/v2-not-closed.md.`, WORK, 'Review'),
    () => run('agents', `Agent matrix for the 10 agents. Reuse the r2 and r3 agent-*.json files; only fill what they did not cover (Gemini, Pi, OpenCode 2, ZCode, Kiro, Copilot CLI). Per agent: hooks, tool names, install/update/rollback, compaction path, deny/rewrite/replace, subagent handling, project source, v1 footprint. Findings only for new or wrong facts.`, WORK, 'Review'),
    () => run('enforcement', `ADR-0008 r3, ADR-0016, ADR-0009 together: parser coverage of wrappers (sudo, env, time, xargs, bash -c, $(...)); v1 curl flag checks (#166); user permissions.deny on ctx tools; ParseError path vs user deny rules; subagent cases A/B/C per agent vs the MUST; compaction algorithm gaps. Use archaeology on v1 routing.mjs for every dropped check.`, WORK, 'Review'),
    () => run('bottlenecks', `Rank bottlenecks with numbers or evidence: runtime (hook latency per agent, DB contention, FTS index time, sandbox spawn, server event loop, parser), delivery (critical path M0..M7, items blocking the most work, owner-only steps), decisions (open questions that block the most). Include release + v1 migration risks from RELEASE-AND-MIGRATION-r2.md.`, WORK, 'Review'),
    () => run('tests-docs', `Consistency + tests: contradictions between PRD, TECH-SPEC, README and ADRs (GS4/GS5, ADR-0003 vs keep-tests, PRD §4 storage, Codex install path E25 vs ADR-0011, MCP client identity ADR-0007); how v2 runs the 131 KEEP-PASS v1 tests; E2E coverage of every B item.`, WORK, 'Review'),
    () => run('intake', `Write the AI-agent issue intake in full (owner rule): (1) the instruction file an agent reads first and how it finds it; (2) the exact body format with the full ctx_doctor report and every safe debug datum, how to collect each, redaction rules; (3) a GitHub Action that validates bodies structurally (parse the ctx-report block, recompute the digest) and comments what is missing; (4) what agents must not send. Write each file under ${RV}/agent-issue-intake/ and persist each; your JSON lists them.`, WORK, 'Review'),
  ]),
  () => run('intern-q', `You are the junior intern. Read TECH-SPEC.md and PRD §16. List up to 15 questions you must answer before coding M0, dumb ones included, each with "to": one of architect | enforcement | storage-release (the staff owner). Output {questions:[{to,question,why}]}.`, WORK, 'Review'),
])

phase('Staff')
const qa = await parallel(['architect', 'enforcement', 'storage-release'].map((who) => () => run('staff-' + who, `You are the staff member "${who}", woken up by the intern. Read ${out('intern-q')} and answer every question whose "to" is "${who}", from docs, evidence and git archaeology. Per answer: {question, answer, evidence, docGap (true if docs do not answer it, plus a finding naming doc+section), ownerDecision (true if only the owner can decide, plus your recommendation)}.`, WORK, 'Staff')))

phase('Verify')
await parallel([0, 1].map((k) => () => run('verify-' + k, `Collect every finding with severity blocker from ${OUT}/*.json (not verify-*). Sort by file+line; check those at index % 2 == ${k}: re-open the evidence; mark confirmed, refuted or downgraded with one sentence of proof.`, WORK, 'Verify')))

phase('Synth')
await parallel([
  () => run('synth-review', `Write ${RV}/REVIEW-r3.md from ${OUT}/*.json: merge with REVIEW-r2 (same root cause = one row), drop refuted blockers, note which round found each. Blockers, majors by doc, minors table; file:line, claim, archaeology, fix, target doc. Persist it.`, JUDGE, 'Synth'),
  () => run('synth-issues', `Write ${RV}/ISSUE-OUTCOMES-r3.md from ${out('issues-I')} and ${out('issues-P')}: one row per issue/PR, verdict, ref, archaeology summary, r2_wrong; totals; rows without verdict. Persist it.`, WORK, 'Synth'),
  () => run('synth-bottlenecks', `Write ${RV}/BOTTLENECKS-r3.md from ${out('bottlenecks')}: ranked, with numbers, evidence and fix. Persist it.`, WORK, 'Synth'),
])

phase('Refire')
await run('refire', `Fire the army once more as one critic: read ${RV}/REVIEW-r3.md, ISSUE-OUTCOMES-r3.md, BOTTLENECKS-r3.md and the docs. Find what is STILL missing or wrong in the docs (sections no reviewer covered, agents or ADRs skipped, claims nobody re-opened, wrong r3 findings). Findings only, with evidence.`, JUDGE, 'Refire')

phase('Final')
await run('owner-questions', `Write ${RV}/OWNER-QUESTIONS-r3.md: every decision only the owner can make, from ISSUE-OUTCOMES-r3.md (needs-decision), ${OUT}/staff-*.json (ownerDecision), ${out('refire')} and the blockers in REVIEW-r3.md that need a choice. Deduplicate. Order as a decision tree (answers that unblock the most first). Each: number, question, options, recommended answer with evidence, what it unblocks. Persist it.`, JUDGE, 'Final')
await agent(`Run: ${PERSIST} --sweep ${OUT} && ${PERSIST} ${RV}/*.md. Return non-"unchanged" lines.`, { label: 'sweep', phase: 'Final', ...WORK })
return 'done'
