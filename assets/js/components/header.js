/* =========================================================
   ToolZen Hub
   Global Header Component
========================================================= */

import { ROUTES } from "../routes.js";


export function renderHeader() {

    const header = document.getElementById("header");

    if (!header) {
        return;
    }


    /* =====================================================
       HEADER HTML
    ===================================================== */

    header.innerHTML = `

        <div class="site-header">

            <nav
                class="navbar"
                aria-label="Main navigation"
            >

                <!-- ======================================
                     BRAND
                ======================================= -->

                <a
                    href="${ROUTES.home}"
                    class="navbar__brand"
                    aria-label="ToolZen Hub Home"
                >

                    <span class="brand-logo">
                        <span aria-hidden="true">▦</span>
                    </span>


                    <span class="brand-text">

                        <span class="brand-title">
                            ToolZen <span>Hub</span>
                        </span>

                        <span class="brand-subtitle">
                            Smart Tools, Smarter You
                        </span>

                    </span>

                </a>


                <!-- ======================================
                     DESKTOP NAVIGATION
                ======================================= -->

                <div class="navbar__menu">

                    <ul>

                        <li>
                            <a
                                href="${ROUTES.home}"
                                class="navbar__link"
                                data-nav="home"
                            >
                                Home
                            </a>
                        </li>


                        <li>
                            <a
                                href="${ROUTES.categories}"
                                class="navbar__link"
                                data-nav="categories"
                            >
                                Categories
                            </a>
                        </li>


                        <li>
                            <a
                                href="${ROUTES.articles}"
                                class="navbar__link"
                                data-nav="articles"
                            >
                                Articles
                            </a>
                        </li>


                        <li>
                            <a
                                href="${ROUTES.about}"
                                class="navbar__link"
                                data-nav="about"
                            >
                                About
                            </a>
                        </li>

                    </ul>

                </div>


                <!-- ======================================
                     MOBILE MENU BUTTON
                ======================================= -->

                <div class="navbar__actions">

                    <button
                        type="button"
                        class="menu-toggle"
                        data-action="menu"
                        aria-label="Open navigation menu"
                        aria-expanded="false"
                        aria-controls="mobile-navigation"
                    >

                        <span></span>
                        <span></span>
                        <span></span>

                    </button>

                </div>

            </nav>


            <!-- ======================================
                 MOBILE NAVIGATION
            ======================================= -->

            <div
                id="mobile-navigation"
                class="mobile-navigation"
                aria-hidden="true"
            >

                <nav
                    aria-label="Mobile navigation"
                >

                    <div class="mobile-navigation__menu">

                        <a
                            href="${ROUTES.home}"
                            class="mobile-navigation__link"
                            data-nav="home"
                        >
                            Home
                        </a>


                        <a
                            href="${ROUTES.categories}"
                            class="mobile-navigation__link"
                            data-nav="categories"
                        >
                            Categories
                        </a>


                        <a
                            href="${ROUTES.articles}"
                            class="mobile-navigation__link"
                            data-nav="articles"
                        >
                            Articles
                        </a>


                        <a
                            href="${ROUTES.about}"
                            class="mobile-navigation__link"
                            data-nav="about"
                        >
                            About
                        </a>

                    </div>

                </nav>

            </div>

        </div>

    `;


    /* =====================================================
       CURRENT PAGE
    ===================================================== */

    const pathname =
        window.location.pathname;


    /* =====================================================
       ALL NAVIGATION LINKS
    ===================================================== */

    const allNavLinks =
        header.querySelectorAll(
            ".navbar__link, .mobile-navigation__link"
        );


    allNavLinks.forEach(link => {

        const href =
            link.getAttribute("href");


        /* Remove previous active state */

        link.classList.remove("active");

        link.removeAttribute("aria-current");


        /* Add active state */

        if (
            pathname === href ||
            (
                href === ROUTES.home &&
                (
                    pathname === "/Toolzenhub" ||
                    pathname === "/Toolzenhub/" ||
                    pathname === "/Toolzenhub/index.html" ||
                    pathname === "/"
                )
            )
        ) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );

        }

    });


    /* =====================================================
       MOBILE MENU ELEMENTS
    ===================================================== */

    const menuButton =
        header.querySelector(
            ".menu-toggle"
        );


    const mobileNavigation =
        header.querySelector(
            "#mobile-navigation"
        );


    if (
        !menuButton ||
        !mobileNavigation
    ) {
        return;
    }


    /* =====================================================
       OPEN / CLOSE MOBILE MENU
    ===================================================== */

    function closeMobileMenu() {

        mobileNavigation.classList.remove(
            "is-open"
        );


        menuButton.classList.remove(
            "is-open"
        );


        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        mobileNavigation.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function openMobileMenu() {

        mobileNavigation.classList.add(
            "is-open"
        );


        menuButton.classList.add(
            "is-open"
        );


        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );


        menuButton.setAttribute(
            "aria-label",
            "Close navigation menu"
        );


        mobileNavigation.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       HAMBURGER BUTTON
    ===================================================== */

    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                menuButton.getAttribute(
                    "aria-expanded"
                ) === "true";


            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );


    /* =====================================================
       MOBILE LINKS
    ===================================================== */

    const mobileLinks =
        mobileNavigation.querySelectorAll(
            ".mobile-navigation__link"
        );


    mobileLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                closeMobileMenu();

            }
        );

    });


    /* =====================================================
       CLOSE MENU WHEN ESCAPE IS PRESSED
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                mobileNavigation.classList.contains(
                    "is-open"
                )
            ) {

                closeMobileMenu();

                menuButton.focus();

            }

        }
    );


    /* =====================================================
       CLOSE MOBILE MENU WHEN RESIZING TO DESKTOP
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 900) {

                closeMobileMenu();

            }

        }
    );

}
