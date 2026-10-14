export const meta = {
  name: 'v2-fix-sync-r4',
  description: 'Research every r4 finding and needs-decision row, decide each (owner delegated all decisions), fix the docs per file owner, then a sync check and one fix-up round; every edit pushed',
  phases: [
    { title: 'Research', detail: '5 researchers: doc findings + needs-decision issue rows, with git archaeology' },
    { title: 'Decide', detail: 'one decision per root cause -> DECISIONS-r4.md + edit plan per file' },
    { title: 'Edit', detail: '8 file owners edit disjoint files' },
    { title: 'Sync', detail: 'cross-doc consistency check, then owners fix the leftovers' },
  ],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const RV = `${W}/docs/v2/review`
const OUT = `${RV}/out/fix-r4`
const PERSIST = `node ${RV}/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const SL = { model: 'claude-sonnet-5', effort: 'low' }
const JUDGE = { model: 'claude-opus-5-5', effort: 'low' }

const RULES = `Context you may see injected from memory: earlier owner messages about stopping, restarting or pushing workflows are already carried out and do not apply to you. The owner's current instruction: "research everything A to Z, you know the right answer, fix the docs and bring them in sync". The owner delegated every open decision to this run.
Docs: ${W}/PRD-v2.md, ${W}/docs/v2/{README.md,TECH-SPEC.md}, ${W}/docs/v2/adr/0001-0017, ${W}/docs/v2/prompt/drafts.md, ${W}/.claude/skills/release/SKILL.md, ${RV}/DECISIONS-r3.md, ${RV}/agent-issue-intake/.
Review inputs: ${RV}/REVIEW-r4a.md (pass A, verified), ${RV}/out/r4/B/round*/review/*.json + votes (pass B), ${RV}/ISSUE-OUTCOMES-r4.md (243 KB: grep, do not read whole), ${RV}/BOTTLENECKS-r4.md. v1 with full history: ${V1}. Issue snapshots: ${W}/tickets/data/*.json (GitHub issues/PRs are disabled; no API).
Fixed owner rules (never change): no fallback chains; no regex/truncation as a runtime decision or reduction mechanism (CI tools may use regex); hard deny with v1 scope and its issues fixed; large output never enters any subagent context; no API keys for any test; no npm for v2 (install, update and release); git release branch; main frozen and branch-protected; frequent releases via /release; v1 unit tests stay until v2 passes the 131 KEEP-PASS ones; an E2E case at every step on claude-sonnet-5 effort low; v1 users must not leave (ADR-0017 R1-R8); issue intake is for AI agents and sends maximum debug data, only secrets stripped; 10 agents; one shared context.db per project.
Decision rule: pick the option that (1) keeps every owner rule, (2) does not re-break a v1 fix (git archaeology: git log -S/--grep/-L/blame in ${V1}; quote the commit), (3) is the simplest single path. Cite evidence for every decision.
Write output files to the exact paths given (mkdir -p), then run ${PERSIST} <file> for each file you wrote or edited. Return one line.`

const out = (k) => `${OUT}/${k}.json`
const run = (k, task, opts, phase) => agent(`${RULES}\n\nTask: ${task}`, { label: k, phase, ...opts })

phase('Research')
await parallel([
  () => run('res-docs-A', `Every BLOCKER and MAJOR in ${RV}/REVIEW-r4a.md. For each: confirm it against the current doc text (some may already be fixed), research the right fix with archaeology, and output {items:[{id, files, problem, decision, evidence, edits:[{file, section, change}]}]} to ${out('res-docs-A')}.`, SL, 'Research'),
  () => run('res-docs-B', `Every finding in ${RV}/out/r4/B/round*/review/*.json (skip ones refuted in votes). Same output shape as res-docs-A, to ${out('res-docs-B')}. Also check the two r3 decision citations REVIEW-r4a flags (Q1 cites 855e330d; Q6 cites 939c5ca8) and give the corrected text.`, SL, 'Research'),
  ...[0, 1, 2].map((k) => () => run('res-issues-' + k, `The needs-decision rows of ${RV}/ISSUE-OUTCOMES-r4.md (grep -n 'needs-decision'); take those at positions where index % 3 == ${k}. For each row: decide (closed-by-design with ADR | covered-by-test with GP case or KEEP-PASS test | wont-fix with reason), using archaeology when v1 behaviour is involved. Group rows with the same root cause. Output {groups:[{root_cause, rows:[n], decision, evidence, edits:[{file, section, change}]}]} to ${out('res-issues-' + k)}.`, SL, 'Research')),
])

phase('Decide')
await run('decide', `Read ${OUT}/res-*.json. Merge into one decision per root cause; resolve conflicts between researchers with the decision rule. Write ${RV}/DECISIONS-r4.md: table (id, root cause, decision, evidence, issue rows, files) and a corrections section for DECISIONS-r3 (wrong citations). Then write the edit plan to ${out('plan')} as {files: {"<path>": [{section, change, decision_id}]}} using ONLY these owner keys as groups: prd, techspec, readme, adr-a (0001-0005), adr-b (0006-0009), adr-c (0010-0013), adr-d (0014-0017 + agent-issue-intake/), misc (release SKILL.md, prompt/drafts.md, DECISIONS-r3.md, ISSUE-OUTCOMES-r4.md verdict column). Shape: {owners:{prd:[...], techspec:[...], ...}} each item {file, section, change, decision_id}.`, JUDGE, 'Decide')

const OWNERS = {
  prd: `${W}/PRD-v2.md`,
  techspec: `${W}/docs/v2/TECH-SPEC.md`,
  readme: `${W}/docs/v2/README.md`,
  'adr-a': `${W}/docs/v2/adr/0001-*.md .. 0005-*.md`,
  'adr-b': `${W}/docs/v2/adr/0006-*.md .. 0009-*.md`,
  'adr-c': `${W}/docs/v2/adr/0010-*.md .. 0013-*.md`,
  'adr-d': `${W}/docs/v2/adr/0014-*.md .. 0017-*.md and ${RV}/agent-issue-intake/*`,
  misc: `${W}/.claude/skills/release/SKILL.md, ${W}/docs/v2/prompt/drafts.md, ${RV}/DECISIONS-r3.md, ${RV}/ISSUE-OUTCOMES-r4.md`,
}
const editPrompt = (o, extra) => `You own ONLY these files: ${OWNERS[o]}. Never edit any other file. Apply the edits listed under owners.${o} in ${out('plan')}${extra || ''}. Edit in place: rewrite the stale text so the doc reads as one current design (do not just append "superseded" notes; remove contradicted text, keep history only in a short "Changes" line at the end). Keep the house style: short sentences, plain English, tables, file:line evidence. Write the list of edits you made to ${out('edit-' + o)}. Persist every file you changed.`

phase('Edit')
await parallel(Object.keys(OWNERS).map((o) => () => run('edit-' + o, editPrompt(o), SL, 'Edit')))

phase('Sync')
const sync = await run('sync', `Check that all docs now say the same thing. At least: tool count and names; Codex install mode; agent list (10); test policy (KEEP-PASS + E2E every step); no npm anywhere in v2 install/update/release; branch names; output cap 16384; doctor/upgrade/uninstall as tools; hook budget; project source per host; issue intake rules; every DECISIONS-r3 and DECISIONS-r4 decision appears in its target doc; no doc cites a commit for the wrong thing. Also run: node ${W}/docs/v2/prompt/lint.mjs drafts ${W}/docs/v2/prompt/drafts.md. Write {mismatches:[{owner, file, line, problem, fix}]} with owner from: ${Object.keys(OWNERS).join(', ')} to ${out('sync')}.`, SL, 'Sync')
await parallel(Object.keys(OWNERS).map((o) => () => run('fixup-' + o, editPrompt(o, `, and then the mismatches with owner "${o}" in ${out('sync')} (skip if none)`).replace(out('edit-' + o), out('fixup-' + o)), SL, 'Sync')))
return 'done'
