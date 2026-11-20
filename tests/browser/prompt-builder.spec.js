/**
 * AI Prompt Builder (the AI Workbench of Tool Pack 58, central since D22): the full page: outcome, task, questions, product and the Work Pack, in the browser.
 * The engine is covered by tests/unit/ai-workbench.test.mjs; this checks the page's journey, copy, keyboard use,
 * that nothing leaves the site, and that nothing overflows on a phone.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

/* these tests cover the full page; the guided panel (D20) is the first screen, so they open the full page from it */
const open = async (page, go) => {
  await go("tools/prompt-builder/");
  await page.locator("#wb-form[data-ready]").waitFor();
  await page.getByRole("button", { name: /^More ways to start/ }).click();
};

test.describe("AI Prompt Builder: the full page", () => {
  test("outcome -> task -> answers -> a ready Work Pack with stages, copy and reset; nothing leaves the site @portable", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("AI Prompt Builder");
    await expect(page.locator("#wb-outcomes legend")).toHaveText("What do you want to accomplish with AI?");
    await expect(page.locator("input[name='wb-outcome']")).toHaveCount(10);
    await expect(page.locator("#wb-tasks")).toBeHidden();

    await page.getByLabel("Build software").check();
    await expect(page.locator("#wb-tasks")).toBeVisible();
    await page.getByLabel("Testing: test scenarios and test cases").check();
    await expect(page.locator("#wb-q-feature")).toBeVisible();
    await expect(page.locator(".wb-progress li[aria-current='step']")).toHaveText("Details");

    // empty: the pack waits for answers; one essential typed: incomplete, with the other essential named as missing
    await page.locator("#wb-q-feature").fill("Coupon codes at checkout");
    await expect(page.locator("#wb-pack-body")).toContainText("Almost ready");
    await expect(page.locator("#wb-pack-body")).toContainText("Case format");
    await expect(page.locator("#wb-master")).toContainText("[add: case format]");

    await page.locator("#wb-q-format").selectOption({ label: "Given / When / Then (BDD)" });
    await expect(page.locator("#wb-pack-body")).toContainText("Ready.");
    await expect(page.locator("#wb-master")).toContainText("Coupon codes at checkout");
    await expect(page.locator("#wb-master")).not.toContainText("[add:");
    await expect(page.locator(".wb-progress li[aria-current='step']")).toHaveText("Work Pack");
    await expect(page.locator(".wb-stage")).toHaveCount(2);

    // a senior specialist gets more control: a detailed pack with a final review
    await page.locator("#wb-experience").selectOption("senior");
    await expect(page.locator(".wb-stage").last()).toContainText("Final review");
    await expect(page.locator("#wb-master")).toContainText("trade-offs");

    // a directory product, chosen, reaches the pack with its official summary
    await page.locator("#wb-product").selectOption({ index: 1 });
    await expect(page.locator("#wb-pack-body .wb-part", { has: page.locator("#wb-h-product") })).toContainText("Its official site, checked"); // found by its heading: the context review (D18) now comes first

    // copy a stage prompt (the browser may refuse the clipboard; either way the page says what happened)
    await page.locator(".wb-stage .wb-copy").first().click();
    await expect(page.locator("#wb-live")).toHaveText(/copied|Copying was refused/);

    await page.locator("#wb-reset").click();
    await expect(page.locator("#wb-tasks")).toBeHidden();
    await expect(page.locator("#wb-describe")).toBeFocused(); // Start again returns to the first control, the describe box (AI ecosystem programme 17 §5.2)

    expect(watch.external, "nothing leaves the site").toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("not sure: a description lists the closest tasks to choose from; an image edit reports a conflict; More details stays closed; no overflow", async ({ page, go, watch }) => {
    await open(page, go);
    await page.getByLabel("I'm not sure. Help me choose").check();
    await expect(page.locator("#wb-describe")).toBeFocused();
    await page.locator("#wb-describe").fill("edit a photo of my shop");
    await page.locator("#wb-suggest").click();
    await expect(page.locator("#wb-matches")).toContainText("Best match");
    await expect(page.getByLabel("Create images")).not.toBeChecked(); // nothing is chosen for the visitor (AI ecosystem programme 17 §5.2)
    await page.locator("[data-use-task='image-edit']").click();
    await expect(page.getByLabel("Create images")).toBeChecked();
    await expect(page.getByLabel("Edit an existing image")).toBeChecked();
    await expect(page.locator("#wb-q-change")).toBeVisible();
    await page.locator("#wb-q-source").fill("our shop front");
    await page.locator("#wb-q-change").fill("brighten the sign");
    await page.locator("#wb-q-keep").fill("the sign exactly as it is");
    await expect(page.locator(".wb-alert")).toContainText("sign");
    await expect(page.locator("#wb-master")).toContainText("Keep unchanged:");

    await page.getByLabel("Create images").check();
    await page.getByLabel("Generate a new image").check();
    await expect(page.locator("#wb-more-details")).not.toHaveAttribute("open", "");
    await expect(page.locator("#wb-q-lighting")).toBeHidden();
    await page.locator("#wb-more-details > summary").click();
    await expect(page.locator("#wb-q-lighting")).toBeVisible();

    expect(watch.pageErrors).toEqual([]);
    await expectNoHorizontalOverflow(page);
  });

  test("keyboard: outcomes and tasks are radio groups reachable by Tab and arrow keys", async ({ page, go }) => {
    await open(page, go);
    const firstOutcome = page.locator("input[name='wb-outcome']").first();
    await firstOutcome.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByLabel("Create images")).toBeChecked();
    await expect(page.locator("#wb-tasks")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator("input[name='wb-task']").first()).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator("#wb-q-subject")).toBeVisible();
  });
});
