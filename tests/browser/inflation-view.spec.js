/**
 * Calculators Ecosystem 2.0, pack 48: the optional inflation view in the SIP and SWP calculators.
 *
 * Reference values were worked out independently (python -I): SIP, 10,000 a month, 10% a year (annual/12, start of month),
 * 15 years = 41,79,242.66; at 6% inflation that is 41,79,242.66 / 1.06^15 = 17,43,851.94. SWP, 80,000 a month for 25 years
 * with no increase: the last-year withdrawal is still 80,000, which is 80,000 / 1.06^24 = 19,758.28 in today's money.
 */
import { test, expect, expectClean } from "../helpers/test-base.mjs";

const metric = (page, tool, label) =>
  page.locator(`#${tool}-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

test.describe("Inflation view: SIP", () => {
  test("the field is optional and empty by default, and the default result has no inflation block", async ({ page, go, watch }) => {
    await go("calculators/sip/");
    await page.locator("#sip-results .calculator-results__value").first().waitFor();
    await expect(page.locator("#sip-inflation")).toHaveValue("");
    await expect(page.getByLabel("Expected Inflation (optional)")).toHaveCount(1);
    await expect(page.locator("#sip-inflation-view")).toHaveCount(0);
    await expect(metric(page, "sip", "Estimated value")).toHaveText("₹41,79,243");
    expectClean(watch);
  });

  test("an inflation rate adds today's-money figures and leaves the existing figures unchanged", async ({ page, go }) => {
    await go("calculators/sip/");
    await page.locator("#sip-results .calculator-results__value").first().waitFor();
    await page.locator("#sip-inflation").fill("6");
    const view = page.locator("#sip-inflation-view");
    await expect(view).toBeVisible();
    await expect(view).toContainText("₹17,43,852");
    await expect(view).toContainText("about 3.77% a year after inflation"); // (1.10 / 1.06) - 1
    await expect(view).toContainText("not a forecast");
    await expect(metric(page, "sip", "Estimated value")).toHaveText("₹41,79,243");
    await expect(metric(page, "sip", "Total invested")).toHaveText("₹18,00,000");
    // the print summary carries the assumption and the figure
    const print = await page.locator(".sip-print-inputs").evaluate((e) => e.textContent);
    expect(print).toContain("Assumed inflation");
    expect(print).toContain("₹17,43,852");
    // clearing the field takes the block away again
    await page.locator("#sip-inflation").fill("");
    await expect(page.locator("#sip-inflation-view")).toHaveCount(0);
  });

  test("an invalid inflation rate is reported for its own field and removes the result", async ({ page, go }) => {
    await go("calculators/sip/");
    await page.locator("#sip-results .calculator-results__value").first().waitFor();
    for (const bad of ["31", "-1", "5.255"]) {
      await page.locator("#sip-inflation").fill(bad);
      await expect(page.locator("#sip-results-error")).toContainText("Expected inflation must be from 0% to 30%");
      await expect(page.locator("#sip-inflation")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#sip-amount")).not.toHaveAttribute("aria-invalid", /.+/);
    }
    await page.locator("#sip-inflation").fill("6");
    await expect(page.locator("#sip-results-error")).toHaveCount(0);
    await expect(page.locator("#sip-inflation-view")).toBeVisible();
  });

  test("the announcement includes today's money and Reset clears the field", async ({ page, go }) => {
    await go("calculators/sip/");
    await page.locator("#sip-results .calculator-results__value").first().waitFor();
    await page.locator("#sip-inflation").fill("6");
    await expect(page.locator("#sip-live")).toContainText("In today's money that is about ₹17,43,852, if prices rise 6% a year.");
    await page.locator("#sip-reset").click();
    await expect(page.locator("#sip-inflation")).toHaveValue("");
    await expect(page.locator("#sip-inflation-view")).toHaveCount(0);
  });
});

test.describe("Inflation view: SWP", () => {
  test("the field is optional, empty by default and shown for every question", async ({ page, go }) => {
    await go("calculators/swp/");
    await page.locator("#swp-results .calculator-results__value").first().waitFor();
    await expect(page.locator("#swp-inflation")).toHaveValue("");
    await expect(page.locator("#swp-inflation-view")).toHaveCount(0);
    for (const name of ["How long will my corpus last?", "How much can I withdraw?", "What corpus do I need?"]) {
      await page.getByRole("radio", { name }).check();
      await expect(page.locator("#swp-inflation")).toBeVisible();
    }
  });

  test("What corpus do I need: the final-year withdrawal in today's money is 80,000 / 1.06^24", async ({ page, go }) => {
    await go("calculators/swp/");
    await page.locator("#swp-results .calculator-results__value").first().waitFor();
    await page.getByRole("radio", { name: "What corpus do I need?" }).check();
    await page.locator("#swp-inflation").fill("6");
    await expect(metric(page, "swp", "Final-year withdrawal in today's money")).toHaveText("₹19,758 a month");
    const view = page.locator("#swp-inflation-view");
    await expect(view).toContainText("in year 25 would buy about ₹19,758 a month");
    await expect(view).toContainText("not a forecast");
    await expect(page.locator("#swp-live")).toContainText("In today's money, final-year withdrawal is about ₹19,758 a month.");
  });

  test("with a yearly increase the final-year figure uses both rates (80,000 x 1.05^24 / 1.06^24)", async ({ page, go }) => {
    await go("calculators/swp/");
    await page.locator("#swp-results .calculator-results__value").first().waitFor();
    await page.getByRole("radio", { name: "What corpus do I need?" }).check();
    await page.locator("#swp-increase").fill("5");
    await page.locator("#swp-inflation").fill("6");
    await expect(metric(page, "swp", "Final-year withdrawal in today's money")).toHaveText("₹63,722 a month");
  });

  test("existing figures are unchanged by the view, and an invalid rate names its own field", async ({ page, go }) => {
    await go("calculators/swp/");
    await page.locator("#swp-results .calculator-results__value").first().waitFor();
    await page.getByRole("radio", { name: "What corpus do I need?" }).check();
    const before = await metric(page, "swp", "Estimated corpus needed").textContent();
    await page.locator("#swp-inflation").fill("6");
    await expect(metric(page, "swp", "Estimated corpus needed")).toHaveText(before);
    await page.locator("#swp-inflation").fill("45");
    await expect(page.locator("#swp-results-error")).toContainText("Expected inflation must be from 0% to 30%");
    await expect(page.locator("#swp-inflation")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#swp-reset").click();
    await expect(page.locator("#swp-inflation")).toHaveValue("");
    await expect(page.locator("#swp-inflation-view")).toHaveCount(0);
  });
});
