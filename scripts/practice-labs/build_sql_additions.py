"""
ToolZen Hub - SQL learning path: new lessons, exercises and datasets (Stage 2 of the Practice Labs mission).

The content is written here, by hand. Every example and every solution is then run with Python's sqlite3, a separate
SQLite build from the sql.js used in the browser, and the results are written into two generated modules:

  assets/js/practice-labs/sql/additions-data.js     datasets + the checked exercise set (loaded by the browser)
  assets/js/practice-labs/sql/additions-lessons.js  lesson text with example results (build-time only)

Expected results therefore come from an independent engine, the same method the SQL Practice Lab's header describes.
Plan exercises are asserted here against the real EXPLAIN QUERY PLAN output. The SQL Practice Lab itself is not changed.

Run:  python scripts/practice-labs/build_sql_additions.py      (deterministic; re-run after editing any content below)
"""
import json
import re
import sqlite3
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "assets/js/practice-labs/sql"
SHOP = json.loads(subprocess.run(
    ["node", "--input-type=module", "-e",
     "const d=await import('./assets/js/tools/sql-practice-lab/dataset.js');console.log(JSON.stringify(d.SETUP))"],
    cwd=ROOT, capture_output=True, text=True, check=True).stdout)

# ---------------------------------------------------------------- datasets (original, synthetic)

EMPLOYEES = [
    "CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL);",
    """INSERT INTO departments VALUES (1,'Leadership','Bengaluru'),(2,'Engineering','Bengaluru'),(3,'Quality','Pune'),
 (4,'Sales','Mumbai'),(5,'Support','Pune');""",
    """CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER NOT NULL REFERENCES departments(id),
 manager_id INTEGER REFERENCES employees(id), title TEXT NOT NULL, hire_date TEXT NOT NULL, salary INTEGER NOT NULL);""",
    """INSERT INTO employees VALUES
 (1,'Meera Joshi',1,NULL,'Chief Executive','2018-04-02',420000),
 (2,'Ravi Menon',2,1,'Head of Engineering','2018-06-11',310000),
 (3,'Sana Qureshi',3,1,'Head of Quality','2019-01-07',260000),
 (4,'Vikram Rao',4,1,'Head of Sales','2019-03-18',280000),
 (5,'Neha Gupta',2,2,'Engineering Lead','2019-08-05',210000),
 (6,'Aditya Singh',2,2,'Engineering Lead','2020-02-10',205000),
 (7,'Pooja Iyer',2,5,'Developer','2020-07-01',140000),
 (8,'Rahul Das',2,5,'Developer','2021-01-11',128000),
 (9,'Fatima Shaikh',2,6,'Developer','2021-05-24',128000),
 (10,'Karan Malhotra',2,6,'Developer','2022-09-12',115000),
 (11,'Lakshmi Pillai',3,3,'QA Lead','2020-03-16',170000),
 (12,'Omar Farooq',3,11,'Test Engineer','2021-08-02',95000),
 (13,'Priya Nambiar',3,11,'Automation Engineer','2022-01-17',118000),
 (14,'Suresh Babu',4,4,'Account Manager','2020-11-09',120000),
 (15,'Tanvi Kulkarni',4,4,'Account Manager','2023-02-06',98000),
 (16,'Zoya Ahmed',5,1,'Support Manager','2021-04-12',150000),
 (17,'Manoj Yadav',5,16,'Support Agent','2022-06-20',62000),
 (18,'Ritu Saxena',5,16,'Support Agent','2024-01-08',58000);""",
]

BANK = [
    """CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('savings','current')),
 opened TEXT NOT NULL, overdraft_limit INTEGER NOT NULL DEFAULT 0);""",
    """INSERT INTO accounts VALUES (1,'Asha Rao','savings','2023-01-10',0),(2,'Bilal Khan','current','2022-11-02',20000),
 (3,'Chitra Iyer','savings','2023-05-21',0),(4,'Divya Nair','current','2021-08-30',50000),(5,'Farhan Ali','savings','2024-02-14',0),
 (6,'Gita Sharma','savings','2023-09-09',0);""",
    """CREATE TABLE transactions (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id), tx_date TEXT NOT NULL,
 amount INTEGER NOT NULL, description TEXT NOT NULL, ref TEXT NOT NULL);""",
    """INSERT INTO transactions VALUES
 (1,1,'2024-01-01',50000,'Salary','SAL-0101'),(2,1,'2024-01-05',-1200,'Electricity','UPI-1001'),
 (3,1,'2024-01-18',-8000,'Rent share','UPI-1002'),(4,1,'2024-02-01',50000,'Salary','SAL-0201'),
 (5,1,'2024-02-11',-15000,'Laptop EMI','NACH-2001'),(6,1,'2024-03-01',50000,'Salary','SAL-0301'),
 (7,1,'2024-03-09',-2500,'Groceries','UPI-1003'),
 (8,2,'2024-01-03',120000,'Client payment','NEFT-5001'),(9,2,'2024-01-15',-90000,'Supplier','NEFT-5002'),
 (10,2,'2024-02-02',-45000,'Payroll','NEFT-5003'),(11,2,'2024-02-20',30000,'Client payment','NEFT-5004'),
 (12,2,'2024-03-05',-25000,'Office rent','NEFT-5005'),
 (13,3,'2024-01-02',20000,'Opening deposit','DEP-3001'),(14,3,'2024-01-20',-3500,'Insurance','NACH-3002'),
 (15,3,'2024-02-15',-3500,'Insurance','NACH-3003'),(16,3,'2024-03-15',-3500,'Insurance','NACH-3004'),
 (17,4,'2024-01-04',200000,'Client payment','RTGS-4001'),(18,4,'2024-01-25',-230000,'Equipment','RTGS-4002'),
 (19,4,'2024-02-26',80000,'Client payment','RTGS-4003'),(20,4,'2024-03-28',-10000,'Bank charges','FEE-4004'),
 (21,5,'2024-02-14',5000,'Opening deposit','DEP-5001'),(22,5,'2024-02-20',-2000,'Shopping','UPI-5002'),
 (23,5,'2024-02-20',-2000,'Shopping','UPI-5002'),(24,5,'2024-03-02',-1800,'Mobile recharge','UPI-5003'),
 (25,6,'2024-01-10',15000,'Opening deposit','DEP-6001'),(26,6,'2024-03-20',-4000,'Course fees','UPI-6002');""",
]

DATASETS = {"employees": EMPLOYEES, "bank": BANK}
DATASET_NOTES = {
    "employees": "employees (18 people of an imaginary software company: id, name, department_id, manager_id, title, hire_date, salary in rupees a month) and departments (id, name, location).",
    "bank": "accounts (id, holder, type savings or current, opened, overdraft_limit) and transactions (id, account_id, tx_date, amount: positive money in and negative money out, description, ref).",
}

MONTHLY = ("WITH monthly AS (SELECT strftime('%Y-%m', o.order_date) AS month, SUM(p.price * oi.quantity) AS revenue "
           "FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id "
           "WHERE o.status <> 'cancelled' GROUP BY month)")

# ---------------------------------------------------------------- exercises

EX = []


def ex(id, title, difficulty, objective, instructions, solution, hints, explanation, source,
       dataset=None, ordered=False, kind="query", verify=None, plan=None, extra_setup=()):
    EX.append(dict(id=id, topic=None, title=title, difficulty=difficulty, objective=objective, instructions=instructions,
                   solution=solution, hints=hints, explanation=explanation, source=source, ordered=ordered, kind=kind,
                   dataset=dataset, verify=verify, plan=plan, extra_setup=list(extra_setup)))
    return id


# L19 dates and text
ex("sqlp-weekday-orders", "Delivered orders by weekday", "intermediate",
   "Group rows by a part of a date with strftime.",
   "Count the delivered orders for each day of the week. Return two columns: the weekday as strftime('%w', order_date) gives it (0 is Sunday, 6 is Saturday) and the number of delivered orders. One row for each weekday that has any.",
   "SELECT strftime('%w', order_date) AS weekday, COUNT(*) AS delivered\nFROM orders\nWHERE status = 'delivered'\nGROUP BY weekday;",
   ["Filter to delivered orders first with WHERE.", "strftime('%w', order_date) returns the weekday as text from '0' to '6'.", "Group by that expression (or its alias) and count the rows."],
   "WHERE keeps only delivered orders, strftime('%w', ...) turns each date into its weekday, and GROUP BY with COUNT(*) counts the orders in each weekday group. Grouping by the alias works in SQLite and in MySQL and PostgreSQL; some databases need the full expression repeated.",
   "SQLite documentation: Date and time functions")
ex("sqlp-days-since-joining", "Days between two dates", "intermediate",
   "Calculate the number of days between two dates with julianday.",
   "For each customer whose join date is known, return the name and the number of whole days from the day they joined to 1 January 2024 (call it days). Leave out customers without a join date.",
   "SELECT name, CAST(julianday('2024-01-01') - julianday(joined) AS INTEGER) AS days\nFROM customers\nWHERE joined IS NOT NULL;",
   ["julianday turns a date into a number of days, so subtracting two of them gives the gap.", "CAST(... AS INTEGER) drops the fraction.", "A missing join date is NULL: filter it out with IS NOT NULL."],
   "julianday('2024-01-01') - julianday(joined) is the number of days between the two dates. Without the WHERE, the customer with no join date would appear with NULL days, because any calculation with NULL is NULL.",
   "SQLite documentation: Date and time functions")
ex("sqlp-first-quarter-orders", "Orders in a date range", "intermediate",
   "Filter by a date range written so that the column stands alone.",
   "Return the id and order_date of every order placed in the first quarter of 2024 (1 January to 31 March), oldest first. If two orders share a date, list the smaller id first.",
   "SELECT id, order_date\nFROM orders\nWHERE order_date >= '2024-01-01' AND order_date < '2024-04-01'\nORDER BY order_date, id;",
   ["Dates stored as YYYY-MM-DD text compare correctly as text.", "Use a range: on or after 1 January and before 1 April.", "Sort by order_date and then id."],
   "Because the dates are stored as YYYY-MM-DD, comparing them as text gives date order. Writing the range as >= the first day and < the day after the last day is safe even if times are added to the dates later, and it lets an index on order_date be used (lesson 'Writing faster queries').",
   "SQLite documentation: Date and time functions", ordered=True)
ex("sqlp-product-codes", "Build a code from text", "intermediate",
   "Combine text functions: SUBSTR, UPPER and concatenation.",
   "Return each product's name and a code made of the first three letters of its category in capitals, a dash and the product id (for example STA-1 for product 1 in Stationery). Call the second column code.",
   "SELECT name, UPPER(SUBSTR(category, 1, 3)) || '-' || id AS code\nFROM products;",
   ["SUBSTR(category, 1, 3) takes three characters starting at the first; positions start at 1.", "UPPER turns text into capitals.", "|| joins pieces of text; a number is turned into text when joined."],
   "SUBSTR picks the first three letters, UPPER capitalises them and || joins them with the dash and the id. MySQL uses CONCAT() instead of ||, and SQL Server uses + or CONCAT().",
   "SQLite documentation: Core functions")

# L20 running totals
ex("sqlp-balance-account-3", "Running balance of one account", "advanced",
   "Compute a running total with SUM() OVER (ORDER BY ...).",
   "Using the bank data, return each transaction of account 3 with its id, tx_date, amount and the balance after it (call it balance), oldest first. Order the running total by date and then by id.",
   "SELECT id, tx_date, amount,\n       SUM(amount) OVER (ORDER BY tx_date, id) AS balance\nFROM transactions\nWHERE account_id = 3\nORDER BY tx_date, id;",
   ["Filter to account 3 with WHERE.", "SUM(amount) OVER (ORDER BY tx_date, id) adds each row to the rows before it.", "Sort the final result by tx_date, id as well."],
   "The window sums every row from the first to the current one in date order, so each row shows the balance after that transaction: 20000, then 16500, 13000 and 9500. Adding id to the window's ORDER BY makes the order of same-day transactions fixed.",
   "SQLite documentation: Window functions", dataset="bank", ordered=True)
ex("sqlp-overdrawn-moments", "When did a balance go below zero?", "advanced",
   "Filter on a window function's result by computing it in a CTE first.",
   "Using the bank data, find every transaction after which an account's balance was below zero. Return account_id, the transaction id and the balance right after it (balance), for all accounts.",
   "WITH running AS (\n  SELECT account_id, id,\n         SUM(amount) OVER (PARTITION BY account_id ORDER BY tx_date, id) AS balance\n  FROM transactions\n)\nSELECT account_id, id, balance\nFROM running\nWHERE balance < 0;",
   ["Compute each account's running balance with PARTITION BY account_id.", "A window function cannot appear in WHERE: compute it in a CTE.", "Then select the rows of the CTE where balance < 0."],
   "PARTITION BY restarts the balance for each account. The CTE computes it, and the outer query keeps the negative moments: the current accounts 2 and 4 go below zero within their overdraft limits, while savings account 5 goes to -800, which a real bank would reject. The duplicate UPI-5002 payment is the cause, which the banking project investigates.",
   "SQLite documentation: Window functions", dataset="bank")
ex("sqlp-revenue-to-date", "Revenue to date by month", "advanced",
   "Run a total over an aggregated result in the same query.",
   "Return each month (as YYYY-MM, column month) and the revenue to date (column revenue_to_date): the total value (price times quantity) of all non-cancelled orders up to and including that month, oldest month first.",
   MONTHLY + "\nSELECT month, SUM(revenue) OVER (ORDER BY month) AS revenue_to_date\nFROM monthly\nORDER BY month;",
   ["First total each month's revenue: join orders, order_items and products, leave out cancelled orders and group by the month.", "Put that in a CTE called monthly.", "Then SUM(revenue) OVER (ORDER BY month) gives the running total."],
   "The CTE collapses the order lines into one row per month; the window then adds the months up in order. Doing the GROUP BY and the window in two steps keeps each step easy to read and check.",
   "SQLite documentation: Window functions", ordered=True)

# L21 LAG, LEAD, ranking
ex("sqlp-previous-order-date", "Each customer's previous order", "advanced",
   "Read a value from the previous row of the same group with LAG.",
   "For every order, return customer_id, the order id, its order_date and the date of the same customer's previous order (call it previous_order; NULL for a customer's first order). Order the window by order_date and then id.",
   "SELECT customer_id, id, order_date,\n       LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date, id) AS previous_order\nFROM orders;",
   ["LAG(column) OVER (...) returns the column's value from the previous row of the window.", "PARTITION BY customer_id keeps each customer's orders separate.", "The window's ORDER BY decides which row is 'previous'."],
   "LAG looks one row back within each customer's orders, so the first order of every customer has no previous row and gets NULL. LEAD would look forward instead.",
   "SQLite documentation: Window functions")
ex("sqlp-dense-rank-salaries", "Rank salaries without gaps", "advanced",
   "Choose between ROW_NUMBER, RANK and DENSE_RANK.",
   "Using the employees data, rank the people in the Engineering department (department_id 2) by salary, highest first, so that equal salaries share a rank and no rank number is skipped. Return name, salary and the rank (column salary_rank).",
   "SELECT name, salary,\n       DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank\nFROM employees\nWHERE department_id = 2;",
   ["Equal values sharing a number and no gaps after them is DENSE_RANK.", "Order the window by salary, highest first: ORDER BY salary DESC.", "Filter the department in WHERE."],
   "Rahul Das and Fatima Shaikh both earn 128000, so both get rank 5 and the next person gets 6. RANK would give them 5 and the next person 7; ROW_NUMBER would give them 5 and 6 in an order that is not meaningful.",
   "SQLite documentation: Window functions", dataset="employees")
ex("sqlp-top-two-per-department", "The two best paid in each department", "advanced",
   "Keep the top N rows per group by ranking in a CTE and filtering outside.",
   "Using the employees data, return the two highest-paid people of each department: department_id, name and salary. If two people tie, keep both. A department with one person shows just that person.",
   "WITH ranked AS (\n  SELECT department_id, name, salary,\n         RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk\n  FROM employees\n)\nSELECT department_id, name, salary\nFROM ranked\nWHERE rnk <= 2;",
   ["Rank people within each department: PARTITION BY department_id ORDER BY salary DESC.", "Ties should be kept, so use RANK (or DENSE_RANK), not ROW_NUMBER.", "Filter on the rank outside, in a query over a CTE."],
   "The ranking happens per department; the outer query keeps ranks 1 and 2. This 'top N per group' pattern is one of the most common SQL interview questions. With ROW_NUMBER, one of two tied people could silently disappear.",
   "SQLite documentation: Window functions", dataset="employees")
ex("sqlp-order-value-quartiles", "Quartiles of order value", "advanced",
   "Split ordered rows into equal groups with NTILE.",
   "For every non-cancelled order, return its id, its value (the sum of price times quantity, column order_value) and its quartile (column quartile) from NTILE(4), with the lowest values in quartile 1. Order the window by order_value and then id.",
   "WITH valued AS (\n  SELECT o.id, SUM(p.price * oi.quantity) AS order_value\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE o.status <> 'cancelled'\n  GROUP BY o.id\n)\nSELECT id, order_value,\n       NTILE(4) OVER (ORDER BY order_value, id) AS quartile\nFROM valued;",
   ["First compute each order's value in a CTE.", "NTILE(4) OVER (ORDER BY order_value, id) numbers the groups 1 to 4.", "Adding id to the window's ORDER BY makes ties land in a fixed group."],
   "NTILE spreads the 18 orders as evenly as it can: 5, 5, 4 and 4. Quartiles are a quick way to segment customers or orders, for example to target the top quarter.",
   "SQLite documentation: Window functions")

# L22 recursive CTEs
ex("sqlp-numbers-to-ten", "Generate numbers with recursion", "advanced",
   "Write the anchor and recursive parts of a WITH RECURSIVE query.",
   "Using a recursive CTE, return the whole numbers from 1 to 10 in one column called n.",
   "WITH RECURSIVE numbers(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM numbers WHERE n < 10\n)\nSELECT n FROM numbers;",
   ["The anchor is SELECT 1.", "The recursive step selects n + 1 from the CTE itself.", "WHERE n < 10 in the recursive step is what stops it."],
   "The anchor produces 1; each round adds one to the previous row until the WHERE condition fails at 10. Without the stopping condition the query would run until the lab stops it after 3 seconds.",
   "SQLite documentation: The WITH clause")
ex("sqlp-reports-to-ravi", "Everyone under a manager", "advanced",
   "Walk down a hierarchy with a recursive CTE and count the levels.",
   "Using the employees data, list everyone who reports to Ravi Menon (employee 2) directly or indirectly. Return their name and depth: 1 for people who report to him directly, 2 for their reports, and so on.",
   "WITH RECURSIVE team AS (\n  SELECT id, name, 1 AS depth\n  FROM employees\n  WHERE manager_id = 2\n  UNION ALL\n  SELECT e.id, e.name, team.depth + 1\n  FROM employees e\n  JOIN team ON e.manager_id = team.id\n)\nSELECT name, depth FROM team;",
   ["The anchor finds Ravi's direct reports: manager_id = 2, depth 1.", "The recursive step finds people whose manager is someone already in the CTE.", "Add 1 to depth in each step."],
   "Each round of the recursion finds the next layer down: first Neha and Aditya, then their four developers. The join e.manager_id = team.id walks downwards from managers to their staff.",
   "SQLite documentation: The WITH clause", dataset="employees")
ex("sqlp-chain-to-the-top", "The chain of managers above someone", "advanced",
   "Walk up a hierarchy from one employee to the top.",
   "Using the employees data, show the managers above Priya Nambiar (employee 13), from her direct manager up to the head of the company. Return each manager's name and the step (1 for her direct manager, 2 for that person's manager, and so on).",
   "WITH RECURSIVE up AS (\n  SELECT manager_id AS id, 1 AS step\n  FROM employees WHERE id = 13\n  UNION ALL\n  SELECT e.manager_id, up.step + 1\n  FROM employees e\n  JOIN up ON e.id = up.id\n  WHERE e.manager_id IS NOT NULL\n)\nSELECT e.name, up.step\nFROM up\nJOIN employees e ON e.id = up.id;",
   ["Start from Priya's manager_id, with step 1.", "In each step, look up the current person's manager: join employees on e.id = up.id and take e.manager_id.", "Stop when manager_id is NULL, then join back to employees for the names."],
   "The recursion climbs one level per round (Lakshmi Pillai, then Sana Qureshi, then Meera Joshi) and stops at the top, whose manager_id is NULL. Compare with the previous exercise: there the join walked down, here it walks up.",
   "SQLite documentation: The WITH clause", dataset="employees")
ex("sqlp-days-without-orders", "Days with no orders", "advanced",
   "Generate a calendar with recursion and compare it with real data.",
   "Generate every day from 2024-03-01 to 2024-03-31 with a recursive CTE and return only the days on which no order was placed, in one column called day.",
   "WITH RECURSIVE days(day) AS (\n  SELECT '2024-03-01'\n  UNION ALL\n  SELECT date(day, '+1 day') FROM days WHERE day < '2024-03-31'\n)\nSELECT day FROM days\nWHERE day NOT IN (SELECT order_date FROM orders);",
   ["Start the CTE at '2024-03-01' and add one day with date(day, '+1 day').", "Stop when day reaches '2024-03-31'.", "Keep the days that are NOT IN the list of order dates."],
   "A generated calendar is the usual way to find gaps, because a GROUP BY over the orders can only show days that have orders. The same idea finds missing invoice numbers or hours without readings.",
   "SQLite documentation: The WITH clause")

# L23 query plans
ex("sqlp-plan-index-on-status", "Make a lookup use an index", "advanced",
   "Create an index that turns a full table scan into an index search.",
   "Orders are often looked up by status. Write the statement that creates an index so that the query SELECT id FROM orders WHERE status = 'pending' is answered by searching an index instead of scanning the whole table. The lab then runs EXPLAIN QUERY PLAN on that query.",
   "CREATE INDEX idx_orders_status ON orders(status);",
   ["The query filters on status, so the index needs that column.", "The syntax is CREATE INDEX name ON table(column);", "Any index name works, for example idx_orders_status."],
   "With the index, the plan changes from SCAN orders to SEARCH orders USING ... INDEX idx_orders_status (status=?). Because the index also stores the row id, SQLite can answer this query from the index alone, so the plan may say COVERING INDEX.",
   "SQLite documentation: EXPLAIN QUERY PLAN", kind="modify",
   verify="EXPLAIN QUERY PLAN SELECT id FROM orders WHERE status = 'pending'",
   plan={"must": r"SEARCH orders USING (COVERING )?INDEX", "mustNot": r"SCAN orders"})
ex("sqlp-plan-covering-index", "A covering index", "advanced",
   "Design an index that holds every column a query needs.",
   "Create an index so that SELECT customer_id, order_date FROM orders WHERE customer_id = 5 can be answered from the index alone, without reading the table (the plan should say COVERING INDEX).",
   "CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);",
   ["The query filters on customer_id and also returns order_date.", "An index on several columns lists them in brackets: (first, second).", "Put the filtered column first."],
   "An index on (customer_id, order_date) lets SQLite find customer 5's entries and read order_date from the same index entries, so the table is never touched. An index on customer_id alone would find the rows but then need the table for order_date.",
   "SQLite documentation: Query planning", kind="modify",
   verify="EXPLAIN QUERY PLAN SELECT customer_id, order_date FROM orders WHERE customer_id = 5",
   plan={"must": r"USING COVERING INDEX", "mustNot": r"SCAN orders"})

# L24 query tuning
ex("sqlp-tune-march-orders", "Rewrite a filter so the index can help", "advanced",
   "Write a sargable condition: leave the indexed column on its own.",
   "An index on orders(order_date) already exists. Return the ids of the orders placed in March 2024, written so that the index can be used. The lab checks both your result and your query's plan.",
   "SELECT id FROM orders\nWHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';",
   ["strftime('%Y-%m', order_date) = '2024-03' gives the right rows but hides the column inside a function.", "Compare order_date itself with the first day of March and the first day of April.", "Use >= for the start and < for the end."],
   "Written as a range on the bare column, the condition can be matched against the index, and the plan says SEARCH orders USING ... INDEX idx_orders_date. The strftime version returns the same rows but forces a SCAN, which on millions of orders is the difference between milliseconds and seconds.",
   "SQLite documentation: Query planning", extra_setup=["CREATE INDEX idx_orders_date ON orders(order_date);"],
   plan={"must": r"SEARCH orders USING (COVERING )?INDEX idx_orders_date", "mustNot": r"SCAN orders"})
ex("sqlp-tune-join-index", "Index the join column", "advanced",
   "Find the column a join needs and index it.",
   "This query is used on every customer page: SELECT o.id, oi.product_id FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = 2. Create the index that lets SQLite reach each order's items through an index instead of scanning order_items. The lab runs EXPLAIN QUERY PLAN on the query.",
   "CREATE INDEX idx_order_items_order ON order_items(order_id);",
   ["Look at the ON condition: which column of order_items is matched?", "order_items has no index on order_id yet.", "CREATE INDEX name ON order_items(order_id);"],
   "Joins look up rows of one table for each row of the other. With an index on order_items(order_id), each order's items are found by a search instead of reading the whole order_items table again for every order. Indexing foreign-key columns used in joins is the most common tuning step.",
   "SQLite documentation: Query planning", kind="modify",
   verify="EXPLAIN QUERY PLAN SELECT o.id, oi.product_id FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.customer_id = 2",
   plan={"must": r"SEARCH oi USING (COVERING )?INDEX", "mustNot": r"SCAN oi"})

# ---------------------------------------------------------------- lessons (same shape as the lab's lessons, plus the path's teaching sections)

LESSONS = [
    dict(
        id="dates-and-text", title="Working with dates and text", level="intermediate",
        intro="Dates and text often arrive as plain text, and much everyday SQL is about pulling the useful part out of them: the month of an order, the number of days between two dates, a tidy version of a code. SQLite stores these dates as text in the YYYY-MM-DD format and has functions to read and calculate with them.",
        points=[
            "There is no separate date type in this database: order_date holds text such as '2024-03-15'. Because the order is year, month, day, sorting and comparing the text gives the right date order.",
            "strftime('%Y-%m', order_date) returns the year and month, and strftime('%w', order_date) the weekday from 0 (Sunday) to 6. date(order_date, '+7 days') moves a date.",
            "julianday(later) - julianday(earlier) is the number of days between two dates, as a number you can round or CAST to an integer.",
            "For text, UPPER and LOWER change case, TRIM removes spaces at the ends, SUBSTR(text, start, length) cuts out a part (positions start at 1), REPLACE swaps text and INSTR finds where a piece starts. || joins text.",
            "Other databases name these differently: PostgreSQL has date_trunc and EXTRACT, MySQL has DATE_FORMAT and DATEDIFF, SQL Server has FORMAT and DATEDIFF. The ideas are the same; check your database's documentation.",
        ],
        examples=[
            dict(sql="SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders\nFROM orders\nGROUP BY month\nORDER BY month;", says="Counts the orders in each month by cutting the month out of each date."),
            dict(sql="SELECT id, order_date,\n       CAST(julianday('2024-06-30') - julianday(order_date) AS INTEGER) AS days_before\nFROM orders\nORDER BY order_date DESC, id\nLIMIT 5;", says="How many days before 30 June 2024 each of the five latest orders was placed. A fixed date keeps the answer the same every day; a live report would use date('now')."),
            dict(sql="SELECT name, UPPER(SUBSTR(name, 1, 3)) || '-' || id AS customer_code\nFROM customers\nLIMIT 4;", says="Builds a short customer code from the first three letters of the name and the id."),
        ],
        mistakes=[
            "Storing dates as '15/03/2024': text in day/month/year order does not sort or compare as dates. Keep YYYY-MM-DD.",
            "Using date('now') in a report that must be reproducible: the answer changes every day. Use a fixed date or a parameter.",
            "Subtracting text dates directly (order_date - joined): SQLite turns the text into a number and the result is meaningless. Use julianday.",
            "Forgetting that SUBSTR counts from 1, not 0.",
        ],
        practise=["sqlp-weekday-orders", "sqlp-days-since-joining", "sqlp-first-quarter-orders", "sqlp-product-codes"],
        objectives=["Extract the month, year or weekday from a date", "Calculate the number of days between two dates", "Clean and combine text with SUBSTR, UPPER, TRIM, REPLACE and ||"],
        why="Reports are almost always about time: sales per month, tickets older than seven days, customers who joined this year. Testers check date logic all the time, because date boundaries (month ends, leap years, time zones) are where software breaks most often.",
        analogy="A date stored as YYYY-MM-DD is like a filing cabinet labelled year, then month, then day: alphabetical order and date order are the same, so finding a range is easy. Text functions are the scissors and glue for labels.",
        check=[{"q": "Why can dates stored as 'YYYY-MM-DD' text be compared with < and >?", "a": "Because the most significant part comes first, text order and date order are the same."},
               {"q": "How do you get the number of days between two dates in SQLite?", "a": "Subtract their julianday values: julianday(later) - julianday(earlier)."}],
        summary="SQLite keeps dates as YYYY-MM-DD text. strftime extracts parts, date() moves dates, julianday() measures gaps, and SUBSTR, UPPER, TRIM, REPLACE and || shape text. Other databases offer the same ideas under different names.",
    ),
    dict(
        id="running-totals", title="Running totals and moving averages", level="advanced", dataset="bank",
        intro="A running total adds each row to everything before it: a bank balance after every transaction, revenue to date, stock on hand. A window function computes it in one query, and a frame clause decides exactly which earlier rows are included. These examples use a small bank database.",
        points=[
            "SUM(amount) OVER (ORDER BY tx_date, id) adds up the rows from the first one to the current one, in that order. Adding id settles ties, so two transactions on the same day keep a fixed order.",
            "PARTITION BY account_id restarts the total for each account, so every account gets its own balance.",
            "A frame names the rows explicitly: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW covers the current row and the two before it, which with AVG gives a three-row moving average.",
            "With ORDER BY and no frame, the default frame runs from the first row to the current one but also includes rows that tie with it. Writing ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the intention explicit.",
            "Window functions run after WHERE and GROUP BY, so a total can be run over an aggregated result, such as revenue per month, in the same query.",
        ],
        examples=[
            dict(sql="SELECT id, tx_date, amount,\n       SUM(amount) OVER (ORDER BY tx_date, id) AS balance\nFROM transactions\nWHERE account_id = 1\nORDER BY tx_date, id;", says="The balance of account 1 after every transaction.", dataset="bank"),
            dict(sql="SELECT account_id, tx_date, amount,\n       SUM(amount) OVER (PARTITION BY account_id ORDER BY tx_date, id\n                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance\nFROM transactions\nWHERE account_id IN (2, 4)\nORDER BY account_id, tx_date, id;", says="Two accounts at once: PARTITION BY gives each account its own balance. Both are current accounts allowed to go below zero up to their overdraft limit.", dataset="bank"),
            dict(sql=MONTHLY + "\nSELECT month, revenue,\n       ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS moving_avg_3\nFROM monthly\nORDER BY month;", says="Monthly shop revenue with a three-month moving average, which smooths out a single unusually good or bad month."),
        ],
        mistakes=[
            "Ordering the window only by date when two rows share a date: their running totals are then not reproducible. Add a unique column such as id.",
            "Forgetting PARTITION BY: every account's transactions go into one total.",
            "Filtering on the window result in WHERE (WHERE balance < 0): it does not exist yet when WHERE runs. Compute it in a CTE and filter outside.",
            "Expecting a full three-row average on the first rows: the first row averages one value and the second two. Decide whether to show or drop them.",
        ],
        practise=["sqlp-balance-account-3", "sqlp-overdrawn-moments", "sqlp-revenue-to-date"],
        objectives=["Compute running totals with SUM() OVER (ORDER BY ...)", "Restart a total per group with PARTITION BY", "Use a frame for a moving average"],
        why="Running balances, revenue to date and moving averages appear in finance, sales and monitoring reports every day. Testers use running totals to reconcile a statement against its transactions, which is how many real billing bugs are found.",
        analogy="A running total is a passbook: each line shows the transaction and the balance after it. PARTITION BY gives each account its own passbook; a moving average is looking only at the last three lines.",
        check=[{"q": "What does PARTITION BY account_id do in a running total?", "a": "It restarts the total for each account, so each account has its own running balance."},
               {"q": "Why add id to ORDER BY tx_date in the window?", "a": "So rows with the same date have a fixed order; otherwise their running totals are not reproducible."}],
        summary="SUM() OVER (ORDER BY ...) gives running totals, PARTITION BY restarts them per group, and frames such as ROWS BETWEEN 2 PRECEDING AND CURRENT ROW give moving averages. Filter window results in an outer query.",
    ),
    dict(
        id="lag-lead-ranking", title="Comparing rows: LAG, LEAD and ranking", level="advanced", dataset="employees",
        intro="Many questions compare a row with a neighbour or with its group: this month against last month, an order against the customer's previous one, a salary against the rest of the team. LAG and LEAD read a value from an earlier or later row, and the ranking functions place each row within its group.",
        points=[
            "LAG(value) OVER (ORDER BY month) returns the value from the previous row and LEAD from the next one. The first row has no previous row, so LAG gives NULL there unless a default is given: LAG(value, 1, 0).",
            "With PARTITION BY customer_id, LAG looks only at the same customer's earlier rows.",
            "ROW_NUMBER numbers rows 1, 2, 3 even when values tie. RANK gives tied rows the same number and then skips (1, 1, 3). DENSE_RANK gives ties the same number without gaps (1, 1, 2).",
            "NTILE(4) splits the ordered rows into four groups as equal in size as possible, which gives quartiles.",
            "To keep only the top rows per group, compute the rank in a CTE and filter on it outside, because a window function cannot be used in WHERE.",
        ],
        examples=[
            dict(sql=MONTHLY + "\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS previous_month,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly\nORDER BY month;", says="Month-over-month change in shop revenue. The first month has nothing to compare with, so its previous value and change are NULL."),
            dict(sql="SELECT name, salary,\n       ROW_NUMBER() OVER (ORDER BY salary DESC, name) AS row_number,\n       RANK() OVER (ORDER BY salary DESC) AS rank,\n       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank\nFROM employees\nWHERE department_id = 2\nORDER BY salary DESC, name;", says="The three ranking functions side by side for the Engineering department. Rahul and Fatima earn the same: compare how each function numbers them and the person after them.", dataset="employees"),
        ],
        mistakes=[
            "Treating LAG on the first row as zero: it is NULL, and arithmetic with NULL gives NULL. Use the default argument or COALESCE.",
            "Using ROW_NUMBER for 'the top 3' when values tie: one tied row can be dropped arbitrarily. Use RANK or DENSE_RANK when ties should stay.",
            "Leaving out ORDER BY inside OVER: 'previous row' then has no defined meaning.",
        ],
        practise=["sqlp-previous-order-date", "sqlp-dense-rank-salaries", "sqlp-top-two-per-department", "sqlp-order-value-quartiles"],
        objectives=["Compare a row with the previous or next one using LAG and LEAD", "Choose between ROW_NUMBER, RANK and DENSE_RANK when values tie", "Find the top N rows per group and split rows into quartiles with NTILE"],
        why="Growth against last month, days since a customer's previous order and the top sellers per region are standard business questions, and 'top N per group' is among the most frequent SQL interview tasks.",
        analogy="LAG is glancing at the line above in a ledger. Ranking is a race result: RANK leaves a gap after a shared second place, DENSE_RANK does not, and ROW_NUMBER hands out places even to runners who finished together.",
        check=[{"q": "Salaries 300, 200, 200, 100: what do RANK and DENSE_RANK give the last person?", "a": "RANK gives 4 (1, 2, 2, 4); DENSE_RANK gives 3 (1, 2, 2, 3)."},
               {"q": "Why compute a rank in a CTE before filtering rnk <= 2?", "a": "Window functions are calculated after WHERE, so they can only be filtered in an outer query."}],
        summary="LAG and LEAD read neighbouring rows, PARTITION BY keeps the comparison within a group, and ROW_NUMBER, RANK, DENSE_RANK and NTILE place rows within their group. Filter on a rank in an outer query.",
    ),
    dict(
        id="recursive-ctes", title="Recursive CTEs", level="advanced", dataset="employees",
        intro="Some data refers to itself: an employee's manager is another employee, a folder sits inside a parent folder. A recursive common table expression walks such a chain one step at a time, and it can also generate rows, such as every day of a month. These examples use a small company with four levels of management.",
        points=[
            "WITH RECURSIVE name AS (anchor UNION ALL recursive step) has two parts. The anchor query gives the starting rows; the recursive step joins the CTE to a table to find the next rows, and it repeats until a step finds nothing new.",
            "A counter (level + 1 in the recursive step) tells how deep each row is, for example how many managers sit above an employee.",
            "Recursion also generates sequences: start from 1 or a date, add one in each step, and stop with a WHERE condition.",
            "Every recursive query needs a stopping condition. Without one it runs until the database stops it; here any statement is stopped after 3 seconds.",
            "The direction of the join decides the direction of travel: e.manager_id = chain.id walks down to staff, e.id = chain.manager_id walks up to the top.",
        ],
        examples=[
            dict(sql="WITH RECURSIVE n(x) AS (\n  SELECT 1\n  UNION ALL\n  SELECT x + 1 FROM n WHERE x < 5\n)\nSELECT x FROM n;", says="The smallest recursive query: start at 1 and add one until 5."),
            dict(sql="WITH RECURSIVE chain AS (\n  SELECT id, name, manager_id, 0 AS level\n  FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, chain.level + 1\n  FROM employees e\n  JOIN chain ON e.manager_id = chain.id\n)\nSELECT name, level FROM chain\nORDER BY level, name;", says="The whole company from the top down, with each person's level below the head of the company.", dataset="employees"),
            dict(sql="WITH RECURSIVE d(day) AS (\n  SELECT '2024-03-01'\n  UNION ALL\n  SELECT date(day, '+1 day') FROM d WHERE day < '2024-03-07'\n)\nSELECT day FROM d;", says="A generated calendar of the first week of March 2024."),
        ],
        mistakes=[
            "Leaving out the stopping WHERE in a generator: the query never ends.",
            "Joining in the wrong direction and walking up when you meant to walk down (or the reverse).",
            "Using recursion where one self-join is enough: for a single level of manager, a self-join is simpler.",
        ],
        practise=["sqlp-numbers-to-ten", "sqlp-reports-to-ravi", "sqlp-chain-to-the-top", "sqlp-days-without-orders"],
        objectives=["Write the anchor and recursive parts of WITH RECURSIVE", "Walk a hierarchy down or up and count the levels", "Generate a sequence of numbers or dates and use it to find gaps"],
        why="Organisation charts, product categories, bills of materials, folder trees and threaded comments are all hierarchies. Generated calendars find missing days in data, a common task in reporting and in testing data feeds.",
        analogy="A recursive CTE is asking 'who reports to you?' and then asking each person who answered the same question, until nobody has anyone left to name.",
        check=[{"q": "What are the two parts of a recursive CTE?", "a": "The anchor (the starting rows) and the recursive step (which finds the next rows from the previous ones), joined with UNION ALL."},
               {"q": "What stops a recursive number generator?", "a": "A condition in the recursive step's WHERE, such as WHERE n < 10."}],
        summary="WITH RECURSIVE starts from an anchor and repeats a step until it finds nothing new. Use it to walk hierarchies in either direction and to generate sequences, and always give it a stopping condition.",
    ),
    dict(
        id="query-plans", title="Reading a query plan", level="advanced",
        intro="Before running a query, the database decides how to run it: which table to read first, and whether to read every row or jump straight to the matching ones through an index. That decision is the query plan. Reading it tells you why a query is slow and whether an index would help.",
        points=[
            "In SQLite, EXPLAIN QUERY PLAN in front of a query shows its plan instead of its result. Each row's detail column describes one step.",
            "SCAN orders means every row of orders is read. SEARCH orders USING INDEX ... means only the matching rows are reached through an index, which is much faster on a large table.",
            "USING COVERING INDEX means the index alone holds every column the query needs, so the table is not read at all.",
            "USE TEMP B-TREE FOR ORDER BY means the rows are sorted after they are found; an index in the right order can remove that step.",
            "PostgreSQL shows plans with EXPLAIN (EXPLAIN ANALYZE also runs and times the query), MySQL with EXPLAIN. The words differ, such as Seq Scan and Index Scan, but the ideas are the same. These tables are tiny, so here the plans teach habits rather than save time.",
        ],
        examples=[
            dict(sql="EXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 3;", says="Without an index on customer_id, the plan has to SCAN the whole orders table."),
            dict(sql="CREATE INDEX idx_orders_customer ON orders(customer_id);\nEXPLAIN QUERY PLAN\nSELECT * FROM orders WHERE customer_id = 3;", says="After creating an index, the same query becomes a SEARCH through the index. Only the result of the last statement is shown."),
            dict(sql="EXPLAIN QUERY PLAN\nSELECT o.id, c.name\nFROM orders o JOIN customers c ON c.id = o.customer_id;", says="A join: SQLite reads every order and finds each customer by its primary key, which is already an index."),
        ],
        mistakes=[
            "Reading EXPLAIN QUERY PLAN's output as the query's result: it describes how the query would run, not what it returns.",
            "Concluding that an index is useless because a tiny table is scanned anyway: on a few rows a scan is cheaper, and the plan reflects that.",
            "Comparing plan text between databases word for word: each database has its own wording.",
        ],
        practise=["sqlp-plan-index-on-status", "sqlp-plan-covering-index"],
        objectives=["Read SQLite's EXPLAIN QUERY PLAN output", "Tell a table scan from an index search and recognise a covering index", "Create an index that changes a query's plan"],
        why="When an application slows down as its data grows, the query plan is the first thing engineers look at. Being able to read one turns 'the database is slow' into a specific, fixable cause.",
        analogy="A plan is the route a delivery driver chooses. A SCAN is knocking on every door in the street; a SEARCH with an index is going straight to the house number in the address book.",
        check=[{"q": "What does SCAN orders mean in a plan?", "a": "Every row of the orders table is read."},
               {"q": "What does COVERING INDEX mean?", "a": "The index contains every column the query needs, so the table itself is not read."}],
        summary="EXPLAIN QUERY PLAN shows how SQLite will run a query. SCAN reads every row, SEARCH uses an index, and a covering index answers the query without touching the table. Other databases have their own EXPLAIN with different wording.",
    ),
    dict(
        id="query-tuning", title="Writing faster queries", level="advanced",
        intro="A correct query can still be slow on a large table. Most speed problems come from a handful of habits: conditions the database cannot match against an index, reading columns nobody needs, and missing indexes on the columns used to join and filter. The method is always the same: read the plan, change one thing, and read the plan again.",
        points=[
            "A condition is index-friendly (sargable) when the column stands alone on one side: order_date >= '2024-03-01' can use an index on order_date, while strftime('%Y-%m', order_date) = '2024-03' cannot, because the function must be calculated for every row.",
            "Index the columns you join on and filter by. Foreign-key columns such as order_items.order_id are the usual candidates.",
            "Select only the columns you need. Less data moves, and a covering index becomes possible.",
            "EXISTS stops at the first matching row, which suits 'is there any…' questions. Modern planners often treat IN and EXISTS alike, so check the plan instead of following a rule of thumb.",
            "Every index makes inserts and updates a little slower and uses space, so add indexes for real, frequent queries, not for every column.",
        ],
        examples=[
            dict(sql="CREATE INDEX idx_orders_date ON orders(order_date);\nEXPLAIN QUERY PLAN\nSELECT id FROM orders WHERE strftime('%Y-%m', order_date) = '2024-03';", says="The function around order_date hides the column from the index's order, so the plan is a SCAN: every entry is checked. SQLite reads the smaller index instead of the table (SCAN ... USING COVERING INDEX), but it still visits all of it rather than jumping to March."),
            dict(sql="CREATE INDEX idx_orders_date ON orders(order_date);\nEXPLAIN QUERY PLAN\nSELECT id FROM orders WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';", says="The same rows written as a range on the bare column: now the plan SEARCHes the index."),
        ],
        mistakes=[
            "Wrapping an indexed column in a function or calculation in WHERE.",
            "Adding an index and not checking the plan: the planner may still choose a scan, for example on a tiny table or when most rows match.",
            "Tuning before the query is correct: first get the right rows, then make it fast, and confirm the result did not change.",
        ],
        practise=["sqlp-tune-march-orders", "sqlp-tune-join-index"],
        objectives=["Rewrite a condition so an index can be used", "Index the columns a join depends on", "Weigh the cost of an index against its benefit"],
        why="Slow queries are among the most common production problems. A tester who can say 'this report scans the whole table because of a function in WHERE' gives developers a fix, not just a complaint.",
        analogy="An index on order_date is a book's index sorted by date. Asking for 'pages whose month is March' makes you read every page; asking for 'pages dated from 1 March to before 1 April' lets you use the index directly.",
        check=[{"q": "Why can't an index on order_date help WHERE strftime('%Y-%m', order_date) = '2024-03'?", "a": "The function has to be calculated for every row before comparing, so the index order cannot be used."},
               {"q": "Why not index every column?", "a": "Each index takes space and slows inserts, updates and deletes, so too many indexes hurt."}],
        summary="Keep indexed columns bare in conditions, index join and filter columns, select only what you need, and confirm every change with the plan and with an unchanged result.",
    ),
]

# ---------------------------------------------------------------- run everything with Python's sqlite3

MAX_ROWS = 10


def connect(dataset=None, extra=()):
    con = sqlite3.connect(":memory:")
    for s in SHOP + DATASETS.get(dataset, []) + list(extra):
        con.executescript(s)
    return con


def run_script(con, sql):
    """Run every statement; return (columns, rows) of the last statement that returned columns."""
    statements = [s for s in sqlite3_split(sql)]
    cols, rows = [], []
    for s in statements:
        cur = con.execute(s)
        if cur.description:
            cols = [d[0] for d in cur.description]
            rows = [list(r) for r in cur.fetchall()]
    return cols, rows


def sqlite3_split(sql):
    out, buf = [], ""
    for part in sql.split(";"):
        buf += part
        if sqlite3.complete_statement(buf + ";"):
            if buf.strip():
                out.append(buf.strip() + ";")
            buf = ""
        else:
            buf += ";"
    if buf.strip():
        out.append(buf.strip())
    return out


def plan_text(rows):
    return " | ".join(str(r[3]) for r in rows)


exercises_out = []
for e in EX:
    setup = DATASETS.get(e["dataset"], []) + e["extra_setup"]
    con = connect(e["dataset"], e["extra_setup"])
    cols, rows = run_script(con, e["solution"])
    if e["kind"] == "modify":
        cur = con.execute(e["verify"])
        cols = [d[0] for d in cur.description]
        rows = [list(r) for r in cur.fetchall()]
    if e["plan"]:
        if e["kind"] == "modify":
            text = plan_text(rows)
        else:
            text = plan_text(con.execute("EXPLAIN QUERY PLAN " + e["solution"].rstrip().rstrip(";")).fetchall())
        assert re.search(e["plan"]["must"], text), (e["id"], text)
        assert not re.search(e["plan"]["mustNot"], text), (e["id"], text)
        e["plan"]["seen"] = text
    assert rows or e["kind"] == "modify", e["id"]
    out = {k: e[k] for k in ("id", "title", "difficulty", "objective", "instructions", "solution", "hints", "explanation", "source", "ordered", "kind")}
    out["topic"] = "sql-path"
    out["setup"] = setup
    out["verify"] = e["verify"]
    out["expected"] = {"columns": len(cols), "rows": rows} if not (e["kind"] == "modify" and e["plan"]) else {"columns": len(cols), "rows": []}
    if e["plan"]:
        out["plan"] = {"must": e["plan"]["must"], "mustNot": e["plan"]["mustNot"]}
    if e["dataset"]:
        out["dataset"] = e["dataset"]
    exercises_out.append(out)

ex_ids = {e["id"] for e in exercises_out}
lessons_out = []
for lesson in LESSONS:
    for pid in lesson["practise"]:
        assert pid in ex_ids, pid
    examples = []
    for ex_ in lesson["examples"]:
        con = connect(ex_.get("dataset"))
        cols, rows = run_script(con, ex_["sql"])
        examples.append({"sql": ex_["sql"], "says": ex_["says"], "columns": cols, "rows": rows[:MAX_ROWS], "total": len(rows), **({"dataset": ex_["dataset"]} if ex_.get("dataset") else {})})
    lessons_out.append({**{k: v for k, v in lesson.items() if k != "examples"}, "examples": examples})

used = {p for l in LESSONS for p in l["practise"]}
assert used == ex_ids, ex_ids - used

HEADER = """/* =========================================================
   ToolZen Hub
   SQL learning path: {what}

   GENERATED by scripts/practice-labs/build_sql_additions.py. Do not edit by hand: edit the script and run it again.
   Every result here was produced by Python's sqlite3 (SQLite {ver}), a separate build from the sql.js used in the browser.
========================================================= */

"""
OUT_DIR.mkdir(parents=True, exist_ok=True)
data_set = {
    "id": "sql-path-additions", "version": "1.0.0", "title": "SQL learning path: advanced practice",
    "description": "Exercises for the SQL learning path's lessons on dates, running totals, ranking, recursive queries and query plans, on the shop, company and bank databases.",
    "reviewed": {"date": "2026-11-08", "method": f"Written by the author. Expected results and plans produced by Python sqlite3 (SQLite {sqlite3.sqlite_version}); the browser engine must match them."},
    "exercises": exercises_out,
}
(OUT_DIR / "additions-data.js").write_text(
    HEADER.format(what="datasets and checked exercises (loaded by the browser)", ver=sqlite3.sqlite_version)
    + "export const DATASETS = " + json.dumps(DATASETS, indent=1, ensure_ascii=False) + ";\n\n"
    + "export const DATASET_NOTES = " + json.dumps(DATASET_NOTES, indent=1, ensure_ascii=False) + ";\n\n"
    + "export const set = " + json.dumps(data_set, indent=1, ensure_ascii=False) + ";\n", encoding="utf8")
(OUT_DIR / "additions-lessons.js").write_text(
    HEADER.format(what="new lessons with their example results (build-time only)", ver=sqlite3.sqlite_version)
    + "export const lessons = " + json.dumps(lessons_out, indent=1, ensure_ascii=False) + ";\n", encoding="utf8")
print(f"{len(exercises_out)} exercises, {len(lessons_out)} lessons, SQLite {sqlite3.sqlite_version}")
for e in exercises_out:
    print(e["id"], e["expected"]["columns"], len(e["expected"]["rows"]), "rows", ("plan ok" if e.get("plan") else ""))
