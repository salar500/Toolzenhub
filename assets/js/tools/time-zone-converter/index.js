/* =========================================================
   ToolZen Hub
   Time Zone Converter (Time Tools)

   One chosen moment, shown in the zones you pick: a date, a time
   and a source zone ("this reading on that zone's clock"), and
   the same instant in up to five other zones. A secondary section
   finds the times when everyone is inside their own preferred
   hours.

   The rules (daylight-saving gaps and repeats, day relations,
   swap, the meeting windows) are in time-zone-engine.js and
   docs/tool-packs/19-time-zone-converter.md; this file is the
   page around them.

   - A time that does not exist, or happens twice, is explained;
     it is never moved or chosen silently.
   - There is no ticking clock: Use current time takes the
     current minute once.
   - Everything runs in the browser: no request, no geolocation,
     no storage. The address carries only the date, time, zones
     and the repeat choice, and every value in it is validated.
   - Everything the visitor typed or the address supplied is put
     on the page with textContent or as an input value, never as
     HTML.
========================================================= */

import {
    MAX_ZONES,
    MAX_TARGETS,
    DURATIONS,
    DEFAULT_DURATION,
    DEFAULT_HOURS,
    QUICK_ZONES,
    MAX_RESULT_WINDOWS,
    isValidZone,
    sameZone,
    localZone,
    listZones,
    searchZones,
    formatClock,
    nowInZone,
    convert,
    swapSource,
    addZone,
    removeZone,
    copyText,
    copyMeetingText,
    parseQuery,
    buildQuery,
    meetingOverlap,
    addDays
} from "./time-zone-engine.js";

import {
    getToolById
} from "../../data/tools.js";


/* No related calculator or article exists; the Unix converter is linked in the text. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("time-zone-converter").title;

const UNIX_TOOL =
    getToolById("unix-timestamp-converter");

const ANNOUNCE_DELAY_MS = 900;
const MAX_PICKER_OPTIONS = 8;


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    const picker = (id, label, placeholder, hint) => `
                            <div class="tz-field tz-picker" data-picker="${id}">

                                <label
                                    for="tz-${id}-input"
                                    class="tz-label"
                                >
                                    ${label}
                                </label>

                                <div class="tz-combo">

                                <input
                                    type="text"
                                    id="tz-${id}-input"
                                    class="tz-input"
                                    role="combobox"
                                    aria-autocomplete="list"
                                    aria-haspopup="listbox"
                                    aria-expanded="false"
                                    aria-controls="tz-${id}-list"
                                    aria-describedby="tz-${id}-hint"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    autocorrect="off"
                                    spellcheck="false"
                                    placeholder="${placeholder}"
                                >

                                <ul
                                    id="tz-${id}-list"
                                    class="tz-list"
                                    role="listbox"
                                    aria-label="${label} suggestions"
                                    hidden
                                ></ul>

                                </div>

                                <p
                                    id="tz-${id}-hint"
                                    class="tz-hint"
                                >${hint}</p>

                            </div>`;

    const durations = DURATIONS.map((minutes) =>
        `<option value="${minutes}"${minutes === DEFAULT_DURATION ? " selected" : ""}>${minutes} minutes</option>`
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
                        Turn a date and time in one time zone into the same
                        moment in others, and find a time that works for
                        everyone.
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
                            Calculated in your browser, nothing is uploaded
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE CONVERTER -->

            <section class="calculator-section">

                <div
                    id="tz-panel"
                    class="tz-workspace"
                    data-state="empty"
                >

                    <div class="tz-card">

                        <h2 class="tz-card__title">
                            Convert this time
                        </h2>

                        <div class="tz-source">

                            <div class="tz-field">

                                <label
                                    for="tz-date"
                                    class="tz-label"
                                >
                                    Date
                                </label>

                                <input
                                    type="date"
                                    id="tz-date"
                                    class="tz-input"
                                    min="1970-01-01"
                                    max="2100-12-31"
                                >

                            </div>

                            <div class="tz-field">

                                <label
                                    for="tz-time"
                                    class="tz-label"
                                >
                                    Time
                                </label>

                                <input
                                    type="time"
                                    id="tz-time"
                                    class="tz-input"
                                >

                            </div>

${picker("source", "From time zone", "Search, for example London", `Your time zone: <strong id="tz-local-zone">UTC</strong>`)}

                        </div>

                        <div class="tz-row-actions">

                            <button
                                type="button"
                                id="tz-now"
                                class="calculator-form__button calculator-form__button--secondary tz-button"
                            >
                                Use current time
                            </button>

                            <button
                                type="button"
                                id="tz-swap"
                                class="calculator-form__button calculator-form__button--secondary tz-button"
                            >
                                Swap
                            </button>

                        </div>

                        <div
                            id="tz-problem"
                            class="tz-problem"
                            hidden
                        >

                            <p
                                id="tz-problem-title"
                                class="tz-problem__title"
                            ></p>

                            <p
                                id="tz-problem-detail"
                                class="tz-problem__detail"
                            ></p>

                            <fieldset
                                id="tz-choice"
                                class="tz-choice"
                                hidden
                            >

                                <legend id="tz-choice-legend">
                                    Which one do you mean?
                                </legend>

                            </fieldset>

                        </div>

                    </div>


                    <div class="tz-card">

                        <h2 class="tz-card__title">
                            Convert to
                        </h2>

${picker("add", "Add a time zone", "Search, for example New York", "Search by the city in the zone name, such as Kolkata or New_York.")}

                        <div
                            id="tz-quick"
                            class="tz-quick"
                            aria-label="Common time zones"
                        ></div>

                        <p
                            id="tz-zone-message"
                            class="tz-message"
                            role="status"
                            aria-live="polite"
                        ></p>

                    </div>


                    <div class="tz-result">

                        <h2 class="tz-result__title">
                            Converted time
                        </h2>

                        <p
                            id="tz-empty"
                            class="tz-empty"
                        >Choose a time zone to convert to.</p>

                        <ol
                            id="tz-board"
                            class="tz-board"
                            aria-label="Converted times"
                            hidden
                        ></ol>

                        <div
                            id="tz-share"
                            class="tz-share"
                            hidden
                        >

                            <button
                                type="button"
                                id="tz-copy"
                                class="calculator-form__button calculator-form__button--secondary tz-button"
                            >
                                Copy times
                            </button>

                            <button
                                type="button"
                                id="tz-link"
                                class="calculator-form__button calculator-form__button--secondary tz-button"
                            >
                                Copy link
                            </button>

                            <label class="tz-check">
                                <input
                                    type="checkbox"
                                    id="tz-24h"
                                >
                                <span>24-hour clock</span>
                            </label>

                        </div>

                    </div>


                    <details
                        id="tz-meeting"
                        class="tz-meeting"
                    >

                        <summary>
                            Find a time that works for everyone
                        </summary>

                        <p class="tz-meeting__intro">
                            Set the hours each person prefers on their own
                            clock. Times inside everyone's preferred hours
                            are listed for the date above, starting every 15
                            minutes.
                        </p>

                        <div class="tz-meeting__controls">

                            <div class="tz-field">

                                <label
                                    for="tz-duration"
                                    class="tz-label"
                                >
                                    Meeting length
                                </label>

                                <select
                                    id="tz-duration"
                                    class="tz-input"
                                >${durations}</select>

                            </div>

                            <div class="tz-days">

                                <button
                                    type="button"
                                    id="tz-prev"
                                    class="calculator-form__button calculator-form__button--secondary tz-button"
                                >
                                    Previous day
                                </button>

                                <button
                                    type="button"
                                    id="tz-next"
                                    class="calculator-form__button calculator-form__button--secondary tz-button"
                                >
                                    Next day
                                </button>

                            </div>

                        </div>

                        <p
                            id="tz-meeting-date"
                            class="tz-meeting__date"
                        ></p>

                        <div
                            id="tz-hours"
                            class="tz-hours"
                        ></div>

                        <div
                            id="tz-overlap"
                            class="tz-overlap"
                        ></div>

                    </details>

                </div>

            </section>

            <p
                id="tz-live"
                class="tz-sr"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>
                        Pick the date and time and the zone they are in. The
                        time means "this reading on that zone's clock", not on
                        your own.
                    </li>
                    <li>
                        Search for a zone to convert to, or use one of the
                        common ones. Add up to five. Remove any of them with
                        its Remove button.
                    </li>
                    <li>
                        Open <em>Find a time that works for everyone</em> to
                        set each zone's preferred hours and the meeting
                        length, and see when they all overlap.
                    </li>
                </ol>

                <p>
                    Need the same moment as a Unix timestamp? Use the
                    <a href="${UNIX_TOOL.href}">${UNIX_TOOL.title}</a>.
                </p>

            </section>


            <!-- DST -->

            <section class="calculator-info">

                <h2>
                    Daylight Saving Time
                </h2>

                <p>
                    Offsets come from your browser's time zone data for the
                    date you chose, so a zone's offset can differ between
                    winter and summer, and some zones never change. Each
                    result shows the offset in force at that moment.
                </p>

                <p>
                    When clocks go forward, one hour of the local day does not
                    exist: if you enter a time inside it, the page says so and
                    shows the nearest times either side instead of guessing.
                    When clocks go back, one hour happens twice: the page shows
                    both and asks which you mean. Some places shift by 30
                    minutes rather than an hour, and some offsets are not whole
                    hours.
                </p>

            </section>


            <!-- LIMITS -->

            <section class="calculator-info">

                <h2>
                    Limits and Privacy
                </h2>

                <p>
                    Dates from 1970 to 2100. Up to ${MAX_ZONES} zones in all: the
                    one you start from and ${MAX_TARGETS} others. Zone names are the
                    standard IANA names your browser supports, so you search by
                    the city as it appears in the name, such as Kolkata or
                    New_York; there is no separate list of countries. Meeting
                    times are listed within one calendar day of the starting
                    zone, in 15-minute steps, and preferred hours cannot cross
                    midnight.
                </p>

                <p>
                    Nothing is uploaded or saved, and the page never asks where
                    you are. Your zone is read from your browser's settings
                    only to fill the first box. The page address keeps the
                    date, time and zones so you can share a conversion; it does
                    not hold anything else.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    Frequently Asked Questions
                </h2>

                <details>
                    <summary>
                        Why does the page show two times for one reading?
                    </summary>
                    <p>
                        When clocks go back, a local time such as 01:30 happens
                        twice that night. They are different moments, so the
                        page shows both with their offsets and lets you choose.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does a time not exist?
                    </summary>
                    <p>
                        When clocks go forward, the hour that is skipped never
                        appears on a clock there. Nothing can be converted from
                        it, so the page names the jump rather than moving your
                        time.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is my zone name different from what I expected?
                    </summary>
                    <p>
                        Browsers list zones by IANA identifiers, which name a
                        representative city and can differ from a country's
                        common name. Short names such as IST or CST are
                        ambiguous, so the zone name is the main identifier and
                        an abbreviation is only a hint.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it know my location?
                    </summary>
                    <p>
                        No. It reads only the time zone your browser reports, to
                        fill the first box. A time zone is not a precise
                        location.
                    </p>
                </details>

            </section>

        </div>
    `;
}


/* =========================================================
   RENDER
========================================================= */

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

    const panel = document.querySelector("#tz-panel");

    if (!panel) {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const dateInput = $("#tz-date");
    const timeInput = $("#tz-time");
    const problem = $("#tz-problem");
    const problemTitle = $("#tz-problem-title");
    const problemDetail = $("#tz-problem-detail");
    const choiceBox = $("#tz-choice");
    const choiceLegend = $("#tz-choice-legend");
    const quick = $("#tz-quick");
    const zoneMessage = $("#tz-zone-message");
    const empty = $("#tz-empty");
    const board = $("#tz-board");
    const share = $("#tz-share");
    const meeting = $("#tz-meeting");
    const durationSelect = $("#tz-duration");
    const meetingDate = $("#tz-meeting-date");
    const hoursBox = $("#tz-hours");
    const overlapBox = $("#tz-overlap");
    const live = $("#tz-live");
    const twentyFour = $("#tz-24h");

    const zones = listZones();

    /* the visitor's own zone, from the browser; never a location */
    const here = isValidZone(localZone()) ? localZone() : "UTC";

    $("#tz-local-zone").textContent = here;

    const hourCycle = (() => {

        try {
            return new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
        } catch (problemFound) {
            return "h23";
        }

    })();

    const now = nowInZone(Date.now(), here);

    /* the starting values, then whatever valid values the address supplied */
    const state = {
        date: now.date,
        time: now.time,
        source: here,
        targets: [],
        choice: null,
        hour12: hourCycle === "h11" || hourCycle === "h12",
        duration: DEFAULT_DURATION,
        hours: new Map()
    };

    Object.assign(state, parseQuery(location.search));

    state.targets = (state.targets ?? []).filter((zone) => !sameZone(zone, state.source));

    let result = null;
    let overlap = null;
    let announceTimer = null;
    let lastAnnounced = "";


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

    function announce(message) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {

            if (message === lastAnnounced) {
                return;
            }

            lastAnnounced = message;

            live.textContent = "";

            setTimeout(() => {
                live.textContent = message;
            }, 50);

        }, ANNOUNCE_DELAY_MS);

    }

    function announceNow(message) {

        clearTimeout(announceTimer);

        lastAnnounced = message;

        live.textContent = "";

        setTimeout(() => {
            live.textContent = message;
        }, 50);

    }

    function say(message) {

        zoneMessage.textContent = message;

    }

    const clock = (row) => formatClock(row.h, row.mi, state.hour12);

    const allZones = () => [state.source, ...state.targets];

    function hoursFor(zone) {

        if (!state.hours.has(zone)) {
            state.hours.set(zone, { ...DEFAULT_HOURS });
        }

        return state.hours.get(zone);

    }


    /* ---------- the zone pickers (an ARIA combobox) ---------- */

    function wirePicker(root, { onChoose, current, clearOnChoose }) {

        const input = root.querySelector("input");
        const list = root.querySelector("ul");

        let options = [];
        let active = -1;

        const optionId = (index) => `${list.id}-option-${index}`;

        function close() {

            list.hidden = true;

            input.setAttribute("aria-expanded", "false");
            input.removeAttribute("aria-activedescendant");

            active = -1;

        }

        function setActive(index) {

            active = index;

            for (const [i, node] of [...list.children].entries()) {
                node.setAttribute("aria-selected", i === index ? "true" : "false");
            }

            if (index >= 0) {
                input.setAttribute("aria-activedescendant", optionId(index));
                list.children[index].scrollIntoView({ block: "nearest" });
            } else {
                input.removeAttribute("aria-activedescendant");
            }

        }

        function open(query) {

            options = searchZones(query, zones, MAX_PICKER_OPTIONS);

            list.replaceChildren();

            if (options.length === 0) {

                const none = element("li", "tz-list__none", "No time zone matches that.");

                none.setAttribute("role", "presentation");

                list.append(none);

            }

            options.forEach((zone, index) => {

                const item = element("li", "tz-list__option", zone);

                item.id = optionId(index);
                item.setAttribute("role", "option");
                item.setAttribute("aria-selected", "false");

                /* mousedown so the box keeps focus until the choice is made */
                item.addEventListener("mousedown", (event) => {
                    event.preventDefault();
                    choose(zone);
                });

                list.append(item);

            });

            list.hidden = false;

            input.setAttribute("aria-expanded", "true");

            setActive(options.length ? 0 : -1);

        }

        function choose(zone) {

            close();

            if (clearOnChoose) {
                input.value = "";
            } else {
                input.value = zone;
            }

            onChoose(zone);

        }

        input.addEventListener("input", () => {

            if (input.value.trim() === "") {
                close();
                return;
            }

            open(input.value);

        });

        input.addEventListener("keydown", (event) => {

            if (event.key === "ArrowDown") {

                event.preventDefault();

                if (list.hidden) {
                    open(input.value || "");
                } else if (options.length) {
                    setActive((active + 1) % options.length);
                }

            } else if (event.key === "ArrowUp") {

                event.preventDefault();

                if (!list.hidden && options.length) {
                    setActive((active - 1 + options.length) % options.length);
                }

            } else if (event.key === "Enter") {

                if (!list.hidden && active >= 0 && options[active]) {

                    event.preventDefault();

                    choose(options[active]);

                } else if (isValidZone(input.value.trim())) {

                    event.preventDefault();

                    choose(input.value.trim());

                }

            } else if (event.key === "Escape") {

                if (!list.hidden) {
                    event.preventDefault();
                    close();
                }

            }

        });

        if (!clearOnChoose) {

            /* the whole name is selected on focus, so typing replaces it */
            input.addEventListener("focus", () => input.select());

        }

        input.addEventListener("blur", () => {

            close();

            /* a typed exact name is accepted; anything else goes back to what was chosen */
            const typed = input.value.trim();

            if (clearOnChoose) {
                return;
            }

            if (typed !== current() && isValidZone(typed)) {
                onChoose(typed);
            } else {
                input.value = current();
            }

        });

        return {
            input,
            setValue(value) {
                input.value = value;
            }
        };

    }


    /* ---------- the quick-add buttons ---------- */

    function renderQuick() {

        quick.replaceChildren();

        for (const zone of QUICK_ZONES) {

            if (!isValidZone(zone) || allZones().some((used) => sameZone(used, zone))) {
                continue;
            }

            const button = element("button", "tz-chip", zone);

            button.type = "button";

            button.setAttribute("aria-label", `Add ${zone}`);

            button.addEventListener("click", () => addTarget(zone));

            quick.append(button);

        }

    }


    /* ---------- the result ---------- */

    function rowElement(row, primary) {

        const item = element("li", `tz-row${primary ? " tz-row--primary" : ""}`);

        const time = element("div", "tz-row__time");

        time.append(
            element("span", "tz-clock", clock(row)),
            element("span", "tz-relation", row.relation)
        );

        const meta = element("div", "tz-row__meta");

        const zoneLine = element("span", "tz-zone", row.zone);

        const offsetLine = element("span", "tz-offset", row.abbr ? `${row.offset} (${row.abbr})` : row.offset);

        meta.append(
            element("span", "tz-date", row.dateLabel),
            zoneLine,
            offsetLine
        );

        const remove = element("button", "tz-remove", "Remove");

        remove.type = "button";

        remove.setAttribute("aria-label", `Remove ${row.zone}`);

        remove.addEventListener("click", () => removeTarget(row.zone));

        item.append(time, meta, remove);

        return item;

    }

    function showProblem(title, detail) {

        problem.hidden = false;

        problemTitle.textContent = title;
        problemDetail.textContent = detail;

    }

    /* the two occurrences of a repeated time, as radio buttons the visitor can change */
    function showChoice(options, checked) {

        choiceLegend.textContent = "Which one do you mean?";

        for (const option of options) {

            const label = element("label", "tz-choice__option");

            const radio = document.createElement("input");

            radio.type = "radio";
            radio.name = "tz-occurrence";
            radio.value = option.choice;
            radio.checked = option.choice === checked;

            label.append(radio, element("span", "", option.label));

            radio.addEventListener("change", () => {

                state.choice = option.choice;

                update();

            });

            choiceBox.append(label);

        }

        choiceBox.hidden = false;

    }

    function renderResult() {

        board.replaceChildren();
        choiceBox.hidden = true;

        for (const old of [...choiceBox.querySelectorAll("label")]) {
            old.remove();
        }

        problem.hidden = true;

        result = convert({
            date: state.date,
            time: state.time,
            source: state.source,
            targets: state.targets,
            choice: state.choice,
            hour12: state.hour12
        });

        let message = "";

        if (result.status === "invalid" || result.status === "unsupported") {

            showProblem(result.message, "");
            panel.dataset.state = "invalid";

            message = result.message;

        } else if (result.status === "gap") {

            showProblem(result.message, `${result.detail}${result.nearest ? ` The nearest times that exist are ${formatClock(...result.nearest.before.split(":").map(Number), state.hour12)} and ${formatClock(...result.nearest.after.split(":").map(Number), state.hour12)}.` : ""}`);
            panel.dataset.state = "gap";

            message = `${result.message} ${result.detail}`;

        } else if (result.status === "ambiguous") {

            showProblem("This time happens twice.", result.message);

            panel.dataset.state = "ambiguous";

            showChoice(result.options, null);

            message = result.message;

        } else {

            panel.dataset.state = state.targets.length ? "ok" : "no-targets";

            result.rows.forEach((row, index) => board.append(rowElement(row, index === 0)));

            if (result.options) {

                showProblem("This time happens twice.", "You can change which one you mean.");

                showChoice(result.options, result.overlapChoice);

            }

            const first = result.rows[0];

            message = first
                ? `${clock(first)} in ${first.zone}, ${first.relation.toLowerCase()}, ${first.offset}.${result.rows.length > 1 ? ` ${result.rows.length - 1} more ${result.rows.length === 2 ? "zone" : "zones"} listed.` : ""}`
                : "Choose a time zone to convert to.";

        }

        const ok = result.status === "ok";

        const hasRows = ok && result.rows.length > 0;

        board.hidden = !hasRows;
        share.hidden = !hasRows;
        empty.hidden = hasRows || result.status !== "ok";

        if (result.status === "ok" && !hasRows) {
            empty.textContent = "Choose a time zone to convert to.";
        }

        announce(message);

    }


    /* ---------- meeting overlap ---------- */

    function renderHours() {

        const zonesNow = allZones();

        /* keep what was typed where the zone is still listed */
        hoursBox.replaceChildren();

        for (const zone of zonesNow) {

            const range = hoursFor(zone);

            const row = element("div", "tz-hours__row");

            row.dataset.zone = zone;

            row.append(element("span", "tz-hours__zone", zone));

            for (const [key, word] of [["start", "from"], ["end", "to"]]) {

                const label = element("label", "tz-hours__field");

                label.append(element("span", "tz-hours__word", word));

                const input = document.createElement("input");

                input.type = "time";
                input.step = "900";
                input.className = "tz-input tz-input--time";
                input.value = range[key];

                input.setAttribute("aria-label", `${zone}, preferred hours ${word === "from" ? "start" : "end"}`);

                input.addEventListener("input", () => {

                    range[key] = input.value;

                    renderOverlap();

                });

                label.append(input);

                row.append(label);

            }

            hoursBox.append(row);

        }

    }

    function windowElement(window, index) {

        const item = element("li", "tz-window");

        const first = window.perZone[0];

        const head = element("p", "tz-window__head");

        head.append(
            element("strong", "", window.starts > 1
                ? `Start between ${clock(first.start)} and ${clock(first.lastStart)}`
                : `Start at ${clock(first.start)}`),
            document.createTextNode(` (${first.zone})`)
        );

        const lines = element("ul", "tz-window__zones");

        for (const entry of window.perZone) {

            const line = element("li", "tz-window__zone");

            const day = entry.start.dayDelta === 0 ? "" : ` (${entry.start.relation.toLowerCase()})`;

            line.append(
                element("span", "tz-window__name", entry.zone),
                element("span", "tz-window__times", `${clock(entry.start)} to ${clock(entry.end)}${day}`)
            );

            lines.append(line);

        }

        item.append(head, lines);

        item.dataset.index = String(index);

        return item;

    }

    function renderOverlap() {

        overlapBox.replaceChildren();

        meetingDate.textContent = state.date
            ? `Date: ${state.date} in ${state.source}`
            : "";

        overlap = meetingOverlap({
            date: state.date,
            source: state.source,
            zones: allZones().map((zone) => ({ zone, ...hoursFor(zone) })),
            duration: state.duration
        });

        const title = element("h3", "tz-overlap__title", "Times inside everyone's preferred hours");

        overlapBox.append(title);

        if (overlap.status === "ok") {

            const list = element("ol", "tz-windows");

            overlap.windows.forEach((window, index) => list.append(windowElement(window, index)));

            overlapBox.append(list);

            if (overlap.total > overlap.windows.length) {
                overlapBox.append(element("p", "tz-note", `Showing the first ${MAX_RESULT_WINDOWS} of ${overlap.total} windows.`));
            }

            overlapBox.append(element("p", "tz-note", `Each window shows the earliest start to the latest finish for a ${overlap.duration}-minute meeting.`));

            const copy = element("button", "calculator-form__button calculator-form__button--secondary tz-button", "Copy meeting times");

            copy.type = "button";

            copy.addEventListener("click", () => copyToClipboard(copyMeetingText(overlap, state.date, state.hour12), "Meeting times copied."));

            overlapBox.append(copy);

            announceMeeting(`${overlap.total} ${overlap.total === 1 ? "window" : "windows"} inside everyone's preferred hours.`);

        } else if (overlap.status === "none") {

            overlapBox.append(element("p", "tz-none", overlap.message));

            overlapBox.append(element("p", "tz-note", `For a ${overlap.duration}-minute meeting. Each zone's preferred hours on this date, as ${state.source} times:`));

            const list = element("ul", "tz-preferred");

            for (const entry of overlap.preferred) {

                const item = element("li", "tz-preferred__item");

                const runs = entry.runs.length
                    ? entry.runs.map((run) => `${clock(run.start)} to ${clock(run.end)}${run.end.date !== run.start.date ? " (next day)" : ""}`).join(", ")
                    : "none on this date";

                item.append(element("span", "tz-window__name", entry.zone), element("span", "tz-window__times", runs));

                list.append(item);

            }

            overlapBox.append(list);

            announceMeeting(overlap.message);

        } else if (overlap.status === "invalid") {

            const list = element("ul", "tz-issues");

            for (const issue of overlap.issues) {
                list.append(element("li", "", issue.message));
            }

            overlapBox.append(list);

        } else {

            overlapBox.append(element("p", "tz-note", overlap.message));

        }

    }

    function announceMeeting(message) {

        if (meeting.open) {
            announce(message);
        }

    }


    /* ---------- one place that redraws and keeps the address ---------- */

    function syncAddress() {

        const query = buildQuery({
            date: state.date,
            time: state.time,
            source: state.source,
            targets: state.targets,
            choice: state.choice
        });

        try {
            history.replaceState(history.state, "", `${location.pathname}${query}${location.hash}`);
        } catch (problemFound) {
            /* a browser that refuses: the page works without an address */
        }

    }

    function update({ hours = true } = {}) {

        dateInput.value = state.date;
        timeInput.value = state.time;
        twentyFour.checked = !state.hour12;

        sourcePicker.setValue(state.source);

        renderQuick();
        renderResult();

        if (hours) {
            renderHours();
        }

        if (meeting.open) {
            renderOverlap();
        }

        syncAddress();

        $("#tz-swap").disabled = state.targets.length === 0;

    }


    /* ---------- actions ---------- */

    function addTarget(zone) {

        const added = addZone(state.source, state.targets, zone);

        if (!added.ok) {
            say(added.message);
            return;
        }

        say(`${zone} added.`);

        state.targets = added.targets;

        update();

    }

    function removeTarget(zone) {

        state.targets = removeZone(state.targets, zone);

        say(`${zone} removed.`);

        update();

        /* put focus somewhere that still exists */
        (board.querySelector(".tz-remove") ?? $("#tz-add-input")).focus();

    }

    function chooseSource(zone) {

        if (!isValidZone(zone) || sameZone(zone, state.source)) {
            sourcePicker.setValue(state.source);
            return;
        }

        state.source = zone;
        state.choice = null;

        /* the new source cannot also be a destination */
        if (state.targets.some((existing) => sameZone(existing, zone))) {
            state.targets = state.targets.filter((existing) => !sameZone(existing, zone));
            say(`${zone} is now the starting zone, so it was taken out of the list.`);
        }

        update();

    }

    function swap() {

        const swapped = swapSource(state, result);

        if (!swapped) {

            say(state.targets.length === 0
                ? "Choose a time zone to convert to first."
                : "Fix the time above first, then swap.");

            return;

        }

        Object.assign(state, swapped);

        say("Swapped. It is the same moment, now read from the other zone.");

        update();

    }

    function useNow() {

        const current = nowInZone(Date.now(), state.source);

        state.date = current.date;
        state.time = current.time;
        state.choice = null;

        update();

    }

    async function copyToClipboard(text, done) {

        if (!text) {
            return;
        }

        let copied = false;

        try {

            await navigator.clipboard.writeText(text);

            copied = true;

        } catch (problemFound) {

            const area = document.createElement("textarea");

            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";

            document.body.append(area);
            area.select();

            try {
                copied = document.execCommand("copy");
            } catch (copyProblem) {
                copied = false;
            }

            area.remove();

        }

        announceNow(copied ? done : "It could not be copied automatically.");

    }


    /* ---------- wiring ---------- */

    const sourcePicker = wirePicker(document.querySelector('[data-picker="source"]'), {
        onChoose: chooseSource,
        current: () => state.source,
        clearOnChoose: false
    });

    wirePicker(document.querySelector('[data-picker="add"]'), {
        onChoose: addTarget,
        current: () => "",
        clearOnChoose: true
    });

    dateInput.addEventListener("input", () => {

        state.date = dateInput.value;
        state.choice = null;

        update({ hours: false });

    });

    timeInput.addEventListener("input", () => {

        state.time = timeInput.value;
        state.choice = null;

        update({ hours: false });

    });

    $("#tz-now").addEventListener("click", useNow);
    $("#tz-swap").addEventListener("click", swap);

    $("#tz-copy").addEventListener("click", () => copyToClipboard(copyText(result, state.hour12), "Times copied."));

    $("#tz-link").addEventListener("click", () => copyToClipboard(location.href, "Link copied."));

    twentyFour.addEventListener("change", () => {

        state.hour12 = !twentyFour.checked;

        update({ hours: false });

    });

    durationSelect.addEventListener("change", () => {

        state.duration = Number(durationSelect.value);

        renderOverlap();

    });

    const shiftDay = (days) => {

        const next = addDays(state.date, days);

        if (next) {

            state.date = next;
            state.choice = null;

            update({ hours: false });

        }

    };

    $("#tz-prev").addEventListener("click", () => shiftDay(-1));
    $("#tz-next").addEventListener("click", () => shiftDay(1));

    meeting.addEventListener("toggle", () => {

        if (meeting.open) {
            renderOverlap();
        }

    });

    update();

    panel.dataset.ready = "true";

}
