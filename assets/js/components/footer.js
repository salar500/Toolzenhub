/* =========================================================
   ToolZen Hub
   Global Footer Component
========================================================= */

export function renderFooter() {

    const footer = document.getElementById("footer");

    if (!footer) {
        return;
    }


    /* =====================================================
       SITE BASE PATH
       Automatically detects:

       /Toolzenhub/

       This keeps footer links working from:

       /Toolzenhub/index.html
       /Toolzenhub/calculators.html
       /Toolzenhub/calculators/loan-comparison/
    ====================================================== */

    const siteBase = new URL(
        ".",
        document.baseURI
    ).origin + "/Toolzenhub/";


    /* =====================================================
       GLOBAL PATH HELPER
    ====================================================== */

    const page = path => `${siteBase}${path}`;


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
                                href="${page("")}"
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
                                    <a href="${page("")}">
                                        Home
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("categories.html")}">
                                        Categories
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("articles.html")}">
                                        Articles
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("about.html")}">
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
                                    <a href="${page("contact.html")}">
                                        Contact Us
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("privacy.html")}">
                                        Privacy Policy
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("terms.html")}">
                                        Terms & Conditions
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("disclaimer.html")}">
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
                                    <a href="${page("calculators/emi-calculator/")}">
                                        EMI Calculator
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("calculators/loan-comparison/")}">
                                        Loan Comparison
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("calculators/sip-calculator/")}">
                                        SIP Calculator
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("calculators/gst-calculator/")}">
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

                        </nav>


                    </div>

                </div>

            </div>


        </footer>

    `;

}
