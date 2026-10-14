import readline from "node:readline"; import fs from "node:fs"; import { spawnSync } from "node:child_process";
const instr = fs.readFileSync(process.env.INSTR_FILE, "utf8"), D = JSON.parse(fs.readFileSync("/tmp/gplive2/tools.json", "utf8"));
const PROJ = process.env.PROJ, CELL = process.env.CELL, ALWAYS = process.env.ALWAYS_LOAD === "1";
const str = { type: "string" }, arr = { type: "array", items: { type: "string" } };
const S = { ctx_execute: { type: "object", properties: { language: { type: "string", enum: ["shell", "javascript", "python"] }, code: str, file: str, intent: str, timeoutMs: { type: "number" } }, required: ["language", "code"] },
  ctx_batch: { type: "object", properties: { commands: arr, queries: arr }, required: ["commands", "queries"] },
  ctx_index: { type: "object", properties: { path: str, content: str, url: str, source: str } },
  ctx_search: { type: "object", properties: { queries: arr, scope: { type: "string", enum: ["session", "worktree", "project"] } }, required: ["queries"] },
  ctx_resume: { type: "object", properties: {} }, ctx_stats: { type: "object", properties: {} },
  ctx_purge: { type: "object", properties: { target: str }, required: ["target"] } };
const cap = (s) => s.length > 4000 ? s.slice(0, 4000) + `\n[truncated: ${s.length} chars]` : (s || "(no output)");
const run = (lang, code, file) => { const env = { ...process.env, ...(file ? { CTX_FILE: file } : {}) };
  const [cmd, args] = lang === "javascript" ? [process.execPath, ["-e", code]] : lang === "python" ? ["python3", ["-c", code]] : ["sh", ["-c", code]];
  const r = spawnSync(cmd, args, { cwd: PROJ, env, encoding: "utf8", timeout: 60000, maxBuffer: 1 << 26 });
  return cap((r.stdout || "") + (r.stderr ? "\n[stderr]\n" + r.stderr : "")); };
const send = (m) => process.stdout.write(JSON.stringify(m) + "\n");
readline.createInterface({ input: process.stdin }).on("line", (l) => { let m; try { m = JSON.parse(l) } catch { return }
  if (m.id === undefined) return;
  if (m.method === "initialize") return send({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params?.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "context-mode", version: "2.0.0-test" }, instructions: instr } });
  if (m.method === "tools/list") return send({ jsonrpc: "2.0", id: m.id, result: { tools: Object.keys(S).map((n) => ({ name: n, description: D[n], inputSchema: S[n], ...(ALWAYS && n === "ctx_execute" ? { _meta: { "anthropic/alwaysLoad": true } } : {}) })) } });
  if (m.method === "tools/call") { const a = m.params?.arguments || {}, n = m.params?.name; fs.appendFileSync(`/tmp/gplive2/calls-${CELL}.txt`, n + "\n");
    let text = "(stub) done";
    if (n === "ctx_execute") text = run(a.language, a.code || "", a.file);
    if (n === "ctx_batch") text = cap((a.commands || []).map((c) => `$ ${c}\n` + run("shell", c)).join("\n"));
    return send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text }] } }); }
  if (m.method === "ping") return send({ jsonrpc: "2.0", id: m.id, result: {} });
  send({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "not found" } }); });
