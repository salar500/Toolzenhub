/* =========================================================
   ToolZen Hub
   Article Data

   Body content only. Metadata (slug, topic, title, description, dates, read time, related tools and
   articles) lives in data/articles.js.

   Article:
   Tax Saving Guide: Save More, Legally

   Category:
   Tax

   Topic:
   Tax

   TAX YEAR 2026-27 (FY 2026-27), the first under the Income-tax Act, 2025. Every rule and limit below is taken from the same frozen,
   source-cited configuration the Old vs New Tax Regime Calculator uses (calculators/formulas/income-tax-config.js, verified 2026-10-07
   against the Gazette text of the Act and the Finance Act, 2026) and, for the list of payments that qualify under section 123, from
   Schedule XV of the Act as published in the Gazette of India (read 2026-11-05). Nothing here comes from memory or from a summary.
   Figures were checked with the calculator's engine and by hand:
     salary 15,00,000 with Rs 1,50,000 + Rs 50,000 + Rs 25,000 of deductions: old regime 14,50,000 - 2,25,000 = 12,25,000 -> tax
       12,500 + 1,00,000 + 67,500 = 1,80,000, cess 7,200, total 1,87,200; new regime 15,00,000 - 75,000 = 14,25,000 -> tax 20,000 +
       40,000 + 33,750 = 93,750, cess 3,750, total 97,500.
     salary 20,00,000, HRA exemption 3,00,000, deductions 1,50,000 + 50,000 + 25,000 + 25,000, home loan interest 2,00,000: old total
       income 12,00,000 -> tax 12,500 + 1,00,000 + 60,000 = 1,72,500, cess 6,900, total 1,79,400; new regime 19,25,000 -> tax 20,000 +
       40,000 + 60,000 + 65,000 = 1,85,000, cess 7,400, total 1,92,400.
     salary 12,00,000, new regime: 11,25,000 -> tax 20,000 + 32,500 = 52,500, rebate 52,500, tax nil.
     HRA: basic 8,00,000, HRA received 3,00,000, rent 3,60,000 in Pune (50%): least of 3,00,000, 3,60,000 - 80,000 = 2,80,000 and
       4,00,000 = 2,80,000.
========================================================= */


const article = {

    introduction:
        "Saving tax legally means using the deductions and exemptions the law gives you, in the way it describes them, and choosing the tax regime that gives you the lower bill. It does not mean spending money you would not otherwise spend. This guide explains, for an individual resident in India who earns a salary, how the two regimes work in tax year 2026-27, which payments can reduce your tax, and how to compare the regimes with your own numbers. It is information, not tax advice.",

    author: { name: "ToolZen Hub", type: "Organization", role: "Finance & Calculator Guides" },

    tags: ["Income Tax", "Old vs New Regime", "Section 123", "Tax Planning"],

    keyTakeaways: [
        "Tax year 2026-27 (1 April 2026 to 31 March 2027) is the first under the Income-tax Act, 2025. There are two sets of slabs: the new regime and the old regime.",
        "The new regime has lower rates and few deductions: the standard deduction of ₹75,000 for salary and an employer's NPS contribution. The old regime has higher rates and many deductions.",
        "In the old regime, payments listed in Schedule XV reduce your income by up to ₹1,50,000 under section 123. Your own NPS contribution (up to ₹50,000), health insurance, home loan interest on a self-occupied house and house rent allowance are separate.",
        "Which regime is lower depends on your income and on how much you can actually deduct. In this guide ₹15,00,000 of salary pays less under the new regime even with ₹2,25,000 of deductions, and ₹20,00,000 with large deductions pays less under the old one.",
        "Do not spend money only to get a deduction: you keep the rest of what you spend, not the tax saved."
    ],

    calculator: {
        description:
            "Enter your salary and the deductions you can claim, and see the estimated tax under both regimes side by side, with the difference and the break-even."
    },

    tableOfContents: [
        { id: "two-regimes", label: "Two Regimes, Two Tax Bills" },
        { id: "old-regime-deductions", label: "What Reduces Tax in the Old Regime" },
        { id: "new-regime", label: "What the New Regime Allows" },
        { id: "comparing", label: "Compare Before You Choose" },
        { id: "sensible-saving", label: "Saving Sensibly" },
        { id: "records", label: "Records and Claims" },
        { id: "sources", label: "Where These Rules Come From" },
        { id: "article-faq-title", label: "Frequently Asked Questions" }
    ],

    sections: [
        {
            id: "two-regimes",
            heading: "1. Two Regimes, Two Tax Bills",
            paragraphs: [
                "For tax year 2026-27 there are two ways of working out an individual's income tax. Each has its own slabs.",
                "New regime (section 202 of the Income-tax Act, 2025): nil up to ₹4,00,000; 5% from ₹4,00,001 to ₹8,00,000; 10% to ₹12,00,000; 15% to ₹16,00,000; 20% to ₹20,00,000; 25% to ₹24,00,000; 30% above that.",
                "Old regime (for an individual under 60, from the Finance Act, 2026): nil up to ₹2,50,000; 5% to ₹5,00,000; 20% to ₹10,00,000; 30% above that.",
                "In both, a 4% cess is added to the tax, and a salaried person gets a standard deduction: ₹75,000 in the new regime and ₹50,000 in the old. A rebate can bring the tax to nil at lower incomes: in the new regime when total income is up to ₹12,00,000 (the rebate is the tax, up to ₹60,000), and in the old regime up to ₹5,00,000 (up to ₹12,500).",
                "The same salary can give two quite different bills, so the choice of regime is the largest tax decision most people make."
            ]
        },
        {
            id: "old-regime-deductions",
            heading: "2. What Reduces Tax in the Old Regime",
            paragraphs: [
                "Section 123 and Schedule XV. Section 123, the successor to what was section 80C under the older Act, lets certain payments reduce your income, up to ₹1,50,000 in all. The qualifying payments are listed in Schedule XV and include life insurance premium (only the part up to 10% of the sum assured for a policy issued on or after 1 April 2012), contributions to certain provident funds and an employee's contribution to a recognised provident fund, tuition fees paid for up to two children (not donations or development fees), repayment of the amount borrowed for a house from the lenders the Schedule names, and the stamp duty and registration cost of the house, a bank term deposit of not less than five years under a notified scheme, a five-year Post Office time deposit and a Senior Citizen Savings Scheme deposit. Each has its own conditions, so check the Schedule before you rely on one.",
                "Your own NPS contribution. Up to a further ₹50,000 for your own contribution to a notified pension scheme (section 124(3)), not on an amount you have already claimed under section 123.",
                "Health insurance. Premium for yourself, your spouse and dependent children up to ₹25,000, and for parents up to ₹25,000 (₹50,000 if they are senior citizens), including up to ₹5,000 for a preventive health check-up inside those limits (section 126).",
                "Home loan interest. Interest on a loan for a house you live in can reduce your income by up to ₹2,00,000 if the house was bought or built with borrowed money and completed within the time the law allows, and by ₹30,000 in any other case (section 22).",
                "House rent allowance. If you receive HRA and pay rent, the exempt part is the least of three amounts: the HRA you receive, the rent you pay minus 10% of your salary (basic pay plus dearness allowance where the terms provide it), and 50% of that salary if you live in Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad or Bengaluru, or 40% elsewhere (rule 279 of the Income-tax Rules, 2026). With a basic salary of ₹8,00,000, HRA of ₹3,00,000 and rent of ₹3,60,000 in Pune, the amounts are ₹3,00,000, ₹2,80,000 and ₹4,00,000, so ₹2,80,000 is exempt."
            ]
        },
        {
            id: "new-regime",
            heading: "3. What the New Regime Allows",
            paragraphs: [
                "For a salaried person the new regime allows the ₹75,000 standard deduction and an employer's contribution to your NPS account, up to 14% of your salary (basic pay plus dearness allowance where the terms provide it). It does not allow the section 123 deduction, your own NPS contribution, the health insurance deduction, the home loan interest on a house you live in or the house rent allowance exemption.",
                "That is why the new regime is simple: fewer claims, lower rates. It also means that saving through the old regime's deductions has no tax effect if you use the new regime. You may still choose to save for other reasons, but not for the deduction."
            ]
        },
        {
            id: "comparing",
            heading: "4. Compare Before You Choose",
            paragraphs: [
                "Work out the tax both ways with your real numbers. Two examples for tax year 2026-27, with a salary and no other income:",
                "Salary ₹15,00,000, with ₹1,50,000 under section 123, ₹50,000 of your own NPS and ₹25,000 of health insurance. Old regime: income of ₹14,50,000 after the standard deduction, less ₹2,25,000 of deductions, is ₹12,25,000, and the tax is ₹1,80,000 plus 4% cess, ₹1,87,200 in all. New regime: ₹15,00,000 less ₹75,000 is ₹14,25,000, and the tax is ₹93,750 plus cess, ₹97,500. The new regime is lower by ₹89,700.",
                "Salary ₹20,00,000, with an HRA exemption of ₹3,00,000, ₹1,50,000 under section 123, ₹50,000 of your own NPS, ₹25,000 for yourself and ₹25,000 for your parents in health insurance, and ₹2,00,000 of home loan interest. Old regime: total income ₹12,00,000, tax ₹1,72,500 plus cess, ₹1,79,400 in all. New regime: ₹19,25,000, tax ₹1,85,000 plus cess, ₹1,92,400. The old regime is lower by ₹13,000.",
                "At a salary of ₹12,00,000 the new regime's tax before rebate is ₹52,500 and the rebate removes all of it, so nothing is payable. The two regimes can reverse their order as the deductions change, which is why a rule of thumb is not enough."
            ]
        },
        {
            id: "sensible-saving",
            heading: "5. Saving Sensibly",
            paragraphs: [
                "A deduction reduces your tax by your tax rate times the amount, not by the whole amount. In the 30% slab, ₹1,00,000 of a qualifying payment saves at most ₹31,200 with cess; the other ₹68,800 is money you have spent or locked up.",
                "So decide first whether you want the thing. Life insurance should cover the people who depend on you. A provident fund, a deposit or an NPS account should fit your plans and how long you can leave the money. Health insurance protects you against a bill. If you would not buy it without the tax benefit, the benefit is not a reason.",
                "Check for lock-ins and conditions before you commit money, and keep within the limits: payments above a cap do not reduce your tax."
            ]
        },
        {
            id: "records",
            heading: "6. Records and Claims",
            paragraphs: [
                "Keep the proof for each claim: premium receipts, the rent agreement and rent receipts, the lender's interest certificate, fee receipts and statements. A deduction must be claimed in your return, and a claim without a basis can be reversed.",
                "The deductions cannot, in total, take your income below zero, and they apply to the total in the way the Act describes. The calculator applies the same rules, but it does not replace reading the provision or asking a qualified tax professional about your own case."
            ]
        },
        {
            id: "sources",
            heading: "7. Where These Rules Come From",
            paragraphs: [
                "The slabs, the rebate, the standard deduction, sections 22, 123, 124, 126, 156 and 202 and Schedule XV were read from the Income-tax Act, 2025 as published in the Gazette of India (egazette.gov.in, 2025). The old regime's slabs and the 4% cess come from the Finance Act, 2026 (Gazette of India, 30 March 2026). The HRA rule is rule 279 of the Income-tax Rules, 2026 (G.S.R. 198(E), 20 March 2026, on the Income Tax Department's e-filing portal). That the Act applies from 1 April 2026 is from the Press Information Bureau's release of 1 April 2026.",
                "Rules change every year. Check the current figures on the Income Tax Department's site before you file."
            ]
        }
    ],

    example: {
        heading: "Example: The Same Salary, Two Regimes",
        paragraphs: [
            "A salary of ₹15,00,000 pays about ₹97,500 under the new regime and ₹1,87,200 under the old regime with ₹2,25,000 of deductions. The old regime would need much larger deductions to come out lower; the calculator's break-even shows how much for your salary.",
            "A salary of ₹20,00,000 with ₹3,00,000 of HRA exemption, ₹2,50,000 of other deductions and ₹2,00,000 of home loan interest pays about ₹1,92,400 under the new regime and ₹1,79,400 under the old. Use the calculator with your own numbers: the answer is yours, not these."
        ]
    },

    biggerPicture: {
        heading: "The Bigger Picture",
        text:
            "Legal tax saving is two things: choosing the regime that gives the lower bill, and claiming the deductions you have genuinely earned. Neither is a reason to spend, and neither replaces a financial plan."
    },

    considerations: [
        "Compare both regimes with your own numbers every year, because the rules and your deductions change.",
        "Do not buy a product only for the tax benefit.",
        "Keep within each limit and keep the proof.",
        "This guide covers a resident individual under 60 with salary income. Business income, capital gains, seniors and other cases work differently.",
        "This is information, not tax advice. For your own case, check the Act or ask a qualified tax professional."
    ],

    faq: [
        {
            question: "Is section 80C gone?",
            answer: "In the Income-tax Act, 2025 the same idea is in section 123 and Schedule XV, with the same limit of ₹1,50,000. The older Act's numbering no longer applies from 1 April 2026."
        },
        {
            question: "Can I claim section 123 in the new regime?",
            answer: "No. The new regime does not allow it. It allows the standard deduction of ₹75,000 and an employer's NPS contribution."
        },
        {
            question: "How much tax will I save by investing ₹1,50,000?",
            answer: "At most your tax rate times that amount, plus the cess on it. In the 30% slab that is ₹46,800. In a lower slab it is less, and in the new regime it is nothing, because the deduction is not allowed."
        },
        {
            question: "Which regime is better?",
            answer: "Neither always. It depends on your income and on how much you can deduct. Enter your numbers in the Old vs New Tax Regime Calculator to see both."
        },
        {
            question: "How were the figures calculated?",
            answer: "With the Old vs New Tax Regime Calculator, which uses the slabs and limits above, and by hand. Rounding follows section 516: the total income and the final amount are rounded to the nearest ten rupees."
        }
    ]

};

export default article;
