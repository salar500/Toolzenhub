/**
 * UI/UX Design System 2.0, QA-08: the presentation redesign must not change tool logic.
 *
 * Lists every JavaScript file under assets/js changed since a base commit (default 0c2ffe9, the commit before
 * Design System 2.0 started) that is NOT on the presentation allow-list. The exit code is 1 when there are any,
 * so each one has to be reviewed and, if it is a legitimate markup/class change, named in the ledger
 * (docs/ecosystem-review/ui-ux-design-system/21-DEVELOPMENT-LEDGER.md) and added with --allow.
 *
 * usage: node scripts/ui-protected-paths.mjs [baseCommit] [--allow path ...]
 */
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const allowExtra = [];
let base = "0c2ffe9";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--allow") allowExtra.push(args[++i]);
  else base = args[i];
}

// Presentation modules: shared chrome, page modules, UI helpers, the catalog metadata file.
const ALLOW = [/^assets\/js\/components\//, /^assets\/js\/pages\//, /^assets\/js\/ui\//, /^assets\/js\/entries\//, /^assets\/js\/data\/tools\.js$/, /^assets\/js\/utils\/(categories-)?search\.js$/];

const out = execFileSync("git", ["diff", "--name-only", base, "--", "assets/js"], { encoding: "utf8" }) +
  execFileSync("git", ["ls-files", "--others", "--exclude-standard", "assets/js"], { encoding: "utf8" });
const changed = [...new Set(out.split("\n").map((s) => s.trim()).filter(Boolean))];
const flagged = changed.filter((f) => !ALLOW.some((re) => re.test(f)) && !allowExtra.includes(f));

console.log(`changed JS files since ${base}: ${changed.length}; outside the presentation allow-list: ${flagged.length}`);
for (const f of flagged) console.log(`  REVIEW ${f}`);
process.exit(flagged.length ? 1 : 0);
