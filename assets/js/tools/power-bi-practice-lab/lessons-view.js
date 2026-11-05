/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: the lessons on the page, and running an example

   lessonsMarkup(...) builds the lessons when the site is built; every text is escaped. runExample(...) runs an example, or one the
   learner edited, with the lab's own engines and returns plain text. No DOM here.
========================================================= */

import { escapeHTML as esc } from "../../ui/escape.js";
import { runScript, cellText } from "./pq/engine.js";
import { checkRelationships, ModelError } from "./model.js";
import { evaluateMeasure, formatValue } from "./dax/engine.js";
import { SAKHI } from "./datasets.js";

const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const SHOWN = 6;

/** Plain text rows of a table, for the result area. */
export function tableLines(table) {
    return [table.columns.join(" | "), ...table.rows.slice(0, 12).map((r) => r.map((c) => (c === null ? "null" : cellText(c).replace(/^"|"$/g, ""))).join(" | ")), ...(table.rows.length > 12 ? [`(${table.rows.length - 12} more rows)`] : [])];
}

/** @returns {{ ok: boolean, lines: string[], note?: string }} */
export function runExample(example, text) {

    if (example.kind === "query") {
        const done = runScript(example.input.table, text, example.tables ?? {});
        if (done.error) return { ok: false, lines: [], note: `${done.error.line ? `Line ${done.error.line}: ` : ""}${done.error.message}` };
        return { ok: true, lines: tableLines(done.table) };
    }

    if (example.kind === "model") {
        try {
            const r = checkRelationships(example.tables, text);
            return { ok: true, lines: r.relationships.map((x) => `${x.from} -> ${x.to}${x.active ? "" : " (inactive)"}`), note: r.notes.join(" ") || undefined };
        } catch (e) {
            if (e instanceof ModelError) return { ok: false, lines: [], note: `${e.line ? `Line ${e.line}: ` : ""}${e.message}` };
            throw e;
        }
    }

    const r = evaluateMeasure(SAKHI, text, { target: example.target ?? null, helpers: example.helpers ?? {}, context: example.context ?? [] });
    if (r.error) return { ok: false, lines: [], note: r.error };
    return { ok: true, lines: [`${example.contextLabel ? `${example.contextLabel}: ` : "All data: "}${formatValue(r.value)}`] };

}

function tableHtml(table, caption) {
    const rows = table.rows.slice(0, SHOWN);
    return `
        <div class="lx-table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}">
            <table class="lx-table">
                <caption class="lx-sr-only">${esc(caption)}</caption>
                <thead><tr>${table.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
                <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c === null ? "" : String(c))}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
            ${table.rows.length > SHOWN ? `<p class="lx-note">${table.rows.length - SHOWN} more rows are not shown.</p>` : ""}
        </div>`;
}

function exampleInput(e, tag) {
    if (e.kind === "query") return tableHtml(e.input.table, `Table ${e.input.name} for ${tag}`);
    if (e.kind === "model") return Object.entries(e.tables).map(([name, t]) => tableHtml(t, `Table ${name} for ${tag}`)).join("");
    return `<p class="lx-note">Runs on the Sakhi Stores sample model (Orders, Products, Customers, Date).${e.contextLabel ? ` Filter context: ${esc(e.contextLabel)}.` : ""}</p>`;
}

export function lessonsMarkup(lessons, exercises) {

    const titleOf = new Map(exercises.map((x) => [x.id, x.title]));

    return `
        <section class="calculator-info" id="pb-lessons">

            <h2>Lessons</h2>

            <p>
                Read a lesson, change the steps, relationships or measure in its examples and press Run, then try the exercises it lists.
                The first lessons are enough to begin. Everything is calculated in your browser by this lab's own simulation, not by Power BI.
            </p>

            <div class="lx-lessons">
                ${lessons.map((l, li) => `
                <details class="lx-lesson" id="lx-lesson-${li + 1}">
                    <summary>${li + 1}. ${esc(l.title)}<span class="lx-lesson__level">${esc(LEVELS[l.level] ?? l.level)}</span></summary>
                    <div class="lx-lesson__body">
                        <p>${esc(l.intro)}</p>
                        <ul>${l.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
                        ${l.examples.map((e, ei) => {
        const r = runExample(e, e.script);
        const label = e.kind === "query" ? "Query steps" : e.kind === "model" ? "Relationships" : "Measure";
        return `
                        <div class="lx-example" data-example="${li}.${ei}">
                            <p><strong>Example.</strong> ${esc(e.says)}</p>
                            ${exampleInput(e, `example ${li + 1}.${ei + 1}`)}
                            <label class="lx-label" for="pb-ex-${li}-${ei}">${label}</label>
                            <textarea id="pb-ex-${li}-${ei}" class="lx-textarea" rows="${Math.min(6, e.script.split("\n").length + 1)}" spellcheck="false" autocomplete="off" autocapitalize="off" data-pb-script>${esc(e.script)}</textarea>
                            <p><button type="button" class="lx-btn" data-pb-run>Run</button></p>
                            <div class="lx-live-result" data-pb-out data-label="example ${li + 1}.${ei + 1}" role="status" aria-live="polite">${resultHtml(r, `example ${li + 1}.${ei + 1}`)}</div>
                        </div>`;
    }).join("")}
                        ${l.mistakes.length ? `<div><h3>Common mistakes</h3><ul>${l.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div>` : ""}
                        ${l.practise.length ? `<p class="lx-practise"><strong>Practise:</strong> ${l.practise.map((id) => `<button type="button" class="lx-practise__btn" data-lx-exercise="${esc(id)}">${esc(titleOf.get(id) ?? id)}</button>`).join(" ")}</p>` : ""}
                    </div>
                </details>`).join("")}
            </div>

        </section>`;

}

export function resultHtml(r, label = "example") {
    if (!r.ok) return `<p class="lx-note"><strong>Result. </strong>${esc(r.note ?? "")}</p>`;
    return `<p class="lx-note"><strong>Result. </strong></p><pre class="lx-code" tabindex="0" role="region" aria-label="Result of ${esc(label)}"><code>${esc(r.lines.join("\n"))}</code></pre>${r.note ? `<p class="lx-note">${esc(r.note)}</p>` : ""}`;
}
