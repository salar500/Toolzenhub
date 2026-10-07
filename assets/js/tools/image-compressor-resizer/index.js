/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer (Image Tools)

   Choose one image, set a size and an output, press Compress
   image, look at an honest before and after, download. Everything
   happens in the browser: the image is never uploaded, stored or
   put in the address.

   The rules (what a file is, the limits, resize arithmetic, which
   formats are allowed, the "up to N KB" search, file names and the
   wording of the result) are in image-engine.js; the pixel work is
   in image-pipeline.js and runs in a Worker when the browser has
   one (image-worker.js), otherwise on the main thread. This file is
   the page around them: files, controls, state, messages, cleanup.
   See docs/tool-packs/20-image-compressor-resizer.md.

   Only the original File lives between runs. Every run starts from
   it, decodes, draws once at the output size, closes the bitmap and
   encodes; every object URL is revoked when replaced or on reset;
   a late answer from an earlier run is dropped.
========================================================= */

import {
    MAX_FILE_BYTES,
    MAX_INPUT_PIXELS,
    HEADER_BYTES,
    QUALITY_MIN,
    QUALITY_MAX,
    QUALITY_DEFAULT,
    QUALITY_PRESETS,
    FORMATS,
    MESSAGES,
    RESIZE_PRESETS,
    sniffFormat,
    refusalFor,
    readSize,
    inspectAlpha,
    checkFile,
    checkInputSize,
    checkOutputSize,
    fitToOutputLimits,
    heightFromWidth,
    widthFromHeight,
    parseDimension,
    presetSize,
    outputChoices,
    defaultOutput,
    usesQuality,
    clampQuality,
    parseTargetKB,
    formatBytes,
    formatDimensions,
    describeChange,
    outputFileName,
    MIME_OF,
    createOperationTracker
} from "./image-engine.js";

import {
    inspectImage,
    processImage,
    createMainEnv
} from "./image-pipeline.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("image-compressor-resizer").title;

const ANNOUNCE_DELAY_MS = 150;

const nf = (n) => n.toLocaleString("en-US");


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    const presetButtons = RESIZE_PRESETS.map((preset) => `
                                    <button
                                        type="button"
                                        class="ic-chip"
                                        data-preset="${preset.id}"
                                        aria-pressed="false"
                                    >${preset.label}</button>`).join("");

    const qualityRadios = QUALITY_PRESETS.map((preset) => `
                                    <label class="ic-radio">
                                        <input
                                            type="radio"
                                            name="ic-quality-preset"
                                            value="${preset.id}"
                                            data-quality="${preset.quality}"
                                            ${preset.id === "balanced" ? "checked" : ""}
                                        >
                                        <span>${preset.label}</span>
                                    </label>`).join("");

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
                        Make a photo or screenshot smaller in dimensions and
                        file size, and see exactly what changed.
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
                            Processed in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE TOOL -->

            <section class="calculator-section">

                <div
                    id="ic-panel"
                    class="ic-workspace"
                    data-state="empty"
                >

                    <div class="ic-card">

                        <h2 class="ic-card__title">
                            Choose an image
                        </h2>

                        <div
                            id="ic-drop"
                            class="ic-drop"
                        >

                            <label
                                for="ic-file"
                                class="ic-drop__label"
                            >
                                Choose a JPEG, PNG or WebP image
                            </label>

                            <input
                                type="file"
                                id="ic-file"
                                class="ic-file"
                                accept="image/jpeg,image/png,image/webp"
                                aria-describedby="ic-drop-hint"
                            >

                            <p
                                id="ic-drop-hint"
                                class="ic-hint"
                            >
                                or drag one here. One image at a time, up to
                                ${formatBytes(MAX_FILE_BYTES)} and
                                ${nf(MAX_INPUT_PIXELS / 1e6)} megapixels. Your image is
                                processed in your browser and is not uploaded
                                by this tool.
                            </p>

                        </div>

                        <p
                            id="ic-error"
                            class="ic-error"
                            role="alert"
                            hidden
                        ></p>

                    </div>


                    <div
                        id="ic-original"
                        class="ic-card"
                        hidden
                    >

                        <h2 class="ic-card__title">
                            Original
                        </h2>

                        <figure class="ic-figure">

                            <img
                                id="ic-original-img"
                                class="ic-preview"
                                alt="Scaled preview of the original image"
                            >

                        </figure>

                        <dl class="ic-metrics">

                            <div class="ic-metric">
                                <dt>File</dt>
                                <dd id="ic-original-name"></dd>
                            </div>

                            <div class="ic-metric">
                                <dt>Dimensions</dt>
                                <dd id="ic-original-dimensions"></dd>
                            </div>

                            <div class="ic-metric">
                                <dt>Size</dt>
                                <dd id="ic-original-size"></dd>
                            </div>

                            <div class="ic-metric">
                                <dt>Format</dt>
                                <dd id="ic-original-format"></dd>
                            </div>

                        </dl>

                    </div>


                    <form
                        id="ic-settings"
                        class="ic-card"
                        novalidate
                        hidden
                    >

                        <fieldset
                            id="ic-fields"
                            class="ic-fields"
                        >

                            <legend class="ic-card__title">
                                Settings
                            </legend>

                            <fieldset class="ic-group">

                                <legend>Size in pixels</legend>

                                <div
                                    class="ic-chips"
                                    id="ic-presets"
                                >${presetButtons}
                                </div>

                                <div class="ic-size">

                                    <div class="ic-field">

                                        <label for="ic-width">Width</label>

                                        <input
                                            type="text"
                                            id="ic-width"
                                            class="ic-input"
                                            inputmode="numeric"
                                            autocomplete="off"
                                            aria-describedby="ic-width-error"
                                        >

                                        <p
                                            id="ic-width-error"
                                            class="ic-field-error"
                                        ></p>

                                    </div>

                                    <div class="ic-field">

                                        <label for="ic-height">Height</label>

                                        <input
                                            type="text"
                                            id="ic-height"
                                            class="ic-input"
                                            inputmode="numeric"
                                            autocomplete="off"
                                            aria-describedby="ic-height-error"
                                        >

                                        <p
                                            id="ic-height-error"
                                            class="ic-field-error"
                                        ></p>

                                    </div>

                                </div>

                                <label class="ic-check">
                                    <input
                                        type="checkbox"
                                        id="ic-lock"
                                        checked
                                    >
                                    <span>Keep aspect ratio</span>
                                </label>

                                <p
                                    id="ic-size-notes"
                                    class="ic-notes"
                                ></p>

                            </fieldset>

                            <fieldset class="ic-group">

                                <legend>Output</legend>

                                <div class="ic-field">

                                    <label for="ic-format">Format</label>

                                    <select
                                        id="ic-format"
                                        class="ic-input"
                                        aria-describedby="ic-format-help"
                                    ></select>

                                    <p
                                        id="ic-format-help"
                                        class="ic-hint"
                                    ></p>

                                </div>

                                <p
                                    id="ic-png-note"
                                    class="ic-notes"
                                    hidden
                                >${MESSAGES.pngNote}</p>

                                <div id="ic-lossy">

                                    <div
                                        class="ic-modes"
                                        role="radiogroup"
                                        aria-label="How to choose the file size"
                                    >

                                        <label class="ic-radio">
                                            <input
                                                type="radio"
                                                name="ic-mode"
                                                value="quality"
                                                checked
                                            >
                                            <span>Set the quality</span>
                                        </label>

                                        <label class="ic-radio">
                                            <input
                                                type="radio"
                                                name="ic-mode"
                                                value="target"
                                            >
                                            <span>Up to a file size</span>
                                        </label>

                                    </div>

                                    <div id="ic-quality-block">

                                        <div
                                            class="ic-presets"
                                            role="radiogroup"
                                            aria-label="Quality preset"
                                        >${qualityRadios}
                                        </div>

                                        <details class="ic-advanced">

                                            <summary>Advanced: set the quality yourself</summary>

                                            <div class="ic-field">

                                                <label for="ic-quality">
                                                    Quality
                                                    <output
                                                        id="ic-quality-value"
                                                        for="ic-quality"
                                                    >${QUALITY_DEFAULT}</output>
                                                </label>

                                                <input
                                                    type="range"
                                                    id="ic-quality"
                                                    class="ic-range"
                                                    min="${QUALITY_MIN}"
                                                    max="${QUALITY_MAX}"
                                                    step="1"
                                                    value="${QUALITY_DEFAULT}"
                                                    aria-describedby="ic-quality-help"
                                                >

                                                <p
                                                    id="ic-quality-help"
                                                    class="ic-hint"
                                                >${MESSAGES.qualityHelp}</p>

                                            </div>

                                        </details>

                                    </div>

                                    <div
                                        id="ic-target-block"
                                        hidden
                                    >

                                        <div class="ic-field">

                                            <label for="ic-target">Up to (KB)</label>

                                            <input
                                                type="text"
                                                id="ic-target"
                                                class="ic-input"
                                                inputmode="numeric"
                                                autocomplete="off"
                                                value="500"
                                                aria-describedby="ic-target-help ic-target-error"
                                            >

                                            <p
                                                id="ic-target-help"
                                                class="ic-hint"
                                            >Try to keep the output at or below this size. The size is approximate and depends on the image; the dimensions above are not changed to reach it.</p>

                                            <p
                                                id="ic-target-error"
                                                class="ic-field-error"
                                            ></p>

                                        </div>

                                    </div>

                                </div>

                            </fieldset>

                        </fieldset>

                        <div class="ic-actions">

                            <button
                                type="submit"
                                id="ic-process"
                                class="calculator-form__button ic-button"
                            >
                                Compress image
                            </button>

                            <button
                                type="button"
                                id="ic-reset"
                                class="calculator-form__button calculator-form__button--secondary ic-button"
                            >
                                Reset
                            </button>

                        </div>

                    </form>


                    <p
                        id="ic-status"
                        class="ic-status"
                        hidden
                    ></p>

                    <button
                        type="button"
                        id="ic-cancel"
                        class="calculator-form__button calculator-form__button--secondary ic-button ic-cancel"
                        hidden
                    >
                        Cancel
                    </button>


                    <div
                        id="ic-result"
                        class="ic-card"
                        hidden
                    >

                        <h2 class="ic-card__title">
                            Result
                        </h2>

                        <p
                            id="ic-change"
                            class="ic-change"
                            data-kind=""
                        ></p>

                        <p
                            id="ic-change-detail"
                            class="ic-notes"
                            hidden
                        ></p>

                        <p
                            id="ic-target-result"
                            class="ic-notes"
                            hidden
                        ></p>

                        <figure class="ic-figure">

                            <img
                                id="ic-result-img"
                                class="ic-preview"
                                alt="Scaled preview of the processed image"
                            >

                        </figure>

                        <dl class="ic-metrics">

                            <div class="ic-metric">
                                <dt>Dimensions</dt>
                                <dd id="ic-result-dimensions"></dd>
                            </div>

                            <div class="ic-metric">
                                <dt>Size</dt>
                                <dd id="ic-result-size"></dd>
                            </div>

                            <div class="ic-metric">
                                <dt>Format</dt>
                                <dd id="ic-result-format"></dd>
                            </div>

                            <div
                                class="ic-metric"
                                id="ic-result-quality-row"
                            >
                                <dt>Quality used</dt>
                                <dd id="ic-result-quality"></dd>
                            </div>

                        </dl>

                        <a
                            id="ic-download"
                            class="calculator-form__button ic-download"
                            href="#"
                            download=""
                        >
                            Download
                        </a>

                        <p class="ic-notes">
                            ${MESSAGES.metadata} Colours are converted by the
                            browser; this is not a colour-managed workflow.
                        </p>

                    </div>

                </div>

            </section>

            <p
                id="ic-live"
                class="ic-sr"
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
                        Choose a JPEG, PNG or WebP image (or drag one onto the
                        box on a computer).
                    </li>
                    <li>
                        Pick a new size, or leave it, and choose the output
                        format and quality. Or choose <em>Up to a file size</em>
                        and enter the most you want, in KB.
                    </li>
                    <li>
                        Press <strong>Compress image</strong>. Compare the
                        result with the original and download it. You can change
                        the settings and compress again: each run starts from
                        your original, never from the last result.
                    </li>
                </ol>

            </section>


            <!-- SIZE AND QUALITY -->

            <section class="calculator-info">

                <h2>
                    What Makes a File Smaller
                </h2>

                <p>
                    Dimensions matter most: halving the width and height leaves
                    about a quarter of the pixels. Lowering the quality of a
                    JPEG or WebP saves more, at the cost of detail. Saving an
                    image again at the same size can make the file
                    <strong>larger</strong>, for example when the original was
                    already compressed hard, so the page always shows the actual
                    result, including when it grew.
                </p>

                <p>
                    PNG is lossless here, so it has no quality setting: reduce
                    the dimensions, or choose WebP or JPEG, to get a smaller
                    file. JPEG cannot keep transparency, so it is not offered
                    for images that have it.
                </p>

                <p>
                    The "up to" size is approximate. The page tries a handful of
                    quality settings and keeps the highest quality that fits. If even
                    the lowest quality at your chosen dimensions is still too
                    large, it says so and you can try smaller dimensions.
                </p>

            </section>


            <!-- LIMITS AND PRIVACY -->

            <section class="calculator-info">

                <h2>
                    Limits and Privacy
                </h2>

                <p>
                    One image at a time: JPEG, PNG or WebP, up to
                    ${formatBytes(MAX_FILE_BYTES)} and
                    ${nf(MAX_INPUT_PIXELS / 1e6)} megapixels, output up to 8,192 pixels
                    on a side. HEIC/HEIF, GIF (animation would be lost), AVIF
                    and SVG are not supported in this version. Large images
                    need a lot of memory on a phone, so the limits are
                    deliberately conservative.
                </p>

                <p>
                    Your image is processed in your browser and is not uploaded
                    by this tool. It is not saved, and the page address never
                    contains it. Reloading the page clears it.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    Frequently Asked Questions
                </h2>

                <details>
                    <summary>
                        Why is the result larger than my original?
                    </summary>
                    <p>
                        Saving an already well-compressed image again, at the
                        same size and a higher quality, can produce a bigger
                        file. Reduce the dimensions, lower the quality or choose
                        WebP to get a smaller one.
                    </p>
                </details>

                <details>
                    <summary>
                        Why can't I choose JPEG for my PNG?
                    </summary>
                    <p>
                        JPEG cannot store transparency. If the image has
                        transparent pixels, JPEG is turned off so they are not
                        replaced by a solid colour without you knowing. Keep PNG
                        or use WebP.
                    </p>
                </details>

                <details>
                    <summary>
                        Is the photo's location removed?
                    </summary>
                    <p>
                        Saving the image again normally drops the embedded
                        camera information, including location, but check the
                        downloaded file if that matters to you.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is my HEIC photo refused?
                    </summary>
                    <p>
                        Browsers do not decode HEIC reliably, so this version
                        does not accept it. Export or share the photo as JPEG,
                        PNG or WebP first.
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
   Capabilities (feature detection, never browser sniffing)
========================================================= */

/* which formats this browser can really encode: ask for a tiny image and see what comes back */
async function detectEncoders() {

    const supported = { jpeg: false, webp: false, png: true };

    try {

        const canvas = document.createElement("canvas");

        canvas.width = 1;
        canvas.height = 1;

        const toBlob = (mime) => new Promise((resolve) => canvas.toBlob(resolve, mime, 0.8));

        supported.jpeg = (await toBlob("image/jpeg"))?.type === "image/jpeg";
        supported.webp = (await toBlob("image/webp"))?.type === "image/webp";
        supported.png = (await toBlob("image/png"))?.type === "image/png";

    } catch (problem) {
        /* leave the defaults: only PNG is assumed */
    }

    return supported;

}

function workerPossible() {

    try {

        return typeof Worker === "function"
            && typeof OffscreenCanvas === "function"
            && typeof createImageBitmap === "function"
            && typeof OffscreenCanvas.prototype.convertToBlob === "function"
            && Boolean(new OffscreenCanvas(1, 1).getContext("2d"));

    } catch (problem) {

        return false;

    }

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const panel = document.querySelector("#ic-panel");

    if (!panel) {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const fileInput = $("#ic-file");
    const drop = $("#ic-drop");
    const errorBox = $("#ic-error");
    const originalCard = $("#ic-original");
    const originalImg = $("#ic-original-img");
    const settings = $("#ic-settings");
    const fields = $("#ic-fields");
    const widthInput = $("#ic-width");
    const heightInput = $("#ic-height");
    const lock = $("#ic-lock");
    const sizeNotes = $("#ic-size-notes");
    const formatSelect = $("#ic-format");
    const formatHelp = $("#ic-format-help");
    const pngNote = $("#ic-png-note");
    const lossy = $("#ic-lossy");
    const qualityBlock = $("#ic-quality-block");
    const targetBlock = $("#ic-target-block");
    const qualityRange = $("#ic-quality");
    const qualityValue = $("#ic-quality-value");
    const targetInput = $("#ic-target");
    const status = $("#ic-status");
    const resultCard = $("#ic-result");
    const resultImg = $("#ic-result-img");
    const live = $("#ic-live");
    const download = $("#ic-download");
    const processButton = $("#ic-process");
    const cancelButton = $("#ic-cancel");

    const tracker = createOperationTracker();

    /* what is on the page now: the original File and what was learned about it, and the object URLs */
    const state = {
        file: null,
        info: null,
        alpha: "none",
        supported: { jpeg: true, webp: false, png: true },
        urls: { original: null, result: null, download: null }
    };

    const encoders = detectEncoders();

    let announceTimer = null;

    /* the worker, started on first use; null means "use the main thread" */
    let worker = null;
    let workerBroken = !workerPossible();
    let nextRequest = 0;
    const pending = new Map();


    /* ---------- small helpers ---------- */

    function announce(message) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {

            live.textContent = "";

            setTimeout(() => {
                live.textContent = message;
            }, 50);

        }, ANNOUNCE_DELAY_MS);

    }

    function setState(value) {

        panel.dataset.state = value;

    }

    function showError(message) {

        errorBox.textContent = message;
        errorBox.hidden = false;

    }

    function clearError() {

        errorBox.textContent = "";
        errorBox.hidden = true;

    }

    function fieldError(input, message) {

        const slot = $(`#${input.id}-error`);

        slot.textContent = message;

        if (message) {
            input.setAttribute("aria-invalid", "true");
        } else {
            input.removeAttribute("aria-invalid");
        }

    }

    function revoke(key) {

        if (state.urls[key]) {
            URL.revokeObjectURL(state.urls[key]);
            state.urls[key] = null;
        }

    }

    function setUrl(key, blob) {

        revoke(key);

        state.urls[key] = URL.createObjectURL(blob);

        return state.urls[key];

    }

    /* nothing from the image survives this: URLs revoked, pictures cleared, references dropped */
    function releaseAll() {

        revoke("original");
        revoke("result");
        revoke("download");

        originalImg.removeAttribute("src");
        resultImg.removeAttribute("src");
        download.removeAttribute("href");

        state.file = null;
        state.info = null;

    }

    function clearResult() {

        revoke("result");
        revoke("download");

        resultImg.removeAttribute("src");
        download.removeAttribute("href");

        resultCard.hidden = true;

    }


    /* ---------- running the pipeline: worker first, the same code on the main thread otherwise ---------- */

    function startWorker() {

        if (worker || workerBroken) {
            return worker;
        }

        try {

            worker = new Worker(new URL("./image-worker.js", import.meta.url), { type: "module" });

            worker.onmessage = (event) => {

                const { id, ok, result, error } = event.data;

                const entry = pending.get(id);

                if (!entry) {
                    return;
                }

                pending.delete(id);

                if (ok) {
                    entry.resolve(result);
                } else {
                    entry.reject(error);
                }

            };

            /* the script could not load or crashed: every waiting request falls back to the main thread */
            worker.onerror = () => {

                workerBroken = true;

                worker?.terminate();
                worker = null;

                for (const [id, entry] of pending) {
                    pending.delete(id);
                    entry.reject({ code: "worker-failed", message: MESSAGES.failed });
                }

            };

        } catch (problem) {

            workerBroken = true;
            worker = null;

        }

        return worker;

    }

    async function runOnMain(op, request) {

        panel.dataset.engine = "main";

        const env = createMainEnv();

        try {

            return op === "inspect" ? await inspectImage(request, env) : await processImage(request, env);

        } catch (problem) {

            throw { code: problem.code ?? "failed", message: problem.code ? problem.message : MESSAGES.failed };

        }

    }

    async function run(op, request) {

        const active = startWorker();

        if (!active) {
            return runOnMain(op, request);
        }

        const id = ++nextRequest;

        try {

            const result = await new Promise((resolve, reject) => {

                pending.set(id, { resolve, reject });

                active.postMessage({ id, op, ...request });

            });

            panel.dataset.engine = "worker";

            return result;

        } catch (error) {

            /* a browser that cannot do it in a worker: run the same steps here, once */
            if (error && (error.code === "unsupported" || error.code === "worker-failed")) {

                if (error.code === "unsupported") {
                    workerBroken = true;
                }

                return runOnMain(op, request);

            }

            throw error;

        }

    }


    /* ---------- choosing a file ---------- */

    async function handleFile(file) {

        const id = tracker.begin();

        /* a new image replaces everything, including a run that is still going: its answer will be dropped */
        fields.disabled = false;
        processButton.disabled = false;
        cancelButton.hidden = true;
        panel.removeAttribute("aria-busy");

        releaseAll();
        clearResult();
        clearError();

        originalCard.hidden = true;
        settings.hidden = true;
        status.hidden = true;

        const accepted = checkFile(file);

        if (!accepted.ok) {
            setState("error");
            showError(accepted.message);
            return;
        }

        setState("reading");

        status.textContent = "Reading image…";
        status.hidden = false;

        let prefix;

        try {

            prefix = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());

        } catch (problem) {

            if (tracker.isCurrent(id)) {
                status.hidden = true;
                setState("error");
                showError(MESSAGES.undecodable);
            }

            return;

        }

        if (!tracker.isCurrent(id)) {
            return;
        }

        const format = sniffFormat(prefix);

        const refusal = refusalFor(format);

        if (refusal) {
            status.hidden = true;
            setState("error");
            showError(refusal);
            return;
        }

        const stored = readSize(prefix, format);

        if (!stored) {
            status.hidden = true;
            setState("error");
            showError(MESSAGES.undecodable);
            return;
        }

        /* refuse a huge image from its header, before it is decoded */
        const size = checkInputSize(stored.width, stored.height);

        if (!size.ok) {
            status.hidden = true;
            setState("error");
            showError(size.message);
            return;
        }

        state.supported = await encoders;

        const alpha = inspectAlpha(prefix, format);

        let inspected;

        try {

            inspected = await run("inspect", {
                file,
                scanAlpha: alpha === "possible",
                keepAlpha: alpha === "possible"
            });

        } catch (error) {

            if (tracker.isCurrent(id)) {
                status.hidden = true;
                setState("error");
                showError(error.code === "too-large" ? "This image has more pixels than can be processed safely." : MESSAGES.undecodable);
            }

            return;

        }

        if (!tracker.isCurrent(id)) {
            return;
        }

        state.file = file;

        state.info = {
            width: inspected.width,
            height: inspected.height,
            format,
            mime: MIME_OF[format]
        };

        /* "possible" until the scan says otherwise; a header that proved none stays none */
        state.alpha = inspected.alpha === "yes" ? "yes" : inspected.alpha === "no" ? "no" : alpha;

        status.hidden = true;

        showOriginal(file, inspected);

        initSettings();

        setState("ready");

        announce("Image loaded. Choose a size and an output, then press Compress image.");

    }

    function showOriginal(file, inspected) {

        originalImg.src = setUrl("original", inspected.preview.blob);

        originalImg.width = inspected.preview.width;
        originalImg.height = inspected.preview.height;

        $("#ic-original-name").textContent = file.name || "image";
        $("#ic-original-dimensions").textContent = formatDimensions(state.info.width, state.info.height);
        $("#ic-original-size").textContent = formatBytes(file.size);
        $("#ic-original-format").textContent = FORMATS[state.info.mime].label;

        originalCard.hidden = false;

    }

    function initSettings() {

        const { width, height } = state.info;

        /* an image bigger than the output limit starts at the largest size that can be made */
        const start = fitToOutputLimits(width, height);

        state.limited = start.width !== width || start.height !== height;

        widthInput.value = String(start.width);
        heightInput.value = String(start.height);
        lock.checked = true;

        fieldError(widthInput, "");
        fieldError(heightInput, "");

        renderFormats(state.info.mime);

        $('input[name="ic-mode"][value="quality"]').checked = true;
        $('input[name="ic-quality-preset"][value="balanced"]').checked = true;

        qualityRange.value = String(QUALITY_DEFAULT);
        qualityValue.textContent = String(QUALITY_DEFAULT);

        targetInput.value = "500";
        fieldError(targetInput, "");

        updateModeVisibility();
        updateSizeNotes();

        settings.hidden = false;

    }


    /* ---------- the size controls ---------- */

    function currentSize() {

        const w = parseDimension(widthInput.value, "width");
        const h = parseDimension(heightInput.value, "height");

        return { w, h };

    }

    function updateSizeNotes() {

        const { width, height } = state.info;

        const { w, h } = currentSize();

        const notes = [];

        if (state.limited) {
            notes.push(MESSAGES.limited);
        }

        if (w.ok && h.ok) {

            const originalRatio = width / height;
            const ratio = w.value / h.value;

            if (Math.abs(ratio - originalRatio) / originalRatio > 0.01) {
                notes.push(MESSAGES.stretch);
            }

            if (w.value > width || h.value > height) {
                notes.push(MESSAGES.enlarge);
            }

        }

        sizeNotes.textContent = notes.join(" ");

        for (const button of $("#ic-presets").querySelectorAll("button")) {

            const preset = presetSize(button.dataset.preset, width, height);

            /* a preset is offered only when it would not enlarge the image and the output could be made */
            button.disabled = preset === null || !checkOutputSize(preset.width, preset.height).ok;

            button.setAttribute("aria-pressed", String(Boolean(preset && w.ok && h.ok && preset.width === w.value && preset.height === h.value)));

        }

    }

    function onWidthInput() {

        if (widthInput.value.trim() === "") {
            fieldError(widthInput, "");
            updateSizeNotes();
            return;
        }

        const parsed = parseDimension(widthInput.value, "width");

        fieldError(widthInput, parsed.ok ? "" : parsed.message);

        if (parsed.ok && lock.checked) {

            heightInput.value = String(heightFromWidth(parsed.value, state.info.width, state.info.height));

            fieldError(heightInput, "");

        }

        updateSizeNotes();

    }

    function onHeightInput() {

        if (heightInput.value.trim() === "") {
            fieldError(heightInput, "");
            updateSizeNotes();
            return;
        }

        const parsed = parseDimension(heightInput.value, "height");

        fieldError(heightInput, parsed.ok ? "" : parsed.message);

        if (parsed.ok && lock.checked) {

            widthInput.value = String(widthFromHeight(parsed.value, state.info.width, state.info.height));

            fieldError(widthInput, "");

        }

        updateSizeNotes();

    }

    function applyPreset(id) {

        const preset = presetSize(id, state.info.width, state.info.height);

        if (!preset) {
            return;
        }

        widthInput.value = String(preset.width);
        heightInput.value = String(preset.height);

        fieldError(widthInput, "");
        fieldError(heightInput, "");

        updateSizeNotes();

    }


    /* ---------- the output controls ---------- */

    function renderFormats(preferred) {

        const choices = outputChoices({ inputMime: state.info.mime, alpha: state.alpha, supported: state.supported });

        const wanted = choices.find((choice) => choice.mime === preferred && !choice.disabled)?.mime ?? defaultOutput(state.info.mime, choices);

        formatSelect.replaceChildren();

        for (const choice of choices) {

            const option = document.createElement("option");

            option.value = choice.mime;
            option.textContent = choice.disabled ? `${choice.label} (not available)` : choice.label;
            option.disabled = choice.disabled;

            formatSelect.append(option);

        }

        formatSelect.value = wanted;

        const jpeg = choices.find((choice) => choice.mime === "image/jpeg");

        formatHelp.textContent = jpeg && jpeg.disabled ? jpeg.reason : "";

        updateModeVisibility();

    }

    function selectedMime() {

        return formatSelect.value || state.info.mime;

    }

    function updateModeVisibility() {

        const lossyOutput = usesQuality(selectedMime());

        lossy.hidden = !lossyOutput;
        pngNote.hidden = lossyOutput;

        const targetMode = $('input[name="ic-mode"]:checked').value === "target";

        qualityBlock.hidden = targetMode;
        targetBlock.hidden = !targetMode;

    }


    /* ---------- compressing ---------- */

    function setBusy(busy) {

        fields.disabled = busy;
        processButton.disabled = busy;

        cancelButton.hidden = !busy;

        if (busy) {
            status.textContent = "Processing image…";
            status.hidden = false;
            setState("busy");
        } else {
            status.hidden = true;
        }

        if (busy) {
            panel.setAttribute("aria-busy", "true");
        } else {
            panel.removeAttribute("aria-busy");
        }

    }

    function validateSettings() {

        const { w, h } = currentSize();

        let valid = true;
        let firstInvalid = null;

        const flag = (input, message) => {

            fieldError(input, message);

            if (message && !firstInvalid) {
                firstInvalid = input;
            }

            if (message) {
                valid = false;
            }

        };

        flag(widthInput, w.ok ? "" : w.message);
        flag(heightInput, h.ok ? "" : h.message);

        if (w.ok && h.ok) {

            const output = checkOutputSize(w.value, h.value);

            if (!output.ok) {
                flag(widthInput, output.message);
            }

        }

        const mime = selectedMime();

        let targetBytes = null;

        if (usesQuality(mime) && $('input[name="ic-mode"]:checked').value === "target") {

            const target = parseTargetKB(targetInput.value);

            flag(targetInput, target.ok ? "" : target.message);

            targetBytes = target.ok ? target.bytes : null;

        } else {

            fieldError(targetInput, "");

        }

        return {
            valid,
            firstInvalid,
            width: w.value,
            height: h.value,
            mime,
            quality: clampQuality(qualityRange.value),
            targetBytes
        };

    }

    async function compress() {

        if (!state.file || !state.info) {
            return;
        }

        const request = validateSettings();

        if (!request.valid) {
            request.firstInvalid?.focus();
            return;
        }

        const id = tracker.begin();

        clearError();
        clearResult();

        setBusy(true);

        announce("Processing image…");

        const keepAlpha = request.mime !== "image/jpeg" && (state.alpha === "possible" || state.alpha === "yes");

        let result;

        try {

            result = await run("process", {
                file: state.file,
                width: request.width,
                height: request.height,
                mime: request.mime,
                quality: request.quality,
                targetBytes: request.targetBytes,
                keepAlpha
            });

        } catch (error) {

            /* an answer to an operation that is no longer current is not shown */
            if (!tracker.isCurrent(id)) {
                return;
            }

            setBusy(false);
            setState("ready");

            showError(error && error.message ? error.message : MESSAGES.failed);

            announce(error && error.message ? error.message : MESSAGES.failed);

            return;

        }

        if (!tracker.isCurrent(id)) {
            /* a late result from an earlier operation (a reset or a new file came first): drop it */
            return;
        }

        setBusy(false);

        showResult(result);

    }

    function showResult(result) {

        const original = state.file.size;

        const change = describeChange(original, result.size);

        resultImg.src = setUrl("result", result.preview.blob);

        resultImg.width = result.preview.width;
        resultImg.height = result.preview.height;

        const name = outputFileName(state.file.name, result.mime, result.width !== state.info.width || result.height !== state.info.height);

        download.href = setUrl("download", result.blob);
        download.setAttribute("download", name);
        download.textContent = `Download ${name}`;

        const changeLine = $("#ic-change");

        changeLine.textContent = change.text;
        changeLine.dataset.kind = change.kind;

        const detail = $("#ic-change-detail");

        detail.textContent = change.detail;
        detail.hidden = change.detail === "";

        $("#ic-result-dimensions").textContent = formatDimensions(result.width, result.height);
        $("#ic-result-size").textContent = formatBytes(result.size);
        $("#ic-result-format").textContent = FORMATS[result.mime].label;

        const qualityRow = $("#ic-result-quality-row");

        qualityRow.hidden = result.quality === null;

        if (result.quality !== null) {
            $("#ic-result-quality").textContent = String(result.quality);
        }

        const targetNote = $("#ic-target-result");

        if (result.target) {

            const asked = `Up to ${nf(Math.round(result.target.requestedBytes / 1024))} KB`;

            targetNote.textContent = result.target.reached
                ? `Target: ${asked}. Result: ${formatBytes(result.size)} at quality ${result.quality}.`
                : `Couldn't get under ${nf(Math.round(result.target.requestedBytes / 1024))} KB at these dimensions. Try smaller dimensions. The smallest result this tool will make here is ${formatBytes(result.target.floorSize)} (quality ${result.quality}).`;

            targetNote.hidden = false;

        } else {

            targetNote.hidden = true;

        }

        resultCard.hidden = false;

        panel.dataset.engineMs = String(result.timings.totalMs);
        panel.dataset.decodeMs = String(result.timings.decodeMs);
        panel.dataset.drawMs = String(result.timings.drawMs);
        panel.dataset.encodeMs = String(result.timings.encodeMs);
        panel.dataset.attempts = String(result.timings.attempts);

        setState("done");

        const spoken = result.target && !result.target.reached
            ? `Done. Couldn't get under ${nf(Math.round(result.target.requestedBytes / 1024))} KB at these dimensions.`
            : `Done. ${change.text} Output is ${formatBytes(result.size)}, ${formatDimensions(result.width, result.height)}.`;

        announce(spoken);

    }


    /* ---------- cancel: a long run (WebP "up to a size" on a big output can take many seconds) can be abandoned ---------- */

    function cancel() {

        tracker.invalidate();

        /* a worker is stopped outright; a main-thread run cannot be, but its answer is dropped */
        if (worker) {

            worker.terminate();

            worker = null;

        }

        for (const [id, entry] of pending) {
            pending.delete(id);
            entry.reject({ code: "cancelled", message: "Cancelled." });
        }

        setBusy(false);
        setState("ready");

        announce("Cancelled. Your settings are unchanged.");

        processButton.focus();

    }


    /* ---------- reset ---------- */

    function reset() {

        tracker.invalidate();

        releaseAll();
        clearResult();
        clearError();

        fileInput.value = "";

        originalCard.hidden = true;
        settings.hidden = true;
        status.hidden = true;

        fields.disabled = false;
        processButton.disabled = false;
        cancelButton.hidden = true;
        panel.removeAttribute("aria-busy");

        setState("empty");

        announce("Cleared. Choose an image to start again.");

        fileInput.focus();

    }


    /* ---------- wiring ---------- */

    fileInput.addEventListener("change", () => {

        const files = [...fileInput.files];

        if (files.length === 0) {
            return;
        }

        if (files.length > 1) {
            setState("error");
            showError(MESSAGES.many);
            return;
        }

        handleFile(files[0]);

    });

    /* drag and drop: an enhancement around the file input, never a replacement for it */
    for (const type of ["dragenter", "dragover"]) {

        drop.addEventListener(type, (event) => {

            event.preventDefault();

            drop.classList.add("ic-drop--over");

        });

    }

    for (const type of ["dragleave", "dragend"]) {

        drop.addEventListener(type, () => drop.classList.remove("ic-drop--over"));

    }

    drop.addEventListener("drop", (event) => {

        event.preventDefault();

        drop.classList.remove("ic-drop--over");

        const files = [...(event.dataTransfer?.files ?? [])];

        if (files.length === 0) {
            return;
        }

        if (files.length > 1) {
            setState("error");
            showError(MESSAGES.many);
            return;
        }

        handleFile(files[0]);

    });

    widthInput.addEventListener("input", onWidthInput);
    heightInput.addEventListener("input", onHeightInput);

    lock.addEventListener("change", () => {

        if (lock.checked && state.info) {
            onWidthInput();
        }

    });

    $("#ic-presets").addEventListener("click", (event) => {

        const button = event.target.closest("button[data-preset]");

        if (button && !button.disabled) {
            applyPreset(button.dataset.preset);
        }

    });

    formatSelect.addEventListener("change", updateModeVisibility);

    for (const radio of settings.querySelectorAll('input[name="ic-mode"]')) {
        radio.addEventListener("change", updateModeVisibility);
    }

    for (const radio of settings.querySelectorAll('input[name="ic-quality-preset"]')) {

        radio.addEventListener("change", () => {

            qualityRange.value = radio.dataset.quality;
            qualityValue.textContent = radio.dataset.quality;

            qualityRange.setAttribute("aria-valuetext", `Quality ${radio.dataset.quality}`);

        });

    }

    qualityRange.addEventListener("input", () => {

        qualityValue.textContent = qualityRange.value;

        qualityRange.setAttribute("aria-valuetext", `Quality ${qualityRange.value}`);

        /* the slider is now the source of truth: no preset is selected unless it matches one */
        for (const radio of settings.querySelectorAll('input[name="ic-quality-preset"]')) {
            radio.checked = radio.dataset.quality === qualityRange.value;
        }

    });

    settings.addEventListener("submit", (event) => {

        event.preventDefault();

        compress();

    });

    $("#ic-reset").addEventListener("click", reset);
    cancelButton.addEventListener("click", cancel);

    /* the page is going away: nothing from the image is kept */
    window.addEventListener("pagehide", () => {

        tracker.invalidate();

        releaseAll();

        worker?.terminate();

    });

    /* once the encoders are known, a PNG or WebP file waiting for its transparency check keeps its rules */
    encoders.then((supported) => {

        state.supported = supported;

    });

    panel.dataset.ready = "true";

}
