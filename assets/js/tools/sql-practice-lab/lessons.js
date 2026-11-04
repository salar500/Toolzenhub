/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the lessons

   Plain data. Each example's result (columns, the first rows, the row count) was produced by running its SQL on the practice
   database with an independent SQLite build (Python's sqlite3); tests/browser/sql-practice-lab.spec.js runs every example in the
   real engine on the page and requires the same result. `practise` lists exercise ids.
========================================================= */

export const lessons = [
    {
        "id": "databases",
        "title": "Databases, tables, rows and columns",
        "level": "beginner",
        "intro": "A relational database stores data in tables. A table is like a grid: each row is one record (one customer, one order) and each column is one fact about it (a name, a city). SQL is the language used to ask questions of such a database and to change what it holds.",
        "points": [
            "A table has a fixed set of columns, and each column has a type such as whole number (INTEGER), text (TEXT) or decimal number (REAL). SQLite is flexible about types; other databases are stricter.",
            "A primary key is a column whose value identifies each row uniquely, such as customers.id. A foreign key is a column that holds another table's key, such as orders.customer_id, which says which customer placed the order. Keys are how tables are connected.",
            "The practice database has four tables: customers, products, orders and order_items. An order_items row links one order to one product with a quantity, so an order with three products has three order_items rows."
        ],
        "examples": [
            {
                "sql": "SELECT * FROM customers LIMIT 3;",
                "says": "Shows the first three rows of the customers table: every column, three records.",
                "columns": [
                    "id",
                    "name",
                    "city",
                    "joined"
                ],
                "rows": [
                    [
                        1,
                        "Asha Rao",
                        "Pune",
                        "2023-01-15"
                    ],
                    [
                        2,
                        "Bilal Khan",
                        "Mumbai",
                        "2023-02-03"
                    ],
                    [
                        3,
                        "Chitra Iyer",
                        "Chennai",
                        "2023-02-20"
                    ]
                ],
                "total": 3
            }
        ],
        "mistakes": [
            "Thinking a table keeps its rows in a fixed order. Without ORDER BY the order is not defined.",
            "Forgetting that one real-world thing can be spread over several tables, so a question about orders may need the customers table as well."
        ],
        "practise": [
            "sql-select-all",
            "sql-select-columns"
        ]
    },
    {
        "id": "select",
        "title": "SELECT and FROM",
        "level": "beginner",
        "intro": "SELECT chooses which columns to return, and FROM says which table they come from. Almost every query starts here.",
        "points": [
            "SELECT * returns every column. Naming columns, as in SELECT name, city, returns only those, in the order you write them.",
            "A query never changes the table it reads. It only produces a result.",
            "Keywords such as SELECT and FROM are not case sensitive, and a statement ends with a semicolon. Writing keywords in capitals and putting each clause on its own line makes long queries easier to read."
        ],
        "examples": [
            {
                "sql": "SELECT name, city FROM customers;",
                "says": "Two columns of every customer, name first.",
                "columns": [
                    "name",
                    "city"
                ],
                "rows": [
                    [
                        "Asha Rao",
                        "Pune"
                    ],
                    [
                        "Bilal Khan",
                        "Mumbai"
                    ],
                    [
                        "Chitra Iyer",
                        "Chennai"
                    ],
                    [
                        "Arjun Mehta",
                        "Pune"
                    ],
                    [
                        "Divya Nair",
                        "Kochi"
                    ],
                    [
                        "Farhan Ali",
                        "Mumbai"
                    ]
                ],
                "total": 12
            }
        ],
        "mistakes": [
            "Using SELECT * in a report: the result changes when a column is added. Name the columns you need.",
            "Leaving out FROM, or misspelling the table name, which gives the error no such table."
        ],
        "practise": [
            "sql-select-all",
            "sql-select-columns"
        ]
    },
    {
        "id": "where",
        "title": "Filtering rows with WHERE",
        "level": "beginner",
        "intro": "WHERE keeps only the rows for which a condition is true. It is how you ask for the customers in one city or the products above a price.",
        "points": [
            "Comparison operators are =, <> (not equal), <, <=, > and >=. Text is written in single quotes: city = 'Pune'. Numbers are not quoted.",
            "AND needs both conditions to be true, OR needs either, and NOT reverses a condition. AND is worked out before OR, so use brackets when you mix them.",
            "IN (...) tests against a list, BETWEEN a AND b tests a range with both ends included, and LIKE matches a pattern where % stands for any run of characters and _ for exactly one."
        ],
        "examples": [
            {
                "sql": "SELECT name, price FROM products WHERE category = 'Electronics' AND price < 1000;",
                "says": "Only the electronics under 1000.",
                "columns": [
                    "name",
                    "price"
                ],
                "rows": [
                    [
                        "Calculator",
                        700
                    ],
                    [
                        "Laptop Stand",
                        950
                    ]
                ],
                "total": 2
            },
            {
                "sql": "SELECT name FROM customers WHERE city IN ('Pune', 'Kochi') OR name LIKE 'A%';",
                "says": "Customers in Pune or Kochi, plus any whose name starts with A.",
                "columns": [
                    "name"
                ],
                "rows": [
                    [
                        "Asha Rao"
                    ],
                    [
                        "Arjun Mehta"
                    ],
                    [
                        "Divya Nair"
                    ],
                    [
                        "Anil Kumar"
                    ],
                    [
                        "Jatin Verma"
                    ]
                ],
                "total": 5
            }
        ],
        "mistakes": [
            "Using double quotes for text. In standard SQL double quotes are for names of columns, and SQLite may accept them for text only by accident.",
            "Writing price > 500 and price < 100 as one condition and expecting rows: no number is both. You meant OR.",
            "Mixing AND and OR without brackets, so the condition means something else than you intended."
        ],
        "practise": [
            "sql-where-equals",
            "sql-where-comparison",
            "sql-where-and-or",
            "sql-where-like",
            "sql-in-between",
            "sql-not-in"
        ]
    },
    {
        "id": "sorting",
        "title": "Sorting, limiting and removing repeats",
        "level": "beginner",
        "intro": "ORDER BY sorts the result, LIMIT keeps only the first rows, and DISTINCT removes repeated rows.",
        "points": [
            "ORDER BY price DESC sorts from the largest to the smallest; ASC, the default, goes from smallest to largest. You can sort by several columns: ORDER BY city, name.",
            "LIMIT 3 keeps three rows. It only means the top three if the query also has ORDER BY.",
            "SELECT DISTINCT city lists each city once. DISTINCT works on the whole row, so with two columns it removes only rows in which both are the same."
        ],
        "examples": [
            {
                "sql": "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;",
                "says": "The three dearest products.",
                "columns": [
                    "name",
                    "price"
                ],
                "rows": [
                    [
                        "Headphones",
                        1800
                    ],
                    [
                        "Backpack",
                        1200
                    ],
                    [
                        "Laptop Stand",
                        950
                    ]
                ],
                "total": 3
            },
            {
                "sql": "SELECT DISTINCT city FROM customers ORDER BY city;",
                "says": "Each city once, in alphabetical order.",
                "columns": [
                    "city"
                ],
                "rows": [
                    [
                        "Ahmedabad"
                    ],
                    [
                        "Chennai"
                    ],
                    [
                        "Delhi"
                    ],
                    [
                        "Hyderabad"
                    ],
                    [
                        "Kochi"
                    ],
                    [
                        "Mumbai"
                    ]
                ],
                "total": 7
            }
        ],
        "mistakes": [
            "Using LIMIT without ORDER BY and treating the result as the first, newest or best rows.",
            "Using DISTINCT to hide a join that repeats rows, instead of finding out why they repeat."
        ],
        "practise": [
            "sql-order-limit",
            "sql-distinct"
        ]
    },
    {
        "id": "nulls",
        "title": "Missing values: NULL",
        "level": "beginner",
        "intro": "NULL means no value is stored. It is not zero and not an empty string. It is one of the most common causes of surprising results.",
        "points": [
            "A comparison with NULL is never true, not even NULL = NULL. The tests are IS NULL and IS NOT NULL.",
            "COUNT(*) counts rows, but COUNT(column) counts only the rows where the column is not NULL. SUM and AVG also ignore NULL.",
            "COALESCE(a, b) returns the first value that is not NULL, so COALESCE(joined, 'unknown') shows a label instead of a blank."
        ],
        "examples": [
            {
                "sql": "SELECT name FROM customers WHERE joined IS NULL;",
                "says": "The customers with no join date.",
                "columns": [
                    "name"
                ],
                "rows": [
                    [
                        "Anil Kumar"
                    ]
                ],
                "total": 1
            },
            {
                "sql": "SELECT COUNT(*), COUNT(joined) FROM customers;",
                "says": "12 customers, but only 11 have a join date.",
                "columns": [
                    "COUNT(*)",
                    "COUNT(joined)"
                ],
                "rows": [
                    [
                        12,
                        11
                    ]
                ],
                "total": 1
            }
        ],
        "mistakes": [
            "Writing WHERE joined = NULL, which returns no rows.",
            "Using NOT IN with a list that contains NULL: the whole condition becomes unknown and no row is returned."
        ],
        "practise": [
            "sql-where-null"
        ]
    },
    {
        "id": "expressions",
        "title": "Calculations, aliases and functions",
        "level": "beginner",
        "intro": "SELECT can calculate a new value for every row. AS gives that value a name, and functions work on text, numbers and dates.",
        "points": [
            "Arithmetic uses + - * /. If both numbers are whole numbers, SQLite divides as whole numbers: 7 / 2 is 3. Write 7.0 / 2 to get 3.5.",
            "Useful text functions are UPPER, LOWER, TRIM, LENGTH, SUBSTR and REPLACE; the operator || joins text. Useful number functions are ROUND, ABS and MIN/MAX of two values.",
            "Dates are stored as text such as 2024-03-15. date(), strftime('%Y-%m', date) and julianday() work on them in SQLite."
        ],
        "examples": [
            {
                "sql": "SELECT name, price, ROUND(price * 1.18, 2) AS price_with_tax FROM products;",
                "says": "A calculated column with a readable name.",
                "columns": [
                    "name",
                    "price",
                    "price_with_tax"
                ],
                "rows": [
                    [
                        "Notebook",
                        60,
                        70.8
                    ],
                    [
                        "Ballpoint Pen",
                        10,
                        11.8
                    ],
                    [
                        "Desk Lamp",
                        450,
                        531.0
                    ],
                    [
                        "Backpack",
                        1200,
                        1416.0
                    ],
                    [
                        "Water Bottle",
                        350,
                        413.0
                    ],
                    [
                        "Calculator",
                        700,
                        826.0
                    ]
                ],
                "total": 10
            },
            {
                "sql": "SELECT UPPER(name) AS shout, LENGTH(name) AS letters FROM customers LIMIT 4;",
                "says": "Text functions applied to each row.",
                "columns": [
                    "shout",
                    "letters"
                ],
                "rows": [
                    [
                        "ASHA RAO",
                        8
                    ],
                    [
                        "BILAL KHAN",
                        10
                    ],
                    [
                        "CHITRA IYER",
                        11
                    ],
                    [
                        "ARJUN MEHTA",
                        11
                    ]
                ],
                "total": 4
            }
        ],
        "mistakes": [
            "Dividing two whole numbers and being surprised by a whole-number answer.",
            "Assuming every database has the same date functions. This is one of the biggest differences between SQLite, MySQL, PostgreSQL and SQL Server."
        ],
        "practise": [
            "sql-alias-arithmetic",
            "sql-text-functions",
            "sql-date-functions"
        ]
    },
    {
        "id": "case",
        "title": "CASE: choosing a value by condition",
        "level": "intermediate",
        "intro": "CASE is the if-then-else of SQL. It lets a query label or group rows by a rule.",
        "points": [
            "CASE WHEN condition THEN value ... ELSE value END checks the conditions in order and returns the value of the first one that is true.",
            "Without ELSE, a row that matches nothing gets NULL.",
            "CASE can be used in SELECT to label rows and inside an aggregate, such as SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), to count a subset."
        ],
        "examples": [
            {
                "sql": "SELECT name, price, CASE WHEN price >= 1000 THEN 'premium' WHEN price >= 300 THEN 'standard' ELSE 'budget' END AS tier FROM products;",
                "says": "Each product labelled by price band.",
                "columns": [
                    "name",
                    "price",
                    "tier"
                ],
                "rows": [
                    [
                        "Notebook",
                        60,
                        "budget"
                    ],
                    [
                        "Ballpoint Pen",
                        10,
                        "budget"
                    ],
                    [
                        "Desk Lamp",
                        450,
                        "standard"
                    ],
                    [
                        "Backpack",
                        1200,
                        "premium"
                    ],
                    [
                        "Water Bottle",
                        350,
                        "standard"
                    ],
                    [
                        "Calculator",
                        700,
                        "standard"
                    ]
                ],
                "total": 10
            }
        ],
        "mistakes": [
            "Putting the conditions in the wrong order. The first true WHEN wins, so a broad condition placed first hides the narrow ones."
        ],
        "practise": [
            "sql-case"
        ]
    },
    {
        "id": "aggregates",
        "title": "Summarising: aggregates, GROUP BY and HAVING",
        "level": "intermediate",
        "intro": "Aggregate functions summarise many rows into one value. GROUP BY does that for each group, and HAVING filters the groups.",
        "points": [
            "COUNT, SUM, AVG, MIN and MAX are the main aggregates. Without GROUP BY a query with an aggregate returns one row.",
            "GROUP BY city returns one row per city. Every selected column must be a grouped column or inside an aggregate; SQLite is lenient about this, most other databases are not, so write it strictly.",
            "WHERE filters rows before they are grouped. HAVING filters groups after the aggregates are computed, so HAVING COUNT(*) > 1 keeps the groups with more than one row."
        ],
        "examples": [
            {
                "sql": "SELECT city, COUNT(*) AS customers FROM customers GROUP BY city ORDER BY customers DESC, city;",
                "says": "How many customers live in each city.",
                "columns": [
                    "city",
                    "customers"
                ],
                "rows": [
                    [
                        "Pune",
                        3
                    ],
                    [
                        "Chennai",
                        2
                    ],
                    [
                        "Delhi",
                        2
                    ],
                    [
                        "Mumbai",
                        2
                    ],
                    [
                        "Ahmedabad",
                        1
                    ],
                    [
                        "Hyderabad",
                        1
                    ]
                ],
                "total": 7
            },
            {
                "sql": "SELECT status, COUNT(*) AS orders FROM orders GROUP BY status HAVING COUNT(*) > 3;",
                "says": "Only statuses with more than three orders.",
                "columns": [
                    "status",
                    "orders"
                ],
                "rows": [
                    [
                        "delivered",
                        12
                    ],
                    [
                        "shipped",
                        4
                    ]
                ],
                "total": 2
            }
        ],
        "mistakes": [
            "Using an aggregate in WHERE: WHERE COUNT(*) > 1 is an error. That test belongs in HAVING.",
            "Forgetting that COUNT(column) ignores NULL while COUNT(*) does not."
        ],
        "practise": [
            "sql-count",
            "sql-min-max-avg",
            "sql-group-by",
            "sql-having",
            "sql-count-distinct"
        ]
    },
    {
        "id": "joins",
        "title": "Joining tables",
        "level": "intermediate",
        "intro": "A join combines rows from two tables that are related by a key. Most real questions need at least one.",
        "points": [
            "INNER JOIN keeps only the pairs that match on the ON condition. LEFT JOIN keeps every row of the left table and fills the right table's columns with NULL when nothing matches.",
            "Give tables short aliases, as in FROM orders AS o JOIN customers AS c ON o.customer_id = c.id, and write c.name or o.id when a column name exists in both tables.",
            "To find rows with no match, use a LEFT JOIN and keep the rows where the right side is NULL. To combine three tables, add another JOIN."
        ],
        "examples": [
            {
                "sql": "SELECT o.id, c.name, o.status FROM orders AS o JOIN customers AS c ON c.id = o.customer_id WHERE o.id <= 5;",
                "says": "Each order next to the customer's name.",
                "columns": [
                    "id",
                    "name",
                    "status"
                ],
                "rows": [
                    [
                        1,
                        "Asha Rao",
                        "delivered"
                    ],
                    [
                        2,
                        "Asha Rao",
                        "delivered"
                    ],
                    [
                        3,
                        "Bilal Khan",
                        "shipped"
                    ],
                    [
                        4,
                        "Chitra Iyer",
                        "delivered"
                    ],
                    [
                        5,
                        "Arjun Mehta",
                        "cancelled"
                    ]
                ],
                "total": 5
            },
            {
                "sql": "SELECT c.name, COUNT(o.id) AS orders FROM customers AS c LEFT JOIN orders AS o ON o.customer_id = c.id GROUP BY c.id, c.name ORDER BY orders, c.name LIMIT 4;",
                "says": "Customers with their number of orders, including those with none.",
                "columns": [
                    "name",
                    "orders"
                ],
                "rows": [
                    [
                        "Anil Kumar",
                        0
                    ],
                    [
                        "Kavya Reddy",
                        0
                    ],
                    [
                        "Divya Nair",
                        1
                    ],
                    [
                        "Gita Sharma",
                        1
                    ]
                ],
                "total": 4
            }
        ],
        "mistakes": [
            "Forgetting the ON condition, which pairs every row with every row.",
            "Joining a one-to-many table and then adding up a value from the one side: the value is repeated once per matching row and the total is too large.",
            "Putting a filter on the right table in WHERE after a LEFT JOIN, which turns it back into an inner join."
        ],
        "practise": [
            "sql-inner-join",
            "sql-join-three",
            "sql-left-join",
            "sql-join-sum"
        ]
    },
    {
        "id": "subqueries",
        "title": "Subqueries, EXISTS and WITH",
        "level": "intermediate",
        "intro": "A subquery is a query inside another query. A WITH clause (a common table expression) gives a query a name so that the main query reads in steps.",
        "points": [
            "A scalar subquery returns one value, such as the average price, and can be used in a condition: WHERE price > (SELECT AVG(price) FROM products).",
            "IN (SELECT ...) tests against a list produced by a query. EXISTS (SELECT ...) is true when the inner query returns any row, and is often the safer way to test for a match or for no match.",
            "WITH name AS (SELECT ...) SELECT ... FROM name builds a query in named steps. It does the same job as a subquery in FROM and is usually easier to read."
        ],
        "examples": [
            {
                "sql": "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price;",
                "says": "Products dearer than the average.",
                "columns": [
                    "name",
                    "price"
                ],
                "rows": [
                    [
                        "Calculator",
                        700
                    ],
                    [
                        "Laptop Stand",
                        950
                    ],
                    [
                        "Backpack",
                        1200
                    ],
                    [
                        "Headphones",
                        1800
                    ]
                ],
                "total": 4
            },
            {
                "sql": "WITH big AS (SELECT order_id, SUM(quantity) AS items FROM order_items GROUP BY order_id) SELECT order_id, items FROM big WHERE items >= 5;",
                "says": "A named step, then a filter on it.",
                "columns": [
                    "order_id",
                    "items"
                ],
                "rows": [
                    [
                        1,
                        8
                    ],
                    [
                        6,
                        6
                    ],
                    [
                        10,
                        10
                    ],
                    [
                        15,
                        6
                    ],
                    [
                        20,
                        6
                    ]
                ],
                "total": 5
            }
        ],
        "mistakes": [
            "A scalar subquery that can return more than one row. SQLite takes the first row; other databases give an error.",
            "NOT IN with a subquery that can return NULL, which returns nothing. Prefer NOT EXISTS."
        ],
        "practise": [
            "sql-subquery",
            "sql-cte",
            "sql-not-exists"
        ]
    },
    {
        "id": "union",
        "title": "Combining results with UNION",
        "level": "intermediate",
        "intro": "UNION stacks the results of two queries into one list. It is useful when the same kind of fact is spread over two queries, such as the customers of two different months.",
        "points": [
            "Both queries must return the same number of columns, with compatible meaning.",
            "UNION removes duplicate rows. UNION ALL keeps them and is faster, so use it when duplicates are impossible or wanted."
        ],
        "examples": [
            {
                "sql": "SELECT city FROM customers WHERE city LIKE 'P%' UNION SELECT city FROM customers WHERE city LIKE 'M%';",
                "says": "Two lists stacked, each city once.",
                "columns": [
                    "city"
                ],
                "rows": [
                    [
                        "Mumbai"
                    ],
                    [
                        "Pune"
                    ]
                ],
                "total": 2
            }
        ],
        "mistakes": [
            "Using UNION when you meant UNION ALL, silently dropping rows that are really separate records."
        ],
        "practise": [
            "sql-union"
        ]
    },
    {
        "id": "windows",
        "title": "Window functions",
        "level": "advanced",
        "intro": "A window function calculates a value across related rows without collapsing them into one row, so each row keeps its own detail and also gets a group value, a rank or a running total.",
        "points": [
            "The shape is function() OVER (PARTITION BY group ORDER BY sort). PARTITION BY restarts the calculation for each group, and ORDER BY sets the order inside it.",
            "RANK() and ROW_NUMBER() number rows; RANK gives tied rows the same number and leaves gaps, ROW_NUMBER never repeats. SUM(x) OVER (ORDER BY y) is a running total.",
            "You cannot filter on a window function in WHERE. Compute it in a WITH clause or subquery and filter outside."
        ],
        "examples": [
            {
                "sql": "SELECT name, category, price, RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category FROM products ORDER BY category, rank_in_category;",
                "says": "Each product ranked inside its own category.",
                "columns": [
                    "name",
                    "category",
                    "price",
                    "rank_in_category"
                ],
                "rows": [
                    [
                        "Backpack",
                        "Bags",
                        1200,
                        1
                    ],
                    [
                        "Headphones",
                        "Electronics",
                        1800,
                        1
                    ],
                    [
                        "Laptop Stand",
                        "Electronics",
                        950,
                        2
                    ],
                    [
                        "Calculator",
                        "Electronics",
                        700,
                        3
                    ],
                    [
                        "Desk Lamp",
                        "Home",
                        450,
                        1
                    ],
                    [
                        "Water Bottle",
                        "Home",
                        350,
                        2
                    ]
                ],
                "total": 10
            }
        ],
        "mistakes": [
            "Using GROUP BY when you want to keep every row. GROUP BY collapses rows; a window function does not."
        ],
        "practise": [
            "sql-window-rank",
            "sql-running-total",
            "sql-top-per-group"
        ]
    },
    {
        "id": "changing",
        "title": "Changing data: INSERT, UPDATE and DELETE",
        "level": "intermediate",
        "intro": "These statements change the data. In this lab each check starts from a fresh copy, so you cannot break anything; in a real database the changes are permanent.",
        "points": [
            "INSERT INTO table (columns) VALUES (values) adds a row. Listing the columns keeps the statement correct if the table later gains a column.",
            "UPDATE table SET column = value WHERE condition changes rows. DELETE FROM table WHERE condition removes rows. Without WHERE both affect every row.",
            "A safe habit is to write the WHERE as a SELECT first and look at the rows it returns, then change SELECT * to UPDATE or DELETE."
        ],
        "examples": [
            {
                "sql": "UPDATE products SET price = price + 10 WHERE category = 'Stationery'; SELECT name, price FROM products WHERE category = 'Stationery';",
                "says": "Change some rows, then look at them.",
                "columns": [
                    "name",
                    "price"
                ],
                "rows": [
                    [
                        "Notebook",
                        70
                    ],
                    [
                        "Ballpoint Pen",
                        20
                    ],
                    [
                        "Marker Set",
                        160
                    ]
                ],
                "total": 3
            }
        ],
        "mistakes": [
            "Running UPDATE or DELETE with no WHERE.",
            "Changing data without a transaction when several statements must succeed together."
        ],
        "practise": [
            "sql-insert",
            "sql-update",
            "sql-delete"
        ]
    },
    {
        "id": "design",
        "title": "Tables, constraints, views and indexes",
        "level": "advanced",
        "intro": "Constraints keep bad data out, a view saves a query under a name, and an index makes lookups faster.",
        "points": [
            "CREATE TABLE defines columns and rules: PRIMARY KEY (unique row identity), NOT NULL (a value is required), UNIQUE (no repeats), CHECK (a condition every row must meet) and FOREIGN KEY (a value must exist in another table). SQLite does not enforce foreign keys unless PRAGMA foreign_keys = ON.",
            "A view stores a query, not data. Selecting from it runs the query on the current tables.",
            "An index speeds up searches on a column at the cost of storage and slower writes. EXPLAIN QUERY PLAN shows whether a query uses one.",
            "Good design stores each fact once: customers in a customers table, referred to by id from orders, not retyped on every order."
        ],
        "examples": [
            {
                "sql": "CREATE TABLE reviews (id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)); INSERT INTO reviews VALUES (1, 4, 5); SELECT * FROM reviews;",
                "says": "A table with rules, and a row that satisfies them.",
                "columns": [
                    "id",
                    "product_id",
                    "rating"
                ],
                "rows": [
                    [
                        1,
                        4,
                        5
                    ]
                ],
                "total": 1
            }
        ],
        "mistakes": [
            "Relying on the application to keep data valid instead of constraints.",
            "Assuming a foreign key is enforced in SQLite."
        ],
        "practise": [
            "sql-create-table",
            "sql-view",
            "sql-index"
        ]
    },
    {
        "id": "transactions",
        "title": "Transactions",
        "level": "advanced",
        "intro": "A transaction groups statements so that all of them take effect, or none do.",
        "points": [
            "BEGIN starts it, COMMIT makes the changes permanent and ROLLBACK discards them. A bank transfer is the standard example: subtracting from one account and adding to another must happen together.",
            "Transactions are one of the ACID properties (atomicity, consistency, isolation, durability). This lab runs on a single in-memory copy, so it can show atomicity but not what happens with several users at once."
        ],
        "examples": [
            {
                "sql": "CREATE TABLE acc (id INTEGER, bal INTEGER); INSERT INTO acc VALUES (1, 100); BEGIN; UPDATE acc SET bal = 0; ROLLBACK; SELECT * FROM acc;",
                "says": "The update is undone, so the balance is still 100.",
                "columns": [
                    "id",
                    "bal"
                ],
                "rows": [
                    [
                        1,
                        100
                    ]
                ],
                "total": 1
            }
        ],
        "mistakes": [
            "Forgetting COMMIT, so the change is never made permanent."
        ],
        "practise": [
            "sql-transaction"
        ]
    },
    {
        "id": "cleaning",
        "title": "Cleaning data with SQL",
        "level": "intermediate",
        "intro": "Real data is untidy: extra spaces, mixed capitals, empty text, repeated records and invalid dates. Cleaning means finding and fixing these before analysis. The table contacts_raw in this lab is deliberately untidy for practice.",
        "points": [
            "TRIM, LOWER and UPPER make text consistent. NULLIF(x, '') turns empty text into NULL, and COALESCE(x, default) replaces NULL with a default.",
            "Duplicates are found by grouping on the cleaned value and keeping groups with COUNT(*) > 1. To delete them, keep the lowest id of each group and remove the rest.",
            "Invalid dates are found with date(value) IS NULL, and by comparing date(value) with value to catch dates written in another form.",
            "Do not clean in place without a copy. A careful workflow keeps the raw table, writes cleaned data to a new table or view, and checks the row counts before and after."
        ],
        "examples": [
            {
                "sql": "SELECT id, TRIM(name) AS name, LOWER(TRIM(city)) AS city, NULLIF(TRIM(email), '') AS email FROM contacts_raw;",
                "says": "Cleaned values beside their raw rows.",
                "columns": [
                    "id",
                    "name",
                    "city",
                    "email"
                ],
                "rows": [
                    [
                        1,
                        "Asha Rao",
                        "pune",
                        "ASHA@Example.com"
                    ],
                    [
                        2,
                        "bilal khan",
                        "mumbai",
                        "bilal@example.com"
                    ],
                    [
                        3,
                        "Asha Rao",
                        "pune",
                        "asha@example.com"
                    ],
                    [
                        4,
                        "Chitra Iyer",
                        "chennai",
                        null
                    ],
                    [
                        5,
                        "Divya Nair",
                        "kochi",
                        null
                    ],
                    [
                        6,
                        "divya nair",
                        "kochi",
                        "divya@example.com"
                    ]
                ],
                "total": 8
            },
            {
                "sql": "SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS n FROM contacts_raw WHERE TRIM(email) <> '' GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1;",
                "says": "Finds the duplicated email address.",
                "columns": [
                    "email",
                    "n"
                ],
                "rows": [
                    [
                        "asha@example.com",
                        2
                    ]
                ],
                "total": 1
            }
        ],
        "mistakes": [
            "Comparing raw values: 'Pune' and 'pune ' are different to the database.",
            "Treating empty text and NULL as the same thing, when they are not.",
            "Deleting duplicates without looking at them first."
        ],
        "practise": [
            "sql-clean-trim",
            "sql-clean-case",
            "sql-clean-nullif",
            "sql-clean-coalesce",
            "sql-clean-duplicates",
            "sql-clean-bad-dates",
            "sql-clean-delete-duplicates",
            "sql-clean-update"
        ]
    },
    {
        "id": "errors",
        "title": "Reading errors and finding mistakes",
        "level": "beginner",
        "intro": "An error message tells you what SQLite could not do. Learning to read them saves a lot of time.",
        "points": [
            "no such table or no such column: a name is misspelled, or the column belongs to a different table. Check the spelling against the practice database section.",
            "near \"X\": syntax error: SQLite stopped at X because something before it is wrong, often a missing comma, a missing keyword or an extra comma before FROM.",
            "ambiguous column name: a column exists in two joined tables. Write it as table.column.",
            "A query that runs but gives a wrong result is harder. Check the number of rows first, then try each part on its own: run the join alone, then add WHERE, then GROUP BY."
        ],
        "examples": [
            {
                "sql": "SELECT name city FROM customers;",
                "says": "Runs, but returns one column named city: the missing comma made city an alias for name.",
                "columns": [
                    "city"
                ],
                "rows": [
                    [
                        "Asha Rao"
                    ],
                    [
                        "Bilal Khan"
                    ],
                    [
                        "Chitra Iyer"
                    ],
                    [
                        "Arjun Mehta"
                    ],
                    [
                        "Divya Nair"
                    ],
                    [
                        "Farhan Ali"
                    ]
                ],
                "total": 12
            },
            {
                "sql": "SELECT name, FROM customers;",
                "says": "A trailing comma before FROM is a syntax error.",
                "columns": [],
                "rows": [],
                "total": 0,
                "error": "near \"FROM\": syntax error"
            }
        ],
        "mistakes": [
            "Changing several things at once after an error. Change one thing and run again."
        ],
        "practise": [
            "sql-select-columns"
        ]
    },
    {
        "id": "dialects",
        "title": "SQLite and other databases",
        "level": "intermediate",
        "intro": "The core of SQL is shared, but every database has differences. This lab runs SQLite.",
        "points": [
            "Shared almost everywhere: SELECT, WHERE, JOIN, GROUP BY, subqueries, CASE, INSERT, UPDATE and DELETE.",
            "Different: how rows are limited (LIMIT in SQLite, MySQL and PostgreSQL; TOP or FETCH FIRST in SQL Server), date and text functions, how strict column types are, and what an empty GROUP BY allows.",
            "SQLite-specific: dates are text, column types are advisory, foreign keys are off by default, and there are no separate users or permissions. A query that works here may need changes for MySQL, PostgreSQL, SQL Server or Oracle, so read the manual of the database you use."
        ],
        "examples": [
            {
                "sql": "SELECT sqlite_version();",
                "says": "Shows the engine version this lab runs.",
                "columns": [
                    "sqlite_version()"
                ],
                "rows": [
                    [
                        "3.40.1"
                    ]
                ],
                "total": 1
            }
        ],
        "mistakes": [
            "Assuming a function that works here exists elsewhere."
        ],
        "practise": []
    }
];
