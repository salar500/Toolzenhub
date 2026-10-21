/**
 * TEMPORARY (Tool Pack 29, G6 verification; not for main): the Gratuity Calculator page in real Chrome.
 * Runs on the subpath-desktop project; the phone widths are set inside the tests (320, 360 and 390 px).
 *
 * Covered: load without runtime errors; Calculate; heading focus; one live announcement; the explorer; Compare by click and
 * by Enter; Copy with a successful, a rejected and a missing Clipboard API; the out-of-date state; Reset; breadcrumb and
 * related tools; labels, groups, error associations, keyboard use and visible focus; and the three phone widths.
 *
 * Not covered, and not claimed: screen readers, Safari/WebKit, Firefox, Android or iOS devices.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const PATH = "calculators/gratuity/";
const results = (page) => page.locator("#gratuity-results");
const live = (page) => page.locator("#gratuity-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const choose = (page, id) => page.locator(`label.gratuity-choice:has(#${id})`).click();

async function open(page, go) {
  await go(PATH);
  await expect(page.locator("#gratuity-form")).toHaveAttribute("data-ready", "true");
}

async function fillRegular(page, { wages = "50000", join = "2021-01-01", exit = "2026-06-30" } = {}) {
  await choose(page, "gratuity-type-regular");
  await page.locator("#gratuity-wages").fill(wages);
  await page.locator("#gratuity-joining").fill(join);
  await page.locator("#gratuity-exit").fill(exit);
}

async function calculate(page, inputs) {
  await fillRegular(page, inputs);
  await btn(page, "Calculate").click();
  await expect(page.locator("#gratuity-result-heading")).toBeVisible();
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

const stubClipboard = (mode) => `(() => {
  window.__copied = [];
  const mode = ${JSON.stringify(mode)};
  const clip = mode === "missing" ? undefined
    : mode === "reject" ? { writeText: () => Promise.reject(new Error("denied")) }
    : { writeText: (t) => { window.__copied.push(t); return Promise.resolve(); } };
  Object.defineProperty(navigator, "clipboard", { value: clip, configurable: true });
})();`;

test.describe("Gratuity Calculator in a browser (G6)", () => {

  test("loads clean; one h1; labelled controls; groups; breadcrumb and related tools", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Gratuity Calculator");
    await expect(page.getByRole("group", { name: "Employee Type" })).toBeVisible();
    await expect(page.getByLabel("Qualifying Monthly Wages")).toBeVisible();
    await expect(page.getByLabel("Joining Date")).toBeVisible();
    await expect(page.getByLabel("Exit Date")).toBeVisible();
    await expect(page.locator("input[name='gratuity-type']:checked")).toHaveCount(0);
    await expect(page.locator("#gratuity-end-group")).toBeHidden();
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("Gratuity Calculator");
    const related = await page.locator(".related-calculator-card").evaluateAll((l) => l.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(related).toContain(`${siteRoot}calculators/income-tax/`);
    expectClean(watch);
  });

  test("Calculate: heading focus, the figure, one announcement and no later duplicate; the explorer rows", async ({ page, go, watch }) => {
    await open(page, go);
    await fillRegular(page);
    await recordLive(page);
    await btn(page, "Calculate").click();
    await expect(page.locator("#gratuity-result-heading")).toBeFocused();
    await expect(results(page)).toContainText("Estimated gratuity (subject to the conditions stated)");
    await expect(results(page)).toContainText("₹1,44,230.77");
    await expect(results(page)).toContainText("Whether you are eligible also depends");
    await page.waitForTimeout(700);
    const log = await liveLog(page);
    expect(log, "exactly one announcement after Calculate").toHaveLength(1);
    expect(log[0]).toContain("₹1,44,230.77");
    // explorer: regular, valid
    const rows = page.locator(".gratuity-explorer__row");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Six months after your exit date: 30 December 2026");
    await expect(rows.nth(0)).toContainText("₹1,73,076.92");
    await expect(rows.nth(1)).toContainText("One year after your exit date: 30 June 2027");
    await expect(rows.nth(1)).toContainText("₹1,73,076.92");
    await expect(page.locator("#gratuity-explorer-heading")).toBeVisible();
    expectClean(watch);
  });

  test("the explorer and the comparison are absent for a fixed-term result; the amount is illustrative", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gratuity-type-fixed");
    await expect(page.locator("#gratuity-end-group")).toBeVisible();
    await choose(page, "gratuity-end-expires");
    await page.locator("#gratuity-wages").fill("60000");
    await page.locator("#gratuity-joining").fill("2025-01-01");
    await page.locator("#gratuity-exit").fill("2025-12-31");
    await btn(page, "Calculate").click();
    await expect(results(page)).toContainText("Illustrative amount, not an entitlement");
    await expect(page.locator(".gratuity-explorer")).toHaveCount(0);
    await expect(page.locator("#gratuity-compare-form")).toHaveCount(1);
    await expect(page.locator("label[for='gratuity-joining']")).toContainText("Contract Start Date");
  });

  test("Compare by click, then by Enter, with the higher and lower words and exact paise", async ({ page, go, watch }) => {
    await open(page, go);
    await calculate(page);
    const second = page.locator("#gratuity-wages-second");
    await recordLive(page);
    await second.fill("100000");
    await btn(page, "Compare").click();
    await expect(page.locator("#gratuity-compare-output")).toContainText("₹2,88,461.54");
    await expect(page.locator("#gratuity-compare-output")).toContainText("The second estimate is ₹1,44,230.77 higher than the first.");
    await second.fill("25000");
    await second.press("Enter");
    await expect(page.locator("#gratuity-compare-output")).toContainText("The second estimate is ₹72,115.39 lower than the first.");
    const log = await liveLog(page);
    expect(log.length).toBe(2);
    expect(log.every((t) => t.startsWith("Comparison:"))).toBe(true);
    // an invalid second wage
    await second.fill("1,000");
    await second.press("Enter");
    const error = page.locator("#gratuity-error-wages-second");
    await expect(error).toBeVisible();
    await expect(error).toContainText("Error:");
    await expect(second).toHaveAttribute("aria-invalid", "true");
    expect(await second.getAttribute("aria-describedby")).toContain("gratuity-error-wages-second");
    await expect(second).toBeFocused();
    expectClean(watch);
  });

  test("Copy: a successful write sends the plain text and is reported only afterwards", async ({ page, go, watch }) => {
    await page.addInitScript(stubClipboard("ok"));
    await open(page, go);
    await calculate(page);
    await btn(page, "Copy summary").click();
    await expect(page.locator("#gratuity-copy-status")).toHaveText("Summary copied to the clipboard.");
    const copied = await page.evaluate(() => window.__copied);
    expect(copied).toHaveLength(1);
    const text = copied[0];
    expect(text.startsWith("Gratuity estimate (ToolZen Hub Gratuity Calculator)")).toBe(true);
    expect(text).toContain("Qualifying monthly wages: ₹50,000.00");
    expect(text).toContain("Joining date: 1 January 2021");
    expect(text).toContain("Exit date: 30 June 2026");
    expect(text).toContain("Estimated gratuity (subject to the conditions stated): ₹1,44,230.77");
    expect(text).toContain("not legal advice and not a determination of entitlement");
    expect(text).not.toMatch(/<[a-z]/i);
    expect(text).not.toMatch(/Contract end/);
    await expect(page.locator("#gratuity-copy-text")).toHaveCount(0);
    expectClean(watch);
  });

  for (const mode of ["reject", "missing"]) {
    test(`Copy: a ${mode === "reject" ? "rejected write" : "missing Clipboard API"} shows the summary for manual copy`, async ({ page, go }) => {
      await page.addInitScript(stubClipboard(mode));
      await open(page, go);
      await calculate(page);
      await btn(page, "Copy summary").click();
      const area = page.locator("#gratuity-copy-text");
      await expect(area).toBeVisible();
      await expect(page.locator("#gratuity-copy-status")).toContainText("could not be copied automatically");
      await expect(page.locator("#gratuity-copy-status")).not.toContainText("Summary copied");
      await expect(area).toBeFocused();
      await expect(area).toHaveJSProperty("readOnly", true);
      await expect(area).toHaveValue(/Gratuity estimate \(ToolZen Hub Gratuity Calculator\)[\s\S]*₹1,44,230\.77[\s\S]*determination of entitlement/);
      const sel = await area.evaluate((a) => [a.selectionStart, a.selectionEnd, a.value.length]);
      expect(sel).toEqual([0, sel[2], sel[2]]);
      await expect(page.getByLabel("Summary text")).toBeVisible();
    });
  }

  test("an edit marks the result out of date and blocks Compare and Copy; Calculate makes it current", async ({ page, go }) => {
    await page.addInitScript(stubClipboard("ok"));
    await open(page, go);
    await calculate(page);
    await recordLive(page);
    await page.locator("#gratuity-wages").fill("60000");
    await expect(page.locator("#gratuity-stale")).toBeVisible();
    await expect(results(page)).toHaveAttribute("data-stale", "true");
    await expect(btn(page, "Compare")).toBeDisabled();
    await expect(btn(page, "Copy summary")).toBeDisabled();
    await page.waitForTimeout(700);
    const log = await liveLog(page);
    expect(log, "one stale announcement").toHaveLength(1);
    expect(log[0]).toContain("out of date");
    // Enter in the second-wages field explains instead of acting
    const second = page.locator("#gratuity-wages-second");
    await second.fill("70000");
    await second.press("Enter");
    await expect(page.locator("#gratuity-error-wages-second")).toContainText("out of date");
    await expect(page.locator("#gratuity-compare-output")).toBeEmpty();
    expect(await page.evaluate(() => window.__copied.length)).toBe(0);
    await btn(page, "Copy summary").click();
    await expect(page.locator("#gratuity-copy-status")).toContainText("out of date");
    expect(await page.evaluate(() => window.__copied.length)).toBe(0);
    // a new Calculate makes everything current again
    await btn(page, "Calculate").click();
    await expect(page.locator("#gratuity-stale")).toBeHidden();
    await expect(results(page)).not.toHaveAttribute("data-stale", "true");
    await expect(results(page)).toContainText("₹1,73,076.92");
    await expect(btn(page, "Compare")).toBeEnabled();
    await expect(btn(page, "Copy summary")).toBeEnabled();
    await expect(page.locator("#gratuity-compare-output")).toBeEmpty();
  });

  test("Reset clears the fields, the result, the features and the stale marker, and focuses the first field", async ({ page, go }) => {
    await open(page, go);
    await calculate(page);
    await page.locator("#gratuity-wages").fill("60000");
    await btn(page, "Reset").click();
    await expect(page.locator("#gratuity-wages")).toHaveValue("");
    await expect(page.locator("#gratuity-joining")).toHaveValue("");
    await expect(page.locator("#gratuity-exit")).toHaveValue("");
    await expect(page.locator("input[name='gratuity-type']:checked")).toHaveCount(0);
    await expect(page.locator("#gratuity-stale")).toBeHidden();
    await expect(page.locator("#gratuity-result-heading")).toHaveCount(0);
    await expect(page.locator(".gratuity-explorer, .gratuity-compare, .gratuity-copy")).toHaveCount(0);
    await expect(page.locator("#gratuity-type-regular")).toBeFocused();
  });

  test("validation: Error messages are associated with their fields and the first invalid field gets focus", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Calculate").click();
    await expect(page.locator("#gratuity-error-type")).toContainText("Error:");
    expect(await page.locator("#gratuity-type-group").getAttribute("aria-describedby")).toBe("gratuity-error-type");
    await expect(page.locator("#gratuity-type-regular")).toBeFocused();
    await choose(page, "gratuity-type-regular");
    await page.locator("#gratuity-wages").fill("1,000");
    await btn(page, "Calculate").click();
    await expect(page.locator("#gratuity-error-wages")).toContainText("digits only");
    await expect(page.locator("#gratuity-wages")).toHaveAttribute("aria-invalid", "true");
    expect(await page.locator("#gratuity-wages").getAttribute("aria-describedby")).toContain("gratuity-error-wages");
    await expect(page.locator("#gratuity-error-joining")).toBeVisible();
    await expect(page.locator("#gratuity-wages")).toBeFocused();
    await expect(page.locator("#gratuity-error-summary")).toBeVisible();
  });

  test("keyboard: Tab reaches the choices with a visible focus ring; Enter in the wages field calculates", async ({ page, go }) => {
    await open(page, go);
    let id = "";
    for (let i = 0; i < 150 && id !== "gratuity-type-regular"; i++) {
      await page.keyboard.press("Tab");
      id = await page.evaluate(() => document.activeElement && document.activeElement.id);
    }
    expect(id).toBe("gratuity-type-regular");
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector("#gratuity-type-regular + span"));
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Space");
    await expect(page.locator("#gratuity-type-regular")).toBeChecked();
    await page.locator("#gratuity-wages").fill("50000");
    await page.locator("#gratuity-joining").fill("2021-01-01");
    await page.locator("#gratuity-exit").fill("2026-06-30");
    await page.locator("#gratuity-wages").press("Enter");
    await expect(page.locator("#gratuity-result-heading")).toBeFocused();
    const headings = await page.evaluate(() => [...document.querySelectorAll(".calculator-page h1, .calculator-page h2, .calculator-page h3, .calculator-page h4")].map((h) => h.tagName));
    expect(headings.filter((h) => h === "H1")).toHaveLength(1);
    // no level is skipped by more than one
    let prev = 1;
    for (const h of headings) { const n = Number(h[1]); expect(n - prev).toBeLessThanOrEqual(1); prev = n; }
  });

  for (const width of [320, 360, 390]) {
    test(`phone width ${width}px: no overflow, nothing clipped or overlapping, fallback usable`, async ({ page, go, watch }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.addInitScript(stubClipboard("missing"));
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await calculate(page, { wages: "150000.50", join: "2018-01-31", exit: "2026-02-28" });
      await page.locator("#gratuity-wages-second").fill("9999999.99");
      await btn(page, "Compare").click();
      await expect(page.locator("#gratuity-compare-output")).toContainText("₹");
      await btn(page, "Copy summary").click();
      await expect(page.locator("#gratuity-copy-text")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const boxes = await page.evaluate(() => {
        const sel = [
          "#gratuity-calculate", "#gratuity-reset", "#gratuity-wages", "#gratuity-joining", "#gratuity-exit",
          ".calculator-results__value", ".gratuity-explorer__row", ".gratuity-explorer__amount strong", ".gratuity-compare__row",
          ".gratuity-compare__difference", ".gratuity-note", "#gratuity-copy", "#gratuity-copy-text", ".gratuity-status"
        ];
        const out = {};
        for (const s of sel) {
          out[s] = [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null).map((e) => {
            const r = e.getBoundingClientRect();
            return { x: r.left, right: r.right, y: r.top + scrollY, bottom: r.bottom + scrollY, h: r.height, w: r.width, clipped: e.scrollWidth > e.clientWidth + 1 };
          });
        }
        return out;
      });
      for (const [s, list] of Object.entries(boxes)) {
        expect(list.length, `${s} is rendered`).toBeGreaterThan(0);
        for (const b of list) {
          expect(b.x, `${s} left edge`).toBeGreaterThanOrEqual(-1);
          expect(b.right, `${s} right edge at ${width}px`).toBeLessThanOrEqual(width + 1);
          expect(b.clipped, `${s} text is not clipped`).toBe(false);
        }
      }
      // the two main buttons and the two panel buttons do not overlap, and are comfortable to tap
      const [calc] = boxes["#gratuity-calculate"], [reset] = boxes["#gratuity-reset"];
      const overlap = !(calc.right <= reset.x || reset.right <= calc.x || calc.bottom <= reset.y || reset.bottom <= calc.y);
      expect(overlap, "Calculate and Reset overlap").toBe(false);
      expect(calc.h).toBeGreaterThanOrEqual(44);
      expect(reset.h).toBeGreaterThanOrEqual(44);
      expect(boxes["#gratuity-copy"][0].h).toBeGreaterThanOrEqual(44);
      // the disclosure for this scenario is visible
      await expect(page.locator(".gratuity-note").first()).toBeVisible();
      expectClean(watch);
    });
  }

});
