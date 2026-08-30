
/* =========================================================
   ToolZen Hub
   PDF Document
========================================================= */


/*
 * jsPDF is loaded globally.
 *
 * Example:
 *
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 *
 */


export async function createPDFDocument() {

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        throw new Error(
            "jsPDF library is not loaded."
        );

    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


    return doc;

}
