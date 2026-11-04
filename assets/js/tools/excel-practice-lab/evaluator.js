/* =========================================================
   ToolZen Hub
   Excel Practice Lab: the evaluator

   evaluate(exercise, formula) is pure. The learner's formula is put in the exercise's answer cell and calculated on the sheet,
   then copied down and right as the exercise says (like dragging the fill handle), then calculated again on a second set of
   numbers. It is accepted only when every value is right on both, so a typed-in answer cannot pass. The feedback shows what the
   learner's formula gave; it does not show the expected value.
========================================================= */

import { parseFormula, FormulaSyntaxError, shiftFormula, parseAddress, addressOf } from "./formula/parser.js";
import { createSheet, isErr, display, ERROR_HELP } from "./formula/engine.js";

export const MAX_RESPONSE_CHARS = 500;

/** The cells filled from the answer cell: [{ addr, dRow, dCol }] in row-major order. */
export function fillCells(sheet) {
    const a = parseAddress(sheet.answer);
    const out = [];
    for (let r = 0; r <= sheet.fill.down; r += 1) {
        for (let c = 0; c <= sheet.fill.right; c += 1) out.push({ addr: addressOf(a.col + c, a.row + r), dRow: r, dCol: c });
    }
    return out;
}

function sameValue(got, want) {
    if (isErr(got)) return false;
    if (typeof want === "number") return typeof got === "number" && Math.abs(got - want) <= 1e-9 * Math.max(1, Math.abs(want));
    if (typeof want === "string") return typeof got === "string" && got === want;
    return got === want;
}

/** Calculate `formula` on a set of cell values. Returns the list of values of the filled cells. */
export function calculate(exercise, formula, overrides = {}) {
    const sheet = createSheet({ ...exercise.sheet.cells, ...overrides });
    const cells = fillCells(exercise.sheet);
    for (const f of cells) sheet.set(f.addr, shiftFormula(formula, f.dRow, f.dCol));
    return cells.map((f) => sheet.value(f.addr));
}

export function evaluate(exercise, formula) {

    const text = formula.trim();

    if (!text.startsWith("=")) {
        return { verdict: "cannot-check", summary: "A formula starts with an equals sign (=). Type = and then your formula, for example =A1+B1." };
    }

    try {
        parseFormula(text);
    } catch (e) {
        if (e instanceof FormulaSyntaxError) return { verdict: "cannot-check", summary: "Excel could not read this formula.", findings: [e.message] };
        throw e;
    }

    const first = calculate(exercise, text);
    const second = calculate(exercise, text, exercise.variants[0].cells);
    const cells = fillCells(exercise.sheet);

    const firstOk = first.every((v, i) => sameValue(v, exercise.expected[i]));
    const secondOk = second.every((v, i) => sameValue(v, exercise.variants[0].expected[i]));

    if (firstOk && secondOk) {
        return { verdict: "correct", summary: "Correct. Your formula gives the right result on this sheet and on a second set of numbers.", lines: shown(first, cells) };
    }

    const bad = first.findIndex((v) => isErr(v));
    if (bad >= 0) {
        const code = first[bad].code;
        return {
            verdict: "not-yet",
            summary: `Your formula gives ${code}${cells.length > 1 ? ` in ${cells[bad].addr}` : ""}.`,
            findings: [ERROR_HELP[code] ?? "", first[bad].note, cells.length > 1 ? "The formula is copied down and across as in Excel. A reference that moved onto a label or an empty cell is a common cause: pin the parts that must stay with $." : ""].filter(Boolean),
            lines: shown(first, cells)
        };
    }

    if (firstOk && !secondOk) {
        return {
            verdict: "not-yet",
            summary: "Your formula is right for these numbers, but not when the numbers change.",
            findings: ["The lab tries your formula on a second set of numbers. A formula that types a number instead of pointing to the cell, or that uses a reference that does not follow the data, passes the first sheet and fails this test.", "Refer to the cells that hold the inputs instead of typing their values."],
            lines: shown(first, cells)
        };
    }

    const findings = [];
    if (cells.length > 1) findings.push("The formula is copied down and across as in Excel, so check which parts of it should stay fixed with $ and which should move.");
    return {
        verdict: "not-yet",
        summary: cells.length > 1 ? "The formula does not give the right value in every filled cell." : "The result is not the one this exercise asks for.",
        findings,
        lines: shown(first, cells)
    };

}

const shown = (values, cells) => values.map((v, i) => `${cells[i].addr}: ${display(v)}`);
