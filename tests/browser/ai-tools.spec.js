/**
 * AI Tools (Tool Pack 56, 2026-11-11): the three brief builders, their section page and the home card.
 * Each tool composes its brief in the browser as the visitor types; nothing is sent and nothing is stored.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const TOOLS = [
  { id: "prompt-builder", prefix: "pb", first: "goal", essentials: 2, title: "AI Prompt Builder", heading: "# Task" },
  { id: "bug-report-prompt", prefix: "bug", first: "observed", essentials: 3, title: "Bug Report to Debugging Prompt", heading: "# Debugging task" },
  { id: "context-pack-builder", prefix: "cp", first: "project", essentials: 4, title: "Project Context Pack Builder", heading: "# Project context:" }
];

test.describe("AI Tools", () => {
  for (const t of TOOLS) {
    test(`${t.id}: empty, then one field makes an incomplete brief, the example makes it ready, copy and reset work, nothing leaves the site`, async ({ page, go, watch }) => {
      await go(`tools/${t.id}/`);
      await expect(page.locator("h1")).toHaveText(t.title);
      await page.locator(`#${t.prefix}-form[data-ready]`).waitFor(); // the module has wired the form
      const check = page.locator(`#${t.prefix}-check`);
      const output = page.locator(`#${t.prefix}-output`);
      await expect(check).toHaveAttribute("data-state", "empty");
      await expect(output).toHaveValue("");
      await expect(page.locator(`#${t.prefix}-copy`)).toBeDisabled();

      await page.locator(`#${t.prefix}-${t.first}`).fill("Something short");
      await expect(check).toHaveAttribute("data-state", "incomplete");
      await expect(check).toContainText(`${t.essentials - 1} essential${t.essentials - 1 === 1 ? "" : "s"} missing`);
      await expect(output).not.toHaveValue("");

      await page.locator(`#${t.prefix}-load-example`).click();
      await expect(check).toHaveAttribute("data-state", "ok");
      await expect(check).toContainText("Ready to paste");
      expect(await output.inputValue()).toContain(t.heading);
      await expect(page.locator(`#${t.prefix}-copy`)).toBeEnabled();
      await expect(page.locator(`#${t.prefix}-download`)).toBeEnabled();

      await page.locator(`#${t.prefix}-reset`).click();
      await expect(check).toHaveAttribute("data-state", "empty");
      await expect(output).toHaveValue("");
      await expect(page.locator(`#${t.prefix}-${t.first}`)).toBeFocused();

      expect(watch.external, "nothing leaves the site").toEqual([]);
      expect(watch.pageErrors).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("every field has a visible label and a linked hint; the brief is editable; the related tools stay inside the section @portable", async ({ page, go }) => {
    await go("tools/prompt-builder/");
    await page.locator("#pb-form[data-ready]").waitFor();
    const controls = page.locator("#pb-form .calculator-form__input");
    const n = await controls.count();
    expect(n).toBe(10);
    for (let i = 0; i < n; i++) {
      const el = controls.nth(i);
      const id = await el.getAttribute("id");
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      await expect(page.locator(`#${id}-hint`)).toBeVisible();
    }
    await page.locator("#pb-load-example").click();
    await page.locator("#pb-output").fill("my own text");
    await expect(page.locator("#pb-output")).toHaveValue("my own text");
    const related = page.locator(".related-section a[href*='/tools/'], .related-calculators a[href*='/tools/']");
    for (const href of await related.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) expect(href).toMatch(/\/tools\/(bug-report-prompt|context-pack-builder|ai-answer-checklist)\/$/);
  });

  test("the section page lists the three tools, the home page has the seventh card, and All Tools knows the section @portable", async ({ page, go, siteRoot }) => {
    await go("ai-tools.html");
    await expect(page.locator("h1")).toContainText("AI Tools");
    const main = page.locator(".ecosystem-main");
    for (const t of TOOLS) await expect(main.locator(`a[href="${siteRoot}tools/${t.id}/"]`).first()).toBeVisible();
    await go("");
    const card = page.locator("#categories .category-card", { hasText: "AI Tools" });
    await expect(card).toHaveAttribute("href", `${siteRoot}ai-tools.html`);
    await expect(card).toContainText("4 tools");
    await go("tools.html");
    await expect(page.locator(`#tools-directory a[href="${siteRoot}tools/context-pack-builder/"]`).first()).toBeVisible(); // the directory's own listing, not the hidden rail
  });

  test("the evidence checklist: a pasted answer is ready at once, its figures and absolutes are listed, and a reset empties it", async ({ page, go, watch }) => {
    await go("tools/ai-answer-checklist/");
    await page.locator("#ac-form[data-ready]").waitFor();
    await page.locator("#ac-answer").fill("FD rates are around 7.5% for 5 years and deposits are always safe.");
    await expect(page.locator("#ac-check")).toHaveAttribute("data-state", "ok");
    const text = await page.locator("#ac-output").inputValue();
    expect(text).toContain("1. [ ] \"FD rates are around 7.5% for 5 years and deposits are always safe.\"");
    expect(text).toContain("absolute: \"always\"");
    expect(text).toContain("## What the answer leaves out");
    await page.locator("#ac-reset").click();
    await expect(page.locator("#ac-check")).toHaveAttribute("data-state", "empty");
    expect(watch.external).toEqual([]);
    expect(watch.pageErrors).toEqual([]);
  });

  test("on a phone the form is one column, the brief is readable and nothing overflows", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await go("tools/bug-report-prompt/");
    await page.locator("#bug-form[data-ready]").waitFor();
    await page.locator("#bug-load-example").click();
    await expect(page.locator("#bug-check")).toHaveAttribute("data-state", "ok");
    const box = await page.locator("#bug-output").boundingBox();
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThanOrEqual(260);
    await expectNoHorizontalOverflow(page);
  });
});
