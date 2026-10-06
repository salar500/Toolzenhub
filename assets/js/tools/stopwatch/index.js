/* =========================================================
   ToolZen Hub
   Stopwatch (Time Tools)

   Start at zero, measure how long something takes, and record
   laps. For workouts and drills, study and focus work, cooking,
   experiments, testing, presentations and practice.

   The timing and lap rules are in stopwatch-engine.js (pure, and
   tested with a fake clock). Time comes from performance.now(), a
   monotonic clock that a change of the computer's date or time
   cannot move. This file owns the screen for each state, the
   painting, the keyboard shortcuts and the announcements.

   PAINTING is separate from TIMING. While the stopwatch runs and
   the page is visible, requestAnimationFrame asks for a repaint,
   and the elapsed time is read from the clock each time; the
   page only changes the text when the tenth of a second changes
   (about ten small updates a second, not sixty). A paused
   stopwatch, or a hidden page, paints nothing. When the page is
   visible again the clock is read at once.

   Everything runs in the browser. Nothing is sent anywhere and
   nothing is stored: a reload starts a fresh stopwatch.

   STATES (data-state on #sw-panel)
       idle      00:00.0 and Start
       running   the time, Lap and Pause
       paused    the time and the laps, Resume and Reset
========================================================= */

import {
    MAX_LAPS,
    createStopwatch,
    elapsedAt,
    start,
    pause,
    resume,
    tick,
    lap,
    canLap,
    lapLimitReached,
    currentLapTenths,
    lapExtremes,
    tenthsOf,
    formatTenths,
    formatElapsed,
    formatWhole
} from "./stopwatch-engine.js";

import {
    getToolById
} from "../../data/tools.js";

import {
    escapeHTML
} from "../../ui/escape.js";


/* Its relation to the Countdown Timer is a sentence on the page; no calculator or article is related. */
export const showRelatedCalculators = false;
export const showRelatedArticles = false;


const TITLE =
    getToolById("stopwatch").title;

const COUNTDOWN =
    getToolById("countdown-timer");


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

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
                        Measure elapsed time from zero, and record laps as you
                        go. Pause and resume whenever you need to.
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


            <!-- THE STOPWATCH -->

            <section class="calculator-section">

                <div
                    id="sw-panel"
                    class="sw-panel"
                    data-state="idle"
                >

                    <div class="sw-stage">

                        <div
                            id="sw-display"
                            class="sw-display"
                            role="timer"
                            aria-live="off"
                            aria-label="Elapsed time"
                        >00:00.0</div>

                        <p
                            id="sw-status"
                            class="sw-status"
                        >Ready</p>

                        <p
                            id="sw-current"
                            class="sw-current"
                            hidden
                        ></p>

                    </div>

                    <div class="sw-actions">

                        <button
                            type="button"
                            id="sw-start"
                            class="calculator-form__button sw-button"
                        >
                            Start
                        </button>

                        <button
                            type="button"
                            id="sw-lap"
                            class="calculator-form__button sw-button"
                            hidden
                        >
                            Lap
                        </button>

                        <button
                            type="button"
                            id="sw-pause"
                            class="calculator-form__button calculator-form__button--secondary sw-button"
                            hidden
                        >
                            Pause
                        </button>

                        <button
                            type="button"
                            id="sw-resume"
                            class="calculator-form__button sw-button"
                            hidden
                        >
                            Resume
                        </button>

                        <button
                            type="button"
                            id="sw-reset"
                            class="calculator-form__button calculator-form__button--secondary sw-button"
                            hidden
                        >
                            Reset
                        </button>

                    </div>

                    <p class="sw-keys">
                        Keyboard: <kbd>Space</kbd> start, pause or resume,
                        <kbd>L</kbd> lap, <kbd>R</kbd> reset when paused.
                    </p>

                    <div
                        id="sw-laps"
                        class="sw-laps"
                        hidden
                    >

                        <table class="sw-table">

                            <caption>
                                Laps, newest first
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">Lap</th>
                                    <th scope="col">Lap time</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>

                            <tbody id="sw-lap-rows"></tbody>

                        </table>

                        <p
                            id="sw-lap-note"
                            class="sw-lap-note"
                            hidden
                        ></p>

                    </div>

                </div>

            </section>

            <p
                id="sw-live"
                class="sw-sr-only"
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
                        Press Start. The time counts up from zero in minutes,
                        seconds and tenths of a second, and the tab title shows
                        the whole seconds.
                    </li>
                    <li>
                        Press Lap each time you want to mark a point, such as the
                        end of a lap, a round or a step.
                    </li>
                    <li>
                        Pause to stop the clock and Resume to carry on from the
                        same time. Reset, which appears once the stopwatch is
                        paused, clears the time and the laps.
                    </li>
                </ol>

            </section>


            <!-- LAPS -->

            <section class="calculator-info">

                <h2>
                    Lap Time and Total Time
                </h2>

                <p>
                    Each row has two times. The <strong>lap time</strong> is how
                    long that lap took: the time since the previous lap, or since
                    the start for the first one. The <strong>total</strong>, also
                    called the split, is the elapsed time at the moment you
                    pressed Lap. The lap times always add up to the last total.
                </p>

                <p>
                    Once there are at least two laps with different times, the
                    fastest and the slowest are marked. The list keeps up to
                    ${MAX_LAPS} laps.
                </p>

            </section>


            <!-- ACCURACY -->

            <section class="calculator-info">

                <h2>
                    How the Stopwatch Stays Accurate
                </h2>

                <p>
                    The stopwatch does not count updates. It notes when each
                    running stretch began, using the browser's steady clock, and
                    adds up the stretches. Changing the computer's date or time
                    does not affect it, and neither does how often the screen
                    refreshes. Time is shown in tenths of a second, rounded
                    down. It stops by itself at 99 hours, 59 minutes and 59.9
                    seconds.
                </p>

            </section>


            <!-- OTHER TABS -->

            <section class="calculator-info">

                <h2>
                    Using the Stopwatch in Another Browser Tab
                </h2>

                <p>
                    Browsers pause screen updates in background tabs. The
                    stopwatch keeps measuring anyway, and shows the correct time
                    the moment you come back. The page has to stay open: closing
                    or reloading it ends the measurement, because nothing is
                    saved.
                </p>

            </section>


            <!-- COMMON USES -->

            <section class="calculator-info">

                <h2>
                    Common Uses
                </h2>

                <ul>
                    <li>Workouts, running laps and timed drills.</li>
                    <li>How long a task, a test or a step in a process takes.</li>
                    <li>Study and focus sessions you want to measure rather than limit.</li>
                    <li>Cooking steps, experiments and presentation practice.</li>
                </ul>

                <p>
                    A stopwatch counts up from zero and has no end. To count down
                    from a time you already know, use the
                    <a href="${COUNTDOWN.href}">${escapeHTML(COUNTDOWN.title)}</a>.
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
                        Yes, as long as the page stays open. The display may not
                        update while you are elsewhere, but the time you see when
                        you return is correct.
                    </p>
                </details>

                <details>
                    <summary>
                        What is the difference between lap time and total?
                    </summary>
                    <p>
                        Lap time is the length of one lap. Total is the elapsed
                        time since you started, at the moment of that lap.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is there no Reset button while it is running?
                    </summary>
                    <p>
                        So a stray tap cannot wipe a measurement and its laps.
                        Pause first, and Reset appears.
                    </p>
                </details>

                <details>
                    <summary>
                        What if my computer goes to sleep?
                    </summary>
                    <p>
                        Browsers may not count the time a computer spends asleep,
                        so keep the machine awake for a long measurement.
                    </p>
                </details>

                <details>
                    <summary>
                        Is anything sent or saved?
                    </summary>
                    <p>
                        No. The stopwatch runs in your browser. Nothing is sent
                        anywhere or stored, so a reload starts again from zero.
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

    const panel = document.querySelector("#sw-panel");

    if (!panel) {
        return;
    }

    const display = document.querySelector("#sw-display");
    const status = document.querySelector("#sw-status");
    const current = document.querySelector("#sw-current");
    const lapsBox = document.querySelector("#sw-laps");
    const lapRows = document.querySelector("#sw-lap-rows");
    const lapNote = document.querySelector("#sw-lap-note");
    const live = document.querySelector("#sw-live");

    const buttons = {
        start: document.querySelector("#sw-start"),
        lap: document.querySelector("#sw-lap"),
        pause: document.querySelector("#sw-pause"),
        resume: document.querySelector("#sw-resume"),
        reset: document.querySelector("#sw-reset")
    };

    const pageTitle = document.title;

    let sw = createStopwatch();
    let frame = null;
    let announceTimer = null;

    /* what is on the screen now, so unchanged text is never rewritten */
    const shown = { display: "", current: "", title: "" };

    const now = () => performance.now();


    /* ---------- announcements: only meaningful changes, never the running time ---------- */

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


    /* ---------- painting ---------- */

    const visibleButtons = {
        idle: ["start"],
        running: ["lap", "pause"],
        paused: ["resume", "reset"]
    };

    function setText(key, element, text) {

        if (shown[key] !== text) {

            shown[key] = text;

            element.textContent = text;

        }

    }

    function paintTitle(elapsed) {

        const title =
            sw.status === "running"
                ? `${formatWhole(elapsed)} — ${TITLE}`
                : sw.status === "paused"
                    ? `Paused ${formatWhole(elapsed)} — ${TITLE}`
                    : pageTitle;

        if (shown.title !== title) {
            shown.title = title;
            document.title = title;
        }

    }

    /* the time, the lap in progress and the tab title: cheap, and safe to call as often as wanted */
    function paintTime() {

        const at = now();

        const elapsed = elapsedAt(sw, at);

        setText("display", display, formatElapsed(elapsed));

        /* from one hour the text is longer: a smaller size keeps it on one line on a narrow screen */
        display.dataset.long = String(elapsed >= 3_600_000);

        if (sw.laps.length > 0 && sw.status !== "idle") {

            current.hidden = false;

            setText(
                "current",
                current,
                `Lap ${sw.laps.length + 1}: ${formatTenths(currentLapTenths(sw, at))}`
            );

        } else {

            current.hidden = true;

        }

        paintTitle(elapsed);

    }

    function paintLaps() {

        lapsBox.hidden = sw.laps.length === 0;

        const marks = lapExtremes(sw.laps);

        lapRows.innerHTML =
            [...sw.laps]
                .reverse()
                .map(item => {

                    const mark =
                        marks.fastest.includes(item.number)
                            ? `<span class="sw-mark sw-mark--fast">Fastest</span>`
                            : marks.slowest.includes(item.number)
                                ? `<span class="sw-mark sw-mark--slow">Slowest</span>`
                                : "";

                    return `
                            <tr>
                                <th scope="row">${item.number}${mark ? ` ${mark}` : ""}</th>
                                <td>${formatTenths(item.lapTenths)}</td>
                                <td>${formatTenths(item.totalTenths)}</td>
                            </tr>`;

                })
                .join("");

        buttons.lap.setAttribute("aria-disabled", String(!canLap(sw)));

        lapNote.hidden = !lapLimitReached(sw);

        lapNote.textContent =
            lapLimitReached(sw)
                ? `The lap limit of ${MAX_LAPS} is reached. The stopwatch keeps measuring; reset to record more laps.`
                : "";

    }

    function paintState() {

        panel.dataset.state = sw.status;

        for (const [name, button] of Object.entries(buttons)) {
            button.hidden = !visibleButtons[sw.status].includes(name);
        }

        status.textContent =
            sw.status === "running"
                ? "Running"
                : sw.status === "paused"
                    ? (sw.reachedMax ? "Stopped at the 100 hour limit" : "Paused")
                    : "Ready";

        paintLaps();

        paintTime();

    }


    /* ---------- the paint loop: only while running and visible ---------- */

    function loop() {

        frame = null;

        if (sw.status !== "running" || document.hidden) {
            return;
        }

        const before = sw.status;

        sw = tick(sw, now());

        if (before === "running" && sw.status !== "running") {

            paintState();

            announce("Stopwatch stopped: it reached the 100 hour limit.");

            buttons.reset.focus();

            return;

        }

        paintTime();

        frame = requestAnimationFrame(loop);

    }

    function startLoop() {

        if (frame === null && sw.status === "running" && !document.hidden) {
            frame = requestAnimationFrame(loop);
        }

    }

    function stopLoop() {

        if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }

    }


    /* ---------- actions ---------- */

    function doStart() {

        sw = start(sw, now());

        paintState();

        startLoop();

        announce("Stopwatch started.");

        /* focus follows the button that toggles, so Space does the same whether or not a button has focus */
        buttons.pause.focus();

    }

    function doPause() {

        sw = pause(sw, now());

        stopLoop();

        paintState();

        announce(`Stopwatch paused at ${formatElapsed(sw.accumulatedMs)}.`);

        buttons.resume.focus();

    }

    function doResume() {

        sw = resume(sw, now());

        paintState();

        startLoop();

        announce("Stopwatch resumed.");

        buttons.pause.focus();

    }

    function doLap() {

        if (sw.status !== "running") {
            return;
        }

        if (lapLimitReached(sw)) {

            announce(`The lap limit of ${MAX_LAPS} is reached.`);

            return;

        }

        sw = lap(sw, now());

        const item = sw.laps[sw.laps.length - 1];

        paintLaps();

        paintTime();

        announce(
            `Lap ${item.number}: ${formatTenths(item.lapTenths)}. Total ${formatTenths(item.totalTenths)}.`
        );

    }

    function doReset() {

        if (sw.status !== "paused") {
            return;
        }

        stopLoop();

        sw = createStopwatch();

        shown.display = "";
        shown.current = "";

        paintState();

        announce("Stopwatch reset.");

        buttons.start.focus();

    }

    function doToggle() {

        if (sw.status === "idle") {
            doStart();
        } else if (sw.status === "running") {
            doPause();
        } else if (!sw.reachedMax) {
            doResume();
        }

    }


    /* ---------- wiring ---------- */

    buttons.start.addEventListener("click", doStart);
    buttons.lap.addEventListener("click", doLap);
    buttons.pause.addEventListener("click", doPause);
    buttons.resume.addEventListener("click", doResume);
    buttons.reset.addEventListener("click", doReset);

    /* the page was hidden: no frames came, so read the clock at once and start painting again */
    document.addEventListener(
        "visibilitychange",
        () => {

            if (!document.hidden && sw.status === "running") {

                sw = tick(sw, now());

                paintState();

                startLoop();

            }

        }
    );

    window.addEventListener(
        "pageshow",
        () => {

            if (sw.status === "running") {
                paintTime();
                startLoop();
            }

        }
    );

    /*
     * Keyboard shortcuts, an enhancement only (every one has a button).
     * They never fire while typing or with a modifier key, and Space is
     * left to a focused button or link, which already uses it.
     */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.defaultPrevented ||
                event.ctrlKey || event.metaKey || event.altKey ||
                event.repeat
            ) {
                return;
            }

            const target = event.target;

            const tag = target?.tagName;

            if (
                tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" ||
                target?.isContentEditable
            ) {
                return;
            }

            if (event.code === "Space") {

                if (tag === "BUTTON" || tag === "A" || tag === "SUMMARY") {
                    return;
                }

                event.preventDefault();

                doToggle();

            } else if (event.key === "l" || event.key === "L") {

                doLap();

            } else if (event.key === "r" || event.key === "R") {

                doReset();

            }

        }
    );

    paintState();

    /* the page's script has run and the buttons work (tests wait for this) */
    panel.dataset.ready = "true";

}
