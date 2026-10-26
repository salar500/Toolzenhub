/* =========================================================
   ToolZen Hub
   Countdown Timer: the "Count to a date" mode (needs the browser)

   The Countdown Timer's first mode counts a LENGTH of time from the
   moment you press Start. This mode counts to a moment on the
   calendar: a date and a time on a clock, in a time zone you choose
   (this device's zone to begin with). The rules are in
   target-engine.js (pure); this file owns the form, the display and
   the announcements.

   The time left is read from the device clock on every tick, so a
   background tab or a sleeping laptop shows the right time as soon as
   it is looked at. Nothing is stored. The target, its zone and an
   optional event name can be put in the page address by the visitor
   (Copy link); the address is read back with validation, and the name
   is only ever shown as text.
========================================================= */

import {
    NAME_LIMIT,
    parseTarget,
    remainingAt,
    eventText,
    clockText,
    spokenParts,
    announceKey,
    buildQuery,
    parseQuery,
    MESSAGES
} from "./target-engine.js";

import {
    listZones,
    isValidZone
} from "../time-zone-converter/time-zone-engine.js";

import {
    fieldShell
} from "../../ui/field.js";

import {
    escapeHTML
} from "../../ui/escape.js";

import {
    createAnnouncer,
    copyToClipboard,
    wireTodayButtons,
    todayButton
} from "../time-ui/time-ui.js";


const ERROR_ID = "cd-error";

/* the two-way switch above both panels */
export function modeSwitchMarkup() {

    return `
                <fieldset class="tt-choice ct-modes" id="ct-modes">

                    <legend class="tt-sr-only">What to count</legend>

                    <label class="tt-check">
                        <input type="radio" name="ct-mode" value="length" checked>
                        <span>Count down a length of time</span>
                    </label>

                    <label class="tt-check">
                        <input type="radio" name="ct-mode" value="date">
                        <span>Count down to a date</span>
                    </label>

                </fieldset>`;

}

export function dateModeMarkup() {

    return `
                <div id="cd-panel" class="ct-panel cd-panel" data-state="idle" hidden>

                    <form id="cd-form" class="calculator-form cd-form" novalidate>

                        <div id="cd-setup" class="cd-setup">

                            <div class="calculator-section__title">
                                Count to a Date
                            </div>

                            <div class="calculator-form__grid cd-fields">

                                ${fieldShell({
                                    id: "cd-name",
                                    label: "Event name (optional)",
                                    hint: `Up to ${NAME_LIMIT} characters.`,
                                    control: `<input
                                    id="cd-name"
                                    class="calculator-form__input"
                                    type="text"
                                    maxlength="${NAME_LIMIT}"
                                    autocomplete="off"
                                    aria-describedby="cd-name-hint"
                                >`
                                })}

                                ${fieldShell({
                                    id: "cd-date",
                                    label: "Date",
                                    hint: "The day to count down to.",
                                    control: `<input
                                    id="cd-date"
                                    class="calculator-form__input tt-date-input"
                                    type="date"
                                    min="1970-01-01"
                                    max="2100-12-31"
                                    aria-describedby="cd-date-hint"
                                >
                                ${todayButton("cd-date")}`
                                })}

                                ${fieldShell({
                                    id: "cd-time",
                                    label: "Time",
                                    hint: "On the clock of the time zone below.",
                                    control: `<input
                                    id="cd-time"
                                    class="calculator-form__input"
                                    type="time"
                                    value="00:00"
                                    aria-describedby="cd-time-hint"
                                >`
                                })}

                                ${fieldShell({
                                    id: "cd-zone",
                                    label: "Time zone",
                                    hint: "Blank means this device's time zone.",
                                    control: `<input
                                    id="cd-zone"
                                    class="calculator-form__input"
                                    type="text"
                                    list="cd-zones"
                                    autocomplete="off"
                                    spellcheck="false"
                                    aria-describedby="cd-zone-hint"
                                >`
                                })}

                            </div>

                            <datalist id="cd-zones"></datalist>

                            <fieldset id="cd-choice" class="tt-choice cd-choice" hidden>
                                <legend class="calculator-form__label">That time happens twice (the clocks go back)</legend>
                                <label class="tt-check"><input type="radio" name="cd-choice" value="earlier" checked><span>The first time</span></label>
                                <label class="tt-check"><input type="radio" name="cd-choice" value="later"><span>The second time</span></label>
                            </fieldset>

                            <p id="${ERROR_ID}" class="tt-error" role="alert" hidden></p>

                        </div>

                        <div id="cd-stage" class="tt-stage" hidden>

                            <p id="cd-title" class="tt-phase"></p>

                            <div
                                id="cd-display"
                                class="tt-display cd-display"
                                role="timer"
                                aria-live="off"
                                aria-label="Time left"
                            >00:00:00</div>

                            <p id="cd-event" class="tt-next"></p>

                            <p id="cd-status" class="tt-status-line"></p>

                        </div>

                        <div class="tt-timer-actions cd-actions">
                            <button type="submit" id="cd-start" class="calculator-form__button tt-timer-button">Start countdown</button>
                            <button type="button" id="cd-link" class="calculator-form__button calculator-form__button--secondary tt-timer-button" hidden>Copy link</button>
                            <button type="button" id="cd-reset" class="calculator-form__button calculator-form__button--secondary tt-timer-button" hidden>Reset</button>
                        </div>

                        <p id="cd-link-status" class="tt-status" role="status" hidden></p>

                    </form>

                </div>

                <p id="cd-live" class="tt-sr-only" role="status" aria-live="polite"></p>`;

}

/* wire the mode switch and the date panel; returns nothing */
export function initDateMode() {

    const lengthPanel = document.querySelector("#ct-panel");
    const panel = document.querySelector("#cd-panel");

    if (!lengthPanel || !panel) {
        return;
    }

    const $ = (id) => document.getElementById(id);

    const form = $("cd-form");
    const nameInput = $("cd-name");
    const dateInput = $("cd-date");
    const timeInput = $("cd-time");
    const zoneInput = $("cd-zone");
    const choiceBox = $("cd-choice");
    const errorBox = $(ERROR_ID);
    const stage = $("cd-stage");
    const titleEl = $("cd-title");
    const display = $("cd-display");
    const eventEl = $("cd-event");
    const statusEl = $("cd-status");
    const startButton = $("cd-start");
    const linkButton = $("cd-link");
    const resetButton = $("cd-reset");
    const linkStatus = $("cd-link-status");
    const setup = $("cd-setup");

    const speaker = createAnnouncer($("cd-live"));

    const fields = [nameInput, dateInput, timeInput, zoneInput];

    try {
        $("cd-zones").innerHTML = listZones().map(zone => `<option value="${escapeHTML(zone)}"></option>`).join("");
    } catch {
        /* typing a zone still works */
    }

    let target = null;
    let interval = null;
    let lastKey = "";

    const choice = () => form.querySelector("input[name='cd-choice']:checked").value;

    /* ---------- the two modes ---------- */

    function showMode(mode) {

        const date = mode === "date";

        lengthPanel.hidden = date;

        panel.hidden = !date;

        document.querySelector(`input[name='ct-mode'][value='${mode}']`).checked = true;

    }

    for (const radio of document.querySelectorAll("input[name='ct-mode']")) {
        radio.addEventListener("change", () => showMode(radio.value));
    }

    /* ---------- errors ---------- */

    function clearErrors() {

        for (const field of fields) {
            field.removeAttribute("aria-invalid");
            field.removeAttribute("aria-describedby");
        }

        errorBox.hidden = true;
        errorBox.textContent = "";

    }

    function showErrors(errors) {

        clearErrors();

        const byField = { date: dateInput, time: timeInput, zone: zoneInput };

        for (const error of errors) {

            const element = byField[error.field];

            if (element) {
                element.setAttribute("aria-invalid", "true");
                element.setAttribute("aria-describedby", ERROR_ID);
            }

        }

        errorBox.textContent = errors.map(error => error.message).join(" ");
        errorBox.hidden = false;

        speaker.announce(errorBox.textContent, 0);

        (byField[errors[0].field] ?? dateInput).focus();

    }

    /* ---------- the display ---------- */

    function paint({ announce = true } = {}) {

        if (!target) {
            return;
        }

        const left = remainingAt(target.ms, Date.now());

        display.textContent = clockText(left);

        panel.dataset.state = left.reached ? "reached" : "running";

        if (left.reached) {

            statusEl.textContent = left.totalSeconds === 0 ? "The time has been reached." : `The time was reached ${spokenParts(left)} ago.`;

            stopLoop();

        } else {

            statusEl.textContent = "Counting down";

        }

        const key = announceKey(left);

        if (announce && key !== lastKey) {

            lastKey = key;

            speaker.announce(
                left.reached
                    ? `${titleEl.textContent || "The time"} has been reached.`
                    : `${spokenParts(left)} left.`,
                0
            );

        }

    }

    function stopLoop() {

        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }

    }

    function startLoop() {

        stopLoop();

        interval = setInterval(() => paint(), 250);

    }

    document.addEventListener("visibilitychange", () => {

        if (!document.hidden) {
            paint();
        }

    });

    /* ---------- start, reset, link ---------- */

    function begin({ focus = true } = {}) {

        clearErrors();

        const zone = zoneInput.value.trim();

        const parsed = parseTarget({
            date: dateInput.value,
            time: timeInput.value,
            zone,
            choice: choice()
        });

        if (!parsed.ok) {
            return showErrors(parsed.errors);
        }

        choiceBox.hidden = !parsed.ambiguous;

        if (parsed.ambiguous) {

            const first = choiceBox.hidden ? null : choiceBox.querySelector("input");

            if (!choiceBox.dataset.shown) {

                /* ask which of the two times is meant before counting */
                choiceBox.dataset.shown = "true";

                speaker.announce(`That time happens twice in ${parsed.zone}. Choose the first or the second, then start again.`, 0);

                first?.focus();

                return;

            }

        }

        if (parsed.ms <= Date.now()) {
            return showErrors([{ field: "date", message: MESSAGES.past }]);
        }

        target = parsed;

        lastKey = "";

        titleEl.textContent = nameInput.value.trim() || "Countdown";

        eventEl.textContent = eventText(parsed.ms, parsed.zone) + (parsed.ambiguous ? ` (${choice() === "later" ? "the second" : "the first"} time it happens)` : "");

        setup.hidden = true;
        stage.hidden = false;
        startButton.hidden = true;
        linkButton.hidden = false;
        resetButton.hidden = false;

        paint({ announce: false });

        startLoop();

        speaker.announce(`Counting down to ${titleEl.textContent}. ${spokenParts(remainingAt(parsed.ms, Date.now()))} left.`, 0);

        if (focus) {
            resetButton.focus();
        }

    }

    function reset() {

        stopLoop();

        target = null;

        panel.dataset.state = "idle";

        setup.hidden = false;
        stage.hidden = true;
        startButton.hidden = false;
        linkButton.hidden = true;
        resetButton.hidden = true;
        linkStatus.hidden = true;

        delete choiceBox.dataset.shown;

        choiceBox.hidden = true;

        clearErrors();

        speaker.clear();

        dateInput.focus();

    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        begin();
    });

    resetButton.addEventListener("click", reset);

    form.addEventListener("input", (event) => {

        /* choosing which of the two times is meant is the answer, not a change of it */
        if (event.target.name === "cd-choice") {
            return;
        }

        /* a changed answer means the question about a repeated hour must be asked again */
        delete choiceBox.dataset.shown;

        if (!target) {
            choiceBox.hidden = true;
        }

    });

    linkButton.addEventListener("click", async () => {

        if (!target) {
            return;
        }

        const query = buildQuery({
            date: dateInput.value,
            time: timeInput.value,
            zone: zoneInput.value.trim(),
            name: nameInput.value.trim(),
            choice: choice()
        });

        const link = `${location.origin}${location.pathname}?${query}`;

        const ok = await copyToClipboard(link);

        linkStatus.hidden = false;

        linkStatus.textContent = ok
            ? "Link copied. It contains the date, time, time zone and the event name, if you typed one."
            : `Copying is not available here. The link is: ${link}`;

        speaker.announce(linkStatus.textContent, 0);

    });

    wireTodayButtons(form);

    /* ---------- a link with a target restores it, validated ---------- */

    const fromAddress = parseQuery(location.search);

    if (fromAddress) {

        dateInput.value = fromAddress.date;
        timeInput.value = fromAddress.time;
        nameInput.value = fromAddress.name;

        if (fromAddress.zone && isValidZone(fromAddress.zone)) {
            zoneInput.value = fromAddress.zone;
        }

        form.querySelector(`input[name='cd-choice'][value='${fromAddress.choice}']`).checked = true;

        showMode("date");

        const parsed = parseTarget({ date: fromAddress.date, time: fromAddress.time, zone: zoneInput.value.trim(), choice: fromAddress.choice });

        if (parsed.ok) {

            if (parsed.ambiguous) {
                choiceBox.hidden = false;
                choiceBox.dataset.shown = "true";
            }

            if (parsed.ms > Date.now()) {
                begin({ focus: false });
            } else {
                /* a link to a moment that has passed shows that it has been reached */
                target = parsed;
                titleEl.textContent = nameInput.value.trim() || "Countdown";
                eventEl.textContent = eventText(parsed.ms, parsed.zone);
                setup.hidden = true;
                stage.hidden = false;
                startButton.hidden = true;
                linkButton.hidden = false;
                resetButton.hidden = false;
                paint({ announce: false });
            }

        } else {
            showErrors(parsed.errors);
        }

    }

    panel.dataset.ready = "true";

}
