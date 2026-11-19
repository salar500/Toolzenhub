/* =========================================================
   ToolZen Hub
   AI Prompt Builder blueprints: software testing (Stage 4)

   Test plan, scenarios and cases, API tests, automation,
   regression, defect reports and performance plans. Nothing here
   assumes a stack or a tool: what the visitor did not name is asked
   for or written as a placeholder.
========================================================= */

import { text, area, choose, more, when } from "./shared.js";

const CATS = [{ id: "testing" }, { id: "assistants" }, { id: "coding" }];

const feature = area("feature", "What is being tested", { essential: true, rows: 4, hint: "The feature, change or system, in a few sentences.", placeholder: "Checkout: a signed-in customer applies a coupon code to the basket before paying." });
const requirements = area("requirements", "Requirements or acceptance criteria", { long: true, rows: 5, hint: "Paste them as written, or say they are not written down yet.", placeholder: "AC1: a valid code reduces the total by its value\nAC2: an expired code shows \"This code has expired\"" });
const stack = text("stack", "Technology and test tools", { hint: "Only what is really used, for example \"React web app, Playwright, GitHub Actions\". Leave empty if you do not know.", placeholder: "React web app, REST API, Playwright" });
const risk = area("risk", "Known risks or past defects", { rows: 3, hint: "Where it has broken before, or what would hurt users most.", placeholder: "Coupons stacked twice last release; payment rounding on discounts" });

const NO_GUESS = "Do not assume a language, framework, tool or environment I have not named; ask, or mark the assumption clearly.";

export const BLUEPRINTS = {

    "test-plan": {
        deliverable: "a test plan",
        categories: CATS,
        depth: "standard",
        questions: [
            feature,
            requirements,
            choose("scope", "Kind of testing in scope", ["Functional", "Functional and regression", "Functional, regression and non-functional (performance, security, accessibility)", "End-to-end release testing"], { essential: true }),
            text("environments", "Environments, devices and browsers", { placeholder: "Staging; Chrome, Safari; Android and iPhone" }),
            stack,
            more(text("timeline", "Timeline and people", { placeholder: "2 testers, 5 working days before the 20th" })),
            more(risk)
        ],
        brief: (a) => ({
            goal: `Write a test plan for the following: ${a.feature}`,
            context: [["Requirements", a.requirements], ["Testing in scope", a.scope], ["Environments", a.environments], ["Timeline and people", a.timeline], ["Known risks", a.risk], ["Technology and tools", a.stack]],
            requirements: [
                "Cover scope and out of scope, approach per test type, entry and exit criteria, environments and test data, roles, schedule, risks with mitigations, and deliverables.",
                "Trace each requirement or acceptance criterion to the testing that covers it.",
                "Prioritise by risk: say what is tested first and what is dropped if time runs out.",
                NO_GUESS
            ],
            format: ["Headings for each part of the plan.", "A table mapping requirements to tests.", "A short list of open questions at the end."],
            avoid: ["Generic text that does not apply to this feature."]
        }),
        stages: [
            { at: "standard", name: "Understand the scope", objective: "Agree what is and is not being tested.", submit: "The main prompt with the requirements pasted in.", ask: () => "Before writing the plan, list: what is in scope, what is out of scope, the requirements you will trace, and every question or ambiguity you see in the requirements. Wait for my answers.", expect: "Scope, out of scope and a list of questions.", done: "You have answered the questions and the scope is agreed." },
            { at: "standard", name: "Draft the plan", objective: "Get the complete plan.", submit: "Your answers to the questions.", ask: () => "Using my answers, write the full test plan as specified in the main prompt.", expect: "The full plan with the traceability table.", done: "Every section of the plan is present." },
            { at: "detailed", name: "Risk review", objective: "Make sure the riskiest areas get the most testing.", submit: "Nothing new.", ask: () => "Rank the features and flows in the plan by risk (likelihood of failure times impact on users). Show where the plan's effort does not match the risk and propose changes.", expect: "A risk ranking and proposed changes.", done: "The effort follows the risk." },
            { at: "multi", name: "Schedule and exit criteria", objective: "Make the plan executable in the time available.", submit: "The real dates and people if they changed.", ask: (a) => `Turn the plan into a day-by-day schedule${when(" for", a.timeline)} with owners, and make the exit criteria measurable (for example "no open critical defects; all high-priority cases run").`, expect: "A schedule and measurable exit criteria.", done: "Each day has work and an owner; each exit criterion can be checked." }
        ],
        refine: ["completeness", "missing", "structure", "consistency"],
        quality: ["Every requirement maps to at least one test.", "Out of scope is written down, so nobody assumes it was tested.", "Entry and exit criteria are measurable.", "The riskiest flows are tested first."],
        prepare: { required: ["The requirements or acceptance criteria, as written.", "The release date and who will test."], optional: ["Defects from earlier releases.", "Environment and test data details.", "Your team's test plan template, if there is one."] },
        next: ["Review the open questions with the product owner before testing starts.", "Turn the plan into scenarios and cases (the Prompt Builder task \"test scenarios and test cases\").", "Keep the plan with the release and update it when scope changes."]
    },

    "test-cases": {
        deliverable: "test scenarios and test cases",
        categories: CATS,
        depth: "standard",
        questions: [
            feature,
            requirements,
            choose("technique", "Design technique", ["Let the AI choose and say why", "Equivalence partitioning and boundary values", "Decision table", "State transitions", "Use cases and user journeys", "Exploratory charters"]),
            choose("format", "Case format", [
                { value: "numbered steps with expected results", label: "Steps and expected results" },
                { value: "Given / When / Then scenarios (BDD)", label: "Given / When / Then (BDD)" },
                { value: "a table I can import into a test management tool", label: "A table for a test management tool" }
            ], { essential: true }),
            text("data", "Rules and limits that matter", { hint: "Field limits, roles, values, statuses.", placeholder: "Code is 6-12 characters; one code per order; minimum basket ₹500" }),
            risk
        ],
        brief: (a) => ({
            goal: `Design test scenarios and then test cases for: ${a.feature}`,
            context: [["Requirements", a.requirements], ["Rules and limits", a.data], ["Known risks", a.risk]],
            requirements: [
                a.technique && a.technique !== "Let the AI choose and say why" ? `Use ${a.technique.toLowerCase()}.` : "Choose the design techniques that fit and name the technique next to each scenario.",
                "Cover positive, negative, boundary and error cases; include the cases a careless implementation would get wrong.",
                "Give each case an id, a priority (high, medium, low) and the requirement it covers.",
                "Each case has preconditions, test data, steps and an expected result that can be checked exactly.",
                NO_GUESS
            ],
            format: [`Cases as ${a.format}.`,"Scenarios first as a short list, then the cases grouped by scenario.", "End with a coverage summary: requirement, number of cases, gaps."],
            avoid: ["Vague expected results such as \"works correctly\"."]
        }),
        stages: [
            { at: "standard", name: "Scenarios", objective: "Agree what to test before writing steps.", submit: "The main prompt.", ask: () => "List the test scenarios only (one line each, with the technique and the requirement it covers). Point out any requirement that is ambiguous or untestable. Wait for my review.", expect: "A scenario list and the ambiguities.", done: "You have removed, added or approved scenarios." },
            { at: "standard", name: "Test cases", objective: "Get executable cases.", submit: "Your approved scenario list.", ask: (a) => `Write the test cases for the approved scenarios, as ${a.format}.`, expect: "Cases with ids, priorities, data, steps and expected results.", done: "Each approved scenario has cases." },
            { at: "detailed", name: "Gap check", objective: "Find what is still untested.", submit: "Nothing new.", ask: () => "Check the cases for gaps: missing boundaries, invalid inputs, roles and permissions, concurrency, interruptions (refresh, back, timeout), and accessibility. Add cases for each real gap.", expect: "New cases for the gaps.", done: "No category above is left without a case or a stated reason." }
        ],
        refine: ["completeness", "technical", "consistency", "missing"],
        quality: ["Each expected result can be checked exactly, without judgement.", "Boundaries are tested on both sides.", "Every requirement has a case; untestable ones are reported.", "Test data is concrete, not \"valid data\"."],
        prepare: { required: ["The requirements or acceptance criteria.", "The field rules and limits."], optional: ["Screenshots or a link to the feature.", "Your test management tool's import format."] },
        next: ["Review the cases with a developer for missing technical edge cases.", "Import them into your test management tool or tracker.", "Automate the stable, high-priority ones (the Prompt Builder task \"automate tests\")."]
    },

    "api-testing": {
        deliverable: "API test cases",
        categories: CATS,
        depth: "standard",
        questions: [
            area("api", "The API: endpoints, methods and what they do", { essential: true, long: true, rows: 5, hint: "Paste the specification (OpenAPI, Postman collection) or describe the endpoints.", placeholder: "POST /orders creates an order; GET /orders/{id} returns it; auth: bearer token" }),
            area("contract", "Request and response examples or schema", { long: true, rows: 4, placeholder: "{ \"items\": [...], \"couponCode\": \"SAVE10\" } -> 201 { \"id\": \"...\", \"total\": 450 }" }),
            choose("auth", "Authentication", ["None", "API key", "Bearer token (OAuth or JWT)", "Session cookie", "Other or not sure"]),
            choose("output", "What you need", ["Test cases in a table", "Test cases and a Postman collection outline", "Test cases and automated tests in the tool I name"]),
            text("tool", "Test tool and language, if automating", { showIf: (a) => /automated/.test(a.output), hint: "Only what you use. Leave empty to be asked.", placeholder: "Playwright with TypeScript" })
        ],
        brief: (a) => ({
            goal: `Design API tests for this API:\n${a.api}`,
            context: [["Contract or examples", a.contract], ["Authentication", a.auth], ["Tool and language", a.tool]],
            requirements: [
                "Cover status codes, response schema, required and optional fields, invalid and missing input, boundary values, authentication and authorisation (no token, expired token, another user's resource), idempotency where it applies, and error messages.",
                "Give each case the request (method, path, headers, body), the expected status and the exact checks on the response.",
                /automated/.test(a.output) ? `Write the automated tests${when(" in", a.tool)}, one test per case, with clear names and no hard-coded secrets.` : "",
                "Do not invent endpoints or fields that are not in the API I gave; list what you need to know instead.",
                NO_GUESS
            ],
            format: ["A table of cases: id, request, expected status, checks, priority.", /Postman collection/.test(a.output) ? "Then an outline of the Postman collection: folders, the requests in run order, the variables each request needs or sets, and the tests in each request." : "", /automated/.test(a.output) ? "Then the test code in one block per file." : "", "Open questions about the contract at the end."]
        }),
        stages: [
            { at: "standard", name: "Contract questions", objective: "Close gaps in the API description.", submit: "The main prompt with the specification.", ask: () => "List what is unclear or missing in the API description (status codes, error format, limits, auth rules) before designing tests. Wait for my answers.", expect: "A list of contract questions.", done: "The contract is clear enough to test." },
            { at: "standard", name: "Test cases", objective: "Get the case table.", submit: "Your answers.", ask: () => "Write the API test cases as specified.", expect: "The case table.", done: "Each endpoint has positive, negative and auth cases." },
            { at: "detailed", name: "Automation", objective: "Turn the cases into code.", submit: "Your project's existing test setup, if any (folder layout, base URL handling).", ask: (a) => `Write automated tests for the high-priority cases${when(" in", a.tool)}. Read the base URL and credentials from environment variables.`, expect: "Test code and how to run it.", done: "The tests run against a test environment." }
        ],
        refine: ["technical", "completeness", "missing"],
        quality: ["Every endpoint has negative and authorisation cases, not only the happy path.", "Expected results check the body, not only the status code.", "No secret or token is written into the tests.", "Nothing in the tests uses an endpoint or field that does not exist."],
        prepare: { required: ["The API specification or a description of each endpoint.", "A test environment and test credentials (never production)."], optional: ["Example requests and responses.", "The error format the API uses."] },
        next: ["Run the cases against a test environment and record the failures.", "Add the automated tests to your CI pipeline.", "Report defects with the Prompt Builder task \"a defect report and analysis\"."]
    },

    "test-automation": {
        deliverable: "automated tests",
        categories: CATS,
        depth: "detailed",
        questions: [
            area("cases", "The test cases or flows to automate", { essential: true, long: true, rows: 5, placeholder: "1. Sign in with a valid account\n2. Add two items to the basket\n3. Apply code SAVE10\nExpected: total reduced by 10%" }),
            text("tool", "Automation tool and language", { essential: true, hint: "What your project uses, for example \"Playwright with TypeScript\" or \"Selenium with Java\".", placeholder: "Playwright with TypeScript" }),
            area("project", "Existing test setup", { rows: 3, hint: "Folder layout, page objects, fixtures, how tests run.", placeholder: "tests/e2e, page objects in tests/pages, run with npx playwright test" }),
            area("locators", "How elements can be found", { rows: 3, hint: "data-testid attributes, roles and labels, or paste the HTML of the screen.", placeholder: "Buttons have accessible names; inputs have labels; data-testid on the basket rows" }),
            text("ci", "Where the tests run", { placeholder: "GitHub Actions on every pull request" })
        ],
        brief: (a) => ({
            goal: `Write ${a.tool} tests that automate the following:\n${a.cases}`,
            context: [["Tool and language", a.tool], ["Existing setup", a.project], ["Finding elements", a.locators], ["Where the tests run", a.ci]],
            requirements: [
                "Follow the existing setup I described; do not introduce a new framework or pattern without asking.",
                "Prefer locators by role, label or test id over CSS paths and text that changes; never use fixed sleeps, wait for conditions instead.",
                "Each test is independent: its own data, no order dependence, and it cleans up after itself.",
                "Assert the expected results exactly as the cases state them.",
                "Read URLs and credentials from configuration or environment variables, never from the code."
            ],
            format: ["One code block per file with its path.", "Then how to run the tests and what each one checks."],
            avoid: ["Selectors for elements you have not seen; ask me for the HTML instead."]
        }),
        stages: [
            { at: "standard", name: "Design", objective: "Agree the structure before code.", submit: "The main prompt and your setup details.", ask: () => "Propose the test structure: files, helpers or page objects, test data and fixtures, and the locator for each element. List anything you need from me (HTML, test accounts). Do not write the tests yet.", expect: "A structure and a list of needs.", done: "You have approved the structure and supplied what it needs." },
            { at: "standard", name: "Write the tests", objective: "Get working test code.", submit: "The HTML of the screens or the locators, and approval of the design.", ask: () => "Write the tests as designed.", expect: "Test files and run instructions.", done: "The tests run locally." },
            { at: "detailed", name: "Make them reliable", objective: "Remove flakiness before CI.", submit: "The output of a few runs, especially any failure.", ask: () => "Here are the results of running the tests several times. Find the causes of any flaky or slow test (timing, shared state, data, locators) and fix them without weakening the assertions.", expect: "Fixes with the cause of each.", done: "Several runs in a row pass." },
            { at: "multi", name: "CI integration", objective: "Run them automatically.", submit: "Your CI configuration file.", ask: (a) => `Add the tests to the CI pipeline${when(" (", a.ci, ")")}: install, run, keep the report and traces on failure.`, expect: "The CI changes.", done: "The pipeline runs the tests on a change." }
        ],
        refine: ["technical", "consistency", "missing"],
        quality: ["No fixed waits or sleeps.", "Locators survive a copy change or a layout change.", "Each test passes on its own and in any order.", "Assertions check the real expected result, not just that a page loaded.", "No credentials in the code."],
        prepare: { required: ["The test cases, with exact expected results.", "The HTML of each screen, or its locators.", "A test environment and test account."], optional: ["An existing test from the project to copy the style of.", "The CI configuration file."] },
        next: ["Run the suite several times before trusting it.", "Review the code with a teammate: readability decides whether tests are maintained.", "Add each new high-priority case to the suite as the feature grows."]
    },

    regression: {
        deliverable: "a regression test plan",
        categories: CATS,
        depth: "standard",
        questions: [
            area("change", "What changed in this release", { essential: true, rows: 4, placeholder: "New coupon engine; payment provider SDK updated; basket page redesigned" }),
            area("areas", "The product's main areas and flows", { rows: 4, placeholder: "Sign-up, search, product page, basket, checkout, orders, account" }),
            text("time", "Time available", { essential: true, placeholder: "One day, two testers" }),
            choose("automation", "Existing automated coverage", ["None", "Some smoke tests", "A good share of the main flows", "Not sure"]),
            risk
        ],
        brief: (a) => ({
            goal: `Plan the regression testing for a release with these changes:\n${a.change}`,
            context: [["Main areas and flows", a.areas], ["Time available", a.time], ["Automated coverage", a.automation], ["Known risks", a.risk]],
            requirements: [
                "Analyse the impact: which areas each change can affect directly and indirectly.",
                "Select and prioritise regression tests by that impact and by user risk; say what is left out and why.",
                "Separate what automation already covers from what needs manual testing.",
                "Fit the plan into the time available."
            ],
            format: ["An impact table: change, areas affected, risk.", "A prioritised checklist of regression tests.", "What is not tested in this cycle."]
        }),
        stages: [
            { at: "standard", name: "Impact analysis", objective: "See what each change can break.", submit: "The main prompt.", ask: () => "Give only the impact table first and the questions you have about the changes.", expect: "The impact table and questions.", done: "The table matches what the developers say changed." },
            { at: "standard", name: "Regression checklist", objective: "A plan that fits the time.", submit: "Corrections to the impact table.", ask: (a) => `Write the prioritised regression checklist that fits ${a.time}.`, expect: "A checklist in priority order.", done: "The checklist fits the time." }
        ],
        refine: ["completeness", "missing"],
        quality: ["Each change has its affected areas listed.", "The highest-risk flows are at the top.", "What is not tested is written down and accepted."],
        prepare: { required: ["The release notes or the list of merged changes.", "How much time and how many people you have."], optional: ["Defects found in the last releases.", "A list of the existing automated tests."] },
        next: ["Confirm the impact table with a developer.", "Record what was run and what failed, for the release decision.", "Add a test for every defect the regression finds."]
    },

    defect: {
        deliverable: "a defect report",
        categories: CATS,
        depth: "standard",
        questions: [
            area("observed", "What happened", { essential: true, rows: 3, placeholder: "Applying SAVE10 twice reduces the total by 20%" }),
            area("expected", "What should have happened", { essential: true, rows: 2, placeholder: "The second attempt is refused: \"A code is already applied\"" }),
            area("steps", "Steps to reproduce", { essential: true, rows: 4, placeholder: "1. Add any item\n2. Apply SAVE10\n3. Apply SAVE10 again" }),
            text("environment", "Environment", { placeholder: "Staging, build 2.14.0, Chrome 131 on Windows 11" }),
            area("evidence", "Logs, errors or response bodies", { long: true, rows: 4, hint: "Remove passwords, tokens and personal data first." }),
            choose("need", "What you need", ["A clear defect report", "A report and a likely cause", "A report, a likely cause and the regression tests to add"])
        ],
        brief: (a) => ({
            goal: "Write a defect report from my notes below, ready for the tracker.",
            context: [["What happened", a.observed], ["What should happen", a.expected], ["Steps", a.steps], ["Environment", a.environment], ["Evidence", a.evidence]],
            requirements: [
                "A title that names the behaviour and the place, not \"bug in checkout\".",
                "Numbered steps, the expected and actual results, the environment, a suggested severity with the reason, and the evidence.",
                /cause/.test(a.need) ? "Then, separately, the most likely causes in order, each with what would confirm or rule it out. Mark them as hypotheses." : "",
                /regression/.test(a.need) ? "Then the regression tests that would have caught it." : "",
                "Use only what my notes say; mark anything missing as missing."
            ],
            format: ["The report in the order: title, summary, steps, expected, actual, environment, severity, evidence."]
        }),
        stages: [
            { at: "standard", name: "Report", objective: "A report a developer can act on.", submit: "The main prompt.", ask: () => "Write the report.", expect: "A complete report.", done: "Someone else could reproduce it from the report alone." },
            { at: "detailed", name: "Cause and tests", objective: "Help the fix and prevent a repeat.", submit: "Any new evidence.", ask: () => "List the likely causes with how to confirm each, and the tests to add once it is fixed.", expect: "Hypotheses and tests.", done: "Each hypothesis has a way to confirm it." }
        ],
        refine: ["completeness", "clarity"],
        quality: ["The steps reproduce it from a clean start.", "Expected and actual results are both stated.", "No password, token or personal data is in the report.", "Causes are labelled as hypotheses."],
        prepare: { required: ["The exact steps, tried at least twice.", "The build or version and the environment."], optional: ["A screenshot or recording.", "Logs or the response body, with secrets removed."] },
        next: ["Reproduce it once more from the report before filing.", "Attach the evidence to the tracker.", "Add the regression test when it is fixed."]
    },

    "performance-test": {
        deliverable: "a performance test plan",
        categories: CATS,
        depth: "detailed",
        questions: [
            area("system", "The system and the flows to test", { essential: true, rows: 4, placeholder: "Checkout API: add to basket, apply coupon, pay" }),
            area("targets", "Targets", { essential: true, rows: 3, hint: "Users, requests per second, response time limits; or say they are not defined.", placeholder: "500 concurrent users; 95% of requests under 800 ms" }),
            text("tool", "Load test tool", { placeholder: "k6 (or not decided)" }),
            text("environment", "Test environment", { placeholder: "Staging, half the size of production" }),
            choose("kind", "Kind of test", ["Load", "Stress", "Spike", "Soak (endurance)", "Several of these"])
        ],
        brief: (a) => ({
            goal: `Write a performance test plan for: ${a.system}`,
            context: [["Targets", a.targets], ["Tool", a.tool], ["Environment", a.environment], ["Kind of test", a.kind]],
            requirements: [
                "Define the workload model (user journeys, mix, think time, ramp-up), the test types, the metrics (response time percentiles, throughput, error rate, resource use) and the pass criteria.",
                "Say how results from this environment relate to production and what cannot be concluded from them.",
                "Include test data needs and how to avoid caching distorting the results.",
                NO_GUESS
            ],
            format: ["Sections: objectives, workload model, scenarios, metrics and criteria, environment, data, risks, reporting."]
        }),
        stages: [
            { at: "standard", name: "Workload model", objective: "Agree what realistic load means.", submit: "Any real traffic figures you have.", ask: () => "Propose the workload model only, with the assumptions behind each number, and ask me for real figures where you assumed them.", expect: "A workload model and assumptions.", done: "Each number is a real figure or an accepted assumption." },
            { at: "standard", name: "The plan", objective: "The full plan.", submit: "Your answers.", ask: () => "Write the full plan.", expect: "The plan.", done: "Pass criteria are numeric." },
            { at: "detailed", name: "Scripts", objective: "Start the tests.", submit: "The tool you will use.", ask: (a) => `Write the load test scripts${when(" in", a.tool)} for the main scenario, with the thresholds from the criteria.`, expect: "Scripts and how to run them.", done: "A short run works against the test environment." }
        ],
        refine: ["technical", "missing"],
        quality: ["Pass criteria are numbers, not \"fast enough\".", "Assumptions in the workload model are marked.", "The plan says what the test environment cannot tell you about production."],
        prepare: { required: ["Targets or service levels, or agreement that they must be set.", "A test environment you may load (never production without approval)."], optional: ["Real traffic figures from monitoring.", "The architecture diagram."] },
        next: ["Get approval before generating load on any shared environment.", "Run a baseline before tuning anything.", "Compare runs with the same data and settings only."]
    },

    /* QA work before and after the tests (D22): what the retired QA Workbench helped produce, now as prompts. Nothing here
       keeps project records: results and defects come from the visitor, and nothing is reported as run. */
    "requirements-review": {
        deliverable: "a testability review of the requirements",
        categories: CATS,
        depth: "standard",
        questions: [
            feature,
            area("requirements", "Requirements or acceptance criteria", { essential: true, long: true, rows: 6, hint: "Paste them as written, with their ids if they have them.", placeholder: "AC1: a valid code reduces the total by its value\nAC2: an expired code shows an error" }),
            choose("focus", "What you need most", ["Ambiguities and questions for the product owner", "Testable acceptance criteria, rewritten", "Both, with the test conditions for each criterion"], { essential: true }),
            more(area("rules", "Business rules to respect", { rows: 2, placeholder: "Prices include GST; a code can be used once per customer" })),
            more(risk)
        ],
        brief: (a) => ({
            goal: `Review these requirements and acceptance criteria for testability before testing starts: ${a.feature}`,
            context: [["Requirements or acceptance criteria", a.requirements], ["What I need most", a.focus], ["Business rules", a.rules], ["Known risks", a.risk]],
            requirements: [
                "Check every requirement and criterion for ambiguity, missing conditions, untestable wording (fast, easy, user-friendly), contradictions, and missing negative and boundary cases.",
                "For each problem, quote the criterion, say what is unclear and write the question that would make it testable.",
                /rewritten|Both/.test(a.focus) ? "Rewrite each criterion that needs it as a testable statement (Given, When, Then where it fits), and mark every rewrite as a proposal for the owner to accept." : "",
                /Both/.test(a.focus) ? "List the test conditions each criterion needs: positive, negative and boundary." : "",
                "List any requirement that has no acceptance criterion.",
                "Use only the requirements I gave; do not invent business rules.",
                NO_GUESS
            ],
            format: ["A table: id, criterion as written, problem, question for the owner, proposed testable wording.", "Then the requirements with no criterion, and the open questions in priority order."]
        }),
        stages: [
            { at: "standard", name: "Review", objective: "Find what cannot be tested as written.", submit: "The main prompt with the requirements.", ask: () => "Review each requirement and criterion as the main prompt says. Do not rewrite anything yet.", expect: "The problems and the questions.", done: "Every criterion has been checked." },
            { at: "standard", name: "Testable criteria", objective: "Criteria a tester can verify.", submit: "The owner's answers, if you have them.", ask: () => "Using these answers, rewrite the criteria as testable statements and list the test conditions for each.", expect: "Rewritten criteria with test conditions.", done: "Each criterion has an observable pass or fail." }
        ],
        refine: ["completeness", "clarity"],
        quality: ["Every criterion was checked, not only the obvious ones.", "Each question names the criterion it is about.", "Rewritten criteria are proposals until the owner accepts them.", "No business rule was invented."],
        prepare: { required: ["The requirements or acceptance criteria, as written."], optional: ["Designs or mock-ups.", "Answers the product owner has already given."] },
        next: ["Send the questions to the product owner before test design.", "Design the tests with the Prompt Builder task \"test scenarios and test cases\".", "Keep the agreed criteria with the requirement."]
    },

    "release-readiness": {
        deliverable: "a release readiness assessment",
        categories: CATS,
        depth: "short",
        noFabrication: true,
        questions: [
            area("release", "What is being released", { essential: true, rows: 3, placeholder: "Version 2.15: coupon stacking rules and a new payment page" }),
            area("results", "Test results so far", { essential: true, long: true, rows: 5, hint: "As your tool reports them: planned, executed, passed, failed, blocked and not run, per area if you have it.", placeholder: "Planned 140, executed 128, passed 119, failed 6, blocked 3, not run 12 (performance)" }),
            area("defects", "Open defects", { rows: 4, hint: "Id, severity and title, one per line.", placeholder: "BUG-311 High: coupon applied twice on slow networks" }),
            area("criteria", "Exit criteria agreed for this release", { rows: 3, placeholder: "No open critical or high defects; every high-priority case executed" }),
            more(text("date", "Release date and who decides", { placeholder: "Thursday; the product owner decides" })),
            more(risk)
        ],
        brief: (a) => ({
            goal: `Assess whether this release is ready, from my test results and open defects: ${a.release}`,
            context: [["Test results", a.results], ["Open defects", a.defects], ["Exit criteria", a.criteria], ["Release date and decision owner", a.date], ["Known risks", a.risk]],
            requirements: [
                "Assess readiness only from the results and defects I gave: never invent a figure, and never treat a test that was not run as passed.",
                a.criteria ? "Check each exit criterion and say whether it is met, not met or cannot be judged from my data." : "No exit criteria are agreed: propose measurable ones first, marked as proposals, and judge against them.",
                "List what was not tested or not run, and the risk each gap leaves for users.",
                "Give a recommendation (release, release with conditions, or do not release) with its reasons; it is a recommendation for the person who decides, not a decision.",
                "Keep facts from my data apart from your judgement."
            ],
            format: ["Summary first: the recommendation and the three main reasons.", "Then a table of exit criteria (met, not met, cannot judge), the open defects by severity, the untested areas with their risk, and the conditions for release."],
            avoid: ["A readiness percentage or score that my data does not support."]
        }),
        stages: [],
        refine: ["completeness", "clarity"],
        quality: ["Every figure in the assessment is one you gave.", "Tests not run are reported as not run.", "The recommendation names who decides."],
        prepare: { required: ["The latest test results from your tool.", "The open defects with severity."], optional: ["The agreed exit criteria.", "The release date and the decision owner."] },
        next: ["Take the assessment to the person who decides, with the open defects.", "Record the decision and any accepted risks with the release.", "Write the report for stakeholders with the Prompt Builder task \"a QA test summary report\"."]
    },

    "qa-report": {
        deliverable: "a QA test summary report",
        categories: CATS,
        depth: "short",
        noFabrication: true,
        questions: [
            area("scope", "What was tested", { essential: true, rows: 3, placeholder: "Release 2.15: coupons, checkout and the new payment page; Chrome, Safari, Android" }),
            area("results", "Results", { essential: true, long: true, rows: 5, hint: "Planned, executed, passed, failed, blocked and not run, as your tool reports them.", placeholder: "Planned 140, executed 128, passed 119, failed 6, blocked 3, not run 12" }),
            area("defects", "Defects found and still open", { rows: 4, hint: "Id, severity, title and status, one per line." }),
            choose("audience", "Who reads it", ["The delivery team", "Managers and stakeholders", "A client or an auditor"], { essential: true }),
            more(text("period", "Period, build or sprint", { placeholder: "Sprint 24, build 2.15.0-rc2" })),
            more(area("notes", "Anything else to report", { rows: 2, placeholder: "The payment sandbox was down for a day; 3 cases blocked" }))
        ],
        brief: (a) => ({
            goal: `Write a test summary report for ${a.audience ? a.audience.charAt(0).toLowerCase() + a.audience.slice(1) : "the reader"} on: ${a.scope}`,
            context: [["Period or build", a.period], ["Results", a.results], ["Defects", a.defects], ["Other notes", a.notes]],
            requirements: [
                "Report only the results I gave: planned, executed, passed, failed, blocked and not run kept apart, as counts.",
                "Never write a percentage without the counts behind it, and never report a test as passed unless my results say so.",
                "Summarise the open defects by severity, and the risks they and any untested areas leave.",
                "End with the next steps and any decision the reader must make.",
                "Match the length and detail to the reader."
            ],
            format: ["Headed sections: summary, scope, results table, defects, risks, next steps."],
            avoid: ["Rounding away failures, or calling the release ready: readiness is the decision owner's."]
        }),
        stages: [],
        refine: ["clarity", "structure"],
        quality: ["Every count is one you gave.", "Not run and blocked are reported, not hidden.", "The summary matches the details."],
        prepare: { required: ["The results from your test tool.", "The defect list."], optional: ["The previous report, to keep the same structure."] },
        next: ["Check every count against your tool before sending.", "Attach or link the defect list.", "Keep the same structure every cycle."]
    }

};
