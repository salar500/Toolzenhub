/**
 * DQ1 — shared visual quality of tool pages: buttons, focus and headings are one system (components/buttons.css,
 * base/accessibility.css, calculators/calculator-base.css), so EMI, Loan Comparison and Loan Prepayment must agree.
 *
 * Colours are read from the computed styles and compared with the brand tokens' values (brand green #0b9f58,
 * the accessible action green #087f47, the disabled pair #eaecf0 / #98a2b3) written here as literals.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const TOOLS = [
  // page, primary button (or null), secondary button, ready selector
  ["calculators/emi/", "button[type=submit].calculator-form__button", "#emi-reset", "#emi-results .calculator-results__value"],
  ["calculators/loan-comparison/", "#compare-loans", "#reset-loans", "#comparison-result"],
  ["calculators/prepayment/", null, "#prepay-reset", "#prepay-results .calculator-results__value"],
  ["calculators/balance-transfer/", null, "#bt-reset", "#bt-results .calculator-results__value"],
  ["calculators/sip/", null, "#sip-reset", "#sip-results .calculator-results__value"],
  ["calculators/margin/", null, "#margin-reset", "#margin-results .calculator-results__value"],
  ["calculators/profit/", null, "#profit-reset", "#profit-results .calculator-results__value"],
  ["calculators/home-loan/", null, "#home-loan-reset", "#home-loan-results .calculator-results__value"],
  ["calculators/fd/", null, "#fd-reset", "#fd-results .calculator-results__value"],
  ["calculators/gst/", null, "#gst-reset", "#gst-results .calculator-results__value"],
];

const BRAND_GREEN = "rgb(11, 159, 88)"; // the brand green: focus ring, section rule (not text inside a control)
const ACTION_GREEN = "rgb(8, 127, 71)"; // controls: white text on it is 5.08:1
const WHITE = "rgb(255, 255, 255)";
const DISABLED_BG = "rgb(234, 236, 240)";
const DISABLED_TEXT = "rgb(152, 162, 179)";

const style = (locator, props) => locator.evaluate((e, p) => Object.fromEntries(p.map((k) => [k, getComputedStyle(e)[k]])), props);

test.describe("tool buttons are one system across EMI, Loan Comparison and Loan Prepayment", () => {
  for (const [path, primary, secondary, ready] of TOOLS) {
    test(`${path}: secondary looks enabled, primary is solid green`, async ({ page, go }) => {
      await go(path);
      await page.locator(ready).first().waitFor();
      const button = page.locator(secondary);
      await expect(button).toHaveClass(/calculator-form__button--secondary/);
      const s = await style(button, ["backgroundColor", "color", "borderTopColor", "borderTopWidth", "cursor"]);
      expect(s.backgroundColor, "white, not grey").toBe(WHITE);
      expect(s.color).toBe(ACTION_GREEN);
      expect(s.borderTopColor, "a green outline").toBe(ACTION_GREEN);
      expect(parseFloat(s.borderTopWidth)).toBeGreaterThanOrEqual(1);
      expect(s.cursor).toBe("pointer");
      if (primary) {
        const p = await style(page.locator(primary), ["backgroundColor", "color", "cursor"]);
        expect(p).toEqual({ backgroundColor: ACTION_GREEN, color: WHITE, cursor: "pointer" });
      }
    });

    test(`${path}: hover is visible, and keyboard focus is a distinct ring`, async ({ page, go }) => {
      await go(path);
      await page.locator(ready).first().waitFor();
      const button = page.locator(secondary);
      await button.scrollIntoViewIfNeeded();
      const rest = await style(button, ["backgroundColor"]);
      await button.hover();
      await expect.poll(async () => (await style(button, ["backgroundColor"])).backgroundColor).not.toBe(rest.backgroundColor);
      await page.mouse.move(0, 0);
      await button.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      const f = await style(button, ["outlineStyle", "outlineWidth", "outlineColor"]);
      expect(f.outlineStyle).toBe("solid");
      expect(parseFloat(f.outlineWidth)).toBeGreaterThanOrEqual(2);
      expect(f.outlineColor).toBe(BRAND_GREEN);
    });
  }

  test("a disabled button is unmistakable: flat grey, not-allowed cursor, no outline, whatever its role", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.locator("#prepay-reset").waitFor();
    const read = await page.evaluate(() => {
      const out = {};
      for (const [name, classes] of [["primary", "calculator-form__button"], ["secondary", "calculator-form__button calculator-form__button--secondary"]]) {
        const b = document.createElement("button");
        b.className = classes;
        b.textContent = name;
        b.disabled = true;
        document.body.appendChild(b);
        const c = getComputedStyle(b);
        out[name] = { backgroundColor: c.backgroundColor, color: c.color, cursor: c.cursor, borderTopColor: c.borderTopColor, boxShadow: c.boxShadow };
        b.remove();
      }
      return out;
    });
    for (const role of ["primary", "secondary"]) {
      expect(read[role].backgroundColor, role).toBe(DISABLED_BG);
      expect(read[role].color, role).toBe(DISABLED_TEXT);
      expect(read[role].cursor, role).toBe("not-allowed");
      expect(read[role].borderTopColor, role).toBe(DISABLED_BG);
      expect(read[role].boxShadow, role).toBe("none");
    }
    // and the enabled secondary is nothing like it
    const enabled = await style(page.locator("#prepay-reset"), ["backgroundColor", "color", "cursor"]);
    expect(enabled.backgroundColor).not.toBe(DISABLED_BG);
    expect(enabled.color).not.toBe(DISABLED_TEXT);
    expect(enabled.cursor).not.toBe("not-allowed");
  });

  test("Loan Comparison: the schedule dialog's buttons and the schedule link are shared buttons with a focus ring", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await page.locator("#compare-loans").click();
    const link = page.locator(".loan-view-link").first();
    await expect(link).toBeVisible();
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    expect((await style(link, ["outlineStyle"])).outlineStyle).toBe("solid");
    await link.click();
    const pdf = page.locator("[data-download-amortization-pdf]");
    const close = page.locator(".loan-amortization-footer [data-close-amortization]");
    await expect(pdf).toBeVisible();
    await expect(pdf).toHaveClass(/calculator-form__button(?!--)/);
    await expect(close).toHaveClass(/calculator-form__button--secondary/);
    expect((await style(pdf, ["backgroundColor"])).backgroundColor).toBe(ACTION_GREEN);
    expect((await style(close, ["backgroundColor"])).backgroundColor).toBe(WHITE);
  });
});

test.describe("heading hierarchy", () => {
  test("EMI and Loan Prepayment: a green rule marks each section title", async ({ page, go }) => {
    for (const path of ["calculators/emi/", "calculators/prepayment/", "calculators/balance-transfer/", "calculators/sip/", "calculators/margin/", "calculators/profit/", "calculators/home-loan/", "calculators/fd/", "calculators/gst/"]) {
      await go(path);
      const rule = await page.locator(".calculator-section__title").first().evaluate((e) => {
        const c = getComputedStyle(e, "::after");
        return { width: c.width, height: c.height, background: c.backgroundColor };
      });
      expect(rule, path).toEqual({ width: "36px", height: "3px", background: BRAND_GREEN });
    }
  });

  test("Loan Comparison: information titles share one size (no oversized 'Things to Consider' / 'FAQs')", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    const sizes = await page.locator(".loan-info-card h2, .loan-content-card h2").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(sizes.length).toBeGreaterThanOrEqual(5);
    expect(new Set(sizes)).toEqual(new Set([19]));
  });

  test("Loan Prepayment: sub-section titles are clearly smaller than section titles and larger than body text", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.locator("#prepay-results .calculator-results__value").first().waitFor();
    const size = (selector) => page.locator(selector).first().evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    const [h1, section, sub, body] = [await size("h1"), await size(".calculator-section__title"), await size(".prepay-subtitle"), await size(".calculator-section__description")];
    expect(h1).toBeGreaterThan(section);
    expect(section).toBeGreaterThan(sub);
    expect(sub).toBeGreaterThan(body);
  });

  test("none of this breaks the layout: no sideways scroll on any of the three tools", async ({ page, go }) => {
    for (const [path] of TOOLS) {
      await go(path);
      await expectNoHorizontalOverflow(page);
    }
  });
});
