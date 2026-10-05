/* =========================================================
   ToolZen Hub
   Percentage Calculator

   For anyone with a number that moved by a percentage and one of
   the three pieces missing: the starting value, the percentage
   change or the ending value. Fill in any two and the page works
   out the third, then shows the change that would undo it and,
   if asked, the effect of a second change after the first.

   THERE IS NO MODE PICKER. The field left empty is the one that is
   worked out, and the answer appears in the result, never in the
   empty field. With all three filled the page asks the visitor to
   clear one; it never guesses which to overwrite.

   THIS DESCRIBES PLAIN NUMBERS. Each percentage is taken of the
   value it applies to (the starting value, then the value after
   the first change). It adds no tax, fee or shop rounding, and it
   never calls a change good, fair or worth it.

   The maths is in formulas/percentage.js (pure, exact BigInt
   fractions, tested against an independent reference). This file
   reads the fields, asks that module to solve, and shows the
   answer. It owns the wording and the layout; the shared UI (ui/)
   only wires labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    solvePercentage,
    parseField,
    groupedText,
    DEFAULT_INPUTS,
    CORE_FIELDS
} from "../formulas/percentage.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    ROUTES
} from "../../routes.js";

import {
    fieldShell,
    setFieldsInvalid,
    clearFieldsInvalid
} from "../../ui/field.js";

import {
    resultMetric,
    resultEmpty,
    resultError
} from "../../ui/result.js";

import {
    escapeHTML
} from "../../ui/escape.js";


/* =========================================================
   TITLE
   The title comes from the tool catalog. The copy and the rest
   of the content stay with the tool.
========================================================= */

const TITLE =
    getCalculatorById("percentage").title;


/* =========================================================
   FIELDS AND WORDING
========================================================= */

const IDS = {
    start: "percentage-start",
    change: "percentage-change",
    end: "percentage-end",
    second: "percentage-second"
};

const ERROR_ID =
    "percentage-results-error";

const FORM_NOTE_ID =
    "percentage-form-note";

const FIELD_NAME = {
    start: "Starting value",
    change: "Percentage change",
    end: "Ending value"
};

const EMPTY_MESSAGE =
    "Fill in any two of the three to work out the third.";

const ALL_THREE_NOTE =
    "Clear one field to work it out.";

const ALL_THREE_RESULT =
    "All three values are filled in, so there is nothing left to work out.";

const SECOND_HINT_ACTIVE =
    "Taken of the value after the first change.";

const SECOND_HINT_INACTIVE =
    "Fill in two of the values above first.";

const RANGE_MESSAGE =
    "The values you entered are fine, but the answer falls outside the range this calculator shows (0.01 to 1,00,00,00,000 for a value, −99.99% to 10,00,000% for a change). Try values that are closer together.";


/* =========================================================
   WORDING HELPERS
========================================================= */

/* a minus sign, not a hyphen */
const signed = (h) =>
    h === 0n
        ? "0.00"
        : `${h > 0n ? "+" : "−"}${groupedText(h < 0n ? -h : h)}`;

const plain = (h) => groupedText(h);

const pct = (h) => `${signed(h)}%`;

const pctPlain = (h) => `${groupedText(h < 0n ? -h : h)}%`;

/* "100 + 20.00" or "100 − 20.00" */
const multiplierText = (changeH) =>
    changeH < 0n
        ? `100 − ${groupedText(-changeH)}`
        : `100 + ${groupedText(changeH)}`;

const PRIMARY = {
    end: { label: "Ending value", title: "The value after the change" },
    change: { label: "Percentage change", title: "How much it changed, as a percentage of the start" },
    start: { label: "Starting value", title: "The value before the change" }
};


/* =========================================================
   RESULTS (HTML)
========================================================= */

function summaryLines(
    result
) {

    const s = plain(result.start.h);
    const e = plain(result.end.h);
    const p = result.change.h;
    const move = p === 0n ? "unchanged" : p > 0n ? "increased" : "decreased";
    const amount = pctPlain(p);

    if (result.solvesFor === "end") {

        return [
            p === 0n
                ? `${s} with a ${amount} change stays at ${e}.`
                : `${s} ${move} by ${amount} gives ${e}. The ${amount} is calculated from the starting value.`
        ];

    }

    if (result.solvesFor === "change") {

        return [
            p === 0n
                ? `${s} to ${e} is no change.`
                : `${s} to ${e} is ${p > 0n ? "an increase" : "a decrease"} of ${amount}. The percentage is taken of the starting value, so it is a different figure from the change measured against ${e}.`
        ];

    }

    return [
        p === 0n
            ? `${e} after a ${amount} change came from a starting value of ${s}.`
            : `${e} after a ${amount} ${p > 0n ? "increase" : "decrease"} came from a starting value of ${s}. It is found by dividing ${e} by ${p > 0n ? "1 plus" : "1 minus"} ${amount} written as a fraction, not by subtracting ${amount} from ${e}.`
    ];

}

function workedLine(
    result
) {

    const s = plain(result.start.h);
    const e = plain(result.end.h);
    const p = result.change.h;
    const m = multiplierText(p);

    if (result.solvesFor === "end") {
        return `${s} × (${m}) ÷ 100 = ${e}`;
    }

    if (result.solvesFor === "change") {
        return `(${e} ÷ ${s} − 1) × 100 = ${pct(p)}`;
    }

    return `${e} × 100 ÷ (${m}) = ${s}`;

}

function secondSection(
    result
) {

    const second = result.second;

    if (!second) {
        return "";
    }

    if (second.status === "out-of-range") {

        return `
                <h3 class="percentage-subtitle">
                    After the second change
                </h3>

                <p class="percentage-note">
                    The first relationship is fine, but the value after the second change falls outside the range this calculator shows (0.01 to 1,00,00,00,000).
                </p>`;

    }

    return `
                <h3 class="percentage-subtitle">
                    After the second change
                </h3>

                <div class="calculator-results__grid">
                    ${resultMetric({ label: "Value after the second change", value: plain(second.end2.h) })}
                    ${resultMetric({ label: "Net change from the starting value", value: pct(second.net.h) })}
                    ${resultMetric({ label: "Adding the two percentages (not the combined change)", value: pct(second.plainSum.h) })}
                </div>

                <p class="percentage-note">
                    The two changes do not simply cancel or add up, because the second ${pctPlain(second.q.h)} is taken of ${plain(result.end.h)}, the value after the first change, not of ${plain(result.start.h)}. The net change is measured from the starting value.
                </p>`;

}

function renderResults(
    result
) {

    const primary = PRIMARY[result.solvesFor];

    const primaryValue =
        result.solvesFor === "change"
            ? pct(result.change.h)
            : plain(result[result.solvesFor].h);

    const metrics = [
        resultMetric({ label: primary.label, value: primaryValue, primary: true }),
        resultMetric({ label: "Change amount", value: signed(result.amount.h) }),
        resultMetric({ label: "Change that undoes it", value: pct(result.undo.h) }),
        resultMetric({ label: "Ending value as a percentage of the starting value", value: `${plain(result.endPercentOfStart.h)}%` })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        ${escapeHTML(primary.title)}
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                    <p class="percentage-worked">${escapeHTML(workedLine(result))}</p>
                </div>

                <div class="percentage-note percentage-note--trust">
                    <strong>Plain numbers, each percentage taken of its own base.</strong>
                    The change that undoes it is the percentage that takes the ending
                    value back to the starting value; it is not the same percentage
                    with the sign flipped. Not included: tax, fees, and the rounding a
                    shop or an invoice may apply, which can differ from this exact
                    arithmetic. This is a calculation, not advice.
                </div>

                ${secondSection(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const primary = PRIMARY[result.solvesFor];

    const value =
        result.solvesFor === "change"
            ? pct(result.change.h)
            : plain(result[result.solvesFor].h);

    return `${primary.label} ${value}; the change that undoes it is ${pct(result.undo.h)}.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from fixed
   example values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const run = (inputs) =>
        solvePercentage({ start: "", change: "", end: "", second: "", ...inputs });

    const up = run({ start: "100000", change: "20", second: "-20" });
    const reverse = run({ change: "20", end: "2400" });

    return `Take ${plain(up.start.h)} raised by 20%: it becomes ${plain(up.end.h)}. A 20% fall of that is taken of ${plain(up.end.h)}, not of ${plain(up.start.h)}, so it gives ${plain(up.second.end2.h)}, a net change of ${pct(up.second.net.h)}. Adding the two percentages gives ${pct(up.second.plainSum.h)}, which is not the combined change. Working backwards: ${plain(reverse.end.h)} after a 20% increase came from ${plain(reverse.start.h)}, and the change that undoes a 20% increase is ${pct(reverse.undo.h)}.`;

}


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function textField({
    id,
    label,
    unit,
    hint,
    value,
    inputmode,
    disabled = false
}) {

    return fieldShell({
        id,
        label,
        unit,
        hint,
        control: `<input
                                    id="${escapeHTML(id)}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="${inputmode}"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    spellcheck="false"
                                    value="${escapeHTML(value)}"${disabled ? "\n                                    disabled" : ""}
                                    aria-describedby="${escapeHTML(id)}-hint"
                                >`
    });

}

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Math Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Fill in any two of a starting value, a percentage
                        change and an ending value to work out the third, and
                        see the change that would undo it.
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
                            Calculated in your browser • Nothing is stored
                        </span>

                    </div>

                </div>

            </section>


            <!-- CALCULATOR -->

            <section class="calculator-section">

                <div class="calculator-section__title">
                    Work Out the Missing Value
                </div>

                <p class="calculator-section__description">
                    Fill in any two fields and leave the third empty. The
                    empty one is worked out as you type.
                </p>

                <form
                    id="percentage-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid percentage-core">

                        ${textField({
                            id: IDS.start,
                            label: FIELD_NAME.start,
                            hint: "The value before the change.",
                            value: DEFAULT_INPUTS.start,
                            inputmode: "decimal"
                        })}

                        ${textField({
                            id: IDS.change,
                            label: FIELD_NAME.change,
                            unit: "%",
                            hint: "Use a minus sign (−) for a decrease.",
                            value: DEFAULT_INPUTS.change,
                            inputmode: "text"
                        })}

                        ${textField({
                            id: IDS.end,
                            label: FIELD_NAME.end,
                            hint: "The value after the change.",
                            value: DEFAULT_INPUTS.end,
                            inputmode: "decimal"
                        })}

                    </div>

                    <p
                        id="${FORM_NOTE_ID}"
                        class="percentage-form-note"
                        role="status"
                        hidden
                    ></p>


                    <!-- SECOND CHANGE -->

                    <div class="percentage-more">

                        <h3 class="percentage-more__title">
                            Then Another Change (optional)
                        </h3>

                        <p class="percentage-more__text">
                            See the effect of a second change taken of the value
                            after the first.
                        </p>

                        <div class="calculator-form__grid">

                            ${textField({
                                id: IDS.second,
                                label: "Then another change of",
                                unit: "%",
                                hint: SECOND_HINT_INACTIVE,
                                value: DEFAULT_INPUTS.second,
                                inputmode: "text",
                                disabled: true
                            })}

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="percentage-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="percentage-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="percentage-live"
                class="percentage-sr-only"
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
                        Fill in any two of the starting value, the percentage
                        change and the ending value.
                    </li>
                    <li>
                        Leave the third empty. It is worked out and shown in
                        the result; the empty field stays empty.
                    </li>
                    <li>
                        To work out a different one, clear that field. If all
                        three are filled in, clear one.
                    </li>
                    <li>
                        Optionally add a second change to see its effect
                        after the first.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>The percentage is of the starting value.</strong>
                    A 20% increase on 2,000 adds 20% of 2,000.
                </p>

                <p>
                    <strong>The change that undoes it</strong> is the
                    percentage that takes the ending value back to the
                    starting value. After a 20% increase it is a fall of
                    16.67%, not 20%, because it is taken of the larger value.
                </p>

                <p>
                    <strong>Working backwards</strong> divides the ending
                    value by 1 plus the percentage. Subtracting the
                    percentage from the ending value does not return the
                    starting value.
                </p>

                <p>
                    <strong>A second change</strong> is taken of the value
                    after the first, so a rise and an equal fall do not
                    cancel.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        Each percentage is applied to its current base: the
                        starting value, then the value after the first change.
                    </li>
                    <li>
                        The values are plain numbers, in no currency or unit.
                    </li>
                    <li>
                        Not included: tax, fees, and the rounding a shop or an
                        invoice may apply, percentage points, growth over time
                        (see the CAGR Calculator) and averages of percentages.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not advice.
                    See the <a href="${ROUTES.disclaimer}">disclaimer</a>.
                </p>

            </section>


            <!-- EXAMPLE -->

            <section class="calculator-info">

                <h2>
                    Example
                </h2>

                <p>
                    ${escapeHTML(exampleParagraph())}
                </p>

            </section>


            <!-- HOW IT WORKS -->

            <section class="calculator-info">

                <h2>
                    How It Is Calculated
                </h2>

                <p>
                    Ending value = starting value × (100 + change) ÷ 100.
                    Change = (ending ÷ starting − 1) × 100. Starting value =
                    ending × 100 ÷ (100 + change).
                </p>

                <p>
                    The change that undoes a change p is −100 × p ÷ (100 + p).
                    The calculation uses exact fractions and rounds only the
                    figures shown, to two decimals.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Why is the answer not filled into the empty field?
                    </summary>
                    <p>
                        The empty field tells the calculator what to work out.
                        If the answer were written into it, the page would no
                        longer know which value you meant to find. To work out
                        something else, clear that field.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does a 20% rise followed by a 20% fall not return
                        to the start?
                    </summary>
                    <p>
                        The 20% fall is taken of the larger value after the
                        rise, so it removes more than the rise added. The
                        change that does return to the start is a fall of
                        16.67%.
                    </p>
                </details>

                <details>
                    <summary>
                        How do I find the value before a percentage increase?
                    </summary>
                    <p>
                        Enter the ending value and the percentage change and
                        leave the starting value empty. It is found by dividing
                        by 1 plus the percentage, not by subtracting it.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does it say the answer is outside the range?
                    </summary>
                    <p>
                        The two values you entered are valid, but the value
                        worked out from them is outside what this calculator
                        shows. Nothing is rounded or cut off to fit, so try
                        values that are closer together.
                    </p>
                </details>

                <details>
                    <summary>
                        Is this the percentage difference between two numbers?
                    </summary>
                    <p>
                        No. The percentage change here is measured from the
                        starting value. A percentage difference that treats
                        both numbers alike is a different measure that this
                        calculator does not provide.
                    </p>
                </details>
            </section>

        </div>
    `;
}


/* =========================================================
   RENDER
   Puts the markup into the mount and starts the tool. The
   site build already puts the markup in the generated page, so
   the shared tool page calls init() alone there.
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
   Binds the fields, the live results and reset.
========================================================= */

export function init() {

    const form =
        document.querySelector("#percentage-form");

    const results =
        document.querySelector("#percentage-results");

    const live =
        document.querySelector("#percentage-live");

    const note =
        document.getElementById(FORM_NOTE_ID);

    const resetButton =
        document.querySelector("#percentage-reset");

    if (!form || !results) {
        return;
    }

    const inputs =
        Object.fromEntries(
            Object.entries(IDS).map(
                ([name, id]) => [
                    name,
                    document.getElementById(id)
                ]
            )
        );

    const allInputs =
        Object.values(inputs);

    const secondHint =
        document.getElementById(`${IDS.second}-hint`);

    let announceTimer = null;

    /*
     * One short sentence for screen readers, a moment after the
     * visitor stops typing, so it is not read out on every key.
     */
    function announce(
        text
    ) {

        clearTimeout(announceTimer);

        if (!live) {
            return;
        }

        announceTimer =
            setTimeout(
                () => {
                    live.textContent = text;
                },
                500
            );

    }

    function setNote(
        text
    ) {

        if (!note) {
            return;
        }

        note.textContent = text;
        note.hidden = text === "";

    }

    /* the second change can be typed only while the first relationship is solved */
    function setSecondActive(
        active
    ) {

        inputs.second.disabled = !active;

        if (secondHint) {
            secondHint.textContent =
                active ? SECOND_HINT_ACTIVE : SECOND_HINT_INACTIVE;
        }

    }

    function update(
        { speak = true } = {}
    ) {

        clearFieldsInvalid(
            allInputs,
            ERROR_ID
        );

        const raw =
            Object.fromEntries(
                Object.entries(inputs).map(
                    ([name, input]) => [
                        name,
                        input.value
                    ]
                )
            );

        /* the second change is available once the first relationship is solved, whatever the second field holds */
        const core =
            solvePercentage({ ...raw, second: "" });

        setSecondActive(core.status === "solved");

        const effective =
            core.status === "solved"
                ? raw
                : { ...raw, second: "" };

        let result =
            solvePercentage(effective);

        /*
         * A half-typed value ("-", "1.") is not an error while the
         * visitor is still in the field; once they leave it, it is.
         */
        const stray =
            Object.entries(inputs)
                .filter(
                    ([name, input]) =>
                        !input.disabled &&
                        input !== document.activeElement &&
                        parseField(
                            input.value,
                            name === "change" || name === "second" ? "change" : "value"
                        ).state === "partial"
                )
                .map(
                    ([field]) => ({
                        field,
                        message: "Enter a complete number, for example 1.5."
                    })
                );

        if (result.status !== "invalid" && stray.length > 0) {
            result = { status: "invalid", errors: stray };
        }

        setNote(result.status === "all-three" ? ALL_THREE_NOTE : "");

        if (result.status === "incomplete") {

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        if (result.status === "all-three") {

            results.innerHTML =
                resultEmpty(ALL_THREE_RESULT);

            if (speak) {
                announce(ALL_THREE_NOTE);
            }

            return;

        }

        if (result.status === "invalid") {

            setFieldsInvalid(
                result.errors
                    .map(error => inputs[error.field])
                    .filter(Boolean),
                ERROR_ID
            );

            const message =
                [
                    ...new Map(
                        result.errors.map(
                            error => [
                                `${error.field}:${error.message}`,
                                `${error.field === "second" ? "Second change" : FIELD_NAME[error.field]}: ${error.message}`
                            ]
                        )
                    ).values()
                ].join(" ");

            results.innerHTML =
                resultError(
                    message,
                    { id: ERROR_ID }
                );

            if (speak) {
                announce(message);
            }

            return;

        }

        if (result.status === "out-of-range") {

            /* not an error in any field: both values are fine */
            results.innerHTML =
                resultEmpty(RANGE_MESSAGE);

            if (speak) {
                announce(RANGE_MESSAGE);
            }

            return;

        }

        results.innerHTML =
            renderResults(result);

        if (speak) {
            announce(liveSummary(result));
        }

    }

    form.addEventListener(
        "input",
        () => update()
    );

    /* a half-typed value is judged when the visitor leaves the field */
    form.addEventListener(
        "focusout",
        () => update({ speak: false })
    );

    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
        }
    );

    resetButton?.addEventListener(
        "click",
        () => {

            for (const name of [...CORE_FIELDS, "second"]) {
                inputs[name].value = DEFAULT_INPUTS[name];
            }

            update({ speak: false });

            if (live) {
                clearTimeout(announceTimer);
                live.textContent = "";
            }

        }
    );

    /* the first result, without announcing it */
    update({ speak: false });

}
