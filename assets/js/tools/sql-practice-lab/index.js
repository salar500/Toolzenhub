/* =========================================================
   ToolZen Hub
   SQL Practice Lab (Practice Labs)

   Write SQL against a small practice database and have it checked. The statements really run: SQLite (sql.js, compiled to
   WebAssembly) executes them in a Web Worker on a new in-memory copy of the data, and the result is compared with the
   expected one. Nothing is sent anywhere, nothing is saved, and a statement that runs longer than 3 seconds is stopped.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { MAX_RESPONSE_CHARS, createEvaluator } from "./evaluator.js";
import { createRunner } from "./sql-runner.js";
import { set } from "./exercises.js";
import { lessons } from "./lessons.js";
import { SETUP, CLEANING_SETUP } from "./dataset.js";
import { lessonsMarkup, sandboxMarkup, showResult } from "./lessons-view.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "SQL Practice Lab";

export function markup() {

    return labMarkup({
        id: "sql-practice-lab",
        title: TITLE,
        intro: "Learn SQL from the start. Read the lessons, run their examples, then solve forty-nine exercises on a small shop database, from SELECT and WHERE to joins, grouping, window functions, data cleaning, changing data, constraints, transactions and a small sales-report project. Your statements really run, in SQLite inside your browser, and your result is checked against the expected one.",
        worked: {
            heading: "A Worked Example",
            intro: "Task: return the names of the customers who live in Mumbai. This example cannot be submitted; it shows the reasoning you will use.",
            example: "SELECT name FROM customers WHERE city = 'Mumbai';",
            steps: [
                "Decide what to return: the name column.",
                "Decide where it lives: the customers table, which goes after FROM.",
                "Decide which rows: only those whose city is Mumbai, which is a condition after WHERE. Text is in single quotes.",
                "Run it. The result has one column and two rows, Bilal Khan and Farhan Ali. Check the rows and the columns, not only that there was no error."
            ]
        },
        howTo: [
            "Read the task and the objective. Each exercise says exactly what the result should contain.",
            "Type your SQL. Several statements are allowed, separated by semicolons. For a query, the result of the last statement is the one that counts.",
            "Press Check answer. Your SQL runs on a fresh copy of the practice database, so nothing you do carries over to the next check.",
            "If the result is not the expected one, you are told whether the columns, the number of rows or the values differ, and you see the first rows your query returned. The expected rows are never shown.",
            "For an exercise that changes data (INSERT, UPDATE, DELETE, CREATE), the lab runs its own query after your statements and checks that result.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        afterApp: lessonsMarkup(lessons, set.exercises) + sandboxMarkup(),
        sections: [
            {
                heading: "The Practice Database",
                paragraphs: [
                    "Four small tables of an imaginary shop, plus one untidy table for cleaning practice. Every check starts from the same data."
                ],
                items: [
                    "customers: id, name, city, joined (the join date as text, empty for one customer)",
                    "products: id, name, category, price (whole rupees)",
                    "orders: id, customer_id, order_date (text, YYYY-MM-DD), status (delivered, shipped, pending or cancelled)",
                    "order_items: order_id, product_id, quantity, one row for each product in an order",
                    "contacts_raw: id, name, email, city, signup. A deliberately untidy table (extra spaces, mixed capitals, empty and missing emails, a repeated person, invalid dates) used by the data cleaning exercises. It appears only in those exercises, the data cleaning lesson and the sandbox."
                ]
            },
            {
                heading: "SQL Quick Reference",
                paragraphs: [
                    "A short reminder of the parts used in the exercises. It is a reference, not a full course."
                ],
                items: [
                    "A query is written in this order: SELECT columns FROM table JOIN ... ON ... WHERE condition GROUP BY columns HAVING condition ORDER BY columns LIMIT n. Only SELECT and FROM are required.",
                    "The database works through a query roughly in this order: FROM and JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. That is why a WHERE cannot use an aggregate, and HAVING can.",
                    "JOIN (INNER JOIN) keeps the rows that match in both tables. LEFT JOIN keeps every row of the left table and fills the other table's columns with NULL when nothing matches.",
                    "COUNT, SUM, AVG, MIN and MAX summarise rows. They ignore NULL values, except COUNT(*), which counts rows.",
                    "NULL means no value. A comparison with NULL is never true, so use IS NULL and IS NOT NULL.",
                    "INSERT adds rows, UPDATE changes them and DELETE removes them. UPDATE and DELETE without a WHERE affect every row.",
                    "CREATE TABLE defines columns and rules: PRIMARY KEY, NOT NULL, UNIQUE, CHECK and FOREIGN KEY. SQLite does not enforce foreign keys unless you turn them on with PRAGMA foreign_keys = ON.",
                    "A view saves a query under a name. An index speeds up lookups on a column at the cost of extra storage and slower writes. A transaction (BEGIN ... COMMIT) makes several changes succeed or fail together.",
                    "A window function (for example RANK() OVER (PARTITION BY ... ORDER BY ...)) computes a value across related rows without collapsing them into one."
                ]
            },
            {
                heading: "SQLite and Other Databases",
                paragraphs: [
                    "The lab runs SQLite. The core of SQL (SELECT, WHERE, JOIN, GROUP BY, subqueries) is shared by most databases, but details differ: dates and text functions, how a number of rows is limited (LIMIT here; TOP or FETCH FIRST elsewhere), how whole numbers are divided, and how strictly column types are enforced. Nothing here is a claim about MySQL, PostgreSQL, SQL Server or Oracle, and you should check the manual of the database you use.",
                    "Writing SQL for a real database also involves things a practice lab cannot test, such as permissions, concurrent users and the size of the data."
                ]
            },
            {
                heading: "About This Lab",
                paragraphs: [
                    "The exercises are written for this site and follow the SQLite documentation. They are practice, not a course and not a qualification. Nothing is saved when you leave the page, and nothing you type is sent anywhere. SQLite runs in a separate browser thread from a bundled copy of sql.js; a statement that runs longer than three seconds is stopped. The first check loads the engine, which is about 350 KB compressed."
                ]
            }
        ]
    });

}

export function render(mount = document.querySelector("#app")) {

    if (!mount) return;
    mount.innerHTML = markup();
    init();

}

export function init() {

    const runner = createRunner({
        workerUrl: new URL("./sql-worker.js", import.meta.url).href,
        libUrl: new URL("../../vendor/sql-js/sql-wasm.js", import.meta.url).href,
        wasmUrl: new URL("../../vendor/sql-js/sql-wasm.wasm", import.meta.url).href
    });

    wireExamples(runner);

    initLab({
        set,
        lab: {
            id: "sql-practice-lab",
            lessons: lessons.map((l) => ({ title: l.title, practise: l.practise })),
            limit: MAX_RESPONSE_CHARS,
            inputLabel: "Your SQL",
            rows: 6,
            evaluate: createEvaluator(runner)
        }
    });

}

/* The "Run this example" buttons and the sandbox. Nothing here is checked against an exercise; it only shows what the SQL returns. */
function wireExamples(runner) {

    const setup = [...SETUP, ...CLEANING_SETUP];

    const go = async (sql, out, button) => {
        button.setAttribute("aria-busy", "true");
        out.textContent = "Running...";
        const reply = await runner.run({ setup, sql });
        showResult(out, reply);
        button.removeAttribute("aria-busy");
    };

    document.addEventListener("click", (event) => {

        const button = event.target instanceof Element ? event.target.closest("[data-sql-run], #sql-sandbox-run") : null;

        if (!button || button.getAttribute("aria-busy") === "true") return;

        if (button.id === "sql-sandbox-run") {
            const sql = document.querySelector("#sql-sandbox-input")?.value ?? "";
            if (sql.trim() === "") return;
            go(sql, document.querySelector("#sql-sandbox-out"), button);
            return;
        }

        const holder = button.closest("div");
        const source = holder?.querySelector("[data-sql-source]");
        const out = holder?.querySelector("[data-sql-out]");

        if (source && out) go(source.textContent, out, button);

    });

}
