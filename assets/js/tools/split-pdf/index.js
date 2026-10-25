/* =========================================================
   ToolZen Hub
   Split PDF (PDF Tools)

   Choose one PDF, say how to cut it (every N pages, or at page ranges),
   press Split PDF, download each part. Everything happens in the
   browser: the file is never uploaded, stored or put in the address,
   and the page loads no script from another site.

   The rules (limits, ranges, plans, wording) are in
   ../pdf-shared/pdf-rules.js; cutting is ../pdf-shared/pdf-ops.js with
   the vendored pdf-lib. This file is the page around them. See
   docs/tool-packs/33-pdf-tools-batch.md.

   Memory: the chosen File is opened once to count its pages and its
   bytes are dropped, then read again while the parts are made. Every
   download address is kept in one store and revoked when the settings
   change, on Reset and when the page is left. A late answer from an
   earlier run is dropped. There is no ZIP in this version: each part is
   its own download.
========================================================= */

import {
    MAX_FILE_BYTES,
    MAX_PARTS,
    MAX_PAGES,
    NOT_KEPT_NOTE,
    formatBytes,
    planEveryN,
    planRangeParts,
    describePart,
    partName
} from "../pdf-shared/pdf-rules.js";

import { splitPdf, loadPdfLib, classifyError } from "../pdf-shared/pdf-ops.js";

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

const TITLE = getToolById("split-pdf").title;

const MERGE_TOOL = getToolById("merge-pdf");
const PAGES_TOOL = getToolById("pdf-pages");


/* =========================================================
   MARKUP
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            ${introHtml(TITLE, "Cut one PDF into smaller PDFs: every few pages, or at the page ranges you choose.")}

            <section class="calculator-section">

                <div
                    id="sp-panel"
                    class="pt-workspace"
                    data-state="empty"
                >

                    <div
                        id="sp-editable"
                        class="pt-editable"
                    >

                        ${chooseFileHtml("sp", {
                            step: 1,
                            label: "Add a PDF file",
                            multiple: false,
                            hint: `One PDF, up to ${formatBytes(MAX_FILE_BYTES)} and ${MAX_PAGES} pages. It is cut in your browser and is not uploaded by this tool. A password-protected PDF is not accepted. Choosing another PDF replaces this one.`
                        })}

                        <div class="pt-card">

                            <h2 class="pt-card__title">
                                2. Choose how to cut it
                            </h2>

                            <p
                                id="sp-summary"
                                class="pt-summary"
                            ></p>

                            <p
                                id="sp-empty"
                                class="pt-empty"
                            >
                                No PDF yet. Choose one above.
                            </p>

                            <div
                                id="sp-settings"
                                hidden
                            >

                                <fieldset class="pt-fieldset">

                                    <legend>
                                        How to cut it
                                    </legend>

                                    <label class="pt-choice">
                                        <input
                                            type="radio"
                                            name="sp-mode"
                                            id="sp-mode-every"
                                            value="every"
                                            checked
                                        >
                                        <span>Every few pages</span>
                                    </label>

                                    <label class="pt-choice">
                                        <input
                                            type="radio"
                                            name="sp-mode"
                                            id="sp-mode-ranges"
                                            value="ranges"
                                        >
                                        <span>At page ranges</span>
                                    </label>

                                </fieldset>

                                <div
                                    id="sp-every-field"
                                    class="pt-field"
                                >

                                    <label for="sp-n">
                                        Pages in each part
                                    </label>

                                    <input
                                        type="text"
                                        inputmode="numeric"
                                        autocomplete="off"
                                        id="sp-n"
                                        class="pt-input"
                                        value="1"
                                        aria-describedby="sp-plan-note"
                                    >

                                </div>

                                <div
                                    id="sp-ranges-field"
                                    class="pt-field"
                                    hidden
                                >

                                    <label for="sp-ranges">
                                        Page ranges, one part for each
                                    </label>

                                    <input
                                        type="text"
                                        autocomplete="off"
                                        spellcheck="false"
                                        id="sp-ranges"
                                        class="pt-input"
                                        placeholder="for example 1-3, 4-4, 5-12"
                                        aria-describedby="sp-plan-note"
                                    >

                                </div>

                                <p
                                    id="sp-plan-note"
                                    class="pt-note"
                                    role="status"
                                ></p>

                                <ol
                                    id="sp-plan"
                                    class="pt-plan"
                                    aria-label="The parts that will be made"
                                    hidden
                                ></ol>

                            </div>

                        </div>

                    </div>

                    ${actionsHtml("sp", { step: 3, createLabel: "Split PDF", hint: "Add a PDF to split it." })}

                    <div
                        id="sp-result"
                        class="pt-card pt-result"
                        hidden
                    >

                        <h2
                            id="sp-result-title"
                            class="pt-card__title"
                            tabindex="-1"
                        >
                            Your PDFs are ready
                        </h2>

                        <p
                            id="sp-result-summary"
                            class="pt-result__summary"
                        ></p>

                        <ul
                            id="sp-parts"
                            class="pt-parts"
                        ></ul>

                        <p class="pt-notes">
                            Each part is its own download. Changing the PDF or the way to cut it removes these files, so split it again afterwards. ${NOT_KEPT_NOTE}
                        </p>

                    </div>

                </div>

            </section>

            <p
                id="sp-live"
                class="pt-sr"
                role="status"
                aria-live="polite"
            ></p>

            ${howToHtml(TITLE, [
                "Choose a PDF.",
                "Choose <strong>Every few pages</strong> and the number of pages in each part, or <strong>At page ranges</strong> and write one range for each part, such as 1-3, 4-4, 5-12.",
                "Check the list of parts, press <strong>Split PDF</strong>, then download each part."
            ])}

            ${infoHtml("What Happens to Your PDF", [
                `Each part is a new PDF made of copied pages, in order. Page sizes and the way pages are turned are kept. ${NOT_KEPT_NOTE}`,
                `A part has to go forward: write 3-5, not 5-3. Ranges may overlap, because a part is only a copy. To join parts again, use <a href="${MERGE_TOOL.href}">${MERGE_TOOL.title}</a>. To build one PDF from pages in a different order, use <a href="${PAGES_TOOL.href}">${PAGES_TOOL.title}</a>.`
            ])}

            ${infoHtml("Limits and Privacy", [
                `One PDF up to ${formatBytes(MAX_FILE_BYTES)} and ${MAX_PAGES} pages, cut into at most ${MAX_PARTS} parts. Splitting takes memory, especially on a phone, so these limits are deliberately cautious. A password-protected PDF is refused: this tool does not remove protection. A damaged PDF is refused. Not every kind of PDF can be read.`,
                PRIVACY_TEXT
            ])}

            ${faqHtml([
                ["Why not one ZIP file?", "This version gives each part as its own download so it needs nothing beyond the PDF library. Your phone or browser may ask whether to allow several downloads."],
                ["Can I take pages out of the middle?", `Yes. Use <a href="${PAGES_TOOL.href}">${PAGES_TOOL.title}</a> to choose the pages you want, in the order you want, as one PDF.`],
                ["Why is my PDF refused as protected?", "A PDF with a password or restrictions cannot be opened here, and this tool does not remove protection. If you are allowed to, open it in a PDF reader that lets you, and save an unprotected copy."],
                ["Does it work without a connection?", "The tool cuts the PDF on your device and sends nothing anywhere. It still needs the page and its PDF library to have loaded first, and this version does not promise that it works offline."]
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

    const panel = document.querySelector("#sp-panel");

    if (!panel || panel.dataset.ready === "true") {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const fileInput = $("#sp-file");
    const editable = $("#sp-editable");
    const summary = $("#sp-summary");
    const emptyNote = $("#sp-empty");
    const settings = $("#sp-settings");
    const modeEvery = $("#sp-mode-every");
    const modeRanges = $("#sp-mode-ranges");
    const everyField = $("#sp-every-field");
    const rangesField = $("#sp-ranges-field");
    const everyInput = $("#sp-n");
    const rangesInput = $("#sp-ranges");
    const planNote = $("#sp-plan-note");
    const planList = $("#sp-plan");
    const createButton = $("#sp-create");
    const createHint = $("#sp-create-hint");
    const cancelButton = $("#sp-cancel");
    const resetButton = $("#sp-reset");
    const progress = $("#sp-progress");
    const resultCard = $("#sp-result");
    const resultTitle = $("#sp-result-title");
    const resultSummary = $("#sp-result-summary");
    const partsList = $("#sp-parts");

    const { announce, showErrors } = createMessenger({ live: $("#sp-live"), errorBox: $("#sp-error") });
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
        plan: null,
        epoch: 0,
        adding: false,
        job: null
    };

    /* ---------- the finished PDFs ---------- */

    function clearResult(explain) {

        const revoked = urls.revokeAll();
        const had = !resultCard.hidden || revoked;

        partsList.replaceChildren();
        resultCard.hidden = true;

        if (had && explain) {
            note = "The parts were removed because the PDF or the way to cut it changed. Split it again.";
        }

    }

    /* ---------- the plan ---------- */

    function readPlan() {

        if (!state.file) {
            return null;
        }

        return modeRanges.checked
            ? planRangeParts(rangesInput.value, state.pageCount)
            : planEveryN(state.pageCount, everyInput.value.trim());

    }

    function showPlan() {

        state.plan = readPlan();

        planList.replaceChildren();

        if (!state.plan) {
            planNote.textContent = "";
            planList.hidden = true;
            return;
        }

        if (!state.plan.ok) {

            /* an empty ranges box is not an error yet */
            planNote.textContent = modeRanges.checked && rangesInput.value.trim() === "" ? "Write the ranges, one for each part." : state.plan.message;
            planList.hidden = true;

            return;

        }

        const parts = state.plan.parts;

        planNote.textContent = `${parts.length} ${parts.length === 1 ? "part" : "parts"} will be made.`;

        planList.replaceChildren(...parts.map((part, index) => {
            const li = document.createElement("li");
            li.textContent = describePart(part, index);
            return li;
        }));

        planList.hidden = false;

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

        createHint.textContent = working ? "" : !has ? "Add a PDF to split it." : !ready ? "Fix the way to cut it above, then press Split PDF." : "";

        summary.textContent = has ? `${state.name}: ${state.pageCount} ${state.pageCount === 1 ? "page" : "pages"}, ${formatBytes(state.size)}.` : "";

        emptyNote.hidden = has;
        settings.hidden = !has;

        everyField.hidden = modeRanges.checked;
        rangesField.hidden = !modeRanges.checked;

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

        try {
            info = await inspectFile(file, await loadPdfLib());
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

        refresh();

        say(`${file.name} added: ${info.pageCount} ${info.pageCount === 1 ? "page" : "pages"}.`);

    }

    /* ---------- splitting ---------- */

    async function createParts() {

        if (busy() || !state.file || !state.plan || !state.plan.ok) {
            return;
        }

        showErrors([]);
        clearResult(false);

        const job = { id: ++state.epoch, cancelled: false };
        const file = state.file;
        const parts = state.plan.parts.slice();

        state.job = job;

        progress.hidden = false;
        progress.textContent = "Getting ready…";
        refresh();
        cancelButton.focus();
        say("Splitting the PDF.");

        try {

            const pdfLib = await loadPdfLib();
            const bytes = await readBytes(file);

            const result = await splitPdf({
                bytes,
                parts,
                pdfLib,
                isCancelled: () => job.cancelled,
                onProgress: (done, count) => {
                    if (!job.cancelled) progress.textContent = done < count ? `Making part ${done + 1} of ${count}…` : "Done.";
                }
            });

            if (job.cancelled || state.job !== job || result.cancelled) {
                return;
            }

            partsList.replaceChildren(...result.parts.map((part, index) => {

                const li = document.createElement("li");
                const text = document.createElement("span");
                const link = document.createElement("a");

                li.className = "pt-part";
                text.className = "pt-part__text";
                text.textContent = `${describePart(part, index)}, ${formatBytes(part.bytes.length)}`;

                link.className = "calculator-form__button pt-download";
                link.href = urls.make(part.bytes);
                link.download = partName(index);
                link.textContent = `Download ${partName(index)}`;

                li.append(text, link);

                return li;

            }));

            resultSummary.textContent = `${result.parts.length} ${result.parts.length === 1 ? "PDF" : "PDFs"} made from ${state.name}.`;
            resultCard.hidden = false;

            state.job = null;
            progress.hidden = true;
            refresh();

            resultTitle.focus();
            say(`Your PDFs are ready: ${result.parts.length} ${result.parts.length === 1 ? "part" : "parts"}.`);

        } catch (error) {

            if (job.cancelled || state.job !== job) {
                return;
            }

            state.job = null;
            progress.hidden = true;
            refresh();

            showErrors([`The PDF could not be split. ${classifyError(error).message} Try a smaller PDF.`]);
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
        say("Cancelled. No PDFs were made.");

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

        clearResult(false);
        showErrors([]);

        modeEvery.checked = true;
        everyInput.value = "1";
        rangesInput.value = "";
        fileInput.value = "";
        progress.hidden = true;

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

    for (const control of [modeEvery, modeRanges, everyInput, rangesInput]) {
        control.addEventListener(control.type === "text" ? "input" : "change", onSettingChange);
    }

    createButton.addEventListener("click", createParts);
    cancelButton.addEventListener("click", cancelJob);
    resetButton.addEventListener("click", reset);

    window.addEventListener("pagehide", () => clearResult(false));

    refresh();

    panel.dataset.ready = "true";

}
