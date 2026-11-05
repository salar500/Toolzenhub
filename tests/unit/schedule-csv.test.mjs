/**
 * Loan schedule CSV (EMI and Home Loan). The expected numbers were worked out OUTSIDE this code base, with Python's decimal module at
 * 50 digits (payment = P r (1+r)^n / ((1+r)^n - 1), balance carried unrounded, the last payment clears the balance, rounded half up
 * to the paisa only at the end), so the file is checked against an independent calculation and not against the function that made it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAmortization } from "../../assets/js/calculators/formulas/loan.js";
import { calculateHomeLoan } from "../../assets/js/calculators/formulas/home-loan.js";
import { buildScheduleCsv, csvCell, SCHEDULE_COLUMNS } from "../../assets/js/calculators/common/schedule-csv.js";

const parse = (csv) => csv.replace(/^﻿/, "").split("\r\n").filter((l) => l !== "").map((l) => l.split(","));

/* [payment number, EMI, principal, interest, balance] for chosen payments, and the totals */
const CASES = [
    {
        label: "1,000,000 at 8.5% for 20 years",
        P: 1000000, rate: 8.5, years: 20, n: 240,
        rows: { 1: ["8678.23", "1594.90", "7083.33", "998405.10"], 2: ["8678.23", "1606.20", "7072.04", "996798.90"], 120: ["8678.23", "3694.17", "4984.06", "699938.23"], 239: ["8678.23", "8556.58", "121.65", "8617.19"], 240: ["8678.23", "8617.19", "61.04", "0.00"] },
        totals: ["2082775.76", "1000000.00", "1082775.76"]
    },
    {
        label: "250,000 at 0% for 2 years (no interest)",
        P: 250000, rate: 0, years: 2, n: 24,
        rows: { 1: ["10416.67", "10416.67", "0.00", "239583.33"], 12: ["10416.67", "10416.67", "0.00", "125000.00"], 24: ["10416.67", "10416.67", "0.00", "0.00"] },
        totals: ["250000.00", "250000.00", "0.00"]
    },
    {
        label: "3,456,925 at 8.5% for 30 years",
        P: 3456925, rate: 8.5, years: 30, n: 360,
        rows: { 1: ["26580.76", "2094.21", "24486.55", "3454830.79"], 180: ["26580.76", "7408.47", "19172.29", "2699268.27"], 360: ["26580.76", "26393.81", "186.96", "0.00"] },
        totals: ["9569074.48", "3456925.00", "6112149.48"]
    }
];

for (const c of CASES) {
    test(`schedule file for ${c.label} matches an independent calculation`, () => {
        const lines = parse(buildScheduleCsv(calculateAmortization(c.P, c.rate, c.years)));
        assert.deepEqual(lines[0], SCHEDULE_COLUMNS);
        assert.equal(lines.length, c.n + 2, "header, one row per payment, and a total row");
        for (const [number, expected] of Object.entries(c.rows)) {
            const row = lines[Number(number)];
            assert.equal(row[0], number, `payment number in row ${number}`);
            assert.equal(row[1], String(Math.ceil(Number(number) / 12)), `loan year of payment ${number}`);
            assert.deepEqual(row.slice(2), expected, `payment ${number}`);
        }
        const total = lines.at(-1);
        assert.equal(total[0], "Total");
        assert.deepEqual([total[2], total[3], total[4]], c.totals, "column totals");
        assert.equal(total[5], "", "no balance in the total row");
        assert.equal(lines.at(-2)[5], "0.00", "the last balance is zero");
    });
}

test("the principal column adds up to the loan and every balance falls to the next", () => {
    const rows = calculateAmortization(1000000, 8.5, 20);
    const lines = parse(buildScheduleCsv(rows)).slice(1, -1);
    let previous = 1000000;
    for (const line of lines) {
        const balance = Number(line[5]);
        assert.ok(balance <= previous + 0.005, `balance never rises (payment ${line[0]})`);
        assert.ok(Math.abs(Number(line[3]) + Number(line[4]) - Number(line[2])) <= 0.011, `principal + interest = EMI (payment ${line[0]})`);
        previous = balance;
    }
});

test("Home Loan: the schedule of the loan that fits has the EMI and totals the page shows", () => {
    const result = calculateHomeLoan({ income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20, own: 500000 });
    assert.ok(result.loan > 0);
    const lines = parse(buildScheduleCsv(calculateAmortization(result.loan, result.input.rate, result.input.years)));
    assert.equal(lines.length, 20 * 12 + 2);
    assert.ok(Math.abs(Number(lines[1][2]) - result.emi) <= 0.01, `EMI ${lines[1][2]} against the page's ${result.emi}`);
    assert.ok(Math.abs(Number(lines.at(-1)[3]) - result.loan) <= 0.01, "principal total is the loan");
    assert.ok(Math.abs(Number(lines.at(-1)[4]) - result.totalInterest) <= 0.5, `interest total ${lines.at(-1)[4]} against ${result.totalInterest}`);
});

test("nothing to export gives nothing: no rows, bad input, no room", () => {
    assert.equal(buildScheduleCsv([]), "");
    assert.equal(buildScheduleCsv(undefined), "");
    assert.equal(buildScheduleCsv(calculateAmortization(0, 8.5, 20)), "");
    assert.equal(buildScheduleCsv(calculateAmortization(100000, -1, 5)), "");
    assert.equal(buildScheduleCsv(calculateAmortization(NaN, 8.5, 5)), "");
});

test("file format: byte order mark, CRLF line ends, header first, a cell is quoted only when it has to be", () => {
    const csv = buildScheduleCsv(calculateAmortization(1200, 0, 1));
    assert.ok(csv.startsWith("﻿Payment,Loan year,EMI,Principal,Interest,Balance\r\n"));
    assert.ok(csv.endsWith("\r\n"));
    assert.ok(!/[^\r]\n/.test(csv), "every line break is CRLF");
    assert.equal(csvCell("plain"), "plain");
    assert.equal(csvCell("a,b"), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
});
