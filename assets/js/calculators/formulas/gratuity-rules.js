/* =========================================================
   ToolZen Hub
   Gratuity Calculator (India): the rule constants

   Constants and stable identifiers only: nothing here computes.
   The approved specification is docs/tool-packs/29-gratuity-calculator.md
   (sections 0, 7, 29 and 33); each constant names where it comes from.
   The engine returns these identifiers and numbers; the page owns the
   sentences (and the approved wording of the status statements).

   Sources (read 2026-10-21, see section 0 of the specification):
   - the Code on Social Security, 2020, sections 53 and 54;
   - the Social Security (Central) Rules, 2026, rule 33;
   - the Ministry of Labour and Employment FAQs on the Labour Codes.

   Nothing here is a legal determination. Every figure marked
   "development value" is a product or drafting choice, not a rule of law.
========================================================= */


/* the date from which gratuity under the Code applies: an exit before it is outside the supported scope (D4, L1) */
export const CODE_EFFECTIVE_DATE = Object.freeze({ year: 2025, month: 11, day: 21 });

/* the date these rules were last checked against the sources (shown on the page) */
export const RULES_CHECKED_ON = "2026-10-21";

/* fifteen days' wages per counted year; for a monthly-rated employee the daily wage is the monthly wage / 26 (s.53(2), Explanation 3) */
export const DAYS_PER_YEAR_NUMERATOR = 15;
export const DAYS_DIVISOR = 26;

/*
 * The statutory ceiling, in paise: 20,00,000 rupees. DEVELOPMENT VALUE.
 * Sources: PIB release of 30 March 2018, MoLE FAQ question 12, and section 164(2)(a) of the Code. The gazette text of the
 * notification has NOT been read: it must be verified before release (specification B6).
 */
export const CEILING_PAISE = 200000000;

/* service thresholds, in completed months */
export const FIVE_YEARS_MONTHS = 60;
export const FIXED_TERM_MIN_MONTHS = 12;

/*
 * The "fifth year" line, in completed months: a PRESENTATION classification, not a statutory eligibility threshold
 * (owner decision 2026-10-21). Between this line and five calendar years the page cannot tell, from dates alone,
 * whether the Code's continuous-service rules would treat the last year as complete.
 */
export const FOURTH_YEAR_LINE_MONTHS = 48;

/* the product input limit on monthly wages: 1,00,00,000 rupees in paise. A product limit, not a legal ceiling (owner decision 2026-10-21) */
export const WAGES_PRODUCT_LIMIT_PAISE = 1000000000;

/*
 * Technical safety limit, derived rather than chosen. The amount arithmetic is 2 x wagesPaise x 15 x N + 26 for the
 * display rounding, and every intermediate must stay a safe integer (at most 2^53 - 1). The counted years N are below
 * MAX_COUNTED_YEARS because the calendar accepts the years 1 to 9999, so
 *     wagesPaise <= floor((2^53 - 1 - 26) / (30 x MAX_COUNTED_YEARS)).
 * For 10,000 counted years that is about 3.0e10 paise (about 30 crore rupees a month); the product limit above is far lower.
 */
export const MAX_COUNTED_YEARS = 10000;
export const WAGES_TECHNICAL_MAX_PAISE = Math.floor((Number.MAX_SAFE_INTEGER - 26) / (30 * MAX_COUNTED_YEARS));

/* identifiers of the convention and the formula (the C-prime anniversary: 29.2 of the specification) */
export const CONVENTION_ID = "C_PRIME_PROVISIONAL";
export const FORMULA_ID = "GRATUITY_15_OVER_26_PER_COUNTED_YEAR";

export const EMPLOYEE_TYPES = Object.freeze({
    regular: "regular",
    fixedTerm: "fixedTerm",
    other: "other"
});

export const CONTRACT_ENDS = Object.freeze({
    expires: "expires",
    earlier: "earlier"
});

/* result statuses and their stable codes (33.6) */
export const STATUS = Object.freeze({
    ok: "ok",
    incomplete: "incomplete",
    invalid: "invalid",
    unsupported: "unsupported",
    error: "error"
});

export const CODES = Object.freeze({
    incomplete: "INCOMPLETE",
    invalid: "INVALID",
    unsupportedOtherType: "UNSUPPORTED_OTHER_TYPE",
    unsupportedEarlierLaw: "UNSUPPORTED_EARLIER_LAW",
    unsupportedFixedTermEarlyEnd: "UNSUPPORTED_FT_EARLY_END",
    fixedTermUnderOneYear: "FT_UNDER_ONE_YEAR",
    fixedTermOneYearMet: "FT_ONE_YEAR_MET",
    fiveYearsReached: "STATUS_FIVE_YEARS_REACHED",
    fifthYearUndetermined: "STATUS_FIFTH_YEAR_UNDETERMINED",
    thresholdNotReached: "STATUS_THRESHOLD_NOT_REACHED",
    explorerRegularOnly: "EXPLORER_REGULAR_ONLY",
    internalError: "INTERNAL_ERROR"
});

/* amount kinds: only "estimated" may be shown as an estimate; "illustrative" is never an entitlement; "none" has no figure */
export const AMOUNT_KINDS = Object.freeze({
    estimated: "estimated",
    illustrative: "illustrative",
    none: "none"
});

/* field error codes */
export const ERRORS = Object.freeze({
    required: "REQUIRED",
    typeUnknown: "TYPE_UNKNOWN",
    contractEndUnknown: "CONTRACT_END_UNKNOWN",
    wagesFormat: "WAGES_FORMAT",
    wagesSeparator: "WAGES_SEPARATOR",
    wagesNotPositive: "WAGES_NOT_POSITIVE",
    wagesDecimals: "WAGES_DECIMALS",
    wagesProductLimit: "WAGES_PRODUCT_LIMIT",
    wagesTooLargeExact: "WAGES_TOO_LARGE_EXACT",
    dateFormat: "DATE_FORMAT",
    dateInvalid: "DATE_INVALID",
    exitBeforeJoining: "EXIT_BEFORE_JOINING"
});

/* assumption, payroll-check and disclosure identifiers: the page owns their wording */
export const ASSUMPTIONS = Object.freeze({
    wagesNotGross: "QUALIFYING_WAGES_NOT_GROSS",
    exitOnOrAfterCodeDate: "EXIT_ON_OR_AFTER_CODE_DATE",
    establishmentCovered: "ESTABLISHMENT_COVERED",
    continuousService: "CONTINUOUS_SERVICE_ASSUMED",
    bothDaysCounted: "BOTH_DAYS_COUNTED_C_PRIME",
    partYearAmountOnly: "PART_YEAR_OVER_SIX_MONTHS_AMOUNT_ONLY",
    ceilingDevelopmentValue: "CEILING_DEVELOPMENT_VALUE",
    roundingToolConvention: "ROUNDING_TOOL_CONVENTION",
    employerBetterTerms: "EMPLOYER_BETTER_TERMS",
    estimateNotLegalAdvice: "ESTIMATE_NOT_LEGAL_ADVICE",
    fixedTermSingleContract: "FT_SINGLE_CONTRACT",
    fixedTermProRataReading: "FT_PRO_RATA_READING"
});

export const PAYROLL_CHECKS = Object.freeze({
    wagesFigure: "WAGES_FIGURE",
    continuityOfService: "CONTINUITY_OF_SERVICE",
    establishmentCoverage: "ESTABLISHMENT_COVERAGE",
    employerOwnTerms: "EMPLOYER_OWN_TERMS",
    fixedTermContractDetails: "FIXED_TERM_CONTRACT_DETAILS"
});

export const DISCLOSURES = Object.freeze({
    monthEnd: "MONTH_END_DISCLOSURE",
    illustrativeNotEntitlement: "ILLUSTRATIVE_NOT_ENTITLEMENT",
    ceilingApplied: "CEILING_APPLIED"
});
