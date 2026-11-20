/* =========================================================
   ToolZen Hub
   Practice Labs: role journeys across departments. Each step is an existing learning path ({ path }) or lab ({ lab })
   in a sensible order; the Practice Labs home page lists them. Every step must resolve (unit-tested).
========================================================= */

export const JOURNEYS = Object.freeze([
    {
        id: "qa-engineer", title: "QA engineer",
        summary: "Test software by hand with sound technique, then test APIs and data directly and start automating.",
        steps: [{ path: "manual-testing", why: "the testing fundamentals every QA role expects" }, { path: "test-design", why: "boundary values, partitions and decision tables" }, { path: "specialised-testing", why: "API, database, accessibility, UAT and performance testing" }, { path: "http-apis", why: "how the APIs you test work" }, { path: "sql", why: "checking the data an application stores" }, { path: "playwright", why: "your first automated browser tests" }]
    },
    {
        id: "automation-engineer", title: "Test automation engineer",
        summary: "Write reliable automated tests in code at the UI and API levels, and run them in a pipeline.",
        steps: [{ path: "manual-testing", why: "what makes a good test case" }, { path: "javascript", why: "the language Playwright tests are written in" }, { path: "typescript", why: "the types Playwright projects use" }, { path: "playwright", why: "locators, assertions, page objects and CI" }, { path: "api-automation", why: "fast, stable API-level tests" }, { path: "selenium", why: "the tool many Java teams still use" }, { path: "git-devops", why: "branches, pull requests and pipelines" }]
    },
    {
        id: "data-analyst", title: "Data analyst",
        summary: "Turn raw records into decisions: statistics, spreadsheets, SQL and dashboards.",
        steps: [{ path: "statistics", why: "averages, spread, grouping and A/B tests" }, { path: "excel", why: "formulas on a real engine, from references to lookups" }, { path: "sql", why: "querying and joining real tables" }, { path: "pandas", why: "analysis in Python code" }, { path: "power-bi", why: "Power Query, data models and DAX" }]
    },
    {
        id: "data-engineer", title: "Data engineer",
        summary: "Build the pipelines and models that analysts and AI systems depend on.",
        steps: [{ path: "sql", why: "the language of every warehouse" }, { path: "python", why: "scripting, files and data handling" }, { path: "database-design", why: "keys, constraints, indexes and transactions" }, { path: "data-engineering", why: "ETL, incremental loads, modelling and quality" }, { path: "machine-learning", why: "what the data you prepare is used for" }]
    },
    {
        id: "web-developer", title: "Web developer",
        summary: "Build accessible pages, program them with JavaScript, connect them to APIs and ship them safely.",
        steps: [{ path: "html-css-dom", why: "structure, style, layout and accessibility" }, { path: "javascript", why: "programming fundamentals to async code" }, { path: "frontend-frameworks", why: "components, state and rendering" }, { path: "http-apis", why: "how front ends talk to servers" }, { path: "backend", why: "what happens behind the API" }, { path: "git-devops", why: "version control and delivery" }, { path: "app-security", why: "avoiding the common vulnerabilities" }]
    },
    {
        id: "backend-developer", title: "Backend developer",
        summary: "Design data and APIs, write the code behind them and keep them secure and running.",
        steps: [{ path: "sql", why: "queries and data" }, { path: "database-design", why: "schemas, integrity and transactions" }, { path: "http-apis", why: "REST design, validation and auth" }, { path: "backend", why: "routing, validation, idempotency and architecture" }, { path: "app-security", why: "injection, access control and secrets" }, { path: "linux", why: "the servers your code runs on" }]
    },
    {
        id: "ai-engineer", title: "AI engineer or AI tester",
        summary: "Understand how AI systems work, build on them with code and evaluate them responsibly.",
        steps: [{ path: "ai-foundations", why: "tokens, RAG, evaluation and agents" }, { path: "python", why: "the main language of AI work, run in your browser" }, { path: "machine-learning", why: "models, metrics and overfitting" }, { path: "prompt-engineering", why: "reliable prompts, structured outputs and tool calls" }, { path: "llm-apps", why: "the code around the model: RAG, validation, reliability" }, { path: "statistics", why: "metrics, sampling and significance" }, { path: "app-security", why: "injection and data-protection risks" }]
    },
    {
        id: "devops-engineer", title: "DevOps engineer",
        summary: "Own how software is versioned, built, shipped, run and secured.",
        steps: [{ path: "git-devops", why: "Git, CI/CD, containers, cloud and incidents" }, { path: "linux", why: "the shell, permissions, services and scripts" }, { path: "kubernetes", why: "deployments, probes, releases and SLOs" }, { path: "app-security", why: "secure configuration and secrets" }, { lab: "cron-challenge-lab", why: "scheduled jobs" }]
    }
]);
