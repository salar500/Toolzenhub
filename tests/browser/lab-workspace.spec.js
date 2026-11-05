/**
 * The workspace list of the shared lab shell, in the three long labs (SQL 49, Excel 55, Power BI 43 exercises): grouped by topic with titles,
 * a search, the current exercise marked, a direct jump to any exercise, answers kept while switching, and nothing marked done by opening.
 * Wide screens keep the list open beside the exercise; narrow ones fold it into one summary and close it after a choice.
 * The small labs (under twelve exercises) keep the plain row of numbers; that is covered by their own specs.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";

const LABS = [
  { route: "tools/sql-practice-lab/", count: 49, first: "Every column of a table", search: "joins", topic: "Joins", correct: "SELECT * FROM customers;" },
  { route: "tools/excel-practice-lab/", count: 55 },
  { route: "tools/power-bi-practice-lab/", count: 43 }
];

const heading = (page) => app(page).locator(".lx-lab-stage h3.lx-title");
const picker = (page) => app(page).locator("details.lx-picker");

test.describe("Practice lab workspace list", () => {

  for (const lab of LABS) {
    test(`${lab.route}: grouped list, titles, jump to the first, a middle and the last exercise`, async ({ page, go }) => {
      await openLab(page, go, lab.route);
      await expect(app(page)).toHaveClass(/lx-workspace/);
      await expect(app(page).locator(".lx-exlist li")).toHaveCount(lab.count);
      expect(await app(page).locator(".lx-exgroup").count()).toBeGreaterThan(2);
      await expect(app(page).locator(".lx-exbtn__title").first()).not.toBeEmpty();
      if (await picker(page).evaluate((d) => !d.open)) await picker(page).locator("summary").click();
      for (const n of [lab.count, Math.ceil(lab.count / 2), 1]) {
        await app(page).locator(`li[data-index="${n - 1}"] button`).click();
        await expect(heading(page)).toHaveText(new RegExp(`^${n}\. `));
        await expect(app(page).locator('.lx-exbtn[aria-current="true"]')).toHaveCount(1);
        if (await picker(page).evaluate((d) => !d.open)) await picker(page).locator("summary").click();
      }
      await expectNoHorizontalOverflow(page);
    });
  }

  test("search narrows the list, a number finds one exercise, no match says so, clearing restores all", async ({ page, go }) => {
    await openLab(page, go, LABS[0].route);
    if (await picker(page).evaluate((d) => !d.open)) await picker(page).locator("summary").click();
    const box = page.getByLabel("Find an exercise by number, title or topic");
    await box.fill("joins");
    const shown = await app(page).locator(".lx-exgroups li:not([hidden])").count();
    expect(shown).toBeGreaterThanOrEqual(5);
    expect(shown).toBeLessThan(49);
    await expect(app(page).locator(".lx-exgroup:not([hidden])")).toHaveCount(1);
    await box.fill("12");
    await expect(app(page).locator(".lx-exgroups li:not([hidden])")).toHaveCount(1);
    await box.fill("zzzz-nothing");
    await expect(app(page).locator(".lx-exgroups li:not([hidden])")).toHaveCount(0);
    await expect(app(page).getByText("No exercise matches.")).toBeVisible();
    await box.fill("");
    await expect(app(page).locator(".lx-exgroups li:not([hidden])")).toHaveCount(49);
  });

  test("answers are kept when switching; opening an exercise completes nothing; a checked one shows Done in the list", async ({ page, go }) => {
    await openLab(page, go, LABS[0].route);
    if (await picker(page).evaluate((d) => !d.open)) await picker(page).locator("summary").click();
    await answerBox(page).fill("SELECT 1 /* kept */");
    await app(page).locator('li[data-index="30"] button').click();
    await expect(heading(page)).toHaveText(/^31\. /);
    await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed, 0 solution viewed, 48 not started");
    if (await picker(page).evaluate((d) => !d.open)) await picker(page).locator("summary").click();
    await app(page).locator('li[data-index="0"] button').click();
    await expect(answerBox(page)).toHaveValue("SELECT 1 /* kept */");
    await answerBox(page).fill(LABS[0].correct);
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct", { timeout: 20000 });
    if (await picker(page).evaluate((d) => !d.open)) await picker(page).locator("summary").click();
    await expect(app(page).locator('li[data-index="0"] .lx-exbtn__state')).toHaveText("Done");
    await expect(app(page).locator("[data-role=counts]")).toContainText("1 completed");
  });

  test("previous and next move one exercise and the list follows", async ({ page, go }) => {
    await openLab(page, go, LABS[0].route);
    await page.getByRole("button", { name: "Next exercise" }).click();
    await expect(heading(page)).toHaveText(/^2\. /);
    await page.getByRole("button", { name: "Previous exercise" }).click();
    await expect(heading(page)).toHaveText(/^1\. /);
    await expect(app(page).locator('li[data-index="0"] .lx-exbtn[aria-current="true"]')).toHaveCount(1);
  });

  test("layout: open beside the exercise on a wide screen; folded and closed after a choice on a narrow one", async ({ page, go }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openLab(page, go, LABS[0].route);
    await expect(picker(page)).toHaveJSProperty("open", true);
    const side = await app(page).locator(".lx-sidebar").boundingBox();
    const main = await app(page).locator(".lx-lab-stage").boundingBox();
    expect(side.x + side.width).toBeLessThanOrEqual(main.x + 1);
    expect(await app(page).locator(".lx-exgroups").evaluate((e) => e.scrollHeight > e.clientHeight)).toBe(true);
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(picker(page)).toHaveJSProperty("open", false);
    await picker(page).locator("summary").click();
    await app(page).locator('li[data-index="20"] button').click();
    await expect(heading(page)).toHaveText(/^21\. /);
    await expect(picker(page)).toHaveJSProperty("open", false);
    await expect(picker(page).locator("summary")).toContainText("Exercise 21 of 49");
    await expectNoHorizontalOverflow(page);
  });

});
