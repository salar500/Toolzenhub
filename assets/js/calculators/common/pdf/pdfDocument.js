/* =========================================================
   ToolZen Hub
   PDF Document
========================================================= */

import {
    loadPdfLibraries
} from "./pdfLoader.js";


/* =========================================================
   CREATE PDF DOCUMENT
========================================================= */

export async function createPDFDocument() {

    /*
     * Load jsPDF + AutoTable
     * only when PDF generation is requested.
     */
    const {
        jsPDF
    } =
        await loadPdfLibraries();


    /*
     * Create document
     */
    const doc =
        new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4"

        });


    return doc;

}
