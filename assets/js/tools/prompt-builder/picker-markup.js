/* =========================================================
   ToolZen Hub
   AI Prompt Builder: the searchable list's markup (2026-11-19)

   The box, its hint and the empty, hidden list, as HTML. The
   first question's list is built into the page with it, so the
   page does not move when the script starts; its behaviour is
   picker.js, loaded when the box is first used (D17).
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";

/** The box, its hint and the (empty, hidden) list, as markup: built into the page so nothing moves when the script starts. */
export function pickerMarkup(o) {

    const listId = `${o.id}-list`;
    return `
                            <div class="wb-picker">
                                <div class="wb-picker__field">
                                    <input id="${e(o.id)}" class="calculator-form__input wb-picker__input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${e(listId)}" aria-labelledby="${e(o.labelledBy)}" aria-describedby="${e(o.id)}-hint" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="120" placeholder="${e(o.placeholder)}">
                                    <span class="wb-picker__toggle" aria-hidden="true" data-picker-toggle></span>
                                </div>
                                <p class="ai-note wb-picker__hint" id="${e(o.id)}-hint">${e(o.hint ?? "Type to search, or open the list and use the arrow keys.")}</p>
                                <div class="wb-picker__list" id="${e(listId)}" role="listbox" aria-labelledby="${e(o.labelledBy)}" hidden></div>
                                <p class="ai-note wb-picker__none" hidden></p>
                            </div>`;

}

