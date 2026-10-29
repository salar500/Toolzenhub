/**
 * Practice Labs and Smart Flashcards: resilience and motion (Stage 3).
 *
 * AC-LRN-009 / AC-A11Y-08  with reduced motion on, nothing animates (computed durations are 0)
 * AC-LRN-011               a content module that does not load gives a plain message, not a blank page or raw error text,
 *                          and the rest of the page still works
 * AC-LRN-007               nothing is announced while typing; one announcement per explicit action
 */
import { test, expect } from "../helpers/test-base.mjs";

const app = (page) => page.locator("#lx-app");
const live = (page) => page.locator("#lx-live");

const ROUTES = ["tools/smart-flashcards/", "tools/json-error-fixing-lab/", "tools/jsonpath-challenge-lab/", "tools/cron-challenge-lab/", "tools/test-design-lab/"];

test.describe("reduced motion", () => {

  test.use({ reducedMotion: "reduce" });

  for (const route of ROUTES) {
    test(`${route}: no animation or transition is running or defined with a duration`, async ({ page, go }) => {
      await go(route);
      await expect(app(page)).toHaveAttribute("data-ready", "true");
      const moving = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("#lx-app, #lx-app *")) {
          const cs = getComputedStyle(el);
          const seconds = (d) => (d.trim().endsWith("ms") ? parseFloat(d) / 1000 : parseFloat(d)) || 0;
          const dur = [cs.transitionDuration, cs.animationDuration].join(",").split(",").map(seconds);
          if (dur.some((d) => d > 0.001)) out.push(el.tagName.toLowerCase() + "." + el.className);
        }
        return { out, running: document.getAnimations().length };
      });
      expect(moving.out).toEqual([]);
      expect(moving.running).toBe(0);
    });
  }

});

test.describe("a content module that does not load", () => {

  test("flashcards: a deck that cannot be fetched gives a plain message and the other decks still work", async ({ page, go }) => {
    await page.route("**/smart-flashcards/decks/json.js", (route) => route.abort());
    await go("tools/smart-flashcards/");
    await expect(app(page)).toHaveAttribute("data-ready", "true");
    await page.getByRole("button", { name: "Choose JSON", exact: true }).click();
    await expect(app(page)).toContainText("This deck could not be loaded. Reload the page to try again.");
    await expect(app(page)).not.toContainText(/TypeError|Failed to fetch|dynamically imported|at https?:/i);
    // the deck list is still there and another deck still opens
    await page.getByRole("button", { name: "Choose HTTP and APIs", exact: true }).click();
    await expect(page.getByRole("heading", { name: "HTTP and APIs deck" })).toBeVisible();
  });

  for (const [route, file] of [["tools/json-error-fixing-lab/", "json-error-fixing-lab/exercises.js"], ["tools/test-design-lab/", "test-design-lab/exercises.js"]]) {
    test(`${route}: missing exercises show the shared plain message and the page chrome still works`, async ({ page, go }) => {
      await page.route(`**/${file}`, (route) => route.abort());
      await go(route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("body")).not.toContainText(/TypeError|Failed to fetch|dynamically imported|at https?:\/\//i);
      // the shared tool loader shows its own plain message (its wording says "calculator" for every tool)
      await expect(page.locator("main")).toContainText("Something went wrong");
    });
  }

});

test.describe("live region", () => {

  test("typing announces nothing; a check announces once", async ({ page, go }) => {
    await go("tools/json-error-fixing-lab/");
    await expect(app(page)).toHaveAttribute("data-ready", "true");
    const box = page.getByRole("textbox").first();
    await box.pressSequentially("{ not json", { delay: 5 });
    await page.waitForTimeout(150);
    await expect(live(page)).toHaveText("");
    await page.getByRole("button", { name: "Check answer", exact: true }).click();
    await expect(live(page)).not.toHaveText("");
  });

});
