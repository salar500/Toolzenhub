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

import { iconSvg } from "../../ui/icons.js";
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
    getToolsBySection,
    getDirectToolsBySection,
    getCategoryUrl
} from "../../data/taxonomy.js";

import {
    renderBreadcrumb
} from "../../components/breadcrumb.js";

import {
    toolCardHtml
} from "../../components/category-tool-card.js";

import {
    getToolById
} from "../../data/tools.js";

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
                    action="${ROUTES.tools}"
                    method="get"
                    role="search"
                    data-tools-search
                >

                    <label
                        class="directory-search__label"
                        for="directory-search-input"
                    >
                        Search tools
                    </label>

                    <div class="directory-search__row tz-search">

                        <span class="tz-search__icon" aria-hidden="true">${iconSvg("search")}</span>

                        <input
                            type="search"
                            id="directory-search-input"
                            name="q"
                            class="directory-search__input tz-search__input"
                            placeholder="Search by name, for example EMI or GST"
                            autocomplete="off"
                        >

                        <button
                            type="submit"
                            class="directory-search__button tz-search__button"
                            aria-label="Search"
                        >
                            ${iconSvg("search")}
                        </button>

                    </div>

                </form>

                <div
                    id="tools-results"
                    class="directory-results"
                    role="status"
                    aria-live="polite"
                ></div>`;

}


/* =========================================================
   ALL TOOLS

   One block per major section. Calculators is the only
   section with tools today, so it is the only block; a
   section is added here by adding it to data/categories.js.
========================================================= */

const hasLiveTools = (section) =>
    getToolsBySection(section.id).some(tool => tool.available);

function sectionBlock(section) {

    return getCategoriesBySection(section.id).length > 0
        ? categorySectionBlock(section)
        : directSectionBlock(section);

}

/* a section whose tools sit directly under it (no categories), such as Time Tools */
function directSectionBlock(section) {

    const live =
        getDirectToolsBySection(section.id).filter(tool => tool.available);

    return `
                <section
                    class="directory-section"
                    aria-labelledby="directory-${section.id}-heading"
                >

                    <div class="directory-section__header">

                        <span class="directory-section__label">
                            Section
                        </span>

                        <h2
                            class="directory-section__title"
                            id="directory-${section.id}-heading"
                        >
                            <a href="${ROUTES[section.landing]}">${escapeHTML(section.title)}</a>
                        </h2>

                        <p class="directory-section__text">
                            ${escapeHTML(section.description)}
                            <span class="directory-section__count">${live.length} ${live.length === 1 ? "tool" : "tools"}</span>
                        </p>

                    </div>

                    <div class="directory-groups">
                        ${live.map(tool => `
                        <article class="directory-group directory-group--tool">

                            <h3 class="directory-group__title">
                                <a href="${tool.href}">${escapeHTML(tool.title)}</a>
                            </h3>

                            <p class="directory-group__text">
                                ${escapeHTML(tool.description)}
                            </p>

                        </article>`).join("")}
                    </div>

                    ${section.id === "practice-labs" ? practiceLabsLink() : ""}

                </section>`;

}

function categorySectionBlock(section) {

    /* only categories with live tools are shown; roadmap categories stay in the catalog but are not listed (owner, 2026-10-31) */
    const categories = getCategoriesBySection(section.id)
        .filter(hasTools)
        .filter(category => liveTools(category.id).length > 0);

    const sectionHref =
        ROUTES[section.landing];

    const liveCount =
        categories.reduce(
            (total, category) =>
                total + liveTools(category.id).length,
            0
        );

    const more =
        section.id === "calculators"
            ? `<p class="directory-section__more">
                        <a href="${ROUTES.calculators}">Browse all calculators →</a>
                    </p>`
            : "";

    return `
                <section
                    class="directory-section"
                    aria-labelledby="directory-${section.id}-heading"
                >

                    <div class="directory-section__header">

                        <span class="directory-section__label">
                            Section
                        </span>

                        <h2
                            class="directory-section__title"
                            id="directory-${section.id}-heading"
                        >
                            <a href="${sectionHref}">${escapeHTML(section.title)}</a>
                        </h2>

                        <p class="directory-section__text">
                            ${escapeHTML(section.description)}
                            <span class="directory-section__count">${liveCount} tools</span>
                        </p>

                    </div>

                    <div class="directory-groups">
                        ${categories.map(categoryGroup).join("")}
                    </div>

                    ${more}

                </section>`;

}

function categoryGroup(category) {

    const live = liveTools(category.id);

    return `
                        <article class="directory-group">

                            <h3 class="directory-group__title">
                                <a href="${getCategoryUrl(category.id)}">${escapeHTML(category.title)}</a>
                            </h3>

                            <p class="directory-group__text">
                                ${escapeHTML(category.description)}
                            </p>

                            <ul class="directory-group__tools">
                                ${live.map(tool => `<li class="directory-tool">
                                    <a href="${tool.href}">${escapeHTML(tool.title)}</a>
                                    <span class="directory-tool__text">${escapeHTML(tool.description)}</span>
                                </li>`).join("")}
                            </ul>

                        </article>`;

}

/* The page-scoped section index (rulebook 4.8 exception): a sticky rail from 960px, chips below.
   The counts are the live tools the sections themselves list, from the same catalog. */
function sectionRail(visibleSections) {

    return `
                    <nav class="directory-rail" aria-label="Tool sections">

                        <ul class="directory-rail__list">
                            ${visibleSections.map(section => {

                                const count =
                                    getToolsBySection(section.id).filter(tool => tool.available).length;

                                return `<li>
                                <a class="directory-rail__link" href="#directory-${section.id}-heading">
                                    <span class="directory-rail__name">${escapeHTML(section.title)}</span>
                                    <span class="directory-rail__count">${count}</span>
                                </a>
                            </li>`;

                            }).join("")}
                        </ul>

                    </nav>`;

}

export function allToolsHtml() {

    const visibleSections = sections.filter(hasLiveTools);

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
                        Search or browse every ToolZen Hub tool, by section and category.
                    </p>

                </div>

                <div class="directory-layout">

                    ${sectionRail(visibleSections)}

                    <div class="directory-layout__main">

                        ${searchForm()}

                        <div id="tools-directory">
                            ${visibleSections.map(sectionBlock).join("")}
                        </div>

                    </div>

                </div>

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

                <h2 class="categories-detail__heading">${escapeHTML(category.title)} calculators</h2>

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


/* =========================================================
   SECTION PAGE

   A section without categories has a page of its own that lists
   its tools directly (Time Tools). The Calculators section's page
   is the categories page, written by hand.
========================================================= */

export function sectionPageIds() {

    return sections
        .filter(
            section =>
                getCategoriesBySection(section.id).length === 0 &&
                section.seoDescription &&
                getDirectToolsBySection(section.id).some(tool => tool.available)
        )
        .map(section => section.id);

}

export function sectionPageHtml(sectionId) {

    const section =
        sections.find(item => item.id === sectionId);

    const tools =
        getDirectToolsBySection(sectionId);

    /* the card icon takes its colour from this stand-in for a category */
    const look = {
        iconClass: "time",
        iconKey: section.id
    };

    return `
    <main id="app">

        <section class="categories-page directory-page">

            <div class="container">

                ${renderBreadcrumb([
                    { label: "All Tools", href: ROUTES.tools },
                    { label: section.title }
                ])}

                <div class="categories-page__intro">

                    <span class="categories-page__eyebrow">
                        Section
                    </span>

                    <h1 class="categories-page__title">
                        ${escapeHTML(section.title)}
                    </h1>

                    <p class="categories-page__description">
                        ${escapeHTML(section.description)}
                    </p>

                </div>

                <h2 class="categories-detail__heading">${escapeHTML(section.title)} tools</h2>

                <div class="categories-detail__grid directory-tools">
                    ${tools.map(tool => toolCardHtml(tool, look)).join("")}
                </div>

                ${sectionId === "developer-tools" ? practiceLabsLink() : ""}

                <p class="directory-section__more">
                    <a href="${ROUTES.tools}">← All tools</a>
                </p>

            </div>

        </section>

    </main>`;

}


/* =========================================================
   PRACTICE LABS HUB

   The landing page of the Practice Labs section (2026-11-04: the
   labs and flashcards left Developer Tools). It is written by hand
   rather than generated as a section page, and lists the section's
   tools.
   The list is the catalog's own, so a lab that is not live never
   appears.
========================================================= */

const PRACTICE_LAB_IDS = ["json-error-fixing-lab", "jsonpath-challenge-lab", "cron-challenge-lab", "test-design-lab"];
const REVISION_IDS = ["smart-flashcards"];

const liveByIds = ids => ids.map(id => getToolById(id)).filter(tool => tool && tool.available);

export function practiceLabsHtml() {

    const labs = liveByIds(PRACTICE_LAB_IDS);
    const revision = liveByIds(REVISION_IDS);
    const look = { iconClass: "time", iconKey: "practice-labs" };

    const group = (title, text, tools) => tools.length === 0 ? "" : `
                <section class="practice-labs__group" aria-labelledby="practice-labs-${title.toLowerCase()}">

                    <h2 class="practice-labs__title" id="practice-labs-${title.toLowerCase()}">${escapeHTML(title)}</h2>

                    <p class="practice-labs__text">${escapeHTML(text)}</p>

                    <div class="categories-detail__grid directory-tools">
                        ${tools.map(tool => toolCardHtml(tool, look)).join("")}
                    </div>

                </section>`;

    return `
    <main id="app">

        <section class="categories-page directory-page">

            <div class="container">

                ${renderBreadcrumb([
                    { label: "All Tools", href: ROUTES.tools },
                    { label: "Practice Labs" }
                ])}

                <div class="categories-page__intro">

                    <span class="categories-page__eyebrow">
                        Learn by doing
                    </span>

                    <h1 class="categories-page__title">
                        Practice Labs
                    </h1>

                    <p class="categories-page__description">
                        Short hands-on exercises for JSON, APIs, scheduling and software testing. Each one checks your answer and explains it. They run in your browser and nothing is uploaded.
                    </p>

                </div>

                ${group("Practice", "Exercises with an exact rule, so your answer is checked rather than guessed. The labs keep nothing: your answers are not stored or sent anywhere.", labs)}

                ${group("Revision", "Original flashcards for revision. Revision dates are saved on this device only if you turn saving on.", revision)}

                <p class="directory-section__more">
                    <a href="${ROUTES.tools}">All Tools →</a>
                </p>

            </div>

        </section>

    </main>`;

}

const practiceLabsLink = () => `
                <p class="directory-section__more">
                    <a href="${ROUTES.practiceLabs}">Practice Labs: exercises and flashcards →</a>
                </p>`;
