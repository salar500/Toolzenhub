/* =========================================================
   ToolZen Hub
   World Clock (Time Tools)

   A live board of up to 12 city clocks plus the visitor's own, each
   showing its time, date, UTC offset and how far ahead of or behind a
   reference it is. The calculations are in clock-engine.js (with the
   Time Zone Converter's pure engine behind it); the cities are in
   city-directory.js; the country data (loaded only when needed) is in
   country-zones.js; this file is the page around them.

   Behaviour that matters:
   - One shared reference instant per paint and ONE timer, aimed at
     the next minute. No interval, no per-card timers, no frame loop.
     The timer stops while the page is hidden and the board is redrawn
     at once when it is shown again.
   - Nothing is announced on a tick. The polite region speaks only
     for adding, removing, changing the reference and similar actions.
   - The optional "next clock change" line is computed AFTER the first
     paint, one card at a time, and cached; the board is complete
     without it, and a card with no change says nothing.
   - The search structures are warmed while the page is idle, so the
     first keystroke does not pay for them; search still works if
     the warm-up has not run.
   - Adding a clock is confirmed where the visitor is looking (the line
     under the search box). The page scrolls to the new clock only for
     a pointer or touch choice on a phone when it is off screen, and
     never moves focus or scrolls for a keyboard choice.
   - The address (cities= and ref=) is validated; everything from it
     and from the search box reaches the page through textContent.
   - No request beyond the site's own files, no geolocation, no storage.
========================================================= */

import {
    MAX_CITIES,
    MAX_BROWSE,
    SHOW_NEXT_CLOCK_CHANGE,
    createClockChangeCache,
    clockChangeText,
    buildCard,
    msUntilNextMinute,
    runSearch,
    browsePlaces,
    countryPlaces,
    countriesIn,
    countryLabel,
    defaultBoard,
    parseBoardQuery,
    buildBoardQuery,
    handoffQuery,
    describeRow,
    displayZone,
    warmZoneList,
    warmDirectory
} from "./clock-engine.js";

import {
    REGIONS
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

/* rows shown before "Show all" */
const VISIBLE_ROWS = 10;

const SUN = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const MOON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

const COVERAGE_HINT =
    "Search well-known cities, or any time zone your browser supports, such as America/Chicago. Not every city is listed.";

const BROWSE_HINT =
    "Choose a region or country to list places.";


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    const regionOptions = REGIONS.map((region) =>
        `<option value="${region}">${region}</option>`
    ).join("");

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
                        See the current time in several cities at once, with
                        each city's date, UTC offset and how far ahead of or
                        behind you it is.
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


            <!-- THE BOARD -->

            <section class="calculator-section">

                <div
                    id="wc-panel"
                    class="wc-workspace"
                    data-state="loading"
                >

                    <div class="wc-toolbar">

                        <div class="wc-field wc-field--search">

                            <label
                                for="wc-search"
                                class="wc-label"
                            >
                                Add a city
                            </label>

                            <div class="wc-combo">

                                <input
                                    type="text"
                                    id="wc-search"
                                    class="wc-input"
                                    role="combobox"
                                    aria-autocomplete="list"
                                    aria-haspopup="listbox"
                                    aria-expanded="false"
                                    aria-controls="wc-list"
                                    aria-describedby="wc-search-hint"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    autocorrect="off"
                                    spellcheck="false"
                                    placeholder="City, country or time zone"
                                >

                                <ul
                                    id="wc-list"
                                    class="wc-list"
                                    role="listbox"
                                    aria-label="Matching places"
                                    hidden
                                ></ul>

                            </div>

                            <p
                                id="wc-search-hint"
                                class="wc-hint"
                            >${COVERAGE_HINT}</p>

                        </div>

                        <div class="wc-field">

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

                        <div class="wc-field">

                            <span
                                id="wc-browse-label"
                                class="wc-label"
                            >
                                Browse places
                            </span>

                            <button
                                type="button"
                                id="wc-browse-toggle"
                                class="wc-input wc-browse-toggle"
                                aria-expanded="false"
                                aria-controls="wc-browse"
                                aria-labelledby="wc-browse-label wc-browse-toggle"
                            >
                                <span>Region or country</span>
                                <span aria-hidden="true">▾</span>
                            </button>

                        </div>

                        <div
                            id="wc-browse"
                            class="wc-browse"
                            hidden
                        >

                            <div class="wc-browse__selects">

                                <div class="wc-field">

                                    <label
                                        for="wc-region"
                                        class="wc-label"
                                    >
                                        Region
                                    </label>

                                    <select
                                        id="wc-region"
                                        class="wc-input wc-select"
                                    >
                                        <option value="">All regions</option>
                                        ${regionOptions}
                                    </select>

                                </div>

                                <div class="wc-field">

                                    <label
                                        for="wc-country"
                                        class="wc-label"
                                    >
                                        Country
                                    </label>

                                    <select
                                        id="wc-country"
                                        class="wc-input wc-select"
                                        disabled
                                    >
                                        <option value="">All countries</option>
                                    </select>

                                </div>

                            </div>

                            <div class="wc-browse__bar">

                                <p
                                    id="wc-browse-header"
                                    class="wc-browse__header"
                                >${BROWSE_HINT}</p>

                                <button
                                    type="button"
                                    id="wc-browse-clear"
                                    class="wc-link-button"
                                    hidden
                                >
                                    Clear
                                </button>

                            </div>

                            <ul
                                id="wc-browse-list"
                                class="wc-browse__list"
                            ></ul>

                            <button
                                type="button"
                                id="wc-browse-more"
                                class="calculator-form__button calculator-form__button--secondary wc-button"
                                hidden
                            >
                                Show all
                            </button>

                        </div>

                    </div>

                    <p
                        id="wc-message"
                        class="wc-message"
                        hidden
                    ></p>

                    <div class="wc-board-head">

                        <h2
                            id="wc-board-heading"
                            class="wc-board-heading"
                            tabindex="-1"
                        >
                            Your clocks
                        </h2>

                        <label class="wc-check">
                            <input
                                type="checkbox"
                                id="wc-24h"
                            >
                            <span>24-hour clock</span>
                        </label>

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

                        <p>Add a city above to see its time here.</p>

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
                    <li><strong>Your time</strong> is the first card. It uses the time zone your browser reports; nothing is sent anywhere to find it.</li>
                    <li>Each other card shows that place's time, weekday and date, its UTC offset right now, and how far ahead of or behind the comparison it is. Choose <em>Compare with</em> to measure against any city on the board instead of yourself.</li>
                    <li><strong>Browse places</strong> lists cities by region, or every time zone of a country. A country with several time zones, such as Australia or the United States, shows each one with its own time. Regions are a way to find places, not a statement about any border.</li>
                    <li><strong>Today, Tomorrow and Yesterday</strong> refer to the date at the comparison, so you can see at a glance when a city is already on the next day.</li>
                    <li><strong>Daytime and Night-time are approximate.</strong> Daytime means the local clock reads from 06:00 to 17:59. It is not sunrise or sunset and ignores the season and the latitude.</li>
                    <li>Where a city's clocks are due to change, a short line says when and by how much. It reports what this browser's time-zone data says, and nothing is shown when no change was found in the next 13 months.</li>
                </ul>

            </section>


            <!-- WHAT IT COVERS -->

            <section class="calculator-info">

                <h2>
                    What This Covers and What It Does Not
                </h2>

                <p>
                    The list holds a <strong>selection of well-known cities</strong>,
                    not every city in the world. You can also add any time zone your
                    browser supports by typing its name, such as
                    <code>America/Indiana/Knox</code>, or by choosing a country under
                    <em>Browse places</em>. If a city is not listed it often shares a
                    time zone with one that is.
                </p>

                <p>
                    Time-zone rules come from your browser's copy of the IANA
                    time-zone database, which can lag a recent change by a
                    government and can differ between browsers. Every time shown
                    comes from your device's clock: if that clock is wrong, every
                    card is wrong by the same amount.
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
                        to a server, or store your choices.
                    </p>
                </details>

                <details>
                    <summary>
                        How do I keep or share my set of cities?
                    </summary>
                    <p>
                        The address in your browser changes as you add and remove
                        cities. Bookmark it or press Copy link to this board. The link
                        holds only the cities you chose, and everyone who opens it sees
                        the differences from their own time.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is a city missing from the list?
                    </summary>
                    <p>
                        The list is a selection. Open Browse places, choose its country
                        and pick the time zone it uses, or type the name of the zone.
                        Two cities in the same zone always show the same time.
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
                        Yes: ${MAX_CITIES} cities besides your own, so the board stays
                        readable and fast.
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
    const list = $("#wc-list");
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
    const browseToggle = $("#wc-browse-toggle");
    const browsePanel = $("#wc-browse");
    const regionSelect = $("#wc-region");
    const countrySelect = $("#wc-country");
    const browseHeader = $("#wc-browse-header");
    const browseClear = $("#wc-browse-clear");
    const browseList = $("#wc-browse-list");
    const browseMore = $("#wc-browse-more");

    const supported =
        typeof Intl === "object"
        && Intl !== null
        && typeof Intl.DateTimeFormat === "function"
        && typeof Date.now === "function";

    if (!supported) {

        panel.dataset.state = "unsupported";

        board.hidden = true;

        boardHeading.hidden = true;

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

    /* the open search list: what it was built from, whether "Show all" was chosen, and its options */
    let current = { result: null, expanded: false };
    let optionPlaces = [];
    let active = -1;

    /* the lazily loaded country data (null until it arrives, or if it cannot) */
    let countryData = null;
    let countryLoad = null;

    /* the browse panel */
    const browse = { open: false, region: "", country: "", expanded: false };

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
                ? `The board is full (${MAX_CITIES} cities). Remove one to add another.`
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

    /* every card from ONE instant */
    function paint(nowMs = Date.now()) {

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

        searchInput.disabled = isFull();

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

    function tick() {

        minuteTimer = null;

        paint(Date.now());

        arm();

    }

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            clearTimeout(minuteTimer);

            minuteTimer = null;

            return;

        }

        paint(Date.now());

        arm();

    });

    window.addEventListener("pageshow", (event) => {

        if (event.persisted) {

            paint(Date.now());

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

        paint(Date.now());

        writeAddress();

        markFresh(place.key);

        const parts = cards.get(place.key);

        const off = parts ? isOffscreen(parts.li) : false;

        const text = `Added ${place.label}. ${countText()}.`;

        setHint(isFull() ? `${text} The board is now full.` : text, off ? place.key : null);

        announce(text);

        if (parts && off && via === "pointer" && typeof matchMedia === "function" && matchMedia("(max-width: 719px)").matches) {
            parts.li.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
        }

        if (browse.open) {
            renderBrowse();
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

        if (browse.open) {
            renderBrowse();
        }

    }


    /* ---------- the country data (loaded only when needed) ---------- */

    function loadCountryData() {

        if (!countryLoad) {

            countryLoad = import("./country-zones.js")
                .then((module) => {
                    countryData = module;
                    return module;
                })
                .catch(() => null);

        }

        return countryLoad;

    }


    /* ---------- one place as a row: its name, where it is, and its time now ---------- */

    function rowNodes(place, now, yourDay) {

        const text = element("span", "wc-row__text");

        text.append(element("span", "wc-row__main", place.title));

        text.append(element("span", "wc-row__sub", place.kind === "zone" ? (place.note || `Time zone · ${place.subtitle}`) : place.subtitle));

        const time = element("span", "wc-row__time");

        const info = describeRow(place, now, state.hour12);

        if (info) {

            time.append(element("span", "wc-row__clock", `${info.dayNumber !== yourDay ? `${info.weekday} ` : ""}${info.time}`));

            time.append(element("span", "wc-row__offset", info.offset));

        }

        if (onBoard(place)) {
            time.append(element("span", "wc-row__badge", "On your board"));
        }

        return [text, time];

    }


    /* ---------- the picker (an ARIA combobox) ---------- */

    const optionId = (index) =>
        `wc-option-${index}`;

    function closeList() {

        list.hidden = true;

        searchInput.setAttribute("aria-expanded", "false");
        searchInput.removeAttribute("aria-activedescendant");

        active = -1;

    }

    function setActive(index) {

        active = index;

        const options = [...list.querySelectorAll("[role='option']")];

        options.forEach((node, i) => {
            node.setAttribute("aria-selected", i === index ? "true" : "false");
        });

        if (index >= 0 && options[index]) {

            searchInput.setAttribute("aria-activedescendant", options[index].id);

            options[index].scrollIntoView({ block: "nearest" });

        } else {

            searchInput.removeAttribute("aria-activedescendant");

        }

    }

    function listRow(className, text) {

        const row = element("li", className, text);

        row.setAttribute("role", "presentation");

        list.append(row);

        return row;

    }

    /* build the open list from the current result; `keepActive` holds the highlighted option across "Show all" */
    function renderList(keepActive = -1) {

        const { result, expanded } = current;

        list.replaceChildren();

        optionPlaces = [];

        if (!result || result.mode === "empty") {

            closeList();

            return;

        }

        const now = Date.now();

        const yourDay = wallAt(now, here).dayNumber;

        if (result.header) {
            listRow("wc-list__header", result.header);
        }

        if (result.note) {
            listRow("wc-list__note", result.note);
        }

        const limit = expanded ? MAX_BROWSE : VISIBLE_ROWS;

        const shown = result.places.slice(0, limit);

        if (shown.length === 0 && result.mode !== "abbreviation") {

            const typed = searchInput.value.trim();

            const clipped = typed.length > 60 ? `${typed.slice(0, 60)}…` : typed;

            const row = listRow(
                "wc-list__note",
                `No match for "${clipped}". Try a city name such as Lisbon, a country such as Kenya, or a time-zone name such as America/Chicago. This list does not include every city in the world. `
            );

            const button = element("button", "wc-link-button", "Browse by region or country");

            button.type = "button";

            /* mousedown, so the box keeps focus and the list is not closed before the click lands */
            button.addEventListener("mousedown", (event) => {

                event.preventDefault();

                closeList();

                setBrowseOpen(true);

            });

            row.append(button);

        }

        shown.forEach((place) => {

            const index = optionPlaces.length;

            const item = element("li", "wc-list__option wc-row");

            item.id = optionId(index);
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", "false");

            item.append(...rowNodes(place, now, yourDay));

            /* mousedown so the box keeps focus until the choice is made */
            item.addEventListener("mousedown", (event) => {
                event.preventDefault();
                choose(place, "pointer");
            });

            list.append(item);

            optionPlaces.push(place);

        });

        if (!expanded && result.total > shown.length) {

            const index = optionPlaces.length;

            const item = element("li", "wc-list__option wc-list__more");

            item.id = optionId(index);
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", "false");

            item.textContent = `Show all ${result.total}`;

            item.addEventListener("mousedown", (event) => {
                event.preventDefault();
                expand();
            });

            list.append(item);

            optionPlaces.push({ more: true });

        } else if (expanded && result.total > shown.length) {

            listRow("wc-list__note", `Showing ${shown.length} of ${result.total}. Type to narrow.`);

        }

        list.hidden = false;

        searchInput.setAttribute("aria-expanded", "true");

        setActive(keepActive >= 0 && keepActive < optionPlaces.length ? keepActive : optionPlaces.length ? 0 : -1);

    }

    function expand() {

        current.expanded = true;

        renderList(0);

    }

    function open() {

        const query = searchInput.value.trim();

        if (query === "") {

            current = { result: null, expanded: false };

            closeList();

            return;

        }

        current = { result: runSearch(query, { countryData }), expanded: false };

        renderList();

        /* a country the directory does not list is found once the country data is in: search again then, if the box has not changed */
        if (!countryData) {

            loadCountryData().then((loaded) => {

                if (loaded && searchInput.value.trim() === query && !list.hidden) {

                    current = { result: runSearch(query, { countryData }), expanded: false };

                    renderList();

                }

            });

        }

    }

    function choose(place, via) {

        closeList();

        searchInput.value = "";

        current = { result: null, expanded: false };

        addPlace(place, via);

    }

    searchInput.addEventListener("input", () => {

        clearFresh();

        if (!isFull()) {
            restoreHint();
        }

        open();

    });

    searchInput.addEventListener("keydown", (event) => {

        const count = optionPlaces.length;

        if (event.key === "ArrowDown") {

            event.preventDefault();

            if (list.hidden) {
                open();
            } else if (count) {
                setActive((active + 1) % count);
            }

        } else if (event.key === "ArrowUp") {

            event.preventDefault();

            if (!list.hidden && count) {
                setActive((active - 1 + count) % count);
            }

        } else if (event.key === "Home" && !list.hidden && count) {

            event.preventDefault();

            setActive(0);

        } else if (event.key === "End" && !list.hidden && count) {

            event.preventDefault();

            setActive(count - 1);

        } else if (event.key === "Enter") {

            if (!list.hidden && active >= 0 && optionPlaces[active]) {

                event.preventDefault();

                if (optionPlaces[active].more) {
                    expand();
                } else {
                    choose(optionPlaces[active], "keyboard");
                }

            }

        } else if (event.key === "Escape") {

            if (!list.hidden) {

                event.preventDefault();

                closeList();

            }

        }

    });

    searchInput.addEventListener("blur", closeList);


    /* ---------- browse by region or country ---------- */

    function populateCountries() {

        const keep = browse.country;

        countrySelect.replaceChildren();

        const all = element("option", "", "All countries");

        all.value = "";

        countrySelect.append(all);

        if (!countryData) {

            countrySelect.disabled = true;

            all.textContent = countryLoad ? "Loading countries…" : "All countries";

            return;

        }

        const countries = countriesIn(browse.region || null, countryData);

        for (const country of countries) {

            const option = element("option", "", country.name);

            option.value = country.code;

            countrySelect.append(option);

        }

        countrySelect.disabled = false;

        const stillThere = countries.some((country) => country.code === keep);

        browse.country = stillThere ? keep : "";

        countrySelect.value = browse.country;

    }

    function renderBrowse() {

        browseList.replaceChildren();

        let places = [];
        let header = BROWSE_HINT;

        if (browse.country) {

            const found = countryPlaces(browse.country, { countryData });

            places = [...found.cities, ...found.zones];

            header = `${countryLabel(browse.country)} · ${plural(found.zoneCount, "time zone")}`;

        } else if (browse.region) {

            const found = browsePlaces(browse.region, { limit: MAX_BROWSE });

            places = found.places;

            header = `${browse.region} · ${found.total} listed ${found.total === 1 ? "city" : "cities"}. Choose a country to see every time zone it has.`;

        }

        setText(browseHeader, header);

        browseClear.hidden = !(browse.region || browse.country);

        const shown = browse.expanded ? places : places.slice(0, VISIBLE_ROWS);

        const now = Date.now();

        const yourDay = wallAt(now, here).dayNumber;

        for (const place of shown) {

            const item = element("li", "wc-browse__item");

            const button = element("button", "wc-row wc-browse__row");

            button.type = "button";

            const spoken = element("span", "wc-sr-only", "Add ");

            button.append(spoken, ...rowNodes(place, now, yourDay));

            if (onBoard(place)) {
                button.disabled = true;
            } else {
                button.addEventListener("click", (event) => addPlace(place, event.detail === 0 ? "keyboard" : "pointer"));
            }

            item.append(button);

            browseList.append(item);

        }

        const more = places.length - shown.length;

        browseMore.hidden = more <= 0;

        if (more > 0) {
            browseMore.textContent = `Show all ${places.length}`;
        }

    }

    function setBrowseOpen(open) {

        browse.open = open;

        browsePanel.hidden = !open;

        browseToggle.setAttribute("aria-expanded", String(open));

        if (open) {

            populateCountries();

            renderBrowse();

            if (!countryData) {

                loadCountryData().then((loaded) => {

                    if (loaded) {

                        populateCountries();

                        renderBrowse();

                    } else {

                        countrySelect.disabled = true;

                        countrySelect.options[0].textContent = "Country list unavailable";

                    }

                });

            }

        }

    }

    browseToggle.addEventListener("click", () => setBrowseOpen(!browse.open));

    regionSelect.addEventListener("change", () => {

        browse.region = regionSelect.value;

        browse.expanded = false;

        populateCountries();

        renderBrowse();

        announce(browseHeader.textContent);

    });

    countrySelect.addEventListener("change", () => {

        browse.country = countrySelect.value;

        browse.expanded = false;

        renderBrowse();

        announce(browseHeader.textContent);

    });

    browseClear.addEventListener("click", () => {

        browse.region = "";
        browse.country = "";
        browse.expanded = false;

        regionSelect.value = "";

        populateCountries();

        renderBrowse();

        regionSelect.focus();

    });

    browseMore.addEventListener("click", () => {

        browse.expanded = true;

        renderBrowse();

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

        /* the cards and the change lines (which carry a clock reading) are both redrawn, and so are open rows */
        paint(Date.now());

        if (!list.hidden) {
            renderList(active);
        }

        if (browse.open) {
            renderBrowse();
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

    paint(Date.now());

    planLink.setAttribute("href", `${TZ_TOOL.href}${handoffQuery(state.places, here)}`);

    arm();

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
            });

        });

    });

}
