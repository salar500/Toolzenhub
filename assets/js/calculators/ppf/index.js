/* =========================================================
   ToolZen Hub
   PPF Calculator (Investment)

   An estimate of what a Public Provident Fund account could hold
   after a number of financial years, from a yearly or a monthly
   deposit and an interest rate the visitor enters. The model, its
   exact assumptions, the limits and the validation are in
   formulas/ppf.js; this file is the page around them and repeats
   none of it. The approved specification is
   docs/tool-packs/26-ppf-calculator.md.

   - Results appear when the visitor presses Calculate. Editing a
     field afterwards marks the result as out of date until it is
     calculated again; the page never shows a figure for inputs it
     was not calculated from.
   - The rate is the visitor's. The page shows no current PPF rate,
     and the 7.1 it starts with is labelled an example.
   - The assumptions are always shown beside the result, with the
     April opening and the rounding disclosure in plain view.
   - Every year is a projection. The page says which years are the
     end of the first term or of an extension block and which are not
     dates on which the account can be closed in full.
   - Everything is calculated in the browser. Nothing is stored, sent
     or put in the address. Values are written as escaped text.
========================================================= */

import {
    PPF_LIMITS,
    PPF_PATTERNS,
    validatePpfInputs,
    calculatePpf,
    comparePpfPatterns,
    toDisplay
} from "../formulas/ppf.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    formatINR
} from "../common/formatter.js";

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


const TITLE =
    getCalculatorById("ppf").title;

const IDS = {
    yearly: "ppf-yearly",
    monthly: "ppf-monthly",
    rate: "ppf-rate",
    years: "ppf-years"
};

const PATTERN_NAME = "ppf-pattern";

const ERROR_ID = "ppf-error";

/* the starting values; the rate is labelled an example wherever it appears */
const DEFAULTS = Object.freeze({
    pattern: PPF_PATTERNS.yearly,
    yearly: "150000",
    monthly: "12500",
    rate: "7.1",
    years: String(PPF_LIMITS.years.default)
});

const EMPTY_MESSAGE =
    "Check the values above, then press Calculate.";

const STALE_MESSAGE =
    "The inputs have changed since this result was worked out. Press Calculate to update it.";

const ROUNDING_NOTE =
    "Rounded to whole rupees. Actual credited balances can differ because of how interest is rounded in practice, which this tool does not claim to know, and because of other rules that apply to your account.";

const rupees = (value) => formatINR(value);

const plainRate = (rate) => `${Number(rate)}%`;


/* =========================================================
   WORDS FOR WHAT A YEAR IS (the engine says which kind; the
   wording belongs to the page)
========================================================= */

const KIND_LABEL = Object.freeze({
    "before-maturity": "Before maturity",
    "first-term-end": "First term ends: earliest full closure",
    "inside-extension-block": "Inside an extension block (projection)",
    "extension-block-end": "End of an extension block (if extended)"
});

function yearSentence(kind, year) {

    switch (kind) {

        case "before-maturity":
            return `Year ${year} is before maturity. The balance is a projection: the account cannot be closed in full yet, and the Scheme's withdrawal, loan and early-closure rules are not modelled here.`;

        case "first-term-end":
            return `Year ${year} is the end of the first term for an account opened in April: 15 years after the end of the financial year of opening. It is the earliest date on which the Scheme allows the account to be closed in full.`;

        case "extension-block-end":
            return `Year ${year} is the end of an extension block. This assumes the account was extended with deposits in five-year blocks, which is the holder's option and not something this tool can know. The rate for these years is unknown.`;

        default:
            return `Year ${year} falls inside an extension block. It is a projection that assumes the account is extended with deposits, not a date on which the account can be closed in full. The rate for these years is unknown.`;

    }

}

function depositText(values) {

    return values.pattern === PPF_PATTERNS.monthly
        ? `${rupees(values.monthlyDeposit)} a month, each by the 5th`
        : `${rupees(values.annualDeposit)} in April each year`;

}


/* =========================================================
   RESULTS
========================================================= */

function comparisonBlock(values, comparison, years) {

    if (!comparison.eligible) {

        return `
                <p class="ppf-note">
                    ${escapeHTML("The annual-versus-monthly comparison is shown when the yearly total can be split into twelve whole-₹50 monthly deposits, which means a multiple of ₹600. This total cannot.")}
                </p>`;

    }

    const gap = comparison.displayDifference;

    const sentence = gap === 0
        ? `After ${years} years the two schedules end at the same whole-rupee balance. They are still different deposit schedules, not the same investment, and this is not advice about when to deposit.`
        : `Depositing ${rupees(comparison.annualDeposit)} in April each year gives about ${rupees(Math.abs(gap))} ${gap > 0 ? "more" : "less"} after ${years} years than depositing ${rupees(comparison.monthlyDeposit)} a month, because the money is in the account for ${gap > 0 ? "more" : "fewer"} months. These are different deposit schedules, not the same investment, and this is not advice about when to deposit.`;

    return `
                <h3 class="ppf-subtitle">
                    Annual versus monthly, for the same yearly total
                </h3>

                <div class="calculator-results__grid ppf-compare-grid">
                    ${resultMetric({
                        label: `${rupees(comparison.annualDeposit)} in April each year`,
                        value: rupees(comparison.yearly.balance)
                    })}
                    ${resultMetric({
                        label: `${rupees(comparison.monthlyDeposit)} a month, each by the 5th`,
                        value: rupees(comparison.monthly.balance)
                    })}
                    ${resultMetric({
                        label: `Difference after ${years} years`,
                        value: rupees(Math.abs(gap))
                    })}
                </div>

                <p class="ppf-note ppf-note--plain">
                    ${escapeHTML(sentence)}
                </p>`;

}

function tableBlock(display) {

    const rows = display.rows.map((row) => `
                            <tr>
                                <th scope="row">${row.year}</th>
                                <td>${escapeHTML(KIND_LABEL[row.kind])}</td>
                                <td>${escapeHTML(rupees(row.openingBalance))}</td>
                                <td>${escapeHTML(rupees(row.deposits))}</td>
                                <td>${escapeHTML(rupees(row.interest))}</td>
                                <td>${escapeHTML(rupees(row.closingBalance))}</td>
                            </tr>`).join("");

    return `
                <details class="ppf-table-details" id="ppf-table-details">

                    <summary>
                        Year-by-year table (${display.rows.length} ${display.rows.length === 1 ? "year" : "years"})
                    </summary>

                    <div
                        class="calculator-results__table-wrapper"
                        role="region"
                        tabindex="0"
                        aria-label="Year-by-year balance: opening balance, deposits, interest added at the end of the year and closing balance, with what each year is"
                    >

                        <table class="calculator-results__table ppf-table">

                            <caption class="ppf-sr-only">
                                Each financial year: the opening balance, the deposits, the interest added at the end of the year and the closing balance, in whole rupees. Every row is a projection.
                            </caption>

                            <thead>
                                <tr>
                                    <th scope="col">Year</th>
                                    <th scope="col">What this year is</th>
                                    <th scope="col">Opening balance</th>
                                    <th scope="col">Deposits</th>
                                    <th scope="col">Interest added at year-end</th>
                                    <th scope="col">Closing balance</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>

                        </table>

                    </div>

                </details>`;

}

function renderResults(values, result) {

    const display = toDisplay(result);

    const years = values.years;

    const comparison = comparePpfPatterns(values);

    const lastKind = result.rows[result.rows.length - 1].kind;

    const share = `${display.interestSharePercent.toFixed(1)}%`;

    const rateZero = values.rate === 0
        ? `
                <p class="ppf-note ppf-note--plain">
                    ${escapeHTML("At a rate of 0% there is no interest, so the balance equals what is deposited. PPF rates are above zero; this is a calculation case, not a PPF rate.")}
                </p>`
        : "";

    return `
            <div class="calculator-results__card ppf-result" data-kind="${escapeHTML(lastKind)}">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Estimate
                    </span>

                    <h2 class="calculator-results__title">
                        Estimated balance after ${years} ${years === 1 ? "year" : "years"}
                    </h2>

                </div>

                <p class="ppf-lead">
                    ${escapeHTML(`${depositText(values)} for ${years} financial ${years === 1 ? "year" : "years"}, at the ${plainRate(values.rate)} a year you entered, could grow to about ${rupees(display.balance)}. Of that, about ${rupees(display.interest)} is interest.`)}
                </p>

                <div class="calculator-results__grid">
                    ${resultMetric({ label: `Estimated balance after ${years} ${years === 1 ? "year" : "years"}`, value: rupees(display.balance), primary: true })}
                    ${resultMetric({ label: "Total deposited", value: rupees(display.totalDeposited) })}
                    ${resultMetric({ label: "Interest earned", value: rupees(display.interest) })}
                    ${resultMetric({ label: "Interest share of the balance", value: share })}
                </div>

                <p class="ppf-kind" data-kind="${escapeHTML(lastKind)}">
                    ${escapeHTML(yearSentence(lastKind, years))}
                </p>

                ${rateZero}

                <p class="ppf-note ppf-note--plain">
                    ${escapeHTML(ROUNDING_NOTE)}
                </p>

                ${comparisonBlock(values, comparison, years)}

                ${tableBlock(display)}

            </div>
        `;

}

function announcement(values, result) {

    const display = toDisplay(result);

    return `Estimated balance after ${values.years} ${values.years === 1 ? "year" : "years"}: ${rupees(display.balance)}. Total deposited ${rupees(display.totalDeposited)}, interest earned ${rupees(display.interest)}. These are projections from your inputs.`;

}


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Investment Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Estimate the balance of a Public Provident Fund account
                        from a yearly or monthly deposit, the interest rate you
                        enter and the number of years. It follows the PPF rule
                        that interest is worked out monthly and added once a
                        year. It is a projection from your inputs, not a
                        statement of any account.
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
                    Estimate Your PPF Balance
                </div>

                <p class="calculator-section__description">
                    Choose how you would deposit, then enter the amount, the
                    interest rate that applies to you and the number of
                    financial years. The values you enter are not stored or sent
                    anywhere.
                </p>

                <form
                    id="ppf-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid ppf-grid">

                        <fieldset
                            class="ppf-pattern"
                            aria-describedby="ppf-pattern-hint"
                        >

                            <legend class="calculator-form__label">
                                Deposit Pattern
                            </legend>

                            <div class="ppf-pattern__options">

                                <label class="ppf-pattern__option">
                                    <input
                                        type="radio"
                                        name="${PATTERN_NAME}"
                                        value="${PPF_PATTERNS.yearly}"${DEFAULTS.pattern === PPF_PATTERNS.yearly ? " checked" : ""}
                                    >
                                    <span>Yearly: all in April, by the 5th</span>
                                </label>

                                <label class="ppf-pattern__option">
                                    <input
                                        type="radio"
                                        name="${PATTERN_NAME}"
                                        value="${PPF_PATTERNS.monthly}"${DEFAULTS.pattern === PPF_PATTERNS.monthly ? " checked" : ""}
                                    >
                                    <span>Monthly: every month, by the 5th</span>
                                </label>

                            </div>

                            <span
                                class="calculator-form__help"
                                id="ppf-pattern-hint"
                            >
                                Interest is worked out on the lowest balance after the 5th of each month, so a deposit made by the 5th earns for that month.
                            </span>

                        </fieldset>

                        <div id="ppf-yearly-group">
                            ${numberField({
                                id: IDS.yearly,
                                label: "Yearly Deposit",
                                unit: "₹ a year",
                                hint: "From ₹500 to ₹1,50,000, in multiples of ₹50. The ₹1,50,000 limit covers all your PPF accounts, including one you hold for a minor.",
                                min: PPF_LIMITS.yearlyDeposit.min,
                                max: PPF_LIMITS.yearlyDeposit.max,
                                step: PPF_LIMITS.yearlyDeposit.step,
                                value: DEFAULTS.yearly
                            })}
                        </div>

                        <div id="ppf-monthly-group" hidden>
                            ${numberField({
                                id: IDS.monthly,
                                label: "Monthly Deposit",
                                unit: "₹ a month",
                                hint: "From ₹50 to ₹12,500, in multiples of ₹50, so that twelve deposits stay within ₹1,50,000 a year.",
                                min: PPF_LIMITS.monthlyDeposit.min,
                                max: PPF_LIMITS.monthlyDeposit.max,
                                step: PPF_LIMITS.monthlyDeposit.step,
                                value: DEFAULTS.monthly
                            })}
                        </div>

                        ${numberField({
                            id: IDS.rate,
                            label: "Interest Rate (example)",
                            unit: "% a year",
                            hint: "Enter the rate that applies to you. The Government reviews it every quarter. The 7.1 shown is only an example, not the current rate. From 0 to 15, in steps of 0.1.",
                            min: PPF_LIMITS.rate.min,
                            max: PPF_LIMITS.rate.max,
                            step: PPF_LIMITS.rate.step,
                            value: DEFAULTS.rate
                        })}

                        ${numberField({
                            id: IDS.years,
                            label: "Financial Years of Deposits",
                            unit: "years",
                            hint: "From 1 to 50. 16 is the first term of an account opened in April; other years are projections.",
                            min: PPF_LIMITS.years.min,
                            max: PPF_LIMITS.years.max,
                            step: 1,
                            value: DEFAULTS.years
                        })}

                    </div>

                    <p class="ppf-assumption" id="ppf-april">
                        <strong>Assumes the account is opened in April</strong>,
                        so year 1 is a full financial year of deposits. There is
                        no opening-month setting.
                    </p>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions ppf-actions">

                        <button
                            type="submit"
                            id="ppf-calculate"
                            class="calculator-form__button"
                        >
                            Calculate
                        </button>

                        <button
                            type="button"
                            id="ppf-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <p
                id="ppf-stale"
                class="ppf-stale"
                hidden
            >${escapeHTML(STALE_MESSAGE)}</p>

            <section
                id="ppf-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <!-- the assumptions, always beside the result -->

            <section
                class="ppf-assumptions"
                aria-labelledby="ppf-assumptions-heading"
            >

                <h2 id="ppf-assumptions-heading">
                    What This Estimate Assumes
                </h2>

                <ul>
                    <li>The interest rate you enter stays the same for every year. The Government reviews the PPF rate every quarter, so a real account may differ.</li>
                    <li>Interest for each month is the annual rate divided by 12, applied to the lowest balance between the close of the 5th and the end of the month. That division by 12 is this tool's assumption, not a formula the Scheme states.</li>
                    <li>Interest is added to the account once, at the end of each financial year, so it earns interest from the next year.</li>
                    <li>Every deposit is made on or before the 5th of its month (the yearly pattern: in April).</li>
                    <li>The account is opened in April, so year 1 is a full financial year. An account opened part-way through a year, or deposits made late in March, give different numbers.</li>
                    <li>There are no withdrawals, loans, early closure or missed years, and every year's deposit is within the ₹500 to ₹1,50,000 limit, which covers all your PPF accounts. The tool cannot see your other accounts.</li>
                    <li>A PPF account matures 15 years after the end of the financial year it was opened. For an April account that is the end of year 16, which is why 16 is the default. Every other year is a projection, and years after 16 assume the account is extended with deposits in five-year blocks, which is the holder's option.</li>
                    <li>${escapeHTML(ROUNDING_NOTE)}</li>
                    <li>These are estimates from your inputs, not a forecast, a guarantee or advice.</li>
                </ul>

            </section>

            <p
                id="ppf-live"
                class="ppf-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>Choose a yearly deposit made in April, or a monthly deposit made each month, and enter the amount.</li>
                    <li>Enter the interest rate that applies to you and the number of financial years. The page starts with 16 years and an example rate of 7.1%.</li>
                    <li>Press Calculate. The result shows the estimated balance, what you deposited and the interest, and says what the final year is in the Scheme's terms.</li>
                    <li>Open the year-by-year table to see each year. When the yearly total is a multiple of ₹600, the result also compares one deposit in April with the same total paid monthly.</li>
                    <li>If you change a value after calculating, the result is marked out of date until you press Calculate. Reset puts the starting values back.</li>
                </ol>

            </section>


            <!-- HOW INTEREST WORKS -->

            <section class="calculator-info">

                <h2>
                    How PPF Interest Works
                </h2>

                <p>
                    Under the Public Provident Fund Scheme, interest is worked
                    out for each calendar month on the lowest balance in the
                    account between the close of the 5th day and the end of
                    the month, and it is added to the account once, at the end
                    of each financial year (31 March). A deposit made on or
                    before the 5th earns interest for that month; one made
                    after the 5th starts earning in the next month.
                </p>

                <p>
                    This is why the timing matters. One deposit in April is in
                    the account for all twelve months of the year. The same
                    total paid in twelve monthly deposits is in the account for
                    fewer months, so it earns less. The tool divides the annual
                    rate you enter by 12 for each month. The Post Office's
                    procedural rules count a deposit made up to the 5th of a
                    month, whether by cash, cheque, draft or electronic mode;
                    check how your bank or post office treats yours.
                </p>

            </section>


            <!-- DEPOSIT LIMITS -->

            <section class="calculator-info">

                <h2>
                    Deposit Limits and Timing
                </h2>

                <p>
                    A deposit must be at least ₹500 and at most ₹1,50,000 in a
                    financial year, in multiples of ₹50. The ₹1,50,000 limit
                    includes your own account and any account you open for a
                    minor. Deposits can be a lump sum or in instalments, and
                    the Scheme sets no number of instalments. A monthly deposit
                    here can be ₹50 to ₹12,500, so twelve of them stay within
                    the limit.
                </p>

            </section>


            <!-- MATURITY -->

            <section class="calculator-info">

                <h2>
                    Maturity and Extension
                </h2>

                <p>
                    An account matures 15 years after the end of the financial
                    year in which it was opened. For an account opened in April
                    2026 that is 31 March 2042, the end of its 16th financial
                    year, which is why this tool starts at 16 years. After
                    maturity the holder may extend the account with deposits in
                    blocks of five years by applying within a year, or keep it
                    without deposits.
                </p>

                <p>
                    Years beyond 16 are projections that assume the account is
                    extended with deposits. The table names the end of the first
                    term (year 16) and the end of each extension block (years
                    21, 26, 31 and so on); no other year is a date on which the
                    account can be closed in full. Whether you can extend, and
                    on what terms, is a matter for your own account.
                </p>

            </section>


            <!-- WHAT IT DOES NOT DO -->

            <section class="calculator-info">

                <h2>
                    What This Calculator Does Not Do
                </h2>

                <ul>
                    <li>It does not know the current PPF rate. You enter the rate, and 7.1 is only an example.</li>
                    <li>It does not model withdrawals, loans, early closure, missed or revived years, a rate that changes, or an opening month other than April.</li>
                    <li>It does not cover tax, or who may open or extend an account.</li>
                    <li>It does not know how a bank or post office rounds interest, so it shows whole rupees from unrounded figures.</li>
                </ul>

                <p>
                    The rules described on this page come from the Public
                    Provident Fund Scheme, 2019 (G.S.R. 915(E), 12 December
                    2019) as amended by G.S.R. 290(E) of 5 May 2020, and
                    Department of Posts S.B. Order 08/2020, read on 13 October
                    2026. Rules and rates change: check the current Scheme and
                    your own bank or post office before relying on them.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Why does it start at 16 years and not 15?
                    </summary>
                    <p>
                        The Scheme counts 15 years from the end of the financial
                        year in which the account was opened. An account opened
                        in April therefore has 16 financial years in its first
                        term. You can choose any number of years from 1 to 50;
                        16 is only where the first term ends.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does one deposit in April give more than monthly deposits?
                    </summary>
                    <p>
                        Interest is worked out each month on the lowest balance
                        after the 5th. A deposit made in April is in the account
                        for all twelve months of the year, while the same total
                        paid monthly is in the account for fewer months. The
                        comparison states the difference; it is not advice about
                        when to deposit.
                    </p>
                </details>

                <details>
                    <summary>
                        Is the 7.1% the current PPF rate?
                    </summary>
                    <p>
                        No. It is only an example to start with. The Government
                        sets the PPF rate and reviews it every quarter, so enter
                        the rate that applies to you.
                    </p>
                </details>

                <details>
                    <summary>
                        Will my passbook show the same figure?
                    </summary>
                    <p>
                        Possibly not to the rupee. This tool works from
                        unrounded figures and shows whole rupees, and it does not
                        know how interest is rounded in practice. It also
                        assumes the rate stays the same and that the account was
                        opened in April.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the comparison missing?
                    </summary>
                    <p>
                        It is shown when the yearly total can be split into
                        twelve whole-₹50 monthly deposits, which means a
                        multiple of ₹600, because every deposit must be a
                        multiple of ₹50.
                    </p>
                </details>

                <details>
                    <summary>
                        Is my data stored or sent anywhere?
                    </summary>
                    <p>
                        No. The figures are worked out in your browser, nothing
                        is stored or sent to ToolZen Hub, and no account details
                        are asked for. Reloading the page clears everything.
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

    const form = document.querySelector("#ppf-form");
    const results = document.querySelector("#ppf-results");
    const live = document.querySelector("#ppf-live");
    const stale = document.querySelector("#ppf-stale");
    const yearlyGroup = document.querySelector("#ppf-yearly-group");
    const monthlyGroup = document.querySelector("#ppf-monthly-group");

    if (!form || !results) {
        return;
    }

    const inputs = Object.fromEntries(
        Object.entries(IDS).map(([name, id]) => [name, document.getElementById(id)])
    );

    const allInputs = Object.values(inputs);

    const radios = [...document.querySelectorAll(`input[name="${PATTERN_NAME}"]`)];

    let announceTimer = null;

    /* true while the page shows a result worked out from the inputs as they were at the last Calculate */
    let showing = false;

    const chosenPattern = () =>
        (radios.find((radio) => radio.checked) || radios[0]).value;

    function syncPattern() {

        const monthly = chosenPattern() === PPF_PATTERNS.monthly;

        yearlyGroup.hidden = monthly;
        monthlyGroup.hidden = !monthly;

    }

    function announce(text) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {
            live.textContent = "";
            live.textContent = text;
        }, 400);

    }

    function announceNow(text) {

        clearTimeout(announceTimer);

        live.textContent = "";
        live.textContent = text;

    }

    function clearStale() {

        showing = false;

        stale.hidden = true;

        delete results.dataset.stale;

    }

    function showEmpty() {

        clearStale();

        results.innerHTML = resultEmpty(EMPTY_MESSAGE);

    }

    function run({ speak = true } = {}) {

        clearFieldsInvalid(allInputs, ERROR_ID);

        const check = validatePpfInputs({
            pattern: chosenPattern(),
            yearlyDeposit: inputs.yearly.value,
            monthlyDeposit: inputs.monthly.value,
            rate: inputs.rate.value,
            years: inputs.years.value
        });

        if (!check.ok) {

            clearStale();

            const names = new Set(check.errors.flatMap((error) => error.fields));

            setFieldsInvalid(
                [...names].map((name) => inputs[name === "yearlyDeposit" ? "yearly" : name === "monthlyDeposit" ? "monthly" : name]),
                ERROR_ID
            );

            const message = check.errors.map((error) => error.message).join(" ");

            results.innerHTML = resultError(message, { id: ERROR_ID });

            if (speak) {
                announceNow(message);
            }

            return;

        }

        const result = calculatePpf(check.values);

        clearStale();

        results.innerHTML = renderResults(check.values, result);

        const details = document.querySelector("#ppf-table-details");

        /* the table is open on a wide screen and folded on a phone */
        if (details && window.matchMedia("(min-width: 700px)").matches) {
            details.open = true;
        }

        showing = true;

        if (speak) {
            announceNow(announcement(check.values, result));
        }

    }

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        run();

    });

    /* an edit after a result makes it out of date: it stays visible, labelled, until Calculate is pressed */

    form.addEventListener("input", () => {

        syncPattern();

        if (!showing) {
            return;
        }

        stale.hidden = false;

        results.dataset.stale = "true";

        announce(STALE_MESSAGE);

    });

    document.querySelector("#ppf-reset")?.addEventListener("click", () => {

        for (const radio of radios) {
            radio.checked = radio.value === DEFAULTS.pattern;
        }

        inputs.yearly.value = DEFAULTS.yearly;
        inputs.monthly.value = DEFAULTS.monthly;
        inputs.rate.value = DEFAULTS.rate;
        inputs.years.value = DEFAULTS.years;

        syncPattern();

        clearFieldsInvalid(allInputs, ERROR_ID);

        showEmpty();

        announceNow("Reset to the starting values.");

        inputs.yearly.focus();

    });

    syncPattern();

    form.dataset.ready = "true";

}

