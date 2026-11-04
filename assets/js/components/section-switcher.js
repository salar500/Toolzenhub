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

    /* the Calculators section has categories: group by category, in catalog order of first appearance */
    const groups = [];

    for (const item of siblings) {

        const label = getCategoryForTool(item)?.title ?? "";
        let group = groups.find(entry => entry.label === label);

        if (!group) {
            group = { label, items: [] };
            groups.push(group);
        }

        group.items.push(item);

    }

    const body = groups.map(group => `
                            <li class="section-switcher__group">
                                ${group.label ? `<span class="section-switcher__label">${escapeHTML(group.label)}</span>` : ""}
                                <ul>
                                    ${group.items.map(item => linkHtml(item, toolId)).join("")}
                                </ul>
                            </li>`).join("");

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
