/* =========================================================
   ToolZen Hub
   Newsletter Subscription
   Netlify Function
========================================================= */

export default async function handler(request) {

    /* =====================================================
       ONLY ALLOW POST REQUESTS
    ===================================================== */

    if (request.method !== "POST") {

        return new Response(
            JSON.stringify({
                success: false,
                message: "Method not allowed."
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }


    /* =====================================================
       READ REQUEST DATA
    ===================================================== */

    try {

        const data =
            await request.json();

        const email =
            data.email?.trim();


        /* =================================================
           VALIDATE EMAIL
        ================================================= */

        if (!email) {

            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Email is required."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }


        /* =================================================
           BREVO API KEY
        ================================================= */

        const apiKey =
            Netlify.env.get("BREVO_API_KEY");


        if (!apiKey) {

            console.error(
                "BREVO_API_KEY is not configured."
            );

            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Server configuration error."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }


        /* =================================================
           SEND CONTACT TO BREVO
        ================================================= */

        const response =
            await fetch(
                "https://api.brevo.com/v3/contacts",
                {
                    method: "POST",

                    headers: {
                        "accept":
                            "application/json",

                        "content-type":
                            "application/json",

                        "api-key":
                            apiKey
                    },

                    body: JSON.stringify({

                        email: email,

                        listIds: [3]

                    })
                }
            );


        /* =================================================
           BREVO RESPONSE
        ================================================= */

        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Brevo API error:",
                error
            );

            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Unable to subscribe."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        }


        /* =================================================
           SUCCESS
        ================================================= */

        return new Response(
            JSON.stringify({
                success: true,
                message:
                    "Successfully subscribed."
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }


    /* =====================================================
       ERROR HANDLING
    ===================================================== */

    catch (error) {

        console.error(
            "Newsletter function error:",
            error
        );

        return new Response(
            JSON.stringify({
                success: false,
                message:
                    "Something went wrong."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }

}
