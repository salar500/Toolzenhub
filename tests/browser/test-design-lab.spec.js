/**
 * Test Design Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs, run on the first exercise, a boundary one)
 * plus what is particular to this lab: roles named for missing values, extras, the partition selects, the stated scope,
 * and a phone layout for the partition exercises. The exercises and the evaluator are pinned by
 * tests/unit/test-design-lab.test.mjs (with a Python oracle over a generated corpus).
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { defineShellTests, openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";

const ROUTE = "tools/test-design-lab/";

defineShellTests({
  route: ROUTE,
  title: "Test Design Lab",
  count: 20,
  limit: 2000,
  correct: "17, 18, 65, 66",
  wrong: "18, 65"
});

const exercise = (page, n) => app(page).getByRole("button", { name: new RegExp(`^Exercise ${n}:`) }).click();

test.describe("Test Design Lab: this lab", () => {

  test("a boundary answer names what is missing by role, never by number", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("18, 65");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    const box = page.locator(".lx-feedback");
    await expect(box).toContainText("Required boundary values present: 2 of 4.");
    await expect(box).toContainText("Still missing: the value just below the valid range; the value just above the valid range.");
    await expect(box).not.toContainText("17");
    await expect(box).not.toContainText("66");
  });

  test("extra values are listed and do not make a complete answer wrong", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("66 65 40 18 17");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
    await expect(page.locator(".lx-feedback")).toContainText("Extra values (neither wrong nor needed): 40.");
  });

  test("text that is not a whole number is Cannot check and names the token", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("17, 18.5, 65");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback")).toContainText('"18.5"');
    await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed");
  });

  test("a partition exercise has a labelled choice for every value, and nothing is checked until all are placed", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await exercise(page, 11);
    await expect(page.getByRole("heading", { name: /^11\. Partitions: an age limit/ })).toBeFocused();
    await expect(app(page).locator("select")).toHaveCount(6);
    for (const v of [17, 18, 40, 65, 66, 0]) await expect(page.getByLabel(`Value ${v}`, { exact: true })).toBeVisible();
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback")).toContainText("Choose a partition for every value before checking.");
  });

  test("placing values: a wrong choice is Not yet with one word per value and a count; fixing it is Correct", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await exercise(page, 11);
    const place = async (v, label) => page.getByLabel(`Value ${v}`, { exact: true }).selectOption({ label });
    await place(17, "Too low (17 or less)");
    await place(18, "Accepted (18 to 65)");
    await place(40, "Accepted (18 to 65)");
    await place(65, "Accepted (18 to 65)");
    await place(66, "Accepted (18 to 65)"); // wrong
    await place(0, "Too low (17 or less)");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("5 of 6 values are in the right partition.");
    await expect(page.locator(".lx-feedback li")).toHaveText(["17: Correct", "18: Correct", "40: Correct", "65: Correct", "66: Not yet", "0: Correct"]);
    await expect(page.locator(".lx-feedback")).not.toContainText("Too high");
    // editing a choice removes the result
    await place(66, "Too high (66 or more)");
    await expect(page.locator(".lx-feedback")).toHaveCount(0);
    await expect(page.getByText("Your answer changed after the last check.")).toBeVisible();
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
    await expect(app(page).locator("[data-role=counts]")).toContainText("1 completed");
  });

  test("the choices are kept when moving to another exercise and back, and Reset clears them", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await exercise(page, 11);
    await page.getByLabel("Value 17", { exact: true }).selectOption({ label: "Too low (17 or less)" });
    await exercise(page, 12);
    await exercise(page, 11);
    await expect(page.getByLabel("Value 17", { exact: true })).toHaveValue("low");
    await page.getByRole("button", { name: "Reset exercise" }).click();
    await expect(page.getByLabel("Value 17", { exact: true })).toHaveValue("");
  });

  test("every boundary exercise and every partition exercise can be solved from its own solution", async ({ page, go }) => {
    test.setTimeout(180000);
    await openLab(page, go, ROUTE);
    for (let i = 1; i <= 20; i += 1) {
      await exercise(page, i);
      await page.getByRole("button", { name: "Show solution" }).click();
      const solution = await page.locator('[aria-label="Solution"]').innerText();
      if (i <= 10) {
        await answerBox(page).fill(solution);
      } else {
        for (const line of solution.split("\n")) {
          const [value, label] = [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 2)];
          await page.getByLabel(`Value ${value}`, { exact: true }).selectOption({ label });
        }
      }
      await checkButton(page).click();
      await expect(verdictOf(page), `exercise ${i}`).toHaveText("Correct");
    }
    await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed, 20 solution viewed, 0 not started");
  });

  test("the scope is stated: whole numbers only, two forms of boundary analysis, no certification or exam claim", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const body = page.locator("body");
    await expect(body).toContainText("Only whole numbers are covered");
    await expect(body).toContainText("Two forms of boundary value analysis are used, and each exercise says which");
    await expect(body).toContainText("not a certification and not preparation for any particular exam or syllabus");
    const text = await body.innerText();
    expect(text).not.toMatch(/exam-ready|guaranteed|pass your|ISTQB/i);
  });

  test("the partition selects fit a 320px phone: no sideways scroll, 44px controls, 16px text", async ({ page, go }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await openLab(page, go, ROUTE);
    await exercise(page, 15);
    await expectNoHorizontalOverflow(page);
    const selects = await app(page).locator("select:visible").all();
    expect(selects.length).toBe(9);
    for (const s of selects) {
      const box = await s.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(43.5);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
      expect(await s.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    }
    await checkButton(page).click();
    await expectNoHorizontalOverflow(page);
  });

  test("the console stays clean through a boundary check and a partition check", async ({ page, go, watch }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("1, 2");
    await checkButton(page).click();
    await exercise(page, 12);
    await checkButton(page).click();
    expectClean(watch);
  });

});
