import test from "node:test";
import assert from "node:assert/strict";

import {
    validateInflation,
    realValue,
    realReturnPercent
} from "../../assets/js/calculators/formulas/inflation.js";
import { calculateSip } from "../../assets/js/calculators/formulas/sip.js";

/* expected values come from docs/ecosystem-review/calculators/formula-reference-check.py (run with python -I) */

test("1,00,00,000 in 20 years at 6% is 31,18,047.27 in today's money", () => {
    assert.ok(Math.abs(realValue(10000000, 6, 20) - 3118047.27) < 0.01);
});

test("1,00,000 in year 20 at 6% is 33,051.30 (19 years of price rise)", () => {
    assert.ok(Math.abs(realValue(100000, 6, 19) - 33051.30) < 0.01);
});

test("12% a year return with 6% inflation is 5.6604% after inflation", () => {
    assert.ok(Math.abs(realReturnPercent(12, 6) - 5.6604) < 0.0001);
});

test("zero years leaves the amount unchanged; fractional years are allowed", () => {
    assert.equal(realValue(500, 7, 0), 500);
    assert.ok(Math.abs(realValue(1000, 10, 0.5) - 1000 / Math.sqrt(1.1)) < 1e-9);
});

test("validation: blank and 0 switch the view off; 0 to 30 with 2 decimals is accepted", () => {
    assert.deepEqual(validateInflation(""), { ok: true, value: null });
    assert.deepEqual(validateInflation("  "), { ok: true, value: null });
    assert.deepEqual(validateInflation("0"), { ok: true, value: null });
    assert.deepEqual(validateInflation("6"), { ok: true, value: 6 });
    assert.deepEqual(validateInflation("5.25"), { ok: true, value: 5.25 });
    assert.deepEqual(validateInflation("30"), { ok: true, value: 30 });
});

test("validation: rejects negatives, over 30, 3 decimals, text and exponents", () => {
    for (const bad of ["-1", "30.01", "31", "5.255", "abc", "1e1", "5,5", "."]) {
        assert.equal(validateInflation(bad).ok, false, bad);
    }
});

test("the view does not change the SIP engine: same inputs, same figures", () => {
    const a = calculateSip({ monthlySip: 10000, annualReturn: 10, months: 180 });
    const b = calculateSip({ monthlySip: 10000, annualReturn: 10, months: 180 });
    assert.equal(a.plan.estimatedValue, b.plan.estimatedValue);
    /* restated in today's money it is smaller, and never larger */
    assert.ok(realValue(a.plan.estimatedValue, 6, 15) < a.plan.estimatedValue);
});
