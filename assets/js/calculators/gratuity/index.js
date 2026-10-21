/* =========================================================
   ToolZen Hub
   Gratuity Calculator, India (Calculators, Tax for now)

   An ESTIMATE of gratuity under the Code on Social Security, 2020,
   for exits on or after 21 November 2025, from qualifying monthly
   wages and the joining and exit dates. The model, its exact
   assumptions, the limits, the validation and every status code are
   in formulas/gratuity.js (with gratuity-rules.js and
   gratuity-calendar.js); this file is the page around them and does
   no calculation of its own. The approved specification is
   docs/tool-packs/29-gratuity-calculator.md (sections 6, 7, 11, 33
   and 34).

   - Results appear when the visitor presses Calculate. Editing a field
     afterwards marks the result as out of date until it is calculated
     again; the page never shows a figure for inputs it was not
     calculated from.
   - The page words the status, the assumptions and the disclosures
     from the engine's stable identifiers. It never says that anyone IS
     eligible, never calls a computed figure "payable", and shows an
     illustrative amount only as illustrative.
   - After Calculate, focus moves to the result heading and a polite
     live region announces the status once (specification section 11);
     after Reset, focus returns to the first field.
   - Money is formatted from integer paise by digit grouping, never
     through a floating-point value: formatINR rounds to whole rupees
     and would hide the paise.
   - Everything is calculated in the browser. Nothing is stored, sent
     or put in the address. Every dynamic value is written as escaped
     text.
========================================================= */

import {
    calculateGratuity
} from "../formulas/gratuity.js";

import {
    CODES,
    STATUS,
    AMOUNT_KINDS,
    ERRORS,
    ASSUMPTIONS,
    PAYROLL_CHECKS,
    DISCLOSURES,
    EMPLOYEE_TYPES,
    CONTRACT_ENDS,
    RULES_CHECKED_ON,
    CEILING_PAISE,
    WAGES_PRODUCT_LIMIT_PAISE
} from "../formulas/gratuity-rules.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    fieldShell,
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
    getCalculatorById("gratuity").title;

const IDS = {
    wages: "gratuity-wages",
    joining: "gratuity-joining",
    exit: "gratuity-exit"
};

const TYPE_NAME = "gratuity-type";
const END_NAME = "gratuity-end";

const ERROR_IDS = {
    employeeType: "gratuity-error-type",
    contractEnd: "gratuity-error-end",
    wages: "gratuity-error-wages",
    joiningDate: "gratuity-error-joining",
    exitDate: "gratuity-error-exit"
};

const EMPTY_MESSAGE = "Choose the employee type, enter your details and press Calculate.";
const STALE_MESSAGE = "You have changed a value. The result below is out of date until you press Calculate.";
const RESET_MESSAGE = "Cleared. Choose the employee type, enter your details and press Calculate.";
const SUMMARY_ERROR_ID = "gratuity-error-summary";


/* =========================================================
   EXACT MONEY AND DATES (pure; exported for the tests)
========================================================= */

/* Indian grouping of a string of digits: the last three, then pairs (230769 -> 2,30,769) */
function groupIndian(digits) {

    if (digits.length <= 3) {
        return digits;
    }

    const head = digits.slice(0, -3);
    const tail = digits.slice(-3);

    return `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`;

}

/*
 * Integer paise to rupees and paise, for example 23076923 -> "₹2,30,769.23". No floating-point conversion: the
 * rupees and the paise are separated by integer remainder. Anything that is not a non-negative safe integer is
 * refused, so an error can never be shown as a zero amount.
 */
export function formatPaise(paise) {

    if (typeof paise !== "number" || !Number.isSafeInteger(paise) || paise < 0) {
        throw new RangeError("formatPaise needs a non-negative whole number of paise");
    }

    const remainder = paise % 100;
    const rupees = (paise - remainder) / 100;

    return `₹${groupIndian(String(rupees))}.${String(remainder).padStart(2, "0")}`;

}

const MONTHS = Object.freeze([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]);

/* "2026-12-31" -> "31 December 2026", from the text, with no Date object and no time zone */
export function formatIsoDate(text) {

    const match = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(String(text));

    if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) {
        throw new RangeError("formatIsoDate needs a YYYY-MM-DD date");
    }

    return `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${Number(match[1])}`;

}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function serviceText(service) {

    return `${plural(service.years, "year")}, ${plural(service.months, "month")} and ${plural(service.days, "day")}`;

}


/* =========================================================
   WORDING (the page owns every sentence; the engine returns identifiers)
========================================================= */

/* the three status statements approved by the owner on 2026-10-21 for the initial UI design, verbatim */
const STATEMENTS = Object.freeze({
    [CODES.fiveYearsReached]:
        "Five calendar years of service are reached on these dates. Whether you are eligible also depends on your service having been continuous and on the other conditions of the Code.",
    [CODES.fifthYearUndetermined]:
        "You are in your fifth year of service. Five calendar years are not yet reached on these dates, and this form cannot tell whether the Code's continuous-service rules would treat your last year as complete. The amount shown is illustrative only. Please ask your employer's payroll.",
    [CODES.thresholdNotReached]:
        "Five calendar years of service are not yet reached on these dates. This is not a final legal determination.",
    /* drafted in G5 on the same qualified pattern (specification 7.5, F1 and F4); not yet separately approved */
    [CODES.fixedTermOneYearMet]:
        "One year of service under the contract is reached on these dates, which is the condition for a fixed-term employee. Whether you are eligible also depends on the contract running to its end and on the other conditions of the Code.",
    [CODES.fixedTermUnderOneYear]:
        "One year of service under the contract is not yet reached on these dates. This is not a final legal determination.",
    [CODES.unsupportedOtherType]:
        "This calculator does not cover government posts governed by other gratuity law, seasonal or piece-rated employees, or working journalists, and it gives no figure for them. Please ask your employer, or read section 53 of the Code on Social Security, 2020.",
    [CODES.unsupportedEarlierLaw]:
        "This calculator covers exits on or after 21 November 2025, when gratuity under the Code on Social Security, 2020 began to apply. An earlier exit falls under the earlier law, and no figure is shown.",
    [CODES.unsupportedFixedTermEarlyEnd]:
        "When a fixed-term contract ends before its full term, whether gratuity is due depends on the contract and on your employer. This calculator gives no figure for that case.",
    [CODES.incomplete]: "Check the highlighted fields.",
    [CODES.invalid]: "Check the highlighted fields.",
    [CODES.internalError]: "Something went wrong while calculating. Please check your entries and try again. Nothing was stored or sent."
});

/* a short form of each status, for the one announcement */
const SHORT = Object.freeze({
    [CODES.fiveYearsReached]: "Five calendar years of service are reached on these dates, subject to conditions.",
    [CODES.fifthYearUndetermined]: "You are in your fifth year of service. Eligibility cannot be determined from dates alone.",
    [CODES.thresholdNotReached]: "Five calendar years of service are not yet reached on these dates.",
    [CODES.fixedTermOneYearMet]: "One year of service under the contract is reached on these dates, subject to conditions.",
    [CODES.fixedTermUnderOneYear]: "One year of service under the contract is not yet reached on these dates.",
    [CODES.unsupportedOtherType]: "This case is not covered by the calculator.",
    [CODES.unsupportedEarlierLaw]: "This exit date is before 21 November 2025, so no figure is shown.",
    [CODES.unsupportedFixedTermEarlyEnd]: "This case is not covered by the calculator.",
    [CODES.incomplete]: "Check the highlighted fields.",
    [CODES.invalid]: "Check the highlighted fields.",
    [CODES.internalError]: "Something went wrong while calculating."
});

const AMOUNT_LABELS = Object.freeze({
    [AMOUNT_KINDS.estimated]: "Estimated gratuity (subject to the conditions stated)",
    [AMOUNT_KINDS.illustrative]: "Illustrative amount, not an entitlement"
});

const ASSUMPTION_TEXT = Object.freeze({
    [ASSUMPTIONS.wagesNotGross]: "The wages you entered are your qualifying wages as the Code defines them (section 2(88)), not your gross salary.",
    [ASSUMPTIONS.exitOnOrAfterCodeDate]: "Your exit date is on or after 21 November 2025.",
    [ASSUMPTIONS.establishmentCovered]: "Your employer's establishment is covered by the gratuity provisions of the Code.",
    [ASSUMPTIONS.continuousService]: "Your service was continuous in the sense of section 54(A) of the Code: leave, sickness, accident, lay-off, strike or lock-out do not break it, and an absence that your employer's standing orders treat as a break can.",
    [ASSUMPTIONS.bothDaysCounted]: "Service is counted from your joining date to your exit date with both days included, and a joining day that does not exist in a later month counts as the first day of the following month. This is the calculator's own convention, not a legal attendance calculation.",
    [ASSUMPTIONS.partYearAmountOnly]: "A part-year of more than six months counts as a year for the amount only, never for eligibility.",
    [ASSUMPTIONS.ceilingDevelopmentValue]: `The ceiling is ${formatPaise(CEILING_PAISE)}. It is set by notification and may change; the figure was checked on ${formatIsoDate(RULES_CHECKED_ON)}.`,
    [ASSUMPTIONS.roundingToolConvention]: "The amount is rounded to the nearest paisa, half up, only at the end. This rounding is the calculator's own; your payroll may round differently.",
    [ASSUMPTIONS.employerBetterTerms]: "Your employer may offer better terms under an award, agreement or contract; those apply instead.",
    [ASSUMPTIONS.estimateNotLegalAdvice]: "This is an estimate, not legal advice. Your employer decides the actual payment.",
    [ASSUMPTIONS.fixedTermSingleContract]: "For a fixed-term employee, service under a single contract is measured; renewed contracts are not added together.",
    [ASSUMPTIONS.fixedTermProRataReading]: "The fixed-term amount applies the section 53(2) rate to the years counted under rule 33 of the Social Security (Central) Rules, 2026. The Code says only \"pro rata\", so the figure is illustrative."
});

const PAYROLL_TEXT = Object.freeze({
    [PAYROLL_CHECKS.wagesFigure]: "Whether the wages figure is the one your employer uses for gratuity (the Code's definition can be higher than basic pay plus dearness allowance).",
    [PAYROLL_CHECKS.continuityOfService]: "Whether your service counts as continuous, including any breaks.",
    [PAYROLL_CHECKS.establishmentCoverage]: "Whether your employer's establishment is covered.",
    [PAYROLL_CHECKS.employerOwnTerms]: "Whether your employer has better gratuity terms.",
    [PAYROLL_CHECKS.fixedTermContractDetails]: "The terms and dates of your fixed-term contract."
});

const DISCLOSURE_TEXT = Object.freeze({
    [DISCLOSURES.monthEnd]: "We count both your joining day and your last day. If your joining day does not exist in a month (for example the 31st), that month's end completes the month. Your employer's payroll may count month-end dates differently, so please confirm with them.",
    [DISCLOSURES.illustrativeNotEntitlement]: "This amount is illustrative. It does not mean you are owed it.",
    [DISCLOSURES.ceilingApplied]: `The ceiling applied: the amount is capped at ${formatPaise(CEILING_PAISE)}.`
});

const FIELD_MESSAGES = Object.freeze({
    employeeType: {
        [ERRORS.required]: "Choose the employee type.",
        [ERRORS.typeUnknown]: "Choose one of the employee types."
    },
    contractEnd: {
        [ERRORS.required]: "Choose how the contract ends.",
        [ERRORS.contractEndUnknown]: "Choose how the contract ends."
    },
    wages: {
        [ERRORS.required]: "Enter the monthly wages.",
        [ERRORS.wagesSeparator]: "Enter digits only, with no commas or spaces, for example 150000 or 150000.50.",
        [ERRORS.wagesFormat]: "Enter the wages as digits, for example 150000 or 150000.50.",
        [ERRORS.wagesNotPositive]: "The wages must be above zero.",
        [ERRORS.wagesDecimals]: "Use at most two decimal places, for example 150000.50.",
        [ERRORS.wagesProductLimit]: `This calculator accepts monthly wages up to ${formatPaise(WAGES_PRODUCT_LIMIT_PAISE).replace(/\.00$/, "")}.`,
        [ERRORS.wagesTooLargeExact]: "This amount is too large to calculate exactly."
    },
    joiningDate: {
        [ERRORS.required]: "Enter the date.",
        [ERRORS.dateFormat]: "Enter a date with the day, month and year.",
        [ERRORS.dateInvalid]: "That is not a real calendar date."
    },
    exitDate: {
        [ERRORS.required]: "Enter the date.",
        [ERRORS.dateFormat]: "Enter a date with the day, month and year.",
        [ERRORS.dateInvalid]: "That is not a real calendar date.",
        [ERRORS.exitBeforeJoining]: "The exit date cannot be before the joining date."
    }
});

export function errorMessage(field, code) {

    return FIELD_MESSAGES[field]?.[code] ?? "Check this entry.";

}


/* =========================================================
   FROM AN ENGINE RESULT TO WHAT THE PAGE SAYS (pure; exported for the tests)
   Only the engine's own fields are used: nothing is recalculated here.
========================================================= */

export function describeResult(result) {

    const code = result.code;

    const view = {
        status: result.status,
        code,
        statement: STATEMENTS[code] ?? STATEMENTS[CODES.internalError],
        short: SHORT[code] ?? SHORT[CODES.internalError],
        fiveYearSentence: null,
        amount: null,
        working: null,
        assumptions: [],
        checks: [],
        notes: [],
        errors: [],
        announcement: ""
    };

    if (result.status === STATUS.incomplete || result.status === STATUS.invalid) {

        view.errors = result.errors.map((error) => ({
            field: error.field,
            code: error.code,
            message: errorMessage(error.field, error.code)
        }));

        view.announcement = view.short;

        return view;

    }

    if (result.status !== STATUS.ok) {

        view.announcement = view.short;

        return view;

    }

    /* the service and the wages, shown as the engine returned them */

    const inputs = result.trace.inputs;
    const service = result.service;

    if (result.amount.kind !== AMOUNT_KINDS.none && Number.isSafeInteger(result.amount.paise)) {

        view.amount = {
            kind: result.amount.kind,
            label: AMOUNT_LABELS[result.amount.kind],
            text: formatPaise(result.amount.paise),
            ceilingApplied: result.amount.ceilingApplied === true
        };

    }

    if (service.calendarFiveYearDate && result.code === CODES.thresholdNotReached) {
        view.fiveYearSentence = `Five calendar years of service are completed on ${formatIsoDate(service.calendarFiveYearDate)} for these dates.`;
    }

    const lines = [
        ["Qualifying monthly wages", formatPaise(inputs.wagesPaise)],
        ["Service counted", `${serviceText(service)}, with both days counted (to ${formatIsoDate(inputs.exitDate)})`]
    ];

    if (view.amount && result.countedYears !== null) {

        lines.push(["Years counted for the amount", String(result.countedYears)]);

        lines.push([
            "How the amount is worked out",
            view.amount.ceilingApplied
                ? `${formatPaise(inputs.wagesPaise)} ÷ 26 × 15 × ${result.countedYears} is above the ceiling, so the amount is the ceiling, ${view.amount.text}`
                : `${formatPaise(inputs.wagesPaise)} ÷ 26 × 15 × ${result.countedYears} = ${view.amount.text}`
        ]);

    }

    view.working = lines;

    view.assumptions = result.assumptions.map((id) => ASSUMPTION_TEXT[id]).filter(Boolean);
    view.checks = result.checkWithPayroll.map((id) => PAYROLL_TEXT[id]).filter(Boolean);
    view.notes = result.disclosures.map((id) => DISCLOSURE_TEXT[id]).filter(Boolean);

    view.announcement = view.amount
        ? `${view.short} ${view.amount.label}: ${view.amount.text}.`
        : view.short;

    return view;

}

const list = (items) => items.length
    ? `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
    : "";

/* the result card for a view: ok, unsupported or an internal error (field errors are shown by the page, not here) */
export function renderResultHtml(view) {

    if (view.status === STATUS.incomplete || view.status === STATUS.invalid) {

        return `
            <div class="calculator-results__error gratuity-summary" id="${SUMMARY_ERROR_ID}">
                <strong>${escapeHTML(view.statement)}</strong>
                ${list(view.errors.map((error) => error.message))}
            </div>`;

    }

    const amount = view.amount
        ? `
                <div class="calculator-results__grid gratuity-amount" data-kind="${escapeHTML(view.amount.kind)}">
                    ${resultMetric({ label: view.amount.label, value: view.amount.text, primary: true })}
                </div>`
        : "";

    const notes = view.notes.map((note) => `
                <p class="gratuity-note">${escapeHTML(note)}</p>`).join("");

    const checks = view.checks.length
        ? `
                <section class="gratuity-block" aria-labelledby="gratuity-checks-heading">
                    <h3 id="gratuity-checks-heading">Check with your employer or payroll</h3>
                    ${list(view.checks)}
                </section>`
        : "";

    const working = view.working
        ? `
                <details class="gratuity-working">
                    <summary>How this was worked out</summary>
                    <dl>${view.working.map(([label, value]) => `
                        <dt>${escapeHTML(label)}</dt>
                        <dd>${escapeHTML(value)}</dd>`).join("")}
                    </dl>
                </details>`
        : "";

    const assumptions = view.assumptions.length
        ? `
                <section class="gratuity-block" aria-labelledby="gratuity-assumptions-heading">
                    <h3 id="gratuity-assumptions-heading">What this estimate assumes</h3>
                    ${list(view.assumptions)}
                </section>`
        : "";

    return `
            <div class="calculator-results__card gratuity-result" data-code="${escapeHTML(view.code)}" data-kind="${escapeHTML(view.amount ? view.amount.kind : "none")}">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Result
                    </span>

                    <h2 class="calculator-results__title" id="gratuity-result-heading" tabindex="-1">
                        Your gratuity result
                    </h2>

                </div>

                <p class="gratuity-status">${escapeHTML(view.statement)}</p>
                ${view.fiveYearSentence ? `<p class="gratuity-status">${escapeHTML(view.fiveYearSentence)}</p>` : ""}
                ${amount}${notes}${checks}${working}${assumptions}
            </div>`;

}


/* =========================================================
   WHAT THE PAGE SHOWS (pure; exported for the tests)
   A result is current until a field is edited; an edit after a
   result that shows a figure or an explanation marks it out of
   date; a Calculate replaces it; a Reset clears everything.
========================================================= */

export const INITIAL_STATE = Object.freeze({ result: null, stale: false });

export function reduceState(state, action) {

    switch (action.type) {

        case "calculate":
            return { result: action.result, stale: false };

        case "edit":
            /* validation messages are not figures: editing after them marks nothing out of date */
            return state.result && (state.result.status === STATUS.ok || state.result.status === STATUS.unsupported)
                ? { result: state.result, stale: true }
                : state;

        case "reset":
            return INITIAL_STATE;

        default:
            return state;

    }

}


/* =========================================================
   MARKUP
   Static HTML, rendered into the generated page by the site build.
========================================================= */

const radio = ({ name, id, value, text }) => `
                                <label class="gratuity-choice">
                                    <input type="radio" id="${id}" name="${name}" value="${value}">
                                    <span>${escapeHTML(text)}</span>
                                </label>`;

const WAGES_HINT = "Enter the monthly wages your employer counts for gratuity, not your gross salary. Under the Code that is basic pay plus dearness allowance plus retaining allowance (if you get one). If your allowances and similar payments are more than half of your total remuneration, the excess is added to wages, so the figure can be higher than basic pay plus dearness allowance. The safest source is payroll: ask for your wages as defined in section 2(88) of the Code on Social Security, as last drawn. This calculator does not add HRA, bonus or overtime for you.";

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Employee Benefit Tool
                    </span>

                    <h1>
                        ${escapeHTML(TITLE)}
                    </h1>

                    <p>
                        An estimate of gratuity under the Code on Social Security,
                        2020, for exits on or after 21 November 2025, from your
                        qualifying monthly wages and your service dates. It shows
                        how the figure was worked out and what it assumes. It is
                        not legal advice, and your employer decides the actual
                        payment.
                    </p>

                    <p class="gratuity-checked">
                        Rules checked on ${escapeHTML(formatIsoDate(RULES_CHECKED_ON))}.
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
                    Estimate Your Gratuity
                </div>

                <p class="calculator-section__description">
                    Choose the employee type, enter your qualifying monthly
                    wages and your dates, then press Calculate. The values you
                    enter are not stored or sent anywhere.
                </p>

                <form
                    id="gratuity-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid gratuity-grid">

                        <fieldset class="gratuity-choices" id="gratuity-type-group">

                            <legend class="calculator-form__label">
                                Employee Type
                            </legend>

                            <div class="gratuity-choices__options">
                                ${radio({ name: TYPE_NAME, id: "gratuity-type-regular", value: EMPLOYEE_TYPES.regular, text: "Regular employee (including an employee of a contractor)" })}
                                ${radio({ name: TYPE_NAME, id: "gratuity-type-fixed", value: EMPLOYEE_TYPES.fixedTerm, text: "Fixed-term employee, engaged directly by the employer" })}
                                ${radio({ name: TYPE_NAME, id: "gratuity-type-other", value: EMPLOYEE_TYPES.other, text: "Other (a government post, seasonal, piece-rated, working journalist, or something else)" })}
                            </div>

                            <p class="gratuity-field-error" id="${ERROR_IDS.employeeType}" hidden></p>

                        </fieldset>

                        <fieldset class="gratuity-choices" id="gratuity-end-group" hidden>

                            <legend class="calculator-form__label">
                                How Does the Contract End?
                            </legend>

                            <div class="gratuity-choices__options">
                                ${radio({ name: END_NAME, id: "gratuity-end-expires", value: CONTRACT_ENDS.expires, text: "It runs to its end (it expires)" })}
                                ${radio({ name: END_NAME, id: "gratuity-end-earlier", value: CONTRACT_ENDS.earlier, text: "It ends earlier (resignation, termination or another reason)" })}
                            </div>

                            <p class="gratuity-field-error" id="${ERROR_IDS.contractEnd}" hidden></p>

                        </fieldset>

                        <div id="gratuity-details" class="gratuity-details">

                            ${fieldShell({
                                id: IDS.wages,
                                label: "Qualifying Monthly Wages",
                                unit: "₹ a month",
                                hint: WAGES_HINT,
                                control: `<input
                                    id="${IDS.wages}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="decimal"
                                    autocomplete="off"
                                    spellcheck="false"
                                    aria-describedby="${IDS.wages}-hint"
                                >`
                            })}
                            <p class="gratuity-field-error" id="${ERROR_IDS.wages}" hidden></p>

                            ${fieldShell({
                                id: IDS.joining,
                                label: "Joining Date",
                                hint: "The first day you worked for this employer.",
                                control: `<input
                                    id="${IDS.joining}"
                                    class="calculator-form__input"
                                    type="date"
                                    aria-describedby="${IDS.joining}-hint"
                                >`
                            })}
                            <p class="gratuity-field-error" id="${ERROR_IDS.joiningDate}" hidden></p>

                            ${fieldShell({
                                id: IDS.exit,
                                label: "Exit Date",
                                hint: "Your last day of service, or the day you expect to leave. This day counts as a day of service. Exits from 21 November 2025 are covered.",
                                control: `<input
                                    id="${IDS.exit}"
                                    class="calculator-form__input"
                                    type="date"
                                    aria-describedby="${IDS.exit}-hint"
                                >`
                            })}
                            <p class="gratuity-field-error" id="${ERROR_IDS.exitDate}" hidden></p>

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions gratuity-actions">

                        <button
                            type="submit"
                            id="gratuity-calculate"
                            class="calculator-form__button"
                        >
                            Calculate
                        </button>

                        <button
                            type="button"
                            id="gratuity-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <p
                id="gratuity-stale"
                class="gratuity-stale"
                hidden
            >${escapeHTML(STALE_MESSAGE)}</p>

            <section
                id="gratuity-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="gratuity-live"
                class="gratuity-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- HOW TO USE -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${escapeHTML(TITLE)}
                </h2>

                <ol>
                    <li>Choose the employee type. A fixed-term employee is asked how the contract ends.</li>
                    <li>Enter your qualifying monthly wages as digits, for example 150000 or 150000.50, with no commas or spaces. They are not your gross salary.</li>
                    <li>Enter your joining date and your exit date (for a fixed-term contract, its start and its end).</li>
                    <li>Press Calculate. The result says what the dates show, gives an estimate or an illustrative amount where the case allows one, and lists what to check with your employer.</li>
                    <li>If you change a value after calculating, the result is marked out of date until you press Calculate. Reset clears everything.</li>
                </ol>

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

    init(mount);

}


/* =========================================================
   INIT
========================================================= */

export function init(mount) {

    const root = mount && typeof mount.querySelector === "function" ? mount : document;

    const form = root.querySelector("#gratuity-form");
    const results = root.querySelector("#gratuity-results");
    const live = root.querySelector("#gratuity-live");
    const stale = root.querySelector("#gratuity-stale");

    if (!form || !results || form.dataset.ready === "true") {
        return;
    }

    const typeRadios = [...root.querySelectorAll(`input[name="${TYPE_NAME}"]`)];
    const endRadios = [...root.querySelectorAll(`input[name="${END_NAME}"]`)];

    const typeGroup = root.querySelector("#gratuity-type-group");
    const endGroup = root.querySelector("#gratuity-end-group");
    const details = root.querySelector("#gratuity-details");

    const wages = root.querySelector(`#${IDS.wages}`);
    const joining = root.querySelector(`#${IDS.joining}`);
    const exit = root.querySelector(`#${IDS.exit}`);

    const joiningLabel = root.querySelector(`label[for="${IDS.joining}"]`);
    const exitLabel = root.querySelector(`label[for="${IDS.exit}"]`);
    const joiningHint = root.querySelector(`#${IDS.joining}-hint`);
    const exitHint = root.querySelector(`#${IDS.exit}-hint`);

    const controls = {
        employeeType: { element: typeGroup, focus: () => typeRadios[0], error: ERROR_IDS.employeeType, group: true },
        contractEnd: { element: endGroup, focus: () => endRadios[0], error: ERROR_IDS.contractEnd, group: true },
        wages: { element: wages, focus: () => wages, error: ERROR_IDS.wages },
        joiningDate: { element: joining, focus: () => joining, error: ERROR_IDS.joiningDate },
        exitDate: { element: exit, focus: () => exit, error: ERROR_IDS.exitDate }
    };

    const ORDER = ["employeeType", "contractEnd", "wages", "joiningDate", "exitDate"];

    let state = INITIAL_STATE;
    let announceTimer = null;

    const chosen = (radios) => (radios.find((radio) => radio.checked) || { value: "" }).value;

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

    /* the fields that apply to the chosen type; the others are hidden and are not read */
    function syncType() {

        const type = chosen(typeRadios);
        const fixed = type === EMPLOYEE_TYPES.fixedTerm;
        const other = type === EMPLOYEE_TYPES.other;

        endGroup.hidden = !fixed;
        details.hidden = other;

        if (!fixed) {

            for (const radio of endRadios) {
                radio.checked = false;
            }

            clearOne("contractEnd");

        }

        joiningLabel.textContent = fixed ? "Contract Start Date" : "Joining Date";
        exitLabel.textContent = fixed ? "Contract End Date" : "Exit Date";

        joiningHint.textContent = fixed ? "The first day of the contract." : "The first day you worked for this employer.";
        exitHint.textContent = fixed
            ? "The last day of the contract. This day counts as a day of service. Exits from 21 November 2025 are covered."
            : "Your last day of service, or the day you expect to leave. This day counts as a day of service. Exits from 21 November 2025 are covered.";

    }

    function clearOne(field) {

        const control = controls[field];
        const message = root.querySelector(`#${control.error}`);

        message.hidden = true;
        message.textContent = "";

        if (control.group) {

            control.element.removeAttribute("aria-describedby");

        } else {

            clearFieldsInvalid([control.element], control.error);

        }

    }

    function clearErrors() {

        for (const field of ORDER) {
            clearOne(field);
        }

    }

    function showErrors(view) {

        for (const error of view.errors) {

            const control = controls[error.field];

            if (!control) {
                continue;
            }

            const message = root.querySelector(`#${control.error}`);

            /* the first problem per field is shown beside it */
            if (!message.hidden) {
                continue;
            }

            message.innerHTML = `<strong>Error:</strong> ${escapeHTML(error.message)}`;
            message.hidden = false;

            if (control.group) {
                control.element.setAttribute("aria-describedby", control.error);
            } else {
                setFieldsInvalid([control.element], control.error);
            }

        }

        const first = ORDER.find((field) => view.errors.some((error) => error.field === field));

        controls[first]?.focus()?.focus();

    }

    function collect() {

        return {
            employeeType: chosen(typeRadios),
            contractEnd: chosen(endRadios),
            wages: wages.value,
            joiningDate: joining.value,
            exitDate: exit.value
        };

    }

    function showState() {

        stale.hidden = !state.stale;

        if (state.stale) {
            results.dataset.stale = "true";
        } else {
            delete results.dataset.stale;
        }

    }

    function calculate() {

        clearErrors();

        let result;

        try {

            result = calculateGratuity(collect());

        } catch (error) {

            result = { status: STATUS.error, code: CODES.internalError, errors: [] };

        }

        state = reduceState(state, { type: "calculate", result });

        const view = describeResult(result);

        results.innerHTML = renderResultHtml(view);

        showState();

        if (result.status === STATUS.incomplete || result.status === STATUS.invalid) {

            showErrors(view);

            announceNow(view.announcement);

            return;

        }

        announceNow(view.announcement);

        root.querySelector("#gratuity-result-heading")?.focus();

    }

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        calculate();

    });

    /* an edit after a result makes it out of date: it stays visible, labelled, until Calculate is pressed */

    const onEdit = () => {

        syncType();

        const before = state.stale;

        state = reduceState(state, { type: "edit" });

        showState();

        if (state.stale && !before) {
            announce(STALE_MESSAGE);
        }

    };

    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);

    root.querySelector("#gratuity-reset")?.addEventListener("click", () => {

        for (const radio of [...typeRadios, ...endRadios]) {
            radio.checked = false;
        }

        wages.value = "";
        joining.value = "";
        exit.value = "";

        clearErrors();

        state = reduceState(state, { type: "reset" });

        syncType();

        showState();

        results.innerHTML = resultEmpty(EMPTY_MESSAGE);

        announceNow(RESET_MESSAGE);

        typeRadios[0]?.focus();

    });

    syncType();

    form.dataset.ready = "true";

}
