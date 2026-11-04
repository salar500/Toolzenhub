/* =========================================================
   ToolZen Hub
   Power BI Practice Lab (Practice Labs)

   Learn the path from raw data to a report: clean tables with query steps, connect them in a star-schema model, write DAX measures,
   and see the results as a chart. An educational simulation, not Power BI: the query steps, the relationship checks and a documented
   subset of DAX are really calculated by this lab's own code on small data, while report design is practised through a chart preview
   and the flashcards. Nothing is sent anywhere and nothing is saved. No eval: text is parsed into a tree and walked.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { el } from "../../learning/dom.js";
import { escapeHTML as esc } from "../../ui/escape.js";
import { MAX_RESPONSE_CHARS, evaluate } from "./evaluator.js";
import { set } from "./exercises.js";
import { lessons } from "./lessons.js";
import { lessonsMarkup, runExample, resultHtml } from "./lessons-view.js";
import { STEPS } from "./pq/engine.js";
import { SUPPORTED } from "./dax/engine.js";
import { REPORT_MEASURES, REPORT_GROUPS, reportRows, barChartSvg } from "./report.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "Power BI Practice Lab";
const SHOWN = 6;

export function markup() {

    return labMarkup({
        id: "power-bi-practice-lab",
        title: TITLE,
        intro: "Learn the path from raw data to a report. Read the lessons, then clean messy tables with query steps, connect them in a star-schema model and write DAX measures, finishing with a six-part sales project. The steps, the relationship checks and a documented part of DAX are really calculated in your browser by this lab's own code. It is a learning simulation, not Power BI, and needs no installation or account.",
        worked: {
            heading: "A Worked Example",
            intro: "Task: the Name column has stray spaces and mixed capitals. Clean it. This example cannot be submitted; it shows the reasoning you will use.",
            example: "trim Name\nproper Name",
            steps: [
                "Look at the data: \"  asha  rao\" has spaces at the start and doubled inside, and no capitals.",
                "Write one step per line. trim removes the stray spaces; proper then gives each word a capital letter.",
                "Order matters: here either order works, but when you remove duplicates, clean the text first, or rows that differ only by a space survive.",
                "Press Check answer. The lab runs your steps on the table and compares the result with the expected table, cell by cell, so any valid set of steps passes."
            ]
        },
        howTo: [
            "Read the task and look at the table or tables shown. The kind of answer is stated in the label above the box: query steps, relationships or a measure.",
            "Query steps: one step per line, such as trim Name. Relationships: Orders[ProductID] -> Products[ProductID] (many side to one side). Measures: Total Sales = SUM(Orders[Amount]).",
            "Press Check answer. For steps and relationships, the lab tells you what your work produced. For a measure, it is evaluated in several filter contexts (the whole data, a category, a city, a month), so a number typed into the formula cannot pass.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        afterApp: lessonsMarkup(lessons, set.exercises) + reportMarkup(),
        sections: [
            {
                heading: "What Is Real, Simulated and Conceptual",
                paragraphs: ["The lab is honest about what it does."],
                items: [
                    "Really calculated: every query step on the table you give it, the relationship checks (uniqueness, kinds of value, orphans) and every supported DAX function in a filter context. Results are exact for the small data used.",
                    "Simulated: the step names mirror Power Query's menus, but the lab does not run the M language and has no data connectors. The relationship form replaces the model diagram. The chart preview models the last step of a report.",
                    "Conceptual: report design, KPI choice and storytelling are taught in the lessons and practised through the flashcards, not on a report canvas.",
                    "Not covered: Power BI Service, gateways, refresh schedules, row-level security, Copilot and Fabric.",
                    "Optional and unchecked: repeat the project in the free Power BI Desktop if you have it. Nothing here requires it."
                ]
            },
            {
                heading: "What This Lab Supports",
                paragraphs: ["Each query step is written on its own line. The names mirror Power Query's, in simplified form."],
                items: [
                    `Query steps (${STEPS.length}): ${STEPS.join("; ")}.`,
                    `DAX functions it can calculate (${SUPPORTED.length}): ${SUPPORTED.join(", ")}. Measures are written Name = expression; columns are Table[Column] and measures [Name]; VAR and RETURN are supported.`,
                    "A function that is not on this list returns a message saying the lab does not support it. It may exist in Power BI; the lab never guesses a value.",
                    "Not included: EARLIER, USERELATIONSHIP, bidirectional filtering, many-to-many relationships, calculation groups, user-defined functions, DAX queries, other time-intelligence functions, M code, and any visual formatting.",
                    "A formula can be up to 800 characters, a script up to 3,000 characters and 40 steps; a formula that needs more than about 200,000 row visits is stopped."
                ]
            },
            {
                heading: "About This Lab",
                paragraphs: [
                    "The exercises and lessons are written for this site and follow Microsoft Learn's descriptions of Power Query, star schemas and DAX. They are practice, not a course and not a qualification. The expected answers were calculated separately in Python, not by the lab's engines, and the engines are tested against values worked out by hand. The set has not had a second reviewer and has never been compared with Power BI Desktop. The data is invented and nothing you type leaves your browser or is saved when you leave the page."
                ]
            }
        ]
    });

}

function reportMarkup() {

    return `
        <section class="calculator-info" id="pb-report">

            <h2>Report Preview</h2>

            <p>
                The last step of the workflow is a report. Choose a measure and what to group it by: the lab evaluates the measure for each
                group on the Sakhi Stores model and draws it. These are real calculations with the measures taught above, shown as a chart
                and a table. It is a small model of reporting, not Power BI's report canvas.
            </p>

            <div class="lx-sandbox">
                <label class="lx-label" for="pb-report-measure">Measure</label>
                <select id="pb-report-measure" class="lx-input">${REPORT_MEASURES.map((m) => `<option value="${esc(m.id)}">${esc(m.label)}</option>`).join("")}</select>
                <label class="lx-label" for="pb-report-group">Group by</label>
                <select id="pb-report-group" class="lx-input">${REPORT_GROUPS.map((g) => `<option value="${esc(g.id)}">${esc(g.label)}</option>`).join("")}</select>
                <div id="pb-report-out" role="status" aria-live="polite"></div>
            </div>

        </section>`;

}

export function render(mount = document.querySelector("#app")) {

    if (!mount) return;
    mount.innerHTML = markup();
    init();

}

/* ---------- tables shown with an exercise ---------- */

function tableNode(name, table) {
    const rows = table.rows.slice(0, SHOWN);
    return el("div", { class: "lx-table-wrap", tabindex: "0", role: "region", "aria-label": `Table ${name} for this exercise` },
        el("table", { class: "lx-table" },
            el("caption", { class: "lx-sr-only", text: `Table ${name} for this exercise` }),
            el("thead", {}, el("tr", {}, table.columns.map((c) => el("th", { scope: "col", text: c })))),
            el("tbody", {}, rows.map((r) => el("tr", {}, r.map((c) => el("td", { text: c === null ? "" : String(c) })))))),
        table.rows.length > SHOWN ? el("p", { class: "lx-note", text: `${table.rows.length - SHOWN} more rows are not shown (${table.rows.length} rows in all).` }) : null);
}

const KIND_LABEL = { query: "Your query steps (one per line)", model: "Your relationships (one per line)", dax: "Your measure" };
const KIND_HINT = {
    query: "Write each step on its own line, for example trim Name. The steps are applied from the first line to the last.",
    model: "Write each relationship as Table[Column] -> Table[Column], from the many side to the one side.",
    dax: "Write Name = expression. Provided measures can be used by name in square brackets."
};

function exerciseInput(ex, value, onChange) {

    const id = `pb-input-${ex.id}`;
    const tables = [];
    if (ex.kind === "query") {
        tables.push(tableNode(ex.input.name, ex.input.table));
        for (const [name, t] of Object.entries(ex.tables ?? {})) tables.push(tableNode(name, t));
    } else if (ex.kind === "model") {
        for (const [name, t] of Object.entries(ex.tables)) tables.push(tableNode(name, t));
    } else {
        tables.push(el("p", { class: "lx-note", text: "This exercise uses the Sakhi Stores model: Orders (OrderID, OrderDate, CustomerID, ProductID, Qty, Amount), Products (ProductID, Name, Category, Price), Customers (CustomerID, Name, City) and Date (Date, Year, Month, YearMonth), related from Orders to each of the others." }));
        const helpers = Object.entries(ex.helpers ?? {});
        if (helpers.length) tables.push(el("p", { class: "lx-note", text: `Provided measures: ${helpers.map(([n, f]) => `[${n}] = ${f}`).join("; ")}.` }));
        tables.push(el("p", { class: "lx-note", text: `The measure ${ex.target} is checked in ${ex.contexts.length} filter contexts: ${ex.contexts.map((c) => c.label).join("; ")}.` }));
    }

    const area = el("textarea", { id, class: "lx-textarea", rows: ex.kind === "dax" ? 4 : 6, maxlength: MAX_RESPONSE_CHARS, spellcheck: "false", autocomplete: "off", autocapitalize: "off", "aria-describedby": `${id}-hint` });
    area.value = value;
    area.addEventListener("input", onChange);

    return {
        node: el("div", { class: "lx-sheet-input" },
            ...tables,
            el("div", { class: "lx-field-head" }, el("label", { class: "lx-label", for: id, text: KIND_LABEL[ex.kind] })),
            area,
            el("p", { class: "lx-meta", id: `${id}-hint`, text: KIND_HINT[ex.kind] })
        ),
        get: () => area.value,
        set: (v) => { area.value = v; },
        focus: () => area.focus()
    };

}

/* ---------- the lessons' Run buttons ---------- */

function wireLessons() {

    document.addEventListener("click", (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-pb-run]") : null;
        if (!button) return;
        const holder = button.closest("[data-example]");
        const [li, ei] = holder.dataset.example.split(".").map(Number);
        const example = lessons[li]?.examples[ei];
        const out = holder.querySelector("[data-pb-out]");
        const box = holder.querySelector("[data-pb-script]");
        if (!example || !out || !box) return;
        out.innerHTML = resultHtml(runExample(example, box.value), `example ${li + 1}.${ei + 1}`);
    });

}

/* ---------- the report preview ---------- */

function wireReport() {

    const measure = document.querySelector("#pb-report-measure");
    const group = document.querySelector("#pb-report-group");
    const out = document.querySelector("#pb-report-out");
    if (!measure || !group || !out) return;

    function draw() {
        const m = REPORT_MEASURES.find((x) => x.id === measure.value);
        const g = REPORT_GROUPS.find((x) => x.id === group.value);
        const { rows, error } = reportRows(measure.value, group.value);
        if (error) { out.replaceChildren(el("p", { class: "lx-note", text: error })); return; }
        const title = `${m.label} by ${g.label}`;
        const chart = el("div", {});
        chart.innerHTML = barChartSvg(rows, title);
        out.replaceChildren(
            el("h3", { text: title }),
            chart,
            el("div", { class: "lx-table-wrap", tabindex: "0", role: "region", "aria-label": `Values of ${title}` },
                el("table", { class: "lx-table" },
                    el("thead", {}, el("tr", {}, el("th", { scope: "col", text: g.label }), el("th", { scope: "col", text: m.label }))),
                    el("tbody", {}, rows.map((r) => el("tr", {}, el("td", { text: r.label }), el("td", { class: "lx-cell--number", text: r.value === null ? "(blank)" : String(Math.round(r.value * 100) / 100) })))))),
            el("p", { class: "lx-note", text: "A blank means there are no sales in that group for that measure, not zero." })
        );
    }

    measure.addEventListener("change", draw);
    group.addEventListener("change", draw);
    draw();

}

export function init() {

    wireLessons();
    wireReport();

    initLab({
        set,
        lab: {
            id: "power-bi-practice-lab",
            limit: MAX_RESPONSE_CHARS,
            inputLabel: (ex) => KIND_LABEL[ex.kind],
            input: exerciseInput,
            evaluate
        }
    });

}
