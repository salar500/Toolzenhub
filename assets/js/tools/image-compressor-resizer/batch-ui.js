/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: the batch (several images at once)

   Two things live here: the markup of the batch card and of the batch
   size controls, and the controller that runs a batch.

   One image is still handled by index.js exactly as before. This
   controller takes over when two or more images are chosen. It uses the
   same pipeline (a worker, or the main thread), one image at a time, so
   only one decoded image is in memory. A failure on one image is
   recorded on its row and never stops the others. Results are Blobs;
   object URLs are made for downloads and revoked on Remove, Reset, a
   settings change and when the page is left.
========================================================= */

import {
    HEADER_BYTES,
    MESSAGES,
    FORMATS,
    MIME_OF,
    QUALITY_DEFAULT,
    sniffFormat,
    refusalFor,
    readSize,
    checkInputSize,
    inspectAlpha,
    formatBytes,
    formatDimensions,
    describeChange,
    parseDimension,
    parseTargetKB,
    clampQuality,
    usesQuality
} from "./image-engine.js";

import {
    MAX_BATCH_FILES,
    MAX_BATCH_BYTES,
    STATUS,
    planBatchSelection,
    batchFileName,
    describeBatchFinish,
    batchTotals
} from "./batch-rules.js";

import { makeThumbnail } from "./thumbnail.js";

const nf = (n) => n.toLocaleString("en-US");

const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));


/* =========================================================
   MARKUP
========================================================= */

/* the card with the list, shown only when two or more images are chosen */
export function batchCardMarkup() {

    return `
                    <div
                        id="ic-batch"
                        class="ic-card"
                        hidden
                    >

                        <h2
                            id="ic-batch-title"
                            class="ic-card__title"
                            tabindex="-1"
                        >
                            Your images
                        </h2>

                        <p
                            id="ic-batch-summary"
                            class="ic-notes"
                        ></p>

                        <ol
                            id="ic-batch-list"
                            class="ic-batch__list"
                        ></ol>

                        <p
                            id="ic-batch-totals"
                            class="ic-change"
                            data-kind=""
                            hidden
                        ></p>

                        <figure
                            id="ic-batch-preview"
                            class="ic-figure"
                            hidden
                        >

                            <figcaption
                                id="ic-batch-preview-caption"
                                class="ic-notes"
                            ></figcaption>

                            <img
                                id="ic-batch-preview-img"
                                class="ic-preview"
                                alt="Scaled preview of the selected processed image"
                            >

                        </figure>

                    </div>
`;

}

/* the size choices for a batch, inside the settings form */
export function batchSizeMarkup() {

    return `
                            <fieldset
                                id="ic-batch-size"
                                class="ic-group"
                                hidden
                            >

                                <legend>Size in pixels</legend>

                                <div
                                    class="ic-modes"
                                    role="radiogroup"
                                    aria-label="How to size every image"
                                >

                                    <label class="ic-radio">
                                        <input
                                            type="radio"
                                            name="ic-side-mode"
                                            value="keep"
                                            checked
                                        >
                                        <span>Keep each image's size</span>
                                    </label>

                                    <label class="ic-radio">
                                        <input
                                            type="radio"
                                            name="ic-side-mode"
                                            value="side"
                                        >
                                        <span>Longest side</span>
                                    </label>

                                </div>

                                <div
                                    id="ic-side-block"
                                    class="ic-field"
                                    hidden
                                >

                                    <label for="ic-side">Longest side (pixels)</label>

                                    <input
                                        type="text"
                                        id="ic-side"
                                        class="ic-input"
                                        inputmode="numeric"
                                        autocomplete="off"
                                        value="1600"
                                        aria-describedby="ic-side-error"
                                    >

                                    <p
                                        id="ic-side-error"
                                        class="ic-field-error"
                                    ></p>

                                </div>

                                <p class="ic-notes">
                                    Images are never enlarged and keep their shape.
                                    Rotate, flip, crop and an exact width and height
                                    are for one image at a time.
                                </p>

                            </fieldset>
`;

}


/* =========================================================
   CONTROLLER
========================================================= */

/*
 * ctx (everything the page owns that a batch needs):
 *   $, panel, settings, fileInput, processButton, status
 *   formatSelect, targetInput, qualityRange, lock-free helpers:
 *   setState(v), setBusy(bool), showError(text), clearError(), announce(text), fieldError(input, text)
 *   run(op, request)   the pipeline call (worker first, main thread otherwise)
 *   tracker            createOperationTracker()
 *   supported()        what this browser can encode: { jpeg, webp, png }
 *   updateModeVisibility()
 */
export function createBatchController(ctx) {

    const { $, panel } = ctx;

    const card = $("#ic-batch");
    const title = $("#ic-batch-title");
    const summary = $("#ic-batch-summary");
    const list = $("#ic-batch-list");
    const totals = $("#ic-batch-totals");
    const previewFigure = $("#ic-batch-preview");
    const previewImg = $("#ic-batch-preview-img");
    const previewCaption = $("#ic-batch-preview-caption");
    const sizeGroup = $("#ic-size-group");
    const batchSize = $("#ic-batch-size");
    const sideBlock = $("#ic-side-block");
    const sideInput = $("#ic-side");

    const state = {
        rows: [],
        nextId: 1,
        epoch: 0,
        job: null,
        thumbs: Promise.resolve(),
        previewUrl: null,
        previewId: null
    };

    const active = () => state.rows.length > 0;
    const busy = () => state.job !== null;


    /* ---------- the page in batch mode ---------- */

    function enterMode() {

        panel.dataset.mode = "batch";

        sizeGroup.hidden = true;
        batchSize.hidden = false;

        $("#ic-geometry").hidden = true;

        $("#ic-original").hidden = true;
        $("#ic-result").hidden = true;

        ctx.processButton.textContent = "Compress images";

        /* "Same format" is the batch default; the others apply to every image */
        const supported = ctx.supported();
        const select = ctx.formatSelect;

        select.replaceChildren();

        const options = [["same", "Same format as each image"]];

        for (const mime of ["image/jpeg", "image/webp", "image/png"]) {

            if (supported[FORMATS[mime].label.toLowerCase()] === false) {
                continue;
            }

            options.push([mime, FORMATS[mime].label]);

        }

        for (const [value, label] of options) {

            const option = document.createElement("option");

            option.value = value;
            option.textContent = label;

            select.append(option);

        }

        select.value = "same";

        $("#ic-format-help").textContent = "A PNG or WebP that may have transparent areas is skipped when you choose JPEG, never flattened silently.";

        $('input[name="ic-mode"][value="quality"]').checked = true;
        $('input[name="ic-quality-preset"][value="balanced"]').checked = true;

        ctx.qualityRange.value = String(QUALITY_DEFAULT);
        $("#ic-quality-value").textContent = String(QUALITY_DEFAULT);

        ctx.targetInput.value = "500";
        ctx.fieldError(ctx.targetInput, "");

        $('input[name="ic-side-mode"][value="keep"]').checked = true;
        sideBlock.hidden = true;
        sideInput.value = "1600";
        ctx.fieldError(sideInput, "");

        ctx.updateModeVisibility();

        ctx.settings.hidden = false;

    }

    function leaveMode() {

        delete panel.dataset.mode;

        sizeGroup.hidden = false;
        batchSize.hidden = true;

        $("#ic-geometry").hidden = false;

        ctx.processButton.textContent = "Compress image";

    }

    function sideMode() {

        return $('input[name="ic-side-mode"]:checked').value;

    }

    function onSideMode() {

        sideBlock.hidden = sideMode() !== "side";

        ctx.fieldError(sideInput, "");

    }


    /* ---------- object URLs ---------- */

    function revokeRowUrl(row) {

        if (row.url) {
            URL.revokeObjectURL(row.url);
            row.url = null;
        }

    }

    function clearPreview() {

        if (state.previewUrl) {
            URL.revokeObjectURL(state.previewUrl);
            state.previewUrl = null;
        }

        previewImg.removeAttribute("src");
        previewFigure.hidden = true;
        state.previewId = null;

    }

    function releaseRow(row) {

        revokeRowUrl(row);

        if (row.canvas) {
            row.canvas.width = 1;
            row.canvas.height = 1;
        }

        row.result = null;
        row.file = null;

    }

    /* clear every result but keep the list: what a change of settings, or a new run, starts from */
    function clearResults() {

        clearPreview();

        for (const row of state.rows) {

            revokeRowUrl(row);

            row.result = null;
            row.status = "waiting";
            row.message = "";
            row.outName = "";

        }

        totals.hidden = true;
        totals.textContent = "";

    }


    /* ---------- the list ---------- */

    function rowDetail(row) {

        if (row.status === "done") {

            const r = row.result;
            const change = describeChange(row.size, r.size);

            const parts = [
                `${formatDimensions(r.width, r.height)} px`,
                `${formatBytes(r.size)} (was ${formatBytes(row.size)})`,
                FORMATS[r.mime].label
            ];

            if (r.quality !== null) {
                parts.push(`quality ${r.quality}`);
            }

            let line = `${parts.join(" · ")}. ${change.text}`;

            if (r.target) {
                line += r.target.reached
                    ? ` Up to ${nf(Math.round(r.target.requestedBytes / 1024))} KB: reached.`
                    : ` Up to ${nf(Math.round(r.target.requestedBytes / 1024))} KB: not reached at this size (smallest ${formatBytes(r.target.floorSize)}).`;
            }

            return { text: line, kind: change.kind };

        }

        return { text: row.message, kind: "" };

    }

    function buildRow(row) {

        const li = document.createElement("li");
        const thumb = document.createElement("div");
        const text = document.createElement("div");
        const name = document.createElement("span");
        const meta = document.createElement("span");
        const status = document.createElement("span");
        const detail = document.createElement("span");
        const actions = document.createElement("div");

        li.className = "ic-batch__item";
        li.dataset.id = String(row.id);
        li.dataset.status = row.status;

        thumb.className = "ic-batch__thumb";
        thumb.setAttribute("aria-hidden", "true");
        thumb.append(row.canvas);

        text.className = "ic-batch__text";

        name.className = "ic-batch__name";
        name.textContent = row.name;

        meta.className = "ic-batch__meta";
        meta.textContent = `${formatBytes(row.size)} · ${formatDimensions(row.width, row.height)} px`;

        status.className = "ic-batch__status";
        status.dataset.status = row.status;
        status.textContent = STATUS[row.status];

        const info = rowDetail(row);

        detail.className = "ic-batch__detail";
        detail.dataset.kind = info.kind;
        detail.textContent = info.text;
        detail.hidden = info.text === "";

        text.append(name, meta, status, detail);

        actions.className = "ic-batch__actions";

        if (row.status === "done") {

            const preview = document.createElement("button");

            preview.type = "button";
            preview.className = "calculator-form__button calculator-form__button--secondary ic-batch__button";
            preview.dataset.action = "preview";
            preview.textContent = "Preview";
            preview.setAttribute("aria-label", `Preview ${row.outName}`);
            preview.setAttribute("aria-pressed", String(state.previewId === row.id));

            const link = document.createElement("a");

            link.className = "calculator-form__button ic-batch__button ic-batch__download";
            link.href = row.url;
            link.setAttribute("download", row.outName);
            link.textContent = "Download";
            link.setAttribute("aria-label", `Download ${row.outName}`);

            actions.append(preview, link);

        }

        const remove = document.createElement("button");

        remove.type = "button";
        remove.className = "calculator-form__button calculator-form__button--secondary ic-batch__button";
        remove.dataset.action = "remove";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${row.name}`);

        actions.append(remove);

        li.append(thumb, text, actions);

        return li;

    }

    function renderList() {

        list.replaceChildren(...state.rows.map(buildRow));

        const n = state.rows.length;
        const total = state.rows.reduce((sum, row) => sum + row.size, 0);

        summary.textContent = `${n} ${n === 1 ? "image" : "images"}, ${formatBytes(total)} in all. They are processed one after another, in this order.`;

    }

    function updateRow(row) {

        const old = list.querySelector(`li[data-id="${row.id}"]`);

        if (old) {
            old.replaceWith(buildRow(row));
        }

    }

    function showTotals() {

        const t = batchTotals(state.rows);

        if (!t.count) {
            totals.hidden = true;
            return;
        }

        totals.textContent = `${t.count} ${t.count === 1 ? "image" : "images"}: ${formatBytes(t.before)} before, ${formatBytes(t.after)} after. ${t.change.text}`;
        totals.dataset.kind = t.change.kind;
        totals.hidden = false;

    }


    /* ---------- choosing the images ---------- */

    async function start(files) {

        reset(false);

        const epoch = ++state.epoch;
        const id = ctx.tracker.begin();

        ctx.clearError();
        ctx.setState("reading");

        ctx.status.textContent = "Reading images…";
        ctx.status.hidden = false;

        const plan = planBatchSelection(files);
        const rejected = plan.rejected.slice();
        const rows = [];

        for (const index of plan.accepted) {

            const file = files[index];

            let prefix;

            try {
                prefix = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
            } catch {
                rejected.push({ name: file.name, message: MESSAGES.undecodable });
                continue;
            }

            if (epoch !== state.epoch || !ctx.tracker.isCurrent(id)) {
                return;
            }

            const format = sniffFormat(prefix);
            const refusal = refusalFor(format);

            if (refusal) {
                rejected.push({ name: file.name, message: refusal });
                continue;
            }

            const stored = readSize(prefix, format);

            if (!stored) {
                rejected.push({ name: file.name, message: MESSAGES.undecodable });
                continue;
            }

            const size = checkInputSize(stored.width, stored.height);

            if (!size.ok) {
                rejected.push({ name: file.name, message: size.message });
                continue;
            }

            const canvas = document.createElement("canvas");

            canvas.width = 1;
            canvas.height = 1;

            rows.push({
                id: state.nextId++,
                file,
                name: file.name || "image",
                size: file.size,
                width: stored.width,
                height: stored.height,
                format,
                mime: MIME_OF[format],
                alpha: inspectAlpha(prefix, format),
                alphaScanned: null,
                canvas,
                status: "waiting",
                message: "",
                result: null,
                url: null,
                outName: ""
            });

        }

        ctx.status.hidden = true;

        if (rejected.length) {

            const shown = rejected.slice(0, 5).map((r) => `${r.name}: ${r.message}`);

            if (rejected.length > shown.length) {
                shown.push(`${rejected.length - shown.length} more files were not added.`);
            }

            ctx.showError(shown.join(" "));

        }

        if (rows.length === 0) {
            ctx.setState("error");
            return;
        }

        state.rows = rows;

        card.hidden = false;

        await ctx.encoders();

        enterMode();
        renderList();

        ctx.setState("ready");

        ctx.announce(`${rows.length} ${rows.length === 1 ? "image" : "images"} added${rejected.length ? `, ${rejected.length} not added` : ""}. Choose the settings, then press Compress images.`);

        /* thumbnails one at a time, so only one picture is being decoded here */
        state.thumbs = (async () => {

            for (const row of rows) {

                if (epoch !== state.epoch) {
                    return;
                }

                if (!row.file) {
                    continue;
                }

                await makeThumbnail(row.file, row.canvas, 160);

                await yieldToBrowser();

            }

        })();

    }


    /* ---------- settings ---------- */

    function validate() {

        let valid = true;
        let firstInvalid = null;

        const flag = (input, message) => {

            ctx.fieldError(input, message);

            if (message) {
                valid = false;
                firstInvalid = firstInvalid || input;
            }

        };

        let longestSide = null;

        if (sideMode() === "side") {

            const side = parseDimension(sideInput.value, "longest side");

            flag(sideInput, side.ok ? "" : side.message);

            longestSide = side.ok ? side.value : null;

        } else {

            ctx.fieldError(sideInput, "");

        }

        let targetBytes = null;

        if ($('input[name="ic-mode"]:checked').value === "target") {

            const target = parseTargetKB(ctx.targetInput.value);

            flag(ctx.targetInput, target.ok ? "" : target.message);

            targetBytes = target.ok ? target.bytes : null;

        } else {

            ctx.fieldError(ctx.targetInput, "");

        }

        return {
            valid,
            firstInvalid,
            longestSide,
            format: ctx.formatSelect.value,
            quality: clampQuality(ctx.qualityRange.value),
            targetBytes
        };

    }

    /* a change to any setting after a run: the results no longer match, so none can be downloaded */
    function markStale() {

        if (busy() || !state.rows.some((row) => row.status !== "waiting")) {
            return;
        }

        clearResults();
        renderList();

        ctx.setState("ready");

        ctx.announce("The results were removed because the settings changed. Press Compress images again.");

    }


    /* ---------- running ---------- */

    async function run() {

        if (busy() || !active()) {
            return;
        }

        const request = validate();

        if (!request.valid) {
            request.firstInvalid?.focus();
            return;
        }

        const id = ctx.tracker.begin();
        const job = { id, mode: "run" };

        state.job = job;

        ctx.clearError();
        clearResults();
        renderList();

        list.inert = true;

        ctx.setBusy(true);

        ctx.announce(`Processing ${state.rows.length} ${state.rows.length === 1 ? "image" : "images"}.`);

        /* the thumbnails finish first: never two pictures decoded at once */
        await state.thumbs;

        const supported = ctx.supported();
        const taken = new Set();
        const rows = state.rows.slice();

        for (let i = 0; i < rows.length; i++) {

            const row = rows[i];

            if (job.mode !== "run" || !ctx.tracker.isCurrent(id)) {
                break;
            }

            row.status = "working";
            row.message = "";

            updateRow(row);

            ctx.status.textContent = `File ${i + 1} of ${rows.length}…`;

            const mime = request.format === "same" ? row.mime : request.format;

            try {

                if (supported[FORMATS[mime].label.toLowerCase()] === false) {

                    row.status = "skipped";
                    row.message = `Skipped: ${MESSAGES.encoderUnavailable}`;

                } else if (mime === "image/jpeg" && await mayHaveTransparency(row, job)) {

                    row.status = "skipped";
                    row.message = "Skipped: this image may have transparent areas, and JPEG would turn them white. Choose WebP or PNG.";

                } else if (job.mode === "run") {

                    const keepAlpha = mime !== "image/jpeg" && row.alpha !== "none";

                    const result = await ctx.run("process", {
                        file: row.file,
                        width: 0,
                        height: 0,
                        fit: { longestSide: request.longestSide },
                        mime,
                        quality: request.quality,
                        targetBytes: usesQuality(mime) ? request.targetBytes : null,
                        keepAlpha
                    });

                    if (job.mode === "run" && ctx.tracker.isCurrent(id)) {

                        row.result = result;
                        row.status = "done";
                        row.outName = batchFileName(row.name, result.mime, result.width !== row.width || result.height !== row.height, taken);
                        row.url = URL.createObjectURL(result.blob);

                    }

                }

            } catch (error) {

                if (job.mode === "run" && ctx.tracker.isCurrent(id)) {

                    row.status = "failed";
                    row.message = `Failed: ${error && error.message ? error.message : MESSAGES.failed}`;

                }

            }

            if (job.mode === "abort" || !ctx.tracker.isCurrent(id) && job.mode === "run") {
                return;
            }

            if (job.mode === "cancel") {
                break;
            }

            updateRow(row);

            await yieldToBrowser();

        }

        if (job.mode === "abort") {
            return;
        }

        /* cancelled: what finished stays, the rest is marked */
        for (const row of rows) {

            if (row.status === "waiting" || row.status === "working") {

                row.status = "cancelled";
                row.message = "";

            }

        }

        state.job = null;

        list.inert = false;

        renderList();
        showTotals();

        ctx.setBusy(false);

        const done = rows.some((row) => row.status === "done");

        ctx.setState(done ? "done" : "ready");

        ctx.announce(job.mode === "cancel" ? `Cancelled. ${describeBatchFinish(rows)}.` : `${describeBatchFinish(rows)}.`);

        if (job.mode === "cancel") {
            ctx.processButton.focus();
        } else {
            title.focus();
        }

    }

    /* JPEG has no transparency: an image that may have some is skipped, never flattened silently */
    async function mayHaveTransparency(row, job) {

        if (row.alpha === "none") {
            return false;
        }

        if (row.alphaScanned === null) {

            try {

                const inspected = await ctx.run("inspect", { file: row.file, scanAlpha: true, keepAlpha: true });

                row.alphaScanned = inspected.alpha === "no" ? "no" : "yes";

            } catch (error) {

                if (job.mode !== "run") {
                    return false;
                }

                row.alphaScanned = "yes";

            }

        }

        return row.alphaScanned === "yes";

    }

    /* the page has stopped the worker; the loop ends at its next step and marks what was left */
    function cancel() {

        if (state.job) {
            state.job.mode = "cancel";
        }

    }


    /* ---------- row buttons ---------- */

    function onListClick(event) {

        const button = event.target.closest("button[data-action]");

        if (!button || busy()) {
            return;
        }

        const id = Number(button.closest("li").dataset.id);
        const index = state.rows.findIndex((row) => row.id === id);

        if (index < 0) {
            return;
        }

        const row = state.rows[index];

        if (button.dataset.action === "preview") {

            if (state.previewId === row.id) {
                clearPreview();
            } else {

                clearPreview();

                state.previewUrl = URL.createObjectURL(row.result.preview.blob);
                state.previewId = row.id;

                previewImg.src = state.previewUrl;
                previewImg.width = row.result.preview.width;
                previewImg.height = row.result.preview.height;
                previewCaption.textContent = `${row.outName}: ${formatDimensions(row.result.width, row.result.height)} px, ${formatBytes(row.result.size)}`;
                previewFigure.hidden = false;

            }

            renderList();

            list.querySelector(`li[data-id="${id}"] [data-action="preview"]`)?.focus();

            return;

        }

        /* remove */
        if (state.previewId === row.id) {
            clearPreview();
        }

        state.rows.splice(index, 1);

        releaseRow(row);

        if (state.rows.length === 0) {

            reset(true);

            ctx.announce("Cleared. Choose images to start again.");

            return;

        }

        renderList();
        showTotals();

        const next = state.rows[index] || state.rows[index - 1];

        list.querySelector(`li[data-id="${next.id}"] [data-action="remove"]`)?.focus();

        ctx.announce(`${row.name} removed. ${state.rows.length} ${state.rows.length === 1 ? "image" : "images"} left.`);

    }

    list.addEventListener("click", onListClick);

    for (const radio of ctx.settings.querySelectorAll('input[name="ic-side-mode"]')) {
        radio.addEventListener("change", onSideMode);
    }


    /* ---------- leaving ---------- */

    /* everything a batch holds is dropped: URLs revoked, canvases shrunk, files forgotten */
    function reset(restore = true) {

        state.epoch += 1;

        if (state.job) {
            state.job.mode = "abort";
            state.job = null;
        }

        clearPreview();

        for (const row of state.rows) {
            releaseRow(row);
        }

        state.rows = [];

        list.replaceChildren();
        list.inert = false;
        totals.hidden = true;
        summary.textContent = "";
        card.hidden = true;

        if (panel.dataset.mode === "batch") {

            leaveMode();

            if (restore) {
                ctx.settings.hidden = true;
            }

        }

    }

    return { active, busy, start, run, cancel, reset, markStale, maxFiles: MAX_BATCH_FILES, maxBytes: MAX_BATCH_BYTES };

}
