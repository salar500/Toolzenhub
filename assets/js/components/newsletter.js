/* =========================================================
   ToolZen Hub
   Newsletter Subscription
   Frontend Component
========================================================= */


/* =========================================================
   NEWSLETTER
========================================================= */

export function initializeNewsletter() {

    const newsletterForms =
        document.querySelectorAll(
            ".footer__newsletter-form"
        );


    if (!newsletterForms.length) {
        return;
    }


    newsletterForms.forEach(
        (newsletterForm) => {


            /* =================================================
               PREVENT DUPLICATE EVENT LISTENERS
            ================================================= */

            if (
                newsletterForm.dataset.newsletterInitialized === "true"
            ) {
                return;
            }


            newsletterForm.dataset.newsletterInitialized =
                "true";


            /* =================================================
               SUBMIT
            ================================================= */

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
                       BASIC VALIDATION
                    ================================================= */

                    if (!email) {

                        showNewsletterMessage(
                            newsletterForm,
                            "Please enter your email address.",
                            "error"
                        );

                        emailInput.focus();

                        return;
                    }


                    /* =================================================
                       EMAIL FORMAT VALIDATION
                    ================================================= */

                    const emailPattern =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                    if (!emailPattern.test(email)) {

                        showNewsletterMessage(
                            newsletterForm,
                            "Please enter a valid email address.",
                            "error"
                        );

                        emailInput.focus();

                        return;
                    }


                    /* =================================================
                       LOADING STATE
                    ================================================= */

                    if (submitButton) {

                        submitButton.disabled = true;

                        submitButton.dataset.originalText =
                            submitButton.textContent;

                        submitButton.textContent =
                            "Subscribing...";
                    }


                    showNewsletterMessage(
                        newsletterForm,
                        "Subscribing...",
                        "loading"
                    );


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
                                        email: email
                                    })
                                }
                            );


                        /* =================================================
                           READ SERVER RESPONSE
                        ================================================= */

                        let result = null;


                        try {

                            result =
                                await response.json();

                        } catch (jsonError) {

                            console.error(
                                "Invalid server response:",
                                jsonError
                            );

                        }


                        /* =================================================
                           FAILED REQUEST
                        ================================================= */

                        if (!response.ok) {

                            console.error(
                                "Newsletter subscription failed:",
                                result
                            );


                            showNewsletterMessage(
                                newsletterForm,
                                result?.message ||
                                "Unable to subscribe right now. Please try again.",
                                "error"
                            );


                            return;
                        }


                        /* =================================================
                           SUCCESS
                        ================================================= */

                        showNewsletterMessage(
                            newsletterForm,
                            result?.message ||
                            "You're subscribed successfully!",
                            "success"
                        );


                        /* =================================================
                           RESET FORM
                        ================================================= */

                        newsletterForm.reset();


                    } catch (error) {

                        console.error(
                            "Newsletter request error:",
                            error
                        );


                        showNewsletterMessage(
                            newsletterForm,
                            "Something went wrong. Please try again.",
                            "error"
                        );


                    } finally {

                        /* ================================================
                           RESTORE BUTTON
                        ================================================= */

                        if (submitButton) {

                            submitButton.disabled = false;

                            submitButton.textContent =
                                submitButton.dataset.originalText ||
                                "Subscribe";
                        }

                    }

                }
            );

        }
    );

}


/* =========================================================
   SHOW NEWSLETTER MESSAGE
========================================================= */

function showNewsletterMessage(
    form,
    message,
    type
) {

    let messageElement =
        form.querySelector(
            ".newsletter-message"
        );


    /* =====================================================
       CREATE MESSAGE ELEMENT
    ===================================================== */

    if (!messageElement) {

        messageElement =
            document.createElement("div");

        messageElement.className =
            "newsletter-message";

        messageElement.setAttribute(
            "role",
            "status"
        );


        form.appendChild(
            messageElement
        );

    }


    /* =====================================================
       MESSAGE TYPE
    ===================================================== */

    messageElement.className =
        "newsletter-message newsletter-message--" +
        type;


    messageElement.textContent =
        message;


    messageElement.style.marginTop =
        "10px";


    messageElement.style.fontSize =
        "14px";


    messageElement.style.lineHeight =
        "1.5";


    /* =====================================================
       ACCESSIBILITY
    ===================================================== */

    if (type === "success") {

        messageElement.setAttribute(
            "aria-live",
            "polite"
        );

    } else {

        messageElement.setAttribute(
            "aria-live",
            "assertive"
        );

    }

}
