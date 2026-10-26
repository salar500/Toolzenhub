/* =========================================================
   ToolZen Hub
   JSON Compare (Developer Tools)

   Compare two JSON documents as data: key order is ignored, numbers
   are compared by exact value, and a changed type is named as such.
   The rules are in json-compare-engine.js; this file is the page
   around them.

   Behaviour that matters:
   - A small pair is compared as you type (after a short pause); a
     large one waits for the Compare button, which always works.
   - Everything from the inputs and the result goes on the page with
     textContent, never as HTML.
   - Copy copies exactly what is shown (or, for the differences, all
     rows even when only the first 1,000 are listed), and only when
     the visitor presses its button. The clipboard is never read.
   - No network request, no storage, no URL or title change, and no
     logging of the input.
========================================================= */

import {
    compareJson,
    summaryText,
    differencesText,
    rowValues,
    truncate,
    KIND_LABEL,
    EXAMPLE_FIRST,
    EXAMPLE_SECOND,
    MAX_CHARS_PER_SIDE,
    AUTO_COMBINED_CHARS,
    MAX_ROWS_SHOWN,
    DISPLAY_VALUE_CHARS
} from "./json-compare-engine.js";

import {
    normalizedPath
} from "../json-tree/json-tree.js";

import {
    getToolById
} from "../../data/tools.js";


/* The related tools are linked from the page text and the catalog's relatedTools; no related block is shown. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("json-compare").title;

const JSON_TOOL =
    getToolById("json-formatter");

const DIFF_TOOL =
    getToolById("text-diff");

const DEBOUNCE_MS = 300;

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;

const SIDES = [
    { key: "first", label: "First JSON" },
    { key: "second", label: "Second JSON" }
];


/* =========================================================
   MARKUP
========================================================= */

function paneMarkup(side) {

    return `
                        <div class="jc-pane">

                            <div class="jc-pane__head">
                                <label for="jc-${side.key}" class="jc-label">${side.label}</label>
                                <span id="jc-${side.key}-count" class="jc-meta">0 characters</span>
                            </div>

                            <textarea
                                id="jc-${side.key}"
                                class="jc-input"
                                rows="10"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="jc-${side.key}-status"
                            ></textarea>

                            <p id="jc-${side.key}-status" class="jc-side-status" data-state="empty">Empty.</p>

                            <pre id="jc-${side.key}-context" class="jc-context" hidden></pre>

                        </div>`;
}

export function markup() {

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
                        Paste two JSON documents and see exactly what was
                        added, removed, changed or changed in type, with the
                        path of each and an optional JSON Patch. Key order and
                        number formatting are not differences.
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

                <div
                    id="jc-panel"
                    class="jc-workspace"
                    data-state="empty"
                >

                    <div class="jc-panes">
                        ${SIDES.map(paneMarkup).join("")}
                    </div>

                    <label class="jc-check">
                        <input type="checkbox" id="jc-order">
                        <span>Ignore array order (compare arrays as unordered lists)</span>
                    </label>

                    <div class="jc-actions">
                        <button type="button" id="jc-run" class="calculator-form__button jc-button">Compare</button>
                        <button type="button" id="jc-swap" class="calculator-form__button calculator-form__button--secondary jc-button">Swap</button>
                        <button type="button" id="jc-example" class="calculator-form__button calculator-form__button--secondary jc-button">Load example</button>
                        <button type="button" id="jc-reset" class="calculator-form__button calculator-form__button--secondary jc-button">Reset</button>
                    </div>

                    <p id="jc-status" class="jc-status" data-state="empty">Paste both JSON documents, or choose Load example.</p>

                    <div id="jc-result" class="jc-result" hidden>

                        <h2 id="jc-result-heading" class="jc-heading">Differences</h2>

                        <ul id="jc-notes" class="jc-notes"></ul>

                        <p id="jc-more" class="jc-hint" hidden></p>

                        <div id="jc-table-wrap" class="jc-table-wrap" hidden>
                            <table class="jc-table" id="jc-table">
                                <caption class="jc-sr-only">Differences between the two documents</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Difference</th>
                                        <th scope="col">Path</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Second</th>
                                    </tr>
                                </thead>
                                <tbody id="jc-rows"></tbody>
                            </table>
                        </div>

                        <div class="jc-actions jc-actions--result">
                            <button type="button" id="jc-copy" class="calculator-form__button calculator-form__button--secondary jc-button">Copy differences</button>
                            <button type="button" id="jc-copy-patch" class="calculator-form__button calculator-form__button--secondary jc-button">Copy JSON Patch</button>
                        </div>

                        <p id="jc-patch-note" class="jc-hint"></p>

                        <div id="jc-fallback-wrap" class="jc-fallback" hidden>
                            <label for="jc-fallback" class="jc-label">Copy this text yourself</label>
                            <textarea id="jc-fallback" class="jc-input" rows="6" readonly spellcheck="false"></textarea>
                        </div>

                    </div>

                </div>

            </section>

            <p id="jc-live" class="jc-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Paste one document in each box, or press Load example.</li>
                    <li>Small pairs are compared as you type. For a large pair, press Compare.</li>
                    <li>Read the list of differences: what kind, where, and the two values.</li>
                    <li>Copy the differences as text, or copy a JSON Patch that turns the first document into the second.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>How Two Documents Are Compared</h2>
                <ul>
                    <li><strong>Objects</strong> are unordered. <code>{"a":1,"b":2}</code> and <code>{"b":2,"a":1}</code> are the same.</li>
                    <li><strong>Arrays</strong> are compared by position. Elements beyond the shorter array are added or removed. Tick "Ignore array order" to compare them as unordered lists instead; the patch is then not offered, because a patch cannot express an ignored order.</li>
                    <li><strong>Numbers</strong> are equal when they have the same exact value. <code>1</code>, <code>1.0</code>, <code>1e0</code> and <code>10e-1</code> are equal, and so are <code>0</code> and <code>-0</code>. Numbers are never rounded to floating point, so 12345678901234567890 and 12345678901234567891 are different.</li>
                    <li><strong>Types</strong> are never coerced. <code>1</code> against <code>"1"</code> is a type change, as are <code>true</code> against <code>1</code> and <code>null</code> against <code>0</code>.</li>
                    <li><strong>Strings</strong> are compared code point by code point, with no trimming, case folding or normalization. When two strings differ only by Unicode normalization the row says so.</li>
                    <li><strong>Duplicate keys</strong> in one object are valid JSON. The last value is used, as <code>JSON.parse</code> does, and a note names where it happened.</li>
                    <li>Each document must be strict JSON (RFC 8259): no comments, no trailing commas, no single quotes. A problem is reported with its line and column, and nothing is compared until both sides are valid.</li>
                </ul>
                <p>
                    Paths use the JSONPath normalized form, such as <code>$['b'][2]</code>.
                    The patch uses JSON Pointers (RFC 6901) in <code>add</code>,
                    <code>remove</code> and <code>replace</code> operations (RFC 6902) and is
                    applied back to the first document inside the tool before it is offered.
                </p>
                <p>
                    To tidy a document first, use the <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a>.
                    To compare plain text line by line instead, use <a href="${DIFF_TOOL.href}">${DIFF_TOOL.title}</a>.
                    This tool does not validate against a schema.
                </p>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Is my JSON sent anywhere?</summary>
                    <p>No. Both documents are read and compared in your browser. Nothing is uploaded, stored or logged, and the address of this page does not change.</p>
                </details>
                <details>
                    <summary>Why are 1 and 1.0 treated as the same?</summary>
                    <p>They are the same number. JSON does not distinguish them, so a different way of writing a number is not a difference. Different values, even in the twentieth digit, are.</p>
                </details>
                <details>
                    <summary>Why is there no patch when I ignore array order?</summary>
                    <p>A patch changes elements by position. If the order does not matter, there is no single position-based patch that describes the change, so none is offered.</p>
                </details>
                <details>
                    <summary>What are the size limits?</summary>
                    <p>${MAX_CHARS_PER_SIDE.toLocaleString("en-US")} characters per side and nesting 500 levels deep. Over a limit, nothing is compared or cut off. The list shows the first ${MAX_ROWS_SHOWN.toLocaleString("en-US")} differences; copying includes all of them.</p>
                </details>
                <details>
                    <summary>What if one of my documents has a lone surrogate or a very long number?</summary>
                    <p>It is still compared, exactly. A note on that side explains what was found.</p>
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

function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) {
        node.textContent = text;
    }
    if (className) {
        node.className = className;
    }
    return node;
}

export function init() {

    const panel = document.querySelector("#jc-panel");

    if (!panel) {
        return;
    }

    const $ = (id) => document.querySelector(`#jc-${id}`);
    const live = $("live");
    const inputs = { first: $("first"), second: $("second") };
    const order = $("order");

    let announceTimer = null;
    let debounce = null;
    let current = null;

    function announce(message) {
        clearTimeout(announceTimer);
        live.textContent = "";
        announceTimer = setTimeout(() => {
            live.textContent = message;
        }, 50);
    }

    function setStatus(kind, text) {
        panel.dataset.state = kind;
        $("status").dataset.state = kind;
        $("status").textContent = text;
    }

    function updateCounts() {
        for (const side of SIDES) {
            $(`${side.key}-count`).textContent = countText(inputs[side.key].value.length);
        }
    }

    function clearSides() {

        for (const side of SIDES) {

            const status = $(`${side.key}-status`);
            const context = $(`${side.key}-context`);

            status.dataset.state = "empty";
            status.textContent = inputs[side.key].value.trim() === "" ? "Empty." : "Not checked yet.";
            context.hidden = true;
            context.textContent = "";
            inputs[side.key].removeAttribute("aria-invalid");
            inputs[side.key].setAttribute("aria-describedby", `jc-${side.key}-status`);
        }
    }

    function clearResult() {
        current = null;
        $("result").hidden = true;
        $("rows").replaceChildren();
        $("notes").replaceChildren();
        $("more").hidden = true;
        $("fallback-wrap").hidden = true;
        $("fallback").value = "";
    }

    function describeSide(side, info) {

        const status = $(`${side.key}-status`);
        const context = $(`${side.key}-context`);
        const input = inputs[side.key];

        context.hidden = true;
        input.removeAttribute("aria-invalid");
        input.setAttribute("aria-describedby", `jc-${side.key}-status`);

        if (info.status === "valid") {
            status.dataset.state = "done";
            status.textContent = "Valid JSON.";
            return null;
        }

        if (info.status === "empty") {
            status.dataset.state = "empty";
            status.textContent = "Empty.";
            return `Paste the ${side.key} JSON to compare.`;
        }

        status.dataset.state = "invalid";
        input.setAttribute("aria-invalid", "true");

        let message;

        if (info.status === "too-large") {
            message = `${side.label} is over the limit of ${info.limit.toLocaleString("en-US")} characters, so nothing was compared.`;
        } else if (info.status === "refused") {
            message = `${side.label}: ${info.message}`;
        } else {
            message = `${side.label}, line ${info.error.line}, column ${info.error.column}: ${info.error.message}`;
            context.textContent = info.error.context;
            context.hidden = false;
            input.setAttribute("aria-describedby", `jc-${side.key}-status jc-${side.key}-context`);
        }

        status.textContent = message;

        return message;
    }

    async function copyText(text, what) {

        let copied = false;

        try {
            await navigator.clipboard.writeText(text);
            copied = true;
        } catch (problem) {
            try {
                const holder = document.createElement("textarea");
                holder.className = "jc-sr-only";
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

        if (copied) {
            $("fallback-wrap").hidden = true;
            announce(`${what} copied to the clipboard.`);
            return;
        }

        $("fallback").value = text;
        $("fallback-wrap").hidden = false;
        $("fallback").focus();
        $("fallback").select();
        announce("Could not copy automatically. The text is selected below; copy it yourself.");
    }

    function valueCell(text, label, rowNumber) {

        const cell = el("td", null, "jc-value");
        cell.dataset.label = label;

        const span = el("span", truncate(text), "jc-value__text");

        cell.append(span);

        if (text.length > DISPLAY_VALUE_CHARS) {

            const button = el("button", "Show full value", "jc-more-button");
            button.type = "button";
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", `Show full ${label.toLowerCase()} value for difference ${rowNumber}`);

            button.addEventListener("click", () => {

                const open = button.getAttribute("aria-expanded") === "true";

                span.textContent = open ? truncate(text) : text;
                button.setAttribute("aria-expanded", open ? "false" : "true");
                button.textContent = open ? "Show full value" : "Show less";
                button.setAttribute("aria-label", `${open ? "Show full" : "Show less of the"} ${label.toLowerCase()} value for difference ${rowNumber}`);
            });

            cell.append(button);
        }

        return cell;
    }

    function show(result) {

        current = result;

        const summary = summaryText(result);

        $("result-heading").textContent = result.rows.length === 0 ? "No differences" : "Differences";
        $("notes").replaceChildren(...result.notes.map((n) => el("li", n)));

        const body = $("rows");
        body.replaceChildren();

        const shown = result.rows.slice(0, MAX_ROWS_SHOWN);

        shown.forEach((row, i) => {

            const values = rowValues(row);
            const tr = el("tr");

            const kind = el("th", KIND_LABEL[row.kind], "jc-kind");
            kind.scope = "row";

            const path = el("td", normalizedPath(row.path), "jc-path");
            path.dataset.label = "Path";

            const first = row.a ? valueCell(values.first, "First", i + 1) : el("td", "(none)", "jc-value jc-value--none");
            const second = row.b ? valueCell(values.second, "Second", i + 1) : el("td", "(none)", "jc-value jc-value--none");

            first.dataset.label = "First";
            second.dataset.label = "Second";

            if (row.note) {
                second.append(el("span", row.note, "jc-row-note"));
            }

            tr.append(kind, path, first, second);
            body.append(tr);
        });

        $("table-wrap").hidden = shown.length === 0;

        const more = $("more");

        if (result.rows.length > MAX_ROWS_SHOWN) {
            more.textContent = `Showing the first ${MAX_ROWS_SHOWN.toLocaleString("en-US")} of ${result.rows.length.toLocaleString("en-US")} differences. Copying includes all of them.`;
            more.hidden = false;
        } else {
            more.hidden = true;
        }

        $("copy").disabled = result.rows.length === 0;
        $("copy-patch").disabled = result.patch === null;
        $("patch-note").textContent = result.patch === null
            ? result.patchReason
            : result.rows.length === 0
                ? "The documents are the same, so the JSON Patch is an empty list."
                : "The patch was applied to the first document inside the tool and gave the second.";

        $("result").hidden = false;

        setStatus(result.rows.length === 0 ? "done" : "done", summary);
        announce(`${summary}${result.notes.length ? " " + result.notes.length + " note" + (result.notes.length === 1 ? "" : "s") + "." : ""}`);
    }

    function run() {

        clearTimeout(debounce);
        clearResult();
        updateCounts();

        const a = inputs.first.value;
        const b = inputs.second.value;

        if (a.trim() === "" && b.trim() === "") {
            clearSides();
            setStatus("empty", "Paste both JSON documents, or choose Load example.");
            return;
        }

        const result = compareJson(a, b, { ignoreOrder: order.checked });

        if (result.state === "blocked") {

            const messages = SIDES
                .map((side) => describeSide(side, result[side.key]))
                .filter(Boolean);

            const onlyEmpty = SIDES.every((side) =>
                result[side.key].status === "valid" || result[side.key].status === "empty");

            setStatus(onlyEmpty ? "empty" : "invalid", onlyEmpty ? messages[0] : "Nothing was compared: fix the problem below.");
            announce(messages.join(" "));
            return;
        }

        for (const side of SIDES) {
            describeSide(side, { status: "valid" });
        }

        show(result);
    }

    function schedule() {

        updateCounts();

        const combined = inputs.first.value.length + inputs.second.value.length;

        clearTimeout(debounce);

        if (combined === 0) {
            run();
            return;
        }

        if (combined > AUTO_COMBINED_CHARS) {
            clearResult();
            clearSides();
            setStatus("empty", "Large input. Press Compare.");
            return;
        }

        debounce = setTimeout(run, DEBOUNCE_MS);
    }

    for (const side of SIDES) {
        inputs[side.key].addEventListener("input", schedule);
    }

    order.addEventListener("change", () => {

        const combined = inputs.first.value.length + inputs.second.value.length;

        if (combined <= AUTO_COMBINED_CHARS) {
            run();
        } else {
            clearResult();
            setStatus("empty", "Large input. Press Compare.");
        }
    });

    $("run").addEventListener("click", run);

    $("swap").addEventListener("click", () => {

        const keep = inputs.first.value;

        inputs.first.value = inputs.second.value;
        inputs.second.value = keep;

        const combined = keep.length + inputs.first.value.length;

        if (combined <= AUTO_COMBINED_CHARS) {
            run();
        } else {
            updateCounts();
            clearResult();
            setStatus("empty", "Swapped. Press Compare.");
        }

        announce("The two documents were swapped.");
    });

    $("example").addEventListener("click", () => {
        inputs.first.value = EXAMPLE_FIRST;
        inputs.second.value = EXAMPLE_SECOND;
        order.checked = false;
        run();
    });

    $("reset").addEventListener("click", () => {
        clearTimeout(debounce);
        inputs.first.value = "";
        inputs.second.value = "";
        order.checked = false;
        clearResult();
        clearSides();
        updateCounts();
        setStatus("empty", "Paste both JSON documents, or choose Load example.");
        announce("Reset.");
        inputs.first.focus();
    });

    $("copy").addEventListener("click", () => {
        if (current && current.rows.length) {
            copyText(differencesText(current), "Differences");
        }
    });

    $("copy-patch").addEventListener("click", () => {
        if (current && current.patch !== null) {
            copyText(current.patch, "JSON Patch");
        }
    });

    updateCounts();
    clearSides();

    panel.dataset.ready = "true";
}
