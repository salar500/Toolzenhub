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


            const nameInput =
                contactForm.querySelector("#name");


            const emailInput =
                contactForm.querySelector("#email");


            const messageInput =
                contactForm.querySelector("#message");


            if (
                !nameInput ||
                !emailInput ||
                !messageInput
            ) {
                return;
            }


            const name =
                nameInput.value.trim();


            const email =
                emailInput.value.trim();


            const message =
                messageInput.value.trim();


            if (
                !name ||
                !email ||
                !message
            ) {
                return;
            }


            /* =================================================
               TEMPORARY TEST OUTPUT
            ================================================= */

            console.log(
                "Contact form submission:",
                {
                    name,
                    email,
                    message
                }
            );


            /* =================================================
               RESET FORM
            ================================================= */

            contactForm.reset();

        }
    );

}
