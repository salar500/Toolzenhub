/* =========================================================
   ToolZen Hub
   Output-prediction exercises (the predict block): the learner types what the code prints; the answer is compared
   exactly (ignoring trailing spaces). The code is not run in the page: its output was recorded from the real runtime.
========================================================= */

import { PREDICT, checkPrediction } from "./programming/predict.js";

const ALL = new Map(PREDICT.map((exercise) => [exercise.id, exercise]));

export function initPredict(root = document) {
    for (const block of root.querySelectorAll("[data-predict]")) {
        const exercise = ALL.get(block.dataset.predict);
        if (!exercise) continue;
        const tools = block.querySelector("[data-pred-tools]");
        const input = block.querySelector("textarea");
        const out = block.querySelector("[data-pred-out]");
        let tries = 0;
        tools.hidden = false;
        block.querySelector("[data-pred-check]").addEventListener("click", () => {
            const ok = checkPrediction(exercise, input.value);
            tries += 1;
            out.dataset.verdict = ok ? "correct" : "not-yet";
            out.textContent = ok ? "Correct: that is exactly what it prints." : tries === 1 ? "Not yet. Check each line, including spaces and decimal points." : `Not yet. Hint: ${exercise.hint}`;
            if (ok) block.querySelector("details").open = true;
        });
    }
}
