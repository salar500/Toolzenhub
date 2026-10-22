/* =========================================================
   ToolZen Hub
   Salary / CTC to In-Hand Calculator (Tool Pack 30): the rules

   THE ONE PLACE THIS TOOL'S OWN NUMBERS LIVE. The tax numbers (slabs,
   rebate, cess, standard deduction, the 80C cap, rounding) are NOT here:
   they stay in income-tax-config.js and are used only through the
   Tool Pack 17 engine. Every value below names where it was read.
   Specification: docs/tool-packs/30-salary-ctc-in-hand.md (sections 0
   and 6.0).

   Money is in WHOLE RUPEES. Rates are integer fractions, so no
   floating point enters a calculation.
========================================================= */

function deepFreeze(value) {

    if (value && typeof value === "object" && !Object.isFrozen(value)) {

        Object.freeze(value);

        for (const key of Object.keys(value)) {
            deepFreeze(value[key]);
        }

    }

    return value;

}

export const SALARY_YEAR_2026_27 = deepFreeze({

    id: "2026-27",

    validFrom: "2026-04-01",
    validThrough: "2027-03-31",

    /* the last date these numbers were checked against the sources below (spec section 0) */
    verifiedOn: "2026-10-22",

    /*
     * Provident fund contribution rate: twelve per cent of wages.
     * S.O. 3582(E), 1 July 2026 (twelve per cent for covered establishments; a few classes stay at ten per cent and are
     * NOT detected here); Employees' Provident Funds Scheme, 2026 (G.S.R. 525(E)), paragraph 18(2): the employee's
     * contribution equals the employer's.
     */
    pf: {
        rateNumerator: 12,
        rateDenominator: 100,

        /*
         * The monthly wage ceiling: S.O. 5109(E), 17 September 2026, "with effect from the date of publication". Paragraph
         * 18(3) of the Scheme limits the contribution payable to the contribution on the ceiling. The change took effect
         * part-way through the tax year and no split-month rule is prescribed, so the whole year is a run-rate at this
         * ceiling (spec D4).
         */
        wageCeilingMonthly: 25000,
        wageCeilingEffectiveFrom: "2026-09-17"
    },

    /*
     * Gratuity inside CTC: 15 days' wages for each year of service, a month being 26 working days, spread over twelve
     * months, so 15 / (26 x 12) = 15 / 312 of the annual basic. An EMPLOYER CONVENTION shown as an assumption, not the
     * legal model of the Gratuity Calculator (spec 0.4 item 6).
     */
    gratuity: {
        numerator: 15,
        denominator: 312
    },

    /* the largest annual CTC accepted: Tool Pack 17's supported income, and clear of the s.17(1)(h) threshold (spec D10) */
    ctcCap: 5000000,

    sources: [
        "S.O. 5109(E), 17 September 2026 (wage ceiling)",
        "S.O. 3582(E), 1 July 2026 (contribution rate)",
        "Employees' Provident Funds Scheme, 2026, G.S.R. 525(E), paragraphs 2(f), 9, 18, 19",
        "Employees' Pension Scheme, 2026, G.S.R. 527(E), paragraph 4, as amended"
    ]

});

export const ACTIVE_SALARY_YEAR = SALARY_YEAR_2026_27;
