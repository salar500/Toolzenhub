/**
 * Calculators Ecosystem 2.0, Stage 3: the changed calculators at the five required widths.
 * Checks: no horizontal page scroll; every visible button, select and text input (including the dense XIRR rows) is at
 * least 44 px tall; shared info summaries at least 24 px; range sliders excluded (see ledger). Run on subpath-desktop only because the
 * width is set here.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const WIDTHS = [320, 360, 390, 768, 1180];
const PAGES = [
  ["calculators/xirr/", "#xirr-form"],
  ["calculators/emi/", "#emi-form"],
  ["calculators/ppf/", "#ppf-form"],
  ["calculators/loan-comparison/", "#a-amount"]
];

test.describe("Stage 3 responsive: changed calculators", () => {
  for (const [url, form] of PAGES) {
    for (const width of WIDTHS) {
      test(`${url} at ${width}px: no horizontal scroll, target sizes`, async ({ page, go }) => {
        await page.setViewportSize({ width, height: 800 });
        await go(url);
        await page.locator(form).first().waitFor();
        await expectNoHorizontalOverflow(page);
        const small = await page.evaluate(() => {
          const out = [];
          for (const el of document.querySelectorAll("main button, main select, main input:not([type=hidden]):not([type=checkbox]):not([type=radio]), main summary")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === "hidden") continue;
            // The shared "calculator-info" accordion summaries (26 px) are held to the WCAG 2.2 AA minimum of 24 px; everything else must
            // reach 44 px. Range sliders are not measured here: the Loan Comparison sliders are 18 px high (a pre-existing shared design
            // recorded as a finding in the ledger, not changed in Stage 3).
            if (el.type === "range") continue;
            const shared = el.tagName === "SUMMARY" && el.closest(".calculator-info");
            const need = shared ? 24 : 44;
            if (r.height < need - 0.5) out.push(`${el.tagName.toLowerCase()}#${el.id} ${Math.round(r.height)}px < ${need}`);
          }
          return out;
        });
        expect(small, "targets under 44px").toEqual([]);
      });
    }
  }
});
