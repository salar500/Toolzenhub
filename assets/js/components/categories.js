/* =========================================================
   ToolZen Hub
   Home page: Explore Tools + Featured Tools
========================================================= */

import {
    ROUTES
} from "../routes.js";


import {
    getToolById
} from "../data/tools.js";

import {
    sections
} from "../data/categories.js";

import {
    getToolsBySection
} from "../data/taxonomy.js";


/* =========================================================
   FEATURED TOOLS (home page presentation)

   A CURATED short list of live tools, not a ranking: the site has
   no usage data, so it does not say "popular". Which tools are
   featured and in what order is a presentation choice, kept here
   and referencing catalog tool ids. It spans the live categories
   rather than listing one category's tools: one or two tools from
   each live category (Loans, Investment, Tax, Business, Math), the
   broadest and most distinct job in each. A tool of any section may
   be listed here: its link and status come from the tool catalog,
   not from this file. Whether a tool is
   clickable, and where it links, comes from the tool
   catalog (status / href), never from this list: a coming-soon
   tool would always render as a non-clickable card, so only live
   tools belong here.
   `title`, `blurb`, `icon` and `color` are card copy.
========================================================= */

const FEATURED_TOOLS = [
    { id: "sip", title: "SIP Calculator", blurb: "Plan your SIP investments", icon: "♜", color: "yellow" },
    { id: "gst", title: "GST Calculator", blurb: "Add or remove GST on an invoice", icon: "▤", color: "purple" },
    { id: "margin", title: "Margin Calculator", blurb: "Set a price from a target margin", icon: "%", color: "green" },
    { id: "percentage", title: "Percentage Calculator", blurb: "Find a change, the start or the end value", icon: "±", color: "teal" },
    { id: "home-loan", title: "Home Loan Calculator", blurb: "Find the loan that fits your EMI budget", icon: "⌂", color: "pink" },
    { id: "date-difference", title: "Date Difference Calculator", blurb: "Count the days between two dates", icon: "◷", color: "blue" }
];


function renderPopularCard(card) {

    const tool = getToolById(card.id);
    const available = Boolean(tool?.available);

    const body = `
                        <div class="calculator-card__icon calculator-card__icon--${card.color}">
                            ${card.icon}
                        </div>
                        <div class="calculator-card__content">
                            <h3>
                                ${card.title}
                            </h3>
                            <p>
                                ${card.blurb}
                            </p>${available ? "" : `
                            <span class="coming-soon-badge">Coming soon</span>`}
                        </div>`;

    if (!available) {
        return `
                    <div
                        class="calculator-card calculator-card--soon"
                        aria-disabled="true"
                    >${body}
                    </div>`;
    }

    return `
                    <a
                        href="${tool.href}"
                        class="calculator-card"
                    >${body}
                        <span
                            class="calculator-card__arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>
                    </a>`;

}


const hasLiveTool = (section) =>
    getToolsBySection(section.id).some(tool => tool.available);

function renderSectionCard(section) {

    return `
                    <a
                        href="${ROUTES[section.landing]}"
                        class="category-card"
                    >

                        <div class="category-card__icon category-card__icon--${section.id}">
                            ${section.icon}
                        </div>

                        <div class="category-card__content">

                            <h3>
                                ${section.title}
                            </h3>

                            <p>
                                ${section.summary}
                            </p>

                        </div>

                    </a>`;

}


export function renderCategories() {

    const categories = document.getElementById("categories");
    const featured = document.getElementById("popular-calculators");   // the section keeps its id

    if (!categories || !featured) {
        return;
    }


    /* =====================================================
       Browse Categories
    ===================================================== */

    categories.innerHTML = `

        <section class="categories-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Explore Tools
                    </h2>


                </div>


                <!-- one card per major section that has a live tool (data/categories.js); a section with none is not shown -->
                <div class="category-grid category-grid--sections">

                    ${sections.filter(hasLiveTool).map(renderSectionCard).join("")}

                </div>

            </div>

        </section>
    `;


    /* =====================================================
       Featured Tools
    ===================================================== */

    featured.innerHTML = `

        <section class="popular-section">

            <div class="container">

                <div class="section-header">

                    <h2 class="section-title">
                        Featured Tools
                    </h2>

                    <a
                        href="${ROUTES.tools}"
                        class="section-link"
                    >
                        View all tools
                        <span aria-hidden="true">→</span>
                    </a>

                </div>


                <div class="calculator-grid">


                    ${FEATURED_TOOLS.map(renderPopularCard).join("")}

                </div>

            </div>

        </section>
    `;
}
