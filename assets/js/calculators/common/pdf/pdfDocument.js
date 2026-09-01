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


    /*
     * Load Unicode font
     *
     * Noto Sans supports the Indian Rupee symbol (₹).
     */
    const fontURL =
        "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf";


    const response =
        await fetch(
            fontURL
        );


    if (
        !response.ok
    ) {

        throw new Error(
            "Failed to load PDF Unicode font."
        );

    }


    const fontBuffer =
        await response.arrayBuffer();


    const fontBytes =
        new Uint8Array(
            fontBuffer
        );


    let binary =
        "";


    const chunkSize =
        0x8000;


    for (
        let i = 0;
        i < fontBytes.length;
        i += chunkSize
    ) {

        binary += String.fromCharCode(
            ...fontBytes.subarray(
                i,
                i + chunkSize
            )
        );

    }


    const base64 =
        btoa(
            binary
        );


    /*
     * Register Unicode font
     */
    doc.addFileToVFS(
        "NotoSans-Regular.ttf",
        base64
    );


    doc.addFont(
        "NotoSans-Regular.ttf",
        "NotoSans",
        "normal"
    );


    /*
     * Use Unicode font throughout PDF
     */
    doc.setFont(
        "NotoSans",
        "normal"
    );


    return doc;

}
