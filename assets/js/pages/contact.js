/* =========================================================
   ToolZen Hub
   Contact Page
   Page-Specific JavaScript
========================================================= */


/* =========================================================
   CONTACT PAGE
========================================================= */

export function renderContactPage() {

    const contactForm =
        document.querySelector(".contact-form");


    if (!contactForm) {
        return;
    }


    /* =====================================================
       CONTACT FORM SUBMISSION
    ===================================================== */

    contactForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            /*
             * There is no contact backend connected yet, so the
             * message is NOT sent. Tell the user clearly and keep
             * what they typed instead of clearing the form.
             */

            const status =
                document.getElementById("contact-status");


            if (status) {

                status.textContent =
                    "Your message was not sent. " +
                    "The contact form isn't connected yet.";

            }


        }
    );

}
