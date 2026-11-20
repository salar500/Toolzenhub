/* =========================================================
   ToolZen Hub
   Playwright path: intermediate and advanced lessons, and interview practice (original; checked against playwright.dev)
========================================================= */

export const lessons = [
    {
        id: "pw-actions-forms", title: "Actions and forms", level: "intermediate",
        objectives: ["Fill, select, check and press keys", "Write a complete form test", "Know what Playwright waits for before acting"],
        intro: "Actions are what a user does: click, fill, check, select, press keys, upload files. Each action first waits until the element is visible, stable, enabled and able to receive events, then acts, so a well-written test needs no manual waits.",
        blocks: [
            { type: "example", title: "Form actions", text: "await page.getByLabel('Email').fill('asha@example.com');\nawait page.getByLabel('Password').press('Enter');\nawait page.getByLabel('Sort').selectOption('price-asc');\nawait page.getByRole('checkbox', { name: 'Remember me' }).check();\nawait page.getByLabel('Upload').setInputFiles('invoice.pdf');" },
            { type: "codecheck", heading: "Your turn: a sign-in test", exercise: "pw-c-signin-form" }
        ],
        why: "Forms are where most business value and most defects are: sign-up, checkout, search. Reliable form tests are the backbone of a UI suite.",
        analogy: "Actions are the user's hands; auto-waiting is the patience to let the page finish moving before touching it.",
        mistakes: ["Using click() then type() where fill() is clearer.", "Adding waits before actions that already auto-wait.", "Selecting options by visible index instead of value or label."],
        check: [
            { q: "What does fill() do that typing letter by letter does not?", a: "It clears the field and sets the value in one action, firing the input events." },
            { q: "Name two conditions Playwright waits for before clicking.", a: "For example that the element is visible and enabled (also stable and receiving events)." }
        ],
        summary: "Use fill, selectOption, check, press and setInputFiles with good locators; trust auto-waiting instead of adding waits."
    },
    {
        id: "pw-navigation-waiting", title: "Navigation and waiting", level: "intermediate",
        objectives: ["Navigate and assert URLs", "Wait for responses and URLs when needed", "Avoid fixed timeouts"],
        intro: "Most waiting is automatic. When a test must wait for something that is not an element, such as a network response or a URL change, Playwright offers explicit waits that end as soon as the event happens, unlike fixed timeouts that always waste time or fail on slow days.",
        blocks: [
            { type: "example", title: "Waiting the right way", text: "await page.goto('/practice-labs/shoplite/');\nawait expect(page).toHaveURL(/shoplite/);\n\nconst response = page.waitForResponse('**/api/orders');\nawait page.getByRole('button', { name: 'Place order' }).click();\nawait response;             // resolves when the order request finishes\n\nawait page.waitForTimeout(3000); // avoid: fixed wait, slow and still flaky" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why start waitForResponse before the click?", options: ["The response could arrive before the wait starts and be missed", "It is faster to type"], answer: 0, explain: "Register the wait first, then trigger the action, then await the promise." },
                { q: "A page sometimes takes 4 seconds. Which is right?", options: ["waitForTimeout(5000)", "A web-first assertion on the expected result, with the default timeout"], answer: 1, explain: "The assertion finishes as soon as the result appears and fails clearly if it never does." }
            ] }
        ],
        why: "Fixed waits are the main cause of slow and flaky suites. Event-based waiting makes tests both faster and more reliable.",
        analogy: "Waiting for a response is waiting for the kettle to click; a fixed wait is guessing three minutes and hoping.",
        mistakes: ["waitForTimeout everywhere.", "Starting waitForResponse after the action.", "Asserting the URL with an exact string when a pattern is safer."],
        check: [
            { q: "What replaces most fixed waits?", a: "Auto-waiting actions and web-first assertions, plus waitForResponse or toHaveURL when needed." },
            { q: "Why is waitForTimeout flaky even when long?", a: "Timing varies between runs and machines; a fixed time is either wasted or too short." }
        ],
        summary: "Let actions and assertions wait automatically; when you need more, wait for a specific event (response, URL), never a fixed time."
    },
    {
        id: "pw-hooks-fixtures", title: "Hooks, fixtures and test structure", level: "intermediate",
        objectives: ["Group tests with test.describe", "Use beforeEach for shared setup", "Explain fixtures such as page and request"],
        intro: "Tests often share setup: open the shop, sign in. Hooks such as test.beforeEach run code before every test in a group. Fixtures are what Playwright gives each test: page, context, browser, request. Each test receives fresh fixtures, so tests stay isolated.",
        blocks: [
            { type: "example", title: "Shared setup with a hook", text: "test.describe('cart', () => {\n  test.beforeEach(async ({ page }) => {\n    await page.goto('/practice-labs/shoplite/');\n  });\n\n  test('adds a product', async ({ page }) => { /* ... */ });\n  test('removes a product', async ({ page }) => { /* ... */ });\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Does test B see the cart that test A filled?", options: ["Yes, they share a page", "No, each test gets a fresh page and context"], answer: 1, explain: "Isolation is the default: state does not leak between tests." },
                { q: "Where should signing in, needed by every test in a file, go?", options: ["In test.beforeEach (or a custom fixture / stored auth state)", "Copied into every test"], answer: 0, explain: "Shared setup belongs in a hook or fixture; Playwright can also reuse a saved signed-in state." }
            ] }
        ],
        why: "Good structure keeps suites readable and fast to change: setup lives in one place and every test stays independent.",
        analogy: "beforeEach is laying the table before each course; fixtures are the clean plates each guest gets.",
        mistakes: ["Tests that rely on the order they run in.", "Huge beforeAll blocks that hide what a test needs.", "Sharing a page between tests."],
        check: [
            { q: "Name two built-in fixtures.", a: "For example page and request (also context and browser)." },
            { q: "beforeEach or beforeAll for opening a fresh page per test?", a: "beforeEach (and each test already gets its own page fixture)." }
        ],
        summary: "Group tests with describe, put shared setup in hooks or fixtures and rely on fresh, isolated fixtures for each test."
    },
    {
        id: "pw-page-objects", title: "The Page Object Model", level: "intermediate",
        objectives: ["Explain what a page object is for", "Write a page object with methods", "Keep assertions in tests"],
        intro: "A page object is a class that knows how to use one screen: its locators and its actions. Tests call methods like cart.applyCoupon('SAVE10') instead of repeating clicks. When the screen changes, only the page object changes.",
        blocks: [
            { type: "codecheck", heading: "Your turn: build a page object", exercise: "pw-c-page-object" }
        ],
        why: "Large suites without page objects become hard to maintain: one renamed button can break fifty tests. Page objects are a standard interview topic.",
        analogy: "A page object is a remote control: tests press 'apply coupon' without knowing the wiring behind the button.",
        mistakes: ["Putting assertions inside page objects, hiding the expected result.", "One giant page object for the whole site.", "Exposing raw locators everywhere instead of meaningful methods."],
        check: [
            { q: "What changes when a button is renamed, with page objects?", a: "Only the page object's locator, not every test." },
            { q: "Where should assertions live?", a: "In the tests, where the expected result is visible to readers." }
        ],
        summary: "Page objects wrap a screen's locators and actions in methods, keeping tests short and maintenance in one place."
    },
    {
        id: "pw-network-api", title: "Network mocking and API testing", level: "intermediate",
        objectives: ["Mock responses with page.route", "Test an API with the request fixture", "Choose between UI and API tests"],
        intro: "page.route intercepts the browser's requests, so a test can return a prepared response: an empty list, an error or slow data. The request fixture sends HTTP requests directly, which makes API tests fast and lets UI tests prepare data without clicking.",
        blocks: [
            { type: "example", title: "An API test", text: "test('products API lists items', async ({ request }) => {\n  const response = await request.get('/api/products');\n  expect(response.status()).toBe(200);\n  const products = await response.json();\n  expect(products.length).toBeGreaterThan(0);\n});" },
            { type: "codecheck", heading: "Your turn: mock the network", exercise: "pw-c-mock-network" }
        ],
        why: "Mocking makes rare situations testable and UI tests independent of back ends; API tests check business rules in milliseconds.",
        analogy: "Mocking is a stand-in actor for rehearsal: the scene can be practised before the real actor arrives.",
        mistakes: ["Registering the route after the request was sent.", "Mocking so much that the test no longer tests anything real.", "Testing through the UI what an API test checks faster."],
        check: [
            { q: "Which fixture sends HTTP requests without a browser page?", a: "request." },
            { q: "Give a case where mocking helps.", a: "Showing how the page handles a server error or an empty list, which is hard to produce on demand." }
        ],
        summary: "Use page.route to control responses and the request fixture for direct API tests; register mocks before the page makes the request."
    },
    {
        id: "pw-debugging-flaky", title: "Debugging and fixing flaky tests", level: "advanced",
        objectives: ["Use UI mode, the trace viewer and the inspector", "Recognise common causes of flakiness", "Fix a flaky test properly"],
        intro: "A flaky test passes and fails without code changes. Causes are usually timing (fixed waits, one-off reads), ambiguous or positional locators, shared state between tests and unstable test data. Playwright's trace viewer shows each action with screenshots, DOM snapshots and network calls, so you can see what really happened.",
        blocks: [
            { type: "example", title: "Debugging commands", text: "npx playwright test --ui              # run and watch tests step by step\nnpx playwright test --debug           # step through with the inspector\nnpx playwright show-trace trace.zip   # open a recorded trace\n// in playwright.config.ts: use: { trace: 'on-first-retry' }" },
            { type: "codecheck", heading: "Your turn: fix a flaky test", exercise: "pw-c-fix-flaky" }
        ],
        why: "Flaky tests destroy trust in a suite: people stop believing red builds. Fixing the cause, not adding retries, is a key automation skill.",
        analogy: "A flaky test is a smoke alarm that goes off at random: soon everyone ignores it, including when there is a fire.",
        mistakes: ["Adding retries or longer timeouts instead of fixing the cause.", "Positional locators such as nth(6).", "Tests that share data and run in parallel."],
        check: [
            { q: "What does the trace viewer show?", a: "Each action with before and after snapshots, console output and network requests." },
            { q: "Name two typical causes of flakiness.", a: "Fixed waits and one-off reads; ambiguous or positional locators; shared state; unstable data." }
        ],
        summary: "Find the cause with UI mode and traces, then remove timing assumptions, positional locators and shared state; retries only hide flakiness."
    },
    {
        id: "pw-config-parallel", title: "Configuration, projects and parallel runs", level: "advanced",
        objectives: ["Read playwright.config.ts", "Run across browsers with projects", "Understand workers and parallelism"],
        intro: "playwright.config.ts sets the base URL, timeouts, retries, reporters and projects. A project is a named configuration, such as Chromium desktop or WebKit on an iPhone viewport. Tests run in parallel in worker processes, which is why tests must be independent.",
        blocks: [
            { type: "example", title: "Part of a configuration", text: "export default defineConfig({\n  use: { baseURL: 'https://example.com', trace: 'on-first-retry' },\n  retries: process.env.CI ? 2 : 0,\n  projects: [\n    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },\n    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } }\n  ]\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why do retries appear only in CI here?", options: ["To collect a trace on the first retry in CI while keeping local runs strict", "Retries are illegal locally"], answer: 0, explain: "Locally you want to see failures at once; in CI a retry with a trace helps diagnose rare failures (which still need fixing)." },
                { q: "What does a project let you do?", options: ["Run the same tests with a different browser or device configuration", "Create a new repository"], answer: 0, explain: "Projects multiply coverage across browsers and devices without changing tests." }
            ] }
        ],
        why: "Configuration decides how fast, how wide and how debuggable a suite is. Teams expect automation engineers to own it.",
        analogy: "The configuration is the production schedule: which stages, in which theatres, with how many crews at once.",
        mistakes: ["Hard-coding URLs in tests instead of baseURL.", "Turning retries on to hide flakiness.", "Writing tests that cannot run in parallel."],
        check: [
            { q: "Where is the base URL set?", a: "In use.baseURL in playwright.config.ts; tests then call page.goto('/path')." },
            { q: "Why must tests be independent for parallel runs?", a: "Workers run tests at the same time, in any order; shared state would make results depend on timing." }
        ],
        summary: "Use the config for base URL, timeouts, retries, reporters and projects; independent tests let workers run them in parallel across browsers and devices."
    },
    {
        id: "pw-reports-ci", title: "Reports and running in CI", level: "advanced",
        objectives: ["Read the HTML report", "Run Playwright in a CI pipeline", "Keep artifacts for failures"],
        intro: "In continuous integration, tests run automatically on every change. Playwright's init can add a GitHub Actions workflow that installs browsers, runs the tests and uploads the HTML report and traces as artifacts, so a failure can be investigated without rerunning it locally.",
        blocks: [
            { type: "order", heading: "Your turn: a CI job's steps", prompt: "Put the steps of a typical Playwright CI job in order.", items: ["Check out the code", "Install dependencies (npm ci)", "Install the browsers (npx playwright install --with-deps)", "Run the tests (npx playwright test)", "Upload the report and traces as artifacts"], explain: "Code, dependencies, browsers, tests, then artifacts (uploaded even when tests fail)." }
        ],
        why: "Automation pays off when it runs on every change without anyone remembering to start it, and when its failures can be diagnosed from the artifacts.",
        analogy: "CI is a night guard who checks every door each time someone comes in, and leaves a written report.",
        mistakes: ["Not uploading reports when the job fails.", "Running every browser on every commit when a smaller set would do.", "Ignoring failing CI runs."],
        check: [
            { q: "Why upload the report even when tests fail?", a: "Failures are exactly when you need the report and traces to diagnose." },
            { q: "What installs the browsers in CI?", a: "npx playwright install --with-deps." }
        ],
        summary: "Run tests automatically in CI: install dependencies and browsers, run the suite and keep the HTML report and traces as artifacts."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Interviewers often follow up with 'why', so read the reasoning, not only the answer.",
    description: "12 Playwright interview questions with explained answers: locators, auto-waiting, assertions, fixtures, page objects, flaky tests and CI.",
    coding: [],
    quiz: [
        { q: "Which locator does Playwright recommend first?", options: ["CSS selectors", "getByRole with an accessible name", "XPath"], answer: 1, explain: "Role-based locators reflect how users and assistive technology see the page and survive markup changes." },
        { q: "What is strict mode?", options: ["Actions fail if a locator matches more than one element", "TypeScript strict compilation"], answer: 0, explain: "It prevents acting on the wrong element by accident." },
        { q: "What is auto-waiting?", options: ["Playwright waits for elements to be actionable before acting", "A fixed 30-second wait"], answer: 0, explain: "Visible, stable, enabled and receiving events, before each action." },
        { q: "Web-first assertion versus a plain assertion?", options: ["Web-first assertions retry until the condition holds or time out", "No difference"], answer: 0, explain: "expect(locator).toHaveText retries; expect(value).toBe compares once." },
        { q: "How do you share sign-in across tests efficiently?", options: ["Store the signed-in state once and reuse it (storageState), or a fixture", "Sign in through the UI in every test"], answer: 0, explain: "Reusing authenticated state saves time while keeping tests isolated." },
        { q: "What is a fixture?", options: ["An object Playwright prepares for a test, such as page or request", "A broken test"], answer: 0, explain: "Fixtures give each test isolated resources; custom fixtures add your own." },
        { q: "Why use the Page Object Model?", options: ["To keep locators and actions for a screen in one place", "To make tests run faster"], answer: 0, explain: "It reduces duplication and makes changes cheaper." },
        { q: "A test is flaky. What is the wrong first fix?", options: ["Increase retries until it passes", "Read the trace and remove the timing or locator cause"], answer: 0, explain: "Retries hide the problem; find and fix the cause." },
        { q: "How do you test what the page shows when the API returns an error?", options: ["Mock the request with page.route and fulfil it with an error response", "Wait for the real server to fail"], answer: 0, explain: "Mocking makes rare responses reproducible." },
        { q: "What does a project in playwright.config.ts represent?", options: ["A named configuration such as a browser or device", "A Git repository"], answer: 0, explain: "Projects run the same tests across browsers and devices." },
        { q: "Why must tests be independent?", options: ["They run in parallel workers in any order", "It is only a style preference"], answer: 0, explain: "Shared state makes results depend on order and timing." },
        { q: "What should a CI job keep when tests fail?", options: ["The HTML report and traces as artifacts", "Nothing"], answer: 0, explain: "Artifacts allow diagnosis without rerunning locally." }
    ]
};
