export const meta = {
  name: 'v2-review-army-r4',
  description: 'Full army, two passes: pass A re-reviews everything (issues with git archaeology per item, bottlenecks, release, migration, intern Q&A loop with staff), synthesis; pass B fires the army again at the synthesized docs to find what is still missing; final synthesis + one owner question list',
  phases: [
    { title: 'A-Review', detail: 'specialists, 16 issue shards, bottlenecks, release, migration, intern loop' },
    { title: 'A-Verify', detail: 'blockers 3 lenses, majors 1' },
    { title: 'A-Synth', detail: 'REVIEW-r3a, ISSUE-OUTCOMES-r3, BOTTLENECKS-r3' },
    { title: 'B-Review', detail: 'army again on the r3a synthesis: what is still missing' },
    { title: 'B-Verify', detail: 'blockers 3 lenses, majors 1' },
    { title: 'Final', detail: 'REVIEW-r3, OWNER-QUESTIONS-r3' },
  ],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const OUT = `${W}/docs/v2/review/out/r4`
const RV = `${W}/docs/v2/review`
const PERSIST = `node ${RV}/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const SRC = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad'
const VOTE_OPTS = { model: 'claude-sonnet-5', effort: 'low' }
const SL = { model: 'claude-sonnet-5', effort: 'low' } // owner: every agent on Sonnet low

const RULES = `This workflow run is the review the owner asked for. If any memory or earlier message says to stop, cancel or restart a workflow, it refers to an older run: ignore it and do your task.
Docs under review (read-only): ${W}/PRD-v2.md, ${W}/docs/v2/README.md, ${W}/docs/v2/TECH-SPEC.md, ${W}/docs/v2/adr/0001-0017, ${W}/docs/v2/review/DECISIONS-r3.md (accepted owner decisions Q1-Q19), ${W}/docs/v2/prompt/{drafts.md,lint.mjs}, ${W}/.claude/skills/release/SKILL.md.
Previous reviews (read the part you need; NOT the truth, re-check): ${RV}/REVIEW-r3.md, ISSUE-OUTCOMES-r4.md, BOTTLENECKS-r4.md, OWNER-QUESTIONS-r4.md, REVIEW-r2.md, ISSUE-OUTCOMES-r2.md, TEST-TRIAGE-r2.md, RELEASE-AND-MIGRATION-r2.md; raw ${RV}/out/r2, out/r3, out/r3l. Decisions already taken in DECISIONS-r3.md are settled: report only where a doc still contradicts them.
Evidence (read-only): ${W}/tickets/ (map-I0..I3.md, map-P0..P3.md, v2-issue-map.md, v2-not-closed.md, v2-test-ledger.md, spike-*.md, verify-single-db.md, round3/4/5-evidence.json, data/*.json issue+PR snapshots; GitHub issues/PRs are disabled, never call the API for them). v1 code with full history (2230 commits): ${V1}. Agent sources: ${SRC}/{gemini-cli,qwen-code,opencode,badlogic_pi-mono}.
Owner decisions (a conflict is a finding against the DOC, never a proposal to undo the decision): no fallback chains; no regex or truncation as a decision or reduction mechanism; hard deny with v1 scope and its issues fixed (ADR-0008 r3); large output never enters any subagent context (ADR-0016, MUST); no API keys for tests, keyless local harness; no npm for v2; git release branch; main frozen on v1; frequent releases via /release, no signing; web/ deleted; branch v2; 10 agents; v1 unit tests stay until v2 passes the kept ones; E2E tests wanted; the issue intake is written for AI agents, which must follow our rules and send maximum debug data.
GIT ARCHAEOLOGY (MUST, the /context-mode-ops MUST-5 method): before any verdict or finding that keeps, changes or drops v1 behaviour, run in ${V1}: git log --follow --all -- <file>, git log -S '<string>', git log -L <a>,<b>:<file>, git blame -L. Output ARCHAEOLOGY: INTRODUCED_BY (sha date subject, issue/PR), ORIGINAL_INTENT (quote the commit message or code comment), REGRESSION_RISK, SAFE_FIX_CONSTRAINTS. If v2 re-breaks an old fix, that is a blocker.
PERSIST (MUST): write your result JSON to the exact path given (mkdir -p), then run: ${PERSIST} <path>. Do NOT edit any doc. Every finding needs evidence (file:line, git output, URL with a quoted line, or command output); otherwise mark it unverified.`

const FINDING = { type: 'object', properties: {
  file: { type: 'string' }, line: { type: 'integer' },
  category: { type: 'string', enum: ['contradiction', 'unverified-claim', 'wrong-fact', 'gap', 'rule-violation', 'regression-risk', 'bottleneck', 'risk', 'ambiguity', 'test-gap', 'migration-risk', 'release-risk', 'needs-decision'] },
  severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
  claim: { type: 'string' }, evidence: { type: 'string' }, archaeology: { type: 'string' }, fix: { type: 'string' },
}, required: ['file', 'line', 'category', 'severity', 'claim', 'evidence', 'fix'] }
const FINDINGS = { type: 'object', properties: { role: { type: 'string' }, findings: { type: 'array', items: FINDING }, covered: { type: 'array', items: { type: 'string' } }, persisted: { type: 'boolean' } }, required: ['role', 'findings', 'covered', 'persisted'] }
const VOTE = { type: 'object', properties: { refuted: { type: 'boolean' }, why: { type: 'string' }, evidence: { type: 'string' } }, required: ['refuted', 'why'] }
const QS = { type: 'object', properties: { done: { type: 'boolean' }, questions: { type: 'array', items: { type: 'object', properties: { to: { type: 'string' }, question: { type: 'string' }, why: { type: 'string' } }, required: ['to', 'question', 'why'] } } }, required: ['done', 'questions'] }
const ANS = { type: 'object', properties: { answer: { type: 'string' }, evidence: { type: 'string' }, docGap: { type: 'boolean' }, ownerDecision: { type: 'boolean' }, finding: FINDING }, required: ['answer', 'evidence', 'docGap', 'ownerDecision'] }

const AGENTS10 = ['Claude Code', 'Codex CLI', 'Gemini CLI', 'Qwen Code', 'Copilot CLI', 'VS Code Copilot', 'Kiro', 'ZCode', 'Pi', 'OpenCode 2']
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const SPECIALISTS = [
  { key: 'consistency', level: 'senior', focus: 'contradictions between PRD, TECH-SPEC, README and ADRs; text that later decisions replaced' },
  { key: 'evidence', level: 'senior', focus: 're-open every [V] claim and every quoted source line' },
  { key: 'architect', level: 'staff', focus: 'one path per behaviour, adapter boundary, single DB, hidden runtime choices, module plan for M0' },
  { key: 'mcp', level: 'senior', focus: 'ADR-0007 MCP 2026-07-28 vs 2025 clients; client identity when clientInfo comes only at initialize' },
  ...AGENTS10.map((a) => ({ key: 'agent-' + slug(a), level: 'senior', focus: `everything about ${a}: hooks, tool names, install/update/rollback, compaction path, deny/rewrite/replace, subagent handling, project source, skills, v1 footprint` })),
  { key: 'bottlenecks', level: 'staff', focus: 'BOTTLENECKS of three kinds, each with numbers or evidence: (1) runtime: hook latency per agent, DB write contention, FTS index time on large outputs, sandbox spawn, event-loop blocking in the MCP server, parser cost; (2) delivery: the critical path M0..M7, which work items block the most others, single points of failure, owner-only steps; (3) decisions: which open questions block the most work. Rank them.' },
  { key: 'hooks-perf', level: 'staff', focus: 'hook budget GS6, mcp_tool transport, Node startup, parallel batches' },
  { key: 'algorithms', level: 'staff', focus: 'ADR-0008 parser grammar incl. wrappers (sudo, xargs, env, time, bash -c, $(...)), ADR-0009 scoring and greedy, ADR-0016 chunk selection' },
  { key: 'storage', level: 'senior', focus: 'ADR-0002 node:sqlite, WAL, BEGIN IMMEDIATE, corruption policy under one shared DB, schema migration' },
  { key: 'security', level: 'staff', focus: 'sandbox escape, deny bypass, user permissions.deny on ctx tools, proxy handling, ADR-0014 redaction, release-branch supply chain' },
  { key: 'prompt', level: 'senior', focus: 'ADR-0005 vs drafts.md, missing texts (deny message incl. network note, ctx_resume seq, ctx_route visibility, ADR-0016 more: line)' },
  { key: 'qa', level: 'staff', focus: 'tests: the 131 KEEP-PASS v1 tests (TEST-TRIAGE-r2), how v2 runs them, E2E GP1-GP11 coverage of every B item, the keyless harness' },
  { key: 'windows', level: 'senior', focus: 'Windows: Git Bash resolution, paths with spaces, process-tree kill, PowerShell hooks' },
  { key: 'dx-docs', level: 'mid', focus: 'README outline, install table, upgrade guide, docs/ files' },
  { key: 'release-premortem', level: 'staff', focus: 'assume the first v2 release failed: every failure mode with detection, rollback and prevention; the Codex .agents/plugins/marketplace.json path; rollback by version number; staging before publish; concurrency. Rehearse without keys in a temp HOME where you can.' },
  { key: 'v1-migration-sim', level: 'staff', focus: 'simulate v1 users per agent in a temp HOME (no keys, no model calls); compare the real footprint with the ADR-0011 detect table; the step order that keeps a v1 user working at every step; what breaks for npm-global users' },
  { key: 'agent-issue-intake', level: 'staff', focus: 'the issue intake for AI agents (owner rule): instruction file the agent reads first and how it finds it; exact body format with the full ctx_doctor report and every safe debug datum, how to collect each, redaction rules; a GitHub Action that validates bodies structurally (parse the ctx-report block, recompute the digest) and comments what is missing; what agents must not send. Write the files in full under "files" in your JSON.' },
]
const STAFF_KEYS = SPECIALISTS.filter((s) => s.level === 'staff').map((s) => s.key).concat(['mcp', 'storage', 'prompt'])
const ISSUE_SHARDS = ['I0', 'I1', 'I2', 'I3', 'P0', 'P1', 'P2', 'P3'].flatMap((m) => [1, 2].map((h) => ({ key: `issues-${m}-${h}`, level: 'senior',
  focus: `issue map ${W}/tickets/map-${m}.md, ${h === 1 ? 'the FIRST half' : 'the SECOND half'} of its table rows. For EVERY row, dig into the PAST: find every commit that mentions the issue (git log --all --grep="#<n>" and the issue title words), every later commit that touched the same lines (git log -L), and whether the fix was later reverted or re-broken (regression chain). Read the closed-issue titles in ${W}/tickets/data/isall.json for the same topic to find recurring failures. Then run git archaeology on the code the issue is about (find it with git log -S / --grep '#<n>' in ${V1}); give verdict closed-by-design (ADR) | covered-by-test (GP case or KEEP-PASS v1 test file) | wont-fix (reason) | needs-decision (question + your recommended answer); compare with ISSUE-OUTCOMES-r2 and say if r2 was wrong. Findings: rows where v2 re-breaks an old fix, or where r2's verdict is wrong. Full per-row table under "items" in your JSON: {n, verdict, ref, archaeology, fix_commits, regressions, related_closed_issues, r3_wrong, question, recommendation}.` })))
  .concat([{ key: 'issues-new', level: 'senior', focus: `the 7 new items and 10 open questions in ${W}/tickets/v2-not-closed.md: same per-item rules, with archaeology` }])

const keyOf = (f) => `${f.file}#${f.line}#${f.category}`
const pathOf = (pass, round, kind, key) => `${OUT}/${pass}/round${round}/${kind}/${key}.json`

async function verify(f, pass, round, tag) {
  const n = f.severity === 'blocker' ? 3 : f.severity === 'major' ? 1 : 0
  if (n === 0) return { ...f, kept: true, votes: 0, note: 'minor, not verified' }
  const lenses = ['correctness: does the cited source or git output show this?', 'owner-decisions: does the finding or its fix break an owner decision?', 'reproduce: re-open files and git history and reproduce it']
  const votes = (await parallel(lenses.slice(0, n).map((lens, j) => () => agent(`${RULES}\n\nTry to REFUTE this finding through one lens: ${lens}. Default to refuted=true when the evidence does not hold.\nFINDING: ${JSON.stringify(f)}\nResult path: ${pathOf(pass, round, 'votes', tag + '-' + j)}`, { ...SL, label: `${pass}v${round}:${tag}:${j}`, phase: pass + '-Verify', schema: VOTE, ...VOTE_OPTS })))).filter(Boolean)
  return { ...f, votes: votes.length, kept: votes.length > 0 && votes.filter((v) => !v.refuted).length * 2 > votes.length }
}

async function internLoop(pass, round, context) {
  const qa = []
  for (let turn = 1; turn <= 6; turn++) {
    const q = await agent(`${RULES}\n\nYou are the junior intern. ${context} Plan the M0 implementation from the docs alone and ask every question you cannot answer, including the dumb ones. Each question goes to the staff member who owns the topic; "to" is one of: ${STAFF_KEYS.join(', ')}. Up to 8 questions per turn, most blocking first. Do not repeat answered questions. So far:\n${qa.map((x) => `Q(${x.to}): ${x.question}\nA: ${x.answer}${x.docGap ? ' [DOC GAP]' : ''}${x.ownerDecision ? ' [OWNER DECISION]' : ''}`).join('\n') || '(none)'}\nSet done=true only when you could start coding. Result path: ${pathOf(pass, round, 'intern', 'q-' + turn)}`, { ...SL, label: `${pass}:intern:t${turn}`, phase: pass + '-Review', schema: QS })
    if (!q || q.done || !q.questions.length) break
    const answers = await parallel(q.questions.map((x, j) => () => agent(`${RULES}\n\nYou are the staff member "${x.to}", woken up by the intern.\nQuestion: ${x.question}\nWhy: ${x.why}\nAnswer from the docs, evidence and git history (archaeology when v1 behaviour matters). If the docs do not answer it: docGap=true and add a finding naming the doc and section. If only the owner can decide it: ownerDecision=true and give your recommended answer. Result path: ${pathOf(pass, round, 'intern', `a-${turn}-${j}`)}`, { ...SL, label: `${pass}:staff:${x.to}:t${turn}:${j}`, phase: pass + '-Review', schema: ANS })))
    answers.forEach((a, j) => a && qa.push({ ...q.questions[j], ...a }))
  }
  return qa
}

async function pass(name, units, context, seen) {
  const confirmed = []
  let work = units.map((u) => ({ u, extra: '' }))
  for (let round = 1; round <= 2 && work.length; round++) {
    const retry = []
    const [per, qa] = await parallel([
      () => pipeline(work,
        (w) => agent(`${RULES}\n\n${context}\nYou are the ${w.u.level} reviewer "${w.u.key}". Focus: ${w.u.focus}.${w.extra ? '\nExtra task: ' + w.extra : ''}\nDo not repeat findings already listed in the previous review files unless you show they are wrong. Result path: ${pathOf(name, round, 'review', w.u.key)}`, { ...SL, label: `${name}r${round}:${w.u.key}`, phase: name + '-Review', schema: FINDINGS }),
        async (res, w) => {
          if (!res) { retry.push({ u: w.u, extra: w.extra }); return [] }
          const fresh = res.findings.filter((f) => !seen.has(keyOf(f)))
          fresh.forEach((f) => seen.set(keyOf(f), f))
          return parallel(fresh.map((f, i) => () => verify({ ...f, by: w.u.key, pass: name, round }, name, round, `${w.u.key}-${i}`)))
        }),
      () => (round === 1 ? internLoop(name, round, context) : Promise.resolve([])),
    ])
    const gaps = (qa || []).filter((x) => x.docGap && x.finding && !seen.has(keyOf(x.finding))).map((x) => x.finding)
    gaps.forEach((f) => seen.set(keyOf(f), f))
    const gapJudged = await parallel(gaps.map((f, i) => () => verify({ ...f, by: 'intern', pass: name, round }, name, round, `intern-${i}`)))
    const judged = [...(per || []).filter(Boolean).flat(), ...gapJudged].filter(Boolean)
    confirmed.push(...judged.filter((f) => f.kept))
    log(`${name} round ${round}: ${judged.length} new, ${judged.filter((f) => f.kept).length} kept, intern ${(qa || []).length} Q&A`)
    const critic = await agent(`${RULES}\n\nCompleteness critic for pass ${name} round ${round}. Results: ${OUT}/${name}/round${round}/. List what is NOT covered: doc sections nobody read, issue rows without verdict or archaeology, agents or ADRs skipped, units that returned nothing. Return gaps as {role, task}; role from: ${units.map((u) => u.key).join(', ')}. Result path: ${pathOf(name, round, 'critic', 'gaps')}`, { ...SL, label: `${name}:critic:r${round}`, phase: name + '-Review', schema: { type: 'object', properties: { gaps: { type: 'array', items: { type: 'object', properties: { role: { type: 'string' }, task: { type: 'string' } }, required: ['role', 'task'] } } }, required: ['gaps'] } })
    work = [...retry, ...((critic && critic.gaps) || []).map((g) => ({ u: units.find((u) => u.key === g.role) || { key: g.role, level: 'senior', focus: g.task }, extra: g.task }))]
  }
  await agent(`Run: ${PERSIST} --sweep ${OUT}/${name} . Return non-"unchanged" lines.`, { ...SL, label: `${name}:sweep`, phase: name + '-Review', ...VOTE_OPTS })
  return confirmed
}

// ---------- pass A ----------
const seen = new Map()
const confirmedA = await pass('A', [...SPECIALISTS, ...ISSUE_SHARDS], 'Pass A: full re-review of the docs and of every issue/PR, with git archaeology.', seen)
phase('A-Synth')
await parallel([
  () => agent(`${RULES}\n\nWrite ${RV}/REVIEW-r4a.md from these confirmed findings: ${JSON.stringify(confirmedA)}. Merge same root cause; blockers, majors, minors; file:line, claim, evidence, archaeology, fix, target doc. Persist it.`, { ...SL, label: 'A:synth-review', phase: 'A-Synth' }),
  () => agent(`${RULES}\n\nMerge every "items" table from ${OUT}/A/round*/review/issues-*.json into ${RV}/ISSUE-OUTCOMES-r4.md: one row per issue/PR with verdict, ref, archaeology summary, r2_wrong, question + recommendation. Totals; list rows with no verdict or no archaeology. Persist it.`, { ...SL, label: 'A:synth-issues', phase: 'A-Synth' }),
  () => agent(`${RULES}\n\nFrom ${OUT}/A/round*/review/bottlenecks.json, hooks-perf.json, storage.json, release-premortem.json write ${RV}/BOTTLENECKS-r4.md: ranked runtime, delivery and decision bottlenecks with numbers, evidence and the fix. Persist it.`, { ...SL, label: 'A:synth-bottlenecks', phase: 'A-Synth' }),
  () => agent(`${RULES}\n\nFrom ${OUT}/A/round*/review/agent-issue-intake.json write every proposed file in full under ${RV}/agent-issue-intake/ (instruction file, body format, validation workflow, CONTRIBUTING) plus README.md. Persist every file.`, { ...SL, label: 'A:synth-intake', phase: 'A-Synth' }),
])

// ---------- pass B: fire the army again at the synthesis ----------
const confirmedB = await pass('B', SPECIALISTS, `Pass B: the army reviews the docs AGAIN, now with ${RV}/REVIEW-r4a.md, ISSUE-OUTCOMES-r4.md and BOTTLENECKS-r4.md as input. Find what pass A still missed in the docs, and findings of pass A that are wrong.`, seen)

phase('Final')
await parallel([
  () => agent(`${RULES}\n\nWrite ${RV}/REVIEW-r4.md: pass A file ${RV}/REVIEW-r4a.md plus these pass B confirmed findings: ${JSON.stringify(confirmedB)}. Mark which pass found each item. Persist it.`, { ...SL, label: 'final:review', phase: 'Final' }),
  () => agent(`${RULES}\n\nWrite ${RV}/OWNER-QUESTIONS-r4.md: every decision only the owner can make, from ISSUE-OUTCOMES-r4.md (needs-decision rows), ${OUT}/*/round*/intern/a-*.json (ownerDecision=true), and the blockers in REVIEW-r4a.md that need a choice. Deduplicate. Order them as a decision tree: questions whose answers unblock the most other questions first. Each: number, one-paragraph question, options, recommended answer with evidence, what it unblocks. Persist it.`, { ...SL, label: 'final:questions', phase: 'Final' }),
])
await agent(`Run: ${PERSIST} --sweep ${OUT} && ${PERSIST} ${RV}/*.md. Return non-"unchanged" lines.`, { ...SL, label: 'final:sweep', phase: 'Final', ...VOTE_OPTS })
return { A: confirmedA.length, B: confirmedB.length, seen: seen.size }
