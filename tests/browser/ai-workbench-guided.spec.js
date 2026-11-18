/**
 * AI Workbench: the guided single panel (AI programme D20; docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md).
 * Every profession first; the same panel then shows only that profession's tasks, only the questions the task needs,
 * the tools, the visitor, the AI product and the prompt. Nothing navigates or reloads, the page around the panel does
 * not change, Back keeps the answers, Start over leaves nothing behind, older Work Pack files still open.
 */
import { fileURLToPath } from "node:url";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const AXE = fileURLToPath(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url));
const ready = (page) => page.locator("#wb-form[data-ready]").waitFor();
const title = (page) => page.locator("#wb-step-title");
const next = (page) => page.locator("[data-panel=next]");
const master = (page) => page.locator("#wb-master");

test.describe("AI Workbench: guided panel", () => {

  test("all professions, then only that profession's tasks and questions, in one panel without navigating; Back keeps answers; Start over clears @portable", async ({ page, go, watch }) => {
    await go("tools/ai-workbench/");
    await ready(page);
    const url = page.url();
    await page.evaluate(() => { window.__samePage = true; });
    const header = await page.locator("header").first().boundingBox();

    await expect(title(page)).toHaveText("What is your role?");
    await expect(page.locator("[data-role-pick]")).toHaveCount(22);
    await expect(page.locator("#wb-outcomes")).toBeHidden();

    await page.getByRole("button", { name: /^QA engineer or software tester/ }).click();
    await expect(title(page)).toHaveText("What do you want to accomplish?");
    const tasks = page.locator("[data-guide-task]");
    await expect(tasks).toHaveCount(8);
    await expect(tasks.filter({ hasText: "A test plan" })).toHaveCount(1);
    await expect(tasks.filter({ hasText: "A business plan" })).toHaveCount(0);

    await tasks.filter({ hasText: "A test plan" }).click();
    await expect(title(page)).toHaveText("What is being tested");
    await expect(page.locator("#wb-steps [aria-current=step]")).toHaveText("Details");
    await page.locator("#wb-q-feature").fill("Appointment booking for a clinic: patients book, staff confirm");
    await next(page).click();
    await expect(title(page)).toHaveText("Kind of testing in scope");
    await page.getByRole("button", { name: "Functional and regression" }).click();
    await expect(title(page)).toHaveText("Anything else that helps? (optional)");
    await expect(next(page)).toHaveText("Skip");
    await next(page).click();
    await expect(title(page)).toHaveText("Which tools do you use for this?");
    await page.getByRole("checkbox", { name: "Jira work tracking", exact: true }).check();
    await next(page).click();
    await expect(title(page)).toHaveText("About you and your project (optional)");
    await next(page).click();
    await expect(title(page)).toHaveText("Where will you use the prompt?");
    await next(page).click();
    await expect(title(page)).toHaveText("Your prompt");
    await expect(master(page)).toContainText("Act as a senior test manager");
    await expect(master(page)).toContainText("Appointment booking for a clinic");
    await expect(master(page)).toContainText("Working in Jira");
    await expect(master(page)).toContainText("Testing in scope: Functional and regression");
    await expect(page.locator("#wb-form")).toBeHidden();

    /* back to a choice, change it: the other answers stay */
    for (let i = 0; i < 5; i += 1) await page.locator("[data-panel=back]").click();
    await expect(title(page)).toHaveText("Kind of testing in scope");
    await expect(page.getByRole("button", { name: "Functional and regression" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "End-to-end release testing" }).click();
    for (let i = 0; i < 4; i += 1) await next(page).click();
    await expect(title(page)).toHaveText("Your prompt");
    await expect(master(page)).toContainText("Testing in scope: End-to-end release testing");
    await expect(master(page)).toContainText("Appointment booking for a clinic");
    await expect(master(page)).toContainText("Working in Jira");

    /* start over: nothing from the first journey reaches the second */
    await page.locator("[data-panel=restart]").click();
    await expect(title(page)).toHaveText("What is your role?");
    await page.getByRole("button", { name: /^Software developer/ }).click();
    await page.locator("[data-guide-task]").filter({ hasText: "Debug a problem" }).click();
    const steps = await page.locator("#wb-steps li").allTextContents();
    while ((await title(page).textContent()) !== "Your prompt") await next(page).click();
    await expect(master(page)).not.toContainText("Appointment booking");
    await expect(master(page)).not.toContainText("Jira");
    await expect(master(page)).toContainText("I work as a software developer");
    expect(steps[0]).toBe("Role");

    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => window.__samePage)).toBe(true);
    expect(await page.locator("header").first().boundingBox()).toEqual(header);
    expect(watch.pageErrors).toEqual([]);
    expect(watch.external).toEqual([]);
  });

  test("the role search filters every profession; keyboard reaches and presses a role; the full page and back", async ({ page, go }) => {
    await go("tools/ai-workbench/");
    await ready(page);
    await page.getByLabel("Find your role").fill("legal");
    await expect(page.locator("[data-role-pick]:visible")).toHaveCount(1);
    await page.getByLabel("Find your role").fill("zzz");
    await expect(page.locator("#wb-role-none")).toBeVisible();
    await page.getByLabel("Find your role").fill("");
    await page.getByLabel("Find your role").press("Tab");
    await expect(page.locator("[data-role-pick]").first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(title(page)).toHaveText("What do you want to accomplish?");
    await page.getByRole("button", { name: "Show everything on one page" }).click();
    await expect(page.locator("#wb-outcomes")).toBeVisible();
    await page.getByRole("button", { name: "Back to the guided steps" }).click();
    await expect(title(page)).toHaveText("What do you want to accomplish?");
  });

  test("a content creator's short video gets the short-form method; changing task keeps the answers both tasks share", async ({ page, go }) => {
    await go("tools/ai-workbench/");
    await ready(page);
    await page.getByRole("button", { name: /^Content writer or blogger/ }).click();
    await page.locator("[data-guide-task]").filter({ hasText: "A script for a video or podcast" }).click();
    await page.locator("#wb-q-topic").fill("Three ways to cut a grocery bill");
    while ((await title(page).textContent()) !== "For") await next(page).click();
    await page.getByRole("button", { name: "A short vertical video" }).click();
    while ((await title(page).textContent()) !== "Your prompt") await next(page).click();
    await expect(master(page)).toContainText("Short vertical video method");
    await expect(master(page)).not.toContainText("Structure for a longer video");
    await expect(master(page)).toContainText("short-form video producer");

    /* a QA engineer moving from a test plan to test cases keeps what is being tested */
    await page.locator("[data-panel=restart]").click();
    await page.getByRole("button", { name: /^QA engineer or software tester/ }).click();
    await page.locator("[data-guide-task]").filter({ hasText: "A test plan" }).click();
    await page.locator("#wb-q-feature").fill("Password reset by email");
    while ((await title(page).textContent()) !== "What do you want to accomplish?") await page.locator("[data-panel=back]").click();
    await page.locator("[data-guide-task]").filter({ hasText: "Test scenarios and test cases" }).click();
    await expect(page.locator("#wb-q-feature")).toHaveValue("Password reset by email");
    await expect(page.locator("#wb-details-title")).toContainText("test scenarios");
  });

  test("another approach changes the method and keeps the task and answers; concise and full; one section to copy; the approach is saved and restored", async ({ page, go }) => {
    await go("tools/ai-workbench/");
    await ready(page);
    await page.getByRole("button", { name: /^QA engineer or software tester/ }).click();
    await page.locator("[data-guide-task]").filter({ hasText: "API tests" }).click();
    await page.locator("#wb-q-api").fill("Banking API: accounts and statements");
    while ((await title(page).textContent()) !== "Your prompt") await next(page).click();
    await expect(master(page)).not.toContainText("Professional approach:");

    await page.getByRole("button", { name: "Generate another approach" }).click();
    await expect(master(page)).toContainText("Professional approach: Risk-based");
    await expect(page.locator("#wb-approach-why")).toContainText("Risk-based:");
    await expect(page.locator(".wb-strategy")).toContainText("Risk-based");
    await page.getByRole("button", { name: "Generate another approach" }).click();
    await expect(master(page)).toContainText("Professional approach: Requirements traceability");
    await expect(master(page)).not.toContainText("Professional approach: Risk-based");
    await expect(master(page)).toContainText("Banking API: accounts and statements");
    await expect(master(page)).toContainText("payments or banking");

    const full = await master(page).textContent();
    await page.getByRole("radio", { name: /^Concise/ }).check();
    await expect(page.locator("#wb-h-master")).toContainText("Concise prompt");
    await expect(master(page)).toContainText("Cover, in this order:");
    await expect(master(page)).toContainText("Professional approach: Requirements traceability");
    expect((await master(page).textContent()).length).toBeLessThan(full.length);
    await page.locator("#wb-other-version > summary").click();
    await expect(page.locator("#wb-alt")).toHaveText(full);

    await page.locator("#wb-sections > summary").click();
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.locator("#wb-sections [data-copy]").first().click();
    await expect(page.locator("#wb-live")).toContainText(/copied|Copying was refused/);

    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#wb-download").click()]);
    const file = (await import("node:fs")).readFileSync(await download.path(), "utf8");
    expect(file).toContain("\"approach\":\"trace\"");
    expect(file).toContain("\"version\":\"concise\"");
    expect(file).toContain("## Concise prompt");
    await page.locator("[data-panel=restart]").click();
    await page.getByRole("button", { name: /^Other ways to start/ }).click();
    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill(file);
    await page.locator("#wb-open-button").click();
    await expect(page.locator("#wb-approach")).toHaveValue("trace");
    await expect(page.getByRole("radio", { name: /^Concise/ })).toBeChecked();
    await expect(master(page)).toContainText("Professional approach: Requirements traceability");
  });

  test("playbooks load when their section is first opened, and a step opens its task with its answers", async ({ page, go }) => {
    const loaded = [];
    page.on("request", (r) => { if (/ai-workbench\/playbooks\.js/.test(r.url())) loaded.push(r.url()); });
    await go("tools/ai-workbench/");
    await ready(page);
    expect(loaded).toEqual([]);
    await page.getByRole("button", { name: /^Other ways to start/ }).click();
    await page.locator("#wb-playbooks summary").click();
    const first = page.locator("#wb-playbook-list [data-playbook]").first();
    await expect(first).toHaveText("Step 1: An article or blog post");
    expect(loaded.length).toBe(1);
    await first.click();
    await expect(page.locator("#wb-details-title")).toContainText("An article or blog post");
    await expect(page.locator("#wb-live")).toContainText("Filled from the playbook \"Weekly article or newsletter\"");
  });

  test("a saved Work Pack from before the guided panel, missing the newer fields, still opens; an unknown task is reported", async ({ page, go }) => {
    await go("tools/ai-workbench/");
    await ready(page);
    await page.getByRole("button", { name: /^Other ways to start/ }).click();
    await page.locator("#wb-open summary").click();
    const old = `# AI Work Pack: Testing: a test plan\n\n<!-- toolzenhub:{"kind":"work-pack","format":1,"version":2,"date":"2026-11-10","task":"test-plan","answers":{"feature":"Coupons at checkout"},"role":"","experience":"","depth":"standard"} -->`;
    await page.locator("#wb-open-text").fill(old);
    await page.locator("#wb-open-button").click();
    await expect(master(page)).toContainText("Coupons at checkout");
    await expect(page.getByRole("radio", { name: /^Detailed/ })).toBeChecked();
    await page.locator("#wb-reset").click();
    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill(old.replace("test-plan", "no-such-task"));
    await page.locator("#wb-open-button").click();
    await expect(page.locator("#wb-open-error")).toContainText("no longer offered");
  });

  for (const width of [390, 412, 820, 1280]) {
    test(`the panel fits ${width}px and passes axe at each kind of step, light and dark @desktop-only`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 900 });
      await go("tools/ai-workbench/");
      await ready(page);
      const axe = async () => {
        await expectNoHorizontalOverflow(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        if (!(await page.evaluate(() => Boolean(window.axe)))) await page.addScriptTag({ path: AXE });
        return page.evaluate(async () => (await window.axe.run({ include: [["#wb-panel"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
      };
      for (const theme of ["light", "dark"]) {
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        if (theme === "light") {
          expect(await axe()).toEqual([]);
          await page.getByRole("button", { name: /^Data analyst/ }).click();
          expect(await axe()).toEqual([]);
          await page.locator("[data-guide-task]").filter({ hasText: "dashboard" }).click();
          await expect(title(page)).not.toHaveText("What do you want to accomplish?");
          expect(await axe()).toEqual([]);
        } else {
          while ((await title(page).textContent()) !== "Your prompt") await next(page).click();
          expect(await axe()).toEqual([]);
        }
      }
    });
  }

});
