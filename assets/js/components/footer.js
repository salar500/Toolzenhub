/* =========================================================
   ToolZen Hub
   Global Footer Component
========================================================= */

import {
    SITE_ROOT
} from "../routes.js";


/* =========================================================
   FOOTER MARKUP

   Pure: returns the footer HTML. The site build calls it to
   put the footer into every generated page; renderFooter()
   calls it only when a page does not already contain it.
========================================================= */

export function footerMarkup() {

    /* =====================================================
       SITE BASE PATH
       Automatically detects:

       GitHub Pages:
       /Toolzenhub/

       Hostinger:
       /

       This keeps footer links working from:

       /Toolzenhub/index.html
       /Toolzenhub/calculators.html
       /Toolzenhub/calculators/loan-comparison/

       And:

       /index.html
       /calculators.html
       /calculators/loan-comparison/
    ====================================================== */

    const siteBase =
        SITE_ROOT;


    /* =====================================================
       GLOBAL PATH HELPER
    ====================================================== */

    const page = path => `${siteBase}${path}`;


    return `

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
                                    <a href="${page("tools.html")}">
                                        All Tools
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
                                    <a href="${page("calculators/emi/")}">
                                        EMI Calculator
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("calculators/loan-comparison/")}">
                                        Loan Comparison
                                    </a>
                                </li>


                                <li>
                                    <a href="${page("calculators.html")}">
                                        All Calculators
                                    </a>
                                </li>

                            </ul>

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


/* =========================================================
   RENDER FOOTER
========================================================= */

export function renderFooter() {

    const footer = document.getElementById("footer");

    if (!footer) {
        return;
    }

    /*
     * Generated pages already contain the footer.
     */

    if (!footer.querySelector(".footer")) {

        footer.innerHTML = footerMarkup();

    }

}
