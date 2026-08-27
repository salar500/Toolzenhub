/* =========================================================
   ToolZen Hub
   Global Footer Component
========================================================= */

export function renderFooter() {

    const footer = document.getElementById("footer");

    if (!footer) {
        return;
    }


    footer.innerHTML = `

        <footer class="footer">


            <!-- ==========================================
                 Main Footer
            =========================================== -->

            <div class="footer__main">

                <div class="container">

                    <div class="footer__main-grid">


                        <!-- ==================================
                             Brand
                        =================================== -->

                        <div class="footer__brand">

                            <a
                                href="index.html"
                                class="footer__logo"
                                aria-label="ToolZen Hub Home"
                            >

                                <span class="footer__logo-mark">
                                    ▦
                                </span>

                                <span>
                                    ToolZen
                                    <span class="footer__logo-highlight">
                                        Hub
                                    </span>
                                </span>

                            </a>


                            <p class="footer__description">
                                Smart tools to make better
                                decisions every day.
                            </p>


                            <!-- ==================================
                                 Social Links
                            =================================== -->

                            <div class="footer__social">

                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="Facebook"
                                >
                                    f
                                </a>


                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="Twitter"
                                >
                                    𝕏
                                </a>


                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="LinkedIn"
                                >
                                    in
                                </a>


                                <a
                                    href="#"
                                    class="footer__social-link"
                                    aria-label="Instagram"
                                >
                                    ◎
                                </a>

                            </div>

                        </div>


                        <!-- ==================================
                             Quick Links
                        =================================== -->

                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Quick Links
                            </h3>


                            <ul class="footer__links">

                                <li>
                                    <a href="index.html">
                                        Home
                                    </a>
                                </li>


                                <li>
                                    <a href="categories.html">
                                        Categories
                                    </a>
                                </li>


                                <li>
                                    <a href="articles.html">
                                        Articles
                                    </a>
                                </li>


                                <li>
                                    <a href="about.html">
                                        About
                                    </a>
                                </li>

                            </ul>

                        </div>


                        <!-- ==================================
                             Resources
                        =================================== -->

                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Resources
                            </h3>


                            <ul class="footer__links">

                                <li>
                                    <a href="contact.html">
                                        Contact Us
                                    </a>
                                </li>


                                <li>
                                    <a href="privacy.html">
                                        Privacy Policy
                                    </a>
                                </li>


                                <li>
                                    <a href="terms.html">
                                        Terms & Conditions
                                    </a>
                                </li>


                                <li>
                                    <a href="disclaimer.html">
                                        Disclaimer
                                    </a>
                                </li>

                            </ul>

                        </div>


                        <!-- ==================================
                             Popular Calculators
                        =================================== -->

                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Popular Calculators
                            </h3>


                            <ul class="footer__links">

                                <li>
                                    <a href="emi-calculator.html">
                                        EMI Calculator
                                    </a>
                                </li>


                                <li>
                                    <a href="loan-comparison.html">
                                        Loan Comparison
                                    </a>
                                </li>


                                <li>
                                    <a href="sip-calculator.html">
                                        SIP Calculator
                                    </a>
                                </li>


                                <li>
                                    <a href="gst-calculator.html">
                                        GST Calculator
                                    </a>
                                </li>

                            </ul>

                        </div>


                        <!-- ==================================
                             Newsletter
                        =================================== -->

                        <div class="footer__newsletter">

                            <h3 class="footer__column-title">
                                Subscribe to our newsletter
                            </h3>


                            <p class="footer__newsletter-text">
                                Get updates, useful tips and new
                                calculators directly in your inbox.
                            </p>


                            <form
                                class="footer__newsletter-form"
                            >

                                <input
                                    type="email"
                                    class="footer__newsletter-input"
                                    placeholder="Enter your email"
                                    aria-label="Email address"
                                    autocomplete="email"
                                    required
                                >


                                <button
                                    type="submit"
                                    class="footer__newsletter-button"
                                >
                                    Subscribe
                                </button>

                            </form>

                        </div>


                    </div>

                </div>

            </div>


            <!-- ==========================================
                 Footer Bottom
            =========================================== -->

            <div class="footer__bottom">

                <div class="container">

                    <div class="footer__bottom-inner">


                        <p class="footer__copyright">
                            © 2026 ToolZen Hub. All rights reserved.
                        </p>


                        <nav
                            class="footer__legal"
                            aria-label="Legal"
                        >

                            <a href="privacy.html">
                                Privacy Policy
                            </a>


                            <a href="terms.html">
                                Terms & Conditions
                            </a>


                            <a href="disclaimer.html">
                                Disclaimer
                            </a>

                        </nav>


                    </div>

                </div>

            </div>


        </footer>

    `;


    /* =====================================================
       Newsletter Form
       Prevent empty/default form submission
    ===================================================== */

    const newsletterForm =
        footer.querySelector(
            ".footer__newsletter-form"
        );


    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const emailInput =
                    newsletterForm.querySelector(
                        ".footer__newsletter-input"
                    );


                if (!emailInput) {
                    return;
                }


                const email =
                    emailInput.value.trim();


                if (!email) {
                    emailInput.focus();
                    return;
                }


                /*
                 * Newsletter functionality can be
                 * connected later.
                 */

                console.log(
                    "Newsletter subscription:",
                    email
                );

            }
        );

    }

}
