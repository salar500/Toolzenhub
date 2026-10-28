import test from "node:test";
import assert from "node:assert/strict";

import { calculateEMI, calculateAmortization } from "../../assets/js/calculators/formulas/loan.js";
import { calculatePpf } from "../../assets/js/calculators/formulas/ppf.js";
import { realValue, realReturnPercent } from "../../assets/js/calculators/formulas/inflation.js";
import { toFlow, validateFlows, solveXirr } from "../../assets/js/calculators/formulas/xirr.js";

/*
 * Calculators Ecosystem 2.0, Stage 3: independent audit values.
 *
 * EMI, PPF and inflation expected values were produced by Python's decimal module (50 to 60 digits, run with python -I)
 * from the textbook closed forms, not by these engines; the generating scripts are in
 * docs/ecosystem-review/calculators/stage3-evidence/. XIRR expected values are what Microsoft Excel's own XIRR returned
 * (Excel 16, driven through COM; Excel iterates to about 1e-8, so the tolerance here is 1e-7).
 */

const near = (actual, expected, tolerance, label) =>
    assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected}`);

test("EMI: Decimal-oracle values, relative error under 1e-11", () => {
    const cases = [
        [1000, 0, 1, 83.3333333333333333333],
        [99999.99, 0.1, 3, 2782.06198861773532991],
        [1234567.89, 12, 20, 13593.6558462929155751],
        [5000000, 9, 20, 44986.2977925086519185],
        [100000000, 30, 40, 2500017.80277541874698]
    ];
    for (const [principal, rate, years, expected] of cases) {
        near(calculateEMI(principal, rate, years) / expected, 1, 1e-11, `${principal} at ${rate}% for ${years}y`);
    }
});

test("EMI: the schedule repays exactly the principal, ends at zero and carries the oracle's total interest", () => {
    const schedule = calculateAmortization(5000000, 9, 20);
    assert.equal(schedule.length, 240);
    const principal = schedule.reduce((sum, row) => sum + row.principal, 0);
    const interest = schedule.reduce((sum, row) => sum + row.interest, 0);
    near(principal, 5000000, 1e-6, "principal");
    near(interest / 5796711.4702020764604621, 1, 1e-11, "interest");
    assert.ok(Math.abs(schedule.at(-1).balance) < 1e-6);
});

test("PPF: yearly and monthly patterns equal the closed forms", () => {
    // yearly: balance = (balance + D)(1 + r) each year; monthly: balance + 12m + (r/12)(12 balance + 78 m)
    const yearly = calculatePpf({ pattern: "yearly", annualDeposit: 150000, rate: 7.1, years: 15 });
    let expected = 0;
    for (let i = 0; i < 15; i++) expected = (expected + 150000) * (1 + 0.071);
    near(yearly.balance / expected, 1, 1e-14, "yearly");
    const monthly = calculatePpf({ pattern: "monthly", annualDeposit: 120000, rate: 7.1, years: 15 });
    let m = 0;
    for (let i = 0; i < 15; i++) m = m + 12 * 10000 + (0.071 / 12) * (12 * m + 78 * 10000);
    near(monthly.balance / m, 1, 1e-14, "monthly");
});

test("inflation: today's money and the return after inflation match the Decimal oracle", () => {
    near(realValue(1000000, 6, 10) / (1000000 / Math.pow(1.06, 10)), 1, 1e-13, "real value");
    near(realReturnPercent(12, 6), ((1.12 / 1.06) - 1) * 100, 1e-12, "return after inflation");
    near(realValue(500, 0, 7), 500, 0, "0% inflation changes nothing");
});

test("XIRR: values Excel returned for the same cash flows (Excel 16 via COM)", () => {
    const f = toFlow;
    const cases = [
        [[f("2023-01-01", -100000), f("2023-07-01", -50000), f("2024-03-31", 20000), f("2025-01-01", 170000)], 0.143943935632706],
        [[f("2020-01-01", -100000), f("2025-01-01", 200000)], 0.148524039983749],
        [[f("2022-01-01", -1000), f("2023-01-01", 500)], -0.49999999627471],
        [[f("2023-12-31", -1000), f("2024-12-31", 1100)], 0.0997135818004608],
        [[f("2022-01-01", 200), f("2023-01-01", -100)], -0.49999999627471],
        [[f("2020-01-05", -1000), f("2020-02-05", -1000), f("2020-03-05", -1000), f("2020-04-05", -1000), f("2020-05-05", -1000), f("2020-06-05", -1000), f("2020-07-05", 6600)], 0.382709640264511],
        [[f("1990-01-01", -1000), f("2030-01-01", 50000)], 0.102669030427933],
        [[f("2023-01-01", -1000), f("2024-01-01", 1000.5)], 0.00050000250339508],
        [[f("2023-01-01", -500), f("2023-01-01", -500), f("2024-01-01", 1200)], 0.199999994039536],
        [[f("2023-01-01", -100000), f("2024-01-01", 1)], -0.999989999999889]
    ];
    for (const [rows, excel] of cases) {
        const check = validateFlows(rows);
        assert.ok(check.ok, JSON.stringify(check.errors));
        near(solveXirr(check.values.flows).rate, excel, 1e-7, JSON.stringify(rows.map((r) => [r.iso, r.amount])).slice(0, 60));
    }
});
