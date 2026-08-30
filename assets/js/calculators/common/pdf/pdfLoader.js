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

            /*
             * Already loaded
             */
            if (
                document.getElementById(id)
            ) {

                const existingScript =
                    document.getElementById(id);

                if (
                    existingScript.dataset.loaded === "true"
                ) {

                    resolve();

                    return;
                }


                existingScript.addEventListener(
                    "load",
                    resolve,
                    { once: true }
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
                    { once: true }
                );

                return;
            }


            /*
             * Create script
             */
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


            script.onload = () => {

                script.dataset.loaded =
                    "true";

                resolve();

            };


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
     * Reuse existing loading process.
     */
    if (
        pdfLibrariesPromise
    ) {

        return pdfLibrariesPromise;

    }


    pdfLibrariesPromise =
        (async () => {

            /*
             * jsPDF
             */
            if (
                !window.jspdf ||
                !window.jspdf.jsPDF
            ) {

                await loadScript(
                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
                    "toolzen-jspdf"
                );

            }


            /*
             * AutoTable
             */
            if (
                !window.jspdf ||
                !window.jspdf.jsPDF
            ) {

                throw new Error(
                    "jsPDF failed to load."
                );

            }


            /*
             * Check whether AutoTable
             * is already available.
             */
            const {
                jsPDF
            } =
                window.jspdf;


            const testDoc =
                new jsPDF();


            if (
                typeof testDoc.autoTable !==
                "function"
            ) {

                await loadScript(
                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
                    "toolzen-jspdf-autotable"
                );

            }


            /*
             * Final verification
             */
            if (
                !window.jspdf ||
                !window.jspdf.jsPDF
            ) {

                throw new Error(
                    "jsPDF failed to load."
                );

            }


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


            return {

                jsPDF:
                    window.jspdf.jsPDF

            };

        })()
        .catch(error => {

            /*
             * Allow another attempt if
             * loading failed.
             */
            pdfLibrariesPromise =
                null;

            throw error;

        });


    return pdfLibrariesPromise;

}
