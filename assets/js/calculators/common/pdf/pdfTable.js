/* =========================================================
   ToolZen Hub
   PDF Content + Tables
========================================================= */

import {
    PDF_PAGE,
    PDF_COLORS,
    PDF_FONTS,
    PDF_WATERMARK,
    PDF_FOOTER
} from "./pdfStyles.js";


/* =========================================================
   CURRENT Y POSITION
========================================================= */

function getY(
    doc
) {

    /*
     * AutoTable has already created a table.
     *
     * Continue below it.
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
     * If a summary was drawn before the table,
     * use the position recorded by addPDFSummary().
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
     * Default starting position.
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

    doc.setTextColor(
        ...PDF_COLORS.dark
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        PDF_FONTS.title
    );


    doc.text(
        String(title),
        PDF_PAGE.margin,
        22
    );


    if (
        subtitle
    ) {

        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(
            PDF_FONTS.subtitle
        );


        doc.setTextColor(
            ...PDF_COLORS.gray
        );


        /*
         * Use splitTextToSize so a long subtitle
         * does not run outside the page.
         */
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


        /*
         * Save the position so the summary/table
         * can be placed safely below it.
         */
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
     * IMPORTANT:
     *
     * We intentionally do NOT print the word
     * "Summary".
     *
     * The report already has a title and the
     * summary information is self-explanatory.
     */


    let y =
        44;


    /*
     * If subtitle has multiple lines, move the
     * summary slightly lower.
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


            /*
             * Label
             */
            doc.setFont(
                "helvetica",
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


            /*
             * Value
             */
            doc.setFont(
                "helvetica",
                "bold"
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
     * Store the ending position.
     *
     * addPDFTable() uses this so the table
     * never overlaps the summary.
     */
    doc.__toolzenSummaryEndY =
        y;

}


/* =========================================================
   DIAGONAL WATERMARK
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


        const pageWidth =
            doc.internal.pageSize.getWidth();


        const pageHeight =
            doc.internal.pageSize.getHeight();


        /*
         * Save the current graphics state
         * when supported by the jsPDF version.
         */
        if (
            typeof doc.saveGraphicsState ===
            "function"
        ) {

            doc.saveGraphicsState();

        }


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
         * Center of page.
         */
        const x =
            pageWidth / 2;


        const y =
            pageHeight / 2;


        /*
         * jsPDF supports text rotation
         * through the angle option.
         */
        doc.text(
            PDF_WATERMARK.text,
            x,
            y,
            {
                angle:
                    PDF_WATERMARK.angle,

                align:
                    "center"
            }
        );


        if (
            typeof doc.restoreGraphicsState ===
            "function"
        ) {

            doc.restoreGraphicsState();

        }

    }

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


    doc.autoTable({

        startY:
            getY(doc),

        head: [
            headers
        ],

        body,

        margin: {

            top:
                15,

            bottom:
                20,

            left:
                PDF_PAGE.margin,

            right:
                PDF_PAGE.margin

        },

        /*
         * This callback executes whenever AutoTable
         * starts drawing a page.
         *
         * Therefore the watermark is added to:
         *
         * Page 1
         * Page 2
         * Page 3
         * ...
         */
        willDrawPage:
            data => {

                addPageWatermark(
                    doc
                );

            },

        styles: {

            font:
                "helvetica",

            fontSize:
                PDF_FONTS.small,

            cellPadding:
                3,

            textColor:
                PDF_COLORS.dark,

            lineColor:
                PDF_COLORS.border,

            lineWidth:
                0.2

        },

        headStyles: {

            fillColor:
                PDF_COLORS.primary,

            textColor:
                PDF_COLORS.white,

            fontStyle:
                "bold"

        },

        alternateRowStyles: {

            fillColor:
                PDF_COLORS.light

        },

        theme:
            "grid"

    });

}


/* =========================================================
   PAGE WATERMARK
========================================================= */

function addPageWatermark(
    doc
) {

    const pageWidth =
        doc.internal.pageSize.getWidth();


    const pageHeight =
        doc.internal.pageSize.getHeight();


    if (
        typeof doc.saveGraphicsState ===
        "function"
    ) {

        doc.saveGraphicsState();

    }


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


    if (
        typeof doc.restoreGraphicsState ===
        "function"
    ) {

        doc.restoreGraphicsState();

    }

}


/* =========================================================
   FOOTER
========================================================= */

export function addPDFFooter(
    doc,
    text
) {

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


        const pageWidth =
            doc.internal.pageSize.getWidth();


        const pageHeight =
            doc.internal.pageSize.getHeight();


        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.setFontSize(
            PDF_FONTS.small
        );


        doc.setTextColor(
            ...PDF_COLORS.gray
        );


        /*
         * Footer text
         */
        doc.text(
            String(text),
            PDF_PAGE.margin,
            pageHeight -
            PDF_FOOTER.offset
        );


        /*
         * Page number
         */
        doc.text(
            `Page ${page} of ${pageCount}`,
            pageWidth -
            PDF_PAGE.margin,
            pageHeight -
            PDF_FOOTER.offset,
            {
                align:
                    "right"
            }
        );

    }

}


/* =========================================================
   ADD WATERMARK TO PDF WITHOUT TABLE
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
     * If a table exists, its willDrawPage()
     * callback already created the watermark.
     *
     * This function is mainly useful for PDFs
     * that do not contain a table.
     */
    if (
        !doc.lastAutoTable
    ) {

        addPDFWatermark(
            doc
        );

    }

}
