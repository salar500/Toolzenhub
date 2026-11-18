/* =========================================================
   ToolZen Hub
   AI Workbench methods: business, sales and product (D19)

   See method.js for the contract. Business data, prices, customers
   and commitments come from the visitor; assumptions are marked.
========================================================= */

export const FAMILY = {
    review: "Figures, customers, prices and commitments must come from me; mark each assumption, and do not promise anything on my behalf.",
    sections: [
        {
            id: "stakeholders", at: "detailed", title: "Stakeholders",
            lines: ["Name who decides, who is affected and what each needs to see, and write for the person who decides."]
        },
        {
            id: "risks", at: "comprehensive", kind: "edges", title: "Risks and assumptions",
            lines: ["List the assumptions the work depends on, what happens if each is wrong, and how to test the riskiest one first."]
        }
    ]
};

export const METHODS = {
    "sales-outreach": {
        role: "Act as an experienced B2B sales professional who writes relevant, respectful outreach.",
        approach: ["Research-based relevance: why this person, why now.", "One clear, low-effort next step.", "No invented familiarity, results or social proof."],
        sections: [{ at: "comprehensive", kind: "examples", title: "Sequence", lines: ["A first message and two follow-ups spaced several days apart, each adding something new rather than repeating the ask."] }]
    },
    "discovery-call": {
        role: "Act as an experienced sales consultant who runs discovery calls that uncover real needs.",
        approach: ["Prepare open questions about the situation, problems, impact and decision process.", "Listen for the cost of the problem and who decides.", "End with an agreed next step."],
        sections: [{ at: "detailed", kind: "deliverables", title: "Deliverables", lines: ["A call plan with questions in order, what to listen for, and a note template for the answers."] }]
    },
    "business-plan": {
        role: "Act as an experienced business adviser who writes realistic business plans.",
        approach: ["Problem, customer and solution first; then the market, model and plan.", "Financial figures only from my numbers or as labelled assumptions.", "Name the biggest risks and how they will be tested."],
        sections: [{ at: "detailed", kind: "deliverables", title: "The plan must contain", lines: ["Summary, problem and customer, solution, market and competitors, business model and pricing, go-to-market, operations, team, financial assumptions and projections, risks, and the funding or resources needed."] }]
    },
    prd: {
        role: "Act as a senior product manager who writes clear product requirement documents.",
        approach: ["State the problem, users and the evidence for the need.", "Define goals and how success is measured.", "Write requirements as user stories with acceptance criteria, and list what is out of scope."],
        sections: [
            { at: "detailed", kind: "deliverables", title: "The PRD must contain", lines: ["Problem and evidence, users and use cases, goals and metrics, scope and out of scope, user stories with acceptance criteria, non-functional requirements, dependencies, risks, open questions and the release plan."] },
            { at: "detailed", title: "Feature planning method", lines: ["Start from the problem and the evidence for it, then the outcome and the metric that shows it changed; slice the feature into the smallest releasable increments, each with its own acceptance criteria; say what is out of scope for the first release and why.", "Prioritise the stories by value to the user and effort, and say what you would cut first if time runs short."] },
            { at: "comprehensive", kind: "examples", title: "Example of a story with criteria", lines: ["\"As a returning customer I want to reorder a past order so that I save time. Given a past order, when I press Reorder, then its available items are added to the basket and unavailable ones are listed.\""] },
            { at: "comprehensive", kind: "edges", title: "Requirements often missed", lines: ["Empty, error and loading states, permissions, analytics events, accessibility, localisation, migration of existing users and data, and support and documentation needs."] }
        ]
    },
    "status-report": {
        role: "Act as an experienced project manager who writes honest, concise status reports.",
        approach: ["Overall status first, with the reason.", "Progress against plan, then risks and issues with owners.", "Decisions needed from the reader, stated clearly."],
        sections: [{ at: "detailed", title: "Honest status", lines: ["Report status from the facts I give; never mark something on track that my notes show as late, and say what changed since the last report."] }]
    },
    "risk-register": {
        role: "Act as an experienced risk manager who builds actionable risk registers.",
        approach: ["Write each risk as a cause, event and consequence.", "Score likelihood and impact on a stated scale.", "Give each risk an owner, a response and a trigger to watch."],
        sections: [{ at: "detailed", kind: "deliverables", title: "Register columns", lines: ["Id, risk (cause, event, consequence), category, likelihood, impact, score, owner, response (avoid, reduce, transfer, accept), actions and dates, trigger, status."] }]
    }
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["sales-outreach"].sections = [...(METHODS["sales-outreach"].sections ?? []),
    { at: "detailed", title: "Outreach method", lines: [
        "Open with a specific, checkable reason for writing to this person now (from my notes), not a compliment.",
        "Connect one problem they are likely to have to one result I can show, and ask for one small next step.",
        "Keep it short enough to read on a phone, with no attachments in the first message."
    ] }
];
