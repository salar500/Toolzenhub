/* =========================================================
   ToolZen Hub
   JavaScript exercises (the jsrun block): the learner's code runs against the exercise's tests in a fresh Web Worker
   (programming/js-worker.js) with network access removed; the worker is stopped after a time limit, so an endless loop
   cannot freeze the page. Results and console output are drawn with DOM methods only. Nothing is stored or sent.
========================================================= */

import { JS_EXERCISES } from "./programming/js-exercises.js";

const ALL = new Map(JS_EXERCISES.map((exercise) => [exercise.id, exercise]));
const LIMIT_MS = 2000;

function run(code, exercise) {
    return new Promise((resolve) => {
        const worker = new Worker(new URL("./programming/js-worker.js", import.meta.url), { type: "module" });
        const timer = setTimeout(() => { worker.terminate(); resolve({ error: `Stopped after ${LIMIT_MS / 1000} seconds. Is there a loop that never ends?`, results: [], passed: 0, total: exercise.tests.length, logs: [] }); }, LIMIT_MS);
        worker.onmessage = (event) => { clearTimeout(timer); worker.terminate(); resolve(event.data); };
        worker.onerror = (event) => { event.preventDefault(); clearTimeout(timer); worker.terminate(); resolve({ error: event.message || "The code could not run.", results: [], passed: 0, total: exercise.tests.length, logs: [] }); };
        const { id, fn, tests } = exercise;
        worker.postMessage({ code, exercise: { id, fn, tests } });
    });
}

function line(tag, text, attrs = {}) {
    const n = document.createElement(tag);
    n.textContent = text;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
}

export function initJsRun(root = document) {
    for (const block of root.querySelectorAll("[data-jsrun]")) {
        const exercise = ALL.get(block.dataset.jsrun);
        if (!exercise) continue;
        const tools = block.querySelector("[data-js-tools]");
        const input = block.querySelector("textarea");
        const out = block.querySelector("[data-js-out]");
        const button = block.querySelector("[data-js-run]");
        tools.hidden = false;
        button.addEventListener("click", async () => {
            button.disabled = true;
            out.replaceChildren(line("p", "Running…"));
            const result = await run(input.value, exercise);
            button.disabled = false;
            out.replaceChildren();
            const all = !result.error && result.passed === result.total;
            out.dataset.verdict = all ? "correct" : "not-yet";
            out.append(line("p", result.error ?? (all ? `All ${result.total} tests pass.` : `${result.passed} of ${result.total} tests pass.`)));
            if (result.results.length) {
                const ul = document.createElement("ul");
                ul.className = "learn-rubric";
                for (const r of result.results) {
                    const li = document.createElement("li");
                    li.dataset.met = String(r.ok);
                    li.append(line("strong", `${r.ok ? "Pass" : "Fail"}: `), line("code", r.call));
                    if (!r.ok) li.append(document.createTextNode(` returned ${r.got}; expected ${r.want}.`));
                    ul.append(li);
                }
                out.append(ul);
            }
            if (result.logs.length) {
                out.append(line("p", "Console output:"));
                out.append(line("pre", result.logs.join("\n"), { class: "lx-code", tabindex: "0" }));
            }
            if (all) block.querySelector("details").open = true;
        });
        block.querySelector("[data-js-reset]").addEventListener("click", () => { input.value = exercise.starter; out.replaceChildren(); delete out.dataset.verdict; });
    }
}
