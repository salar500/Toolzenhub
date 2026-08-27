/* =========================================================
   ToolZen Hub
   Global Header Component
========================================================= */

export function renderHeader() {

    const header = document.getElementById("header");

    if (!header) {
        return;
    }


    header.innerHTML = `

        <div class="site-header">

            <nav
                class="navbar"
                aria-label="Main navigation"
            >

                <!-- ======================================
                     Brand
                ======================================= -->

                <a
                    href="index.html"
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
                     Desktop Navigation
                ======================================= -->

                <div class="navbar__menu">

                    <ul>

                        <li>
                            <a
                                href="index.html"
                                class="navbar__link"
                                data-nav="home"
                            >
                                Home
                            </a>
                        </li>


                        <li>
                            <a
                                href="categories.html"
                                class="navbar__link"
                                data-nav="categories"
                            >
                                Categories
                            </a>
                        </li>


                        <li>
                            <a
                                href="articles.html"
                                class="navbar__link"
                                data-nav="articles"
                            >
                                Articles
                            </a>
                        </li>


                        <li>
                            <a
                                href="about.html"
                                class="navbar__link"
                                data-nav="about"
                            >
                                About
                            </a>
                        </li>

                    </ul>

                </div>


                <!-- ======================================
                     Header Actions
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


            <!-- =========================================
                 Mobile Navigation
            ========================================== -->

            <div
                id="mobile-navigation"
                class="mobile-navigation"
                aria-hidden="true"
            >

                <nav
                    class="mobile-navigation__menu"
                    aria-label="Mobile navigation"
                >

                    <a
                        href="index.html"
                        class="mobile-navigation__link"
                        data-nav="home"
                    >
                        Home
                    </a>


                    <a
                        href="categories.html"
                        class="mobile-navigation__link"
                        data-nav="categories"
                    >
                        Categories
                    </a>


                    <a
                        href="articles.html"
                        class="mobile-navigation__link"
                        data-nav="articles"
                    >
                        Articles
                    </a>


                    <a
                        href="about.html"
                        class="mobile-navigation__link"
                        data-nav="about"
                    >
                        About
                    </a>

                </nav>

            </div>

        </div>
    `;


    /* =====================================================
       Current Page
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    /* =====================================================
       Desktop Active Navigation
    ===================================================== */

    const navLinks =
        header.querySelectorAll(
            ".navbar__link"
        );


    navLinks.forEach(link => {

        const href =
            link.getAttribute("href");


        if (
            href === currentPage ||
            (
                currentPage === "" &&
                href === "index.html"
            )
        ) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            link.classList.remove("active");

            link.removeAttribute(
                "aria-current"
            );

        }

    });


    /* =====================================================
       Mobile Active Navigation
    ===================================================== */

    const mobileLinks =
        header.querySelectorAll(
            ".mobile-navigation__link"
        );


    mobileLinks.forEach(link => {

        const href =
            link.getAttribute("href");


        if (
            href === currentPage ||
            (
                currentPage === "" &&
                href === "index.html"
            )
        ) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            link.classList.remove("active");

            link.removeAttribute(
                "aria-current"
            );

        }

    });


    /* =====================================================
       Mobile Menu Toggle
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


    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                menuButton.getAttribute(
                    "aria-expanded"
                ) === "true";


            menuButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );


            menuButton.setAttribute(
                "aria-label",
                isOpen
                    ? "Open navigation menu"
                    : "Close navigation menu"
            );


            mobileNavigation.setAttribute(
                "aria-hidden",
                String(isOpen)
            );


            mobileNavigation.classList.toggle(
                "is-open",
                !isOpen
            );

        }
    );


    /* =====================================================
       Close Mobile Menu After Navigation
    ===================================================== */

    mobileLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

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


                mobileNavigation.classList.remove(
                    "is-open"
                );

            }
        );

    });

}
