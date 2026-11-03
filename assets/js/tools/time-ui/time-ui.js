/* =========================================================
   ToolZen Hub
   Time Tools: the small pieces the new Time Tools share

   Only what four or more tools genuinely repeat: the page
   introduction, an FAQ block, the polite screen-reader
   announcement, copying text, and today's date as the browser
   reads it. Each tool keeps its own markup, rules and wording.
   Pure strings except where a function says it needs the
   browser; none of it touches storage or the network.
========================================================= */

import {
    escapeHTML
} from "../../ui/escape.js";


/* the introduction every Time Tool opens with */
export function introMarkup({ title, lead, trust = "Runs in your browser • Nothing is stored" }) {

    return `
            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Time Tool
                    </span>

                    <h1>
                        ${escapeHTML(title)}
                    </h1>

                    <p>
                        ${escapeHTML(lead)}
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
                            ${escapeHTML(trust)}
                        </span>

                    </div>

                </div>

            </section>`;

}

/* a titled information section; `html` is the tool's own trusted markup */
export function infoSection(heading, html) {

    return `
            <section class="calculator-info">

                <h2>
                    ${escapeHTML(heading)}
                </h2>

                ${html}

            </section>`;

}

/* the FAQ: items are [question, answer] as plain text */
export function faqSection(title, items) {

    return `
            <section class="calculator-info">

                <h2>
                    ${escapeHTML(title)}
                </h2>
${items.map(([question, answer]) => `
                <details>
                    <summary>
                        ${escapeHTML(question)}
                    </summary>
                    <p>
                        ${escapeHTML(answer)}
                    </p>
                </details>`).join("\n")}
            </section>`;

}

/*
 * One polite announcement at a time, a moment after the last change, so it is not read out on every
 * keystroke. Needs the DOM. Returns { announce(text, delay), clear() }.
 */
export function createAnnouncer(element, defaultDelay = 400) {

    let timer = null;

    return {

        announce(text, delay = defaultDelay) {

            clearTimeout(timer);

            if (!element) {
                return;
            }

            if (delay === 0) {
                element.textContent = "";
            }

            timer = setTimeout(
                () => {
                    element.textContent = text;
                },
                delay === 0 ? 50 : delay
            );

        },

        clear() {

            clearTimeout(timer);

            if (element) {
                element.textContent = "";
            }

        }

    };

}

/*
 * Copy text on a click. Returns true when the browser accepted it, false when it could not (then the
 * caller shows the text for manual copying). Needs the browser.
 */
export async function copyToClipboard(text) {

    try {

        if (text && typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            await navigator.clipboard.writeText(text);
            return true;
        }

    } catch {
        /* fall through: not allowed here */
    }

    return false;

}

const pad2 = (n) => String(n).padStart(2, "0");

/* today's calendar date as this browser reads it ("2026-11-03"), from the local year, month and day */
export function todayIso(now = new Date()) {

    return `${String(now.getFullYear()).padStart(4, "0")}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

}

/*
 * Wire every `[data-today="<input id>"]` button to fill its date input with today's date, only when
 * pressed (a date is never filled in silently). Fires the input's `input` and `change` events so the
 * tool recalculates. Needs the DOM.
 */
export function wireTodayButtons(root, now = () => new Date()) {

    /* the calendar icon beside a date field opens the browser's own date picker (a pointer and touch aid: the date
       input stays the accessible control, and keyboard users open its picker from the input itself) */
    for (const button of root.querySelectorAll("[data-calendar]")) {

        button.addEventListener(
            "click",
            () => {

                const input = document.getElementById(button.dataset.calendar);

                if (!input) {
                    return;
                }

                input.focus();

                try {
                    input.showPicker();
                } catch {
                    /* a browser without showPicker keeps the focused date field */
                }

            }
        );

    }

    for (const button of root.querySelectorAll("[data-today]")) {

        button.addEventListener(
            "click",
            () => {

                const input = document.getElementById(button.dataset.today);

                if (!input) {
                    return;
                }

                input.value = todayIso(now());

                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));

                input.focus();

            }
        );

    }

}

/* the markup of a "Use today" button for a date input */
export function todayButton(inputId) {

    return `<span class="tt-date-actions">
                                    <button
                                        type="button"
                                        class="tt-inline-button tt-calendar-button"
                                        data-calendar="${escapeHTML(inputId)}"
                                        tabindex="-1"
                                        aria-hidden="true"
                                        title="Open calendar"
                                    ><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg></button>
                                    <button
                                        type="button"
                                        class="tt-inline-button"
                                        data-today="${escapeHTML(inputId)}"
                                        aria-label="Use today's date for this field"
                                    >Use today</button>
                                </span>`;

}

/* the shared copy button wiring: a button, a status line, a function that returns the text */
export function wireCopy({ button, status, getText, announce }) {

    button.addEventListener(
        "click",
        async () => {

            const text = getText();

            const ok = await copyToClipboard(text);

            status.hidden = false;

            if (ok) {
                status.textContent = "Copied to the clipboard.";
                announce?.("Copied to the clipboard.", 0);
                return;
            }

            status.textContent = "Copying is not available here. Select the text below and copy it.";

            let box = status.nextElementSibling;

            if (!box || !box.classList.contains("tt-manual")) {

                box = document.createElement("textarea");
                box.className = "tt-manual calculator-form__input";
                box.readOnly = true;
                box.rows = 6;
                box.setAttribute("aria-label", "Text to copy");

                status.after(box);

            }

            box.value = text;
            box.focus();
            box.select();

        }
    );

}
