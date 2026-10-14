// Push review output files to GitHub so nothing is lost when a run stops.
// Usage: node persist.mjs <file>...      push the given files
//        node persist.mjs --sweep <dir>  push every file under dir that is new or changed since its last push
// Uses the GitHub contents API (one commit per file, no local git index, safe for parallel callers).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const REPO = "mksglu/context-mode";
const BRANCH = "v2-design";
const ROOT = "/Users/mksglu/.claude/claude-worktree-workspaces/oss-new";
const TRIES = 6;

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const gh = (args, input) => execFileSync("gh", args, { input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });

function remoteSha(repoPath) {
  try { return JSON.parse(gh(["api", `repos/${REPO}/contents/${repoPath}?ref=${BRANCH}`])).sha; }
  catch { return undefined; }
}

function push(file) {
  const abs = path.resolve(file);
  if (!abs.startsWith(ROOT + "/")) throw new Error(`outside workspace: ${abs}`);
  const repoPath = abs.slice(ROOT.length + 1);
  const body = fs.readFileSync(abs);
  const digest = createHash("sha256").update(body).digest("hex");
  const marker = abs + ".pushed";
  if (fs.existsSync(marker) && fs.readFileSync(marker, "utf8") === digest) return "unchanged";
  for (let i = 1; i <= TRIES; i++) {
    const sha = remoteSha(repoPath);
    const req = { message: `review: ${repoPath}`, content: body.toString("base64"), branch: BRANCH, ...(sha ? { sha } : {}) };
    try {
      gh(["api", "-X", "PUT", `repos/${REPO}/contents/${repoPath}`, "--input", "-"], JSON.stringify(req));
      fs.writeFileSync(marker, digest);
      return "pushed";
    } catch (e) {
      if (i === TRIES) throw new Error(`push failed after ${TRIES} tries: ${repoPath}: ${String(e.stderr || e.message).split("\n")[0]}`);
      sleep(500 * i); // another writer moved the branch; read the new sha and try again
    }
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : d.name.endsWith(".pushed") ? [] : [p];
  });
}

const args = process.argv.slice(2);
const files = args[0] === "--sweep" ? (fs.existsSync(args[1]) ? walk(args[1]) : []) : args;
let failed = 0;
for (const f of files) {
  try { console.log(push(f), f); } catch (e) { failed++; console.error(String(e.message)); }
}
process.exit(failed ? 1 : 0);
