/* =========================================================
   ToolZen Hub
   AI Workbench: AI products for a task (Tool Pack 58, section 9)

   From the AI products directory only (data/ai-directory.js): a
   blueprint names the directory categories that fit its job, in
   order, optionally requiring that the product's own summary
   mentions something (an assistant fits an image task only if its
   official summary mentions images). The result is in that order
   and then directory order. It is a list of products that fit, not
   a ranking, and it says only what the directory says. Pure.
========================================================= */

import { AI_PRODUCTS, AI_CATEGORIES, PRICING, VERIFIED } from "../../data/ai-directory.js";

export { NOT_VERIFIED } from "./compiler.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

const categoryLabel = (id) => AI_CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** The directory products that fit a blueprint's categories: [{ id, name, by, url, summary, pricing, checked, reason }] */
export function productsFor(blueprint, limit = 6) {

    const seen = new Set();
    const out = [];

    for (const want of blueprint.categories ?? []) {
        for (const p of AI_PRODUCTS) {
            if (seen.has(p.id) || !p.categories.includes(want.id)) continue;
            if (want.mention && !want.mention.test(p.summary)) continue;
            seen.add(p.id);
            out.push({
                id: p.id,
                name: p.name,
                by: p.by,
                url: p.url,
                summary: p.summary,
                pricing: PRICING[p.pricing],
                checked: longDate(p.verifiedOn),
                reason: `Listed in the AI Directory under ${categoryLabel(want.id)}${want.mention ? "; its official summary mentions this kind of work" : ""}.`
            });
        }
    }

    /* the prompt is pasted into an assistant, so when the blueprint names assistants, specialist products never take every
       place: up to three general assistants keep theirs (otherwise six testing platforms hid ChatGPT, Claude and Gemini) */
    const assistant = (p) => AI_PRODUCTS.find((x) => x.id === p.id)?.categories.includes("assistants");
    const wantsAssistants = (blueprint.categories ?? []).some((c) => c.id === "assistants" && !c.mention);
    if (!wantsAssistants || out.slice(0, limit).some(assistant)) return out.slice(0, limit);
    const general = out.filter(assistant).slice(0, 3);
    return [...out.filter((p) => !assistant(p)).slice(0, limit - general.length), ...general];

}

export const directoryChecked = () => longDate(VERIFIED);

/** a directory product by id ({ id, name } or null), for a link that names one (?product=) */
export function productById(id) {
    const p = AI_PRODUCTS.find((x) => x.id === id);
    return p ? { id: p.id, name: p.name } : null;
}
