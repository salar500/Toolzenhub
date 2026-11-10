/* =========================================================
   ToolZen Hub
   AI Answer Evidence Checklist (AI Tools)

   Paste an assistant's answer; get the list of what in it needs
   checking (figures, dates, money, named sources, absolute
   wording), what it leaves out, and the questions to put back
   to the assistant. The analysis is word patterns in the
   browser (claim-engine.js); the page is the shared brief page.
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { checklist } from "../ai-tools/common/claim-engine.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const PURPOSES = [
    { value: "learning", label: "Learning for myself" },
    { value: "decision", label: "A decision about money, law or health" },
    { value: "code", label: "Code or a technical instruction I will run" },
    { value: "publish", label: "Facts for something I will publish or send" }
];


export const CONFIG = {

    toolId: "ai-answer-checklist",
    prefix: "ac",
    outputName: "checklist",
    fileName: "evidence-checklist",
    intro: "Paste an answer from ChatGPT, Claude, Gemini or any assistant and get a checklist of what in it needs checking: every figure, date, amount, named source and absolute statement, what the answer leaves out, and the questions to put back to the assistant.",
    pasteLine: "Keep the checklist beside the answer and tick it as you verify. Paste its last questions back into the same chat; the assistant answers them with the context it already has.",
    sectionTitle: "Paste the answer",
    sectionText: "One field is essential. Saying what you asked and what the answer is for makes the checklist sharper. It is written as you type.",

    fields: [
        { key: "answer", label: "The assistant's answer", required: true, rows: 12, maxlength: 20000, hint: "Paste the whole answer, Markdown and all. Code blocks are skipped.", placeholder: "Paste the answer here." },
        { key: "question", label: "What you asked", rows: 2, hint: "The question or task, so the checklist can be read beside it.", placeholder: "Is a 5-year fixed deposit better than a debt fund for me?" },
        { key: "purpose", label: "What the answer is for", kind: "select", options: PURPOSES, hint: "Sets how strict the first line of the checklist is." }
    ],

    compose: (v) => checklist(v),

    example: {
        values: {
            answer: "For most people in India, a bank fixed deposit is the safer choice. FD rates are currently around 7.5% for 5 years, and deposits up to ₹5 lakh are insured by DICGC. According to a 2023 SEBI report, debt funds returned 6.2% on average over the same period, but returns are never guaranteed. Debt funds are always more tax-efficient because of indexation. However, if you may need the money within a year, a liquid fund is usually the better option.",
            question: "Is a 5-year fixed deposit better than a debt fund for ₹5 lakh?",
            purpose: "decision"
        }
    },

    howTo: [
        "Copy the assistant's whole answer and paste it into the first field.",
        "Add the question you asked and choose what the answer is for.",
        "Read the statements to check: each has a box, what kind of claim it is, and how to check it.",
        "Read what the answer leaves out, then put the listed questions back to the assistant in the same chat.",
        "Copy or download the checklist and tick it as you verify. Nothing is kept here."
    ],

    parts: [
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
