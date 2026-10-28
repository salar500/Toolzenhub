/**
 * JSONPath Challenge Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs) plus what is particular to this lab:
 * the read-only document, judging by the nodes selected (not by the text of the query), extra and missing paths,
 * order, and queries the engine refuses. The exercises and the evaluator are pinned by
 * tests/unit/jsonpath-challenge-lab.test.mjs (with a Python evaluator as the independent oracle).
 */
import { test, expect } from "../helpers/test-base.mjs";
import { defineShellTests, openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";

const ROUTE = "tools/jsonpath-challenge-lab/";

defineShellTests({
  route: ROUTE,
  title: "JSONPath Challenge Lab",
  count: 19,
  limit: 1000,
  correct: "$.library.name",
  wrong: "$.library.location"
});

test.describe("JSONPath Challenge Lab: this lab", () => {

  test("the document is shown read only, and the task lists the values to select", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const doc = page.locator('[aria-label="The document (read only)"]');
    await expect(doc).toContainText('"name": "City Library"');
    expect(await doc.evaluate((el) => el.tagName)).toBe("PRE");
    await expect(app(page).locator("textarea")).toHaveCount(1); // only the answer box is editable
    await expect(page.getByText('The query must select exactly this value, each once: "City Library".')).toBeVisible();
  });

  test("the bracket spelling of the same selection is accepted: the nodes are judged, not the text", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("$['library']['name']");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("a wrong query lists the paths selected but not wanted and the paths missed, and not the query", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("$.library.location.city");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("$['library']['location']['city']");
    await expect(page.locator(".lx-feedback")).toContainText("$['library']['name']");
    await expect(page.locator(".lx-feedback")).not.toContainText("$.library.name");
  });

  test("a syntax error is Cannot check with the position; match() is refused with the engine message", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await answerBox(page).fill("$.library[");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback li").first()).toHaveText(/^Position \d+: /);
    await answerBox(page).fill("$.library.books[?match(@.title, 'S.*')]");
    await checkButton(page).click();
    await expect(page.locator(".lx-feedback")).toContainText("match() and search() are not supported");
    await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed");
  });

  test("an ordered exercise rejects the right nodes in the wrong order and says why", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await app(page).getByRole("button", { name: /^Exercise 12:/ }).click();
    await answerBox(page).fill("$.library.books[4,2,0].title");
    await checkButton(page).click();
    await expect(verdictOf(page)).toHaveText("Not yet");
    await expect(page.locator(".lx-feedback")).toContainText("different order");
  });

  test("every exercise can be solved: its own solution is accepted when shown and submitted", async ({ page, go }) => {
    test.setTimeout(120000);
    await openLab(page, go, ROUTE);
    for (let i = 1; i <= 19; i += 1) {
      await app(page).getByRole("button", { name: new RegExp(`^Exercise ${i}:`) }).click();
      await page.getByRole("button", { name: "Show solution" }).click();
      await answerBox(page).fill(await page.locator('[aria-label="Solution"]').innerText());
      await checkButton(page).click();
      await expect(verdictOf(page), `exercise ${i}`).toHaveText("Correct");
    }
  });

  test("the related tool is a plain link with nothing carried in the address", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const href = await page.locator('.lx-card a[href*="jsonpath-tester"]').getAttribute("href");
    expect(href).toMatch(/tools\/jsonpath-tester\/$/);
    expect(href).not.toMatch(/[?#]/);
  });

});
