/* =========================================================
   ToolZen Hub
   Specialised Testing path: lessons (original to this site). Practice reuses the platform's engines: the in-page mock
   ShopLite API (apitask), real SQLite on the practice tables (sqlplay), the script-free HTML playground (webplay) and the
   structured writing labs. WCAG references are to WCAG 2.2.
========================================================= */

export const lessons = [
    { id: "sp-integration", title: "Integration testing", level: "intermediate", prerequisite: "The Manual Software Testing path up to test levels.",
        objectives: ["Explain what integration testing checks", "Compare big-bang and incremental integration", "Use stubs and drivers"],
        intro: "Integration testing checks that components work together: the cart service with the pricing service, the app with the payment gateway, the API with the database. Incremental integration (top-down or bottom-up) adds components one at a time, using stubs (stand-ins for components that are called) and drivers (stand-ins for callers), so failures are easy to locate. Big-bang integration joins everything at once and makes failures hard to trace.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Checkout works alone and payments works alone, but the order total sent to the gateway is in rupees while the gateway expects paise. Which level finds this?", options: ["Integration testing", "Unit testing"], answer: 0, explain: "Each side is correct alone; the interface between them is wrong." },
                { q: "The tax service is not ready. How do you test the cart that calls it?", options: ["Use a stub that returns fixed tax values", "Wait for the tax service"], answer: 0, explain: "Stubs replace components that are called." },
                { q: "Why avoid big-bang integration?", options: ["When it fails, the cause could be anywhere", "It is too fast"], answer: 0, explain: "Incremental integration localises failures." }
            ] }
        ],
        why: "Many serious defects live at interfaces: units, formats, timeouts and assumptions that differ between teams.",
        analogy: "Integration testing checks that the plug fits the socket, not just that each works on its own.",
        mistakes: ["Testing only components in isolation.", "Big-bang integration late in the project.", "Stubs that never fail, hiding error handling."],
        check: [{ q: "Stub versus driver?", a: "A stub replaces a called component; a driver replaces a caller." }, { q: "What do integration tests focus on?", a: "Interfaces and interactions between components." }],
        summary: "Integrate incrementally with stubs and drivers, and focus tests on the interfaces where assumptions differ." },
    { id: "sp-api-testing", title: "API testing for testers", level: "intermediate",
        objectives: ["Design API test cases from a specification", "Test status codes, bodies and errors", "Explore an API by hand"],
        intro: "API testing applies test design to requests: valid inputs, boundaries, missing and wrong-type fields, authentication, not-found ids and wrong methods. Each test checks the status code, the important headers, the body and any side effect. Exploring the API by hand first shows how it really behaves.",
        blocks: [
            { type: "apitask", heading: "Your turn: filter the catalogue", task: "api-t-filter" },
            { type: "apitask", heading: "Your turn: a not-found case", task: "api-t-404" },
            { type: "quiz", questions: [
                { q: "Which set best tests POST /api/cart/items validation of qty (1 to 10)?", options: ["0, 1, 10, 11, 2.5, \"2\", missing qty", "2 and 3"], answer: 0, explain: "Boundaries, wrong types and missing fields." }
            ] }
        ],
        why: "API testing finds business-rule defects early and is now expected of most testers.",
        analogy: "API testing is checking the kitchen's orders directly instead of watching what arrives at the table.",
        mistakes: ["Checking only the status code.", "Only valid inputs.", "Ignoring headers such as Location and Content-Type."],
        check: [{ q: "Name four things an API test checks.", a: "Status, headers, body and side effects." }, { q: "Which test design techniques apply to APIs?", a: "Equivalence partitions, boundaries, decision tables and error guessing." }],
        summary: "Design API tests with the usual techniques and check status, headers, body and side effects; the API Test Automation path automates them." },
    { id: "sp-db-testing", title: "Database testing for testers", level: "intermediate",
        objectives: ["Verify data changes after actions", "Write integrity check queries", "Check data after a defect fix"],
        intro: "After an action in the application, testers often check the database: was the order stored with the right status and total, did stock go down, did no orphan rows appear? Read-only SQL queries make these checks precise and repeatable. Never change production data while testing.",
        blocks: [
            { type: "sqlplay", heading: "Try it: verify orders by status", text: "A quick check after a test run: how many orders are in each status, and are any statuses outside the allowed list?", sql: "SELECT status, COUNT(*) AS orders\nFROM orders\nGROUP BY status\nORDER BY orders DESC;\n\nSELECT id, status FROM orders\nWHERE status NOT IN ('delivered', 'shipped', 'pending', 'cancelled');", expect: "rows" },
            { type: "sqlplay", heading: "Try it: order totals from the items", text: "Recompute each order's total from its items and products, the kind of check that catches pricing defects.", sql: "SELECT o.id, SUM(oi.quantity * p.price) AS items_total\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nGROUP BY o.id\nORDER BY items_total DESC\nLIMIT 5;", expect: "rows" }
        ],
        why: "The interface can look right while the stored data is wrong; database checks find those defects.",
        analogy: "Checking the database is looking in the warehouse ledger, not just at the receipt the customer got.",
        mistakes: ["Writing to shared databases while testing.", "Checking the UI only.", "Ad hoc queries nobody can repeat."],
        check: [{ q: "Why use read-only queries when testing?", a: "To observe without changing data others rely on." }, { q: "What does a GROUP BY status check show?", a: "How rows are distributed and whether unexpected values exist." }],
        summary: "Verify stored results with precise, repeatable read-only SQL; the Database Design and Testing path goes deeper." },
    { id: "sp-accessibility", title: "Accessibility testing", level: "intermediate",
        objectives: ["Test with the keyboard and a screen reader", "Check common WCAG 2.2 criteria", "Combine automated and manual checks"],
        intro: "Accessibility testing checks that people using keyboards, screen readers, zoom or voice control can use the product. Start with the keyboard: can you reach and operate everything with Tab, Enter and Space, and is the focus visible? Then check names and labels, headings, contrast (4.5:1 for normal text), text alternatives and error messages. Automated tools such as axe find about a third of issues; the rest needs manual checks.",
        blocks: [
            { type: "webplay", heading: "Your turn: fix an inaccessible control", exercise: "web-x-accessible-button" },
            { type: "webplay", heading: "Your turn: a labelled form", exercise: "web-x-form" },
            { type: "quiz", questions: [
                { q: "Tabbing through checkout, the focus disappears on the Pay button. Which issue is this?", options: ["Focus not visible (WCAG 2.4.7)", "Colour contrast"], answer: 0, explain: "Keyboard users cannot see where they are." },
                { q: "An error says only 'Invalid input' in red. What should a tester report?", options: ["The error does not identify the field or how to fix it, and relies on colour", "Nothing"], answer: 0, explain: "Errors must be described in text (WCAG 3.3.1, 3.3.3)." }
            ] }
        ],
        why: "Accessibility is a legal duty in many places and affects a large share of users; it is a fast-growing testing specialism.",
        analogy: "Accessibility testing is trying the building in a wheelchair, not just reading the plans.",
        mistakes: ["Relying only on automated scanners.", "Never testing with the keyboard.", "Placeholders as labels."],
        check: [{ q: "First manual accessibility check?", a: "Use the whole flow with the keyboard only." }, { q: "Minimum contrast for normal text?", a: "4.5:1 (WCAG AA)." }],
        summary: "Test with the keyboard and a screen reader, check names, labels, focus, contrast and errors, and use automated tools as a first pass." },
    { id: "sp-uat", title: "User acceptance testing", level: "intermediate",
        objectives: ["Explain the purpose of UAT", "Plan UAT with business users", "Define entry and exit criteria"],
        intro: "User acceptance testing confirms that the system meets business needs in realistic use, performed by or with the people who will use it. It is not a repeat of system testing: it uses real workflows and data, starts when entry criteria are met (system testing complete, no open critical defects) and ends with a sign-off decision against agreed exit criteria.",
        blocks: [
            { type: "order", heading: "Your turn: organise UAT", prompt: "Order the steps of a UAT cycle for ShopLite's new returns flow.", items: ["Agree acceptance criteria and exit criteria with the business", "Prepare realistic scenarios and test data", "Confirm entry criteria: system testing done, no open critical defects", "Business users run the scenarios with testers supporting", "Triage findings and retest fixes", "Business owner signs off or rejects against the exit criteria"], explain: "Agree what acceptance means, prepare, check readiness, execute, fix, decide." },
            { type: "quiz", questions: [
                { q: "Who should perform UAT?", options: ["Business users, supported by testers", "Only the developers"], answer: 0, explain: "It checks fitness for their needs." }
            ] }
        ],
        why: "A system can pass every technical test and still fail the business; UAT is the last chance to find out before release.",
        analogy: "UAT is the customer's test drive before signing for the car.",
        mistakes: ["UAT as a second system test.", "No agreed exit criteria.", "Starting UAT with critical defects still open."],
        check: [{ q: "What are entry criteria for UAT?", a: "Conditions to start, such as system testing complete and no critical open defects." }, { q: "How does UAT end?", a: "With a sign-off decision against exit criteria." }],
        summary: "Run UAT with business users on real workflows, with agreed entry and exit criteria and a clear sign-off." },
    { id: "sp-performance", title: "Performance testing basics", level: "advanced",
        objectives: ["Tell load, stress, spike and soak tests apart", "Read response-time percentiles", "Define performance acceptance criteria"],
        intro: "Performance testing measures speed and stability under load. Load tests check expected traffic, stress tests push beyond it to find the breaking point, spike tests apply sudden surges and soak tests run for hours to reveal leaks. Report percentiles (p95, p99) rather than averages, together with throughput and error rate, against agreed targets. Tools include k6, JMeter and Gatling.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Memory grows slowly until the server crashes after six hours. Which test finds this?", options: ["Soak (endurance) test", "Spike test"], answer: 0, explain: "Long runs reveal leaks." },
                { q: "Average response time is 300 ms, p99 is 4 s. What does it mean?", options: ["1% of users wait 4 s or more; the average hides it", "Everything is fine"], answer: 0, explain: "Percentiles show the tail users feel." },
                { q: "A good performance criterion is:", options: ["p95 checkout under 1.5 s at 200 requests per second with under 1% errors", "The site should be fast"], answer: 0, explain: "Measurable load, percentile and error rate." }
            ] }
        ],
        why: "Slow or failing systems under real traffic lose customers, especially during sales.",
        analogy: "A load test is a rehearsal with a full audience; a stress test keeps adding people until the doors jam.",
        mistakes: ["Reporting only averages.", "Testing on a tiny environment and extrapolating.", "No agreed targets."],
        check: [{ q: "Load versus stress test?", a: "Load tests expected traffic; stress tests beyond it to find limits." }, { q: "Why percentiles?", a: "They show the slow experiences averages hide." }],
        summary: "Choose load, stress, spike or soak tests for the risk, and judge results by percentiles, throughput and errors against targets." },
    { id: "sp-rca-defects", title: "Defect management and root-cause analysis", level: "advanced",
        objectives: ["Triage defects by severity and priority", "Run a blameless root-cause analysis", "Turn causes into preventive actions"],
        intro: "Defect management keeps bugs moving: triage assigns severity (impact) and priority (urgency), owners and target releases, and trends show where quality problems cluster. For serious escapes, root-cause analysis asks why repeatedly (the five whys) until it reaches a process or system cause, then records preventive actions with owners. Blameless wording keeps people honest about what happened.",
        blocks: [
            { type: "write", heading: "Your turn: write a root-cause analysis", exercise: "st-w-rca" },
            { type: "quiz", questions: [
                { q: "A typo on the About page and a crash at checkout arrive together. Severity order?", options: ["Checkout crash high, typo low", "Both high"], answer: 0, explain: "Severity measures impact; priority may still be adjusted by business timing." }
            ] }
        ],
        why: "Fixing the cause, not just the bug, is how teams stop the same class of defect escaping again.",
        analogy: "Root-cause analysis is finding the leaking pipe, not mopping the floor every morning.",
        mistakes: ["Stopping at 'human error'.", "Actions with no owner.", "Severity and priority confused."],
        check: [{ q: "Severity versus priority?", a: "Severity is the impact; priority is how soon to fix." }, { q: "What should a root cause be?", a: "A process or system gap that can be changed." }],
        summary: "Triage by severity and priority, analyse serious escapes to a system cause and assign preventive actions with owners." },
    { id: "sp-mobile", title: "Mobile and cross-device testing", level: "advanced",
        objectives: ["Plan device and browser coverage", "Test mobile-specific conditions", "Use emulators and real devices appropriately"],
        intro: "Most ShopLite visits are on phones. Mobile testing covers small screens and orientation, touch targets (at least 24 by 24 CSS pixels in WCAG 2.2, ideally larger), slow and interrupted networks, app backgrounding, permissions, keyboards for different input types and a sensible spread of devices and browsers chosen from analytics. Emulators are fast for layout; real devices find performance, touch and hardware issues.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "How should you choose which devices to test?", options: ["From real usage data, covering the main OS versions, browsers and screen sizes", "Only the newest phone"], answer: 0, explain: "Coverage should follow your users." },
                { q: "Payment fails when the network drops for two seconds. Which test finds it?", options: ["Interrupted or slow network testing", "Colour testing"], answer: 0, explain: "Throttle and drop the network deliberately." },
                { q: "The email field shows a numeric keypad. What is likely wrong?", options: ["The input type or inputmode is wrong", "Nothing"], answer: 0, explain: "type=\"email\" gives the right keyboard." }
            ] }
        ],
        why: "Phone users meet conditions desktops never do; ignoring them loses most customers.",
        analogy: "Mobile testing is checking the shop works for customers walking, on a crowded train, with one hand.",
        mistakes: ["Testing only on desktop width.", "Only fast Wi-Fi.", "Tiny touch targets."],
        check: [{ q: "Emulator or real device for touch and performance?", a: "Real devices." }, { q: "Name two mobile-specific conditions.", a: "For example interrupted networks, orientation changes, backgrounding and permissions." }],
        summary: "Choose devices from usage data, test small screens, touch, keyboards and poor networks, and use real devices for performance and touch." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. These questions often come up for experienced tester roles.",
    description: "10 specialised testing interview questions with explained answers: integration, API, database, accessibility, UAT, performance, root cause and mobile.",
    coding: [],
    quiz: [
        { q: "Stub versus driver?", options: ["Stub replaces a callee; driver replaces a caller", "The same"], answer: 0, explain: "Incremental integration." },
        { q: "What does an API test check?", options: ["Status, headers, body and side effects", "Only status"], answer: 0, explain: "All four." },
        { q: "Why check the database in testing?", options: ["The UI can look right while stored data is wrong", "To speed up tests"], answer: 0, explain: "Verify the outcome." },
        { q: "First accessibility check?", options: ["Keyboard-only use", "Font choice"], answer: 0, explain: "Reach and operate everything." },
        { q: "Who performs UAT?", options: ["Business users", "Only developers"], answer: 0, explain: "Fitness for purpose." },
        { q: "Load versus soak test?", options: ["Expected traffic versus long duration", "The same"], answer: 0, explain: "Soak finds leaks." },
        { q: "Why p95 over averages?", options: ["It shows the slow tail users feel", "It is smaller"], answer: 0, explain: "Averages hide outliers." },
        { q: "Severity versus priority?", options: ["Impact versus urgency", "The same"], answer: 0, explain: "Set separately." },
        { q: "What is a blameless RCA?", options: ["Finding system causes, not culprits", "Skipping the analysis"], answer: 0, explain: "Better information, real fixes." },
        { q: "How choose mobile devices?", options: ["From usage analytics", "At random"], answer: 0, explain: "Follow your users." }
    ]
};
