/* =========================================================
   ToolZen Hub
   Category tool card

   The card for one tool inside a category: a link when the tool
   is live, a non-clickable "Coming soon" card when it is not.
   Shared by the categories page (drawn in the browser) and the
   category pages (drawn when the site is built), so the two
   look and behave the same.
========================================================= */

import {
    escapeHTML
} from "../ui/escape.js";


/*
 * `tool` is a catalog entry (title, description, icon, href,
 * available); `category` supplies the icon colour.
 */

export function toolCardHtml(tool, category) {

    const available = Boolean(tool.available);

    const open =
        available
            ? `<a
            href="${tool.href}"
            class="category-page-card"
        >`
            : `<div
            class="category-page-card category-page-card--soon"
            aria-disabled="true"
        >`;

    return `

        ${open}

            <div
                class="
                    category-page-card__icon
                    category-page-card__icon--${category.iconClass}
                "
                aria-hidden="true"
            >
                ${tool.icon || category.icon}
            </div>


            <div class="category-page-card__content">

                <h3 class="category-page-card__title">
                    ${escapeHTML(tool.title)}
                </h3>

                <p class="category-page-card__description">
                    ${escapeHTML(tool.description)}
                </p>

                ${available ? "" : `<span class="coming-soon-badge">Coming soon</span>`}

            </div>

            ${available
                ? `<span
                class="category-page-card__arrow"
                aria-hidden="true"
            >
                →
            </span>`
                : ""}

        ${available ? "</a>" : "</div>"}

    `;

}
