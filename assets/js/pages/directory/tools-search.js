/* =========================================================
   ToolZen Hub
   All Tools search

   Searches the LIVE tools of every section with the shared search
   (utils/search.js over data/search-index.js), so it never needs
   to know which section a tool belongs to and a section added
   later is searched automatically. A tool that is not built yet
   is not found.

   The form is a plain GET to /tools.html?q=..., so a search can
   be reloaded, bookmarked and shared, and the browser's Back
   button works. The search code is loaded only when there is a
   query.

   With results: the matching tools replace the directory below.
   With none: a short message and a way back to browsing, and the
   directory stays visible.
========================================================= */

import {
    ROUTES
} from "../../routes.js";

import {
    escapeHTML
} from "../../ui/escape.js";


function resultCard(entry) {

    return `
                        <a
                            href="${entry.route}"
                            class="directory-result"
                        >

                            <span class="directory-result__meta">
                                ${escapeHTML(entry.sectionTitle)} › ${escapeHTML(entry.categoryTitle)}
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


export async function initializeToolsSearch() {

    const params =
        new URLSearchParams(window.location.search);

    const query =
        (params.get("q") || "").trim();

    const input =
        document.getElementById("directory-search-input");

    const results =
        document.getElementById("tools-results");

    const directory =
        document.getElementById("tools-directory");

    if (!input || !results || !directory) {
        return;
    }

    input.value = query;

    if (!query) {
        return;
    }

    /* a search-result URL is not a page to index: the clean page is */
    const robots = document.createElement("meta");

    robots.name = "robots";
    robots.content = "noindex, follow";

    document.head.append(robots);

    const { search } =
        await import("../../utils/search.js");

    const found =
        search(query, { types: ["tool"] })
            .filter(entry => entry.route);

    const shown = escapeHTML(query);

    if (found.length === 0) {

        results.innerHTML = `
                <div class="directory-results__empty">

                    <p>
                        No tools found for “${shown}”.
                        Try another search, or browse all tools below.
                    </p>

                    <a
                        href="${ROUTES.tools}"
                        class="directory-results__clear"
                    >
                        Clear search
                    </a>

                </div>`;

        directory.hidden = false;

        return;

    }

    results.innerHTML = `
                <div class="directory-results__header">

                    <p class="directory-results__count">
                        ${found.length} ${found.length === 1 ? "tool" : "tools"} found for “${shown}”
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

}
