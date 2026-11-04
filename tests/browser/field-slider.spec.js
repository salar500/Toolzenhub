/**
 * Shared slider beside a bounded number field (rate, years): ui/field-slider.js, opted in by 19 fields in 11
 * calculators. The number input stays the source of truth; these tests check the real browser behaviour of the
 * link between the two, on three representatives (EMI: a solver whose modes hide a field; FD: a field whose slider
 * range is narrower than its limits; GST: a rate with a half-point step).
 * The pure range rules are in tests/unit/field-slider.test.mjs. NOT covered: a physical touch screen.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const slider = (page, id) => page.locator(`input.calculator-form__slider[data-slider-for="${id}"]`);

test.describe("slider beside a number field", () => {
  test("EMI: sliders for the loan amount, rate and tenure, hidden from assistive technology and out of the tab order, none for the derived EMI", async ({ page, go, watch }) => {
    await go("calculators/emi/");
    await expect(slider(page, "emi-rate")).toHaveCount(1);
    await expect(slider(page, "emi-years")).toHaveCount(1);
    await expect(slider(page, "emi-loan")).toHaveCount(1);
    await expect(page.locator("input.calculator-form__slider")).toHaveCount(3);
    await expect(slider(page, "emi-rate")).toHaveAttribute("aria-hidden", "true");
    await expect(slider(page, "emi-rate")).toHaveAttribute("tabindex", "-1");
    await expect(page.getByLabel("Interest Rate")).toHaveCount(1); // the slider adds no second control with the same name
    await expect(slider(page, "emi-rate")).toHaveAttribute("min", "1");
    await expect(slider(page, "emi-rate")).toHaveAttribute("max", "20");
    await expect(slider(page, "emi-rate")).toHaveAttribute("step", "0.1");
    expectClean(watch);
  });

  test("moving the slider sets the number and recalculates, as if the value had been typed", async ({ page, go }) => {
    await go("calculators/emi/");
    const before = await page.locator("#emi-results").innerText();
    await slider(page, "emi-rate").fill("12");
    await expect(page.locator("#emi-rate")).toHaveValue("12");
    await expect(page.locator("#emi-results")).not.toHaveText(before);
  });

  test("typing a number moves the slider; a value outside the slider range pins the thumb and leaves the number alone", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.locator("#emi-rate").fill("7.5");
    await expect(slider(page, "emi-rate")).toHaveValue("7.5");
    await page.locator("#emi-rate").fill("25");
    await expect(slider(page, "emi-rate")).toHaveValue("20");
    await expect(page.locator("#emi-rate")).toHaveValue("25");
    await page.locator("#emi-rate").fill("");
    await expect(slider(page, "emi-rate")).toHaveValue("1"); // an empty number puts the thumb at the start
  });

  test("a focused slider (a click gives it focus) answers the arrow keys, Home and End", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.locator("#emi-years").fill("10");
    await slider(page, "emi-years").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#emi-years")).toHaveValue("11");
    await page.keyboard.press("End");
    await expect(page.locator("#emi-years")).toHaveValue("30");
    await page.keyboard.press("Home");
    await expect(page.locator("#emi-years")).toHaveValue("1");
  });

  test("a field a solver hides takes its slider with it, and the slider comes back with the field", async ({ page, go }) => {
    await go("calculators/emi/");
    await page.getByRole("radio", { name: "Find the tenure" }).check();
    await expect(page.locator("#emi-years")).toBeHidden();
    await expect(slider(page, "emi-years")).toBeHidden();
    await page.getByRole("radio", { name: "Find the EMI" }).check();
    await expect(slider(page, "emi-years")).toBeVisible();
  });

  test("Reset: the slider follows the restored value", async ({ page, go }) => {
    await go("calculators/emi/");
    const start = await page.locator("#emi-rate").inputValue();
    await slider(page, "emi-rate").fill("15");
    await expect(page.locator("#emi-rate")).toHaveValue("15");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#emi-rate")).toHaveValue(start);
    await expect(slider(page, "emi-rate")).toHaveValue(start);
  });

  test("FD: the years slider covers 1 to 10 only; 20 typed is accepted by the field and shown at the end of the slider", async ({ page, go }) => {
    await go("calculators/fd/");
    await expect(slider(page, "fd-years")).toHaveAttribute("max", "10");
    await slider(page, "fd-years").fill("3");
    await expect(page.locator("#fd-years")).toHaveValue("3");
    await page.locator("#fd-years").fill("20");
    await expect(slider(page, "fd-years")).toHaveValue("10");
    await expect(page.locator("#fd-years")).toHaveValue("20");
    await expect(slider(page, "fd-rate")).toHaveAttribute("max", "12");
  });

  test("GST: the rate slider moves in half points from 0 to 28", async ({ page, go }) => {
    await go("calculators/gst/");
    await expect(slider(page, "gst-rate-1")).toHaveAttribute("step", "0.5");
    await slider(page, "gst-rate-1").fill("18");
    await expect(page.locator("#gst-rate-1")).toHaveValue("18");
    await slider(page, "gst-rate-1").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#gst-rate-1")).toHaveValue("18.5");
  });

  test("no overflow at 320, 360 and 390 px with a slider on the page", async ({ page, go }) => {
    for (const width of [320, 360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await go("calculators/emi/");
      await expect(slider(page, "emi-rate")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("calculators that did not opt in have no slider (Percentage, Risk-Reward); SIP has one per bounded field and amount", async ({ page, go }) => {
    await go("calculators/percentage/");
    await expect(page.locator("input.calculator-form__slider")).toHaveCount(0);
    await go("calculators/risk-reward/");
    await expect(page.locator("input.calculator-form__slider")).toHaveCount(0);
    await go("calculators/sip/");
    await expect(slider(page, "sip-years")).toHaveCount(1);
    await expect(slider(page, "sip-amount")).toHaveCount(1);
    await expect(page.locator("input.calculator-form__slider").first()).toBeVisible();
  });
});
