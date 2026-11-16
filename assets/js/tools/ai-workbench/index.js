/* =========================================================
   ToolZen Hub
   AI Workbench (AI Tools, Tool Pack 58)

   Outcome first, then a task, a few questions, optional context
   and an AI product; the Work Pack (preparation, master prompt,
   stages, refinements, quality checklist, next steps) is written
   in the browser as the visitor answers. The page is one form with
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
import { OUTCOMES, ROLES, EXPERIENCE, DEPTHS, getTask, tasksFor, suggestOutcome } from "./taxonomy.js";
import { compileWorkPack, activeQuestions, NOT_VERIFIED } from "./compiler.js";
import { loadBlueprint } from "./blueprints.js";

/* the directory data is needed only once a task is chosen */
let productsModule = null;
const loadProducts = () => (productsModule ??= import("./products.js"));


export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const P = "wb";
const OWN = "own";
const DEPTH_NAMES = { short: "Short", standard: "Standard", detailed: "Detailed", multi: "Multi-stage" };


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

    const tool = getToolById("ai-workbench");

    return `
        <div class="calculator-page">

            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">AI Tool</span>
                    <h1>${escapeHTML(tool.title)}</h1>
                    <p>Say what you want to accomplish, answer a few questions, and get an AI Work Pack: what to prepare, which kind of AI product fits, a master prompt, the stages to follow with a prompt for each, follow-up prompts to fix weak answers, and a checklist to review the result. You paste the prompts into the AI product you use.</p>
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

            <section class="calculator-section">
                <form id="${P}-form" class="calculator-form ai-form ${P}-form" novalidate>

                    <fieldset class="${P}-group" id="${P}-outcomes">
                        <legend class="calculator-section__title">What do you want to accomplish with AI?</legend>
                        <div class="${P}-choices">${outcomeChoices()}
                        </div>
                    </fieldset>

                    <div class="${P}-unsure" id="${P}-unsure" hidden>
                        ${fieldShell({ id: `${P}-describe`, label: "Describe what you want, in a few words", hint: "For example \"a short video for my bakery's Instagram\".", control: `<input id="${P}-describe" class="calculator-form__input" type="text" maxlength="300" autocomplete="off" aria-describedby="${hintIdOf(`${P}-describe`)}">` })}
                        <button type="button" id="${P}-suggest" class="calculator-form__button calculator-form__button--secondary">Suggest an outcome</button>
                        <p id="${P}-suggestion" class="ai-note"></p>
                    </div>

                    <fieldset class="${P}-group" id="${P}-tasks" hidden>
                        <legend class="calculator-section__title">Choose the task</legend>
                        <div class="${P}-choices ${P}-choices--tasks" id="${P}-task-list"></div>
                    </fieldset>

                    <div class="${P}-group" id="${P}-details" hidden>
                        <h2 class="calculator-section__title" id="${P}-details-title">A few questions</h2>
                        <p class="calculator-section__description">Only what changes the result. Fields marked essential go into the prompt; leave the rest empty if you do not know.</p>
                        <div class="calculator-form__grid" id="${P}-questions"></div>

                        <details class="${P}-context">
                            <summary>Your context (optional)</summary>
                            <div class="calculator-form__grid">
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

                    <noscript><p class="ai-note">The Workbench needs JavaScript to build the Work Pack. Nothing you type is sent anywhere.</p></noscript>

                </form>
            </section>

            <section id="${P}-results" class="calculator-results ${P}-pack" aria-labelledby="${P}-pack-title">
                <div class="calculator-results__card">
                    <h2 id="${P}-pack-title" class="${P}-pack__title" tabindex="-1">Your AI Work Pack</h2>
                    <div id="${P}-pack-body">
                        <p class="ai-check__line">Choose what you want to accomplish. Your Work Pack appears here as you answer.</p>
                    </div>
                </div>
            </section>
            <p id="${P}-live" class="ai-sr-only" role="status" aria-live="polite"></p>

            <section class="calculator-info">
                <h2>How the Workbench works</h2>
                <ol>
                    <li>Choose the outcome, then the task. If you are not sure, describe it in a few words and the Workbench suggests an outcome for you to confirm.</li>
                    <li>Answer the few questions that change the result. Essentials are marked; anything you leave out is listed as missing and written into the prompt as <code>[add: …]</code>, never guessed.</li>
                    <li>Optionally give your role and experience: a beginner's pack explains each step; a senior pack asks for trade-offs, risks and decisions.</li>
                    <li>Pick an AI product from the ones listed for this task, or use your own.</li>
                    <li>Copy the master prompt into the product, then work through the stages one prompt at a time, use the refinement prompts where the answer falls short, and review the result with the checklist.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>What a Work Pack contains</h2>
                <h3>Preparation</h3><p>What to have ready before you start (requirements, files, references), and what your answers are still missing.</p>
                <h3>Master prompt</h3><p>The task, your context, the requirements, the format of the answer and what to avoid. An image, video or audio prompt is one descriptive paragraph instead, with what must stay unchanged kept apart from what must change.</p>
                <h3>Stages</h3><p>For larger work, the steps in order: each with its objective, what to submit, its own prompt, what to expect and when it is done. Detailed and multi-stage packs end with a review against the brief.</p>
                <h3>Refinement prompts</h3><p>Follow-ups for the problems this kind of work usually has: accuracy, missing requirements, clarity, consistency, technical quality, evidence.</p>
                <h3>Quality checklist and next steps</h3><p>What to check before you use the result, and what to do after.</p>
            </section>

            <section class="calculator-info">
                <h2>Frequently Asked Questions</h2>
                <details class="calculator-faq__item"><summary>Does the Workbench run the AI for me?</summary><p>No. It prepares the work; you paste the prompts into the AI product you use. Nothing is sent from this page to any AI service.</p></details>
                <details class="calculator-faq__item"><summary>How is the AI product chosen?</summary><p>The Workbench lists products from the AI Directory whose category fits the task, with what each product's official site said on the date it was checked. It is not a ranking. Where no listed product fits, it says so and you choose your own.</p></details>
                <details class="calculator-faq__item"><summary>Why does it ask for my technology stack or sources?</summary><p>Because an AI that is not told will guess, and a guessed framework, API or citation is worse than none. If you leave it out, the prompt asks the AI to ask you.</p></details>
                <details class="calculator-faq__item"><summary>Is anything saved?</summary><p>No. Your answers stay on this page and are gone when you leave it. Download the Work Pack as a Markdown file to keep it.</p></details>
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


/* ---------- the pack ---------- */

const promptBlock = (id, title, body) => `
                        <div class="${P}-prompt">
                            <div class="${P}-prompt__head">
                                <h4 class="${P}-prompt__title" id="${id}-title">${escapeHTML(title)}</h4>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary ${P}-copy" data-copy="${id}" aria-describedby="${id}-title">Copy</button>
                            </div>
                            <pre class="${P}-prompt__text" id="${id}" tabindex="0" aria-labelledby="${id}-title">${escapeHTML(body)}</pre>
                        </div>`;

const list = (items, tag = "ul") => items.length ? `<${tag}>${items.map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</${tag}>` : "";

function productHTML(pack, offered) {

    const chosen = pack.product.chosen;

    if (chosen?.name) {
        return `
                    <p><strong>${escapeHTML(chosen.name)}</strong>${chosen.own ? " (your choice)" : ""}</p>
                    ${chosen.summary ? `<p class="ai-note">Its official site, checked ${escapeHTML(chosen.checked)}: ${escapeHTML(chosen.summary)} <a href="${escapeHTML(chosen.url)}" target="_blank" rel="noopener noreferrer">Official site<span class="ai-sr-only">, opens in a new tab</span> ↗</a></p>` : ""}
                    ${chosen.reason ? `<p class="ai-note">${escapeHTML(chosen.reason)}</p>` : ""}
                    ${pack.product.alternatives.length ? `<p class="ai-note">Also listed for this task (not a ranking): ${escapeHTML(pack.product.alternatives.join(", "))}.</p>` : ""}`;
    }

    return offered.length
        ? `<p>Products listed for this task in the AI Directory (not a ranking): ${escapeHTML(offered.map((p) => p.name).join(", "))}. Choose one above, or use your own.</p>`
        : `<p>${escapeHTML(NOT_VERIFIED)}</p>`;

}

function packHTML(pack, offered) {

    const stateLine = pack.state === "empty"
        ? `<p class="ai-check__line">Answer the questions. The pack is written as you type.</p>`
        : pack.state === "incomplete"
            ? `<p class="ai-check__line"><strong>Almost ready.</strong> Missing: ${escapeHTML(pack.missing.join(", "))}. They are marked [add: …] in the prompts; fill them in here or tell the AI when it asks.</p>`
            : `<p class="ai-check__line"><strong>Ready.</strong> ${escapeHTML(DEPTH_NAMES[pack.depth])} pack${pack.stages.length ? `, ${pack.stages.length} stage${pack.stages.length === 1 ? "" : "s"}` : ", one prompt"}.</p>`;

    const conflicts = pack.conflicts.length ? `
                <div class="${P}-alert" role="note"><strong>Check this first:</strong>${list(pack.conflicts)}</div>` : "";

    const stagesNav = pack.stages.length > 1 ? `
                    <ol class="${P}-stage-nav" aria-label="Stages">${pack.stages.map((s) => `<li><a href="#${P}-stage-${s.n}">${escapeHTML(s.name)}</a></li>`).join("")}</ol>` : "";

    const stages = pack.stages.map((s) => `
                    <article class="${P}-stage" id="${P}-stage-${s.n}" aria-labelledby="${P}-stage-${s.n}-name">
                        <h4 class="${P}-stage__name" id="${P}-stage-${s.n}-name">${s.n}. ${escapeHTML(s.name)}</h4>
                        <dl class="${P}-stage__facts">
                            <div><dt>Objective</dt><dd>${escapeHTML(s.objective)}</dd></div>
                            <div><dt>Submit</dt><dd>${escapeHTML(s.submit)}</dd></div>
                            <div><dt>Expect</dt><dd>${escapeHTML(s.expect)}</dd></div>
                            <div><dt>Done when</dt><dd>${escapeHTML(s.done)}</dd></div>
                        </dl>
                        ${promptBlock(`${P}-stage-${s.n}-prompt`, `Stage ${s.n} prompt`, s.prompt)}
                        <p class="ai-note">${escapeHTML(s.next)}</p>
                    </article>`).join("");

    return `
                ${stateLine}${conflicts}

                <section class="${P}-part" aria-labelledby="${P}-h-overview">
                    <h3 id="${P}-h-overview">Overview</h3>
                    <dl class="${P}-stage__facts">
                        <div><dt>Task</dt><dd>${escapeHTML(pack.overview.task)}</dd></div>
                        <div><dt>Deliverable</dt><dd>${escapeHTML(pack.overview.deliverable)}</dd></div>
                        <div><dt>Success</dt><dd>${escapeHTML(pack.overview.success.join(" "))}</dd></div>
                    </dl>
                </section>

                <section class="${P}-part" aria-labelledby="${P}-h-product">
                    <h3 id="${P}-h-product">AI product</h3>
                    ${productHTML(pack, offered)}
                </section>

                <section class="${P}-part" aria-labelledby="${P}-h-prepare">
                    <h3 id="${P}-h-prepare">Prepare</h3>
                    ${pack.preparation.required.length ? `<p class="${P}-sub">Have ready</p>${list(pack.preparation.required)}` : ""}
                    ${pack.preparation.optional.length ? `<p class="${P}-sub">Helpful</p>${list(pack.preparation.optional)}` : ""}
                    ${pack.missing.length ? `<p class="${P}-sub">Still missing from your answers</p>${list(pack.missing)}` : ""}
                </section>

                <section class="${P}-part" aria-labelledby="${P}-h-master">
                    <h3 id="${P}-h-master">Master prompt</h3>
                    <p class="ai-note">${pack.stages.length ? "Paste it as the first message of a new conversation, then use the stage prompts in the same conversation." : "Paste it into the AI product."}</p>
                    ${promptBlock(`${P}-master`, "Master prompt", pack.masterPrompt)}
                </section>
                ${pack.stages.length ? `
                <section class="${P}-part" aria-labelledby="${P}-h-stages">
                    <h3 id="${P}-h-stages">Stages</h3>${stagesNav}${stages}
                </section>` : ""}
                ${pack.refinements.length ? `
                <section class="${P}-part" aria-labelledby="${P}-h-refine">
                    <h3 id="${P}-h-refine">Refinement prompts</h3>
                    <p class="ai-note">Use one when an answer falls short in that way, in the same conversation.</p>
                    ${pack.refinements.map((r) => promptBlock(`${P}-refine-${r.id}`, r.title, r.prompt)).join("")}
                </section>` : ""}

                <section class="${P}-part" aria-labelledby="${P}-h-quality">
                    <h3 id="${P}-h-quality">Quality checklist</h3>
                    <ul class="${P}-checklist">${pack.quality.map((q, i) => `<li><label><input type="checkbox" id="${P}-q-${i}"> <span>${escapeHTML(q)}</span></label></li>`).join("")}</ul>
                    <p class="ai-note">Ticks are for this visit only; nothing is saved.</p>
                </section>
                ${pack.nextSteps.length ? `
                <section class="${P}-part" aria-labelledby="${P}-h-next">
                    <h3 id="${P}-h-next">Next steps</h3>
                    ${list(pack.nextSteps)}
                </section>` : ""}

                <div class="calculator-form__actions ai-actions">
                    <button type="button" id="${P}-copy-all" class="calculator-form__button">Copy the whole pack</button>
                    <button type="button" id="${P}-download" class="calculator-form__button calculator-form__button--secondary">Download .md</button>
                </div>`;

}


/* ---------- behaviour ---------- */

export function init(app = document.getElementById("app")) {

    const $ = (id) => document.getElementById(`${P}-${id}`);
    const form = $("form");
    const body = $("pack-body");

    if (!form || !body) {
        return;
    }

    const state = { outcome: "", taskId: "", blueprint: null, offered: [], pack: null };
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

        const pack = compileWorkPack(state.blueprint, getTask(state.taskId), {
            answers: answers(),
            role: $("role").value,
            experience: $("experience").value,
            depth: $("depth").value,
            product: chosenProduct(),
            alternatives: state.offered.map((p) => p.name),
            noProductLine: state.offered.length ? "No product chosen; the prompts work in any capable assistant." : NOT_VERIFIED
        });

        state.pack = pack;
        body.innerHTML = packHTML(pack, state.offered);
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

    async function chooseTask(taskId) {

        const ticket = ++loadTicket;
        const task = getTask(taskId);

        $("details").hidden = false;
        $("questions").innerHTML = `<p class="ai-note">Loading the questions…</p>`;

        let blueprint;
        let productsFor;

        try {
            [blueprint, { productsFor }] = await Promise.all([loadBlueprint(taskId), loadProducts()]);
        } catch {
            $("questions").innerHTML = `<p class="ai-note">The questions could not be loaded. Check your connection and choose the task again.</p>`;
            return;
        }

        if (ticket !== loadTicket || !blueprint) return;

        state.taskId = taskId;
        state.blueprint = blueprint;
        state.offered = productsFor(blueprint);

        $("details-title").textContent = `A few questions: ${task.title.replace(/^Testing: /, "")}`;
        const upFront = blueprint.questions.filter((q) => !q.more);
        const extra = blueprint.questions.filter((q) => q.more);
        $("questions").innerHTML = `${upFront.map(questionControl).join("")}${extra.length ? `
                            <details class="${P}-more">
                                <summary>More details (optional)</summary>
                                <div class="calculator-form__grid">${extra.map(questionControl).join("")}</div>
                            </details>` : ""}`;
        renderProducts();
        update();
        announce(`${blueprint.questions.length} questions for ${task.title}.`, 0);

    }

    function chooseOutcome(outcomeId) {

        loadTicket += 1; // a task still loading for the previous outcome is dropped
        state.outcome = outcomeId;
        $("unsure").hidden = outcomeId !== "unsure";

        if (outcomeId === "unsure") {
            $("tasks").hidden = true;
            $("details").hidden = true;
            setStep(1);
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
        setStep(2);

    }

    form.addEventListener("change", (event) => {

        const t = event.target;

        if (t.name === `${P}-outcome`) chooseOutcome(t.value);
        else if (t.name === `${P}-task`) chooseTask(t.value);
        else if (t.name === `${P}-product`) {
            $("own").hidden = t.value !== OWN;
            update();
        } else update();

    });

    form.addEventListener("input", (event) => {
        if (event.target.matches("textarea, input[type=text]") && event.target.id !== `${P}-describe`) scheduleUpdate();
    });

    form.addEventListener("submit", (event) => event.preventDefault());

    $("suggest").addEventListener("click", () => {

        const outcome = suggestOutcome($("describe").value);

        if (!outcome) {
            $("suggestion").textContent = "No clear match. Choose the closest outcome above; you can change it at any time.";
            return;
        }

        const radio = form.querySelector(`input[name="${P}-outcome"][value="${outcome}"]`);
        radio.checked = true;
        chooseOutcome(outcome);
        $("suggestion").textContent = "";
        $("unsure").hidden = true;
        announce(`Suggested: ${radio.closest("label").querySelector(".wb-choice__title").textContent}. Change it above if that is not right. Now choose the task.`, 0);
        form.querySelector(`input[name="${P}-task"]`)?.focus();

    });

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
        $("unsure").hidden = true;
        $("tasks").hidden = true;
        $("details").hidden = true;
        body.innerHTML = `<p class="ai-check__line">Choose what you want to accomplish. Your Work Pack appears here as you answer.</p>`;
        setStep(1);
        announce("Cleared.", 0);
        form.querySelector(`input[name="${P}-outcome"]`)?.focus();
    });

    const copy = async (text, label, source) => {
        try {
            await navigator.clipboard.writeText(text);
            announce(`${label} copied.`, 0);
        } catch {
            if (source) {
                const range = document.createRange();
                range.selectNodeContents(source);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                source.focus();
            }
            announce("Copying was refused by the browser. The text is selected: press Ctrl+C or Cmd+C.", 0);
        }
    };

    body.addEventListener("click", (event) => {

        const button = event.target.closest("button");
        if (!button || !state.pack) return;

        if (button.dataset.copy) {
            const source = document.getElementById(button.dataset.copy);
            copy(source.textContent, document.getElementById(`${button.dataset.copy}-title`)?.textContent ?? "Prompt", source);
        } else if (button.id === `${P}-copy-all`) {
            copy(state.pack.markdown, "Work Pack", null);
        } else if (button.id === `${P}-download`) {
            const blob = new Blob([state.pack.markdown], { type: "text/markdown;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ai-work-pack-${state.taskId}.md`;
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            announce(`Downloaded ai-work-pack-${state.taskId}.md.`, 0);
        }

    });

    addJumpToResult(app ?? document.body, "Jump to the Work Pack");

    form.dataset.ready = "true";

}
