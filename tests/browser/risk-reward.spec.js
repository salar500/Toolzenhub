/**
 * Tool Pack 51: Risk-Reward and Position Size Calculator.
 *
 * Expected figures are worked by hand: long 100 / 95 / 110 risks 5 and gains 10 per unit (ratio 1 : 2, break-even
 * win rate 1/3); 1% of 100,000 is 1,000, which buys 200 units (loss 1,000, gain 2,000, value 20,000). The exact
 * arithmetic is pinned by tests/unit/risk-reward.test.mjs; this file covers what only a browser shows.
 * NOT covered: any physical phone.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const results = (page) => page.locator("#rr-results");
const metric = (page, label) =>
  page.locator(`#rr-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

async function open(page, go) {
  await go("calculators/risk-reward/");
  await expect(page.locator("#rr-form")).toBeVisible();
}

async function fill(page, entry, stop, target, account = "", risk = "") {
  await page.locator("#rr-entry").fill(entry);
  await page.locator("#rr-stop").fill(stop);
  await page.locator("#rr-target").fill(target);
  await page.locator("#rr-account").fill(account);
  await page.locator("#rr-risk-percent").fill(risk);
}

test.describe("Risk-Reward Calculator", () => {
  test("page shell: one h1, breadcrumb, an empty prompt, no external request", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText(/Risk.Reward/);
    await expect(page.locator("h1")).toHaveCount(1);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs[0]).toBe(siteRoot);
    await expect(results(page)).toContainText("Enter the entry, stop-loss and target");
    expectClean(watch);
  });

  test("a long trade: ratio, break-even rate, per-unit figures and the position size", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "100", "95", "110", "100000", "1");
    await expect(metric(page, "Risk-reward ratio")).toHaveText(/^\s*1 : 2(\.00)?\s*$/);
    await expect(metric(page, "Break-even win rate (ignoring costs)")).toHaveText(/^\s*33\.33%/);
    await expect(metric(page, "Risk per unit")).toContainText("5");
    await expect(metric(page, "Reward per unit")).toContainText("10");
    await expect(metric(page, "Quantity (whole units)")).toHaveText("200");
    await expect(metric(page, "Amount you accept losing")).toHaveText(/^\s*1,000(\.00)?\s*$/);
    await expect(metric(page, "Loss if the stop is hit")).toHaveText(/^\s*1,000(\.00)?\s*$/);
    await expect(metric(page, "Gain if the target is hit")).toHaveText(/^\s*2,000(\.00)?\s*$/);
    await expect(metric(page, "Position value")).toContainText("20,000");
  });

  test("a short trade gives the same figures when stop and target sit on the other sides", async ({ page, go }) => {
    await open(page, go);
    await page.getByRole("radio", { name: /short/i }).check();
    await fill(page, "100", "105", "90", "100000", "1");
    await expect(metric(page, "Risk-reward ratio")).toHaveText(/^\s*1 : 2(\.00)?\s*$/);
    await expect(metric(page, "Quantity (whole units)")).toHaveText("200");
  });

  test("a stop on the wrong side of a long trade is refused with a message and no figures", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "100", "105", "110");
    await expect(page.locator("#rr-results-error, #rr-results [role='alert']").first()).toBeVisible();
    await expect(metric(page, "Risk-reward ratio")).toHaveCount(0);
    await expect(page.locator("#rr-stop")).toHaveAttribute("aria-invalid", "true");
  });

  test("whole units round down: 1% of 1,000 at a risk of 7 buys 1 unit, not 1.43", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "100", "93", "121", "1000", "1");
    await expect(metric(page, "Quantity (whole units)")).toHaveText("1");
  });

  test("Reset clears the fields and the results; keyboard reaches Reset and Copy", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "100", "95", "110", "100000", "1");
    await expect(metric(page, "Risk-reward ratio")).toBeVisible();
    await page.locator("#rr-reset").focus();
    await page.keyboard.press("Enter");
    for (const id of ["#rr-entry", "#rr-stop", "#rr-target", "#rr-account", "#rr-risk-percent"]) await expect(page.locator(id)).toHaveValue("");
    await expect(metric(page, "Risk-reward ratio")).toHaveCount(0);
    await expect(results(page)).toContainText("Enter the entry, stop-loss and target");
    await expect(page.locator("#rr-copy")).toBeVisible();
  });

  test("Copy puts the summary on the clipboard", async ({ page, go, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await open(page, go);
    await fill(page, "100", "95", "110", "100000", "1");
    await page.locator("#rr-copy").click();
    const text = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
    if (text !== null) expect(text).toMatch(/1 : 2/);
    await expect(page.locator("#rr-live")).not.toHaveText("");
  });

  test("320, 360, 390 px and desktop: no horizontal overflow, with results showing", async ({ page, go }) => {
    for (const width of [320, 360, 390, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await open(page, go);
      await fill(page, "100", "95", "110", "100000", "1");
      await expect(metric(page, "Quantity (whole units)")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });
});
