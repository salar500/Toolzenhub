/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the exercises

   Plain data (see learning/content-schema.js, validateExerciseSet). `expected` is what the check compares: the number of
   columns and the rows of the query's result (or, for a "modify" exercise, of `verify`, a SELECT run after the learner's
   statements). Rows are compared as a set unless `ordered` is true. Column names are not compared. Generated once from the
   solutions by an independent SQLite build; edit the solution and the expected result together.
========================================================= */

export const set = {
    "id": "sql-practice",
    "version": "1.1.0",
    "title": "SQL Practice Lab",
    "description": "Forty-nine exercises that teach SQL on a small shop database, from SELECT and WHERE to joins, window functions, changing data, constraints and transactions, run by SQLite in your browser.",
    "reviewed": {
        "date": "2026-11-04",
        "method": "Written by the author. Expected results were produced by Python's sqlite3 (SQLite 3.40.1, a separate build from the sql.js on the page) and the small ones checked by hand. A browser test runs every solution on the page and requires a match."
    },
    "exercises": [
        {
            "id": "sql-select-all",
            "topic": "select",
            "title": "Every column of a table",
            "difficulty": "beginner",
            "objective": "Read every row and column of a table with SELECT *.",
            "instructions": "Write a query that returns every column of every row in the customers table.",
            "solution": "SELECT * FROM customers;",
            "hints": [
                "SELECT lists what to return and FROM names the table.",
                "A star stands for all columns.",
                "The table is called customers. End the statement with a semicolon."
            ],
            "explanation": "SELECT * FROM customers returns every column of every row. The star is handy for looking at a table, but in real queries naming the columns you need is clearer and does not change when a column is added.",
            "source": "SQLite documentation: SELECT",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 4,
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
                    ],
                    [
                        4,
                        "Arjun Mehta",
                        "Pune",
                        "2023-03-11"
                    ],
                    [
                        5,
                        "Divya Nair",
                        "Kochi",
                        "2023-04-02"
                    ],
                    [
                        6,
                        "Farhan Ali",
                        "Mumbai",
                        "2023-05-19"
                    ],
                    [
                        7,
                        "Gita Sharma",
                        "Delhi",
                        "2023-06-07"
                    ],
                    [
                        8,
                        "Anil Kumar",
                        "Delhi",
                        null
                    ],
                    [
                        9,
                        "Hari Prasad",
                        "Chennai",
                        "2023-08-25"
                    ],
                    [
                        10,
                        "Isha Patel",
                        "Ahmedabad",
                        "2023-09-14"
                    ],
                    [
                        11,
                        "Jatin Verma",
                        "Pune",
                        "2023-10-30"
                    ],
                    [
                        12,
                        "Kavya Reddy",
                        "Hyderabad",
                        "2023-11-21"
                    ]
                ]
            }
        },
        {
            "id": "sql-select-columns",
            "topic": "select",
            "title": "Choose columns",
            "difficulty": "beginner",
            "objective": "Return only some columns, in the order you list them.",
            "instructions": "Return only the name and the city of every customer, in that order.",
            "solution": "SELECT name, city FROM customers;",
            "hints": [
                "List the column names after SELECT, separated by commas."
            ],
            "explanation": "The columns after SELECT decide what is returned and in which order. The rows are the same ones SELECT * would return, with fewer columns.",
            "source": "SQLite documentation: SELECT",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
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
                    ],
                    [
                        "Gita Sharma",
                        "Delhi"
                    ],
                    [
                        "Anil Kumar",
                        "Delhi"
                    ],
                    [
                        "Hari Prasad",
                        "Chennai"
                    ],
                    [
                        "Isha Patel",
                        "Ahmedabad"
                    ],
                    [
                        "Jatin Verma",
                        "Pune"
                    ],
                    [
                        "Kavya Reddy",
                        "Hyderabad"
                    ]
                ]
            }
        },
        {
            "id": "sql-where-equals",
            "topic": "where",
            "title": "Filter with equals",
            "difficulty": "beginner",
            "objective": "Keep only the rows that match a condition with WHERE.",
            "instructions": "Return the name of every customer whose city is Pune.",
            "solution": "SELECT name FROM customers WHERE city = 'Pune';",
            "hints": [
                "WHERE comes after FROM and holds the condition.",
                "Text values are written in single quotes."
            ],
            "explanation": "WHERE keeps the rows for which the condition is true. Text is written in single quotes, and the comparison with = is case sensitive for ordinary text in SQLite, so 'Pune' matches Pune and not pune.",
            "source": "SQLite documentation: SELECT, WHERE clause",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Asha Rao"
                    ],
                    [
                        "Arjun Mehta"
                    ],
                    [
                        "Jatin Verma"
                    ]
                ]
            }
        },
        {
            "id": "sql-where-comparison",
            "topic": "where",
            "title": "Compare numbers",
            "difficulty": "beginner",
            "objective": "Use a comparison operator on a number column.",
            "instructions": "Return the name and price of every product that costs more than 500.",
            "solution": "SELECT name, price FROM products WHERE price > 500;",
            "hints": [
                "Numbers are written without quotes.",
                "The operator for greater than is >."
            ],
            "explanation": "price > 500 is true only for prices above 500. A product costing exactly 500 would not be included; use >= to include it. Here the matching products are the Backpack, Calculator, Headphones and Laptop Stand.",
            "source": "SQLite documentation: expressions, comparison operators",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Backpack",
                        1200
                    ],
                    [
                        "Calculator",
                        700
                    ],
                    [
                        "Headphones",
                        1800
                    ],
                    [
                        "Laptop Stand",
                        950
                    ]
                ]
            }
        },
        {
            "id": "sql-where-and-or",
            "topic": "where",
            "title": "Combine conditions",
            "difficulty": "intermediate",
            "objective": "Combine two conditions with AND.",
            "instructions": "Return the name of every product in the Electronics category that costs less than 1000.",
            "solution": "SELECT name FROM products WHERE category = 'Electronics' AND price < 1000;",
            "hints": [
                "AND needs both conditions to be true.",
                "Write the category test and the price test, joined by AND."
            ],
            "explanation": "AND keeps a row only when both conditions are true. OR keeps it when either is, and AND is evaluated before OR, so use brackets when you mix them.",
            "source": "SQLite documentation: expressions, AND and OR",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Calculator"
                    ],
                    [
                        "Laptop Stand"
                    ]
                ]
            }
        },
        {
            "id": "sql-where-like",
            "topic": "where",
            "title": "Match a pattern",
            "difficulty": "intermediate",
            "objective": "Match text against a pattern with LIKE.",
            "instructions": "Return the name of every customer whose name starts with the letter A.",
            "solution": "SELECT name FROM customers WHERE name LIKE 'A%';",
            "hints": [
                "LIKE compares text with a pattern.",
                "In a LIKE pattern, % stands for any run of characters."
            ],
            "explanation": "In a LIKE pattern, % matches any number of characters, including none, and _ matches exactly one. 'A%' therefore matches names that begin with A. In SQLite, LIKE ignores case for plain English letters by default.",
            "source": "SQLite documentation: LIKE operator",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Asha Rao"
                    ],
                    [
                        "Arjun Mehta"
                    ],
                    [
                        "Anil Kumar"
                    ]
                ]
            }
        },
        {
            "id": "sql-where-null",
            "topic": "where",
            "title": "Missing values",
            "difficulty": "intermediate",
            "objective": "Test for NULL with IS NULL, because = NULL never matches.",
            "instructions": "Return the name of every customer who has no join date (the joined column is empty).",
            "solution": "SELECT name FROM customers WHERE joined IS NULL;",
            "hints": [
                "NULL means no value is stored.",
                "Comparing with = NULL never matches; there is a special test for it."
            ],
            "explanation": "NULL is not equal to anything, not even to another NULL, so joined = NULL is never true. IS NULL is the test that matches a missing value, and IS NOT NULL is its opposite.",
            "source": "SQLite documentation: NULL handling, IS NULL",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Anil Kumar"
                    ]
                ]
            }
        },
        {
            "id": "sql-order-limit",
            "topic": "sorting",
            "title": "Sort and limit",
            "difficulty": "beginner",
            "objective": "Sort the result and keep only the first rows.",
            "instructions": "Return the name and price of the three most expensive products, the most expensive first.",
            "solution": "SELECT name, price FROM products ORDER BY price DESC LIMIT 3;",
            "hints": [
                "ORDER BY sorts; DESC sorts from the largest to the smallest.",
                "LIMIT keeps only the first rows of the sorted result."
            ],
            "explanation": "ORDER BY price DESC puts the largest prices first, and LIMIT 3 keeps the first three rows of that order. Without ORDER BY, the order of rows is not defined, so LIMIT on its own does not mean the first, the newest or the largest.",
            "source": "SQLite documentation: SELECT, ORDER BY and LIMIT",
            "ordered": true,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
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
                ]
            }
        },
        {
            "id": "sql-distinct",
            "topic": "sorting",
            "title": "Remove duplicates",
            "difficulty": "beginner",
            "objective": "List each value once with DISTINCT.",
            "instructions": "Return each city that has at least one customer, once.",
            "solution": "SELECT DISTINCT city FROM customers;",
            "hints": [
                "Several customers share a city.",
                "DISTINCT goes right after SELECT."
            ],
            "explanation": "DISTINCT removes repeated rows from the result, comparing the whole row. With only city selected, each city appears once however many customers live there.",
            "source": "SQLite documentation: SELECT, DISTINCT",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Pune"
                    ],
                    [
                        "Mumbai"
                    ],
                    [
                        "Chennai"
                    ],
                    [
                        "Kochi"
                    ],
                    [
                        "Delhi"
                    ],
                    [
                        "Ahmedabad"
                    ],
                    [
                        "Hyderabad"
                    ]
                ]
            }
        },
        {
            "id": "sql-count",
            "topic": "aggregates",
            "title": "Count rows",
            "difficulty": "beginner",
            "objective": "Count rows with COUNT(*) and a WHERE condition.",
            "instructions": "Return how many orders have the status delivered.",
            "solution": "SELECT COUNT(*) FROM orders WHERE status = 'delivered';",
            "hints": [
                "COUNT(*) counts rows.",
                "Filter first with WHERE, then count."
            ],
            "explanation": "WHERE removes the rows that do not match before COUNT(*) counts what is left, so the answer is the number of delivered orders. COUNT(column) would skip rows where that column is NULL; COUNT(*) does not.",
            "source": "SQLite documentation: aggregate functions, count()",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        12
                    ]
                ]
            }
        },
        {
            "id": "sql-min-max-avg",
            "topic": "aggregates",
            "title": "Minimum, maximum and average",
            "difficulty": "intermediate",
            "objective": "Summarise a column with several aggregate functions.",
            "instructions": "Return the lowest, the highest and the average price of all products, in that order, as one row.",
            "solution": "SELECT MIN(price), MAX(price), AVG(price) FROM products;",
            "hints": [
                "Each of MIN, MAX and AVG takes a column name.",
                "With no GROUP BY, the whole table is one group, so one row comes back."
            ],
            "explanation": "An aggregate function collapses many rows into one value. With no GROUP BY, all rows form a single group, so the query returns one row: here 10, 1800 and 595.",
            "source": "SQLite documentation: aggregate functions",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 3,
                "rows": [
                    [
                        10,
                        1800,
                        595.0
                    ]
                ]
            }
        },
        {
            "id": "sql-group-by",
            "topic": "grouping",
            "title": "Group and count",
            "difficulty": "intermediate",
            "objective": "Count rows per group with GROUP BY.",
            "instructions": "Return each order status and the number of orders that have it.",
            "solution": "SELECT status, COUNT(*) FROM orders GROUP BY status;",
            "hints": [
                "GROUP BY makes one group per distinct value.",
                "Select the grouping column and COUNT(*)."
            ],
            "explanation": "GROUP BY status puts orders with the same status in one group, and COUNT(*) is computed once per group, giving one row per status. Every selected column must either be in GROUP BY or be inside an aggregate function.",
            "source": "SQLite documentation: SELECT, GROUP BY",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "cancelled",
                        2
                    ],
                    [
                        "delivered",
                        12
                    ],
                    [
                        "pending",
                        2
                    ],
                    [
                        "shipped",
                        4
                    ]
                ]
            }
        },
        {
            "id": "sql-having",
            "topic": "grouping",
            "title": "Filter groups",
            "difficulty": "intermediate",
            "objective": "Filter groups after they are formed with HAVING.",
            "instructions": "Return the customer_id and the number of orders of every customer who has placed 3 or more orders.",
            "solution": "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) >= 3;",
            "hints": [
                "WHERE filters rows before grouping; HAVING filters groups after.",
                "The condition uses the aggregate: COUNT(*) >= 3."
            ],
            "explanation": "WHERE cannot use an aggregate because it runs before the groups exist. HAVING runs after GROUP BY, so HAVING COUNT(*) >= 3 keeps only the groups with at least three rows.",
            "source": "SQLite documentation: SELECT, HAVING",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        1,
                        4
                    ],
                    [
                        2,
                        3
                    ],
                    [
                        4,
                        3
                    ]
                ]
            }
        },
        {
            "id": "sql-inner-join",
            "topic": "joins",
            "title": "Join two tables",
            "difficulty": "intermediate",
            "objective": "Combine rows of two tables with an INNER JOIN.",
            "instructions": "Return the id of every order together with the name of the customer who placed it.",
            "solution": "SELECT orders.id, customers.name FROM orders JOIN customers ON orders.customer_id = customers.id;",
            "hints": [
                "orders.customer_id holds a customers.id.",
                "JOIN ... ON states which columns must match."
            ],
            "explanation": "JOIN (short for INNER JOIN) pairs each order with the customer row whose id equals the order's customer_id, and drops rows with no match. Writing the table name before the column (orders.id) avoids confusion when both tables have an id column.",
            "source": "SQLite documentation: SELECT, joins",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        1,
                        "Asha Rao"
                    ],
                    [
                        2,
                        "Asha Rao"
                    ],
                    [
                        3,
                        "Bilal Khan"
                    ],
                    [
                        4,
                        "Chitra Iyer"
                    ],
                    [
                        5,
                        "Arjun Mehta"
                    ],
                    [
                        6,
                        "Asha Rao"
                    ],
                    [
                        7,
                        "Divya Nair"
                    ],
                    [
                        8,
                        "Farhan Ali"
                    ],
                    [
                        9,
                        "Bilal Khan"
                    ],
                    [
                        10,
                        "Gita Sharma"
                    ],
                    [
                        11,
                        "Hari Prasad"
                    ],
                    [
                        12,
                        "Arjun Mehta"
                    ],
                    [
                        13,
                        "Isha Patel"
                    ],
                    [
                        14,
                        "Asha Rao"
                    ],
                    [
                        15,
                        "Chitra Iyer"
                    ],
                    [
                        16,
                        "Farhan Ali"
                    ],
                    [
                        17,
                        "Hari Prasad"
                    ],
                    [
                        18,
                        "Bilal Khan"
                    ],
                    [
                        19,
                        "Jatin Verma"
                    ],
                    [
                        20,
                        "Arjun Mehta"
                    ]
                ]
            }
        },
        {
            "id": "sql-join-three",
            "topic": "joins",
            "title": "Join across a link table",
            "difficulty": "advanced",
            "objective": "Follow keys through a link table to reach a third table.",
            "instructions": "For order number 20, return the name of each product and the quantity ordered.",
            "solution": "SELECT products.name, order_items.quantity FROM order_items JOIN products ON order_items.product_id = products.id WHERE order_items.order_id = 20;",
            "hints": [
                "order_items links orders and products.",
                "Join order_items to products on product_id, then filter on the order."
            ],
            "explanation": "order_items holds one row for each product in an order. Joining it to products on product_id turns the product number into a name, and the WHERE keeps only the rows of order 20.",
            "source": "SQLite documentation: SELECT, joins",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Marker Set",
                        3
                    ],
                    [
                        "Lunch Box",
                        2
                    ],
                    [
                        "Notebook",
                        1
                    ]
                ]
            }
        },
        {
            "id": "sql-left-join",
            "topic": "joins",
            "title": "Rows with no match",
            "difficulty": "advanced",
            "objective": "Use a LEFT JOIN and IS NULL to find rows that have no partner.",
            "instructions": "Return the name of every customer who has never placed an order.",
            "solution": "SELECT customers.name FROM customers LEFT JOIN orders ON orders.customer_id = customers.id WHERE orders.id IS NULL;",
            "hints": [
                "A LEFT JOIN keeps every customer, even one with no order.",
                "For such a customer the order columns are NULL."
            ],
            "explanation": "A LEFT JOIN keeps every row of the left table; where no order matches, the order columns are NULL. Filtering on orders.id IS NULL leaves exactly the customers with no order. NOT EXISTS or NOT IN can give the same answer.",
            "source": "SQLite documentation: SELECT, outer joins",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Anil Kumar"
                    ],
                    [
                        "Kavya Reddy"
                    ]
                ]
            }
        },
        {
            "id": "sql-join-sum",
            "topic": "joins",
            "title": "Total per customer",
            "difficulty": "advanced",
            "objective": "Join, filter, group and add up in one query.",
            "instructions": "For delivered orders only, return each customer's name and the total amount spent (quantity multiplied by price, added up).",
            "solution": "SELECT customers.name, SUM(order_items.quantity * products.price) FROM customers JOIN orders ON orders.customer_id = customers.id JOIN order_items ON order_items.order_id = orders.id JOIN products ON products.id = order_items.product_id WHERE orders.status = 'delivered' GROUP BY customers.id, customers.name;",
            "hints": [
                "Chain the joins: customers, orders, order_items, products.",
                "The amount of one item is quantity * price; SUM adds them per customer.",
                "Filter delivered orders with WHERE, then GROUP BY the customer."
            ],
            "explanation": "Each join adds one table to the chain. WHERE removes the orders that are not delivered before grouping, the expression quantity * price gives the amount of one line, and SUM adds the lines of each group. Customers with no delivered order do not appear, because an inner join drops them.",
            "source": "SQLite documentation: SELECT, aggregate functions, joins",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Asha Rao",
                        1970
                    ],
                    [
                        "Bilal Khan",
                        4150
                    ],
                    [
                        "Chitra Iyer",
                        1800
                    ],
                    [
                        "Arjun Mehta",
                        1770
                    ],
                    [
                        "Divya Nair",
                        950
                    ],
                    [
                        "Farhan Ali",
                        1200
                    ],
                    [
                        "Hari Prasad",
                        980
                    ]
                ]
            }
        },
        {
            "id": "sql-subquery",
            "topic": "subqueries",
            "title": "Compare with a subquery",
            "difficulty": "advanced",
            "objective": "Use a subquery that returns one value.",
            "instructions": "Return the name of every product that costs more than the average price of all products.",
            "solution": "SELECT name FROM products WHERE price > (SELECT AVG(price) FROM products);",
            "hints": [
                "The average price is itself a query.",
                "Put that query in brackets where the number would go."
            ],
            "explanation": "A scalar subquery in brackets returns one value, here the average price, which WHERE then compares each row against. The subquery is evaluated by the database, so the average does not need to be typed in.",
            "source": "SQLite documentation: expressions, scalar subquery",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Backpack"
                    ],
                    [
                        "Calculator"
                    ],
                    [
                        "Headphones"
                    ],
                    [
                        "Laptop Stand"
                    ]
                ]
            }
        },
        {
            "id": "sql-cte",
            "topic": "subqueries",
            "title": "Name a step with a CTE",
            "difficulty": "advanced",
            "objective": "Break a query into named steps with WITH.",
            "instructions": "Using a WITH clause, work out each order's total (quantity times price, added up per order_id), then return the order_id and total of the orders whose total is more than 2000.",
            "solution": "WITH order_totals AS (SELECT order_items.order_id AS order_id, SUM(order_items.quantity * products.price) AS total FROM order_items JOIN products ON products.id = order_items.product_id GROUP BY order_items.order_id) SELECT order_id, total FROM order_totals WHERE total > 2000;",
            "hints": [
                "WITH name AS (query) defines a temporary named result.",
                "Group the items by order_id, then filter that result in the main query."
            ],
            "explanation": "A common table expression names a query so the main query can use it like a table. It exists only for that one statement. Breaking the work into steps makes it easier to read and to check one step at a time.",
            "source": "SQLite documentation: WITH clause",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        9,
                        3000
                    ]
                ]
            }
        },
        {
            "id": "sql-text-functions",
            "topic": "functions",
            "title": "Text functions",
            "difficulty": "intermediate",
            "objective": "Apply scalar functions to a column.",
            "instructions": "Return every customer's name in upper case, and the number of characters in the name.",
            "solution": "SELECT UPPER(name), LENGTH(name) FROM customers;",
            "hints": [
                "UPPER changes case; LENGTH counts characters.",
                "Each function takes the column as its argument."
            ],
            "explanation": "Scalar functions run once per row. UPPER(name) returns the name in capitals and LENGTH(name) its number of characters. Neither changes what is stored in the table.",
            "source": "SQLite documentation: core functions",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
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
                    ],
                    [
                        "DIVYA NAIR",
                        10
                    ],
                    [
                        "FARHAN ALI",
                        10
                    ],
                    [
                        "GITA SHARMA",
                        11
                    ],
                    [
                        "ANIL KUMAR",
                        10
                    ],
                    [
                        "HARI PRASAD",
                        11
                    ],
                    [
                        "ISHA PATEL",
                        10
                    ],
                    [
                        "JATIN VERMA",
                        11
                    ],
                    [
                        "KAVYA REDDY",
                        11
                    ]
                ]
            }
        },
        {
            "id": "sql-date-functions",
            "topic": "functions",
            "title": "Dates in SQLite",
            "difficulty": "advanced",
            "objective": "Group by part of a date with strftime.",
            "instructions": "Return each month of the order_date column (written as YYYY-MM) and the number of orders in it, the earliest month first.",
            "solution": "SELECT strftime('%Y-%m', order_date), COUNT(*) FROM orders GROUP BY strftime('%Y-%m', order_date) ORDER BY strftime('%Y-%m', order_date);",
            "hints": [
                "SQLite stores dates as text such as 2024-03-15.",
                "strftime('%Y-%m', date) turns a date into year and month.",
                "Group by that same expression, and sort by it."
            ],
            "explanation": "SQLite has no separate date type; dates are text in the form YYYY-MM-DD, and strftime formats them. Grouping by strftime('%Y-%m', order_date) gives one group per month. Other databases use different date functions.",
            "source": "SQLite documentation: date and time functions",
            "ordered": true,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "2024-01",
                        3
                    ],
                    [
                        "2024-02",
                        4
                    ],
                    [
                        "2024-03",
                        4
                    ],
                    [
                        "2024-04",
                        4
                    ],
                    [
                        "2024-05",
                        3
                    ],
                    [
                        "2024-06",
                        2
                    ]
                ]
            }
        },
        {
            "id": "sql-case",
            "topic": "functions",
            "title": "Label rows with CASE",
            "difficulty": "advanced",
            "objective": "Return a different value depending on a condition.",
            "instructions": "Return each product's name and a price band: budget if the price is below 100, standard if it is below 1000, otherwise premium.",
            "solution": "SELECT name, CASE WHEN price < 100 THEN 'budget' WHEN price < 1000 THEN 'standard' ELSE 'premium' END FROM products;",
            "hints": [
                "CASE WHEN condition THEN value ... ELSE value END.",
                "The conditions are tried from the first to the last."
            ],
            "explanation": "CASE tests its WHEN conditions in order and returns the value of the first that is true, or the ELSE value if none is. A price of 60 is below 100, so only the first branch applies; the order matters because a price below 100 is also below 1000.",
            "source": "SQLite documentation: expressions, CASE expression",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Notebook",
                        "budget"
                    ],
                    [
                        "Ballpoint Pen",
                        "budget"
                    ],
                    [
                        "Desk Lamp",
                        "standard"
                    ],
                    [
                        "Backpack",
                        "premium"
                    ],
                    [
                        "Water Bottle",
                        "standard"
                    ],
                    [
                        "Calculator",
                        "standard"
                    ],
                    [
                        "Headphones",
                        "premium"
                    ],
                    [
                        "Marker Set",
                        "standard"
                    ],
                    [
                        "Laptop Stand",
                        "standard"
                    ],
                    [
                        "Lunch Box",
                        "standard"
                    ]
                ]
            }
        },
        {
            "id": "sql-window-rank",
            "topic": "window",
            "title": "Rank within a group",
            "difficulty": "advanced",
            "objective": "Rank rows inside each category with a window function.",
            "instructions": "Return each product's name, its category, and its price rank within its own category, the most expensive being 1 (use RANK()).",
            "solution": "SELECT name, category, RANK() OVER (PARTITION BY category ORDER BY price DESC) FROM products;",
            "hints": [
                "A window function is followed by OVER (...).",
                "PARTITION BY restarts the numbering for each category; ORDER BY says how to rank."
            ],
            "explanation": "RANK() OVER (PARTITION BY category ORDER BY price DESC) numbers the rows of each category by price, restarting at 1 for every category, and unlike GROUP BY it keeps every row. Tied prices would share a rank and leave a gap after them.",
            "source": "SQLite documentation: window functions",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 3,
                "rows": [
                    [
                        "Backpack",
                        "Bags",
                        1
                    ],
                    [
                        "Headphones",
                        "Electronics",
                        1
                    ],
                    [
                        "Laptop Stand",
                        "Electronics",
                        2
                    ],
                    [
                        "Calculator",
                        "Electronics",
                        3
                    ],
                    [
                        "Desk Lamp",
                        "Home",
                        1
                    ],
                    [
                        "Water Bottle",
                        "Home",
                        2
                    ],
                    [
                        "Lunch Box",
                        "Home",
                        3
                    ],
                    [
                        "Marker Set",
                        "Stationery",
                        1
                    ],
                    [
                        "Notebook",
                        "Stationery",
                        2
                    ],
                    [
                        "Ballpoint Pen",
                        "Stationery",
                        3
                    ]
                ]
            }
        },
        {
            "id": "sql-insert",
            "topic": "changing data",
            "title": "Insert a row",
            "difficulty": "beginner",
            "objective": "Add a row with INSERT.",
            "instructions": "Add a customer with id 13, name Lata Menon, city Kochi and joined date 2024-01-01.",
            "solution": "INSERT INTO customers (id, name, city, joined) VALUES (13, 'Lata Menon', 'Kochi', '2024-01-01');",
            "hints": [
                "INSERT INTO table (columns) VALUES (values).",
                "The values are in the same order as the columns you list."
            ],
            "explanation": "INSERT adds a new row. Listing the columns makes the statement keep working if the table later gains a column, and each value goes to the column in the same position. The lab checks the row by selecting it afterwards.",
            "source": "SQLite documentation: INSERT",
            "ordered": false,
            "kind": "modify",
            "setup": [],
            "verify": "SELECT id, name, city, joined FROM customers WHERE id = 13;",
            "expected": {
                "columns": 4,
                "rows": [
                    [
                        13,
                        "Lata Menon",
                        "Kochi",
                        "2024-01-01"
                    ]
                ]
            }
        },
        {
            "id": "sql-update",
            "topic": "changing data",
            "title": "Update rows",
            "difficulty": "intermediate",
            "objective": "Change existing rows with UPDATE and a WHERE.",
            "instructions": "Raise the price of every Stationery product by 10 percent using whole-number arithmetic (price * 110 / 100), leaving other products alone.",
            "solution": "UPDATE products SET price = price * 110 / 100 WHERE category = 'Stationery';",
            "hints": [
                "UPDATE table SET column = expression WHERE condition.",
                "Without WHERE, every row would change."
            ],
            "explanation": "UPDATE changes the rows chosen by WHERE; leaving WHERE out changes every row, a classic mistake. Both operands are integers, so price * 110 / 100 uses integer division: 60 becomes 66, 10 becomes 11 and 150 becomes 165.",
            "source": "SQLite documentation: UPDATE",
            "ordered": false,
            "kind": "modify",
            "setup": [],
            "verify": "SELECT name, price FROM products WHERE category = 'Stationery';",
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Notebook",
                        66
                    ],
                    [
                        "Ballpoint Pen",
                        11
                    ],
                    [
                        "Marker Set",
                        165
                    ]
                ]
            }
        },
        {
            "id": "sql-delete",
            "topic": "changing data",
            "title": "Delete rows",
            "difficulty": "intermediate",
            "objective": "Remove rows with DELETE and a WHERE.",
            "instructions": "Delete every order whose status is cancelled.",
            "solution": "DELETE FROM orders WHERE status = 'cancelled';",
            "hints": [
                "DELETE FROM table WHERE condition.",
                "Without WHERE, every row would be deleted."
            ],
            "explanation": "DELETE removes the rows chosen by WHERE. Here the two cancelled orders go, leaving 18. The order_items rows of those orders stay, because nothing in this practice database enforces a foreign key, which is a reason to define keys in a real design.",
            "source": "SQLite documentation: DELETE",
            "ordered": false,
            "kind": "modify",
            "setup": [],
            "verify": "SELECT COUNT(*) FROM orders;",
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        18
                    ]
                ]
            }
        },
        {
            "id": "sql-create-table",
            "topic": "tables and constraints",
            "title": "Create a table with constraints",
            "difficulty": "advanced",
            "objective": "Define a table with a primary key, NOT NULL and a CHECK constraint.",
            "instructions": "Create a table named reviews with three columns: id (an integer primary key), product_id (an integer that cannot be empty) and rating (an integer that cannot be empty and must be between 1 and 5, using CHECK).",
            "solution": "CREATE TABLE reviews (id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5));",
            "hints": [
                "CREATE TABLE name (column type constraints, ...).",
                "The constraint CHECK (condition) rejects a row for which the condition is false.",
                "NOT NULL goes after the type."
            ],
            "explanation": "A primary key identifies each row; NOT NULL forbids a missing value; CHECK rejects a row whose condition is false. Constraints keep bad data out at the source, instead of relying on every program that writes to the table. The lab checks the column list and that a CHECK exists; it does not test the range itself.",
            "source": "SQLite documentation: CREATE TABLE",
            "ordered": false,
            "kind": "modify",
            "setup": [],
            "verify": "SELECT name, type, \"notnull\", pk FROM pragma_table_info('reviews') UNION ALL SELECT 'check constraint', CASE WHEN sql LIKE '%CHECK%' THEN 'yes' ELSE 'no' END, 0, 0 FROM sqlite_master WHERE name = 'reviews';",
            "expected": {
                "columns": 4,
                "rows": [
                    [
                        "id",
                        "INTEGER",
                        0,
                        1
                    ],
                    [
                        "product_id",
                        "INTEGER",
                        1,
                        0
                    ],
                    [
                        "rating",
                        "INTEGER",
                        1,
                        0
                    ],
                    [
                        "check constraint",
                        "yes",
                        0,
                        0
                    ]
                ]
            }
        },
        {
            "id": "sql-view",
            "topic": "tables and constraints",
            "title": "Create a view",
            "difficulty": "advanced",
            "objective": "Save a query as a view.",
            "instructions": "Create a view named premium_products that holds the name and price of the products that cost 1000 or more.",
            "solution": "CREATE VIEW premium_products AS SELECT name, price FROM products WHERE price >= 1000;",
            "hints": [
                "CREATE VIEW name AS query.",
                "A view is queried like a table."
            ],
            "explanation": "A view stores a query, not data: each time you select from it, the query runs against the current tables. Views give a name to a query that is used often, and can limit which columns are shown.",
            "source": "SQLite documentation: CREATE VIEW",
            "ordered": false,
            "kind": "modify",
            "setup": [],
            "verify": "SELECT name, price FROM premium_products;",
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Backpack",
                        1200
                    ],
                    [
                        "Headphones",
                        1800
                    ]
                ]
            }
        },
        {
            "id": "sql-index",
            "topic": "performance",
            "title": "Create an index",
            "difficulty": "advanced",
            "objective": "Add an index to speed up lookups on a column.",
            "instructions": "Create an index named idx_orders_customer on the customer_id column of the orders table.",
            "solution": "CREATE INDEX idx_orders_customer ON orders (customer_id);",
            "hints": [
                "CREATE INDEX name ON table (column).",
                "Use exactly the index name given."
            ],
            "explanation": "An index lets the database find rows by customer_id without reading the whole table, at the cost of extra storage and slower writes. On a table this small the difference is not visible. On a real table, EXPLAIN QUERY PLAN shows whether a query uses an index. This exercise checks only that the index exists.",
            "source": "SQLite documentation: CREATE INDEX, query planning",
            "ordered": false,
            "kind": "modify",
            "setup": [],
            "verify": "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name = 'idx_orders_customer';",
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "idx_orders_customer",
                        "orders"
                    ]
                ]
            }
        },
        {
            "id": "sql-transaction",
            "topic": "transactions",
            "title": "Move money in a transaction",
            "difficulty": "advanced",
            "objective": "Group two changes so that both happen or neither does.",
            "instructions": "The accounts table has Asha with 1000 and Bilal with 500. In one transaction (BEGIN ... COMMIT), move 200 from account 1 to account 2.",
            "solution": "BEGIN; UPDATE accounts SET balance = balance - 200 WHERE id = 1; UPDATE accounts SET balance = balance + 200 WHERE id = 2; COMMIT;",
            "hints": [
                "Start with BEGIN and end with COMMIT.",
                "Two UPDATE statements: subtract from account 1, add to account 2."
            ],
            "explanation": "A transaction makes several statements one unit: COMMIT makes them permanent together, and ROLLBACK would undo all of them. If the second UPDATE failed, the first should not be kept. This lab can check the balances but cannot tell whether you used BEGIN and COMMIT.",
            "source": "SQLite documentation: transactions",
            "ordered": false,
            "kind": "modify",
            "setup": [
                "CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, balance INTEGER NOT NULL); INSERT INTO accounts VALUES (1, 'Asha', 1000), (2, 'Bilal', 500);"
            ],
            "verify": "SELECT id, balance FROM accounts;",
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        1,
                        800
                    ],
                    [
                        2,
                        700
                    ]
                ]
            }
        },
        {
            "id": "sql-in-between",
            "topic": "where",
            "title": "IN and BETWEEN",
            "difficulty": "beginner",
            "objective": "Match a list of values with IN and a range with BETWEEN.",
            "instructions": "Return the name of every product in the Home or Bags category that costs between 300 and 1300, both ends included.",
            "solution": "SELECT name FROM products WHERE category IN ('Home', 'Bags') AND price BETWEEN 300 AND 1300;",
            "hints": [
                "IN (...) is a short way to write several OR tests on one column.",
                "BETWEEN a AND b includes both a and b."
            ],
            "explanation": "IN tests a column against a list, and BETWEEN 300 AND 1300 means price >= 300 AND price <= 1300, so both ends are included. The Lunch Box (280) is below the range and is left out.",
            "source": "SQLite documentation: expressions, IN and BETWEEN",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Desk Lamp"
                    ],
                    [
                        "Backpack"
                    ],
                    [
                        "Water Bottle"
                    ]
                ]
            }
        },
        {
            "id": "sql-not-in",
            "topic": "where",
            "title": "Leave some rows out",
            "difficulty": "beginner",
            "objective": "Exclude values with NOT IN.",
            "instructions": "Return the name and city of every customer who does not live in Pune or Mumbai.",
            "solution": "SELECT name, city FROM customers WHERE city NOT IN ('Pune', 'Mumbai');",
            "hints": [
                "NOT IN (...) keeps the rows whose value is not in the list."
            ],
            "explanation": "NOT IN keeps the rows whose value is missing from the list. If the list could contain NULL, NOT IN would return no rows at all, because a comparison with NULL is unknown; with a fixed list of text values, as here, that cannot happen.",
            "source": "SQLite documentation: expressions, IN and NOT IN",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Chitra Iyer",
                        "Chennai"
                    ],
                    [
                        "Divya Nair",
                        "Kochi"
                    ],
                    [
                        "Gita Sharma",
                        "Delhi"
                    ],
                    [
                        "Anil Kumar",
                        "Delhi"
                    ],
                    [
                        "Hari Prasad",
                        "Chennai"
                    ],
                    [
                        "Isha Patel",
                        "Ahmedabad"
                    ],
                    [
                        "Kavya Reddy",
                        "Hyderabad"
                    ]
                ]
            }
        },
        {
            "id": "sql-alias-arithmetic",
            "topic": "select",
            "title": "Calculate a column and name it",
            "difficulty": "beginner",
            "objective": "Compute a value in the SELECT list and give it an alias.",
            "instructions": "Return the name of every product and its price with 18 percent added, rounded to 2 decimals, as a column named price_with_tax.",
            "solution": "SELECT name, ROUND(price * 1.18, 2) AS price_with_tax FROM products;",
            "hints": [
                "Arithmetic works on columns: price * 1.18.",
                "ROUND(value, 2) keeps two decimals. AS gives the column a name."
            ],
            "explanation": "An expression in the SELECT list is calculated for every row, and AS gives its column a readable name. The lab compares the values, not the column name, but a clear alias is what makes a real report understandable.",
            "source": "SQLite documentation: SELECT, column aliases; core functions, round()",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Notebook",
                        70.8
                    ],
                    [
                        "Ballpoint Pen",
                        11.8
                    ],
                    [
                        "Desk Lamp",
                        531.0
                    ],
                    [
                        "Backpack",
                        1416.0
                    ],
                    [
                        "Water Bottle",
                        413.0
                    ],
                    [
                        "Calculator",
                        826.0
                    ],
                    [
                        "Headphones",
                        2124.0
                    ],
                    [
                        "Marker Set",
                        177.0
                    ],
                    [
                        "Laptop Stand",
                        1121.0
                    ],
                    [
                        "Lunch Box",
                        330.4
                    ]
                ]
            }
        },
        {
            "id": "sql-count-distinct",
            "topic": "aggregates",
            "title": "Count different values",
            "difficulty": "intermediate",
            "objective": "Count how many different values a column holds.",
            "instructions": "Return how many different customers have placed at least one order.",
            "solution": "SELECT COUNT(DISTINCT customer_id) FROM orders;",
            "hints": [
                "COUNT(*) counts rows; COUNT(DISTINCT column) counts different values."
            ],
            "explanation": "Several orders can belong to one customer, so COUNT(*) on orders would count orders, not customers. COUNT(DISTINCT customer_id) counts each customer once, which is 10 here.",
            "source": "SQLite documentation: aggregate functions, count()",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        10
                    ]
                ]
            }
        },
        {
            "id": "sql-union",
            "topic": "joins",
            "title": "Combine two queries",
            "difficulty": "intermediate",
            "objective": "Stack two result sets with UNION.",
            "instructions": "Return, as one list with no repeats, the ids of the customers who ordered in January 2024 together with those who ordered in March 2024. Use the order_date text, for example LIKE '2024-01%'.",
            "solution": "SELECT customer_id FROM orders WHERE order_date LIKE '2024-01%' UNION SELECT customer_id FROM orders WHERE order_date LIKE '2024-03%';",
            "hints": [
                "Write one SELECT for each month and put UNION between them.",
                "Both queries must return the same number of columns."
            ],
            "explanation": "UNION stacks the results of two queries and removes duplicate rows, so a customer who ordered in both months appears once. UNION ALL would keep the duplicates. The two queries must return the same number of columns.",
            "source": "SQLite documentation: compound SELECT statements",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        1
                    ],
                    [
                        2
                    ],
                    [
                        6
                    ],
                    [
                        7
                    ],
                    [
                        9
                    ]
                ]
            }
        },
        {
            "id": "sql-not-exists",
            "topic": "subqueries",
            "title": "Rows with no match",
            "difficulty": "intermediate",
            "objective": "Find rows that have no related row with NOT EXISTS.",
            "instructions": "Return the name of every customer who has never placed an order, using NOT EXISTS.",
            "solution": "SELECT name FROM customers AS c WHERE NOT EXISTS (SELECT 1 FROM orders AS o WHERE o.customer_id = c.id);",
            "hints": [
                "The inner query looks for an order of this customer: WHERE o.customer_id = c.id.",
                "NOT EXISTS keeps the customers for whom the inner query finds nothing."
            ],
            "explanation": "EXISTS asks whether the inner query returns any row for the current customer, and NOT EXISTS keeps the customers for whom it does not. It behaves safely when NULLs are involved, unlike NOT IN with a subquery that can return NULL.",
            "source": "SQLite documentation: expressions, EXISTS",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "Anil Kumar"
                    ],
                    [
                        "Kavya Reddy"
                    ]
                ]
            }
        },
        {
            "id": "sql-running-total",
            "topic": "window",
            "title": "Running total",
            "difficulty": "advanced",
            "objective": "Add a running total with a window function.",
            "instructions": "For each order show its id, its total value (quantity times price, added up over its items) and the running total of those values in order id order. Return the three columns: id, total and running_total.",
            "solution": "WITH t AS (SELECT o.id, SUM(oi.quantity * p.price) AS total FROM orders AS o JOIN order_items AS oi ON oi.order_id = o.id JOIN products AS p ON p.id = oi.product_id GROUP BY o.id) SELECT id, total, SUM(total) OVER (ORDER BY id) AS running_total FROM t ORDER BY id;",
            "hints": [
                "First compute each order's total with a join and GROUP BY, for example in a WITH clause.",
                "SUM(total) OVER (ORDER BY id) adds up the values so far."
            ],
            "explanation": "The WITH clause computes one total per order. SUM(total) OVER (ORDER BY id) then adds each total to all the ones before it, without collapsing the rows. A window function is the right tool whenever each row needs a value that depends on other rows.",
            "source": "SQLite documentation: window functions",
            "ordered": true,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 3,
                "rows": [
                    [
                        1,
                        230,
                        230
                    ],
                    [
                        2,
                        1200,
                        1430
                    ],
                    [
                        3,
                        1820,
                        3250
                    ],
                    [
                        4,
                        800,
                        4050
                    ],
                    [
                        5,
                        1400,
                        5450
                    ],
                    [
                        6,
                        540,
                        5990
                    ],
                    [
                        7,
                        950,
                        6940
                    ],
                    [
                        8,
                        840,
                        7780
                    ],
                    [
                        9,
                        3000,
                        10780
                    ],
                    [
                        10,
                        100,
                        10880
                    ],
                    [
                        11,
                        980,
                        11860
                    ],
                    [
                        12,
                        700,
                        12560
                    ],
                    [
                        13,
                        1050,
                        13610
                    ],
                    [
                        14,
                        120,
                        13730
                    ],
                    [
                        15,
                        1000,
                        14730
                    ],
                    [
                        16,
                        1200,
                        15930
                    ],
                    [
                        17,
                        1800,
                        17730
                    ],
                    [
                        18,
                        1150,
                        18880
                    ],
                    [
                        19,
                        350,
                        19230
                    ],
                    [
                        20,
                        1070,
                        20300
                    ]
                ]
            }
        },
        {
            "id": "sql-top-per-group",
            "topic": "window",
            "title": "Best row in each group",
            "difficulty": "advanced",
            "objective": "Pick the top row of every group with ROW_NUMBER.",
            "instructions": "Return the category, name and price of the most expensive product in each category.",
            "solution": "WITH r AS (SELECT category, name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS n FROM products) SELECT category, name, price FROM r WHERE n = 1;",
            "hints": [
                "Number the products inside each category: ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC).",
                "Keep the rows numbered 1 in an outer query."
            ],
            "explanation": "PARTITION BY restarts the numbering for each category, and ORDER BY price DESC gives number 1 to the dearest product. A window function cannot be used in WHERE, so the numbering is done in a WITH clause and filtered outside it.",
            "source": "SQLite documentation: window functions, row_number()",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 3,
                "rows": [
                    [
                        "Bags",
                        "Backpack",
                        1200
                    ],
                    [
                        "Electronics",
                        "Headphones",
                        1800
                    ],
                    [
                        "Home",
                        "Desk Lamp",
                        450
                    ],
                    [
                        "Stationery",
                        "Marker Set",
                        150
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-trim",
            "topic": "data cleaning",
            "title": "Trim stray spaces",
            "difficulty": "beginner",
            "objective": "Remove leading and trailing spaces with TRIM.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Return each contact's id and name with the spaces at both ends removed.",
            "solution": "SELECT id, TRIM(name) FROM contacts_raw;",
            "hints": [
                "TRIM(text) removes spaces from both ends of the text."
            ],
            "explanation": "Hand-typed data often has spaces at the ends of values, and they make '  Asha Rao ' different from 'Asha Rao' in a comparison or a grouping. TRIM removes them. It does not touch spaces in the middle of the text.",
            "source": "SQLite documentation: core functions, trim()",
            "ordered": false,
            "kind": "query",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        1,
                        "Asha Rao"
                    ],
                    [
                        2,
                        "bilal khan"
                    ],
                    [
                        3,
                        "Asha Rao"
                    ],
                    [
                        4,
                        "Chitra Iyer"
                    ],
                    [
                        5,
                        "Divya Nair"
                    ],
                    [
                        6,
                        "divya nair"
                    ],
                    [
                        7,
                        "Farhan Ali"
                    ],
                    [
                        8,
                        "Gita Sharma"
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-case",
            "topic": "data cleaning",
            "title": "Make text consistent",
            "difficulty": "beginner",
            "objective": "Standardise capitals so the same value is written the same way.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Return each different city once, written in lower case with no spaces at the ends. Pune, pune and ' pune' should be one value.",
            "solution": "SELECT DISTINCT LOWER(TRIM(city)) FROM contacts_raw;",
            "hints": [
                "Use LOWER for capitals and TRIM for the spaces.",
                "DISTINCT then removes the repeats."
            ],
            "explanation": "The same city was typed as 'Kochi', '  Kochi', 'pune', 'Pune' and 'MUMBAI'. Cleaning first (TRIM, LOWER) and then counting or grouping avoids splitting one city into several. There are five cities once they are cleaned.",
            "source": "SQLite documentation: core functions, lower() and trim()",
            "ordered": false,
            "kind": "query",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        "pune"
                    ],
                    [
                        "mumbai"
                    ],
                    [
                        "chennai"
                    ],
                    [
                        "kochi"
                    ],
                    [
                        "delhi"
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-nullif",
            "topic": "data cleaning",
            "title": "Empty text is not NULL",
            "difficulty": "intermediate",
            "objective": "Turn empty text into NULL with NULLIF.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Return each contact's id and email, trimmed, with an empty email shown as NULL.",
            "solution": "SELECT id, NULLIF(TRIM(email), '') FROM contacts_raw;",
            "hints": [
                "NULLIF(a, b) returns NULL when a equals b, otherwise a.",
                "Trim the email first."
            ],
            "explanation": "An empty string and NULL both mean no email, but they behave differently: COUNT(email) counts the empty string and IS NULL does not match it. Converting empty text to NULL makes missing values consistent. Email 2 has a space at the end, which TRIM also removes.",
            "source": "SQLite documentation: core functions, nullif()",
            "ordered": false,
            "kind": "query",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        1,
                        "ASHA@Example.com"
                    ],
                    [
                        2,
                        "bilal@example.com"
                    ],
                    [
                        3,
                        "asha@example.com"
                    ],
                    [
                        4,
                        null
                    ],
                    [
                        5,
                        null
                    ],
                    [
                        6,
                        "divya@example.com"
                    ],
                    [
                        7,
                        "farhan@example.com"
                    ],
                    [
                        8,
                        "gita@example.com"
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-coalesce",
            "topic": "data cleaning",
            "title": "Replace missing values",
            "difficulty": "intermediate",
            "objective": "Show a default for missing values with COALESCE.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Return each contact's id and email, trimmed, showing the text unknown when the email is missing or empty.",
            "solution": "SELECT id, COALESCE(NULLIF(TRIM(email), ''), 'unknown') FROM contacts_raw;",
            "hints": [
                "Combine NULLIF to turn empty text into NULL with COALESCE to replace NULL.",
                "COALESCE returns its first argument that is not NULL."
            ],
            "explanation": "COALESCE returns the first value that is not NULL. Wrapping NULLIF inside it handles both missing forms at once, NULL and empty text. Replacing a missing value with a label is a presentation choice, so keep the original data when it matters.",
            "source": "SQLite documentation: core functions, coalesce()",
            "ordered": false,
            "kind": "query",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        1,
                        "ASHA@Example.com"
                    ],
                    [
                        2,
                        "bilal@example.com"
                    ],
                    [
                        3,
                        "asha@example.com"
                    ],
                    [
                        4,
                        "unknown"
                    ],
                    [
                        5,
                        "unknown"
                    ],
                    [
                        6,
                        "divya@example.com"
                    ],
                    [
                        7,
                        "farhan@example.com"
                    ],
                    [
                        8,
                        "gita@example.com"
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-duplicates",
            "topic": "data cleaning",
            "title": "Find duplicate records",
            "difficulty": "intermediate",
            "objective": "Find records that repeat once the data is cleaned.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Return each email that appears more than once after trimming it and writing it in lower case, with how many times it appears. Ignore missing and empty emails.",
            "solution": "SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS n FROM contacts_raw WHERE TRIM(email) <> '' GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1;",
            "hints": [
                "Group by the cleaned email: GROUP BY LOWER(TRIM(email)).",
                "HAVING COUNT(*) > 1 keeps the groups with repeats. A NULL email is not equal to '' so TRIM(email) <> '' also removes the NULL ones."
            ],
            "explanation": "ASHA@Example.com and asha@example.com are the same address written two ways, so contact 1 and contact 3 are duplicates. Grouping by the cleaned value finds them. The WHERE test also drops NULL emails, because TRIM(NULL) <> '' is not true.",
            "source": "SQLite documentation: SELECT, GROUP BY and HAVING",
            "ordered": false,
            "kind": "query",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "asha@example.com",
                        2
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-bad-dates",
            "topic": "data cleaning",
            "title": "Find invalid dates",
            "difficulty": "advanced",
            "objective": "Find values that are not valid dates in the standard format.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Return the id of every contact whose signup is not a valid date written as YYYY-MM-DD.",
            "solution": "SELECT id FROM contacts_raw WHERE date(signup) IS NULL OR date(signup) <> signup;",
            "hints": [
                "The function date(text) returns NULL when it cannot read the text as a date.",
                "Compare date(signup) with signup to catch dates written another way."
            ],
            "explanation": "SQLite has no date type: dates are text. date(signup) returns NULL for text that is not a valid date, such as 2024-13-40 (there is no month 13), and 05/02/2024 is not in the YYYY-MM-DD form. The second test catches text that date() would read but in a different form.",
            "source": "SQLite documentation: date and time functions",
            "ordered": false,
            "kind": "query",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": null,
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        4
                    ],
                    [
                        6
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-delete-duplicates",
            "topic": "data cleaning",
            "title": "Remove duplicates, keep one",
            "difficulty": "advanced",
            "objective": "Delete the repeated records and keep the first of each.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Delete the duplicate contacts: for each cleaned (trimmed, lower case) email that appears more than once, keep only the contact with the lowest id. Leave the contacts with a missing or empty email alone.",
            "solution": "DELETE FROM contacts_raw WHERE TRIM(email) <> '' AND id NOT IN (SELECT MIN(id) FROM contacts_raw WHERE TRIM(email) <> '' GROUP BY LOWER(TRIM(email)));",
            "hints": [
                "The subquery returns the lowest id for every cleaned email.",
                "Delete the rows with a real email whose id is not in that list."
            ],
            "explanation": "The subquery lists the one id to keep for each cleaned email, and the DELETE removes every other row with a real email. Contact 3 is removed and contact 1 stays. Always run the matching SELECT first to see what a DELETE will remove.",
            "source": "SQLite documentation: DELETE",
            "ordered": false,
            "kind": "modify",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": "SELECT id FROM contacts_raw ORDER BY id;",
            "expected": {
                "columns": 1,
                "rows": [
                    [
                        1
                    ],
                    [
                        2
                    ],
                    [
                        4
                    ],
                    [
                        5
                    ],
                    [
                        6
                    ],
                    [
                        7
                    ],
                    [
                        8
                    ]
                ]
            }
        },
        {
            "id": "sql-clean-update",
            "topic": "data cleaning",
            "title": "Fix the whole table",
            "difficulty": "advanced",
            "objective": "Clean text in place with UPDATE.",
            "instructions": "The table contacts_raw holds contact records typed in by hand, so they are untidy. Update every row so that name and city have no spaces at the ends, and so that city is written in lower case.",
            "solution": "UPDATE contacts_raw SET name = TRIM(name), city = LOWER(TRIM(city));",
            "hints": [
                "UPDATE can set several columns at once, separated by commas.",
                "Apply TRIM to name and TRIM then LOWER to city."
            ],
            "explanation": "One UPDATE can change several columns. Cleaning data in place is permanent, so a careful workflow keeps the raw table and writes the cleaned data to a new table or view. The lab checks the name and city of every row afterwards.",
            "source": "SQLite documentation: UPDATE",
            "ordered": false,
            "kind": "modify",
            "setup": [
                "CREATE TABLE contacts_raw (id INTEGER PRIMARY KEY, name TEXT, email TEXT, city TEXT, signup TEXT); INSERT INTO contacts_raw VALUES (1, '  Asha Rao ', 'ASHA@Example.com', 'pune', '2024-01-05'), (2, 'bilal khan', 'bilal@example.com ', 'Mumbai', '2024-01-09'), (3, 'Asha Rao', 'asha@example.com', 'Pune', '2024-01-05'), (4, 'Chitra Iyer', '', 'Chennai', '05/02/2024'), (5, 'Divya Nair', NULL, '  Kochi', '2024-02-11'), (6, 'divya nair', 'divya@example.com', 'Kochi', '2024-13-40'), (7, 'Farhan Ali', 'farhan@example.com', 'MUMBAI', '2024-03-01'), (8, 'Gita Sharma', 'gita@example.com', 'Delhi', '2024-03-15');"
            ],
            "verify": "SELECT id, name, city FROM contacts_raw;",
            "expected": {
                "columns": 3,
                "rows": [
                    [
                        1,
                        "Asha Rao",
                        "pune"
                    ],
                    [
                        2,
                        "bilal khan",
                        "mumbai"
                    ],
                    [
                        3,
                        "Asha Rao",
                        "pune"
                    ],
                    [
                        4,
                        "Chitra Iyer",
                        "chennai"
                    ],
                    [
                        5,
                        "Divya Nair",
                        "kochi"
                    ],
                    [
                        6,
                        "divya nair",
                        "kochi"
                    ],
                    [
                        7,
                        "Farhan Ali",
                        "mumbai"
                    ],
                    [
                        8,
                        "Gita Sharma",
                        "delhi"
                    ]
                ]
            }
        },
        {
            "id": "sql-project-monthly",
            "topic": "projects",
            "title": "Sales report 1: revenue by month",
            "difficulty": "intermediate",
            "objective": "Report the revenue of delivered orders for each month.",
            "instructions": "Project, step 1 of 3. For delivered orders only, return each month as text like 2024-02 and the revenue of that month (quantity times price, added up), oldest month first. Use strftime('%Y-%m', order_date) for the month.",
            "solution": "SELECT strftime('%Y-%m', o.order_date) AS month, SUM(oi.quantity * p.price) AS revenue FROM orders AS o JOIN order_items AS oi ON oi.order_id = o.id JOIN products AS p ON p.id = oi.product_id WHERE o.status = 'delivered' GROUP BY month ORDER BY month;",
            "hints": [
                "Join orders, order_items and products, then filter the status.",
                "Group by the month text from strftime.",
                "Revenue is SUM(oi.quantity * p.price)."
            ],
            "explanation": "Each order item is worth quantity times the product price. Joining the three tables, keeping delivered orders and grouping by month gives the report. A common mistake is summing the order total after joining the items, which counts each total once per item.",
            "source": "SQLite documentation: date and time functions, strftime()",
            "ordered": true,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "2024-01",
                        1430
                    ],
                    [
                        "2024-02",
                        2290
                    ],
                    [
                        "2024-03",
                        3980
                    ],
                    [
                        "2024-04",
                        1700
                    ],
                    [
                        "2024-05",
                        2350
                    ],
                    [
                        "2024-06",
                        1070
                    ]
                ]
            }
        },
        {
            "id": "sql-project-customers",
            "topic": "projects",
            "title": "Sales report 2: best customers",
            "difficulty": "advanced",
            "objective": "Rank customers by the revenue of their delivered orders.",
            "instructions": "Project, step 2 of 3. Return the name and total delivered revenue of the three customers with the highest delivered revenue, the highest first.",
            "solution": "SELECT c.name, SUM(oi.quantity * p.price) AS revenue FROM customers AS c JOIN orders AS o ON o.customer_id = c.id JOIN order_items AS oi ON oi.order_id = o.id JOIN products AS p ON p.id = oi.product_id WHERE o.status = 'delivered' GROUP BY c.id, c.name ORDER BY revenue DESC LIMIT 3;",
            "hints": [
                "Start from customers and join orders, order_items and products.",
                "Group by the customer, order by the revenue descending and keep three rows."
            ],
            "explanation": "Four tables are joined, delivered orders are kept, and the revenue is added up per customer. Grouping by c.id as well as c.name keeps two customers with the same name apart. LIMIT 3 keeps the top three.",
            "source": "SQLite documentation: SELECT, joins and GROUP BY",
            "ordered": true,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 2,
                "rows": [
                    [
                        "Bilal Khan",
                        4150
                    ],
                    [
                        "Asha Rao",
                        1970
                    ],
                    [
                        "Chitra Iyer",
                        1800
                    ]
                ]
            }
        },
        {
            "id": "sql-project-share",
            "topic": "projects",
            "title": "Sales report 3: share by category",
            "difficulty": "advanced",
            "objective": "Show each category's share of the total delivered revenue.",
            "instructions": "Project, step 3 of 3. For delivered orders, return each product category with its revenue and its share of the total delivered revenue as a percentage rounded to 1 decimal place (columns: category, revenue, share).",
            "solution": "SELECT p.category, SUM(oi.quantity * p.price) AS revenue, ROUND(100.0 * SUM(oi.quantity * p.price) / (SELECT SUM(oi2.quantity * p2.price) FROM orders AS o2 JOIN order_items AS oi2 ON oi2.order_id = o2.id JOIN products AS p2 ON p2.id = oi2.product_id WHERE o2.status = 'delivered'), 1) AS share FROM orders AS o JOIN order_items AS oi ON oi.order_id = o.id JOIN products AS p ON p.id = oi.product_id WHERE o.status = 'delivered' GROUP BY p.category;",
            "hints": [
                "Compute the grand total in a subquery with the same joins and filter.",
                "Multiply by 100.0 (with a decimal point) so the division is not whole-number division."
            ],
            "explanation": "The subquery returns one number, the total delivered revenue, which divides each category's revenue. 100.0 forces decimal division; with whole numbers SQLite would divide as integers and give 0 for most shares. The shares add up to about 100.",
            "source": "SQLite documentation: expressions, scalar subqueries",
            "ordered": false,
            "kind": "query",
            "setup": [],
            "verify": null,
            "expected": {
                "columns": 3,
                "rows": [
                    [
                        "Bags",
                        3600,
                        28.1
                    ],
                    [
                        "Electronics",
                        5100,
                        39.8
                    ],
                    [
                        "Home",
                        2790,
                        21.8
                    ],
                    [
                        "Stationery",
                        1330,
                        10.4
                    ]
                ]
            }
        }
    ]
};
