/* =========================================================
   ToolZen Hub
   PDF Tools: the parts of the page the three tools share

   Reading a chosen file (browser only), the announcer and error box,
   the object-URL store, and the markup for the cards each of the PDF tools
   has in the same order: introduction, actions, result and the
   privacy text. Nothing here knows which tool it serves.
========================================================= */

import {
    HEAD_BYTES,
    TAIL_BYTES,
    MAX_FILE_BYTES,
    checkPdfBytes
} from "./pdf-rules.js";

import { openPdf, classifyError } from "./pdf-ops.js";


/* =========================================================
   Reading a file
========================================================= */

/* the verdict on the first and last bytes of a File, without reading the rest */
export async function checkFile(file) {

    try {

        const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
        const tail = new Uint8Array(await file.slice(Math.max(0, file.size - TAIL_BYTES)).arrayBuffer());

        return checkPdfBytes(head, tail, file.size);

    } catch {
        return { ok: false, message: "This file could not be read." };
    }

}

export async function readBytes(file) {

    if (file.size > MAX_FILE_BYTES) {
        throw new Error("This file is too large.");
    }

    return new Uint8Array(await file.arrayBuffer());

}

/* checks a chosen File and opens it once; the caller keeps what it needs and drops the rest */
export async function inspectFile(file, pdfLib) {

    const verdict = await checkFile(file);

    if (!verdict.ok) {
        return { ok: false, message: verdict.message };
    }

    try {

        const { doc, pageCount } = await openPdf(await readBytes(file), pdfLib);

        return { ok: true, pageCount, doc };

    } catch (error) {
        return { ok: false, message: classifyError(error, pdfLib).message };
    }

}


/* =========================================================
   Messages and object URLs
========================================================= */

export function createMessenger({ live, errorBox }) {

    let timer = 0;

    return {

        announce(message) {

            clearTimeout(timer);

            live.textContent = "";

            timer = setTimeout(() => {
                live.textContent = message;
            }, 120);

        },

        showErrors(lines) {

            errorBox.replaceChildren(...lines.map((line) => {
                const p = document.createElement("p");
                p.textContent = line;
                return p;
            }));

            errorBox.hidden = lines.length === 0;

        }

    };

}

/* every address made for a download is kept here so none is ever left behind */
export function createUrlStore() {

    let urls = [];

    return {

        make(bytes) {

            const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));

            urls.push(url);

            return url;

        },

        revokeAll() {

            const had = urls.length > 0;

            for (const url of urls) {
                URL.revokeObjectURL(url);
            }

            urls = [];

            return had;

        }

    };

}


/* =========================================================
   Markup shared by the three tools
========================================================= */

export function introHtml(title, lead) {

    return `
            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        PDF Tool
                    </span>

                    <h1>
                        ${title}
                    </h1>

                    <p>
                        ${lead}
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
    `;

}

/* the card with Create, Cancel and Reset, the hint and the progress line */
export function actionsHtml(p, { step, createLabel, hint }) {

    return `
                    <div class="pt-card">

                        <h2 class="pt-card__title">
                            ${step}. Create and download
                        </h2>

                        <div class="pt-actions">

                            <button
                                type="button"
                                id="${p}-create"
                                class="calculator-form__button pt-button"
                                aria-describedby="${p}-create-hint"
                                disabled
                            >
                                ${createLabel}
                            </button>

                            <button
                                type="button"
                                id="${p}-cancel"
                                class="calculator-form__button calculator-form__button--secondary pt-button"
                                hidden
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                id="${p}-reset"
                                class="calculator-form__button calculator-form__button--secondary pt-button"
                            >
                                Reset
                            </button>

                        </div>

                        <p
                            id="${p}-create-hint"
                            class="pt-note"
                        >${hint}</p>

                        <p
                            id="${p}-progress"
                            class="pt-status"
                            hidden
                        ></p>

                    </div>
    `;

}

export function chooseFileHtml(p, { step, label, multiple, hint }) {

    return `
                        <div class="pt-card">

                            <h2 class="pt-card__title">
                                ${step}. ${multiple ? "Choose PDFs" : "Choose a PDF"}
                            </h2>

                            <div class="pt-drop">

                                <label
                                    for="${p}-file"
                                    class="pt-drop__label"
                                >
                                    ${label}
                                </label>

                                <input
                                    type="file"
                                    id="${p}-file"
                                    class="pt-file"
                                    accept="application/pdf,.pdf"${multiple ? "\n                                    multiple" : ""}
                                    aria-describedby="${p}-file-hint"
                                >

                                <p
                                    id="${p}-file-hint"
                                    class="pt-hint"
                                >
                                    ${hint}
                                </p>

                            </div>

                            <div
                                id="${p}-error"
                                class="pt-error"
                                role="alert"
                                hidden
                            ></div>

                        </div>
    `;

}

export function infoHtml(title, paragraphs) {

    return `
            <section class="calculator-info">

                <h2>
                    ${title}
                </h2>
${paragraphs.map((text) => `
                <p>
                    ${text}
                </p>
`).join("")}
            </section>
    `;

}

export function faqHtml(items) {

    return `
            <section class="calculator-info">

                <h2>
                    Frequently Asked Questions
                </h2>
${items.map(([question, answer]) => `
                <details>
                    <summary>
                        ${question}
                    </summary>
                    <p>
                        ${answer}
                    </p>
                </details>
`).join("")}
            </section>
    `;

}

export function howToHtml(title, steps) {

    return `
            <section class="calculator-info">

                <h2>
                    How to Use ${title}
                </h2>

                <ol>${steps.map((step) => `
                    <li>
                        ${step}
                    </li>`).join("")}
                </ol>

            </section>
    `;

}

export const PRIVACY_TEXT =
    "Your PDFs are processed in your browser and are not uploaded by this tool. Nothing is saved, the file names are not sent anywhere, and the page address never contains them. The PDF library is a file served from this site, not from another one. Reloading the page clears everything. This version does not promise that it works offline.";
