/* =========================================================
   ToolZen Hub
   PDF Library Loader
========================================================= */

let pdfLibrariesPromise = null;


/* =========================================================
   LOAD SCRIPT
========================================================= */

function loadScript(
    src,
    id
) {

    return new Promise(
        (resolve, reject) => {

            /* =============================================
               ALREADY EXISTS
            ============================================= */

            const existingScript =
                document.getElementById(id);


            if (existingScript) {

                /*
                 * Already successfully loaded
                 */
                if (
                    existingScript.dataset.loaded === "true"
                ) {

                    resolve();

                    return;

                }


                /*
                 * Currently loading
                 */
                existingScript.addEventListener(
                    "load",
                    () => resolve(),
                    {
                        once: true
                    }
                );


                existingScript.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                `Failed to load ${src}`
                            )
                        );

                    },
                    {
                        once: true
                    }
                );


                return;

            }


            /* =============================================
               CREATE SCRIPT
            ============================================= */

            const script =
                document.createElement(
                    "script"
                );


            script.id =
                id;


            script.src =
                src;


            script.async =
                true;


            /* =============================================
               SUCCESS
            ============================================= */

            script.onload = () => {

                script.dataset.loaded =
                    "true";


                resolve();

            };


            /* =============================================
               ERROR
            ============================================= */

            script.onerror = () => {

                reject(
                    new Error(
                        `Failed to load ${src}`
                    )
                );

            };


            document.head.appendChild(
                script
            );

        }
    );

}


/* =========================================================
   LOAD PDF LIBRARIES
========================================================= */

export function loadPdfLibraries() {

    /*
     * If another calculator is already loading
     * the libraries, reuse the same Promise.
     */
    if (
        pdfLibrariesPromise
    ) {

        return pdfLibrariesPromise;

    }


    pdfLibrariesPromise =
        (async () => {


            /* =============================================
               LOAD jsPDF
            ============================================= */

            if (
                !window.jspdf ||
                !window.jspdf.jsPDF
            ) {

                await loadScript(

                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",

                    "toolzen-jspdf"

                );

            }


            /* =============================================
               VERIFY jsPDF
            ============================================= */

            if (
                !window.jspdf ||
                !window.jspdf.jsPDF
            ) {

                throw new Error(
                    "jsPDF failed to load."
                );

            }


            /* =============================================
               CHECK AUTOTABLE
            ============================================= */

            const testDoc =
                new window.jspdf.jsPDF();


            if (
                typeof testDoc.autoTable !==
                "function"
            ) {

                await loadScript(

                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",

                    "toolzen-jspdf-autotable"

                );

            }


            /* =============================================
               FINAL AUTOTABLE VERIFICATION
            ============================================= */

            const verifyDoc =
                new window.jspdf.jsPDF();


            if (
                typeof verifyDoc.autoTable !==
                "function"
            ) {

                throw new Error(
                    "jsPDF AutoTable plugin failed to load."
                );

            }


            /* =============================================
               RETURN LIBRARY
            ============================================= */

            return {

                jsPDF:
                    window.jspdf.jsPDF

            };

        })()
        .catch(
            error => {

                /*
                 * Reset Promise so a future attempt
                 * can try loading again.
                 */
                pdfLibrariesPromise =
                    null;


                throw error;

            }
        );


    return pdfLibrariesPromise;

}
