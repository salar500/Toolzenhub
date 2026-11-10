/* =========================================================
   ToolZen Hub
   AI Prompt Builder (AI Tools)

   A rough idea becomes a complete prompt: the task, who the
   assistant should act as, who the result is for, the context,
   the material that will follow, the rules, the format, an
   example of good, the success criteria and what to do when
   something is unclear. The page is drawn by the shared brief
   page; this file is the tool's own wording, fields and compose().
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { section, bullets, document as doc } from "../ai-tools/common/brief-engine.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const FORMATS = [
    { value: "", label: "Let the assistant choose" },
    { value: "Short paragraphs of plain prose.", label: "Plain paragraphs" },
    { value: "A bullet list, one point per line.", label: "Bullet list" },
    { value: "Numbered steps in the order they are done.", label: "Numbered steps" },
    { value: "A Markdown table.", label: "Table" },
    { value: "A Markdown document with headings.", label: "Markdown document with headings" },
    { value: "Valid JSON only, with no text before or after it.", label: "JSON only" },
    { value: "Code only, in one block, with no explanation unless I ask.", label: "Code only" },
    { value: "An email, ready to send.", label: "Email" }
];

const UNCLEAR = [
    { value: "Before you answer, ask me any question whose answer would change the result. Then wait.", label: "Ask me first, then wait" },
    { value: "Do not ask questions. State every assumption you make in a short list at the top, then answer.", label: "State assumptions and continue" },
    { value: "If one choice would change the result, give me the two versions and say which you would pick and why.", label: "Give two versions" }
];


export const CONFIG = {

    toolId: "prompt-builder",
    prefix: "pb",
    outputName: "prompt",
    fileName: "prompt",
    intro: "Say what you want in your own words and get a complete prompt: the task, the context, the rules, the format and how you will judge the result. Paste it into ChatGPT, Claude, Gemini or any assistant.",
    sectionTitle: "Describe what you want",
    sectionText: "Two fields are essential. The rest make the answer better each time you fill one in. The prompt is written as you type.",

    fields: [
        { key: "goal", label: "What should the assistant produce?", required: true, rows: 3, hint: "One or two sentences. Name the thing itself: a plan, a reply, a table, a function, a summary.", placeholder: "A one-page summary of our customer survey for Monday's leadership meeting." },
        { key: "role", label: "Who should the assistant act as?", kind: "text", hint: "A role sets the knowledge and the tone. Leave it empty if it does not matter.", placeholder: "an experienced customer-research analyst" },
        { key: "audience", label: "Who is the result for?", kind: "text", hint: "The reader decides the level of detail and the words used.", placeholder: "senior managers with no research background" },
        { key: "context", label: "Background the assistant needs", rows: 4, hint: "What exists, what happened, what was tried. Facts, not opinions.", placeholder: "We sent a 12-question survey to 2,000 customers in October; 420 answered. Three questions were free text." },
        { key: "material", label: "Material you will paste after the prompt", rows: 2, hint: "Name each thing and its form, so the assistant knows what to expect.", placeholder: "The survey export as CSV, 420 rows. The three free-text questions as a separate list." },
        { key: "rules", label: "Rules and limits", rows: 4, hint: "One per line: length, language, tone, what to leave out, what must be true.", placeholder: "No more than 400 words\nBritish English\nQuote at least two customer comments word for word\nDo not invent numbers that are not in the data" },
        { key: "format", label: "Format of the answer", kind: "select", options: FORMATS, hint: "The shape of the result." },
        { key: "example", label: "An example of what good looks like", rows: 3, hint: "A short sample, or a description of one you liked. Optional, and very effective.", placeholder: "Like last quarter's summary: a headline finding, three themes with a number each, then two risks." },
        { key: "success", label: "How you will judge the result", required: true, rows: 3, hint: "One per line. The assistant checks its own answer against these before it replies.", placeholder: "A manager can read it in two minutes\nEvery claim has a number or a quote behind it\nIt ends with one recommendation" },
        { key: "unclear", label: "If something is unclear", kind: "select", options: UNCLEAR, hint: "What the assistant should do instead of guessing." }
    ],

    compose(v) {

        const format = v.format
            ? `Format: ${v.format}`
            : "";
        const requirements = [bullets(v.rules), format ? `- ${format}` : ""].filter(Boolean).join("\n");

        return doc([
            section("Task", v.goal, 1),
            section("Act as", v.role),
            section("The result is for", v.audience),
            section("Context", v.context),
            section("Material I will provide after this prompt", v.material),
            section("Requirements", requirements),
            section("An example of a good result", v.example),
            section("Success criteria", bullets(v.success) + (v.success ? "\n\nCheck your answer against each of these before you reply." : "")),
            section("If anything is unclear", v.unclear)
        ]);

    },

    example: {
        values: {
            goal: "A one-page summary of our customer survey for Monday's leadership meeting.",
            role: "an experienced customer-research analyst",
            audience: "senior managers with no research background",
            context: "We sent a 12-question survey to 2,000 customers in October; 420 answered. Three questions were free text. The meeting decides whether to fund a redesign of the ordering page.",
            material: "The survey export as CSV, 420 rows.\nThe answers to the three free-text questions as a list.",
            rules: "No more than 400 words\nBritish English\nQuote at least two customer comments word for word\nDo not invent numbers that are not in the data",
            format: FORMATS[5].value,
            example: "Like last quarter's summary: a headline finding, three themes with a number each, then two risks.",
            success: "A manager can read it in two minutes\nEvery claim has a number or a quote behind it\nIt ends with one recommendation about the redesign",
            unclear: UNCLEAR[0].value
        }
    },

    howTo: [
        "Write what you want the assistant to produce, in your own words.",
        "Add the context and the rules you would give a capable colleague: what exists, what to avoid, how long, in what form.",
        "Say how you will judge the result. The prompt asks the assistant to check its answer against your criteria before replying.",
        "Copy the prompt, paste it as the first message of a new chat, and add the material you named.",
        "Keep the prompt. The next time, change one or two fields instead of starting from nothing."
    ],

    parts: [
        { title: "Task", text: "The one thing the assistant must produce. A prompt that starts with the deliverable gets an answer shaped like it; a prompt that starts with the background often gets a summary of the background instead." },
        { title: "Act as and the result is for", text: "A role sets the assistant's level of knowledge and its tone; the reader sets the level of detail. \"Explain to a new customer\" and \"explain to our finance team\" need different answers to the same question." },
        { title: "Context and material", text: "What the assistant cannot know: your situation, what has been tried, what you will paste. Naming the material (\"a CSV with 420 rows\") lets the assistant plan for it instead of guessing what arrives next." },
        { title: "Requirements and format", text: "Length, language, tone and exclusions, one per line, and the shape of the answer. Most disappointing answers break a rule that was never written down." },
        { title: "Success criteria", text: "How you will judge the result. Written out, they do two jobs: they make you decide what matters, and they give the assistant a checklist to run before it replies." },
        { title: "If anything is unclear", text: "Whether the assistant should ask first, state its assumptions or give two versions. Without this, it guesses, and a guess is invisible inside a confident answer." }
    ],

    useWith: [
        "Start a new chat and paste the prompt as the first message. In a chat that already has history, paste it as a normal message; the assistant uses it from then on.",
        "Paste any material you named right after the prompt, or attach it where the assistant allows files.",
        "If you chose \"Ask me first\", answer the questions before you judge the result.",
        "When the answer misses the mark, change the prompt, not the conversation: a corrected prompt in a new chat usually beats a long thread of corrections.",
        "The prompt is plain Markdown. It reads the same in ChatGPT, Claude, Gemini and Copilot, and in a text file."
    ],

    faq: [
        { q: "Is anything sent to an AI service?", a: "No. The prompt is written by this page in your browser. You decide where to paste it. Nothing you type here is stored or sent anywhere." },
        { q: "Why does it ask how I will judge the result?", a: "Because that is the part most prompts leave out. When the criteria are written down, the assistant can check its own answer against them, and you can tell quickly whether it did." },
        { q: "Do I have to fill in every field?", a: "No. Two are essential: what to produce and how you will judge it. Every other field is optional, and the prompt leaves out any heading you leave empty." },
        { q: "What does the completeness score mean?", a: "It is a check of the brief, not of the answer: 20 points off for each essential still missing and 5 for each answer that looks vague. A complete brief can still get a wrong answer; the score only says the assistant has what it needs." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = tool.build;
