/* =========================================================
   ToolZen Hub
   Extract, Reorder and Rotate PDF Pages (PDF Tools)

   Choose one PDF, write which pages to keep and in what order, choose
   whether to turn them, press Create PDF, download. Everything happens
   in the browser: the file is never uploaded, stored or put in the
   address, and the page loads no script from another site.

   The rules (limits, the page grammar, the plan, wording) are in
   ../pdf-shared/pdf-rules.js; building the new PDF is
   ../pdf-shared/pdf-ops.js with the vendored pdf-lib. This file is the
   page around them. See docs/tool-packs/33-pdf-tools-batch.md.

   Memory: the chosen File is opened once to count its pages and note
   their sizes, and its bytes are dropped, then read again while the new
   PDF is built. The one object URL (the new PDF) is revoked when it is
   replaced, when a setting changes, on Reset and when the page is left.
   A late answer from an earlier run is dropped. There are no page
   pictures in this version: pages are chosen by number.
========================================================= */

import {
    MAX_FILE_BYTES,
    MAX_PAGES,
    PAGES_NAME,
    TURNS,
    NOT_KEPT_NOTE,
    formatBytes,
    planPages,
    describeEntry,
    describePages
} from "../pdf-shared/pdf-rules.js";

import { buildPagesPdf, loadPdfLib, classifyError, pageFacts } from "../pdf-shared/pdf-ops.js";

import {
    inspectFile,
    readBytes,
    createMessenger,
    createUrlStore,
    introHtml,
    chooseFileHtml,
    actionsHtml,
    howToHtml,
    infoHtml,
    faqHtml,
    PRIVACY_TEXT
} from "../pdf-shared/pdf-page.js";

import { getToolById } from "../../data/tools.js";


export const showRelatedCalculators = false;
export const showRelatedArticles = false;

const TITLE = getToolById("pdf-pages").title;

const MERGE_TOOL = getToolById("merge-pdf");
const SPLIT_TOOL = getToolById("split-pdf");

/* the longest lists written into the page; the PDF itself is not limited by them */
const SHOWN_PLAN = 100;
const SHOWN_FACTS = 200;


/* =========================================================
   MARKUP
========================================================= */

export function markup() {

    const turns = TURNS.map((turn) => `
                                        <option value="${turn.id}">${turn.label}</option>`).join("");

    return `
        <div class="calculator-page">

            ${introHtml(TITLE, "Make a new PDF from the pages you choose, in the order you choose, and turn pages that are sideways.")}

            <section class="calculator-section">

                <div
                    id="pg-panel"
                    class="pt-workspace"
                    data-state="empty"
                >

                    <div
                        id="pg-editable"
                        class="pt-editable"
                    >

                        ${chooseFileHtml("pg", {
                            step: 1,
                            label: "Add a PDF file",
                            multiple: false,
                            hint: `One PDF, up to ${formatBytes(MAX_FILE_BYTES)} and ${MAX_PAGES} pages. It is changed in your browser and is not uploaded by this tool. A password-protected PDF is not accepted. Choosing another PDF replaces this one.`
                        })}

                        <div class="pt-card">

                            <h2 class="pt-card__title">
                                2. Choose the pages
                            </h2>

                            <p
                                id="pg-summary"
                                class="pt-summary"
                            ></p>

                            <p
                                id="pg-empty"
                                class="pt-empty"
                            >
                                No PDF yet. Choose one above.
                            </p>

                            <div
                                id="pg-settings"
                                hidden
                            >

                                <div class="pt-field">

                                    <label for="pg-keep">
                                        Pages to keep, in order
                                    </label>

                                    <input
                                        type="text"
                                        autocomplete="off"
                                        spellcheck="false"
                                        id="pg-keep"
                                        class="pt-input"
                                        value="all"
                                        aria-describedby="pg-keep-hint pg-plan-note"
                                    >

                                    <p
                                        id="pg-keep-hint"
                                        class="pt-note"
                                    >
                                        For example 3, 1, 5-8. A page can be
                                        written twice. 8-5 goes backwards. "all"
                                        means every page.
                                    </p>

                                </div>

                                <div class="pt-fields">

                                    <div class="pt-field">

                                        <label for="pg-turn">
                                            Turn the pages
                                        </label>

                                        <select
                                            id="pg-turn"
                                            class="pt-select"
                                        >${turns}
                                        </select>

                                    </div>

                                    <div class="pt-field">

                                        <label for="pg-apply">
                                            Turn
                                        </label>

                                        <select
                                            id="pg-apply"
                                            class="pt-select"
                                            aria-describedby="pg-apply-note"
                                        >
                                            <option value="all">All the pages I keep</option>
                                            <option value="some">Only these pages of the original</option>
                                        </select>

                                        <p
                                            id="pg-apply-note"
                                            class="pt-note"
                                        ></p>

                                    </div>

                                </div>

                                <div
                                    id="pg-some-field"
                                    class="pt-field"
                                    hidden
                                >

                                    <label for="pg-some">
                                        Original pages to turn
                                    </label>

                                    <input
                                        type="text"
                                        autocomplete="off"
                                        spellcheck="false"
                                        id="pg-some"
                                        class="pt-input"
                                        placeholder="for example 2, 4-6"
                                        aria-describedby="pg-plan-note"
                                    >

                                </div>

                                <p
                                    id="pg-plan-note"
                                    class="pt-note"
                                    role="status"
                                ></p>

                                <ol
                                    id="pg-plan"
                                    class="pt-plan"
                                    aria-label="The pages of the new PDF"
                                    hidden
                                ></ol>

                                <details class="pt-facts">

                                    <summary>
                                        The pages of this PDF
                                    </summary>

                                    <ul
                                        id="pg-facts"
                                        class="pt-facts__list"
                                    ></ul>

                                </details>

                            </div>

                        </div>

                    </div>

                    ${actionsHtml("pg", { step: 3, createLabel: "Create PDF", hint: "Add a PDF to choose its pages." })}

                    <div
                        id="pg-result"
                        class="pt-card pt-result"
                        hidden
                    >

                        <h2
                            id="pg-result-title"
                            class="pt-card__title"
                            tabindex="-1"
                        >
                            Your PDF is ready
                        </h2>

                        <p
                            id="pg-result-summary"
                            class="pt-result__summary"
                        ></p>

                        <a
                            id="pg-download"
                            class="calculator-form__button pt-download"
                            href="#"
                            download="${PAGES_NAME}"
                        >
                            Download PDF
                        </a>

                        <p class="pt-notes">
                            Changing the PDF or the pages removes this file, so create it again afterwards. ${NOT_KEPT_NOTE}
                        </p>

                    </div>

                </div>

            </section>

            <p
                id="pg-live"
                class="pt-sr"
                role="status"
                aria-live="polite"
            ></p>

            ${howToHtml(TITLE, [
                "Choose a PDF. The page count and the size of each page are shown.",
                "Write the pages to keep, in the order you want them, such as 3, 1, 5-8. To remove pages, leave them out. To put pages in a new order, write them in that order.",
                "To turn pages, choose a turn and say whether it applies to every page you keep or only to some pages of the original.",
                "Check the list of pages shown, press <strong>Create PDF</strong>, then <strong>Download PDF</strong>."
            ])}

            ${infoHtml("What Happens to Your PDF", [
                `The pages you choose are copied, in your order, into one new PDF. A turn is added to the way the page was already turned, so a page that was turned 90° and is turned 90° more ends up turned 180°. Page sizes are kept. ${NOT_KEPT_NOTE}`,
                `Pages are chosen by their number, because this version shows no pictures of the pages. The PDF is not changed, only copied: the file you chose stays as it was. To join PDFs, use <a href="${MERGE_TOOL.href}">${MERGE_TOOL.title}</a>. To cut a PDF into several files, use <a href="${SPLIT_TOOL.href}">${SPLIT_TOOL.title}</a>.`
            ])}

            ${infoHtml("Limits and Privacy", [
                `One PDF up to ${formatBytes(MAX_FILE_BYTES)} and ${MAX_PAGES} pages, and up to ${MAX_PAGES} pages in the new PDF. Making a PDF takes memory, especially on a phone, so these limits are deliberately cautious. A password-protected PDF is refused: this tool does not remove protection. A damaged PDF is refused. Not every kind of PDF can be read.`,
                PRIVACY_TEXT
            ])}

            ${faqHtml([
                ["How do I delete a page?", "Write the pages you want to keep and leave the others out. To delete page 3 of a 10-page PDF, write 1-2, 4-10."],
                ["How do I turn only one page?", "Choose a turn, then choose “Only these pages of the original” and write the page number, such as 4."],
                ["Why is my PDF refused as protected?", "A PDF with a password or restrictions cannot be opened here, and this tool does not remove protection. If you are allowed to, open it in a PDF reader that lets you, and save an unprotected copy."],
                ["Does it work without a connection?", "The tool builds the PDF on your device and sends nothing anywhere. It still needs the page and its PDF library to have loaded first, and this version does not promise that it works offline."]
            ])}

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

    const panel = document.querySelector("#pg-panel");

    if (!panel || panel.dataset.ready === "true") {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const fileInput = $("#pg-file");
    const editable = $("#pg-editable");
    const summary = $("#pg-summary");
    const emptyNote = $("#pg-empty");
    const settings = $("#pg-settings");
    const keepInput = $("#pg-keep");
    const turnSelect = $("#pg-turn");
    const applySelect = $("#pg-apply");
    const applyNote = $("#pg-apply-note");
    const someField = $("#pg-some-field");
    const someInput = $("#pg-some");
    const planNote = $("#pg-plan-note");
    const planList = $("#pg-plan");
    const factsList = $("#pg-facts");
    const createButton = $("#pg-create");
    const createHint = $("#pg-create-hint");
    const cancelButton = $("#pg-cancel");
    const resetButton = $("#pg-reset");
    const progress = $("#pg-progress");
    const resultCard = $("#pg-result");
    const resultTitle = $("#pg-result-title");
    const resultSummary = $("#pg-result-summary");
    const download = $("#pg-download");

    const { announce, showErrors } = createMessenger({ live: $("#pg-live"), errorBox: $("#pg-error") });
    const urls = createUrlStore();

    /* a message about a removed result waits to be spoken with the next announcement, so one never hides the other */
    let note = "";

    function say(message = "") {

        announce([message, note].filter(Boolean).join(" "));

        note = "";

    }

    const state = {
        file: null,
        name: "",
        size: 0,
        pageCount: 0,
        facts: [],
        plan: null,
        epoch: 0,
        adding: false,
        job: null
    };

    /* ---------- the finished PDF ---------- */

    function clearResult(explain) {

        const revoked = urls.revokeAll();
        const had = !resultCard.hidden || revoked;

        download.setAttribute("href", "#");
        resultCard.hidden = true;

        if (had && explain) {
            note = "The PDF was removed because the PDF or the pages changed. Create it again.";
        }

    }

    /* ---------- the plan ---------- */

    function showPlan() {

        planList.replaceChildren();
        planList.hidden = true;

        if (!state.file) {
            state.plan = null;
            planNote.textContent = "";
            return;
        }

        const turning = turnSelect.value !== "0";
        const some = turning && applySelect.value === "some";

        state.plan = planPages({
            pageCount: state.pageCount,
            keep: keepInput.value,
            turn: turnSelect.value,
            applyTo: some ? someInput.value : "all"
        });

        if (!state.plan.ok) {
            planNote.textContent = state.plan.message;
            return;
        }

        const entries = state.plan.entries;

        planNote.textContent = `The new PDF will have ${entries.length} ${entries.length === 1 ? "page" : "pages"}.`;

        const shown = entries.slice(0, SHOWN_PLAN).map((entry, index) => {
            const li = document.createElement("li");
            li.textContent = describeEntry(entry, index);
            return li;
        });

        if (entries.length > SHOWN_PLAN) {
            const li = document.createElement("li");
            li.value = SHOWN_PLAN + 1;
            li.textContent = `and ${entries.length - SHOWN_PLAN} more pages`;
            shown.push(li);
        }

        planList.replaceChildren(...shown);
        planList.hidden = false;

    }

    function showFacts() {

        const shown = state.facts.slice(0, SHOWN_FACTS).map((fact, index) => {

            const li = document.createElement("li");
            const turned = fact.rotation ? `, turned ${fact.rotation}°` : "";

            li.textContent = `Page ${index + 1}: ${Math.round(fact.width)} × ${Math.round(fact.height)} points${turned}`;

            return li;

        });

        if (state.facts.length > SHOWN_FACTS) {
            const li = document.createElement("li");
            li.textContent = `and ${state.facts.length - SHOWN_FACTS} more pages`;
            shown.push(li);
        }

        factsList.replaceChildren(...shown);

    }

    /* ---------- state of the page ---------- */

    function busy() {
        return state.adding || state.job !== null;
    }

    function refresh() {

        const working = state.job !== null;
        const has = state.file !== null;

        showPlan();

        panel.dataset.state = working ? "working" : !resultCard.hidden ? "done" : has ? "ready" : "empty";
        panel.setAttribute("aria-busy", busy() ? "true" : "false");

        editable.inert = busy();

        const ready = has && state.plan && state.plan.ok;

        createButton.disabled = busy() || !ready;
        cancelButton.hidden = !working;
        createButton.hidden = working;

        createHint.textContent = working ? "" : !has ? "Add a PDF to choose its pages." : !ready ? "Fix the pages above, then press Create PDF." : "";

        summary.textContent = has ? `${state.name}: ${state.pageCount} ${state.pageCount === 1 ? "page" : "pages"}, ${formatBytes(state.size)}.` : "";

        emptyNote.hidden = has;
        settings.hidden = !has;

        const turning = turnSelect.value !== "0";

        applySelect.disabled = !turning;
        applyNote.textContent = turning ? "" : "Not used: the pages are not being turned.";

        someField.hidden = !(turning && applySelect.value === "some");

    }

    /* ---------- choosing the PDF ---------- */

    async function addFile(file) {

        if (busy()) {
            return;
        }

        const epoch = state.epoch;

        state.adding = true;
        showErrors([]);
        clearResult(true);
        refresh();

        let info;
        let pdfLib = null;

        try {
            pdfLib = await loadPdfLib();
            info = await inspectFile(file, pdfLib);
        } catch {
            info = { ok: false, message: "The PDF library could not be loaded. Check your connection and reload the page." };
        }

        if (epoch !== state.epoch) return;

        state.adding = false;

        if (!info.ok) {

            showErrors([`${file.name}: ${info.message}`]);
            refresh();
            say("The PDF was not added.");

            return;

        }

        state.file = file;
        state.name = file.name;
        state.size = file.size;
        state.pageCount = info.pageCount;
        state.facts = pageFacts(info.doc);

        keepInput.value = "all";

        showFacts();
        refresh();

        say(`${file.name} added: ${info.pageCount} ${info.pageCount === 1 ? "page" : "pages"}.`);

    }

    /* ---------- creating the PDF ---------- */

    async function createPdf() {

        if (busy() || !state.file || !state.plan || !state.plan.ok) {
            return;
        }

        showErrors([]);
        clearResult(false);

        const job = { id: ++state.epoch, cancelled: false };
        const file = state.file;
        const entries = state.plan.entries.slice();

        state.job = job;

        progress.hidden = false;
        progress.textContent = "Getting ready…";
        refresh();
        cancelButton.focus();
        say("Creating the PDF.");

        try {

            const pdfLib = await loadPdfLib();
            const bytes = await readBytes(file);

            const result = await buildPagesPdf({
                bytes,
                entries,
                pdfLib,
                isCancelled: () => job.cancelled,
                onProgress: (done, count) => {
                    if (!job.cancelled) progress.textContent = done < count ? "Copying the pages…" : "Saving the PDF…";
                }
            });

            if (job.cancelled || state.job !== job || result.cancelled) {
                return;
            }

            download.setAttribute("href", urls.make(result.bytes));
            resultSummary.textContent = describePages({ pages: result.pages, bytes: result.bytes.length });
            resultCard.hidden = false;

            state.job = null;
            progress.hidden = true;
            refresh();

            resultTitle.focus();
            say(`Your PDF is ready: ${result.pages} ${result.pages === 1 ? "page" : "pages"}.`);

        } catch (error) {

            if (job.cancelled || state.job !== job) {
                return;
            }

            state.job = null;
            progress.hidden = true;
            refresh();

            showErrors([`The PDF could not be created. ${classifyError(error).message} Try a smaller PDF.`]);
            createButton.focus();

        }

    }

    function cancelJob() {

        if (!state.job) {
            return;
        }

        state.job.cancelled = true;
        state.job = null;
        state.epoch += 1;

        progress.hidden = true;
        refresh();

        createButton.focus();
        say("Cancelled. No PDF was made.");

    }

    /* ---------- settings and reset ---------- */

    function onSettingChange() {

        clearResult(true);
        refresh();

        say();

    }

    function reset() {

        if (state.job) {
            state.job.cancelled = true;
            state.job = null;
        }

        state.epoch += 1;
        state.adding = false;
        note = "";
        state.file = null;
        state.name = "";
        state.size = 0;
        state.pageCount = 0;
        state.facts = [];

        clearResult(false);
        showErrors([]);

        keepInput.value = "all";
        turnSelect.value = "0";
        applySelect.value = "all";
        someInput.value = "";
        fileInput.value = "";
        progress.hidden = true;

        factsList.replaceChildren();

        refresh();

        fileInput.focus();
        say("Reset.");

    }

    /* ---------- wiring ---------- */

    fileInput.addEventListener("change", () => {

        const file = (fileInput.files || [])[0];

        fileInput.value = "";

        if (file) {
            addFile(file);
        }

    });

    for (const input of [keepInput, someInput]) {
        input.addEventListener("input", onSettingChange);
    }

    for (const select of [turnSelect, applySelect]) {
        select.addEventListener("change", onSettingChange);
    }

    createButton.addEventListener("click", createPdf);
    cancelButton.addEventListener("click", cancelJob);
    resetButton.addEventListener("click", reset);

    window.addEventListener("pagehide", () => clearResult(false));

    refresh();

    panel.dataset.ready = "true";

}
