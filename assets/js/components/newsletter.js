/* =========================================================
   ToolZen Hub
   Newsletter Subscription
   Frontend JavaScript
========================================================= */

export function initializeNewsletter() {

    const newsletterForm =
        document.querySelector(
            ".footer__newsletter-form"
        );


    /* =====================================================
       FORM NOT FOUND
    ===================================================== */

    if (!newsletterForm) {
        return;
    }


    /* =====================================================
       FORM SUBMISSION
    ===================================================== */

    newsletterForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const emailInput =
                newsletterForm.querySelector(
                    ".footer__newsletter-input"
                );


            const submitButton =
                newsletterForm.querySelector(
                    ".footer__newsletter-button"
                );


            if (!emailInput) {
                return;
            }


            const email =
                emailInput.value.trim();


            /* =================================================
               VALIDATION
            ================================================= */

            if (!email) {

                emailInput.focus();

                return;
            }


            /* =================================================
               BUTTON STATE
            ================================================= */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Subscribing...";

            }


            /* =================================================
               SEND TO NETLIFY
            ================================================= */

            try {

                const response =
                    await fetch(
                        "/.netlify/functions/subscribe",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email
                            })
                        }
                    );


                const result =
                    await response.json();


                /* =================================================
                   SUCCESS
                ================================================= */

                if (
                    response.ok &&
                    result.success
                ) {

                    console.log(
                        "Newsletter subscription successful:",
                        email
                    );


                    newsletterForm.reset();


                    if (submitButton) {

                        submitButton.textContent =
                            "Subscribed!";

                    }


                    return;
                }


                /* =================================================
                   ERROR
                ================================================= */

                console.error(
                    "Newsletter subscription failed:",
                    result.message
                );


                if (submitButton) {

                    submitButton.textContent =
                        "Try Again";

                    submitButton.disabled = false;

                }

            }


            /* =====================================================
               NETWORK ERROR
            ===================================================== */

            catch (error) {

                console.error(
                    "Newsletter request error:",
                    error
                );


                if (submitButton) {

                    submitButton.textContent =
                        "Try Again";

                    submitButton.disabled = false;

                }

            }

        }
    );

}
