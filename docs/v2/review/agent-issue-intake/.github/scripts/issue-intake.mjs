// Checks a new or edited issue body against .github/AGENT_ISSUE.md.
// Structure only: headings by line prefix, the ctx-report block by key/value lines,
// the digest by recomputing sha256. No regex anywhere (owner rule).
// Usage: node issue-intake.mjs <body-file>   -> prints JSON {ok, missing[], reportStatus}
import { createHash } from "node:crypto";
import fs from "node:fs";

export const SECTIONS = ["Report status", "Report", "Node", "Filed by", "What happened", "Expected", "Steps to reproduce", "Checks"];
export const NO_REASONS = [
  "no: ctx_doctor is not in the tool list",
  "no: the context-mode MCP server is failed or not connected",
  "no: ctx_doctor returned an error",
];
const MAX_REPORT = 4096;
const HEX = "0123456789abcdef";

export function sections(body) {
  const out = new Map();
  let cur = null;
  for (const raw of body.split("\n")) {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (line.startsWith("### ")) { cur = line.slice(4).trim(); out.set(cur, []); continue; }
    if (cur !== null) out.get(cur).push(line);
  }
  for (const [k, v] of out) out.set(k, v.join("\n").trim());
  return out;
}

// The block may arrive fenced (```ctx-report or ```text from the web form) or bare.
export function reportLines(text) {
  const lines = text.split("\n").map((l) => (l.endsWith("\r") ? l.slice(0, -1) : l));
  const start = lines.indexOf("ctx-report: 1");
  if (start < 0) return null;
  let end = -1;
  for (let i = start; i < lines.length; i++) if (lines[i].startsWith("digest: ")) { end = i; break; }
  if (end < 0) return null;
  return lines.slice(start, end + 1);
}

export function checkReport(lines) {
  const problems = [];
  const body = lines.slice(0, -1).join("\n") + "\n"; // digest covers every line before it, LF-joined, final LF
  if (Buffer.byteLength(body + lines.at(-1) + "\n") > MAX_REPORT) problems.push(`report is over ${MAX_REPORT} bytes`);
  const keys = new Set();
  for (const l of lines) {
    const i = l.indexOf(": ");
    if (i <= 0) { problems.push(`report line is not "key: value": line ${lines.indexOf(l) + 1}`); continue; }
    keys.add(l.slice(0, i));
  }
  for (const k of ["version", "commit", "agent", "install", "os", "node", "mcp", "enforcement", "config", "deny_7d"]) {
    if (!keys.has(k)) problems.push(`report row "${k}" is missing`);
  }
  const digest = lines.at(-1).slice("digest: ".length).trim();
  const okHex = digest.length === 64 && [...digest].every((c) => HEX.includes(c));
  if (!okHex) problems.push("digest is not 64 lowercase hex characters");
  else if (createHash("sha256").update(body).digest("hex") !== digest) problems.push("digest does not match: the block was edited or cut; paste it again unchanged");
  return problems;
}

export function check(body) {
  const missing = [];
  const s = sections(body);
  for (const name of SECTIONS) {
    const v = s.get(name);
    if (v === undefined) missing.push(`section "### ${name}" is missing`);
    else if (v === "" || v === "_No response_") {
      if (name !== "Report") missing.push(`section "### ${name}" is empty`);
    }
  }
  const status = (s.get("Report status") ?? "").split("\n")[0].trim();
  let reportStatus = "invalid";
  if (status.startsWith("Yes") || status === "yes") {
    reportStatus = "yes";
    const lines = reportLines(s.get("Report") ?? "");
    if (!lines) missing.push('section "### Report" has no block from "ctx-report: 1" to "digest:"');
    else missing.push(...checkReport(lines));
  } else if (NO_REASONS.some((r) => status.startsWith(r))) {
    reportStatus = "no";
  } else if (s.has("Report status")) {
    missing.push(`"Report status" must be "yes" or one of: ${NO_REASONS.join(" | ")}`);
  }
  const node = (s.get("Node") ?? "").split("\n")[0].trim();
  if (s.has("Node") && !(node.startsWith("v") && node.slice(1).split(".").length === 3)) missing.push('"Node" must be the output of node --version, for example v24.11.0');
  const checks = s.get("Checks") ?? "";
  if (s.has("Checks") && checks.split("\n").filter((l) => l.trim().startsWith("- [x]") || l.trim().startsWith("- [X]")).length < 4) {
    missing.push('all 4 boxes under "### Checks" must be ticked');
  }
  return { ok: missing.length === 0, missing, reportStatus };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(check(fs.readFileSync(process.argv[2], "utf8"))));
}
