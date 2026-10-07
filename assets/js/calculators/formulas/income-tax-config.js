/* =========================================================
   ToolZen Hub
   Old vs New Tax Regime Calculator: the tax-year rules

   THE ONE PLACE A TAX YEAR'S NUMBERS LIVE. The engine
   (income-tax.js) and the page read this object; nothing else
   contains a slab, a rate, a limit or a rule's year. A new tax
   year is a new object of this shape, written from the law as
   enacted for that year and then verified (see
   docs/tool-packs/17-income-tax-regime-comparison.md, "Annual
   update"). Never carry a number forward unchecked: every value
   below names the provision it was read from.

   TAX YEAR 2026-27 (FY 2026-27, 1 April 2026 to 31 March 2027) is
   the first under the Income-tax Act, 2025, which uses "tax year"
   and not "assessment year". Source texts (all read as primary
   text on the date in `verifiedOn`):

     ACT    Income-tax Act, 2025 (30 of 2025), Gazette of India,
            assent 21 Aug 2025, in force 1 Apr 2026
     FA26   Finance Act, 2026 (4 of 2026), Gazette of India, assent
            30 Mar 2026 (it sets the rates of the old/default
            regime, Part I-B Paragraph A, and the 4% cess)
     RULES  Income-tax Rules, 2026 (G.S.R. 198(E), 20 Mar 2026)

   Sections 19, 123, 124, 126, 156 and 516 of the Act are not
   amended by the Finance Act, 2026; sections 22 (the limit now
   covers sub-sections (1)(b) and (c)) and 202 (sub-clause (iii) of
   sub-section (2)(a), which concerns an SEZ deduction) are, and
   neither changes anything modelled here.

   Money is in WHOLE RUPEES here; the engine works in paise.
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

export const TAX_YEAR_2026_27 = deepFreeze({

    id: "2026-27",

    /* what the page says; never "latest" */
    taxYear: "2026-27",
    financialYear: "FY 2026-27",
    label: "Tax year 2026-27 (FY 2026-27)",

    validFrom: "2026-04-01",
    validThrough: "2027-03-31",

    /* the date these numbers were last checked against the sources below */
    verifiedOn: "2026-10-07",

    /*
     * v1 does not model surcharge, which starts when TOTAL INCOME
     * exceeds Rs 50,00,000 (Finance Act 2026, Part I-B, Paragraph F).
     * The ceiling is applied to salary + other income BEFORE any
     * deduction, so it holds for both regimes whatever is deducted.
     */
    supportedIncomeCeiling: 5000000,

    /* ACT s.202(1) for the new regime; FA26 Part I-B Paragraph A(I) for the old. upTo: null = no upper limit */
    slabs: {
        old: [
            { upTo: 250000, ratePercent: 0 },
            { upTo: 500000, ratePercent: 5 },
            { upTo: 1000000, ratePercent: 20 },
            { upTo: null, ratePercent: 30 }
        ],
        new: [
            { upTo: 400000, ratePercent: 0 },
            { upTo: 800000, ratePercent: 5 },
            { upTo: 1200000, ratePercent: 10 },
            { upTo: 1600000, ratePercent: 15 },
            { upTo: 2000000, ratePercent: 20 },
            { upTo: 2400000, ratePercent: 25 },
            { upTo: null, ratePercent: 30 }
        ]
    },

    /* ACT s.19(1) Table Sl. 2: Rs 75,000 where tax is computed under s.202(1), Rs 50,000 in any other case; each limited to the salary */
    standardDeduction: {
        new: 75000,
        old: 50000
    },

    /* ACT s.156 (rebate, the successor of the old section 87A) */
    rebate: {
        old: {
            /* s.156(1): total income not above this */
            maxTotalIncome: 500000,
            maxRebate: 12500
        },
        new: {
            /* s.156(2)(a); above it, s.156(2)(b) is the marginal relief */
            maxTotalIncome: 1200000,
            maxRebate: 60000
        }
    },

    /* FA26 ss.2 and 3: 4% of income-tax plus surcharge ("Health and Education Cess on income-tax") */
    cessPercent: 4,

    /* ACT s.516: total income and any amount payable are rounded to the nearest multiple of 10 rupees, paise ignored, 5 rounds up */
    roundingMultiple: 10,

    caps: {

        /* ACT s.123 and Schedule XV */
        section80C: 150000,

        /* ACT s.124(3): the individual's own contribution to a notified pension scheme (NPS) */
        ownNps: 50000,

        /* ACT s.126(2)(a), (2)(b), (8)(a): premium for self, spouse, dependent children; for parents */
        healthSelfFamily: 25000,
        healthParentsUnder60: 25000,
        healthParentsSenior: 50000,

        /* ACT s.22(2)(a) and (b), (5): self-occupied property, interest under s.22(1)(b) and (c) */
        homeLoanInterestStandard: 200000,
        homeLoanInterestOther: 30000,

        /* ACT s.124(1) and (2): employer's contribution, as a percentage of "salary" (basic + DA if the terms of employment provide it) */
        employerNpsPercent: {
            oldRegime: 10,
            oldRegimeGovernmentEmployer: 14,
            newRegime: 14
        }

    },

    /* RULES r.279 (for ACT Schedule III Sl. 11): least of three; "salary" = basic + DA if the terms of employment provide it */
    hra: {
        rentExcessOverPercentOfSalary: 10,
        highCityPercentOfSalary: 50,
        otherPercentOfSalary: 40,
        highCities: [
            "Mumbai", "Kolkata", "Delhi", "Chennai",
            "Hyderabad", "Pune", "Ahmedabad", "Bengaluru"
        ]
    },

    /* the sources the page lists under "Rules & sources" */
    sources: [
        {
            topic: "Slabs of the new regime, the rebate, the standard deduction, the deductions the new regime does not allow",
            title: "Income-tax Act, 2025: sections 202, 156, 19, 22, 123, 124, 126",
            url: "https://egazette.gov.in/WriteReadData/2025/265620.pdf",
            publisher: "Gazette of India (e-Gazette)"
        },
        {
            topic: "Slabs of the old regime and the 4% cess for tax year 2026-27",
            title: "The Finance Act, 2026 (No. 4 of 2026): Part I-B of the First Schedule, sections 2 and 3",
            url: "https://egazette.gov.in/WriteReadData/2026/271439.pdf",
            publisher: "Gazette of India (e-Gazette), 30 March 2026"
        },
        {
            topic: "The house rent allowance exemption",
            title: "Income-tax Rules, 2026: rule 279",
            url: "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-03/En-Notified-IT-Rules-2026-20-03-2026.pdf",
            publisher: "Income Tax Department e-filing portal (G.S.R. 198(E), 20 March 2026)"
        },
        {
            topic: "Rounding to the nearest ten rupees",
            title: "Income-tax Act, 2025: section 516",
            url: "https://egazette.gov.in/WriteReadData/2025/265620.pdf",
            publisher: "Gazette of India (e-Gazette)"
        },
        {
            topic: "That the 2025 Act applies from 1 April 2026",
            title: "Income-tax Act, 2025 comes into force from today (1st April, 2026)",
            url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2248005&reg=3&lang=2",
            publisher: "Press Information Bureau, 1 April 2026"
        }
    ]

});

/* the tax year the page calculates for */
export const ACTIVE_TAX_YEAR = TAX_YEAR_2026_27;
