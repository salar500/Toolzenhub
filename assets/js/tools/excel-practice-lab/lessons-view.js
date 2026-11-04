/* =========================================================
   ToolZen Hub
   Excel Practice Lab: the lessons on the page, and running an example

   lessonsMarkup(...) builds the lessons when the site is built; every text is escaped. runExample(...) calculates an example's
   formula, or one the learner edited, on the example's cells with the lab's engine, and returns plain text. No DOM here.
========================================================= */

import { escapeHTML as esc } from "../../ui/escape.js";
import { parseFormula, FormulaSyntaxError, shiftFormula, parseAddress, addressOf } from "./formula/parser.js";
import { createSheet, display, isErr, ERROR_HELP } from "./formula/engine.js";
import { gridModel, gridHtml } from "./sheet-view.js";

const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

function filled(example) {
    const a = parseAddress(example.at);
    const fill = example.fill ?? { down: 0, right: 0 };
    const out = [];
    for (let r = 0; r <= fill.down; r += 1) for (let c = 0; c <= fill.right; c += 1) out.push({ addr: addressOf(a.col + c, a.row + r), dRow: r, dCol: c });
    return out;
}

/** @returns {{ ok: boolean, lines: string[], note?: string }} lines are "B4: 54" for each filled cell. */
export function runExample(example, formula) {

    const text = formula.trim();

    if (!text.startsWith("=")) return { ok: false, lines: [], note: "A formula starts with an equals sign (=)." };

    try {
        parseFormula(text);
    } catch (e) {
        if (e instanceof FormulaSyntaxError) return { ok: false, lines: [], note: e.message };
        throw e;
    }

    const sheet = createSheet(example.cells);
    const cells = filled(example);
    for (const f of cells) sheet.set(f.addr, shiftFormula(text, f.dRow, f.dCol));

    const values = cells.map((f) => sheet.value(f.addr));
    const bad = values.find(isErr);

    return {
        ok: !bad,
        lines: cells.map((f, i) => `${f.addr}: ${display(values[i])}`),
        note: bad ? [ERROR_HELP[bad.code], bad.note].filter(Boolean).join(" ") : undefined
    };

}

export function lessonsMarkup(lessons, exercises) {

    const titleOf = new Map(exercises.map((e, i) => [e.id, `Exercise ${i + 1}: ${e.title}`]));

    return `
        <section class="calculator-info" id="xl-lessons">

            <h2>Lessons</h2>

            <p>
                Read a lesson, change the formula in its examples and press Calculate, then try the exercises it lists. The first three
                lessons are enough to begin. Everything is calculated in your browser by this lab's own spreadsheet simulation, not by Microsoft Excel.
            </p>

            <div class="lx-lessons">
                ${lessons.map((l, li) => `
                <details class="lx-lesson">
                    <summary>${li + 1}. ${esc(l.title)}<span class="lx-lesson__level">${esc(LEVELS[l.level] ?? l.level)}</span></summary>
                    <div class="lx-lesson__body">
                        <p>${esc(l.intro)}</p>
                        <ul>${l.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
                        ${l.examples.map((e, ei) => {
        const result = runExample(e, e.formula);
        const model = gridModel(e.cells, { marks: filled(e).map((f) => f.addr), shownAt: {} });
        return `
                        <div class="lx-example" data-example="${li}.${ei}">
                            <p><strong>Example.</strong> ${esc(e.says)}</p>
                            ${gridHtml(model, `Sheet for example ${li + 1}.${ei + 1}`)}
                            <label class="lx-label" for="xl-ex-${li}-${ei}">Formula in ${esc(e.at)}</label>
                            <input id="xl-ex-${li}-${ei}" class="lx-input" type="text" value="${esc(e.formula)}" spellcheck="false" autocomplete="off" autocapitalize="off" maxlength="500" data-xl-formula>
                            <p><button type="button" class="lx-btn" data-xl-run>Calculate</button></p>
                            <div class="lx-live-result" data-xl-out data-label="example ${li + 1}.${ei + 1}" role="status" aria-live="polite"><p class="lx-note"><strong>Result.</strong> ${esc(result.lines.join("; "))}${result.note ? ` ${esc(result.note)}` : ""}</p></div>
                        </div>`;
    }).join("")}
                        ${l.mistakes.length ? `<div><h3>Common mistakes</h3><ul>${l.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div>` : ""}
                        ${l.practise.length ? `<p><strong>Practise:</strong> ${l.practise.map((id) => esc(titleOf.get(id) ?? id)).join("; ")}.</p>` : ""}
                    </div>
                </details>`).join("")}
            </div>

        </section>`;

}
