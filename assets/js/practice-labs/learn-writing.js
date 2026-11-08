/* =========================================================
   ToolZen Hub
   Practice Labs writing labs (test cases, scenarios, requirement questions)

   Reads the learner's fields, runs the rubric (writing-check.js) and lists each item as met or missing with advice. The
   model answer opens after the first check. "Copy as text" puts the learner's own answer on the clipboard so they can
   keep it. Nothing is stored or sent; the text is drawn with DOM methods only.
========================================================= */

import { checkWriting } from "./writing-check.js";
import { WRITING } from "./manual-testing/writing.js";
import { AI_WRITING } from "./ai/writing.js";
import { WRITING_2 } from "./manual-testing/writing-2.js";

const ALL = new Map([...WRITING, ...AI_WRITING, ...WRITING_2].map((exercise) => [exercise.id, exercise]));

export function initLearnWriting(root = document) {

    for (const block of root.querySelectorAll("[data-writing]")) {

        const exercise = ALL.get(block.dataset.writing);
        if (!exercise) continue;

        const fields = block.querySelector(".learn-write__fields");
        const out = block.querySelector("[data-write-out]");
        const model = block.querySelector("[data-write-model]");
        fields.hidden = false;

        const answer = () => Object.fromEntries([...block.querySelectorAll("[data-field]")].map((el) => [el.dataset.field, el.value]));

        block.querySelector("[data-write-check]").addEventListener("click", () => {
            const result = checkWriting(exercise, answer());
            out.replaceChildren();
            out.dataset.verdict = result.met === result.total ? "correct" : "not-yet";
            const head = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = result.met === result.total ? "All rubric items met. " : `${result.met} of ${result.total} rubric items met. `;
            head.append(strong, document.createTextNode(result.met === result.total ? "Compare with the model answer below: wording can differ and still be right." : "Improve the missing items, then check again."));
            const ul = document.createElement("ul");
            ul.className = "learn-rubric";
            for (const item of result.items) {
                const li = document.createElement("li");
                li.dataset.met = String(item.met);
                const label = document.createElement("strong");
                label.textContent = `${item.met ? "Met" : "Missing"}: ${item.label}.`;
                li.append(label);
                if (!item.met) li.append(document.createTextNode(` ${item.advice}`));
                ul.append(li);
            }
            out.append(head, ul);
            if (model) model.open = true;
        });

        block.querySelector("[data-write-export]").addEventListener("click", async (event) => {
            const text = exercise.fields.map((f) => `${f.label}:\n${answer()[f.name] ?? ""}`).join("\n\n");
            try {
                await navigator.clipboard.writeText(text);
                event.target.textContent = "Copied";
            } catch {
                event.target.textContent = "Copy not allowed here";
            }
            setTimeout(() => { event.target.textContent = "Copy as text"; }, 2000);
        });

    }

}
