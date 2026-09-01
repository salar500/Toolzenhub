/* =========================================================
   ToolZen Hub
   Professional PDF Page Header
========================================================= */

import {
    PDF_PAGE,
    PDF_COLORS,
    PDF_FONTS,
    PDF_HEADER
} from "./pdfStyles.js";


/* =========================================================
   ADD REPEATING PAGE HEADER
========================================================= */

export function addPDFPageHeader(
    doc,
    pageNumber
) {

    /*
     * Page 1 already has the main report title.
     *
     * Therefore the compact repeating header starts
     * from page 2.
     */
    if (
        pageNumber <= 1
    ) {

        return;

    }


    if (
        !PDF_HEADER.enabled
    ) {

        return;

    }


    const pageWidth =
        doc.internal.pageSize.getWidth();


    /* =====================================================
       BRAND
    ===================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        PDF_FONTS.pageHeader
    );


    doc.setTextColor(
        ...PDF_COLORS.gray
    );


    doc.text(
        "TOOLZEN HUB",
        PDF_PAGE.margin,
        PDF_HEADER.top
    );


    /* =====================================================
       REPORT TITLE
    ===================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        PDF_FONTS.pageHeaderTitle
    );


    doc.setTextColor(
        ...PDF_COLORS.dark
    );


    doc.text(

        String(
            doc.__toolzenTitle ||
            "ToolZen Hub Report"
        ),

        PDF_PAGE.margin,

        PDF_HEADER.titleY

    );


    /* =====================================================
       SUBTITLE
    ===================================================== */

    if (
        doc.__toolzenSubtitle
    ) {

        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(
            PDF_FONTS.pageHeader
        );


        doc.setTextColor(
            ...PDF_COLORS.gray
        );


        const availableWidth =
            pageWidth -
            PDF_PAGE.margin * 2 -
            25;


        const subtitleLines =
            doc.splitTextToSize(

                String(
                    doc.__toolzenSubtitle
                ),

                availableWidth

            );


        /*
         * Only one compact subtitle line
         * is displayed in the repeating header.
         */
        doc.text(

            subtitleLines[0],

            PDF_PAGE.margin,

            PDF_HEADER.subtitleY

        );

    }


    /* =====================================================
       PAGE NUMBER
    ===================================================== */

    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(
        PDF_FONTS.pageHeader
    );


    doc.setTextColor(
        ...PDF_COLORS.gray
    );


    doc.text(

        `Page ${pageNumber}`,

        pageWidth -
        PDF_PAGE.margin,

        PDF_HEADER.top,

        {

            align:
                "right"

        }

    );


    /* =====================================================
       HEADER SEPARATOR
    ===================================================== */

    doc.setDrawColor(
        ...(
            PDF_COLORS.headerLine ||
            PDF_COLORS.border
        )
    );


    doc.setLineWidth(
        0.25
    );


    doc.line(

        PDF_PAGE.margin,

        PDF_HEADER.lineY,

        pageWidth -
        PDF_PAGE.margin,

        PDF_HEADER.lineY

    );

}
