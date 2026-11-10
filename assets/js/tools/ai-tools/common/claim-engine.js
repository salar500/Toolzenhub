/* =========================================================
   ToolZen Hub
   AI Tools: the claim engine (pure)

   Reads an assistant's answer and finds what in it needs
   checking: sentences with figures, dates and money; sentences
   that name a source; absolute wording; and what the answer
   leaves out (no source, no assumptions, no date). It is a
   reading aid built on word patterns. It does not know whether
   anything is true, and the page says so.
========================================================= */

import { tidy } from "./brief-engine.js";


const ABSOLUTES = Object.freeze([
    "always", "never", "guaranteed", "guarantee", "every", "all of", "no one", "nobody", "everyone", "impossible",
    "proven", "proves", "definitely", "certainly", "undoubtedly", "the best", "the cheapest", "the fastest", "the only",
    "100%", "without exception", "completely safe", "risk-free", "cannot fail", "must"
]);

const SOURCE_WORDS = Object.freeze([
    "according to", "a study", "studies show", "research shows", "research suggests", "a report", "reported", "survey",
    "data shows", "statistics", "published", "journal", "the law", "regulation", "section ", "act ", "official", "documentation says",
    "the manual", "as of"
]);

const HEDGES = Object.freeze([
    "may", "might", "could", "typically", "usually", "often", "generally", "in most cases", "likely", "probably", "roughly",
    "approximately", "about ", "around ", "i think", "i believe", "it depends"
]);

const FIGURE = /\d/;
const MONEY = /[₹$€£]|\b(?:rs\.?|inr|usd|eur|gbp|crore|lakh|lakhs|million|billion)\b/i;
const PERCENT = /\d\s*%|\bper ?cent\b|\bpercent\b/i;
const DATE = /\b(?:19|20)\d\d\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? \d{1,2}\b|\b\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b|\bq[1-4]\b|\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
const CODE_FENCE = /```[\s\S]*?```/g;
const MAX_CLAIMS = 40;


/* The answer's sentences, in order, without code blocks, list markers, headings and Markdown emphasis. */
export function sentences(text) {

    const stripped = tidy(text)
        .replace(CODE_FENCE, " ")
        .replace(/`[^`\n]*`/g, " ")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*(?:[-*•]|\d{1,2}[.)])\s+/gm, "")
        .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, "$1")
        .replace(/\|/g, " ");

    return stripped
        .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(₹$€£])|\n+/)
        .map((s) => s.replace(/\s+/g, " ").trim())
        .filter((s) => s.length >= 12 && /[a-z]/i.test(s));

}


const has = (lower, words) => words.find((w) => lower.includes(w)) ?? null;


/* One sentence, classified. `kinds` is in priority order; a sentence can carry several. */
export function classify(sentence) {

    const lower = ` ${sentence.toLowerCase()} `;
    const kinds = [];

    if (MONEY.test(sentence) && FIGURE.test(sentence)) kinds.push("money");
    if (PERCENT.test(sentence)) kinds.push("percent");
    if (DATE.test(sentence)) kinds.push("date");
    if (FIGURE.test(sentence) && !kinds.length) kinds.push("figure");

    const source = has(lower, SOURCE_WORDS);
    if (source) kinds.push("source");

    const absolute = has(lower, ABSOLUTES);
    if (absolute) kinds.push("absolute");

    const hedge = has(lower, HEDGES);

    return { text: sentence, kinds, source, absolute, hedge, checkable: kinds.length > 0 };

}


/* The whole analysis of an answer. */
export function analyse(text) {

    const all = sentences(text).map(classify);
    const claims = all.filter((c) => c.checkable).slice(0, MAX_CLAIMS);
    const lower = ` ${tidy(text).toLowerCase()} `;

    const missing = [];

    if (!all.some((c) => c.kinds.includes("source"))) {
        missing.push("No source is named. Ask where each figure or rule comes from.");
    }

    if (!/\bassum(?:e|es|ed|ing|ption|ptions)\b/.test(lower)) {
        missing.push("No assumption is stated. Ask what the answer takes for granted (your country, dates, versions, prices).");
    }

    if (!/\b(?:as of|up to date|knowledge cutoff|may have changed|check the latest|current)\b/.test(lower) && all.some((c) => c.kinds.includes("date") || c.kinds.includes("money") || c.kinds.includes("percent"))) {
        missing.push("Nothing says how current the figures are. Rates, prices, rules and versions change; ask for the date they apply to.");
    }

    if (!/\b(?:however|but|except|unless|limitation|caveat|downside|not suitable|does not)\b/.test(lower)) {
        missing.push("No limitation, exception or downside is mentioned. A real answer usually has one; ask for it.");
    }

    return {
        sentences: all.length,
        claims,
        truncated: all.filter((c) => c.checkable).length > MAX_CLAIMS,
        absolutes: all.filter((c) => c.absolute).length,
        hedged: all.filter((c) => c.hedge).length,
        missing
    };

}


const HOW = {
    money: "Recompute it or find the published figure; ask which rate, date and currency it uses.",
    percent: "Ask what it is a percentage of, and where the figure comes from.",
    date: "Confirm the date against a primary source; check whether the rule or event still holds.",
    figure: "Ask for the source of the number and whether it is exact, rounded or estimated.",
    source: "Find the source itself. If the name, year or finding cannot be found, treat the claim as unsupported.",
    absolute: "Ask for the exception. Absolute wording is where answers most often overreach."
};

const PURPOSE = {
    decision: "This answer feeds a decision with money, legal or health consequences. Verify every claim below before acting; an unverified figure is not usable.",
    code: "This answer is code or a technical instruction. Run it in a safe place first; check every named API, flag, version and path against the official documentation, and treat anything the assistant could not run as untested.",
    publish: "You will publish something based on this answer. Every figure, quote and source must be traced to a primary source you have seen yourself; the assistant's name is not a citation.",
    learning: "You are learning for yourself. Check the figures and the sourced claims; for the rest, ask the assistant for the exception or counter-argument to each absolute statement."
};


/* A verification checklist in Markdown, for the brief page. */
export function checklist({ answer, question, purpose }) {

    const result = analyse(answer);
    const parts = [];

    parts.push("# Evidence checklist for an AI answer");
    parts.push(question ? `## The question asked\n\n${tidy(question)}` : "");
    parts.push(`## Before you use it\n\n${PURPOSE[purpose] ?? PURPOSE.learning}`);
    parts.push(`## Overview\n\n- Sentences read: ${result.sentences}\n- Statements to check: ${result.claims.length}${result.truncated ? ` (the first ${MAX_CLAIMS} shown)` : ""}\n- Absolute wording: ${result.absolutes}\n- Hedged wording (may, usually, about): ${result.hedged}`);

    if (result.claims.length) {
        const items = result.claims.map((c, i) => {
            const why = c.kinds.map((k) => HOW[k]).filter((v, j, arr) => arr.indexOf(v) === j).join(" ");
            const label = c.kinds.map((k) => ({ money: "money", percent: "percentage", date: "date", figure: "figure", source: "names a source", absolute: `absolute: "${c.absolute}"` })[k]).join(", ");
            return `${i + 1}. [ ] "${c.text}"\n   ${label}. ${why}`;
        });
        parts.push(`## Statements to check\n\n${items.join("\n")}`);
    } else {
        parts.push("## Statements to check\n\nNo figures, dates, sources or absolute statements were found. The answer is general; ask for the specific facts behind it before relying on it.");
    }

    parts.push(`## What the answer leaves out\n\n${result.missing.length ? result.missing.map((m) => `- ${m}`).join("\n") : "- Sources, assumptions, currency and limitations are all mentioned. Still check that each named source exists."}`);

    const questions = [
        "Which of your statements are you least sure of, and why?",
        "For each figure, where does it come from and what date does it apply to?",
        "What would have to be true for this answer to be wrong?",
        "What did you assume about my situation that I did not tell you?"
    ];
    if (result.absolutes) questions.push("Give one exception to each absolute statement (always, never, guaranteed, the only).");
    parts.push(`## Questions to put back to the assistant\n\n${questions.map((q) => `- ${q}`).join("\n")}`);
    parts.push("## About this checklist\n\nIt was made by word patterns in your browser: it finds what to check, it does not know what is true. A statement it did not list can still be wrong.");

    return parts.filter(Boolean).join("\n\n") + "\n";

}
