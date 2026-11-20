/* =========================================================
   ToolZen Hub
   Structured-output exercises (the schema block): the learner writes the JSON an AI system should return; ai/structured.js
   parses it, validates it against the schema and checks the expected values. Nothing is stored or sent.
========================================================= */

import { STRUCTURED, checkStructured } from "./ai/structured.js";

const ALL = new Map(STRUCTURED.map((exercise) => [exercise.id, exercise]));

export function initSchema(root = document) {
    for (const block of root.querySelectorAll("[data-schema]")) {
        const exercise = ALL.get(block.dataset.schema);
        if (!exercise) continue;
        const tools = block.querySelector("[data-schema-tools]");
        const input = block.querySelector("textarea");
        const out = block.querySelector("[data-schema-out]");
        tools.hidden = false;
        block.querySelector("[data-schema-check]").addEventListener("click", () => {
            const r = checkStructured(exercise, input.value);
            out.replaceChildren();
            out.dataset.verdict = r.ok ? "correct" : "not-yet";
            const head = document.createElement("p");
            head.textContent = r.syntax ?? (r.ok ? "Valid against the schema, with the right values." : "Not yet:");
            out.append(head);
            const problems = [...r.schemaErrors.map((e) => `${e.path} ${e.message}.`), ...r.wrongValues.map((w) => `${w.path} is ${w.got === undefined ? "missing" : JSON.stringify(w.got)}; read the input again.`)];
            if (problems.length) {
                const ul = document.createElement("ul");
                ul.className = "learn-rubric";
                for (const text of problems) { const li = document.createElement("li"); li.dataset.met = "false"; li.textContent = text; ul.append(li); }
                out.append(ul);
            }
            if (r.ok) block.querySelector("details").open = true;
        });
    }
}
