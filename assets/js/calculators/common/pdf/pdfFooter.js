/* =========================================================
   ToolZen Hub
   PDF Footer
========================================================= */

import {
    PDF_PAGE,
    PDF_COLORS,
    PDF_FONTS,
    PDF_FOOTER
} from "./pdfStyles.js";


/* =========================================================
   ADD FOOTER TO ALL PAGES
========================================================= */

export function addPDFFooter(
    doc,
    text
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


        /* =================================================
           FOOTER TEXT
        ================================================= */

        doc.text(

            String(text),

            PDF_PAGE.margin,

            pageHeight -
            PDF_FOOTER.offset

        );


        /* =================================================
           PAGE NUMBER
        ================================================= */

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
