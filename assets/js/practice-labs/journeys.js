/* =========================================================
   ToolZen Hub
   Practice Labs: role journeys across departments. Each step is an existing learning path ({ path }) or lab ({ lab })
   in a sensible order; the Practice Labs home page lists them. Every step must resolve (unit-tested).
========================================================= */

export const JOURNEYS = Object.freeze([
    {
        id: "qa-engineer", title: "QA engineer",
        summary: "Test software by hand with sound technique, then check data and APIs directly and start automating.",
        steps: [{ path: "manual-testing", why: "the testing fundamentals every QA role expects" }, { path: "test-design", why: "boundary values, partitions and decision tables" }, { path: "http-apis", why: "testing behind the interface" }, { path: "sql", why: "checking the data an application stores" }, { path: "playwright", why: "your first automated browser tests" }]
    },
    {
        id: "automation-engineer", title: "Test automation engineer",
        summary: "Write reliable automated tests in code, at the UI and API levels, and run them in a pipeline.",
        steps: [{ path: "manual-testing", why: "what makes a good test case" }, { path: "javascript", why: "the language Playwright tests are written in" }, { path: "playwright", why: "locators, assertions, page objects and CI" }, { path: "http-apis", why: "fast API-level tests" }, { path: "git-devops", why: "branches, pull requests and pipelines" }]
    },
    {
        id: "data-analyst", title: "Data analyst",
        summary: "Turn raw records into decisions: statistics, SQL, spreadsheets and dashboards.",
        steps: [{ path: "statistics", why: "averages, spread, grouping and A/B tests" }, { path: "sql", why: "querying and joining real tables" }, { lab: "excel-practice-lab", why: "spreadsheet formulas, checked by a real engine" }, { lab: "power-bi-practice-lab", why: "Power Query, data models and DAX" }]
    },
    {
        id: "web-developer", title: "Web developer",
        summary: "Build accessible pages, program them with JavaScript, connect them to APIs and ship them safely.",
        steps: [{ path: "html-css-dom", why: "structure, style, layout and accessibility" }, { path: "javascript", why: "programming fundamentals to async code" }, { path: "http-apis", why: "how front ends talk to servers" }, { path: "git-devops", why: "version control and delivery" }, { path: "app-security", why: "avoiding the common vulnerabilities" }]
    },
    {
        id: "backend-developer", title: "Backend developer",
        summary: "Design data and APIs, write the code behind them and keep them secure and running.",
        steps: [{ path: "sql", why: "data modelling and queries" }, { path: "javascript", why: "server-side programming fundamentals" }, { path: "http-apis", why: "REST design, validation and auth" }, { path: "app-security", why: "injection, access control and secrets" }, { path: "git-devops", why: "pipelines, containers and monitoring" }]
    },
    {
        id: "ai-engineer", title: "AI engineer or AI tester",
        summary: "Understand how AI systems work, build on them with code and APIs, and evaluate them responsibly.",
        steps: [{ path: "ai-foundations", why: "tokens, RAG, evaluation and agents" }, { path: "statistics", why: "metrics, sampling and significance" }, { path: "javascript", why: "code to call and test AI services" }, { path: "http-apis", why: "how AI services are called" }, { path: "app-security", why: "injection and data-protection risks" }]
    },
    {
        id: "devops-engineer", title: "DevOps engineer",
        summary: "Own how software is versioned, built, shipped, run and secured.",
        steps: [{ path: "git-devops", why: "Git, CI/CD, containers, cloud and incidents" }, { path: "http-apis", why: "the services you deploy and monitor" }, { path: "app-security", why: "secure configuration and secrets" }, { path: "javascript", why: "scripting and automation" }, { lab: "cron-challenge-lab", why: "scheduled jobs" }]
    }
]);
