/**
 * TEMPORARY (Tool Pack 29, G8 verification; not for main): the places the Gratuity Calculator is integrated into.
 * Runs on the subpath-desktop and root-desktop projects (@portable). It does not repeat the G6 interaction suite
 * (Calculate, Compare, Copy, stale result, Reset, validation, keyboard, phone widths): that passed on its own run.
 *
 * Covered: the generated page (status, title, one h1, canonical, one breadcrumb, the Income Tax related card, the
 * stylesheet, the lazy loader and a ready form, internal links, a clean console); and the consumers of the catalog entry
 * (the Tax, Calculators and All Tools listings and the five approved search aliases).
 *
 * Not covered, and not claimed: the calculation itself, visual layout, other browsers, real devices.
 */
import { test, expect, expectClean, rel } from "../helpers/test-base.mjs";

const PATH = "calculators/gratuity/";
const TITLE = "Gratuity Calculator India (Code on Social Security) | ToolZen Hub";
const CARD = "Gratuity Calculator (India)";
const ALIASES = ["gratuity calculator", "gratuity calculator india", "gratuity calculation", "gratuity formula", "gratuity eligibility"];

test.describe("Gratuity Calculator: generated page @portable", () => {
  test("status, title, one h1, canonical, one breadcrumb, the Income Tax card and the stylesheet", async ({ page, go, api, siteRoot }) => {
    const response = await go(PATH);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(TITLE);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Gratuity Calculator");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://toolzenhub.in/calculators/gratuity/");
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("Gratuity Calculator");

    const related = await page.locator(".related-calculator-card").evaluateAll((l) => l.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(related, "the one curated related tool").toEqual([`${siteRoot}calculators/income-tax/`]);

    const css = page.locator('link[rel="stylesheet"][href$="assets/css/calculators/gratuity.css"]');
    await expect(css).toHaveCount(1);
    const res = await api.get(new URL(await css.getAttribute("href"), page.url()).pathname.replace(siteRoot, ""));
    expect(res.status(), "gratuity.css").toBe(200);
  });

  test("the lazy loader is fetched for this page only and the form becomes ready; the console stays clean", async ({ page, go, watch }) => {
    const loader = page.waitForResponse((r) => /\/assets\/js\/calculators\/gratuity\/index\.js/.test(r.url()));
    await go(PATH);
    expect((await loader).status(), "gratuity/index.js").toBe(200);
    await expect(page.locator("#gratuity-form")).toHaveAttribute("data-ready", "true");
    expectClean(watch);
    // another calculator page does not fetch it
    const seen = [];
    page.on("request", (r) => seen.push(r.url()));
    await go("calculators/income-tax/");
    await expect(page.locator("h1")).toBeVisible();
    expect(seen.filter((u) => /calculators\/gratuity\//.test(u))).toEqual([]);
  });

  test("every internal link on the page resolves", async ({ page, go, api, siteRoot }) => {
    await go(PATH);
    const hrefs = await page.locator("a[href]").evaluateAll((l) => l.map((a) => a.getAttribute("href")));
    const internal = [...new Set(hrefs.filter((h) => h.startsWith(siteRoot)).map((h) => h.split("#")[0]).filter(Boolean))];
    expect(internal.length, "internal links found").toBeGreaterThan(5);
    const bad = [];
    for (const h of internal) {
      const r = await api.get(rel(h.slice(siteRoot.length - 1)));
      if (r.status() !== 200) bad.push(`${h} -> ${r.status()}`);
    }
    expect(bad).toEqual([]);
  });
});

test.describe("Gratuity Calculator: listings and search @portable", () => {
  test("the Tax page lists it third, as a live link, with no Coming soon card", async ({ page, go, siteRoot }) => {
    await go("tax.html");
    const links = await page.locator("a.category-page-card").evaluateAll((l) => l.map((a) => a.getAttribute("href")));
    expect(links).toEqual([`${siteRoot}calculators/gst/`, `${siteRoot}calculators/income-tax/`, `${siteRoot}calculators/gratuity/`]);
    await expect(page.locator('a.category-page-card[href$="calculators/gratuity/"]')).toContainText(CARD);
    await expect(page.locator(".category-page-card--soon")).toHaveCount(0);
  });

  test("the Calculators page shows exactly one live Gratuity card", async ({ page, go }) => {
    await go("calculators.html");
    const card = page.locator('#calculators-grid a.calculator-card[href$="calculators/gratuity/"]');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(CARD);
    await expect(page.locator("#calculators-grid .calculator-card--soon", { hasText: /gratuity/i })).toHaveCount(0);
  });

  test("the All Tools page lists it in the Tax group after Income Tax", async ({ page, go, siteRoot }) => {
    await go("tools.html");
    const group = page.locator(".directory-group", { has: page.locator(`h3 a[href="${siteRoot}tax.html"]`) });
    const hrefs = await group.locator(".directory-group__tools a").evaluateAll((l) => l.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual([`${siteRoot}calculators/gst/`, `${siteRoot}calculators/income-tax/`, `${siteRoot}calculators/gratuity/`]);
    await expect(page.locator('.directory-group a[href$="calculators/gratuity/"]')).toHaveCount(1);
  });

  for (const alias of ALIASES) {
    test(`All Tools search "${alias}" finds the Gratuity Calculator first`, async ({ page, go, siteRoot }) => {
      await go(`tools.html?q=${encodeURIComponent(alias)}`);
      await expect(page.locator(".directory-result").first()).toHaveAttribute("href", `${siteRoot}calculators/gratuity/`);
      await expect(page.locator('.directory-result[href$="calculators/gratuity/"]')).toHaveCount(1);
    });
  }

  test("the categories page search for 'tax' lists Gratuity beside GST and Income Tax, and no Coming soon card", async ({ page, go }) => {
    await go("categories.html?q=tax");
    for (const slug of ["gst", "income-tax", "gratuity"]) await expect(page.locator(`#categories-grid a.category-page-card[href$="calculators/${slug}/"]`)).toHaveCount(1);
    await expect(page.locator("#categories-grid .category-page-card--soon a")).toHaveCount(0);
  });

  test("Income Tax and GST do not link to Gratuity (the relation is one way)", async ({ page, go }) => {
    for (const slug of ["income-tax", "gst"]) {
      await go(`calculators/${slug}/`);
      await expect(page.locator(".related-calculator-card a[href$='calculators/gratuity/'], a.related-calculator-card[href$='calculators/gratuity/']")).toHaveCount(0);
    }
  });
});
