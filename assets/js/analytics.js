/* =========================================================
   ToolZen Hub
   Analytics consent and Google Analytics 4 (gtag.js)

   Present only in the production build, on pages that carry
   <meta name="tz-analytics-id">. Nothing from Google loads, and
   no analytics cookie is set, until the visitor presses
   "Accept analytics". "Reject analytics" loads nothing at all.
   The choice is kept in localStorage ("tz-analytics-consent").

   Only the page address WITHOUT its query string or fragment is
   sent as the page location, so text typed into a search box
   (categories.html?q=...) or a tool can never reach Analytics.
   No calculator or tool code calls this module, and no custom
   events are sent.
========================================================= */

import { SITE } from "./site-config.js";

const STORAGE_KEY = "tz-analytics-consent";
const ID_PATTERN = /^G-[A-Z0-9]{10}$/;

/* Analytics runs on the production domain only (never on localhost, previews or test hosts). */
export function isProductionHost(hostname) {
    const host = new URL(SITE.origin).hostname;
    return hostname === host || hostname === `www.${host}`;
}

/* Page address without query string or fragment. */
export function cleanPageLocation(location) {
    return `${location.origin}${location.pathname}`;
}

function readChoice() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === "granted" || value === "denied" ? value : null;
    } catch {
        return null;
    }
}

function writeChoice(value) {
    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch {
        /* storage blocked: the choice applies to this page only */
    }
}

function deleteGoogleCookies() {
    const host = location.hostname;
    const parent = host.replace(/^www\./, "");
    for (const part of document.cookie.split(";")) {
        const name = part.split("=")[0].trim();
        if (!/^_ga(_.+)?$/.test(name)) continue;
        for (const domain of [null, host, `.${host}`, `.${parent}`]) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
        }
    }
}

function loadAnalytics(id) {
    if (window.__tzAnalyticsLoaded) return;
    window.__tzAnalyticsLoaded = true;
    window[`ga-disable-${id}`] = false;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    // One page_view per document, sent by this single config call (the tag is loaded here, after consent).
    gtag("config", id, {
        page_location: cleanPageLocation(location),
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
}

function init() {
    const meta = document.querySelector('meta[name="tz-analytics-id"]');
    const id = meta && meta.content;
    if (!id || !ID_PATTERN.test(id) || !isProductionHost(location.hostname)) return;

    const base = document.querySelector('meta[name="tz-site-base"]')?.content || "/";
    let banner = null;
    let opener = null;

    const statusText = () => {
        const choice = readChoice();
        return choice === "granted" ? "Analytics: accepted." : choice === "denied" ? "Analytics: rejected." : "Analytics: no choice made yet.";
    };

    const updateStatus = () => {
        document.querySelectorAll("[data-tz-analytics-status]").forEach((el) => {
            el.textContent = statusText();
        });
    };

    const decide = (choice) => {
        writeChoice(choice);
        if (choice === "granted") {
            loadAnalytics(id);
        } else {
            window[`ga-disable-${id}`] = true;
            deleteGoogleCookies();
        }
        if (banner) {
            banner.remove();
            banner = null;
        }
        updateStatus();
        if (opener) opener.focus();
        opener = null;
    };

    const show = (focus) => {
        if (banner) return;
        banner = document.createElement("section");
        banner.className = "tz-consent";
        banner.setAttribute("role", "region");
        banner.setAttribute("aria-label", "Analytics cookies");
        banner.innerHTML =
            '<p class="tz-consent__text">May we use Google Analytics cookies to count visits and see which pages are useful? ' +
            "Nothing you type into a calculator or tool is sent. " +
            `<a href="${base}privacy.html">Privacy Policy</a></p>` +
            '<div class="tz-consent__actions">' +
            '<button type="button" class="tz-consent__btn" data-choice="denied">Reject analytics</button>' +
            '<button type="button" class="tz-consent__btn" data-choice="granted">Accept analytics</button>' +
            "</div>";
        banner.addEventListener("click", (event) => {
            const button = event.target.closest("[data-choice]");
            if (button) decide(button.dataset.choice);
        });
        document.body.appendChild(banner);
        if (focus) banner.querySelector("[data-choice]").focus();
    };

    document.querySelectorAll("[data-tz-analytics-settings]").forEach((el) => {
        el.addEventListener("click", () => {
            opener = el;
            show(true);
        });
    });
    updateStatus();

    const choice = readChoice();
    if (choice === "granted") loadAnalytics(id);
    else if (choice === null) show(false);
}

if (typeof document !== "undefined") init();
