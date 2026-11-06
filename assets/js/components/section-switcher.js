/* =========================================================
   ToolZen Hub
   Section switcher: "More <section>" under a tool's breadcrumb

   A closed disclosure that lists the live tools of the tool's own section (the Calculators section grouped by
   category), the current tool marked, so a visitor can move between sibling tools without going back to a listing
   (rulebook 4.8). It is plain links inside a native <details>: no script, no layout space while closed, and the
   links are ordinary pages, so history, deep links and keyboard use are the browser's own. A tool appears only in
   its own section (rule 4.2). Used by the site build (pages/tool-page.js); there is no browser-side rendering.
========================================================= */

import { escapeHTML } from "../ui/escape.js";
import { getToolById } from "../data/tools.js";
import {
    getSectionForTool,
    getCategoryForTool,
    getToolsBySection
} from "../data/taxonomy.js";

/* Sidebar groups for the sections whose tools have no catalog category (the Calculators section is grouped by its categories).
   Presentation only: the catalog, the URLs and the section a tool belongs to are unchanged. A published tool missing here lands
   in a final "More" group, and tests/unit/section-groups.test.mjs fails so the list is kept in step with the catalog. */
export const SECTION_GROUPS = {
    "time-tools": [
        { label: "Timers and clocks", ids: ["countdown-timer", "stopwatch", "pomodoro-timer", "interval-timer", "world-clock"] },
        { label: "Dates and durations", ids: ["date-difference", "date-calculator", "business-days", "time-duration", "hours-calculator"] },
        { label: "Time zones and shifts", ids: ["time-zone-converter", "meeting-planner", "shift-planner"] }
    ],
    "developer-tools": [
        { label: "JSON", ids: ["json-formatter", "json-compare", "jsonpath-tester", "json-csv-converter"] },
        { label: "Encoding and decoding", ids: ["base64-encoder-decoder", "url-parser", "jwt-decoder"] },
        { label: "Text and lists", ids: ["text-diff", "list-comparer"] },
        { label: "Time and identifiers", ids: ["unix-timestamp-converter", "cron-expression-explainer", "uuid-generator"] }
    ],
    "practice-labs": [
        { label: "Data", ids: ["sql-practice-lab", "excel-practice-lab", "power-bi-practice-lab"] },
        { label: "Developer practice", ids: ["json-error-fixing-lab", "jsonpath-challenge-lab", "cron-challenge-lab"] },
        { label: "Testing and study", ids: ["test-design-lab", "smart-flashcards"] }
    ],
    "pdf-tools": [
        { label: "Combine and split", ids: ["merge-pdf", "split-pdf"] },
        { label: "Edit pages", ids: ["pdf-pages", "pdf-marks"] }
    ]
};

/** The sidebar groups of a section: [{ label, items }] in display order. Pure given the tools and the category lookup. */
export function groupSectionTools(sectionId, tools, categoryTitleOf) {

    const groups = [];
    const place = (label, item) => {
        let group = groups.find(entry => entry.label === label);
        if (!group) {
            group = { label, items: [] };
            groups.push(group);
        }
        group.items.push(item);
    };

    const planned = SECTION_GROUPS[sectionId];

    if (!planned) {
        for (const item of tools) place(categoryTitleOf(item) ?? "", item);
        return groups;
    }

    for (const def of planned) {
        for (const id of def.ids) {
            const item = tools.find(t => t.id === id);
            if (item) place(def.label, item);
        }
    }

    for (const item of tools) {
        if (!planned.some(def => def.ids.includes(item.id))) place("More", item);
    }

    return groups;

}

function linkHtml(tool, currentId) {

    const current = tool.id === currentId;

    return `<li><a href="${escapeHTML(tool.href)}"${current ? ' aria-current="page"' : ""}>${escapeHTML(tool.title)}</a></li>`;

}

export function renderSectionSwitcher(toolId) {

    const tool = getToolById(toolId);
    const section = getSectionForTool(tool);

    if (!tool || !section) {
        return "";
    }

    const siblings = getToolsBySection(section.id).filter(item => item.available);

    if (siblings.length < 2) {
        return "";
    }

    const groups = groupSectionTools(section.id, siblings, item => getCategoryForTool(item)?.title);

    /* Each group (a Calculators category, or a group of another section) can be expanded and collapsed by script (ui/section-rail.js); without
       script every group is simply listed. data-open marks the groups that start open: the one holding the current tool, and every group of a
       short section. A long section (more than 16 tools: the Calculators) starts with the other groups closed so the list stays short. */
    const longSection = siblings.length > 16;

    const body = groups.map(group => {

        const isOpen = !longSection || group.items.some(item => item.id === toolId);

        return `
                            <li class="section-switcher__group" data-open="${isOpen}">
                                ${group.label ? `<span class="section-switcher__label">${escapeHTML(group.label)}</span>` : ""}
                                <ul>
                                    ${group.items.map(item => linkHtml(item, toolId)).join("")}
                                </ul>
                            </li>`;

    }).join("");

    return `
                <nav class="section-switcher" aria-label="${escapeHTML(section.title)}: switch tool">
                    <details>
                        <summary>
                            <span>More ${escapeHTML(section.title)}</span>
                            <span class="section-switcher__count">${siblings.length}</span>
                        </summary>
                        <ul class="section-switcher__list">${body}
                        </ul>
                    </details>
                </nav>`;

}
