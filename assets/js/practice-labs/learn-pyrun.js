/* =========================================================
   ToolZen Hub
   Python exercises (the pyrun block): nothing is downloaded until the learner presses "Load Python". Then one shared
   worker starts Pyodide (about 13 MB, cached by the browser afterwards) and every Python exercise on the page uses it.
   A run that takes longer than 10 seconds stops the worker; Python then loads again on the next run.
========================================================= */

import { PY_EXERCISES } from "./programming/py-exercises.js";

const ALL = new Map(PY_EXERCISES.map((exercise) => [exercise.id, exercise]));
const LIMIT_MS = 10000;

let worker = null;
let ready = null;
const listeners = new Set();

function setStatus(text, state) {
    for (const fn of listeners) fn(text, state);
}

function start() {
    if (ready) return ready;
    setStatus("Loading Python… (about 13 MB the first time)", "loading");
    worker = new Worker(new URL("./programming/py-worker.js", import.meta.url), { type: "module" });
    ready = new Promise((resolve, reject) => {
        worker.onmessage = (event) => {
            if (event.data.type === "ready") { setStatus(`Python ${event.data.version} is ready. It runs in your browser.`, "ready"); resolve(); }
            if (event.data.type === "failed") { stop(); setStatus(`This browser could not start Python (${event.data.message}). The model answers below still explain each task.`, "failed"); reject(new Error(event.data.message)); }
        };
        worker.onerror = (event) => { event.preventDefault(); stop(); setStatus("This browser could not start Python (the worker failed to load). The model answers below still explain each task.", "failed"); reject(new Error("worker")); };
    });
    worker.postMessage({ type: "load" });
    return ready;
}

function stop() {
    worker?.terminate();
    worker = null;
    ready = null;
}

async function run(code, exercise) {
    await start();
    return new Promise((resolve) => {
        const timer = setTimeout(() => { stop(); setStatus("Python was stopped after 10 seconds and will load again on the next run.", "idle"); resolve({ error: "Stopped after 10 seconds. Is there a loop that never ends?", results: [], passed: 0, total: exercise.tests.length, logs: "" }); }, LIMIT_MS);
        worker.onmessage = (event) => { if (event.data.type === "result") { clearTimeout(timer); resolve(event.data.result); } };
        worker.postMessage({ type: "run", code, fn: exercise.fn, tests: exercise.tests });
    });
}

function line(tag, text, attrs = {}) {
    const n = document.createElement(tag);
    n.textContent = text;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
}

export function initPyRun(root = document) {
    for (const block of root.querySelectorAll("[data-pyrun]")) {
        const exercise = ALL.get(block.dataset.pyrun);
        if (!exercise) continue;
        const tools = block.querySelector("[data-py-tools]");
        const input = block.querySelector("textarea");
        const out = block.querySelector("[data-py-out]");
        const status = block.querySelector("[data-py-status]");
        const runButton = block.querySelector("[data-py-run]");
        const loadButton = block.querySelector("[data-py-load]");
        tools.hidden = false;
        listeners.add((text, state) => {
            status.textContent = text;
            status.dataset.state = state;
            loadButton.hidden = state === "ready" || state === "loading";
            runButton.disabled = state === "loading";
        });
        loadButton.addEventListener("click", () => { start().catch(() => {}); });
        runButton.addEventListener("click", async () => {
            runButton.disabled = true;
            out.replaceChildren(line("p", "Running…"));
            let result;
            try { result = await run(input.value, exercise); } catch { out.replaceChildren(); runButton.disabled = false; return; }
            runButton.disabled = false;
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
            if (result.logs) out.append(line("p", "Printed output:"), line("pre", result.logs, { class: "lx-code", tabindex: "0" }));
            if (all) block.querySelector("details").open = true;
        });
        block.querySelector("[data-py-reset]").addEventListener("click", () => { input.value = exercise.starter; out.replaceChildren(); delete out.dataset.verdict; });
    }
}
