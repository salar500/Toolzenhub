/* =========================================================
   ToolZen Hub
   Numeric exercises (the numeric block): the learner calculates a value from the dataset shown; data/stats.js computes
   the answer from the same data and accepts it at the exercise's precision. Nothing is stored or sent.
========================================================= */

import { NUMERIC, checkNumeric } from "./data/stats.js";

const ALL = new Map(NUMERIC.map((exercise) => [exercise.id, exercise]));

export function initNumeric(root = document) {
    for (const item of root.querySelectorAll("[data-numeric]")) {
        const exercise = ALL.get(item.dataset.numeric);
        if (!exercise) continue;
        const tools = item.querySelector("[data-num-tools]");
        const input = item.querySelector("input");
        const out = item.querySelector("[data-num-out]");
        tools.hidden = false;
        const check = () => {
            const result = checkNumeric(exercise, input.value);
            out.dataset.verdict = result.ok ? "correct" : "not-yet";
            out.textContent = result.ok ? "Correct." : result.reason;
            if (result.ok) item.querySelector("details").open = true;
        };
        item.querySelector("[data-num-check]").addEventListener("click", check);
        input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); check(); } });
    }
}
