/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: sales, small business, project and
   product management (AI programme D18)

   Outreach and a discovery call, a business plan, a product
   requirements document, a status report and a risk register.
   Nothing about a prospect, market or project is assumed: what
   the visitor has not given is asked for or marked as an
   assumption.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "assistants" }, { id: "writing" }];

export const BLUEPRINTS = {

    "sales-outreach": {
        deliverable: "a sales outreach sequence",
        categories: CATS,
        depth: "standard",
        questions: [
            area("offer", "What you sell and the problem it solves", { essential: true, rows: 2, placeholder: "Payroll software that cuts monthly payroll time for 20-200 person firms" }),
            area("prospect", "Who you are writing to", { essential: true, rows: 2, hint: "Role, company type, and anything you know from their public profile. Nothing is invented about them.", placeholder: "HR managers at manufacturing firms in Pune; one posted about manual payroll errors" }),
            choose("channel", "Channel", ["Email", "LinkedIn messages", "Email and LinkedIn", "Phone and email"], { essential: true }),
            text("steps", "Number of touches and spacing", { placeholder: "4 touches over 2 weeks" }),
            text("ask", "What you want them to do", { placeholder: "Book a 20-minute call" }),
            more(text("proof", "Proof you can use (results, customers you may name)"))
        ],
        brief: (a) => ({
            goal: `Write a ${a.channel || "multi-channel"} outreach sequence selling: ${a.offer}`,
            context: [["Prospects", a.prospect], ["Touches", a.steps], ["The ask", a.ask], ["Proof I may use", a.proof]],
            requirements: [
                "Open each message with the prospect's likely problem, not with the product.",
                "One clear ask per message; each later touch adds something new (a fact, an example, a question), never just 'following up'.",
                "Personalise only from the details I gave; mark where I should add something specific with [personal detail].",
                "Keep emails under 120 words and LinkedIn messages within the platform's length limits."
            ],
            format: ["For each touch: day, channel, subject line (email), message."],
            avoid: ["Invented facts about the prospect or their company.", "False urgency, exaggerated claims or customers I did not name."]
        }),
        stages: [{ at: "standard", name: "Sequence", objective: "Get the messages.", submit: "The main prompt.", ask: () => "Write the sequence as specified, then give two alternative subject lines for the first email.", expect: "The full sequence.", done: "Each touch adds something new." }],
        refine: ["style", "clarity"],
        quality: ["Nothing in a message is claimed about the prospect that you cannot back up.", "Messages respect the anti-spam and data protection rules that apply to you (consent, opt-out)."],
        prepare: { required: ["What you sell and who you are writing to."], optional: ["Results you are allowed to quote."] },
        next: ["Send to a small batch first and compare replies before scaling.", "Prepare the call with the task \"Prepare a sales discovery call\"."]
    },

    "discovery-call": {
        deliverable: "a discovery call plan",
        categories: CATS,
        depth: "standard",
        questions: [
            area("prospect", "The prospect and what you know about them", { essential: true, rows: 3, hint: "From your CRM notes or their public information.", placeholder: "Head of operations, logistics firm, 400 staff; downloaded our route-planning guide" }),
            area("offer", "What you sell", { essential: true, rows: 2 }),
            text("length", "Call length", { placeholder: "30 minutes" }),
            text("method", "Qualification method your team uses, if any", { hint: "For example BANT or MEDDICC; leave empty if none.", placeholder: "MEDDICC" })
        ],
        brief: (a) => ({
            goal: "Prepare me for a sales discovery call.",
            context: [["Prospect", a.prospect], ["What I sell", a.offer], ["Call length", a.length], ["Qualification method", a.method]],
            requirements: [
                "Give an agenda that fits the time, with most of it for the prospect to talk.",
                "Write open questions about their situation, problem, impact, decision process and timing, in a natural order.",
                a.method ? `Map the questions to ${a.method} so I can see what is still unknown after the call.` : "Group the questions by what they help me learn.",
                "List likely objections with a short, honest response to each.",
                "End with how to agree a concrete next step."
            ],
            format: ["Agenda, questions, objections, next-step close, and a notes template for my CRM."],
            avoid: ["Assumptions about their budget or problems presented as facts."]
        }),
        stages: [],
        refine: ["completeness", "clarity"],
        quality: ["The questions are open and about the prospect, not the product."],
        prepare: { required: ["Your CRM notes on the prospect."], optional: [] },
        next: ["After the call, record the answers in your CRM against the same headings."]
    },

    "business-plan": {
        deliverable: "a business plan",
        categories: CATS,
        depth: "multi",
        noFabrication: true,
        questions: [
            area("idea", "The business", { essential: true, rows: 3, placeholder: "A cloud kitchen for healthy office lunches in Bengaluru" }),
            text("purpose", "What the plan is for", { essential: true, placeholder: "A bank loan application" }),
            area("numbers", "Numbers you already have", { rows: 3, hint: "Costs, prices, sales so far. Projections are built only from these and labelled as assumptions.", placeholder: "Rent ₹60,000/month; meal price ₹180; 40 orders/day in the trial" }),
            text("market", "Location and customers", { placeholder: "Office workers in two tech parks" }),
            more(area("team", "Team and experience", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Help me write a business plan for: ${a.idea}`,
            context: [["Purpose", a.purpose], ["Numbers I have", a.numbers], ["Market", a.market], ["Team", a.team]],
            requirements: [
                "Cover: summary, problem and solution, customers and market, competition, business model and pricing, marketing and sales, operations, team, financial projections, risks, and what the money is for.",
                "Build projections only from my numbers; show every assumption with its source (mine, or 'to be checked') and a lower and higher case.",
                "Where market size or competitor facts are needed, tell me what to look up and where, instead of stating figures."
            ],
            format: ["Headed sections; projections as a monthly table for year one and yearly for years two and three."],
            avoid: ["Invented market sizes, growth rates or competitor figures."]
        }),
        stages: [
            { at: "standard", name: "Outline and gaps", objective: "Find what is missing first.", submit: "The main prompt.", ask: () => "Give the outline and list the information you need from me for each section. Wait for my answers.", expect: "Outline and questions.", done: "You have answered or marked each gap." },
            { at: "standard", name: "Draft", objective: "Write the plan.", submit: "Your answers.", ask: () => "Write the plan section by section as specified.", expect: "The full plan.", done: "Every section is present." },
            { at: "multi", name: "Numbers check", objective: "Check the projections.", submit: "Nothing new.", ask: () => "Check the projections: list every assumption, recompute the totals, and show the lower and higher case side by side.", expect: "An assumptions list and checked tables.", done: "The totals add up and each assumption is visible." }
        ],
        refine: ["evidence", "completeness", "consistency"],
        quality: ["Every number traces to your input or a labelled assumption.", "An accountant or adviser has reviewed the financials before you submit them."],
        prepare: { required: ["Your costs, prices and any sales so far."], optional: ["Quotes from suppliers, rent agreements."] },
        next: ["Check the financial tables in a spreadsheet.", "Use the Prompt Builder task \"A presentation or proposal\" for the pitch."]
    },

    prd: {
        deliverable: "a product requirements document",
        categories: [{ id: "assistants" }, { id: "writing" }, { id: "coding" }],
        depth: "detailed",
        questions: [
            area("feature", "The feature or product", { essential: true, rows: 3, placeholder: "Saved carts so signed-in shoppers can come back to a cart on another device" }),
            area("problem", "The problem and the evidence for it", { essential: true, rows: 3, hint: "Research, support tickets, analytics. The PRD uses only this.", placeholder: "12% of support tickets ask for lost carts; 30% of mobile carts are abandoned" }),
            text("users", "Users affected", { placeholder: "Signed-in shoppers on web and app" }),
            text("metric", "How success is measured", { placeholder: "Cart recovery rate, conversion of returning users" }),
            more(area("constraints", "Constraints and out of scope", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Write a product requirements document for: ${a.feature}`,
            context: [["Problem and evidence", a.problem], ["Users", a.users], ["Success metric", a.metric], ["Constraints and out of scope", a.constraints]],
            requirements: [
                "Sections: problem, goals and non-goals, users and use cases, user stories with acceptance criteria, functional requirements, non-functional requirements (performance, security, accessibility, privacy), analytics, dependencies, open questions, release plan.",
                "Write acceptance criteria that a tester can check (Given / When / Then where it helps).",
                "Number every requirement so design, engineering and QA can refer to it.",
                "Keep solution detail out unless it is a real constraint."
            ],
            format: ["Headed sections; requirements as numbered lists; open questions at the end."],
            avoid: ["Requirements without a reason linked to the problem."]
        }),
        stages: [
            { at: "standard", name: "Problem and scope", objective: "Agree goals and non-goals first.", submit: "The main prompt.", ask: () => "Write the problem, goals, non-goals and users only, plus the questions you have. Wait for my review.", expect: "The first sections and questions.", done: "Goals and non-goals are agreed." },
            { at: "standard", name: "Full PRD", objective: "Get the document.", submit: "Your answers.", ask: () => "Write the full PRD as specified.", expect: "The PRD.", done: "Every requirement has acceptance criteria." }
        ],
        refine: ["completeness", "consistency", "missing"],
        quality: ["Each requirement links to the problem.", "QA could write test cases from the acceptance criteria alone."],
        prepare: { required: ["The evidence for the problem."], optional: ["Designs or prototypes.", "Analytics definitions."] },
        next: ["Review the PRD with design, engineering and QA.", "Turn the stories into work items in your tracker."]
    },

    "status-report": {
        deliverable: "a project status report",
        categories: CATS,
        depth: "short",
        noFabrication: true,
        questions: [
            text("project", "Project and reporting period", { essential: true, placeholder: "Website relaunch, week 12" }),
            area("progress", "What happened: done, in progress, slipped", { essential: true, rows: 5, hint: "Paste your notes or a tracker export; the report uses only this.", placeholder: "Done: checkout redesign. In progress: payment testing (60%). Slipped: content migration by 1 week" }),
            area("risks", "Risks, issues and decisions needed", { rows: 3 }),
            choose("audience", "Audience", ["Executives (one page)", "Project team (detailed)", "Client"], { essential: true })
        ],
        brief: (a) => ({
            goal: `Write the status report for ${a.project}.`,
            context: [["Progress notes", a.progress], ["Risks, issues, decisions", a.risks], ["Audience", a.audience]],
            requirements: [
                "Start with an overall status (on track, at risk, off track) and the reason in one sentence.",
                "Then: achievements, next period's plan, schedule and budget against the plan, risks and issues with owners, decisions needed with a deadline.",
                "Use only my notes; mark anything you need but do not have as [to confirm].",
                "Match the length and detail to the audience."
            ],
            format: ["Headed sections; risks and decisions as a table with owner and date."],
            avoid: ["Softening a slipped date or hiding a risk."]
        }),
        stages: [],
        refine: ["clarity", "structure"],
        quality: ["The overall status matches the facts in the report.", "Every decision needed has an owner and a date."],
        prepare: { required: ["Your progress notes or tracker export for the period."], optional: [] },
        next: ["Keep the same structure every period so changes are easy to see."]
    },

    /* the former Meeting Notes to Action Plan, as a prompt (D22): the AI sorts the notes, nothing is invented */
    "meeting-follow-up": {
        deliverable: "a meeting follow-up: decisions, actions and a message",
        categories: CATS,
        depth: "short",
        noFabrication: true,
        questions: [
            area("notes", "Your meeting notes", { essential: true, long: true, rows: 8, hint: "Rough notes are fine, one point per line works best. Remove anything confidential first.", placeholder: "Launch moves to 3 March, agreed\nPriya to update the pricing page by Friday\nRahul: check the payment provider's limits\nOpen: do we need a Hindi version at launch?" }),
            text("meeting", "The meeting", { hint: "What it was, and its date as you want it written.", placeholder: "Launch planning, 11 November" }),
            text("people", "Who was there", { placeholder: "Priya, Rahul, Meera, Arjun" }),
            choose("need", "What you need", ["The action plan and a follow-up message", "The action plan only", "The follow-up message only"], { essential: true }),
            more(choose("tone", "Tone of the message", ["Plain and friendly", "Formal", "Short and direct"]))
        ],
        brief: (a) => ({
            goal: `Turn my notes from ${a.meeting || "a meeting"} into ${/only/.test(a.need) && /message/.test(a.need) ? "a follow-up message to the attendees" : /plan only/.test(a.need) ? "an action plan" : "an action plan and a follow-up message to the attendees"}.`,
            context: [["Meeting", a.meeting], ["Attendees", a.people], ["What I need", a.need], ["Notes", a.notes], ["Tone of the message", a.tone]],
            requirements: [
                "Sort the notes into decisions, actions, open questions and risks, using only what the notes say.",
                "Give each action its owner and due date exactly as the notes state them; where either is missing, write [owner?] or [date?] and list those actions separately so I can fill them in. Never assign an owner or a date yourself.",
                "Keep names, figures and dates exactly as written; do not merge two actions into one or split one into two.",
                /message/.test(a.need) || !a.need ? "Write the follow-up message for the attendees: the decisions, the actions with owners and dates, the open questions, and the next meeting if the notes name one." : "",
                "Mark anything in the notes you could not interpret, instead of guessing what it meant."
            ],
            format: ["Decisions as a list; actions as a table with action, owner, due date; then open questions and risks.", /message/.test(a.need) || !a.need ? "Then the message, ready to send." : ""],
            avoid: ["Actions, owners, dates or decisions that are not in the notes."]
        }),
        stages: [],
        refine: ["completeness", "clarity"],
        quality: ["Every action in the notes is in the plan, and none was added.", "Missing owners and dates are marked, not filled in.", "The message says nothing the notes do not."],
        prepare: { required: ["Your notes from the meeting."], optional: ["The attendee list.", "The previous meeting's actions, to see what carried over."] },
        next: ["Fill in every [owner?] and [date?] before sending.", "Send the message the same day.", "Check the actions at the start of the next meeting."]
    },

    "risk-register": {
        deliverable: "a project risk register",
        categories: CATS,
        depth: "standard",
        questions: [
            area("project", "The project: goal, scope and timeline", { essential: true, rows: 3 }),
            area("known", "Risks and issues you already see", { rows: 3 }),
            text("scale", "How you rate risks", { hint: "For example 1-5 likelihood × 1-5 impact. Leave empty to use that.", placeholder: "1-5 × 1-5" })
        ],
        brief: (a) => ({
            goal: "Build a risk register for this project.",
            context: [["Project", a.project], ["Known risks", a.known], ["Rating scale", a.scale || "likelihood 1-5 × impact 1-5"]],
            requirements: [
                "Identify risks across scope, schedule, cost, resources, technology, suppliers, compliance and stakeholders, specific to this project.",
                "Write each risk as cause, event and effect.",
                "For each: likelihood, impact, score, response (avoid, reduce, transfer, accept), owner role, trigger to watch and review date.",
                "Keep risks (uncertain) apart from issues (already happening)."
            ],
            format: ["A table sorted by score, then the top five with a short note on each."],
            avoid: ["Generic risks that would fit any project."]
        }),
        stages: [],
        refine: ["completeness", "missing"],
        quality: ["Each risk is specific to this project and has an owner and a trigger."],
        prepare: { required: ["Project scope and timeline."], optional: ["Past project lessons."] },
        next: ["Review the register at every status meeting and update the scores."]
    }

};
