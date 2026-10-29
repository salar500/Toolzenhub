/* =========================================================
   ToolZen Hub
   Global Footer Component
========================================================= */

import {
    SITE_ROOT,
    ROUTES
} from "../routes.js";

import { sections } from "../data/categories.js";


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


    /* The tool sections come from the catalog, so a new section
       appears here without editing this file. */
    const sectionLinks = sections
        .filter(section => ROUTES[section.landing])
        .map(section => `
                                <li>
                                    <a href="${ROUTES[section.landing]}">
                                        ${section.title}
                                    </a>
                                </li>`)
        .join("");

    return `

        <footer class="footer">

            <div class="footer__main">

                <div class="container">

                    <div class="footer__main-grid">

                        <div class="footer__brand">

                            <a
                                href="${page("")}"
                                class="footer__logo"
                                aria-label="ToolZen Hub Home"
                            >

                                <span class="footer__logo-mark" aria-hidden="true">
                                    <svg viewBox="0 0 100 100" focusable="false">
                                        <rect width="100" height="100" rx="22" fill="#292524"/>
                                        <g fill="#fff">
                                            <rect x="20" y="20" width="28" height="28" rx="7"/>
                                            <rect x="20" y="52" width="28" height="28" rx="7"/>
                                            <rect x="52" y="52" width="28" height="28" rx="7"/>
                                        </g>
                                        <rect x="56.5" y="24.5" width="19" height="19" rx="4.5" transform="rotate(45 66 34)" fill="#a5b4fc"/>
                                    </svg>
                                </span>

                                <span>
                                    ToolZen
                                    <span class="footer__logo-highlight">Hub</span>
                                </span>

                            </a>

                            <p class="footer__description">
                                Practical tools for everyday decisions.
                                Calculated in your browser, with the
                                assumptions shown.
                            </p>

                        </div>


                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Tools
                            </h3>

                            <ul class="footer__links">
                                ${sectionLinks}
                            </ul>

                        </div>


                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Explore
                            </h3>

                            <ul class="footer__links">

                                <li>
                                    <a href="${page("")}">Home</a>
                                </li>

                                <li>
                                    <a href="${page("tools.html")}">All Tools</a>
                                </li>

                                <li>
                                    <a href="${page("articles.html")}">Articles</a>
                                </li>

                                <li>
                                    <a href="${page("about.html")}">About</a>
                                </li>

                            </ul>

                        </div>


                        <div class="footer__column">

                            <h3 class="footer__column-title">
                                Legal
                            </h3>

                            <ul class="footer__links">

                                <li>
                                    <a href="${page("contact.html")}">Contact Us</a>
                                </li>

                                <li>
                                    <a href="${page("privacy.html")}">Privacy Policy</a>
                                </li>

                                <li>
                                    <a href="${page("terms.html")}">Terms &amp; Conditions</a>
                                </li>

                                <li>
                                    <a href="${page("disclaimer.html")}">Disclaimer</a>
                                </li>

                            </ul>

                        </div>

                    </div>

                </div>

            </div>


            <div class="footer__bottom">

                <div class="container">

                    <div class="footer__bottom-inner">

                        <p class="footer__copyright">
                            © 2026 ToolZen Hub. All rights reserved.
                        </p>

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
