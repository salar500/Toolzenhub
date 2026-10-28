/* =========================================================
   ToolZen Hub
   Test Design Lab: the evaluator (pure)

   evaluate(exercise, value) -> { verdict, summary, findings? }

   Two kinds of exercise, both about whole numbers only. Nothing is
   keyed by hand: the required answer is worked out from the
   declarative rule in the exercise data.

   Boundary values (mode "bva")
     The rule describes the VALID whole numbers: a minimum and a
     maximum, each inclusive or exclusive, either may be absent. The
     first and last valid whole numbers are found from that. Per
     boundary the exercise asks for two values (the edge of the valid
     range and the nearest value outside it) or three values (the
     value outside, the edge, and the value just inside).
     Correct means every required value is present. Extra values are
     listed and are neither wrong nor needed. Missing values are named
     by their role, not by number.

   Equivalence partitions (mode "ep")
     The partitions are consecutive whole-number intervals covering
     every whole number once. Each sample value must be placed in the
     partition that contains it. Feedback is one line per value, in
     words.

   Not assessed: text, dates, decimals and combinations of fields.
   No eval, no regex built from the answer, no HTML.
========================================================= */

export const MAX_RESPONSE_CHARS = 2000;
export const MAX_VALUES = 30;
export const MAX_ABS = 1_000_000_000;

/* a whole number written plainly: no plus sign, no leading zeros (so "1,000" is not quietly read as 1 and 0) */
const WHOLE = /^-?(0|[1-9]\d*)$/;

/** Split an answer into whole numbers. Returns { values (unique, in order), bad (tokens that are not usable), tooMany }. */
export function parseWholeNumbers(text) {

    const tokens = String(text).split(/[\s,]+/).filter((t) => t !== "");
    const values = [];
    const bad = [];

    if (tokens.length > MAX_VALUES) return { values, bad, tooMany: true };

    for (const token of tokens) {
        if (!WHOLE.test(token) || Math.abs(Number(token)) > MAX_ABS) { bad.push(token.length > 24 ? `${token.slice(0, 24)}...` : token); continue; }
        const n = Number(token) + 0; // + 0 turns -0 into 0
        if (!values.includes(n)) values.push(n);
    }

    return { values, bad, tooMany: false };

}

/** The first and last valid whole numbers (null = no limit on that side) from a rule. */
export function validEnds(rule) {

    const lowest = rule.min === null ? null : (rule.minInclusive ? rule.min : rule.min + 1);
    const highest = rule.max === null ? null : (rule.maxInclusive ? rule.max : rule.max - 1);

    return { lowest, highest };

}

/** Map of required value -> roles it plays. */
export function requiredValues(rule, perBoundary) {

    const { lowest, highest } = validEnds(rule);
    const need = new Map();
    const add = (value, role) => need.set(value, [...(need.get(value) ?? []), role]);

    if (lowest !== null) {
        add(lowest - 1, "the value just below the valid range");
        add(lowest, "the lowest valid value");
        if (perBoundary === 3) add(lowest + 1, "the value just above the lowest valid value");
    }

    if (highest !== null) {
        if (perBoundary === 3) add(highest - 1, "the value just below the highest valid value");
        add(highest, "the highest valid value");
        add(highest + 1, "the value just above the valid range");
    }

    return need;

}

function evaluateBoundary(exercise, text) {

    const parsed = parseWholeNumbers(text);

    if (parsed.tooMany) {
        return { verdict: "cannot-check", summary: `That is more than ${MAX_VALUES} values. Boundary values need only a few. Shorten the list and check again.` };
    }

    if (parsed.bad.length > 0) {
        const shown = parsed.bad.slice(0, 3).map((t) => `"${t}"`).join(", ");
        return {
            verdict: "cannot-check",
            summary: `${shown}${parsed.bad.length > 3 ? " and others are" : (parsed.bad.length === 1 ? " is" : " are")} not usable. Enter plain whole numbers (no leading zeros) up to ${MAX_ABS.toLocaleString("en-US")} in size, separated by commas, spaces or line breaks.`
        };
    }

    if (parsed.values.length === 0) {
        return { verdict: "cannot-check", summary: "There is nothing to check yet. Type your test values first." };
    }

    const need = requiredValues(exercise.rule, exercise.perBoundary);
    const given = new Set(parsed.values);
    const missing = [...need].filter(([value]) => !given.has(value));
    const extra = parsed.values.filter((v) => !need.has(v));
    const findings = [];

    if (extra.length > 0) findings.push(`Extra values (neither wrong nor needed): ${extra.join(", ")}.`);

    if (missing.length === 0) {
        return {
            verdict: "correct",
            summary: `Every required boundary value is present (${need.size} of ${need.size}).`,
            findings
        };
    }

    findings.unshift(`Required boundary values present: ${need.size - missing.length} of ${need.size}.`);
    findings.push(`Still missing: ${missing.map(([, roles]) => roles.join(" and ")).join("; ")}.`);

    return {
        verdict: "not-yet",
        summary: "Some required boundary values are missing.",
        findings
    };

}

/** Which partition holds a whole number. */
export function partitionOf(partitions, x) {
    return partitions.find((p) => (p.min === null || x >= p.min) && (p.max === null || x <= p.max));
}

function evaluatePartitions(exercise, text) {

    let choices;

    try {
        choices = JSON.parse(text);
    } catch {
        choices = null;
    }

    const ids = new Set(exercise.partitions.map((p) => p.id));

    if (!Array.isArray(choices) || choices.length !== exercise.samples.length || !choices.every((c) => typeof c === "string" && (c === "" || ids.has(c)))) {
        return { verdict: "cannot-check", summary: "Choose a partition for every value before checking." };
    }

    if (choices.some((c) => c === "")) {
        return { verdict: "cannot-check", summary: "Choose a partition for every value before checking." };
    }

    const right = exercise.samples.map((x, i) => partitionOf(exercise.partitions, x)?.id === choices[i]);
    const count = right.filter(Boolean).length;
    const lines = exercise.samples.map((x, i) => `${x}: ${right[i] ? "Correct" : "Not yet"}`);

    if (count === exercise.samples.length) {
        return { verdict: "correct", summary: `All ${count} values are in the right partition.`, findings: lines };
    }

    return {
        verdict: "not-yet",
        summary: `${count} of ${exercise.samples.length} values are in the right partition.`,
        findings: lines
    };

}

export function evaluate(exercise, value) {

    if (exercise.mode === "bva") return evaluateBoundary(exercise, value);
    if (exercise.mode === "ep") return evaluatePartitions(exercise, value);

    throw new Error("unknown exercise mode");

}
