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
        id: "manual-testing",
        title: "Manual Software Testing",
        department: "software-testing",
        status: "building",
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
            }
        ],
        coming: [
            "Intermediate: test data and coverage, executing tests and writing bug reports, the bug life cycle, types of testing (functional, regression, smoke and sanity, exploratory)",
            "Advanced: test planning, risk-based testing, testing in Agile teams and test metrics",
            "Projects: a bug hunt on ShopLite's test release with checked bug reports, and a test plan for a release",
            "Interview practice for manual testing"
        ]
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
