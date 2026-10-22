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

   - Results appear by themselves once the entries are complete and
     valid (G9, owner-approved 2026-10-22; there is no Calculate button).
     Editing a field marks the result as out of date until the new
     entries give a new one; the page never shows a figure for inputs it
     was not calculated from, and incomplete or invalid entries never
     produce one.
   - The page words the status, the assumptions and the disclosures
     from the engine's stable identifiers. It never says that anyone IS
     eligible, never calls a computed figure "payable", and shows an
     illustrative amount only as illustrative.
   - An automatic update never moves focus. A polite live region
     announces a settled change once (not while typing); after Reset,
     focus returns to the first field (specification section 11).
   - Money is formatted from integer paise by digit grouping, never
     through a floating-point value: formatINR rounds to whole rupees
     and would hide the paise.
   - Everything is calculated in the browser. Nothing is stored, sent
     or put in the address. Every dynamic value is written as escaped
     text.
========================================================= */

import {
    calculateGratuity,
    exploreExitDates,
    compareWages
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

const EMPTY_MESSAGE = "Choose the employee type and enter your wages and dates. The result appears here as soon as they are complete.";
const STALE_MESSAGE = "You have changed a value. The result below is out of date and will update when your entries are complete and valid.";
export const STALE_COMPARE_MESSAGE = "The result above is out of date, so wages cannot be compared yet. It updates when your entries are complete and valid.";
export const STALE_COPY_MESSAGE = "The result above is out of date, so the summary cannot be copied yet. It updates when your entries are complete and valid.";
const RESET_MESSAGE = "Cleared. Choose the employee type and enter your wages and dates.";

/* the owner-approved sentence next to the counted years (G9, 2026-10-22), verbatim */
export const COUNTED_YEARS_NOTE = "Years counted for the formula may differ from your actual service duration. This rounding does not determine eligibility.";

/* =========================================================
   AUTOMATIC CALCULATION (pure helpers; exported for the tests)
   The page calculates by itself once the entries are complete and valid. Typed wages wait for a short pause; a chosen
   type or date is read at once. Incomplete or invalid entries never produce a new figure.
========================================================= */

export const AUTO_DELAY_MS = 600;
export const ANNOUNCE_DELAY_MS = 1000;

/* the entries a result was calculated from, as one comparable text (so unchanged entries are not calculated twice) */
export function inputsKey(inputs) {

    return JSON.stringify([inputs.employeeType, inputs.contractEnd, String(inputs.wages ?? "").trim(), inputs.joiningDate, inputs.exitDate]);

}

/* "show" when the engine gave something to display (a result, an explanation, or its own error); "hold" when the entries are not complete and valid yet */
export function autoOutcome(result) {

    return result && (result.status === STATUS.incomplete || result.status === STATUS.invalid) ? "hold" : "show";

}

const FIELD_PHRASES = Object.freeze({
    employeeType: () => "the employee type",
    contractEnd: () => "how the contract ends",
    wages: () => "the qualifying monthly wages",
    joiningDate: (fixed) => (fixed ? "the contract start date" : "the joining date"),
    exitDate: (fixed) => (fixed ? "the contract end date" : "the exit date")
});

/* the guidance shown in place of a result while the entries are not ready: what is still needed, never a figure */
export function holdMessage(view, employeeType) {

    const errors = view && Array.isArray(view.errors) ? view.errors : [];
    if (errors.some((error) => error.code !== ERRORS.required)) {
        return "Check the highlighted fields. The result appears here as soon as they are complete and valid.";
    }
    const fixed = employeeType === EMPLOYEE_TYPES.fixedTerm;
    const missing = errors.map((error) => (FIELD_PHRASES[error.field] ? FIELD_PHRASES[error.field](fixed) : null)).filter(Boolean);
    if (!missing.length) {
        return EMPTY_MESSAGE;
    }
    const text = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;
    return `Still needed: ${text}. The result appears here as soon as they are complete.`;

}
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
        service: null,
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

    const fixedTerm = inputs.employeeType === EMPLOYEE_TYPES.fixedTerm;
    view.service = {
        startLabel: fixedTerm ? "Contract start date" : "Joining date",
        endLabel: fixedTerm ? "Contract end date" : "Exit date",
        start: formatIsoDate(inputs.joiningDate),
        end: formatIsoDate(inputs.exitDate),
        duration: serviceText(service),
        countedYears: view.amount && result.countedYears !== null ? String(result.countedYears) : null
    };
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

    const serviceBlock = view.service
        ? `
                <section class="gratuity-service" aria-labelledby="gratuity-service-heading">
                    <h3 id="gratuity-service-heading">Your service</h3>
                    <dl class="gratuity-service__grid">
                        <div><dt>${escapeHTML(view.service.startLabel)}</dt><dd>${escapeHTML(view.service.start)}</dd></div>
                        <div><dt>${escapeHTML(view.service.endLabel)}</dt><dd>${escapeHTML(view.service.end)}</dd></div>
                        <div class="gratuity-service__wide"><dt>Service on these dates</dt><dd class="gratuity-service__duration">${escapeHTML(view.service.duration)}</dd></div>
                        ${view.service.countedYears !== null ? `<div><dt>Years counted for the formula</dt><dd>${escapeHTML(view.service.countedYears)}</dd></div>` : ""}
                    </dl>
                    ${view.service.countedYears !== null ? `<p class="gratuity-service__note">${escapeHTML(COUNTED_YEARS_NOTE)}</p>` : ""}
                </section>`
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
                ${amount}${serviceBlock}${notes}${checks}${working}${assumptions}
            </div>`;

}


/* =========================================================
   P1 FEATURES (G6): the date explorer, the wage comparison and the
   copied summary. All three show only what the engine returns
   (exploreExitDates, compareWages, calculateGratuity); nothing is
   recalculated here. Pure; exported for the tests.
========================================================= */

const EXPLORER_LABELS = Object.freeze({
    FIVE_YEAR_DATE: "On the calendar five-year date",
    PLUS_6_MONTHS: "Six months after your exit date",
    PLUS_12_MONTHS: "One year after your exit date"
});

const EXPLORER_NOTE = "These are hypothetical exit dates with the same joining date and wages. They show how the dates and the figures change, not what is due, and they are not advice on when to leave. A row that shows five calendar years reached is not a promise of gratuity: continuous service and the other conditions still apply.";

const COMPARE_NOTE = "The same dates and rules are used for both wages. A higher gross salary does not necessarily raise the qualifying wages, so compare the wages your employer counts for gratuity.";

const EMPLOYEE_TYPE_TEXT = Object.freeze({
    [EMPLOYEE_TYPES.regular]: "Regular employee (including an employee of a contractor)",
    [EMPLOYEE_TYPES.fixedTerm]: "Fixed-term employee, engaged directly by the employer"
});

const CONTRACT_END_TEXT = Object.freeze({
    [CONTRACT_ENDS.expires]: "The contract runs to its end (it expires)"
});

/* the explorer table of an engine exploration; null when there is nothing to show (not a regular employee, or invalid) */
export function describeExplorer(exploration) {

    if (!exploration || exploration.status !== STATUS.ok || !Array.isArray(exploration.rows) || !exploration.rows.length) {
        return null;
    }

    const rows = exploration.rows.map((row) => {

        const view = describeResult(row.result);

        return {
            id: row.id,
            label: EXPLORER_LABELS[row.id] ?? "Hypothetical exit date",
            dateText: formatIsoDate(row.exitDate),
            short: view.short,
            serviceLine: view.working ? view.working[1][1] : "",
            amount: view.amount,
            notes: view.notes
        };

    });

    const wagesPaise = exploration.base.trace.inputs.wagesPaise;

    return {
        rows,
        wageLine: `Wages used for every row: ${formatPaise(wagesPaise)} a month.`,
        notes: [...new Set(rows.flatMap((row) => row.notes))]
    };

}

/* the comparison of two wages; the difference is the engine's, shown as a word and an amount, never a signed number */
export function describeComparison(comparison) {

    const ok = (r) => r && r.status === STATUS.ok;

    if (!ok(comparison.first)) {
        return { errors: [], unavailable: true };
    }

    if (comparison.second.status === STATUS.incomplete || comparison.second.status === STATUS.invalid) {
        return {
            errors: comparison.second.errors
                .filter((error) => error.field === "wages")
                .map((error) => errorMessage("wages", error.code)),
            unavailable: false
        };
    }

    if (!ok(comparison.second) || comparison.differencePaise === null
        || comparison.first.amount.paise === null || comparison.second.amount.paise === null) {
        return { errors: [], unavailable: true };
    }

    const first = comparison.first;
    const second = comparison.second;
    const illustrative = first.amount.kind === AMOUNT_KINDS.illustrative || second.amount.kind === AMOUNT_KINDS.illustrative;
    const noun = illustrative ? "illustrative amounts" : "estimates";

    const difference = comparison.differencePaise;
    const amount = formatPaise(Math.abs(difference));

    const sentence = difference === 0
        ? `The two ${noun} are the same.`
        : `The second ${illustrative ? "illustrative amount" : "estimate"} is ${amount} ${difference > 0 ? "higher" : "lower"} than the first.`;

    return {
        errors: [],
        unavailable: false,
        illustrative,
        rows: [
            ["First wages (as calculated)", `${formatPaise(first.trace.inputs.wagesPaise)} a month`, formatPaise(first.amount.paise), first.amount.ceilingApplied === true],
            ["Second wages", `${formatPaise(second.trace.inputs.wagesPaise)} a month`, formatPaise(second.amount.paise), second.amount.ceilingApplied === true]
        ],
        amountLabel: first.amount.kind === second.amount.kind ? AMOUNT_LABELS[first.amount.kind] : AMOUNT_LABELS[AMOUNT_KINDS.illustrative],
        sentence,
        announcement: `Comparison: ${sentence}`
    };

}

/* the plain-text summary for the clipboard: only the calculated, valid inputs; every qualification kept */
export function summaryText(result, inputs) {

    const view = describeResult(result);

    if (result.status !== STATUS.ok || !inputs) {
        return "";
    }

    const fixed = inputs.employeeType === EMPLOYEE_TYPES.fixedTerm;

    const lines = [
        "Gratuity estimate (ToolZen Hub Gratuity Calculator)",
        `An estimate under the Code on Social Security, 2020, for exits on or after 21 November 2025. Rules checked on ${formatIsoDate(RULES_CHECKED_ON)}.`,
        "",
        "What was entered",
        `- Employee type: ${EMPLOYEE_TYPE_TEXT[inputs.employeeType] ?? ""}`
    ];

    if (fixed && CONTRACT_END_TEXT[inputs.contractEnd]) {
        lines.push(`- Contract end: ${CONTRACT_END_TEXT[inputs.contractEnd]}`);
    }

    lines.push(
        `- Qualifying monthly wages: ${formatPaise(result.trace.inputs.wagesPaise)}`,
        `- ${fixed ? "Contract start date" : "Joining date"}: ${formatIsoDate(result.trace.inputs.joiningDate)}`,
        `- ${fixed ? "Contract end date" : "Exit date"}: ${formatIsoDate(result.trace.inputs.exitDate)}`,
        "",
        "Result",
        view.statement
    );

    if (view.fiveYearSentence) {
        lines.push(view.fiveYearSentence);
    }

    if (view.amount) {
        lines.push(`${view.amount.label}: ${view.amount.text}`);
    }

    if (view.working) {
        lines.push("", "How it was worked out");
        for (const [label, value] of view.working) {
            lines.push(`- ${label}: ${value}`);
        }
    }

    const section = (title, items) => {
        if (items.length) {
            lines.push("", title, ...items.map((item) => `- ${item}`));
        }
    };

    section("Notes", view.notes);
    section("What this estimate assumes", view.assumptions);
    section("Check with your employer or payroll", view.checks);

    lines.push("", "This is an estimate, not legal advice and not a determination of entitlement. Your employer decides the actual payment.");

    return lines.join("\n");

}

/* ---- markup for the three features ---- */

export function renderExplorerHtml(explorer) {

    if (!explorer) {
        return "";
    }

    const rows = explorer.rows.map((row) => `
                    <li class="gratuity-explorer__row">
                        <h4 class="gratuity-explorer__date">${escapeHTML(row.label)}: ${escapeHTML(row.dateText)}</h4>
                        <p>${escapeHTML(row.short)}</p>
                        <p>${escapeHTML(row.serviceLine)}</p>
                        ${row.amount ? `<p class="gratuity-explorer__amount" data-kind="${escapeHTML(row.amount.kind)}"><span>${escapeHTML(row.amount.label)}</span> <strong>${escapeHTML(row.amount.text)}</strong></p>` : "<p>No amount is shown for these dates.</p>"}
                    </li>`).join("");

    return `
            <section class="gratuity-panel gratuity-explorer" aria-labelledby="gratuity-explorer-heading">
                <h3 id="gratuity-explorer-heading">If your exit date were later (hypothetical)</h3>
                <p class="gratuity-panel__note">${escapeHTML(EXPLORER_NOTE)}</p>
                <p>${escapeHTML(explorer.wageLine)}</p>
                <ol class="gratuity-explorer__list">${rows}
                </ol>
                ${explorer.notes.map((note) => `<p class="gratuity-note">${escapeHTML(note)}</p>`).join("")}
            </section>`;

}

export function renderCompareFormHtml() {

    return `
            <section class="gratuity-panel gratuity-compare" aria-labelledby="gratuity-compare-heading">
                <h3 id="gratuity-compare-heading">Compare other monthly wages</h3>
                <p class="gratuity-panel__note">${escapeHTML(COMPARE_NOTE)}</p>
                <form id="gratuity-compare-form" novalidate>
                    <label class="calculator-form__label" for="gratuity-wages-second">Second qualifying monthly wages (₹ a month)</label>
                    <input
                        id="gratuity-wages-second"
                        class="calculator-form__input"
                        type="text"
                        inputmode="decimal"
                        autocomplete="off"
                        spellcheck="false"
                        aria-describedby="gratuity-wages-second-hint"
                    >
                    <p class="calculator-form__help" id="gratuity-wages-second-hint">Digits only, for example 150000 or 150000.50.</p>
                    <p class="gratuity-field-error" id="gratuity-error-wages-second" hidden></p>
                    <button type="submit" class="calculator-form__button calculator-form__button--secondary" data-needs-current>Compare</button>
                </form>
                <div id="gratuity-compare-output"></div>
            </section>`;

}

export function renderComparisonHtml(view) {

    if (view.unavailable) {
        return `<p class="gratuity-note">No amount can be compared for these wages.</p>`;
    }

    const rows = view.rows.map(([label, wages, amount, capped]) => `
                        <div class="gratuity-compare__row">
                            <dt>${escapeHTML(label)}</dt>
                            <dd>${escapeHTML(wages)}: <strong>${escapeHTML(amount)}</strong>${capped ? ` (${escapeHTML(DISCLOSURE_TEXT[DISCLOSURES.ceilingApplied])})` : ""}</dd>
                        </div>`).join("");

    return `
                <div class="gratuity-compare__result">
                    <p class="gratuity-compare__label">${escapeHTML(view.amountLabel)}</p>
                    <dl>${rows}
                    </dl>
                    <p class="gratuity-compare__difference"><strong>${escapeHTML(view.sentence)}</strong></p>
                </div>`;

}

export function renderCopyHtml() {

    return `
            <section class="gratuity-panel gratuity-copy" aria-labelledby="gratuity-copy-heading">
                <h3 id="gratuity-copy-heading">Copy a summary</h3>
                <p class="gratuity-panel__note">Plain text you can paste into an email to your employer's HR. It is copied only when you press the button, and nothing is sent anywhere.</p>
                <button type="button" class="calculator-form__button calculator-form__button--secondary" id="gratuity-copy" data-needs-current>Copy summary</button>
                <p class="gratuity-copy__status" id="gratuity-copy-status"></p>
                <div id="gratuity-copy-fallback"></div>
            </section>`;

}


/* =========================================================
   WHAT THE PAGE SHOWS (pure; exported for the tests)
   A result is current until a field is edited; an edit after a
   result that shows a figure or an explanation marks it out of
   date; the next complete, valid entries replace it; a Reset clears
   everything.
   The inputs the result was calculated from are kept with it, so
   the features below it never read the fields as they are now.
========================================================= */

export const INITIAL_STATE = Object.freeze({ result: null, stale: false, inputs: null });

export function reduceState(state, action) {

    switch (action.type) {

        case "calculate":
            return { result: action.result, stale: false, inputs: action.inputs ?? null };

        case "edit":
            /* validation messages are not figures: editing after them marks nothing out of date */
            return state.result && (state.result.status === STATUS.ok || state.result.status === STATUS.unsupported)
                ? { result: state.result, stale: true, inputs: state.inputs }
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
                    Choose the employee type and enter your qualifying monthly
                    wages and your dates. The result appears by itself once
                    they are complete. The values you enter are not stored or
                    sent anywhere.
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
                    <li>The result appears by itself once your entries are complete and valid. It says what the dates show, gives an estimate or an illustrative amount where the case allows one, and lists what to check with your employer.</li>
                    <li>If you change a value, the result is marked out of date until the new entries are complete and valid, then it updates. Reset clears everything.</li>
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
    let debounceTimer = null;
    let settleTimer = null;
    let lastKey = null;
    let lastAnnounced = "";
    let secondWages = "";
    let compareActive = false;
    const touched = new Set();

    const chosen = (radios) => (radios.find((radio) => radio.checked) || { value: "" }).value;

    function announce(text, delay = 400) {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {
            live.textContent = "";
            live.textContent = text;
        }, delay);

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

    function showErrors(view, { focus = true, only = null } = {}) {

        for (const error of view.errors) {

            if (only && !only(error.field)) {
                continue;
            }

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

        if (!focus) {
            return;
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

        /* the features under the result work from the calculated inputs: they wait for the result to update */
        /* aria-disabled, not disabled: a disabled default button stops Enter from submitting the compare form, so Enter could not explain; the handlers refuse while stale */
        for (const button of results.querySelectorAll("[data-needs-current]")) {

            if (state.stale) {
                button.setAttribute("aria-disabled", "true");
            } else {
                button.removeAttribute("aria-disabled");
            }

        }

    }

    /* the engine's answer for the entries as they stand; nothing is shown here */
    function run(inputs) {

        let result;
        let exploration = null;

        try {
            result = calculateGratuity(inputs);
            if (result.status === STATUS.ok && inputs.employeeType === EMPLOYEE_TYPES.regular) {
                exploration = describeExplorer(exploreExitDates(inputs));
            }
        } catch (error) {
            result = { status: STATUS.error, code: CODES.internalError, errors: [] };
            exploration = null;
        }

        return { result, exploration };

    }

    /* one announcement per settled change: the same text is never announced twice in a row, and typing announces nothing */
    function announceSettled(text) {

        if (!text || text === lastAnnounced) {
            return;
        }

        lastAnnounced = text;
        announce(text, ANNOUNCE_DELAY_MS);

    }

    /* a field's message may be shown once the person has committed it (left it, or paused after typing) or when it holds a value */
    const mayShowError = (inputs) => (field) => touched.has(field) || String(inputs[field] ?? "").trim() !== "";

    /* the entries are not complete and valid yet: no new figure. An earlier result stays, labelled out of date; with none, say what is needed */
    function hold(result, inputs, settled) {

        const view = describeResult(result);

        clearErrors();

        if (!state.result) {
            results.innerHTML = resultEmpty(holdMessage(view, inputs.employeeType));
        }

        const reveal = () => showErrors(view, { focus: false, only: mayShowError(inputs) });

        if (settled) {
            reveal();
        } else {
            settleTimer = setTimeout(reveal, AUTO_DELAY_MS);
        }

        showState();

    }

    function show(result, exploration, inputs) {

        const workingOpen = results.querySelector(".gratuity-working")?.open === true;

        state = reduceState(state, { type: "calculate", result, inputs });

        const view = describeResult(result);

        results.innerHTML = renderResultHtml(view)
            + (result.status === STATUS.ok
                ? renderExplorerHtml(exploration) + (view.amount ? renderCompareFormHtml() : "") + renderCopyHtml()
                : "");

        if (workingOpen) {
            results.querySelector(".gratuity-working")?.setAttribute("open", "");
        }

        showState();

        /* the comparison wages the person typed stay; a comparison that was showing is worked out again for the new result */
        const second = results.querySelector("#gratuity-wages-second");

        if (second) {
            second.value = secondWages;
            if (compareActive && secondWages.trim() !== "") {
                compare({ silent: true });
            }
        } else {
            compareActive = false;
        }

        announceSettled(view.announcement);

    }

    /* calculates for the entries as they stand: a result when they are complete and valid, otherwise nothing new is shown */
    function evaluate({ settled }) {

        clearTimeout(debounceTimer);
        clearTimeout(settleTimer);
        debounceTimer = null;
        settleTimer = null;

        const inputs = collect();
        const key = inputsKey(inputs);

        if (state.result && key === lastKey) {
            /* back to the entries the shown result used: it is current again, and nothing is calculated twice */
            clearErrors();
            state = reduceState(state, { type: "calculate", result: state.result, inputs: state.inputs });
            showState();
            return;
        }

        const { result, exploration } = run(inputs);

        if (autoOutcome(result) === "hold") {
            hold(result, inputs, settled);
            return;
        }

        clearErrors();
        lastKey = key;
        show(result, exploration, inputs);

    }

    /* Enter never submits the page; it only asks for the answer now, with any messages */
    form.addEventListener("submit", (event) => {

        event.preventDefault();
        evaluate({ settled: true });

    });

    /* the second wages: an explicit Compare, from the inputs the result was calculated from */

    function compare({ silent = false } = {}) {

        const input = results.querySelector("#gratuity-wages-second");
        const message = results.querySelector("#gratuity-error-wages-second");
        const output = results.querySelector("#gratuity-compare-output");

        if (!input || !message || !output || !state.inputs) {
            return;
        }

        /* while the result is out of date Compare is aria-disabled: say why nothing changed */
        if (state.stale) {

            message.innerHTML = `<strong>Error:</strong> ${escapeHTML(STALE_COMPARE_MESSAGE)}`;
            message.hidden = false;

            if (!silent) {
                announceNow(STALE_COMPARE_MESSAGE);
            }

            return;

        }

        message.hidden = true;
        message.textContent = "";
        clearFieldsInvalid([input], message.id);
        output.innerHTML = "";

        let view;

        try {
            view = describeComparison(compareWages(state.inputs, input.value));
        } catch (error) {
            view = { errors: [], unavailable: true };
        }

        if (view.errors.length) {

            message.innerHTML = `<strong>Error:</strong> ${escapeHTML(view.errors[0])}`;
            message.hidden = false;
            setFieldsInvalid([input], message.id);
            compareActive = false;

            if (!silent) {
                input.focus();
                announceNow(view.errors[0]);
            }

            return;

        }

        output.innerHTML = renderComparisonHtml(view);
        compareActive = !view.unavailable;

        if (!silent) {
            announceNow(view.unavailable ? "No amount can be compared for these wages." : view.announcement);
        }

    }

    /* the summary: written to the clipboard only on a click; when that is not possible the text is shown for manual copy */

    async function copySummary() {

        const status = results.querySelector("#gratuity-copy-status");
        const fallback = results.querySelector("#gratuity-copy-fallback");

        if (!status || !fallback || !state.result) {
            return;
        }

        if (state.stale) {

            status.textContent = STALE_COPY_MESSAGE;
            fallback.innerHTML = "";
            announceNow(STALE_COPY_MESSAGE);

            return;

        }

        const text = summaryText(state.result, state.inputs);

        status.textContent = "";
        fallback.innerHTML = "";

        let copied = false;

        try {

            if (text && typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                await navigator.clipboard.writeText(text);
                copied = true;
            }

        } catch (error) {

            copied = false;

        }

        if (copied) {

            status.textContent = "Summary copied to the clipboard.";
            announceNow("Summary copied to the clipboard.");

            return;

        }

        status.textContent = "The summary could not be copied automatically. Select the text below and copy it yourself.";

        fallback.innerHTML = `
            <label class="calculator-form__label" for="gratuity-copy-text">Summary text</label>
            <textarea id="gratuity-copy-text" class="gratuity-copy__text" rows="10" readonly></textarea>`;

        const area = fallback.querySelector("textarea");

        area.value = text;
        area.focus();
        area.select();

        announceNow("The summary could not be copied automatically. The text is shown for you to copy.");

    }

    results.addEventListener("submit", (event) => {

        if (event.target && event.target.id === "gratuity-compare-form") {

            event.preventDefault();

            compare();

        }

    });

    results.addEventListener("click", (event) => {

        const target = event.target && typeof event.target.closest === "function" ? event.target.closest("#gratuity-copy") : null;

        if (target) {
            copySummary();
        }

    });

    /* the comparison wages are remembered; changing them clears the figures that belonged to the old wages */
    results.addEventListener("input", (event) => {

        if (event.target && event.target.id === "gratuity-wages-second") {

            secondWages = event.target.value;
            compareActive = false;

            const output = results.querySelector("#gratuity-compare-output");

            if (output) {
                output.innerHTML = "";
            }

        }

    });

    const fieldOf = (target) => (target === wages ? "wages"
        : target === joining ? "joiningDate"
        : target === exit ? "exitDate"
        : typeRadios.includes(target) ? "employeeType"
        : endRadios.includes(target) ? "contractEnd"
        : null);

    /* an edit makes a shown result out of date at once; it stays visible, labelled, until the new entries give a new one */
    function markEdit() {

        syncType();
        state = reduceState(state, { type: "edit" });
        showState();

    }

    form.addEventListener("input", (event) => {

        const field = fieldOf(event.target);

        markEdit();

        if (field) {
            clearOne(field);
        }

        /* typed wages wait for a pause; the date pickers and the choices report when they are done (the change event) */
        if (field === "wages") {

            clearTimeout(debounceTimer);
            clearTimeout(settleTimer);

            debounceTimer = setTimeout(() => {

                if (wages.value.trim() !== "") {
                    touched.add("wages");
                }

                evaluate({ settled: true });

            }, AUTO_DELAY_MS);

        }

    });

    form.addEventListener("change", (event) => {

        const field = fieldOf(event.target);

        markEdit();

        if (field) {
            touched.add(field);
        }

        evaluate({ settled: field === "wages" });

    });

    wages.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            if (wages.value.trim() !== "") {
                touched.add("wages");
            }

            evaluate({ settled: true });

        }

    });

    root.querySelector("#gratuity-reset")?.addEventListener("click", () => {

        clearTimeout(debounceTimer);
        clearTimeout(settleTimer);
        clearTimeout(announceTimer);
        debounceTimer = null;
        settleTimer = null;

        for (const radio of [...typeRadios, ...endRadios]) {
            radio.checked = false;
        }

        wages.value = "";
        joining.value = "";
        exit.value = "";

        touched.clear();
        lastKey = null;
        lastAnnounced = "";
        secondWages = "";
        compareActive = false;

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
