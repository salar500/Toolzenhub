/**
 * Tool Pack 26, Phase 1: the PPF calculation engine (assets/js/calculators/formulas/ppf.js).
 *
 * The reference values come from tests/fixtures/ppf-golden.json, written ONLY by tests/fixtures/ppf-golden.py: exact
 * rational arithmetic, two separate models that must agree (a day-level ledger that applies the "lowest balance from the
 * close of the 5th" rule literally, and closed forms). It does not read, import or run the JavaScript, and no expected
 * value here is a JavaScript output. Literals typed in this file come from the approved specification
 * (docs/tool-packs/26-ppf-calculator.md), not from the engine.
 *
 * Pinned: the model (deposit by the 5th, annual rate / 12 per month on the lowest balance, interest credited once a
 * year), limits and messages, the numerical tolerance against the exact oracle, whole-rupee display (halves up) and its
 * reconciliation, the year kinds (before maturity, first-term end at 16, extension blocks ending at 21, 26, ...), the
 * annual-versus-monthly comparison and its multiple-of-600 rule, determinism and the purity of the module.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PPF_LIMITS,
  PPF_PATTERNS,
  FIRST_TERM_YEARS,
  EXTENSION_BLOCK_YEARS,
  COMPARISON_YEARLY_MULTIPLE,
  validatePpfInputs,
  calculatePpf,
  comparePpfPatterns,
  yearKind,
  isClosurePoint,
  assumesExtension,
  roundRupee,
  toDisplay,
} from "../../assets/js/calculators/formulas/ppf.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = path.join(HERE, "..", "..", "assets", "js", "calculators", "formulas", "ppf.js");
const ORACLE = path.join(HERE, "..", "fixtures", "ppf-golden.py");
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "ppf-golden.json"), "utf8"));

/* the tolerance of the specification (section 7b): max(0.0001 rupee, 1e-12 x |value|) */
const tol = (exact) => Math.max(1e-4, 1e-12 * Math.abs(exact));
const near = (actual, exact, what) => assert.ok(Math.abs(actual - exact) <= tol(exact), `${what}: ${actual} vs ${exact}`);
/* a figure the specification prints to two decimals (or four): the exact value rounds to it */
const nearTyped = (actual, typed, what, places = 2) => assert.ok(Math.abs(actual - typed) <= 0.5 * 10 ** -places + 1e-9, `${what}: ${actual} vs ${typed}`);

const run = (pattern, deposit, rate, years) => {
  const v = validatePpfInputs({ pattern, yearlyDeposit: deposit, monthlyDeposit: deposit, rate, years });
  assert.equal(v.ok, true, JSON.stringify(v.errors));
  return calculatePpf(v.values);
};

describe("source and independence", () => {
  const code = fs.readFileSync(ENGINE, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");

  test("the engine is pure and local: no Date, network, storage, DOM, eval, randomness or imports", () => {
    assert.ok(!/\bDate\b/.test(code));
    for (const banned of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "localStorage", "sessionStorage", "indexedDB", "document.", "window.", "navigator.", "eval(", "new Function", "Math.random", "setTimeout", "setInterval", "console."]) {
      assert.ok(!code.includes(banned), `must not contain ${banned}`);
    }
    assert.ok(!/^import\s/m.test(code), "the engine imports nothing");
  });

  test("the oracle does not read, import or run the JavaScript, and reads no fixture of any kind", () => {
    const py = fs.readFileSync(ORACLE, "utf8");
    const imports = [...py.matchAll(/^(?:import|from)\s+(\w+)/gm)].map((m) => m[1]).sort();
    assert.deepEqual(imports, ["fractions", "json", "os", "random", "sys"]);
    for (const banned of ["subprocess", "os.system", "ppf.js", "assets/js", "node ", "json.load(", "open(os.path.join(HERE, \"ppf-golden.json\"), \"r"]) {
      assert.ok(!py.includes(banned), `the oracle must not contain ${banned}`);
    }
    assert.equal((py.match(/\bopen\(/g) || []).length, 1, "the only file the oracle opens is its own output");
    assert.ok(/"w"/.test(py));
    assert.ok(/day of the month/i.test(py) && /closed forms/i.test(py), "both independent models are documented");
  });

  test("the fixture records its provenance", () => {
    assert.equal(GOLD.meta.generator, "tests/fixtures/ppf-golden.py");
    assert.match(GOLD.meta.arithmetic, /exact fractions/);
    assert.match(GOLD.meta.independence, /no JavaScript/);
    assert.ok(GOLD.vectors.length >= 400);
    assert.ok(GOLD.vectors.filter((v) => v.rows).length >= 150);
    assert.ok(GOLD.vectors.filter((v) => v.nearHalfBoundary).length >= 3, "values near a half-rupee boundary are included");
    assert.ok(GOLD.vectors.some((v) => v.id.startsWith("random_")));
  });
});

describe("limits, defaults and constants", () => {
  test("the approved limits", () => {
    assert.deepEqual(PPF_LIMITS.yearlyDeposit, { min: 500, max: 150000, step: 50 });
    assert.deepEqual(PPF_LIMITS.monthlyDeposit, { min: 50, max: 12500, step: 50 });
    assert.deepEqual(PPF_LIMITS.rate, { min: 0, max: 15, step: 0.1 });
    assert.deepEqual(PPF_LIMITS.years, { min: 1, max: 50, default: 16 });
    assert.equal(FIRST_TERM_YEARS, 16);
    assert.equal(EXTENSION_BLOCK_YEARS, 5);
    assert.equal(COMPARISON_YEARLY_MULTIPLE, 600);
    assert.equal(PPF_LIMITS.monthlyDeposit.max * 12, PPF_LIMITS.yearlyDeposit.max);
  });
});

describe("the exact oracle: every vector", () => {
  test("balance, deposits, interest, whole-rupee display and every year's closing balance agree within the tolerance", () => {
    let worst = 0;
    for (const v of GOLD.vectors) {
      const r = run(v.pattern, v.deposit, v.rate, v.years);
      const exact = Number(v.balance);
      worst = Math.max(worst, Math.abs(r.balance - exact));
      near(r.balance, exact, `${v.id} balance`);
      assert.equal(r.totalDeposited, v.totalDeposited, `${v.id} deposited`);
      assert.equal(r.annualDeposit, v.annualDeposit);
      near(r.interest, exact - v.totalDeposited, `${v.id} interest`);
      // the whole-rupee display: equal to the oracle's half-up rounding, unless the exact value sits within the tolerance of a .5 boundary
      const d = toDisplay(r);
      const frac = exact - Math.floor(exact);
      if (Math.abs(frac - 0.5) <= tol(exact)) assert.ok([v.balanceRounded - 1, v.balanceRounded, v.balanceRounded + 1].includes(d.balance), v.id);
      else assert.equal(d.balance, v.balanceRounded, `${v.id} displayed balance`);
      assert.equal(d.balance - d.totalDeposited, d.interest);
      if (v.rows) {
        assert.equal(r.rows.length, v.rows.length);
        v.rows.forEach((row, i) => {
          near(r.rows[i].closingBalance, Number(row.closing), `${v.id} year ${row.year} closing`);
          near(r.rows[i].openingBalance, Number(row.opening), `${v.id} year ${row.year} opening`);
          near(r.rows[i].interest, Number(row.interest), `${v.id} year ${row.year} interest`);
          const shown = d.rows[i];
          const f = Number(row.closing) - Math.floor(Number(row.closing));
          if (Math.abs(f - 0.5) > tol(Number(row.closing))) {
            assert.equal(shown.closingBalance, row.closingRounded, `${v.id} year ${row.year} displayed closing`);
          }
        });
      }
    }
    assert.ok(worst < 1e-3, `the worst absolute difference across all vectors was ${worst}`);
  });

  test("the widest case (50 years, 15%, the largest yearly deposit) stays inside the tolerance", () => {
    const v = GOLD.vectors.find((x) => x.id === "bound_yearly_150000_15_50");
    const r = run("yearly", 150000, "15", 50);
    assert.ok(Number(v.balance) > 1.2e9 && Number(v.balance) < 1.3e9);
    near(r.balance, Number(v.balance), "widest case");
    const w = GOLD.vectors.find((x) => x.id === "bound_monthly_12500_15_50");
    near(run("monthly", 12500, "15", 50).balance, Number(w.balance), "widest monthly case");
  });

  test("the displayed rows add up, row by row, for every vector that has rows", () => {
    for (const v of GOLD.vectors.filter((x) => x.rows)) {
      const d = toDisplay(run(v.pattern, v.deposit, v.rate, v.years));
      let previous = 0;
      for (const row of d.rows) {
        assert.equal(row.openingBalance, previous, `${v.id} year ${row.year} opening`);
        assert.equal(row.openingBalance + row.deposits + row.interest, row.closingBalance, `${v.id} year ${row.year}`);
        previous = row.closingBalance;
      }
      assert.equal(d.rows.at(-1).closingBalance, d.balance, `${v.id} the last row equals the headline`);
    }
  });

  test("half-rupee boundary vectors: the display function lands on the oracle's half-up value", () => {
    const edge = GOLD.vectors.filter((x) => x.nearHalfBoundary);
    assert.ok(edge.length >= 3);
    for (const v of edge) {
      const exact = Number(v.balance);
      const frac = exact - Math.floor(exact);
      assert.ok(Math.abs(frac - 0.5) < 0.01, `${v.id} is near .5`);
      const r = run(v.pattern, v.deposit, v.rate, v.years);
      assert.equal(roundRupee(r.balance), v.balanceRounded, `${v.id}`);
    }
  });
});

describe("the specification's golden values, typed from the specification", () => {
  test("hand-checkable: one year of 1,50,000 in April, and of 12,500 a month, at 7.1%", () => {
    near(run("yearly", 150000, "7.1", 1).balance, 160650, "yearly one year");
    near(run("monthly", 12500, "7.1", 1).balance, 155768.75, "monthly one year");
  });

  test("the 15-, 16- and projected-year values of section 7", () => {
    const at = (pattern, deposit, years) => run(pattern, deposit, "7.1", years);
    nearTyped(at("yearly", 150000, 15).balance, 4068209.22, "yearly 15");
    nearTyped(at("monthly", 12500, 15).balance, 3944599.22, "monthly 15");
    nearTyped(at("yearly", 500, 15).balance, 13560.7, "500 yearly 15");
    nearTyped(at("monthly", 50, 15).balance, 15778.4, "50 monthly 15");
    nearTyped(at("yearly", 150000, 16).balance, 4517702.07, "yearly 16");
    nearTyped(at("monthly", 12500, 16).balance, 4380434.52, "monthly 16");
    nearTyped(at("yearly", 150000, 20).balance, 6658288.17, "yearly 20");
    nearTyped(at("yearly", 150000, 25).balance, 10308014.97, "yearly 25");
    nearTyped(at("yearly", 150000, 30).balance, 15450910.59, "yearly 30");
    // the first number of each pair is what the page shows
    assert.equal(roundRupee(at("yearly", 150000, 15).balance), 4068209);
    assert.equal(roundRupee(at("monthly", 12500, 15).balance), 3944599);
    assert.equal(at("yearly", 150000, 15).totalDeposited, 2250000);
    assert.equal(at("yearly", 150000, 16).totalDeposited, 2400000);
    assert.equal(at("yearly", 500, 15).totalDeposited, 7500);
    assert.equal(at("monthly", 50, 15).totalDeposited, 9000);
  });

  test("the annual-versus-monthly difference for the same 1,50,000 a year", () => {
    const c15 = comparePpfPatterns(validatePpfInputs({ pattern: "yearly", yearlyDeposit: 150000, rate: "7.1", years: 15 }).values);
    const c16 = comparePpfPatterns(validatePpfInputs({ pattern: "yearly", yearlyDeposit: 150000, rate: "7.1", years: 16 }).values);
    assert.equal(c15.eligible, true);
    nearTyped(c15.difference, 123609.9985, "15-year difference", 3);
    nearTyped(c16.difference, 137267.5583, "16-year difference", 3);
    // the displayed difference is the gap between the two DISPLAYED balances (owner decision, 2026-10-13)
    assert.equal(roundRupee(c15.yearly.balance), 4068209);
    assert.equal(roundRupee(c15.monthly.balance), 3944599);
    assert.equal(c15.displayDifference, 123610);
    assert.equal(roundRupee(c16.yearly.balance), 4517702); // ₹45,17,702
    assert.equal(roundRupee(c16.monthly.balance), 4380435); // ₹43,80,435
    assert.equal(c16.displayDifference, 137267, "₹1,37,267, not the exact difference rounded on its own (₹1,37,268)");
    assert.equal(roundRupee(c16.difference), 137268, "the exact difference stays available and rounds to 137,268 on its own");
    assert.equal(c16.displayDifference, roundRupee(c16.yearly.balance) - roundRupee(c16.monthly.balance));
    assert.equal(c16.displayedBalanceGap, undefined, "one displayed difference only: no second rounding rule is exposed");
    assert.equal(c15.monthlyDeposit, 12500);
  });

  test("the rounded-interest variants are information, and the specification's claims about them hold", () => {
    assert.equal(GOLD.roundedVariants.length, 4);
    for (const v of GOLD.roundedVariants) {
      const exact = Number(v.exact);
      assert.ok(Math.abs(v.yearRounded - exact) < 3, `${v.pattern} ${v.deposit}: yearly rounding moves it by under 3 rupees`);
      assert.ok(Math.abs(v.monthRounded - exact) <= 21, `${v.pattern} ${v.deposit}: monthly rounding moves it by at most about 21 rupees`);
      near(run(v.pattern, v.deposit, v.rate, v.years).balance, exact, "the engine stays on the unrounded value");
    }
  });
});

describe("the model: deposit timing and year-end crediting", () => {
  test("interest is credited once a year: one year at 12% is D x 1.12, not monthly compounding", () => {
    near(run("yearly", 100000, "12", 1).balance, 112000, "no monthly compounding");
    near(run("monthly", 5000, "12", 1).balance, 60000 + 5000 * 0.12 * 6.5, "monthly pattern, hand formula");
    const two = run("yearly", 100000, "12", 2);
    near(two.rows[0].closingBalance, 112000, "year 1");
    near(two.rows[1].interest, (112000 + 100000) * 0.12, "year 2 interest is on the credited balance plus the new deposit");
    near(two.balance, 212000 * 1.12, "year 2 balance");
  });

  test("the whole yearly deposit in April earns for all twelve months; monthly deposits earn for fewer months", () => {
    const y = run("yearly", 120000, "10", 1);
    const m = run("monthly", 10000, "10", 1);
    near(y.interest, 120000 * 0.10, "twelve months");
    near(m.interest, 10000 * 0.10 / 12 * 78, "1 + 2 + ... + 12 deposit-months");
    assert.ok(y.balance > m.balance);
  });

  test("with a rate of 0 both patterns equal the deposits, with no interest", () => {
    for (const years of [1, 16, 50]) {
      const y = run("yearly", 150000, "0", years);
      const m = run("monthly", 12500, "0", years);
      assert.equal(y.balance, 150000 * years);
      assert.equal(m.balance, 150000 * years);
      assert.equal(y.interest, 0);
      assert.equal(m.interest, 0);
      assert.equal(y.interestShare, 0);
      assert.ok(Number.isFinite(y.balance) && Number.isFinite(m.balance));
    }
  });

  test("at the top rate and the top deposit nothing overflows or loses its reconciliation", () => {
    const r = run("yearly", 150000, "15", 50);
    assert.ok(Number.isFinite(r.balance) && r.balance < 1e15);
    const d = toDisplay(r);
    assert.equal(d.balance - d.totalDeposited, d.interest);
    assert.ok(d.interestSharePercent > 90 && d.interestSharePercent < 100);
  });

  test("monotone invariants over a grid: balance rises with the deposit, the rate and the years; yearly is never below monthly for the same total", () => {
    const rates = ["0", "1.5", "7.1", "15"];
    const decks = [600, 6000, 60000, 150000];
    for (const rate of rates) {
      let previousYears = 0;
      for (const years of [1, 5, 16, 30, 50]) {
        const b = run("yearly", 60000, rate, years).balance;
        assert.ok(b > previousYears, `years ${years} rate ${rate}`);
        previousYears = b;
      }
      let previousDeposit = 0;
      for (const total of decks) {
        const b = run("yearly", total, rate, 16).balance;
        assert.ok(b > previousDeposit);
        previousDeposit = b;
        const monthly = run("monthly", total / 12, rate, 16).balance;
        assert.ok(b >= monthly - 1e-6, `yearly >= monthly at rate ${rate}, total ${total}`);
        if (rate === "0") near(b, monthly, "equal at rate 0");
      }
    }
    for (const years of [16]) {
      let previousRate = -1;
      for (const rate of rates) {
        const b = run("monthly", 12500, rate, years).balance;
        assert.ok(b > previousRate);
        previousRate = b;
      }
    }
  });

  test("the deposit-limit arithmetic: the largest monthly deposit and the largest yearly deposit are the same total", () => {
    const m = validatePpfInputs({ pattern: "monthly", monthlyDeposit: 12500, rate: "7.1", years: 16 }).values;
    const y = validatePpfInputs({ pattern: "yearly", yearlyDeposit: 150000, rate: "7.1", years: 16 }).values;
    assert.equal(m.annualDeposit, y.annualDeposit);
    assert.equal(m.monthlyDeposit, 12500);
    assert.equal(y.monthlyDeposit, null);
  });
});

describe("what each year is (before maturity, first-term end, extension blocks)", () => {
  test("years 1 to 15 are before maturity; year 16 is the first-term end", () => {
    for (let y = 1; y <= 15; y += 1) {
      assert.equal(yearKind(y), "before-maturity", `year ${y}`);
      assert.equal(isClosurePoint(y), false);
      assert.equal(assumesExtension(y), false);
    }
    assert.equal(yearKind(16), "first-term-end");
    assert.equal(isClosurePoint(16), true);
    assert.equal(assumesExtension(16), false);
  });

  test("extension blocks end at 21, 26, 31, 36, 41 and 46; the years between are inside a block", () => {
    for (const y of [21, 26, 31, 36, 41, 46]) {
      assert.equal(yearKind(y), "extension-block-end", `year ${y}`);
      assert.equal(isClosurePoint(y), true);
      assert.equal(assumesExtension(y), true);
    }
    for (const y of [17, 18, 19, 20, 22, 23, 24, 25, 27, 30, 32, 35, 37, 40, 42, 45, 47, 48, 49, 50]) {
      assert.equal(yearKind(y), "inside-extension-block", `year ${y}`);
      assert.equal(isClosurePoint(y), false);
      assert.equal(assumesExtension(y), true);
    }
  });

  test("only the first-term end and the block ends are closure points, in 1 to 50", () => {
    const points = [];
    for (let y = 1; y <= 50; y += 1) if (isClosurePoint(y)) points.push(y);
    assert.deepEqual(points, [16, 21, 26, 31, 36, 41, 46]);
  });

  test("the rows of a 50-year result carry the same labels, and a bad year is refused", () => {
    const r = run("yearly", 150000, "7.1", 50);
    assert.equal(r.rows.length, 50);
    r.rows.forEach((row, i) => {
      assert.equal(row.year, i + 1);
      assert.equal(row.kind, yearKind(i + 1));
      assert.equal(row.isClosurePoint, isClosurePoint(i + 1));
      assert.equal(row.assumesExtension, assumesExtension(i + 1));
    });
    for (const bad of [0, -1, 1.5, NaN, "16"]) assert.throws(() => yearKind(bad), RangeError);
  });

  test("the default duration is the first term: 16 years, and its last row is the first-term end", () => {
    const r = run("yearly", 150000, String(7.1), PPF_LIMITS.years.default);
    assert.equal(r.years, 16);
    assert.equal(r.rows.at(-1).kind, "first-term-end");
  });
});

describe("validation", () => {
  const base = { pattern: "yearly", yearlyDeposit: 150000, monthlyDeposit: 12500, rate: "7.1", years: 16 };
  const check = (changes) => validatePpfInputs({ ...base, ...changes });
  const err = (changes) => {
    const r = check(changes);
    assert.equal(r.ok, false, JSON.stringify(changes));
    return r.errors;
  };

  test("a valid set of inputs returns numbers, the yearly total and the monthly amount", () => {
    const r = check({});
    assert.equal(r.ok, true);
    assert.deepEqual(r.values, { pattern: "yearly", deposit: 150000, annualDeposit: 150000, monthlyDeposit: null, rate: 7.1, years: 16 });
    const m = check({ pattern: "monthly" });
    assert.deepEqual(m.values, { pattern: "monthly", deposit: 12500, annualDeposit: 150000, monthlyDeposit: 12500, rate: 7.1, years: 16 });
  });

  test("yearly deposit: 500 to 1,50,000 in multiples of 50", () => {
    for (const ok of [500, 550, 1000, 99950, 150000]) assert.equal(check({ yearlyDeposit: ok }).ok, true, String(ok));
    for (const bad of [499, 525, 0, -500, 150050, 151000, 500.5, "abc", "1,50,000", "1e5"]) {
      const e = err({ yearlyDeposit: bad });
      assert.deepEqual(e.map((x) => x.fields), [["yearlyDeposit"]], String(bad));
      assert.equal(e[0].message, "The yearly deposit must be between ₹500 and ₹1,50,000, in multiples of ₹50.");
    }
    assert.equal(err({ yearlyDeposit: "" })[0].message, "Enter the yearly deposit.");
  });

  test("monthly deposit: 50 to 12,500 in multiples of 50, so twelve deposits stay within 1,50,000", () => {
    for (const ok of [50, 100, 12450, 12500]) assert.equal(check({ pattern: "monthly", monthlyDeposit: ok }).ok, true, String(ok));
    for (const bad of [49, 75, 0, 12550, 13000, 25]) {
      const e = err({ pattern: "monthly", monthlyDeposit: bad });
      assert.deepEqual(e.map((x) => x.fields), [["monthlyDeposit"]], String(bad));
      assert.ok(e[0].message.startsWith("The monthly deposit must be between ₹50 and ₹12,500, in multiples of ₹50"));
    }
    assert.equal(err({ pattern: "monthly", monthlyDeposit: null })[0].message, "Enter the monthly deposit.");
    assert.equal(check({ pattern: "monthly", monthlyDeposit: 12500 }).values.annualDeposit, 150000);
  });

  test("only the field the pattern uses is read", () => {
    assert.equal(check({ pattern: "yearly", monthlyDeposit: "garbage" }).ok, true);
    assert.equal(check({ pattern: "monthly", yearlyDeposit: "garbage" }).ok, true);
  });

  test("rate: 0 to 15 inclusive in steps of 0.1 (0 is a calculation case)", () => {
    for (const ok of ["0", 0, "0.1", "7.1", "7", "14.9", "15", "15.0", 7.1]) assert.equal(check({ rate: ok }).ok, true, String(ok));
    for (const bad of ["-0.1", "15.1", "16", "7.15", "0.05", "abc", "7,1", "1e1"]) {
      const e = err({ rate: bad });
      assert.deepEqual(e.map((x) => x.fields), [["rate"]], String(bad));
      assert.equal(e[0].message, "The interest rate must be from 0% to 15%, in steps of 0.1.");
    }
    assert.equal(err({ rate: "" })[0].message, "Enter an interest rate.");
  });

  test("years: whole numbers from 1 to 50, default 16", () => {
    for (const ok of [1, 16, 50, "16"]) assert.equal(check({ years: ok }).ok, true, String(ok));
    for (const bad of [0, 51, -1, 16.5, "abc", 100]) {
      const e = err({ years: bad });
      assert.deepEqual(e.map((x) => x.fields), [["years"]], String(bad));
      assert.equal(e[0].message, "The number of years must be a whole number from 1 to 50.");
    }
    assert.equal(err({ years: "" })[0].message, "Enter the number of years.");
  });

  test("the pattern must be one of the two; every problem is reported, each with its field", () => {
    assert.deepEqual(err({ pattern: "weekly" }).map((x) => x.fields), [["pattern"]]);
    assert.equal(err({ pattern: undefined })[0].message, "Choose a deposit pattern: yearly in April, or monthly.");
    const all = err({ yearlyDeposit: 100, rate: 99, years: 0 });
    assert.deepEqual(all.map((x) => x.fields[0]), ["yearlyDeposit", "rate", "years"]);
    assert.ok(all.every((x) => typeof x.message === "string" && x.message.length > 0));
    assert.equal(validatePpfInputs(undefined).ok, false);
    assert.equal(validatePpfInputs(null).ok, false);
  });

  test("the engine refuses values that were not validated, and never repairs them", () => {
    for (const bad of [undefined, null, {}, { pattern: "yearly", annualDeposit: -1, rate: 7, years: 5 }, { pattern: "yearly", annualDeposit: 500, rate: -1, years: 5 }, { pattern: "yearly", annualDeposit: 500, rate: 7, years: 0 }, { pattern: "yearly", annualDeposit: 500, rate: 7, years: 2.5 }, { pattern: "x", annualDeposit: 500, rate: 7, years: 5 }]) {
      assert.throws(() => calculatePpf(bad), TypeError);
    }
  });
});

describe("annual versus monthly, for the same yearly total", () => {
  const values = (annual, rate = "8", years = 16) => validatePpfInputs({ pattern: "yearly", yearlyDeposit: annual, rate, years }).values;

  test("eligible only when the yearly total is a multiple of 600 (so twelve deposits are whole multiples of 50)", () => {
    for (const total of [600, 1200, 60000, 148800, 150000]) {
      const c = comparePpfPatterns(values(total));
      assert.equal(c.eligible, true, String(total));
      assert.equal(c.monthlyDeposit, total / 12);
      assert.equal(c.monthlyDeposit % 50, 0);
    }
    for (const total of [500, 550, 650, 100000, 149950, 99900]) {
      const c = comparePpfPatterns(values(total));
      assert.equal(c.eligible, false, String(total));
      assert.match(c.reason, /multiple of ₹600/);
      assert.equal(c.yearly, undefined);
    }
  });

  test("it follows the oracle's comparison vectors, and never ranks: the difference is yearly minus monthly", () => {
    const withComparison = GOLD.vectors.filter((v) => v.comparison.eligible);
    assert.ok(withComparison.length > 200);
    for (const v of withComparison) {
      const c = comparePpfPatterns({ pattern: v.pattern, annualDeposit: v.annualDeposit, rate: Number(v.rate), years: v.years });
      assert.equal(c.eligible, true, v.id);
      near(c.yearly.balance, Number(v.comparison.yearlyBalance), `${v.id} yearly`);
      near(c.monthly.balance, Number(v.comparison.monthlyBalance), `${v.id} monthly`);
      near(c.difference, Number(v.comparison.difference), `${v.id} difference`);
      const exactDifference = Number(v.comparison.yearlyBalance) - Number(v.comparison.monthlyBalance);
      const edgeOf = (x) => Math.abs(x - Math.floor(x) - 0.5) <= tol(x);
      // the displayed difference reconciles with the two displayed balances on screen, always
      assert.equal(c.displayDifference, roundRupee(c.yearly.balance) - roundRupee(c.monthly.balance), v.id);
      // and it equals the oracle's gap between the two displayed (half-up) balances, unless a balance sits on a .5 boundary
      if (![Number(v.comparison.yearlyBalance), Number(v.comparison.monthlyBalance)].some(edgeOf)) assert.equal(c.displayDifference, v.comparison.displayedBalanceGap, v.id);
      assert.ok(exactDifference >= -1e-6, `${v.id}: yearly is never below monthly`);
    }
    for (const v of GOLD.vectors.filter((x) => !x.comparison.eligible)) {
      assert.equal(comparePpfPatterns({ pattern: v.pattern, annualDeposit: v.annualDeposit, rate: Number(v.rate), years: v.years }).eligible, false, v.id);
    }
  });

  test("a monthly input compares against the same total paid in April, and at rate 0 the two are equal", () => {
    const m = validatePpfInputs({ pattern: "monthly", monthlyDeposit: 5000, rate: "7.1", years: 16 }).values;
    const c = comparePpfPatterns(m);
    assert.equal(c.annualDeposit, 60000);
    assert.equal(c.yearly.pattern, "yearly");
    assert.equal(c.monthly.pattern, "monthly");
    near(c.monthly.balance, calculatePpf(m).balance, "the monthly side is the monthly calculation");
    const z = comparePpfPatterns(values(60000, "0", 16));
    assert.equal(z.difference, 0);
    assert.equal(z.displayDifference, 0);
  });
});

describe("whole-rupee display and reconciliation", () => {
  test("halves round up; just below a half rounds down; just above rounds up", () => {
    assert.equal(roundRupee(0), 0);
    assert.equal(roundRupee(0.4999), 0);
    assert.equal(roundRupee(0.5), 1);
    assert.equal(roundRupee(0.5001), 1);
    assert.equal(roundRupee(1.5), 2);
    assert.equal(roundRupee(2.5), 3);
    assert.equal(roundRupee(160650), 160650);
    assert.equal(roundRupee(155768.75), 155769);
    assert.equal(roundRupee(4068209.2203), 4068209);
    assert.equal(roundRupee(15778.3969), 15778);
    assert.equal(roundRupee(13560.6974), 13561);
  });

  test("balance = deposits + interest on screen, and each row adds up, for a spread of inputs", () => {
    for (const [pattern, deposit, rate, years] of [["yearly", 150000, "7.1", 16], ["monthly", 12500, "7.1", 16], ["yearly", 500, "0.1", 1], ["monthly", 50, "15", 50], ["yearly", 123450, "6.9", 37], ["monthly", 7750, "8.3", 21]]) {
      const r = run(pattern, deposit, rate, years);
      const d = toDisplay(r);
      assert.equal(d.totalDeposited + d.interest, d.balance);
      assert.equal(d.rows.length, years);
      let sum = 0;
      for (const row of d.rows) {
        assert.equal(row.openingBalance + row.deposits + row.interest, row.closingBalance);
        sum += row.interest;
      }
      assert.equal(d.totalDeposited + sum, d.balance, "the interest column adds up to the headline interest");
      assert.ok(Number.isInteger(d.balance) && Number.isInteger(d.interest));
      assert.ok(d.interestSharePercent >= 0 && d.interestSharePercent < 100);
    }
  });

  test("the interest share is the interest over the balance, and zero at rate 0", () => {
    const r = run("yearly", 150000, "7.1", 16);
    near(r.interestShare, (r.balance - 2400000) / r.balance, "share");
    assert.equal(toDisplay(run("yearly", 150000, "0", 16)).interestSharePercent, 0);
  });
});

describe("determinism, purity and cost", () => {
  test("the same inputs give identical results, and the inputs are never changed", () => {
    const values = Object.freeze({ pattern: "monthly", deposit: 7750, annualDeposit: 93000, monthlyDeposit: 7750, rate: 8.3, years: 37 });
    const a = JSON.stringify(calculatePpf(values));
    for (let i = 0; i < 5; i += 1) assert.equal(JSON.stringify(calculatePpf(values)), a);
    assert.equal(values.years, 37);
    assert.equal(JSON.stringify(toDisplay(calculatePpf(values))), JSON.stringify(toDisplay(calculatePpf(values))));
  });

  test("the worst case (50 years, monthly pattern) is bounded and fast", () => {
    const started = process.hrtime.bigint();
    for (let i = 0; i < 2000; i += 1) calculatePpf({ pattern: "monthly", annualDeposit: 150000, rate: 15, years: 50 });
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    assert.ok(ms < 3000, `2000 worst-case calculations took ${ms} ms`);
  });
});
