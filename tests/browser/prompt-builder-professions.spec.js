/**
 * AI Prompt Builder (the former AI Workbench): "Start from your profession", the tool step, the context review and the local prompt adjustments
 * (AI programme D18; docs/ecosystem-review/ai-ecosystem/20-ROLES-TASKS-TOOLS.md). The prompt rules themselves are
 * covered by tests/unit/ai-workbench-tools.test.mjs.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const AXE = fileURLToPath(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url));
const ready = (page) => page.locator("#wb-form[data-ready]").waitFor();

async function qaApiTask(page, go) {
  await go("tools/prompt-builder/");
  await ready(page);
  /* chosen in the guided panel (D20), then shown on the full page, where these tests work on every part at once */
  await page.getByRole("button", { name: /^QA engineer or software tester/ }).click();
  await page.getByRole("button", { name: "API tests", exact: true }).click();
  await expect(page.locator("#wb-details-title")).toContainText("API tests");
  await page.getByRole("button", { name: "Show everything on one page" }).click();
  await expect(page.locator("#wb-tools")).toBeVisible();
}

test.describe("AI Prompt Builder: professions and tools", () => {

  test("a QA engineer picks API testing and Postman: the prompt works the way Postman does; the review shows it @portable", async ({ page, go, watch }) => {
    await qaApiTask(page, go);
    await expect(page.locator("#wb-role")).toHaveValue("QA engineer or software tester");
    await expect(page.locator("#wb-tool-list .wb-tool").first()).toContainText("Postman");
    await page.getByRole("checkbox", { name: "Postman API client", exact: true }).check();
    await page.getByLabel("Your experience with Postman").selectOption("new");
    await expect(page.locator("#wb-master")).toContainText("Working in Postman (my experience with it: new to it):");
    await expect(page.locator("#wb-master")).toContainText("pm.test and pm.expect");
    await expect(page.locator("#wb-master")).toContainText("I am new to Postman: say where in Postman");
    await expect(page.locator("#wb-master")).toContainText("I work as a QA engineer or software tester.");
    await expect(page.locator(".wb-review")).toContainText("Postman (new to it)");
    await expect(page.locator(".wb-review")).toContainText("QA engineer or software tester");
    await expectNoHorizontalOverflow(page);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("two tools add how they hand work to each other; 'none' and 'recommend' clear the tools", async ({ page, go }) => {
    await go("tools/prompt-builder/?task=data-analysis");
    await ready(page);
    /* a task link starts the conversation (D22); this journey checks the tool step on the full page */
    await page.getByRole("button", { name: "Show everything on one page" }).click();
    await expect(page.locator("#wb-tools")).toBeVisible();
    await page.getByRole("checkbox", { name: "Microsoft Excel spreadsheet", exact: true }).check();
    await page.getByRole("checkbox", { name: "Power BI business intelligence", exact: true }).check();
    await expect(page.locator("#wb-master")).toContainText("How the tools fit together:");
    await expect(page.locator("#wb-master")).toContainText("Load the Excel tables into Power BI Desktop with Get data");
    await page.getByLabel("I don't use a specific tool").check();
    await expect(page.getByRole("checkbox", { name: "Microsoft Excel spreadsheet", exact: true })).not.toBeChecked();
    await expect(page.locator("#wb-master")).toContainText("I do not use a specific tool for this");
    await page.getByLabel("Recommend a suitable tool").check();
    await expect(page.getByLabel("I don't use a specific tool")).not.toBeChecked();
    await expect(page.locator("#wb-master")).toContainText("Recommend the tool that suits this task best");
  });

  test("the review's Change link opens the folded answer; shorter and longer step the prompt detail (D19)", async ({ page, go }) => {
    await qaApiTask(page, go);
    await page.locator(".wb-review").getByRole("link", { name: /Change.*profession/ }).click();
    await expect(page.locator("#wb-role")).toBeFocused();
    await expect(page.getByRole("radio", { name: /^Detailed/ })).toBeChecked();
    await page.getByRole("button", { name: "Make it more detailed" }).click();
    await expect(page.getByRole("radio", { name: /^Very detailed/ })).toBeChecked();
    await expect(page.locator("#wb-master")).toContainText("Negative, boundary and edge cases:");
    await expect(page.locator("#wb-live")).toContainText("Prompt detail set to Very detailed");
    await expect(page.getByRole("button", { name: "Make it more detailed" })).toBeDisabled();
    await page.getByRole("button", { name: "Make it shorter" }).click();
    await page.getByRole("button", { name: "Make it shorter" }).click();
    await expect(page.getByRole("radio", { name: /^Standard/ })).toBeChecked();
    await expect(page.locator("#wb-master")).not.toContainText("Endpoint analysis:");
    await expect(page.getByRole("button", { name: "Make it shorter" })).toBeDisabled();
    await page.locator("#wb-pack-body .wb-edit > summary", { hasText: "Edit the prompt before copying" }).click();
    await page.locator("#wb-master-edit").fill("My own edited prompt");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.locator("#wb-copy-edit").click();
    await expect(page.locator("#wb-live")).toContainText(/Edited prompt copied|Copying was refused/);
  });

  test("a downloaded Work Pack keeps the profession, tools and prompt settings; opening it restores them", async ({ page, go }) => {
    await qaApiTask(page, go);
    await page.getByRole("radio", { name: /^Very detailed/ }).check();
    await page.locator(".wb-refine > summary").click();
    await page.getByLabel("Tone of the answer").selectOption("formal");
    await page.getByRole("checkbox", { name: "Postman API client", exact: true }).check();
    await page.getByLabel("Your experience with Postman").selectOption("advanced");
    await page.locator("#wb-q-api").fill("POST /cart/items adds an item");
    await expect(page.locator("#wb-master")).toContainText("POST /cart/items adds an item");
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#wb-download").click()]);
    const file = fs.readFileSync(await download.path(), "utf8");
    expect(file).toContain("\"tools\":{\"postman\":\"advanced\"}");
    expect(file).toContain("\"profession\":\"qa\"");
    expect(file).toContain("\"detail\":\"comprehensive\"");
    expect(file).toContain("- Prompt detail: comprehensive");
    await page.locator("#wb-reset").click();
    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill(file);
    await page.locator("#wb-open-button").click();
    await expect(page.getByRole("checkbox", { name: "Postman API client", exact: true })).toBeChecked();
    await expect(page.getByLabel("Your experience with Postman")).toHaveValue("advanced");
    await expect(page.locator("#wb-master")).toContainText("I use Postman at an advanced level");
    await expect(page.getByRole("radio", { name: /^Very detailed/ })).toBeChecked();
    await expect(page.locator("#wb-master")).toContainText("formal, professional tone");
  });

  test("prompt detail and refinements rewrite the prompt in place: word counts, parts added, check, reset", async ({ page, go }) => {
    await qaApiTask(page, go);
    await page.locator("#wb-q-api").fill("Healthcare API: patient records and appointments");
    await expect(page.locator("#wb-master")).toContainText("synthetic or fully de-identified data");
    const counts = await page.locator("[data-words]").allTextContents();
    const n = counts.map((t) => Number(t.replace(/\D/g, "")));
    expect(n[0]).toBeLessThan(n[1]);
    expect(n[1]).toBeLessThan(n[2]);
    await expect(page.locator("#wb-h-master")).toContainText(`${n[1]} words`);
    await page.getByRole("radio", { name: /^Standard/ }).check();
    await expect(page.getByRole("radio", { name: /^Standard/ })).toBeFocused();
    await page.locator(".wb-refine > summary").click();
    await page.getByRole("checkbox", { name: "Edge cases and failure scenarios" }).check();
    await expect(page.locator("#wb-master")).toContainText("Negative, boundary and edge cases:");
    await page.getByLabel("Answer format").selectOption("csv");
    await expect(page.locator("#wb-master")).toContainText("Give every table as CSV");
    await page.locator("#wb-prompt-check > summary").click();
    await expect(page.locator("#wb-prompt-check")).toContainText(/Prompt check: \d+ of 22 met/);
    await page.locator("#wb-q-api").fill("Healthcare API: patient records, appointments");
    await expect(page.locator("#wb-prompt-check")).toHaveAttribute("open", "");
    await page.getByRole("button", { name: "Back to the recommended prompt" }).click();
    await expect(page.getByRole("radio", { name: /^Detailed/ })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Edge cases and failure scenarios" })).not.toBeChecked();
    await expect(page.locator("#wb-master")).not.toContainText("Give every table as CSV");
  });

  test("the profession list, tool step and review pass axe and fit a phone @desktop-only", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 860 });
    await qaApiTask(page, go);
    await page.getByRole("checkbox", { name: "Postman API client", exact: true }).check();
    await expectNoHorizontalOverflow(page);
    await page.addScriptTag({ path: AXE });
    const violations = await page.evaluate(async () => (await window.axe.run({ include: [["#wb-form"], ["#wb-results"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`));
    expect(violations).toEqual([]);
  });

});
