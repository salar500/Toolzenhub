/* =========================================================
   ToolZen Hub
   Photos to PDF: building the file

   One page per picture, in list order, through pdf-lib. The library is
   vendored (assets/js/vendor/pdf-lib, see its NOTICE.txt), never loaded
   from another site, and imported only when a PDF is created.

   buildPdf works on what it is given, so the same function runs in the
   page and in the Node tests (which pass the library in). It asks for
   one picture at a time, so only the pictures already placed in the PDF
   are held in memory, and it stops between pictures when asked.
========================================================= */

import { computeLayout, cleanSettings } from "./pdf-rules.js";

/* the vendored library, fetched on first use */
export function loadPdfLib() {

    return import("../../vendor/pdf-lib/pdf-lib.esm.min.js");

}

/* let the browser paint between pictures */
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

/*
 * count          how many pictures
 * getImage(i)    async: { bytes: Uint8Array (a JPEG), reencoded?, reduced? } for picture i
 * settings       { pageSize, orientation, margin }
 * pdfLib         the pdf-lib module
 * onProgress     (done, count) after each picture
 * isCancelled    () => true to stop
 *
 * Returns { cancelled: true } or { bytes: Uint8Array, pages, redrawn, reduced }.
 * No creator, producer or date is written: the file says nothing about the device or the tool.
 */
export async function buildPdf({ count, getImage, settings, pdfLib, onProgress = () => {}, isCancelled = () => false, yieldBetween = true }) {

    const clean = cleanSettings(settings);
    const doc = await pdfLib.PDFDocument.create({ updateMetadata: false });

    let redrawn = 0;
    let reduced = 0;

    for (let i = 0; i < count; i += 1) {

        if (isCancelled()) {
            return { cancelled: true };
        }

        const picture = await getImage(i);

        if (isCancelled()) {
            return { cancelled: true };
        }

        const embedded = await doc.embedJpg(picture.bytes);
        const layout = computeLayout(embedded.width, embedded.height, clean);
        const page = doc.addPage([layout.pageWidth, layout.pageHeight]);

        page.drawImage(embedded, { x: layout.x, y: layout.y, width: layout.width, height: layout.height });

        if (picture.redrawn) redrawn += 1;
        if (picture.reduced) reduced += 1;

        onProgress(i + 1, count);

        if (yieldBetween) {
            await yieldToBrowser();
        }

    }

    if (isCancelled()) {
        return { cancelled: true };
    }

    const bytes = await doc.save({ useObjectStreams: false });

    return { bytes, pages: count, redrawn, reduced };

}
