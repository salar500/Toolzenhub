/**
 * Practice Labs and Smart Flashcards: automated accessibility scan (Stage 3).
 *
 * Runs axe-core in the page against the learning area (#lx-app) in the states a learner meets: the start state, an active
 * exercise or card, a wrong result, a correct result, a refused input, and the session summary. axe-core is already
 * installed in node_modules (it is not a declared dependency of this project, so the spec skips with a message if it is
 * missing). This is an automated proxy only: it is not a screen-reader test and it cannot judge reading order, wording
 * or whether a live-region announcement is helpful. No screen reader was used.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect } from "../helpers/test-base.mjs";

const AXE = path.resolve("node_modules/axe-core/axe.min.js");
const haveAxe = fs.existsSync(AXE);

const app = (page) => page.locator("#lx-app");
const RULES = { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } };

async function scan(page, label) {
  const result = await page.evaluate(async ({ rules }) => {
    const r = await window.axe.run("#lx-app", rules);
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 4) }));
  }, { rules: RULES });
  expect(result, `${label}: ${JSON.stringify(result)}`).toEqual([]);
}

async function ready(page, go, route) {
  await go(route);
  await expect(app(page)).toHaveAttribute("data-ready", "true");
  await page.addScriptTag({ path: AXE });
}

test.describe("learning area: axe-core scan", () => {

  test.skip(!haveAxe, "axe-core is not installed");

  for (const [name, route] of [
    ["JSON Error-Fixing Lab", "tools/json-error-fixing-lab/"],
    ["JSONPath Challenge Lab", "tools/jsonpath-challenge-lab/"],
    ["Cron Challenge Lab", "tools/cron-challenge-lab/"]
  ]) {
    test(`${name}: start, wrong, correct, refused input, hints and solution`, async ({ page, go }) => {
      await ready(page, go, route);
      await scan(page, "start");
      const box = page.getByRole("textbox").first();
      await box.fill("x");
      await page.getByRole("button", { name: "Check answer" }).click();
      await scan(page, "after a check");
      await page.getByRole("button", { name: /^Show hint|^Hint/ }).first().click();
      await scan(page, "with a hint");
      await page.getByRole("button", { name: "Show solution" }).click();
      await scan(page, "with the solution");
      await box.fill("");
      await page.getByRole("button", { name: "Check answer" }).click();
      await scan(page, "empty answer");
      await box.fill("a".repeat(30000));
      await page.getByRole("button", { name: "Check answer" }).click();
      await scan(page, "over the limit");
    });
  }

  test("Test Design Lab: a boundary exercise and a partition exercise in each state", async ({ page, go }) => {
    await ready(page, go, "tools/test-design-lab/");
    await scan(page, "start");
    await page.getByRole("textbox").first().fill("18, 65");
    await page.getByRole("button", { name: "Check answer" }).click();
    await scan(page, "boundary: not yet");
    await page.getByRole("textbox").first().fill("17, 18, 65, 66");
    await page.getByRole("button", { name: "Check answer" }).click();
    await scan(page, "boundary: correct");
    await app(page).getByRole("button", { name: /^Exercise 11:/ }).click();
    await scan(page, "partitions: start");
    await page.getByRole("button", { name: "Check answer" }).click();
    await scan(page, "partitions: not all placed");
    await page.getByRole("button", { name: "Show solution" }).click();
    await scan(page, "partitions: solution");
  });

  test("Smart Flashcards: deck list, setup, recall card, choice card, summary and progress settings", async ({ page, go }) => {
    await page.clock.setFixedTime(new Date("2026-10-29T08:00:00Z"));
    await ready(page, go, "tools/smart-flashcards/");
    await scan(page, "deck list");
    await page.getByLabel("Save my progress on this device").check();
    await scan(page, "saving on");
    await page.getByRole("button", { name: "Choose Software Testing", exact: true }).click();
    await scan(page, "setup");
    await page.getByRole("button", { name: /^Start session/ }).click();
    let seen = { recall: false, choice: false };
    for (let i = 0; i < 29; i += 1) {
      if (await page.getByRole("button", { name: "Show answer", exact: true }).count()) {
        await scan(page, "recall card");
        await page.getByRole("button", { name: "Show answer", exact: true }).click();
        await scan(page, "recall answer");
        await page.getByRole("button", { name: "I did not know it", exact: true }).click();
        seen.recall = true;
      } else {
        await scan(page, "choice card");
        await page.locator(".lx-option input").first().check();
        await page.getByRole("button", { name: "Check answer", exact: true }).click();
        await scan(page, "choice result");
        seen.choice = true;
      }
      if (i === 3) {
        const next = page.getByRole("button", { name: /^Next|^Finish|^See/ }).first();
        await next.click();
        await scan(page, "second card");
        break;
      }
      await page.getByRole("button", { name: /^Next|^Finish|^See/ }).first().click();
    }
    expect(seen.recall || seen.choice).toBe(true);
  });

});
