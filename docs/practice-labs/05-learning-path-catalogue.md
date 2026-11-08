# 05. Complete learning-path catalogue

This is the path level: who it is for, what the learner gains, and the modules at each level. Lessons, objectives and exercises are in [06 curriculum](06-curriculum-specifications.md). Waves (W1 to W9) are defined in [12 roadmap](12-prioritized-roadmap.md). Status is one of **built** (pages exist), **building** (partly published) or **planned**. A path is linked only once it has real lessons (rule 4.10).

**Common to every path (not repeated in each card):**

- A final **Interview Practice** module (checked questions with explained answers).
- A **Projects** module (milestone-checked).
- A path-end **Assessment**: a mixed set of 15 to 25 checked tasks drawn from all levels. A pass mark of 80% is shown as feedback only; nothing is stored or certified.

Run-time engines are named after their [07](07-interactive-tools-catalogue.md) experience ids. Path ids (P01, P50 and so on) are permanent labels used across these documents. They do not set an order: the build order is set by the waves.

---

## D1 Software Testing and Quality

### P01 Manual Software Testing (`manual-testing`), W2, planned

- **Learner:** an absolute beginner to a junior tester.
- **Prerequisites:** none.
- **Outcomes:** explain where testing fits in the SDLC and STLC; analyse a requirement; write clear test scenarios and cases; choose test data; execute tests and report defects that developers can act on; plan regression; take part in Agile testing.
- **Beginner:** M1 What Testing Is and Why It Matters · M2 Testing in the Software Life Cycle · M3 Writing Test Cases
- **Intermediate:** M4 Test Data and Coverage · M5 Executing Tests and Reporting Bugs · M6 Types of Testing (functional, regression, smoke and sanity, exploratory, usability, compatibility)
- **Advanced:** M7 Test Planning and Risk · M8 Testing in Agile Teams and Test Metrics
- **Projects:** PR1 Test the ShopLite signup and login (cases and execution); PR2 Bug hunt on a seeded release (10 hidden bugs, report them); PR3 Write a test plan for the ShopLite checkout release.
- **Runtime:** E4 structured writing labs, E5 ShopLite, E3 quizzes.
- **Skills:** requirement analysis, test design, defect reporting, test planning.
- **Next:** P02 Test Design Techniques, then P03 API Testing or P50 SQL.

### P02 Test Design Techniques (`test-design`), W2, planned (the Test Design Lab exists)

- **Learner:** testers after P01 M3.
- **Outcomes:** apply equivalence partitioning, boundary values, decision tables, state transitions, pairwise and use-case testing, and justify the coverage.
- **Beginner:** M1 Partitions and Boundaries
- **Intermediate:** M2 Decision Tables and State Transitions
- **Advanced:** M3 Pairwise, Use Cases and Error Guessing
- **Projects:** design a full test suite for the ShopLite discount rules.
- **Runtime:** reuses the 20 Test Design Lab exercises plus new ones (E2 checkers).
- **Next:** P03.

### P03 API Testing (`api-testing`), W3, planned

- **Learner:** testers and developers.
- **Prerequisites:** P01 M1 to M3 (recommended), JSON basics.
- **Outcomes:** read HTTP requests and responses; use methods, status codes, headers, parameters and bodies; test positive and negative cases; check JSON with JSONPath; test authentication; report API defects.
- **Beginner:** M1 How the Web Talks: HTTP · M2 Requests in Practice
- **Intermediate:** M3 Testing an API · M4 Authentication and Errors
- **Advanced:** M5 Contracts, Data and Edge Cases · M6 Non-functional Basics (rate limits, pagination, idempotency, performance signals)
- **Projects:** test the ShopLite Orders API (find 8 seeded API bugs); write an API test checklist.
- **Runtime:** E6 API workbench (a mock API in a Service Worker), the existing JSON and JSONPath engines.
- **Next:** P08 API Test Automation, P06 Playwright.

### P04 Accessibility Testing (`accessibility-testing`), W9, planned

- **Learner:** testers and frontend developers.
- **Outcomes:** test against WCAG 2.2 AA principles with the keyboard, a screen-reader model, contrast and semantics; report accessibility defects.
- **Modules:** B: M1 Why Accessibility, the POUR Principles · I: M2 Keyboard, Focus and Semantics · M3 Visual: Contrast, Zoom and Motion · A: M4 Forms, Errors and Dynamic Content · M5 Auditing and Reporting
- **Projects:** audit the ShopLite accessibility-bug release.
- **Runtime:** E5 ShopLite, E4 report lab.
- **Next:** P25.

### P05 Performance Testing Fundamentals (`performance-testing`), W9, planned

- **Outcomes:** explain load, stress, soak and spike testing; read the percentiles; design a load model; interpret results. Simulated: no real load is generated.
- **Modules:** B: M1 Performance Concepts · I: M2 Workload Models and Metrics · A: M3 Reading Results and Bottlenecks
- **Projects:** analyse a provided results dataset and write findings.
- **Runtime:** E8 charts from datasets.
- **Note:** real tools (k6, JMeter) are explained with downloadable scripts and are never run in the page.

### P06 Testing AI Systems (`testing-ai-systems`), W7, planned (cross-listed in D6)

- **Learner:** testers working on AI features.
- **Outcomes:** test non-deterministic output; design evaluation rubrics and datasets; test for hallucination, bias, safety and prompt injection; regression-test prompts.
- **Modules:** B: M1 How AI Features Fail · I: M2 Evaluation Datasets and Rubrics · M3 Risk Testing: Bias, Safety and Injection · A: M4 Regression and Monitoring for AI
- **Projects:** evaluate a recorded set of model outputs for a support bot.
- **Runtime:** E10 prompt evaluation lab with recorded outputs. No live model.

## D2 Test Automation Engineering

### P07 Playwright with TypeScript (`playwright`), W4, planned

- **Learner:** testers with P01, beginner JS/TS (taught inline), or developers.
- **Prerequisites:** P01 M1 to M3 recommended; P30 JavaScript M1 to M3 or the inline "just enough TypeScript" module.
- **Outcomes:** set up a project; write reliable tests with role-based locators and web-first assertions; handle forms, navigation, waiting and network; organise tests with fixtures, hooks and the Page Object Model; test APIs; debug with the trace viewer and UI mode; run in CI.
- **Beginner:** M1 Automation and Playwright Basics · M2 Just Enough TypeScript · M3 First Tests: Locators and Assertions
- **Intermediate:** M4 Interacting with Pages · M5 Organising Tests (hooks, fixtures, POM) · M6 Network and API Testing
- **Advanced:** M7 Debugging and Flaky Tests · M8 Reporting, Parallelism and CI
- **Projects:** automate ShopLite signup, search and checkout; a downloadable starter repository to run locally.
- **Runtime:**
  - The E7 locator evaluator runs **in the page against ShopLite**, with a subset of the locator semantics that is stated on the page.
  - E2 code challenges are checked by static analysis plus simulated execution of the supported API subset.
  - Real execution happens **locally** (a downloadable project); the page never claims it ran Playwright.
- **Next:** P10, P13 Git, P41 CI/CD.

### P08 API Test Automation (`api-test-automation`), W8, planned

- **Outcomes:** automate API checks with Playwright's request API (TypeScript), with notes on REST Assured (Java); data-driven tests; schema checks; environment configuration.
- **Modules:** B: M1 From Manual to Automated API Checks · I: M2 Writing API Tests · M3 Data-driven and Schema Checks · A: M4 Suites in CI
- **Projects:** automate the ShopLite Orders API suite.
- **Runtime:** E1 JS runner against the E6 mock API (same Service Worker).

### P09 Selenium WebDriver with Java (`selenium-java`), W9, planned

- **Learner:** testers in Java-heavy companies, a large share of Indian postings [S11 P].
- **Outcomes:** WebDriver architecture, locators, waits, POM, TestNG basics, Grid concepts.
- **Modules:** B: M1 WebDriver Basics · I: M2 Locators and Waits · M3 Page Objects and TestNG · A: M4 Framework and Grid Concepts
- **Runtime:** code reading, predict-and-fix exercises (E2), a downloadable Maven project. The browser cannot run WebDriver.
- **Note:** taught after Playwright (demand trend [S09 E]) but kept for the job market.

### P10 Automation Framework Design and CI (`automation-framework`), W9, planned

- **Outcomes:** structure a framework (layers, data, config, reporting); handle flakiness; parallelise; pipeline integration; code review of tests.
- **Modules:** I: M1 Framework Architecture · M2 Test Data and Configuration · A: M3 Flakiness and Reliability · M4 CI, Reporting and Maintenance
- **Runtime:** E7 CI simulator, E2 code-review challenges.

## D3 Programming and Developer Foundations

### P13 Git and GitHub (`git-github`), W5, planned

- **Learner:** everyone.
- **Outcomes:** explain repositories, commits, staging, branches, merging, rebasing and remotes; resolve conflicts; use pull requests and code review; recover from mistakes.
- **Modules:** B: M1 Version Control Basics · M2 Branches · I: M3 Merging and Conflicts · M4 Remotes and GitHub Collaboration · A: M5 Rewriting and Recovering History · M6 Team Workflows
- **Projects:** resolve a three-branch conflict scenario; a pull-request review simulation.
- **Runtime:** E7 Git simulator (an own model and commit graph); GitHub steps are explained and simulated, never connected.

### P14 Command Line and Bash (`command-line`), W9, planned

- **Outcomes:** navigate, manage files, pipes, grep and find, permissions, environment variables, simple scripts.
- **Modules:** B: M1 Shell Basics · M2 Files and Text · I: M3 Pipes, Search and Processes · A: M4 Scripts
- **Runtime:** E7 shell simulator (a virtual file system, a supported command subset).

### P15 Python (`python`), W6, planned

- **Learner:** beginners, testers and analysts.
- **Outcomes:** variables and types, conditions, loops, functions, strings, lists, dicts, sets and tuples, files, exceptions, modules, OOP, simple automation.
- **Modules:** B: M1 First Programs · M2 Making Decisions and Repeating · M3 Functions · I: M4 Data Structures · M5 Text and Files · M6 Errors and Exceptions · A: M7 Object-Oriented Python · M8 Modules and Automation
- **Projects:** a log analyser; a CSV report generator; a small test-data generator.
- **Runtime:** E1 with Pyodide, loaded on request ([09](09-technical-architecture.md), section 7).

### P16 Java (`java`), W8, planned

- **Learner:** students and testers in Java stacks.
- **Outcomes:** fundamentals through OOP, collections, exceptions, generics and streams.
- **Modules:** B: M1 First Java Programs · M2 Control Flow · M3 Arrays and Methods · I: M4 Classes and Objects · M5 Inheritance, Polymorphism, Abstraction and Encapsulation · M6 Collections · A: M7 Exceptions and Generics · M8 Streams and Lambdas
- **Projects:** a library-management console app; a bank-account simulation.
- **Runtime:**
  - Preferred: E1 with javac compiled to WASM (TeaVM), subject to decision **D4** (licence and size).
  - Fallback: predict-the-output and fix-the-code exercises, honestly marked "not executed".

### P30 JavaScript Fundamentals (`javascript`), W5, planned

- **Outcomes:** values, types, functions, arrays and objects, control flow, scope, closures, promises and async/await, modules, errors.
- **Modules:** B: M1 Values and Variables · M2 Decisions and Loops · M3 Functions · I: M4 Arrays and Objects · M5 Errors and Debugging · A: M6 Asynchronous JavaScript · M7 Modules and Modern Syntax
- **Runtime:** E1 JS runner in a sandboxed Worker or iframe.
- **Next:** P07 Playwright, P20 DOM.

### P31 TypeScript (`typescript`), W9, planned

- **Outcomes:** types, interfaces, unions, generics, narrowing, tsconfig, typing tests.
- **Modules:** B: M1 Types · I: M2 Shapes and Unions · A: M3 Generics and Narrowing
- **Runtime:** a TypeScript transpile-only step in the browser (decision deferred until build time, with the size measured) or type-reading exercises.

### P32 Data Structures and Algorithms for Interviews (`dsa`), W9, planned

- **Outcomes:** complexity, arrays and strings, hashing, two pointers, stacks and queues, trees, graphs basics, sorting and searching, recursion, dynamic programming basics.
- **Modules:** B: M1 Complexity · I: M2 Arrays, Strings and Hashing · M3 Stacks, Queues and Linked Lists · A: M4 Trees and Graphs · M5 Recursion and DP
- **Runtime:** E1 (JS or Python) with tests; E8 algorithm visualizers.

### P33 Regular Expressions (`regex`), W9, planned

- **Outcomes:** literals, classes, quantifiers, groups, anchors, lookarounds; testing regexes.
- **Modules:** B: M1 Matching Text · I: M2 Groups and Alternation · A: M3 Lookarounds and Performance
- **Runtime:** the native JS RegExp engine, with dialect notes.

## D4 Web Development and Frontend

### P20 HTML and CSS (`html-css`), W9, planned

- **Modules:** B: M1 Document Structure · M2 Text, Links and Media · M3 Styling Basics · I: M4 Layout: Flexbox and Grid · M5 Forms · A: M6 Responsive and Accessible Pages
- **Runtime:** E1 sandboxed iframe preview with checks (DOM queries).

### P21 JavaScript in the Browser (`dom`), W9, planned

- **Modules:** B: M1 Selecting and Changing Elements · I: M2 Events · M3 Forms and Validation · A: M4 Fetch and Rendering Data · M5 Performance Basics
- **Runtime:** iframe preview plus checks.

### P22 Web Accessibility for Developers (`web-accessibility`), W9, planned

- **Modules:** B: M1 Semantics First · I: M2 ARIA Done Right · A: M3 Testing Your Own Pages

### P23 Frontend Frameworks Concepts (`frontend-frameworks`), W9, planned

- **Modules:** I: M1 Components and State · M2 Rendering and Data Flow · A: M3 Testing Components
- **Runtime:** concept-level, vanilla demos; no framework bundle.

## D5 Databases, Backend and APIs

### P50 SQL (`sql`), W1, **building** (18 lessons published)

- **Learner:** beginners, testers, analysts.
- **Outcomes:** see the existing path page, plus recursive queries, query plans, dates, and six projects.
- **Built:** B: Fundamentals (4 lessons), Filtering and Sorting (3) · I: Summarising (2), Combining (3), Changing Data and Real-World SQL (3) · A: Analytical Queries (1), Structure and Reliability (2).
- **To add (W1):**
  - I: "Working with Dates and Text"
  - A: Analytical Queries plus 2 lessons
  - A: new module "Recursive Queries and Performance" (3 lessons)
  - Projects module (6)
  - Interview Practice module
- Full specification in [06](06-curriculum-specifications.md), section 2.
- **Runtime:** SQLite WASM (built).

### P51 Database Design and Modelling (`database-design`), W9, planned

- **Modules:** B: M1 Entities and Relationships · I: M2 Keys and Normalisation (1NF to 3NF) · M3 Constraints and Integrity · A: M4 Denormalisation, Indexing Strategy and Trade-offs
- **Runtime:** SQLite plus an ER-diagram reading exercise (E8).

### P52 PostgreSQL in Practice (`postgresql`), W9, planned

- **Modules:** I: M1 PostgreSQL vs SQLite Differences · M2 Types, JSONB and Arrays · A: M3 EXPLAIN ANALYZE and Indexes · M4 Transactions and Isolation
- **Runtime:** PGlite (about 3.7 MB gzipped [S44]), lazy-loaded, subject to decision D3.

### P53 HTTP and REST API Design (`rest-api-design`), W9, planned

- **Modules:** B: M1 Resources and Methods · I: M2 Status Codes, Errors and Versioning · A: M3 Pagination, Idempotency and Security
- **Runtime:** E6 workbench.

### P54 Backend Fundamentals (`backend`), W9, planned

- **Modules:** I: M1 Request Handling · M2 Persistence · M3 Authentication Concepts · A: M4 Caching, Queues and Observability
- **Runtime:** concept and simulator-level (E6, E7); no real server.

## D6 AI and Machine Learning

### P60 AI and LLM Foundations (`ai-foundations`), W7, planned

- **Learner:** everyone.
- **Outcomes:** explain AI, ML, deep learning and generative AI; tokens, context windows, temperature, hallucination; strengths and limits; safe use at work.
- **Modules:** B: M1 What AI Is (and Is Not) · M2 How LLMs Work, Intuitively · I: M3 Using AI Well at Work · M4 Limits, Risks and Privacy
- **Runtime:** E8 tokenizer and temperature visualizers (deterministic, local); no live model.

### P61 Prompt Engineering and Evaluation (`prompt-engineering`), W7, planned

- **Outcomes:** structure prompts (role, context, examples, constraints, output format); chain tasks; evaluate outputs with rubrics and test sets; regression-test prompts.
- **Modules:** B: M1 Anatomy of a Prompt · I: M2 Patterns: Few-shot, Step-by-step, Structured Output · M3 Evaluating Outputs · A: M4 Prompt Test Suites and Regression
- **Runtime:** E10 with recorded outputs. No API key and no runtime AI (rule 1.5 and the owner's constraint).

### P62 Building LLM Applications (`llm-apps`), W8, planned

- **Outcomes:** the architecture of LLM apps: retrieval (embeddings, chunking, vector search), tool calling, agents and loops, guardrails, cost and latency.
- **Modules:** I: M1 LLM App Architecture · M2 Embeddings and Retrieval (RAG) · A: M3 Tools and Agents · M4 Guardrails, Evaluation and Operations
- **Runtime:** E8 embedding visualizer (precomputed small vectors); E7 agent-loop simulator; code reading. Optional browser-local models only after decision D5.

### P63 Machine Learning Foundations (`machine-learning`), W8, planned

- **Outcomes:** supervised and unsupervised learning, features, train/test split, regression, classification, clustering, metrics (accuracy, precision, recall, F1, ROC idea), overfitting.
- **Modules:** B: M1 Learning from Data · I: M2 Regression · M3 Classification and Metrics · M4 Clustering · A: M5 Overfitting, Validation and Features
- **Runtime:** E8 ML visualizers in plain JS (linear regression, k-means, decision tree, confusion matrix); later Pyodide with scikit-learn (decision D3).

### P64 Deep Learning Concepts (`deep-learning`), W9, planned

- **Modules:** I: M1 Neurons and Networks · M2 Training: Loss and Gradient Descent · A: M3 CNNs, RNNs and Transformers (concepts)
- **Runtime:** E8 gradient-descent and tiny-network visualizers.

### P65 Responsible AI (`responsible-ai`), W8, planned

- **Modules:** B: M1 Why Responsibility Matters · I: M2 Bias and Fairness · M3 Privacy, Security and Transparency · A: M4 Governance and Evaluation in Practice
- **Runtime:** case-study quizzes (E3), rubric labs (E10).

## D7 Data Analytics and Data Engineering

### P70 Excel for Data Analysis (`excel`), W6, planned (Excel Practice Lab exists: 55 exercises, 13 lessons)

- **Plan:** wrap the existing lessons into a path, as the SQL path did.
- **Modules:** B: M1 Sheets, Formulas and References · M2 Summaries · I: M3 Lookups and Logic · M4 Text, Dates and Cleaning · A: M5 Finance and Errors · M6 Projects

### P71 Power BI (`power-bi`), W6, planned (lab exists: 43 exercises, 13 lessons, DAX and Power Query engines)

- **Modules:** B: M1 BI and the Power BI Workflow · I: M2 Power Query · M3 Data Modelling · M4 DAX Measures · A: M5 Time Intelligence and Context · M6 Report Design and Performance
- **Note:** a "Needs Power BI Desktop" badge appears on steps that need it.

### P72 Statistics for Analysts (`statistics`), W9, planned

- **Modules:** B: M1 Describing Data · I: M2 Distributions and Sampling · A: M3 Hypothesis Tests and A/B Testing
- **Runtime:** E8 charts, E1 Python later.

### P73 Data Analysis with Python (pandas) (`pandas`), W9, planned

- **Modules:** I: M1 DataFrames · M2 Cleaning and Transforming · M3 Grouping and Joining · A: M4 Visualising and Reporting
- **Runtime:** Pyodide plus pandas (about 10.5 MB more [S41]), on request, decision D3.

### P74 Data Cleaning (`data-cleaning`), W9, planned

- **Modules:** B: M1 What Dirty Data Looks Like · I: M2 Cleaning with SQL · M3 Cleaning with Excel · A: M4 Validation Rules and Pipelines
- **Runtime:** existing SQL and Excel engines (E9).

### P75 Data Engineering Fundamentals (`data-engineering`), W9, planned

- **Modules:** I: M1 Data Pipelines and ETL/ELT · M2 Warehouses, Lakes and Modelling (star schema) · A: M3 Orchestration, Quality and Testing Data
- **Runtime:** SQLite plus E7 pipeline simulator.

## D8 DevOps, Cloud and Security

### P41 CI/CD Fundamentals (`ci-cd`), W9, planned

- **Modules:** B: M1 Why CI/CD · I: M2 Pipelines, Stages and Artifacts · M3 Tests in the Pipeline · A: M4 Deployment Strategies and Rollbacks
- **Runtime:** E7 CI simulator (a YAML-like pipeline model, failure diagnosis).

### P42 Docker and Containers (`docker`), W9, planned

- **Modules:** B: M1 Containers vs VMs · I: M2 Images and Dockerfiles · M3 Volumes, Networks and Compose · A: M4 Building Small, Secure Images
- **Runtime:** a Dockerfile reading and ordering simulator; the commands are simulated.

### P43 Cloud Fundamentals (`cloud`), W9, planned

- **Modules:** B: M1 What Cloud Is · I: M2 Compute, Storage, Networking · M3 Identity and Cost · A: M4 Architecting for Reliability
- **Note:** vendor-neutral, with an AWS, Azure and GCP name-mapping table.

### P44 Kubernetes Concepts (`kubernetes`), W9, planned

- **Modules:** I: M1 Pods, Deployments and Services · A: M2 Scaling, Config and Health
- **Runtime:** a state simulator.

### P45 Web Security Fundamentals (`web-security`, Security subdepartment), W9, planned

- **Outcomes:** the OWASP Top 10 concepts; spot vulnerable code; secure-coding fixes; security testing basics.
- **Modules:** B: M1 How Attacks Work · I: M2 Injection and XSS · M3 Authentication, Sessions and Access Control · A: M4 Security Testing Basics
- **Runtime:** E12 code-reading scenarios only: no live exploit pages, no attack tooling.
