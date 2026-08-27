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


             /* =================================================
                EMAIL INPUT
             ================================================= */

             const emailInput =
                 newsletterForm.querySelector(
                     ".footer__newsletter-input"
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
                EMAIL VALIDATION
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
                SUBMIT BUTTON
             ================================================= */

             const submitButton =
                 newsletterForm.querySelector(
                     ".footer__newsletter-button"
                 );


             if (submitButton) {

                 submitButton.disabled = true;

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
                    READ RESPONSE
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
                    SUCCESS
                 ================================================= */

                 if (
                     response.ok &&
                     result &&
                     result.success
                 ) {

                     showNewsletterMessage(
                         newsletterForm,
                         result.message ||
                         "Successfully subscribed!",
                         "success"
                     );


                     newsletterForm.reset();


                     if (submitButton) {

                         submitButton.textContent =
                             "Subscribed!";

                     }


                     return;
                 }


                 /* =================================================
                    SERVER / BREVO ERROR
                 ================================================= */

                 console.error(
                     "Newsletter subscription failed:",
                     result?.message
                 );


                 showNewsletterMessage(
                     newsletterForm,
                     result?.message ||
                     "Unable to subscribe. Please try again.",
                     "error"
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


                 showNewsletterMessage(
                     newsletterForm,
                     "Something went wrong. Please try again.",
                     "error"
                 );


                 if (submitButton) {

                     submitButton.textContent =
                         "Try Again";

                 }

             }


             /* =====================================================
                ENABLE BUTTON AGAIN
             ===================================================== */

             finally {

                 if (submitButton) {

                     submitButton.disabled = false;

                 }

             }

         }
     );

 }


 /* =========================================================
    SHOW NEWSLETTER MESSAGE
 ========================================================= */

 function showNewsletterMessage(
     newsletterForm,
     message,
     type
 ) {

     let messageElement =
         newsletterForm.querySelector(
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


         newsletterForm.appendChild(
             messageElement
         );

     }


     /* =====================================================
        MESSAGE
     ===================================================== */

     messageElement.textContent =
         message;


     messageElement.className =
         "newsletter-message newsletter-message--" +
         type;


     messageElement.setAttribute(
         "role",
         "status"
     );


     messageElement.style.marginTop =
         "10px";


     messageElement.style.fontSize =
         "14px";


     messageElement.style.lineHeight =
         "1.5";

 }
