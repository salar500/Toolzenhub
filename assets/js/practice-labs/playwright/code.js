/* =========================================================
   ToolZen Hub
   Playwright path: code exercises checked by automation/code-check.js (by reading the code, not running it).
   Each has a model that meets every rule and weak versions that miss exactly the listed rules (unit-tested).
========================================================= */

const AWAIT = { id: "await", type: "awaitActions", label: "Every action and assertion is awaited", advice: "Put await before every page action and every expect(...)." };
const SLEEP = { id: "sleep", type: "noSleep", label: "No fixed waits", advice: "Remove waitForTimeout: Playwright auto-waits for actions and web-first assertions retry." };
const USER = { id: "user", type: "userFacing", label: "Uses user-facing locators", advice: "Use getByRole, getByLabel or getByText rather than CSS or XPath." };

export const CODE = Object.freeze([
    {
        id: "pw-c-signin-form",
        task: "Write a test that signs in to ShopLite as asha@example.com with the password shoplite1 and checks that the header shows the My account link.",
        starter: "test('signs in', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/#/signin');\n  // your steps\n});",
        rules: [AWAIT, SLEEP, USER,
            { id: "fill", type: "must", pattern: "fill\\(\\s*['\"]asha@example\\.com['\"]", label: "Fills the email", advice: "Fill the Email field with asha@example.com." },
            { id: "assert", type: "must", pattern: "expect\\([^)]*My account[^)]*\\)\\)?\\.toBeVisible\\(|toBeVisible\\(\\)[^\\n]*", label: "Asserts the outcome", advice: "End with a web-first assertion, for example await expect(page.getByRole('link', { name: 'My account' })).toBeVisible()." }],
        model: "test('signs in', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/#/signin');\n  await page.getByLabel('Email').fill('asha@example.com');\n  await page.getByLabel('Password').fill('shoplite1');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page.getByRole('link', { name: 'My account' })).toBeVisible();\n});",
        weak: [
            { name: "sleep and css", code: "test('signs in', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/#/signin');\n  await page.locator('#sl-email').fill('asha@example.com');\n  await page.locator('#sl-password').fill('shoplite1');\n  await page.locator('form button').click();\n  await page.waitForTimeout(2000);\n  await expect(page.locator('text=My account')).toBeVisible();\n});", missing: ["sleep", "user"] },
            { name: "no await, no assertion", code: "test('signs in', async ({ page }) => {\n  page.goto('/practice-labs/shoplite/#/signin');\n  page.getByLabel('Email').fill('asha@example.com');\n  page.getByRole('button', { name: 'Sign in' }).click();\n});", missing: ["await", "assert"] }
        ],
        explain: "Labels and roles find the fields as a user would, each action is awaited, and the test ends with a retrying assertion on the visible result instead of a fixed wait."
    },
    {
        id: "pw-c-page-object",
        task: "Complete the page object: give CartPage a method applyCoupon(code) that fills the Coupon code field and presses Apply. Then use it in a test that applies SAVE10 and asserts the refusal message.",
        starter: "class CartPage {\n  constructor(page) { this.page = page; }\n  // applyCoupon(code)\n}",
        rules: [AWAIT, USER,
            { id: "method", type: "must", pattern: "async\\s+applyCoupon\\s*\\(\\s*\\w+\\s*\\)", label: "Defines async applyCoupon(code)", advice: "Declare async applyCoupon(code) { ... } in the class." },
            { id: "uses", type: "must", pattern: "await\\s+\\w+\\.applyCoupon\\(", label: "The test calls the page object", advice: "In the test, await cart.applyCoupon('SAVE10') instead of repeating the steps." },
            { id: "assert", type: "must", pattern: "toBeVisible\\(|toHaveText\\(", label: "Asserts the outcome in the test", advice: "Keep assertions in the test, not hidden in the page object." }],
        model: "class CartPage {\n  constructor(page) { this.page = page; }\n  async applyCoupon(code) {\n    await this.page.getByLabel('Coupon code').fill(code);\n    await this.page.getByRole('button', { name: 'Apply' }).click();\n  }\n}\n\ntest('SAVE10 refused under 500', async ({ page }) => {\n  const cart = new CartPage(page);\n  await page.goto('/practice-labs/shoplite/#/cart');\n  await cart.applyCoupon('SAVE10');\n  await expect(page.getByText('SAVE10 needs an items total of ₹500 or more.')).toBeVisible();\n});",
        weak: [{ name: "steps repeated in the test", code: "test('SAVE10', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/#/cart');\n  await page.getByLabel('Coupon code').fill('SAVE10');\n  await page.getByRole('button', { name: 'Apply' }).click();\n  await expect(page.getByText('SAVE10 needs')).toBeVisible();\n});", missing: ["method", "uses"] }],
        explain: "A page object keeps how to use a screen in one place, so a renamed button changes one method, not every test; assertions stay in tests, where the expected result is visible."
    },
    {
        id: "pw-c-mock-network",
        task: "ShopLite's API is not available in this scenario. Write a test that mocks GET requests to **/api/products with page.route, returning a JSON list with one product named Test Lamp, then asserts that Test Lamp is visible.",
        starter: "test('shows mocked products', async ({ page }) => {\n  // mock, then visit, then assert\n});",
        rules: [AWAIT,
            { id: "route", type: "must", pattern: "page\\.route\\(\\s*['\"][^'\"]*api/products", label: "Mocks the products request with page.route", advice: "await page.route('**/api/products', (route) => route.fulfill({ json: [...] }))." },
            { id: "fulfill", type: "must", pattern: "fulfill\\(", label: "Fulfils the request with a response", advice: "Inside the handler call route.fulfill({ json: ... })." },
            { id: "order", type: "must", pattern: "page\\.route[\\s\\S]*page\\.goto", label: "Sets up the mock before navigating", advice: "Register the route before page.goto, or the real request may already have been sent." },
            { id: "assert", type: "must", pattern: "Test Lamp[^\\n]*\\)\\)?\\.toBeVisible\\(", label: "Asserts the mocked data appears", advice: "await expect(page.getByText('Test Lamp')).toBeVisible()." }],
        model: "test('shows mocked products', async ({ page }) => {\n  await page.route('**/api/products', (route) => route.fulfill({ json: [{ id: 1, name: 'Test Lamp', price: 500 }] }));\n  await page.goto('/shop');\n  await expect(page.getByText('Test Lamp')).toBeVisible();\n});",
        weak: [{ name: "mock after navigation", code: "test('mock', async ({ page }) => {\n  await page.goto('/shop');\n  await page.route('**/api/products', (route) => route.fulfill({ json: [{ name: 'Test Lamp' }] }));\n  await expect(page.getByText('Test Lamp')).toBeVisible();\n});", missing: ["order"] }],
        explain: "Mocking makes UI tests independent of slow or unavailable back ends, and lets you test rare responses such as errors or empty lists. The route must exist before the request is sent."
    },
    {
        id: "pw-c-fix-flaky",
        task: "This test fails now and then. Rewrite it so it is reliable: no fixed wait, a web-first assertion, and a locator that matches exactly one element.",
        starter: "test('adds to cart', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/');\n  await page.locator('.sl-card button').nth(6).click();\n  await page.waitForTimeout(1000);\n  const text = await page.locator('header').textContent();\n  expect(text).toContain('Cart (1)');\n});",
        rules: [AWAIT, SLEEP, USER,
            { id: "webfirst", type: "mustNot", pattern: "expect\\(\\s*\\w+\\s*\\)\\.toContain", label: "Uses a web-first assertion, not a one-off read", advice: "Replace reading textContent once with await expect(locator).toHaveText(...) or toBeVisible(), which retries." },
            { id: "nth", type: "mustNot", pattern: "\\.nth\\(", label: "Does not depend on position (nth)", advice: "Pick the product by its name (filter({ hasText })), not by its position in the list." }],
        model: "test('adds to cart', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/');\n  await page.getByRole('listitem').filter({ hasText: 'LED Desk Lamp' }).getByRole('button', { name: 'Add to cart' }).click();\n  await expect(page.getByRole('link', { name: 'Cart (1)' })).toBeVisible();\n});",
        weak: [{ name: "kept the sleep", code: "test('adds to cart', async ({ page }) => {\n  await page.goto('/practice-labs/shoplite/');\n  await page.getByRole('listitem').filter({ hasText: 'LED Desk Lamp' }).getByRole('button', { name: 'Add to cart' }).click();\n  await page.waitForTimeout(1000);\n  await expect(page.getByRole('link', { name: 'Cart (1)' })).toBeVisible();\n});", missing: ["sleep"] }],
        explain: "The original depended on timing (a fixed wait), on position (nth(6) breaks when products are reordered) and on a one-off read. The fix waits for the real outcome and finds the product by name."
    }
]);
