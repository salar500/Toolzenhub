/**
 * AI Prompt Builder: one question at a time (2026-11-19, replacing the conversation of D22;
 * docs/ecosystem-review/ai-ecosystem/23-GUIDED-PANEL.md). The role first, from one searchable list; then the task;
 * then only the questions the task needs, each replacing the last (a choice moves on by itself); "Anything else we
 * should know?"; Generate my prompt replaces the steps with the prompt and its actions. The answers so far are a trail
 * of buttons; pressing one reopens its question with the answer kept. Reuse selections keeps the role, task, answers
 * and preferences and clears the project's own details; New prompt leaves nothing behind. Nothing navigates or
 * reloads, nothing leaves the site, older Work Pack files still open.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const AXE = fileURLToPath(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url));
const ready = (page) => page.locator("#wb-form[data-ready]").waitFor();
const title = (page) => page.locator("#wb-step-title");
const next = (page) => page.locator("[data-panel=next]");
const master = (page) => page.locator("#wb-master");
const trail = (page) => page.locator("#wb-trail");

const chooseRole = async (page, name) => {
  await page.locator("#wb-role-input").click();
  await page.getByRole("option", { name }).click();
};
const chooseTask = async (page, name) => {
  await page.locator("#wb-task-input").click();
  await page.getByRole("option", { name, exact: true }).click();
};
/* Continue or Skip until the step with this title */
const until = async (page, text) => {
  for (let i = 0; i < 20 && (await title(page).textContent()) !== text; i += 1) await next(page).click();
  await expect(title(page)).toHaveText(text);
};
const generate = async (page) => {
  await until(page, "Anything else we should know?");
  await page.getByRole("button", { name: "Generate my prompt" }).click();
  await expect(title(page)).toHaveText("Your prompt");
};

test.describe("AI Prompt Builder: one question at a time", () => {

  test("role, task and only that task's questions, each replacing the last; generate; the trail changes an answer; edit, copy, download; reuse; new prompt leaves nothing behind @portable", async ({ page, go, watch }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    const url = page.url();
    await page.evaluate(() => { window.__samePage = true; });
    const header = await page.locator("header").first().boundingBox();

    /* the first screen: one question and one list, closed until it is used */
    await expect(title(page)).toHaveText("What best describes your role?");
    await expect(page.locator("#wb-role-input")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#wb-trail-nav")).toBeHidden();
    await expect(page.locator("#wb-outcomes")).toBeHidden();
    await page.locator("#wb-role-input").click();
    await expect(page.getByRole("option")).toHaveCount(23); // 22 professions and "My role is not listed"
    await page.keyboard.press("Escape");

    await chooseRole(page, /^QA engineer or software tester/);
    await expect(title(page)).toHaveText("What would you like help with?");
    await expect(page.locator("#wb-role-input")).toBeHidden(); // replaced, not stacked
    await expect(trail(page).getByRole("button")).toHaveText(["Role: QA engineer or software tester. Change"]);
    await page.locator("#wb-task-input").click();
    const tasks = page.getByRole("option");
    await expect(tasks).toHaveCount(11);
    await expect(tasks.last()).toHaveText("Any other task: one well-built prompt");
    await expect(page.getByRole("option", { name: "A business plan" })).toHaveCount(0);
    await page.getByRole("option", { name: "A test plan", exact: true }).click();

    await expect(title(page)).toHaveText("What are you testing?");
    await expect(page.locator("#wb-task-input")).toBeHidden();
    await expect(next(page)).toHaveText("Skip for now");
    await page.locator("#wb-q-feature").fill("Appointment booking for a clinic: patients book, staff confirm");
    await expect(next(page)).toHaveText("Continue");
    await next(page).click();
    await expect(page.locator("#wb-q-feature")).toBeHidden();
    await until(page, "Kind of testing in scope");
    await page.getByRole("button", { name: "Functional and regression" }).click(); // a choice moves on by itself
    await expect(title(page)).not.toHaveText("Kind of testing in scope");
    await until(page, "Which tools do you use for this?");
    await page.getByRole("checkbox", { name: "Jira work tracking", exact: true }).check();
    await next(page).click();
    await expect(title(page)).toHaveText("Anything else we should know?");
    await page.getByLabel("Project details, constraints or instructions (optional)").fill("Release on Friday; two testers.");
    await page.getByRole("button", { name: "Generate my prompt" }).click();

    await expect(title(page)).toHaveText("Your prompt");
    await expect(page.locator("#wb-form")).toBeHidden(); // the result replaces the steps
    await expect(page.locator("#wb-result-sum")).toHaveText("QA engineer or software tester · A test plan");
    await expect(master(page)).toContainText("Act as a senior test manager");
    await expect(master(page)).toContainText("Appointment booking for a clinic");
    await expect(master(page)).toContainText("Working in Jira");
    await expect(master(page)).toContainText("Testing in scope: Functional and regression");
    await expect(master(page)).toContainText("Release on Friday; two testers.");

    /* the trail reopens an answer with its value; changing it keeps the others */
    await trail(page).getByRole("button", { name: /^Kind of testing in scope: Functional and regression/ }).click();
    await expect(title(page)).toHaveText("Kind of testing in scope");
    await expect(page.getByRole("button", { name: "Functional and regression" })).toHaveAttribute("aria-pressed", "true");
    await expect(next(page)).toHaveText("Continue");
    await page.getByRole("button", { name: "End-to-end release testing" }).click();
    await trail(page).getByRole("button", { name: /^Your prompt/ }).click();
    await expect(master(page)).toContainText("Testing in scope: End-to-end release testing");
    await expect(master(page)).toContainText("Appointment booking for a clinic");
    await expect(master(page)).toContainText("Working in Jira");

    /* edit the prompt: the edit survives a changed answer, and is replaced only on request */
    await page.locator("#wb-edit-main").click();
    await expect(page.locator("#wb-master-edit")).toBeFocused();
    await page.locator("#wb-master-edit").fill("My own version of the prompt");
    await expect(page.locator("#wb-copy-main")).toHaveText("Copy edited prompt");
    await trail(page).getByRole("button", { name: /^What are you testing\?:/ }).click();
    await page.locator("#wb-q-feature").fill("Appointment booking for a dental clinic");
    await trail(page).getByRole("button", { name: /^Your prompt/ }).click();
    await expect(master(page)).toContainText("dental clinic");
    await expect(page.locator("#wb-master-edit")).toHaveValue("My own version of the prompt");
    await expect(page.locator("#wb-edit-note")).toContainText("Your edit is kept");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.locator("#wb-copy-main").click();
    await expect(page.locator("#wb-live")).toContainText(/Edited prompt copied|Copying was refused/);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#wb-download-main").click()]);
    const file = fs.readFileSync(await download.path(), "utf8");
    expect(file).toContain("dental clinic");
    expect(file).toContain("## Your edited prompt\n\nMy own version of the prompt");
    expect(file).toContain("\"kind\":\"work-pack\"");
    await page.locator("#wb-edit-replace").click();
    await expect(page.locator("#wb-master-edit")).toHaveValue(await master(page).textContent());
    await expect(page.locator("#wb-copy-main")).toHaveText("Copy prompt");

    /* reuse: the role, task, answers and tools stay; the project's own details are cleared */
    await page.getByRole("button", { name: "Reuse selections" }).click();
    await expect(title(page)).toHaveText("What would you like help with?");
    await expect(next(page)).toHaveText("Continue");
    await next(page).click();
    await expect(title(page)).toHaveText("What are you testing?");
    await expect(page.locator("#wb-q-feature")).toHaveValue("Appointment booking for a dental clinic");
    await trail(page).getByRole("button", { name: /^Final details:/ }).click();
    await expect(page.getByLabel("Project details, constraints or instructions (optional)")).toHaveValue("");
    await page.getByRole("button", { name: "Generate my prompt" }).click();
    await expect(master(page)).toContainText("Working in Jira");
    await expect(master(page)).not.toContainText("Release on Friday");
    await expect(page.locator("#wb-master-edit")).not.toHaveValue("My own version of the prompt");

    /* a new prompt: nothing from the first journey reaches the second */
    await page.locator("#wb-result-again").getByRole("button", { name: "New prompt" }).click();
    await expect(title(page)).toHaveText("What best describes your role?");
    await expect(page.locator("#wb-trail-nav")).toBeHidden();
    await chooseRole(page, /^Software developer/);
    await chooseTask(page, "Debug a problem or a bug report");
    await page.locator("[data-panel-q] textarea:visible, [data-panel-q] input[type=text]:visible").first().fill("Login fails after the update");
    await generate(page);
    await expect(master(page)).not.toContainText("Appointment booking");
    await expect(master(page)).not.toContainText("Jira");
    await expect(master(page)).toContainText("I work as a software developer");

    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => window.__samePage)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.locator("header").first().boundingBox()).toEqual(header);
    expect(watch.pageErrors).toEqual([]);
    expect(watch.external).toEqual([]);
  });

  test("a role not listed lists every task; typed words find the closest task and answer its first question; something else gives a general prompt @portable", async ({ page, go, watch }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    await chooseRole(page, /^My role is not listed/);
    await expect(trail(page).getByRole("button")).toHaveText(["Role: Role not listed. Change"]);
    const words = "I want to test a healthcare API with patient authentication";
    await page.locator("#wb-task-input").fill(words);
    await expect(page.locator("#wb-task-picker .wb-picker__group").first()).toHaveText("Best matches");
    await expect(page.getByRole("option").first()).toHaveText("API tests");
    await page.keyboard.press("Enter");
    await expect(page.locator("#wb-q-api")).toHaveValue(words);
    await generate(page);
    await expect(master(page)).toContainText("healthcare API with patient authentication");
    await expect(master(page)).toContainText("Use synthetic or fully de-identified data only");

    await trail(page).getByRole("button", { name: /^Task:/ }).click();
    await page.locator("#wb-task-input").fill("plan the seating for a family wedding");
    await page.getByRole("option", { name: "Any other task: one well-built prompt" }).click();
    await expect(page.locator("#wb-q-goal")).toHaveValue("plan the seating for a family wedding");
    await until(page, "How you will judge the result");
    await page.locator("#wb-q-success").fill("Every guest has a seat");
    await generate(page);
    await expect(master(page)).toContainText("plan the seating for a family wedding");
    await expect(master(page)).toContainText("Every guest has a seat.");
    expect(watch.pageErrors).toEqual([]);
    expect(watch.external).toEqual([]);
  });

  test("a press on the role box before the panel's script arrives (slow connection) is not lost: the list opens when it does", async ({ page, go }) => {
    let release;
    const held = new Promise((r) => { release = r; });
    await page.route(/prompt-builder\/panel\.js/, async (route) => {
      await held;
      await route.continue();
    });
    await go("tools/prompt-builder/");
    await page.locator("#wb-role-input").click(); // the box is in the page's markup before any script
    await expect(page.locator("#wb-role-input")).toHaveAttribute("aria-expanded", "false");
    release();
    await ready(page);
    await expect(page.locator("#wb-role-input")).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("option", { name: /^QA engineer/ })).toBeVisible();
  });

  test("the list works by keyboard: arrows, Enter, Escape, typing; no match says so; Back; the full page and back", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    const input = page.locator("#wb-role-input");
    await input.focus();
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    const first = await input.getAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    expect(await input.getAttribute("aria-activedescendant")).not.toBe(first);
    await page.keyboard.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await input.fill("zzz");
    await expect(page.locator(".wb-picker__none")).toContainText("No profession matches");
    await input.fill("legal");
    await expect(page.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(title(page)).toHaveText("What would you like help with?");
    await page.locator("[data-panel=back]").click();
    await expect(title(page)).toHaveText("What best describes your role?");
    await expect(next(page)).toHaveText("Continue"); // the role is kept
    await next(page).click();
    await page.getByRole("button", { name: "Show everything on one page" }).click();
    await expect(page.locator("#wb-outcomes")).toBeVisible();
    await page.locator("#wb-panel-back").getByRole("button", { name: "Back to the guided steps" }).click();
    await expect(title(page)).toHaveText("What would you like help with?");
  });

  test("the chosen role stays visible and can be changed at any step; the one-page view and back keep the role, the task and every answer; the trail is never under the sticky bars (2026-11-20)", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    await chooseRole(page, /^QA engineer or software tester/);
    const chosen = page.locator("#wb-chosen-role");
    await expect(chosen).toContainText("Your role: QA engineer or software tester");
    await page.locator("#wb-task-input").click();
    await expect(page.locator("#wb-task-picker .wb-picker__group").first()).toHaveText("Suggested for QA engineer or software tester");
    await page.keyboard.press("Escape");
    await chosen.getByRole("button", { name: "Change role" }).click();
    await expect(title(page)).toHaveText("What best describes your role?");
    await expect(page.locator("#wb-step-why")).toContainText("You can change it at any time");
    await chooseRole(page, /^Business analyst/);
    await expect(chosen).toContainText("Your role: Business analyst");
    await page.locator("#wb-task-input").click();
    await expect(page.locator("#wb-task-picker .wb-picker__group").first()).toHaveText("Suggested for Business analyst");
    await page.keyboard.press("Escape");
    await chosen.getByRole("button", { name: "Change role" }).click();
    await chooseRole(page, /^QA engineer or software tester/);
    await chooseTask(page, "Test scenarios and test cases");
    await expect(title(page)).toHaveText("What are you testing?");
    /* the trail and the question start below whatever is stuck to the top of the window */
    const stuck = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll("header, nav")].filter((el) => ["sticky", "fixed"].includes(getComputedStyle(el).position) && el.getBoundingClientRect().top <= 1 && el.getBoundingClientRect().width > innerWidth * 0.6).map((el) => el.getBoundingClientRect().bottom)));
    expect((await page.locator("#wb-trail-nav").boundingBox()).y).toBeGreaterThanOrEqual(stuck);
    await page.locator("#wb-q-feature").fill("Coupon codes at checkout");
    await next(page).click();
    await expect(title(page)).toHaveText("Website or web app to explore (optional)");
    await page.locator("#wb-q-site").fill("https://shop.example.com");

    await page.getByRole("button", { name: "Show everything on one page" }).click();
    await expect(page.locator("#wb-q-feature")).toBeVisible();
    await expect(page.locator("#wb-q-site")).toHaveValue("https://shop.example.com");
    const back = page.locator("#wb-panel-back").getByRole("button", { name: "Back to the guided steps" });
    await expect(back).toBeVisible(); // at the top of the one-page view, not only after the whole pack
    await back.click();
    await expect(title(page)).toHaveText("Website or web app to explore (optional)");
    await expect(page.locator("#wb-q-site")).toHaveValue("https://shop.example.com");
    await expect(trail(page).getByRole("button", { name: /^Role:/ })).toContainText("QA engineer or software tester");
    await expect(trail(page).getByRole("button", { name: /^Task:/ })).toContainText("Test scenarios and test cases");
    await expect(page.locator("#wb-q-feature")).toHaveValue("Coupon codes at checkout");
  });

  test("spacing: the panel follows the introduction with one gap, and the hint under a field and the buttons share one gap (2026-11-20)", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    const intro = await page.locator(".calculator-intro").boundingBox();
    const panel = await page.locator("#wb-panel").boundingBox();
    expect(panel.y - (intro.y + intro.height)).toBeLessThanOrEqual(8); // the introduction's own padding is the gap, as on the AI Answer Checker
    await chooseRole(page, /^QA engineer or software tester/);
    const listHint = await page.locator("#wb-task-picker .wb-picker__hint").boundingBox();
    const taskButtons = await page.locator(".wb-panel__buttons").boundingBox();
    expect(taskButtons.y - (listHint.y + listHint.height)).toBeLessThanOrEqual(24);
    await chooseTask(page, "Test scenarios and test cases");
    const hint = await page.locator("[data-panel-q] .calculator-form__help").boundingBox();
    const buttons = await page.locator(".wb-panel__buttons").boundingBox();
    expect(buttons.y - (hint.y + hint.height)).toBeLessThanOrEqual(24);
    const why = await page.locator("#wb-step-why").boundingBox();
    const field = await page.locator("[data-panel-q] .calculator-form__field").boundingBox();
    expect(field.y - (why.y + why.height)).toBeGreaterThanOrEqual(8); // the explanation does not touch the field
  });

  test("a link names a task or a profession: the steps start there", async ({ page, go }) => {
    await go("tools/prompt-builder/?task=release-readiness");
    await ready(page);
    await expect(title(page)).toHaveText("What is being released");
    await go("tools/prompt-builder/?role=qa");
    await ready(page);
    await expect(title(page)).toHaveText("What would you like help with?");
    await page.locator("#wb-task-input").click();
    await expect(page.getByRole("option").first()).toHaveText("Review requirements and acceptance criteria");
  });

  test("changing the role: a task the new role lists stays; one it does not is asked again, keeping the answers both tasks share; a short video gets its method", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    await chooseRole(page, /^QA engineer or software tester/);
    await chooseTask(page, "A test plan");
    await page.locator("#wb-q-feature").fill("Password reset by email");
    await trail(page).getByRole("button", { name: /^Role:/ }).click();
    await chooseRole(page, /^Software developer/);
    await expect(title(page)).toHaveText("What would you like help with?");
    await expect(next(page)).toHaveCount(0); // the test plan is not a developer's task: choose again
    await expect(trail(page).getByRole("button", { name: /^What are you testing\?/ })).toHaveCount(0);
    await page.locator("#wb-task-input").fill("test scenarios");
    await page.getByRole("option", { name: "Test scenarios and test cases", exact: true }).click();
    await expect(page.locator("#wb-q-feature")).toHaveValue("Password reset by email");
    await expect(page.locator("#wb-details-title")).toContainText("test scenarios");

    await page.locator("[data-panel=restart]").click();
    await chooseRole(page, /^Content writer or blogger/);
    await chooseTask(page, "A script for a video or podcast");
    await page.locator("#wb-q-topic").fill("Three ways to cut a grocery bill");
    await until(page, "For");
    await page.getByRole("button", { name: "A short vertical video" }).click();
    await generate(page);
    await expect(master(page)).toContainText("Short vertical video method");
    await expect(master(page)).not.toContainText("Structure for a longer video");
    await expect(master(page)).toContainText("short-form video producer");
  });

  test("nothing answered: Generate says what to do and keeps the step; a missing essential is offered after generating", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    await chooseRole(page, /^Software developer/);
    await chooseTask(page, "Review code");
    await until(page, "Anything else we should know?");
    await page.getByRole("button", { name: "Generate my prompt" }).click();
    await expect(page.locator("#wb-final-error")).toContainText("Answer at least one question first");
    await expect(title(page)).toHaveText("Anything else we should know?");
    await page.locator("#wb-final-error button").click();
    const first = await title(page).textContent();
    await page.locator("[data-panel-q] textarea, [data-panel-q] input").first().fill("A login form in React");
    await generate(page);
    await expect(page.locator("#wb-result-missing")).toContainText("[add: …]");
    await expect(page.locator("#wb-result-missing button").first()).toBeVisible();
    await expect(master(page)).toContainText("[add:");
    expect(first).not.toBe("Anything else we should know?");
  });

  test("the final step's length is the prompt's: Concise leads with the concise prompt; settings, another approach and a reopened file keep it", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    await chooseRole(page, /^QA engineer or software tester/);
    await chooseTask(page, "API tests");
    await page.locator("#wb-q-api").fill("Banking API: accounts and statements");
    await until(page, "Anything else we should know?");
    await page.locator("#wb-style").getByText("Concise", { exact: true }).click();
    await page.getByRole("button", { name: "Generate my prompt" }).click();
    await expect(page.locator("#wb-h-master")).toContainText("Concise prompt");
    await expect(master(page)).toContainText("Cover, in this order:");

    await page.locator("#wb-settings > summary").click();
    await expect(page.locator("input[name=wb-version][value=concise]")).toBeChecked();
    await page.getByRole("button", { name: "Generate another approach" }).click();
    await expect(master(page)).toContainText("Professional approach: Risk-based");
    await expect(master(page)).toContainText("Banking API: accounts and statements");
    await page.locator("input[name=wb-version][value=full]").check();
    const full = await master(page).textContent();
    await page.locator("input[name=wb-version][value=concise]").check();
    expect((await master(page).textContent()).length).toBeLessThan(full.length);
    await page.locator("#wb-other-version > summary").click();
    await expect(page.locator("#wb-alt")).toHaveText(full);

    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#wb-download-main").click()]);
    const file = fs.readFileSync(await download.path(), "utf8");
    expect(file).toContain("\"approach\":\"risk\"");
    expect(file).toContain("\"version\":\"concise\"");
    await page.locator("#wb-result-again").getByRole("button", { name: "New prompt" }).click();
    await page.getByRole("button", { name: /^More ways to start/ }).click();
    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill(file);
    await page.locator("#wb-open-button").click();
    await expect(page.locator("#wb-approach")).toHaveValue("risk");
    await expect(page.locator("input[name=wb-version][value=concise]")).toBeChecked();
    await expect(master(page)).toContainText("Professional approach: Risk-based");
  });

  test("playbooks load when their section is first opened, and a step opens its task with its answers", async ({ page, go }) => {
    const loaded = [];
    page.on("request", (r) => { if (/prompt-builder\/playbooks\.js/.test(r.url())) loaded.push(r.url()); });
    await go("tools/prompt-builder/");
    await ready(page);
    expect(loaded).toEqual([]);
    await page.getByRole("button", { name: /^More ways to start/ }).click();
    await page.locator("#wb-playbooks summary").click();
    const first = page.locator("#wb-playbook-list [data-playbook]").first();
    await expect(first).toHaveText("Step 1: An article or blog post");
    expect(loaded.length).toBe(1);
    await first.click();
    await expect(page.locator("#wb-details-title")).toContainText("An article or blog post");
    await expect(page.locator("#wb-live")).toContainText("Filled from the playbook \"Weekly article or newsletter\"");
  });

  test("a saved Work Pack from before the guided panel, missing the newer fields, still opens; an unknown task is reported", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await ready(page);
    await page.getByRole("button", { name: /^More ways to start/ }).click();
    await page.locator("#wb-open summary").click();
    const old = `# AI Work Pack: Testing: a test plan\n\n<!-- toolzenhub:{"kind":"work-pack","format":1,"version":2,"date":"2026-11-10","task":"test-plan","answers":{"feature":"Coupons at checkout"},"role":"","experience":"","depth":"standard"} -->`;
    await page.locator("#wb-open-text").fill(old);
    await page.locator("#wb-open-button").click();
    await expect(master(page)).toContainText("Coupons at checkout");
    await expect(page.locator("input[name=wb-detail][value=detailed]")).toBeChecked();
    await page.locator("#wb-reset").click();
    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill(old.replace("test-plan", "no-such-task"));
    await page.locator("#wb-open-button").click();
    await expect(page.locator("#wb-open-error")).toContainText("no longer offered");
  });

  for (const width of [320, 360, 390, 430, 820, 1280]) {
    test(`every kind of step fits ${width}px and passes axe, light and dark @desktop-only`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await go("tools/prompt-builder/");
      await ready(page);
      await page.addScriptTag({ path: AXE });
      const check = async (where) => {
        for (const theme of ["light", "dark"]) {
          await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
          await page.waitForTimeout(400); // colours change with a short transition; measure the settled theme
          await expectNoHorizontalOverflow(page);
          await page.evaluate(() => window.scrollTo(0, 0)); // a field scrolled under the sticky bars would count as obscured
          const violations = await page.evaluate(async () => (await window.axe.run({ include: [["#wb-panel"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
          expect(violations, `${where}, ${theme}`).toEqual([]);
        }
        await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
      };
      /* the first question is in view without scrolling */
      expect((await page.locator("#wb-role-input").boundingBox()).y + 48).toBeLessThan(800);
      await page.locator("#wb-role-input").click();
      await check("role list open");
      await page.getByRole("option", { name: /^Data analyst/ }).click();
      await page.locator("#wb-task-input").click();
      await check("task list open");
      await page.getByRole("option", { name: "A business performance dashboard" }).click();
      await check("first question");
      const typed = page.locator("[data-panel-q] textarea:visible, [data-panel-q] input[type=text]:visible");
      if (await typed.count()) {
        await typed.first().fill("Monthly sales by region");
        await next(page).click();
      } else await page.locator(".wb-pick button").first().click();
      await check("second question");
      await until(page, "Anything else we should know?");
      await page.locator("#wb-options > summary").click();
      await check("final step");
      await page.getByRole("button", { name: "Generate my prompt" }).click();
      await expect(title(page)).toHaveText("Your prompt");
      await check("prompt");
    });
  }

});
