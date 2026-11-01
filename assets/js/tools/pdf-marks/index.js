/* =========================================================
   ToolZen Hub
   PDF Page Numbers and Watermark (PDF Tools)

   Choose one PDF, turn on page numbers, a text watermark or both, press
   Add marks, download the new PDF. Everything happens in the browser:
   the file is never uploaded, stored or put in the address, and the
   page loads no script from another site.

   The rules and the stamping are in ../pdf-shared/pdf-marks.js with the
   vendored pdf-lib; limits and file checks are shared with the other
   PDF tools. This file is the page around them. See
   docs/tool-packs/52-pdf-page-numbers-watermark.md.

   The original is never changed: a new PDF is made. The download
   address is kept in one store and revoked when a setting changes, on
   Reset and when the page is left. A late answer from an earlier run is
   dropped.
========================================================= */

import {
    MAX_FILE_BYTES,
    MAX_PAGES,
    NOT_KEPT_NOTE,
    formatBytes
} from "../pdf-shared/pdf-rules.js";

import { loadPdfLib, classifyError } from "../pdf-shared/pdf-ops.js";

import {
    NUMBER_FORMATS,
    POSITIONS,
    LIMITS,
    DEFAULT_SETTINGS,
    checkSettings,
    markPdf,
    markedName
} from "../pdf-shared/pdf-marks.js";

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

const TITLE = getToolById("pdf-marks").title;
const MERGE_TOOL = getToolById("merge-pdf");
const PAGES_TOOL = getToolById("pdf-pages");

const options = (list, selected) => list
    .map((o) => `<option value="${o.id}"${o.id === selected ? " selected" : ""}>${o.label}</option>`)
    .join("");

/* =========================================================
   MARKUP
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            ${introHtml(TITLE, "Add page numbers, a text watermark or both to a PDF. A new PDF is made; your original is not changed.")}

            <section class="calculator-section">

                <div
                    id="pm-panel"
                    class="pt-workspace"
                    data-state="empty"
                >

                    <div
                        id="pm-editable"
                        class="pt-editable"
                    >

                        ${chooseFileHtml("pm", {
                            step: 1,
                            label: "Add a PDF file",
                            multiple: false,
                            hint: `One PDF, up to ${formatBytes(MAX_FILE_BYTES)} and ${MAX_PAGES} pages. It is marked in your browser and is not uploaded by this tool. A password-protected PDF is not accepted. Choosing another PDF replaces this one.`
                        })}

                        <div class="pt-card">

                            <h2 class="pt-card__title">
                                2. Choose the marks
                            </h2>

                            <p id="pm-summary" class="pt-summary"></p>

                            <p id="pm-empty" class="pt-empty">
                                No PDF yet. Choose one above.
                            </p>

                            <div id="pm-settings" hidden>

                                <fieldset class="pt-fieldset">

                                    <legend>Page numbers</legend>

                                    <label class="pt-choice">
                                        <input type="checkbox" id="pm-numbers" checked>
                                        <span>Add page numbers</span>
                                    </label>

                                    <div class="pt-field">
                                        <label for="pm-format">How they read</label>
                                        <select id="pm-format" class="pt-input">${options(NUMBER_FORMATS, DEFAULT_SETTINGS.format)}</select>
                                    </div>

                                    <div class="pt-field">
                                        <label for="pm-position">Where they go</label>
                                        <select id="pm-position" class="pt-input">${options(POSITIONS, DEFAULT_SETTINGS.position)}</select>
                                    </div>

                                    <div class="pt-field">
                                        <label for="pm-start">First number</label>
                                        <input type="text" inputmode="numeric" autocomplete="off" id="pm-start" class="pt-input" value="${DEFAULT_SETTINGS.start}" aria-describedby="pm-start-note">
                                        <p id="pm-start-note" class="pt-note"></p>
                                    </div>

                                    <div class="pt-field">
                                        <label for="pm-size">Size (${LIMITS.fontMin} to ${LIMITS.fontMax})</label>
                                        <input type="text" inputmode="numeric" autocomplete="off" id="pm-size" class="pt-input" value="${DEFAULT_SETTINGS.numberSize}" aria-describedby="pm-size-note">
                                        <p id="pm-size-note" class="pt-note"></p>
                                    </div>

                                    <label class="pt-choice">
                                        <input type="checkbox" id="pm-skip">
                                        <span>Leave the first page without a number (a cover page)</span>
                                    </label>

                                </fieldset>

                                <fieldset class="pt-fieldset">

                                    <legend>Watermark</legend>

                                    <label class="pt-choice">
                                        <input type="checkbox" id="pm-watermark">
                                        <span>Add a text watermark</span>
                                    </label>

                                    <div class="pt-field">
                                        <label for="pm-text">Watermark text</label>
                                        <input type="text" autocomplete="off" spellcheck="false" id="pm-text" class="pt-input" maxlength="${LIMITS.watermarkMaxChars}" placeholder="for example DRAFT or CONFIDENTIAL" aria-describedby="pm-text-note">
                                        <p id="pm-text-note" class="pt-note"></p>
                                    </div>

                                    <div class="pt-field">
                                        <label for="pm-angle">Direction</label>
                                        <select id="pm-angle" class="pt-input">
                                            <option value="diagonal" selected>Diagonal</option>
                                            <option value="horizontal">Horizontal</option>
                                        </select>
                                    </div>

                                    <div class="pt-field">
                                        <label for="pm-opacity">Strength in percent (${LIMITS.opacityMin} to ${LIMITS.opacityMax})</label>
                                        <input type="text" inputmode="numeric" autocomplete="off" id="pm-opacity" class="pt-input" value="${DEFAULT_SETTINGS.watermarkOpacity}" aria-describedby="pm-opacity-note">
                                        <p id="pm-opacity-note" class="pt-note"></p>
                                    </div>

                                </fieldset>

                                <p id="pm-plan-note" class="pt-note" role="status"></p>

                            </div>

                        </div>

                    </div>

                    ${actionsHtml("pm", { step: 3, createLabel: "Add marks", hint: "Add a PDF to mark it." })}

                    <div id="pm-result" class="pt-card pt-result" hidden>

                        <h2 id="pm-result-title" class="pt-card__title" tabindex="-1">
                            Your PDF is ready
                        </h2>

                        <p id="pm-result-summary" class="pt-result__summary"></p>

                        <ul id="pm-parts" class="pt-parts"></ul>

                        <p class="pt-notes">
                            Changing the PDF or a setting removes this file, so add the marks again afterwards. ${NOT_KEPT_NOTE}
                        </p>

                    </div>

                </div>

            </section>

            <p id="pm-live" class="pt-sr" role="status" aria-live="polite"></p>

            ${howToHtml(TITLE, [
                "Choose a PDF.",
                "Turn on <strong>page numbers</strong>, a <strong>watermark</strong> or both, and choose how they look.",
                "Press <strong>Add marks</strong>, then download the new PDF."
            ])}

            ${infoHtml("What Happens to Your PDF", [
                `The marks are drawn on top of every page of a copy, in the standard Helvetica font, so a number or watermark sits over the page and does not change what is under it. Pages that are turned get their marks turned with them so they read upright. ${NOT_KEPT_NOTE}`,
                `A watermark is a visible mark on top of the page. It is not security: anyone can remove it with the right tool, and it does not stop copying. To choose which pages to keep first, use <a href="${PAGES_TOOL.href}">${PAGES_TOOL.title}</a>. To join PDFs before numbering them, use <a href="${MERGE_TOOL.href}">${MERGE_TOOL.title}</a>.`
            ])}

            ${infoHtml("Limits and Privacy", [
                `One PDF up to ${formatBytes(MAX_FILE_BYTES)} and ${MAX_PAGES} pages. Watermark text is limited to ${LIMITS.watermarkMaxChars} characters of the Western (Latin) alphabet. A password-protected PDF is refused: this tool does not remove protection. A damaged PDF is refused. Not every kind of PDF can be read.`,
                PRIVACY_TEXT
            ])}

            ${faqHtml([
                ["Can I start numbering at a number other than 1?", "Yes. Set the first number. With the cover page option on, the second page gets that first number."],
                ["Can I use a watermark in another script?", "Not yet. This version draws text with a standard font that holds the Western alphabet only, and it says so rather than drawing boxes."],
                ["Does it change the original file?", "No. A new PDF is made in your browser and the file you chose is left as it is."],
                ["Is a watermark a way to protect a document?", "No. It is a visible mark. It does not encrypt, lock or prevent copying."]
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

    const panel = document.querySelector("#pm-panel");

    if (!panel || panel.dataset.ready === "true") {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const fileInput = $("#pm-file");
    const editable = $("#pm-editable");
    const summary = $("#pm-summary");
    const emptyNote = $("#pm-empty");
    const settingsBox = $("#pm-settings");
    const planNote = $("#pm-plan-note");
    const createButton = $("#pm-create");
    const createHint = $("#pm-create-hint");
    const cancelButton = $("#pm-cancel");
    const resetButton = $("#pm-reset");
    const progress = $("#pm-progress");
    const resultCard = $("#pm-result");
    const resultTitle = $("#pm-result-title");
    const resultSummary = $("#pm-result-summary");
    const partsList = $("#pm-parts");

    const controls = {
        numbers: $("#pm-numbers"),
        format: $("#pm-format"),
        position: $("#pm-position"),
        start: $("#pm-start"),
        numberSize: $("#pm-size"),
        skipFirst: $("#pm-skip"),
        watermark: $("#pm-watermark"),
        watermarkText: $("#pm-text"),
        watermarkAngle: $("#pm-angle"),
        watermarkOpacity: $("#pm-opacity")
    };

    const notes = {
        start: $("#pm-start-note"),
        numberSize: $("#pm-size-note"),
        watermarkText: $("#pm-text-note"),
        watermarkOpacity: $("#pm-opacity-note")
    };

    const { announce, showErrors } = createMessenger({ live: $("#pm-live"), errorBox: $("#pm-error") });
    const urls = createUrlStore();

    let note = "";

    function say(message = "") {

        announce([message, note].filter(Boolean).join(" "));

        note = "";

    }

    const state = { file: null, name: "", size: 0, pageCount: 0, checked: null, epoch: 0, adding: false, job: null };

    function readSettings() {

        return {
            numbers: controls.numbers.checked,
            format: controls.format.value,
            position: controls.position.value,
            start: controls.start.value,
            numberSize: controls.numberSize.value,
            skipFirst: controls.skipFirst.checked,
            watermark: controls.watermark.checked,
            watermarkText: controls.watermarkText.value,
            watermarkAngle: controls.watermarkAngle.value,
            watermarkOpacity: controls.watermarkOpacity.value
        };

    }

    function clearResult(explain) {

        const revoked = urls.revokeAll();
        const had = !resultCard.hidden || revoked;

        partsList.replaceChildren();
        resultCard.hidden = true;

        if (had && explain) {
            note = "The PDF was removed because a setting or the file changed. Add the marks again.";
        }

    }

    function busy() {
        return state.adding || state.job !== null;
    }

    function showChecks() {

        state.checked = checkSettings(readSettings());

        for (const [name, el] of Object.entries(notes)) {

            const message = state.checked.ok ? "" : (state.checked.errors[name] || "");

            el.textContent = message;
            controls[name].toggleAttribute("aria-invalid", message !== "");

        }

        planNote.textContent = !state.file ? ""
            : state.checked.ok ? "Ready: the marks will be added to every page."
                : (state.checked.general || "Fix the highlighted settings above.");

        controls.format.disabled = controls.position.disabled = controls.start.disabled
            = controls.numberSize.disabled = controls.skipFirst.disabled = !controls.numbers.checked;
        controls.watermarkText.disabled = controls.watermarkAngle.disabled
            = controls.watermarkOpacity.disabled = !controls.watermark.checked;

    }

    function refresh() {

        const working = state.job !== null;
        const has = state.file !== null;

        showChecks();

        panel.dataset.state = working ? "working" : !resultCard.hidden ? "done" : has ? "ready" : "empty";
        panel.setAttribute("aria-busy", busy() ? "true" : "false");

        editable.inert = busy();

        const ready = has && state.checked.ok;

        createButton.disabled = busy() || !ready;
        cancelButton.hidden = !working;
        createButton.hidden = working;

        createHint.textContent = working ? "" : !has ? "Add a PDF to mark it." : !ready ? "Fix the settings above, then press Add marks." : "";

        summary.textContent = has ? `${state.name}: ${state.pageCount} ${state.pageCount === 1 ? "page" : "pages"}, ${formatBytes(state.size)}.` : "";

        emptyNote.hidden = has;
        settingsBox.hidden = !has;

    }

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

    async function createMarked() {

        if (busy() || !state.file || !state.checked || !state.checked.ok) {
            return;
        }

        showErrors([]);
        clearResult(false);

        const job = { id: ++state.epoch, cancelled: false };
        const file = state.file;
        const settings = state.checked.settings;
        const name = state.name;

        state.job = job;

        progress.hidden = false;
        progress.textContent = "Getting ready…";
        refresh();
        cancelButton.focus();
        say("Adding the marks.");

        try {

            const pdfLib = await loadPdfLib();
            const bytes = await readBytes(file);

            const result = await markPdf({
                bytes,
                settings,
                pdfLib,
                isCancelled: () => job.cancelled,
                onProgress: (done, count) => {
                    if (!job.cancelled) progress.textContent = done < count ? `Marking page ${done + 1} of ${count}…` : "Done.";
                }
            });

            if (job.cancelled || state.job !== job || result.cancelled) {
                return;
            }

            const li = document.createElement("li");
            const text = document.createElement("span");
            const link = document.createElement("a");
            const fileName = markedName(name);

            li.className = "pt-part";
            text.className = "pt-part__text";
            text.textContent = `${result.pages} ${result.pages === 1 ? "page" : "pages"}, ${formatBytes(result.bytes.length)}`;

            link.className = "calculator-form__button pt-download";
            link.href = urls.make(result.bytes);
            link.download = fileName;
            link.textContent = `Download ${fileName}`;

            li.append(text, link);
            partsList.replaceChildren(li);

            const bits = [];
            if (result.numbered) bits.push(`${result.numbered} ${result.numbered === 1 ? "page" : "pages"} numbered`);
            if (result.watermarked) bits.push(`${result.watermarked} ${result.watermarked === 1 ? "page" : "pages"} watermarked`);

            resultSummary.textContent = `${bits.join(" and ")} in ${name}.`;
            resultCard.hidden = false;

            state.job = null;
            progress.hidden = true;
            refresh();

            resultTitle.focus();
            say("Your PDF is ready.");

        } catch (error) {

            if (job.cancelled || state.job !== job) {
                return;
            }

            state.job = null;
            progress.hidden = true;
            refresh();

            showErrors([`The marks could not be added. ${classifyError(error).message} Try a smaller PDF.`]);
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

        controls.numbers.checked = true;
        controls.format.value = DEFAULT_SETTINGS.format;
        controls.position.value = DEFAULT_SETTINGS.position;
        controls.start.value = DEFAULT_SETTINGS.start;
        controls.numberSize.value = DEFAULT_SETTINGS.numberSize;
        controls.skipFirst.checked = false;
        controls.watermark.checked = false;
        controls.watermarkText.value = "";
        controls.watermarkAngle.value = DEFAULT_SETTINGS.watermarkAngle;
        controls.watermarkOpacity.value = DEFAULT_SETTINGS.watermarkOpacity;
        fileInput.value = "";
        progress.hidden = true;

        refresh();

        fileInput.focus();
        say("Reset.");

    }

    fileInput.addEventListener("change", () => {

        const file = (fileInput.files || [])[0];

        fileInput.value = "";

        if (file) {
            addFile(file);
        }

    });

    for (const control of Object.values(controls)) {
        control.addEventListener(control.type === "text" ? "input" : "change", onSettingChange);
    }

    createButton.addEventListener("click", createMarked);
    cancelButton.addEventListener("click", cancelJob);
    resetButton.addEventListener("click", reset);

    window.addEventListener("pagehide", () => clearResult(false));

    refresh();

    panel.dataset.ready = "true";

}
