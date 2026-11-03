/**
 * Site-wide automated accessibility sweep: axe-core on every live page in its initial state (the URL inventory is the page list).
 *
 * axe-core is already in node_modules (not a declared dependency, so the sweep skips with a message if it is missing). Tags: WCAG 2.0/2.1/2.2
 * A and AA plus best-practice, which includes colour contrast and link-in-text-block. This is an automated proxy for the initial state only: it does
 * not exercise result, error or file states (the Practice Labs and the Pack 53 calculators have their own scans), it cannot judge reading order
 * or wording, and no screen reader was used. A violation here is a real finding: fix the cause in the shared layer, do not silence the rule.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, livePages, rel } from "../helpers/test-base.mjs";

const AXE = path.resolve("node_modules/axe-core/axe.min.js");
const haveAxe = fs.existsSync(AXE);
const RULES = { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } };

test.describe("axe-core: every live page, initial state", () => {
  test.skip(!haveAxe, "axe-core is not installed");
  test.describe.configure({ timeout: 60000 });

  for (const p of livePages) {
    test(`${p.url}`, async ({ page, go }) => {
      await go(rel(p.url));
      await page.waitForLoadState("networkidle");
      await page.addScriptTag({ path: AXE });
      const violations = await page.evaluate(async (rules) => {
        const r = await window.axe.run(document, rules);
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 3) }));
      }, RULES);
      expect(violations, JSON.stringify(violations)).toEqual([]);
    });
  }
});
