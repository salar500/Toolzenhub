/* =========================================================
   ToolZen Hub
   PDF Library Loader
========================================================= */

let pdfLibrariesPromise = null;


/**
 * Load jsPDF + AutoTable only when required.
 *
 * This prevents the PDF libraries from loading on
 * every calculator/page visit.
 */
export function loadPdfLibraries() {

    if (pdfLibrariesPromise) {
        return pdfLibrariesPromise;
    }


    pdfLibrariesPromise = new Promise(
        (resolve, reject) => {

            /*
             * Already loaded
             */
            if (
                window.jspdf &&
                window.jspdf.jsPDF
            ) {

                resolve({
                    jsPDF:
                        window.jspdf.jsPDF
                });

                return;
            }


            /*
             * jsPDF
             */
            const jsPdfScript =
                document.createElement("script");

            jsPdfScript.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

            jsPdfScript.onload = () => {

                /*
                 * AutoTable
                 */
                const autoTableScript =
                    document.createElement("script");

                autoTableScript.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";


                autoTableScript.onload = () => {

                    if (
                        !window.jspdf ||
                        !window.jspdf.jsPDF
                    ) {

                        reject(
                            new Error(
                                "jsPDF failed to load."
                            )
                        );

                        return;
                    }


                    resolve({
                        jsPDF:
                            window.jspdf.jsPDF
                    });

                };


                autoTableScript.onerror = () => {

                    reject(
                        new Error(
                            "jsPDF AutoTable failed to load."
                        )
                    );

                };


                document.head.appendChild(
                    autoTableScript
                );

            };


            jsPdfScript.onerror = () => {

                reject(
                    new Error(
                        "jsPDF failed to load."
                    )
                );

            };


            document.head.appendChild(
                jsPdfScript
            );

        }
    );


    return pdfLibrariesPromise;
}
