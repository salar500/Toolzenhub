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
        id: "javascript",
        title: "JavaScript Programming",
        department: "programming",
        status: "complete",
        tagline: "Learn to program with JavaScript from your first variable to problem solving and clean, tested code, writing real functions that run against tests in your browser.",
        audience: "Complete beginners to programming, testers preparing for automation and anyone getting ready for coding interviews. No installation is needed.",
        runsIn: "Your code runs in your own browser, in an isolated Web Worker with no network access, against each exercise's tests, and is stopped after 2 seconds if it does not finish. Nothing you write is stored or sent.",
        outcomes: ["Write functions with variables, conditions and loops", "Work with arrays, objects and strings", "Use map, filter, reduce and sort", "Validate input and debug errors", "Explain promises and async and await", "Solve classic interview problems and reason about complexity"],
        levels: [
            { id: "beginner", modules: [
                { id: "programming-basics", title: "Programming Basics", summary: "Values, variables, functions, conditions and loops, written and tested in your browser.", lessons: [
                    { id: "js-first-steps", slug: "values-variables-functions", title: "Values, variables and your first function" },
                    { id: "js-conditions", slug: "comparisons-and-conditions", title: "Comparisons and conditions" },
                    { id: "js-loops", slug: "loops", title: "Loops" }] },
                { id: "working-with-data", title: "Working with Data", summary: "Arrays, objects and strings, with the edge cases that break real programs.", lessons: [
                    { id: "js-arrays", slug: "arrays", title: "Arrays" },
                    { id: "js-objects-strings", slug: "objects-and-strings", title: "Objects and strings" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "modern-javascript", title: "Modern JavaScript", summary: "Array methods, errors and validation, and asynchronous code with promises and await.", lessons: [
                    { id: "js-array-methods", slug: "map-filter-reduce", title: "map, filter, reduce and sort" },
                    { id: "js-errors", slug: "errors-and-debugging", title: "Errors, validation and debugging" },
                    { id: "js-async", slug: "promises-and-await", title: "Asynchronous JavaScript: promises and await" }] }
            ] },
            { id: "advanced", modules: [
                { id: "writing-good-code", title: "Writing Good Code", summary: "Problem solving with complexity in mind, and clean, modular, unit-tested code.", lessons: [
                    { id: "js-problem-solving", slug: "problem-solving-and-complexity", title: "Problem solving and complexity" },
                    { id: "js-clean-code", slug: "clean-code-and-testing", title: "Clean code, modules and testing your code" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "http-apis",
        title: "HTTP and REST APIs",
        department: "web-backend",
        status: "complete",
        tagline: "Understand and use web APIs: methods, status codes, headers, JSON bodies, authentication, validation, REST design and API testing, with requests you build and send to a simulated ShopLite API.",
        audience: "Developers and testers who work with APIs, analysts who pull data from them and anyone heading to backend or full-stack work. No programming is needed for the request tasks.",
        runsIn: "Requests are answered by a model of ShopLite's API running inside the page, so results are repeatable; nothing is sent over the network.",
        outcomes: ["Read URLs and choose the right HTTP method", "Interpret status codes and error bodies", "Send headers, query parameters and JSON bodies", "Call protected endpoints with a bearer token", "Design REST endpoints and plan API tests", "Explain caching, rate limits and API security basics"],
        levels: [
            { id: "beginner", modules: [
                { id: "http-basics", title: "HTTP Basics", summary: "Clients, servers and URLs, methods, status codes, and query parameters, headers and JSON bodies, practised on a simulated API.", lessons: [
                    { id: "http-how-web-works", slug: "clients-servers-and-urls", title: "How the web works: clients, servers and URLs" },
                    { id: "http-methods", slug: "http-methods", title: "HTTP methods: GET, POST, PUT, PATCH and DELETE" },
                    { id: "http-status-codes", slug: "status-codes", title: "Status codes" },
                    { id: "http-query-headers", slug: "query-headers-and-json", title: "Query parameters, headers and JSON bodies" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "working-apis", title: "Working with Real APIs", summary: "Bearer tokens and authorisation, validation errors with field messages, and consistent REST design.", lessons: [
                    { id: "http-auth", slug: "authentication-and-authorisation", title: "Authentication and authorisation" },
                    { id: "http-validation", slug: "validation-errors", title: "Validation errors: 400, 415 and 422" },
                    { id: "http-rest-design", slug: "rest-api-design", title: "REST API design" }] }
            ] },
            { id: "advanced", modules: [
                { id: "quality-security", title: "Testing, Performance and Security", summary: "Planning and automating API tests, and caching, rate limits and the API security basics.", lessons: [
                    { id: "http-api-testing", slug: "testing-apis", title: "Testing APIs" },
                    { id: "http-performance-security", slug: "caching-rate-limits-and-security", title: "Caching, rate limits and API security" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "html-css-dom",
        title: "HTML, CSS and the DOM",
        department: "web-backend",
        status: "complete",
        tagline: "Build accessible, responsive web pages from first principles: semantic HTML, forms, CSS and layout, accessibility, the DOM and performance, with a playground that checks the page you build.",
        audience: "Beginners to web development, testers who want to understand the pages they test and developers filling gaps in front-end fundamentals.",
        runsIn: "Your HTML and CSS are shown in a sandbox with scripts switched off, and checked by reading the elements and computed styles of the page you built. Nothing is stored or sent.",
        outcomes: ["Write well-structured semantic HTML", "Build labelled, accessible forms and tables", "Style pages with the cascade and the box model", "Lay out responsive pages with flexbox and media queries", "Change the DOM safely with events", "Check pages for accessibility and performance"],
        levels: [
            { id: "beginner", modules: [
                { id: "html-foundations", title: "HTML Foundations", summary: "Elements and structure, links and images, semantic landmarks and forms, built in a checked playground.", lessons: [
                    { id: "web-html-basics", slug: "elements-and-structure", title: "HTML: elements and the structure of a page" },
                    { id: "web-links-images", slug: "links-and-images", title: "Links and images" },
                    { id: "web-semantic", slug: "semantic-html", title: "Semantic HTML and landmarks" },
                    { id: "web-forms", slug: "forms-and-inputs", title: "Forms and inputs" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "css-and-access", title: "CSS, Layout and Accessibility", summary: "Selectors, the cascade and the box model, flexbox and responsive layout, and the accessibility essentials.", lessons: [
                    { id: "web-css-basics", slug: "css-basics", title: "CSS: selectors, the cascade and the box model" },
                    { id: "web-layout", slug: "flexbox-and-responsive-design", title: "Layout with flexbox and responsive design" },
                    { id: "web-accessibility", slug: "accessibility-essentials", title: "Accessibility essentials" }] }
            ] },
            { id: "advanced", modules: [
                { id: "dynamic-and-fast", title: "Dynamic and Fast Pages", summary: "The DOM and events without cross-site scripting, and Core Web Vitals with quality checks.", lessons: [
                    { id: "web-dom-events", slug: "dom-and-events", title: "The DOM and events" },
                    { id: "web-performance", slug: "performance-and-quality", title: "Web performance and quality checks" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "git-devops",
        title: "Git and DevOps Foundations",
        department: "devops-cloud-security",
        status: "complete",
        tagline: "Use Git with confidence and understand how software is built, shipped and run: commits, branches, merges, pull requests, CI/CD, containers, cloud and monitoring, with Git practised in a simulator.",
        audience: "Developers and testers who are new to Git or want to understand the delivery pipeline, and anyone moving towards DevOps roles.",
        runsIn: "Git tasks run in a simulated repository inside the page that follows Git for the commands it supports; nothing touches your computer. Other lessons are checked with questions and ordering tasks.",
        outcomes: ["Stage, commit, unstage and discard changes", "Create, switch and merge branches", "Explain conflicts, remotes and pull requests", "Read a CI pipeline and a Dockerfile", "Explain cloud service models and shared responsibility", "Handle incidents with monitoring and blameless reviews"],
        levels: [
            { id: "beginner", modules: [
                { id: "git-basics", title: "Git Basics", summary: "Version control, the working tree, staging area and commits, and careful staging, practised in a Git simulator.", lessons: [
                    { id: "git-why", slug: "version-control-and-first-commit", title: "Version control and your first commit" },
                    { id: "git-staging", slug: "staging-unstaging-discarding", title: "Staging carefully, unstaging and discarding" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "git-teamwork", title: "Git for Teams", summary: "Branches and merging, switching safely, conflicts, remotes and pull requests.", lessons: [
                    { id: "git-branches", slug: "branches-and-merging", title: "Branches and merging" },
                    { id: "git-safety", slug: "conflicts-and-remotes", title: "Switching safely, conflicts and remotes" }] },
                { id: "delivery", title: "Continuous Delivery", summary: "Continuous integration, delivery pipelines and quality gates.", lessons: [
                    { id: "devops-ci-cd", slug: "ci-cd", title: "Continuous integration and delivery" }] }
            ] },
            { id: "advanced", modules: [
                { id: "running-software", title: "Running Software", summary: "Containers and Docker, cloud computing basics, and monitoring, logging and incidents.", lessons: [
                    { id: "devops-containers", slug: "containers-and-docker", title: "Containers and Docker" },
                    { id: "devops-cloud", slug: "cloud-basics", title: "Cloud computing basics" },
                    { id: "devops-monitoring", slug: "monitoring-and-incidents", title: "Monitoring, logging and incidents" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "app-security",
        title: "Application Security Foundations",
        department: "devops-cloud-security",
        status: "complete",
        tagline: "Find and fix the most common web application vulnerabilities by reading real code: injection, cross-site scripting, authentication, access control, secrets and security testing.",
        audience: "Developers, testers and anyone starting in security. Basic knowledge of web apps helps; the HTTP and REST APIs path is the ideal start.",
        runsIn: "Defensive code-review exercises checked in the page: you read vulnerable and fixed code and choose the right fix. No attack tools are used and nothing is sent anywhere.",
        outcomes: ["Threat-model a feature", "Recognise and fix SQL and command injection", "Prevent cross-site scripting", "Review password, session and access-control designs", "Keep secrets and configuration safe", "Plan and report security tests responsibly"],
        levels: [
            { id: "beginner", modules: [
                { id: "security-basics", title: "Security Basics", summary: "The security mindset with threat modelling, and injection in SQL and commands with the fixes.", lessons: [
                    { id: "sec-mindset", slug: "security-mindset-and-threat-modelling", title: "The security mindset and threat modelling" },
                    { id: "sec-injection", slug: "injection", title: "Injection: SQL and commands" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "web-risks", title: "Common Web Risks", summary: "Cross-site scripting, passwords and sessions, and access control, reviewed in real code.", lessons: [
                    { id: "sec-xss", slug: "cross-site-scripting", title: "Cross-site scripting" },
                    { id: "sec-auth", slug: "passwords-and-sessions", title: "Passwords, sessions and authentication" },
                    { id: "sec-access-control", slug: "access-control", title: "Access control" }] }
            ] },
            { id: "advanced", modules: [
                { id: "secure-delivery", title: "Secure Delivery", summary: "Secrets, configuration and dependencies, and security testing with responsible reporting.", lessons: [
                    { id: "sec-secrets-config", slug: "secrets-configuration-dependencies", title: "Secrets, configuration and dependencies" },
                    { id: "sec-testing", slug: "security-testing", title: "Security testing in practice" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "python",
        title: "Python Programming",
        department: "programming",
        status: "complete",
        tagline: "Learn Python from first functions to classes, files, problem solving and pytest, writing code that runs as real Python in your browser.",
        audience: "Beginners to programming, testers and analysts who want to script, and anyone preparing for data, AI or automation work.",
        runsIn: "Exercises run real Python (Pyodide: CPython compiled to WebAssembly) in an isolated worker in your browser. It loads only when you press Load Python (about 13 MB, once, then cached). Nothing you write is stored or sent.",
        outcomes: ["Write Python functions with conditions and loops", "Use lists, dictionaries, sets and strings", "Avoid scope and mutable-default traps", "Handle exceptions and validate input", "Write classes and work with files", "Solve problems efficiently and test with pytest"],
        levels: [
            { id: "beginner", modules: [
                { id: "python-basics", title: "Python Basics", summary: "Values, functions, conditions, arithmetic, loops, lists, dictionaries and sets, with code that runs as real Python.", lessons: [
                    { id: "py-first-steps", slug: "values-variables-functions", title: "Python basics: values, variables and functions" },
                    { id: "py-conditions-numbers", slug: "conditions-and-arithmetic", title: "Conditions and arithmetic" },
                    { id: "py-loops-lists", slug: "loops-lists-ranges", title: "Loops, lists and ranges" },
                    { id: "py-dicts-sets", slug: "dictionaries-sets-strings", title: "Dictionaries, sets and strings" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "python-in-depth", title: "Python in Depth", summary: "Scope, defaults and comprehensions, exceptions, classes, files and the standard library.", lessons: [
                    { id: "py-functions-scope", slug: "scope-defaults-comprehensions", title: "Functions in depth: scope, defaults and comprehensions" },
                    { id: "py-errors", slug: "exceptions-and-validation", title: "Exceptions and input validation" },
                    { id: "py-oop", slug: "classes-and-objects", title: "Classes and objects" },
                    { id: "py-files-modules", slug: "files-and-modules", title: "Files, modules and the standard library" }] }
            ] },
            { id: "advanced", modules: [
                { id: "python-professional", title: "Professional Python", summary: "Problem solving with the right data structures, and unit testing with pytest.", lessons: [
                    { id: "py-algorithms", slug: "problem-solving-and-complexity", title: "Problem solving and complexity in Python" },
                    { id: "py-testing", slug: "testing-with-pytest", title: "Testing Python code with pytest" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "java",
        title: "Java Programming",
        department: "programming",
        status: "complete",
        tagline: "Learn Java's types, strings, loops, methods, classes, inheritance, collections, exceptions and streams by reading real programs and predicting exactly what they print.",
        audience: "Beginners heading for Java back-end or Selenium with Java, and developers preparing for Java interviews. Earlier programming practice helps.",
        runsIn: "Java does not run in this page. Each program's output was recorded by compiling and running it with Java 17; you predict it exactly and the check compares your answer. To run Java yourself, install a JDK and use java Main.java.",
        outcomes: ["Predict integer division, string joining and equality", "Write methods and explain pass-by-value", "Design classes with encapsulation", "Use inheritance, interfaces and polymorphism", "Choose List, Set and Map", "Handle exceptions and read stream pipelines"],
        levels: [
            { id: "beginner", modules: [
                { id: "java-foundations", title: "Java Foundations", summary: "Types and output, strings, equality, null, conditions, loops and arrays.", lessons: [
                    { id: "java-basics", slug: "types-variables-output", title: "Java basics: types, variables and output" },
                    { id: "java-strings-conditions", slug: "strings-equality-conditions", title: "Strings, equality and conditions" },
                    { id: "java-loops-arrays", slug: "loops-and-arrays", title: "Loops and arrays" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "object-oriented-java", title: "Object-Oriented Java", summary: "Methods and pass-by-value, classes and encapsulation, inheritance and polymorphism, and collections.", lessons: [
                    { id: "java-methods", slug: "methods-and-pass-by-value", title: "Methods, overloading and pass-by-value" },
                    { id: "java-classes", slug: "classes-and-encapsulation", title: "Classes, objects and encapsulation" },
                    { id: "java-inheritance", slug: "inheritance-and-polymorphism", title: "Inheritance, interfaces and polymorphism" },
                    { id: "java-collections", slug: "collections", title: "Collections: List, Map and Set" }] }
            ] },
            { id: "advanced", modules: [
                { id: "modern-java", title: "Modern and Robust Java", summary: "Exceptions with try-with-resources, and streams, lambdas and JUnit tests.", lessons: [
                    { id: "java-exceptions", slug: "exceptions", title: "Exceptions and error handling" },
                    { id: "java-streams-testing", slug: "streams-and-junit", title: "Streams, lambdas and unit testing with JUnit" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "linux",
        title: "Linux and the Command Line",
        department: "devops-cloud-security",
        status: "complete",
        tagline: "Work confidently on Linux: navigate, read logs, search with grep and find, build pipelines, manage files and permissions, run services and write safe scripts, practised in a shell simulator.",
        audience: "Developers, testers, analysts and anyone who has to work on a server or in a container. No previous command-line experience is needed.",
        runsIn: "Commands run in a simulated shell inside the page, on a small model file system of a ShopLite server, following GNU behaviour for the commands it supports. Nothing touches your computer.",
        outcomes: ["Navigate with absolute and relative paths", "Read and search logs with tail, grep and find", "Build pipelines with pipes and redirection", "Manage files and permissions safely", "Inspect processes and services", "Write safe shell scripts"],
        levels: [
            { id: "beginner", modules: [
                { id: "command-line-basics", title: "Command-Line Basics", summary: "The file system, navigation, reading files and logs, and searching with grep and find, in a shell simulator.", lessons: [
                    { id: "lx-filesystem", slug: "file-system-and-navigation", title: "The Linux file system and navigation" },
                    { id: "lx-reading", slug: "reading-files-and-logs", title: "Reading files and logs" },
                    { id: "lx-searching", slug: "grep-and-find", title: "Searching with grep and find" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "working-with-files", title: "Working with Files", summary: "Pipes and redirection, managing files and folders, and users and permissions.", lessons: [
                    { id: "lx-pipes", slug: "pipes-and-redirection", title: "Pipes and redirection" },
                    { id: "lx-files", slug: "managing-files", title: "Managing files and folders" },
                    { id: "lx-permissions", slug: "users-and-permissions", title: "Users and permissions" }] }
            ] },
            { id: "advanced", modules: [
                { id: "operating-servers", title: "Operating Servers", summary: "Processes, services and environment variables, and safe shell scripts on a schedule.", lessons: [
                    { id: "lx-processes", slug: "processes-and-services", title: "Processes, services and environment" },
                    { id: "lx-scripting", slug: "shell-scripting", title: "Shell scripting basics" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "kubernetes",
        title: "Kubernetes and Deployment",
        department: "devops-cloud-security",
        status: "complete",
        tagline: "Run containers in production: Docker Compose stacks, Kubernetes deployments and services, configuration and health checks, safe release strategies and reliability targets.",
        audience: "Developers and DevOps learners who know container basics (the Git and DevOps Foundations path) and want to understand how services are deployed and kept running.",
        runsIn: "Manifests and compose files are read and explained in the page, with checked questions and ordering tasks. No cluster runs in your browser.",
        outcomes: ["Describe a multi-container stack with Compose", "Read Deployments and Services", "Configure apps with ConfigMaps, Secrets and probes", "Choose rolling, blue-green or canary releases", "Define SLIs, SLOs and error budgets"],
        levels: [
            { id: "intermediate", modules: [
                { id: "containers-at-scale", title: "Containers at Scale", summary: "Multi-container stacks with Docker Compose, and Kubernetes pods, deployments and services.", lessons: [
                    { id: "k8s-compose", slug: "docker-compose", title: "Multi-container apps with Docker Compose" },
                    { id: "k8s-objects", slug: "pods-deployments-services", title: "Kubernetes: pods, deployments and services" }] }
            ] },
            { id: "advanced", modules: [
                { id: "running-in-production", title: "Running in Production", summary: "Configuration, secrets and health checks, deployment strategies and rollbacks, and reliability targets.", lessons: [
                    { id: "k8s-config-health", slug: "config-secrets-health-checks", title: "Configuration, secrets and health checks" },
                    { id: "k8s-deploy-strategies", slug: "deployment-strategies", title: "Deployment strategies and rollbacks" },
                    { id: "k8s-reliability", slug: "slis-slos-error-budgets", title: "Reliability: SLIs, SLOs and error budgets" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "machine-learning",
        title: "Machine Learning Foundations",
        department: "ai-engineering",
        status: "complete",
        tagline: "Understand how machine learning works: regression, classification, decision trees, overfitting, clustering and neural networks, with interactive visualizers that run the real algorithms in your browser.",
        audience: "Analysts, developers and testers who want to understand ML systems, and anyone starting towards data science or AI engineering. Comfortable arithmetic is enough; no programming is needed.",
        runsIn: "Visualizers run the real algorithms (least squares, polynomial fitting, k-means, Gini impurity, thresholds) on small fixed datasets in your browser. No model is downloaded and nothing is sent.",
        outcomes: ["Frame problems as regression, classification or clustering", "Prepare features and avoid leakage", "Fit and interpret a regression line", "Choose thresholds with precision and recall", "Recognise and prevent overfitting", "Explain neural networks, transfer learning and drift"],
        levels: [
            { id: "beginner", modules: [
                { id: "ml-basics", title: "Machine Learning Basics", summary: "Types of learning, the project workflow, data and features, and linear regression with an interactive fit.", lessons: [
                    { id: "ml-what", slug: "what-machine-learning-is", title: "What machine learning is and how a project runs" },
                    { id: "ml-data", slug: "data-features-splits", title: "Data, features and train/test splits" },
                    { id: "ml-regression", slug: "linear-regression", title: "Linear regression and the error a model makes" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "models-and-evaluation", title: "Models and Evaluation", summary: "Classification thresholds, decision trees and ensembles, and overfitting with validation.", lessons: [
                    { id: "ml-classification", slug: "classification-and-thresholds", title: "Classification, thresholds and the confusion matrix" },
                    { id: "ml-trees", slug: "decision-trees-and-ensembles", title: "Decision trees and ensembles" },
                    { id: "ml-overfitting", slug: "overfitting-and-validation", title: "Overfitting, validation and model evaluation" }] }
            ] },
            { id: "advanced", modules: [
                { id: "beyond-the-basics", title: "Beyond the Basics", summary: "Clustering with k-means, neural networks and deep learning, and NLP, vision and production monitoring.", lessons: [
                    { id: "ml-clustering", slug: "k-means-clustering", title: "Clustering with k-means" },
                    { id: "ml-neural", slug: "neural-networks", title: "Neural networks and deep learning" },
                    { id: "ml-nlp-vision", slug: "nlp-vision-production", title: "NLP, computer vision and models in production" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "prompt-engineering",
        title: "Prompt Engineering",
        department: "ai-engineering",
        status: "complete",
        tagline: "Write prompts that give reliable, checkable results: prompt structure, few-shot examples, structured JSON outputs, tool calling, task chains, evaluation and prompt security.",
        audience: "Anyone who uses AI assistants at work, and developers and testers building or evaluating AI features. The AI and LLM Foundations path is a good start.",
        runsIn: "Prompts are checked against explicit rubrics and JSON outputs against schemas, in your browser. No AI model runs: model outputs shown are dated, written examples, and you play the model in the structured-output tasks.",
        outcomes: ["Write prompts with role, task, format and constraints", "Use few-shot examples well", "Specify and validate JSON outputs", "Produce and design tool calls", "Evaluate prompt versions on a test set", "Defend against prompt injection"],
        levels: [
            { id: "beginner", modules: [
                { id: "prompt-basics", title: "Prompt Basics", summary: "The anatomy of a good prompt and few-shot examples, written and checked against rubrics.", lessons: [
                    { id: "pe-anatomy", slug: "anatomy-of-a-prompt", title: "The anatomy of a good prompt" },
                    { id: "pe-examples", slug: "few-shot-prompting", title: "Few-shot prompting and examples" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "prompts-for-software", title: "Prompts for Software", summary: "Structured JSON outputs, tool calling and chains of small prompts.", lessons: [
                    { id: "pe-structured", slug: "structured-outputs", title: "Structured outputs and JSON schemas" },
                    { id: "pe-tools", slug: "tool-calling", title: "Tool calling and function definitions" },
                    { id: "pe-reasoning", slug: "steps-and-chains", title: "Breaking down tasks: steps, chains and reasoning" }] }
            ] },
            { id: "advanced", modules: [
                { id: "reliable-and-safe", title: "Reliable and Safe Prompts", summary: "Evaluating prompt versions, and defending against prompt injection.", lessons: [
                    { id: "pe-evaluation", slug: "evaluating-prompts", title: "Evaluating and iterating on prompts" },
                    { id: "pe-security", slug: "prompt-security", title: "Prompt security: injection and guardrails" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "backend",
        title: "Backend Fundamentals",
        department: "web-backend",
        status: "complete",
        tagline: "Build the server side properly: request handling, routing, validation, databases and transactions, pagination, authentication, money and idempotency, architecture and operations, with backend logic you code and test in your browser.",
        audience: "Developers moving into backend or full-stack work, and testers who want to understand what happens behind an API. The HTTP and REST APIs path and JavaScript basics come first.",
        runsIn: "Backend logic exercises run as real JavaScript against tests in an isolated worker in your browser, and HTTP behaviour is practised on a simulated ShopLite API inside the page. No server is needed and nothing is sent.",
        outcomes: ["Trace requests through middleware, routing and handlers", "Validate input and handle errors safely", "Use parameters, transactions and migrations", "Paginate and cache efficiently", "Authenticate and authorise every request", "Handle money and retries correctly and choose an architecture"],
        levels: [
            { id: "beginner", modules: [
                { id: "server-basics", title: "Server Basics", summary: "The request lifecycle, routing and handlers, and validation with error handling, coded and tested in your browser.", lessons: [
                    { id: "be-lifecycle", slug: "request-lifecycle", title: "How a backend handles a request" },
                    { id: "be-routing", slug: "routing-and-handlers", title: "Routing and handlers" },
                    { id: "be-validation", slug: "validation-and-errors", title: "Validation and error handling" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "data-and-identity", title: "Data and Identity", summary: "Databases from code, pagination and performance, and authentication with sessions and tokens.", lessons: [
                    { id: "be-databases", slug: "databases-from-code", title: "Talking to the database" },
                    { id: "be-pagination", slug: "pagination-and-performance", title: "Pagination, filtering and performance" },
                    { id: "be-auth", slug: "sessions-and-tokens", title: "Authentication, sessions and tokens" }] }
            ] },
            { id: "advanced", modules: [
                { id: "production-backends", title: "Production Backends", summary: "Money and idempotency, architecture with queues and services, and configuration and logging.", lessons: [
                    { id: "be-money-reliability", slug: "money-retries-idempotency", title: "Correctness: money, retries and idempotency" },
                    { id: "be-architecture", slug: "architecture", title: "Architecture: monoliths, services and queues" },
                    { id: "be-operations", slug: "configuration-and-logging", title: "Configuration, logging and twelve-factor apps" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "api-automation",
        title: "API Test Automation",
        department: "automation-engineering",
        status: "complete",
        tagline: "Automate API tests with Playwright's request fixture: requests and assertions, authentication, test data, schemas, data-driven and contract tests, frameworks and CI.",
        audience: "Testers and developers who know HTTP basics and want fast, reliable automated API checks. Playwright basics help.",
        runsIn: "Test code is checked in the page by reading it against explicit rules, not by running it; exploration tasks use a simulated ShopLite API inside the page. Run the tests in a real Playwright project against your own API.",
        outcomes: ["Decide what to automate at the API level", "Write Playwright API tests with exact assertions", "Test authentication positively and negatively", "Create and clean up test data", "Use schemas, data-driven tests and contracts", "Structure an API suite and run it in CI"],
        levels: [
            { id: "beginner", modules: [
                { id: "api-test-basics", title: "API Test Basics", summary: "Why API-level automation pays off, and requests with assertions in Playwright.", lessons: [
                    { id: "aa-why", slug: "why-api-automation", title: "Why automate at the API level" },
                    { id: "aa-requests", slug: "requests-and-assertions", title: "Requests and assertions with Playwright" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "reliable-api-suites", title: "Reliable API Suites", summary: "Authentication, test data and clean-up, and schemas, contracts and data-driven tests.", lessons: [
                    { id: "aa-auth-data", slug: "auth-and-test-data", title: "Authentication, test data and clean-up" },
                    { id: "aa-contracts", slug: "schemas-and-contracts", title: "Schemas, contracts and data-driven tests" }] }
            ] },
            { id: "advanced", modules: [
                { id: "api-frameworks", title: "API Frameworks", summary: "Client layers, API-assisted UI tests and running API tests in CI.", lessons: [
                    { id: "aa-framework-ci", slug: "frameworks-and-ci", title: "API test frameworks and CI" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "selenium",
        title: "Selenium WebDriver with Java",
        department: "automation-engineering",
        status: "complete",
        tagline: "Automate browsers with Selenium 4 and Java: WebDriver architecture, stable locators, explicit waits, frames and windows, JUnit lifecycles, page objects, Grid and CI.",
        audience: "Testers and developers on Java teams, and anyone maintaining an existing Selenium suite. The Java Programming path and manual testing basics come first.",
        runsIn: "Selenium does not run in the page. Code exercises are checked by reading your code against explicit rules, and other lessons use checked questions. Run the code in a Java project with Selenium 4 and JUnit 5.",
        outcomes: ["Explain WebDriver and browser drivers", "Choose stable locators", "Synchronise with explicit waits", "Handle frames, windows and alerts", "Structure tests with JUnit and page objects", "Run cross-browser on Grid and in CI"],
        levels: [
            { id: "beginner", modules: [
                { id: "webdriver-basics", title: "WebDriver Basics", summary: "How Selenium drives browsers, and finding elements with stable locators.", lessons: [
                    { id: "se-intro", slug: "how-selenium-works", title: "Selenium WebDriver and how it works" },
                    { id: "se-locators", slug: "locators", title: "Locators and finding elements" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "robust-selenium", title: "Robust Selenium Tests", summary: "Explicit waits, actions with frames and windows, and JUnit with page objects.", lessons: [
                    { id: "se-waits", slug: "waits-and-synchronisation", title: "Waits and synchronisation" },
                    { id: "se-actions", slug: "actions-frames-windows", title: "Actions, forms, frames and windows" },
                    { id: "se-junit-pom", slug: "junit-and-page-objects", title: "JUnit structure and the Page Object Model" }] }
            ] },
            { id: "advanced", modules: [
                { id: "selenium-at-scale", title: "Selenium at Scale", summary: "Cross-browser runs, Selenium Grid and headless CI.", lessons: [
                    { id: "se-grid-ci", slug: "grid-and-ci", title: "Cross-browser runs, Grid and CI" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "database-design",
        title: "Database Design and Testing",
        department: "database-engineering",
        status: "complete",
        tagline: "Design databases that keep data correct: modelling, keys and relationships, normalisation, constraints, indexes, transactions and isolation, PostgreSQL and MySQL differences, and database testing, with SQL you run in your browser.",
        audience: "Developers, testers and analysts who already write basic SQL and want to design schemas, reason about integrity and concurrency, and test data. The SQL path's beginner level comes first.",
        runsIn: "Playgrounds run real SQLite (sql.js, the same engine as the SQL Practice Lab) in your browser on a fresh copy of the ShopLite tables; edit the SQL and run it again. Nothing is saved or sent.",
        outcomes: ["Model entities and relationships", "Enforce integrity with keys and constraints", "Normalise to third normal form", "Read query plans and choose indexes", "Explain transactions, isolation and locking", "Handle dialect differences and test data integrity"],
        levels: [
            { id: "beginner", modules: [
                { id: "designing-schemas", title: "Designing Schemas", summary: "Entities and relationships, primary and foreign keys, and normalisation, with SQL you run.", lessons: [
                    { id: "dd-modelling", slug: "data-modelling", title: "Data modelling: entities, attributes and relationships" },
                    { id: "dd-keys", slug: "keys-and-integrity", title: "Primary keys, foreign keys and referential integrity" },
                    { id: "dd-normalisation", slug: "normalisation", title: "Normalisation: 1NF, 2NF and 3NF" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "rules-speed-safety", title: "Rules, Speed and Safety", summary: "Constraints, indexes and query plans, and transactions with isolation and locking.", lessons: [
                    { id: "dd-constraints", slug: "constraints", title: "Constraints: NOT NULL, UNIQUE, CHECK and DEFAULT" },
                    { id: "dd-indexes", slug: "indexes-and-plans", title: "Indexes and query plans" },
                    { id: "dd-transactions", slug: "transactions-and-isolation", title: "Transactions, isolation and locking" }] }
            ] },
            { id: "advanced", modules: [
                { id: "databases-in-practice", title: "Databases in Practice", summary: "PostgreSQL, MySQL and SQLite differences, and database testing with integrity checks.", lessons: [
                    { id: "dd-dialects", slug: "postgresql-mysql-sqlite", title: "PostgreSQL, MySQL and SQLite: the differences that matter" },
                    { id: "dd-testing", slug: "database-testing", title: "Database testing and data integrity checks" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "specialised-testing",
        title: "Specialised Testing",
        department: "software-testing",
        status: "complete",
        tagline: "Go beyond functional testing: integration, API, database, accessibility, acceptance, performance and mobile testing, plus defect management and blameless root-cause analysis, practised on ShopLite with real engines.",
        audience: "Testers who know the fundamentals (the Manual Software Testing path) and want the specialist skills that experienced QA roles ask for.",
        runsIn: "Practice runs in your browser: API requests on a simulated ShopLite API, SQL on real SQLite with the ShopLite tables, accessibility fixes in a script-free HTML playground and a root-cause analysis checked against a rubric. Nothing is sent.",
        outcomes: ["Plan integration tests with stubs and drivers", "Design and run API test cases", "Verify stored data with SQL", "Test accessibility with keyboard and WCAG criteria", "Organise UAT and performance tests", "Triage defects and run blameless root-cause analyses"],
        levels: [
            { id: "intermediate", modules: [
                { id: "beyond-the-ui", title: "Beyond the UI", summary: "Integration, API, database and accessibility testing, and user acceptance testing.", lessons: [
                    { id: "sp-integration", slug: "integration-testing", title: "Integration testing" },
                    { id: "sp-api-testing", slug: "api-testing", title: "API testing for testers" },
                    { id: "sp-db-testing", slug: "database-testing", title: "Database testing for testers" },
                    { id: "sp-accessibility", slug: "accessibility-testing", title: "Accessibility testing" },
                    { id: "sp-uat", slug: "user-acceptance-testing", title: "User acceptance testing" }] }
            ] },
            { id: "advanced", modules: [
                { id: "quality-at-scale", title: "Quality at Scale", summary: "Performance testing, defect management with root-cause analysis, and mobile and cross-device testing.", lessons: [
                    { id: "sp-performance", slug: "performance-testing", title: "Performance testing basics" },
                    { id: "sp-rca-defects", slug: "defects-and-root-cause", title: "Defect management and root-cause analysis" },
                    { id: "sp-mobile", slug: "mobile-testing", title: "Mobile and cross-device testing" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "excel",
        title: "Excel Formulas",
        department: "data-analytics",
        status: "complete",
        tagline: "Learn Excel formulas from references to lookups, cleaning and financial models, practising every one of the Excel Practice Lab's 55 exercises on a real formula engine in your browser.",
        audience: "Analysts, office professionals, students and anyone who uses spreadsheets at work. No previous formula knowledge is needed.",
        runsIn: "Exercises use the Excel Practice Lab's formula engine in your browser: each formula is calculated, then tried on a second set of numbers to catch typed-in results. Nothing is stored or sent.",
        outcomes: ["Write formulas with correct references", "Use counting, rounding and logical functions", "Build conditional sums and counts", "Work with text and dates", "Combine tables with lookups", "Clean data and build budget and payroll models"],
        levels: [
            { id: "beginner", modules: [
                { id: "formula-foundations", title: "Formula Foundations", summary: "Formulas and references, everyday functions and logical functions, on real sheets.", lessons: [
                    { id: "xlp-references", slug: "formulas-and-references", title: "Formulas, operators and references" },
                    { id: "xlp-functions", slug: "everyday-functions", title: "Everyday functions: sums, counts, averages and rounding" },
                    { id: "xlp-logic", slug: "logical-functions", title: "Logic: IF, AND, OR, IFS and IFERROR" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "working-with-data", title: "Working with Data", summary: "Conditional sums and counts, text and dates, lookups and cleaning.", lessons: [
                    { id: "xlp-conditional", slug: "conditional-sums-and-counts", title: "Conditional sums and counts" },
                    { id: "xlp-text-dates", slug: "text-and-dates", title: "Text and date functions" },
                    { id: "xlp-lookups", slug: "lookups", title: "Lookups: VLOOKUP, INDEX and MATCH, XLOOKUP" },
                    { id: "xlp-cleaning", slug: "cleaning-with-formulas", title: "Cleaning data with formulas" }] }
            ] },
            { id: "advanced", modules: [
                { id: "models-and-projects", title: "Models and Projects", summary: "Loan and savings functions, a budget model and a payroll sheet.", lessons: [
                    { id: "xlp-projects", slug: "financial-functions-and-projects", title: "Financial functions and spreadsheet projects" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "power-bi",
        title: "Power BI: Power Query, Modelling and DAX",
        department: "data-analytics",
        status: "complete",
        tagline: "Learn the Power BI workflow: clean and shape data in Power Query, build a star-schema model and write DAX measures, practising every one of the Power BI Practice Lab's 43 exercises on working engines in your browser.",
        audience: "Analysts and report builders, Excel users moving to Power BI and anyone preparing for data-analyst roles. The Excel Formulas path helps.",
        runsIn: "Exercises use the Power BI Practice Lab's engines in your browser: Power Query steps on built-in datasets, a relationship checker and a DAX evaluator compared across filter contexts. Features that only Power BI Desktop has are marked as such in the lab. Nothing is stored or sent.",
        outcomes: ["Clean columns with Power Query steps", "Shape and combine tables", "Design a star-schema model", "Write DAX measures with iterators", "Change filter context with CALCULATE", "Use time intelligence and reconcile totals"],
        levels: [
            { id: "beginner", modules: [
                { id: "power-query-basics", title: "Power Query Basics", summary: "Cleaning columns with recorded applied steps.", lessons: [
                    { id: "pbip-cleaning", slug: "power-query-cleaning", title: "Power Query: cleaning columns" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "shaping-and-modelling", title: "Shaping and Modelling", summary: "Shaping and combining tables, and modelling a star schema.", lessons: [
                    { id: "pbip-shaping", slug: "power-query-shaping", title: "Power Query: shaping tables" },
                    { id: "pbip-combining", slug: "power-query-combining", title: "Power Query: combining queries and projects" },
                    { id: "pbip-modelling", slug: "star-schema-modelling", title: "Data modelling: star schemas and relationships" }] }
            ] },
            { id: "advanced", modules: [
                { id: "dax-measures", title: "DAX Measures", summary: "DAX basics, then CALCULATE, filter context and time intelligence.", lessons: [
                    { id: "pbip-dax-basics", slug: "dax-basics", title: "DAX measures: the basics" },
                    { id: "pbip-dax-context", slug: "calculate-and-time-intelligence", title: "DAX: CALCULATE, filter context and time intelligence" }] }
            ] }
        ],
        coming: []
    },
    {
        id: "data-engineering",
        title: "Data Engineering Foundations",
        department: "data-analytics",
        status: "complete",
        tagline: "Build trustworthy data pipelines: ETL and ELT, SQL transformations, incremental and idempotent loads, warehouse modelling, data-quality checks and orchestration, with transformations you run in your browser.",
        audience: "Analysts moving towards engineering, backend developers who own data, and anyone preparing for data-engineering roles. SQL basics come first.",
        runsIn: "Transformations, loads and quality checks run as real SQLite (sql.js) on the ShopLite tables in your browser. Orchestration tools such as Airflow are explained, not run. Nothing is saved or sent.",
        outcomes: ["Design ETL and ELT pipelines", "Clean and deduplicate data with SQL", "Load incrementally and idempotently", "Model facts, dimensions and marts", "Write data-quality checks", "Orchestrate pipelines and run backfills"],
        levels: [
            { id: "beginner", modules: [
                { id: "pipeline-basics", title: "Pipeline Basics", summary: "ETL, ELT, batch and streaming, and transforming raw data with SQL you run.", lessons: [
                    { id: "de-pipelines", slug: "etl-elt-batch-streaming", title: "Data pipelines: ETL, ELT, batch and streaming" },
                    { id: "de-transform", slug: "transforming-with-sql", title: "Transforming raw data with SQL" }] }
            ] },
            { id: "intermediate", modules: [
                { id: "loading-and-modelling", title: "Loading and Modelling", summary: "Incremental, idempotent loads and warehouse modelling with facts, dimensions and marts.", lessons: [
                    { id: "de-incremental", slug: "incremental-loads", title: "Incremental loads and idempotent jobs" },
                    { id: "de-warehouse", slug: "warehouse-modelling", title: "Warehouse modelling: facts, dimensions and marts" }] }
            ] },
            { id: "advanced", modules: [
                { id: "reliable-pipelines", title: "Reliable Pipelines", summary: "Data-quality checks and observability, and orchestration with backfills.", lessons: [
                    { id: "de-quality", slug: "data-quality", title: "Data quality checks and observability" },
                    { id: "de-orchestration", slug: "orchestration-and-backfills", title: "Orchestration, scheduling and backfills" }] }
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
