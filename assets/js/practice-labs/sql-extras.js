/* =========================================================
   ToolZen Hub
   SQL learning path: the teaching sections added to each lesson

   The lessons of the SQL Practice Lab (tools/sql-practice-lab/lessons.js) hold the explanation, the examples with their
   results, the common mistakes and the exercises. This file adds the parts the learning path shows around them: what the
   learner will be able to do, why the topic matters at work, an everyday analogy, a short knowledge check and a summary.
   All text is original to this site. `prerequisite` is only set where it is not simply "the previous lesson".
========================================================= */

export const sqlExtras = {
    databases: {
        prerequisite: "None. A complete beginner can start here.",
        objectives: [
            "Explain what a database, a table, a row and a column are",
            "Say what a primary key and a foreign key do",
            "Describe how the practice shop database is organised"
        ],
        why: "Every SQL query is a question about tables. If you can picture the table, you can predict what a query will return. Almost every business application, from online shops to hospital systems, keeps its records in tables like these, and analysts, developers and testers all read them with SQL.",
        analogy: "A table is like one sheet of a spreadsheet: the header row names the columns and every line below it is one record. A database is the whole workbook, with several sheets that refer to each other by ID number, the way an order slip refers to a customer by customer number.",
        check: [
            { q: "In the orders table, what does one row represent?", a: "One order. A row is one record, and each column is one fact about it, such as its date or its status." },
            { q: "What does orders.customer_id hold?", a: "The id of a customer. It is a foreign key that links each order to one row of the customers table." }
        ],
        summary: "A database holds tables; a table holds rows (records) and columns (facts). A primary key identifies a row, a foreign key points to a row in another table, and SQL is the language you use to ask for or change the data."
    },
    select: {
        objectives: [
            "Write a SELECT ... FROM query",
            "Choose columns by name, or every column with *",
            "Predict the shape of a result, its columns and its rows, before running the query"
        ],
        why: "SELECT is the starting point of nearly all SQL work. Reports, dashboards, data checks and test-data lookups all begin by choosing which columns to read from which table, and naming the columns you need keeps results small and easy to read.",
        analogy: "Think of ordering from a menu: FROM says which menu (table) you are looking at, and SELECT says which dishes (columns) you want. Asking for * means everything on the menu.",
        check: [
            { q: "What does SELECT name, city FROM customers; return?", a: "Two columns, name and city, for every row of the customers table." },
            { q: "Why is naming the columns better than SELECT * in a real report?", a: "The result holds only the facts you need, so it is smaller and clearer, and it does not change when someone later adds a column to the table." }
        ],
        summary: "SELECT names the columns, FROM names the table, and the result has one row for each row of the table. Use column names instead of * when you need only some of the facts."
    },
    expressions: {
        objectives: [
            "Calculate new values inside a SELECT",
            "Give result columns readable names with AS",
            "Use simple text and number functions"
        ],
        why: "Reports rarely want raw columns. They want totals, tax amounts, tidy names and rounded figures, and SQL can produce them in the query itself instead of in a spreadsheet afterwards.",
        analogy: "A calculated column is like adding a formula column next to your data in a spreadsheet, and AS is the label you type in its header.",
        check: [
            { q: "How do you show each product's price with 18% added, in a column called with_tax?", a: "SELECT price * 1.18 AS with_tax FROM products;" },
            { q: "Does AS rename the column in the table?", a: "No. It only names the column in the result. The stored table is unchanged." }
        ],
        summary: "A SELECT can calculate (price * quantity), join pieces of text and call functions such as ROUND, UPPER and LENGTH. AS gives each result column a clear name. Calculations change only the result, never the stored table."
    },
    errors: {
        objectives: [
            "Read a SQL error message",
            "Recognise typical mistakes: a missing comma, a misspelt column, text without quotes",
            "Fix a failing query one step at a time"
        ],
        why: "Everyone writes queries that fail. Reading the message calmly and checking the usual causes is faster than guessing, and it is a skill that testers, analysts and developers use every day.",
        analogy: "An error message is like a spell-checker's underline: it points near the problem, and the cause is usually a small slip.",
        check: [
            { q: "What does \"no such column\" usually mean?", a: "The column name is misspelt, belongs to a different table, or a text value was written without quotes so SQL took it for a column." },
            { q: "If a query runs without an error, is it correct?", a: "Not necessarily. Also check that the rows and the columns are the ones you meant." }
        ],
        summary: "Read the message, find the word or position it names, and check the usual suspects: the spelling of tables and columns, commas between columns, quotes around text and matching brackets. A query that runs can still be wrong, so check the result as well."
    },
    where: {
        objectives: [
            "Filter rows with WHERE",
            "Use comparisons, AND, OR, IN, BETWEEN and LIKE",
            "Write text values in single quotes"
        ],
        why: "Real tables hold thousands or millions of rows and you almost never want all of them. WHERE is how you ask for the orders of one customer, the products under a price or the records of last month.",
        analogy: "WHERE is a sieve: every row is poured through the condition, and only the rows for which the condition is true come out the other side.",
        check: [
            { q: "Which rows does WHERE price > 100 AND category = 'Home' keep?", a: "Only the rows where both conditions are true: a price above 100 and a category that is exactly Home." },
            { q: "What is wrong with WHERE city = Mumbai?", a: "Text must be in single quotes: WHERE city = 'Mumbai'. Without quotes SQL looks for a column called Mumbai." }
        ],
        summary: "WHERE keeps the rows whose condition is true. Combine conditions with AND and OR (use brackets when you mix them), use IN for a list, BETWEEN for a range and LIKE for text patterns. Text values go in single quotes."
    },
    sorting: {
        objectives: [
            "Sort results with ORDER BY, ascending and descending",
            "Keep only the first rows with LIMIT",
            "Remove repeated values with DISTINCT"
        ],
        why: "Rankings, top-10 lists, the latest records and lists of unique values, such as the cities you ship to, are among the most common questions asked of data.",
        analogy: "ORDER BY lines the rows up by height, LIMIT keeps only the first few in the line, and DISTINCT asks each group of identical people to send just one representative.",
        check: [
            { q: "How do you list the three most expensive products?", a: "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;" },
            { q: "Is LIMIT 3 without ORDER BY a reliable way to get the top three?", a: "No. Without ORDER BY the database may return any three rows, so the order must be stated first." }
        ],
        summary: "ORDER BY sorts (ASC is the default and DESC reverses it), LIMIT keeps the first n rows of the sorted result and DISTINCT removes repeated rows from the result. Without ORDER BY the order of rows is not guaranteed."
    },
    nulls: {
        objectives: [
            "Explain what NULL means",
            "Test for it with IS NULL and IS NOT NULL",
            "Predict how NULL behaves in comparisons and totals"
        ],
        why: "Missing data is everywhere: an unknown phone number, a date not yet entered. Treating NULL like an ordinary value is one of the most common causes of wrong reports and of records that quietly go missing from results.",
        analogy: "NULL is a blank on a paper form. A blank is not the number zero or the word none; it means nobody wrote anything. Asked whether two blanks are equal, the honest answer is unknown.",
        check: [
            { q: "Why does WHERE joined = NULL return no rows?", a: "A comparison with NULL is never true. Use WHERE joined IS NULL." },
            { q: "Is NULL the same as 0 or an empty string?", a: "No. NULL means the value is missing or unknown; 0 and '' are real values." }
        ],
        summary: "NULL means no value. A comparison with NULL (= NULL, <> NULL) is never true, so use IS NULL and IS NOT NULL. Aggregates such as SUM and AVG ignore NULLs."
    },
    case: {
        objectives: [
            "Write a CASE expression with WHEN, THEN and ELSE",
            "Group values into labelled bands",
            "Use CASE in the SELECT list to label each row"
        ],
        why: "CASE puts if-then logic into a query: price bands, new or returning customers, pass or fail labels. One query can then produce a report that would otherwise need several.",
        analogy: "CASE is a row of labelled boxes with rules: the first rule a value satisfies decides which label it gets, like sorting parcels by weight.",
        check: [
            { q: "What does CASE return when no WHEN matches and there is no ELSE?", a: "NULL." },
            { q: "Why does the order of the WHEN lines matter?", a: "The first true condition wins, so a broad condition placed first can hide a narrower one below it." }
        ],
        summary: "CASE tests its WHEN conditions in order and returns the THEN value of the first true one, or the ELSE value (NULL if there is no ELSE). Put the most specific condition first."
    },
    aggregates: {
        objectives: [
            "Summarise rows with COUNT, SUM, AVG, MIN and MAX",
            "Group results with GROUP BY",
            "Filter groups with HAVING and explain how it differs from WHERE"
        ],
        why: "Managers want totals and averages, not thousands of rows: sales per month, orders per customer, failed tests per release. Aggregation is the core of reporting.",
        analogy: "GROUP BY sorts receipts into piles, one pile per shop, and the aggregate then adds up or counts each pile. WHERE throws receipts away before piling; HAVING throws piles away after counting.",
        check: [
            { q: "What is the difference between WHERE and HAVING?", a: "WHERE filters individual rows before they are grouped. HAVING filters the groups afterwards, so it can use COUNT or SUM." },
            { q: "Does COUNT(column) count rows where the column is NULL?", a: "No. COUNT(column) ignores NULLs, while COUNT(*) counts every row." }
        ],
        summary: "Aggregates collapse many rows into one value. GROUP BY makes one result row per group. WHERE filters rows before grouping and HAVING filters groups afterwards."
    },
    joins: {
        visual: "join",
        objectives: [
            "Explain why data is split across tables",
            "Combine tables with INNER JOIN and LEFT JOIN",
            "Write the ON condition that links a foreign key to a primary key"
        ],
        why: "A well-designed database stores each fact once, so an order refers to its customer by id. To report orders with customer names you must join the tables. Joins appear in almost every real query and in most SQL interviews.",
        analogy: "A join is matching an order slip to the customer card with the same customer number, then reading both together.",
        check: [
            { q: "Which kind of join shows customers who have never ordered?", a: "A LEFT JOIN from customers to orders, keeping the rows where the order side IS NULL." },
            { q: "What happens if a join has no ON condition?", a: "Every row of one table is paired with every row of the other, a huge result that is almost never wanted." }
        ],
        summary: "A JOIN pairs rows of two tables where the ON condition is true. INNER JOIN keeps only matching pairs; LEFT JOIN also keeps every left-table row and fills NULLs where nothing matches. Forgetting ON multiplies every row by every row."
    },
    subqueries: {
        objectives: [
            "Use a query inside another query",
            "Use IN and EXISTS with a subquery",
            "Name a step with WITH so a long query reads in order"
        ],
        why: "Many questions have two steps: find the average price, then list the products above it. Subqueries and WITH let you write the steps in order instead of working out the first answer by hand.",
        analogy: "A subquery is a note to yourself: first work out this number or list, then use it in the main question.",
        check: [
            { q: "What does WHERE price > (SELECT AVG(price) FROM products) do?", a: "It keeps the products whose price is above the average price of all products." },
            { q: "Why use WITH?", a: "It names an intermediate result, so a complex query is split into readable steps." }
        ],
        summary: "A subquery is a SELECT inside another statement. IN tests whether a value is in a list, EXISTS tests whether any row exists, and WITH names a step so a long query reads from top to bottom."
    },
    union: {
        objectives: [
            "Stack the results of two queries with UNION and UNION ALL",
            "State the rules the two queries must follow",
            "Choose between UNION and UNION ALL"
        ],
        why: "Data of the same shape is often held in separate places, such as this year and last year or two regions. UNION puts such results into one list for a single report.",
        analogy: "UNION is stapling two name lists together. UNION removes names that appear on both lists; UNION ALL keeps every line.",
        check: [
            { q: "What is the difference between UNION and UNION ALL?", a: "UNION removes duplicate rows from the combined result. UNION ALL keeps every row." },
            { q: "What must two queries share to be combined with UNION?", a: "The same number of columns, with compatible types, in the same order." }
        ],
        summary: "UNION stacks the rows of queries that have the same number of compatible columns. UNION removes duplicates; UNION ALL keeps them and is faster."
    },
    changing: {
        objectives: [
            "Add rows with INSERT, change them with UPDATE and remove them with DELETE",
            "Explain why WHERE matters in UPDATE and DELETE",
            "Check a change with a SELECT"
        ],
        why: "Applications constantly add orders, correct addresses and remove records. A missing WHERE on an UPDATE or DELETE changes every row, which is one of the most expensive mistakes in real databases.",
        analogy: "INSERT adds a new line to the register, UPDATE corrects an existing line and DELETE strikes a line out. Without WHERE you would be correcting or striking out every line at once.",
        check: [
            { q: "What happens with UPDATE products SET price = 0; (no WHERE)?", a: "Every product's price is set to 0." },
            { q: "How can you see which rows a DELETE will remove before running it?", a: "Run a SELECT with the same WHERE condition first." }
        ],
        summary: "INSERT adds rows, UPDATE changes the rows that match WHERE and DELETE removes the rows that match WHERE. Write the SELECT with the same WHERE first to see exactly which rows you are about to change."
    },
    cleaning: {
        objectives: [
            "Spot common data problems: extra spaces, mixed capitals, blanks and duplicates",
            "Fix them in a query with TRIM, LOWER and COALESCE",
            "Find repeated records with GROUP BY and HAVING"
        ],
        why: "Real data is untidy. Much of an analyst's or tester's time goes into finding and cleaning problems before any report can be trusted.",
        analogy: "Cleaning data is like tidying a contact list: trimming stray spaces, writing names the same way every time and merging entries that are really the same person.",
        check: [
            { q: "How do you treat an empty string as a missing value?", a: "NULLIF(column, '') turns an empty string into NULL, and COALESCE can then supply a default." },
            { q: "How do you find email addresses that appear more than once?", a: "GROUP BY email HAVING COUNT(*) > 1." }
        ],
        summary: "Use TRIM and LOWER or UPPER to normalise text, COALESCE and NULLIF for blanks and missing values, and GROUP BY with HAVING COUNT(*) > 1 to find duplicates. Clean in a SELECT first, then decide whether to change the stored data."
    },
    dialects: {
        objectives: [
            "Name common SQL databases and how they differ",
            "Recognise the syntax that varies between them",
            "Know what a practice database cannot teach"
        ],
        why: "At work you will meet MySQL, PostgreSQL, SQL Server, Oracle or others. The core of SQL carries over, but a few details differ, and knowing which ones saves hours of confusion.",
        analogy: "Dialects are like British and American English: the same language with some different spellings and words, so you are understood but should check the local form.",
        check: [
            { q: "Do all databases use LIMIT to restrict the number of rows?", a: "No. MySQL, PostgreSQL and SQLite use LIMIT; SQL Server uses TOP or OFFSET with FETCH, and Oracle uses FETCH FIRST." },
            { q: "Is a query that works in SQLite certain to work in PostgreSQL?", a: "No. Core queries usually do, but functions, date handling and type rules can differ." }
        ],
        summary: "SELECT, WHERE, JOIN and GROUP BY are shared by most databases. Dates, text functions, LIMIT or TOP, auto-numbering and identifier quoting vary, so check the documentation of the database you use."
    },
    windows: {
        objectives: [
            "Explain how a window function differs from GROUP BY",
            "Rank rows with RANK and ROW_NUMBER",
            "Use PARTITION BY and ORDER BY inside OVER"
        ],
        why: "Window functions answer top-three-per-category questions, running totals and comparisons with the previous month, which are hard to write any other way. They are common in analytics work and in interviews.",
        analogy: "GROUP BY folds each pile into one summary card. A window function keeps every row and writes the pile's summary, or the row's rank in its pile, next to it.",
        check: [
            { q: "What does PARTITION BY do inside OVER?", a: "It splits the rows into groups, and the calculation starts again for each group." },
            { q: "How is a window function different from GROUP BY?", a: "GROUP BY returns one row per group. A window function keeps every row and adds the calculated value to each of them." }
        ],
        summary: "A window function calculates across related rows without collapsing them. OVER defines the window: PARTITION BY splits it into groups and ORDER BY orders the rows inside each group."
    },
    design: {
        objectives: [
            "Create tables with column types and constraints",
            "Explain what a view and an index are for",
            "Describe the cost of an index"
        ],
        why: "Constraints stop bad data from entering the database, views give people a simple and safe window onto it, and indexes make searches fast. Together they decide whether a database stays correct and quick as it grows.",
        analogy: "Constraints are the rules on a form, such as a required field or a unique ID. A view is a saved report. An index is the alphabetical index at the back of a book.",
        check: [
            { q: "What does a PRIMARY KEY guarantee?", a: "Each row has a unique identifier that is never empty." },
            { q: "Why not put an index on every column?", a: "Every index takes space and must be updated on each insert, update and delete, so too many indexes slow writing down." }
        ],
        summary: "CREATE TABLE defines columns and rules (PRIMARY KEY, NOT NULL, UNIQUE, CHECK, FOREIGN KEY). A view saves a query under a name. An index speeds up lookups on a column but costs storage and slows writes."
    },
    transactions: {
        objectives: [
            "Explain what a transaction is and why it matters",
            "Use BEGIN, COMMIT and ROLLBACK",
            "Describe all-or-nothing behaviour with an example"
        ],
        why: "Moving money between two accounts takes two updates. If the system fails between them, one account loses money and the other gains none. A transaction makes related changes succeed or fail together.",
        analogy: "A transaction is a bank transfer slip: either the whole slip is processed or none of it is. ROLLBACK is tearing the slip up before anything is posted.",
        check: [
            { q: "What does ROLLBACK do?", a: "It cancels every change made since BEGIN and leaves the data as it was." },
            { q: "Why are two related updates put in one transaction?", a: "So that a failure between them cannot leave the data half changed." }
        ],
        summary: "A transaction groups statements so that they are applied together (COMMIT) or not at all (ROLLBACK). BEGIN starts one. This all-or-nothing behaviour protects the data when something fails halfway."
    }
};
