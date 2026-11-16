/* =========================================================
   ToolZen Hub
   AI Context Bridge (AI Tools; id context-pack-builder, formerly
   the Project Context Pack Builder)

   Everything an AI product needs to pick up a project, written
   once and carried between chats and products: a full project
   brief, a short handoff, a session update or a file for a coding
   assistant (context-engine.js). The facts can come from an AI
   conversation through a fixed extraction prompt, and a saved pack
   opens again with its version. Nothing is imported from any AI
   product and nothing is stored. The page is the shared brief page
   with its optional panel (AI ecosystem programme, 17 §6).
========================================================= */

import { createBriefTool } from "../ai-tools/common/brief-tool.js";
import { escapeHTML } from "../../ui/escape.js";
import { fieldShell, hintIdOf } from "../../ui/field.js";
import { ROUTES } from "../../routes.js";
import { MODES, composeContext, contextNotes, parseReply, changedSections, EXTRACTION_PROMPT, modeOf } from "../ai-tools/common/context-engine.js";
import { withMeta, readMeta, readFile, pick, slug, today, FORMAT } from "../ai-tools/common/pack-format.js";
import { put, take } from "../ai-tools/common/handoff.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const REPLY = [
    { value: "First reply with three lines: what the project is, what the next task is, and what you will do first. Then wait for me to confirm before you change anything.", label: "Confirm understanding in three lines, then wait" },
    { value: "Before you start, ask every question whose answer would change how you do the task. Then wait for my answers.", label: "Ask questions first, then wait" },
    { value: "Start the task straight away. State any assumption you make at the point where you make it.", label: "Start straight away" }
];


const PREFIX = "cp";

/* what a context pack file may hold (17 §6) */
const FILE_SCHEMA = { kind: "string:20", format: "int", version: "int", date: "string:10", values: "strings:4000" };

/* the opened pack: its version, date and values, to number the next version and list what changed */
const opened = { version: 0, date: "", values: null };

export const CONFIG = {

    toolId: "context-pack-builder",
    prefix: PREFIX,
    outputName: "context pack",
    fileName: (v, extra) => `context-${slug(v.project)}-v${extra.version || 1}`,
    intro: "Write down once what an AI product needs to know about your project, then carry it to another chat or another product: a full brief, a short handoff, a session update or a file for a coding assistant. Bring the facts out of an AI conversation with one prompt, and open a saved pack again to update only what changed.",
    pasteLine: "Paste it as the first message of a new chat in any AI product, or save it where your product reads project instructions. Nothing is synchronised: you carry the text.",
    sectionTitle: "Describe the project",
    sectionText: "Four fields are essential. Decisions, completed work and known traps are what save the most repeated explaining. The pack is written as you type, in the form you choose first.",

    fields: [
        { key: "mode", label: "What is it for", kind: "select", options: MODES, hint: "Project brief: everything, for the start of a project. Handoff: short, to continue in another AI product. Session update: what changed, for a new chat. Coding agent file: instructions for a coding assistant. Changing it never clears a field." },
        { key: "project", label: "Project name", kind: "text", required: true, hint: "What you call it.", placeholder: "ToolZen Hub" },
        { key: "purpose", label: "What it does, and for whom", required: true, rows: 3, hint: "Two or three sentences: the product, its users and the problem it solves.", placeholder: "A website of free calculators and browser tools for people in India: loans, investment, tax, time, developer and PDF tools. Everything runs in the browser; there is no backend." },
        { key: "role", label: "My role", kind: "text", hint: "Your role and level, so the AI pitches its answers right.", placeholder: "Solo developer and product owner" },
        { key: "stack", label: "How it is built", rows: 4, hint: "Languages, frameworks, build tool, hosting, how it is tested. One fact per line.", placeholder: "Static site built with Eleventy 3 and Nunjucks\nVanilla JavaScript ES modules, no framework\nTests: node:test for units, Playwright for the browser\nDeployed to GitHub Pages; production uploaded by hand" },
        { key: "state", label: "Current state", required: true, rows: 3, hint: "Where things stand today: what works, what is in progress, which branch.", placeholder: "Branch feature/unified-ecosystem-workspace, 2 commits ahead of main. All tests pass. The AI Tools section is half built." },
        { key: "decisions", label: "Decisions", rows: 3, hint: "What was decided and why, one per line, newest last. The handoff keeps the last five.", placeholder: "No new dependencies: the site stays framework-free\nAI tools never call an AI service: privacy and no keys" },
        { key: "rejected", label: "Rejected approaches", rows: 2, hint: "What was tried or proposed and turned down, so it is not proposed again.", placeholder: "A chatbot on the site: it would need an AI API" },
        { key: "terms", label: "Terms", rows: 2, hint: "Words with a special meaning in this project, as \"term: meaning\".", placeholder: "Work Pack: the Workbench's output\nEcosystem: one of the seven sections" },
        { key: "files", label: "Key files and folders", rows: 5, hint: "One per line, with a few words on what each is for.", placeholder: "assets/js/data/tools.js - the tool catalog, one entry per tool\nsrc/ - Eleventy templates\ntests/unit/ - unit tests, run with node --test\ndocs/product-decision-rules.md - the rules every change must follow" },
        { key: "done", label: "Completed work (do not redo)", rows: 3, hint: "What is finished and must be left alone. One item per line, newest last.", placeholder: "Calculator layouts: side by side from 1200 px, approved by the owner\nFull regression run on 10 November, all green" },
        { key: "issues", label: "Known issues and traps", rows: 3, hint: "Bugs you know about, things that look wrong but are intended, mistakes a newcomer makes.", placeholder: "The link checker fails the build on any link with an empty tool id\nThe machine has 4 GB of RAM: run one browser test project at a time" },
        { key: "rules", label: "Rules and conventions", rows: 4, hint: "Must and never. Style, process, approvals, anything a reviewer would reject.", placeholder: "Never push to main; work on the feature branch\nNo new dependencies without asking\nEvery bug fix comes with a test that fails first\nBritish English in all text" },
        { key: "task", label: "The next task", required: true, rows: 3, hint: "What you want done now, as a deliverable, with its boundaries.", placeholder: "Add an \"AI Tools\" card to the home page, in the same style as the six existing ecosystem cards, linking to /ai-tools.html. Do not change the other cards." },
        { key: "verify", label: "How the work will be verified", rows: 3, hint: "The commands, checks or review that decide whether the task is done.", placeholder: "node --test tests/unit/sections.test.mjs passes\nnpx playwright test tests/browser/home-brand.spec.js --workers=1 passes\nThe card looks right at 390 px and 1280 px" },
        { key: "reply", label: "How the assistant should respond", kind: "select", options: REPLY, hint: "What you want to happen first." },
        { key: "notes", label: "Notes to sort", rows: 2, maxlength: 4000, hint: "Text from an AI reply or an older pack that did not fit a section. Move it into a section or delete it: it is not part of the pack.", placeholder: "" }
    ],

    compose: (v, extra) => composeContext(v, extra),

    context: () => opened.values ? { version: opened.version + 1, date: today(), changed: opened.changed ?? [] } : {},

    notes: (values, brief) => contextNotes(
        Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v ?? "").trim()])),
        brief.markdown,
        Object.fromEntries(CONFIG.fields.map((f) => [f.key, f.label])),
        { today: today(), opened: opened.date }
    ),

    downloadText: (markdown, values, extra) => withMeta(markdown, {
        kind: "context-pack",
        format: FORMAT,
        version: extra.version || 1,
        date: today(),
        values: Object.fromEntries(Object.entries(values).filter(([k, v]) => v && k !== "notes"))
    }),

    actions: [
        { id: "to-workbench", label: "Copy and use in the Workbench", text: (brief) => brief.state === "empty" ? "" : brief.markdown }
    ],

    panel: () => `
                <div class="ai-bridge">
                    <details class="ai-bridge__part" id="${PREFIX}-extract">
                        <summary>Bring context from an AI conversation</summary>
                        <p class="ai-note">1. Copy this prompt and paste it at the end of the conversation you want to continue elsewhere.</p>
                        <div class="ai-bridge__prompt">
                            <pre id="${PREFIX}-extract-prompt" class="ai-bridge__text" tabindex="0" aria-label="Extraction prompt">${escapeHTML(EXTRACTION_PROMPT)}</pre>
                            <button type="button" id="${PREFIX}-extract-copy" class="calculator-form__button calculator-form__button--secondary">Copy the prompt</button>
                        </div>
                        ${fieldShell({ id: `${PREFIX}-reply-text`, label: "2. Paste the AI's reply", hint: "The reply is read by its headings. Check every field afterwards: the AI's summary may be wrong or incomplete.", control: `<textarea id="${PREFIX}-reply-text" class="calculator-form__input ai-textarea" rows="5" maxlength="20000" aria-describedby="${hintIdOf(`${PREFIX}-reply-text`)}"></textarea>` })}
                        <button type="button" id="${PREFIX}-reply-fill" class="calculator-form__button calculator-form__button--secondary">Fill the form from this reply</button>
                        <p id="${PREFIX}-reply-note" class="ai-note"></p>
                    </details>
                    <details class="ai-bridge__part" id="${PREFIX}-open">
                        <summary>Open a saved context pack</summary>
                        <div class="calculator-form__group">
                            <label class="calculator-form__label" for="${PREFIX}-open-file">Choose a context pack file</label>
                            <input id="${PREFIX}-open-file" class="calculator-form__input" type="file" accept=".md,.txt,text/markdown,text/plain" aria-describedby="${PREFIX}-open-note">
                        </div>
                        ${fieldShell({ id: `${PREFIX}-open-text`, label: "Or paste the file's text", hint: "A pack downloaded from this page opens with its version; any other Markdown pack is read by its headings.", control: `<textarea id="${PREFIX}-open-text" class="calculator-form__input ai-textarea" rows="3" maxlength="200000" aria-describedby="${hintIdOf(`${PREFIX}-open-text`)} ${PREFIX}-open-note"></textarea>` })}
                        <button type="button" id="${PREFIX}-open-button" class="calculator-form__button calculator-form__button--secondary">Open this pack</button>
                        <p id="${PREFIX}-open-note" class="ai-note"></p>
                    </details>
                </div>`,

    wire({ form, inputs, values, update, announce, setValues }) {

        const $ = (id) => document.getElementById(`${PREFIX}-${id}`);
        const say = (id, text) => {
            $(id).textContent = text;
            announce(text, 0);
        };
        const typed = () => Object.entries(values()).some(([k, v]) => k !== "mode" && k !== "reply" && String(v).trim());

        /* a link from AI Home (?mode=handoff) chooses the form of the pack */
        const linked = new URLSearchParams(location.search).get("mode");
        if (linked && MODES.some((m) => m.value === linked)) setValues({ mode: linked });

        /* a task handed over by the Workbench starts the pack; nothing typed is overwritten */
        const seed = take("seed");
        if (seed) {
            setValues({ project: seed.project ?? "", purpose: seed.purpose ?? "", task: seed.task ?? "" }, { onlyEmpty: true });
            announce("Started from the Workbench task. Add the current state and anything the AI should know.", 0);
        }

        $("extract-copy").addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(EXTRACTION_PROMPT);
                announce("Extraction prompt copied.", 0);
            } catch {
                const range = document.createRange();
                range.selectNodeContents($("extract-prompt"));
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                announce("Copying was refused by the browser. The prompt is selected: press Ctrl+C or Cmd+C.", 0);
            }
        });

        $("reply-fill").addEventListener("click", () => {

            const text = $("reply-text").value;
            if (!text.trim()) return say("reply-note", "Paste the AI's reply first.");

            const { values: found, filled, empty } = parseReply(text);
            if (!filled.length) return say("reply-note", "No section of the reply matched the headings. Check that the AI kept the headings from the prompt; nothing was changed.");
            if (typed() && !window.confirm("Replace what you typed with the AI's summary? Fields the reply leaves empty keep what you typed.")) return;

            setValues(found);
            say("reply-note", `Filled ${filled.length} section${filled.length === 1 ? "" : "s"}.${empty.length ? ` Nothing for: ${empty.join(", ")}.` : ""} Check every field: the AI's summary may be wrong or incomplete.`);

        });

        $("open-button").addEventListener("click", async () => {

            let text = $("open-text").value;
            const file = $("open-file").files?.[0];

            if (file) {
                const read = await readFile(file);
                if (read.error) return say("open-note", read.error);
                text = read.text;
            }

            if (!text.trim()) return say("open-note", "Choose a context pack file or paste its text first.");
            if (typed() && !window.confirm("Replace what you typed with the opened pack?")) return;

            const { meta, error } = readMeta(text);
            let restored;
            let message;

            if (!error) {
                const { value } = pick(meta, FILE_SCHEMA);
                if (value.kind !== "context-pack") return say("open-note", "This file is not a context pack. A Work Pack opens in the AI Workbench.");
                restored = { mode: "brief", ...(value.values ?? {}) };
                opened.version = value.version ?? 1;
                opened.date = value.date ?? "";
                message = `Opened version ${opened.version}${opened.date ? ` of ${opened.date}` : ""}. Edit what changed; the download becomes version ${opened.version + 1} and lists what changed.`;
            } else if (error === "none") {
                restored = parseReply(text).values;
                if (!Object.keys(restored).length) return say("open-note", "This text has none of the pack's headings. Nothing was changed.");
                opened.version = 1;
                opened.date = "";
                message = "Read by its headings (it has no saved version). Check every field.";
            } else {
                return say("open-note", error);
            }

            for (const key of Object.keys(inputs)) if (key !== "mode") inputs[key].value = inputs[key].tagName === "SELECT" ? inputs[key].options[0].value : "";
            setValues(restored);
            opened.values = { ...values() };
            opened.changed = [];
            update();
            say("open-note", message);
            $("open").open = false;

        });

        /* the changed list follows the fields from the moment a pack was opened */
        form.addEventListener("input", () => {
            if (opened.values) opened.changed = changedSections(opened.values, values());
        });
        form.addEventListener("change", () => {
            if (opened.values) opened.changed = changedSections(opened.values, values());
            update();
        });

        /* "Copy and use in the Workbench" also hands the pack over in this tab; the link below goes there */
        document.getElementById(`${PREFIX}-to-workbench`)?.addEventListener("click", () => {
            const md = document.getElementById(`${PREFIX}-output`).value;
            if (md) put("context", { text: md });
        });

        const go = document.createElement("p");
        go.className = "ai-note";
        go.innerHTML = `After copying, <a href="${escapeHTML(ROUTES.tool("tools", "ai-workbench"))}">open the AI Workbench</a>: the pack is already in its Project context field when you go there from this tab.`;
        document.getElementById(`${PREFIX}-to-workbench`)?.closest(".ai-actions")?.after(go);

    },

    example: {
        values: {
            mode: "brief",
            project: "ToolZen Hub",
            purpose: "A website of free calculators and browser tools for people in India: loans, investment, tax, time, developer, image and PDF tools, plus practice labs for learning. Everything runs in the browser; there is no backend and no account.",
            role: "Solo developer and product owner",
            stack: "Static site built with Eleventy 3 and Nunjucks\nVanilla JavaScript ES modules, no framework\nTests: node:test for units, Playwright for the browser, one worker\nDeployed to GitHub Pages from the feature branch; production is uploaded by hand",
            state: "Branch feature/unified-ecosystem-workspace, 2 commits ahead of main. All tests passed on 10 November. The AI Tools section has three tools and no home page card yet.",
            decisions: "No new dependencies: the site stays framework-free\nAI tools never call an AI service, for privacy and so no key is needed",
            rejected: "A chatbot on the site, because it would need an AI API",
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
        "Choose what the pack is for: a full project brief, a short handoff to another AI product, a session update for a new chat, or a file for a coding assistant.",
        "Fill in the project, or bring the facts from an AI conversation: copy the extraction prompt into that conversation and paste the reply back. Check every field it fills.",
        "Write down the decisions, what is already done, the traps you know about and the rules a reviewer would enforce. These save the most repeated explaining.",
        "State the next task and how it will be verified, choose how the assistant should respond first, and copy the pack into the AI product you are moving to.",
        "Download the pack. Next time, open it here, change only what changed, and download the next version: it lists what changed for the AI."
    ],

    parts: [
        { title: "Four forms of the same facts", text: "A project brief has everything. A handoff keeps what another AI product needs to continue, with the five latest decisions and completed items. A session update says what changed, for a new chat in the same product. A coding agent file is written as instructions for a coding assistant. Changing the form never loses a field." },
        { title: "Decisions and rejected approaches", text: "What was decided, and what was turned down. Without the second list, an AI in a new chat will happily propose again what you rejected last week." },
        { title: "Current state and completed work", text: "Where things stand and what must not be redone. An AI that does not know the work exists will rebuild it." },
        { title: "Known issues, rules and terms", text: "The lessons that cost you time, the musts and nevers a reviewer enforces, and the words that mean something special here. Each one written down is a mistake the next AI does not repeat." },
        { title: "The next task and its verification", text: "A deliverable with boundaries, and the checks that decide whether it is done." },
        { title: "Versions", text: "A downloaded pack opens again here. Edit what changed and download: the new version names the sections that changed, so the AI reads the news first." }
    ],

    useWith: [
        "Paste the pack as the first message of a new chat, or save it where your AI product reads project instructions (a project's instructions, a CLAUDE.md or AGENTS.md file, a custom GPT, a Gem).",
        "Moving to another product: choose Handoff to another AI. It stays short, so the new assistant reads all of it.",
        "Hitting a chat's limit or starting a fresh chat: choose Session update.",
        "With a coding assistant: choose Coding agent file and save it in your repository under the file name your assistant reads.",
        "Remove passwords, keys and personal data before you paste a pack anywhere."
    ],

    faq: [
        { q: "Does it import or sync my conversations?", a: "No. Nothing here can read your AI products. The extraction prompt asks the AI to summarise the conversation under fixed headings; you copy that reply here yourself. Nothing is sent or synchronised." },
        { q: "How is this different from a prompt?", a: "A prompt asks for one result. A context pack describes the project so that every prompt after it is shorter and better. You write the pack once and carry it; you write a new prompt for each task." },
        { q: "Does it store my project details?", a: "No. The pack is composed in your browser and nothing is kept when you leave the page. Download it to keep it; Open a saved context pack brings it back." },
        { q: "How long should the pack be?", a: "As long as the facts need and no longer. A handoff aims for under 400 words; the page tells you its length. If a section grows past ten lines, it probably belongs in a document the pack can point to." }
    ]

};


const tool = createBriefTool(CONFIG);

export const markup = tool.markup;
export const render = tool.render;
export const init = tool.init;
export const build = (raw) => tool.build({ mode: "brief", ...raw });
export { modeOf };
