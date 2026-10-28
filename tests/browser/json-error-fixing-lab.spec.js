/**
 * JSON Error-Fixing Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs) plus what is particular to this lab:
 * the strict validator's line and column, comparing values and not text, no coercion of types, and refusing a repeated key.
 * The exercises and the evaluator are pinned by tests/unit/json-error-fixing-lab.test.mjs (with a Python oracle).
 */
import { test, expect } from "../helpers/test-base.mjs";
import { defineShellTests, openLab, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";

const ROUTE = "tools/json-error-fixing-lab/";

defineShellTests({
  route: ROUTE,
  title: "JSON Error-Fixing Lab",
  count: 18,
  correct: '{"name": "Asha", "age": 31}',
  wrong: '{"name": "Asha", "age": 31,}'
});

test.describe("JSON Error-Fixing Lab: this lab", () => {

  test("a still-broken answer reports the validator's line and column as text", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill('{"name": "Asha",\n"age": 31,}');
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback li").first()).toHaveText(/^Line 2, column \d+: /);
  });

  test("spacing and key order do not matter, and a number written as text does", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill('\n{\n\t"age": 31,\n\t"name": "Asha"\n}\n');
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
    await answerBox(page).fill('{"name": "Asha", "age": "31"}');
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback li")).toHaveText("$.age has a different kind of value");
  });

  test("the duplicate-key exercise accepts one key only", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await app(page).getByRole("button", { name: /^Exercise 16:/ }).click();
    await expect(page.getByRole("heading", { name: /^16\. A key that appears twice/ })).toBeVisible();
    await answerBox(page).fill('{"id": 2, "name": "x", "id": 2}');
    await checkButton(page).click();
    await expect(page.locator(".lx-feedback")).toContainText("same key more than once");
    await answerBox(page).fill('{"name": "x", "id": 2}');
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("every exercise can be solved: its own solution is accepted when shown and re-submitted", async ({ page, go }) => {
    test.setTimeout(120000);
    await openLab(page, go, ROUTE);
    for (let i = 1; i <= 18; i += 1) {
      await app(page).getByRole("button", { name: new RegExp(`^Exercise ${i}:`) }).click();
      await page.getByRole("button", { name: "Show solution" }).click();
      const solution = await page.locator('[aria-label="Solution"]').innerText();
      await answerBox(page).fill(solution);
      await checkButton(page).click();
      await expect(verdictOf(page), `exercise ${i}`).toHaveText("Correct");
    }
    await expect(page.locator("[data-role=counts]")).toContainText("0 completed, 18 solution viewed, 0 not started");
  });

  test("the related tool is a plain link with nothing carried in the address", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const href = await page.locator('.lx-card a[href*="json-formatter"]').getAttribute("href");
    expect(href).toMatch(/tools\/json-formatter\/$/);
    expect(href).not.toMatch(/[?#]/);
  });

});

const app = (page) => page.locator("#lx-app");
