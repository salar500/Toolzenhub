/* =========================================================
   ToolZen Hub
   Shared UI: results

   Small, framework-free helpers for the pieces of a result a
   tool shows: one labelled value, the "nothing calculated yet"
   state and an error. Pure strings, so they work while the site
   is built and in the browser. Styled by the existing
   calculator-results.css vocabulary (calculator-results__*).

   A value is DISPLAY TEXT. The tool formats it (currency,
   percentage, a duration, a converted unit, plain text), so a
   result need not be money, or even a number. How many results
   there are, and how they are grouped, stays with the tool.
========================================================= */

import {
    escapeHTML
} from "./escape.js";


/*
 * One labelled value. `primary` marks the headline figure.
 */

export function resultMetric({
    label,
    value,
    primary = false
}) {

    return `
                    <div class="calculator-results__item${primary ? " calculator-results__item--primary" : ""}">

                        <span class="calculator-results__label">
                            ${escapeHTML(label)}
                        </span>

                        <strong class="calculator-results__value">
                            ${escapeHTML(value)}
                        </strong>

                    </div>`;

}


/*
 * Shown before there is anything to show.
 */

export function resultEmpty(
    message
) {

    return `
                <div class="calculator-results__empty">
                    ${escapeHTML(message)}
                </div>
            `;

}


/*
 * An error. Give it an `id` when fields should point at it
 * (see setFieldsInvalid in field.js).
 */

export function resultError(
    message,
    {
        id
    } = {}
) {

    return `
                <div class="calculator-results__error"${id ? ` id="${escapeHTML(id)}"` : ""}>
                    ${escapeHTML(message)}
                </div>
            `;

}
