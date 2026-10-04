/* =========================================================
   ToolZen Hub
   SIP Calculator

   A projection of what a regular monthly investment could grow to
   for a return the visitor assumes: how much is their own money
   and how much is estimated growth, what a yearly step-up changes,
   how the result moves if returns are lower or higher, and, if a
   target is entered, whether the plan reaches it and what starting
   SIP it would need.

   THIS IS A PROJECTION, NOT A FORECAST. Returns are not
   guaranteed. The page says so next to the result, and uses only
   the words assumed return, estimated value, estimated growth,
   projection and scenario.

   The maths is in formulas/sip.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateSip,
    validateSipInputs,
    SIP_LIMITS
} from "../formulas/sip.js";

import {
    buildChartSvg,
    chartSummary
} from "./chart.js";

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
    getCalculatorById("sip").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    monthlySip: "sip-amount",
    annualReturn: "sip-return",
    years: "sip-years",
    months: "sip-months",
    stepUp: "sip-stepup",
    target: "sip-target"
};

/* the fields that may be left empty: a blank step-up is 0 and a blank target means none */
const OPTIONAL = ["stepUp", "target"];

const ERROR_ID =
    "sip-results-error";

const DEFAULTS = {
    monthlySip: 10000,
    annualReturn: 10,
    years: 15,
    months: 0,
    stepUp: 0,
    target: ""
};

const EMPTY_MESSAGE =
    "Enter your monthly SIP, an assumed return and the investment period to see a projection.";

const L = SIP_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

const rupees = formatINR;

const rate = (value) => `${formatNumber(value, 2).replace(/\.?0+$/, "")}%`;

function monthsLabel(
    row
) {

    return row.months < 12
        ? `Year ${row.year} (${row.months} month${row.months === 1 ? "" : "s"})`
        : `Year ${row.year}`;

}

const SCENARIO_TITLES = {
    lower: "Lower return",
    assumed: "As assumed",
    higher: "Higher return"
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
                        class="sip-compare__card${current ? " sip-compare__card--assumed" : ""}"
                        aria-labelledby="${id}"
                    >

                        <h3
                            class="sip-compare__title"
                            id="${id}"
                        >
                            ${escapeHTML(title)}
                        </h3>

                        <p class="sip-compare__tag">
                            ${escapeHTML(tag)}
                        </p>

                        <dl class="sip-compare__list">
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

    const cards =
        result.scenarios.map(
            scenario => compareCard({
                id: `sip-s-${scenario.key}`,
                title: SCENARIO_TITLES[scenario.key],
                tag:
                    scenario.key === "assumed"
                        ? "The return you entered"
                        : "A scenario, not a forecast",
                current: scenario.key === "assumed",
                rows: [
                    ["Assumed return", `${rate(scenario.rate)} a year`],
                    ["Estimated value", rupees(scenario.value)],
                    ["Estimated growth", rupees(scenario.growth)]
                ]
            })
        );

    return `
                <h3 class="sip-subtitle">
                    If returns are lower or higher
                </h3>

                <div class="sip-compare">
                    ${cards.join("")}
                </div>

                <p class="sip-note sip-note--plain">
                    The same plan at the assumed return minus and plus two
                    percentage points. These are scenarios, not best or
                    worst cases: real returns can fall outside them.
                </p>`;

}

function targetSection(
    result
) {

    const {
        target,
        input,
        plan
    } = result;

    if (!target) {
        return "";
    }

    const needed =
        Math.ceil(target.requiredStartingSip);

    const stepNote =
        input.stepUp > 0
            ? `, raised by ${rate(input.stepUp)} every year as in your plan`
            : "";

    const verdict =
        target.reached
            ? `Based on these assumptions your plan may reach the target, with an estimated ${rupees(target.difference)} to spare.`
            : `Based on these assumptions your plan may fall short of the target by an estimated ${rupees(-target.difference)}.`;

    const need =
        target.reached
            ? `Under the same assumptions, a starting SIP of about ${rupees(needed)} a month${stepNote} would be enough. Your plan starts at ${rupees(input.monthlySip)}.`
            : `To reach the target under the same assumptions, you would need a starting SIP of about ${rupees(needed)} a month${stepNote}, compared with ${rupees(input.monthlySip)} in your plan.`;

    return `
                <h3 class="sip-subtitle">
                    Your target
                </h3>

                <div class="sip-compare sip-compare--single">

                    ${compareCard({
                        id: "sip-target-card",
                        title: target.reached ? "Target may be reached" : "Target may be missed",
                        tag: "Under the assumptions above",
                        rows: [
                            ["Target", rupees(target.amount)],
                            ["Estimated value", rupees(plan.estimatedValue)],
                            [target.reached ? "Estimated surplus" : "Estimated shortfall", rupees(Math.abs(target.difference))],
                            ["Starting SIP needed", `${rupees(needed)} a month`]
                        ]
                    })}

                </div>

                <p class="sip-note sip-note--plain">
                    ${escapeHTML(verdict)} ${escapeHTML(need)}
                </p>`;

}

function chartSection(
    result
) {

    return `
                <h3 class="sip-subtitle">
                    Invested compared with estimated value
                </h3>

                <figure class="sip-figure">

                    ${buildChartSvg(result)}

                    <ul class="sip-legend">
                        <li>
                            <span class="sip-legend__swatch sip-legend__swatch--invested" aria-hidden="true"></span>
                            Total invested (dashed line, square end)
                        </li>
                        <li>
                            <span class="sip-legend__swatch sip-legend__swatch--value" aria-hidden="true"></span>
                            Estimated value (solid line, round end)
                        </li>
                    </ul>

                    <figcaption class="sip-note sip-note--plain">
                        ${escapeHTML(chartSummary(result))}
                        The table below gives the same figures year by year.
                    </figcaption>

                </figure>`;

}

function yearlyTable(
    result
) {

    const label =
        "Year by year: what you invest and the estimated value";

    return `
                <h3 class="sip-subtitle">
                    Year by year
                </h3>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="${label}"
                >

                    <table class="calculator-results__table sip-table">

                        <caption class="sip-sr-only">
                            ${label}, at the end of each year.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Year</th>
                                <th scope="col">Monthly SIP</th>
                                <th scope="col">Total invested</th>
                                <th scope="col">Estimated value</th>
                                <th scope="col">Estimated growth</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${result.yearly.map(
                                row => `
                            <tr>
                                <th scope="row">${monthsLabel(row)}</th>
                                <td>${rupees(row.monthlySip)}</td>
                                <td>${rupees(row.invested)}</td>
                                <td>${rupees(row.value)}</td>
                                <td>${rupees(row.growth)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>

                <p class="sip-note">
                    Figures are projections at the return you assumed, with
                    each SIP invested at the start of the month. The last
                    row is the end of the investment period, so its estimated
                    value is the result above.
                </p>`;

}

function printSummary(
    result
) {

    const {
        input
    } = result;

    const rows = [
        [
            "Monthly SIP",
            input.stepUp > 0
                ? `${rupees(input.monthlySip)}, raised by ${rate(input.stepUp)} a year`
                : rupees(input.monthlySip)
        ],
        ["Assumed annual return", `${rate(input.annualReturn)} a year`],
        ["Investment period", formatDuration(input.months)]
    ];

    if (input.target !== null) {
        rows.push(["Target", rupees(input.target)]);
    }

    return `
                <div class="sip-print-only sip-print-summary">

                    <p class="sip-print-brand">
                        ToolZen Hub &middot; ${escapeHTML(TITLE)}
                    </p>

                    <dl class="sip-print-inputs">
                        ${rows.map(
                            ([label, value]) => `
                        <div>
                            <dt>${escapeHTML(label)}</dt>
                            <dd>${escapeHTML(value)}</dd>
                        </div>`
                        ).join("")}
                    </dl>

                </div>`;

}

function renderResults(
    result
) {

    const {
        plan,
        input
    } = result;

    const metrics = [

        resultMetric({
            label: "Estimated value",
            value: rupees(plan.estimatedValue),
            primary: true
        }),

        resultMetric({
            label: "Total invested",
            value: rupees(plan.totalInvested)
        }),

        resultMetric({
            label: "Estimated growth",
            value: rupees(plan.estimatedGrowth)
        }),

        input.stepUp > 0
            ? resultMetric({
                label: "Monthly SIP in the last year",
                value: rupees(plan.finalMonthlySip)
            })
            : resultMetric({
                label: "Multiple of your investment",
                value: `${formatNumber(plan.multiple, 2)} times`
            })

    ].join("");

    const lines = [

        `Based on these assumptions, investing ${rupees(input.monthlySip)} a month${input.stepUp > 0 ? `, raised by ${rate(input.stepUp)} every year,` : ""} for ${formatDuration(input.months)} at an assumed return of ${rate(input.annualReturn)} a year could grow to an estimated ${rupees(plan.estimatedValue)}.`,

        plan.estimatedGrowth < 0.5
            ? `At an assumed return of 0% the estimated value equals the ${rupees(plan.totalInvested)} you would invest.`
            : `You would invest ${rupees(plan.totalInvested)} in total. The other ${rupees(plan.estimatedGrowth)} is estimated growth, and it depends entirely on the return you assume.`

    ];

    if (input.stepUp > 0) {

        lines.push(
            `The monthly SIP starts at ${rupees(input.monthlySip)} and reaches ${rupees(plan.finalMonthlySip)} in the last year.`
        );

    }

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Projection
                    </span>

                    <h2 class="calculator-results__title">
                        Your SIP projection
                    </h2>

                </div>

                ${printSummary(result)}

                <div class="calculator-results__grid">
                    ${metrics}
                </div>

                <div class="calculator-results__summary">
                    ${lines.map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="sip-note sip-note--trust">
                    <strong>Projection, not a forecast.</strong>
                    The return is an assumption you entered. Returns are
                    not guaranteed, can be lower than assumed and can be
                    negative, and investments are subject to market risk.
                    Taxes, fund charges, exit loads and inflation are not
                    included. This is not investment advice.
                </div>

                ${scenariosSection(result)}

                ${targetSection(result)}

                ${chartSection(result)}

                ${yearlyTable(result)}

                <div class="sip-actions">

                    <button
                        type="button"
                        id="sip-print"
                        class="calculator-form__button calculator-form__button--secondary sip-action"
                    >
                        Print Summary
                    </button>

                </div>

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
        plan,
        target
    } = result;

    const base =
        `The estimated value is ${rupees(plan.estimatedValue)} for ${rupees(plan.totalInvested)} invested, based on your assumed return.`;

    if (!target) {
        return base;
    }

    return target.reached
        ? `${base} The plan may reach your target.`
        : `${base} The plan may fall short of your target.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from the
   default values, so the page can never disagree with it.
========================================================= */

function exampleValues(
    over = {}
) {

    return {
        monthlySip: DEFAULTS.monthlySip,
        annualReturn: DEFAULTS.annualReturn,
        months: DEFAULTS.years * 12 + DEFAULTS.months,
        stepUp: 0,
        target: null,
        ...over
    };

}

function exampleParagraph() {

    const plain =
        calculateSip(exampleValues({ target: 10000000 }));

    const stepped =
        calculateSip(exampleValues({ stepUp: 10, target: 10000000 }));

    const [lower, , higher] = plain.scenarios;

    return `Take ${rupees(DEFAULTS.monthlySip)} a month, an assumed return of ${DEFAULTS.annualReturn}% a year and ${DEFAULTS.years} years. You would invest ${rupees(plain.plan.totalInvested)} and the estimated value would be ${rupees(plain.plan.estimatedValue)}, of which ${rupees(plain.plan.estimatedGrowth)} is estimated growth. If the return you assume is ${lower.rate}% or ${higher.rate}% instead, the estimated value is ${rupees(lower.value)} or ${rupees(higher.value)}. If you raise the SIP by 10% every year you would invest ${rupees(stepped.plan.totalInvested)} and the estimated value would be ${rupees(stepped.plan.estimatedValue)}. To aim for ${rupees(10000000)} at ${DEFAULTS.annualReturn}%, the starting SIP would need to be about ${rupees(Math.ceil(plain.target.requiredStartingSip))} a month, or about ${rupees(Math.ceil(stepped.target.requiredStartingSip))} with a 10% yearly step-up.`;

}


/* =========================================================
   RENDER
========================================================= */

/* two number fields (years and months) that make up the period */

function periodFields() {

    return `
                            <fieldset
                                class="sip-tenure"
                                aria-describedby="sip-period-hint"
                            >

                                <legend class="calculator-form__label">
                                    Investment Period
                                </legend>

                                <div class="sip-pair">

                                    ${numberField({
                                        id: IDS.years,
                                        label: "Years",
                                        min: L.years.min,
                                        max: L.years.max,
                                        step: 1,
                                        value: DEFAULTS.years
                                    })}

                                    ${numberField({
                                        id: IDS.months,
                                        label: "Months",
                                        min: L.months.min,
                                        max: L.months.max,
                                        step: 1,
                                        value: DEFAULTS.months
                                    })}

                                </div>

                                <span
                                    class="calculator-form__help"
                                    id="sip-period-hint"
                                >
                                    How long you plan to invest, for example 15 years and 6 months.
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
                        Estimate what a monthly SIP could grow to for a
                        return you assume, with a yearly step-up, return
                        scenarios and a target.
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
                    Project Your SIP
                </div>

                <p class="calculator-section__description">
                    Enter what you plan to invest each month and the
                    return you want to assume. Results update as you type.
                </p>

                <form
                    id="sip-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid">

                        ${numberField({
                            id: IDS.monthlySip,
                            label: "Monthly SIP Amount",
                            unit: "₹",
                            hint: "What you invest at the start of each month (in the first year, if you add a step-up).",
                            min: L.monthlySip.min,
                            max: L.monthlySip.max,
                            step: 100,
                            value: DEFAULTS.monthlySip
                        })}

                        ${numberField({
                            id: IDS.annualReturn,
                            label: "Assumed Annual Return",
                            unit: "% a year",
                            hint: "An assumption you control, not a forecast. 10% is only an example; try a range.",
                            min: L.rate.min,
                            max: L.rate.max,
                            step: 0.1,
                            value: DEFAULTS.annualReturn
                        })}

                        ${periodFields()}

                        ${numberField({
                            id: IDS.stepUp,
                            label: "Yearly Step-Up (optional)",
                            unit: "% a year",
                            hint: "Raise the monthly SIP by this percentage once a year. 0 keeps it the same.",
                            min: L.stepUp.min,
                            max: L.stepUp.max,
                            step: 0.5,
                            value: DEFAULTS.stepUp,
                            required: false
                        })}

                        ${numberField({
                            id: IDS.target,
                            label: "Target Amount (optional)",
                            unit: "₹",
                            hint: "Leave blank to skip. If you enter one, you see whether the plan may reach it and the starting SIP it would need.",
                            min: L.target.min,
                            max: L.target.max,
                            step: 10000,
                            value: DEFAULTS.target,
                            required: false
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="sip-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="sip-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="sip-live"
                class="sip-sr-only"
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
                        Enter the amount you plan to invest each month.
                    </li>
                    <li>
                        Enter a return to assume, and how long you plan to invest.
                    </li>
                    <li>
                        Optionally add a yearly step-up, and a target amount.
                    </li>
                    <li>
                        Read the projection. It updates as you change any value.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Projection
                </h2>

                <p>
                    <strong>Your money and estimated growth are different
                    things.</strong> The total invested is what you put in.
                    The estimated growth is what the return you assume would
                    add, so it moves whenever the assumption does.
                </p>

                <p>
                    <strong>One return is not an answer.</strong> The
                    scenarios show the same plan at a lower and a higher
                    return, so you can see how much the result depends on
                    the number you chose.
                </p>

                <p>
                    <strong>A step-up changes more than it looks.</strong>
                    Raising the SIP a little each year adds to both what you
                    invest and what the plan is estimated to reach.
                </p>

                <p>
                    <strong>A target turns it into a question.</strong> If
                    you enter one, the calculator shows whether the plan may
                    reach it and the starting SIP that would be needed under
                    the same assumptions.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        The return is an assumption you enter. It is applied
                        evenly every month as the annual return divided by
                        12. Real returns vary, can be lower than assumed and
                        can be negative.
                    </li>
                    <li>
                        Each SIP is invested at the start of the month and
                        every instalment is made. The estimated value is read
                        at the end of the last month.
                    </li>
                    <li>
                        A step-up raises the monthly SIP once a year, starting
                        in the 13th month.
                    </li>
                    <li>
                        Taxes, fund charges, exit loads and inflation are not
                        included.
                    </li>
                    <li>
                        Calculators can use different conventions, so another
                        calculator's figure may differ slightly.
                    </li>
                </ul>

                <p>
                    This is a projection for understanding, not a forecast,
                    not a guarantee and not investment advice. Investments
                    are subject to market risk, and ToolZen Hub does not
                    recommend any investment. See the
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
                    How the Projection Is Calculated
                </h2>

                <p>
                    Each month, the SIP is added and the balance then grows
                    by one month of the assumed return:
                </p>

                <p>
                    balance = (balance + SIP) × (1 + r)
                </p>

                <p>
                    r is the assumed annual return divided by 12. The
                    estimated value is the balance after the last month. The
                    total invested is the sum of all the SIPs, and the
                    estimated growth is the difference. With a step-up, the
                    SIP is raised in the 13th, 25th and every later 12th
                    month.
                </p>

                <p>
                    Because every SIP scales with the starting amount, the
                    starting SIP a target needs is the target divided by the
                    value that a starting SIP of ₹1 would reach under the
                    same return, period and step-up.
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
                        Actual returns can be lower, higher or negative.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does the calculator show other returns?
                    </summary>
                    <p>
                        A single return can look like the answer. Showing the
                        same plan at a lower and a higher return makes it
                        clear how much the estimated value depends on the
                        assumption.
                    </p>
                </details>

                <details>
                    <summary>
                        What is a step-up SIP?
                    </summary>
                    <p>
                        A SIP whose monthly amount is raised by a fixed
                        percentage once a year. A 10% step-up on ₹10,000
                        means ₹10,000 in year 1, ₹11,000 in year 2 and
                        ₹12,100 in year 3.
                    </p>
                </details>

                <details>
                    <summary>
                        How is the SIP needed for a target worked out?
                    </summary>
                    <p>
                        The projection scales with the starting SIP, so the
                        starting SIP needed is the target divided by what a
                        ₹1 SIP would reach with the same return, period and
                        step-up. It is an estimate based on your assumptions.
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
   Binds the fields, the live results, reset and print.
========================================================= */

export function init() {

    const form =
        document.querySelector("#sip-form");

    const results =
        document.querySelector("#sip-results");

    const live =
        document.querySelector("#sip-live");

    const resetButton =
        document.querySelector("#sip-reset");

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

        /* a required field that is still empty is not an error yet */

        if (
            Object.entries(raw).some(
                ([name, value]) =>
                    !OPTIONAL.includes(name) &&
                    String(value).trim() === ""
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
            validateSipInputs(raw);

        if (!check.ok) {

            const names =
                new Set(
                    check.errors.flatMap(
                        error =>
                            error.fields
                    )
                );

            setFieldsInvalid(
                [...names].map(
                    name =>
                        inputs[name]
                ),
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
            calculateSip(check.values);

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

    results.addEventListener(
        "click",
        event => {

            if (event.target.closest("#sip-print")) {

                window.print();

            }

        }
    );

    resetButton?.addEventListener(
        "click",
        () => {

            for (const [name, value] of Object.entries(DEFAULTS)) {
                inputs[name].value = value;
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
