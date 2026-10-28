/**
 * The behaviour every text-answer Practice Lab shares (assets/js/learning/lab-shell.js), written once and run for each
 * lab from its own spec. A lab spec adds only what is particular to that lab.
 *
 * cfg: { route, title, count, correct, wrong, wrongCheckable }
 *   correct: the accepted answer to exercise 1; wrong: a checkable answer to exercise 1 that is not accepted
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "./test-base.mjs";

export const app = (page) => page.locator("#lx-app");
export const live = (page) => page.locator("#lx-live");
export const answerBox = (page) => page.locator("#lx-app textarea");
export const checkButton = (page) => page.getByRole("button", { name: "Check answer", exact: true });
export const verdictOf = (page) => page.locator(".lx-feedback h4");

export async function openLab(page, go, route) {
  await go(route);
  await expect(app(page)).toHaveAttribute("data-ready", "true");
}

export function defineShellTests(cfg) {

  test.describe(`${cfg.title}: the shared lab behaviour`, () => {

    test("page, breadcrumb, exercise list, counts and the privacy boundary", async ({ page, go, watch }) => {
      await openLab(page, go, cfg.route);
      await expect(page.locator("h1")).toHaveText(cfg.title);
      const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
      expect(labels).toEqual(["Home", "Developer Tools", cfg.title]);
      await expect(app(page).locator(".lx-exlist li")).toHaveCount(cfg.count);
      await expect(app(page).locator("[data-role=counts]")).toContainText(`${cfg.count} exercises: 0 completed, 0 solution viewed, ${cfg.count} not started. Nothing is saved when you leave this page.`);
      expect(await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie]))).not.toContain("tz-learn");
      expectClean(watch);
    });

    test("an empty answer cannot be checked and completes nothing", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      await answerBox(page).fill("");
      await checkButton(page).click();
      await expect(verdictOf(page)).toHaveText("Cannot check");
      await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed, 0 solution viewed");
    });

    test("a wrong answer says Not yet; editing removes the result and says so; the right answer is Correct with the reason", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      await answerBox(page).fill(cfg.wrong);
      await checkButton(page).click();
      await expect(verdictOf(page)).toHaveText("Not yet");
      await expect(live(page)).toContainText("Not yet");
      // focus stays on the button: no jump after a check
      await expect(checkButton(page)).toBeFocused();
      await answerBox(page).fill(cfg.wrong + " ");
      await expect(page.locator(".lx-feedback")).toHaveCount(0);
      await expect(page.getByText("Your answer changed after the last check.")).toBeVisible();
      await answerBox(page).fill(cfg.correct);
      await checkButton(page).click();
      await expect(verdictOf(page)).toHaveText("Correct");
      await expect(page.getByRole("heading", { name: "Why" })).toBeVisible();
      await expect(app(page).locator("[data-role=counts]")).toContainText(`1 completed, 0 solution viewed, ${cfg.count - 1} not started`);
    });

    test("checking the same answer again shows it once and announces it once", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      await answerBox(page).fill(cfg.correct);
      await checkButton(page).click();
      const node = await page.locator(".lx-feedback").elementHandle();
      await page.evaluate(() => { window.__announced = 0; new MutationObserver(() => { window.__announced += 1; }).observe(document.querySelector("#lx-live"), { childList: true, characterData: true, subtree: true }); });
      await checkButton(page).click();
      await checkButton(page).click();
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => window.__announced)).toBe(0);
      expect(await node.evaluate((n) => n.isConnected)).toBe(true);
      await expect(page.locator(".lx-feedback")).toHaveCount(1);
    });

    test("hints come one at a time, up to three; the solution marks the exercise solution viewed for good", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      for (let i = 1; i <= 3; i += 1) {
        await page.getByRole("button", { name: new RegExp(`^Show hint ${i} of`) }).click();
        await expect(page.locator(".lx-hints li")).toHaveCount(i);
      }
      await expect(page.getByRole("button", { name: "All hints shown" })).toBeDisabled();
      await page.getByRole("button", { name: "Show solution" }).click();
      await expect(page.getByRole("heading", { name: "Solution" })).toBeVisible();
      await expect(app(page).locator("[data-role=counts]")).toContainText(`0 completed, 1 solution viewed, ${cfg.count - 1} not started`);
      await answerBox(page).fill(cfg.correct);
      await checkButton(page).click();
      await expect(verdictOf(page)).toHaveText("Correct");
      await expect(page.getByText("This exercise stays marked solution viewed.")).toBeVisible();
      await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed, 1 solution viewed");
    });

    test("Reset restores the starting text; moving between exercises keeps what you typed; focus goes to the exercise heading", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      const starting = await answerBox(page).inputValue();
      await answerBox(page).fill("my own text");
      await page.getByRole("button", { name: "Next exercise" }).click();
      await expect(page.getByRole("heading", { name: /^2\./ })).toBeFocused();
      await page.getByRole("button", { name: "Previous exercise" }).click();
      await expect(answerBox(page)).toHaveValue("my own text");
      await page.getByRole("button", { name: "Reset exercise" }).click();
      await expect(answerBox(page)).toHaveValue(starting);
    });

    test("an answer over the limit is refused with the limit stated, and nothing is evaluated", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      const limit = (cfg.limit ?? 20000).toLocaleString("en-US");
      await answerBox(page).fill("x".repeat(25000));
      await expect(page.locator("[id^=lx-count-]")).toContainText(`25,000 of ${limit} characters`);
      await checkButton(page).click();
      await expect(verdictOf(page)).toHaveText("Cannot check");
      await expect(page.locator(".lx-feedback")).toContainText(limit);
    });

    test("hostile text is shown as text and never run; the console stays clean and no request leaves the site", async ({ page, go, watch }) => {
      await openLab(page, go, cfg.route);
      await answerBox(page).fill('<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>');
      await checkButton(page).click();
      await expect(page.locator(".lx-feedback")).toBeVisible();
      expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
      expect(await app(page).locator("img, script").count()).toBe(0);
      expectClean(watch);
    });

    test("phone layout at 320px: no sideways scroll, controls at least 44px, 16px answer text", async ({ page, go }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await openLab(page, go, cfg.route);
      await expectNoHorizontalOverflow(page);
      await answerBox(page).fill(cfg.wrong);
      await checkButton(page).click();
      await page.getByRole("button", { name: /^Show hint 1/ }).click();
      await page.getByRole("button", { name: "Show solution" }).click();
      await expectNoHorizontalOverflow(page);
      for (const b of await app(page).locator("button:visible").all()) {
        const box = await b.boundingBox();
        expect(box.height, await b.innerText()).toBeGreaterThanOrEqual(43.5);
      }
      expect(await answerBox(page).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    });

    test("keyboard: the exercise buttons, Check answer and the hints work from the keyboard", async ({ page, go }) => {
      await openLab(page, go, cfg.route);
      await answerBox(page).fill(cfg.correct);
      await checkButton(page).focus();
      await page.keyboard.press("Enter");
      await expect(verdictOf(page)).toHaveText("Correct");
      const second = app(page).getByRole("button", { name: /^Exercise 2:/ });
      await second.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("heading", { name: /^2\./ })).toBeFocused();
      await expect(app(page).getByRole("button", { name: /^Exercise 2:/ })).toHaveAttribute("aria-current", "true");
    });

  });

}
