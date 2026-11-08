/* =========================================================
   ToolZen Hub
   HTTP and REST APIs path: lessons (original to this site; HTTP semantics as in RFC 9110). Request tasks are answered
   by the in-page mock API (web/mock-api.js); nothing is sent over the network.
========================================================= */

export const lessons = [
    {
        id: "http-how-web-works", title: "How the web works: clients, servers and URLs", level: "beginner", prerequisite: "None.",
        objectives: ["Describe the request and response cycle", "Name the parts of a URL", "Explain what an API is"],
        intro: "When you open a page or an app loads data, a client (a browser or an app) sends an HTTP request to a server, and the server sends back a response. An API (application programming interface) is a set of addresses and rules that programs use to ask a server for data or actions, usually exchanging JSON.",
        blocks: [
            { type: "example", title: "The parts of a URL", text: "https://api.shoplite.example/api/products?category=home&maxPrice=1500\n\nscheme:  https\nhost:    api.shoplite.example\npath:    /api/products\nquery:   category=home&maxPrice=1500  (two parameters joined by &)" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "In https://api.shoplite.example/api/orders?page=2, what is the path?", options: ["/api/orders", "page=2", "api.shoplite.example"], answer: 0, explain: "The path names the resource; the query (after ?) refines the request." },
                { q: "What usually travels between an app and its API?", options: ["JSON over HTTP", "Screenshots"], answer: 0, explain: "JSON is the common format for API data." }
            ] }
        ],
        why: "Every web and mobile app is built on HTTP APIs. Developers build them, testers test them and analysts pull data from them.",
        analogy: "HTTP is ordering at a counter: the request is your order slip, the response is what comes back across the counter, with a note if something is wrong.",
        mistakes: ["Confusing the path with the query.", "Thinking an API is a website for people.", "Ignoring that every request has a response, even when it fails."],
        check: [
            { q: "Who sends the request and who sends the response?", a: "The client sends the request; the server sends the response." },
            { q: "What separates query parameters from each other?", a: "The & character." }
        ],
        summary: "Clients send HTTP requests to URLs (scheme, host, path, query) and servers answer with responses; APIs are those addresses and rules for programs."
    },
    {
        id: "http-methods", title: "HTTP methods: GET, POST, PUT, PATCH and DELETE", level: "beginner",
        objectives: ["Choose the right method", "Send a GET request", "Explain safe and idempotent methods"],
        intro: "The method says what the request wants to do. GET reads, POST creates or triggers an action, PUT replaces a resource, PATCH changes part of it and DELETE removes it. GET is safe: it must not change anything. GET, PUT and DELETE are idempotent: sending the same request twice has the same effect as sending it once. POST is neither.",
        blocks: [
            { type: "apitask", heading: "Your turn: read a collection", task: "api-t-list" },
            { type: "apitask", heading: "Your turn: read one item", task: "api-t-one" }
        ],
        why: "Using the right method makes APIs predictable and safe to retry. Testers check that GET never changes data and that repeated requests behave as the method promises.",
        analogy: "GET is reading the menu, POST is placing an order, PATCH is changing your order's drink, DELETE is cancelling it.",
        mistakes: ["Using GET for actions that change data.", "Treating POST as safe to retry blindly.", "Mixing up PUT (replace) and PATCH (partial change)."],
        check: [
            { q: "Which method should never change data?", a: "GET (and HEAD)." },
            { q: "What does idempotent mean?", a: "Repeating the same request has the same effect as sending it once." }
        ],
        summary: "GET reads, POST creates, PUT replaces, PATCH updates part and DELETE removes; safe and idempotent methods can be retried without surprises."
    },
    {
        id: "http-status-codes", title: "Status codes", level: "beginner",
        objectives: ["Read the five status-code classes", "Tell 400, 401, 403, 404, 405 and 422 apart", "Check status and body together"],
        intro: "Every response starts with a three-digit status code. 2xx means success (200 OK, 201 Created, 204 No Content), 3xx a redirect, 4xx a problem with the request (the client's side) and 5xx a problem on the server. The body usually explains the code, and good tests check both.",
        blocks: [
            { type: "apitask", heading: "Your turn: a 404", task: "api-t-404" },
            { type: "apitask", heading: "Your turn: a 405", task: "api-t-405" },
            { type: "quiz", questions: [
                { q: "The token is valid but the user is not allowed to see admin reports. Which code?", options: ["401 Unauthorized", "403 Forbidden"], answer: 1, explain: "401 means not authenticated (who are you?); 403 means authenticated but not permitted." },
                { q: "The server crashes while handling the request. Which class?", options: ["4xx", "5xx"], answer: 1, explain: "5xx codes report server-side failures, such as 500 Internal Server Error." }
            ] }
        ],
        why: "Status codes are the first thing every client and every API test checks. Wrong codes (such as 200 with an error message) break apps and hide bugs.",
        analogy: "The status code is the headline; the body is the article that explains it.",
        mistakes: ["Returning 200 for errors.", "Confusing 401 with 403.", "Checking the code but not the error message."],
        check: [
            { q: "What does 201 mean?", a: "Created: the request made a new resource." },
            { q: "4xx or 5xx when the client sends invalid data?", a: "4xx, usually 400 or 422." }
        ],
        summary: "2xx success, 3xx redirect, 4xx client problem, 5xx server problem; read the code and the body together."
    },
    {
        id: "http-query-headers", title: "Query parameters, headers and JSON bodies", level: "beginner",
        objectives: ["Filter with query parameters", "Send headers such as Content-Type", "Write a JSON request body"],
        intro: "Query parameters refine a GET request: filter, sort or page. Headers carry information about the request: Accept says what format you want back, Content-Type says what format the body is in and Authorization carries credentials. Requests that create or change data send a body, usually JSON.",
        blocks: [
            { type: "apitask", heading: "Your turn: filter with the query", task: "api-t-filter" },
            { type: "apitask", heading: "Your turn: send a JSON body", task: "api-t-add" }
        ],
        why: "Most API bugs live in the details: a parameter misspelt, a missing header, a body that is not quite valid JSON.",
        analogy: "Headers are the envelope's labels (fragile, this way up); the body is the letter inside.",
        mistakes: ["Forgetting Content-Type: application/json.", "Sending numbers as strings (\"2\" instead of 2).", "Spaces and special characters in query values without encoding."],
        check: [
            { q: "Which header says the body is JSON?", a: "Content-Type: application/json." },
            { q: "How do you send two query parameters?", a: "Join them with &: ?category=home&maxPrice=1500." }
        ],
        summary: "Use query parameters to refine reads, headers to describe the request and JSON bodies to send data, with the matching Content-Type."
    },
    {
        id: "http-auth", title: "Authentication and authorisation", level: "intermediate",
        objectives: ["Send a bearer token", "Tell authentication from authorisation", "Handle tokens safely"],
        intro: "Authentication answers 'who are you?' and authorisation answers 'what may you do?'. Many APIs use tokens: after signing in, the client receives a token and sends it with each request in the header Authorization: Bearer <token>. Missing or invalid tokens give 401; a valid token without permission gives 403.",
        blocks: [
            { type: "apitask", heading: "Your turn: call a protected endpoint", task: "api-t-orders" },
            { type: "quiz", questions: [
                { q: "Where should a token never appear?", options: ["In the URL query string, where it ends up in logs and history", "In the Authorization header"], answer: 0, explain: "URLs are logged and shared; tokens belong in headers." },
                { q: "You can read another customer's order by changing the id in /api/orders/SL-1004. What is this?", options: ["Broken object-level authorisation, a serious security defect", "Normal behaviour"], answer: 0, explain: "Every request must check that the caller may access that specific object; this is the top API security risk in OWASP's list." }
            ] }
        ],
        why: "Authorisation flaws are the most common serious API vulnerabilities. Testers must try other users' ids, missing tokens and expired tokens on purpose.",
        analogy: "Authentication is showing your ID at reception; authorisation is which floors your badge opens.",
        mistakes: ["Tokens in URLs or logs.", "Checking that a user is signed in but not that they own the object.", "Testing only with an admin account."],
        check: [
            { q: "401 or 403: no token sent?", a: "401." },
            { q: "What is the format of a bearer token header?", a: "Authorization: Bearer <token>." }
        ],
        summary: "Send tokens in the Authorization header; 401 means not authenticated, 403 not permitted, and every object access must be authorised."
    },
    {
        id: "http-validation", title: "Validation errors: 400, 415 and 422", level: "intermediate",
        objectives: ["Tell malformed requests from invalid values", "Read field-level error messages", "Design validation tests"],
        intro: "A careful API rejects bad input with a clear reason. 400 Bad Request means the request could not be understood, for example broken JSON. 415 Unsupported Media Type means the body's format is not accepted. 422 Unprocessable Content means the request was understood but its values break the rules, ideally with an error for each field.",
        blocks: [
            { type: "apitask", heading: "Your turn: break a rule", task: "api-t-422" },
            { type: "quiz", questions: [
                { q: "The body is {\"productId\": 1, \"qty\": 2 (the closing brace is missing). Which code fits?", options: ["400", "422"], answer: 0, explain: "It cannot be parsed, so it is malformed: 400." },
                { q: "Which validation tests would you add for qty (1 to 10, whole numbers)?", options: ["0, 1, 10, 11, 2.5, \"2\" and a missing qty", "Only 2"], answer: 0, explain: "Boundaries, wrong types and missing fields, the same test-design ideas as in Software Testing." }
            ] }
        ],
        why: "Validation is where APIs meet untrusted input. Clear errors help app developers, and thorough validation tests prevent bad data and security holes.",
        analogy: "400 is a form in a language the clerk cannot read; 422 is a readable form with a box filled in wrongly.",
        mistakes: ["Returning 500 for bad input.", "One vague error for all problems.", "Testing only valid values."],
        check: [
            { q: "When is 415 returned?", a: "When the body's media type, given by Content-Type, is not supported." },
            { q: "What should a good 422 response contain?", a: "Which fields are wrong and why." }
        ],
        summary: "400 for unreadable requests, 415 for the wrong format, 422 for rule violations with field-level messages; test boundaries, types and missing fields."
    },
    {
        id: "http-rest-design", title: "REST API design", level: "intermediate",
        objectives: ["Name resources with nouns", "Map operations to methods and paths", "Design pagination and versioning"],
        intro: "REST organises an API around resources named by nouns (/products, /orders/SL-1004), acted on with HTTP methods. Collections are plural, items are addressed by id, filters go in the query, and large lists are paged. Versioning (/v1/) lets an API change without breaking existing clients.",
        blocks: [
            { type: "quiz", heading: "Your turn: pick the better design", questions: [
                { q: "Cancel order SL-1004:", options: ["POST /api/getCancelOrder?id=SL-1004", "POST /api/orders/SL-1004/cancellation (or PATCH the order's status)"], answer: 1, explain: "Address the resource and use the method for the action; verbs in paths are a smell." },
                { q: "Page 2 of products, 20 per page:", options: ["GET /api/products?page=2&limit=20", "GET /api/products/page2/20"], answer: 0, explain: "Paging and filtering belong in the query." },
                { q: "A field must be renamed, but old apps still use it. What helps?", options: ["Release a new version (/v2/) and keep /v1/ for a while", "Rename it immediately"], answer: 0, explain: "Versioning avoids breaking existing clients." }
            ] },
            { type: "order", heading: "Your turn: design order", prompt: "Put the steps of designing a new API endpoint in order.", items: ["Name the resource and its fields", "Choose the path and the method", "Define the request body and validation rules", "Define the success and error responses with codes", "Document it with examples and write the tests"], explain: "Resource first, then the interface, the rules, the responses and finally documentation and tests." }
        ],
        why: "Consistent APIs are easier to use, test and evolve. Design reviews and API-first development are standard practice in backend teams.",
        analogy: "A REST API is a well-organised library: books (resources) are found by section and number, and the rules for borrowing (methods) are the same everywhere.",
        mistakes: ["Verbs in paths.", "Returning huge unpaged lists.", "Breaking changes without versioning."],
        check: [
            { q: "Should resource names be nouns or verbs?", a: "Nouns; the method provides the verb." },
            { q: "Where do filters go?", a: "In query parameters." }
        ],
        summary: "Design around noun resources and HTTP methods, page and filter with the query, return clear codes and version breaking changes."
    },
    {
        id: "http-api-testing", title: "Testing APIs", level: "advanced",
        objectives: ["Plan API tests across categories", "Check status, headers, body and side effects", "Automate API tests"],
        intro: "API tests send requests and check responses: the status code, important headers, the body's structure and values, and side effects such as a created record. A good set covers the happy path, validation, authentication and authorisation, not-found and method errors, and idempotency. API tests are fast and stable, so most automated checks belong at this level.",
        blocks: [
            { type: "order", heading: "Your turn: one API test", prompt: "Order the steps of an automated test for POST /api/cart/items.", items: ["Prepare the data and a valid token", "Send the POST request with a JSON body", "Check the status is 201 and the Location header is present", "Check the body's fields and values", "Check the side effect with a GET, then clean up"], explain: "Arrange, act, assert the response, verify the effect, clean up." },
            { type: "quiz", questions: [
                { q: "Which is the strongest check after creating an item?", options: ["Status 201 only", "Status 201, the returned fields, and a GET that shows the item exists"], answer: 1, explain: "Verify the response and the effect." },
                { q: "Where do most automated checks belong, by the test pyramid?", options: ["API and unit level, with fewer UI tests", "Only UI tests"], answer: 0, explain: "API tests are faster and less flaky than UI tests." },
                { q: "Which Playwright fixture sends API requests?", options: ["request", "page"], answer: 0, explain: "As in the Playwright path's network lesson." }
            ] }
        ],
        why: "API testing is one of the most requested testing skills. It catches business-rule bugs early, long before a UI exists.",
        analogy: "Testing an API is checking a vending machine from the inside: you press each button, then count what came out and what is left.",
        mistakes: ["Checking only the status code.", "No negative tests.", "Tests that depend on each other's data."],
        check: [
            { q: "Name four things an API test can check.", a: "Status code, headers, body fields and values, and side effects." },
            { q: "Why are API tests less flaky than UI tests?", a: "No rendering, animation or browser timing; just requests and responses." }
        ],
        summary: "Test APIs for status, headers, body and side effects across happy, validation, auth, not-found and method cases, and automate most checks at this level."
    },
    {
        id: "http-performance-security", title: "Caching, rate limits and API security", level: "advanced",
        objectives: ["Explain caching headers", "Explain rate limiting and 429", "Name key API security risks"],
        intro: "APIs must stay fast and safe under real use. Caching headers (Cache-Control, ETag) let clients reuse responses. Rate limits protect servers by answering 429 Too Many Requests when a client sends too much. Security starts with authorisation on every object, validation of every input, HTTPS everywhere and no secrets in URLs or logs.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A client gets 429 with Retry-After: 30. What should it do?", options: ["Wait 30 seconds before retrying", "Retry immediately in a loop"], answer: 0, explain: "Respect the limit; retry later, ideally with backoff." },
                { q: "Which response may usually be cached?", options: ["GET /api/products (public product list)", "POST /api/cart/items"], answer: 0, explain: "Safe, public reads can be cached; actions cannot." },
                { q: "An endpoint returns the full user record, including password hashes, and the app hides them. The risk?", options: ["Excessive data exposure: the API must not send what the client should not see", "None, the app hides them"], answer: 0, explain: "Anyone can call the API directly, so hiding in the UI is no protection." },
                { q: "Why is HTTPS required for APIs with tokens?", options: ["Without it, tokens and data can be read or changed in transit", "It makes JSON smaller"], answer: 0, explain: "TLS encrypts and protects the connection." }
            ] }
        ],
        why: "Performance and security failures in APIs reach every user at once. Engineers and testers are expected to know these basics.",
        analogy: "A rate limit is a queue barrier at a popular shop: everyone gets served, nobody can push in a thousand times.",
        mistakes: ["Retrying 429 without waiting.", "Trusting the client to hide sensitive fields.", "Caching personal responses publicly."],
        check: [
            { q: "What does 429 mean?", a: "Too Many Requests: the client exceeded a rate limit." },
            { q: "Name two API security basics.", a: "For example authorisation on every object, input validation, HTTPS, and no secrets in URLs or logs." }
        ],
        summary: "Use caching for safe reads, respect and enforce rate limits (429), and secure APIs with object-level authorisation, validation, HTTPS and minimal data."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. API interviews mix definitions with scenarios, so read the reasoning.",
    description: "12 HTTP and REST API interview questions with explained answers: methods, status codes, headers, authentication, validation, design and testing.",
    coding: [],
    quiz: [
        { q: "GET versus POST?", options: ["GET reads without side effects; POST creates or triggers actions", "No difference"], answer: 0, explain: "GET must be safe." },
        { q: "PUT versus PATCH?", options: ["PUT replaces the whole resource; PATCH changes part of it", "They are identical"], answer: 0, explain: "A common interview distinction." },
        { q: "Which methods are idempotent?", options: ["GET, PUT, DELETE", "Only POST"], answer: 0, explain: "Repeating them has the same effect as once." },
        { q: "401 versus 403?", options: ["401: not authenticated; 403: authenticated but not allowed", "The same"], answer: 0, explain: "Who you are versus what you may do." },
        { q: "400 versus 422?", options: ["400: request unreadable; 422: readable but values break rules", "The same"], answer: 0, explain: "Many APIs use 400 for both; know the difference." },
        { q: "What does 201 usually come with?", options: ["The created resource and a Location header", "An empty error"], answer: 0, explain: "Location points to the new resource." },
        { q: "What is Content-Type for?", options: ["It states the format of the body", "It sets the language"], answer: 0, explain: "application/json for JSON bodies." },
        { q: "Where do filters and paging go in REST?", options: ["Query parameters", "The method"], answer: 0, explain: "?category=home&page=2." },
        { q: "What is the top API security risk?", options: ["Broken object-level authorisation", "Using JSON"], answer: 0, explain: "Always check the caller may access that object." },
        { q: "What does 429 mean?", options: ["Too Many Requests", "Not Found"], answer: 0, explain: "Rate limited; wait and retry." },
        { q: "What should an API test check besides the status code?", options: ["Headers, body values and side effects", "Nothing"], answer: 0, explain: "Status alone misses wrong data." },
        { q: "Why version an API?", options: ["To change it without breaking existing clients", "To make it faster"], answer: 0, explain: "Old clients keep working on the old version." }
    ]
};
