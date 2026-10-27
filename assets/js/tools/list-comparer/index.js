/* =========================================================
   ToolZen Hub
   List Comparer (Developer Tools)

   Compare two lists, one item per line: what is only in A, what is
   only in B, what is in both, and what is repeated. The rules are in
   list-engine.js; this file is the page around them.

   Behaviour that matters:
   - Everything is shown with textContent only. Nothing is uploaded,
     stored, or put in the address of the page.
   - Small lists are compared as you type; a large pair waits for the
     button. The clipboard is never read.
   - The options (case, white space, empty lines) are visible, and the
     result says what they did.
========================================================= */

import {
    compareLists,
    summaryText,
    noteLines,
    groupText,
    resultText,
    EXAMPLE_A,
    EXAMPLE_B,
    MAX_LINES,
    MAX_CHARS,
    AUTO_LINES,
    MAX_ROWS_SHOWN
} from "./list-engine.js";

import {
    getToolById
} from "../../data/tools.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const TITLE =
    getToolById("list-comparer").title;

const DIFF_TOOL =
    getToolById("text-diff");

const GROUPS = [
    { key: "onlyA", title: "Only in A" },
    { key: "both", title: "In both" },
    { key: "onlyB", title: "Only in B" }
];

const fmt = (n) => n.toLocaleString("en-US");


export function markup() {

    const box = (side, label) => `
                        <div class="lc-field">
                            <div class="lc-field__head">
                                <label for="lc-${side}" class="lc-label">${label}</label>
                                <span id="lc-${side}-meta" class="lc-meta">0 lines</span>
                            </div>
                            <textarea
                                id="lc-${side}"
                                class="lc-input"
                                rows="8"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="lc-${side}-meta"
                            ></textarea>
                        </div>`;

    const group = ({ key, title }) => `
                        <section class="lc-group" id="lc-group-${key}" aria-labelledby="lc-title-${key}">
                            <div class="lc-group__head">
                                <h3 class="lc-group__title" id="lc-title-${key}">${title}</h3>
                                <button type="button" class="calculator-form__button calculator-form__button--secondary lc-button lc-button--small" id="lc-copy-${key}" aria-label="Copy ${title}">Copy</button>
                            </div>
                            <ul class="lc-list" id="lc-list-${key}"></ul>
                            <button type="button" class="calculator-form__button calculator-form__button--secondary lc-button lc-button--small" id="lc-more-${key}" hidden></button>
                        </section>`;

    return `
        <div class="calculator-page">

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Developer Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Paste two lists, one item per line, and see what is only
                        in the first, only in the second, in both, and what is
                        repeated. Case and spacing rules are yours to choose.
                    </p>

                </div>

                <div class="calculator-trust-card">

                    <div class="calculator-trust-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            100% Free to Use
                        </strong>

                        <span>
                            Compared in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <section class="calculator-section">

                <div id="lc-panel" class="lc-workspace" data-state="empty">

                    <div class="lc-boxes">
${box("a", "List A")}
${box("b", "List B")}
                    </div>

                    <p class="lc-linkline">
                        <button type="button" id="lc-example" class="lc-link">Load example</button>
                    </p>

                    <fieldset class="lc-options">

                        <legend class="lc-label">Options</legend>

                        <label class="lc-check">
                            <input type="checkbox" id="lc-case">
                            <span>Ignore case</span>
                        </label>

                        <label class="lc-check">
                            <input type="checkbox" id="lc-trim">
                            <span>Ignore spaces at the start and end of each line</span>
                        </label>

                        <label class="lc-check">
                            <input type="checkbox" id="lc-empty" checked>
                            <span>Skip empty lines</span>
                        </label>

                    </fieldset>

                    <div class="lc-actions">
                        <button type="button" id="lc-compare" class="calculator-form__button lc-button">Compare</button>
                        <button type="button" id="lc-swap" class="calculator-form__button calculator-form__button--secondary lc-button">Swap</button>
                        <button type="button" id="lc-copy-all" class="calculator-form__button calculator-form__button--secondary lc-button" disabled>Copy result</button>
                        <button type="button" id="lc-reset" class="calculator-form__button calculator-form__button--secondary lc-button">Reset</button>
                    </div>

                    <p id="lc-status" class="lc-status" data-state="empty">Paste two lists to compare them.</p>

                    <div id="lc-result" hidden>

                        <h2 class="lc-result-title">Comparison result</h2>

                        <ul id="lc-notes" class="lc-notes"></ul>

${GROUPS.map(group).join("")}

                        <section class="lc-group" id="lc-group-repA" aria-labelledby="lc-title-repA" hidden>
                            <h3 class="lc-group__title" id="lc-title-repA">Repeated in A</h3>
                            <ul class="lc-list" id="lc-list-repA"></ul>
                        </section>

                        <section class="lc-group" id="lc-group-repB" aria-labelledby="lc-title-repB" hidden>
                            <h3 class="lc-group__title" id="lc-title-repB">Repeated in B</h3>
                            <ul class="lc-list" id="lc-list-repB"></ul>
                        </section>

                    </div>

                </div>

            </section>

            <p id="lc-live" class="lc-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Paste one list into A and another into B, one item per line, or press Load example.</li>
                    <li>Choose the options. Nothing is ignored unless you tick it, except empty lines, which are skipped and counted.</li>
                    <li>Small lists are compared as you type; a large pair waits for the Compare button.</li>
                    <li>Read the three groups, then use the Copy button on any group, or Copy result for everything.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>How Items Are Matched</h2>
                <ul>
                    <li>An item is a line. Two items are the same when their lines are exactly equal, after the options you ticked.</li>
                    <li><strong>Ignore case</strong> lowercases both sides before comparing, one letter at a time. It does not fold special letters, so ß and SS stay different. Each item is shown as it was first written.</li>
                    <li><strong>Ignore spaces at the start and end</strong> trims each line. Spaces inside a line always count.</li>
                    <li>Lists are treated as sets: each item is listed once, in the order of its first appearance. A repeated item is listed once in its group and shown again under Repeated, with how often it occurs.</li>
                    <li>Nothing is sorted, and text is not normalized, so é typed as one character and as e plus an accent are different items.</li>
                    <li>To compare two texts line by line in order, use the <a href="${DIFF_TOOL.href}">${DIFF_TOOL.title}</a> instead.</li>
                </ul>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Are my lists sent anywhere?</summary>
                    <p>No. They are compared in your browser. Nothing is uploaded, stored or logged, and the address of this page does not change.</p>
                </details>
                <details>
                    <summary>Does the order of the lists matter?</summary>
                    <p>No for the result, yes for the display: items appear in the order they first appear in their own list. The groups Only in A and Only in B swap when you press Swap.</p>
                </details>
                <details>
                    <summary>Why did a line disappear?</summary>
                    <p>Empty lines are skipped by default, and the result says how many. Untick Skip empty lines to count an empty line as an item.</p>
                </details>
                <details>
                    <summary>What are the size limits?</summary>
                    <p>${fmt(MAX_LINES)} lines and ${fmt(MAX_CHARS)} characters per list. Lists above ${fmt(AUTO_LINES)} lines are compared when you press Compare. Each group shows its first ${fmt(MAX_ROWS_SHOWN)} items on screen, with a button for more; copying always uses every item.</p>
                </details>
            </section>

        </div>
    `;
}

export function render(
    mount = document.querySelector("#app")
) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();

    init();
}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const panel = document.querySelector("#lc-panel");

    if (!panel) {
        return;
    }

    const $ = (id) => document.querySelector(`#lc-${id}`);

    const boxA = $("a");
    const boxB = $("b");
    const optCase = $("case");
    const optTrim = $("trim");
    const optEmpty = $("empty");
    const status = $("status");
    const live = $("live");
    const copyAll = $("copy-all");

    let current = null;
    let shown = { onlyA: 0, both: 0, onlyB: 0 };
    let timer = null;
    let announceTimer = null;

    function announce(message) {
        clearTimeout(announceTimer);
        live.textContent = "";
        announceTimer = setTimeout(() => {
            live.textContent = message;
        }, 50);
    }

    async function copy(text, what) {

        let copied = false;

        try {
            await navigator.clipboard.writeText(text);
            copied = true;
        } catch (problem) {
            try {
                const holder = document.createElement("textarea");
                holder.className = "lc-sr-only";
                holder.value = text;
                holder.setAttribute("readonly", "");
                holder.setAttribute("aria-hidden", "true");
                document.body.append(holder);
                holder.select();
                copied = document.execCommand("copy");
                holder.remove();
            } catch (second) {
                copied = false;
            }
        }

        announce(
            copied
                ? `${what} copied to the clipboard.`
                : "Could not copy automatically. Select the text and copy it yourself."
        );
    }

    function setStatus(state, text) {
        panel.dataset.state = state;
        status.dataset.state = state;
        status.textContent = text;
    }

    function lineCount(text) {
        if (text === "") {
            return 0;
        }
        return text.split(/\r\n|\n|\r/).length - (/(\r\n|\n|\r)$/.test(text) ? 1 : 0);
    }

    function updateMeta() {
        $("a-meta").textContent = `${fmt(lineCount(boxA.value))} ${lineCount(boxA.value) === 1 ? "line" : "lines"}`;
        $("b-meta").textContent = `${fmt(lineCount(boxB.value))} ${lineCount(boxB.value) === 1 ? "line" : "lines"}`;
    }

    function clearResult() {
        current = null;
        $("result").hidden = true;
        copyAll.disabled = true;
        for (const key of ["onlyA", "both", "onlyB", "repA", "repB"]) {
            $(`list-${key}`).replaceChildren();
        }
        $("notes").replaceChildren();
    }

    function renderChunk(key) {

        const items = current[key];
        const list = $(`list-${key}`);
        const more = $(`more-${key}`);
        const next = items.slice(shown[key], shown[key] + MAX_ROWS_SHOWN);

        const fragment = document.createDocumentFragment();

        for (const item of next) {

            const li = document.createElement("li");
            li.className = "lc-item";

            const text = document.createElement("span");
            text.className = "lc-item__text";
            text.textContent = item.text === "" ? "(empty line)" : item.text;

            li.append(text);

            if (key === "both" && (item.countA > 1 || item.countB > 1)) {
                const counts = document.createElement("span");
                counts.className = "lc-item__count";
                counts.textContent = `A ×${fmt(item.countA)}, B ×${fmt(item.countB)}`;
                li.append(counts);
            }

            fragment.append(li);
        }

        list.append(fragment);
        shown[key] += next.length;

        const left = items.length - shown[key];

        more.hidden = left <= 0;

        if (left > 0) {
            more.textContent = `Show more (${fmt(left)} more ${left === 1 ? "item" : "items"})`;
        }
    }

    function renderRepeated(key, id) {

        const items = current[key];
        const group = $(`group-${id}`);
        const list = $(`list-${id}`);

        group.hidden = items.length === 0;

        const fragment = document.createDocumentFragment();

        for (const item of items.slice(0, MAX_ROWS_SHOWN)) {
            const li = document.createElement("li");
            li.className = "lc-item";
            const text = document.createElement("span");
            text.className = "lc-item__text";
            text.textContent = item.text === "" ? "(empty line)" : item.text;
            const count = document.createElement("span");
            count.className = "lc-item__count";
            count.textContent = `×${fmt(item.count)}`;
            li.append(text, count);
            fragment.append(li);
        }

        list.append(fragment);
    }

    function blockedMessage(result) {

        const parts = [];

        for (const [label, side] of [["A", result.a], ["B", result.b]]) {

            if (side.status === "empty") {
                parts.push(`List ${label} is empty.`);
            } else if (side.status === "too-large") {
                parts.push(side.kind === "lines"
                    ? `List ${label} has ${fmt(side.size)} lines; the limit is ${fmt(side.limit)}.`
                    : `List ${label} has ${fmt(side.size)} characters; the limit is ${fmt(side.limit)}.`);
            }
        }

        return parts.join(" ");
    }

    function run() {

        clearTimeout(timer);

        const result = compareLists(boxA.value, boxB.value, {
            ignoreCase: optCase.checked,
            trim: optTrim.checked,
            skipEmpty: optEmpty.checked
        });

        clearResult();

        if (result.state === "blocked") {

            const tooLarge = result.a.status === "too-large" || result.b.status === "too-large";
            const message = blockedMessage(result);

            setStatus(tooLarge ? "invalid" : "empty", tooLarge ? message : `${message} Paste two lists to compare them.`);

            if (tooLarge) {
                announce(message);
            }

            return;
        }

        current = result;
        shown = { onlyA: 0, both: 0, onlyB: 0 };

        const summary = summaryText(result);

        setStatus("done", summary);

        const notes = $("notes");

        for (const line of noteLines(result)) {
            const li = document.createElement("li");
            li.textContent = line;
            notes.append(li);
        }

        for (const { key, title } of GROUPS) {
            $(`title-${key}`).textContent = `${title} (${fmt(result[key].length)})`;
            $(`copy-${key}`).disabled = result[key].length === 0;
            renderChunk(key);
        }

        renderRepeated("repeatedA", "repA");
        renderRepeated("repeatedB", "repB");

        $("title-repA").textContent = `Repeated in A (${fmt(result.repeatedA.length)})`;
        $("title-repB").textContent = `Repeated in B (${fmt(result.repeatedB.length)})`;

        $("result").hidden = false;
        copyAll.disabled = false;

        announce(summary);
    }

    function totalLines() {
        return lineCount(boxA.value) + lineCount(boxB.value);
    }

    function bothFilled() {
        return boxA.value.trim() !== "" && boxB.value.trim() !== "";
    }

    function schedule() {

        updateMeta();

        clearTimeout(timer);

        if (bothFilled() && totalLines() <= AUTO_LINES) {
            timer = setTimeout(run, 250);
        } else if (current) {
            /* the lists changed: the shown result is out of date */
            clearResult();
            setStatus("empty", bothFilled() ? "The lists changed. Press Compare." : "Paste two lists to compare them.");
        } else if (!bothFilled()) {
            setStatus("empty", "Paste two lists to compare them.");
        } else {
            setStatus("empty", "Press Compare to compare these lists.");
        }
    }

    function loadExample() {
        boxA.value = EXAMPLE_A;
        boxB.value = EXAMPLE_B;
        optCase.checked = true;
        updateMeta();
        run();
    }

    function swap() {
        const a = boxA.value;
        boxA.value = boxB.value;
        boxB.value = a;
        updateMeta();
        if (bothFilled()) {
            run();
        }
        announce("Lists swapped.");
    }

    function reset() {
        clearTimeout(timer);
        boxA.value = "";
        boxB.value = "";
        optCase.checked = false;
        optTrim.checked = false;
        optEmpty.checked = true;
        clearResult();
        updateMeta();
        setStatus("empty", "Paste two lists to compare them.");
        announce("Reset.");
    }

    boxA.addEventListener("input", schedule);
    boxB.addEventListener("input", schedule);

    for (const option of [optCase, optTrim, optEmpty]) {
        option.addEventListener("change", () => {
            if (bothFilled() && (current || totalLines() <= AUTO_LINES)) {
                run();
            }
        });
    }

    for (const { key, title } of GROUPS) {
        $(`copy-${key}`).addEventListener("click", () => copy(groupText(current[key]), title));
        $(`more-${key}`).addEventListener("click", () => renderChunk(key));
    }

    copyAll.addEventListener("click", () => copy(resultText(current), "Result"));
    $("compare").addEventListener("click", run);
    $("swap").addEventListener("click", swap);
    $("reset").addEventListener("click", reset);
    $("example").addEventListener("click", loadExample);

    updateMeta();

    panel.dataset.ready = "true";
}
