/**
 * Tool Pack 7: the figures quoted in the two FD articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/fd-golden.py (Python decimal: the deposit is simulated period by
 * period; the "articles" block). The engine must reproduce them, and every figure written in an article, formatted the way the
 * tool formats money, must appear in the article text, so the text cannot drift from the maths.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { calculateFd } from "../../assets/js/calculators/formulas/fd.js";

const REF = {
  frequency: {
    yearly: { maturity: "140255.17307000", yield: "7.00000000", growth: "40.25517307" },
    "half-yearly": { maturity: "141059.87606211", yield: "7.12250000", growth: "41.05987606" },
    quarterly: { maturity: "141477.81957558", yield: "7.18590313", growth: "41.47781958" },
    monthly: { maturity: "141762.52596140", yield: "7.22900809", growth: "41.76252596" },
  },
  monthlyMinusYearly: "1507.35289140",
  halfYearlyMinusYearly: "804.70299211",
  quarterlyMinusHalfYearly: "417.94351347",
  monthlyMinusQuarterly: "284.70638582",
  rate74Quarterly: "144284.82821581",
  rate74MinusRate7Quarterly: "2807.00864023",
  comparison: { a: "123507.50047309", aYield: "7.29128437", b: "140093.84609886", bYield: "6.97537355", diff: "16586.34562577", yieldDiff: "-0.31591082" },
  sameFiveYears: { a: "142174.66742666", b: "140093.84609886", diff: "-2080.82132780" },
};

const SLUGS = ["how-compounding-frequency-changes-an-fd-maturity", "comparing-two-fixed-deposits-higher-rate-is-not-the-whole-comparison"];
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/fd/${slug}.js`)).default);
const N = Number;
const near = (a, b, label, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const paise = (n) => `₹${N(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct4 = (n) => `${N(n).toFixed(4)}%`;
const pct2 = (n) => `${N(n).toFixed(2)}%`;
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const fd = (rate, months, compounding, optionB = null) => calculateFd({ amount: 100000, rate, months, compounding, optionB });

describe("the engine reproduces the reference figures behind the articles", () => {
  test("four compounding choices, the 7.4% scale figure and both comparisons", () => {
    for (const [c, g] of Object.entries(REF.frequency)) {
      const r = fd(7, 60, c);
      near(r.maturity, N(g.maturity), `${c} maturity`);
      near(r.effectiveYield * 100, N(g.yield), `${c} yield`, 1e-7);
      near(r.totalGrowth * 100, N(g.growth), `${c} growth`, 1e-6);
    }
    near(fd(7.4, 60, "quarterly").maturity, N(REF.rate74Quarterly), "7.4% quarterly");
    const both = fd(7.1, 36, "quarterly", { rate: 6.8, months: 60 });
    near(both.maturity, N(REF.comparison.a), "A");
    near(both.optionB.maturity, N(REF.comparison.b), "B");
    near(both.comparison.maturity, N(REF.comparison.diff), "B - A", 0.006);
    near(both.comparison.effectiveYield * 100, N(REF.comparison.yieldDiff), "yield difference", 1e-7);
    const same = fd(7.1, 60, "quarterly", { rate: 6.8, months: 60 });
    near(same.maturity, N(REF.sameFiveYears.a), "A over 5 years");
    near(same.comparison.maturity, N(REF.sameFiveYears.diff), "B - A over 5 years", 0.006);
  });
});

describe("every figure in 'How much does compounding frequency change an FD's maturity?' is the calculator's", () => {
  test("four maturities, yields, differences and the scale figure", async () => {
    const t = await text(SLUGS[0]);
    const r = Object.fromEntries(Object.keys(REF.frequency).map((c) => [c, fd(7, 60, c)]));
    for (const c of Object.keys(r)) has(t, [paise(r[c].maturity), pct4(r[c].effectiveYield * 100)]);
    const diff = (a, b) => Math.round((r[a].maturity - r[b].maturity) * 100) / 100;
    assert.equal(paise(diff("monthly", "yearly")), "₹1,507.35");
    assert.equal(paise(diff("half-yearly", "yearly")), "₹804.70");
    assert.equal(paise(diff("quarterly", "half-yearly")), "₹417.94");
    assert.equal(paise(diff("monthly", "quarterly")), "₹284.71");
    has(t, ["₹1,507.35", "₹804.70", "₹417.94", "₹284.71"]);
    const scale = fd(7.4, 60, "quarterly");
    has(t, [paise(scale.maturity), paise(Math.round((scale.maturity - r.quarterly.maturity) * 100) / 100)]);
    assert.equal(paise(Math.round((scale.maturity - r.quarterly.maturity) * 100) / 100), "₹2,807.01");
    // growth over the whole tenure is not the yearly figure
    has(t, [pct2(r.yearly.totalGrowth * 100), pct2(r.monthly.totalGrowth * 100)]);
    assert.equal(pct2(r.yearly.totalGrowth * 100), "40.26%");
    assert.equal(pct2(r.monthly.totalGrowth * 100), "41.76%");
    // monthly vs yearly is smaller than a 0.4-point higher quoted rate, and each step adds less than the one before
    assert.ok(r.monthly.maturity - r.yearly.maturity < scale.maturity - r.quarterly.maturity);
    const steps = [r["half-yearly"].maturity - r.yearly.maturity, r.quarterly.maturity - r["half-yearly"].maturity, r.monthly.maturity - r.quarterly.maturity];
    assert.ok(steps[0] > steps[1] && steps[1] > steps[2], "each more frequent step adds less");
    has(t, ["₹1,00,000", "7%", "5 years"]);
  });
});

describe("every figure in 'Comparing two fixed deposits' is the calculator's", () => {
  test("the pair of offers, the yields and the equal-time comparison", async () => {
    const t = await text(SLUGS[1]);
    const both = fd(7.1, 36, "quarterly", { rate: 6.8, months: 60 });
    has(t, [paise(both.maturity), paise(both.optionB.maturity), paise(both.comparison.maturity), pct4(both.effectiveYield * 100), pct4(both.optionB.effectiveYield * 100)]);
    assert.equal(paise(both.maturity), "₹1,23,507.50");
    assert.equal(paise(both.optionB.maturity), "₹1,40,093.85");
    assert.equal(paise(both.comparison.maturity), "₹16,586.35");
    assert.equal(pct4(both.effectiveYield * 100), "7.2913%");
    assert.equal(pct4(both.optionB.effectiveYield * 100), "6.9754%");
    assert.equal((Math.abs(both.comparison.effectiveYield) * 100).toFixed(2), "0.32");
    has(t, ["0.32 percentage points"]);
    assert.equal(both.comparison.likeForLike, false);
    assert.ok(both.comparison.maturity > 0 && both.comparison.effectiveYield < 0, "the longer one matures to more with the lower yield");
    const same = fd(7.1, 60, "quarterly", { rate: 6.8, months: 60 });
    has(t, [paise(same.maturity), paise(Math.abs(same.comparison.maturity))]);
    assert.equal(paise(same.maturity), "₹1,42,174.67");
    assert.equal(paise(Math.abs(same.comparison.maturity)), "₹2,080.82");
    assert.equal(same.comparison.likeForLike, true);
    assert.ok(same.comparison.maturity < 0, "over the same time the higher rate matures to more");
    has(t, ["₹1,00,000", "7.1%", "6.8%", "3 years", "5 years", "2 more years"]);
  });
});

describe("trust and scope wording", () => {
  test("no ranking, safety, guarantee, recommendation or bank/rate claim in either FD article", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/\bbest\b/i, /\bsafe(st)?\b/i, /risk-free/i, /\brecommended?\b/i, /\bwinner\b/i, /\bbetter (offer|fd|deposit|choice)\b/i, /\bworse\b/i, /highest[- ]return/i, /you should (take|choose|pick|open)/i, /current (market )?rate/i, /\bguaranteed\b/i, /\bwill earn\b/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      const unqualified = (word) => t.split(/(?<=[.!?"])\s+/).filter((x) => new RegExp(word, "i").test(x) && !/\b(not|no|nor|never)\b/i.test(x));
      assert.deepEqual(unqualified("guarantee"), [], `${s}: guarantee`);
      assert.ok(/a bank's/i.test(t), `${s}: says a bank's maturity can differ`);
      assert.ok(/(compounding dates|day-count)/i.test(t) && /rounding/i.test(t), `${s}: names why a bank's figure can differ`);
      assert.ok(/tax/i.test(t) && /premature withdrawal/i.test(t), `${s}: states what is left out`);
    }
  });

  test("the articles stay out of CAGR, PPF, named banks and live rates", async () => {
    for (const s of SLUGS) {
      const t = (await text(s)).toLowerCase();
      for (const word of ["cagr", "ppf", "sbi", "hdfc", "icici", "axis bank", "post office", "small saving", "senior citizen", "section 80"]) assert.ok(!t.includes(word), `${s}: ${word}`);
    }
  });
});

describe("the article images are the approved explanatory diagrams, small and not charts", () => {
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
    assert.match(alts[0], /one year split into equal periods/i);
    assert.match(alts[0], /one moment.*twelve|twelve/i);
    assert.match(alts[1], /three years.*five|five/i);
    assert.match(alts[1], /two extra years|two years/i);
    for (const alt of alts) assert.ok(!/chart|graph|histogram/i.test(alt), `alt text describes a diagram, not a chart: ${alt}`);
    assert.notEqual(alts[0], alts[1]);
  });
});
