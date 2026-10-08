/* =========================================================
   ToolZen Hub
   JWT Decoder (Developer Tools)

   Paste a JSON Web Token and read its header and payload. The
   rules (structure, base64url, UTF-8, strict JSON, claims, time)
   are in jwt-engine.js; this file is the page around them.

   A decoded token is only text that someone wrote in the right
   shape. Nothing here checks a signature, an issuer or an
   algorithm, and the page says so wherever a result appears.

   The token is a credential, so:
   - Decoding happens only when the visitor presses Decode (or
     Ctrl/Cmd + Enter). Pasting, typing and loading the example
     never decode, and the clipboard is never read.
   - Every value from the token is put on the page with
     textContent, never as HTML, and never as a link.
   - Copy offers only the decoded header or payload text, and only
     when the visitor presses its button. The raw token and the
     signature are never copied.
   - There is no network request, no storage of any kind, no URL
     or title change and no logging of the token.
========================================================= */

import {
    decodeToken,
    EXAMPLE_TOKEN,
    MAX_TOKEN_CHARS
} from "./jwt-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the tool links two Developer Tools in its text. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("jwt-decoder").title;

const JSON_TOOL =
    getToolById("json-formatter");

const TIMESTAMP_TOOL =
    getToolById("unix-timestamp-converter");

const countText = (n) =>
    `${n.toLocaleString("en-US")} character${n === 1 ? "" : "s"}`;


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
                        Read the header and payload of a JSON Web Token, see
                        its claims explained and its times as dates. It does
                        not check the signature.
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
                            Your token is decoded in your browser
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="jw-panel"
                    class="jw-workspace"
                    data-state="empty"
                >

                    <div class="jw-pane">

                        <div class="jw-pane__head">

                            <label
                                for="jw-input"
                                class="jw-label"
                            >
                                JWT
                            </label>

                            <span
                                id="jw-count"
                                class="jw-meta"
                            >0 characters</span>

                        </div>

                        <textarea
                            id="jw-input"
                            class="jw-text"
                            rows="6"
                            spellcheck="false"
                            autocomplete="off"
                            autocapitalize="off"
                            autocorrect="off"
                            aria-describedby="jw-hint"
                        ></textarea>

                        <p
                            id="jw-hint"
                            class="jw-hint"
                        >
                            Paste a token, then press Decode.
                            <button
                                type="button"
                                id="jw-example"
                                class="jw-link"
                            >Load an example</button>
                        </p>

                    </div>


                    <div class="jw-actions">

                        <button
                            type="button"
                            id="jw-decode"
                            class="calculator-form__button jw-button"
                        >
                            Decode
                        </button>

                        <button
                            type="button"
                            id="jw-clear"
                            class="calculator-form__button calculator-form__button--secondary jw-button"
                        >
                            Clear
                        </button>

                        <p class="jw-keys">
                            <kbd>Ctrl</kbd> or <kbd>⌘</kbd> + <kbd>Enter</kbd> decodes.
                        </p>

                    </div>


                    <p class="jw-notice">
                        <strong>Signature not verified.</strong>
                        This tool reads a token. It does not check the
                        signature, the issuer or the algorithm, so a token
                        that decodes here may still be forged, altered or
                        expired. Everything shown is what the token says about
                        itself.
                    </p>


                    <div class="jw-result">

                        <p
                            id="jw-status"
                            class="jw-status"
                        >
                            <span
                                id="jw-status-text"
                            >Paste a token, or load the example.</span>
                        </p>

                        <p
                            id="jw-stale"
                            class="jw-stale"
                            hidden
                        >The text in the box changed after this was decoded. Press Decode to update.</p>

                        <div
                            id="jw-error"
                            class="jw-error"
                            hidden
                        >

                            <p class="jw-error__title">
                                This could not be read as a JWT
                            </p>

                            <p
                                id="jw-error-message"
                                class="jw-error__message"
                            ></p>

                            <p
                                id="jw-error-where"
                                class="jw-error__where"
                            ></p>

                            <pre
                                id="jw-error-context"
                                class="jw-error__context"
                                tabindex="0"
                                aria-label="The text around the problem, with a marker under the exact place"
                            ></pre>

                        </div>

                        <ul
                            id="jw-notes"
                            class="jw-notes"
                            aria-label="Notes about this token"
                            hidden
                        ></ul>

                    </div>


                    <div
                        id="jw-results"
                        class="jw-results"
                        hidden
                    >

                        <h2
                            id="jw-results-heading"
                            class="jw-results__heading"
                            tabindex="-1"
                        >
                            Decoded token
                        </h2>

                        <section class="jw-card" aria-labelledby="jw-structure-heading">
                            <h3 id="jw-structure-heading">Structure</h3>
                            <dl id="jw-structure" class="jw-list"></dl>
                        </section>

                        <section class="jw-card" aria-labelledby="jw-header-heading">
                            <div class="jw-card__head">
                                <h3 id="jw-header-heading">Header</h3>
                                <button
                                    type="button"
                                    id="jw-copy-header"
                                    class="calculator-form__button calculator-form__button--secondary jw-copy"
                                >Copy header</button>
                            </div>
                            <pre
                                id="jw-header"
                                class="jw-pre"
                                tabindex="0"
                                aria-labelledby="jw-header-heading"
                            ></pre>
                            <dl id="jw-header-fields" class="jw-list" hidden></dl>
                        </section>

                        <section class="jw-card" aria-labelledby="jw-payload-heading">
                            <div class="jw-card__head">
                                <h3 id="jw-payload-heading">Payload</h3>
                                <button
                                    type="button"
                                    id="jw-copy-payload"
                                    class="calculator-form__button calculator-form__button--secondary jw-copy"
                                >Copy payload</button>
                            </div>
                            <pre
                                id="jw-payload"
                                class="jw-pre"
                                tabindex="0"
                                aria-labelledby="jw-payload-heading"
                            ></pre>
                        </section>

                        <section class="jw-card" aria-labelledby="jw-claims-heading">
                            <h3 id="jw-claims-heading">Registered claims</h3>
                            <p id="jw-claims-empty" class="jw-muted" hidden>The payload has none of the registered claims (iss, sub, aud, exp, nbf, iat, jti).</p>
                            <dl id="jw-claims" class="jw-list"></dl>
                        </section>

                        <section class="jw-card" aria-labelledby="jw-time-heading">
                            <h3 id="jw-time-heading">Times</h3>
                            <div id="jw-times"></div>
                            <ul id="jw-time-notes" class="jw-time-notes"></ul>
                        </section>

                        <section class="jw-card jw-card--quiet" aria-labelledby="jw-signature-heading">
                            <h3 id="jw-signature-heading">Signature: not verified</h3>
                            <p id="jw-signature-text" class="jw-muted"></p>
                        </section>

                        <p class="jw-untrusted">
                            The decoded content is untrusted data. Anyone can
                            write a token that decodes to anything. Do not act
                            on it, follow addresses in it or treat it as proof
                            of who someone is until a system that holds the
                            right key has verified it.
                        </p>

                    </div>

                </div>

            </section>

            <p
                id="jw-live"
                class="jw-sr-only"
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
                        Paste a token into the box, or load the example. A token
                        is three parts joined by dots, and often starts with
                        <code>eyJ</code>.
                    </li>
                    <li>
                        Press Decode. The header and payload appear as readable
                        JSON, with the registered claims explained and the
                        times shown as dates.
                    </li>
                    <li>
                        If the text cannot be read, the message says which part
                        is wrong and where.
                    </li>
                    <li>
                        Copy header or Copy payload copies only the decoded
                        JSON, and only when you press it.
                    </li>
                </ol>

            </section>


            <!-- DECODING IS NOT VERIFYING -->

            <section class="calculator-info">

                <h2>
                    Decoding Is Not Verifying
                </h2>

                <p>
                    The header and payload of a JWT are not encrypted. They are
                    encoded with base64url, which anyone can reverse, so a
                    decoder can show them without any key. What proves a token
                    genuine is its <strong>signature</strong>, and only a system
                    that holds the right key can check it. This tool never does.
                </p>

                <p>
                    Treat every value as a claim the token makes about itself,
                    including <code>alg</code>, <code>typ</code> and
                    <code>kid</code> in the header. A token can say it was
                    issued by anyone, for anyone, until the signature is checked
                    by the service that is supposed to accept it.
                </p>

                <p>
                    A token whose header says <code>"alg":"none"</code> declares
                    that it has no signature. The tool reports that fact and
                    nothing more.
                </p>

            </section>


            <!-- WHAT IT READS -->

            <section class="calculator-info">

                <h2>
                    What It Reads
                </h2>

                <p>
                    A signed token with three dot-separated parts, whose first
                    two parts are base64url-encoded UTF-8 text holding a JSON
                    object. A leading <code>Bearer</code> and any spaces or line
                    breaks are ignored, and the tool says so when it does.
                </p>

                <p>
                    An encrypted token (five parts) is recognised and refused,
                    because its contents cannot be read without a key. A payload
                    that is not a JSON object is refused too. The tool works on
                    up to ${MAX_TOKEN_CHARS.toLocaleString("en-US")} characters.
                </p>

                <p>
                    The JSON is shown exactly as written in the token, so a
                    number is never rounded or reformatted. A repeated key and
                    an integer larger than JavaScript can hold are shown as
                    notes.
                </p>

            </section>


            <!-- TIME CLAIMS -->

            <section class="calculator-info">

                <h2>
                    Reading exp, nbf and iat
                </h2>

                <p>
                    These claims are a count of <strong>seconds</strong> since
                    1 January 1970 UTC. The tool shows each as UTC, in the time
                    zone of this device, and as a time from now. If a number is
                    so large that it looks like milliseconds, it says so but
                    does not convert it.
                </p>

                <p>
                    The status lines compare the time with the clock of this
                    device. They describe the numbers; they do not say whether
                    a token is accepted, because the service that checks it
                    uses its own clock and may allow some leeway. To read other
                    timestamps, use the
                    <a href="${TIMESTAMP_TOOL.href}">${TIMESTAMP_TOOL.title}</a>.
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>Seeing which claims an identity provider put in a token while you debug a login.</li>
                    <li>Checking when a token was issued and when it says it expires.</li>
                    <li>Reading a token from a log or a support ticket without sending it to another site.</li>
                </ul>

                <p>
                    The payload is JSON. To check or reformat other JSON, use the
                    <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a>.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is my token sent anywhere?
                    </summary>
                    <p>
                        No. The token is decoded by code running in your
                        browser, and it is not uploaded, stored or put in the
                        page address. Reloading the page clears it. ToolZen Hub
                        cannot control browser extensions, the clipboard
                        history of your device or other software you have
                        installed, so treat a live token like a password and
                        prefer an expired or test token when you can.
                    </p>
                </details>

                <details>
                    <summary>
                        Does this tell me if a token is valid?
                    </summary>
                    <p>
                        No. It only reads what the token says. Whether it is
                        genuine, unaltered and still accepted is decided by the
                        service that checks the signature with the right key.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does it say the token is not a JWT?
                    </summary>
                    <p>
                        A signed JWT has exactly three parts. Many tokens that
                        look similar are not JWTs: opaque access tokens,
                        session identifiers and encrypted tokens do not decode
                        to JSON. The message names what the tool found.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the expiry in a different time zone from my server logs?
                    </summary>
                    <p>
                        The claim itself has no time zone. It is a count of
                        seconds from a fixed UTC moment. The tool shows that
                        moment in UTC and in this device's zone so you can match
                        either one.
                    </p>
                </details>

                <details>
                    <summary>
                        Can it verify a signature or create a token?
                    </summary>
                    <p>
                        No. It has no key input, no signing and no
                        verification, by design.
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

    const panel = document.querySelector("#jw-panel");

    if (!panel) {
        return;
    }

    const input = document.querySelector("#jw-input");
    const count = document.querySelector("#jw-count");
    const statusText = document.querySelector("#jw-status-text");
    const stale = document.querySelector("#jw-stale");
    const errorBox = document.querySelector("#jw-error");
    const errorMessage = document.querySelector("#jw-error-message");
    const errorWhere = document.querySelector("#jw-error-where");
    const errorContext = document.querySelector("#jw-error-context");
    const notesBox = document.querySelector("#jw-notes");
    const results = document.querySelector("#jw-results");
    const resultsHeading = document.querySelector("#jw-results-heading");
    const structure = document.querySelector("#jw-structure");
    const headerPre = document.querySelector("#jw-header");
    const headerFields = document.querySelector("#jw-header-fields");
    const payloadPre = document.querySelector("#jw-payload");
    const claimsList = document.querySelector("#jw-claims");
    const claimsEmpty = document.querySelector("#jw-claims-empty");
    const times = document.querySelector("#jw-times");
    const timeNotes = document.querySelector("#jw-time-notes");
    const signatureText = document.querySelector("#jw-signature-text");
    const live = document.querySelector("#jw-live");

    const buttons = {
        decode: document.querySelector("#jw-decode"),
        clear: document.querySelector("#jw-clear"),
        example: document.querySelector("#jw-example"),
        copyHeader: document.querySelector("#jw-copy-header"),
        copyPayload: document.querySelector("#jw-copy-payload")
    };

    let announceTimer = null;

    /* what was decoded, so Copy copies exactly what is shown and the page can tell when the box has moved on */
    let shown = null;

    let decodedFrom = null;


    /* ---------- small helpers ---------- */

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

    /* an element whose only content is text: nothing from a token is ever markup */
    function node(tag, className, text) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;

    }

    function row(list, term, ...details) {

        const wrap = node("div", "jw-row");

        wrap.append(node("dt", "", term));

        for (const detail of details) {

            if (detail instanceof Node) {
                const dd = node("dd");
                dd.append(detail);
                wrap.append(dd);
            } else {
                wrap.append(node("dd", "", detail));
            }

        }

        list.append(wrap);

    }

    function setNotes(notes) {

        notesBox.replaceChildren();

        for (const text of notes) {
            notesBox.append(node("li", "", text));
        }

        notesBox.hidden = notes.length === 0;

    }

    function clearResults() {

        shown = null;
        decodedFrom = null;

        results.hidden = true;
        stale.hidden = true;

        for (const element of [structure, headerFields, claimsList, times, timeNotes, notesBox]) {
            element.replaceChildren();
        }

        headerPre.textContent = "";
        payloadPre.textContent = "";
        signatureText.textContent = "";
        errorMessage.textContent = "";
        errorWhere.textContent = "";
        errorContext.textContent = "";

        errorBox.hidden = true;
        notesBox.hidden = true;
        headerFields.hidden = true;

        buttons.copyHeader.disabled = true;
        buttons.copyPayload.disabled = true;

    }

    function updateCount() {

        count.textContent = countText(input.value.length);

        if (decodedFrom !== null && input.value !== decodedFrom) {
            stale.hidden = false;
        } else {
            stale.hidden = true;
        }

    }


    /* ---------- showing a result ---------- */

    function showError(message, where, context, notes) {

        results.hidden = true;

        shown = null;

        errorMessage.textContent = message;
        errorWhere.textContent = where || "";
        errorWhere.hidden = !where;
        errorContext.textContent = context || "";
        errorContext.hidden = !context;

        errorBox.hidden = false;

        setNotes(notes || []);

        setStatus("invalid", "Could not read this as a JWT.");

        announce(`Could not read this as a JWT. ${message}`);

    }

    function showDecoded(result) {

        errorBox.hidden = true;

        setNotes(result.notes);

        /* structure */
        structure.replaceChildren();

        row(structure, "Format", "Three-part compact token (header.payload.signature)");

        row(
            structure,
            "Algorithm declared",
            result.structure.alg === null
                ? "The header has no alg field."
                : `${result.structure.alg} (declared by the token, not checked)`
        );

        row(
            structure,
            "Signature part",
            result.structure.signatureEncodedLength === 0
                ? "Empty"
                : `${countText(result.structure.signatureEncodedLength)}, ${result.structure.signatureBytes} bytes`
        );

        row(
            structure,
            "Contents",
            `Header with ${result.structure.headerKeys} field${result.structure.headerKeys === 1 ? "" : "s"}, payload with ${result.structure.payloadKeys} field${result.structure.payloadKeys === 1 ? "" : "s"}`
        );

        /* header and payload exactly as decoded */
        headerPre.textContent = result.header.formatted;
        payloadPre.textContent = result.payload.formatted;

        headerFields.replaceChildren();

        for (const field of result.headerFields) {

            row(
                headerFields,
                field.name,
                field.typeOk
                    ? `${field.value} (declared by the token)`
                    : `${field.value} (expected a string, found ${field.found})`
            );

        }

        headerFields.hidden = result.headerFields.length === 0;

        /* claims */
        claimsList.replaceChildren();

        for (const claim of result.claims) {

            row(
                claimsList,
                `${claim.name}: ${claim.label}`,
                claim.value,
                claim.typeOk
                    ? `The token says this is ${claim.meaning}.`
                    : `Unexpected type: expected ${claim.expected}, found ${claim.found}. It is shown as written and not interpreted.`
            );

        }

        claimsEmpty.hidden = result.claims.length > 0;

        /* times */
        times.replaceChildren();

        for (const item of result.timing.items) {

            const block = node("div", "jw-time");

            block.append(node("h4", "", `${item.label} (${item.name})`));

            const list = node("dl", "jw-list");

            row(list, "Value in seconds", item.seconds);

            if (item.utc) {
                row(list, "UTC", item.utc);
                row(list, `This device (${item.zone})`, item.local);
                row(list, "From now", item.relative);
            }

            row(list, "Status", item.status);

            if (item.hint) {
                row(list, "Note", item.hint);
            }

            block.append(list);

            times.append(block);

        }

        if (result.timing.items.length === 0) {
            times.append(node("p", "jw-muted", "The payload has no numeric exp, nbf or iat claim."));
        }

        timeNotes.replaceChildren();

        for (const text of result.timing.notes) {
            timeNotes.append(node("li", "", text));
        }

        timeNotes.append(node("li", "", `Checked at ${result.timing.checkedAt} UTC.`));

        /* signature */
        signatureText.textContent =
            result.structure.signatureEncodedLength === 0
                ? "The signature part is empty. There is nothing to verify, and this tool does not verify signatures in any case."
                : "This tool does not verify signatures. It does not have a key, and it does not check the algorithm. A token can decode cleanly and still be forged.";

        shown = {
            header: result.header.formatted,
            payload: result.payload.formatted
        };

        buttons.copyHeader.disabled = false;
        buttons.copyPayload.disabled = false;

        results.hidden = false;

        setStatus("decoded", "Decoded. Nothing has been verified.");

        announce("Token decoded. The header, payload and claims are below. Nothing has been verified.");

    }


    /* ---------- the one action ---------- */

    function decode() {

        const text = input.value;

        const result = decodeToken(text, { nowMs: Date.now() });

        clearResults();

        decodedFrom = text;

        updateCount();

        switch (result.state) {

            case "empty":
                decodedFrom = null;
                setStatus("empty", "Paste a token, or load the example.");
                announce("There is no token to decode.");
                return;

            case "too-large":
                showError(
                    `This is longer than the ${result.limit.toLocaleString("en-US")} characters the tool reads. A real token is much shorter.`,
                    "",
                    "",
                    []
                );
                return;

            case "jwe":
                showError(result.message, "", "", result.notes);
                return;

            case "invalid":
                showError(
                    result.problem.message,
                    result.problem.where || "",
                    result.problem.context || "",
                    result.notes
                );
                return;

            default:
                showDecoded(result);
                resultsHeading.focus({ preventScroll: false });

        }

    }


    /* ---------- copy: the decoded text shown, only on a click ---------- */

    async function copy(which) {

        if (!shown) {
            return;
        }

        const text = shown[which];

        let copied = false;

        try {

            await navigator.clipboard.writeText(text);

            copied = true;

        } catch (problem) {

            try {

                const holder = node("textarea", "jw-sr-only");

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

        const message = copied
            ? `${which === "header" ? "Header" : "Payload"} copied to the clipboard.`
            : "Could not copy automatically. Select the text and copy it yourself.";

        announce(message);

        statusText.textContent = message;

    }


    /* ---------- events ---------- */

    buttons.decode.addEventListener("click", decode);

    buttons.clear.addEventListener("click", () => {

        input.value = "";

        clearResults();

        updateCount();

        setStatus("empty", "Cleared. Paste a token, or load the example.");

        announce("Cleared.");

        input.focus();

    });

    buttons.example.addEventListener("click", () => {

        input.value = EXAMPLE_TOKEN;

        updateCount();

        setStatus("empty", "Example loaded. It is made up and carries no real credentials. Press Decode.");

        announce("Example loaded. Press Decode.");

        buttons.decode.focus();

    });

    buttons.copyHeader.addEventListener("click", () => copy("header"));

    buttons.copyPayload.addEventListener("click", () => copy("payload"));

    input.addEventListener("input", updateCount);

    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {

            event.preventDefault();

            decode();

        }

    });

    clearResults();

    updateCount();

    panel.dataset.ready = "true";

}
