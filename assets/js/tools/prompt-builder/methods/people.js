/* =========================================================
   ToolZen Hub
   AI Prompt Builder methods: hiring, people and customer support (D19)

   See method.js for the contract. Employment and support work
   follows the visitor's own policies; nothing discriminatory, and
   people make the decisions.
========================================================= */

export const FAMILIES = {
    people: {
        review: "Decisions about people are made by people: keep criteria job-related, exclude anything touching a protected characteristic, and mark legal points for HR or legal review where you work."
    }
};

const job = (role, approach, sections = []) => ({ role, approach, sections });

const FAIRNESS = { at: "detailed", title: "Fairness", lines: ["Use inclusive, plain language; no requirements that are not needed for the job; the same criteria for every candidate or employee."] };
const SUPPORT = { at: "detailed", title: "Support standards", lines: ["Offer only what the policy or my notes allow; never promise refunds, dates or fixes I have not confirmed, and say what the customer can expect next and when."] };

export const METHODS = {
    "job-description": job("Act as an experienced recruiter who writes accurate, inclusive job descriptions.", [
        "Describe the purpose of the role and its main outcomes.",
        "Separate essential requirements from preferred ones, and keep only what the job needs.",
        "State pay, location and working pattern where I give them."
    ], [FAIRNESS, { at: "comprehensive", kind: "deliverables", title: "The description must contain", lines: ["The role's purpose, the main responsibilities and outcomes, essential and preferred requirements kept apart, what the organisation offers, pay and working pattern where given, how to apply and the adjustments available in the process."] }]),
    "hiring-interview": job("Act as an experienced hiring manager who designs structured, fair interviews.", [
        "Derive the competencies from the job.",
        "Ask every candidate the same questions, with a scoring guide for each.",
        "Score against the guide, not impressions."
    ], [FAIRNESS, { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["Questions per competency, what a strong, adequate and weak answer shows, a scoring sheet, and notes guidance for interviewers."] }]),
    "onboarding-plan": job("Act as an experienced people manager who designs onboarding that makes new starters productive.", [
        "Plan the first day, week, month and three months.",
        "Combine access and admin, people to meet, learning, and a first meaningful task.",
        "Set check-ins and what success looks like at each."
    ]),
    "hr-policy": job("Act as an experienced HR professional drafting a clear policy.", [
        "State the purpose, scope and who it applies to.",
        "Write rules, responsibilities and the process in plain language.",
        "Mark every legal requirement for checking against the law where you operate."
    ]),
    "support-reply": job("Act as an experienced customer support specialist who writes clear, empathetic replies.", [
        "Acknowledge the issue in the customer's terms.",
        "Give the answer or the next step, clearly and briefly.",
        "Set expectations and close with how to get further help."
    ], [SUPPORT, { at: "comprehensive", kind: "edges", title: "Difficult cases", lines: ["An angry or repeated contact, a request outside the policy, a possible security or privacy issue (escalate, do not ask for passwords), a legal threat, and a customer who needs accessibility help."] }, { at: "comprehensive", kind: "examples", title: "Tone example", lines: ["Not \"As per our policy, refunds are not possible\" but \"I understand why you expected a refund. Because the order was opened, I can offer a replacement or store credit instead; which would you prefer?\""] }]),
    "kb-article": job("Act as an experienced support content writer who writes self-service help articles.", [
        "Title the article with the customer's problem or task.",
        "Give numbered steps with the expected result after each.",
        "Add troubleshooting for the common failures."
    ], [SUPPORT]),
    "ticket-analysis": job("Act as an experienced support operations analyst.", [
        "Categorise tickets by theme, cause and product area from the data I give.",
        "Count and trend only from that data.",
        "Recommend fixes to products, documents or processes that would remove the most contacts."
    ])
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["onboarding-plan"].sections = [...(METHODS["onboarding-plan"].sections ?? []),
    { at: "detailed", title: "Onboarding structure", lines: [
        "Day one: access, equipment, welcome, a named buddy and what the week holds.",
        "Week one: the people to meet, the tools to learn, and a first small task that can be finished.",
        "Month one: a first meaningful piece of work and weekly check-ins; three months: goals reviewed against what was agreed."
    ] },
    { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: [
        "A table of every item: when, what, who owns it, and how it is confirmed done; a short welcome message; the check-in questions."
    ] }
];
METHODS["hr-policy"].sections = [...(METHODS["hr-policy"].sections ?? []),
    { at: "detailed", title: "Policy structure", lines: [
        "Purpose, scope (who it applies to), definitions, the policy statements, responsibilities, the procedure step by step, exceptions and how to request one, related policies, and the review date."
    ] },
    { at: "comprehensive", kind: "edges", title: "Cases to cover", lines: [
        "Part-time, remote and contract staff; people on leave; managers who are also the subject of a complaint; and any point where local law may differ from the policy (marked for legal review)."
    ] }
];
METHODS["ticket-analysis"].sections = [...(METHODS["ticket-analysis"].sections ?? []),
    { at: "detailed", title: "Analysis method", lines: [
        "Define the categories first and apply them consistently; count by category, period and product area from the data only.",
        "Look for drivers: a release, a channel, a customer group or a policy change that lines up with a rise.",
        "Rank the fixes by the number of contacts each would remove."
    ] }
];
