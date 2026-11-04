/* =========================================================
   ToolZen Hub
   Power BI Practice Lab: a DAX subset

   A tokenizer, parser and evaluator for the DAX subset listed in SUPPORTED, over a small model (tables, one-to-many relationships and
   an optional date table) with a filter context. Text is parsed into a tree and walked; it is never evaluated as code. A function outside
   the list gives an explained "not supported in this lab" message, never a guessed value.

   Model: { tables: { Name: { columns: string[], rows: any[][] } },
            relationships: [{ many: { table, col }, one: { table, col } }],
            dateTable?: { table, col } }
   Cells are numbers, strings, booleans or null (blank). Dates are text, YYYY-MM-DD.
   A filter is { table, col, values: Set } (a column filter) or { table, rows: Set<number> } (a set of rows of one table).
========================================================= */

export const MAX_FORMULA_CHARS = 800;
export const MAX_DEPTH = 32;
export const MAX_WORK = 200000;

export const SUPPORTED = [
    "SUM", "AVERAGE", "MIN", "MAX", "COUNT", "COUNTA", "COUNTROWS", "DISTINCTCOUNT",
    "SUMX", "AVERAGEX", "MINX", "MAXX", "COUNTX",
    "IF", "SWITCH", "AND", "OR", "NOT", "TRUE", "FALSE", "BLANK", "ISBLANK", "DIVIDE", "ROUND", "ABS", "COALESCE",
    "CALCULATE", "FILTER", "ALL", "ALLEXCEPT", "REMOVEFILTERS", "VALUES", "SELECTEDVALUE", "HASONEVALUE", "RELATED",
    "TOTALYTD", "DATESYTD", "SAMEPERIODLASTYEAR", "DATEADD", "PREVIOUSMONTH"
];

export class DaxError extends Error { }

/* ---------- tokens ---------- */

function tokenize(src) {
    const out = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i];
        if (/\s/.test(c)) { i += 1; continue; }
        if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i += 1; continue; }
        if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
            let j = i;
            while (j < n && /[0-9.]/.test(src[j])) j += 1;
            const text = src.slice(i, j);
            if (!/^(\d+(\.\d*)?|\.\d+)$/.test(text)) throw new DaxError(`"${text}" is not a number.`);
            out.push({ t: "num", v: Number(text) });
            i = j;
            continue;
        }
        if (c === "\"") {
            let j = i + 1;
            let s = "";
            while (j < n) {
                if (src[j] === "\"" && src[j + 1] === "\"") { s += "\""; j += 2; continue; }
                if (src[j] === "\"") break;
                s += src[j];
                j += 1;
            }
            if (j >= n) throw new DaxError("A text value was opened with a quote but never closed.");
            out.push({ t: "str", v: s });
            i = j + 1;
            continue;
        }
        if (c === "'") {
            const j = src.indexOf("'", i + 1);
            if (j < 0) throw new DaxError("A table name was opened with an apostrophe but never closed.");
            out.push({ t: "tbl", v: src.slice(i + 1, j) });
            i = j + 1;
            continue;
        }
        if (c === "[") {
            const j = src.indexOf("]", i + 1);
            if (j < 0) throw new DaxError("A square bracket was opened but never closed.");
            out.push({ t: "br", v: src.slice(i + 1, j) });
            i = j + 1;
            continue;
        }
        if (/[A-Za-z_]/.test(c)) {
            let j = i;
            while (j < n && /[A-Za-z0-9_.]/.test(src[j])) j += 1;
            out.push({ t: "id", v: src.slice(i, j) });
            i = j;
            continue;
        }
        const two = src.slice(i, i + 2);
        if (["<=", ">=", "<>", "&&", "||"].includes(two)) { out.push({ t: "op", v: two }); i += 2; continue; }
        if ("+-*/^&=<>(),{}".includes(c)) { out.push({ t: "op", v: c }); i += 1; continue; }
        throw new DaxError(`The character "${c}" is not valid in a DAX formula.`);
    }
    return out;
}

/* ---------- parser ---------- */

function parse(src) {

    if (src.length > MAX_FORMULA_CHARS) throw new DaxError(`The formula is longer than ${MAX_FORMULA_CHARS} characters.`);
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const isOp = (v) => toks[p]?.t === "op" && toks[p].v === v;
    const isId = (v) => toks[p]?.t === "id" && toks[p].v.toUpperCase() === v;

    function expectOp(v) {
        if (!isOp(v)) throw new DaxError(v === ")" ? "A closing bracket \")\" is missing." : `"${v}" was expected here${toks[p] ? ` but "${toks[p].v}" was found` : " but the formula ended"}.`);
        p += 1;
    }

    function expr(depth) {
        if (depth > MAX_DEPTH) throw new DaxError(`The formula is nested more than ${MAX_DEPTH} levels deep.`);
        if (isId("VAR")) {
            const vars = [];
            while (isId("VAR")) {
                p += 1;
                const name = toks[p];
                if (!name || name.t !== "id") throw new DaxError("A variable name was expected after VAR.");
                p += 1;
                expectOp("=");
                vars.push({ name: name.v, expr: or(depth) });
            }
            if (!isId("RETURN")) throw new DaxError("RETURN is missing after the VAR lines.");
            p += 1;
            return { k: "vars", vars, ret: expr(depth + 1) };
        }
        return or(depth);
    }

    function binary(next, ops) {
        return function level(depth) {
            let left = next(depth);
            while (toks[p]?.t === "op" && ops.includes(toks[p].v)) {
                const op = toks[p].v;
                p += 1;
                left = { k: "bin", op, l: left, r: next(depth) };
            }
            return left;
        };
    }

    const power = (depth) => {
        if (depth > MAX_DEPTH) throw new DaxError(`The formula is nested more than ${MAX_DEPTH} levels deep.`);
        const base = unary(depth);
        if (isOp("^")) { p += 1; return { k: "bin", op: "^", l: base, r: power(depth) }; }
        return base;
    };
    function unary(depth) {
        if (depth > MAX_DEPTH) throw new DaxError(`The formula is nested more than ${MAX_DEPTH} levels deep.`);
        if (isOp("-")) { p += 1; return { k: "neg", x: unary(depth) }; }
        if (isOp("+")) { p += 1; return unary(depth); }
        if (isId("NOT")) {
            if (toks[p + 1]?.v !== "(") { p += 1; return { k: "call", name: "NOT", args: [unary(depth)] }; }
        }
        return primary(depth);
    }
    const mul = binary(power, ["*", "/"]);
    const add = binary(mul, ["+", "-"]);
    const cat = binary(add, ["&"]);
    const cmp = binary(cat, ["=", "<>", "<", "<=", ">", ">="]);
    const and = binary(cmp, ["&&"]);
    const or = binary(and, ["||"]);

    function primary(depth) {
        const t = peek();
        if (!t) throw new DaxError("The formula ended where a value was expected.");
        if (t.t === "num") { p += 1; return { k: "num", v: t.v }; }
        if (t.t === "str") { p += 1; return { k: "str", v: t.v }; }
        if (t.t === "op" && t.v === "(") { p += 1; const e = expr(depth + 1); expectOp(")"); return e; }
        if (t.t === "br") { p += 1; return { k: "meas", name: t.v }; }
        if (t.t === "tbl") {
            p += 1;
            if (peek()?.t === "br") { const c = peek(); p += 1; return { k: "col", table: t.v, col: c.v }; }
            return { k: "tab", name: t.v };
        }
        if (t.t === "id") {
            p += 1;
            if (isOp("(")) {
                p += 1;
                const args = [];
                if (!isOp(")")) {
                    for (;;) {
                        args.push(expr(depth + 1));
                        if (isOp(",")) { p += 1; continue; }
                        break;
                    }
                }
                expectOp(")");
                return { k: "call", name: t.v.toUpperCase(), args };
            }
            if (peek()?.t === "br") { const c = peek(); p += 1; return { k: "col", table: t.v, col: c.v }; }
            const up = t.v.toUpperCase();
            if (up === "TRUE" || up === "FALSE") return { k: "bool", v: up === "TRUE" };
            return { k: "name", name: t.v };
        }
        throw new DaxError(`"${t.v}" was not expected here.`);
    }

    const tree = expr(0);
    if (p < toks.length) throw new DaxError(`"${toks[p].v}" was not expected here. Check for a missing operator, comma or bracket.`);
    return tree;

}

/* ---------- model helpers ---------- */

const isBlank = (v) => v === null || v === undefined;
const num = (v) => (typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : isBlank(v) ? 0 : NaN);

function tableOf(model, name) {
    const hit = Object.keys(model.tables).find((t) => t === name) ?? Object.keys(model.tables).find((t) => t.toLowerCase() === name.toLowerCase());
    if (!hit) throw new DaxError(`There is no table named '${name}'. The tables are: ${Object.keys(model.tables).join(", ")}.`);
    return hit;
}

function colIndex(model, table, col) {
    const t = model.tables[table];
    let i = t.columns.indexOf(col);
    if (i < 0) i = t.columns.findIndex((c) => c.toLowerCase() === col.toLowerCase());
    if (i < 0) throw new DaxError(`The table '${table}' has no column named [${col}]. Its columns are: ${t.columns.join(", ")}.`);
    return i;
}

class Run {
    constructor(model, measures) {
        this.model = model;
        this.measures = measures;
        this.work = 0;
        this.active = new Set();
    }
    spend(k) {
        this.work += k;
        if (this.work > MAX_WORK) throw new DaxError("This formula needs too much work for the lab to finish. Simplify it.");
    }
}

/* the rows of `table` that survive `filters` */
function visible(run, table, filters, depth = 0) {

    const { model } = run;
    const t = model.tables[table];
    let rows = null;
    run.spend(t.rows.length);

    const restrict = (keep) => { rows = rows === null ? t.rows.map((_, i) => i).filter(keep) : rows.filter(keep); };

    for (const f of filters) {
        if (f.table !== table) continue;
        if (f.rows) restrict((i) => f.rows.has(i));
        else {
            const ci = colIndex(model, table, f.col);
            restrict((i) => f.values.has(t.rows[i][ci] ?? null));
        }
    }

    if (depth < 6) {
        for (const rel of model.relationships) {
            if (rel.many.table !== table) continue;
            if (!affected(model, rel.one.table, filters, 0)) continue;
            const dimRows = visible(run, rel.one.table, filters, depth + 1);
            const dt = model.tables[rel.one.table];
            const di = colIndex(model, rel.one.table, rel.one.col);
            const keys = new Set(dimRows.map((r) => dt.rows[r][di]));
            const fi = colIndex(model, table, rel.many.col);
            restrict((i) => keys.has(t.rows[i][fi]));
        }
    }

    return rows ?? t.rows.map((_, i) => i);

}

function affected(model, table, filters, depth) {
    if (filters.some((f) => f.table === table)) return true;
    if (depth > 6) return false;
    return model.relationships.some((r) => r.many.table === table && affected(model, r.one.table, filters, depth + 1));
}

function related(run, ctx, ref) {
    const { model } = run;
    const dim = tableOf(model, ref.table);
    const di = colIndex(model, dim, ref.col);
    for (let k = ctx.rows.length - 1; k >= 0; k -= 1) {
        const rc = ctx.rows[k];
        const rel = model.relationships.find((r) => r.many.table === rc.table && r.one.table === dim);
        if (!rel) continue;
        const key = model.tables[rc.table].rows[rc.index][colIndex(model, rc.table, rel.many.col)];
        if (isBlank(key)) return null;
        const dt = model.tables[dim];
        const oi = colIndex(model, dim, rel.one.col);
        const hit = dt.rows.find((r) => r[oi] === key);
        return hit ? hit[di] : null;
    }
    throw new DaxError(`RELATED needs a row of a table that is on the many side of a relationship to '${dim}'. Use it inside an iterator such as SUMX, or in a calculated column.`);
}

/* ---------- evaluation ---------- */

const SCALAR_TYPES = ["number", "string", "boolean"];

function dateParts(s) { const [y, m, d] = s.split("-").map(Number); return { y, m, d }; }
const pad = (n) => String(n).padStart(2, "0");
function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
function shiftMonths(s, k) {
    const { y, m, d } = dateParts(s);
    const total = y * 12 + (m - 1) + k;
    const ny = Math.floor(total / 12);
    const nm = (total % 12 + 12) % 12 + 1;
    return `${ny}-${pad(nm)}-${pad(Math.min(d, dim(ny, nm)))}`;
}

function dateDomain(run, ref) {
    const dt = run.model.dateTable;
    if (!dt) throw new DaxError("This model has no date table, so time intelligence functions cannot be used.");
    const table = tableOf(run.model, ref.table);
    if (table !== dt.table || colIndex(run.model, table, ref.col) !== colIndex(run.model, dt.table, dt.col)) {
        throw new DaxError(`Time intelligence needs the date column ${dt.table}[${dt.col}] of the date table.`);
    }
    return { table, ci: colIndex(run.model, table, dt.col) };
}

function visibleDates(run, ctx, ref) {
    const { table, ci } = dateDomain(run, ref);
    const rows = visible(run, table, ctx.filters);
    return { table, ci, dates: rows.map((r) => run.model.tables[table].rows[r][ci]).filter((d) => typeof d === "string").sort() };
}

function dateFilter(run, table, set) {
    return { table, col: run.model.dateTable.col, values: set };
}

function evaluate(run, node, ctx, depth = 0) {

    if (depth > 200) throw new DaxError("The formula is nested too deeply.");
    run.spend(1);
    const { model } = run;

    switch (node.k) {

        case "num": case "str": case "bool": return node.v;

        case "neg": { const v = evaluate(run, node.x, ctx, depth + 1); return -num(scalar(v)); }

        case "name": {
            if (ctx.vars && node.name in ctx.vars) return ctx.vars[node.name];
            const up = node.name.toUpperCase();
            if (Object.keys(model.tables).some((t) => t.toLowerCase() === node.name.toLowerCase())) return { tab: tableOf(model, node.name) };
            throw new DaxError(`"${node.name}" is not a variable, table or function here. A column is written Table[Column] and a measure [Name].`);
        }

        case "tab": return { tab: tableOf(model, node.name) };

        case "vars": {
            const vars = { ...(ctx.vars ?? {}) };
            const inner = { ...ctx, vars };
            for (const v of node.vars) vars[v.name] = evaluate(run, v.expr, inner, depth + 1);
            return evaluate(run, node.ret, inner, depth + 1);
        }

        case "meas": return measureValue(run, node.name, ctx, depth);

        case "col": {
            const table = tableOf(model, node.table);
            const ci = colIndex(model, table, node.col);
            for (let k = ctx.rows.length - 1; k >= 0; k -= 1) {
                if (ctx.rows[k].table === table) return model.tables[table].rows[ctx.rows[k].index][ci] ?? null;
            }
            throw new DaxError(`${node.table}[${node.col}] is a whole column here, and a measure cannot read one value from it. Summarise it, for example SUM(${node.table}[${node.col}]), or use it inside an iterator such as SUMX.`);
        }

        case "bin": return binaryOp(run, node, ctx, depth);

        case "call": return call(run, node, ctx, depth);

        default: throw new DaxError("This formula cannot be evaluated.");
    }

}

function scalar(v) {
    if (v !== null && typeof v === "object") throw new DaxError("A table was found where a single value is needed.");
    return v;
}

function compareValues(op, a, b) {
    if (isBlank(a)) a = typeof b === "string" ? "" : 0;
    if (isBlank(b)) b = typeof a === "string" ? "" : 0;
    if (typeof a === "string" && typeof b === "string") { a = a.toLowerCase(); b = b.toLowerCase(); }
    else if (typeof a !== typeof b) {
        if (op === "=") return false;
        if (op === "<>") return true;
        throw new DaxError("Text and numbers cannot be compared with < or >.");
    }
    switch (op) {
        case "=": return a === b;
        case "<>": return a !== b;
        case "<": return a < b;
        case "<=": return a <= b;
        case ">": return a > b;
        default: return a >= b;
    }
}

function binaryOp(run, node, ctx, depth) {
    const { op } = node;
    if (op === "&&") return truthy(evaluate(run, node.l, ctx, depth + 1)) && truthy(evaluate(run, node.r, ctx, depth + 1));
    if (op === "||") return truthy(evaluate(run, node.l, ctx, depth + 1)) || truthy(evaluate(run, node.r, ctx, depth + 1));
    const a = scalar(evaluate(run, node.l, ctx, depth + 1));
    const b = scalar(evaluate(run, node.r, ctx, depth + 1));
    if (["=", "<>", "<", "<=", ">", ">="].includes(op)) return compareValues(op, a, b);
    if (op === "&") return `${isBlank(a) ? "" : a}${isBlank(b) ? "" : b}`;
    if ((typeof a === "string" && a !== "") || (typeof b === "string" && b !== "")) throw new DaxError("Text cannot be used in arithmetic. Check the columns used in the calculation.");
    if (isBlank(a) && isBlank(b)) return null;
    const x = num(a), y = num(b);
    switch (op) {
        case "+": return x + y;
        case "-": return x - y;
        case "*": return isBlank(a) || isBlank(b) ? null : x * y;
        case "/": if (y === 0) throw new DaxError("Division by zero. DIVIDE(a, b) returns blank (or a value you choose) instead."); return x / y;
        default: return x ** y;
    }
}

function truthy(v) {
    v = scalar(v);
    if (typeof v === "boolean") return v;
    if (isBlank(v)) return false;
    if (typeof v === "number") return v !== 0;
    throw new DaxError("A true or false value is needed here.");
}

function measureValue(run, name, ctx, depth) {
    const key = Object.keys(run.measures).find((m) => m.toLowerCase() === name.toLowerCase());
    if (key === undefined) {
        // an unqualified [Column] inside a row context
        for (let k = ctx.rows.length - 1; k >= 0; k -= 1) {
            const t = run.model.tables[ctx.rows[k].table];
            const ci = t.columns.findIndex((c) => c.toLowerCase() === name.toLowerCase());
            if (ci >= 0) return t.rows[ctx.rows[k].index][ci] ?? null;
        }
        throw new DaxError(`There is no measure named [${name}]. A column is written Table[Column].`);
    }
    if (run.active.has(key)) throw new DaxError(`The measure [${key}] refers to itself.`);
    run.active.add(key);
    try {
        // a measure used inside a row context takes that row as filter (context transition)
        const moved = transition(ctx);
        return evaluate(run, run.measures[key], moved, depth + 1);
    } finally {
        run.active.delete(key);
    }
}

/* each current row becomes a filter on its table, and the row context is gone */
function transition(ctx) {
    if (ctx.rows.length === 0) return ctx;
    let filters = ctx.filters;
    for (const rc of ctx.rows) {
        filters = [...filters.filter((f) => f.table !== rc.table), { table: rc.table, rows: new Set([rc.index]) }];
    }
    return { ...ctx, filters, rows: [] };
}

function colRef(run, node, what) {
    if (node.k !== "col") throw new DaxError(`${what} needs a column such as Table[Column].`);
    const table = tableOf(run.model, node.table);
    return { table, ci: colIndex(run.model, table, node.col), col: run.model.tables[table].columns[colIndex(run.model, table, node.col)] };
}

/* a table expression -> { table, rows: number[] } */
function rowsOf(run, node, ctx, depth) {
    if (node.k === "tab" || node.k === "name") {
        const v = evaluate(run, node, ctx, depth + 1);
        if (!v?.tab) throw new DaxError("A table was expected here.");
        return { table: v.tab, rows: visible(run, v.tab, ctx.filters) };
    }
    if (node.k === "call" && node.name === "ALL") {
        const a = node.args[0];
        if (!a || (a.k !== "tab" && a.k !== "name")) throw new DaxError("Here ALL needs a table name.");
        const table = tableOf(run.model, a.name);
        return { table, rows: run.model.tables[table].rows.map((_, i) => i) };
    }
    if (node.k === "call" && node.name === "FILTER") {
        if (node.args.length !== 2) throw new DaxError("FILTER needs a table and a condition.");
        const base = rowsOf(run, node.args[0], ctx, depth + 1);
        const keep = base.rows.filter((i) => truthy(evaluate(run, node.args[1], { ...ctx, rows: [...ctx.rows, { table: base.table, index: i }] }, depth + 1)));
        return { table: base.table, rows: keep };
    }
    throw new DaxError("This function needs a table: a table name, FILTER(...) or ALL(table).");
}

function aggregate(run, node, ctx, depth, fn) {
    const name = node.name;
    if (node.args.length !== 1) throw new DaxError(`${name} takes one argument.`);
    const { table, ci } = colRef(run, node.args[0], name);
    const t = run.model.tables[table];
    const rows = visible(run, table, ctx.filters);
    const vals = rows.map((r) => t.rows[r][ci] ?? null);
    return fn(vals, name);
}

function numbersOf(vals, name) {
    const out = [];
    for (const v of vals) {
        if (isBlank(v)) continue;
        if (typeof v !== "number") throw new DaxError(`${name} can only summarise a number column, but this column holds text. Change its type in the query steps first.`);
        out.push(v);
    }
    return out;
}

function iterate(run, node, ctx, depth, fn) {
    if (node.args.length !== 2) throw new DaxError(`${node.name} needs a table and an expression.`);
    const base = rowsOf(run, node.args[0], ctx, depth + 1);
    const values = [];
    for (const i of base.rows) {
        run.spend(1);
        values.push(scalar(evaluate(run, node.args[1], { ...ctx, rows: [...ctx.rows, { table: base.table, index: i }] }, depth + 1)));
    }
    return fn(values, node.name);
}

function setFiltersFromBoolean(run, node, ctx, depth, filters) {

    if (node.k === "bin" && node.op === "&&") {
        filters = setFiltersFromBoolean(run, node.l, ctx, depth + 1, filters);
        return setFiltersFromBoolean(run, node.r, ctx, depth + 1, filters);
    }

    if (node.k === "bin" && ["=", "<>", "<", "<=", ">", ">="].includes(node.op)) {
        const colSide = node.l.k === "col" ? node.l : node.r.k === "col" ? node.r : null;
        const other = colSide === node.l ? node.r : node.l;
        if (colSide && other.k !== "col") {
            const { table, ci, col } = colRef(run, colSide, "A filter");
            const want = scalar(evaluate(run, other, ctx, depth + 1));
            const flip = colSide === node.r;
            const op = flip ? ({ "<": ">", "<=": ">=", ">": "<", ">=": "<=" }[node.op] ?? node.op) : node.op;
            const values = new Set();
            for (const row of run.model.tables[table].rows) {
                run.spend(1);
                if (compareValues(op, row[ci] ?? null, want)) values.add(row[ci] ?? null);
            }
            return [...filters.filter((f) => !(f.table === table && f.col === col)), { table, col, values }];
        }
    }

    throw new DaxError("A filter inside CALCULATE can compare one column with a value, for example Products[Category] = \"Grocery\". For anything else, use FILTER(table, condition).");

}

function filterArg(run, node, ctx, depth, filters) {

    if (node.k === "call") {
        const name = node.name;
        if (name === "ALL" || name === "REMOVEFILTERS") {
            if (node.args.length === 0) return [];
            let out = filters;
            for (const a of node.args) {
                if (a.k === "col") {
                    const { table, col } = colRef(run, a, name);
                    out = out.filter((f) => !(f.table === table && (f.col === col || f.rows)));
                } else if (a.k === "tab" || a.k === "name") {
                    const table = tableOf(run.model, a.name);
                    out = out.filter((f) => f.table !== table);
                } else throw new DaxError(`${name} needs a table or a column.`);
            }
            return out;
        }
        if (name === "ALLEXCEPT") {
            const t = node.args[0];
            if (!t || (t.k !== "tab" && t.k !== "name")) throw new DaxError("ALLEXCEPT needs a table first, then the columns to keep.");
            const table = tableOf(run.model, t.name);
            const keep = new Set(node.args.slice(1).map((a) => colRef(run, a, "ALLEXCEPT").col));
            return filters.filter((f) => f.table !== table || (f.col && keep.has(f.col)));
        }
        if (name === "FILTER") {
            const base = rowsOf(run, node, ctx, depth + 1);
            return [...filters.filter((f) => f.table !== base.table), { table: base.table, rows: new Set(base.rows) }];
        }
        if (name === "VALUES") {
            const { table, ci, col } = colRef(run, node.args[0], "VALUES");
            const t = run.model.tables[table];
            const values = new Set(visible(run, table, ctx.filters).map((r) => t.rows[r][ci] ?? null));
            return [...filters.filter((f) => !(f.table === table && f.col === col)), { table, col, values }];
        }
        if (["DATESYTD", "SAMEPERIODLASTYEAR", "DATEADD", "PREVIOUSMONTH"].includes(name)) {
            const d = dateSet(run, node, ctx, depth);
            return [...filters.filter((f) => f.table !== d.table), d.filter];
        }
    }

    return setFiltersFromBoolean(run, node, ctx, depth, filters);

}

function dateSet(run, node, ctx, depth) {

    const name = node.name;
    const ref = node.args[0];
    if (!ref || ref.k !== "col") throw new DaxError(`${name} needs the date column as its first argument.`);
    const { table, ci, dates } = visibleDates(run, ctx, ref);
    const all = run.model.tables[table].rows.map((r) => r[ci]).filter((d) => typeof d === "string");
    const allSet = new Set(all);
    let set;

    if (dates.length === 0) set = new Set();
    else if (name === "DATESYTD") {
        const last = dates[dates.length - 1];
        const start = `${last.slice(0, 4)}-01-01`;
        set = new Set(all.filter((d) => d >= start && d <= last));
    } else if (name === "SAMEPERIODLASTYEAR") {
        set = new Set(dates.map((d) => shiftMonths(d, -12)).filter((d) => allSet.has(d)));
    } else if (name === "DATEADD") {
        const k = scalar(evaluate(run, node.args[1], ctx, depth + 1));
        const unit = node.args[2]?.k === "name" ? node.args[2].name.toUpperCase() : "";
        if (typeof k !== "number" || !Number.isInteger(k)) throw new DaxError("DATEADD needs a whole number of intervals as its second argument.");
        if (!["MONTH", "YEAR"].includes(unit)) throw new DaxError("DATEADD supports the intervals MONTH and YEAR in this lab.");
        set = new Set(dates.map((d) => shiftMonths(d, unit === "YEAR" ? k * 12 : k)).filter((d) => allSet.has(d)));
    } else {
        const first = dates[0];
        const prev = shiftMonths(`${first.slice(0, 7)}-01`, -1).slice(0, 7);
        set = new Set(all.filter((d) => d.startsWith(prev)));
    }

    return { table, filter: dateFilter(run, table, set) };

}

function call(run, node, ctx, depth) {

    const { name, args } = node;
    const need = (n) => { if (args.length !== n) throw new DaxError(`${name} takes ${n} argument${n === 1 ? "" : "s"}, but ${args.length} ${args.length === 1 ? "was" : "were"} given.`); };

    switch (name) {

        case "TRUE": need(0); return true;
        case "FALSE": need(0); return false;
        case "BLANK": need(0); return null;

        case "SUM": return aggregate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? x.reduce((a, b) => a + b, 0) : null; });
        case "AVERAGE": return aggregate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? x.reduce((a, b) => a + b, 0) / x.length : null; });
        case "MIN": return aggregate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? Math.min(...x) : null; });
        case "MAX": return aggregate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? Math.max(...x) : null; });
        case "COUNT": return aggregate(run, node, ctx, depth, (v) => v.filter((x) => typeof x === "number").length);
        case "COUNTA": return aggregate(run, node, ctx, depth, (v) => v.filter((x) => !isBlank(x)).length);
        case "DISTINCTCOUNT": return aggregate(run, node, ctx, depth, (v) => new Set(v).size);

        case "COUNTROWS": {
            need(1);
            return rowsOf(run, args[0], ctx, depth + 1).rows.length;
        }

        case "SUMX": return iterate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? x.reduce((a, b) => a + b, 0) : null; });
        case "AVERAGEX": return iterate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? x.reduce((a, b) => a + b, 0) / x.length : null; });
        case "MINX": return iterate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? Math.min(...x) : null; });
        case "MAXX": return iterate(run, node, ctx, depth, (v, n) => { const x = numbersOf(v, n); return x.length ? Math.max(...x) : null; });
        case "COUNTX": return iterate(run, node, ctx, depth, (v) => v.filter((x) => !isBlank(x)).length);

        case "IF": {
            if (args.length < 2 || args.length > 3) throw new DaxError("IF takes a test, a result if true, and optionally a result if false.");
            const c = truthy(evaluate(run, args[0], ctx, depth + 1));
            if (c) return evaluate(run, args[1], ctx, depth + 1);
            return args[2] ? evaluate(run, args[2], ctx, depth + 1) : null;
        }

        case "SWITCH": {
            if (args.length < 3) throw new DaxError("SWITCH takes an expression, then value and result pairs, and optionally a final else result.");
            const subject = scalar(evaluate(run, args[0], ctx, depth + 1));
            let i = 1;
            for (; i + 1 < args.length; i += 2) {
                const candidate = scalar(evaluate(run, args[i], ctx, depth + 1));
                if (compareValues("=", subject, candidate)) return evaluate(run, args[i + 1], ctx, depth + 1);
            }
            return i < args.length ? evaluate(run, args[i], ctx, depth + 1) : null;
        }

        case "AND": need(2); return truthy(evaluate(run, args[0], ctx, depth + 1)) && truthy(evaluate(run, args[1], ctx, depth + 1));
        case "OR": need(2); return truthy(evaluate(run, args[0], ctx, depth + 1)) || truthy(evaluate(run, args[1], ctx, depth + 1));
        case "NOT": need(1); return !truthy(evaluate(run, args[0], ctx, depth + 1));
        case "ISBLANK": need(1); return isBlank(scalar(evaluate(run, args[0], ctx, depth + 1)));

        case "DIVIDE": {
            if (args.length < 2 || args.length > 3) throw new DaxError("DIVIDE takes a numerator, a denominator, and optionally a result for division by zero.");
            const a = scalar(evaluate(run, args[0], ctx, depth + 1));
            const b = scalar(evaluate(run, args[1], ctx, depth + 1));
            if (isBlank(b) || num(b) === 0 || isBlank(a)) return args[2] ? scalar(evaluate(run, args[2], ctx, depth + 1)) : null;
            return num(a) / num(b);
        }

        case "ROUND": {
            need(2);
            const x = scalar(evaluate(run, args[0], ctx, depth + 1));
            const d = scalar(evaluate(run, args[1], ctx, depth + 1));
            if (isBlank(x)) return null;
            const f = 10 ** d;
            const v = Math.abs(num(x)) * f;
            return Math.sign(num(x)) * Math.round(v + 1e-9) / f;
        }

        case "ABS": { need(1); const x = scalar(evaluate(run, args[0], ctx, depth + 1)); return isBlank(x) ? null : Math.abs(num(x)); }

        case "COALESCE": {
            for (const a of args) {
                const v = scalar(evaluate(run, a, ctx, depth + 1));
                if (!isBlank(v)) return v;
            }
            return null;
        }

        case "CALCULATE": {
            if (args.length < 1) throw new DaxError("CALCULATE needs an expression, then optional filters.");
            const moved = transition(ctx);
            let filters = moved.filters;
            for (const a of args.slice(1)) filters = filterArg(run, a, moved, depth + 1, filters);
            return evaluate(run, args[0], { ...moved, filters }, depth + 1);
        }

        case "TOTALYTD": {
            if (args.length !== 2) throw new DaxError("TOTALYTD takes an expression and the date column.");
            const moved = transition(ctx);
            const d = dateSet(run, { name: "DATESYTD", args: [args[1]] }, moved, depth + 1);
            return evaluate(run, args[0], { ...moved, filters: [...moved.filters.filter((f) => f.table !== d.table), d.filter] }, depth + 1);
        }

        case "SELECTEDVALUE": {
            if (args.length < 1 || args.length > 2) throw new DaxError("SELECTEDVALUE takes a column and optionally an alternative result.");
            const { table, ci } = colRef(run, args[0], name);
            const t = run.model.tables[table];
            const vals = new Set(visible(run, table, ctx.filters).map((r) => t.rows[r][ci] ?? null));
            if (vals.size === 1) return [...vals][0];
            return args[1] ? scalar(evaluate(run, args[1], ctx, depth + 1)) : null;
        }

        case "HASONEVALUE": {
            need(1);
            const { table, ci } = colRef(run, args[0], name);
            const t = run.model.tables[table];
            return new Set(visible(run, table, ctx.filters).map((r) => t.rows[r][ci] ?? null)).size === 1;
        }

        case "RELATED": {
            need(1);
            if (args[0].k !== "col") throw new DaxError("RELATED needs a column such as Products[Category].");
            return related(run, ctx, args[0]);
        }

        case "FILTER": case "ALL": case "ALLEXCEPT": case "REMOVEFILTERS": case "VALUES": case "DATESYTD": case "SAMEPERIODLASTYEAR": case "DATEADD": case "PREVIOUSMONTH":
            throw new DaxError(`${name} returns a table, so it cannot be the final result of a measure. Use it inside CALCULATE, or inside COUNTROWS or an iterator such as SUMX.`);

        default:
            throw new DaxError(`${name} is not supported in this lab. It may exist in Power BI; the lab never guesses a value. The functions it supports are listed on the page.`);
    }

}

/* ---------- measures and the public API ---------- */

/** "Name = expr" lines -> { Name: tree }. A line that starts a new definition is unindented, `Name = ...`, and does not start with VAR or RETURN. */
export function parseMeasures(script) {

    if (script.length > MAX_FORMULA_CHARS * 6) throw new DaxError(`The text is longer than ${MAX_FORMULA_CHARS * 6} characters.`);
    const defs = [];
    for (const line of script.split(/\r?\n/)) {
        const hit = line.match(/^(\[[^\]]+\]|[A-Za-z_][A-Za-z0-9_ %\-]*?)\s*=\s*(.*)$/);
        const word = line.trim().split(/\s+/)[0]?.toUpperCase();
        if (hit && !/^\s/.test(line) && word !== "VAR" && word !== "RETURN" && !/^[A-Za-z_]+\(/.test(line) && !/[<>]/.test(hit[1])) {
            defs.push({ name: hit[1].replace(/^\[|\]$/g, "").trim(), text: hit[2] });
        } else if (defs.length) defs[defs.length - 1].text += `\n${line}`;
        else defs.push({ name: null, text: line });
    }
    return defs.filter((d) => d.text.trim() !== "" || d.name).map((d) => ({ name: d.name, tree: parse(d.text) }));

}

/**
 * Evaluate a measure script in a filter context.
 *   model, script, target (the measure's name; if null the last definition is used),
 *   helpers: { Name: "formula text" } (measures the exercise provides), context: [{ table, col, values: [...] }]
 * Returns { value } or { error: message }.
 */
export function evaluateMeasure(model, script, { target = null, helpers = {}, context = [] } = {}) {

    let defs;
    try {
        defs = parseMeasures(script);
    } catch (e) {
        if (e instanceof DaxError) return { error: e.message };
        throw e;
    }
    if (defs.length === 0) return { error: "Write a measure first." };

    const measures = {};
    try {
        for (const [name, text] of Object.entries(helpers)) measures[name] = parse(text);
    } catch (e) {
        if (e instanceof DaxError) return { error: `A provided measure could not be read: ${e.message}` };
        throw e;
    }
    for (const d of defs) if (d.name) measures[d.name] = d.tree;

    const chosen = target === null || target === undefined ? defs[defs.length - 1] : defs.find((d) => d.name && d.name.toLowerCase() === target.toLowerCase());
    if (!chosen) return { error: `Define a measure named ${target}, for example: ${target} = ...` };

    try {
        const filters = context.map((f) => {
            const table = tableOf(model, f.table);
            return { table, col: model.tables[table].columns[colIndex(model, table, f.col)], values: new Set(f.values.map((v) => v ?? null)) };
        });
        const run = new Run(model, measures);
        const value = evaluate(run, chosen.tree, { filters, rows: [] }, 0);
        if (value !== null && typeof value === "object") throw new DaxError("The result is a table. A measure must return a single value.");
        if (typeof value === "number" && !Number.isFinite(value)) throw new DaxError("The result is not a finite number.");
        return { value };
    } catch (e) {
        if (e instanceof DaxError) return { error: e.message };
        if (e instanceof RangeError) return { error: "The formula is nested too deeply." };
        throw e;
    }

}

/** A calculated column: evaluate `formula` once per row of `table` with that row as the row context. */
export function evaluateColumn(model, table, formula) {
    let tree;
    try {
        tree = parse(formula);
    } catch (e) {
        if (e instanceof DaxError) return { error: e.message };
        throw e;
    }
    try {
        const t = tableOf(model, table);
        const run = new Run(model, {});
        const values = model.tables[t].rows.map((_, i) => {
            const v = evaluate(run, tree, { filters: [], rows: [{ table: t, index: i }] }, 0);
            return scalar(v);
        });
        return { values };
    } catch (e) {
        if (e instanceof DaxError) return { error: e.message };
        throw e;
    }
}

export function formatValue(v) {
    if (v === null || v === undefined) return "(blank)";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return String(Math.round(v * 1e6) / 1e6);
    return String(v);
}
