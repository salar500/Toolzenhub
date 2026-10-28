/**
 * Cron Challenge Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs) plus what is particular to this lab:
 * the stated dialect and UTC assumption, judging by schedule (not by spelling), the next three runs from a fixed
 * reference time, and engine errors. The exercises and the evaluator are pinned by
 * tests/unit/cron-challenge-lab.test.mjs (with a Python cron implementation as the independent oracle).
 */
import { test, expect } from "../helpers/test-base.mjs";
import { defineShellTests, openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";

const ROUTE = "tools/cron-challenge-lab/";

defineShellTests({
  route: ROUTE,
  title: "Cron Challenge Lab",
  count: 19,
  limit: 256,
  correct: "* * * * *",
  wrong: "0 * * * *"
});

test.describe("Cron Challenge Lab: this lab", () => {

  test("the dialect, the UTC assumption and the reference time are on the page", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(page.locator("body")).toContainText("Cronie");
    await expect(page.locator("body")).toContainText("Quartz has a seconds field");
    await expect(page.locator("body")).toContainText("times in UTC");
    await expect(page.getByText("Reference time for the run list: Tue 10 Mar 2026, 09:30 UTC.")).toBeVisible();
  });

  test("a different spelling of the same schedule is accepted", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await app(page).getByRole("button", { name: /^Exercise 4:/ }).click();
    await answerBox(page).fill("0,15,30,45 * * * *");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("a wrong valid expression says which parts differ and lists its next three runs from the reference time", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await app(page).getByRole("button", { name: /^Exercise 5:/ }).click();
    await answerBox(page).fill("0 8 * * 1-6");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("these parts differ: days");
    const runs = page.locator('.lx-feedback [aria-label="Details"]');
    await expect(runs).toContainText("Wed 11 Mar 2026, 08:00 UTC");
    await expect(runs).toContainText("Fri 13 Mar 2026, 08:00 UTC");
    await expect(page.locator(".lx-feedback")).not.toContainText("1-5");
  });

  test("the day-of-month or day-of-week rule: the 15th AND a Monday is the wrong reading", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await app(page).getByRole("button", { name: /^Exercise 13:/ }).click();
    await answerBox(page).fill("0 12 15 * *");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await answerBox(page).fill("0 12 15 * 1");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
    await expect(page.locator(".lx-explanation")).toContainText("either one matches");
  });

  test("an invalid expression is Cannot check with the engine message and completes nothing", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("61 * * * *");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback li").first()).toContainText("61 is outside 0 to 59");
    await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed");
  });

  test("every exercise can be solved: its own solution is accepted when shown and submitted", async ({ page, go }) => {
    test.setTimeout(120000);
    await openLab(page, go, ROUTE);
    for (let i = 1; i <= 19; i += 1) {
      await app(page).getByRole("button", { name: new RegExp(`^Exercise ${i}:`) }).click();
      await page.getByRole("button", { name: "Show solution" }).click();
      await answerBox(page).fill(await page.locator('[aria-label="Solution"]').innerText());
      await checkButton(page).click();
      await expect(verdictOf(page), `exercise ${i}`).toHaveText("Correct");
    }
  });

  test("the related tool is a plain link with nothing carried in the address", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const href = await page.locator('.lx-card a[href*="cron-expression-explainer"]').getAttribute("href");
    expect(href).toMatch(/tools\/cron-expression-explainer\/$/);
    expect(href).not.toMatch(/[?#]/);
  });

});
