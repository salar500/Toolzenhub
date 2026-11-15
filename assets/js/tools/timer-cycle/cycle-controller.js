/* =========================================================
   ToolZen Hub
   Timer cycles: the controller the Pomodoro Focus Timer and the
   Interval Timer share (needs the browser)

   It owns what is the same in both: the running clock, the
   five states and which buttons show in each, the repeating
   check that brings the timer up to date (also when the tab
   becomes visible again), the tab title, the announcements and
   the optional sound. What differs stays in each tool: the
   settings, the wording and what the screen shows about the
   current phase. A tool gives the controller a `build` function
   (settings to sequence) and a `paint` function (snapshot to
   screen).

   The rules are in cycle-engine.js, pure and tested with a fake
   clock. Time comes from performance.now(), a steady clock that
   a change of the computer's date or time cannot move.

   STATES (data-state on the tool's panel)
       idle      the settings and Start
       running   Pause and Skip
       paused    Resume, Skip and Reset
       waiting   a phase ended and the next waits: Start next, Reset
       done      the session ended: Start again, Reset
========================================================= */

import {
    createRunner,
    elapsedAt,
    start,
    pause,
    resume,
    tick,
    skip,
    phaseAt,
    phaseAfter,
    completedFocus,
    sessionRemainingMs,
    formatRemaining,
    phaseLengthText
} from "./cycle-engine.js";

const TICK_MS = 250;

const VISIBLE = Object.freeze({
    idle: ["start"],
    running: ["pause", "skip"],
    paused: ["resume", "skip", "reset"],
    waiting: ["next", "reset"],
    done: ["again", "reset"]
});

/*
 * options:
 *   panel          the element that gets data-state
 *   buttons        { start, pause, resume, skip, next, again, reset } (elements; any may be absent)
 *   display        the element showing the time left (role="timer")
 *   status         a text element for the one-line state
 *   lock           elements disabled except while idle (the settings)
 *   title          the page title used when idle
 *   build()        => { ok: true, sequence, auto } | { ok: false } (it shows its own errors)
 *   paint(s)       the tool's own display, called with a snapshot
 *   announce(text) polite announcement
 *   sound()        => boolean, whether to play the sound
 *   label(s)       the short phase name for the tab title
 */
export function createCycleController(options) {

    const { panel, buttons, display, status, build, paint, announce } = options;

    const now = () => performance.now();

    let runner = createRunner();
    let sequence = null;
    let auto = false;
    let interval = null;
    let lastAbsolute = -1;
    let audio = null;

    const shown = { display: "", status: "", title: "" };

    const pageTitle = document.title;


    /* ---------- the sound: a short beep from the browser's own audio, only if chosen ---------- */

    function prepareSound() {

        if (!options.sound?.() || audio) {
            return;
        }

        try {

            const Context = window.AudioContext || window.webkitAudioContext;

            if (Context) {
                audio = new Context();
            }

        } catch {
            audio = null;
        }

    }

    /*
     * Two sounds, so the end of the session cannot be mistaken for a phase change (owner finding 2026-11-15: both were
     * the same 0.45 s beep). A phase change is one short tone; the finish is three rising tones played twice, about
     * 1.8 s, once (not a looping alarm). Both stay off unless the visitor ticks the sound box, and Reset or Start again
     * silences a finish that is still playing.
     */
    const PHASE_CUE = [{ at: 0, hz: 880, length: 0.45 }];
    const FINISH = [0, 0.9].flatMap((group) => [660, 880, 1100].map((hz, i) => ({ at: group + i * 0.25, hz, length: 0.3 })));

    let playing = [];

    function play(tones) {

        if (!audio || !options.sound?.()) {
            return;
        }

        try {

            if (audio.state === "suspended") {
                audio.resume();
            }

            const start = audio.currentTime;

            for (const tone of tones) {

                const oscillator = audio.createOscillator();
                const gain = audio.createGain();
                const t = start + tone.at;

                oscillator.frequency.value = tone.hz;

                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + tone.length - 0.05);

                oscillator.connect(gain);
                gain.connect(audio.destination);

                oscillator.start(t);
                oscillator.stop(t + tone.length);

                playing.push(oscillator);
                oscillator.addEventListener("ended", () => {
                    playing = playing.filter((item) => item !== oscillator);
                });

            }

        } catch {
            /* sound is never required */
        }

    }

    function silence() {

        for (const oscillator of playing) {
            try {
                oscillator.stop();
            } catch {
                /* already stopped */
            }
        }

        playing = [];

    }


    /* ---------- the snapshot every paint reads ---------- */

    function snapshot(at = now()) {

        const elapsed = elapsedAt(runner, at);

        const place = phaseAt(sequence, elapsed);

        return {
            status: runner.status,
            elapsed,
            at: place,
            sequence,
            next: place.done ? null : phaseAfter(sequence, place.absolute),
            remainingMs: place.remainingMs,
            sessionMs: sessionRemainingMs(runner, sequence, at),
            completedFocus: completedFocus(runner, sequence, at),
            auto
        };

    }

    function setText(key, element, text) {

        if (element && shown[key] !== text) {
            shown[key] = text;
            element.textContent = text;
        }

    }

    function paintAll() {

        const s = snapshot();

        const label = s.at.done ? "Complete" : s.at.phase.label;

        setText(
            "display",
            display,
            runner.status === "idle" ? display.dataset.idle ?? "" : formatRemaining(s.remainingMs)
        );

        if (runner.status !== "idle") {

            const title = runner.status === "done"
                ? `Complete — ${options.title}`
                : `${formatRemaining(s.remainingMs)} ${options.label?.(s) ?? label} — ${options.title}`;

            if (shown.title !== title) {
                shown.title = title;
                document.title = title;
            }

        } else if (shown.title !== pageTitle) {

            shown.title = pageTitle;
            document.title = pageTitle;

        }

        paint(s);

        return s;

    }

    function paintState() {

        panel.dataset.state = runner.status;

        for (const [name, button] of Object.entries(buttons)) {
            if (button) {
                button.hidden = !VISIBLE[runner.status].includes(name);
            }
        }

        for (const element of options.lock ?? []) {
            element.disabled = runner.status !== "idle";
        }

        shown.status = "";

        paintAll();

    }


    /* ---------- bringing the timer up to date ---------- */

    function sync() {

        if (runner.status !== "running") {
            return;
        }

        const before = runner.status;

        const beforeAbsolute = lastAbsolute;

        runner = tick(runner, sequence, now(), auto);

        const s = snapshot();

        if (runner.status !== before) {

            paintState();

            play(runner.status === "done" ? FINISH : PHASE_CUE);

            if (runner.status === "done") {

                stopLoop();

                announce(options.doneText?.(s) ?? "Session complete.", 0);

                buttons.again?.focus();

            } else if (runner.status === "waiting") {

                stopLoop();

                announce(options.waitingText?.(s) ?? "Phase complete. Start the next phase when you are ready.", 0);

                buttons.next?.focus();

            }

            lastAbsolute = s.at.absolute;

            return;

        }

        if (!s.at.done && s.at.absolute !== beforeAbsolute) {

            lastAbsolute = s.at.absolute;

            play(PHASE_CUE);

            announce(options.phaseText?.(s) ?? `${s.at.phase.label}, ${phaseLengthText(s.at.phase)}.`, 0);

        }

        paintAll();

    }

    function startLoop() {

        if (interval === null) {
            interval = setInterval(sync, TICK_MS);
        }

    }

    function stopLoop() {

        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }

    }


    /* ---------- actions ---------- */

    function begin() {

        const built = build();

        if (!built.ok) {
            return false;
        }

        sequence = built.sequence;
        auto = Boolean(built.auto);

        prepareSound();

        runner = start(createRunner(), now());

        lastAbsolute = 0;

        paintState();

        startLoop();

        announce(options.startText?.(snapshot()) ?? "Started.", 0);

        buttons.pause?.focus();

        return true;

    }

    function doPause() {

        runner = pause(runner, now());

        stopLoop();

        paintState();

        announce("Paused.", 0);

        buttons.resume?.focus();

    }

    function doResume() {

        runner = resume(runner, now());

        paintState();

        startLoop();

        announce("Resumed.", 0);

        buttons.pause?.focus();

    }

    function doNext() {

        const wasWaiting = runner.status === "waiting";

        runner = resume(runner, now());

        lastAbsolute = snapshot().at.absolute;

        paintState();

        startLoop();

        if (wasWaiting) {
            announce(options.phaseText?.(snapshot()) ?? "Started.", 0);
        }

        buttons.pause?.focus();

    }

    function doSkip() {

        const before = snapshot().at;

        runner = skip(runner, sequence, now());

        const s = snapshot();

        if (runner.status === "done") {

            stopLoop();

            paintState();

            announce(options.doneText?.(s) ?? "Session complete.", 0);

            buttons.again?.focus();

            return;

        }

        lastAbsolute = s.at.absolute;

        paintState();

        announce(`Skipped ${before.phase.label}. ${options.phaseText?.(s) ?? s.at.phase.label}`, 0);

    }

    function doReset() {

        stopLoop();

        silence();

        runner = createRunner();

        lastAbsolute = -1;

        sequence = null;

        paintIdle();

        announce("Reset.", 0);

        buttons.start?.focus();

    }

    /* idle has no sequence yet: the tool paints its own settings summary */
    function paintIdle() {

        panel.dataset.state = "idle";

        for (const [name, button] of Object.entries(buttons)) {
            if (button) {
                button.hidden = !VISIBLE.idle.includes(name);
            }
        }

        for (const element of options.lock ?? []) {
            element.disabled = false;
        }

        shown.display = "";

        shown.title = "";

        document.title = pageTitle;

        options.paintIdle?.();

    }


    /* ---------- wiring ---------- */

    buttons.start?.addEventListener("click", begin);
    buttons.again?.addEventListener("click", () => {
        stopLoop();
        silence();
        runner = createRunner();
        begin();
    });
    buttons.pause?.addEventListener("click", doPause);
    buttons.resume?.addEventListener("click", doResume);
    buttons.next?.addEventListener("click", doNext);
    buttons.skip?.addEventListener("click", doSkip);
    buttons.reset?.addEventListener("click", doReset);

    /* the tab became visible: read the clock at once */
    document.addEventListener(
        "visibilitychange",
        () => {

            if (!document.hidden) {
                sync();
            }

        }
    );

    window.addEventListener("pageshow", () => sync());

    paintIdle();

    return {
        get status() {
            return runner.status;
        },
        snapshot: () => (sequence ? snapshot() : null),
        reset: doReset
    };

}
