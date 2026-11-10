/* =========================================================
   ToolZen Hub
   Wide result tables (one-screen desktop workspace)

   From 1200 px the result summary sits beside the inputs
   (calculator-results.css). Schedules and year-by-year tables are
   too wide for that column, so a calculator puts them after the
   WIDE marker in its result markup, and they are shown in their own
   full-width section under the form and the result
   (`<div class="calculator-wide">` after the results section: a
   layout container, not a landmark, since each table keeps its own
   labelled heading and a second label would repeat it).
   Narrower screens show the section straight after the result, so
   the reading order is unchanged.

   Owner decision, 2026-11-10.
========================================================= */


export const WIDE = "<!-- calculator-wide -->";


/* The summary (before the marker) and the wide part (after it). */
export function splitWide(html) {

    const index = html.indexOf(WIDE);

    return index < 0
        ? [html, ""]
        : [html.slice(0, index), html.slice(index + WIDE.length)];

}


/* The empty container a calculator places after its results section. */
export function wideSection(id) {

    return `
            <div
                id="${id}"
                class="calculator-wide"
                hidden
            ></div>`;

}


/* Shows the wide part in the section's card, or hides the section when there is none. */
export function showWide(section, html) {

    if (!section) {
        return;
    }

    const content = html.trim();

    section.innerHTML = content
        ? `<div class="calculator-results__card">${content}</div>`
        : "";
    section.hidden = !content;

}
