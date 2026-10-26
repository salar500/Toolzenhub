/* =========================================================
   ToolZen Hub
   JSON Compare: the comparison rules

   Pure: no DOM, no network, no storage, no clock, no randomness.

   Two documents are read by the shared JSON tree (strict RFC 8259,
   exact numbers, duplicate keys recorded) and compared as DATA:

   - object members are unordered; a different key order is never a
     difference;
   - arrays are compared by position, or, when asked, as unordered
     multisets;
   - numbers are equal when they have the same exact decimal value
     (1, 1.0, 1e0 and 10e-1 are the same number); nothing is ever
     compared as a double;
   - strings are equal when their code points are equal, with no
     normalization, case folding or trimming;
   - a different JSON type is "type changed", never "changed".

   The result is an ordered list of rows (kind, path, both values)
   and, unless array order is ignored, an RFC 6902 patch that is
   applied back to the first document before it is offered.
========================================================= */

import {
    parseJson,
    normalizedPath,
    pointer,
    serialize
} from "../json-tree/json-tree.js";

export const MAX_CHARS_PER_SIDE = 1_000_000;
export const AUTO_COMBINED_CHARS = 100_000;
export const MAX_ROWS_SHOWN = 1000;
export const DISPLAY_VALUE_CHARS = 200;

const NOTE_PATHS = 3;

export const KIND_LABEL = {
    added: "Added",
    removed: "Removed",
    changed: "Changed",
    "type-changed": "Type changed"
};

export const EXAMPLE_FIRST = '{"a":1,"b":[1,2,3],"d":"x"}';
export const EXAMPLE_SECOND = '{"b":[1,2,4],"a":1.0,"c":true,"d":1}';

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;


/* ---------- equality ---------- */

function equal(a, b) {

    if (a.t !== b.t) {
        return false;
    }

    switch (a.t) {
        case "object":
            if (a.map.size !== b.map.size) {
                return false;
            }
            for (const [k, v] of a.map) {
                const w = b.map.get(k);
                if (w === undefined || !equal(v, w)) {
                    return false;
                }
            }
            return true;
        case "array":
            if (a.items.length !== b.items.length) {
                return false;
            }
            for (let i = 0; i < a.items.length; i++) {
                if (!equal(a.items[i], b.items[i])) {
                    return false;
                }
            }
            return true;
        case "string":
            return a.v === b.v;
        case "number":
            return a.key === b.key;
        case "boolean":
            return a.v === b.v;
        default:
            return true;
    }
}

export const sameValue = equal;


/* ---------- canonical identities (for ignoring array order) ---------- */

function makeInterner() {

    const ids = new Map();
    const memo = new WeakMap();

    const intern = (text) => {
        let id = ids.get(text);
        if (id === undefined) {
            id = ids.size;
            ids.set(text, id);
        }
        return id;
    };

    /* an integer identity: equal subtrees (by the rules above, objects by sorted members) get the same one */
    const idOf = (node) => {

        const known = memo.get(node);

        if (known !== undefined) {
            return known;
        }

        let id;

        switch (node.t) {
            case "object": {
                const parts = [...node.map.keys()].sort().map((k) => JSON.stringify(k) + ":" + idOf(node.map.get(k)));
                id = intern("{" + parts.join(",") + "}");
                break;
            }
            case "array":
                id = intern("[" + node.items.map(idOf).join(",") + "]");
                break;
            case "string":
                id = intern("s" + JSON.stringify(node.v));
                break;
            case "number":
                id = intern("n" + node.key);
                break;
            case "boolean":
                id = intern(node.v ? "true" : "false");
                break;
            default:
                id = intern("null");
        }

        memo.set(node, id);

        return id;
    };

    return idOf;
}


/* ---------- the walk ---------- */

function walk(a, b, options) {

    const rows = [];
    const idOf = options.ignoreOrder ? makeInterner() : null;

    const add = (kind, path, x, y, extra) => {
        rows.push({ kind, path: path.slice(), a: x, b: y, ...extra });
    };

    function visit(x, y, path) {

        if (x.t !== y.t) {
            add("type-changed", path, x, y);
            return;
        }

        if (x.t === "object") {

            for (const [k, v] of x.map) {

                path.push(k);

                const w = y.map.get(k);

                if (w === undefined) {
                    add("removed", path, v, null);
                } else {
                    visit(v, w, path);
                }

                path.pop();
            }

            for (const [k, w] of y.map) {

                if (!x.map.has(k)) {
                    path.push(k);
                    add("added", path, null, w);
                    path.pop();
                }
            }

            return;
        }

        if (x.t === "array") {

            if (idOf) {

                const pool = new Map();

                for (const e of y.items) {
                    const id = idOf(e);
                    pool.set(id, (pool.get(id) || 0) + 1);
                }

                const missing = [];

                x.items.forEach((e, i) => {
                    const id = idOf(e);
                    const left = pool.get(id);
                    if (left) {
                        pool.set(id, left - 1);
                    } else {
                        missing.push(i);
                    }
                });

                for (const i of missing) {
                    path.push(i);
                    add("removed", path, x.items[i], null);
                    path.pop();
                }

                /* what is left in the pool is unmatched in the second array: its LAST occurrences of each identity */
                const remaining = new Map(pool);

                const counts = new Map();

                for (const e of y.items) {
                    const id = idOf(e);
                    counts.set(id, (counts.get(id) || 0) + 1);
                }

                const skipFirst = new Map();

                for (const [id, n] of counts) {
                    skipFirst.set(id, n - (remaining.get(id) || 0));
                }

                y.items.forEach((e, j) => {

                    const id = idOf(e);
                    const skip = skipFirst.get(id);

                    if (skip > 0) {
                        skipFirst.set(id, skip - 1);
                        return;
                    }

                    path.push(j);
                    add("added", path, null, e);
                    path.pop();
                });

                return;
            }

            const shared = Math.min(x.items.length, y.items.length);

            for (let i = 0; i < shared; i++) {
                path.push(i);
                visit(x.items[i], y.items[i], path);
                path.pop();
            }

            for (let i = shared; i < x.items.length; i++) {
                path.push(i);
                add("removed", path, x.items[i], null);
                path.pop();
            }

            for (let i = shared; i < y.items.length; i++) {
                path.push(i);
                add("added", path, null, y.items[i]);
                path.pop();
            }

            return;
        }

        if (!equal(x, y)) {

            const extra = {};

            if (x.t === "string" && x.v.normalize("NFC") === y.v.normalize("NFC")) {
                extra.note = "Differs only by Unicode normalization";
            }

            add("changed", path, x, y, extra);
        }
    }

    visit(a, b, []);

    return rows;
}


/* ---------- the RFC 6902 patch ---------- */

function patchOps(rows) {

    /* array removals must run from the highest index to the lowest, so they are collected per parent and reversed */
    const ops = [];
    let pending = [];
    let pendingParent = null;

    const flush = () => {
        for (let k = pending.length - 1; k >= 0; k--) {
            ops.push(pending[k]);
        }
        pending = [];
        pendingParent = null;
    };

    for (const row of rows) {

        const p = pointer(row.path);

        if (row.kind === "removed") {

            const last = row.path[row.path.length - 1];

            if (typeof last === "number") {

                const parent = pointer(row.path.slice(0, -1));

                if (pendingParent !== parent) {
                    flush();
                    pendingParent = parent;
                }

                pending.push({ op: "remove", path: p });
                continue;
            }
        }

        flush();

        if (row.kind === "removed") {
            ops.push({ op: "remove", path: p });
        } else if (row.kind === "added") {
            ops.push({ op: "add", path: p, value: row.b });
        } else {
            ops.push({ op: "replace", path: p, value: row.b });
        }
    }

    flush();

    return ops;
}

function patchText(ops) {

    return "[" + ops.map((o) =>
        "{" + `"op":${JSON.stringify(o.op)},"path":${JSON.stringify(o.path)}` +
        (o.value ? `,"value":${serialize(o.value)}` : "") + "}"
    ).join(",") + "]";
}

/* a deep copy of a tree, so applying a patch never touches the compared documents */
function clone(node) {

    switch (node.t) {
        case "object":
            return { t: "object", map: new Map([...node.map].map(([k, v]) => [k, clone(v)])) };
        case "array":
            return { t: "array", items: node.items.map(clone) };
        default:
            return { ...node };
    }
}

/** Apply add / remove / replace operations (RFC 6902) to a copy of a tree. */
export function applyPatch(root, patchJson) {

    const parsed = parseJson(patchJson, Infinity);

    if (parsed.state !== "valid" || parsed.root.t !== "array") {
        return null;
    }

    let doc = clone(root);

    for (const opNode of parsed.root.items) {

        const op = opNode.map.get("op").v;
        const path = opNode.map.get("path").v;
        const value = opNode.map.get("value");
        const segments = path === ""
            ? []
            : path.slice(1).split("/").map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));

        if (segments.length === 0) {

            if (op !== "replace") {
                return null;
            }

            doc = clone(value);
            continue;
        }

        let parent = doc;

        for (const s of segments.slice(0, -1)) {

            parent = parent.t === "array" ? parent.items[Number(s)] : parent.map.get(s);

            if (!parent) {
                return null;
            }
        }

        const last = segments[segments.length - 1];

        if (parent.t === "array") {

            const index = last === "-" ? parent.items.length : Number(last);

            if (op === "add") {
                if (index > parent.items.length) return null;
                parent.items.splice(index, 0, clone(value));
            } else if (op === "remove") {
                if (index >= parent.items.length) return null;
                parent.items.splice(index, 1);
            } else if (op === "replace") {
                if (index >= parent.items.length) return null;
                parent.items[index] = clone(value);
            } else {
                return null;
            }

        } else if (parent.t === "object") {

            if (op === "add") {
                parent.map.set(last, clone(value));
            } else if (op === "remove") {
                if (!parent.map.has(last)) return null;
                parent.map.delete(last);
            } else if (op === "replace") {
                if (!parent.map.has(last)) return null;
                parent.map.set(last, clone(value));
            } else {
                return null;
            }

        } else {
            return null;
        }
    }

    return doc;
}


/* ---------- notes ---------- */

export function sideNotes(label, parsed) {

    const notes = [];

    if (parsed.dups.length) {

        const first = parsed.dups.slice(0, NOTE_PATHS).map((d) => normalizedPath(d.path)).join(", ");

        notes.push(
            `${label}: ${plural(parsed.dups.length, "key appears", "keys appear")} more than once in the same object (first at ${first}). The last value is used, as JSON.parse does.`
        );
    }

    if (parsed.precision.length) {

        const first = parsed.precision.slice(0, NOTE_PATHS).map((d) => normalizedPath(d.path)).join(", ");

        notes.push(
            `${label}: ${plural(parsed.precision.length, "number has", "numbers have")} more than 15 significant digits (first at ${first}). JavaScript would round them; this comparison uses the exact digits.`
        );
    }

    if (parsed.lone.length) {

        const first = parsed.lone.slice(0, NOTE_PATHS).map((p) => normalizedPath(p)).join(", ");

        notes.push(
            `${label}: ${plural(parsed.lone.length, "string is", "strings are")} not valid Unicode text (a lone surrogate escape; first at ${first}). They are compared by code unit value.`
        );
    }

    return notes;
}


/* ---------- text ---------- */

export function truncate(text, limit = DISPLAY_VALUE_CHARS) {
    return text.length > limit ? text.slice(0, limit) + "…" : text;
}

export function summaryText(result) {

    if (result.rows.length === 0) {
        return `No differences. Compared ${plural(result.valueCount, "value", "values")} on each side.`
            + (result.ignoreOrder ? " Array order was ignored." : "");
    }

    const c = result.counts;

    return `${plural(result.rows.length, "difference", "differences")}: ${c.added} added, ${c.removed} removed, ${c.changed} changed, ${c["type-changed"]} type changed.`
        + (result.ignoreOrder ? " Array order was ignored." : "");
}

export function rowValues(row) {
    return {
        first: row.a ? serialize(row.a) : "",
        second: row.b ? serialize(row.b) : ""
    };
}

/** Plain text of the summary, notes and every row (the copy action). */
export function differencesText(result) {

    const lines = [summaryText(result), ...result.notes];

    for (const row of result.rows) {

        const v = rowValues(row);

        lines.push([
            KIND_LABEL[row.kind],
            normalizedPath(row.path),
            row.a ? v.first : "-",
            row.b ? v.second : "-",
            ...(row.note ? [row.note] : [])
        ].join("\t"));
    }

    return lines.join("\n");
}


/* ---------- the public result ---------- */

/**
 * compareJson(firstText, secondText, { ignoreOrder })
 *
 *   { state: "blocked", first: side, second: side }    a side is empty, too large, invalid or refused
 *   { state: "done", rows, counts, notes, valueCount, ignoreOrder, patch, patchReason }
 *
 * where a side is { status: "valid" | "empty" | "too-large" | "invalid" | "refused", ... }.
 */
export function compareJson(firstText, secondText, options = {}) {

    const ignoreOrder = Boolean(options.ignoreOrder);

    const a = parseJson(firstText, MAX_CHARS_PER_SIDE);
    const b = parseJson(secondText, MAX_CHARS_PER_SIDE);

    if (a.state !== "valid" || b.state !== "valid") {

        const side = (r) => r.state === "valid" ? { status: "valid" } : { status: r.state, ...r };

        return { state: "blocked", first: side(a), second: side(b) };
    }

    const rows = walk(a.root, b.root, { ignoreOrder });

    const counts = { added: 0, removed: 0, changed: 0, "type-changed": 0 };

    for (const row of rows) {
        counts[row.kind]++;
    }

    const notes = [...sideNotes("First JSON", a), ...sideNotes("Second JSON", b)];

    const result = {
        state: "done",
        rows,
        counts,
        notes,
        valueCount: a.count,
        ignoreOrder,
        patch: null,
        patchReason: null
    };

    if (ignoreOrder) {

        result.patchReason = "A patch cannot express an ignored order.";

    } else if (rows.length === 0) {

        result.patch = "[]";

    } else {

        const text = patchText(patchOps(rows));
        const applied = applyPatch(a.root, text);

        if (applied !== null && equal(applied, b.root)) {
            result.patch = text;
        } else {
            result.patchReason = "The patch could not be verified, so it is not offered.";
        }
    }

    return result;
}
