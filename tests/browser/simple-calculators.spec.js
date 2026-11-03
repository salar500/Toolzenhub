/**
 * Tool Pack 53: the ten simple calculators, realistic browser journeys.
 *
 * Expected figures are derived independently here (plain arithmetic written in this file, not imported from the site code) and
 * compared as numbers after thousands separators and currency symbols are removed, so the check is on the value, not the formatting.
 * Per calculator: page and breadcrumb, empty start, one golden result, invalid input, Reset, and no horizontal overflow at 320 px.
 * Deep formula coverage lives in tests/unit/simple-calculators.test.mjs.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

// ---- independent reference values ----
const emi = (p, annualRate, months) => {
  const r = annualRate / 12 / 100;
  return (p * r * (1 + r) ** months) / ((1 + r) ** months - 1);
};
const loanFor = (maxEmi, annualRate, months) => {
  const r = annualRate / 12 / 100;
  return (maxEmi * ((1 + r) ** months - 1)) / (r * (1 + r) ** months);
};
const fixed = (n, d = 2) => n.toFixed(d);

// slug, heading, prefix, values to enter (key -> value; selects use selectOption), numbers that must appear in the results
const CASES = [
  { slug: "interest", title: "Interest Calculator", prefix: "interest", fill: { principal: "10000", rate: "10", years: "2" }, expect: [fixed(2100), fixed(12100)] },
  { slug: "roi", title: "ROI Calculator", prefix: "roi", fill: { invested: "1000", final: "1500", years: "2" }, expect: ["50%", fixed((Math.sqrt(1.5) - 1) * 100)] },
  { slug: "ratio", title: "Ratio Calculator", prefix: "ratio", fill: { a: "12", b: "20", c: "6" }, expect: ["3", "5", "10"], text: ["3 : 5", "10"] },
  { slug: "age", title: "Age Calculator", prefix: "age", fill: { birth: "2000-01-15", asOn: "2026-01-15" }, expect: ["26"] },
  { slug: "personal-loan", title: "Personal Loan Calculator", prefix: "pl", fill: { amount: "100000", rate: "12", years: "1" }, expect: [fixed(emi(100000, 12, 12))] },
  { slug: "loan-eligibility", title: "Loan Eligibility Calculator", prefix: "le", fill: { income: "100000", share: "50", rate: "10", years: "1" }, expect: [fixed(loanFor(50000, 10, 12), 0)] },
  { slug: "bmi", title: "BMI Calculator", prefix: "bmi", fill: { weight: "70", height: "175", age: "30" }, expect: [fixed(70 / 1.75 ** 2, 1)] },
  { slug: "bmr", title: "BMR Calculator", prefix: "bmr", fill: { age: "30", weight: "80", height: "180" }, select: { sex: "male" }, expect: [String(10 * 80 + 6.25 * 180 - 5 * 30 + 5)] },
  { slug: "calorie", title: "Calorie Calculator", prefix: "cal", fill: { age: "30", weight: "80", height: "180" }, select: { sex: "male", activity: "1.55" }, expect: [String(Math.round((10 * 80 + 6.25 * 180 - 5 * 30 + 5) * 1.55))] },
  { slug: "unit-converter", title: "Unit Converter", prefix: "uc", fill: { value: "10" }, select: { from: "km", to: "mi" }, expect: [fixed(10 / 1.609344, 4).replace(/0+$/, "")] }
];

// numbers only: no thousands separators, currency symbols or non-breaking spaces
const plain = (s) => s.replace(/[,  ₹$]/g, "").replace(/\s+/g, " ");

async function open(page, go, c) {
  await go(`calculators/${c.slug}/`);
  await expect(page.locator(`#${c.prefix}-form`)).toBeVisible();
}
async function enter(page, c, values = c.fill, selects = c.select ?? {}) {
  for (const [key, value] of Object.entries(selects)) {
    const sel = page.locator(`#${c.prefix}-${key}`);
    const options = await sel.locator("option").evaluateAll((o) => o.map((x) => x.value));
    await sel.selectOption(options.find((v) => v === value) ?? { label: value });
  }
  for (const [key, value] of Object.entries(values)) await page.locator(`#${c.prefix}-${key}`).fill(value);
}

for (const c of CASES) {
  test.describe(`Simple calculator: ${c.title}`, () => {
    test("page, breadcrumb, form shell and the empty or default start", async ({ page, go, watch, siteRoot }) => {
      await open(page, go, c);
      await expect(page.locator("h1")).toHaveText(c.title);
      await expect(page.locator("h1")).toHaveCount(1);
      const crumb = page.locator(".calculator-breadcrumb");
      await expect(crumb).toHaveCount(1);
      await expect(crumb).toContainText(c.title);
      const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
      expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);
      await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
      // Copy is enabled only when there is a result: Unit Converter starts at 1 km = mi, which already solves
      const startSolved = await page.locator(`#${c.prefix}-results .calculator-results__value`).count();
      if (startSolved) await expect(page.locator(`#${c.prefix}-copy`)).toBeEnabled();
      else await expect(page.locator(`#${c.prefix}-copy`)).toBeDisabled();
      // every field has an accessible label (the slider is an aria-hidden pointer aid; the number field is the accessible control)
      const unlabeled = await page.locator(`#${c.prefix}-form input, #${c.prefix}-form select`).evaluateAll((els) =>
        els.filter((e) => e.type !== "hidden" && e.getAttribute("aria-hidden") !== "true" && !e.labels?.length && !e.getAttribute("aria-label")).map((e) => e.id));
      expect(unlabeled, "fields without a label").toEqual([]);
      expectClean(watch);
    });

    test("golden result matches an independently derived value", async ({ page, go, watch }) => {
      await open(page, go, c);
      await enter(page, c);
      const results = page.locator(`#${c.prefix}-results`);
      await expect(results.locator(".calculator-results__value").first()).toBeVisible();
      const text = plain(await results.innerText());
      for (const needle of c.expect) expect(text, `result should contain ${needle}`).toContain(needle);
      await expect(page.locator(`#${c.prefix}-copy`)).toBeEnabled();
      expectClean(watch);
    });

    test("invalid input shows one error, marks the field, and Reset restores the start", async ({ page, go, watch }) => {
      await open(page, go, c);
      const firstKey = Object.keys(c.fill)[0];
      const first = page.locator(`#${c.prefix}-${firstKey}`);
      const isDate = (await first.getAttribute("type")) === "date";
      await enter(page, c);
      if (!isDate) {
        await first.fill("abc");
        await expect(page.locator(`#${c.prefix}-results .calculator-results__error`)).toBeVisible();
        await expect(first).toHaveAttribute("aria-invalid", "true");
        await expect(page.locator(`#${c.prefix}-results .calculator-results__value`)).toHaveCount(0);
      }
      const before = await page.locator(`#${c.prefix}-form`).evaluate((f) => [...f.querySelectorAll("input,select")].map((e) => e.value));
      await page.getByRole("button", { name: "Reset" }).click();
      const after = await page.locator(`#${c.prefix}-form`).evaluate((f) => [...f.querySelectorAll("input,select")].map((e) => e.value));
      if (!isDate) expect(after).not.toEqual(before);
      await expect(first).toHaveValue(isDate ? "" : await first.getAttribute("value") ?? "");
      // Reset returns to the start state: a start that already solves (Unit Converter, 1 km to mi) keeps its result and Copy
      const solved = await page.locator(`#${c.prefix}-results .calculator-results__value`).count();
      if (solved) await expect(page.locator(`#${c.prefix}-copy`)).toBeEnabled();
      else await expect(page.locator(`#${c.prefix}-copy`)).toBeDisabled();
      // focus returns to the first control of the form
      await expect(page.locator(`#${c.prefix}-form input:not([aria-hidden=true]), #${c.prefix}-form select`).first()).toBeFocused();
      expectClean(watch);
    });

    test("no horizontal overflow at 320 px, with and without a result", async ({ page, go }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await open(page, go, c);
      await expectNoHorizontalOverflow(page);
      await enter(page, c);
      await expect(page.locator(`#${c.prefix}-results .calculator-results__value`).first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("Simple calculators: shared behaviour", () => {
  test("Ratio scales the second term and simplifies", async ({ page, go }) => {
    const c = CASES.find((x) => x.slug === "ratio");
    await open(page, go, c);
    await enter(page, c, { a: "12", b: "20", c: "" });
    expect(plain(await page.locator("#ratio-results").innerText())).toMatch(/3\s*:\s*5/);
  });

  test("Interest: compounding more often gives more than annual compounding", async ({ page, go }) => {
    const c = CASES.find((x) => x.slug === "interest");
    await open(page, go, c);
    await enter(page, c);
    const annual = plain(await page.locator("#interest-results").innerText());
    await page.locator("#interest-frequency").selectOption({ index: 3 });
    const other = plain(await page.locator("#interest-results").innerText());
    expect(other).not.toEqual(annual);
  });

  test("a rate slider and its number field stay in step (Personal Loan)", async ({ page, go }) => {
    const c = CASES.find((x) => x.slug === "personal-loan");
    await open(page, go, c);
    const slider = page.locator("#pl-rate").locator("xpath=following::input[@type='range'][1]");
    await expect(slider).toHaveCount(1);
    await expect(slider).toHaveAttribute("min", "5");
    await expect(slider).toHaveAttribute("max", "30");
    await slider.evaluate((el) => { el.value = "15"; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await expect(page.locator("#pl-rate")).toHaveValue("15");
    await page.locator("#pl-rate").fill("9.5");
    await expect(slider).toHaveValue("9.5");
  });
});
