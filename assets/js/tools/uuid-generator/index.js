/* =========================================================
   ToolZen Hub
   UUID Generator (Developer Tools)

   Version 4 (random), version 7 (time-ordered) and nil UUIDs, one or
   many, with display options. The rules are in uuid-engine.js; this
   file is the page around them.

   Behaviour that matters:
   - Randomness comes only from crypto.getRandomValues. If the browser
     has none, nothing is generated: there is no weaker fallback.
   - Nothing is sent, stored or put in the address of the page. UUIDs
     are shown with textContent only.
   - A UUID is an identifier, not a secret; the page says so.
========================================================= */

import {
    generate,
    MAX_COUNT,
    DEFAULT_COUNT
} from "./uuid-engine.js";

import {
    getToolById
} from "../../data/tools.js";


export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("uuid-generator").title;

const VERSION_TEXT = {
    v4: "version 4 (random)",
    v7: "version 7 (time-ordered)",
    nil: "nil"
};


export function markup() {

    const radio = (value, label, hint, checked) => `
                        <label class="ug-choice">
                            <input type="radio" name="ug-version" value="${value}"${checked ? " checked" : ""}>
                            <span><strong>${label}</strong><small>${hint}</small></span>
                        </label>`;

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
                        Make random (version 4) or time-ordered (version 7)
                        UUIDs, one or many, in the format you need. They are
                        made in your browser with its secure random generator.
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
                            Generated in your browser, nothing is sent or stored
                        </span>

                    </div>

                </div>

            </section>


            <section class="calculator-section">

                <div id="ug-panel" class="ug-workspace" data-state="empty">

                    <p class="ug-note">
                        <strong>A UUID is an identifier, not a secret.</strong>
                        Do not use one as a password, token or access key.
                    </p>

                    <fieldset class="ug-versions">
                        <legend class="ug-label">Version</legend>
                        <div class="ug-choices">
${radio("v4", "Version 4", "random, the usual choice", true)}
${radio("v7", "Version 7", "starts with the time, sorts in order", false)}
${radio("nil", "Nil", "all zeros, a placeholder", false)}
                        </div>
                    </fieldset>

                    <div class="ug-field">
                        <label for="ug-count" class="ug-label">How many (1 to ${MAX_COUNT})</label>
                        <input id="ug-count" class="ug-number" type="text" inputmode="numeric" value="${DEFAULT_COUNT}" autocomplete="off" aria-describedby="ug-count-error">
                        <p id="ug-count-error" class="ug-error" hidden></p>
                    </div>

                    <fieldset class="ug-options">
                        <legend class="ug-label">Format</legend>
                        <label class="ug-check"><input type="checkbox" id="ug-upper"><span>Uppercase</span></label>
                        <label class="ug-check"><input type="checkbox" id="ug-hyphens" checked><span>Hyphens</span></label>
                        <label class="ug-check"><input type="checkbox" id="ug-braces"><span>Braces { }</span></label>
                    </fieldset>

                    <div class="ug-actions">
                        <button type="button" id="ug-generate" class="calculator-form__button ug-button">Generate</button>
                        <button type="button" id="ug-copy" class="calculator-form__button calculator-form__button--secondary ug-button" disabled>Copy all</button>
                        <button type="button" id="ug-reset" class="calculator-form__button calculator-form__button--secondary ug-button">Reset</button>
                    </div>

                    <p id="ug-status" class="ug-status" data-state="empty">Press Generate.</p>

                    <ol id="ug-list" class="ug-list" aria-label="Generated UUIDs" hidden></ol>

                </div>

            </section>

            <p id="ug-live" class="ug-sr-only" role="status" aria-live="polite"></p>


            <section class="calculator-info">
                <h2>How to Use the ${TITLE}</h2>
                <ol>
                    <li>Choose a version and how many UUIDs you want.</li>
                    <li>Choose the format: uppercase, with or without hyphens, with or without braces.</li>
                    <li>Press Generate. Each Generate makes new values.</li>
                    <li>Copy all, one UUID per line, or use the Copy button beside one.</li>
                </ol>
            </section>

            <section class="calculator-info">
                <h2>Which Version to Use</h2>
                <ul>
                    <li><strong>Version 4</strong> is 122 random bits. Use it when you only need a unique identifier.</li>
                    <li><strong>Version 7</strong> begins with the time in milliseconds (48 bits), then a counter and random bits. UUIDs made later sort after earlier ones, which keeps database indexes compact. The time is visible inside the UUID, so it reveals when it was made.</li>
                    <li><strong>Nil</strong> is all zeros. It is a placeholder meaning "no UUID", not a unique value.</li>
                    <li>Within one batch, version 7 values always sort in the order they were made: a 12-bit counter follows the timestamp and rises by one for each UUID in the same millisecond. If it would overflow, the timestamp is moved one millisecond ahead (RFC 9562, section 6.2), so a very large batch can run a little ahead of the clock. Across two separate batches in the same millisecond, order is not guaranteed.</li>
                    <li>The layouts follow RFC 9562. Random values come from <code>crypto.getRandomValues</code>; if your browser has none, the tool refuses rather than use a weaker source.</li>
                </ul>
            </section>

            <section class="calculator-info">
                <h2>${TITLE} FAQ</h2>
                <details>
                    <summary>Can I use a UUID as a secret or access token?</summary>
                    <p>No. RFC 9562 says UUIDs must not be used as security capabilities. Even a random version 4 value was not designed for that, and a version 7 value contains its creation time.</p>
                </details>
                <details>
                    <summary>Are the UUIDs stored or sent anywhere?</summary>
                    <p>No. They are made in your browser and disappear when you leave or press Reset. Nothing is uploaded, stored or logged.</p>
                </details>
                <details>
                    <summary>Can two UUIDs be the same?</summary>
                    <p>For version 4 the chance is negligible in practice. The tool does not check uniqueness against anything you already have.</p>
                </details>
                <details>
                    <summary>What is the largest batch?</summary>
                    <p>${MAX_COUNT.toLocaleString("en-US")} UUIDs per press.</p>
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

    const panel = document.querySelector("#ug-panel");

    if (!panel) {
        return;
    }

    const $ = (id) => document.querySelector(`#ug-${id}`);

    const count = $("count");
    const countError = $("count-error");
    const list = $("list");
    const status = $("status");
    const live = $("live");
    const copyAll = $("copy");

    let current = [];
    let announceTimer = null;

    const randomBytes = (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function")
        ? (n) => crypto.getRandomValues(new Uint8Array(n))
        : null;

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
                holder.className = "ug-sr-only";
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

    const version = () =>
        document.querySelector("input[name='ug-version']:checked").value;

    function clearResult() {
        current = [];
        list.replaceChildren();
        list.hidden = true;
        copyAll.disabled = true;
    }

    function readCount() {

        const raw = count.value.trim();

        if (!/^[0-9]{1,5}$/.test(raw)) {
            return NaN;
        }

        return Number(raw);
    }

    function run() {

        const n = readCount();

        countError.hidden = true;
        count.removeAttribute("aria-invalid");

        const result = generate({
            version: version(),
            count: n,
            uppercase: $("upper").checked,
            hyphens: $("hyphens").checked,
            braces: $("braces").checked
        }, {
            randomBytes,
            now: () => Date.now()
        });

        clearResult();

        if (!result.ok) {

            if (Number.isNaN(n) || n < 1 || n > MAX_COUNT) {
                countError.textContent = result.message;
                countError.hidden = false;
                count.setAttribute("aria-invalid", "true");
            }

            setStatus("invalid", result.message);
            announce(result.message);
            return;
        }

        current = result.uuids;

        const fragment = document.createDocumentFragment();

        for (const uuid of current) {

            const li = document.createElement("li");
            li.className = "ug-item";

            const text = document.createElement("code");
            text.className = "ug-item__text";
            text.textContent = uuid;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "calculator-form__button calculator-form__button--secondary ug-button ug-button--small";
            button.textContent = "Copy";
            button.setAttribute("aria-label", `Copy ${uuid}`);
            button.addEventListener("click", () => copy(uuid, "UUID"));

            li.append(text, button);
            fragment.append(li);
        }

        list.append(fragment);
        list.hidden = false;
        copyAll.disabled = false;

        const message = `${current.length.toLocaleString("en-US")} ${VERSION_TEXT[result.version]} ${current.length === 1 ? "UUID" : "UUIDs"} generated.`;

        setStatus("done", message);
        announce(message);
    }

    function reset() {
        document.querySelector("input[name='ug-version'][value='v4']").checked = true;
        count.value = String(DEFAULT_COUNT);
        $("upper").checked = false;
        $("hyphens").checked = true;
        $("braces").checked = false;
        countError.hidden = true;
        count.removeAttribute("aria-invalid");
        clearResult();
        setStatus("empty", "Press Generate.");
        announce("Reset.");
    }

    $("generate").addEventListener("click", run);
    copyAll.addEventListener("click", () => copy(current.join("\n"), "All UUIDs"));
    $("reset").addEventListener("click", reset);

    count.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            run();
        }
    });

    panel.dataset.ready = "true";
}
