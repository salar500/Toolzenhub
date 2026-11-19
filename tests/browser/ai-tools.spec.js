/**
 * AI Tools (Tool Pack 56, 2026-11-11; three products since D22, 2026-11-18): the AI Answer Checker's two modes, the
 * section page with its three products and the home card. The checker writes its review or comparison in the browser as
 * the visitor types; nothing is sent and nothing is stored. The AI Prompt Builder has its own specs (prompt-builder*.spec.js).
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const MODES = [
  { mode: "review", prefix: "ac", first: "answer", title: "Review one answer", heading: "# Evidence checklist for an AI answer" },
  { mode: "compare", prefix: "cmp", first: "answerA", title: "Compare two answers", heading: "# Two answers compared" }
];

test.describe("AI Tools", () => {
  for (const m of MODES) {
    test(`AI Answer Checker, ${m.title.toLowerCase()}: empty, the example makes it ready, copy and reset work, nothing leaves the site`, async ({ page, go, watch }) => {
      await go(`tools/ai-answer-checker/${m.mode === "compare" ? "?mode=compare" : ""}`);
      await expect(page.locator("h1")).toHaveText("AI Answer Checker");
      await page.locator(`#${m.prefix}-form[data-ready]`).waitFor(); // the module has wired the form
      await expect(page.getByRole("radio", { name: m.title })).toBeChecked();
      const check = page.locator(`#${m.prefix}-check`);
      const output = page.locator(`#${m.prefix}-output`);
      await expect(check).toHaveAttribute("data-state", "empty");
      await expect(output).toHaveValue("");
      await expect(page.locator(`#${m.prefix}-copy`)).toBeDisabled();

      await page.locator(`#${m.prefix}-load-example`).click();
      await expect(check).toHaveAttribute("data-state", "ok");
      expect(await output.inputValue()).toContain(m.heading);
      await expect(page.locator(`#${m.prefix}-copy`)).toBeEnabled();
      await expect(page.locator(`#${m.prefix}-download`)).toBeEnabled();

      await page.locator(`#${m.prefix}-reset`).click();
      await expect(check).toHaveAttribute("data-state", "empty");
      await expect(output).toHaveValue("");
      await expect(page.locator(`#${m.prefix}-${m.first}`)).toBeFocused();

      expect(watch.external, "nothing leaves the site").toEqual([]);
      expect(watch.pageErrors).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("AI Answer Checker: switching modes shows one form at a time and keeps what was typed in both; every field is labelled with its hint @portable", async ({ page, go }) => {
    await go("tools/ai-answer-checker/");
    await page.locator("#ac-form[data-ready]").waitFor();
    await page.locator("#ac-answer").fill("FD rates are around 7.5% for 5 years and deposits are always safe.");
    await expect(page.locator("#ac-check")).toHaveAttribute("data-state", "ok");
    const review = await page.locator("#ac-output").inputValue();
    expect(review).toContain("1. [ ] \"FD rates are around 7.5% for 5 years and deposits are always safe.\"");
    expect(review).toContain("absolute: \"always\"");

    await page.getByRole("radio", { name: "Compare two answers" }).check();
    await expect(page.locator("#ac-answer")).toBeHidden();
    await expect(page.locator("#cmp-answerA")).toBeVisible();
    await page.locator("#cmp-answerA").fill("FD rates are around 7.5% for 5 years. A liquid fund suits money needed within a year.");
    await expect(page.locator("#cmp-check")).toHaveAttribute("data-state", "incomplete");
    await page.locator("#cmp-answerB").fill("FD rates are around 7% for 5 years. The interest is taxed every year.");
    await expect(page.locator("#cmp-check")).toHaveAttribute("data-state", "ok");
    const text = await page.locator("#cmp-output").inputValue();
    expect(text).toContain("1. different figures.");
    expect(text).toContain("## Only in Answer A\n\n- \"A liquid fund");
    expect(text).toContain("## Only in Answer B\n\n- \"The interest is taxed");
    for (const id of await page.locator("#chk-panel-compare .calculator-form__input").evaluateAll((els) => els.map((e) => e.id))) {
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      await expect(page.locator(`#${id}-hint`)).toBeVisible();
    }

    await page.getByRole("radio", { name: "Review one answer" }).check();
    await expect(page.locator("#ac-answer")).toHaveValue("FD rates are around 7.5% for 5 years and deposits are always safe.");
    await expect(page.locator("#ac-output")).toHaveValue(review);
    const related = page.locator(".related-section a[href*='/tools/'], .related-calculators a[href*='/tools/']");
    for (const href of await related.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) expect(href).toMatch(/\/tools\/prompt-builder\/$/);
  });

  test("the section page lists the three products, the home page has the AI card, and All Tools knows the section @portable", async ({ page, go, siteRoot }) => {
    await go("ai-tools.html");
    await expect(page.locator("h1")).toContainText("AI Tools");
    const main = page.locator(".ecosystem-main");
    for (const id of ["prompt-builder", "ai-answer-checker"]) await expect(main.locator(`a[href="${siteRoot}tools/${id}/"]`).first()).toBeVisible();
    for (const label of ["Create a prompt", "Check an answer", "Find an AI product"]) await expect(page.locator("nav.section-switcher")).toContainText(label);
    for (const old of ["ai-workbench", "bug-report-prompt", "context-pack-builder", "ai-answer-checklist", "ai-answer-compare", "meeting-notes-action-plan", "qa-workbench"]) {
      await expect(page.locator(`a[href*="tools/${old}/"]`)).toHaveCount(0);
    }
    await go("");
    const card = page.locator("#categories .category-card", { hasText: "AI Tools" });
    await expect(card).toHaveAttribute("href", `${siteRoot}ai-tools.html`);
    await expect(card).toContainText("3 tools"); // the AI Prompt Builder, the AI Answer Checker and the AI Directory, counted alike everywhere
    await go("tools.html");
    await expect(page.locator(`#tools-directory a[href="${siteRoot}tools/ai-answer-checker/"]`).first()).toBeVisible(); // the directory's own listing, not the hidden rail
  });

  for (const [label, width] of [["desktop", 1280], ["tablet", 820], ["phone", 390]]) {
    test(`the AI Directory is one standard tool card in the section's grid (${label}) and opens the directory`, async ({ page, go, siteRoot }) => {
      await page.setViewportSize({ width, height: 900 });
      await go("ai-tools.html");
      const cards = page.locator(".directory-tools .category-page-card");
      await expect(cards).toHaveCount(3); // the two AI tools and the directory
      const card = cards.last();
      await expect(card).toHaveAttribute("href", `${siteRoot}ai-tools/directory/`);
      await expect(card.locator(".category-page-card__title")).toHaveText("AI Directory");
      await expect(card.locator(".category-page-card__description")).toContainText("filter");
      // the same component as its neighbours: same height in its row or the same width when stacked, icon and arrow present
      const [a, b] = [await cards.nth(0).boundingBox(), await card.boundingBox()];
      expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1);
      await expect(card.locator(".category-page-card__icon svg")).toHaveCount(1);
      await expect(card.locator(".category-page-card__arrow")).toHaveCount(1);
      await expect(page.locator(`a[href="${siteRoot}ai-tools/directory/"]`)).toHaveCount(2); // the card and its one sidebar entry (2026-11-16): no banner
      await expect(page.locator(`nav.section-switcher a[href="${siteRoot}ai-tools/directory/"]`)).toHaveCount(1);
      await expectNoHorizontalOverflow(page);
      await card.click();
      await expect(page.locator("h1")).toHaveText("AI Directory");
      await expect(page.locator(".ai-card")).toHaveCount(49);
      await expect(page.locator(".ai-directory__native a", { hasText: "Describe your task in the AI Prompt Builder" })).toHaveAttribute("href", `${siteRoot}tools/prompt-builder/?start=describe`);
    });
  }

  test("on a phone the checker is one column, each mode's result is readable, and its jump link goes to the shown result", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await go("tools/ai-answer-checker/?mode=compare");
    await page.locator("#cmp-form[data-ready]").waitFor();
    await page.locator("#cmp-load-example").click();
    await expect(page.locator("#cmp-check")).toHaveAttribute("data-state", "ok");
    const box = await page.locator("#cmp-output").boundingBox();
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThanOrEqual(260);
    await expectNoHorizontalOverflow(page);
    const jump = page.locator("#chk-panel-compare .jump-to-result");
    await expect(jump).toBeVisible();
    await expect(jump).toHaveText("Jump to the comparison");
    await expect(page.locator("#chk-panel-review .jump-to-result")).toBeHidden();
    await jump.click();
    await expect(page.locator("#cmp-results")).toBeFocused();
  });
});
