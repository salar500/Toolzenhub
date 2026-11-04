/**
 * Markup typed into a lab's editable boxes is shown as text and never runs: the SQL sandbox, an Excel formula answer, a Power BI example
 * and the JSON Compare boxes. A page-level flag is set by any injected handler; it must stay unset.
 */
import { test, expect } from "../helpers/test-base.mjs";
import { openLab, answerBox, checkButton } from "../helpers/lab-contract.mjs";

const PAYLOAD = `<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>`;
const SQLSAFE = "<img src=x onerror=window.__xss=1>";
const hit = (page) => page.evaluate(() => window.__xss === 1);

test("SQL sandbox: markup in a query, a column alias and an error message is text", async ({ page, go }) => {
  await openLab(page, go, "tools/sql-practice-lab/");
  await page.locator("#sql-sandbox-input").fill(`SELECT '${SQLSAFE}' AS "${SQLSAFE}";`);
  await page.locator("#sql-sandbox-run").click();
  await expect(page.locator("#sql-sandbox-out")).toContainText("<img");
  await page.locator("#sql-sandbox-input").fill(`SELECT * FROM ${PAYLOAD.replace(/\W/g, "_")} ; ${PAYLOAD}`);
  await page.locator("#sql-sandbox-run").click();
  await expect(page.locator("#sql-sandbox-out")).not.toHaveText("Running...");
  expect(await hit(page)).toBe(false);
  expect(await page.locator("#sql-sandbox-out img").count()).toBe(0);
});

test("SQL answer box: markup in an answer is text in the feedback", async ({ page, go }) => {
  await openLab(page, go, "tools/sql-practice-lab/");
  await answerBox(page).fill(PAYLOAD);
  await checkButton(page).click();
  await expect(page.locator(".lx-feedback")).toBeVisible({ timeout: 20000 });
  expect(await hit(page)).toBe(false);
  expect(await page.locator(".lx-feedback img, .lx-feedback script").count()).toBe(0);
});

test("Power BI example box: markup is text", async ({ page, go }) => {
  await openLab(page, go, "tools/power-bi-practice-lab/");
  const box = page.locator("textarea.lx-textarea").first();
  await box.fill(`trim ${PAYLOAD}\nproper ${PAYLOAD}`);
  await box.locator("xpath=following::button[1]").click();
  await page.waitForTimeout(500);
  expect(await hit(page)).toBe(false);
  expect(await page.locator("main img[src='x']").count()).toBe(0);
});

test("JSON Compare: markup in keys and values is text", async ({ page, go }) => {
  await go("tools/json-compare/");
  await expect(page.locator("#jc-panel")).toHaveAttribute("data-ready", "true");
  await page.locator("#jc-first").fill(JSON.stringify({ [PAYLOAD]: PAYLOAD }));
  await page.locator("#jc-second").fill(JSON.stringify({ [PAYLOAD]: "other" }));
  await expect(page.locator("#jc-status")).toContainText("difference");
  expect(await hit(page)).toBe(false);
  expect(await page.locator("#jc-rows img").count()).toBe(0);
  await expect(page.locator("#jc-rows")).toContainText("<img");
});
