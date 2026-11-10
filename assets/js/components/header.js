/* =========================================================
   ToolZen Hub
   Global Header Component
========================================================= */

import { ROUTES } from "../routes.js";
import { logoMark } from "../ui/logo.js";


/* =========================================================
   HEADER MARKUP

   Pure: returns the header HTML. The site build calls it to
   put the header into every generated page; renderHeader()
   calls it only when a page does not already contain it.
========================================================= */

/* =========================================================
   TOOLS AREA

   "All Tools" is lit for every page that sits under it: each
   section page and category page, and every tool (calculators at
   /calculators/<id>/, all other tools at /tools/<id>/).
========================================================= */

const TOOLS_AREA_PAGES = [
    "tools.html",
    "categories.html",
    "calculators.html",
    "loans.html",
    "investment.html",
    "business.html",
    "tax.html",
    "math.html",
    "health.html",
    "converter.html",
    "time-tools.html",
    "developer-tools.html",
    "image-tools.html",
    "pdf-tools.html",
    "practice-labs.html",
    "ai-tools.html"
];

function inToolsArea(
    pathname
) {

    return (
        TOOLS_AREA_PAGES.some(
            page =>
                pathname.endsWith(`/${page}`)
        ) ||
        pathname.includes("/calculators/") ||
        pathname.includes("/tools/")
    );

}


export function headerMarkup() {

    return `

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

                    <span class="brand-logo" aria-hidden="true">
                        ${logoMark()}
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
                                href="${ROUTES.tools}"
                                class="navbar__link"
                                data-nav="tools"
                            >
                                All Tools
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
                            href="${ROUTES.tools}"
                            class="mobile-navigation__link"
                            data-nav="tools"
                        >
                            All Tools
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

}


/* =========================================================
   HEADER BEHAVIOUR

   Binds the active link, the mobile menu and its listeners.
   Safe to call more than once for the same header.
========================================================= */

const boundHeaders = new WeakSet();


export function renderHeader() {

    const header = document.getElementById("header");

    if (!header) {
        return;
    }


    /*
     * Generated pages already contain the header.
     */

    if (!header.querySelector(".site-header")) {

        header.innerHTML = headerMarkup();

    } else if (boundHeaders.has(header)) {

        return;

    }

    boundHeaders.add(header);


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
                href === ROUTES.tools &&
                inToolsArea(pathname)
            ) ||
            (
                href === ROUTES.home &&
                (
                    pathname === "/Toolzenhub" ||
                    pathname === "/Toolzenhub/" ||
                    pathname === "/Toolzenhub/index.html" ||
                    pathname === "/index.html" ||
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

       The menu is modal while open: the rest of the page is made
       inert (not reachable by keyboard or screen reader), Tab stays
       inside the button and the links, the page does not scroll, and
       a click on the dimmed backdrop closes it.
    ===================================================== */

    const inertSiblings = [];

    function setPageInert(on) {

        if (on) {

            for (const el of document.body.children) {

                if (
                    el === header ||
                    el.tagName === "SCRIPT" ||
                    el.hasAttribute("inert")
                ) {
                    continue;
                }

                el.setAttribute("inert", "");
                inertSiblings.push(el);

            }

        } else {

            while (inertSiblings.length) {
                inertSiblings.pop().removeAttribute("inert");
            }

        }

    }


    function closeMobileMenu(restoreFocus = false) {

        const wasOpen =
            mobileNavigation.classList.contains("is-open");

        mobileNavigation.classList.remove("is-open");
        menuButton.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
        mobileNavigation.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("menu-open");
        setPageInert(false);

        if (wasOpen && restoreFocus) {
            menuButton.focus();
        }

    }


    function openMobileMenu() {

        mobileNavigation.classList.add("is-open");
        menuButton.classList.add("is-open");
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation menu");
        mobileNavigation.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("menu-open");
        setPageInert(true);

    }


    /* Tab and Shift+Tab wrap between the button and the links */

    function trapTab(event) {

        if (
            event.key !== "Tab" ||
            !mobileNavigation.classList.contains("is-open")
        ) {
            return;
        }

        const stops = [
            menuButton,
            ...mobileNavigation.querySelectorAll(
                ".mobile-navigation__link"
            )
        ];

        const first = stops[0];
        const last = stops[stops.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {

            event.preventDefault();
            last.focus();

        } else if (!event.shiftKey && active === last) {

            event.preventDefault();
            first.focus();

        } else if (!stops.includes(active)) {

            event.preventDefault();
            first.focus();

        }

    }


    /* A click on the backdrop (the container, not the panel) closes */

    mobileNavigation.addEventListener(
        "click",
        event => {

            if (event.target === mobileNavigation) {
                closeMobileMenu(true);
            }

        }
    );


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

                closeMobileMenu(true);

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

                closeMobileMenu(true);

            }

            trapTab(event);

        }
    );


    /* =====================================================
       BELOW 960 PX: HIDE WHILE SCROLLING DOWN, SHOW ON SCROLL UP
       (from 960 px the header is simply sticky; see header.css)
    ===================================================== */

    let lastY = window.scrollY;

    const setHidden = (hidden) => document.documentElement.classList.toggle("header-hidden", hidden);

    window.addEventListener(
        "scroll",
        () => {

            const y = window.scrollY;
            const menuOpen = document.documentElement.classList.contains("menu-open") || menuButton.getAttribute("aria-expanded") === "true";

            if (window.innerWidth >= 960 || menuOpen || y < 80) setHidden(false);
            else if (y > lastY + 6) setHidden(true);
            else if (y < lastY - 6) setHidden(false);

            lastY = y;

        },
        { passive: true }
    );

    /* keyboard users who tab into the header always see it */
    document.getElementById("header")?.addEventListener("focusin", () => setHidden(false));


    /* =====================================================
       CLOSE MOBILE MENU WHEN RESIZING TO DESKTOP
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth >= 960) {

                closeMobileMenu();

            }

        }
    );

}
