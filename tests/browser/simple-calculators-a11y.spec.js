/**
 * Tool Pack 53: tablet width and automated accessibility checks for the ten simple calculators and the three covered articles.
 *
 * axe-core (already in node_modules, not a declared dependency, so the scan skips with a message if it is missing) runs on the whole page
 * in each state a visitor meets: the start, a solved result and a refused input. Also checked by script: no horizontal overflow at the
 * tablet width, a visible focus indicator on the first control reached by Tab, the error element tied to the invalid field, and heading order.
 * This is an automated proxy: it is not a screen-reader test and cannot judge reading order or whether wording helps. No screen reader was used.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const AXE = path.resolve("node_modules/axe-core/axe.min.js");
const haveAxe = fs.existsSync(AXE);
const RULES = { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } };
const TABLET = { width: 820, height: 1180 };

const CALCS = [
  { slug: "interest", prefix: "interest", fill: { principal: "10000", rate: "10", years: "2" } },
  { slug: "roi", prefix: "roi", fill: { invested: "1000", final: "1500", years: "2" } },
  { slug: "ratio", prefix: "ratio", fill: { a: "12", b: "20", c: "6" } },
  { slug: "age", prefix: "age", fill: { birth: "2000-01-15", asOn: "2026-01-15" } },
  { slug: "personal-loan", prefix: "pl", fill: { amount: "100000", rate: "12", years: "1" } },
  { slug: "loan-eligibility", prefix: "le", fill: { income: "100000", share: "50", rate: "10", years: "1" } },
  { slug: "bmi", prefix: "bmi", fill: { weight: "70", height: "175", age: "30" } },
  { slug: "bmr", prefix: "bmr", fill: { age: "30", weight: "80", height: "180" }, select: { sex: "male" } },
  { slug: "calorie", prefix: "cal", fill: { age: "30", weight: "80", height: "180" }, select: { sex: "male", activity: "1.55" } },
  { slug: "unit-converter", prefix: "uc", fill: { value: "10" }, select: { from: "km", to: "mi" } }
];
const ARTICLES = [
  "articles/business/roi-vs-profit-whats-the-difference/",
  "articles/health/how-to-calculate-your-daily-calorie-needs/",
  "articles/converter/easy-unit-conversion-guide/"
];

async function scan(page, label) {
  // let styles settle first: a control that has just been enabled (the Copy button) is still sliding between its disabled and enabled colours for a couple of hundred ms and axe would measure the half-way colours. Wait until every control's colours stop changing.
  await page.evaluate(async () => {
    const snap = () => [...document.querySelectorAll("button, input, select, a")].map((el) => { const c = getComputedStyle(el); return c.color + c.backgroundColor; }).join("|");
    let last = snap();
    for (let i = 0; i < 20; i++) { await new Promise((r) => setTimeout(r, 120)); const now = snap(); if (now === last) return; last = now; }
  });
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async ({ rules }) => {
    const r = await window.axe.run(document, rules);
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 4) }));
  }, { rules: RULES });
  expect(result, `${label}: ${JSON.stringify(result)}`).toEqual([]);
}

async function enter(page, c) {
  for (const [key, value] of Object.entries(c.select ?? {})) await page.locator(`#${c.prefix}-${key}`).selectOption(value);
  for (const [key, value] of Object.entries(c.fill)) await page.locator(`#${c.prefix}-${key}`).fill(value);
}

test.describe("Simple calculators: tablet width and accessibility", () => {
  test.skip(!haveAxe, "axe-core is not installed");

  for (const c of CALCS) {
    test(`${c.slug}: tablet layout, axe in three states, focus, error wiring, heading order`, async ({ page, go }) => {
      await page.setViewportSize(TABLET);
      await go(`calculators/${c.slug}/`);
      await expect(page.locator(`#${c.prefix}-form`)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await scan(page, "start");

      await enter(page, c);
      await expect(page.locator(`#${c.prefix}-results .calculator-results__value`).first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await scan(page, "result");

      // keyboard: the first control reached by Tab inside the form shows a focus indicator
      const first = page.locator(`#${c.prefix}-form input:not([aria-hidden=true]), #${c.prefix}-form select`).first();
      await first.focus();
      const outline = await first.evaluate((el) => {
        const s = getComputedStyle(el);
        return { width: parseFloat(s.outlineWidth), style: s.outlineStyle, shadow: s.boxShadow, border: s.borderColor };
      });
      expect(outline.style !== "none" && outline.width > 0 || outline.shadow !== "none", `focus indicator: ${JSON.stringify(outline)}`).toBe(true);

      // an invalid entry: the error is announced and tied to the field
      const key = Object.keys(c.fill).find((k) => !(["birth", "asOn"].includes(k)));
      if (key) {
        const field = page.locator(`#${c.prefix}-${key}`);
        await field.fill("abc");
        await expect(page.locator(`#${c.prefix}-results .calculator-results__error`)).toBeVisible();
        await expect(field).toHaveAttribute("aria-invalid", "true");
        const errorId = await page.locator(`#${c.prefix}-results .calculator-results__error`).getAttribute("id");
        expect(await field.getAttribute("aria-describedby")).toContain(errorId);
        await scan(page, "error");
      }

      // one h1 and no skipped heading level
      const levels = await page.locator("main h1, main h2, main h3, #app h1, #app h2, #app h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
      expect(levels.filter((n) => n === 1)).toHaveLength(1);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
    });
  }

  for (const route of ARTICLES) {
    test(`${route}: tablet layout, cover image and axe`, async ({ page, go }) => {
      await page.setViewportSize(TABLET);
      await go(route);
      await expect(page.locator("article.article")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const hero = page.locator(".article-hero-image img");
      await expect(hero).toBeVisible();
      expect(await hero.evaluate((i) => i.complete && i.naturalWidth === 1200 && i.naturalHeight === 675)).toBe(true);
      const box = await hero.boundingBox();
      expect(box.width, "cover fits the viewport").toBeLessThanOrEqual(TABLET.width);
      expect((await hero.getAttribute("alt")).length).toBeGreaterThan(40);
      await scan(page, "article");
    });
  }
});
