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
     aiviz     { heading?, kind, text }                 an AI teaching visualizer (learn-aiviz.js): tokens|context|sampling|retrieval|confusion
     numeric   { heading?, dataset, exercises[] }       a data table and calculations checked in the browser (data/stats.js)
     jsrun     { heading?, exercise }                   JavaScript run against tests in a Web Worker (learn-jsrun.js)
     apitask   { heading?, task }                       an HTTP request answered by the in-page mock API (learn-api.js)
     webplay   { heading?, exercise }                   HTML and CSS rendered in a script-free sandboxed iframe and checked (learn-webplay.js)
     gitsim    { heading?, task }                       git commands on a modelled repository (learn-gitsim.js)
     pyrun     { heading?, exercise }                   Python run in Pyodide, loaded only on request (learn-pyrun.js)
     predict   { heading?, exercise }                   predict the exact output of code (learn-predict.js)
     shoplite  { text, release? }                       a task on the practice shop, opened in a new tab
========================================================= */

import { escapeHTML as esc } from "../ui/escape.js";
import { SITE_ROOT } from "../routes.js";
import { AREAS, BUGS, RELEASES } from "./shoplite/bugs.js";
import { CODE } from "./playwright/code.js";
import { JS_EXERCISES } from "./programming/js-exercises.js";
import { API_TASKS, API_HOST } from "./web/mock-api.js";
import { WEB_EXERCISES } from "./web/web-exercises.js";
import { GIT_TASKS } from "./devops/git-tasks.js";
import { PY_EXERCISES } from "./programming/py-exercises.js";
import { PREDICT } from "./programming/predict.js";
import { DATASETS, NUMERIC, formatAnswer } from "./data/stats.js";

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

        case "codecheck": {
            const exercise = CODE.find((c) => c.id === block.exercise);
            if (!exercise) throw new Error(`unknown code exercise ${block.exercise}`);
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-codecheck="${esc(exercise.id)}">
                        <p>${esc(exercise.task)}</p>
                        <div data-code-tools hidden>
                            <label class="lx-label" for="${esc(exercise.id)}-code">Your test code</label>
                            <textarea id="${esc(exercise.id)}-code" class="lx-textarea learn-editor" rows="10" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="4000">${esc(exercise.starter)}</textarea>
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-code-check>Check my code</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-code-reset>Start again</button>
                            </div>
                            <div class="learn-feedback" data-code-out role="status" aria-live="polite"></div>
                        </div>
                        <p class="lx-note">Simulated check: your code is read against the rules listed in the result, not run. Run it in a real Playwright project to see it execute.</p>
                        <details class="learn-reveal">
                            <summary>Show a model answer and why</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(exercise.model)}</code></pre>
                            <p>${esc(exercise.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "aiviz":
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write learn-aiviz" data-aiviz="${esc(block.kind)}">
                        <p>${esc(block.text)}</p>
                        <div data-aiviz-root><p class="lx-note">This interactive view needs JavaScript.</p></div>
                        <p class="lx-note">Teaching model: it shows the idea with fixed, hand-made data and real formulas. It is not a real AI model and nothing is downloaded or sent.</p>
                    </div>
                </section>`;

        case "numeric": {
            const data = DATASETS[block.dataset];
            if (!data) throw new Error(`unknown dataset ${block.dataset}`);
            const items = block.exercises.map((id) => {
                const exercise = NUMERIC.find((n) => n.id === id);
                if (!exercise) throw new Error(`unknown numeric exercise ${id}`);
                return exercise;
            });
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write">
                        <div class="lx-table-wrap" tabindex="0" role="region" aria-label="${esc(data.title)}">
                            <table class="lx-table">
                                <caption>${esc(data.title)}</caption>
                                <thead><tr>${data.columns.map((c) => `<th scope="col">${esc(data.labels[c])}</th>`).join("")}</tr></thead>
                                <tbody>${data.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(String(v))}</td>`).join("")}</tr>`).join("")}</tbody>
                            </table>
                        </div>
                        <ol class="learn-numeric">
                            ${items.map((exercise) => `
                            <li class="learn-numeric__item" data-numeric="${esc(exercise.id)}">
                                <p>${esc(exercise.task)}${exercise.decimals ? ` Give ${exercise.decimals} decimal place${exercise.decimals > 1 ? "s" : ""}.` : ""}</p>
                                <div data-num-tools hidden>
                                    <label class="lx-label" for="${esc(exercise.id)}-in">Your answer</label>
                                    <div class="learn-actions">
                                        <input id="${esc(exercise.id)}-in" class="lx-input learn-numeric__input" type="text" inputmode="decimal" autocomplete="off">
                                        <button type="button" class="calculator-form__button lx-btn" data-num-check>Check</button>
                                    </div>
                                    <p class="learn-feedback" data-num-out role="status" aria-live="polite"></p>
                                </div>
                                <details class="learn-reveal">
                                    <summary>Show the answer and how</summary>
                                    <p><strong>${esc(formatAnswer(exercise))}</strong>. ${esc(exercise.explain)}</p>
                                </details>
                            </li>`).join("")}
                        </ol>
                    </div>
                </section>`;
        }

        case "jsrun": {
            const exercise = JS_EXERCISES.find((c) => c.id === block.exercise);
            if (!exercise) throw new Error(`unknown JavaScript exercise ${block.exercise}`);
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-jsrun="${esc(exercise.id)}">
                        <p>${esc(exercise.task)}</p>
                        <div data-js-tools hidden>
                            <label class="lx-label" for="${esc(exercise.id)}-code">Your code</label>
                            <textarea id="${esc(exercise.id)}-code" class="lx-textarea learn-editor" rows="9" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="6000">${esc(exercise.starter)}</textarea>
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-js-run>Run the tests</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-js-reset>Start again</button>
                            </div>
                            <div class="learn-feedback" data-js-out role="status" aria-live="polite"></div>
                        </div>
                        <p class="lx-note">Your code runs in your browser, in an isolated worker with no network access, and is stopped after 2 seconds. It is not stored or sent. Tests: ${exercise.tests.length}.</p>
                        <details class="learn-reveal">
                            <summary>Show a model answer and why</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(exercise.model)}</code></pre>
                            <p>${esc(exercise.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "apitask": {
            const task = API_TASKS.find((t) => t.id === block.task);
            if (!task) throw new Error(`unknown API task ${block.task}`);
            const id = esc(task.id);
            const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => `<option${m === task.start.method ? " selected" : ""}>${m}</option>`).join("");
            const model = [`${task.model.method} ${task.model.target}`, task.model.headers, task.model.body ? `\n${task.model.body}` : ""].filter(Boolean).join("\n");
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-apitask="${id}">
                        <p>${esc(task.task)}</p>
                        <div data-api-tools hidden>
                            <div class="learn-api__line">
                                <div><label class="lx-label" for="${id}-m">Method</label><select id="${id}-m" class="lx-select" data-api-field="method">${methods}</select></div>
                                <div class="learn-api__target"><label class="lx-label" for="${id}-t">Path and query (host ${esc(API_HOST)})</label><input id="${id}-t" class="lx-input" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" value="${esc(task.start.target)}" data-api-field="target"></div>
                            </div>
                            <label class="lx-label" for="${id}-h">Headers (one per line, Name: value)</label>
                            <textarea id="${id}-h" class="lx-textarea learn-editor" rows="2" spellcheck="false" autocapitalize="off" data-api-field="headers">${esc(task.start.headers)}</textarea>
                            <label class="lx-label" for="${id}-b">Body</label>
                            <textarea id="${id}-b" class="lx-textarea learn-editor" rows="3" spellcheck="false" autocapitalize="off" data-api-field="body">${esc(task.start.body)}</textarea>
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-api-send>Send request</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-api-reset>Start again</button>
                            </div>
                            <div class="learn-feedback" data-api-out role="status" aria-live="polite"></div>
                        </div>
                        <p class="lx-note">Simulated API: a model of ShopLite's API answers inside this page. Nothing is sent over the network, and api.shoplite.example is a reserved example address.</p>
                        <details class="learn-reveal">
                            <summary>Show a request that works and why</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(model)}</code></pre>
                            <p>${esc(task.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "webplay": {
            const exercise = WEB_EXERCISES.find((c) => c.id === block.exercise);
            if (!exercise) throw new Error(`unknown web exercise ${block.exercise}`);
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-webplay="${esc(exercise.id)}">
                        <p>${esc(exercise.task)}</p>
                        <div data-web-tools hidden>
                            <label class="lx-label" for="${esc(exercise.id)}-code">Your HTML and CSS</label>
                            <textarea id="${esc(exercise.id)}-code" class="lx-textarea learn-editor" rows="9" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="8000">${esc(exercise.starter)}</textarea>
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-web-run>Show and check</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-web-reset>Start again</button>
                            </div>
                            <iframe class="learn-webplay__frame" title="Your page" sandbox="allow-same-origin" hidden></iframe>
                            <div class="learn-feedback" data-web-out role="status" aria-live="polite"></div>
                        </div>
                        <p class="lx-note">Your page is shown in a sandbox with scripts switched off, and checked by reading its elements and styles. Nothing is stored or sent.</p>
                        <details class="learn-reveal">
                            <summary>Show a model answer</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(exercise.model)}</code></pre>
                        </details>
                    </div>
                </section>`;
        }

        case "gitsim": {
            const task = GIT_TASKS.find((t) => t.id === block.task);
            if (!task) throw new Error(`unknown Git task ${block.task}`);
            const id = esc(task.id);
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-gitsim="${id}">
                        <p>${esc(task.task)}</p>
                        <div data-git-tools hidden>
                            <p class="learn-feedback" data-git-goal role="status" aria-live="polite"></p>
                            <div data-git-state></div>
                            <pre class="lx-code learn-gitsim__term" data-git-term tabindex="0" aria-label="Terminal output"></pre>
                            <label class="lx-label" for="${id}-cmd">Command</label>
                            <div class="learn-actions">
                                <input id="${id}-cmd" class="lx-input learn-gitsim__input" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="git status">
                                <button type="button" class="calculator-form__button lx-btn" data-git-run>Run</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-git-reset>Start again</button>
                            </div>
                        </div>
                        <p class="lx-note">Simulated Git: a model of a repository in this page that follows Git for the commands it supports (status, add, commit, restore, branch, switch, checkout, merge, log). Nothing touches your computer.</p>
                        <details class="learn-reveal">
                            <summary>Show commands that work and why</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(task.model.join("\n"))}</code></pre>
                            <p>${esc(task.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "pyrun": {
            const exercise = PY_EXERCISES.find((c) => c.id === block.exercise);
            if (!exercise) throw new Error(`unknown Python exercise ${block.exercise}`);
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-pyrun="${esc(exercise.id)}">
                        <p>${esc(exercise.task)}</p>
                        <div data-py-tools hidden>
                            <p class="learn-feedback" data-py-status role="status" aria-live="polite">Python is not loaded yet. Nothing is downloaded until you ask.</p>
                            <div class="learn-actions"><button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-py-load>Load Python (about 13 MB, once)</button></div>
                            <label class="lx-label" for="${esc(exercise.id)}-code">Your code</label>
                            <textarea id="${esc(exercise.id)}-code" class="lx-textarea learn-editor" rows="9" spellcheck="false" autocapitalize="off" autocomplete="off" maxlength="6000">${esc(exercise.starter)}</textarea>
                            <div class="learn-actions">
                                <button type="button" class="calculator-form__button lx-btn" data-py-run>Run the tests</button>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lx-btn" data-py-reset>Start again</button>
                            </div>
                            <div class="learn-feedback" data-py-out role="status" aria-live="polite"></div>
                        </div>
                        <p class="lx-note">Real Python (Pyodide, CPython compiled to WebAssembly) runs in your browser, in a worker without network access, and is stopped after 10 seconds. Your code is not stored or sent. Tests: ${exercise.tests.length}.</p>
                        <details class="learn-reveal">
                            <summary>Show a model answer and why</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(exercise.model)}</code></pre>
                            <p>${esc(exercise.explain)}</p>
                        </details>
                    </div>
                </section>`;
        }

        case "predict": {
            const exercise = PREDICT.find((c) => c.id === block.exercise);
            if (!exercise) throw new Error(`unknown prediction exercise ${block.exercise}`);
            const lang = exercise.lang === "java" ? "Java" : "Python";
            return `
                <section class="learn-section"${labelled}>
                    ${heading}
                    <div class="learn-write" data-predict="${esc(exercise.id)}">
                        <p>What does this ${lang} program print? Type the output exactly, one line per line.</p>
                        <pre class="lx-code" tabindex="0"><code>${esc(exercise.code)}</code></pre>
                        <div data-pred-tools hidden>
                            <label class="lx-label" for="${esc(exercise.id)}-out">Predicted output</label>
                            <textarea id="${esc(exercise.id)}-out" class="lx-textarea learn-editor" rows="${Math.min(8, exercise.output.split("\n").length + 1)}" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea>
                            <div class="learn-actions"><button type="button" class="calculator-form__button lx-btn" data-pred-check>Check</button></div>
                            <p class="learn-feedback" data-pred-out role="status" aria-live="polite"></p>
                        </div>
                        <p class="lx-note">${exercise.lang === "java" ? "Not executed in your browser: the expected output was recorded by compiling and running this code with Java 17." : "Not executed here: the expected output was recorded with CPython; Python exercises elsewhere on this path run real Python."}</p>
                        <details class="learn-reveal">
                            <summary>Show the output and why</summary>
                            <pre class="lx-code" tabindex="0"><code>${esc(exercise.output)}</code></pre>
                            <p>${esc(exercise.explain)}</p>
                        </details>
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
