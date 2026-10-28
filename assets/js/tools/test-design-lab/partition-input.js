/* =========================================================
   ToolZen Hub
   Test Design Lab: the response control for partition exercises

   One labelled select per sample value. The control's value, as the
   lab shell sees it, is a JSON array of the chosen partition ids
   ("" for a value not yet placed). Returns null for an exercise that
   uses the plain text area.
========================================================= */

import { el } from "../../learning/dom.js";

export function partitionInput(exercise, value, onChange) {

    if (exercise.mode !== "ep") return null;

    let chosen;

    try {
        chosen = JSON.parse(value);
    } catch {
        chosen = null;
    }

    const valid = Array.isArray(chosen) && chosen.length === exercise.samples.length ? chosen : exercise.samples.map(() => "");
    const selects = [];

    const rows = exercise.samples.map((x, i) => {

        const id = `lx-part-${exercise.id}-${i}`;
        const select = el("select", { id, class: "lx-select" },
            el("option", { value: "", text: "Choose a partition" }),
            exercise.partitions.map((p) => el("option", { value: p.id, text: p.label }))
        );

        select.value = exercise.partitions.some((p) => p.id === valid[i]) ? valid[i] : "";
        select.addEventListener("change", () => onChange());
        selects.push(select);

        return el("div", { class: "lx-part-row" },
            el("label", { class: "lx-label", for: id, text: `Value ${x}` }),
            select
        );

    });

    const node = el("fieldset", { class: "lx-fieldset" },
        el("legend", { text: "Place each value in a partition" }),
        rows
    );

    return {
        node,
        get: () => JSON.stringify(selects.map((s) => s.value)),
        set: (v) => {
            let next;
            try { next = JSON.parse(v); } catch { next = null; }
            selects.forEach((s, i) => { s.value = Array.isArray(next) && exercise.partitions.some((p) => p.id === next[i]) ? next[i] : ""; });
        },
        focus: () => selects[0]?.focus()
    };

}
