/* =========================================================
   ToolZen Hub
   CAGR Calculator

   For anyone who wants the yearly growth rate that connects a
   starting value and an ending value over a period: looking back
   at a value that happened, or looking ahead at a value they want.
   It also shows how the CAGR differs from total growth divided by
   the years, and can set a second investment beside the first.

   THIS DESCRIBES TWO VALUES AND A PERIOD. It is not a forecast, a
   fund comparison or XIRR, and it says plainly, next to the result,
   what it assumes and what it leaves out. It never calls a rate
   good, expected or achievable.

   The maths is in formulas/cagr.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateCagr,
    validateCagrInputs,
    percentText,
    multipleText,
    CAGR_LIMITS
} from "../formulas/cagr.js";

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
    getCalculatorById("cagr").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    start: "cagr-start",
    end: "cagr-end",
    years: "cagr-years",
    months: "cagr-months",
    bEnd: "cagr-b-end",
    bStart: "cagr-b-start",
    bYears: "cagr-b-years",
    bMonths: "cagr-b-months"
};

const MODE_NAME = "cagr-mode";

const MODES = {
    back: "Looking back",
    ahead: "Looking ahead"
};

const ERROR_ID =
    "cagr-results-error";

const DEFAULTS = {
    mode: "back",
    start: 100000,
    end: 180000,
    years: 5,
    months: 0,
    bEnd: "",
    bStart: "",
    bYears: "",
    bMonths: ""
};

/* the wording that changes with the mode */
const END_LABEL = { back: "Ending Value", ahead: "Target Value" };
const END_HINT = {
    back: "The value at the end, including anything you count as part of it.",
    ahead: "The value you want to reach."
};
const PRIMARY_LABEL = { back: "CAGR", ahead: "Required CAGR" };
const B_END_LABEL = { back: "Investment B Ending Value", ahead: "Investment B Target Value" };

const EMPTY_MESSAGE =
    "Enter a starting value, an ending value and a period to see the yearly growth rate that connects them.";

const AMOUNT_MIN = CAGR_LIMITS.valuePaise.min / 100;
const AMOUNT_MAX = CAGR_LIMITS.valuePaise.max / 100;


/* =========================================================
   WORDING HELPERS
========================================================= */

const rupeeFormatter =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

/* money arrives as whole paise; whole rupees show without paise */
const rupees = (paise) => rupeeFormatter.format(paise / 100);

const signedRupees = (paise) =>
    paise === 0
        ? rupees(0)
        : `${paise > 0 ? "+" : "−"}${rupees(Math.abs(paise))}`;

const pct = (fraction) => {
    const text = percentText(fraction);
    return `${text.startsWith("-") ? "−" : ""}${text.replace("-", "")}%`;
};

const signedPoints = (fraction) => {
    const text = percentText(fraction);
    if (text === "0.00") {
        return "0.00 points";
    }
    return `${text.startsWith("-") ? "−" : "+"}${text.replace("-", "")} points`;
};

const times = (ratio) => `${multipleText(ratio)}×`;

const signedTimes = (ratio) => {
    const text = multipleText(Math.abs(ratio));
    if (text === "0.00") {
        return "0.00×";
    }
    return `${ratio > 0 ? "+" : "−"}${text}×`;
};

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

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

/* the years behind a divisor, as a plain number: 5, 5.5, 5.25 */
const yearsNumber = (months) => `${Number((months / 12).toFixed(4))}`;


/* =========================================================
   RESULTS (HTML)
========================================================= */

function summaryLines(
    result
) {

    const {
        mode,
        startPaise,
        endPaise,
        months,
        cagr,
        totalGrowth
    } = result;

    const lines = [];

    if (mode === "ahead") {

        lines.push(
            `To grow ${rupees(startPaise)} to ${rupees(endPaise)} over ${durationText(months)}, the mathematical CAGR required is about ${pct(cagr)}. That is the yearly rate that connects the two values; it says nothing about whether it will happen.`
        );

    } else {

        const verb =
            endPaise === startPaise
                ? "staying at"
                : endPaise > startPaise ? "growing to" : "falling to";

        lines.push(
            `${rupees(startPaise)} ${verb} ${rupees(endPaise)} over ${durationText(months)} corresponds to a CAGR of ${endPaise === startPaise ? "0.00%" : `about ${pct(cagr)}`}.`
        );

    }

    lines.push(
        `Total growth is ${pct(totalGrowth)}. Dividing that by ${yearsNumber(months)} years gives ${pct(result.simpleYearly)} (the simple yearly average), which does not account for compounding, so it differs from the CAGR.`
    );

    return lines;

}

function comparisonSection(
    result
) {

    if (!result.caseB) {
        return "";
    }

    const { mode, caseB: b, comparison: d } = result;

    const rows = [
        ["Starting value", rupees(result.startPaise), rupees(b.startPaise), signedRupees(d.startPaise)],
        [mode === "ahead" ? "Target value" : "Ending value", rupees(result.endPaise), rupees(b.endPaise), signedRupees(d.endPaise)],
        ["Period", durationText(result.months), durationText(b.months), signedDuration(d.months)],
        ["Total growth", pct(result.totalGrowth), pct(b.totalGrowth), signedPoints(d.totalGrowth)],
        ["Growth multiple", times(result.multiple), times(b.multiple), signedTimes(d.multiple)],
        ["Simple yearly average", pct(result.simpleYearly), pct(b.simpleYearly), signedPoints(d.simpleYearly)],
        [PRIMARY_LABEL[mode], pct(result.cagr), pct(b.cagr), signedPoints(d.cagr)]
    ];

    const periodNote =
        d.months === 0
            ? ""
            : `
                <p class="cagr-note cagr-note--period">
                    <strong>The periods differ.</strong>
                    The CAGR puts the two cases on a yearly footing, but it says
                    nothing about what either did outside its own period or how the
                    money was used.
                </p>`;

    return `
                <h3 class="cagr-subtitle">
                    How the two cases compare
                </h3>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="Investment A and Investment B side by side: values, period, total growth, growth multiple, simple yearly average and CAGR, with the difference"
                >

                    <table class="calculator-results__table cagr-table">

                        <caption class="cagr-sr-only">
                            Investment A and Investment B on a yearly footing, with the difference between them (Investment B minus Investment A).
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Measure</th>
                                <th scope="col">Investment A</th>
                                <th scope="col">Investment B</th>
                                <th scope="col">Difference (B − A)</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${rows.map(
                                ([label, a, bv, diff]) => `
                            <tr>
                                <th scope="row">${escapeHTML(label)}</th>
                                <td>${escapeHTML(a)}</td>
                                <td>${escapeHTML(bv)}</td>
                                <td>${escapeHTML(diff)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>
                ${periodNote}

                <p class="cagr-note">
                    The table states the differences between the numbers you entered; it does not rank the two cases or say which is the better investment.
                </p>`;

}

function renderResults(
    result
) {

    const { mode } = result;

    const metrics = [
        resultMetric({ label: PRIMARY_LABEL[mode], value: pct(result.cagr), primary: true }),
        resultMetric({ label: "Total growth", value: pct(result.totalGrowth) }),
        resultMetric({ label: "Growth multiple", value: times(result.multiple) }),
        resultMetric({ label: "Simple yearly average", value: pct(result.simpleYearly) })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        ${mode === "ahead" ? "The yearly rate the target needs" : "The compound annual growth rate"}
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="cagr-note cagr-note--trust">
                    <strong>Two values and a period, nothing more.</strong>
                    CAGR assumes one starting value and one ending value, with
                    no money added or withdrawn along the way. It is the
                    constant yearly rate that would connect the two values;
                    the actual year-by-year path may have been very
                    different, and a past CAGR does not mean the same rate
                    will happen again. Not included: regular investing
                    (a SIP is not a lump sum) and XIRR, fees, tax, inflation,
                    and dividends unless they are already in the ending value.
                    This is a calculation, not a forecast or advice.
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

    return `${PRIMARY_LABEL[result.mode]} ${pct(result.cagr)}; total growth ${pct(result.totalGrowth)}.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from fixed
   example values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const run = (start, end, years) =>
        calculateCagr({ mode: "back", startPaise: start * 100, endPaise: end * 100, months: years * 12 });

    const a = run(100000, 180000, 5);
    const b = run(100000, 240000, 9);

    return `Take ${rupees(10000000)} growing to ${rupees(18000000)} over 5 years. The total growth is ${pct(a.totalGrowth)}, the growth multiple is ${times(a.multiple)}, and the CAGR is ${pct(a.cagr)}. Dividing the total growth by 5 gives ${pct(a.simpleYearly)} (the simple yearly average), which is higher because it ignores compounding. Now compare ${rupees(10000000)} growing to ${rupees(24000000)} over 9 years: the total growth is larger, ${pct(b.totalGrowth)}, but the CAGR is ${pct(b.cagr)}, lower than ${pct(a.cagr)}, because the growth took longer.`;

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
    values,
    optional = false
}) {

    return `
                        <fieldset
                            class="cagr-period"
                            aria-describedby="${hintId}"
                        >

                            <legend class="calculator-form__label">
                                ${legend}
                            </legend>

                            <div class="cagr-pair">

                                ${numberField({
                                    id: ids.years,
                                    label: "Years",
                                    min: 0,
                                    max: CAGR_LIMITS.years.max,
                                    step: 1,
                                    value: values.years,
                                    required: !optional
                                })}

                                ${numberField({
                                    id: ids.months,
                                    label: "Months",
                                    min: CAGR_LIMITS.months.min,
                                    max: CAGR_LIMITS.months.max,
                                    step: 1,
                                    value: values.months,
                                    required: !optional
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

function modeControl() {

    return `
                    <fieldset
                        class="cagr-mode"
                        aria-describedby="cagr-mode-hint"
                    >

                        <legend class="calculator-form__label">
                            What You Know
                        </legend>

                        <div class="cagr-mode__options">

                            ${Object.entries(MODES).map(
                                ([value, label]) => `
                            <label class="cagr-mode__option">
                                <input
                                    type="radio"
                                    name="${MODE_NAME}"
                                    value="${value}"${value === DEFAULTS.mode ? " checked" : ""}
                                >
                                <span>${escapeHTML(label)}</span>
                            </label>`
                            ).join("")}

                        </div>

                        <span
                            class="calculator-form__help"
                            id="cagr-mode-hint"
                        >
                            Looking back: you know the ending value. Looking ahead: you want to reach a target value.
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
                        Find the yearly growth rate that connects a starting
                        and an ending value over a period, see how it differs
                        from a simple average, and compare two investments on
                        the same yearly footing.
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
                    Find the Growth Rate
                </div>

                <p class="calculator-section__description">
                    Enter the values and the period. Results update as you
                    type.
                </p>

                <form
                    id="cagr-form"
                    class="calculator-form"
                    novalidate
                >

                    ${modeControl()}

                    <div class="calculator-form__grid cagr-main">

                        ${numberField({
                            id: IDS.start,
                            label: "Starting Value",
                            unit: "₹",
                            hint: "The value at the start, in one amount.",
                            min: AMOUNT_MIN,
                            max: AMOUNT_MAX,
                            step: 1000,
                            value: DEFAULTS.start
                        })}

                        ${numberField({
                            id: IDS.end,
                            label: END_LABEL[DEFAULTS.mode],
                            unit: "₹",
                            hint: END_HINT[DEFAULTS.mode],
                            min: AMOUNT_MIN,
                            max: AMOUNT_MAX,
                            step: 1000,
                            value: DEFAULTS.end
                        })}

                        ${periodFields({
                            legend: "Period",
                            ids: { years: IDS.years, months: IDS.months },
                            hintId: "cagr-period-hint",
                            hint: "A whole period of at least one year, for example 5 years and 6 months.",
                            values: { years: DEFAULTS.years, months: DEFAULTS.months }
                        })}

                    </div>


                    <!-- INVESTMENT B -->

                    <div class="cagr-more">

                        <h3 class="cagr-more__title">
                            Compare With Another Investment (optional)
                        </h3>

                        <p class="cagr-more__text">
                            Enter a second ending value to compare two cases. A
                            blank starting value or period uses the first case's.
                            Leave the ending value blank to skip.
                        </p>

                        <div class="calculator-form__grid">

                            ${numberField({
                                id: IDS.bEnd,
                                label: "Investment B Ending Value",
                                unit: "₹",
                                hint: "Leave blank to skip the comparison.",
                                min: AMOUNT_MIN,
                                max: AMOUNT_MAX,
                                step: 1000,
                                value: DEFAULTS.bEnd,
                                required: false
                            })}

                            ${numberField({
                                id: IDS.bStart,
                                label: "Investment B Starting Value (optional)",
                                unit: "₹",
                                hint: "Leave blank to use the first case's starting value.",
                                min: AMOUNT_MIN,
                                max: AMOUNT_MAX,
                                step: 1000,
                                value: DEFAULTS.bStart,
                                required: false
                            })}

                            ${periodFields({
                                legend: "Investment B Period (optional)",
                                ids: { years: IDS.bYears, months: IDS.bMonths },
                                hintId: "cagr-b-period-hint",
                                hint: "Leave blank to use the first case's period.",
                                values: { years: DEFAULTS.bYears, months: DEFAULTS.bMonths },
                                optional: true
                            })}

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="cagr-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="cagr-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="cagr-live"
                class="cagr-sr-only"
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
                        Choose Looking back if you know the ending value, or
                        Looking ahead if you have a target value.
                    </li>
                    <li>
                        Enter the starting value, the ending or target value,
                        and the period in years and months.
                    </li>
                    <li>
                        Read the CAGR, the total growth, the growth multiple
                        and the simple yearly average. Results update as you
                        change any value.
                    </li>
                    <li>
                        To compare a second case, enter its ending value under
                        Compare With Another Investment.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>The CAGR</strong> is the single yearly rate that,
                    compounded each year, would turn the starting value into
                    the ending value over the period.
                </p>

                <p>
                    <strong>The simple yearly average</strong> is the total
                    growth divided by the number of years, nothing more. It
                    ignores compounding, so for growth it is higher than the
                    CAGR, and the gap widens with the period.
                </p>

                <p>
                    <strong>Looking ahead</strong> uses the same formula with
                    a target. The result is the yearly rate that
                    mathematically connects the two values. It does not say the
                    target is likely or achievable.
                </p>

                <p>
                    <strong>Comparing two cases.</strong> The CAGR puts cases
                    with different periods on a yearly footing. A larger total
                    gain over a longer period can have a lower yearly rate.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        One starting value and one ending value, with no money
                        added or withdrawn during the period.
                    </li>
                    <li>
                        A constant yearly rate is the mathematical equivalent
                        between the two values. The actual year-by-year path
                        may have been very different.
                    </li>
                    <li>
                        A past CAGR does not mean the same rate will happen
                        again.
                    </li>
                    <li>
                        Not included: regular investing (a SIP is not a lump
                        sum) and XIRR, fees, tax, inflation, and dividends
                        unless they are already in the ending value.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not advice or
                    a forecast. See the <a href="${ROUTES.disclaimer}">disclaimer</a>.
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
                    CAGR = (ending value ÷ starting value)<sup>1 ÷ years</sup> − 1,
                    where the years are the months divided by 12.
                </p>

                <p>
                    Total growth = (ending − starting) ÷ starting. Growth
                    multiple = ending ÷ starting. Simple yearly average = total
                    growth ÷ years.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Why is the CAGR lower than the total growth divided by the years?
                    </summary>
                    <p>
                        Dividing the total growth by the years spreads it
                        evenly without compounding. The CAGR is the equal yearly
                        rate that compounds to the same ending value, and that
                        rate is lower than the simple division.
                    </p>
                </details>

                <details>
                    <summary>
                        Can I use it for a SIP or other regular investments?
                    </summary>
                    <p>
                        No. CAGR assumes one starting value and one ending
                        value with nothing added or withdrawn. Regular
                        investments need a different measure, and this
                        calculator does not provide one.
                    </p>
                </details>

                <details>
                    <summary>
                        What does Looking ahead tell me?
                    </summary>
                    <p>
                        It gives the yearly rate that mathematically connects
                        the starting value and the target over the period. It
                        does not say the rate will occur or that the target is
                        achievable.
                    </p>
                </details>

                <details>
                    <summary>
                        What can I compare with Investment B?
                    </summary>
                    <p>
                        A second starting value, ending value and period. A
                        blank starting value or period uses the first case's.
                        The table states the differences and does not rank the
                        two.
                    </p>
                </details>

                <details>
                    <summary>
                        Why must the period be at least a year?
                    </summary>
                    <p>
                        A rate worked out over less than a year is stretched
                        to a full year and can be misleading, so this
                        calculator starts at one year.
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
        document.querySelector("#cagr-form");

    const results =
        document.querySelector("#cagr-results");

    const live =
        document.querySelector("#cagr-live");

    const resetButton =
        document.querySelector("#cagr-reset");

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
        [...form.querySelectorAll(`input[name="${MODE_NAME}"]`)];

    const endLabel =
        form.querySelector(`label[for="${IDS.end}"]`);

    const endHint =
        document.getElementById(`${IDS.end}-hint`);

    const bEndLabel =
        form.querySelector(`label[for="${IDS.bEnd}"]`);

    const allInputs =
        Object.values(inputs);

    let announceTimer = null;

    const currentMode = () =>
        radios.find(radio => radio.checked)?.value ?? DEFAULTS.mode;

    /* the ending value is a target when looking ahead */
    function applyModeWording() {

        const mode = currentMode();

        if (endLabel) {
            endLabel.textContent = END_LABEL[mode];
        }

        if (endHint) {
            endHint.textContent = END_HINT[mode];
        }

        if (bEndLabel) {
            bEndLabel.textContent = B_END_LABEL[mode];
        }

    }

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

        applyModeWording();

        const raw =
            Object.fromEntries(
                Object.entries(inputs).map(
                    ([name, input]) => [
                        name,
                        input.value
                    ]
                )
            );

        raw.mode = currentMode();

        /* a required field that is still empty is not an error yet; the period is empty only when both parts are */
        const periodEmpty =
            String(raw.years).trim() === "" &&
            String(raw.months).trim() === "";

        if (
            periodEmpty ||
            ["start", "end"].some(
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
            validateCagrInputs(raw);

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
            calculateCagr(check.values);

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
                radio.checked = radio.value === DEFAULTS.mode;
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
