/* =========================================================
   ToolZen Hub
   Practice Labs lessons: running examples and checking answers (SQL)

   Reuses the SQL Practice Lab's engine: sql.js (SQLite as WebAssembly) in a Web Worker, a new in-memory copy of the practice
   data for every run, a 3 second limit, and the lab's own evaluator that compares the result of the learner's query with the
   expected one (it never prints the expected rows). Nothing is sent anywhere and nothing is saved; the page keeps no record
   of what was solved. A result is drawn with DOM methods only (textContent), never as HTML.
========================================================= */

import { createRunner } from "../tools/sql-practice-lab/sql-runner.js";
import { createEvaluator } from "../tools/sql-practice-lab/evaluator.js";
import { set } from "../tools/sql-practice-lab/exercises.js";
import { SETUP, CLEANING_SETUP } from "../tools/sql-practice-lab/dataset.js";
import { showResult } from "../tools/sql-practice-lab/lessons-view.js";

const LABELS = { correct: "Correct.", "not-yet": "Not yet.", "cannot-check": "Could not check." };

function showVerdict(box, verdict) {

    box.replaceChildren();
    box.dataset.verdict = verdict.verdict;

    const head = document.createElement("p");
    const label = document.createElement("strong");
    label.textContent = `${LABELS[verdict.verdict] ?? ""} `;
    head.append(label, document.createTextNode(verdict.summary));
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

    const evaluate = createEvaluator(runner);
    const exercises = new Map(set.exercises.map((exercise) => [exercise.id, exercise]));
    const setup = [...SETUP, ...CLEANING_SETUP];

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
            showResult(out, await runner.run({ setup, sql: source.textContent }));
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
