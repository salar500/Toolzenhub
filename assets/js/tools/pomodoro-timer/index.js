/* =========================================================
   ToolZen Hub
   Pomodoro Focus Timer (Time Tools)

   Alternate focus periods and breaks: focus, short break, focus,
   short break, and a longer break after every few focus periods.
   For study, writing, coding and any work done in focused blocks.

   The timing is in the shared timer-cycle engine (pure, tested with
   a fake clock) and cycle-controller.js (the running clock, the
   buttons and the announcements). This file owns the settings, the
   wording and what the screen shows about the current phase.

   The settings can live in the page address, so a bookmark
   restores them. Nothing else is stored, and nothing is sent
   anywhere: a reload starts a fresh session.
========================================================= */

import {
    LIMITS,
    POMODORO_DEFAULTS,
    pomodoroSequence,
    phaseLengthText,
    formatRemaining
} from "../timer-cycle/cycle-engine.js";

import {
    createCycleController
} from "../timer-cycle/cycle-controller.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    fieldShell
} from "../../ui/field.js";

import {
    escapeHTML
} from "../../ui/escape.js";

import {
    introMarkup,
    infoSection,
    faqSection,
    createAnnouncer
} from "../time-ui/time-ui.js";


/* The related-tools pilot for Time Tools: curated tools from this section only, no articles. */
export const showRelatedCalculators = true;
export const showRelatedArticles = false;


const TITLE = getToolById("pomodoro-timer").title;

const COUNTDOWN = getToolById("countdown-timer");
const INTERVAL = getToolById("interval-timer");
const STOPWATCH = getToolById("stopwatch");

const FIELDS = [
    ["focus", "Focus", "minutes", "pm-focus", "f", LIMITS.pomodoro.focus],
    ["short", "Short break", "minutes", "pm-short", "s", LIMITS.pomodoro.short],
    ["long", "Long break", "minutes", "pm-long", "l", LIMITS.pomodoro.long],
    ["every", "Long break after", "focus periods", "pm-every", "n", LIMITS.pomodoro.every]
];

const ERROR_ID = "pm-error";


/* =========================================================
   MARKUP
========================================================= */

function settingField([name, label, unit, id, , range]) {

    return fieldShell({
        id,
        label,
        unit,
        hint: `${range.min} to ${range.max}`,
        control: `<input
                                    id="${id}"
                                    class="calculator-form__input pm-input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    maxlength="3"
                                    value="${POMODORO_DEFAULTS[name]}"
                                    aria-describedby="${id}-hint"
                                >`
    });

}

const button = (id, text, classes = "") => `
                        <button
                            type="button"
                            id="${id}"
                            class="calculator-form__button ${classes} tt-timer-button"
                            hidden
                        >${text}</button>`;

export function markup() {

    return `
        <div class="calculator-page">
${introMarkup({
        title: TITLE,
        lead: "Work in focused blocks with timed breaks: focus, short break, and a longer break after every few focus periods."
    })}

            <!-- THE TIMER -->

            <section class="calculator-section">

                <div
                    id="pm-panel"
                    class="tt-timer-panel pm-panel"
                    data-state="idle"
                >

                    <form id="pm-form" class="calculator-form pm-form" novalidate>

                        <fieldset id="pm-settings" class="pm-settings">

                            <legend class="calculator-section__title">
                                Your Settings
                            </legend>

                            <div class="calculator-form__grid pm-fields">
                                ${FIELDS.map(settingField).join("")}
                            </div>

                            <div class="tt-checks pm-options">

                                <label class="tt-check">
                                    <input type="checkbox" id="pm-auto">
                                    <span>Start the next phase automatically</span>
                                </label>

                                <label class="tt-check">
                                    <input type="checkbox" id="pm-sound">
                                    <span>Play a short beep when a phase ends</span>
                                </label>

                            </div>

                            <p id="${ERROR_ID}" class="tt-error" role="alert" hidden></p>

                        </fieldset>

                        <div id="pm-stage" class="tt-stage" hidden>

                            <p id="pm-phase" class="tt-phase"></p>

                            <div
                                id="pm-display"
                                class="tt-display"
                                role="timer"
                                aria-live="off"
                                aria-label="Time left in this phase"
                            >25:00</div>

                            <p id="pm-status" class="tt-status-line"></p>

                            <p id="pm-next" class="tt-next"></p>

                            <p id="pm-count" class="tt-count"></p>

                        </div>

                        <div class="tt-timer-actions">
                            ${button("pm-start", "Start")}
                            ${button("pm-pause", "Pause", "calculator-form__button--secondary")}
                            ${button("pm-resume", "Resume")}
                            ${button("pm-skip", "Skip phase", "calculator-form__button--secondary")}
                            ${button("pm-next-phase", "Start next phase")}
                            ${button("pm-again", "Start again")}
                            ${button("pm-reset", "Reset", "calculator-form__button--secondary")}
                        </div>

                    </form>

                </div>

            </section>

            <p
                id="pm-live"
                class="tt-sr-only"
                role="status"
                aria-live="polite"
            ></p>
${infoSection("How to Use the " + TITLE, `<ol>
                    <li>
                        Choose how long a focus period and a break last. The usual
                        pattern is 25 minutes of focus and a 5 minute break, with
                        a 15 minute break after every fourth focus period; those
                        are the starting values.
                    </li>
                    <li>
                        Press Start and work until the phase ends. If the next
                        phase does not start by itself, press Start next phase
                        when you are ready.
                    </li>
                    <li>
                        Pause if you are interrupted, or skip a phase. A skipped
                        focus period is not counted as completed. Reset starts
                        over.
                    </li>
                </ol>`)}
${infoSection("How the Cycle Works", `<p>
                    One cycle is focus, short break, focus, short break, and so
                    on, ending with a long break in place of the last short break.
                    With the starting values it is 25 + 5 + 25 + 5 + 25 + 5 + 25 +
                    15 minutes, and then it begins again for as long as you keep
                    going. The count shows the focus periods you completed in
                    full during this visit.
                </p>
                <p>
                    By default the timer stops at the end of each phase and waits
                    for you, so a break never starts while you are away. Tick the
                    automatic option if you want each phase to follow the last at
                    once.
                </p>`)}
${infoSection("Keeping Correct Time", `<p>
                    The timer does not count updates. It notes when the session
                    began, using the browser's steady clock, and works out the
                    phase and the time left from that. Browsers slow down
                    background tabs, but the time you see when you come back is
                    correct. If the page is closed or reloaded, or the computer
                    sleeps, the session cannot continue; nothing is saved, and
                    nothing is sent anywhere.
                </p>
                <p>
                    The beep is optional and off to begin with. Some browsers only
                    allow sound after you press a button; if you hear nothing, the
                    visual and the screen-reader announcement still tell you the
                    phase changed.
                </p>`)}
${infoSection("Your Settings in the Address", `<p>
                    When the settings are valid they are added to the page address,
                    so bookmarking the page keeps them. Only the settings are in the
                    address, never the time left.
                </p>`)}
${infoSection("Related Timers", `<p>
                    For one countdown of any length, use the
                    <a href="${COUNTDOWN.href}">${escapeHTML(COUNTDOWN.title)}</a>. For repeated
                    work and rest rounds or a routine of named stages, use the
                    <a href="${INTERVAL.href}">${escapeHTML(INTERVAL.title)}</a>. To measure how long
                    something takes, use the
                    <a href="${STOPWATCH.href}">${escapeHTML(STOPWATCH.title)}</a>.
                    This timer makes no claim about productivity or health.
                </p>`)}
${faqSection(TITLE + " FAQ", [
        ["What is the Pomodoro technique?", "A way of working in timed blocks with short breaks. The common pattern is 25 minutes of focus and 5 minutes of rest, with a longer break after four blocks. You can change every length here."],
        ["Does a skipped focus period count?", "No. Only focus periods that run their full length are counted."],
        ["Will it keep time in another tab?", "Yes, as long as the page stays open. The display may not update while you are elsewhere, but it is correct when you return."],
        ["Why does it wait at the end of a phase?", "So a break does not run out while you are away. Tick “Start the next phase automatically” if you prefer."],
        ["Is anything sent or saved?", "No. The timer runs in your browser. Only your settings can be kept in the page address, and only if you bookmark the page."]
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
   INIT
========================================================= */

const QUERY_KEYS = { focus: "f", short: "s", long: "l", every: "n" };

export function init() {

    const panel = document.querySelector("#pm-panel");

    if (!panel) {
        return;
    }

    const speaker = createAnnouncer(document.querySelector("#pm-live"));

    const announce = (text, delay = 0) => speaker.announce(text, delay);

    const inputs = Object.fromEntries(FIELDS.map(([name, , , id]) => [name, document.getElementById(id)]));

    const auto = document.getElementById("pm-auto");
    const sound = document.getElementById("pm-sound");
    const errorBox = document.getElementById(ERROR_ID);

    const stage = document.getElementById("pm-stage");
    const phaseEl = document.getElementById("pm-phase");
    const statusEl = document.getElementById("pm-status");
    const nextEl = document.getElementById("pm-next");
    const countEl = document.getElementById("pm-count");
    const display = document.getElementById("pm-display");

    const read = () => pomodoroSequence(Object.fromEntries(FIELDS.map(([name]) => [name, inputs[name].value])));

    /* ---------- the settings in the address ---------- */

    function fromAddress() {

        const params = new URLSearchParams(location.search);

        for (const [name, key] of Object.entries(QUERY_KEYS)) {
            if (params.has(key)) {
                inputs[name].value = params.get(key);
            }
        }

        auto.checked = params.get("auto") === "1";

    }

    function toAddress() {

        const result = read();

        if (!result.ok || typeof history?.replaceState !== "function") {
            return;
        }

        const params = new URLSearchParams();

        for (const [name, key] of Object.entries(QUERY_KEYS)) {
            params.set(key, String(result.values[name]));
        }

        if (auto.checked) {
            params.set("auto", "1");
        }

        try {
            history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
        } catch {
            /* the address is only a convenience */
        }

    }

    function showErrors(errors) {

        for (const input of Object.values(inputs)) {
            input.removeAttribute("aria-invalid");
            input.removeAttribute("aria-describedby");
        }

        if (!errors) {
            errorBox.hidden = true;
            errorBox.textContent = "";
            return;
        }

        for (const error of errors) {
            const input = inputs[error.field];
            input.setAttribute("aria-invalid", "true");
            input.setAttribute("aria-describedby", ERROR_ID);
        }

        errorBox.textContent = errors.map(error => error.message).join(" ");
        errorBox.hidden = false;

    }

    /* ---------- the screen for a phase ---------- */

    let focusCount = POMODORO_DEFAULTS.every;

    function phaseName(phase) {

        return phase.kind === "focus" ? `Focus ${phase.round} of ${focusCount}` : phase.label;

    }

    const controller = createCycleController({
        panel,
        buttons: {
            start: document.getElementById("pm-start"),
            pause: document.getElementById("pm-pause"),
            resume: document.getElementById("pm-resume"),
            skip: document.getElementById("pm-skip"),
            next: document.getElementById("pm-next-phase"),
            again: document.getElementById("pm-again"),
            reset: document.getElementById("pm-reset")
        },
        display,
        status: statusEl,
        lock: [document.getElementById("pm-settings")],
        title: TITLE,
        sound: () => sound.checked,
        announce,

        build() {

            const result = read();

            if (!result.ok) {

                showErrors(result.errors);

                announce(result.errors.map(e => e.message).join(" "), 0);

                inputs[result.errors[0].field].focus();

                return { ok: false };

            }

            showErrors(null);

            focusCount = result.values.every;

            toAddress();

            stage.hidden = false;

            return { ok: true, sequence: result.sequence, auto: auto.checked };

        },

        label: (s) => (s.at.phase.kind === "focus" ? "Focus" : s.at.phase.label),

        startText: (s) => `Started. ${phaseName(s.at.phase)}, ${phaseLengthText(s.at.phase)}.`,

        phaseText: (s) => `${phaseName(s.at.phase)}, ${phaseLengthText(s.at.phase)}.`,

        waitingText: (s) => `Phase complete. Next: ${phaseName(s.at.phase)}, ${phaseLengthText(s.at.phase)}. Press Start next phase when you are ready.`,

        paintIdle() {

            stage.hidden = true;

            display.textContent = formatRemaining(Number(inputs.focus.value) * 60000 || 0);

        },

        paint(s) {

            const phase = s.at.phase;

            const waiting = s.status === "waiting";

            phaseEl.textContent = `${waiting ? "Ready: " : ""}${phaseName(phase)}`;

            phaseEl.dataset.kind = phase.kind;

            statusEl.textContent =
                s.status === "running" ? "Running"
                    : s.status === "paused" ? "Paused"
                        : waiting ? "Phase complete. Start the next phase when you are ready."
                            : "";

            nextEl.textContent = s.next ? `Next: ${phaseName(s.next)}, ${phaseLengthText(s.next)}` : "";

            countEl.textContent = `Focus periods completed: ${s.completedFocus}`;

        }
    });

    fromAddress();

    for (const input of [...Object.values(inputs), auto]) {

        input.addEventListener("input", () => {

            if (controller.status === "idle") {

                const result = read();

                showErrors(result.ok ? null : result.errors);

                display.textContent = formatRemaining((Number(inputs.focus.value) || 0) * 60000);

                toAddress();

            }

        });

    }

    document.getElementById("pm-form").addEventListener("submit", event => {
        event.preventDefault();
    });

    display.textContent = formatRemaining((Number(inputs.focus.value) || 0) * 60000);

    panel.dataset.ready = "true";

}
