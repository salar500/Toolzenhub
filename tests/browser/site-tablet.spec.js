/**
 * Tablet-width sweep of every live page (820 px, the width the other specs use for "tablet"): no horizontal overflow, and axe-core
 * (already in node_modules, not a declared dependency, so the accessibility half skips if it is missing) clean in the initial state.
 * Desktop (1280) and phone (390) are covered by the project widths of site-a11y and the page specs; this closes the middle width.
 * Automated proxy only: no real tablet and no screen reader was used.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, expectNoHorizontalOverflow, livePages, rel } from "../helpers/test-base.mjs";

const AXE = path.resolve("node_modules/axe-core/axe.min.js");
const haveAxe = fs.existsSync(AXE);
const RULES = { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } };

test.describe("tablet width (820 px): every live page", () => {
  test.describe.configure({ timeout: 60000 });
  for (const p of livePages) {
    test(`${p.url}`, async ({ page, go }) => {
      await page.setViewportSize({ width: 820, height: 1180 });
      await go(rel(p.url));
      await expect(page.locator(p.primarySelector).first()).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalOverflow(page);
      if (!haveAxe) return;
      await page.addScriptTag({ path: AXE });
      const violations = await page.evaluate(async (rules) => {
        const r = await window.axe.run(document, rules);
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 3) }));
      }, RULES);
      expect(violations, JSON.stringify(violations)).toEqual([]);
    });
  }
});
