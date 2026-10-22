/**
 * Tool Pack 30, S4: the Salary / CTC to In-Hand Calculator page in a real browser.
 *
 * Covered: the starting state (no Calculate button, nothing preselected, guidance instead of a figure); the result appearing by
 * itself after the pause, with focus staying where it was and one announcement; the PF basis changing the figure; the
 * "Out of date" label with the figures at 320, 360 and 390 px; Reset (including during a pause); a missing required choice; the
 * optional old-regime comparison being independent of the new-regime estimate; the CTC cap; Enter not leaving the page; tap
 * size and no horizontal overflow at 320 px; the related tool and back navigation.
 *
 * Every figure is the specification's (section 8, Cases A and B, hand-checked there and pinned against the independent oracle
 * in tests/unit/salary-in-hand-golden.test.mjs). The amounts are not computed by the page's own code.
 *   Case A: CTC 12,00,000, basic 50%, capped PF, gratuity yes, professional tax 2,400 -> new regime 10,96,754 a year, 91,396 a month;
 *           old regime (HRA, rent and other 80C all 0) -> 9,65,164 a year, 80,430 a month.
 *   Case B: the same with the full-basic PF -> 10,24,754 a year, 85,396 a month.
 *
 * Written to run on a GitHub-hosted runner (rulebook 10.13); it has not been run locally.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const PATH = "calculators/salary-in-hand/";
const results = (page) => page.locator("#sih-results");
const choose = (page, id) => page.locator(`label.sih-choice:has(#${id})`).click();
const resetButton = (page) => page.getByRole("button", { name: "Reset", exact: true });

async function open(page, go) {
  await go(PATH);
  await expect(page.locator("#sih-form")).toHaveAttribute("data-ready", "true");
}

/* Case A by the page's own controls: the amounts are typed one digit at a time, as a person would */
async function fillCaseA(page) {
  await page.locator("#sih-ctc").pressSequentially("1200000", { delay: 40 });
  await page.locator("#sih-basic").pressSequentially("50", { delay: 40 });
  await choose(page, "sih-pf-capped");
  await choose(page, "sih-gratuity-yes");
  await page.locator("#sih-pt").pressSequentially("2400", { delay: 40 });
}

/* records every non-empty text the live region takes, one entry per change */
async function recordLive(page) {
  await page.evaluate(() => {
    window.__live = [];
    const el = document.querySelector("#sih-live");
    new MutationObserver(() => { if (el.textContent) window.__live.push(el.textContent); }).observe(el, { childList: true, characterData: true, subtree: true });
  });
}
const liveLog = (page) => page.evaluate(() => window.__live);

test.describe("Salary / CTC to In-Hand Calculator @portable", () => {
  test("starting state: no Calculate button, Reset present, nothing chosen for the user, guidance in place of a figure", async ({ page, go, watch }) => {
    await open(page, go);
    await recordLive(page);
    await expect(page.getByRole("button", { name: "Calculate" })).toHaveCount(0);
    await expect(resetButton(page)).toBeVisible();
    await expect(page.locator("#sih-form input:checked")).toHaveCount(0);
    for (const id of ["sih-ctc", "sih-basic"]) await expect(page.locator(`#${id}`)).toHaveValue("");
    await expect(results(page)).toContainText("Enter your annual CTC, your basic salary share, how your PF is worked out and whether gratuity is in your CTC.");
    await expect(page.locator("#sih-result-heading")).toHaveCount(0);
    await expect(page.locator("#sih-old-fields")).toBeHidden();
    expect(await liveLog(page)).toEqual([]);
    expectClean(watch);
  });

  test("Case A by typing: no figure from half-typed digits; the estimate appears after the pause; focus stays; one announcement", async ({ page, go, watch }) => {
    await open(page, go);
    await recordLive(page);
    await choose(page, "sih-pf-capped");
    await choose(page, "sih-gratuity-yes");
    await page.locator("#sih-ctc").pressSequentially("1200000", { delay: 40 });
    await page.locator("#sih-basic").pressSequentially("50", { delay: 40 });
    await expect(page.locator("#sih-result-heading")).toHaveCount(0); // typed, but the pause has not passed
    expect(await liveLog(page)).toEqual([]);

    await page.locator("#sih-pt").pressSequentially("2400", { delay: 40 });
    await expect(results(page)).toContainText("₹91,396");
    await expect(results(page)).toContainText("₹10,96,754");
    await expect(page.locator("#sih-pt")).toBeFocused();
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");

    // the breakdown reconciles on the page: CTC, employer-side costs, gross, deductions, take-home
    const table = page.locator(".sih-table");
    await expect(table.locator("caption")).toContainText("From your CTC to your take-home");
    await expect(table).toContainText("Annual CTC");
    await expect(table).toContainText("₹12,00,000");
    await expect(table).toContainText("₹36,000"); // employer PF and the employee's PF
    await expect(table).toContainText("₹28,846"); // gratuity
    await expect(table).toContainText("₹11,35,154"); // gross
    await expect(page.locator(".sih-result")).toContainText("not an exact bank deposit");

    await expect.poll(async () => (await liveLog(page)).length, { timeout: 5000 }).toBe(1);
    expect((await liveLog(page))[0]).toContain("₹91,396");
    await page.waitForTimeout(1500);
    expect((await liveLog(page)).length, "no later duplicate").toBe(1);
    expectClean(watch);
  });

  test("changing the PF basis updates the figure (Case B) and never moves focus", async ({ page, go, watch }) => {
    await open(page, go);
    await fillCaseA(page);
    await expect(results(page)).toContainText("₹91,396");
    await choose(page, "sih-pf-full");
    await expect(results(page)).toContainText("₹85,396", { timeout: 5000 });
    await expect(results(page)).toContainText("₹10,24,754");
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");
    expectClean(watch);
  });

  test("a missing required choice holds the result: it says what is still needed and shows no figure", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#sih-ctc").fill("1200000");
    await page.locator("#sih-basic").fill("50");
    await choose(page, "sih-pf-capped");
    await expect(results(page)).toContainText("Still needed: whether gratuity is in your CTC.");
    await expect(page.locator("#sih-result-heading")).toHaveCount(0);
    await choose(page, "sih-gratuity-no");
    await expect(page.locator("#sih-result-heading")).toBeVisible();
  });

  test("the CTC cap: above ₹50,00,000 no figure is shown, with the reason", async ({ page, go }) => {
    await open(page, go);
    await fillCaseA(page);
    await expect(results(page)).toContainText("₹91,396");
    await page.locator("#sih-ctc").fill("6000000");
    await expect(results(page)).toContainText("up to ₹50,00,000", { timeout: 5000 });
    await expect(results(page)).not.toContainText("₹91,396");
  });

  test("the old-regime comparison is optional: incomplete or invalid it leaves the new-regime estimate; complete it adds its own figure", async ({ page, go }) => {
    await open(page, go);
    await fillCaseA(page);
    await expect(results(page)).toContainText("₹91,396");
    await expect(results(page)).not.toContainText("Old tax regime");

    await page.locator("#sih-old-toggle").check();
    await expect(page.locator("#sih-old-fields")).toBeVisible();
    await expect(results(page)).toContainText("Still needed for the old-regime figure", { timeout: 5000 });
    await expect(results(page)).toContainText("₹91,396"); // the new-regime estimate is untouched

    await page.locator("#sih-hra").fill("0");
    await page.locator("#sih-rent").fill("0");
    await page.locator("#sih-80c").fill("0");
    await expect(results(page)).toContainText("₹80,430", { timeout: 5000 });
    await expect(results(page)).toContainText("₹9,65,164");
    await expect(results(page)).toContainText("does not say which regime is better for you");

    await page.locator("#sih-hra").fill("9999999");
    await expect(page.locator("#sih-error-hra")).toBeVisible({ timeout: 5000 });
    await expect(results(page)).toContainText("The old-regime figure is not shown");
    await expect(results(page)).toContainText("₹91,396");

    // the city question appears only when both HRA and rent are above zero
    await page.locator("#sih-hra").fill("120000");
    await expect(page.locator("#sih-metro-group")).toBeHidden();
    await page.locator("#sih-rent").fill("240000");
    await expect(page.locator("#sih-metro-group")).toBeVisible();
  });

  test("Reset clears the form and the result, switches the old regime off, returns focus to the first field and announces once", async ({ page, go }) => {
    await open(page, go);
    await fillCaseA(page);
    await page.locator("#sih-old-toggle").check();
    await expect(results(page)).toContainText("₹91,396");
    await recordLive(page);
    await resetButton(page).click();
    await expect(page.locator("#sih-ctc")).toBeFocused();
    await expect(page.locator("#sih-ctc")).toHaveValue("");
    await expect(page.locator("#sih-form input:checked")).toHaveCount(0);
    await expect(page.locator("#sih-old-fields")).toBeHidden();
    await expect(results(page)).toContainText("Enter your annual CTC");
    await expect(page.locator("#sih-result-heading")).toHaveCount(0);
    await expect.poll(async () => (await liveLog(page)).length).toBe(1);
  });

  test("Reset during the pause cancels the pending calculation", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "sih-pf-capped");
    await choose(page, "sih-gratuity-yes");
    await page.locator("#sih-basic").fill("50");
    await page.locator("#sih-ctc").pressSequentially("1200000", { delay: 20 });
    await resetButton(page).click();
    await page.waitForTimeout(1200);
    await expect(page.locator("#sih-result-heading")).toHaveCount(0);
    await expect(page.locator("#sih-ctc")).toHaveValue("");
  });

  test("Enter in a field never leaves the page", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#sih-ctc").fill("1200000");
    await page.locator("#sih-ctc").press("Enter");
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(results(page)).toContainText("Still needed");
  });

  test("keyboard: the four questions are reachable in order and a choice can be made with the keys", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#sih-ctc").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#sih-basic")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#sih-pf-capped")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator("#sih-pf-capped")).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#sih-pf-full")).toBeChecked();
  });

  for (const [width, height] of [[320, 640], [360, 740], [390, 844]]) {
    test(`phone width ${width}px: an "Out of date" label sits with the old figures, which stay visible and dimmed; no horizontal overflow`, async ({ page, go }) => {
      await page.setViewportSize({ width, height });
      await open(page, go);
      await fillCaseA(page);
      await expect(results(page)).toContainText("₹91,396");
      await expect(page.locator(".sih-result [data-stale-badge]:visible")).toHaveCount(0);
      await page.locator("#sih-ctc").fill(""); // incomplete: the old result stays, labelled out of date

      await expect(page.locator("#sih-stale")).toContainText("out of date");
      await expect(results(page)).toHaveAttribute("data-stale", "true");
      const badge = page.locator(".sih-result [data-stale-badge]").first();
      await expect(badge).toBeVisible();
      await expect(badge).toContainText("Out of date");
      await expect(badge).toContainText("not your current estimate");
      const metrics = page.locator(".sih-metrics").first();
      await metrics.evaluate((el) => el.scrollIntoView({ block: "start" }));
      await page.evaluate(() => window.scrollBy(0, -120));
      const a = await metrics.boundingBox();
      const b = await badge.boundingBox();
      expect(a.y, "the figures are on screen").toBeGreaterThanOrEqual(0);
      expect(b.y, "the label starts on screen").toBeGreaterThanOrEqual(0);
      expect(b.y + b.height, "the label is directly above the figures").toBeLessThanOrEqual(a.y + 1);
      await expectNoHorizontalOverflow(page);

      await page.locator("#sih-ctc").fill("1200000");
      await expect(results(page)).not.toHaveAttribute("data-stale", "true", { timeout: 5000 });
      await expectNoHorizontalOverflow(page);
    });
  }

  test("320 px: controls are at least 44 px tall, the breakdown table fits, and nothing overflows", async ({ page, go }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page, go);
    await fillCaseA(page);
    await expect(results(page)).toContainText("₹91,396");
    for (const sel of ["#sih-ctc", "#sih-basic", "#sih-pt", "#sih-reset", "label.sih-choice:has(#sih-pf-capped) span", "label.sih-toggle"]) {
      const box = await page.locator(sel).first().boundingBox();
      expect(box.height, sel).toBeGreaterThanOrEqual(44);
    }
    const table = await page.locator(".sih-table-wrap").evaluate((el) => ({ client: el.clientWidth, scroll: el.scrollWidth }));
    expect(table.scroll, "the breakdown does not scroll sideways").toBeLessThanOrEqual(table.client + 1);
    await expectNoHorizontalOverflow(page);
  });

  test("the related tool is offered, and back returns to the calculator", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const link = page.locator(`.related-section a[href$="calculators/income-tax/"]`).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp("calculators/income-tax/$"));
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(page.locator("#sih-form")).toHaveAttribute("data-ready", "true");
    expect(siteRoot).toBeTruthy();
  });
});
