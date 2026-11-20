/* =========================================================
   ToolZen Hub
   Playwright with TypeScript path: lessons (build-time content, original to this site; checked against the official
   Playwright documentation, playwright.dev). Code shown is real Playwright code; in-page practice uses a labelled teaching
   evaluator on ShopLite, and real runs happen in a local project, as each lesson states.
========================================================= */

export const lessons = [
    {
        id: "pw-what-is-automation", title: "What test automation is (and is not)", level: "beginner", prerequisite: "Manual testing basics: test cases and expected results (Manual Software Testing, module 3).",
        objectives: ["Explain what automated tests are good and bad at", "Place UI tests in the test pyramid", "Decide which tests to automate first"],
        intro: "An automated test is a program that drives the software and checks results, so the same check can run on every build in seconds. Automation does not replace testers' thinking: it repeats known checks reliably, which frees people for exploratory work.",
        blocks: [
            { type: "list", heading: "The test pyramid", items: ["Many fast unit tests at the base, written by developers.", "Fewer integration and API tests in the middle.", "A small number of end-to-end UI tests at the top: slow and more fragile, but closest to what users do.", "Playwright is mostly used at the top (UI) and for API tests."] },
            { type: "quiz", heading: "Your turn: automate first?", questions: [
                { q: "Which test is the best first candidate for automation?", options: ["A one-off check of a page that will be redesigned next week", "The checkout happy path, run on every build", "A usability review of the colours"], answer: 1, explain: "Stable, frequently repeated, business-critical checks pay back automation fastest." },
                { q: "Can automation judge whether a page is pleasant to use?", options: ["Yes", "No; that needs human judgement"], answer: 1, explain: "Automation checks what it is told to check; usability and exploration need people." }
            ] }
        ],
        why: "Teams release often; nobody can rerun hundreds of manual checks every day. Automation makes regression testing fast and repeatable, and automation skills are among the most requested in testing jobs.",
        analogy: "Automation is a dishwasher: brilliant at doing the same job the same way every time, useless at deciding what to cook.",
        mistakes: ["Automating everything through the UI, making a slow, fragile suite.", "Automating unstable features that change weekly.", "Treating a green run as proof of quality."],
        check: [
            { q: "Why keep few UI tests at the top of the pyramid?", a: "They are slower and more fragile than unit and API tests, so they cover only the key user journeys." },
            { q: "What makes a test a good automation candidate?", a: "It is stable, repeated often, valuable and has a clear expected result." }
        ],
        summary: "Automation repeats known checks quickly and reliably; choose stable, valuable, frequently run checks, keep UI tests few, and leave judgement and exploration to people."
    },
    {
        id: "pw-why-playwright", title: "Playwright and how it works", level: "beginner",
        objectives: ["Describe Playwright's browser, context and page", "Explain auto-waiting", "Name the debugging tools Playwright provides"],
        intro: "Playwright is an open-source framework from Microsoft that drives Chromium, Firefox and WebKit through one API. A test launches a browser, opens an isolated browser context (like a fresh profile) and works with pages in it. Before acting on an element, Playwright waits until it is attached, visible, stable and enabled, which removes most of the 'sleep' calls older tools needed.",
        blocks: [
            { type: "example", title: "A complete Playwright test (TypeScript)", text: "import { test, expect } from '@playwright/test';\n\ntest('search finds notebooks', async ({ page }) => {\n  await page.goto('https://example.com/shoplite/');\n  await page.getByLabel('Search').fill('notebook');\n  await page.getByRole('button', { name: 'Show products' }).click();\n  await expect(page.getByText('2 products')).toBeVisible();\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "What does a browser context give each test?", options: ["Shared cookies with other tests", "An isolated session, like a fresh browser profile", "A faster CPU"], answer: 1, explain: "Isolation means tests do not affect each other through cookies or storage." },
                { q: "Why does Playwright rarely need sleep()?", options: ["It auto-waits for elements to be actionable and assertions to pass", "It runs slowly by default"], answer: 0, explain: "Actions wait for actionability; web-first assertions retry until they pass or time out." }
            ] }
        ],
        why: "Playwright is now the most downloaded browser-testing framework on npm and appears in many automation job descriptions. Knowing how it works explains why tests are reliable or flaky.",
        analogy: "A browser context is a fresh hotel room for each guest: same building, nothing left behind by the previous guest.",
        mistakes: ["Adding fixed waits (waitForTimeout) instead of trusting auto-waiting.", "Sharing state between tests.", "Ignoring the trace viewer when a test fails."],
        check: [
            { q: "Which three browser engines does Playwright drive?", a: "Chromium, Firefox and WebKit." },
            { q: "What is auto-waiting?", a: "Before an action, Playwright waits until the element is attached, visible, stable, enabled and receiving events." }
        ],
        summary: "Playwright drives three browser engines through one API, isolates tests with browser contexts and waits automatically, which makes tests faster and less flaky."
    },
    {
        id: "pw-setup", title: "Setting up and running your first test", level: "beginner",
        objectives: ["Create a Playwright project", "Run tests and open the HTML report", "Understand the project structure"],
        intro: "Playwright runs on your own computer with Node.js. One command creates a project with an example test, a configuration file and the browsers. This lesson lists the steps; run them locally, because a web page cannot install software or launch real browsers.",
        blocks: [
            { type: "example", title: "Commands (run in a terminal with Node.js 18 or later)", text: "npm init playwright@latest        # answer: TypeScript, tests folder, add a GitHub Actions workflow if you want\nnpx playwright test               # runs all tests in all configured browsers\nnpx playwright test --ui          # opens UI mode to run and watch tests\nnpx playwright show-report        # opens the HTML report" },
            { type: "order", heading: "Your turn", prompt: "Put the first-run steps in order.", items: ["Install Node.js", "Run npm init playwright@latest", "Write or open a test in the tests folder", "Run npx playwright test", "Open the report with npx playwright show-report"], explain: "Node.js first, then the project, then a test, a run and the report." }
        ],
        why: "Every automation job starts with a working project. Knowing what each file does (playwright.config.ts, tests/, the report) saves hours when something breaks.",
        analogy: "Setting up Playwright is like setting up a workshop: install the power (Node.js), unpack the tools (init), then start the first job.",
        mistakes: ["Using an old Node.js version.", "Running tests without reading the HTML report on failure.", "Committing node_modules to the repository."],
        check: [
            { q: "Which file holds browsers, timeouts and base URL settings?", a: "playwright.config.ts." },
            { q: "Can this web page run your Playwright tests?", a: "No. Playwright runs locally (or in CI) with Node.js; these lessons practise the code and the locators in the browser." }
        ],
        summary: "Create a project with npm init playwright@latest, run tests with npx playwright test, debug with --ui and read results with show-report, all on your own machine."
    },
    {
        id: "pw-typescript", title: "Just enough TypeScript for tests", level: "beginner",
        objectives: ["Read async/await test code", "Use const, strings, arrays and objects in tests", "Know why every Playwright action is awaited"],
        intro: "Playwright tests are usually written in TypeScript, JavaScript with types. You need a small part of it: variables, strings, functions, objects and, above all, async and await, because every browser action takes time and returns a promise.",
        blocks: [
            { type: "example", title: "The pieces you will meet", text: "const product = 'Desk Lamp';                 // a constant string\nconst prices: number[] = [45, 60, 90];      // an array of numbers\nconst user = { email: 'asha@example.com' };  // an object\n\ntest('adds a product', async ({ page }) => { // an async test function\n  await page.getByRole('button', { name: 'Add to cart' }).first().click(); // wait for it\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "What happens if you forget await before page.click(...)?", options: ["Nothing; it is optional", "The next line may run before the click finishes, causing flaky or wrong tests", "TypeScript always refuses to compile"], answer: 1, explain: "The action returns a promise; without await the test does not wait for it. Linters and Playwright's checks help catch this." },
                { q: "Which line declares a value that cannot be reassigned?", options: ["let total = 0;", "const baseUrl = '/shop';", "var x = 1;"], answer: 1, explain: "const cannot be reassigned; prefer it unless the value must change." }
            ] }
        ],
        why: "Most automation failures for beginners come from missing awaits and misunderstood async code, not from Playwright itself.",
        analogy: "await is saying 'wait until the kettle has boiled' before pouring; without it you pour cold water.",
        mistakes: ["Forgetting await.", "Using let everywhere instead of const.", "Copying JavaScript-only examples into TypeScript without types where needed."],
        check: [
            { q: "Why are Playwright test functions declared async?", a: "So they can await browser actions, which complete over time." },
            { q: "What type is [45, 60, 90] in TypeScript?", a: "number[] (an array of numbers)." }
        ],
        summary: "Use const, simple types, objects and especially async/await: every Playwright action and web-first assertion must be awaited."
    },
    {
        id: "pw-locators", title: "Locators: finding elements like a user", level: "beginner",
        objectives: ["Choose user-facing locators: getByRole, getByLabel, getByText", "Satisfy strict mode with exactly one match", "Narrow a locator with filter, first or a name"],
        intro: "A locator describes how to find an element. Playwright recommends locating elements the way users and assistive technology perceive them: by role and accessible name, by label or by visible text, and only then by test ids or CSS. Actions are strict: if a locator matches more than one element, Playwright refuses to act.",
        blocks: [
            { type: "locator", heading: "Your turn: find elements in ShopLite", screen: "#/signin", text: "Type a locator for each task and press Find it. Matches are outlined in ShopLite. A task is solved when exactly one element, the right one, matches.", tasks: [
                { prompt: "The Email field on the sign-in screen.", screen: "#/signin", target: "#sl-email", hint: "Fields are best found by their label.", model: "page.getByLabel('Email')" },
                { prompt: "The Sign in button (not the Sign in link in the header).", screen: "#/signin", target: "form button[type=submit]", hint: "Use the button role and its name; the header link has the link role.", model: "page.getByRole('button', { name: 'Sign in' })" },
                { prompt: "On the shop page, the search box.", screen: "#/", target: "#sl-search", hint: "A search input has the searchbox role; it also has a label.", model: "page.getByRole('searchbox')" },
                { prompt: "The Add to cart button of the LED Desk Lamp (there are 24 such buttons).", screen: "#/", target: "[data-testid=add-7]", hint: "Find the product's list item first, filter it by text, then the button inside.", model: "page.getByRole('listitem').filter({ hasText: 'LED Desk Lamp' }).getByRole('button', { name: 'Add to cart' })" },
                { prompt: "The Requirements link in the navigation.", screen: "#/", target: "nav a[href='#/requirements']", hint: "Links have the link role.", model: "page.getByRole('link', { name: 'Requirements' })" }
            ] }
        ],
        why: "Most flaky UI tests are caused by brittle locators. User-facing locators keep working when CSS classes and layout change, and they nudge the application towards being accessible.",
        analogy: "Finding a button by its role and name is like finding a shop by its sign, not by counting doors from the corner.",
        mistakes: ["Using long CSS or XPath paths copied from developer tools.", "Using first() to hide an ambiguous locator.", "Matching text that changes (prices, dates) without care."],
        check: [
            { q: "What does strict mode do?", a: "An action fails if the locator matches more than one element, so tests cannot act on the wrong element by accident." },
            { q: "Which locator does Playwright recommend first?", a: "getByRole with an accessible name, followed by getByLabel, getByText and others; test ids and CSS last." }
        ],
        summary: "Prefer user-facing locators (role and name, label, text); make each match exactly one element; narrow with names, exact matching and filters."
    },
    {
        id: "pw-assertions", title: "Web-first assertions", level: "beginner",
        objectives: ["Use expect with locators", "Explain why web-first assertions retry", "Choose the right matcher"],
        intro: "An assertion states what must be true. Playwright's web-first assertions, such as await expect(locator).toBeVisible(), keep retrying until the condition holds or a timeout passes, so they wait for the page instead of failing on a moment-by-moment snapshot.",
        blocks: [
            { type: "example", title: "Common matchers", text: "await expect(page.getByText('Order SL-1004 placed')).toBeVisible();\nawait expect(page.getByTestId('delivery')).toHaveText('Free');\nawait expect(page).toHaveURL(/#\\/orders/);\nawait expect(page.getByRole('listitem')).toHaveCount(24);\nawait expect(page.getByLabel('Email')).toBeEmpty();" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which assertion retries until the text appears?", options: ["expect(await page.textContent('#x')).toBe('Free')", "await expect(page.getByTestId('delivery')).toHaveText('Free')"], answer: 1, explain: "The first reads the text once and compares; the second is web-first and retries." },
                { q: "To check that ShopLite shows 24 products, use:", options: ["toHaveCount(24) on the product list items", "toBeVisible()"], answer: 0, explain: "toHaveCount retries until the number of matching elements equals 24." }
            ] }
        ],
        why: "Assertions are the 'expected result' of an automated test. Retrying assertions remove most timing-related flakiness.",
        analogy: "A web-first assertion is waiting at the bus stop until the bus comes (or a set time passes), not glancing once and declaring there is no bus.",
        mistakes: ["Reading a value once and comparing it, instead of using a web-first matcher.", "Forgetting await before expect.", "Asserting on things the user cannot see, such as CSS classes, when a visible result exists."],
        check: [
            { q: "What does toHaveText do when the text has not appeared yet?", a: "It keeps retrying until it matches or the assertion timeout passes." },
            { q: "Why must expect(locator) be awaited?", a: "It is asynchronous because it retries; without await the test does not wait for the result." }
        ],
        summary: "Use await expect(locator) with matchers such as toBeVisible, toHaveText, toHaveURL and toHaveCount; they retry and are the automated expected result."
    },
    {
        id: "pw-first-test", title: "Writing a complete test", level: "beginner",
        objectives: ["Structure a test as arrange, act, assert", "Combine locators, actions and assertions", "Read a failing test's message"],
        intro: "A complete test opens the page in a known state (arrange), performs the user's actions (act) and checks the visible outcome (assert). Each test stands alone, so it can run in any order and in parallel.",
        blocks: [
            { type: "example", title: "Testing ShopLite's SAVE10 rule", text: "import { test, expect } from '@playwright/test';\n\ntest('SAVE10 is refused under ₹500', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/');                              // arrange\n  await page.getByRole('listitem').filter({ hasText: 'Steel Water Bottle' })\n    .getByRole('button', { name: 'Add to cart' }).click();                  // act\n  await page.getByRole('link', { name: /Cart/ }).click();\n  await page.getByLabel('Coupon code').fill('SAVE10');\n  await page.getByRole('button', { name: 'Apply' }).click();\n  await expect(page.getByText('SAVE10 needs an items total of ₹500 or more.')).toBeVisible(); // assert\n});" },
            { type: "quiz", heading: "Your turn: read the test", questions: [
                { q: "Run against ShopLite release 1.1, what happens to this test?", options: ["It passes", "It fails: the release applies SAVE10 under ₹500, so the message never appears", "It is skipped"], answer: 1, explain: "The seeded bug RB1-01 makes the assertion time out: the test catches the defect, which is its job." },
                { q: "Which part is the 'act'?", options: ["page.goto", "The clicks and fill", "expect(...).toBeVisible()"], answer: 1, explain: "Arrange opens the page, act performs user actions, assert checks the outcome." }
            ] }
        ],
        why: "A well-structured test reads like a test case: anyone can see what it checks and why it failed.",
        analogy: "Arrange, act, assert is setting the table, serving the dish and tasting it.",
        mistakes: ["Tests that depend on each other's leftovers.", "Several unrelated checks in one test.", "No assertion at all: a test that only clicks proves little."],
        check: [
            { q: "Why should each test be independent?", a: "So it can run alone, in any order or in parallel, and its failure points to one cause." },
            { q: "What makes a test fail in Playwright?", a: "A failed assertion, a timed-out action or an error in the test code." }
        ],
        summary: "Arrange a known state, act like a user with good locators, and assert the visible outcome with web-first assertions; keep tests independent."
    }
];
