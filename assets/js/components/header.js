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

            <div class="container">

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

                    <ul class="navbar__menu">

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
                        >

                            <span></span>
                            <span></span>
                            <span></span>

                        </button>

                    </div>

                </nav>

            </div>

        </div>
    `;


    /* =====================================================
       Active Navigation
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    const navLinks =
        header.querySelectorAll(".navbar__link");


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

        } else {

            link.classList.remove("active");

        }

    });

}
