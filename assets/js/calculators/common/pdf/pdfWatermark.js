/* =========================================================
   ToolZen Hub
   PDF Watermark
========================================================= */

import {
    PDF_WATERMARK
} from "./pdfStyles.js";


/* =========================================================
   DRAW WATERMARK ON CURRENT PAGE
========================================================= */

export function drawPDFWatermark(
    doc
) {

    if (
        !doc
    ) {

        return;

    }


    const pageWidth =
        doc.internal.pageSize.getWidth();


    const pageHeight =
        doc.internal.pageSize.getHeight();


    /*
     * Save graphics state when supported.
     */
    if (
        typeof doc.saveGraphicsState ===
        "function"
    ) {

        doc.saveGraphicsState();

    }


    /*
     * Very light watermark.
     */
    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        PDF_WATERMARK.fontSize
    );


    doc.setTextColor(
        ...PDF_WATERMARK.color
    );


    /*
     * Center of the A4 page.
     *
     * The watermark is intentionally drawn
     * across the central content area.
     */
    doc.text(

        PDF_WATERMARK.text,

        pageWidth / 2,

        pageHeight / 2,

        {

            angle:
                PDF_WATERMARK.angle,

            align:
                "center"

        }

    );


    /*
     * Restore previous graphics state.
     */
    if (
        typeof doc.restoreGraphicsState ===
        "function"
    ) {

        doc.restoreGraphicsState();

    }

}


/* =========================================================
   ADD WATERMARK TO EVERY EXISTING PAGE
========================================================= */

export function addPDFWatermark(
    doc
) {

    if (
        !doc
    ) {

        return;

    }


    const pageCount =
        doc.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        doc.setPage(
            page
        );


        drawPDFWatermark(
            doc
        );

    }

}
