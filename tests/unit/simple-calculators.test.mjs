/**
 * The ten calculators built on common/simple-calculator.js: ROI, Ratio, Interest, Age, Personal Loan, Loan
 * Eligibility, BMI, BMR, Calorie and Unit Converter. Expected figures are worked by hand (shown in comments), not
 * produced by the code under test. NOT covered here: the DOM wiring in init() and the layout (a browser and the
 * owner's review). Run directly: node --test tests/unit/simple-calculators.test.mjs
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

import { parseNumber, money, plain } from "../../assets/js/calculators/common/number-text.js";
import { solveRoi } from "../../assets/js/calculators/formulas/roi.js";
import { solveRatio, simplify } from "../../assets/js/calculators/formulas/ratio.js";
import { solveInterest, simpleInterest, compoundAmount } from "../../assets/js/calculators/formulas/interest.js";
import { solveAge } from "../../assets/js/calculators/formulas/age.js";
import { solvePersonalLoan } from "../../assets/js/calculators/formulas/personal-loan.js";
import { solveLoanEligibility, loanForEmi } from "../../assets/js/calculators/formulas/loan-eligibility.js";
import { solveBmi, solveBmr, solveCalorie, bmiCategory, asianPoint, mifflin } from "../../assets/js/calculators/formulas/body.js";
import { solveUnits, convert, UNITS } from "../../assets/js/calculators/formulas/units.js";
import { calculateEMI } from "../../assets/js/calculators/formulas/loan.js";

const first = (r) => r.metrics[0].value;
const find = (r, label) => r.metrics.find((m) => m.label.startsWith(label))?.value;

describe("number helpers", () => {
  test("parseNumber reads grouping and rejects text", () => {
    assert.equal(parseNumber("1,25,000.50"), 125000.5);
    assert.equal(parseNumber(" 7 "), 7);
    assert.equal(parseNumber(".5"), 0.5);
    for (const bad of ["", "abc", "1e5", "1.2.3", "--1"]) assert.ok(Number.isNaN(parseNumber(bad)), bad);
  });
  test("money uses Indian grouping, plain does not", () => {
    assert.equal(money(1234567.5), "12,34,567.50");
    assert.equal(plain(1234567.5), "1,234,567.5");
  });
});

describe("ROI", () => {
  test("50,000 -> 65,000 in 3 years: 30%, profit 15,000, 1.3x, 9.14% a year ((1.3)^(1/3) = 1.0914)", () => {
    const r = solveRoi({ invested: "50000", final: "65000", years: "3" });
    assert.equal(first(r), "30%");
    assert.equal(find(r, "Net profit"), "15,000.00");
    assert.equal(find(r, "Final value as a multiple"), "1.3x");
    assert.equal(find(r, "Annualised"), "9.14% a year");
  });
  test("a loss is negative and labelled; a total loss shows no yearly rate", () => {
    const r = solveRoi({ invested: "1000", final: "800" });        // -200 / 1000 = -20%
    assert.equal(first(r), "-20%");
    assert.equal(find(r, "Net loss"), "200.00");
    const z = solveRoi({ invested: "1000", final: "0", years: "2" });
    assert.equal(first(z), "-100%");
    assert.equal(z.metrics.some((m) => m.label.startsWith("Annualised")), false);
    assert.equal(z.notes.length, 1);
  });
  test("incomplete and invalid states", () => {
    assert.equal(solveRoi({ invested: "", final: "5" }).state, "incomplete");
    assert.deepEqual(Object.keys(solveRoi({ invested: "0", final: "5" }).errors), ["invested"]);
    assert.deepEqual(Object.keys(solveRoi({ invested: "5", final: "-1" }).errors), ["final"]);
    assert.deepEqual(Object.keys(solveRoi({ invested: "5", final: "6", years: "0" }).errors), ["years"]);
  });
});

describe("Ratio", () => {
  test("12 : 20 = 3 : 5; 12 is 0.6 of 20; shares 37.5% and 62.5%; 30 -> 20 x 30 / 12 = 50", () => {
    const r = solveRatio({ a: "12", b: "20", c: "30" });
    assert.equal(first(r), "3 : 5");
    assert.equal(find(r, "First as a multiple"), "0.6");
    assert.equal(find(r, "Share of the first"), "37.5%");
    assert.equal(find(r, "Share of the second"), "62.5%");
    assert.equal(r.metrics.at(-1).value, "50");
  });
  test("decimals: 1.5 : 2.5 = 3 : 5; 0.25 : 0.75 = 1 : 3; a zero term", () => {
    assert.deepEqual(simplify(1.5, 2.5), [3, 5]);
    assert.deepEqual(simplify(0.25, 0.75), [1, 3]);
    assert.deepEqual(simplify(0, 5), [0, 1]);
    assert.deepEqual(simplify(5, 0), [1, 0]);
  });
  test("both zero, negative, more than 6 decimals and a zero first term with a scale", () => {
    assert.equal(solveRatio({ a: "0", b: "0" }).state, "invalid");
    assert.equal(solveRatio({ a: "-1", b: "2" }).state, "invalid");
    assert.equal(solveRatio({ a: "0.1234567", b: "2" }).state, "invalid");
    assert.equal(solveRatio({ a: "0", b: "4", c: "3" }).notes.length, 1);
    assert.equal(solveRatio({ a: "", b: "4" }).state, "incomplete");
  });
});

describe("Interest", () => {
  test("10,000 at 10% for 2 years: simple 2,000; compound yearly 12,100 (interest 2,100); quarterly 10,000 x 1.025^8 = 12,184.03", () => {
    assert.equal(simpleInterest(10000, 10, 2), 2000);
    assert.ok(Math.abs(compoundAmount(10000, 10, 2, 1) - 12100) < 1e-9);
    const y = solveInterest({ principal: "10000", rate: "10", years: "2", frequency: "1" });
    assert.equal(first(y), "2,100.00");
    assert.equal(find(y, "Simple interest"), "2,000.00");
    assert.equal(find(y, "Compound minus simple"), "100.00");
    const q = solveInterest({ principal: "10000", rate: "10", years: "2", frequency: "4" });
    assert.equal(find(q, "Amount after compounding"), "12,184.03");
  });
  test("zero rate gives zero interest; invalid frequency and rate", () => {
    assert.equal(first(solveInterest({ principal: "500", rate: "0", years: "3", frequency: "12" })), "0.00");
    assert.ok(solveInterest({ principal: "500", rate: "5", years: "3", frequency: "7" }).errors.frequency);
    assert.ok(solveInterest({ principal: "500", rate: "101", years: "3", frequency: "1" }).errors.rate);
    assert.equal(solveInterest({ principal: "500", rate: "", years: "3" }).state, "incomplete");
  });
});

describe("Age", () => {
  const ctx = { today: "2026-11-02" };
  test("15 May 1990 to 2 Nov 2026 = 36 years 5 months 18 days; next birthday 15 May 2027 in 194 days", () => {
    // 36 years -> 15 May 2026, +5 months -> 15 Oct 2026, +18 days -> 2 Nov 2026
    const r = solveAge({ birth: "1990-05-15", asOn: "" }, ctx);
    assert.equal(first(r), "36 years, 5 months, 18 days");
    assert.equal(r.result.years, 36);
    assert.equal(r.result.months, 5);
    assert.equal(r.result.days, 18);
    // 2 Nov 2026 -> 15 May 2027: Nov 28 left + Dec 31 + Jan 31 + Feb 28 + Mar 31 + Apr 30 + May 15 = 194
    assert.equal(r.result.untilNext, 194);
  });
  test("29 February 2000: on 28 Feb 2026 the 26th birthday is today (28 Feb in a non-leap year); on 29 Feb 2028 it is the 28th", () => {
    assert.equal(solveAge({ birth: "2000-02-29", asOn: "2026-02-28" }, ctx).result.untilNext, 0);
    assert.equal(solveAge({ birth: "2000-02-29", asOn: "2026-02-28" }, ctx).result.years, 26);
    assert.equal(solveAge({ birth: "2000-02-29", asOn: "2028-02-29" }, ctx).result.years, 28);
  });
  test("the same day, a future birth date, a bad date and an empty birth date", () => {
    assert.equal(solveAge({ birth: "2026-11-02", asOn: "" }, ctx).result.totalDays, 0);
    assert.ok(solveAge({ birth: "2026-11-03", asOn: "" }, ctx).errors.birth);
    assert.ok(solveAge({ birth: "2026-02-30", asOn: "" }, ctx).errors.birth);
    assert.equal(solveAge({ birth: "", asOn: "" }, ctx).state, "incomplete");
  });
});

describe("Personal loan", () => {
  test("5,00,000 at 12% for 3 years: EMI 16,607.15, interest 97,857.58, 36 EMIs; a 2% fee is 10,000", () => {
    const r = solvePersonalLoan({ amount: "500000", rate: "12", years: "3", fee: "2" });
    assert.equal(first(r), "16,607.15");
    assert.equal(find(r, "Total interest"), "97,857.58");
    assert.equal(find(r, "Number of EMIs"), "36");
    assert.equal(find(r, "Processing fee"), "10,000.00");
    assert.equal(find(r, "Total paid including"), "6,07,857.58");
    assert.ok(Math.abs(calculateEMI(500000, 12, 3) - 16607.15) < 0.01);
  });
  test("no fee hides the fee rows; zero rate divides evenly; invalid values", () => {
    assert.equal(solvePersonalLoan({ amount: "120000", rate: "0", years: "1" }).metrics.length, 4);
    assert.equal(first(solvePersonalLoan({ amount: "120000", rate: "0", years: "1" })), "10,000.00");
    assert.ok(solvePersonalLoan({ amount: "1", rate: "5", years: "41" }).errors.years);
    assert.ok(solvePersonalLoan({ amount: "1", rate: "5", years: "1", fee: "26" }).errors.fee);
  });
});

describe("Loan eligibility", () => {
  test("income 80,000 x 50% = 40,000, minus 10,000 existing = 30,000 EMI; the loan it repays, re-checked with the EMI formula", () => {
    const r = solveLoanEligibility({ income: "80000", existing: "10000", share: "50", rate: "10", years: "20" });
    assert.equal(find(r, "Highest new EMI"), "30,000.00");
    assert.equal(find(r, "Total monthly loan payments"), "40,000.00");
    assert.ok(Math.abs(calculateEMI(r.result.loan, 10, 20) - 30000) < 0.01);
  });
  test("zero rate is EMI x months; existing EMIs above the share give no loan and a note", () => {
    assert.equal(loanForEmi(1000, 0, 12), 12000);
    const none = solveLoanEligibility({ income: "50000", existing: "30000", share: "50", rate: "10", years: "5" });
    assert.equal(none.result.loan, 0);
    assert.equal(none.notes.length, 1);
  });
  test("invalid share and incomplete", () => {
    assert.ok(solveLoanEligibility({ income: "1", share: "0", rate: "5", years: "5" }).errors.share);
    assert.equal(solveLoanEligibility({ income: "", share: "50", rate: "5", years: "5" }).state, "incomplete");
  });
});

describe("BMI, BMR and Calorie", () => {
  test("70 kg, 175 cm: 70 / 3.0625 = 22.857 -> 22.9, normal range, below the 23.0 action point; 18.5 to 24.9 is 56.7 to 76.3 kg", () => {
    const r = solveBmi({ weight: "70", height: "175", age: "30" });
    assert.equal(first(r), "22.9 kg/m²");
    assert.match(find(r, "WHO adult"), /normal range/);
    assert.equal(find(r, "WHO action points"), "Below 23.0");
    assert.equal(find(r, "Weight range"), "56.7 to 76.3 kg");
  });
  test("WHO category boundaries use the BMI rounded to one decimal", () => {
    assert.match(bmiCategory(18.4), /underweight/);
    assert.match(bmiCategory(18.5), /normal range/);
    assert.match(bmiCategory(24.94), /normal range/);   // shows 24.9
    assert.match(bmiCategory(24.95), /overweight/);     // shows 25.0 (rounds to 25.0)
    assert.match(bmiCategory(29.9), /overweight/);
    assert.match(bmiCategory(30), /obesity/);
    assert.equal(asianPoint(22.9), "Below 23.0");
    assert.match(asianPoint(23), /increased risk/);
    assert.match(asianPoint(27.4), /increased risk/);
    assert.match(asianPoint(27.5), /higher risk/);
  });
  test("BMI refuses under 18, and out-of-range numbers", () => {
    assert.ok(solveBmi({ weight: "40", height: "150", age: "16" }).errors.age);
    assert.ok(solveBmi({ weight: "10", height: "150", age: "30" }).errors.weight);
    assert.ok(solveBmi({ weight: "50", height: "50", age: "30" }).errors.height);
    assert.equal(solveBmi({ weight: "", height: "150", age: "30" }).state, "incomplete");
  });
  test("Mifflin-St Jeor: man 30 y, 80 kg, 180 cm = 800 + 1125 - 150 + 5 = 1780; woman 30 y, 60 kg, 165 cm = 600 + 1031.25 - 150 - 161 = 1320.25", () => {
    assert.equal(mifflin("male", 80, 180, 30), 1780);
    assert.equal(mifflin("female", 60, 165, 30), 1320.25);
    assert.equal(first(solveBmr({ sex: "male", weight: "80", height: "180", age: "30" })), "1,780 kcal a day");
    assert.equal(find(solveBmr({ sex: "male", weight: "80", height: "180", age: "30" }), "In kilojoules"), "7,448 kJ a day"); // 1780 x 4.184 = 7447.52
    assert.equal(first(solveBmr({ sex: "female", weight: "60", height: "165", age: "30" })), "1,320 kcal a day");
  });
  test("BMR needs a sex; Calorie = BMR x factor: 1780 x 1.55 = 2759", () => {
    assert.equal(solveBmr({ sex: "", weight: "80", height: "180", age: "30" }).state, "incomplete");
    const c = solveCalorie({ sex: "male", weight: "80", height: "180", age: "30", activity: "1.55" });
    assert.equal(first(c), "2,759 kcal");
    assert.ok(solveCalorie({ sex: "male", weight: "80", height: "180", age: "30", activity: "2" }).errors.activity);
  });
});

describe("Unit converter", () => {
  const out = (v, from, to) => solveUnits({ value: v, from, to });
  test("exact factors: 1 mile = 1.609344 km; 1 acre = 43,560 sq ft; 1 US gallon = 3.785411784 L; 5 quintal = 500 kg", () => {
    assert.equal(first(out("1", "mi", "km")), "1.609344");
    assert.equal(first(out("1", "acre", "sqft")), "43,560");
    assert.equal(first(out("1", "usgal", "l")), "3.785411784");
    assert.equal(first(out("5", "quintal", "kg")), "500");
    assert.ok(Math.abs(convert(100, "kmh", "ms") - 27.7777777778) < 1e-9);
  });
  test("temperature: 100 C = 212 F; 0 C = 273.15 K; -40 C = -40 F; below absolute zero is refused", () => {
    assert.equal(first(out("100", "c", "f")), "212");
    assert.equal(first(out("0", "c", "k")), "273.15");
    assert.equal(first(out("-40", "c", "f")), "-40");
    assert.ok(out("-300", "c", "f").errors.value);
  });
  test("different groups are refused; a round trip returns the value", () => {
    assert.ok(out("1", "kg", "l").errors.to);
    for (const u of UNITS.filter((x) => x.group === "Length")) {
      assert.ok(Math.abs(convert(convert(7.5, "m", u.id), u.id, "m") - 7.5) < 1e-9, u.id);
    }
  });
});

describe("page modules (static contract)", () => {
  const pages = [
    ["roi", "roi", ["invested", "final", "years"]],
    ["ratio", "ratio", ["a", "b", "c"]],
    ["interest", "interest", ["principal", "rate", "years", "frequency"]],
    ["age", "age", ["birth", "asOn"]],
    ["personal-loan", "pl", ["amount", "rate", "years", "fee"]],
    ["loan-eligibility", "le", ["income", "existing", "share", "rate", "years"]],
    ["bmi", "bmi", ["weight", "height", "age"]],
    ["bmr", "bmr", ["sex", "age", "weight", "height"]],
    ["calorie", "cal", ["sex", "age", "weight", "height", "activity"]],
    ["unit-converter", "uc", ["value", "from", "to"]]
  ];
  for (const [folder, prefix, keys] of pages) {
    test(`${folder}: one h1, every field labelled, Reset and Copy, no Calculate button, a worked example`, async () => {
      const mod = await import(`../../assets/js/calculators/${folder}/index.js`);
      const html = mod.markup();
      assert.equal((html.match(/<h1>/g) || []).length, 1);
      for (const k of keys) {
        assert.match(html, new RegExp(`for="${prefix}-${k}"`), k);
        assert.match(html, new RegExp(`id="${prefix}-${k}"`), k);
      }
      assert.match(html, new RegExp(`id="${prefix}-reset"`));
      assert.match(html, new RegExp(`id="${prefix}-copy"`));
      assert.doesNotMatch(html, />\s*Calculate\s*</);
      assert.match(html, /Worked Example/);
      assert.doesNotMatch(html, /undefined|NaN/);
      assert.equal(typeof mod.init, "function");
    });
  }
});
