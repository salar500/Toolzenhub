/* =========================================================
   ToolZen Hub
   AI Tools: the comparison engine (pure)

   Two answers to the same question, read against each other:
   which statements both make, where they disagree (a different
   number, or one negates the other), what only one of them says,
   what each recommends, and how much checkable evidence each
   carries. It compares the texts; it does not know which one is
   right, and the page says so.
========================================================= */

import { tidy } from "./brief-engine.js";
import { sentences, classify } from "./claim-engine.js";


const STOP = new Set(("a an the and or but of to in on at for with by from as is are was were be been being it its this that these those there here " +
    "you your i we they he she them our their his her my me us if then than so because while also very just can could would should may might will shall " +
    "do does did not no have has had into over under about which who whom what when where why how all any some such more most other same both each").split(" "));

const NEGATION = /\b(?:not|no|never|cannot|can't|don't|doesn't|isn't|aren't|won't|wouldn't|shouldn't|neither|nor|without|unless)\b|n't\b/i;
const RECOMMENDS = /\b(?:should|recommend|recommended|better|best|prefer|preferable|choose|go with|opt for|avoid|instead|rather than|safer|worth|advisable|suggest)\b/i;
const MAX_LIST = 10;


/* The content words of a sentence, lower case, stemmed a little (plurals and -ing/-ed), without stop words. */
export function tokens(sentence) {

    return new Set(
        sentence.toLowerCase()
            .replace(/[₹$€£%]/g, " ")
            .split(/[^a-z0-9.]+/)
            .map((w) => w.replace(/^\.+|\.+$/g, ""))
            .filter((w) => w.length > 2 && !STOP.has(w))
            .map((w) => w.replace(/(?:ies)$/, "y").replace(/(?:ing|ed|es|s)$/, (m, offset, whole) => whole.length - m.length >= 3 ? "" : m))
    );

}


/* The numbers in a sentence, as plain decimals (commas and Indian grouping removed). */
export function numbers(sentence) {

    return (sentence.replace(/(\d),(?=\d)/g, "$1").match(/\d+(?:\.\d+)?/g) || []).map(Number);

}


/* The overlap of two sentences: how many content words they share, and that count over the smaller set (0 to 1). */
export function overlap(a, b) {

    const ta = tokens(a);
    const tb = tokens(b);
    let shared = 0;

    for (const t of ta) {
        if (tb.has(t)) shared += 1;
    }

    return {
        shared,
        score: ta.size && tb.size ? shared / Math.min(ta.size, tb.size) : 0,
        extra: Math.max(ta.size, tb.size) - shared
    };

}


export const similarity = (a, b) => overlap(a, b).score;


/* Two matched sentences in conflict: different figures, or one negated and the other not. A longer sentence that
   repeats the shorter one and adds a caveat ("…, but it is not guaranteed") is an addition, not a contradiction. */
export function conflict(a, b) {

    const na = numbers(a);
    const nb = numbers(b);

    if (na.length && nb.length && (na.length !== nb.length || na.some((n, i) => n !== nb[i]))) {
        return "different figures";
    }

    if (NEGATION.test(a) !== NEGATION.test(b)) {
        const o = overlap(a, b);
        return o.score === 1 && o.extra >= 2 ? null : "one says the opposite of the other";
    }

    return null;

}


/* A side's evidence profile. */
export function profile(text) {

    const all = sentences(text).map(classify);

    return {
        words: (tidy(text).match(/\S+/g) || []).length,
        sentences: all.length,
        checkable: all.filter((c) => c.checkable).length,
        sources: all.filter((c) => c.kinds.includes("source")).length,
        absolutes: all.filter((c) => c.absolute).length,
        hedges: all.filter((c) => c.hedge).length,
        limitations: /\b(?:however|but|except|unless|limitation|caveat|downside|depends|not suitable|does not)\b/i.test(text),
        assumptions: /\bassum(?:e|es|ed|ing|ption|ptions)\b/i.test(text),
        recommendations: all.filter((c) => RECOMMENDS.test(c.text)).map((c) => c.text)
    };

}


/* The comparison itself. */
export function compare(answerA, answerB, threshold = 0.7) {

    const a = sentences(answerA);
    const b = sentences(answerB);
    const usedB = new Set();
    const agree = [];
    const disagree = [];
    const onlyA = [];

    for (const sa of a) {

        let best = { score: 0, shared: 0, index: -1 };

        b.forEach((sb, i) => {
            if (usedB.has(i)) return;
            const o = overlap(sa, sb);
            if (o.score > best.score) best = { score: o.score, shared: o.shared, index: i };
        });

        /* a match needs most of the smaller sentence's words and at least two of them (one shared word is a coincidence) */
        if (best.score >= threshold && best.shared >= 2) {
            usedB.add(best.index);
            const why = conflict(sa, b[best.index]);
            (why ? disagree : agree).push({ a: sa, b: b[best.index], why });
        } else {
            onlyA.push(sa);
        }

    }

    const onlyB = b.filter((_, i) => !usedB.has(i));

    return {
        agree,
        disagree,
        onlyA,
        onlyB,
        profileA: profile(answerA),
        profileB: profile(answerB)
    };

}


const FOCUS = {
    facts: "You are comparing the facts and figures. Where the two answers give different numbers, neither is right by default: find the source for each before you use either.",
    decision: "You are choosing between recommendations. Read each side's recommendation and its reason, then the points only one of them raised; a recommendation that ignores a point the other made is the weaker one until it answers it.",
    code: "You are comparing two technical answers. Prefer neither on style: run both in a safe place, check every named API, flag and version against the documentation, and note which one handles the cases only the other mentioned.",
    completeness: "You are checking which answer is more complete. The \"only in\" sections are the heart of this: give each assistant the points it missed and ask it to respond."
};

const SIDE = (label, p) => `| ${label} | ${p.words} | ${p.sentences} | ${p.checkable} | ${p.sources} | ${p.absolutes} | ${p.hedges} | ${p.limitations ? "yes" : "no"} | ${p.assumptions ? "yes" : "no"} |`;
const quote = (s) => `"${s}"`;
const cut = (list) => list.slice(0, MAX_LIST);


/* A Markdown comparison, for the brief page. */
export function comparison({ answerA, answerB, question, focus, labelA = "Answer A", labelB = "Answer B" }) {

    const r = compare(answerA, answerB);
    const parts = [];

    parts.push("# Two answers compared");
    parts.push(question ? `## The question\n\n${tidy(question)}` : "");
    parts.push(`## Before you choose\n\n${FOCUS[focus] ?? FOCUS.completeness}`);
    parts.push(`## In one look\n\n| | Words | Sentences | Statements to check | Sources named | Absolute wording | Hedged wording | Mentions a limitation | States an assumption |\n|---|---|---|---|---|---|---|---|---|\n${SIDE(labelA, r.profileA)}\n${SIDE(labelB, r.profileB)}`);

    parts.push(`## Where they disagree\n\n${r.disagree.length
        ? cut(r.disagree).map((d, i) => `${i + 1}. ${d.why}.\n   - ${labelA}: ${quote(d.a)}\n   - ${labelB}: ${quote(d.b)}`).join("\n")
        : "No matched statement contradicts the other. (A disagreement can still hide in what only one side says, below.)"}`);

    parts.push(`## Where they agree\n\n${r.agree.length
        ? cut(r.agree).map((d) => `- ${quote(d.a)}`).join("\n") + (r.agree.length > MAX_LIST ? `\n- and ${r.agree.length - MAX_LIST} more` : "")
        : "No statement appears in both answers in a similar form."}\n\nAgreement between two assistants is not confirmation: both can be wrong in the same way. Check the shared figures too.`);

    parts.push(`## Only in ${labelA}\n\n${r.onlyA.length ? cut(r.onlyA).map((s) => `- ${quote(s)}`).join("\n") + (r.onlyA.length > MAX_LIST ? `\n- and ${r.onlyA.length - MAX_LIST} more` : "") : "Nothing that the other answer does not also say."}`);
    parts.push(`## Only in ${labelB}\n\n${r.onlyB.length ? cut(r.onlyB).map((s) => `- ${quote(s)}`).join("\n") + (r.onlyB.length > MAX_LIST ? `\n- and ${r.onlyB.length - MAX_LIST} more` : "") : "Nothing that the other answer does not also say."}`);

    const recA = r.profileA.recommendations;
    const recB = r.profileB.recommendations;
    parts.push(`## What each recommends\n\n- ${labelA}: ${recA.length ? recA.slice(0, 3).map(quote).join(" ") : "no recommendation found."}\n- ${labelB}: ${recB.length ? recB.slice(0, 3).map(quote).join(" ") : "no recommendation found."}`);

    const next = [];
    if (r.disagree.length) next.push(`For each disagreement above, ask both assistants: "Where does this figure (or claim) come from, and what date does it apply to?" Then find the source yourself.`);
    if (r.onlyA.length) next.push(`Paste the "Only in ${labelA}" points to the assistant that wrote ${labelB} and ask it to respond to each.`);
    if (r.onlyB.length) next.push(`Paste the "Only in ${labelB}" points to the assistant that wrote ${labelA} and ask it to respond to each.`);
    if (!r.profileA.sources && !r.profileB.sources) next.push("Neither answer names a source. Ask each: \"Which source would you point me to for your main claim?\"");
    if (r.profileA.absolutes || r.profileB.absolutes) next.push("Ask for one exception to each absolute statement (always, never, guaranteed, the only).");
    next.push("Ask each assistant what it would need to know about your situation to change its answer.");
    parts.push(`## What to do next\n\n${next.map((n) => `- ${n}`).join("\n")}`);

    parts.push("## About this comparison\n\nIt matches sentences by their shared words and flags different figures and negations, in your browser. It finds where to look; it does not know which answer is right, and it can miss a disagreement written in different words.");

    return parts.filter(Boolean).join("\n\n") + "\n";

}
