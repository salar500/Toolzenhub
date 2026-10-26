/* =========================================================
   ToolZen Hub
   JSONPath Tester (Developer Tools)

   Run an RFC 9535 JSONPath query on a JSON document and see the exact
   nodes it selects, each with its Normalized Path, plus a per-segment
   trace that shows where an empty result stopped matching. The rules
   are in jsonpath-engine.js; this file is the page around them.

   match() and search() are not supported (they would run a regular
   expression typed by the visitor); the page says so.

   Behaviour that matters:
   - Everything from the inputs and the result goes on the page with
     textContent, never as HTML.
   - A document of 200,000 characters or fewer is evaluated as you type
     (after a short pause); a larger one waits for Evaluate or Enter.
   - Copy only runs when the visitor presses its button; the clipboard
     is never read.
   - No network request, no storage, no URL or title change, and no
     logging of the input.
========================================================= */

import {
    evaluateQuery,
    countText,
    valuesText,
    truncate,
    EXAMPLE_DOCUMENT,
    EXAMPLE_QUERY,
    MAX_DOCUMENT_CHARS,
    MAX_QUERY_CHARS,
    AUTO_DOCUMENT_CHARS,
    MAX_ROWS_SHOWN,
    MAX_WORKING_NODES,
    DISPLAY_VALUE_CHARS
} from "./jsonpath-engine.js";

import {
    normalizedPath,
    serialize
} from "../json-tree/json-tree.js";

import {
    getToolById
} from "../../data/tools.js";


/* The related tools are linked from the page text and the catalog's relatedTools; no related block is shown. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("jsonpath-tester").title;

const JSON_TOOL =
    getToolById("json-formatter");

const COMPARE_TOOL =
    getToolById("json-compare");

const DEBOUNCE_MS = 300;

const countChars = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;

const EXAMPLE_RESULT = evaluateQuery(EXAMPLE_DOCUMENT, EXAMPLE_QUERY);

const EXAMPLE_PATHS = EXAMPLE_RESULT.nodes
    .map((n) => normalizedPath(n.path));

const SYNTAX = [
    ["$", "The root of the document"],
    [".name   ['name']", "A member of an object, by name"],
    [".*   [*]", "Every member or element"],
    ["[2]   [-1]", "An array element by position (negative counts from the end)"],
    ["[1:3]   [::2]   [::-1]", "A slice: start, end (not included) and step"],
    ["..name   ..[*]", "Descendants: the name or selector at any depth"],
    ["[?@.price<10]", "A filter: keep the children for which the test is true. @ is the child being tested"],
    ["== != < <= > >=", "Comparisons in a filter"],
    ["&& || ! ( )", "And, or, not and grouping in a filter"],
    ["[?@.isbn]", "An existence test: the child has that member"],
    ["length(@.a)  count(@.*)  value(@..x)", "Characters or elements or members; how many nodes; the value when exactly one node"],
    ["['a','b']   [0,2]", "Several selectors in one bracket"]
];


/* =========================================================
   MARKUP
========================================================= */

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
                        Run a JSONPath query on a JSON document and see the
                        exact nodes it selects, each with its path. When
                        nothing matches, a trace shows where the query
                        stopped matching.
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
                            Run in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <section class="calculator-section">

                <div
                    id="jp-panel"
                    class="jp-workspace"
                    data-state="empty"
                >

                    <div class="jp-panes">

                        <div class="jp-pane">

                            <div class="jp-pane__head">
                                <label for="jp-document" class="jp-label">JSON document</label>
                                <span id="jp-document-count" class="jp-meta">0 characters</span>
                            </div>

                            <textarea
                                id="jp-document"
                                class="jp-input"
                                rows="10"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="jp-document-status"
                            ></textarea>

                            <p id="jp-document-status" class="jp-side-status" data-state="empty">Empty.</p>

                            <pre id="jp-document-context" class="jp-context" hidden></pre>

                        </div>

                        <div class="jp-pane jp-query-pane">

                            <div class="jp-pane__head">
                                <label for="jp-query" class="jp-label">JSONPath query</label>
                                <span id="jp-query-count" class="jp-meta">0 characters</span>
                            </div>

                            <input
                                id="jp-query"
                                class="jp-line"
                                type="text"
                                placeholder="$"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="jp-query-status"
                            >

                            <p id="jp-query-status" class="jp-side-status" data-state="empty">Empty.</p>

                            <pre id="jp-query-context" class="jp-context" hidden></pre>

                        </div>

                    </div>

                    <div class="jp-actions jp-actions--main">
                        <button type="button" id="jp-run" class="calculator-form__button jp-button">Evaluate</button>
                        <button type="button" id="jp-example" class="calculator-form__button calculator-form__button--secondary jp-button">Load example</button>
                        <button type="button" id="jp-reset" class="calculator-form__button calculator-form__button--secondary jp-button">Reset</button>
                    </div>

                    <p id="jp-status" class="jp-status" data-state="empty">Paste a JSON document and type a query, or choose Load example.</p>

                    <div id="jp-result" class="jp-result" hidden>

                        <h2 id="jp-result-heading" class="jp-heading">Matched nodes</h2>

                        <ul id="jp-notes" class="jp-notes"></ul>

                        <p id="jp-more" class="jp-hint" hidden></p>

                        <div id="jp-table-wrap" class="jp-table-wrap" hidden>
                            <table class="jp-table" id="jp-table">
                                <caption class="jp-sr-only">Nodes selected by the query</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Path</th>
                                        <th scope="col">Value</th>
                                    </tr>
                                </thead>
                                <tbody id="jp-rows"></tbody>
                            </table>
                        </div>

                        <details id="jp-trace" class="jp-trace">
                            <summary>How the query was evaluated, segment by segment</summary>
                            <ol id="jp-trace-list" class="jp-trace-list"></ol>
                        </details>

                        <div class="jp-actions jp-actions--result">
                            <button type="button" id="jp-copy-values" class="calculator-form__button calculator-form__button--secondary jp-button">Copy values</button>
                            <button type="button" id="jp-copy-paths" class="calculator-form__button calculator-form__button--secondary jp-button">Copy paths</button>
                        </div>

                        <div id="jp-fallback-wrap" class="jp-fallback" hidden>
                            <label for="jp-fallback" class="jp-label">Copy this text yourself</label>
                            <textarea id="jp-fallback" class="jp-input" rows="6" readonly spellcheck="false"></textarea>
                        </div>

                    </div>

                </div>

            </section>

            <p id="jp-live" class="jp-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Paste a JSON document, or press Load example.</li>
                    <li>Type a query that starts with <code>$</code>, such as <code>${EXAMPLE_QUERY}</code>.</li>
                    <li>Small documents are evaluated as you type. For a large one, press Evaluate or Enter in the query box.</li>
                    <li>Read the matched nodes, each with its path. Open the trace to see how many nodes each segment kept.</li>
                    <li>Copy the values as a JSON array, or the paths one per line.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>The Standard, and What Is Left Out</h2>
                <p>
                    Queries follow <strong>RFC 9535</strong> (JSONPath, 2024)
                    <strong>except the functions <code>match()</code> and <code>search()</code></strong>,
                    which are not supported in this version because they would run a
                    regular expression typed into the page. A query that uses them is
                    refused with a message, never guessed. Syntax that other libraries
                    accept but RFC 9535 does not, such as script expressions
                    <code>[(@.length-1)]</code>, is refused too. This tool does not
                    claim full conformance to the standard.
                </p>
                <p>
                    A query with spaces before or after it is refused; spaces are allowed
                    between segments and inside brackets. A query is a standard well-formed
                    query or an error: the page does not repair it.
                </p>
            </section>

            <section class="calculator-info">
                <h2>Supported Syntax</h2>
                <table class="jp-ref">
                    <thead>
                        <tr><th scope="col">Write</th><th scope="col">Meaning</th></tr>
                    </thead>
                    <tbody>
                        ${SYNTAX.map(([a, b]) => `<tr><td><code>${a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></td><td>${b}</td></tr>`).join("")}
                    </tbody>
                </table>
                <p>
                    Numbers compare by exact value, never as floating point.
                    Strings compare by code point. Comparing values of different types is false,
                    and a member that is missing equals another missing member, as the standard defines.
                </p>
            </section>

            <section class="calculator-info">
                <h2>A Worked Example</h2>
                <p>
                    On the bookstore document from the standard, <code>${EXAMPLE_QUERY}</code>
                    selects ${EXAMPLE_RESULT.nodes.length} nodes, the books that cost less than 10:
                    <code>${EXAMPLE_PATHS.join("</code> and <code>")}</code>.
                    Press Load example to see it run.
                </p>
                <p>
                    Limits: a query of at most ${MAX_QUERY_CHARS.toLocaleString("en-US")} characters, a document of at most
                    ${MAX_DOCUMENT_CHARS.toLocaleString("en-US")} characters nested at most 500 levels, and at most
                    ${MAX_WORKING_NODES.toLocaleString("en-US")} nodes at any one segment. Over a limit nothing is
                    cut off; the query stops with a message. The list shows the first
                    ${MAX_ROWS_SHOWN.toLocaleString("en-US")} nodes; copying includes all of them.
                </p>
                <p>
                    To tidy or check a document first, use the <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a>.
                    To see how two documents differ, use <a href="${COMPARE_TOOL.href}">${COMPARE_TOOL.title}</a>.
                </p>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Is my JSON sent anywhere?</summary>
                    <p>No. The document and the query are read and evaluated in your browser. Nothing is uploaded, stored or logged, and the address of this page does not change.</p>
                </details>
                <details>
                    <summary>Why does my query from another library fail here?</summary>
                    <p>Libraries differ. This tool accepts the standard syntax only and says exactly where a query is not valid, so you can see what to change.</p>
                </details>
                <details>
                    <summary>Why is match() or search() refused?</summary>
                    <p>They take a regular expression, and running a pattern typed into a web page can freeze the tab. They are left out of this version, and the page says so.</p>
                </details>
                <details>
                    <summary>What does it mean when nothing matches?</summary>
                    <p>The query was valid but selected no nodes. The trace shows how many nodes each segment received and kept, and marks the segment where the result became empty.</p>
                </details>
                <details>
                    <summary>In what order are the nodes listed?</summary>
                    <p>In the order the standard defines: segment by segment, with descendants visited before their later siblings. Object members are listed in the order they appear in your document.</p>
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

    const panel = document.querySelector("#jp-panel");

    if (!panel) {
        return;
    }

    const $ = (id) => document.querySelector(`#jp-${id}`);
    const live = $("live");
    const doc = $("document");
    const query = $("query");

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
        $("document-count").textContent = countChars(doc.value.length);
        $("query-count").textContent = countChars(query.value.length);
    }

    function resetField(name, input) {

        const status = $(`${name}-status`);
        const context = $(`${name}-context`);

        status.dataset.state = "empty";
        status.textContent = input.value.trim() === "" ? "Empty." : "Not checked yet.";
        context.hidden = true;
        context.textContent = "";
        input.removeAttribute("aria-invalid");
        input.setAttribute("aria-describedby", `jp-${name}-status`);
    }

    function clearResult() {
        current = null;
        $("result").hidden = true;
        $("rows").replaceChildren();
        $("notes").replaceChildren();
        $("trace-list").replaceChildren();
        $("more").hidden = true;
        $("fallback-wrap").hidden = true;
        $("fallback").value = "";
    }

    /* a one-line view of the query with a caret under the 1-based position */
    function caretView(text, position) {
        return `${text.replace(/[\r\n\t]/g, " ")}\n${" ".repeat(Math.max(position - 1, 0))}^`;
    }

    function markField(name, input, state, message, context) {

        const status = $(`${name}-status`);
        const box = $(`${name}-context`);

        status.dataset.state = state;
        status.textContent = message;
        input.removeAttribute("aria-invalid");
        input.setAttribute("aria-describedby", `jp-${name}-status`);
        box.hidden = true;

        if (state === "invalid") {
            input.setAttribute("aria-invalid", "true");
        }

        if (context) {
            box.textContent = context;
            box.hidden = false;
            input.setAttribute("aria-describedby", `jp-${name}-status jp-${name}-context`);
        }
    }

    /* returns the problem to announce, or null */
    function describeDocument(info) {

        if (info.status === "valid") {
            markField("document", doc, "done", "Valid JSON.");
            return null;
        }

        if (info.status === "empty") {
            markField("document", doc, "empty", "Empty.");
            return "Paste the JSON document to query.";
        }

        let message;
        let context = null;

        if (info.status === "too-large") {
            message = `The document is over the limit of ${info.limit.toLocaleString("en-US")} characters, so the query was not run.`;
        } else if (info.status === "refused") {
            message = `JSON document: ${info.message}`;
        } else {
            message = `JSON document, line ${info.error.line}, column ${info.error.column}: ${info.error.message}`;
            context = info.error.context;
        }

        markField("document", doc, "invalid", message, context);

        return message;
    }

    function describeQuery(info, text) {

        if (info.status === "valid") {
            markField("query", query, "done", "Valid query.");
            return null;
        }

        if (info.status === "empty") {
            markField("query", query, "empty", "Empty.");
            return "Type a JSONPath query, starting with $.";
        }

        let message;
        let context = null;

        if (info.status === "too-large") {
            message = `The query is over the limit of ${info.limit.toLocaleString("en-US")} characters, so it was not run.`;
        } else {
            message = `Query, position ${info.position}: ${info.message}`;
            context = caretView(text, info.position);
        }

        markField("query", query, "invalid", message, context);

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
                holder.className = "jp-sr-only";
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

    function valueCell(text, rowNumber) {

        const cell = el("td", null, "jp-value");
        cell.dataset.label = "Value";

        const span = el("span", truncate(text), "jp-value__text");

        cell.append(span);

        if (text.length > DISPLAY_VALUE_CHARS) {

            const button = el("button", "Show full value", "jp-more-button");
            button.type = "button";
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", `Show full value for node ${rowNumber}`);

            button.addEventListener("click", () => {

                const open = button.getAttribute("aria-expanded") === "true";

                span.textContent = open ? truncate(text) : text;
                button.setAttribute("aria-expanded", open ? "false" : "true");
                button.textContent = open ? "Show full value" : "Show less";
                button.setAttribute("aria-label", `${open ? "Show full value" : "Show less of the value"} for node ${rowNumber}`);
            });

            cell.append(button);
        }

        return cell;
    }

    function show(result) {

        current = result;

        const summary = result.nodes.length === 0
            ? "The query is valid and matched 0 nodes."
            : countText(result.nodes.length);

        $("result-heading").textContent = result.nodes.length === 0 ? "No nodes matched" : "Matched nodes";
        $("notes").replaceChildren(...result.notes.map((n) => el("li", n)));

        const body = $("rows");
        body.replaceChildren();

        result.nodes.slice(0, MAX_ROWS_SHOWN).forEach((node, i) => {

            const tr = el("tr");

            const path = el("th", normalizedPath(node.path), "jp-path");
            path.scope = "row";
            path.dataset.label = "Path";

            tr.append(path, valueCell(serialize(node.node), i + 1));
            body.append(tr);
        });

        $("table-wrap").hidden = result.nodes.length === 0;

        if (result.nodes.length > MAX_ROWS_SHOWN) {
            $("more").textContent = `Showing the first ${MAX_ROWS_SHOWN.toLocaleString("en-US")} of ${result.nodes.length.toLocaleString("en-US")} nodes. Copying includes all of them.`;
            $("more").hidden = false;
        } else {
            $("more").hidden = true;
        }

        const list = $("trace-list");
        list.replaceChildren();

        if (result.trace.length === 0) {
            list.append(el("li", "The query is only the root, $, so the result is the whole document."));
        }

        result.trace.forEach((t, i) => {

            const item = el("li");

            item.append(el("code", t.text), document.createTextNode(`: ${t.kind}. ${t.in.toLocaleString("en-US")} ${t.in === 1 ? "node" : "nodes"} in, ${t.out.toLocaleString("en-US")} ${t.out === 1 ? "node" : "nodes"} out.`));

            if (i === result.emptyAt) {
                item.append(el("span", " This is where the result became empty.", "jp-trace-empty"));
            }

            list.append(item);
        });

        $("trace").open = result.nodes.length === 0;
        $("copy-values").disabled = result.nodes.length === 0;
        $("copy-paths").disabled = result.nodes.length === 0;
        $("result").hidden = false;

        setStatus("done", summary);
        announce(summary);
    }

    function run() {

        clearTimeout(debounce);
        clearResult();
        updateCounts();

        if (doc.value.trim() === "" && query.value.trim() === "") {
            resetField("document", doc);
            resetField("query", query);
            setStatus("empty", "Paste a JSON document and type a query, or choose Load example.");
            return;
        }

        const result = evaluateQuery(doc.value, query.value);

        const problems = [
            describeDocument(result.document),
            describeQuery(result.query, query.value)
        ].filter(Boolean);

        if (result.state === "blocked") {

            const onlyEmpty = result.document.status === "empty" || result.query.status === "empty"
                ? (result.document.status === "valid" || result.document.status === "empty") && (result.query.status === "valid" || result.query.status === "empty")
                : false;

            setStatus(onlyEmpty ? "empty" : "invalid", onlyEmpty ? problems[0] : "Nothing was evaluated: fix the problem below.");
            announce(problems.join(" "));
            return;
        }

        if (result.state === "limit") {
            $("notes").replaceChildren(...result.notes.map((n) => el("li", n)));
            markField("query", query, "invalid", result.message);
            setStatus("invalid", result.message);
            announce(result.message);
            return;
        }

        show(result);
    }

    function schedule() {

        updateCounts();
        clearTimeout(debounce);

        if (doc.value.length === 0 && query.value.length === 0) {
            run();
            return;
        }

        if (doc.value.length > AUTO_DOCUMENT_CHARS) {
            clearResult();
            resetField("document", doc);
            resetField("query", query);
            setStatus("empty", "Large document. Press Evaluate or Enter in the query box.");
            return;
        }

        debounce = setTimeout(run, DEBOUNCE_MS);
    }

    doc.addEventListener("input", schedule);
    query.addEventListener("input", schedule);

    query.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            run();
        }
    });

    $("run").addEventListener("click", run);

    $("example").addEventListener("click", () => {
        doc.value = EXAMPLE_DOCUMENT;
        query.value = EXAMPLE_QUERY;
        run();
    });

    $("reset").addEventListener("click", () => {
        clearTimeout(debounce);
        doc.value = "";
        query.value = "";
        clearResult();
        resetField("document", doc);
        resetField("query", query);
        updateCounts();
        setStatus("empty", "Paste a JSON document and type a query, or choose Load example.");
        announce("Reset.");
        doc.focus();
    });

    $("copy-values").addEventListener("click", () => {
        if (current && current.nodes.length) {
            copyText(valuesText(current), "Values");
        }
    });

    $("copy-paths").addEventListener("click", () => {
        if (current && current.nodes.length) {
            copyText(current.nodes.map((n) => normalizedPath(n.path)).join("\n"), "Paths");
        }
    });

    updateCounts();
    resetField("document", doc);
    resetField("query", query);

    panel.dataset.ready = "true";
}
