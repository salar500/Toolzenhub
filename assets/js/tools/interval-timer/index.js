/* =========================================================
   ToolZen Hub
   Interval and Routine Timer (Time Tools)

   Repeat a routine of timed stages for a number of rounds: work and
   rest for training, or any named stages (read, write, stretch). An
   optional get-ready stage comes first and an optional cool-down last.

   The timing is in the shared timer-cycle engine (pure, tested with
   a fake clock) and cycle-controller.js. This file owns the stage
   editor, the presets, the wording and what the screen shows.

   Nothing is stored or sent anywhere: a reload starts again.
   The presets are only starting values, written out in full.
========================================================= */

import {
    LIMITS,
    INTERVAL_PRESETS,
    intervalSequence,
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


const TITLE = getToolById("interval-timer").title;

const POMODORO = getToolById("pomodoro-timer");
const COUNTDOWN = getToolById("countdown-timer");
const STOPWATCH = getToolById("stopwatch");

const ERROR_ID = "it-error";

const L = LIMITS.interval;

const START = { prep: 10, rounds: 8, cool: 0, stages: [{ label: "Work", kind: "work", seconds: 20 }, { label: "Rest", kind: "rest", seconds: 10 }] };

const secondsText = (total) => {

    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return [minutes ? `${minutes} min` : "", seconds ? `${seconds} s` : ""].filter(Boolean).join(" ") || "0 s";

};


/* =========================================================
   MARKUP
========================================================= */

function stageRow(stage, number) {

    return `
                            <li class="it-stage" data-stage>

                                <input
                                    class="calculator-form__input it-label"
                                    type="text"
                                    maxlength="${L.label}"
                                    autocomplete="off"
                                    value="${escapeHTML(stage.label)}"
                                    aria-label="Stage ${number}: name"
                                >

                                <select class="calculator-form__input it-kind" aria-label="Stage ${number}: type">
                                    <option value="work"${stage.kind === "work" ? " selected" : ""}>Work</option>
                                    <option value="rest"${stage.kind === "rest" ? " selected" : ""}>Rest</option>
                                </select>

                                <input
                                    class="calculator-form__input it-seconds"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    maxlength="4"
                                    value="${stage.seconds}"
                                    aria-label="Stage ${number}: seconds"
                                >

                                <button type="button" class="it-remove tt-inline-button" aria-label="Remove stage ${number}">Remove</button>

                            </li>`;

}

const numberInput = (id, label, value, hint, max) => fieldShell({
    id,
    label,
    unit: id === "it-rounds" ? "rounds" : "seconds",
    hint,
    control: `<input
                                    id="${id}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    maxlength="${max}"
                                    value="${value}"
                                    aria-describedby="${id}-hint"
                                >`
});

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
        lead: "Repeat timed stages for a number of rounds: work and rest for training, or any routine you name. Get-ready and cool-down are optional."
    })}

            <!-- THE TIMER -->

            <section class="calculator-section">

                <div
                    id="it-panel"
                    class="tt-timer-panel it-panel"
                    data-state="idle"
                >

                    <form id="it-form" class="calculator-form it-form" novalidate>

                        <fieldset id="it-settings" class="it-settings">

                            <legend class="calculator-section__title">
                                Your Routine
                            </legend>

                            <div class="calculator-form__field it-preset-field">
                                <label class="calculator-form__label" for="it-preset">Start from a preset (optional)</label>
                                <select id="it-preset" class="calculator-form__input">
                                    <option value="">Custom</option>
                                    ${INTERVAL_PRESETS.map(p => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}
                                </select>
                            </div>

                            <div class="calculator-form__grid it-fields">
                                ${numberInput("it-prep", "Get ready", START.prep, `0 to ${L.seconds.max}`, 4)}
                                ${numberInput("it-rounds", "Rounds", START.rounds, `${L.rounds.min} to ${L.rounds.max}`, 2)}
                                ${numberInput("it-cool", "Cool-down", START.cool, `0 to ${L.seconds.max}`, 4)}
                            </div>

                            <p class="calculator-form__label it-stages-title" id="it-stages-title">
                                Stages in each round (name, type, seconds)
                            </p>

                            <ol id="it-stages" class="it-stages" aria-labelledby="it-stages-title">${START.stages.map((s, i) => stageRow(s, i + 1)).join("")}
                            </ol>

                            <div class="calculator-form__actions">
                                <button type="button" id="it-add" class="calculator-form__button calculator-form__button--secondary">Add a stage</button>
                            </div>

                            <div class="tt-checks it-options">

                                <label class="tt-check">
                                    <input type="checkbox" id="it-auto" checked>
                                    <span>Start the next stage automatically</span>
                                </label>

                                <label class="tt-check">
                                    <input type="checkbox" id="it-sound">
                                    <span>Play a short beep when a stage ends</span>
                                </label>

                            </div>

                            <p id="it-total" class="it-total" aria-live="off"></p>

                            <p id="${ERROR_ID}" class="tt-error" role="alert" hidden></p>

                        </fieldset>

                        <div id="it-stage" class="tt-stage" hidden>

                            <p id="it-phase" class="tt-phase"></p>

                            <div
                                id="it-display"
                                class="tt-display"
                                role="timer"
                                aria-live="off"
                                aria-label="Time left in this stage"
                            >00:00</div>

                            <p id="it-status" class="tt-status-line"></p>

                            <p id="it-next" class="tt-next"></p>

                            <p id="it-count" class="tt-count"></p>

                        </div>

                        <div class="tt-timer-actions">
                            ${button("it-start", "Start")}
                            ${button("it-pause", "Pause", "calculator-form__button--secondary")}
                            ${button("it-resume", "Resume")}
                            ${button("it-skip", "Skip stage", "calculator-form__button--secondary")}
                            ${button("it-next-phase", "Start next stage")}
                            ${button("it-again", "Start again")}
                            ${button("it-reset", "Reset", "calculator-form__button--secondary")}
                        </div>

                    </form>

                </div>

            </section>

            <p
                id="it-live"
                class="tt-sr-only"
                role="status"
                aria-live="polite"
            ></p>
${infoSection("How to Use the " + TITLE, `<ol>
                    <li>
                        Set the stages of one round, for example Work 20 seconds
                        and Rest 10 seconds, and how many rounds to repeat. Pick a
                        preset to fill in a starting routine, then change anything.
                    </li>
                    <li>
                        Add a get-ready time before the first round and a cool-down
                        after the last, if you want them. The total time is shown
                        before you start.
                    </li>
                    <li>
                        Press Start. Pause, skip a stage, or reset at any time.
                        The page title shows the time left, so you can see it from
                        another tab.
                    </li>
                </ol>`)}
${infoSection("How the Routine Runs", `<p>
                    Each round runs every stage in order. The rest that would come
                    after the last round is left out, so the session ends on the
                    last work stage. A stage set to 0 seconds is left out. A
                    session can have up to ${L.stages} stages in a round, ${L.rounds.max} rounds,
                    ${L.phases} stages in all and ${L.totalSeconds / 3600} hours in total.
                </p>
                <p>
                    The presets are only starting values written out in full:
                    ${INTERVAL_PRESETS.map(p => escapeHTML(p.name)).join("; ")}.
                    They are common patterns, not standards, and you can change any
                    number. This timer gives no training, health or safety advice.
                </p>`)}
${infoSection("Keeping Correct Time", `<p>
                    The timer notes when the session began with the browser's steady
                    clock and works out the stage from that, so it stays correct
                    when the tab is in the background or the computer's clock is
                    changed. If the page is closed or reloaded, or the computer
                    sleeps, the session cannot continue. The beep is optional and off
                    to begin with; the display and the screen-reader announcements
                    work without it.
                </p>`)}
${infoSection("Related Timers", `<p>
                    For focus blocks with breaks, use the
                    <a href="${POMODORO.href}">${escapeHTML(POMODORO.title)}</a>. For one countdown,
                    use the <a href="${COUNTDOWN.href}">${escapeHTML(COUNTDOWN.title)}</a>, and to
                    measure elapsed time, the
                    <a href="${STOPWATCH.href}">${escapeHTML(STOPWATCH.title)}</a>.
                </p>`)}
${faqSection(TITLE + " FAQ", [
        ["Why does the session end on a work stage?", "The rest after the last round would only delay the end, so it is left out. A cool-down, if you set one, still follows."],
        ["Can I name my own stages?", "Yes. Name each stage and choose whether it is work or rest. For example Read, Write and Stretch."],
        ["Are the presets official?", "No. They are common patterns written out in full as starting values. Change any number."],
        ["Will it keep time in another tab?", "Yes, while the page stays open. The title shows the time left, and the display is correct when you return."],
        ["Is anything sent or saved?", "No. Everything runs in your browser and nothing is stored, so a reload starts again."]
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

export function init() {

    const panel = document.querySelector("#it-panel");

    if (!panel) {
        return;
    }

    const speaker = createAnnouncer(document.querySelector("#it-live"));

    const announce = (text, delay = 0) => speaker.announce(text, delay);

    const $ = (id) => document.getElementById(id);

    const prep = $("it-prep");
    const rounds = $("it-rounds");
    const cool = $("it-cool");
    const preset = $("it-preset");
    const list = $("it-stages");
    const auto = $("it-auto");
    const sound = $("it-sound");
    const errorBox = $(ERROR_ID);
    const totalEl = $("it-total");
    const addButton = $("it-add");

    const stage = $("it-stage");
    const phaseEl = $("it-phase");
    const statusEl = $("it-status");
    const nextEl = $("it-next");
    const countEl = $("it-count");
    const display = $("it-display");

    const rowsOf = () => [...list.querySelectorAll("[data-stage]")];

    const read = () => intervalSequence({
        prep: prep.value.trim() === "" ? 0 : Number(prep.value),
        cool: cool.value.trim() === "" ? 0 : Number(cool.value),
        rounds: rounds.value,
        stages: rowsOf().map(row => ({
            label: row.querySelector(".it-label").value,
            kind: row.querySelector(".it-kind").value,
            seconds: row.querySelector(".it-seconds").value.trim() === "" ? 0 : Number(row.querySelector(".it-seconds").value)
        }))
    });

    const fieldElement = (field) => {

        if (field === "prep") return prep;
        if (field === "cool") return cool;
        if (field === "rounds") return rounds;

        const match = /^stage-(\d+)$/.exec(field);

        return match ? rowsOf()[Number(match[1])]?.querySelector(".it-seconds") ?? addButton : addButton;

    };

    function showErrors(errors) {

        for (const element of [prep, rounds, cool, ...list.querySelectorAll(".it-seconds")]) {
            element.removeAttribute("aria-invalid");
            element.removeAttribute("aria-describedby");
        }

        if (!errors) {
            errorBox.hidden = true;
            errorBox.textContent = "";
            return;
        }

        for (const error of errors) {
            const element = fieldElement(error.field);
            element.setAttribute("aria-invalid", "true");
            element.setAttribute("aria-describedby", ERROR_ID);
        }

        errorBox.textContent = errors.map(error => error.message).join(" ");
        errorBox.hidden = false;

    }

    function renumber() {

        rowsOf().forEach((row, index) => {

            const n = index + 1;

            row.querySelector(".it-label").setAttribute("aria-label", `Stage ${n}: name`);
            row.querySelector(".it-kind").setAttribute("aria-label", `Stage ${n}: type`);
            row.querySelector(".it-seconds").setAttribute("aria-label", `Stage ${n}: seconds`);
            row.querySelector(".it-remove").setAttribute("aria-label", `Remove stage ${n}`);

            row.querySelector(".it-remove").hidden = rowsOf().length <= 1;

        });

        addButton.disabled = rowsOf().length >= L.stages;

    }

    function summary() {

        const result = read();

        showErrors(result.ok ? null : result.errors);

        totalEl.textContent = result.ok
            ? `Total time: ${secondsText(result.totalSeconds)} (${result.sequence.phases.length} stages).`
            : "";

        return result;

    }

    function phaseName(phase) {

        return phase.round ? `${phase.label}, round ${phase.round}` : phase.label;

    }

    const controller = createCycleController({
        panel,
        buttons: {
            start: $("it-start"),
            pause: $("it-pause"),
            resume: $("it-resume"),
            skip: $("it-skip"),
            next: $("it-next-phase"),
            again: $("it-again"),
            reset: $("it-reset")
        },
        display,
        status: statusEl,
        lock: [$("it-settings")],
        title: TITLE,
        sound: () => sound.checked,
        announce,

        build() {

            const result = summary();

            if (!result.ok) {

                announce(result.errors.map(e => e.message).join(" "), 0);

                fieldElement(result.errors[0].field).focus();

                return { ok: false };

            }

            stage.hidden = false;

            return { ok: true, sequence: result.sequence, auto: auto.checked };

        },

        label: (s) => s.at.phase.label,

        startText: (s) => `Started. ${phaseName(s.at.phase)}, ${phaseLengthText(s.at.phase)}.`,

        phaseText: (s) => `${phaseName(s.at.phase)}, ${phaseLengthText(s.at.phase)}.`,

        waitingText: (s) => s.at.done ? "Complete." : `Stage complete. Next: ${phaseName(s.at.phase)}, ${phaseLengthText(s.at.phase)}. Press Start next stage when you are ready.`,

        doneText: () => "Routine complete.",

        paintIdle() {

            stage.hidden = true;

            summary();

            display.textContent = "00:00";

        },

        paint(s) {

            if (s.at.done) {

                phaseEl.textContent = "Complete";
                phaseEl.dataset.kind = "done";
                statusEl.textContent = "The routine is complete.";
                nextEl.textContent = "";
                countEl.textContent = `Rounds completed: ${s.sequence.phases.length ? rounds.value : 0}`;

                return;

            }

            const phase = s.at.phase;

            const waiting = s.status === "waiting";

            phaseEl.textContent = `${waiting ? "Ready: " : ""}${phaseName(phase)}`;

            phaseEl.dataset.kind = phase.kind;

            statusEl.textContent =
                s.status === "running" ? "Running"
                    : s.status === "paused" ? "Paused"
                        : waiting ? "Stage complete. Start the next stage when you are ready."
                            : "";

            nextEl.textContent = s.next ? `Next: ${phaseName(s.next)}, ${phaseLengthText(s.next)}` : "Last stage";

            countEl.textContent = `Time left in the routine: ${formatRemaining(s.sessionMs)}`;

        }
    });

    function loadPreset() {

        const chosen = INTERVAL_PRESETS.find(p => p.id === preset.value);

        if (!chosen) {
            return;
        }

        prep.value = chosen.prep;
        rounds.value = chosen.rounds;
        cool.value = chosen.cool;

        const stages = [{ label: "Work", kind: "work", seconds: chosen.work }];

        if (chosen.rest > 0) {
            stages.push({ label: "Rest", kind: "rest", seconds: chosen.rest });
        }

        list.innerHTML = stages.map((s, i) => stageRow(s, i + 1)).join("");

    }

    preset.addEventListener("change", () => {

        loadPreset();

        renumber();

        summary();

    });

    {

        $("it-form").addEventListener("input", (event) => {

            if (controller.status === "idle") {

                if (event.target !== preset) {
                    preset.value = "";
                }

                summary();

            }

        });

        $("it-form").addEventListener("change", () => {

            if (controller.status === "idle") {
                summary();
            }

        });

        $("it-form").addEventListener("submit", event => {
            event.preventDefault();
        });

    }

    addButton.addEventListener("click", () => {

        if (rowsOf().length >= L.stages) {
            return;
        }

        list.insertAdjacentHTML("beforeend", stageRow({ label: "Work", kind: "work", seconds: 30 }, rowsOf().length + 1));

        renumber();

        summary();

        rowsOf().at(-1).querySelector(".it-label").focus();

    });

    list.addEventListener("click", (event) => {

        const remove = event.target.closest(".it-remove");

        if (!remove || rowsOf().length <= 1) {
            return;
        }

        const row = remove.closest("[data-stage]");

        const index = rowsOf().indexOf(row);

        row.remove();

        renumber();

        summary();

        rowsOf()[Math.min(index, rowsOf().length - 1)].querySelector(".it-label").focus();

        announce(`Stage ${index + 1} removed.`, 0);

    });

    renumber();

    summary();

    panel.dataset.ready = "true";

}
