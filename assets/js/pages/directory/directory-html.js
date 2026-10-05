/* =========================================================
   ToolZen Hub
   Directory pages: All Tools and the calculator category pages

   Used while the site is built (never shipped to the browser):
   each function returns the finished <main> content of a page.
   Everything is derived from the hierarchy data
   (data/categories.js, data/taxonomy.js) and the tool catalog,
   so a tool, a category or a section that is added there shows
   up here without editing this file.

       Home -> All Tools -> Section (Calculators) -> Category -> Tool

   A tool is a link only when it is live. A category with no live
   tool has no page of its own: it is shown as "Coming soon" and
   is not a link.
========================================================= */

import {
    ROUTES
} from "../../routes.js";

import {
    sections
} from "../../data/categories.js";

import {
    getCategory,
    getCategoriesBySection,
    getToolsByCategory,
    getCategoryUrl
} from "../../data/taxonomy.js";

import {
    renderBreadcrumb
} from "../../components/breadcrumb.js";

import {
    toolCardHtml
} from "../../components/category-tool-card.js";

import {
    escapeHTML
} from "../../ui/escape.js";


/* =========================================================
   HELPERS
========================================================= */

const liveTools = (categoryId) =>
    getToolsByCategory(categoryId).filter(tool => tool.available);

const hasTools = (category) =>
    getToolsByCategory(category.id).length > 0;

function searchForm() {

    return `
                <form
                    class="directory-search"
                    action="${ROUTES.categories}"
                    method="get"
                    role="search"
                >

                    <label
                        class="directory-search__label"
                        for="directory-search-input"
                    >
                        Search calculators and tools
                    </label>

                    <div class="directory-search__row">

                        <input
                            type="search"
                            id="directory-search-input"
                            name="q"
                            class="directory-search__input"
                            placeholder="Search calculators..."
                            autocomplete="off"
                        >

                        <button
                            type="submit"
                            class="directory-search__button"
                        >
                            Search
                        </button>

                    </div>

                </form>`;

}


/* =========================================================
   ALL TOOLS

   One block per major section. Calculators is the only
   section with tools today, so it is the only block; a
   section is added here by adding it to data/categories.js.
========================================================= */

function sectionBlock(section) {

    /* categories with live tools first, then those that are only coming soon */
    const categories =
        getCategoriesBySection(section.id)
            .filter(hasTools)
            .sort(
                (a, b) =>
                    Number(liveTools(b.id).length > 0) -
                    Number(liveTools(a.id).length > 0)
            );

    const sectionHref =
        ROUTES[section.landing];

    return `
                <section
                    class="directory-section"
                    aria-labelledby="directory-${section.id}-heading"
                >

                    <div class="directory-section__header">

                        <h2
                            class="directory-section__title"
                            id="directory-${section.id}-heading"
                        >
                            <a href="${sectionHref}">${escapeHTML(section.title)}</a>
                        </h2>

                        <p class="directory-section__text">
                            ${escapeHTML(section.description)}
                        </p>

                    </div>

                    <div class="directory-groups">
                        ${categories.map(categoryGroup).join("")}
                    </div>

                    <p class="directory-section__more">
                        <a href="${ROUTES.calculators}">Browse all calculators →</a>
                    </p>

                </section>`;

}

function categoryGroup(category) {

    const live = liveTools(category.id);

    const heading =
        live.length > 0
            ? `<a href="${getCategoryUrl(category.id)}">${escapeHTML(category.title)}</a>`
            : escapeHTML(category.title);

    const body =
        live.length > 0
            ? `<ul class="directory-group__tools">
                            ${live.map(tool => `<li><a href="${tool.href}">${escapeHTML(tool.title)}</a></li>`).join("\n                            ")}
                        </ul>`
            : `<p class="directory-group__soon">
                            <span class="coming-soon-badge">Coming soon</span>
                        </p>`;

    return `
                        <article class="directory-group${live.length > 0 ? "" : " directory-group--soon"}">

                            <h3 class="directory-group__title">
                                ${heading}
                            </h3>

                            <p class="directory-group__text">
                                ${escapeHTML(category.description)}
                            </p>

                            ${body}

                        </article>`;

}

export function allToolsHtml() {

    return `
    <main id="app">

        <section class="categories-page directory-page">

            <div class="container">

                ${renderBreadcrumb([{ label: "All Tools" }])}

                <div class="categories-page__intro">

                    <span class="categories-page__eyebrow">
                        Explore
                    </span>

                    <h1 class="categories-page__title">
                        All Tools
                    </h1>

                    <p class="categories-page__description">
                        Every ToolZen Hub tool, by section and category.
                    </p>

                </div>

                ${searchForm()}

                ${sections.map(sectionBlock).join("")}

            </div>

        </section>

    </main>`;

}


/* =========================================================
   CATEGORY PAGE

   Home -> Calculators -> <Category>. Lists the category's tools
   as cards: live tools are links, tools that are not built yet
   are "Coming soon" cards that are not.
========================================================= */

/*
 * The categories that get one of these pages: those with live
 * tools and a landing page named in data/categories.js whose
 * route is not an older hand-written page (Loans).
 */

export function categoryPageIds() {

    return sections.flatMap(
        section =>
            getCategoriesBySection(section.id)
                .filter(category =>
                    category.landing &&
                    category.seoDescription &&
                    liveTools(category.id).length > 0
                )
                .map(category => category.id)
    );

}

export function categoryPageHtml(categoryId) {

    const category =
        getCategory(categoryId);

    const section =
        sections.find(item => item.id === category.sectionId);

    const tools =
        getToolsByCategory(categoryId);

    return `
    <main id="app">

        <section class="categories-page directory-page">

            <div class="container">

                ${renderBreadcrumb([
                    { label: section.title, href: ROUTES[section.landing] },
                    { label: category.title }
                ])}

                <div class="categories-page__intro">

                    <span class="categories-page__eyebrow">
                        ${escapeHTML(section.title)}
                    </span>

                    <h1 class="categories-page__title">
                        ${escapeHTML(category.title)} Calculators
                    </h1>

                    <p class="categories-page__description">
                        ${escapeHTML(category.description)}
                    </p>

                </div>

                <div class="categories-detail__grid directory-tools">
                    ${tools.map(tool => toolCardHtml(tool, category)).join("")}
                </div>

                <p class="directory-section__more">
                    <a href="${ROUTES.categories}">← All calculator categories</a>
                </p>

            </div>

        </section>

    </main>`;

}
