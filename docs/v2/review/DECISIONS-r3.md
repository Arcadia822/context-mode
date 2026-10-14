# Owner decisions after review r3 (2026-10-14)

The owner accepted all 19 recommendations in `OWNER-QUESTIONS-r3.md` ("doğru, tamamı ok"). Each line below overrides older text in the PRD, the TECH-SPEC and the ADRs. Those files still have to be edited to match (see "Doc changes").

| # | Decision | Docs to change |
|---|---|---|
| Q1 | Large output from other MCP servers' tools (`mcp__<other>__*`) falls under v2 routing: ADR-0016 case C replaces it. Hints for those tools stay as PRD:103 says. Keeps v1 #529 (855e330d) | ADR-0008, ADR-0016, PRD §6, map-P0 #1231, GP3 |
| Q2 | One global output cap: **16,384 B**, a single constant in TECH-SPEC. It is not the 2 KB `ctx_resume` cap and not the 4,096 B doctor cap | TECH-SPEC, ADR-0016, ADR-0009, GP3, GP4 |
| Q3 | ADR-0016 case B uses deny + a reason that carries the rewritten command. `allow` + `updatedInput` is never used, because Claude Code ignores it for Bash (v1 4bc292fc) | ADR-0016, ADR-0008 |
| Q4 | Parse error: deny when a user deny rule could match the command; allow only for the curl/HTTP rule | ADR-0008, GP3 |
| Q5 | v1 scope stays in full: `permissions.deny` also checks ctx_execute / ctx_execute_file / ctx_batch_execute input; the parser unwraps sudo, env, time, nice, timeout, xargs, command, `bash -c` and `$( )`; the #166 silent and verbose curl checks stay (v1 routing.mjs:745-765) | ADR-0008, GP3 |
| Q6 | WAL checkpoint: the last server to close runs it, plus a checkpoint on close (v1 939c5ca8). GP8 gets a 4-writer case | ADR-0002, GP8 |
| Q7 | Retention: age + live owner PID (D6), plus a size cap (#962) | ADR-0002 |
| Q8 | `ctx_execute` has one fixed default timeout, kills the whole process tree (Windows: Job Object) and bounds the whole handler, batch included. The value is **measured**, not 120 s: v1 removed a fixed default in #406 because it killed long builds. Grep exit 1 is not an error and kill codes are not a soft fail (v1 ab5aad90, #1121) | TECH-SPEC, PRD E5, GP4 |
| Q9 | `background` mode stays. TECH-SPEC lists the v2 languages | TECH-SPEC, PRD §7 |
| Q10 | Minimum Node = the first version with `node:sqlite` and `timeout`, no flag; set by the S-NODE spike | ADR-0002, install docs, CI matrix |
| Q11 | One named project source per host (Codex, Copilot CLI, Remote-WSL) in ADR-0007; doctor reports a missing source; no fallback chain | ADR-0007, GP7 |
| Q12 | OpenCode and Pi: the post-compaction state is delivered once, through a channel that keeps the prompt cache stable | ADR-0009 §6 |
| Q13 | Hard size cap for tool descriptions (1,024 chars each, per ADR-0005 PR7), enforced by lint | ADR-0005, lint.mjs |
| Q14 | `main` is protected by GitHub branch protection (pushes blocked), not by convention | ADR-0011, ADR-0013 |
| Q15 | `tier2-e2e-smoke.yml` (needs an API key) is replaced by the keyless harness (ADR-0012) | ADR-0015, ADR-0012 |
| Q16 | Uninstall is in v2.0: it stops the server and removes the cache. It is a mode of `ctx_upgrade`, not a separate CLI | ADR-0010 |
| Q17 | "No regex" covers runtime code only. CI tools such as `lint.mjs` may use regex | ADR-0005, PRD principles |
| Q18 | Issue debug data: only secrets are stripped (tokens, `.env` values). Paths, logs, versions, transcript excerpts and the doctor report are required. This replaces ADR-0014's "no path text" rule (owner rule: maximum debug data) | ADR-0014, agent-issue-intake/ |
| Q19 | DeepSeek Harness adapter: no (D14). Proxy env: yes, with an SSRF check. Code echo removed, `summary` added. Plan mode: accept the host's prompt. `ctx_search` `query` field: rejected with `isError`. Read host permission profiles: Claude Code deny rules only. Hints in parallel batches and hint parity: same routing on every agent, not the same text. Hook CPU budget: per ADR-0008 "Open". ADR-0006 re-probe on Opus and Sonnet in the harness | ADR-0008, PRD §7, ADR-0006 |

## Doc changes still to do

The ADRs, the PRD and the TECH-SPEC have not been edited yet. Each row's "Docs to change" column lists the files. The next step is to apply them in one pass and re-run `lint.mjs`.
