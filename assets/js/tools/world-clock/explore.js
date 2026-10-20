/* =========================================================
   ToolZen Hub
   World Clock 2.0: the Explore view (Tool Pack 28, section 20)

   Loaded separately from the page shell (index.js), only when the
   Explore view is wanted. It draws what explore-model.js decides:
   the controls (sort, filters, tolerance), the summary, the groups of
   rows, the other-time-zones disclosure, the empty states and the
   nearest-place suggestions.

   Behaviour that matters (section 20.8a):
   - The whole result set and every count are known before any row is
     drawn; only the rows are drawn progressively (the first 40 at
     once, then chunks of 40 when the browser is idle).
   - A chunk only ever appends: nothing already drawn is removed, moved
     or refocused. The first keyboard interaction in the results draws
     everything still pending in one pass, so Tab reaches every match.
   - A minute tick rewrites the text of the rows in place. If the set
     of matches changed while focus is inside the results, the change
     waits behind a visible "Results changed. Update" button.
   - Nothing here announces on a tick, and nothing announces per chunk.
   - Every visitor-typed word reaches the page through textContent.
========================================================= */

import {
    wallAt
} from "../time-zone-converter/time-zone-engine.js";

import {
    REGIONS
} from "./city-directory.js";

import {
    countriesIn,
    clockParts,
    dayPhase,
    dayWord
} from "./clock-engine.js";

import {
    runExplore,
    sameAnswer,
    cityPlaces,
    SORTS
} from "./explore-model.js";

import {
    DEFAULT_TOLERANCE,
    TOLERANCES
} from "./time-query.js";

const CHUNK = 40;

/* the height of a row and the gap between rows (world-clock.css), for the space kept for rows not yet drawn */
const ROW_HEIGHT = 96;
const ROW_GAP = 8;

const SORT_LABELS = Object.freeze({
    city: "City (A to Z)",
    country: "Country",
    time: "Local time",
    offset: "UTC offset"
});

const WEEKDAY = Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

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

function setText(node, value) {

    if (node.textContent !== value) {
        node.textContent = value;
    }

}

/*
 * mountExplore(panel, context) -> the view's handle.
 * context: {
 *   here                 the visitor's zone
 *   hour12()             the current clock style
 *   onBoard(place)       is it on the board
 *   isFull()             is the board full
 *   max                  the board's limit
 *   add(place, via)      put a place on the board
 *   announce(text)       the one polite region
 *   countryData()        the loaded country module or null
 *   countryState()       "loading" | "ready" | "failed"
 *   loadCountryData()    a promise
 *   icons                { day, night } inline SVG strings
 *   showFilters          true to open the filters at the start
 * }
 */
export function mountExplore(panel, context) {

    const { here, icons } = context;

    const view = {
        query: "",
        region: "",
        country: "",
        sortChoice: "",
        tolerance: DEFAULT_TOLERANCE,
        othersOpen: false
    };

    let answer = null;
    let pendingAnswer = null;
    let queue = [];
    let handle = null;
    let token = 0;
    let slowTimer = null;
    let summaryTimer = null;

    /* key -> latest snapshot row, so a row drawn late still shows the current time */
    let latest = new Map();

    /* key -> the parts of every row drawn so far (a place sits in one list at a time) */
    let drawn = new Map();

    let lists = [];

    /* ---------- the controls ---------- */

    panel.replaceChildren();

    const controls = element("div", "wc-x-controls");

    const field = (labelText, control, id) => {

        const wrap = element("div", "wc-field");

        const label = element("label", "wc-label", labelText);

        label.htmlFor = id;

        control.id = id;

        wrap.append(label, control);

        return wrap;

    };

    const sortSelect = element("select", "wc-input wc-select");

    for (const key of SORTS) {

        const option = element("option", "", SORT_LABELS[key]);

        option.value = key;

        sortSelect.append(option);

    }

    const toleranceSelect = element("select", "wc-input wc-select");

    for (const minutes of TOLERANCES) {

        const option = element("option", "", `±${minutes} minutes`);

        option.value = String(minutes);

        toleranceSelect.append(option);

    }

    toleranceSelect.value = String(view.tolerance);

    /* "Best match" is offered only while a typed name is searched */
    const bestMatch = element("option", "", "Best match");

    bestMatch.value = "relevance";

    bestMatch.hidden = true;

    bestMatch.disabled = true;

    sortSelect.prepend(bestMatch);

    const sortField = field("Sort by", sortSelect, "wc-sort");

    const toleranceField = field("Around the time, within", toleranceSelect, "wc-tolerance");

    toleranceField.hidden = true;

    const filtersToggle = element("button", "wc-input wc-filters-toggle");

    filtersToggle.type = "button";
    filtersToggle.id = "wc-filters-toggle";
    filtersToggle.setAttribute("aria-expanded", "false");
    filtersToggle.setAttribute("aria-controls", "wc-filters");

    const filtersLabel = element("span", "", "Filters");

    filtersToggle.append(filtersLabel, element("span", "", "▾"));

    filtersToggle.lastChild.setAttribute("aria-hidden", "true");

    const filtersWrap = element("div", "wc-field wc-field--filters");

    filtersWrap.append(element("span", "wc-label", "Region and country"), filtersToggle);

    const filters = element("div", "wc-filters");

    filters.id = "wc-filters";
    filters.hidden = true;

    const regionSelect = element("select", "wc-input wc-select");

    const allRegions = element("option", "", "All regions");

    allRegions.value = "";

    regionSelect.append(allRegions);

    for (const region of REGIONS) {

        const option = element("option", "", region);

        option.value = region;

        regionSelect.append(option);

    }

    const countrySelect = element("select", "wc-input wc-select");

    const clearFilters = element("button", "wc-link-button", "Clear filters");

    clearFilters.type = "button";
    clearFilters.hidden = true;

    filters.append(
        field("Region", regionSelect, "wc-region"),
        field("Country", countrySelect, "wc-country"),
        clearFilters
    );

    controls.append(sortField, toleranceField, filtersWrap);

    /* ---------- the results region ---------- */

    const results = element("section", "wc-x-results");

    results.setAttribute("aria-labelledby", "wc-x-heading");

    const heading = element("h2", "wc-x-heading", "All listed cities");

    heading.id = "wc-x-heading";

    const countLine = element("p", "wc-x-countline");

    const progress = element("p", "wc-x-progress");

    const updated = element("p", "wc-x-updated");

    const stale = element("button", "wc-link-button wc-x-stale", "Results changed. Update");

    stale.type = "button";
    stale.hidden = true;

    const notes = element("div", "wc-x-notes");

    const empty = element("div", "wc-x-empty");

    empty.hidden = true;

    const groupsEl = element("div", "wc-x-groups");

    const othersEl = element("div", "wc-x-others");

    const suggestEl = element("div", "wc-x-suggest");

    suggestEl.hidden = true;

    results.append(heading, countLine, progress, updated, stale, notes, empty, groupsEl, othersEl, suggestEl);

    panel.append(controls, filters, results);

    /* ---------- rows ---------- */

    const rowTime = (row) => {

        const parts = clockParts(Math.floor(row.local / 60), row.local % 60, context.hour12());

        const day = row.dayNumber !== hereDay ? `${WEEKDAY[row.weekday]} ` : "";

        return `${day}${parts.text}`;

    };

    let hereDay = 0;

    const offsetText = (seconds) => {

        const sign = seconds < 0 ? "−" : "+";

        const abs = Math.abs(seconds);

        return `UTC${sign}${String(Math.floor(abs / 3600)).padStart(2, "0")}:${String(Math.floor((abs % 3600) / 60)).padStart(2, "0")}`;

    };

    const buttonState = (place) => {

        if (context.onBoard(place)) {
            return { text: "On your board", name: `${place.label} is on your board`, inert: true };
        }

        if (context.isFull()) {
            return { text: "Board full", name: `${place.label}: the board is full, remove a clock in My clocks to add another`, inert: true };
        }

        return { text: "Add", name: `Add ${place.label}`, inert: false };

    };

    function paintButton(parts) {

        const state = buttonState(parts.place);

        setText(parts.add, state.text);

        parts.add.setAttribute("aria-label", state.name);

        if (state.inert) {
            parts.add.setAttribute("aria-disabled", "true");
        } else {
            parts.add.removeAttribute("aria-disabled");
        }

        parts.add.classList.toggle("wc-xrow__add--inert", state.inert);

    }

    function paintRow(parts, row) {

        setText(parts.clock, rowTime(row));
        setText(parts.offset, offsetText(row.offsetSeconds));

        const phase = dayPhase(row.local);

        if (parts.phase !== phase) {

            parts.phase = phase;

            parts.icon.innerHTML = phase === "day" ? icons.day : icons.night;

        }

        setText(parts.word, dayWord(phase));

    }

    function createRow(row, extra = "") {

        const place = row.place;

        const li = element("li", "wc-xrow");

        li.dataset.key = place.key;

        const text = element("div", "wc-xrow__text");

        text.append(
            element("span", "wc-xrow__main", place.title),
            element("span", "wc-xrow__sub", place.kind === "zone" ? (place.note || `Time zone · ${place.subtitle}`) : place.subtitle)
        );

        if (extra) {
            text.append(element("span", "wc-xrow__near", extra));
        }

        const time = element("div", "wc-xrow__time");

        const clock = element("span", "wc-xrow__clock");

        const offset = element("span", "wc-xrow__offset");

        const day = element("span", "wc-xrow__day");

        const icon = element("span", "wc-xrow__icon");

        icon.setAttribute("aria-hidden", "true");

        const word = element("span", "wc-xrow__word");

        day.append(icon, word);

        time.append(clock, offset, day);

        const add = element("button", "wc-xrow__add");

        add.type = "button";

        const parts = { li, clock, offset, icon, word, add, place, phase: "" };

        add.addEventListener("click", (event) => {

            if (add.getAttribute("aria-disabled") === "true") {
                return;
            }

            context.add(place, event.detail === 0 ? "keyboard" : "pointer");

            refreshButtons();

        });

        li.append(text, time, add);

        paintRow(parts, row);

        paintButton(parts);

        return parts;

    }

    function refreshButtons() {

        for (const parts of drawn.values()) {
            paintButton(parts);
        }

    }

    /* ---------- progressive drawing ---------- */

    const idle = (fn) =>
        typeof window.requestIdleCallback === "function"
            ? window.requestIdleCallback(fn, { timeout: 500 })
            : setTimeout(fn, 0);

    const cancelIdle = (id) => {

        if (id === null) {
            return;
        }

        if (typeof window.cancelIdleCallback === "function" && typeof window.requestIdleCallback === "function") {
            window.cancelIdleCallback(id);
        } else {
            clearTimeout(id);
        }

    };

    let total = 0;
    let shown = 0;

    /*
     * Rows still to come are reserved as empty space at the end of their list, sized like the rows they will be, so
     * whatever sits below the list does not jump when a chunk (or the flush on scroll) arrives.
     */
    function reserveSpace() {

        for (const list of lists) {

            const pending = queue.reduce((n, item) => n + (item.ul === list ? 1 : 0), 0);

            if (pending === 0) {

                list.removeAttribute("data-pending");

                continue;

            }

            const columns = Math.max(1, getComputedStyle(list).gridTemplateColumns.split(" ").length);

            list.style.setProperty("--wc-pending-height", `${Math.ceil(pending / columns) * (ROW_HEIGHT + ROW_GAP) - ROW_GAP}px`);

            list.setAttribute("data-pending", "");

        }

    }

    function paintProgress() {

        const done = queue.length === 0;

        reserveSpace();

        for (const list of lists) {
            list.setAttribute("aria-busy", done ? "false" : "true");
        }

        progress.hidden = total <= CHUNK;

        setText(progress, done ? `All ${total} shown` : `Showing ${shown} of ${total}`);

        /* only a render that was still going after two seconds says it has finished, and only once */
        if (done && slowPending) {

            slowPending = false;

            context.announce(`All ${total} results are now shown`);

        }

    }

    function appendItems(count) {

        const batch = queue.splice(0, count);

        for (const item of batch) {

            const row = latest.get(item.key) ?? item.row;

            const parts = createRow(row);

            parts.li.setAttribute("aria-setsize", String(item.size));
            parts.li.setAttribute("aria-posinset", String(item.pos));

            item.ul.append(parts.li);

            drawn.set(item.key, parts);

            shown++;

        }

    }

    function flush() {

        if (queue.length === 0) {
            return;
        }

        cancelIdle(handle);

        handle = null;

        appendItems(queue.length);

        paintProgress();

    }

    function chunk() {

        handle = null;

        try {

            appendItems(CHUNK);

            paintProgress();

            if (queue.length) {
                handle = idle(chunk);
            }

        } catch (problem) {

            /* a failing chunk must not leave rows undrawn: draw the rest in one pass */
            try {
                flush();
            } catch (again) {
                queue = [];
                paintProgress();
            }

        }

    }

    /* the rows of one group as a list; the first CHUNK are drawn now, the rest are queued */
    function addList(rows, label, drawNow, force = false) {

        const ul = element("ul", "wc-x-list");

        ul.setAttribute("aria-label", label);

        ul.setAttribute("aria-busy", "false");

        lists.push(ul);

        rows.forEach((row, index) => {

            latest.set(row.place.key, row);

            const item = { key: row.place.key, row, ul, size: rows.length, pos: index + 1 };

            if (drawNow && index < CHUNK && (force || shown < CHUNK)) {

                const parts = createRow(row);

                parts.li.setAttribute("aria-setsize", String(item.size));
                parts.li.setAttribute("aria-posinset", String(item.pos));

                ul.append(parts.li);

                drawn.set(item.key, parts);

                shown++;

            } else {
                queue.push(item);
            }

        });

        total += rows.length;

        return ul;

    }

    function startChunks() {

        paintProgress();

        if (queue.length) {

            handle = idle(chunk);

            /* a render that takes long enough to notice says so once */
            clearTimeout(slowTimer);

            const mine = token;

            slowTimer = setTimeout(() => {

                if (mine === token && queue.length > 0) {
                    slowPending = true;
                }

            }, 2000);

        }

    }

    let slowPending = false;

    /* ---------- the answer ---------- */

    const hour12 = () => context.hour12();

    function compute(nowMs) {

        return runExplore({
            query: view.query,
            region: view.region,
            country: view.country,
            sort: view.sortChoice === "relevance" ? "" : view.sortChoice,
            tolerance: view.tolerance,
            nowMs,
            countryData: context.countryData(),
            hour12: hour12()
        });

    }

    function cancel() {

        token++;

        slowPending = false;

        cancelIdle(handle);

        handle = null;

        clearTimeout(slowTimer);

        queue = [];

    }

    function othersLabel(a) {

        const state = context.countryState();

        if (state === "failed") {
            return "Other time zones could not be loaded";
        }

        if (state !== "ready") {
            return "Loading other time zones…";
        }

        return `Other time zones (no listed city): ${a.counts.others}`;

    }

    function draw(a) {

        cancel();

        a.instantHere = wallAt(a.instant, here);

        hereDay = a.instantHere.dayNumber;

        answer = a;

        pendingAnswer = null;

        stale.hidden = true;

        latest = new Map();
        drawn = new Map();
        lists = [];
        total = 0;
        shown = 0;

        groupsEl.replaceChildren();
        othersEl.replaceChildren();
        notes.replaceChildren();
        suggestEl.replaceChildren();
        suggestEl.hidden = true;
        empty.replaceChildren();
        empty.hidden = true;

        /* heading, counts, controls that depend on the query */
        const headingText = a.mode === "all" || a.headings.length === 0
            ? "All listed cities"
            : a.headings.join(" · ");

        setText(heading, a.mode === "invalid" || a.mode === "abbreviation" ? "Search" : headingText);

        const showCounts = a.mode !== "invalid" && a.mode !== "abbreviation";

        countLine.hidden = !showCounts;

        setText(countLine, showCounts ? a.countLine : "");

        updated.hidden = a.mode !== "time";

        if (a.mode === "time") {

            const parts = clockParts(a.instantHere.h, a.instantHere.mi, hour12());

            setText(updated, `Updated ${parts.text}`);

        }

        toleranceField.hidden = a.timeKind !== "time";

        bestMatch.hidden = !a.relevance;

        bestMatch.disabled = !a.relevance;

        const effectiveSort = view.sortChoice === "relevance" && !a.relevance
            ? "city"
            : view.sortChoice || (a.mode === "time" ? "time" : a.relevance ? "relevance" : "city");

        sortSelect.value = effectiveSort;

        for (const text of a.notes) {
            notes.append(element("p", "wc-x-note", text));
        }

        if (a.mode === "invalid") {

            notes.append(element("p", "wc-x-note wc-x-note--hint", a.hint));

            paintProgress();

            return;

        }

        if (a.mode === "abbreviation") {

            paintProgress();

            return;

        }

        const multi = a.groups.length > 1;

        a.groups.forEach((group, index) => {

            if (multi) {

                const sub = element("h3", "wc-x-group-heading", a.headings[index] ?? "");

                groupsEl.append(sub);

                const count = element("p", "wc-x-group-count", `${group.rows.length} listed ${group.rows.length === 1 ? "city" : "cities"}`);

                groupsEl.append(count);

            }

            if (group.rows.length === 0 && multi) {

                groupsEl.append(element("p", "wc-x-none", "No listed city matches this reading right now."));

                return;

            }

            if (group.rows.length === 0) {
                return;
            }

            groupsEl.append(addList(group.rows, multi ? (a.headings[index] ?? "Places") : "Listed cities", true));

        });

        drawOthers(a);

        if (a.empty) {
            drawEmpty(a);
        }

        startChunks();

    }

    function drawOthers(a) {

        const state = context.countryState();

        if (a.mode === "invalid") {
            return;
        }

        const wrap = element("div", "wc-others");

        const toggle = element("button", "wc-others__toggle");

        toggle.type = "button";

        const ready = state === "ready";

        const open = ready && view.othersOpen && a.others.rows.length > 0;

        toggle.setAttribute("aria-expanded", String(open));

        toggle.disabled = !ready;

        toggle.append(element("span", "", othersLabel(a)), element("span", "", "▾"));

        toggle.lastChild.setAttribute("aria-hidden", "true");

        wrap.append(toggle);

        const body = element("div", "wc-others__body");

        body.hidden = !open;

        body.id = "wc-others-body";

        toggle.setAttribute("aria-controls", "wc-others-body");

        wrap.append(body);

        if (ready) {

            if (a.others.rows.length === 0) {
                body.append(element("p", "wc-x-none", "No other time zone matches."));
            }

        }

        let built = false;

        const build = (force) => {

            if (built || !ready || a.others.rows.length === 0) {
                return;
            }

            built = true;

            body.append(addList(a.others.rows, "Other time zones", true, force));

            startChunks();

        };

        if (open) {
            build(false);
        }

        toggle.addEventListener("click", () => {

            if (toggle.disabled) {
                return;
            }

            const nowOpen = toggle.getAttribute("aria-expanded") !== "true";

            view.othersOpen = nowOpen;

            toggle.setAttribute("aria-expanded", String(nowOpen));

            body.hidden = !nowOpen;

            if (nowOpen) {
                build(true);
            }

        });

        othersEl.append(wrap);

    }

    function drawEmpty(a) {

        empty.hidden = false;

        const message = element("p", "wc-x-empty__message", a.empty.message);

        empty.append(message);

        if (a.empty.widenTo) {

            const widen = element("button", "calculator-form__button calculator-form__button--secondary wc-button", `Widen to ±${a.empty.widenTo} minutes`);

            widen.type = "button";

            widen.addEventListener("click", () => {

                view.tolerance = a.empty.widenTo;

                toleranceSelect.value = String(view.tolerance);

                rebuild(true);

            });

            empty.append(widen);

        } else if (a.timeKind === null) {

            const open = element("button", "wc-link-button", "Open Filters");

            open.type = "button";

            open.addEventListener("click", () => setFiltersOpen(true, true));

            empty.append(open);

        }

        if (a.empty.suggestions && a.empty.suggestions.length) {

            suggestEl.hidden = false;

            suggestEl.append(element("h3", "wc-x-suggest__heading", "Nearest places (not matches)"));

            const ul = element("ul", "wc-x-list wc-x-list--near");

            ul.setAttribute("aria-label", "Nearest places, not matches");

            for (const item of a.empty.suggestions) {

                latest.set(item.row.place.key, item.row);

                const parts = createRow(item.row, item.distance);

                ul.append(parts.li);

                drawn.set(`near:${item.row.place.key}`, parts);

            }

            suggestEl.append(ul);

        }

    }

    /* ---------- recompute: visitor-driven (replaces) and tick-driven (careful) ---------- */

    function rebuild(visitor, nowMs = Date.now()) {

        const next = compute(nowMs);

        if (visitor) {
            view.othersOpen = next.others.expanded;
        }

        draw(next);

        if (visitor) {
            scheduleSummary(next);
        }

    }

    function cancelSummary() {

        clearTimeout(summaryTimer);

    }

    function scheduleSummary(a) {

        clearTimeout(summaryTimer);

        summaryTimer = setTimeout(() => {

            if (a === answer) {
                context.announce(a.announce);
            }

        }, 700);

    }

    function resultsHaveFocus() {

        const active = document.activeElement;

        return Boolean(active) && (groupsEl.contains(active) || othersEl.contains(active) || suggestEl.contains(active));

    }

    /* the minute tick, or the panel coming back into view */
    function tick(nowMs = Date.now()) {

        if (!answer) {
            return;
        }

        const next = compute(nowMs);

        if (sameAnswer(answer, next)) {

            next.instantHere = wallAt(nowMs, here);

            hereDay = next.instantHere.dayNumber;

            for (const row of [...next.groups.flatMap((group) => group.rows), ...next.others.rows]) {

                latest.set(row.place.key, row);

                const parts = drawn.get(row.place.key);

                if (parts) {
                    paintRow(parts, row);
                }

            }

            for (const item of next.empty?.suggestions ?? []) {

                const parts = drawn.get(`near:${item.row.place.key}`);

                if (parts) {
                    paintRow(parts, item.row);
                }

            }

            if (next.mode === "time") {

                const clock = clockParts(next.instantHere.h, next.instantHere.mi, hour12());

                setText(updated, `Updated ${clock.text}`);

            }

            answer = { ...next, instantHere: next.instantHere };

            return;

        }

        if (resultsHaveFocus()) {

            pendingAnswer = next;

            stale.hidden = false;

            return;

        }

        draw(next);

    }

    stale.addEventListener("click", () => {

        const next = pendingAnswer ?? compute(Date.now());

        draw(next);

        stale.hidden = true;

    });

    /* ---------- the keyboard flush ---------- */

    results.addEventListener("keydown", (event) => {

        if (["Tab", "ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(event.key)) {
            flush();
        }

    });

    results.addEventListener("focusin", flush);

    window.addEventListener("scroll", () => flush(), { passive: true });

    /* ---------- the controls' behaviour ---------- */

    sortSelect.addEventListener("change", () => {

        view.sortChoice = sortSelect.value;

        rebuild(true);

    });

    toleranceSelect.addEventListener("change", () => {

        view.tolerance = Number(toleranceSelect.value);

        rebuild(true);

    });

    function setFiltersOpen(open, focus = false) {

        filters.hidden = !open;

        filtersToggle.setAttribute("aria-expanded", String(open));

        if (open) {

            populateCountries();

            if (focus) {
                regionSelect.focus();
            }

        }

    }

    filtersToggle.addEventListener("click", () => setFiltersOpen(filters.hidden));

    function paintFilterLabel() {

        const n = (view.region ? 1 : 0) + (view.country ? 1 : 0);

        setText(filtersLabel, n ? `Filters (${n})` : "Filters");

        clearFilters.hidden = n === 0;

    }

    function populateCountries() {

        const data = context.countryData();

        countrySelect.replaceChildren();

        const all = element("option", "", context.countryState() === "failed" ? "Country list unavailable" : data ? "All countries" : "Loading countries…");

        all.value = "";

        countrySelect.append(all);

        if (!data) {

            countrySelect.disabled = true;

            return;

        }

        const countries = countriesIn(view.region || null, data);

        for (const country of countries) {

            const option = element("option", "", country.name);

            option.value = country.code;

            countrySelect.append(option);

        }

        countrySelect.disabled = false;

        if (!countries.some((country) => country.code === view.country)) {
            view.country = "";
        }

        countrySelect.value = view.country;

    }

    regionSelect.addEventListener("change", () => {

        view.region = regionSelect.value;

        populateCountries();

        paintFilterLabel();

        rebuild(true);

    });

    countrySelect.addEventListener("change", () => {

        view.country = countrySelect.value;

        paintFilterLabel();

        rebuild(true);

    });

    clearFilters.addEventListener("click", () => {

        view.region = "";
        view.country = "";

        regionSelect.value = "";

        populateCountries();

        paintFilterLabel();

        rebuild(true);

        regionSelect.focus();

    });

    populateCountries();

    paintFilterLabel();

    /* the country data arrives later: the filters, the other-zones group and country searches all need it */
    context.loadCountryData().then(() => {

        populateCountries();

        if (!answer) {
            return;
        }

        const next = compute(Date.now());

        if (resultsHaveFocus()) {

            pendingAnswer = next;

            stale.hidden = false;

            return;

        }

        view.othersOpen = view.othersOpen || next.others.expanded;

        draw(next);

    });

    /* ---------- the handle ---------- */

    rebuild(true);

    return {

        /* the shared search field changed */
        setQuery(text) {

            if (text !== view.query) {

                view.query = text;

                view.tolerance = DEFAULT_TOLERANCE;

                toleranceSelect.value = String(view.tolerance);

            }

            rebuild(true);

        },

        tick,

        cancelSummary,

        refreshButtons,

        /* the hour style changed: every row and the summary are redrawn */
        restyle() {
            rebuild(false);
        },

        /* Enter in the search field: the first result's Add button */
        focusFirstResult() {

            flush();

            const first = results.querySelector(".wc-xrow__add");

            if (first) {

                first.focus();

                return true;

            }

            return false;

        },

        count: () => cityPlaces().list.length,

        destroy() {
            cancel();
        }

    };

}
