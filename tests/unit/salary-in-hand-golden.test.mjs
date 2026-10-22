/**
 * Tool Pack 30, S3: the Salary / CTC to In-Hand engine (assets/js/calculators/formulas/salary-in-hand.js and its configuration).
 *
 * The reference values come from tests/fixtures/salary-in-hand-golden.json, written ONLY by tests/fixtures/salary-in-hand-golden.py:
 * exact Fraction money following the specification's own steps, with the tax taken from the independent Tool Pack 17 reference
 * (itself pinned by 238 cases). It does not read, import or run this module. The literals typed in this file come from the
 * approved specification (docs/tool-packs/30-salary-ctc-in-hand.md, sections 6 and 8) and from hand arithmetic written next to
 * them; none is a JavaScript output.
 *
 * What is pinned: every oracle case (valid, invalid, incomplete, unsupported); the monthly rounding of the PF contribution
 * (annual PF is 12 times the rounded monthly amount); the ceiling boundary; the CTC identity and the take-home arithmetic, each
 * recomputed here from the lines; the optional old-regime comparison never disturbing the new-regime figure; no tax constant in
 * the module; purity (no clock, DOM, storage, network or randomness); determinism, immutability and hostile inputs.
 *
 * Run directly (this avoids the full build that `npm run test:unit` runs first):
 *     node --test tests/unit/salary-in-hand-golden.test.mjs
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as engine from "../../assets/js/calculators/formulas/salary-in-hand.js";
import { ACTIVE_SALARY_YEAR, SALARY_YEAR_2026_27 } from "../../assets/js/calculators/formulas/salary-in-hand-config.js";
import { calculate as calculateTax } from "../../assets/js/calculators/formulas/income-tax.js";

const { calculateSalary, roundHalfUp, monthlyProvidentFund } = engine;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FORMULAS = path.join(HERE, "..", "..", "assets", "js", "calculators", "formulas");
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "salary-in-hand-golden.json"), "utf8"));
const read = (name) => fs.readFileSync(path.join(FORMULAS, name), "utf8");

const base = (extra = {}) => ({ ctc: 1_200_000, basicPercent: 50, pfBasis: "capped", gratuityIncluded: true, ...extra });
const ok = (input, options) => {
  const r = calculateSalary(input, options);
  assert.equal(r.status, "ok", JSON.stringify(r));
  return r;
};

/* the oracle's expectation and this module's result, reduced to the same comparable shape */
function shapeOld(o) {
  if (o.status === "ok") return { status: "ok", tax: o.tax, annualTakeHome: o.annualTakeHome, monthlyAverage: o.monthlyAverage };
  if (o.status === "incomplete") return { status: "incomplete", missing: o.missing };
  if (o.status === "invalid") return { status: "invalid", errorKeys: o.errorKeys ?? Object.keys(o.errors).sort() };
  return { status: o.status };
}

function shapeActual(r) {
  switch (r.status) {
    case "ok":
      return {
        status: "ok", ctc: r.ctc, basic: r.basic, pfBasis: r.pfBasis, monthlyPf: r.monthlyPf, employerPf: r.employerPf,
        employeePf: r.employeePf, gratuity: r.gratuity, otherEmployerCosts: r.otherEmployerCosts, gross: r.gross,
        professionalTax: r.professionalTax, new: { tax: r.new.tax, annualTakeHome: r.new.annualTakeHome, monthlyAverage: r.new.monthlyAverage },
        old: shapeOld(r.old)
      };
    case "incomplete": return { status: "incomplete", missing: r.missing };
    case "invalid": return { status: "invalid", errorKeys: Object.keys(r.errors).sort() };
    default: return { status: r.status, reason: r.reason };
  }
}

function shapeExpected(e) {
  if (e.status === "ok") return { ...e, old: shapeOld(e.old) };
  if (e.status === "invalid") return { status: "invalid", errorKeys: e.errorKeys };
  return e;
}

describe("the oracle fixture", () => {
  test("is the independent reference's output, large enough, and covers every status", () => {
    assert.equal(GOLD.taxYear, "2026-27");
    assert.ok(GOLD.cases.length >= 1000, String(GOLD.cases.length));
    const seen = new Set(GOLD.cases.map((c) => c.expect.status));
    for (const s of ["ok", "invalid", "incomplete", "unsupported"]) assert.ok(seen.has(s), s);
    const olds = new Set(GOLD.cases.filter((c) => c.expect.status === "ok").map((c) => c.expect.old.status));
    for (const s of ["off", "ok", "invalid", "incomplete"]) assert.ok(olds.has(s), "old " + s);
    assert.equal(new Set(GOLD.cases.map((c) => c.id)).size, GOLD.cases.length);
  });

  test("every oracle case matches this module exactly (no unexplained mismatch)", () => {
    const mismatches = [];
    for (const c of GOLD.cases) {
      const actual = shapeActual(calculateSalary(structuredClone(c.input), structuredClone(c.options)));
      try {
        assert.deepStrictEqual(actual, shapeExpected(c.expect));
      } catch {
        mismatches.push(c.id + ": got " + JSON.stringify(actual) + " expected " + JSON.stringify(shapeExpected(c.expect)));
      }
    }
    assert.deepEqual(mismatches.slice(0, 5), [], mismatches.length + " of " + GOLD.cases.length + " cases differ");
  });
});

describe("pinned examples typed from the specification (hand arithmetic, not module output)", () => {
  test("annual basic 4,00,050: full-basic gives 4,001 a month and 48,012 a year", () => {
    // CTC 8,00,100 x 50% = 4,00,050; monthly 33,337.50; 12% of it is 4,000.50, which rounds up to 4,001; 4,001 x 12 = 48,012
    const r = ok(base({ ctc: 800_100, pfBasis: "full-basic", gratuityIncluded: false }));
    assert.equal(r.basic, 400_050);
    assert.equal(r.monthlyPf, 4001);
    assert.equal(r.employerPf, 48_012);
    assert.equal(r.employeePf, 48_012);
    // rounding the ANNUAL amount instead (12% of 4,00,050 = 48,006) is the wrong convention and must not be what we return
    assert.notEqual(r.employerPf, Math.round(0.12 * 400_050));
  });

  test("the same basic on the capped basis gives 3,000 a month and 36,000 a year, not the full-wage figure", () => {
    const r = ok(base({ ctc: 800_100, pfBasis: "capped", gratuityIncluded: false }));
    assert.equal(r.monthlyPf, 3000);
    assert.equal(r.employerPf, 36_000);
    assert.equal(r.gross, 800_100 - 36_000);
  });

  test("Case A (CTC 12 lakh, basic 50%, capped, gratuity, professional tax 2,400): hand-checked in specification section 8", () => {
    // basic 6,00,000; PF 3,000 x 12 = 36,000; gratuity 6,00,000 x 15 / 312 = 28,846.15 -> 28,846; gross 11,35,154;
    // new regime: 11,35,154 - 75,000 = 10,60,154; slab tax 20,000 + 26,015.4 = 46,015.4, below the 60,000 rebate: tax 0
    const r = ok(base({ professionalTax: 2400 }));
    assert.deepEqual([r.basic, r.employerPf, r.gratuity, r.gross], [600_000, 36_000, 28_846, 1_135_154]);
    assert.equal(r.new.tax, 0);
    assert.equal(r.new.annualTakeHome, 1_135_154 - 36_000 - 2400);
    assert.equal(r.new.annualTakeHome, 1_096_754);
    assert.equal(r.new.monthlyAverage, 91_396);
  });

  test("Cases A and B differ by about 6,000 a month only because of the PF basis", () => {
    const a = ok(base({ professionalTax: 2400 }));
    const b = ok(base({ professionalTax: 2400, pfBasis: "full-basic" }));
    assert.equal(b.employerPf, 72_000);
    assert.equal(a.new.monthlyAverage - b.new.monthlyAverage, 6000);
  });

  test("Case D (CTC 6 lakh, basic 40%, full-basic, no gratuity): PF 2,400 a month, nothing taxed", () => {
    const r = ok(base({ ctc: 600_000, basicPercent: 40, pfBasis: "full-basic", gratuityIncluded: false }));
    assert.deepEqual([r.basic, r.monthlyPf, r.employerPf, r.gross], [240_000, 2400, 28_800, 571_200]);
    assert.equal(r.new.tax, 0);
    assert.equal(r.new.annualTakeHome, 571_200 - 28_800);
    assert.equal(r.new.monthlyAverage, 45_200);
  });

  test("the ceiling: below, at and above a monthly basic of 25,000 (capped), and `none` contributes nothing", () => {
    const monthly = (annualBasic, pfBasis) => monthlyProvidentFund(annualBasic, pfBasis, ACTIVE_SALARY_YEAR);
    assert.equal(monthly(299_988, "capped"), 3000); // monthly 24,999: 12% = 2,999.88 -> 3,000
    assert.equal(monthly(299_994, "capped"), 3000); // 24,999.50 -> 2,999.94 -> 3,000
    assert.equal(monthly(300_000, "capped"), 3000);
    assert.equal(monthly(300_001, "capped"), 3000);
    assert.equal(monthly(1_000_000, "capped"), 3000);
    assert.equal(monthly(240_000, "capped"), 2400); // 20,000 a month
    assert.equal(monthly(240_000, "full-basic"), 2400);
    assert.equal(monthly(1_000_000, "full-basic"), 10_000); // 83,333.33 -> 10,000
    assert.equal(monthly(1_000_000, "none"), 0);
    assert.equal(monthly(0, "capped"), 0);
  });

  test("a half rupee rounds up, never down or to even", () => {
    assert.equal(roundHalfUp(1, 2), 1);
    assert.equal(roundHalfUp(3, 2), 2);
    assert.equal(roundHalfUp(5, 2), 3);
    assert.equal(roundHalfUp(4001, 1000), 4);
    assert.equal(roundHalfUp(499, 1000), 0);
    assert.equal(roundHalfUp(500, 1000), 1);
    assert.equal(roundHalfUp(0, 12), 0);
    // gratuity tie: basic 52,052 x 15 / 312 = 2,502.5 -> 2,503
    assert.equal(ok(base({ ctc: 104_104, pfBasis: "none" })).gratuity, 2503);
  });
});

describe("reconciliation and the meaning of each figure (recomputed here from the lines)", () => {
  const okCases = GOLD.cases.filter((c) => c.expect.status === "ok");

  test("CTC equals take-home + employee PF + professional tax + tax + employer PF + gratuity + other employer costs, exactly", () => {
    for (const c of okCases) {
      const r = calculateSalary(structuredClone(c.input), structuredClone(c.options));
      assert.equal(r.new.annualTakeHome + r.employeePf + r.professionalTax + r.new.tax + r.employerPf + r.gratuity + r.otherEmployerCosts, r.ctc, c.id);
      assert.equal(r.reconciliation.cashAndDeductions + r.reconciliation.employerCosts, r.reconciliation.ctc, c.id);
      if (r.old.status === "ok") {
        assert.equal(r.old.annualTakeHome + r.employeePf + r.professionalTax + r.old.tax + r.employerPf + r.gratuity + r.otherEmployerCosts, r.ctc, c.id + " old");
      }
    }
  });

  test("employer costs are not cash: gross is CTC less employer PF, gratuity and other employer costs, and is never more than CTC", () => {
    for (const c of okCases) {
      const r = calculateSalary(structuredClone(c.input), structuredClone(c.options));
      assert.equal(r.gross, r.ctc - r.employerPf - r.gratuity - r.otherEmployerCosts, c.id);
      assert.ok(r.gross <= r.ctc && r.gross >= r.basic && r.gross > 0, c.id);
      assert.ok(r.new.annualTakeHome >= 0 && r.new.annualTakeHome <= r.gross, c.id);
    }
  });

  test("employee deductions are taken once: employee PF equals employer PF, which is 12 times the monthly amount", () => {
    for (const c of okCases) {
      const r = calculateSalary(structuredClone(c.input), structuredClone(c.options));
      assert.equal(r.employeePf, r.employerPf, c.id);
      assert.equal(r.employerPf, 12 * r.monthlyPf, c.id);
      if (r.pfBasis === "none") assert.equal(r.employerPf, 0, c.id);
    }
  });

  test("the capped basis never exceeds 3,000 a month and never exceeds the full-basic contribution", () => {
    for (const c of okCases) {
      const r = calculateSalary(structuredClone(c.input), structuredClone(c.options));
      if (r.pfBasis === "capped") assert.ok(r.monthlyPf <= 3000, c.id);
      const full = calculateSalary({ ...structuredClone(c.input), pfBasis: "full-basic" }, structuredClone(c.options));
      if (r.pfBasis === "capped" && full.status === "ok") assert.ok(r.monthlyPf <= full.monthlyPf, c.id);
    }
  });

  test("the monthly figure is the annual figure divided by 12 to the nearest rupee, and twelve times it is within 6 rupees", () => {
    for (const c of okCases) {
      const r = calculateSalary(structuredClone(c.input), structuredClone(c.options));
      for (const f of [r.new, ...(r.old.status === "ok" ? [r.old] : [])]) {
        assert.equal(f.monthlyAverage, Math.floor((2 * f.annualTakeHome + 12) / 24), c.id);
        assert.ok(Math.abs(12 * f.monthlyAverage - f.annualTakeHome) <= 6, c.id);
        assert.ok(Number.isSafeInteger(f.annualTakeHome) && Number.isSafeInteger(f.monthlyAverage) && Number.isSafeInteger(f.tax), c.id);
      }
    }
  });

  test("the monthly rounding differs from annual rounding when a month ends in a half rupee, by at most 6 a year", () => {
    let differing = 0;
    for (const c of okCases) {
      const r = calculateSalary(structuredClone(c.input), structuredClone(c.options));
      if (r.pfBasis !== "full-basic") continue;
      const annualRounded = Math.floor((2 * 12 * r.basic + 100) / 200); // 12% of the annual basic (12 x basic / 100), rounded once
      assert.ok(Math.abs(r.employerPf - annualRounded) <= 6, c.id);
      if (r.employerPf !== annualRounded) differing += 1;
    }
    assert.ok(differing > 0, "the grid must contain a case where monthly and annual rounding differ");
  });

  test("take-home rises with CTC, except just above the 12 lakh rebate edge where marginal relief plus the 4% cess makes the tax rise by 1.04 a rupee", () => {
    // Found in S3 (not in the specification's first draft): s.156(2)(b) limits the tax to the income above 12 lakh, and the cess
    // is then charged on that limited tax, so across the relief band each extra rupee of income costs 1.04 rupees of tax.
    // Outside the band take-home never falls; inside it the fall is at most 4% of the extra gross, plus any rise in the employee PF
    // (which is deducted from take-home and also grows with CTC), plus the 10-rupee rounding.
    let band = 0;
    for (const pfBasis of ["capped", "full-basic", "none"]) {
      let previous = null;
      for (let ctc = 300_000; ctc <= 5_000_000; ctc += 7_919) {
        const r = ok(base({ ctc, pfBasis, gratuityIncluded: false }));
        if (previous) {
          const drop = previous.annualTakeHome - r.new.annualTakeHome;
          const taxable = r.gross - 75_000; // the new-regime standard deduction, for locating the band only
          if (drop > 0) {
            band += 1;
            assert.ok(taxable > 1_190_000 && taxable < 1_290_000, pfBasis + " " + ctc + " falls outside the relief band: " + drop);
            assert.ok(drop <= 0.04 * (r.gross - previous.gross) + (r.employeePf - previous.employeePf) + 20, pfBasis + " " + ctc + " falls by " + drop);
          }
        }
        previous = { annualTakeHome: r.new.annualTakeHome, gross: r.gross, employeePf: r.employeePf };
      }
    }
    assert.ok(band > 0, "the grid should cross the relief band");
  });
});

describe("the tax adapter (Tool Pack 17, unchanged)", () => {
  test("tax comes from the engine for the gross salary: the module and a direct engine call agree", () => {
    const r = ok(base({ professionalTax: 2400 }));
    const direct = calculateTax({ salary: r.gross, basicPlusDa: r.basic, professionalTax: 2400 });
    assert.equal(r.new.tax, direct.new.finalTax);
  });

  test("an old-regime entry, valid or not, never changes the new-regime figures", () => {
    const plain = ok(base({ professionalTax: 2500 }));
    const variants = [
      { enabled: true },
      { enabled: true, hraReceived: 0, rentPaid: 0, other80C: 0 },
      { enabled: true, hraReceived: 120_000, rentPaid: 240_000, highCity: true, other80C: 50_000 },
      { enabled: true, hraReceived: 9_999_999, rentPaid: 0, other80C: 0 },
      { enabled: true, hraReceived: -1, rentPaid: 0, other80C: 0 },
      { enabled: false }
    ];
    for (const oldRegime of variants) {
      const r = ok(base({ professionalTax: 2500, oldRegime }));
      assert.deepEqual(r.new, plain.new, JSON.stringify(oldRegime));
      assert.equal(r.gross, plain.gross);
    }
  });

  test("an invalid optional old-regime comparison is reported on its own field and leaves a valid new-regime estimate", () => {
    const r = ok(base({ oldRegime: { enabled: true, hraReceived: 9_999_999, rentPaid: 0, other80C: 0 } }));
    assert.equal(r.old.status, "invalid");
    assert.deepEqual(Object.keys(r.old.errors), ["hraReceived"]);
    assert.ok(r.new.annualTakeHome > 0);
  });

  test("old regime: switched off shows nothing; enabled but incomplete lists what is missing; the metro choice is asked only when needed", () => {
    assert.deepEqual(ok(base()).old, { status: "off" });
    assert.deepEqual(ok(base({ oldRegime: { enabled: false, hraReceived: 5 } })).old, { status: "off" });
    assert.deepEqual(ok(base({ oldRegime: { enabled: true } })).old.missing, ["hraReceived", "rentPaid", "other80C"]);
    assert.deepEqual(ok(base({ oldRegime: { enabled: true, hraReceived: 1000, rentPaid: 2000, other80C: 0 } })).old.missing, ["highCity"]);
    assert.equal(ok(base({ oldRegime: { enabled: true, hraReceived: 1000, rentPaid: 0, other80C: 0 } })).old.status, "ok");
  });

  test("old regime: employee PF counts as an 80C amount and the engine's own cap applies; the included and excluded lists are returned", () => {
    const r = ok(base({ ctc: 5_000_000, pfBasis: "full-basic", oldRegime: { enabled: true, hraReceived: 0, rentPaid: 0, other80C: 0 } }));
    assert.ok(r.employeePf > 150_000);
    const direct = calculateTax({ salary: r.gross, basicPlusDa: r.basic, section80C: r.employeePf });
    const capped = calculateTax({ salary: r.gross, basicPlusDa: r.basic, section80C: 150_000 });
    assert.equal(direct.old.finalTax, capped.old.finalTax);
    assert.equal(r.old.tax, direct.old.finalTax);
    assert.ok(r.old.included.includes("employee-pf-as-80c") && r.old.excluded.includes("home-loan-interest"));
  });

  test("the 50 lakh CTC cap: accepted at the cap, refused above it, never approximated", () => {
    assert.equal(calculateSalary(base({ ctc: 5_000_000 })).status, "ok");
    const above = calculateSalary(base({ ctc: 5_000_001 }));
    assert.equal(above.status, "unsupported");
    assert.equal(above.reason, "ctc-above-cap");
    assert.equal("new" in above, false);
  });

  test("no tax constant is repeated in the new files", () => {
    const code = read("salary-in-hand.js") + "\n" + read("salary-in-hand-config.js");
    for (const n of ["400000", "800000", "1200000", "1600000", "2000000", "2400000", "75000", "60000", "150000", "250000", "12500", "1,12,500", "112500"]) {
      assert.ok(!new RegExp("\\b" + n + "\\b").test(code.replace(/_/g, "")), "tax constant " + n);
    }
    assert.ok(!/\bcess\b/i.test(read("salary-in-hand.js").replace(/\/\*[\s\S]*?\*\//g, "")), "cess logic");
    assert.match(read("salary-in-hand.js"), /from "\.\/income-tax\.js"/);
  });
});

describe("validation, incomplete entries and unsupported outcomes", () => {
  test("a missing required entry waits (incomplete), listing it, and nothing is calculated", () => {
    for (const key of ["ctc", "basicPercent", "pfBasis", "gratuityIncluded"]) {
      const input = base();
      delete input[key];
      const r = calculateSalary(input);
      assert.equal(r.status, "incomplete");
      assert.deepEqual(r.missing, [key]);
      assert.equal("new" in r, false);
      assert.equal(calculateSalary(base({ [key]: null })).status, "incomplete");
    }
    assert.deepEqual(calculateSalary({}).missing, ["ctc", "basicPercent", "pfBasis", "gratuityIncluded"]);
  });

  test("nothing is chosen for the user: no default basic percentage, PF basis or gratuity choice", () => {
    const r = calculateSalary({ ctc: 1_200_000 });
    assert.equal(r.status, "incomplete");
    assert.deepEqual(r.missing, ["basicPercent", "pfBasis", "gratuityIncluded"]);
  });

  test("the basic percentage: 1 to 100, at most two decimals, digits only", () => {
    for (const good of [1, 100, 33.33, 12.5, "50", "50.5", "50.25", " 50 "]) assert.equal(calculateSalary(base({ basicPercent: good, pfBasis: "none", gratuityIncluded: false })).status, "ok", String(good));
    for (const bad of [0, 0.99, 100.01, 33.333, -5, "abc", "1e2", "50.", ".5", "5,0", true, [], {}, NaN, Infinity]) {
      const r = calculateSalary(base({ basicPercent: bad }));
      assert.equal(r.status, "invalid", String(bad));
      assert.deepEqual(Object.keys(r.errors), ["basicPercent"]);
    }
  });

  test("amounts must be whole rupees of 0 or more; CTC above 0; each error is on its own field", () => {
    for (const [field, bad] of [["ctc", 0], ["ctc", -1], ["ctc", 1.5], ["ctc", "1200000"], ["ctc", NaN], ["ctc", Infinity], ["ctc", 2 ** 60],
      ["professionalTax", -1], ["professionalTax", 2.5], ["otherEmployerCosts", -1], ["otherEmployerCosts", 0.5], ["pfBasis", "Capped"], ["gratuityIncluded", "yes"], ["gratuityIncluded", 1]]) {
      const r = calculateSalary(base({ [field]: bad }));
      assert.equal(r.status, "invalid", field + "=" + String(bad));
      assert.deepEqual(Object.keys(r.errors), [field]);
    }
  });

  test("impossible decompositions are refused with no figure", () => {
    const eats = calculateSalary(base({ otherEmployerCosts: 1_150_000 }));
    assert.deepEqual([eats.status, Object.keys(eats.errors)], ["invalid", ["decomposition"]]);
    // 100% basic with a contribution leaves less gross than basic
    assert.equal(calculateSalary(base({ basicPercent: 100 })).status, "invalid");
    // exactly equal is allowed: gross == basic
    assert.equal(ok(base({ basicPercent: 100, pfBasis: "none", gratuityIncluded: false })).gross, 1_200_000);
    // professional tax above gross, and deductions above gross
    assert.deepEqual(Object.keys(calculateSalary(base({ ctc: 100_000, professionalTax: 95_000 })).errors), ["professionalTax"]);
    const over = calculateSalary(base({ ctc: 100_000, basicPercent: 87, pfBasis: "full-basic", gratuityIncluded: false, professionalTax: 89_000 }));
    assert.deepEqual([over.status, Object.keys(over.errors)], ["invalid", ["decomposition"]]);
  });

  test("the caller's date is checked against the configuration; the module never reads a clock", () => {
    assert.equal(calculateSalary(base(), { asOf: "2026-04-01" }).status, "ok");
    assert.equal(calculateSalary(base(), { asOf: "2027-03-31" }).status, "ok");
    for (const asOf of ["2026-03-31", "2027-04-01"]) assert.equal(calculateSalary(base(), { asOf }).reason, "outside-validity");
    for (const asOf of ["22/10/2026", "", null, 20261022]) assert.deepEqual(Object.keys(calculateSalary(base(), { asOf }).errors), ["asOf"]);
    assert.equal(calculateSalary(base()).status, "ok");
  });

  test("hostile inputs never throw and never give a success-shaped result", () => {
    for (const hostile of [undefined, null, 0, "x", [], () => 1, { ctc: {} }, JSON.parse('{"__proto__": {"ctc": 1}}'), { get ctc() { return 1_200_000; }, basicPercent: 50, pfBasis: "capped", gratuityIncluded: true }]) {
      let r;
      assert.doesNotThrow(() => { r = calculateSalary(hostile); });
      assert.ok(["ok", "incomplete", "invalid"].includes(r.status));
    }
    assert.equal(calculateSalary(JSON.parse('{"__proto__": {"ctc": 1}}')).status, "incomplete");
    assert.doesNotThrow(() => calculateSalary(base({ oldRegime: "yes" })));
    assert.doesNotThrow(() => calculateSalary(base({ oldRegime: null })));
  });
});

describe("determinism, immutability and purity", () => {
  test("the same input gives the same output, and the input is not modified", () => {
    const input = Object.freeze(base({ professionalTax: 2400, oldRegime: Object.freeze({ enabled: true, hraReceived: 0, rentPaid: 0, other80C: 0 }) }));
    const first = JSON.stringify(calculateSalary(input));
    for (let i = 0; i < 5; i += 1) assert.equal(JSON.stringify(calculateSalary(input)), first);
  });

  test("the result is frozen", () => {
    const r = ok(base({ oldRegime: { enabled: true, hraReceived: 0, rentPaid: 0, other80C: 0 } }));
    assert.ok(Object.isFrozen(r) && Object.isFrozen(r.new) && Object.isFrozen(r.old));
    assert.throws(() => { r.gross = 1; }, TypeError);
    assert.ok(Object.isFrozen(SALARY_YEAR_2026_27) && Object.isFrozen(SALARY_YEAR_2026_27.pf));
  });

  test("no clock, DOM, storage, network, randomness, eval or import beyond the tax engine and the configuration", () => {
    const code = (read("salary-in-hand.js") + read("salary-in-hand-config.js")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const banned of [/\bDate\b/, /\bdocument\b/, /\bwindow\b/, /\blocalStorage\b/, /\bsessionStorage\b/, /\bfetch\b/, /XMLHttpRequest/, /Math\.random/, /\beval\b/, /new Function/, /\bprocess\b/, /\bnavigator\b/, /performance\.now/, /\brequire\b/]) {
      assert.ok(!banned.test(code), String(banned));
    }
    const imports = [...code.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]).sort();
    assert.deepEqual(imports, ["./income-tax.js", "./salary-in-hand-config.js"]);
  });

  test("the configuration states its own validity, sources and the facts it rests on", () => {
    const c = ACTIVE_SALARY_YEAR;
    assert.deepEqual([c.validFrom, c.validThrough, c.verifiedOn], ["2026-04-01", "2027-03-31", "2026-10-22"]);
    assert.deepEqual([c.pf.rateNumerator, c.pf.rateDenominator, c.pf.wageCeilingMonthly, c.pf.wageCeilingEffectiveFrom], [12, 100, 25_000, "2026-09-17"]);
    assert.deepEqual([c.gratuity.numerator, c.gratuity.denominator, c.ctcCap], [15, 312, 5_000_000]);
    assert.ok(c.sources.length >= 4);
  });
});
