/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: HR, recruiting and customer support
   (AI programme D18)

   Hiring prompts ask for job-related, consistent and inclusive
   material and leave decisions about people to people; policy
   drafts name the jurisdiction and need review by a qualified
   person. Support replies never promise what policy does not
   allow, and ticket analysis counts only what was exported.
========================================================= */

import { text, area, choose, more, TONES } from "./shared.js";

const CATS = [{ id: "assistants" }, { id: "writing" }];
const FAIR = "Words or criteria that could discriminate on age, gender, religion, caste, disability, marital status or any other protected characteristic, or that are not needed for the job.";

export const BLUEPRINTS = {

    "job-description": {
        deliverable: "a job description",
        categories: CATS,
        depth: "short",
        questions: [
            text("title", "Job title and team", { essential: true, placeholder: "QA Engineer, payments team" }),
            area("work", "What the person will actually do", { essential: true, rows: 4, placeholder: "Plan and run tests for payment features; automate regression with Playwright; work with 6 developers" }),
            area("must", "Must-have skills and experience", { rows: 3 }),
            text("terms", "Location, work pattern and pay range you can publish", { placeholder: "Pune, hybrid 3 days; ₹12-16 lakh" }),
            more(text("about", "About the company, in one or two sentences"))
        ],
        brief: (a) => ({
            goal: `Write a job description for: ${a.title}`,
            context: [["The work", a.work], ["Must-haves", a.must], ["Terms", a.terms], ["About us", a.about]],
            requirements: [
                "Lead with what the person will do and achieve, then must-have and nice-to-have skills, kept separate and short.",
                "Every requirement must be needed for the work described; ask me about any I listed that does not seem to be.",
                "Use plain, inclusive language and say how to request adjustments in the process."
            ],
            format: ["Sections: about the role, what you will do, what you need, nice to have, what we offer, how to apply."],
            avoid: [FAIR, "Inflated experience requirements."]
        }),
        stages: [],
        refine: ["clarity", "style"],
        quality: ["Each requirement is genuinely needed for the work.", "Someone in HR has checked it against your local employment law and policies."],
        prepare: { required: ["What the person will do day to day."], optional: ["The pay range."] },
        next: ["Write the interview plan with \"An interview plan for a hiring panel\"."]
    },

    "hiring-interview": {
        deliverable: "a structured interview plan",
        categories: CATS,
        depth: "standard",
        questions: [
            text("role", "The role", { essential: true, placeholder: "Senior Data Analyst" }),
            area("criteria", "What the role needs: skills and behaviours to assess", { essential: true, rows: 4, hint: "From the job description; every question will map to these.", placeholder: "SQL and data modelling; explaining findings to managers; prioritising requests" }),
            text("format", "Interview format and length", { placeholder: "Two 45-minute rounds, panel of two" }),
            more(text("task", "Work sample or case exercise, if any"))
        ],
        brief: (a) => ({
            goal: `Prepare a structured interview plan for the role: ${a.role}`,
            context: [["Criteria to assess", a.criteria], ["Format", a.format], ["Work sample", a.task]],
            requirements: [
                "Map every question to one criterion; ask every candidate the same core questions.",
                "Use behavioural questions (past situations) and situational questions (what would you do), with follow-up probes.",
                "Give a scoring guide for each criterion: what a weak, acceptable and strong answer contains, on a 1-4 scale.",
                "Include how to explain the process and adjustments to candidates."
            ],
            format: ["A table: criterion, questions, probes, scoring guide; then the running order with timings."],
            avoid: [FAIR, "Questions about personal life, plans for children, health or background unrelated to the job."]
        }),
        stages: [],
        refine: ["completeness", "consistency"],
        quality: ["Every question maps to a job criterion.", "Interviewers score independently before discussing.", "The final decision is made by people, against the criteria."],
        prepare: { required: ["The job description or the criteria."], optional: [] },
        next: ["Brief every interviewer on the plan and the scoring guide."]
    },

    "onboarding-plan": {
        deliverable: "an onboarding plan",
        categories: CATS,
        depth: "standard",
        questions: [
            text("role", "Role and team", { essential: true, placeholder: "Customer Support Agent, billing queue" }),
            text("start", "Start date and work pattern", { placeholder: "1 March, remote" }),
            area("know", "What they must learn and the tools they will use", { essential: true, rows: 3, placeholder: "Billing policies; Zendesk macros and views; refund approval rules" }),
            text("goal", "What they should manage alone by the end", { placeholder: "Handle billing tickets alone by day 30" })
        ],
        brief: (a) => ({
            goal: `Write an onboarding plan for a new ${a.role}.`,
            context: [["Start", a.start], ["What to learn and tools", a.know], ["Goal", a.goal]],
            requirements: [
                "Plan: before day one (access, equipment, accounts), first day, first week, days 8-30, 31-60 and 61-90.",
                "For each period: activities, who is responsible (manager, buddy, IT, HR), and how progress is checked.",
                "Include check-in meetings and a way for the new person to give feedback."
            ],
            format: ["A table by period, then a checklist for the manager."],
            avoid: ["Overloading the first week."]
        }),
        stages: [],
        refine: ["completeness", "clarity"],
        quality: ["Every access and tool the person needs is requested before day one."],
        prepare: { required: ["The role's tools and what they must learn."], optional: [] },
        next: ["Share the plan with the buddy and IT before the start date."]
    },

    "hr-policy": {
        deliverable: "an HR policy draft",
        categories: CATS,
        depth: "standard",
        questions: [
            text("topic", "Policy topic", { essential: true, placeholder: "Remote work" }),
            text("jurisdiction", "Country or state, and company size", { essential: true, placeholder: "Karnataka, India; 120 employees" }),
            area("points", "What the policy must say", { rows: 4, placeholder: "Up to 3 remote days a week; manager approval; equipment allowance" }),
            more(area("existing", "Existing policies it must fit with", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Draft an HR policy on: ${a.topic}`,
            context: [["Jurisdiction and size", a.jurisdiction], ["Must say", a.points], ["Related policies", a.existing]],
            requirements: [
                "Sections: purpose, scope, definitions, policy, responsibilities, process, exceptions, related policies, review date.",
                "Write in plain language; mark every point that depends on local law with [check: legal requirement] instead of stating what the law says.",
                "Keep it consistent with the related policies I listed."
            ],
            format: ["Numbered sections."],
            avoid: ["Statements of law presented as certain.", FAIR]
        }),
        stages: [],
        refine: ["clarity", "consistency"],
        quality: ["A qualified HR or employment-law professional has reviewed every [check] point before the policy is issued."],
        prepare: { required: ["The jurisdiction and what the policy must cover."], optional: ["Related policies."] },
        next: ["Have the draft reviewed by HR and legal, then consulted on where required."]
    },

    "support-reply": {
        deliverable: "a customer support reply",
        categories: CATS,
        depth: "short",
        questions: [
            area("message", "The customer's message", { essential: true, rows: 5, hint: "Remove personal data you do not need: card numbers, addresses, phone numbers." }),
            area("facts", "What you know and what you can offer", { essential: true, rows: 3, hint: "Order status, the relevant policy, what you are allowed to offer.", placeholder: "Order shipped 2 days late; policy allows a 10% voucher, no refund on shipping" }),
            choose("tone", "Tone", TONES),
            choose("channel", "Channel", ["Email or ticket", "Live chat", "Social media reply"])
        ],
        brief: (a) => ({
            goal: "Write a reply to this customer.",
            context: [["Customer message", a.message], ["Facts and what I can offer", a.facts], ["Channel", a.channel]],
            requirements: [
                "Acknowledge the specific problem in the first sentence.",
                "Explain what happened and what we will do, using only the facts and offers I gave.",
                "Give one clear next step and when the customer will hear from us.",
                a.channel === "Live chat" ? "Keep it to short chat-length messages." : "Keep it short enough to read on a phone."
            ],
            format: ["The reply only, ready to send; then one line on anything I should check first."],
            avoid: ["Promises, refunds or compensation I did not offer.", "Blaming the customer.", "Repeating personal data back."]
        }),
        stages: [],
        refine: ["style", "clarity"],
        quality: ["Every offer in the reply is allowed by your policy."],
        prepare: { required: ["The customer's message and the relevant policy."], optional: [] },
        next: ["Save a good reply as a macro or template in your help desk."]
    },

    "kb-article": {
        deliverable: "a help-centre article",
        categories: CATS,
        depth: "short",
        questions: [
            text("question", "The question the article answers", { essential: true, placeholder: "How do I change my billing address?" }),
            area("steps", "The correct steps or answer", { essential: true, rows: 5, hint: "From the product itself; the article uses only these.", placeholder: "Settings > Billing > Edit address; changes apply from the next invoice" }),
            text("audience", "Who reads it", { placeholder: "Account admins, non-technical" }),
            more(area("tickets", "How customers phrase the question in tickets", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Write a help-centre article answering: ${a.question}`,
            context: [["Correct steps", a.steps], ["Readers", a.audience], ["Customer wording", a.tickets]],
            requirements: [
                "Title as the customer would search for it; answer in the first two lines.",
                "Numbered steps with the exact names of buttons and menus from my steps; one action per step.",
                "Add what to do if it does not work and when to contact support."
            ],
            format: ["Title, short answer, steps, troubleshooting, related questions."],
            avoid: ["Steps, screens or settings I did not describe."]
        }),
        stages: [],
        refine: ["clarity", "structure"],
        quality: ["Someone has followed every step in the live product."],
        prepare: { required: ["The correct steps from the product."], optional: ["Screenshots."] },
        next: ["Link the article from the macro that answers this question."]
    },

    "ticket-analysis": {
        deliverable: "a support ticket analysis",
        categories: [{ id: "data" }, { id: "assistants" }],
        depth: "standard",
        noFabrication: true,
        questions: [
            area("data", "The tickets or export", { essential: true, rows: 4, hint: "A CSV export from your help desk (subject, tags, created date, status, first reply time). Remove customer names and contact details first.", placeholder: "Export of 800 tickets from the last month will be pasted" }),
            text("question", "What you want to learn", { essential: true, placeholder: "Top reasons for contact and which could be self-served" }),
            text("period", "Period and volume", { placeholder: "October, about 800 tickets" })
        ],
        brief: (a) => ({
            goal: `Analyse these support tickets to answer: ${a.question}`,
            context: [["Data", a.data], ["Period", a.period]],
            requirements: [
                "Group tickets into contact reasons from their content; show the rule you used for each group and a few example subjects.",
                "Count and rank the reasons from the data; give percentages with the total they are based on.",
                "Point out reasons that a help-centre article, a product fix or a macro could reduce, with the evidence.",
                "Say how many tickets you could not classify."
            ],
            format: ["A table of reasons with counts and percentages, then findings and recommendations."],
            avoid: ["Counts or trends not computed from the data I gave."]
        }),
        stages: [],
        refine: ["evidence", "accuracy"],
        quality: ["The counts add up to the number of tickets in the export.", "Personal data was removed before sharing."],
        prepare: { required: ["A ticket export with personal data removed."], optional: [] },
        next: ["Write articles for the top self-service reasons with \"A help-centre article\"."]
    }

};
