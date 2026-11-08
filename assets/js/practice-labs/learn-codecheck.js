/* =========================================================
   ToolZen Hub
   Code-check exercises (the codecheck block): the learner writes Playwright test code; automation/code-check.js reads it
   against the exercise's rules and lists each rule as met or missing. The code is not run (the page says so). Nothing is
   stored or sent; text is drawn with DOM methods only.
========================================================= */

import { checkCode } from "./automation/code-check.js";
import { CODE } from "./playwright/code.js";

const ALL = new Map(CODE.map((exercise) => [exercise.id, exercise]));

export function initCodeChecks(root = document) {
    for (const block of root.querySelectorAll("[data-codecheck]")) {
        const exercise = ALL.get(block.dataset.codecheck);
        if (!exercise) continue;
        const tools = block.querySelector("[data-code-tools]");
        const input = block.querySelector("textarea");
        const out = block.querySelector("[data-code-out]");
        const model = block.querySelector("details");
        tools.hidden = false;
        block.querySelector("[data-code-check]").addEventListener("click", () => {
            const result = checkCode(exercise, input.value);
            out.replaceChildren();
            out.dataset.verdict = result.met === result.total ? "correct" : "not-yet";
            const head = document.createElement("p");
            head.textContent = result.met === result.total ? "All checks met. Compare with the model below; run it in a real project to see it pass." : `${result.met} of ${result.total} checks met.`;
            const ul = document.createElement("ul");
            ul.className = "learn-rubric";
            for (const item of result.items) {
                const li = document.createElement("li");
                li.dataset.met = String(item.met);
                const strong = document.createElement("strong");
                strong.textContent = `${item.met ? "Met" : "Missing"}: ${item.label}.`;
                li.append(strong);
                if (!item.met) li.append(document.createTextNode(` ${item.advice}`));
                ul.append(li);
            }
            out.append(head, ul);
            model.open = true;
        });
        block.querySelector("[data-code-reset]").addEventListener("click", () => { input.value = exercise.starter; out.replaceChildren(); delete out.dataset.verdict; });
    }
}
