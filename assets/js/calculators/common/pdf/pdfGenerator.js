/* =========================================================
   ToolZen Hub
   Common PDF Generator
   ---------------------------------------------------------
   Reusable client-side PDF utility.

   This file does NOT contain calculator logic.
   It only creates and downloads PDF documents.

   Designed to work with:
   - Loan calculators
   - EMI / Amortization
   - SIP
   - FD / RD
   - Tax
   - GST
   - Investment calculators
   - Future calculators
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const DEFAULT_CONFIG = {

    filename:
        "toolzen-calculator-report.pdf",

    title:
        "ToolZen Hub Calculator Report",

    subtitle:
        "",

    orientation:
        "portrait",

    unit:
        "mm",

    format:
        "a4",

    margin:
        14

};


/* =========================================================
   CREATE PDF
========================================================= */

/**
 * Creates a jsPDF document.
 *
 * Requires jsPDF to be loaded before this module.
 *
 * Example:
 *
 * const pdf = createPDF({
 *     title: "Loan Amortization Schedule"
 * });
 *
 */

export function createPDF(
    options = {}
) {

    if (
        typeof window === "undefined" ||
        typeof window.jspdf === "undefined"
    ) {

        console.error(
            "ToolZen PDF Generator: jsPDF is not loaded."
        );

        return null;

    }


    const config = {

        ...DEFAULT_CONFIG,

        ...options

    };


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF({

            orientation:
                config.orientation,

            unit:
                config.unit,

            format:
                config.format

        });


    return pdf;

}


/* =========================================================
   GET PAGE DIMENSIONS
========================================================= */

/**
 * Returns the current PDF page dimensions.
 */

export function getPageDimensions(
    pdf
) {

    if (!pdf) {

        return {
            width: 0,
            height: 0
        };

    }


    return {

        width:
            pdf.internal.pageSize.getWidth(),

        height:
            pdf.internal.pageSize.getHeight()

    };

}


/* =========================================================
   ADD TITLE
========================================================= */

/**
 * Adds a main title to the current page.
 */

export function addTitle(
    pdf,
    title,
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        x = 14,

        y = 20,

        fontSize = 18,

        fontStyle = "bold"

    } = options;


    pdf.setFont(
        "helvetica",
        fontStyle
    );


    pdf.setFontSize(
        fontSize
    );


    pdf.text(
        String(title || ""),
        x,
        y
    );

}


/* =========================================================
   ADD SUBTITLE
========================================================= */

/**
 * Adds a smaller subtitle below the main title.
 */

export function addSubtitle(
    pdf,
    subtitle,
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        x = 14,

        y = 27,

        fontSize = 10

    } = options;


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(
        fontSize
    );


    pdf.text(
        String(subtitle || ""),
        x,
        y
    );

}


/* =========================================================
   ADD TEXT
========================================================= */

/**
 * Adds normal text.
 */

export function addText(
    pdf,
    text,
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        x = 14,

        y = 20,

        fontSize = 10,

        fontStyle = "normal",

        maxWidth

    } = options;


    pdf.setFont(
        "helvetica",
        fontStyle
    );


    pdf.setFontSize(
        fontSize
    );


    if (maxWidth) {

        pdf.text(
            String(text || ""),
            x,
            y,
            {
                maxWidth
            }
        );

        return;

    }


    pdf.text(
        String(text || ""),
        x,
        y
    );

}


/* =========================================================
   ADD HORIZONTAL LINE
========================================================= */

/**
 * Adds a horizontal separator line.
 */

export function addLine(
    pdf,
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        x1 = 14,

        y = 30,

        x2

    } = options;


    const dimensions =
        getPageDimensions(pdf);


    const finalX2 =
        x2 || dimensions.width - 14;


    pdf.line(
        x1,
        y,
        finalX2,
        y
    );

}


/* =========================================================
   ADD SUMMARY GRID
========================================================= */

/**
 * Adds simple label/value summary information.
 *
 * Example:
 *
 * addSummary(pdf, [
 *     {
 *         label: "Principal",
 *         value: "₹50,00,000"
 *     },
 *     {
 *         label: "Interest Rate",
 *         value: "8.5%"
 *     }
 * ]);
 *
 */

export function addSummary(
    pdf,
    items = [],
    options = {}
) {

    if (!pdf || !Array.isArray(items)) {
        return;
    }


    const {

        x = 14,

        y = 38,

        columns = 2,

        columnWidth = 85,

        rowHeight = 14,

        labelFontSize = 8,

        valueFontSize = 10

    } = options;


    items.forEach(
        (item, index) => {

            const column =
                index % columns;


            const row =
                Math.floor(
                    index / columns
                );


            const itemX =
                x +
                column *
                columnWidth;


            const itemY =
                y +
                row *
                rowHeight;


            pdf.setFont(
                "helvetica",
                "normal"
            );


            pdf.setFontSize(
                labelFontSize
            );


            pdf.text(
                String(
                    item.label || ""
                ),
                itemX,
                itemY
            );


            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(
                valueFontSize
            );


            pdf.text(
                String(
                    item.value ?? ""
                ),
                itemX,
                itemY + 5
            );

        }
    );

}


/* =========================================================
   ADD TABLE
========================================================= */

/**
 * Adds a table using jsPDF-AutoTable.
 *
 * Requires:
 *
 * jspdf
 * jspdf-autotable
 *
 * to be loaded.
 *
 * Example:
 *
 * addTable(pdf, {
 *
 *     head: [
 *         [
 *             "Month",
 *             "Principal",
 *             "Interest",
 *             "Balance"
 *         ]
 *     ],
 *
 *     body: [
 *         [
 *             "1",
 *             "₹4,845",
 *             "₹35,417",
 *             "₹49,95,155"
 *         ]
 *     ]
 *
 * });
 *
 */

export function addTable(
    pdf,
    options = {}
) {

    if (!pdf) {

        console.error(
            "ToolZen PDF Generator: PDF instance is missing."
        );

        return;

    }


    if (
        typeof pdf.autoTable !== "function"
    ) {

        console.error(
            "ToolZen PDF Generator: jsPDF AutoTable is not loaded."
        );

        return;

    }


    const {

        head = [],

        body = [],

        startY = 50,

        margin = 14,

        theme = "grid",

        styles = {},

        headStyles = {},

        bodyStyles = {},

        columnStyles = {},

        didDrawPage,

        ...otherOptions

    } = options;


    pdf.autoTable({

        head,

        body,

        startY,

        margin: {
            left: margin,
            right: margin
        },

        theme,

        styles: {

            font:
                "helvetica",

            fontSize:
                8,

            cellPadding:
                2.5,

            overflow:
                "linebreak",

            ...styles

        },

        headStyles: {

            fontStyle:
                "bold",

            ...headStyles

        },

        bodyStyles: {

            ...bodyStyles

        },

        columnStyles,

        didDrawPage,

        ...otherOptions

    });

}


/* =========================================================
   GET LAST TABLE POSITION
========================================================= */

/**
 * Returns the Y position after the last AutoTable.
 *
 * Useful when adding content below a table.
 */

export function getTableEndY(
    pdf,
    fallback = 50
) {

    if (!pdf) {
        return fallback;
    }


    if (
        pdf.lastAutoTable &&
        typeof pdf.lastAutoTable.finalY === "number"
    ) {

        return pdf.lastAutoTable.finalY;

    }


    return fallback;

}


/* =========================================================
   ADD PAGE NUMBER
========================================================= */

/**
 * Adds page number to the current page.
 */

export function addPageNumber(
    pdf,
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        x,

        y,

        fontSize = 8,

        prefix = "Page"

    } = options;


    const dimensions =
        getPageDimensions(pdf);


    const finalX =
        x ??
        dimensions.width - 14;


    const finalY =
        y ??
        dimensions.height - 8;


    const pageNumber =
        pdf.internal.getNumberOfPages();


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(
        fontSize
    );


    pdf.text(
        `${prefix} ${pageNumber}`,
        finalX,
        finalY,
        {
            align: "right"
        }
    );

}


/* =========================================================
   ADD FOOTER
========================================================= */

/**
 * Adds a footer to the current page.
 */

export function addFooter(
    pdf,
    text = "Generated by ToolZen Hub",
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        fontSize = 7,

        margin = 14

    } = options;


    const dimensions =
        getPageDimensions(pdf);


    pdf.setFont(
        "helvetica",
        "normal"
    );


    pdf.setFontSize(
        fontSize
    );


    pdf.text(
        String(text),
        margin,
        dimensions.height - 8
    );

}


/* =========================================================
   ADD PAGE FOOTERS
========================================================= */

/**
 * Adds footer and page number to every page.
 */

export function addPageFooters(
    pdf,
    options = {}
) {

    if (!pdf) {
        return;
    }


    const {

        text =
            "Generated by ToolZen Hub",

        fontSize = 7,

        margin = 14

    } = options;


    const totalPages =
        pdf.internal.getNumberOfPages();


    const dimensions =
        getPageDimensions(pdf);


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        pdf.setPage(
            page
        );


        pdf.setFont(
            "helvetica",
            "normal"
        );


        pdf.setFontSize(
            fontSize
        );


        pdf.text(
            String(text),
            margin,
            dimensions.height - 8
        );


        pdf.text(
            `Page ${page} of ${totalPages}`,
            dimensions.width - margin,
            dimensions.height - 8,
            {
                align: "right"
            }
        );

    }

}


/* =========================================================
   SAFE FILENAME
========================================================= */

/**
 * Creates a safe filename.
 */

export function sanitizeFilename(
    filename
) {

    if (!filename) {

        return "toolzen-report.pdf";

    }


    let safe =
        String(filename)
            .replace(
                /[<>:"/\\|?*\x00-\x1F]/g,
                ""
            )
            .trim();


    if (!safe) {

        safe =
            "toolzen-report";

    }


    if (
        !safe
            .toLowerCase()
            .endsWith(".pdf")
    ) {

        safe += ".pdf";

    }


    return safe;

}


/* =========================================================
   DOWNLOAD PDF
========================================================= */

/**
 * Downloads the generated PDF.
 *
 * Everything happens locally in the user's browser.
 */

export function downloadPDF(
    pdf,
    filename =
        DEFAULT_CONFIG.filename
) {

    if (!pdf) {

        console.error(
            "ToolZen PDF Generator: PDF instance is missing."
        );

        return false;

    }


    const safeFilename =
        sanitizeFilename(
            filename
        );


    try {

        pdf.save(
            safeFilename
        );


        return true;

    } catch (error) {

        console.error(
            "ToolZen PDF Generator: PDF download failed.",
            error
        );


        return false;

    }

}


/* =========================================================
   CREATE + DOWNLOAD PDF
========================================================= */

/**
 * Convenience helper.
 *
 * Creates a PDF, runs a callback to populate it,
 * then downloads it.
 *
 * Example:
 *
 * createAndDownloadPDF({
 *     filename: "loan-report.pdf"
 * }, (pdf) => {
 *
 *     addTitle(
 *         pdf,
 *         "Loan Report"
 *     );
 *
 * });
 *
 */

export function createAndDownloadPDF(
    options = {},
    buildPDF
) {

    const pdf =
        createPDF(
            options
        );


    if (!pdf) {

        return false;

    }


    if (
        typeof buildPDF !== "function"
    ) {

        console.error(
            "ToolZen PDF Generator: buildPDF callback is required."
        );

        return false;

    }


    try {

        buildPDF(
            pdf
        );


        addPageFooters(
            pdf,
            {
                text:
                    options.footerText ||
                    "Generated by ToolZen Hub"
            }
        );


        return downloadPDF(
            pdf,
            options.filename
        );

    } catch (error) {

        console.error(
            "ToolZen PDF Generator: Failed to build PDF.",
            error
        );


        return false;

    }

}


/* =========================================================
   EXPORT DEFAULT API
========================================================= */

export default {

    createPDF,

    getPageDimensions,

    addTitle,

    addSubtitle,

    addText,

    addLine,

    addSummary,

    addTable,

    getTableEndY,

    addPageNumber,

    addFooter,

    addPageFooters,

    sanitizeFilename,

    downloadPDF,

    createAndDownloadPDF

};
