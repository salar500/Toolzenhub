/* =========================================================
   ToolZen Hub
   Photo Metadata Viewer and Remover (Tool Pack 57)

   See what a JPEG or PNG carries besides the picture (location,
   camera, dates, text) and download a copy without it. The
   engine (metadata-engine.js) copies the picture data byte for
   byte; this file is only the page. Everything stays in the
   browser: no upload, nothing stored, and coordinates are not
   sent to any map service.
========================================================= */

import { inspect, clean, LIMITS } from "./metadata-engine.js";
import { getToolById } from "../../data/tools.js";

/* the related tools are this section's own (catalog); no article exists yet */
export const showRelatedArticles = false;

const TITLE = getToolById("image-metadata").title;

const ORIENTATION_WORDS = {
    1: "upright", 2: "mirrored", 3: "upside down", 4: "upside down and mirrored",
    5: "turned and mirrored", 6: "turned a quarter (stored sideways)", 7: "turned and mirrored", 8: "turned a quarter the other way (stored sideways)"
};

const formatBytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Image Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        See what a photo carries besides the picture: where it
                        was taken, on which camera or phone, and when. Then
                        download a copy without it. The picture itself is not
                        recompressed.
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
                            Read in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Check your photos
                </div>

                <p class="calculator-section__description">
                    Choose JPEG or PNG files (up to ${LIMITS.files}, each up to
                    ${LIMITS.bytes / 1048576} MB). Each is read here; nothing is
                    sent anywhere.
                </p>

                <div id="im-panel" class="calculator-form im-panel">

                    <div class="calculator-form__group">
                        <label for="im-file" class="calculator-form__label">Photos (JPEG or PNG)</label>
                        <input id="im-file" class="im-file" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple aria-describedby="im-file-hint">
                        <p id="im-file-hint" class="calculator-form__help">WebP, HEIC, GIF and AVIF are not supported yet.</p>
                    </div>

                    <div class="im-option">
                        <input id="im-keep-turn" type="checkbox" checked>
                        <label for="im-keep-turn">Keep the photo upright</label>
                        <p class="calculator-form__help">A photo taken with the phone turned is stored sideways and shown upright by one setting. With this ticked, that one setting is kept and nothing else.</p>
                    </div>

                    <p id="im-error" class="im-error" role="alert" hidden></p>

                    <div class="calculator-form__actions">
                        <button id="im-clean-all" type="button" class="calculator-form__button" hidden>Remove metadata from all</button>
                        <button id="im-reset" type="button" class="calculator-form__button calculator-form__button--secondary">Reset</button>
                    </div>

                    <p id="im-live" class="im-sr-only" role="status" aria-live="polite"></p>

                </div>

                <ul id="im-list" class="im-list" aria-label="Your photos"></ul>

            </section>

            <section class="calculator-info">

                <h2>How to use it</h2>

                <ol>
                    <li>Choose one or more JPEG or PNG photos.</li>
                    <li>Read what each one carries: a location, the camera or phone, dates, software, and other blocks of information.</li>
                    <li>Press Remove metadata and download the copy. Its name ends in -no-metadata.</li>
                </ol>

                <h2>What is removed and what is kept</h2>

                <p>
                    From a JPEG: the Exif block (camera, dates, location), XMP,
                    IPTC captions and credits, comments, thumbnails, maker
                    blocks, the multi-picture index and anything stored after
                    the picture. From a PNG: text chunks, the eXIf chunk and the
                    last-modified time. Kept: the picture data, copied byte for
                    byte, and the colour profile, so the colours do not change.
                    Each copy is read again before it is offered; if anything
                    identifying were still found, it would not be offered.
                </p>

                <h2>What this cannot remove</h2>

                <p>
                    Only what is stored beside the picture. A photo can still
                    show a face, a street sign, a house number or a screen in
                    the picture itself. Look at the photo before you share it.
                </p>

            </section>

            <section class="calculator-faq">

                <h2>Questions</h2>

                <details>
                    <summary>Does the picture lose quality?</summary>
                    <p>No. The picture data is copied as it is, not decoded and saved again, so the copy looks exactly the same. It is usually a little smaller, because the removed blocks are gone.</p>
                </details>

                <details>
                    <summary>Why does my phone photo keep one Exif setting?</summary>
                    <p>Phones often store a photo sideways and add a setting that tells viewers to turn it. Without it the photo would show sideways. The tool keeps only that one number (unless you untick the option); it says nothing about you, the camera or the place.</p>
                </details>

                <details>
                    <summary>Is my photo uploaded?</summary>
                    <p>No. The file is read in your browser and the copy is made there. The location shown here is not sent to any map service.</p>
                </details>

                <details>
                    <summary>What about WebP or HEIC photos?</summary>
                    <p>They are not supported yet. Saving a photo as JPEG, for example with the Image Compressor and Resizer, also drops its metadata, but that saves the picture again.</p>
                </details>

            </section>

        </div>
    `;

}


/* =========================================================
   RENDER
========================================================= */

export function render(mount = document.querySelector("#app")) {

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

    const panel = document.querySelector("#im-panel");

    if (!panel || panel.dataset.ready === "true") {
        return;
    }

    panel.dataset.ready = "true";

    const $ = (selector) => document.querySelector(selector);
    const fileInput = $("#im-file");
    const keepTurn = $("#im-keep-turn");
    const errorBox = $("#im-error");
    const list = $("#im-list");
    const cleanAll = $("#im-clean-all");
    const resetButton = $("#im-reset");
    const live = $("#im-live");

    let items = [];

    const say = (message) => { live.textContent = message; };

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.hidden = !message;
    }

    function release() {
        for (const item of items) {
            if (item.url) URL.revokeObjectURL(item.url);
        }
    }

    function facts(info) {
        const out = [];
        const x = info.exif;
        if (x?.gps) {
            out.push(["Location", x.gps.latitude === null ? "A GPS block is present, without a usable position" :
                `${x.gps.latitude.toFixed(6)}, ${x.gps.longitude.toFixed(6)}${x.gps.altitude !== null ? ` (altitude ${Math.round(x.gps.altitude)} m)` : ""}`]);
        }
        if (x?.make || x?.model) out.push(["Camera or phone", [x.make, x.model].filter(Boolean).join(" ")]);
        if (x?.lens) out.push(["Lens", x.lens]);
        if (x?.serial) out.push(["Serial number", x.serial]);
        if (x?.owner) out.push(["Owner name", x.owner]);
        if (x?.artist) out.push(["Artist", x.artist]);
        if (x?.copyright) out.push(["Copyright", x.copyright]);
        if (x?.dateTaken) out.push(["Date taken", x.dateTaken]);
        if (x?.dateTime) out.push(["Date and time", x.dateTime]);
        if (x?.software) out.push(["Software", x.software]);
        if (info.orientation) out.push(["Orientation", ORIENTATION_WORDS[info.orientation] ?? String(info.orientation)]);
        for (const t of info.text ?? []) out.push([`Text: ${t.keyword || "(no keyword)"}`, t.value ?? "(compressed, not shown)"]);
        return out;
    }

    function card(item) {

        const li = el("li", "im-card");
        li.dataset.id = String(item.id);
        li.append(el("h3", "im-card__name", item.file.name));
        li.append(el("p", "im-card__meta", `${item.info?.type?.toUpperCase() ?? "Unknown type"} · ${formatBytes(item.file.size)}`));

        if (item.problem) {
            li.append(el("p", "im-card__problem", item.problem));
            return li;
        }

        const found = facts(item.info);
        const removable = item.info.blocks.filter((b) => !b.kept);

        if (found.length === 0 && removable.length === 0) {
            li.append(el("p", "im-card__clean", "Nothing found: no location, camera, date or text information is stored in this file."));
            return li;
        }

        if (found.length) {
            const dl = el("dl", "im-facts");
            for (const [term, value] of found) {
                const row = el("div");
                row.append(el("dt", "", term), el("dd", "", value));
                dl.append(row);
            }
            li.append(dl);
        }

        const blocks = el("p", "im-card__blocks");
        blocks.textContent = `Blocks found: ${item.info.blocks.map((b) => (b.kept ? `${b.label} (kept)` : b.label)).join(", ") || "none"}.`;
        li.append(blocks);

        const actions = el("p", "im-card__actions");
        if (item.result) {
            const a = el("a", "calculator-form__button im-download", "Download the copy");
            a.href = item.url;
            a.download = item.outName;
            a.setAttribute("aria-label", `Download the copy of ${item.file.name} without metadata`);
            actions.append(a);
            li.append(el("p", "im-card__done", `Removed: ${item.result.removed.join(", ")}.${item.result.orientationKept ? " Kept the upright setting only." : ""} ${formatBytes(item.file.size)} → ${formatBytes(item.result.bytes.length)}.`));
        } else {
            const button = el("button", "calculator-form__button", "Remove metadata");
            button.type = "button";
            button.setAttribute("aria-label", `Remove metadata from ${item.file.name}`);
            button.addEventListener("click", () => cleanItem(item, true));
            actions.append(button);
        }
        li.append(actions);
        return li;

    }

    function draw() {
        list.replaceChildren(...items.map(card));
        cleanAll.hidden = !items.some((item) => !item.problem && !item.result && item.info.blocks.some((b) => !b.kept));
    }

    function cleanItem(item, announceIt) {
        const result = clean(item.bytes, { keepOrientation: keepTurn.checked });
        if (!result.ok) {
            item.problem = result.reason === "not-clean"
                ? "This file could not be cleaned safely, so no copy is offered."
                : "This file could not be read safely, so no copy is offered.";
        } else {
            item.result = result;
            const dot = item.file.name.lastIndexOf(".");
            const base = dot > 0 ? item.file.name.slice(0, dot) : item.file.name;
            item.outName = `${base}-no-metadata.${result.type === "png" ? "png" : "jpg"}`;
            item.url = URL.createObjectURL(new Blob([result.bytes], { type: result.type === "png" ? "image/png" : "image/jpeg" }));
        }
        if (announceIt) {
            draw();
            say(item.result ? `${item.file.name}: metadata removed. The copy is ready to download.` : `${item.file.name}: ${item.problem}`);
            list.querySelector(`[data-id="${item.id}"] .im-download`)?.focus();
        }
    }

    let nextId = 1;

    async function choose(files) {
        showError("");
        release();
        items = [];
        const chosen = [...files];
        if (chosen.length > LIMITS.files) {
            showError(`Choose at most ${LIMITS.files} photos at once. The first ${LIMITS.files} are shown.`);
        }
        for (const file of chosen.slice(0, LIMITS.files)) {
            const item = { id: nextId++, file, info: null, bytes: null, problem: "", result: null, url: "", outName: "" };
            if (file.size > LIMITS.bytes) {
                item.problem = `This file is larger than ${LIMITS.bytes / 1048576} MB, the most this tool reads.`;
            } else {
                item.bytes = new Uint8Array(await file.arrayBuffer());
                item.info = inspect(item.bytes);
                if (item.info.unsupported) item.problem = "This is not a JPEG or PNG file. WebP, HEIC, GIF and AVIF are not supported yet.";
                else if (item.info.unreadable) item.problem = "This file could not be read safely. It may be damaged or cut short.";
            }
            items.push(item);
        }
        draw();
        const found = items.filter((i) => !i.problem && i.info.blocks.some((b) => !b.kept)).length;
        say(`${items.length} ${items.length === 1 ? "file" : "files"} read; ${found} with metadata that can be removed.`);
    }

    fileInput.addEventListener("change", () => {
        if (fileInput.files?.length) choose(fileInput.files);
    });

    cleanAll.addEventListener("click", () => {
        let done = 0;
        for (const item of items) {
            if (!item.problem && !item.result && item.info.blocks.some((b) => !b.kept)) {
                cleanItem(item, false);
                if (item.result) done += 1;
            }
        }
        draw();
        say(`Metadata removed from ${done} ${done === 1 ? "file" : "files"}. Download each copy from its card.`);
    });

    /* a change of the option applies to copies made after it; a made copy is made again so it matches */
    keepTurn.addEventListener("change", () => {
        for (const item of items) {
            if (item.result) {
                URL.revokeObjectURL(item.url);
                item.result = null;
                item.url = "";
                cleanItem(item, false);
            }
        }
        draw();
    });

    resetButton.addEventListener("click", () => {
        release();
        items = [];
        fileInput.value = "";
        showError("");
        draw();
        say("Cleared.");
        fileInput.focus();
    });

    window.addEventListener("pagehide", release);

}
