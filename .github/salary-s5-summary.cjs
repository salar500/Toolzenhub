// TEMPORARY (branch salary-s5-verify only; never merge to main). Writes the results of the Salary S5 verification run as
// workflow annotations, so they can be read without downloading artifacts. Read-only: it only reads the logs and reports the
// earlier steps wrote.
const fs = require("fs");
const path = require("path");

const LOGS = "verify-logs";
const steps = JSON.parse(process.env.STEPS_JSON || "{}");

const esc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const note = (title, lines, level = "notice") => console.log(`::${level} title=${esc(title)}::${esc(lines.join("\n")).slice(0, 12000)}`);
const read = (name) => (fs.existsSync(path.join(LOGS, name)) ? fs.readFileSync(path.join(LOGS, name), "utf8") : null);
const strip = (s) => String(s || "").replace(/\u001b\[[0-9;]*m/g, "");

const outcome = (id) => (steps[id] ? steps[id].outcome : "not-run");

/* 1. step outcomes */
const ids = Object.keys(steps);
note("S5 step outcomes", ids.map((id) => `${id}: ${steps[id].outcome}`));

/* 2. text logs: the tail of anything that did not succeed */
for (const id of ids) {
  if (steps[id].outcome === "success" || steps[id].outcome === "skipped") continue;
  const text = read(`${id}.txt`);
  if (text) note(`S5 ${id}: ${steps[id].outcome} (log tail)`, strip(text).trim().split("\n").slice(-40), "error");
}

/* 3. node:test (TAP) totals and failing tests, per group */
for (const id of ids.filter((x) => x.startsWith("unit-"))) {
  const text = read(`${id}.txt`);
  if (!text) continue;
  const total = {};
  for (const m of text.matchAll(/^# (tests|pass|fail|skipped|cancelled) (\d+)/gm)) total[m[1]] = Number(m[2]);
  const failed = [...text.matchAll(/^\s*not ok \d+ - (.+)$/gm)].map((m) => m[1].slice(0, 160));
  note(`S5 ${id}`, [`tests ${total.tests ?? "?"}, pass ${total.pass ?? "?"}, fail ${total.fail ?? "?"}, skipped ${total.skipped ?? 0}`, ...failed.map((f) => `not ok: ${f}`)], failed.length ? "warning" : "notice");
}

/* 4. Playwright JSON reports */
function walk(suite, file, out) {
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const last = (t.results || [])[t.results.length - 1] || {};
      out.push({
        file: spec.file || file,
        title: spec.title,
        project: t.projectName,
        status: t.status,
        message: strip(last.error && last.error.message).split("\n").slice(0, 14).join("\n").slice(0, 900)
      });
    }
  }
  for (const child of suite.suites || []) walk(child, suite.file || file, out);
}

for (const name of fs.existsSync(LOGS) ? fs.readdirSync(LOGS).filter((n) => /^results-.*\.json$/.test(n)) : []) {
  const data = JSON.parse(fs.readFileSync(path.join(LOGS, name), "utf8"));
  const all = [];
  for (const suite of data.suites || []) walk(suite, suite.file, all);
  const by = {};
  for (const r of all) {
    by[r.project] = by[r.project] || { expected: 0, unexpected: 0, skipped: 0, flaky: 0 };
    by[r.project][r.status] = (by[r.project][r.status] || 0) + 1;
  }
  const lines = Object.entries(by).map(([p, c]) => `${p}: passed ${c.expected}, failed ${c.unexpected}, skipped ${c.skipped}, flaky ${c.flaky}`);
  const failures = all.filter((r) => r.status === "unexpected");
  note(`S5 browser ${name}`, [`total ${all.length}`, ...lines], failures.length ? "warning" : "notice");
  for (const f of failures.slice(0, 9)) {
    note(`FAIL [${f.project}] ${f.title}`.slice(0, 120), [path.basename(String(f.file)), f.message], "error");
  }
  if (failures.length > 9) note(`S5 browser ${name}: more failures`, failures.slice(9).map((f) => `[${f.project}] ${f.title}`), "error");
}
