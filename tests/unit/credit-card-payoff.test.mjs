/**
 * Tool Pack 24: the Credit Card Payoff engine (assets/js/calculators/formulas/credit-card-payoff.js).
 *
 * The expected values come from tests/fixtures/credit-card-payoff-golden.json, written by
 * tests/fixtures/credit-card-payoff-golden.py from the specification with the Python standard library (a 60-digit
 * Decimal simulation, an exact Fraction simulation with no tolerance, the closed-form payment count and the annuity
 * formula), not from the engine. The engine uses BigInt fixed-point integers; the reference does not.
 *
 * What is pinned: exact parsing (two decimals, no rounding, no exponent, no sign, no separators), the bounds, the
 * exact non-amortizing test one paisa either side of the interest, the three distinct outcomes, the 600/601 boundary,
 * the half-paisa rule and its cases, conservation, monotonicity, the comparison table (a saving only when both sides
 * pay off), the exact wording, the absence of any floating-point balance arithmetic, and the missing-BigInt behaviour.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  HORIZON_MONTHS,
  LIMITS,
  MESSAGES,
  parseHundredths,
  validateInputs,
  simulatePayoff,
  calculatePayoff,
  formatPaise,
  describeMonths,
  outcomeSentence,
  comparisonSentences,
  announcement,
  EXAMPLE,
} from "../../assets/js/calculators/formulas/credit-card-payoff.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_PATH = path.join(HERE, "..", "..", "assets", "js", "calculators", "formulas", "credit-card-payoff.js");
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "credit-card-payoff-golden.json"), "utf8"));
const SOURCE = fs.readFileSync(ENGINE_PATH, "utf8");

const SCALE = 10n ** 24n;

/** the engine's integer inputs from the golden strings, through the engine's own parser */
function inputsOf(v) {
  const check = validateInputs({ balance: v.balance, apr: v.apr, payment: v.payment, comparePayment: "" });
  assert.equal(check.ok, true, JSON.stringify(v));
  return { balancePaise: check.values.balancePaise, aprHundredths: check.values.aprHundredths, paymentPaise: check.values.paymentPaise };
}

/** "123456.123456789012" (paise with 12 decimals, from Python) as a fixed-point BigInt */
function scaled12(text) {
  const [whole, frac] = text.split(".");
  return BigInt(whole) * SCALE + BigInt(frac.padEnd(12, "0")) * 10n ** 12n;
}

function assertMatches(v) {
  const r = simulatePayoff(inputsOf(v));
  assert.equal(r.state, v.state, v.name);
  assert.equal(r.firstInterestPaise, v.firstInterestPaise, `${v.name}: first interest`);
  if (v.state === "non-amortizing") {
    assert.equal(r.smallestReducingPaise, v.smallestReducingPaise, `${v.name}: smallest reducing payment`);
  } else if (v.state === "payoff") {
    assert.equal(r.months, v.months, `${v.name}: months`);
    assert.equal(r.totalRepaidPaise, v.totalRepaidPaise, `${v.name}: total repaid`);
    assert.equal(r.totalInterestPaise, v.totalInterestPaise, `${v.name}: total interest`);
    assert.equal(r.finalPaymentPaise, v.finalPaymentPaise, `${v.name}: final payment`);
    // the exact fixed-point totals agree with the reference to a hundred-billionth of a paisa
    const tol = 10n ** 13n;
    const dTotal = r._total - scaled12(v.totalRepaid12);
    const dInterest = r._interest - scaled12(v.totalInterest12);
    assert.ok((dTotal < 0n ? -dTotal : dTotal) <= tol, `${v.name}: exact total off by ${dTotal}`);
    assert.ok((dInterest < 0n ? -dInterest : dInterest) <= tol, `${v.name}: exact interest off by ${dInterest}`);
  }
}

describe("the independent reference", () => {
  test("every named vector: the specification's worked examples, one paisa either side of the interest, the 600/601 boundary, the half-paisa cases and the extremes", () => {
    assert.ok(GOLD.named.length >= 30);
    for (const v of GOLD.named) assertMatches(v);
  });

  test("the headline cases are the verified figures", () => {
    const by = (name) => GOLD.named.find((v) => v.name === name);
    const five = simulatePayoff(inputsOf(by("one paisa above the interest, 42%")));
    assert.deepEqual([five.state, five.months, five.totalRepaidPaise, five.totalInterestPaise, five.finalPaymentPaise], ["payoff", 372, 129878918, 119878918, 28547]);
    assert.equal(simulatePayoff(inputsOf(by("exactly the interest, 42%"))).state, "non-amortizing");
    assert.equal(simulatePayoff(inputsOf(by("one paisa below the interest, 42%"))).state, "non-amortizing");
    const one = simulatePayoff(inputsOf(by("example 1")));
    assert.deepEqual([one.months, one.totalRepaidPaise, one.totalInterestPaise, one.finalPaymentPaise, one.firstInterestPaise], [24, 7036029, 2036029, 136029, 150000]);
  });

  test("a seeded sample of 300 cases over every state (payoff, non-amortizing, beyond the horizon)", () => {
    const states = new Set(GOLD.sample.map((v) => v.state));
    assert.deepEqual([...states].sort(), ["beyond-horizon", "non-amortizing", "payoff"]);
    for (const v of GOLD.sample) assertMatches(v);
  });

  test("the annuity cross-check: the payment that clears a balance in N months, rounded up to the paisa, takes at most N payments; one paisa less takes more", () => {
    for (const a of GOLD.annuity) {
      const base = { balancePaise: parseHundredths(a.balance), aprHundredths: parseHundredths(a.apr) };
      const at = simulatePayoff({ ...base, paymentPaise: a.paymentPaise });
      assert.equal(at.state, "payoff");
      assert.equal(at.months, a.monthsAtPayment);
      assert.ok(at.months <= a.months);
      const below = simulatePayoff({ ...base, paymentPaise: a.paymentPaise - 1 });
      assert.equal(below.state, a.belowState);
      if (a.monthsBelow !== null) assert.equal(below.months, a.monthsBelow);
      assert.ok(below.state !== "payoff" || below.months > a.months);
    }
  });

  test("exhaustive: balances, APRs and payments from just below to just above the first month's interest are classified and counted as the reference does", () => {
    const h = crypto.createHash("sha256");
    for (const b of [10000, 12345, 99999, 100000, 2500000, 25000000, 1000000000]) {
      for (const a of [0, 1, 7, 100, 1200, 3600, 4200, 4250, 9999, 10000]) {
        const floor = Math.floor((b * a) / 120000);
        const ps = [...new Set([Math.max(100, floor - 1), Math.max(100, floor), Math.max(100, floor + 1), Math.max(100, floor + 2), 100, 1000000000])].sort((x, y) => x - y);
        for (const p of ps) {
          if (p > 1000000000) continue;
          const r = simulatePayoff({ balancePaise: b, aprHundredths: a, paymentPaise: p });
          h.update(`${b},${a},${p},${r.state},${r.state === "payoff" ? r.months : -1}\n`);
        }
      }
    }
    assert.equal(h.digest("hex"), GOLD.digests.threshold);
  });
});

describe("the three outcomes are different states", () => {
  const run = (balance, apr, payment) => simulatePayoff(inputsOf({ balance, apr, payment }));

  test("a payment at or below the first month's interest never reduces the balance (decided exactly, in integers)", () => {
    assert.equal(run("100000", "42", "3500").state, "non-amortizing"); // exactly the interest
    assert.equal(run("100000", "42", "3499.99").state, "non-amortizing");
    assert.equal(run("100000", "42", "3500.01").state, "payoff"); // one paisa above
    assert.equal(run("250000", "40", "8333.33").state, "non-amortizing"); // the interest is 8333.3333...
    assert.equal(run("250000", "40", "8333.34").state, "payoff");
    assert.equal(run("10000000", "100", "833333.33").state, "non-amortizing");
    assert.equal(run("10000000", "100", "833333.34").state, "payoff");
    // the non-amortizing result carries no payoff figures at all
    const n = run("100000", "42", "3500");
    for (const key of ["months", "totalRepaidPaise", "totalInterestPaise", "finalPaymentPaise"]) assert.equal(key in n, false, key);
  });

  test("the smallest payment that starts to reduce the balance is the first interest rounded up to the next paisa (one more when exact)", () => {
    for (const [b, a] of [["100000", "42"], ["250000", "40"], ["50000", "36"], ["12345.67", "13.37"], ["100", "100"]]) {
      const inputs = inputsOf({ balance: b, apr: a, payment: "1" });
      const n = simulatePayoff({ ...inputs, paymentPaise: Math.max(100, Math.floor((inputs.balancePaise * inputs.aprHundredths) / 120000)) });
      if (n.state !== "non-amortizing") continue;
      assert.notEqual(simulatePayoff({ ...inputs, paymentPaise: n.smallestReducingPaise }).state, "non-amortizing", `${b} ${a}`);
      assert.equal(simulatePayoff({ ...inputs, paymentPaise: n.smallestReducingPaise - 1 }).state, "non-amortizing", `${b} ${a}`);
    }
    assert.equal(run("100000", "42", "3000").smallestReducingPaise, 350001);
    assert.equal(run("250000", "40", "7500").smallestReducingPaise, 833334);
  });

  test("beyond the horizon is not non-amortizing: the payment exceeds the interest but a balance remains after payment 600", () => {
    for (const p of ["1001", "1002"]) {
      const r = run("100000", "12", p);
      assert.equal(r.state, "beyond-horizon", p);
      for (const key of ["months", "totalRepaidPaise", "totalInterestPaise", "finalPaymentPaise"]) assert.equal(key in r, false, key);
    }
    assert.equal(run("100000", "12", "1005").state, "payoff");
    assert.equal(run("100000", "12", "1005").months, 533);
  });

  test("at a high APR the state is unreachable: one paisa above the interest still pays off (372 payments at 42%)", () => {
    assert.equal(run("100000", "42", "3500.01").months, 372);
  });

  test("the 600-payment boundary: 600 payments is a payoff, 601 is beyond the horizon", () => {
    const p600 = run("60000", "0", "100");
    assert.deepEqual([p600.state, p600.months, p600.totalRepaidPaise, p600.finalPaymentPaise], ["payoff", 600, 6000000, 10000]);
    assert.equal(HORIZON_MONTHS, 600);
    assert.equal(run("60000", "0", "99.99").state, "beyond-horizon");
    assert.equal(run("60000", "0", "100.01").months, 600); // 599 full payments and a small last one
    assert.equal(run("60000", "0", "100.01").state, "payoff");
  });

  test("zero APR: never non-amortizing, no interest, months are the balance over the payment rounded up", () => {
    const r = run("24000", "0", "2000");
    assert.deepEqual([r.state, r.months, r.totalInterestPaise, r.firstInterestPaise], ["payoff", 12, 0, 0]);
    const odd = run("100", "0", "33.33");
    assert.deepEqual([odd.months, odd.finalPaymentPaise], [4, 1]); // three of 33.33 and a last payment of 0.01
    assert.equal(run("100", "0", "1").months, 100);
  });

  test("a payment above the whole debt plus its first interest clears it in one payment; just below needs two", () => {
    const one = run("1000", "36", "5000");
    assert.deepEqual([one.months, one.totalRepaidPaise, one.totalInterestPaise, one.finalPaymentPaise], [1, 103000, 3000, 103000]);
    assert.equal(run("1000", "36", "1030").months, 1);
    const two = run("1000", "36", "1029.99");
    assert.deepEqual([two.months, two.finalPaymentPaise], [2, 1]);
  });
});

describe("the half-paisa residual rule", () => {
  const run = (balance, apr, payment) => simulatePayoff(inputsOf({ balance, apr, payment }));

  test("a residual under half a paisa is paid with the last payment, so no tiny extra payment is created (three reference cases)", () => {
    // ₹371.95 at 5.01% and ₹10.87: the amount due in payment 37 is ₹10.8724; an exact model would need a 38th payment of 0.24 paisa
    assert.deepEqual([run("371.95", "5.01", "10.87").months, run("371.95", "5.01", "10.87").totalRepaidPaise], [37, 40219]);
    assert.equal(run("1587.71", "8.29", "53.97").months, 33);
    assert.equal(run("2228.07", "42.42", "135.70").months, 25);
    for (const v of GOLD.named.filter((n) => n.name.startsWith("half-paisa rule"))) assert.equal(v.usedHalfPaisaRule, true, v.name);
  });

  test("the rule decides payoff against beyond-horizon only at payment 600, where a 601st payment of 0.25 paisa would be needed; it never touches the non-amortizing test", () => {
    const r = run("3217.77", "4.75", "14.05");
    assert.deepEqual([r.state, r.months, r.totalRepaidPaise, r.finalPaymentPaise], ["payoff", 600, 843000, 1405]);
    // the same inputs one paisa lower in payment are beyond the horizon: the boundary is real
    assert.equal(run("3217.77", "4.75", "14.04").state, "beyond-horizon");
    // and the exact test is applied first and is independent of the rule
    assert.equal(run("100000", "42", "3500").state, "non-amortizing");
  });

  test("conservation: total repaid minus the balance is exactly the total interest, and every payment but the last is the entered payment", () => {
    for (const v of [...GOLD.named, ...GOLD.sample].filter((n) => n.state === "payoff")) {
      const inputs = inputsOf(v);
      const r = simulatePayoff(inputs);
      assert.equal(r._total - BigInt(inputs.balancePaise) * SCALE, r._interest, v.name);
      assert.ok(r._interest >= 0n, v.name);
      // (months - 1) payments of the entered amount, plus a last payment of at most that amount plus half a paisa
      const lower = BigInt(r.months - 1) * BigInt(inputs.paymentPaise) * SCALE;
      const upper = BigInt(r.months) * BigInt(inputs.paymentPaise) * SCALE + SCALE / 2n;
      assert.ok(r._total >= lower && r._total <= upper, v.name);
      assert.ok(r.finalPaymentPaise >= 0 && r.finalPaymentPaise <= inputs.paymentPaise + 1, v.name);
    }
  });
});

describe("monotonicity: a larger payment never takes longer, never costs more interest, and never moves to a worse state", () => {
  test("over a grid of balances, APRs and rising payments", () => {
    const rank = { "non-amortizing": 0, "beyond-horizon": 1, payoff: 2 };
    for (const b of [10000, 99999, 500000, 12345678]) {
      for (const a of [0, 1200, 3600, 4200, 9999]) {
        let prev = null;
        const interest = Math.floor((b * a) / 120000);
        const payments = [100, interest - 1, interest, interest + 1, interest + 2, interest + 50, interest * 2 + 7, b, b * 2, 1000000000].filter((p) => p >= 100 && p <= 1000000000).sort((x, y) => x - y);
        for (const p of payments) {
          const r = simulatePayoff({ balancePaise: b, aprHundredths: a, paymentPaise: p });
          if (prev) {
            assert.ok(rank[r.state] >= rank[prev.state], `${b} ${a} ${p}: state ${prev.state} -> ${r.state}`);
            if (prev.state === "payoff" && r.state === "payoff") {
              assert.ok(r.months <= prev.months, `${b} ${a} ${p} months`);
              assert.ok(r._interest <= prev._interest, `${b} ${a} ${p} interest`);
            }
          }
          prev = r;
        }
      }
    }
  });
});

describe("the comparison: a saving only when both payments pay off", () => {
  test("every reference pair gives the reference kind, months difference and interest difference (subtracted exactly, rounded once)", () => {
    for (const c of GOLD.comparisons) {
      const check = validateInputs({ balance: c.balance, apr: c.apr, payment: c.payment, comparePayment: c.compare });
      assert.equal(check.ok, true);
      const r = calculatePayoff(check.values);
      assert.equal(r.primary.state, c.state1);
      assert.equal(r.comparison.outcome.state, c.state2);
      assert.equal(r.comparison.kind, c.kind, `${c.payment} vs ${c.compare}`);
      if (c.kind === "difference") {
        assert.equal(r.comparison.monthsDifference, c.monthsDifference);
        assert.equal(r.comparison.interestDifferencePaise, c.interestDifferencePaise);
      } else {
        assert.equal("monthsDifference" in r.comparison, false);
        assert.equal("interestDifferencePaise" in r.comparison, false);
      }
    }
  });

  test("the headline pair: 8 fewer months and exactly 6,752.50 less interest (the rounded totals would subtract to 6,752.49)", () => {
    const r = calculatePayoff(validateInputs({ balance: "50000", apr: "36", payment: "3000", comparePayment: "4000" }).values);
    assert.equal(r.comparison.monthsDifference, 8);
    assert.equal(r.comparison.interestDifferencePaise, 675250);
    assert.equal(r.primary.totalInterestPaise - r.comparison.outcome.totalInterestPaise, 675249); // the one-paisa display caveat
    assert.deepEqual(comparisonSentences(r.comparison), ["Payment 2 takes 8 months fewer than payment 1.", "Payment 2 costs ₹6,752.50 less interest than payment 1."]);
    const flipped = calculatePayoff(validateInputs({ balance: "50000", apr: "36", payment: "4000", comparePayment: "3000" }).values);
    assert.equal(flipped.comparison.monthsDifference, -8);
    assert.equal(flipped.comparison.interestDifferencePaise, -675250);
    assert.deepEqual(comparisonSentences(flipped.comparison), ["Payment 2 takes 8 months more than payment 1.", "Payment 2 costs ₹6,752.50 more interest than payment 1."]);
  });

  test("equal payments are neutral; a blank comparison is no comparison; any non-payoff side gives no difference of any kind", () => {
    const equal = calculatePayoff(validateInputs({ balance: "50000", apr: "36", payment: "3000", comparePayment: "3000.00" }).values);
    assert.equal(equal.comparison.kind, "equal");
    assert.deepEqual(comparisonSentences(equal.comparison), ["The two payments are the same."]);
    assert.equal(calculatePayoff(validateInputs({ balance: "50000", apr: "36", payment: "3000", comparePayment: "" }).values).comparison, null);
    const none = calculatePayoff(validateInputs({ balance: "100000", apr: "42", payment: "3500", comparePayment: "4000" }).values);
    assert.equal(none.comparison.kind, "unavailable");
    assert.equal(none.comparison.outcome.state, "payoff"); // the other side is still shown on its own
    assert.match(comparisonSentences(none.comparison)[0], /no saving in time or interest can be worked out/);
  });
});

describe("parsing and validation", () => {
  test("accepted forms: digits with at most two decimals, a leading point, leading zeros, surrounding spaces", () => {
    for (const [text, value] of [["0", 0], ["5", 500], ["5.5", 550], ["5.50", 550], ["3500.01", 350001], [".5", 50], [".05", 5], ["05", 500], [" 12 ", 1200], ["100.00", 10000], ["99.99", 9999]]) assert.equal(parseHundredths(text), value, text);
  });

  test("refused, never rounded: three decimals, exponent, sign, separators, text, trailing point, other digits and huge numbers", () => {
    for (const text of ["3500.001", "0.001", "1e3", "1E3", "-5", "+5", "1,000", "1 000", "", "  ", "abc", "5.", "1.2.3", ".", "0x10", "٣٥٠٠", "NaN", "Infinity", "99999999999999999999"]) assert.equal(parseHundredths(text), null, JSON.stringify(text));
    assert.equal(parseHundredths(null), null);
    assert.equal(parseHundredths(undefined), null);
  });

  test("the bounds, exactly: balance 100 to 1,00,00,000, APR 0 to 100, payment 1 to 1,00,00,000, one paisa or hundredth outside is refused", () => {
    const ok = { balance: "5000", apr: "30", payment: "500", comparePayment: "" };
    const fields = (raw) => { const r = validateInputs(raw); return r.ok ? [] : r.errors.flatMap((e) => e.fields); };
    assert.deepEqual(fields(ok), []);
    for (const [name, good, bad] of [["balance", ["100", "100.00", "10000000", "10000000.00"], ["99.99", "10000000.01", "0", "-1", "20000000"]], ["apr", ["0", "0.00", "100", "100.00", "99.99"], ["100.01", "101", "-0.01"]], ["payment", ["1", "1.00", "10000000"], ["0.99", "0", "10000000.01"]]]) {
      for (const g of good) assert.deepEqual(fields({ ...ok, [name]: g }), [], `${name} ${g}`);
      for (const b of bad) assert.deepEqual(fields({ ...ok, [name]: b }), [name], `${name} ${b}`);
    }
    assert.deepEqual(fields({ ...ok, comparePayment: "0.99" }), ["comparePayment"]);
    assert.deepEqual(fields({ ...ok, comparePayment: "10000000.01" }), ["comparePayment"]);
    assert.deepEqual(fields({ ...ok, comparePayment: "1" }), []);
    assert.equal(LIMITS.balance.minPaise, 10000);
    assert.equal(LIMITS.balance.maxPaise, 1000000000);
  });

  test("blank required fields and every invalid field are reported with the exact message, in field order; nothing is clamped", () => {
    const r = validateInputs({ balance: "", apr: "abc", payment: "0", comparePayment: "1e3" });
    assert.equal(r.ok, false);
    assert.deepEqual(r.errors.map((e) => e.fields[0]), ["balance", "apr", "payment", "comparePayment"]);
    assert.equal(r.errors[0].message, "Enter a balance between ₹100 and ₹1,00,00,000, with at most 2 decimal places.");
    assert.equal(r.errors[1].message, "Enter an annual percentage rate between 0% and 100%, with at most 2 decimal places.");
    assert.equal(r.errors[2].message, "Enter a monthly payment between ₹1 and ₹1,00,00,000, with at most 2 decimal places.");
    assert.equal(r.errors[3].message, MESSAGES.payment);
    const ok = validateInputs({ balance: "50000", apr: "36", payment: "3000", comparePayment: "4000" });
    assert.deepEqual(ok.values, { balancePaise: 5000000, aprHundredths: 3600, paymentPaise: 300000, comparePaise: 400000 });
  });

  test("the example is valid and gives the specification's first example", () => {
    const check = validateInputs(EXAMPLE);
    assert.equal(check.ok, true);
    const r = calculatePayoff(check.values);
    assert.deepEqual([r.primary.months, r.primary.totalRepaidPaise, r.comparison.outcome.months], [24, 7036029, 16]);
  });
});

describe("text for the page", () => {
  test("money to the paisa with Indian grouping, from integer paise", () => {
    for (const [p, text] of [[0, "₹0.00"], [5, "₹0.05"], [100, "₹1.00"], [136029, "₹1,360.29"], [7036029, "₹70,360.29"], [129878918, "₹12,98,789.18"], [1000000000, "₹1,00,00,000.00"], [-675250, "-₹6,752.50"]]) assert.equal(formatPaise(p), text);
  });

  test("durations", () => {
    for (const [m, text] of [[1, "1 month"], [11, "11 months"], [12, "1 year"], [24, "2 years"], [25, "2 years 1 month"], [600, "50 years"]]) assert.equal(describeMonths(m), text);
  });

  test("the three outcome sentences, exactly", () => {
    const run = (b, a, p) => simulatePayoff(inputsOf({ balance: b, apr: a, payment: p }));
    assert.equal(outcomeSentence(run("50000", "36", "3000")), "Estimated payoff: 24 payments (2 years). The last payment is ₹1,360.29.");
    assert.equal(outcomeSentence(run("50000", "36", "1500")), "Your monthly payment does not cover the first month's interest under this model. A payment of at least ₹1,500.01 is needed to start reducing the balance.");
    assert.equal(outcomeSentence(run("100000", "12", "1002")), "At this payment the estimated payoff is more than 50 years (600 months) away, so no payoff time is shown.");
  });

  test("the announcements", () => {
    const calc = (p, c = "") => calculatePayoff(validateInputs({ balance: "50000", apr: "36", payment: p, comparePayment: c }).values);
    assert.equal(announcement(calc("3000")), "Estimated payoff 2 years. Total interest ₹20,360.29.");
    assert.equal(announcement(calc("1500")), "This payment will not pay off the balance.");
    assert.equal(announcement(calc("3000", "4000")), "Estimated payoff 2 years. Total interest ₹20,360.29. Payment 2 takes 8 months fewer than payment 1. Payment 2 costs ₹6,752.50 less interest than payment 1.");
    assert.equal(announcement(calc("1500", "4000")), "This payment will not pay off the balance. No comparison of time or interest is available.");
    assert.equal(announcement(calc("3000", "3000")), "Estimated payoff 2 years. Total interest ₹20,360.29. The two payments are the same.");
    assert.equal(announcement(calculatePayoff(validateInputs({ balance: "100000", apr: "12", payment: "1002", comparePayment: "" }).values)), "No payoff within 50 years at this payment.");
  });

  test("nothing the engine writes promises a date, guarantees a result, recommends a payment or gives advice", () => {
    const texts = [...Object.values(MESSAGES), outcomeSentence({ state: "non-amortizing", firstInterestPaise: 150000, smallestReducingPaise: 150001 }), outcomeSentence({ state: "beyond-horizon" }), outcomeSentence({ state: "payoff", months: 24, finalPaymentPaise: 136029 }), ...comparisonSentences({ kind: "unavailable" }), ...comparisonSentences({ kind: "difference", monthsDifference: 8, interestDifferencePaise: 675250 })];
    for (const t of texts) assert.equal(/guarantee|your payoff date|debt-free|recommend|you should|best|advice|promise/i.test(t), false, t);
  });
});

describe("the non-amortizing threshold and its wording (the audit's correction)", () => {
  const run = (balance, apr, payment) => simulatePayoff(inputsOf({ balance, apr, payment }));
  /** the rupee amount a sentence names after "at least", in paise */
  const named = (sentence) => {
    const m = /at least ₹([0-9,]+)[.]([0-9]{2}) is needed/.exec(sentence);
    assert.ok(m, sentence);
    return Number(m[1].replace(/,/g, "")) * 100 + Number(m[2]);
  };
  const SENTENCE = (amount) => `Your monthly payment does not cover the first month's interest under this model. A payment of at least ${amount} is needed to start reducing the balance.`;

  test("fractional-paisa interest of 1,001.6667: 1,001.66 does not reduce the balance, 1,001.67 does; the warning names 1,001.67 and never says 1,001.67 does not help", () => {
    const below = run("100000", "12.02", "1001.66");
    assert.equal(below.state, "non-amortizing");
    assert.equal(below.firstInterestPaise, 100167); // the shown (rounded) interest is 1,001.67 ...
    assert.equal(below.smallestReducingPaise, 100167); // ... and so is the smallest reducing payment, from the exact threshold
    assert.equal(outcomeSentence(below), SENTENCE("₹1,001.67"));
    assert.equal(/or less|does not reduce the balance\. A payment above/.test(outcomeSentence(below)), false);
    // the payment the warning names really does reduce the balance (a very slow payoff, so beyond the horizon, never non-amortizing)
    const at = run("100000", "12.02", "1001.67");
    assert.equal(at.state, "beyond-horizon");
    assert.notEqual(at.state, "non-amortizing");
    // and one paisa less still does not
    assert.equal(run("100000", "12.02", "1001.66").state, "non-amortizing");
    // the reference agrees on both
    for (const name of ["fractional-paisa interest (1001.6667), one paisa below the smallest reducing payment", "fractional-paisa interest (1001.6667), the smallest reducing payment"]) assertMatches(GOLD.named.find((v) => v.name === name));
  });

  test("interest that is exactly a whole number of paise: the payment equal to it does not reduce the balance, one paisa more does", () => {
    const exact = run("100000", "42", "3500");
    assert.equal(exact.state, "non-amortizing");
    assert.equal(exact.smallestReducingPaise, 350001);
    assert.equal(outcomeSentence(exact), SENTENCE("₹3,500.01"));
    assert.notEqual(run("100000", "42", "3500.01").state, "non-amortizing");
  });

  test("interest with a fraction of a paisa below one half (8,333.3333): the smallest reducing payment is the next paisa up, 8,333.34", () => {
    const frac = run("250000", "40", "8333.33");
    assert.equal(frac.state, "non-amortizing");
    assert.equal(frac.smallestReducingPaise, 833334);
    assert.equal(outcomeSentence(frac), SENTENCE("₹8,333.34"));
    assert.notEqual(run("250000", "40", "8333.34").state, "non-amortizing");
  });

  test("zero APR has no threshold: it is never non-amortizing, so the warning never appears", () => {
    for (const p of ["1", "100", "9999.99"]) assert.notEqual(run("10000", "0", p).state, "non-amortizing", p);
    assert.equal(validateInputs({ balance: "10000", apr: "0", payment: "1", comparePayment: "" }).ok, true);
  });

  test("the threshold is derived from integers, not from the displayed interest: the sentence's amount is the exact smallest reducing payment, and the payment just below it is non-amortizing, over a seeded grid", () => {
    let seed = 99;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    let fractional = 0;
    for (let i = 0; i < 4000; i++) {
      const balancePaise = Math.floor(10000 + rnd() * 20000000);
      const aprHundredths = 1 + Math.floor(rnd() * 9999);
      const exactFloor = Math.floor((balancePaise * aprHundredths) / 120000);
      const paymentPaise = Math.max(100, exactFloor - Math.floor(rnd() * 3));
      const r = simulatePayoff({ balancePaise, aprHundredths, paymentPaise });
      if (r.state !== "non-amortizing") continue;
      if ((balancePaise * aprHundredths) % 120000 !== 0) fractional++;
      assert.equal(r.smallestReducingPaise, exactFloor + 1);
      assert.equal(named(outcomeSentence(r)), r.smallestReducingPaise);
      // the named payment is strictly above the exact interest; the one before it is not
      assert.ok(r.smallestReducingPaise * 120000 > balancePaise * aprHundredths);
      assert.ok((r.smallestReducingPaise - 1) * 120000 <= balancePaise * aprHundredths);
      assert.notEqual(simulatePayoff({ balancePaise, aprHundredths, paymentPaise: r.smallestReducingPaise }).state, "non-amortizing");
      if (r.smallestReducingPaise - 1 >= 100) assert.equal(simulatePayoff({ balancePaise, aprHundredths, paymentPaise: r.smallestReducingPaise - 1 }).state, "non-amortizing");
    }
    assert.ok(fractional > 100, "the grid must contain many fractional-paisa interests");
  });

  test("the warning does not promise a payoff: it says only that the balance starts to reduce", () => {
    const text = outcomeSentence(run("100000", "42", "3500"));
    assert.equal(/pay(s)? off|payoff|within|guarantee|will clear/i.test(text.replace("will not pay off", "")), false, text);
    assert.match(text, /needed to start reducing the balance\.$/);
  });
});

describe("the half-paisa tie: the amount due is exactly half a paisa above the payment", () => {
  test("₹100 at 0.06% APR with ₹100: one payment of ₹100.005, shown as ₹100.01 with ₹0.01 of interest, as the reference gives (the page discloses the rule)", () => {
    const v = GOLD.named.find((n) => n.name.startsWith("tie:"));
    assertMatches(v);
    const r = simulatePayoff(inputsOf(v));
    assert.deepEqual([r.state, r.months, r.finalPaymentPaise, r.totalRepaidPaise, r.totalInterestPaise], ["payoff", 1, 10001, 10001, 1]);
    assert.equal(v.usedHalfPaisaRule, true);
    assert.equal(r.finalPaymentPaise - inputsOf(v).paymentPaise, 1); // shown one paisa above the entered payment: the rule, not an error
    assert.equal(r.totalRepaidPaise - inputsOf(v).balancePaise, r.totalInterestPaise); // still consistent at the displayed precision
  });
});

describe("exact arithmetic, and what happens without BigInt", () => {
  const code = SOURCE.replace(/[/][*][^]*?[*][/]/g, "").replace(/^[ ]*[/][/].*$/gm, "");

  test("the engine's code has no floating-point money: no Math.pow, parseFloat, toFixed, Math.round, no BigInt literals, no Date, storage or network", () => {
    for (const banned of ["Math.pow", "parseFloat", "toFixed", "Math.round", "Math.ceil", "Date", "setTimeout", "fetch", "XMLHttpRequest", "localStorage", "sessionStorage", "document", "window"]) {
      assert.equal(code.includes(banned), false, banned);
    }
    assert.equal(/[0-9]n[^a-zA-Z0-9_]/.test(code), false, "a BigInt literal (12n) would stop the file loading where BigInt is missing");
    assert.ok(code.includes("BigInt("));
  });

  test("without BigInt the module still loads, says so, and refuses to calculate instead of using imprecise arithmetic", async () => {
    const saved = globalThis.BigInt;
    try {
      globalThis.BigInt = undefined;
      const mod = await import(`${pathToFileURL(ENGINE_PATH).href}?without-bigint`);
      assert.equal(mod.BIGINT_AVAILABLE, false);
      assert.throws(() => mod.simulatePayoff({ balancePaise: 5000000, aprHundredths: 3600, paymentPaise: 300000 }), /exact arithmetic/);
      assert.equal(mod.validateInputs({ balance: "50000", apr: "36", payment: "3000", comparePayment: "" }).ok, true); // parsing needs none
    } finally {
      globalThis.BigInt = saved;
    }
    assert.equal(typeof BigInt, "function");
  });

  test("the same inputs give the same result, and the inputs are not changed", () => {
    const inputs = Object.freeze({ balancePaise: 5000000, aprHundredths: 3600, paymentPaise: 300000 });
    assert.deepEqual(simulatePayoff(inputs), simulatePayoff(inputs));
  });

  test("bounded work: the largest and slowest cases finish at once (600 iterations at most)", () => {
    const started = process.hrtime.bigint();
    for (let i = 0; i < 200; i++) simulatePayoff({ balancePaise: 1000000000, aprHundredths: 9999, paymentPaise: 83325000 + (i % 3) });
    simulatePayoff({ balancePaise: 10000000, aprHundredths: 1200, paymentPaise: 100200 });
    assert.ok(Number(process.hrtime.bigint() - started) / 1e6 < 2000);
  });
});
