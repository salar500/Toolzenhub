/* =========================================================
   ToolZen Hub
   Countdown Timer (Time Tools)

   Set a time, start, and watch it count down to zero: a study
   or focus block, a meeting, cooking, a workout, a break.

   The rules (end-time based, so a hidden tab or a slept laptop
   still shows the right time) are in timer-engine.js, which is
   pure and tested with a fake clock. This file reads the fields,
   owns the screen for each state, and keeps the tab title, the
   screen-reader announcements and the optional sound.

   Everything runs in the browser. Nothing is sent anywhere and
   nothing is stored: a reload starts a fresh timer.

   STATES (data-state on #ct-panel)
       idle       the setup (time, presets) and Start
       running    the time left, Pause and Reset
       paused     the time left, Resume and Reset
       finished   00:00 and "Timer complete", Restart and Reset
========================================================= */

import {
    PRESETS,
    parseDuration,
    splitSeconds,
    createTimer,
    start,
    tick,
    pause,
    resume,
    remainingAt,
    formatClock,
    durationWords
} from "./timer-engine.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    fieldShell,
    setFieldsInvalid,
    clearFieldsInvalid
} from "../../ui/field.js";

import {
    escapeHTML
} from "../../ui/escape.js";


/* There is no related calculator and no article about timers. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("countdown-timer").title;

const IDS = {
    hours: "ct-hours",
    minutes: "ct-minutes",
    seconds: "ct-seconds"
};

const FIELD_LABELS = {
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds"
};

const ERROR_ID = "ct-error";

const TICK_MS = 250;

const STOPWATCH =
    getToolById("stopwatch");


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function timeField(name) {

    const id = IDS[name];

    return fieldShell({
        id,
        label: FIELD_LABELS[name],
        control: `<input
                                    id="${id}"
                                    class="calculator-form__input ct-input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    placeholder="0"
                                    maxlength="5"
                                >`
    });

}

function presetButtons() {

    return PRESETS.map(
        preset => `
                            <button
                                type="button"
                                class="ct-preset"
                                data-seconds="${preset.seconds}"
                                aria-pressed="false"
                            >${escapeHTML(preset.label)}</button>`
    ).join("");

}

export function markup() {

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
                        Set a time, start, and count down to zero. Pause and
                        resume whenever you need to.
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
                            Runs in your browser • Nothing is stored
                        </span>

                    </div>

                </div>

            </section>


            <!-- THE TIMER -->

            <section class="calculator-section">

                <div
                    id="ct-panel"
                    class="ct-panel"
                    data-state="idle"
                >

                    <form
                        id="ct-form"
                        class="calculator-form ct-form"
                        novalidate
                    >

                        <div id="ct-setup" class="ct-setup">

                            <fieldset class="ct-time">

                                <legend class="calculator-section__title">
                                    Set the Time
                                </legend>

                                <div class="calculator-form__grid ct-fields">

                                    ${timeField("hours")}

                                    ${timeField("minutes")}

                                    ${timeField("seconds")}

                                </div>

                            </fieldset>

                            <p
                                id="ct-error"
                                class="ct-error"
                                role="alert"
                                hidden
                            ></p>

                            <div
                                class="ct-presets"
                                role="group"
                                aria-label="Quick presets"
                            >
                                ${presetButtons()}
                            </div>

                        </div>

                        <div
                            id="ct-stage"
                            class="ct-stage"
                            hidden
                        >

                            <div
                                id="ct-display"
                                class="ct-display"
                                role="timer"
                                aria-live="off"
                                aria-label="Time remaining"
                            >00:00</div>

                            <p
                                id="ct-status"
                                class="ct-status"
                            ></p>

                        </div>

                        <div class="ct-actions">

                            <button
                                type="submit"
                                id="ct-start"
                                class="calculator-form__button ct-button"
                            >
                                Start
                            </button>

                            <button
                                type="button"
                                id="ct-pause"
                                class="calculator-form__button ct-button"
                                hidden
                            >
                                Pause
                            </button>

                            <button
                                type="button"
                                id="ct-resume"
                                class="calculator-form__button ct-button"
                                hidden
                            >
                                Resume
                            </button>

                            <button
                                type="button"
                                id="ct-restart"
                                class="calculator-form__button ct-button"
                                hidden
                            >
                                Restart
                            </button>

                            <button
                                type="button"
                                id="ct-reset"
                                class="calculator-form__button calculator-form__button--secondary ct-button"
                                hidden
                            >
                                Reset
                            </button>

                        </div>

                        <label class="ct-sound">
                            <input
                                type="checkbox"
                                id="ct-sound"
                                checked
                            >
                            <span>Play a short sound when the timer finishes</span>
                        </label>

                    </form>

                </div>

            </section>

            <p
                id="ct-live"
                class="ct-sr-only"
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
                        Enter hours, minutes and seconds, or choose a preset.
                        Any amount works in any box: 90 seconds is the same as
                        1 minute 30 seconds.
                    </li>
                    <li>
                        Press Start. The time left is shown large, and also in
                        the browser tab's title.
                    </li>
                    <li>
                        Pause and Resume as often as you like. Reset goes back
                        to the setup with the time you last used.
                    </li>
                    <li>
                        At zero the timer says "Timer complete", and plays a
                        short sound unless you have turned it off.
                    </li>
                </ol>

            </section>


            <!-- ACCURACY -->

            <section class="calculator-info">

                <h2>
                    How the Timer Stays Accurate
                </h2>

                <p>
                    The timer does not count seconds one by one. When you start
                    it, it works out the exact moment it should end, and every
                    time it updates it shows the time between now and then.
                    Pausing keeps the time left, and resuming sets a new end
                    from it, so repeated pauses do not add or lose time.
                </p>

            </section>


            <!-- OTHER TABS -->

            <section class="calculator-info">

                <h2>
                    Using the Timer in Another Browser Tab
                </h2>

                <p>
                    Browsers slow down pages in background tabs, so the screen
                    may not update every second while you are elsewhere. Because
                    the time is worked out from the clock, it is correct the
                    moment you come back. While the timer is running, the time
                    left appears in the tab's title, so you can read it without
                    switching tabs.
                </p>

                <p>
                    The page has to stay open. Closing or reloading it ends the
                    timer, because nothing is saved. There are no notifications
                    and no alarm when the page is closed.
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>Study sessions and focus blocks, such as 25 minutes on and a short break.</li>
                    <li>Cooking and baking.</li>
                    <li>Workout intervals and rest periods.</li>
                    <li>Meetings, presentations and speaking practice.</li>
                    <li>A quick break from the screen.</li>
                </ul>

                <p>
                    The longest time is 24 hours. To measure time that counts
                    up from zero, with laps, use the
                    <a href="${STOPWATCH.href}">${escapeHTML(STOPWATCH.title)}</a>.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Does it keep running if I switch tabs?
                    </summary>
                    <p>
                        Yes, as long as the page stays open. The screen may
                        update less often in a background tab, but the time you
                        see when you return is correct.
                    </p>
                </details>

                <details>
                    <summary>
                        Will it still ring if I close the page?
                    </summary>
                    <p>
                        No. The timer lives in the open page and nothing is
                        saved, so closing or reloading the page ends it.
                    </p>
                </details>

                <details>
                    <summary>
                        Can I turn the sound off?
                    </summary>
                    <p>
                        Yes. Untick the sound option under the buttons. The
                        sound is a short beep that plays once when the timer
                        finishes, and only if you started the timer on this
                        page.
                    </p>
                </details>

                <details>
                    <summary>
                        What is the longest time I can set?
                    </summary>
                    <p>
                        24 hours. You can enter the time in any combination of
                        hours, minutes and seconds.
                    </p>
                </details>

                <details>
                    <summary>
                        Is anything sent or saved?
                    </summary>
                    <p>
                        No. The timer runs in your browser and nothing is sent
                        anywhere or stored.
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
   SOUND
   One short beep (three tones), generated in the browser with the
   Web Audio API: no file and no download. The audio context is
   made in the Start click, because a browser only lets a page make
   sound after the visitor has acted on it.
========================================================= */

let audio = null;

function prepareSound() {

    try {

        const Context =
            window.AudioContext || window.webkitAudioContext;

        if (!Context) {
            return;
        }

        audio = audio ?? new Context();

        if (audio.state === "suspended") {
            audio.resume();
        }

    } catch {

        audio = null;

    }

}

function playSound() {

    if (!audio) {
        return;
    }

    try {

        const now = audio.currentTime;

        [0, 0.28, 0.56].forEach(offset => {

            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;

            gain.gain.setValueAtTime(0.0001, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(now + offset);
            oscillator.stop(now + offset + 0.22);

        });

    } catch {
        /* no sound is not an error: the finished state is on the screen */
    }

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const panel = document.querySelector("#ct-panel");

    if (!panel) {
        return;
    }

    const form = document.querySelector("#ct-form");
    const setup = document.querySelector("#ct-setup");
    const stage = document.querySelector("#ct-stage");
    const display = document.querySelector("#ct-display");
    const status = document.querySelector("#ct-status");
    const live = document.querySelector("#ct-live");
    const errorBox = document.querySelector("#ct-error");
    const sound = document.querySelector("#ct-sound");

    const buttons = {
        start: document.querySelector("#ct-start"),
        pause: document.querySelector("#ct-pause"),
        resume: document.querySelector("#ct-resume"),
        restart: document.querySelector("#ct-restart"),
        reset: document.querySelector("#ct-reset")
    };

    const inputs = {};

    for (const [name, id] of Object.entries(IDS)) {
        inputs[name] = document.getElementById(id);
    }

    const allInputs = Object.values(inputs);

    const presets = [...document.querySelectorAll(".ct-preset")];

    const pageTitle = document.title;

    let timer = createTimer();
    let totalSeconds = 0;
    let interval = null;
    let announceTimer = null;

    const now = () => Date.now();


    /* ---------- announcements: only meaningful changes, never each second ---------- */

    function announce(text) {

        clearTimeout(announceTimer);

        live.textContent = "";

        announceTimer = setTimeout(
            () => {
                live.textContent = text;
            },
            50
        );

    }


    /* ---------- the screen for each state ---------- */

    const visibleButtons = {
        idle: ["start"],
        running: ["pause", "reset"],
        paused: ["resume", "reset"],
        finished: ["restart", "reset"]
    };

    function setTitle() {

        if (timer.status === "running") {
            document.title = `${formatClock(remainingAt(timer, now()))} — ${TITLE}`;
        } else if (timer.status === "paused") {
            document.title = `Paused ${formatClock(timer.remainingMs)} — ${TITLE}`;
        } else {
            document.title = pageTitle;
        }

    }

    function paint() {

        const state = timer.status;

        panel.dataset.state = state;

        setup.hidden = state !== "idle";
        stage.hidden = state === "idle";

        for (const [name, button] of Object.entries(buttons)) {
            button.hidden = !visibleButtons[state].includes(name);
        }

        const left = state === "running"
            ? remainingAt(timer, now())
            : timer.remainingMs;

        display.textContent = formatClock(left);

        status.textContent = {
            idle: "",
            running: `Running · ${durationWords(totalSeconds)}`,
            paused: `Paused · ${durationWords(totalSeconds)}`,
            finished: "Timer complete"
        }[state];

        setTitle();

    }

    function showError(message, fields = []) {

        clearFieldsInvalid(allInputs, ERROR_ID);

        errorBox.textContent = message;
        errorBox.hidden = false;

        if (fields.length > 0) {
            setFieldsInvalid(fields, ERROR_ID);
        }

    }

    function clearError() {

        clearFieldsInvalid(allInputs, ERROR_ID);

        errorBox.textContent = "";
        errorBox.hidden = true;

    }


    /* ---------- the clock ---------- */

    function stopTicking() {

        clearInterval(interval);

        interval = null;

    }

    /* bring the timer up to date from the real clock; used by the interval and when the tab is shown again */
    function update() {

        if (timer.status !== "running") {
            return;
        }

        const before = timer.status;

        timer = tick(timer, now());

        if (timer.status === "finished" && before === "running") {
            finish();
            return;
        }

        paint();

    }

    function startTicking() {

        stopTicking();

        interval = setInterval(update, TICK_MS);

    }

    function finish() {

        stopTicking();

        paint();

        announce("Timer complete.");

        if (sound.checked) {
            playSound();
        }

        buttons.restart.focus();

    }


    /* ---------- presets ---------- */

    function showDuration(total) {

        const parts = splitSeconds(total);

        inputs.hours.value = parts.hours > 0 ? String(parts.hours) : "";
        inputs.minutes.value = parts.minutes > 0 ? String(parts.minutes) : "";
        inputs.seconds.value = parts.seconds > 0 ? String(parts.seconds) : "";

    }

    function markPresets() {

        const parsed = parseDuration({
            hours: inputs.hours.value,
            minutes: inputs.minutes.value,
            seconds: inputs.seconds.value
        });

        for (const button of presets) {
            button.setAttribute(
                "aria-pressed",
                String(
                    parsed.status === "ok" &&
                    parsed.totalSeconds === Number(button.dataset.seconds)
                )
            );
        }

    }


    /* ---------- actions ---------- */

    function begin() {

        const parsed = parseDuration({
            hours: inputs.hours.value,
            minutes: inputs.minutes.value,
            seconds: inputs.seconds.value
        });

        if (parsed.status === "invalid") {

            showError(
                parsed.errors.map(error => error.message).join(" "),
                parsed.errors.map(error => inputs[error.field])
            );

            return;

        }

        if (parsed.status !== "ok") {

            showError(parsed.message);

            return;

        }

        clearError();

        totalSeconds = parsed.totalSeconds;

        showDuration(totalSeconds);

        markPresets();

        prepareSound();

        timer = start(timer, totalSeconds, now());

        startTicking();

        paint();

        announce(`Timer started for ${durationWords(totalSeconds)}.`);

        buttons.pause.focus();

    }

    function doPause() {

        timer = pause(timer, now());

        if (timer.status === "finished") {
            finish();
            return;
        }

        stopTicking();

        paint();

        announce(`Timer paused at ${formatClock(timer.remainingMs)}.`);

        buttons.resume.focus();

    }

    function doResume() {

        timer = resume(timer, now());

        startTicking();

        paint();

        announce("Timer resumed.");

        buttons.pause.focus();

    }

    function doRestart() {

        timer = start(createTimer(), totalSeconds, now());

        prepareSound();

        startTicking();

        paint();

        announce(`Timer restarted for ${durationWords(totalSeconds)}.`);

        buttons.pause.focus();

    }

    function doReset() {

        stopTicking();

        timer = createTimer();

        clearError();

        paint();

        announce("Timer reset.");

        inputs.hours.focus();

    }


    /* ---------- wiring ---------- */

    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
            begin();
        }
    );

    form.addEventListener(
        "input",
        () => {

            clearError();

            markPresets();

        }
    );

    buttons.pause.addEventListener("click", doPause);
    buttons.resume.addEventListener("click", doResume);
    buttons.restart.addEventListener("click", doRestart);
    buttons.reset.addEventListener("click", doReset);

    for (const button of presets) {

        button.addEventListener(
            "click",
            () => {

                clearError();

                showDuration(Number(button.dataset.seconds));

                markPresets();

            }
        );

    }

    /* the page was hidden, so the interval may have been slowed or stopped: read the clock again at once */
    document.addEventListener(
        "visibilitychange",
        () => {

            if (!document.hidden) {
                update();
            }

        }
    );

    window.addEventListener("pageshow", update);

    paint();

    /* the page's script has run and the buttons work (tests wait for this) */
    panel.dataset.ready = "true";

}
