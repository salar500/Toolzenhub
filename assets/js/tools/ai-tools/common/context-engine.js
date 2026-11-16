/* =========================================================
   ToolZen Hub
   AI Tools: the AI Context Bridge engine (AI ecosystem programme, 17 §6)

   One set of project facts, four ways out: a full project brief,
   a short handoff to another AI product, a session update for a
   new chat, and an instruction file for a coding assistant. Also
   the prompt a visitor runs at the end of an AI conversation to
   get the facts back under the Bridge's own headings, and the
   parser that reads that reply into the fields. Nothing is
   imported from any AI product: the visitor carries the text.
   Pure; no DOM.
========================================================= */

import { section, bullets, lines, document as doc, wordCount } from "./brief-engine.js";
import { sectionsOf, keyOf } from "./pack-format.js";

export const MODES = Object.freeze([
    { value: "brief", label: "Project brief: everything, for the start of a project" },
    { value: "handoff", label: "Hand off to another AI: short, to continue in another product" },
    { value: "session", label: "Continue a session: what changed, for a new chat" },
    { value: "agent", label: "Coding agent file: instructions for a coding assistant" }
]);

/* the sections, in order; `in` says which modes show them, `cut` caps a list in a mode (latest items first kept) */
export const SECTIONS = Object.freeze([
    { key: "purpose", heading: "Purpose", agentHeading: "Project", in: ["brief", "handoff", "agent"] },
    { key: "role", heading: "My role", in: ["brief", "handoff"] },
    { key: "stack", heading: "How it is built", list: true, in: ["brief", "handoff", "agent"] },
    { key: "state", heading: "Current state", in: ["brief", "handoff", "session"] },
    { key: "decisions", heading: "Decisions", list: true, in: ["brief", "handoff", "session", "agent"], cut: { handoff: 5 } },
    { key: "rejected", heading: "Rejected approaches", agentHeading: "Do not", list: true, in: ["brief", "session", "agent"] },
    { key: "terms", heading: "Terms", list: true, in: ["brief", "agent"] },
    { key: "files", heading: "Key files and folders", agentHeading: "Where things are", list: true, in: ["brief", "handoff", "agent"] },
    { key: "done", heading: "Completed work, do not redo", list: true, in: ["brief", "handoff", "session"], cut: { handoff: 5 } },
    { key: "issues", heading: "Known issues and traps", list: true, in: ["brief", "handoff", "session", "agent"] },
    { key: "rules", heading: "Rules and conventions", list: true, in: ["brief", "handoff", "agent"] },
    { key: "task", heading: "The next task", in: ["brief", "handoff", "session"] },
    { key: "verify", heading: "How the work will be verified", agentHeading: "How to check work", list: true, in: ["brief", "handoff", "session", "agent"] },
    { key: "reply", heading: "How to respond", in: ["brief", "handoff", "session"] }
]);

const TITLES = {
    brief: (p) => `# Project context: ${p}`,
    handoff: (p) => `# Handoff: ${p}`,
    session: (p) => `# Continuing: ${p}`,
    agent: (p) => `# ${p}: instructions for coding assistants`
};

export const modeOf = (v) => MODES.some((m) => m.value === v) ? v : "brief";

/* the last `n` items of a list; the rest are counted, not dropped silently */
function capped(text, n) {

    const items = lines(text);

    if (!n || items.length <= n) return { text, left: 0 };

    return { text: items.slice(-n).join("\n"), left: items.length - n };

}

/**
 * The pack in the chosen mode. v: tidied field values; extra: { version, date, changed: [section headings] } when a
 * saved pack was opened and edited.
 */
export function composeContext(v, extra = {}) {

    const mode = modeOf(v.mode);
    const parts = [TITLES[mode](v.project || "(project name)")];

    if (extra.version && extra.date) {
        parts.push(`Version ${extra.version}, ${extra.date}.${extra.changed?.length ? ` Changed since version ${extra.version - 1}: ${extra.changed.join(", ")}.` : ""}`);
    }

    for (const s of SECTIONS.filter((x) => x.in.includes(mode))) {

        const { text, left } = capped(v[s.key], s.cut?.[mode]);
        const body = s.list ? bullets(text) : text;
        const heading = mode === "agent" && s.agentHeading ? s.agentHeading : s.heading;

        parts.push(section(heading, body && left ? `${body}\n(${left} earlier item${left === 1 ? "" : "s"} left out)` : body));

    }

    return doc(parts);

}

/* ---------- getting the facts out of an AI conversation ---------- */

const EXTRACT = SECTIONS.filter((s) => s.key !== "reply");

/** The prompt the visitor pastes at the end of an AI conversation. Fixed text: the Bridge's own headings, nothing else. */
export const EXTRACTION_PROMPT = [
    "Summarise this project so that I can continue it in another chat or another AI product.",
    "Answer under exactly these headings, in this order, each as a Markdown heading starting with ##. Under each, write short lines; use one line per item for lists.",
    "",
    "## Project name",
    ...EXTRACT.map((s) => `## ${s.heading}`),
    "",
    "Rules: use only what was said or decided in this conversation. Write \"none\" under a heading when there is nothing. Do not invent facts, files or decisions. Quote decisions as they were agreed. Keep the whole answer under 600 words."
].join("\n");

const HEADING_KEYS = new Map([
    ["project name", "project"], ["project", "project"],
    ...SECTIONS.flatMap((s) => [[keyOf(s.heading), s.key], ...(s.agentHeading ? [[keyOf(s.agentHeading), s.key]] : [])]),
    ["completed work", "done"], ["next task", "task"], ["rules", "rules"], ["known issues", "issues"], ["key files", "files"], ["files and references", "files"],
    ["how it will be verified", "verify"], ["verification", "verify"], ["technical context", "stack"], ["constraints", "rules"]
]);

const EMPTY = /^(?:none|n\/?a|nothing|-|—)\.?$/i;

/** { values, filled: [headings], empty: [headings], notes } from an AI's reply (or an older pack without its data). */
export function parseReply(text) {

    const values = {};
    const notes = [];

    for (const s of sectionsOf(text)) {

        const key = HEADING_KEYS.get(keyOf(s.title).replace(/^\d+ /, ""));
        const body = s.body.replace(/^[-*•]\s+/gm, "").trim();

        if (!key) {
            if (s.body) notes.push(s.title ? `${s.title}: ${s.body}` : s.body);
            continue;
        }

        if (!body || EMPTY.test(body)) continue;
        values[key] = values[key] ? `${values[key]}\n${body}` : body;

    }

    if (notes.length) values.notes = notes.join("\n");

    const named = [{ key: "project", heading: "Project name" }, ...EXTRACT];

    return {
        values,
        filled: named.filter((s) => values[s.key]).map((s) => s.heading),
        empty: named.filter((s) => !values[s.key]).map((s) => s.heading)
    };

}

/* ---------- the check panel's notes ---------- */

const SECRET = /\bsk-[A-Za-z0-9_-]{12,}|\bAKIA[0-9A-Z]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:password|passwd|pwd|secret|api[_-]?key|token)\s*[:=]\s*\S{4,}|\b[A-Fa-f0-9]{40,}\b|\b[A-Za-z0-9+/]{48,}={0,2}(?![A-Za-z0-9+/=])/;

export const HANDOFF_WORDS = 400;
export const STALE_DAYS = 14;

/**
 * Notes in words, never changing a field: the handoff's length, text that looks like a password or key, and signs that an
 * opened pack is out of date. labels: { key: label }; today and opened are YYYY-MM-DD.
 */
export function contextNotes(v, markdown, labels, { today = "", opened = "" } = {}) {

    const notes = [];
    const mode = modeOf(v.mode);

    if (mode === "handoff") {
        const words = wordCount(markdown);
        notes.push(`Short handoff: ${words} words.${words > HANDOFF_WORDS ? ` Over ${HANDOFF_WORDS} words: an assistant may skim it; trim the longest sections.` : ""}`);
    }

    for (const [key, value] of Object.entries(v)) {
        if (value && SECRET.test(value)) notes.push(`${labels[key] ?? key} contains text that looks like a password or key. Remove it before you paste this anywhere.`);
    }

    if (opened && today && daysBetween(opened, today) > STALE_DAYS) {
        notes.push(`This pack was saved on ${opened}, more than ${STALE_DAYS} days ago. Check the current state, the next task and the completed work.`);
    }

    const done = new Set(lines(v.done).map((l) => l.toLowerCase()));
    if (lines(v.task).some((l) => done.has(l.toLowerCase()))) notes.push("The next task also appears under completed work. Check which is true.");

    if (!v.task && lines(v.issues).length) notes.push("There are open issues but no next task. Say what should happen next.");

    /* "Use a chatbot" rejected and "Use a chatbot for help" decided: one line's words begin the other's (two words at least) */
    const rejected = lines(v.rejected).map(wordsOf).filter((w) => w.length >= 2);
    const begins = (a, b) => a.length <= b.length && a.every((w, i) => b[i] === w);
    const clash = lines(v.decisions).find((d) => rejected.some((r) => begins(r, wordsOf(d)) || (wordsOf(d).length >= 2 && begins(wordsOf(d), r))));
    if (clash) notes.push(`"${clash}" is both a decision and a rejected approach. Keep it in one place.`);

    return notes;

}

const wordsOf = (line) => line.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);

function daysBetween(a, b) {

    const t = (iso) => Date.UTC(...iso.split("-").map((n, i) => Number(n) - (i === 1 ? 1 : 0)));

    return Math.round((t(b) - t(a)) / 86400000);

}

/** the section headings whose fields differ between an opened pack and now */
export function changedSections(before, now) {

    return [{ key: "project", heading: "Project name" }, ...SECTIONS]
        .filter((s) => String(before[s.key] ?? "").trim() !== String(now[s.key] ?? "").trim())
        .map((s) => s.heading);

}
