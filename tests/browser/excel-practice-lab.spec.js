/**
 * Excel Practice Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs, with the formula box in place of the text area)
 * plus what is particular to it: every stated solution is accepted by the real page, a typed-in answer and a missing dollar sign
 * are refused with the right reason, errors and unreadable formulas are explained, the lessons' examples calculate (and can be
 * edited), and the free sheet and the copy demonstration work. Nothing leaves the browser.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { defineShellTests, openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";
import { set } from "../../assets/js/tools/excel-practice-lab/exercises.js";
import { lessons } from "../../assets/js/tools/excel-practice-lab/lessons.js";

const ROUTE = "tools/excel-practice-lab/";
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

defineShellTests({
  route: ROUTE,
  title: "Excel Practice Lab",
  count: 55,
  customInput: true,
  correct: "=B2*B3",
  wrong: "=B2+B3"
});

async function type(page, formula) {
  await answerBox(page).fill(formula);
  await checkButton(page).click();
}

test.describe("Excel Practice Lab: this lab", () => {

  test("every one of the 55 solutions is accepted on the real page @portable", async ({ page, go }) => {
    test.setTimeout(240000);
    await openLab(page, go, ROUTE);
    const failures = [];
    for (let i = 0; i < set.exercises.length; i += 1) {
      await type(page, set.exercises[i].solution);
      const word = await verdictOf(page).innerText();
      if (word !== "Correct") failures.push(`${set.exercises[i].id}: ${word} ${await page.locator(".lx-feedback").innerText()}`);
      if (i < set.exercises.length - 1) await page.getByRole("button", { name: "Next exercise" }).click();
    }
    expect(failures).toEqual([]);
  });

  test("the sheet is shown with the cells to fill marked, and the formula box is labelled", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(app(page).getByRole("region", { name: /The sheet for this exercise/ })).toBeVisible();
    await expect(app(page).locator("td.lx-cell--mark")).toHaveText("?");
    await expect(app(page).getByLabel("Your formula for B4")).toBeVisible();
  });

  test("a typed-in answer is refused for not following the numbers", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await type(page, "=1350");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("not when the numbers change");
  });

  test("a missing dollar sign is caught when the formula is copied down, and the learner's own values are shown", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await app(page).getByRole("button", { name: /^Exercise 4:/ }).click();
    await type(page, "=A4*B1");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("copied down and across");
    await expect(page.locator(".lx-feedback")).toContainText("#VALUE!");
    await expect(page.locator('.lx-feedback [aria-label="Details"]')).toContainText("B4: 18");
    await type(page, "=A4*$B$1");
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("unreadable formulas, no equals sign, errors and unsupported functions are each explained", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await type(page, "B2*B3");
    await expect(page.locator(".lx-feedback")).toContainText("starts with an equals sign");
    await type(page, "=B2*(B3");
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback")).toContainText("bracket");
    await type(page, "=B2/0");
    await expect(page.locator(".lx-feedback")).toContainText("#DIV/0!");
    await type(page, "=TODAY()");
    await expect(page.locator(".lx-feedback")).toContainText("does not support the function TODAY");
  });

  test("a very long formula is refused without hanging, and the box limits what can be typed", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(answerBox(page)).toHaveAttribute("maxlength", "500");
    await answerBox(page).fill("=" + "1+".repeat(2000) + "1");
    expect((await answerBox(page).inputValue()).length).toBeLessThanOrEqual(500);
  });

  test("every lesson example calculates on the page as the lesson says, and an edited formula is recalculated", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const details = page.locator("details.lx-lesson");
    expect(await details.count()).toBe(lessons.length);
    const norm = (t) => t.replace(/\s+/g, " ").trim();
    const printed = {};
    for (let li = 0; li < lessons.length; li += 1) {
      for (let ei = 0; ei < lessons[li].examples.length; ei += 1) printed[`${li}.${ei}`] = norm(await page.locator(`[data-example='${li}.${ei}']`).locator("[data-xl-out]").textContent());
    }
    const first = details.nth(0);
    await first.locator("summary").click();
    const box = first.locator("[data-example='0.1']");
    await box.getByLabel(/Formula in B4/).fill("=B2+B3");
    await box.getByRole("button", { name: "Calculate" }).click();
    await expect(box.locator("[data-xl-out]")).toContainText("B4: 453");
    await box.getByLabel(/Formula in B4/).fill("=B2*(B3");
    await box.getByRole("button", { name: "Calculate" }).click();
    await expect(box.locator("[data-xl-out]")).toContainText("bracket");
    await page.evaluate(() => document.querySelectorAll("details.lx-lesson").forEach((d) => { d.open = true; }));
    for (let li = 0; li < lessons.length; li += 1) {
      for (let ei = 0; ei < lessons[li].examples.length; ei += 1) {
        const ex = page.locator(`[data-example='${li}.${ei}']`);
        await ex.getByLabel(/^Formula in/).fill(lessons[li].examples[ei].formula);
        await ex.getByRole("button", { name: "Calculate" }).evaluate((b) => b.click());
        expect(norm(await ex.locator("[data-xl-out]").textContent()), `${lessons[li].id} ${ei}`).toBe(printed[`${li}.${ei}`]);
      }
    }
  });

  test("the free sheet recalculates as you type, shows errors, and clears", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const out = page.locator("#xl-play-out");
    await expect(out).toContainText("1469");
    await page.getByLabel("Cell B2", { exact: true }).fill("100");
    await expect(out).toContainText("1200");
    await page.getByLabel("Cell E1", { exact: true }).fill("=1/0");
    await expect(out).toContainText("#DIV/0!");
    await page.getByRole("button", { name: "Clear the sheet" }).click();
    await expect(out.locator("td.lx-cell--number")).toHaveCount(0);
  });

  test("the copy demonstration moves relative references and keeps absolute ones", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await page.locator("#xl-copy-formula").fill("=$A1*B$2+C3");
    await page.locator("#xl-copy-down").fill("2");
    await page.locator("#xl-copy-right").fill("1");
    await expect(page.locator("#xl-copy-out")).toHaveText("=$A3*C$2+D5");
    await page.locator("#xl-copy-formula").fill("=A1");
    await page.locator("#xl-copy-down").fill("-1");
    await expect(page.locator("#xl-copy-out")).toHaveText("=#REF!");
  });

  test("the page states what the lab is and is not, and lists the functions it supports", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(page.locator("body")).toContainText("not Microsoft Excel");
    await expect(page.locator("body")).toContainText("A function that is not on this list gives #NAME?");
    await expect(page.locator("body")).toContainText("XLOOKUP");
  });

  test("axe finds nothing at start, with a lesson open, after wrong and correct answers, and on an error", async ({ page, go }) => {
    test.skip(!fs.existsSync(AXE), "axe-core is not installed");
    await openLab(page, go, ROUTE);
    await page.addScriptTag({ path: AXE });
    const scan = async (label) => {
      const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
      expect(result.violations.map((v) => `${label}: ${v.id}`), label).toEqual([]);
    };
    await scan("start");
    await page.locator("details.lx-lesson summary").nth(1).click();
    await scan("a lesson open");
    await type(page, "=B2+B3");
    await scan("not yet");
    await type(page, "=B2*B3");
    await scan("correct");
    await type(page, "=B2/0");
    await scan("an error");
  });

  for (const width of [320, 390, 820, 1180]) {
    test(`layout at ${width}px: a wide sheet, an open lesson and the free sheet cause no sideways scroll`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 900 });
      await openLab(page, go, ROUTE);
      await app(page).getByRole("button", { name: /^Exercise 5:/ }).click();
      await type(page, "=$A2*B$1");
      await expect(verdictOf(page)).toHaveText("Correct");
      await page.locator("details.lx-lesson summary").nth(8).click();
      await expectNoHorizontalOverflow(page);
    });
  }

});
