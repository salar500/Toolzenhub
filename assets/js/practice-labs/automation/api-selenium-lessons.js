/* =========================================================
   ToolZen Hub
   API Test Automation and Selenium WebDriver paths: lessons (original to this site; Playwright APIs as on playwright.dev,
   Selenium 4 APIs as in the Selenium documentation). Code exercises are checked by reading the code, not running it;
   request tasks use the in-page mock ShopLite API.
========================================================= */

export const apiLessons = [
    { id: "aa-why", title: "Why automate at the API level", level: "beginner", prerequisite: "HTTP and REST APIs (beginner level). Playwright basics help.",
        objectives: ["Place API tests in the test pyramid", "Decide what to test at the API level", "Explore an endpoint before automating it"],
        intro: "API tests send requests and check responses without a browser. They run in milliseconds, rarely flake and can test business rules, validation and security directly. A healthy suite has many unit and API tests and fewer, slower UI tests. Explore an endpoint by hand first: try good and bad requests and note what each returns.",
        blocks: [
            { type: "apitask", heading: "Explore first: the error you will automate", task: "api-t-422" },
            { type: "quiz", questions: [
                { q: "Which check belongs at the API level rather than the UI?", options: ["qty 0, 11 and 2.5 are all rejected with 422", "The Add to cart button is blue"], answer: 0, explain: "Business rules and validation are fastest and most thorough through the API." },
                { q: "Why do API tests flake less than UI tests?", options: ["No rendering, animation or browser timing", "They are written in JSON"], answer: 0, explain: "Fewer moving parts." }
            ] }
        ],
        why: "Teams expect automation engineers to cover most behaviour through APIs and keep UI tests for key journeys.",
        analogy: "API tests check the engine on a test bench; UI tests take the whole car for a drive.",
        mistakes: ["Testing every rule through the UI.", "Automating before understanding the endpoint.", "Only happy paths."],
        check: [{ q: "What is the test pyramid?", a: "Many fast low-level tests, fewer API tests, fewest UI tests." }, { q: "What should you do before automating an endpoint?", a: "Explore it by hand with good and bad requests." }],
        summary: "Automate most checks at the API level after exploring each endpoint, and keep UI tests for key journeys." },
    { id: "aa-requests", title: "Requests and assertions with Playwright", level: "beginner",
        objectives: ["Send requests with the request fixture", "Assert status, headers and body", "Configure a base URL"],
        intro: "Playwright's request fixture is an APIRequestContext: request.get, post, put, patch and delete return responses with status(), headers() and json(). Set use.baseURL in playwright.config.ts so tests use paths such as /api/products. await expect(response).toBeOK() checks for a 2xx status.",
        blocks: [
            { type: "codecheck", heading: "Your turn: a first API test", exercise: "api-c-get-products" },
            { type: "codecheck", heading: "Your turn: create and verify", exercise: "api-c-post-cart" }
        ],
        why: "The same tool can then drive UI and API tests, and API calls can prepare data for UI tests.",
        analogy: "The request fixture is a messenger who delivers your letter and brings back the reply for inspection.",
        mistakes: ["Forgetting await on json().", "toBeOK where an exact status matters.", "Hard-coded full URLs instead of baseURL."],
        check: [{ q: "What does response.json() return?", a: "A promise of the parsed body, so it must be awaited." }, { q: "Why prefer status 201 over ok() after a create?", a: "ok() accepts any 2xx and cannot tell 200 from 201." }],
        summary: "Use the request fixture with a baseURL, await every call and json(), and assert exact status, headers and body." },
    { id: "aa-auth-data", title: "Authentication, test data and clean-up", level: "intermediate",
        objectives: ["Test protected endpoints", "Keep tokens out of code and logs", "Create and clean up test data"],
        intro: "Most endpoints need credentials. Read tokens from environment variables or a sign-in request in a setup step, and pass them in headers; never log them. Each test should create the data it needs (through the API, which is fast) and remove it afterwards, so tests can run in any order and in parallel.",
        blocks: [
            { type: "codecheck", heading: "Your turn: positive and negative auth", exercise: "api-c-auth" },
            { type: "order", heading: "Your turn: a data-safe test", prompt: "Order the steps of an API test that needs its own order.", items: ["Get a token from the environment or a sign-in request", "Create a test order through the API", "Run the request under test against that order", "Assert status, body and side effects", "Delete the test order in an afterEach hook"], explain: "Arrange your own data, act, assert, then clean up even if the test failed." }
        ],
        why: "Shared or leftover test data is the main reason API suites become unreliable.",
        analogy: "Clean-up is washing your own dishes in a shared kitchen.",
        mistakes: ["Tests depending on data another test made.", "Tokens committed to the repository.", "No negative auth tests."],
        check: [{ q: "Where should tokens come from?", a: "Environment variables or a setup sign-in step, never source code." }, { q: "Why create data per test?", a: "So tests are independent and can run in any order or in parallel." }],
        summary: "Test protected endpoints positively and negatively, keep secrets out of code and logs, and create and clean up data per test." },
    { id: "aa-contracts", title: "Schemas, contracts and data-driven tests", level: "intermediate",
        objectives: ["Validate response structure", "Run one test over many inputs", "Explain contract testing"],
        intro: "Besides values, check the shape of responses: required fields and types, ideally against a JSON Schema or the OpenAPI definition. Data-driven tests loop over a table of inputs and expected results, ideal for validation rules. Contract tests check that a provider still satisfies what its consumers rely on, catching breaking API changes before release.",
        blocks: [
            { type: "example", title: "A data-driven validation test", text: "const cases = [\n  { qty: 0, status: 422 }, { qty: 1, status: 201 }, { qty: 10, status: 201 },\n  { qty: 11, status: 422 }, { qty: 2.5, status: 422 }, { qty: '2', status: 422 }\n];\nfor (const c of cases) {\n  test(`qty ${JSON.stringify(c.qty)} gives ${c.status}`, async ({ request }) => {\n    const r = await request.post('/api/cart/items', { data: { productId: 1, qty: c.qty } });\n    expect(r.status()).toBe(c.status);\n  });\n}" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which inputs come from boundary value analysis for qty 1 to 10?", options: ["0, 1, 10 and 11", "5 only"], answer: 0, explain: "Test design techniques apply directly to API tests." },
                { q: "The API renames total to totalPaise. Which test catches it before the mobile app breaks?", options: ["A contract or schema test", "A UI screenshot test"], answer: 0, explain: "Contracts make expectations explicit." }
            ] }
        ],
        why: "Shape checks and data-driven tests give broad coverage with little code; contracts protect teams that depend on each other.",
        analogy: "A contract test is checking a plug still fits the socket before shipping a new plug.",
        mistakes: ["Checking only one field.", "Copy-pasted tests for each input.", "No schema validation."],
        check: [{ q: "What does a data-driven test do?", a: "Runs the same steps for each row of inputs and expected results." }, { q: "What is contract testing?", a: "Verifying a provider meets the expectations its consumers rely on." }],
        summary: "Check response shape against schemas, drive validation tests from tables and use contracts to catch breaking changes." },
    { id: "aa-framework-ci", title: "API test frameworks and CI", level: "advanced",
        objectives: ["Structure an API test project", "Mix API setup with UI tests", "Run API tests in a pipeline"],
        intro: "A maintainable API suite has a small client layer (functions such as createOrder), fixtures for tokens and data, configuration per environment and clear reports. API calls can also set up UI tests: create the user and cart through the API, then test only the checkout screen. In CI, API tests run early because they are fast, with results and logs (without secrets) kept as artifacts.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A UI checkout test spends 40 seconds adding items through the interface. Faster approach?", options: ["Add items through the API in setup, then test checkout in the UI", "Buy a faster laptop"], answer: 0, explain: "Use the UI only for what the test is about." },
                { q: "Where should environment URLs live?", options: ["Configuration (baseURL from environment variables)", "Inside every test"], answer: 0, explain: "One suite, many environments." },
                { q: "Which stage should API tests run in?", options: ["Early, right after unit tests", "Only before major releases"], answer: 0, explain: "Fast feedback on every change." }
            ] }
        ],
        why: "Well-structured API suites stay fast and readable as they grow to hundreds of tests.",
        analogy: "A client layer is a phrasebook: tests speak in createOrder, not in raw HTTP sentences.",
        mistakes: ["Raw requests copy-pasted everywhere.", "Secrets in CI logs.", "API tests only run nightly."],
        check: [{ q: "What is an API client layer?", a: "Reusable functions that wrap endpoints, used by tests." }, { q: "How can API calls speed up UI tests?", a: "By creating the required data before the UI steps." }],
        summary: "Wrap endpoints in a client layer, use fixtures and configuration, set up UI tests through the API and run API tests early in CI." }
];

export const apiInterview = {
    howTo: "Answer each question before opening the explanation. API automation interviews mix tool knowledge with test design.",
    description: "10 API test automation interview questions with explained answers: the test pyramid, assertions, auth, test data, schemas, contracts and CI.",
    coding: [],
    quiz: [
        { q: "Why automate at the API level?", options: ["Fast, stable, direct access to rules", "It looks better"], answer: 0, explain: "The middle of the pyramid." },
        { q: "What does toBeOK() check?", options: ["A 2xx status", "Exactly 200"], answer: 0, explain: "Use exact codes when they matter." },
        { q: "What must you await?", options: ["The request and response.json()", "Nothing"], answer: 0, explain: "Both are promises." },
        { q: "How do you test a protected endpoint fully?", options: ["With and without valid credentials", "Only with admin"], answer: 0, explain: "Negative cases find real bugs." },
        { q: "Where do tokens come from?", options: ["Environment or setup sign-in", "Hard-coded"], answer: 0, explain: "Never commit them." },
        { q: "Why create test data per test?", options: ["Independence and parallel runs", "To fill the database"], answer: 0, explain: "Then clean up." },
        { q: "What is a data-driven test?", options: ["One test body over many input rows", "A test of databases"], answer: 0, explain: "Great for validation." },
        { q: "What is schema validation?", options: ["Checking response structure and types", "Checking speed"], answer: 0, explain: "Catches missing fields." },
        { q: "Contract testing catches?", options: ["Breaking changes between provider and consumer", "UI layout bugs"], answer: 0, explain: "Before release." },
        { q: "How do API calls help UI tests?", options: ["Fast setup of data", "They replace UI tests entirely"], answer: 0, explain: "Test only the screen in focus." }
    ]
};

export const seLessons = [
    { id: "se-intro", title: "Selenium WebDriver and how it works", level: "beginner", prerequisite: "Java basics (the Java Programming path) and manual testing basics.",
        objectives: ["Explain the WebDriver protocol", "Set up a Selenium project", "Compare Selenium with Playwright"],
        intro: "Selenium WebDriver drives real browsers through the W3C WebDriver standard: your test (in Java, Python, C# and others) sends commands to a browser driver such as chromedriver, which controls the browser. Selenium 4 includes Selenium Manager, which downloads matching drivers automatically. Unlike Playwright, Selenium does not auto-wait for most conditions, so tests must wait explicitly.",
        blocks: [
            { type: "example", title: "A Maven dependency and a first script", text: "<dependency>\n  <groupId>org.seleniumhq.selenium</groupId>\n  <artifactId>selenium-java</artifactId>\n  <version>4.x</version>\n</dependency>\n\nWebDriver driver = new ChromeDriver();\ndriver.get(\"https://shoplite.example/\");\nSystem.out.println(driver.getTitle());\ndriver.quit();" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "What does chromedriver do?", options: ["Translates WebDriver commands into actions in Chrome", "Stores test results"], answer: 0, explain: "Each browser has its own driver." },
                { q: "A team has a large Java Selenium suite and Java skills. Should they rewrite it in Playwright immediately?", options: ["Not necessarily: weigh migration cost against benefits", "Yes, always"], answer: 0, explain: "Both are capable; context decides." }
            ] }
        ],
        why: "Selenium is still the most widely used browser automation tool in enterprises, especially with Java.",
        analogy: "WebDriver is a remote control standard; each browser's driver is the receiver built into that TV.",
        mistakes: ["Expecting Playwright-style auto-waiting.", "Forgetting driver.quit().", "Mismatched driver and browser versions on old setups."],
        check: [{ q: "What standard does Selenium implement?", a: "The W3C WebDriver standard." }, { q: "What does Selenium Manager do?", a: "Finds or downloads the right browser driver automatically." }],
        summary: "Selenium sends W3C WebDriver commands through browser drivers; it is widespread, multi-language and needs explicit waits." },
    { id: "se-locators", title: "Locators and finding elements", level: "beginner",
        objectives: ["Use By.id, By.name, By.cssSelector and By.xpath", "Prefer stable locators", "Handle findElement and findElements"],
        intro: "Elements are found with By strategies: id and name are the most stable, CSS selectors are flexible and fast, XPath can navigate by text and relationships but becomes fragile when absolute. findElement throws NoSuchElementException when nothing matches; findElements returns an empty list. Ask developers for stable test ids such as data-testid where needed.",
        blocks: [
            { type: "quiz", heading: "Your turn: pick the most stable locator", questions: [
                { q: "For the email field <input id=\"email\" name=\"email\" class=\"input-lg\">:", options: ["By.id(\"email\")", "By.xpath(\"/html/body/div/form/input[1]\")"], answer: 0, explain: "Ids are stable; absolute XPaths break with any layout change." },
                { q: "For the button <button data-testid=\"checkout\" class=\"btn btn-primary\">Checkout</button>:", options: ["By.cssSelector(\"[data-testid='checkout']\")", "By.className(\"btn\")"], answer: 0, explain: "btn matches many buttons; the test id is unique and intended for tests." },
                { q: "You need to know whether any error messages are shown without an exception. Use:", options: ["findElements(...).isEmpty()", "findElement(...)"], answer: 0, explain: "findElements returns an empty list instead of throwing." }
            ] }
        ],
        why: "Fragile locators are the first cause of broken Selenium suites.",
        analogy: "An id is a house number; an absolute XPath is directions counting lamp posts from the town gate.",
        mistakes: ["Absolute XPaths.", "Class names shared by many elements.", "Locators copied from the browser without thought."],
        check: [{ q: "What does findElement do when nothing matches?", a: "Throws NoSuchElementException." }, { q: "Which locators are most stable?", a: "Ids, names and dedicated test ids." }],
        summary: "Prefer ids, names, test ids and short CSS selectors; use XPath sparingly and never absolute." },
    { id: "se-waits", title: "Waits and synchronisation", level: "intermediate",
        objectives: ["Replace sleeps with explicit waits", "Use ExpectedConditions", "Avoid mixing implicit and explicit waits"],
        intro: "Pages load and change asynchronously. Thread.sleep wastes time and still fails on slow days. Explicit waits (WebDriverWait with ExpectedConditions such as elementToBeClickable or visibilityOfElementLocated) poll until the condition holds or time out. Implicit waits apply to every findElement; mixing them with explicit waits causes unpredictable delays, so most teams use explicit waits only.",
        blocks: [
            { type: "codecheck", heading: "Your turn: remove the sleep", exercise: "se-c-explicit-wait" },
            { type: "quiz", questions: [
                { q: "A click fails with StaleElementReferenceException after the cart reloads. Why?", options: ["The element was replaced in the DOM; find it again after the update", "The browser crashed"], answer: 0, explain: "Re-locate elements after the page re-renders." }
            ] }
        ],
        why: "Synchronisation is the main source of flaky Selenium tests.",
        analogy: "An explicit wait is waiting at the door until it opens, rather than counting to ten and walking into it.",
        mistakes: ["Thread.sleep.", "Mixing implicit and explicit waits.", "Holding element references across page updates."],
        check: [{ q: "What does WebDriverWait.until do?", a: "Polls the condition until it is true or the timeout expires." }, { q: "What causes StaleElementReferenceException?", a: "Using an element reference after the DOM node was replaced." }],
        summary: "Wait for conditions with WebDriverWait, avoid sleeps and implicit waits, and re-find elements after updates." },
    { id: "se-actions", title: "Actions, forms, frames and windows", level: "intermediate",
        objectives: ["Type, click and select", "Switch to frames, windows and alerts", "Use the Actions API"],
        intro: "WebElement methods cover sendKeys, click, clear and getText; Select handles dropdowns. Content inside an iframe needs driver.switchTo().frame(...) and switchTo().defaultContent() to return; new tabs need switchTo().window(handle); JavaScript alerts need switchTo().alert(). The Actions class performs hovers, drag and drop and key combinations.",
        blocks: [
            { type: "example", title: "Frames, windows and selects", text: "new Select(driver.findElement(By.id(\"sort\"))).selectByValue(\"price-asc\");\n\ndriver.switchTo().frame(\"payment-frame\");\ndriver.findElement(By.name(\"card\")).sendKeys(\"4111111111111111\");\ndriver.switchTo().defaultContent();\n\nString main = driver.getWindowHandle();\nfor (String h : driver.getWindowHandles()) if (!h.equals(main)) driver.switchTo().window(h);\n\nnew Actions(driver).moveToElement(driver.findElement(By.id(\"account\"))).perform();" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "findElement cannot find a field inside the payment iframe. Why?", options: ["The driver is still in the main document; switch to the frame first", "The field has no id"], answer: 0, explain: "Each frame is a separate document." },
                { q: "After working in the frame, how do you return?", options: ["driver.switchTo().defaultContent()", "driver.back()"], answer: 0, explain: "back() navigates history instead." }
            ] }
        ],
        why: "Payments, embedded widgets and pop-ups appear in most real applications under test.",
        analogy: "Switching frames is stepping into another room: you must step back out before using the first room's furniture.",
        mistakes: ["Forgetting to switch back from a frame.", "Losing the main window handle.", "Using JavaScript clicks to bypass real problems."],
        check: [{ q: "How do you choose a dropdown option by value?", a: "new Select(element).selectByValue(\"value\")." }, { q: "How do you hover?", a: "new Actions(driver).moveToElement(element).perform()." }],
        summary: "Use WebElement methods and Select for forms, switch explicitly into frames, windows and alerts, and Actions for complex gestures." },
    { id: "se-junit-pom", title: "JUnit structure and the Page Object Model", level: "intermediate",
        objectives: ["Manage the driver lifecycle with JUnit 5", "Write page objects", "Keep assertions in tests"],
        intro: "Each test should get a fresh browser: create the driver in @BeforeEach and quit it in @AfterEach, which runs even when a test fails. Page objects hold a screen's locators and actions, so tests read as steps such as loginPage.signIn(...). Assertions stay in the tests.",
        blocks: [
            { type: "codecheck", heading: "Your turn: driver lifecycle", exercise: "se-c-lifecycle" },
            { type: "codecheck", heading: "Your turn: a page object", exercise: "se-c-page-object" }
        ],
        why: "Lifecycle and page objects decide whether a Selenium suite stays maintainable at hundreds of tests.",
        analogy: "@AfterEach is the cleaner who always comes, whether the party went well or not.",
        mistakes: ["Static shared drivers.", "close() instead of quit().", "Assertions buried in page objects."],
        check: [{ q: "quit() versus close()?", a: "quit() ends the whole browser session; close() closes the current window." }, { q: "Why fresh drivers per test?", a: "Independent tests with no leftover state." }],
        summary: "Create and quit drivers per test with JUnit hooks, and wrap screens in page objects while keeping assertions in tests." },
    { id: "se-grid-ci", title: "Cross-browser runs, Grid and CI", level: "advanced",
        objectives: ["Run tests on several browsers", "Explain Selenium Grid and RemoteWebDriver", "Run headless in CI"],
        intro: "Cross-browser coverage runs the same tests on Chrome, Firefox, Edge and Safari. Selenium Grid distributes tests to remote machines: tests create a RemoteWebDriver with the Grid URL and browser options. In CI, browsers run headless (no visible window), screenshots and logs are saved on failure, and tests run in parallel when they are independent.",
        blocks: [
            { type: "example", title: "Headless Chrome and a remote driver", text: "ChromeOptions options = new ChromeOptions();\noptions.addArguments(\"--headless=new\", \"--window-size=1280,800\");\nWebDriver local = new ChromeDriver(options);\n\nWebDriver remote = new RemoteWebDriver(new URL(System.getenv(\"GRID_URL\")), new FirefoxOptions());" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why set a window size in headless mode?", options: ["The default headless size can hide responsive elements", "It is required syntax"], answer: 0, explain: "Layouts change with width." },
                { q: "What should a failing CI test save?", options: ["A screenshot and the browser logs", "Nothing"], answer: 0, explain: "Evidence without rerunning locally." },
                { q: "What is Selenium Grid for?", options: ["Running tests on many remote browsers in parallel", "Writing locators"], answer: 0, explain: "Scale and coverage." }
            ] }
        ],
        why: "Real users have many browsers; CI runs must be fast and leave evidence.",
        analogy: "Grid is a testing lab with many machines, each ready to open whichever browser you ask for.",
        mistakes: ["Only testing Chrome.", "No failure screenshots.", "Parallel tests sharing data."],
        check: [{ q: "What does RemoteWebDriver need?", a: "The Grid URL and the browser options." }, { q: "What does headless mean?", a: "The browser runs without a visible window." }],
        summary: "Cover several browsers, scale with Grid and RemoteWebDriver, and run headless in CI with screenshots on failure." }
];

export const seInterview = {
    howTo: "Answer each question before opening the explanation. Selenium interviews favour practical answers about waits, locators and frameworks.",
    description: "10 Selenium WebDriver interview questions with explained answers: architecture, locators, waits, exceptions, frames, page objects and Grid.",
    coding: [],
    quiz: [
        { q: "What is WebDriver?", options: ["A W3C standard API to control browsers", "A test runner"], answer: 0, explain: "Drivers implement it." },
        { q: "Implicit versus explicit wait?", options: ["Implicit applies to all finds; explicit waits for a specific condition", "The same"], answer: 0, explain: "Prefer explicit, do not mix." },
        { q: "Why avoid Thread.sleep?", options: ["Slow and still flaky", "It is deprecated"], answer: 0, explain: "Wait for conditions." },
        { q: "Most stable locators?", options: ["Ids, names, test ids", "Absolute XPath"], answer: 0, explain: "Least fragile." },
        { q: "findElement versus findElements?", options: ["One element or exception versus a possibly empty list", "The same"], answer: 0, explain: "Use findElements to check absence." },
        { q: "StaleElementReferenceException means?", options: ["The DOM node was replaced", "Bad locator"], answer: 0, explain: "Find again." },
        { q: "How do you work inside an iframe?", options: ["switchTo().frame(...)", "Nothing special"], answer: 0, explain: "And defaultContent() to return." },
        { q: "quit() versus close()?", options: ["quit ends the session; close closes a window", "The same"], answer: 0, explain: "Use quit in teardown." },
        { q: "What is the Page Object Model?", options: ["Classes wrapping screens' locators and actions", "A browser"], answer: 0, explain: "Maintainability." },
        { q: "What is Selenium Grid?", options: ["Remote, parallel browser execution", "A locator strategy"], answer: 0, explain: "RemoteWebDriver." }
    ]
};
