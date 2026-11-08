/* =========================================================
   ToolZen Hub
   Practice Labs departments: the registry

   Plain data, build-time only (BUILD_ONLY). The owner set the eight departments and their order on 2026-11-08 (rulebook 4.10).
   A department is a discovery layer over learning paths (curriculum.js), the existing labs (/tools/<id>/) and flashcard decks;
   it never owns a URL that a path or lab already has. One canonical home per subject: a department may point to another
   department's path, never copy it.

   A department gets its own page only when it has real content to offer: at least one learning path, or at least two labs.
   Until then it is listed on the Practice Labs home as "in development", with no link (rulebook 4.10, no empty pages).

   technologies[].status: "path" (a published learning path, `path` = its id), "lab" (an existing lab, `lab` = its tool id),
   "planned" (named so the scope is clear, never linked).
========================================================= */

export const DEPARTMENTS = Object.freeze([
    {
        id: "database-engineering",
        title: "Database Engineering",
        short: "SQL from the first SELECT to window functions, recursive queries and query plans, with a real database engine in your browser.",
        audience: ["Beginners who have never written a query", "Testers who check data behind an application", "Analysts and developers who need SQL every day"],
        intro: [
            "Almost every application keeps its records in a relational database, and SQL is how people read and change them. Developers write it, testers use it to check that the screen and the data agree, and analysts build reports on it.",
            "Here you learn SQL by running it. Every example and exercise runs on SQLite compiled to WebAssembly inside your browser, against a small shop database, so a query you write is executed for real and its result is checked against the expected one. Nothing you type is uploaded.",
            "Start with the SQL learning path if you are new; it goes from reading a table to joins, window functions and transactions. Use the SQL Practice Lab when you want a long list of exercises or a free sandbox. Database design, PostgreSQL specifics and database testing follow as their own routes.",
            "A good way to use it: read a lesson, run its first example, change one thing and run it again, then solve the task under it before reading on. When a query fails, read the database's own error message first; most mistakes are a misspelt column, a missing comma or text without quotes, and the lessons show each of them."
        ],
        technologies: [
            { title: "SQL", status: "path", path: "sql" },
            { title: "SQL Practice Lab (49 exercises and a sandbox)", status: "lab", lab: "sql-practice-lab" },
            { title: "Database design and modelling", status: "planned" },
            { title: "PostgreSQL in practice", status: "planned" },
            { title: "Database testing", status: "planned" }
        ],
        paths: ["sql"],
        labs: ["sql-practice-lab"],
        decks: ["SQL"],
        start: { label: "New to databases? Start with lesson 1 of the SQL path.", path: "sql" },
        related: ["data-analytics", "software-testing", "web-backend"]
    },
    {
        id: "software-testing",
        title: "Software Testing and Quality Engineering",
        short: "Manual testing, test design, bug reporting and QA practice on a deliberately faulty application.",
        audience: ["People starting a career in software testing", "Manual testers who want structure and practice", "Developers who want to test their own work better"],
        intro: [
            "Testing is the craft of finding out how software really behaves: reading requirements critically, designing tests that cover what matters, running them, and reporting problems so they get fixed. It is one of the most common ways into a software career, and it needs judgement more than programming.",
            "Here you practise on something real. ShopLite is a small web shop with written requirements; its test release hides ten seeded bugs for you to find. Writing labs check your questions, scenarios and test cases for structure and coverage, and quizzes check the ideas behind them. Everything runs in your browser and nothing you write is uploaded.",
            "Start with the Manual Software Testing path: it begins with what testing is and why, and moves to requirements, scenarios and test cases. The Test Design Lab drills boundary values and equivalence partitions. Bug reports, test planning, API testing and accessibility testing follow as the department grows."
        ],
        technologies: [
            { title: "Manual software testing", status: "path", path: "manual-testing" },
            { title: "Test design techniques", status: "lab", lab: "test-design-lab" },
            { title: "Bug hunting on ShopLite and bug reports", status: "path", path: "manual-testing" },
            { title: "API testing", status: "planned" },
            { title: "Accessibility testing", status: "planned" }
        ],
        paths: ["manual-testing"],
        labs: ["test-design-lab"],
        decks: ["Software testing"],
        start: { label: "New to testing? Start with lesson 1 of Manual Software Testing.", path: "manual-testing" },
        related: ["automation-engineering", "database-engineering"]
    },
    {
        id: "automation-engineering",
        title: "Automation Engineering",
        short: "Playwright-first browser and API test automation, from the first locator to a framework in CI.",
        audience: ["Testers moving into automation", "Developers who write end-to-end tests"],
        intro: [],
        technologies: [
            { title: "Playwright", status: "planned" },
            { title: "API test automation", status: "planned" },
            { title: "Selenium WebDriver", status: "planned" }
        ],
        paths: [],
        labs: [],
        decks: [],
        related: ["software-testing", "programming"]
    },
    {
        id: "ai-engineering",
        title: "AI and AI Engineering",
        short: "How AI and language models work, how to evaluate them, and how AI applications are built and tested.",
        audience: ["Anyone who uses AI tools at work", "Developers building AI features", "Testers evaluating AI behaviour"],
        intro: [],
        technologies: [
            { title: "AI and LLM foundations", status: "planned" },
            { title: "Prompt engineering and evaluation", status: "planned" },
            { title: "Machine learning foundations", status: "planned" }
        ],
        paths: [],
        labs: [],
        decks: [],
        related: ["programming", "data-analytics"]
    },
    {
        id: "data-analytics",
        title: "Data and Analytics Engineering",
        short: "Spreadsheet formulas, Power Query, data models and DAX, practised on working engines in your browser.",
        audience: ["Analysts and business users", "Anyone who builds reports", "Learners heading towards data engineering"],
        intro: [
            "Analytics turns raw records into answers people can act on: cleaning the data, modelling it, calculating the right measures and presenting them clearly.",
            "Two labs here run real engines in your browser. The Excel Practice Lab evaluates spreadsheet formulas, and the Power BI Practice Lab runs Power Query steps, a data model and DAX measures on built-in datasets, so your answer is computed and checked rather than compared as text. Steps that only Power BI Desktop can do are marked as such.",
            "SQL for analytics lives in Database Engineering, and the same shop data appears in both, so what you learn in one carries over to the other. Structured learning paths for Excel and Power BI are being built from these labs.",
            "Each lab starts with short lessons whose examples you can edit, followed by exercises from simple sums to a small project. When an answer is not yet right, the check says so and, where it can tell, why: an Excel formula, for example, is also tried on a second set of numbers, which catches a typed-in result. A hint comes before the solution, so the lab is worth repeating until you can solve each task without help."
        ],
        technologies: [
            { title: "Excel formulas", status: "lab", lab: "excel-practice-lab" },
            { title: "Power BI: Power Query, modelling and DAX", status: "lab", lab: "power-bi-practice-lab" },
            { title: "SQL for analytics", status: "path", path: "sql" },
            { title: "Statistics for analysts", status: "planned" },
            { title: "Data engineering fundamentals", status: "planned" }
        ],
        paths: [],
        labs: ["excel-practice-lab", "power-bi-practice-lab"],
        decks: ["Excel", "Power BI"],
        start: { label: "New to spreadsheets? Begin with the Excel Practice Lab's first lesson.", lab: "excel-practice-lab" },
        related: ["database-engineering", "ai-engineering"]
    },
    {
        id: "programming",
        title: "Software Development and Programming",
        short: "Python, JavaScript, Java and problem solving, with code you can run where the browser allows it.",
        audience: ["Complete beginners to programming", "Testers who need code for automation", "Students preparing for interviews"],
        intro: [],
        technologies: [
            { title: "JavaScript", status: "planned" },
            { title: "Python", status: "planned" },
            { title: "Java", status: "planned" }
        ],
        paths: [],
        labs: [],
        decks: [],
        related: ["automation-engineering", "web-backend"]
    },
    {
        id: "web-backend",
        title: "Web and Backend Engineering",
        short: "HTTP, APIs and JSON first, then the web platform, backend design and security fundamentals.",
        audience: ["Developers and testers who work with APIs", "Learners heading to full-stack work"],
        intro: [
            "Web applications talk to their servers in JSON over HTTP. Reading and writing that JSON correctly, and pulling the right value out of a large response, are everyday skills for developers and for testers who check APIs.",
            "Two labs here give checked practice on exactly that. The JSON Error-Fixing Lab teaches you to repair broken JSON the way a strict parser sees it, and the JSONPath Challenge Lab has you write queries that are evaluated by an RFC 9535 engine against a real document. When you need the full utilities, the Developer Tools section has the JSON Formatter, the JSONPath Tester, the JWT Decoder and the URL Parser.",
            "Learning paths for HTTP and REST APIs, the web platform and backend fundamentals are being built; API testing itself lives in Software Testing and Quality Engineering.",
            "Both labs check your answer exactly instead of guessing. A repaired document must parse as strict JSON, and a query must return exactly the expected values from the document, so you see the effect of every bracket, quote and filter. Each exercise comes with hints and an explained solution."
        ],
        technologies: [
            { title: "JSON: reading and repairing", status: "lab", lab: "json-error-fixing-lab" },
            { title: "JSONPath queries", status: "lab", lab: "jsonpath-challenge-lab" },
            { title: "HTTP and REST APIs", status: "planned" },
            { title: "HTML, CSS and the DOM", status: "planned" },
            { title: "Backend fundamentals", status: "planned" }
        ],
        paths: [],
        labs: ["json-error-fixing-lab", "jsonpath-challenge-lab"],
        decks: ["JSON", "HTTP and APIs"],
        start: { label: "Start by fixing broken JSON in the JSON Error-Fixing Lab.", lab: "json-error-fixing-lab" },
        related: ["software-testing", "programming", "devops-cloud-security"]
    },
    {
        id: "devops-cloud-security",
        title: "DevOps, Cloud and Cybersecurity",
        short: "Git, the command line, pipelines, containers, cloud concepts and secure coding, practised in safe simulators.",
        audience: ["Developers and testers moving towards DevOps", "Security beginners"],
        intro: [],
        technologies: [
            { title: "Cron schedules", status: "lab", lab: "cron-challenge-lab" },
            { title: "Git and GitHub", status: "planned" },
            { title: "CI/CD pipelines", status: "planned" },
            { title: "Web security fundamentals", status: "planned" }
        ],
        paths: [],
        labs: ["cron-challenge-lab"],
        decks: [],
        related: ["web-backend", "automation-engineering"]
    }
]);

export const isPublished = (department) => department.paths.length > 0 || department.labs.length >= 2;
export const publishedDepartments = () => DEPARTMENTS.filter(isPublished);
export const getDepartment = (id) => DEPARTMENTS.find((d) => d.id === id) ?? null;
