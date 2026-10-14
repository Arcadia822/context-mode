# Open issues/PRs that v2 does NOT close (rescan 2026-10-14)

Source: `gh issue/pr list --state open` on 2026-10-14 01:36 +03 (174 issues, 182 PRs), plus #1302 from the 01:59 all-state snapshot (open = 174 issues + 183 PRs = 357 = the frozen `open_issues_count`). Snapshots: `tickets/data/`. Issues and PRs were disabled after that, so the API returns nothing now, joined with map-I0..I3 / map-P0..P3 (351 mapped items; 1 of them is closed since). Categories come from those maps (agents read bodies + comments). G20–G23 approved 2026-10-14.

## 1. New since the map (7) — not yet classified
| # | Title | First read (body only) |
|---|---|---|
| I1301 | Opt-in retrieval-only mode, per-agent activation, scoped indexing (OpenCode) | new feature; not in PRD |
| P1300 | stats: skip unchanged session DBs in lifetime scan (fixes #1248) | v1 code; v2 single DB + D17 removes the scan → closes via design |
| P1299 | hooks: route quoted curl/wget stdout destinations | v2 hook routing must keep this as a contract test |
| P1298 | heal: anchor version filter (#1191) | start.mjs heal flow removed in v2 → closes via design |
| P1297 | install: --legacy-peer-deps (#1174) | no npm install in v2 → closes via design |
| P1302 | fix(codex): isolate project context for concurrent chats | title only (opened between 01:36 and 01:59 +03; body not read, PRs are now disabled). Topic = project identity per Codex chat → GP7 contract test |
| P1296 | server: wait for MCP handshake before platform storage (#1255, #1276) | v2 project source must be read after initialize → contract test |

## 2. Open design questions (Q, 16) — v2 must decide, or they stay open
Not referenced in PRD/README at all: **I1268** ZCode adapter (now resolved: ZCode is in v2), **I1258** DeepSeek Harness, **I914** ctx_index label scheme, **I874** OMP output replace (G20: OMP removed → close as won't-fix).
Mentioned in PRD but still without a decision: I1204 ctx_page/preview, I1184 Firecrawl fetch, I1079 source age cleanup, I1162 HTTP daemon mode, I1048 plan-mode read-only path, I1047 echo default, I1031 tool-description token budget, I993 Windows PowerShell hooks, I962 trigram growth bound, I944 Codex external-file settings, I901 upgrade/doctor two trees (v2 has no doctor → likely closes), I867 mid-session corruption self-heal.

## 3. Out of scope / later (C, 38) — v2 closes them only as won't-fix
- New adapters (D14): I919 CommandCode, I1258 DeepSeek, P1284 Qoder, P1044 Mistral Vibe, P1010 Hermes, P957 Devin.
- Removed agents: P1178 agy (G15.5), P877 OMP (G20), P1285 Cursor docs.
- Feature asks with no v2 decision: I1088/P1092 live progress, I1192 pi-blackhole, I891 Emacs Lisp, I1016 uninstall (no CLI in v2), P939 ctx_forget, P1076 tool allow-list, P1082 timeoutMs rename, P1041 fetch proxy, P1040/P1001 cost tracking, P1127 echo budgets, P1097 limit env, P1275 batch pointers, P922/P920 output format, P1050 Pi rendering.
- Promo / other repo: I1046, I1045, I1065, P1283.
- Covered by v2 decisions (close at v2): I1185, I1083, I1014, P1194, P1171, P1165, P968, P935, P1287.

## 4. Closed by v2 without new work
- A (127) removed by design, B (124) rebuilt as contract tests, M (33) merge candidates → v2 contract tests (no v1 line), D (13) duplicates → close with their primary.

## Summary
Not closed by v2 as planned: **6 new + ~12 Q without a decision + ~20 C feature asks**. Of those, the v2 list must decide: I1048, I1047, I1031, I993, I962, I944, I867, I1204, I914, I1301.
