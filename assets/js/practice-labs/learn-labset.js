/* =========================================================
   ToolZen Hub
   Lab exercise sets inside lessons (the labset block)

   Mounts the shared lab shell (learning/lab-shell.js) on a subset of an existing lab's exercises, chosen by id, with that
   lab's own evaluator and inputs, so a lesson's practice is exactly the lab's practice (no copied engine, no copied
   exercises). Labs: the Test Design Lab, the Excel Practice Lab and the Power BI Practice Lab. Nothing is stored or sent.
========================================================= */

import { mountLab } from "../learning/lab-shell.js";

const LABS = {
    "test-design": async () => {
        const [{ set }, { evaluate, MAX_RESPONSE_CHARS }, { partitionInput }] = await Promise.all([
            import("../tools/test-design-lab/exercises.js"),
            import("../tools/test-design-lab/evaluator.js"),
            import("../tools/test-design-lab/partition-input.js")
        ]);
        const choices = (value) => { try { const v = JSON.parse(value); return Array.isArray(v) ? v : null; } catch { return null; } };
        return {
            exercises: set.exercises,
            config: {
                id: "test-design-lab",
                limit: MAX_RESPONSE_CHARS,
                inputLabel: "Your test values (whole numbers, separated by commas, spaces or line breaks)",
                rows: 3,
                input: partitionInput,
                startingOf: (ex) => (ex.mode === "ep" ? JSON.stringify(ex.samples.map(() => "")) : ""),
                isEmpty: (value, ex) => {
                    if (ex.mode !== "ep") return value.trim() === "";
                    const c = choices(value);
                    return !c || c.length !== ex.samples.length || c.some((x) => x === "");
                },
                emptyMessage: (ex) => (ex.mode === "ep" ? "Choose a partition for every value before checking." : "There is nothing to check yet. Type your test values first."),
                toolNote: "The full Test Design Lab has every exercise in one place.",
                evaluate
            }
        };
    },
    excel: async () => {
        const [{ set }, { evaluate, MAX_RESPONSE_CHARS }, { exerciseInput }] = await Promise.all([
            import("../tools/excel-practice-lab/exercises.js"),
            import("../tools/excel-practice-lab/evaluator.js"),
            import("../tools/excel-practice-lab/index.js")
        ]);
        return { exercises: set.exercises, config: { id: "excel-practice-lab", limit: MAX_RESPONSE_CHARS, inputLabel: "Your formula", input: exerciseInput, toolNote: "The full Excel Practice Lab has every exercise and a free sheet.", evaluate } };
    },
    "power-bi": async () => {
        const [{ set }, { evaluate, MAX_RESPONSE_CHARS }, { exerciseInput, KIND_LABEL }] = await Promise.all([
            import("../tools/power-bi-practice-lab/exercises.js"),
            import("../tools/power-bi-practice-lab/evaluator.js"),
            import("../tools/power-bi-practice-lab/index.js")
        ]);
        return { exercises: set.exercises, config: { id: "power-bi-practice-lab", limit: MAX_RESPONSE_CHARS, inputLabel: (ex) => KIND_LABEL[ex.kind], input: exerciseInput, toolNote: "The full Power BI Practice Lab has every exercise, the datasets and a report view.", evaluate } };
    }
};

export async function initLabsets(root = document) {
    for (const block of root.querySelectorAll("[data-labset]")) {
        const load = LABS[block.dataset.labset];
        const host = block.querySelector(".lx-app");
        if (!load || !host) continue;
        try {
            const { exercises, config } = await load();
            const ids = block.dataset.ids.split(",");
            const chosen = ids.map((id) => exercises.find((ex) => ex.id === id)).filter(Boolean);
            mountLab({ root: host, live: block.querySelector(".lx-sr-only[aria-live]"), lab: { ...config, exercises: chosen } });
            host.dataset.ready = "true";
            block.querySelector("[data-labset-loading]")?.remove();
        } catch {
            host.textContent = "These exercises could not be loaded. Reload the page to try again.";
        }
    }
}
