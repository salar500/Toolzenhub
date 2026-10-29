/* =========================================================
   ToolZen Hub
   Learning: the shared Practice Lab shell

   One flow for every lab: a list of exercises, one exercise at a
   time with its instructions, a response, an explicit Check answer,
   up to three hints, a solution, and plain counts. The lab itself
   supplies only its exercises and a pure `evaluate(exercise, value)`.

   Rules this shell keeps for every lab:
   - Nothing is checked while typing. Any edit after a check removes
     the result and says it no longer applies.
   - What the learner typed is never rewritten. Reset exercise is the
     only way back to the starting text.
   - Checking the same response twice shows and announces the result
     once.
   - An empty or over-long response is "Cannot check", it never
     reaches the evaluator and it does not count as an attempt.
   - An evaluator that throws shows a plain message, never the error.
   - Nothing is saved between visits. Responses live in memory.
   - Everything shown is put on the page as text, never as HTML.
========================================================= */

import { el, put, clear, codeBlock, announce, plural } from "./dom.js";
import { getToolById } from "../data/tools.js";

export const VERDICT_WORD = {
    "correct": "Correct",
    "not-yet": "Not yet",
    "cannot-check": "Cannot check",
    "error": "Something went wrong"
};

const DIFFICULTY_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
export const MAX_HINTS = 3;

/** Run an evaluator so that no failure of it reaches the learner as a wrong answer. */
export function runEvaluator(evaluate, exercise, value) {
    try {
        const result = evaluate(exercise, value);
        if (!result || !["correct", "not-yet", "cannot-check"].includes(result.verdict)) throw new Error("bad verdict");
        return result;
    } catch {
        return { verdict: "error", summary: "Something went wrong while checking this answer. Your answer is still in the box. Try Check answer again." };
    }
}

/** The status of an exercise from what happened to it. Pure, for the counts and the list. */
export function statusOf(state) {
    if (state.solutionViewed) return "solution-viewed";
    if (state.completed) return "completed";
    if (state.touched) return "in-progress";
    return "not-started";
}

const STATUS_WORD = {
    "completed": "completed",
    "solution-viewed": "solution viewed",
    "in-progress": "in progress",
    "not-started": "not started"
};

export function countStatuses(states) {
    const out = { completed: 0, "solution-viewed": 0, "in-progress": 0, "not-started": 0 };
    for (const s of states) out[statusOf(s)] += 1;
    return out;
}

/**
 * @param {{root: HTMLElement, live: HTMLElement, lab: object}} options
 * lab: { id, limit, inputLabel (text or function of the exercise), rows?, exercises, evaluate(exercise, value), input?, isEmpty?(value, exercise),
 *        emptyMessage? (text or function of the exercise), toolNote?, documentLabel?, startingOf?(exercise) }
 *   exercise: { id, title, difficulty, objective, instructions, starting?, document?, hints[], solution, explanation, source, tool?, ... }
 *   input (optional): factory (exercise, value, onChange) => { node, get(), set(value), focus() } for an exercise whose response is not plain text;
 *                     it returns null for an exercise that uses the plain text area
 */
export function mountLab({ root, live, lab }) {

    const exercises = lab.exercises;
    const limit = lab.limit ?? 20000;
    const startingOf = lab.startingOf ?? ((ex) => ex.starting ?? "");

    const states = exercises.map((ex) => ({
        value: startingOf(ex), touched: false, result: null, checkedValue: null,
        hints: 0, solutionViewed: false, completed: false
    }));

    let index = 0;
    let view = null; // the parts of the current exercise that change without a redraw

    const nav = el("ol", { class: "lx-exlist", "aria-label": "Exercises" });
    const counts = el("p", { class: "lx-meta", "data-role": "counts" });
    const stage = el("div", { class: "lx-lab-stage" });

    clear(root);
    put(root, 
        el("h2", { class: "lx-title", text: "Exercises" }),
        nav,
        counts,
        stage
    );

    function say(message) { announce(live, message); }

    /* ---------- the list and the counts ---------- */

    function drawNav() {
        clear(nav);
        exercises.forEach((ex, i) => {
            const status = statusOf(states[i]);
            put(nav, el("li", {},
                el("button", {
                    type: "button", class: "lx-exbtn", "aria-current": i === index ? "true" : null,
                    "aria-label": `Exercise ${i + 1}: ${ex.title}, ${DIFFICULTY_LABEL[ex.difficulty]}, ${STATUS_WORD[status]}`,
                    onclick: () => go(i, true)
                }, String(i + 1))
            ));
        });
        const c = countStatuses(states);
        counts.textContent = `${plural(exercises.length, "exercise")}: ${c.completed} completed, ${c["solution-viewed"]} solution viewed, ${c["not-started"]} not started. Nothing is saved when you leave this page.`;
    }

    /* ---------- one exercise ---------- */

    function go(i, focusHeading) {
        if (i < 0 || i >= exercises.length) return;
        index = i;
        drawExercise();
        drawNav();
        if (focusHeading) view.heading.focus();
    }

    function drawExercise() {
        const ex = exercises[index];
        const st = states[index];
        const inputId = `lx-in-${ex.id}`;
        const counterId = `lx-count-${ex.id}`;

        const heading = el("h3", { class: "lx-title", tabindex: "-1", text: `${index + 1}. ${ex.title}` });
        const result = el("div", { class: "lx-result-area" });
        const stale = el("p", { class: "lx-stale", hidden: true, text: "Your answer changed after the last check. Press Check answer to check it again." });
        const hintBox = el("div", { class: "lx-hints" });
        const solutionBox = el("div", { class: "lx-solution-area" });
        const counter = el("span", { class: "lx-meta", id: counterId });

        /* the response control: a plain labelled text area, or the lab's own */
        let control;
        const onChange = () => {
            st.value = control.get();
            st.touched = true;
            updateCounter();
            if (st.result) {
                st.result = null;
                st.checkedValue = null;
                clear(result);
                stale.hidden = false;
                drawNav();
            }
        };
        const custom = lab.input ? lab.input(ex, st.value, onChange) : null;
        if (custom) {
            control = custom;
        } else {
            const area = el("textarea", {
                id: inputId, class: "lx-textarea", rows: lab.rows ?? 8, spellcheck: "false", autocomplete: "off",
                autocapitalize: "off", "aria-describedby": counterId
            });
            area.value = st.value;
            area.addEventListener("input", onChange);
            control = {
                node: el("div", {},
                    el("div", { class: "lx-field-head" }, el("label", { class: "lx-label", for: inputId, text: typeof lab.inputLabel === "function" ? lab.inputLabel(ex) : lab.inputLabel }), counter),
                    area),
                get: () => area.value, set: (v) => { area.value = v; }, focus: () => area.focus(), area
            };
        }

        function updateCounter() {
            if (custom) return;
            const n = control.get().length;
            counter.textContent = `${n.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")} characters`;
        }

        const checkButton = el("button", { type: "button", class: "calculator-form__button lx-btn", onclick: check }, "Check answer");
        const hintButton = el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: showHint });
        const solutionButton = el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: showSolution }, "Show solution");
        const resetButton = el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", onclick: resetExercise }, "Reset exercise");

        function drawHints() {
            clear(hintBox);
            if (st.hints > 0) {
                put(hintBox, el("h4", { text: "Hints" }), el("ol", { class: "lx-list" }, ex.hints.slice(0, st.hints).map((h) => el("li", { text: h }))));
            }
            hintButton.textContent = st.hints >= ex.hints.length ? "All hints shown" : `Show hint ${st.hints + 1} of ${ex.hints.length}`;
            hintButton.disabled = st.hints >= ex.hints.length;
        }

        function drawSolution() {
            clear(solutionBox);
            if (st.solutionViewed || (st.result && st.result.verdict === "correct")) {
                const box = el("div", { class: "lx-explanation" });
                if (st.solutionViewed) put(box, el("h4", { text: "Solution" }), codeBlock(ex.solution, "Solution"));
                put(box, el("h4", { text: "Why" }), el("p", { text: ex.explanation }), el("p", { class: "lx-meta", text: `Source: ${ex.source}` }));
                put(solutionBox, box);
            }
            solutionButton.disabled = st.solutionViewed;
            solutionButton.textContent = st.solutionViewed ? "Solution shown" : "Show solution";
        }

        function drawResult() {
            clear(result);
            if (!st.result) return;
            const r = st.result;
            const box = el("div", { class: "lx-feedback", "data-verdict": r.verdict },
                el("h4", { text: VERDICT_WORD[r.verdict] }),
                el("p", { text: r.summary })
            );
            if (r.findings && r.findings.length) put(box, el("ul", {}, r.findings.map((f) => el("li", { text: f }))));
            if (r.lines && r.lines.length) put(box, codeBlock(r.lines.join("\n"), "Details"));
            if (r.verdict === "correct" && st.solutionViewed) put(box, el("p", { class: "lx-meta", text: "This exercise stays marked solution viewed." }));
            put(result, box);
        }

        function check() {
            const value = control.get();
            if (st.result && st.checkedValue === value) return; // same answer: shown once, announced once
            let outcome;
            if (lab.isEmpty ? lab.isEmpty(value, ex) : value.trim() === "") {
                const message = typeof lab.emptyMessage === "function" ? lab.emptyMessage(ex) : lab.emptyMessage;
                outcome = { verdict: "cannot-check", summary: message ?? "There is nothing to check yet. Type an answer first." };
            } else if (!custom && value.length > limit) {
                outcome = { verdict: "cannot-check", summary: `The answer is ${value.length.toLocaleString("en-US")} characters. This lab checks up to ${limit.toLocaleString("en-US")}. Shorten it and check again.` };
            } else {
                outcome = runEvaluator(lab.evaluate, ex, value);
            }
            st.value = value;
            if (outcome.verdict !== "cannot-check") st.touched = true; // a response that could not be checked is not an attempt
            st.result = outcome;
            st.checkedValue = value;
            st.completed = outcome.verdict === "correct" && !st.solutionViewed;
            stale.hidden = true;
            drawResult();
            drawSolution();
            drawNav();
            say(`${VERDICT_WORD[outcome.verdict]}. ${outcome.summary}`);
        }

        function showHint() {
            if (st.hints >= ex.hints.length) return;
            st.hints += 1;
            st.touched = true;
            drawHints();
            say(`Hint ${st.hints} shown.`);
        }

        function showSolution() {
            if (st.solutionViewed) return;
            st.solutionViewed = true;
            st.completed = false;
            st.touched = true;
            drawSolution();
            drawResult();
            drawNav();
            say("Solution shown. This exercise is marked solution viewed.");
        }

        function resetExercise() {
            control.set(startingOf(ex));
            st.value = control.get();
            st.result = null;
            st.checkedValue = null;
            stale.hidden = true;
            clear(result);
            updateCounter();
            drawNav();
            say("Exercise reset to its starting text.");
        }

        const tool = ex.tool ? getToolById(ex.tool) : null;

        clear(stage);
        put(stage, 
            el("div", { class: "lx-card" },
                el("p", { class: "lx-meta" }, el("span", { class: "lx-tag", text: DIFFICULTY_LABEL[ex.difficulty] }), ` Exercise ${index + 1} of ${exercises.length}`),
                heading,
                el("p", { class: "lx-meta", text: `Objective: ${ex.objective}` }),
                el("p", { text: ex.instructions }),
                ex.document ? el("div", {},
                    el("p", { class: "lx-label", text: lab.documentLabel ?? "Document (read only)" }),
                    codeBlock(ex.document, lab.documentLabel ?? "Document (read only)")) : null,
                ex.requirement ? el("p", {}, el("strong", { text: "Requirement: " }), ex.requirement) : null,
                control.node,
                stale,
                el("div", { class: "lx-actions" }, checkButton, hintButton, solutionButton, resetButton),
                result,
                hintBox,
                solutionBox,
                tool ? el("p", { class: "lx-meta" }, "Related tool: ", el("a", { href: tool.href, text: tool.title }),
                    `. ${lab.toolNote ?? "You can copy the starting text into it. Nothing is carried over for you."}`) : null,
                el("div", { class: "lx-actions" },
                    el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", disabled: index === 0, onclick: () => go(index - 1, true) }, "Previous exercise"),
                    el("button", { type: "button", class: "calculator-form__button calculator-form__button--secondary lx-btn", disabled: index === exercises.length - 1, onclick: () => go(index + 1, true) }, "Next exercise"))
            )
        );

        updateCounter();
        drawHints();
        drawSolution();
        drawResult();
        view = { heading, control };
    }

    drawExercise();
    drawNav();

    return {
        get index() { return index; },
        go,
        states,
        statuses: () => countStatuses(states)
    };

}
