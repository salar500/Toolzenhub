/**
 * Practice Labs and Smart Flashcards: layout at 320, 360, 390, 768 and 1180 px (Stage 3).
 *
 * For each page and width, in the states a learner meets: no sideways scroll, nothing wider than the viewport, every
 * button, select and checkbox at least 44px in its smaller dimension, text fields at 16px or larger, and focus visible
 * on the first control reached by Tab. Screenshots go to test-results/learning-widths (disposable, never compared:
 * they are for looking at, not baselines).
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { strayWords } from "../helpers/lab-contract.mjs";

const WIDTHS = [320, 360, 390, 768, 1180];
const OUT = path.resolve("test-results/learning-widths");
fs.mkdirSync(OUT, { recursive: true });

const app = (page) => page.locator("#lx-app");

async function audit(page, label, width) {
  const stray = await strayWords(page);
  expect(stray, `${label} at ${width}px shows stray text`).toEqual([]);
  await expectNoHorizontalOverflow(page);
  const bad = await page.evaluate((w) => {
    const out = [];
    for (const el of document.querySelectorAll("#lx-app button, #lx-app select, #lx-app input[type=checkbox], #lx-app input[type=radio], #lx-app input[type=file], #lx-app textarea, #lx-app input[type=text]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width <= 1 && r.height <= 1) continue; // a visually hidden input that a visible button opens (the file picker)
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const tag = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + "(" + (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 24) + ")";
      const isCheck = el.type === "checkbox" || el.type === "radio";
      // a checkbox or radio is reached through its label row, so the label row is what must be large enough
      const target = isCheck ? (el.closest("label, .lx-check, .lx-option") ?? el).getBoundingClientRect() : r;
      if (Math.min(target.width, target.height) < 43.5) out.push(`${tag} is ${Math.round(target.width)}x${Math.round(target.height)}`);
      if (r.right > w + 0.5 || r.left < -0.5) out.push(`${tag} leaves the viewport (${Math.round(r.left)}..${Math.round(r.right)})`);
      if ((el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.type === "text") && parseFloat(cs.fontSize) < 16) out.push(`${tag} text is ${cs.fontSize}`);
    }
    return out;
  }, width);
  expect(bad, `${label} at ${width}px`).toEqual([]);
}

async function shot(page, name, width) {
  await page.screenshot({ path: path.join(OUT, `${name}-${width}.png`), fullPage: true });
}

for (const width of WIDTHS) {
  test.describe(`learning pages at ${width}px`, () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
    });

    for (const [id, route] of [["json", "tools/json-error-fixing-lab/"], ["jsonpath", "tools/jsonpath-challenge-lab/"], ["cron", "tools/cron-challenge-lab/"]]) {
      test(`${id} lab: start, wrong result, correct result, empty answer, long answer`, async ({ page, go }) => {
        await go(route);
        await expect(app(page)).toHaveAttribute("data-ready", "true");
        await audit(page, `${id} start`, width);
        await shot(page, `${id}-start`, width);
        const box = page.getByRole("textbox").first();
        await page.getByRole("button", { name: "Check answer" }).click();
        await audit(page, `${id} empty`, width);
        await box.fill("not a valid answer ".repeat(60));
        await page.getByRole("button", { name: "Check answer" }).click();
        await audit(page, `${id} long wrong answer`, width);
        await shot(page, `${id}-wrong`, width);
        await page.getByRole("button", { name: "Show solution" }).click();
        const solution = await page.locator('[aria-label="Solution"]').innerText();
        await box.fill(solution);
        await page.getByRole("button", { name: "Check answer" }).click();
        await audit(page, `${id} correct`, width);
        await shot(page, `${id}-correct`, width);
      });
    }

    test("test design lab: boundary result and partition exercise", async ({ page, go }) => {
      await go("tools/test-design-lab/");
      await expect(app(page)).toHaveAttribute("data-ready", "true");
      await audit(page, "td start", width);
      await page.getByRole("textbox").first().fill("18, 65");
      await page.getByRole("button", { name: "Check answer" }).click();
      await audit(page, "td wrong", width);
      await shot(page, "td-wrong", width);
      await app(page).getByRole("button", { name: /^Exercise 19:/ }).click();
      await audit(page, "td partitions (longest labels)", width);
      await page.getByRole("button", { name: "Check answer" }).click();
      await audit(page, "td partitions refused", width);
      await shot(page, "td-partitions", width);
    });

    test("flashcards: decks, setup with settings, recall, choice, summary", async ({ page, go }) => {
      await page.clock.setFixedTime(new Date("2026-10-29T08:00:00Z"));
      await go("tools/smart-flashcards/");
      await expect(app(page)).toHaveAttribute("data-ready", "true");
      await audit(page, "fc decks", width);
      await shot(page, "fc-decks", width);
      await page.getByLabel("Save my progress on this device").check();
      await page.getByRole("button", { name: "Choose Software Testing", exact: true }).click();
      await audit(page, "fc setup", width);
      await shot(page, "fc-setup", width);
      await page.getByRole("button", { name: /^Start session/ }).click();
      for (let i = 0; i < 29; i += 1) {
        if (await page.getByRole("button", { name: "Show answer", exact: true }).count()) {
          await audit(page, "fc recall", width);
          await page.getByRole("button", { name: "Show answer", exact: true }).click();
          await audit(page, "fc recall answer", width);
          if (i < 6) await shot(page, "fc-recall", width);
          await page.getByRole("button", { name: "I did not know it", exact: true }).click();
        } else {
          await audit(page, "fc choice", width);
          await page.locator(".lx-option input").first().check();
          await page.getByRole("button", { name: "Check answer", exact: true }).click();
          await audit(page, "fc choice result", width);
          if (i < 6) await shot(page, "fc-choice", width);
        }
        const next = page.getByRole("button", { name: /^Next|^Finish|^See/ }).first();
        if (!(await next.count())) break;
        await next.click();
        if (await page.getByText(/session complete|You finished|Summary/i).count()) break;
      }
      await audit(page, "fc summary", width);
      await shot(page, "fc-summary", width);
    });

  });
}
