/* =========================================================
   ToolZen Hub
   FD Calculator

   For a saver with a fixed deposit quote: what the deposit
   matures to, the interest, the effective annual yield under the
   compounding they choose, and, optionally, how a second offer
   with a different rate or tenure compares.

   THIS CALCULATES THE NUMBERS THE VISITOR ENTERS. It never ranks
   an offer or a bank, never calls an FD best, safe or guaranteed,
   and says plainly, next to the result, what it assumes (including
   ToolZen Hub's own convention for a broken compounding period)
   and what it leaves out.

   The maths is in formulas/fd.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateFd,
    validateFdInputs,
    FD_LIMITS,
    COMPOUNDING
} from "../formulas/fd.js";

import {
    formatNumber
} from "../common/formatter.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    ROUTES
} from "../../routes.js";

import {
    numberField,
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
    getCalculatorById("fd").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    amount: "fd-amount",
    rate: "fd-rate",
    years: "fd-years",
    months: "fd-months",
    bRate: "fd-b-rate",
    bYears: "fd-b-years",
    bMonths: "fd-b-months"
};

const COMPOUNDING_NAME = "fd-compounding";

const COMPOUNDING_LABELS = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    "half-yearly": "Half-yearly",
    yearly: "Yearly"
};

const ERROR_ID =
    "fd-results-error";

const DEFAULTS = {
    amount: 100000,
    rate: 7,
    years: 5,
    months: 0,
    bRate: "",
    bYears: "",
    bMonths: "",
    compounding: "quarterly"
};

const EMPTY_MESSAGE =
    "Enter a deposit amount, an interest rate and a tenure to see what the deposit matures to.";

const L = FD_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

const paiseFormatter =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const rupees = (value) => paiseFormatter.format(Number(value) || 0);

/* a signed amount, so a difference never depends on colour */
const signedRupees = (value) =>
    value === 0
        ? rupees(0)
        : `${value > 0 ? "+" : "−"}${rupees(Math.abs(value))}`;

const percent = (value, digits = 2) => `${formatNumber(value, digits)}%`;

const plainPercent = (value) => `${formatNumber(value, 2).replace(/\.?0+$/, "")}%`;

const signedPoints = (value) =>
    Math.abs(value) < 5e-5
        ? "0.00 points"
        : `${value > 0 ? "+" : "−"}${formatNumber(Math.abs(value), 2)} points`;

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/* a number of months as years and months */
function durationText(
    months
) {

    const years = Math.floor(months / 12);
    const rest = months % 12;

    if (years === 0) {
        return plural(rest, "month");
    }

    return rest === 0
        ? plural(years, "year")
        : `${plural(years, "year")} ${plural(rest, "month")}`;

}

const signedDuration = (months) =>
    months === 0
        ? "Same"
        : `${months > 0 ? "+" : "−"}${durationText(Math.abs(months))}`;

const compoundingText = (name) =>
    COMPOUNDING_LABELS[name].toLowerCase();


/* =========================================================
   RESULTS (HTML)
========================================================= */

function summaryLines(
    result
) {

    const {
        input,
        maturity,
        interest
    } = result;

    const lines = [];

    lines.push(
        input.rate === 0
            ? `${rupees(input.amount)} at 0% a year for ${durationText(input.months)} matures to ${rupees(maturity)}: with no interest, the deposit is returned unchanged.`
            : `${rupees(input.amount)} at a quoted ${plainPercent(input.rate)} a year for ${durationText(input.months)}, with interest added ${compoundingText(input.compounding)}, matures to ${rupees(maturity)}, of which ${rupees(interest)} is interest.`
    );

    if (result.remainingMonths > 0) {

        lines.push(
            `${durationText(result.months)} is not a whole number of ${compoundingText(input.compounding)} periods, so the last ${plural(result.remainingMonths, "month")} earn simple interest pro rata. That is this calculator's convention; a bank may treat a broken period differently.`
        );

    }

    return lines;

}

function comparisonSentence(
    result
) {

    const {
        comparison,
        optionB
    } = result;

    const amount =
        comparison.maturity === 0
            ? "the same amount as"
            : `${rupees(Math.abs(comparison.maturity))} ${comparison.maturity > 0 ? "more" : "less"} than`;

    const lead =
        `Under these inputs, Option B matures to ${amount} Option A`;

    if (!comparison.likeForLike) {

        return `${lead}, but it runs for ${durationText(optionB.months)} against ${durationText(result.months)}, so the maturity amounts are not a like-for-like comparison.`;

    }

    return `${lead}, over the same ${durationText(result.months)}.`;

}

function comparisonSection(
    result
) {

    if (!result.optionB) {
        return "";
    }

    const {
        comparison,
        optionB
    } = result;

    const rows = [
        [
            "Quoted interest rate",
            `${plainPercent(result.rate)} a year`,
            `${plainPercent(optionB.rate)} a year`,
            comparison.rate === 0
                ? "Same"
                : `${comparison.rate > 0 ? "+" : "−"}${formatNumber(Math.abs(comparison.rate), 2)} points`
        ],
        [
            "Tenure",
            durationText(result.months),
            durationText(optionB.months),
            signedDuration(comparison.months)
        ],
        [
            "Interest added",
            compoundingText(result.input.compounding),
            compoundingText(result.input.compounding),
            "Same"
        ],
        [
            "Maturity amount",
            rupees(result.maturity),
            rupees(optionB.maturity),
            signedRupees(comparison.maturity)
        ],
        [
            "Interest earned",
            rupees(result.interest),
            rupees(optionB.interest),
            signedRupees(comparison.interest)
        ],
        [
            "Effective annual yield",
            percent(result.effectiveYield * 100),
            percent(optionB.effectiveYield * 100),
            signedPoints(comparison.effectiveYield * 100)
        ]
    ];

    const tenureNote =
        comparison.likeForLike
            ? ""
            : `
                <p class="fd-note fd-note--tenure">
                    <strong>The tenures differ.</strong>
                    The two deposits run for different lengths of time, so
                    their maturity amounts are not a like-for-like
                    comparison. Compare the effective annual yields together
                    with the tenures.
                </p>`;

    return `
                <h3 class="fd-subtitle">
                    How the two offers differ
                </h3>

                <p class="fd-note fd-note--plain">
                    ${escapeHTML(comparisonSentence(result))}
                </p>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="Option A and Option B side by side: quoted rate, tenure, maturity, interest and effective annual yield, with the difference"
                >

                    <table class="calculator-results__table fd-table">

                        <caption class="fd-sr-only">
                            Option A and Option B for the same deposit amount, with the difference between them (Option B minus Option A).
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Under the same deposit</th>
                                <th scope="col">Option A</th>
                                <th scope="col">Option B</th>
                                <th scope="col">Difference (B − A)</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${rows.map(
                                ([label, a, b, difference]) => `
                            <tr>
                                <th scope="row">${escapeHTML(label)}</th>
                                <td>${escapeHTML(a)}</td>
                                <td>${escapeHTML(b)}</td>
                                <td>${escapeHTML(difference)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>
                ${tenureNote}

                <p class="fd-note">
                    Both options use the same deposit and the same compounding. The table states the differences between the numbers you entered; it does not rank the offers.
                </p>`;

}

function renderResults(
    result
) {

    const metrics = [
        resultMetric({ label: "Maturity amount", value: rupees(result.maturity), primary: true }),
        resultMetric({ label: "Interest earned", value: rupees(result.interest) }),
        resultMetric({ label: "Effective annual yield", value: percent(result.effectiveYield * 100) }),
        resultMetric({ label: "Total growth over the entered period", value: percent(result.totalGrowth * 100) })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        What the deposit matures to
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                    <p>
                        The effective annual yield is what one year grows to under ${escapeHTML(compoundingText(result.input.compounding))} compounding. The total growth is for the whole ${escapeHTML(durationText(result.months))}, not a yearly rate.
                    </p>
                </div>

                <div class="fd-note fd-note--trust">
                    <strong>Your numbers, under stated assumptions.</strong>
                    The deposit, rate and tenure are the ones you entered, and
                    the compounding is the one you chose. The rate is assumed
                    to stay the same for the whole tenure, and interest is
                    assumed to stay in the deposit. When the tenure ends part
                    way through a compounding period, the remaining months
                    earn simple interest pro rata: that is this calculator's
                    own convention, not a rule every bank follows. Actual FD
                    maturity may differ because banks use their own
                    compounding dates, day-count conventions, rounding and
                    product terms. This is not a bank's quote or a guaranteed
                    amount. Not included: tax and TDS, premature withdrawal,
                    interest payout options, deposit insurance and future rate
                    changes.
                </div>

                ${comparisonSection(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    return `Maturity ${rupees(result.maturity)}; interest ${rupees(result.interest)}; effective annual yield ${percent(result.effectiveYield * 100)}.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from fixed
   example values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const a =
        calculateFd({ amount: 100000, rate: 7, months: 60, compounding: "quarterly" });

    const yearly =
        calculateFd({ amount: 100000, rate: 7, months: 60, compounding: "yearly" });

    const both =
        calculateFd({
            amount: 100000,
            rate: 7.1,
            months: 36,
            compounding: "quarterly",
            optionB: { rate: 6.8, months: 60 }
        });

    return `Take ${rupees(100000)} at a quoted 7% a year for 5 years, with interest added quarterly. It matures to ${rupees(a.maturity)}, which is ${rupees(a.interest)} of interest and an effective annual yield of ${percent(a.effectiveYield * 100)}. With yearly compounding the same deposit matures to ${rupees(yearly.maturity)}. Now compare 7.1% for 3 years (Option A) with 6.8% for 5 years (Option B), both quarterly: A matures to ${rupees(both.maturity)} and B to ${rupees(both.optionB.maturity)}. B's amount is larger because it runs 2 years longer, while its effective annual yield (${percent(both.optionB.effectiveYield * 100)}) is lower than A's (${percent(both.effectiveYield * 100)}).`;

}


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function periodFields({
    legend,
    ids,
    hintId,
    hint,
    values
}) {

    return `
                        <fieldset
                            class="fd-tenure"
                            aria-describedby="${hintId}"
                        >

                            <legend class="calculator-form__label">
                                ${legend}
                            </legend>

                            <div class="fd-pair">

                                ${numberField({
                                    id: ids.years,
                                    label: "Years",
                                    min: L.years.min,
                                    max: L.years.max,
                                    step: 1,
                                    value: values.years,
                                    required: values.optional ? false : true
                                })}

                                ${numberField({
                                    id: ids.months,
                                    label: "Months",
                                    min: L.months.min,
                                    max: L.months.max,
                                    step: 1,
                                    value: values.months,
                                    required: values.optional ? false : true
                                })}

                            </div>

                            <span
                                class="calculator-form__help"
                                id="${hintId}"
                            >
                                ${hint}
                            </span>

                        </fieldset>`;

}

function compoundingControl() {

    return `
                        <fieldset
                            class="fd-compounding"
                            aria-describedby="fd-compounding-hint"
                        >

                            <legend class="calculator-form__label">
                                How Often Interest Is Added
                            </legend>

                            <div class="fd-compounding__options">

                                ${Object.keys(COMPOUNDING).map(
                                    value => `
                                <label class="fd-compounding__option">
                                    <input
                                        type="radio"
                                        name="${COMPOUNDING_NAME}"
                                        value="${value}"${value === DEFAULTS.compounding ? " checked" : ""}
                                    >
                                    <span>${escapeHTML(COMPOUNDING_LABELS[value])}</span>
                                </label>`
                                ).join("")}

                            </div>

                            <span
                                class="calculator-form__help"
                                id="fd-compounding-hint"
                            >
                                Choose how your bank adds interest to the deposit. Quarterly is only an example.
                            </span>

                        </fieldset>`;

}

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Finance Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Work out what a fixed deposit matures to for a rate and
                        tenure you enter, see its effective annual yield, and
                        compare two offers side by side.
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
                    Work Out the Maturity
                </div>

                <p class="calculator-section__description">
                    Enter the deposit and the quote you were given. Results
                    update as you type.
                </p>

                <form
                    id="fd-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid">

                        ${numberField({
                            id: IDS.amount,
                            label: "Deposit Amount",
                            unit: "₹",
                            hint: "The amount you deposit.",
                            min: L.amount.min,
                            max: L.amount.max,
                            step: 1000,
                            value: DEFAULTS.amount
                        })}

                        ${numberField({
                            id: IDS.rate,
                            label: "Interest Rate",
                            unit: "% a year",
                            hint: "The rate you were quoted, held for the whole tenure. 7% is only an example.",
                            min: L.rate.min,
                            max: L.rate.max,
                            step: 0.05,
                            value: DEFAULTS.rate
                        })}

                        ${periodFields({
                            legend: "Tenure",
                            ids: { years: IDS.years, months: IDS.months },
                            hintId: "fd-tenure-hint",
                            hint: "How long the deposit runs, for example 3 years and 6 months.",
                            values: { years: DEFAULTS.years, months: DEFAULTS.months }
                        })}

                        ${compoundingControl()}

                    </div>


                    <!-- OPTION B -->

                    <div class="fd-option-b">

                        <h3 class="fd-option-b__title">
                            Compare With Another Offer (optional)
                        </h3>

                        <p class="fd-option-b__text">
                            Enter a second rate to compare two offers for the same
                            deposit and the same compounding. Leave it blank to skip.
                        </p>

                        <div class="calculator-form__grid">

                            ${numberField({
                                id: IDS.bRate,
                                label: "Option B Interest Rate",
                                unit: "% a year",
                                hint: "Leave blank to skip the comparison.",
                                min: L.rate.min,
                                max: L.rate.max,
                                step: 0.05,
                                value: DEFAULTS.bRate,
                                required: false
                            })}

                            ${periodFields({
                                legend: "Option B Tenure (optional)",
                                ids: { years: IDS.bYears, months: IDS.bMonths },
                                hintId: "fd-b-tenure-hint",
                                hint: "Leave blank to use Option A's tenure. A tenure alone does not start a comparison.",
                                values: { years: DEFAULTS.bYears, months: DEFAULTS.bMonths, optional: true }
                            })}

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="fd-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="fd-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="fd-live"
                class="fd-sr-only"
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
                        Enter the deposit amount, the interest rate you were
                        quoted and the tenure in years and months.
                    </li>
                    <li>
                        Choose how often interest is added: monthly,
                        quarterly, half-yearly or yearly.
                    </li>
                    <li>
                        Read the maturity amount, the interest and the
                        effective annual yield. Results update as you change
                        any value.
                    </li>
                    <li>
                        To compare another offer, enter its rate (and its
                        tenure, if it differs) under Compare With Another Offer.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>The maturity amount</strong> is the deposit plus
                    the interest added over the tenure, with interest earning
                    interest at the compounding you chose.
                </p>

                <p>
                    <strong>The effective annual yield</strong> is what one
                    year grows to under that compounding. It is different from
                    the quoted rate, which is the yearly rate before
                    compounding, and it is not the growth over the whole
                    tenure or the CAGR of another investment.
                </p>

                <p>
                    <strong>The total growth</strong> is the interest as a
                    share of the deposit over the whole tenure. It is not a
                    yearly figure.
                </p>

                <p>
                    <strong>Comparing two offers.</strong> Both use the same
                    deposit and the same compounding. When the tenures differ,
                    the maturity amounts are not like-for-like, because the
                    money is deposited for different lengths of time: read the
                    effective annual yields together with the tenures.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        The rate stays the same for the whole tenure, and
                        interest stays in the deposit and earns interest.
                    </li>
                    <li>
                        When the tenure ends part way through a compounding
                        period, the remaining months earn simple interest pro
                        rata. This is this calculator's own convention, not a
                        rule every bank follows.
                    </li>
                    <li>
                        Actual FD maturity may differ, because banks can use
                        their own compounding dates, day-count conventions,
                        rounding and product terms.
                    </li>
                    <li>
                        Not included: tax and TDS, premature withdrawal,
                        interest payout options, deposit insurance and future
                        rate changes.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not a bank's
                    quote or advice. See the <a href="${ROUTES.disclaimer}">disclaimer</a>.
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
                    Rate for one period i = yearly rate ÷ 100 ÷ periods a year.
                </p>

                <p>
                    Maturity = deposit × (1 + i)ᵏ × (1 + i × q ÷ L), where k is
                    the number of whole compounding periods in the tenure, q is
                    the months left over and L is the months in one period.
                    With no months left over this is plain compound interest.
                </p>

                <p>
                    Effective annual yield = (1 + i)ᵐ − 1, where m is the
                    periods in a year. Total growth = (maturity − deposit) ÷
                    deposit.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What is the effective annual yield?
                    </summary>
                    <p>
                        It is what one year grows to when the quoted rate is
                        compounded the way you chose. With yearly compounding
                        it equals the quoted rate; the more often interest is
                        added, the slightly higher it is.
                    </p>
                </details>

                <details>
                    <summary>
                        Will my bank's maturity match this?
                    </summary>
                    <p>
                        Not necessarily. Banks use their own compounding
                        dates, day-count conventions, rounding and treatment
                        of a broken period, and products differ. This
                        calculator shows the numbers you enter under the
                        assumptions it states.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the maturity alone not enough to compare two offers?
                    </summary>
                    <p>
                        If one deposit runs longer, its maturity is larger
                        partly because the money stays in for longer. The
                        effective annual yield and the tenure, read together,
                        show more than the maturity alone. This calculator
                        does not rank offers.
                    </p>
                </details>

                <details>
                    <summary>
                        What does the comparison use for the deposit and compounding?
                    </summary>
                    <p>
                        Option B uses the same deposit amount and the same
                        compounding as Option A. Only the rate and, if you
                        enter one, the tenure differ.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it include tax or TDS?
                    </summary>
                    <p>
                        No. Tax on interest, TDS, premature withdrawal and
                        payout options are not included.
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
        document.querySelector("#fd-form");

    const results =
        document.querySelector("#fd-results");

    const live =
        document.querySelector("#fd-live");

    const resetButton =
        document.querySelector("#fd-reset");

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

    const radios =
        [...form.querySelectorAll(`input[name="${COMPOUNDING_NAME}"]`)];

    const allInputs =
        Object.values(inputs);

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

        raw.compounding =
            radios.find(radio => radio.checked)?.value ?? DEFAULTS.compounding;

        /* a required field that is still empty is not an error yet; the tenure is empty only when both parts are */
        const tenureEmpty =
            String(raw.years).trim() === "" &&
            String(raw.months).trim() === "";

        if (
            tenureEmpty ||
            ["amount", "rate"].some(
                name => String(raw[name]).trim() === ""
            )
        ) {

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        const check =
            validateFdInputs(raw);

        if (!check.ok) {

            const names =
                new Set(
                    check.errors.flatMap(
                        error =>
                            error.fields
                    )
                );

            setFieldsInvalid(
                [...names]
                    .map(name => inputs[name])
                    .filter(Boolean),
                ERROR_ID
            );

            const message =
                check.errors
                    .map(error => error.message)
                    .join(" ");

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

        const result =
            calculateFd(check.values);

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

    form.addEventListener(
        "submit",
        event => {
            event.preventDefault();
        }
    );

    resetButton?.addEventListener(
        "click",
        () => {

            for (const [name, input] of Object.entries(inputs)) {
                input.value = DEFAULTS[name];
            }

            for (const radio of radios) {
                radio.checked = radio.value === DEFAULTS.compounding;
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
