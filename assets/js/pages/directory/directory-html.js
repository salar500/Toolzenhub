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

import { PRACTICE_LABS_PREFIX } from "../../practice-labs/curriculum.js";
import { iconSvg } from "../../ui/icons.js";
import { renderSectionNav } from "../../components/section-switcher.js";
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
    getSectionPages,
    getSectionListing,
    sectionListsToolsDirectly,
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

import {
    AI_PRODUCTS,
    AI_CATEGORIES,
    AI_AUDIENCES,
    PRICING,
    KINDS
} from "../../data/ai-directory.js";


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

                <p
                    id="tools-results-status"
                    class="directory-results__status"
                    role="status"
                    aria-live="polite"
                ></p>

                <div
                    id="tools-results"
                    class="directory-results"
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

    return sectionListsToolsDirectly(section.id)
        ? directSectionBlock(section)
        : categorySectionBlock(section);

}

/* a section whose tools are listed directly under it (no category groups), such as Time Tools and AI Tools */
function directSectionBlock(section) {

    const live = [
        ...getDirectToolsBySection(section.id).filter(tool => tool.available),
        ...getSectionPages(section.id)
    ];

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

/* The All Tools sidebar: the same section-switcher markup, styling, collapsing groups and phone drawer as every ecosystem
   (components/section-switcher.js, ui/section-rail.js), one group per section with its overview and its live tools. The tools hub
   spans every section, so it keeps ordinary page navigation (data-workspace="off" for ui/workspace-nav.js). */
function allToolsRail(visibleSections) {

    const total = visibleSections.reduce((sum, section) => sum + getSectionListing(section.id).length, 0);

    const groups = visibleSections.map(section => {

        const live = getSectionListing(section.id);

        return `
                            <li class="section-switcher__group" data-open="false">
                                <span class="section-switcher__label">${escapeHTML(section.title)}</span>
                                <ul>
                                    <li><a class="section-switcher__section" data-name="${escapeHTML(section.title)}" href="${escapeHTML(ROUTES[section.landing])}">${escapeHTML(section.title)} overview</a></li>
                                    ${live.map(tool => `<li><a href="${tool.href}">${escapeHTML(tool.title)}</a></li>`).join("")}
                                </ul>
                            </li>`;

    }).join("");

    return `
                <nav class="section-switcher" data-workspace="off" aria-label="All Tools: switch section">
                    <details>
                        <summary>
                            <span>All Tools</span>
                            <span class="section-switcher__now">All Tools overview</span>
                            <span class="section-switcher__count">${total}</span>
                        </summary>
                        <p class="section-switcher__overview"><a href="${escapeHTML(ROUTES.tools)}" aria-current="page">All Tools overview</a></p>
                        <ul class="section-switcher__list">${groups}
                        </ul>
                    </details>
                </nav>`;

}

export function allToolsHtml() {

    const visibleSections = sections.filter(hasLiveTools);

    return `
    <main id="app">

        <section class="categories-page directory-page">

            <div class="container container--workspace">

                ${renderBreadcrumb([{ label: "All Tools" }])}

                <div class="ecosystem-layout" data-section-page>

                ${allToolsRail(visibleSections)}

                <div class="ecosystem-main">

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

/* =========================================================
   ECOSYSTEM WORKSPACE

   The sidebar of the ecosystem on the left, the page content on the right (rulebook 4.8). The sidebar is the same build-time list a
   tool page carries (components/section-switcher.js), so a visitor can move from the ecosystem or category page to any tool of it
   and between tools without coming back here. A page whose section has fewer than two live tools gets the content alone.
========================================================= */

function workspaceOpen(sectionId, currentCategoryId = null, currentPageName = null) {

    const nav = renderSectionNav({ sectionId, currentCategoryId, currentPageName });

    return nav
        ? `<div class="ecosystem-layout" data-section-page>
                ${nav}
                <div class="ecosystem-main">`
        : "";

}

function workspaceClose(sectionId) {

    return renderSectionNav({ sectionId }) ? `</div>
            </div>` : "";

}


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

            <div class="container container--workspace">

                ${renderBreadcrumb([
                    { label: section.title, href: ROUTES[section.landing] },
                    { label: category.title }
                ])}

                ${workspaceOpen(section.id, categoryId)}

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

                ${workspaceClose(section.id)}

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
                sectionListsToolsDirectly(section.id) &&
                section.seoDescription &&
                getDirectToolsBySection(section.id).some(tool => tool.available)
        )
        .map(section => section.id);

}

/* AI Home (AI ecosystem programme, 16 D1, 17 §4): the AI Tools page starts with plain links into the Workbench and
   the other AI tools. Links, not a script, so it works when the page is shown by the ecosystem workspace, without
   script and for crawlers; the visitor's words are typed in the Workbench, never put in a URL. */
const AI_START_OUTCOMES = [
    ["content", "Create content"], ["images", "Create images"], ["video", "Create videos"], ["audio", "Create audio"],
    ["software", "Build software"], ["research", "Research and analyse"], ["improve", "Improve existing work"], ["plan", "Plan a multi-step workflow"]
];

export function aiHomeStartHtml() {

    const workbench = ROUTES.tool("tools", "ai-workbench");
    const starts = [
        ["A test plan", `${workbench}?task=test-plan`],
        ["An article", `${workbench}?task=article`],
        ["Debug a problem", `${workbench}?task=debug`],
        ["Continue a project in another AI", `${ROUTES.tool("tools", "context-pack-builder")}?mode=handoff`],
        ["Check an AI answer", ROUTES.tool("tools", "ai-answer-checklist")],
        /* not the AI Directory: the page links it only by its card and its sidebar entry (owner, 2026-11-16) */
        ["Write or reply to an email", `${workbench}?task=email-message`]
    ];
    const chips = (items) => items.map(([label, href]) => `<li><a class="ai-start__chip" href="${escapeHTML(href)}">${escapeHTML(label)}</a></li>`).join("");

    return `
                <section class="ai-start" aria-labelledby="ai-start-title">
                    <h2 id="ai-start-title" class="ai-start__title">What do you want to do with AI?</h2>
                    <p class="ai-start__text">Prepare the work, carry your project between AI products, and check what comes back. Everything runs in your browser; no AI service is called.</p>
                    <a class="calculator-form__button ai-start__primary" href="${escapeHTML(workbench)}?start=describe">Describe your task</a>
                    <p class="ai-start__hint">Type it in your own words; the Workbench shows the closest tasks for you to choose from.</p>
                    <h3 class="ai-start__sub">Or choose an outcome</h3>
                    <ul class="ai-start__chips">${chips(AI_START_OUTCOMES.map(([id, label]) => [label, `${workbench}?outcome=${id}`]))}</ul>
                    <h3 class="ai-start__sub">Common starts</h3>
                    <ul class="ai-start__chips">${chips(starts)}</ul>
                </section>
`;

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

            <div class="container container--workspace">

                ${renderBreadcrumb([
                    { label: "All Tools", href: ROUTES.tools },
                    { label: section.title }
                ])}

                ${workspaceOpen(section.id)}

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
${sectionId === "ai-tools" ? aiHomeStartHtml() : ""}
                <h2 class="categories-detail__heading">${escapeHTML(section.title)} tools</h2>

                <div class="categories-detail__grid directory-tools">
                    ${[...tools, ...getSectionPages(sectionId)].map(tool => toolCardHtml(tool, look)).join("")}
                </div>

                ${sectionId === "developer-tools" ? practiceLabsLink() : ""}

                <p class="directory-section__more">
                    <a href="${ROUTES.tools}">← All tools</a>
                </p>

                ${workspaceClose(section.id)}

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

const PRACTICE_LAB_IDS = ["json-error-fixing-lab", "jsonpath-challenge-lab", "cron-challenge-lab", "test-design-lab", "sql-practice-lab", "excel-practice-lab", "power-bi-practice-lab"];
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

            <div class="container container--workspace">

                ${renderBreadcrumb([
                    { label: "All Tools", href: ROUTES.tools },
                    { label: "Practice Labs" }
                ])}

                ${workspaceOpen("practice-labs")}

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

                <section class="practice-labs__group" aria-labelledby="practice-labs-paths">

                    <h2 class="practice-labs__title" id="practice-labs-paths">Learning paths</h2>

                    <p class="practice-labs__text">Step-by-step routes from Beginner to Advanced, with worked examples, exercises and answers that run in your browser. SQL is available now and more paths are planned.</p>

                    <p class="directory-section__more">
                        <a href="${PRACTICE_LABS_PREFIX}sql/">Start the SQL learning path →</a>
                        <a href="${PRACTICE_LABS_PREFIX}">All learning paths →</a>
                    </p>

                </section>

                ${group("Practice", "Exercises with an exact rule, so your answer is checked rather than guessed. The labs keep nothing: your answers are not stored or sent anywhere.", labs)}

                ${group("Revision", "Original flashcards for revision. Revision dates are saved on this device only if you turn saving on.", revision)}

                <p class="directory-section__more">
                    <a href="${ROUTES.tools}">All Tools →</a>
                </p>

                ${workspaceClose("practice-labs")}

            </div>

        </section>

    </main>`;

}

const practiceLabsLink = () => `
                <p class="directory-section__more">
                    <a href="${ROUTES.practiceLabs}">Practice Labs: exercises and flashcards →</a>
                </p>`;

/* =========================================================
   AI PRODUCTS DIRECTORY (/ai-tools/directory/)

   External products, grouped by category, every card plain
   HTML so the page works and is crawlable without script;
   assets/js/entries/ai-directory.js adds the search and the
   category and audience filters. Data: data/ai-directory.js.
========================================================= */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

function aiProductCard(product) {

    const audiences = AI_AUDIENCES.filter((a) => product.audiences.includes(a.id));
    const search = [product.name, product.by, product.summary, product.note, ...product.access, ...product.categories.map((c) => AI_CATEGORIES.find((x) => x.id === c).label), ...audiences.map((a) => a.label)].join(" ").toLowerCase();

    return `
                        <li class="ai-card" data-categories="${escapeHTML(product.categories.join(" "))}" data-audiences="${escapeHTML(product.audiences.join(" "))}" data-search="${escapeHTML(search)}">
                            <article aria-labelledby="ai-${escapeHTML(product.id)}">
                                <div class="ai-card__head">
                                    <h3 id="ai-${escapeHTML(product.id)}" class="ai-card__name">${escapeHTML(product.name)}</h3>
                                    <span class="ai-card__kind">${escapeHTML(KINDS[product.kind])}${product.by && product.by !== product.name ? ` · ${escapeHTML(product.by)}` : ""}</span>
                                </div>
                                <p class="ai-card__summary">${escapeHTML(product.summary)}</p>
                                ${product.note ? `<p class="ai-card__note">${escapeHTML(product.note)}</p>` : ""}
                                <dl class="ai-card__facts">
                                    ${product.access.length ? `<div><dt>Where</dt><dd>${escapeHTML(product.access.join(", "))}</dd></div>` : ""}
                                    <div><dt>Pricing</dt><dd>${escapeHTML(PRICING[product.pricing])}</dd></div>
                                    <div><dt>Useful for</dt><dd>${escapeHTML(audiences.map((a) => a.label).join(", "))}</dd></div>
                                </dl>
                                <p class="ai-card__foot">
                                    <a class="ai-card__link" href="${escapeHTML(product.url)}" target="_blank" rel="noopener noreferrer">Official site<span class="ai-card__sr">: ${escapeHTML(product.name)}, opens in a new tab</span> <span aria-hidden="true">↗</span></a>
                                    <span class="ai-card__checked">Checked ${escapeHTML(longDate(product.verifiedOn))}</span>
                                </p>
                                <p class="ai-card__plan"><a href="${escapeHTML(ROUTES.tool("tools", "ai-workbench"))}?product=${encodeURIComponent(product.id)}">Plan a task with ${escapeHTML(product.name)}</a></p>
                            </article>
                        </li>`;

}

export function aiDirectoryHtml() {

    const groups = AI_CATEGORIES
        .map((category) => ({ category, products: AI_PRODUCTS.filter((p) => p.categories[0] === category.id) }))
        .filter((g) => g.products.length);

    const chip = (name, value, label, checked) => `
                            <label class="ai-chip"><input type="radio" name="${name}" value="${escapeHTML(value)}"${checked ? " checked" : ""}><span>${escapeHTML(label)}</span></label>`;

    return `
    <main id="app">

        <section class="categories-page directory-page ai-directory">

            <div class="container container--workspace">

                ${renderBreadcrumb([
                    { label: "All Tools", href: ROUTES.tools },
                    { label: "AI Tools", href: ROUTES.aiTools },
                    { label: "AI Directory" }
                ])}

                ${workspaceOpen("ai-tools", null, "AI Directory")}

                <div class="categories-page__intro">
                    <span class="categories-page__eyebrow">AI Tools</span>
                    <h1 class="categories-page__title">AI Directory</h1>
                    <p class="categories-page__description">${AI_PRODUCTS.length} AI products made by other companies, grouped by what they do. Each one was checked on its official site on the date shown; the descriptions are ours and say only what that site said. Nothing here is sponsored, ranked or an endorsement, and no link carries a referral code.</p>
                    <p class="ai-directory__native">Looking for the tools built here, which run in your browser and need no account? See <a href="${ROUTES.aiTools}">AI Tools</a>.</p>
                    <p class="ai-directory__native">Not sure which product fits? <a href="${escapeHTML(ROUTES.tool("tools", "ai-workbench"))}?start=describe">Describe your task in the AI Workbench</a>; it lists the products made for that kind of task.</p>
                </div>

                <form class="ai-filters" role="search" aria-label="Filter the AI products" data-ai-filters hidden>
                    <div class="ai-filters__search">
                        <label for="ai-search">Search the directory</label>
                        <input id="ai-search" type="search" autocomplete="off" spellcheck="false" placeholder="For example: test automation, SQL, transcription">
                    </div>
                    <fieldset class="ai-filters__group">
                        <legend>Useful for</legend>
                        <div class="ai-chips">${chip("audience", "", "Everyone", true)}${AI_AUDIENCES.map((a) => chip("audience", a.id, a.label, false)).join("")}
                        </div>
                    </fieldset>
                    <fieldset class="ai-filters__group">
                        <legend>Category</legend>
                        <div class="ai-chips">${chip("category", "", "All categories", true)}${groups.map((g) => chip("category", g.category.id, g.category.label, false)).join("")}
                        </div>
                    </fieldset>
                    <p class="ai-filters__count" role="status" aria-live="polite" data-ai-count></p>
                    <button type="button" class="ai-filters__reset" data-ai-reset hidden>Show all products</button>
                </form>

                ${groups.map((g) => `
                <section class="ai-group" data-ai-group="${g.category.id}" aria-labelledby="ai-group-${g.category.id}">
                    <h2 id="ai-group-${g.category.id}" class="categories-detail__heading">${escapeHTML(g.category.label)} <span class="ai-group__count">(${g.products.length})</span></h2>
                    <ul class="ai-grid">${g.products.map(aiProductCard).join("")}
                    </ul>
                </section>`).join("")}

                <p class="ai-directory__empty" data-ai-empty hidden>No product matches. Try fewer words, or <button type="button" data-ai-reset>show all products</button>.</p>

                <section class="ai-directory__policy" aria-labelledby="ai-policy-title">
                    <h2 id="ai-policy-title" class="categories-detail__heading">How this directory is kept</h2>
                    <ul>
                        <li>Every product is listed because it does a clear job for developers, testers, analysts or other professionals, not because it paid or asked.</li>
                        <li>Pricing shows only what the product's own site said on the day it was checked, never a price; plans change, so check the official site before you sign up.</li>
                        <li>Each entry is checked again at least every six months. A product whose official site no longer describes it is removed.</li>
                        <li>These products run on their makers' servers under their own terms and privacy policies. Unlike the tools on this site, what you type into them is sent to them.</li>
                    </ul>
                </section>

                <p class="directory-section__more">
                    <a href="${ROUTES.aiTools}">← AI Tools</a>
                </p>

                ${workspaceClose("ai-tools")}

            </div>

        </section>

    </main>`;

}
