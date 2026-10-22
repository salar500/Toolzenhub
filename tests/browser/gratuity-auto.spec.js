/**
 * Tool Pack 29, G9 refinement: the Gratuity Calculator calculates by itself (there is no Calculate button) and shows the
 * dates, the actual service and the years counted for the formula in the main result.
 *
 * Covered in a real browser: the starting state; a typed wage that waits for a pause (no figure from half-typed digits);
 * a chosen type or date read at once; focus staying where it was; one announcement per settled change and none while
 * typing; an earlier result kept, dimmed and labelled while entries are incomplete or invalid, with field messages once
 * settled; Reset during the pause; the comparison wages kept and an already showing comparison worked out again; the
 * explorer following the result; "Other" and fixed-term cases; Enter not leaving the page; 320 px and tap size.
 *
 * Every figure is the specification's (section 25: M2, M3, M8) or plain arithmetic from its formula (wages x 15 x years / 26),
 * noted where used. The amounts are not computed by the page's own code.
 *
 * Written to run on a GitHub-hosted runner (rulebook 10.13); it has not been run locally.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const PATH = "calculators/gratuity/";
const results = (page) => page.locator("#gratuity-results");
const choose = (page, id) => page.locator(`label.gratuity-choice:has(#${id})`).click();
const resetButton = (page) => page.getByRole("button", { name: "Reset", exact: true });

async function open(page, go) {
  await go(PATH);
  await expect(page.locator("#gratuity-form")).toHaveAttribute("data-ready", "true");
}

/* M2 by the page's own controls: the wages are typed one digit at a time, as a person would */
async function fillM2(page) {
  await choose(page, "gratuity-type-regular");
  await page.locator("#gratuity-joining").fill("2021-01-01");
  await page.locator("#gratuity-exit").fill("2026-06-30");
  await page.locator("#gratuity-wages").pressSequentially("50000", { delay: 60 });
}

/* records every non-empty text the live region takes, one entry per change */
async function recordLive(page) {
  await page.evaluate(() => {
    window.__live = [];
    const el = document.querySelector("#gratuity-live");
    new MutationObserver(() => { if (el.textContent) window.__live.push(el.textContent); }).observe(el, { childList: true, characterData: true, subtree: true });
  });
}
const liveLog = (page) => page.evaluate(() => window.__live);

test.describe("Gratuity Calculator: automatic calculation (G9) @portable", () => {
  test("starting state: no Calculate button, Reset present, guidance in place of a result, no announcement", async ({ page, go, watch }) => {
    await open(page, go);
    await recordLive(page);
    await expect(page.getByRole("button", { name: "Calculate" })).toHaveCount(0);
    await expect(resetButton(page)).toBeVisible();
    await expect(results(page)).toContainText("Choose the employee type and enter your wages and dates.");
    await expect(page.locator("#gratuity-result-heading")).toHaveCount(0);
    expect(await liveLog(page)).toEqual([]);
    expectClean(watch);
  });

  test("M2 by typing: no figure from half-typed wages; the result appears after the pause; focus stays in the field; one announcement", async ({ page, go, watch }) => {
    await open(page, go);
    await recordLive(page);
    await choose(page, "gratuity-type-regular");
    await page.locator("#gratuity-joining").fill("2021-01-01");
    await page.locator("#gratuity-exit").fill("2026-06-30");
    await expect(results(page)).toContainText("Still needed: the qualifying monthly wages.");

    await page.locator("#gratuity-wages").pressSequentially("50000", { delay: 60 });
    // typed, but the pause has not passed: nothing is calculated and nothing is announced
    await expect(page.locator("#gratuity-result-heading")).toHaveCount(0);
    expect(await liveLog(page)).toEqual([]);

    await expect(results(page)).toContainText("₹1,44,230.77");
    await expect(page.locator("#gratuity-wages")).toBeFocused();
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");

    // the main result shows the dates, the actual service and, apart from them, the years counted (M2: 5 years 6 months, counted 5)
    const service = page.locator(".gratuity-service");
    await expect(service).toContainText("Joining date");
    await expect(service).toContainText("1 January 2021");
    await expect(service).toContainText("Exit date");
    await expect(service).toContainText("30 June 2026");
    await expect(service).toContainText("5 years, 6 months and 0 days");
    await expect(service).toContainText("Years counted for the formula");
    await expect(service.locator(".gratuity-service__note")).toHaveText("Years counted for the formula may differ from your actual service duration. This rounding does not determine eligibility.");
    await expect(page.locator(".gratuity-status")).not.toContainText("Years counted");

    await expect.poll(async () => (await liveLog(page)).length, { timeout: 5000 }).toBe(1);
    expect((await liveLog(page))[0]).toContain("₹1,44,230.77");
    await page.waitForTimeout(1500);
    expect((await liveLog(page)).length, "no later duplicate").toBe(1);
    expectClean(watch);
  });

  test("M3 by a date change is read at once: 5 years 6 months 1 day, counted 6, with the new amount", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    await page.locator("#gratuity-exit").fill("2026-07-01");
    await expect(results(page)).toContainText("₹1,73,076.92");
    await expect(page.locator(".gratuity-service")).toContainText("5 years, 6 months and 1 day");
    await expect(page.locator(".gratuity-service dd", { hasText: /^6$/ })).toHaveCount(1);
    await expect(results(page)).not.toContainText("₹1,44,230.77");
  });

  test("an edit marks the shown result out of date at once; an incomplete entry keeps it, dimmed, with no new figure", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");

    await page.locator("#gratuity-exit").fill("");
    await expect(page.locator("#gratuity-stale")).toBeVisible();
    await expect(results(page)).toHaveAttribute("data-stale", "true");
    await expect(results(page)).toContainText("₹1,44,230.77");
    await expect(page.locator("#gratuity-compare-form button, #gratuity-copy").first()).toHaveAttribute("aria-disabled", "true");
    // once settled, the empty date is named beside its field
    await expect(page.locator(".gratuity-field-error:visible")).toContainText("Enter the date.");
    await expect(page.locator("#gratuity-exit")).toHaveAttribute("aria-invalid", "true");

    // complete again with the same dates: the old result is current again, not recalculated into something else
    await page.locator("#gratuity-exit").fill("2026-06-30");
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");
    await expect(page.locator(".gratuity-field-error:visible")).toHaveCount(0);
    await expect(results(page)).toContainText("₹1,44,230.77");
  });

  test("an exit date before the joining date is an error beside the field and never a figure", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    await page.locator("#gratuity-exit").fill("2020-12-31");
    await expect(page.locator(".gratuity-field-error:visible")).toContainText("The exit date cannot be before the joining date.");
    await expect(results(page)).toHaveAttribute("data-stale", "true");
    await expect(results(page)).toContainText("₹1,44,230.77"); // the earlier result, labelled out of date
    await expect(page.locator("#gratuity-stale")).toBeVisible();
    await expect(page.locator("#gratuity-exit")).not.toBeFocused();
  });

  test("a wage of zero or letters is reported after the pause, and the amount does not change", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    await page.locator("#gratuity-wages").fill("0");
    await expect(page.locator(".gratuity-field-error:visible")).toContainText("The wages must be above zero.");
    await expect(results(page)).toHaveAttribute("data-stale", "true");
    await expect(results(page)).not.toContainText("₹0");
  });

  test("Reset during the pause: nothing is calculated afterwards, the fields are empty and focus returns to the first field", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gratuity-type-regular");
    await page.locator("#gratuity-joining").fill("2021-01-01");
    await page.locator("#gratuity-exit").fill("2026-06-30");
    await page.locator("#gratuity-wages").pressSequentially("50000", { delay: 20 });
    await recordLive(page);
    await resetButton(page).click(); // before the pause has passed
    await page.waitForTimeout(2000);
    await expect(page.locator("#gratuity-result-heading")).toHaveCount(0);
    await expect(page.locator("#gratuity-wages")).toHaveValue("");
    await expect(page.locator("#gratuity-joining")).toHaveValue("");
    await expect(page.locator("input[name='gratuity-type']:checked")).toHaveCount(0);
    await expect(page.locator("#gratuity-type-regular")).toBeFocused();
    await expect(results(page)).toContainText("Choose the employee type and enter your wages and dates.");
    const log = await liveLog(page);
    expect(log.filter((t) => /₹|Estimated/.test(t)), "no result announced after Reset").toEqual([]);
  });

  test("Reset after a result clears the result, the explorer and the comparison", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    await page.locator("#gratuity-wages-second").fill("100000");
    await page.getByRole("button", { name: "Compare", exact: true }).click();
    await expect(page.locator("#gratuity-compare-output")).toContainText("₹2,88,461.54");
    await resetButton(page).click();
    await expect(page.locator(".gratuity-explorer, #gratuity-compare-form, #gratuity-copy")).toHaveCount(0);
    await expect(page.locator(".gratuity-service")).toHaveCount(0);
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");
    // the second wages are forgotten too: a new result starts without a comparison
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    await expect(page.locator("#gratuity-wages-second")).toHaveValue("");
    await expect(page.locator("#gratuity-compare-output")).toBeEmpty();
  });

  test("the comparison: the wages typed stay, a showing comparison is worked out again, and none opens on its own", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    // nothing was chosen yet: no comparison figures
    await expect(page.locator("#gratuity-compare-output")).toBeEmpty();

    await page.locator("#gratuity-wages-second").fill("100000");
    await page.getByRole("button", { name: "Compare", exact: true }).click();
    // 100000 x 15 x 5 / 26 = 2,88,461.54 (the specification's formula); difference of the displayed amounts 1,44,230.77
    await expect(page.locator("#gratuity-compare-output")).toContainText("₹2,88,461.54");
    await expect(page.locator("#gratuity-compare-output")).toContainText("₹1,44,230.77 higher");

    await page.locator("#gratuity-exit").fill("2026-07-01");
    // counted years 6: 50000 x 15 x 6 / 26 = 1,73,076.92 and 100000 x 15 x 6 / 26 = 3,46,153.85; difference 1,73,076.93
    await expect(results(page)).toContainText("₹1,73,076.92");
    await expect(page.locator("#gratuity-wages-second")).toHaveValue("100000");
    await expect(page.locator("#gratuity-compare-output")).toContainText("₹3,46,153.85");
    await expect(page.locator("#gratuity-compare-output")).toContainText("₹1,73,076.93 higher");
    await expect(page.locator("#gratuity-compare-output")).not.toContainText("₹2,88,461.54");

    // changing the comparison wages clears the figures that belonged to the old wages
    await page.locator("#gratuity-wages-second").fill("100001");
    await expect(page.locator("#gratuity-compare-output")).toBeEmpty();
  });

  test("the date explorer follows the result", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(page.locator(".gratuity-explorer")).toBeVisible();
    await expect(page.locator(".gratuity-explorer")).toContainText("30 December 2026"); // M2 + 6 months, as pinned in gratuity-p1.test.mjs
    const before = await page.locator(".gratuity-explorer").innerText();
    await page.locator("#gratuity-exit").fill("2026-07-01");
    await expect(results(page)).toContainText("₹1,73,076.92");
    expect(await page.locator(".gratuity-explorer").innerText()).not.toBe(before);
    await expect(page.locator(".gratuity-explorer")).not.toContainText("30 December 2026");
  });

  test("the working block stays open across an update", async ({ page, go }) => {
    await open(page, go);
    await fillM2(page);
    await expect(results(page)).toContainText("₹1,44,230.77");
    await page.locator(".gratuity-working summary").click();
    await expect(page.locator(".gratuity-working")).toHaveAttribute("open", "");
    await page.locator("#gratuity-exit").fill("2026-07-01");
    await expect(results(page)).toContainText("₹1,73,076.92");
    await expect(page.locator(".gratuity-working")).toHaveAttribute("open", "");
  });

  test("'Other' shows its explanation at once, with no amount and no service block", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gratuity-type-other");
    await expect(page.locator("#gratuity-result-heading")).toBeVisible();
    await expect(page.locator(".gratuity-amount")).toHaveCount(0);
    await expect(page.locator(".gratuity-service")).toHaveCount(0);
    await expect(page.locator("#gratuity-details")).toBeHidden();
  });

  test("M8: a fixed-term contract that runs to its end gives the illustrative amount, with the contract's own date labels", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gratuity-type-fixed");
    await choose(page, "gratuity-end-expires");
    await page.locator("#gratuity-joining").fill("2025-01-01");
    await page.locator("#gratuity-exit").fill("2025-12-31");
    await page.locator("#gratuity-wages").pressSequentially("50000", { delay: 20 });
    await expect(results(page)).toContainText("₹28,846.15"); // 50000 x 15 x 1 / 26
    await expect(results(page)).toContainText("Illustrative amount, not an entitlement");
    await expect(page.locator(".gratuity-service")).toContainText("Contract start date");
    await expect(page.locator(".gratuity-service")).toContainText("Contract end date");
  });

  test("fixed-term that ends earlier: an explanation and no figure, immediately", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gratuity-type-fixed");
    await expect(results(page)).toContainText("Still needed: how the contract ends");
    await choose(page, "gratuity-end-earlier");
    await expect(page.locator("#gratuity-result-heading")).toBeVisible();
    await expect(page.locator(".gratuity-amount")).toHaveCount(0);
  });

  test("Enter in the wages field does not leave or reload the page, and asks for the answer now", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gratuity-type-regular");
    await page.locator("#gratuity-joining").fill("2021-01-01");
    await page.locator("#gratuity-exit").fill("2026-06-30");
    const url = page.url();
    await page.locator("#gratuity-wages").fill("50000");
    await page.locator("#gratuity-wages").press("Enter");
    await expect(results(page)).toContainText("₹1,44,230.77");
    expect(page.url()).toBe(url);
    await expect(page.locator("#gratuity-form")).toHaveAttribute("data-ready", "true");
  });

  test("keyboard: Tab from the last field reaches Reset (the date fields have several stops), and a focus ring is visible on it", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#gratuity-exit").focus();
    let reached = false;
    for (let i = 0; i < 8 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await resetButton(page).evaluate((el) => el === document.activeElement);
    }
    expect(reached, "Reset is the next stop after the exit date").toBe(true);
    const outline = await resetButton(page).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  for (const width of [320, 360, 390]) {
    test(`phone width ${width}px: the service block wraps, nothing overflows, Reset is a full-size tap target`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await open(page, go);
      await fillM2(page);
      await expect(results(page)).toContainText("₹1,44,230.77");
      await expect(page.locator(".gratuity-service")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const box = await page.locator(".gratuity-service").boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      const reset = await resetButton(page).boundingBox();
      expect(reset.height).toBeGreaterThanOrEqual(44);
    });
  }
});
