/* =========================================================
   ToolZen Hub
   Text Diff / Compare (Developer Tools)

   Two boxes in, one readable list of differences out. The rules
   (what a line is, what counts as a change, whitespace, limits)
   are in text-diff-engine.js and docs/tool-packs/18-text-diff.md;
   this file is the page around them.

   - The result is a unified list: removed lines, added lines, and
     Changed lines (an old line over a new line with the changed
     words marked). Each row is told in words and a symbol, never
     by colour alone.
   - It compares by itself after a short pause once both boxes
     have text and the text is a normal size; above that the
     Compare button (or Ctrl or Cmd + Enter) runs it, so a large
     paste is never diffed on every key.
   - Everything the visitor wrote is put on the page with
     textContent or as a textarea value, never as HTML.
   - Everything runs in the browser: no request, no storage, no
     URL state. Reloading clears it.
========================================================= */

import {
    LIMITS,
    EXAMPLE,
    checkLimits,
    compare,
    splitLines,
    describeSummary,
    collapseRows,
    toUnifiedDiff
} from "./text-diff-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the JSON Formatter is linked in the text. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("text-diff").title;

const JSON_TOOL =
    getToolById("json-formatter");

const AUTO_DELAY_MS = 400;
const ANNOUNCE_DELAY_MS = 900;

/* rows put on the page at a time; "Show more" adds the next chunk */
const CHUNK = 500;

const fmt = (n) => n.toLocaleString("en-US");


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    const limitText = `Up to ${fmt(LIMITS.maxChars)} characters and ${fmt(LIMITS.maxLines)} lines per side.`;

    const pane = (id, label, hint) => `
                        <div class="td-pane">

                            <div class="td-pane__head">

                                <label
                                    for="td-${id}"
                                    class="td-label"
                                >
                                    ${label}
                                </label>

                                <span
                                    id="td-${id}-meta"
                                    class="td-meta"
                                >0 lines · 0 characters</span>

                            </div>

                            <textarea
                                id="td-${id}"
                                class="td-text"
                                rows="10"
                                spellcheck="false"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                aria-describedby="td-${id}-meta"
                                placeholder="${hint}"
                            ></textarea>

                        </div>`;

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
                        Paste two versions of a text and see exactly what was
                        added, removed and changed.
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
                            Your text is compared in your browser
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="td-panel"
                    class="td-workspace"
                    data-state="empty"
                >

                    <div class="td-inputs">
${pane("original", "Original", "The older version")}
${pane("changed", "Changed", "The newer version")}
                    </div>

                    <p class="td-limit">
                        ${limitText}
                        <button
                            type="button"
                            id="td-example"
                            class="td-link"
                        >Try an example</button>
                    </p>

                    <div class="td-controls">

                        <div class="td-options">

                            <label class="td-check">
                                <input
                                    type="checkbox"
                                    id="td-ignore"
                                >
                                <span>Ignore whitespace-only changes</span>
                            </label>

                            <label class="td-check">
                                <input
                                    type="checkbox"
                                    id="td-wrap"
                                    checked
                                >
                                <span>Wrap long lines</span>
                            </label>

                        </div>

                        <div class="td-actions">

                            <button
                                type="button"
                                id="td-compare"
                                class="calculator-form__button td-button"
                            >
                                Compare
                            </button>

                            <button
                                type="button"
                                id="td-swap"
                                class="calculator-form__button calculator-form__button--secondary td-button"
                            >
                                Swap
                            </button>

                            <button
                                type="button"
                                id="td-copy"
                                class="calculator-form__button calculator-form__button--secondary td-button"
                                disabled
                            >
                                Copy diff
                            </button>

                            <button
                                type="button"
                                id="td-reset"
                                class="calculator-form__button calculator-form__button--secondary td-button"
                            >
                                Reset
                            </button>

                        </div>

                        <p class="td-keys">
                            <kbd>Ctrl</kbd> or <kbd>⌘</kbd> + <kbd>Enter</kbd> compares.
                        </p>

                    </div>


                    <div
                        class="td-result"
                        aria-labelledby="td-result-title"
                    >

                        <h2
                            id="td-result-title"
                            class="td-result__title"
                        >
                            Differences
                        </h2>

                        <p
                            id="td-status"
                            class="td-status"
                        >Paste text into both boxes to compare, or try an example.</p>

                        <ul
                            id="td-summary"
                            class="td-summary"
                            aria-label="Summary"
                            hidden
                        ></ul>

                        <p
                            id="td-note"
                            class="td-note"
                            hidden
                        ></p>

                        <div
                            id="td-scroll"
                            class="td-scroll"
                            tabindex="0"
                            role="region"
                            aria-label="Line by line differences"
                            hidden
                        >
                            <ol
                                id="td-lines"
                                class="td-lines"
                            ></ol>
                        </div>

                        <button
                            type="button"
                            id="td-more"
                            class="calculator-form__button calculator-form__button--secondary td-button td-more"
                            hidden
                        ></button>

                    </div>

                </div>

            </section>

            <p
                id="td-live"
                class="td-sr"
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
                        Paste the older text into <strong>Original</strong> and
                        the newer text into <strong>Changed</strong>.
                    </li>
                    <li>
                        The differences appear a moment later. Added lines are
                        marked <strong>+</strong>, removed lines
                        <strong>−</strong>, and a line that was edited is shown
                        as the old line over the new one with the changed words
                        crossed out or underlined.
                    </li>
                    <li>
                        Use <strong>Swap</strong> to compare in the other
                        direction, <strong>Copy diff</strong> to copy the
                        differences as a standard unified diff, and
                        <strong>Reset</strong> to start again.
                    </li>
                </ol>

                <p>
                    Comparing two JSON documents? Format both with the
                    <a href="${JSON_TOOL.href}">${JSON_TOOL.title}</a>
                    first, so differences in spacing do not hide the real
                    changes.
                </p>

            </section>


            <!-- WHAT COUNTS -->

            <section class="calculator-info">

                <h2>
                    What Counts as a Difference
                </h2>

                <p>
                    The comparison works line by line. A line is
                    <strong>added</strong> or <strong>removed</strong> when it
                    exists on only one side. When a removed line and an added
                    line right next to it are similar, they are shown together
                    as <strong>changed</strong> and compared word by word. Lines
                    far apart are never matched with each other.
                </p>

                <p>
                    Spaces and tabs count by default, so indentation changes in
                    code or configuration show up. Tick <em>Ignore
                    whitespace-only changes</em> to treat runs of spaces and
                    tabs, and spaces at the start or end of a line, as the same.
                    It never joins words: <code>hello world</code> and
                    <code>helloworld</code> are still different. Windows and
                    Unix line endings are treated as the same, and so is a
                    missing newline at the very end. Upper and lower case are
                    always different.
                </p>

            </section>


            <!-- LIMITS -->

            <section class="calculator-info">

                <h2>
                    Limits and Privacy
                </h2>

                <p>
                    ${limitText} Anything larger is refused with a message
                    rather than cut short. Very large comparisons wait for the
                    Compare button so the page stays responsive. If two texts
                    have almost nothing in common, the page says the result is
                    shown as a replaced block rather than a minimal diff.
                </p>

                <p>
                    Both texts stay in your browser. They are not uploaded, not
                    saved and not put in the page address. Reloading the page
                    clears them.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    Frequently Asked Questions
                </h2>

                <details>
                    <summary>
                        Is my text sent anywhere?
                    </summary>
                    <p>
                        No. The comparison runs in your browser and the text is
                        not uploaded or stored by ToolZen Hub.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is a line shown as removed and added instead of changed?
                    </summary>
                    <p>
                        A line is only shown as changed when it is next to its
                        replacement and the two share enough words. Otherwise
                        showing it as removed and added is the more honest
                        description.
                    </p>
                </details>

                <details>
                    <summary>
                        Why do two texts that look the same show differences?
                    </summary>
                    <p>
                        Usually trailing spaces, tabs instead of spaces, or
                        look-alike characters such as a non-breaking space or a
                        curly quote. Ticking <em>Ignore whitespace-only
                        changes</em> hides the first two.
                    </p>
                </details>

                <details>
                    <summary>
                        What does Copy diff copy?
                    </summary>
                    <p>
                        A standard unified diff: <code>---</code> and
                        <code>+++</code> headings, <code>@@</code> hunk headers,
                        three unchanged lines of context, <code>-</code> for
                        removed lines and <code>+</code> for added ones. Other
                        diff and patch tools can read it.
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

    const panel = document.querySelector("#td-panel");

    if (!panel) {
        return;
    }

    const original = document.querySelector("#td-original");
    const changed = document.querySelector("#td-changed");
    const originalMeta = document.querySelector("#td-original-meta");
    const changedMeta = document.querySelector("#td-changed-meta");
    const ignore = document.querySelector("#td-ignore");
    const wrap = document.querySelector("#td-wrap");
    const status = document.querySelector("#td-status");
    const summaryList = document.querySelector("#td-summary");
    const note = document.querySelector("#td-note");
    const scroll = document.querySelector("#td-scroll");
    const lines = document.querySelector("#td-lines");
    const more = document.querySelector("#td-more");
    const live = document.querySelector("#td-live");

    const buttons = {
        compare: document.querySelector("#td-compare"),
        swap: document.querySelector("#td-swap"),
        copy: document.querySelector("#td-copy"),
        reset: document.querySelector("#td-reset"),
        example: document.querySelector("#td-example")
    };

    let autoTimer = null;
    let announceTimer = null;

    /* bumps on every run so a slow, superseded run is dropped */
    let runId = 0;

    let current = null;
    let items = [];
    let shown = 0;
    let lastAnnounced = "";


    /* ---------- small helpers ---------- */

    function announce(message) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {

            if (message === lastAnnounced) {
                return;
            }

            lastAnnounced = message;

            live.textContent = "";

            setTimeout(() => {
                live.textContent = message;
            }, 50);

        }, ANNOUNCE_DELAY_MS);

    }

    function announceNow(message) {

        clearTimeout(announceTimer);

        lastAnnounced = message;

        live.textContent = "";

        setTimeout(() => {
            live.textContent = message;
        }, 50);

    }

    function setState(state, text) {

        panel.dataset.state = state;

        status.textContent = text;

    }

    function element(tag, className, text) {

        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        if (text !== undefined) {
            node.textContent = text;
        }

        return node;

    }

    function describeSide(text) {

        const count = splitLines(text).length;

        return `${fmt(count)} ${count === 1 ? "line" : "lines"} · ${fmt(text.length)} ${text.length === 1 ? "character" : "characters"}`;

    }

    function updateMeta() {

        for (const [box, meta, name] of [[original, originalMeta, "Original"], [changed, changedMeta, "Changed"]]) {

            const over = box.value.length > LIMITS.maxChars || splitLines(box.value).length > LIMITS.maxLines;

            meta.textContent = over
                ? `${describeSide(box.value)} · over the limit`
                : describeSide(box.value);

            meta.dataset.over = over ? "true" : "false";

            if (over) {
                box.setAttribute("aria-invalid", "true");
            } else {
                box.removeAttribute("aria-invalid");
            }

        }

        /* the example is offered only while both boxes are empty */
        buttons.example.hidden = eitherFilled();

    }

    function clearResult() {

        current = null;
        items = [];
        shown = 0;

        lines.replaceChildren();
        scroll.hidden = true;
        more.hidden = true;
        summaryList.replaceChildren();
        summaryList.hidden = true;
        note.hidden = true;
        note.textContent = "";
        buttons.copy.disabled = true;

        panel.removeAttribute("aria-busy");

    }

    function bothFilled() {

        return original.value !== "" && changed.value !== "";

    }

    function eitherFilled() {

        return original.value !== "" || changed.value !== "";

    }

    function autoEligible() {

        return original.value.length + changed.value.length <= LIMITS.autoChars;

    }


    /* ---------- the result list ---------- */

    function textNode(parent, text) {

        if (text === "") {

            parent.append(element("span", "td-blank", "(blank line)"));

            return;

        }

        parent.append(document.createTextNode(text));

    }

    function wordsInto(parent, segments, tag) {

        for (const [text, isChanged] of segments) {

            if (isChanged) {
                parent.append(element(tag, "td-w", text));
            } else {
                parent.append(document.createTextNode(text));
            }

        }

    }

    /* one line of the list: numbers, a symbol, a spoken label and the text */
    function lineElement(kind, oldNo, newNo, mark, label, build) {

        const line = element("div", `td-line td-line--${kind}`);

        line.append(
            element("span", "td-no", oldNo === null ? "" : String(oldNo)),
            element("span", "td-no", newNo === null ? "" : String(newNo)),
            element("span", "td-mark", mark)
        );

        line.children[0].setAttribute("aria-hidden", "true");
        line.children[1].setAttribute("aria-hidden", "true");
        line.children[2].setAttribute("aria-hidden", "true");

        const body = element("span", "td-body");

        body.append(element("span", "td-sr", label));

        const text = element("span", "td-text-line");

        build(text);

        body.append(text);
        line.append(body);

        return line;

    }

    function rowElement(row) {

        const item = element("li", `td-row td-row--${row.kind}`);

        if (row.kind === "same") {

            item.append(lineElement("same", row.a, row.b, "", `Unchanged, line ${row.b}: `, (t) => textNode(t, row.bText)));

        } else if (row.kind === "add") {

            item.append(lineElement("add", null, row.b, "+", `Added, line ${row.b}: `, (t) => textNode(t, row.bText)));

        } else if (row.kind === "del") {

            item.append(lineElement("del", row.a, null, "−", `Removed, line ${row.a}: `, (t) => textNode(t, row.aText)));

        } else {

            item.append(
                lineElement("del", row.a, null, "−", `Changed, old line ${row.a}: `, (t) => wordsInto(t, row.aWords, "del")),
                lineElement("add", null, row.b, "+", `Changed, new line ${row.b}: `, (t) => wordsInto(t, row.bWords, "ins"))
            );

        }

        return item;

    }

    function gapElement(item) {

        const li = element("li", "td-gap");

        const button = element("button", "td-gap__button", `Show ${fmt(item.rows.length)} unchanged ${item.rows.length === 1 ? "line" : "lines"}`);

        button.type = "button";

        button.addEventListener("click", () => {

            const rows = item.rows.map(rowElement);

            li.replaceWith(...rows);

            rows[0].tabIndex = -1;
            rows[0].focus();

            announceNow(`Showing ${fmt(item.rows.length)} unchanged lines.`);

        });

        li.append(button);

        return li;

    }

    function renderMore() {

        const next = items.slice(shown, shown + CHUNK);

        const fragment = document.createDocumentFragment();

        for (const item of next) {
            fragment.append(item.type === "gap" ? gapElement(item) : rowElement(item.row));
        }

        lines.append(fragment);

        shown += next.length;

        const left = items.length - shown;

        more.hidden = left <= 0;

        if (left > 0) {
            more.textContent = `Show more (${fmt(left)} more ${left === 1 ? "item" : "items"})`;
        }

    }

    function showSummary(summary) {

        summaryList.replaceChildren();

        const chips = [
            ["add", "+", `${fmt(summary.added)} added`, summary.added],
            ["del", "−", `${fmt(summary.removed)} removed`, summary.removed],
            ["mod", "~", `${fmt(summary.changed)} changed`, summary.changed],
            ["same", "", `${fmt(summary.unchanged)} unchanged`, summary.unchanged]
        ];

        for (const [kind, symbol, text, count] of chips) {

            if (count === 0 && kind !== "same") {
                continue;
            }

            const chip = element("li", `td-chip td-chip--${kind}`);

            if (symbol) {
                const mark = element("span", "td-chip__mark", symbol);
                mark.setAttribute("aria-hidden", "true");
                chip.append(mark);
            }

            chip.append(document.createTextNode(text));

            summaryList.append(chip);

        }

        summaryList.hidden = false;

    }

    function showResult(result) {

        clearResult();

        current = result;

        const summary = result.summary;

        const digits = String(Math.max(summary.originalLines, summary.changedLines, 1)).length;

        lines.style.setProperty("--td-digits", String(digits));

        if (summary.identical) {

            setState("identical", "No differences found.");

            if (result.whitespaceOnly) {

                note.textContent = "Whitespace-only differences are ignored.";
                note.hidden = false;

            }

            announce("No differences found.");

            return;

        }

        const text = describeSummary(summary);

        setState("result", text);

        showSummary(summary);

        if (result.approximate) {

            note.textContent = "These texts have very little in common, so part of the result is shown as a replaced block rather than a minimal diff.";
            note.hidden = false;

        } else if (result.whitespaceOnly) {

            note.textContent = "Whitespace-only differences are ignored.";
            note.hidden = false;

        } else if (original.value === "") {

            note.textContent = "Original is empty, so every line of Changed is shown as added.";
            note.hidden = false;

        } else if (changed.value === "") {

            note.textContent = "Changed is empty, so every line of Original is shown as removed.";
            note.hidden = false;

        }

        items = collapseRows(result.rows);
        shown = 0;

        scroll.hidden = false;

        renderMore();

        buttons.copy.disabled = false;

        announce(text);

    }


    /* ---------- comparing ---------- */

    function waitForPaint() {

        return new Promise((resolve) => setTimeout(resolve, 30));

    }

    async function run() {

        clearTimeout(autoTimer);

        const id = ++runId;

        updateMeta();

        if (!eitherFilled()) {

            clearResult();

            setState("empty", "Paste text into both boxes to compare, or try an example.");

            return;

        }

        const refused = checkLimits(original.value, changed.value);

        if (refused) {

            clearResult();

            setState("refused", refused.message);

            announceNow(refused.message);

            return;

        }

        const big = original.value.length + changed.value.length > LIMITS.autoChars;

        if (big) {

            setState("busy", "Comparing…");

            panel.setAttribute("aria-busy", "true");

            await waitForPaint();

            if (id !== runId) {
                return;
            }

        }

        const result = compare(original.value, changed.value, {
            ignoreWhitespace: ignore.checked
        });

        panel.removeAttribute("aria-busy");

        if (id !== runId) {
            return;
        }

        if (!result.ok) {

            clearResult();

            setState("refused", result.message);

            return;

        }

        showResult(result);

    }

    function schedule() {

        clearTimeout(autoTimer);

        updateMeta();

        runId++;

        if (!eitherFilled()) {

            clearResult();

            setState("empty", "Paste text into both boxes to compare, or try an example.");

            return;

        }

        if (!bothFilled()) {

            clearResult();

            setState("waiting", original.value === ""
                ? "Add the Original text to compare, or press Compare to see every line as added."
                : "Add the Changed text to compare, or press Compare to see every line as removed.");

            return;

        }

        if (!autoEligible()) {

            clearResult();

            setState("waiting", "This is a large comparison. Press Compare to run it.");

            return;

        }

        autoTimer = setTimeout(run, AUTO_DELAY_MS);

    }


    /* ---------- actions ---------- */

    function swap() {

        const first = original.value;

        original.value = changed.value;
        changed.value = first;

        updateMeta();

        if (bothFilled() && (current || autoEligible())) {
            run();
        } else {
            schedule();
        }

    }

    function reset() {

        clearTimeout(autoTimer);

        runId++;

        original.value = "";
        changed.value = "";
        ignore.checked = false;
        wrap.checked = true;

        applyWrap();

        clearResult();
        updateMeta();

        setState("empty", "Paste text into both boxes to compare, or try an example.");

        announceNow("Cleared.");

        original.focus();

    }

    function loadExample() {

        original.value = EXAMPLE.original;
        changed.value = EXAMPLE.changed;

        run();

    }

    function applyWrap() {

        scroll.dataset.wrap = wrap.checked ? "true" : "false";

    }

    async function copyDiff() {

        if (!current || current.summary.identical) {
            return;
        }

        const text = toUnifiedDiff(current);

        let copied = false;

        try {

            await navigator.clipboard.writeText(text);

            copied = true;

        } catch {

            const area = document.createElement("textarea");

            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";

            document.body.append(area);
            area.select();

            try {
                copied = document.execCommand("copy");
            } catch {
                copied = false;
            }

            area.remove();

        }

        announceNow(copied ? "Diff copied to the clipboard." : "The diff could not be copied automatically.");

        buttons.copy.textContent = copied ? "Copied" : "Copy failed";

        setTimeout(() => {
            buttons.copy.textContent = "Copy diff";
        }, 1800);

    }


    /* ---------- wiring ---------- */

    for (const box of [original, changed]) {

        box.addEventListener("input", schedule);

        box.addEventListener("keydown", (event) => {

            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {

                event.preventDefault();

                run();

            }

        });

    }

    ignore.addEventListener("change", () => {

        if (eitherFilled() && (current || (bothFilled() && autoEligible()))) {
            run();
        }

    });

    wrap.addEventListener("change", applyWrap);

    more.addEventListener("click", () => {

        const before = lines.children.length;

        renderMore();

        const first = lines.children[before];

        if (first) {
            first.tabIndex = -1;
            first.focus();
        }

    });

    buttons.compare.addEventListener("click", run);
    buttons.swap.addEventListener("click", swap);
    buttons.copy.addEventListener("click", copyDiff);
    buttons.reset.addEventListener("click", reset);
    buttons.example.addEventListener("click", loadExample);

    applyWrap();
    updateMeta();

    panel.dataset.ready = "true";

}
