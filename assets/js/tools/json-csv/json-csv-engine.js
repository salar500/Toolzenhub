/* =========================================================
   ToolZen Hub
   JSON <-> CSV: the engine

   Pure functions. No DOM, network, storage, clock or randomness.

   JSON -> CSV
     Input is an array of objects (a table). Columns are the keys in
     the order they first appear. A key missing from a row gives an
     empty cell. Numbers are written exactly as they appear in the
     JSON text (no rounding). true and false are written as text.
     null gives an empty cell, which CSV cannot tell from an empty
     string: the result says how many nulls were written that way.
     A nested value (object or array) is never flattened silently:
     by default it is refused naming its row and column, or, by
     choice, its JSON text is written into the cell.
     FORMULA GUARD (on by default): a string cell that starts with
     = + - @ tab or CR is written with a single quote in front, so a
     spreadsheet shows it as text instead of running it as a
     formula. Numbers are never changed. The result counts the cells
     changed. Turn it off only when the cell must be byte-exact.

   CSV -> JSON
     RFC 4180: records end at CRLF, LF or CR; a field in double
     quotes may hold the delimiter, line breaks and "" for one quote.
     A byte order mark at the start is removed. Empty lines are
     skipped and counted. Every record must have as many fields as
     the first; a mismatch, an unterminated quote and text after a
     closing quote are refused with line and column. With a header
     row the result is an array of objects (header names must be
     non-empty and unique); without, an array of arrays. Every value
     stays a string unless "convert values" is chosen, which turns
     only exact JSON number text (no leading zeros, no plus sign, at
     most 15 significant digits) and the words true and false into
     numbers and booleans.
     An empty field stays "" (never null).

   Limits: 1,000,000 characters, 50,000 rows, 1,000 columns.
========================================================= */

import { parseJson } from "../json-tree/json-tree.js";

export const MAX_CHARS = 1000000;
export const MAX_ROWS = 50000;
export const MAX_COLUMNS = 1000;

export const DELIMITERS = {
    comma: ",",
    semicolon: ";",
    tab: "\t",
    pipe: "|"
};

export const DELIMITER_NAMES = {
    comma: "comma",
    semicolon: "semicolon",
    tab: "tab",
    pipe: "pipe"
};

export const EXAMPLE_JSON = `[
  { "id": 1, "name": "Asha", "city": "Pune", "note": "likes \\"tea\\", coffee" },
  { "id": 2, "name": "Ben", "city": "Delhi", "active": true },
  { "id": 3, "name": "=SUM(A1:A9)", "city": null }
]`;

export const EXAMPLE_CSV = 'id,name,city,note\r\n1,Asha,Pune,"likes ""tea"", coffee"\r\n2,Ben,Delhi,\r\n';

const FORMULA_START = /^[=+\-@\t\r]/;
const NUMBER_TOKEN = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/;

const plural = (n, one, many) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

function delimiterOf(options) {

    const d = options.delimiter ?? ",";

    return Object.values(DELIMITERS).includes(d) ? d : ",";
}

function describePath(index, column) {
    return `row ${index + 1}, column "${column}"`;
}

/* =========================================================
   JSON -> CSV
========================================================= */

function quoteField(value, delimiter) {

    if (value === "" ) {
        return "";
    }

    if (value.includes('"') || value.includes(delimiter) || value.includes("\n") || value.includes("\r")) {
        return `"${value.replaceAll('"', '""')}"`;
    }

    return value;
}

/**
 * @param {string} text  JSON text
 * @param {{ delimiter?: string, nested?: "refuse"|"json", guard?: boolean, eol?: string }} options
 */
export function jsonToCsv(text, options = {}) {

    const delimiter = delimiterOf(options);
    const nested = options.nested === "json" ? "json" : "refuse";
    const guard = options.guard !== false;
    const eol = options.eol === "\r\n" ? "\r\n" : "\n";

    const read = parseJson(text, MAX_CHARS);

    if (read.state === "empty") {
        return { ok: false, state: "empty", message: "Paste a JSON array of objects." };
    }

    if (read.state === "too-large") {
        return { ok: false, state: "too-large", message: `The input is over ${read.limit.toLocaleString("en-US")} characters.` };
    }

    if (read.state === "refused") {
        return { ok: false, state: "refused", message: read.message };
    }

    if (read.state !== "valid") {
        const e = read.error;
        return { ok: false, state: "invalid", message: `This is not valid JSON: ${e.message} (line ${e.line}, column ${e.column}).` };
    }

    const root = read.root;

    if (root.t !== "array") {
        return { ok: false, state: "shape", message: "The top level must be an array of objects, such as [{...}, {...}]." };
    }

    if (root.items.length === 0) {
        return { ok: false, state: "shape", message: "The array is empty, so there is no table to write." };
    }

    if (root.items.length > MAX_ROWS) {
        return { ok: false, state: "too-large", message: `The array has ${root.items.length.toLocaleString("en-US")} items; the limit is ${MAX_ROWS.toLocaleString("en-US")}.` };
    }

    const columns = [];
    const seen = new Set();

    for (let i = 0; i < root.items.length; i++) {

        const item = root.items[i];

        if (item.t !== "object") {
            return { ok: false, state: "shape", message: `Item ${i + 1} is ${item.t === "array" ? "an array" : `a ${item.t}`}, not an object. Every item must be an object.` };
        }

        for (const key of item.map.keys()) {

            if (!seen.has(key)) {

                seen.add(key);
                columns.push(key);

                if (columns.length > MAX_COLUMNS) {
                    return { ok: false, state: "too-large", message: `There are more than ${MAX_COLUMNS.toLocaleString("en-US")} different keys.` };
                }
            }
        }
    }

    let guarded = 0;
    let nulls = 0;
    let nestedCells = 0;

    const cell = (value) => {

        let out;

        if (value === undefined || value.t === "null") {

            if (value !== undefined) {
                nulls++;
            }

            return "";
        }

        if (value.t === "string") {

            out = value.v;

            if (guard && FORMULA_START.test(out)) {
                guarded++;
                out = `'${out}`;
            }

            return quoteField(out, delimiter);
        }

        if (value.t === "number") {
            return quoteField(value.text, delimiter);
        }

        if (value.t === "boolean") {
            return value.v ? "true" : "false";
        }

        nestedCells++;

        out = stringify(value);

        /* a nested value is written as JSON text; the formula guard does not apply (it starts with { or [) */
        return quoteField(out, delimiter);
    };

    const lines = [columns.map((c) => {

        let name = c;

        if (guard && FORMULA_START.test(name)) {
            guarded++;
            name = `'${name}`;
        }

        return quoteField(name, delimiter);

    }).join(delimiter)];

    for (let i = 0; i < root.items.length; i++) {

        const row = root.items[i].map;

        if (nested === "refuse") {

            for (const column of columns) {

                const v = row.get(column);

                if (v && (v.t === "object" || v.t === "array")) {
                    return {
                        ok: false,
                        state: "nested",
                        message: `The value at ${describePath(i, column)} is ${v.t === "array" ? "an array" : "an object"}. CSV has no nested values. Choose "Write nested values as JSON text" or flatten the data first.`
                    };
                }
            }
        }

        lines.push(columns.map((column) => cell(row.get(column))).join(delimiter));
    }

    const notes = [];

    if (read.dups.length > 0) {
        notes.push(`${plural(read.dups.length, "object repeats a key", "objects repeat keys")}; the last value of each repeated key is used.`);
    }

    if (nulls > 0) {
        notes.push(`${plural(nulls, "null was", "nulls were")} written as an empty cell. CSV cannot tell null from an empty string.`);
    }

    if (nestedCells > 0) {
        notes.push(`${plural(nestedCells, "nested value was", "nested values were")} written as JSON text in one cell.`);
    }

    if (guarded > 0) {
        notes.push(`${plural(guarded, "cell was", "cells were")} written with a leading ' so a spreadsheet shows it as text, not a formula (text starting with = + - @ tab or CR).`);
    }

    return {
        ok: true,
        csv: lines.join(eol),
        rows: root.items.length,
        columns: columns.length,
        guarded,
        notes
    };
}

/* JSON text of a tree node, compact, numbers exactly as written */
function stringify(node) {

    if (node.t === "string") return JSON.stringify(node.v);
    if (node.t === "number") return node.text;
    if (node.t === "boolean") return node.v ? "true" : "false";
    if (node.t === "null") return "null";
    if (node.t === "array") return `[${node.items.map(stringify).join(",")}]`;

    return `{${[...node.map].map(([k, v]) => `${JSON.stringify(k)}:${stringify(v)}`).join(",")}}`;
}

/* =========================================================
   CSV -> JSON
========================================================= */

function lineColumnAt(text, offset) {

    let line = 1;
    let column = 1;

    for (let i = 0; i < offset; i++) {

        const c = text[i];

        if (c === "\n" || (c === "\r" && text[i + 1] !== "\n")) {
            line++;
            column = 1;
        } else if (c !== "\r") {
            column++;
        }
    }

    return { line, column };
}

/**
 * Read CSV text into records (arrays of strings).
 * Returns { ok: true, records, skipped } or { ok: false, message }.
 */
export function parseCsv(input, delimiter) {

    let text = input;

    if (text.charCodeAt(0) === 0xfeff) {
        text = text.slice(1);
    }

    const records = [];
    let record = [];
    let field = "";
    let i = 0;
    let skipped = 0;
    let atFieldStart = true;
    let quoted = false;

    const endRecord = () => {

        record.push(field);

        if (record.length === 1 && record[0] === "" && !quoted) {
            skipped++;
        } else {
            records.push(record);
        }

        record = [];
        field = "";
        atFieldStart = true;
        quoted = false;
    };

    while (i < text.length) {

        const c = text[i];

        if (atFieldStart && c === '"') {

            const open = i;

            i++;

            let closed = false;

            while (i < text.length) {

                if (text[i] === '"') {

                    if (text[i + 1] === '"') {
                        field += '"';
                        i += 2;
                        continue;
                    }

                    i++;
                    closed = true;
                    break;
                }

                field += text[i];
                i++;
            }

            if (!closed) {
                const p = lineColumnAt(text, open);
                return { ok: false, message: `A quoted field that starts at line ${p.line}, column ${p.column} is never closed.` };
            }

            const next = text[i];

            if (i < text.length && next !== delimiter && next !== "\n" && next !== "\r") {
                const p = lineColumnAt(text, i);
                return { ok: false, message: `Unexpected text after a closing quote at line ${p.line}, column ${p.column}. A quote inside a quoted field must be written as "".` };
            }

            atFieldStart = false;
            quoted = true;
            continue;
        }

        if (c === delimiter) {
            record.push(field);
            field = "";
            atFieldStart = true;
            i++;
            continue;
        }

        if (c === "\n" || c === "\r") {

            endRecord();

            i += c === "\r" && text[i + 1] === "\n" ? 2 : 1;
            continue;
        }

        field += c;
        atFieldStart = false;
        i++;
    }

    if (field !== "" || record.length > 0) {
        endRecord();
    }

    return { ok: true, records, skipped };
}

function convertValue(value) {

    if (value === "true") return { raw: "true" };
    if (value === "false") return { raw: "false" };

    if (NUMBER_TOKEN.test(value) && Number.isFinite(Number(value))) {

        /* more than 15 significant digits would lose precision in most readers: keep the string */
        const digits = value.replace(/[eE].*$/, "").replace(/[-.]/g, "").replace(/^0+/, "").length;

        if (digits <= 15) {
            return { raw: value };
        }
    }

    return null;
}

function jsonString(value) {
    return JSON.stringify(value);
}

/**
 * @param {string} text  CSV text
 * @param {{ delimiter?: string, header?: boolean, convert?: boolean }} options
 */
export function csvToJson(text, options = {}) {

    const delimiter = delimiterOf(options);
    const header = options.header !== false;
    const convert = Boolean(options.convert);

    const input = String(text ?? "");

    if (input.trim() === "") {
        return { ok: false, state: "empty", message: "Paste CSV text." };
    }

    if (input.length > MAX_CHARS) {
        return { ok: false, state: "too-large", message: `The input is over ${MAX_CHARS.toLocaleString("en-US")} characters.` };
    }

    const parsed = parseCsv(input, delimiter);

    if (!parsed.ok) {
        return { ok: false, state: "invalid", message: parsed.message };
    }

    const records = parsed.records;

    if (records.length === 0) {
        return { ok: false, state: "empty", message: "Paste CSV text." };
    }

    const width = records[0].length;

    if (width > MAX_COLUMNS) {
        return { ok: false, state: "too-large", message: `There are ${width.toLocaleString("en-US")} columns; the limit is ${MAX_COLUMNS.toLocaleString("en-US")}.` };
    }

    const dataRows = header ? records.length - 1 : records.length;

    if (dataRows > MAX_ROWS) {
        return { ok: false, state: "too-large", message: `There are ${dataRows.toLocaleString("en-US")} rows; the limit is ${MAX_ROWS.toLocaleString("en-US")}.` };
    }

    for (let r = 1; r < records.length; r++) {

        if (records[r].length !== width) {
            return {
                ok: false,
                state: "ragged",
                message: `Record ${r + 1} has ${plural(records[r].length, "field", "fields")}, but the first record has ${width}. Every record must have the same number of fields.`
            };
        }
    }

    let names = null;

    if (header) {

        names = records[0];

        const seen = new Set();

        for (let c = 0; c < names.length; c++) {

            if (names[c] === "") {
                return { ok: false, state: "header", message: `Header column ${c + 1} has no name.` };
            }

            if (seen.has(names[c])) {
                return { ok: false, state: "header", message: `The header name "${names[c]}" appears more than once (column ${c + 1}). Names must be unique.` };
            }

            seen.add(names[c]);
        }
    }

    let converted = 0;

    const valueText = (value) => {

        if (convert) {

            const c = convertValue(value);

            if (c) {
                converted++;
                return c.raw;
            }
        }

        return jsonString(value);
    };

    const body = records.slice(header ? 1 : 0);

    const rows = body.map((record) =>
        header
            ? `  {${record.map((value, c) => `${jsonString(names[c])}: ${valueText(value)}`).join(", ")}}`
            : `  [${record.map(valueText).join(", ")}]`
    );

    const json = rows.length === 0 ? "[]" : `[\n${rows.join(",\n")}\n]`;

    const notes = [];

    if (parsed.skipped > 0) {
        notes.push(`${plural(parsed.skipped, "empty line was", "empty lines were")} skipped.`);
    }

    if (!convert) {
        notes.push("Every value is a string. Numbers and true/false are not converted unless you choose it.");
    } else {
        notes.push(`${plural(converted, "value was", "values were")} converted to a number or true/false. Empty fields stay as empty strings.`);
    }

    if (header && rows.length === 0) {
        notes.push("There is a header row and no data rows, so the result is an empty array.");
    }

    return {
        ok: true,
        json,
        rows: body.length,
        columns: width,
        converted,
        notes
    };
}
