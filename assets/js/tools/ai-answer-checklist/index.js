/* =========================================================
   ToolZen Hub
   AI Output Reviewer (AI Tools; id ai-answer-checklist, formerly
   the AI Answer Evidence Checklist)

   Paste an AI answer and, if you can, what you asked. The review
   lists the requested items the answer does not visibly address,
   format problems, leftovers and contradictions (review-engine.js),
   then what in it needs checking (figures, dates, money, named
   sources, absolute wording; claim-engine.js), and one follow-up
   prompt naming the gaps. Without requested items in what was
   asked, it is the evidence checklist exactly as before. Word
   patterns in the browser; it never judges truth. The page is
   the shared brief page (AI ecosystem programme, 17 §7).
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { tidy } from "../ai-tools/common/brief-engine.js";
import { review, REVIEW_TYPES } from "../ai-tools/common/review-engine.js";
import { take } from "../ai-tools/common/handoff.js";
import { ROUTES } from "../../routes.js";
import { escapeHTML } from "../../ui/escape.js";

/* the kind of answer a Workbench task produces, for a request handed over from it */
const TYPE_OF_TASK = {
    "code-feature": "code", debug: "code", "code-review": "code", refactor: "code", "api-design": "code",
    "test-plan": "testing", "test-cases": "testing", "api-testing": "testing", "test-automation": "code", regression: "testing", defect: "testing", "performance-test": "testing",
    article: "article", "social-posts": "article", "marketing-copy": "article", script: "article", repurpose: "article", "email-message": "article",
    "research-plan": "research", "literature-review": "research", "market-research": "research", report: "research", "doc-summary": "research",
    "image-generate": "media", "image-edit": "media", "product-photo": "media", thumbnail: "media", "image-series": "media",
    "video-concept": "media", storyboard: "media", "text-to-video": "media", "image-to-video": "media"
};


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


/* The brief page asks for the review three times per keystroke (the brief, the check line, the follow-up action); the same
   input gives the same review, so it is worked out once (Tool Pack 59, QD27: a long answer took about 360 ms per key). */
let last = { key: "", result: null };
const KEYS = ["answer", "question", "purpose", "reviewType", "wordLimit"];

function reviewed(values) {

    const tidied = Object.fromEntries(KEYS.map((k) => [k, tidy(values[k])]));
    const key = JSON.stringify(KEYS.map((k) => tidied[k]));

    if (key !== last.key) last = { key, result: review(tidied) };

    return last.result;

}


const PURPOSES = [
    { value: "learning", label: "Learning for myself" },
    { value: "decision", label: "A decision about money, law or health" },
    { value: "code", label: "Code or a technical instruction I will run" },
    { value: "publish", label: "Facts for something I will publish or send" }
];


export const CONFIG = {

    toolId: "ai-answer-checklist",
    prefix: "ac",
    outputName: "review",
    fileName: "ai-output-review",
    intro: "Paste an AI answer and, if you can, what you asked. Get the requested items it does not visibly address, format problems, leftovers, statements to verify, and a follow-up prompt that names the gaps. It compares words with your request and finds patterns; it does not judge whether anything is true.",
    pasteLine: "Paste the follow-up prompt into the same chat; the AI revises with the context it already has. Keep the review beside the answer and tick it as you verify.",
    sectionTitle: "Paste the answer",
    sectionText: "One field is essential. Pasting what you asked lets the review check the answer against it. The review is written as you type.",

    fields: [
        { key: "answer", label: "The AI's answer", required: true, rows: 12, maxlength: 40000, hint: "Paste the whole answer, Markdown and all. Code blocks are skipped when statements are listed.", placeholder: "Paste the answer here." },
        { key: "question", label: "What you asked (your prompt or requirements)", rows: 4, maxlength: 12000, hint: "Paste the prompt you gave, or a list of requirements. The review checks the answer against it.", placeholder: "Is a 5-year fixed deposit better than a debt fund for me?" },
        { key: "purpose", label: "What the answer is for", kind: "select", options: PURPOSES, hint: "Sets how strict the first line of the checklist is." },
        { key: "reviewType", label: "Kind of answer", kind: "select", options: REVIEW_TYPES, hint: "Adds the checks for that kind of work: test ids and expected results, code blocks, citations." },
        { key: "wordLimit", label: "Word limit, if you set one", kind: "text", maxlength: 6, hint: "Digits only. A limit written in your request, such as \"under 300 words\", is also found.", placeholder: "300" }
    ],

    compose: (v) => reviewed(v).markdown,

    notes: (values) => {
        const { counts } = reviewed(values);
        const total = counts.missing + counts.format + counts.leftovers + counts.contradictions;
        const n = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
        return total ? [`Review: ${n(counts.missing, "requested item")} not visibly addressed, ${n(counts.format, "format problem")}, ${n(counts.leftovers, "leftover")}, ${n(counts.contradictions, "contradiction")}.`] : [];
    },

    actions: [
        { id: "follow-up", label: "Copy follow-up prompt", text: (brief, values) => reviewed(values).followUp }
    ],

    wire({ setValues, announce }) {

        /* the request a Workbench pack was built for, handed over in this tab (16 D8) */
        const brought = take("review");
        if (brought?.request) {
            setValues({ question: brought.request, reviewType: TYPE_OF_TASK[brought.task] ?? "general" });
            announce(`Brought from the Workbench: the request for ${brought.title || "your task"}. Paste the AI's answer.`, 0);
            document.getElementById("ac-answer")?.focus();
        }

        const go = document.createElement("p");
        go.className = "ai-note";
        go.innerHTML = `Two answers to the same question? <a href="${escapeHTML(ROUTES.tool("tools", "ai-answer-compare"))}">Compare Two AI Answers</a>.`;
        document.querySelector(".ai-usewith")?.after(go);

    },

    example: {
        values: {
            answer: "For most people in India, a bank fixed deposit is the safer choice. FD rates are currently around 7.5% for 5 years, and deposits up to ₹5 lakh are insured by DICGC. According to a 2023 SEBI report, debt funds returned 6.2% on average over the same period, but returns are never guaranteed. Debt funds are always more tax-efficient because of indexation. However, if you may need the money within a year, a liquid fund is usually the better option.",
            question: "Is a 5-year fixed deposit better than a debt fund for ₹5 lakh?",
            purpose: "decision"
        }
    },

    howTo: [
        "Copy the AI's whole answer and paste it into the first field.",
        "Paste what you asked: your prompt, or the requirements. From the AI Workbench, \"Open the AI Output Reviewer with this request\" fills it for you.",
        "Choose what the answer is for and what kind of answer it is.",
        "Read what the review found against your request, the format problems and leftovers, then the statements to check.",
        "Copy the follow-up prompt into the same chat, and tick the review as you verify. Nothing is kept here."
    ],

    parts: [
        { title: "Against your request", text: "Each requested item of your prompt (its requirements and format lines, or its bullet points, or its sentences with must and should), and whether its words appear in the answer. \"Not visibly addressed\" means no matching words were found; the answer may say it differently, so read for it." },
        { title: "Format, leftovers and contradictions", text: "A table, JSON, headings, code, a word limit or a number of items you asked for and did not get; placeholders such as TODO or [add: …] left in; an answer that stops mid-sentence; and two sentences that give different figures for the same thing." },
        { title: "Follow-up prompt", text: "One prompt that names only the gaps found, for the same chat, asking for the corrected answer in full without new facts." },
        { title: "Statements to check", text: "Sentences with money, percentages, dates or other figures, sentences that name a source, and sentences with absolute wording (always, never, guaranteed, the only). These are where a confident answer most often goes wrong, and each comes with the way to check it." },
        { title: "What the answer leaves out", text: "Whether any source is named, whether an assumption is stated, whether the figures carry a date, and whether any limitation or exception is mentioned. An answer with none of these is not wrong, but it has given you nothing to check it against." },
        { title: "Questions to put back to the assistant", text: "The questions that make an assistant show its working: what it is least sure of, where each figure comes from, what would make it wrong, and what it assumed about you. Asked in the same chat, they often change the answer." },
        { title: "Before you use it", text: "One line that depends on what the answer is for. Code gets run safely first; a money, legal or health decision gets every claim verified; something you will publish gets primary sources you have seen yourself." }
    ],

    useWith: [
        "Paste the \"Questions to put back to the assistant\" section into the same chat; the assistant answers them with the context it already has.",
        "For a figure, ask the assistant for its source, then open the source yourself. The assistant's confidence is not evidence.",
        "For code, the checklist is a reading aid: still run it in a safe place and check each named API or flag against the official documentation.",
        "Keep the downloaded checklist with the decision or the document, ticked, as a record of what was verified."
    ],

    faq: [
        { q: "Does this tell me whether the answer is correct?", a: "No. It finds the statements that can be checked and tells you how, using word patterns in your browser. It knows nothing about the subject. A statement it did not list can still be wrong, and one it listed can be right." },
        { q: "Why does it flag absolute words?", a: "Because \"always\", \"never\", \"guaranteed\" and \"the only\" are where answers overreach most. A true statement with an absolute word usually has an exception the answer did not give; asking for it is cheap." },
        { q: "Is the answer sent anywhere?", a: "No. The text stays in your browser and nothing is stored. Paste what you like; remove anything confidential before you share the checklist." },
        { q: "What counts as a source?", a: "Phrases such as \"according to\", \"a study\", \"research shows\", \"the law\", \"section\" or \"as of\". The checklist asks you to find that source yourself: a source that cannot be found is treated as unsupported." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = tool.build;
