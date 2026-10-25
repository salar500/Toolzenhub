/* =========================================================
   ToolZen Hub
   International Meeting Planner (Time Tools)

   Add two to four people, each with a time zone, the days they can
   meet and the hours they can meet (a window may cross midnight), and
   find the times on the next days that fall inside everyone's hours.
   A day with no shared time is explained by whose hours block it, and a
   weekly meeting is checked through clock changes.

   The rules are in meeting-engine.js (pure, checked against an
   independent reference); time zone data and clock arithmetic are the
   Time Zone Converter's own functions. This file owns the form, the
   result and the link.

   Everything runs in the browser. Names and zones stay on the page; the
   shareable link is built only when asked, from the settings.
========================================================= */

import {
    LIMITS,
    WEEKDAY_SHORT,
    DEFAULT_PERSON,
    findMeetingTimes,
    recurringCheck,
    personTime,
    shiftWords,
    copyText,
    buildQuery,
    parseQuery
} from "./meeting-engine.js";

import {
    listZones,
    localZone,
    isValidZone
} from "../time-zone-converter/time-zone-engine.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    fieldShell
} from "../../ui/field.js";

import {
    resultEmpty
} from "../../ui/result.js";

import {
    escapeHTML
} from "../../ui/escape.js";

import {
    introMarkup,
    infoSection,
    faqSection,
    createAnnouncer,
    copyToClipboard,
    wireCopy,
    wireTodayButtons,
    todayButton
} from "../time-ui/time-ui.js";


/* The related-tools pilot for Time Tools: curated tools from this section only, no articles. */
export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const TITLE = getToolById("meeting-planner").title;

const CONVERTER = getToolById("time-zone-converter");
const WORLD_CLOCK = getToolById("world-clock");

const EMPTY = "Add the people, choose a first date and press Find meeting times.";

const ERROR_ID = "mp-error";

const MESSAGE_PERSON = (index, message) => `Person ${index + 1}: ${message}`;


/* =========================================================
   MARKUP
========================================================= */

function personRow(person, number) {

    const id = `mp-p${number}`;

    return `
                        <fieldset class="mp-person" data-person>

                            <legend class="calculator-form__label mp-person__title">Person ${number}</legend>

                            <div class="calculator-form__grid mp-person__grid">

                                <div class="calculator-form__field">
                                    <label class="calculator-form__label" for="${id}-name">Name (optional)</label>
                                    <input id="${id}-name" class="calculator-form__input mp-name" type="text" maxlength="${LIMITS.nameLength}" autocomplete="off" value="${escapeHTML(person.name)}">
                                </div>

                                <div class="calculator-form__field">
                                    <label class="calculator-form__label" for="${id}-zone">Time zone</label>
                                    <input id="${id}-zone" class="calculator-form__input mp-zone" type="text" list="mp-zones" autocomplete="off" spellcheck="false" placeholder="Asia/Kolkata" value="${escapeHTML(person.zone)}">
                                </div>

                                <div class="calculator-form__field">
                                    <label class="calculator-form__label" for="${id}-start">Available from</label>
                                    <input id="${id}-start" class="calculator-form__input mp-start" type="time" step="900" value="${person.start}">
                                </div>

                                <div class="calculator-form__field">
                                    <label class="calculator-form__label" for="${id}-end">Available until</label>
                                    <input id="${id}-end" class="calculator-form__input mp-end" type="time" step="900" value="${person.end}">
                                </div>

                            </div>

                            <div class="mp-days" role="group" aria-label="Person ${number}: days available">
                                ${WEEKDAY_SHORT.map((name, i) => `
                                <label class="tt-check"><input type="checkbox" class="mp-day" value="${i}"${person.days[i] ? " checked" : ""}><span>${name}</span></label>`).join("")}
                            </div>

                            <button type="button" class="mp-remove tt-inline-button" aria-label="Remove person ${number}">Remove</button>

                        </fieldset>`;

}

export function markup() {

    return `
        <div class="calculator-page">
${introMarkup({
        title: TITLE,
        lead: "Find a time that falls inside everyone's own working hours, whatever their time zone, with clock changes taken into account."
    })}

            <!-- THE TOOL -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Who Is Meeting?
                </div>

                <p class="calculator-section__description">
                    Give each person a time zone, the hours they can meet and the
                    days they can meet. A window that crosses midnight, such as
                    22:00 to 06:00, is allowed.
                </p>

                <form id="mp-form" class="calculator-form mp-form" novalidate>

                    <div id="mp-people" class="mp-people">${[0, 1].map(i => personRow({ ...DEFAULT_PERSON, days: DEFAULT_PERSON.days }, i + 1)).join("")}
                    </div>

                    <div class="calculator-form__actions">
                        <button type="button" id="mp-add" class="calculator-form__button calculator-form__button--secondary">Add a person</button>
                    </div>

                    <div class="calculator-form__grid mp-common">

                        <div class="calculator-form__field">
                            <label class="calculator-form__label" for="mp-length">Meeting length</label>
                            <select id="mp-length" class="calculator-form__input">
                                ${LIMITS.durations.map(m => `<option value="${m}"${m === LIMITS.defaultDuration ? " selected" : ""}>${m} minutes</option>`).join("")}
                            </select>
                        </div>

                        ${fieldShell({
                            id: "mp-date",
                            label: "First date",
                            hint: "The first day to look at, on the reference zone's calendar.",
                            control: `<input
                                    id="mp-date"
                                    class="calculator-form__input tt-date-input"
                                    type="date"
                                    min="1970-01-01"
                                    max="2100-12-31"
                                    aria-describedby="mp-date-hint"
                                >
                                ${todayButton("mp-date")}`
                        })}

                        <div class="calculator-form__field">
                            <label class="calculator-form__label" for="mp-days">Days to look at</label>
                            <select id="mp-days" class="calculator-form__input">
                                ${Array.from({ length: LIMITS.maxDays }, (_, i) => `<option value="${i + 1}"${i + 1 === LIMITS.defaultDays ? " selected" : ""}>${i + 1}</option>`).join("")}
                            </select>
                        </div>

                        ${fieldShell({
                            id: "mp-ref",
                            label: "Reference time zone (optional)",
                            hint: "Dates and the order of days follow this zone. Blank means the first person's.",
                            control: `<input
                                    id="mp-ref"
                                    class="calculator-form__input"
                                    type="text"
                                    list="mp-zones"
                                    autocomplete="off"
                                    spellcheck="false"
                                    aria-describedby="mp-ref-hint"
                                >`
                        })}

                    </div>

                    <fieldset class="tt-choice mp-clock">
                        <legend class="calculator-form__label">Clock</legend>
                        <label class="tt-check"><input type="radio" name="mp-clock" value="24" checked><span>24-hour</span></label>
                        <label class="tt-check"><input type="radio" name="mp-clock" value="12"><span>12-hour</span></label>
                    </fieldset>

                    <datalist id="mp-zones"></datalist>

                    <p id="${ERROR_ID}" class="tt-error" role="alert" hidden></p>

                    <div class="calculator-form__actions">
                        <button type="submit" id="mp-find" class="calculator-form__button">Find meeting times</button>
                        <button type="button" id="mp-reset" class="calculator-form__button calculator-form__button--secondary">Reset</button>
                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section id="mp-results" class="calculator-results">
                ${resultEmpty(EMPTY)}
            </section>

            <p id="mp-live" class="tt-sr-only" role="status" aria-live="polite"></p>
${infoSection("How to Use the " + TITLE, `<ol>
                    <li>
                        For each person, choose a time zone from the list, the days
                        they can meet and the hours they can meet in their own
                        local time.
                    </li>
                    <li>
                        Choose the meeting length, the first date and how many
                        days to look at (up to ${LIMITS.maxDays}), then press Find meeting times.
                    </li>
                    <li>
                        Read the times for each day in everyone's local time. Copy
                        them, or copy a link that keeps these settings.
                    </li>
                </ol>`)}
${infoSection("How a Time Is Chosen", `<p>
                    A meeting fits when every 15-minute block of it lies inside
                    each person's hours, judged on that person's own clock at that
                    moment, so a clock change inside the dates is handled. A window
                    that crosses midnight belongs to the day it starts on: Friday
                    22:00 to 06:00 covers Friday night and early Saturday morning.
                </p>
                <p>
                    When no time works on a day, the result says whose hours leave
                    no overlap and shows the hours each person does have, on the
                    reference zone's clock.
                </p>`)}
${infoSection("A Weekly Meeting and Clock Changes", `<p>
                    A weekly meeting is usually fixed on one zone's clock. When
                    another person's clocks change on a different date, the same
                    meeting moves for them by the size of the change, and can drift
                    outside their hours. After a search, the planner checks the
                    first suggested time for the next ${LIMITS.recurringWeeks} weeks and says who is
                    affected and from which week.
                </p>`)}
${infoSection("Limits", `<p>
                    Dates run from 1970 to 2100. It uses your browser's time zone
                    data and does not know public holidays, local customs or
                    anyone's real calendar. A zone whose offset is not a multiple of
                    15 minutes on a date cannot be listed, and the page says so.
                    To convert one time between zones, use the
                    <a href="${CONVERTER.href}">${escapeHTML(CONVERTER.title)}</a>. To see the current
                    time in many places, use the
                    <a href="${WORLD_CLOCK.href}">${escapeHTML(WORLD_CLOCK.title)}</a>.
                </p>`)}
${faqSection(TITLE + " FAQ", [
        ["How is this different from the Time Zone Converter?", "The converter turns one time into other zones, and can mark preferred hours for each zone. This planner takes people, each with their own days and hours (including overnight windows), scans up to 14 days, explains days with no shared time and checks a weekly meeting through clock changes."],
        ["Can someone work overnight?", "Yes. Set the hours to cross midnight, for example 22:00 to 06:00. The window belongs to the day it starts on."],
        ["What does the weekly check do?", "It keeps the first suggested time fixed on the reference zone's clock and shows whether it moves, or leaves someone's hours, in the next 12 weeks."],
        ["Where do the time zones come from?", "From your browser. Choose one from the list, for example Europe/London or Asia/Kolkata."],
        ["Is anything sent or saved?", "No. Everything is calculated in your browser. A link is built only when you press the button and contains your settings, including any names you typed."]
    ])}

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
   THE RESULT
========================================================= */

const hourFor = (entry, hour12) => personTime(entry, hour12);

function dayLabel(entry) {

    return entry.dayDelta === 0 ? "" : `, ${entry.dateLabel}`;

}

function windowMarkup(slot, hour12) {

    const rows = slot.perPerson.map(person => `
                            <tr>
                                <th scope="row">${escapeHTML(person.name)}<span class="mp-zone-name">${escapeHTML(person.zone)}</span></th>
                                <td data-label="Start between">${escapeHTML(hourFor(person.start, hour12))} to ${escapeHTML(hourFor(person.lastStart, hour12))}${escapeHTML(dayLabel(person.start))}</td>
                                <td data-label="Earliest meeting ends">${escapeHTML(hourFor(person.firstEnd, hour12))}${escapeHTML(dayLabel(person.firstEnd))}</td>
                            </tr>`).join("");

    const first = slot.perPerson[0];

    return `
                <div class="mp-window">
                    <p class="mp-window__head"><strong>Start between ${escapeHTML(hourFor(first.start, hour12))} and ${escapeHTML(hourFor(first.lastStart, hour12))}</strong> ${escapeHTML(first.zone)}${slot.starts === 1 ? "" : ` (${slot.starts} possible start times, every 15 minutes)`}</p>
                    <table class="mp-table">
                        <thead>
                            <tr><th scope="col">Person</th><th scope="col">Start between</th><th scope="col">Earliest meeting ends</th></tr>
                        </thead>
                        <tbody>${rows}
                        </tbody>
                    </table>
                </div>`;

}

function blockedMarkup(day, hour12) {

    const names = day.blockedBy;

    const lines = day.people.map(person => `
                        <li>${escapeHTML(person.name)} (${escapeHTML(person.zone)}): ${person.runs.length === 0
        ? "not available on this date"
        : person.runs.map(run => `${escapeHTML(personTime(run.start, hour12))} to ${escapeHTML(personTime(run.end, hour12))}`).join(", ")}${person.canMeet ? "" : " — cannot fit the meeting length"}</li>`).join("");

    return `
                <div class="mp-window mp-window--none">
                    <p>No time works. ${names.length > 0 ? `${escapeHTML(names.join(", "))} ${names.length === 1 ? "has" : "have"} no stretch long enough on this date.` : "The hours that each person has do not overlap."}</p>
                    <ul class="tt-list">${lines}
                    </ul>
                    <p class="tt-hint">Hours shown on the reference zone's clock.</p>
                </div>`;

}

function changesMarkup(changes) {

    if (changes.length === 0) {
        return "";
    }

    return `
                <div class="tt-note" role="note">
                    <strong>Clock changes inside these dates.</strong>
                    <ul class="tt-list">${changes.map(change => `
                        <li>${escapeHTML(change.name)} (${escapeHTML(change.zone)}): ${escapeHTML(change.text)} on ${escapeHTML(change.local.dateLabel)}. Times after that date use the new offset.</li>`).join("")}
                    </ul>
                </div>`;

}

function recurringMarkup(check, slot, hour12) {

    if (check.status !== "ok") {
        return "";
    }

    const lines = check.summary.map(entry => {

        const parts = [];

        if (entry.firstShift) {
            parts.push(`moves ${shiftWords(entry.firstShift.shiftMinutes)}${entry.firstShift.dayShift !== 0 ? ` and ${entry.firstShift.dayShift > 0 ? "a day later" : "a day earlier"}` : ""} from week ${entry.firstShift.week + 1} (${entry.firstShift.date}), to ${entry.firstShift.time}`);
        }

        if (entry.outsideFromWeek !== null) {
            parts.push(`falls outside their hours from week ${entry.outsideFromWeek + 1}`);
        }

        return `<li>${escapeHTML(entry.name)} (${escapeHTML(entry.zone)}): ${parts.length > 0 ? escapeHTML(parts.join("; ")) : "same local time every week"}.</li>`;

    }).join("");

    const first = slot.perPerson[0];

    return `
                <section class="mp-recurring" aria-labelledby="mp-recurring-title">
                    <h3 id="mp-recurring-title">If this is a weekly meeting</h3>
                    <p>Fixed at ${escapeHTML(hourFor(first.start, hour12))} ${escapeHTML(first.zone)} every week for ${LIMITS.recurringWeeks} weeks, starting ${escapeHTML(first.start.dateLabel)}:</p>
                    <ul class="tt-list">${lines}</ul>
                    ${check.moved || check.outside ? `<p class="tt-note" role="note">A clock change moves this meeting for someone. Check the weeks around it before you send an invitation.</p>` : `<p class="tt-hint">No clock change moves it for anyone in these weeks.</p>`}
                </section>`;

}

function resultMarkup(result, check, hour12) {

    const days = result.dates.map(day => `
                <section class="mp-day-result" aria-label="${escapeHTML(day.weekday)} ${escapeHTML(day.date)}">
                    <h3>${escapeHTML(day.weekday)}, ${escapeHTML(day.date)} <span class="tt-tag">${day.status === "ok" ? `${day.total} ${day.total === 1 ? "window" : "windows"}` : "no shared time"}</span></h3>
                    ${day.status === "ok" ? day.windows.map(slot => windowMarkup(slot, hour12)).join("") + (day.total > day.windows.length ? `<p class="tt-hint">${day.total - day.windows.length} more windows not shown.</p>` : "") : blockedMarkup(day, hour12)}
                </section>`).join("");

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        ${result.total === 0 ? "No time works on these dates" : `${result.total} ${result.total === 1 ? "window" : "windows"} of ${result.duration} minutes`}
                    </h2>

                </div>

                <p class="tt-hint">Reference zone: ${escapeHTML(result.reference)}. Times are in each person's own zone.</p>

                ${changesMarkup(result.changes)}

                <div class="mp-days-result">${days}
                </div>

                ${check ? recurringMarkup(check, result.best, hour12) : ""}

                <div class="tt-actions">
                    <button type="button" id="mp-copy" class="calculator-form__button calculator-form__button--secondary">Copy summary</button>
                    <button type="button" id="mp-link" class="calculator-form__button calculator-form__button--secondary">Copy link</button>
                    <span id="mp-copy-status" class="tt-status" role="status" hidden></span>
                </div>

            </div>
        `;

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const form = document.querySelector("#mp-form");
    const results = document.querySelector("#mp-results");

    if (!form || !results) {
        return;
    }

    const speaker = createAnnouncer(document.querySelector("#mp-live"));

    const $ = (id) => document.getElementById(id);

    const list = $("mp-people");
    const lengthInput = $("mp-length");
    const dateInput = $("mp-date");
    const daysInput = $("mp-days");
    const refInput = $("mp-ref");
    const errorBox = $(ERROR_ID);
    const addButton = $("mp-add");

    const rowsOf = () => [...list.querySelectorAll("[data-person]")];

    const hour12 = () => form.querySelector("input[name='mp-clock']:checked").value === "12";

    /* the zone list (the browser's own) for the suggestions */
    try {
        $("mp-zones").innerHTML = listZones().map(zone => `<option value="${escapeHTML(zone)}"></option>`).join("");
    } catch {
        /* the list is a convenience; typing a zone still works */
    }

    function renumber() {

        rowsOf().forEach((row, index) => {

            const n = index + 1;

            row.querySelector(".mp-person__title").textContent = `Person ${n}`;
            row.querySelector(".mp-days").setAttribute("aria-label", `Person ${n}: days available`);
            row.querySelector(".mp-remove").setAttribute("aria-label", `Remove person ${n}`);
            row.querySelector(".mp-remove").hidden = rowsOf().length <= LIMITS.minPeople;

        });

        addButton.disabled = rowsOf().length >= LIMITS.maxPeople;

    }

    function peopleFromForm() {

        return rowsOf().map(row => ({
            name: row.querySelector(".mp-name").value,
            zone: row.querySelector(".mp-zone").value.trim(),
            start: row.querySelector(".mp-start").value,
            end: row.querySelector(".mp-end").value,
            days: [...row.querySelectorAll(".mp-day")].map(box => box.checked)
        }));

    }

    function settings() {

        return {
            people: peopleFromForm(),
            duration: Number(lengthInput.value),
            date: dateInput.value,
            days: Number(daysInput.value),
            reference: refInput.value.trim()
        };

    }

    function fieldFor(issue) {

        if (issue.person >= 0) {

            const row = rowsOf()[issue.person];

            const map = { zone: ".mp-zone", start: ".mp-start", end: ".mp-end", days: ".mp-day" };

            return row?.querySelector(map[issue.field] ?? ".mp-name") ?? null;

        }

        return { date: dateInput, days: daysInput, reference: refInput, duration: lengthInput }[issue.field] ?? null;

    }

    function clearInvalid() {

        for (const element of form.querySelectorAll("[aria-invalid]")) {
            element.removeAttribute("aria-invalid");
            element.removeAttribute("aria-describedby");
        }

    }

    function fail(issues) {

        clearInvalid();

        const messages = issues.map(issue => issue.person >= 0 ? MESSAGE_PERSON(issue.person, issue.message) : issue.message);

        for (const issue of issues) {

            const element = fieldFor(issue);

            if (element) {
                element.setAttribute("aria-invalid", "true");
                element.setAttribute("aria-describedby", ERROR_ID);
            }

        }

        errorBox.textContent = [...new Set(messages)].join(" ");
        errorBox.hidden = false;

        results.innerHTML = resultEmpty(EMPTY);

        speaker.announce(errorBox.textContent, 0);

        fieldFor(issues[0])?.focus();

    }

    let last = null;

    function run({ speak = true } = {}) {

        errorBox.hidden = true;

        clearInvalid();

        const input = settings();

        if (input.reference !== "" && !isValidZone(input.reference)) {
            return fail([{ person: -1, field: "reference", message: "Choose a reference time zone from the list, or leave it blank." }]);
        }

        if (input.date === "") {
            return fail([{ person: -1, field: "date", message: "Choose the first date to look at." }]);
        }

        const result = findMeetingTimes({ ...input, reference: input.reference || null });

        if (result.status === "invalid") {
            return fail(result.issues);
        }

        if (result.status === "unsupported") {
            return fail([{ person: -1, field: "date", message: result.message }]);
        }

        const check = result.best
            ? recurringCheck({ slotMs: result.best.firstStartMs, reference: result.reference, duration: result.duration, people: input.people })
            : null;

        results.innerHTML = resultMarkup(result, check, hour12());

        last = { input, result };

        wireCopy({
            button: results.querySelector("#mp-copy"),
            status: results.querySelector("#mp-copy-status"),
            getText: () => copyText(result, hour12()),
            announce: (message, delay) => speaker.announce(message, delay)
        });

        results.querySelector("#mp-link").addEventListener("click", async () => {

            const status = results.querySelector("#mp-copy-status");

            const link = `${location.origin}${location.pathname}?${buildQuery({ ...input, reference: input.reference })}`;

            const ok = await copyToClipboard(link);

            status.hidden = false;
            status.textContent = ok ? "Link copied. It contains these settings, including any names you typed." : `Copying is not available here. The link is: ${link}`;

            speaker.announce(status.textContent, 0);

        });

        if (speak) {
            speaker.announce(
                result.total === 0
                    ? "No time works on these dates."
                    : `${result.total} ${result.total === 1 ? "window" : "windows"} found. The first is on ${result.dates.find(d => d.status === "ok").weekday}, ${result.dates.find(d => d.status === "ok").date}.`,
                0
            );
        }

    }

    /* ---------- wiring ---------- */

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        run();
    });

    form.addEventListener("change", (event) => {

        if (event.target.name === "mp-clock" && last) {
            run({ speak: false });
        }

    });

    addButton.addEventListener("click", () => {

        if (rowsOf().length >= LIMITS.maxPeople) {
            return;
        }

        list.insertAdjacentHTML("beforeend", personRow(DEFAULT_PERSON, rowsOf().length + 1));

        renumber();

        rowsOf().at(-1).querySelector(".mp-name").focus();

    });

    list.addEventListener("click", (event) => {

        const remove = event.target.closest(".mp-remove");

        if (!remove || rowsOf().length <= LIMITS.minPeople) {
            return;
        }

        const row = remove.closest("[data-person]");

        const index = rowsOf().indexOf(row);

        row.remove();

        renumber();

        rowsOf()[Math.min(index, rowsOf().length - 1)].querySelector(".mp-name").focus();

        speaker.announce(`Person ${index + 1} removed.`, 0);

    });

    wireTodayButtons(form);

    $("mp-reset").addEventListener("click", () => {

        list.innerHTML = [0, 1].map(i => personRow(DEFAULT_PERSON, i + 1)).join("");

        form.reset();

        errorBox.hidden = true;

        clearInvalid();

        results.innerHTML = resultEmpty(EMPTY);

        last = null;

        speaker.clear();

        renumber();

        rowsOf()[0].querySelector(".mp-name").focus();

    });

    /* ---------- the settings from the address, or the visitor's own zone ---------- */

    const fromAddress = parseQuery(location.search);

    if (fromAddress.people.length >= LIMITS.minPeople) {

        list.innerHTML = fromAddress.people.map((person, i) => personRow(person, i + 1)).join("");

        if (fromAddress.duration) lengthInput.value = String(fromAddress.duration);
        if (fromAddress.days) daysInput.value = String(fromAddress.days);
        if (fromAddress.date) dateInput.value = fromAddress.date;
        if (fromAddress.reference) refInput.value = fromAddress.reference;

    } else {

        const own = localZone();

        const first = rowsOf()[0]?.querySelector(".mp-zone");

        if (first && isValidZone(own)) {
            first.value = own;
        }

    }

    renumber();

    form.dataset.ready = "true";

}
