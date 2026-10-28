import test from "node:test";
import assert from "node:assert/strict";

import {
    XIRR_LIMITS,
    parseDate,
    parseAmount,
    parsePastedRows,
    validateFlows,
    solveXirr,
    xnpv,
    summarise,
    twoFlowRate,
    toFlow,
    relativeResidual
} from "../../assets/js/calculators/formulas/xirr.js";

/*
 * Expected values are from docs/ecosystem-review/calculators/formula-reference-check.py (Python decimal, 300-step
 * bisection, run with python -I), not from this engine.
 */

const flow = (iso, amount) => toFlow(iso, amount);
const solve = (rows) => {
    const check = validateFlows(rows);
    assert.ok(check.ok, JSON.stringify(check.errors));
    return solveXirr(check.values.flows);
};

test("the example flows give 14.394394% (reference value)", () => {
    const result = solve([
        flow("2023-01-01", -100000), flow("2023-07-01", -50000), flow("2024-03-31", 20000), flow("2025-01-01", 170000)
    ]);
    assert.equal(result.state, "ok");
    assert.ok(Math.abs(result.rate * 100 - 14.394394) < 1e-5, String(result.rate * 100));
    assert.ok(result.residual < 1e-12);
    assert.equal(result.roots.length, 1);
});

test("two flows over 1,827 days: 14.852405%, equal to the closed form 2^(365/1827) - 1", () => {
    const rows = [flow("2020-01-01", -100000), flow("2025-01-01", 200000)];
    const result = solve(rows);
    assert.ok(Math.abs(result.rate * 100 - 14.852405) < 1e-5);
    assert.ok(Math.abs(twoFlowRate(rows) - result.rate) < 1e-12);
    assert.ok(Math.abs(twoFlowRate(rows) - (Math.pow(2, 365 / 1827) - 1)) < 1e-12);
});

test("two flows: a loss, and money in before money out, both match the closed form", () => {
    const loss = [flow("2022-01-01", -1000), flow("2023-01-01", 500)];
    assert.ok(Math.abs(solve(loss).rate - -0.5) < 1e-12);
    const reversed = [flow("2022-01-01", 200), flow("2023-01-01", -100)];
    assert.ok(Math.abs(solve(reversed).rate - -0.5) < 1e-12);
    assert.ok(Math.abs(twoFlowRate(reversed) - -0.5) < 1e-12);
});

test("flows with two roots (10% and 20%): both are found and the one nearest zero is reported", () => {
    const result = solve([flow("2023-01-01", -1000), flow("2024-01-01", 2300), flow("2024-12-31", -1320)]);
    assert.equal(result.roots.length, 2);
    assert.ok(Math.abs(result.roots[0] - 0.1) < 1e-10);
    assert.ok(Math.abs(result.roots[1] - 0.2) < 1e-10);
    assert.ok(Math.abs(result.rate - 0.1) < 1e-10);
    assert.ok(Math.abs(xnpv(0.1, validateFlows([flow("2023-01-01", -1000), flow("2024-01-01", 2300), flow("2024-12-31", -1320)]).values.flows)) < 1e-9);
});

test("order does not matter: shuffled rows give the same rate", () => {
    const a = solve([flow("2023-01-01", -100000), flow("2023-07-01", -50000), flow("2024-03-31", 20000), flow("2025-01-01", 170000)]);
    const b = solve([flow("2025-01-01", 170000), flow("2023-07-01", -50000), flow("2024-03-31", 20000), flow("2023-01-01", -100000)]);
    assert.equal(a.rate, b.rate);
});

test("extremes stay finite: a 60-year span and a near-total loss", () => {
    const long = solve([flow("2030-01-01", -1000), flow("2090-01-01", 1000000)]);
    assert.ok(Math.abs(long.rate - (Math.pow(1000, 365 / (Date.UTC(2090, 0, 1) - Date.UTC(2030, 0, 1)) * 86400000) - 1)) < 1e-9);
    const loss = solve([flow("2023-01-01", -100000), flow("2024-01-01", 1)]);
    assert.ok(loss.rate < -0.99 && loss.rate > -1);
});

test("zero total return is a 0% rate", () => {
    const result = solve([flow("2023-01-01", -1000), flow("2024-01-01", 1000)]);
    assert.ok(Math.abs(result.rate) < 1e-12);
});

test("no rate in range: an inflow that is far too small", () => {
    const check = validateFlows([flow("2023-01-01", -1e12), flow("2024-01-01", 0.01)]);
    assert.equal(solveXirr(check.values.flows).state, "none");
});

test("summary: totals, net and the period", () => {
    const check = validateFlows([flow("2023-01-01", -100000), flow("2023-07-01", -50000), flow("2024-03-31", 20000), flow("2025-01-01", 170000)]);
    const s = summarise(check.values.flows);
    assert.equal(s.moneyOut, 150000);
    assert.equal(s.moneyIn, 190000);
    assert.equal(s.net, 40000);
    assert.equal(s.days, 731);
});

test("dates: the three accepted formats, real calendar days only, 1990 to 2100", () => {
    assert.equal(parseDate("2024-02-29").iso, "2024-02-29");
    assert.equal(parseDate("29/02/2024").iso, "2024-02-29");
    assert.equal(parseDate("5-3-2023").iso, "2023-03-05");
    for (const bad of ["2023-02-29", "31/04/2023", "2023/01/01", "01-13-2023x", "1989-12-31", "2101-01-01", "", "abc", "2023-1-1-1"]) {
        assert.equal(parseDate(bad), null, bad);
    }
    assert.equal(parseDate("2024-03-01").day - parseDate("2024-02-29").day, 1);
});

test("amounts: signs, brackets, rupee marks, Indian grouping, at most 2 decimals", () => {
    assert.equal(parseAmount("1,00,000"), 100000);
    assert.equal(parseAmount("-1,00,000.50"), -100000.5);
    assert.equal(parseAmount("(2500)"), -2500);
    assert.equal(parseAmount("₹ 1,500"), 1500);
    assert.equal(parseAmount("Rs. 99"), 99);
    assert.equal(parseAmount("+75"), 75);
    for (const bad of ["", "abc", "1.234", "1,00,00,0000,", "1e5", "--5", "5-", "12,34", "NaN", "Infinity"]) {
        assert.ok(Number.isNaN(parseAmount(bad)), bad);
    }
});

test("pasted rows: all formats, negative is out, a header line is skipped, errors name their line", () => {
    const ok = parsePastedRows("Date,Amount\n2023-01-01, -1,00,000\n01/07/2023\t(50,000)\n31-03-2024;20000\n\n2025-01-01 170000");
    assert.deepEqual(ok.errors, []);
    assert.deepEqual(ok.rows, [
        { iso: "2023-01-01", amount: -100000 },
        { iso: "2023-07-01", amount: -50000 },
        { iso: "2024-03-31", amount: 20000 },
        { iso: "2025-01-01", amount: 170000 }
    ]);
    const bad = parsePastedRows("2023-01-01 -100\nhello world 5\n2023-02-30 100\n2023-03-01 0");
    assert.deepEqual(bad.errors.map((e) => e.line), [2, 3, 4]);
});

test("validation: row count, both signs required, a real period", () => {
    assert.equal(validateFlows([flow("2023-01-01", -1)]).ok, false);
    assert.equal(validateFlows([flow("2023-01-01", -1), flow("2023-02-01", -1)]).ok, false);
    assert.equal(validateFlows([flow("2023-01-01", 1), flow("2023-02-01", 1)]).ok, false);
    assert.equal(validateFlows([flow("2023-01-01", -1), flow("2023-01-01", 2)]).ok, false);
    const many = Array.from({ length: XIRR_LIMITS.maxRows + 1 }, (_, i) => flow("2023-01-01", i % 2 ? 1 : -1));
    assert.equal(validateFlows(many).ok, false);
    assert.equal(validateFlows([flow("2023-01-01", -1), flow("2023-01-02", 2)]).ok, true);
});

test("100 flows solve quickly", () => {
    const rows = [];
    for (let i = 0; i < 99; i++) {
        rows.push(flow(`20${10 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-05`, -1000));
    }
    rows.push(flow("2022-12-31", 200000));
    const t0 = Date.now();
    const result = solve(rows);
    assert.equal(result.state, "ok");
    assert.ok(Date.now() - t0 < 1000);
});

test("stage 3: the residual stays finite when the plain NPV would overflow (long period, rate near -100%)", () => {
    const rows = [
        flow("1990-01-01", -1000), flow("1990-01-02", 1000.01),
        flow("2090-01-01", -100), flow("2090-01-01", 100.01)
    ];
    assert.ok(Number.isFinite(relativeResidual(-0.99998, validateFlows(rows).values.flows)));
    const result = solve(rows);
    if (result.state === "ok") assert.ok(Number.isFinite(result.residual), String(result.residual));
});
