/**
 * Tool Pack 1: the CSV export of the Loan Prepayment schedule.
 *
 * The file is checked against the independently derived reference totals (tests/fixtures/prepayment-golden.py;
 * the figures are the same ones prepayment-golden.test.mjs asserts): for the loan below, the keep-EMI schedule
 * has 148 EMIs and 1,426,377.26 of interest, the lower-EMI schedule 180 EMIs and 1,734,696.18, the schedule
 * without a prepayment 180 EMIs and 1,931,328.01.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { calculatePrepayment } from "../../assets/js/calculators/formulas/prepayment.js";
import { buildScheduleCsv, scheduleFilename, csvCell, CSV_COLUMNS } from "../../assets/js/calculators/prepayment/export.js";

const MAIN = { balance: 2500000, annualRate: 8.5, remainingMonths: 180, prepayment: 300000, afterMonths: 24 };
const result = calculatePrepayment(MAIN);

const HEADER = "Period,Opening Balance,Payment,Principal,Interest,Prepayment,Closing Balance";

/** parse the CSV text the way a spreadsheet would: strip the BOM, split on CRLF, then on commas */
function parse(csv) {
  assert.ok(csv.startsWith("﻿"), "starts with a UTF-8 byte order mark");
  assert.ok(csv.endsWith("\r\n"), "ends with a line break");
  const lines = csv.slice(1).split("\r\n").slice(0, -1);
  return { header: lines[0], rows: lines.slice(1).map((l) => l.split(",")) };
}
const column = (rows, i) => rows.map((r) => Number(r[i]));
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

describe("CSV content", () => {
  test("the header row is exact, and CSV_COLUMNS agrees", () => {
    assert.equal(CSV_COLUMNS.join(","), HEADER);
    for (const scenario of ["baseline", "keep", "reduce"]) assert.equal(parse(buildScheduleCsv(result, scenario)).header, HEADER);
  });

  test("row counts: 180, 148 and 180 (one row per EMI)", () => {
    assert.equal(parse(buildScheduleCsv(result, "baseline")).rows.length, 180);
    assert.equal(parse(buildScheduleCsv(result, "keep")).rows.length, 148);
    assert.equal(parse(buildScheduleCsv(result, "reduce")).rows.length, 180);
  });

  test("the selected scenario decides the file: interest totals equal the reference", () => {
    const interest = (scenario) => sum(column(parse(buildScheduleCsv(result, scenario)).rows, 4));
    assert.ok(Math.abs(interest("baseline") - 1931328.01) < 1, "without a prepayment");
    assert.ok(Math.abs(interest("keep") - 1426377.26) < 1, "keep EMI");
    assert.ok(Math.abs(interest("reduce") - 1734696.18) < 1, "lower EMI");
  });

  test("rows are in order, labelled Month 1..n, and each starts where the last ended", () => {
    for (const scenario of ["baseline", "keep", "reduce"]) {
      const { rows } = parse(buildScheduleCsv(result, scenario));
      rows.forEach((r, i) => assert.equal(r[0], `Month ${i + 1}`));
      for (let i = 1; i < rows.length; i++) assert.equal(rows[i][1], rows[i - 1][6], `${scenario} month ${i + 1}`);
    }
  });

  test("the prepayment is in month 24 and nowhere else; the baseline has none", () => {
    for (const scenario of ["keep", "reduce"]) {
      const { rows } = parse(buildScheduleCsv(result, scenario));
      assert.deepEqual(rows.filter((r) => Number(r[5]) > 0).map((r) => r[0]), ["Month 24"], scenario);
      assert.equal(rows[23][5], "300000.00");
    }
    assert.ok(parse(buildScheduleCsv(result, "baseline")).rows.every((r) => r[5] === "0.00"));
  });

  test("the EMI column: kept EMI, or the lower EMI after the prepayment", () => {
    const keep = parse(buildScheduleCsv(result, "keep")).rows;
    const reduce = parse(buildScheduleCsv(result, "reduce")).rows;
    assert.equal(keep[0][2], "24618.49");
    assert.equal(keep[24][2], "24618.49");
    assert.equal(reduce[23][2], "24618.49");
    assert.equal(reduce[24][2], "21434.95");
  });

  test("the final balance is zero, and everything borrowed is repaid", () => {
    for (const scenario of ["baseline", "keep", "reduce"]) {
      const { rows } = parse(buildScheduleCsv(result, scenario));
      assert.equal(rows.at(-1)[6], "0.00", scenario);
      assert.ok(Math.abs(sum(column(rows, 3)) + sum(column(rows, 5)) - MAIN.balance) < 1, scenario);
    }
  });

  test("values are plain numbers with two decimals: no rupee sign, no digit grouping, no HTML", () => {
    const { rows } = parse(buildScheduleCsv(result, "keep"));
    for (const r of rows) for (const cell of r.slice(1)) assert.match(cell, /^\d+\.\d{2}$/, cell);
    assert.ok(!/[₹<>&]/.test(buildScheduleCsv(result, "keep")));
  });

  test("a prepayment before the first EMI is a Start row, in the same columns", () => {
    const now = calculatePrepayment({ ...MAIN, afterMonths: 0 });
    const { rows } = parse(buildScheduleCsv(now, "keep"));
    assert.deepEqual(rows[0], ["Start", "2500000.00", "0.00", "0.00", "0.00", "300000.00", "2200000.00"]);
    assert.equal(rows[1][0], "Month 1");
    assert.equal(rows[1][1], "2200000.00");
    assert.equal(rows.length, 144);
  });

  test("a prepayment that clears the loan: one schedule that ends at zero; the lower-EMI schedule is only a header", () => {
    const payoff = calculatePrepayment({ balance: 100000, annualRate: 9, remainingMonths: 12, prepayment: 150000, afterMonths: 0 });
    const { rows } = parse(buildScheduleCsv(payoff, "keep"));
    assert.equal(rows.length, 1);
    assert.deepEqual(rows[0].slice(0, 1).concat(rows[0].slice(5)), ["Start", "100000.00", "0.00"]);
    assert.deepEqual(parse(buildScheduleCsv(payoff, "reduce")).rows, []);
  });
});

describe("file names", () => {
  test("one clear name per schedule", () => {
    assert.equal(scheduleFilename(result, "baseline"), "loan-prepayment-without-prepayment-schedule.csv");
    assert.equal(scheduleFilename(result, "keep"), "loan-prepayment-keep-emi-schedule.csv");
    assert.equal(scheduleFilename(result, "reduce"), "loan-prepayment-lower-emi-schedule.csv");
    const payoff = calculatePrepayment({ balance: 100000, annualRate: 9, remainingMonths: 12, prepayment: 150000, afterMonths: 0 });
    assert.equal(scheduleFilename(payoff, "keep"), "loan-prepayment-clear-loan-schedule.csv");
  });

  test("names are lower-case letters, digits and hyphens only, ending in .csv", () => {
    for (const scenario of ["baseline", "keep", "reduce", "anything else"]) assert.match(scheduleFilename(result, scenario), /^[a-z0-9-]+\.csv$/);
  });
});

describe("cell escaping", () => {
  test("a cell is quoted only when it has a comma, quote or line break; quotes are doubled", () => {
    assert.equal(csvCell("Month 1"), "Month 1");
    assert.equal(csvCell("1234.50"), "1234.50");
    assert.equal(csvCell("a,b"), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell("two\nlines"), '"two\nlines"');
    assert.equal(csvCell("cr\rhere"), '"cr\rhere"');
  });
});
