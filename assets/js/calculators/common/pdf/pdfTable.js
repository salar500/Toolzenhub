/* =========================================================
   ToolZen Hub
   PDF Content + Tables
========================================================= */

import {
    PDF_PAGE,
    PDF_COLORS,
    PDF_FONTS,
    PDF_WATERMARK,
    PDF_FOOTER,
    PDF_HEADER
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

    /*
     * Store title information on the document.
     *
     * This allows later PDF pages to use the
     * same professional header without changing
     * pdfGenerator.js.
     */
    doc.__toolzenTitle =
        String(
            title || ""
        );


    doc.__toolzenSubtitle =
        String(
            subtitle || ""
        );


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


        drawWatermarkOnCurrentPage(
            doc
        );

    }

}


/* =========================================================
   DRAW WATERMARK ON CURRENT PAGE
========================================================= */

function drawWatermarkOnCurrentPage(
    doc
) {

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
     * Keep the watermark centered.
     *
     * It is drawn BEFORE table cells, so table
     * cells can cover it rather than the watermark
     * appearing through the table.
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


    if (
        typeof doc.restoreGraphicsState ===
        "function"
    ) {

        doc.restoreGraphicsState();

    }

}


/* =========================================================
   PROFESSIONAL PAGE HEADER
========================================================= */

function addPageHeader(
    doc,
    pageNumber
) {

    /*
     * Never add the repeating header to page 1.
     *
     * Page 1 already has the large report title.
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


    /*
     * Header brand
     */
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


    /*
     * Report title
     */
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


    /*
     * Report subtitle
     */
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
         * Keep only the first line in the
         * compact repeating header.
         */
        doc.text(
            subtitleLines[0],
            PDF_PAGE.margin,
            PDF_HEADER.subtitleY
        );

    }


    /*
     * Page number in header.
     */
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


    /*
     * Header separator.
     */
    doc.setDrawColor(
        ...PDF_HEADER_LINE_COLOR()
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


/* =========================================================
   HEADER LINE COLOR
========================================================= */

function PDF_HEADER_LINE_COLOR() {

    return (
        PDF_COLORS.headerLine ||
        PDF_COLORS.border
    );

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

            /*
             * Reserve room for the professional
             * repeating header on pages 2+.
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


        /*
         * AutoTable calls willDrawPage before
         * drawing the table on each page.
         *
         * This means:
         *
         * 1. Watermark is drawn first.
         * 2. Header is drawn first.
         * 3. Table is drawn afterward.
         *
         * Therefore the watermark cannot appear
         * through table cells.
         */
        willDrawPage:
            data => {

                const pageNumber =
                    data.pageNumber ||
                    1;


                /*
                 * Draw watermark BEFORE table.
                 */
                drawWatermarkOnCurrentPage(
                    doc
                );


                /*
                 * Draw professional header
                 * on pages 2, 3, 4, etc.
                 */
                addPageHeader(
                    doc,
                    pageNumber
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
                0.2,

            /*
             * IMPORTANT:
             *
             * Every table cell receives a solid
             * white background.
             *
             * This prevents the diagonal watermark
             * from showing inside empty cells or
             * between table text.
             */
            fillColor:
                PDF_COLORS.white

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
         * Footer text.
         */
        doc.text(
            String(text),
            PDF_PAGE.margin,
            pageHeight -
            PDF_FOOTER.offset
        );


        /*
         * Page number.
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
     * If the PDF has a table, the watermark is
     * already created by AutoTable's willDrawPage().
     *
     * This avoids drawing another watermark on top
     * of the table.
     */
    if (
        doc.lastAutoTable
    ) {

        return;

    }


    /*
     * PDFs without tables still need a watermark
     * on every page.
     */
    addPDFWatermark(
        doc
    );

       }
