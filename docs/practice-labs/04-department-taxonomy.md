# 04. Final software department taxonomy

**Final (the owner, 2026-11-08; rulebook 4.10).** The owner's master development mission fixed eight departments and their order. This replaces the earlier proposal, which had Git in Programming, SQL inside "Databases, Backend and APIs" and a different order.

**Registry:** `assets/js/practice-labs/departments.js`.

## 1. Rules

- **One canonical home per subject.** Other departments link to it and never copy it.
  - Examples: SQL lives in Database Engineering and is linked from Data and Analytics; JavaScript lives in Programming and is used by Automation.
- **Department pages are a discovery layer only.**
  - A department page is at `/practice-labs/<department>/`.
  - Path URLs (`/practice-labs/<path>/...`) and lab URLs (`/tools/<id>/`) never contain the department, so a subject can move between departments without a broken link.
- **A department page is published only with real content:** at least one learning path or at least two labs. Otherwise it is listed on `/practice-labs/` as "in development", with no link.
- **One URL namespace.** Department ids, path ids and reserved names (`shoplite`, `api-sandbox`, `search`, `projects`, `interview`) never collide (unit test).

## 2. The eight departments and their canonical subjects

Path ids refer to [05](05-learning-path-catalogue.md). "Existing" marks what already ships.

| # | Id | Department | Canonical home of | Existing assets | State |
|---|---|---|---|---|---|
| 1 | `database-engineering` | Database Engineering | SQL (P50, existing path); Database Design and Modelling (P51); PostgreSQL in Practice (P52); Database Testing (new) | SQL path (18 lessons), SQL Practice Lab | **Published** |
| 2 | `software-testing` | Software Testing and Quality Engineering | Manual Software Testing (P01); Test Design (P02); API Testing (P03); Accessibility Testing (P04); Performance Testing (P05); Testing AI Systems (P06) | Test Design Lab, software-testing deck | In development (1 lab) |
| 3 | `automation-engineering` | Automation Engineering | Playwright (P07); API Test Automation (P08); Selenium (P09); Framework Design and CI (P10); Cypress (concept-level comparison only, after P07) | none | In development |
| 4 | `ai-engineering` | AI and AI Engineering | AI and LLM Foundations (P60); Prompt Engineering and Evaluation (P61); LLM Applications: RAG, tools, agents (P62); Machine Learning Foundations (P63); Deep Learning (P64); Responsible AI (P65) | none | In development |
| 5 | `data-analytics` | Data and Analytics Engineering | Excel (P70); Power BI, Power Query and DAX (P71); Statistics (P72); pandas (P73); Data Cleaning (P74); Data Engineering (P75) | Excel and Power BI labs, two decks | **Published** |
| 6 | `programming` | Software Development and Programming | Python (P15); Java (P16); JavaScript (P30); TypeScript (P31); DSA and problem solving (P32); Regular Expressions (P33) | none | In development |
| 7 | `web-backend` | Web and Backend Engineering | HTML and CSS (P20); DOM (P21); Web Accessibility for Developers (P22); Frontend Frameworks (P23); HTTP and REST API Design (P53); Backend Fundamentals (P54) | JSON Error-Fixing and JSONPath labs, JSON and HTTP decks | **Published** |
| 8 | `devops-cloud-security` | DevOps, Cloud and Cybersecurity | Git and GitHub (P13); Command Line (P14); CI/CD (P41); Docker (P42); Cloud (P43); Kubernetes (P44); Web Security (P45) | Cron Challenge Lab | In development (1 lab) |

## 3. Overlaps and their canonical home

| Topic | Canonical home | Linked from |
|---|---|---|
| SQL for analytics | 1 Database (SQL path) | 5 Data |
| Database testing | 1 Database | 2 Testing |
| API testing | 2 Testing | 3 Automation (API automation builds on it), 7 Web (API design) |
| JavaScript and TypeScript foundations | 6 Programming | 3 Automation ("just enough TypeScript" module points to it) |
| Accessibility | 2 Testing (testing it) and 7 Web (building it): two different skills, cross-linked | each other |
| Git | 8 DevOps | 3 Automation, 6 Programming |
| Testing AI systems | 2 Testing (P06) | 4 AI |
| Security testing | 8 DevOps and Security | 2 Testing |
