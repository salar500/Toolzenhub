/* =========================================================
   ToolZen Hub
   HTML and CSS playground: checks run on the document the learner's code produced (in a sandboxed iframe with scripts
   disabled). Rules read the real DOM and computed styles, so any correct markup passes, not one spelling.

     exists    { selector, text? }      an element matches (and its text matches the pattern)
     count     { selector, min }        at least min elements match
     none      { selector }             no element matches (for example img:not([alt]))
     attr      { selector, attr, pattern? }  every match has the attribute, non-empty (and matching)
     labelled  { selector }             every matching form control has an accessible name
     named     { selector }             every match has a name in words (aria-label, or text not hidden with aria-hidden)
     style     { selector, prop, pattern }   the first match's computed style matches the pattern
========================================================= */

const has = (value) => String(value ?? "").trim().length > 0;

function accessibleName(el, doc) {
    if (has(el.getAttribute("aria-label"))) return true;
    const by = el.getAttribute("aria-labelledby");
    if (by && by.split(/\s+/).some((id) => has(doc.getElementById(id)?.textContent))) return true;
    if (el.id && [...doc.querySelectorAll("label[for]")].some((l) => l.getAttribute("for") === el.id && has(l.textContent))) return true;
    const wrap = el.closest("label");
    return Boolean(wrap && has(wrap.textContent));
}

function visibleWords(el) {
    let text = "";
    for (const child of el.childNodes) {
        if (child.nodeType === 3) text += child.textContent;
        else if (child.nodeType === 1 && child.getAttribute("aria-hidden") !== "true") text += visibleWords(child);
    }
    return text;
}

const RULES = {
    exists: (r, doc) => [...doc.querySelectorAll(r.selector)].some((el) => !r.text || new RegExp(r.text, "i").test(el.textContent)),
    count: (r, doc) => doc.querySelectorAll(r.selector).length >= r.min,
    none: (r, doc) => doc.querySelectorAll(r.selector).length === 0,
    attr: (r, doc) => { const els = [...doc.querySelectorAll(r.selector)]; return els.length > 0 && els.every((el) => has(el.getAttribute(r.attr)) && (!r.pattern || new RegExp(r.pattern, "i").test(el.getAttribute(r.attr)))); },
    labelled: (r, doc) => { const els = [...doc.querySelectorAll(r.selector)].filter((el) => !/^(hidden|submit|button|reset)$/i.test(el.type ?? "")); return els.length > 0 && els.every((el) => accessibleName(el, doc)); },
    named: (r, doc) => { const els = [...doc.querySelectorAll(r.selector)]; return els.length > 0 && els.every((el) => /[A-Za-z]{2}/.test(el.getAttribute("aria-label") ?? "") || /[A-Za-z]{2}/.test(visibleWords(el))); },
    style: (r, doc, win) => { const el = doc.querySelector(r.selector); return Boolean(el) && new RegExp(r.pattern, "i").test(win.getComputedStyle(el).getPropertyValue(r.prop)); }
};

/** { items: [{ id, label, met, advice }], met, total } */
export function checkDom(exercise, doc, win) {
    const items = exercise.rules.map((rule) => {
        let met = false;
        try { met = RULES[rule.type](rule, doc, win); } catch { met = false; }
        return { id: rule.id, label: rule.label, met, advice: rule.advice };
    });
    return { items, met: items.filter((i) => i.met).length, total: items.length };
}
