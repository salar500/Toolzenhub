/* =========================================================
   ToolZen Hub
   AI Workbench blueprints: planning multi-step work

   A project with AI, a learning plan, interview preparation and a
   presentation or proposal. Learning adapts to the learner's level;
   interview preparation never invents facts about the employer.
========================================================= */

import { text, area, choose } from "./shared.js";

const CATS = [{ id: "assistants" }];

export const BLUEPRINTS = {

    "project-plan": {
        deliverable: "a step-by-step plan",
        categories: [{ id: "assistants" }, { id: "automation" }],
        depth: "multi",
        questions: [
            area("goal", "What you want to achieve", { essential: true, rows: 3, placeholder: "Launch a small online course on household budgeting" }),
            text("deadline", "Deadline", { placeholder: "End of January" }),
            area("resources", "People, budget and tools", { rows: 3 }),
            area("constraints", "Constraints", { rows: 2 }),
            text("done", "How you will know it is done", { placeholder: "10 paying students enrolled" })
        ],
        brief: (a) => ({
            goal: `Help me plan this, step by step: ${a.goal}`,
            context: [["Deadline", a.deadline], ["Resources", a.resources], ["Constraints", a.constraints], ["Done when", a.done]],
            requirements: ["Break it into phases and tasks, each with an output, an owner and a duration.", "Mark which tasks an AI product can help with and how, and which need a person.", "Show dependencies and the critical path, and the main risks with a response to each."],
            format: ["Phases with tasks in a table: task, output, owner, duration, depends on, AI help."]
        }),
        stages: [
            { at: "standard", name: "Phases", objective: "The big picture.", submit: "The master prompt.", ask: () => "Give the phases and their outputs only.", expect: "Phases.", done: "They lead to the goal." },
            { at: "standard", name: "Tasks", objective: "What to do.", submit: "Approval of the phases.", ask: () => "Break each phase into tasks as specified.", expect: "The task table.", done: "Each task has an output and an owner." },
            { at: "detailed", name: "Risks", objective: "Fewer surprises.", submit: "Nothing new.", ask: () => "List the main risks, their likelihood and impact, and a response to each.", expect: "A risk list.", done: "Each risk has a response." },
            { at: "multi", name: "First week", objective: "Start.", submit: "Your calendar for the week.", ask: () => "Turn the first tasks into a plan for this week, day by day.", expect: "A week plan.", done: "You know what to do tomorrow." }
        ],
        refine: ["completeness", "missing", "structure"],
        quality: ["Each task has an output you can check.", "Durations fit the deadline.", "The tasks needing a person are clear."],
        prepare: { required: ["The goal and the deadline."], optional: ["Who can help and the budget."] },
        next: ["Put the first week's tasks in your calendar.", "Review the plan each week; ask the AI to re-plan from what changed."]
    },

    "learning-plan": {
        deliverable: "a learning plan",
        categories: [{ id: "learning" }, { id: "assistants" }],
        depth: "standard",
        questions: [
            text("subject", "What you want to learn", { essential: true, placeholder: "SQL for data analysis" }),
            choose("level", "Where you are now", ["Complete beginner", "Know the basics", "Intermediate", "Advanced, filling gaps"], { essential: true }),
            text("goal", "Goal", { placeholder: "Pass a data analyst interview in 2 months" }),
            text("time", "Time per week", { placeholder: "5 hours" }),
            choose("style", "How you learn best", ["Doing exercises", "Reading and notes", "Videos", "Projects", "A mix"])
        ],
        brief: (a) => ({
            goal: `Make me a learning plan for ${a.subject}. My level: ${a.level.toLowerCase()}.`,
            context: [["Goal", a.goal], ["Time per week", a.time], ["Learning style", a.style]],
            requirements: ["Weekly topics in a sensible order, each with what I should be able to do at the end of the week.", "Practice for each week, with a way to check I got it right.", "Review points every few weeks.", "Start from my level; do not repeat what I already know."],
            format: ["A week-by-week table, then how to check progress."],
            avoid: ["Links or course names you are not sure exist; describe the kind of resource instead."]
        }),
        stages: [
            { at: "standard", name: "Plan", objective: "The route.", submit: "The master prompt.", ask: () => "Write the week-by-week plan.", expect: "A plan.", done: "It fits your time." },
            { at: "standard", name: "Week one", objective: "Start learning.", submit: "Nothing new.", ask: () => "Teach me week one: explain the first topic with an example, then give me three exercises without the answers.", expect: "A lesson and exercises.", done: "You did the exercises." },
            { at: "detailed", name: "Check", objective: "Find gaps.", submit: "Your answers to the exercises.", ask: () => "Here are my answers. Mark them, explain each mistake, and adjust the plan if I am faster or slower than planned.", expect: "Feedback and an adjusted plan.", done: "You know what to revise." }
        ],
        refine: ["clarity", "missing"],
        quality: ["Each week ends with something you can do, not only read.", "You can check your own progress.", "The plan fits the time you have."],
        prepare: { required: ["What you want to be able to do, and by when."], optional: ["What you already know."] },
        next: ["Do the exercises without looking at answers first.", "Use the ToolZen Hub Practice Labs and learning paths where your subject has one."]
    },

    "interview-prep": {
        deliverable: "interview preparation",
        categories: CATS,
        depth: "standard",
        questions: [
            text("role", "The role", { essential: true, placeholder: "Junior QA engineer" }),
            area("job", "The job description", { long: true, rows: 5 }),
            area("background", "Your background", { essential: true, rows: 4, hint: "Experience, projects and skills, briefly. Leave out personal data you would not share." }),
            choose("kind", "Interview kind", ["Screening call", "Technical", "Behavioural", "Case study", "Final round", "Not sure"])
        ],
        brief: (a) => ({
            goal: `Help me prepare for a ${a.kind && a.kind !== "Not sure" ? `${a.kind.toLowerCase()} ` : ""}interview for the role of ${a.role}.`,
            context: [["Job description", a.job], ["My background", a.background]],
            requirements: ["Likely questions for this role and kind of interview, grouped by topic.", "For each, what a strong answer covers, using my real background; where my background has a gap, say so and how to address it honestly.", "A few good questions for me to ask."],
            format: ["Questions by topic, then my answer outlines, then questions to ask."],
            avoid: ["Facts about the employer you cannot verify.", "Answers that claim experience I do not have."]
        }),
        stages: [
            { at: "standard", name: "Questions", objective: "Know what may come.", submit: "The master prompt.", ask: () => "List the likely questions only.", expect: "Questions.", done: "You know the topics." },
            { at: "standard", name: "Mock interview", objective: "Practise.", submit: "Nothing new.", ask: () => "Interview me: ask one question at a time, wait for my answer, then give specific feedback before the next question.", expect: "A mock interview.", done: "You answered at least five questions." }
        ],
        refine: ["clarity", "missing"],
        quality: ["Every answer is true to your experience.", "You can say each answer in your own words without notes."],
        prepare: { required: ["The job description.", "Your CV or a summary of it."], optional: ["What you know about the team, from the company's own pages."] },
        next: ["Practise aloud, not only in writing.", "Look up the company on its own website before the interview."]
    },

    presentation: {
        deliverable: "a presentation or proposal",
        categories: [{ id: "assistants" }, { id: "design" }],
        depth: "standard",
        questions: [
            area("topic", "What it is about", { essential: true, rows: 3 }),
            text("audience", "Audience", { essential: true, placeholder: "The leadership team" }),
            choose("kind", "Kind", ["Slides", "Written proposal", "Pitch", "Status update"]),
            text("ask", "What you want them to decide or do", { placeholder: "Approve a budget of ₹5 lakh" }),
            text("length", "Length", { placeholder: "10 slides, 15 minutes" }),
            area("facts", "Facts and figures to use", { rows: 3 })
        ],
        brief: (a) => ({
            goal: `Create ${a.kind === "Written proposal" ? "a written proposal" : a.kind === "Pitch" ? "a pitch" : a.kind === "Status update" ? "a status update" : "a slide presentation"} about ${a.topic} for ${a.audience}.`,
            context: [["The ask", a.ask], ["Length", a.length], ["Facts", a.facts]],
            requirements: ["Lead with the ask and why it matters to this audience.", "One message per slide or section, supported by my facts.", "End with the decision or next step."],
            format: [a.kind === "Written proposal" ? "Sections with headings." : "Slide by slide: title, three points at most, and speaker notes."],
            avoid: ["Figures I did not give you."]
        }),
        stages: [
            { at: "standard", name: "Storyline", objective: "The argument.", submit: "The master prompt.", ask: () => "Give the storyline: one sentence per slide or section.", expect: "A storyline.", done: "It leads to the ask." },
            { at: "standard", name: "Content", objective: "The full content.", submit: "Approval.", ask: () => "Write the full content.", expect: "Slides or sections.", done: "It fits the length." }
        ],
        refine: ["clarity", "structure", "accuracy"],
        quality: ["The ask is clear in the first minute.", "Every figure is yours.", "It fits the time."],
        prepare: { required: ["What you want the audience to decide."], optional: ["Your organisation's template."] },
        next: ["Rehearse with a timer.", "Build the slides in your own tool or the template your organisation uses."]
    }

};
