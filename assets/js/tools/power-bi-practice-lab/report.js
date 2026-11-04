/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: the report preview

   Draws a bar chart of a real measure, evaluated by the lab's DAX engine on the Sakhi Stores model, for each value of a grouping
   column, and the same numbers as a table. It is a small model of the last step of the Power BI workflow, not Power BI's report
   canvas: there are no visual settings, cross-filtering or themes.
========================================================= */

import { escapeHTML as esc } from "../../ui/escape.js";
import { evaluateMeasure, formatValue } from "./dax/engine.js";
import { SAKHI } from "./datasets.js";

export const REPORT_MEASURES = [
    { id: "total-sales", label: "Total Sales", script: "Total Sales = SUM(Orders[Amount])" },
    { id: "orders", label: "Orders", script: "Orders = COUNTROWS(Orders)" },
    { id: "aov", label: "Average Order Value", script: "Average Order Value = DIVIDE(SUM(Orders[Amount]), COUNTROWS(Orders))" },
    { id: "customers", label: "Customers", script: "Customers = DISTINCTCOUNT(Orders[CustomerID])" },
    { id: "ytd", label: "Sales YTD", script: "Sales YTD = TOTALYTD(SUM(Orders[Amount]), Date[Date])" },
    { id: "sply", label: "Sales Last Year", script: "Sales Last Year = CALCULATE(SUM(Orders[Amount]), SAMEPERIODLASTYEAR(Date[Date]))" }
];

export const REPORT_GROUPS = [
    { id: "category", label: "Category", table: "Products", col: "Category" },
    { id: "city", label: "City", table: "Customers", col: "City" },
    { id: "month", label: "Month", table: "Date", col: "YearMonth", months: true }
];

function distinct(group) {
    const t = SAKHI.tables[group.table];
    const ci = t.columns.indexOf(group.col);
    const values = [...new Set(t.rows.map((r) => r[ci]))].sort();
    if (!group.months) return values;
    // only months that have orders
    const used = new Set(SAKHI.tables.Orders.rows.map((r) => r[1].slice(0, 7)));
    return values.filter((v) => used.has(v));
}

/** @returns {{ rows: { label, value }[], error?: string }} */
export function reportRows(measureId, groupId) {

    const measure = REPORT_MEASURES.find((m) => m.id === measureId);
    const group = REPORT_GROUPS.find((g) => g.id === groupId);
    if (!measure || !group) return { rows: [], error: "Choose a measure and a grouping." };

    const rows = [];
    for (const v of distinct(group)) {
        const r = evaluateMeasure(SAKHI, measure.script, { target: measure.label, context: [{ table: group.table, col: group.col, values: [v] }] });
        if (r.error) return { rows: [], error: r.error };
        rows.push({ label: v, value: r.value });
    }
    return { rows };
}

/** An accessible bar chart as SVG text, with every value written out. */
export function barChartSvg(rows, title) {

    const width = 560;
    const left = 110;
    const barH = 22;
    const gap = 10;
    const top = 8;
    const max = Math.max(1, ...rows.map((r) => (typeof r.value === "number" ? r.value : 0)));
    const height = top + rows.length * (barH + gap);

    const bars = rows.map((r, i) => {
        const y = top + i * (barH + gap);
        const w = typeof r.value === "number" ? Math.max(0, (r.value / max) * (width - left - 90)) : 0;
        return `
            <text x="${left - 8}" y="${y + barH / 2 + 4}" text-anchor="end" class="lx-chart__label">${esc(r.label)}</text>
            <rect x="${left}" y="${y}" width="${w.toFixed(1)}" height="${barH}" class="lx-chart__bar"></rect>
            <text x="${left + w + 6}" y="${y + barH / 2 + 4}" class="lx-chart__value">${esc(r.value === null ? "blank" : formatValue(Math.round(r.value * 100) / 100))}</text>`;
    }).join("");

    return `<svg class="lx-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(title)}</title>${bars}</svg>`;

}
