/* =========================================================
   ToolZen Hub
   Date fields: a calendar button and "Use today" for every date input of a tool page

   The native date input stays the control (manual typing, the browser's own accessible picker, validation and the existing calculations are
   untouched). This adds, next to each one:
   - a calendar button that opens the browser's picker (showPicker where it exists, else focus), and the field opens it when clicked;
   - "Use today" (the visitor's own local calendar date, never a UTC date) unless the tool already has one for that field, the field sits in
     a table row, or it asks for a date of birth or joining, where today is not a sensible answer.
   It writes only to its own field and fires input and change events so each tool recalculates exactly as if the date had been typed.
   Nothing is stored.
========================================================= */

const CALENDAR_ICON = `<svg class="date-field__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7.5" y="13" width="3" height="3" rx=".6" fill="currentColor"/></svg>`;

/** The visitor's local calendar date as yyyy-mm-dd (not toISOString, which is UTC and can be a day off). Pure given `now`. */
export function localDateIso(now = new Date()) {

    const pad = (n, width = 2) => String(n).padStart(width, "0");

    return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

}

/** Whether "today" is a sensible answer for a field with this label. */
export function wantsToday(labelText) {

    return !/birth|\bdob\b|joining|joined|born/i.test(labelText ?? "");

}

function fieldLabel(input) {

    const label = input.id ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`) : null;

    return (label?.textContent ?? input.getAttribute("aria-label") ?? "").replace(/\s+/g, " ").trim();

}

function fire(input) {

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

}

function openPicker(input) {

    try {
        if (typeof input.showPicker === "function") {
            input.showPicker();
            return;
        }
    } catch {
        /* showPicker can refuse (for example in a frame); the field itself still takes a typed or tapped date */
    }

    input.focus();

}

export function enhanceDateField(input, now = () => new Date()) {

    if (input.dataset.dateField === "ready" || input.type !== "date") {
        return;
    }

    input.dataset.dateField = "ready";

    const label = fieldLabel(input);
    const wrap = document.createElement("span");
    const button = document.createElement("button");

    wrap.className = "date-field";
    input.before(wrap);
    wrap.append(input, button);

    button.type = "button";
    button.className = "date-field__button";
    button.setAttribute("aria-label", label ? `Open calendar: ${label}` : "Open calendar");
    button.innerHTML = CALENDAR_ICON;
    button.addEventListener("click", () => openPicker(input));

    /* a click on the field itself opens the picker where the browser only does so from its own small icon */
    input.addEventListener("click", () => {
        if (!input.disabled && !input.readOnly) openPicker(input);
    });

    const hasToday = input.id && document.querySelector(`[data-today="${CSS.escape(input.id)}"]`);
    const inTable = !!input.closest("table, td, tr");

    if (!hasToday && !inTable && input.id && wantsToday(label)) {

        const actions = document.createElement("span");
        const today = document.createElement("button");

        actions.className = "date-field__actions";
        today.type = "button";
        today.className = "date-field__today";
        today.dataset.today = input.id;
        today.setAttribute("aria-label", `Use today's date for ${label || "this field"}`);
        today.textContent = "Use today";
        today.addEventListener("click", () => {
            input.value = localDateIso(now());
            fire(input);
            input.focus();
        });

        actions.append(today);
        wrap.after(actions);

    }

}

export function enhanceDateFields(root = document, now) {

    for (const input of root.querySelectorAll('input[type="date"]')) {
        enhanceDateField(input, now);
    }

}

/** Enhances the date inputs present now and any a tool draws later (a mode switch, a new row). Returns a stop function. */
export function watchDateFields(root, now) {

    enhanceDateFields(root, now);

    if (typeof MutationObserver !== "function") {
        return () => {};
    }

    let queued = false;

    const observer = new MutationObserver(() => {

        if (queued) return;

        queued = true;

        requestAnimationFrame(() => {
            queued = false;
            enhanceDateFields(root, now);
        });

    });

    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();

}
