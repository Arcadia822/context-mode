// Applies the intake result: label + one comment, close when invalid, reopen when fixed.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const r = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const { N, STATE, GITHUB_REPOSITORY: repo } = process.env;
const gh = (...a) => execFileSync("gh", [...a, "-R", repo], { stdio: "inherit" });
const MARK = "<!-- issue-intake -->";

if (r.ok) {
  gh("issue", "edit", N, "--remove-label", "needs-report", "--add-label", r.reportStatus === "yes" ? "has-report" : "no-report");
  if (STATE === "closed") gh("issue", "reopen", N);
  process.exit(0);
}
const text = [
  MARK,
  "This issue does not match the intake format, so it is closed until it does.",
  "",
  "Missing or wrong:",
  ...r.missing.map((m) => `- ${m}`),
  "",
  "Agent: read https://github.com/mksglu/context-mode/blob/main/.github/AGENT_ISSUE.md, call the ctx_doctor tool with {\"report\":\"issue\"},",
  "then fix the body with `gh issue edit " + N + " -R " + repo + " --body-file <file>`. The issue reopens when the body passes.",
].join("\n");
gh("issue", "edit", N, "--add-label", "needs-report");
gh("issue", "comment", N, "--body", text);
if (STATE !== "closed") gh("issue", "close", N, "--reason", "not planned");
