/* =========================================================
   ToolZen Hub
   Section rail: the sidebar of an ecosystem (tool pages, category pages and the section's own page)

   The "More <section>" navigation is built at site-build time as a closed disclosure of plain links (components/section-switcher.js).
   This script turns it into the sidebar:

   - Wide screens (WIDE, see nav-mode.js: a layout of 1000px and up on a device with a fine pointer or a screen that wide, so not a phone
     in "Desktop site" mode): it is held open as a left column beside the tool, open by default, with a search box and a
     "Hide tools" button. Hidden, it takes no width: the tool gets the whole row and a "Show tools" button above it brings the list
     back. Hiding only hides; the tool, its fields and its results are not touched, and nothing is stored, so every visit starts open.
   - Narrower screens: the closed disclosure ("More <section>"), which opens as a drawer from the left over a dimmed page with the same
     searchable list and a "Close tools" button, so the tool keeps the screen. Nothing is stored; the tool is not reloaded or touched.

   Without script it stays a closed disclosure of ordinary links, so nothing depends on this file.
========================================================= */

import { initWorkspaceNav } from "./workspace-nav.js";
import { WIDE, drawerZoom, drawerWidth } from "./nav-mode.js";

export { WIDE };
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
    /* The layout container is looked up each time, not kept: the workspace swaps the page content in place (ui/workspace-nav.js) and moves
       this sidebar into the new page's container, so the container it sits in can change while the sidebar stays. */
    const pageOf = () => nav.closest("[data-section-page], .calculator-page");

    if (!details || !pageOf() || typeof window.matchMedia !== "function") {
        return;
    }

    const summary = details.querySelector("summary");
    const list = details.querySelector(".section-switcher__list");
    const links = [...nav.querySelectorAll(".section-switcher__list a")];
    const sectionName = nav.getAttribute("aria-label")?.replace(/: switch \w+$/, "") ?? "tools";
    /* what the list holds, named on the buttons and in the search: "tool" everywhere except a learning path's roadmap, which says "lesson" */
    const noun = nav.dataset.railNoun || "tool";
    const nouns = nav.dataset.railNouns || `${noun}s`;
    const wide = window.matchMedia(WIDE);

    nav.id ||= "section-rail";

    /* ---------- expandable groups ---------- */

    const groups = [...nav.querySelectorAll(".section-switcher__group")].map((node, index) => {

        const heading = node.querySelector(".section-switcher__label");
        const items = node.querySelector("ul");

        if (!heading || !items) {
            return { node, wanted: true, toggle: null, items };
        }

        const count = items.querySelectorAll("li").length;
        const toggle = element("button", { type: "button", class: "section-switcher__toggle", "aria-controls": `${nav.id}-group-${index}` });

        items.id = `${nav.id}-group-${index}`;
        toggle.append(element("span", {}, heading.textContent), element("span", { class: "section-switcher__group-count", "aria-hidden": "true" }, String(count)));
        heading.replaceWith(toggle);

        return { node, wanted: node.dataset.open !== "false", toggle, items };

    });

    const setGroup = (group, open) => {

        if (!group.toggle) return;

        group.toggle.setAttribute("aria-expanded", String(open));
        group.items.hidden = !open;

    };

    for (const group of groups) {

        setGroup(group, group.wanted);
        group.toggle?.addEventListener("click", () => {
            group.wanted = group.toggle.getAttribute("aria-expanded") !== "true";
            setGroup(group, group.wanted);
        });

    }

    /* ---------- search ---------- */

    let search = null;

    if (links.length >= SEARCH_MIN_TOOLS) {

        const labels = links.map(link => link.textContent.trim());
        const field = element("div", { class: "section-rail__search" });
        const label = element("label", { for: "section-rail-search", class: "section-rail__label" }, `Find a ${noun} in ${sectionName}`);
        const status = element("p", { class: "section-rail__status", role: "status", "aria-live": "polite" });

        search = element("input", { id: "section-rail-search", type: "search", autocomplete: "off", spellcheck: "false", placeholder: `Search ${nouns}` });
        field.append(label, search, status);
        list.before(field);

        search.addEventListener("input", () => {

            const shown = new Set(matchLabels(labels, search.value));
            const searching = search.value.trim() !== "";

            links.forEach((link, index) => { link.parentElement.hidden = !shown.has(index); });

            for (const group of groups) {

                const any = !!group.node.querySelector("li:not([hidden])");

                group.node.hidden = !any;
                setGroup(group, searching ? any : group.wanted); // a search opens every group with a match; clearing it restores the visitor's choice

            }

            status.textContent = !searching
                ? ""
                : shown.size === 0 ? `No ${noun} matches.` : `${shown.size} ${shown.size === 1 ? `${noun} matches` : `${nouns} match`}.`;

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

    const hide = element("button", { type: "button", class: "section-rail__hide", "aria-controls": nav.id, "aria-expanded": "true" }, `Hide ${nouns}`);
    const show = element("button", { type: "button", class: "section-rail__show", "aria-controls": nav.id, "aria-expanded": "false", hidden: "" }, `Show ${sectionName}`);

    (search ? search.parentElement : list).before(hide);
    nav.after(show);

    const setCollapsed = collapsed => {

        pageOf()?.classList.toggle("is-rail-collapsed", collapsed);
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

        const drawerOpen = !wide.matches && details.open;

        backdrop.hidden = !drawerOpen;
        nav.classList.toggle("is-drawer-open", drawerOpen);

        if (drawerOpen) {
            /* the drawer opens on the tool that is open, not on the top of a long list, and keyboard focus moves into it */
            nav.querySelector("a[aria-current='page']")?.scrollIntoView({ block: "center" });
            hide.focus({ preventScroll: true });
        }

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && !wide.matches && details.open && !(event.target === search && search.value !== "")) {
            details.open = false;
            summary?.focus();
        }

    });

    const sizeDrawer = () => {
        nav.style.setProperty("--rail-zoom", String(drawerZoom(window.innerWidth, window.screen?.width, wide.matches)));
        nav.style.setProperty("--rail-w", String(drawerWidth(window.innerWidth, window.screen?.width)));
    };

    /* held open, the heading is not a control: it leaves the tab order so keyboard users do not land on a dead stop */
    const apply = () => {

        details.open = wide.matches;
        nav.classList.toggle("is-drawer", !wide.matches);
        sizeDrawer();
        hide.textContent = wide.matches ? hideLabel : `Close ${nouns}`;
        backdrop.hidden = true;

        if (wide.matches) {
            summary?.setAttribute("tabindex", "-1");
        } else {
            summary?.removeAttribute("tabindex");
            setCollapsed(false); // the narrow layout is the disclosure; a hidden rail would have no way back
        }

    };

    wide.addEventListener("change", apply);

    /* the drawer's size follows the page's zoom when the screen turns (a phone in Desktop site mode) */
    window.addEventListener("resize", sizeDrawer);

    apply();

    /* The workspace shows another page in the same sidebar: the groups holding the page now shown open, and the visitor's search and
       collapse choices stay as they were. */
    nav.addEventListener("tz:rail-current", () => {

        for (const group of groups) {

            if (group.node.dataset.current === "true") {
                group.wanted = true;
                setGroup(group, true);
            }

        }

    });

    initWorkspaceNav(nav);


}
