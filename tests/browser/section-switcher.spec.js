/**
 * Phase B (rulebook 4.8): "More <section>" under a tool's breadcrumb lets a visitor move to a sibling tool without returning to a
 * listing. Native disclosure of plain links: closed by default, current tool marked, same section only, no layout space when closed.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, livePages, rel } from "../helpers/test-base.mjs";

const AXE = path.resolve("node_modules/axe-core/axe.min.js");

const CASES = [
  ["calculators/emi/", "Calculators", "EMI Calculator", "BMI Calculator"],
  ["tools/stopwatch/", "Time Tools", "Stopwatch", "Pomodoro"],
  ["tools/json-formatter/", "Developer Tools", "JSON Formatter", "JWT Decoder"],
  ["tools/image-compressor-resizer/", "Image Tools", "Image Compressor", "Photos to PDF"],
  ["tools/merge-pdf/", "PDF Tools", "Merge PDF", "Split PDF"],
  ["tools/smart-flashcards/", "Practice Labs", "Smart Flashcards", "Cron Challenge Lab"],
];

test.describe("section switcher", () => {
  for (const [path, section, current, sibling] of CASES) {
    test(`${path}: lists its own section, marks the current tool, opens a sibling`, async ({ page, go, siteRoot }) => {
      await go(path);
      const nav = page.getByRole("navigation", { name: `${section}: switch tool` });
      await expect(nav).toHaveCount(1);
      const details = nav.locator("details");
      await expect(details).not.toHaveAttribute("open", ""); // closed: one line, no layout space
      await expect(nav.locator("summary")).toContainText(`More ${section}`);
      await nav.locator("summary").click();
      await expect(nav.locator('a[aria-current="page"]')).toContainText(current);
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
      // every link stays inside the section: no tool of another section is listed (rule 4.2)
      const hrefs = await nav.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      expect(new Set(hrefs).size).toBe(hrefs.length);
      if (section === "Calculators") for (const h of hrefs) expect(h).toContain(`${siteRoot}calculators/`);
      else for (const h of hrefs) expect(h).toContain(`${siteRoot}tools/`);
      await nav.getByRole("link", { name: new RegExp(sibling) }).first().click();
      await expect(page).not.toHaveURL(new RegExp(`${path}$`));
      await page.goBack();
      await expect(page).toHaveURL(new RegExp(`${path}$`)); // browser history works: they are ordinary links
    });
  }

  test("the Practice Labs tools are not listed in the Developer Tools switcher", async ({ page, go }) => {
    await go("tools/json-formatter/");
    await page.locator(".section-switcher summary").click();
    await expect(page.locator('.section-switcher a[href$="tools/smart-flashcards/"]')).toHaveCount(0);
  });

  test("keyboard: the summary opens with Enter and the links are reachable by Tab", async ({ page, go }) => {
    await go("tools/merge-pdf/");
    await page.locator(".section-switcher summary").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".section-switcher details")).toHaveAttribute("open", "");
    await page.keyboard.press("Tab");
    await expect(page.locator(".section-switcher a").first()).toBeFocused();
  });

  test.describe("persistent rail on a wide screen", () => {
    test("at 1600 px the list is open and in its own column beside the tool, and stays in view when the page scrolls", async ({ page, go }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await go("calculators/emi/");
      const details = page.locator(".section-switcher details");
      await expect(details).toHaveAttribute("open", "");
      const rail = await page.locator(".section-switcher").boundingBox();
      const first = await page.locator(".calculator-page h1").boundingBox();
      expect(rail.x + rail.width).toBeLessThanOrEqual(first.x); // beside the tool, not over it
      await page.locator("summary", { hasText: "More Calculators" }).dispatchEvent("click"); // wide: the heading does not collapse it
      await expect(details).toHaveAttribute("open", "");
      await expect(page.locator(".section-switcher summary")).toHaveAttribute("tabindex", "-1");
      await page.evaluate(() => window.scrollTo(0, 600));
      const after = await page.locator(".section-switcher").boundingBox();
      expect(after.y).toBeGreaterThanOrEqual(0);
      expect(after.y).toBeLessThan(80); // sticky
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

    test("below 1400 px it is the closed disclosure again, and resizing wide to narrow closes it", async ({ page, go }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await go("tools/merge-pdf/");
      await expect(page.locator(".section-switcher details")).toHaveAttribute("open", "");
      await page.setViewportSize({ width: 1000, height: 800 });
      await expect(page.locator(".section-switcher details")).not.toHaveAttribute("open", "");
      await page.setViewportSize({ width: 390, height: 800 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.locator(".section-switcher summary").click();
      await expect(page.locator(".section-switcher details")).toHaveAttribute("open", "");
    });

    test("axe finds nothing on the rail layout at 1600 px", async ({ page, go }) => {
      test.skip(!fs.existsSync(AXE), "axe-core is not installed");
      await page.setViewportSize({ width: 1600, height: 900 });
      for (const p of ["calculators/emi/", "tools/json-compare/", "tools/smart-flashcards/"]) {
        await go(p);
        await page.waitForLoadState("networkidle");
        await page.addScriptTag({ path: AXE });
        const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
        expect(result.violations.map((v) => `${p} ${v.id}`), p).toEqual([]);
      }
    });

    test("every tool page at 1600 px: no sideways scroll, the tool column stays wide, the rail does not overlap it", async ({ page, go }) => {
      test.setTimeout(600000);
      await page.setViewportSize({ width: 1600, height: 900 });
      const bad = [];
      for (const p of livePages.filter((x) => /\/(calculators|tools)\/[^/]+\/$/.test(x.url))) {
        await go(rel(p.url));
        const m = await page.evaluate(() => {
          const rail = document.querySelector(".section-switcher")?.getBoundingClientRect();
          const h1 = document.querySelector(".calculator-page h1")?.getBoundingClientRect();
          const page = document.querySelector(".calculator-page")?.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth > window.innerWidth, rail: rail && rail.right, h1: h1 && h1.left, width: page && page.width };
        });
        if (m.overflow || (m.rail != null && m.h1 != null && m.rail > m.h1) || (m.rail != null && m.width < 1300)) bad.push(`${p.url} ${JSON.stringify(m)}`);
      }
      expect(bad).toEqual([]);
    });
  });
});
