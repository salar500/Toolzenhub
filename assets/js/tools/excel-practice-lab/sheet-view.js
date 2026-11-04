/* =========================================================
   ToolZen Hub
   Excel Practice Lab: showing a sheet

   gridModel(...) works out which cells to draw and what each shows. gridHtml(...) turns that into escaped HTML for the lessons,
   which are built when the site is built; gridNode(...) builds the same table with DOM methods for the exercises in the browser.
   Neither interprets a cell's text as HTML.
========================================================= */

import { parseAddress, addressOf, numberToColumn } from "./formula/parser.js";
import { escapeHTML as esc } from "../../ui/escape.js";
import { createSheet, display, isErr } from "./formula/engine.js";

const MAX_COLS = 10;
const MAX_ROWS = 14;

function dateText(serial) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function formatValue(value, format) {
    if (typeof value === "number" && format === "date") return dateText(value);
    if (typeof value === "number" && format === "percent") return `${Number((value * 100).toPrecision(12))}%`;
    return display(value);
}

/**
 * cells: { addr: raw }; marks: addresses to highlight; shownAt: { addr: text } shown instead of the cell (for example "?").
 * Returns { cols: [letters], rows: [{ n, cells: [{ addr, text, kind }] }] }.
 */
export function gridModel(cells, { marks = [], shownAt = {}, formats = {}, sheet = createSheet(cells) } = {}) {

    const addrs = [...Object.keys(cells), ...marks, ...Object.keys(shownAt)].map((a) => parseAddress(a)).filter(Boolean);

    if (addrs.length === 0) return { cols: [], rows: [] };

    const c0 = Math.min(1, ...addrs.map((a) => a.col));
    const c1 = Math.min(Math.max(...addrs.map((a) => a.col)), c0 + MAX_COLS - 1);
    const r0 = Math.min(1, ...addrs.map((a) => a.row));
    const r1 = Math.min(Math.max(...addrs.map((a) => a.row)), r0 + MAX_ROWS - 1);

    const cols = [];
    for (let c = c0; c <= c1; c += 1) cols.push(numberToColumn(c));

    const rows = [];
    for (let r = r0; r <= r1; r += 1) {
        const line = { n: r, cells: [] };
        for (let c = c0; c <= c1; c += 1) {
            const addr = addressOf(c, r);
            const v = sheet.value(addr);
            const text = addr in shownAt ? shownAt[addr] : formatValue(v, formats[addr]);
            const raw = cells[addr];
            const kind = marks.includes(addr) ? "mark" : isErr(v) ? "error" : typeof v === "number" ? "number" : "text";
            line.cells.push({ addr, text, kind, formula: typeof raw === "string" && raw.startsWith("=") ? raw : null });
        }
        rows.push(line);
    }

    return { cols, rows };

}

export function gridHtml(model, label) {

    if (model.cols.length === 0) return "";

    return `
        <div class="lx-table-wrap lx-sheet" tabindex="0" role="region" aria-label="${esc(label)}">
            <table class="lx-table">
                <thead><tr><th scope="col"><span class="lx-sr-only">Row</span></th>${model.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
                <tbody>${model.rows.map((r) => `<tr><th scope="row">${r.n}</th>${r.cells.map((c) => `<td class="lx-cell lx-cell--${c.kind}">${esc(c.text)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
        </div>`;

}

/** The same table as DOM nodes. `el` is learning/dom.js's el. */
export function gridNode(el, model, label) {

    const head = el("tr", {}, el("th", { scope: "col" }, el("span", { class: "lx-sr-only", text: "Row" })), model.cols.map((c) => el("th", { scope: "col", text: c })));
    const body = model.rows.map((r) => el("tr", {}, el("th", { scope: "row", text: String(r.n) }), r.cells.map((c) => el("td", { class: `lx-cell lx-cell--${c.kind}`, text: c.text }))));

    return el("div", { class: "lx-table-wrap lx-sheet", tabindex: "0", role: "region", "aria-label": label },
        el("table", { class: "lx-table" }, el("thead", {}, head), el("tbody", {}, body)));

}
