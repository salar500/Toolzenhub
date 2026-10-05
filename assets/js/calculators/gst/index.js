/* =========================================================
   ToolZen Hub
   GST Calculator

   For anyone raising, quoting or checking an invoice or bill:
   add GST to an amount, or take it out of an amount that already
   includes it, for up to four items, with the amount before GST, the
   GST, the amount with GST, the GST as a share of the final amount,
   and a breakdown by rate.

   THIS CALCULATES FROM THE RATE THE VISITOR ENTERS. It never says
   which rate applies, never classifies a product or a service, and
   never calls an invoice correct or compliant. It states plainly,
   next to the result, how it rounds and what it leaves out.

   The maths is in formulas/gst.js (pure, tested against an
   independent reference). This file reads the fields, asks that
   module to validate and calculate, and shows the answer. It owns
   the wording and the layout; the shared UI (ui/) only wires
   labels, hints and errors.

   Everything is calculated in the browser. Nothing is sent anywhere
   and nothing is stored. The results update as you type, so there is
   no Calculate button.
========================================================= */

import {
    calculateGst,
    validateGstInputs,
    GST_LIMITS
} from "../formulas/gst.js";

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
    getCalculatorById("gst").title;


/* =========================================================
   FIELDS
========================================================= */

const ITEMS = [1, 2, 3, 4];

const IDS = Object.fromEntries(
    ITEMS.flatMap(
        n => [
            [`amount${n}`, `gst-amount-${n}`],
            [`rate${n}`, `gst-rate-${n}`]
        ]
    )
);

const MODE_NAME = "gst-mode";

const MODES = {
    add: "Add GST",
    remove: "Remove GST"
};

const ERROR_ID =
    "gst-results-error";

const DEFAULTS = {
    mode: "add",
    amount1: 10000,
    rate1: 18,
    amount2: "",
    rate2: "",
    amount3: "",
    rate3: "",
    amount4: "",
    rate4: ""
};

const EMPTY_MESSAGE =
    "Enter an amount and a GST rate to see the amount before GST, the GST and the amount with GST.";

const AMOUNT_MIN = GST_LIMITS.amountPaise.min / 100;
const AMOUNT_MAX = GST_LIMITS.amountPaise.max / 100;
const RATE_MAX = GST_LIMITS.rateHundredths.max / 100;


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

/* money arrives as whole paise */
const rupees = (paise) => paiseFormatter.format(paise / 100);

const rateText = (hundredths) => `${hundredths / 100}%`;

const shareText = (hundredths) => `${(hundredths / 100).toFixed(2)}%`;


/* =========================================================
   RESULTS (HTML)
========================================================= */

function summaryLines(
    result
) {

    const {
        mode,
        itemCount,
        items,
        total
    } = result;

    const single = itemCount === 1;
    const rate = items[0].rateHundredths;

    const lines = [];

    if (mode === "add") {

        lines.push(
            single
                ? `${rupees(total.beforePaise)} before GST at your entered ${rateText(rate)} rate becomes ${rupees(total.withPaise)}, including ${rupees(total.gstPaise)} GST.`
                : `${itemCount} items, ${rupees(total.beforePaise)} before GST in all, become ${rupees(total.withPaise)}, including ${rupees(total.gstPaise)} GST, each item at its own entered rate.`
        );

    } else {

        lines.push(
            single
                ? `${rupees(total.withPaise)} including GST at your entered ${rateText(rate)} rate contains ${rupees(total.beforePaise)} before GST and ${rupees(total.gstPaise)} GST.`
                : `${itemCount} items, ${rupees(total.withPaise)} including GST in all, contain ${rupees(total.beforePaise)} before GST and ${rupees(total.gstPaise)} GST, each item at its own entered rate.`
        );

    }

    lines.push(
        single
            ? `The GST is ${shareText(total.shareHundredths)} of the final amount, not the ${rateText(rate)} rate you entered: the rate applies to the amount before GST.`
            : `The GST is ${shareText(total.shareHundredths)} of the final amount. Each item is worked out and rounded to the paisa on its own, and the items are then added.`
    );

    return lines;

}

function byRateSection(
    result
) {

    if (result.itemCount < 2) {
        return "";
    }

    const rows = result.byRate;

    return `
                <h3 class="gst-subtitle">
                    The tax by rate
                </h3>

                <div
                    class="calculator-results__table-wrapper"
                    role="region"
                    tabindex="0"
                    aria-label="The invoice grouped by GST rate: the amount before GST, the GST and the amount with GST for each rate, and the total"
                >

                    <table class="calculator-results__table gst-table">

                        <caption class="gst-sr-only">
                            The items grouped by the GST rate entered, in ascending order, with the amount before GST, the GST and the amount with GST for each rate and in total.
                        </caption>

                        <thead>
                            <tr>
                                <th scope="col">GST Rate</th>
                                <th scope="col">Amount Before GST</th>
                                <th scope="col">GST</th>
                                <th scope="col">Amount With GST</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${rows.map(
                                row => `
                            <tr>
                                <th scope="row">${escapeHTML(rateText(row.rateHundredths))}</th>
                                <td>${escapeHTML(rupees(row.beforePaise))}</td>
                                <td>${escapeHTML(rupees(row.gstPaise))}</td>
                                <td>${escapeHTML(rupees(row.withPaise))}</td>
                            </tr>`
                            ).join("")}
                        </tbody>

                        <tfoot>
                            <tr>
                                <th scope="row">Total</th>
                                <td>${escapeHTML(rupees(result.total.beforePaise))}</td>
                                <td>${escapeHTML(rupees(result.total.gstPaise))}</td>
                                <td>${escapeHTML(rupees(result.total.withPaise))}</td>
                            </tr>
                        </tfoot>

                    </table>

                </div>

                <p class="gst-note">
                    Items with the same rate are added together. Each item is rounded to the paisa on its own before the items are added, so a total can differ by a paisa from GST worked out once on the grand total.
                </p>`;

}

function renderResults(
    result
) {

    const { mode, total } = result;

    const withGst = { label: "Amount with GST", value: rupees(total.withPaise) };
    const beforeGst = { label: "Amount before GST", value: rupees(total.beforePaise) };

    const [primary, other] =
        mode === "add"
            ? [withGst, beforeGst]
            : [beforeGst, withGst];

    const metrics = [
        resultMetric({ ...primary, primary: true }),
        resultMetric(other),
        resultMetric({ label: "GST", value: rupees(total.gstPaise) }),
        resultMetric({ label: "GST as a share of the final amount", value: shareText(total.shareHundredths) })
    ];

    return `
            <div class="calculator-results__card">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title">
                        ${mode === "add" ? "The amount with GST" : "The amount before GST"}
                    </h2>

                </div>

                <div class="calculator-results__grid">
                    ${metrics.join("")}
                </div>

                <div class="calculator-results__summary">
                    ${summaryLines(result).map(line => `<p>${escapeHTML(line)}</p>`).join("\n                    ")}
                </div>

                <div class="gst-note gst-note--trust">
                    <strong>Calculated from the rate you entered.</strong>
                    This does not decide whether GST applies or which rate
                    applies, and it does not classify a product or a service.
                    Each item is rounded to the nearest paisa (half up) and the
                    items are then added; another billing system may round the
                    grand total instead and differ by a paisa. Not included:
                    HSN or SAC classification, place of supply, reverse charge,
                    input tax credit, cess, returns, e-invoicing and any other
                    compliance matter. This is a calculation, not tax advice.
                </div>

                ${byRateSection(result)}

            </div>
        `;

}


/* =========================================================
   ONE-LINE SUMMARY (read out by screen readers)
========================================================= */

function liveSummary(
    result
) {

    const { mode, total } = result;

    return mode === "add"
        ? `Amount with GST ${rupees(total.withPaise)}; GST ${rupees(total.gstPaise)}.`
        : `Amount before GST ${rupees(total.beforePaise)}; GST ${rupees(total.gstPaise)}.`;

}


/* =========================================================
   WORKED EXAMPLE
   Worked out by the same engine as the calculator, from fixed
   example values, so the page can never disagree with it.
========================================================= */

function run(mode, list) {

    const check =
        validateGstInputs({ mode, items: list });

    return calculateGst(check.values);

}

function exampleParagraph() {

    const add = run("add", [{ amount: "1000", rate: "18" }]).total;
    const remove = run("remove", [{ amount: "1180", rate: "18" }]).total;
    const mixed = run("add", [
        { amount: "1000", rate: "5" },
        { amount: "2000", rate: "18" },
        { amount: "500", rate: "18" }
    ]);

    return `Take ${rupees(add.beforePaise)} before GST at an entered 18% rate. The GST is ${rupees(add.gstPaise)} and the amount with GST is ${rupees(add.withPaise)}, so the GST is ${shareText(add.shareHundredths)} of the final amount. Going back, ${rupees(remove.withPaise)} including GST at 18% contains ${rupees(remove.beforePaise)} before GST and ${rupees(remove.gstPaise)} GST. For three items of ${rupees(100000)}, ${rupees(200000)} and ${rupees(50000)} before GST, the first at 5% and the others at 18%, the GST is ${rupees(mixed.byRate[0].gstPaise)} at 5% and ${rupees(mixed.byRate[1].gstPaise)} at 18%: ${rupees(mixed.total.gstPaise)} in all, and ${rupees(mixed.total.withPaise)} with GST.`;

}


/* =========================================================
   MARKUP
   The page's static HTML. The site build renders this into the
   generated page, so search engines and visitors without scripts
   see the heading, the explanation and the FAQ.
========================================================= */

function modeControl() {

    return `
                        <fieldset
                            class="gst-mode"
                            aria-describedby="gst-mode-hint"
                        >

                            <legend class="calculator-form__label">
                                What You Are Starting From
                            </legend>

                            <div class="gst-mode__options">

                                ${Object.entries(MODES).map(
                                    ([value, label]) => `
                                <label class="gst-mode__option">
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
                                id="gst-mode-hint"
                            >
                                Add GST: I have an amount before GST. Remove GST: I have an amount that already includes GST.
                            </span>

                        </fieldset>`;

}

function itemFields(
    n
) {

    const first = n === 1;

    return `
                        <fieldset class="gst-item">

                            <legend class="calculator-form__label">
                                Item ${n}${first ? "" : " (optional)"}
                            </legend>

                            <div class="gst-pair">

                                ${numberField({
                                    id: IDS[`amount${n}`],
                                    label: "Amount",
                                    unit: "₹",
                                    hint: first
                                        ? "Before GST when adding GST, including GST when removing it."
                                        : "Leave blank to skip this item.",
                                    min: AMOUNT_MIN,
                                    max: AMOUNT_MAX,
                                    step: 1,
                                    value: DEFAULTS[`amount${n}`],
                                    required: first
                                })}

                                ${numberField({
                                    id: IDS[`rate${n}`],
                                    label: "GST Rate",
                                    unit: "%",
                                    hint: first
                                        ? "The rate you are charging or were charged. 18% is only an example."
                                        : "Leave blank to use Item 1's rate.",
                                    min: 0,
                                    max: RATE_MAX,
                                    step: 0.5,
                                    value: DEFAULTS[`rate${n}`],
                                    required: first
                                })}

                            </div>

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
                        Add GST to an amount or take it out of one, for the
                        rate you enter, across up to four items, with the tax
                        by rate.
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
                    Add or Remove GST
                </div>

                <p class="calculator-section__description">
                    Choose what you are starting from, then enter the amount
                    and the rate. Results update as you type.
                </p>

                <form
                    id="gst-form"
                    class="calculator-form"
                    novalidate
                >

                    ${modeControl()}

                    <div class="calculator-form__grid gst-first-item">

                        ${itemFields(1)}

                    </div>


                    <!-- MORE ITEMS -->

                    <div class="gst-more">

                        <h3 class="gst-more__title">
                            More Items (optional)
                        </h3>

                        <p class="gst-more__text">
                            For an invoice with several items, add up to three more. A
                            blank rate uses Item 1's. Leave an amount blank to skip an item.
                        </p>

                        <div class="calculator-form__grid">

                            ${[2, 3, 4].map(itemFields).join("")}

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="gst-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="gst-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="gst-live"
                class="gst-sr-only"
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
                        Choose Add GST if your amount is before GST, or Remove
                        GST if it already includes GST.
                    </li>
                    <li>
                        Enter the amount and the GST rate for Item 1.
                    </li>
                    <li>
                        For an invoice with several items, fill Items 2 to 4.
                        A blank rate uses Item 1's rate.
                    </li>
                    <li>
                        Read the amount before GST, the GST and the amount
                        with GST. Results update as you change any value.
                    </li>
                </ol>

            </section>


            <!-- READING THE RESULT -->

            <section class="calculator-info">

                <h2>
                    Reading the Result
                </h2>

                <p>
                    <strong>Adding GST.</strong> The GST is the rate applied
                    to the amount before GST. The amount with GST is the two
                    added together.
                </p>

                <p>
                    <strong>Removing GST.</strong> The amount with GST is the
                    amount before GST plus the GST, so the amount before GST
                    is not found by subtracting the rate from the total.
                    ₹1,180 less 18% would give ₹967.60; the amount before GST
                    is ₹1,000.00 and the GST is ₹180.00.
                </p>

                <p>
                    <strong>The GST as a share of the final amount</strong>
                    is the GST divided by the amount with GST. It is smaller
                    than the rate you entered, because the rate applies to the
                    smaller amount before GST.
                </p>

                <p>
                    <strong>Several items.</strong> Each item is worked out
                    and rounded to the paisa on its own, and the totals add
                    the items. The table groups them by rate.
                </p>

            </section>


            <!-- ASSUMPTIONS AND WHAT IS NOT INCLUDED -->

            <section class="calculator-info">

                <h2>
                    Assumptions and What Is Not Included
                </h2>

                <ul>
                    <li>
                        The rate is the one you enter. This calculator does
                        not know which rate applies to a product or a service,
                        and it does not classify either.
                    </li>
                    <li>
                        Each item is rounded to the nearest paisa (half up)
                        before the items are added. Another billing system may
                        round the grand total instead and differ by a paisa.
                    </li>
                    <li>
                        Not included: HSN or SAC classification, place of
                        supply, reverse charge, input tax credit, cess,
                        returns and e-invoicing.
                    </li>
                </ul>

                <p>
                    This is arithmetic on the numbers you enter, not tax
                    advice. See the <a href="${ROUTES.disclaimer}">disclaimer</a>.
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
                    Adding: GST = amount before GST × rate ÷ 100, rounded to
                    the paisa. Amount with GST = amount before GST + GST.
                </p>

                <p>
                    Removing: the amount before GST is the whole paisa nearest
                    to amount with GST × 100 ÷ (100 + rate), and the GST is
                    what is left, so the two always add up to the amount you
                    entered.
                </p>

                <p>
                    GST as a share of the final amount = GST ÷ amount with
                    GST. Totals add the items, each rounded on its own.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        How do I take GST out of a price that includes it?
                    </summary>
                    <p>
                        Choose Remove GST and enter the price with GST and the
                        rate. The calculator divides by one plus the rate, not
                        subtracts the rate: ₹1,180 at 18% is ₹1,000.00 before
                        GST and ₹180.00 of GST.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the GST a smaller share than the rate?
                    </summary>
                    <p>
                        The rate applies to the amount before GST. The final
                        amount is larger, so the same GST is a smaller share
                        of it: ₹180 is 18% of ₹1,000 but 15.25% of ₹1,180.
                    </p>
                </details>

                <details>
                    <summary>
                        Will adding GST and then removing it give my amount back?
                    </summary>
                    <p>
                        In testing, yes: every amount from ₹0.01 to ₹2,000.00,
                        at seven different rates, came back exactly. That is
                        the range that was checked.
                    </p>
                </details>

                <details>
                    <summary>
                        Why can my invoice software show a paisa more or less?
                    </summary>
                    <p>
                        This calculator rounds each item to the paisa and then
                        adds the items. Some systems round the grand total
                        instead, and the two can differ by a paisa.
                    </p>
                </details>

                <details>
                    <summary>
                        Does it tell me which GST rate to use?
                    </summary>
                    <p>
                        No. You enter the rate. This calculator does not know
                        which rate applies to a product or a service.
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
        document.querySelector("#gst-form");

    const results =
        document.querySelector("#gst-results");

    const live =
        document.querySelector("#gst-live");

    const resetButton =
        document.querySelector("#gst-reset");

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

        const mode =
            radios.find(radio => radio.checked)?.value ?? DEFAULTS.mode;

        const raw = {
            mode,
            items: ITEMS.map(
                n => ({
                    amount: inputs[`amount${n}`].value,
                    rate: inputs[`rate${n}`].value
                })
            )
        };

        /* Item 1 still empty is not an error yet */
        if (
            String(raw.items[0].amount).trim() === "" ||
            String(raw.items[0].rate).trim() === ""
        ) {

            results.innerHTML =
                resultEmpty(EMPTY_MESSAGE);

            if (speak) {
                announce("");
            }

            return;

        }

        const check =
            validateGstInputs(raw);

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
            calculateGst(check.values);

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
