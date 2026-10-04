/* =========================================================
   ToolZen Hub
   Profit Calculator

   A period tool for a small seller: what a product or service
   earned (or lost) after variable and fixed costs, how many whole
   units cover the fixed costs, how far the units sold are above or
   short of that, how many units a target profit would need, and
   which of price, variable cost, volume or fixed costs moves the
   profit most.

   THESE ARE CALCULATED FIGURES FOR THE NUMBERS ENTERED. Tax and
   GST, depreciation, interest, the owner's pay (unless entered as a
   fixed cost), returns, discounts and stock are not included, and
   the page says so next to the result. It never calls a result
   good or safe and never predicts sales. The target is a goal, not
   an expectation.

   The maths is in formulas/profit.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateProfit,
    validateProfitInputs,
    PROFIT_LIMITS
} from "../formulas/profit.js";

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
    getCalculatorById("profit").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    price: "profit-price",
    variableCost: "profit-variable",
    fixedCosts: "profit-fixed",
    units: "profit-units",
    target: "profit-target"
};

/* the field that may be left empty: a blank target means none */
const OPTIONAL = ["target"];

const ERROR_ID =
    "profit-results-error";

const DEFAULTS = {
    price: 800,
    variableCost: 600,
    fixedCosts: 50000,
    units: 400,
    target: ""
};

const EMPTY_MESSAGE =
    "Enter a selling price, a variable cost, your fixed costs and the units sold to see your profit.";

const L = PROFIT_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

/* money to the paisa, as in the Margin tool: prices matter to the paisa */

const paiseFormatter =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const rupees = (value) => paiseFormatter.format(Number(value) || 0);

const signedRupees = (value) =>
    `${value > 0 ? "+" : ""}${rupees(value)}`;

const percent = (fraction) => `${formatNumber(fraction * 100, 2)}%`;

const unitsText = (count) =>
    `${formatNumber(count, 0)} unit${count === 1 ? "" : "s"}`;

const LEVER_LABELS = {
    price: "Selling price",
    variable: "Variable cost",
    units: "Units sold",
    fixed: "Fixed costs"
};

function whatLabel(
    row
) {

    return row.key === "base"
        ? "As entered"
        : `${LEVER_LABELS[row.key]} ${row.change > 0 ? "+" : "-"}${Math.abs(row.change)}%`;

}

function newValueText(
    row
) {

    if (row.value === null) {
        return "As entered";
    }

    return row.key === "units"
        ? unitsText(row.value)
        : rupees(row.value);

}

const breakEvenText = (row) =>
    row.breakEven === null
        ? "No finite break-even"
        : unitsText(row.breakEven);


/* =========================================================
   RESULTS (HTML)
========================================================= */

function summaryLines(
    result
) {

    const {
        input,
        contribution,
        profit,
        state,
        breakEvenUnits,
        breakEvenRevenue,
        position
    } = result;

    const outcome =
        state === "profit"
            ? `a profit of ${rupees(profit)}`
            : state === "loss"
                ? `a loss of ${rupees(-profit)}`
                : "neither a profit nor a loss";

    const lines = [
        `With a selling price of ${rupees(input.price)}, a variable cost of ${rupees(input.variableCost)} a unit, fixed costs of ${rupees(input.fixedCosts)} and ${unitsText(input.units)} sold, the period shows ${outcome}.`
    ];

    if (breakEvenUnits === null) {

        lines.push(
            contribution === 0
                ? "Each unit sells for exactly its variable cost, so a sale adds nothing towards the fixed costs and no number of units sold would cover them under these assumptions."
                : `Each unit sells ${rupees(-contribution)} below its variable cost, so every sale adds to the loss and no number of units sold would cover the fixed costs under these assumptions.`
        );

        return lines;

    }

    lines.push(
        input.fixedCosts === 0
            ? `There are no fixed costs, so each unit adds ${rupees(contribution)} to profit from the first sale.`
            : `Each unit adds ${rupees(contribution)} towards the fixed costs, so ${unitsText(breakEvenUnits)} cover them, at a revenue of ${rupees(breakEvenRevenue)}.`
    );

    if (position.state === "above") {

        lines.push(
            `The units sold are ${unitsText(position.units)} above break-even${position.shareOfUnitsSold === null ? "" : `, ${percent(position.shareOfUnitsSold)} of the units sold`}.`
        );

    } else if (position.state === "short") {

        lines.push(
            `The units sold are ${unitsText(position.units)} short of break-even.`
        );

    } else {

        lines.push("The units sold are exactly at break-even.");

    }

    return lines;

}

function breakdownCard(
    result
) {

    const rows = [
        ["Revenue", rupees(result.revenue)],
        ["Total variable costs", rupees(result.variableCosts)],
        ["Fixed costs", rupees(result.fixedCosts)],
        [result.state === "loss" ? "Loss" : "Profit", rupees(result.profit)]
    ];

    return `
                <h3 class="profit-subtitle">
                    How the result is made up
                </h3>

                <div class="profit-compare">

                    <section
                        class="profit-compare__card"
                        aria-labelledby="profit-breakdown-card"
                    >

                        <h4
                            class="profit-compare__title"
                            id="profit-breakdown-card"
                        >
                            For the period
                        </h4>

                        <p class="profit-compare__tag">
                            Revenue less variable costs less fixed costs
                        </p>

                        <dl class="profit-compare__list">
                            ${rows.map(
                                ([label, value]) => `
                            <div>
                                <dt>${escapeHTML(label)}</dt>
                                <dd>${escapeHTML(value)}</dd>
                            </div>`
                            ).join("")}
                        </dl>

                    </section>

                </div>`;

}

function targetSection(
    result
) {

    const t =
        result.target;

    if (!t) {
        return "";
    }

    let text;

    if (t.units === null) {

        text =
            "Each unit sells at or below its variable cost, so no number of units reaches this target under these assumptions.";

    } else if (t.reached) {

        text =
            `The profit above already meets this target, with ${rupees(result.profit - t.amount)} to spare. Reaching it takes ${unitsText(t.units)} under these assumptions, and ${unitsText(result.input.units)} were sold. This is a goal, not an expectation.`;

    } else {

        text =
            `Under these assumptions the target needs ${unitsText(t.units)}, which is ${unitsText(t.additional)} more than the ${unitsText(result.input.units)} sold. This is a goal, not an expectation.`;

    }

    const rows = [
        ["Target profit", rupees(t.amount)],
        ["Units needed", t.units === null ? "No finite number" : unitsText(t.units)],
        ["Revenue at that volume", t.revenue === null ? "Not applicable" : rupees(t.revenue)],
        ["Units sold", unitsText(result.input.units)],
        ["Additional units needed", t.additional === null ? "Not applicable" : unitsText(t.additional)]
    ];

    return `
                <h3 class="profit-subtitle">
                    Your target profit
                </h3>

                <div class="profit-compare">

                    <section
                        class="profit-compare__card"
                        aria-labelledby="profit-target-card"
                    >

                        <h4
                            class="profit-compare__title"
                            id="profit-target-card"
                        >
                            ${t.units === null ? "Target cannot be reached" : t.reached ? "Target already met" : "Units for the target"}
                        </h4>

                        <p class="profit-compare__tag">
                            Under the assumptions above
                        </p>

                        <dl class="profit-compare__list">
                            ${rows.map(
                                ([label, value]) => `
                            <div>
                                <dt>${escapeHTML(label)}</dt>
                                <dd>${escapeHTML(value)}</dd>
                            </div>`
                            ).join("")}
                        </dl>

                    </section>

                </div>

                <p class="profit-note profit-note--plain">
                    ${escapeHTML(text)}
                </p>`;

}

function biggestLever(
    result
) {

    const levers =
        result.whatIf.filter(row => row.key !== "base");

    const top =
        levers.reduce(
            (best, row) =>
                Math.abs(row.delta) > Math.abs(best.delta) ? row : best,
            levers[0]
        );

    if (!top || top.delta === 0) {
        return "";
    }

    return `Under these numbers, a 10% change in ${LEVER_LABELS[top.key].toLowerCase()} moves the profit the most, by ${rupees(Math.abs(top.delta))}.`;

}

function whatIfTable(
    result
) {

    const label =
        "What changes under these assumptions";

    const lever =
        biggestLever(result);

    return `
                <h3 class="profit-subtitle">
                    What changes under these assumptions
                </h3>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="${label}: profit and break-even when one input changes by 10%"
                >

                    <table class="calculator-results__table profit-table">

                        <caption class="profit-sr-only">
                            Profit and break-even units when the selling price, variable cost, units sold or fixed costs change by 10%, one at a time, with everything else held as entered.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">What changes</th>
                                <th scope="col">New value</th>
                                <th scope="col">Profit</th>
                                <th scope="col">Change in profit</th>
                                <th scope="col">Break-even units</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${result.whatIf.map(
                                row => `
                            <tr>
                                <th scope="row">${escapeHTML(whatLabel(row))}</th>
                                <td>${escapeHTML(newValueText(row))}</td>
                                <td>${rupees(row.profit)}</td>
                                <td>${row.key === "base" ? "None" : signedRupees(row.delta)}</td>
                                <td>${escapeHTML(breakEvenText(row))}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>

                <p class="profit-note">
                    Each row changes one input by 10% and works the whole result out again, holding the rest as entered. It shows what the numbers would do, not what will happen. A changed number of units is rounded to the nearest whole unit.${lever ? ` ${escapeHTML(lever)}` : ""}
                </p>`;

}

function renderResults(
    result
) {

    const {
        profit,
        contribution,
        profitShare,
        breakEvenUnits,
        position
    } = result;

    const positionLabel =
        position === null
            ? "Against break-even"
            : position.state === "above"
                ? "Units above break-even"
                : position.state === "short"
                    ? "Units short of break-even"
                    : "Against break-even";

    const positionValue =
        position === null
            ? "Not applicable"
            : position.state === "at"
                ? "At break-even"
                : unitsText(position.units);

    const metrics = [
        resultMetric({ label: "Profit for the period", value: rupees(profit), primary: true }),
        resultMetric({ label: "Break-even point", value: breakEvenUnits === null ? "No finite break-even" : unitsText(breakEvenUnits) }),
        resultMetric({ label: positionLabel, value: positionValue }),
        resultMetric({ label: "Contribution per unit", value: rupees(contribution) }),
        resultMetric({ label: "Profit as a share of revenue", value: profitShare === null ? "No revenue" : percent(profitShare) })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        Your profit and break-even point
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="profit-note profit-note--trust">
                    <strong>For the numbers you entered.</strong>
                    This assumes the same selling price and variable cost for
                    every unit and fixed costs that stay the same for the
                    period. Not included: tax or GST, depreciation,
                    interest, the owner's pay unless you entered it as a
                    fixed cost, returns, discounts and stock. This is a
                    calculation, not advice.
                </div>

                ${breakdownCard(result)}

                ${targetSection(result)}

                ${whatIfTable(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const outcome =
        result.state === "loss"
            ? `Loss of ${rupees(-result.profit)}`
            : `Profit ${rupees(result.profit)}`;

    return result.breakEvenUnits === null
        ? `${outcome}. There is no finite break-even.`
        : `${outcome}. Break-even is at ${unitsText(result.breakEvenUnits)}.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from the
   default values, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const r =
        calculateProfit({ ...DEFAULTS, target: 100000 });

    const lower =
        r.whatIf.find(row => row.key === "price" && row.change === -10);

    const higher =
        r.whatIf.find(row => row.key === "price" && row.change === 10);

    return `Take a selling price of ${rupees(DEFAULTS.price)}, a variable cost of ${rupees(DEFAULTS.variableCost)} a unit, fixed costs of ${rupees(DEFAULTS.fixedCosts)} and ${unitsText(DEFAULTS.units)} sold. Each unit adds ${rupees(r.contribution)}, revenue is ${rupees(r.revenue)} and the profit is ${rupees(r.profit)}. ${unitsText(r.breakEvenUnits)} cover the fixed costs, so the units sold are ${unitsText(r.position.units)} above break-even. A profit of ${rupees(100000)} would need ${unitsText(r.target.units)}. If the selling price were 10% lower the profit would be ${rupees(lower.profit)}, and 10% higher, ${rupees(higher.profit)}.`;

}


/* =========================================================
   RENDER
========================================================= */

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Business Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Work out your profit for a period, the break-even
                        point and the units a target needs, and see which of
                        price, cost, volume or fixed costs moves profit most.
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
                    Work Out Your Profit
                </div>

                <p class="calculator-section__description">
                    Enter your price, costs and sales for one period, such
                    as a month. Results update as you type.
                </p>

                <form
                    id="profit-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid">

                        ${numberField({
                            id: IDS.price,
                            label: "Selling Price per Unit",
                            unit: "₹",
                            hint: "What you charge for one unit, without GST.",
                            min: L.price.min,
                            max: L.price.max,
                            step: 0.01,
                            value: DEFAULTS.price
                        })}

                        ${numberField({
                            id: IDS.variableCost,
                            label: "Variable Cost per Unit",
                            unit: "₹",
                            hint: "What one more unit costs you to make or buy: materials, packing, delivery. It may be more than the price.",
                            min: L.variableCost.min,
                            max: L.variableCost.max,
                            step: 0.01,
                            value: DEFAULTS.variableCost
                        })}

                        ${numberField({
                            id: IDS.fixedCosts,
                            label: "Fixed Costs for the Period",
                            unit: "₹",
                            hint: "Costs that do not change with sales in the period: rent, salaries, subscriptions. Use the same period as the units sold.",
                            min: L.fixedCosts.min,
                            max: L.fixedCosts.max,
                            step: 100,
                            value: DEFAULTS.fixedCosts
                        })}

                        ${numberField({
                            id: IDS.units,
                            label: "Units Sold in the Period",
                            unit: "units",
                            hint: "How many units you sold, or expect to sell, in that period. A whole number.",
                            min: L.units.min,
                            max: L.units.max,
                            step: 1,
                            value: DEFAULTS.units
                        })}

                        ${numberField({
                            id: IDS.target,
                            label: "Target Profit (optional)",
                            unit: "₹",
                            hint: "Leave blank to skip. If you enter one, you see the units and revenue it would need.",
                            min: L.target.min,
                            max: L.target.max,
                            step: 1000,
                            value: DEFAULTS.target,
                            required: false
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="profit-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="profit-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="profit-live"
                class="profit-sr-only"
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
                        Pick one period, such as a month, and use it for the
                        fixed costs and the units sold.
                    </li>
                    <li>
                        Enter the selling price and the variable cost of one
                        unit, without GST.
                    </li>
                    <li>
                        Enter the fixed costs for the period and the units
                        sold. Optionally add a target profit.
                    </li>
                    <li>
                        Read the profit and the break-even point, then the
                        table of what changes. Results update as you change
                        any value.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>Each unit contributes something towards the fixed
                    costs.</strong> The contribution is the selling price
                    less the variable cost. Fixed costs are covered by the
                    contributions of all the units sold, and anything beyond
                    that is profit.
                </p>

                <p>
                    <strong>Break-even is a whole number of units.</strong>
                    It is the fixed costs divided by the contribution,
                    rounded up, because a fraction of a unit cannot be sold.
                    If the contribution is zero or below, no number of units
                    covers the fixed costs.
                </p>

                <p>
                    <strong>Above, at or short of break-even.</strong> The
                    calculator compares the units sold with the break-even
                    point and says how many units above or short of it you
                    are.
                </p>

                <p>
                    <strong>The table shows what changes.</strong> It moves
                    the selling price, the variable cost, the units sold and
                    the fixed costs by 10%, one at a time, so you can see
                    which one moves the profit most under your own numbers.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        Every unit has the same selling price and the same
                        variable cost, and every unit is sold at that price.
                    </li>
                    <li>
                        Fixed costs stay the same across the volumes shown.
                    </li>
                    <li>
                        Amounts are without GST and for one period. No tax is
                        calculated.
                    </li>
                    <li>
                        Not included: depreciation, interest, the owner's pay
                        (unless you entered it as a fixed cost), returns,
                        discounts, stock and any cost you did not enter.
                    </li>
                    <li>
                        A target profit is a goal you choose, not an
                        expectation.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not an
                    accounting statement and not advice. See the
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
                    How It Is Calculated
                </h2>

                <p>
                    contribution per unit = selling price - variable cost
                </p>

                <p>
                    profit = contribution per unit × units sold - fixed costs
                </p>

                <p>
                    Break-even units are the smallest whole number of units
                    where the contribution of all the units covers the fixed
                    costs: the fixed costs divided by the contribution,
                    rounded up. Units for a target profit are worked out the
                    same way from the fixed costs plus the target.
                </p>

                <p>
                    Each row of the table changes one input by 10% and works
                    the whole result out again from that input. A changed
                    number of units is rounded to the nearest whole unit.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What is the difference between variable and fixed costs?
                    </summary>
                    <p>
                        A variable cost goes up with each unit you make or
                        sell, such as materials or packing. A fixed cost stays
                        the same for the period whatever you sell, such as
                        rent. Enter each in its own field.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is break-even a whole number of units?
                    </summary>
                    <p>
                        You cannot sell part of a unit, so the fixed costs
                        divided by the contribution is rounded up to the next
                        whole unit. At that many units the fixed costs are
                        covered.
                    </p>
                </details>

                <details>
                    <summary>
                        What if my price is below my variable cost?
                    </summary>
                    <p>
                        Each sale then adds to the loss, so no number of units
                        covers the fixed costs. The calculator shows the loss
                        and says there is no finite break-even.
                    </p>
                </details>

                <details>
                    <summary>
                        Does the calculator say whether a product is worth selling?
                    </summary>
                    <p>
                        No. It calculates the figures for the numbers you
                        enter. Whether those numbers are enough depends on
                        costs and plans that are not part of this calculation.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it include GST?
                    </summary>
                    <p>
                        No. Enter the price and costs without GST. No tax is
                        calculated.
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
        document.querySelector("#profit-form");

    const results =
        document.querySelector("#profit-results");

    const live =
        document.querySelector("#profit-live");

    const resetButton =
        document.querySelector("#profit-reset");

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
            validateProfitInputs(raw);

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
            calculateProfit(check.values);

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
