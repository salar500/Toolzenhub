/* =========================================================
   ToolZen Hub
   World Clock (Time Tools)

   A live board of up to 12 city clocks plus the visitor's own, each
   showing its time, date, UTC offset and how far ahead of or behind a
   reference it is. The calculations are in clock-engine.js (with the
   Time Zone Converter's pure engine behind it); the cities are in
   city-directory.js; this file is the page around them.

   Behaviour that matters:
   - One shared reference instant per paint and ONE timer, aimed at
     the next minute. No interval, no per-card timers, no frame loop.
     The timer stops while the page is hidden and the board is redrawn
     at once when it is shown again.
   - Nothing is announced on a tick. The polite region speaks only
     for adding, removing, changing the reference and similar actions.
   - The optional "next clock change" line is computed AFTER the first
     paint, one card at a time, and cached; the board is complete
     without it.
   - The address (cities= and ref=) is validated; everything from it
     and from the search box reaches the page through textContent.
   - No request, no geolocation, no storage of any kind.
========================================================= */

import {
    MAX_CITIES,
    MAX_RESULTS,
    SHOW_NEXT_CLOCK_CHANGE,
    createClockChangeCache,
    clockChangeText,
    buildCard,
    msUntilNextMinute,
    searchPlaces,
    browsePlaces,
    defaultBoard,
    parseBoardQuery,
    buildBoardQuery,
    handoffQuery
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

const SUN = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const MOON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

const COVERAGE_HINT =
    "Search well-known cities, or any time zone your browser supports, such as America/Chicago. Not every city is listed.";


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
                    <li><strong>Region</strong> only narrows the city list while you search or browse. The regions are a way to find cities, not a statement about any border.</li>
                    <li><strong>Today, Tomorrow and Yesterday</strong> refer to the date at the comparison, so you can see at a glance when a city is already on the next day.</li>
                    <li><strong>Daytime and Night-time are approximate.</strong> Daytime means the local clock reads from 06:00 to 17:59. It is not sunrise or sunset and ignores the season and the latitude.</li>
                    <li>Where a city's clocks are due to change, a short line says when and by how much. It reports what this browser's time-zone data says, and nothing is shown when none was found in the next 13 months.</li>
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
                    <code>America/Indiana/Knox</code>. If a city is not listed it
                    often shares a time zone with one that is.
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
                        The list is a selection. Try its country, or type the name of
                        the time zone it uses. Two cities in the same zone always show
                        the same time.
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
    const regionSelect = $("#wc-region");
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
        subtitle: here,
        label: "Your time",
        zone: here
    };

    const cache = createClockChangeCache();

    const cards = new Map();

    let announceTimer = null;
    let minuteTimer = null;

    let optionPlaces = [];
    let active = -1;


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

    const idleCallback = (fn) =>
        typeof window.requestIdleCallback === "function"
            ? window.requestIdleCallback(fn, { timeout: 500 })
            : setTimeout(fn, 0);


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

        names.append(title, sub);

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

        const parts = { li, title, sub, remove, time, digits, space, ampm, date, relation, offset, difference, day, dayIcon, dayWord, change, phase: "" };

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

        const full = state.places.length >= MAX_CITIES;

        searchInput.disabled = full;

        hint.textContent = full
            ? `The board is full (${MAX_CITIES} cities). Remove one to add another.`
            : COVERAGE_HINT;

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

            button.addEventListener("click", () => addPlace(place));

            quick.append(button);

        }

    }


    /* ---------- the optional clock-change line, after the first paint ---------- */

    let queue = [];
    let pumping = false;

    function showChange(place, result) {

        const parts = cards.get(place.key);

        if (!parts) {
            return;
        }

        setText(parts.change, clockChangeText(result, state.hour12));

        parts.change.hidden = false;

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

    function addPlace(place) {

        if (onBoard(place)) {

            say(`${place.label} is already on your board.`);

            announce(`${place.label} is already on your board.`);

            return;

        }

        if (state.places.length >= MAX_CITIES) {

            say(`The board is full (${MAX_CITIES} cities). Remove one to add another.`);

            return;

        }

        state.places.push(place);

        say("");

        syncBoard();

        paint(Date.now());

        writeAddress();

        announce(`Added ${place.label}. ${countText()}.`);

    }

    function removePlace(key) {

        const index = state.places.findIndex((place) => place.key === key);

        if (index < 0) {
            return;
        }

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

    function noteRow(text) {

        const row = element("li", "wc-list__note", text);

        row.setAttribute("role", "presentation");

        list.append(row);

    }

    function showResults(places, { total = places.length, query = "" } = {}) {

        list.replaceChildren();

        optionPlaces = places;

        if (places.length === 0) {

            const shown = query.length > 60 ? `${query.slice(0, 60)}…` : query;

            noteRow(
                `No match for "${shown}". Try a city name such as Lisbon, a country such as Kenya, or a time-zone name such as America/Chicago. This list does not include every city in the world.`
                + (regionSelect.value ? " Try All regions." : "")
            );

        }

        places.forEach((place, index) => {

            const item = element("li", "wc-list__option");

            item.id = optionId(index);
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", "false");

            const main = element("span", "wc-list__main", place.title);

            const sub = element("span", "wc-list__sub", place.kind === "zone" ? `Time zone · ${place.subtitle}` : place.subtitle);

            item.append(main, sub);

            if (onBoard(place)) {
                item.append(element("span", "wc-list__badge", "On your board"));
            }

            /* mousedown so the box keeps focus until the choice is made */
            item.addEventListener("mousedown", (event) => {
                event.preventDefault();
                choose(place);
            });

            list.append(item);

        });

        if (total > places.length) {
            noteRow(`Showing ${places.length} of ${total}. Type to narrow.`);
        }

        list.hidden = false;

        searchInput.setAttribute("aria-expanded", "true");

        setActive(places.length ? 0 : -1);

    }

    function open() {

        const query = searchInput.value.trim();

        const region = regionSelect.value;

        if (query === "") {

            if (region === "") {
                closeList();
                return;
            }

            const found = browsePlaces(region);

            showResults(found.places, { total: found.total });

            return;

        }

        showResults(searchPlaces(query, { region, limit: MAX_RESULTS }), { query });

    }

    function choose(place) {

        closeList();

        searchInput.value = "";

        addPlace(place);

    }

    searchInput.addEventListener("input", open);

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

                choose(optionPlaces[active]);

            }

        } else if (event.key === "Escape") {

            if (!list.hidden) {

                event.preventDefault();

                closeList();

            }

        }

    });

    searchInput.addEventListener("blur", closeList);

    /* a region with an empty box lists that region's cities when the box is used; focus is never moved for the visitor */
    regionSelect.addEventListener("change", () => {

        if (searchInput.disabled) {
            return;
        }

        if (searchInput.value.trim() !== "") {
            open();
        } else {
            closeList();
        }

    });

    const openIfBrowsing = () => {

        if (searchInput.value.trim() === "" && regionSelect.value !== "" && list.hidden) {
            open();
        }

    };

    searchInput.addEventListener("focus", openIfBrowsing);
    searchInput.addEventListener("click", openIfBrowsing);


    /* ---------- the other controls ---------- */

    refSelect.addEventListener("change", () => {

        state.ref = refSelect.value === "" ? null : refSelect.value;

        paint(Date.now());

        writeAddress();

        announce(`Comparing with ${refPlace().label}.`);

    });

    twentyFour.addEventListener("change", () => {

        state.hour12 = !twentyFour.checked;

        /* the cards and the change lines (which carry a clock reading) are both redrawn */
        paint(Date.now());

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

}
