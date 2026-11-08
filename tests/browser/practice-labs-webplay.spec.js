/**
 * Practice Labs, HTML and CSS playground: every exercise's model passes all checks and its starter does not, on the real
 * page (the checks need a rendered DOM and computed styles, so they are pinned here rather than in a unit test). Also:
 * the preview iframe is sandboxed without scripts, so markup with a script cannot run it.
 */
import { test, expect } from "../helpers/test-base.mjs";
import { WEB_EXERCISES } from "../../assets/js/practice-labs/web/web-exercises.js";

/* lesson pages that hold each exercise (curriculum.js needs a browser window, so the addresses are listed here) */
const P = "practice-labs/html-css-dom/";
const where = new Map([
  ["web-x-first-page", `${P}beginner/html-foundations/elements-and-structure/`],
  ["web-x-link-image", `${P}beginner/html-foundations/links-and-images/`],
  ["web-x-semantic", `${P}beginner/html-foundations/semantic-html/`],
  ["web-x-form", `${P}beginner/html-foundations/forms-and-inputs/`],
  ["web-x-css-basics", `${P}intermediate/css-and-access/css-basics/`],
  ["web-x-flex", `${P}intermediate/css-and-access/flexbox-and-responsive-design/`],
  ["web-x-accessible-button", `${P}intermediate/css-and-access/accessibility-essentials/`],
  ["web-x-table", `${P}intermediate/css-and-access/accessibility-essentials/`]
]);

test.describe("Practice Labs: HTML and CSS playground", () => {
  test("every exercise is used on a lesson page", () => {
    for (const ex of WEB_EXERCISES) expect(where.has(ex.id), ex.id).toBe(true);
  });

  for (const ex of WEB_EXERCISES) {
    test(`${ex.id}: the starter fails and the model passes`, async ({ page, go }) => {
      await go(where.get(ex.id));
      const block = page.locator(`[data-webplay="${ex.id}"]`);
      await block.locator("[data-web-run]").click();
      await expect(block.locator("[data-web-out]")).toHaveAttribute("data-verdict", "not-yet");
      await block.locator("textarea").fill(ex.model);
      await block.locator("[data-web-run]").click();
      await expect(block.locator("[data-web-out]")).toHaveAttribute("data-verdict", "correct");
    });
  }

  test("scripts in the learner's markup do not run", async ({ page, go }) => {
    await go(where.get("web-x-first-page"));
    const block = page.locator('[data-webplay="web-x-first-page"]');
    await block.locator("textarea").fill("<h1>ShopLite</h1><p>x</p><script>parent.document.title = 'hacked'; document.body.dataset.ran = '1';</script><img src=x onerror=\"document.body.dataset.ran='1'\">");
    await block.locator("[data-web-run]").click();
    await expect(block.locator("[data-web-out]")).toHaveAttribute("data-verdict", "correct");
    expect(await page.title()).not.toBe("hacked");
    const ran = await page.frameLocator(`[data-webplay="web-x-first-page"] iframe`).locator("body").getAttribute("data-ran");
    expect(ran).toBeNull();
  });
});
