/* =========================================================
   ToolZen Hub
   AI Prompt Builder methods: plans, learning and presentations (D19)

   See method.js for the contract. Plans are built on the visitor's
   real dates, people and constraints; anything assumed is marked.
========================================================= */

export const FAMILY = {
    review: "Dates, people, budgets and commitments come from me; mark every assumed one, and do not commit anyone to anything.",
    sections: [
        {
            id: "realism", at: "detailed", title: "Make it realistic",
            lines: ["Check the plan against the time, people and constraints I gave; where it does not fit, say what to cut or change rather than squeezing it in."]
        },
        {
            id: "risks", at: "comprehensive", kind: "edges", title: "Risks and dependencies",
            lines: ["List what could delay or derail the plan, how likely and how serious each is, the early warning sign, and the response."]
        }
    ]
};

export const METHODS = {
    "project-plan": {
        role: "Act as an experienced project manager who builds realistic, controllable project plans.",
        approach: [
            "Define the objectives, scope, out of scope and success criteria first.",
            "Break the work down into deliverables and tasks with owners, estimates and dependencies.",
            "Build the schedule with milestones, then add risks, communication and governance."
        ],
        sections: [
            {
                at: "detailed", kind: "deliverables", title: "The plan must contain",
                lines: [
                    "Objectives and success criteria; scope and out of scope; a work breakdown (phases, deliverables, tasks); owners using a responsibility chart (responsible, accountable, consulted, informed); estimates; dependencies; milestones and the critical path; risks; communication plan; and how changes are approved.",
                    "Estimates as ranges where they are uncertain, with the assumption behind each."
                ]
            },
            {
                at: "comprehensive", kind: "steps", title: "Planning phases",
                lines: [
                    "Initiate: objectives, stakeholders, constraints and success criteria.",
                    "Scope: deliverables, out of scope and acceptance for each deliverable.",
                    "Break down: tasks small enough to estimate and assign.",
                    "Schedule: sequence, dependencies, milestones, buffers and the critical path.",
                    "Resource: who does what, availability and conflicts.",
                    "Control: status reporting, the risk and issue log, the change process and the decision points."
                ]
            },
            {
                at: "comprehensive", kind: "examples", title: "Example of a task row",
                lines: ["T-14 | Migrate customer data | owner: data lead | 3-5 days | depends on T-12 (schema approved) | milestone M2 | risk: data quality unknown."]
            }
        ]
    },
    "learning-plan": {
        role: "Act as an experienced learning coach who designs practical, paced learning plans.",
        approach: [
            "Start from the goal and what the learner already knows.",
            "Sequence topics from foundations to application, with practice in every week.",
            "Build in checkpoints to test understanding, not just reading."
        ],
        sections: [
            { at: "detailed", kind: "deliverables", title: "The plan must contain", lines: ["Weekly topics, the practice task for each, the free or named resources to use (marked [check] if you cannot be sure they exist), checkpoints, and a final project that shows the skill."] }
        ]
    },
    "interview-prep": {
        role: "Act as an experienced interviewer and career coach.",
        approach: [
            "Work from the job description and my background.",
            "Prepare likely questions with structured answers based on my real experience.",
            "Never invent experience or achievements for me."
        ],
        sections: [
            { at: "detailed", title: "Answer structure", lines: ["Use situation, task, action and result for behavioural answers, with my own examples; mark where I need to supply one."] }
        ]
    },
    presentation: {
        role: "Act as an experienced presentation coach who builds clear, persuasive presentations.",
        approach: [
            "Define the audience, the decision or understanding wanted, and the time.",
            "One message per slide, with the headline stating the point.",
            "Support each point with evidence I gave; add speaker notes."
        ],
        sections: [
            { at: "detailed", kind: "deliverables", title: "Deliverables", lines: ["A slide-by-slide outline: headline, content, visual suggestion and speaker notes, with timing."] },
            { at: "detailed", title: "Slide design", lines: ["One message per slide in a headline that states it; a consistent layout set; charts reduced to the point they make; text large enough to read from the back of the room and in sufficient contrast."] },
            { id: "risks", at: "comprehensive", kind: "edges", title: "Questions to prepare for", lines: ["The hardest questions the audience may ask, the objections, and the data that would answer them."] }
        ]
    }
};
