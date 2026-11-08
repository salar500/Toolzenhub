/* =========================================================
   ToolZen Hub
   Practice Labs learning paths: the curriculum structure

   Plain data and pure helpers; the site build turns them into pages (practice-labs/learn-html.js) and nothing here touches
   the DOM. A path has levels (beginner, intermediate, advanced), a level has modules and a module has lessons. A lesson is
   published only when its content exists: `lesson` names the id in the path's content source (for SQL, the lessons of the
   SQL Practice Lab, with the extra teaching sections in sql-extras.js). A path whose status is "planned" has no pages and is
   shown as planned; nothing here claims a path is finished that is not (docs/practice-labs-platform.md keeps the plan).

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
        status: "building",
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
                            { id: "aggregates", slug: "aggregates-group-by-having", title: "Summarising: aggregates, GROUP BY and HAVING" }
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
                        summary: "Rank rows and compare each row with its group without collapsing the data.",
                        lessons: [
                            { id: "windows", slug: "window-functions", title: "Window functions" }
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
        /* what the path will still gain; shown on the path page so the visitor knows this path is not finished */
        coming: [
            "Recursive queries and more window-function practice",
            "Reading execution plans and basic query tuning",
            "Practice projects: employees, banking, e-commerce, healthcare and business reporting",
            "Interview-style challenges"
        ]
    },
    { id: "manual-testing", title: "Manual Software Testing", status: "planned", tagline: "Test design, test cases, bug reports and the testing life cycle, with practical scenarios." },
    { id: "playwright", title: "Playwright", status: "planned", tagline: "Browser test automation: locators, assertions, fixtures, the Page Object Model and debugging." },
    { id: "power-bi", title: "Power BI", status: "planned", tagline: "Data modelling, DAX and dashboards, with practice that does not need Power BI Desktop and clear notes where it does." },
    { id: "java", title: "Java", status: "planned", tagline: "Programming fundamentals through object-oriented design, collections and streams." },
    { id: "python", title: "Python", status: "planned", tagline: "Fundamentals, data structures, files, exceptions and automation." },
    { id: "api-testing", title: "API Testing", status: "planned", tagline: "HTTP, methods, status codes, headers, JSON and authentication, with positive and negative tests." },
    { id: "git-github", title: "Git and GitHub", status: "planned", tagline: "Repositories, commits, branches, merging, pull requests and conflict resolution." }
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
