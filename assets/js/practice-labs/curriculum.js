/* =========================================================
   ToolZen Hub
   Practice Labs learning paths: the curriculum structure

   Plain data and pure helpers; the site build turns them into pages (practice-labs/learn-html.js) and nothing here touches
   the DOM. A path has levels (beginner, intermediate, advanced), a level has modules and a module has lessons. A lesson is
   published only when its content exists: `lesson` names the id in the path's content source (for SQL, the lessons of the
   SQL Practice Lab, with the extra teaching sections in sql-extras.js). Planned subjects are named in departments.js, never
   here: a path exists in this list only when it has published lessons. Nothing here claims a path is finished that is not.

   URL: /practice-labs/<path>/<level>/<module>/<lesson>/ (docs/practice-labs-platform.md section 3).
========================================================= */

import { SITE_ROOT } from "../routes.js";

export const LEVELS = Object.freeze({
    beginner: { title: "Beginner", order: 1, summary: "No experience assumed. The ideas and the first working queries." },
    intermediate: { title: "Intermediate", order: 2, summary: "Combine, summarise and change data, the work most jobs ask for." },
    advanced: { title: "Advanced", order: 3, summary: "Analytical queries, structure and reliability." }
});

/* status: "building" = some lessons are published and more are planned; "planned" = not started, no pages */
export const PATHS = Object.freeze([
    {
        id: "sql",
        title: "SQL",
        department: "database-engineering",
        status: "complete",
        tagline: "Learn to read and write database queries, from your first SELECT to window functions, with every example and exercise running in your browser.",
        audience: "Complete beginners, testers who check data, analysts and anyone preparing for a data or QA role.",
        runsIn: "Queries run for real in your browser (SQLite compiled to WebAssembly). Nothing you type is sent anywhere.",
        outcomes: [
            "Read any table and predict what a query returns",
            "Filter, sort, group and summarise data",
            "Join several tables and answer business questions",
            "Change data safely and understand constraints, views, indexes and transactions"
        ],
        levels: [
            {
                id: "beginner",
                modules: [
                    {
                        id: "fundamentals",
                        title: "SQL Fundamentals",
                        summary: "What a database is, how to read a table with SELECT, how to calculate in a query and how to read an error.",
                        lessons: [
                            { id: "databases", slug: "what-is-a-database", title: "Databases, tables, rows and columns" },
                            { id: "select", slug: "select-and-from", title: "SELECT and FROM" },
                            { id: "expressions", slug: "calculations-aliases-functions", title: "Calculations, aliases and functions" },
                            { id: "errors", slug: "reading-errors", title: "Reading errors and finding mistakes" }
                        ]
                    },
                    {
                        id: "filtering-sorting",
                        title: "Filtering and Sorting",
                        summary: "Choose the rows you want, put them in order and deal with missing values.",
                        lessons: [
                            { id: "where", slug: "filtering-with-where", title: "Filtering rows with WHERE" },
                            { id: "sorting", slug: "sorting-limiting-distinct", title: "Sorting, limiting and removing repeats" },
                            { id: "nulls", slug: "missing-values-null", title: "Missing values: NULL" }
                        ]
                    }
                ]
            },
            {
                id: "intermediate",
                modules: [
                    {
                        id: "summarising",
                        title: "Summarising Data",
                        summary: "Turn many rows into totals, counts and averages, and label values with CASE.",
                        lessons: [
                            { id: "case", slug: "case-expressions", title: "CASE: choosing a value by condition" },
                            { id: "aggregates", slug: "aggregates-group-by-having", title: "Summarising: aggregates, GROUP BY and HAVING" },
                            { id: "dates-and-text", slug: "working-with-dates-and-text", title: "Working with dates and text" }
                        ]
                    },
                    {
                        id: "combining",
                        title: "Combining Data",
                        summary: "Bring several tables, queries and steps together.",
                        lessons: [
                            { id: "joins", slug: "joining-tables", title: "Joining tables" },
                            { id: "subqueries", slug: "subqueries-exists-with", title: "Subqueries, EXISTS and WITH" },
                            { id: "union", slug: "combining-results-with-union", title: "Combining results with UNION" }
                        ]
                    },
                    {
                        id: "changing-data",
                        title: "Changing Data and Real-World SQL",
                        summary: "Add, change and delete rows, clean untidy data and know how other databases differ.",
                        lessons: [
                            { id: "changing", slug: "insert-update-delete", title: "Changing data: INSERT, UPDATE and DELETE" },
                            { id: "cleaning", slug: "cleaning-data", title: "Cleaning data with SQL" },
                            { id: "dialects", slug: "sqlite-and-other-databases", title: "SQLite and other databases" }
                        ]
                    }
                ]
            },
            {
                id: "advanced",
                modules: [
                    {
                        id: "analytics",
                        title: "Analytical Queries",
                        summary: "Rank rows, keep running totals and compare each row with its neighbours and its group, without collapsing the data.",
                        lessons: [
                            { id: "windows", slug: "window-functions", title: "Window functions" },
                            { id: "running-totals", slug: "running-totals-and-moving-averages", title: "Running totals and moving averages" },
                            { id: "lag-lead-ranking", slug: "lag-lead-and-ranking", title: "Comparing rows: LAG, LEAD and ranking" }
                        ]
                    },
                    {
                        id: "recursion-performance",
                        title: "Recursive Queries and Performance",
                        summary: "Walk hierarchies and generate sequences with recursive queries, read query plans and make slow queries fast.",
                        lessons: [
                            { id: "recursive-ctes", slug: "recursive-ctes", title: "Recursive CTEs" },
                            { id: "query-plans", slug: "reading-query-plans", title: "Reading a query plan" },
                            { id: "query-tuning", slug: "writing-faster-queries", title: "Writing faster queries" }
                        ]
                    },
                    {
                        id: "reliability",
                        title: "Structure and Reliability",
                        summary: "Constraints, views and indexes, and transactions that keep data correct.",
                        lessons: [
                            { id: "design", slug: "tables-constraints-views-indexes", title: "Tables, constraints, views and indexes" },
                            { id: "transactions", slug: "transactions", title: "Transactions" }
                        ]
                    }
                ]
            }
        ],
        /* nothing announced as still to come: the path is complete (lessons, projects, interview practice) */
        coming: []
    },
    {
        id: "ai-foundations",
        title: "AI and LLM Foundations",
        department: "ai-engineering",
        status: "complete",
        tagline: "Understand how AI and language models work, from tokens and context windows to retrieval, evaluation and agents, with interactive visualizers that run in your browser.",
        audience: "Anyone who uses AI tools at work, developers starting with AI features and testers who must evaluate them. No maths or programming is needed.",
        runsIn: "Visualizers are deterministic teaching models that run in your browser with small hand-made data and the real formulas; no AI model runs, nothing is downloaded and nothing you type is sent anywhere.",
        outcomes: ["Explain tokens, context windows and sampling", "Describe how embeddings and retrieval-augmented generation work", "Design an evaluation set for an AI feature", "Read precision, recall and a confusion matrix", "Recognise hallucination, prompt injection, agent and privacy risks"],
        levels: [
            { id: "beginner", modules: [
                { id: "how-ai-works", title: "How AI and Language Models Work", summary: "What AI and machine learning are, how models read text as tokens, context windows and prompts, and how sampling chooses words.", lessons: [
                    { id: "ai-what-is-ai", slug: "what-is-ai", title: "What AI, machine learning and generative AI are" },
                    { id: "ai-tokens", slug: "tokens", title: "How language models read text: tokens" },
                    { id: "ai-context", slug: "context-windows-and-prompts", title: "Context windows and prompts" },
                    { id: "ai-sampling", slug: "temperature-and-sampling", title: "Temperature and sampling" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "building-and-evaluating", title: "Building and Evaluating AI Features", summary: "Embeddings and retrieval-augmented generation, evaluation sets for AI features, and testing for hallucination and prompt injection.", lessons: [
                    { id: "ai-embeddings-rag", slug: "embeddings-and-rag", title: "Embeddings and retrieval-augmented generation" },
                    { id: "ai-evaluation", slug: "evaluating-ai-features", title: "Evaluating AI features" },
                    { id: "ai-hallucination", slug: "hallucination-and-prompt-injection", title: "Hallucination and prompt injection" }] }
            ] },
            { id: "advanced", modules: [
                { id: "metrics-agents-responsibility", title: "Metrics, Agents and Responsible AI", summary: "Classification metrics and thresholds, tool-using agents and their guardrails, and privacy, bias and transparency.", lessons: [
                    { id: "ai-metrics", slug: "precision-recall-and-thresholds", title: "Classification metrics: precision, recall and the threshold" },
                    { id: "ai-agents", slug: "tools-and-agents", title: "Tools, agents and their risks" },
                    { id: "ai-responsible", slug: "responsible-ai", title: "Responsible AI: privacy, bias and transparency" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "statistics",
        title: "Statistics and Data Analysis",
        department: "data-analytics",
        status: "complete",
        tagline: "Describe, clean and compare data with confidence: averages, spread, outliers, grouping, correlation, A/B tests and clear charts, calculated on real tables and checked in your browser.",
        audience: "Analysts, business users and testers who work with reports, and anyone preparing for data roles. Basic arithmetic is enough; Excel function names are given for every calculation.",
        runsIn: "Every calculation is checked in your browser against an answer computed from the same table, at the precision the question asks for. Nothing you type is stored or sent.",
        outcomes: ["Choose and calculate the right average and measure of spread", "Find percentiles and flag outliers", "Build grouped summaries and percentages", "Clean a messy dataset in a documented way", "Interpret correlation, regression and A/B test results", "Choose an honest chart and present a finding"],
        levels: [
            { id: "beginner", modules: [
                { id: "describing-data", title: "Describing Data", summary: "Variables and types, averages, spread and percentiles, calculated on a table of ShopLite orders.", lessons: [
                    { id: "st-data-basics", slug: "data-variables-and-types", title: "Data, variables and types" },
                    { id: "st-averages", slug: "mean-median-mode", title: "Averages: mean, median and mode" },
                    { id: "st-spread", slug: "range-and-standard-deviation", title: "Spread: range and standard deviation" },
                    { id: "st-percentiles", slug: "percentiles-and-outliers", title: "Percentiles, quartiles and outliers" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "analysing-data", title: "Analysing Data", summary: "Grouped summaries and pivot tables, a documented cleaning pass, and correlation with a simple regression line.", lessons: [
                    { id: "st-grouping", slug: "grouping-and-pivots", title: "Counting, grouping and pivot summaries" },
                    { id: "st-cleaning", slug: "cleaning-data", title: "Cleaning data before analysis" },
                    { id: "st-correlation", slug: "correlation-and-regression", title: "Correlation and simple regression" }] }
            ] },
            { id: "advanced", modules: [
                { id: "deciding-with-data", title: "Deciding with Data", summary: "Samples, A/B tests and significance read correctly, and charts and findings that lead to decisions.", lessons: [
                    { id: "st-ab-testing", slug: "ab-tests-and-significance", title: "Samples, A/B tests and significance" },
                    { id: "st-presenting", slug: "charts-and-presenting", title: "Choosing charts and presenting findings" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "playwright",
        title: "Playwright with TypeScript",
        department: "automation-engineering",
        status: "complete",
        tagline: "Automate browser tests with Playwright: user-facing locators, web-first assertions and reliable tests, practised on ShopLite with locators you can try in your browser.",
        audience: "Testers moving into automation and developers who write end-to-end tests. Manual testing basics help; the TypeScript you need is taught.",
        runsIn: "Locator practice runs in your browser on ShopLite with a labelled teaching evaluator; quizzes are checked in the page. Real Playwright tests run on your own computer with Node.js, as the setup lesson shows.",
        outcomes: ["Explain where automation helps and where it does not", "Set up a Playwright project and run tests", "Find elements with user-facing locators that satisfy strict mode", "Write complete tests with web-first assertions"],
        levels: [
            { id: "beginner", modules: [
                { id: "automation-basics", title: "Automation and Playwright Basics", summary: "What to automate, how Playwright works, and a first project on your machine.", lessons: [
                    { id: "pw-what-is-automation", slug: "what-is-test-automation", title: "What test automation is (and is not)" },
                    { id: "pw-why-playwright", slug: "how-playwright-works", title: "Playwright and how it works" },
                    { id: "pw-setup", slug: "setup-and-first-run", title: "Setting up and running your first test" }] },
                { id: "just-enough-typescript", title: "Just Enough TypeScript", summary: "The TypeScript that test code needs, above all async and await.", lessons: [
                    { id: "pw-typescript", slug: "typescript-for-testers", title: "Just enough TypeScript for tests" }] },
                { id: "first-tests", title: "First Tests: Locators and Assertions", summary: "Find elements like a user, check outcomes with retrying assertions and put them together in a test.", lessons: [
                    { id: "pw-locators", slug: "locators", title: "Locators: finding elements like a user" },
                    { id: "pw-assertions", slug: "web-first-assertions", title: "Web-first assertions" },
                    { id: "pw-first-test", slug: "writing-a-complete-test", title: "Writing a complete test" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "interacting", title: "Interacting with Pages", summary: "Actions and forms, and waiting for the right events instead of fixed times.", lessons: [
                    { id: "pw-actions-forms", slug: "actions-and-forms", title: "Actions and forms" },
                    { id: "pw-navigation-waiting", slug: "navigation-and-waiting", title: "Navigation and waiting" }] },
                { id: "organising-tests", title: "Organising Tests", summary: "Hooks, fixtures and page objects that keep a suite readable and maintainable.", lessons: [
                    { id: "pw-hooks-fixtures", slug: "hooks-and-fixtures", title: "Hooks, fixtures and test structure" },
                    { id: "pw-page-objects", slug: "page-object-model", title: "The Page Object Model" }] },
                { id: "network-api", title: "Network and API", summary: "Mock network responses with page.route to test rare situations, and test APIs directly with the request fixture.", lessons: [
                    { id: "pw-network-api", slug: "network-mocking-and-api-testing", title: "Network mocking and API testing" }] }
            ] },
            { id: "advanced", modules: [
                { id: "reliability-scale", title: "Reliability and Scale", summary: "Debug and fix flaky tests, configure projects and parallel runs, and run in CI.", lessons: [
                    { id: "pw-debugging-flaky", slug: "debugging-and-flaky-tests", title: "Debugging and fixing flaky tests" },
                    { id: "pw-config-parallel", slug: "configuration-and-parallel-runs", title: "Configuration, projects and parallel runs" },
                    { id: "pw-reports-ci", slug: "reports-and-ci", title: "Reports and running in CI" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "test-design",
        title: "Test Design Techniques",
        department: "software-testing",
        status: "complete",
        tagline: "Design fewer, sharper tests: equivalence partitions, boundary values, decision tables, state transitions, pairwise and error guessing, practised with exercises that check every value you choose.",
        audience: "Testers who know the basics and want systematic techniques, and anyone preparing for testing interviews or certification-style questions.",
        runsIn: "The exercises are the Test Design Lab's own, checked in your browser; nothing you enter is uploaded.",
        outcomes: ["Partition inputs into valid and invalid classes", "Choose two-value and three-value boundary tests", "Build decision tables and state models and derive tests from them", "Cut configuration tests with pairwise and add experience-based tests"],
        levels: [
            { id: "beginner", modules: [{ id: "partitions-boundaries", title: "Partitions and Boundaries", summary: "The two techniques every tester uses daily, with exercises checked value by value.", lessons: [
                { id: "td-partitions", slug: "equivalence-partitioning", title: "Equivalence partitioning" },
                { id: "td-boundaries", slug: "boundary-value-analysis", title: "Boundary value analysis" }] }] },
            { id: "intermediate", modules: [{ id: "tables-states", title: "Decision Tables and State Transitions", summary: "Techniques for rules that combine conditions and for behaviour that depends on history.", lessons: [
                { id: "td-decision-tables", slug: "decision-tables", title: "Decision tables" },
                { id: "td-state-transition", slug: "state-transition-testing", title: "State transition testing" }] }] },
            { id: "advanced", modules: [{ id: "combinations-experience", title: "Combinations and Experience", summary: "Pairwise testing for configurations, use cases and error guessing, and advanced mixed practice.", lessons: [
                { id: "td-pairwise", slug: "pairwise-testing", title: "Pairwise testing" },
                { id: "td-use-case-error-guessing", slug: "use-cases-error-guessing", title: "Use-case testing, error guessing and mixed practice" }] }] }
        ],
        coming: []
    },
    {
        id: "manual-testing",
        title: "Manual Software Testing",
        department: "software-testing",
        status: "complete",
        tagline: "Learn to test software from zero: requirements, test scenarios and test cases, bug reports and test planning, practised on ShopLite, a shop with real seeded bugs.",
        audience: "Complete beginners, people starting a career in testing, and developers who want to test their own work better.",
        runsIn: "Everything runs in your browser: quizzes, writing labs that check your test cases and bug reports, and ShopLite, a practice shop whose test release hides ten bugs. Nothing you write is uploaded.",
        outcomes: [
            "Explain how testing fits into software development and the testing life cycle",
            "Read a requirement critically and turn it into test scenarios and test cases",
            "Choose test data with positive and negative values at the boundaries",
            "Find, describe and report defects that developers can act on"
        ],
        levels: [
            {
                id: "beginner",
                modules: [
                    {
                        id: "what-testing-is",
                        title: "What Testing Is",
                        summary: "What testing is for, the seven principles every tester uses, and the difference between examining a document and running the software.",
                        lessons: [
                            { id: "mt-what-is-testing", slug: "what-is-software-testing", title: "What software testing is" },
                            { id: "mt-principles", slug: "seven-testing-principles", title: "Seven principles of testing" },
                            { id: "mt-static-dynamic", slug: "static-and-dynamic-testing", title: "Static and dynamic testing" }
                        ]
                    },
                    {
                        id: "life-cycle",
                        title: "Testing in the Life Cycle",
                        summary: "How development life cycles shape testing, the phases of the testing life cycle and the four test levels.",
                        lessons: [
                            { id: "mt-sdlc", slug: "software-development-life-cycles", title: "Software development life cycles" },
                            { id: "mt-stlc", slug: "software-testing-life-cycle", title: "The software testing life cycle" },
                            { id: "mt-test-levels", slug: "test-levels", title: "Test levels" }
                        ]
                    },
                    {
                        id: "writing-test-cases",
                        title: "Writing Test Cases",
                        summary: "From a requirement to questions, scenarios and precise test cases, with positive and negative data, checked by writing labs.",
                        lessons: [
                            { id: "mt-reading-requirements", slug: "reading-requirements", title: "Reading a requirement like a tester" },
                            { id: "mt-test-scenarios", slug: "test-scenarios", title: "Test scenarios" },
                            { id: "mt-test-cases", slug: "writing-test-cases", title: "Writing a good test case" },
                            { id: "mt-positive-negative", slug: "positive-and-negative-testing", title: "Positive and negative testing" }
                        ]
                    }
                ]
            },
            {
                id: "intermediate",
                modules: [
                    {
                        id: "test-data-coverage",
                        title: "Test Data and Coverage",
                        summary: "Choose data that finds defects and show what has been tested with a traceability matrix.",
                        lessons: [
                            { id: "mt-test-data", slug: "choosing-test-data", title: "Choosing test data" },
                            { id: "mt-traceability", slug: "coverage-and-traceability", title: "Coverage and the traceability matrix" }
                        ]
                    },
                    {
                        id: "executing-reporting",
                        title: "Executing Tests and Reporting Bugs",
                        summary: "Run tests and record results honestly, write bug reports developers can act on, and follow a defect through its life cycle.",
                        lessons: [
                            { id: "mt-execution", slug: "executing-tests", title: "Executing tests and recording results" },
                            { id: "mt-bug-reports", slug: "writing-bug-reports", title: "Writing a bug report developers can act on" },
                            { id: "mt-bug-life-cycle", slug: "bug-life-cycle", title: "The bug life cycle" }
                        ]
                    },
                    {
                        id: "types-of-testing",
                        title: "Types of Testing",
                        summary: "Functional and non-functional testing, and when to run smoke, sanity and regression tests.",
                        lessons: [
                            { id: "mt-functional-nonfunctional", slug: "functional-and-non-functional-testing", title: "Functional and non-functional testing" },
                            { id: "mt-smoke-sanity-regression", slug: "smoke-sanity-regression-testing", title: "Smoke, sanity and regression testing" },
                            { id: "mt-exploratory", slug: "exploratory-testing-bug-hunt", title: "Exploratory testing and the bug hunt" },
                            { id: "mt-usability-compatibility", slug: "usability-and-compatibility-testing", title: "Usability and compatibility testing" }
                        ]
                    }
                ]
            },
            {
                id: "advanced",
                modules: [
                    {
                        id: "planning-risk",
                        title: "Test Planning and Risk",
                        summary: "Write a test plan a whole team can agree on, and spend testing effort where risk is highest.",
                        lessons: [
                            { id: "mt-test-plan", slug: "writing-a-test-plan", title: "Writing a test plan" },
                            { id: "mt-risk", slug: "risk-based-testing", title: "Risk-based testing" }
                        ]
                    },
                    {
                        id: "agile-metrics",
                        title: "Agile Testing and Metrics",
                        summary: "Test inside Agile teams, express requirements as testable examples and report progress and risk honestly.",
                        lessons: [
                            { id: "mt-agile", slug: "testing-in-agile", title: "Testing in Agile and Scrum teams" },
                            { id: "mt-acceptance-criteria", slug: "acceptance-criteria-given-when-then", title: "Acceptance criteria and Given/When/Then" },
                            { id: "mt-metrics", slug: "test-metrics-and-reporting", title: "Test metrics and reporting" }
                        ]
                    }
                ]
            }
        ],
        coming: []
    }
]);

export const PRACTICE_LABS_PREFIX = `${SITE_ROOT}practice-labs/`;

export const getPath = (id) => PATHS.find((path) => path.id === id) ?? null;
export const publishedPaths = () => PATHS.filter((path) => path.status !== "planned");

export const pathUrl = (path) => `${PRACTICE_LABS_PREFIX}${path.id}/`;
export const levelUrl = (path, level) => `${pathUrl(path)}${level.id}/`;
export const moduleUrl = (path, level, module) => `${levelUrl(path, level)}${module.id}/`;
export const lessonUrl = (path, level, module, lesson) => `${moduleUrl(path, level, module)}${lesson.slug}/`;

/** Every lesson of a path in teaching order, each with the level and module it belongs to and its position. */
export function flatLessons(path) {

    const list = [];

    for (const level of path.levels) {
        for (const module of level.modules) {
            for (const lesson of module.lessons) {
                list.push({ path, level, module, lesson, number: list.length + 1 });
            }
        }
    }

    return list.map((entry, index, all) => ({
        ...entry,
        total: all.length,
        previous: all[index - 1] ?? null,
        next: all[index + 1] ?? null
    }));

}

export const lessonCount = (scope) => scope.levels
    ? scope.levels.reduce((sum, level) => sum + lessonCount(level), 0)
    : scope.modules
        ? scope.modules.reduce((sum, module) => sum + module.lessons.length, 0)
        : scope.lessons.length;
