/* =========================================================
   ToolZen Hub
   Base64 Encoder & Decoder (Developer Tools)

   Encode text to standard Base64, or decode standard Base64 back
   to text. All of the rules (the alphabet, padding, whitespace,
   the last-character check, UTF-8 and the limits) are in
   base64-engine.js; this file is the page around them and does
   not repeat any of them.

   Behaviour that matters:
   - Nothing converts while typing or pasting. The result changes
     only when the visitor presses Encode / Decode or Ctrl/Cmd+Enter
     in the box, and the clipboard is never read.
   - Everything from the input and the result is put on the page
     with textContent, never as HTML.
   - Copy copies exactly the result that is shown, and only when
     the visitor presses its button.
   - No network request, no storage of any kind, no URL or title
     change and no logging of the input.
========================================================= */

import {
    encodeText,
    decodeBase64,
    MAX_ENCODE_BYTES,
    MAX_DECODE_CHARS
} from "./base64-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the tool links the JWT Decoder and the JSON Formatter in its text. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("base64-encoder-decoder").title;

const JWT_TOOL =
    getToolById("jwt-decoder");

const JSON_TOOL =
    getToolById("json-formatter");

const EXAMPLES = {
    encode: "Hello, World!",
    decode: "SGVsbG8sIFdvcmxkIQ=="
};

const MODES = {
    encode: {
        label: "Text to encode",
        action: "Encode",
        hint: `Type or paste text. It is converted to UTF-8 bytes and then to Base64. The limit is ${MAX_ENCODE_BYTES.toLocaleString("en-US")} bytes. Then press Encode.`
    },
    decode: {
        label: "Base64 to decode",
        action: "Decode",
        hint: `Paste Base64 in the chosen alphabet (standard: A-Z, a-z, 0-9, + and /; URL-safe: - and _ instead of + and /; with = at the end). Spaces and line breaks are ignored and missing padding is accepted, but the check is strict otherwise: see how this tool reads your input below. The limit is ${MAX_DECODE_CHARS.toLocaleString("en-US")} characters. Then press Decode.`
    }
};

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;

const byteText = (n) =>
    `${n.toLocaleString("en-US")} byte${n === 1 ? "" : "s"}`;


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
                        Encode text to Base64 or decode Base64 back to text,
                        with full UTF-8 support and a specific message when
                        the input is not valid Base64.
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


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="b64-panel"
                    class="b64-workspace"
                    data-state="empty"
                >

                    <p class="b64-note">
                        <strong>Base64 is an encoding, not encryption.</strong>
                        Anyone can decode it, so it hides nothing.
                    </p>

                    <fieldset class="b64-mode">

                        <legend class="b64-label">
                            Direction
                        </legend>

                        <div class="b64-mode__options">

                            <label class="b64-mode__option">
                                <input
                                    type="radio"
                                    name="b64-mode"
                                    id="b64-mode-encode"
                                    value="encode"
                                    checked
                                >
                                <span>Encode text to Base64</span>
                            </label>

                            <label class="b64-mode__option">
                                <input
                                    type="radio"
                                    name="b64-mode"
                                    id="b64-mode-decode"
                                    value="decode"
                                >
                                <span>Decode Base64 to text</span>
                            </label>

                        </div>

                    </fieldset>

                    <fieldset class="b64-mode">

                        <legend class="b64-label">
                            Alphabet
                        </legend>

                        <div class="b64-mode__options">

                            <label class="b64-mode__option">
                                <input
                                    type="radio"
                                    name="b64-alphabet"
                                    id="b64-alphabet-standard"
                                    value="standard"
                                    checked
                                >
                                <span>Standard (+ and /)</span>
                            </label>

                            <label class="b64-mode__option">
                                <input
                                    type="radio"
                                    name="b64-alphabet"
                                    id="b64-alphabet-url"
                                    value="url"
                                >
                                <span>URL-safe (- and _)</span>
                            </label>

                        </div>

                        <label class="b64-mode__option" id="b64-padding-wrap" hidden>
                            <input type="checkbox" id="b64-padding">
                            <span>Keep = padding when encoding</span>
                        </label>

                    </fieldset>

                    <div class="b64-pane">

                        <div class="b64-pane__head">

                            <label
                                for="b64-input"
                                id="b64-input-label"
                                class="b64-label"
                            >
                                ${MODES.encode.label}
                            </label>

                            <span
                                id="b64-count"
                                class="b64-meta"
                            >0 characters</span>

                        </div>

                        <textarea
                            id="b64-input"
                            class="b64-input"
                            rows="8"
                            spellcheck="false"
                            autocomplete="off"
                            autocapitalize="off"
                            autocorrect="off"
                            aria-describedby="b64-hint"
                        ></textarea>

                        <p
                            id="b64-hint"
                            class="b64-hint"
                        >${MODES.encode.hint}</p>

                    </div>

                    <div class="b64-actions">

                        <button
                            type="button"
                            id="b64-run"
                            class="calculator-form__button b64-button"
                        >
                            ${MODES.encode.action}
                        </button>

                        <button
                            type="button"
                            id="b64-example"
                            class="calculator-form__button calculator-form__button--secondary b64-button"
                        >
                            Load example
                        </button>

                        <button
                            type="button"
                            id="b64-reset"
                            class="calculator-form__button calculator-form__button--secondary b64-button"
                        >
                            Reset
                        </button>

                    </div>

                    <div class="b64-result">

                        <p
                            id="b64-status"
                            class="b64-status"
                        >
                            <span
                                id="b64-status-text"
                            >Enter text, or choose Load example, then press Encode.</span>
                        </p>

                        <p
                            id="b64-stale"
                            class="b64-stale"
                            hidden
                        >The text in the box changed after this was shown. Press the button to update.</p>

                        <div
                            id="b64-error"
                            class="b64-error"
                            hidden
                        >

                            <p class="b64-error__title">
                                This could not be converted
                            </p>

                            <p
                                id="b64-error-message"
                                class="b64-error__message"
                            ></p>

                        </div>

                    </div>

                    <div
                        id="b64-output-wrap"
                        class="b64-output-wrap"
                        hidden
                    >

                        <div class="b64-pane__head">

                            <h2
                                id="b64-output-heading"
                                class="b64-output-heading"
                            >
                                Result
                            </h2>

                            <button
                                type="button"
                                id="b64-copy"
                                class="calculator-form__button calculator-form__button--secondary b64-copy"
                            >Copy result</button>

                        </div>

                        <pre
                            id="b64-output"
                            class="b64-output"
                            tabindex="0"
                            aria-labelledby="b64-output-heading"
                        ></pre>

                        <p
                            id="b64-meta"
                            class="b64-meta-line"
                        ></p>

                        <ul
                            id="b64-notes"
                            class="b64-notes"
                        ></ul>

                    </div>

                </div>

            </section>

            <p
                id="b64-live"
                class="b64-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>Choose a direction: encode text to Base64, or decode Base64 to text.</li>
                    <li>Type or paste into the box, or press Load example.</li>
                    <li>Press Encode or Decode, or press Ctrl+Enter (Cmd+Enter on a Mac) inside the box.</li>
                    <li>Read the result, or the message that says what is wrong and where. Press Copy result to copy it.</li>
                </ol>

            </section>


            <!-- WHAT IT IS -->

            <section class="calculator-info">

                <h2>
                    What Base64 Is and Is Not
                </h2>

                <p>
                    Base64 writes any bytes using 64 safe characters (A-Z, a-z,
                    0-9, + and /), so binary or non-ASCII data can travel
                    through text-only places such as e-mail, headers,
                    configuration files and data URIs. Every three bytes become
                    four characters, and <code>=</code> pads the end when the
                    length is not a multiple of three.
                </p>

                <p>
                    It is <strong>not encryption</strong>. It uses no key and
                    anyone can reverse it, so never treat Base64 as a way to
                    protect a password or a token. The parts of a token are
                    Base64 text: the
                    <a href="${JWT_TOOL.href}">${JWT_TOOL.title}</a>
                    reads them for you (a JWT uses the URL-safe alphabet without
                    padding, which this tool can also read and write), and the
                    <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a>
                    helps once the text inside is JSON.
                </p>

            </section>


            <!-- HOW IT READS INPUT -->

            <section class="calculator-info">

                <h2>
                    How This Tool Reads Your Input
                </h2>

                <p>
                    <strong>Encoding</strong> turns your text into UTF-8 bytes
                    exactly as typed (no trimming) and writes standard Base64
                    with <code>=</code> padding and no line breaks (or the
                    URL-safe alphabet, if you choose it). Accented
                    letters, other scripts and emoji are handled as UTF-8.
                </p>

                <p>
                    <strong>Decoding</strong> is strict about what it accepts
                    and says why when it refuses:
                </p>

                <ul>
                    <li>Only ASCII space, tab, carriage return and line feed are ignored, anywhere. Any other character that is not in the alphabet is refused with its position.</li>
                    <li>Missing padding is accepted. Padding that is present must be right, and <code>=</code> may only appear at the end, at most twice.</li>
                    <li>A single leftover character cannot encode a byte, so that is refused as probably cut short.</li>
                    <li>The unused bits of the last character must be zero, as an encoder writes them. <code>QR==</code> is refused even though some decoders read it as <code>A</code>: a stray bit usually means a typo or a truncated value.</li>
                    <li>The result must be valid UTF-8 text. Other bytes are reported as binary data and are not shown as garbled characters.</li>
                    <li>In the standard alphabet, - and _ belong to base64url, a different alphabet, and are refused with that hint.</li>
                </ul>

                <p>
                    <strong>URL-safe (base64url, RFC 4648 section 5)</strong> writes
                    - and _ where standard Base64 writes + and /, and usually leaves
                    the <code>=</code> padding off. Choose it under Alphabet. Encoding
                    omits the padding unless you tick "Keep = padding". Decoding accepts
                    the padding either way, but padding that is present must be correct,
                    and a + or / is refused with a hint to switch back. The same strict
                    rules apply to the last character and to UTF-8.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is my text sent anywhere?
                    </summary>
                    <p>
                        No. The conversion runs in your browser and nothing is
                        uploaded, stored or logged.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does a decoder elsewhere accept something this one refuses?
                    </summary>
                    <p>
                        Many decoders are lenient: they accept stray bits in the
                        last character, skip unknown characters or guess at
                        padding. This tool is strict so that a typo or a cut-off
                        value is reported instead of turning into slightly wrong
                        text.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does decoding say my data is not text?
                    </summary>
                    <p>
                        The Base64 is valid, but the bytes it holds are not UTF-8
                        text, for example an image or a compressed file. This
                        tool shows text only, so it tells you the byte count
                        instead of printing unreadable characters.
                    </p>
                </details>

                <details>
                    <summary>
                        Can I decode a Base64 value without the = at the end?
                    </summary>
                    <p>
                        Yes. Missing padding is accepted and the result says it
                        was assumed. A length that no padding can fix is refused.
                    </p>
                </details>

                <details>
                    <summary>
                        Is there a size limit?
                    </summary>
                    <p>
                        Yes: ${MAX_ENCODE_BYTES.toLocaleString("en-US")} bytes of
                        UTF-8 to encode, and ${MAX_DECODE_CHARS.toLocaleString("en-US")}
                        characters (whitespace included) to decode, which is the
                        Base64 of that many bytes.
                    </p>
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

    const panel = document.querySelector("#b64-panel");

    if (!panel) {
        return;
    }

    const input = document.querySelector("#b64-input");
    const inputLabel = document.querySelector("#b64-input-label");
    const hint = document.querySelector("#b64-hint");
    const count = document.querySelector("#b64-count");
    const statusText = document.querySelector("#b64-status-text");
    const stale = document.querySelector("#b64-stale");
    const errorBox = document.querySelector("#b64-error");
    const errorMessage = document.querySelector("#b64-error-message");
    const outputWrap = document.querySelector("#b64-output-wrap");
    const output = document.querySelector("#b64-output");
    const meta = document.querySelector("#b64-meta");
    const notes = document.querySelector("#b64-notes");
    const live = document.querySelector("#b64-live");
    const radios = [...document.querySelectorAll("input[name='b64-mode']")];
    const alphabets = [...document.querySelectorAll("input[name='b64-alphabet']")];
    const paddingWrap = document.querySelector("#b64-padding-wrap");
    const padding = document.querySelector("#b64-padding");

    const buttons = {
        run: document.querySelector("#b64-run"),
        example: document.querySelector("#b64-example"),
        reset: document.querySelector("#b64-reset"),
        copy: document.querySelector("#b64-copy")
    };

    let announceTimer = null;

    /* what is shown, so Copy copies exactly that and the page can tell when the box has moved on */
    let shown = null;

    let shownFrom = null;


    const mode = () =>
        radios.find((r) => r.checked).value;

    const urlSafe = () =>
        alphabets.find((r) => r.checked).value === "url";

    const options = () =>
        ({ urlSafe: urlSafe(), keepPadding: padding.checked });

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

    function clearError() {

        errorBox.hidden = true;

        errorMessage.textContent = "";

        input.removeAttribute("aria-invalid");

        input.setAttribute("aria-describedby", "b64-hint");

    }

    function clearResult() {

        shown = null;

        shownFrom = null;

        outputWrap.hidden = true;

        output.textContent = "";

        meta.textContent = "";

        notes.replaceChildren();

        stale.hidden = true;

    }

    function updateCount() {

        count.textContent = countText(input.value.length);

    }

    function applyMode() {

        const m = MODES[mode()];

        inputLabel.textContent = m.label;

        hint.textContent = m.hint;

        buttons.run.textContent = m.action;

        paddingWrap.hidden = !(urlSafe() && mode() === "encode");

    }

    function markStale() {

        if (shown !== null || !errorBox.hidden) {
            stale.hidden = input.value === shownFrom ? true : false;
        }

    }


    /* ---------- the action ---------- */

    function run() {

        const text = input.value;

        const which = mode();

        const result = which === "encode"
            ? encodeText(text, options())
            : decodeBase64(text, options());

        clearError();

        clearResult();

        if (!result.ok) {

            errorMessage.textContent = result.message;

            errorBox.hidden = false;

            input.setAttribute("aria-invalid", "true");

            input.setAttribute("aria-describedby", "b64-hint b64-error-message");

            shownFrom = text;

            setStatus("invalid", which === "encode" ? "The text could not be encoded." : "The Base64 could not be decoded.");

            announce(result.message);

            return;

        }

        shown = result.value;

        shownFrom = text;

        output.textContent = result.value;

        outputWrap.hidden = false;

        const summary = which === "encode"
            ? `${byteText(result.bytes)} of UTF-8 became ${countText(result.chars)} of Base64.`
            : `Decoded ${byteText(result.bytes)} as UTF-8 text.`;

        meta.textContent = summary;

        for (const note of result.notes) {

            const item = document.createElement("li");

            item.textContent = note;

            notes.append(item);

        }

        setStatus(
            "done",
            which === "encode" ? "Encoded." : "Decoded."
        );

        announce(`${which === "encode" ? "Encoded" : "Decoded"}. ${summary}${result.notes.length ? " " + result.notes.join(" ") : ""}`);

    }


    /* ---------- events ---------- */

    buttons.run.addEventListener("click", run);

    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {

            event.preventDefault();

            run();

        }

    });

    input.addEventListener("input", () => {

        updateCount();

        markStale();

    });

    for (const radio of radios) {

        radio.addEventListener("change", () => {

            applyMode();

            clearError();

            clearResult();

            setStatus(
                "empty",
                mode() === "encode"
                    ? "Enter text, or choose Load example, then press Encode."
                    : "Paste Base64, or choose Load example, then press Decode."
            );

            announce(mode() === "encode" ? "Encode text to Base64 selected." : "Decode Base64 to text selected.");

        });

    }

    for (const control of [...alphabets, padding]) {

        control.addEventListener("change", () => {

            applyMode();

            clearError();

            clearResult();

            setStatus(
                "empty",
                mode() === "encode"
                    ? "Enter text, or choose Load example, then press Encode."
                    : "Paste Base64, or choose Load example, then press Decode."
            );

            announce(control === padding
                ? (padding.checked ? "Keep padding on." : "Keep padding off.")
                : (urlSafe() ? "URL-safe alphabet selected." : "Standard alphabet selected."));

        });

    }

    buttons.example.addEventListener("click", () => {

        input.value = EXAMPLES[mode()];

        updateCount();

        clearError();

        clearResult();

        setStatus("empty", `Example loaded. Press ${MODES[mode()].action}.`);

        announce(`Example loaded. Press ${MODES[mode()].action}.`);

    });

    buttons.reset.addEventListener("click", () => {

        radios.find((r) => r.value === "encode").checked = true;

        alphabets.find((r) => r.value === "standard").checked = true;

        padding.checked = false;

        input.value = "";

        updateCount();

        applyMode();

        clearError();

        clearResult();

        setStatus("empty", "Enter text, or choose Load example, then press Encode.");

        announce("Reset.");

        input.focus();

    });

    buttons.copy.addEventListener("click", async () => {

        if (shown === null) {
            return;
        }

        let copied = false;

        try {

            await navigator.clipboard.writeText(shown);

            copied = true;

        } catch (problem) {

            try {

                const holder = document.createElement("textarea");

                holder.className = "b64-sr-only";

                holder.value = shown;

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
                ? "Result copied to the clipboard."
                : "Could not copy automatically. Select the result and copy it yourself."
        );

    });

    updateCount();

    panel.dataset.ready = "true";

}
