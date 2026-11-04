/**
 * Phase B (rulebook 4.8): "More <section>" under a tool's breadcrumb lets a visitor move to a sibling tool without returning to a
 * listing. Native disclosure of plain links: closed by default, current tool marked, same section only, no layout space when closed.
 */
import { test, expect } from "../helpers/test-base.mjs";

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
});
