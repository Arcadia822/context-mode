# PR map P3 → v2 plan

Note: "ext" means external contributor. CI "-" means no checks ran (fork PR).

| # | title (short) | author / CI | class | D# / requirement | contract test or reason |
|---|---|---|---|---|---|
| 972 | test: no hardcoded /bin/bash | xav-ie ext / - | M | test portability (NixOS) | test-only, safe |
| 971 | codex: omit empty hook context | agolanov ext / - | D | dup of #910 | close in favor of #910 |
| 970 | sessions/ 14-day retention | hakanbaysal ext / - | B | D6 | Given closed session DB older than 14d and owner PID dead, When cleanup runs, Then deleted; alive PID → kept. Test partly reusable |
| 969 | re-create fs-preload temp file | hakanbaysal ext / - | B | executor must not rely on long-lived temp files | Given preload file deleted by OS, When batch runs, Then it still works. Test reusable |
| 968 | default exec timeout env | hakanbaysal ext / - | C (v2.0) | exec needs a default server timeout (P1: one path, not opt-in env) | Given exec without timeout, When it hangs, Then killed at default limit |
| 963 | bound FTS hydration for big rows | Tomodad ext / SUCCESS | B (+M) | search must clip before highlight() | Given 50 MiB chunk, When ctx_search, Then reply < N ms and bounded bytes. Test reusable |
| 958 | extract cache-heal script | xav-ie ext / - | A | D2 (heal scripts removed) | close at v2 |
| 957 | Devin CLI adapter | alexnimo ext / - | C (later) | D14: new adapters are separate scope | needs decision |
| 955 | codex Windows guidance overlay | TyceHerrman ext / SUCCESS | A | D11 (no AGENTS.md routing docs) | close at v2 |
| 952 | stats: count only real savings | felipetruman ext / - | B | D17 stats data | Given captured (not redirected) bytes, When ctx_stats, Then not counted as saved |
| 948 | codex AGENTS.md JS default | TyceHerrman ext / SUCCESS | A | D11 | close at v2 |
| 945 | WebFetch allow claude.ai artifacts | tongliuTL ext / - | A (+M) | D10 (no hard denies) | v1 fix worth merging; v2 removes deny |
| 939 | ctx_forget tool | KoscheiiB ext / - | C | tool set consolidation (not discussed) | needs decision |
| 935 | opencode /ctx TUI command | bulutmuf ext / - | C (later) | D17 trims stats UI | defer/reject |
| 934 | batch NODE_OPTIONS as statement | hakanbaysal ext / - | B (+M) | compound shell cmds must run | Given cmd starting with `if`/`(`/`{`, When batch runs, Then no syntax error. Test reusable |
| 932 | runPool capped flag | hakanbaysal ext / - | M | small correctness | Given jobs < concurrency, Then capped=false |
| 931 | statusline import failure msg | ousamabenyounes ext / SUCCESS | A | D17 statusline removed | close at v2 |
| 930 | marketing skill REST query | ousamabenyounes ext / SUCCESS | M | ops docs only | safe |
| 929 | packaging guard helper scripts | ousamabenyounes ext / SUCCESS | A | D2 (postinstall/heal removed) | close at v2 |
| 928 | avoid gh projectCards query | ousamabenyounes ext / SUCCESS | M | skill docs + server text | small |
| 927 | WebFetch deny → advisory | dohgren78 ext / - | A | D10 already decides this | close at v2 (or merge as v1 bridge) |
| 924 | restore CWD in start.mjs | mattst88 ext / - | B (+M) | server must not change user CWD | Given server starts, Then process.cwd() == launch cwd. Test reusable |
| 922 | trim batch footer | uwuclxdy ext / - | C (v2.0) | output format of tools | fold into tool redesign |
| 921 | dedupe chunks across queries | uwuclxdy ext / - | B | D12 search | Given chunk matching 2 queries, When ctx_search, Then printed once. Test reusable |
| 920 | throttle message numbers | uwuclxdy ext / - | C (v2.0) | throttle design not discussed | fold into tool redesign |
| 918 | routing block injection framing | YuryKoltashevModdelix ext / - | A (+M) | D11 block removed | v1: merge (auto-mode classifier blocks users) |
| 913 | standalone mcp__context-mode__ prefix | eejd ext / SUCCESS | B | P3/D4: tool names from one source | Given standalone install, When hook names tools, Then mcp__context-mode__* |
| 910 | codex omit empty additionalContext | pradigmaz ext / SUCCESS | B (+M) | adapters never emit empty fields | Given no-op hook, Then output has no additionalContext. Test reusable |
| 907 | SessionStart surrogate-safe truncation | NgoQuocViet2001 ext / SUCCESS | B (+M) | D9 hint truncation must be UTF-16 safe | Given emoji at cut point, Then no lone surrogate. Test reusable |
| 906 | codex config pin platform env | NgoQuocViet2001 ext / SUCCESS | B | D4 fixed source per adapter | Given codex config, Then CONTEXT_MODE_PLATFORM=codex |
| 904 | Pi abort signal propagation | xz-dev ext / - | B | tools must cancel on abort | Given AbortSignal fired, When exec runs, Then child killed. Test reusable |
| 899 | no false shell error capture | omrimel-cov ext / - | B | D8 journal extraction | Given Bash success with "Error" text, Then no error event |
| 898 | cap oversized markdown chunks | ken-jo ext / SUCCESS | B (+M) | store chunk size cap | Given 1 huge line, When index, Then chunks <= cap. Test reusable |
| 897 | Claude Code PowerShell hooks (Win) | aribaskagan ext / - | B | P3: hook matcher covers PowerShell | Given PowerShell tool on Windows, Then Pre/PostToolUse fire |
| 892 | README typo | yairEO ext / - | M | touches stats.json too | merge only README hunk |
| 888 | MCP singleton concurrency | jashwanth-reddy-g ext / - | D | empty body, stray stats.json | stale; v2 D3 per-session writers |
| 884 | docs sync adapters v1.0.167 | ken-jo ext / SUCCESS | A | D16 docs rewrite | close at v2 |
| 877 | OMP replace large results w/ refs | ken-jo ext / SUCCESS | C (v2.0) | P2: same output trimming on all agents | needs decision |
| 876 | OMP seed APPEND_SYSTEM.md | NgoQuocViet2001 ext / SUCCESS | A | D11 (install never writes prompt files) | close at v2 |
| 871 | withRetry heal on SQLITE_CORRUPT | ousamabenyounes ext / SUCCESS | A | D2/D3/P1 (no heal, no fallback) | close at v2 |
| 866 | honor CLAUDE_CONFIG_DIR in stats | halindrome ext / SUCCESS | A | D3 shared root | close at v2; maintainer asked retarget to next |
| 864 | Pi hidden context injection | RamJam824 ext / FAILURE | B | D9/D11 hint must not render as user msg | Given Pi SessionStart, Then hint is custom hidden msg. CI red |
| 863 | Windows better-sqlite3 install via node | ken-jo ext / SUCCESS | A | D2 | close at v2 |

## Merge-now candidates (v1.x)
918, 910 (close 971), 907, 963, 898, 934, 924, 945, 932, 972, 928, 930, 892 (README hunk only).

## New decisions needed
- New adapters (Devin #957) in v2.0 or later? (D14 says separate scope)
- ctx_forget (#939): add to v2 tool set?
- Output trimming of large tool results on all agents (#877) under P2?
- Default exec timeout value (#968)
- Tool output format: batch footer, throttle (#920, #922) — part of tool consolidation
- 1.x policy: D1 says security fixes only, but many crash/UX fixes are ready.

## Contradictions with v2-decisions.md
- D1 "1.x security only" vs ~12 safe non-security fixes ready now.
- #968 adds opt-in env knob; P1 favours one fixed default.
- #866/#906 rely on agent config dirs / env; D3/D4 move storage to one root and one source.
