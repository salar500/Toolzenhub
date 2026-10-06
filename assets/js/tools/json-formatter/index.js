/* =========================================================
   ToolZen Hub
   JSON Formatter & Validator (Developer Tools)

   A text workspace: JSON goes in on the left, the formatted or
   minified result comes out on the right. The rules (strict
   JSON, error location, layout) are in json-engine.js; this file
   is the page around them.

   - Nothing rewrites what the visitor typed. Format and Minify
     write to the output box; the input is never changed except by
     Load example and Clear.
   - Explicit actions (Validate, Format, Minify, Ctrl/Cmd+Enter)
     show the full error with its place. While typing, a short pause
     refreshes only the one-line status, and only up to
     LIVE_MAX_CHARS, so a half-typed document never raises an alarm
     and a large paste is never parsed on every key.
   - Everything the visitor wrote is put on the page with
     textContent or as a textarea value, never as HTML.
   - Everything runs in the browser. There is no network request,
     no storage and no analytics call carrying the text.
========================================================= */

import {
    analyze,
    describeValid,
    describeNote,
    describeSize,
    EXAMPLE,
    MAX_CHARS,
    LIVE_MAX_CHARS,
    MAX_DEPTH
} from "./json-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related tool or article exists yet; a relation is added when one genuinely does. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("json-formatter").title;

const LIVE_DELAY_MS = 600;

const MAX_NOTES_SHOWN = 3;


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Developer Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Check that JSON is valid, see exactly where it breaks,
                        and format or minify it.
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
                            Your JSON is processed in your browser
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="jf-panel"
                    class="jf-workspace"
                    data-state="empty"
                >

                    <div class="jf-pane jf-pane--input">

                        <div class="jf-pane__head">

                            <label
                                for="jf-input"
                                class="jf-label"
                            >
                                JSON input
                            </label>

                            <span
                                id="jf-count"
                                class="jf-meta"
                            >0 characters</span>

                        </div>

                        <textarea
                            id="jf-input"
                            class="jf-text"
                            wrap="off"
                            rows="14"
                            spellcheck="false"
                            autocomplete="off"
                            autocapitalize="off"
                            autocorrect="off"
                            aria-describedby="jf-hint"
                        ></textarea>

                        <p
                            id="jf-hint"
                            class="jf-hint"
                        >
                            Paste or type JSON.
                            <button
                                type="button"
                                id="jf-example"
                                class="jf-link"
                            >Load an example</button>
                        </p>

                    </div>


                    <div class="jf-actions">

                        <button
                            type="button"
                            id="jf-format"
                            class="calculator-form__button jf-button"
                        >
                            Format
                        </button>

                        <button
                            type="button"
                            id="jf-minify"
                            class="calculator-form__button calculator-form__button--secondary jf-button"
                        >
                            Minify
                        </button>

                        <button
                            type="button"
                            id="jf-validate"
                            class="calculator-form__button calculator-form__button--secondary jf-button"
                        >
                            Validate
                        </button>

                        <button
                            type="button"
                            id="jf-copy"
                            class="calculator-form__button calculator-form__button--secondary jf-button"
                            disabled
                        >
                            Copy output
                        </button>

                        <button
                            type="button"
                            id="jf-clear"
                            class="calculator-form__button calculator-form__button--secondary jf-button"
                        >
                            Clear
                        </button>

                        <p class="jf-keys">
                            <kbd>Ctrl</kbd> or <kbd>⌘</kbd> + <kbd>Enter</kbd> formats.
                        </p>

                    </div>


                    <div class="jf-result">

                        <p
                            id="jf-status"
                            class="jf-status"
                        >
                            <span
                                id="jf-status-text"
                            >Paste JSON, or load an example.</span>
                        </p>

                        <div
                            id="jf-error"
                            class="jf-error"
                            hidden
                        >

                            <p class="jf-error__title">
                                Not valid JSON
                                <span
                                    id="jf-error-stale"
                                    class="jf-error__stale"
                                    hidden
                                >(checked before your last edit; press Validate to update)</span>
                            </p>

                            <p
                                id="jf-error-message"
                                class="jf-error__message"
                            ></p>

                            <p
                                id="jf-error-where"
                                class="jf-error__where"
                            ></p>

                            <pre
                                id="jf-error-context"
                                class="jf-error__context"
                                tabindex="0"
                                aria-label="The lines around the error, with a marker under the exact place"
                            ></pre>

                            <button
                                type="button"
                                id="jf-goto"
                                class="calculator-form__button calculator-form__button--secondary jf-goto"
                            >
                                Go to error
                            </button>

                        </div>

                        <ul
                            id="jf-notes"
                            class="jf-notes"
                            aria-label="Notes about this JSON"
                            hidden
                        ></ul>

                    </div>


                    <div class="jf-pane jf-pane--output">

                        <div class="jf-pane__head">

                            <label
                                for="jf-output"
                                class="jf-label"
                            >
                                Output
                            </label>

                            <span
                                id="jf-output-meta"
                                class="jf-meta"
                            ></span>

                        </div>

                        <textarea
                            id="jf-output"
                            class="jf-text"
                            wrap="off"
                            rows="14"
                            readonly
                            spellcheck="false"
                            placeholder="The formatted or minified JSON appears here."
                        ></textarea>

                    </div>

                </div>

            </section>

            <p
                id="jf-live"
                class="jf-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>
                        Paste your JSON into the input box, or load the example.
                    </li>
                    <li>
                        Press Format to lay it out with two-space indentation,
                        Minify to remove every unneeded space, or Validate to
                        only check it.
                    </li>
                    <li>
                        If it is not valid, the message names the line and
                        column, shows the surrounding lines and marks the spot.
                        Go to error jumps there in the input box. Fix it and
                        press the button again.
                    </li>
                    <li>
                        Copy output copies the result. Your input is never
                        changed by Format or Minify.
                    </li>
                </ol>

            </section>


            <!-- STRICT JSON -->

            <section class="calculator-info">

                <h2>
                    What Counts as Valid JSON
                </h2>

                <p>
                    This tool checks <strong>strict JSON</strong>, the standard
                    that APIs, configuration files and most programming
                    languages read. It is stricter than a JavaScript object. It
                    rejects, and points to:
                </p>

                <ul>
                    <li>trailing commas, such as <code>[1, 2,]</code></li>
                    <li>single-quoted strings and unquoted property names</li>
                    <li>comments</li>
                    <li><code>undefined</code>, <code>NaN</code> and <code>Infinity</code></li>
                    <li>text that runs on after the value, such as two objects in a row</li>
                </ul>

                <p>
                    The value at the top can be any JSON value, not only an
                    object or array: <code>"text"</code>, <code>42</code>,
                    <code>true</code> and <code>null</code> are valid on their
                    own.
                </p>

                <p>
                    It does not repair anything or guess what you meant. The
                    answer is the same every time.
                </p>

            </section>


            <!-- WHAT IT CHANGES -->

            <section class="calculator-info">

                <h2>
                    What Format and Minify Change
                </h2>

                <p>
                    Only the spaces and line breaks between values. Numbers and
                    text are copied exactly as you wrote them, so
                    <code>1.0</code> stays <code>1.0</code>, a long number is
                    not rounded, escapes such as <code>\\u00e9</code> are not
                    rewritten, and keys keep their order.
                </p>

                <p>
                    Two things are valid JSON but worth knowing, so they are
                    shown as notes rather than errors: an object that repeats a
                    key (most parsers keep only the last value), and an integer
                    with more than 15 digits, which JavaScript would round when
                    it reads it. The tool checks the syntax of JSON, not its
                    meaning, so it does not validate against a schema.
                </p>

            </section>


            <!-- LIMITS -->

            <section class="calculator-info">

                <h2>
                    Size Limits
                </h2>

                <p>
                    The tool works on up to ${describeSize(MAX_CHARS)}, nested
                    up to ${MAX_DEPTH} levels. While you type, text up to
                    ${describeSize(LIVE_MAX_CHARS)} is checked automatically
                    after a short pause; larger text is checked when you press
                    a button. Very large documents are better handled by a
                    command-line tool.
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>Reading an API response or a webhook payload that arrives on one line.</li>
                    <li>Checking a configuration file before you deploy it.</li>
                    <li>Checking JSON that an AI assistant or a log gave you before you use it.</li>
                    <li>Minifying JSON to send or store it compactly.</li>
                </ul>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is my JSON sent anywhere?
                    </summary>
                    <p>
                        No. Checking, formatting and minifying all run in your
                        browser, and the text is not uploaded or stored by
                        ToolZen Hub. Reloading the page clears it.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is my JSON rejected when JavaScript accepts it?
                    </summary>
                    <p>
                        A JavaScript object literal allows things JSON does not:
                        single quotes, unquoted keys, trailing commas and
                        comments. JSON is a stricter text format, and other
                        programs that read it will reject those too.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it fix invalid JSON?
                    </summary>
                    <p>
                        No. It tells you what is wrong and where, and leaves the
                        change to you, so it never guesses at what you meant.
                    </p>
                </details>

                <details>
                    <summary>
                        What does "more than 15 digits" mean?
                    </summary>
                    <p>
                        JavaScript stores numbers as 64-bit floating point, so
                        integers beyond 9,007,199,254,740,991 can be rounded
                        when a program reads them. The tool keeps the number as
                        you wrote it, and the note is a reminder that a
                        JavaScript reader would not. IDs of that size are often
                        safer as strings.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it check a JSON Schema?
                    </summary>
                    <p>
                        No. It checks that the text is well-formed JSON, not
                        that its fields and types match a schema.
                    </p>
                </details>

            </section>

        </div>
    `;
}


/* =========================================================
   RENDER
========================================================= */

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

    const panel = document.querySelector("#jf-panel");

    if (!panel) {
        return;
    }

    const input = document.querySelector("#jf-input");
    const output = document.querySelector("#jf-output");
    const count = document.querySelector("#jf-count");
    const hint = document.querySelector("#jf-hint");
    const statusText = document.querySelector("#jf-status-text");
    const errorBox = document.querySelector("#jf-error");
    const errorStale = document.querySelector("#jf-error-stale");
    const errorMessage = document.querySelector("#jf-error-message");
    const errorWhere = document.querySelector("#jf-error-where");
    const errorContext = document.querySelector("#jf-error-context");
    const notesBox = document.querySelector("#jf-notes");
    const outputMeta = document.querySelector("#jf-output-meta");
    const live = document.querySelector("#jf-live");

    const buttons = {
        format: document.querySelector("#jf-format"),
        minify: document.querySelector("#jf-minify"),
        validate: document.querySelector("#jf-validate"),
        copy: document.querySelector("#jf-copy"),
        clear: document.querySelector("#jf-clear"),
        example: document.querySelector("#jf-example"),
        goto: document.querySelector("#jf-goto")
    };

    let liveTimer = null;
    let announceTimer = null;

    /* the error the panel is showing, so Go to error knows where to go */
    let shownError = null;


    /* ---------- small helpers ---------- */

    /* polite announcement; cleared first so the same text is read again */
    function announce(message) {

        clearTimeout(announceTimer);

        live.textContent = "";

        announceTimer = setTimeout(() => {
            live.textContent = message;
        }, 50);

    }

    function setStatus(kind, text) {

        panel.dataset.state = kind;

        statusText.textContent = text;

    }

    function hideError() {

        errorBox.hidden = true;
        errorStale.hidden = true;
        errorBox.dataset.stale = "false";

        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
        input.setAttribute("aria-describedby", "jf-hint");

        shownError = null;

    }

    function showNotes(result, text) {

        notesBox.replaceChildren();

        if (!result.noteTotal) {
            notesBox.hidden = true;
            return;
        }

        const shown = result.notes.slice(0, MAX_NOTES_SHOWN);

        for (const note of shown) {

            const item = document.createElement("li");

            item.textContent = describeNote(text, note);

            notesBox.append(item);

        }

        const more = result.noteTotal - shown.length;

        if (more > 0) {

            const item = document.createElement("li");

            item.textContent = `and ${more} more`;

            notesBox.append(item);

        }

        notesBox.hidden = false;

    }

    function validSummary(result, text) {

        return `Valid JSON · ${describeValid(result)} · ${describeSize(text.length)}`;

    }

    function whereText(error) {

        return `Line ${error.line}, column ${error.column} (character ${error.offset + 1})`;

    }

    function showError(error) {

        shownError = error;

        errorMessage.textContent = error.message;
        errorWhere.textContent = whereText(error);
        errorContext.textContent = error.context;

        errorBox.dataset.stale = "false";
        errorStale.hidden = true;
        errorBox.hidden = false;

        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", "jf-hint jf-error-message jf-error-where");

    }

    function clearOutput() {

        output.value = "";
        outputMeta.textContent = "";
        buttons.copy.disabled = true;

    }

    function refreshInputState() {

        const length = input.value.length;

        count.textContent = describeSize(length);

        /* the example would overwrite what is there, so it is offered only on an empty box */
        buttons.example.hidden = length > 0;

    }


    /* ---------- the explicit actions ---------- */

    /* mode: "check" | "format" | "minify" */
    function run(mode) {

        clearTimeout(liveTimer);

        const text = input.value;

        const result = analyze(text, mode);

        if (result.state === "empty") {

            hideError();
            notesBox.hidden = true;
            clearOutput();

            const message = "There is nothing to check yet. Paste or type some JSON first.";

            setStatus("empty", message);
            announce(message);

            input.focus();

            return;

        }

        if (result.state === "too-large") {

            hideError();
            notesBox.hidden = true;
            clearOutput();

            const message = `Too large: this tool works on up to ${describeSize(result.limit)}, and the input has ${describeSize(text.length)}.`;

            setStatus("invalid", message);
            announce(message);

            return;

        }

        if (result.state === "invalid") {

            clearOutput();
            notesBox.hidden = true;

            showError(result.error);

            const message = `Not valid JSON. Line ${result.error.line}, column ${result.error.column}.`;

            setStatus("invalid", message);
            announce(`${message} ${result.error.message}`);

            return;

        }

        /* valid */

        hideError();

        showNotes(result, text);

        if (mode === "check") {

            const message = validSummary(result, text);

            setStatus("valid", message);
            announce(message);

            return;

        }

        output.value = result.output;

        outputMeta.textContent = `${mode === "format" ? "Formatted, 2 spaces" : "Minified"} · ${describeSize(result.output.length)}`;

        buttons.copy.disabled = false;

        const verb = mode === "format" ? "Formatted" : "Minified";

        setStatus("valid", `${validSummary(result, text)} · ${verb}`);
        announce(`Valid JSON. ${verb}.`);

    }

    function loadExample() {

        input.value = EXAMPLE;

        refreshInputState();

        clearOutput();
        hideError();

        const result = analyze(EXAMPLE, "check");

        showNotes(result, EXAMPLE);

        setStatus("valid", validSummary(result, EXAMPLE));

        announce("Example loaded.");

        /* the Load example button has just been hidden; keep focus on something useful */
        buttons.format.focus();

    }

    function clearAll() {

        clearTimeout(liveTimer);

        input.value = "";

        refreshInputState();

        clearOutput();
        hideError();

        notesBox.replaceChildren();
        notesBox.hidden = true;

        setStatus("empty", "Paste JSON, or load an example.");

        announce("Cleared.");

        input.focus();

    }

    /* the copy is always the user's click; the result says what really happened */
    async function copyOutput() {

        const text = output.value;

        if (!text) {
            return;
        }

        let copied = false;

        try {

            await navigator.clipboard.writeText(text);

            copied = true;

        } catch (problem) {

            try {

                output.focus();
                output.select();

                copied = document.execCommand("copy");

                output.setSelectionRange(0, 0);

            } catch (second) {

                copied = false;

            }

        }

        const message = copied
            ? "Copied to the clipboard."
            : "Could not copy automatically. Select the output and copy it yourself.";

        outputMeta.textContent = message;

        announce(message);

        if (copied) {
            buttons.copy.focus();
        }

    }

    /* selects the error's character in the input and scrolls it into view */
    function goToError() {

        if (!shownError) {
            return;
        }

        const { offset } = shownError;

        const end = Math.min(input.value.length, offset + 1);

        input.focus();

        input.setSelectionRange(offset, Math.max(offset, end));

        reveal(offset);

    }

    /* a textarea does not always scroll a programmatic selection into view; do it from the line and column */
    function reveal(offset) {

        const before = input.value.slice(0, offset);

        const line = before.split("\n").length - 1;

        const style = getComputedStyle(input);

        const lineHeight = parseFloat(style.lineHeight) || 20;

        input.scrollTop = Math.max(0, line * lineHeight - input.clientHeight / 2);

        const lineText = before.slice(before.lastIndexOf("\n") + 1);

        const canvas = document.createElement("canvas").getContext("2d");

        canvas.font = `${style.fontSize} ${style.fontFamily}`;

        const x = canvas.measureText(lineText.replace(/\t/g, "    ")).width;

        input.scrollLeft = Math.max(0, x - input.clientWidth / 2);

    }


    /* ---------- typing ---------- */

    function onInput() {

        refreshInputState();

        /* what the output and the error panel show is from before this edit */
        if (!errorBox.hidden) {
            errorBox.dataset.stale = "true";
            errorStale.hidden = false;
        }

        if (output.value) {
            outputMeta.textContent = "Input changed since this was produced";
        }

        clearTimeout(liveTimer);

        liveTimer = setTimeout(liveCheck, LIVE_DELAY_MS);

    }

    /* only the one-line status, never the error panel and never an announcement */
    function liveCheck() {

        const text = input.value;

        if (text.trim() === "") {

            hideError();
            notesBox.hidden = true;

            setStatus("empty", "Paste JSON, or load an example.");

            return;

        }

        if (text.length > LIVE_MAX_CHARS) {

            setStatus(
                "unchecked",
                `Large input (${describeSize(text.length)}): press Validate, Format or Minify to check it.`
            );

            return;

        }

        const result = analyze(text, "check");

        if (result.state === "valid") {

            hideError();

            showNotes(result, text);

            setStatus("valid", validSummary(result, text));

            return;

        }

        if (result.state === "invalid") {

            notesBox.hidden = true;

            setStatus(
                "invalid",
                `Not valid JSON · line ${result.error.line}, column ${result.error.column}: ${result.error.message}`
            );

        }

    }


    /* ---------- events ---------- */

    buttons.format.addEventListener("click", () => run("format"));
    buttons.minify.addEventListener("click", () => run("minify"));
    buttons.validate.addEventListener("click", () => run("check"));
    buttons.copy.addEventListener("click", copyOutput);
    buttons.clear.addEventListener("click", clearAll);
    buttons.example.addEventListener("click", loadExample);
    buttons.goto.addEventListener("click", goToError);

    input.addEventListener("input", onInput);

    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {

            event.preventDefault();

            run("format");

        }

    });

    refreshInputState();

    /* the page's script has run and the buttons work (tests wait for this) */
    panel.dataset.ready = "true";

}
