/* =========================================================
   ToolZen Hub
   AI Workbench: the Work Pack view (Tool Pack 58)

   The pack as HTML: state line, overview, AI product, preparation,
   master prompt with its adjustments, stages, refinements,
   checklist and next steps. Loaded with the first task, so the
   page's first load carries only the selection steps (D17).
========================================================= */

import { ROUTES } from "../../routes.js";
import { escapeHTML } from "../../ui/escape.js";
import { NOT_VERIFIED } from "./compiler.js";

const P = "wb";
const DEPTH_NAMES = { short: "Short", standard: "Standard", detailed: "Detailed", multi: "Multi-stage" };
const routeOf = (id) => ROUTES.tool("tools", id);

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

const words = (text) => (String(text).match(/\S+/g) ?? []).length;

export function packHTML(pack, offered, viewChoice = "all", brief = true, guide = null) {

    /* the visitor's preferred version leads (D21); the other one is in the adjustments below it */
    const short = Boolean(pack.concisePrompt) && guide?.promptVersion?.("wb") === "concise";

    const stateLine = pack.state === "empty"
        ? `<p class="ai-check__line">Answer the questions. The pack is written as you type.</p>`
        : pack.state === "incomplete"
            ? `<p class="ai-check__line"><strong>Almost ready.</strong> Missing: ${escapeHTML(pack.missing.join(", "))}. They are marked [add: …] in the prompts; fill them in here or tell the AI when it asks.</p>`
            : `<p class="ai-check__line"><strong>Ready.</strong> ${escapeHTML(DEPTH_NAMES[pack.depth])} pack${pack.stages.length ? `, ${pack.stages.length} stage${pack.stages.length === 1 ? "" : "s"}` : ", one prompt"}.</p>`;

    const conflicts = pack.conflicts.length ? `
                <div class="${P}-alert" role="note"><strong>Check this first:</strong>${list(pack.conflicts)}</div>` : "";

    const stagesNav = pack.stages.length > 1 ? `
                    <ol class="${P}-stage-nav" aria-label="Stages">${pack.stages.map((s) => `<li><a href="#${P}-stage-${s.n}">${escapeHTML(s.name)}</a></li>`).join("")}</ol>` : "";

    /* a multi-stage pack opens its first stage and folds the rest, each named with its "done when" (17 §5.3) */
    const fold = pack.depth === "multi" && pack.stages.length > 1;

    const stageBody = (s) => `
                        <dl class="${P}-stage__facts ${P}-info">
                            <div><dt>Objective</dt><dd>${escapeHTML(s.objective)}</dd></div>
                            <div><dt>Submit</dt><dd>${escapeHTML(s.submit)}</dd></div>
                            <div><dt>Expect</dt><dd>${escapeHTML(s.expect)}</dd></div>
                            <div><dt>Done when</dt><dd>${escapeHTML(s.done)}</dd></div>
                        </dl>
                        ${promptBlock(`${P}-stage-${s.n}-prompt`, `Stage ${s.n} prompt`, s.prompt)}
                        <p class="ai-note ${P}-info">${escapeHTML(s.next)}</p>`;

    const stages = pack.stages.map((s) => fold ? `
                    <details class="${P}-stage ${P}-stage--fold" id="${P}-stage-${s.n}"${s.n === 1 ? " open" : ""}>
                        <summary class="${P}-stage__name"><span id="${P}-stage-${s.n}-name">${s.n}. ${escapeHTML(s.name)}</span> <span class="ai-note">Done when: ${escapeHTML(s.done)}</span></summary>${stageBody(s)}
                    </details>` : `
                    <article class="${P}-stage" id="${P}-stage-${s.n}" aria-labelledby="${P}-stage-${s.n}-name">
                        <h4 class="${P}-stage__name" id="${P}-stage-${s.n}-name">${s.n}. ${escapeHTML(s.name)}</h4>${stageBody(s)}
                    </article>`).join("");

    const view = `
                <fieldset class="${P}-view">
                    <legend class="calculator-form__label">Show</legend>
                    <label><input type="radio" name="${P}-view" value="all"${viewChoice === "all" ? " checked" : ""}> Everything</label>
                    <label><input type="radio" name="${P}-view" value="prompts"${viewChoice === "prompts" ? " checked" : ""}> Prompts only</label>
                </fieldset>`;

    const notes = pack.notes?.length ? `<p class="ai-note">${escapeHTML(pack.notes.join(" "))}</p>` : "";

    return `
                ${stateLine}${conflicts}${view}

                <section class="${P}-part ${P}-info" aria-labelledby="${P}-h-overview">
                    <h3 id="${P}-h-overview">Overview</h3>
                    <dl class="${P}-stage__facts">
                        <div><dt>Task</dt><dd>${escapeHTML(pack.overview.task)}</dd></div>
                        <div><dt>Deliverable</dt><dd>${escapeHTML(pack.overview.deliverable)}</dd></div>
                        <div><dt>Success</dt><dd>${escapeHTML(pack.overview.success.join(" "))}</dd></div>
                    </dl>
                </section>

                <section class="${P}-part ${P}-info" aria-labelledby="${P}-h-product">
                    <h3 id="${P}-h-product">AI product</h3>
                    ${productHTML(pack, offered)}
                </section>

                <section class="${P}-part ${P}-info" aria-labelledby="${P}-h-prepare">
                    <h3 id="${P}-h-prepare">Prepare</h3>
                    ${pack.preparation.required.length ? `<p class="${P}-sub">Have ready</p>${list(pack.preparation.required)}` : ""}
                    ${pack.preparation.optional.length ? `<p class="${P}-sub">Helpful</p>${list(pack.preparation.optional)}` : ""}
                    ${pack.missing.length ? `<p class="${P}-sub">Still missing from your answers</p>${list(pack.missing)}` : ""}
                </section>

                <section class="${P}-part" aria-labelledby="${P}-h-master">
                    <h3 id="${P}-h-master">${short ? "Concise prompt" : "Master prompt"} <span class="ai-note">${short ? words(pack.concisePrompt) : pack.promptWords} words</span></h3>
                    <p class="ai-note">${pack.stages.length ? "Paste it as the first message of a new conversation, then use the stage prompts in the same conversation." : "Paste it into the AI product."}</p>${notes}${pack.strategy ? `
                    <p class="ai-note ${P}-strategy">Approach: ${escapeHTML([pack.strategy.approach, pack.strategy.emphasis, pack.strategy.audience].filter(Boolean).join(" · "))} <span class="${P}-strategy__id">(${escapeHTML(pack.strategy.id)})</span></p>` : ""}
                    ${promptBlock(`${P}-master`, short ? "Concise prompt" : "Master prompt", short ? pack.concisePrompt : pack.masterPrompt)}
                    ${guide?.adjustHTML(P, pack) ?? ""}
                </section>
                ${pack.stages.length ? `
                <section class="${P}-part" aria-labelledby="${P}-h-stages">
                    <h3 id="${P}-h-stages">Stages</h3>${fold ? `
                    <button type="button" id="${P}-expand" class="calculator-form__button calculator-form__button--secondary">Expand all stages</button>` : ""}${stagesNav}${stages}
                </section>` : ""}
                ${pack.refinements.length ? `
                <section class="${P}-part" aria-labelledby="${P}-h-refine">
                    <h3 id="${P}-h-refine">Refinement prompts</h3>
                    <p class="ai-note">Use one when an answer falls short in that way, in the same conversation.</p>
                    ${pack.refinements.map((r) => promptBlock(`${P}-refine-${r.id}`, r.title, r.prompt)).join("")}
                </section>` : ""}

                <section class="${P}-part ${P}-info" aria-labelledby="${P}-h-quality">
                    <h3 id="${P}-h-quality">Quality checklist</h3>
                    <ul class="${P}-checklist">${pack.quality.map((q, i) => `<li><label><input type="checkbox" id="${P}-q-${i}"> <span>${escapeHTML(q)}</span></label></li>`).join("")}</ul>
                    <p class="ai-note">Ticks are for this visit only; nothing is saved.</p>
                </section>
                ${pack.nextSteps.length ? `
                <section class="${P}-part ${P}-info" aria-labelledby="${P}-h-next">
                    <h3 id="${P}-h-next">Next steps</h3>
                    ${list(pack.nextSteps)}
                </section>` : ""}

                <div class="calculator-form__actions ai-actions">
                    <button type="button" id="${P}-copy-all" class="calculator-form__button">Copy the whole pack</button>
                    <button type="button" id="${P}-download" class="calculator-form__button calculator-form__button--secondary">Download .md</button>
                </div>

                <section class="${P}-part ${P}-next-tools" aria-labelledby="${P}-h-check">
                    <h3 id="${P}-h-check">Check the answer you get</h3>
                    <p class="ai-note">When the AI has answered, the AI Output Reviewer checks the answer against this request: what it does not visibly address, format problems, leftovers and statements to verify.</p>
                    <p><a id="${P}-to-review" class="calculator-form__button calculator-form__button--secondary" href="${escapeHTML(routeOf("ai-answer-checklist"))}">Open the AI Output Reviewer with this request</a></p>${brief ? `
                    <p class="ai-note">Working on a longer project? Carry it to another chat or AI product with a context pack.</p>
                    <p><a id="${P}-to-bridge" class="calculator-form__button calculator-form__button--secondary" href="${escapeHTML(routeOf("context-pack-builder"))}">Start a context pack from this task</a></p>` : ""}
                </section>`;

}
