/**
 * AI ecosystem programme (docs/ecosystem-review/ai-ecosystem/17-FINAL-DESIGN.md), Phase 3: the journeys across the AI tools.
 * Three products since D22 (26-CONSOLIDATION.md): AI Home's links, a Work Pack that downloads and opens again, the AI Prompt
 * Builder handing its prompt to the AI Answer Checker, the project context pack (inside the Prompt Builder) reading an AI's reply and
 * going into the prompt, the retired addresses, and the privacy promises: nothing leaves the site, nothing is stored, no typed text
 * reaches the address bar. Engines are covered by tests/unit/ai-ecosystem.test.mjs.
 */
import fs from "node:fs";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const storageKeys = (page) => page.evaluate(() => ({ local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage).sort() }));

/* the theme and the analytics choice are the site's only approved keys (rules 7.7, 8.8); the AI tools add none */
const onlyApproved = (keys) => keys.local.every((k) => ["tz-theme", "tz-analytics-consent"].includes(k)) && keys.session.length === 0;

const answerTestPlan = async (page) => {
  await page.locator("#wb-q-feature").fill("Checkout coupon codes for signed-in customers");
  await page.locator("#wb-q-scope").selectOption({ index: 2 });
  await expect(page.locator("#wb-pack-body")).toContainText("Ready.");
};

test.describe("AI ecosystem", () => {

  test("AI Home: the start block links into the AI Prompt Builder and the AI Answer Checker; a common start opens its task in the conversation; no overflow", async ({ page, go, watch }) => {
    await go("ai-tools.html");
    const start = page.locator(".ai-start");
    await expect(start.locator("h2")).toHaveText("What would you like to create today?");
    await expect(start.locator(".ai-start__chips").first().locator("a")).toHaveCount(8);
    await expect(start.getByRole("link", { name: "Compare two AI answers" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await start.getByRole("link", { name: "A test plan" }).click();
    await page.locator("#wb-form[data-ready]").waitFor();
    await expect(page.locator("#wb-step-title")).toHaveText("What is being tested");
    await expect(page.locator("#wb-q-feature")).toBeVisible();
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("the full page: describe, choose, answer; download the pack and open it again: the same main prompt; nothing stored @portable", async ({ page, go, watch }) => {
    await go("tools/prompt-builder/?start=describe");
    await page.locator("#wb-form[data-ready]").waitFor();
    await expect(page.locator("#wb-describe")).toBeFocused();
    await page.locator("#wb-describe").fill("test plan for a coupon feature");
    await page.locator("#wb-describe").press("Enter");
    await page.locator("[data-use-task='test-plan']").click();
    await answerTestPlan(page);
    await page.locator("#wb-project").fill("React web app; release on the 20th");
    await expect(page.locator("#wb-master")).toContainText("Project context (from my notes");
    const before = await page.locator("#wb-master").textContent();

    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#wb-download").click()]);
    expect(download.suggestedFilename()).toMatch(/^ai-work-pack-test-plan-\d{4}-\d{2}-\d{2}\.md$/);
    const file = fs.readFileSync(await download.path(), "utf8");
    expect(file).toContain("<!-- toolzenhub:");
    expect(page.url(), "typed text never reaches the address bar").not.toContain("coupon");

    await page.locator("#wb-reset").click();
    await expect(page.locator("#wb-details")).toBeHidden();
    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill(file);
    await page.locator("#wb-open-button").click();
    await expect(page.locator("#wb-suggestion")).toContainText("Opened");
    await expect(page.locator("#wb-master")).toHaveText(before);

    await page.locator("#wb-open summary").click();
    await page.locator("#wb-open-text").fill("# just some notes");
    await page.locator("#wb-open-button").click();
    await expect(page.locator("#wb-open-error")).toContainText("not a Work Pack file");

    expect(onlyApproved(await storageKeys(page))).toBe(true);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("Prompt Builder to Answer Checker: the prompt arrives in the same tab; the review names what the answer missed @desktop-only", async ({ page, go, watch }) => {
    await go("tools/prompt-builder/?task=test-plan");
    await page.locator("#wb-form[data-ready]").waitFor();
    await expect(page.locator("#wb-q-feature")).toBeVisible();
    await page.getByRole("button", { name: "Show everything on one page" }).click();
    await answerTestPlan(page);
    await page.locator("#wb-to-review").click();
    await expect(page.locator("h1")).toHaveText("AI Answer Checker");
    await expect(page.getByRole("radio", { name: "Review one answer" })).toBeChecked();
    await page.locator("#ac-form[data-ready]").waitFor();
    await expect(page.locator("#ac-question")).toHaveValue(/Write a test plan for the following/);
    await page.locator("#ac-answer").fill("Test plan. Scope: coupons at checkout. Out of scope: payments. TODO add the schedule");
    await expect(page.locator("#ac-output")).toHaveValue(/# Review of an AI answer/);
    await expect(page.locator("#ac-output")).toHaveValue(/not visibly addressed/);
    await expect(page.locator("#ac-output")).toHaveValue(/The answer contains TODO/);
    await expect(page.locator("#ac-follow-up")).toBeEnabled();
    await expect(page.locator("#ac-check")).toContainText("Review:");
    expect(await page.locator("#ac-output").inputValue()).not.toMatch(/\bverified\b|\baccurate\b/i);
    expect(onlyApproved(await storageKeys(page))).toBe(true);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("the project context pack, inside the Prompt Builder: an AI's reply fills it by heading; modes keep every field; the pack goes into the prompt @desktop-only", async ({ page, go, watch }) => {
    await go("tools/prompt-builder/?start=context");
    await page.locator("#wb-form[data-ready]").waitFor();
    await expect(page.locator("#wb-bridge-fold")).toHaveAttribute("open", "");
    await page.locator("#cp-form[data-ready]").waitFor();
    await expect(page.locator("h1")).toHaveText("AI Prompt Builder");
    await page.locator("#cp-mode").selectOption("handoff");
    await page.locator("#cp-extract summary").click();
    await expect(page.locator("#cp-extract-prompt")).toContainText("## Decisions");
    await page.locator("#cp-reply-text").fill("## Project name\nShop\n## Purpose\nAn online shop for tea.\n## Current state\nBeta, 40 customers.\n## Decisions\n- Postgres\n## The next task\nAdd coupon codes.");
    await page.locator("#cp-reply-fill").click();
    await expect(page.locator("#cp-reply-note")).toContainText("Filled 5 sections");
    await expect(page.locator("#cp-project")).toHaveValue("Shop");
    await expect(page.locator("#cp-output")).toHaveValue(/^# Handoff: Shop/);
    await page.locator("#cp-mode").selectOption("agent");
    await expect(page.locator("#cp-output")).toHaveValue(/^# Shop: instructions for coding assistants/);
    await expect(page.locator("#cp-decisions")).toHaveValue("Postgres");
    await page.locator("#cp-mode").selectOption("brief");
    await page.locator("#cp-state").fill("Beta, 40 customers. api_key = abcd1234efgh");
    await expect(page.locator("#cp-check")).toContainText("looks like a password or key");

    await page.locator("#cp-use").click();
    await expect(page.locator("#wb-project")).toHaveValue(/# Project context: Shop/);
    await expect(page.locator("#wb-suggestion")).toContainText("The context pack is in Project context");
    expect(onlyApproved(await storageKeys(page))).toBe(true);
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("every AI page fits its width (no page-level horizontal scroll) and the start panel's controls are reachable", async ({ page, go }) => {
    for (const path of ["ai-tools.html", "tools/prompt-builder/", "tools/prompt-builder/?start=context", "tools/ai-answer-checker/", "tools/ai-answer-checker/?mode=compare", "ai-tools/directory/"]) {
      await go(path);
      const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(o.sw, `${path}: scrollWidth ${o.sw} > viewport ${o.iw}`).toBeLessThanOrEqual(o.iw + 1);
    }
    await go("tools/prompt-builder/");
    await page.locator("#wb-form[data-ready]").waitFor();
    /* the guided steps' controls first (one question at a time, 2026-11-19), then the full page's start controls */
    expect((await page.locator("#wb-role-input").boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.locator("#wb-role-input").click();
    expect((await page.getByRole("option").first().boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /^More ways to start/ }).click();
    const box = await page.locator("#wb-suggest").boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("the retired addresses go to the product that now does the job, keep a link's own start, and are never indexed @portable", async ({ page, go }) => {
    const cases = [
      ["tools/ai-workbench/?outcome=video", /\/tools\/prompt-builder\/\?outcome=video$/],
      ["tools/bug-report-prompt/", /\/tools\/prompt-builder\/\?task=debug$/],
      ["tools/context-pack-builder/", /\/tools\/prompt-builder\/\?start=context$/],
      ["tools/meeting-notes-action-plan/", /\/tools\/prompt-builder\/\?task=meeting-follow-up$/],
      ["tools/qa-workbench/", /\/tools\/prompt-builder\/\?role=qa$/],
      ["tools/ai-answer-checklist/", /\/tools\/ai-answer-checker\/$/],
      ["tools/ai-answer-compare/", /\/tools\/ai-answer-checker\/\?mode=compare$/]
    ];
    for (const [from, to] of cases) {
      await go(from);
      await page.waitForURL(to);
    }
    /* the compare link opens the second mode */
    await expect(page.getByRole("radio", { name: "Compare two answers" })).toBeChecked();
    await expect(page.locator("#cmp-answerA")).toBeVisible();
    await expect(page.locator("#ac-answer")).toBeHidden();
    /* the page left at the old address: noindex, canonical on the new one */
    /* fetched from the page, so the test server answers it; a fetch never runs the page's script */
    const html = await page.evaluate(async (u) => (await fetch(u)).text(), page.url().replace(/tools\/ai-answer-checker\/\?mode=compare$/, "tools/ai-answer-compare/"));
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+\/tools\/ai-answer-checker\/">/);
  });

});
