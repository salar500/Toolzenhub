/* =========================================================
   ToolZen Hub
   Regular-expression exercises (the regex block): the pattern runs in programming/regex-worker.js, which is stopped
   after 1 second, so a pattern with catastrophic backtracking cannot freeze the page. Nothing is stored or sent.
========================================================= */

import { REGEX } from "./programming/regex.js";

const ALL = new Map(REGEX.map((exercise) => [exercise.id, exercise]));
const LIMIT_MS = 1000;

function run(exercise, pattern, flags) {
    return new Promise((resolve) => {
        const worker = new Worker(new URL("./programming/regex-worker.js", import.meta.url), { type: "module" });
        const timer = setTimeout(() => { worker.terminate(); resolve({ error: "Stopped after 1 second: the pattern backtracks too much (look for nested quantifiers such as (a+)+).", results: [], passed: 0, total: exercise.tests.length }); }, LIMIT_MS);
        worker.onmessage = (event) => { clearTimeout(timer); worker.terminate(); resolve(event.data); };
        const { id, kind, tests, group } = exercise;
        worker.postMessage({ exercise: { id, kind, tests, group }, pattern, flags });
    });
}

export function initRegex(root = document) {
    for (const block of root.querySelectorAll("[data-regex]")) {
        const exercise = ALL.get(block.dataset.regex);
        if (!exercise) continue;
        const [patternBox, flagsBox] = block.querySelectorAll("input");
        const out = block.querySelector("[data-rx-out]");
        block.querySelector("[data-rx-tools]").hidden = false;
        const check = async () => {
            const result = await run(exercise, patternBox.value, flagsBox.value);
            out.replaceChildren();
            const all = !result.error && result.passed === result.total;
            out.dataset.verdict = all ? "correct" : "not-yet";
            const head = document.createElement("p");
            head.textContent = result.error ?? (all ? `All ${result.total} tests pass.` : `${result.passed} of ${result.total} tests pass.`);
            out.append(head);
            if (result.results.length) {
                const ul = document.createElement("ul");
                ul.className = "learn-rubric";
                for (const r of result.results) {
                    const li = document.createElement("li");
                    li.dataset.met = String(r.ok);
                    const strong = document.createElement("strong");
                    strong.textContent = `${r.ok ? "Pass" : "Fail"}: `;
                    const code = document.createElement("code");
                    code.textContent = JSON.stringify(r.text);
                    li.append(strong, code);
                    if (!r.ok) li.append(document.createTextNode(` gave ${r.got}; expected ${r.want}.`));
                    ul.append(li);
                }
                out.append(ul);
            }
            if (all) block.querySelector("details").open = true;
        };
        block.querySelector("[data-rx-check]").addEventListener("click", check);
        for (const box of [patternBox, flagsBox]) box.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); check(); } });
    }
}
