/**
 * Power BI Practice Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs, with query steps as the answer) plus what is
 * particular to it: every stated solution is accepted by the real page, errors in steps, relationships and measures are explained,
 * a hard-coded number fails a measure, the lessons' examples run (and can be edited), the report preview draws real results, and
 * the page says what the lab is and is not. Nothing leaves the browser.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { pickExercise, defineShellTests, openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";
import { set } from "../../assets/js/tools/power-bi-practice-lab/exercises.js";
import { lessons } from "../../assets/js/tools/power-bi-practice-lab/lessons.js";

const ROUTE = "tools/power-bi-practice-lab/";
const AXE = path.resolve("node_modules/axe-core/axe.min.js");
const N = set.exercises.length;
const indexOf = (id) => set.exercises.findIndex((e) => e.id === id) + 1;

defineShellTests({
  route: ROUTE,
  title: "Power BI Practice Lab",
  count: N,
  customInput: true,
  correct: "trim Name",
  wrong: "uppercase Name"
});

async function type(page, text) {
  await answerBox(page).fill(text);
  await checkButton(page).click();
}

async function openExercise(page, id) {
  await pickExercise(page, new RegExp(`^Exercise ${indexOf(id)}:`));
}

test.describe("Power BI Practice Lab: this lab", () => {

  test("every stated solution is accepted on the real page @portable", async ({ page, go }) => {
    test.setTimeout(300000);
    await openLab(page, go, ROUTE);
    const failures = [];
    for (let i = 0; i < N; i += 1) {
      await type(page, set.exercises[i].solution);
      const word = await verdictOf(page).innerText();
      if (word !== "Correct") failures.push(`${set.exercises[i].id}: ${word} ${await page.locator(".lx-feedback").innerText()}`);
      if (i < N - 1) await page.getByRole("button", { name: "Next exercise" }).click();
    }
    expect(failures).toEqual([]);
  });

  test("the tables are shown and labelled, and the box says what kind of answer is expected", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(app(page).getByRole("region", { name: "Table Customers_raw" })).toBeVisible();
    await expect(app(page).getByLabel("Your query steps (one per line)")).toBeVisible();
    await openExercise(page, "model-one-link");
    await expect(app(page).getByLabel("Your relationships (one per line)")).toBeVisible();
    await openExercise(page, "dax-total-sales");
    await expect(app(page).getByLabel("Your measure")).toBeVisible();
    await expect(app(page)).toContainText("checked in 7 filter contexts");
  });

  test("steps that cannot be applied say which line and why; a result that differs shows what the steps produced", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await type(page, "trim Nope");
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback")).toContainText("no column named");
    await type(page, "trim Name\nfrobnicate Name");
    await expect(page.locator(".lx-feedback")).toContainText("Line 2");
    await type(page, "uppercase Name");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator('.lx-feedback [aria-label="Details"]')).toContainText("ASHA RAO");
  });

  test("relationships: the wrong way round is explained, a duplicate-key table is refused, an incomplete model says what is not connected", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await openExercise(page, "model-two-links");
    await type(page, "Products[ProductID] -> Orders[ProductID]");
    await expect(page.locator(".lx-feedback")).toContainText("wrong way round");
    await type(page, "Orders[ProductID] -> Products[ProductID]");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("Customers is not connected");
    await type(page, "Orders[ProductID] -> Products[ProductID]\nOrders[CustomerID] -> Customers[CustomerID]");
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("a measure with a typed-in number fails in other filter contexts; an unsupported function is named; an error in one context is shown", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await openExercise(page, "dax-total-sales");
    await type(page, "Total Sales = 6800");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("Not right in");
    await type(page, "Total Sales = SUMM(Orders[Amount])");
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback")).toContainText("SUMM is not supported in this lab");
    await type(page, "Total Sales = SUM(Orders[Amount])");
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("a very long script is limited by the box and never hangs", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(answerBox(page)).toHaveAttribute("maxlength", "3000");
    await openExercise(page, "dax-total-sales");
    await type(page, "Total Sales = " + "1+".repeat(300) + "1");
    await expect(verdictOf(page)).toHaveText("Not yet");
  });

  test("every lesson example runs on the page as the lesson says, and an edited example is recalculated", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const details = page.locator("details.lx-lesson");
    expect(await details.count()).toBe(lessons.length);
    const norm = (t) => t.replace(/\s+/g, " ").trim();
    const examples = [];
    for (let li = 0; li < lessons.length; li += 1) for (let ei = 0; ei < lessons[li].examples.length; ei += 1) examples.push([li, ei]);
    const printed = {};
    for (const [li, ei] of examples) printed[`${li}.${ei}`] = norm(await page.locator(`[data-example='${li}.${ei}']`).locator("[data-pb-out]").textContent());
    await page.evaluate(() => document.querySelectorAll("details.lx-lesson").forEach((d) => { d.open = true; }));
    for (const [li, ei] of examples) {
      const ex = page.locator(`[data-example='${li}.${ei}']`);
      await ex.locator("[data-pb-script]").fill(lessons[li].examples[ei].script);
      await ex.getByRole("button", { name: "Run" }).evaluate((b) => b.click());
      expect(norm(await ex.locator("[data-pb-out]").textContent()), `${lessons[li].id} ${ei}`).toBe(printed[`${li}.${ei}`]);
    }
    // an edited example
    const box = page.locator("[data-example='1.0']");
    await box.locator("[data-pb-script]").fill("change type Amount as text");
    await box.getByRole("button", { name: "Run" }).click();
    await expect(box.locator("[data-pb-out]")).toContainText("1,200");
    await box.locator("[data-pb-script]").fill("change type Nope as number");
    await box.getByRole("button", { name: "Run" }).click();
    await expect(box.locator("[data-pb-out]")).toContainText("no column named");
  });

  test("the report preview draws a real measure for each group and lists the values", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const out = page.locator("#pb-report-out");
    await expect(out.locator("svg[role=img]")).toHaveAttribute("aria-label", "Total Sales by Category");
    const table = out.getByRole("region", { name: "Values of Total Sales by Category" });
    await expect(table).toContainText("Electronics");
    await expect(table).toContainText("3300");
    await expect(table).toContainText("2550");
    await expect(table).toContainText("950");
    await page.locator("#pb-report-measure").selectOption("ytd");
    await page.locator("#pb-report-group").selectOption("month");
    await expect(out.locator("svg[role=img]")).toHaveAttribute("aria-label", "Sales YTD by Month");
    await expect(out.getByRole("region", { name: "Values of Sales YTD by Month" })).toContainText("3800");
  });

  test("the page states what the lab is and is not, and lists what it supports", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(page.locator("body")).toContainText("not Power BI");
    await expect(page.locator("body")).toContainText("What Is Real, Simulated and Conceptual");
    await expect(page.locator("body")).toContainText("SAMEPERIODLASTYEAR");
    await expect(page.locator("body")).toContainText("does not run the M language");
  });

  test("axe finds nothing at start, with a lesson open, after wrong and correct answers, on a model and on a measure", async ({ page, go }) => {
    test.skip(!fs.existsSync(AXE), "axe-core is not installed");
    await openLab(page, go, ROUTE);
    await page.addScriptTag({ path: AXE });
    const scan = async (label) => {
      const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
      expect(result.violations.map((v) => `${label}: ${v.id}`), label).toEqual([]);
    };
    await scan("start");
    await page.locator("details.lx-lesson summary").nth(5).click();
    await scan("a lesson open");
    await type(page, "uppercase Name");
    await scan("not yet");
    await type(page, "trim Name");
    await scan("correct");
    await openExercise(page, "model-star");
    await scan("a model exercise");
    await openExercise(page, "dax-total-sales");
    await type(page, "Total Sales = SUM(Orders[Amount])");
    await scan("a measure");
  });

  for (const width of [320, 390, 820, 1180]) {
    test(`layout at ${width}px: tables, an open lesson, the DAX exercise and the report preview cause no sideways scroll`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 900 });
      await openLab(page, go, ROUTE);
      await openExercise(page, "pq-project-orders");
      await type(page, set.exercises[indexOf("pq-project-orders") - 1].solution);
      await expect(verdictOf(page)).toHaveText("Correct");
      await page.locator("details.lx-lesson summary").nth(8).click();
      await expectNoHorizontalOverflow(page);
      await openExercise(page, "dax-ytd");
      await type(page, "Sales YTD = TOTALYTD([Total Sales], Date[Date])");
      await expect(verdictOf(page)).toHaveText("Correct");
      await expectNoHorizontalOverflow(page);
    });
  }

});
