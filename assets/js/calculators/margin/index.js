/* =========================================================
   ToolZen Hub
   Margin Calculator

   A per-unit pricing tool for a small seller: what to charge for a
   target margin or markup, what margin and markup an entered price
   really gives, what a change in cost does and the price that
   keeps the margin, and, if a discount is entered, how many times
   today's sales it would take to earn the same total profit.

   THESE ARE CALCULATED FIGURES FOR THE NUMBERS ENTERED. Overheads,
   fixed costs, tax and GST, returns and other business costs are
   not included, and the page says so next to the result. It never
   says what a margin should be and never predicts sales.

   The maths is in formulas/margin.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateMargin,
    validateMarginInputs,
    MARGIN_LIMITS
} from "../formulas/margin.js";

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
    getCalculatorById("margin").title;


/* =========================================================
   FIELDS
========================================================= */

const IDS = {
    cost: "margin-cost",
    price: "margin-price",
    margin: "margin-target-margin",
    markup: "margin-target-markup",
    discount: "margin-discount"
};

const BASIS_NAME = "margin-basis";

const BASES = {
    price: "Selling price",
    margin: "Target margin",
    markup: "Target markup"
};

const ERROR_ID =
    "margin-results-error";

const DEFAULTS = {
    cost: 600,
    basis: "price",
    price: 800,
    margin: 25,
    markup: 33.33,
    discount: ""
};

const EMPTY_MESSAGE =
    "Enter your cost per unit and a selling price, target margin or target markup to see your pricing.";

const L = MARGIN_LIMITS;


/* =========================================================
   WORDING HELPERS
========================================================= */

/* money to the paisa: prices matter to the paisa, so this tool does not round to whole rupees */

const paiseFormatter =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

const rupees = (value) => paiseFormatter.format(Number(value) || 0);

const percent = (fraction) => `${formatNumber(fraction * 100, 2)}%`;

const signedPercent = (fraction) =>
    `${fraction > 0.0000005 ? "+" : ""}${percent(fraction)}`;

const times = (value) => `${formatNumber(value, 2)} times`;

const plainPercent = (value) => `${formatNumber(value, 2).replace(/\.?0+$/, "")}%`;


/* =========================================================
   RESULTS (HTML)
========================================================= */

function profitLine(
    result
) {

    const {
        input,
        price,
        profit,
        margin,
        markup,
        state,
        derived
    } = result;

    const lead =
        derived
            ? `To reach a target ${input.basis} of ${plainPercent(input.value)} on a cost of ${rupees(input.cost)}, the selling price works out to ${rupees(price)}.`
            : `At a cost of ${rupees(input.cost)} and a selling price of ${rupees(price)}`;

    if (state === "zero") {

        return derived
            ? `${lead} At that price each unit earns no profit.`
            : `${lead}, each unit earns no profit: the price equals the cost.`;

    }

    if (state === "loss") {

        return `${lead}, each unit sells ${rupees(-profit)} below its cost. That is a margin of ${percent(margin)} and a markup of ${percent(markup)}.`;

    }

    return derived
        ? `${lead} Each unit then earns ${rupees(profit)}: a margin of ${percent(margin)} and a markup of ${percent(markup)}.`
        : `${lead}, each unit earns ${rupees(profit)}: a margin of ${percent(margin)} and a markup of ${percent(markup)}.`;

}

function roundingLine(
    result
) {

    const {
        input,
        margin,
        markup,
        derived
    } = result;

    if (!derived) {
        return "";
    }

    const target =
        input.value / 100;

    const reached =
        input.basis === "margin"
            ? margin
            : markup;

    // exact when the price needed no rounding
    if (Math.abs(reached - target) < 0.0000005) {
        return "";
    }

    return `The price is rounded up to the next paisa so it never falls short of the target, which makes the ${input.basis} ${percent(reached)}.`;

}

function explainer(
    result
) {

    return `
                <p class="margin-note margin-note--plain">
                    <strong>Margin</strong> is profit as a share of the
                    selling price (${escapeHTML(percent(result.margin))}
                    here). <strong>Markup</strong> is the same profit as a
                    share of the cost (${escapeHTML(percent(result.markup))}
                    here). They measure one profit against different
                    amounts, so the two percentages differ whenever there
                    is a profit or a loss.
                </p>`;

}

function costTable(
    result
) {

    const covering =
        result.rows[0].kind === "cover";

    const label =
        "If your cost changes";

    const priceHeading =
        covering
            ? "Price to cover the new cost"
            : "Price to keep your margin";

    return `
                <h3 class="margin-subtitle">
                    If your cost changes
                </h3>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="${label}: the margin at your price and the price that ${covering ? "covers" : "keeps your margin at"} the new cost"
                >

                    <table class="calculator-results__table margin-table">

                        <caption class="margin-sr-only">
                            Five changes to your cost per unit, with the margin at your current selling price and the ${covering ? "price that covers the new cost" : "selling price that keeps your margin"}.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">Cost change</th>
                                <th scope="col">New cost</th>
                                <th scope="col">Margin at your price</th>
                                <th scope="col">${priceHeading}</th>
                                <th scope="col">Change in price</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${result.rows.map(
                                row => `
                            <tr>
                                <th scope="row">${row.change === 0 ? "0% (your cost)" : `${row.change > 0 ? "+" : ""}${row.change}%`}</th>
                                <td>${rupees(row.cost)}</td>
                                <td>${percent(row.margin)}</td>
                                <td>${rupees(row.price)}</td>
                                <td>${signedPercent(row.priceChange)}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                    </table>

                </div>

                <p class="margin-note">
                    ${covering
                        ? "Your price is at or below your cost, so there is no margin to keep. The price shown covers the new cost, rounded up to the next paisa."
                        : "The price to keep your margin is your price scaled by the cost change, rounded up to the next paisa. A negative margin means your price would be below the new cost."}
                </p>`;

}

function discountSection(
    result
) {

    const d =
        result.discount;

    if (!d) {
        return "";
    }

    let text;

    if (d.state === "base-loss") {

        text =
            `Your selling price is already at or below your cost, so a comparison of volumes does not apply. At ${plainPercent(d.percent)} off, the price would be ${rupees(d.price)}.`;

    } else if (d.state === "none") {

        text =
            `At ${plainPercent(d.percent)} off the price is ${rupees(d.price)}, at or below your cost, so each unit earns no profit. Under these assumptions there is no number of extra sales that would earn the same total profit.`;

    } else {

        const extra =
            (d.volumeMultiple - 1) * 100;

        text =
            `At ${plainPercent(d.percent)} off, each unit earns ${rupees(d.profit)} instead of ${rupees(result.profit)}. To earn the same total profit you would need about ${times(d.volumeMultiple)} today's sales (${formatNumber(extra, 0)}% more units), if the cost per unit stays the same and nothing else changes. This is a break-even on volume, not a forecast of sales.`;

    }

    const rows = [
        ["Price after discount", rupees(d.price)],
        ["Profit per unit", rupees(d.profit)],
        ["Margin after discount", d.margin === null ? "None" : percent(d.margin)],
        [
            "Sales needed for the same total profit",
            d.state === "profit" ? times(d.volumeMultiple) : "No finite number"
        ]
    ];

    return `
                <h3 class="margin-subtitle">
                    If you offer a discount
                </h3>

                <div class="margin-compare">

                    <section
                        class="margin-compare__card"
                        aria-labelledby="margin-discount-card"
                    >

                        <h4
                            class="margin-compare__title"
                            id="margin-discount-card"
                        >
                            ${escapeHTML(plainPercent(d.percent))} off
                        </h4>

                        <p class="margin-compare__tag">
                            Per unit, at the same cost
                        </p>

                        <dl class="margin-compare__list">
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

                <p class="margin-note margin-note--plain">
                    ${escapeHTML(text)}
                </p>`;

}

function renderResults(
    result
) {

    const {
        price,
        profit,
        margin,
        markup,
        derived
    } = result;

    const metrics =
        derived
            ? [
                resultMetric({ label: "Selling price", value: rupees(price), primary: true }),
                resultMetric({ label: "Profit per unit", value: rupees(profit) }),
                resultMetric({ label: "Margin", value: percent(margin) }),
                resultMetric({ label: "Markup", value: percent(markup) })
            ]
            : [
                resultMetric({ label: "Margin", value: percent(margin), primary: true }),
                resultMetric({ label: "Selling price", value: rupees(price) }),
                resultMetric({ label: "Profit per unit", value: rupees(profit) }),
                resultMetric({ label: "Markup", value: percent(markup) })
            ];

    const lines = [
        profitLine(result),
        roundingLine(result)
    ].filter(Boolean);

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Pricing
                    </span>

                    <h2 class="calculator-results__title">
                        Your price, margin and markup
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${lines.map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                ${explainer(result)}

                <div class="margin-note margin-note--trust">
                    <strong>Per unit, for the numbers you entered.</strong>
                    Not included: overheads, fixed costs, tax or GST,
                    returns and other business costs. Enter amounts without
                    GST. This is a calculation, not pricing advice.
                </div>

                ${costTable(result)}

                ${discountSection(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const base =
        `Selling price ${rupees(result.price)}, margin ${percent(result.margin)}, markup ${percent(result.markup)}.`;

    if (result.state === "loss") {
        return `${base} The price is below your cost.`;
    }

    return base;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from the
   default cost, so the page can never disagree with it.
========================================================= */

function exampleParagraph() {

    const priced =
        calculateMargin({ cost: DEFAULTS.cost, basis: "price", value: DEFAULTS.price, discount: 10 });

    const target =
        calculateMargin({ cost: DEFAULTS.cost, basis: "margin", value: 40 });

    const rise =
        priced.rows[4];

    return `Take a cost of ${rupees(DEFAULTS.cost)} a unit sold at ${rupees(DEFAULTS.price)}. Each unit earns ${rupees(priced.profit)}: a margin of ${percent(priced.margin)} and a markup of ${percent(priced.markup)}. To earn a 40% margin on the same cost you would charge ${rupees(target.price)}. If the cost rises by 10%, the margin at ${rupees(DEFAULTS.price)} falls to ${percent(rise.margin)}, and ${rupees(rise.price)} would keep it at ${percent(priced.margin)}. If you take 10% off ${rupees(DEFAULTS.price)}, each unit earns ${rupees(priced.discount.profit)}, so you would need about ${times(priced.discount.volumeMultiple)} today's sales to earn the same total profit.`;

}


/* =========================================================
   RENDER
========================================================= */

/* the three value fields, one for each basis; only the chosen basis is shown */

function valueFields() {

    const common = (basis) =>
        `class="margin-value" data-basis="${basis}"${basis === DEFAULTS.basis ? "" : " hidden"}`;

    return `
                        <div ${common("price")}>
                            ${numberField({
                                id: IDS.price,
                                label: "Selling Price",
                                unit: "₹",
                                hint: "What you charge for one unit, without GST. It can be below your cost.",
                                min: L.price.min,
                                max: L.price.max,
                                step: 0.01,
                                value: DEFAULTS.price
                            })}
                        </div>

                        <div ${common("margin")}>
                            ${numberField({
                                id: IDS.margin,
                                label: "Target Margin",
                                unit: "% of price",
                                hint: "The share of the selling price you want to be profit, from 0% to 95%.",
                                min: L.margin.min,
                                max: L.margin.max,
                                step: 0.5,
                                value: DEFAULTS.margin
                            })}
                        </div>

                        <div ${common("markup")}>
                            ${numberField({
                                id: IDS.markup,
                                label: "Target Markup",
                                unit: "% of cost",
                                hint: "The profit you want as a share of the cost, from 0% to 1,000%.",
                                min: L.markup.min,
                                max: L.markup.max,
                                step: 1,
                                value: DEFAULTS.markup
                            })}
                        </div>`;

}

function basisControl() {

    return `
                    <fieldset
                        class="margin-basis"
                        aria-describedby="margin-basis-hint"
                    >

                        <legend class="calculator-form__label">
                            Work out from
                        </legend>

                        <div class="margin-basis__options">

                            ${Object.entries(BASES).map(
                                ([value, label]) => `
                            <label class="margin-basis__option">
                                <input
                                    type="radio"
                                    name="${BASIS_NAME}"
                                    value="${value}"${value === DEFAULTS.basis ? " checked" : ""}
                                >
                                <span>${escapeHTML(label)}</span>
                            </label>`
                            ).join("")}

                        </div>

                        <span
                            class="calculator-form__help"
                            id="margin-basis-hint"
                        >
                            Choose one. A selling price gives you the margin and markup; a target margin or markup gives you the price.
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
                        Business Tool
                    </span>

                    <h1>
                        ${TITLE}
                    </h1>

                    <p>
                        Set a selling price from a target margin or markup,
                        see margin and markup side by side, and see what a
                        cost change or a discount does to your profit.
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
                    Price Your Product
                </div>

                <p class="calculator-section__description">
                    Enter what one unit costs you, then choose what you
                    want to work from. Results update as you type.
                </p>

                <form
                    id="margin-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid">

                        ${numberField({
                            id: IDS.cost,
                            label: "Cost per Unit",
                            unit: "₹",
                            hint: "What one unit costs you, without GST.",
                            min: L.cost.min,
                            max: L.cost.max,
                            step: 0.01,
                            value: DEFAULTS.cost
                        })}

                        ${basisControl()}

                        ${valueFields()}

                        ${numberField({
                            id: IDS.discount,
                            label: "Discount (optional)",
                            unit: "% off",
                            hint: "Leave blank to skip. If you enter one, you see what it does to profit per unit and how many more sales it takes to earn the same total profit.",
                            min: L.discount.min,
                            max: L.discount.max,
                            step: 0.5,
                            value: DEFAULTS.discount,
                            required: false
                        })}

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="margin-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="margin-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="margin-live"
                class="margin-sr-only"
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
                        Enter what one unit costs you, without GST.
                    </li>
                    <li>
                        Choose what you know: a selling price, or the margin
                        or markup you want. Enter that figure.
                    </li>
                    <li>
                        Optionally enter a discount to see what it does to
                        profit per unit.
                    </li>
                    <li>
                        Read the price, margin and markup, then the table of
                        cost changes. Results update as you change any value.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>Margin and markup are not the same.</strong>
                    Margin is profit as a share of the selling price; markup
                    is profit as a share of the cost. A 25% markup is a 20%
                    margin, which is why adding a margin percentage to the
                    cost gives a lower price than the margin you meant.
                </p>

                <p>
                    <strong>A target gives you a price.</strong> The price
                    for a target margin is the cost divided by one minus the
                    margin. For a target markup it is the cost times one plus
                    the markup. A price that needs rounding is rounded up to
                    the next paisa.
                </p>

                <p>
                    <strong>A cost change moves your margin.</strong> The
                    table shows the margin at your current price if the cost
                    rises or falls, and the price that keeps the margin you
                    have now.
                </p>

                <p>
                    <strong>A discount is paid for in volume.</strong> A
                    discount cuts the profit on every unit, so selling the
                    same total profit takes more units. The calculator shows
                    how many times today's sales that is, with the cost per
                    unit unchanged.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        The cost is per unit and is the same for every unit.
                    </li>
                    <li>
                        Margin and markup are per unit. Overheads, fixed
                        costs, tax, returns, payment charges and other
                        business costs are not included.
                    </li>
                    <li>
                        Enter amounts without GST. No tax is calculated.
                    </li>
                    <li>
                        A discount applies to the selling price and leaves the
                        cost per unit unchanged. The volume figure is the
                        number of sales needed to earn the same total profit,
                        not a forecast of what will be sold.
                    </li>
                    <li>
                        Nothing here depends on a rate, a rule or a date.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not a
                    prediction and not advice. See the
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
                    profit = price - cost
                </p>

                <p>
                    margin = profit ÷ price, and markup = profit ÷ cost
                </p>

                <p>
                    From a target, the price is cost ÷ (1 - margin) for a
                    margin, or cost × (1 + markup) for a markup, rounded up to
                    the next paisa. Profit, margin and markup are then worked
                    out from that rounded price.
                </p>

                <p>
                    When the cost changes, the price that keeps your margin
                    is your price times the new cost divided by the old cost.
                    With a discount, the sales needed for the same total
                    profit are the profit per unit before the discount
                    divided by the profit per unit after it.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        What is the difference between margin and markup?
                    </summary>
                    <p>
                        Both describe the same profit. Margin compares it with
                        the selling price and markup compares it with the cost,
                        so markup is always the larger number when there is a
                        profit. A ₹600 item sold at ₹800 has a 25% margin and
                        a 33.33% markup.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the price rounded up?
                    </summary>
                    <p>
                        A price is in whole paise. Rounding to the nearest
                        paisa can leave the margin a hair below the target, so
                        a price worked out from a target is rounded up and the
                        margin and markup shown are those of the rounded price.
                    </p>
                </details>

                <details>
                    <summary>
                        What does the discount figure mean?
                    </summary>
                    <p>
                        It is the number of times today's sales you would need
                        at the discounted price to earn the same total profit,
                        if the cost per unit stays the same. It is a
                        break-even on volume. It does not say whether sales
                        will rise.
                    </p>
                </details>

                <details>
                    <summary>
                        Does the calculator tell me whether my margin is enough?
                    </summary>
                    <p>
                        No. It calculates the figures for the numbers you
                        enter. What a margin has to cover depends on your
                        overheads, fixed costs and other costs, which are not
                        part of this calculation.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it include GST?
                    </summary>
                    <p>
                        No. Enter the cost and the selling price without GST.
                        No tax is calculated.
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
   Binds the fields, the basis control, the live results and
   reset.
========================================================= */

export function init() {

    const form =
        document.querySelector("#margin-form");

    const results =
        document.querySelector("#margin-results");

    const live =
        document.querySelector("#margin-live");

    const resetButton =
        document.querySelector("#margin-reset");

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

    const wrappers =
        [...form.querySelectorAll(".margin-value")];

    const radios =
        [...form.querySelectorAll(`input[name="${BASIS_NAME}"]`)];

    const basisOf = () =>
        radios.find(radio => radio.checked)?.value ?? DEFAULTS.basis;

    /* only the value field of the chosen basis is shown (and checked) */

    function showBasis() {

        const basis =
            basisOf();

        for (const wrapper of wrappers) {
            wrapper.hidden = wrapper.dataset.basis !== basis;
        }

    }

    let announceTimer = null;

    let lastResult = null;

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

        const basis =
            basisOf();

        const active =
            inputs[basis];

        clearFieldsInvalid(
            Object.values(inputs),
            ERROR_ID
        );

        const raw = {
            cost: inputs.cost.value,
            basis,
            value: active.value,
            discount: inputs.discount.value
        };

        /* a required field that is still empty is not an error yet */

        if (
            String(raw.cost).trim() === "" ||
            String(raw.value).trim() === ""
        ) {

            lastResult = null;

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        const check =
            validateMarginInputs(raw);

        if (!check.ok) {

            lastResult = null;

            const byName = {
                cost: inputs.cost,
                value: active,
                discount: inputs.discount
            };

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
                        byName[name]
                ).filter(Boolean),
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
            calculateMargin(check.values);

        lastResult =
            result;

        results.innerHTML =
            renderResults(result);

        if (speak) {
            announce(liveSummary(result));
        }

    }

    /*
     * Changing the basis keeps the cost and carries the figures of
     * the current result into the other fields, so the visitor can
     * look at the same price as a margin or a markup without retyping.
     */

    function carryAcross() {

        if (!lastResult) {
            return;
        }

        const {
            price,
            margin,
            markup
        } = lastResult;

        const fill = (input, value, limits) => {

            if (value >= limits.min && value <= limits.max) {
                input.value = String(Number(value.toFixed(4)));
            }

        };

        fill(inputs.price, price, L.price);
        fill(inputs.margin, margin * 100, L.margin);
        fill(inputs.markup, markup * 100, L.markup);

    }

    form.addEventListener(
        "input",
        event => {

            if (event.target.name === BASIS_NAME) {
                carryAcross();
                showBasis();
            }

            update();

        }
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
                radio.checked = radio.value === DEFAULTS.basis;
            }

            showBasis();

            update({ speak: false });

            if (live) {
                clearTimeout(announceTimer);
                live.textContent = "";
            }

        }
    );

    /* the first result, without announcing it */

    showBasis();

    update({ speak: false });

}
