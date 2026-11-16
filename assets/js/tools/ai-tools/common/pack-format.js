/* =========================================================
   ToolZen Hub
   AI Tools: the portable file format (AI ecosystem programme, 16 D9)

   A Work Pack, playbook or context pack is a Markdown file the
   visitor keeps. A download ends with one HTML comment that holds
   the answers as JSON, so the file opens again in the tool that
   wrote it; Copy never includes it. Reading is defensive: the
   text is the visitor's own file, so it is parsed inside try,
   checked against an allow-list of keys and types, and capped.
   Nothing here touches the DOM; values only ever reach form
   controls. Pure.
========================================================= */

const MARK = "<!-- toolzenhub:";
const END = "-->";

export const MAX_FILE = 200000;
export const FORMAT = 1;

/** The Markdown with the metadata comment appended. `<` and `>` are escaped so the JSON can never close the comment. */
export function withMeta(markdown, meta) {

    const json = JSON.stringify(meta).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

    return `${String(markdown ?? "").replace(/\s+$/, "")}\n\n${MARK}${json} ${END}\n`;

}

/** The text without any metadata comment (for pasting a downloaded file back into a prompt). */
export function stripMeta(text) {

    return String(text ?? "").replace(/\n*<!-- toolzenhub:[\s\S]*?-->\s*/g, "\n").replace(/\s+$/, "");

}

/** { meta } from the last metadata comment, or { error } in words. */
export function readMeta(text) {

    const source = String(text ?? "");

    if (source.length > MAX_FILE) {
        return { error: "The file is larger than 200 kB." };
    }

    const start = source.lastIndexOf(MARK);

    if (start < 0) {
        return { error: "none" };
    }

    const end = source.indexOf(END, start + MARK.length);

    if (end < 0) {
        return { error: "The file's ToolZen Hub data is cut short." };
    }

    try {
        const meta = JSON.parse(source.slice(start + MARK.length, end));
        return meta && typeof meta === "object" && !Array.isArray(meta) ? { meta } : { error: "The file's ToolZen Hub data is not readable." };
    } catch {
        return { error: "The file's ToolZen Hub data is not readable." };
    }

}

/*
 * Keep only the keys a schema allows, with the right types and lengths.
 * schema: { key: "string:<max>" | "int" | "bool" | "strings:<max>" (an object of strings) | "list:<max>" (array of objects of strings) }
 * Returns { value, ignored } where ignored lists the keys dropped.
 */
export function pick(meta, schema) {

    const value = {};
    const ignored = [];

    for (const [key, raw] of Object.entries(meta ?? {})) {

        const rule = schema[key];

        if (!rule) {
            ignored.push(key);
            continue;
        }

        const [type, limit] = rule.split(":");
        const max = Number(limit) || 0;

        if (type === "string" && typeof raw === "string") value[key] = raw.slice(0, max);
        else if (type === "int" && Number.isInteger(raw) && raw >= 0 && raw < 1e6) value[key] = raw;
        else if (type === "bool" && typeof raw === "boolean") value[key] = raw;
        else if (type === "strings" && raw && typeof raw === "object" && !Array.isArray(raw)) value[key] = strings(raw, max);
        else if (type === "list" && Array.isArray(raw)) value[key] = raw.slice(0, 20).filter((item) => item && typeof item === "object").map((item) => strings(item, max));
        else ignored.push(key);

    }

    return { value, ignored };

}

function strings(object, max) {

    const out = {};

    for (const [k, v] of Object.entries(object).slice(0, 80)) {
        if (typeof k === "string" && k.length <= 60 && typeof v === "string") out[k] = v.slice(0, max);
        else if (typeof k === "string" && k.length <= 60 && v && typeof v === "object" && !Array.isArray(v)) out[k] = strings(v, max);
    }

    return out;

}

/*
 * The sections of a Markdown text by heading, for files without the metadata comment and for an AI's reply.
 * A heading is a line starting with #, a line that is only **bold**, or a short line ending with a colon.
 * Returns [{ title, body }] in order; text before the first heading has the title "".
 */
export function sectionsOf(text) {

    const out = [{ title: "", body: [] }];

    for (const line of stripMeta(text).replace(/\r\n?/g, "\n").split("\n")) {

        const title = headingOf(line);

        if (title !== null) out.push({ title, body: [] });
        else out[out.length - 1].body.push(line);

    }

    return out
        .map((s) => ({ title: s.title, body: s.body.join("\n").trim() }))
        .filter((s) => s.title || s.body);

}

function headingOf(line) {

    const t = line.trim();
    let m = t.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (m) return clean(m[1]);

    m = t.match(/^\*\*(.+?)\*\*:?$/) ?? t.match(/^__(.+?)__:?$/);
    if (m) return clean(m[1]);

    m = t.match(/^(?:\d+[.)]\s*)?([A-Z][^.!?]{1,60}):$/);
    if (m) return clean(m[1]);

    return null;

}

const clean = (title) => title.replace(/^\d+[.)]\s*/, "").replace(/[*_`]/g, "").replace(/:$/, "").trim();

/** A heading reduced for matching: lower case letters and digits, single spaces. */
export const keyOf = (title) => String(title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The visitor's local calendar date as YYYY-MM-DD. */
export function today(date = new Date()) {

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

}

/** A file name part from free text: lower case, letters, digits and dashes, at most 40 characters. */
export function slug(text, fallback = "project") {

    const s = String(text ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");

    return s || fallback;

}

/** Save text as a file through a temporary link (the shared download pattern of the AI tools). */
export function downloadText(text, fileName, doc = globalThis.document) {

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = doc.createElement("a");

    link.href = url;
    link.download = fileName;
    doc.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

}

/** The text of a chosen file, or { error } for a file that is too large. */
export async function readFile(file) {

    if (!file) return { error: "Choose a file first." };
    if (file.size > MAX_FILE) return { error: "The file is larger than 200 kB." };

    try {
        return { text: await file.text() };
    } catch {
        return { error: "The file could not be read." };
    }

}
