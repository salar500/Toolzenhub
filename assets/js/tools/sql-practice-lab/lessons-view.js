/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the lessons on the page, and running an example

   lessonsMarkup(...) builds the lessons at build time (every text is escaped here; the lesson data is written in this repository).
   showResult(...) draws a query result into a container with DOM methods only, so nothing a query returns is ever parsed as HTML.
   Imports nothing from the DOM, so the site build can load it.
========================================================= */

import { escapeHTML as esc } from "../../ui/escape.js";

const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const CELL = (v) => (v === null ? "NULL" : String(v));

function staticResult(example, label) {

    if (example.error) {
        return `<p class="lx-note"><strong>Result:</strong> SQLite reports an error: ${esc(example.error)}</p>`;
    }

    if (example.columns.length === 0) return "";

    const more = example.total > example.rows.length ? `<p class="lx-note">${example.total} rows in all; the first ${example.rows.length} are shown.</p>` : "";

    return `
        <div class="lx-table-wrap" tabindex="0" role="region" aria-label="Result of example ${label}">
            <table class="lx-table">
                <thead><tr>${example.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
                <tbody>${example.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(CELL(v))}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
        </div>
        ${more}`;

}

export function lessonsMarkup(lessons, exercises) {

    const titleOf = new Map(exercises.map((e, i) => [e.id, `Exercise ${i + 1}: ${e.title}`]));

    return `
        <section class="calculator-info" id="sql-lessons">

            <h2>Lessons</h2>

            <p>
                Read a lesson, run its examples, then try the exercises it lists. The lessons go from the basics to advanced topics;
                the first four are enough to start.
                Every example runs on the practice database in your browser.
            </p>

            <div class="lx-lessons">
                ${lessons.map((l, li) => `
                <details class="lx-lesson">
                    <summary>${li + 1}. ${esc(l.title)}<span class="lx-lesson__level">${esc(LEVELS[l.level] ?? l.level)}</span></summary>
                    <div class="lx-lesson__body">
                        <p>${esc(l.intro)}</p>
                        <ul>${l.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
                        ${l.examples.map((e, ei) => `
                        <div>
                            <p><strong>Example.</strong> ${esc(e.says)}</p>
                            <pre class="lx-code" tabindex="0" role="region" aria-label="SQL example ${li + 1}.${ei + 1}"><code data-sql-source>${esc(e.sql)}</code></pre>
                            ${staticResult(e, `${li + 1}.${ei + 1}`)}
                            <p><button type="button" class="lx-btn" data-sql-run>Run this example</button></p>
                            <div class="lx-live-result" data-sql-out data-label="example ${li + 1}.${ei + 1}" role="status" aria-live="polite"></div>
                        </div>`).join("")}
                        ${l.mistakes.length ? `<div><h3>Common mistakes</h3><ul>${l.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div>` : ""}
                        ${l.practise.length ? `<p><strong>Practise:</strong> ${l.practise.map((id) => esc(titleOf.get(id) ?? id)).join("; ")}.</p>` : ""}
                    </div>
                </details>`).join("")}
            </div>

        </section>`;

}

export function sandboxMarkup() {

    return `
        <section class="calculator-info" id="sql-sandbox">

            <h2>Try Your Own SQL</h2>

            <p>
                Write any SQL and run it on the practice database. It is not checked against an exercise, and each run starts from a fresh
                copy, so you cannot break anything. The untidy table contacts_raw is here too, for the data cleaning lesson.
                A run is stopped after 3 seconds, and at most 200 rows are shown.
            </p>

            <div class="lx-sandbox">
                <label class="lx-label" for="sql-sandbox-input">Your SQL</label>
                <textarea id="sql-sandbox-input" class="lx-textarea" rows="5" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="4000">SELECT name, city FROM customers WHERE city = 'Pune';</textarea>
                <p><button type="button" class="lx-btn" id="sql-sandbox-run">Run</button></p>
                <div class="lx-live-result" id="sql-sandbox-out" data-label="your SQL" role="status" aria-live="polite"></div>
            </div>

        </section>`;

}

/** Draw the reply of runner.run into `box`. */
export function showResult(box, reply) {

    box.replaceChildren();

    const note = (text) => {
        const p = document.createElement("p");
        p.className = "lx-note";
        p.textContent = text;
        box.append(p);
    };

    if (reply.unavailable) return note("The SQL engine could not start in this browser, so the example cannot run here.");
    if (reply.timedOut) return note("This statement ran longer than 3 seconds and was stopped.");
    if (!reply.ok) return note(`SQLite says: ${reply.error}`);

    const set = reply.sets.at(-1);

    if (!set || set.columns.length === 0) return note("The statement ran. It returned no rows to show.");

    const wrap = document.createElement("div");
    wrap.className = "lx-table-wrap";
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", `Live result of ${box.dataset.label ?? "your SQL"}`);

    const table = document.createElement("table");
    table.className = "lx-table";

    const head = table.createTHead().insertRow();
    for (const c of set.columns) {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = c;
        head.append(th);
    }

    const body = table.createTBody();
    for (const r of set.rows) {
        const tr = body.insertRow();
        for (const v of r) tr.insertCell().textContent = CELL(v);
    }

    wrap.append(table);
    box.append(wrap);

    note(set.total > set.rows.length ? `${set.total} rows; the first ${set.rows.length} are shown.` : `${set.total} ${set.total === 1 ? "row" : "rows"}.`);

}
