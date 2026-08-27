/* =========================================================
   Contact Form
   Frontend Test
========================================================= */

const contactForm = document.querySelector(".contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", (event) => {

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


        if (!name || !email || !message) {
            return;
        }


        console.log(
            "Contact form submission:",
            {
                name: name,
                email: email,
                message: message
            }
        );

    });

}
