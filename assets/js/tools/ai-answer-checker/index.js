/* =========================================================
   ToolZen Hub
   AI Answer Checker (AI Tools; decision D22, 2026-11-18)

   One product with two modes: Review one answer (review.js, the
   former AI Output Reviewer) and Compare two answers (compare.js,
   the former Compare Two AI Answers). Each mode is the shared
   brief page's form and result (brief-tool.js), drawn side by side
   in the page and shown one at a time; switching keeps what was
   typed in both. ?mode=compare opens the second. Word patterns in
   the browser: it never judges whether an answer is true, nothing
   is sent to any AI service and nothing is stored.
========================================================= */

import { getToolById } from "../../data/tools.js";
import { ROUTES } from "../../routes.js";
import { escapeHTML } from "../../ui/escape.js";
import { addJumpToResult } from "../../ui/jump-link.js";
import { tool as reviewTool } from "./review.js";
import { tool as compareTool } from "./compare.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const P = "chk";

const MODES = [
    { id: "review", label: "Review one answer", text: "Check one AI answer against what you asked: missing requirements, format problems, contradictions and statements to verify.", tool: reviewTool },
    { id: "compare", label: "Compare two answers", text: "Two answers to the same question, from two AI platforms or two attempts: where they agree, disagree, and what only one says.", tool: compareTool }
];


export function markup() {

    return `
        <div class="calculator-page">

            <section class="calculator-intro">
                <div>
                    <span class="calculator-eyebrow">AI Tool</span>
                    <h1>${escapeHTML(getToolById("ai-answer-checker").title)}</h1>
                    <p>Review AI responses, identify missing information and compare answers from different AI platforms. Paste an answer and what you asked, or two answers to the same question. The checks are word patterns: they show where to look and what to ask, and never decide whether an answer is true.</p>
                </div>
                <div class="calculator-trust-card">
                    <div class="calculator-trust-icon">✓</div>
                    <div>
                        <strong>Checked in your browser</strong>
                        <span>No AI service is called • Nothing is stored</span>
                    </div>
                </div>
            </section>

            <fieldset class="${P}-modes" id="${P}-modes">
                <legend class="calculator-section__title">What do you want to check?</legend>
                <div class="${P}-modes__list">${MODES.map((m, i) => `
                    <label class="${P}-mode">
                        <input type="radio" name="${P}-mode" value="${m.id}"${i === 0 ? " checked" : ""} aria-describedby="${P}-mode-${m.id}-text">
                        <span class="${P}-mode__title">${escapeHTML(m.label)}</span>
                        <span class="${P}-mode__text" id="${P}-mode-${m.id}-text">${escapeHTML(m.text)}</span>
                    </label>`).join("")}
                </div>
            </fieldset>
${MODES.map((m, i) => `
            <div class="${P}-panel" id="${P}-panel-${m.id}" data-mode="${m.id}"${i === 0 ? "" : " hidden"}>
${m.tool.body()}
            </div>`).join("")}

            <p class="ai-note ${P}-next">Need a better prompt first? <a href="${escapeHTML(ROUTES.tool("tools", "prompt-builder"))}">Build one with the AI Prompt Builder</a>. Looking for another AI product to ask? <a href="${escapeHTML(ROUTES.aiDirectory)}">See the AI Directory</a>.</p>
${MODES.map((m, i) => `
            <div class="${P}-info" data-mode="${m.id}"${i === 0 ? "" : " hidden"}>
${m.tool.info()}
            </div>`).join("")}

        </div>`;

}


export function render(mount = document.querySelector("#app")) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();
    init(mount);

}


export function init() {

    const modes = document.getElementById(`${P}-modes`);
    if (!modes) return;

    for (const m of MODES) m.tool.init();

    function show(id, { focus = false } = {}) {
        for (const el of document.querySelectorAll(`.${P}-panel, .${P}-info`)) el.hidden = el.dataset.mode !== id;
        const radio = modes.querySelector(`input[value="${id}"]`);
        if (radio && !radio.checked) radio.checked = true;
        if (focus) document.querySelector(`#${P}-panel-${id} textarea`)?.focus();
    }

    modes.addEventListener("change", (event) => {
        if (event.target.name === `${P}-mode`) show(event.target.value);
    });

    /* ?mode=compare opens the second mode; a request handed over from the Prompt Builder keeps the first (review.js) */
    const asked = new URLSearchParams(location.search).get("mode");
    if (asked === "compare") show("compare");

    /* one link per mode, inside its panel, so the shown mode's link goes to the shown result */
    for (const m of MODES) addJumpToResult(document.getElementById(`${P}-panel-${m.id}`), m.id === "review" ? "Jump to the review" : "Jump to the comparison");

}
