/**
 * Text Diff options (approved enhancement X2): Ignore case, and the unchanged-lines setting.
 * The rules are proven in tests/unit/text-diff-options.test.mjs; these tests prove the controls on the page.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const original = (page) => page.locator("#td-original");
const changed = (page) => page.locator("#td-changed");
const panel = (page) => page.locator("#td-panel");
const status = (page) => page.locator("#td-status");
const note = (page) => page.locator("#td-note");
const live = (page) => page.locator("#td-live");
const ignoreCase = (page) => page.getByLabel("Ignore case");
const context = (page) => page.getByLabel("Unchanged lines shown");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const rows = (page) => page.locator("#td-lines .td-row");
const gaps = (page) => page.locator("#td-lines .td-gap__button");

async function open(page, go) {
  await go("tools/text-diff/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

const long = Array.from({ length: 30 }, (_, i) => `line ${i}`);
const after = long.slice();
after[10] = "line 10 edited here";
after[20] = "line 20 edited here";

async function both(page, a, b) {
  await original(page).fill(a);
  await changed(page).fill(b);
}

test.describe("Text Diff options", () => {
  test("controls are labelled and default off / 3 lines; the default view is unchanged", async ({ page, go }) => {
    await open(page, go);
    await expect(ignoreCase(page)).not.toBeChecked();
    await expect(context(page)).toHaveValue("3");
    await expect(context(page).locator("option")).toHaveText(["3 lines around each change", "Only the changes", "1 line around each change", "10 lines around each change", "All lines"]);
    await both(page, long.join("\n"), after.join("\n"));
    await expect(panel(page)).toHaveAttribute("data-state", "result");
    await expect(gaps(page)).toHaveCount(3);
  });

  test("Ignore case: a case-only difference is no difference, and the page says so", async ({ page, go }) => {
    await open(page, go);
    await both(page, "Hello World\nSecond line", "hello world\nSecond line");
    await expect(panel(page)).toHaveAttribute("data-state", "result");
    await ignoreCase(page).check();
    await expect(panel(page)).toHaveAttribute("data-state", "identical");
    await expect(status(page)).toHaveText("No differences found.");
    await expect(note(page)).toHaveText("Differences in letter case are ignored.");
    await ignoreCase(page).uncheck();
    await expect(panel(page)).toHaveAttribute("data-state", "result");
  });

  test("Ignore case with a real change: the note names it and only the real change is listed", async ({ page, go }) => {
    await open(page, go);
    await both(page, "Alpha\nBeta", "ALPHA\nGamma");
    await ignoreCase(page).check();
    await expect(panel(page)).toHaveAttribute("data-state", "result");
    await expect(note(page)).toHaveText("Differences in letter case are ignored.");
    await expect(rows(page).filter({ hasText: "Gamma" })).toHaveCount(1);
  });

  test("Only the changes hides every unchanged line behind its expander; All lines shows everything; no recompute needed", async ({ page, go }) => {
    await open(page, go);
    await both(page, long.join("\n"), after.join("\n"));
    await expect(panel(page)).toHaveAttribute("data-state", "result");
    await context(page).selectOption("0");
    await expect(live(page)).toHaveText("Showing only the changes.");
    await expect(page.locator("#td-lines .td-row--same")).toHaveCount(0);
    await expect(gaps(page)).toHaveCount(3);
    await context(page).selectOption("all");
    await expect(live(page)).toHaveText("Showing all lines.");
    await expect(gaps(page)).toHaveCount(0);
    await expect(rows(page)).toHaveCount(30);
    await context(page).selectOption("1");
    await expect(live(page)).toHaveText("Showing 1 unchanged line around each change.");
    await context(page).selectOption("3");
    await expect(gaps(page)).toHaveCount(3);
  });

  test("Copy diff follows the chosen context", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await both(page, "k1 same\nk2 same words here\nk3 same\nk4 same\nk5 same words here", "k1 same\nk2 CHANGED words here\nk3 same\nk4 same\nk5 CHANGED words here");
    await expect(panel(page)).toHaveAttribute("data-state", "result");
    await context(page).selectOption("0");
    await btn(page, "Copy diff").click();
    const text = await page.evaluate(() => window.__copied.at(-1));
    expect(text).toBe("--- Original\n+++ Changed\n@@ -2,1 +2,1 @@\n-k2 same words here\n+k2 CHANGED words here\n@@ -5,1 +5,1 @@\n-k5 same words here\n+k5 CHANGED words here\n");
  });

  test("Reset restores the defaults; the options work by keyboard; 320 px has no overflow", async ({ page, go }) => {
    await open(page, go);
    await ignoreCase(page).check();
    await context(page).selectOption("all");
    await btn(page, "Reset").click();
    await expect(ignoreCase(page)).not.toBeChecked();
    await expect(context(page)).toHaveValue("3");
    await context(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(context(page)).toHaveValue("0");
    await page.setViewportSize({ width: 320, height: 800 });
    await expectNoHorizontalOverflow(page);
    const box = await context(page).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  });
});
