/**
 * Phase B (rulebook 4.8): "More <section>" under a tool's breadcrumb lets a visitor move to a sibling tool without returning to a
 * listing. Native disclosure of plain links (closed below 1000 px), current tool marked, same section only, no layout space when closed.
 * From 1000 px it is the sidebar: open by default, searchable, hidden and shown again without touching the tool (see "sidebar" below).
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
      await page.setViewportSize({ width: 800, height: 900 }); // the disclosure; the sidebar is tested below
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
    await page.setViewportSize({ width: 800, height: 900 });
    await go("tools/json-formatter/");
    await page.locator(".section-switcher summary").click();
    await expect(page.locator('.section-switcher a[href$="tools/smart-flashcards/"]')).toHaveCount(0);
  });

  test("keyboard: the summary opens with Enter and the links are reachable by Tab", async ({ page, go }) => {
    await page.setViewportSize({ width: 800, height: 900 });
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

    test("below 1000 px it is the closed disclosure again, and resizing wide to narrow closes it", async ({ page, go }) => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await go("tools/merge-pdf/");
      await expect(page.locator(".section-switcher details")).toHaveAttribute("open", "");
      await page.setViewportSize({ width: 999, height: 800 });
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

    for (const width of [1000, 1280, 1600]) {
      test(`every tool page at ${width} px: no sideways scroll, the tool column stays wide, the rail does not overlap it`, async ({ page, go }) => {
        test.setTimeout(600000);
        await page.setViewportSize({ width, height: 900 });
        const bad = [];
        for (const p of livePages.filter((x) => /\/(calculators|tools)\/[^/]+\/$/.test(x.url))) {
          await go(rel(p.url));
          const m = await page.evaluate(() => {
            const rail = document.querySelector(".section-switcher")?.getBoundingClientRect();
            const h1 = document.querySelector(".calculator-page h1")?.getBoundingClientRect();
            const page = document.querySelector(".calculator-page")?.getBoundingClientRect();
            return { overflow: document.documentElement.scrollWidth > window.innerWidth, rail: rail && rail.right, h1: h1 && h1.left, width: page && page.width };
          });
          if (m.overflow || (m.rail != null && m.h1 != null && m.rail > m.h1) || (m.rail != null && m.width < width * 0.85)) bad.push(`${p.url} ${JSON.stringify(m)}`);
        }
        expect(bad).toEqual([]);
      });
    }
  });

  test.describe("sidebar (1000 px and up)", () => {

    const rail = (page) => page.locator("nav.section-switcher");

    test("open by default at 1280 px in every section, beside the tool, with the current tool marked", async ({ page, go }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      for (const [p] of CASES) {
        await go(p);
        await expect(rail(page), p).toBeVisible();
        await expect(rail(page).locator("details"), p).toHaveAttribute("open", "");
        await expect(rail(page).getByRole("button", { name: "Hide tools" }), p).toBeVisible();
        await expect(rail(page).locator('a[aria-current="page"]'), p).toHaveCount(1);
        const r = await rail(page).boundingBox();
        const h1 = await page.locator(".calculator-page h1").first().boundingBox();
        expect(r.x + r.width, p).toBeLessThanOrEqual(h1.x);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), p).toBe(true);
      }
    });

    test("Hide tools gives the whole row to the tool (no empty column); Show tools brings the list back; the tool keeps what was typed", async ({ page, go }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await go("calculators/emi/");
      await page.locator("#emi-rate").fill("11.25");
      await page.waitForTimeout(600); // the results follow the typed rate
      const before = await page.locator("#emi-results").innerText();
      const withRail = await page.locator(".calculator-page h1").boundingBox();
      await rail(page).getByRole("button", { name: "Hide tools" }).click();
      await expect(rail(page)).toBeHidden();
      await expect(page.getByRole("button", { name: "Show Calculators" })).toBeFocused();
      await expect(page.getByRole("button", { name: "Show Calculators" })).toHaveAttribute("aria-expanded", "false");
      const without = await page.locator(".calculator-page h1").boundingBox();
      expect(without.x).toBeLessThan(withRail.x - 100); // the column is gone, not left blank
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.locator("#emi-rate")).toHaveValue("11.25");
      expect(await page.locator("#emi-results").innerText()).toBe(before); // innerText both times: toHaveText reads textContent
      await page.getByRole("button", { name: "Show Calculators" }).click();
      await expect(rail(page)).toBeVisible();
      await expect(page.getByRole("button", { name: "Show Calculators" })).toBeHidden();
      await expect(page.locator("#emi-rate")).toHaveValue("11.25");
      const back = await page.locator(".calculator-page h1").boundingBox();
      expect(Math.abs(back.x - withRail.x)).toBeLessThan(2);
    });

    test("search narrows the list and the groups, says when nothing matches, Escape clears it", async ({ page, go }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await go("calculators/emi/");
      const box = page.getByLabel("Find a tool in Calculators");
      const visible = () => rail(page).locator(".section-switcher__list ul li:not([hidden]) a").count();
      expect(await visible()).toBe(30);
      await box.fill("loan");
      const n = await visible();
      expect(n).toBeGreaterThan(5);
      expect(n).toBeLessThan(30);
      await box.fill("sip");
      expect(await visible()).toBe(1);
      await expect(rail(page).locator(".section-switcher__group:not([hidden])")).toHaveCount(1);
      await box.fill("qqqq");
      await expect(rail(page).getByText("No tool matches.")).toBeVisible();
      await box.press("Escape");
      expect(await visible()).toBe(30);
    });

    test("a small section (Image Tools, 2 tools) has no search box but still has the sidebar", async ({ page, go }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await go("tools/image-compressor-resizer/");
      await expect(rail(page)).toBeVisible();
      await expect(page.getByLabel(/Find a tool in/)).toHaveCount(0);
    });

    test("first, a middle and the last tool of each section open from the sidebar; the address is right", async ({ page, go }) => {
      test.setTimeout(300000);
      await page.setViewportSize({ width: 1280, height: 800 });
      for (const [start, section] of CASES) {
        await go(start);
        const hrefs = await rail(page).locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
        const startUrl = page.url();
        for (const target of [hrefs[0], hrefs[Math.floor(hrefs.length / 2)], hrefs[hrefs.length - 1]]) {
          await page.goto(startUrl);
          await rail(page).locator(`a[href="${target}"]`).click();
          await expect(page, `${section} ${target}`).toHaveURL((url) => url.pathname === target);
          await expect(rail(page).locator('a[aria-current="page"]')).toHaveAttribute("href", target);
          await expect(rail(page).getByRole("button", { name: "Hide tools" })).toBeVisible();
        }
      }
    });

    test("keyboard: Tab reaches the search and the links; Enter on Hide tools moves focus to Show", async ({ page, go }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await go("tools/json-formatter/");
      await rail(page).getByRole("button", { name: "Hide tools" }).focus();
      await page.keyboard.press("Tab");
      await expect(page.getByLabel("Find a tool in Developer Tools")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(rail(page).locator("a").first()).toBeFocused();
      await rail(page).getByRole("button", { name: "Hide tools" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Show Developer Tools" })).toBeFocused();
    });

    test("narrow screen: no Hide or Show buttons; the disclosure opens a searchable list that fits the screen", async ({ page, go }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await go("calculators/emi/");
      await expect(rail(page).getByRole("button", { name: "Hide tools" })).toBeHidden();
      await expect(page.getByRole("button", { name: "Show Calculators" })).toBeHidden();
      await rail(page).locator("summary").click();
      await page.getByLabel("Find a tool in Calculators").fill("bmi");
      await expect(rail(page).locator(".section-switcher__list ul li:not([hidden]) a")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

  });
});
