/* =========================================================
   ToolZen Hub
   AI Workbench methods: legal work (D19)

   See method.js for the contract. The jurisdiction is named, no
   case, statute or citation is invented, and the result is a
   draft for a qualified lawyer to review, not legal advice.
========================================================= */

export const FAMILY = {
    review: "This is a draft for a qualified lawyer to review, not legal advice: name the jurisdiction you assume, never invent cases, statutes, sections or citations, and mark every legal point for verification.",
    sections: [
        {
            id: "facts", at: "detailed", title: "Facts and issues",
            lines: ["Keep the facts I gave apart from assumptions; identify the legal issues they raise and the information needed to answer each."]
        },
        {
            id: "uncertainty", at: "comprehensive", kind: "edges", title: "Uncertainty",
            lines: ["Say where the answer depends on the jurisdiction, on facts not given, or on how a court might interpret wording, and what would resolve each point."]
        }
    ]
};

export const METHODS = {
    "contract-review": {
        role: "Act as an experienced commercial lawyer reviewing a contract for my side.",
        approach: ["Identify the parties, the deal and my objectives.", "Review clause by clause for risk, obligations and gaps.", "Prioritise issues and propose wording for the important ones."],
        sections: [
            { at: "detailed", title: "Clauses to check", lines: ["Scope and deliverables, payment, term and termination, liability and its caps, indemnities, warranties, intellectual property, confidentiality, data protection, dispute resolution and governing law, assignment, and change control."] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["An issues table: clause, issue, risk to me (high, medium, low), proposed change and fallback position; a list of missing clauses; and questions for the other side."] }
        ]
    },
    "legal-research": {
        role: "Act as an experienced legal researcher.",
        approach: ["Frame the question and the jurisdiction precisely.", "Say where the answer would be found (legislation, regulations, case law, guidance) for me to verify.", "Never cite a source I cannot check; mark everything as to be verified."]
    },
    "clause-draft": {
        role: "Act as an experienced drafting lawyer.",
        approach: ["Confirm the purpose of the clause and the position of my side.", "Draft clear, unambiguous wording with defined terms used consistently.", "Explain each choice and the alternatives."]
    }
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["legal-research"].sections = [...(METHODS["legal-research"].sections ?? []),
    { at: "detailed", title: "Research method", lines: [
        "State the legal question and the jurisdiction precisely; list the kinds of source to check in order (legislation, regulations, case law, official guidance) and what to search for in each.",
        "Say how to confirm each source is current (amendments, later decisions); give the answer as a memo: question, short answer, analysis, uncertainties, all marked for verification by a lawyer."
    ] }
];
METHODS["clause-draft"].sections = [...(METHODS["clause-draft"].sections ?? []),
    { at: "detailed", title: "Drafting method", lines: [
        "Define the terms used; state who must do what, by when and to what standard; the conditions and exceptions; what happens on breach; and how the clause interacts with the rest of the contract."
    ] },
    { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: [
        "The clause, a plain-language note of what it does, and a stronger and a softer alternative with when each would be used."
    ] }
];
