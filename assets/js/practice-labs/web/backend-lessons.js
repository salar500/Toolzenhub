/* =========================================================
   ToolZen Hub
   Backend Fundamentals path: lessons (original to this site). Backend logic is practised as real JavaScript run against
   tests in an isolated worker (jsrun), and HTTP behaviour on the in-page mock ShopLite API (apitask).
========================================================= */

export const lessons = [
    { id: "be-lifecycle", title: "How a backend handles a request", level: "beginner", prerequisite: "HTTP and REST APIs (beginner level) and JavaScript basics.",
        objectives: ["Trace a request through routing, middleware, handler and database", "Describe what a web framework does", "Read a minimal Express-style handler"],
        intro: "A backend is a program that listens for HTTP requests and answers them. A framework such as Express (Node.js), Django or FastAPI (Python) or Spring Boot (Java) provides the plumbing: a router picks the handler for the method and path, middleware runs shared steps (logging, authentication, parsing JSON), the handler applies the business rules, often reading or writing a database, and a response with a status code and body goes back.",
        blocks: [
            { type: "example", title: "A minimal Express handler", text: "import express from 'express';\nconst app = express();\napp.use(express.json());                   // middleware: parse JSON bodies\n\napp.get('/api/products/:id', async (req, res) => {\n  const product = await db.findProduct(req.params.id);\n  if (!product) return res.status(404).json({ error: 'Product not found' });\n  res.json(product);                        // 200 with JSON\n});\n\napp.listen(8080);" },
            { type: "order", heading: "Your turn: the request lifecycle", prompt: "Order what happens to GET /api/products/3 on the server.", items: ["The server accepts the connection and parses the HTTP request", "Middleware runs: logging, then parsing and authentication", "The router matches GET /api/products/:id and picks the handler", "The handler queries the database for product 3", "The handler sends 200 with the product as JSON (or 404)"], explain: "Parse, shared middleware, route, business logic and data, response." }
        ],
        why: "Understanding the request lifecycle helps developers structure code and helps testers know where a bug can live.",
        analogy: "A backend is a restaurant kitchen: the host seats the order (router), prep stations handle common steps (middleware), the chef cooks (handler) from the pantry (database).",
        mistakes: ["Putting all logic in one huge handler.", "Forgetting to return after sending an error.", "Business rules hidden in middleware."],
        check: [{ q: "What does middleware do?", a: "Runs shared steps for many requests, such as logging, parsing or authentication." }, { q: "Where do business rules belong?", a: "In handlers or the service code they call, not in routing." }],
        summary: "Requests flow through parsing, middleware, routing and a handler that applies rules and data, then return a status and body." },
    { id: "be-routing", title: "Routing and handlers", level: "beginner",
        objectives: ["Match paths with parameters", "Separate routing from business logic", "Return the right status codes"],
        intro: "Routes combine a method and a path pattern; parameters such as :id are captured from the path, query parameters from after the ?, and the body from the request. Handlers should stay thin: read the input, call a function that does the work, translate the result into a status and body.",
        blocks: [
            { type: "jsrun", heading: "Your turn: write a tiny router", exercise: "be-x-route" },
            { type: "apitask", heading: "Your turn: see a 405 from routing", task: "api-t-405" }
        ],
        why: "Routing mistakes produce 404s, wrong handlers and security gaps such as unprotected paths.",
        analogy: "A router is a building directory: floor and room (method and path) take you to the right office.",
        mistakes: ["Routes that overlap ambiguously.", "Trusting path parameters without validation.", "200 for everything."],
        check: [{ q: "What does :id in /api/orders/:id do?", a: "Captures that path segment as a parameter named id." }, { q: "Why keep handlers thin?", a: "So the business logic is in plain functions that are easy to test and reuse." }],
        summary: "Match method and path, capture parameters, keep handlers thin and map results to correct status codes." },
    { id: "be-validation", title: "Validation and error handling", level: "beginner",
        objectives: ["Validate every input on the server", "Collect field-level errors", "Handle unexpected errors without leaking details"],
        intro: "The server must check every input, whatever the client checked: types, required fields, ranges, formats. Collect all problems and return 422 (or 400) with field-level messages. Unexpected exceptions should be caught by one error handler that logs the details privately and returns a generic 500, never a stack trace.",
        blocks: [
            { type: "jsrun", heading: "Your turn: validate an order", exercise: "be-x-validate" },
            { type: "apitask", heading: "Your turn: see a 422 response", task: "api-t-422" }
        ],
        why: "Validation protects data quality and security, and good error responses save client developers hours.",
        analogy: "Validation is a border check: every passport is examined, even if the airline already looked at it.",
        mistakes: ["Trusting client-side validation.", "Stopping at the first error.", "Returning stack traces to users."],
        check: [{ q: "Why validate on the server if the browser already did?", a: "Anyone can call the API directly, bypassing the browser." }, { q: "What should an unexpected error return?", a: "A generic 500 message; details go to private logs." }],
        summary: "Validate every input on the server, report all field errors together and turn unexpected failures into logged, generic 500s." },
    { id: "be-databases", title: "Talking to the database", level: "intermediate",
        objectives: ["Use parameterised queries from code", "Explain ORMs and migrations", "Use transactions for multi-step changes"],
        intro: "Backends read and write databases through a driver or an ORM (object-relational mapper). Always pass values as parameters, never by building SQL strings. Schema changes are made with versioned migrations. When an operation changes several rows that must stay consistent, such as creating an order and reducing stock, wrap it in a transaction so it fully succeeds or fully rolls back.",
        blocks: [
            { type: "example", title: "Parameters and a transaction (node-postgres style)", text: "await db.query('BEGIN');\ntry {\n  const { rows } = await db.query(\n    'INSERT INTO orders (customer_id, total) VALUES ($1, $2) RETURNING id',\n    [customerId, totalPaise]);\n  await db.query('UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1', [qty, productId]);\n  await db.query('COMMIT');\n} catch (error) {\n  await db.query('ROLLBACK');\n  throw error;\n}" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why WHERE stock >= $1 in the UPDATE?", options: ["So two simultaneous orders cannot push stock below zero", "It is required syntax"], answer: 0, explain: "The condition is checked atomically by the database; check the affected row count too." },
                { q: "A page lists 50 orders and runs one extra query per order to load its customer. What is this called?", options: ["The N+1 query problem; use a join or a batched query", "Normal behaviour"], answer: 0, explain: "51 queries instead of 1 or 2: a classic performance bug." },
                { q: "How should a new column be added in production?", options: ["Through a versioned migration, reviewed and run by deployment", "By editing the live database by hand"], answer: 0, explain: "Migrations keep every environment's schema in step with the code." }
            ] }
        ],
        why: "Most backend bugs and slowdowns are in data access: injection, race conditions, missing transactions and N+1 queries.",
        analogy: "A transaction is a bank transfer: the money leaves one account and arrives in the other, or neither happens.",
        mistakes: ["String-built SQL.", "Multi-step changes without a transaction.", "N+1 queries in list pages."],
        check: [{ q: "What does ROLLBACK do?", a: "Undoes every change made since BEGIN in that transaction." }, { q: "What is an ORM?", a: "A library that maps database rows to objects in code." }],
        summary: "Use parameters, versioned migrations and transactions, and avoid N+1 queries; the SQL path covers the database side in depth." },
    { id: "be-pagination", title: "Pagination, filtering and performance", level: "intermediate",
        objectives: ["Page large result sets", "Choose offset or cursor pagination", "Cache safely"],
        intro: "Never return unbounded lists. Offset pagination (page and size) is simple; cursor pagination (after a last-seen id) stays fast and stable on huge, changing tables. Filters and sorts go in the query string and must use indexed columns. Caching (in memory, in Redis or with HTTP Cache-Control) avoids repeated work for data that changes rarely.",
        blocks: [
            { type: "jsrun", heading: "Your turn: write the pagination", exercise: "be-x-paginate" },
            { type: "quiz", questions: [
                { q: "New orders arrive while a user pages through results with page numbers. What can go wrong?", options: ["Items shift between pages, so some are repeated or skipped", "Nothing"], answer: 0, explain: "Cursor pagination (after id X) avoids this." },
                { q: "Which data is safest to cache for 10 minutes?", options: ["The public product catalogue", "A customer's cart"], answer: 0, explain: "Cache shared, slow-changing data; personal data needs care." }
            ] }
        ],
        why: "Unpaged lists and missing indexes are the most common causes of slow APIs.",
        analogy: "Pagination is serving a long queue one tray at a time instead of all the food at once.",
        mistakes: ["No upper limit on page size.", "Deep offsets on huge tables.", "Caching personal data publicly."],
        check: [{ q: "Offset versus cursor pagination?", a: "Offset uses page numbers; cursor continues after the last item seen and is stable and fast on large tables." }, { q: "Why cap the page size?", a: "To stop one request from loading the whole table." }],
        summary: "Always page, cap sizes, prefer cursors for large changing data, index filtered columns and cache shared data carefully." },
    { id: "be-auth", title: "Authentication, sessions and tokens", level: "intermediate",
        objectives: ["Compare session cookies and tokens", "Explain what a JWT contains", "Check authorisation in every handler"],
        intro: "After sign-in, the server must recognise later requests. Session cookies store a random id that maps to server-side session data; tokens such as JWTs carry signed claims (user id, roles, expiry) that the server verifies without a lookup. Either way, every handler must check authorisation: is this user allowed to do this to this object?",
        blocks: [
            { type: "apitask", heading: "Your turn: call a protected endpoint", task: "api-t-orders" },
            { type: "quiz", questions: [
                { q: "Is a JWT's payload secret?", options: ["No: it is base64url-encoded and readable; the signature only prevents changes", "Yes, it is encrypted"], answer: 0, explain: "Never put secrets in a JWT payload. ToolZen Hub's JWT Decoder shows this." },
                { q: "A user changes their role to admin in the token payload. What stops them?", options: ["Signature verification fails, so the server rejects the token", "Nothing"], answer: 0, explain: "Always verify the signature and the expiry." },
                { q: "How do you log a user out instantly with long-lived JWTs?", options: ["Keep tokens short-lived and use revocable refresh tokens or a deny list", "You cannot do anything"], answer: 0, explain: "Stateless tokens trade easy revocation for scale." }
            ] }
        ],
        why: "Authentication and authorisation flaws are among the most serious and common backend vulnerabilities.",
        analogy: "A session cookie is a cloakroom ticket the staff look up; a JWT is a signed wristband anyone can read but nobody can forge.",
        mistakes: ["Not verifying JWT signatures.", "Long-lived tokens with no revocation.", "Checking sign-in but not ownership."],
        check: [{ q: "What three parts does a JWT have?", a: "Header, payload and signature." }, { q: "Where should authorisation be checked?", a: "On the server, for every request and object." }],
        summary: "Recognise users with sessions or signed tokens, verify signatures and expiry, and authorise every action on every object." },
    { id: "be-money-reliability", title: "Correctness: money, retries and idempotency", level: "advanced",
        objectives: ["Handle money as integers", "Make retries safe with idempotency keys", "Handle partial failures"],
        intro: "Networks fail: a client may retry a payment request whose first attempt actually succeeded. An idempotency key sent with the request lets the server recognise the repeat and return the original result instead of charging twice. Money must be stored as integers in the smallest unit (paise), with rounding at defined steps, because floating-point numbers cannot represent most decimals exactly.",
        blocks: [
            { type: "jsrun", heading: "Your turn: totals in paise", exercise: "be-x-money" },
            { type: "jsrun", heading: "Your turn: idempotent payments", exercise: "be-x-idempotency" }
        ],
        why: "Double charges and rounding errors cost money and trust, and auditors find them.",
        analogy: "An idempotency key is a cheque number: the bank refuses to cash cheque 1047 twice.",
        mistakes: ["Floats for money.", "Retrying non-idempotent operations blindly.", "Rounding at random points."],
        check: [{ q: "Why not store ₹19.99 as a float?", a: "Binary floating point cannot represent it exactly, so sums drift; store 1999 paise." }, { q: "What does an idempotency key prevent?", a: "Duplicate effects when the same request is retried." }],
        summary: "Store money as integers, round deliberately, and make retried writes safe with idempotency keys." },
    { id: "be-architecture", title: "Architecture: monoliths, services and queues", level: "advanced",
        objectives: ["Compare monoliths and microservices", "Explain message queues and background jobs", "Design for failure between services"],
        intro: "A monolith is one deployable application: simple to build, test and run, and the right start for most teams. Microservices split a system into independently deployed services, which helps large organisations but adds network failures, distributed data and operational cost. Queues let slow work (emails, invoices, image processing) run in background workers, so requests stay fast; calls between services need timeouts, retries with backoff and circuit breakers.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A five-person start-up is building ShopLite's first version. Sensible architecture?", options: ["A well-structured monolith", "Twenty microservices"], answer: 0, explain: "Split later, along boundaries you understand." },
                { q: "Sending the order confirmation email takes 3 seconds. Where should it run?", options: ["In a background job via a queue, after the order is saved", "Inside the checkout request"], answer: 0, explain: "The customer gets a fast response; the job retries if email fails." },
                { q: "The payment service is down. What should the order service do?", options: ["Fail fast with timeouts, report clearly and retry later or queue", "Wait forever"], answer: 0, explain: "Timeouts and circuit breakers stop one failure spreading." },
                { q: "A queue delivers a message twice. What must the worker be?", options: ["Idempotent", "Faster"], answer: 0, explain: "Most queues deliver at least once." }
            ] }
        ],
        why: "Architecture decisions decide how fast a team can change the system and how failures spread.",
        analogy: "A monolith is one big shop; microservices are a market of stalls: flexible, but someone has to run the market.",
        mistakes: ["Microservices too early.", "Slow work inside requests.", "Service calls with no timeout."],
        check: [{ q: "What does a queue add?", a: "Asynchronous background processing with retries, decoupled from the request." }, { q: "Why do workers need to be idempotent?", a: "Messages can be delivered more than once." }],
        summary: "Start with a modular monolith, move slow work to queues, and protect calls between services with timeouts, retries and circuit breakers." },
    { id: "be-operations", title: "Configuration, logging and twelve-factor apps", level: "advanced",
        objectives: ["Configure apps through the environment", "Write useful structured logs", "Apply twelve-factor principles"],
        intro: "The twelve-factor approach describes apps that deploy cleanly: configuration in environment variables, stateless processes that can be replaced at any time, backing services (databases, queues) attached by URL, logs written to standard output as event streams, and the same build promoted from staging to production. Structured logs (JSON with fields such as requestId, userId, route and duration) make problems searchable.",
        blocks: [
            { type: "example", title: "A structured log line", text: "{\"level\":\"error\",\"time\":\"2026-11-08T09:03:40Z\",\"requestId\":\"r-81f2\",\"route\":\"POST /api/orders\",\"userId\":42,\"durationMs\":30012,\"message\":\"payment gateway timeout\"}" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Where should the database URL come from?", options: ["An environment variable", "A constant in the code"], answer: 0, explain: "The same build can then run in every environment." },
                { q: "Which should never be logged?", options: ["Passwords, tokens and full card numbers", "Request ids"], answer: 0, explain: "Logs are copied widely and kept for long periods." },
                { q: "Why include a requestId in every log line?", options: ["To follow one request across all its log lines and services", "Decoration"], answer: 0, explain: "Correlation ids make debugging possible." }
            ] }
        ],
        why: "Operability decides how quickly problems are found and fixed in production.",
        analogy: "Good logs are a flight recorder: when something goes wrong, they tell you exactly what happened.",
        mistakes: ["Config in code.", "Unstructured log messages.", "Secrets in logs."],
        check: [{ q: "What is a stateless process?", a: "One that keeps no local state between requests, so it can be replaced or scaled freely." }, { q: "What makes a log line structured?", a: "Machine-readable fields, usually JSON, rather than free text." }],
        summary: "Configure through the environment, keep processes stateless, log structured events with correlation ids and never log secrets." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Backend interviews test judgement about data, failure and security.",
    description: "12 backend interview questions with explained answers: request lifecycle, validation, transactions, N+1 queries, pagination, JWTs, idempotency, money and architecture.",
    coding: [],
    quiz: [
        { q: "What is middleware?", options: ["Shared steps run for many requests", "A database"], answer: 0, explain: "Logging, auth, parsing." },
        { q: "Why validate on the server?", options: ["Clients can be bypassed", "Browsers are slow"], answer: 0, explain: "Never trust input." },
        { q: "What is the N+1 problem?", options: ["One query per item instead of one batched query", "A numbering bug"], answer: 0, explain: "Use joins or batching." },
        { q: "Why use transactions?", options: ["Multi-step changes succeed or fail together", "Speed"], answer: 0, explain: "Atomicity." },
        { q: "Offset versus cursor pagination?", options: ["Cursor stays stable and fast on large changing tables", "The same"], answer: 0, explain: "After-id paging." },
        { q: "Is a JWT payload encrypted?", options: ["No, only signed", "Yes"], answer: 0, explain: "Readable by anyone." },
        { q: "What is idempotency?", options: ["Repeating a request has the same effect as once", "Speed"], answer: 0, explain: "Idempotency keys for POST." },
        { q: "How to store money?", options: ["Integers in the smallest unit", "Floats"], answer: 0, explain: "Paise." },
        { q: "Monolith or microservices first?", options: ["Usually a modular monolith", "Always microservices"], answer: 0, explain: "Split when needed." },
        { q: "Why queues?", options: ["Background work with retries, keeping requests fast", "To store users"], answer: 0, explain: "Asynchronous processing." },
        { q: "What should a 500 response contain?", options: ["A generic message; details only in logs", "The stack trace"], answer: 0, explain: "Avoid information disclosure." },
        { q: "Where does configuration belong?", options: ["The environment", "The code"], answer: 0, explain: "Twelve-factor." }
    ]
};
