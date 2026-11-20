/* =========================================================
   ToolZen Hub
   Excel Practice Lab (Practice Labs)

   Learn spreadsheet formulas by writing them. An educational simulation of a spreadsheet, not Microsoft Excel: the lab's own
   formula engine (formula/engine.js) calculates your formula on a small sheet, copies it down or across when the exercise
   says so, and tries it again on a second set of numbers, so a typed-in answer cannot pass. Nothing is sent anywhere and nothing
   is saved. No eval: formula text is parsed into a tree and walked.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { el } from "../../learning/dom.js";
import { MAX_RESPONSE_CHARS, evaluate, fillCells } from "./evaluator.js";
import { set } from "./exercises.js";
import { lessons } from "./lessons.js";
import { lessonsMarkup, runExample } from "./lessons-view.js";
import { gridModel, gridNode } from "./sheet-view.js";
import { shiftFormula } from "./formula/parser.js";
import { createSheet, display, SUPPORTED } from "./formula/engine.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "Excel Practice Lab";

const PLAY_ROWS = 6;
const PLAY_COLS = ["A", "B", "C", "D", "E"];
const PLAY_SEED = { A1: "Item", B1: "Qty", C1: "Price", D1: "Total", A2: "Pen", B2: "10", C2: "12", D2: "=B2*C2", A3: "Book", B3: "3", C3: "150", D3: "=B3*C3", A4: "Bag", B4: "1", C4: "899", D4: "=B4*C4", A5: "Total", D5: "=SUM(D2:D4)" };

export function markup() {

    return labMarkup({
        id: "excel-practice-lab",
        title: TITLE,
        intro: "Learn spreadsheet formulas from the start. Read the lessons, change their examples, then solve fifty-five formula exercises on small sheets, from cell references and SUM to lookups, data cleaning and a budget project. Your formula is calculated in your browser by this lab's own spreadsheet simulation and checked on two sets of numbers. It is a learning simulation, not Microsoft Excel.",
        worked: {
            heading: "A Worked Example",
            intro: "Task: B2 holds a price and B3 a quantity. In B4 show the total cost. This example cannot be submitted; it shows the reasoning you will use.",
            example: "=B2*B3",
            steps: [
                "Start with an equals sign: that tells the spreadsheet the cell holds a formula, not text.",
                "Point to the cells instead of typing their numbers: B2 for the price and * for times, then B3 for the quantity.",
                "Press Check answer. The lab calculates your formula, then tries it again after changing the numbers in B2 and B3. A formula that typed 450*3 would pass the first sheet and fail the second.",
                "Read the result lines under the verdict: they show what your formula gave."
            ]
        },
        howTo: [
            "Read the task and look at the sheet. The cell marked ? is where your formula goes.",
            "Type your formula, beginning with =. Several exercises copy your formula down or across for you, as dragging the fill handle would, so the references you choose matter.",
            "Press Check answer. You are told whether the formula could be read, what it gave, and whether it still works when the numbers change.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        afterApp: lessonsMarkup(lessons, set.exercises) + playgroundMarkup(),
        sections: [
            {
                heading: "What This Lab Supports",
                paragraphs: [
                    "This lab calculates one sheet at a time, in English function names, with a comma between arguments and a dot for decimals. Operators: + - * / ^ & = <> < <= > >= and % after a number. Cell references (A1, $A$1, A$1, $A1) and ranges (A1:B5) are supported; so is copying a formula down and across."
                ],
                items: [
                    `Functions it can calculate (${SUPPORTED.length}): ${SUPPORTED.join(", ")}.`,
                    "A function that is not on this list gives #NAME? and a message saying the lab does not support it. It may exist in Excel; the lab never guesses a value.",
                    "Not included: TODAY, NOW and RAND (their answer changes), the TEXT function and number-format codes, dynamic array functions such as FILTER, SORT, UNIQUE, SEQUENCE, LET and LAMBDA, OFFSET and INDIRECT, other sheets, defined names, Tables and array formulas.",
                    "A formula can be up to 500 characters long, nested up to 32 levels, and a range can cover up to 2,000 cells.",
                    "Dates are serial numbers, supported from 1 March 1900. Results of the supported functions follow the documented behaviour of Excel; they have not been compared against a copy of Excel, so tell us if you find a difference."
                ]
            },
            {
                heading: "About This Lab",
                paragraphs: [
                    "The exercises are written for this site and follow the function descriptions in Microsoft's documentation. They are practice, not a course and not a qualification. The expected answers were calculated separately in Python, not by the lab's engine, and the engine is tested against values worked out by hand. The exercises have not had a second reviewer. Nothing you type leaves your browser, and nothing is saved when you leave the page."
                ]
            }
        ]
    });

}

function playgroundMarkup() {

    const rows = [];
    for (let r = 1; r <= PLAY_ROWS; r += 1) rows.push(r);

    return `
        <section class="calculator-info" id="xl-playground">

            <h2>Try Your Own Formulas</h2>

            <p>
                Type numbers, text or formulas (starting with =) into the cells. The results appear in the second table as you type.
                This is a free sheet: nothing is checked, and it is empty again when you reload the page.
            </p>

            <div class="lx-sandbox" id="xl-play-root">
                <p class="lx-note">The free sheet needs JavaScript.</p>
            </div>

            <h3>What happens when a formula is copied?</h3>

            <p>
                Type a formula, and say how far it is copied. The lab shows what it becomes, using the same rules for relative (A1),
                absolute ($A$1) and mixed ($A1, A$1) references.
            </p>

            <div class="lx-sandbox" id="xl-copy-root">
                <p class="lx-note">The copy demonstration needs JavaScript.</p>
            </div>

        </section>`;

}

export function render(mount = document.querySelector("#app")) {

    if (!mount) return;
    mount.innerHTML = markup();
    init();

}

/* ---------- the exercise's own input: the sheet and a formula box ---------- */

/* exported so Practice Labs lessons can mount these exercises with the same input (learn-labset.js) */
export function exerciseInput(ex, value, onChange) {

    const answers = fillCells(ex.sheet).map((f) => f.addr);
    const shownAt = Object.fromEntries(answers.map((a) => [a, "?"]));
    const model = gridModel(ex.sheet.cells, { marks: answers, shownAt, formats: ex.sheet.formats });
    const id = `xl-formula-${ex.id}`;
    const field = el("input", { id, class: "lx-input", type: "text", maxlength: MAX_RESPONSE_CHARS, spellcheck: "false", autocomplete: "off", autocapitalize: "off", placeholder: "=" });
    field.value = value;
    field.addEventListener("input", onChange);

    const copies = answers.length > 1 ? ` It is copied to ${answers[answers.length - 1]} for you.` : "";

    return {
        node: el("div", { class: "lx-sheet-input" },
            gridNode(el, model, `The sheet for this exercise. The cells marked ? are filled by your formula.`),
            el("div", { class: "lx-field-head" }, el("label", { class: "lx-label", for: id, text: `Your formula for ${ex.sheet.answer}` })),
            field,
            el("p", { class: "lx-meta", text: `Start with =.${copies} The lab also tries your formula on a second set of numbers.` })
        ),
        get: () => field.value,
        set: (v) => { field.value = v; },
        focus: () => field.focus()
    };

}

/* ---------- the lessons' Calculate buttons ---------- */

function wireLessons() {

    document.addEventListener("click", (event) => {

        const button = event.target instanceof Element ? event.target.closest("[data-xl-run]") : null;
        if (!button) return;

        const holder = button.closest("[data-example]");
        const [li, ei] = holder.dataset.example.split(".").map(Number);
        const example = lessons[li]?.examples[ei];
        const out = holder.querySelector("[data-xl-out]");
        const input = holder.querySelector("[data-xl-formula]");

        if (!example || !out || !input) return;

        const result = runExample(example, input.value);
        out.replaceChildren(el("p", { class: "lx-note" }, el("strong", { text: "Result. " }), `${result.lines.join("; ")}${result.note ? ` ${result.note}` : ""}`));

    });

}

/* ---------- the free sheet and the copy demonstration ---------- */

function wirePlayground() {

    const root = document.querySelector("#xl-play-root");
    if (!root) return;

    const addrs = [];
    for (let r = 1; r <= PLAY_ROWS; r += 1) for (const c of PLAY_COLS) addrs.push(`${c}${r}`);

    const inputs = new Map();
    const out = el("div", { id: "xl-play-out", role: "status", "aria-live": "polite" });

    const head = el("tr", {}, el("th", { scope: "col" }, el("span", { class: "lx-sr-only", text: "Row" })), PLAY_COLS.map((c) => el("th", { scope: "col", text: c })));
    const body = [];
    for (let r = 1; r <= PLAY_ROWS; r += 1) {
        body.push(el("tr", {}, el("th", { scope: "row", text: String(r) }), PLAY_COLS.map((c) => {
            const addr = `${c}${r}`;
            const input = el("input", { class: "lx-input lx-cell-input", type: "text", "aria-label": `Cell ${addr}`, maxlength: 200, spellcheck: "false", autocomplete: "off", autocapitalize: "off" });
            input.value = PLAY_SEED[addr] ?? "";
            input.addEventListener("input", redraw);
            inputs.set(addr, input);
            return el("td", {}, input);
        })));
    }

    function redraw() {
        const cells = {};
        for (const [addr, input] of inputs) if (input.value !== "") cells[addr] = input.value;
        const sheet = createSheet(cells);
        const rows = [];
        for (let r = 1; r <= PLAY_ROWS; r += 1) {
            rows.push(el("tr", {}, el("th", { scope: "row", text: String(r) }), PLAY_COLS.map((c) => {
                const v = sheet.value(`${c}${r}`);
                const text = display(v);
                return el("td", { class: `lx-cell lx-cell--${text.startsWith("#") ? "error" : typeof v === "number" ? "number" : "text"}`, text });
            })));
        }
        out.replaceChildren(
            el("div", { class: "lx-table-wrap lx-sheet", tabindex: "0", role: "region", "aria-label": "Results of your free sheet" },
                el("table", { class: "lx-table" }, el("thead", {}, el("tr", {}, el("th", { scope: "col" }, el("span", { class: "lx-sr-only", text: "Row" })), PLAY_COLS.map((c) => el("th", { scope: "col", text: c })))), el("tbody", {}, rows)))
        );
    }

    root.replaceChildren(
        el("div", { class: "lx-table-wrap lx-sheet", tabindex: "0", role: "region", "aria-label": "Your free sheet: type into the cells" },
            el("table", { class: "lx-table" }, el("thead", {}, head), el("tbody", {}, body))),
        el("p", {}, el("button", { type: "button", class: "lx-btn", onclick: () => { for (const i of inputs.values()) i.value = ""; redraw(); i0.focus(); } }, "Clear the sheet")),
        out
    );

    const i0 = inputs.get("A1");
    redraw();

    /* the copy demonstration */
    const copy = document.querySelector("#xl-copy-root");
    if (!copy) return;

    const f = el("input", { id: "xl-copy-formula", class: "lx-input", type: "text", value: "=A1*$B$1", maxlength: 500, spellcheck: "false", autocomplete: "off", autocapitalize: "off" });
    const down = el("input", { id: "xl-copy-down", class: "lx-input", type: "number", value: "1", min: "-20", max: "20", step: "1", inputmode: "numeric" });
    const right = el("input", { id: "xl-copy-right", class: "lx-input", type: "number", value: "0", min: "-20", max: "20", step: "1", inputmode: "numeric" });
    const shown = el("pre", { class: "lx-code", tabindex: "0", role: "region", "aria-label": "The copied formula" }, el("code", { id: "xl-copy-out", "aria-live": "polite" }));

    function update() {
        const dRow = Math.max(-20, Math.min(20, Math.trunc(Number(down.value) || 0)));
        const dCol = Math.max(-20, Math.min(20, Math.trunc(Number(right.value) || 0)));
        shown.querySelector("code").textContent = f.value.startsWith("=") ? shiftFormula(f.value, dRow, dCol) : "A formula starts with an equals sign (=).";
    }

    for (const i of [f, down, right]) i.addEventListener("input", update);
    update();

    copy.replaceChildren(
        el("div", { class: "lx-field-head" }, el("label", { class: "lx-label", for: "xl-copy-formula", text: "Formula" })), f,
        el("div", { class: "lx-field-head" }, el("label", { class: "lx-label", for: "xl-copy-down", text: "Copied this many rows down (negative is up)" })), down,
        el("div", { class: "lx-field-head" }, el("label", { class: "lx-label", for: "xl-copy-right", text: "Copied this many columns right (negative is left)" })), right,
        el("p", { class: "lx-label" }, "The copied formula:"), shown
    );

}

export function init() {

    wireLessons();
    wirePlayground();

    initLab({
        set,
        lab: {
            id: "excel-practice-lab",
            lessons: lessons.map((l) => ({ title: l.title, practise: l.practise })),
            limit: MAX_RESPONSE_CHARS,
            inputLabel: "Your formula",
            input: exerciseInput,
            evaluate
        }
    });

}
