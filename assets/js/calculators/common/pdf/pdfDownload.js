/* =========================================================
   ToolZen Hub
   PDF Download
========================================================= */


export function downloadPDF(
    doc,
    filename
) {

    if (!doc) {

        throw new Error(
            "PDF document is missing."
        );

    }


    let safeFilename =
        String(
            filename ||
            "toolzen-report.pdf"
        );


    /*
     * Ensure .pdf extension
     */

    if (
        !safeFilename
            .toLowerCase()
            .endsWith(".pdf")
    ) {

        safeFilename += ".pdf";

    }


    /*
     * Browser download
     *
     * The file is generated locally
     * and downloaded to the user's device.
     */

    doc.save(
        safeFilename
    );

}
