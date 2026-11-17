/* =========================================================
   ToolZen Hub
   QA Workbench: what every stage shares (Tool Pack 59 section 12)

   Stage list, markup helpers (every value escaped), form errors
   tied to their fields, and actions used on several stages. Record
   operations load only when an action needs them (QD24).
========================================================= */

import { ROUTES } from "../../../routes.js";
import { escapeHTML as e } from "../../../ui/escape.js";
import { setFieldsInvalid, clearFieldsInvalid } from "../../../ui/field.js";
import { MAX } from "../core.js";

export { e };

export const P = "qa";

export const STAGES = [
    { id: "overview", title: "Overview" },
    { id: "requirements", title: "Requirements" },
    { id: "cases", title: "Test cases" },
    { id: "coverage", title: "Coverage" },
    { id: "execution", title: "Execution" },
    { id: "defects", title: "Defects" },
    { id: "report", title: "Report" }
];

export const routeOf = (id) => ROUTES.tool("tools", id);

export const opt = (value, label, current) => `<option value="${e(value)}"${value === current ? " selected" : ""}>${e(label)}</option>`;
export const choicesOf = (labels) => (list, current, empty = "") => list.map((v) => opt(v, v ? labels[v] : empty, current)).join("");
export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
export const idList = (ids) => (ids.length ? ids.map(e).join(", ") : "none");
export const tag = (word, kind) => `<span class="qa-tag" data-kind="${e(kind)}">${e(word)}</span>`;
export const heading = (text) => `<h2 id="${P}-stage-title" tabindex="-1">${e(text)}</h2>`;
export const note = (text) => `<p class="ai-note">${e(text)}</p>`;

export const btn = (act, label, { id = "", primary = false, aria = "" } = {}) =>
    `<button type="button" class="calculator-form__button${primary ? "" : " calculator-form__button--secondary"} qa-btn" data-act="${e(act)}"${id ? ` data-id="${e(id)}"` : ""}${aria ? ` aria-label="${e(aria)}"` : ""}>${e(label)}</button>`;

export const fig = (label, value, extra = "") => `<div class="${P}-fig"><dt>${e(label)}</dt><dd>${e(value)}${extra ? ` <span class="${P}-fig__note">${e(extra)}</span>` : ""}</dd></div>`;

/* field ids are numbered per drawing, so a redraw gives a field the same id (focus can return to it) */
let seq = 0;
export const resetFields = () => {
    seq = 0;
};
export const nextId = (prefix = "f") => `${P}-${prefix}${(seq += 1)}`;

/** A labelled control with its hint and an error line; `control` builds the control from its id. */
function group(name, label, control, { required = false, hint = "", wide = false } = {}) {

    const id = nextId();

    return `<div class="calculator-form__group${wide ? " qa-wide" : ""}"><label class="calculator-form__label" for="${id}">${e(label)}${required ? " (required)" : ""}</label><div class="calculator-form__field">${control(id, hint ? ` aria-describedby="${id}-hint"` : "")}</div>${hint ? `<span class="calculator-form__help" id="${id}-hint">${e(hint)}</span>` : ""}<span class="qa-error" id="${id}-error" data-error-for="${e(name)}" hidden></span></div>`;

}

/* o.attrs: extra attributes, written by the code (data-filter marks a list filter, data-scope the build choice) */
export const textInput = (name, label, value = "", o = {}) => group(name, label, (id, d) =>
    `<input id="${id}" name="${e(name)}" class="calculator-form__input" type="${o.type ?? "text"}" maxlength="${o.max ?? MAX.title}" value="${e(value ?? "")}" autocomplete="off"${o.required ? " required" : ""}${o.attrs ?? ""}${d}>`, o);

export const search = (name, label, value) => textInput(name, label, value, { type: "search", attrs: " data-filter" });

export const textArea = (name, label, value = "", o = {}) => group(name, label, (id, d) =>
    `<textarea id="${id}" name="${e(name)}" class="calculator-form__input ai-textarea" rows="${o.rows ?? 3}" maxlength="${o.max ?? MAX.note}"${o.required ? " required" : ""}${d}>${e(value ?? "")}</textarea>`, { ...o, wide: true });

export const select = (name, label, html, o = {}) => group(name, label, (id, d) =>
    `<select id="${id}" name="${e(name)}" class="calculator-form__input"${o.attrs ?? ""}${d}>${html}</select>`, o);

export const filter = (name, label, html) => select(name, label, html, { attrs: " data-filter" });

/** The build whose runs are counted: all builds or one label (Execution and Report). */
export const scope = (s, builds) => select("build", "Runs counted", opt("", "All builds", s.build) + builds.map((b) => opt(b, `Build ${b}`, s.build)).join(""), { attrs: " data-scope" });

export const formEnd = (save, cancel = true) =>
    `<p class="qa-error" data-error-for="form" hidden></p><div class="calculator-form__actions qa-actions"><button type="submit" class="calculator-form__button qa-btn">${e(save)}</button>${cancel ? btn("cancel", "Cancel") : ""}</div>`;

export const form = (name, inner, { id = "", attrs = "" } = {}) =>
    `<form class="calculator-form ai-form ${P}-form" data-form="${name}"${id ? ` data-id="${e(id)}"` : ""}${attrs} novalidate>${inner}</form>`;

export const grid = (...fields) => `<div class="calculator-form__grid">${fields.join("")}</div>`;
export const toolbar = (...parts) => `<div class="${P}-toolbar">${parts.join("")}</div>`;
export const empty = (text) => `<p class="${P}-empty">${e(text)}</p>`;
export const stateFilter = (name, current) => filter(name, "Show", opt("active", "Active", current) + opt("retired", "Retired", current) + opt("all", "All", current));

/** The record actions a list row offers: edit, retire or restore, delete when nothing refers to it. */
export function rowActions(id, state, deletable, editAct, extra = "") {

    return `<div class="qa-actions qa-actions--small">${btn(editAct, "Edit", { id, aria: `Edit ${id}` })}${extra}${btn(state === "active" ? "retire" : "restore", state === "active" ? "Retire" : "Restore", { id, aria: `${state === "active" ? "Retire" : "Restore"} ${id}` })}${deletable ? btn("delete", "Delete", { id, aria: `Delete ${id}` }) : ""}</div>`;

}

/* ---------- forms ---------- */

export function values(formEl) {

    const out = {};
    for (const [k, v] of new FormData(formEl).entries()) if (typeof v === "string") out[k] = v;

    return out;

}

/** Shows each error next to its field (linked for screen readers), focuses the first and announces it. */
export function showErrors(ctx, formEl, errors) {

    for (const el of formEl.querySelectorAll("[data-error-for]")) {
        el.hidden = true;
        el.textContent = "";
        const input = formEl.querySelector(`[name="${CSS.escape(el.dataset.errorFor)}"]`);
        if (input && el.id) clearFieldsInvalid([input], el.id);
    }

    let first = null;
    for (const [key, message] of Object.entries(errors)) {
        const el = formEl.querySelector(`[data-error-for="${CSS.escape(key)}"]`) ?? formEl.querySelector('[data-error-for="form"]');
        el.hidden = false;
        el.textContent = message;
        const input = formEl.querySelector(`[name="${CSS.escape(key === "steps" ? "step-action" : key)}"]`);
        if (input && el.id) setFieldsInvalid([input], el.id);
        first ??= input ?? el;
    }

    first?.focus?.();
    ctx.announce(Object.values(errors)[0]);

}

/** Redraws, then focuses the first element that matches. */
export async function redrawTo(ctx, selector) {

    await ctx.redraw();
    ctx.panel.querySelector(selector)?.focus();

}

/* ---------- actions shown on more than one stage ---------- */

export const common = {

    goto: (ctx, id) => ctx.go(id),
    download: (ctx) => ctx.download(),

    "goto-open": async (ctx) => {
        await ctx.go("overview");
        const box = ctx.panel.querySelector(`.${P}-box`);
        if (box) {
            box.open = true;
            box.querySelector("summary")?.focus();
        }
    },

    cancel: async (ctx) => {
        ctx.ui.editing = null;
        ctx.ui.mapping = "";
        await ctx.redraw();
        ctx.$("stage-title")?.focus();
    }

};
