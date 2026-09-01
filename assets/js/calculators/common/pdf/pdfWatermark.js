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


    /* =====================================================
       WATERMARK FONT
    ===================================================== */

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


    /* =====================================================
       CENTER POSITION
    ===================================================== */

    const centerX =
        pageWidth / 2;


    const centerY =
        pageHeight / 2;


    /*
     * The watermark is deliberately positioned in the
     * central area of the complete A4 page.
     *
     * It is large and diagonal, but very light.
     */
    doc.text(

        PDF_WATERMARK.text,

        centerX,

        centerY,

        {

            angle:
                PDF_WATERMARK.angle,

            align:
                "center"

        }

    );


    /*
     * Restore graphics state.
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
