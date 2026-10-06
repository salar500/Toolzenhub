/* =========================================================
   ToolZen Hub
   Unix Timestamp Converter (Developer Tools)

   The page around timestamp-engine.js, which owns every rule
   (units, precision, zones, daylight saving, batch). This file:

   - shows a live "now" that repaints ONCE a second, on the second,
     and not at all while the tab is hidden;
   - converts as you type (an error appears after a short pause, so
     a half-typed value never flashes one) and announces only a
     SETTLED result, never each keystroke;
   - puts everything the visitor typed or pasted on the page with
     textContent or as a control value, never as HTML;
   - runs entirely in the browser: no request, no storage.
========================================================= */

import {
    resolveEpoch,
    dateTimeToInstants,
    formatUtcIso,
    formatUnix,
    describeInZone,
    relativeToNow,
    convertBatch,
    batchToTsv,
    nowUnix,
    msToNextSecond,
    isValidZone,
    listZones,
    localZone,
    COMMON_ZONES,
    UNIT_LABEL,
    BATCH_MAX_ENTRIES,
    BATCH_MAX_CHARS
} from "./timestamp-engine.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    escapeHTML
} from "../../ui/escape.js";


/* Its relation to the JSON Formatter is a sentence on the page; no calculator or article is related. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("unix-timestamp-converter").title;

const JSON_TOOL =
    getToolById("json-formatter");

const TYPING_PAUSE_MS = 500;
const ANNOUNCE_PAUSE_MS = 800;
const BATCH_PAUSE_MS = 400;

const MAX_BOARD_ZONES = 6;

const DEFAULT_BOARD_ZONES = [
    "America/New_York",
    "Europe/London",
    "Asia/Kolkata",
    "Asia/Tokyo"
];


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page; init() fills in the parts that need the browser
   (the zone lists, the clock, the results).
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Developer Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Turn a Unix timestamp into a date, or a date and time
                        zone into a timestamp. Units and daylight saving are
                        never guessed.
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
                            Your timestamps and dates are processed in your browser
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE WORKSPACE -->

            <section class="calculator-section">

                <div
                    id="ts-panel"
                    class="ts-workspace"
                >

                    <!-- NOW -->

                    <div class="ts-now">

                        <div class="ts-now__main">

                            <span
                                id="ts-now-label"
                                class="ts-label"
                            >
                                Current Unix time
                            </span>

                            <div
                                id="ts-now-seconds"
                                class="ts-now__seconds"
                                role="timer"
                                aria-live="off"
                                aria-label="Current Unix time in seconds"
                            >–</div>

                            <p class="ts-now__detail">
                                <span id="ts-now-ms">–</span> milliseconds
                                <span class="ts-now__sep" aria-hidden="true">·</span>
                                <span id="ts-now-zone"></span>
                            </p>

                        </div>

                        <div class="ts-now__actions">

                            <button
                                type="button"
                                id="ts-now-copy-s"
                                class="calculator-form__button calculator-form__button--secondary ts-button"
                            >
                                Copy seconds
                            </button>

                            <button
                                type="button"
                                id="ts-now-copy-ms"
                                class="calculator-form__button calculator-form__button--secondary ts-button"
                            >
                                Copy milliseconds
                            </button>

                            <button
                                type="button"
                                id="ts-now-use"
                                class="calculator-form__button calculator-form__button--secondary ts-button"
                            >
                                Convert now
                            </button>

                        </div>

                    </div>


                    <!-- TIME ZONE -->

                    <div class="calculator-form__group ts-zone">

                        <label
                            for="ts-zone"
                            class="calculator-form__label"
                        >
                            Time zone
                        </label>

                        <select
                            id="ts-zone"
                            class="calculator-form__select"
                            aria-describedby="ts-zone-hint"
                        >
                            <option value="UTC">UTC</option>
                        </select>

                        <p
                            id="ts-zone-hint"
                            class="calculator-form__help"
                        >
                            Results are shown in this zone. A date and time
                            without an offset is read in it.
                        </p>

                    </div>


                    <!-- TIMESTAMP TO DATE -->

                    <section
                        class="ts-card ts-card--primary"
                        aria-labelledby="ts-a-title"
                    >

                        <h2
                            id="ts-a-title"
                            class="ts-card__title"
                        >
                            Timestamp to date
                        </h2>

                        <div class="ts-controls">

                            <div class="calculator-form__group ts-controls__main">

                                <label
                                    for="ts-input"
                                    class="calculator-form__label"
                                >
                                    Unix timestamp
                                </label>

                                <input
                                    id="ts-input"
                                    type="text"
                                    class="calculator-form__input ts-mono"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    autocorrect="off"
                                    spellcheck="false"
                                    placeholder="1700000000"
                                    aria-describedby="ts-a-hint"
                                >

                            </div>

                            <div class="calculator-form__group ts-controls__unit">

                                <label
                                    for="ts-unit"
                                    class="calculator-form__label"
                                >
                                    Unit
                                </label>

                                <select
                                    id="ts-unit"
                                    class="calculator-form__select"
                                >
                                    <option value="auto">Auto (by digits)</option>
                                    <option value="s">Seconds</option>
                                    <option value="ms">Milliseconds</option>
                                    <option value="us">Microseconds</option>
                                    <option value="ns">Nanoseconds</option>
                                </select>

                            </div>

                        </div>

                        <p
                            id="ts-a-hint"
                            class="calculator-form__help"
                        >
                            Seconds, milliseconds, microseconds or nanoseconds.
                            Auto reads the unit from the number of digits and
                            tells you what it chose.
                        </p>

                        <p
                            id="ts-a-error"
                            class="ts-error"
                            hidden
                        ></p>

                        <div
                            id="ts-a-out"
                            class="ts-out"
                            hidden
                        ></div>

                        <div
                            id="ts-board"
                            class="ts-board"
                            hidden
                        >

                            <h3 class="ts-card__subtitle">
                                Same instant in other time zones
                            </h3>

                            <div class="ts-scroll">

                                <table class="ts-table">

                                    <caption class="ts-sr-only">
                                        The same instant in several time zones
                                    </caption>

                                    <thead>
                                        <tr>
                                            <th scope="col">Time zone</th>
                                            <th scope="col">Date and time</th>
                                            <th scope="col">Offset</th>
                                            <th scope="col"><span class="ts-sr-only">Remove</span></th>
                                        </tr>
                                    </thead>

                                    <tbody id="ts-board-rows"></tbody>

                                </table>

                            </div>

                            <div class="ts-add">

                                <label
                                    for="ts-board-add"
                                    class="ts-label"
                                >
                                    Add a time zone
                                </label>

                                <select
                                    id="ts-board-add"
                                    class="calculator-form__select"
                                ></select>

                                <button
                                    type="button"
                                    id="ts-board-add-button"
                                    class="calculator-form__button calculator-form__button--secondary ts-button"
                                >
                                    Add
                                </button>

                            </div>

                            <p
                                id="ts-board-note"
                                class="calculator-form__help"
                            ></p>

                        </div>

                    </section>


                    <!-- DATE TO TIMESTAMP -->

                    <section
                        class="ts-card"
                        aria-labelledby="ts-b-title"
                    >

                        <h2
                            id="ts-b-title"
                            class="ts-card__title"
                        >
                            Date to timestamp
                        </h2>

                        <div class="ts-controls">

                            <div class="calculator-form__group ts-controls__main">

                                <label
                                    for="ts-date"
                                    class="calculator-form__label"
                                >
                                    Date and time
                                </label>

                                <input
                                    id="ts-date"
                                    type="text"
                                    class="calculator-form__input ts-mono"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    autocorrect="off"
                                    spellcheck="false"
                                    placeholder="2023-11-14 22:13:20"
                                    aria-describedby="ts-b-hint"
                                >

                            </div>

                            <div class="calculator-form__group ts-controls__unit">

                                <label
                                    for="ts-date-pick"
                                    class="calculator-form__label"
                                >
                                    Or pick one
                                </label>

                                <input
                                    id="ts-date-pick"
                                    type="datetime-local"
                                    step="1"
                                    class="calculator-form__input"
                                >

                            </div>

                        </div>

                        <p
                            id="ts-b-hint"
                            class="calculator-form__help"
                        >
                            ISO 8601 (2023-11-14T22:13:20+05:30, or without
                            an offset to use the time zone above) or RFC 2822
                            (Tue, 14 Nov 2023 22:13:20 +0000). No
                            natural-language dates.
                        </p>

                        <p
                            id="ts-b-error"
                            class="ts-error"
                            hidden
                        ></p>

                        <div
                            id="ts-b-out"
                            class="ts-out"
                            hidden
                        ></div>

                    </section>


                    <!-- BATCH -->

                    <section
                        class="ts-card"
                        aria-labelledby="ts-c-title"
                    >

                        <h2
                            id="ts-c-title"
                            class="ts-card__title"
                        >
                            Batch conversion
                        </h2>

                        <div class="calculator-form__group">

                            <label
                                for="ts-batch"
                                class="calculator-form__label"
                            >
                                Timestamps, one per line, or paste log lines
                            </label>

                            <textarea
                                id="ts-batch"
                                class="calculator-form__input ts-batch-input ts-mono"
                                rows="6"
                                wrap="off"
                                autocomplete="off"
                                autocapitalize="off"
                                autocorrect="off"
                                spellcheck="false"
                                placeholder="1700000000&#10;ts=1700000000123 user=42"
                                aria-describedby="ts-c-hint"
                            ></textarea>

                        </div>

                        <p
                            id="ts-c-hint"
                            class="calculator-form__help"
                        >
                            A line that is only a number is converted. In any
                            other line, standalone numbers of 10, 13, 16 or 19
                            digits are converted. Up to ${BATCH_MAX_ENTRIES}
                            values; the time zone above is used.
                        </p>

                        <div class="ts-controls ts-controls--batch">

                            <div class="calculator-form__group ts-controls__unit">

                                <label
                                    for="ts-batch-unit"
                                    class="calculator-form__label"
                                >
                                    Unit
                                </label>

                                <select
                                    id="ts-batch-unit"
                                    class="calculator-form__select"
                                >
                                    <option value="auto">Auto (by digits)</option>
                                    <option value="s">Seconds</option>
                                    <option value="ms">Milliseconds</option>
                                    <option value="us">Microseconds</option>
                                    <option value="ns">Nanoseconds</option>
                                </select>

                            </div>

                            <div class="ts-batch-actions">

                                <button
                                    type="button"
                                    id="ts-batch-copy"
                                    class="calculator-form__button calculator-form__button--secondary ts-button"
                                    disabled
                                >
                                    Copy table
                                </button>

                                <button
                                    type="button"
                                    id="ts-batch-clear"
                                    class="calculator-form__button calculator-form__button--secondary ts-button"
                                >
                                    Clear
                                </button>

                            </div>

                        </div>

                        <p
                            id="ts-batch-status"
                            class="ts-batch-status"
                            hidden
                        ></p>

                        <div
                            id="ts-batch-out"
                            class="ts-scroll"
                            role="region"
                            aria-label="Batch results"
                            tabindex="0"
                            hidden
                        >

                            <table class="ts-table ts-table--batch">

                                <caption class="ts-sr-only">
                                    Converted timestamps
                                </caption>

                                <thead id="ts-batch-head"></thead>

                                <tbody id="ts-batch-rows"></tbody>

                            </table>

                        </div>

                    </section>

                </div>

            </section>

            <p
                id="ts-live"
                class="ts-sr-only"
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
                        Paste a timestamp into Timestamp to date. The unit is
                        read from the number of digits and shown, and you can
                        override it.
                    </li>
                    <li>
                        Choose the time zone you want to read the result in.
                        The same instant is also shown in other zones below
                        the result.
                    </li>
                    <li>
                        To go the other way, enter a date and time in Date to
                        timestamp. If it has no offset, it is read in the
                        selected time zone.
                    </li>
                    <li>
                        For a log or a list, paste it into Batch conversion.
                    </li>
                </ol>

            </section>


            <!-- UNITS -->

            <section class="calculator-info">

                <h2>
                    Seconds, Milliseconds and How the Unit Is Read
                </h2>

                <p>
                    A Unix timestamp counts time since 1 January 1970, 00:00:00
                    UTC, called the Unix epoch. Systems store it in different
                    units, so the same moment can be written as
                    <code>1700000000</code> (seconds), <code>1700000000000</code>
                    (milliseconds), <code>1700000000000000</code> (microseconds)
                    or <code>1700000000000000000</code> (nanoseconds).
                </p>

                <p>
                    With Auto, the unit comes from the number of digits, never
                    from guessing:
                </p>

                <ul>
                    <li>1 to 10 digits: seconds</li>
                    <li>13 digits: milliseconds</li>
                    <li>16 digits: microseconds</li>
                    <li>19 digits: nanoseconds</li>
                    <li>
                        11, 12, 14, 15, 17 and 18 digits could be either of
                        two units. If only one reading is a date between the
                        years 1 and 9999 it is used, and the page says so. If
                        both are, you are shown both and asked to choose.
                    </li>
                </ul>

                <p>
                    Numbers are handled exactly, with no rounding, so a
                    19-digit nanosecond value keeps every digit. A value with
                    more precision than a nanosecond is refused rather than
                    rounded.
                </p>

            </section>


            <!-- ZONES -->

            <section class="calculator-info">

                <h2>
                    Time Zones and Daylight Saving
                </h2>

                <p>
                    A timestamp is one instant; a date and time on a wall clock
                    only means something in a time zone. Zones are IANA names
                    such as <code>Asia/Kolkata</code> or
                    <code>America/New_York</code>, and their rules come from
                    your browser.
                </p>

                <p>
                    Daylight saving can make a local time <strong>not exist</strong>
                    (when clocks jump forward, such as 02:30 on the spring day
                    in New York) or happen <strong>twice</strong> (when they go
                    back). This tool says so instead of choosing for you: a
                    skipped time gets no result and is explained, and a
                    repeated time shows both instants, labelled earlier and
                    later. Including an offset in the text, such as
                    <code>-05:00</code>, fixes the instant and avoids the
                    question.
                </p>

            </section>


            <!-- RANGE -->

            <section class="calculator-info">

                <h2>
                    Range, Leap Seconds and the Year 2038
                </h2>

                <p>
                    Dates from the year 1 to the year 9999 are supported,
                    including times before 1970, which are negative
                    timestamps. Unix time counts every day as exactly 86,400
                    seconds, so leap seconds are not separate instants and are
                    not modelled here.
                </p>

                <p>
                    The "year 2038 problem" affects software that stores Unix
                    time in a signed 32-bit integer, which runs out at 03:14:07
                    UTC on 19 January 2038 (2,147,483,647 seconds). It is not
                    a limit of timestamps in general: browsers and this tool
                    use 64-bit values and carry on well past 2038.
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>Reading an epoch from a log line, a database row or a webhook.</li>
                    <li>Checking when a token or a cache entry expires.</li>
                    <li>Telling seconds from milliseconds in an API field.</li>
                    <li>Finding out what a local time is in another zone.</li>
                </ul>

                <p>
                    Timestamps often sit inside a JSON payload. To read the
                    payload first, use the
                    <a href="${JSON_TOOL.href}">${escapeHTML(JSON_TOOL.title)}</a>.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is my data sent anywhere?
                    </summary>
                    <p>
                        No. Everything runs in your browser. Nothing you enter
                        or paste is uploaded or stored; reloading clears it.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does it ask me to choose a unit?
                    </summary>
                    <p>
                        Some lengths fit two units, for example a 12-digit
                        number could be seconds or milliseconds. Guessing would
                        give a wrong date without warning, so both readings are
                        shown and you pick.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does the live clock show milliseconds that do not
                        change every instant?
                    </summary>
                    <p>
                        The display updates once a second so it stays calm and
                        light. Copy takes the exact value at the moment you
                        press it.
                    </p>
                </details>

                <details>
                    <summary>
                        Can it do natural-language dates like "next Friday"?
                    </summary>
                    <p>
                        No. Only strict ISO 8601 and RFC 2822 are read, so the
                        result is never a guess.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it include leap seconds?
                    </summary>
                    <p>
                        No. Unix time ignores them, and so does this tool.
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
   SMALL DOM HELPERS (everything is textContent)
========================================================= */

function el(tag, className, text) {

    const node = document.createElement(tag);

    if (className) {
        node.className = className;
    }

    if (text !== undefined) {
        node.textContent = text;
    }

    return node;

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const panel = document.querySelector("#ts-panel");

    if (!panel) {
        return;
    }

    const $ = (selector) => document.querySelector(selector);

    const nodes = {
        nowSeconds: $("#ts-now-seconds"),
        nowMs: $("#ts-now-ms"),
        nowZone: $("#ts-now-zone"),
        zone: $("#ts-zone"),
        input: $("#ts-input"),
        unit: $("#ts-unit"),
        aError: $("#ts-a-error"),
        aOut: $("#ts-a-out"),
        board: $("#ts-board"),
        boardRows: $("#ts-board-rows"),
        boardAdd: $("#ts-board-add"),
        boardAddButton: $("#ts-board-add-button"),
        boardNote: $("#ts-board-note"),
        date: $("#ts-date"),
        datePick: $("#ts-date-pick"),
        bError: $("#ts-b-error"),
        bOut: $("#ts-b-out"),
        batch: $("#ts-batch"),
        batchUnit: $("#ts-batch-unit"),
        batchStatus: $("#ts-batch-status"),
        batchOut: $("#ts-batch-out"),
        batchHead: $("#ts-batch-head"),
        batchRows: $("#ts-batch-rows"),
        batchCopy: $("#ts-batch-copy"),
        batchClear: $("#ts-batch-clear"),
        live: $("#ts-live")
    };

    const local = isValidZone(localZone()) ? localZone() : "UTC";

    let zone = local;

    /* UTC and the local zone are always shown, so they are not repeated in the chosen list */
    let boardZones = DEFAULT_BOARD_ZONES.filter(name => isValidZone(name) && name !== local && name !== "UTC");

    /* the instant the board and the relative time follow, and what the batch last produced */
    let activeNs = null;
    let batchResult = null;

    let announceTimer = null;
    let errorTimerA = null;
    let errorTimerB = null;
    let batchTimer = null;
    let tickTimer = null;

    let relativeNode = null;

    /* an error waiting for the typing pause; leaving the field shows it at once WITHOUT redrawing, so a button the visitor is pressing is never replaced */
    let pendingErrorA = null;
    let pendingErrorB = null;


    /* ---------- announcements ---------- */

    function announce(message) {

        clearTimeout(announceTimer);

        nodes.live.textContent = "";

        announceTimer = setTimeout(() => {
            nodes.live.textContent = message;
        }, 50);

    }

    /* a settled result, after the typing pauses; each new keystroke restarts the wait */
    let settleTimer = null;

    function announceSettled(message) {

        clearTimeout(settleTimer);

        settleTimer = setTimeout(() => announce(message), ANNOUNCE_PAUSE_MS);

    }


    /* ---------- time zone controls ---------- */

    function fillZoneSelect(select, selected, withLocal) {

        select.replaceChildren();

        const seen = new Set();

        const add = (parent, value, label) => {

            if (seen.has(value) || !isValidZone(value)) {
                return;
            }

            seen.add(value);

            const option = document.createElement("option");

            option.value = value;
            option.textContent = label ?? value;

            parent.append(option);

        };

        const common = document.createElement("optgroup");

        common.label = "Common";

        if (withLocal) {
            add(common, local, `Local (${local})`);
        }

        for (const name of COMMON_ZONES) {
            add(common, name);
        }

        select.append(common);

        const all = document.createElement("optgroup");

        all.label = "All time zones";

        for (const name of listZones()) {
            add(all, name);
        }

        if (all.children.length > 0) {
            select.append(all);
        }

        select.value = seen.has(selected) ? selected : (withLocal ? local : "UTC");

    }

    fillZoneSelect(nodes.zone, zone, true);
    fillZoneSelect(nodes.boardAdd, "UTC", false);


    /* ---------- copy ---------- */

    async function copyText(text) {

        try {

            await navigator.clipboard.writeText(text);

            return true;

        } catch (problem) {

            try {

                const holder = document.createElement("textarea");

                holder.value = text;
                holder.setAttribute("readonly", "");
                holder.style.position = "fixed";
                holder.style.opacity = "0";

                document.body.append(holder);

                holder.select();

                const done = document.execCommand("copy");

                holder.remove();

                return done;

            } catch (second) {

                return false;

            }

        }

    }

    /* the button says what really happened; the page announces it too */
    function copyButton(label, getText) {

        const button = el("button", "calculator-form__button calculator-form__button--secondary ts-copy", "Copy");

        button.type = "button";
        button.setAttribute("aria-label", `Copy ${label}`);

        wireCopy(button, label, getText);

        return button;

    }

    function wireCopy(button, label, getText) {

        const original = button.textContent;

        button.addEventListener("click", async () => {

            const done = await copyText(getText());

            button.textContent = done ? "Copied" : "Copy failed";

            announce(done ? `Copied ${label}.` : `Could not copy ${label}. Select it and copy it yourself.`);

            setTimeout(() => {
                button.textContent = original;
            }, done ? 1500 : 3000);

        });

    }

    wireCopy($("#ts-now-copy-s"), "Unix seconds", () => nowUnix(Date.now()).seconds);
    wireCopy($("#ts-now-copy-ms"), "Unix milliseconds", () => nowUnix(Date.now()).milliseconds);


    /* ---------- the live clock ---------- */

    function tick() {

        const now = Date.now();

        const { seconds, milliseconds } = nowUnix(now);

        if (nodes.nowSeconds.textContent !== seconds) {
            nodes.nowSeconds.textContent = seconds;
        }

        nodes.nowMs.textContent = milliseconds;

        const where = `Your time zone: ${local} (${describeInZone(BigInt(now) * 1_000_000n, local).offset})`;

        if (nodes.nowZone.textContent !== where) {
            nodes.nowZone.textContent = where;
        }

        if (relativeNode && activeNs !== null) {

            const text = relativeToNow(activeNs, now);

            if (relativeNode.textContent !== text) {
                relativeNode.textContent = text;
            }

        }

        clearTimeout(tickTimer);

        if (!document.hidden) {
            tickTimer = setTimeout(tick, msToNextSecond(now));
        }

    }

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            clearTimeout(tickTimer);
        } else {
            tick();
        }

    });

    window.addEventListener("pageshow", tick);


    /* ---------- result building blocks ---------- */

    /* a labelled row: label, value text, optional second line and copy button */
    function row(label, value, { sub, copy, id } = {}) {

        const group = el("div", "ts-row");

        group.append(el("dt", "ts-row__label", label));

        const body = el("dd", "ts-row__value");

        const text = el("span", "ts-row__text", value);

        if (id) {
            text.id = id;
        }

        body.append(text);

        if (sub) {
            body.append(el("span", "ts-row__sub", sub));
        }

        if (copy) {
            body.append(copyButton(copy.label, () => copy.text));
        }

        group.append(body);

        return group;

    }

    function zoneRows(ns, zoneName, label) {

        const view = describeInZone(ns, zoneName);

        return row(label, view.display, {
            sub: `${view.iso} · ${view.offset}${view.abbr ? " · " + view.abbr : ""}`,
            copy: { label: `${zoneName} time`, text: view.iso }
        });

    }

    function unixRows(ns) {

        return [
            row("Unix seconds", formatUnix(ns, "s"), { copy: { label: "Unix seconds", text: formatUnix(ns, "s") } }),
            row("Unix milliseconds", formatUnix(ns, "ms"), { copy: { label: "Unix milliseconds", text: formatUnix(ns, "ms") } })
        ];

    }

    function setError(errorNode, input, message) {

        errorNode.textContent = message;
        errorNode.hidden = false;

        input.setAttribute("aria-invalid", "true");

        const base = input.id === "ts-input" ? "ts-a-hint" : "ts-b-hint";

        input.setAttribute("aria-describedby", `${base} ${errorNode.id}`);

    }

    function clearError(errorNode, input) {

        errorNode.textContent = "";
        errorNode.hidden = true;

        input.removeAttribute("aria-invalid");

        input.setAttribute("aria-describedby", input.id === "ts-input" ? "ts-a-hint" : "ts-b-hint");

    }


    /* ---------- Timestamp to date ---------- */

    function renderBoard() {

        if (activeNs === null) {
            nodes.board.hidden = true;
            return;
        }

        nodes.board.hidden = false;
        nodes.boardRows.replaceChildren();

        const rows = [
            { name: "UTC", label: "UTC", fixed: true },
            ...(local === "UTC" ? [] : [{ name: local, label: `Your local time (${local})`, fixed: true }]),
            ...boardZones.map(name => ({ name, label: name, fixed: false }))
        ];

        for (const item of rows) {

            const view = describeInZone(activeNs, item.name);

            const tr = document.createElement("tr");

            tr.append(el("th", "", item.label));
            tr.firstChild.scope = "row";

            tr.append(el("td", "", view.display));
            tr.append(el("td", "ts-nowrap", view.offset));

            const action = document.createElement("td");

            if (!item.fixed) {

                const remove = el("button", "ts-remove", "Remove");

                remove.type = "button";
                remove.setAttribute("aria-label", `Remove ${item.name}`);

                remove.addEventListener("click", () => {

                    boardZones = boardZones.filter(name => name !== item.name);

                    renderBoard();

                    announce(`Removed ${item.name}.`);

                    nodes.boardAdd.focus();

                });

                action.append(remove);

            }

            tr.append(action);

            nodes.boardRows.append(tr);

        }

        const full = boardZones.length >= MAX_BOARD_ZONES;

        nodes.boardAdd.disabled = full;
        nodes.boardAddButton.disabled = full;

        nodes.boardNote.textContent = full
            ? `The most time zones you can add is ${MAX_BOARD_ZONES}. Remove one to add another.`
            : "";

    }

    nodes.boardAddButton.addEventListener("click", () => {

        const name = nodes.boardAdd.value;

        if (!isValidZone(name) || boardZones.length >= MAX_BOARD_ZONES) {
            return;
        }

        if (boardZones.includes(name) || name === "UTC" || name === local) {

            announce(`${name} is already shown.`);

            return;

        }

        boardZones.push(name);

        renderBoard();

        announce(`Added ${name}.`);

    });

    function renderA({ immediate = false } = {}) {

        clearTimeout(errorTimerA);

        pendingErrorA = null;

        const result = resolveEpoch(nodes.input.value, nodes.unit.value);

        relativeNode = null;

        if (result.state === "empty") {

            clearError(nodes.aError, nodes.input);

            nodes.aOut.hidden = true;
            nodes.aOut.replaceChildren();

            activeNs = null;

            renderBoard();

            return;

        }

        if (result.state === "invalid") {

            activeNs = null;

            nodes.aOut.hidden = true;
            nodes.aOut.replaceChildren();

            renderBoard();

            const show = () => {

                pendingErrorA = null;

                setError(nodes.aError, nodes.input, result.message);

                announceSettled(`Not converted. ${result.message}`);

            };

            if (immediate) {
                show();
            } else {
                pendingErrorA = show;
                errorTimerA = setTimeout(show, TYPING_PAUSE_MS);
            }

            return;

        }

        clearError(nodes.aError, nodes.input);

        if (result.state === "ambiguous") {

            activeNs = null;

            renderBoard();

            nodes.aOut.replaceChildren();

            const box = el("div", "ts-ambiguous");

            box.append(el("p", "ts-ambiguous__title", "Which unit is this?"));

            box.append(el("p", "", `${result.reason}. Choose the one you mean; nothing is converted until you do.`));

            const list = el("ul", "ts-ambiguous__list");

            for (const candidate of result.candidates) {

                const item = el("li");

                const text = candidate.ns !== null
                    ? `As ${UNIT_LABEL[candidate.unit]}: ${formatUtcIso(candidate.ns)}`
                    : `As ${UNIT_LABEL[candidate.unit]}: ${candidate.error}`;

                item.append(el("span", "", text));

                if (candidate.ns !== null) {

                    const choose = el("button", "calculator-form__button calculator-form__button--secondary ts-choose", `Use ${UNIT_LABEL[candidate.unit]}`);

                    choose.type = "button";

                    choose.addEventListener("click", () => {

                        nodes.unit.value = candidate.unit;

                        renderA({ immediate: true });

                        nodes.unit.focus();

                    });

                    item.append(choose);

                }

                list.append(item);

            }

            box.append(list);

            nodes.aOut.append(box);

            nodes.aOut.hidden = false;

            announceSettled(`${result.reason}. Choose a unit.`);

            return;

        }

        /* a converted instant */

        activeNs = result.ns;

        nodes.aOut.replaceChildren();

        const list = el("dl", "ts-rows");

        const utc = formatUtcIso(result.ns);

        list.append(row("UTC", utc, { copy: { label: "UTC time", text: utc } }));

        /* the selected zone, unless it is UTC (already shown); your local zone too when it is a different one */
        if (zone !== "UTC") {
            list.append(zoneRows(result.ns, zone, zone === local ? `${zone} (your local time)` : zone));
        }

        if (local !== zone && local !== "UTC") {
            list.append(zoneRows(result.ns, local, `Your local time (${local})`));
        }

        list.append(row("Relative", relativeToNow(result.ns, Date.now()), { id: "ts-relative" }));

        list.append(row("Unit", UNIT_LABEL[result.unit], { sub: result.reason + (result.how === "range" ? "" : ".") }));

        for (const item of unixRows(result.ns)) {
            list.append(item);
        }

        nodes.aOut.append(list);

        nodes.aOut.hidden = false;

        relativeNode = nodes.aOut.querySelector("#ts-relative");

        renderBoard();

        announceSettled(`${formatUnix(result.ns, result.unit)} ${UNIT_LABEL[result.unit]} is ${utc}.`);

    }

    nodes.input.addEventListener("input", () => renderA());
    nodes.input.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            renderA({ immediate: true });
        }

    });
    nodes.input.addEventListener("blur", () => {

        if (pendingErrorA) {
            clearTimeout(errorTimerA);
            pendingErrorA();
        }

    });

    nodes.unit.addEventListener("change", () => renderA({ immediate: true }));

    $("#ts-now-use").addEventListener("click", () => {

        nodes.input.value = nowUnix(Date.now()).seconds;

        nodes.unit.value = "s";

        renderA({ immediate: true });

        nodes.input.focus();

    });


    /* ---------- Date to timestamp ---------- */

    function showInConverter(ns) {

        nodes.input.value = formatUnix(ns, "s");

        nodes.unit.value = "s";

        renderA({ immediate: true });

        nodes.input.focus();

        nodes.input.scrollIntoView({ block: "center" });

    }

    function instantGroup(heading, candidate) {

        const group = el("div", "ts-instant");

        if (heading) {
            group.append(el("h3", "ts-card__subtitle", heading));
        }

        const list = el("dl", "ts-rows");

        const utc = formatUtcIso(candidate.ns);

        list.append(row("UTC", utc, { copy: { label: "UTC time", text: utc } }));

        for (const item of unixRows(candidate.ns)) {
            list.append(item);
        }

        list.append(row("Offset used", offsetOf(candidate.offsetSeconds)));

        group.append(list);

        const show = el("button", "calculator-form__button calculator-form__button--secondary ts-button", "Show in Timestamp to date");

        show.type = "button";

        show.addEventListener("click", () => showInConverter(candidate.ns));

        group.append(show);

        return group;

    }

    function offsetOf(seconds) {

        const sign = seconds < 0 ? "-" : "+";

        const abs = Math.abs(seconds);

        const pad = (n) => String(n).padStart(2, "0");

        return `UTC${sign}${pad(Math.floor(abs / 3600))}:${pad(Math.floor((abs % 3600) / 60))}${abs % 60 ? ":" + pad(abs % 60) : ""}`;

    }

    function renderB({ immediate = false } = {}) {

        clearTimeout(errorTimerB);

        pendingErrorB = null;

        const result = dateTimeToInstants(nodes.date.value, zone);

        nodes.bOut.replaceChildren();

        if (result.state === "empty") {

            clearError(nodes.bError, nodes.date);

            nodes.bOut.hidden = true;

            return;

        }

        if (result.state === "invalid" || result.state === "gap") {

            nodes.bOut.hidden = true;

            const message = result.state === "gap"
                ? [result.message, result.detail, "Choose a time that exists, or include an offset such as -05:00 to fix the instant."].filter(Boolean).join(" ")
                : result.message;

            const show = () => {

                pendingErrorB = null;

                setError(nodes.bError, nodes.date, message);

                announceSettled(`Not converted. ${message}`);

            };

            if (immediate) {
                show();
            } else {
                pendingErrorB = show;
                errorTimerB = setTimeout(show, TYPING_PAUSE_MS);
            }

            return;

        }

        clearError(nodes.bError, nodes.date);

        const notes = el("div", "ts-notes");

        if (result.kind === "offset") {
            notes.append(el("p", "", "The text includes its own offset, so the time zone selection is not used."));
        } else if (result.kind === "unique") {
            notes.append(el("p", "", `Read in ${result.zoneUsed} (${offsetOf(result.candidates[0].offsetSeconds)}).`));
        } else {

            notes.append(el("p", "ts-ambiguous__title", "This local time happens twice"));

            notes.append(el("p", "", `Clocks in ${result.zoneUsed} go back, so ${nodes.date.value.trim()} occurs twice. Both instants are shown; neither is chosen for you.`));

        }

        if (result.hasTime === false) {
            notes.append(el("p", "", "No time was given, so midnight (00:00:00) is used."));
        }

        nodes.bOut.append(notes);

        if (result.kind === "overlap") {

            result.candidates.forEach((candidate, index) => {

                const heading = result.candidates.length === 2
                    ? (index === 0 ? "Earlier occurrence" : "Later occurrence")
                    : `Occurrence ${index + 1} of ${result.candidates.length}`;

                nodes.bOut.append(instantGroup(`${heading} (${offsetOf(candidate.offsetSeconds)})`, candidate));

            });

        } else {

            nodes.bOut.append(instantGroup("", result.candidates[0]));

        }

        nodes.bOut.hidden = false;

        announceSettled(
            result.kind === "overlap"
                ? "This local time happens twice. Both instants are shown."
                : `${nodes.date.value.trim()} is ${formatUnix(result.candidates[0].ns, "s")} Unix seconds.`
        );

    }

    nodes.date.addEventListener("input", () => renderB());
    nodes.date.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            renderB({ immediate: true });
        }

    });
    nodes.date.addEventListener("blur", () => {

        if (pendingErrorB) {
            clearTimeout(errorTimerB);
            pendingErrorB();
        }

    });

    nodes.datePick.addEventListener("input", () => {

        if (nodes.datePick.value) {

            nodes.date.value = nodes.datePick.value.replace("T", " ");

            renderB({ immediate: true });

        }

    });


    /* ---------- Batch ---------- */

    function renderBatch() {

        clearTimeout(batchTimer);

        const text = nodes.batch.value;

        nodes.batchHead.replaceChildren();
        nodes.batchRows.replaceChildren();

        if (text.trim() === "") {

            batchResult = null;

            nodes.batchOut.hidden = true;
            nodes.batchStatus.hidden = true;
            nodes.batchCopy.disabled = true;

            return;

        }

        const result = convertBatch(text, nodes.batchUnit.value, zone);

        batchResult = result;

        const headings = ["Line", "Value", "Unit", "UTC", zone];

        const headRow = document.createElement("tr");

        for (const heading of headings) {

            const th = el("th", "", heading);

            th.scope = "col";

            headRow.append(th);

        }

        nodes.batchHead.append(headRow);

        const fragment = document.createDocumentFragment();

        for (const item of result.rows) {

            const tr = document.createElement("tr");

            const line = el("th", "ts-nowrap", String(item.line));

            line.scope = "row";

            tr.append(line);
            tr.append(el("td", "ts-mono", item.token));

            if (item.ok) {

                tr.append(el("td", "", item.unitText));
                tr.append(el("td", "ts-mono ts-nowrap", item.utc));
                tr.append(el("td", "ts-mono ts-nowrap", item.local));

            } else {

                const cell = el("td", "ts-bad", `Not converted: ${item.message}`);

                cell.colSpan = 3;

                tr.append(cell);

            }

            fragment.append(tr);

        }

        nodes.batchRows.append(fragment);

        nodes.batchOut.hidden = false;
        nodes.batchCopy.disabled = result.rows.length === 0;

        const parts = [`${result.converted} converted`, `${result.problems} not converted`];

        if (result.total > result.shown) {
            parts.push(`showing the first ${result.shown} of ${result.total} entries`);
        }

        if (result.truncatedInput) {
            parts.push(`input beyond ${BATCH_MAX_CHARS.toLocaleString("en-US")} characters was ignored`);
        }

        const summary = parts.join(", ") + ".";

        nodes.batchStatus.textContent = summary;
        nodes.batchStatus.hidden = false;

        announceSettled(`Batch: ${summary}`);

    }

    nodes.batch.addEventListener("input", () => {

        clearTimeout(batchTimer);

        batchTimer = setTimeout(renderBatch, BATCH_PAUSE_MS);

    });

    nodes.batchUnit.addEventListener("change", renderBatch);

    wireCopy(nodes.batchCopy, "the batch table", () => (batchResult ? batchToTsv(batchResult.rows, zone) : ""));

    nodes.batchClear.addEventListener("click", () => {

        nodes.batch.value = "";

        renderBatch();

        announce("Batch cleared.");

        nodes.batch.focus();

    });


    /* ---------- the shared time zone ---------- */

    nodes.zone.addEventListener("change", () => {

        zone = nodes.zone.value;

        renderA({ immediate: true });
        renderB({ immediate: true });
        renderBatch();

    });


    /* ---------- start ---------- */

    tick();

    renderBoard();

    /* the page's script has run and the controls work (tests wait for this) */
    panel.dataset.ready = "true";

}
