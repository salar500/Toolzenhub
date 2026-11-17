/* =========================================================
   ToolZen Hub
   QA Workbench, stage 7: Report. Written from the records by
   ../report.js; it states its scope and keeps mapped, executed and
   passed apart. A release decision appears only in the tester's
   own words. Markdown download, copy, and the four CSVs.
========================================================= */

import { stamp } from "../core.js";
import { buildsOf } from "../metrics.js";
import { buildReport } from "../report.js";
import { downloadText, today, slug } from "../../ai-tools/common/pack-format.js";
import { P, btn, heading, note, grid, scope, textInput, textArea } from "./ui.js";
import { records } from "./records.js";

const text = (ctx) => buildReport(ctx.s.project, { build: ctx.s.build, decision: ctx.s.decision, notes: ctx.s.notes, generatedOn: stamp().replace("T", " ") });

export function html(ctx) {

    const { s } = ctx;
    const builds = buildsOf(s.project);
    if (s.build && !builds.includes(s.build)) s.build = "";

    return `${heading("QA report")}${note("Written from your records. It states its scope and keeps mapped, executed and passed apart. A release decision appears only if you write it.")}${grid(
        scope(s, builds),
        textInput("decision", "Your release decision (optional)", s.decision, { hint: "Your own words, for example \"Go, with DEF-004 accepted by the product owner\"." }),
        textArea("notes", "Notes for the report (optional)", s.notes, { hint: "Risks, limitations, what was not tested. Kept while the page is open; not saved in the project file." })
    )}<div class="qa-actions">${btn("report-download", "Download report", { primary: true })}${btn("report-copy", "Copy report")}${btn("csv", "Test cases CSV", { id: "test-cases" })}${btn("csv", "Test runs CSV", { id: "runs" })}${btn("csv", "Defects CSV", { id: "defects" })}${btn("csv", "Traceability CSV", { id: "traceability" })}</div><pre id="${P}-report" class="ai-bridge__text ${P}-report" tabindex="0" aria-label="Report preview"></pre>`;

}

export function after(ctx) {

    ctx.$("report").textContent = text(ctx);

}

let timer = 0;

export function onInput(ctx, el) {

    if (el.name !== "decision" && el.name !== "notes") return;
    ctx.s[el.name] = el.value;
    clearTimeout(timer);
    timer = setTimeout(() => after(ctx), 300);

}

export const actions = {

    ...records,

    "report-download": (ctx) => {
        const name = `qa-report-${slug(ctx.s.project.project.name)}-${today()}.md`;
        downloadText(text(ctx), name);
        ctx.announce(`Downloaded ${name}.`);
    },

    "report-copy": async (ctx) => {
        const pre = ctx.$("report");
        try {
            await navigator.clipboard.writeText(pre.textContent);
            ctx.announce("Report copied.");
        } catch {
            const range = document.createRange();
            range.selectNodeContents(pre);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            pre.focus();
            ctx.announce("Copying was refused by the browser. The report is selected: press Ctrl+C or Cmd+C.");
        }
    }

};
