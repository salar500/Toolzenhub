/* =========================================================
   ToolZen Hub
   Practice Labs lessons: running examples and checking answers (SQL)

   Reuses the SQL Practice Lab's engine: sql.js (SQLite as WebAssembly) in a Web Worker, a new in-memory copy of the practice
   data for every run, a 3 second limit, and the lab's own evaluator that compares the result of the learner's query with the
   expected one (it never prints the expected rows). Nothing is sent anywhere and nothing is saved; the page keeps no record
   of what was solved. A result is drawn with DOM methods only (textContent), never as HTML.

   The path's own exercises (sql/additions-data.js) may name a dataset (the company or bank tables), already included in
   their setup, and may carry a plan check: the lab runs EXPLAIN QUERY PLAN (after the learner's statements, or on the
   learner's query once its result is right) and requires the index search the task asks for. A plan check that cannot run
   says so; it never passes by default.
========================================================= */

import { createRunner } from "../tools/sql-practice-lab/sql-runner.js";
import { createEvaluator } from "../tools/sql-practice-lab/evaluator.js";
import { set } from "../tools/sql-practice-lab/exercises.js";
import { SETUP, CLEANING_SETUP } from "../tools/sql-practice-lab/dataset.js";
import { showResult } from "../tools/sql-practice-lab/lessons-view.js";
import { DATASETS, set as pathSet } from "./sql/additions-data.js";

const LABELS = { correct: "Correct.", "not-yet": "Not yet.", "cannot-check": "Could not check." };

function showVerdict(box, verdict) {

    box.replaceChildren();
    box.dataset.verdict = verdict.verdict;

    const head = document.createElement("p");
    const label = document.createElement("strong");
    const word = LABELS[verdict.verdict] ?? "";
    /* some summaries already open with the verdict word ("Not yet. ..."); show it once, in bold */
    const rest = word && verdict.summary.startsWith(word) ? verdict.summary.slice(word.length).trimStart() : verdict.summary;
    label.textContent = `${word} `;
    head.append(label, document.createTextNode(rest));
    box.append(head);

    if (verdict.findings?.length) {
        const ul = document.createElement("ul");
        for (const finding of verdict.findings) {
            const li = document.createElement("li");
            li.textContent = finding;
            ul.append(li);
        }
        box.append(ul);
    }

    if (verdict.lines?.length) {
        const caption = document.createElement("p");
        caption.className = "lx-note";
        caption.textContent = "What your query returned:";
        const pre = document.createElement("pre");
        pre.className = "lx-code";
        pre.tabIndex = 0;
        pre.textContent = verdict.lines.join("\n");
        box.append(caption, pre);
    }

}

export function initLearnPractice() {

    const runner = createRunner({
        workerUrl: new URL("../tools/sql-practice-lab/sql-worker.js", import.meta.url).href,
        libUrl: new URL("../vendor/sql-js/sql-wasm.js", import.meta.url).href,
        wasmUrl: new URL("../vendor/sql-js/sql-wasm.wasm", import.meta.url).href
    });

    const evaluateResult = createEvaluator(runner);
    const exercises = new Map([...set.exercises, ...pathSet.exercises].map((exercise) => [exercise.id, exercise]));
    const setup = [...SETUP, ...CLEANING_SETUP];

    /* the detail column of EXPLAIN QUERY PLAN rows, joined, as the generator recorded it */
    const planText = (resultSet) => (resultSet?.rows ?? []).map((row) => String(row[3] ?? "")).join(" | ");

    async function evaluatePlan(exercise, sql) {

        const single = sql.trim().replace(/;\s*$/, "");

        if (exercise.kind === "query") {
            const verdict = await evaluateResult(exercise, sql);
            if (verdict.verdict !== "correct") return verdict;
            if (single.includes(";")) {
                return { verdict: "cannot-check", summary: "Your result is right. To check its plan, write it as one SELECT statement without other statements." };
            }
        }

        const reply = exercise.kind === "query"
            ? await runner.run({ setup: [...SETUP, ...exercise.setup], sql: `EXPLAIN QUERY PLAN ${single}` })
            : await runner.run({ setup: [...SETUP, ...exercise.setup], sql, verify: exercise.verify });

        if (reply.unavailable || reply.timedOut || !reply.ok) {
            return { verdict: "cannot-check", summary: reply.ok === false && reply.error ? "SQLite could not run your statement, so its plan was not checked." : "The plan could not be checked in this browser.", findings: reply.error ? [`SQLite says: ${reply.error}`] : [] };
        }

        const text = planText(reply.sets.at(-1));
        const good = new RegExp(exercise.plan.must).test(text) && !new RegExp(exercise.plan.mustNot).test(text);

        return good
            ? { verdict: "correct", summary: exercise.kind === "query" ? "Right result, and the plan uses the index." : "The query now uses the plan this task asks for.", lines: [`Plan: ${text}`] }
            : { verdict: "not-yet", summary: "Not yet. The query plan does not show the index search this task asks for.", findings: [`Plan now: ${text || "(empty)"}`, "Look for SCAN (every row read) and change the index or the condition so the plan says SEARCH."] };

    }

    const evaluate = (exercise, sql) => (exercise.plan ? evaluatePlan(exercise, sql) : evaluateResult(exercise, sql));

    /* the joins lesson's visualizer shares this page's SQL engine */
    if (document.querySelector("[data-join-viz]")) {
        import("./join-visualizer.js").then((module) => module.initJoinViz(runner));
    }

    /* the controls start hidden: without script they would do nothing */
    for (const el of document.querySelectorAll("[data-sql-run], .learn-exercise__tool")) el.hidden = false;

    const busy = (button, on) => (on ? button.setAttribute("aria-busy", "true") : button.removeAttribute("aria-busy"));

    document.addEventListener("click", async (event) => {

        const button = event.target instanceof Element ? event.target.closest("[data-sql-run], [data-learn-check], [data-learn-clear]") : null;

        if (!button || button.getAttribute("aria-busy") === "true") return;

        if (button.matches("[data-sql-run]")) {
            const holder = button.closest(".learn-example");
            const source = holder?.querySelector("[data-sql-source]");
            const out = holder?.querySelector("[data-sql-out]");
            if (!source || !out) return;
            busy(button, true);
            out.textContent = "Running...";
            /* an editable playground (sqlplay block) has a textarea; a fixed example has code */
            showResult(out, await runner.run({ setup: [...setup, ...(DATASETS[holder.dataset.dataset] ?? [])], sql: "value" in source ? source.value : source.textContent }));
            busy(button, false);
            return;
        }

        const block = button.closest(".learn-exercise");
        const input = block?.querySelector("textarea");
        const out = block?.querySelector("[data-learn-out]");
        if (!block || !input || !out) return;

        if (button.matches("[data-learn-clear]")) {
            input.value = "";
            out.replaceChildren();
            delete out.dataset.verdict;
            input.focus();
            return;
        }

        const exercise = exercises.get(block.dataset.exercise);
        if (!exercise) return;

        if (input.value.trim() === "") {
            showVerdict(out, { verdict: "cannot-check", summary: "Type your SQL in the box first, then press Check answer." });
            return;
        }

        busy(button, true);
        out.textContent = "Checking...";
        showVerdict(out, await evaluate(exercise, input.value));
        busy(button, false);

    });

}
