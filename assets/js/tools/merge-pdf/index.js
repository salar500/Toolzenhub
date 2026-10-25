/* =========================================================
   ToolZen Hub
   Merge PDF (PDF Tools)

   Choose PDFs, put them in order, press Merge PDF, download. Everything
   happens in the browser: the files are never uploaded, stored or put
   in the address, and the page loads no script from another site.

   The rules (limits, recognising a PDF, wording) are in
   ../pdf-shared/pdf-rules.js; joining is ../pdf-shared/pdf-ops.js with
   the vendored pdf-lib. This file is the page around them. See
   docs/tool-packs/33-pdf-tools-batch.md.

   Memory: a chosen File stays on disk until its turn. A PDF is opened
   once when it is added (to count its pages) and its bytes are dropped
   at once, then read again, one at a time, while the PDF is built. The
   one object URL (the merged PDF) is revoked when it is replaced, when
   the list changes, on Reset and when the page is left. A late answer
   from an earlier run is dropped.
========================================================= */

import {
    MAX_FILES,
    MAX_FILE_BYTES,
    MAX_TOTAL_BYTES,
    MAX_PAGES,
    MERGED_NAME,
    NOT_KEPT_NOTE,
    formatBytes,
    moveItem,
    planFiles,
    summariseRejections,
    describeMerge
} from "../pdf-shared/pdf-rules.js";

import { mergePdfs, loadPdfLib, classifyError } from "../pdf-shared/pdf-ops.js";

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

const TITLE = getToolById("merge-pdf").title;

const SPLIT_TOOL = getToolById("split-pdf");
const PAGES_TOOL = getToolById("pdf-pages");


/* =========================================================
   MARKUP
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            ${introHtml(TITLE, "Join several PDFs into one PDF, in the order you choose.")}

            <section class="calculator-section">

                <div
                    id="mp-panel"
                    class="pt-workspace"
                    data-state="empty"
                >

                    <div
                        id="mp-editable"
                        class="pt-editable"
                    >

                        ${chooseFileHtml("mp", {
                            step: 1,
                            label: "Add PDF files",
                            multiple: true,
                            hint: `Up to ${MAX_FILES} PDFs, each up to ${formatBytes(MAX_FILE_BYTES)}, and ${formatBytes(MAX_TOTAL_BYTES)} in all. You can add more PDFs after the first ones. They are joined in your browser and are not uploaded by this tool. Password-protected PDFs are not accepted.`
                        })}

                        <div class="pt-card">

                            <h2 class="pt-card__title">
                                2. Put them in order
                            </h2>

                            <p
                                id="mp-summary"
                                class="pt-summary"
                            ></p>

                            <p
                                id="mp-empty"
                                class="pt-empty"
                            >
                                No PDFs yet. Choose at least two above. The
                                pages of the first PDF come first, then the
                                pages of the second, and so on.
                            </p>

                            <ol
                                id="mp-list"
                                class="pt-list"
                                aria-label="PDFs in merged order"
                                hidden
                            ></ol>

                        </div>

                    </div>

                    ${actionsHtml("mp", { step: 3, createLabel: "Merge PDF", hint: "Add at least two PDFs to merge them." })}

                    <div
                        id="mp-result"
                        class="pt-card pt-result"
                        hidden
                    >

                        <h2
                            id="mp-result-title"
                            class="pt-card__title"
                            tabindex="-1"
                        >
                            Your PDF is ready
                        </h2>

                        <p
                            id="mp-result-summary"
                            class="pt-result__summary"
                        ></p>

                        <a
                            id="mp-download"
                            class="calculator-form__button pt-download"
                            href="#"
                            download="${MERGED_NAME}"
                        >
                            Download PDF
                        </a>

                        <p class="pt-notes">
                            Changing the list removes this PDF, so merge it again afterwards. ${NOT_KEPT_NOTE}
                        </p>

                    </div>

                </div>

            </section>

            <p
                id="mp-live"
                class="pt-sr"
                role="status"
                aria-live="polite"
            ></p>

            ${howToHtml(TITLE, [
                "Choose two or more PDF files. On a phone you can pick several at once, and you can add more later.",
                "Check the order. Use <strong>Move up</strong> and <strong>Move down</strong> to change it, or <strong>Remove</strong> to take a file out.",
                "Press <strong>Merge PDF</strong>, then <strong>Download PDF</strong>."
            ])}

            ${infoHtml("What Happens to Your PDFs", [
                `The pages of each PDF are copied, in order, into one new PDF. Page sizes and the way pages are turned are kept. ${NOT_KEPT_NOTE}`,
                "This tool does not change what is on the pages, and it does not make the PDF smaller or reduce its quality."
            ])}

            ${infoHtml("Limits and Privacy", [
                `Up to ${MAX_FILES} PDFs, each up to ${formatBytes(MAX_FILE_BYTES)}, ${formatBytes(MAX_TOTAL_BYTES)} in all and ${MAX_PAGES} pages in the merged PDF. Merging takes memory, especially on a phone, so these limits are deliberately cautious. If a very large set does not work on your device, merge it in two steps. A password-protected PDF is refused: this tool does not remove protection. A damaged PDF is refused with its name. Not every kind of PDF can be read.`,
                PRIVACY_TEXT
            ])}

            ${faqHtml([
                ["Why is my PDF refused as protected?", "A PDF with a password or restrictions cannot be opened here, and this tool does not remove protection. If you are allowed to, open it in a PDF reader that lets you, and save an unprotected copy."],
                ["Does the merged PDF keep the bookmarks?", "No. The merged PDF is a new document: its bookmarks are not kept, and forms, signatures and tagged structure are not preserved. The pages, their sizes and their turns are kept."],
                ["Can I merge only some pages?", `Not here. To choose pages first, use <a href="${PAGES_TOOL.href}">${PAGES_TOOL.title}</a>, or cut a PDF into parts with <a href="${SPLIT_TOOL.href}">${SPLIT_TOOL.title}</a>, then merge the parts.`],
                ["Does it work without a connection?", "The tool joins the PDFs on your device and sends nothing anywhere. It still needs the page and its PDF library to have loaded first, and this version does not promise that it works offline."]
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

    const panel = document.querySelector("#mp-panel");

    if (!panel || panel.dataset.ready === "true") {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const fileInput = $("#mp-file");
    const editable = $("#mp-editable");
    const summary = $("#mp-summary");
    const emptyNote = $("#mp-empty");
    const list = $("#mp-list");
    const createButton = $("#mp-create");
    const createHint = $("#mp-create-hint");
    const cancelButton = $("#mp-cancel");
    const resetButton = $("#mp-reset");
    const progress = $("#mp-progress");
    const resultCard = $("#mp-result");
    const resultTitle = $("#mp-result-title");
    const resultSummary = $("#mp-result-summary");
    const download = $("#mp-download");

    const { announce, showErrors } = createMessenger({ live: $("#mp-live"), errorBox: $("#mp-error") });
    const urls = createUrlStore();

    /* a message about a removed result waits to be spoken with the next announcement, so one never hides the other */
    let note = "";

    function say(message = "") {

        announce([message, note].filter(Boolean).join(" "));

        note = "";

    }

    const state = {
        items: [],
        nextId: 1,
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
            note = "The merged PDF was removed because the list changed. Merge it again.";
        }

    }

    /* ---------- state of the page ---------- */

    function busy() {
        return state.adding || state.job !== null;
    }

    function totalPages() {
        return state.items.reduce((sum, item) => sum + item.pageCount, 0);
    }

    function refresh() {

        const working = state.job !== null;
        const count = state.items.length;

        panel.dataset.state = working ? "working" : !resultCard.hidden ? "done" : count ? "ready" : "empty";
        panel.setAttribute("aria-busy", busy() ? "true" : "false");

        editable.inert = busy();

        createButton.disabled = busy() || count < 2;
        cancelButton.hidden = !working;
        createButton.hidden = working;

        createHint.textContent = working ? "" : count === 0 ? "Add at least two PDFs to merge them." : count === 1 ? "Add one more PDF to merge them." : "";

        const total = state.items.reduce((sum, item) => sum + item.size, 0);

        summary.textContent = count ? `${count} ${count === 1 ? "PDF" : "PDFs"}, ${totalPages()} pages, ${formatBytes(total)} in all.` : "";

        emptyNote.hidden = count > 0;
        list.hidden = count === 0;

    }

    function renderList(focus) {

        list.replaceChildren(...state.items.map((item, index) => {

            const li = document.createElement("li");
            const text = document.createElement("div");
            const name = document.createElement("span");
            const meta = document.createElement("span");
            const actions = document.createElement("div");

            li.className = "pt-item";
            li.dataset.id = String(item.id);

            text.className = "pt-item__text";
            name.className = "pt-item__name";
            name.textContent = item.name;
            meta.className = "pt-item__meta";
            meta.textContent = `PDF ${index + 1} of ${state.items.length} · ${item.pageCount} ${item.pageCount === 1 ? "page" : "pages"} · ${formatBytes(item.size)}`;
            text.append(name, meta);

            actions.className = "pt-item__actions";

            const button = (action, label, disabled) => {

                const b = document.createElement("button");

                b.type = "button";
                b.className = "calculator-form__button calculator-form__button--secondary pt-mini";
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

            li.append(text, actions);

            return li;

        }));

        if (focus) {

            const target = list.querySelector(`li[data-id="${focus.id}"] [data-action="${focus.action}"]`);

            if (target) target.focus();

        }

    }

    /* ---------- adding PDFs ---------- */

    async function addFiles(files) {

        if (busy()) {
            return;
        }

        const epoch = state.epoch;

        state.adding = true;
        showErrors([]);
        clearResult(true);
        refresh();

        const plan = planFiles(state.items.map((item) => item.size), files);
        const rejected = plan.rejected.slice();
        let added = 0;
        let pdfLib = null;

        try {
            pdfLib = await loadPdfLib();
        } catch {
            pdfLib = null;
        }

        if (epoch !== state.epoch) return;

        for (const index of plan.accepted) {

            const file = files[index];

            if (!pdfLib) {
                rejected.push({ name: file.name, message: "The PDF library could not be loaded. Check your connection and reload the page." });
                continue;
            }

            const info = await inspectFile(file, pdfLib);

            if (epoch !== state.epoch) return;

            if (!info.ok) {
                rejected.push({ name: file.name, message: info.message });
                continue;
            }

            const pages = state.items.reduce((sum, item) => sum + item.pageCount, 0) + info.pageCount;

            if (pages > MAX_PAGES) {
                rejected.push({ name: file.name, message: `Not added: the PDFs together would have more than ${MAX_PAGES} pages, which is the most this page handles.` });
                continue;
            }

            state.items.push({ id: state.nextId, file, name: file.name, size: file.size, pageCount: info.pageCount });
            state.nextId += 1;
            added += 1;

            renderList();
            refresh();

        }

        state.adding = false;

        showErrors(summariseRejections(rejected));
        renderList();
        refresh();

        say(`${added} ${added === 1 ? "PDF" : "PDFs"} added${rejected.length ? `, ${rejected.length} not added` : ""}. ${state.items.length} in the list.`);

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
            const next = state.items[index] || state.items[index - 1];

            renderList(next ? { id: next.id, action: "remove" } : null);
            refresh();

            say(`${removed.name} removed. ${state.items.length} ${state.items.length === 1 ? "PDF" : "PDFs"} left.`);

            if (!next) fileInput.focus();

            return;

        }

        const delta = action === "up" ? -1 : 1;
        const moved = state.items[index];

        state.items = moveItem(state.items, index, delta);

        renderList({ id: moved.id, action });
        refresh();

        say(`${moved.name} is now PDF ${state.items.indexOf(moved) + 1} of ${state.items.length}.`);

    }

    /* ---------- merging ---------- */

    async function createPdf() {

        if (busy() || state.items.length < 2) {
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
        say("Merging the PDFs.");

        try {

            const pdfLib = await loadPdfLib();

            const result = await mergePdfs({
                count: items.length,
                pdfLib,
                isCancelled: () => job.cancelled,
                onProgress: (done, count) => {
                    if (!job.cancelled) progress.textContent = done < count ? `Adding PDF ${done + 1} of ${count}…` : "Saving the PDF…";
                },
                getBytes: (index) => readBytes(items[index].file)
            });

            if (job.cancelled || state.job !== job || result.cancelled) {
                return;
            }

            download.setAttribute("href", urls.make(result.bytes));
            resultSummary.textContent = describeMerge({ files: result.files, pages: result.pages, bytes: result.bytes.length });
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

            const problem = classifyError(error);
            const name = Number.isInteger(error?.index) && items[error.index] ? `${items[error.index].name}: ` : "";

            showErrors([`The PDF could not be merged. ${name}${problem.message} Remove that file, or use fewer or smaller files, and try again.`]);
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

    function reset() {

        if (state.job) {
            state.job.cancelled = true;
            state.job = null;
        }

        state.epoch += 1;
        state.adding = false;
        note = "";
        state.items = [];

        clearResult(false);
        showErrors([]);

        fileInput.value = "";
        progress.hidden = true;

        renderList();
        refresh();

        fileInput.focus();
        say("Reset.");

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

    createButton.addEventListener("click", createPdf);
    cancelButton.addEventListener("click", cancelJob);
    resetButton.addEventListener("click", reset);

    window.addEventListener("pagehide", () => clearResult(false));

    refresh();

    panel.dataset.ready = "true";

}
