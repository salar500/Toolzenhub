/* =========================================================
   ToolZen Hub
   AI Prompt Builder: the searchable list (single-question flow,
   2026-11-19; docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md)

   One text box that opens a list of choices below it (the ARIA
   combobox pattern with a listbox): typing filters the list, the
   arrow keys move through it, Enter or a press chooses, Escape
   closes it. The list sits in the page's flow under the box, so it
   is never clipped by the viewport, a sticky bar or the phone
   keyboard. Choosing calls onPick; the guided panel then moves on.
   Used for the professions and the tasks; data in, no storage.
   The first question's box is built into the page (picker-markup.js),
   and this module loads when that box is first used (D17).
========================================================= */

import { escapeHTML as e } from "../../ui/escape.js";
import { pickerMarkup } from "./picker-markup.js";

const norm = (text) => String(text ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

/** The items whose label or keywords contain every word of the query; empty groups are left out. */
export function filterGroups(groups, query) {

    const words = norm(query).split(" ").filter(Boolean);
    if (!words.length) return groups;
    return groups
        .map((g) => ({ ...g, items: g.items.filter((it) => words.every((w) => norm(`${it.label} ${it.keywords ?? ""}`).includes(w))) }))
        .filter((g) => g.items.length);

}

/**
 * root: an empty element. o: { id, labelledBy, placeholder, hint, groups() -> [{ title, items: [{ id, label, note?, keywords? }] }],
 * search?(query) -> Promise<groups> (replaces the plain filter), empty(query) -> text, onPick(id, { query }), announce(text) }.
 * Returns { open(), close(), clear(), setCurrent(id), input }.
 */
export function mountPicker(root, o) {

    /* the page may already hold the markup (the first question); otherwise it is drawn here */
    if (!root.querySelector(".wb-picker")) root.innerHTML = pickerMarkup(o);

    const input = root.querySelector("input");
    const list = root.querySelector("[role=listbox]");
    const none = root.querySelector(".wb-picker__none");
    let options = [];
    let active = -1;
    let current = "";
    let ticket = 0;
    let shownFor = null;

    const isOpen = () => input.getAttribute("aria-expanded") === "true";

    function setActive(n, scroll = true) {
        if (!options.length) {
            active = -1;
            input.removeAttribute("aria-activedescendant");
            return;
        }
        active = Math.max(0, Math.min(options.length - 1, n));
        options.forEach((el, i) => el.setAttribute("aria-selected", String(i === active)));
        input.setAttribute("aria-activedescendant", options[active].id);
        if (scroll) options[active].scrollIntoView({ block: "nearest" });
    }

    function draw(groups, query) {
        let n = 0;
        list.innerHTML = groups.map((g, gi) => `
                                    <div role="group" aria-labelledby="${e(o.id)}-g${gi}">
                                        <div class="wb-picker__group" id="${e(o.id)}-g${gi}" role="presentation">${e(g.title)}</div>${g.items.map((it) => `
                                        <div class="wb-picker__option" role="option" id="${e(o.id)}-o${n++}" data-value="${e(it.id)}" aria-selected="false"${it.id === current ? ` data-current=""` : ""}><span class="wb-picker__label">${e(it.label)}${it.id === current ? `<span class="ai-sr-only"> (your current choice)</span>` : ""}</span>${it.note ? ` <span class="wb-picker__note">${e(it.note)}</span>` : ""}</div>`).join("")}
                                    </div>`).join("");
        options = [...list.querySelectorAll("[role=option]")];
        none.hidden = options.length > 0;
        none.textContent = options.length ? "" : o.empty?.(query) ?? "Nothing matches. Try other words.";
        list.hidden = !options.length;
        const at = options.findIndex((el) => el.dataset.value === current);
        if (query || at >= 0) setActive(query ? 0 : at);
        else {
            active = -1;
            input.removeAttribute("aria-activedescendant");
        }
        if (query) o.announce?.(options.length ? `${options.length} match${options.length === 1 ? "" : "es"}.` : none.textContent);
    }

    async function refresh() {
        const query = input.value;
        const mine = ++ticket;
        let groups = o.groups();
        if (query.trim()) {
            groups = filterGroups(groups, query);
            if (o.search) {
                try {
                    groups = await o.search(query, groups);
                } catch {
                    /* the plain filter stays when the search cannot be loaded */
                }
                if (mine !== ticket) return;
            }
        }
        shownFor = query;
        draw(groups, query.trim());
    }

    function open() {
        input.setAttribute("aria-expanded", "true");
        root.querySelector(".wb-picker").dataset.open = "";
        return refresh();
    }

    function close() {
        ticket += 1;
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
        delete root.querySelector(".wb-picker").dataset.open;
        list.hidden = true;
        none.hidden = true;
    }

    function pick(el) {
        if (!el) return;
        const query = input.value.trim();
        current = el.dataset.value;
        close();
        input.value = "";
        o.onPick(current, { query });
    }

    input.addEventListener("input", () => {
        if (!isOpen()) open();
        else refresh();
    });

    input.addEventListener("click", () => {
        if (!isOpen()) open();
    });

    input.addEventListener("keydown", (event) => {
        if (event.isComposing) return;
        const key = event.key;
        if (key === "ArrowDown" || key === "ArrowUp") {
            event.preventDefault();
            if (event.altKey && key === "ArrowUp") return close();
            if (!isOpen()) {
                open().then(() => setActive(key === "ArrowUp" ? options.length - 1 : active < 0 ? 0 : active));
                return;
            }
            setActive(active < 0 ? 0 : active + (key === "ArrowDown" ? 1 : -1));
        } else if (key === "PageDown" || key === "PageUp") {
            if (!isOpen()) return;
            event.preventDefault();
            setActive(active + (key === "PageDown" ? 8 : -8));
        } else if (key === "Enter") {
            event.preventDefault();
            /* a query typed and entered before the list caught up: choose its first match */
            if (isOpen() && shownFor === input.value && active >= 0) pick(options[active]);
            else open().then(() => { if (options.length === 1 || (input.value.trim() && options.length)) pick(options[active >= 0 ? active : 0]); });
        } else if (key === "Escape") {
            if (isOpen()) {
                event.preventDefault();
                close();
            } else if (input.value) {
                event.preventDefault();
                input.value = "";
            }
        } else if (key === "Tab") {
            close();
        }
    });

    /* a press keeps the focus in the box, so the list does not close before the click lands */
    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => pick(event.target.closest("[role=option]")));
    root.querySelector("[data-picker-toggle]").addEventListener("mousedown", (event) => {
        event.preventDefault();
        if (isOpen()) close();
        else {
            input.focus();
            open();
        }
    });

    root.addEventListener("focusout", (event) => {
        if (!root.contains(event.relatedTarget)) close();
    });

    return {
        input,
        open,
        close,
        clear() {
            current = "";
            input.value = "";
            close();
        },
        setCurrent(id) {
            current = id ?? "";
        }
    };

}
