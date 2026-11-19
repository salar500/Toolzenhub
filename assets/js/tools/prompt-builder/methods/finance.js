/* =========================================================
   ToolZen Hub
   AI Prompt Builder methods: finance and accounting (D19)

   See method.js for the contract. Every figure comes from the
   visitor's data or is a labelled assumption; results are
   reviewed by a qualified accountant before they are relied on.
========================================================= */

export const FAMILY = {
    review: "Every figure must come from my data or be a labelled assumption; show the calculation, and have results reviewed by a qualified accountant before anyone relies on them.",
    sections: [
        {
            id: "workings", at: "detailed", title: "Show the workings",
            lines: ["Give each calculation step by step with its inputs, so it can be followed and recalculated; state the period, currency, units and whether figures include tax."]
        },
        {
            id: "controls", at: "comprehensive", kind: "edges", title: "Checks and controls",
            lines: ["Totals that tie to the ledger or source, sign conventions, accruals and timing differences, one-off items, currency conversion dates, and accounting policies or standards that apply where you report (to be confirmed by the accountant)."]
        }
    ]
};

export const METHODS = {
    "financial-analysis": {
        role: "Act as a senior financial analyst who produces clear, checkable analysis for decision makers.",
        approach: ["Define the question and the measures that answer it.", "Calculate from my data with the workings shown.", "Explain the drivers, the risks and the decision options."],
        sections: [
            { at: "detailed", title: "Analysis structure", lines: ["Key figures and ratios with their definitions, trends over the periods given, the drivers behind each change, comparisons with budget or prior periods, and scenarios where assumptions are uncertain."] },
            { at: "comprehensive", kind: "steps", title: "Phases", lines: ["Scope: the question, the periods, the entities and the measures.", "Data: the sources, what ties to the ledger, and the adjustments needed.", "Calculation: the figures and ratios with workings.", "Drivers: what explains each material change.", "Scenarios: the effect of the uncertain assumptions.", "Conclusion: the answer, the risks and the decision options, for review by a qualified accountant."] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["A summary for the decision maker, the tables of figures and ratios with definitions, the driver analysis, the scenarios, and a list of assumptions and data limits."] }
        ]
    },
    "budget-forecast": {
        role: "Act as an experienced financial planning analyst.",
        approach: ["List every driver and assumption, each with its source.", "Build the forecast from the drivers.", "Add scenarios for the assumptions that matter most."],
        sections: [
            { at: "detailed", title: "Forecast structure", lines: [
                "State the purpose and period of the forecast, and use the historical figures I gave as the base; never fill a gap with a made-up figure, list it as an assumption to supply.",
                "Build revenue from its drivers (for example volume times price, or customers times average spend) and costs split into fixed and variable, each linked to the driver it moves with.",
                "Turn the profit forecast into a cash forecast: when money actually comes in and goes out, payment terms, and the lowest cash point."
            ] },
            { at: "detailed", title: "Assumptions, scenarios and checks", lines: [
                "Keep an assumptions table: each assumption, its value, its source or reason, and who owns it.",
                "Show a base, a downside and an upside case, and the sensitivity of the result to the two or three assumptions that move it most.",
                "Reconcile the opening figures with the latest actuals, and plan how each month's actuals will be compared with the forecast (variance) and the forecast updated."
            ] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["The forecast table by month, the assumptions table, the scenarios, the cash view, the risks, the limits of the forecast, and the review questions for whoever approves it; for review by a qualified accountant."] },
            { at: "comprehensive", kind: "edges", title: "Forecast risks", lines: ["Seasonality, one-off items, payment timing and cash, price and cost changes, and the sensitivity of the result to each main assumption."] }
        ]
    },
    "variance-analysis": {
        role: "Act as an experienced management accountant explaining variances.",
        approach: ["Calculate each variance against budget or the prior period.", "Separate volume, price and mix effects where the data allows.", "Explain material variances and the actions they suggest."]
    },
    reconciliation: {
        role: "Act as an experienced accountant performing a reconciliation.",
        approach: ["Match items between the two sources on a stated key.", "List and classify every unmatched item.", "Propose adjustments with evidence; never force a balance."],
        sections: [{ at: "detailed", kind: "deliverables", title: "Deliverables", lines: ["The matching rules, matched totals, a list of unmatched items with their likely reason (timing, error, missing entry), proposed adjustments and the remaining difference."] }]
    }
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["variance-analysis"].sections = [...(METHODS["variance-analysis"].sections ?? []),
    { at: "detailed", title: "Variance method", lines: [
        "Calculate each variance in amount and percentage, and set a materiality threshold before explaining any.",
        "Split material variances into volume, price and mix where the data allows, and say whether each is timing (it will reverse) or permanent.",
        "Support each explanation with evidence from my data, and end with the actions it suggests."
    ] }
];
