/**
 * Tool Pack 29, G4: the Gratuity Calculator engine
 * (assets/js/calculators/formulas/gratuity.js, gratuity-calendar.js and gratuity-rules.js).
 *
 * The reference values come from tests/fixtures/gratuity-golden.json, written ONLY by tests/fixtures/gratuity-golden.py:
 * exact Fraction money, dates by a month walk on Python's datetime. It does not read, import or run the JavaScript, and no
 * expected value here is a JavaScript output. The literals typed in this file come from the approved specification
 * (docs/tool-packs/29-gratuity-calculator.md, sections 7.7, 25 and 33) and from hand arithmetic written next to them.
 *
 * What is pinned: the pure, local engine (no Date, network, storage, DOM, eval or randomness); the strict wage parser
 * (digits and at most two decimals; commas and spaces refused) and its limits; the calendar arithmetic and the PROVISIONAL
 * C-prime anniversary (a missing day is the first of the following month; both days counted); the counted years (exactly
 * six months does not count); the status bands (48 and 60 months, a presentation classification) and that no result carries
 * an "eligible" flag; exact integer-paise money with half-up display rounding and the ceiling compared before rounding;
 * the fixed-term cases (illustrative amounts only); unsupported and invalid outcomes (never a success-shaped zero); the
 * explorer and the wage comparison reusing the same rules; determinism, immutability and hostile inputs.
 *
 * Run directly (this avoids the full build that `npm run test:unit` runs first):
 *     node --test tests/unit/gratuity-golden.test.mjs
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as rules from "../../assets/js/calculators/formulas/gratuity-rules.js";
import * as calendar from "../../assets/js/calculators/formulas/gratuity-calendar.js";
import * as engine from "../../assets/js/calculators/formulas/gratuity.js";

const { calculateGratuity, parseWages, validateGratuityInputs, computeAmount, countedYears, exploreExitDates, compareWages } = engine;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FORMULAS = path.join(HERE, "..", "..", "assets", "js", "calculators", "formulas");
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "gratuity-golden.json"), "utf8"));

const iso = (d) => `${String(d.year).padStart(4, "0")}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
const date = (text) => {
  const parsed = calendar.parseDate(text);
  assert.equal(parsed.state, "valid", text);
  return parsed.date;
};
/* a supported input: the exit is on or after 21 November 2025 */
const base = { employeeType: "regular", wages: "50000", joiningDate: "2019-01-01", exitDate: "2025-12-31" };

/* the counted-years rule typed from the specification (7.2), used only to turn oracle (months, days) pairs into N */
const expectedCounted = (months, days) => {
  const rest = months % 12;
  return Math.floor(months / 12) + (rest > 6 || (rest === 6 && days >= 1) ? 1 : 0);
};


describe("source and independence", () => {
  const strip = (file) => fs.readFileSync(path.join(FORMULAS, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  const files = ["gratuity.js", "gratuity-calendar.js", "gratuity-rules.js"];

  test("the engine is pure and local: no Date, network, storage, DOM, eval, randomness or floating-point helpers", () => {
    for (const file of files) {
      const code = strip(file);
      assert.ok(!/\bDate\b/.test(code), `${file}: no Date`);
      for (const banned of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "localStorage", "sessionStorage", "indexedDB", "document.", "window.", "navigator.",
        "eval(", "new Function", "Math.random", "setTimeout", "setInterval", "parseFloat", "toFixed", "Math.round", "BigInt", "console.", "process.", "globalThis"]) {
        assert.ok(!code.includes(banned), `${file} must not contain ${banned}`);
      }
    }
  });

  test("imports stay inside the three engine modules", () => {
    for (const file of files) {
      const imports = [...strip(file).matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
      for (const spec of imports) {
        assert.ok(["./gratuity-rules.js", "./gratuity-calendar.js"].includes(spec), `${file} imports ${spec}`);
      }
    }
    assert.ok(!strip("gratuity-rules.js").includes("import "));
    assert.ok(!strip("gratuity-calendar.js").includes("import "));
  });

  test("the oracle is a separate Python program that does not read the engine", () => {
    const oracle = fs.readFileSync(path.join(HERE, "..", "fixtures", "gratuity-golden.py"), "utf8");
    assert.ok(!/gratuity\.js|gratuity-calendar|gratuity-rules/.test(oracle.replace(/^"""[\s\S]*?"""/, "")));
    assert.ok(GOLD.meta.independence.includes("no JavaScript"));
  });
});


describe("constants and arithmetic safety", () => {
  test("the development values and limits are exactly the specified ones", () => {
    assert.equal(rules.CEILING_PAISE, 2000000 * 100);                       /* 20,00,000 rupees */
    assert.equal(rules.CEILING_PAISE, GOLD.meta.ceilingPaise);
    assert.equal(rules.WAGES_PRODUCT_LIMIT_PAISE, 10000000 * 100);          /* 1,00,00,000 rupees */
    assert.equal(rules.WAGES_PRODUCT_LIMIT_PAISE, GOLD.meta.productLimitPaise);
    assert.deepEqual({ ...rules.CODE_EFFECTIVE_DATE }, { year: 2025, month: 11, day: 21 });
    assert.equal(rules.FIVE_YEARS_MONTHS, 60);
    assert.equal(rules.FOURTH_YEAR_LINE_MONTHS, 48);
    assert.equal(rules.FIXED_TERM_MIN_MONTHS, 12);
    assert.equal(rules.DAYS_PER_YEAR_NUMERATOR, 15);
    assert.equal(rules.DAYS_DIVISOR, 26);
    assert.equal(rules.CONVENTION_ID, "C_PRIME_PROVISIONAL");
  });

  test("the technical maximum is derived, agrees with the oracle and keeps every intermediate a safe integer", () => {
    assert.equal(rules.WAGES_TECHNICAL_MAX_PAISE, GOLD.meta.technicalMaxPaise);
    assert.ok(rules.WAGES_PRODUCT_LIMIT_PAISE <= rules.WAGES_TECHNICAL_MAX_PAISE);
    const w = rules.WAGES_TECHNICAL_MAX_PAISE;
    const n = rules.MAX_COUNTED_YEARS;
    assert.ok(2 * w * 15 * n + 26 <= Number.MAX_SAFE_INTEGER);
    assert.ok(2 * (w + 1) * 15 * n + 26 > Number.MAX_SAFE_INTEGER);
    assert.ok(Number.isSafeInteger(rules.WAGES_PRODUCT_LIMIT_PAISE * 15 * n * 2 + 26));
    /* the largest service the calendar allows stays below the counted-years bound */
    const longest = calendar.measureService(date("0001-01-01"), date("9999-12-31"));
    assert.ok(countedYears(longest) < rules.MAX_COUNTED_YEARS);
  });
});


describe("the wage parser (exact digits, commas and spaces refused)", () => {
  test("agrees with the independent oracle on every case", () => {
    for (const { text, expect } of GOLD.parse) {
      const got = parseWages(text);
      assert.deepEqual(got, expect, JSON.stringify(text));
    }
  });

  test("hand-checked examples", () => {
    assert.deepEqual(parseWages("50000"), { state: "valid", paise: 5000000 });
    assert.deepEqual(parseWages("50000.5"), { state: "valid", paise: 5000050 });
    assert.deepEqual(parseWages("0.07"), { state: "valid", paise: 7 });
    assert.deepEqual(parseWages("1234567.89"), { state: "valid", paise: 123456789 });
    assert.deepEqual(parseWages("10000000"), { state: "valid", paise: 1000000000 });
    assert.deepEqual(parseWages("10000000.01"), { state: "invalid", code: "WAGES_PRODUCT_LIMIT" });
    assert.deepEqual(parseWages("1,50,000"), { state: "invalid", code: "WAGES_SEPARATOR" });
    assert.deepEqual(parseWages("1 500"), { state: "invalid", code: "WAGES_SEPARATOR" });
    assert.deepEqual(parseWages("0"), { state: "invalid", code: "WAGES_NOT_POSITIVE" });
    assert.deepEqual(parseWages("-100"), { state: "invalid", code: "WAGES_NOT_POSITIVE" });
    assert.deepEqual(parseWages("1.234"), { state: "invalid", code: "WAGES_DECIMALS" });
  });

  test("non-text values are refused or blank, never coerced", () => {
    assert.deepEqual(parseWages(undefined), { state: "blank" });
    assert.deepEqual(parseWages(null), { state: "blank" });
    for (const value of [50000, 0, true, {}, [], ["5"], () => 5, Symbol.iterator, NaN, Infinity]) {
      assert.deepEqual(parseWages(value), { state: "invalid", code: "WAGES_FORMAT" }, String(typeof value));
    }
  });
});


describe("the calendar arithmetic", () => {
  test("day numbers and their inverse", () => {
    assert.equal(calendar.dayNumber({ year: 1970, month: 1, day: 1 }), 0);
    assert.equal(calendar.dayNumber({ year: 2000, month: 3, day: 1 }), 11017);      /* 2000-01-01 is day 10957; January 31 + February 29 = 60 */
    assert.equal(calendar.dayNumber({ year: 2000, month: 1, day: 1 }), 10957);
    const first = calendar.dayNumber({ year: 1, month: 1, day: 1 });
    const last = calendar.dayNumber({ year: 9999, month: 12, day: 31 });
    assert.equal(last - first + 1, 3652059);                                        /* the number of days in the proleptic Gregorian years 1 to 9999 */
    for (let n = first; n <= last; n += 11) {
      assert.equal(calendar.dayNumber(calendar.dateFromDayNumber(n)), n);
    }
    assert.deepEqual(calendar.dateFromDayNumber(last), { year: 9999, month: 12, day: 31 });
    assert.deepEqual(calendar.addDays({ year: 9999, month: 12, day: 31 }, 1), { year: 10000, month: 1, day: 1 });
  });

  test("the day numbers agree with Python's proleptic Gregorian ordinals on 1,510 dates (years 1 to 9999)", () => {
    assert.equal(GOLD.ordinals.length, 1510);
    for (const [text, number] of GOLD.ordinals) {
      assert.equal(calendar.dayNumber(date(text)), number, text);
      assert.equal(iso(calendar.dateFromDayNumber(number)), text);
    }
  });

  test("leap years and month lengths", () => {
    assert.deepEqual([1900, 2000, 2020, 2023, 2024, 2100].map(calendar.isLeapYear), [false, true, true, false, true, false]);
    assert.deepEqual([[2023, 2], [2024, 2], [2024, 4], [2024, 12], [1900, 2], [2000, 2]].map(([y, m]) => calendar.daysInMonth(y, m)), [28, 29, 30, 31, 28, 29]);
  });

  test("strict date reading: only YYYY-MM-DD, impossible dates refused, never normalized", () => {
    assert.deepEqual(calendar.parseDate("2024-02-29"), { state: "valid", date: { year: 2024, month: 2, day: 29 } });
    assert.deepEqual(calendar.parseDate(""), { state: "blank" });
    assert.deepEqual(calendar.parseDate("   "), { state: "blank" });
    assert.deepEqual(calendar.parseDate(undefined), { state: "blank" });
    for (const text of ["2019-1-1", "2019/01/01", "20190101", " 2019-01-01", "2019-01-01 ", "10000-01-01", "2019-01-011", "abc"]) {
      assert.deepEqual(calendar.parseDate(text), { state: "invalid", code: "DATE_FORMAT" }, text);
    }
    for (const text of ["2019-02-30", "2023-02-29", "1900-02-29", "2019-00-10", "2019-13-01", "2019-04-31", "0000-01-01", "2019-01-00"]) {
      assert.deepEqual(calendar.parseDate(text), { state: "invalid", code: "DATE_INVALID" }, text);
    }
    assert.deepEqual(calendar.parseDate(20190101), { state: "invalid", code: "DATE_FORMAT" });
  });

  test("the C-prime anniversary: the same day, or the first day of the following month", () => {
    const a = (join, months) => iso(calendar.anniversary(date(join), months));
    assert.equal(a("2019-10-31", 66), "2025-05-01");       /* 31 April does not exist */
    assert.equal(a("2019-08-31", 66), "2025-03-01");       /* 31 February does not exist */
    assert.equal(a("2020-02-29", 12), "2021-03-01");       /* a non-leap year has no 29 February */
    assert.equal(a("2020-02-29", 48), "2024-02-29");
    assert.equal(a("2020-02-29", 60), "2025-03-01");
    assert.equal(a("2021-01-31", 1), "2021-03-01");
    assert.equal(a("2020-01-31", 1), "2020-03-01");        /* 31 February does not exist even in a leap year */
    assert.equal(a("2020-01-30", 1), "2020-03-01");
    assert.equal(a("2020-01-29", 1), "2020-02-29");
    assert.equal(a("2019-12-31", 6), "2020-07-01");        /* 31 June does not exist; year rollover of the month index */
    assert.equal(a("2019-12-31", 2), "2020-03-01");
    assert.equal(a("2019-01-28", 13), "2020-02-28");
    assert.equal(a("2019-05-15", 0), "2019-05-15");
  });

  test("the service agrees with the month walk of the oracle on 900 random pairs", () => {
    for (const [join, exit, months, days, exclusiveEnd] of GOLD.serviceRandom) {
      const s = calendar.measureService(date(join), date(exit));
      assert.equal(s.totalMonths, months, `${join} to ${exit}`);
      assert.equal(s.days, days, `${join} to ${exit}`);
      assert.equal(s.years, Math.floor(months / 12));
      assert.equal(s.months, months % 12);
      assert.equal(iso(s.exclusiveEnd), exclusiveEnd);
    }
  });

  test("the service agrees with the oracle on every join day of 2019 and 2020 around 48, 60 and 66 months (+-2 days)", () => {
    assert.equal(GOLD.serviceBoundary.length, 10965);
    for (const [join, exit, months, days] of GOLD.serviceBoundary) {
      const s = calendar.measureService(date(join), date(exit));
      assert.equal(s.totalMonths, months, `${join} to ${exit}`);
      assert.equal(s.days, days, `${join} to ${exit}`);
    }
  });

  test("the displayed duration is reversible: exclusive end = anniversary + days, and the days stay inside the gap", () => {
    for (const [join, exit] of GOLD.serviceRandom) {
      const j = date(join);
      const s = calendar.measureService(j, date(exit));
      assert.equal(calendar.dayNumber(s.exclusiveEnd), calendar.dayNumber(calendar.anniversary(j, s.totalMonths)) + s.days);
      assert.ok(s.days >= 0 && s.days < calendar.dayNumber(calendar.anniversary(j, s.totalMonths + 1)) - calendar.dayNumber(calendar.anniversary(j, s.totalMonths)));
    }
  });

  test("hand-checked service examples (specification 7.7)", () => {
    const m = (join, exit) => { const s = calendar.measureService(date(join), date(exit)); return [s.years, s.months, s.days]; };
    assert.deepEqual(m("2016-04-01", "2024-03-31"), [8, 0, 0]);
    assert.deepEqual(m("2019-01-01", "2023-12-31"), [5, 0, 0]);
    assert.deepEqual(m("2019-01-01", "2023-12-30"), [4, 11, 30]);
    assert.deepEqual(m("2019-01-01", "2024-06-30"), [5, 6, 0]);
    assert.deepEqual(m("2019-01-01", "2024-07-01"), [5, 6, 1]);
    assert.deepEqual(m("2019-10-31", "2025-04-29"), [5, 5, 30]);
    assert.deepEqual(m("2019-10-31", "2025-04-30"), [5, 6, 0]);
    assert.deepEqual(m("2019-10-31", "2025-05-01"), [5, 6, 1]);
    assert.deepEqual(m("2020-02-29", "2025-02-27"), [4, 11, 30]);
    assert.deepEqual(m("2020-02-29", "2025-02-28"), [5, 0, 0]);
    assert.deepEqual(m("2018-08-31", "2024-02-28"), [5, 5, 29]);
    assert.deepEqual(m("2018-08-31", "2024-02-29"), [5, 6, 0]);
    assert.deepEqual(m("2021-01-31", "2021-02-28"), [0, 1, 0]);
    assert.deepEqual(m("2020-01-31", "2020-02-28"), [0, 0, 29]);
    assert.deepEqual(m("2024-05-15", "2024-05-15"), [0, 0, 1]);             /* one day of service: both days counted */
  });

  test("the extremes of the calendar", () => {
    const top = calendar.measureService(date("9999-01-01"), date("9999-12-31"));
    assert.deepEqual([top.totalMonths, top.days, iso(top.exclusiveEnd)], [12, 0, "10000-01-01"]);
    const full = calendar.measureService(date("0001-01-01"), date("9999-12-31"));
    assert.deepEqual([full.totalMonths, full.years, full.days], [9999 * 12, 9999, 0]);
  });

  test("the five-year date and the explorer's clamp-style month addition", () => {
    const five = (join) => iso(calendar.calendarFiveYearDate(date(join)));
    assert.equal(five("2019-01-01"), "2023-12-31");
    assert.equal(five("2020-02-29"), "2025-02-28");
    assert.equal(five("2019-10-31"), "2024-10-30");
    assert.equal(five("2019-08-31"), "2024-08-30");
    const clamp = (d, n) => iso(calendar.addMonthsClamp(date(d), n));
    assert.equal(clamp("2024-08-31", 6), "2025-02-28");
    assert.equal(clamp("2023-08-31", 6), "2024-02-29");
    assert.equal(clamp("2024-05-31", 6), "2024-11-30");
    assert.equal(clamp("2024-02-29", 12), "2025-02-28");
    assert.equal(clamp("2024-02-29", 6), "2024-08-29");
    assert.equal(clamp("2025-12-15", 12), "2026-12-15");
    assert.equal(clamp("2025-11-30", 3), "2026-02-28");
  });
});


describe("counted years (the amount only)", () => {
  test("the rule on hand-checked pairs: exactly six months does not count", () => {
    const n = (months, days) => countedYears({ totalMonths: months, days });
    assert.equal(n(60, 0), 5);
    assert.equal(n(65, 30), 5);     /* 5 y 5 m 30 d */
    assert.equal(n(66, 0), 5);      /* 5 y 6 m 0 d: not in excess of six months */
    assert.equal(n(66, 1), 6);      /* 5 y 6 m 1 d */
    assert.equal(n(67, 0), 6);      /* 5 y 7 m */
    assert.equal(n(71, 30), 6);
    assert.equal(n(72, 0), 6);
    assert.equal(n(12, 0), 1);
    assert.equal(n(18, 0), 1);
    assert.equal(n(18, 1), 2);
    assert.equal(n(0, 1), 0);
  });

  test("agrees with the specification's rule on every oracle pair", () => {
    for (const [join, exit, months, days] of GOLD.serviceRandom) {
      assert.equal(countedYears(calendar.measureService(date(join), date(exit))), expectedCounted(months, days), `${join} ${exit}`);
    }
  });
});


describe("money: exact integer paise, half-up display, the ceiling before rounding", () => {
  test("every oracle amount: the numerator, the half-up paisa figure and the ceiling flag", () => {
    for (const row of GOLD.amounts) {
      const got = computeAmount(row.wagesPaise, row.counted, "estimated");
      assert.equal(got.exactNumerator, row.numerator, JSON.stringify(row));
      assert.equal(got.exactDenominator, 26);
      assert.equal(got.paise, row.paise, JSON.stringify(row));
      assert.equal(got.ceilingApplied, row.ceilingApplied, JSON.stringify(row));
      assert.ok(Number.isSafeInteger(got.paise));
    }
  });

  test("the specification's anchors (hand arithmetic)", () => {
    const p = (wages, n) => computeAmount(wages, n, "estimated").paise;
    assert.equal(p(5000000, 8), 23076923);       /* 50,000 x 15 x 8 / 26 = 6,000,000 / 26 = 230,769.23 */
    assert.equal(p(5000000, 6), 17307692);       /* 4,500,000 / 26 = 173,076.92 */
    assert.equal(p(5000000, 5), 14423077);       /* 3,750,000 / 26 = 144,230.77 */
    assert.equal(p(5000000, 4), 11538462);       /* 3,000,000 / 26 = 115,384.62 */
    assert.equal(p(3000000, 5), 8653846);        /* 30,000 x 15 x 5 / 26 = 86,538.46 */
    assert.equal(p(5000000, 6) - p(5000000, 5), 2884615);   /* one counted year at 50,000: 28,846.15 */
    const capped = computeAmount(10000000, 36, "estimated");     /* 1,00,000 x 15 x 36 / 26 = 20,76,923.08 > the ceiling */
    assert.deepEqual([capped.paise, capped.ceilingApplied], [200000000, true]);
  });

  test("half-up at an exact tie: 13 paise x 15 x 5 / 26 = 37.5 rounds to 38; 13 x 15 / 26 = 7.5 rounds to 8", () => {
    assert.equal(computeAmount(13, 5, "estimated").paise, 38);
    assert.equal(computeAmount(13, 1, "estimated").paise, 8);
    assert.equal(computeAmount(12, 1, "estimated").paise, 7);    /* 180 / 26 = 6.92 */
    assert.equal(computeAmount(1, 1, "estimated").paise, 1);     /* 15 / 26 = 0.58 */
  });

  test("the ceiling: an exact value within half a paisa below it rounds up to it without the ceiling applying", () => {
    /* 173,333,333 x 15 x 2 = 5,199,999,990; / 26 = 199,999,999.62; 26 x 200,000,000 = 5,200,000,000 */
    const below = computeAmount(173333333, 2, "estimated");
    assert.deepEqual([below.paise, below.ceilingApplied], [200000000, false]);
    /* 173,333,334 x 15 x 2 = 5,200,000,020 > 5,200,000,000 */
    const above = computeAmount(173333334, 2, "estimated");
    assert.deepEqual([above.paise, above.ceilingApplied], [200000000, true]);
  });

  test("no result is ever below the exact value by more than half a paisa or above the ceiling", () => {
    for (const row of GOLD.amounts) {
      const got = computeAmount(row.wagesPaise, row.counted, "estimated");
      assert.ok(got.paise <= rules.CEILING_PAISE);
      if (!got.ceilingApplied) {
        assert.ok(Math.abs(got.paise * 26 - row.numerator) <= 13, JSON.stringify(row));
      }
    }
  });
});


describe("full calculations against the oracle", () => {
  test("every case: status, code, amount kind, amount, counted years, ceiling flag and service", () => {
    assert.equal(GOLD.fullCases.length, 304);
    for (const { input, expect } of GOLD.fullCases) {
      const got = calculateGratuity(input);
      const label = JSON.stringify(input);
      assert.equal(got.status, expect.status, label);
      assert.equal(got.code, expect.code, label);
      assert.equal(got.amount.kind, expect.amountKind, label);
      assert.equal(got.amount.paise, expect.paise, label);
      if (expect.paise === null) {
        assert.equal(got.countedYears, null, label);
        assert.equal(got.amount.exactNumerator, null, label);
      } else {
        assert.equal(got.countedYears, expect.countedYears, label);
        assert.equal(got.amount.ceilingApplied, expect.ceilingApplied, label);
        assert.equal(got.amount.exactNumerator, expect.numerator, label);
      }
      if (expect.service) {
        for (const key of ["totalMonths", "years", "months", "days", "exclusiveEnd"]) {
          assert.equal(got.service[key], expect.service[key], `${label} ${key}`);
        }
        if (expect.service.calendarFiveYearDate) {
          assert.equal(got.service.calendarFiveYearDate, expect.service.calendarFiveYearDate, label);
        }
      }
    }
  });

  test("the specification's boundary rows (7.7) moved inside the supported range, typed by hand: option C-prime at wages 50,000", () => {
    /* the 7.7 rows with exits before 21 November 2025 are outside the supported range (D4); these are the same service lengths, later */
    const row = (joiningDate, exitDate) => calculateGratuity({ ...base, joiningDate, exitDate });
    const r1 = row("2018-04-01", "2026-03-31");                                  /* exactly 8 years */
    assert.deepEqual([r1.code, r1.countedYears, r1.amount.kind, r1.amount.paise], ["STATUS_FIVE_YEARS_REACHED", 8, "estimated", 23076923]);
    const r2 = row("2021-01-01", "2025-12-30");                                  /* 4 y 11 m 30 d */
    assert.deepEqual([r2.code, r2.service.years, r2.service.months, r2.service.days, r2.countedYears, r2.amount.kind, r2.amount.paise],
      ["STATUS_FIFTH_YEAR_UNDETERMINED", 4, 11, 30, 5, "illustrative", 14423077]);
    const r3 = row("2020-10-31", "2026-04-30");                                  /* 31 October to 30 April: exactly six months under C-prime */
    assert.deepEqual([r3.code, r3.service.years, r3.service.months, r3.service.days, r3.countedYears, r3.amount.paise], ["STATUS_FIVE_YEARS_REACHED", 5, 6, 0, 5, 14423077]);
    const r4 = row("2020-10-31", "2026-05-01");
    assert.deepEqual([r4.service.months, r4.service.days, r4.countedYears, r4.amount.paise], [6, 1, 6, 17307692]);
    const r5 = row("2020-08-31", "2026-02-28");                                  /* 31 August to the end of a 28-day February */
    assert.deepEqual([r5.service.years, r5.service.months, r5.service.days, r5.countedYears, r5.amount.paise], [5, 6, 0, 5, 14423077]);
    const r6 = row("2024-02-29", "2029-02-27");                                  /* a leap-day joiner: five years end on 28 February under C-prime */
    assert.deepEqual([r6.code, r6.service.years, r6.service.months, r6.service.days], ["STATUS_FIFTH_YEAR_UNDETERMINED", 4, 11, 30]);
    const r7 = row("2024-02-29", "2029-02-28");
    assert.deepEqual([r7.code, r7.service.years, r7.service.months, r7.service.days], ["STATUS_FIVE_YEARS_REACHED", 5, 0, 0]);
    const r8 = row("2022-01-01", "2025-12-31");
    assert.deepEqual([r8.code, r8.countedYears, r8.amount.kind, r8.amount.paise], ["STATUS_FIFTH_YEAR_UNDETERMINED", 4, "illustrative", 11538462]);
    const r9 = row("2022-01-01", "2025-12-30");
    assert.deepEqual([r9.code, r9.amount.kind, r9.amount.paise, r9.countedYears, r9.service.calendarFiveYearDate], ["STATUS_THRESHOLD_NOT_REACHED", "none", null, null, "2026-12-31"]);
  });

  test("the specification's rows with exits before 21 November 2025 are the earlier-law outcome in the full calculation (D4)", () => {
    for (const exitDate of ["2024-03-31", "2023-12-30", "2025-04-30", "2025-11-20"]) {
      const r = calculateGratuity({ ...base, joiningDate: "2016-04-01", exitDate });
      assert.deepEqual([r.status, r.code, r.amount.kind, r.amount.paise], ["unsupported", "UNSUPPORTED_EARLIER_LAW", "none", null], exitDate);
    }
  });

  test("the status bands switch exactly at 48 and 60 months", () => {
    const code = (joiningDate, exitDate) => calculateGratuity({ ...base, joiningDate, exitDate }).code;
    assert.equal(code("2022-01-01", "2025-12-30"), "STATUS_THRESHOLD_NOT_REACHED");      /* 47 months 30 days */
    assert.equal(code("2022-01-01", "2025-12-31"), "STATUS_FIFTH_YEAR_UNDETERMINED");    /* 48 months */
    assert.equal(code("2020-12-01", "2025-11-29"), "STATUS_FIFTH_YEAR_UNDETERMINED");    /* 59 months 29 days */
    assert.equal(code("2020-12-01", "2025-11-30"), "STATUS_FIVE_YEARS_REACHED");         /* 60 months */
    /* the rounded count never makes a status: 4 y 11 m 30 d has N = 5 but is not "five years reached" */
    const r = calculateGratuity({ ...base, joiningDate: "2021-01-01", exitDate: "2025-12-30" });
    assert.equal(r.countedYears, 5);
    assert.notEqual(r.code, "STATUS_FIVE_YEARS_REACHED");
    assert.equal(r.amount.kind, "illustrative");
  });

  test("the month-end convention is C-prime, not the clamp: 31 October to 30 April is exactly six months", () => {
    const r = calculateGratuity({ ...base, joiningDate: "2020-10-31", exitDate: "2026-04-30" });
    assert.equal(r.countedYears, 5);
    assert.deepEqual([r.service.months, r.service.days], [6, 0]);
    assert.equal(r.amount.paise, 14423077);      /* the clamp reading (6 months 1 day, N = 6) would give 17307692 */
    assert.equal(r.trace.conventionId, "C_PRIME_PROVISIONAL");
  });

  test("a long service that reaches the ceiling says so", () => {
    const r = calculateGratuity({ ...base, wages: "100000", joiningDate: "1990-04-01", exitDate: "2030-03-31" });
    assert.equal(r.countedYears, 40);
    assert.deepEqual([r.amount.paise, r.amount.ceilingApplied], [200000000, true]);
    assert.ok(r.disclosures.includes("CEILING_APPLIED"));
  });
});


describe("fixed-term employees (illustrative amounts only)", () => {
  const ft = (joiningDate, exitDate, extra = {}) => calculateGratuity({ employeeType: "fixedTerm", contractEnd: "expires", wages: "50000", joiningDate, exitDate, ...extra });

  test("the one-year condition and the Rule 33 year counting", () => {
    const eleven = ft("2025-01-01", "2025-11-30");
    assert.deepEqual([eleven.code, eleven.amount.kind, eleven.amount.paise, eleven.countedYears], ["FT_UNDER_ONE_YEAR", "none", null, null]);
    const year = ft("2025-01-01", "2025-12-31");
    assert.deepEqual([year.code, year.amount.kind, year.countedYears, year.amount.paise], ["FT_ONE_YEAR_MET", "illustrative", 1, 2884615]);
    assert.equal(ft("2025-01-01", "2026-06-30").countedYears, 1);          /* 1 y 6 m 0 d: not in excess */
    const more = ft("2025-01-01", "2026-07-01");
    assert.deepEqual([more.countedYears, more.amount.paise], [2, 5769231]);   /* 1 y 6 m 1 d; 750,000 / 26 = 28,846.15 x 2 */
    assert.equal(ft("2025-01-01", "2026-07-31").countedYears, 2);
    for (const r of [year, more]) {
      assert.ok(r.disclosures.includes("ILLUSTRATIVE_NOT_ENTITLEMENT"));
      assert.ok(r.assumptions.includes("FT_PRO_RATA_READING"));
      assert.ok(r.assumptions.includes("FT_SINGLE_CONTRACT"));
      assert.ok(r.checkWithPayroll.includes("FIXED_TERM_CONTRACT_DETAILS"));
    }
  });

  test("the five-year rule is not applied to a fixed-term employee, and a regular employee's rule is not applied either", () => {
    const r = ft("2025-01-01", "2025-12-31");
    assert.equal(r.service.calendarFiveYearDate, undefined);
    assert.ok(!r.code.startsWith("STATUS_"));
  });

  test("a contract that ends earlier is unsupported with no figure", () => {
    const r = calculateGratuity({ employeeType: "fixedTerm", contractEnd: "earlier", wages: "50000", joiningDate: "2025-01-01", exitDate: "2026-12-31" });
    assert.deepEqual([r.status, r.code, r.amount.kind, r.amount.paise, r.eligibility], ["unsupported", "UNSUPPORTED_FT_EARLY_END", "none", null, null]);
  });
});


describe("unsupported, incomplete and invalid outcomes", () => {
  test("the earlier-law boundary is exactly 21 November 2025", () => {
    const on = calculateGratuity({ ...base, joiningDate: "2010-01-01", exitDate: "2025-11-21" });
    const before = calculateGratuity({ ...base, joiningDate: "2010-01-01", exitDate: "2025-11-20" });
    assert.equal(on.status, "ok");
    assert.deepEqual([before.status, before.code, before.amount.kind, before.amount.paise, before.service, before.eligibility], ["unsupported", "UNSUPPORTED_EARLIER_LAW", "none", null, null, null]);
  });

  test('the "other" type needs no other field and gives an explanation code, never a figure', () => {
    const r = calculateGratuity({ employeeType: "other", wages: "garbage", joiningDate: "nope" });
    assert.deepEqual([r.status, r.code, r.amount.kind, r.amount.paise, r.errors.length], ["unsupported", "UNSUPPORTED_OTHER_TYPE", "none", null, 0]);
  });

  test("validation agrees with the specification's matrix on every case", () => {
    for (const { input, status, errors } of GOLD.validation) {
      const r = calculateGratuity(input);
      assert.equal(r.status, status, JSON.stringify(input));
      assert.deepEqual(r.errors.map((e) => [e.field, e.code]), errors, JSON.stringify(input));
      assert.equal(r.amount.kind, "none");
      assert.equal(r.amount.paise, null);
      assert.equal(r.eligibility, null);
      assert.equal(r.service, null);
    }
  });

  test("an error is never a success-shaped result: no zero amount, no eligibility, an explicit null", () => {
    for (const input of [{}, { employeeType: "regular" }, { ...base, wages: "0" }, { ...base, exitDate: "2019-01-01", joiningDate: "2019-01-02" }]) {
      const r = calculateGratuity(input);
      assert.ok(["incomplete", "invalid"].includes(r.status));
      assert.notEqual(r.amount.paise, 0);
      assert.equal(r.amount.paise, null);
      assert.ok(r.errors.length > 0);
    }
  });

  test("validateGratuityInputs returns the normalized values on success", () => {
    const v = validateGratuityInputs(base);
    assert.equal(v.ok, true);
    assert.deepEqual(v.values.joining, { year: 2019, month: 1, day: 1 });
    assert.equal(v.values.wagesPaise, 5000000);
    assert.equal(v.values.contractEnd, null);
  });
});


describe("assumptions, payroll checks and disclosures are stable identifiers", () => {
  test("the month-end disclosure appears for a joining day of the 29th to 31st only", () => {
    const has = (joiningDate) => calculateGratuity({ ...base, joiningDate, exitDate: "2025-12-31" }).disclosures.includes("MONTH_END_DISCLOSURE");
    assert.equal(has("2019-01-28"), false);
    assert.equal(has("2019-01-29"), true);
    assert.equal(has("2019-01-30"), true);
    assert.equal(has("2019-01-31"), true);
    assert.equal(has("2020-02-29"), true);
  });

  test("a regular result lists the assumptions and the payroll checks; an illustrative one carries its disclosure", () => {
    const r = calculateGratuity({ ...base, joiningDate: "2021-01-01", exitDate: "2025-12-30" });
    for (const id of ["QUALIFYING_WAGES_NOT_GROSS", "EXIT_ON_OR_AFTER_CODE_DATE", "CONTINUOUS_SERVICE_ASSUMED", "BOTH_DAYS_COUNTED_C_PRIME", "PART_YEAR_OVER_SIX_MONTHS_AMOUNT_ONLY", "CEILING_DEVELOPMENT_VALUE", "ROUNDING_TOOL_CONVENTION", "EMPLOYER_BETTER_TERMS", "ESTIMATE_NOT_LEGAL_ADVICE"]) {
      assert.ok(r.assumptions.includes(id), id);
    }
    assert.deepEqual([...r.checkWithPayroll], ["WAGES_FIGURE", "CONTINUITY_OF_SERVICE", "ESTABLISHMENT_COVERAGE", "EMPLOYER_OWN_TERMS"]);
    assert.ok(r.disclosures.includes("ILLUSTRATIVE_NOT_ENTITLEMENT"));
    assert.ok(!r.assumptions.includes("FT_PRO_RATA_READING"));
  });

  test("no result carries an eligibility flag: an identifier and subjectToConditions only", () => {
    const outputs = [...GOLD.fullCases.map((c) => calculateGratuity(c.input)), ...GOLD.validation.map((c) => calculateGratuity(c.input))];
    for (const r of outputs) {
      const text = JSON.stringify(r);
      assert.ok(!/"(isEligible|eligible|entitled|isEntitled|payable)"/i.test(text));
      if (r.eligibility !== null) {
        assert.deepEqual(Object.keys(r.eligibility).sort(), ["id", "subjectToConditions"]);
        assert.equal(r.eligibility.subjectToConditions, true);
        assert.equal(typeof r.eligibility.id, "string");
      }
      assert.equal(r.trace.rulesCheckedOn, "2026-10-21");
    }
  });
});


describe("the explorer and the wage comparison reuse the same rules", () => {
  test("the targets agree with the oracle and each row is the ordinary calculation for that date", () => {
    for (const { joiningDate, exitDate, wages, targets } of GOLD.explorer) {
      const input = { employeeType: "regular", wages, joiningDate, exitDate };
      const out = exploreExitDates(input);
      assert.equal(out.status, "ok", JSON.stringify(input));
      assert.deepEqual(out.rows.map((r) => [r.id, r.exitDate]), targets, JSON.stringify(input));
      for (const row of out.rows) {
        assert.deepEqual(row.result, calculateGratuity({ ...input, exitDate: row.exitDate }));
      }
      const reached = out.base.service.totalMonths >= 60;
      assert.equal(out.rows.some((r) => r.id === "FIVE_YEAR_DATE"), !reached);
    }
  });

  test("the five-year row, when offered, is the day five years are completed", () => {
    const out = exploreExitDates({ employeeType: "regular", wages: "50000", joiningDate: "2022-01-01", exitDate: "2025-12-31" });
    const five = out.rows.find((r) => r.id === "FIVE_YEAR_DATE");
    assert.equal(five.exitDate, "2026-12-31");
    assert.equal(five.result.code, "STATUS_FIVE_YEARS_REACHED");
    assert.equal(five.result.service.totalMonths, 60);
  });

  test("the explorer is for regular employees; invalid or unsupported input gives no rows", () => {
    const ftOut = exploreExitDates({ employeeType: "fixedTerm", contractEnd: "expires", wages: "50000", joiningDate: "2025-01-01", exitDate: "2025-12-31" });
    assert.deepEqual([ftOut.status, ftOut.code, ftOut.rows.length], ["unsupported", "EXPLORER_REGULAR_ONLY", 0]);
    const bad = exploreExitDates({ ...base, wages: "0" });
    assert.deepEqual([bad.status, bad.code, bad.rows.length], ["invalid", "INVALID", 0]);
    const early = exploreExitDates({ ...base, exitDate: "2025-01-01" });
    assert.deepEqual([early.status, early.rows.length], ["unsupported", 0]);
    assert.equal(exploreExitDates(null).status, "unsupported");
  });

  test("the wage comparison: the difference of the two displayed amounts", () => {
    const out = compareWages({ ...base, joiningDate: "2018-04-01", exitDate: "2026-03-31" }, "60000");
    assert.equal(out.first.amount.paise, 23076923);
    assert.equal(out.second.amount.paise, 27692308);                        /* 60,000 x 15 x 8 / 26 = 7,200,000 / 26 = 276,923.08 */
    assert.equal(out.differencePaise, 27692308 - 23076923);
    assert.equal(out.differencePaise, 4615385);
    const bad = compareWages(base, "6,0000");
    assert.deepEqual([bad.second.status, bad.differencePaise], ["invalid", null]);
    const none = compareWages({ ...base, joiningDate: "2022-01-01", exitDate: "2025-12-30" }, "60000");
    assert.equal(none.differencePaise, null);
  });
});


describe("determinism, immutability and hostile inputs", () => {
  const deepFrozen = (value) => {
    if (value && typeof value === "object") {
      assert.ok(Object.isFrozen(value));
      Object.values(value).forEach(deepFrozen);
    }
  };
  const finite = (value) => {
    if (typeof value === "number") assert.ok(Number.isFinite(value) && !Object.is(value, -0));
    else if (value && typeof value === "object") Object.values(value).forEach(finite);
  };

  test("repeated calls are identical, the input is not changed, and results are deeply frozen with finite numbers", () => {
    const input = Object.freeze({ ...base, joiningDate: "2020-10-31", exitDate: "2026-04-30" });
    const before = JSON.stringify(input);
    const a = calculateGratuity(input);
    const b = calculateGratuity(input);
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify(input), before);
    deepFrozen(a);
    for (const { input: i } of GOLD.fullCases.slice(0, 60)) finite(calculateGratuity(i));
    deepFrozen(exploreExitDates(input));
    deepFrozen(compareWages(input, "60000"));
  });

  test("hostile keys such as __proto__ do not change the result or any global object", () => {
    const polluted = JSON.parse('{"__proto__":{"employeeType":"regular","wages":"50000"},"constructor":{"prototype":{"employeeType":"regular"}}}');
    const r = calculateGratuity(polluted);
    assert.equal(r.status, "incomplete");
    assert.equal({}.employeeType, undefined);
    assert.equal(Object.prototype.employeeType, undefined);
  });

  test("an input whose properties throw becomes a structured error result, never an exception or an amount", () => {
    const throwing = { get employeeType() { throw new Error("boom"); } };
    const r = calculateGratuity(throwing);
    assert.deepEqual([r.status, r.code, r.amount.kind, r.amount.paise, r.eligibility], ["error", "INTERNAL_ERROR", "none", null, null]);
    const proxy = new Proxy({}, { get() { throw new Error("boom"); } });
    assert.equal(calculateGratuity(proxy).status, "error");
    assert.equal(exploreExitDates(proxy).status === "ok", false);
  });

  test("unexpected shapes never throw and never produce an amount", () => {
    for (const input of [null, undefined, [], "text", 5, true, () => {}, { employeeType: {} }, { employeeType: ["regular"] }, { employeeType: "regular", wages: {}, joiningDate: [], exitDate: 7 },
      { employeeType: "REGULAR" }, { employeeType: " regular" }, { employeeType: "fixedTerm", contractEnd: ["expires"] }]) {
      const r = calculateGratuity(input);
      assert.notEqual(r.status, "error");
      assert.equal(r.amount.paise, null);
    }
  });

  test("a huge or hostile string is refused quickly and safely", () => {
    const started = Date.now();
    for (const wages of ["9".repeat(1000000), "1".repeat(100000) + ".5", `<script>alert(1)</script>`, "50000\u0000", "5\n0000"]) {
      const r = calculateGratuity({ ...base, wages });
      assert.equal(r.status, "invalid");
      assert.equal(r.amount.paise, null);
    }
    const r = calculateGratuity({ ...base, joiningDate: "2".repeat(1000000) });
    assert.equal(r.status, "invalid");
    assert.ok(Date.now() - started < 2000);
  });

  test("results never echo user text as markup: the trace holds only normalized numbers and ISO dates", () => {
    const r = calculateGratuity(base);
    assert.deepEqual(Object.keys(r.trace.inputs).sort(), ["contractEnd", "employeeType", "exitDate", "joiningDate", "wagesPaise"]);
    assert.equal(typeof r.trace.inputs.wagesPaise, "number");
    assert.match(r.trace.inputs.joiningDate, /^\d{4,5}-\d{2}-\d{2}$/);
  });
});
