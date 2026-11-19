/* =========================================================
   ToolZen Hub
   AI Prompt Builder methods: digital marketing (D19)

   See method.js for the contract. Search volumes, rankings,
   traffic and conversion figures come only from the visitor's
   exports; nothing is estimated as if it were data.
========================================================= */

export const FAMILY = {
    review: "Search volumes, rankings, traffic, costs and conversion rates must come from the exports I give you; never estimate them as if they were data.",
    sections: [
        {
            id: "objectives", at: "detailed", title: "Objectives and measurement",
            lines: ["Tie the work to a business objective, define the metric that shows progress and the baseline from my data, and say how and where it will be measured."]
        },
        {
            id: "prioritise", at: "comprehensive", title: "Prioritisation",
            lines: ["Rank recommendations by expected impact, effort and confidence, and say which to do first and what result to expect to see, and when."]
        }
    ]
};

export const METHODS = {
    "seo-audit": {
        role: "Act as a senior SEO specialist who audits sites methodically and prioritises fixes by impact.",
        approach: [
            "Audit in layers: crawling and indexing, technical health, on-page content, internal links, and search performance.",
            "Base every finding on the data or pages I share, with the evidence for it.",
            "Prioritise fixes by impact and effort."
        ],
        sections: [
            {
                at: "detailed", title: "Audit areas",
                lines: [
                    "Indexing: pages indexed or excluded and why, robots rules, canonicals, sitemaps, redirects and broken links.",
                    "Technical: page experience and speed, mobile usability, structured data validity, HTTPS and duplicate URLs.",
                    "Content: search intent match, titles and descriptions, headings, thin or duplicate content, and freshness.",
                    "Performance: queries and pages by clicks, impressions, CTR and position; pages losing clicks; queries with high impressions and low CTR."
                ]
            },
            {
                at: "comprehensive", kind: "deliverables", title: "Deliverables",
                lines: ["A findings table: issue, evidence, affected pages, impact, effort, fix; a prioritised action plan; and the metrics to watch after each fix."]
            }
        ]
    },
    "keyword-research": {
        role: "Act as an experienced SEO and content strategist doing keyword research.",
        approach: [
            "Start from the audience's problems and the business's offer.",
            "Group keywords by intent and topic, using volumes only from my tool exports.",
            "Map each group to an existing or new page."
        ],
        sections: [
            { at: "detailed", kind: "deliverables", title: "Deliverables", lines: ["Keyword groups with intent (informational, commercial, transactional, navigational), the page each maps to, and the priority, with volumes and difficulty only where my data gives them."] }
        ]
    },
    "campaign-plan": {
        role: "Act as a senior digital marketing manager who plans measurable campaigns.",
        approach: [
            "Define the objective, audience, offer and budget first.",
            "Choose channels for where the audience is and what the objective needs.",
            "Plan creative, timing, tracking and the tests to run."
        ],
        sections: [
            {
                at: "detailed", kind: "deliverables", title: "The plan must contain",
                lines: ["Objective and KPIs with targets, audience segments, the message and offer, channel plan with budget split, creative needs, timeline, tracking (UTM parameters, conversion events), the tests to run, and the review dates."]
            },
            {
                at: "comprehensive", kind: "edges", title: "What often goes wrong",
                lines: ["Tracking not tested before launch, audiences overlapping across campaigns, landing pages that do not match the ad, budgets spent before learning, and claims that advertising rules restrict."]
            }
        ]
    }
};
