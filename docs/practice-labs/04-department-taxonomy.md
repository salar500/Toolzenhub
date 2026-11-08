# 04. Final software department taxonomy

## 1. Evaluation of the proposed eight

| Proposed | Verdict | Reason |
|---|---|---|
| 1 Software Testing and Quality Engineering | **Keep** | Launch audience ([03](03-user-needs.md)); distinct thinking skills, no code needed |
| 2 Test Automation Engineering | **Keep, separate from 1** | A different audience step (code), different tools and runtime constraints; joining it with 1 would make a 15-path department |
| 3 Software Development and Programming | **Keep, renamed "Programming and Developer Foundations"**, and **absorbs Git and the command line** | Git and the shell are needed by every department; one home avoids duplication |
| 4 Web Development and Frontend Engineering | **Keep** | Distinct runtime (the browser DOM) and audience |
| 5 Backend, API and Database Engineering | **Keep, renamed "Databases, Backend and APIs"**; **owns SQL** | SQL is shared with data, but it is a database skill first; it is featured in department 7 by link |
| 6 AI, ML and AI Engineering | **Keep, renamed "AI and Machine Learning"** (mandatory) | Includes GenAI, LLMs, AI app development, agents, ML, deep learning, evaluation and responsible AI |
| 7 Data Science, Analytics and Data Engineering | **Keep, renamed "Data Analytics and Data Engineering"** | Hosts the existing Excel and Power BI labs; science-heavy ML stays in 6 |
| 8 DevOps, Cloud, Cybersecurity and Infrastructure | **Keep, renamed "DevOps, Cloud and Security"**; **security is a subdepartment label inside it** | Security alone is too thin to stand as a department at launch; a split is reconsidered when it reaches 4 or more paths |

**Rules that keep navigation clear:**

- **One home per path.** A path lives in exactly one department, which owns its URL.
- **Cross-listing is allowed** on another department's page, as a "Also useful" link that names the home department. It is never a copy.
- Departments are a **navigation and discovery layer only**. The department is **not** in the path URL ([09 architecture](09-technical-architecture.md), section 3), so moving a path between departments never breaks a link.
- Department and path slugs share the `/practice-labs/` namespace and must be unique (unit test).

## 2. Final departments

| # | Id / slug | Title | Audience | Paths (home) | Cross-listed in | Shared engines |
|---|---|---|---|---|---|---|
| D1 | `software-testing` | Software Testing and Quality | Manual testers, freshers, career switchers | Manual Software Testing; Test Design Techniques; API Testing; Accessibility Testing; Performance Testing Fundamentals; Testing AI Systems | D2 | Structured writing labs, ShopLite, API workbench |
| D2 | `test-automation` | Test Automation Engineering | Testers moving to code; automation engineers | Playwright with TypeScript; Selenium WebDriver with Java; API Test Automation; Automation Framework Design and CI | D1 | Code runner (JS/TS), locator evaluator, ShopLite, CI simulator |
| D3 | `programming` | Programming and Developer Foundations | Everyone writing code | Git and GitHub; Command Line and Bash; Python; Java; JavaScript Fundamentals; TypeScript; Data Structures and Algorithms for Interviews; Regular Expressions | all | Code runners (Python, Java, JS), Git simulator, shell simulator |
| D4 | `web-development` | Web Development and Frontend | Frontend learners | HTML and CSS; JavaScript in the Browser (DOM); Web Accessibility for Developers; Frontend Frameworks Concepts | D1 (accessibility) | Sandboxed iframe preview, accessibility checker |
| D5 | `databases-backend` | Databases, Backend and APIs | Backend, database, testers needing SQL | **SQL** (exists); Database Design and Modelling; PostgreSQL in Practice; HTTP and REST API Design; Backend Fundamentals | D1, D7 | SQLite WASM, PGlite (later), API workbench |
| D6 | `ai-ml` | AI and Machine Learning | AI learners, developers, testers using AI | AI and LLM Foundations; Prompt Engineering and Evaluation; Building LLM Applications (RAG, tools, agents); Machine Learning Foundations; Deep Learning Concepts; Responsible AI | D1 (Testing AI Systems) | Visualizers, prompt evaluation lab, notebook-style Python (later) |
| D7 | `data-analytics` | Data Analytics and Data Engineering | Analysts, business users | Excel for Data Analysis (lab exists); Power BI (lab exists); Statistics for Analysts; Data Analysis with Python (pandas); Data Cleaning; Data Engineering Fundamentals | D5 (SQL) | Excel engine, DAX and Power Query engines, Pyodide |
| D8 | `devops-cloud-security` | DevOps, Cloud and Security | Developers and testers moving to DevOps; security beginners | CI/CD Fundamentals; Docker and Containers; Cloud Fundamentals (vendor-neutral); Kubernetes Concepts; Web Security Fundamentals (subdepartment: Security) | D2 | CI simulator, container and shell simulators, code-reading security scenarios |

That is 8 departments and 44 paths in the catalogue (D1 6, D2 4, D3 8, D4 4, D5 5, D6 6, D7 6, D8 5) ([05](05-learning-path-catalogue.md)). Only paths with real lessons are ever linked (rule 4.10).

## 3. Per-department summary

Practical tools are defined in [07](07-interactive-tools-catalogue.md). Complexity runs from L (low) through M to H (high); maintenance runs from L (stable concepts) to H (fast-moving tools).

| Dept | Beginner subjects | Intermediate | Advanced | Projects | Interview prep | Depends on | Complexity | Maintenance |
|---|---|---|---|---|---|---|---|---|
| D1 | SDLC, STLC, test cases, bug reports | Test design techniques, API testing, test planning | Risk-based testing, accessibility, performance, testing AI | Test a release of ShopLite end to end | Manual testing Q&A, scenario questions | none | M (writing-lab checkers) | L |
| D2 | Automation concepts, first Playwright test | Locators, assertions, fixtures, POM, API tests | Framework design, CI, flaky-test debugging | Automate ShopLite checkout, CI pipeline | Playwright and Selenium questions, code review | D1, D3 (JS/TS or Java), D3 Git | H (runtime limits) | **H** (tool versions) |
| D3 | Variables, conditions, loops; Git basics | OOP, collections, branches and merges | Streams and generics, DSA, rebase and history | CLI apps, repository workflows | DSA and language questions | none | H (runtimes) | M |
| D4 | HTML, CSS, layout | DOM, events, forms, fetch | Accessibility, performance, frameworks concepts | Accessible form, mini app | Frontend questions | D3 JS | M | M |
| D5 | SQL basics | Joins, aggregation, design | Plans, indexes, transactions, recursion | Six SQL projects | SQL interview set | none | M (engine exists) | L |
| D6 | What AI and LLMs are, tokens, prompting | Evaluation, embeddings, RAG | Agents, fine-tuning concepts, deep learning | Evaluate a prompt suite; design a RAG flow | AI concept questions | D3 Python (for code parts) | H (no runtime AI) | **H** (field moves fast) |
| D7 | Excel, data types, charts | Power BI modelling, DAX, pandas | Data engineering, pipelines | Business reports | Analyst questions | D5 SQL | M (engines exist) | M |
| D8 | CI concepts, containers | Pipelines, Dockerfiles, cloud services | Kubernetes, security testing | Pipeline for ShopLite | DevOps and security questions | D3 Git, shell | M (simulators) | M |
