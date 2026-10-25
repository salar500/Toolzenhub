/* =========================================================
   ToolZen Hub
   Photos to PDF (Image Tools)

   Choose photos, put them in order, choose the page, press Create
   PDF, download. Everything happens in the browser: the photos are
   never uploaded, stored or put in the address, and the page loads no
   script from another site.

   The rules (limits, reading a JPEG, page layout, reordering, wording)
   are in pdf-rules.js; the PDF is written by pdf-build.js with the
   vendored pdf-lib; the pixel work is in image-prep.js. This file is
   the page around them: files, list, controls, state, messages and
   cleanup. See docs/tool-packs/31-photos-to-pdf.md.

   Memory: a chosen File stays on disk until its turn. A picture is read
   only while the PDF is built, one at a time; previews are small canvases
   (no object URLs); the one object URL (the finished PDF) is revoked when
   it is replaced, when the list or a setting changes, on Reset and when
   the page is left. A late answer from an earlier run is dropped.
========================================================= */

import {
    MAX_IMAGES,
    MAX_FILE_BYTES,
    MAX_INPUT_PIXELS,
    MAX_TOTAL_BYTES,
    HEADER_BYTES,
    FILE_NAME,
    PAGE_SIZES,
    ORIENTATIONS,
    MARGINS,
    DEFAULT_SETTINGS,
    cleanSettings,
    checkHeader,
    planAdditions,
    moveItem,
    summariseRejections,
    describeResult,
    formatBytes
} from "./pdf-rules.js";

import { buildPdf, loadPdfLib } from "./pdf-build.js";

import { prepareImage, makeThumbnail } from "./image-prep.js";

import { getToolById } from "../../data/tools.js";


/* No related calculator or article exists. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("photos-to-pdf").title;

const nf = (n) => n.toLocaleString("en-US");


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    const options = (list, selected) => list.map((item) => `
                                    <option value="${item.id}"${item.id === selected ? " selected" : ""}>${item.label}</option>`).join("");

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Image Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Put several photos into one PDF, in the order you
                        choose, with one photo on each page.
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
                            Made in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE TOOL -->

            <section class="calculator-section">

                <div
                    id="pp-panel"
                    class="pp-workspace"
                    data-state="empty"
                >

                    <div
                        id="pp-editable"
                        class="pp-editable"
                    >

                        <div class="pp-card">

                            <h2 class="pp-card__title">
                                1. Choose photos
                            </h2>

                            <div class="pp-drop">

                                <label
                                    for="pp-file"
                                    class="pp-drop__label"
                                >
                                    Add JPEG, PNG or WebP photos
                                </label>

                                <input
                                    type="file"
                                    id="pp-file"
                                    class="pp-file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    aria-describedby="pp-file-hint"
                                >

                                <p
                                    id="pp-file-hint"
                                    class="pp-hint"
                                >
                                    Up to ${MAX_IMAGES} photos, each up to
                                    ${formatBytes(MAX_FILE_BYTES)} and
                                    ${nf(MAX_INPUT_PIXELS / 1e6)} megapixels, and
                                    ${formatBytes(MAX_TOTAL_BYTES)} in all. You can
                                    add more photos after the first ones. They are
                                    made into a PDF in your browser and are not
                                    uploaded by this tool.
                                </p>

                            </div>

                            <div
                                id="pp-error"
                                class="pp-error"
                                role="alert"
                                hidden
                            ></div>

                        </div>


                        <div class="pp-card">

                            <h2 class="pp-card__title">
                                2. Put them in order
                            </h2>

                            <p
                                id="pp-summary"
                                class="pp-summary"
                            ></p>

                            <p
                                id="pp-empty"
                                class="pp-empty"
                            >
                                No photos yet. Choose some above. Each photo
                                becomes one page, in the order shown here.
                            </p>

                            <ol
                                id="pp-list"
                                class="pp-list"
                                aria-label="Photos in PDF order"
                                hidden
                            ></ol>

                        </div>


                        <div class="pp-card">

                            <h2 class="pp-card__title">
                                3. Choose the pages
                            </h2>

                            <div class="pp-fields">

                                <div class="pp-field">

                                    <label for="pp-page-size">
                                        Page size
                                    </label>

                                    <select
                                        id="pp-page-size"
                                        class="pp-select"
                                    >${options(Object.values(PAGE_SIZES), DEFAULT_SETTINGS.pageSize)}
                                    </select>

                                </div>

                                <div class="pp-field">

                                    <label for="pp-orientation">
                                        Page direction
                                    </label>

                                    <select
                                        id="pp-orientation"
                                        class="pp-select"
                                        aria-describedby="pp-orientation-note"
                                    >${options(ORIENTATIONS, DEFAULT_SETTINGS.orientation)}
                                    </select>

                                    <p
                                        id="pp-orientation-note"
                                        class="pp-note"
                                    ></p>

                                </div>

                                <div class="pp-field">

                                    <label for="pp-margin">
                                        Margin
                                    </label>

                                    <select
                                        id="pp-margin"
                                        class="pp-select"
                                    >${options(Object.values(MARGINS), DEFAULT_SETTINGS.margin)}
                                    </select>

                                </div>

                            </div>

                            <p class="pp-note">
                                Each photo is made as large as fits the page
                                without cutting any of it off.
                            </p>

                        </div>

                    </div>


                    <div class="pp-card">

                        <h2 class="pp-card__title">
                            4. Create and download
                        </h2>

                        <div class="pp-actions">

                            <button
                                type="button"
                                id="pp-create"
                                class="calculator-form__button pp-button"
                                aria-describedby="pp-create-hint"
                                disabled
                            >
                                Create PDF
                            </button>

                            <button
                                type="button"
                                id="pp-cancel"
                                class="calculator-form__button calculator-form__button--secondary pp-button"
                                hidden
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                id="pp-reset"
                                class="calculator-form__button calculator-form__button--secondary pp-button"
                            >
                                Reset
                            </button>

                        </div>

                        <p
                            id="pp-create-hint"
                            class="pp-note"
                        >Add at least one photo to create a PDF.</p>

                        <p
                            id="pp-progress"
                            class="pp-status"
                            hidden
                        ></p>

                    </div>


                    <div
                        id="pp-result"
                        class="pp-card pp-result"
                        hidden
                    >

                        <h2
                            id="pp-result-title"
                            class="pp-card__title"
                            tabindex="-1"
                        >
                            Your PDF is ready
                        </h2>

                        <p
                            id="pp-result-summary"
                            class="pp-result__summary"
                        ></p>

                        <a
                            id="pp-download"
                            class="calculator-form__button pp-download"
                            href="#"
                            download="${FILE_NAME}"
                        >
                            Download PDF
                        </a>

                        <p
                            id="pp-result-notes"
                            class="pp-notes"
                        >Changing the photos or the page settings removes this PDF, so create it again afterwards.</p>

                    </div>

                </div>

            </section>

            <p
                id="pp-live"
                class="pp-sr"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use ${TITLE}
                </h2>

                <ol>
                    <li>
                        Choose your photos. On a phone you can pick several at
                        once, and you can add more later.
                    </li>
                    <li>
                        Check the order. Use <strong>Move up</strong> and
                        <strong>Move down</strong> to change it, or
                        <strong>Remove</strong> to take a photo out.
                    </li>
                    <li>
                        Choose the page size, direction and margin.
                    </li>
                    <li>
                        Press <strong>Create PDF</strong>, then
                        <strong>Download PDF</strong>.
                    </li>
                </ol>

            </section>


            <!-- WHAT HAPPENS TO THE PHOTOS -->

            <section class="calculator-info">

                <h2>
                    What Happens to Your Photos
                </h2>

                <p>
                    A JPEG that can go in as it is, is put into the PDF
                    unchanged: it is not saved again, so its quality is not
                    reduced, and the PDF is about the size of your photos together. A PNG or WebP, a photo that
                    its camera marked as turned, or a JPEG of an unusual kind is
                    saved again as a JPEG first. Transparent areas become white.
                    Phone photos are turned the right way up.
                </p>

                <p>
                    A photo cannot be turned by hand in this version, so a page
                    that was photographed sideways stays sideways. The PDF has no
                    text to select or search: each page is a picture.
                </p>

            </section>


            <!-- LIMITS AND PRIVACY -->

            <section class="calculator-info">

                <h2>
                    Limits and Privacy
                </h2>

                <p>
                    Up to ${MAX_IMAGES} photos in one PDF, each up to
                    ${formatBytes(MAX_FILE_BYTES)} and
                    ${nf(MAX_INPUT_PIXELS / 1e6)} megapixels, and
                    ${formatBytes(MAX_TOTAL_BYTES)} in all. HEIC/HEIF, GIF, AVIF
                    and SVG are not supported in this version. Making a PDF takes
                    memory, especially on a phone, so these limits are
                    deliberately cautious. If a very large set does not work on
                    your device, make two smaller PDFs.
                </p>

                <p>
                    Your photos are processed in your browser and are not uploaded
                    by this tool. Nothing is saved, and the page address never
                    contains them. The PDF library is a file served from this
                    site, not from another one. Reloading the page clears
                    everything.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    Frequently Asked Questions
                </h2>

                <details>
                    <summary>
                        Why is my HEIC photo refused?
                    </summary>
                    <p>
                        Browsers do not decode HEIC reliably, so this version does
                        not accept it. Export or share the photo as JPEG or PNG
                        first.
                    </p>
                </details>

                <details>
                    <summary>
                        Can I make the PDF smaller?
                    </summary>
                    <p>
                        The PDF is about as big as the photos in it. To shrink it,
                        make the photos smaller first with the Image Compressor &
                        Resizer, then combine them here.
                    </p>
                </details>

                <details>
                    <summary>
                        What does "Same shape as each image" do?
                    </summary>
                    <p>
                        Each page takes the shape of its own photo instead of a
                        paper size, so nothing is left blank around it apart from
                        the margin. The page direction setting does not apply.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it work without a connection?
                    </summary>
                    <p>
                        The tool makes the PDF on your device and sends nothing
                        anywhere. It still needs the page and its PDF library to
                        have loaded first, and this version does not promise that
                        it works offline.
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

    const panel = document.querySelector("#pp-panel");

    if (!panel || panel.dataset.ready === "true") {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const fileInput = $("#pp-file");
    const errorBox = $("#pp-error");
    const editable = $("#pp-editable");
    const summary = $("#pp-summary");
    const emptyNote = $("#pp-empty");
    const list = $("#pp-list");
    const pageSize = $("#pp-page-size");
    const orientation = $("#pp-orientation");
    const orientationNote = $("#pp-orientation-note");
    const margin = $("#pp-margin");
    const createButton = $("#pp-create");
    const createHint = $("#pp-create-hint");
    const cancelButton = $("#pp-cancel");
    const resetButton = $("#pp-reset");
    const progress = $("#pp-progress");
    const resultCard = $("#pp-result");
    const resultTitle = $("#pp-result-title");
    const resultSummary = $("#pp-result-summary");
    const download = $("#pp-download");
    const live = $("#pp-live");

    const state = {
        items: [],
        nextId: 1,
        epoch: 0,
        adding: false,
        job: null,
        url: null
    };

    let announceTimer = 0;

    /* ---------- messages ---------- */

    function announce(message) {

        clearTimeout(announceTimer);

        live.textContent = "";

        announceTimer = setTimeout(() => {
            live.textContent = message;
        }, 120);

    }

    function showErrors(lines) {

        errorBox.replaceChildren(...lines.map((line) => {
            const p = document.createElement("p");
            p.textContent = line;
            return p;
        }));

        errorBox.hidden = lines.length === 0;

    }

    /* ---------- the finished PDF ---------- */

    function clearResult(explain) {

        const had = !resultCard.hidden || state.url;

        if (state.url) {
            URL.revokeObjectURL(state.url);
            state.url = null;
        }

        download.setAttribute("href", "#");
        resultCard.hidden = true;

        if (had && explain) {
            announce("The PDF was removed because the photos or settings changed. Create it again.");
        }

    }

    /* ---------- state of the page ---------- */

    function busy() {
        return state.adding || state.job !== null;
    }

    function refresh() {

        const working = state.job !== null;
        const count = state.items.length;

        panel.dataset.state = working ? "working" : !resultCard.hidden ? "done" : count ? "ready" : "empty";
        panel.setAttribute("aria-busy", busy() ? "true" : "false");

        editable.inert = busy();

        createButton.disabled = busy() || count === 0;
        cancelButton.hidden = !working;
        createButton.hidden = working;

        createHint.textContent = working ? "" : count === 0 ? "Add at least one photo to create a PDF." : "";

        const total = state.items.reduce((sum, item) => sum + item.size, 0);

        summary.textContent = count ? `${count} ${count === 1 ? "photo" : "photos"}, ${formatBytes(total)} in all. ${count === 1 ? "Page 1" : `Pages 1 to ${count}`} in the PDF.` : "";

        emptyNote.hidden = count > 0;
        list.hidden = count === 0;

        const match = pageSize.value === "image";

        orientation.disabled = match;
        orientationNote.textContent = match ? "Not used: each page takes the shape of its photo." : "";

    }

    function renderList(focus) {

        list.replaceChildren(...state.items.map((item, index) => {

            const li = document.createElement("li");
            const thumb = document.createElement("div");
            const text = document.createElement("div");
            const name = document.createElement("span");
            const meta = document.createElement("span");
            const actions = document.createElement("div");

            li.className = "pp-item";
            li.dataset.id = String(item.id);

            thumb.className = "pp-thumb";
            thumb.setAttribute("aria-hidden", "true");
            thumb.append(item.canvas);

            text.className = "pp-item__text";
            name.className = "pp-item__name";
            name.textContent = item.name;
            meta.className = "pp-item__meta";
            meta.textContent = `Page ${index + 1} of ${state.items.length} · ${formatBytes(item.size)}`;
            text.append(name, meta);

            actions.className = "pp-item__actions";

            const button = (action, label, disabled) => {

                const b = document.createElement("button");

                b.type = "button";
                b.className = "calculator-form__button calculator-form__button--secondary pp-mini";
                b.dataset.action = action;
                b.textContent = label;
                b.setAttribute("aria-label", `${label}: ${item.name}`);

                if (disabled) b.setAttribute("aria-disabled", "true");

                return b;

            };

            actions.append(
                button("up", "Move up", index === 0),
                button("down", "Move down", index === state.items.length - 1),
                button("remove", "Remove", false)
            );

            li.append(thumb, text, actions);

            return li;

        }));

        if (focus) {

            const target = list.querySelector(`li[data-id="${focus.id}"] [data-action="${focus.action}"]`);

            if (target) target.focus();

        }

    }

    /* ---------- adding photos ---------- */

    async function addFiles(files) {

        if (busy()) {
            return;
        }

        const epoch = state.epoch;

        state.adding = true;
        showErrors([]);
        clearResult(true);
        refresh();

        const plan = planAdditions(state.items.map((item) => item.size), files);
        const rejected = plan.rejected.slice();
        let added = 0;

        for (const index of plan.accepted) {

            const file = files[index];

            let header;

            try {
                header = checkHeader(new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer()));
            } catch {
                header = { ok: false, message: "This file could not be read." };
            }

            if (epoch !== state.epoch) return;

            if (!header.ok) {
                rejected.push({ name: file.name, message: header.message });
                continue;
            }

            const canvas = document.createElement("canvas");

            canvas.width = 1;
            canvas.height = 1;

            const drawn = await makeThumbnail(file, canvas);

            if (epoch !== state.epoch) return;

            if (!drawn) {
                rejected.push({ name: file.name, message: "This browser could not decode this picture." });
                continue;
            }

            state.items.push({ id: state.nextId, file, name: file.name, size: file.size, canvas });
            state.nextId += 1;
            added += 1;

            renderList();
            refresh();

        }

        state.adding = false;

        showErrors(summariseRejections(rejected));
        renderList();
        refresh();

        announce(`${added} ${added === 1 ? "photo" : "photos"} added${rejected.length ? `, ${rejected.length} not added` : ""}. ${state.items.length} in the PDF.`);

    }

    /* ---------- the list ---------- */

    function onListClick(event) {

        const button = event.target.closest("button[data-action]");

        if (!button || busy() || button.getAttribute("aria-disabled") === "true") {
            return;
        }

        const id = Number(button.closest("li").dataset.id);
        const index = state.items.findIndex((item) => item.id === id);
        const action = button.dataset.action;

        if (index < 0) return;

        showErrors([]);
        clearResult(true);

        if (action === "remove") {

            const [removed] = state.items.splice(index, 1);

            removed.canvas.width = 1;
            removed.canvas.height = 1;

            const next = state.items[index] || state.items[index - 1];

            renderList(next ? { id: next.id, action: "remove" } : null);
            refresh();

            announce(`${removed.name} removed. ${state.items.length} ${state.items.length === 1 ? "photo" : "photos"} left.`);

            if (!next) fileInput.focus();

            return;

        }

        const delta = action === "up" ? -1 : 1;
        const moved = state.items[index];

        state.items = moveItem(state.items, index, delta);

        renderList({ id: moved.id, action });
        refresh();

        announce(`${moved.name} is now photo ${state.items.indexOf(moved) + 1} of ${state.items.length}.`);

    }

    /* ---------- creating the PDF ---------- */

    function readSettings() {
        return cleanSettings({ pageSize: pageSize.value, orientation: orientation.value, margin: margin.value });
    }

    async function createPdf() {

        if (busy() || state.items.length === 0) {
            return;
        }

        showErrors([]);
        clearResult(false);

        const job = { id: ++state.epoch, cancelled: false };
        const items = state.items.slice();

        state.job = job;

        progress.hidden = false;
        progress.textContent = "Getting ready…";
        refresh();
        cancelButton.focus();
        announce("Creating the PDF.");

        try {

            const pdfLib = await loadPdfLib();

            const result = await buildPdf({
                count: items.length,
                pdfLib,
                settings: readSettings(),
                isCancelled: () => job.cancelled,
                onProgress: (done, count) => {
                    if (!job.cancelled) progress.textContent = done < count ? `Added photo ${done} of ${count}…` : `Saving the PDF…`;
                },
                getImage: async (index) => {

                    progress.textContent = `Adding photo ${index + 1} of ${items.length}…`;

                    try {
                        return await prepareImage(items[index].file);
                    } catch (error) {
                        throw new Error(`${items[index].name}: ${error.message}`);
                    }

                }
            });

            if (job.cancelled || state.job !== job) {
                return;
            }

            if (result.cancelled) {
                return;
            }

            const url = URL.createObjectURL(new Blob([result.bytes], { type: "application/pdf" }));

            state.url = url;
            download.setAttribute("href", url);
            resultSummary.textContent = describeResult({ pages: result.pages, bytes: result.bytes.length, redrawn: result.redrawn, reduced: result.reduced });
            resultCard.hidden = false;

            state.job = null;
            progress.hidden = true;
            refresh();

            resultTitle.focus();
            announce(`Your PDF is ready: ${result.pages} ${result.pages === 1 ? "page" : "pages"}.`);

        } catch (error) {

            if (job.cancelled || state.job !== job) {
                return;
            }

            state.job = null;
            progress.hidden = true;
            refresh();

            showErrors([`The PDF could not be created. ${error.message || "The browser ran out of memory or stopped."} Remove that photo, or use fewer or smaller photos, and try again.`]);
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
        announce("Cancelled. No PDF was made.");

    }

    /* ---------- settings and reset ---------- */

    function onSettingChange() {

        clearResult(true);
        refresh();

    }

    function reset() {

        if (state.job) {
            state.job.cancelled = true;
            state.job = null;
        }

        state.epoch += 1;
        state.adding = false;

        for (const item of state.items) {
            item.canvas.width = 1;
            item.canvas.height = 1;
        }

        state.items = [];

        clearResult(false);
        showErrors([]);

        pageSize.value = DEFAULT_SETTINGS.pageSize;
        orientation.value = DEFAULT_SETTINGS.orientation;
        margin.value = DEFAULT_SETTINGS.margin;
        fileInput.value = "";
        progress.hidden = true;

        renderList();
        refresh();

        fileInput.focus();
        announce("Reset.");

    }

    /* ---------- wiring ---------- */

    fileInput.addEventListener("change", () => {

        const files = Array.from(fileInput.files || []);

        fileInput.value = "";

        if (files.length) {
            addFiles(files);
        }

    });

    list.addEventListener("click", onListClick);

    for (const select of [pageSize, orientation, margin]) {
        select.addEventListener("change", onSettingChange);
    }

    createButton.addEventListener("click", createPdf);
    cancelButton.addEventListener("click", cancelJob);
    resetButton.addEventListener("click", reset);

    window.addEventListener("pagehide", () => clearResult(false));

    refresh();

    panel.dataset.ready = "true";

}
