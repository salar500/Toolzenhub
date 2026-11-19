/* =========================================================
   ToolZen Hub
   AI Prompt Builder (AI Tools; Tool Pack 58, the former AI Workbench; D22)

   The central AI product (D22): the visitor describes the task in
   their own words or starts from their profession, answers only
   the questions that task needs, one at a time, and gets a Work
   Pack (main prompt, stage prompts, refinement prompts, preparation,
   quality checklist, next steps) written in the browser as they
   answer. A project context pack (context.js, the former AI Context
   Bridge) is written in the same page. The page is one form with
   its parts revealed in order; nothing is a separate URL.

   Logic lives in compiler.js (pure); questions, stages and checks
   in blueprints/<family>.js, loaded when a task is chosen; product
   suggestions come from the AI Directory (products.js). Nothing is
   sent to any AI service and nothing is stored.
========================================================= */

import { getToolById } from "../../data/tools.js";
import { ROUTES } from "../../routes.js";
import { fieldShell, hintIdOf } from "../../ui/field.js";
import { escapeHTML } from "../../ui/escape.js";
import { addJumpToResult } from "../../ui/jump-link.js";
import { OUTCOMES, ROLES, EXPERIENCE, DEPTHS, getTask, getOutcome, tasksFor } from "./taxonomy.js";
import { compileWorkPack, activeQuestions, NOT_VERIFIED, CONSISTENCY, CONTEXT_LIMIT } from "./compiler.js";
import { loadBlueprint } from "./blueprints.js";
/* the task matcher loads when the visitor first describes a task (D17) */
const loadMatcher = () => import("./task-index.js");
/* the playbooks load the first time their section is opened (D17) */
const loadPlaybooks = () => import("./playbooks.js");
/* the file format is needed only to save or open a pack; it loads with the first task or the first open (D17) */
const loadFormat = () => import("../ai-tools/common/pack-format.js");
import { put } from "../ai-tools/common/handoff.js";

/* the directory data is needed only once a task is chosen */
let productsModule = null;
const loadProducts = () => (productsModule ??= import("./products.js"));


export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const P = "wb";
const OWN = "own";
const DEPTH_NAMES = { short: "Short", standard: "Standard", detailed: "Detailed", multi: "Multi-stage" };


const EMPTY_LINE = "Choose what you want to accomplish, or describe it above. Your Work Pack appears here as you answer.";

const CREATIVE = new Set(["images", "video", "audio"]);

const CONSISTENCY_HINTS = {
    subject: "Who or what appears, described the same way every time.",
    look: "For example \"flat illustration, soft shadows\".",
    colours: "For example \"teal, sand and white\".",
    lighting: "For example \"soft morning light from the left\".",
    camera: "For example \"eye level, medium shot\".",
    voice: "For audio: the voice, pace and how names are said.",
    never: "Details that must never change, one per line or separated by commas."
};

/* what a Work Pack file may hold (17 §5.5); anything else is ignored and listed */
const FILE_SCHEMA = {
    kind: "string:20", format: "int", version: "int", date: "string:10", task: "string:40", answers: "strings:8000",
    role: "string:100", experience: "string:20", depth: "string:10", product: "string:100", ownProduct: "bool",
    context: `string:${CONTEXT_LIMIT}`, consistency: "strings:300",
    profession: "string:40", tools: "strings:20", toolChoice: "string:20", otherTool: "string:100",
    prompt: "strings:60"
};

const routeOf = (id) => ROUTES.tool("tools", id);

/* a task's title without the "Testing: " grouping prefix, starting with a capital */
const taskLabel = (title) => title.replace(/^Testing: /, "").replace(/^./, (c) => c.toUpperCase());


/* ---------- static markup (built into the page) ---------- */


function outcomeChoices() {

    return OUTCOMES.map((o) => `
                        <label class="wb-choice">
                            <input type="radio" name="${P}-outcome" value="${escapeHTML(o.id)}">
                            <span class="wb-choice__title">${escapeHTML(o.title)}</span>
                            <span class="wb-choice__text">${escapeHTML(o.text)}</span>
                        </label>`).join("");

}

export function markup() {

    const tool = getToolById("prompt-builder");

    return `
        <div class="calculator-page">

            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">AI Tool</span>
                    <h1>${escapeHTML(tool.title)}</h1>
                    <p>Create professional AI prompts for your work, business, learning and creative projects. Describe what you want to accomplish or start from your profession, answer a few questions, and get a main prompt, stage prompts for larger work and refinement prompts to improve an answer. You paste them into the AI assistant you use: ChatGPT, Claude, Gemini or any other.</p>
                </div>
                <div class="calculator-trust-card">
                    <div class="calculator-trust-icon">✓</div>
                    <div>
                        <strong>Prepared in your browser</strong>
                        <span>No AI service is called • Nothing is stored</span>
                    </div>
                </div>
            </section>

            <ol class="${P}-progress" aria-label="Your progress">
                <li data-step="1" aria-current="step">Outcome</li>
                <li data-step="2">Task</li>
                <li data-step="3">Details</li>
                <li data-step="4">Work Pack</li>
            </ol>

            <div class="${P}-panel" id="${P}-panel" data-mode="guided">
            <div class="${P}-panel__head" id="${P}-panel-head">
                <ol class="${P}-steps" id="${P}-steps" aria-label="Your steps"></ol>
                <ol class="${P}-thread" id="${P}-thread" aria-label="Your answers so far" hidden></ol>
                <h2 class="calculator-section__title ${P}-panel__title" id="${P}-step-title" tabindex="-1">What would you like to create today?</h2>
                <p class="ai-note" id="${P}-step-why"></p>
            </div>
            <section class="calculator-section">
                <form id="${P}-form" class="calculator-form ai-form ${P}-form" novalidate>

                    <fieldset class="${P}-group ${P}-roles" id="${P}-roles" data-panel-step="role">
                        <legend class="ai-sr-only">Describe your task or choose your profession</legend>
                        <div class="${P}-composer" id="${P}-composer">
                            <label class="calculator-form__label" for="${P}-ask">Describe your task</label>
                            <p class="ai-note" id="${P}-ask-hint">In your own words, for example "test a healthcare API with patient login and appointment endpoints" or "a follow-up from my meeting notes".</p>
                            <div class="${P}-composer__row">
                                <textarea id="${P}-ask" class="calculator-form__input ${P}-composer__input" rows="2" maxlength="300" autocomplete="off" aria-describedby="${P}-ask-hint"></textarea>
                                <button type="button" class="calculator-form__button ${P}-composer__send" data-panel="ask">Find my task</button>
                            </div>
                            <div class="${P}-ask-result" id="${P}-ask-result"></div>
                        </div>
                        <p class="${P}-or" aria-hidden="true">or</p>
                        <div class="calculator-form__group ${P}-roles__find"><label class="calculator-form__label" for="${P}-role-search">Start from your profession</label><input id="${P}-role-search" class="calculator-form__input" type="search" autocomplete="off"></div>
                        <div id="${P}-role-grid"><p class="ai-note">Loading the professions…</p></div>
                    </fieldset>

                    <fieldset class="${P}-group" id="${P}-guide-tasks" data-panel-step="task">
                        <legend class="ai-sr-only">What do you want to accomplish?</legend>
                        <div class="${P}-choices ${P}-choices--tasks" id="${P}-guide-task-list"></div>
                    </fieldset>

                    <div class="${P}-group ${P}-start" id="${P}-unsure">
                        ${fieldShell({ id: `${P}-describe`, label: "Describe what you want to do", hint: "In your own words, for example \"test plan for a coupon feature\" or \"animate a product photo\".", control: `<input id="${P}-describe" class="calculator-form__input" type="text" maxlength="300" autocomplete="off" aria-describedby="${hintIdOf(`${P}-describe`)}">` })}
                        <button type="button" id="${P}-suggest" class="calculator-form__button calculator-form__button--secondary">Find matching tasks</button>
                        <p id="${P}-suggestion" class="ai-note"></p>
                        <div id="${P}-matches" class="${P}-matches"></div>

                        <details class="${P}-disclosure" id="${P}-professions">
                            <summary>Start from your profession</summary>
                            <div id="${P}-profession-body"><p class="ai-note">Loading the professions…</p></div>
                        </details>

                        <details class="${P}-disclosure" id="${P}-playbooks">
                            <summary>Start from a playbook</summary>
                            <p class="ai-note">Recurring work in steps. A step opens its task and fills a few choices; nothing about your project is assumed.</p>
                            <ul class="${P}-playbook-list" id="${P}-playbook-list"><li class="ai-note">Loading the playbooks…</li></ul>
                        </details>

                        <details class="${P}-disclosure" id="${P}-open">
                            <summary>Open a saved Work Pack</summary>
                            <div class="calculator-form__group">
                                <label class="calculator-form__label" for="${P}-open-file">Choose a Work Pack file</label>
                                <input id="${P}-open-file" class="calculator-form__input" type="file" accept=".md,.txt,text/markdown,text/plain" aria-describedby="${P}-open-error">
                            </div>
                            ${fieldShell({ id: `${P}-open-text`, label: "Or paste the file's text", hint: "A Work Pack downloaded from this page.", control: `<textarea id="${P}-open-text" class="calculator-form__input ai-textarea" rows="3" maxlength="200000" aria-describedby="${hintIdOf(`${P}-open-text`)} ${P}-open-error"></textarea>` })}
                            <button type="button" id="${P}-open-button" class="calculator-form__button calculator-form__button--secondary">Open this pack</button>
                            <p id="${P}-open-error" class="ai-note ${P}-error"></p>
                        </details>
                    </div>

                    <fieldset class="${P}-group" id="${P}-outcomes">
                        <legend class="calculator-section__title">What do you want to accomplish with AI?</legend>
                        <div class="${P}-choices">${outcomeChoices()}
                        </div>
                    </fieldset>

                    <fieldset class="${P}-group" id="${P}-tasks" hidden>
                        <legend class="calculator-section__title">Choose the task</legend>
                        <div class="${P}-choices ${P}-choices--tasks" id="${P}-task-list"></div>
                    </fieldset>

                    <div class="${P}-group" id="${P}-details" hidden>
                        <h2 class="calculator-section__title" id="${P}-details-title" tabindex="-1">A few questions</h2>
                        <p class="calculator-section__description">Only what changes the result. Fields marked essential go into the prompt; leave the rest empty if you do not know.</p>
                        <div class="calculator-form__grid" id="${P}-questions"></div>

                        <fieldset class="${P}-group ${P}-tools" id="${P}-tools" hidden></fieldset>

                        <details class="${P}-sheet" id="${P}-consistency" hidden>
                            <summary>Keep the same across every output (optional)</summary>
                            <p class="ai-note">Written once, repeated in the main prompt and in every stage, so a series of images, shots or recordings stays consistent.</p>
                            <div class="calculator-form__grid">${CONSISTENCY.map((c) => fieldShell({ id: `${P}-cs-${c.key}`, label: c.label, hint: CONSISTENCY_HINTS[c.key], control: `<input id="${P}-cs-${c.key}" class="calculator-form__input" type="text" maxlength="300" autocomplete="off" data-cs="${c.key}" aria-describedby="${hintIdOf(`${P}-cs-${c.key}`)}">` })).join("")}</div>
                        </details>

                        <details class="${P}-context">
                            <summary>Your context (optional)</summary>
                            <div class="calculator-form__grid">
                                <div id="${P}-context-field">${fieldShell({ id: `${P}-project`, label: "Project context", hint: "Notes the AI should know, or a project context pack (write one below, under Project context pack). Up to 8,000 characters.", control: `<textarea id="${P}-project" class="calculator-form__input ai-textarea" rows="4" maxlength="${CONTEXT_LIMIT}" aria-describedby="${hintIdOf(`${P}-project`)}"></textarea>` })}</div>
                                ${fieldShell({ id: `${P}-role`, label: "Your role", hint: "It shapes the terms and the deliverable, not the tone.", control: `<select id="${P}-role" class="calculator-form__input" aria-describedby="${hintIdOf(`${P}-role`)}"><option value="">Skip</option></select>` })}
                                ${fieldShell({ id: `${P}-experience`, label: "Your experience", hint: "Beginners get explanations; senior levels get trade-offs, risks and decisions.", control: `<select id="${P}-experience" class="calculator-form__input" aria-describedby="${hintIdOf(`${P}-experience`)}">${EXPERIENCE.map((e) => `<option value="${escapeHTML(e.id)}">${escapeHTML(e.label)}</option>`).join("")}</select>` })}
                                ${fieldShell({ id: `${P}-depth`, label: "Depth", hint: "Detailed is not always better: a simple task needs one prompt.", control: `<select id="${P}-depth" class="calculator-form__input" aria-describedby="${hintIdOf(`${P}-depth`)}">${DEPTHS.map((d) => `<option value="${escapeHTML(d.id)}">${escapeHTML(d.label)}</option>`).join("")}</select>` })}
                            </div>
                        </details>

                        <fieldset class="${P}-group ${P}-products" id="${P}-products">
                            <legend class="calculator-form__label">AI product</legend>
                            <p class="ai-note" id="${P}-products-note"></p>
                            <div class="${P}-product-list" id="${P}-product-list"></div>
                            <p class="ai-note">Products are from the <a href="${ROUTES.aiDirectory}">AI Directory</a>, each checked on its official site. Not a ranking, and the prompts work in any capable assistant.</p>
                        </fieldset>

                        <div class="calculator-form__actions">
                            <button type="button" id="${P}-show" class="calculator-form__button">Show my Work Pack</button>
                            <button type="button" id="${P}-reset" class="calculator-form__button calculator-form__button--secondary">Start again</button>
                        </div>
                    </div>

                    <noscript><p class="ai-note">The AI Prompt Builder needs JavaScript to write the prompts. Nothing you type is sent anywhere.</p></noscript>

                </form>
            </section>

            <section class="calculator-section ${P}-bridge" id="${P}-bridge" aria-labelledby="${P}-bridge-title">
                <details class="${P}-disclosure" id="${P}-bridge-fold">
                    <summary id="${P}-bridge-title">Project context pack: write, update or carry your project's context</summary>
                    <p class="ai-note">Write down once what any AI needs to know about your project, then use it in this prompt or carry it to another chat or AI product: a full brief, a short handoff, a session update or a file for a coding assistant. You can also bring the facts out of an AI conversation, or open a saved pack.</p>
                    <div id="${P}-bridge-body"><p class="ai-note">Opening the context pack…</p></div>
                </details>
            </section>

            <section id="${P}-results" class="calculator-results ${P}-pack" aria-labelledby="${P}-pack-title">
                <div class="calculator-results__card">
                    <h2 id="${P}-pack-title" class="${P}-pack__title" tabindex="-1">Your AI Work Pack</h2>
                    <div id="${P}-prompt-controls" class="${P}-controls" hidden></div>
                    <div id="${P}-pack-body">
                        <p class="ai-check__line">${EMPTY_LINE}</p>
                    </div>
                </div>
            </section>
            <div class="${P}-panel__nav" id="${P}-panel-nav"></div>
            </div>
            <p id="${P}-live" class="ai-sr-only" role="status" aria-live="polite"></p>

            <section class="calculator-info">
                <h2>How the AI Prompt Builder works</h2>
                <ol>
                    <li>Describe what you want to do in your own words and choose one of the closest tasks, or start from your profession and pick one of its tasks. Nothing fits? "Any other task" writes one well-built prompt for anything. A playbook starts recurring work in steps; a Work Pack you downloaded opens again with every answer.</li>
                    <li>Answer the few questions that change the result. Essentials are marked; anything you leave out is listed as missing and written into the prompt as <code>[add: …]</code>, never guessed.</li>
                    <li>Optionally give your role and experience (a beginner's pack explains each step; a senior pack asks for trade-offs, risks and decisions), paste or write a project context pack, or, for images, video and audio, say what must stay the same in every output.</li>
                    <li>Pick an AI product from the ones listed for this task, or use your own.</li>
                    <li>Copy the main prompt into the product, then work through the stage prompts one at a time, use the refinement prompts where the answer falls short, and check what comes back with the AI Answer Checker and the checklist.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>What a Work Pack contains</h2>
                <h3>Preparation</h3><p>What to have ready before you start (requirements, files, references), and what your answers are still missing.</p>
                <h3>Main prompt</h3><p>The complete, self-contained instructions: the role, the task, your context, the professional method, the requirements, the format of the answer, what to avoid and what to do about missing information. An image, video or audio prompt is one descriptive paragraph instead, with what must stay unchanged kept apart from what must change.</p>
                <h3>Stage prompts</h3><p>For larger work, separate prompts for each step, in order: each with its objective, what to submit, its own prompt, what to expect and when it is done. Detailed and multi-stage packs end with a review against the brief.</p>
                <h3>Refinement prompts</h3><p>Prompts that improve an answer you already have: follow-ups for the problems this kind of work usually has: accuracy, missing requirements, clarity, consistency, technical quality, evidence.</p>
                <h3>Quality checklist and next steps</h3><p>What to check before you use the result, and what to do after.</p>
            </section>

            <section class="calculator-info">
                <h2>Frequently Asked Questions</h2>
                <details class="calculator-faq__item"><summary>Does the AI Prompt Builder run the AI for me?</summary><p>No. It writes the prompts; you paste them into the AI assistant you use. Nothing is sent from this page to any AI service, and no AI reads your description: it is matched to the tasks by fixed words in your browser.</p></details>
                <details class="calculator-faq__item"><summary>How is the AI product chosen?</summary><p>The AI Prompt Builder lists products from the AI Directory whose category fits the task, with what each product's official site said on the date it was checked. It is not a ranking. Where no listed product fits, it says so and you choose your own.</p></details>
                <details class="calculator-faq__item"><summary>Why does it ask for my technology stack or sources?</summary><p>Because an AI that is not told will guess, and a guessed framework, API or citation is worse than none. If you leave it out, the prompt asks the AI to ask you.</p></details>
                <details class="calculator-faq__item"><summary>Is anything saved?</summary><p>No. Your answers stay on this page and are gone when you leave it. Download the Work Pack to keep it: it is a Markdown file you can read anywhere, and Open a saved Work Pack brings every answer back. A project context pack is kept the same way.</p></details>
                <details class="calculator-faq__item"><summary>Do the tools I choose get connected?</summary><p>No. Choosing Postman, Jira or any other tool only shapes the prompt in that tool's terms. The page connects to nothing, and the AI you paste the prompt into cannot open your tools either: the prompt asks it to ask you for what it needs.</p></details>
                <details class="calculator-faq__item"><summary>Does the context pack import my AI conversations?</summary><p>No. Nothing here can read your AI products. Its extraction prompt asks an AI to summarise a conversation under fixed headings; you paste that reply back yourself. Nothing is sent or synchronised.</p></details>
            </section>

        </div>`;

}

export function render(mount = document.querySelector("#app")) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();
    init(mount);

}


/* ---------- behaviour ---------- */

export function init(app = document.getElementById("app")) {

    const $ = (id) => document.getElementById(`${P}-${id}`);
    const form = $("form");
    const body = $("pack-body");

    if (!form || !body) {
        return;
    }

    const state = { outcome: "", taskId: "", blueprint: null, offered: [], pack: null, view: "all", version: 0, profession: "", guide: null, method: null };

    /* professions, tools, the context review (D18) and the prompt detail controls (D19) load only when first needed */
    const loadGuide = async () => (state.guide ??= await import("./guide.js"));
    const controls = () => (state.method ? state.guide.readControls(P) : null);
    /* a profession's title is not among an outcome's suggested roles: add it so it can be selected */
    const addRole = (title) => {
        if (![...$("role").options].some((o) => o.value === title)) $("role").insertAdjacentHTML("beforeend", `<option value="${escapeHTML(title)}">${escapeHTML(title)}</option>`);
    };
    const toolInfo = () => state.guide && !$("tools").hidden ? state.guide.toolInput(P, form, state.taskId, controls()?.detail, controls()?.extras) : { tools: [] };

    const consistency = () => Object.fromEntries([...form.querySelectorAll("[data-cs]")].map((el) => [el.dataset.cs, el.value]));

    const note = (id, text) => { $(id).textContent = text; };
    let timer = 0;
    let announceTimer = 0;
    let lastSpoken = "";
    let loadTicket = 0;

    const announce = (text, delay = 700) => {
        clearTimeout(announceTimer);
        announceTimer = setTimeout(() => {
            if (text && text !== lastSpoken) {
                $("live").textContent = text;
                lastSpoken = text;
            }
        }, delay);
    };

    const setStep = (n) => {
        for (const li of document.querySelectorAll(`.${P}-progress li`)) {
            if (Number(li.dataset.step) === n) li.setAttribute("aria-current", "step");
            else li.removeAttribute("aria-current");
            li.dataset.done = String(Number(li.dataset.step) < n);
        }
    };

    const answers = () => {
        const out = {};
        for (const el of $("questions").querySelectorAll("[data-key]")) out[el.dataset.key] = el.value;
        return out;
    };

    const chosenProduct = () => {
        const picked = form.querySelector(`input[name="${P}-product"]:checked`)?.value;
        if (!picked) return null;
        if (picked === OWN) {
            const name = $("own-name")?.value.trim();
            return name ? { name, own: true } : null;
        }
        return state.offered.find((p) => p.id === picked) ?? null;
    };

    /* questions that depend on another answer are shown or hidden in place, keeping what was typed */
    const syncVisibility = () => {
        if (!state.blueprint) return;
        const shown = new Set(activeQuestions(state.blueprint, answers()).map((q) => q.key));
        for (const el of $("questions").querySelectorAll("[data-key]")) {
            el.closest(".calculator-form__group").hidden = !shown.has(el.dataset.key);
        }
    };

    function update() {

        if (!state.blueprint) return;

        syncVisibility();

        const tools = toolInfo();
        const settings = controls();
        const methodAt = (detail) => settings && state.guide.methodFor(state.method, { ...settings, detail }, state.blueprint, answers(), $("project").value);
        const input = {
            ...tools,
            method: methodAt(settings?.detail),
            answers: answers(),
            role: $("role").value,
            experience: $("experience").value,
            depth: $("depth").value,
            product: chosenProduct(),
            alternatives: state.offered.map((p) => p.name),
            noProductLine: state.offered.length ? "No product chosen; the prompts work in any capable assistant." : NOT_VERIFIED,
            context: $("project").value,
            consistency: consistency()
        };
        const pack = compileWorkPack(state.blueprint, getTask(state.taskId), input);

        state.pack = pack;

        /* each level's word count, from the same answers (D19) */
        if (settings) state.guide.countWords(P, settings.detail, pack, (d) => compileWorkPack(state.blueprint, getTask(state.taskId), { ...input, ...(!$("tools").hidden ? state.guide.toolInput(P, form, state.taskId, d, settings.extras) : {}), method: methodAt(d) }));

        /* A field's change event fires on blur, which happens on the mousedown of a click on a button or link in the pack:
           redrawing an unchanged pack then would replace the element under the pointer and lose the click. Redraw only
           when the pack (or the view) really changed. */
        const review = state.guide?.contextHTML(P, pack, tools, input.method, state.checkOpen) ?? "";
        const signature = `${state.view}\n${settings?.version ?? ""}\n${review}\n${pack.markdown}`;
        if (signature !== state.drawn) {
            body.innerHTML = review + state.packView.packHTML(pack, state.offered, state.view, state.blueprint.style !== "descriptive", state.guide);
            state.drawn = signature;
        }
        body.dataset.view = state.view;
        setStep(pack.state === "empty" ? 3 : 4);

        announce(pack.state === "ready" ? `Work Pack ready, ${pack.stages.length || 1} prompt${pack.stages.length === 1 ? "" : "s"} plus refinements.` : pack.state === "incomplete" ? `${pack.missing.length} essential${pack.missing.length === 1 ? "" : "s"} missing.` : "");

    }

    const scheduleUpdate = () => {
        clearTimeout(timer);
        timer = setTimeout(update, 150);
    };

    function questionControl(q) {

        const id = `${P}-q-${q.key}`;
        const describedBy = q.hint ? ` aria-describedby="${hintIdOf(id)}"` : "";
        const placeholder = q.placeholder ? ` placeholder="${escapeHTML(q.placeholder)}"` : "";

        const control = q.kind === "select"
            ? `<select id="${id}" class="calculator-form__input" data-key="${escapeHTML(q.key)}"${describedBy}>${q.options.map((o) => `<option value="${escapeHTML(o.value)}">${escapeHTML(o.label)}</option>`).join("")}</select>`
            : q.kind === "text"
                ? `<input id="${id}" class="calculator-form__input" type="text" maxlength="300" autocomplete="off" spellcheck="true" data-key="${escapeHTML(q.key)}"${placeholder}${describedBy}>`
                : `<textarea id="${id}" class="calculator-form__input ai-textarea" rows="${q.rows ?? 3}" maxlength="${q.long ? 8000 : 2000}" data-key="${escapeHTML(q.key)}"${placeholder}${describedBy}></textarea>`;

        return fieldShell({ id, label: q.essential ? `${q.label} (essential)` : q.label, hint: q.hint, control });

    }

    function renderProducts() {

        const offered = state.offered;
        $("products-note").textContent = offered.length ? "Listed for this kind of task:" : NOT_VERIFIED;

        $("product-list").innerHTML = `${offered.map((p) => `
                            <label class="wb-product">
                                <input type="radio" name="${P}-product" value="${escapeHTML(p.id)}">
                                <span><strong>${escapeHTML(p.name)}</strong>${p.by && p.by !== p.name ? ` <span class="ai-note">by ${escapeHTML(p.by)}</span>` : ""}<br><span class="ai-note">${escapeHTML(p.summary)}</span></span>
                            </label>`).join("")}
                            <label class="wb-product">
                                <input type="radio" name="${P}-product" value="${OWN}">
                                <span><strong>My own AI product</strong></span>
                            </label>
                            <div class="calculator-form__group" id="${P}-own" hidden>
                                <label class="calculator-form__label" for="${P}-own-name">Its name</label>
                                <input id="${P}-own-name" class="calculator-form__input" type="text" maxlength="100" autocomplete="off">
                            </div>`;

    }

    async function chooseTask(taskId, prefill = null) {

        const ticket = ++loadTicket;
        const task = getTask(taskId);

        $("details").hidden = false;
        $("questions").innerHTML = `<p class="ai-note">Loading the questions…</p>`;

        let blueprint;
        let productsFor;
        let productById;
        let method;

        try {
            [blueprint, { productsFor, productById }, state.packView] = await Promise.all([loadBlueprint(taskId), loadProducts(), import("./view.js"), loadGuide()]);
            loadFormat().catch(() => {});
            method = blueprint?.style === "descriptive" ? null : await state.guide.loadMethod(taskId);
        } catch {
            $("questions").innerHTML = `<p class="ai-note">The questions could not be loaded. Check your connection and choose the task again.</p>`;
            return;
        }

        if (ticket !== loadTicket || !blueprint) return;

        state.taskId = taskId;
        state.blueprint = blueprint;
        state.offered = productsFor(blueprint);

        state.method = state.guide.setupControls(P, method, state.method, prefill, () => {
            update();
            return state.pack?.promptWords ?? 0;
        }, announce);
        state.productById = productById;

        $("details-title").textContent = `A few questions: ${task.title.replace(/^Testing: /, "")}`;
        const upFront = blueprint.questions.filter((q) => !q.more);
        const extra = blueprint.questions.filter((q) => q.more);
        $("questions").innerHTML = `${upFront.map(questionControl).join("")}${extra.length ? `
                            <details class="${P}-more">
                                <summary>More details (optional)</summary>
                                <div class="calculator-form__grid">${extra.map(questionControl).join("")}</div>
                            </details>` : ""}`;
        renderProducts();

        state.guide.showTools(P, form, blueprint.style === "descriptive" ? "" : taskId, state.profession, prefill);

        /* image, video and audio work keeps a consistency sheet; labelled briefs take project context instead (16 D12) */
        $("consistency").hidden = !CREATIVE.has(task.family);
        $("context-field").hidden = blueprint.style === "descriptive";

        if (prefill) applyPrefill(prefill);
        else if (state.wantProduct) applyProduct(state.wantProduct, false);
        state.wantProduct = "";

        update();
        announce(prefill?.message ?? `${blueprint.questions.length} questions for ${task.title}.`, 0);

    }

    /* a playbook step, an opened file or a link fills the form: answers go only where a field is still empty unless the whole pack is restored */
    function applyPrefill(p) {

        const fillField = (el, value) => {
            if (!el || typeof value !== "string" || !value) return;
            if (p.onlyEmpty && el.value !== "" && !(el.tagName === "SELECT" && el.selectedIndex === 0)) return;
            if (el.tagName === "SELECT" && ![...el.options].some((o) => o.value === value)) return;
            el.value = value;
        };

        for (const [key, value] of Object.entries(p.answers ?? {})) fillField($("questions").querySelector(`[data-key="${CSS.escape(key)}"]`), value);
        syncVisibility();
        for (const [key, value] of Object.entries(p.answers ?? {})) fillField($("questions").querySelector(`[data-key="${CSS.escape(key)}"]`), value); // a question shown by an earlier answer

        fillField($("depth"), p.depth);
        if (typeof p.role === "string" && p.role) addRole(p.role.slice(0, 100));
        fillField($("role"), p.role);
        fillField($("experience"), p.experience);
        if (typeof p.context === "string" && p.context && !$("context-field").hidden) $("project").value = p.context.slice(0, CONTEXT_LIMIT);
        for (const [key, value] of Object.entries(p.consistency ?? {})) fillField(form.querySelector(`[data-cs="${CSS.escape(key)}"]`), value);
        if (p.product) applyProduct(p.product, p.ownProduct);

        if (p.more && Object.keys(p.answers ?? {}).some((k) => state.blueprint.questions.find((q) => q.key === k)?.more)) {
            form.querySelector(`.${P}-more`)?.setAttribute("open", "");
        }

    }

    /* a directory id from ?product= or a file; a product not listed for this task becomes "My own AI product" with its name */
    function applyProduct(product, own) {

        const listed = !own && state.offered.find((p) => p.id === product);
        const radio = form.querySelector(`input[name="${P}-product"][value="${CSS.escape(listed ? product : OWN)}"]`);
        if (!radio) return;
        radio.checked = true;
        $("own").hidden = Boolean(listed);

        if (!listed) {
            const known = own ? null : state.productById?.(product);
            $("own-name").value = (known?.name ?? product).slice(0, 100);
            if (known) note("suggestion", `${known.name} is not listed for this task in the AI Directory. You can still use it: it is set as your own AI product.`);
        }

    }

    async function selectTask(taskId, prefill = null) {

        const task = getTask(taskId);
        if (!task) return false;

        const outcome = form.querySelector(`input[name="${P}-outcome"][value="${CSS.escape(task.outcome)}"]`);
        outcome.checked = true;
        chooseOutcome(task.outcome);
        const radio = form.querySelector(`input[name="${P}-task"][value="${CSS.escape(taskId)}"]`);
        radio.checked = true;
        await chooseTask(taskId, prefill);
        $("details-title").focus?.();

        return true;

    }

    function chooseOutcome(outcomeId) {

        loadTicket += 1; // a task still loading for the previous outcome is dropped
        state.outcome = outcomeId;

        if (outcomeId === "unsure") {
            $("tasks").hidden = true;
            $("details").hidden = true;
            setStep(1);
            note("suggestion", "Describe it above; the AI Prompt Builder shows the closest tasks for you to choose from.");
            $("describe").focus();
            return;
        }

        const roles = ROLES[outcomeId] ?? [];
        $("role").innerHTML = `<option value="">Skip</option>${roles.map((r) => `<option value="${escapeHTML(r)}">${escapeHTML(r)}</option>`).join("")}`;

        $("task-list").innerHTML = tasksFor(outcomeId).map((t) => `
                            <label class="wb-choice wb-choice--task">
                                <input type="radio" name="${P}-task" value="${escapeHTML(t.id)}">
                                <span class="wb-choice__title">${escapeHTML(t.title)}</span>
                            </label>`).join("");

        $("tasks").hidden = false;
        $("details").hidden = true;
        state.blueprint = null;
        state.taskId = "";
        body.innerHTML = `<p class="ai-check__line">Now choose the task.</p>`;
        state.drawn = "";
        setStep(2);

    }

    form.addEventListener("change", (event) => {

        const t = event.target;

        if (t.name === `${P}-outcome`) chooseOutcome(t.value);
        else if (t.name === `${P}-task`) chooseTask(t.value);
        else if (t.id === `${P}-profession`) {
            state.profession = t.value;
            $("profession-tasks").innerHTML = state.guide?.professionTasks(t.value) ?? "";
            if (t.value) announce("The tasks of this profession are listed below the choice.", 0);
        } else if (t.closest(`#${P}-tools`)) {
            state.guide?.onToolChange(P, form, t);
            update();
        }
        else if (t.name === `${P}-product`) {
            $("own").hidden = t.value !== OWN;
            update();
        } else if (t.id === `${P}-open-file` || t.id === `${P}-open-text` || t.id === `${P}-describe`) {
            return;
        } else update();

    });

    form.addEventListener("input", (event) => {
        if (event.target.id === `${P}-tool-search`) state.guide?.filterTools(P, form, event.target.value);
        else if (event.target.matches("textarea, input[type=text]") && ![`${P}-describe`, `${P}-open-text`].includes(event.target.id)) scheduleUpdate();
    });

    body.addEventListener("toggle", (event) => {
        if (event.target.id === `${P}-prompt-check`) state.checkOpen = event.target.open;
    }, true);

    $("playbooks").addEventListener("toggle", async () => {
        if (!$("playbooks").open || $("playbooks").dataset.loaded) return;
        try {
            $("playbook-list").innerHTML = (await loadPlaybooks()).playbookList();
            $("playbooks").dataset.loaded = "true";
        } catch {
            $("playbook-list").innerHTML = `<li class="ai-note">The playbooks could not be loaded. Check your connection and open this again.</li>`;
        }
    });

    /* "Start from your profession": the list loads the first time it is opened (D18) */
    $("professions").addEventListener("toggle", async () => {
        if (!$("professions").open || $("profession")) return;
        try {
            $("profession-body").innerHTML = (await loadGuide()).professionPicker(P);
        } catch {
            $("profession-body").innerHTML = `<p class="ai-note">The professions could not be loaded. Check your connection and open this again.</p>`;
        }
    });

    /* a profession's task also sets the role written into the prompt */
    const setRole = (roleId) => {
        const title = state.guide?.roleTitle(roleId);
        if (!title) return;
        addRole(title);
        $("role").value = title;
        update();
    };

    form.addEventListener("submit", (event) => event.preventDefault());

    /* ---------- describe: the task index (17 §5.2); the visitor always chooses ---------- */

    const matchCard = (t) => `
                            <li class="${P}-match">
                                <span><strong>${escapeHTML(taskLabel(t.title))}</strong> <span class="ai-note">${escapeHTML(getOutcome(t.outcome)?.title ?? "")}</span></span>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary" data-use-task="${escapeHTML(t.id)}">Use this task</button>
                            </li>`;

    async function findMatches() {

        const text = $("describe").value.trim();
        const box = $("matches");

        if (!text) {
            box.innerHTML = "";
            note("suggestion", "Type a few words first.");
            return;
        }

        let matchTasks;
        try {
            ({ matchTasks } = await loadMatcher());
        } catch {
            note("suggestion", "The task finder could not be loaded. Check your connection, or choose what you want to accomplish below.");
            return;
        }
        const { tasks, utilities, confident } = matchTasks(text);
        const tools = utilities.length ? `
                            <p class="${P}-sub">Another AI tool may fit</p>
                            <ul class="${P}-match-list">${utilities.map((u) => `<li><a href="${escapeHTML(u.route)}">${escapeHTML(u.title)}</a></li>`).join("")}</ul>` : "";

        note("suggestion", "");

        if (!tasks.length) {
            box.innerHTML = `<p class="ai-note">No close match. Choose what you want to accomplish below, or write one prompt for anything:</p><ul class="${P}-match-list">${matchCard(getTask("general-prompt"))}</ul>${tools}`;
            announce("No close match.", 0);
            return;
        }

        box.innerHTML = confident
            ? `<p class="${P}-sub">Best match</p><ul class="${P}-match-list">${matchCard(tasks[0])}</ul>${tasks.length > 1 ? `<p class="${P}-sub">Other possible tasks</p><ul class="${P}-match-list">${tasks.slice(1).map(matchCard).join("")}</ul>` : ""}${tools}`
            : `<p class="${P}-sub">Several could fit. Choose one:</p><ul class="${P}-match-list">${tasks.map(matchCard).join("")}</ul>${tools}`;
        announce(`${tasks.length} task${tasks.length === 1 ? "" : "s"} match. Choose one.`, 0);

    }

    $("suggest").addEventListener("click", findMatches);

    $("describe").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            findMatches();
        }
    });

    $("unsure").addEventListener("click", async (event) => {

        const use = event.target.closest("[data-use-task]");
        const step = event.target.closest("[data-playbook]");

        if (use) {
            if (!use.dataset.role) state.profession = "";
            await selectTask(use.dataset.useTask);
            if (use.dataset.role) setRole(use.dataset.role);
        } else if (step) {
            const playbook = (await loadPlaybooks()).getPlaybook(step.dataset.playbook);
            const s = playbook?.steps[Number(step.dataset.step)];
            if (s) await selectTask(s.task, { answers: s.answers, depth: s.depth, onlyEmpty: true, message: `Filled from the playbook "${playbook.title}". Edit anything.` });
        } else if (event.target.id === `${P}-open-button`) {
            await openPack();
        }

    });

    /* ---------- open a saved Work Pack (16 D6, D9) ---------- */

    async function openPack() {

        const error = (text) => {
            note("open-error", text);
            announce(text, 0);
        };

        let text = $("open-text").value;
        const file = $("open-file").files?.[0];
        let format;
        try {
            format = await loadFormat();
        } catch {
            return error("Opening a pack could not be loaded. Check your connection and try again.");
        }
        const { readFile, readMeta, pick } = format;

        if (file) {
            const read = await readFile(file);
            if (read.error) return error(read.error);
            text = read.text;
        }

        if (!text.trim()) return error("Choose a Work Pack file or paste its text first.");

        const { meta, error: problem } = readMeta(text);
        if (problem) return error(problem === "none" ? "This is not a Work Pack file: it has no ToolZen Hub data at its end. Only a pack downloaded from this page can be opened." : problem);

        const { value, ignored } = pick(meta, FILE_SCHEMA);
        if (value.kind !== "work-pack") return error("This file is not a Work Pack. A context pack opens under Project context pack, below the questions.");
        if (!getTask(value.task)) return error(`This pack is for a task that is no longer offered: ${String(value.task ?? "none").slice(0, 40)}.`);

        note("open-error", "");
        state.version = value.version ?? 1;
        state.profession = value.profession ?? "";
        const message = `Opened "${getTask(value.task).title}", version ${state.version}${value.date ? ` of ${value.date}` : ""}.${ignored.length ? ` Ignored: ${ignored.join(", ")}.` : ""}`;

        await selectTask(value.task, { ...value, more: true, message });
        note("suggestion", message);
        $("open").open = false;

    }

    $("show").addEventListener("click", () => {
        update();
        $("pack-title").focus();
        $("pack-title").scrollIntoView({ block: "start" });
    });

    $("reset").addEventListener("click", () => {
        loadTicket += 1;
        form.reset();
        state.outcome = "";
        state.taskId = "";
        state.blueprint = null;
        state.method = null;
        state.version = 0;
        $("prompt-controls").hidden = true;
        $("tasks").hidden = true;
        $("details").hidden = true;
        $("matches").innerHTML = "";
        note("suggestion", "");
        note("open-error", "");
        body.innerHTML = `<p class="ai-check__line">${EMPTY_LINE}</p>`;
        state.drawn = "";
        setStep(1);
        announce("Cleared.", 0);
        $("describe").focus();
    });

    const copy = async (text, label, source) => {
        try {
            await navigator.clipboard.writeText(text);
            announce(`${label} copied.`, 0);
        } catch {
            if (source) {
                const range = document.createRange();
                if (source.select) {
                    source.select();
                    source.focus();
                    announce("Copying was refused by the browser. The text is selected: press Ctrl+C or Cmd+C.", 0);
                    return;
                }
                range.selectNodeContents(source);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                source.focus();
            }
            announce("Copying was refused by the browser. The text is selected: press Ctrl+C or Cmd+C.", 0);
        }
    };

    /* the file keeps everything needed to open it again; Copy never includes the data comment (16 D9) */
    function packFile({ withMeta, today, FORMAT }) {

        const product = chosenProduct();
        state.version += 1;

        return withMeta(state.pack.markdown, {
            kind: "work-pack",
            format: FORMAT,
            version: state.version,
            date: today(),
            task: state.taskId,
            answers: Object.fromEntries(Object.entries(answers()).filter(([, v]) => v)),
            role: $("role").value,
            experience: $("experience").value,
            depth: $("depth").value,
            product: product ? (product.own ? product.name : product.id) : "",
            ownProduct: Boolean(product?.own),
            context: $("context-field").hidden ? "" : $("project").value,
            consistency: Object.fromEntries(Object.entries(consistency()).filter(([, v]) => v)),
            profession: state.profession,
            ...(state.method ? { prompt: state.guide.promptState(P) } : {}),
            ...(state.guide && !$("tools").hidden ? state.guide.toolState(P, form, state.taskId) : {})
        });

    }

    body.addEventListener("change", (event) => {
        if (event.target.name === `${P}-view`) {
            state.view = event.target.value;
            body.dataset.view = state.view;
            announce(state.view === "prompts" ? "Showing the prompts only." : "Showing everything.", 0);
        }
    });

    body.addEventListener("click", (event) => {

        if (!state.pack) return;

        /* the receiving tool takes these once; after a reload it still works by paste (16 D8) */
        if (event.target.closest(`#${P}-to-review`)) {
            put("review", { request: state.pack.masterPrompt, task: state.taskId, title: getTask(state.taskId)?.title ?? "" });
            return;
        }

        if (event.target.closest(`#${P}-to-bridge`)) {
            bridgeSeed = { project: getTask(state.taskId)?.title ?? "", purpose: state.pack.overview.objective, task: state.pack.stages[0]?.objective ?? state.pack.overview.deliverable };
            openBridge();
            return;
        }

        /* the context review's "Change" links: open a folded section, then go to the answer */
        const edit = event.target.closest(".wb-review__edit");
        if (edit) {
            const target = document.getElementById(edit.getAttribute("href").slice(1));
            const fold = target?.closest("details");
            if (fold) fold.open = true;
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ block: "center" });
                target.focus?.();
            }
            return;
        }

        const button = event.target.closest("button");
        if (!button) return;

        if (button.dataset.adjust && state.method) {
            /* a labelled task steps the prompt detail (D19) */
            const level = state.guide.stepDetail(P, Number(button.dataset.adjust));
            if (level) {
                update();
                announce(`Prompt detail set to ${level}: ${state.pack.promptWords} words. Written again here; no AI is used.`, 0);
            }
        } else if (button.dataset.adjust) {
            /* a local rewrite at another depth, labelled as such on the page; no AI is used */
            const order = ["short", "standard", "detailed", "multi"];
            const next = order[order.indexOf(state.pack.depth) + Number(button.dataset.adjust)];
            if (next) {
                $("depth").value = next;
                update();
                announce(`Depth set to ${DEPTH_NAMES[next]}. The pack was written again.`, 0);
            }
        } else if (button.id === `${P}-copy-edit`) {
            const area = $("master-edit");
            copy(area.value, "Edited prompt", area);
        } else if (button.dataset.copy) {
            const source = document.getElementById(button.dataset.copy);
            copy(source.textContent, document.getElementById(`${button.dataset.copy}-title`)?.textContent ?? "Prompt", source);
        } else if (button.id === `${P}-copy-all`) {
            copy(state.pack.markdown, "Work Pack", null);
        } else if (button.id === `${P}-download`) {
            /* loaded with the first task, so normally already here */
            loadFormat().then((format) => {
                const name = `ai-work-pack-${state.taskId}-${format.today()}.md`;
                format.downloadText(packFile(format), name);
                announce(`Downloaded ${name}. Open it here again with Open a saved Work Pack.`, 0);
            }, () => announce("Downloading could not be prepared. Check your connection and try again.", 0));
        } else if (button.id === `${P}-expand`) {
            const folds = [...body.querySelectorAll(`.${P}-stage--fold`)];
            const open = folds.some((d) => !d.open);
            for (const d of folds) d.open = open;
            button.textContent = open ? "Fold the later stages" : "Expand all stages";
        }

    });

    let bridgeSeed = null;
    let bridgeLoaded = false;
    const openBridge = () => {
        $("bridge").classList.remove(`${P}-off`);
        $("bridge-fold").open = true;
        $("bridge").scrollIntoView({ block: "start" });
        $("bridge-title").focus?.();
    };
    $("bridge-fold").addEventListener("toggle", () => {
        if (!$("bridge-fold").open || bridgeLoaded) return;
        bridgeLoaded = true;
        import("./context.js").then(({ mountContext }) => {
            if (!form.isConnected) return;
            mountContext($("bridge-body"), {
                seed: bridgeSeed,
                use: (md) => {
                    const fold = form.querySelector(`.${P}-context`);
                    if (fold) fold.open = true;
                    $("context-field").hidden = false;
                    $("project").value = md.slice(0, CONTEXT_LIMIT);
                    update();
                    const cut = md.length > CONTEXT_LIMIT ? ` It was cut to ${CONTEXT_LIMIT.toLocaleString("en-GB")} characters; a handoff is shorter.` : "";
                    note("suggestion", `The context pack is in Project context and used in the main prompt.${cut}`);
                    announce(`Context pack added to your prompt.${cut}`, 0);
                }
            });
        }, () => {
            bridgeLoaded = false;
            $("bridge-body").innerHTML = `<p class="ai-note">The context pack could not be loaded. Check your connection and open it again.</p>`;
        });
    });

    addJumpToResult(app ?? document.body, "Jump to the Work Pack");

    /* ---------- arrivals: a link (?task, ?role, ?outcome, ?start, ?product) ---------- */

    const query = new URLSearchParams(location.search);
    const linkedTask = getTask(query.get("task") ?? "") ? query.get("task") : "";
    const linkedRole = (query.get("role") ?? "").replace(/[^a-z-]/g, "").slice(0, 40);
    const linkedOutcome = query.get("outcome");
    const start = query.get("start");
    state.wantProduct = (query.get("product") ?? "").replace(/[^a-z0-9-]/g, "").slice(0, 60);

    if (query.get("task") && !linkedTask) note("suggestion", "That link named a task that is not offered. Describe your task or choose your profession.");

    /* an outcome, a describe start or the context pack open the full page; a task or a profession continues in the guided panel */
    if (linkedOutcome && !linkedTask) {
        const radio = getOutcome(linkedOutcome) && linkedOutcome !== "unsure" ? form.querySelector(`input[name="${P}-outcome"][value="${CSS.escape(linkedOutcome)}"]`) : null;
        if (radio) {
            radio.checked = true;
            chooseOutcome(linkedOutcome);
        } else note("suggestion", "That link named an outcome that is not offered. Choose what you want to accomplish.");
    } else if (start === "describe") {
        $("describe").focus();
    }

    const full = Boolean(linkedOutcome && !linkedTask) || start === "describe" || start === "context";
    const guided = !full;
    /* the page may have been left (in-place navigation) before the panel arrives: then there is nothing to set up */
    import("./panel.js").then((m) => {
        if (!form.isConnected) return;
        m.initPanel({ P, form, state, chooseTask, setRole, answers, reset: () => $("reset").click(), update, announce, guided, start: guided && (linkedTask || linkedRole) ? { task: linkedTask, role: linkedRole } : null });
        if (start === "context") openBridge();
    }, () => {
        if (form.isConnected) $("panel").dataset.mode = "full";
    }).finally(() => {
        form.dataset.ready = "true";
    });

}

