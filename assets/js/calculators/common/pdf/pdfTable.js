/* =========================================================
   ToolZen Hub
   PDF Content + Tables
========================================================= */

import {
    PDF_PAGE,
    PDF_COLORS,
    PDF_FONTS
} from "./pdfStyles.js";


/* =========================================================
   CURRENT Y POSITION
========================================================= */

function getY(doc) {

    return (
        doc.lastAutoTable &&
        doc.lastAutoTable.finalY
    )
        ? doc.lastAutoTable.finalY + 10
        : 40;

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


    if (subtitle) {

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


        doc.text(
            String(subtitle),
            PDF_PAGE.margin,
            30
        );

    }

}


/* =========================================================
   SUMMARY
========================================================= */

export function addPDFSummary(
    doc,
    summary
) {

    let y =
        subtitleY(doc);


    y += 8;


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(
        PDF_FONTS.heading
    );


    doc.setTextColor(
        ...PDF_COLORS.dark
    );


    doc.text(
        "Summary",
        PDF_PAGE.margin,
        y
    );


    y += 8;


    summary.forEach(
        item => {

            const label =
                item.label || "";


            const value =
                item.value ?? "";


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


            y += 6;

        }
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
            left: PDF_PAGE.margin,
            right: PDF_PAGE.margin
        },

        styles: {

            font: "helvetica",

            fontSize:
                PDF_FONTS.small,

            cellPadding: 3,

            textColor:
                PDF_COLORS.dark,

            lineColor:
                PDF_COLORS.border,

            lineWidth: 0.2

        },

        headStyles: {

            fillColor:
                PDF_COLORS.primary,

            textColor:
                PDF_COLORS.white,

            fontStyle: "bold"

        },

        alternateRowStyles: {

            fillColor:
                PDF_COLORS.light

        },

        theme: "grid"

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

        doc.setPage(page);


        const pageHeight =
            doc.internal.pageSize.height;


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


        doc.text(
            String(text),
            PDF_PAGE.margin,
            pageHeight - 10
        );


        doc.text(
            `Page ${page} of ${pageCount}`,
            195,
            pageHeight - 10,
            {
                align: "right"
            }
        );

    }

}


/* =========================================================
   HELPER
========================================================= */

function subtitleY(doc) {

    return 34;

}
