/* =========================================================
   ToolZen Hub
   AI Workbench: helpers shared by the blueprint families

   Small constructors for questions and the option lists several
   families use. Data only.
========================================================= */

export const text = (key, label, extra = {}) => ({ key, label, kind: "text", ...extra });
export const area = (key, label, extra = {}) => ({ key, label, kind: "textarea", ...extra });
export const choose = (key, label, options, extra = {}) => ({
    key,
    label,
    kind: "select",
    options: [{ value: "", label: extra.empty ?? "Choose…" }, ...options.map((o) => typeof o === "string" ? { value: o, label: o } : o)],
    ...extra
});

/** an optional detail, shown under "More details" so the questions up front stay four to six (spec section 5) */
export const more = (question) => ({ ...question, more: true });

export const TONES =["friendly", "professional", "formal", "conversational", "persuasive", "playful", "neutral and factual"];

export const ASPECTS = [
    { value: "square (1:1)", label: "Square (1:1)" },
    { value: "portrait (4:5)", label: "Portrait (4:5)" },
    { value: "tall (9:16)", label: "Tall (9:16)" },
    { value: "wide (16:9)", label: "Wide (16:9)" },
    { value: "landscape photo (3:2)", label: "Photo (3:2)" }
];

/** "x, y and z" from a list */
export function listText(items) {

    const list = items.filter(Boolean);
    return list.length <= 1 ? (list[0] ?? "") : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;

}

/** a clause only when the answer is there: when("for", a.audience) -> "for engineers" or "" */
export const when = (prefix, value, suffix = "") => value ? `${prefix} ${value}${suffix}` : "";

/** words that appear both in what must change and what must stay, for the image and video edit conflicts */
export function overlapping(change, keep) {

    const words = (s) => new Set(String(s).toLowerCase().match(/[a-z]{4,}/g) ?? []);
    const stop = new Set(["make", "keep", "with", "that", "this", "from", "into", "same", "more", "less", "image", "photo", "picture", "everything", "else"]);
    const keepWords = words(keep);
    return [...words(change)].filter((w) => keepWords.has(w) && !stop.has(w));

}
