/* =========================================================
   ToolZen Hub
   "Learn and check": where to learn more and which primary
   sources to check, for one tool or lab page.

   Build-time only (pages/tool-page.js), so the curriculum it
   reads never reaches the browser. The data is curated in
   data/knowledge.js and data/official-sources.js; a page
   without an entry gets no block. An unknown reference throws,
   so a broken link stops the build instead of shipping.
========================================================= */

import { KNOWLEDGE } from "../data/knowledge.js";
import { OFFICIAL_SOURCES } from "../data/official-sources.js";
import { getToolById } from "../data/tools.js";
import { getPath, flatLessons, pathUrl, lessonUrl } from "../practice-labs/curriculum.js";
import { AI_AUDIENCES } from "../data/ai-directory.js";
import { ROUTES } from "../routes.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-15" → "15 Nov 2026" */
export function checkedDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** A learning reference → { kind, title, href }. Throws on an unknown or unpublished one. */
export function resolveLearn(ref) {

    const [type, rest = ""] = ref.split(/:(.*)/s);

    if (type === "path") {
        const path = getPath(rest);
        if (!path || path.status === "planned") throw new Error(`knowledge: no published learning path "${rest}"`);
        return { kind: "Learning path", title: path.title, href: pathUrl(path) };
    }

    if (type === "lesson") {
        const [pathId, levelId, moduleId, slug] = rest.split("/");
        const path = getPath(pathId);
        const found = path && path.status !== "planned"
            ? flatLessons(path).find((x) => x.level.id === levelId && x.module.id === moduleId && x.lesson.slug === slug)
            : null;
        if (!found) throw new Error(`knowledge: no lesson "${rest}"`);
        return { kind: "Lesson", title: found.lesson.title, href: lessonUrl(path, found.level, found.module, found.lesson) };
    }

    if (type === "lab") {
        const tool = getToolById(rest);
        if (!tool || !tool.available || tool.sectionId !== "practice-labs") throw new Error(`knowledge: no published Practice Labs tool "${rest}"`);
        return { kind: "Practice lab", title: tool.title, href: tool.href };
    }

    if (type === "directory") {
        const audience = AI_AUDIENCES.find((a) => a.id === rest);
        if (rest !== "" && !audience) throw new Error(`knowledge: no AI directory audience "${rest}"`);
        return {
            kind: "AI Directory",
            title: audience ? `AI Directory: products for ${audience.phrase}` : "AI Directory",
            href: audience ? `${ROUTES.aiDirectory}?audience=${audience.id}` : ROUTES.aiDirectory
        };
    }

    throw new Error(`knowledge: unknown reference "${ref}"`);

}

/** An official source id → the source. Throws on an unknown one. */
export function resolveSource(id) {
    const source = OFFICIAL_SOURCES[id];
    if (!source) throw new Error(`knowledge: no official source "${id}"`);
    return source;
}

/** Everything the block shows for a page id, resolved; null when the page has no entry. Pure. */
export function getKnowledgeFor(id) {

    const entry = KNOWLEDGE[id];

    if (!entry) return null;

    return {
        learn: (entry.learn ?? []).map(({ ref, why }) => ({ ...resolveLearn(ref), why })),
        official: (entry.official ?? []).map(({ ref, why }) => ({ ...resolveSource(ref), why })),
        sources: entry.sources ? { label: entry.sources.label, why: entry.sources.why, links: entry.sources.refs.map(resolveSource) } : null
    };

}

const external = (source, text = source.title) =>
    `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(text)}<span class="knowledge-links__sr"> (opens the official site in a new tab)</span><span aria-hidden="true"> ↗</span></a>`;

/** The block's HTML for a page id, or "" when there is nothing to show. */
export function renderKnowledgeLinks(id) {

    const k = getKnowledgeFor(id);

    if (!k || (!k.learn.length && !k.official.length && !k.sources)) return "";

    const learn = k.learn.length ? `
            <div class="knowledge-links__group">
                <h3>Continue learning</h3>
                <ul class="knowledge-links__list">${k.learn.map((item) => `
                    <li>
                        <a href="${esc(item.href)}">${esc(item.title)}</a>
                        <span class="knowledge-links__kind">${esc(item.kind)}</span>
                        <p>${esc(item.why)}</p>
                    </li>`).join("")}
                </ul>
            </div>` : "";

    const officialRows = [
        ...k.official.map((item) => `
                    <li>
                        ${external(item)}
                        <span class="knowledge-links__kind">${esc(item.publisher)} · checked ${checkedDate(item.checkedOn)}</span>
                        <p>${esc(item.why)}</p>
                    </li>`),
        ...(k.sources ? [`
                    <li>
                        <span class="knowledge-links__label">${esc(k.sources.label)}</span>
                        <p>${esc(k.sources.why)}</p>
                        <ul class="knowledge-links__inline">${k.sources.links.map((s) => `<li>${external(s, s.publisher)}</li>`).join("")}</ul>
                        <span class="knowledge-links__kind">Links checked ${checkedDate(k.sources.links[0].checkedOn)}</span>
                    </li>`] : [])
    ];

    const official = officialRows.length ? `
            <div class="knowledge-links__group">
                <h3>Official references</h3>
                <ul class="knowledge-links__list">${officialRows.join("")}
                </ul>
            </div>` : "";

    return `

        <section class="related-section knowledge-links">

            <div class="related-section__heading">
                <h2 id="knowledge-links-title">Learn and check</h2>
            </div>

            <div class="knowledge-links__groups">${learn}${official}
            </div>

            ${official ? `<p class="knowledge-links__note">Official pages open on their own sites. A link is a pointer to the source, not an endorsement; check figures there on the day you use them.</p>` : ""}

        </section>

    `;

}
