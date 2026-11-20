/* =========================================================
   ToolZen Hub
   JOIN visualizer (the "See a join happen" block of the joins lesson)

   joinMarkup() is used by the site build: the two tables, the SQL and the INNER JOIN result, readable without script.
   initJoinViz(runner) adds the interaction: choose a join type, step through it row by row (the driving row and its
   matches are highlighted and the result grows), and, once the result is complete, run the same SQL in SQLite in the
   browser and say whether the engine returned the same rows. Text only through DOM methods; nothing is stored.
========================================================= */

import { JOIN_TYPES, PRESET, joinSteps, sqlFor, setupFor, sameRows } from "./join-model.js";

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CELL = (value) => (value === null || value === undefined ? "NULL" : String(value));
const LABEL = { INNER: "INNER JOIN", LEFT: "LEFT JOIN", RIGHT: "RIGHT JOIN", FULL: "FULL OUTER JOIN" };

function tableHtml(table, side) {
    return `
                            <div class="lx-table-wrap join-viz__table" tabindex="0" role="region" aria-label="${esc(table.name)} table">
                                <table class="lx-table">
                                    <caption>${esc(table.name)} (${esc(table.alias)})</caption>
                                    <thead><tr>${table.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
                                    <tbody>${table.rows.map((row, i) => `<tr data-side="${side}" data-index="${i}">${row.map((v) => `<td>${esc(CELL(v))}</td>`).join("")}</tr>`).join("")}</tbody>
                                </table>
                            </div>`;
}

const resultHead = () => PRESET.select.map(([, column, as]) => `<th scope="col">${esc(as ?? column)}</th>`).join("");

export function joinMarkup() {

    const inner = joinSteps("INNER").rows;

    return `
                <section class="learn-section" aria-labelledby="learn-visual">
                    <h2 id="learn-visual">See a join happen</h2>
                    <p>Two small tables: every customer and every order. Customer 2 and customer 4 have no orders, and order 104 belongs to a customer who is not in the table. Choose a join type and step through it: each step takes one row and looks for its matches. When the result is complete, SQLite in your browser runs the same query to confirm it.</p>
                    <div class="join-viz" data-join-viz>
                        <div class="join-viz__types" role="group" aria-label="Join type" hidden>
                            ${JOIN_TYPES.map((t) => `<button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-join-type="${t}" aria-pressed="${t === "INNER"}">${LABEL[t]}</button>`).join("")}
                        </div>
                        <pre class="lx-code" tabindex="0"><code class="join-viz__sql">${esc(sqlFor("INNER"))}</code></pre>
                        <div class="join-viz__tables">
                            ${tableHtml(PRESET.left, "left")}
                            ${tableHtml(PRESET.right, "right")}
                        </div>
                        <div class="join-viz__nav" hidden>
                            <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-join-step="-1">Previous step</button>
                            <button type="button" class="calculator-form__button lx-btn" data-join-step="1">Next step</button>
                            <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-join-step="all">Show the whole result</button>
                        </div>
                        <p class="join-viz__say" role="status" aria-live="polite">Result of the INNER JOIN: only customers with matching orders.</p>
                        <h3>Result</h3>
                        <div class="lx-table-wrap" tabindex="0" role="region" aria-label="Join result">
                            <table class="lx-table join-viz__result">
                                <thead><tr>${resultHead()}</tr></thead>
                                <tbody>${inner.map((row) => `<tr>${row.map((v) => `<td>${esc(CELL(v))}</td>`).join("")}</tr>`).join("")}</tbody>
                            </table>
                        </div>
                        <p class="lx-note join-viz__engine" aria-live="polite"></p>
                    </div>
                </section>`;

}

export function initJoinViz(runner, root = document.querySelector("[data-join-viz]")) {

    if (!root) return;

    const say = root.querySelector(".join-viz__say");
    const sqlBox = root.querySelector(".join-viz__sql");
    const body = root.querySelector(".join-viz__result tbody");
    const engine = root.querySelector(".join-viz__engine");
    const typeButtons = [...root.querySelectorAll("[data-join-type]")];
    let type = "INNER";
    let model = joinSteps(type);
    let step = -1; /* -1 = nothing yet; steps.length - 1 = complete */

    root.querySelector(".join-viz__types").hidden = false;
    root.querySelector(".join-viz__nav").hidden = false;

    const rowsUpTo = (n) => model.steps.slice(0, n + 1).flatMap((s) => s.added);

    function paint() {

        for (const tr of root.querySelectorAll("tr[data-side]")) tr.classList.remove("is-current", "is-match");
        const current = model.steps[step];
        if (current) {
            const other = current.side === "left" ? "right" : "left";
            for (const i of current.unmatched ?? [current.index]) root.querySelector(`tr[data-side="${current.side}"][data-index="${i}"]`)?.classList.add("is-current");
            for (const i of current.matches) root.querySelector(`tr[data-side="${other}"][data-index="${i}"]`)?.classList.add("is-match");
        }

        body.replaceChildren();
        for (const row of rowsUpTo(step)) {
            const tr = body.insertRow();
            for (const value of row) tr.insertCell().textContent = CELL(value);
        }

        const done = step === model.steps.length - 1;
        say.textContent = step < 0
            ? `${LABEL[type]}: press Next step to go through it one row at a time.`
            : `Step ${step + 1} of ${model.steps.length}. ${current.note}${done ? ` The result has ${model.rows.length} rows.` : ""}`;
        engine.textContent = "";
        if (done) confirm();

    }

    async function confirm() {
        const wanted = type;
        engine.textContent = "Running the same query in SQLite...";
        const reply = await runner.run({ setup: setupFor(), sql: sqlFor(type) });
        if (wanted !== type) return;
        if (reply.unavailable || !reply.ok) {
            engine.textContent = `SQLite could not run this query here${reply.error ? `: ${reply.error}` : ""}.`;
            return;
        }
        const got = reply.sets.at(-1)?.rows ?? [];
        engine.textContent = sameRows(got, model.rows)
            ? `Checked: SQLite in your browser returned the same ${got.length} rows (row order can differ; a join without ORDER BY has no fixed order).`
            : `SQLite returned ${got.length} rows, which differ from the steps above. Please report this page.`;
    }

    root.addEventListener("click", (event) => {
        const button = event.target instanceof Element ? event.target.closest("button") : null;
        if (!button || !root.contains(button)) return;
        if (button.dataset.joinType) {
            type = button.dataset.joinType;
            model = joinSteps(type);
            step = -1;
            for (const b of typeButtons) b.setAttribute("aria-pressed", String(b === button));
            sqlBox.textContent = sqlFor(type);
            paint();
            return;
        }
        const move = button.dataset.joinStep;
        if (move === "all") step = model.steps.length - 1;
        else step = Math.max(-1, Math.min(model.steps.length - 1, step + Number(move)));
        paint();
    });

    paint();

}
