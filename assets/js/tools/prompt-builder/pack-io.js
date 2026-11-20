/* =========================================================
   ToolZen Hub
   AI Prompt Builder: the Work Pack file, out and back in (16 D6,
   D9; moved out of index.js on 2026-11-19 so the first load stays
   within D17: it loads with the first download or opening)

   packFile writes the pack with the data comment that opens it
   again; openPack reads a downloaded pack back into the form.
   h: { P, $, form, state, answers, chosenProduct, consistency,
   note, announce, loadFormat, selectTask } from index.js.
========================================================= */

import { CONTEXT_LIMIT } from "./compiler.js";
import { getTask } from "./taxonomy.js";

/* what a Work Pack file may hold (17 §5.5); anything else is ignored and listed */
export const FILE_SCHEMA = {
    kind: "string:20", format: "int", version: "int", date: "string:10", task: "string:40", answers: "strings:8000",
    role: "string:100", experience: "string:20", depth: "string:10", product: "string:100", ownProduct: "bool",
    context: `string:${CONTEXT_LIMIT}`, consistency: "strings:300",
    profession: "string:40", tools: "strings:20", toolChoice: "string:20", otherTool: "string:100",
    prompt: "strings:60"
};

/* the file keeps everything needed to open it again; Copy never includes the data comment (16 D9) */
export function packFile(h, { withMeta, today, FORMAT }) {

    const { P, $, form, state } = h;
    const product = h.chosenProduct();
    state.version += 1;

    /* the visitor's own edit travels in the file as its own section; opening the file brings back the answers, not the edit */
    const edited = state.edit ? `

## Your edited prompt

${state.edit.text}
` : "";

    return withMeta(`${state.pack.markdown}${edited}`, {
        kind: "work-pack",
        format: FORMAT,
        version: state.version,
        date: today(),
        task: state.taskId,
        answers: Object.fromEntries(Object.entries(h.answers()).filter(([, v]) => v)),
        role: $("role").value,
        experience: $("experience").value,
        depth: $("depth").value,
        product: product ? (product.own ? product.name : product.id) : "",
        ownProduct: Boolean(product?.own),
        context: $("context-field").hidden ? "" : $("project").value,
        consistency: Object.fromEntries(Object.entries(h.consistency()).filter(([, v]) => v)),
        profession: state.profession,
        ...(state.method ? { prompt: state.guide.promptState(P) } : {}),
        ...(state.guide && !$("tools").hidden ? state.guide.toolState(P, form, state.taskId) : {})
    });

}

/* open a saved Work Pack (16 D6, D9) */
export async function openPack(h) {

    const { $, state } = h;
    const error = (text) => {
        h.note("open-error", text);
        h.announce(text, 0);
    };

    let text = $("open-text").value;
    const file = $("open-file").files?.[0];
    let format;
    try {
        format = await h.loadFormat();
    } catch {
        return error("Opening a pack could not be loaded. Check your connection and try again.");
    }
    const { readFile, readMeta, pick } = format;

    if (file) {
        const read = await readFile(file);
        if (read.error) return error(read.error);
        text = read.text;
    }

    if (!text.trim()) return error("Choose a Work Pack file or paste its text first.");

    const { meta, error: problem } = readMeta(text);
    if (problem) return error(problem === "none" ? "This is not a Work Pack file: it has no ToolZen Hub data at its end. Only a pack downloaded from this page can be opened." : problem);

    const { value, ignored } = pick(meta, FILE_SCHEMA);
    if (value.kind !== "work-pack") return error("This file is not a Work Pack. A context pack opens under Project context pack, below the questions.");
    if (!getTask(value.task)) return error(`This pack is for a task that is no longer offered: ${String(value.task ?? "none").slice(0, 40)}.`);

    h.note("open-error", "");
    state.version = value.version ?? 1;
    state.profession = value.profession ?? "";
    const message = `Opened "${getTask(value.task).title}", version ${state.version}${value.date ? ` of ${value.date}` : ""}.${ignored.length ? ` Ignored: ${ignored.join(", ")}.` : ""}`;

    await h.selectTask(value.task, { ...value, more: true, message });
    h.note("suggestion", message);
    $("open").open = false;

}
