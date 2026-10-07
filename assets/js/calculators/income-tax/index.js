/* =========================================================
   ToolZen Hub
   Old vs New Tax Regime Calculator (Tax)

   Decision support: for the supported taxpayer and the supported
   income, which regime gives the lower ESTIMATED tax, by how much,
   and how much deduction the old regime would need to match.

   WHAT THIS PAGE WILL NOT DO. It never says which regime to choose,
   never verifies that a deduction is allowed, and never works
   outside its stated scope (a resident individual under 60 with
   salary or pension income, up to Rs 50,00,000, tax year 2026-27).
   Anything else is refused with a reason, not approximated.

   Every rule and number comes from the tax-year configuration
   (formulas/income-tax-config.js); the arithmetic is in
   formulas/income-tax.js (pure, tested against an independent
   Python reference). This file reads the fields, asks the engine,
   and owns the wording and the layout. Everything is calculated
   in the browser: nothing is sent anywhere or stored.

   The results update as you type; only a SETTLED result is
   announced to a screen reader, and only once.
========================================================= */

import {
    calculate,
    FIELD_MAX
} from "../formulas/income-tax.js";

import {
    ACTIVE_TAX_YEAR
} from "../formulas/income-tax-config.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    numberField,
    fieldShell,
    setFieldsInvalid,
    clearFieldsInvalid
} from "../../ui/field.js";

import {
    escapeHTML
} from "../../ui/escape.js";


const TITLE =
    getCalculatorById("income-tax").title;

const HOME_LOAN =
    getCalculatorById("home-loan");

const YEAR = ACTIVE_TAX_YEAR;

const CAPS = YEAR.caps;


/* =========================================================
   WORDING HELPERS
========================================================= */

const rupeeFormatter =
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });

/* whole rupees */
const rupees = (value) => rupeeFormatter.format(value);

/* an internal amount in paise, shown to the nearest rupee */
const paise = (value) => rupees(Math.round(value / 100));

const percentText = (permille) =>
    permille === null ? "" : `${(permille / 10).toFixed(1)}%`;

const verifiedText = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
}).format(new Date(`${YEAR.verifiedOn}T00:00:00Z`));

const CEILING_TEXT = rupees(YEAR.supportedIncomeCeiling);

const LIMIT_MESSAGE =
    `This version supports total income up to ₹50 lakh. Higher incomes may require surcharge and marginal-relief calculations that are not included.`;

const EMPTY_MESSAGE =
    "Enter your annual salary or pension income to compare the two regimes.";


/* =========================================================
   FIELDS
========================================================= */

const ID = {
    salary: "it-salary",
    otherIncome: "it-other",
    basicPlusDa: "it-basic",
    section80C: "it-80c",
    ownNps: "it-nps",
    healthSelfFamily: "it-health-self",
    healthParents: "it-health-parents",
    parentsSenior: "it-parents-age",
    professionalTax: "it-ptax",
    homeLoanInterest: "it-home-interest",
    homeLoanOtherPurpose: "it-home-kind",
    hraReceived: "it-hra",
    rentPaid: "it-rent",
    highCity: "it-city",
    hraManual: "it-hra-manual",
    employerNps: "it-employer-nps",
    employerGovernment: "it-employer-gov",
    otherDeductions: "it-other-ded"
};

const NUMBER_FIELDS = [
    "salary", "otherIncome", "basicPlusDa", "section80C", "ownNps",
    "healthSelfFamily", "healthParents", "professionalTax", "homeLoanInterest",
    "hraReceived", "rentPaid", "hraManual", "employerNps", "otherDeductions"
];

const ERROR_ID = "it-results-error";

const moneyField = (options) =>
    numberField({
        min: 0,
        step: 1,
        unit: "₹",
        required: false,
        ...options
    }).replace(
        /\s*<\/div>\s*$/,
        `
                            <span class="it-echo" id="${options.id}-echo" aria-hidden="true"></span>
                        </div>`
    );

const selectField = ({ id, label, hint, options }) =>
    fieldShell({
        id,
        label,
        hint,
        control: `<select
                                    id="${id}"
                                    class="calculator-form__select"${hint ? `
                                    aria-describedby="${id}-hint"` : ""}
                                >
                                    ${options.map(([value, text]) => `<option value="${value}">${escapeHTML(text)}</option>`).join("\n")}
                                </select>`
    });


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the build.
========================================================= */

export function markup() {

    const sources = YEAR.sources.map(source => `
                    <li>
                        <a href="${escapeHTML(source.url)}" rel="noopener">${escapeHTML(source.title)}</a>
                        <span class="it-source__meta">${escapeHTML(source.publisher)}. Used for: ${escapeHTML(source.topic.charAt(0).toLowerCase() + source.topic.slice(1))}.</span>
                    </li>`).join("");

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
                        See the estimated income tax under the old and the new
                        regime side by side, for ${escapeHTML(YEAR.label)}, and
                        how much deduction the old regime would need to match.
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

                <p class="it-year">
                    <strong>${escapeHTML(YEAR.label)}</strong>
                    <span>Rules checked on ${escapeHTML(verifiedText)}</span>
                </p>

                <p id="it-stale" class="it-stale" hidden>
                    These rules are for ${escapeHTML(YEAR.label)}, which has ended.
                    Do not rely on this calculator for a later year: the rules
                    may have changed.
                </p>

                <div class="it-scope">

                    <h2 class="it-scope__title">
                        What this calculates
                    </h2>

                    <ul class="it-scope__list">
                        <li>Resident individuals under 60 with salary or pension income</li>
                        <li>Total income up to ${escapeHTML(CEILING_TEXT)}, so no surcharge</li>
                        <li>Income taxed at normal slab rates only: no capital gains, dividends, winnings, crypto, rent or business income</li>
                        <li>An estimate for ${escapeHTML(YEAR.label)}, not tax advice and not a return</li>
                    </ul>

                </div>

                <form
                    id="it-form"
                    class="calculator-form"
                    novalidate
                >

                    <!-- STEP 1 -->

                    <h2 class="it-step__title">
                        <span class="it-step__number">1</span>
                        Your income
                    </h2>

                    <div class="calculator-form__grid">

                        ${moneyField({
                            id: ID.salary,
                            label: "Annual salary or pension income",
                            hint: "Your total pay for the year before any deduction, as in your Form 16. Pension counts as salary. Include your employer's NPS contribution if it is part of the amount."
                        })}

                        ${moneyField({
                            id: ID.otherIncome,
                            label: "Other income taxed at normal rates (optional)",
                            hint: "For example, interest you earn. Do not include capital gains, dividends, winnings, rent or business income: they are not supported."
                        })}

                        ${moneyField({
                            id: ID.basicPlusDa,
                            label: "Basic salary plus DA (optional)",
                            hint: "Needed only for the HRA exemption and the employer NPS limit. DA counts if your terms of employment provide it."
                        })}

                    </div>


                    <!-- STEP 2 -->

                    <details class="it-step" id="it-deductions">

                        <summary>
                            <span class="it-step__number">2</span>
                            Deductions that apply to you
                            <span class="it-step__hint">Old regime only, unless stated</span>
                        </summary>

                        <p class="it-note">
                            This calculator does not check that you are eligible.
                            Enter what you are sure of; each limit is applied for you.
                            The new regime allows almost none of these.
                        </p>

                        <div class="calculator-form__grid">

                            ${moneyField({
                                id: ID.section80C,
                                label: "Investments and payments under section 123 (80C)",
                                hint: `Such as life insurance premium and provident fund contributions (the full list is in Schedule XV of the Act). Limit ${rupees(CAPS.section80C)}.`
                            })}

                            ${moneyField({
                                id: ID.ownNps,
                                label: "Your own NPS contribution",
                                hint: `Your contribution, not your employer's. Limit ${rupees(CAPS.ownNps)} (section 124(3)).`
                            })}

                            ${moneyField({
                                id: ID.healthSelfFamily,
                                label: "Health insurance: you, spouse and children",
                                hint: `Premium paid, none of them aged 60 or more. Limit ${rupees(CAPS.healthSelfFamily)} (section 126).`
                            })}

                            ${moneyField({
                                id: ID.healthParents,
                                label: "Health insurance: your parents",
                                hint: "Premium paid for your parents (section 126)."
                            })}

                            ${selectField({
                                id: ID.parentsSenior,
                                label: "Your parents' age",
                                hint: `Under 60: limit ${rupees(CAPS.healthParentsUnder60)}. Aged 60 or more: ${rupees(CAPS.healthParentsSenior)}. If only one is 60 or more, enter the total allowed in "Other eligible deductions" instead.`,
                                options: [
                                    ["no", `Under 60 (limit ${rupees(CAPS.healthParentsUnder60)})`],
                                    ["yes", `Aged 60 or more (limit ${rupees(CAPS.healthParentsSenior)})`]
                                ]
                            })}

                            ${moneyField({
                                id: ID.professionalTax,
                                label: "Professional tax paid (old regime only)",
                                hint: "Tax on employment deducted from your salary."
                            })}

                            ${moneyField({
                                id: ID.homeLoanInterest,
                                label: "Home loan interest, house you live in",
                                hint: "Interest for the year on a loan for your own home. Not for a house you let out. Old regime only."
                            })}

                            ${selectField({
                                id: ID.homeLoanOtherPurpose,
                                label: "That loan was taken for",
                                hint: `Buying or building, finished within five years of the year you borrowed: limit ${rupees(CAPS.homeLoanInterestStandard)} (section 22). Anything else, such as repairs: ${rupees(CAPS.homeLoanInterestOther)}.`,
                                options: [
                                    ["no", `Buying or building (limit ${rupees(CAPS.homeLoanInterestStandard)})`],
                                    ["yes", `Something else (limit ${rupees(CAPS.homeLoanInterestOther)})`]
                                ]
                            })}

                        </div>

                        <p class="it-note">
                            To estimate a year's interest, use the
                            <a href="${HOME_LOAN.href}">${escapeHTML(HOME_LOAN.title)}</a>.
                        </p>


                        <!-- HRA -->

                        <fieldset class="it-hra">

                            <legend>
                                House rent allowance (HRA), old regime only
                            </legend>

                            <p class="it-note">
                                Worked out from rule 279 of the Income-tax Rules,
                                2026, for a full year in one city with one
                                landlord. Uses your Basic salary plus DA above.
                            </p>

                            <div class="it-radios" role="radiogroup" aria-label="How to enter the HRA exemption">

                                <label class="calculator-form__choice">
                                    <input type="radio" name="it-hra-mode" value="calculate" checked>
                                    <span>Work it out for me</span>
                                </label>

                                <label class="calculator-form__choice">
                                    <input type="radio" name="it-hra-mode" value="manual">
                                    <span>I know my exemption</span>
                                </label>

                            </div>

                            <div id="it-hra-calc" class="calculator-form__grid">

                                ${moneyField({
                                    id: ID.hraReceived,
                                    label: "HRA you receive in the year"
                                })}

                                ${moneyField({
                                    id: ID.rentPaid,
                                    label: "Rent you pay in the year"
                                })}

                                ${selectField({
                                    id: ID.highCity,
                                    label: "Where you live",
                                    hint: `The 50% cities are ${YEAR.hra.highCities.slice(0, -1).join(", ")} and ${YEAR.hra.highCities.at(-1)}.`,
                                    options: [
                                        ["no", "Any other city (40% of salary)"],
                                        ["yes", "One of those cities (50% of salary)"]
                                    ]
                                })}

                            </div>

                            <div id="it-hra-known" class="calculator-form__grid" hidden>

                                ${moneyField({
                                    id: ID.hraManual,
                                    label: "Your HRA exemption for the year",
                                    hint: "Use this for part-year, several cities or other cases the helper does not cover."
                                })}

                            </div>

                            <p id="it-hra-result" class="it-hra__result" hidden></p>

                        </fieldset>


                        <!-- ADVANCED -->

                        <details class="it-advanced">

                            <summary>
                                Advanced
                            </summary>

                            <div class="calculator-form__grid">

                                ${moneyField({
                                    id: ID.employerNps,
                                    label: "Your employer's NPS contribution",
                                    hint: "The limit is a share of your Basic salary plus DA (entered above): 14% in the new regime, 10% in the old (14% if your employer is the Central or a State Government)."
                                })}

                                <div class="calculator-form__group">
                                    <label class="calculator-form__choice">
                                        <input type="checkbox" id="${ID.employerGovernment}">
                                        <span>My employer is the Central or a State Government</span>
                                    </label>
                                </div>

                                ${moneyField({
                                    id: ID.otherDeductions,
                                    label: "Other eligible old-regime deductions",
                                    hint: "Anything else you are sure the old regime allows, for example interest on an education loan. The calculator does not check eligibility or limits for this amount."
                                })}

                            </div>

                        </details>

                    </details>


                    <div class="calculator-form__actions">

                        <button
                            type="button"
                            id="it-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <section
                id="it-results"
                class="calculator-results it-results"
                aria-labelledby="it-results-title"
            >
                <h2 id="it-results-title" class="it-step__title">
                    <span class="it-step__number">3</span>
                    Compare the regimes
                </h2>

                <div id="it-results-body">
                    <p class="it-empty">${EMPTY_MESSAGE}</p>
                </div>
            </section>

            <p
                id="it-live"
                class="it-sr-only"
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
                        Enter your annual salary or pension income. The
                        standard deduction is applied for you.
                    </li>
                    <li>
                        Open "Deductions that apply to you" and add what you
                        are sure of. The limits are applied for you and shown.
                    </li>
                    <li>
                        Read the estimated tax under each regime and the
                        difference. Open the breakdown to see how each was
                        worked out.
                    </li>
                    <li>
                        The break-even shows how much old-regime deduction
                        would make the two equal, so you can see how far your
                        deductions are from it.
                    </li>
                </ol>

            </section>


            <!-- THE REGIMES -->

            <section class="calculator-info">

                <h2>
                    How the Two Regimes Differ for ${escapeHTML(YEAR.label)}
                </h2>

                <p>
                    The new regime (section 202 of the Income-tax Act, 2025) has
                    lower slab rates, a ${rupees(YEAR.standardDeduction.new)}
                    standard deduction and a rebate that makes income up to
                    ${rupees(YEAR.rebate.new.maxTotalIncome)} tax-free, with
                    marginal relief just above it. It does not allow the old
                    regime's exemptions and deductions, such as HRA, the
                    section 123 (80C) deduction, health insurance, own NPS
                    contributions, home loan interest on the house you live in
                    and professional tax. It does allow the employer's NPS
                    contribution.
                </p>

                <p>
                    The old regime has higher slab rates, a
                    ${rupees(YEAR.standardDeduction.old)} standard deduction,
                    a rebate only up to ${rupees(YEAR.rebate.old.maxTotalIncome)}
                    of total income, and the deductions this calculator lets you
                    enter. Both add ${YEAR.cessPercent}% Health and Education
                    Cess, and the final amount is rounded to the nearest ten
                    rupees (section 516).
                </p>

            </section>


            <!-- RULES AND SOURCES -->

            <section class="calculator-info">

                <h2>
                    Rules and Sources
                </h2>

                <p>
                    Every number here is for ${escapeHTML(YEAR.label)} and was
                    checked against these official texts on
                    ${escapeHTML(verifiedText)}:
                </p>

                <ul class="it-sources">${sources}
                </ul>

                <p>
                    Section numbers are those of the Income-tax Act, 2025, which
                    applies from 1 April 2026; the rebate in section 156 is the
                    one called section 87A in the earlier Act. The rules can
                    change during a year; this page states the year it covers
                    and does not claim to be the latest.
                </p>

            </section>


            <!-- ASSUMPTIONS -->

            <section class="calculator-info">

                <h2>
                    What This Does Not Cover
                </h2>

                <p>
                    It does not calculate business or professional income,
                    capital gains, dividends, lottery or online-game winnings,
                    crypto, foreign income, agricultural income, rent from a
                    house you let out or a loss on one, arrears relief, family
                    pension, senior citizens (60 and above), non-residents,
                    part-year or multiple-employer cases, or income above
                    ${escapeHTML(CEILING_TEXT)}. It assumes one tax year and one
                    house you live in. It does not check that a deduction is
                    allowed, and it is not tax or legal advice. Your actual
                    return may differ; for anything complex, check the official
                    sources above or ask a qualified professional.
                </p>

            </section>


            <!-- FAQ -->

            <section class="calculator-info">

                <h2>
                    ${TITLE} FAQ
                </h2>

                <details>
                    <summary>
                        Is my income or any number sent anywhere?
                    </summary>
                    <p>
                        No. The calculation runs in your browser and nothing is
                        uploaded or stored; reloading clears it.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is there a limit of ${escapeHTML(CEILING_TEXT)}?
                    </summary>
                    <p>
                        Above ₹50 lakh of total income, surcharge applies, with
                        its own thresholds and relief. This version does not
                        calculate it, so it refuses higher incomes instead of
                        giving a misleading number.
                    </p>
                </details>

                <details>
                    <summary>
                        What is the break-even?
                    </summary>
                    <p>
                        It is the amount of old-regime deductions and exemptions
                        (not counting the standard deduction) at which the old
                        regime's estimated tax falls to the new regime's. Since
                        more deduction never raises the old regime's tax, there
                        is one such point. It is shown to the nearest ₹1,000.
                    </p>
                </details>

                <details>
                    <summary>
                        How is the HRA exemption worked out?
                    </summary>
                    <p>
                        It is the least of the HRA you receive, the rent you pay
                        minus 10% of your Basic salary plus DA, and 50% of that
                        salary if you live in ${escapeHTML(YEAR.hra.highCities.join(", "))}
                        or 40% elsewhere (rule 279 of the Income-tax Rules,
                        2026). If your case is different, enter the exemption
                        yourself.
                    </p>
                </details>

                <details>
                    <summary>
                        Why is the tax a multiple of ten?
                    </summary>
                    <p>
                        The Act rounds total income and the amount payable to the
                        nearest ten rupees (section 516), so that is how the
                        estimate is rounded.
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
   RESULT PIECES (HTML; every dynamic value is formatted here)
========================================================= */

function regimeCard(name, tax, side, lowerLabel, effective) {

    return `
                <div class="it-card${lowerLabel ? " it-card--lower" : ""}">

                    <h3 class="it-card__title">${name}</h3>

                    <p class="it-card__amount">${rupees(tax)}</p>

                    <p class="it-card__label">Estimated tax</p>

                    ${lowerLabel ? `<p class="it-card__badge">Lower estimated tax</p>` : ""}

                    <p class="it-card__meta">
                        Taxable income ${rupees(side.totalIncome)}${effective ? ` · ${effective} of your income` : ""}
                    </p>

                </div>`;

}

function row(label, value, note) {

    return `
                    <div class="it-row">
                        <dt>${escapeHTML(label)}${note ? `<span class="it-row__note">${escapeHTML(note)}</span>` : ""}</dt>
                        <dd>${value}</dd>
                    </div>`;

}

function deductionRow(label, item) {

    if (item.used === 0 && item.entered === 0) {
        return "";
    }

    const capped = item.entered > item.used;

    return row(
        label,
        `−${paise(item.used)}`,
        capped
            ? `You entered ${paise(item.entered)}; the limit applied is ${Number.isFinite(item.cap) ? paise(item.cap) : "the income"}`
            : ""
    );

}

function breakdown(side, regime, income) {

    const rows = [];

    rows.push(row("Annual salary or pension income", paise(side.salary)));

    if (side.otherIncome > 0) {
        rows.push(row("Other income", paise(side.otherIncome)));
    }

    rows.push(row("Standard deduction", `−${paise(side.standardDeduction)}`));

    if (regime === "old") {

        if (side.hraExemption > 0) {
            rows.push(row("HRA exemption", `−${paise(side.hraExemption)}`));
        }

        if (side.professionalTax > 0) {
            rows.push(row("Professional tax", `−${paise(side.professionalTax)}`));
        }

        if (side.houseLoss.entered > 0) {
            rows.push(row(
                "Home loan interest",
                `−${paise(side.houseLoss.used)}`,
                side.houseLoss.entered > side.houseLoss.used
                    ? `You entered ${paise(side.houseLoss.entered)}; the limit applied is ${paise(side.houseLoss.cap)}`
                    : ""
            ));
        }

    }

    rows.push(row("Total before deductions under Chapter VIII", paise(side.grossTotalIncome)));

    if (regime === "old") {

        rows.push(deductionRow("Section 123 (80C)", side.lines.section80C));
        rows.push(deductionRow("Own NPS contribution", side.lines.ownNps));
        rows.push(deductionRow("Health insurance, you and family", side.lines.healthSelfFamily));
        rows.push(deductionRow("Health insurance, parents", side.lines.healthParents));
        rows.push(deductionRow("Employer's NPS contribution", side.lines.employerNps));
        rows.push(deductionRow("Other eligible deductions", side.lines.otherDeductions));

    } else {

        rows.push(deductionRow("Employer's NPS contribution", side.lines.employerNps));

    }

    if (side.deductionsApplied < Object.values(side.lines).reduce((sum, item) => sum + item.used, 0)) {
        rows.push(row("Deductions applied (they cannot exceed your income)", `−${paise(side.deductionsApplied)}`));
    }

    rows.push(row("Taxable income (rounded to the nearest ₹10)", rupees(side.totalIncome)));
    rows.push(row("Tax at the slab rates", paise(side.taxBeforeRebate)));

    if (side.rebate > 0) {
        rows.push(row(
            "Rebate (section 156)",
            `−${paise(side.rebate)}`,
            regime === "new" && side.totalIncome > YEAR.rebate.new.maxTotalIncome ? "Includes marginal relief above ₹12 lakh" : ""
        ));
    }

    rows.push(row(`Health and Education Cess (${YEAR.cessPercent}%)`, paise(side.cess)));
    rows.push(row("Estimated tax (rounded to the nearest ₹10)", `<strong>${rupees(side.finalTax)}</strong>`));

    return rows.join("");

}

function breakEvenBlock(result) {

    const be = result.breakEven;

    if (be.status === "old-lower-or-equal") {

        return `
            <div class="it-break">
                <h3 class="it-break__title">Break-even</h3>
                <p>With these inputs the old regime already gives the same or lower estimated tax, so there is no gap to close.</p>
            </div>`;

    }

    const needed = be.requiredApproxRupees;

    const extra = be.extraApproxRupees;

    return `
            <div class="it-break">
                <h3 class="it-break__title">Break-even</h3>
                <p>
                    At this income, the old regime would need about
                    <strong>${rupees(needed)}</strong> of total eligible
                    exemptions and deductions (not counting the standard
                    deduction) to match the new regime's estimated tax.
                </p>
                <p>
                    ${extra > 0
                        ? `You have entered ${rupees(be.currentRupees)}, which is about ${rupees(extra)} short.`
                        : `You have entered ${rupees(be.currentRupees)}, which is close to that.`}
                    Limits still apply: for example section 123 (80C) is
                    capped at ${rupees(CAPS.section80C)} and own NPS at
                    ${rupees(CAPS.ownNps)}.
                </p>
            </div>`;

}

function renderOk(result) {

    const lowerNew = result.comparison.lower === "new";
    const lowerOld = result.comparison.lower === "old";

    const effective = (permille) => permille === null ? "" : percentText(permille);

    const difference = rupees(result.comparison.differenceRupees);

    const sentence = result.comparison.lower === "equal"
        ? `Based on these inputs and assumptions, both regimes give the same estimated tax, ${rupees(result.new.finalTax)}.`
        : `Based on these inputs and assumptions, the ${lowerNew ? "New" : "Old"} Regime results in an estimated ${difference} lower tax.`;

    return `
            <p class="it-results__year">${escapeHTML(result.taxYear)}</p>

            <div class="it-compare">
                ${regimeCard("New regime", result.new.finalTax, result.new, lowerNew, effective(result.effective.newPermille))}
                ${regimeCard("Old regime", result.old.finalTax, result.old, lowerOld, effective(result.effective.oldPermille))}
            </div>

            <p class="it-difference">
                Estimated difference <strong>${difference}</strong>
            </p>

            <p class="it-sentence">${sentence}</p>

            ${breakEvenBlock(result)}

            <details class="it-breakdown">
                <summary>How each regime was worked out</summary>

                <div class="it-breakdown__grid">

                    <div>
                        <h3 class="it-breakdown__title">New regime</h3>
                        <dl class="it-rows">${breakdown(result.new, "new")}
                        </dl>
                    </div>

                    <div>
                        <h3 class="it-breakdown__title">Old regime</h3>
                        <dl class="it-rows">${breakdown(result.old, "old")}
                        </dl>
                    </div>

                </div>

                <p class="it-note">
                    Amounts are shown to the nearest rupee; the arithmetic is exact.
                </p>

            </details>

            <p class="it-assumptions">
                ${escapeHTML(result.taxYear)} · resident individual under 60 ·
                salary or pension income · income up to ${escapeHTML(CEILING_TEXT)}, no surcharge ·
                special-rate income not included · an estimate, not tax advice.
                Eligibility of the deductions you entered is not checked.
            </p>`;

}

/* the one-sentence result for a screen reader */
function liveSummary(result) {

    if (result.comparison.lower === "equal") {
        return `${result.taxYear}. Both regimes give the same estimated tax, ${rupees(result.new.finalTax)}.`;
    }

    const lower = result.comparison.lower === "new" ? "new" : "old";

    return `${result.taxYear}. New regime ${rupees(result.new.finalTax)}, old regime ${rupees(result.old.finalTax)}. Lower estimated tax: the ${lower} regime, by ${rupees(result.comparison.differenceRupees)}.`;

}


/* =========================================================
   INIT
========================================================= */

export function init() {

    const form = document.querySelector("#it-form");

    if (!form) {
        return;
    }

    const $ = (id) => document.getElementById(id);

    const body = $("it-results-body");
    const live = $("it-live");
    const resetButton = $("it-reset");

    const hraModeInputs = [...form.querySelectorAll('input[name="it-hra-mode"]')];

    const hraCalc = $("it-hra-calc");
    const hraKnown = $("it-hra-known");
    const hraResult = $("it-hra-result");

    let announceTimer = null;

    /* a settled result is announced once, after the typing pauses */
    function announce(message) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {
            live.textContent = "";
            requestAnimationFrame(() => {
                live.textContent = message;
            });
        }, 900);

    }

    function readNumber(id) {

        const text = $(id).value.trim();

        if (text === "") {
            return 0;
        }

        return Number(text);

    }

    function readInput() {

        const input = {};

        for (const field of NUMBER_FIELDS) {
            input[field] = readNumber(ID[field]);
        }

        input.hraMode = hraModeInputs.find(item => item.checked)?.value ?? "calculate";
        input.highCity = $(ID.highCity).value === "yes";
        input.parentsSenior = $(ID.parentsSenior).value === "yes";
        input.homeLoanOtherPurpose = $(ID.homeLoanOtherPurpose).value === "yes";
        input.employerGovernment = $(ID.employerGovernment).checked;

        return input;

    }

    function echoes() {

        for (const field of NUMBER_FIELDS) {

            const echo = $(`${ID[field]}-echo`);

            const text = $(ID[field]).value.trim();

            const number = Number(text);

            echo.textContent =
                text !== "" && Number.isInteger(number) && number >= 0 && number <= FIELD_MAX
                    ? rupees(number)
                    : "";

        }

    }

    function showHraMode() {

        const manual = hraModeInputs.find(item => item.checked)?.value === "manual";

        hraCalc.hidden = manual;
        hraKnown.hidden = !manual;

    }

    function clearErrors() {

        clearFieldsInvalid(
            Object.values(ID).map(id => $(id)),
            ERROR_ID
        );

    }

    function update() {

        echoes();

        showHraMode();

        clearErrors();

        const input = readInput();

        const blank = NUMBER_FIELDS.every(field => $(ID[field]).value.trim() === "");

        if (blank) {

            hraResult.hidden = true;

            body.innerHTML = `<p class="it-empty">${EMPTY_MESSAGE}</p>`;

            clearTimeout(announceTimer);

            live.textContent = "";

            return;

        }

        const result = calculate(input);

        if (result.status === "invalid") {

            hraResult.hidden = true;

            const fields = Object.keys(result.errors);

            body.innerHTML = `
                <div id="${ERROR_ID}" class="it-error">
                    <p class="it-error__title">Please check these values</p>
                    <ul>
                        ${fields.map(field => `<li>${escapeHTML(result.errors[field])}</li>`).join("")}
                    </ul>
                </div>`;

            setFieldsInvalid(fields.map(field => $(ID[field])), ERROR_ID);

            announce(`Please check these values. ${result.errors[fields[0]]}`);

            return;

        }

        if (result.status === "unsupported") {

            hraResult.hidden = true;

            body.innerHTML = `
                <div id="${ERROR_ID}" class="it-notice">
                    <p class="it-notice__title">Outside what this calculator supports</p>
                    <p>${escapeHTML(LIMIT_MESSAGE)}</p>
                </div>`;

            announce(LIMIT_MESSAGE);

            return;

        }

        if (input.hraMode === "calculate" && (input.hraReceived > 0 || input.rentPaid > 0)) {

            hraResult.textContent = `HRA exemption worked out: ${paise(result.old.hraExemption)}`;
            hraResult.hidden = false;

        } else {

            hraResult.hidden = true;

        }

        body.innerHTML = renderOk(result);

        announce(liveSummary(result));

    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    resetButton.addEventListener("click", () => {

        form.reset();

        update();

        $(ID.salary).focus();

    });

    /* once the tax year has ended the page says so (the build cannot know the date a visitor opens it) */
    if (Date.now() > Date.parse(`${YEAR.validThrough}T23:59:59+05:30`)) {
        $("it-stale").hidden = false;
    }

    update();

    /* the page's script has run and the form works (tests wait for this) */
    form.dataset.ready = "true";

}
