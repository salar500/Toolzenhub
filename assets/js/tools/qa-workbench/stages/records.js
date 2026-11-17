/* =========================================================
   ToolZen Hub
   QA Workbench: the record actions several stages share (retire,
   restore, delete, record a run, CSV downloads). Loaded with the
   stages that list records, not with the first view (QD24).
========================================================= */

import * as M from "../model.js";
import { redrawTo } from "./ui.js";

async function change(ctx, result, message) {

    if (result.errors) return ctx.announce(result.errors.form);
    ctx.changed();
    await ctx.redraw();
    ctx.announce(message);

}

function saveBlob(text, name, type) {

    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

}

export const records = {

    retire: (ctx, id) => change(ctx, M.setState(ctx.s.project, id, "retired"), `${id} retired. It is kept, and left out of every count.`),
    restore: (ctx, id) => change(ctx, M.setState(ctx.s.project, id, "active"), `${id} restored.`),

    delete: async (ctx, id) => {
        if (!window.confirm(`Delete ${id}? ${id.startsWith("REQ") ? "Its criteria are deleted with it. " : ""}This cannot be undone, and the id is not used again.`)) return;
        await change(ctx, M.deleteRecord(ctx.s.project, id), `${id} deleted.`);
        ctx.$("stage-title")?.focus();
    },

    "run-case": (ctx, id) => {
        ctx.s.stage = "execution";
        ctx.ui.editing = { kind: "run" };
        ctx.ui.runFor = id;
        return redrawTo(ctx, "form[data-form=run] input[name=status]");
    },

    /* the byte-order mark lets Excel read ₹ and accented text as UTF-8 */
    csv: async (ctx, kind) => {
        const [{ csvFiles }, { today, slug }] = await Promise.all([import("../report.js"), import("../../ai-tools/common/pack-format.js")]);
        const name = `qa-${kind}-${slug(ctx.s.project.project.name)}-${today()}.csv`;
        saveBlob(`\uFEFF${csvFiles(ctx.s.project, { build: ctx.s.build })[kind]}`, name, "text/csv;charset=utf-8");
        ctx.announce(`Downloaded ${name}.`);
    }

};
