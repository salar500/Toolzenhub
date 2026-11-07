/* =========================================================
   ToolZen Hub
   Ecosystem workspace: the sidebar stays, only the page beside it changes

   Every tool, category and ecosystem page already is a real page with its own URL, title and SEO tags (built at site-build time). This
   script is a progressive enhancement over those pages: a click on a link of the same ecosystem (a sidebar link, or a card, breadcrumb or
   related link that points at one of its pages) does not load a new document. It fetches that page, and swaps only the content beside
   the sidebar for the new page's content, then starts the new tool with the same code a page load uses (ui/tool-mount.js). The
   sidebar element itself is moved into the new page's layout, so it keeps its scroll position, its search text, which groups the
   visitor opened, whether it is hidden, and the open drawer state: nothing is stored anywhere to do this.

   What stays exactly as it was:
   - every URL is a real page: opening one directly, refreshing, sharing it, a crawler reading it, and a visitor without script all get
     the full page, as before;
   - the address bar, the title, the description, the canonical and Open Graph tags and the structured data are updated to the new page,
     Back and Forward move between the pages shown, and the page is announced to assistive technology;
   - a modified click (new tab, new window, download) and every link to another ecosystem or to another kind of page is an ordinary
     navigation, and so is any page this script cannot show safely (a client-rendered Calculators page): it simply loads normally.

   The tool that is left is ended first (ui/tool-scope.js): its timers, listeners, workers and audio stop with it, as they did when the
   page was replaced by a page load.
========================================================= */

import { releaseToolScope } from "./tool-scope.js";
import { WIDE } from "./nav-mode.js";

const LAYOUT = "[data-section-page], .calculator-page";
const STYLE_TIMEOUT_MS = 6000;

const supported =
    typeof fetch === "function" &&
    typeof DOMParser === "function" &&
    typeof history?.pushState === "function";

const keyOf = (url) => `${url.pathname}${url.search}`;

let started = false;

export function initWorkspaceNav(nav) {

    if (!supported || started || !nav) {
        return;
    }

    started = true;

    let currentKey = keyOf(location);
    let sequence = 0;
    const texts = new Map();
    let status = null;

    /* ---------- which pages belong to this ecosystem ---------- */

    const known = () => {

        const keys = new Set();

        for (const a of nav.querySelectorAll("a[href]")) {
            keys.add(keyOf(new URL(a.getAttribute("href"), location.href)));
        }

        for (const group of nav.querySelectorAll("[data-href]")) {
            keys.add(keyOf(new URL(group.dataset.href, location.href)));
        }

        return keys;

    };

    /* ---------- loading ---------- */

    const fetchText = (url) => {

        const key = keyOf(url);

        if (!texts.has(key)) {

            const request = fetch(url.href, { credentials: "same-origin" }).then((response) => {

                if (!response.ok || !/html/i.test(response.headers.get("content-type") ?? "")) {
                    throw new Error(`Not a page: ${response.status}`);
                }

                return response.text();

            });

            request.catch(() => texts.delete(key));
            texts.set(key, request);

            if (texts.size > 12) {
                texts.delete(texts.keys().next().value);
            }

        }

        return texts.get(key);

    };

    /* What the new page is, or null when it cannot be shown in place (then the browser loads it normally). */
    const planFor = (doc) => {

        const main = doc.querySelector("main#app");
        const newNav = main?.querySelector("nav.section-switcher");

        if (!main || !newNav || newNav.getAttribute("aria-label") !== nav.getAttribute("aria-label")) {
            return null;
        }

        const scripts = [...doc.querySelectorAll("script[type='module'][src]")].map((script) => script.getAttribute("src"));
        const isTool = scripts.some((src) => /\/entries\/tool\.js(\?|$)/.test(src)) && !!main.dataset.toolModule;
        const isListing = scripts.some((src) => /\/entries\/directory\.js(\?|$)/.test(src));

        return isTool || isListing ? { isTool } : null;

    };

    /* ---------- the page around the workspace ---------- */

    const replaceHeadGroup = (doc, selector) => {

        for (const node of document.head.querySelectorAll(selector)) {
            node.remove();
        }

        for (const node of doc.head.querySelectorAll(selector)) {
            document.head.append(document.importNode(node, true));
        }

    };

    const syncHead = (doc) => {

        document.title = doc.title;

        replaceHeadGroup(doc, "meta[name='description'], meta[name='theme-color'], meta[name='robots'], meta[property^='og:'], meta[name^='twitter:'], link[rel='canonical']");
        replaceHeadGroup(doc, "script[type='application/ld+json']");

        for (const name of [...document.body.classList]) {
            if (name.endsWith("-page-body")) document.body.classList.remove(name);
        }

        for (const name of doc.body.classList) {
            if (name.endsWith("-page-body")) document.body.classList.add(name);
        }

    };

    const styleLinks = (root) => [...root.querySelectorAll("link[rel='stylesheet']")];

    /* Adds the new page's stylesheets that are not loaded yet (and waits for them, so the content never shows unstyled). */
    const addStyles = (doc) => {

        const loaded = new Set(styleLinks(document.head).map((link) => link.getAttribute("href")));
        const before = styleLinks(document.head).find((link) => (link.getAttribute("href") ?? "").includes("accessibility.css")) ?? null;
        const waits = [];

        for (const link of styleLinks(doc.head)) {

            const href = link.getAttribute("href");

            if (loaded.has(href)) continue;

            const added = document.createElement("link");

            added.rel = "stylesheet";
            added.href = href;

            waits.push(new Promise((resolve) => {
                added.addEventListener("load", resolve, { once: true });
                added.addEventListener("error", resolve, { once: true });
                window.setTimeout(resolve, STYLE_TIMEOUT_MS);
            }));

            document.head.insertBefore(added, before);

        }

        return Promise.all(waits);

    };

    /* Removes the stylesheets only the page that was left used, so two tools' styles never meet. */
    const removeStaleStyles = (doc) => {

        const wanted = new Set(styleLinks(doc.head).map((link) => link.getAttribute("href")));

        for (const link of styleLinks(document.head)) {
            if (!wanted.has(link.getAttribute("href"))) link.remove();
        }

    };

    /* ---------- the sidebar: same element, new current page ---------- */

    const syncCurrent = (newNav) => {

        const current = new Map([...newNav.querySelectorAll("a[href]")].map((a) => [a.getAttribute("href"), a.getAttribute("aria-current")]));

        for (const a of nav.querySelectorAll("a[href]")) {

            const value = current.get(a.getAttribute("href"));

            if (value) a.setAttribute("aria-current", value);
            else a.removeAttribute("aria-current");

        }

        const fresh = [...newNav.querySelectorAll(".section-switcher__group")];

        nav.querySelectorAll(".section-switcher__group").forEach((group, index) => {
            if (fresh[index]?.dataset.current === "true") group.dataset.current = "true";
            else delete group.dataset.current;
        });

        const label = newNav.querySelector("summary > span");
        const own = nav.querySelector("summary > span");

        if (label && own) own.textContent = label.textContent;

        nav.dispatchEvent(new Event("tz:rail-current"));

    };

    const revealCurrent = () => {

        if (!window.matchMedia(WIDE).matches) return;

        const link = nav.querySelector("a[aria-current='page']");

        if (!link || nav.hidden) return;

        const a = link.getBoundingClientRect();
        const box = nav.getBoundingClientRect();

        if (a.top < box.top + 8) nav.scrollTop -= box.top + 8 - a.top;
        else if (a.bottom > box.bottom - 8) nav.scrollTop += a.bottom - box.bottom + 8;

    };

    const announce = (text) => {

        if (!status) {
            status = document.createElement("div");
            status.className = "workspace-status";
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
            document.body.append(status);
        }

        status.textContent = text;

    };

    /* ---------- the swap ---------- */

    const busy = (on) => {

        document.getElementById("app")?.toggleAttribute("aria-busy", on);
        nav.closest(LAYOUT)?.classList.toggle("is-workspace-loading", on);

    };

    const leave = (url, push) => {

        if (push) location.assign(url.href);
        else location.reload();

    };

    const show = async (url, push) => {

        const mine = ++sequence;

        busy(true);

        let doc;
        let plan;

        try {
            doc = new DOMParser().parseFromString(await fetchText(url), "text/html");
            plan = planFor(doc);
        } catch {
            plan = null;
        }

        if (mine !== sequence) return;

        if (!plan) {
            leave(url, push);
            return;
        }

        try {

            await addStyles(doc);

            if (mine !== sequence) return;

            releaseToolScope();

            const oldMain = document.getElementById("app");
            const collapsed = nav.closest(LAYOUT)?.classList.contains("is-rail-collapsed") ?? false;
            const extras = [...(nav.parentElement?.querySelectorAll(":scope > .section-rail__backdrop, :scope > .section-rail__show") ?? [])];
            const main = document.adoptNode(doc.querySelector("main#app"));
            const newNav = main.querySelector("nav.section-switcher");

            syncCurrent(newNav);
            newNav.replaceWith(nav, ...extras);
            nav.closest(LAYOUT)?.classList.toggle("is-rail-collapsed", collapsed);
            oldMain.replaceWith(main);

            removeStaleStyles(doc);
            syncHead(doc);

            if (push) history.pushState({ workspace: true }, "", url.href);

            currentKey = keyOf(url);

            if (plan.isTool) {
                const { mountTool } = await import("./tool-mount.js");
                if (mine === sequence) await mountTool(main);
            }

            const heading = main.querySelector("h1");

            if (heading) {
                heading.setAttribute("tabindex", "-1");
                heading.focus({ preventScroll: true });
            }

            window.scrollTo(0, 0);
            revealCurrent();
            announce(`${heading?.textContent.trim() ?? doc.title} opened`);

            const details = nav.querySelector("details");

            if (details && !window.matchMedia(WIDE).matches) details.open = false;

        } catch (error) {

            console.error("Workspace could not show the page; loading it normally.", error);
            leave(url, push);
            return;

        } finally {

            if (mine === sequence) busy(false);

        }

    };

    /* ---------- events ---------- */

    document.addEventListener("click", (event) => {

        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const link = event.target instanceof Element ? event.target.closest("a[href]") : null;

        if (!link || !nav.isConnected || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

        if (!nav.contains(link) && !document.getElementById("app")?.contains(link)) return;

        const url = new URL(link.href, location.href);

        if (url.origin !== location.origin || !known().has(keyOf(url))) return;

        if (keyOf(url) === currentKey) {

            if (url.hash) return; // a jump inside the page: the browser's own

            event.preventDefault(); // the page already shown: nothing to load, but a drawer should close

            const details = nav.querySelector("details");

            if (details && !window.matchMedia(WIDE).matches) details.open = false;

            return;

        }

        event.preventDefault();
        show(url, true);

    });

    /* a visitor who points at a link is about to click it: fetch the page now */
    const warm = (event) => {

        const link = event.target instanceof Element ? event.target.closest("a[href]") : null;

        if (!link || !nav.contains(link)) return;

        const url = new URL(link.href, location.href);

        if (url.origin === location.origin && keyOf(url) !== currentKey) fetchText(url).catch(() => {});

    };

    nav.addEventListener("pointerover", warm);
    nav.addEventListener("focusin", warm);

    window.addEventListener("popstate", () => {

        const url = new URL(location.href);

        if (keyOf(url) !== currentKey) show(url, false);

    });

}
