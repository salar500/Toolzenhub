/* =========================================================
   ToolZen Hub
   PDF Content + Tables
========================================================= */

import {
    PDF_PAGE,
    PDF_COLORS,
    PDF_FONTS,
    PDF_HEADER
} from "./pdfStyles.js";


import {
    drawPDFWatermark,
    addPDFWatermark
} from "./pdfWatermark.js";


import {
    addPDFPageHeader
} from "./pdfHeader.js";


import {
    addPDFFooter as addPDFDocumentFooter
} from "./pdfFooter.js";


/* =========================================================
   CURRENT Y POSITION
========================================================= */

function getY(
    doc
) {

    /*
     * AutoTable has already created a table.
     */
    if (
        doc.lastAutoTable &&
        doc.lastAutoTable.finalY
    ) {

        return (
            doc.lastAutoTable.finalY +
            10
        );

    }


    /*
     * Continue after summary.
     */
    if (
        doc.__toolzenSummaryEndY
    ) {

        return (
            doc.__toolzenSummaryEndY +
            5
        );

    }


    /*
     * Default.
     */
    return 40;

}


/* =========================================================
   TITLE
========================================================= */

export function addPDFTitle(
    doc,
    title,
    subtitle = ""
) {

    /*
     * Store the information for repeating
     * page headers.
     */
    doc.__toolzenTitle =
        String(
            title || ""
        );


    doc.__toolzenSubtitle =
        String(
            subtitle || ""
        );


    /* =====================================================
       TITLE
    ===================================================== */

    doc.setTextColor(
        ...PDF_COLORS.dark
    );


    doc.setFont(
        "NotoSans",
        "normal"
    );


    doc.setFontSize(
        PDF_FONTS.title
    );


    doc.text(

        String(title),

        PDF_PAGE.margin,

        22

    );


    /* =====================================================
       SUBTITLE
    ===================================================== */

    if (
        subtitle
    ) {

        doc.setFont(
            "NotoSans",
            "normal"
        );


        doc.setFontSize(
            PDF_FONTS.subtitle
        );


        doc.setTextColor(
            ...PDF_COLORS.gray
        );


        const availableWidth =
            PDF_PAGE.width -
            PDF_PAGE.margin * 2;


        const subtitleLines =
            doc.splitTextToSize(

                String(subtitle),

                availableWidth

            );


        doc.text(

            subtitleLines,

            PDF_PAGE.margin,

            30

        );


        doc.__toolzenSubtitleLines =
            subtitleLines.length;

    }

}


/* =========================================================
   SUMMARY
========================================================= */

export function addPDFSummary(
    doc,
    summary
) {

    if (
        !Array.isArray(summary) ||
        summary.length === 0
    ) {

        return;

    }


    /*
     * Intentionally no "Summary" heading.
     */
    let y =
        44;


    /*
     * Give multiline subtitles additional space.
     */
    if (
        doc.__toolzenSubtitleLines &&
        doc.__toolzenSubtitleLines > 1
    ) {

        y +=
            (
                doc.__toolzenSubtitleLines -
                1
            ) * 5;

    }


    summary.forEach(
        item => {

            const label =
                item.label || "";


            const value =
                item.value ?? "";


            /* =================================================
               LABEL
            ================================================= */

            doc.setFont(
                "NotoSans",
                "normal"
            );


            doc.setFontSize(
                PDF_FONTS.body
            );


            doc.setTextColor(
                ...PDF_COLORS.gray
            );


            doc.text(

                String(label),

                PDF_PAGE.margin,

                y

            );


            /* =================================================
               VALUE
            ================================================= */

            doc.setFont(
                "NotoSans",
                "normal"
            );


            doc.setTextColor(
                ...PDF_COLORS.dark
            );


            doc.text(

                String(value),

                80,

                y

            );


            y +=
                6;

        }
    );


    /*
     * Save summary ending position.
     */
    doc.__toolzenSummaryEndY =
        y;

}


/* =========================================================
   TABLE
========================================================= */

export function addPDFTable(
    doc,
    columns,
    rows
) {

    if (
        !doc.autoTable
    ) {

        throw new Error(
            "jsPDF AutoTable plugin is not loaded."
        );

    }


    const headers =
        columns.map(
            column =>
                column.label ||
                column
        );


    const body =
        rows.map(
            row => {

                return columns.map(
                    column => {

                        const key =
                            column.key ||
                            column;


                        return (
                            row[key] ??
                            ""
                        );

                    }
                );

            }
        );


    /* =====================================================
       TABLE
    ===================================================== */

    doc.autoTable({

        /* =================================================
           START POSITION
        ================================================= */

        startY:
            getY(doc),


        /* =================================================
           HEAD
        ================================================= */

        head: [
            headers
        ],


        /* =================================================
           BODY
        ================================================= */

        body,


        /* =================================================
           MARGINS
        ================================================= */

        margin: {

            /*
             * Reserve space for the professional
             * repeating header.
             */
            top:
                PDF_HEADER.tableTop,

            bottom:
                20,

            left:
                PDF_PAGE.margin,

            right:
                PDF_PAGE.margin

        },


        /* =================================================
           PAGE CALLBACK
        ================================================= */

        willDrawPage:
            data => {

                const pageNumber =
                    data.pageNumber ||
                    1;


                /*
                 * Draw watermark FIRST.
                 */
                drawPDFWatermark(
                    doc
                );


                /*
                 * Professional header on page 2+.
                 */
                addPDFPageHeader(
                    doc,
                    pageNumber
                );

            },


        /* =================================================
           CELL STYLES
        ================================================= */

        styles: {

            font:
                "NotoSans",

            fontStyle:
                "normal",

            fontSize:
                PDF_FONTS.small,

            cellPadding:
                3,

            textColor:
                PDF_COLORS.dark,

            lineColor:
                PDF_COLORS.border,

            lineWidth:
                0.2,

            fillColor:
                PDF_COLORS.white

        },


        /* =================================================
           HEADER STYLES
        ================================================= */

        headStyles: {

            fillColor:
                PDF_COLORS.primary,

            textColor:
                PDF_COLORS.white,

            font:
                "NotoSans",

            fontStyle:
                "normal"

        },


        /* =================================================
           ALTERNATING ROWS
        ================================================= */

        alternateRowStyles: {

            fillColor:
                PDF_COLORS.light

        },


        theme:
            "grid"

    });

}


/* =========================================================
   FOOTER
========================================================= */

export function addPDFFooter(
    doc,
    text
) {

    addPDFDocumentFooter(
        doc,
        text
    );

}


/* =========================================================
   WATERMARK
========================================================= */

export function ensurePDFWatermark(
    doc
) {

    if (
        !doc
    ) {

        return;

    }


    /*
     * If AutoTable has created pages, the watermark
     * has already been drawn through willDrawPage().
     */
    if (
        doc.lastAutoTable
    ) {

        return;

    }


    /*
     * PDFs without tables still receive a watermark
     * on every existing page.
     */
    addPDFWatermark(
        doc
    );

}
