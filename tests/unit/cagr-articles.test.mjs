/**
 * Tool Pack 9: the figures quoted in the two CAGR articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/cagr-golden.py (Python decimal: the growth rate is found by bisection on
 * integer powers and cross-checked with ln / exp; the "articles" block and the scenarios). The engine must reproduce them, and every figure
 * written in an article, formatted the way the tool formats it, must appear in the article text, so the text cannot drift from the maths.
 * The "simple yearly average" is only total growth divided by the years.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { calculateCagr, validateCagrInputs, percentText, multipleText } from "../../assets/js/calculators/formulas/cagr.js";

const REF = {
  A: { cagr: "12.474611314209", cagrDisplay: "12.47", total: "80.00", multiple: "1.80", simple: "16.00" },
  B: { cagr: "10.216265995200", cagrDisplay: "10.22", total: "140.00", multiple: "2.40", simple: "15.56" },
  differenceCagrPoints: "-2.25834532",
  stepMultiplierA: "1.12474611",
  stepMultiplierB: "1.10216266",
  compoundedYearlyGrowthA: ["12474.61", "14030.77", "15781.05", "17749.68", "19963.88"], // rupees added in each of the five years at the CAGR
  sixteenCompoundedFiveYears: "210034.17",
};

const SLUGS = ["cagr-vs-simple-average-growth-why-80-percent-over-5-years-is-not-16-percent-cagr", "comparing-two-investments-over-different-periods-a-bigger-gain-is-not-a-higher-yearly-rate"];
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/cagr/${slug}.js`)).default);
const N = Number;
const near = (a, b, label, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${label}: ${a} vs ${b}`);
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const cagr = (start, end, months) => {
  const check = validateCagrInputs({ mode: "back", start, end, years: Math.floor(months / 12), months: months % 12 });
  assert.equal(check.ok, true);
  return calculateCagr(check.values);
};

describe("the engine reproduces the reference figures behind the articles", () => {
  test("case A (the default), case B, the step multipliers and the compounded yearly growth", () => {
    const a = cagr("100000", "180000", 60);
    near(a.cagr * 100, N(REF.A.cagr), "A CAGR");
    assert.equal(percentText(a.cagr), REF.A.cagrDisplay);
    assert.equal(percentText(a.totalGrowth), REF.A.total);
    assert.equal(multipleText(a.multiple), REF.A.multiple);
    assert.equal(percentText(a.simpleYearly), REF.A.simple);
    const b = cagr("100000", "240000", 108);
    near(b.cagr * 100, N(REF.B.cagr), "B CAGR");
    assert.equal(percentText(b.cagr), REF.B.cagrDisplay);
    assert.equal(percentText(b.totalGrowth), REF.B.total);
    assert.equal(multipleText(b.multiple), REF.B.multiple);
    assert.equal(percentText(b.simpleYearly), REF.B.simple);
    near((b.cagr - a.cagr) * 100, N(REF.differenceCagrPoints), "difference (points)", 1e-7);
    near(1 + a.cagr, N(REF.stepMultiplierA), "step multiplier A", 1e-8);
    near(1 + b.cagr, N(REF.stepMultiplierB), "step multiplier B", 1e-8);
    // the rupees the compounded route adds in each of the five years
    let value = 100000;
    REF.compoundedYearlyGrowthA.forEach((expected, i) => {
      const next = 100000 * Math.pow(1 + a.cagr, i + 1);
      near(next - value, N(expected), `year ${i + 1} growth`, 1e-6);
      value = next;
    });
    near(value, 180000, "five compounded steps reach the ending value", 1e-9);
    near(100000 * Math.pow(1.16, 5), N(REF.sixteenCompoundedFiveYears), "16% compounded for five years", 1e-7);
  });
});

describe("every figure in 'CAGR vs simple average growth' is the calculator's", () => {
  test("80.00%, 16.00%, about 12.47%, the slices and the 16% compounding check", async () => {
    const t = await text(SLUGS[0]);
    const a = cagr("100000", "180000", 60);
    has(t, [`${percentText(a.totalGrowth)}%`, `${percentText(a.simpleYearly)}%`, `${percentText(a.cagr)}%`, "₹1,00,000", "₹1,80,000", "5 years", "1.80×"]);
    assert.equal(`${percentText(a.totalGrowth)}%`, "80.00%");
    assert.equal(`${percentText(a.simpleYearly)}%`, "16.00%");
    assert.equal(`${percentText(a.cagr)}%`, "12.47%");
    // the simple yearly average is exactly the total growth divided by the years, and the equal slices are 80,000 / 5
    near(a.simpleYearly, a.totalGrowth / 5, "simple yearly average", 1e-15);
    has(t, [inr(80000 / 5)]);
    // the first and fifth compounded years, and 16% compounded for five years
    const first = 100000 * a.cagr;
    const fifth = 100000 * Math.pow(1 + a.cagr, 5) - 100000 * Math.pow(1 + a.cagr, 4);
    has(t, [inr(first), inr(fifth), inr(100000 * Math.pow(1.16, 5))]);
    assert.ok(Math.pow(1.16, 5) * 100000 > 180000);
    // the gap between the two figures, about 3.53 percentage points
    assert.equal(((a.simpleYearly - a.cagr) * 100).toFixed(2), "3.53");
    has(t, ["3.53 percentage points"]);
    // the article names the metric only as total growth divided by years
    assert.ok(/total growth divided by the years/i.test(t));
  });
});

describe("every figure in 'Comparing two investments over different periods' is the calculator's", () => {
  test("both cases, the totals, the multiples, the simple averages and the difference", async () => {
    const t = await text(SLUGS[1]);
    const a = cagr("100000", "180000", 60);
    const b = cagr("100000", "240000", 108);
    has(t, [`${percentText(a.cagr)}%`, `${percentText(b.cagr)}%`, `${percentText(a.totalGrowth)}%`, `${percentText(b.totalGrowth)}%`, `${percentText(a.simpleYearly)}%`, `${percentText(b.simpleYearly)}%`, `${multipleText(a.multiple)}×`, `${multipleText(b.multiple)}×`]);
    assert.equal(`${percentText(b.cagr)}%`, "10.22%");
    assert.equal(`${percentText(b.totalGrowth)}%`, "140.00%");
    assert.equal(`${percentText(b.simpleYearly)}%`, "15.56%");
    assert.equal(((a.cagr - b.cagr) * 100).toFixed(2), "2.26");
    has(t, ["2.26 percentage points", "−2.26 percentage points", "₹2,40,000", "9 years", "4 more years"]);
    // the point of the article: B gained more in total, A's yearly rate is higher
    assert.ok(b.totalGrowth > a.totalGrowth);
    assert.ok(b.cagr < a.cagr);
    // and the simple yearly averages nearly agree
    assert.ok(Math.abs(a.simpleYearly - b.simpleYearly) < 0.01);
  });
});

describe("trust and scope wording", () => {
  test("no forecast, recommendation, ranking or benchmark wording; no yearly-return series; the limits are stated", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/expected return/i, /\bgood return\b/i, /\bbad return\b/i, /beats? the market/i, /you will earn/i, /likely return/i, /best investment/i, /\bsafe(st)?\b/i, /\bguaranteed\b/i, /should earn/i, /\brecommended\b/i, /\+100%/, /doubling/i, /halving/i, /arithmetic mean/i, /average annual return/i, /mean of (the )?yearly/i, /\bxirr\b(?! )/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      const unqualified = (word) => t.split(/(?<=[.!?"])\s+/).filter((x) => new RegExp(word, "i").test(x) && !/\b(not|no|nor|never|does not|doesn't)\b/i.test(x));
      assert.deepEqual(unqualified("forecast"), [], `${s}: forecast`);
      assert.ok(/not a forecast|is not a forecast|not advice/i.test(t), `${s}: says it is not a forecast or advice`);
      assert.ok(/(one starting value and one ending value)/i.test(t), `${s}: states the lump-sum assumption`);
      assert.ok(/(fees)/i.test(t) && /(tax)/i.test(t) && /(inflation)/i.test(t), `${s}: states what is left out`);
    }
  });

  test("the articles name no fund, stock, index or benchmark and stay out of SIP returns and XIRR", async () => {
    for (const s of SLUGS) {
      const t = (await text(s)).toLowerCase();
      for (const word of ["nifty", "sensex", "mutual fund", "index fund", "hdfc", "icici", "sbi ", "xirr"]) assert.ok(!t.includes(word), `${s}: ${word}`);
    }
  });
});

describe("the article images are the approved explanatory diagrams, small and not data charts", () => {
  const dir = new URL("../../assets/Images/articles/", import.meta.url);

  test("each has a PNG and a WebP, both lightweight", () => {
    for (const s of SLUGS) {
      for (const ext of ["png", "webp"]) {
        const size = fs.statSync(new URL(`${s}.${ext}`, dir)).size;
        assert.ok(size > 1000 && size < 40000, `${s}.${ext} is ${size} bytes`);
      }
    }
  });

  test("the catalog describes each as the concept it shows, and the two differ", async () => {
    const { articles } = await import("../../assets/js/data/articles.js");
    const alts = SLUGS.map((s) => articles.find((a) => a.slug === s).heroImage.alt);
    assert.match(alts[0], /two end blocks of the same height/i);
    assert.match(alts[0], /five equal slices/i);
    assert.match(alts[0], /five slices that each grow/i);
    assert.match(alts[1], /yearly steps/i);
    assert.match(alts[1], /five larger steps/i);
    assert.match(alts[1], /nine slightly smaller steps/i);
    for (const alt of alts) assert.ok(!/chart|graph|histogram|pie/i.test(alt), `alt text describes a diagram, not a chart: ${alt}`);
    assert.notEqual(alts[0], alts[1]);
  });
});
