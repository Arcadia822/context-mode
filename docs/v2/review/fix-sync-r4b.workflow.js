export const meta = {
  name: 'v2-fix-sync-r4b',
  description: 'Finish fix-sync r4: the needs-decision issue shard that was not researched, the 7 Kiro findings, and the stale pending rows',
  phases: [{ title: 'Fix', detail: '2 agents, disjoint files' }, { title: 'Check', detail: 'one sync check' }],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const RV = `${W}/docs/v2/review`
const OUT = `${RV}/out/fix-r4`
const PERSIST = `node ${RV}/persist.mjs`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const SL = { model: 'claude-sonnet-5', effort: 'low' }

const BASE = `You are finishing a documentation review of context-mode v2. The repo owner has delegated the open design decisions in these docs to this review. Decide each one by this rule: keep the owner rules listed in ${RV}/DECISIONS-r3.md and ${W}/docs/v2/adr/0017-e2e-every-step-and-v1-retention.md; do not re-break a v1 fix (check with git log -S / --grep / -L / blame in ${V1} and quote the commit); prefer the simplest single path. Owner rules include: no API keys for any test; no fallback chains; large output never enters any subagent context.
After you write or edit a file, run: ${PERSIST} <file>. Return one line.`

phase('Fix')
await parallel([
  () => agent(`${BASE}\n\nTask: in ${RV}/ISSUE-OUTCOMES-r4.md take the rows whose verdict is needs-decision (grep -n). The rows already decided are in ${OUT}/res-issues-1.json and ${OUT}/res-issues-2.json: skip those row numbers. Decide every remaining row (closed-by-design with ADR | covered-by-test with GP case or KEEP-PASS test | wont-fix with reason). Write them to ${OUT}/res-issues-0.json as {groups:[{root_cause, rows, decision, evidence}]}. Then update ONLY these two files: the verdict column of those rows in ${RV}/ISSUE-OUTCOMES-r4.md, and a new section "Issue rows decided in fix-r4b" at the end of ${RV}/DECISIONS-r4.md. Do not edit any other file.`, { label: 'issues-shard-0', phase: 'Fix', ...SL }),
  () => agent(`${BASE}\n\nTask: the "Kiro" pending row in ${RV}/DECISIONS-r3.md lists seven open findings (native tool-name matcher, session-id fallback, KIRO_API_KEY vs the no-key rule, release channel, project-source default, stdout format, compaction/PreCompact gap); details in ${RV}/REVIEW-r4a.md item 9 and ${RV}/out/r4/*/round*/review/agent-kiro.json. Decide each one. For the key rule: Kiro's live case runs only through a locally logged-in kiro-cli, or is marked a documented gap; never a key. Edit ONLY these files to match: ${W}/docs/v2/TECH-SPEC.md (Kiro rows), ${W}/docs/v2/adr/0007-mcp-2026-07-28.md, ${W}/docs/v2/adr/0012-keyless-live-harness.md, and ${RV}/DECISIONS-r3.md (turn the Kiro pending row and the stale "Doc changes still to do" section into the decided state; also resolve the agent_id vs agent_type pending row against ${W}/docs/v2/adr/0016-subagent-context-protection.md, editing ADR-0016 only if needed).`, { label: 'kiro+pending', phase: 'Fix', ...SL }),
])

phase('Check')
await agent(`${BASE}\n\nTask: read-only check. Confirm that every decision in ${RV}/DECISIONS-r3.md and ${RV}/DECISIONS-r4.md appears in its target doc, that no row is still "pending", that the Kiro rows in TECH-SPEC, ADR-0007 and ADR-0012 agree, and run node ${W}/docs/v2/prompt/lint.mjs drafts ${W}/docs/v2/prompt/drafts.md. Write {mismatches:[{file, line, problem}], lint} to ${OUT}/sync-r4b.json and persist it.`, { label: 'check', phase: 'Check', ...SL })
return 'done'
