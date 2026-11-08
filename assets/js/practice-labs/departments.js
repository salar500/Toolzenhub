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
            { title: "Test design techniques", status: "path", path: "test-design" },
            { title: "Test Design Lab (20 checked exercises)", status: "lab", lab: "test-design-lab" },
            { title: "Bug hunting on ShopLite and bug reports", status: "path", path: "manual-testing" },
            { title: "API testing", status: "planned" },
            { title: "Accessibility testing", status: "planned" }
        ],
        paths: ["manual-testing", "test-design"],
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
        intro: [
            "Automation turns checks that people would repeat on every release into programs that run in minutes, on every build. It is one of the most requested skills in testing jobs, and it builds directly on manual testing: a good automated test is a good test case written in code.",
            "This department starts with Playwright, the browser-testing framework from Microsoft that drives Chromium, Firefox and WebKit through one API, with TypeScript. You practise the skill that makes or breaks UI automation, finding elements reliably, directly in your browser on ShopLite, the same practice shop the testing department uses. A teaching evaluator checks each locator against ShopLite's real page and applies Playwright's strict-mode rule, and the page says plainly that it is a teaching subset.",
            "Real Playwright runs need Node.js on your computer; the setup lesson walks through it. API test automation, Selenium for Java teams, framework design and CI follow as the department grows."
        ],
        technologies: [
            { title: "Playwright with TypeScript", status: "path", path: "playwright" },
            { title: "API test automation", status: "planned" },
            { title: "Selenium WebDriver", status: "planned" },
            { title: "Framework design and CI", status: "planned" }
        ],
        paths: ["playwright"],
        start: { label: "Start with lesson 1 of Playwright with TypeScript.", path: "playwright" },
        labs: [],
        decks: [],
        related: ["software-testing", "programming"]
    },
    {
        id: "ai-engineering",
        title: "AI and AI Engineering",
        short: "How AI and language models work, how to evaluate them, and how AI applications are built and tested.",
        audience: ["Anyone who uses AI tools at work", "Developers building AI features", "Testers evaluating AI behaviour"],
        intro: [
            "AI tools now sit inside everyday work: assistants that draft and summarise, search that answers in sentences, support bots built on company documents. Using them well, building with them and testing them all depend on the same understanding of how they work and where they fail.",
            "This department starts with AI and LLM Foundations. It explains, without hype or heavy maths, how language models read text as tokens, why everything must fit in a context window, how temperature changes answers, and how retrieval-augmented generation grounds answers in real documents. Interactive visualizers let you split text into tokens, budget a context window, move temperature and top-p sliders, retrieve passages by similarity and move a classifier's threshold.",
            "Every visualizer is an honest teaching model: small hand-made data and the real formulas, running in your browser. No AI model runs, nothing is downloaded and nothing you type is sent anywhere. The later lessons turn to evaluation, hallucination, prompt injection, agents and responsible AI, the skills teams need to ship AI features safely. Prompt engineering in depth and machine-learning foundations follow as the department grows."
        ],
        technologies: [
            { title: "AI and LLM foundations", status: "path", path: "ai-foundations" },
            { title: "Prompt engineering and evaluation", status: "planned" },
            { title: "Machine learning foundations", status: "planned" }
        ],
        paths: ["ai-foundations"],
        start: { label: "Start with lesson 1 of AI and LLM Foundations.", path: "ai-foundations" },
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
            "The Statistics and Data Analysis path teaches the reasoning behind every report: averages and spread, percentiles and outliers, grouped summaries, cleaning, correlation, A/B tests and honest charts, with each calculation checked in your browser against the table shown. SQL for analytics lives in Database Engineering, and the same shop data appears in both, so what you learn in one carries over to the other.",
            "Each lab starts with short lessons whose examples you can edit, followed by exercises from simple sums to a small project. When an answer is not yet right, the check says so and, where it can tell, why: an Excel formula, for example, is also tried on a second set of numbers, which catches a typed-in result. A hint comes before the solution, so the lab is worth repeating until you can solve each task without help."
        ],
        technologies: [
            { title: "Excel formulas", status: "lab", lab: "excel-practice-lab" },
            { title: "Power BI: Power Query, modelling and DAX", status: "lab", lab: "power-bi-practice-lab" },
            { title: "SQL for analytics", status: "path", path: "sql" },
            { title: "Statistics and data analysis", status: "path", path: "statistics" },
            { title: "Data engineering fundamentals", status: "planned" }
        ],
        paths: ["statistics"],
        labs: ["excel-practice-lab", "power-bi-practice-lab"],
        decks: ["Excel", "Power BI"],
        start: { label: "Start with lesson 1 of Statistics and Data Analysis.", path: "statistics" },
        related: ["database-engineering", "ai-engineering"]
    },
    {
        id: "programming",
        title: "Software Development and Programming",
        short: "Python, JavaScript, Java and problem solving, with code you can run where the browser allows it.",
        audience: ["Complete beginners to programming", "Testers who need code for automation", "Students preparing for interviews"],
        intro: [
            "Programming is the skill underneath almost every technical role: developers build products with it, testers automate with it, analysts and data engineers script with it. Learning to break a problem into steps and express them precisely pays off in every department of these Practice Labs.",
            "This department starts with JavaScript, the language of the web and of Playwright, so it leads straight into Automation Engineering. You write real functions from the first lesson, and each exercise runs your code against its tests in your own browser, inside an isolated worker with no network access that is stopped after two seconds if a loop never ends. You see which test passed, which failed, what your function returned and anything you logged.",
            "The JavaScript path goes from values and loops to asynchronous code, interview problems and tested code. The Python path runs real Python in your browser through Pyodide, which loads only when you ask (about 13 MB, once) and runs in an isolated worker. The Java path is honest about its limits: Java does not run in the page, so you read real programs and predict exactly what they print, with every expected output recorded by compiling and running the code with Java 17."
        ],
        technologies: [
            { title: "JavaScript", status: "path", path: "javascript" },
            { title: "Python", status: "path", path: "python" },
            { title: "Java", status: "path", path: "java" }
        ],
        paths: ["javascript", "python", "java"],
        start: { label: "Start with lesson 1 of JavaScript Programming.", path: "javascript" },
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
            "The HTTP and REST APIs path teaches the protocol underneath it all: methods, status codes, headers, JSON bodies, tokens, validation errors, REST design and API testing. You build real requests and send them to a simulated ShopLite API that answers inside the page, so every response is repeatable and nothing leaves your browser. The HTML, CSS and the DOM path builds pages in a checked playground: your markup renders in a sandbox with scripts switched off and the checks read the elements and styles you produced. Backend fundamentals follow.",
            "Both labs check your answer exactly instead of guessing. A repaired document must parse as strict JSON, and a query must return exactly the expected values from the document, so you see the effect of every bracket, quote and filter. Each exercise comes with hints and an explained solution."
        ],
        technologies: [
            { title: "JSON: reading and repairing", status: "lab", lab: "json-error-fixing-lab" },
            { title: "JSONPath queries", status: "lab", lab: "jsonpath-challenge-lab" },
            { title: "HTTP and REST APIs", status: "path", path: "http-apis" },
            { title: "HTML, CSS and the DOM", status: "path", path: "html-css-dom" },
            { title: "Backend fundamentals", status: "planned" }
        ],
        paths: ["http-apis", "html-css-dom"],
        labs: ["json-error-fixing-lab", "jsonpath-challenge-lab"],
        decks: ["JSON", "HTTP and APIs"],
        start: { label: "Start with lesson 1 of HTTP and REST APIs.", path: "http-apis" },
        related: ["software-testing", "programming", "devops-cloud-security"]
    },
    {
        id: "devops-cloud-security",
        title: "DevOps, Cloud and Cybersecurity",
        short: "Git, the command line, pipelines, containers, cloud concepts and secure coding, practised in safe simulators.",
        audience: ["Developers and testers moving towards DevOps", "Security beginners"],
        intro: [
            "Software is only useful once it is shipped, running and safe. This department covers the skills around the code: version control with Git, the pipelines that build and test every change, containers and the cloud they run on, monitoring when things go wrong, and the security practices that keep customers' data safe.",
            "Git and DevOps Foundations starts with a Git simulator: you type real Git commands (status, add, commit, restore, branch, switch, merge, log) into a modelled repository shown beside the terminal, and each task checks the repository's state, so you learn by doing without risking your own files. Later lessons explain CI/CD pipelines, Dockerfiles, cloud service models and incident handling with checked questions and ordering tasks.",
            "Application Security Foundations is defensive code review: you read vulnerable and fixed code for injection, cross-site scripting, authentication, access control and secrets, and choose the right fix. Linux and the Command Line has its own shell simulator, a model Linux file system where you navigate, grep logs, build pipelines, copy, move and change permissions with real commands. Kubernetes and Deployment explains Compose stacks, Deployments, probes, release strategies and reliability targets, and the Cron Challenge Lab adds scheduled-job practice."
        ],
        technologies: [
            { title: "Git and GitHub", status: "path", path: "git-devops" },
            { title: "CI/CD pipelines", status: "path", path: "git-devops" },
            { title: "Web security fundamentals", status: "path", path: "app-security" },
            { title: "Linux and the shell", status: "path", path: "linux" },
            { title: "Kubernetes and deployment", status: "path", path: "kubernetes" },
            { title: "Cron schedules", status: "lab", lab: "cron-challenge-lab" }
        ],
        paths: ["git-devops", "linux", "kubernetes", "app-security"],
        start: { label: "Start with lesson 1 of Git and DevOps Foundations.", path: "git-devops" },
        labs: ["cron-challenge-lab"],
        decks: [],
        related: ["web-backend", "automation-engineering"]
    }
]);

export const isPublished = (department) => department.paths.length > 0 || department.labs.length >= 2;
export const publishedDepartments = () => DEPARTMENTS.filter(isPublished);
export const getDepartment = (id) => DEPARTMENTS.find((d) => d.id === id) ?? null;
