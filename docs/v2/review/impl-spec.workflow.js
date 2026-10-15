export const meta = {
  name: 'v2-impl-spec',
  description: 'Line-by-line implementation spec for v2: architect writes the file tree and module contracts, one writer per module, cross-module check, fix-up, then ADR-0018 + PRD/README pointers',
  phases: [
    { title: 'Architect', detail: 'file tree, module graph, shared types and constants' },
    { title: 'Modules', detail: 'one writer per module, parallel' },
    { title: 'Check', detail: 'interfaces + every ADR decision mapped to a file' },
    { title: 'Fix', detail: 'only flagged modules' },
    { title: 'Index', detail: 'ADR-0018, PRD and README pointers' },
  ],
}

const W = '/Users/mksglu/.claude/claude-worktree-workspaces/oss-new'
const IMPL = `${W}/docs/v2/impl`
const V1 = '/private/tmp/claude-501/-Users-mksglu--claude-claude-worktree-workspaces-oss-new/59782ff8-a47e-4c71-b562-cf84e79dcf7d/scratchpad/cm-main'
const SL = { model: 'claude-sonnet-5', effort: 'low' }
const JUDGE = { model: 'claude-opus-5-5', effort: 'low' }

const BASE = `You are writing the implementation specification for context-mode v2. The design is final and accepted; your job is to turn it into exact, unambiguous instructions so an implementing agent can write the code without making design choices.
Sources of truth (read what your task needs): ${W}/PRD-v2.md, ${W}/docs/v2/TECH-SPEC.md, ${W}/docs/v2/README.md, ${W}/docs/v2/adr/0001-0017, ${W}/docs/v2/review/DECISIONS-r3.md, ${W}/docs/v2/review/DECISIONS-r4.md, ${W}/docs/v2/prompt/drafts.md (prompt texts), ${W}/tickets/spikes-r5/*.md (measured values), ${W}/e2e/live/run.mjs. v1 code for reference only (what to keep or avoid, with commit evidence): ${V1}.
Rules for the spec:
- Every file has its exact path, its exports with full TypeScript signatures, and for every function: inputs, outputs, steps in numbered pseudocode, error cases with the exact error text, and the constants it uses (by name from the constants file).
- No "TBD", no "e.g.", no "could", no options. When the sources leave something open, pick the option the ADRs imply, write it, and list it under "Assumptions" at the end of your file with the reason.
- Every rule cites its source (ADR-nnnn, Qn, Dn, issue #n). Every function names the E2E case that proves it (GPn row or live case id) and its ADR-0017 \`covers\` path.
- Plain English, short sentences, tables where they help. Markdown only.
- Write only the files your task names. Do not commit, push or run any persist script; the caller pushes. Return one line: the files you wrote and their line counts.`

phase('Architect')
await agent(`${BASE}\n\nTask: write ${IMPL}/00-architecture.md, the contract every module writer follows. Content:
1. The full source tree of v2 (every file under src/, build/, e2e/, .github/workflows/, release-branch layout), one line each with its purpose and owning module id.
2. Module list with ids exactly: contracts, store, sandbox, tools-exec, tools-index, tools-session, tools-ops, enforcement, hooks, adapters, server, plugins, build-release, tests, v1-transition. For each: the files it owns, what it may import (dependency graph, no cycles), what it exports.
3. The shared types (canonical hook event, decision, tool call/result, journal event row, ProjectContext, AgentId) and every named constant with its value and source (OUTPUT_CAP=16384, EXEC_TIMEOUT_MS=600000, NODE_MIN=24.15.0, DB timeout 5000, state block 2048, description cap 1024, hook budgets, etc.).
4. The cross-module interfaces: every function one module calls on another, with signature.
5. Runtime flows step by step: MCP server start; a tool call; a hook call per canonical event; compaction and resume; install, upgrade and uninstall; release.
Also write ${IMPL}/README.md: index of the impl docs (00 + one file per module, named NN-<module-id>.md, NN from 01 in the module order above) and how an implementer uses them (read 00, then the module file, implement in the TECH-SPEC milestone order, run the named E2E case after each step).`, { label: 'architect', phase: 'Architect', ...JUDGE })

const MODULES = [
  ['contracts', 'shared types, constants, error texts, the canonical hook schema (ADR-0001)'],
  ['store', 'context.db schema (tables events, sources, chunks FTS5, meta) as exact SQL, indexes, PRAGMAs, migrations via user_version, write rules BEGIN IMMEDIATE, checkpoint on close, retention, corruption, owners/*.pid (ADR-0002, Q6, Q7)'],
  ['sandbox', 'spawn, env, PATH lookup, languages, Windows Git Bash resolution, timeout 600000 default/max, background mode, process-group and Job Object kill, exit-code rules (PRD §8, Q8, Q9, S-TIMEOUT)'],
  ['tools-exec', 'ctx_execute and ctx_batch: schemas, descriptions from drafts.md, file/intent handling, OUTPUT_CAP, BM25 chunk selection, summary line, errors (ADR-0016, Q2, Q19)'],
  ['tools-index', 'ctx_index (path, content, url with proxy + per-hop SSRF check, .gitignore rules, chunking) and ctx_search (scopes worktree/project/session, ranking, paging, query-field rejection) (ADR-0002, Q19, PRD §7)'],
  ['tools-session', 'ctx_resume (budgeted greedy state block, ADR-0009 scoring and pins), ctx_stats (saved-bytes formula, table output), ctx_purge (scopes)'],
  ['tools-ops', 'ctx_doctor (every check row, output table, fix actions incl. corruption rename) and ctx_upgrade (update per agent, v1 detection and removal table, uninstall mode, kept user entries) (ADR-0010, ADR-0011, Q16)'],
  ['enforcement', 'shell lexer state machine and recursive-descent parser grammar, wrapper unwrapping, the v1-scope rule table (WebFetch, curl/wget with #166 checks, inline HTTP, build tools, large Read, external mcp__ output), user permissions.deny incl. ctx tool input, parse-error rule, deny reason texts with the rewritten command, subagent cases A/B/C per agent (ADR-0008, ADR-0016, Q1, Q3, Q4, Q5)'],
  ['hooks', 'hook entry, decode -> policy -> journal -> encode per canonical event, journal rows, hint cadence, budgets GS6, compaction trigger paths per agent (ADR-0001, ADR-0009 delivery table)'],
  ['adapters', 'adapters/table.ts with one row per agent (10 rows): install mode, project source (Q11), event-name map, tool-name map and prefix, hook config format, matcher, timeout key; decode/encode for each agent with exact native field names'],
  ['server', 'MCP server: protocol 2026-07-28 and 2025-06-18/2025-11-25 initialize, server/discover, instructions bytes, tools/list with alwaysLoad on ctx_execute, client identity, ProjectContext resolution, lifecycle (stdin EOF, parent death), progress and cancel (ADR-0006, ADR-0007)'],
  ['plugins', 'Pi extension and OpenCode 2 plugin: in-process glue, events, cache-stable delivery once after compaction (Q12), session id from the plugin API'],
  ['build-release', 'esbuild config (static imports), manifest generation from adapters/table.ts for every host file, release branch layout, release.yml jobs, smoke install, rollback, branch protection, the /release skill steps, user skills /ctx-stats /ctx-doctor /ctx-upgrade (ADR-0002, ADR-0011, ADR-0013, ADR-0015)'],
  ['tests', 'e2e harness files, GP1-GP11 case files with inputs and golden outputs, normalize rules, KEEP-PASS v1 runner (list from TEST-TRIAGE-r2), CI matrix 3 OS x Node 24.15.0 + current, live harness case format with covers, step mode (ADR-0003, ADR-0012, ADR-0017)'],
  ['v1-transition', 'v1 retention R1-R8: the v1 patch line in doctor/stats, upgrade order, README Upgrading-from-v1 table, rollback commands per agent, v1-migration live cases (ADR-0011, ADR-0017)'],
]

phase('Modules')
await parallel(MODULES.map(([id, scope], i) => () => agent(`${BASE}\n\nTask: read ${IMPL}/00-architecture.md first and follow its file tree, types, constants and interfaces exactly (if you must deviate, keep the code consistent with 00 and list the deviation under "Assumptions"). Write ${IMPL}/${String(i + 1).padStart(2, '0')}-${id}.md, the line-by-line spec of module "${id}": ${scope}. Cover every file this module owns in 00, in implementation order.`, { label: id, phase: 'Modules', ...SL })))

phase('Check')
const check = await agent(`${BASE}\n\nTask: read-only review of ${IMPL}/*.md. Check: (1) every cross-module call matches the callee's exported signature; (2) every constant matches 00 and the sources; (3) every decision in the 17 ADRs and DECISIONS-r3/r4 maps to at least one file and function (list unmapped ones); (4) no TBD/options/vague words; (5) every function names an E2E case. Write {issues:[{module, file, problem, fix}]} with module from: ${MODULES.map((m) => m[0]).join(', ')}, architecture. Path: ${IMPL}/.check.json`, { label: 'check', phase: 'Check', schema: { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { module: { type: 'string' }, file: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } }, required: ['module', 'problem', 'fix'] } } }, required: ['issues'] }, ...SL })

const flagged = [...new Set(((check && check.issues) || []).map((x) => x.module))]
log(`check: ${(check && check.issues || []).length} issues in ${flagged.length} modules`)

phase('Fix')
await parallel(flagged.map((m) => () => {
  const idx = MODULES.findIndex((x) => x[0] === m)
  const file = m === 'architecture' ? `${IMPL}/00-architecture.md` : idx >= 0 ? `${IMPL}/${String(idx + 1).padStart(2, '0')}-${m}.md` : null
  if (!file) return null
  const items = check.issues.filter((x) => x.module === m)
  return agent(`${BASE}\n\nTask: fix these review issues in ${file} only (edit in place):\n${JSON.stringify(items, null, 1)}`, { label: 'fix-' + m, phase: 'Fix', ...SL })
}))

phase('Index')
await agent(`${BASE}\n\nTask: (1) write ${W}/docs/v2/adr/0018-implementation-architecture.md in the house ADR format (Status: Accepted 2026-10-15; Context; Decision = the module structure, dependency rules and constants from ${IMPL}/00-architecture.md, and the rule that implementers follow docs/v2/impl/ file by file; Consequences; Changes). (2) In ${W}/PRD-v2.md add one short section "Implementation specification" pointing to docs/v2/impl/README.md and ADR-0018. (3) In ${W}/docs/v2/README.md add ADR-0018 to the ADR map and docs/v2/impl/ to the doc map. (4) In ${W}/docs/v2/TECH-SPEC.md implementation plan, add for each step the impl file to follow. Edit only these four files.`, { label: 'index', phase: 'Index', ...SL })
return { flagged }
