/* =========================================================
   ToolZen Hub
   URL Parser & Encoder (Developer Tools)

   Three modes: parse a URL into its parts, encode or decode text,
   and build a query string. The rules are in url-engine.js; this
   file is the page around them.

   Behaviour that matters:
   - Nothing is fetched, opened, previewed or linked. A URL is put
     on the page with textContent only and never becomes an href,
     an image source or a navigation.
   - Small inputs are read as you type; a large one waits for the
     button. The clipboard is never read.
   - No network request, no storage of any kind, and no URL or
     title change: a pasted URL can hold a token.
========================================================= */

import {
    parseUrl,
    percentEncode,
    formEncode,
    percentDecode,
    buildQuery,
    withQuery,
    parseQuery,
    MAX_PARSE_CHARS,
    MAX_CODEC_CHARS,
    MAX_QUERY_ROWS,
    MAX_SHOWN_PARAMS
} from "./url-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* The related tools are linked from the catalog's relatedTools; the page text links only these two. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("url-parser").title;

const BASE64_TOOL =
    getToolById("base64-encoder-decoder");

const JSON_TOOL =
    getToolById("json-formatter");

const LIVE_LIMIT = 20000;

const EXAMPLES = {
    parse: "https://user:pw@Example.COM:443/a/./b/../c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag",
    codec: "a b&c=d/é",
    build: [
        { name: "q", value: "a b" },
        { name: "tag", value: "x&y" },
        { name: "tag", value: "é" }
    ]
};

const OPERATIONS = {
    "percent-encode": { label: "Percent-encode (RFC 3986)", hint: "Every byte except A-Z a-z 0-9 - . _ ~ becomes %XX. Use this for one part of a URL, such as a path segment or a parameter value." },
    "percent-decode": { label: "Percent-decode", hint: "Turns %XX back into text. A + stays a +. A bad sequence is refused, not guessed." },
    "form-encode": { label: "Form-encode (space as +)", hint: "The browser's form format: a space becomes +, and A-Z a-z 0-9 * - . _ stay." },
    "form-decode": { label: "Form-decode (+ as space)", hint: "Like percent-decode, but a + is read as a space first." }
};

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;

const byteText = (n) =>
    `${n.toLocaleString("en-US")} byte${n === 1 ? "" : "s"}`;

const COMPONENT_ROWS = [
    ["scheme", "Scheme"],
    ["username", "Username"],
    ["password", "Password"],
    ["host", "Host"],
    ["port", "Port"],
    ["path", "Path"],
    ["query", "Query"],
    ["fragment", "Fragment"],
    ["origin", "Origin"]
];


/* =========================================================
   MARKUP
========================================================= */

export function markup() {

    const ops = Object.entries(OPERATIONS).map(([value, op], i) => `
                                <label class="up-choice">
                                    <input type="radio" name="up-op" value="${value}"${i === 0 ? " checked" : ""}>
                                    <span>${op.label}</span>
                                </label>`).join("");

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
                        Take a URL apart into its scheme, host, path, query
                        parameters and fragment, see what the browser changed,
                        and encode, decode or build query strings with the
                        rules stated.
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
                            Read in your browser, no address is opened or sent
                        </span>

                    </div>

                </div>

            </section>


            <section class="calculator-section">

                <div
                    id="up-panel"
                    class="up-workspace"
                >

                    <p class="up-note">
                        <strong>This tool never opens, fetches or links a URL.</strong>
                        It only reads the text you give it. It does not check
                        that an address exists, is reachable or is trustworthy.
                    </p>

                    <fieldset class="up-modes">

                        <legend class="up-label">
                            What do you want to do?
                        </legend>

                        <div class="up-choices">

                            <label class="up-choice">
                                <input type="radio" name="up-mode" value="parse" checked>
                                <span>Parse a URL</span>
                            </label>

                            <label class="up-choice">
                                <input type="radio" name="up-mode" value="codec">
                                <span>Encode or decode text</span>
                            </label>

                            <label class="up-choice">
                                <input type="radio" name="up-mode" value="build">
                                <span>Build a query string</span>
                            </label>

                        </div>

                    </fieldset>


                    <!-- PARSE -->

                    <div id="up-mode-parse" class="up-mode">

                        <div class="up-pane">

                            <div class="up-pane__head">
                                <label for="up-url" class="up-label">URL</label>
                                <span id="up-url-count" class="up-meta">0 characters</span>
                            </div>

                            <textarea
                                id="up-url"
                                class="up-input"
                                rows="3"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="up-url-hint"
                            ></textarea>

                            <p id="up-url-hint" class="up-hint">
                                Paste an absolute URL. The browser's own URL parser reads it (the WHATWG URL Standard). The limit is ${MAX_PARSE_CHARS.toLocaleString("en-US")} characters.
                            </p>

                            <details class="up-base">
                                <summary>Base URL (only for a relative reference)</summary>
                                <label for="up-base" class="up-label">Base URL</label>
                                <input
                                    id="up-base"
                                    class="up-line"
                                    type="text"
                                    spellcheck="false"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    autocorrect="off"
                                    aria-describedby="up-base-hint"
                                >
                                <p id="up-base-hint" class="up-hint">
                                    A relative reference such as ../x is resolved against this absolute URL.
                                </p>
                            </details>

                        </div>

                        <div class="up-actions">
                            <button type="button" id="up-parse-run" class="calculator-form__button up-button">Parse</button>
                            <button type="button" id="up-parse-example" class="calculator-form__button calculator-form__button--secondary up-button">Load example</button>
                            <button type="button" id="up-reset" class="calculator-form__button calculator-form__button--secondary up-button">Reset</button>
                        </div>

                        <p id="up-parse-status" class="up-status" data-state="empty">Paste a URL, or choose Load example.</p>

                        <div id="up-parse-error" class="up-error" hidden>
                            <p class="up-error__title">This could not be parsed</p>
                            <p id="up-parse-error-message" class="up-error__message"></p>
                        </div>

                        <div id="up-parse-result" class="up-result" hidden>

                            <ul id="up-notes" class="up-list"></ul>

                            <div id="up-warnings-wrap" hidden>
                                <h2 class="up-heading">Warnings</h2>
                                <ul id="up-warnings" class="up-list up-list--warn"></ul>
                            </div>

                            <h2 class="up-heading">Parts of the URL</h2>
                            <table class="up-table" id="up-components">
                                <caption class="up-sr-only">Parts of the URL</caption>
                                <thead class="up-sr-only"><tr><th scope="col">Part</th><th scope="col">Value</th><th scope="col">Copy</th></tr></thead>
                                <tbody id="up-components-body"></tbody>
                            </table>

                            <div id="up-segments-wrap" hidden>
                                <h2 class="up-heading">Path segments</h2>
                                <ol id="up-segments" class="up-list"></ol>
                            </div>

                            <div id="up-malformed-wrap" hidden>
                                <h2 class="up-heading">Malformed percent sequences</h2>
                                <ul id="up-malformed" class="up-list up-list--warn"></ul>
                            </div>

                            <h2 class="up-heading">Query parameters</h2>
                            <p id="up-params-empty" class="up-hint" hidden>This URL has no query parameters.</p>
                            <table class="up-table" id="up-params" hidden>
                                <caption class="up-sr-only">Query parameters in order</caption>
                                <thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Value</th><th scope="col">Notes</th></tr></thead>
                                <tbody id="up-params-body"></tbody>
                            </table>
                            <p id="up-params-more" class="up-hint" hidden></p>

                            <h2 class="up-heading">Normalized URL</h2>
                            <p id="up-changes" class="up-hint"></p>
                            <ul id="up-changes-list" class="up-list"></ul>
                            <pre id="up-href" class="up-output" tabindex="0" aria-label="Normalized URL"></pre>
                            <button type="button" id="up-copy-href" class="calculator-form__button calculator-form__button--secondary up-button">Copy normalized URL</button>

                        </div>

                    </div>


                    <!-- ENCODE / DECODE -->

                    <div id="up-mode-codec" class="up-mode" hidden>

                        <fieldset class="up-modes">
                            <legend class="up-label">Operation</legend>
                            <div class="up-choices">${ops}
                            </div>
                        </fieldset>

                        <div class="up-pane">

                            <div class="up-pane__head">
                                <label for="up-text" class="up-label">Text</label>
                                <span id="up-text-count" class="up-meta">0 characters</span>
                            </div>

                            <textarea
                                id="up-text"
                                class="up-input"
                                rows="6"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="up-text-hint"
                            ></textarea>

                            <p id="up-text-hint" class="up-hint"></p>

                            <label id="up-keep-wrap" class="up-check">
                                <input type="checkbox" id="up-keep">
                                <span>Keep ! ' ( ) * as they are (like JavaScript's encodeURIComponent)</span>
                            </label>

                        </div>

                        <div class="up-actions">
                            <button type="button" id="up-codec-run" class="calculator-form__button up-button">Convert</button>
                            <button type="button" id="up-codec-example" class="calculator-form__button calculator-form__button--secondary up-button">Load example</button>
                            <button type="button" id="up-reset-codec" class="calculator-form__button calculator-form__button--secondary up-button">Reset</button>
                        </div>

                        <p id="up-codec-status" class="up-status" data-state="empty">Enter text, or choose Load example.</p>

                        <div id="up-codec-error" class="up-error" hidden>
                            <p class="up-error__title">This could not be converted</p>
                            <p id="up-codec-error-message" class="up-error__message"></p>
                        </div>

                        <div id="up-codec-result" class="up-result" hidden>
                            <h2 class="up-heading" id="up-codec-heading">Result</h2>
                            <pre id="up-codec-output" class="up-output" tabindex="0" aria-labelledby="up-codec-heading"></pre>
                            <p id="up-codec-meta" class="up-hint"></p>
                            <p id="up-codec-twice" class="up-hint" hidden>
                                The result still contains percent-encoding. It may have been encoded twice.
                                <button type="button" id="up-decode-again" class="calculator-form__button calculator-form__button--secondary up-button">Decode again</button>
                            </p>
                            <button type="button" id="up-copy-codec" class="calculator-form__button calculator-form__button--secondary up-button">Copy result</button>
                        </div>

                    </div>


                    <!-- BUILD -->

                    <div id="up-mode-build" class="up-mode" hidden>

                        <fieldset class="up-modes">
                            <legend class="up-label">Encoding style</legend>
                            <div class="up-choices">
                                <label class="up-choice">
                                    <input type="radio" name="up-style" value="percent" checked>
                                    <span>Percent-encoding (space as %20)</span>
                                </label>
                                <label class="up-choice">
                                    <input type="radio" name="up-style" value="form">
                                    <span>Form encoding (space as +)</span>
                                </label>
                            </div>
                        </fieldset>

                        <div class="up-pane">
                            <h2 class="up-heading">Parameters</h2>
                            <div id="up-rows" class="up-rows"></div>
                            <div class="up-actions">
                                <button type="button" id="up-add-row" class="calculator-form__button calculator-form__button--secondary up-button">Add parameter</button>
                            </div>
                            <p class="up-hint">Up to ${MAX_QUERY_ROWS} parameters. Names can repeat. Blank rows are skipped.</p>
                        </div>

                        <div class="up-pane">
                            <label for="up-edit" class="up-label">Query string to edit (optional)</label>
                            <input id="up-edit" class="up-line" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" aria-describedby="up-edit-hint">
                            <p id="up-edit-hint" class="up-hint">Paste a query string, with or without the leading ?, and press the button to fill the rows from it. It replaces the rows below.</p>
                            <button type="button" id="up-edit-run" class="calculator-form__button calculator-form__button--secondary up-button">Fill rows from this query</button>
                        </div>

                        <div class="up-pane">
                            <label for="up-build-base" class="up-label">Base URL (optional)</label>
                            <input id="up-build-base" class="up-line" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" aria-describedby="up-build-base-hint">
                            <p id="up-build-base-hint" class="up-hint">If given, the full URL is also shown. Its own query is replaced and its fragment is kept.</p>
                        </div>

                        <div class="up-actions">
                            <button type="button" id="up-build-example" class="calculator-form__button calculator-form__button--secondary up-button">Load example</button>
                            <button type="button" id="up-reset-build" class="calculator-form__button calculator-form__button--secondary up-button">Reset</button>
                        </div>

                        <p id="up-build-status" class="up-status" data-state="empty">Add parameters to build a query string.</p>

                        <div id="up-build-error" class="up-error" hidden>
                            <p class="up-error__title">This could not be built</p>
                            <p id="up-build-error-message" class="up-error__message"></p>
                        </div>

                        <div id="up-build-result" class="up-result" hidden>
                            <h2 class="up-heading" id="up-build-heading">Query string</h2>
                            <pre id="up-build-output" class="up-output" tabindex="0" aria-labelledby="up-build-heading"></pre>
                            <button type="button" id="up-copy-build" class="calculator-form__button calculator-form__button--secondary up-button">Copy query string</button>
                            <div id="up-build-full-wrap" hidden>
                                <h2 class="up-heading" id="up-build-full-heading">Full URL</h2>
                                <pre id="up-build-full" class="up-output" tabindex="0" aria-labelledby="up-build-full-heading"></pre>
                                <button type="button" id="up-copy-full" class="calculator-form__button calculator-form__button--secondary up-button">Copy full URL</button>
                            </div>
                        </div>

                    </div>

                </div>

            </section>

            <p id="up-live" class="up-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Choose what you want to do: parse a URL, encode or decode text, or build a query string.</li>
                    <li>Paste or type, or press Load example. Small inputs are read as you type; a large one waits for the button.</li>
                    <li>Read the parts, the warnings and the list of what the parser changed, or the encoded or decoded text.</li>
                    <li>Use the Copy button next to any part or result.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>Which Kind of Encoding to Use</h2>
                <p>
                    These are different operations and they are not interchangeable.
                </p>
                <ul>
                    <li><strong>Percent-encode</strong> writes every UTF-8 byte except A-Z a-z 0-9 - . _ ~ as %XX. Use it for one piece of a URL, such as a path segment or a parameter value. Applying it to a whole URL would also encode the : / ? &amp; = that give the URL its shape.</li>
                    <li><strong>Form-encode</strong> is the format browsers use for HTML forms and for the query part of many URLs: a space becomes +, and * - . _ stay as they are. The other bytes, including ~, become %XX.</li>
                    <li><strong>Decoding</strong> reverses each of these. Percent-decode leaves a + alone; form-decode reads it as a space.</li>
                    <li>Encoding is not encryption. It hides nothing. To read Base64 inside a parameter, use the <a href="${BASE64_TOOL.href}">${BASE64_TOOL.title}</a>; to read JSON, the <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a>.</li>
                </ul>
            </section>

            <section class="calculator-info">
                <h2>How This Tool Reads Your Input</h2>
                <ul>
                    <li>The parser is your browser's own URL parser (the WHATWG URL Standard), not a strict reading of RFC 3986. It differs in a few visible ways: it treats a backslash as a slash in web addresses, removes tabs and newlines, strips leading and trailing spaces, drops a default port such as :443 and lowercases the scheme and host. The list under the normalized URL says which of these happened.</li>
                    <li>A relative reference needs a Base URL. Nothing is guessed when the scheme is missing.</li>
                    <li>A host with non-ASCII letters is shown in its xn-- (punycode) form so a look-alike name is visible.</li>
                    <li>Decoding is strict. A % that is not followed by two hexadecimal digits, or bytes that are not valid UTF-8, are refused with their position. No replacement character is ever used.</li>
                    <li>Credentials in a URL (user:password@) are shown because you pasted them, with a warning. Nothing is stored or sent.</li>
                    <li>The tool does not check that an address exists, can be reached or is safe to visit.</li>
                </ul>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Is my URL sent anywhere?</summary>
                    <p>No. The URL is read in your browser. Nothing is fetched, opened, uploaded, stored or logged, and the address of this page does not change.</p>
                </details>
                <details>
                    <summary>Why is a javascript: or data: URL shown as plain text?</summary>
                    <p>Those addresses can run or embed content. They are parsed like any other text and shown with a warning, but never turned into a link or opened.</p>
                </details>
                <details>
                    <summary>Why does the parser change my URL?</summary>
                    <p>The URL Standard defines a canonical form. A host in capitals, a default port, dots in the path and unencoded characters are all rewritten. The tool lists exactly which of these applied.</p>
                </details>
                <details>
                    <summary>Why was my percent-encoded text refused?</summary>
                    <p>Either a % is not followed by two hexadecimal digits, or the bytes do not form valid UTF-8 text. The message gives the position. Nothing is guessed or replaced.</p>
                </details>
                <details>
                    <summary>What are the size limits?</summary>
                    <p>${MAX_PARSE_CHARS.toLocaleString("en-US")} characters to parse, ${MAX_CODEC_CHARS.toLocaleString("en-US")} to encode or decode, and ${MAX_QUERY_ROWS} parameters to build. Only the first ${MAX_SHOWN_PARAMS} query parameters are listed on screen; copying uses the whole URL.</p>
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

    const panel = document.querySelector("#up-panel");

    if (!panel) {
        return;
    }

    const $ = (id) => document.querySelector(`#up-${id}`);
    const live = $("live");

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
                holder.className = "up-sr-only";
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

    function setStatus(id, kind, text) {
        const node = $(id);
        node.dataset.state = kind;
        node.textContent = text;
    }

    function showError(prefix, message, field) {
        $(`${prefix}-error-message`).textContent = message;
        $(`${prefix}-error`).hidden = false;
        if (field) {
            field.setAttribute("aria-invalid", "true");
        }
    }

    function clearError(prefix, ...fields) {
        $(`${prefix}-error`).hidden = true;
        $(`${prefix}-error-message`).textContent = "";
        for (const field of fields) {
            field.removeAttribute("aria-invalid");
        }
    }

    const modeRadios = [...document.querySelectorAll("input[name='up-mode']")];
    const sections = {
        parse: $("mode-parse"),
        codec: $("mode-codec"),
        build: $("mode-build")
    };
    const currentMode = () =>
        modeRadios.find((r) => r.checked).value;

    function showMode() {

        const which = currentMode();

        for (const [name, node] of Object.entries(sections)) {
            node.hidden = name !== which;
        }
    }


    /* ---------- PARSE ---------- */

    const url = $("url");
    const base = $("base");
    let parsedFor = null;
    let parsedHref = "";

    function clearParse() {
        parsedFor = null;
        parsedHref = "";
        $("parse-result").hidden = true;
        clearError("parse", url, base);
    }

    function copyButton(label, text) {

        const button = el("button", "Copy", "calculator-form__button calculator-form__button--secondary up-button up-button--small");
        button.type = "button";
        button.setAttribute("aria-label", `Copy ${label}`);
        button.addEventListener("click", () => copy(text, label));
        return button;
    }

    function runParse() {

        clearParse();

        const text = url.value;
        $("url-count").textContent = countText(text.length);

        if (text.trim() === "") {
            setStatus("parse-status", "empty", "Paste a URL, or choose Load example.");
            return;
        }

        const result = parseUrl(text, base.value);

        if (!result.ok) {
            showError("parse", result.message, result.field === "base" ? base : url);
            setStatus("parse-status", "invalid", "The URL could not be parsed.");
            announce(result.message);
            return;
        }

        parsedFor = text + "\n" + base.value;
        parsedHref = result.href;

        const notes = $("notes");
        notes.replaceChildren(...result.notes.map((n) => el("li", n)));

        const warnings = $("warnings");
        warnings.replaceChildren(...result.warnings.map((w) => el("li", w)));
        $("warnings-wrap").hidden = result.warnings.length === 0;

        const body = $("components-body");
        body.replaceChildren();

        for (const [key, label] of COMPONENT_ROWS) {

            const value = result.components[key];

            if (key === "username" && value === "" && result.components.password === "") {
                continue;
            }

            if (key === "password" && value === "") {
                continue;
            }

            const row = el("tr");
            const head = el("th", label);
            head.scope = "row";
            const cell = el("td", value === "" ? "(empty)" : value, "up-value");
            cell.dataset.label = label;
            const action = el("td");
            if (value !== "") {
                action.append(copyButton(label.toLowerCase(), value));
            }
            row.append(head, cell, action);
            body.append(row);
        }

        const segs = $("segments");
        segs.replaceChildren();

        if (result.segments) {
            for (const s of result.segments) {
                segs.append(el("li", s.note ? `${s.text} (${s.note})` : (s.text === "" ? "(empty)" : s.text)));
            }
        }

        $("segments-wrap").hidden = !result.segments;

        const mal = $("malformed");
        mal.replaceChildren(...result.malformed.map((m) =>
            el("li", `In the ${m.component}, position ${m.position}: ${m.sequence}`)));
        $("malformed-wrap").hidden = result.malformed.length === 0;

        const pbody = $("params-body");
        pbody.replaceChildren();

        const shown = result.params.slice(0, MAX_SHOWN_PARAMS);

        shown.forEach((p, i) => {

            const row = el("tr");
            const n = el("td", String(i + 1));
            n.dataset.label = "Number";
            const name = el("td", p.name === "" ? "(empty)" : p.name, "up-value");
            name.dataset.label = "Name";
            const value = el("td", p.value === "" ? "(empty)" : p.value, "up-value");
            value.dataset.label = "Value";
            const notesCell = el("td", [
                p.repeated ? "repeated" : "",
                p.hasEquals ? "" : "no =",
                p.note || ""
            ].filter(Boolean).join(", "));
            notesCell.dataset.label = "Notes";
            row.append(n, name, value, notesCell);
            pbody.append(row);
        });

        $("params").hidden = result.params.length === 0;
        $("params-empty").hidden = result.params.length !== 0;

        const more = $("params-more");

        if (result.params.length > MAX_SHOWN_PARAMS) {
            more.textContent = `Showing the first ${MAX_SHOWN_PARAMS} of ${result.params.length.toLocaleString("en-US")} parameters.`;
            more.hidden = false;
        } else {
            more.hidden = true;
        }

        $("changes").textContent = result.normalized
            ? "Your input was already in normalized form."
            : "The parser changed your input:";
        $("changes-list").replaceChildren(...result.changes.map((c) => el("li", c)));

        $("href").textContent = result.href;
        $("parse-result").hidden = false;

        const summary = `Parsed. ${result.components.scheme} URL, host ${result.components.host || "none"}, ${result.params.length} parameter${result.params.length === 1 ? "" : "s"}${result.warnings.length ? ", " + result.warnings.length + " warning" + (result.warnings.length === 1 ? "" : "s") : ""}.`;

        setStatus("parse-status", "done", summary);
        announce(summary);
    }

    url.addEventListener("input", () => {

        $("url-count").textContent = countText(url.value.length);

        if (url.value.length <= LIVE_LIMIT) {
            runParse();
        } else {
            clearParse();
            setStatus("parse-status", "empty", "Large input. Press Parse.");
        }
    });

    base.addEventListener("input", () => {
        if (url.value.length <= LIVE_LIMIT) {
            runParse();
        }
    });

    $("parse-run").addEventListener("click", runParse);

    $("parse-example").addEventListener("click", () => {
        url.value = EXAMPLES.parse;
        base.value = "";
        runParse();
    });

    $("copy-href").addEventListener("click", () => {
        if (parsedFor !== null) {
            copy(parsedHref, "Normalized URL");
        }
    });


    /* ---------- ENCODE / DECODE ---------- */

    const text = $("text");
    const opRadios = [...document.querySelectorAll("input[name='up-op']")];
    const keep = $("keep");
    let codecShown = null;

    const op = () =>
        opRadios.find((r) => r.checked).value;

    function applyOp() {

        $("text-hint").textContent =
            `${OPERATIONS[op()].hint} The limit is ${MAX_CODEC_CHARS.toLocaleString("en-US")} characters.`;

        $("keep-wrap").hidden = op() !== "percent-encode";
    }

    function clearCodec() {
        codecShown = null;
        $("codec-result").hidden = true;
        $("codec-output").textContent = "";
        $("codec-twice").hidden = true;
        clearError("codec", text);
    }

    function runCodec() {

        clearCodec();

        const value = text.value;
        $("text-count").textContent = countText(value.length);

        if (value === "") {
            setStatus("codec-status", "empty", "Enter text, or choose Load example.");
            return;
        }

        const which = op();
        let result;

        if (which === "percent-encode") {
            result = percentEncode(value, { keepSpecials: keep.checked });
        } else if (which === "form-encode") {
            result = formEncode(value);
        } else if (which === "percent-decode") {
            result = percentDecode(value);
        } else {
            result = percentDecode(value, { plusAsSpace: true });
        }

        if (!result.ok) {
            showError("codec", result.message, text);
            setStatus("codec-status", "invalid", "The text could not be converted.");
            announce(result.message);
            return;
        }

        codecShown = result.value;
        $("codec-output").textContent = result.value;
        $("codec-heading").textContent = `Result: ${OPERATIONS[which].label}`;

        const meta =
            `${countText(result.chars)} in, ${countText(result.outChars)} out, ${byteText(result.bytes)} as UTF-8.`;

        $("codec-meta").textContent = meta;
        $("codec-twice").hidden = !(result.stillEncoded && which.endsWith("decode"));
        $("codec-result").hidden = false;

        setStatus("codec-status", "done", "Converted.");
        announce(`Converted. ${meta}${result.stillEncoded && which.endsWith("decode") ? " The result still contains percent-encoding." : ""}`);
    }

    text.addEventListener("input", () => {

        $("text-count").textContent = countText(text.value.length);

        if (text.value.length <= LIVE_LIMIT) {
            runCodec();
        } else {
            clearCodec();
            setStatus("codec-status", "empty", "Large input. Press Convert.");
        }
    });

    for (const radio of opRadios) {
        radio.addEventListener("change", () => {
            applyOp();
            if (text.value.length <= LIVE_LIMIT) {
                runCodec();
            } else {
                clearCodec();
            }
        });
    }

    keep.addEventListener("change", () => {
        if (text.value.length <= LIVE_LIMIT) {
            runCodec();
        }
    });

    $("codec-run").addEventListener("click", runCodec);

    $("codec-example").addEventListener("click", () => {
        text.value = EXAMPLES.codec;
        runCodec();
    });

    $("decode-again").addEventListener("click", () => {
        if (codecShown !== null) {
            text.value = codecShown;
            opRadios.find((r) => r.value === (op().startsWith("form") ? "form-decode" : "percent-decode")).checked = true;
            applyOp();
            runCodec();
        }
    });

    $("copy-codec").addEventListener("click", () => {
        if (codecShown !== null) {
            copy(codecShown, "Result");
        }
    });


    /* ---------- BUILD ---------- */

    const rowsBox = $("rows");
    const styleRadios = [...document.querySelectorAll("input[name='up-style']")];
    let builtQuery = null;
    let builtFull = null;
    let rowSerial = 0;

    function addRow(name = "", value = "") {

        rowSerial++;

        const id = rowSerial;
        const row = el("div", null, "up-row");
        const n = el("div", null, "up-row__field");
        const nameLabel = el("label", "Name", "up-label");
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "up-line";
        nameInput.value = name;
        nameInput.id = `up-row-name-${id}`;
        nameLabel.htmlFor = nameInput.id;
        n.append(nameLabel, nameInput);

        const v = el("div", null, "up-row__field");
        const valueLabel = el("label", "Value", "up-label");
        const valueInput = document.createElement("input");
        valueInput.type = "text";
        valueInput.className = "up-line";
        valueInput.value = value;
        valueInput.id = `up-row-value-${id}`;
        valueLabel.htmlFor = valueInput.id;
        v.append(valueLabel, valueInput);

        for (const input of [nameInput, valueInput]) {
            input.spellcheck = false;
            input.autocomplete = "off";
            input.setAttribute("autocapitalize", "off");
            input.setAttribute("autocorrect", "off");
            input.addEventListener("input", runBuild);
        }

        const remove = el("button", "Remove", "calculator-form__button calculator-form__button--secondary up-button");
        remove.type = "button";
        remove.addEventListener("click", () => {
            row.remove();
            numberRows();
            runBuild();
            ($("add-row")).focus();
        });

        row.append(n, v, remove);
        rowsBox.append(row);
        numberRows();
    }

    function numberRows() {

        [...rowsBox.children].forEach((row, i) => {
            const [nameLabel, valueLabel] = row.querySelectorAll("label");
            nameLabel.textContent = `Name ${i + 1}`;
            valueLabel.textContent = `Value ${i + 1}`;
            row.querySelector("button").setAttribute("aria-label", `Remove parameter ${i + 1}`);
        });
    }

    function readRows() {
        return [...rowsBox.children].map((row) => {
            const inputs = row.querySelectorAll("input");
            return { name: inputs[0].value, value: inputs[1].value };
        });
    }

    function clearBuild() {
        builtQuery = null;
        builtFull = null;
        $("build-result").hidden = true;
        $("build-full-wrap").hidden = true;
        clearError("build", $("build-base"));
    }

    function runBuild() {

        clearBuild();

        const rows = readRows();
        const result = buildQuery(rows, styleRadios.find((r) => r.checked).value);

        if (!result.ok) {
            showError("build", result.message);
            setStatus("build-status", "invalid", "The query string could not be built.");
            announce(result.message);
            return;
        }

        if (result.query === "") {
            setStatus("build-status", "empty", "Add parameters to build a query string.");
            return;
        }

        builtQuery = result.query;
        $("build-output").textContent = result.query;
        $("build-result").hidden = false;

        let message = "Built.";

        if (result.blankSkipped) {
            message += ` ${result.blankSkipped} blank row${result.blankSkipped === 1 ? "" : "s"} skipped.`;
        }

        const baseText = $("build-base").value;

        if (baseText.trim() !== "") {

            const full = withQuery(baseText, result.query);

            if (!full.ok) {
                showError("build", full.message, $("build-base"));
                $("build-result").hidden = false;
            } else {
                builtFull = full.href;
                $("build-full").textContent = full.href;
                $("build-full-wrap").hidden = false;
            }
        }

        setStatus("build-status", "done", message);
        announce(message);
    }

    $("add-row").addEventListener("click", () => {

        if (rowsBox.children.length >= MAX_QUERY_ROWS) {
            announce(`The limit is ${MAX_QUERY_ROWS} parameters.`);
            return;
        }

        addRow();
        runBuild();
        rowsBox.lastElementChild.querySelector("input").focus();
    });

    for (const radio of styleRadios) {
        radio.addEventListener("change", runBuild);
    }

    $("build-base").addEventListener("input", runBuild);

    $("edit-run").addEventListener("click", () => {

        const query = $("edit").value;
        const rows = parseQuery(query);

        if (rows.length > MAX_QUERY_ROWS) {
            showError("build", `That query has ${rows.length} parameters. The limit is ${MAX_QUERY_ROWS}.`, $("edit"));
            return;
        }

        $("edit").removeAttribute("aria-invalid");
        rowsBox.replaceChildren();

        for (const row of rows) {
            addRow(row.name, row.value);
        }

        runBuild();
        announce(`${rows.length} parameter${rows.length === 1 ? "" : "s"} loaded from the query.`);
    });

    $("build-example").addEventListener("click", () => {
        rowsBox.replaceChildren();
        for (const row of EXAMPLES.build) {
            addRow(row.name, row.value);
        }
        runBuild();
    });

    $("copy-build").addEventListener("click", () => {
        if (builtQuery !== null) {
            copy(builtQuery, "Query string");
        }
    });

    $("copy-full").addEventListener("click", () => {
        if (builtFull !== null) {
            copy(builtFull, "Full URL");
        }
    });


    /* ---------- reset, mode switch ---------- */

    function resetAll() {

        url.value = "";
        base.value = "";
        text.value = "";
        keep.checked = false;
        $("edit").value = "";
        $("build-base").value = "";
        rowsBox.replaceChildren();
        modeRadios.find((r) => r.value === "parse").checked = true;
        opRadios.find((r) => r.value === "percent-encode").checked = true;
        styleRadios.find((r) => r.value === "percent").checked = true;
        $("url-count").textContent = countText(0);
        $("text-count").textContent = countText(0);

        clearParse();
        clearCodec();
        clearBuild();
        clearError("build", $("edit"), $("build-base"));

        setStatus("parse-status", "empty", "Paste a URL, or choose Load example.");
        setStatus("codec-status", "empty", "Enter text, or choose Load example.");
        setStatus("build-status", "empty", "Add parameters to build a query string.");

        applyOp();
        showMode();
        announce("Reset.");
        url.focus();
    }

    $("reset").addEventListener("click", resetAll);
    $("reset-codec").addEventListener("click", resetAll);
    $("reset-build").addEventListener("click", resetAll);

    /* focus stays on the radio, so the arrow keys keep cycling through the modes; Tab reaches the first field */
    for (const radio of modeRadios) {
        radio.addEventListener("change", () => {

            showMode();

            announce({
                parse: "Parse a URL selected.",
                codec: "Encode or decode text selected.",
                build: "Build a query string selected."
            }[currentMode()]);
        });
    }

    applyOp();
    showMode();

    panel.dataset.ready = "true";
}
