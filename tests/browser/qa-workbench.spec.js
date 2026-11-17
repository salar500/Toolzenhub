/**
 * QA Requirement-to-Release Workbench (docs/tool-packs/59-qa-workbench.md): the journeys on the page itself.
 * A project built by hand from start to report, downloaded and opened again; an invalid file refused with the open project
 * kept; the project surviving in-place navigation and Back/Forward but not a reload; the hand-offs to the Output Reviewer,
 * the AI Workbench and Bug Report; AI suggestions that wait for acceptance; the unsaved warning. Records and figures are
 * covered by tests/unit/qa-workbench.test.mjs; here a seeded project comes from the same engine, opened through the page.
 */
import fs from "node:fs";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import * as M from "../../assets/js/tools/qa-workbench/model.js";
import { projectFile } from "../../assets/js/tools/qa-workbench/project-file.js";

const NOW = "2026-11-17T09:00";
const storageKeys = (page) => page.evaluate(() => ({ local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage).sort() }));
const onlyApproved = (keys) => keys.local.every((k) => ["tz-theme", "tz-analytics-consent"].includes(k)) && keys.session.length === 0;

const STAGE_TITLES = { overview: "Overview", requirements: "Requirements", cases: "Test cases", coverage: "Coverage", execution: "Execution", defects: "Defects", report: "Report" };

/* a stage by the control the screen shows: the row of buttons, or the select on a phone */
async function stage(page, id) {
  const select = page.locator("#qa-stage-select");
  if (await select.isVisible()) await select.selectOption(id);
  else await page.locator(`.qa-stage[data-stage="${id}"]`).click();
  await expect(page.locator("#qa-stage-title")).toBeFocused();
}

const ready = async (page) => page.locator("#qa-app[data-ready]").waitFor();

/* a small seeded project: one requirement with two accepted criteria, one test case mapped to the first, a failed run, a defect */
function seeded() {
  const { project: p } = M.createProject({ name: "Seeded checkout", build: "2.0", environment: "Staging" }, NOW);
  M.addRequirement(p, { title: "Coupon codes" }, NOW);
  M.addCriterion(p, "REQ-001", { text: "A valid code reduces the total" }, NOW);
  M.addCriterion(p, "REQ-001", { text: "An expired code is refused with a message" }, NOW);
  M.addTestCase(p, { title: "Valid code", steps: [{ action: "Apply SAVE10", expected: "Total drops by 10%" }], acIds: ["AC-001"] }, NOW);
  M.addExecution(p, { tcId: "TC-001", status: "fail", build: "2.0", executedOn: "2026-11-17T10:00", actual: "Total unchanged" }, NOW);
  M.addDefect(p, { title: "Coupon not applied", actual: "Total unchanged", expected: "Total drops by 10%", severity: "major", priority: "high", tcIds: ["TC-001"], exIds: ["EX-0001"] }, NOW);
  return projectFile(p, NOW);
}

async function openSeeded(page, go) {
  await go("tools/qa-workbench/");
  await ready(page);
  await page.getByLabel("Or paste the file's text").fill(seeded());
  await page.getByRole("button", { name: "Check the file" }).click();
  await page.getByRole("button", { name: "Open this project" }).click();
  await expect(page.locator("#qa-stage-title")).toHaveText("Seeded checkout");
}

test.describe("QA Workbench", () => {

  test("a project from start to report: requirement, criteria, test case, mapping, a failed run, a defect; downloaded and opened again @portable", async ({ page, go, watch }) => {
    await go("tools/qa-workbench/");
    await ready(page);
    await expect(page.locator("#qa-stage-title")).toHaveText("Start a QA project");
    await expectNoHorizontalOverflow(page);

    /* required name, refused in words */
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page.locator("[data-error-for=name]")).toHaveText("Give the project a name.");
    await page.getByLabel("Project name").fill("Checkout release");
    await page.getByLabel("Build or version").fill("1.4");
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page.locator("#qa-stage-title")).toHaveText("Checkout release");
    await expect(page.locator("#qa-bar")).toContainText("Not saved to a file.");

    await stage(page, "requirements");
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add requirement" }).click();
    await page.locator("form[data-form=req]").getByLabel("Title").fill("Coupon codes");
    await page.locator("form[data-form=req]").getByRole("button", { name: "Add requirement" }).click();
    await expect(page.locator("[data-req='REQ-001'] summary")).toContainText("Coupon codes");
    await page.getByRole("button", { name: "Add criteria to REQ-001" }).click();
    await page.getByLabel("Criteria, one per line").fill("A valid code reduces the total\nAn expired code is refused with a message");
    await expect(page.locator("#qa-ac-count")).toHaveText("Adds 2 criteria.");
    await page.locator("form[data-form=ac]").getByRole("button", { name: "Add criteria" }).click();
    await expect(page.locator(".qa-ac")).toHaveCount(2);
    await expectNoHorizontalOverflow(page);

    await stage(page, "cases");
    await expect(page.locator(".qa-empty")).toContainText("No test cases yet");
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add test case" }).click();
    const form = page.locator("form[data-form=tc]");
    await form.getByRole("button", { name: "Add test case" }).click();
    await expect(form.locator("[data-error-for=title]")).toHaveText("Give the test case a title.");
    await form.getByLabel("Title").fill("Valid code");
    await form.getByLabel("Action", { exact: true }).fill("Apply SAVE10 to a ₹1,000 basket");
    await form.getByLabel("Expected result of this step").fill("Total is ₹900");
    await form.getByRole("button", { name: "Add a step" }).click();
    await form.getByLabel("Action", { exact: true }).nth(1).fill("Remove the code");
    await form.getByRole("button", { name: "Move up" }).nth(1).click();
    await expect(form.getByLabel("Action", { exact: true }).first()).toHaveValue("Remove the code");
    await form.getByLabel(/AC-001/).check();
    await form.getByRole("button", { name: "Add test case" }).click();
    await expect(page.locator(".qa-case summary").first()).toContainText("TC-001");
    await expectNoHorizontalOverflow(page);

    await stage(page, "coverage");
    await expect(page.locator(".qa-fig", { hasText: "Mapped to an active test case" })).toContainText("1 of 2");
    await page.getByLabel("Show").selectOption("unmapped");
    await expect(page.locator(".qa-covrow")).toHaveCount(1);
    await expect(page.locator(".qa-covrow")).toContainText("AC-002");
    await expectNoHorizontalOverflow(page);

    await stage(page, "execution");
    await page.locator(".qa-toolbar").getByRole("button", { name: "Record a run" }).click();
    const run = page.locator("form[data-form=run]");
    await run.getByLabel("Fail").check();
    await run.getByRole("button", { name: "Record the run" }).click();
    await expect(run.locator("[data-error-for=actual]")).toHaveText("Say what actually happened.");
    await run.getByLabel("Actual result").fill("Total unchanged at ₹1,000");
    await run.getByRole("button", { name: "Record the run" }).click();
    await expect(page.locator(".qa-fig", { hasText: "Failed" }).first()).toContainText("1");
    await page.getByRole("button", { name: "Create a defect from this run" }).click();
    const defect = page.locator("form[data-form=defect]");
    await expect(defect.getByLabel("Test cases")).toHaveValue("TC-001");
    await expect(defect.getByLabel("Actual result")).toHaveValue("Total unchanged at ₹1,000");
    await defect.getByLabel("Severity").selectOption("major");
    await defect.getByLabel("Priority").selectOption("high");
    await defect.getByRole("button", { name: "Add defect" }).click();
    await expect(page.locator(".qa-fig", { hasText: "Outstanding" }).first()).toContainText("1");
    await expectNoHorizontalOverflow(page);

    await stage(page, "report");
    await expect(page.locator("#qa-report")).toContainText("Passed 0 of 1 active test cases");
    await expect(page.locator("#qa-report")).toContainText("Outstanding (open, and fixed awaiting retest): 1.");
    await expect(page.locator("#qa-report")).toContainText("Mapped means a test case is linked to the criterion. It does not mean the criterion was tested.");
    await expectNoHorizontalOverflow(page);

    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#qa-bar").getByRole("button", { name: "Download project" }).click()]);
    expect(download.suggestedFilename()).toMatch(/^qa-project-checkout-release-\d{4}-\d{2}-\d{2}\.md$/);
    const file = fs.readFileSync(await download.path(), "utf8");
    expect(file).toContain("<!-- toolzenhub:");
    expect(file).toContain("\"kind\":\"qa-project\"");
    await expect(page.locator("#qa-bar")).toContainText("Project downloaded at");

    await stage(page, "overview");
    await page.getByRole("button", { name: "Start a new project" }).click();
    await expect(page.locator("#qa-stage-title")).toHaveText("Start a QA project");
    await page.getByLabel("Project file").setInputFiles(await download.path());
    await page.getByRole("button", { name: "Open this project" }).click();
    await expect(page.locator("#qa-stage-title")).toHaveText("Checkout release");
    await expect(page.locator("#qa-bar")).toContainText("Opened from a file.");
    await expect(page.locator(".qa-fig", { hasText: "Mapped criteria" })).toContainText("1 of 2");
    await expect(page.locator(".qa-fig", { hasText: "Outstanding defects" })).toContainText("1");

    expect(page.url(), "nothing typed reaches the address bar").not.toMatch(/coupon|checkout-release/i);
    expect(onlyApproved(await storageKeys(page))).toBe(true);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("an invalid file is refused in words and the open project is kept", async ({ page, go, watch }) => {
    await openSeeded(page, go);
    await page.locator(".qa-box > summary").click();
    await page.getByLabel("Or paste the file's text").fill(seeded().replace("\"kind\":\"qa-project\"", "\"kind\":\"work-pack\""));
    await page.getByRole("button", { name: "Check the file" }).click();
    await expect(page.locator(".qa-problem")).toContainText("This file was not opened.");
    await expect(page.locator(".qa-problem")).toContainText("This is a Work Pack: open it in the AI Workbench.");
    await page.getByLabel("Or paste the file's text").fill(seeded().replace("\"schema\":1", "\"schema\":2"));
    await page.getByRole("button", { name: "Check the file" }).click();
    await expect(page.locator(".qa-problem")).toContainText("version 2");
    await expect(page.locator("#qa-stage-title")).toHaveText("Seeded checkout");
    await expect(page.locator("#qa-bar")).toContainText("Seeded checkout");
    expect(watch.pageErrors).toEqual([]);
  });

  test("the open project survives in-place navigation and Back/Forward, not a reload; the Reviewer and the Workbench receive the criteria", async ({ page, go, watch }) => {
    await openSeeded(page, go);
    await page.evaluate(() => {
      window.qaSameDocument = true;
    });

    await stage(page, "cases");
    await page.locator("[data-box=ai] > summary").click();
    await page.getByRole("link", { name: "Check an AI answer against these criteria" }).click();
    await expect(page.locator("h1")).toHaveText("AI Output Reviewer");
    await page.locator("#ac-form[data-ready]").waitFor();
    await expect(page.locator("#ac-question")).toHaveValue(/## Acceptance criteria\n- AC-001 A valid code reduces the total\n- AC-002 An expired code is refused with a message/);
    await expect(page.locator("#ac-reviewType")).toHaveValue("testing");

    await page.goBack();
    await ready(page);
    await expect(page.locator("#qa-bar")).toContainText("Seeded checkout");
    expect(await page.evaluate(() => window.qaSameDocument), "Back stayed in the same document").toBe(true);

    await stage(page, "cases");
    await page.locator("[data-box=ai] > summary").click();
    await page.getByRole("link", { name: "Plan these tests in the AI Workbench" }).click();
    await expect(page.locator("h1")).toHaveText("AI Workbench");
    await expect(page.locator("#wb-q-requirements")).toHaveValue(/AC-001 A valid code reduces the total/);
    await expect(page.locator("#wb-q-feature")).toHaveValue(/REQ-001: Coupon codes/);
    await expect(page.locator("#wb-suggestion")).toContainText("Brought from the QA Workbench");

    await page.goBack();
    await ready(page);
    await expect(page.locator("#qa-bar")).toContainText("Seeded checkout");
    await page.goForward();
    await expect(page.locator("h1")).toHaveText("AI Workbench");
    await page.goBack();
    await ready(page);
    await expect(page.locator("#qa-bar")).toContainText("Seeded checkout");
    expect(await page.evaluate(() => window.qaSameDocument)).toBe(true);

    await page.reload();
    await ready(page);
    await expect(page.locator("#qa-stage-title")).toHaveText("Start a QA project");
    await expect(page.locator("#qa-bar")).toContainText("No project is open");
    expect(onlyApproved(await storageKeys(page))).toBe(true);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("AI suggestions wait for acceptance; a defect goes to Bug Report with its details", async ({ page, go, watch }) => {
    await openSeeded(page, go);
    await stage(page, "cases");
    await page.locator("[data-box=ai] > summary").click();
    await page.getByLabel("Paste the AI's answer with its table").fill([
      "| Covers | Title | Type | Priority | Preconditions | Test data | Steps | Expected result |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      "| AC-002 | Expired code | negative | high | | OLD5 | Apply OLD5 | Message \"This code has expired\" |",
      "| AC-009 | Invented criterion | positive | low | | | Do something | Something |"
    ].join("\n"));
    await page.getByRole("button", { name: "Read the suggested test cases" }).click();
    await expect(page.locator(".qa-suggestion")).toHaveCount(2);
    await expect(page.locator("[data-box=ai]")).toContainText("AC-009");
    await expect(page.locator(".qa-case")).toHaveCount(1); // nothing is added yet
    await page.getByRole("button", { name: "Discard suggestion 2" }).click();
    await page.getByRole("button", { name: "Accept suggestion 1" }).click();
    await expect(page.locator(".qa-case")).toHaveCount(2);
    await expect(page.locator(".qa-case").nth(1)).toContainText("from an AI suggestion");

    await stage(page, "coverage");
    await expect(page.locator(".qa-fig", { hasText: "Mapped to an active test case" })).toContainText("2 of 2");

    await stage(page, "defects");
    await page.locator("[data-open-id='DEF-001'] > summary").click();
    await page.getByRole("link", { name: "Write a debugging prompt for DEF-001 in Bug Report" }).click();
    await expect(page.locator("h1")).toHaveText("Bug Report to Debugging Prompt");
    await page.locator("#bug-form[data-ready]").waitFor();
    await expect(page.locator("#bug-observed")).toHaveValue(/Coupon not applied/);
    await expect(page.locator("#bug-expected")).toHaveValue("Total drops by 10%");
    await expect(page.locator("#bug-environment")).toHaveValue(/Build 2\.0/);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("every control has a label; stages are buttons with the current one marked; light and dark themes keep the page inside the screen", async ({ page, go }) => {
    await openSeeded(page, go);
    for (const id of Object.keys(STAGE_TITLES)) {
      await stage(page, id);
      const unlabelled = await page.locator("#qa-app").evaluate((root) => [...root.querySelectorAll("input, select, textarea")]
        .filter((el) => el.type !== "hidden" && !el.labels?.length && !el.getAttribute("aria-label")).map((el) => el.name || el.id));
      expect(unlabelled, `${id}: controls without a label`).toEqual([]);
      await expectNoHorizontalOverflow(page);
    }
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await stage(page, "execution");
    await expectNoHorizontalOverflow(page);
    const tag = page.locator(".qa-tag").first();
    const colours = await tag.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el).backgroundColor]);
    expect(colours[0]).not.toEqual(colours[1]);
  });

  test("a project at the provisional limits (QD31) opens from its file and every stage draws, timed with the CPU slowed four times @desktop-only", async ({ page, go }, info) => {
    test.setTimeout(120000);
    const { project: p } = M.createProject({ name: "Limits", build: "3.0" }, NOW);
    const words = "checkout coupon basket payment refund invoice customer discount total shipping".split(" ");
    const text = (n, i) => Array.from({ length: n }, (_, k) => words[(i + k) % 10]).join(" ");
    for (let r = 0; r < M.LIMITS.requirements; r += 1) M.addRequirement(p, { title: text(6, r), description: text(30, r) }, NOW);
    for (let c = 0; c < M.LIMITS.criteria; c += 1) M.addCriterion(p, M.formatId("REQ", 1 + (c % M.LIMITS.requirements)), { text: text(16, c) }, NOW);
    for (let t = 0; t < M.LIMITS.testCases; t += 1) {
      M.addTestCase(p, { title: text(8, t), pre: text(10, t), data: text(8, t), steps: Array.from({ length: 5 }, (_, k) => ({ action: text(10, t + k), expected: text(12, t + k) })), acIds: [M.formatId("AC", 1 + (t % 400)), M.formatId("AC", 1 + ((t * 7) % 400))] }, NOW);
    }
    for (let x = 0; x < M.LIMITS.executions; x += 1) {
      const status = ["pass", "fail", "blocked", "pass"][x % 4];
      M.addExecution(p, { tcId: M.formatId("TC", 1 + (x % 500)), status, build: ["2.9", "3.0"][x % 2], executedOn: `2026-11-${String(1 + (x % 28)).padStart(2, "0")}T10:00`, actual: status === "pass" ? "" : text(10, x) }, NOW);
    }
    for (let d = 0; d < M.LIMITS.defects; d += 1) M.addDefect(p, { title: text(8, d), actual: text(14, d), severity: "major", priority: "medium", tcIds: [M.formatId("TC", 1 + d)], status: ["open", "retest", "deferred", "closed"][d % 4], reason: d % 4 === 2 ? "next release" : "" }, NOW);
    const file = projectFile(p, NOW);
    info.annotations.push({ type: "file size", description: `${Math.round(file.length / 1024)} kB` });
    expect(file.length).toBeLessThan(M.LIMITS.fileBytes);

    await go("tools/qa-workbench/");
    await ready(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    let start = Date.now();
    await page.getByLabel("Project file").setInputFiles({ name: "limits.md", mimeType: "text/markdown", buffer: Buffer.from(file, "utf8") });
    await page.getByRole("button", { name: "Open this project" }).click();
    await expect(page.locator("#qa-stage-title")).toHaveText("Limits");
    const times = { open: Date.now() - start };

    for (const id of ["requirements", "cases", "coverage", "execution", "defects", "report"]) {
      start = Date.now();
      await stage(page, id);
      if (id === "report") await expect(page.locator("#qa-report")).toContainText("How to read this report");
      times[id] = Date.now() - start;
    }

    start = Date.now();
    await stage(page, "cases");
    await page.getByLabel("Search test cases").fill("refund invoice");
    await expect(page.locator(".qa-case").first()).toBeVisible();
    times.search = Date.now() - start;

    info.annotations.push({ type: "milliseconds, CPU slowed 4x", description: JSON.stringify(times) });
    console.log("QA limits timing (ms, CPU x4):", JSON.stringify(times), `file ${Math.round(file.length / 1024)} kB`);
    for (const [k, ms] of Object.entries(times)) expect(ms, `${k} took ${ms} ms`).toBeLessThan(15000);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  });

  test("the first load stays within the page budget (QD24: about 40 kB raw / 13 kB gzip); the other stages load when opened @desktop-only", async ({ page, go }) => {
    const seen = [];
    page.on("request", (r) => {
      const m = /\/(assets\/js\/tools\/(?:qa-workbench|ai-tools\/common)\/[^?#]+\.js)/.exec(r.url());
      if (m && !seen.includes(m[1])) seen.push(m[1]);
    });
    await go("tools/qa-workbench/");
    await ready(page);
    await page.waitForLoadState("networkidle");
    const first = seen.reduce((a, f) => {
      const bytes = fs.readFileSync(new URL(`../../${f}`, import.meta.url));
      return { raw: a.raw + bytes.length, gzip: a.gzip + zlib.gzipSync(bytes, { level: 9 }).length };
    }, { raw: 0, gzip: 0 });
    console.log("QA first load:", JSON.stringify(first), seen.map((f) => f.split("/").pop()).join(" "));
    expect(first.raw, "raw bytes on first load").toBeLessThanOrEqual(40000);
    expect(first.gzip, "gzip bytes on first load").toBeLessThanOrEqual(13000);
    expect(seen.some((f) => /model\.js|metrics\.js|stages\/(?:cases|report)\.js/.test(f)), "no record or later-stage module on the first load").toBe(false);
  });

  test("unsaved changes ask before the tab closes; a project with no changes since its file does not @desktop-only", async ({ page, go, baseURL }) => {
    /* a second tab: unchanged since it was opened from a file, so closing it asks nothing */
    const calm = await page.context().newPage();
    await calm.goto(new URL("tools/qa-workbench/", baseURL).href);
    await ready(calm);
    await calm.getByLabel("Or paste the file's text").fill(seeded());
    await calm.getByRole("button", { name: "Check the file" }).click();
    await calm.getByRole("button", { name: "Open this project" }).click();
    await expect(calm.locator("#qa-bar")).toContainText("Opened from a file.");
    let calmAsked = false;
    calm.on("dialog", async (dialog) => {
      calmAsked = true;
      await dialog.accept();
    });
    await calm.close({ runBeforeUnload: true });
    await expect.poll(() => calm.isClosed()).toBe(true);
    expect(calmAsked).toBe(false);

    await openSeeded(page, go);
    await stage(page, "requirements");
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add requirement" }).click();
    await page.locator("form[data-form=req]").getByLabel("Title").fill("Refunds");
    await page.locator("form[data-form=req]").getByRole("button", { name: "Add requirement" }).click();
    await expect(page.locator("#qa-bar")).toContainText("Not saved to a file.");

    const asked = new Promise((resolve) => page.once("dialog", async (dialog) => {
      resolve(dialog.type());
      await dialog.accept();
    }));
    await page.close({ runBeforeUnload: true });
    expect(await asked).toBe("beforeunload");
  });

});

/* ---------- accessibility, responsive layout and keyboard ---------- */

/* axe-core is already installed (a dependency of the project's lighthouse); it is injected, not added */
const AXE = fileURLToPath(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url));

/* opens a disclosure only if it is closed (the page remembers what the visitor opened) */
async function openDisclosure(page, selector) {
  const d = page.locator(selector);
  if (!(await d.evaluate((el) => el.open))) await d.locator("> summary").click();
}

/* each stage with its form or panel open, so the scan and the layout checks cover the editors too */
const OPENERS = {
  overview: async (page) => openDisclosure(page, ".qa-box"),
  requirements: async (page) => {
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add requirement" }).click();
    await expect(page.locator("form[data-form=req]")).toBeVisible();
    await openDisclosure(page, "[data-req='REQ-001']"); // the requirement is folded until opened
    await page.getByRole("button", { name: "Add criteria to REQ-001" }).click();
  },
  cases: async (page) => {
    await openDisclosure(page, "[data-box=ai]");
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add test case" }).click();
    await openDisclosure(page, ".qa-filters");
  },
  coverage: async (page) => page.getByRole("button", { name: "Map a test case to AC-002" }).click(),
  execution: async (page) => {
    await page.locator(".qa-toolbar").getByRole("button", { name: "Record a run" }).click();
    await openDisclosure(page, "[data-open-id='runs-TC-001']");
  },
  defects: async (page) => {
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add defect" }).click();
  },
  report: async () => {}
};

async function axeViolations(page) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({ path: AXE });
  return page.evaluate(async () => {
    const result = await window.axe.run({ include: [["#qa-app"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
    return result.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  });
}

test.describe("QA Workbench: accessibility, layout, keyboard", () => {

  test("axe finds no WCAG A/AA violation on any stage, with its forms open, in the light and the dark theme @desktop-only", async ({ page, go }) => {
    test.setTimeout(180000);
    await openSeeded(page, go);
    const found = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      for (const id of Object.keys(OPENERS)) {
        await stage(page, id);
        await OPENERS[id](page);
        const violations = await axeViolations(page);
        if (violations.length) found[`${theme} ${id}`] = violations;
      }
    }
    /* a refused file, with its error list */
    await stage(page, "overview");
    await openDisclosure(page, ".qa-box");
    await page.getByLabel("Or paste the file's text").fill("# not a project");
    await page.getByRole("button", { name: "Check the file" }).click();
    await expect(page.locator(".qa-problem")).toBeVisible();
    const refused = await axeViolations(page);
    if (refused.length) found["refused file"] = refused;
    /* a form showing its errors */
    await stage(page, "defects");
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add defect" }).click();
    await page.locator("form[data-form=defect]").getByRole("button", { name: "Add defect" }).click();
    await expect(page.locator("form[data-form=defect] [data-error-for=title]")).toBeVisible();
    await expect(page.getByLabel("Title")).toHaveAttribute("aria-invalid", "true");
    const errors = await axeViolations(page);
    if (errors.length) found["form errors"] = errors;
    expect(found).toEqual({});
  });

  for (const width of [390, 412, 820, 1280]) {
    test(`at ${width} px every stage and editor fits: no page overflow, no clipped control, the heading clear of the sticky header @desktop-only`, async ({ page, go }) => {
      test.setTimeout(120000);
      await page.setViewportSize({ width, height: width < 800 ? 860 : 1000 });
      await openSeeded(page, go);
      for (const id of Object.keys(OPENERS)) {
        await stage(page, id);
        const covered = await page.locator("#qa-stage-title").evaluate((h) => {
          const r = h.getBoundingClientRect();
          const hit = document.elementFromPoint(Math.min(r.left + 20, window.innerWidth - 1), r.top + 6);
          return hit && !h.contains(hit) ? hit.className || hit.tagName : "";
        });
        expect(covered, `${id}: the heading is covered by ${covered}`).toBe("");
        await OPENERS[id](page);
        await expectNoHorizontalOverflow(page);
        const clipped = await page.locator("#qa-app").evaluate((root) => [...root.querySelectorAll("button, input, select, textarea, a")]
          .filter((el) => el.offsetParent !== null)
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.left < -1 || r.right > document.documentElement.clientWidth + 1);
          }).map((el) => el.name || el.textContent.trim().slice(0, 30)));
        expect(clipped, `${id}: controls outside the screen`).toEqual([]);
        const small = await page.locator("#qa-app").evaluate((root) => [...root.querySelectorAll("button, select, input:not([type=checkbox]):not([type=radio]), summary")]
          .filter((el) => el.offsetParent !== null && el.getBoundingClientRect().height < 43.5).map((el) => el.name || el.textContent.trim().slice(0, 30)));
        expect(small, `${id}: touch targets under 44 px`).toEqual([]);
      }
    });
  }

  test("keyboard only: create a project, move between stages, hear what happened @portable", async ({ page, go }) => {
    await go("tools/qa-workbench/");
    await ready(page);
    await page.getByLabel("Project name").focus();
    await page.keyboard.type("Keyboard project");
    await page.keyboard.press("Enter");
    await expect(page.locator("#qa-stage-title")).toHaveText("Keyboard project");
    await expect(page.locator("#qa-live")).toContainText("Project Keyboard project started");
    await expect(page.locator("#qa-stage-title")).toBeFocused();
    const select = page.locator("#qa-stage-select");
    if (await select.isVisible()) {
      await select.focus();
      await select.selectOption("requirements");
    } else {
      await page.locator(".qa-stage[data-stage=requirements]").focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.locator("#qa-stage-title")).toHaveText("Requirements");
    await expect(page.locator("#qa-stage-title")).toBeFocused();
    await page.locator(".qa-toolbar").getByRole("button", { name: "Add requirement" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("form[data-form=req] input[name=title]")).toBeFocused();
    await page.keyboard.type("Login");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-req='REQ-001'] summary")).toBeFocused();
    await expect(page.locator("#qa-live")).toContainText("REQ-001 added.");
    const ring = await page.locator("[data-req='REQ-001'] summary").evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(ring, "the focused summary shows a focus ring").not.toBe("none");
  });

});
