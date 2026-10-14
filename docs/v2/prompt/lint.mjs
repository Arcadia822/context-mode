// Prompt lint for ADR-0005. Usage: node lint.mjs drafts <drafts.md> | node lint.mjs files <file...>
import fs from "node:fs";
const RULES = {
  caps: /\b(MUST|NEVER|ALWAYS|CRITICAL|MANDATORY|IMPORTANT|REQUIRED|DO NOT|ONLY|ALL|ANY)\b/g, // PR1, case-sensitive
  doubt: /\b(if in doubt|when (in doubt|uncertain|unsure)|default to)\b/gi,                  // PR2
  tags: /<\/?[a-z_]+(?:\s[^>]*)?>/g,                                                           // PR5
  quoted: /"[^"\n]{2,60}"/g,
  prefixed: /\b(mcp__?|plugin_)[A-Za-z0-9_-]*ctx_|context[-_]mode__?ctx_/g,                        // PR12                                                                   // PR6
};
const count = (t, re) => (t.match(re) || []).length;
const row = (id, t) => ({ id, chars: t.length, caps: count(t, RULES.caps), doubt: count(t, RULES.doubt), tags: count(t, RULES.tags), quoted: count(t, RULES.quoted), prefixed: count(t, RULES.prefixed) });
const [mode, ...args] = process.argv.slice(2);
if (mode === "drafts") {
  const t = fs.readFileSync(args[0], "utf8"), o = {};
  for (const m of t.matchAll(/<!-- id: ([a-z_]+) -->\n```text\n([\s\S]*?)\n```/g)) o[m[1]] = m[2];
  const tools = Object.keys(o).filter((k) => k !== "instructions" && !k.startsWith("skill_"));
  const rows = Object.entries(o).map(([k, v]) => ({ ...row(k, v), unknownRefs: [...new Set(v.match(/ctx_[a-z_]+/g) || [])].filter((n) => !tools.includes(n)) }));
  const fail = rows.filter((r) => r.caps || r.doubt || r.tags || r.quoted > 2 || r.prefixed || r.unknownRefs.length
    || (r.id === "instructions" ? r.chars > 2048 : r.chars > 1024));
  console.log(JSON.stringify({ rows, toolDescChars: rows.filter((r) => tools.includes(r.id)).reduce((a, r) => a + r.chars, 0), fail: fail.map((r) => r.id) }, null, 1));
} else {
  const rows = args.map((f) => row(f, fs.readFileSync(f, "utf8")));
  const tot = rows.reduce((a, r) => ({ files: a.files + 1, chars: a.chars + r.chars, caps: a.caps + r.caps, doubt: a.doubt + r.doubt, tags: a.tags + r.tags }), { files: 0, chars: 0, caps: 0, doubt: 0, tags: 0 });
  for (const r of rows) console.log(`${r.id} | ${r.chars} | caps ${r.caps} | doubt ${r.doubt} | tags ${r.tags} | quoted ${r.quoted}`);
  console.log("TOTAL", JSON.stringify(tot));
}
