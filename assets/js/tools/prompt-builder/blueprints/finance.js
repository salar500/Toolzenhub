/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: finance and accounting (AI programme
   D18)

   A financial analysis, a budget or forecast, a variance analysis
   and a reconciliation check. Every figure comes from the
   visitor's data or a labelled assumption; the AI shows its
   arithmetic, never gives tax or investment advice as certain,
   and the result is reviewed by a qualified person.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "data" }, { id: "assistants" }];
const REVIEW = "A qualified accountant or finance professional reviews the result before it is relied on.";

export const BLUEPRINTS = {

    "financial-analysis": {
        deliverable: "a financial analysis",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            area("question", "What the analysis must answer", { essential: true, rows: 2, placeholder: "Why did gross margin fall from 38% to 33% this year?" }),
            area("data", "The data you will share", { essential: true, rows: 3, hint: "Statements or exports (P&L, balance sheet, cash flow, trial balance), with the period and currency.", placeholder: "Monthly P&L for two years in INR, exported from Tally" }),
            text("standard", "Accounting framework, if relevant", { placeholder: "Ind AS" }),
            more(text("audience", "Who will read it"))
        ],
        brief: (a) => ({
            goal: `Analyse the financial data to answer: ${a.question}`,
            context: [["Data", a.data], ["Framework", a.standard], ["Readers", a.audience]],
            requirements: [
                "Compute ratios and changes from my data only, showing each formula and the inputs used.",
                "Explain the drivers behind the numbers, separating what the data shows from your interpretation.",
                "Flag data that looks inconsistent (totals that do not tie, unusual swings) before drawing conclusions.",
                "List the questions management should answer and the further data that would confirm the explanation."
            ],
            format: ["Summary answer first; then a table of figures and ratios with formulas; then drivers, caveats and questions."],
            avoid: ["Tax, legal or investment advice stated as certain."]
        }),
        stages: [],
        refine: ["accuracy", "evidence"],
        quality: ["Every figure recomputes from the source data.", REVIEW],
        prepare: { required: ["The statements or exports, with period and currency."], optional: ["Budget or prior-year figures."] },
        next: ["Rebuild the key figures in your spreadsheet to confirm them."]
    },

    "budget-forecast": {
        deliverable: "a budget or forecast model",
        categories: CATS,
        depth: "detailed",
        noFabrication: true,
        questions: [
            text("what", "What you are budgeting or forecasting, and the period", { essential: true, placeholder: "Operating budget for FY 2027-28, monthly" }),
            area("base", "Historical figures and known commitments", { essential: true, rows: 4, placeholder: "Last 12 months' P&L; new hires from July; rent rises 8% in April" }),
            area("drivers", "Drivers and assumptions you believe", { rows: 3, placeholder: "Sales grow with marketing spend; churn 2% a month" }),
            choose("tool", "Where you will build it", ["Excel", "Google Sheets", "A planning system", "Not decided"])
        ],
        brief: (a) => ({
            goal: `Help me build ${a.what}.`,
            context: [["History and commitments", a.base], ["Drivers and assumptions", a.drivers], ["Built in", a.tool]],
            requirements: [
                "Design a driver-based model: inputs and assumptions on one sheet, calculations on others, outputs separate.",
                "List every assumption with its source (my data, my belief, or to be checked) and show a base, lower and higher scenario.",
                "Give the structure, the formulas for each line and checks that totals tie.",
                "Point out the assumptions the result is most sensitive to."
            ],
            format: ["Model structure, assumption table, formulas by line, scenario summary."],
            avoid: ["Growth rates or costs not in my data, unless labelled as assumptions to check."]
        }),
        stages: [],
        refine: ["accuracy", "consistency"],
        quality: ["Every assumption is visible and sourced.", REVIEW],
        prepare: { required: ["Historical figures and known commitments."], optional: [] },
        next: ["Compare actuals with the budget each month with \"A budget-versus-actual variance analysis\"."]
    },

    "variance-analysis": {
        deliverable: "a variance analysis",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            area("data", "Budget and actual figures for the period", { essential: true, rows: 4, hint: "Paste or attach both, by line, with the period." }),
            text("threshold", "What counts as material", { placeholder: "Over 5% or ₹50,000" }),
            area("known", "Explanations you already know", { rows: 2 })
        ],
        brief: (a) => ({
            goal: "Analyse the variances between budget and actual.",
            context: [["Figures", a.data], ["Materiality", a.threshold], ["Known explanations", a.known]],
            requirements: [
                "Compute each variance in amount and percentage, marked favourable or adverse, from my figures.",
                "Comment only on material variances; separate price, volume and timing effects where the data allows.",
                "Use my known explanations; where there is none, write the question to ask the budget owner.",
                "Recompute and show the totals."
            ],
            format: ["A table: line, budget, actual, variance, %, favourable or adverse, comment; then a short summary."],
            avoid: ["Explanations presented as fact without evidence."]
        }),
        stages: [],
        refine: ["accuracy", "clarity"],
        quality: ["The variances recompute from the figures.", REVIEW],
        prepare: { required: ["Budget and actual figures by line."], optional: [] },
        next: ["Send the open questions to the budget owners before finalising."]
    },

    reconciliation: {
        deliverable: "a reconciliation check",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            text("accounts", "What is being reconciled", { essential: true, placeholder: "Bank statement to the cash book, March" }),
            area("data", "The two sets of records", { essential: true, rows: 4, hint: "Exports with date, reference, description and amount. Remove account numbers you do not need." }),
            choose("tool", "Where you work", ["Excel", "Google Sheets", "Accounting software", "Not decided"])
        ],
        brief: (a) => ({
            goal: `Help me reconcile: ${a.accounts}`,
            context: [["Records", a.data], ["Working in", a.tool]],
            requirements: [
                "Match items on amount, date and reference; list matched, unmatched in each record, and possible matches with the reason.",
                "Classify differences (timing, missing entry, duplicate, error) and propose the adjusting entries to investigate.",
                "Show the reconciliation statement and that it balances.",
                a.tool === "Excel" || a.tool === "Google Sheets" ? `Give the ${a.tool} formulas (for example XLOOKUP or COUNTIFS) to repeat the matching.` : ""
            ],
            format: ["Reconciliation statement, then tables of unmatched and possible matches."],
            avoid: ["Forcing a balance by plugging a figure."]
        }),
        stages: [],
        refine: ["accuracy", "completeness"],
        quality: ["Every unmatched item is investigated, not adjusted away.", REVIEW],
        prepare: { required: ["Both sets of records for the same period."], optional: [] },
        next: ["Post adjustments only after checking the source documents."]
    }

};
