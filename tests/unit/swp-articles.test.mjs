/**
 * Tool Pack 21 (content pack): the figures quoted in the two SWP articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/swp-golden.py (Python decimal, the "articles" block of
 * its printed JSON: each plan simulated month by month, the corpus a plan needs from a present-value factor with a
 * closed-form cross-check, the first withdrawal by bisection). The engine must reproduce them, and every figure written in
 * an article, formatted the way the site formats whole rupees, must appear in the article text, so the text cannot drift
 * from the maths. Nothing here is computed by copying the engine's own output into an expectation.
 *
 * Baseline of both articles: Rs 1 crore, Rs 80,000 a month at the start of each month, an assumed 8% a year (effective),
 * no yearly increase.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { calculateSwp, periodReturn } from "../../assets/js/calculators/formulas/swp.js";

const REF = {
  monthlyReturnPercent: "0.6434",
  period: { opening: "10000000.0000", withdrawal: "80000.0000", remaining: "9920000.0000", growth: "63825.5787", closing: "9983825.5787" },
  threshold: "63928.9801",
  questions: { B_withdrawalFor25y: "74859.8600", C_corpusFor25y: "10686634.9943", C_totalWithdrawn: "24000000.0000", C_growthSupplied: "13313365.0000", C_growthShare: "55.47" },
  increase5Year10Monthly: "124106.2573",
  increase3Year2Monthly: "82400.0000",
  // label: [withdrawal, return, yearly increase, state, months, partial, ending]
  sens: {
    base: [80000, 8, 0, "used-up", 250, "20680.4637", "0.0000"],
    return6: [80000, 6, 0, "used-up", 191, "44211.3180", "0.0000"],
    return9: [80000, 9, 0, "used-up", 313, "10571.2319", "0.0000"],
    return10: [80000, 10, 0, "used-up", 566, "37675.2883", "0.0000"],
    withdraw90k: [90000, 8, 0, "used-up", 193, "16816.7382", "0.0000"],
    withdraw70k: [70000, 8, 0, "used-up", 381, "15926.4413", "0.0000"],
    withdraw66k: [66000, 8, 0, "used-up", 539, "49232.0711", "0.0000"],
    withdraw65k: [65000, 8, 0, "not-used-up", 600, "0.0000", "2309975.9185"],
    withdraw60k: [60000, 8, 0, "not-used-up", 600, "0.0000", "38210448.9349"],
    increase3: [80000, 8, 3, "used-up", 175, "18020.0634", "0.0000"],
    increase5: [80000, 8, 5, "used-up", 151, "95420.0101", "0.0000"],
  },
};

const CORPUS = 10000000;
const N = Number;
const near = (a, b, label, tol = 0.0101) => assert.ok(Math.abs(a - N(b)) <= tol, `${label}: ${a} vs ${b}`);
const rupees = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const dur = (m) => {
  const y = Math.floor(m / 12), r = m % 12;
  return [y ? `${y} year${y === 1 ? "" : "s"}` : "", r ? `${r} month${r === 1 ? "" : "s"}` : ""].filter(Boolean).join(" ");
};
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/swp/${slug}.js`)).default);
const lasts = (withdrawal, annualReturn, increase = 0, corpus = CORPUS) => calculateSwp({ mode: "lasts", corpus, withdrawal, annualReturn, increase, periodsPerYear: 12 });
const monthsOf = (r) => r.answer.months;

const ONE = "how-a-systematic-withdrawal-plan-works";
const TWO = "what-changes-how-long-a-corpus-lasts";

describe("the engine reproduces the reference figures behind the articles", () => {
  test("every sensitivity plan: state, duration, part-paid withdrawal and balance left", () => {
    for (const [label, [withdrawal, rate, increase, state, months, partial, ending]] of Object.entries(REF.sens)) {
      const r = lasts(withdrawal, rate, increase);
      assert.equal(r.answer.state, state, `${label} state`);
      assert.equal(monthsOf(r), months, `${label} months`);
      near(r.answer.partialWithdrawal, partial, `${label} partial`);
      near(r.totals.ending, ending, `${label} ending`);
    }
  });

  test("one month of the baseline plan: withdraw first, then grow the remainder", () => {
    assert.equal((periodReturn(8, 12) * 100).toFixed(4), REF.monthlyReturnPercent);
    const remaining = CORPUS - 80000;
    near(remaining, REF.period.remaining, "remaining", 1e-6);
    const growth = remaining * periodReturn(8, 12);
    near(growth, REF.period.growth, "growth", 0.01);
    near(remaining + growth, REF.period.closing, "closing", 0.01);
    // the engine's own first year is the twelve of these: the first month is the same cycle
    const y1 = lasts(80000, 8).yearly[0];
    assert.equal(y1.year, 1);
    assert.ok(y1.closing < CORPUS, "the baseline balance falls");
  });

  test("the level where one month's growth equals the withdrawal: below it the balance rises, above it it falls", () => {
    const i = periodReturn(8, 12);
    near(CORPUS * i / (1 + i), REF.threshold, "threshold", 0.01);
    assert.ok(lasts(63928, 8).yearly[0].closing > CORPUS, "just below the level the balance rises");
    assert.ok(lasts(63930, 8).yearly[0].closing < CORPUS, "just above the level the balance falls");
    assert.equal(lasts(60000, 8).answer.state, "not-used-up");
  });

  test("the three questions on one set of assumptions, and where the growth comes from", () => {
    const c = calculateSwp({ mode: "corpus", withdrawal: 80000, years: 25, annualReturn: 8, increase: 0, periodsPerYear: 12 });
    near(c.answer.corpus, REF.questions.C_corpusFor25y, "corpus needed");
    assert.equal(Math.ceil(c.answer.corpus), 10686635, "shown rounded up");
    near(c.totals.withdrawn, REF.questions.C_totalWithdrawn, "total withdrawn");
    near(c.totals.growth, REF.questions.C_growthSupplied, "growth supplied");
    const b = calculateSwp({ mode: "withdraw", corpus: CORPUS, years: 25, annualReturn: 8, increase: 0, periodsPerYear: 12 });
    near(b.answer.firstWithdrawal, REF.questions.B_withdrawalFor25y, "first withdrawal");
    assert.equal(Math.floor(b.answer.firstWithdrawal), 74859, "shown rounded down");
    assert.equal((N(REF.questions.C_growthSupplied) / N(REF.questions.C_totalWithdrawn) * 100).toFixed(2), REF.questions.C_growthShare);
    // the corpus the plan needs lasts the 25 years; the baseline crore does not
    assert.equal(monthsOf(lasts(80000, 8, 0, 10686635)), 300);
    assert.ok(monthsOf(lasts(80000, 8)) < 300);
    // Rs 80,000 for 25 years is more than the corpus, and less than half of it comes from the corpus itself
    assert.ok(N(REF.questions.C_totalWithdrawn) > CORPUS && 10686635 < N(REF.questions.C_totalWithdrawn) / 2);
  });

  test("a yearly increase is applied once a year to the monthly withdrawal", () => {
    near(lasts(80000, 8, 3).yearly[1].withdrawals / 12, REF.increase3Year2Monthly, "3% year 2");
    near(lasts(80000, 8, 5).yearly[9].withdrawals / 12, REF.increase5Year10Monthly, "5% year 10");
  });

  test("each extra point of return adds more than the one before", () => {
    const m = [6, 7, 8, 9, 10].map((r) => monthsOf(lasts(80000, r)));
    const gains = m.slice(1).map((v, k) => v - m[k]);
    for (let k = 1; k < gains.length; k++) assert.ok(gains[k] > gains[k - 1], `gain ${k}: ${gains}`);
  });
});

describe("every figure in 'How a Systematic Withdrawal Plan Works' is the calculator's", () => {
  test("the month, the 25-year comparison, the threshold, the durations and the three questions", async () => {
    const t = await text(ONE);
    has(t, [rupees(CORPUS), rupees(80000), rupees(N(REF.period.remaining)), rupees(N(REF.period.growth)), rupees(N(REF.period.closing)), `${REF.monthlyReturnPercent}%`]);
    has(t, [rupees(N(REF.questions.C_totalWithdrawn)), rupees(Math.ceil(N(REF.questions.C_corpusFor25y))), rupees(N(REF.questions.C_growthSupplied)), `${Math.round(N(REF.questions.C_growthShare))}%`]);
    has(t, [rupees(N(REF.threshold)), dur(monthsOf(lasts(80000, 8))), rupees(60000), rupees(N(REF.sens.withdraw60k[6])), "50-year"]);
    has(t, [rupees(Math.floor(N(REF.questions.B_withdrawalFor25y)))]);
  });

  test("the diagram's alt text states the figures the diagram shows", async () => {
    const { articles } = await import("../../assets/js/data/articles.js");
    const a = articles.find((x) => x.slug === ONE);
    // the five rows of the diagram, top to bottom, as tests/fixtures/swp-article-diagram.py draws them from the reference
    const rows = [rupees(CORPUS), rupees(80000), rupees(N(REF.period.remaining)), rupees(N(REF.period.growth)), rupees(N(REF.period.closing))];
    for (const alt of [a.heroImage.alt, a.cardImage.alt]) {
      has(alt, rows);
      const at = rows.map((r) => alt.indexOf(r));
      assert.deepEqual([...at].sort((x, y) => x - y), at, "the alt text lists the rows in the diagram's order");
    }
  });
});

describe("every figure in 'What Changes How Long a Corpus Lasts' is the calculator's", () => {
  test("the baseline, the return, the withdrawal and the yearly increase", async () => {
    const t = await text(TWO);
    const d = (label) => dur(REF.sens[label][4]);
    has(t, ["₹1 crore", rupees(80000), d("base"), d("return6"), d("return9"), d("return10"), d("withdraw90k"), d("withdraw70k"), d("withdraw66k"), d("increase3"), d("increase5")]);
    has(t, [rupees(90000), rupees(70000), rupees(66000), rupees(65000), rupees(N(REF.sens.withdraw65k[6])), rupees(N(REF.threshold)), "50-year"]);
    has(t, [rupees(N(REF.increase3Year2Monthly)), rupees(N(REF.increase5Year10Monthly))]);
  });

  test("every difference the text states is the difference of the durations", async () => {
    const t = await text(TWO);
    const m = (label) => REF.sens[label][4];
    has(t, [`${dur(m("base") - m("return6"))} less than the baseline`, `adds ${dur(m("return10") - m("base"))}`, `adds ${dur(m("return9") - m("base"))}`, `another ${dur(m("return10") - m("return9"))}`]);
    has(t, [`${dur(m("withdraw70k") - m("base"))} longer than the baseline`, `a further ${dur(m("withdraw66k") - m("withdraw70k"))}`]);
    has(t, [`${dur(m("base") - m("increase3"))} shorter than the baseline`, `${dur(m("base") - m("increase5"))} shorter`]);
    // and the engine agrees with the reference on those durations
    assert.equal(monthsOf(lasts(80000, 6)), m("return6"));
    assert.equal(monthsOf(lasts(66000, 8)), m("withdraw66k"));
    assert.equal(lasts(65000, 8).answer.state, "not-used-up");
  });
});

/*
 * The checks above prove each correct figure is PRESENT; they cannot see a wrong copy of a figure that is repeated (a figure appears in
 * the key takeaways, a section and the example). So every rupee amount, duration and percentage in an article must also be a KNOWN one.
 */
const figuresOf = (t) => ({
  rupees: new Set(t.match(/₹\d+(?:,\d+)*/g) || []),
  durations: new Set((t.match(/\d+ years?(?: \d+ months?)?|\d+ months?/g) || [])),
  percents: new Set(t.match(/\d+(?:\.\d+)?%/g) || []),
});
const unknown = (found, allowed) => [...found].filter((f) => !allowed.has(f));

describe("no figure in either article is unknown to the reference", () => {
  const m = (label) => REF.sens[label][4];
  const R = (n) => rupees(n);

  test("'How a Systematic Withdrawal Plan Works': every rupee amount, duration and percentage is a reference figure", async () => {
    const f = figuresOf(await text(ONE));
    const rupeesOk = new Set(["₹1", R(CORPUS), R(80000), R(N(REF.period.remaining)), R(N(REF.period.growth)), R(N(REF.period.closing)), R(N(REF.questions.C_totalWithdrawn)),
      R(Math.ceil(N(REF.questions.C_corpusFor25y))), R(N(REF.questions.C_growthSupplied)), R(N(REF.threshold)), R(60000), R(N(REF.sens.withdraw60k[6])), R(Math.floor(N(REF.questions.B_withdrawalFor25y)))]);
    const durationsOk = new Set([dur(m("base")), "25 years"]);
    const percentsOk = new Set(["8%", `${REF.monthlyReturnPercent}%`, `${Math.round(N(REF.questions.C_growthShare))}%`]);
    assert.deepEqual(unknown(f.rupees, rupeesOk), []);
    assert.deepEqual(unknown(f.durations, durationsOk), []);
    assert.deepEqual(unknown(f.percents, percentsOk), []);
  });

  test("'What Changes How Long a Corpus Lasts': every rupee amount, duration and percentage is a reference figure", async () => {
    const f = figuresOf(await text(TWO));
    // the two cuts the text names are plain differences of the withdrawals above: 70,000 to 66,000 and 66,000 to 65,000
    const rupeesOk = new Set(["₹1", R(80000), R(90000), R(70000), R(66000), R(65000), R(70000 - 66000), R(66000 - 65000), R(N(REF.threshold)), R(N(REF.sens.withdraw65k[6])), R(N(REF.increase3Year2Monthly)), R(N(REF.increase5Year10Monthly))]);
    const durationsOk = new Set(["base", "return6", "return9", "return10", "withdraw90k", "withdraw70k", "withdraw66k", "increase3", "increase5"].map((l) => dur(m(l))));
    for (const d of [m("base") - m("return6"), m("return10") - m("base"), m("return9") - m("base"), m("return10") - m("return9"), m("withdraw70k") - m("base"), m("withdraw66k") - m("withdraw70k"), m("base") - m("increase3"), m("base") - m("increase5")]) durationsOk.add(dur(d));
    const percentsOk = new Set(["3%", "5%", "6%", "8%", "9%", "10%"]);
    assert.deepEqual(unknown(f.rupees, rupeesOk), []);
    assert.deepEqual(unknown(f.durations, durationsOk), []);
    assert.deepEqual(unknown(f.percents, percentsOk), []);
  });
});

describe("the pack is exactly two articles with the planned relationships", () => {
  test("two published SWP articles, no third, both tied to the SWP calculator; only the first has an image", async () => {
    const { articles } = await import("../../assets/js/data/articles.js");
    const swp = articles.filter((a) => a.topic === "swp");
    assert.deepEqual(swp.map((a) => [a.id, a.slug, a.status, a.category]), [[39, ONE, "published", "investment"], [40, TWO, "published", "investment"]]);
    for (const a of swp) assert.deepEqual(a.tools, ["swp"]);
    assert.deepEqual(swp[0].related, [`swp/${TWO}`, "sip/how-a-sip-grows"]);
    assert.deepEqual(swp[1].related, [`swp/${ONE}`, "sip/how-return-assumptions-change-a-sip-projection"]);
    assert.ok(swp[0].heroImage && swp[0].cardImage);
    assert.equal(swp[1].heroImage, null);
    assert.equal(swp[1].cardImage, null);
  });

  test("the diagram ships as a 1200 x 675 PNG with a smaller WebP next to it", () => {
    const base = `assets/Images/articles/${ONE}`;
    const png = fs.readFileSync(`${base}.png`);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 675]);
    const webp = fs.readFileSync(`${base}.webp`);
    assert.equal(webp.subarray(0, 4).toString(), "RIFF");
    assert.equal(webp.subarray(8, 12).toString(), "WEBP");
    assert.ok(webp.length < png.length, "the WebP is the smaller file");
    assert.ok(png.length < 150 * 1024, `PNG is ${png.length} bytes`);
  });
});

describe("investment-trust wording", () => {
  test("no safe-withdrawal, 4% rule, recommendation or certainty language in either SWP article", async () => {
    for (const s of [ONE, TWO]) {
      const t = (await text(s)).toLowerCase();
      for (const bad of ["safe withdrawal", "4% rule", "guaranteed", "ideal", "best", "recommend", "you should withdraw", "expected to earn", "risk-free", "will earn", "assured"]) {
        const i = t.indexOf(bad);
        assert.ok(i < 0 || /not|no |never|neither|nothing|nor /.test(t.slice(Math.max(0, i - 40), i)), `${s}: "${bad}"`);
      }
      assert.ok(t.includes("modeled") && t.includes("assumed"), `${s}: states the figures are modeled and assumed`);
      assert.ok(t.includes("not forecasts") || t.includes("not a forecast"), `${s}: states they are not forecasts`);
      assert.ok(t.includes("market risk"), `${s}: mentions market risk`);
    }
  });
});
