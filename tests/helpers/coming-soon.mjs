/**
 * A genuine Coming Soon tool, for tests that only need "some tool that is not published".
 *
 * Source: the committed URL inventory (tests/inventory/url-inventory.json), the independent record of what is NOT a
 * route. It is written in catalog order and `inventory:check` fails when it is stale, so the choice is deterministic
 * (the first match, never random) and it moves on by itself when a Coming Soon tool is published. Tests that check
 * the SAME tool against the live catalog (status, URL, search, taxonomy) still assert the behaviour; only the choice
 * of tool is shared.
 *
 * Use it only where the test does not care WHICH tool. A test that depends on a tool's real category, relationships
 * or search keywords keeps naming that tool. Pinned counts and published ids are never derived from here.
 *
 *   getComingSoonTool()                           the first Coming Soon calculator
 *   getComingSoonTool({ category: "investment" }) the first one in that category
 *
 * Returns { id, title, category, wouldBeUrl, ... }. Throws, never returns undefined, when nothing matches.
 */
import fs from "node:fs";

const INVENTORY = JSON.parse(fs.readFileSync(new URL("../inventory/url-inventory.json", import.meta.url), "utf8"));

export function getComingSoonTool({ category } = {}) {
  const matches = INVENTORY.comingSoon.filter((entry) => entry.kind === "calculator" && (category === undefined || entry.category === category));
  if (matches.length === 0) {
    const left = INVENTORY.comingSoon.filter((entry) => entry.kind === "calculator").map((entry) => `${entry.id} (${entry.category})`).join(", ");
    throw new Error(`No Coming Soon calculator${category === undefined ? "" : ` in category "${category}"`} in the URL inventory. Left: ${left || "none"}. A test that needs one must name a category that still has one, or be rewritten.`);
  }
  const [tool] = matches;
  if (tool.mustReturn404 !== true || tool.hasHtmlFile !== false) {
    throw new Error(`The inventory lists "${tool.id}" as Coming Soon but it is not marked as a 404 without a page. Regenerate the inventory.`);
  }
  return tool;
}
