/* =========================================================
   ToolZen Hub
   SWP Calculator (Systematic Withdrawal Plan)
   For a lump sum that regular withdrawals will be taken from:
   how long it is estimated to last, how much could be withdrawn
   over a chosen period, or what corpus a withdrawal plan needs,
   for a return the visitor assumes, with an optional yearly
   increase in the withdrawal and lower and higher return scenarios.

   THIS IS A PROJECTION, NOT A FORECAST. The model is a corpus, one
   constant assumed return and regular withdrawals. It is not a
   model of any fund: no units, NAV, taxes, exit loads or fees. The
   page says so next to the result, and uses only the words assumed
   return, estimated, modeled, projection and scenario.

   The maths is in formulas/swp.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent
   anywhere and nothing is stored: not in the address, not in
   localStorage, sessionStorage or cookies. The results update as
   you type, so there is no Calculate button.
========================================================= */

import {
    calculateSwp,
    validateSwpInputs,
    SWP_LIMITS
} from "../formulas/swp.js";

import {
    formatINR,
    formatNumber,
    formatDuration
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
    getCalculatorById("swp").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    corpus: "swp-corpus",
    withdrawal: "swp-withdrawal",
    years: "swp-years",
    annualReturn: "swp-return",
    increase: "swp-increase"
};

const MODE_NAME = "swp-mode";
const FREQUENCY_NAME = "swp-frequency";

/* which fields each mode shows: a hidden field is not read, validated or announced */
const USES = {
    lasts: ["corpus", "withdrawal", "annualReturn", "increase"],
    withdraw: ["corpus", "years", "annualReturn", "increase"],
    corpus: ["withdrawal", "years", "annualReturn", "increase"]
};

/* the fields that may be left empty: a blank increase is 0 */
const OPTIONAL = ["increase"];

const MODE_LABELS = {
    lasts: "How long will my corpus last?",
    withdraw: "How much can I withdraw?",
    corpus: "What corpus do I need?"
};

const FREQUENCY_LABELS = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly"
};

/* "a month", "a quarter", "a year" and the adjective, by withdrawals a year */
const EACH = { 12: "a month", 4: "a quarter", 1: "a year" };
const ADJECTIVE = { 12: "monthly", 4: "quarterly", 1: "yearly" };

const ERROR_ID =
    "swp-results-error";

/* examples, not recommendations: the page says so */
const DEFAULTS = {
    mode: "lasts",
    frequency: "monthly",
    corpus: 10000000,
    withdrawal: 80000,
    years: 25,
    annualReturn: 8,
    increase: ""
};

const EMPTY_MESSAGE =
    "Enter the amounts for the question you chose to see an estimate.";

const L = SWP_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

const rupees = formatINR;

const rate = (value) =>
    `${formatNumber(value, 2).replace(/\.?0+$/, "")}%`;

/* a withdrawal capacity is shown rounded DOWN and a corpus needed rounded UP, so typing the
   figure back in never makes the plan look better than the estimate (the model itself is unrounded) */
const rupeesDown = (value) => formatINR(Math.floor(value + 1e-9));
const rupeesUp = (value) => formatINR(Math.ceil(value - 1e-9));

const durationText = (months) => formatDuration(months);

/* the answer to a mode's question, as short text (scenarios and the sentences use it) */
function answerText(
    mode,
    answer,
    periodsPerYear
) {

    if (mode === "withdraw") {
        return `${rupeesDown(answer.firstWithdrawal)} ${EACH[periodsPerYear]}`;
    }

    if (mode === "corpus") {
        return rupeesUp(answer.corpus);
    }

    switch (answer.state) {
        case "not-used-up":
            return `More than ${SWP_LIMITS.horizonYears} years`;
        case "used-up-at-horizon":
            return `${SWP_LIMITS.horizonYears} years`;
        default:
            return durationText(answer.months);
    }

}

const SCENARIO_TITLES = {
    lower: "Lower return",
    assumed: "As assumed",
    higher: "Higher return"
};

const SCENARIO_LABEL = {
    lasts: "Estimated to last",
    withdraw: "Estimated first withdrawal",
    corpus: "Estimated corpus needed"
};


/* =========================================================
   RESULTS (HTML)
========================================================= */

function compareCard({
    id,
    title,
    tag,
    rows,
    current = false
}) {

    return `
                    <section
                        class="swp-compare__card${current ? " swp-compare__card--assumed" : ""}"
                        aria-labelledby="${id}"
                    >

                        <h3
                            class="swp-compare__title"
                            id="${id}"
                        >
                            ${escapeHTML(title)}
                        </h3>

                        <p class="swp-compare__tag">
                            ${escapeHTML(tag)}
                        </p>

                        <dl class="swp-compare__list">
                            ${rows.map(
                                ([label, value]) => `
                            <div>
                                <dt>${escapeHTML(label)}</dt>
                                <dd>${escapeHTML(value)}</dd>
                            </div>`
                            ).join("")}
                        </dl>

                    </section>`;

}

function scenariosSection(
    result
) {

    const {
        mode,
        input
    } = result;

    const cards =
        result.scenarios.map(
            scenario => compareCard({
                id: `swp-s-${scenario.key}`,
                title: SCENARIO_TITLES[scenario.key],
                tag:
                    scenario.key === "assumed"
                        ? "The return you entered"
                        : "A scenario, not a forecast",
                current: scenario.key === "assumed",
                rows: [
                    ["Assumed return", `${rate(scenario.rate)} a year`],
                    [
                        SCENARIO_LABEL[mode],
                        answerText(mode, scenario.answer, input.periodsPerYear)
                    ]
                ]
            })
        );

    return `
                <h3 class="swp-subtitle">
                    If returns are lower or higher
                </h3>

                <div class="swp-compare">
                    ${cards.join("")}
                </div>

                <p class="swp-note swp-note--plain">
                    The same plan at the assumed return minus and plus two
                    percentage points. These are scenarios, not best or
                    worst cases: real returns can fall outside them.
                </p>`;

}

function yearLabel(
    row
) {

    return row.final
        ? `Year ${row.year}<small class="swp-table__flag"> (corpus used up)</small>`
        : `Year ${row.year}`;

}

function yearlyTable(
    result
) {

    const label =
        "Year by year: withdrawals, estimated growth and closing balance";

    return `
                <h3 class="swp-subtitle">
                    Year by year
                </h3>

                <p class="swp-note swp-note--plain" id="swp-table-note">
                    At the end of each year. Closing balance = the previous
                    closing balance − withdrawals + estimated growth, and
                    year 1 starts from the starting corpus.
                </p>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="${label}"
                    aria-describedby="swp-table-note"
                >

                    <table class="calculator-results__table swp-table">

                        <caption class="swp-sr-only">
                            ${label}, at the end of each year.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Year</th>
                                <th scope="col">Withdrawals</th>
                                <th scope="col">Estimated growth</th>
                                <th scope="col">Closing balance</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${result.yearly.map(
                                row => `
                            <tr>
                                <th scope="row">${yearLabel(row)}</th>
                                <td>${rupees(row.withdrawals)}</td>
                                <td>${rupees(row.growth)}</td>
                                <td>${rupees(row.closing)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>

                <p class="swp-note">
                    Each withdrawal is taken at the start of its period,
                    before that period's growth. Figures are modeled at the
                    return you assumed and are rounded for display.
                </p>`;

}

/* the headline, the sentences and the supporting figures for each mode and state */

function composeAnswer(
    result
) {

    const {
        mode,
        input,
        answer,
        totals,
        startingCorpus
    } = result;

    const m = input.periodsPerYear;
    const increaseNote =
        input.increase > 0
            ? `, raised by ${rate(input.increase)} every year`
            : "";

    const supporting = [
        resultMetric({
            label: "Total withdrawn",
            value: rupees(totals.withdrawn)
        }),
        resultMetric({
            label: "Estimated growth",
            value: rupees(totals.growth)
        })
    ];

    if (mode === "lasts") {

        supporting.push(
            resultMetric({
                label:
                    answer.state === "not-used-up"
                        ? `Estimated balance after ${SWP_LIMITS.horizonYears} years`
                        : "Balance left at the end",
                value: rupees(totals.ending)
            })
        );

        const plan = `a corpus of ${rupees(startingCorpus)} with ${ADJECTIVE[m]} withdrawals of ${rupees(input.withdrawal)}${increaseNote}`;

        const sentences = {
            "used-up": [
                `Based on these assumptions, ${plan} is estimated to cover ${answer.fullWithdrawals} ${ADJECTIVE[m]} withdrawals in full (${durationText(answer.months)}).`,
                answer.partialWithdrawal > 0
                    ? `The next withdrawal would be only partly covered: about ${rupees(answer.partialWithdrawal)}.`
                    : "There would be nothing left for a further withdrawal."
            ],
            "not-used-up": [
                `Based on these assumptions, ${plan} is not used up within the ${SWP_LIMITS.horizonYears} years modeled. The estimated balance after ${SWP_LIMITS.horizonYears} years is ${rupees(totals.ending)}.`
            ],
            "used-up-at-horizon": [
                `Based on these assumptions, ${plan} covers all ${answer.fullWithdrawals} withdrawals, the full ${SWP_LIMITS.horizonYears} years modeled, with nothing left.`
            ],
            "first-exceeds": [
                `The corpus is smaller than the first withdrawal, so it could cover only part of it: ${rupees(answer.partialWithdrawal)} of ${rupees(input.withdrawal)}.`
            ]
        };

        return {
            eyebrow: "Your Projection",
            title: "How long the corpus may last",
            primaryLabel: "Estimated to last",
            primaryValue: answerText(mode, answer, m),
            supporting,
            sentences: sentences[answer.state]
        };

    }

    if (input.increase > 0) {
        supporting.push(
            resultMetric({
                label: "Withdrawal in the final year",
                value: `${(mode === "withdraw" ? rupeesDown : rupees)(answer.finalYearWithdrawal)} ${EACH[m]}`
            })
        );
    }

    const closing =
        "By design, this plan uses up the corpus at the end of the period; it does not leave anything behind.";

    if (mode === "withdraw") {

        const yearOne = answer.firstWithdrawal * m;

        return {
            eyebrow: "Your Projection",
            title: "Estimated withdrawal",
            primaryLabel: "Estimated first withdrawal",
            primaryValue: answerText(mode, answer, m),
            supporting,
            sentences: [
                `Based on these assumptions, withdrawing about ${rupeesDown(answer.firstWithdrawal)} ${EACH[m]}${increaseNote} would use up a corpus of ${rupees(input.corpus)} over ${input.years} ${input.years === 1 ? "year" : "years"}${m > 1 ? `, about ${rupeesDown(yearOne)} in the first year` : ""}.`,
                closing
            ]
        };

    }

    return {
        eyebrow: "Your Projection",
        title: "Estimated corpus needed",
        primaryLabel: "Estimated corpus needed",
        primaryValue: answerText(mode, answer, m),
        supporting,
        sentences: [
            `Based on these assumptions, withdrawing ${rupees(input.withdrawal)} ${EACH[m]}${increaseNote} for ${input.years} ${input.years === 1 ? "year" : "years"} would need a starting corpus of about ${rupeesUp(answer.corpus)}.`,
            closing
        ]
    };

}

function renderResults(
    result
) {

    const composed =
        composeAnswer(result);

    const metrics = [
        resultMetric({
            label: composed.primaryLabel,
            value: composed.primaryValue,
            primary: true
        }),
        ...composed.supporting
    ].join("");

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        ${composed.eyebrow}
                    </span>

                    <h2 class="calculator-results__title">
                        ${composed.title}
                    </h2>

                </div>

                <div class="calculator-results__grid swp-metrics">
                    ${metrics}
                </div>

                <div class="calculator-results__summary">
                    ${composed.sentences.map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="swp-note swp-note--trust">
                    <strong>A scenario, not a forecast.</strong>
                    The return is an assumption you entered and is applied
                    as the same rate every year. Real returns vary, and poor
                    years early on can use a corpus up sooner than a
                    constant return shows. Taxes, fund charges, exit loads,
                    that sequence-of-returns risk and inflation are not
                    modeled. This is not financial advice and not a guarantee.
                </div>

                ${scenariosSection(result)}

                ${yearlyTable(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const {
        mode,
        input,
        answer
    } = result;

    const text = answerText(mode, answer, input.periodsPerYear);

    if (mode === "lasts") {
        return answer.state === "first-exceeds"
            ? "The corpus is smaller than the first withdrawal."
            : `The corpus is estimated to last ${text.toLowerCase()}, based on your assumptions.`;
    }

    return mode === "withdraw"
        ? `The estimated first withdrawal is ${text}, based on your assumptions.`
        : `The estimated corpus needed is ${text}, based on your assumptions.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from the
   default values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const base = {
        corpus: DEFAULTS.corpus,
        withdrawal: DEFAULTS.withdrawal,
        years: DEFAULTS.years,
        annualReturn: DEFAULTS.annualReturn,
        increase: 0,
        periodsPerYear: 12
    };

    const lasts = calculateSwp({ ...base, mode: "lasts" });
    const withdraw = calculateSwp({ ...base, mode: "withdraw" });
    const corpus = calculateSwp({ ...base, mode: "corpus" });

    const at = (key) =>
        answerText(
            "lasts",
            lasts.scenarios.find(s => s.key === key).answer,
            12
        ).toLowerCase();

    return `Take a corpus of ${rupees(DEFAULTS.corpus)}, withdrawals of ${rupees(DEFAULTS.withdrawal)} a month and an assumed return of ${DEFAULTS.annualReturn}% a year. The corpus is estimated to cover ${lasts.answer.fullWithdrawals} withdrawals in full (${durationText(lasts.answer.months)}). At ${rate(lasts.scenarios[0].rate)} or ${rate(lasts.scenarios[2].rate)} instead, it is estimated to last ${at("lower")} or ${at("higher")}. To use the same corpus up over ${DEFAULTS.years} years, the first withdrawal would be about ${rupeesDown(withdraw.answer.firstWithdrawal)} a month. And ${rupees(DEFAULTS.withdrawal)} a month for ${DEFAULTS.years} years would need a starting corpus of about ${rupeesUp(corpus.answer.corpus)}.`;

}


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function modeChoice() {

    return `
                <fieldset class="swp-choice swp-choice--mode">

                    <legend class="calculator-form__label">
                        What do you want to find out?
                    </legend>

                    <div class="swp-choice__options swp-choice__options--stack">

                        ${Object.keys(MODE_LABELS).map(
                            value => `
                        <label class="swp-choice__option">
                            <input
                                type="radio"
                                name="${MODE_NAME}"
                                value="${value}"${value === DEFAULTS.mode ? " checked" : ""}
                            >
                            <span>${escapeHTML(MODE_LABELS[value])}</span>
                        </label>`
                        ).join("")}

                    </div>

                </fieldset>`;

}

function frequencyChoice() {

    return `
                        <fieldset
                            class="swp-choice swp-field--full"
                            aria-describedby="swp-frequency-hint"
                        >

                            <legend class="calculator-form__label">
                                How Often You Withdraw
                            </legend>

                            <div class="swp-choice__options">

                                ${Object.keys(FREQUENCY_LABELS).map(
                                    value => `
                                <label class="swp-choice__option">
                                    <input
                                        type="radio"
                                        name="${FREQUENCY_NAME}"
                                        value="${value}"${value === DEFAULTS.frequency ? " checked" : ""}
                                    >
                                    <span>${escapeHTML(FREQUENCY_LABELS[value])}</span>
                                </label>`
                                ).join("")}

                            </div>

                            <span
                                class="calculator-form__help"
                                id="swp-frequency-hint"
                            >
                                The withdrawal amount below is taken each time, at the start of each period.
                            </span>

                        </fieldset>`;

}

/* a field that only some modes show; `hidden` removes it from the tab order and the accessibility tree */

function modeField(
    name,
    field
) {

    const modes =
        Object.keys(USES).filter(mode => USES[mode].includes(name));

    return `
                        <div
                            class="swp-field"
                            data-field="${name}"
                            data-modes="${modes.join(" ")}"
                        >
                            ${field}
                        </div>`;

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
                        SWP stands for Systematic Withdrawal Plan: taking a
                        set amount out of a lump sum at regular intervals
                        while the rest stays invested. Estimate how long a
                        corpus could last, how much you could withdraw, or
                        what corpus a withdrawal plan needs, for a return you
                        assume.
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
                    Plan Your Withdrawals
                </div>

                <p class="calculator-section__description">
                    Choose a question, then enter your assumptions. This is
                    a general model of a corpus and regular withdrawals, not
                    of any one fund. The starting values are examples, not
                    recommendations. Results update as you type.
                </p>

                <form
                    id="swp-form"
                    class="calculator-form"
                    novalidate
                >

                    ${modeChoice()}

                    <div class="calculator-form__grid swp-grid">

                        ${modeField("corpus", numberField({
                            id: IDS.corpus,
                            label: "Starting Corpus",
                            unit: "₹",
                            hint: "The lump sum you start with.",
                            min: L.corpus.min,
                            max: L.corpus.max,
                            step: 1000,
                            value: DEFAULTS.corpus
                        }))}

                        ${modeField("withdrawal", numberField({
                            id: IDS.withdrawal,
                            label: "Withdrawal Each Time",
                            unit: "₹",
                            hint: "What you take out each time, in the first year.",
                            min: L.withdrawal.min,
                            max: L.withdrawal.max,
                            step: 100,
                            value: DEFAULTS.withdrawal
                        }))}

                        ${frequencyChoice()}

                        ${modeField("years", numberField({
                            id: IDS.years,
                            label: "How Long",
                            unit: "years",
                            hint: "A whole number of years, up to 50.",
                            min: L.years.min,
                            max: L.years.max,
                            step: 1,
                            value: DEFAULTS.years
                        }))}

                        ${modeField("annualReturn", numberField({
                            id: IDS.annualReturn,
                            label: "Assumed Annual Return",
                            unit: "% a year",
                            hint: "An assumption you control, not a forecast. 8% is only an example; try a range.",
                            min: L.rate.min,
                            max: L.rate.max,
                            step: 0.1,
                            value: DEFAULTS.annualReturn
                        }))}

                        ${modeField("increase", numberField({
                            id: IDS.increase,
                            label: "Yearly Increase in Withdrawal (optional)",
                            unit: "% a year",
                            hint: "A percentage you choose, for example to allow for rising costs. It is not a forecast of inflation. Leave blank for none.",
                            min: L.increase.min,
                            max: L.increase.max,
                            step: 0.5,
                            value: DEFAULTS.increase,
                            required: false
                        }))}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="swp-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="swp-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="swp-live"
                class="swp-sr-only"
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
                        Choose what you want to find out: how long a corpus
                        may last, how much you could withdraw, or what corpus
                        you need.
                    </li>
                    <li>
                        Enter the amounts, how often you withdraw, and a
                        return to assume.
                    </li>
                    <li>
                        Optionally add a yearly increase in the withdrawal.
                    </li>
                    <li>
                        Read the estimate and the lower and higher return
                        scenarios. They update as you change any value.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Estimate
                </h2>

                <p>
                    <strong>One return is not an answer.</strong> How long a
                    corpus lasts can change a lot with the return you assume.
                    The scenarios show the same plan at a lower and a higher
                    return so you can see how much depends on that one number.
                </p>

                <p>
                    <strong>Growth is estimated, withdrawals are yours.</strong>
                    The total withdrawn is what you take out. The estimated
                    growth is what the assumed return would add, so it moves
                    whenever the assumption does.
                </p>

                <p>
                    <strong>"How much can I withdraw?" and "What corpus do I
                    need?" use the corpus up by design.</strong> They solve
                    for a plan that reaches zero at the end of the period you
                    chose. They do not leave anything behind.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        The return is an assumption you enter and it is
                        applied as the same rate every year. Real returns
                        vary, can be lower than assumed and can be negative.
                        Poor years early in a plan can use a corpus up sooner
                        than a constant return suggests: this sequence-of-returns
                        risk is not modeled.
                    </li>
                    <li>
                        The annual return is treated as an effective annual
                        rate: with no withdrawals the corpus would grow by
                        exactly that percentage over a year, whatever your
                        withdrawal frequency. Other calculators, including
                        the SIP Calculator on this site, can divide the
                        annual rate by the number of periods instead, so
                        figures can differ slightly.
                    </li>
                    <li>
                        Each withdrawal is taken at the start of its period,
                        before that period's growth.
                    </li>
                    <li>
                        The yearly increase is a percentage you choose,
                        applied once a year to the withdrawal. It is not a
                        prediction of inflation.
                    </li>
                    <li>
                        Taxes (including tax on gains), fund charges, exit
                        loads, fees and inflation are not modeled, and
                        neither are any fund's actual units or prices.
                    </li>
                    <li>
                        Amounts are not rounded in the calculation. A real
                        withdrawal is rounded, so figures can differ a little.
                    </li>
                    <li>
                        A plan is modeled for at most ${SWP_LIMITS.horizonYears} years, and the
                        return can be 0% to 30%.
                    </li>
                </ul>

                <p>
                    These are mathematical scenarios for understanding, not
                    forecasts, guarantees or financial advice, and ToolZen Hub
                    does not recommend any investment. Investments are
                    subject to market risk. See the
                    <a href="${ROUTES.disclaimer}">disclaimer</a>.
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
                    How the Estimate Is Calculated
                </h2>

                <p>
                    Each period, the withdrawal is taken first and what is
                    left grows by one period of the assumed return:
                </p>

                <p>
                    balance = (balance − withdrawal) × (1 + i)
                </p>

                <p>
                    i is (1 + the annual return) raised to 1 divided by the
                    number of withdrawals a year, minus 1. With a yearly
                    increase, the withdrawal is multiplied by (1 + the
                    increase) once at the start of each year. To find how
                    long a corpus lasts, the calculator repeats this month by
                    month (or quarter by quarter, or year by year) until a
                    withdrawal can no longer be paid in full: the part-paid
                    last withdrawal is counted in the total withdrawn but not
                    as time.
                </p>

                <p>
                    To find a withdrawal or a corpus for a chosen number of
                    years, the calculator adds up the value today of every
                    withdrawal, each discounted by the assumed return. The
                    corpus needed is the first withdrawal multiplied by that
                    total, and the first withdrawal a corpus supports is the
                    corpus divided by it.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What does the assumed return mean?
                    </summary>
                    <p>
                        It is a number you choose to see what a plan could
                        look like. It is not a prediction and not a promise.
                        Actual returns can be lower, higher or negative, and
                        they do not arrive evenly.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does a change of ₹1 sometimes change the result a lot?
                    </summary>
                    <p>
                        When a plan only just covers its last withdrawal, a
                        tiny change in the withdrawal can decide whether that
                        last withdrawal is paid in full. The calculator
                        shows a withdrawal rounded down and a corpus rounded
                        up, so typing the figure back in does not make the
                        plan look better than the estimate.
                    </p>
                </details>

                <details>
                    <summary>
                        Is the yearly increase the same as inflation?
                    </summary>
                    <p>
                        No. It is a percentage you choose. The calculator
                        does not know or predict inflation, and it does not
                        adjust anything for it.
                    </p>
                </details>

                <details>
                    <summary>
                        Why can other calculators give a slightly different result?
                    </summary>
                    <p>
                        Calculators differ in when the withdrawal is taken
                        and in how an annual return becomes a monthly one.
                        This one takes the withdrawal at the start of the
                        period and treats the entered return as an effective
                        annual rate.
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
   Binds the fields, the mode, the live results and reset.
========================================================= */

export function init() {

    const form =
        document.querySelector("#swp-form");

    const results =
        document.querySelector("#swp-results");

    const live =
        document.querySelector("#swp-live");

    const resetButton =
        document.querySelector("#swp-reset");

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

    const fieldBoxes =
        [...form.querySelectorAll("[data-field]")];

    const checked = (name) =>
        form.querySelector(`input[name="${name}"]:checked`)?.value;

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

    /* only the chosen question's fields are shown, so only they are interacted with */

    function showFieldsFor(
        mode
    ) {

        for (const box of fieldBoxes) {
            box.hidden = !box.dataset.modes.split(" ").includes(mode);
        }

    }

    function update(
        { speak = true } = {}
    ) {

        const mode = checked(MODE_NAME);

        showFieldsFor(mode);

        clearFieldsInvalid(
            allInputs,
            ERROR_ID
        );

        const raw = {
            mode,
            frequency: checked(FREQUENCY_NAME),
            ...Object.fromEntries(
                Object.entries(inputs).map(
                    ([name, input]) => [
                        name,
                        input.value
                    ]
                )
            )
        };

        /* a required field of this question that is still empty is not an error yet */

        if (
            USES[mode].some(
                name =>
                    !OPTIONAL.includes(name) &&
                    String(raw[name]).trim() === ""
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
            validateSwpInputs(raw);

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
            calculateSwp(check.values);

        results.innerHTML =
            renderResults(result);

        if (speak) {
            announce(liveSummary(result));
        }

    }

    /* typing, and choosing a question or a frequency (a radio also fires input), all update the result */

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

            form.querySelector(`input[name="${MODE_NAME}"][value="${DEFAULTS.mode}"]`).checked = true;
            form.querySelector(`input[name="${FREQUENCY_NAME}"][value="${DEFAULTS.frequency}"]`).checked = true;

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
