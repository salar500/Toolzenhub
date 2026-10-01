/**
 * Navigation and search behaviour of the interactive pages:
 *   home hero search -> categories page, categories / calculators / loans live search,
 *   header links + active state, mobile menu, and "Coming soon" cards being non-clickable.
 */
import { test, expect, expectClean } from "../helpers/test-base.mjs";

const CATEGORY_IDS = ["loans", "investment", "tax", "health", "business", "math", "converter", "more"];

test.describe("home page", () => {
  test("hero, category cards, popular calculators, latest articles", async ({ page, go, watch, siteRoot }) => {
    await go("");
    await expect(page.locator("h1.hero__title")).toContainText("Smart Financial");
    await expect(page.locator("#categories .category-card")).toHaveCount(2);
    await expect(page.locator("#popular-calculators .calculator-card")).toHaveCount(6);
    // the two built calculators are links, the other four are not
    await expect(page.locator("#popular-calculators a.calculator-card")).toHaveCount(2);
    await expect(page.locator("#popular-calculators .calculator-card--soon")).toHaveCount(4);
    await expect(page.locator("#popular-calculators a.calculator-card").first()).toHaveAttribute("href", `${siteRoot}calculators/loan-comparison/`);
    // latest articles: the first three published, linking into /articles/…
    const latest = page.locator("#latest-articles a.article-card");
    await expect(latest).toHaveCount(3);
    for (const h of await latest.evaluateAll((l) => l.map((x) => x.getAttribute("href")))) expect(h).toMatch(new RegExp(`^${siteRoot}articles/loan-comparison/[a-z-]+/$`));
    expectClean(watch);
  });

  test("hero search sends the query to the categories page and shows matching calculators", async ({ page, go, siteRoot }) => {
    await go("");
    const input = page.locator('#calculator-search input[name="q"]');
    await input.fill("emi");
    await input.press("Enter");
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}categories.html` && u.searchParams.get("q") === "emi");
    const links = page.locator("#categories-grid a.category-page-card");
    await expect(links.first()).toBeVisible();
    await expect(page.locator('#categories-grid a[href$="calculators/emi/"]')).toHaveCount(1);
  });

  test("an empty hero search does not navigate", async ({ page, go }) => {
    await go("");
    const url = page.url();
    await page.locator('#calculator-search input[name="q"]').press("Enter");
    expect(page.url()).toBe(url);
  });
});

test.describe("categories page", () => {
  test("eight category cards; Loans goes to its page, the others to in-page anchors", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    const cards = page.locator("#categories-grid a.category-page-card");
    await expect(cards).toHaveCount(8);
    const hrefs = await cards.evaluateAll((l) => l.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual(CATEGORY_IDS.map((id) => (id === "loans" ? `${siteRoot}loans.html` : `${siteRoot}categories.html#${id}`)));
    await expect(page.locator(".calculator-breadcrumb")).toContainText("Calculators");
    await cards.first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}loans.html`);
  });

  test("live search: live results, Coming soon results, empty state, restore, ?q= deep link", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    const input = page.locator("#categories-search-input");
    await input.fill("loan");
    await expect(page).toHaveURL((u) => u.searchParams.get("q") === "loan");
    await expect(page.locator('#categories-grid a[href$="calculators/emi/"]')).toHaveCount(1);
    await expect(page.locator('#categories-grid a[href$="calculators/loan-comparison/"]')).toHaveCount(1);
    expect(await page.locator("#categories-grid .category-page-card--soon").count()).toBeGreaterThan(0);

    await input.fill("zzzz-nothing");
    await expect(page.locator("#categories-grid")).toContainText("No calculators found");

    await input.fill("");
    await expect(page.locator("#categories-grid .category-page-card")).toHaveCount(8);
    await expect(page).toHaveURL((u) => !u.searchParams.has("q"));

    await go("categories.html?q=sip");
    await expect(input).toHaveValue("sip");
    await expect(page.locator("#categories-grid .category-page-card--soon")).toHaveCount(1);
    await expect(page.locator("#categories-grid a")).toHaveCount(0);
  });
});

test.describe("calculators and loans listings", () => {
  test("calculators page: 26 entries (2 built), search, empty state, deep link", async ({ page, go }) => {
    await go("calculators.html");
    const cards = page.locator("#calculators-grid .calculator-card");
    await expect(cards).toHaveCount(26);
    await expect(page.locator("#calculators-results-count")).toHaveText("26 calculators");
    await expect(page.locator("#calculators-grid a.calculator-card")).toHaveCount(2);
    await expect(page.locator("#calculators-grid .calculator-card--soon")).toHaveCount(24);

    const input = page.locator("#calculators-search-input");
    await input.fill("sip");
    await expect(cards).toHaveCount(1);
    await expect(page.locator("#calculators-grid")).toContainText("SIP Calculator");
    await input.fill("zzzz-nothing");
    await expect(page.locator("#calculators-empty")).toBeVisible();
    await input.fill("");
    await expect(cards).toHaveCount(26);

    await go("calculators.html?q=emi");
    await expect(input).toHaveValue("emi");
    await expect(page.locator('#calculators-grid a[href$="calculators/emi/"]')).toHaveCount(1);
  });

  test("loans page: 8 loan calculators (2 built), search filters within the category", async ({ page, go, siteRoot }) => {
    await go("loans.html");
    const cards = page.locator("#loans-calculators-grid .calculator-card");
    await expect(cards).toHaveCount(8);
    await expect(page.locator("#loans-calculators-grid a.calculator-card")).toHaveCount(2);
    await expect(page.locator("#loans-calculators-grid .calculator-card--soon")).toHaveCount(6);
    await expect(page.locator(".loans-breadcrumb")).toContainText("Loans");
    await page.locator("#loans-search-input").fill("home loan");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveClass(/calculator-card--soon/);
    await page.locator("#loans-search-input").fill("");
    await expect(cards).toHaveCount(8);
    await page.locator('#loans-calculators-grid a[href$="calculators/emi/"]').click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/emi/`);
  });
});

test.describe("Coming soon items are not clickable", () => {
  for (const [path, selector, expected] of [
    ["", "#popular-calculators .calculator-card--soon", 4],
    ["loans.html", "#loans-calculators-grid .calculator-card--soon", 6],
    ["calculators.html", "#calculators-grid .calculator-card--soon", 24],
  ]) {
    test(`${path || "home"}: ${expected} cards, no links, clicking does nothing`, async ({ page, go }) => {
      await go(path);
      const soon = page.locator(selector);
      await expect(soon).toHaveCount(expected);
      await expect(soon.first().locator("a")).toHaveCount(0);
      expect(await soon.evaluateAll((l) => l.filter((x) => x.tagName === "A" || x.hasAttribute("href")).length)).toBe(0);
      await expect(soon.first()).toHaveAttribute("aria-disabled", "true");
      await expect(soon.first()).toContainText("Coming soon");
      const url = page.url();
      for (let i = 0; i < Math.min(3, expected); i++) await soon.nth(i).click();
      expect(page.url()).toBe(url);
    });
  }
});

test.describe("header navigation", () => {
  test("links, active state and navigation (desktop)", async ({ page, go, siteRoot, isMobile }) => {
    test.skip(isMobile, "desktop navigation bar");
    await go("");
    const links = page.locator(".navbar__menu .navbar__link");
    expect(await links.evaluateAll((l) => l.map((x) => [x.textContent.trim(), x.getAttribute("href")]))).toEqual([
      ["Home", siteRoot],
      ["Categories", `${siteRoot}categories.html`],
      ["Articles", `${siteRoot}articles.html`],
      ["About", `${siteRoot}about.html`],
    ]);
    await expect(page.locator(".navbar__menu .navbar__link.active")).toHaveText("Home");
    await expect(page.locator(".navbar__menu .navbar__link.active")).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".menu-toggle")).toBeHidden();

    for (const [name, path, h1] of [["Categories", "categories.html", "All Categories"], ["Articles", "articles.html", "Articles & Guides"], ["About", "about.html", "Smart Tools, Smarter You"]]) {
      await page.locator(".navbar__menu").getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL((u) => u.pathname === siteRoot + path);
      await expect(page.locator("h1").first()).toHaveText(h1);
      await expect(page.locator(".navbar__menu .navbar__link.active")).toHaveText(name);
    }
    await page.locator("a.navbar__brand").click();
    await expect(page).toHaveURL((u) => u.pathname === siteRoot);
  });

  test("mobile menu opens, closes with Escape, and navigates", async ({ page, go, siteRoot, isMobile }) => {
    test.skip(!isMobile, "mobile menu");
    await go("");
    const toggle = page.locator(".menu-toggle");
    const drawer = page.locator("#mobile-navigation");
    await expect(toggle).toBeVisible();
    await expect(page.locator(".navbar__menu")).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(drawer).toHaveClass(/is-open/);
    await expect(drawer.getByRole("link", { name: "Articles" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(drawer).not.toHaveClass(/is-open/);
    await expect(toggle).toBeFocused();
    await toggle.click();
    await drawer.getByRole("link", { name: "Articles" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}articles.html`);
  });
});

test.describe("footer", () => {
  test("footer links point at real pages (site-root aware)", async ({ page, go, siteRoot, api }) => {
    await go("");
    const hrefs = await page.locator("#footer a[href]").evaluateAll((l) => l.map((x) => x.getAttribute("href")).filter((h) => h && h !== "#"));
    expect(hrefs.length).toBeGreaterThanOrEqual(8);
    for (const h of new Set(hrefs)) {
      expect(h.startsWith(siteRoot), `${h} starts with the site root`).toBe(true);
      expect((await api.get(h)).status(), h).toBe(200);
    }
  });
});
