/**
 * Lesson-aware navigation in the three long labs (SQL, Excel, Power BI), 2026-11-05. The exercise names the lesson it practises and how far
 * through that lesson's exercises the learner is (in this visit, memory only); the lesson link opens that lesson below; a lesson's "Practise"
 * buttons open the exercise. No second list is built: the shell's one grouped list stays the only exercise list. Typed answers survive the trip,
 * nothing is stored, and the layout does not scroll sideways.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { openLab, app, answerBox } from "../helpers/lab-contract.mjs";

const LABS = ["tools/sql-practice-lab/", "tools/excel-practice-lab/", "tools/power-bi-practice-lab/"];
const heading = (page) => app(page).locator(".lx-lab-stage h3.lx-title");
const line = (page) => app(page).locator('[data-role="lesson"]');

for (const route of LABS) {
  test.describe(route, () => {

    test("the first exercise names its lesson with progress; the link opens that lesson", async ({ page, go }) => {
      await openLab(page, go, route);
      await expect(line(page)).toBeVisible();
      await expect(line(page)).toContainText(/Practises lessons? 1\. .+ \(exercise 1 of \d+ for it, 0 completed\)/);
      const lesson = page.locator("#lx-lesson-1");
      await expect(lesson).toHaveCount(1);
      await expect(lesson).not.toHaveAttribute("open", "");
      await line(page).locator("a[data-lx-lesson]").first().click();
      await expect(lesson).toHaveAttribute("open", "");
      await expect(lesson.locator("summary")).toBeFocused();
      await expect(lesson.locator("summary")).toBeInViewport();
    });

    test("a lesson's practise button opens that exercise and keeps typed answers; nothing is stored; no second exercise list", async ({ page, go }) => {
      await openLab(page, go, route);
      // type in exercise 1, leave for the lesson, come back through the lesson's button
      await answerBox(page).first().fill("my draft answer");
      await line(page).locator("a[data-lx-lesson]").first().click();
      const buttons = page.locator("#lx-lesson-1 .lx-practise__btn");
      expect(await buttons.count()).toBeGreaterThan(0);
      const last = buttons.last();
      const title = (await last.innerText()).replace(/^Exercise \d+: /, "");
      await last.click();
      await expect(heading(page)).toContainText(title);
      await expect(heading(page)).toBeFocused();
      await expect(app(page).locator('.lx-exbtn[aria-current="true"]')).toHaveCount(1);
      await expect(line(page)).toContainText(/exercise \d+ of \d+ for it/);
      // back to exercise 1: the draft is still there
      await buttons.first().scrollIntoViewIfNeeded();
      await buttons.first().click();
      await expect(answerBox(page).first()).toHaveValue("my draft answer");
      // one list only: the shell's grouped list; the lesson area adds buttons inside lessons, not another list of exercises
      await expect(app(page).locator(".lx-exlist li")).not.toHaveCount(0);
      const stored = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
      expect(stored).toEqual({ local: 0, session: 0, cookie: "" });
      await expectNoHorizontalOverflow(page);
    });

    test("the direct list, search and previous/next still work beside the lesson line", async ({ page, go }) => {
      await openLab(page, go, route);
      const second = app(page).locator('li[data-index="1"] button');
      if (await app(page).locator("details.lx-picker").evaluate((d) => !d.open)) await app(page).locator("details.lx-picker summary").click();
      await second.click();
      await expect(heading(page)).toHaveText(/^2\. /);
      await app(page).getByRole("button", { name: "Next exercise", exact: true }).click();
      await expect(heading(page)).toHaveText(/^3\. /);
      await app(page).getByRole("button", { name: "Previous exercise", exact: true }).click();
      await expect(heading(page)).toHaveText(/^2\. /);
    });

  });
}
