/* =========================================================
   ToolZen Hub
   Salary / CTC to In-Hand Calculator, India (Calculators, Tax)

   An ESTIMATE of annual and average monthly take-home pay from an
   annual CTC, for tax year 2026-27. The model, its conventions, every
   status and the independent oracle are in formulas/salary-in-hand.js
   (with salary-in-hand-config.js); this file is the page around it and
   does no calculation of its own. The approved specification is
   docs/tool-packs/30-salary-ctc-in-hand.md (sections 4 to 6, 9, 10 and
   19, and the S4 notes in section 21).

   - Results appear by themselves once the required entries are complete
     and valid (rulebook 7.9; there is no Calculate button). Editing a
     field marks the figures out of date until the new entries give new
     ones; the page never shows a figure for inputs it was not calculated
     from, and incomplete or invalid entries never produce one.
   - Nothing is chosen for the user: the basic percentage, the PF basis
     and the gratuity choice are required and start empty.
   - The old-regime comparison is optional and independent: it can be
     incomplete or invalid while the new-regime estimate stays valid.
   - An automatic update never moves focus. A polite live region
     announces a settled change once (not while typing); after Reset,
     focus returns to the first field.
   - Money is whole rupees, grouped in the Indian style from integers,
     never through a floating-point value. Every dynamic value is written
     as escaped text. Nothing is stored or sent.
========================================================= */

import {
    calculateSalary,
    roundHalfUp,
    PF_BASES
} from "../formulas/salary-in-hand.js";

import {
    ACTIVE_SALARY_YEAR
} from "../formulas/salary-in-hand-config.js";

import {
    getCalculatorById
} from "../../data/calculators.js";

import {
    reportIssueMarkup
} from "../../components/report-issue.js";

import {
    ROUTES
} from "../../routes.js";

import {
    fieldShell,
    setFieldsInvalid,
    clearFieldsInvalid
} from "../../ui/field.js";

import {
    resultEmpty
} from "../../ui/result.js";

import {
    escapeHTML
} from "../../ui/escape.js";


const CONFIG = ACTIVE_SALARY_YEAR;

const TITLE =
    getCalculatorById("salary-in-hand").title;

const TAX_TOOL =
    getCalculatorById("income-tax");

const IDS = {
    ctc: "sih-ctc",
    basic: "sih-basic",
    professionalTax: "sih-pt",
    other: "sih-other",
    oldToggle: "sih-old-toggle",
    hra: "sih-hra",
    rent: "sih-rent",
    other80C: "sih-80c"
};

const PF_NAME = "sih-pf";
const GRATUITY_NAME = "sih-gratuity";
const METRO_NAME = "sih-metro";

/* the engine's field names -> the id of the message shown beside the control */
const ERROR_IDS = {
    ctc: "sih-error-ctc",
    basicPercent: "sih-error-basic",
    pfBasis: "sih-error-pf",
    gratuityIncluded: "sih-error-gratuity",
    professionalTax: "sih-error-pt",
    otherEmployerCosts: "sih-error-other",
    hraReceived: "sih-error-hra",
    rentPaid: "sih-error-rent",
    other80C: "sih-error-80c",
    highCity: "sih-error-metro",
    decomposition: "sih-error-general"
};

const CEILING = CONFIG.pf.wageCeilingMonthly;
const CEILING_MONTHLY_PF = roundHalfUp(CONFIG.pf.rateNumerator * CEILING, CONFIG.pf.rateDenominator);
const CTC_CAP = CONFIG.ctcCap;


/* =========================================================
   MONEY AND DATES (pure; exported for the tests)
========================================================= */

/* Indian grouping of a string of digits: the last three, then pairs (1200000 -> 12,00,000) */
export function groupIndian(digits) {

    if (digits.length <= 3) {
        return digits;
    }

    const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");

    return `${head},${digits.slice(-3)}`;

}

export function formatRupees(amount) {

    return `${amount < 0 ? "−" : ""}₹${groupIndian(String(Math.abs(amount)))}`;

}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatIsoDate(text) {

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

    return match ? `${Number(match[3])} ${MONTHS[Number(match[2]) - 1]} ${match[1]}` : String(text);

}

/*
 * A typed amount of whole rupees. Digits, with commas or spaces allowed as separators (12,00,000); nothing else.
 *   { state: "empty" }  nothing typed
 *   { state: "bad" }    anything that is not a whole number of rupees (decimals, signs, letters, more than 15 digits)
 *   { state: "ok", value }
 */
export function parseRupees(text) {

    const raw = String(text ?? "");

    if (raw.trim() === "") {
        return { state: "empty" };
    }

    const digits = raw.replace(/[,\s]/g, "");

    return /^\d{1,15}$/.test(digits)
        ? { state: "ok", value: Number(digits) }
        : { state: "bad" };

}

/* today's date in India, as YYYY-MM-DD, for the validity check; the clock is read by the page, never by the engine */
export function todayIso(nowMs = Date.now()) {

    return new Date(nowMs + 330 * 60 * 1000).toISOString().slice(0, 10);

}


/* =========================================================
   WORDING
   Everything the person reads that is not built from a figure.
========================================================= */

export const AUTO_DELAY_MS = 600;
export const ANNOUNCE_DELAY_MS = 1000;

/* the Gratuity Calculator's out-of-date wording and behaviour, reused (owner decision D11); a test asserts it equals Gratuity's own */
export const STALE_BADGE_LABEL = "Out of date";
export const STALE_BADGE_TEXT = "These figures are not your current estimate.";
export const staleBadgeHtml = () => `<p class="sih-stale-badge" data-stale-badge hidden><strong>${STALE_BADGE_LABEL}.</strong> ${STALE_BADGE_TEXT}</p>`;

const STALE_MESSAGE = "You have changed a value. The figures below are out of date and will update when your entries are complete and valid.";
const EMPTY_MESSAGE = "Enter your annual CTC, your basic salary share, how your PF is worked out and whether gratuity is in your CTC. Your estimate appears here as soon as they are complete.";
const RESET_MESSAGE = "Cleared. Enter your annual CTC to start again.";
const CHECK_MESSAGE = "Check the highlighted fields. The result appears here as soon as they are complete and valid.";
const INTERNAL_MESSAGE = "Something went wrong while working out the estimate, so no figure is shown. Please reload the page and try again.";

const AMOUNT_ERROR = "Enter a whole number of rupees, using digits only (commas are fine). Enter 0 if none.";

const FIELD_ERRORS = Object.freeze({
    ctc: "Enter your annual CTC in rupees, using digits only (commas are fine), for example 1200000. It must be more than 0.",
    basicPercent: "Enter a percentage from 1 to 100, with at most two decimals, for example 50 or 42.5.",
    pfBasis: "Choose how your provident fund contribution is worked out.",
    gratuityIncluded: "Choose yes or no.",
    professionalTax: AMOUNT_ERROR,
    otherEmployerCosts: AMOUNT_ERROR,
    hraReceived: AMOUNT_ERROR,
    rentPaid: AMOUNT_ERROR,
    other80C: AMOUNT_ERROR,
    highCity: "Choose yes or no."
});

/* what the engine meant when it flagged a field that was typed correctly */
const SEMANTIC_ERRORS = Object.freeze({
    professionalTax: "Professional tax cannot be more than your gross salary.",
    hraReceived: "HRA received and your basic salary together cannot be more than your gross salary."
});

const MISSING_PHRASES = Object.freeze({
    ctc: "your annual CTC",
    basicPercent: "your basic salary share",
    pfBasis: "how your PF is worked out",
    gratuityIncluded: "whether gratuity is in your CTC",
    hraReceived: "HRA received (0 if none)",
    rentPaid: "rent paid (0 if none)",
    other80C: "other 80C investments (0 if none)",
    highCity: "the city choice"
});

const PF_TEXT = Object.freeze({
    capped: `Capped at the wage ceiling: 12% of basic, on at most ${formatRupees(CEILING)} a month, so at most ${formatRupees(CEILING_MONTHLY_PF)} a month. This is the statutory contribution.`,
    "full-basic": "12% of your whole basic salary. This is a higher contribution that is voluntary or jointly agreed with your employer, who matches it.",
    none: "No provident fund contribution, for example because you are not a PF member or your employer is not covered."
});

const PF_SHORT = Object.freeze({
    capped: `capped at the wage ceiling (12% on at most ${formatRupees(CEILING)} a month)`,
    "full-basic": "12% of your whole basic salary (a voluntary or jointly agreed arrangement)",
    none: "no PF contribution"
});

const OLD_INCLUDED = [
    "the old-regime standard deduction",
    "the professional tax you entered",
    "your own PF counted as an 80C deduction",
    "any other 80C investments you entered (the limit is applied for you)",
    "an HRA exemption worked out from your HRA, rent and city"
];

const OLD_EXCLUDED = [
    "home loan interest",
    "health insurance",
    "your own NPS contribution",
    "employer NPS",
    "LTA and other exemptions",
    "any other deduction",
    "any other income"
];

const list = (items) => `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;


/* =========================================================
   FROM THE FIELDS TO THE ENGINE'S INPUT (pure)
========================================================= */

/*
 * `fields` are the strings and choices as they stand on the page:
 *   { ctc, basicPercent, pfBasis, gratuity: "yes"|"no"|"", professionalTax, otherEmployerCosts,
 *     oldEnabled, hraReceived, rentPaid, metro: "yes"|"no"|"", other80C }
 * A blank amount is absent (the engine says what is missing); an amount that is not a whole number of rupees is passed as NaN,
 * which the engine refuses on that field, and is remembered in `typed` so the message says "digits only" rather than a rule.
 */
export function buildInput(fields) {

    const typed = {};

    const amount = (key, text) => {

        const parsed = parseRupees(text);

        if (parsed.state === "bad") {
            typed[key] = true;
            return Number.NaN;
        }

        return parsed.state === "empty" ? undefined : parsed.value;

    };

    const basic = String(fields.basicPercent ?? "").trim();

    const input = {
        ctc: amount("ctc", fields.ctc),
        basicPercent: basic === "" ? undefined : basic,
        pfBasis: fields.pfBasis || undefined,
        gratuityIncluded: fields.gratuity === "yes" ? true : fields.gratuity === "no" ? false : undefined,
        otherEmployerCosts: amount("otherEmployerCosts", fields.otherEmployerCosts),
        professionalTax: amount("professionalTax", fields.professionalTax)
    };

    if (fields.oldEnabled) {

        input.oldRegime = {
            enabled: true,
            hraReceived: amount("hraReceived", fields.hraReceived),
            rentPaid: amount("rentPaid", fields.rentPaid),
            other80C: amount("other80C", fields.other80C),
            highCity: fields.metro === "yes" ? true : fields.metro === "no" ? false : undefined
        };

    }

    return { input, typed };

}

/* the entries a result was calculated from, as one comparable text (so unchanged entries are not calculated twice) */
export function inputsKey(fields) {

    return JSON.stringify([
        String(fields.ctc ?? "").trim(), String(fields.basicPercent ?? "").trim(), fields.pfBasis, fields.gratuity,
        String(fields.professionalTax ?? "").trim(), String(fields.otherEmployerCosts ?? "").trim(),
        Boolean(fields.oldEnabled), String(fields.hraReceived ?? "").trim(), String(fields.rentPaid ?? "").trim(),
        fields.metro, String(fields.other80C ?? "").trim()
    ]);

}

/* "show" when the engine gave something to display; "hold" when the entries are not complete and valid yet */
export function autoOutcome(result) {

    return result && (result.status === "incomplete" || result.status === "invalid") ? "hold" : "show";

}

/* the engine's error keys for a result, with the page's messages: [{ field, message }] */
export function errorList(result, typed = {}) {

    const errors = result.status === "invalid"
        ? result.errors
        : result.status === "ok" && result.old && result.old.status === "invalid"
            ? result.old.errors
            : {};

    return Object.keys(errors).map((field) => {

        if (field === "decomposition") {
            return { field, message: errors[field] };
        }

        const message = typed[field] || !SEMANTIC_ERRORS[field]
            ? FIELD_ERRORS[field]
            : SEMANTIC_ERRORS[field];

        return { field, message: message || errors[field] };

    });

}

/* the missing entries as one phrase: "a", "a and b", "a, b and c" */
function joinPhrases(fieldsMissing) {

    const phrases = fieldsMissing.map((field) => MISSING_PHRASES[field]).filter(Boolean);

    return phrases.length < 2
        ? phrases.join("")
        : `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`;

}

/* the guidance shown in place of a result while the entries are not ready: what is still needed, never a figure */
export function holdMessage(result, typed = {}) {

    if (result && result.status === "invalid") {

        const only = errorList(result, typed);

        return only.length === 1 && only[0].field === "decomposition"
            ? `${only[0].message} The result appears here as soon as the entries work together.`
            : CHECK_MESSAGE;

    }

    const missing = result && result.status === "incomplete" ? joinPhrases(result.missing) : "";

    return missing
        ? `Still needed: ${missing}. The result appears here as soon as they are complete.`
        : EMPTY_MESSAGE;

}


/* =========================================================
   THE VIEW OF A RESULT (pure; exported for the tests)
========================================================= */

export function unsupportedMessage(result) {

    if (result.reason === "ctc-above-cap") {
        return `This calculator handles an annual CTC of up to ${formatRupees(CTC_CAP)}. Above that, tax rules it does not cover (such as surcharge) apply, so no figure is shown.`;
    }

    if (result.reason === "outside-validity") {
        return `These figures are for tax year ${CONFIG.id} (${formatIsoDate(CONFIG.validFrom)} to ${formatIsoDate(CONFIG.validThrough)}). The rules may have changed since, and this calculator has not been updated, so no figure is shown.`;
    }

    if (result.reason === "internal") {
        return INTERNAL_MESSAGE;
    }

    return "This combination of entries is outside what this calculator can work out reliably, so no figure is shown.";

}

function oldView(old, typed) {

    if (!old || old.status === "off") {
        return null;
    }

    if (old.status === "ok") {
        return {
            status: "ok",
            monthly: formatRupees(old.monthlyAverage),
            annual: formatRupees(old.annualTakeHome),
            tax: formatRupees(old.tax)
        };
    }

    if (old.status === "incomplete") {

        return { status: "incomplete", message: `Still needed for the old-regime figure: ${joinPhrases(old.missing)}. Your new-regime estimate above does not depend on these.` };

    }

    if (old.status === "invalid") {
        return { status: "invalid", message: "The old-regime figure is not shown: check the highlighted old-regime fields. Your new-regime estimate above is not affected." };
    }

    return { status: "unsupported", message: "The old-regime figure could not be worked out for these entries and is not shown. Your new-regime estimate above is not affected." };

}

export function describeResult(result, typed = {}, fields = {}) {

    if (result.status === "incomplete") {
        return { kind: "hold", message: holdMessage(result, typed) };
    }

    if (result.status === "invalid") {
        return { kind: "hold", message: holdMessage(result, typed), errors: errorList(result, typed) };
    }

    if (result.status === "unsupported") {
        return { kind: "unsupported", message: unsupportedMessage(result), announcement: unsupportedMessage(result) };
    }

    const monthly = formatRupees(result.new.monthlyAverage);
    const annual = formatRupees(result.new.annualTakeHome);

    const rows = [
        { type: "total", label: "Annual CTC", value: formatRupees(result.ctc) },
        { type: "group", label: "Less: employer-side costs (not paid to you as cash)" },
        { type: "row", label: "Employer PF (the employer's share)", value: formatRupees(result.employerPf) }
    ];

    if (result.gratuity > 0) {
        rows.push({ type: "row", label: "Gratuity set aside by the employer", value: formatRupees(result.gratuity) });
    }

    if (result.otherEmployerCosts > 0) {
        rows.push({ type: "row", label: "Other employer-only costs", value: formatRupees(result.otherEmployerCosts) });
    }

    rows.push(
        { type: "total", label: "Gross salary (paid to you before your own deductions)", value: formatRupees(result.gross) },
        { type: "group", label: "Less: deducted from your pay" },
        { type: "row", label: "Your PF (the employee's share)", value: formatRupees(result.employeePf) },
        {
            type: "row",
            label: result.professionalTax > 0 ? "Professional tax" : "Professional tax (none entered, so not included)",
            value: formatRupees(result.professionalTax)
        },
        { type: "row", label: "Estimated income tax for the year (new regime, with cess)", value: formatRupees(result.new.tax) },
        { type: "total", label: "Estimated take-home per year", value: annual },
        { type: "row", label: "Average per month (the yearly figure divided by 12)", value: monthly }
    );

    const basicShare = String(fields.basicPercent ?? "").trim();

    const working = [
        `Basic salary: ${formatRupees(result.basic)}${basicShare ? ` (${basicShare}% of your CTC)` : ""}.`,
        result.pfBasis === "none"
            ? "Provident fund: none."
            : `Provident fund: ${formatRupees(result.monthlyPf)} a month for you and the same for your employer, which is ${formatRupees(result.employerPf)} a year each.`
    ];

    return {
        kind: "ok",
        monthly,
        annual,
        rows,
        working,
        old: oldView(result.old, typed),
        pfBasis: result.pfBasis,
        gratuityIncluded: result.gratuity > 0,
        announcement: `Estimated take-home: about ${monthly} a month on average, ${annual} a year, under the new tax regime.`
    };

}

/* the assumptions shown next to every result (the same facts as the specification's section 9) */
export function assumptionLines(view) {

    return [
        `Tax year ${CONFIG.id}, for a resident individual under 60 with salary from one employer for the whole year and no other income. The rules were checked on ${formatIsoDate(CONFIG.verifiedOn)}.`,
        `Your PF: ${PF_SHORT[view.pfBasis]}. The rate is 12% of wages, each month's amount rounded to the nearest rupee. The wage ceiling of ${formatRupees(CEILING)} a month has applied since ${formatIsoDate(CONFIG.pf.wageCeilingEffectiveFrom)} and is used for the whole year here. A few industries have a 10% rate, which is not covered.`,
        "This is a simplified estimate from your CTC, not a statutory wage calculation. Your basic salary is used as your PF wages. The labour codes can add part of your allowances to wages when they are more than half of your total pay, which is not applied here. If your basic is less than half your pay, your actual PF may be higher and your take-home lower.",
        view.gratuityIncluded
            ? "Gratuity inside your CTC is taken as about 4.81% of basic salary (15 days' wages for each year of service). That is a common employer convention, not a legal calculation. Check it against your offer letter."
            : "No gratuity amount is taken out of your CTC.",
        "Not included: bonus and other variable pay, ESI, employer NPS, other income, surcharge, and joining or leaving part-way through the year.",
        "The tax shown is your estimated tax for the whole year. Your employer deducts tax at source (TDS) month by month on its own projection, so your actual deductions can differ from this.",
        "Your real payslip can differ from the monthly average shown. It is an estimate for planning and comparing offers, not a payslip, payroll or tax advice, and it has not yet been reviewed by an independent payroll or tax professional."
    ];

}

export const SOURCES_TEXT = "Sources: wage ceiling, Ministry of Labour and Employment notification S.O. 5109(E) of 17 September 2026; PF rate, S.O. 3582(E) of 1 July 2026 and the Employees' Provident Funds Scheme, 2026; tax, the Income-tax Act, 2025 and the Finance Act, 2026, through the Old vs New Tax Regime Calculator.";


/* =========================================================
   RESULT MARKUP (pure strings; exported for the tests)
========================================================= */

function tableHtml(rows) {

    const body = rows.map((row) => row.type === "group"
        ? `<tr class="sih-table__group"><td colspan="2">${escapeHTML(row.label)}</td></tr>`
        : `<tr class="sih-table__${row.type}"><th scope="row">${escapeHTML(row.label)}</th><td>${escapeHTML(row.value)}</td></tr>`).join("");

    return `
                <div class="sih-table-wrap">
                    <table class="sih-table">
                        <caption>From your CTC to your take-home, for the year</caption>
                        <tbody>${body}</tbody>
                    </table>
                </div>`;

}

function oldHtml(old) {

    if (!old) {
        return "";
    }

    const body = old.status === "ok"
        ? `
                    <div class="calculator-results__grid sih-metrics">
                        <div class="calculator-results__item"><span class="calculator-results__label">Average per month (old regime)</span><strong class="calculator-results__value">${escapeHTML(old.monthly)}</strong></div>
                        <div class="calculator-results__item"><span class="calculator-results__label">Take-home per year (old regime)</span><strong class="calculator-results__value">${escapeHTML(old.annual)}</strong></div>
                    </div>
                    <p class="sih-note">Estimated income tax for the year under the old regime: ${escapeHTML(old.tax)}, with cess.</p>
                    <p class="sih-note"><strong>Included:</strong> ${escapeHTML(OLD_INCLUDED.join("; "))}.<br><strong>Not included:</strong> ${escapeHTML(OLD_EXCLUDED.join("; "))}.</p>
                    <p class="sih-note">This uses only what is listed above. It is not a full old-regime tax assessment, and it does not say which regime is better for you. For a fuller comparison use the <a href="${escapeHTML(TAX_TOOL.href)}">${escapeHTML(TAX_TOOL.title)}</a>.</p>`
        : `
                    <p class="sih-note">${escapeHTML(old.message)}</p>`;

    return `
                <section class="sih-block sih-old" aria-labelledby="sih-old-heading">
                    <h3 id="sih-old-heading">Old tax regime (optional comparison)</h3>${body}
                </section>`;

}

export function renderResultHtml(view) {

    if (view.kind === "unsupported") {

        return `
            <div class="calculator-results__card sih-result" data-kind="unsupported">
                ${staleBadgeHtml()}
                <div class="calculator-results__error">${escapeHTML(view.message)}</div>
            </div>`;

    }

    return `
            <div class="calculator-results__card sih-result" data-kind="ok">

                <div class="calculator-results__header">

                    <span class="calculator-results__eyebrow">
                        Your Estimate
                    </span>

                    <h2 class="calculator-results__title" id="sih-result-heading" tabindex="-1">
                        Your estimated take-home (new tax regime)
                    </h2>

                </div>

                ${staleBadgeHtml()}
                <div class="calculator-results__grid sih-metrics">
                    <div class="calculator-results__item calculator-results__item--primary"><span class="calculator-results__label">Average per month (estimate)</span><strong class="calculator-results__value">${escapeHTML(view.monthly)}</strong></div>
                    <div class="calculator-results__item calculator-results__item--primary"><span class="calculator-results__label">Per year (estimate)</span><strong class="calculator-results__value">${escapeHTML(view.annual)}</strong></div>
                </div>
                <p class="sih-note">The monthly figure is the yearly estimate divided by 12. It is an average, not an exact bank deposit: your real payslip, and the tax your employer deducts month by month (TDS), can differ.</p>
                ${tableHtml(view.rows)}
                <ul class="sih-working">${view.working.map((line) => `<li>${escapeHTML(line)}</li>`).join("")}</ul>
                ${oldHtml(view.old)}
                <section class="sih-block" aria-labelledby="sih-assumptions-heading">
                    <h3 id="sih-assumptions-heading">What this estimate assumes</h3>
                    ${list(assumptionLines(view))}
                    <p class="sih-sources">${escapeHTML(SOURCES_TEXT)}</p>
                </section>
            </div>`;

}


/* =========================================================
   STATE
   The figures and the entries they came from are kept together.
========================================================= */

export const INITIAL_STATE = Object.freeze({ result: null, stale: false, inputs: null });

export function reduceState(state, action) {

    switch (action.type) {

        case "calculate":
            return { result: action.result, stale: false, inputs: action.inputs ?? null };

        case "edit":
            /* validation messages are not figures: editing after them marks nothing out of date */
            return state.result && (state.result.status === "ok" || state.result.status === "unsupported")
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

const choice = ({ name, id, value, text }) => `
                                <label class="sih-choice">
                                    <input type="radio" id="${id}" name="${name}" value="${value}">
                                    <span>${escapeHTML(text)}</span>
                                </label>`;

const amountInput = (id) => `<input
                                    id="${id}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="numeric"
                                    autocomplete="off"
                                    spellcheck="false"
                                    aria-describedby="${id}-hint"
                                >`;

const errorLine = (id) => `<p class="sih-field-error" id="${id}" hidden></p>`;

export function markup() {

    return `
        <div class="calculator-page">

            <!-- INTRO -->

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Salary Tool
                    </span>

                    <h1>
                        ${escapeHTML(TITLE)}
                    </h1>

                    <p>
                        Enter your annual CTC and how your employer builds it. You
                        get an estimate of the salary you receive in hand, every
                        step shown. It is an estimate, not your payslip.
                    </p>

                    <p class="sih-checked">
                        Tax year ${escapeHTML(CONFIG.id)}. Rules checked on ${escapeHTML(formatIsoDate(CONFIG.verifiedOn))}.
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
                    Estimate Your Take-Home Salary
                </div>

                <p class="calculator-section__description">
                    Answer the four questions below. The result appears by itself
                    once they are answered. The values you enter are not stored or
                    sent anywhere.
                </p>

                <p class="sih-expired" id="sih-expired" hidden>
                    This calculator is for tax year ${escapeHTML(CONFIG.id)}, which has ended. The rules may have changed, so it shows no figure until it is updated.
                </p>

                <form
                    id="sih-form"
                    class="calculator-form"
                    novalidate
                >

                    <div class="calculator-form__grid sih-grid">

                        ${fieldShell({
                            id: IDS.ctc,
                            label: "Annual CTC",
                            unit: "₹ a year",
                            hint: `Cost to company: the total yearly amount your employer spends on you, as in your offer letter. It includes employer PF and often gratuity, which you do not receive as cash, so it is more than your in-hand pay. Digits only, for example 1200000, up to ${formatRupees(CTC_CAP)}.`,
                            control: amountInput(IDS.ctc)
                        })}
                        ${errorLine(ERROR_IDS.ctc)}

                        ${fieldShell({
                            id: IDS.basic,
                            label: "Basic Salary",
                            unit: "% of CTC",
                            hint: "The share of your CTC that is basic salary (add dearness allowance if your offer has one). Find “Basic” in your offer letter and divide it by the CTC. Your employer chooses this share; the law does not set it. It decides your PF and gratuity here, so enter your own figure, for example 50 or 42.5.",
                            control: `<input
                                    id="${IDS.basic}"
                                    class="calculator-form__input"
                                    type="text"
                                    inputmode="decimal"
                                    autocomplete="off"
                                    spellcheck="false"
                                    aria-describedby="${IDS.basic}-hint"
                                >`
                        })}
                        ${errorLine(ERROR_IDS.basicPercent)}

                        <fieldset class="sih-choices" id="sih-pf-group" aria-describedby="sih-pf-hint">

                            <legend class="calculator-form__label">
                                Provident Fund (PF) Contribution
                            </legend>

                            <p class="calculator-form__help sih-legend-help" id="sih-pf-hint">
                                Your offer letter or payslip shows which one applies. Choose the one that matches it. This calculator cannot know your employer's policy, and the choice can change your take-home noticeably.
                            </p>

                            <div class="sih-choices__options">
                                ${choice({ name: PF_NAME, id: "sih-pf-capped", value: "capped", text: PF_TEXT.capped })}
                                ${choice({ name: PF_NAME, id: "sih-pf-full", value: "full-basic", text: PF_TEXT["full-basic"] })}
                                ${choice({ name: PF_NAME, id: "sih-pf-none", value: "none", text: PF_TEXT.none })}
                            </div>

                            ${errorLine(ERROR_IDS.pfBasis)}

                        </fieldset>

                        <fieldset class="sih-choices" id="sih-gratuity-group" aria-describedby="sih-gratuity-hint">

                            <legend class="calculator-form__label">
                                Is Gratuity Included in Your CTC?
                            </legend>

                            <p class="calculator-form__help sih-legend-help" id="sih-gratuity-hint">
                                Many offers count an amount for gratuity inside the CTC. It is not paid to you monthly. If you choose yes, about 4.81% of basic salary (15 days' wages for each year of service) is taken out of your CTC, a common employer convention you can check against your offer letter.
                            </p>

                            <div class="sih-choices__options sih-choices__options--row">
                                ${choice({ name: GRATUITY_NAME, id: "sih-gratuity-yes", value: "yes", text: "Yes, it is included" })}
                                ${choice({ name: GRATUITY_NAME, id: "sih-gratuity-no", value: "no", text: "No, it is not" })}
                            </div>

                            ${errorLine(ERROR_IDS.gratuityIncluded)}

                        </fieldset>

                        <div class="sih-optional">

                            <h3 class="sih-optional__title">Other Amounts (Optional)</h3>

                            ${fieldShell({
                                id: IDS.professionalTax,
                                label: "Professional Tax",
                                unit: "₹ a year",
                                hint: "Some states charge a professional tax, which your employer deducts from your pay. Enter the yearly total from your payslip (the monthly amount times 12). Leave it empty if you do not pay it or do not know; it is then not included.",
                                control: amountInput(IDS.professionalTax)
                            })}
                            ${errorLine(ERROR_IDS.professionalTax)}

                            ${fieldShell({
                                id: IDS.other,
                                label: "Other Employer-Only Costs",
                                unit: "₹ a year",
                                hint: "Amounts inside your CTC that you do not receive as cash, such as the employer's health insurance premium or administrative charges, if your offer lists them. Leave it empty if none.",
                                control: amountInput(IDS.other)
                            })}
                            ${errorLine(ERROR_IDS.otherEmployerCosts)}

                            ${errorLine(ERROR_IDS.decomposition)}

                        </div>

                        <div class="sih-old-group">

                            <label class="sih-toggle">
                                <input type="checkbox" id="${IDS.oldToggle}" aria-describedby="${IDS.oldToggle}-hint">
                                <span>Also show my take-home under the old tax regime (optional)</span>
                            </label>

                            <p class="calculator-form__help sih-legend-help" id="${IDS.oldToggle}-hint">
                                The estimate above uses the new tax regime. This adds an old-regime figure based only on the deductions you give here. It is not a full old-regime tax calculation and does not say which regime is better for you.
                            </p>

                            <div class="sih-old-fields" id="sih-old-fields" hidden>

                                ${fieldShell({
                                    id: IDS.hra,
                                    label: "HRA Received",
                                    unit: "₹ a year",
                                    hint: "The house rent allowance in your salary, for the year. Enter 0 if you get none.",
                                    control: amountInput(IDS.hra)
                                })}
                                ${errorLine(ERROR_IDS.hraReceived)}

                                ${fieldShell({
                                    id: IDS.rent,
                                    label: "Rent Paid",
                                    unit: "₹ a year",
                                    hint: "The rent you pay for the year. Enter 0 if you pay none.",
                                    control: amountInput(IDS.rent)
                                })}
                                ${errorLine(ERROR_IDS.rentPaid)}

                                <fieldset class="sih-choices" id="sih-metro-group" hidden>

                                    <legend class="calculator-form__label">
                                        Do You Live in Delhi, Mumbai, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad or Bengaluru?
                                    </legend>

                                    <div class="sih-choices__options sih-choices__options--row">
                                        ${choice({ name: METRO_NAME, id: "sih-metro-yes", value: "yes", text: "Yes" })}
                                        ${choice({ name: METRO_NAME, id: "sih-metro-no", value: "no", text: "No" })}
                                    </div>

                                    ${errorLine(ERROR_IDS.highCity)}

                                </fieldset>

                                ${fieldShell({
                                    id: IDS.other80C,
                                    label: "Other 80C Investments",
                                    unit: "₹ a year",
                                    hint: "Investments and payments that qualify for the 80C deduction (for example PPF, life insurance premium or tuition fees), apart from your own PF, which is counted for you. The limit of ₹1,50,000 in total is applied for you. Enter 0 if none.",
                                    control: amountInput(IDS.other80C)
                                })}
                                ${errorLine(ERROR_IDS.other80C)}

                            </div>

                        </div>

                    </div>


                    <!-- ACTIONS -->

                    <div class="calculator-form__actions sih-actions">

                        <button
                            type="button"
                            id="sih-reset"
                            class="calculator-form__button calculator-form__button--secondary"
                        >
                            Reset
                        </button>

                    </div>

                </form>

            </section>


            <!-- RESULTS -->

            <p
                id="sih-stale"
                class="sih-stale"
                hidden
            >${escapeHTML(STALE_MESSAGE)}</p>

            <section
                id="sih-results"
                class="calculator-results"
            >
                ${resultEmpty(EMPTY_MESSAGE)}
            </section>

            <p
                id="sih-live"
                class="sih-sr-only"
                role="status"
                aria-live="polite"
            ></p>


            <!-- EXPLANATION -->

            <section class="calculator-info">

                <h2>
                    How to Use the ${escapeHTML(TITLE)}
                </h2>

                <ol>
                    <li>Enter your annual CTC from your offer letter, in rupees.</li>
                    <li>Enter your basic salary as a percentage of the CTC, and choose how your PF is worked out and whether gratuity is inside your CTC. These have no preset value, because they depend on your employer.</li>
                    <li>Add professional tax and other employer-only costs if you know them.</li>
                    <li>Your estimate appears by itself. If you change a value, the figures are marked out of date until the new entries give a new estimate. Reset clears everything.</li>
                </ol>

            </section>

            <section class="calculator-info">

                <h2>
                    What CTC Means, and Why In-Hand Pay Is Lower
                </h2>

                <p>
                    CTC, or cost to company, is what your employer spends on you in a year. Part of it never reaches you as cash: the employer's share of provident fund (PF), gratuity set aside for when you leave, and any insurance or other employer-only costs. Taking those out leaves your gross salary. Your own PF, professional tax and income tax come out of the gross salary, and what is left is your in-hand salary.
                </p>

                <p>
                    Your take-home pay is therefore well below your CTC. The calculator shows each step as a table so you can see where the difference goes.
                </p>

                <h2>
                    Why Two Offers With the Same CTC Can Pay Differently
                </h2>

                <p>
                    The same CTC can be split in different ways. A higher basic salary raises your PF and gratuity, which are not cash, and lowers the allowances that make up the rest. Some employers contribute PF on only the first ${escapeHTML(formatRupees(CEILING))} of monthly basic and others on the whole basic. Variable pay, insurance and other benefits also differ. That is why this calculator asks for these choices instead of assuming them.
                </p>

            </section>

            <section class="calculator-info">

                <h2>
                    ${escapeHTML(TITLE)} FAQ
                </h2>

                <details>
                    <summary>Is the monthly figure what I will get in my bank account?</summary>
                    <p>Not exactly. It is the estimated yearly take-home divided by 12. Your payslip can differ from month to month, for example because of bonuses, a part-year, or how your employer spreads income tax over the year (TDS). Use it to compare offers, not to predict a deposit.</p>
                </details>

                <details>
                    <summary>Why does the PF choice change my take-home so much?</summary>
                    <p>The statutory PF contribution is 12% of wages up to a monthly wage ceiling, now ${escapeHTML(formatRupees(CEILING))}, so at most ${escapeHTML(formatRupees(CEILING_MONTHLY_PF))} a month. Some employers and employees agree to contribute 12% of the whole basic instead. That takes more from both your pay and your employer's side, which is why the two choices give different take-home figures.</p>
                </details>

                <details>
                    <summary>Is gratuity paid to me every month?</summary>
                    <p>No. It is an amount an employer sets aside and pays when you leave, subject to the rules that apply to you. When your CTC includes it, it is part of the cost to your employer but not part of your monthly pay.</p>
                </details>

                <details>
                    <summary>What does the old-regime figure mean?</summary>
                    <p>It uses only the deductions you enter and the ones the page lists. It leaves out deductions such as home loan interest or health insurance, so it is not a full old-regime tax assessment and it does not say which regime is better for you. For a fuller comparison use the <a href="${escapeHTML(TAX_TOOL.href)}">${escapeHTML(TAX_TOOL.title)}</a>.</p>
                </details>

                <details>
                    <summary>What does this calculator leave out?</summary>
                    <p>Bonus and other variable pay, ESI, employer NPS, other income, surcharge, state-specific professional tax rules, and joining or leaving part-way through the year. It also uses your basic salary as your PF wages and does not apply the rule that can add allowances to wages when they exceed half of your pay, so your actual PF can be higher if your basic is a small share of your pay.</p>
                </details>

                <details>
                    <summary>Is my salary stored or sent anywhere?</summary>
                    <p>No. Everything is worked out in your browser. Nothing you enter is stored or sent. See the <a href="${ROUTES.disclaimer}">disclaimer</a>.</p>
                </details>

${reportIssueMarkup({ toolName: "Salary / CTC to in-hand calculator", prompt: "Found a calculation or rule issue, an outdated figure or a broken source link?", linkText: "Report it" })}

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

    const form = root.querySelector("#sih-form");
    const results = root.querySelector("#sih-results");
    const live = root.querySelector("#sih-live");
    const stale = root.querySelector("#sih-stale");

    if (!form || !results || form.dataset.ready === "true") {
        return;
    }

    const $ = (id) => root.querySelector(`#${id}`);

    const text = {
        ctc: $(IDS.ctc),
        basicPercent: $(IDS.basic),
        professionalTax: $(IDS.professionalTax),
        otherEmployerCosts: $(IDS.other),
        hraReceived: $(IDS.hra),
        rentPaid: $(IDS.rent),
        other80C: $(IDS.other80C)
    };

    const pfRadios = [...root.querySelectorAll(`input[name="${PF_NAME}"]`)];
    const gratuityRadios = [...root.querySelectorAll(`input[name="${GRATUITY_NAME}"]`)];
    const metroRadios = [...root.querySelectorAll(`input[name="${METRO_NAME}"]`)];

    const oldToggle = $(IDS.oldToggle);
    const oldFields = $("sih-old-fields");
    const metroGroup = $("sih-metro-group");

    const controls = {
        ctc: { element: text.ctc, focus: () => text.ctc },
        basicPercent: { element: text.basicPercent, focus: () => text.basicPercent },
        pfBasis: { element: $("sih-pf-group"), focus: () => pfRadios[0], group: true, hint: "sih-pf-hint" },
        gratuityIncluded: { element: $("sih-gratuity-group"), focus: () => gratuityRadios[0], group: true, hint: "sih-gratuity-hint" },
        professionalTax: { element: text.professionalTax, focus: () => text.professionalTax },
        otherEmployerCosts: { element: text.otherEmployerCosts, focus: () => text.otherEmployerCosts },
        hraReceived: { element: text.hraReceived, focus: () => text.hraReceived },
        rentPaid: { element: text.rentPaid, focus: () => text.rentPaid },
        highCity: { element: metroGroup, focus: () => metroRadios[0], group: true },
        other80C: { element: text.other80C, focus: () => text.other80C },
        decomposition: { element: null, focus: () => text.basicPercent, general: true }
    };

    const ORDER = ["ctc", "basicPercent", "pfBasis", "gratuityIncluded", "professionalTax", "otherEmployerCosts", "decomposition", "hraReceived", "rentPaid", "highCity", "other80C"];

    let state = INITIAL_STATE;
    let announceTimer = null;
    let debounceTimer = null;
    let settleTimer = null;
    let lastKey = null;
    let lastAnnounced = "";
    const touched = new Set();

    const chosen = (radios) => (radios.find((radio) => radio.checked) || { value: "" }).value;

    function announceNow(message) {

        clearTimeout(announceTimer);

        live.textContent = "";
        live.textContent = message;

    }

    /* one announcement per settled change: the same text is never announced twice in a row, and typing announces nothing */
    function announceSettled(message) {

        if (!message || message === lastAnnounced) {
            return;
        }

        lastAnnounced = message;

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {
            live.textContent = "";
            live.textContent = message;
        }, ANNOUNCE_DELAY_MS);

    }

    function collect() {

        return {
            ctc: text.ctc.value,
            basicPercent: text.basicPercent.value,
            pfBasis: chosen(pfRadios),
            gratuity: chosen(gratuityRadios),
            professionalTax: text.professionalTax.value,
            otherEmployerCosts: text.otherEmployerCosts.value,
            oldEnabled: oldToggle.checked,
            hraReceived: text.hraReceived.value,
            rentPaid: text.rentPaid.value,
            metro: chosen(metroRadios),
            other80C: text.other80C.value
        };

    }

    /* the old-regime fields exist only while the comparison is on; the city question only when HRA and rent are both above zero */
    function syncOld() {

        oldFields.hidden = !oldToggle.checked;

        const hra = parseRupees(text.hraReceived.value);
        const rent = parseRupees(text.rentPaid.value);

        metroGroup.hidden = !(oldToggle.checked && hra.state === "ok" && hra.value > 0 && rent.state === "ok" && rent.value > 0);

        if (metroGroup.hidden) {

            for (const radio of metroRadios) {
                radio.checked = false;
            }

            clearOne("highCity");

        }

    }

    function clearOne(field) {

        const control = controls[field];
        const message = root.querySelector(`#${ERROR_IDS[field]}`);

        message.hidden = true;
        message.textContent = "";

        if (control.general) {
            return;
        }

        if (control.group) {

            if (control.hint) {
                control.element.setAttribute("aria-describedby", control.hint);
            } else {
                control.element.removeAttribute("aria-describedby");
            }

        } else {
            clearFieldsInvalid([control.element], ERROR_IDS[field]);
        }

    }

    function clearErrors() {

        for (const field of ORDER) {
            clearOne(field);
        }

    }

    function showErrors(errors, { only = null } = {}) {

        for (const error of errors) {

            if (only && !only(error.field)) {
                continue;
            }

            const control = controls[error.field];

            if (!control) {
                continue;
            }

            const message = root.querySelector(`#${ERROR_IDS[error.field]}`);

            /* the first problem per field is shown beside it */
            if (!message.hidden) {
                continue;
            }

            message.innerHTML = `<strong>Error:</strong> ${escapeHTML(error.message)}`;
            message.hidden = false;

            if (control.general) {
                continue;
            }

            if (control.group) {
                control.element.setAttribute("aria-describedby", [control.hint, ERROR_IDS[error.field]].filter(Boolean).join(" "));
            } else {
                setFieldsInvalid([control.element], ERROR_IDS[error.field]);
            }

        }

    }

    function showState() {

        stale.hidden = !state.stale;

        if (state.stale) {
            results.dataset.stale = "true";
        } else {
            delete results.dataset.stale;
        }

        /* the label beside the figures is shown exactly while the result is out of date */
        for (const badge of results.querySelectorAll("[data-stale-badge]")) {
            badge.hidden = !state.stale;
        }

    }

    /* the engine's answer for the entries as they stand; nothing is shown here */
    function run(fields) {

        const { input, typed } = buildInput(fields);

        let result;

        try {
            result = calculateSalary(input, { asOf: todayIso() });
        } catch (error) {
            result = { status: "unsupported", reason: "internal" };
        }

        return { result, typed };

    }

    /* a field's message may be shown once the person has committed it (left it, or paused after typing) or when it holds a value */
    const mayShowError = (fields) => (field) => {

        if (field === "decomposition") {
            return true;
        }

        const values = {
            ctc: fields.ctc, basicPercent: fields.basicPercent, pfBasis: fields.pfBasis, gratuityIncluded: fields.gratuity,
            professionalTax: fields.professionalTax, otherEmployerCosts: fields.otherEmployerCosts,
            hraReceived: fields.hraReceived, rentPaid: fields.rentPaid, highCity: fields.metro, other80C: fields.other80C
        };

        return touched.has(field) || String(values[field] ?? "").trim() !== "";

    };

    /* the entries are not complete and valid yet: no new figure. An earlier result stays, labelled out of date; with none, say what is needed */
    function hold(result, typed, fields, settled) {

        const view = describeResult(result, typed, fields);

        clearErrors();

        if (!state.result) {
            results.innerHTML = resultEmpty(view.message);
        }

        const reveal = () => showErrors(view.errors || [], { only: mayShowError(fields) });

        if (settled) {
            reveal();
        } else {
            settleTimer = setTimeout(reveal, AUTO_DELAY_MS);
        }

        showState();

    }

    function show(result, typed, fields, key) {

        state = reduceState(state, { type: "calculate", result, inputs: key });

        const view = describeResult(result, typed, fields);

        results.innerHTML = renderResultHtml(view);

        clearErrors();

        /* an invalid optional old-regime entry is shown beside its field, while the new-regime estimate stands */
        showErrors(errorList(result, typed), { only: mayShowError(fields) });

        showState();

        announceSettled(view.announcement);

    }

    /* calculates for the entries as they stand: a figure when the required entries are complete and valid, otherwise nothing new is shown */
    function evaluate({ settled }) {

        clearTimeout(debounceTimer);
        clearTimeout(settleTimer);
        debounceTimer = null;
        settleTimer = null;

        const fields = collect();
        const key = inputsKey(fields);

        if (state.result && key === lastKey) {
            /* back to the entries the shown result used: it is current again, and nothing is calculated twice */
            clearErrors();
            state = reduceState(state, { type: "calculate", result: state.result, inputs: state.inputs });
            showState();
            return;
        }

        const { result, typed } = run(fields);

        if (autoOutcome(result) === "hold") {
            hold(result, typed, fields, settled);
            return;
        }

        lastKey = key;
        show(result, typed, fields, key);

    }

    /* Enter never submits the page; it only asks for the answer now, with any messages */
    form.addEventListener("submit", (event) => {

        event.preventDefault();
        evaluate({ settled: true });

    });

    const fieldOf = (target) => {

        for (const [field, element] of Object.entries(text)) {

            if (element === target) {
                return field;
            }

        }

        return pfRadios.includes(target) ? "pfBasis"
            : gratuityRadios.includes(target) ? "gratuityIncluded"
            : metroRadios.includes(target) ? "highCity"
            : null;

    };

    /* an edit makes a shown result out of date at once; it stays visible, labelled, until the new entries give a new one */
    function markEdit() {

        syncOld();
        state = reduceState(state, { type: "edit" });
        showState();

    }

    form.addEventListener("input", (event) => {

        const field = fieldOf(event.target);

        markEdit();

        if (field) {
            clearOne(field);
            clearOne("decomposition");
        }

        /* typed amounts wait for a pause; the choices report when they are done (the change event) */
        if (field && text[field]) {

            clearTimeout(debounceTimer);
            clearTimeout(settleTimer);

            debounceTimer = setTimeout(() => {

                if (text[field].value.trim() !== "") {
                    touched.add(field);
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

        evaluate({ settled: Boolean(field && text[field]) });

    });

    form.addEventListener("keydown", (event) => {

        if (event.key === "Enter" && event.target && event.target.tagName === "INPUT" && event.target.type === "text") {

            event.preventDefault();

            const field = fieldOf(event.target);

            if (field && event.target.value.trim() !== "") {
                touched.add(field);
            }

            evaluate({ settled: true });

        }

    });

    root.querySelector("#sih-reset")?.addEventListener("click", () => {

        clearTimeout(debounceTimer);
        clearTimeout(settleTimer);
        clearTimeout(announceTimer);
        debounceTimer = null;
        settleTimer = null;

        for (const radio of [...pfRadios, ...gratuityRadios, ...metroRadios]) {
            radio.checked = false;
        }

        for (const element of Object.values(text)) {
            element.value = "";
        }

        oldToggle.checked = false;

        touched.clear();
        lastKey = null;
        lastAnnounced = "";

        clearErrors();
        state = reduceState(state, { type: "reset" });
        syncOld();
        showState();
        results.innerHTML = resultEmpty(EMPTY_MESSAGE);
        announceNow(RESET_MESSAGE);
        text.ctc.focus();

    });

    /* once the tax year has ended the page says so (the build cannot know the date a visitor opens it) */
    if (todayIso() > CONFIG.validThrough) {
        $("sih-expired").hidden = false;
    }

    syncOld();

    form.dataset.ready = "true";

}

/* the PF bases the page offers, for the tests */
export const PF_CHOICES = PF_BASES;
