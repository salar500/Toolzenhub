/**
 * Developer Tools related-tools pilot (owner-approved 2026-10-27, doc 08 SH-005).
 * Every Developer Tool page ends with "Related Developer Tools": the curated, same-section links, a "View all"
 * link, no related articles, and no data carried between tools.
 */
import { test, expect } from "../helpers/test-base.mjs";

const RELATED = {
  "json-formatter": ["jsonpath-tester", "json-compare", "json-csv-converter", "unix-timestamp-converter"],
  "unix-timestamp-converter": ["jwt-decoder", "cron-expression-explainer", "json-formatter"],
  "text-diff": ["json-compare", "list-comparer", "json-formatter"],
  "jwt-decoder": ["unix-timestamp-converter", "base64-encoder-decoder", "json-formatter"],
  "cron-explainer": ["unix-timestamp-converter"],
  "base64-encoder-decoder": ["jwt-decoder", "url-parser", "json-formatter"],
  "url-parser": ["base64-encoder-decoder", "json-formatter"],
  "json-compare": ["json-formatter", "text-diff", "jsonpath-tester"],
  "jsonpath-tester": ["json-formatter", "json-compare"],
  "list-comparer": ["text-diff", "json-compare"],
  "uuid-generator": ["base64-encoder-decoder", "jwt-decoder"],
  "json-csv-converter": ["json-formatter", "json-compare"]
};

// the route of the Cron Explainer is its own slug in the catalog
const ROUTE = { "cron-explainer": "cron-expression-explainer" };
const slug = (id) => ROUTE[id] ?? id;

const DEVELOPER_TOOL_ROUTES = new Set(Object.keys(RELATED).map(slug));

test.describe("Developer Tools related-tools pilot", () => {
  for (const [id, expected] of Object.entries(RELATED)) {
    test(`${slug(id)}: lists exactly its curated Developer Tools, in order, with a View all link`, async ({ page, go }) => {
      await go(`tools/${slug(id)}/`);
      const section = page.locator(".related-section");
      await expect(section).toHaveCount(1);
      await expect(section.locator("h2")).toHaveText("Related Developer Tools");
      const hrefs = await section.locator(".related-calculator-card").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      const routes = hrefs.map((h) => h.replace(/\/$/, "").split("/").pop());
      expect(routes).toEqual(expected.map(slug));
      for (const route of routes) {
        expect(DEVELOPER_TOOL_ROUTES.has(route)).toBe(true);
        expect(route).not.toBe(slug(id));
      }
      await expect(section.getByRole("link", { name: /View all/ })).toHaveAttribute("href", /developer-tools\.html$/);
      // links only: no query string or fragment that could carry data
      for (const h of hrefs) expect(h).not.toMatch(/[?#]/);
      // the section is the last block of the page and there is no related-articles block
      await expect(page.locator(".related-articles-section, .related-articles")).toHaveCount(0);
    });
  }

  test("a related link opens the other tool and the tool starts empty (nothing is passed along)", async ({ page, go }) => {
    await go("tools/json-formatter/");
    await page.locator("#jf-input").fill('{"secret":"carried?"}');
    await page.locator(".related-section").getByRole("link", { name: /JSON Compare/ }).click();
    await expect(page.locator("h1")).toHaveText("JSON Compare");
    await expect(page).toHaveURL(/tools\/json-compare\/$/);
    expect(await page.locator("textarea").evaluateAll((els) => els.map((e) => e.value).join(""))).toBe("");
    expect(await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]))).not.toContain("carried");
  });

  test("the Time Tools pilot is unchanged and no Developer Tool appears in a Time Tool's related list", async ({ page, go }) => {
    await go("tools/time-zone-converter/");
    const hrefs = await page.locator(".related-section .related-calculator-card").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    // the section shows same-section tools only, so the Unix converter (a Developer Tool) is not offered there
    expect(hrefs.map((h) => h.replace(/\/$/, "").split("/").pop())).toEqual(["meeting-planner"]);
  });
});
