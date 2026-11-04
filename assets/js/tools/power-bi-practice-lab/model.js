/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: relationships

   The learner writes relationships as  Many[Column] -> One[Column]  (add the word inactive for an inactive one). The checker works
   from the data: the "one" column must hold unique, non-blank values, both columns must be of the same kind, and the tables must be
   real. This is the part of Power BI's model view that can be checked by arithmetic; the diagram itself is not simulated.
========================================================= */

export class ModelError extends Error {
    constructor(message, line) {
        super(message);
        this.line = line;
    }
}

const isBlank = (v) => v === null || v === undefined || v === "";
const kindOf = (v) => (typeof v === "number" ? "number" : "text");

function findTable(tables, name) {
    return Object.keys(tables).find((t) => t === name) ?? Object.keys(tables).find((t) => t.toLowerCase() === name.toLowerCase());
}

function findColumn(table, name) {
    const hit = table.columns.find((c) => c === name) ?? table.columns.find((c) => c.toLowerCase() === name.toLowerCase());
    return hit === undefined ? -1 : table.columns.indexOf(hit);
}

const LINE = /^\s*([A-Za-z_][\w ]*)\[([^\]]+)\]\s*->\s*([A-Za-z_][\w ]*)\[([^\]]+)\]\s*(inactive)?\s*$/i;

/** @returns {{ relationships: {from, to, active}[], notes: string[] }} or throws ModelError */
export function checkRelationships(tables, script) {

    const out = [];
    const notes = [];
    const lines = script.split(/\r?\n/).map((t, i) => ({ t: t.trim(), n: i + 1 })).filter((l) => l.t !== "" && !l.t.startsWith("//"));

    if (lines.length > 30) throw new ModelError("More than 30 relationships.", 0);

    for (const { t, n } of lines) {

        if (/<-/.test(t)) throw new ModelError("Write the arrow as ->, from the many side to the one side.", n);
        const m = t.match(LINE);
        if (!m) throw new ModelError("Write each relationship as Table[Column] -> Table[Column], for example Orders[ProductID] -> Products[ProductID].", n);

        const [, a, ac, b, bc, inactive] = m;
        const ta = findTable(tables, a.trim());
        const tb = findTable(tables, b.trim());
        if (!ta) throw new ModelError(`There is no table named ${a.trim()}. The tables are: ${Object.keys(tables).join(", ")}.`, n);
        if (!tb) throw new ModelError(`There is no table named ${b.trim()}. The tables are: ${Object.keys(tables).join(", ")}.`, n);
        if (ta === tb) throw new ModelError("A relationship connects two different tables.", n);
        const ia = findColumn(tables[ta], ac.trim());
        const ib = findColumn(tables[tb], bc.trim());
        if (ia < 0) throw new ModelError(`The table ${ta} has no column named ${ac.trim()}. Its columns are: ${tables[ta].columns.join(", ")}.`, n);
        if (ib < 0) throw new ModelError(`The table ${tb} has no column named ${bc.trim()}. Its columns are: ${tables[tb].columns.join(", ")}.`, n);

        const left = tables[ta].columns[ia];
        const right = tables[tb].columns[ib];

        /* the "one" side must be unique and complete */
        const seen = new Map();
        for (const row of tables[tb].rows) {
            const v = row[ib];
            if (isBlank(v)) throw new ModelError(`${tb}[${right}] has blank values, so it cannot be the "one" side. A key must be filled in on every row.`, n);
            seen.set(v, (seen.get(v) ?? 0) + 1);
        }
        const dup = [...seen].find(([, k]) => k > 1);
        if (dup) {
            const leftUnique = new Set(tables[ta].rows.map((r) => r[ia])).size === tables[ta].rows.length;
            throw new ModelError(`${tb}[${right}] is not unique: ${JSON.stringify(dup[0])} appears ${dup[1]} times, so it cannot be the "one" side of a relationship.${leftUnique ? ` ${ta}[${left}] is unique. Did you write the arrow the wrong way round? It goes from the many side to the one side.` : ""}`, n);
        }

        const kinds = new Set([...tables[ta].rows.map((r) => r[ia]).filter((v) => !isBlank(v)).map(kindOf), ...tables[tb].rows.map((r) => r[ib]).map(kindOf)]);
        if (kinds.size > 1) throw new ModelError(`${ta}[${left}] and ${tb}[${right}] hold different kinds of value (one number, one text). Change the type of one of them in the query steps first, or they will never match.`, n);

        const orphans = [...new Set(tables[ta].rows.map((r) => r[ia]).filter((v) => !isBlank(v) && !seen.has(v)))];
        if (orphans.length) notes.push(`${ta}[${left}] has ${orphans.length} value${orphans.length === 1 ? "" : "s"} with no match in ${tb}[${right}] (${orphans.slice(0, 3).map((v) => JSON.stringify(v)).join(", ")}). Those rows would appear under a blank member.`);

        out.push({ from: `${ta}[${left}]`, to: `${tb}[${right}]`, active: !inactive });
    }

    /* only one active relationship between two tables */
    const pair = new Map();
    for (const r of out) {
        if (!r.active) continue;
        const key = [r.from.split("[")[0], r.to.split("[")[0]].sort().join("|");
        pair.set(key, (pair.get(key) ?? 0) + 1);
    }
    for (const [key, k] of pair) {
        if (k > 1) throw new ModelError(`There are ${k} active relationships between ${key.replace("|", " and ")}. Only one can be active; mark the others inactive.`, 0);
    }

    return { relationships: out, notes };

}

const same = (a, b) => a.from === b.from && a.to === b.to && a.active === b.active;

/** Compare with the expected set; returns { missing, extra } as lists of descriptions that do not give the answer away. */
export function compareRelationships(got, want, tables) {

    const extra = got.filter((g) => !want.some((w) => same(g, w)));
    const missing = want.filter((w) => !got.some((g) => same(g, w)));
    const findings = [];

    for (const g of extra) {
        const sameLink = want.find((w) => w.from === g.from && w.to === g.to);
        if (sameLink) findings.push(`The relationship ${g.from} -> ${g.to} is ${g.active ? "active" : "inactive"}, but it should be ${sameLink.active ? "active" : "inactive"}.`);
        else findings.push(`The relationship ${g.from} -> ${g.to} is not part of this model.`);
    }

    const connected = new Set(got.flatMap((g) => [g.from.split("[")[0], g.to.split("[")[0]]));
    for (const t of Object.keys(tables)) {
        if (!connected.has(t) && missing.length) findings.push(`The table ${t} is not connected to any other table.`);
    }
    if (missing.length && findings.length === 0) findings.push(`${missing.length} relationship${missing.length === 1 ? " is" : "s are"} still missing.`);
    else if (missing.length && !findings.some((f) => f.includes("still missing"))) findings.push(`${missing.length} relationship${missing.length === 1 ? " is" : "s are"} missing or different.`);

    return { ok: extra.length === 0 && missing.length === 0, findings };

}
