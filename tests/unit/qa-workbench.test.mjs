/*
 * QA Requirement-to-Release Workbench (docs/tool-packs/59-qa-workbench.md): records and ids, the calculations,
 * the project file, the report and CSV, and the AI payloads. The golden figures of the "checkout" project were
 * worked out by hand from the records below before the code was run (rulebook 8.2); each is explained beside it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window ??= { location: { hostname: "toolzenhub.in", pathname: "/" } };

const model = await import("../../assets/js/tools/qa-workbench/model.js");
const { metrics, latestRuns, criterionResult, buildsOf } = await import("../../assets/js/tools/qa-workbench/metrics.js");
const { projectFile, readProject, validateProject, neutral, projectFileName } = await import("../../assets/js/tools/qa-workbench/project-file.js");
const { buildReport, csvCell, csv, csvFiles } = await import("../../assets/js/tools/qa-workbench/report.js");
const ai = await import("../../assets/js/tools/qa-workbench/ai.js");
const { readMeta } = await import("../../assets/js/tools/ai-tools/common/pack-format.js");
const { extractRequirements } = await import("../../assets/js/tools/ai-tools/common/review-engine.js");

const NOW = "2026-11-17T09:00";
const ok = (result) => {
  assert.ok(!result.errors, JSON.stringify(result.errors));
  return result.id;
};
const step = (action, expected = "") => ({ action, expected });

/* The checkout project. REQ-003 has no criteria; AC-003 needs clarification, AC-005 is excluded;
   TC-005 maps to AC-002 and AC-007 and is then retired; TC-004 maps to nothing. */
function checkout() {
  const { project: p } = model.createProject({ name: "Checkout", feature: "Web shop checkout", build: "1.1" }, NOW);
  ok(model.addRequirement(p, { title: "Coupon codes", priority: "high" }, NOW)); // REQ-001
  ok(model.addRequirement(p, { title: "Card payment" }, NOW)); // REQ-002
  ok(model.addRequirement(p, { title: "Refunds" }, NOW)); // REQ-003
  ok(model.addCriterion(p, "REQ-001", { text: "A valid code reduces the total" }, NOW)); // AC-001
  ok(model.addCriterion(p, "REQ-001", { text: "An expired code is refused with a message" }, NOW)); // AC-002
  ok(model.addCriterion(p, "REQ-001", { text: "Stacking rules", status: "clarify" }, NOW)); // AC-003
  ok(model.addCriterion(p, "REQ-002", { text: "A declined card shows the bank's reason" }, NOW)); // AC-004
  ok(model.addCriterion(p, "REQ-002", { text: "Wallet payments", status: "excluded", reason: "next release" }, NOW)); // AC-005
  ok(model.addCriterion(p, "REQ-002", { text: "3-D Secure challenge completes" }, NOW)); // AC-006
  ok(model.addCriterion(p, "REQ-001", { text: "Code is case-insensitive" }, NOW)); // AC-007
  const tc = (title, acIds) => ok(model.addTestCase(p, { title, steps: [step("Apply the code", "The total changes")], acIds }, NOW));
  tc("Valid code", ["AC-001"]); // TC-001
  tc("Valid code on a sale item", ["AC-001", "AC-002"]); // TC-002
  tc("Declined card", ["AC-004"]); // TC-003
  tc("Exploratory pass over checkout", []); // TC-004
  tc("Lower-case code", ["AC-002", "AC-007"]); // TC-005
  ok(model.setState(p, "TC-005", "retired", NOW));
  const run = (tcId, status, build, executedOn, actual = "") => ok(model.addExecution(p, { tcId, status, build, executedOn, actual }, NOW));
  run("TC-001", "pass", "1.0", "2026-11-10T10:00"); // EX-0001
  run("TC-002", "fail", "1.0", "2026-11-10T11:00", "Total unchanged"); // EX-0002
  run("TC-002", "pass", "1.1", "2026-11-12T09:00"); // EX-0003
  run("TC-003", "blocked", "1.1", "2026-11-12T09:00", "Payment sandbox down"); // EX-0004
  run("TC-001", "fail", "1.1", "2026-11-11T08:00", "Discount applied twice"); // EX-0005 (recorded after EX-0001, dated later)
  run("TC-003", "pass", "1.1", "2026-11-12T09:00"); // EX-0006 (same minute as EX-0004: the higher number wins)
  const def = (title, status, tcIds, extra = {}) => ok(model.addDefect(p, { title, actual: "x", severity: "major", priority: "high", status, tcIds, ...extra }, NOW));
  def("Discount applied twice", "open", ["TC-001"], { exIds: ["EX-0005"] }); // DEF-001
  def("Exploratory finding", "retest", ["TC-004"]); // DEF-002
  def("Rounding on refunds", "deferred", [], { reason: "after launch" }); // DEF-003
  def("Old bug", "closed", []); // DEF-004
  return p;
}

/* ---------- records and ids ---------- */

test("ids: per-type counters, never reused after a delete; a copy gets a new id and no mappings", () => {
  const p = checkout();
  assert.deepEqual(p.next, { REQ: 4, AC: 8, TC: 6, MAP: 7, EX: 7, DEF: 5 });
  ok(model.addRequirement(p, { title: "Temporary" }, NOW));
  assert.equal(p.requirements.at(-1).id, "REQ-004");
  ok(model.deleteRecord(p, "REQ-004", NOW));
  assert.equal(ok(model.addRequirement(p, { title: "Next" }, NOW)), "REQ-005", "REQ-004 is not given again");
  const copy = ok(model.duplicateTestCase(p, "TC-002", NOW));
  assert.equal(copy, "TC-006");
  assert.equal(model.byId(p.testCases, copy).title, "Copy of Valid code on a sale item");
  assert.deepEqual(model.mappingsOfCase(p, copy), []);
  assert.equal(model.formatId("MAP", 12), "MAP-0012");
  assert.deepEqual(model.parseId("AC-0001"), { type: "AC", n: 1 });
  assert.equal(model.parseId("AC-01"), null);
  assert.equal(model.parseId("XX-001"), null);
});

test("records: required fields are refused in words and the project is left unchanged", () => {
  const p = checkout();
  const before = JSON.stringify(p);
  assert.deepEqual(model.createProject({ name: "  " }).errors, { name: "Give the project a name." });
  assert.ok(model.addRequirement(p, { title: "" }).errors.title);
  assert.ok(model.addCriterion(p, "REQ-001", { text: "" }).errors.text);
  assert.ok(model.addCriterion(p, "REQ-001", { text: "x", status: "excluded" }).errors.reason);
  assert.ok(model.addCriterion(p, "REQ-999", { text: "x" }).errors.form);
  assert.ok(model.addTestCase(p, { title: "No steps", steps: [] }).errors.steps);
  assert.ok(model.addTestCase(p, { title: "No expected", steps: [step("Do it")] }).errors.expected);
  assert.ok(model.addExecution(p, { tcId: "TC-001", status: "fail", executedOn: NOW }).errors.actual, "a failure needs what happened");
  assert.ok(model.addExecution(p, { tcId: "TC-001", status: "skipped", executedOn: NOW }).errors.status, "not run is never recorded");
  assert.ok(model.addExecution(p, { tcId: "TC-005", status: "pass", executedOn: NOW }).errors.tcId, "a retired case cannot be run");
  assert.ok(model.addDefect(p, { title: "x", actual: "y" }).errors.severity);
  assert.ok(model.addMapping(p, "AC-001", "TC-001").errors.form, "a pair is mapped once");
  assert.ok(model.addMapping(p, "AC-001", "TC-005").errors.form, "a retired case is not mapped");
  assert.equal(JSON.stringify(p), before);
});

test("records: referenced items are retired, not deleted; restore needs an active parent; limits stop additions", () => {
  const p = checkout();
  assert.match(model.deleteRecord(p, "TC-001").errors.form, /in use .*mapping.*test run.*DEF-001.*Retire/);
  assert.match(model.deleteRecord(p, "AC-001").errors.form, /in use/);
  assert.match(model.deleteRecord(p, "REQ-001").errors.form, /mapped criteria/);
  ok(model.deleteRecord(p, "REQ-003")); // no criteria, nothing refers to it
  ok(model.setState(p, "REQ-002", "retired"));
  ok(model.setState(p, "AC-004", "retired"));
  assert.match(model.setState(p, "AC-004", "active").errors.form, /Restore REQ-002 first/);
  assert.match(model.deleteExecution(p, "EX-0005").errors.form, /DEF-001/);
  ok(model.deleteExecution(p, "EX-0006"));
  const q = model.createProject({ name: "Full" }).project;
  q.requirements = Array.from({ length: model.LIMITS.requirements }, (_, i) => ({ id: model.formatId("REQ", i + 1) }));
  assert.match(model.addRequirement(q, { title: "One more" }).errors.form, /limit of 100 requirements/);
});

test("defects: a status change is kept in the history; links to unknown records are dropped", () => {
  const p = checkout();
  ok(model.updateDefect(p, "DEF-001", { status: "retest" }, "2026-11-18T10:00"));
  ok(model.updateDefect(p, "DEF-001", { status: "closed", resolution: "Fixed in 1.2" }, "2026-11-19T10:00"));
  assert.deepEqual(model.byId(p.defects, "DEF-001").history.map((h) => h.status), ["open", "retest", "closed"]);
  ok(model.updateDefect(p, "DEF-002", { tcIds: ["TC-004", "TC-999"], exIds: ["EX-0999"] }));
  assert.deepEqual(model.byId(p.defects, "DEF-002").tcIds, ["TC-004"]);
  assert.deepEqual(model.byId(p.defects, "DEF-002").exIds, []);
});

/* ---------- calculations (golden values by hand) ---------- */

test("latest run: by date and time, ties by the higher run number, inside the chosen build", () => {
  const p = checkout();
  const all = latestRuns(p);
  assert.equal(all.get("TC-001").id, "EX-0005"); // 11-11 08:00 beats 11-10 10:00
  assert.equal(all.get("TC-002").id, "EX-0003");
  assert.equal(all.get("TC-003").id, "EX-0006"); // same minute as EX-0004; higher number
  assert.equal(all.has("TC-004"), false);
  const old = latestRuns(p, "1.0");
  assert.equal(old.get("TC-001").id, "EX-0001");
  assert.equal(old.get("TC-002").id, "EX-0002");
  assert.deepEqual(buildsOf(p), ["1.0", "1.1"]);
});

test("criterion result: failed beats blocked beats passed; some passed and some not run is partly run", () => {
  const latest = new Map([["A", { status: "pass" }], ["B", { status: "fail" }], ["C", { status: "blocked" }]]);
  assert.equal(criterionResult([], latest), "unmapped");
  assert.equal(criterionResult(["A", "B", "C"], latest), "failed");
  assert.equal(criterionResult(["A", "C"], latest), "blocked");
  assert.equal(criterionResult(["A"], latest), "passed");
  assert.equal(criterionResult(["A", "D"], latest), "partly-run");
  assert.equal(criterionResult(["D"], latest), "not-run");
});

test("metrics, all builds: the checkout golden values", () => {
  const m = metrics(checkout());
  /* counted criteria: AC-001, AC-002, AC-004, AC-006, AC-007 (AC-003 clarify, AC-005 excluded) */
  assert.equal(m.criteria.counted, 5);
  assert.equal(m.criteria.mapped, 3); // AC-001 (TC-001, TC-002), AC-002 (TC-002; TC-005 retired), AC-004 (TC-003)
  assert.deepEqual(m.criteria.unmapped, ["AC-006", "AC-007"]);
  assert.deepEqual(m.criteria.onlyRetired, ["AC-007"]); // mapped only to the retired TC-005
  assert.deepEqual(m.criteria.clarify, ["AC-003"]);
  assert.deepEqual(m.criteria.excluded, ["AC-005"]);
  /* AC-001: TC-001 fail + TC-002 pass = failed; AC-002: TC-002 pass; AC-004: TC-003 pass */
  assert.deepEqual(m.criteria.results, { passed: 2, failed: 1, blocked: 0, "partly-run": 0, "not-run": 0, unmapped: 2 });
  assert.equal(m.criteria.executed, 3);
  assert.deepEqual(m.requirements.mapping, { full: [], partial: ["REQ-001", "REQ-002"], none: [], noCriteria: ["REQ-003"] });
  assert.equal(m.cases.active, 4);
  assert.equal(m.cases.linked, 3);
  assert.deepEqual(m.cases.unlinked, ["TC-004"]);
  assert.deepEqual([m.runs.pass, m.runs.fail, m.runs.blocked, m.runs.notRun], [["TC-002", "TC-003"], ["TC-001"], [], ["TC-004"]]);
  assert.equal(m.runs.pass.length + m.runs.fail.length + m.runs.blocked.length + m.runs.notRun.length, m.cases.active, "the totals invariant");
  assert.equal(m.runs.executed, 3);
  assert.equal(m.runs.total, 6);
  assert.deepEqual([m.defects.open, m.defects.retest, m.defects.deferred, m.defects.closed], [["DEF-001"], ["DEF-002"], ["DEF-003"], ["DEF-004"]]);
  assert.equal(m.defects.outstanding, 2); // open + awaiting retest; deferred and closed are not outstanding
  assert.deepEqual(m.defects.failedWithoutDefect, []); // TC-001 has DEF-001
});

test("metrics, build 1.0 only: older runs, a failure without a defect", () => {
  const m = metrics(checkout(), { build: "1.0" });
  assert.deepEqual([m.runs.pass, m.runs.fail, m.runs.blocked, m.runs.notRun], [["TC-001"], ["TC-002"], [], ["TC-003", "TC-004"]]);
  assert.deepEqual(m.criteria.results, { passed: 0, failed: 2, blocked: 0, "partly-run": 0, "not-run": 1, unmapped: 2 });
  assert.equal(m.criteria.executed, 2);
  assert.deepEqual(m.defects.failedWithoutDefect, ["TC-002"]);
  assert.equal(m.runs.total, 2);
});

test("metrics: a retired requirement takes its criteria out of every denominator; an empty project has none", () => {
  const p = checkout();
  ok(model.setState(p, "REQ-002", "retired"));
  const m = metrics(p);
  assert.equal(m.criteria.counted, 3);
  assert.deepEqual(m.criteria.outOfScope, ["AC-004", "AC-005", "AC-006"]);
  const empty = metrics(model.createProject({ name: "Empty" }).project);
  assert.equal(empty.criteria.counted, 0);
  assert.equal(empty.cases.active, 0);
  assert.equal(empty.defects.outstanding, 0);
});

/* ---------- the project file ---------- */

test("file: a project round-trips exactly; the readable part cannot open or close a comment", () => {
  const p = checkout();
  ok(model.updateTestCase(p, "TC-004", { title: "Odd <!-- text --> | pipes", pre: "Line 1\nLine 2 ünïcödé ₹" }));
  const file = projectFile(p, NOW);
  assert.equal((file.match(/<!--/g) ?? []).length, 1, "only the data comment opens a comment");
  assert.equal((file.match(/-->/g) ?? []).length, 1);
  assert.ok(file.includes("<\\!-- text --\\>"));
  const back = readProject(file);
  assert.ok(back.project, JSON.stringify(back.errors));
  assert.deepEqual(back.ignored, []);
  assert.deepEqual(back.notes, []);
  for (const key of ["project", "next", "requirements", "criteria", "testCases", "mappings", "executions", "defects"]) assert.deepEqual(back.project[key], p[key], key);
  assert.equal(projectFileName(p, "2026-11-17"), "qa-project-checkout-2026-11-17.md");
  assert.equal(neutral("a<!--b-->c"), "a<\\!--b--\\>c");
});

test("file: wrong kind, missing or newer schema, plain text and oversize files are refused in words", () => {
  const data = JSON.parse(readMeta(projectFile(checkout(), NOW), 4e6).meta ? JSON.stringify(readMeta(projectFile(checkout(), NOW), 4e6).meta) : "{}");
  assert.match(validateProject({ ...data, kind: "work-pack" }).errors[0], /Work Pack.*AI Workbench/);
  assert.match(validateProject({ ...data, kind: "other" }).errors[0], /not a QA project/);
  assert.match(validateProject({ ...data, schema: undefined }).errors[0], /which version/);
  assert.match(validateProject({ ...data, schema: 2 }).errors[0], /version 2.*reads version 1/);
  assert.match(readProject("# notes only").errors[0], /not a QA project file/);
  assert.match(readProject("x".repeat(model.LIMITS.fileBytes + 1)).errors[0], /larger than 3 MB/);
  assert.match(readProject("x <!-- toolzenhub:{broken -->").errors[0], /not readable/);
});

test("file: duplicate ids, broken references, bad values and missing fields refuse the whole file", () => {
  const base = readMeta(projectFile(checkout(), NOW), 4e6).meta;
  const clone = () => JSON.parse(JSON.stringify(base));
  let d = clone();
  d.testCases[1].id = "TC-001";
  assert.ok(validateProject(d).errors.some((e) => /TC-001 appears more than once/.test(e)));
  d = clone();
  d.mappings[0].tcId = "TC-099";
  assert.ok(validateProject(d).errors.some((e) => /refers to TC-099/.test(e)));
  d = clone();
  d.executions[0].status = "passed";
  assert.ok(validateProject(d).errors.some((e) => /EX-0001: status has an unknown value/.test(e)));
  d = clone();
  delete d.requirements[0].title;
  assert.ok(validateProject(d).errors.some((e) => /REQ-001: title is missing/.test(e)));
  d = clone();
  d.executions[1].actual = "";
  assert.ok(validateProject(d).errors.some((e) => /EX-0002: a failed run needs its actual result/.test(e)));
  d = clone();
  d.mappings.push({ ...d.mappings[0], id: "MAP-0099" });
  assert.ok(validateProject(d).errors.some((e) => /mapped to .* twice/.test(e)));
  d = clone();
  d.criteria = "nope";
  assert.ok(validateProject(d).errors.some((e) => /criteria is not a list/.test(e)));
  d = clone();
  d.testCases[0].title = "x".repeat(model.MAX.title + 1);
  assert.ok(validateProject(d).errors.some((e) => /longer than 200/.test(e)), "too long is refused, not cut");
  for (const result of [validateProject(d)]) assert.equal(result.project, undefined, "nothing is partly accepted");
});

test("file: unknown fields are listed, low counters are raised with a note, and no key reaches a prototype", () => {
  const d = JSON.parse(JSON.stringify(readMeta(projectFile(checkout(), NOW), 4e6).meta));
  d.colour = "blue";
  d.requirements[0].owner = "Asha";
  d.next.TC = 2;
  const polluted = JSON.parse(`{"__proto__":{"polluted":true},"title":"P","id":"REQ-009"}`);
  d.requirements.push(polluted);
  const result = validateProject(d);
  assert.ok(result.project, JSON.stringify(result.errors));
  assert.deepEqual(result.ignored.sort(), ["colour", "requirements.__proto__", "requirements.owner"]);
  assert.equal(result.project.next.TC, 6);
  assert.ok(result.notes.some((n) => /next TC number was raised to 6/.test(n)), result.notes.join(" "));
  assert.equal(result.project.next.REQ, 10, "REQ-009 is in use, so the next is REQ-010");
  assert.equal({}.polluted, undefined);
  assert.equal(Object.getPrototypeOf(result.project.requirements.at(-1)), Object.prototype);
});

/* ---------- report and CSV ---------- */

test("report: separate denominators, the scope, the tester's decision in their words, no score", () => {
  const p = checkout();
  const r = buildReport(p, { generatedOn: NOW, decision: "Go, with DEF-001 accepted by the product owner" });
  assert.match(r, /Test runs counted: all builds\./);
  assert.match(r, /Mapped to at least one active test case: 3 of 5 \(60\.0 %\)/);
  assert.match(r, /With at least one executed test \(pass or fail\) in scope: 3 of 5/);
  assert.match(r, /Passed 2 of 4 active test cases \(50\.0 %\)/);
  assert.match(r, /Passed 2 of 3 executed test cases/);
  assert.match(r, /Outstanding \(open, and fixed awaiting retest\): 2\./);
  assert.match(r, /Release decision: Go, with DEF-001 accepted by the product owner/);
  assert.match(r, /Mapped means a test case is linked to the criterion\. It does not mean the criterion was tested\./);
  assert.doesNotMatch(r, /\bscore\b|ready for release|safe to release/i);
  const one = buildReport(p, { build: "1.0", generatedOn: NOW });
  assert.match(one, /Test runs counted: build 1\.0 only\./);
  assert.match(one, /Failed test cases with no defect linked: TC-002\./);
  assert.match(buildReport(model.createProject({ name: "E" }).project, { generatedOn: NOW }), /nothing to measure coverage against/);
});

test("CSV: quoted cells, doubled quotes, CRLF, and formula-looking cells made plain text", () => {
  assert.equal(csvCell("=HYPERLINK(\"x\")"), "\"'=HYPERLINK(\"\"x\"\")\"");
  for (const lead of ["+1", "-1", "@SUM(A1)", "\tx", "\rx"]) assert.ok(csvCell(lead).startsWith("\"'"), lead);
  assert.equal(csvCell("a,b\nc"), "\"a,b\nc\"");
  assert.equal(csv(["A", "B"], [["1", "2"]]), "\"A\",\"B\"\r\n\"1\",\"2\"\r\n");
  const files = csvFiles(checkout());
  assert.deepEqual(Object.keys(files), ["traceability", "test-cases", "runs", "defects"]);
  assert.match(files.traceability, /"AC-001","REQ-001","A valid code reduces the total","Accepted","Active","TC-001 TC-002","Failed"/);
  assert.match(files["test-cases"], /"TC-004",.*"Not run"/);
});

/* RFC 4180, as Excel reads it: quoted cells, doubled quotes, line breaks inside quotes, CRLF between rows */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === "\"" && text[i + 1] === "\"") {
        cell += "\"";
        i += 1;
      } else if (ch === "\"") quoted = false;
      else cell += ch;
    } else if (ch === "\"") quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" && text[i + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  return rows;
}

test("CSV: every export reads back cell for cell; awkward text survives; formulas stay text", () => {
  const p = checkout();
  ok(model.updateTestCase(p, "TC-001", { title: "=SUM(A1:A9) \"quoted\", comma", pre: "Line one\nLine two ₹1,000", steps: [step("-1 then @mention", "+91 98765 43210")] }));
  const files = csvFiles(p);
  for (const [name, text] of Object.entries(files)) {
    const rows = parseCsv(text);
    assert.ok(rows.length > 1, name);
    for (const r of rows) assert.equal(r.length, rows[0].length, `${name}: every row has the header's ${rows[0].length} cells`);
  }
  const cases = parseCsv(files["test-cases"]);
  const tc1 = cases.find((r) => r[0] === "TC-001");
  assert.equal(tc1[1], "'=SUM(A1:A9) \"quoted\", comma");
  assert.equal(tc1[6], "Line one\nLine two ₹1,000");
  assert.equal(tc1[8], "1. -1 then @mention => +91 98765 43210");
  assert.equal(cases.length - 1, p.testCases.length);
  assert.equal(parseCsv(files.runs).length - 1, p.executions.length);
  assert.equal(parseCsv(files.defects).length - 1, p.defects.length);
  assert.equal(parseCsv(files.traceability).length - 1, p.criteria.length);
});

/* ---------- AI help ---------- */

test("AI: the Reviewer receives the criteria under the heading it reads item by item", () => {
  const p = checkout();
  const { payload, cut } = ai.reviewPayload(p, "REQ-001");
  assert.equal(cut, 0);
  assert.equal(payload.task, "test-cases");
  assert.deepEqual(extractRequirements(payload.request), ["AC-001 A valid code reduces the total", "AC-002 An expired code is refused with a message", "AC-007 Code is case-insensitive"]);
  assert.ok(payload.request.length <= ai.REVIEW_LIMIT);
});

test("AI: the Workbench and Bug Report payloads use the receivers' own fields and limits", () => {
  const p = checkout();
  const { payload } = ai.workbenchPayload(p, "REQ-002");
  assert.equal(payload.task, "test-cases");
  assert.match(payload.answers.feature, /REQ-002: Card payment/);
  assert.equal(payload.answers.requirements, "- AC-004 A declined card shows the bank's reason\n- AC-006 3-D Secure challenge completes");
  const bug = ai.bugPayload(p, model.byId(p.defects, "DEF-001"));
  assert.deepEqual(Object.keys(bug), ["observed", "expected", "steps", "environment", "evidence"]);
  assert.match(bug.environment, /Build 1\.1/);
  assert.match(bug.evidence, /TC-001 Valid code/);
});

test("AI: a pasted table becomes suggestions only; unknown criteria are left out and named", () => {
  const p = checkout();
  const answer = [
    "Here are the cases:",
    "",
    "| Covers | Title | Type | Priority | Preconditions | Test data | Steps | Expected result |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    "| AC-001 | Percentage code | Positive | High | Basket ₹1,000 | SAVE10 | 1. Add item<br>2. Apply SAVE10 | Line shows 10% off<br>Total is ₹900 |",
    "| AC-002, AC-042 | Expired code | negative | low | | OLD5 | Apply OLD5 | Message \"This code has expired\" |",
    "",
    "AC-003 is ambiguous."
  ].join("\n");
  const { cases, problems } = ai.parseCaseTable(answer, p);
  assert.equal(cases.length, 2);
  assert.deepEqual(cases[0].steps, [{ action: "Add item", expected: "Line shows 10% off" }, { action: "Apply SAVE10", expected: "Total is ₹900" }]);
  assert.deepEqual([cases[0].type, cases[0].priority, cases[0].acIds], ["positive", "high", ["AC-001"]]);
  assert.deepEqual(cases[1].acIds, ["AC-002"]);
  assert.match(problems[0], /AC-042/);
  assert.equal(p.testCases.length, 5, "parsing adds nothing to the project");
  assert.match(ai.parseCaseTable("no table here", p).problems[0], /No Markdown table/);
  const req = ai.suggestionRequest(p, "REQ-001");
  assert.match(req, /Covers \| Title \| Type \| Priority \| Preconditions \| Test data \| Steps \| Expected result/);
  assert.match(req, /Test cases that already exist/);
  assert.match(req, /No test results/);
});

test("pack format: the optional size limit leaves the 200 kB default and its message unchanged", () => {
  assert.match(readMeta("x".repeat(200001)).error, /^The file is larger than 200 kB\.$/);
  assert.equal(readMeta(`${"x".repeat(200001)} <!-- toolzenhub:{"a":1} -->`, 3000000).meta.a, 1);
  assert.match(readMeta("x".repeat(3000001), 3000000).error, /3 MB/);
});
