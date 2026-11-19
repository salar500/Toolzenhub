/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: UI/UX design (AI programme D18)

   A user research plan, a usability test plan, a UX and
   accessibility review, and a design handoff specification.
   Findings come from what the visitor shares (screens, flows,
   recordings); accessibility points cite WCAG criteria to check,
   never a pass or a certification.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "design" }, { id: "research" }, { id: "assistants" }];

export const BLUEPRINTS = {

    "ux-research-plan": {
        deliverable: "a user research plan",
        categories: CATS,
        depth: "standard",
        questions: [
            area("question", "What you need to learn and the decision it informs", { essential: true, rows: 3, placeholder: "Why first-time users drop off at account setup; decides what we redesign next quarter" }),
            text("users", "Who to research", { essential: true, placeholder: "New small-business users in their first week" }),
            text("constraints", "Time, budget and access to users", { placeholder: "3 weeks, no incentives budget, 200 users reachable by email" }),
            more(area("known", "What you already know (analytics, tickets, past studies)", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Plan user research to answer: ${a.question}`,
            context: [["Participants", a.users], ["Constraints", a.constraints], ["Already known", a.known]],
            requirements: [
                "Choose methods that fit the question and constraints (interviews, usability tests, surveys, diary studies, analytics review) and say why.",
                "Define participants, screening criteria, number of sessions and recruitment approach.",
                "Write a discussion guide or task list with neutral, non-leading questions.",
                "Plan analysis (for example affinity mapping) and how findings will reach the decision.",
                "Cover consent and how recordings and personal data are stored."
            ],
            format: ["Sections: goals, method, participants, guide, logistics, analysis, timeline, ethics."],
            avoid: ["Leading questions.", "Findings before any research is done."]
        }),
        stages: [],
        refine: ["completeness", "missing"],
        quality: ["Each research question maps to a method and a decision."],
        prepare: { required: ["The decision the research informs."], optional: ["Existing analytics or tickets."] },
        next: ["Run one pilot session and fix the guide before the rest."]
    },

    "usability-test": {
        deliverable: "a usability test plan",
        categories: CATS,
        depth: "standard",
        questions: [
            text("product", "Product or prototype and the flows to test", { essential: true, placeholder: "Figma prototype of the new checkout: add address, pay, confirm" }),
            text("participants", "Participants", { essential: true, placeholder: "5 shoppers who bought online in the last month" }),
            choose("mode", "Format", ["Moderated, remote", "Moderated, in person", "Unmoderated"], { essential: true }),
            area("goals", "What you want to find out", { rows: 2, placeholder: "Can people finish payment without help; where they hesitate" })
        ],
        brief: (a) => ({
            goal: `Write a usability test plan for: ${a.product}`,
            context: [["Participants", a.participants], ["Format", a.mode], ["Goals", a.goals]],
            requirements: [
                "Write realistic task scenarios that do not give away the answer or the interface words.",
                "Define success for each task and what to measure (completion, errors, time, confidence rating).",
                "Give the moderator script: introduction, consent, think-aloud prompt, neutral follow-ups, wrap-up.",
                "Plan how to record observations and rate issue severity."
            ],
            format: ["Sections: goals, participants, tasks with success criteria, script, measures, observation sheet, severity scale."],
            avoid: ["Leading wording in tasks or follow-ups."]
        }),
        stages: [],
        refine: ["clarity", "completeness"],
        quality: ["Each task can succeed or fail in a way you can observe."],
        prepare: { required: ["The prototype or product and the flows to test."], optional: [] },
        next: ["Pilot the tasks with a colleague, then run the sessions."]
    },

    "graphic-design": {
        deliverable: "a graphic design brief and specification",
        categories: CATS,
        depth: "standard",
        questions: [
            choose("kind", "What is being designed", ["A social media graphic", "A marketing graphic (advert, poster, flyer)", "Presentation slides or a template", "A brand identity element (logo, brand board)", "A layout (brochure, report, editorial page)"], { essential: true }),
            area("purpose", "Purpose and audience", { essential: true, rows: 3, hint: "What it must achieve, for whom, and where it will be seen.", placeholder: "Announce the clinic's new evening hours to local families; Instagram and a printed A4 poster in the waiting room" }),
            area("content", "Content it must carry", { rows: 3, hint: "The exact text, logos, images or data. Leave empty if it is to be proposed.", placeholder: "Headline: Now open until 8 pm; dates; address; logo" }),
            area("brand", "Brand rules", { rows: 3, hint: "Colours (with codes), fonts, logo use, tone. Say if there are none yet.", placeholder: "Navy #1F3A5F and teal #2BB3A3; Inter; logo top left with clear space" }),
            text("formats", "Sizes and file formats", { placeholder: "1080 x 1350 px PNG; A4 PDF for print with 3 mm bleed" }),
            more(area("references", "References or examples", { rows: 2, hint: "Describe or link what you like and dislike, and why." }))
        ],
        brief: (a) => ({
            goal: `Prepare ${a.kind ? a.kind.charAt(0).toLowerCase() + a.kind.slice(1) : "a graphic design"}: a design brief, concept directions and the production specification, for: ${a.purpose}`,
            context: [["What is being designed", a.kind], ["Content", a.content], ["Brand rules", a.brand], ["Sizes and formats", a.formats], ["References", a.references]],
            requirements: [
                "Start from the purpose and the audience, and make every visual decision serve them.",
                "Use only the brand rules and content I gave; where they are missing, propose options and mark them as proposals.",
                "Give exact specifications (sizes, colour codes, type sizes, spacing, file formats) wherever a designer or a tool needs them.",
                "Do not claim an image, font or icon is free to use; list each asset with where it must come from and who must confirm the licence."
            ],
            format: ["The brief, then two or three concept directions, then the production specification for the chosen direction, then the review checklist."],
            avoid: ["Decoration that does not serve the message; text baked into images where it must stay editable or readable."]
        }),
        stages: [
            { at: "standard", name: "Brief", objective: "Agree what the design must do.", submit: "The main prompt.", ask: () => "Write the design brief only (objective, audience, message, content, brand rules, formats, constraints) and the questions it raises.", expect: "A brief and questions.", done: "The brief is agreed." },
            { at: "standard", name: "Concepts", objective: "Compare directions before production.", submit: "Your answers.", ask: () => "Propose two or three concept directions, each with its idea, layout, type, colour and imagery, and the reason it fits the brief.", expect: "Concept directions.", done: "You have chosen one." },
            { at: "detailed", name: "Specification", objective: "Everything needed to produce it.", submit: "The chosen direction.", ask: () => "Write the production specification for the chosen direction: every size and format, layout grid, type scale, colours, assets and export settings.", expect: "A production specification.", done: "A designer could build it without asking." }
        ],
        refine: ["completeness", "consistency", "missing"],
        quality: ["Every visual decision serves the stated purpose and audience.", "Text contrast meets WCAG 2.2 AA (4.5:1 for normal text) where the design is read on screen.", "Sizes, colours, fonts and export settings are exact.", "Every asset has a confirmed source and licence."],
        prepare: { required: ["The purpose, the audience and where it will be seen.", "The exact text and any logos or images to use."], optional: ["Brand guidelines.", "Examples you like and dislike."] },
        next: ["Check the design at its real size on the real device or in print.", "Ask someone from the audience what they notice first.", "Keep the source files and the specification together."]
    },

    "user-flow": {
        deliverable: "a user flow",
        categories: CATS,
        depth: "standard",
        questions: [
            area("goal", "The user and what they want to do", { essential: true, rows: 3, placeholder: "A first-time patient books an appointment with a doctor from the clinic's website" }),
            choose("platform", "Platform", ["Website", "Mobile app", "Website and mobile app", "Other or not sure"]),
            area("entry", "Where the flow starts and ends", { rows: 2, placeholder: "Starts from the clinic home page or a reminder email; ends with a confirmed booking" }),
            area("rules", "Rules, roles and constraints", { rows: 3, placeholder: "Guests can book; an account is optional; bookings at least 2 hours ahead" })
        ],
        brief: (a) => ({
            goal: `Design the user flow for: ${a.goal}`,
            context: [["Start and end", a.entry], ["Platform", a.platform], ["Rules and constraints", a.rules]],
            requirements: [
                "Map the main path step by step: what the user sees, what they decide or do, and what the system does in response.",
                "Add every branch: decisions, errors, empty states, returning users, cancellations and the ways back.",
                "Mark where the user may hesitate or drop out, and why.",
                "Do not invent business rules; list what you need to know instead."
            ],
            format: ["The flow as numbered steps with branches, then the same flow as text a diagram tool can draw (for example Mermaid).", "A list of the screens or states the flow needs.", "Open questions at the end."]
        }),
        stages: [
            { at: "standard", name: "Main path", objective: "Agree the main path first.", submit: "The main prompt.", ask: () => "Write only the main path, step by step, and list your questions about the rules.", expect: "The main path and questions.", done: "The main path is agreed." },
            { at: "standard", name: "Branches and states", objective: "Cover everything off the main path.", submit: "Your answers.", ask: () => "Add every branch, error and empty state, and the screens the whole flow needs.", expect: "The full flow and the screen list.", done: "No step is a dead end." }
        ],
        refine: ["completeness", "missing", "clarity"],
        quality: ["Every step has a way forward and a way back.", "Errors and empty states are in the flow, not only the main path.", "Business rules come from your answers, not from the AI."],
        prepare: { required: ["Who the user is and what they want to achieve.", "The business rules that affect the flow."], optional: ["Existing screens, or analytics on where users drop out."] },
        next: ["Walk through the flow with a colleague, then with one real user.", "Turn the screen list into wireframes.", "Test the riskiest step in a usability test (the Prompt Builder task \"usability test\")."]
    },

    "ux-review": {
        deliverable: "a UX and accessibility review",
        categories: CATS,
        depth: "standard",
        questions: [
            area("what", "Screens or flow to review", { essential: true, rows: 3, hint: "Describe them, or say you will attach screenshots or a link the AI can be given as images.", placeholder: "Sign-up flow, 4 screens; screenshots attached" }),
            text("users", "Who uses it and on what devices", { placeholder: "First-time users, mostly on Android phones" }),
            choose("lens", "Review against", ["Usability heuristics", "Accessibility (WCAG 2.2 AA)", "Both"], { essential: true }),
            more(text("goal", "Business goal of the flow"))
        ],
        brief: (a) => ({
            goal: `Review this interface: ${a.what}`,
            context: [["Users and devices", a.users], ["Review against", a.lens], ["Goal of the flow", a.goal]],
            requirements: [
                "Review only what I show you; ask for screenshots or the missing states (errors, empty, loading) you need.",
                "For each issue: where it is, what the problem is, which heuristic or WCAG success criterion it relates to, severity, and a concrete fix.",
                "For accessibility, name the success criterion to check (for example 1.4.3 Contrast) and how to test it; a visual review cannot confirm compliance."
            ],
            format: ["A table sorted by severity: location, issue, principle or criterion, severity, fix."],
            avoid: ["Claiming the design passes or fails WCAG.", "Comments on screens you have not seen."]
        }),
        stages: [],
        refine: ["evidence", "completeness"],
        quality: ["Accessibility points are confirmed with real testing (keyboard, screen reader, contrast tool)."],
        prepare: { required: ["Screenshots or a description of every screen and state."], optional: [] },
        next: ["Test the top accessibility issues with a screen reader and a contrast checker."]
    },

    "design-handoff": {
        deliverable: "a design handoff specification",
        categories: [{ id: "design" }, { id: "coding" }],
        depth: "standard",
        questions: [
            text("feature", "Feature or screens", { essential: true, placeholder: "Account settings page, web and mobile web" }),
            area("design", "What the design contains", { essential: true, rows: 4, hint: "Frames, components, variants and states. The AI cannot open your design file; paste exported specs or describe them.", placeholder: "3 frames; uses our Button, Input, Toggle components; light and dark" }),
            text("stack", "What developers build with", { placeholder: "React, design tokens in CSS variables" }),
            more(area("behaviour", "Interactions and edge cases you know of", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Write a design handoff specification for: ${a.feature}`,
            context: [["Design contents", a.design], ["Built with", a.stack], ["Interactions and edge cases", a.behaviour]],
            requirements: [
                "List screens and components with every state: default, hover, focus, active, disabled, loading, empty, error, success.",
                "Name design tokens (colour, type, spacing) rather than raw values where the design uses them.",
                "Specify responsive behaviour at each breakpoint, interactions and transitions, and content rules (truncation, long text, localisation).",
                "Include accessibility notes: focus order, labels, roles, keyboard behaviour, contrast.",
                "End with open questions for the designer."
            ],
            format: ["Sections per screen; states as tables; open questions at the end."],
            avoid: ["Measurements or behaviour not in what I gave you: list them as questions."]
        }),
        stages: [],
        refine: ["completeness", "consistency", "missing"],
        quality: ["Every state a developer will meet is specified or listed as a question."],
        prepare: { required: ["The design specs, or an export or description of each frame."], optional: ["Your design tokens."] },
        next: ["Walk through the spec with the developer before build starts."]
    }

};
