/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: legal work (AI programme D18)

   A contract review checklist, a legal research memo and a clause
   draft. The jurisdiction is always asked; no case, statute or
   citation may be invented; the output is a working draft for a
   qualified lawyer, never advice to rely on.
========================================================= */

import { text, area, choose } from "./shared.js";

const CATS = [{ id: "assistants" }, { id: "writing" }, { id: "research" }];
const LAWYER = "A qualified lawyer for this jurisdiction reviews the result before anyone relies on it.";
const NO_CASES = "Cases, statutes, sections or citations you cannot quote from what I gave you; if you mention law, say it must be verified in an official source.";

export const BLUEPRINTS = {

    "contract-review": {
        deliverable: "a contract review checklist",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            text("contract", "Type of contract and your side", { essential: true, placeholder: "Software services agreement; we are the customer" }),
            text("jurisdiction", "Governing law and jurisdiction", { essential: true, placeholder: "India, courts of Mumbai" }),
            area("text", "The contract or the clauses to review", { essential: true, rows: 5, hint: "Paste the text, with names and confidential figures replaced if needed." }),
            area("priorities", "What matters most to you", { rows: 2, placeholder: "Liability cap, termination for convenience, data protection" })
        ],
        brief: (a) => ({
            goal: `Review this ${a.contract} from our side and list the issues.`,
            context: [["Governing law", a.jurisdiction], ["Contract text", a.text], ["Priorities", a.priorities]],
            requirements: [
                "Go clause by clause through what I pasted: what it says, the risk to our side, and a suggested change or question.",
                "Check for the usual points for this contract type (term and termination, payment, liability and indemnity, IP, confidentiality, data protection, warranties, dispute resolution) and say which are missing.",
                "Rate each issue high, medium or low, and quote the clause wording you rely on."
            ],
            format: ["A table: clause, what it says, risk, suggested change, priority; then missing clauses."],
            avoid: [NO_CASES, "Telling me the contract is safe to sign."]
        }),
        stages: [],
        refine: ["evidence", "completeness"],
        quality: ["Every issue quotes the clause it is about.", LAWYER],
        prepare: { required: ["The contract text and the governing law."], optional: ["Your company's standard positions."] },
        next: ["Take the checklist to your lawyer or legal team for advice."]
    },

    "legal-research": {
        deliverable: "a legal research memo outline",
        categories: CATS,
        depth: "standard",
        noFabrication: true,
        questions: [
            area("question", "The legal question", { essential: true, rows: 3 }),
            text("jurisdiction", "Jurisdiction", { essential: true, placeholder: "India (central law) and Maharashtra" }),
            area("facts", "The relevant facts", { essential: true, rows: 4 }),
            area("sources", "Sources you have (statutes, judgments, articles)", { rows: 3, hint: "Paste the text or extracts; the memo cites only these." })
        ],
        brief: (a) => ({
            goal: `Help me structure a research memo on: ${a.question}`,
            context: [["Jurisdiction", a.jurisdiction], ["Facts", a.facts], ["Sources I have", a.sources]],
            requirements: [
                "Structure: question presented, short answer (marked provisional), facts, issues, analysis per issue, open points, research still needed.",
                "Base the analysis only on the sources I gave; quote them with the part relied on.",
                "Where further law is needed, say what to search for and in which official database or reporter, without naming cases you cannot verify."
            ],
            format: ["Memo headings; a list of research tasks at the end."],
            avoid: [NO_CASES]
        }),
        stages: [],
        refine: ["evidence", "missing"],
        quality: ["Every authority cited is in the sources you gave, and you have read it.", LAWYER],
        prepare: { required: ["The facts and the jurisdiction."], optional: ["Statutes and judgments you have found."] },
        next: ["Verify every authority in an official database before relying on the memo."]
    },

    "clause-draft": {
        deliverable: "a draft contract clause",
        categories: CATS,
        depth: "short",
        questions: [
            text("clause", "The clause", { essential: true, placeholder: "Limitation of liability" }),
            text("contract", "Contract type, your side and governing law", { essential: true, placeholder: "SaaS subscription; we are the supplier; Indian law" }),
            area("position", "What it must achieve", { essential: true, rows: 3, placeholder: "Cap at 12 months' fees; exclude indirect loss; carve out data breach and IP infringement" }),
            choose("style", "Drafting style", ["Plain English", "Traditional legal style", "Match the existing contract"])
        ],
        brief: (a) => ({
            goal: `Draft a ${a.clause} clause.`,
            context: [["Contract", a.contract], ["Must achieve", a.position], ["Style", a.style]],
            requirements: [
                "Draft the clause to achieve exactly my position, with defined terms used consistently.",
                "Then explain each part in one line and list the points the other side is likely to push back on.",
                "Mark anything that depends on the governing law with [check under governing law]."
            ],
            format: ["The clause; then the explanation; then likely pushback."],
            avoid: [NO_CASES]
        }),
        stages: [],
        refine: ["consistency", "clarity"],
        quality: ["The clause fits the definitions in the rest of the contract.", LAWYER],
        prepare: { required: ["Your position and the governing law."], optional: ["The rest of the contract's definitions."] },
        next: ["Have the clause reviewed by a lawyer before using it."]
    }

};
