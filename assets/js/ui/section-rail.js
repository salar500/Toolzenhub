/* =========================================================
   ToolZen Hub
   Section rail (tool pages): the sidebar of a tool's section

   The "More <section>" navigation is built at site-build time as a closed disclosure of plain links (components/section-switcher.js).
   This script turns it into the sidebar:

   - Wide screens (WIDE, 1000px and up): it is held open as a left column beside the tool, open by default, with a search box and a
     "Hide tools" button. Hidden, it takes no width: the tool gets the whole row and a "Show tools" button above it brings the list
     back. Hiding only hides; the tool, its fields and its results are not touched, and nothing is stored, so every visit starts open.
   - Narrower screens: the closed disclosure ("More <section>"), which opens as a drawer from the left over a dimmed page with the same
     searchable list and a "Close tools" button, so the tool keeps the screen. Nothing is stored; the tool is not reloaded or touched.

   Without script it stays a closed disclosure of ordinary links, so nothing depends on this file.
========================================================= */

export const WIDE = "(min-width: 1000px)";
export const SEARCH_MIN_TOOLS = 8;

/**
 * Which entries match a search. `labels` are the visible names, in order; a query matches when every word of it appears in a label
 * (case-insensitive). An empty query matches all. Returns the matching indexes. Pure.
 */
export function matchLabels(labels, query) {

    const words = String(query ?? "").toLowerCase().split(/\s+/).filter(Boolean);

    return labels.map((_, index) => index).filter(index => {
        const text = labels[index].toLowerCase();
        return words.every(word => text.includes(word));
    });

}

function element(tag, props = {}, text) {

    const node = document.createElement(tag);

    for (const [name, value] of Object.entries(props)) {
        node.setAttribute(name, value);
    }

    if (text !== undefined) {
        node.textContent = text;
    }

    return node;

}

export function initSectionRail(root = document) {

    const nav = root.querySelector(".section-switcher");
    const details = nav?.querySelector("details");
    const page = nav?.closest(".calculator-page");

    if (!details || !page || typeof window.matchMedia !== "function") {
        return;
    }

    const summary = details.querySelector("summary");
    const list = details.querySelector(".section-switcher__list");
    const links = [...nav.querySelectorAll(".section-switcher__list a")];
    const sectionName = nav.getAttribute("aria-label")?.replace(/: switch tool$/, "") ?? "tools";
    const wide = window.matchMedia(WIDE);

    nav.id ||= "section-rail";

    /* ---------- search ---------- */

    let search = null;

    if (links.length >= SEARCH_MIN_TOOLS) {

        const labels = links.map(link => link.textContent.trim());
        const field = element("div", { class: "section-rail__search" });
        const label = element("label", { for: "section-rail-search", class: "section-rail__label" }, `Find a tool in ${sectionName}`);
        const status = element("p", { class: "section-rail__status", role: "status", "aria-live": "polite" });

        search = element("input", { id: "section-rail-search", type: "search", autocomplete: "off", spellcheck: "false", placeholder: "Search tools" });
        field.append(label, search, status);
        list.before(field);

        search.addEventListener("input", () => {

            const shown = new Set(matchLabels(labels, search.value));

            links.forEach((link, index) => { link.parentElement.hidden = !shown.has(index); });

            for (const group of nav.querySelectorAll(".section-switcher__group")) {
                group.hidden = !group.querySelector("li:not([hidden])");
            }

            status.textContent = search.value.trim() === ""
                ? ""
                : shown.size === 0 ? "No tool matches." : `${shown.size} ${shown.size === 1 ? "tool matches" : "tools match"}.`;

        });

        /* Escape clears the search, the usual way out of a search box */
        search.addEventListener("keydown", event => {
            if (event.key === "Escape" && search.value !== "") {
                search.value = "";
                search.dispatchEvent(new Event("input"));
            }
        });

    }

    /* ---------- hide and show (wide screens) ---------- */

    const hide = element("button", { type: "button", class: "section-rail__hide", "aria-controls": nav.id, "aria-expanded": "true" }, "Hide tools");
    const show = element("button", { type: "button", class: "section-rail__show", "aria-controls": nav.id, "aria-expanded": "false", hidden: "" }, `Show ${sectionName}`);

    (search ? search.parentElement : list).before(hide);
    nav.after(show);

    const setCollapsed = collapsed => {

        page.classList.toggle("is-rail-collapsed", collapsed);
        nav.hidden = collapsed;
        show.hidden = !collapsed;
        hide.setAttribute("aria-expanded", String(!collapsed));
        show.setAttribute("aria-expanded", String(!collapsed));

    };

    hide.addEventListener("click", () => {

        if (!wide.matches) {
            details.open = false; // narrow: the button closes the drawer
            summary?.focus();
            return;
        }

        setCollapsed(true);
        show.focus();

    });

    show.addEventListener("click", () => {
        setCollapsed(false);
        (search ?? hide).focus();
    });

    /* ---------- wide or narrow ---------- */

    summary?.addEventListener("click", event => {

        if (wide.matches) {
            event.preventDefault(); // the heading is a label on a wide screen, not a toggle
        }

    });

    /* ---------- drawer (narrow screens) ---------- */

    const hideLabel = hide.textContent;
    const backdrop = element("button", { type: "button", class: "section-rail__backdrop", tabindex: "-1", "aria-hidden": "true", hidden: "" });

    nav.after(backdrop);
    backdrop.addEventListener("click", () => { details.open = false; summary?.focus(); });

    details.addEventListener("toggle", () => {
        backdrop.hidden = wide.matches || !details.open;
    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && !wide.matches && details.open && !(event.target === search && search.value !== "")) {
            details.open = false;
            summary?.focus();
        }

    });

    /* held open, the heading is not a control: it leaves the tab order so keyboard users do not land on a dead stop */
    const apply = () => {

        details.open = wide.matches;
        nav.classList.toggle("is-drawer", !wide.matches);
        hide.textContent = wide.matches ? hideLabel : "Close tools";
        backdrop.hidden = true;

        if (wide.matches) {
            summary?.setAttribute("tabindex", "-1");
        } else {
            summary?.removeAttribute("tabindex");
            setCollapsed(false); // the narrow layout is the disclosure; a hidden rail would have no way back
        }

    };

    wide.addEventListener("change", apply);

    apply();

    /* A long lab brings its own exercise list (learning/lab-shell.js). Below 1500 px the two lists side by side would leave the exercise
       about 800 px, so the lab list steps aside: it starts hidden with "Show Practice Labs" above the tool. Nothing is stored. */
    document.addEventListener("tz:lab-workspace", () => {

        if (wide.matches && !window.matchMedia("(min-width: 1500px)").matches) {
            setCollapsed(true);
        }

    });

}
