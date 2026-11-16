/* =========================================================
   ToolZen Hub
   AI Tools: the AI Output Reviewer engine (AI ecosystem programme, 17 §7)

   Checks an AI answer against what the visitor asked: which
   requested items have no visible match in the answer, whether
   the requested format was followed (a table, JSON, headings, a
   word limit, a number of items), placeholders left in, and where
   the answer gives two different figures for the same thing. Then
   the existing evidence checklist (claim-engine.js) and one
   follow-up prompt that names only the gaps.

   It reads words, not meaning: "not visibly addressed" means no
   matching words were found, and the page says so. It never
   judges whether anything is true. Pure; no DOM.
========================================================= */

import { tidy } from "./brief-engine.js";
import { sentences, checklist } from "./claim-engine.js";
import { similarity, conflict } from "./compare-engine.js";
import { sectionsOf, keyOf } from "./pack-format.js";

export const REVIEW_TYPES = Object.freeze([
    { value: "general", label: "General" },
    { value: "code", label: "Code" },
    { value: "testing", label: "Test plan or test cases" },
    { value: "article", label: "Article or copy" },
    { value: "research", label: "Research or report" },
    { value: "media", label: "Image or video prompt" }
]);

export const MAX_REQUIREMENTS = 40;
export const MAX_SENTENCES = 400;

const STOP = new Set(("about above after again against also because been before being below between both but could does doing down during each from further have having here into itself just more most must need only other over same should some such than that their them then there these they this those through under until very were what when where which while will with would your yours answer give make write include including using please each every").split(" "));

const stem = (w) => w.replace(/(?:ies)$/, "y").replace(/(?:ing|ed|es|s)$/, (m, offset, whole) => whole.length - m.length >= 4 ? "" : m);

/** content words of a text: four letters or more, not a stop word, lightly stemmed */
export function contentWords(text) {

    return [...new Set(String(text).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOP.has(w)).map(stem))];

}

const strip = (line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").replace(/^\[[ x]\]\s*/i, "").trim();

/*
 * The requested items of a request: the lines under "Requirements" and "Format of your answer" (a Workbench prompt),
 * else every bullet or numbered line, else every sentence with must, should, include or need.
 */
export function extractRequirements(request) {

    const text = tidy(request);
    if (!text) return [];

    const wanted = sectionsOf(text).filter((s) => ["requirements", "format of your answer", "acceptance criteria", "must include"].includes(keyOf(s.title)));
    let items = wanted.flatMap((s) => s.body.split("\n")).map(strip).filter(Boolean);

    if (!items.length) {
        items = text.split("\n").filter((l) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(l)).map(strip).filter(Boolean);
    }

    if (!items.length) {
        items = sentences(text).filter((s) => /\b(?:must|should|include|needs? to|make sure|ensure)\b/i.test(s));
    }

    return [...new Set(items)].filter((i) => contentWords(i).length >= 1).slice(0, MAX_REQUIREMENTS);

}

/** { item, addressed, excerpt }: addressed when at least half of its content words (at least two, or its only one) appear */
export function coverage(item, answer) {

    const words = contentWords(item);
    const answerWords = new Set(contentWords(answer));
    const found = words.filter((w) => answerWords.has(w));
    const needed = words.length === 1 ? 1 : Math.max(2, Math.ceil(words.length / 2));
    const addressed = found.length >= needed;

    let excerpt = "";
    if (addressed) {
        let best = 0;
        for (const s of sentences(answer).slice(0, MAX_SENTENCES)) {
            const own = new Set(contentWords(s));
            const hits = found.filter((w) => own.has(w)).length;
            if (hits > best) {
                best = hits;
                excerpt = s.length > 160 ? `${s.slice(0, 157)}…` : s;
            }
        }
    }

    return { item, addressed, excerpt };

}

const countWords = (text) => (String(text).replace(/```[\s\S]*?```/g, " ").match(/\S+/g) ?? []).length;

/** format problems, in words */
export function formatChecks(request, answer, wordLimit = "") {

    const req = tidy(request).toLowerCase();
    const out = [];
    const body = tidy(answer);

    if (/\btable\b/.test(req) && !/^\s*\|?\s*:?-{3,}/m.test(body)) out.push("The request asks for a table, but the answer has no Markdown table.");

    if (/\bjson\b/.test(req) && /\bonly\b/.test(req)) {
        const fencedJson = body.match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/);
        const candidate = fencedJson ? fencedJson[1] : body;
        try {
            JSON.parse(candidate);
        } catch (error) {
            const at = /position (\d+)/.exec(String(error.message))?.[1];
            out.push(`The request asks for JSON only, but the answer is not valid JSON${at ? ` (the parser stopped at character ${at})` : ""}.`);
        }
    }

    if (/\bheadings?\b|\bsections?\b/.test(req) && !/^#{1,6}\s+\S/m.test(body) && !/^\*\*[^*]+\*\*\s*$/m.test(body)) {
        out.push("The request asks for headings or sections, but the answer has no headings.");
    }

    if (/\bcode\b/.test(req) && /\b(?:write|fix|give|return)\b/.test(req) && !/```/.test(body)) out.push("The request asks for code, but the answer has no code block.");

    const limit = Number(String(wordLimit).replace(/[^\d]/g, "")) || Number((/(?:under|at most|no more than|maximum of|max\.?|up to|within)\s+(\d[\d,]*)\s+words/i.exec(req)?.[1] ?? "").replace(/,/g, ""));
    if (limit) {
        const n = countWords(body);
        if (n > limit) out.push(`The answer has ${n} words; the limit is ${limit}.`);
    }

    const count = /\b(\d{1,3})\s+(?:items|posts|ideas|test cases|cases|questions|points|bullets|tips|examples|steps|titles|options|variations)\b/.exec(req);
    if (count) {
        const wanted = Number(count[1]);
        const items = body.split("\n").filter((l) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(l)).length;
        if (items && items !== wanted) out.push(`The request asks for ${wanted}; the answer lists ${items} items.`);
    }

    return out;

}

const LEFTOVERS = [
    [/\[add:/i, "an [add: …] placeholder"],
    [/\bTODO\b/, "TODO"],
    [/\bTBD\b/, "TBD"],
    [/\blorem ipsum\b/i, "lorem ipsum"],
    [/\bX{3,}\b/, "XXX"],
    [/<\s*(?:placeholder|insert[^>]*|your [^>]*)>/i, "a <placeholder>"],
    [/\[(?:insert|your|name|date|company)[^\]]*\]/i, "a [bracketed placeholder]"],
    [/\bas an ai\b/i, "\"as an AI\""]
];

/** placeholders and signs of an unfinished answer */
export function leftovers(answer) {

    const body = tidy(answer);
    const out = LEFTOVERS.filter(([re]) => re.test(body)).map(([, label]) => `The answer contains ${label}.`);

    if (((body.match(/^```/gm) ?? []).length) % 2 === 1) out.push("A code block is opened but never closed: the answer may be cut off.");
    else if (body && !/[.!?:)\]"'`*|>]\s*$/.test(body) && !/```\s*$/.test(body)) out.push("The answer does not end with a full stop or closing mark: it may be cut off.");

    return out;

}

/** pairs of sentences inside one answer that give different figures, or one negates the other, for the same thing */
export function contradictions(answer) {

    const list = sentences(tidy(answer)).slice(0, MAX_SENTENCES);
    const out = [];

    for (let i = 0; i < list.length && out.length < 10; i += 1) {
        for (let j = i + 1; j < list.length && out.length < 10; j += 1) {
            if (similarity(list[i], list[j]) >= 0.6) {
                const why = conflict(list[i], list[j]);
                if (why) out.push({ a: list[i], b: list[j], why });
            }
        }
    }

    return out;

}

/**
 * The review in Markdown. Without requested items found in the request, it is exactly the evidence checklist (so a
 * plain question keeps the page's earlier behaviour); with them, the request sections come first.
 */
export function review({ answer, question, purpose, reviewType, wordLimit }) {

    const base = checklist({ answer, question, purpose });
    const requested = extractRequirements(question);
    const format = formatChecks(question, answer, wordLimit);
    const left = leftovers(answer);
    const clashes = contradictions(answer);
    const typeChecks = typeSpecific(reviewType, question, answer);

    if (!requested.length && !format.length && !left.length && !clashes.length && !typeChecks.length) {
        return { markdown: base, followUp: "", counts: { missing: 0, format: 0, leftovers: 0, contradictions: 0 } };
    }

    const cov = requested.map((r) => coverage(r, answer));
    const missing = cov.filter((c) => !c.addressed);
    const parts = ["# Review of an AI answer"];

    if (cov.length) {
        parts.push(`## Against your request\n\nEach requested item, and whether its words appear in the answer. "Not visibly addressed" means no matching words were found: read the answer for it, as it may be said differently.\n\n${cov.map((c) => `- [ ] ${c.item}: ${c.addressed ? `visibly addressed${c.excerpt ? ` ("${c.excerpt}")` : ""}` : "**not visibly addressed**"}`).join("\n")}`);
    }

    parts.push(`## Format\n\n${[...format, ...typeChecks].length ? [...format, ...typeChecks].map((f) => `- ${f}`).join("\n") : "- No format problems found by these checks."}`);
    if (left.length) parts.push(`## Leftovers\n\n${left.map((l) => `- ${l}`).join("\n")}`);
    if (clashes.length) parts.push(`## Contradictions inside the answer\n\n${clashes.map((c) => `- ${c.why}:\n  - "${c.a}"\n  - "${c.b}"`).join("\n")}`);

    parts.push(base.replace(/^# Evidence checklist for an AI answer\n\n/, "").replace(/^## The question asked\n\n[\s\S]*?\n\n(?=## )/, "").trim());

    const followUp = followUpPrompt({ missing: missing.map((m) => m.item), format: [...format, ...typeChecks], leftovers: left, clashes });
    if (followUp) parts.push(`## Follow-up prompt\n\n\`\`\`text\n${followUp}\n\`\`\``);

    parts.push("## What this review cannot tell you\n\nWhether any statement is true, whether the reasoning is sound, or whether a cited source says what is claimed. It compares words with your request and finds patterns; check the facts yourself.");

    return {
        markdown: `${parts.filter(Boolean).join("\n\n")}\n`,
        followUp,
        counts: { missing: missing.length, format: format.length + typeChecks.length, leftovers: left.length, contradictions: clashes.length }
    };

}

function typeSpecific(type, request, answer) {

    const body = tidy(answer);
    const out = [];

    if (!body) return out;

    if (type === "testing") {
        if (!/\b(?:TC|ID|Case)[-_ ]?\d+/i.test(body) && !/^\s*\|.*\bid\b.*\|/im.test(body)) out.push("No test case ids were found (TC-1, ID, Case 1).");
        if (!/expected/i.test(body)) out.push("No expected results were found: each case needs one.");
    }

    if (type === "code" && !/```/.test(body)) out.push("Review type is code, but the answer has no code block.");

    if (type === "research" && !/(?:https?:\/\/|\bdoi\b|\(\s*\d{4}\s*\)|\bet al\b)/i.test(body)) out.push("No citations or links were found to check.");

    return out;

}

/** one prompt that names the gaps, in the order found; empty when there are none */
export function followUpPrompt({ missing = [], format = [], leftovers: left = [], clashes = [] }) {

    const lines = [
        ...missing.map((m) => `- Address this requirement, which I could not find in your answer: ${m}`),
        ...format.map((f) => `- Fix the format: ${f}`),
        ...left.map((l) => `- Remove or complete this: ${l}`),
        ...clashes.map((c) => `- These two statements disagree (${c.why}); say which is right and why: "${c.a}" / "${c.b}"`)
    ];

    return lines.length
        ? `Please revise your last answer.\n\n${lines.join("\n")}\n\nKeep everything that is already correct. Do not add facts I did not give you; mark anything uncertain. Then give the corrected answer in full.`
        : "";

}
