/* =========================================================
   ToolZen Hub
   Smart Flashcards deck: SQL

   Plain data (see learning/content-schema.js). Original questions and
   explanations; the sources are the SQLite documentation and the
   general SQL concept each card names. Where SQLite differs from the
   usual behaviour, the card says so. Every statement on a card whose
   answer depends on a result (NULL comparisons, NOT IN with NULL, COUNT
   and AVG with NULL, SUM of no rows, UNION and UNION ALL, a cross join, a
   repeated total after a join, UNIQUE with NULL, foreign keys off by
   default) was run on SQLite 3.40.1 through Python's sqlite3 module when
   the deck was written.
========================================================= */

export const deck = {
    id: "sql",
    version: "1.0.0",
    title: "SQL",
    description: "Reading and writing queries: selecting and filtering, NULL, grouping, joins, subqueries and windows, changing data, keys and constraints, indexes and transactions.",
    reviewed: {
        date: "2026-11-04",
        method: "Written by the author against the SQLite documentation. Result-dependent claims were run on SQLite 3.40.1 (Python sqlite3) when written. No second reviewer yet."
    },
    topics: [
        { id: "select", title: "SELECT and filtering" },
        { id: "nulls", title: "NULL" },
        { id: "aggregates", title: "Aggregates and grouping" },
        { id: "joins", title: "Joins" },
        { id: "advanced", title: "Subqueries and windows" },
        { id: "changing-data", title: "Changing data" },
        { id: "design", title: "Keys, constraints and indexes" },
        { id: "transactions", title: "Transactions" }
    ],
    cards: [
        {
            id: "sql-select-from", topic: "select", kind: "recall", difficulty: "beginner",
            prompt: "What do the SELECT and FROM parts of a query decide?",
            answer: "SELECT lists the columns or expressions to return, and FROM names the table (or tables) the rows are read from.",
            explanation: "Most queries have both parts. The columns after SELECT decide the shape of each result row, and the tables after FROM decide where the rows come from. Other clauses such as WHERE, GROUP BY and ORDER BY then filter, group and sort.",
            source: "SQLite documentation: SELECT"
        },
        {
            id: "sql-row-order", topic: "select", kind: "choice", difficulty: "intermediate",
            prompt: "A query has no ORDER BY. What can you rely on about the order of the rows?",
            options: [
                "The rows come back in the order they were inserted.",
                "The rows come back sorted by the first column.",
                "Nothing: the order is not defined, so use ORDER BY when order matters.",
                "The rows come back sorted by the primary key, then by insertion time."
            ],
            correct: 2,
            explanation: "SQL does not define the order of rows without ORDER BY. A database often returns them in a convenient order, such as insertion order, but that can change with an index, an update or a new version. Anything that depends on order, including LIMIT, needs ORDER BY.",
            source: "SQLite documentation: SELECT, ORDER BY"
        },
        {
            id: "sql-distinct", topic: "select", kind: "recall", difficulty: "beginner",
            prompt: "What does SELECT DISTINCT city FROM customers return when many customers share a city?",
            answer: "Each city once. DISTINCT removes duplicate rows from the result.",
            explanation: "DISTINCT compares the whole result row, so with one column it lists each value once. With several columns it removes only rows in which every selected column is the same.",
            source: "SQLite documentation: SELECT, DISTINCT"
        },
        {
            id: "sql-like-wildcards", topic: "select", kind: "recall", difficulty: "beginner",
            prompt: "In a LIKE pattern, what do the percent sign and the underscore stand for?",
            answer: "The percent sign matches any run of characters, including none. The underscore matches exactly one character.",
            explanation: "'A%' matches any text that starts with A, and 'A_' matches a two-character text that starts with A. In SQLite, LIKE ignores case for plain English letters by default; other databases may differ.",
            source: "SQLite documentation: the LIKE operator"
        },
        {
            id: "sql-union-all", topic: "select", kind: "choice", difficulty: "intermediate",
            prompt: "What is the difference between UNION and UNION ALL?",
            options: [
                "UNION ALL removes duplicate rows and UNION keeps them.",
                "UNION removes duplicate rows from the result; UNION ALL keeps them.",
                "UNION needs the same table names in both queries, UNION ALL does not.",
                "UNION sorts the result and UNION ALL leaves it unsorted."
            ],
            correct: 1,
            explanation: "Both stack the results of two queries that return the same number of columns. UNION also removes duplicate rows, which costs work, so UNION ALL is used when duplicates are fine or impossible. SELECT 1 UNION SELECT 1 returns one row and UNION ALL returns two.",
            source: "SQLite documentation: compound SELECT statements"
        },
        {
            id: "sql-null-equals", topic: "nulls", kind: "choice", difficulty: "beginner",
            prompt: "The table t has the values 1, NULL and 3 in column x. What does this query return?",
            code: "SELECT * FROM t WHERE x = NULL;",
            options: [
                "The row whose x is empty.",
                "All three rows.",
                "An error, because NULL cannot be compared.",
                "No rows, because x = NULL is never true."
            ],
            correct: 3,
            explanation: "A comparison with NULL gives unknown, not true, so WHERE keeps no row. The test for a missing value is x IS NULL, which returns the row with the empty x.",
            source: "SQLite documentation: NULL handling"
        },
        {
            id: "sql-count-star-vs-column", topic: "nulls", kind: "recall", difficulty: "intermediate",
            prompt: "A column x has the values 1, NULL and 3. What do COUNT(*) and COUNT(x) return?",
            answer: "COUNT(*) is 3, because it counts rows. COUNT(x) is 2, because it counts only the rows where x is not NULL.",
            explanation: "COUNT(*) counts rows whatever they hold. COUNT with a column counts the non-NULL values of that column, and COUNT(DISTINCT x) counts the different non-NULL values.",
            source: "SQLite documentation: aggregate functions, count()"
        },
        {
            id: "sql-avg-null", topic: "nulls", kind: "choice", difficulty: "intermediate",
            prompt: "A column holds 10, NULL and 20. What does AVG of the column return?",
            options: [
                "10, because the NULL counts as zero.",
                "NULL, because one value is missing.",
                "15, because the NULL is ignored.",
                "An error, because the column has a missing value."
            ],
            correct: 2,
            explanation: "Aggregate functions other than COUNT(*) ignore NULL values. The average is taken over 10 and 20, which is 15. If NULL meant zero for your data, say so explicitly, for example with COALESCE(value, 0).",
            source: "SQLite documentation: aggregate functions"
        },
        {
            id: "sql-not-in-null", topic: "nulls", kind: "choice", difficulty: "advanced",
            prompt: "What does this expression return in SQLite, and why does it matter for a query that uses NOT IN with a list that may contain NULL?",
            code: "SELECT 3 NOT IN (1, NULL);",
            options: [
                "1 (true), because 3 is not equal to 1.",
                "NULL (unknown), so a WHERE using it keeps no row.",
                "0 (false), because NULL matches every number.",
                "An error, because the list holds a NULL."
            ],
            correct: 1,
            explanation: "3 NOT IN (1, NULL) means 3 <> 1 AND 3 <> NULL. The first part is true, the second is unknown, and true AND unknown is unknown, so the row is not returned. A subquery that can return NULL in a NOT IN is a classic way to lose rows; NOT EXISTS or filtering the NULLs out avoids it.",
            source: "SQLite documentation: the IN and NOT IN operators"
        },
        {
            id: "sql-where-vs-having", topic: "aggregates", kind: "choice", difficulty: "intermediate",
            prompt: "Which statement about WHERE and HAVING is accurate?",
            options: [
                "WHERE filters rows before grouping; HAVING filters groups after the aggregates.",
                "HAVING filters rows before grouping; WHERE filters the groups afterwards.",
                "They are the same, and HAVING is only an older spelling of WHERE.",
                "WHERE can use aggregate functions such as COUNT(*) and HAVING cannot."
            ],
            correct: 0,
            explanation: "WHERE runs before GROUP BY, so it cannot use an aggregate that does not exist yet. HAVING runs after grouping, so HAVING COUNT(*) > 1 keeps only groups with more than one row.",
            source: "SQLite documentation: SELECT, GROUP BY and HAVING"
        },
        {
            id: "sql-group-by-rule", topic: "aggregates", kind: "recall", difficulty: "intermediate",
            prompt: "In a query with GROUP BY, what must every selected column be, in standard SQL?",
            answer: "Either one of the GROUP BY columns or inside an aggregate function such as COUNT, SUM or MAX.",
            explanation: "A group holds many rows, so a column that is neither grouped nor aggregated has no single value for the group. Most databases reject such a query. SQLite accepts it and picks a value from one row of the group, which is a trap when you move to another database.",
            source: "SQLite documentation: SELECT, aggregate queries"
        },
        {
            id: "sql-sum-of-nothing", topic: "aggregates", kind: "choice", difficulty: "advanced",
            prompt: "A table has no rows. What do SUM(x) and COUNT(x) return over it?",
            options: [
                "SUM is 0 and COUNT is 0.",
                "SUM is NULL and COUNT is NULL.",
                "SUM is NULL and COUNT is 0.",
                "Both return an error, because there is no data."
            ],
            correct: 2,
            explanation: "SUM over no rows returns NULL, not 0, while COUNT returns 0. A report that shows NULL as blank can hide a zero total; COALESCE(SUM(x), 0) turns it into 0. SQLite also has TOTAL(x), which returns 0.0 for no rows.",
            source: "SQLite documentation: aggregate functions, sum() and total()"
        },
        {
            id: "sql-count-distinct", topic: "aggregates", kind: "recall", difficulty: "intermediate",
            prompt: "What does COUNT(DISTINCT city) count?",
            answer: "The number of different city values, ignoring NULL.",
            explanation: "Each distinct non-NULL value counts once however many rows hold it. It is different from COUNT(city), which counts every row with a non-NULL city, and from COUNT(*), which counts all rows.",
            source: "SQLite documentation: aggregate functions, count()"
        },
        {
            id: "sql-inner-join", topic: "joins", kind: "recall", difficulty: "beginner",
            prompt: "What does an INNER JOIN between orders and customers on customer_id return?",
            answer: "Only the pairs of rows that match on the join condition. An order with no matching customer, or a customer with no orders, does not appear.",
            explanation: "JOIN on its own means INNER JOIN. Each result row combines one row from each table whose join condition is true. To keep unmatched rows from one side, use an outer join.",
            source: "SQLite documentation: SELECT, joins"
        },
        {
            id: "sql-left-join-missing", topic: "joins", kind: "choice", difficulty: "intermediate",
            prompt: "You want the customers who have never placed an order. Which query shape finds them?",
            options: [
                "An INNER JOIN of customers to orders, keeping rows where the order columns are NULL.",
                "A LEFT JOIN from customers to orders, keeping the rows where the order id IS NULL.",
                "A LEFT JOIN from orders to customers, keeping the rows where the customer id is 0.",
                "A cross join of customers and orders, keeping the first row of each customer."
            ],
            correct: 1,
            explanation: "A LEFT JOIN keeps every customer and fills the order columns with NULL when no order matches, so filtering on a NULL order id leaves exactly the customers without orders. An inner join drops those customers before the filter can see them.",
            source: "SQLite documentation: SELECT, outer joins"
        },
        {
            id: "sql-join-multiplies", topic: "joins", kind: "choice", difficulty: "advanced",
            prompt: "An order with a total of 100 has three item rows. You join orders to items and compute SUM(orders.total). What do you get?",
            options: [
                "100, because the order is one order.",
                "300, because the order row appears once for each item.",
                "An error, because orders.total is not an item column.",
                "NULL, because the totals of several rows cannot be added."
            ],
            correct: 1,
            explanation: "A join repeats the order row for each matching item row, so SUM adds the 100 three times. When you aggregate a value from the one side of a one-to-many join, sum it before the join or use a subquery, not after it.",
            source: "SQLite documentation: SELECT, joins"
        },
        {
            id: "sql-cross-join", topic: "joins", kind: "recall", difficulty: "intermediate",
            prompt: "Table a has 3 rows and table b has 4 rows. How many rows does a CROSS JOIN b return, and what is the common mistake that causes it?",
            answer: "12 rows, every pairing of a row from a with a row from b. It often happens by accident when a join has no ON condition, or the condition is missing from a comma join.",
            explanation: "The number of rows is the product of the two tables, so a forgotten join condition on two large tables can produce millions of rows. This is a common reason a query runs for a very long time.",
            source: "SQLite documentation: SELECT, joins and the cross join"
        },
        {
            id: "sql-self-join", topic: "joins", kind: "recall", difficulty: "advanced",
            prompt: "An employees table has a manager_id column that holds another employee's id. How do you list each employee next to their manager's name?",
            answer: "Join the table to itself, giving it two aliases, for example employees AS e JOIN employees AS m ON e.manager_id = m.id, then select e.name and m.name.",
            explanation: "A self join treats one table as two. The aliases are required, because otherwise the column names would be ambiguous. Use a LEFT JOIN if employees with no manager, such as the head of the company, must stay in the result.",
            source: "SQLite documentation: SELECT, table aliases"
        },
        {
            id: "sql-subquery-scalar", topic: "advanced", kind: "recall", difficulty: "intermediate",
            prompt: "What is a scalar subquery, and where can one be used?",
            answer: "A query in brackets that returns a single value (one row and one column). It can be used wherever a value is allowed, such as in WHERE price > (SELECT AVG(price) FROM products).",
            explanation: "The database computes the inner query and uses its single value in the outer one. If it returns more than one row, SQLite uses the first row and most other databases raise an error, so a scalar subquery should be written so that it cannot.",
            source: "SQLite documentation: expressions, scalar subqueries"
        },
        {
            id: "sql-window-vs-group", topic: "advanced", kind: "choice", difficulty: "advanced",
            prompt: "What is the main difference between GROUP BY with SUM and a window function such as SUM(x) OVER (PARTITION BY y)?",
            options: [
                "A window function is always slower and returns the same rows as GROUP BY does.",
                "GROUP BY keeps every row and a window function collapses each group into a row.",
                "A window function keeps every row and adds a group value; GROUP BY returns one row per group.",
                "A window function can only be used on numbers, and GROUP BY works on any column."
            ],
            correct: 2,
            explanation: "GROUP BY returns one row per group. A window function adds a computed value, such as the group total or a rank, to every original row, so you can show each row next to its group's total.",
            source: "SQLite documentation: window functions"
        },
        {
            id: "sql-update-no-where", topic: "changing-data", kind: "choice", difficulty: "beginner",
            prompt: "What does UPDATE products SET price = 0; do?",
            options: [
                "It changes only the first row of the table.",
                "It changes no row, because a WHERE clause is required.",
                "It sets price to 0 on every row of the table.",
                "It asks the database for confirmation before changing the rows."
            ],
            correct: 2,
            explanation: "Without a WHERE clause, UPDATE applies to every row and runs at once. The same is true of DELETE. A habit that saves data: write the WHERE first, or run the same condition as a SELECT before changing anything.",
            source: "SQLite documentation: UPDATE"
        },
        {
            id: "sql-delete-vs-drop", topic: "changing-data", kind: "recall", difficulty: "beginner",
            prompt: "What is the difference between DELETE FROM t and DROP TABLE t?",
            answer: "DELETE FROM t removes rows (all of them, or those matching a WHERE) and the table stays. DROP TABLE t removes the table itself, with its definition and rows.",
            explanation: "After DELETE the table is empty but still exists and can be filled again. After DROP TABLE the table no longer exists, so a query on it fails with no such table.",
            source: "SQLite documentation: DELETE, DROP TABLE"
        },
        {
            id: "sql-insert-columns", topic: "changing-data", kind: "recall", difficulty: "beginner",
            prompt: "Why list the column names in INSERT INTO t (a, b) VALUES (1, 2) instead of writing INSERT INTO t VALUES (1, 2)?",
            answer: "The values are matched to the columns you name, so the statement keeps working if the table later gains a column or its columns are reordered, and the order of values is visible.",
            explanation: "Without a column list, the values must match every column of the table in its stored order. Adding a column later breaks the statement or, worse, puts values in the wrong columns without an error.",
            source: "SQLite documentation: INSERT"
        },
        {
            id: "sql-primary-key", topic: "design", kind: "recall", difficulty: "beginner",
            prompt: "What is a primary key?",
            answer: "A column, or a combination of columns, whose value identifies each row of a table uniquely. It cannot repeat, and by the SQL standard it cannot be NULL.",
            explanation: "A primary key gives other tables something stable to refer to. SQLite allows NULL in a primary key column of an ordinary table for historical reasons unless NOT NULL is also written, which is another place where it differs from most databases.",
            source: "SQLite documentation: CREATE TABLE, PRIMARY KEY"
        },
        {
            id: "sql-foreign-key", topic: "design", kind: "choice", difficulty: "intermediate",
            prompt: "What does a foreign key constraint do, and what is special about SQLite?",
            options: [
                "It makes a column unique, and SQLite checks it only when a SELECT reads the column.",
                "It makes a column required, and SQLite keeps the constraint in a separate file.",
                "It encrypts a column, and SQLite cannot read the column without a password.",
                "It needs a value to exist in another table; SQLite enforces it only after PRAGMA foreign_keys = ON."
            ],
            correct: 3,
            explanation: "A foreign key such as orders.customer_id referencing customers.id stops an order from pointing at a customer that does not exist. In SQLite, enforcement is off by default for each connection, so the constraint can be written yet do nothing until PRAGMA foreign_keys = ON.",
            source: "SQLite documentation: foreign key support"
        },
        {
            id: "sql-unique-vs-primary", topic: "design", kind: "choice", difficulty: "intermediate",
            prompt: "Which statement about UNIQUE and PRIMARY KEY is accurate for SQLite?",
            options: [
                "A table can have only one UNIQUE constraint but any number of primary keys at once.",
                "Several UNIQUE constraints but one primary key are allowed; a UNIQUE column may hold several NULLs.",
                "A UNIQUE column cannot hold a NULL, while a primary key may hold many NULLs.",
                "UNIQUE and PRIMARY KEY are two different names for exactly the same constraint."
            ],
            correct: 1,
            explanation: "A table has at most one primary key but can have many UNIQUE constraints. SQLite treats each NULL as different, so a UNIQUE column can hold several NULLs; some other databases allow only one, so check the manual of the database you use.",
            source: "SQLite documentation: CREATE TABLE, constraints"
        },
        {
            id: "sql-normalization", topic: "design", kind: "choice", difficulty: "advanced",
            prompt: "Every row of an orders table repeats the customer's name and city. What problem does this design cause, and what is the usual fix?",
            options: [
                "Orders can no longer be sorted by date at all; the fix is to add an index on the city.",
                "Queries always become faster and the data cannot go wrong, so keep the repeated columns.",
                "The same fact is stored many times and can disagree after an update; move customers to their own table.",
                "The database refuses to store a second order for any customer; the fix is a unique key."
            ],
            correct: 2,
            explanation: "Repeating a fact such as a customer's city invites update anomalies: change it in one row and forget another, and the data contradicts itself. Normalising moves the fact into one table and refers to it by key.",
            source: "Relational database design: normalisation"
        },
        {
            id: "sql-index-tradeoff", topic: "design", kind: "choice", difficulty: "intermediate",
            prompt: "What is the trade-off of adding an index to a column?",
            options: [
                "Lookups can be faster, but the index uses storage and slows inserts, updates and deletes.",
                "Queries on the column are always faster, and the index has no cost of any kind.",
                "The table becomes read only for as long as the index exists, until it is dropped.",
                "The column's values are encrypted and cannot be read by any query that skips the index."
            ],
            correct: 0,
            explanation: "An index lets the database find rows without reading the whole table, at the cost of extra storage and extra work on every write. On a very small table the difference is not visible. EXPLAIN QUERY PLAN shows whether a query uses an index.",
            source: "SQLite documentation: CREATE INDEX, query planning"
        },
        {
            id: "sql-transaction-atomic", topic: "transactions", kind: "recall", difficulty: "intermediate",
            prompt: "What does it mean that a transaction is atomic?",
            answer: "All of its changes are applied together at COMMIT, or none of them are. If something fails part way, or you ROLLBACK, the database is left as it was before the transaction began.",
            explanation: "A transfer between two accounts is the standard example: subtract from one account and add to the other must both happen or neither. Atomicity is one of the four ACID properties, with consistency, isolation and durability.",
            source: "SQLite documentation: transactions"
        },
        {
            id: "sql-rollback", topic: "transactions", kind: "choice", difficulty: "beginner",
            prompt: "You run BEGIN, then UPDATE accounts SET balance = 0, then ROLLBACK. What is the state of the accounts table?",
            options: [
                "Every balance is 0, because the UPDATE ran and nothing can undo it afterwards.",
                "The balances are as they were before BEGIN, because ROLLBACK undid the update.",
                "The table stays locked against all other statements until the session ends.",
                "Only the first row is changed back and the other rows keep the new value."
            ],
            correct: 1,
            explanation: "Inside a transaction the changes are visible to you but not permanent. ROLLBACK discards them all, and COMMIT would have made them permanent. In SQLite, a statement outside BEGIN is its own transaction and commits at once.",
            source: "SQLite documentation: BEGIN, COMMIT, ROLLBACK"
        }
    ]
};
