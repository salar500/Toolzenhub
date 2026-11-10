/* =========================================================
   ToolZen Hub
   AI Tools: the brief engine (pure)

   Every AI Tool of the first department takes a guided form and
   composes a brief (a prompt, a debugging task, a context pack)
   that the visitor pastes into ChatGPT, Claude, Gemini or any
   assistant. This module holds what they share and nothing that
   touches the page: the text helpers, the clarity check and the
   composer that runs a tool's own compose() over tidied values.

   Nothing here calls any AI service, stores anything or needs a
   key. The clarity check is a heuristic about the brief's
   completeness; it says nothing about whether an answer will be
   correct.
========================================================= */


/* Words that usually hide a detail the assistant will have to guess. */
export const VAGUE_WORDS = Object.freeze([
    "etc",
    "etc.",
    "and so on",
    "something like",
    "stuff",
    "things like that",
    "whatever",
    "some kind of",
    "as needed",
    "you know"
]);

const SHORT_LIMIT = 12;


/* Text as typed, made tidy: CRLF to LF, trailing spaces gone, at most one blank line in a row. */
export function tidy(text) {

    return String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.replace(/\s+$/g, ""))
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

}


/* The non-empty lines of a field, each without a leading list marker ("-", "*", "1.", "1)"). */
export function lines(text) {

    return tidy(text)
        .split("\n")
        .map((line) => line.trim().replace(/^(?:[-*•]|\d{1,2}[.)])\s+/, ""))
        .filter(Boolean);

}


/* A Markdown bullet list from a field (one item per line). */
export function bullets(text) {

    return lines(text).map((line) => `- ${line}`).join("\n");

}


/* A Markdown numbered list from a field (one step per line). */
export function numbered(text) {

    return lines(text).map((line, index) => `${index + 1}. ${line}`).join("\n");

}


/* A fenced block, for error output and logs; a fence inside the text is kept harmless with a longer fence. */
export function fenced(text, language = "") {

    const body = tidy(text);
    const longest = Math.max(2, ...[...body.matchAll(/`{3,}/g)].map((m) => m[0].length));
    const fence = "`".repeat(longest + 1);

    return `${fence}${language}\n${body}\n${fence}`;

}


/* "## Heading\n\nbody" when there is a body, otherwise nothing: an empty zone is never rendered. */
export function section(heading, body, level = 2) {

    const text = tidy(body);

    return text ? `${"#".repeat(level)} ${heading}\n\n${text}` : "";

}


/* Sections joined with a blank line between them; empty ones vanish. */
export function document(parts) {

    return parts.filter((part) => tidy(part)).map(tidy).join("\n\n") + "\n";

}


/* Words, not Markdown marks: a token counts when it holds a letter or a digit ("#", "-" and "```" do not). */
export function wordCount(text) {

    return tidy(text).split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;

}


/*
 * The clarity check: which essentials are missing and which answers look vague.
 *
 * fields: [{ key, label, required }]   values: { key: text }
 * Returns { missing: [{ key, label }], warnings: [{ key, label, text }], filled, total, score }.
 * `score` is a 0 to 100 heuristic of completeness (20 off per missing essential, 5 off per warning).
 */
export function clarityCheck(fields, values) {

    const missing = [];
    const warnings = [];
    let filled = 0;

    for (const field of fields) {

        const text = tidy(values[field.key]);

        if (!text) {
            if (field.required) {
                missing.push({ key: field.key, label: field.label });
            }
            continue;
        }

        /* a choice left at its first option is the default, not something the visitor filled in */
        if (field.kind === "select") {
            if (field.options?.length && text !== tidy(field.options[0].value)) {
                filled += 1;
            }
            continue;
        }

        filled += 1;

        const lower = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;
        const vague = VAGUE_WORDS.find((word) => lower.includes(` ${word} `) || lower.includes(` ${word},`) || lower.endsWith(` ${word} `));

        if (vague) {
            warnings.push({ key: field.key, label: field.label, text: `"${vague}" leaves the assistant to guess: name what you mean, or leave it out.` });
        }

        /* a one-line field (a name, a role) is short by nature; the warning is for a long answer given in two words */
        if (field.required && field.kind !== "text" && text.length < SHORT_LIMIT) {
            warnings.push({ key: field.key, label: field.label, text: "This is very short. One or two full sentences give the assistant far more to work with." });
        }

    }

    const score = Math.max(0, 100 - missing.length * 20 - warnings.length * 5);

    return { missing, warnings, filled, total: fields.length, score };

}


/*
 * A tool's brief from its raw field values.
 *
 * config: { fields, compose(values) }  where compose returns the Markdown for tidied values.
 * Returns { state: "empty" | "incomplete" | "ok", check, markdown, words }.
 * The brief is composed even while essentials are missing, so the visitor sees it take shape; the state says whether it is ready.
 */
export function buildBrief(config, values) {

    const tidied = Object.fromEntries(config.fields.map((field) => [field.key, tidy(values[field.key])]));
    const check = clarityCheck(config.fields, tidied);

    if (check.filled === 0) {
        return { state: "empty", check, markdown: "", words: 0 };
    }

    const markdown = config.compose(tidied);

    return {
        state: check.missing.length ? "incomplete" : "ok",
        check,
        markdown,
        words: wordCount(markdown)
    };

}
