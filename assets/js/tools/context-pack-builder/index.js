/* =========================================================
   ToolZen Hub
   Project Context Pack Builder (AI Tools)

   Everything an assistant needs to pick up a project, written
   once and reused: purpose, stack, the current state, the key
   files, what is already done, the known traps, the rules, the
   next task and how it will be verified. For a new chat, a new
   assistant, a handover or the start of a long piece of work.
   The page is drawn by the shared brief page.
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { section, bullets, document as doc } from "../ai-tools/common/brief-engine.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const REPLY = [
    { value: "First reply with three lines: what the project is, what the next task is, and what you will do first. Then wait for me to confirm before you change anything.", label: "Confirm understanding in three lines, then wait" },
    { value: "Before you start, ask every question whose answer would change how you do the task. Then wait for my answers.", label: "Ask questions first, then wait" },
    { value: "Start the task straight away. State any assumption you make at the point where you make it.", label: "Start straight away" }
];


export const CONFIG = {

    toolId: "context-pack-builder",
    prefix: "cp",
    outputName: "context pack",
    fileName: "context-pack",
    intro: "Write down once what an assistant needs to know about your project: what it is, how it is built, where things are, what is done, what to avoid and what comes next. Paste the pack at the start of every chat instead of explaining again.",
    sectionTitle: "Describe the project",
    sectionText: "Four fields are essential. The key files, the completed work and the known traps are what save the most repeated explaining. The pack is written as you type.",

    fields: [
        { key: "project", label: "Project name", kind: "text", required: true, hint: "What you call it.", placeholder: "ToolZen Hub" },
        { key: "purpose", label: "What it does, and for whom", required: true, rows: 3, hint: "Two or three sentences: the product, its users and the problem it solves.", placeholder: "A website of free calculators and browser tools for people in India: loans, investment, tax, time, developer and PDF tools. Everything runs in the browser; there is no backend." },
        { key: "stack", label: "How it is built", rows: 4, hint: "Languages, frameworks, build tool, hosting, how it is tested. One fact per line.", placeholder: "Static site built with Eleventy 3 and Nunjucks\nVanilla JavaScript ES modules, no framework\nTests: node:test for units, Playwright for the browser\nDeployed to GitHub Pages; production uploaded by hand" },
        { key: "state", label: "Current state", required: true, rows: 3, hint: "Where things stand today: what works, what is in progress, which branch.", placeholder: "Branch feature/unified-ecosystem-workspace, 2 commits ahead of main. All tests pass. The AI Tools section is half built." },
        { key: "files", label: "Key files and folders", rows: 5, hint: "One per line, with a few words on what each is for.", placeholder: "assets/js/data/tools.js - the tool catalog, one entry per tool\nsrc/ - Eleventy templates\ntests/unit/ - unit tests, run with node --test\ndocs/product-decision-rules.md - the rules every change must follow" },
        { key: "done", label: "Completed work (do not redo)", rows: 3, hint: "What is finished and must be left alone. One item per line.", placeholder: "Calculator layouts: side by side from 1200 px, approved by the owner\nFull regression run on 10 November, all green" },
        { key: "issues", label: "Known issues and traps", rows: 3, hint: "Bugs you know about, things that look wrong but are intended, mistakes a newcomer makes.", placeholder: "The link checker fails the build on any link with an empty tool id\nThe machine has 4 GB of RAM: run one browser test project at a time" },
        { key: "rules", label: "Rules and conventions", rows: 4, hint: "Must and never. Style, process, approvals, anything a reviewer would reject.", placeholder: "Never push to main; work on the feature branch\nNo new dependencies without asking\nEvery bug fix comes with a test that fails first\nBritish English in all text" },
        { key: "task", label: "The next task", required: true, rows: 3, hint: "What you want done now, as a deliverable, with its boundaries.", placeholder: "Add an \"AI Tools\" card to the home page, in the same style as the six existing ecosystem cards, linking to /ai-tools.html. Do not change the other cards." },
        { key: "verify", label: "How the work will be verified", rows: 3, hint: "The commands, checks or review that decide whether the task is done.", placeholder: "node --test tests/unit/sections.test.mjs passes\nnpx playwright test tests/browser/home-brand.spec.js --workers=1 passes\nThe card looks right at 390 px and 1280 px" },
        { key: "reply", label: "How the assistant should respond", kind: "select", options: REPLY, hint: "What you want to happen first." }
    ],

    compose(v) {

        return doc([
            `# Project context: ${v.project || "(project name)"}`,
            section("Purpose", v.purpose),
            section("How it is built", bullets(v.stack)),
            section("Current state", v.state),
            section("Key files and folders", bullets(v.files)),
            section("Completed work, do not redo", bullets(v.done)),
            section("Known issues and traps", bullets(v.issues)),
            section("Rules and conventions", bullets(v.rules)),
            section("The next task", v.task),
            section("How the work will be verified", bullets(v.verify)),
            section("How to respond", v.reply)
        ]);

    },

    example: {
        values: {
            project: "ToolZen Hub",
            purpose: "A website of free calculators and browser tools for people in India: loans, investment, tax, time, developer, image and PDF tools, plus practice labs for learning. Everything runs in the browser; there is no backend and no account.",
            stack: "Static site built with Eleventy 3 and Nunjucks\nVanilla JavaScript ES modules, no framework\nTests: node:test for units, Playwright for the browser, one worker\nDeployed to GitHub Pages from the feature branch; production is uploaded by hand",
            state: "Branch feature/unified-ecosystem-workspace, 2 commits ahead of main. All tests passed on 10 November. The AI Tools section has three tools and no home page card yet.",
            files: "assets/js/data/tools.js - the tool catalog, one entry per tool\nassets/js/data/categories.js - the sections and categories\nassets/js/components/categories.js - the home page cards\ntests/unit/ - unit tests, run with node --test\ndocs/product-decision-rules.md - the rules every change must follow",
            done: "Calculator layouts: inputs and result side by side from 1200 px, approved by the owner\nFull regression on 10 November, all green; do not rerun it for a small change",
            issues: "The link checker fails the build on any link with an empty tool id\nThe machine has 4 GB of RAM: run one browser test project at a time",
            rules: "Never push to main; work on the feature branch\nNo new dependencies without asking\nEvery bug fix comes with a test that fails before the fix\nBritish English in all text",
            task: "Add an \"AI Tools\" card to the home page, in the same style as the six existing ecosystem cards, linking to /ai-tools.html. Do not change the other cards.",
            verify: "node --test tests/unit/sections.test.mjs passes\nnpx playwright test tests/browser/home-brand.spec.js --workers=1 passes\nThe card looks right at 390 px and 1280 px",
            reply: REPLY[0].value
        }
    },

    howTo: [
        "Name the project and say in two or three sentences what it does and for whom.",
        "List how it is built and the key files, one per line with a few words each. This is the part you would otherwise explain in every chat.",
        "Write down what is already done, the traps you know about and the rules a reviewer would enforce.",
        "State the next task and how it will be verified, choose how the assistant should respond first, and copy the pack.",
        "Save the pack as a file in the project. Update the state, the task and the completed work before each new chat; the rest rarely changes."
    ],

    parts: [
        { title: "Purpose, stack and key files", text: "The map. An assistant that knows what the project is for, how it is built and where things live starts on the real task instead of exploring, and makes fewer changes that fit the code but not the product." },
        { title: "Current state and completed work", text: "Where things stand and what must not be redone. Without the second list, an assistant will happily rebuild something finished last week because nothing told it the work existed." },
        { title: "Known issues and traps", text: "The lessons that cost you time: the check that fails for an odd reason, the thing that looks wrong but is intended, the machine's limits. Each one written here is a mistake the assistant does not repeat." },
        { title: "Rules and conventions", text: "Must and never. These are the things a reviewer rejects, so they belong in the pack, not in a correction after the work is done." },
        { title: "The next task and its verification", text: "A deliverable with boundaries, and the checks that decide whether it is done. A task with a named verification tends to be finished; one without tends to be \"mostly done\"." },
        { title: "How to respond", text: "Whether the assistant should confirm its understanding, ask first or start at once. A three-line confirmation costs seconds and catches most misreadings before any code changes." }
    ],

    useWith: [
        "Paste the pack as the first message of a new chat, or save it where your assistant reads project instructions (a CLAUDE.md, a .cursorrules file, a GPT's instructions, a Gemini Gem).",
        "In a long piece of work, paste a fresh pack when the chat gets long or the assistant starts repeating mistakes: a new chat with a good pack beats an old chat with a long memory.",
        "For a handover to a person, delete \"How to respond\"; the rest is the brief they need.",
        "Keep the pack in the repository and update three sections as you go: current state, completed work and the next task."
    ],

    faq: [
        { q: "How is this different from a prompt?", a: "A prompt asks for one result. A context pack describes the project so that every prompt after it is shorter and better. You write the pack once and reuse it; you write a new prompt for each task." },
        { q: "Does it store my project details?", a: "No. The pack is composed in your browser and nothing is kept when you leave the page. Download it or copy it into your project if you want to keep it." },
        { q: "How long should the pack be?", a: "As long as the facts need and no longer. A typical pack is 250 to 600 words. If a section grows past ten lines, it is probably two sections, or it belongs in a document the pack can point to." },
        { q: "Can I use it with Claude Code, Cursor or Copilot?", a: "Yes. The pack is plain Markdown. Those tools read project instruction files, and the pack is a good first version of one; the next task section is the part you change each time." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = tool.build;
