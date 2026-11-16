/* =========================================================
   ToolZen Hub
   All Tools search

   Searches the LIVE tools of every section with the shared search
   (utils/search.js over data/search-index.js), so it never needs
   to know which section a tool belongs to and a section added
   later is searched automatically. A tool that is not built yet
   is not found.

   Results follow the box as the visitor types (owner, 2026-11-16),
   after a short pause so a fast typist does not redraw the page on
   every key; Enter and the search button show them at once. The
   address keeps ?q=... in step (replaced, not pushed), so a search
   can be reloaded, bookmarked and shared. Without script the form
   is still a plain GET to /tools.html?q=.... The search code is
   loaded only when there is a query.

   With results: the matching tools replace the directory below.
   With none: a short message and a way back to browsing, and the
   directory stays visible. An empty box puts the full directory
   back. Only the count is announced, in its own status line.
========================================================= */

import {
    ROUTES
} from "../../routes.js";

import {
    escapeHTML
} from "../../ui/escape.js";


const TYPING_PAUSE_MS = 200;


function resultCard(entry) {

    return `
                        <a
                            href="${entry.route}"
                            class="directory-result"
                        >

                            <span class="directory-result__meta">
                                ${escapeHTML(entry.categoryTitle ? `${entry.sectionTitle} › ${entry.categoryTitle}` : entry.sectionTitle)}
                            </span>

                            <span class="directory-result__title">
                                ${escapeHTML(entry.title)}
                            </span>

                            <span class="directory-result__text">
                                ${escapeHTML(entry.description)}
                            </span>

                            <span
                                class="directory-result__arrow"
                                aria-hidden="true"
                            >
                                →
                            </span>

                        </a>`;

}


/* The section links of the no-result message, taken from the page's own sidebar (each section's overview link),
   so a section added to the catalog appears here without a second list. */
function sectionLinks() {

    const links = [...document.querySelectorAll("a.section-switcher__section")].map(a =>
        `<a href="${escapeHTML(a.getAttribute("href") || "")}">${escapeHTML((a.dataset.name || a.textContent).trim())}</a>`);

    return links.length
        ? `<p class="directory-results__sections">Browse by section: ${links.join("")}</p>`
        : "";

}


/* a search-result URL is not a page to index: the clean page is */
function setNoindex(on) {

    const existing = document.head.querySelector("meta[data-directory-results]");

    if (!on) {
        existing?.remove();
        return;
    }

    if (existing) {
        return;
    }

    const robots = document.createElement("meta");

    robots.name = "robots";
    robots.content = "noindex, follow";
    robots.dataset.directoryResults = "";

    document.head.append(robots);

}


export async function initializeToolsSearch() {

    const query =
        (new URLSearchParams(window.location.search).get("q") || "").trim();

    const form =
        document.querySelector("form[data-tools-search]");

    const input =
        document.getElementById("directory-search-input");

    const results =
        document.getElementById("tools-results");

    const status =
        document.getElementById("tools-results-status");

    const directory =
        document.getElementById("tools-directory");

    if (!input || !results || !directory) {
        return;
    }

    /* A section link (the rail on a wide screen, the chips on a phone) scrolls to its heading; focus moves there
       too, so a keyboard or screen-reader user continues from the section they chose, not from the link. */
    document.addEventListener("click", event => {

        const link = event.target.closest && event.target.closest("a.directory-rail__link");

        if (!link) {
            return;
        }

        const heading = document.getElementById((link.getAttribute("href") || "").replace(/^#/, ""));

        if (!heading) {
            return;
        }

        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });

    });

    let searchModule = null;
    let latest = 0;          // the newest query asked for; an older one that finishes later is dropped
    let shownQuery = "";
    let timer = 0;

    const announce = (text) => {
        if (status) status.textContent = text;
    };

    const keepAddress = (value) => {
        const url = value ? `${window.location.pathname}?q=${encodeURIComponent(value)}` : window.location.pathname;
        window.history.replaceState(window.history.state, "", url);
    };

    const clearResults = () => {

        latest += 1;
        shownQuery = "";

        results.innerHTML = "";
        directory.hidden = false;

        setNoindex(false);
        announce("");

    };

    const show = async (value) => {

        if (!value) {
            clearResults();
            return;
        }

        if (value === shownQuery) {
            return;
        }

        const ticket = ++latest;

        searchModule ??= import("../../utils/search.js");

        const { search } = await searchModule;

        if (ticket !== latest) {
            return;
        }

        shownQuery = value;
        setNoindex(true);

        const found =
            search(value, { types: ["tool", "page"] })
                .filter(entry => entry.route);

        const shown = escapeHTML(value);

        if (found.length === 0) {

            results.innerHTML = `
                <div class="directory-results__empty">

                    <p>
                        No tools found for “${shown}”.
                        Try another search, or browse all tools below.
                    </p>

                    ${sectionLinks()}

                    <a
                        href="${ROUTES.tools}"
                        class="directory-results__clear"
                    >
                        Clear search
                    </a>

                </div>`;

            directory.hidden = false;
            announce(`No tools found for ${value}.`);

            return;

        }

        const countText = `${found.length} ${found.length === 1 ? "tool" : "tools"} found for “${value}”`;

        results.innerHTML = `
                <div class="directory-results__header">

                    <p class="directory-results__count">
                        ${escapeHTML(countText)}
                    </p>

                    <a
                        href="${ROUTES.tools}"
                        class="directory-results__clear"
                    >
                        Browse all tools
                    </a>

                </div>

                <div class="directory-results__grid">
                    ${found.map(resultCard).join("")}
                </div>`;

        directory.hidden = true;
        announce(countText);

    };

    input.value = query;

    input.addEventListener("input", () => {

        const value = input.value.trim();

        window.clearTimeout(timer);

        /* emptying the box (or leaving only spaces) puts the unfiltered page back at once */
        if (!value) {
            keepAddress("");
            clearResults();
            return;
        }

        timer = window.setTimeout(() => {
            keepAddress(value);
            show(value);
        }, TYPING_PAUSE_MS);

    });

    /* Enter or the button: the results now, without reloading the page */
    form?.addEventListener("submit", event => {

        event.preventDefault();
        window.clearTimeout(timer);

        const value = input.value.trim();

        keepAddress(value);

        if (!value) {
            clearResults();
            input.focus();
            return;
        }

        show(value);

    });

    if (query) {
        await show(query);
    }

}
