/* =========================================================
   ToolZen Hub
   Practice Labs: rendering lesson blocks (build time)

   Paths whose lessons are not SQL lessons (testing first) describe their teaching as an ordered list of typed blocks. This
   module turns them into HTML; everything is escaped here and every block is readable without script. Interactive blocks
   (quiz, order, write) carry hidden controls that their browser modules switch on.

     text      { heading?, paragraphs[] }
     list      { heading?, items[], ordered? }
     example   { title, text }                          a fixed-width sample: data, a requirement, a report
     callout   { kind: note|tip|warning, text }
     quiz      { heading?, questions[] }                questions as in quizBlock (learn-html.js)
     order     { heading?, prompt, items[], explain }   items in the right order; shown shuffled, checked in the browser
     write     { heading?, exercise }                   a structured writing lab (writing.js), checked in the browser
     shoplite  { text, release? }                       a task on the practice shop, opened in a new tab
========================================================= */

import { escapeHTML as esc } from "../ui/escape.js";
import { SITE_ROOT } from "../routes.js";
import { AREAS, BUGS, RELEASES } from "./shoplite/bugs.js";

const SHOPLITE = () => `${SITE_ROOT}practice-labs/shoplite/`;

/* a fixed, readable shuffle: never the answer order (rotate by half, then reverse if it still matches) */
function scramble(items) {
    const n = items.length;
    const rotated = items.map((_, i) => items[(i + Math.ceil(n / 2)) % n]);
    return rotated.every((item, i) => item === items[i]) ? rotated.slice().reverse() : rotated;
}

export function renderBlocks(blocks, { quizBlock, writing, idPrefix }) {

    let quizCount = 0;

    return blocks.map((block, index) => {

        const heading = block.heading ? `<h2 id="${esc(idPrefix)}-b${index}">${esc(block.heading)}</h2>` : "";
        const labelled = block.heading ? ` aria-labelledby="${esc(idPrefix)}-b${index}"` : "";

        switch (block.type) {

        case "text":
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    ${block.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
                </section>`;

        case "list": {
            const tag = block.ordered ? "ol" : "ul";
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <${tag}>${block.items.map((item) => `<li>${esc(item)}</li>`).join("")}</${tag}>
                </section>`;
        }

        case "example":
            return `
                <section class="learn-section">
                    <div class="learn-example">
                        <h3>${esc(block.title)}</h3>
                        <pre class="lx-code learn-sample" tabindex="0" role="region" aria-label="${esc(block.title)}"><code>${esc(block.text)}</code></pre>
                    </div>
                </section>`;

        case "callout":
            return `
                <section class="learn-section learn-analogy">
                    <p><strong>${esc({ note: "Note", tip: "Tip", warning: "Watch out" }[block.kind] ?? "Note")}:</strong> ${esc(block.text)}</p>
                </section>`;

        case "quiz":
            quizCount += 1;
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    ${quizBlock(block.questions, `${idPrefix}-q${quizCount}`)}
                </section>`;

        case "order": {
            const shown = scramble(block.items);
            const name = `${idPrefix}-o${index}`;
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-order" data-order='${esc(JSON.stringify(shown.map((item) => block.items.indexOf(item))))}'>
                        <p>${esc(block.prompt)}</p>
                        <ol class="learn-order__items">
                            ${shown.map((item, i) => `
                            <li class="learn-order__item">
                                <span>${esc(item)}</span>
                                <label class="learn-order__pos">Position
                                    <select class="lx-select" name="${esc(name)}-${i}" hidden>
                                        <option value="">-</option>
                                        ${block.items.map((_, k) => `<option value="${k}">${k + 1}</option>`).join("")}
                                    </select>
                                </label>
                            </li>`).join("")}
                        </ol>
                        <p class="learn-quiz__actions"><button type="button" class="calculator-form__button lx-btn" data-order-check hidden>Check the order</button></p>
                        <p class="learn-quiz__result" role="status" aria-live="polite"></p>
                        <details class="learn-reveal">
                            <summary>Show the right order and why</summary>
                            <ol>${block.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>
                            <p>${esc(block.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "write": {
            const exercise = writing.get(block.exercise);
            if (!exercise) throw new Error(`unknown writing exercise ${block.exercise}`);
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-writing="${esc(exercise.id)}">
                        <p class="learn-write__scenario"><strong>Scenario.</strong> ${esc(exercise.scenario)}</p>
                        <p>${esc(exercise.task)}</p>
                        <div class="learn-write__fields" hidden>
                            ${exercise.fields.map((field) => `
                            <label class="lx-label" for="${esc(exercise.id)}-${esc(field.name)}">${esc(field.label)}</label>
                            ${field.lines > 1
                                ? `<textarea id="${esc(exercise.id)}-${esc(field.name)}" class="lx-textarea learn-editor learn-editor--text" rows="${field.lines}" data-field="${esc(field.name)}" maxlength="3000"></textarea>`
                                : `<input id="${esc(exercise.id)}-${esc(field.name)}" class="lx-input learn-write__input" data-field="${esc(field.name)}" maxlength="200">`}`).join("")}
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-write-check>Check my answer</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-write-export>Copy as text</button>
                            </div>
                            <div class="learn-feedback" data-write-out role="status" aria-live="polite"></div>
                        </div>
                        <p class="lx-note">The check looks at structure and coverage (fields filled, one action per step, concrete data, observable results, the facts of the scenario), not at judgement. Nothing you write is stored or sent.</p>
                        <details class="learn-reveal" data-write-model>
                            <summary>Show a model answer</summary>
                            ${exercise.fields.map((field) => `<p><strong>${esc(field.label)}:</strong></p><pre class="lx-code learn-sample" tabindex="0"><code>${esc(exercise.model[field.name])}</code></pre>`).join("")}
                            <p>${esc(exercise.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "shoplite": {
            const url = `${SHOPLITE()}${block.release ? `?release=${encodeURIComponent(block.release)}` : ""}`;
            return `
                <section class="learn-section learn-analogy">
                    <p><strong>Try it on ShopLite:</strong> ${esc(block.text)} <a href="${esc(url)}" target="_blank" rel="noopener">Open ShopLite${block.release ? " release 1.1" : ""} in a new tab</a> (<a href="${esc(SHOPLITE())}" target="_blank" rel="noopener">stable release</a>).</p>
                </section>`;
        }

        case "labset":
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-labset" data-labset="${esc(block.lab)}" data-ids="${esc(block.ids.join(","))}">
                        <p>${esc(block.text)}</p>
                        <p class="lx-note" data-labset-loading>The exercises load here. They need JavaScript; the <a href="${esc(`${SITE_ROOT}tools/${block.labTool}/`)}">full lab</a> lists them too.</p>
                        <div class="lx-app"></div>
                        <p class="lx-sr-only" aria-live="polite"></p>
                    </div>
                </section>`;

        case "locator": {
            const url = `${SHOPLITE()}${block.screen ?? "#/"}`;
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-hunt learn-locator" data-locator>
                        <p>${esc(block.text)}</p>
                        <div class="learn-hunt__grid">
                            <iframe class="learn-hunt__app" src="${esc(url)}" title="ShopLite, for locator practice" loading="lazy"></iframe>
                            <div class="learn-hunt__panel">
                                ${block.tasks.map((task, i) => `
                                <div class="learn-locator__task" data-locator-task data-target="${esc(task.target)}" data-screen="${esc(task.screen ?? block.screen ?? "#/")}">
                                    <p><strong>Task ${i + 1}.</strong> ${esc(task.prompt)}</p>
                                    <div data-locator-tools hidden>
                                        <label class="lx-label" for="${esc(idPrefix)}-loc-${i}">Your locator</label>
                                        <input id="${esc(idPrefix)}-loc-${i}" class="lx-input learn-write__input learn-code-input" spellcheck="false" autocomplete="off" autocapitalize="off" value="page.">
                                        <div class="learn-actions"><button type="button" class="calculator-form__button lx-btn" data-locator-check>Find it</button></div>
                                        <p class="learn-feedback" data-locator-out role="status" aria-live="polite"></p>
                                    </div>
                                    <details class="learn-reveal"><summary>Hint and a model answer</summary><p>${esc(task.hint)}</p><pre class="lx-code"><code>${esc(task.model)}</code></pre></details>
                                </div>`).join("")}
                            </div>
                        </div>
                        <p class="lx-note">This practice uses a teaching evaluator of a subset of Playwright's locator rules, run on ShopLite in your browser. It is not Playwright itself; run the same locators in a real Playwright project to confirm.</p>
                    </div>
                </section>`;
        }

        case "bughunt": {
            const release = block.release ?? "r-bugs-1";
            const bugs = BUGS.filter((b) => b.release === release);
            const url = `${SHOPLITE()}?release=${encodeURIComponent(release)}`;
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-hunt" data-bughunt="${esc(release)}">
                        <p>${esc(block.text)} <a href="${esc(url)}" target="_blank" rel="noopener">Open ${esc(RELEASES[release].title)} in a new tab</a> if you prefer a full screen; the <a href="${esc(SHOPLITE())}#/requirements" target="_blank" rel="noopener">requirements</a> say what is correct.</p>
                        <div class="learn-hunt__grid">
                            <iframe class="learn-hunt__app" src="${esc(url)}" title="ShopLite ${esc(RELEASES[release].title)}" loading="lazy"></iframe>
                            <div class="learn-hunt__panel">
                                <p class="learn-hunt__count" data-hunt-count>Found 0 of ${bugs.length}</p>
                                <form class="learn-hunt__form" hidden>
                                    <label class="lx-label" for="hunt-area">Area</label>
                                    <select id="hunt-area" name="area" class="lx-select"><option value="">Choose an area</option>${AREAS.map((a) => `<option>${esc(a)}</option>`).join("")}</select>
                                    <label class="lx-label" for="hunt-title">Title</label>
                                    <input id="hunt-title" name="title" class="lx-input learn-write__input" maxlength="200">
                                    <label class="lx-label" for="hunt-steps">Steps to reproduce</label>
                                    <textarea id="hunt-steps" name="steps" class="lx-textarea learn-editor learn-editor--text" rows="4" maxlength="2000"></textarea>
                                    <label class="lx-label" for="hunt-expected">Expected result</label>
                                    <textarea id="hunt-expected" name="expected" class="lx-textarea learn-editor learn-editor--text" rows="2" maxlength="1000"></textarea>
                                    <label class="lx-label" for="hunt-actual">Actual result</label>
                                    <textarea id="hunt-actual" name="actual" class="lx-textarea learn-editor learn-editor--text" rows="2" maxlength="1000"></textarea>
                                    <label class="lx-label" for="hunt-severity">Severity</label>
                                    <select id="hunt-severity" name="severity" class="lx-select"><option>critical</option><option selected>major</option><option>minor</option><option>trivial</option></select>
                                    <div class="learn-actions"><button type="submit" class="calculator-form__button lx-btn">Submit finding</button></div>
                                </form>
                                <p class="learn-feedback" data-hunt-out role="status" aria-live="polite"></p>
                                <p class="lx-note" data-hunt-hints aria-live="polite"></p>
                                <h3>Your findings</h3>
                                <ol data-hunt-found></ol>
                            </div>
                        </div>
                        <p class="lx-note">Findings are recognised by the area and the key words of what went wrong, so the simulator checks what you found, not how well you wrote it. Nothing is stored or sent; reloading the page starts the hunt again.</p>
                        <details class="learn-reveal">
                            <summary>Give up and show every seeded bug</summary>
                            <ol>${bugs.map((b) => `<li><strong>${esc(b.title)}</strong> (${esc(b.area)}, ${esc(b.requirement)}, ${esc(b.severity)}). Steps: ${esc(b.steps.join(" "))} Expected: ${esc(b.expected)} Actual: ${esc(b.actual)}</li>`).join("")}</ol>
                        </details>
                    </div>
                </section>`;
        }


        default:
            throw new Error(`unknown block type ${block.type}`);

        }

    }).join("");

}
