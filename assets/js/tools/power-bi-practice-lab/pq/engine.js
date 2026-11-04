/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: query steps

   An educational subset of Power Query's transformations, applied to a table with plain JavaScript. The learner writes one step per
   line (for example: trim Name). The result is a real calculation on the learner's table, but this is not the M language, there are
   no connectors, and the step names only mirror Power Query's menus. Nothing here evaluates text as code.

   A table is { columns: string[], rows: any[][] }; a cell is a string, a number, null (blank) or ERROR.
========================================================= */

export const MAX_STEPS = 40;
export const MAX_ROWS = 2000;
export const MAX_SCRIPT_CHARS = 3000;

export const ERROR = Object.freeze({ error: true });
export const isError = (v) => v === ERROR;

export class StepError extends Error {
    constructor(message, line) {
        super(message);
        this.line = line;
    }
}

export const STEPS = [
    "trim <column>", "clean <column>", "uppercase <column>", "lowercase <column>", "proper <column>",
    "change type <column> as number | text | date",
    "remove duplicates [<column>, ...]", "remove blanks <column>", "remove errors <column>",
    "replace <column> \"find\" \"with\"", "replace blanks <column> \"with\"",
    "filter <column> = | <> | > | >= | < | <= <value>",
    "split <column> by \"delimiter\" into <name>, <name>",
    "merge <column>, <column> with \"separator\" as <name>",
    "fill down <column>", "rename <old> to <new>",
    "remove columns <column>, ...", "keep columns <column>, ...",
    "add column <name> = <column> + | - | * | / <column or number>",
    "group by <column> sum | average | min | max | count <column> as <name>",
    "append <Table>", "merge queries <Table> on <column> = <column> add <column>",
    "unpivot <column>, <column> into <attribute>, <value>", "sort <column> ascending | descending"
];

/* ---------- reading one line ---------- */

function tokenise(line, n) {
    const out = [];
    let i = 0;
    while (i < line.length) {
        const c = line[i];
        if (c === " " || c === "\t") { i += 1; continue; }
        if (c === "\"") {
            let j = i + 1;
            let text = "";
            while (j < line.length && line[j] !== "\"") { text += line[j]; j += 1; }
            if (j >= line.length) throw new StepError("A quote was opened but not closed.", n);
            out.push({ type: "text", value: text });
            i = j + 1;
            continue;
        }
        if (c === ",") { out.push({ type: "comma" }); i += 1; continue; }
        if (c === "[") {
            const j = line.indexOf("]", i);
            if (j < 0) throw new StepError("A square bracket was opened but not closed.", n);
            out.push({ type: "word", value: line.slice(i + 1, j), quoted: true });
            i = j + 1;
            continue;
        }
        let j = i;
        while (j < line.length && !" \t,\"".includes(line[j])) j += 1;
        out.push({ type: "word", value: line.slice(i, j) });
        i = j;
    }
    return out;
}

const norm = (s) => s.toLowerCase();

/* a column name may be one word, or in [square brackets] when it has spaces */
function takeColumn(table, toks, p, n) {
    const t = toks[p];
    if (!t || t.type !== "word") throw new StepError("A column name was expected here.", n);
    const hit = table.columns.find((c) => c === t.value) ?? table.columns.find((c) => norm(c) === norm(t.value));
    if (!hit) throw new StepError(`There is no column named "${t.value}". The columns are: ${table.columns.join(", ")}.`, n);
    return { name: hit, next: p + 1 };
}

function takeColumnList(table, toks, p, n) {
    const names = [];
    let at = p;
    for (;;) {
        const c = takeColumn(table, toks, at, n);
        names.push(c.name);
        at = c.next;
        if (toks[at]?.type === "comma") at += 1; else break;
    }
    return { names, next: at };
}

function expectWord(toks, p, word, n) {
    const t = toks[p];
    if (!t || t.type !== "word" || norm(t.value) !== word) throw new StepError(`The word "${word}" was expected here.`, n);
    return p + 1;
}

function takeText(toks, p, n, what) {
    const t = toks[p];
    if (!t || t.type !== "text") throw new StepError(`${what} must be in double quotes, for example "text".`, n);
    return t.value;
}

function takeName(toks, p, n) {
    const t = toks[p];
    if (!t || t.type !== "word") throw new StepError("A name was expected here.", n);
    return t.value;
}

function endOfLine(toks, p, n) {
    if (p < toks.length) throw new StepError("There is more text on this line than the step needs.", n);
}

/* ---------- values ---------- */

const isBlank = (v) => v === null || v === undefined || (typeof v === "string" && v.trim() === "");

export function toNumber(v) {
    if (typeof v === "number") return v;
    if (isBlank(v)) return null;
    if (typeof v !== "string") return ERROR;
    const text = v.trim().replace(/,/g, "");
    if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(text)) return ERROR;
    return Number(text);
}

function pad(n) { return String(n).padStart(2, "0"); }

/* a date is accepted as 2024-03-07 or 07/03/2024 (day first, as in India) or 7-Mar-2024; the result is the text YYYY-MM-DD */
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function toDate(v) {
    if (isBlank(v)) return null;
    if (typeof v !== "string") return ERROR;
    const text = v.trim();
    let y, m, d, hit;
    if ((hit = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) { y = +hit[1]; m = +hit[2]; d = +hit[3]; }
    else if ((hit = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) { d = +hit[1]; m = +hit[2]; y = +hit[3]; }
    else if ((hit = text.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/))) { d = +hit[1]; m = MONTHS.indexOf(hit[2].toLowerCase()) + 1; y = +hit[3]; }
    else return ERROR;
    if (m < 1 || m > 12 || d < 1) return ERROR;
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    if (d > dim) return ERROR;
    return `${y}-${pad(m)}-${pad(d)}`;
}

const asText = (v) => (isBlank(v) && v !== "" ? "" : typeof v === "number" ? String(v) : v === null || v === undefined ? "" : String(v));

function cleanText(s) { return s.replace(/[\u0000-\u001f\u007f]/g, ""); }

function proper(s) { return s.toLowerCase().replace(/(^|[^a-z0-9'])([a-z])/g, (_, a, b) => a + b.toUpperCase()); }

function cloneTable(t) { return { columns: [...t.columns], rows: t.rows.map((r) => [...r]) }; }

/* ---------- the steps ---------- */

function mapColumn(table, name, fn) {
    const i = table.columns.indexOf(name);
    for (const row of table.rows) row[i] = fn(row[i]);
}

function sameCell(a, b) { return a === b || (isBlank(a) && isBlank(b) && a === b); }

function compare(a, b) {
    if (isBlank(a) && isBlank(b)) return 0;
    if (isBlank(a)) return 1;
    if (isBlank(b)) return -1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "en", { sensitivity: "base" }) || (a < b ? -1 : a > b ? 1 : 0);
}

function uniqueName(table, wanted, n) {
    if (table.columns.includes(wanted)) throw new StepError(`A column named "${wanted}" already exists.`, n);
}

export function applyStep(table, line, n, others = {}) {

    const toks = tokenise(line, n);
    if (toks.length === 0) return table;
    const t = cloneTable(table);
    const w0 = norm(toks[0].value ?? "");
    const w1 = norm(toks[1]?.value ?? "");

    const withColumn = (fn) => {
        const c = takeColumn(t, toks, 1, n);
        endOfLine(toks, c.next, n);
        mapColumn(t, c.name, fn);
        return t;
    };

    switch (w0) {

        case "trim": return withColumn((v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v));
        case "clean": return withColumn((v) => (typeof v === "string" ? cleanText(v) : v));
        case "uppercase": return withColumn((v) => (typeof v === "string" ? v.toUpperCase() : v));
        case "lowercase": return withColumn((v) => (typeof v === "string" ? v.toLowerCase() : v));
        case "proper": return withColumn((v) => (typeof v === "string" ? proper(v) : v));

        case "change": {
            let p = expectWord(toks, 1, "type", n);
            const c = takeColumn(t, toks, p, n);
            p = expectWord(toks, c.next, "as", n);
            const kind = norm(takeName(toks, p, n));
            endOfLine(toks, p + 1, n);
            if (kind === "number") mapColumn(t, c.name, toNumber);
            else if (kind === "text") mapColumn(t, c.name, (v) => (isBlank(v) && v === null ? null : asText(v)));
            else if (kind === "date") mapColumn(t, c.name, toDate);
            else throw new StepError(`The type "${kind}" is not one of number, text or date.`, n);
            return t;
        }

        case "remove": {
            if (w1 === "duplicates") {
                let names = t.columns;
                if (toks.length > 2) {
                    const list = takeColumnList(t, toks, 2, n);
                    endOfLine(toks, list.next, n);
                    names = list.names;
                }
                const idx = names.map((c) => t.columns.indexOf(c));
                const seen = new Set();
                t.rows = t.rows.filter((r) => {
                    const key = JSON.stringify(idx.map((i) => (r[i] === ERROR ? "\u0000error" : r[i])));
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                return t;
            }
            if (w1 === "blanks") {
                const c = takeColumn(t, toks, 2, n);
                endOfLine(toks, c.next, n);
                const i = t.columns.indexOf(c.name);
                t.rows = t.rows.filter((r) => !isBlank(r[i]));
                return t;
            }
            if (w1 === "errors") {
                const c = takeColumn(t, toks, 2, n);
                endOfLine(toks, c.next, n);
                const i = t.columns.indexOf(c.name);
                t.rows = t.rows.filter((r) => r[i] !== ERROR);
                return t;
            }
            if (w1 === "columns") {
                const list = takeColumnList(t, toks, 2, n);
                endOfLine(toks, list.next, n);
                const keep = t.columns.map((c, i) => [c, i]).filter(([c]) => !list.names.includes(c)).map(([, i]) => i);
                if (keep.length === 0) throw new StepError("That would remove every column.", n);
                return { columns: keep.map((i) => t.columns[i]), rows: t.rows.map((r) => keep.map((i) => r[i])) };
            }
            throw new StepError("After remove, use duplicates, blanks, errors or columns.", n);
        }

        case "keep": {
            expectWord(toks, 0 + 1, "columns", n);
            const list = takeColumnList(t, toks, 2, n);
            endOfLine(toks, list.next, n);
            const idx = list.names.map((c) => t.columns.indexOf(c));
            return { columns: list.names, rows: t.rows.map((r) => idx.map((i) => r[i])) };
        }

        case "replace": {
            if (w1 === "blanks") {
                const c = takeColumn(t, toks, 2, n);
                const to = takeText(toks, c.next, n, "The replacement");
                endOfLine(toks, c.next + 1, n);
                mapColumn(t, c.name, (v) => (isBlank(v) ? to : v));
                return t;
            }
            const c = takeColumn(t, toks, 1, n);
            const from = takeText(toks, c.next, n, "The text to find");
            const to = takeText(toks, c.next + 1, n, "The replacement");
            endOfLine(toks, c.next + 2, n);
            mapColumn(t, c.name, (v) => (typeof v === "string" ? (v === from ? to : v) : v));
            return t;
        }

        case "filter": {
            const c = takeColumn(t, toks, 1, n);
            const op = toks[c.next]?.value;
            if (!["=", "<>", ">", ">=", "<", "<="].includes(op)) throw new StepError("Use one of = <> > >= < <= after the column.", n);
            const vt = toks[c.next + 1];
            if (!vt) throw new StepError("A value to compare with was expected here.", n);
            endOfLine(toks, c.next + 2, n);
            const i = t.columns.indexOf(c.name);
            const want = vt.type === "text" ? vt.value : vt.value;
            const keep = (cell) => {
                if (cell === ERROR) return false;
                const num = typeof cell === "number" || (vt.type === "word" && /^-?\d+(\.\d+)?$/.test(vt.value));
                const a = num ? (typeof cell === "number" ? cell : toNumber(cell)) : asText(cell);
                const b = num ? Number(want) : want;
                if (a === ERROR || a === null) return false;
                switch (op) {
                    case "=": return a === b;
                    case "<>": return a !== b;
                    case ">": return a > b;
                    case ">=": return a >= b;
                    case "<": return a < b;
                    default: return a <= b;
                }
            };
            t.rows = t.rows.filter((r) => keep(r[i]));
            return t;
        }

        case "split": {
            const c = takeColumn(t, toks, 1, n);
            let p = expectWord(toks, c.next, "by", n);
            const delim = takeText(toks, p, n, "The delimiter");
            if (delim === "") throw new StepError("The delimiter cannot be empty.", n);
            p = expectWord(toks, p + 1, "into", n);
            const names = [];
            for (;;) {
                names.push(takeName(toks, p, n));
                p += 1;
                if (toks[p]?.type === "comma") p += 1; else break;
            }
            endOfLine(toks, p, n);
            for (const nm of names) uniqueName(t, nm, n);
            const i = t.columns.indexOf(c.name);
            const rows = t.rows.map((r) => {
                const parts = typeof r[i] === "string" ? r[i].split(delim) : [];
                const piece = names.map((_, k) => (k < names.length - 1 ? (parts[k] ?? null) : (parts.slice(k).join(delim) || null)));
                if (typeof r[i] !== "string") return [...r.slice(0, i), ...names.map(() => null), ...r.slice(i + 1)];
                return [...r.slice(0, i), ...piece, ...r.slice(i + 1)];
            });
            return { columns: [...t.columns.slice(0, i), ...names, ...t.columns.slice(i + 1)], rows };
        }

        case "merge": {
            if (w1 === "queries") return mergeQueries(t, toks, n, others);
            const list = takeColumnList(t, toks, 1, n);
            if (list.names.length < 2) throw new StepError("Merge needs at least two columns.", n);
            let p = expectWord(toks, list.next, "with", n);
            const sep = takeText(toks, p, n, "The separator");
            p = expectWord(toks, p + 1, "as", n);
            const name = takeName(toks, p, n);
            endOfLine(toks, p + 1, n);
            uniqueName(t, name, n);
            const idx = list.names.map((c) => t.columns.indexOf(c));
            const keep = t.columns.map((c, i) => i).filter((i) => !idx.includes(i));
            return {
                columns: [...keep.map((i) => t.columns[i]), name],
                rows: t.rows.map((r) => [...keep.map((i) => r[i]), idx.map((i) => (r[i] === ERROR ? "" : asText(r[i]))).join(sep)])
            };
        }

        case "fill": {
            expectWord(toks, 1, "down", n);
            const c = takeColumn(t, toks, 2, n);
            endOfLine(toks, c.next, n);
            const i = t.columns.indexOf(c.name);
            let last = null;
            for (const r of t.rows) {
                if (isBlank(r[i])) r[i] = last; else last = r[i];
            }
            return t;
        }

        case "rename": {
            const c = takeColumn(t, toks, 1, n);
            const p = expectWord(toks, c.next, "to", n);
            const name = takeName(toks, p, n);
            endOfLine(toks, p + 1, n);
            if (name !== c.name) uniqueName(t, name, n);
            t.columns[t.columns.indexOf(c.name)] = name;
            return t;
        }

        case "add": {
            let p = expectWord(toks, 1, "column", n);
            const name = takeName(toks, p, n);
            uniqueName(t, name, n);
            p = expectWord(toks, p + 1, "=", n);
            const a = takeColumn(t, toks, p, n);
            const op = toks[a.next]?.value;
            if (!["+", "-", "*", "/"].includes(op)) throw new StepError("Use + - * or / between the two values.", n);
            const bt = toks[a.next + 1];
            if (!bt || bt.type !== "word") throw new StepError("A column or a number was expected after the operator.", n);
            endOfLine(toks, a.next + 2, n);
            const ai = t.columns.indexOf(a.name);
            const isNum = /^-?\d+(\.\d+)?$/.test(bt.value);
            const bi = isNum ? -1 : t.columns.indexOf(takeColumn(t, toks, a.next + 1, n).name);
            for (const r of t.rows) {
                const x = toNumber(r[ai]);
                const y = isNum ? Number(bt.value) : toNumber(r[bi]);
                r.push(x === ERROR || y === ERROR ? ERROR : x === null || y === null ? null : op === "+" ? x + y : op === "-" ? x - y : op === "*" ? x * y : y === 0 ? ERROR : x / y);
            }
            t.columns.push(name);
            return t;
        }

        case "group": {
            let p = expectWord(toks, 1, "by", n);
            const key = takeColumn(t, toks, p, n);
            const fn = norm(takeName(toks, key.next, n));
            if (!["sum", "average", "min", "max", "count"].includes(fn)) throw new StepError("Use sum, average, min, max or count.", n);
            const col = takeColumn(t, toks, key.next + 1, n);
            p = expectWord(toks, col.next, "as", n);
            const name = takeName(toks, p, n);
            endOfLine(toks, p + 1, n);
            const ki = t.columns.indexOf(key.name);
            const vi = t.columns.indexOf(col.name);
            const groups = new Map();
            for (const r of t.rows) {
                const k = r[ki] === ERROR ? "\u0000error" : r[ki];
                if (!groups.has(k)) groups.set(k, { key: r[ki], values: [] });
                groups.get(k).values.push(r[vi]);
            }
            const rows = [...groups.values()].map((g) => {
                const nums = g.values.map(toNumber).filter((x) => typeof x === "number");
                let out;
                if (fn === "count") out = g.values.filter((v) => !isBlank(v)).length;
                else if (nums.length === 0) out = null;
                else if (fn === "sum") out = nums.reduce((a, b) => a + b, 0);
                else if (fn === "average") out = nums.reduce((a, b) => a + b, 0) / nums.length;
                else if (fn === "min") out = Math.min(...nums);
                else out = Math.max(...nums);
                return [g.key, out];
            });
            return { columns: [key.name, name], rows };
        }

        case "append": {
            const name = takeName(toks, 1, n);
            endOfLine(toks, 2, n);
            const other = others[name];
            if (!other) throw new StepError(`There is no table named "${name}" to append. The tables are: ${Object.keys(others).join(", ") || "none"}.`, n);
            const columns = [...t.columns];
            for (const c of other.columns) if (!columns.includes(c)) columns.push(c);
            const rows = [
                ...t.rows.map((r) => columns.map((c) => (t.columns.includes(c) ? r[t.columns.indexOf(c)] : null))),
                ...other.rows.map((r) => columns.map((c) => (other.columns.includes(c) ? r[other.columns.indexOf(c)] : null)))
            ];
            return { columns, rows };
        }

        case "unpivot": {
            const list = takeColumnList(t, toks, 1, n);
            let p = expectWord(toks, list.next, "into", n);
            const attr = takeName(toks, p, n);
            if (toks[p + 1]?.type !== "comma") throw new StepError("Two names are needed after into: the attribute and the value.", n);
            const value = takeName(toks, p + 2, n);
            endOfLine(toks, p + 3, n);
            const idx = list.names.map((c) => t.columns.indexOf(c));
            const keep = t.columns.map((c, i) => i).filter((i) => !idx.includes(i));
            uniqueName({ columns: keep.map((i) => t.columns[i]) }, attr, n);
            const rows = [];
            for (const r of t.rows) for (const i of idx) rows.push([...keep.map((k) => r[k]), t.columns[i], r[i]]);
            return { columns: [...keep.map((i) => t.columns[i]), attr, value], rows };
        }

        case "sort": {
            const c = takeColumn(t, toks, 1, n);
            const dir = norm(takeName(toks, c.next, n));
            if (dir !== "ascending" && dir !== "descending") throw new StepError("Use ascending or descending.", n);
            endOfLine(toks, c.next + 1, n);
            const i = t.columns.indexOf(c.name);
            const sign = dir === "ascending" ? 1 : -1;
            const order = t.rows.map((r, k) => [r, k]).sort((x, y) => {
                const a = x[0][i], b = y[0][i];
                if (isBlank(a) || isBlank(b)) return compare(a, b) || x[1] - y[1];
                return sign * compare(a, b) || x[1] - y[1];
            });
            t.rows = order.map(([r]) => r);
            return t;
        }

        default:
            throw new StepError(`"${toks[0].value}" is not a step this lab knows. The steps are: ${STEPS.map((s) => s.split(" ")[0]).filter((x, k, a) => a.indexOf(x) === k).join(", ")}.`, n);
    }

}

function mergeQueries(t, toks, n, others) {
    const name = takeName(toks, 2, n);
    const other = others[name];
    if (!other) throw new StepError(`There is no table named "${name}" to merge with. The tables are: ${Object.keys(others).join(", ") || "none"}.`, n);
    let p = expectWord(toks, 3, "on", n);
    const left = takeColumn(t, toks, p, n);
    p = expectWord(toks, left.next, "=", n);
    const right = takeColumn(other, toks, p, n);
    p = expectWord(toks, right.next, "add", n);
    const add = takeColumn(other, toks, p, n);
    endOfLine(toks, add.next, n);
    const li = t.columns.indexOf(left.name);
    const ri = other.columns.indexOf(right.name);
    const ai = other.columns.indexOf(add.name);
    const lookup = new Map();
    for (const r of other.rows) {
        const k = r[ri];
        if (!isBlank(k) && k !== ERROR && !lookup.has(k)) lookup.set(k, r[ai]);
    }
    const columnName = t.columns.includes(add.name) ? `${add.name}.1` : add.name;
    return {
        columns: [...t.columns, columnName],
        rows: t.rows.map((r) => [...r, lookup.has(r[li]) ? lookup.get(r[li]) : null])
    };
}

/* ---------- a whole script ---------- */

/** Apply the script to `table`. Returns { table } or { error: { line, message } }. `others` are the other tables by name. */
export function runScript(table, script, others = {}) {

    if (script.length > MAX_SCRIPT_CHARS) return { error: { line: 0, message: `The steps are longer than ${MAX_SCRIPT_CHARS.toLocaleString("en-US")} characters.` } };

    const lines = script.split(/\r?\n/).map((l, i) => ({ text: l.trim(), n: i + 1 })).filter((l) => l.text !== "" && !l.text.startsWith("//"));

    if (lines.length > MAX_STEPS) return { error: { line: 0, message: `More than ${MAX_STEPS} steps.` } };

    let current = { columns: [...table.columns], rows: table.rows.map((r) => [...r]) };

    try {
        for (const l of lines) {
            current = applyStep(current, l.text, l.n, others);
            if (current.rows.length > MAX_ROWS * 4) throw new StepError("The table grew too large.", l.n);
        }
    } catch (e) {
        if (e instanceof StepError) return { error: { line: e.line, message: e.message } };
        throw e;
    }

    return { table: current };

}

/* ---------- comparing two tables (the exercise check) ---------- */

export function cellText(v) {
    if (v === ERROR) return "Error";
    if (v === null || v === undefined) return "null";
    return typeof v === "number" ? String(Math.round(v * 1e9) / 1e9) : JSON.stringify(v);
}

const keyOf = (r) => r.map((v) => (v === ERROR ? "\u0000E" : typeof v === "number" ? `n${Math.round(v * 1e9) / 1e9}` : v === null ? "\u0000N" : `s${v}`)).join("\u0001");

/** Same columns in the same order, and the same rows (in any order unless `ordered`). Returns a list of differences, empty when equal. */
export function diffTables(got, want, ordered = false) {
    const out = [];
    if (got.columns.join("\u0001") !== want.columns.join("\u0001")) {
        out.push(`The columns are ${got.columns.join(", ")}.`);
        return out;
    }
    if (got.rows.length !== want.rows.length) out.push(`The table has ${got.rows.length} rows.`);
    const a = got.rows.map(keyOf);
    const b = want.rows.map(keyOf);
    if (ordered) {
        const k = a.findIndex((x, i) => x !== b[i]);
        if (k >= 0 && a.length === b.length) out.push(`Row ${k + 1} is not the one expected here: ${got.rows[k].map(cellText).join(", ")}.`);
    } else {
        const count = new Map();
        for (const x of b) count.set(x, (count.get(x) ?? 0) + 1);
        let shown = 0;
        a.forEach((x, i) => {
            if ((count.get(x) ?? 0) > 0) count.set(x, count.get(x) - 1);
            else if (shown < 3) { out.push(`This row is not expected: ${got.rows[i].map(cellText).join(", ")}.`); shown += 1; }
        });
    }
    return out;
}
