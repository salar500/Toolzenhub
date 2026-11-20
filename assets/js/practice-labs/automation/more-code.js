/* =========================================================
   ToolZen Hub
   API automation (Playwright request) and Selenium WebDriver (Java) code exercises, checked by automation/code-check.js
   by reading the code, not running it. Each model meets every rule; each weak version misses exactly the listed rules
   (pinned by tests/unit/code-check.test.mjs together with the Playwright exercises).
========================================================= */

const PW_API = "a real Playwright project (npx playwright test) against a running ShopLite API";
const SELENIUM = "a real Java project with Selenium 4 and JUnit 5 (mvn test)";

export const MORE_CODE = Object.freeze([
    {
        id: "api-c-get-products", runIn: PW_API,
        task: "Write a Playwright API test that requests GET /api/products, checks the response is OK, reads the JSON and checks that it lists 6 products.",
        starter: "import { test, expect } from '@playwright/test';\n\ntest('lists products', async ({ request }) => {\n  // your steps\n});",
        rules: [
            { id: "get", type: "must", pattern: "await\\s+request\\.get\\(\\s*['\"`]/api/products['\"`]", label: "Awaits request.get('/api/products')", advice: "const response = await request.get('/api/products');" },
            { id: "ok", type: "must", pattern: "expect\\(\\s*\\w+\\s*\\)\\.toBeOK\\(\\)|status\\(\\)\\s*\\)\\.toBe\\(\\s*200\\s*\\)", label: "Checks the status", advice: "await expect(response).toBeOK() or expect(response.status()).toBe(200)." },
            { id: "json", type: "must", pattern: "await\\s+\\w+\\.json\\(\\)", label: "Awaits the JSON body", advice: "const body = await response.json(); (json() returns a promise)." },
            { id: "count", type: "must", pattern: "(count|length)\\)\\.toBe\\(\\s*6\\s*\\)|toHaveLength\\(\\s*6\\s*\\)", label: "Checks the number of products", advice: "expect(body.count).toBe(6) or expect(body.products).toHaveLength(6)." }
        ],
        model: "import { test, expect } from '@playwright/test';\n\ntest('lists products', async ({ request }) => {\n  const response = await request.get('/api/products');\n  await expect(response).toBeOK();\n  const body = await response.json();\n  expect(body.products).toHaveLength(6);\n});",
        weak: [{ name: "no await on json, no count", code: "test('lists products', async ({ request }) => {\n  const response = await request.get('/api/products');\n  expect(response.status()).toBe(200);\n  const body = response.json();\n});", missing: ["json", "count"] }],
        explain: "The request fixture sends HTTP directly, without a browser. Both the request and response.json() are asynchronous; checking only the status would miss a wrong body."
    },
    {
        id: "api-c-post-cart", runIn: PW_API,
        task: "Write a test that POSTs { productId: 1, qty: 2 } as JSON to /api/cart/items, expects 201, checks the Location header and the returned qty.",
        starter: "test('adds to cart', async ({ request }) => {\n});",
        rules: [
            { id: "post", type: "must", pattern: "await\\s+request\\.post\\(\\s*['\"`]/api/cart/items['\"`]", label: "Awaits request.post('/api/cart/items', ...)", advice: "await request.post('/api/cart/items', { data: { productId: 1, qty: 2 } });" },
            { id: "data", type: "must", pattern: "data:\\s*\\{[^}]*productId:\\s*1[^}]*qty:\\s*2", label: "Sends the JSON body with data", advice: "Pass { data: { productId: 1, qty: 2 } }; Playwright sends it as JSON with the right Content-Type." },
            { id: "created", type: "must", pattern: "status\\(\\)\\s*\\)\\.toBe\\(\\s*201\\s*\\)", label: "Expects 201 Created", advice: "expect(response.status()).toBe(201)." },
            { id: "location", type: "must", pattern: "headers\\(\\)\\s*\\[\\s*['\"]location['\"]\\s*\\]", label: "Checks the Location header", advice: "expect(response.headers()['location']).toBe('/api/cart/items/1') (header names are lower case)." },
            { id: "qty", type: "must", pattern: "\\.qty\\)\\.toBe\\(\\s*2\\s*\\)", label: "Checks the returned qty", advice: "expect(body.qty).toBe(2)." }
        ],
        model: "test('adds to cart', async ({ request }) => {\n  const response = await request.post('/api/cart/items', { data: { productId: 1, qty: 2 } });\n  expect(response.status()).toBe(201);\n  expect(response.headers()['location']).toBe('/api/cart/items/1');\n  const body = await response.json();\n  expect(body.qty).toBe(2);\n});",
        weak: [{ name: "status only", code: "test('adds to cart', async ({ request }) => {\n  const response = await request.post('/api/cart/items', { data: { productId: 1, qty: 2 } });\n  expect(response.ok()).toBeTruthy();\n});", missing: ["created", "location", "qty"] }],
        explain: "ok() is true for any 2xx, so it cannot tell 200 from 201. Checking the exact status, the Location header and the body confirms the API created what was asked."
    },
    {
        id: "api-c-auth", runIn: PW_API,
        task: "Test that GET /api/orders refuses a request without a token (401) and accepts one with the header Authorization: Bearer demo-token-123 (200).",
        starter: "test('orders need a token', async ({ request }) => {\n});",
        rules: [
            { id: "without", type: "must", pattern: "status\\(\\)\\s*\\)\\.toBe\\(\\s*401\\s*\\)", label: "Checks the 401 without a token", advice: "First request without headers, then expect(...status()).toBe(401)." },
            { id: "header", type: "must", pattern: "headers:\\s*\\{[^}]*['\"]?Authorization['\"]?\\s*:\\s*[`'\"]Bearer ", label: "Sends the bearer token header", advice: "await request.get('/api/orders', { headers: { Authorization: 'Bearer demo-token-123' } })." },
            { id: "with", type: "must", pattern: "status\\(\\)\\s*\\)\\.toBe\\(\\s*200\\s*\\)|toBeOK\\(\\)", label: "Checks the 200 with the token", advice: "expect(authorised.status()).toBe(200)." },
            { id: "secret", type: "mustNot", pattern: "console\\.log\\([^)]*(token|Bearer)", label: "Does not print the token", advice: "Never log credentials, even in tests: CI logs are widely visible." }
        ],
        model: "test('orders need a token', async ({ request }) => {\n  const anonymous = await request.get('/api/orders');\n  expect(anonymous.status()).toBe(401);\n\n  const authorised = await request.get('/api/orders', {\n    headers: { Authorization: `Bearer ${process.env.SHOPLITE_TOKEN}` }\n  });\n  expect(authorised.status()).toBe(200);\n});",
        weak: [{ name: "happy path only, token logged", code: "test('orders', async ({ request }) => {\n  const token = 'demo-token-123';\n  console.log('using token', token);\n  const r = await request.get('/api/orders', { headers: { Authorization: 'Bearer ' + token } });\n  expect(r.status()).toBe(200);\n});", missing: ["without", "secret"] }],
        explain: "Security tests need the negative case: an API that returns orders without a token would pass a happy-path-only test. Read tokens from environment variables and never print them."
    },
    {
        id: "se-c-explicit-wait", runIn: SELENIUM,
        task: "This Selenium test sleeps for 3 seconds before clicking. Replace the fixed sleep with an explicit wait for the button to be clickable, and find it by id rather than an absolute XPath.",
        starter: "driver.get(\"https://shoplite.example/cart\");\nThread.sleep(3000);\ndriver.findElement(By.xpath(\"/html/body/div[2]/main/form/button\")).click();",
        rules: [
            { id: "nosleep", type: "mustNot", pattern: "Thread\\.sleep\\(", label: "No Thread.sleep", advice: "Fixed sleeps are slow and still flaky; wait for a condition instead." },
            { id: "wait", type: "must", pattern: "new\\s+WebDriverWait\\(\\s*driver\\s*,\\s*Duration\\.of", label: "Uses WebDriverWait with a Duration", advice: "WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));" },
            { id: "condition", type: "must", pattern: "ExpectedConditions\\.(elementToBeClickable|visibilityOfElementLocated)\\(", label: "Waits for a condition on the element", advice: "wait.until(ExpectedConditions.elementToBeClickable(By.id(\"checkout\")))" },
            { id: "locator", type: "mustNot", pattern: "By\\.xpath\\(\\s*\"/html", label: "No absolute XPath", advice: "Absolute XPaths break with any layout change; use By.id, By.name or a short CSS selector." }
        ],
        model: "driver.get(\"https://shoplite.example/cart\");\nWebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));\nWebElement checkout = wait.until(ExpectedConditions.elementToBeClickable(By.id(\"checkout\")));\ncheckout.click();",
        weak: [{ name: "longer sleep", code: "driver.get(\"https://shoplite.example/cart\");\nThread.sleep(10000);\ndriver.findElement(By.id(\"checkout\")).click();", missing: ["nosleep", "wait", "condition"] }],
        explain: "Selenium does not auto-wait like Playwright, so explicit waits on conditions are the standard. They return as soon as the condition holds, and fail clearly after the timeout."
    },
    {
        id: "se-c-lifecycle", runIn: SELENIUM,
        task: "Write a JUnit 5 test class that creates a fresh ChromeDriver before each test and always quits it after each test, with one test that opens the sign-in page and checks the title contains ShopLite.",
        starter: "class SignInTest {\n    WebDriver driver;\n\n    @Test\n    void opensSignIn() {\n    }\n}",
        rules: [
            { id: "before", type: "must", pattern: "@BeforeEach[\\s\\S]*?driver\\s*=\\s*new\\s+ChromeDriver\\(", label: "Creates the driver in @BeforeEach", advice: "@BeforeEach void setUp() { driver = new ChromeDriver(); }" },
            { id: "after", type: "must", pattern: "@AfterEach[\\s\\S]*?driver\\.quit\\(\\)", label: "Quits the driver in @AfterEach", advice: "@AfterEach void tearDown() { driver.quit(); } (quit ends the browser; close only closes a window)." },
            { id: "assert", type: "must", pattern: "assert(True|That)\\([^;]*getTitle\\(\\)", label: "Asserts on the title", advice: "assertTrue(driver.getTitle().contains(\"ShopLite\"));" },
            { id: "static", type: "mustNot", pattern: "static\\s+WebDriver", label: "No shared static driver", advice: "A static driver shared between tests leaks state and breaks parallel runs." }
        ],
        model: "class SignInTest {\n    WebDriver driver;\n\n    @BeforeEach\n    void setUp() {\n        driver = new ChromeDriver();\n    }\n\n    @AfterEach\n    void tearDown() {\n        driver.quit();\n    }\n\n    @Test\n    void opensSignIn() {\n        driver.get(\"https://shoplite.example/signin\");\n        assertTrue(driver.getTitle().contains(\"ShopLite\"));\n    }\n}",
        weak: [{ name: "shared driver, never quit", code: "class SignInTest {\n    static WebDriver driver = new ChromeDriver();\n\n    @Test\n    void opensSignIn() {\n        driver.get(\"https://shoplite.example/signin\");\n        assertTrue(driver.getTitle().contains(\"ShopLite\"));\n    }\n}", missing: ["before", "after", "static"] }],
        explain: "One fresh browser per test keeps tests independent; quitting in @AfterEach runs even when the test fails, so browsers do not pile up on the CI machine."
    },
    {
        id: "se-c-page-object", runIn: SELENIUM,
        task: "Write a LoginPage page object for Selenium with a constructor taking the WebDriver and a method signIn(email, password), then use it in a test.",
        starter: "public class LoginPage {\n}",
        rules: [
            { id: "class", type: "must", pattern: "class\\s+LoginPage[\\s\\S]*LoginPage\\(\\s*WebDriver\\s+\\w+\\s*\\)", label: "LoginPage takes the WebDriver in its constructor", advice: "public LoginPage(WebDriver driver) { this.driver = driver; }" },
            { id: "method", type: "must", pattern: "void\\s+signIn\\(\\s*String\\s+\\w+\\s*,\\s*String\\s+\\w+\\s*\\)", label: "Has signIn(String, String)", advice: "public void signIn(String email, String password) { ... }" },
            { id: "locators", type: "must", pattern: "By\\.(id|name|cssSelector)\\(", label: "Keeps stable locators inside the page object", advice: "private final By email = By.id(\"email\");" },
            { id: "uses", type: "must", pattern: "new\\s+LoginPage\\(\\s*driver\\s*\\)\\s*\\.signIn\\(|\\w+\\.signIn\\(", label: "The test calls the page object", advice: "new LoginPage(driver).signIn(\"asha@example.com\", \"shoplite1\");" }
        ],
        model: "public class LoginPage {\n    private final WebDriver driver;\n    private final By email = By.id(\"email\");\n    private final By password = By.id(\"password\");\n    private final By submit = By.cssSelector(\"button[type=submit]\");\n\n    public LoginPage(WebDriver driver) {\n        this.driver = driver;\n    }\n\n    public void signIn(String user, String pass) {\n        driver.findElement(email).sendKeys(user);\n        driver.findElement(password).sendKeys(pass);\n        driver.findElement(submit).click();\n    }\n}\n\n// in the test\nnew LoginPage(driver).signIn(\"asha@example.com\", \"shoplite1\");\nassertTrue(driver.findElement(By.linkText(\"My account\")).isDisplayed());",
        weak: [{ name: "steps in the test", code: "driver.findElement(By.id(\"email\")).sendKeys(\"asha@example.com\");\ndriver.findElement(By.id(\"password\")).sendKeys(\"shoplite1\");\ndriver.findElement(By.cssSelector(\"button\")).click();", missing: ["class", "method", "uses"] }],
        explain: "The page object holds the screen's locators and actions, so a changed id is fixed in one place. Keep assertions in the test."
    }
]);
