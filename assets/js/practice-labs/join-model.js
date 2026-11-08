/* =========================================================
   ToolZen Hub
   JOIN visualizer: the model (pure, no DOM)

   Two small tables and the four join types, worked out step by step so the page can show which rows are compared and
   which pairs reach the result. The page also runs the same SQL in SQLite (sql.js) and compares the two, so this model is
   checked against a real engine every time it is shown. Row order is not part of a join's meaning (no ORDER BY), so the
   comparison is by content.
========================================================= */

export const JOIN_TYPES = Object.freeze(["INNER", "LEFT", "RIGHT", "FULL"]);

export const PRESET = Object.freeze({
    left: { name: "customers", alias: "c", key: "id", columns: ["id", "name", "city"], rows: [[1, "Asha", "Pune"], [2, "Bilal", "Mumbai"], [3, "Chitra", "Chennai"], [4, "Divya", "Kochi"]] },
    right: { name: "orders", alias: "o", key: "customer_id", columns: ["id", "customer_id", "order_date"], rows: [[101, 1, "2024-01-05"], [102, 1, "2024-02-02"], [103, 3, "2024-02-10"], [104, 7, "2024-03-01"]] },
    /* what the result shows */
    select: [["left", "name"], ["right", "id", "order_id"]]
});

const valueOf = (table, row, column) => row[table.columns.indexOf(column)];

export function sqlFor(type, preset = PRESET) {
    const { left, right } = preset;
    const cols = preset.select.map(([side, column, as]) => `${(side === "left" ? left : right).alias}.${column}${as ? ` AS ${as}` : ""}`).join(", ");
    const kind = type === "FULL" ? "FULL OUTER JOIN" : type === "INNER" ? "INNER JOIN" : `${type} JOIN`;
    return `SELECT ${cols}\nFROM ${left.name} ${left.alias}\n${kind} ${right.name} ${right.alias} ON ${right.alias}.${right.key} = ${left.alias}.${left.key};`;
}

/* the SQL that creates the two tables, for the real-engine check */
export function setupFor(preset = PRESET) {
    return [preset.left, preset.right].flatMap((table) => [
        `CREATE TABLE ${table.name} (${table.columns.map((c) => `${c} ${typeof table.rows[0][table.columns.indexOf(c)] === "number" ? "INTEGER" : "TEXT"}`).join(", ")});`,
        `INSERT INTO ${table.name} VALUES ${table.rows.map((row) => `(${row.map((v) => (typeof v === "number" ? v : `'${String(v).replace(/'/g, "''")}'`)).join(", ")})`).join(", ")};`
    ]);
}

const project = (preset, leftRow, rightRow) => preset.select.map(([side, column]) => {
    const table = side === "left" ? preset.left : preset.right;
    const row = side === "left" ? leftRow : rightRow;
    return row ? valueOf(table, row, column) : null;
});

/**
 * The join worked out in steps. Each step looks at one row of the driving table:
 *   { side: "left"|"right", index, matches: [indexes in the other table], added: [result rows], note }
 * FULL adds a final step for the right rows that matched nothing. Returns { steps, rows }.
 */
export function joinSteps(type, preset = PRESET) {

    const { left, right } = preset;
    const lk = (row) => valueOf(left, row, left.key);
    const rk = (row) => valueOf(right, row, right.key);
    const steps = [];
    const rows = [];

    if (type === "RIGHT") {
        right.rows.forEach((rrow, index) => {
            const matches = left.rows.map((lrow, i) => (lk(lrow) === rk(rrow) ? i : -1)).filter((i) => i >= 0);
            const added = matches.length ? matches.map((i) => project(preset, left.rows[i], rrow)) : [project(preset, null, rrow)];
            rows.push(...added);
            steps.push({ side: "right", index, matches, added, note: matches.length ? `${right.name} row ${rk(rrow)} matches ${matches.length} ${left.name} row${matches.length > 1 ? "s" : ""}.` : `${right.name} row with ${right.key} ${rk(rrow)} matches nothing; RIGHT JOIN keeps it, with NULL for the ${left.name} columns.` });
        });
        return { steps, rows };
    }

    const matchedRight = new Set();

    left.rows.forEach((lrow, index) => {
        const matches = right.rows.map((rrow, i) => (rk(rrow) === lk(lrow) ? i : -1)).filter((i) => i >= 0);
        matches.forEach((i) => matchedRight.add(i));
        const keep = matches.length > 0 || type === "LEFT" || type === "FULL";
        const added = matches.length ? matches.map((i) => project(preset, lrow, right.rows[i])) : keep ? [project(preset, lrow, null)] : [];
        rows.push(...added);
        const name = valueOf(left, lrow, "name") ?? lk(lrow);
        steps.push({ side: "left", index, matches, added, note: matches.length
            ? `${name} (${left.key} ${lk(lrow)}) matches ${matches.length} order${matches.length > 1 ? "s" : ""}: ${matches.length} result row${matches.length > 1 ? "s" : ""}.`
            : keep ? `${name} has no orders. ${type} JOIN keeps the customer, with NULL for the order columns.` : `${name} has no orders. INNER JOIN drops this customer.` });
    });

    if (type === "FULL") {
        const unmatched = right.rows.map((_, i) => i).filter((i) => !matchedRight.has(i));
        const added = unmatched.map((i) => project(preset, null, right.rows[i]));
        rows.push(...added);
        steps.push({ side: "right", index: unmatched[0] ?? -1, matches: [], added, unmatched, note: unmatched.length
            ? `Finally, ${right.name} rows that matched no customer (${unmatched.map((i) => valueOf(right, right.rows[i], "id")).join(", ")}) are added, with NULL for the customer columns.`
            : `Every ${right.name} row matched a customer.` });
    }

    return { steps, rows };

}

/** true when two result sets hold the same rows, in any order */
export function sameRows(a, b) {
    const key = (rows) => rows.map((r) => JSON.stringify(r.map((v) => (v === undefined ? null : v)))).sort().join("\n");
    return a.length === b.length && key(a) === key(b);
}
