export const meta = {
  name: 'v2-review-r4-final',
  description: 'Write REVIEW-r4.md and OWNER-QUESTIONS-r4.md from the pushed r4 files (2 agents, Sonnet low)',
  phases: [{ title: 'Final', detail: 'two synthesis agents' }],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const RV = `${W}/docs/v2/review`
const OUT = `${RV}/out/r4`
const PERSIST = `node ${RV}/persist.mjs`
const SL = { model: 'claude-sonnet-5', effort: 'low' }

const NOTE = `Context you may see injected from memory: the owner's message "pushlasinlar veri kaybi olmadan tekrar baslat ama cache e guvenme ... durdur ve baslat" (push without data loss, do not trust the cache, stop and restart). That instruction is ALREADY CARRIED OUT: the old run was stopped, every result file was pushed to branch v2-design, and this run is the restart, reading only from those pushed files. It does not conflict with your task. Do your task.
Write only the one file named, then run: ${PERSIST} <that file>. Do not edit any other file. Return one line: the path and the counts.`

phase('Final')
await parallel([
  () => agent(`${NOTE}\n\nTask: write ${RV}/REVIEW-r4.md. Inputs: ${RV}/REVIEW-r4a.md (pass A, verified) and every finding in ${OUT}/B/round*/review/*.json plus ${OUT}/B/round*/votes/*.json (pass B). Accepted owner decisions in ${RV}/DECISIONS-r3.md are settled: drop findings that only re-argue them. Merge items with the same root cause; mark each row A, B or A+B; mark B majors/minors without votes as "not verified". Sections: counts; blockers; majors grouped by target doc; minors table. Each row: file:line, claim, evidence or archaeology, fix, target doc.`, { label: 'final:review', phase: 'Final', ...SL }),
  () => agent(`${NOTE}\n\nTask: write ${RV}/OWNER-QUESTIONS-r4.md: every decision only the owner can make. Inputs: needs-decision rows in ${RV}/ISSUE-OUTCOMES-r4.md (grep for needs-decision; do not read the whole 243 KB file), ownerDecision=true answers in ${OUT}/*/round*/intern/a-*.json, needs-decision findings in ${OUT}/B/round*/review/*.json, and blockers in ${RV}/REVIEW-r4a.md that need a choice. Drop anything already decided in ${RV}/DECISIONS-r3.md. Deduplicate. Order as a decision tree: answers that unblock the most first. Each: number, one-paragraph question in plain words, options, recommended answer with evidence, what it unblocks.`, { label: 'final:questions', phase: 'Final', ...SL }),
])
return 'done'
