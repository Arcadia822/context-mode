export const meta = {
  name: 'v2-review-army',
  description: 'Review army r2 for PRD-v2 + TECH-SPEC + ADRs: specialists, issue/PR re-audit with git archaeology, v1 test triage, release and v1-migration pre-mortem with keyless rehearsal, 3-lens verify, rounds until dry; every result pushed to v2-design',
  whenToUse: 'Second-round review of the context-mode v2 design. Results are pushed to branch v2-design as they arrive, so a stopped run loses nothing.',
  phases: [
    { title: 'Index', detail: 'lead splits the docs into review units' },
    { title: 'Review', detail: 'specialists, issue shards, test shards, release + migration, in parallel' },
    { title: 'Verify', detail: '3 skeptics per finding, different lenses' },
    { title: 'Critic', detail: 'what was not covered; next round work' },
    { title: 'Synthesize', detail: 'REVIEW, issue outcomes, test ledger, migration plan' },
  ],
}

// ---------- fixed inputs ----------
const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const RUN = (args && args.runLabel) || 'r2'
const OUT = `${W}/docs/v2/review/out/${RUN}`
const PERSIST = `node ${W}/docs/v2/review/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main' // full v1 history, 2230 commits
const MAX_ROUNDS = (args && args.maxRounds) || 3

const RULES = `Docs under review (read-only): ${W}/PRD-v2.md, ${W}/docs/v2/README.md, ${W}/docs/v2/TECH-SPEC.md, ${W}/docs/v2/adr/0001-0016, ${W}/docs/v2/prompt/{drafts.md,lint.mjs}, ${W}/.claude/skills/release/SKILL.md.
Evidence (read-only): ${W}/tickets/ (v2-issue-map.md, map-I0..I3.md, map-P0..P3.md, v2-not-closed.md, v2-test-ledger.md, spike-*.md, verify-single-db.md, round3/4/5-evidence.json, data/*.json issue and PR snapshots). GitHub issues and PRs are disabled on the repo: use the snapshots and the maps, never the API for them.
v1 code with full git history (read-only): ${V1}. Agent sources: /private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/{gemini-cli,qwen-code,opencode,badlogic_pi-mono}.
Owner decisions (a conflict is a finding against the DOC, never a proposal to undo the decision): no fallback chains; no regex and no truncation as a decision or reduction mechanism; hard deny with v1 scope, its issues fixed (ADR-0008 r3); large output never enters any subagent context (ADR-0016, MUST); no API keys for tests; no npm for v2; git release branch; main frozen on v1; frequent releases via the /release skill, no signing; web/ deleted; branch v2; 10 agents; v1 unit tests are NOT deleted at the start: v2 is built until they pass, and at least the tests of the parts v2 keeps must pass; E2E tests are wanted as well.
GIT ARCHAEOLOGY (MUST before any finding that proposes changing or dropping v1 behaviour, and for every issue verdict): in ${V1} run git log --follow --all -- <file>, git log -S '<string>', git log -L <range>:<file>, git blame. Report ARCHAEOLOGY: INTRODUCED_BY (sha, date, subject, PR/issue), ORIGINAL_INTENT (quoted), REGRESSION_RISK, SAFE_FIX_CONSTRAINTS. If v2 would re-break what an old commit fixed, that is a blocker finding.
PERSIST (MUST): write your result JSON to the exact path you are given (mkdir -p first), then run: ${PERSIST} <that path>. If the push fails, say so in your result; the file stays on disk and a sweep pushes it later.
Do NOT edit any doc. Every finding needs evidence (file:line, git output, URL with a quoted line, or command output); otherwise mark it unverified.`

const FINDINGS = {
  type: 'object',
  properties: {
    role: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', properties: {
      file: { type: 'string' }, line: { type: 'integer' },
      category: { type: 'string', enum: ['contradiction', 'unverified-claim', 'wrong-fact', 'gap', 'rule-violation', 'regression-risk', 'risk', 'ambiguity', 'test-gap', 'migration-risk', 'release-risk'] },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      claim: { type: 'string' }, evidence: { type: 'string' }, archaeology: { type: 'string' }, fix: { type: 'string' },
    }, required: ['file', 'line', 'category', 'severity', 'claim', 'evidence', 'fix'] } },
    covered: { type: 'array', items: { type: 'string' } },
    persisted: { type: 'boolean' },
  },
  required: ['role', 'findings', 'covered', 'persisted'],
}
const VOTE = { type: 'object', properties: { refuted: { type: 'boolean' }, why: { type: 'string' }, evidence: { type: 'string' } }, required: ['refuted', 'why'] }
const CRITIC = { type: 'object', properties: { gaps: { type: 'array', items: { type: 'object', properties: { role: { type: 'string' }, task: { type: 'string' } }, required: ['role', 'task'] } } }, required: ['gaps'] }

// ---------- the army ----------
const AGENTS10 = ['Claude Code', 'Codex CLI', 'Gemini CLI', 'Qwen Code', 'Copilot CLI', 'VS Code Copilot', 'Kiro', 'ZCode', 'Pi', 'OpenCode 2']
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const SPECIALISTS = [
  { key: 'consistency', level: 'senior', focus: 'contradictions between PRD, TECH-SPEC, README and ADRs; old text that later ADRs replaced (skills, doctor, nightly, next, GS2, GS5, budgets, ADR-0003 test deletion vs the new keep-tests decision)' },
  { key: 'evidence', level: 'senior', focus: 're-open every [V] claim and every quoted source line' },
  { key: 'architect', level: 'staff', focus: 'one path per behaviour, adapter boundary (ADR-0001), single DB, hidden runtime choices' },
  { key: 'mcp', level: 'senior', focus: 'ADR-0007: MCP 2026-07-28 vs 2025 clients' },
  ...AGENTS10.map((a) => ({ key: 'agent-' + slug(a), level: 'senior', focus: `every row about ${a}: hook names, tool-name prefix, install/update, compaction path, deny/rewrite/replace, subagent handling (ADR-0016), project source, skills` })),
  { key: 'hooks-perf', level: 'staff', focus: 'hook budget GS6, mcp_tool transport, Node startup, event-loop blocking, parallel batches' },
  { key: 'algorithms', level: 'staff', focus: 'ADR-0009 scoring and budgeted greedy, ADR-0008 parser and sink analysis, ADR-0016 chunk selection' },
  { key: 'storage', level: 'senior', focus: 'ADR-0002: node:sqlite, WAL, BEGIN IMMEDIATE, concurrency, corruption, schema' },
  { key: 'security', level: 'staff', focus: 'sandbox escape, deny bypass, wrapper encoding, ADR-0014 redaction, release-branch supply chain' },
  { key: 'prompt', level: 'senior', focus: 'ADR-0005 vs drafts.md and lint.mjs; missing texts: deny message, ctx_resume seq, ctx_route visibility, ADR-0016 more: line' },
  { key: 'qa', level: 'staff', focus: 'ADR-0003 must change: v1 unit tests stay until v2 passes the ones for kept parts; E2E coverage of every B item; ADR-0012 harness' },
  { key: 'windows', level: 'senior', focus: 'Windows: shells, paths with spaces, process-tree kill, PowerShell, Git Bash' },
  { key: 'dx-docs', level: 'mid', focus: 'ADR-0015 README outline, install table rule, upgrade section' },
]
const STAFF_KEYS = ['architect', 'hooks-perf', 'algorithms', 'security', 'qa', 'storage', 'mcp', 'prompt', 'release-premortem', 'v1-migration-sim', 'agent-issue-form']
// owner fears get their own deep roles, with a keyless rehearsal in a clean HOME (no model calls, no keys)
const FEARS = [
  { key: 'release-premortem', level: 'staff', focus: `assume the first v2 release failed. List every way it can fail (release.yml, plan.mjs, generated manifests, marketplace ref switch, cached plugin versions, Codex/Pi commit-based updates, rollback). For each: detection, rollback step, prevention. Then REHEARSE what can be rehearsed without keys: in a temp HOME run 'claude plugin validate' and 'claude plugin marketplace add' against a local test marketplace, and 'codex plugin marketplace add <local path>' with a temp CODEX_HOME. Never touch the real repo branches, never push except via the PERSIST helper.` },
  { key: 'v1-migration-sim', level: 'staff', focus: `simulate a v1 user. In a temp HOME, install v1 the way v1 users did (Claude Code: 'claude plugin marketplace add mksglu/context-mode' + install; Codex: marketplace add with a temp CODEX_HOME; npm global install into a temp prefix). Record the real footprint (files, settings keys, hooks, data dirs). Compare it line by line with the ADR-0011 detect table and the ADR-0010 upgrade steps. Report every leftover the table misses, every step that would break a v1 user mid-upgrade, and the exact order that keeps the user working at every step. No model calls, no keys.` },
  { key: 'agent-issue-form', level: 'staff', focus: `design the v2 issue intake for AI AGENTS, not humans: the reporter is a coding agent (Claude Code, Codex, ...) that files the issue for its user. Find with evidence how agents actually create issues (gh issue create --body / REST API; do GitHub issue forms apply to issues created that way, or only in the web UI?). Design: (1) a machine-readable instruction file the agent reads first (where it lives, how agents find it: issue template, CONTRIBUTING, a link in the ctx_doctor output), written for current Claude/Opus models (ADR-0005 rules); (2) the exact body format with the full ADR-0014 ctx_doctor report plus every debug datum that can be collected safely (agent + version, hook journal rows, deny journal rows, last decisions, failing GP-style repro steps, MCP protocol, config diff), each with how the agent collects it, and the redaction rules it must apply; (3) a GitHub Action that validates every new issue body against that format (structure, not regex: parse the ctx-report block, recompute the digest) and labels or closes invalid ones with a comment telling the agent what is missing; (4) what the agent must NOT send. Write the proposed files in full under "files" in your persisted JSON.` },
]
const ISSUE_SHARDS = ['I0', 'I1', 'I2', 'I3', 'P0', 'P1', 'P2', 'P3'].map((m) => ({ key: 'issues-' + m, level: 'senior',
  focus: `re-audit every row of ${W}/tickets/map-${m}.md against the CURRENT decisions (ADR-0001..0016; several changed after the map was made: deny r3, subagents, doctor/upgrade kept, skills, keep v1 tests). For each item give one verdict: closed-by-design (ADR id), covered-by-test (GP case or kept v1 test file), wont-fix (reason), needs-decision (question). Run git archaeology for every B and M item and for every verdict that changes v1 behaviour. Report as findings only the rows whose old verdict is now wrong or unsupported; put the full per-item table in your persisted JSON under "items".` }))
  .concat([{ key: 'issues-new', level: 'senior', focus: `the 7 items in ${W}/tickets/v2-not-closed.md section 1 and the 10 open design questions in section 2: verdict for each, with git archaeology` }])
const TEST_SHARDS = ['session', 'adapters', 'hooks', 'util', 'core', 'cli+scripts+integration+analytics', 'executor+plugins+security+root files'].map((d) => ({ key: 'tests-' + slug(d), level: 'senior',
  focus: `triage the v1 unit tests in ${V1}/tests (${d}). For each test file: KEEP-PASS (tests behaviour v2 keeps; v2 must pass it, possibly after a mechanical import-path port), PORT (behaviour kept but the test needs rewriting), RETIRED (behaviour removed; name the ADR), and the E2E GP case that also covers it. Use git archaeology on the tests' history (why was each test added, which issue). Run the file against v1 (npx vitest run <file> in ${V1}, node_modules from /private/tmp/cm5869/node_modules if missing) and record pass/fail today. Findings: only tests whose behaviour the docs drop without saying so. Full table in the persisted JSON under "tests".` }))

const UNITS = [...SPECIALISTS, ...FEARS, ...ISSUE_SHARDS, ...TEST_SHARDS]
const pathOf = (round, kind, key) => `${OUT}/round${round}/${kind}/${key}.json`
const keyOf = (f) => `${f.file}#${f.line}#${f.category}`
const sweep = (label) => agent(`Run: ${PERSIST} --sweep ${OUT} . Return its output lines that are not "unchanged".`, { label: 'sweep:' + label, phase: 'Synthesize', effort: 'low' })

// ---------- verify one finding (used by reviewers and by the intern loop) ----------
const LENSES = ['correctness: does the cited source or git output really show this?', 'owner-decisions: does the finding or its fix break an owner decision?', 'reproduce: re-open the files and git history and reproduce it yourself']
async function verify(f, round, tag) {
  const n = f.severity === 'minor' ? 1 : 3
  const votes = (await parallel(LENSES.slice(0, n).map((lens, j) => () => agent(`${RULES}\n\nTry to REFUTE this finding through one lens: ${lens}. Default to refuted=true when the evidence does not hold.\nFINDING: ${JSON.stringify(f)}\nResult path: ${pathOf(round, 'votes', tag + '-' + j)}`, { label: `v${round}:${tag}:${j}`, phase: 'Verify', schema: VOTE, effort: 'low' })))).filter(Boolean)
  return { ...f, round, votes: votes.length, kept: votes.length > 0 && votes.filter((v) => !v.refuted).length * 2 > votes.length }
}

// ---------- intern loop: a junior keeps asking; staff answer; unanswered = doc gap ----------
const QS = { type: 'object', properties: { done: { type: 'boolean' }, questions: { type: 'array', items: { type: 'object', properties: {
  to: { type: 'string' }, question: { type: 'string' }, why: { type: 'string' } }, required: ['to', 'question', 'why'] } } }, required: ['done', 'questions'] }
const ANS = { type: 'object', properties: { answer: { type: 'string' }, evidence: { type: 'string' }, docGap: { type: 'boolean' },
  finding: FINDINGS.properties.findings.items }, required: ['answer', 'evidence', 'docGap'] }
async function internLoop(round) {
  const qa = []
  for (let turn = 1; turn <= 5; turn++) {
    const q = await agent(`${RULES}\n\nYou are the junior intern. Your job: plan the implementation of v2 from the docs alone and ask every question you cannot answer from them, including the ones that feel dumb. Ask the staff member who owns the topic; "to" must be one of: ${STAFF_KEYS.join(', ')}. Ask at most 8 questions per turn, the most blocking first. Questions and answers so far:\n${qa.map((x) => `Q(${x.to}): ${x.question}\nA: ${x.answer}${x.docGap ? ' [DOC GAP]' : ''}`).join('\n') || '(none)'}\nSet done=true when the docs plus these answers let you start coding. Result path: ${pathOf(round, 'intern', 'questions-' + turn)}`, { label: `intern:r${round}:t${turn}`, phase: 'Review', schema: QS })
    if (!q || q.done || !q.questions.length) break
    const answers = await parallel(q.questions.map((x, j) => () => agent(`${RULES}\n\nYou are the staff member "${x.to}", woken up by the intern. Question: ${x.question}\nWhy it matters: ${x.why}\nAnswer from the docs, the evidence files and git history (archaeology when the answer depends on v1 behaviour). If the docs do not answer it, set docGap=true and add a finding (category gap or ambiguity) that names the doc and the section to fix. Result path: ${pathOf(round, 'intern', `answer-${turn}-${j}`)}`, { label: `staff:${x.to}:t${turn}:${j}`, phase: 'Review', schema: ANS })))
    answers.forEach((a, j) => a && qa.push({ ...q.questions[j], ...a }))
  }
  return qa
}

// ---------- run ----------
phase('Index')
await agent(`${RULES}\n\nYou are the Review Lead. List every review unit (file + section heading) and the role keys that must read it, from: ${UNITS.map((u) => u.key).join(', ')}. Write to ${OUT}/index.json and persist it.`, { label: 'lead:index', phase: 'Index', effort: 'low' })

const seen = new Map()
const confirmed = []
let work = UNITS.map((u) => ({ u, extra: '' }))

for (let round = 1; round <= MAX_ROUNDS && work.length; round++) {
  const known = [...seen.values()].map((f) => `${keyOf(f)}: ${f.claim}`)
  log(`round ${round}: ${work.length} units`)
  const retry = []

  const [per, qa] = await parallel([() => pipeline(work,
    (w) => agent(`${RULES}\n\nYou are the ${w.u.level} reviewer "${w.u.key}". Focus: ${w.u.focus}.${w.extra ? '\nExtra task from the completeness critic: ' + w.extra : ''}\nReview round ${round}. Known findings (do not repeat; you may report one as wrong):\n${known.length ? known.map((k) => '- ' + k).join('\n') : '(none)'}\nResult path: ${pathOf(round, 'review', w.u.key)}`, { label: `r${round}:${w.u.key}`, phase: 'Review', schema: FINDINGS }),
    async (res, w) => {
      if (!res) { log(`r${round}:${w.u.key} returned nothing; queued again`); retry.push({ u: w.u, extra: w.extra }); return [] }
      const fresh = res.findings.filter((f) => !seen.has(keyOf(f)))
      fresh.forEach((f) => seen.set(keyOf(f), { ...f, by: w.u.key }))
      return parallel(fresh.map((f, i) => () => verify({ ...f, by: w.u.key }, round, `${w.u.key}-${i}`)))
    }), () => internLoop(round)])

  const gapFindings = (qa || []).filter((x) => x.docGap && x.finding).map((x) => x.finding).filter((f) => !seen.has(keyOf(f)))
  gapFindings.forEach((f) => seen.set(keyOf(f), { ...f, by: 'intern' }))
  const gapJudged = await parallel(gapFindings.map((f, i) => () => verify({ ...f, by: 'intern' }, round, `intern-${i}`)))
  log(`round ${round}: intern asked ${(qa || []).length} questions, ${gapFindings.length} doc gaps`)

  const judged = [...(per || []).filter(Boolean).flat(), ...gapJudged].filter(Boolean)
  confirmed.push(...judged.filter((f) => f.kept))
  log(`round ${round}: ${judged.length} new findings, ${judged.filter((f) => f.kept).length} kept`)
  await sweep('r' + round) // push anything an agent wrote but failed to push

  phase('Critic')
  const critic = await agent(`${RULES}\n\nYou are the completeness critic after round ${round}. Index: ${OUT}/index.json. Results: ${OUT}/round${round}/review/*.json. Find what was NOT covered: units nobody read, [V] claims not re-opened, issue rows without a verdict, test files without a triage verdict, migration steps not simulated. Return gaps as {role, task}; role must be one of: ${UNITS.map((u) => u.key).join(', ')}. Result path: ${pathOf(round, 'critic', 'gaps')}`, { label: `critic:r${round}`, phase: 'Critic', schema: CRITIC })
  const gaps = ((critic && critic.gaps) || []).map((g) => ({ u: UNITS.find((u) => u.key === g.role) || { key: g.role, level: 'senior', focus: g.task }, extra: g.task }))
  work = [...retry, ...gaps]
  if (judged.length === 0 && gaps.length === 0) break
}

phase('Synthesize')
const outputs = await parallel([
  () => agent(`${RULES}\n\nWrite ${W}/docs/v2/review/REVIEW-${RUN}.md from these confirmed findings: ${JSON.stringify(confirmed)}. Counts by severity and category; blockers, majors, minors with file:line, claim, evidence, archaeology, fix, target doc; merge same-root-cause items; refuted ones in an appendix. Persist it.`, { label: 'synth:review', phase: 'Synthesize' }),
  () => agent(`${RULES}\n\nMerge every "items" table from ${OUT}/round*/review/issues-*.json into ${W}/docs/v2/review/ISSUE-OUTCOMES-${RUN}.md: one row per issue/PR (351 map rows + 7 new) with verdict, ADR or GP case, archaeology summary. Totals per verdict. List rows with no verdict. Persist it.`, { label: 'synth:issues', phase: 'Synthesize' }),
  () => agent(`${RULES}\n\nMerge every "tests" table from ${OUT}/round*/review/tests-*.json into ${W}/docs/v2/review/TEST-TRIAGE-${RUN}.md: one row per v1 test file with KEEP-PASS / PORT / RETIRED, ADR, GP case, pass/fail on v1 today. Totals. Then a proposed ADR-0003 r2 text: v1 tests stay; v2 is done when every KEEP-PASS test passes plus GP1-GP11. Persist it.`, { label: 'synth:tests', phase: 'Synthesize' }),
  () => agent(`${RULES}\n\nFrom ${OUT}/round*/review/agent-issue-form.json write the proposed files it lists under ${W}/docs/v2/review/agent-issue-intake/ (each file in full) plus README.md there explaining the flow. Also write ${W}/docs/v2/review/INTERN-QA-${RUN}.md from ${OUT}/round*/intern/*.json: every question, who answered, the answer, and DOC GAP marks. Persist every file.`, { label: 'synth:issue-intake+qa', phase: 'Synthesize' }),
  () => agent(`${RULES}\n\nFrom ${OUT}/round*/review/release-premortem.json and v1-migration-sim.json write ${W}/docs/v2/review/RELEASE-AND-MIGRATION-${RUN}.md: failure modes with detection + rollback, rehearsal results, the real v1 footprint vs the ADR-0011 table, and the step order that keeps a v1 user working at every step. Persist it.`, { label: 'synth:release', phase: 'Synthesize' }),
])
await sweep('final')
return { run: RUN, confirmed: confirmed.length, seen: seen.size, outputs: outputs.map((o) => (o ? 'ok' : 'missing')) }
