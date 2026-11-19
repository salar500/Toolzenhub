/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: building software (Stage 4)

   Requirements, a feature, debugging, review, refactoring, API
   design and documentation. The stack is always the visitor's:
   nothing is assumed, and the AI is told to ask rather than guess.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "coding" }, { id: "assistants" }];

const stack = text("stack", "Language, framework and versions", { essential: true, hint: "Exactly what the project uses, for example \"TypeScript 5, React 18, Node 20\".", placeholder: "TypeScript 5, React 18, Node 20" });
const project = area("project", "About the project", { rows: 3, hint: "What it does, how it is organised, conventions to follow.", placeholder: "Online shop; monorepo with apps/web and apps/api; ESLint and Prettier; tests with Vitest" });
const code = (label, extra = {}) => area("code", label, { long: true, rows: 8, hint: "Paste the relevant code. Remove secrets and keys first.", ...extra });

const ASK_NOT_GUESS = "Do not assume libraries, versions, file names or APIs I have not shown you; ask, or mark each assumption.";
const SMALL = "Change only what the task needs; do not reformat or rewrite unrelated code.";

export const BLUEPRINTS = {

    requirements: {
        deliverable: "an analysis of the requirements",
        categories: CATS,
        depth: "standard",
        questions: [
            area("source", "The requirements as you have them", { essential: true, long: true, rows: 6, hint: "A user story, a brief, an email or meeting notes, as written.", placeholder: "As a customer I want to apply a coupon at checkout so that I pay less." }),
            text("users", "Who uses it", { placeholder: "Signed-in customers on web and mobile" }),
            area("constraints", "Constraints", { rows: 3, placeholder: "Must work with the existing payment provider; release in 3 weeks" }),
            choose("output", "What you need", [
                { value: "the questions and gaps to clarify", label: "Questions and gaps to clarify" },
                { value: "user stories with acceptance criteria", label: "User stories with acceptance criteria" },
                { value: "a requirements document", label: "A requirements document" }
            ], { essential: true })
        ],
        brief: (a) => ({
            goal: `Analyse these requirements and produce ${a.output}:\n${a.source}`,
            context: [["Users", a.users], ["Constraints", a.constraints]],
            requirements: [
                "Separate what is stated from what is implied, and list every ambiguity, contradiction and missing rule (errors, limits, permissions, edge cases).",
                /stories/i.test(a.output) ? "Write each user story with acceptance criteria that can be tested (Given / When / Then where it helps)." : "",
                /document/i.test(a.output) ? "Structure the document as goals, scope, functional requirements, non-functional requirements, assumptions, open questions." : "",
                "Do not add features that were not asked for; list them as suggestions instead."
            ],
            format: ["Open questions first, numbered, so I can answer them by number."]
        }),
        stages: [
            { at: "standard", name: "Questions", objective: "Find the gaps before anything is built.", submit: "The main prompt.", ask: () => "Give only the numbered list of questions, ambiguities and missing rules.", expect: "Numbered questions.", done: "You have the answers from the person who owns the requirement." },
            { at: "standard", name: "The analysis", objective: "The finished deliverable.", submit: "The answers, by number.", ask: (a) => `With my answers, write ${a.output}.`, expect: "The requested deliverable.", done: "Every question is resolved or listed as open." }
        ],
        refine: ["completeness", "clarity", "missing"],
        quality: ["Each acceptance criterion can be tested with a yes or no.", "Assumptions are separate from what was stated.", "Nothing was added that nobody asked for."],
        prepare: { required: ["The requirement exactly as written."], optional: ["Screens or mock-ups.", "Who can answer questions about it."] },
        next: ["Send the open questions to the owner of the requirement.", "Use the stories for estimation and for test design (the Prompt Builder task \"test scenarios and test cases\")."]
    },

    architecture: {
        deliverable: "an architecture design",
        categories: CATS,
        depth: "detailed",
        questions: [
            area("system", "What the system must do", { essential: true, rows: 4, hint: "The problem, the users and the main things it must do.", placeholder: "An appointment booking service for 40 clinics: patients book online, staff manage calendars, reminders by SMS" }),
            choose("kind", "What you are designing", ["A new system", "A change to an existing system", "A migration (for example to the cloud)", "Not sure"]),
            area("quality", "Qualities that matter most", { rows: 3, hint: "Load, availability, response time, security, cost, time to build.", placeholder: "5,000 bookings a day; 99.9% availability in clinic hours; patient data protected" }),
            area("constraints", "Constraints and what exists", { rows: 3, hint: "Technology you must use, systems to integrate with, team skills, budget, deadlines.", placeholder: "Existing PostgreSQL database; team knows Java; must run on Azure" }),
            more(text("scale", "Expected growth", { placeholder: "Twice the clinics in two years" }))
        ],
        brief: (a) => ({
            goal: `Design the software architecture for: ${a.system}`,
            context: [["Kind of work", a.kind], ["Qualities that matter", a.quality], ["Constraints and existing systems", a.constraints], ["Expected growth", a.scale]],
            requirements: [
                "Start from the requirements and the qualities that matter, and say how each design decision serves them.",
                "Describe the components, their responsibilities, the interfaces between them, the data and where it lives, and the main flows through the system.",
                "For each significant decision, give the options considered, the choice, the trade-offs and what would make you revisit it.",
                "Cover security, reliability, scalability, observability and deployment as far as the requirements need them.",
                "Do not choose technologies I have ruled out, and mark every assumption about load, data or constraints."
            ],
            format: ["Context and requirements, then a component view, data, key flows, decisions (as decision records), risks and open questions.", "Diagrams as text (for example Mermaid, or a list of boxes and arrows) so they can be drawn."]
        }),
        stages: [
            { at: "standard", name: "Requirements and qualities", objective: "Agree what the architecture must achieve.", submit: "The main prompt.", ask: () => "List the functional requirements, the quality requirements with measurable targets, the constraints and your questions. Do not design yet.", expect: "Requirements, targets, constraints and questions.", done: "The targets are agreed." },
            { at: "standard", name: "Options", objective: "Compare approaches before choosing.", submit: "Your answers.", ask: () => "Propose two or three architectural options with their trade-offs against the agreed targets, and recommend one.", expect: "Options and a recommendation.", done: "You have chosen an option." },
            { at: "detailed", name: "The design", objective: "The chosen architecture in detail.", submit: "The chosen option.", ask: () => "Write the full architecture for the chosen option, with components, data, flows, decisions and risks.", expect: "The architecture document.", done: "Every requirement maps to a part of the design." }
        ],
        refine: ["technical", "completeness", "missing"],
        quality: ["Every requirement and quality target maps to a part of the design.", "Each significant decision has its options, trade-offs and reasons.", "Assumptions about load, data and constraints are marked.", "The failure of each component has been considered."],
        prepare: { required: ["The requirements and the quality targets (load, availability, response time).", "The constraints: technology, systems to integrate, team, budget."], optional: ["Diagrams of the existing system.", "Current usage and growth figures."] },
        next: ["Review the decisions with the team and the people who will run the system.", "Prototype the riskiest part before committing to it.", "Keep the decision records with the code."]
    },

    "code-feature": {
        deliverable: "the code for a feature",
        categories: CATS,
        depth: "standard",
        questions: [
            area("feature", "What the feature must do", { essential: true, rows: 4, placeholder: "Let a signed-in customer apply one coupon code to the basket; show the discount and the new total." }),
            stack,
            project,
            code("Relevant existing code", { essential: false }),
            area("acceptance", "How you will know it works", { rows: 3, placeholder: "Valid code: total reduced; expired: message shown; a second code: refused" }),
            choose("tests", "Tests", ["Write tests with the code", "Code only; I will test it", "Tests first, then the code"])
        ],
        brief: (a) => ({
            goal: `Implement this feature: ${a.feature}`,
            context: [["Stack", a.stack], ["Project", a.project], ["Existing code", a.code], ["Done when", a.acceptance]],
            requirements: [
                "Follow the project's existing structure and conventions.",
                SMALL,
                "Validate input and handle errors; never trust data from the client.",
                a.tests === "Code only; I will test it" ? "" : a.tests === "Tests first, then the code" ? "Write the tests first from the acceptance criteria, then the code that makes them pass." : "Add tests for the acceptance criteria and the main edge cases.",
                ASK_NOT_GUESS
            ],
            format: ["A short plan first, then one code block per file with its path, then how to run and check it."]
        }),
        stages: [
            { at: "standard", name: "Plan", objective: "Agree the approach before code.", submit: "The main prompt and the relevant files.", ask: () => "Give a short implementation plan: files to change or add, the approach, and any question. No code yet.", expect: "A plan and questions.", done: "You agree with the plan." },
            { at: "standard", name: "Implement", objective: "Working code.", submit: "Answers and any file it asked for.", ask: () => "Implement the plan.", expect: "Code per file and run instructions.", done: "It builds and the tests pass on your machine." },
            { at: "detailed", name: "Edge cases and security", objective: "Make it robust.", submit: "Nothing new.", ask: () => "Review your code for edge cases, error paths, security (injection, authorisation, data exposure) and performance. List each issue and fix it.", expect: "Issues and fixes.", done: "Each issue is fixed or accepted." }
        ],
        refine: ["technical", "completeness", "consistency"],
        quality: ["It builds and the tests pass on your own machine.", "Errors and invalid input are handled.", "Only the files the task needs were changed.", "You have read and understood every line before committing."],
        prepare: { required: ["The exact stack and versions.", "The files the feature touches."], optional: ["An existing feature to copy the style of.", "The acceptance criteria."] },
        next: ["Run it and the tests locally.", "Review the diff yourself before a pull request.", "Ask for a code review (the Prompt Builder task \"review code\")."]
    },

    /* also the former Bug Report to Debugging Prompt (D22): the bug report's evidence, the size of the fix and how it is proven */
    debug: {
        deliverable: "a diagnosis and fix",
        categories: CATS,
        depth: "standard",
        questions: [
            area("problem", "What goes wrong", { essential: true, rows: 3, hint: "What you see, exactly: numbers, messages and the screen or endpoint it happens on.", placeholder: "The basket total is wrong after a coupon is removed" }),
            area("expected", "What should happen", { essential: true, rows: 2, hint: "The correct behaviour, as a plain statement." }),
            area("steps", "How to reproduce it", { rows: 3, hint: "One step per line, from a known starting point. Include the data you used." }),
            area("error", "Error message or log", { long: true, rows: 5, hint: "The full text, not a summary. Remove secrets." }),
            stack,
            code("The code involved"),
            more(text("frequency", "How often it happens", { placeholder: "Every time, for every user we tried" })),
            more(text("environment", "Where it happens", { hint: "Browser or device, version, branch or commit, environment.", placeholder: "Chrome 131 on Windows 11, staging, branch feature/profile-edit" })),
            more(area("files", "Where to look first", { rows: 2, hint: "Files, modules or functions you suspect, one per line. Leave it empty if you do not know." })),
            more(area("protect", "What must not change", { rows: 2, hint: "Behaviour, public interfaces, files or data the fix must leave alone." })),
            more(choose("fixScope", "Size of the fix", ["Smallest fix only", "Fix, and improve the code around it if clearly needed"])),
            more(choose("tests", "How the fix is proven", ["Add a regression test that fails first", "Update the existing tests", "No test changes; verify by hand"])),
            more(area("tried", "What you already tried", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Help me find and fix the cause of this problem: ${a.problem}`,
            context: [["Expected", a.expected], ["Steps to reproduce", a.steps], ["How often", a.frequency], ["Where it happens", a.environment], ["Error or log", a.error], ["Stack", a.stack], ["Code", a.code], ["Where to look first", a.files], ["Must not change", a.protect], ["Already tried", a.tried]],
            requirements: [
                a.steps ? "Reproduce the problem first, following the steps above, and say whether you could." : "",
                "Start with the most likely causes, each with the evidence for it and a way to confirm or rule it out.",
                "Find the root cause; do not patch the symptom. Explain the cause in one short paragraph, with the file and the line it comes from, before you change any code.",
                /improve/.test(a.fixScope)
                    ? "Fix the cause. If the code around it clearly caused the bug or makes the fix fragile, improve it as well, and say exactly what you changed beyond the fix."
                    : "Propose the smallest fix for the confirmed cause, and explain why it fixes it.",
                SMALL,
                /fails first/.test(a.tests) ? "Add an automated test that fails before the fix and passes after it; show how to run it both ways."
                    : /existing/.test(a.tests) ? "Update the existing tests that cover this behaviour, and say how to run them."
                    : /by hand/.test(a.tests) ? "Do not change the tests. Describe exactly how to verify the fix by hand."
                    : "Suggest a test that would have caught it.",
                "Keep every unrelated behaviour as it is, and list every file you change and why.",
                "Report in this order: the cause, the fix, how it is verified, and anything that could not be verified. If a step cannot be completed, say so and stop there.",
                ASK_NOT_GUESS
            ],
            format: ["Likely causes (ranked), how to confirm each, the fix, the test, what was and was not verified."]
        }),
        stages: [
            { at: "standard", name: "Hypotheses", objective: "Find the cause, not a guess.", submit: "The main prompt with the error and code.", ask: () => "Give the likely causes and how to confirm each. Do not write a fix yet.", expect: "Ranked causes with checks.", done: "You ran the checks and know which cause it is." },
            { at: "standard", name: "Fix", objective: "Fix the confirmed cause.", submit: "The results of the checks.", ask: () => "Here is what the checks showed. Write the fix and the test as the main prompt says.", expect: "A fix and a test.", done: "The problem is gone and the test passes when you run it." }
        ],
        refine: ["technical", "missing"],
        quality: ["The cause was confirmed before the fix.", "The fix is small and you understand it.", "A test now covers the case.", "Nothing unrelated changed."],
        prepare: { required: ["The exact error message or log.", "Steps that reproduce it.", "The code involved."], optional: ["What changed recently.", "What you already tried.", "The files you suspect."] },
        next: ["Run the full test suite, not only the new test.", "Write down the cause in the commit message.", "Report it with the Prompt Builder task \"a defect report and analysis\" if others need to know."]
    },

    "code-review": {
        deliverable: "a code review",
        categories: [{ id: "coding" }, { id: "testing" }, { id: "assistants" }],
        depth: "standard",
        questions: [
            code("The code or diff to review", { essential: true }),
            area("purpose", "What the change is meant to do", { essential: true, rows: 2 }),
            stack,
            choose("focus", "Focus", ["Everything", "Correctness and bugs", "Security", "Performance", "Readability and maintainability", "Tests"]),
            area("standards", "Team standards to check against", { rows: 3 })
        ],
        brief: (a) => ({
            goal: `Review this change. It is meant to: ${a.purpose}`,
            context: [["Stack", a.stack], ["Team standards", a.standards], ["Code", a.code]],
            requirements: [
                a.focus && a.focus !== "Everything" ? `Focus on ${a.focus.toLowerCase()}, then note anything serious outside it.` : "Check correctness, edge cases, security, performance, readability and tests.",
                "For each finding give the location, the problem, why it matters, a severity (blocking, should fix, suggestion) and a concrete fix.",
                "Say what is good about the change too, briefly.",
                "Do not rewrite the whole code; comment on it."
            ],
            format: ["Findings ordered by severity, as a table or list."]
        }),
        stages: [
            { at: "standard", name: "Review", objective: "Findings you can act on.", submit: "The main prompt with the diff.", ask: () => "Review the change as specified.", expect: "Findings by severity.", done: "Each finding is clear enough to fix." },
            { at: "detailed", name: "Verify the findings", objective: "Remove false alarms.", submit: "Nothing new.", ask: () => "For each blocking or should-fix finding, show the input or situation that makes it fail. Withdraw any you cannot show.", expect: "Evidence per finding.", done: "Each remaining finding has a failure case." }
        ],
        refine: ["technical", "consistency"],
        quality: ["Each finding points to a line and a concrete fix.", "Blocking findings have a real failure case.", "You checked each finding yourself before acting on it."],
        prepare: { required: ["The diff or the code.", "What the change should do."], optional: ["The team's coding standards.", "The related tests."] },
        next: ["Fix the blocking findings first.", "Add tests for the cases the review found.", "Keep a human reviewer in the loop for anything security-related."]
    },

    refactor: {
        deliverable: "a refactoring",
        categories: CATS,
        depth: "detailed",
        questions: [
            code("The code to refactor", { essential: true }),
            area("goal", "Why refactor it", { essential: true, rows: 2, placeholder: "The function is 300 lines and hard to test" }),
            stack,
            choose("tests", "Existing tests", ["There are tests for this code", "There are no tests", "Not sure"]),
            area("keep", "What must not change", { rows: 2, placeholder: "The public API and the output format" })
        ],
        brief: (a) => ({
            goal: `Refactor this code so that: ${a.goal}`,
            context: [["Stack", a.stack], ["Must not change", a.keep], ["Tests", a.tests], ["Code", a.code]],
            requirements: [
                "Keep the behaviour exactly the same; the refactoring changes structure only.",
                a.tests === "There are tests for this code" ? "The existing tests must pass unchanged." : "First write characterisation tests that pin today's behaviour, then refactor.",
                "Work in small steps, each one safe on its own, and explain each step.",
                ASK_NOT_GUESS
            ],
            format: ["The steps, then the final code per file, then what to run to check nothing changed."]
        }),
        stages: [
            { at: "standard", name: "Safety net", objective: "Pin the current behaviour.", submit: "The code and its tests, if any.", ask: () => "Write or list the tests that pin the current behaviour before any change.", expect: "Tests.", done: "The tests pass on the old code." },
            { at: "standard", name: "Refactor in steps", objective: "Restructure safely.", submit: "Confirmation the tests pass.", ask: () => "Refactor in small steps, giving the code after each step.", expect: "Steps and code.", done: "The tests pass after every step." }
        ],
        refine: ["technical", "consistency"],
        quality: ["Behaviour is unchanged: the same tests pass.", "Each step is small enough to review.", "Nothing that had to stay the same changed."],
        prepare: { required: ["The code and anything that calls it.", "The existing tests, or time to write some."], optional: ["Performance numbers if speed matters."] },
        next: ["Commit after each safe step.", "Ask for a review of the final structure."]
    },

    "api-design": {
        deliverable: "an API design",
        categories: CATS,
        depth: "detailed",
        questions: [
            area("purpose", "What the API must let clients do", { essential: true, rows: 4 }),
            area("data", "The main resources and fields", { rows: 4, placeholder: "Order: id, items, coupon, total, status" }),
            choose("style", "Style", ["REST with JSON", "GraphQL", "gRPC", "Not decided: compare the options"]),
            text("consumers", "Who calls it", { placeholder: "Our web app and a mobile app" }),
            choose("output", "What you need", [
                { value: "a design to review", label: "A design to review" },
                { value: "an OpenAPI specification", label: "An OpenAPI specification" },
                { value: "documentation for the API", label: "Documentation for an existing API" }
            ], { essential: true })
        ],
        brief: (a) => ({
            goal: `Design an API for the following, and give me ${a.output}: ${a.purpose}`,
            context: [["Resources", a.data], ["Style", a.style], ["Consumers", a.consumers]],
            requirements: [
                "Define resources, operations, request and response shapes, status codes, errors (one consistent format), pagination, filtering, versioning and authentication.",
                "Name things consistently and say how the API changes without breaking clients.",
                "List open questions rather than inventing business rules."
            ],
            format: [/OpenAPI/.test(a.output) ? "A valid OpenAPI 3 document in YAML, then notes." : "Endpoints in a table, then examples of each request and response."]
        }),
        stages: [
            { at: "standard", name: "Resources and operations", objective: "Agree the shape.", submit: "The main prompt.", ask: () => "List resources and operations only, with questions.", expect: "A resource list.", done: "The list matches what clients need." },
            { at: "standard", name: "Full design", objective: "The deliverable.", submit: "Answers.", ask: (a) => `Write ${a.output}.`, expect: "The design.", done: "Every operation has its errors defined." }
        ],
        refine: ["consistency", "technical", "completeness"],
        quality: ["Errors use one format everywhere.", "Breaking changes have a versioning answer.", "Every field has a type and is required or optional."],
        prepare: { required: ["What clients must be able to do."], optional: ["Existing endpoints to stay consistent with."] },
        next: ["Review it with the people who will call it.", "Test it with the Prompt Builder task \"API tests\"."]
    },

    "tech-docs": {
        deliverable: "technical documentation",
        categories: [{ id: "coding" }, { id: "writing" }, { id: "assistants" }],
        depth: "standard",
        questions: [
            choose("kind", "Kind of document", [
                { value: "a README", label: "README" },
                { value: "a setup and installation guide", label: "Setup and installation guide" },
                { value: "an architecture overview", label: "Architecture overview" },
                { value: "a how-to guide", label: "How-to guide" },
                { value: "a reference for an API or module", label: "Reference for an API or module" },
                { value: "release notes", label: "Release notes" }
            ], { essential: true }),
            area("subject", "What it documents", { essential: true, long: true, rows: 5, hint: "Paste the code, notes or facts the document must be based on." }),
            text("readers", "Who reads it", { placeholder: "New developers joining the team" }),
            stack
        ],
        brief: (a) => ({
            goal: `Write ${a.kind} for the following.`,
            context: [["Readers", a.readers], ["Stack", a.stack], ["Material", a.subject]],
            requirements: [
                "Base every statement on the material I gave; mark anything you had to assume.",
                "Commands and code must be exact and copyable.",
                "Start with what the reader is trying to do."
            ],
            format: ["Markdown with headings, short paragraphs and code blocks."]
        }),
        stages: [
            { at: "standard", name: "Outline", objective: "Agree the structure.", submit: "The main prompt.", ask: () => "Give an outline only.", expect: "An outline.", done: "It covers what readers need." },
            { at: "standard", name: "Write", objective: "The document.", submit: "Outline approval.", ask: () => "Write the document from the outline.", expect: "The document.", done: "Someone new could follow it." }
        ],
        refine: ["accuracy", "clarity", "completeness"],
        quality: ["Every command was run and works.", "Nothing is stated that the material does not support.", "A new reader can follow it without asking."],
        prepare: { required: ["The code or facts to document."], optional: ["An existing document to match the style of."] },
        next: ["Ask someone new to follow it and note where they stop.", "Keep it next to the code so it changes with it."]
    }

};
