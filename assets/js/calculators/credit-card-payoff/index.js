/* =========================================================
   ToolZen Hub
   Credit Card Payoff Calculator (Loans)

   A simplified estimate of how long a fixed monthly payment takes
   to clear a card balance. The model, the exact arithmetic and the
   three outcomes (pays off, does not reduce the balance, still owed
   after 50 years) are in formulas/credit-card-payoff.js; this file
   is the page around them.

   - Results appear when the visitor presses Calculate. Editing a
     field afterwards marks the result as out of date until it is
     calculated again; the page never shows a figure for inputs it
     was not calculated from.
   - The assumptions are always shown beside the result, not only in
     the FAQ, and nothing here says what to pay or promises a date.
   - Everything is calculated in the browser. Nothing is stored, sent
     or put in the address. Values are written as escaped text.
========================================================= */

import {
    BIGINT_AVAILABLE,
    MESSAGES,
    EXAMPLE,
    validateInputs,
    calculatePayoff,
    formatPaise,
    describeMonths,
    outcomeSentence,
    comparisonSentences,
    announcement
} from "../formulas/credit-card-payoff.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

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
    getCalculatorById("credit-card-payoff").title;

const IDS = {
    balance: "ccp-balance",
    apr: "ccp-apr",
    payment: "ccp-payment",
    comparePayment: "ccp-compare"
};

const ERROR_ID = "ccp-error";

const EMPTY_MESSAGE =
    "Enter the balance, the APR and a monthly payment, then press Calculate.";

const STALE_MESSAGE =
    "The inputs have changed since this result was worked out. Press Calculate to update it.";


/* =========================================================
   RESULTS
========================================================= */

const li = (text) => `<li>${escapeHTML(text)}</li>`;

/* the figures of one outcome, as label / value pairs (nothing is invented for a state that has none) */
function figures(outcome) {

    if (outcome.state === "payoff") {

        return [
            ["Payoff time", `${outcome.months} ${outcome.months === 1 ? "payment" : "payments"} (${describeMonths(outcome.months)})`],
            ["Total interest", formatPaise(outcome.totalInterestPaise)],
            ["Total repaid", formatPaise(outcome.totalRepaidPaise)],
            ["First month's interest", formatPaise(outcome.firstInterestPaise)],
            ["Final payment", formatPaise(outcome.finalPaymentPaise)]
        ];

    }

    if (outcome.state === "non-amortizing") {

        return [
            ["Payoff time", "Not paid off at this payment"],
            ["First month's interest", formatPaise(outcome.firstInterestPaise)],
            ["Smallest payment that reduces the balance", formatPaise(outcome.smallestReducingPaise)]
        ];

    }

    return [
        ["Payoff time", "More than 50 years (600 months)"],
        ["First month's interest", formatPaise(outcome.firstInterestPaise)]
    ];

}

function sideCard(title, paymentPaise, outcome) {

    return `
                    <div class="ccp-side" data-state="${escapeHTML(outcome.state)}">

                        <h3 class="ccp-side__title">
                            ${escapeHTML(title)}: ${escapeHTML(formatPaise(paymentPaise))} a month
                        </h3>

                        <dl class="ccp-side__list">
                            ${figures(outcome).map(([label, value]) => `
                            <div class="ccp-side__item">
                                <dt>${escapeHTML(label)}</dt>
                                <dd>${escapeHTML(value)}</dd>
                            </div>`).join("")}
                        </dl>

                    </div>`;

}

function renderResults(result) {

    const { primary, comparison, values } = result;

    const metrics = figures(primary).map(([label, value], index) =>
        resultMetric({ label, value, primary: index === 0 })
    ).join("");

    let compare = "";

    if (comparison !== null) {

        compare = `
                <h3 class="ccp-subtitle">
                    Compared side by side
                </h3>

                <div class="ccp-compare">
                    ${sideCard("Payment 1", values.paymentPaise, primary)}
                    ${sideCard("Payment 2", values.comparePaise, comparison.outcome)}
                </div>

                <ul class="ccp-differences">
                    ${comparisonSentences(comparison).map(li).join("")}
                </ul>`;

    }

    return `
            <div class="calculator-results__card ccp-result" data-state="${escapeHTML(primary.state)}">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Estimate
                    </span>

                    <h2 class="calculator-results__title">
                        ${primary.state === "payoff" ? "Estimated payoff" : primary.state === "non-amortizing" ? "This payment does not reduce the balance" : "Payoff is more than 50 years away"}
                    </h2>

                </div>

                <p class="ccp-outcome">
                    ${escapeHTML(outcomeSentence(primary))}
                </p>

                <div class="calculator-results__grid">
                    ${metrics}
                </div>

                ${compare}

            </div>
        `;

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
                        Finance Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Estimate how many months a fixed monthly payment takes
                        to clear a credit card balance, how much interest that
                        is, and what a different payment would change. It is a
                        simplified estimate, not a statement from your card
                        issuer.
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
                    Estimate Your Payoff
                </div>

                <p class="calculator-section__description">
                    Enter what you owe, the card's APR and a fixed amount you
                    would pay each month. The values you enter are not stored
                    or sent anywhere, and nothing about your card is needed.
                </p>

                <form
                    id="ccp-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid ccp-grid">

                        ${numberField({
                            id: IDS.balance,
                            label: "Outstanding Balance",
                            unit: "₹",
                            hint: "What you owe now, from ₹100 to ₹1,00,00,000, with up to 2 decimal places.",
                            min: 100,
                            max: 10000000,
                            step: "any"
                        })}

                        ${numberField({
                            id: IDS.apr,
                            label: "Annual Percentage Rate (APR)",
                            unit: "% a year",
                            hint: "From 0% to 100%, with up to 2 decimal places. Use the rate your card states.",
                            min: 0,
                            max: 100,
                            step: "any"
                        })}

                        ${numberField({
                            id: IDS.payment,
                            label: "Monthly Payment",
                            unit: "₹",
                            hint: "A fixed amount paid every month, from ₹1 to ₹1,00,00,000, with up to 2 decimal places.",
                            min: 1,
                            max: 10000000,
                            step: "any"
                        })}

                        ${numberField({
                            id: IDS.comparePayment,
                            label: "Compare With Another Monthly Payment (optional)",
                            unit: "₹",
                            hint: "Leave blank to skip. It is worked out for the same balance and APR, with no recommendation.",
                            min: 1,
                            max: 10000000,
                            step: "any",
                            required: false
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions ccp-actions">

                        <button
                            type="submit"
                            id="ccp-calculate"
                            class="calculator-form__button"
                        >
                            Calculate
                        </button>

                        <button
                            type="button"
                            id="ccp-example"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Load example
                        </button>

                        <button
                            type="button"
                            id="ccp-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <p
                id="ccp-stale"
                class="ccp-stale"
                hidden
            >${escapeHTML(STALE_MESSAGE)}</p>

            <section
                id="ccp-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <!-- the assumptions, always beside the result -->

            <section
                class="ccp-assumptions"
                aria-labelledby="ccp-assumptions-heading"
            >

                <h2 id="ccp-assumptions-heading">
                    What This Estimate Assumes
                </h2>

                <ul>
                    <li>The APR is divided by 12 to give an equal monthly rate.</li>
                    <li>Interest is charged on the balance at the start of each month, before that month's payment, and the payment is made at the end of the month.</li>
                    <li>The same payment is made every month. The last payment is whatever is left.</li>
                    <li>A remaining amount of half a paisa or less may be included in the final payment.</li>
                    <li>No new purchases, fees, penalties, rewards, taxes or promotional rates are included.</li>
                    <li>No card issuer's minimum-payment or billing-cycle rules are modelled. Real cards may charge interest on daily balances and statement cycles, so a real payoff can differ.</li>
                    <li>This is an estimate, not a statement or a payoff quote, and not financial advice. Figures are rounded to the paisa from unrounded values, so figures added by hand can differ by a paisa.</li>
                </ul>

            </section>

            <p
                id="ccp-live"
                class="ccp-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${TITLE}
                </h2>

                <ol>
                    <li>Enter the balance you owe, the card's annual percentage rate and the fixed amount you would pay each month.</li>
                    <li>Press Calculate. The result says how many monthly payments it would take, the interest in total, the total repaid, the interest in the first month and the size of the last payment.</li>
                    <li>To see what a different payment would change, enter it in the optional box and press Calculate again.</li>
                    <li>If you change a value after calculating, the result is marked as out of date until you press Calculate. Load example fills in a sample, and Reset clears everything.</li>
                </ol>

            </section>


            <!-- WORKED EXAMPLE -->

            <section class="calculator-info">

                <h2>
                    Worked Example
                </h2>

                <p>
                    Take a balance of ₹50,000 at an APR of 36%, paid at ₹3,000 a
                    month. The monthly rate is 36% ÷ 12 = 3%, so the first
                    month's interest is ₹1,500.00. The payment clears that
                    interest and ₹1,500.00 of the balance, and the balance falls
                    from there. It takes <strong>24 payments</strong>, the last
                    being ₹1,360.29. The total interest is
                    <strong>₹20,360.29</strong> and the total repaid is
                    ₹70,360.29.
                </p>

                <p>
                    At ₹4,000 a month the same balance takes 16 payments with
                    ₹13,607.80 of interest. Compared with ₹3,000, that is 8
                    months fewer and ₹6,752.50 less interest. The 36% and the
                    amounts are only an illustration, not a typical rate.
                </p>

            </section>


            <!-- HOW IT WORKS -->

            <section class="calculator-info">

                <h2>
                    How the Calculation Works
                </h2>

                <p>
                    Each month the tool takes the balance at the start of the
                    month, adds one month of interest (the APR divided by 12 of
                    that balance), then subtracts your payment. The remaining
                    balance carries into the next month. When what is owed is
                    no more than your payment, that last payment is just what is
                    left. The figures are worked out with exact integer
                    arithmetic on paise, so the paisa shown is the paisa the
                    model gives. It stops after 600 months (50 years).
                </p>

                <p>
                    It shows no payoff date. It counts payments from now, and a
                    real card's dates, statements and due dates are not part of
                    the model.
                </p>

            </section>


            <!-- WHY A PAYMENT MAY NOT REDUCE DEBT -->

            <section class="calculator-info">

                <h2>
                    Why a Payment May Not Reduce the Debt
                </h2>

                <p>
                    Interest is charged every month on what is still owed. If
                    your payment is no more than that month's interest, none of
                    it goes towards the balance: the balance stays the same or
                    grows. The tool says so and shows the first month's interest
                    and the smallest payment that is above it. It does not say
                    what you should pay.
                </p>

                <p>
                    A payment only just above the interest works very slowly.
                    For ₹1,00,000 at 12% a year the first month's interest is
                    ₹1,000.00. A payment of ₹1,001 or ₹1,002 still leaves a
                    balance after 50 years, so the tool shows no payoff time.
                    At ₹1,005 it takes 533 payments, and at ₹1,500 it takes 111.
                </p>

            </section>


            <!-- COMPARING -->

            <section class="calculator-info">

                <h2>
                    Comparing Two Payments
                </h2>

                <p>
                    When you add a second payment, both are worked out for the
                    same balance and APR and shown side by side. If both pay the
                    balance off, the tool states how many months more or fewer
                    the second takes and how much more or less interest it costs.
                    If either does not pay off within 50 years, no difference is
                    shown, because there is nothing to subtract. The comparison
                    only describes the model; it does not suggest which payment
                    to choose.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is this my card's exact payoff?
                    </summary>
                    <p>
                        No. It is a simplified estimate. Real cards can charge
                        interest on daily balances and statement cycles, and add
                        fees and new purchases, so your card's figures can
                        differ. Check your own statement for the real numbers.
                    </p>
                </details>

                <details>
                    <summary>
                        Why does my payment not reduce the balance?
                    </summary>
                    <p>
                        When the payment is no more than one month's interest,
                        all of it goes to interest under this model. The result
                        shows the first month's interest so you can see this.
                    </p>
                </details>

                <details>
                    <summary>
                        What happens if I pay only the minimum?
                    </summary>
                    <p>
                        This tool does not model any issuer's minimum-payment
                        rule, so it cannot say. It shows what a fixed monthly
                        payment that you choose would do.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it include fees or new purchases?
                    </summary>
                    <p>
                        No. It assumes the balance only changes through
                        interest and your payments.
                    </p>
                </details>

                <details>
                    <summary>
                        Is my data stored or sent anywhere?
                    </summary>
                    <p>
                        No. The figures are worked out in your browser, nothing
                        is stored or sent to ToolZen Hub, and no card details
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

    const form = document.querySelector("#ccp-form");
    const results = document.querySelector("#ccp-results");
    const live = document.querySelector("#ccp-live");
    const stale = document.querySelector("#ccp-stale");
    const calculate = document.querySelector("#ccp-calculate");

    if (!form || !results) {
        return;
    }

    const inputs = Object.fromEntries(
        Object.entries(IDS).map(([name, id]) => [name, document.getElementById(id)])
    );

    const allInputs = Object.values(inputs);

    let announceTimer = null;

    /* true while the page shows a result worked out from the inputs as they were at the last Calculate */
    let showing = false;

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

        if (!BIGINT_AVAILABLE) {

            clearStale();

            results.innerHTML = resultError(MESSAGES.noBigInt, { id: ERROR_ID });

            return;

        }

        const check = validateInputs(
            Object.fromEntries(Object.entries(inputs).map(([name, input]) => [name, input.value]))
        );

        if (!check.ok) {

            clearStale();

            const names = new Set(check.errors.flatMap((error) => error.fields));

            setFieldsInvalid([...names].map((name) => inputs[name]), ERROR_ID);

            const message = check.errors.map((error) => error.message).join(" ");

            results.innerHTML = resultError(message, { id: ERROR_ID });

            if (speak) {
                announceNow(message);
            }

            return;

        }

        const result = calculatePayoff(check.values);

        clearStale();

        results.innerHTML = renderResults(result);

        showing = true;

        if (speak) {
            announceNow(announcement(result));
        }

    }

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        run();

    });

    /* an edit after a result makes it out of date: it stays visible, labelled, until Calculate is pressed */

    form.addEventListener("input", () => {

        if (!showing) {
            return;
        }

        stale.hidden = false;

        results.dataset.stale = "true";

        announce(STALE_MESSAGE);

    });

    document.querySelector("#ccp-example")?.addEventListener("click", () => {

        for (const [name, input] of Object.entries(inputs)) {
            input.value = EXAMPLE[name];
        }

        run();

    });

    document.querySelector("#ccp-reset")?.addEventListener("click", () => {

        for (const input of allInputs) {
            input.value = "";
        }

        clearFieldsInvalid(allInputs, ERROR_ID);

        showEmpty();

        announceNow("Cleared.");

        inputs.balance.focus();

    });

    if (!BIGINT_AVAILABLE) {

        results.innerHTML = resultError(MESSAGES.noBigInt, { id: ERROR_ID });

        calculate.disabled = true;

    }

    form.dataset.ready = "true";

}
