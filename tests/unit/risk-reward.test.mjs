/*
 * Risk-Reward and Position Size: pure-module tests (tool pack 51, tier HIGH).
 * Hand-computed constants plus an independent oracle that uses plain integer
 * arithmetic on prices scaled by 10^6 (a different method from the fractions
 * in the engine). Agreement shows consistent arithmetic, not trading advice.
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
    solveRiskReward,
    groupedText,
    LIMITS
} from "../../assets/js/calculators/formulas/risk-reward.js";

const ok = (input) => {
    const r = solveRiskReward(input);
    assert.equal(r.state, "ok", JSON.stringify(r));
    return r.result;
};

/* ---------- hand-computed vectors ---------- */

test("long 100 / 95 / 115, account 1,00,000 at 1%", () => {
    const r = ok({ side: "long", entry: "100", stop: "95", target: "115", account: "100000", riskPercent: "1" });
    assert.equal(r.riskPerUnit, "5.00");
    assert.equal(r.rewardPerUnit, "15.00");
    assert.equal(r.ratio, "3.00");
    assert.equal(r.breakEvenWinRate, "25.00");
    assert.equal(r.riskPercentOfEntry, "5.00");
    assert.equal(r.rewardPercentOfEntry, "15.00");
    assert.equal(r.sizing.riskAmount, "1000.00");
    assert.equal(r.sizing.quantity, "200");
    assert.equal(r.sizing.positionValue, "20000.00");
    assert.equal(r.sizing.positionPercentOfAccount, "20.00");
    assert.equal(r.sizing.lossAtStop, "1000.00");
    assert.equal(r.sizing.gainAtTarget, "3000.00");
    assert.equal(r.sizing.exceedsAccount, false);
    assert.equal(r.sizing.belowOneUnit, false);
});

test("short 100 / 105 / 85 mirrors the long case", () => {
    const a = ok({ side: "long", entry: "100", stop: "95", target: "115", account: "100000", riskPercent: "1" });
    const b = ok({ side: "short", entry: "100", stop: "105", target: "85", account: "100000", riskPercent: "1" });
    assert.deepEqual({ ...b, side: "long" }, a);
});

test("quantity is floored, never rounded up", () => {
    // risk amount 1000, risk per unit 7 -> 142.857... -> 142
    const r = ok({ side: "long", entry: "100", stop: "93", target: "121", account: "100000", riskPercent: "1" });
    assert.equal(r.sizing.quantity, "142");
    assert.equal(r.sizing.lossAtStop, "994.00");
    assert.equal(r.sizing.gainAtTarget, "2982.00");
    assert.equal(r.ratio, "3.00");
});

test("ratio and break-even rounding: 1 : 1.5 and 3 : 7", () => {
    const r = ok({ side: "long", entry: "200", stop: "190", target: "215" });
    assert.equal(r.ratio, "1.50");
    assert.equal(r.breakEvenWinRate, "40.00");
    assert.equal(r.sizing, null);
    const s = ok({ side: "long", entry: "10", stop: "7", target: "17" });
    assert.equal(s.ratio, "2.33");
    assert.equal(s.breakEvenWinRate, "30.00");
});

test("below one unit: risk amount smaller than the risk on one unit", () => {
    const r = ok({ side: "long", entry: "5000", stop: "4000", target: "7000", account: "10000", riskPercent: "1" });
    assert.equal(r.sizing.riskAmount, "100.00");
    assert.equal(r.sizing.quantity, "0");
    assert.equal(r.sizing.belowOneUnit, true);
    assert.equal(r.sizing.positionValue, "0.00");
});

test("position value above the account is reported, not capped", () => {
    const r = ok({ side: "long", entry: "1000", stop: "995", target: "1010", account: "100000", riskPercent: "2" });
    assert.equal(r.sizing.quantity, "400");
    assert.equal(r.sizing.positionValue, "400000.00");
    assert.equal(r.sizing.exceedsAccount, true);
});

test("decimals and thousand separators are accepted", () => {
    const r = ok({ side: "long", entry: "1,250.50", stop: "1,240.25", target: "1,281.25", account: "2,50,000", riskPercent: "0.5" });
    assert.equal(r.riskPerUnit, "10.25");
    assert.equal(r.rewardPerUnit, "30.75");
    assert.equal(r.ratio, "3.00");
    assert.equal(r.sizing.riskAmount, "1250.00");
    assert.equal(r.sizing.quantity, "121"); // 1250 / 10.25 = 121.95...
});

/* ---------- states and validation ---------- */

test("incomplete entry gives no figure", () => {
    const r = solveRiskReward({ side: "long", entry: "100", stop: "", target: "" });
    assert.equal(r.state, "incomplete");
    assert.deepEqual(r.missing, ["stop", "target"]);
    assert.equal(r.result, undefined);
});

test("wrong order is rejected for both sides with a fix", () => {
    let r = solveRiskReward({ side: "long", entry: "100", stop: "105", target: "90" });
    assert.equal(r.state, "invalid");
    assert.match(r.errors.stop, /below the entry/);
    assert.match(r.errors.target, /above the entry/);
    r = solveRiskReward({ side: "short", entry: "100", stop: "95", target: "110" });
    assert.match(r.errors.stop, /above the entry/);
    assert.match(r.errors.target, /below the entry/);
});

test("equal prices are invalid", () => {
    assert.equal(solveRiskReward({ side: "long", entry: "100", stop: "100", target: "110" }).state, "invalid");
    assert.equal(solveRiskReward({ side: "long", entry: "100", stop: "95", target: "100" }).state, "invalid");
});

test("zero, negative, text and over-limit values are rejected", () => {
    for (const bad of ["0", "-5", "abc", "1e5", "10.1234567", "1000000001"]) {
        const r = solveRiskReward({ side: "long", entry: bad, stop: "1", target: "3" });
        assert.equal(r.state, "invalid", bad);
        assert.ok(r.errors.entry, bad);
    }
    assert.equal(LIMITS.maxPrice, 1_000_000_000n);
});

test("account and risk percent come together; limits", () => {
    let r = solveRiskReward({ side: "long", entry: "100", stop: "95", target: "110", account: "1000" });
    assert.ok(r.errors.riskPercent);
    r = solveRiskReward({ side: "long", entry: "100", stop: "95", target: "110", riskPercent: "1" });
    assert.ok(r.errors.account);
    for (const pct of ["0", "100.01", "-1", "x"]) {
        r = solveRiskReward({ side: "long", entry: "100", stop: "95", target: "110", account: "1000", riskPercent: pct });
        assert.equal(r.state, "invalid", pct);
    }
    r = solveRiskReward({ side: "long", entry: "100", stop: "95", target: "110", account: "1000", riskPercent: "100" });
    assert.equal(r.state, "ok");
    assert.equal(r.result.sizing.quantity, "200");
});

test("unknown side is invalid; inputs are not mutated", () => {
    assert.equal(solveRiskReward({ side: "sideways", entry: "1", stop: "1", target: "1" }).state, "invalid");
    const input = Object.freeze({ side: "long", entry: "100", stop: "95", target: "110" });
    assert.doesNotThrow(() => solveRiskReward(input));
    assert.doesNotThrow(() => solveRiskReward(undefined));
});

test("Indian digit grouping", () => {
    assert.equal(groupedText("1234567.50"), "12,34,567.50");
    assert.equal(groupedText("999.00"), "999.00");
    assert.equal(groupedText("-100000.00"), "-1,00,000.00");
    assert.equal(groupedText("400"), "400");
});

/* ---------- independent oracle (scaled integers, no fractions) ---------- */

const S = 1_000_000n;
const scaled = (text) => {
    const [w, f = ""] = text.split(".");
    return BigInt(w) * S + BigInt(f.padEnd(6, "0"));
};
const fmt2 = (numer, denom) => {            // round half up to 2 places
    const x = (numer * 100n * 2n + denom) / (denom * 2n);
    return `${x / 100n}.${(x % 100n).toString().padStart(2, "0")}`;
};

function oracle({ side, entry, stop, target, account, pct }) {
    const e = scaled(entry), s = scaled(stop), t = scaled(target);
    const risk = side === "long" ? e - s : s - e;
    const reward = side === "long" ? t - e : e - t;
    const out = {
        riskPerUnit: fmt2(risk, S),
        rewardPerUnit: fmt2(reward, S),
        ratio: fmt2(reward, risk),
        breakEvenWinRate: fmt2(risk * 100n, risk + reward)
    };
    if (account) {
        // risk amount = account * pct / 100 ; pct has up to 2 decimals here -> scale 100
        const acc = BigInt(account);
        const pc = BigInt(Math.round(pct * 100));          // hundredths of a percent
        // quantity = floor( acc * pc / 10000 / (risk / S) ) = floor( acc * pc * S / (10000 * risk) )
        const qty = (acc * pc * S) / (10000n * risk);
        out.quantity = qty.toString();
        out.lossAtStop = fmt2(qty * risk, S);
        out.gainAtTarget = fmt2(qty * reward, S);
        out.positionValue = fmt2(qty * e, S);
    }
    return out;
}

test("oracle agrees on 2,000 deterministic random vectors (both sides)", () => {
    let seed = 20261101;
    let checked = 0;
    const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
    for (let i = 0; i < 2000; i++) {
        const side = rnd(2) ? "long" : "short";
        const entryUnits = 50 + rnd(5000);                  // 0.50 .. 50.49 in cents scale below
        const entry = (entryUnits / 100 * 10).toFixed(2);   // 5.00 .. 504.90
        const eC = Math.round(parseFloat(entry) * 100);
        const dRisk = 1 + rnd(Math.max(1, eC - 1) % 4000 + 1);
        const dReward = 1 + rnd(8000);
        const toText = (c) => (c / 100).toFixed(2);
        let stopC, targetC;
        if (side === "long") { stopC = eC - Math.min(dRisk, eC - 1); targetC = eC + dReward; }
        else { stopC = eC + dRisk; targetC = eC - Math.min(dReward, eC - 1); }
        if (stopC <= 0 || targetC <= 0) continue;
        const account = String(10000 + rnd(5_000_000));
        const pct = (1 + rnd(500)) / 100;                    // 0.01 .. 5.00
        const input = { side, entry, stop: toText(stopC), target: toText(targetC), account, riskPercent: pct.toFixed(2) };
        const r = solveRiskReward(input);
        assert.equal(r.state, "ok", JSON.stringify(input) + JSON.stringify(r));
        const o = oracle({ side, entry, stop: input.stop, target: input.target, account, pct });
        assert.equal(r.result.riskPerUnit, o.riskPerUnit, JSON.stringify(input));
        assert.equal(r.result.rewardPerUnit, o.rewardPerUnit, JSON.stringify(input));
        assert.equal(r.result.ratio, o.ratio, JSON.stringify(input));
        assert.equal(r.result.breakEvenWinRate, o.breakEvenWinRate, JSON.stringify(input));
        assert.equal(r.result.sizing.quantity, o.quantity, JSON.stringify(input));
        assert.equal(r.result.sizing.lossAtStop, o.lossAtStop, JSON.stringify(input));
        assert.equal(r.result.sizing.gainAtTarget, o.gainAtTarget, JSON.stringify(input));
        assert.equal(r.result.sizing.positionValue, o.positionValue, JSON.stringify(input));
        checked++;
    }
    assert.ok(checked > 1500, `only ${checked} vectors compared`);
});

test("property: ratio is monotonic in target; mirrored side gives equal output", () => {
    let prev = -1;
    for (let t = 101; t <= 140; t++) {
        const r = ok({ side: "long", entry: "100", stop: "95", target: String(t) });
        const v = parseFloat(r.ratio);
        assert.ok(v >= prev);
        prev = v;
    }
    const a = ok({ side: "long", entry: "250", stop: "240", target: "280", account: "500000", riskPercent: "0.75" });
    const b = ok({ side: "short", entry: "250", stop: "260", target: "220", account: "500000", riskPercent: "0.75" });
    assert.deepEqual({ ...b, side: "long" }, a);
});
