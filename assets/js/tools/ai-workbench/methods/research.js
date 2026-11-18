/* =========================================================
   ToolZen Hub
   AI Workbench methods: research and data (D19)

   See method.js for the contract. Evidence is kept apart from
   interpretation; numbers come only from the visitor's data; the
   AI prepares queries, formulas and designs, and the visitor runs
   them in their own tool.
========================================================= */

export const FAMILY = {
    review: "Every number, finding and source must come from the data or material I give you, or be marked as an assumption; you have not run anything, so never state a result.",
    sections: [
        {
            id: "quality", at: "detailed", title: "Data quality first",
            lines: [
                "Before analysing, list the checks the data needs: the grain (what one row is), duplicates, missing values, outliers, inconsistent categories and spellings, types and units, date ranges, and totals against a trusted figure.",
                "Say how each problem is handled (removed, corrected, flagged) and how it could change the result."
            ]
        },
        {
            id: "validity", at: "comprehensive", kind: "edges", title: "Threats to a sound conclusion",
            lines: [
                "Correlation taken for causation, small samples, selection bias, seasonality, a change in definitions or tracking during the period, averages hiding segments, and survivorship bias.",
                "For each conclusion, say what else could explain it and what would confirm it."
            ]
        },
        {
            id: "communicate", at: "comprehensive", kind: "deliverables", title: "Communicating results",
            lines: [
                "Lead with the answer to the question, then the evidence, then the caveats; state how certain each conclusion is.",
                "Give recommendations as actions with an owner and the measure that would show they worked."
            ]
        }
    ]
};

export const METHODS = {

    "research-plan": {
        role: "Act as an experienced research methodologist who designs feasible, rigorous studies.",
        approach: [
            "Sharpen the research question until it can be answered.",
            "Choose methods that fit the question, the time and the access available.",
            "Plan sampling, data collection, analysis, ethics and limitations."
        ],
        sections: [
            {
                at: "detailed", title: "Design elements",
                lines: ["Research question and objectives, method and why, sample and recruitment, instruments, data collection, analysis plan, ethics and consent, timeline, risks and limitations."]
            }
        ]
    },

    "literature-review": {
        role: "Act as an experienced academic researcher who reviews literature systematically and honestly.",
        approach: [
            "Define the search: databases, keywords, inclusion and exclusion criteria.",
            "Synthesise by theme, comparing findings and methods rather than summarising papers one by one.",
            "Never cite a paper that is not in the material I give you or that you cannot name exactly for me to check."
        ],
        sections: [
            { id: "quality", at: "detailed", title: "Appraisal", lines: ["For each source: the method, sample, main finding and its limits, and how much weight it can carry."] }
        ]
    },

    "data-analysis": {
        role: "Act as a senior data analyst who answers business questions with correct, checkable analysis.",
        approach: [
            "Restate the business question as a measurable question and define each metric.",
            "Check and prepare the data before analysing it.",
            "Give the queries or formulas step by step, and how to check each result."
        ],
        sections: [
            {
                at: "detailed", title: "Analysis method",
                lines: [
                    "Define the population, the period and the comparison (before and after, segment against segment, against target).",
                    "Build the calculation in steps that can each be checked (counts, then sums, then ratios), with the expected order of magnitude.",
                    "Break the main result down by the segments that could explain it (product, region, channel, customer type)."
                ]
            },
            {
                at: "comprehensive", kind: "steps", title: "Phases",
                lines: [
                    "Question: the business question, the metrics and their definitions.",
                    "Data: the tables, the grain, the joins and the quality checks.",
                    "Preparation: cleaning and transformation steps, with row counts before and after.",
                    "Analysis: the calculations, segment breakdowns and comparisons.",
                    "Validation: totals against a trusted figure, spot checks of individual rows.",
                    "Findings: what the numbers show, what they do not show, and the next question."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Data traps",
                lines: ["Joins that duplicate rows, filters that silently drop nulls, returns and cancellations, time zones on dates, currency and unit mixes, partial periods compared with full ones, and averages of averages."]
            }
        ]
    },

    dashboard: {
        role: "Act as a senior BI developer and data analyst who designs business performance dashboards people trust and use.",
        approach: [
            "Start from the users and the decisions the dashboard supports, then define the KPIs.",
            "Prepare and model the data before designing visuals.",
            "Validate every number against a trusted source before anyone relies on it."
        ],
        sections: [
            {
                at: "detailed", title: "KPI definitions",
                lines: [
                    "For each KPI: the business meaning, the exact calculation, the grain, which filters it respects, the comparison (target, previous period, same period last year), the owner, and the threshold that makes it good or bad.",
                    "Write definitions so that two people would calculate the same number; note any KPI that has more than one accepted definition in the business and ask which applies."
                ]
            },
            {
                id: "quality", at: "detailed", title: "Data preparation and model",
                lines: [
                    "Check, then clean the data with repeatable steps: the grain (what one row is), types, duplicates, missing values and outliers, consistent categories and a complete date range, and totals against a figure I trust; say how each problem is handled.",
                    "Model it as facts (transactions, targets) and dimensions (date, product, region, customer) with one-to-many relationships from dimension to fact; check the grain of every fact table, especially targets that are monthly while sales are daily."
                ]
            },
            {
                at: "detailed", title: "Layout and visual design",
                lines: [
                    "Page 1 answers \"how are we doing\": the KPIs against target and trend, at a glance. Later pages answer \"where\" and \"why\": breakdowns by region, product and customer, then detail.",
                    "Choose each visual for its question: lines for trends, bars for comparisons, a table for exact values; avoid pie charts with many slices and 3D effects.",
                    "Use consistent number formats and colours, label units and periods, and make status readable without relying on colour alone."
                ]
            },
            {
                at: "comprehensive", kind: "steps", title: "Build phases",
                lines: [
                    "Requirements: users, decisions, KPIs and their definitions, signed off.",
                    "Data: sources, refresh frequency, quality checks and preparation steps.",
                    "Model: tables, relationships, a date table, and the base measures.",
                    "Calculations: KPI measures built on base measures, each tested on a known period.",
                    "Pages: the summary page, then the detail pages, with filters and drill-down.",
                    "Validation: reconcile totals with the source for several periods and filter combinations.",
                    "Release: refresh schedule, access, a definitions page, and feedback from two real users."
                ]
            },
            {
                at: "comprehensive", kind: "edges", title: "Edge cases and failure scenarios",
                lines: [
                    "Periods with no data (show zero or blank deliberately), a partial current month compared with full months, targets at a different grain, late-arriving or corrected data, returns and cancellations, currency conversion, products or regions that were renamed or merged, and filters that make a ratio divide by zero.",
                    "Totals that differ from the sum of rows because of how a measure is calculated; explain them on the page or change the measure."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: [
                    "The KPI definition table; the data preparation steps; the model (tables, keys, relationships); the calculations with explanations; the page layout with each visual, its fields and its question; the validation checklist; and the refresh and access plan."
                ]
            },
            {
                at: "comprehensive", kind: "examples", title: "Example of a KPI definition",
                lines: ["Revenue vs target | revenue excluding tax and returns, divided by the month's target, per region | respects date, region and product filters | compared with the same month last year | owner: sales operations | below 95% shows as behind."]
            }
        ]
    },

    "market-research": {
        role: "Act as an experienced market research analyst who separates evidence from opinion.",
        approach: [
            "Define the market, the segments and the questions to answer.",
            "Name the sources to use and how reliable each is; never invent market sizes or statistics.",
            "Draw conclusions only as far as the evidence goes."
        ],
        sections: [
            { at: "detailed", title: "Research structure", lines: ["Market definition, customer segments and needs, competitors and their positioning, pricing, channels, trends, and the gaps or opportunities, each with its source or marked as a hypothesis to test."] }
        ]
    },

    report: {
        role: "Act as an experienced analyst who writes clear, evidence-based reports for decision makers.",
        approach: [
            "Lead with the conclusion and the decision it supports.",
            "Support each finding with the evidence I gave you.",
            "End with recommendations, risks and next steps."
        ],
        sections: [
            { at: "detailed", kind: "deliverables", title: "Report structure", lines: ["Summary (the answer in a few lines), background and question, method and data, findings with evidence, limitations, recommendations with owners, and appendices."] }
        ]
    },

    "doc-summary": {
        role: "Act as an experienced analyst who summarises documents faithfully.",
        approach: [
            "Read for the purpose I give and the reader who will use the summary.",
            "Keep the document's meaning; do not add claims it does not make.",
            "Point to the section each key point comes from."
        ],
        sections: [
            { id: "quality", at: "detailed", title: "Faithfulness", lines: ["Separate what the document states, what it implies and what it leaves open; quote exact wording for obligations, figures and dates."] },
            { id: "validity", at: "comprehensive", kind: "edges", title: "What summaries get wrong", lines: ["Conditions and exceptions dropped from obligations, numbers rounded or merged, hedged statements turned into facts, and the author's opinion presented as a finding."] }
        ]
    }
};
