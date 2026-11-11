/* =========================================================
   ToolZen Hub
   Compare Two AI Answers (AI Tools)

   Paste two answers to the same question, from two assistants
   or two attempts; the comparison engine (compare-engine.js)
   finds where they agree, where they disagree (different figures,
   one negating the other), what only one of them says, what each
   recommends and how much checkable evidence each carries. The
   page is the shared brief page.
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { comparison } from "../ai-tools/common/compare-engine.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const FOCUS = [
    { value: "completeness", label: "Which answer is more complete" },
    { value: "facts", label: "The facts and figures" },
    { value: "decision", label: "A recommendation I must choose between" },
    { value: "code", label: "Code or a technical instruction" }
];


export const CONFIG = {

    toolId: "ai-answer-compare",
    prefix: "cmp",
    outputName: "comparison",
    fileName: "two-answers-compared",
    pasteLine: "Read the disagreements first, then paste each \"Only in\" list to the other assistant in its own chat and ask it to respond.",
    intro: "Paste two answers to the same question, from ChatGPT, Claude, Copilot or two attempts with one assistant, and see where they agree, where they contradict each other, what only one of them says, what each recommends, and which carries more checkable evidence. Compared in your browser.",
    sectionTitle: "Paste the two answers",
    sectionText: "Two fields are essential. The question and what you are deciding make the comparison sharper. It is written as you type.",

    fields: [
        { key: "question", label: "The question both were asked", rows: 2, hint: "So the comparison can be read beside it.", placeholder: "Is a 5-year fixed deposit better than a debt fund for ₹5 lakh?" },
        { key: "focus", label: "What matters most to you", kind: "select", options: FOCUS, hint: "Sets the first line of the comparison." },
        { key: "answerA", label: "Answer A", required: true, rows: 9, maxlength: 20000, hint: "The whole answer, Markdown and all. Code blocks are skipped.", placeholder: "Paste the first answer here." },
        { key: "answerB", label: "Answer B", required: true, rows: 9, maxlength: 20000, hint: "The other answer to the same question.", placeholder: "Paste the second answer here." }
    ],

    compose: (v) => comparison(v),

    example: {
        values: {
            question: "Is a 5-year fixed deposit better than a debt fund for ₹5 lakh?",
            focus: "decision",
            answerA: "For most people a bank fixed deposit is the safer choice for 5 years. FD rates are currently around 7.5% for 5 years. Deposits up to ₹5 lakh per bank are insured by DICGC. Debt funds returned about 6.5% a year over the last five years. If you may need the money within a year, a liquid fund is usually the better option. I would recommend the fixed deposit if you want a known amount at the end.",
            answerB: "A debt fund is usually the better choice over 5 years. FD rates are around 7% for 5 years. The interest on a fixed deposit is taxed every year at your slab rate. Deposits up to ₹5 lakh per bank are insured by DICGC. Debt funds returned about 6.5% a year over the last five years, but a fund can lose value in a bad year; it is not guaranteed. However, if you cannot accept any fall in value, choose the fixed deposit."
        }
    },

    howTo: [
        "Ask two assistants the same question, or ask one assistant twice, and copy both whole answers.",
        "Paste them as Answer A and Answer B, add the question and choose what matters most to you.",
        "Read the disagreements first: each shows both sentences and why they conflict (different figures, or one negates the other).",
        "Read what only one answer says: an omission is often the real difference between two answers.",
        "Follow \"What to do next\": put each side's missing points to the other assistant, and find the source for any figure they disagree on."
    ],

    parts: [
        { title: "Where they disagree", text: "Sentences that say the same kind of thing but with different figures, or where one negates the other. These are the points that decide the question, and neither side is right by default; the figure's source is." },
        { title: "Where they agree", text: "Statements both answers make in a similar form. Agreement between two assistants is not confirmation: both can be wrong in the same way, so the shared figures are checked too." },
        { title: "Only in one of them", text: "What one answer raises and the other ignores. Two answers rarely contradict each other outright; they differ in what they thought worth saying, and the missing point is often the one that matters to you." },
        { title: "What each recommends, and in one look", text: "Each side's recommendation sentences, and a table of words, statements to check, sources named, absolute and hedged wording, and whether a limitation or an assumption is stated. Longer is not better; more sources and a stated limitation usually are." },
        { title: "What to do next", text: "The questions to put back: the source and date of each disputed figure, each side's missing points to the other assistant, an exception to each absolute statement, and what each would need to know about you to change its answer." }
    ],

    useWith: [
        "Put each \"Only in\" list to the other assistant in its own chat: \"Respond to each of these points.\" The answers usually converge or expose the real disagreement.",
        "For a disputed figure, ask both for the source and date, then open the source yourself; do not pick the figure that sounds more confident.",
        "For code, run both in a safe place; the comparison reads the words, not the behaviour.",
        "Keep the comparison with the decision as a record of what was checked."
    ],

    faq: [
        { q: "Does it say which answer is correct?", a: "No. It matches sentences by their shared words and flags different figures and negations, in your browser. It shows where to look and what to ask; it knows nothing about the subject." },
        { q: "Can it miss a disagreement?", a: "Yes. Two sentences that disagree in different words may not be matched, and a disagreement can hide in what only one side says. Read the \"Only in\" sections as carefully as the disagreements." },
        { q: "Why does it count hedged and absolute wording?", a: "An answer full of \"always\" and \"guaranteed\" overreaches; one full of \"may\" and \"usually\" commits to little. Neither count decides which is right, but both tell you how to read each answer." },
        { q: "Is anything sent anywhere?", a: "No. Both answers stay in your browser and nothing is stored. Remove anything confidential before you share the comparison." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = tool.build;
