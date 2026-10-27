/* =========================================================
   ToolZen Hub
   JSON to CSV / CSV to JSON (Developer Tools)

   Two directions in one page. The rules are in json-csv-engine.js;
   this file is the page around them.

   Behaviour that matters:
   - Everything is converted in your browser and shown with
     textContent only. Nothing is uploaded, stored or put in the
     address of the page.
   - Nested JSON is never flattened silently, and text that a
     spreadsheet would run as a formula is protected by default.
   - Small inputs are converted as you type; a large one waits for
     the button.
========================================================= */

import {
    jsonToCsv,
    csvToJson,
    DELIMITERS,
    DELIMITER_NAMES,
    MAX_CHARS,
    MAX_ROWS,
    MAX_COLUMNS,
    EXAMPLE_JSON,
    EXAMPLE_CSV
} from "./json-csv-engine.js";

import {
    getToolById
} from "../../data/tools.js";


export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const TITLE =
    getToolById("json-csv-converter").title;

const JSON_TOOL =
    getToolById("json-formatter");

const LIVE_LIMIT = 20000;

const fmt = (n) => n.toLocaleString("en-US");


export function markup() {

    const delimiterOptions = Object.entries(DELIMITERS)
        .map(([name, value]) => `<option value="${value === "\t" ? "tab" : value}">${DELIMITER_NAMES[name][0].toUpperCase()}${DELIMITER_NAMES[name].slice(1)}</option>`)
        .join("");

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
                        Turn a JSON array of objects into CSV, or CSV into JSON,
                        with the rules stated: nested values are never flattened
                        silently and spreadsheet formulas are neutralized.
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
                            Converted in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <section class="calculator-section">

                <div id="jc-panel" class="jc-workspace" data-state="empty">

                    <fieldset class="jc-versions">
                        <legend class="jc-label">Direction</legend>
                        <div class="jc-choices">
                            <label class="jc-choice">
                                <input type="radio" name="jc-mode" value="json-csv" checked>
                                <span><strong>JSON to CSV</strong><small>an array of objects becomes a table</small></span>
                            </label>
                            <label class="jc-choice">
                                <input type="radio" name="jc-mode" value="csv-json">
                                <span><strong>CSV to JSON</strong><small>rows become objects or arrays</small></span>
                            </label>
                        </div>
                    </fieldset>

                    <div class="jc-field">
                        <div class="jc-field__head">
                            <label for="jc-input" class="jc-label" id="jc-input-label">JSON</label>
                            <span id="jc-input-meta" class="jc-meta">0 characters</span>
                        </div>
                        <textarea
                            id="jc-input"
                            class="jc-input"
                            rows="9"
                            spellcheck="false"
                            autocomplete="off"
                            autocapitalize="off"
                            autocorrect="off"
                            aria-describedby="jc-input-meta"
                        ></textarea>
                    </div>

                    <p class="jc-linkline">
                        <button type="button" id="jc-example" class="jc-link">Load example</button>
                    </p>

                    <fieldset class="jc-options">
                        <legend class="jc-label">Options</legend>

                        <div class="jc-opts">

                            <label class="jc-opt-select" for="jc-delimiter">
                                <span>Delimiter</span>
                                <select id="jc-delimiter" class="jc-select">${delimiterOptions}</select>
                            </label>

                            <span id="jc-opts-json">
                                <label class="jc-check"><input type="checkbox" id="jc-nested"><span>Write nested values as JSON text</span></label>
                                <label class="jc-check"><input type="checkbox" id="jc-guard" checked><span>Protect against spreadsheet formulas</span></label>
                                <label class="jc-opt-select" for="jc-eol">
                                    <span>Line ends</span>
                                    <select id="jc-eol" class="jc-select">
                                        <option value="lf">LF</option>
                                        <option value="crlf">CRLF (RFC 4180)</option>
                                    </select>
                                </label>
                            </span>

                            <span id="jc-opts-csv" hidden>
                                <label class="jc-check"><input type="checkbox" id="jc-header" checked><span>First row is a header</span></label>
                                <label class="jc-check"><input type="checkbox" id="jc-convert"><span>Convert numbers and true/false</span></label>
                            </span>

                        </div>
                    </fieldset>

                    <div class="jc-actions">
                        <button type="button" id="jc-convert-button" class="calculator-form__button jc-button">Convert</button>
                        <button type="button" id="jc-copy" class="calculator-form__button calculator-form__button--secondary jc-button" disabled>Copy result</button>
                        <button type="button" id="jc-reset" class="calculator-form__button calculator-form__button--secondary jc-button">Reset</button>
                    </div>

                    <p id="jc-status" class="jc-status" data-state="empty" role="status">Paste JSON to convert it.</p>

                    <div id="jc-result" hidden>
                        <ul id="jc-notes" class="jc-notes"></ul>
                        <h2 class="jc-result-title" id="jc-output-title">Result</h2>
                        <pre id="jc-output" class="jc-output" tabindex="0" role="region" aria-labelledby="jc-output-title"></pre>
                    </div>

                </div>

            </section>

            <p id="jc-live" class="jc-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Choose the direction, then paste your data or press Load example.</li>
                    <li>Choose the delimiter and options. Small inputs convert as you type; a large one waits for Convert.</li>
                    <li>Read the notes under the status: they say what was changed, skipped or protected.</li>
                    <li>Use Copy result. Check the data first with the <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a> if the JSON is refused.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>The Rules This Tool Follows</h2>
                <ul>
                    <li><strong>JSON to CSV</strong> needs an array of objects. Columns are the keys in the order they first appear; a missing key is an empty cell. Numbers are written exactly as in your JSON, with no rounding.</li>
                    <li><strong>Nested values</strong> (objects and arrays) cannot be a CSV cell. By default the tool stops and names the row and column. If you tick "Write nested values as JSON text", the cell holds that value as JSON text. Nothing is flattened into extra columns.</li>
                    <li><strong>null</strong> is written as an empty cell. CSV cannot tell null from an empty string, and the notes count how many were written that way.</li>
                    <li><strong>Formula protection</strong> (on by default): a text cell that starts with =, +, -, @, a tab or a line break is written with a ' in front, so Excel, Sheets and LibreOffice show it as text instead of running it. Real numbers are not changed. Untick it only when you need the cell byte for byte, and open the file with care.</li>
                    <li><strong>CSV to JSON</strong> follows RFC 4180: fields in double quotes may hold the delimiter, line breaks and "" for a quote. A byte order mark is removed and empty lines are skipped. Every row must have the same number of fields as the first, or the tool says which row does not.</li>
                    <li>Every CSV value stays a string unless you tick "Convert numbers and true/false". Then only exact JSON numbers (no leading zeros, no plus sign, at most 15 digits) and the words true and false are converted; "007" and "+5" stay text. An empty field stays an empty string, never null.</li>
                    <li>Limits: ${fmt(MAX_CHARS)} characters, ${fmt(MAX_ROWS)} rows and ${fmt(MAX_COLUMNS)} columns.</li>
                </ul>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Is my data sent anywhere?</summary>
                    <p>No. It is converted in your browser. Nothing is uploaded, stored or logged, and the address of this page does not change.</p>
                </details>
                <details>
                    <summary>Why did the tool add a ' in front of some cells?</summary>
                    <p>Spreadsheets treat text starting with = + - or @ as a formula, which can run commands or leak data (CSV injection). The ' makes them show as text. Untick the formula protection if you do not want it.</p>
                </details>
                <details>
                    <summary>Why was my JSON refused?</summary>
                    <p>It must be a non-empty array of objects. A single object, an array of numbers or an array that holds arrays has no obvious table shape. Nested values are refused unless you choose to write them as JSON text.</p>
                </details>
                <details>
                    <summary>Why are the values strings after CSV to JSON?</summary>
                    <p>CSV has no types, so nothing is guessed by default. Tick "Convert numbers and true/false" if you want that, knowing that codes such as 007 are kept as text.</p>
                </details>
                <details>
                    <summary>Does it open Excel files?</summary>
                    <p>No. It reads and writes CSV text only. Export from your spreadsheet as CSV first.</p>
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

    const panel = document.querySelector("#jc-panel");

    if (!panel) {
        return;
    }

    const $ = (id) => document.querySelector(`#jc-${id}`);

    const input = $("input");
    const output = $("output");
    const status = $("status");
    const live = $("live");
    const copyButton = $("copy");

    let resultText = "";
    let timer = null;
    let announceTimer = null;

    const mode = () =>
        document.querySelector("input[name='jc-mode']:checked").value;

    const delimiterValue = () =>
        $("delimiter").value === "tab" ? "\t" : $("delimiter").value;

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

    function updateMeta() {
        $("input-meta").textContent = `${fmt(input.value.length)} ${input.value.length === 1 ? "character" : "characters"}`;
    }

    function clearResult() {
        resultText = "";
        output.textContent = "";
        $("notes").replaceChildren();
        $("result").hidden = true;
        copyButton.disabled = true;
    }

    function showMode() {

        const json = mode() === "json-csv";

        $("opts-json").hidden = !json;
        $("opts-csv").hidden = json;
        $("input-label").textContent = json ? "JSON" : "CSV";
        $("output-title").textContent = json ? "CSV result" : "JSON result";

        if (input.value === "") {
            setStatus("empty", json ? "Paste JSON to convert it." : "Paste CSV to convert it.");
        }
    }

    function run() {

        clearTimeout(timer);

        const json = mode() === "json-csv";

        const result = json
            ? jsonToCsv(input.value, {
                delimiter: delimiterValue(),
                nested: $("nested").checked ? "json" : "refuse",
                guard: $("guard").checked,
                eol: $("eol").value === "crlf" ? "\r\n" : "\n"
            })
            : csvToJson(input.value, {
                delimiter: delimiterValue(),
                header: $("header").checked,
                convert: $("convert").checked
            });

        clearResult();

        if (!result.ok) {

            if (result.state === "empty") {
                setStatus("empty", result.message);
                return;
            }

            setStatus("invalid", result.message);
            announce(result.message);
            return;
        }

        resultText = json ? result.csv : result.json;
        output.textContent = resultText;

        for (const line of result.notes) {
            const li = document.createElement("li");
            li.textContent = line;
            $("notes").append(li);
        }

        $("result").hidden = false;
        copyButton.disabled = false;

        const message = `Converted ${fmt(result.rows)} ${result.rows === 1 ? "row" : "rows"} with ${fmt(result.columns)} ${result.columns === 1 ? "column" : "columns"}.`;

        setStatus("done", message);
        announce(message);
    }

    function schedule() {

        updateMeta();

        clearTimeout(timer);

        if (input.value.length <= LIVE_LIMIT) {
            timer = setTimeout(run, 250);
        } else {
            clearResult();
            setStatus("empty", "Press Convert to convert this input.");
        }
    }

    function optionChanged() {
        if (input.value !== "" && (resultText !== "" || input.value.length <= LIVE_LIMIT)) {
            run();
        }
    }

    function loadExample() {
        input.value = mode() === "json-csv" ? EXAMPLE_JSON : EXAMPLE_CSV;
        updateMeta();
        run();
    }

    function reset() {
        clearTimeout(timer);
        document.querySelector("input[name='jc-mode'][value='json-csv']").checked = true;
        input.value = "";
        $("delimiter").value = ",";
        $("nested").checked = false;
        $("guard").checked = true;
        $("eol").value = "lf";
        $("header").checked = true;
        $("convert").checked = false;
        clearResult();
        updateMeta();
        showMode();
        setStatus("empty", "Paste JSON to convert it.");
        announce("Reset.");
    }

    for (const radio of document.querySelectorAll("input[name='jc-mode']")) {
        radio.addEventListener("change", () => {
            showMode();
            clearResult();
            if (input.value !== "") {
                optionChanged();
            }
        });
    }

    input.addEventListener("input", schedule);

    for (const id of ["delimiter", "nested", "guard", "eol", "header", "convert"]) {
        $(id).addEventListener("change", optionChanged);
    }

    $("convert-button").addEventListener("click", run);
    copyButton.addEventListener("click", () => copy(resultText, "Result"));
    $("reset").addEventListener("click", reset);
    $("example").addEventListener("click", loadExample);

    showMode();
    updateMeta();

    panel.dataset.ready = "true";
}
