/* =========================================================
   ToolZen Hub
   Shared UI: form fields

   Small, framework-free helpers for the label + control + hint
   pattern every tool form repeats, and for connecting an error
   to the fields it is about. Styled by the existing
   calculator-form.css vocabulary (calculator-form__*), which
   is not specific to calculators.

   MARKUP (pure strings: usable while the site is built and in
   the browser)
       fieldShell(...)   the wrapper: label, control, unit, hint
       numberField(...)  a number input inside that wrapper

   ACCESSIBILITY (needs the DOM; call from a tool's init())
       setFieldsInvalid / clearFieldsInvalid

   What stays with the tool: the rules that decide whether a
   value is valid, the wording of the message, and where the
   message appears. This file only wires the semantics.
========================================================= */

import {
    escapeHTML
} from "./escape.js";


/* =========================================================
   MARKUP
========================================================= */

/*
 * Every id is derived from the field id, so ids stay
 * predictable and unique:
 *     {id}        the control (the label's `for`)
 *     {id}-hint   the hint text, linked with aria-describedby
 *
 * `control` is the tool's own control markup (trusted HTML);
 * `label`, `unit` and `hint` are text and are escaped.
 */

export function hintIdOf(
    id
) {

    return `${id}-hint`;

}


export function fieldShell({
    id,
    label,
    unit,
    hint,
    control
}) {

    return `
                        <div class="calculator-form__group">

                            <label
                                class="calculator-form__label"
                                for="${escapeHTML(id)}"
                            >
                                ${escapeHTML(label)}
                            </label>

                            <div class="calculator-form__field${unit ? " calculator-form__field--unit" : ""}">

                                ${control}${unit
                                    ? `

                                <span class="calculator-form__unit">
                                    ${escapeHTML(unit)}
                                </span>`
                                    : ""}

                            </div>${hint
                                ? `

                            <span
                                class="calculator-form__help"
                                id="${escapeHTML(hintIdOf(id))}"
                            >
                                ${escapeHTML(hint)}
                            </span>`
                                : ""}

                        </div>`;

}


export function numberField({
    id,
    label,
    unit,
    hint,
    min,
    max,
    step,
    value,
    required = true
}) {

    const attributes = [
        ["min", min],
        ["max", max],
        ["step", step],
        ["value", value]
    ]
        .filter(([, v]) => v !== undefined)
        .map(([name, v]) => `${name}="${escapeHTML(v)}"`)
        .join("\n                                    ");

    return fieldShell({
        id,
        label,
        unit,
        hint,
        control: `<input
                                    id="${escapeHTML(id)}"
                                    class="calculator-form__input"
                                    type="number"
                                    ${attributes}${required ? "\n                                    required" : ""}${hint
                                        ? `
                                    aria-describedby="${escapeHTML(hintIdOf(id))}"`
                                        : ""}
                                >`
    });

}


/* =========================================================
   ERROR WIRING
   An error is connected to the fields it is about with
   aria-invalid and aria-describedby, so a screen reader
   announces it with the field. The tool renders the error
   element (with an id) wherever it belongs.
========================================================= */

function tokens(
    element
) {

    return (element.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter(Boolean);

}


export function setFieldsInvalid(
    inputs,
    errorId
) {

    for (const input of inputs) {

        if (!input) {
            continue;
        }

        input.setAttribute("aria-invalid", "true");

        const ids = tokens(input);

        if (!ids.includes(errorId)) {

            input.setAttribute(
                "aria-describedby",
                [...ids, errorId].join(" ")
            );

        }

    }

}


export function clearFieldsInvalid(
    inputs,
    errorId
) {

    for (const input of inputs) {

        if (!input) {
            continue;
        }

        input.removeAttribute("aria-invalid");

        const ids =
            tokens(input).filter(
                id =>
                    id !== errorId
            );

        if (ids.length) {

            input.setAttribute(
                "aria-describedby",
                ids.join(" ")
            );

        } else {

            input.removeAttribute("aria-describedby");

        }

    }

}
