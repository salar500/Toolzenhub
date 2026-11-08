/* =========================================================
   ToolZen Hub
   Data Engineering Foundations path: lessons (original to this site). Transformations run as real SQLite (sql.js) on
   the ShopLite practice tables in the browser (sqlplay blocks), verified by tests/unit/db-design.test.mjs with Python's
   sqlite3. Orchestration tools are described, not run.
========================================================= */

export const lessons = [
    { id: "de-pipelines", title: "Data pipelines: ETL, ELT, batch and streaming", level: "beginner", prerequisite: "SQL beginner level and the Statistics path's cleaning lesson help.",
        objectives: ["Explain extract, transform and load", "Compare ETL and ELT", "Choose batch or streaming"],
        intro: "A data pipeline moves data from where it is created (apps, files, APIs) to where it is analysed (a warehouse or lake). ETL transforms data before loading it; ELT loads raw data first and transforms it inside the warehouse with SQL, which modern cloud warehouses make cheap. Batch pipelines run on a schedule (every night, every hour); streaming pipelines process events within seconds, at more cost and complexity.",
        blocks: [
            { type: "order", heading: "Your turn: an ELT pipeline", prompt: "Order the steps of a nightly ELT pipeline for ShopLite's sales reporting.", items: ["Extract yesterday's new orders from the shop database", "Load them unchanged into a raw table in the warehouse", "Transform raw tables into clean, modelled tables with SQL", "Run data-quality checks on the results", "Publish to the reporting layer and notify on failure"], explain: "ELT keeps the raw copy, transforms in the warehouse and checks quality before anyone sees the numbers." },
            { type: "quiz", questions: [
                { q: "Fraud must be flagged within seconds of a payment. Which processing?", options: ["Streaming", "A nightly batch"], answer: 0, explain: "Latency requirements decide." },
                { q: "Why keep the raw data in ELT?", options: ["Transformations can be fixed and re-run from the original", "It is required by SQL"], answer: 0, explain: "Raw data is the source of truth for reprocessing." }
            ] }
        ],
        why: "Every dashboard, model and AI system depends on pipelines; data engineering is one of the most in-demand data roles.",
        analogy: "A pipeline is a water-treatment plant: collect, store, purify, test and then deliver to taps.",
        mistakes: ["Streaming when hourly batch would do.", "Transforming without keeping the raw data.", "No checks before publishing."],
        check: [{ q: "ETL versus ELT?", a: "ETL transforms before loading; ELT loads raw data and transforms in the warehouse." }, { q: "When is batch enough?", a: "When results are needed hourly or daily rather than within seconds." }],
        summary: "Pipelines extract, load and transform data in batches or streams; keep raw data and check quality before publishing." },
    { id: "de-transform", title: "Transforming raw data with SQL", level: "beginner",
        objectives: ["Clean raw records in SQL", "Deduplicate on a business key", "Create a clean table from a raw one"],
        intro: "Transformations turn raw records into trustworthy tables: trim and standardise text, normalise case for keys such as email, convert types, remove duplicates by a business key and keep traceability to the raw row. In ELT this is plain SQL, often managed by tools such as dbt, which version, test and document each model.",
        blocks: [
            { type: "sqlplay", heading: "Try it: build a clean contacts table", text: "contacts_raw has stray spaces, mixed case and repeated people. This builds contacts_clean with one row per email, keeping the earliest record, then shows it.", sql: "CREATE TABLE contacts_clean AS\nSELECT MIN(id) AS raw_id,\n       trim(name) AS name,\n       lower(trim(email)) AS email,\n       upper(substr(trim(city), 1, 1)) || lower(substr(trim(city), 2)) AS city\nFROM contacts_raw\nWHERE email IS NOT NULL AND trim(email) <> ''\nGROUP BY lower(trim(email));\n\nSELECT * FROM contacts_clean ORDER BY raw_id;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "Why keep raw_id in the clean table?", options: ["To trace every clean row back to its source", "It is decoration"], answer: 0, explain: "Lineage makes problems debuggable." }
            ] }
        ],
        why: "Clean, deduplicated tables are what analysts and models actually use.",
        analogy: "Transformation is washing, peeling and chopping before the cooking starts.",
        mistakes: ["Deduplicating on all columns instead of the key.", "Losing the link to the raw row.", "Cleaning differently in every report."],
        check: [{ q: "What is a business key?", a: "The real-world identifier, such as an email or order number, used to match records." }, { q: "What does dbt do?", a: "Manages SQL transformations as versioned, tested models." }],
        summary: "Clean, standardise and deduplicate raw data in SQL by business key, keeping lineage to the source." },
    { id: "de-incremental", title: "Incremental loads and idempotent jobs", level: "intermediate",
        objectives: ["Load only new data with a watermark", "Make loads safe to re-run", "Handle late-arriving data"],
        intro: "Reloading everything every night becomes slow as data grows. Incremental loads take only rows newer than a stored watermark (the last date or id loaded). Jobs must be idempotent: running the same load twice must not duplicate rows, which upserts or delete-then-insert for the period achieve. Late-arriving data needs a look-back window.",
        blocks: [
            { type: "sqlplay", heading: "Try it: an incremental, idempotent load", text: "A watermark records what was loaded. The load inserts only newer orders, and running it twice adds nothing the second time, thanks to INSERT OR IGNORE on the primary key.", sql: "CREATE TABLE wh_orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT);\nCREATE TABLE load_state (last_loaded TEXT);\nINSERT INTO load_state VALUES ('2024-01-31');\n\nINSERT OR IGNORE INTO wh_orders\nSELECT id, customer_id, order_date, status FROM orders\nWHERE order_date > (SELECT last_loaded FROM load_state);\n\nINSERT OR IGNORE INTO wh_orders\nSELECT id, customer_id, order_date, status FROM orders\nWHERE order_date > (SELECT last_loaded FROM load_state);\n\nSELECT COUNT(*) AS loaded, MIN(order_date) AS first, MAX(order_date) AS last FROM wh_orders;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "A nightly job fails halfway and is re-run. What must be true?", options: ["The re-run produces the same result without duplicates", "It must never be re-run"], answer: 0, explain: "Idempotency makes retries and backfills safe." }
            ] }
        ],
        why: "Incremental, idempotent loads keep pipelines fast and make failures recoverable.",
        analogy: "A watermark is a bookmark: next time you start reading where you stopped.",
        mistakes: ["Full reloads of huge tables.", "Appending on re-run, duplicating rows.", "No window for late data."],
        check: [{ q: "What is a watermark?", a: "The stored position (date or id) up to which data was loaded." }, { q: "How do you make an insert idempotent?", a: "Use a key with upsert or insert-ignore, or delete and reload the period." }],
        summary: "Load incrementally from a watermark, make every job safe to re-run and allow for late-arriving data." },
    { id: "de-warehouse", title: "Warehouse modelling: facts, dimensions and marts", level: "intermediate",
        objectives: ["Build a fact table from transactional tables", "Aggregate a reporting mart", "Explain slowly changing dimensions"],
        intro: "Warehouses model data for analysis: fact tables hold events at a defined grain (one row per order line), dimension tables describe them, and marts pre-aggregate for specific reports. Slowly changing dimensions decide what happens when, say, a customer moves city: overwrite (type 1) or keep history with validity dates (type 2).",
        blocks: [
            { type: "sqlplay", heading: "Try it: a fact view and a monthly mart", text: "fact_sales has one row per order line with revenue; the mart sums revenue per month.", sql: "CREATE VIEW fact_sales AS\nSELECT oi.order_id, o.order_date, o.customer_id, oi.product_id,\n       oi.quantity, oi.quantity * p.price AS revenue\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nWHERE o.status <> 'cancelled';\n\nSELECT strftime('%Y-%m', order_date) AS month,\n       COUNT(DISTINCT order_id) AS orders,\n       SUM(revenue) AS revenue\nFROM fact_sales\nGROUP BY month\nORDER BY month;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "What is the grain of fact_sales?", options: ["One row per order line", "One row per customer"], answer: 0, explain: "State the grain before adding columns." },
                { q: "Reports must show sales by the city the customer lived in at the time of each order. Which dimension type?", options: ["Type 2 (keep history)", "Type 1 (overwrite)"], answer: 0, explain: "Type 2 rows carry validity dates." }
            ] }
        ],
        why: "Good warehouse models make every downstream report consistent and fast.",
        analogy: "Facts are the till receipts; dimensions are the product catalogue and the customer cards.",
        mistakes: ["Mixed grains in one fact table.", "Overwriting history that reports need.", "Every analyst rebuilding the same joins."],
        check: [{ q: "What is a mart?", a: "A subject-specific, often aggregated, table or view for reporting." }, { q: "SCD type 1 versus type 2?", a: "Type 1 overwrites; type 2 keeps history rows." }],
        summary: "Model facts at a stated grain with descriptive dimensions, build marts for reports and choose how dimensions keep history." },
    { id: "de-quality", title: "Data quality checks and observability", level: "advanced",
        objectives: ["Write checks for completeness, uniqueness, validity and freshness", "Decide when a failing check blocks publishing", "Monitor pipelines"],
        intro: "Data quality is tested like code: completeness (no unexpected nulls), uniqueness (keys appear once), validity (values in allowed ranges), referential integrity, freshness (data is recent) and volume (row counts are plausible). Critical failures stop the pipeline before bad numbers reach dashboards; others raise warnings. Observability tracks these metrics over time.",
        blocks: [
            { type: "sqlplay", heading: "Try it: a quality report in one query", text: "Each column is a check; in a pipeline each would be compared with a threshold.", sql: "SELECT\n  (SELECT COUNT(*) FROM contacts_raw WHERE email IS NULL OR trim(email) = '') AS missing_emails,\n  (SELECT COUNT(*) - COUNT(DISTINCT lower(trim(email))) FROM contacts_raw WHERE email IS NOT NULL) AS duplicate_emails,\n  (SELECT COUNT(*) FROM order_items WHERE quantity <= 0) AS invalid_quantities,\n  (SELECT MAX(order_date) FROM orders) AS latest_order;", expect: "rows" },
            { type: "quiz", questions: [
                { q: "Yesterday's orders table has 12 rows instead of the usual 1,200. Which check catches it?", options: ["A volume check against recent history", "A uniqueness check"], answer: 0, explain: "Sudden drops usually mean an upstream failure." },
                { q: "Should a failed uniqueness check on order ids block publishing?", options: ["Yes: duplicate keys double revenue", "No"], answer: 0, explain: "Critical checks must stop the pipeline." }
            ] }
        ],
        why: "Silent data errors destroy trust in reports faster than outages do.",
        analogy: "Quality checks are the tasting before a dish leaves the kitchen.",
        mistakes: ["No checks at all.", "Checks that only warn when they should block.", "Ignoring freshness."],
        check: [{ q: "Name four data-quality dimensions.", a: "For example completeness, uniqueness, validity and freshness." }, { q: "What is a volume check?", a: "Comparing the row count with expected or historical levels." }],
        summary: "Test data for completeness, uniqueness, validity, integrity, freshness and volume, and block publishing on critical failures." },
    { id: "de-orchestration", title: "Orchestration, scheduling and backfills", level: "advanced",
        objectives: ["Describe DAGs of tasks", "Schedule and retry jobs", "Run backfills safely"],
        intro: "Orchestrators such as Apache Airflow, Dagster or Prefect run pipelines as directed acyclic graphs (DAGs): tasks with dependencies, schedules, retries and alerts. A backfill re-runs a pipeline for past periods, after a fix or for a new table, which only works safely when tasks are idempotent and parameterised by date.",
        blocks: [
            { type: "order", heading: "Your turn: dependencies in a DAG", prompt: "Order the tasks of ShopLite's nightly DAG so each runs after what it needs.", items: ["Extract orders and customers", "Load raw tables", "Transform to clean tables", "Build fact_sales and the monthly mart", "Run quality checks", "Refresh dashboards"], explain: "Each task depends on the outputs of those before it; checks gate the dashboard refresh." },
            { type: "quiz", questions: [
                { q: "A transform bug is fixed. Last month's numbers are wrong. What do you run?", options: ["A backfill of the affected dates", "Nothing; only new days matter"], answer: 0, explain: "Parameterised, idempotent tasks make backfills safe." },
                { q: "In cron terms, '0 2 * * *' runs:", options: ["Every day at 02:00", "Every 2 minutes"], answer: 0, explain: "The Cron Challenge Lab practises schedules." }
            ] }
        ],
        why: "Orchestration turns scripts into dependable systems that recover from failure.",
        analogy: "A DAG is a recipe's order of steps: you cannot ice the cake before baking it.",
        mistakes: ["Hidden dependencies between scripts.", "Jobs that cannot be re-run for a past date.", "No alerts on failure."],
        check: [{ q: "What does acyclic mean in DAG?", a: "No task depends, directly or indirectly, on itself." }, { q: "What makes backfills safe?", a: "Idempotent tasks parameterised by date." }],
        summary: "Run pipelines as DAGs with schedules, retries and alerts, and keep tasks idempotent so backfills are safe." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Data engineering interviews focus on reliability and modelling.",
    description: "10 data engineering interview questions with explained answers: ETL and ELT, incremental loads, idempotency, modelling, quality and orchestration.",
    coding: [],
    quiz: [
        { q: "ETL versus ELT?", options: ["Transform before versus after loading", "The same"], answer: 0, explain: "ELT uses the warehouse." },
        { q: "Batch versus streaming?", options: ["Scheduled chunks versus continuous events", "The same"], answer: 0, explain: "Latency decides." },
        { q: "What is a watermark?", options: ["The last loaded position", "A logo"], answer: 0, explain: "Incremental loads." },
        { q: "Why idempotent jobs?", options: ["Safe re-runs and backfills", "Speed"], answer: 0, explain: "No duplicates." },
        { q: "What is the grain of a fact table?", options: ["What one row represents", "Its size"], answer: 0, explain: "Define it first." },
        { q: "SCD type 2?", options: ["Keeps history rows", "Overwrites"], answer: 0, explain: "Validity dates." },
        { q: "Name a data-quality check.", options: ["Uniqueness of keys", "Font size"], answer: 0, explain: "Also completeness, freshness." },
        { q: "What is a DAG?", options: ["Tasks with dependencies and no cycles", "A database"], answer: 0, explain: "Airflow, Dagster." },
        { q: "What is a backfill?", options: ["Re-running a pipeline for past periods", "Deleting data"], answer: 0, explain: "After fixes." },
        { q: "What is data lineage?", options: ["Tracing data from source to output", "A naming rule"], answer: 0, explain: "Debugging and trust." }
    ]
};
