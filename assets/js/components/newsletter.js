/* =========================================================
   ToolZen Hub
   Newsletter Subscription
   Frontend JavaScript
========================================================= */


/* =========================================================
   NEWSLETTER
========================================================= */

export function initializeNewsletter() {

    const newsletterForm =
        document.querySelector(".newsletter-form");


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


            /* =================================================
               EMAIL INPUT
            ================================================= */

            const emailInput =
                newsletterForm.querySelector(
                    'input[type="email"]'
                );


            if (!emailInput) {
                return;
            }


            const email =
                emailInput.value.trim();


            /* =================================================
               BASIC VALIDATION
            ================================================= */

            if (!email) {

                console.log(
                    "Please enter your email address."
                );

                return;
            }


            /* =================================================
               SUBMIT BUTTON
            ================================================= */

            const submitButton =
                newsletterForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Subscribing...";

            }


            /* =================================================
               SEND TO NETLIFY FUNCTION
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
                   BREVO / SERVER ERROR
                ================================================= */

                console.error(
                    "Newsletter subscription failed:",
                    result.message
                );


                if (submitButton) {

                    submitButton.textContent =
                        "Try Again";

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

                }

            }


            /* =====================================================
               ENABLE BUTTON AGAIN
            ===================================================== */

            if (submitButton) {

                submitButton.disabled = false;

            }

        }
    );

}
