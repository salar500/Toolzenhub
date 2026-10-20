/* =========================================================
   ToolZen Hub
   World Clock (Time Tools)

   Two views of the world's clocks: Explore cities (a searchable live
   directory of 195 cities and the other time zones, in explore.js) and
   My clocks (a board of up to 12 city clocks plus the visitor's own).
   This file is the page shell: the live "Your time" line, the one
   search field with its time shortcuts, the two tabs, the board, and
   the one minute timer. The calculations are in clock-engine.js (with
   the Time Zone Converter's pure engine behind it) and time-query.js
   (what "8 PM" or "UTC+05:30" means); the cities are in
   city-directory.js; the country data (loaded only when needed) is in
   country-zones.js.

   Behaviour that matters:
   - One shared reference instant per paint and ONE timer, aimed at
     the next minute. No interval, no per-card or per-row timers, no
     frame loop. The timer stops while the page is hidden and the
     visible view is redrawn at once when it is shown again. A view
     that is not showing is not repainted; it repaints when shown.
   - Nothing is announced on a tick. The polite region speaks only
     for adding, removing, changing the reference, a new search and
     similar actions.
   - The Explore module is a separate file, loaded when needed. If it
     cannot load, the board, the address and the hand-off keep working.
   - The optional "next clock change" line is computed AFTER the first
     paint, one card at a time, and cached; the board is complete
     without it, and a card with no change says nothing.
   - Adding a clock is confirmed where the visitor is looking (the line
     under the search box). The page never scrolls or moves focus for
     an add; "Show clock" does both, only because the visitor asked.
   - The address (cities= and ref=) is validated; everything from it
     and from the search box reaches the page through textContent.
     Searches are never put in the address.
   - No request beyond the site's own files, no geolocation, no storage.
========================================================= */

import {
    MAX_CITIES,
    SHOW_NEXT_CLOCK_CHANGE,
    createClockChangeCache,
    clockChangeText,
    buildCard,
    msUntilNextMinute,
    defaultBoard,
    parseBoardQuery,
    buildBoardQuery,
    handoffQuery,
    displayZone,
    warmZoneList,
    warmDirectory,
    usable
} from "./clock-engine.js";

import {
    DIRECTORY
} from "./city-directory.js";

import {
    isValidZone,
    localZone,
    wallAt
} from "../time-zone-converter/time-zone-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the Time Zone Converter is linked in the text and under the board. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("world-clock").title;

const TZ_TOOL =
    getToolById("time-zone-converter");

const YOU_KEY = "__you__";

const MINUTE_MARGIN_MS = 50;

const SUN = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const MOON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

const COVERAGE_HINT =
    "Search a city or country, a time such as 8 PM or 9 AM-12 PM, or a UTC offset. Not every city is listed.";

/* example searches: each fills the field and searches; none adds a clock */
/*
 * The time shortcuts (section 22.5). Each label is itself a query the Explore grammar knows as a whole phrase, so a
 * shortcut only writes its label into the search field: the field is the one place the query lives.
 */
const SHORTCUTS = Object.freeze([
    { label: "Before noon", primary: true },
    { label: "12 PM onward", primary: true },
    { label: "Evening", primary: true },
    { label: "Night", primary: true },
    { label: "Morning", primary: false },
    { label: "Afternoon", primary: false }
]);


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    const shortcut = (item) =>
        `<button type="button" class="wc-chip" data-shortcut="${item.label}" aria-pressed="false">${item.label}</button>`;

    const primaryShortcuts = SHORTCUTS.filter((item) => item.primary).map(shortcut).join("");

    const moreShortcuts = SHORTCUTS.filter((item) => !item.primary).map(shortcut).join("");

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Time Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Browse the current time in 195 cities and other time
                        zones, search by city, country or the time it is now,
                        and keep your own board of clocks.
                    </p>

                </div>

                <div class="calculator-trust-card">

                    <div class="calculator-trust-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            100% Free to Use
                        </strong>

                        <span>
                            Runs in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE TOOL -->

            <section class="calculator-section">

                <div
                    id="wc-panel"
                    class="wc-workspace"
                    data-state="loading"
                >

                    <div class="wc-here">

                        <div class="wc-here__main">

                            <span class="wc-here__label">Your time</span>

                            <p class="wc-here__time">
                                <time id="wc-here-time"><span id="wc-here-digits" class="wc-time__digits"></span> <span id="wc-here-ampm" class="wc-time__ampm"></span></time>
                            </p>

                            <p id="wc-here-date" class="wc-here__date"></p>

                            <p id="wc-here-zone" class="wc-here__zone"></p>

                        </div>

                        <label class="wc-check">
                            <input
                                type="checkbox"
                                id="wc-24h"
                            >
                            <span>24-hour clock</span>
                        </label>

                    </div>

                    <form
                        id="wc-search-form"
                        class="wc-search"
                        role="search"
                        action="#"
                    >

                        <label
                            for="wc-search"
                            class="wc-label"
                        >
                            Search cities, countries or times
                        </label>

                        <div class="wc-search-field">

                            <input
                                type="search"
                                id="wc-search"
                                class="wc-input"
                                aria-describedby="wc-search-hint"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                spellcheck="false"
                                enterkeyhint="search"
                                placeholder="City, country, 8 PM, UTC+05:30"
                            >

                            <button
                                type="button"
                                id="wc-search-clear"
                                class="wc-search-clear"
                                aria-label="Clear search"
                                hidden
                            ><span aria-hidden="true">×</span></button>

                        </div>

                        <div
                            class="wc-shortcuts"
                            role="group"
                            aria-labelledby="wc-shortcuts-label"
                        >

                            <p
                                id="wc-shortcuts-label"
                                class="wc-shortcuts__label"
                            >
                                Find places where it is now
                            </p>

                            <div class="wc-chips">${primaryShortcuts}<button
                                type="button"
                                id="wc-more-toggle"
                                class="wc-chip wc-chip--more"
                                aria-expanded="false"
                                aria-controls="wc-more-times"
                            >More times</button></div>

                            <div
                                id="wc-more-times"
                                class="wc-chips"
                                hidden
                            >${moreShortcuts}</div>

                        </div>

                        <p
                            id="wc-search-hint"
                            class="wc-hint"
                        >${COVERAGE_HINT}</p>

                    </form>

                    <p
                        id="wc-message"
                        class="wc-message"
                        hidden
                    ></p>

                    <div class="wc-tabs">

                        <div
                            class="wc-tablist"
                            role="tablist"
                            aria-label="World Clock views"
                        >

                            <button
                                type="button"
                                role="tab"
                                id="wc-tab-explore"
                                class="wc-tab"
                                aria-selected="true"
                                aria-controls="wc-view-explore"
                                tabindex="0"
                            >Explore cities</button>

                            <button
                                type="button"
                                role="tab"
                                id="wc-tab-clocks"
                                class="wc-tab"
                                aria-selected="false"
                                aria-controls="wc-view-clocks"
                                tabindex="-1"
                            >My clocks</button>

                        </div>

                    </div>

                    <div
                        id="wc-view-explore"
                        class="wc-view wc-view--explore"
                        role="tabpanel"
                        aria-labelledby="wc-tab-explore"
                    >

                        <div
                            id="wc-explore"
                            class="wc-explore"
                        >

                            <p
                                id="wc-explore-loading"
                                class="wc-x-loading"
                            >Loading the city directory…</p>

                        </div>

                    </div>

                    <div
                        id="wc-view-clocks"
                        class="wc-view wc-view--clocks"
                        role="tabpanel"
                        aria-labelledby="wc-tab-clocks"
                        hidden
                    >

                        <div class="wc-board-head">

                            <h2
                                id="wc-board-heading"
                                class="wc-board-heading"
                                tabindex="-1"
                            >
                                Your clocks
                            </h2>

                            <div class="wc-field wc-field--ref">

                                <label
                                    for="wc-ref"
                                    class="wc-label"
                                >
                                    Compare with
                                </label>

                                <select
                                    id="wc-ref"
                                    class="wc-input wc-select"
                                >
                                    <option value="">Your time</option>
                                </select>

                            </div>

                        </div>

                        <ul
                            id="wc-board"
                            class="wc-board"
                            aria-label="World clocks"
                        ></ul>

                        <div
                            id="wc-empty"
                            class="wc-empty"
                            hidden
                        >

                            <p>Add a city from Explore cities to see its time here.</p>

                            <div
                                id="wc-quick"
                                class="wc-quick"
                            ></div>

                        </div>

                        <div class="wc-actions">

                            <button
                                type="button"
                                id="wc-copy"
                                class="calculator-form__button calculator-form__button--secondary wc-button"
                            >
                                Copy link to this board
                            </button>

                            <a
                                id="wc-plan"
                                class="wc-plan"
                                href="${TZ_TOOL.href}"
                            >
                                Plan a meeting or convert a specific time across these cities
                                <span aria-hidden="true">→</span>
                            </a>

                        </div>

                        <div
                            id="wc-link-box"
                            class="wc-link-box"
                            hidden
                        >

                            <label
                                for="wc-link"
                                class="wc-label"
                            >
                                Copy this link
                            </label>

                            <input
                                type="text"
                                id="wc-link"
                                class="wc-input"
                                readonly
                            >

                        </div>

                    </div>

                </div>

            </section>

            <p
                id="wc-live"
                class="wc-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO READ -->

            <section class="calculator-info">

                <h2>
                    How to Read These Clocks
                </h2>

                <ul>
                    <li><strong>Your time</strong> is shown at the top. It uses the time zone your browser reports; nothing is sent anywhere to find it.</li>
                    <li><strong>Explore cities</strong> lists every city in the directory with its time, UTC offset and whether it is daytime there. Filter by region or country, or sort by city, country, local time or UTC offset. Regions are a way to find places, not a statement about any border.</li>
                    <li><strong>Search by time.</strong> Type <em>8 PM</em> to see where it is currently between 8:00 and 8:59 PM, <em>AM</em> or <em>PM</em> for half a day, <em>8:30 AM</em> for places within a stated window of that time, <em>9 AM-12 PM</em> for a range, or <em>UTC+05:30</em> for places on that offset right now. A bare <em>8</em> shows both 8 AM and 8 PM. Matches are what is true now: they change as the clocks move.</li>
                    <li><strong>My clocks</strong> is your own board of up to ${MAX_CITIES} cities. Each card shows that place's time, weekday and date, its UTC offset now, and how far ahead of or behind the comparison it is. Choose <em>Compare with</em> to measure against any city on the board instead of yourself.</li>
                    <li><strong>Today, Tomorrow and Yesterday</strong> refer to the date at the comparison, so you can see at a glance when a city is already on the next day.</li>
                    <li><strong>Daytime and Night-time are approximate.</strong> Daytime means the local clock reads from 06:00 to 17:59. It is not sunrise or sunset and ignores the season and the latitude.</li>
                    <li>Where a city's clocks are due to change, a short line on its card says when and by how much. It reports what this browser's time-zone data says, and nothing is shown when no change was found in the next 13 months.</li>
                </ul>

            </section>


            <!-- WHAT IT COVERS -->

            <section class="calculator-info">

                <h2>
                    What This Covers and What It Does Not
                </h2>

                <p>
                    The directory holds <strong>195 well-known cities</strong>,
                    not every city in the world. Below them, a separate group lists
                    the other time zones your browser knows that none of those
                    cities uses; you can add any of them too. If a city is not
                    listed it often shares a time zone with one that is.
                </p>

                <p>
                    Time-zone rules come from your browser's copy of the IANA
                    time-zone database, which can lag a recent change by a
                    government and can differ between browsers. Every time shown
                    comes from your device's clock: if that clock is wrong, every
                    card is wrong by the same amount. Time searches use the time
                    now in each place, including daylight saving, and are not a
                    prediction for another day.
                </p>

                <p>
                    To turn one particular date and time into other zones, or to
                    find a time that suits everyone, use the
                    <a href="${TZ_TOOL.href}">${TZ_TOOL.title}</a>.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is my location used or stored?
                    </summary>
                    <p>
                        No. The page reads your browser's time-zone name to show your
                        own time. It does not ask for your location, send anything
                        to a server, or store your choices or your searches.
                    </p>
                </details>

                <details>
                    <summary>
                        How do I keep or share my set of cities?
                    </summary>
                    <p>
                        The address in your browser changes as you add and remove
                        cities. Bookmark it or press Copy link to this board in My
                        clocks. The link holds only the cities you chose, and everyone
                        who opens it sees the differences from their own time.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does my search for a time show so few cities?
                    </summary>
                    <p>
                        A time search lists the places where the local clock reads
                        that hour right now, and at some moments few cities do. The
                        page never widens the search by itself: for a specific time
                        you can choose a wider window, and places that are merely
                        close are shown separately and are not counted as matches.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is a city missing from the list?
                    </summary>
                    <p>
                        The list is a selection. Search its country, open the group of
                        other time zones and pick the zone it uses, or type the name of
                        the zone. Two cities in the same zone always show the same time.
                    </p>
                </details>

                <details>
                    <summary>
                        Why can't I search for IST, EST or PST?
                    </summary>
                    <p>
                        One abbreviation often means several places: IST can be India,
                        Ireland or Israel, and CST can be the United States, China or
                        Cuba. Search for the city or country instead.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does the clock-change line differ from another site?
                    </summary>
                    <p>
                        Browsers carry their own copy of the time-zone database. A
                        recent rule change may be in one and not in another, and the
                        line only reports what your browser knows.
                    </p>
                </details>

                <details>
                    <summary>
                        Is there a limit on cities?
                    </summary>
                    <p>
                        Browsing is not limited. Your board holds ${MAX_CITIES} cities
                        besides your own, so it stays readable and fast.
                    </p>
                </details>

            </section>

        </div>
    `;

}


export function render(
    mount = document.querySelector("#app")
) {

    if (!mount) {
        return;
    }

    mount.innerHTML = markup();

    init();

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const panel = document.querySelector("#wc-panel");

    if (!panel) {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const searchInput = $("#wc-search");
    const searchForm = $("#wc-search-form");
    const refSelect = $("#wc-ref");
    const twentyFour = $("#wc-24h");
    const message = $("#wc-message");
    const boardHeading = $("#wc-board-heading");
    const board = $("#wc-board");
    const empty = $("#wc-empty");
    const quick = $("#wc-quick");
    const copyButton = $("#wc-copy");
    const planLink = $("#wc-plan");
    const linkBox = $("#wc-link-box");
    const linkField = $("#wc-link");
    const live = $("#wc-live");
    const hint = $("#wc-search-hint");
    const exploreHost = $("#wc-explore");
    const hereDigits = $("#wc-here-digits");
    const hereAmpm = $("#wc-here-ampm");
    const hereTime = $("#wc-here-time");
    const hereDate = $("#wc-here-date");
    const hereZone = $("#wc-here-zone");

    const supported =
        typeof Intl === "object"
        && Intl !== null
        && typeof Intl.DateTimeFormat === "function"
        && typeof Date.now === "function";

    if (!supported) {

        panel.dataset.state = "unsupported";

        board.hidden = true;

        boardHeading.hidden = true;

        searchInput.disabled = true;

        message.hidden = false;

        message.textContent = "This browser can't provide time-zone data, so the clocks can't be shown.";

        return;

    }

    /* the visitor's own zone, from the browser; never a location */
    const here = (() => {

        const zone = localZone();

        return isValidZone(zone) ? zone : "UTC";

    })();

    const hourCycle = (() => {

        try {
            return new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
        } catch (problem) {
            return "h23";
        }

    })();

    const state = {
        places: [],
        ref: null,
        hour12: hourCycle === "h11" || hourCycle === "h12"
    };

    twentyFour.checked = !state.hour12;

    const you = {
        key: YOU_KEY,
        kind: "you",
        title: "Your time",
        subtitle: displayZone(here),
        label: "Your time",
        zone: here
    };

    const cache = createClockChangeCache();

    const cards = new Map();

    let announceTimer = null;
    let minuteTimer = null;

    /* the lazily loaded country data (null until it arrives, or if it cannot) */
    let countryData = null;
    let countryLoad = null;
    let countryStatus = "loading";

    /* how many listed cities this browser can read (the Explore tab's count) */
    const cityTotal = usable(DIRECTORY).entries.length;

    let freshKey = null;

    const prefersReducedMotion = () =>
        typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ---------- small helpers ---------- */

    function element(tag, className, text) {

        const node = document.createElement(tag);

        if (className) {
            node.className = className;
        }

        if (text !== undefined) {
            node.textContent = text;
        }

        return node;

    }

    /* write only what changed */
    function setText(node, value) {

        if (node.textContent !== value) {
            node.textContent = value;
        }

    }

    function announce(text) {

        /* a pending search summary must not land after, and replace, a newer message */
        if (exploreHandle) {
            exploreHandle.cancelSummary();
        }

        clearTimeout(announceTimer);

        live.textContent = "";

        announceTimer = setTimeout(() => {
            live.textContent = text;
        }, 50);

    }

    function say(text) {

        message.hidden = text === "";

        message.textContent = text;

    }

    const refPlace = () =>
        state.ref === null ? you : state.places.find((place) => place.key === state.ref) ?? you;

    const countText = () =>
        `${state.places.length} of ${MAX_CITIES} cities`;

    const onBoard = (place) =>
        state.places.some((existing) =>
            existing.key === place.key
        );

    const isFull = () =>
        state.places.length >= MAX_CITIES;

    const idleCallback = (fn) =>
        typeof window.requestIdleCallback === "function"
            ? window.requestIdleCallback(fn, { timeout: 500 })
            : setTimeout(fn, 0);

    const plural = (n, word) =>
        `${n} ${word}${n === 1 ? "" : "s"}`;


    /* ---------- the line under the search box ---------- */

    function restoreHint() {

        hint.replaceChildren(
            isFull()
                ? `The board is full (${MAX_CITIES} cities). Remove one in My clocks to add another.`
                : COVERAGE_HINT
        );

    }

    function setHint(text, showKey = null) {

        hint.replaceChildren(text);

        if (showKey !== null) {

            const button = element("button", "wc-link-button", "Show clock");

            button.type = "button";

            button.addEventListener("click", () => showCard(showKey));

            hint.append(" ", button);

        }

    }

    const isOffscreen = (node) => {

        const rect = node.getBoundingClientRect();

        return rect.top > innerHeight - 60 || rect.bottom < 0;

    };

    /* scroll to a card and put focus on its name: only ever as the result of the visitor asking */
    function showCard(key) {

        const parts = cards.get(key);

        if (!parts) {
            return;
        }

        selectView("clocks");

        parts.li.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });

        parts.title.tabIndex = -1;

        parts.title.focus({ preventScroll: true });

    }

    function clearFresh() {

        if (freshKey !== null) {

            const parts = cards.get(freshKey);

            if (parts) {

                parts.li.classList.remove("wc-card--new");

                parts.fresh.hidden = true;

            }

            freshKey = null;

        }

    }

    function markFresh(key) {

        clearFresh();

        const parts = cards.get(key);

        if (parts) {

            parts.li.classList.add("wc-card--new");

            parts.fresh.hidden = false;

            freshKey = key;

        }

    }


    /* ---------- the address ---------- */

    function writeAddress() {

        try {

            const query = buildBoardQuery({ places: state.places, ref: state.ref });

            history.replaceState(history.state, "", `${location.pathname}${query}${location.hash}`);

        } catch (problem) {
            /* a browser that refuses replaceState simply keeps its address */
        }

        planLink.setAttribute("href", `${TZ_TOOL.href}${handoffQuery(state.places, here)}`);

    }


    /* ---------- the cards ---------- */

    function createCard(place) {

        const li = element("li", "wc-card");

        li.dataset.key = place.key;

        const head = element("div", "wc-card__head");

        const names = element("div", "wc-card__names");

        const title = element("h3", "wc-card__title");

        const sub = element("p", "wc-card__sub");

        const fresh = element("span", "wc-card__fresh", "Just added");

        fresh.hidden = true;

        names.append(title, sub, fresh);

        head.append(names);

        let remove = null;

        if (place.kind !== "you") {

            remove = element("button", "wc-card__remove", "Remove");

            remove.type = "button";

            remove.addEventListener("click", () => removePlace(place.key));

            head.append(remove);

        }

        const timeRow = element("p", "wc-card__time");

        const time = document.createElement("time");

        const digits = element("span", "wc-time__digits");

        const space = document.createTextNode(" ");

        const ampm = element("span", "wc-time__ampm");

        time.append(digits, space, ampm);

        timeRow.append(time);

        const dateRow = element("p", "wc-card__date");

        const date = element("span", "wc-card__date-text");

        const relation = element("span", "wc-card__relation");

        dateRow.append(date, relation);

        const offset = element("p", "wc-card__offset");

        const difference = element("p", "wc-card__difference");

        const status = element("div", "wc-card__status");

        const day = element("span", "wc-day");

        const dayIcon = element("span", "wc-day__icon");

        const dayWord = element("span", "wc-day__word");

        day.append(dayIcon, dayWord);

        const change = element("p", "wc-card__change");

        change.hidden = true;

        status.append(day, change);

        li.append(head, timeRow, dateRow, offset, difference, status);

        const parts = { li, title, sub, fresh, remove, time, digits, space, ampm, date, relation, offset, difference, day, dayIcon, dayWord, change, phase: "" };

        setText(title, place.title);
        setText(sub, place.kind === "you" ? `Time zone · ${place.subtitle}` : place.subtitle);

        if (remove) {
            remove.setAttribute("aria-label", `Remove ${place.label}`);
        }

        cards.set(place.key, parts);

        return parts;

    }

    function paintCard(place, nowMs, ref, refLabel, isReference) {

        const parts = cards.get(place.key) ?? createCard(place);

        let model;

        try {

            model = buildCard({ nowMs, place, ref, refLabel, isReference, hour12: state.hour12 });

        } catch (problem) {

            setText(parts.digits, "");
            setText(parts.ampm, "");
            setText(parts.date, "Time unavailable for this zone");
            setText(parts.relation, "");
            setText(parts.offset, "");
            setText(parts.difference, "");
            setText(parts.dayWord, "");
            parts.li.dataset.state = "error";

            return;

        }

        delete parts.li.dataset.state;

        setText(parts.digits, model.timeMain);
        setText(parts.ampm, model.timeSuffix);

        parts.ampm.hidden = model.timeSuffix === "";
        parts.space.textContent = model.timeSuffix === "" ? "" : " ";

        if (parts.time.getAttribute("datetime") !== model.isoLocal) {
            parts.time.setAttribute("datetime", model.isoLocal);
        }

        setText(parts.date, model.dateText);
        setText(parts.relation, model.dayRelation);
        setText(parts.offset, model.offset);
        setText(parts.difference, model.differenceText);
        setText(parts.dayWord, model.dayWord);

        if (parts.phase !== model.phase) {

            parts.phase = model.phase;

            parts.li.dataset.phase = model.phase;

            parts.dayIcon.innerHTML = model.phase === "day" ? SUN : MOON;

        }

        parts.li.classList.toggle("wc-card--reference", isReference);

    }

    /* the large "Your time" line above the tabs */
    function paintHere(nowMs) {

        let model;

        try {

            const ref = wallAt(nowMs, here);

            model = buildCard({ nowMs, place: you, ref, refLabel: "Your time", isReference: true, hour12: state.hour12 });

        } catch (problem) {
            return;
        }

        setText(hereDigits, model.timeMain);
        setText(hereAmpm, model.timeSuffix);

        hereAmpm.hidden = model.timeSuffix === "";

        if (hereTime.getAttribute("datetime") !== model.isoLocal) {
            hereTime.setAttribute("datetime", model.isoLocal);
        }

        setText(hereDate, model.dateText);
        setText(hereZone, `${displayZone(here)} · ${model.offset}`);

    }

    /* every card from ONE instant */
    function paint(nowMs = Date.now()) {

        paintHere(nowMs);

        const reference = refPlace();

        const ref = wallAt(nowMs, reference.zone);

        for (const place of [you, ...state.places]) {
            paintCard(place, nowMs, ref, reference.label, place.key === reference.key);
        }

        requeueChanges(nowMs);

    }

    function syncBoard() {

        const wanted = [you, ...state.places];

        const keys = new Set(wanted.map((place) => place.key));

        for (const [key, parts] of cards) {

            if (!keys.has(key)) {

                parts.li.remove();

                cards.delete(key);

            }

        }

        wanted.forEach((place, index) => {

            const parts = cards.get(place.key) ?? createCard(place);

            if (board.children[index] !== parts.li) {
                board.insertBefore(parts.li, board.children[index] ?? null);
            }

        });

        syncRefOptions();

        paintTabLabels();

        restoreHint();

        empty.hidden = state.places.length > 0;

        if (!empty.hidden) {
            fillQuick();
        }

        panel.dataset.state = state.places.length ? "ready" : "empty";

    }

    function syncRefOptions() {

        const keep = state.ref ?? "";

        refSelect.replaceChildren();

        const first = element("option", "", "Your time");

        first.value = "";

        refSelect.append(first);

        for (const place of state.places) {

            const option = element("option", "", place.label);

            option.value = place.key;

            refSelect.append(option);

        }

        refSelect.value = state.places.some((place) => place.key === keep) ? keep : "";

    }

    function fillQuick() {

        quick.replaceChildren();

        for (const place of defaultBoard(here)) {

            if (onBoard(place)) {
                continue;
            }

            const button = element("button", "calculator-form__button calculator-form__button--secondary wc-button", `Add ${place.title}`);

            button.type = "button";

            button.addEventListener("click", () => addPlace(place, "pointer"));

            quick.append(button);

        }

    }


    /* ---------- the optional clock-change line, after the first paint ---------- */

    let queue = [];
    let pumping = false;

    /* a zone with no change in the window says nothing at all */
    function showChange(place, result) {

        const parts = cards.get(place.key);

        if (!parts) {
            return;
        }

        const text = clockChangeText(result, state.hour12);

        setText(parts.change, text);

        parts.change.hidden = text === "";

    }

    function requeueChanges(nowMs) {

        if (!SHOW_NEXT_CLOCK_CHANGE) {
            return;
        }

        for (const place of [you, ...state.places]) {

            const found = cache.peek(place.zone, nowMs);

            if (found) {
                showChange(place, found.result);
            } else if (!queue.includes(place)) {
                queue.push(place);
            }

        }

        pump();

    }

    function pump() {

        if (pumping || queue.length === 0) {
            return;
        }

        pumping = true;

        idleCallback(() => {

            pumping = false;

            const place = queue.shift();

            if (place && cards.has(place.key)) {

                try {

                    const found = cache.get(place.zone, Date.now());

                    showChange(place, found.result);

                } catch (problem) {
                    /* the line is optional: a failure leaves the card without it */
                }

            }

            pump();

        });

    }


    /* ---------- the one timer ---------- */

    function arm() {

        clearTimeout(minuteTimer);

        minuteTimer = null;

        if (document.hidden) {
            return;
        }

        minuteTimer = setTimeout(tick, msUntilNextMinute(Date.now()) + MINUTE_MARGIN_MS);

    }

    function repaintVisible(nowMs) {

        if (activeView === "clocks") {
            paint(nowMs);
        } else {

            paintHere(nowMs);

            if (exploreHandle) {
                exploreHandle.tick(nowMs);
            }

        }

    }

    function tick() {

        minuteTimer = null;

        repaintVisible(Date.now());

        arm();

    }

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            clearTimeout(minuteTimer);

            minuteTimer = null;

            return;

        }

        repaintVisible(Date.now());

        arm();

    });

    window.addEventListener("pageshow", (event) => {

        if (event.persisted) {

            repaintVisible(Date.now());

            arm();

        }

    });


    /* ---------- adding and removing ---------- */

    /* `via` is "keyboard" or "pointer" (a mouse or touch choice): only a pointer choice on a phone may scroll */
    function addPlace(place, via = "keyboard") {

        if (onBoard(place)) {

            setHint(`${place.label} is already on your board.`);

            announce(`${place.label} is already on your board.`);

            return;

        }

        if (isFull()) {

            restoreHint();

            return;

        }

        state.places.push(place);

        say("");

        syncBoard();

        /* a card that is not showing is painted once, so it is complete when its view is opened */
        paint(Date.now());

        writeAddress();

        markFresh(place.key);

        const parts = cards.get(place.key);

        /* in Explore the new clock is in the other view: "Show clock" is always offered, and nothing scrolls */
        const off = activeView === "explore" ? true : (parts ? isOffscreen(parts.li) : false);

        const text = `Added ${place.label}. ${countText()}.`;

        setHint(isFull() ? `${text} The board is now full.` : text, off ? place.key : null);

        announce(text);

        if (parts && off && via === "pointer" && activeView === "clocks" && typeof matchMedia === "function" && matchMedia("(max-width: 719px)").matches) {
            parts.li.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
        }

        if (exploreHandle) {
            exploreHandle.refreshButtons();
        }

    }

    function removePlace(key) {

        const index = state.places.findIndex((place) => place.key === key);

        if (index < 0) {
            return;
        }

        clearFresh();

        const [gone] = state.places.splice(index, 1);

        let reset = false;

        if (state.ref === key) {

            state.ref = null;

            reset = true;

        }

        const next = state.places[index] ?? state.places[index - 1] ?? null;

        syncBoard();

        paint(Date.now());

        writeAddress();

        const target = next ? cards.get(next.key)?.remove : null;

        (target ?? boardHeading).focus();

        announce(
            reset
                ? `Removed ${gone.label}. Comparing with Your time. ${countText()}.`
                : `Removed ${gone.label}. ${countText()}.`
        );

        if (exploreHandle) {
            exploreHandle.refreshButtons();
        }

    }


    /* ---------- the country data (loaded only when needed) ---------- */

    function loadCountryData() {

        if (!countryLoad) {

            countryLoad = import("./country-zones.js")
                .then((module) => {
                    countryData = module;
                    countryStatus = "ready";
                    return module;
                })
                .catch(() => {
                    countryStatus = "failed";
                    return null;
                });

        }

        return countryLoad;

    }


    /* ---------- the two views (ARIA tabs) ---------- */

    const tabs = {
        explore: { tab: $("#wc-tab-explore"), panel: $("#wc-view-explore") },
        clocks: { tab: $("#wc-tab-clocks"), panel: $("#wc-view-clocks") }
    };

    let activeView = "explore";

    function paintTabLabels() {

        tabs.explore.tab.textContent = `Explore cities (${cityTotal})`;

        tabs.clocks.tab.textContent = `My clocks (${state.places.length})`;

    }

    /* `focus` moves focus to the tab (arrow keys); a click or a search that switches views never moves it */
    function selectView(name, { focus = false } = {}) {

        if (!tabs[name]) {
            return;
        }

        const changed = activeView !== name;

        activeView = name;

        for (const [key, parts] of Object.entries(tabs)) {

            const on = key === name;

            parts.tab.setAttribute("aria-selected", String(on));

            parts.tab.tabIndex = on ? 0 : -1;

            parts.panel.hidden = !on;

        }

        if (focus) {
            tabs[name].tab.focus();
        }

        /* the panel that was hidden did not repaint on the ticks; it repaints once now */
        if (changed) {

            if (name === "clocks") {
                paint(Date.now());
            } else if (exploreHandle) {
                exploreHandle.tick(Date.now());
            }

        }

    }

    for (const [name, parts] of Object.entries(tabs)) {

        parts.tab.addEventListener("click", () => selectView(name));

        parts.tab.addEventListener("keydown", (event) => {

            const order = ["explore", "clocks"];

            const at = order.indexOf(name);

            let to = null;

            if (event.key === "ArrowRight") {
                to = order[(at + 1) % order.length];
            } else if (event.key === "ArrowLeft") {
                to = order[(at - 1 + order.length) % order.length];
            } else if (event.key === "Home") {
                to = order[0];
            } else if (event.key === "End") {
                to = order[order.length - 1];
            }

            if (to) {

                event.preventDefault();

                selectView(to, { focus: true });

            }

        });

    }


    /* ---------- the Explore module (loaded separately) ---------- */

    let exploreHandle = null;
    let exploreLoad = null;
    let retries = 0;

    function showExploreFailure() {

        exploreHost.replaceChildren();

        const box = element("div", "wc-x-failed");

        box.append(element("p", "", "The city directory could not be loaded."));

        const retry = element("button", "calculator-form__button calculator-form__button--secondary wc-button", "Retry");

        retry.type = "button";

        retry.addEventListener("click", () => {
            exploreLoad = null;
            loadExplore();
        });

        box.append(retry);

        exploreHost.append(box);

        hint.replaceChildren("City search is unavailable right now. My clocks still works.");

    }

    function loadExplore() {

        if (exploreHandle || exploreLoad) {
            return exploreLoad;
        }

        exploreHost.replaceChildren(element("p", "wc-x-loading", "Loading the city directory…"));

        exploreHost.setAttribute("aria-busy", "true");

        /* a failed dynamic import is remembered by the browser for that address, so a retry asks for a fresh one */
        retries++;

        exploreLoad = import(retries > 1 ? `./explore.js?retry=${retries}` : "./explore.js")
            .then((module) => {

                exploreHost.replaceChildren();

                exploreHandle = module.mountExplore(exploreHost, {
                    here,
                    icons: { day: SUN, night: MOON },
                    max: MAX_CITIES,
                    hour12: () => state.hour12,
                    onBoard,
                    isFull,
                    add: (place, via) => addPlace(place, via),
                    announce,
                    clearQuery: () => {

                        searchInput.value = "";

                        syncClear();

                        clearFresh();

                        restoreHint();

                        searchInput.focus();

                    },
                    countryData: () => countryData,
                    countryState: () => countryStatus,
                    loadCountryData
                });

                exploreHost.removeAttribute("aria-busy");

                if (searchInput.value.trim() !== "") {
                    exploreHandle.setQuery(searchInput.value);
                }

                restoreHint();

                return exploreHandle;

            })
            .catch(() => {

                exploreHost.removeAttribute("aria-busy");

                exploreLoad = null;

                showExploreFailure();

                return null;

            });

        return exploreLoad;

    }


    /* ---------- the search field and its time shortcuts ---------- */

    let frame = null;

    function runSearchNow() {

        frame = null;

        if (activeView !== "explore") {

            selectView("explore");

            announce("Showing results in Explore cities");

        }

        if (exploreHandle) {
            exploreHandle.setQuery(searchInput.value);
        } else {
            loadExplore();
        }

    }

    function queueSearch() {

        if (frame !== null) {
            return;
        }

        frame = typeof requestAnimationFrame === "function"
            ? requestAnimationFrame(runSearchNow)
            : setTimeout(runSearchNow, 0);

    }

    const searchClear = $("#wc-search-clear");

    /* the query as the grammar reads a phrase: trimmed, lower case, spaces collapsed */
    const fieldPhrase = () => searchInput.value.trim().toLowerCase().replace(/s+/g, " ");

    function syncClear() {

        searchClear.hidden = searchInput.value === "";

        const phrase = fieldPhrase();

        for (const button of searchForm.querySelectorAll("[data-shortcut]")) {
            button.setAttribute("aria-pressed", String(button.dataset.shortcut.toLowerCase() === phrase));
        }

    }

    searchInput.addEventListener("input", () => {

        syncClear();

        clearFresh();

        restoreHint();

        queueSearch();

    });

    /* empties only the search text: the region and country filters belong to the directory and stay */
    searchClear.addEventListener("click", () => {

        searchInput.value = "";

        syncClear();

        clearFresh();

        restoreHint();

        runSearchNow();

        searchInput.focus();

    });

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    searchInput.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            if (activeView === "explore" && exploreHandle) {
                exploreHandle.focusFirstResult();
            }

        } else if (event.key === "Escape" && searchInput.value !== "") {

            event.preventDefault();

            searchInput.value = "";

            syncClear();

            queueSearch();

        }

    });

    /* a shortcut writes its label into the field and runs the search; pressing it again clears the field */
    for (const button of searchForm.querySelectorAll("[data-shortcut]")) {

        button.addEventListener("click", () => {

            searchInput.value = fieldPhrase() === button.dataset.shortcut.toLowerCase() ? "" : button.dataset.shortcut;

            syncClear();

            clearFresh();

            restoreHint();

            runSearchNow();

        });

    }

    const moreToggle = $("#wc-more-toggle");

    const moreTimes = $("#wc-more-times");

    moreToggle.addEventListener("click", () => {

        const open = moreToggle.getAttribute("aria-expanded") !== "true";

        moreToggle.setAttribute("aria-expanded", String(open));

        moreTimes.hidden = !open;

    });


    /* ---------- the other controls ---------- */

    refSelect.addEventListener("change", () => {

        clearFresh();

        state.ref = refSelect.value === "" ? null : refSelect.value;

        paint(Date.now());

        writeAddress();

        announce(`Comparing with ${refPlace().label}.`);

    });

    twentyFour.addEventListener("change", () => {

        state.hour12 = !twentyFour.checked;

        /* the cards and the change lines (which carry a clock reading) are both redrawn, and so are the Explore rows */
        paint(Date.now());

        if (exploreHandle) {
            exploreHandle.restyle();
        }

    });

    copyButton.addEventListener("click", async () => {

        const url = location.href;

        try {

            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
                throw new Error("no clipboard");
            }

            await navigator.clipboard.writeText(url);

            linkBox.hidden = true;

            announce("Link copied.");

        } catch (problem) {

            linkField.value = url;

            linkBox.hidden = false;

            linkField.focus();

            linkField.select();

            announce("Copy this link from the box below.");

        }

    });


    /* ---------- start ---------- */

    const parsed = parseBoardQuery(location.search);

    state.places = parsed.places.length ? parsed.places : defaultBoard(here);

    state.ref = parsed.ref;

    if (parsed.skipped > 0) {

        const n = parsed.skipped;

        const note = `${n} item${n === 1 ? "" : "s"} in this link ${n === 1 ? "was" : "were"} not recognised and ${n === 1 ? "was" : "were"} skipped.`;

        say(note);

        announce(note);

    }

    syncBoard();

    /* a valid shared board opens My clocks; anything else opens Explore (and is never stored or put in the address) */
    selectView(parsed.places.length ? "clocks" : "explore");

    paint(Date.now());

    planLink.setAttribute("href", `${TZ_TOOL.href}${handoffQuery(state.places, here)}`);

    arm();

    if (activeView === "explore") {
        loadExplore();
    }

    /* keep an address the visitor arrived with tidy (only valid values remain), without adding history */
    if (parsed.present) {
        writeAddress();
    }

    panel.dataset.ready = "true";

    /* warm the search while the page is idle (so the first keystroke is quick), then fetch the country data; both are optional */
    idleCallback(() => {

        warmZoneList();

        idleCallback(() => {

            warmDirectory();

            panel.dataset.warm = "true";

            idleCallback(() => {

                loadCountryData();

                /* a failed load waits for the visitor's Retry instead of trying again by itself */
                if (!exploreHandle && retries === 0) {
                    loadExplore();
                }

            });

        });

    });

}
