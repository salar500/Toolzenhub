/* =========================================================
   ToolZen Hub
   Gratuity Calculator (India): the model

   An ESTIMATE of gratuity under the Code on Social Security, 2020
   for exits on or after 21 November 2025, from qualifying monthly
   wages and the joining and exit dates. Pure and deterministic: no
   DOM, no storage, no network, no clock, no randomness and no
   JavaScript `Date`. The page (a later phase) owns every sentence,
   the formatting of rupees and the focus; this module returns
   numbers and stable identifiers.

   The approved specification is
   docs/tool-packs/29-gratuity-calculator.md (sections 5 to 7, 29
   and 33). The rules it relies on and what is still open:

   - section 53(2) and Explanation 3: for a monthly-rated employee,
     15 days' wages = monthly wages / 26 x 15, for every counted
     year; a counted year is a completed year, plus one when the
     rest is MORE than six months (exactly six months does not
     count). The counted years feed the AMOUNT only, never an
     eligibility status.
   - the five-year condition and the fixed-term rule: the status of
     a regular employee is a function of the measured service, with
     the "fifth year" line a PRESENTATION classification, not a
     statutory threshold. No status says that anyone IS eligible
     (the result never carries a boolean "eligible"). Two dates
     cannot show that service was legally continuous.
   - the fixed-term amount is an ILLUSTRATIVE reading (the Code says
     only "pro rata"): the s.53(2) rate over the Rule 33 counted
     years, never called payable.
   - the ceiling is a DEVELOPMENT VALUE (see gratuity-rules.js); the
     gazette text of the notification must be verified before release.
   - the service convention is C-prime, PROVISIONAL (gratuity-calendar.js).
   - money: exact integer paise, no floating point; the exact value
     wages x 15 x N / 26 is compared with the ceiling BEFORE any
     rounding; only the final amount is rounded, to the nearest
     paisa, half up. No statutory rounding rule was found, so this is
     the tool's own convention, separate from legal year-counting.

   Nothing in a result is a legal determination, and an error or an
   unsupported case never carries a success-shaped amount (the
   amount is "none" with a null figure, never zero).
========================================================= */

import {
    CODE_EFFECTIVE_DATE,
    RULES_CHECKED_ON,
    DAYS_PER_YEAR_NUMERATOR,
    DAYS_DIVISOR,
    CEILING_PAISE,
    FIVE_YEARS_MONTHS,
    FIXED_TERM_MIN_MONTHS,
    FOURTH_YEAR_LINE_MONTHS,
    WAGES_PRODUCT_LIMIT_PAISE,
    WAGES_TECHNICAL_MAX_PAISE,
    CONVENTION_ID,
    FORMULA_ID,
    EMPLOYEE_TYPES,
    CONTRACT_ENDS,
    STATUS,
    CODES,
    AMOUNT_KINDS,
    ERRORS,
    ASSUMPTIONS,
    PAYROLL_CHECKS,
    DISCLOSURES
} from "./gratuity-rules.js";

import {
    parseDate,
    compareDates,
    formatIso,
    measureService,
    calendarFiveYearDate,
    addMonthsClamp
} from "./gratuity-calendar.js";


/* =========================================================
   SMALL HELPERS
========================================================= */

/* exact floor division of two non-negative safe integers, without floating-point division */
const floorDiv = (a, b) => (a - (a % b)) / b;

function deepFreeze(value) {

    if (value && typeof value === "object" && !Object.isFrozen(value)) {

        Object.freeze(value);

        for (const key of Object.keys(value)) {
            deepFreeze(value[key]);
        }

    }

    return value;

}

const isBlank = (value) => value === undefined || value === null || value === "" || (typeof value === "string" && value.trim() === "");


/* =========================================================
   READING THE WAGES
   Exact digit arithmetic, never floating point. Accepts digits
   with one optional decimal point and at most two decimals.
   Commas and spaces are REFUSED (owner decision 2026-10-21): the
   text is never rewritten. Returns { state: "blank" }
   | { state: "invalid", code } | { state: "valid", paise }.
========================================================= */

export function parseWages(text) {

    if (text === undefined || text === null || (typeof text === "string" && text.trim() === "")) {
        return { state: "blank" };
    }

    if (typeof text !== "string") {
        return { state: "invalid", code: ERRORS.wagesFormat };
    }

    if (/[,\s]/.test(text)) {
        return { state: "invalid", code: ERRORS.wagesSeparator };
    }

    if (/^-\d+(\.\d+)?$/.test(text)) {
        return { state: "invalid", code: ERRORS.wagesNotPositive };
    }

    const match = /^(\d+)(?:\.(\d+))?$/.exec(text);

    if (!match) {
        return { state: "invalid", code: ERRORS.wagesFormat };
    }

    const fraction = match[2] ?? "";

    if (fraction.length > 2) {
        return { state: "invalid", code: ERRORS.wagesDecimals };
    }

    const rupeeDigits = match[1].replace(/^0+(?=\d)/, "");

    /* more digits than the product limit can hold: refused before any number is built */
    if (rupeeDigits.length > 10) {
        return { state: "invalid", code: ERRORS.wagesProductLimit };
    }

    const paise = parseInt(rupeeDigits, 10) * 100 + parseInt(fraction.padEnd(2, "0"), 10);

    if (paise === 0) {
        return { state: "invalid", code: ERRORS.wagesNotPositive };
    }

    if (paise > WAGES_PRODUCT_LIMIT_PAISE) {
        return { state: "invalid", code: ERRORS.wagesProductLimit };
    }

    if (paise > WAGES_TECHNICAL_MAX_PAISE) {
        return { state: "invalid", code: ERRORS.wagesTooLargeExact };
    }

    return { state: "valid", paise };

}


/* =========================================================
   VALIDATION
   Returns { ok: true, values } or { ok: false, errors } where
   errors is [{ field, code }] in field order. Fields that do not
   apply to the chosen type are not read. The input is never
   mutated and never corrected.
========================================================= */

const TYPES = new Set(Object.values(EMPLOYEE_TYPES));
const ENDS = new Set(Object.values(CONTRACT_ENDS));

export function validateGratuityInputs(input) {

    const source = input !== null && typeof input === "object" ? input : {};

    const errors = [];

    const type = source.employeeType;

    if (isBlank(type)) {
        errors.push({ field: "employeeType", code: ERRORS.required });
    } else if (typeof type !== "string" || !TYPES.has(type)) {
        errors.push({ field: "employeeType", code: ERRORS.typeUnknown });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    /* the "other" type has no wages, dates or contract end to read */
    if (type === EMPLOYEE_TYPES.other) {
        return { ok: true, values: { employeeType: type } };
    }

    let contractEnd = null;

    if (type === EMPLOYEE_TYPES.fixedTerm) {

        if (isBlank(source.contractEnd)) {
            errors.push({ field: "contractEnd", code: ERRORS.required });
        } else if (typeof source.contractEnd !== "string" || !ENDS.has(source.contractEnd)) {
            errors.push({ field: "contractEnd", code: ERRORS.contractEndUnknown });
        } else {
            contractEnd = source.contractEnd;
        }

    }

    const wages = parseWages(source.wages);

    if (wages.state === "blank") {
        errors.push({ field: "wages", code: ERRORS.required });
    } else if (wages.state === "invalid") {
        errors.push({ field: "wages", code: wages.code });
    }

    const joining = parseDate(source.joiningDate);

    if (joining.state === "blank") {
        errors.push({ field: "joiningDate", code: ERRORS.required });
    } else if (joining.state === "invalid") {
        errors.push({ field: "joiningDate", code: joining.code });
    }

    const exit = parseDate(source.exitDate);

    if (exit.state === "blank") {
        errors.push({ field: "exitDate", code: ERRORS.required });
    } else if (exit.state === "invalid") {
        errors.push({ field: "exitDate", code: exit.code });
    }

    if (joining.state === "valid" && exit.state === "valid" && compareDates(exit.date, joining.date) < 0) {
        errors.push({ field: "exitDate", code: ERRORS.exitBeforeJoining });
    }

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        values: {
            employeeType: type,
            contractEnd,
            wagesPaise: wages.paise,
            joining: joining.date,
            exit: exit.date
        }
    };

}


/* =========================================================
   COUNTED YEARS (the amount only)
   A completed year, plus one when the remaining period is more
   than six months: 7 to 11 remaining months, or exactly 6 months
   and at least one more day. Exactly six months does not count.
========================================================= */

export function countedYears(service) {

    const completed = Math.floor(service.totalMonths / 12);
    const remainder = service.totalMonths - completed * 12;

    const more = remainder > 6 || (remainder === 6 && service.days >= 1);

    return completed + (more ? 1 : 0);

}


/* =========================================================
   THE AMOUNT
   exact value = wagesPaise x 15 x N / 26. The ceiling applies
   when that exact value is above the ceiling (an integer
   comparison, before any rounding); the amount is then exactly
   the ceiling. Otherwise the display amount is the exact value
   rounded to the nearest paisa, half up:
       floor((2 x wagesPaise x 15 x N + 26) / 52).
   An exact value within half a paisa BELOW the ceiling can round
   up to the ceiling without the ceiling having applied.
========================================================= */

export function computeAmount(wagesPaise, counted, kind) {

    const numerator = wagesPaise * DAYS_PER_YEAR_NUMERATOR * counted;

    const ceilingApplied = numerator > DAYS_DIVISOR * CEILING_PAISE;

    const paise = ceilingApplied
        ? CEILING_PAISE
        : floorDiv(2 * numerator + DAYS_DIVISOR, 2 * DAYS_DIVISOR);

    return {
        kind,
        paise,
        ceilingApplied,
        ceilingPaise: CEILING_PAISE,
        exactNumerator: numerator,
        exactDenominator: DAYS_DIVISOR
    };

}

const noAmount = () => ({
    kind: AMOUNT_KINDS.none,
    paise: null,
    ceilingApplied: false,
    ceilingPaise: CEILING_PAISE,
    exactNumerator: null,
    exactDenominator: null
});


/* =========================================================
   RESULTS
========================================================= */

function baseAssumptions(fixedTerm) {

    const list = [
        ASSUMPTIONS.wagesNotGross,
        ASSUMPTIONS.exitOnOrAfterCodeDate,
        ASSUMPTIONS.establishmentCovered,
        ASSUMPTIONS.continuousService,
        ASSUMPTIONS.bothDaysCounted,
        ASSUMPTIONS.partYearAmountOnly,
        ASSUMPTIONS.ceilingDevelopmentValue,
        ASSUMPTIONS.roundingToolConvention,
        ASSUMPTIONS.employerBetterTerms,
        ASSUMPTIONS.estimateNotLegalAdvice
    ];

    if (fixedTerm) {
        list.push(ASSUMPTIONS.fixedTermSingleContract, ASSUMPTIONS.fixedTermProRataReading);
    }

    return list;

}

function basePayrollChecks(fixedTerm) {

    const list = [
        PAYROLL_CHECKS.wagesFigure,
        PAYROLL_CHECKS.continuityOfService,
        PAYROLL_CHECKS.establishmentCoverage,
        PAYROLL_CHECKS.employerOwnTerms
    ];

    if (fixedTerm) {
        list.push(PAYROLL_CHECKS.fixedTermContractDetails);
    }

    return list;

}

function result({
    status,
    code,
    eligibility = null,
    service = null,
    counted = null,
    amount = noAmount(),
    inputs = null,
    assumptions = [],
    checkWithPayroll = [],
    disclosures = [],
    errors = []
}) {

    return deepFreeze({
        status,
        code,
        eligibility,
        service,
        countedYears: counted,
        amount,
        trace: {
            conventionId: CONVENTION_ID,
            formulaId: FORMULA_ID,
            rulesCheckedOn: RULES_CHECKED_ON,
            inputs
        },
        assumptions,
        checkWithPayroll,
        disclosures,
        errors
    });

}

const serviceView = (measured, extra = {}) => ({
    totalMonths: measured.totalMonths,
    years: measured.years,
    months: measured.months,
    days: measured.days,
    conventionId: CONVENTION_ID,
    exclusiveEnd: formatIso(measured.exclusiveEnd),
    ...extra
});


/* =========================================================
   THE CALCULATION
   calculateGratuity(input) takes the raw form values
     { employeeType, contractEnd, wages, joiningDate, exitDate }
   (strings) and returns a frozen result:
     status      ok | incomplete | invalid | unsupported | error
     code        the stable identifier (CODES) or a validation code
     eligibility { id, subjectToConditions: true } | null
     service     { totalMonths, years, months, days, conventionId,
                   exclusiveEnd, calendarFiveYearDate? } | null
     countedYears the counted years (amount only) | null
     amount      { kind, paise, ceilingApplied, ceilingPaise,
                   exactNumerator, exactDenominator }; paise is null
                   whenever kind is "none"
     trace       conventionId, formulaId, rulesCheckedOn, inputs
     assumptions, checkWithPayroll, disclosures   identifiers
     errors      [{ field, code }]
   Order of decisions (33.6): incomplete, invalid, other type,
   exit before the Code date, fixed-term early end, then service.
========================================================= */

export function calculateGratuity(input) {

    try {

        return decide(input);

    } catch (error) {

        return result({ status: STATUS.error, code: CODES.internalError });

    }

}

function decide(input) {

    const checked = validateGratuityInputs(input);

    if (!checked.ok) {

        const incomplete = checked.errors.some((error) => error.code === ERRORS.required);

        return result({
            status: incomplete ? STATUS.incomplete : STATUS.invalid,
            code: incomplete ? CODES.incomplete : CODES.invalid,
            errors: checked.errors
        });

    }

    const values = checked.values;

    if (values.employeeType === EMPLOYEE_TYPES.other) {

        return result({
            status: STATUS.unsupported,
            code: CODES.unsupportedOtherType,
            inputs: { employeeType: values.employeeType }
        });

    }

    const fixedTerm = values.employeeType === EMPLOYEE_TYPES.fixedTerm;

    const inputs = {
        employeeType: values.employeeType,
        contractEnd: values.contractEnd,
        wagesPaise: values.wagesPaise,
        joiningDate: formatIso(values.joining),
        exitDate: formatIso(values.exit)
    };

    if (compareDates(values.exit, CODE_EFFECTIVE_DATE) < 0) {
        return result({ status: STATUS.unsupported, code: CODES.unsupportedEarlierLaw, inputs });
    }

    if (fixedTerm && values.contractEnd === CONTRACT_ENDS.earlier) {
        return result({ status: STATUS.unsupported, code: CODES.unsupportedFixedTermEarlyEnd, inputs });
    }

    const measured = measureService(values.joining, values.exit);

    const assumptions = baseAssumptions(fixedTerm);
    const checkWithPayroll = basePayrollChecks(fixedTerm);
    const disclosures = values.joining.day >= 29 ? [DISCLOSURES.monthEnd] : [];

    const outcome = (code, kind, extraService = {}) => {

        const counted = kind === AMOUNT_KINDS.none ? null : countedYears(measured);
        const amount = kind === AMOUNT_KINDS.none ? noAmount() : computeAmount(values.wagesPaise, counted, kind);
        const notes = [...disclosures];

        if (kind === AMOUNT_KINDS.illustrative) {
            notes.push(DISCLOSURES.illustrativeNotEntitlement);
        }

        if (amount.ceilingApplied) {
            notes.push(DISCLOSURES.ceilingApplied);
        }

        return result({
            status: STATUS.ok,
            code,
            eligibility: { id: code, subjectToConditions: true },
            service: serviceView(measured, extraService),
            counted,
            amount,
            inputs,
            assumptions,
            checkWithPayroll,
            disclosures: notes
        });

    };

    if (fixedTerm) {

        return measured.totalMonths >= FIXED_TERM_MIN_MONTHS
            ? outcome(CODES.fixedTermOneYearMet, AMOUNT_KINDS.illustrative)
            : outcome(CODES.fixedTermUnderOneYear, AMOUNT_KINDS.none);

    }

    const extra = { calendarFiveYearDate: formatIso(calendarFiveYearDate(values.joining)) };

    if (measured.totalMonths >= FIVE_YEARS_MONTHS) {
        return outcome(CODES.fiveYearsReached, AMOUNT_KINDS.estimated, extra);
    }

    if (measured.totalMonths >= FOURTH_YEAR_LINE_MONTHS) {
        return outcome(CODES.fifthYearUndetermined, AMOUNT_KINDS.illustrative, extra);
    }

    return outcome(CODES.thresholdNotReached, AMOUNT_KINDS.none, extra);

}


/* =========================================================
   SCENARIOS (the same rules, called again; no second model)
========================================================= */

/*
 * The service milestone explorer, for a regular employee only: the calendar five-year date (when five years are not
 * reached on the entered dates), then the entered exit date plus 6 months and plus 12 months (clamp-style, a navigation
 * convention). Each row is a complete calculateGratuity result for that hypothetical exit date.
 */
export function exploreExitDates(input) {

    try {

        return explore(input);

    } catch (error) {

        /* an input whose properties throw: a structured error, never an exception */
        return deepFreeze({ status: STATUS.error, code: CODES.internalError, errors: [], base: null, rows: [] });

    }

}

function explore(input) {

    const base = calculateGratuity(input);

    const empty = (status, code, errors = []) => deepFreeze({ status, code, errors, base, rows: [] });

    const type = input !== null && typeof input === "object" ? input.employeeType : undefined;

    if (type !== EMPLOYEE_TYPES.regular) {
        return empty(STATUS.unsupported, CODES.explorerRegularOnly);
    }

    if (base.status !== STATUS.ok) {
        return empty(base.status, base.code, base.errors);
    }

    const exit = parseDate(input.exitDate).date;
    const join = parseDate(input.joiningDate).date;

    const targets = [];

    if (base.service.totalMonths < FIVE_YEARS_MONTHS) {
        targets.push({ id: "FIVE_YEAR_DATE", date: calendarFiveYearDate(join) });
    }

    targets.push(
        { id: "PLUS_6_MONTHS", date: addMonthsClamp(exit, 6) },
        { id: "PLUS_12_MONTHS", date: addMonthsClamp(exit, 12) }
    );

    const rows = targets.map(({ id, date }) => ({
        id,
        exitDate: formatIso(date),
        result: calculateGratuity({ ...input, exitDate: formatIso(date) })
    }));

    return deepFreeze({ status: STATUS.ok, code: base.code, errors: [], base, rows });

}

/*
 * A second qualifying wage against the same dates and rules. The difference is the difference of the two DISPLAYED
 * amounts (so the screen adds up), or null when either result has no amount.
 */
export function compareWages(input, secondWages) {

    try {

        return compare(input, secondWages);

    } catch (error) {

        const failed = result({ status: STATUS.error, code: CODES.internalError });

        return deepFreeze({ first: failed, second: failed, differencePaise: null });

    }

}

function compare(input, secondWages) {

    const first = calculateGratuity(input);
    const second = calculateGratuity({ ...(input !== null && typeof input === "object" ? input : {}), wages: secondWages });

    const both = first.amount.paise !== null && second.amount.paise !== null;

    return deepFreeze({
        first,
        second,
        differencePaise: both ? second.amount.paise - first.amount.paise : null
    });

}
