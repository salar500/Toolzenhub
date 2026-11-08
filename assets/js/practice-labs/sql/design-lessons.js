/* =========================================================
   ToolZen Hub
   Database Design and Testing path: lessons (original to this site; SQLite behaviour as documented at sqlite.org,
   PostgreSQL and MySQL differences as in their manuals). Playgrounds run real SQLite (sql.js) on the ShopLite practice
   tables; every playground's SQL is executed by tests/unit/db-design.test.mjs with Python's sqlite3.
========================================================= */

export const lessons = [
    { id: "dd-modelling", title: "Data modelling: entities, attributes and relationships", level: "beginner", prerequisite: "SQL beginner level (SELECT, WHERE, joins) helps.",
        objectives: ["Identify entities and attributes from requirements", "Tell one-to-many from many-to-many", "Draw a simple entity-relationship model"],
        intro: "Design starts from the business: the things it tracks (entities: customer, product, order) and the facts about them (attributes: name, price, date). Relationships connect entities: one customer places many orders (one-to-many, a foreign key in orders), and an order contains many products while a product appears in many orders (many-to-many, resolved by a junction table such as order_items).",
        blocks: [
            { type: "example", title: "ShopLite's model", text: "customers (id PK, name, city, joined)\n   1 ──< many  orders (id PK, customer_id FK → customers, order_date, status)\n                  1 ──< many  order_items (order_id FK → orders, product_id FK → products, quantity)\n                                         many >── 1  products (id PK, name, category, price)" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A product can have many reviews; each review is about one product. Where does the foreign key go?", options: ["In reviews (reviews.product_id)", "In products"], answer: 0, explain: "The 'many' side holds the foreign key." },
                { q: "Students take many courses and courses have many students. How is this stored?", options: ["A junction table enrolments (student_id, course_id)", "A list of course names in one column"], answer: 0, explain: "Many-to-many needs a table of its own." },
                { q: "Where should a customer's city be stored?", options: ["Once, in customers", "Copied into every order"], answer: 0, explain: "Store each fact once; join when needed." }
            ] }
        ],
        why: "A good model makes queries simple and data trustworthy; a poor one causes duplicated, contradictory data for years.",
        analogy: "Entities are the nouns of the business, relationships the verbs that connect them.",
        mistakes: ["Lists stored in one text column.", "Copying the same fact into many tables.", "Designing tables from screens instead of from the business."],
        check: [{ q: "What resolves a many-to-many relationship?", a: "A junction table with a foreign key to each side." }, { q: "Which side of one-to-many has the foreign key?", a: "The many side." }],
        summary: "Model entities, attributes and relationships; foreign keys sit on the many side and junction tables resolve many-to-many." },
    { id: "dd-keys", title: "Primary keys, foreign keys and referential integrity", level: "beginner",
        objectives: ["Choose primary keys", "Enforce relationships with foreign keys", "See a foreign-key violation happen"],
        intro: "A primary key identifies each row uniquely and never changes; surrogate keys (an integer id) are the usual choice. A foreign key says a value must exist in another table, which keeps orders from pointing at customers who do not exist. SQLite only enforces foreign keys after PRAGMA foreign_keys = ON; PostgreSQL and MySQL (InnoDB) enforce them always.",
        blocks: [
            { type: "sqlplay", heading: "Try it: break a foreign key", text: "This creates a reviews table that must refer to a real product, inserts a valid review, then one for product 999, which does not exist. Run it, read the error, then change 999 to 2 and run again.", sql: "PRAGMA foreign_keys = ON;\nCREATE TABLE reviews (\n  id INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL REFERENCES products(id),\n  stars INTEGER NOT NULL\n);\nINSERT INTO reviews (product_id, stars) VALUES (1, 5);\nINSERT INTO reviews (product_id, stars) VALUES (999, 4);\nSELECT * FROM reviews;", expect: "error" },
            { type: "quiz", questions: [
                { q: "Why not use the customer's email as the primary key?", options: ["Emails change and are personal data; ids should be stable", "Emails are too short"], answer: 0, explain: "A key that changes must be updated everywhere it is referenced." },
                { q: "What should happen when a customer with orders is deleted?", options: ["It depends on the rule chosen: RESTRICT (refuse), CASCADE or SET NULL", "Always delete everything silently"], answer: 0, explain: "ON DELETE rules make the behaviour explicit." }
            ] }
        ],
        why: "Referential integrity stops orphaned rows, one of the most common data-quality defects.",
        analogy: "A foreign key is a library checkout slip that must name a real member.",
        mistakes: ["Forgetting the SQLite pragma in tests.", "Natural keys that change.", "No ON DELETE rule decided."],
        check: [{ q: "What does a foreign key enforce?", a: "That the referenced row exists." }, { q: "What does SQLite need for foreign keys to work?", a: "PRAGMA foreign_keys = ON for the connection." }],
        summary: "Use stable surrogate primary keys, declare foreign keys with deliberate delete rules, and remember SQLite's pragma." },
    { id: "dd-normalisation", title: "Normalisation: 1NF, 2NF and 3NF", level: "beginner",
        objectives: ["Spot repeating groups and duplicated facts", "Normalise a table to 3NF", "Know when to denormalise"],
        intro: "Normalisation removes duplication so each fact is stored once. First normal form: one value per cell, no repeating groups. Second: every non-key column depends on the whole key (no partial dependency on part of a composite key). Third: non-key columns depend only on the key, not on other non-key columns. Denormalising later, on purpose, can speed up reporting.",
        blocks: [
            { type: "example", title: "Before: one wide table", text: "order_id | customer_name | customer_city | products                | totals\n1001     | Asha          | Pune          | Lamp, Mug               | 1299, 349\n1002     | Asha          | Pune          | Bottle                  | 499\n\nProblems: lists in cells (not 1NF), Asha's city repeated (update anomalies)." },
            { type: "sqlplay", heading: "Try it: the normalised version answers the same question", text: "In the normalised ShopLite tables, each order stores only customer_id and the city lives once in customers. A join puts the picture back together.", sql: "SELECT o.id AS order_id, c.name, c.city, o.status\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id\nLIMIT 5;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "order_items(order_id, product_id, quantity, product_name): which normal form does product_name break?", options: ["2NF: it depends only on product_id, part of the key", "1NF"], answer: 0, explain: "Move it to products." },
                { q: "orders(id, customer_id, customer_city): what breaks 3NF?", options: ["customer_city depends on customer_id, not on the order", "Nothing"], answer: 0, explain: "A transitive dependency." }
            ] }
        ],
        why: "Normalised data cannot contradict itself, which makes it the default for transactional systems.",
        analogy: "Normalisation is keeping one master address book instead of writing addresses on every letter.",
        mistakes: ["Lists in one column.", "Copying names and prices into child tables.", "Denormalising before measuring."],
        check: [{ q: "What does 1NF require?", a: "One value per cell and no repeating groups." }, { q: "When is denormalisation reasonable?", a: "Deliberately, for read-heavy reporting, with a way to keep copies in sync." }],
        summary: "Normalise to 3NF so each fact lives once, join to recombine, and denormalise only on purpose." },
    { id: "dd-constraints", title: "Constraints: NOT NULL, UNIQUE, CHECK and DEFAULT", level: "intermediate",
        objectives: ["Encode business rules as constraints", "See CHECK and UNIQUE violations", "Decide what belongs in the database"],
        intro: "Constraints make the database refuse bad data whatever the application does: NOT NULL for required values, UNIQUE for values that must not repeat (an email, a coupon code), CHECK for rules on a row (a percentage between 1 and 50) and DEFAULT for values set when none is given. Rules enforced in the database apply to every application, script and manual fix.",
        blocks: [
            { type: "sqlplay", heading: "Try it: a CHECK constraint refuses bad data", text: "Coupons must give 1 to 50 percent. The second insert breaks the rule. Run it, then try a duplicate code or a missing percent.", sql: "CREATE TABLE coupons (\n  code TEXT PRIMARY KEY,\n  percent INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 50),\n  active INTEGER NOT NULL DEFAULT 1\n);\nINSERT INTO coupons (code, percent) VALUES ('SAVE10', 10);\nINSERT INTO coupons (code, percent) VALUES ('MEGA90', 90);\nSELECT * FROM coupons;", expect: "error" },
            { type: "sqlplay", heading: "Try it: DEFAULT fills in a value", text: "Without the bad row, the default for active appears.", sql: "CREATE TABLE coupons (\n  code TEXT PRIMARY KEY,\n  percent INTEGER NOT NULL CHECK (percent BETWEEN 1 AND 50),\n  active INTEGER NOT NULL DEFAULT 1\n);\nINSERT INTO coupons (code, percent) VALUES ('SAVE10', 10);\nSELECT * FROM coupons;", expect: "rows" }
        ],
        why: "Constraints are the last line of defence for data quality and catch bugs no test anticipated.",
        analogy: "Constraints are the shape of the slot in a coin machine: wrong coins simply do not go in.",
        mistakes: ["Rules only in application code.", "Nullable columns that should be required.", "Uniqueness checked with a SELECT before INSERT (a race)."],
        check: [{ q: "Why enforce uniqueness with a UNIQUE constraint rather than a check in code?", a: "Two simultaneous requests can both pass the code check; the constraint is atomic." }, { q: "What does CHECK do?", a: "Rejects rows that do not meet a condition." }],
        summary: "Encode rules as NOT NULL, UNIQUE, CHECK and DEFAULT so the database refuses bad data from any source." },
    { id: "dd-indexes", title: "Indexes and query plans", level: "intermediate",
        objectives: ["Explain what an index does", "Read SCAN versus SEARCH in a plan", "Choose columns to index"],
        intro: "An index is a sorted structure that lets the database find rows without reading the whole table. EXPLAIN QUERY PLAN in SQLite (EXPLAIN in PostgreSQL and MySQL) shows whether a query scans the table or searches an index. Index the columns used to filter, join and sort, especially foreign keys; every index also costs space and slows writes slightly.",
        blocks: [
            { type: "sqlplay", heading: "Try it: watch the plan change", text: "The first plan scans orders. After creating an index on customer_id, the plan searches the index. Run it and read the plan's detail column.", sql: "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 3;\nCREATE INDEX idx_orders_customer ON orders(customer_id);\nEXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 3;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "Which column most needs an index in orders?", options: ["customer_id, used in joins and filters", "status, with three values on a tiny table"], answer: 0, explain: "Foreign keys used in joins are the classic case." },
                { q: "Does an index on (city, joined) help WHERE joined > '2026-01-01' alone?", options: ["Usually not: the leading column city is not filtered", "Always"], answer: 0, explain: "Composite indexes work from the left." }
            ] }
        ],
        why: "Missing indexes are the commonest cause of slow pages backed by databases.",
        analogy: "An index is a book's index: you go straight to the page instead of reading every chapter.",
        mistakes: ["No index on foreign keys.", "Indexing every column.", "Ignoring the plan."],
        check: [{ q: "SCAN or SEARCH: which uses an index?", a: "SEARCH (in SQLite's plan output)." }, { q: "What is the cost of an index?", a: "Storage and slower inserts and updates." }],
        summary: "Index columns used to filter, join and sort, read the plan to confirm, and avoid needless indexes." },
    { id: "dd-transactions", title: "Transactions, isolation and locking", level: "intermediate",
        objectives: ["Use BEGIN, COMMIT and ROLLBACK", "Explain ACID", "Name isolation anomalies and levels"],
        intro: "A transaction groups statements that must succeed or fail together (atomicity), keeps data valid (consistency), hides partial work from others (isolation) and survives crashes once committed (durability). Isolation levels trade safety for concurrency: read committed avoids dirty reads; repeatable read also avoids non-repeatable reads; serializable behaves as if transactions ran one at a time. Databases use locks or multiple row versions (MVCC) to achieve this.",
        blocks: [
            { type: "sqlplay", heading: "Try it: a rollback undoes the change", text: "The price is cut inside a transaction, then rolled back. The final SELECT shows the original price.", sql: "SELECT id, price FROM products WHERE id = 1;\nBEGIN;\nUPDATE products SET price = price - 100 WHERE id = 1;\nROLLBACK;\nSELECT id, price FROM products WHERE id = 1;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "Two transactions read stock = 1 and both sell the last item. Which anomaly is this?", options: ["Lost update", "Dirty read"], answer: 0, explain: "Use an atomic UPDATE ... WHERE stock >= 1, SELECT ... FOR UPDATE, or serializable isolation." },
                { q: "PostgreSQL's default isolation level is:", options: ["Read committed", "Serializable"], answer: 0, explain: "MySQL InnoDB defaults to repeatable read." },
                { q: "What does durability guarantee?", options: ["Committed data survives a crash", "Queries are fast"], answer: 0, explain: "Written to persistent storage, typically through a write-ahead log." }
            ] }
        ],
        why: "Concurrency bugs (double bookings, overselling, lost updates) are expensive and hard to reproduce.",
        analogy: "Isolation is a changing room: others cannot see you until you step out dressed (commit).",
        mistakes: ["Read-then-write without locking or atomic updates.", "Long transactions holding locks.", "Assuming every database has the same default level."],
        check: [{ q: "What does ACID stand for?", a: "Atomicity, consistency, isolation, durability." }, { q: "What is a dirty read?", a: "Reading another transaction's uncommitted change." }],
        summary: "Group related changes in transactions, know the isolation levels and their anomalies, and use atomic updates or locks for counters." },
    { id: "dd-dialects", title: "PostgreSQL, MySQL and SQLite: the differences that matter", level: "advanced",
        objectives: ["Translate common statements between dialects", "Know each database's strengths", "Write portable SQL where possible"],
        intro: "Standard SQL is shared, but details differ. Auto-increment ids: SERIAL or GENERATED AS IDENTITY in PostgreSQL, AUTO_INCREMENT in MySQL, INTEGER PRIMARY KEY in SQLite. Upserts: INSERT ... ON CONFLICT DO UPDATE in PostgreSQL and SQLite, INSERT ... ON DUPLICATE KEY UPDATE in MySQL. String joining: || in PostgreSQL and SQLite, CONCAT() in MySQL by default. PostgreSQL has rich types (JSONB, arrays, time zones); SQLite has dynamic typing and lives in a single file.",
        blocks: [
            { type: "sqlplay", heading: "Try it: an upsert (PostgreSQL and SQLite syntax)", text: "The second insert hits the existing key and adds to the quantity instead of failing.", sql: "CREATE TABLE stock (product_id INTEGER PRIMARY KEY, qty INTEGER NOT NULL);\nINSERT INTO stock VALUES (1, 5);\nINSERT INTO stock VALUES (1, 3)\n  ON CONFLICT(product_id) DO UPDATE SET qty = qty + excluded.qty;\nSELECT * FROM stock;", expect: "rows" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "In MySQL, the same upsert is written:", options: ["INSERT ... ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)", "ON CONFLICT DO UPDATE"], answer: 0, explain: "MySQL has its own syntax (newer versions also allow a row alias instead of VALUES())." },
                { q: "SELECT 'a' || 'b' in MySQL with default settings returns:", options: ["0 (|| means OR unless PIPES_AS_CONCAT is set)", "'ab'"], answer: 0, explain: "Use CONCAT('a', 'b') in MySQL." },
                { q: "Which suits a phone app's local storage?", options: ["SQLite", "A PostgreSQL server"], answer: 0, explain: "SQLite is embedded in a single file with no server." }
            ] }
        ],
        why: "Projects move between databases and teams use several; dialect surprises cause subtle bugs.",
        analogy: "SQL dialects are regional accents: mostly understood everywhere, with a few words that mean something else.",
        mistakes: ["Assuming || concatenates everywhere.", "Testing on SQLite and deploying on PostgreSQL without checking.", "Relying on SQLite's loose typing."],
        check: [{ q: "PostgreSQL's auto-increment option?", a: "GENERATED ... AS IDENTITY (or the older SERIAL)." }, { q: "Which databases share ON CONFLICT upserts?", a: "PostgreSQL and SQLite." }],
        summary: "Know each dialect's identity columns, upserts, string functions and types, and test on the database you deploy." },
    { id: "dd-testing", title: "Database testing and data integrity checks", level: "advanced",
        objectives: ["Write SQL checks for orphans, duplicates and invalid values", "Test migrations", "Reconcile data between systems"],
        intro: "Database testing checks that data stays correct: no orphaned rows, no duplicates where there should be none, values inside allowed ranges, totals that reconcile between systems, and migrations that keep existing data intact. Each check is a query that should return zero problem rows, which makes it easy to automate in CI or a nightly job.",
        blocks: [
            { type: "sqlplay", heading: "Try it: integrity checks that should return no rows", text: "The first query finds order items whose product does not exist; the second finds orders whose customer does not exist. Zero rows means the check passes.", sql: "SELECT oi.order_id, oi.product_id\nFROM order_items oi\nLEFT JOIN products p ON p.id = oi.product_id\nWHERE p.id IS NULL;\n\nSELECT o.id, o.customer_id\nFROM orders o\nLEFT JOIN customers c ON c.id = o.customer_id\nWHERE c.id IS NULL;", expect: "rows" },
            { type: "sqlplay", heading: "Try it: find duplicate contacts", text: "contacts_raw is a messy import. Normalising case and spaces reveals emails that appear more than once.", sql: "SELECT lower(trim(email)) AS email, COUNT(*) AS copies\nFROM contacts_raw\nWHERE email IS NOT NULL\nGROUP BY lower(trim(email))\nHAVING COUNT(*) > 1;", expect: "rows" },
            { type: "order", heading: "Your turn: testing a migration", prompt: "Order the steps of testing a migration that splits customers.name into first_name and last_name.", items: ["Take a copy of production-like data and count the rows", "Run the migration on the copy", "Check row counts are unchanged and no names became empty", "Spot-check tricky names (one word, three words, accents)", "Run the application's tests against the migrated schema, and test the rollback"], explain: "Counts, edge cases, application behaviour and the way back." }
        ],
        why: "Data defects survive code fixes; integrity checks find them before reports and customers do.",
        analogy: "Integrity checks are a stock-take: you count what should be on the shelves and investigate every difference.",
        mistakes: ["Only testing the application, never the data.", "Migrations tested on empty databases.", "No rollback plan."],
        check: [{ q: "How do you find orphaned child rows?", a: "LEFT JOIN to the parent and keep rows where the parent key IS NULL." }, { q: "Why test migrations on realistic data?", a: "Edge cases and volume only appear with real-like data." }],
        summary: "Express integrity rules as queries that return zero rows, run them automatically, and test migrations on realistic copies with a rollback." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Database design interviews test reasoning about integrity and concurrency.",
    description: "12 database design and testing interview questions with explained answers: keys, normalisation, constraints, indexes, transactions, isolation, dialects and integrity checks.",
    coding: [],
    quiz: [
        { q: "Primary key versus unique constraint?", options: ["One primary key identifies rows; several unique constraints may exist", "The same"], answer: 0, explain: "Primary keys are also NOT NULL." },
        { q: "What is a foreign key?", options: ["A column whose values must exist in another table's key", "An encrypted key"], answer: 0, explain: "Referential integrity." },
        { q: "What is 3NF?", options: ["Non-key columns depend only on the key", "Three tables"], answer: 0, explain: "No transitive dependencies." },
        { q: "When denormalise?", options: ["Deliberately, for read performance, with sync rules", "Always"], answer: 0, explain: "Measure first." },
        { q: "Clustered versus non-clustered index (in general)?", options: ["Clustered defines row order; others point to rows", "The same"], answer: 0, explain: "InnoDB clusters by primary key." },
        { q: "What is ACID?", options: ["Atomicity, consistency, isolation, durability", "A query language"], answer: 0, explain: "Transaction guarantees." },
        { q: "What is a lost update?", options: ["Two transactions overwrite each other's change", "A deleted row"], answer: 0, explain: "Use atomic updates or locks." },
        { q: "What is MVCC?", options: ["Keeping row versions so readers do not block writers", "A backup format"], answer: 0, explain: "Used by PostgreSQL and InnoDB." },
        { q: "How do you find duplicates?", options: ["GROUP BY the key columns HAVING COUNT(*) > 1", "SELECT DISTINCT"], answer: 0, explain: "Normalise text first." },
        { q: "SQLite foreign keys are enforced by default?", options: ["No, PRAGMA foreign_keys = ON is needed", "Yes"], answer: 0, explain: "A common test-environment trap." },
        { q: "Upsert in PostgreSQL?", options: ["INSERT ... ON CONFLICT DO UPDATE", "MERGE only"], answer: 0, explain: "PostgreSQL 15 also has MERGE." },
        { q: "How do you test a migration?", options: ["On realistic data: counts, edge cases, app tests, rollback", "On an empty database"], answer: 0, explain: "Data reveals problems." }
    ]
};
