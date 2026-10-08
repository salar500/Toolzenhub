/**
 * Navigation and search behaviour of the interactive pages:
 *   home hero search -> categories page, categories / calculators / loans live search,
 *   header links + active state, mobile menu, and "Coming soon" cards being non-clickable.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { getComingSoonTool } from "../helpers/coming-soon.mjs";

// the categories that have a card. "More" is still a category in the data (see the unit tests) but it has no tools, so it has no card.
// the categories that have a card: those with a LIVE tool. Health and Converter have none, so they are listed apart under "Coming soon". "More" is a category in the data but has no tools at all.
const CATEGORY_IDS = ["loans", "investment", "tax", "business", "math"];
const PAGE_IDS = ["investment", "tax", "business", "math"]; // category pages of their own (Loans keeps its older page)
const SOON_IDS = ["health", "converter"]; // no live tool: a Coming soon section on the categories page, not a page of their own

test.describe("home page", () => {
  test("hero, category card, featured tools, latest articles", async ({ page, go, watch, siteRoot }) => {
    await go("");
    await expect(page.locator("h1.hero__title")).toContainText("Practical tools");
    // four major sections with a live tool (Calculators, Time Tools, Developer Tools, Image Tools): one card each, and no "More" card that opens nothing of its own
    await expect(page.locator("#categories .category-card")).toHaveCount(4);
    await expect(page.locator("#categories .category-card").nth(0)).toContainText("Calculators");
    await expect(page.locator("#categories .category-card").nth(1)).toContainText("Time Tools");
    await expect(page.locator("#categories .category-card").nth(2)).toContainText("Developer Tools");
    await expect(page.locator("#categories")).not.toContainText("More");
    await expect(page.locator("#categories .category-card").nth(0)).toHaveAttribute("href", `${siteRoot}categories.html`);
    await expect(page.locator("#categories .category-card").nth(1)).toHaveAttribute("href", `${siteRoot}time-tools.html`);
    await expect(page.locator("#categories .category-card").nth(2)).toHaveAttribute("href", `${siteRoot}developer-tools.html`);
    await expect(page.locator("#categories .category-card").nth(3)).toContainText("Image Tools");
    await expect(page.locator("#categories .category-card").nth(3)).toHaveAttribute("href", `${siteRoot}image-tools.html`);
    // Featured Tools: a short curated list of live tools (no usage data, so it is not called "popular"), all links
    await expect(page.getByRole("heading", { name: "Featured Tools" })).toBeVisible();
    await expect(page.locator("#popular-calculators").getByRole("heading", { name: "Popular Calculators" })).toHaveCount(0);
    await expect(page.locator("#popular-calculators .calculator-card")).toHaveCount(6);
    await expect(page.locator("#popular-calculators a.calculator-card")).toHaveCount(6);
    await expect(page.locator("#popular-calculators .calculator-card--soon")).toHaveCount(0);
    await expect(page.locator("#popular-calculators a.calculator-card").first()).toHaveAttribute("href", `${siteRoot}calculators/sip/`);
    // the Home discovery actions each have one clear role: the section card opens the Calculators section, the hero search and
    // "View all tools" open All Tools; there is no second "view all" that says the same thing
    await expect(page.locator("#categories .section-title")).toHaveText("Explore Tools");
    await expect(page.locator("#categories .section-link")).toHaveCount(0);
    await expect(page.locator("#popular-calculators .section-link")).toHaveAttribute("href", `${siteRoot}tools.html`);
    await expect(page.locator("#popular-calculators .section-link")).toContainText("View all tools");
    await expect(page.locator(".section-link", { hasText: /view all (categories|calculators)/i })).toHaveCount(0);
    // Featured Tools is curated: one or two live tools from each live category, in a fixed order, and says nothing about popularity
    expect(await page.locator("#popular-calculators a.calculator-card").evaluateAll((l) => l.map((x) => x.getAttribute("href")))).toEqual([...["sip", "gst", "margin", "percentage", "home-loan"].map((id) => `${siteRoot}calculators/${id}/`), `${siteRoot}tools/countdown-timer/`]);
    await expect(page.locator("#popular-calculators")).not.toContainText(/popular|trending|most (used|searched)/i);
    // latest articles: the first three published, linking into /articles/…
    const latest = page.locator("#latest-articles a.article-card");
    await expect(latest).toHaveCount(3);
    for (const h of await latest.evaluateAll((l) => l.map((x) => x.getAttribute("href")))) expect(h).toMatch(new RegExp(`^${siteRoot}articles/loan-comparison/[a-z-]+/$`));
    expectClean(watch);
  });

  test("hero search sends the query to All Tools and shows the matching tool", async ({ page, go, siteRoot }) => {
    await go("");
    const input = page.locator('#calculator-search input[name="q"]');
    await expect(input).toHaveAttribute("placeholder", "Search tools...");
    await input.fill("emi");
    await input.press("Enter");
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html` && u.searchParams.get("q") === "emi");
    await expect(page.locator('.directory-result[href$="calculators/emi/"]')).toHaveCount(1);
    await expect(page.locator("#tools-results")).toContainText("tools found for “emi”");
  });

  test("a hero search with no match shows a clear no-result state on All Tools, not a redirect", async ({ page, go, siteRoot }) => {
    await go("");
    const input = page.locator('#calculator-search input[name="q"]');
    await input.fill("asdfgh");
    await input.press("Enter");
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html` && u.searchParams.get("q") === "asdfgh");
    await expect(page.locator("#tools-results")).toContainText("No tools found for “asdfgh”");
    await expect(page.locator("#tools-results a", { hasText: "Clear search" })).toHaveAttribute("href", `${siteRoot}tools.html`);
    await expect(page.locator("#tools-directory")).toBeVisible(); // the directory stays, so the visitor can browse
    await expect(page.locator(".directory-result")).toHaveCount(0);
  });

  test("an empty hero search does not navigate", async ({ page, go }) => {
    await go("");
    const url = page.url();
    await page.locator('#calculator-search input[name="q"]').press("Enter");
    expect(page.url()).toBe(url);
  });
});

test.describe("categories page", () => {
  test("five category cards, only the live categories; Health and Converter are listed apart under Coming soon", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    const cards = page.locator("#categories-grid a.category-page-card");
    await expect(cards).toHaveCount(5);
    await expect(page.locator("#categories-grid")).not.toContainText(/health|converter|more/i);
    const hrefs = await cards.evaluateAll((l) => l.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual(CATEGORY_IDS.map((id) => `${siteRoot}${id}.html`));
    await expect(page.locator(".calculator-breadcrumb")).toContainText("All Tools");
    await expect(page.locator(".calculator-breadcrumb")).toContainText("Calculators");
    await expect(page.locator("h1")).toHaveText("Calculator Categories");
    // the empty categories sit below the live ones, under their own heading, and are not links
    const live = await page.locator("#categories-grid").boundingBox();
    const soon = await page.locator("#categories-soon-heading").boundingBox();
    expect(soon.y).toBeGreaterThan(live.y + live.height);
    await expect(page.getByRole("heading", { name: "Coming soon", level: 2 })).toBeVisible();
    await expect(page.locator(".categories-soon a")).toHaveCount(0);
    await cards.first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}loans.html`);
  });

  test("each category with live tools opens its own page, which lists the category's tools under a Home > Calculators > category breadcrumb", async ({ page, go, siteRoot }) => {
    for (const id of PAGE_IDS) {
      await go("categories.html");
      await page.locator(`#categories-grid a[href$="/${id}.html"]`).click();
      await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}${id}.html`);
      await expect(page.locator("h1")).toContainText("Calculators");
      const crumb = page.locator(".calculator-breadcrumb");
      await expect(crumb).toContainText("Calculators");
      expect((await crumb.locator("a").evaluateAll((l) => l.map((x) => x.getAttribute("href")))), `${id}: breadcrumb`).toEqual([siteRoot, `${siteRoot}categories.html`]);
      expect(await page.locator(".category-page-card").count(), `${id}: lists its tools`).toBeGreaterThan(0);
    }
  });

  test("Health and Converter have no live tool: quieter Coming soon sections with non-clickable cards, still reachable by their anchor", async ({ page, go }) => {
    await go("categories.html");
    for (const id of SOON_IDS) {
      const heading = page.locator(`#${id}-heading`);
      await expect(heading).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-labelledby", `${id}-heading`);
      await expect(page.locator(`#${id} .category-page-card--soon`).first()).toBeVisible();
      await expect(page.locator(`#${id} a`)).toHaveCount(0);
    }
    await go("tools.html"); // a fresh load, so the hash is applied by the page's own script
    await go("categories.html#health");
    await expect(page.locator("#health-heading")).toBeFocused();
    for (const id of PAGE_IDS) await expect(page.locator(`#${id}`)).toHaveCount(0); // the live ones have pages, so no section here
    await expect(page.locator("#loans")).toHaveCount(0);
  });

  test("the category pages list the live tools as links and the others as Coming soon cards that are not links", async ({ page, go, siteRoot }) => {
    const links = (id) => page.locator(`.category-page-card[href]`).evaluateAll((l) => l.map((x) => x.getAttribute("href")));
    await go("investment.html");
    expect(await links()).toEqual([`${siteRoot}calculators/sip/`, `${siteRoot}calculators/fd/`, `${siteRoot}calculators/cagr/`]);
    await expect(page.locator(".category-page-card--soon")).toHaveCount(1);
    await expect(page.locator(".category-page-card--soon")).toContainText("PPF Calculator");
    await expect(page.locator(".category-page-card--soon a")).toHaveCount(0);
    await go("tax.html");
    expect(await links()).toEqual([`${siteRoot}calculators/gst/`, `${siteRoot}calculators/income-tax/`]);
    await expect(page.locator(".category-page-card--soon")).toHaveCount(0); // the Income Tax entry is now the live Old vs New Tax Regime Calculator
    await expect(page.locator('a.category-page-card[href$="calculators/income-tax/"]')).toContainText("Old vs New Tax Regime Calculator");
    await go("business.html");
    expect(await links()).toEqual([`${siteRoot}calculators/profit/`, `${siteRoot}calculators/margin/`]);
    await go("math.html");
    expect(await links()).toEqual([`${siteRoot}calculators/percentage/`]);
    await expect(page.locator(".category-page-card--soon")).toHaveCount(2);
    await expect(page.locator(".category-page-card--soon")).toContainText(["Ratio Calculator", "Age Calculator"]);
    // a tool opens from its category page
    await page.locator(`.category-page-card[href$="calculators/percentage/"]`).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/percentage/`);
  });

  test("a search hides the sections and clearing it brings them back", async ({ page, go }) => {
    await go("categories.html");
    await expect(page.locator("#categories-sections")).toBeVisible();
    await page.locator("#categories-search-input").fill("emi");
    await expect(page.locator("#categories-sections")).toBeHidden();
    await page.locator("#categories-search-input").fill("");
    await expect(page.locator("#categories-sections")).toBeVisible();
    await expect(page.locator("#health")).toBeVisible();
  });

  test("category cards are keyboard-reachable links that open the category page with Enter", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    const card = page.locator('#categories-grid a[href$="/investment.html"]');
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}investment.html`);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
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
    await expect(page.locator("#categories-grid .category-page-card")).toHaveCount(5);
    await expect(page).toHaveURL((u) => !u.searchParams.has("q"));

    // a Coming soon tool is listed but not linked
    const soon = getComingSoonTool();
    await go(`categories.html?q=${encodeURIComponent(soon.title)}`);
    await expect(input).toHaveValue(soon.title);
    await expect(page.locator("#categories-grid .category-page-card--soon")).toHaveCount(1);
    await expect(page.locator("#categories-grid a")).toHaveCount(0);
    // and a published one is linked
    await go("categories.html?q=sip");
    await expect(page.locator("#categories-grid .category-page-card--soon")).toHaveCount(0);
    await expect(page.locator('#categories-grid a[href$="calculators/sip/"]')).toHaveCount(1);
  });
});

test.describe("calculators and loans listings", () => {
  test("calculators page: 26 entries (14 built), search, empty state, deep link", async ({ page, go }) => {
    await go("calculators.html");
    const cards = page.locator("#calculators-grid .calculator-card");
    // 14 published calculators (the SWP Calculator is the 14th) and 12 Coming Soon entries; the Time, Developer and Image tools are not calculators and are never listed here
    await expect(cards).toHaveCount(26);
    await expect(page.locator("#calculators-results-count")).toHaveText("26 calculators");
    await expect(page.locator("#calculators-grid a.calculator-card")).toHaveCount(14);
    await expect(page.locator("#calculators-grid .calculator-card--soon")).toHaveCount(12);

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

  test("loans page: 8 loan calculators (5 built), search filters within the category", async ({ page, go, siteRoot }) => {
    await go("loans.html");
    const cards = page.locator("#loans-calculators-grid .calculator-card");
    await expect(cards).toHaveCount(8);
    await expect(page.locator("#loans-calculators-grid a.calculator-card")).toHaveCount(5);
    await expect(page.locator("#loans-calculators-grid .calculator-card--soon")).toHaveCount(3);
    await expect(page.locator(".loans-breadcrumb")).toContainText("Loans");
    await page.locator("#loans-search-input").fill("home loan");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).not.toHaveClass(/calculator-card--soon/); // published since Tool Pack 6: a link
    await expect(cards.first()).toHaveAttribute("href", `${siteRoot}calculators/home-loan/`);
    await page.locator("#loans-search-input").fill("personal loan");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveClass(/calculator-card--soon/); // still Coming soon: listed, not linked
    await page.locator("#loans-search-input").fill("");
    await expect(cards).toHaveCount(8);
    await page.locator('#loans-calculators-grid a[href$="calculators/emi/"]').click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/emi/`);
  });
});

test.describe("Coming soon items are not clickable", () => {
  for (const [path, selector, expected] of [
    ["categories.html", "#categories-sections .category-page-card--soon", 5],
    ["investment.html", ".category-page-card--soon", 1],
    ["business.html", ".category-page-card--soon", 1],
    ["math.html", ".category-page-card--soon", 2],
    ["loans.html", "#loans-calculators-grid .calculator-card--soon", 3],
    ["calculators.html", "#calculators-grid .calculator-card--soon", 12],
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
      ["All Tools", `${siteRoot}tools.html`],
      ["Articles", `${siteRoot}articles.html`],
      ["About", `${siteRoot}about.html`],
    ]);
    await expect(page.locator(".navbar__menu .navbar__link.active")).toHaveText("Home");
    await expect(page.locator(".navbar__menu .navbar__link.active")).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".menu-toggle")).toBeHidden();

    for (const [name, path, h1] of [["All Tools", "tools.html", "All Tools"], ["Articles", "articles.html", "Articles & Guides"], ["About", "about.html", "Smart Tools, Smarter You"]]) {
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

test.describe("calculator catalog drives tool identity (M1)", () => {
  test("home Featured Tools: a curated list of live tools across the categories, each linking to its route, none Coming soon, none twice", async ({ page, go, siteRoot }) => {
    await go("");
    const links = page.locator("#popular-calculators a.calculator-card");
    await expect(links).toHaveCount(6);
    const expected = [["calculators/sip", "SIP Calculator"], ["calculators/gst", "GST Calculator"], ["calculators/margin", "Margin Calculator"], ["calculators/percentage", "Percentage Calculator"], ["calculators/home-loan", "Home Loan Calculator"], ["tools/countdown-timer", "Countdown Timer"]];
    for (const [i, [slug, title]] of expected.entries()) {
      await expect(links.nth(i)).toHaveAttribute("href", `${siteRoot}${slug}/`);
      await expect(links.nth(i)).toContainText(title);
      await expect(links.nth(i).locator(".coming-soon-badge")).toHaveCount(0);
      await expect(page.locator(`#popular-calculators .calculator-card:has-text('${title}')`)).toHaveCount(1);
    }
    await expect(page.locator("#popular-calculators .calculator-card--soon")).toHaveCount(0);
    await expect(page.locator("#popular-calculators .coming-soon-badge")).toHaveCount(0);
    // it spans the live categories and is not led by Loans
    expect(expected.filter(([slug]) => ["emi", "home-loan"].includes(slug)).length).toBeLessThan(3);
    // the Home Loan card does not use eligibility wording (the tool is the visitor's own planning, not a lender's decision)
    await expect(page.locator("#popular-calculators .calculator-card:has-text('Home Loan Calculator')")).not.toContainText(/eligib/i);
  });

  test("related calculators work in both directions (EMI <-> Loan Comparison), with the Loan Balance Transfer and Loan Prepayment Calculators beside them", async ({ page, go, siteRoot }) => {
    await go("calculators/loan-comparison/");
    const calcs = page.locator(".related-calculator-card");
    await expect(calcs).toHaveCount(4);
    await expect(calcs.first()).toHaveAttribute("href", `${siteRoot}calculators/emi/`);
    await expect(calcs.first()).toContainText("EMI Calculator");
    await expect(calcs.nth(1)).toContainText("Home Loan Calculator"); // published since Tool Pack 6
    await expect(calcs.nth(2)).toContainText("Loan Balance Transfer Calculator");
    await expect(calcs.nth(3)).toContainText("Loan Prepayment Calculator");
  });

  test("calculator code loads on demand: not on the home page, only on the calculator's own page", async ({ page, go }) => {
    const seen = [];
    page.on("request", (r) => seen.push(r.url()));
    await go("");
    await expect(page.locator("#popular-calculators")).toBeVisible();
    expect(seen.filter((u) => /calculators\/emi\/index\.js|loan-comparison\/index\.js/.test(u))).toEqual([]);
    seen.length = 0;
    await go("calculators/emi/");
    await expect(page.getByRole("heading", { level: 1, name: /EMI Calculator/ })).toBeVisible();
    expect(seen.some((u) => /calculators\/emi\/index\.js/.test(u))).toBe(true);
    expect(seen.some((u) => /loan-comparison\/index\.js/.test(u))).toBe(false);
  });
});

test.describe("M6 category hierarchy in the breadcrumbs @portable", () => {
  for (const [slug, title] of [["emi", "EMI Calculator"], ["loan-comparison", "Loan Comparison Calculator"]]) {
    test(`${slug}: one breadcrumb; its category link leads to the Loans page, which lists the tool`, async ({ page, go, siteRoot }) => {
      await go(`calculators/${slug}/`);
      await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
      const crumb = page.locator(".calculator-breadcrumb");
      expect(await crumb.locator("a, strong").allTextContents().then((t) => t.map((x) => x.trim()))).toEqual(["Home", "Calculators", "loans", title]);
      await crumb.getByRole("link", { name: "loans" }).click();
      await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}loans.html`);
      await expect(page.locator(`#loans-calculators-grid a[href$="calculators/${slug}/"]`)).toHaveCount(1);
      // the section link goes to the categories page
      await page.goBack();
      await page.locator(".calculator-breadcrumb").getByRole("link", { name: "Calculators" }).click();
      await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}categories.html`);
    });
  }

  test("categories page: every category card resolves from the category data; Coming soon tools are not links", async ({ page, go, siteRoot }) => {
    await go("categories.html?q=tax");
    // GST and the Old vs New Tax Regime Calculator (the former Coming soon Income Tax entry) are live links; no Coming soon card matches "tax"
    await expect(page.locator('#categories-grid a.category-page-card[href$="calculators/gst/"]')).toHaveCount(1);
    await expect(page.locator('#categories-grid a.category-page-card[href$="calculators/income-tax/"]')).toHaveCount(1);
    await expect(page.locator("#categories-grid .category-page-card--soon a")).toHaveCount(0);
    await go("categories.html?q=emi");
    // search results show the tool's category icon, looked up from the category data
    const emi = page.locator('#categories-grid a.category-page-card[href$="calculators/emi/"]');
    await expect(emi).toHaveCount(1);
    await expect(emi.locator(".category-page-card__icon--loans")).toHaveText("🏠");
  });
});

test.describe("M7 shared search: page experiences keep their UX and rank results @portable", () => {
  const titlesOf = (page, sel) => page.locator(sel).evaluateAll((els) => els.map((e) => (e.querySelector("h2, h3, strong")?.textContent || "").trim()));

  test("categories page: 'emi' puts the EMI Calculator first; Coming soon matches are still listed, not linked", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("emi");
    await expect(page.locator("#categories-grid .category-page-card")).toHaveCount(5);
    expect(await titlesOf(page, "#categories-grid .category-page-card")).toEqual(["EMI Calculator", "Loan Comparison Calculator", "Home Loan Calculator", "Loan Prepayment Calculator", "Personal Loan Calculator"]);
    await expect(page.locator("#categories-grid .category-page-card--soon")).toHaveCount(1);
    await page.locator("#categories-search-input").fill("loan");
    expect(await titlesOf(page, "#categories-grid .category-page-card")).toEqual(["Loan Comparison Calculator", "Loan Balance Transfer Calculator", "Loan Prepayment Calculator", "Loan Eligibility Calculator", "Home Loan Calculator", "Personal Loan Calculator", "EMI Calculator", "Interest Calculator"]);
  });

  test("calculators page: same engine, same ranking, empty and no-result states unchanged", async ({ page, go }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    await input.fill("interest");
    expect(await titlesOf(page, "#calculators-grid .calculator-card")).toEqual(["Interest Calculator", "Loan Comparison Calculator", "EMI Calculator", "Home Loan Calculator", "Loan Prepayment Calculator"]);
    await input.fill("zzzz-nothing");
    await expect(page.locator("#calculators-empty")).toBeVisible();
    await input.fill("");
    await expect(page.locator("#calculators-grid .calculator-card")).toHaveCount(26);
  });

  test("Loans page: only Loans tools, ranked; a tool id still matches", async ({ page, go }) => {
    await go("loans.html");
    const input = page.locator("#loans-search-input");
    await input.fill("interest");
    expect(await titlesOf(page, "#loans-calculators-grid .calculator-card")).toEqual(["Interest Calculator", "Loan Comparison Calculator", "EMI Calculator", "Home Loan Calculator", "Loan Prepayment Calculator"]);
    await input.fill("loan-comp"); // matches the id only
    expect(await titlesOf(page, "#loans-calculators-grid .calculator-card")).toEqual(["Loan Comparison Calculator"]);
    await input.fill("sip"); // an Investment tool is never offered on the Loans page
    await expect(page.locator("#loans-calculators-grid")).toContainText("No calculators found");
    await input.fill("");
    await expect(page.locator("#loans-calculators-grid .calculator-card")).toHaveCount(8);
  });

  test("articles listing: ranked within the category filter; pagination and empty state intact", async ({ page, go }) => {
    await go("articles.html");
    const search = page.locator("#article-search");
    await search.fill("prepayment");
    await expect(page.locator("#articles-list [data-article-id]").first()).toBeVisible();
    await expect(page.locator("#articles-list")).toContainText("What Is Loan Prepayment?");
    await page.locator('.article-filter[data-category="investment"]').click();
    await search.fill("sip");
    await expect(page.locator("#articles-list")).toContainText("Best SIP Strategies for Beginners"); // coming-soon placeholder still listed
    await search.fill("zzzz-no-such-article");
    await expect(page.locator("#articles-list")).not.toContainText("Best SIP Strategies");
  });
});

test.describe("All Tools and the calculator hierarchy", () => {
  test("Home > All Tools > Calculators > Investment > SIP, by clicking", async ({ page, go, siteRoot }) => {
    await go("");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await expect(page.locator("h1")).toHaveText("All Tools");
    await expect(page.locator(".navbar__menu .navbar__link.active, .mobile-navigation__link.active").first()).toBeAttached();
    await page.locator(".directory-section__title a").first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}categories.html`);
    await page.locator('#categories-grid a[href$="/investment.html"]').click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}investment.html`);
    await page.locator('.category-page-card[href$="calculators/sip/"]').click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/sip/`);
    await expect(page.locator(".calculator-breadcrumb")).toContainText(/Calculators[\s\S]*investment[\s\S]*SIP Calculator/i);
    // the category step of a tool's breadcrumb is a link to the category page
    expect(await page.locator(".calculator-breadcrumb a").evaluateAll((l) => l.map((x) => x.getAttribute("href")))).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}investment.html`]);
  });

  test("the All Tools page: four sections (Calculators, Time Tools, Developer Tools, Image Tools), live tools as links, Health and Converter plain text with a Coming soon badge", async ({ page, go, siteRoot, watch }) => {
    await go("tools.html");
    await expect(page.locator("h1")).toHaveText("All Tools");
    await expect(page).toHaveTitle("All Tools | ToolZen Hub");
    await expect(page.locator(".calculator-breadcrumb")).toContainText("All Tools");
    await expect(page.locator(".directory-section")).toHaveCount(4);
    await expect(page.getByRole("heading", { name: "Calculators", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Time Tools", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Developer Tools", level: 2 })).toBeVisible();
    await expect(page.locator('.directory-section a[href$="tools/date-difference/"]')).toHaveCount(1);
    const live = await page.locator(".directory-group a").evaluateAll((l) => l.map((x) => x.getAttribute("href")));
    for (const r of ["loans.html", "investment.html", "tax.html", "business.html", "math.html", "calculators/emi/", "calculators/sip/", "calculators/fd/", "calculators/cagr/", "calculators/margin/", "calculators/profit/", "calculators/gst/", "calculators/percentage/", "calculators/income-tax/"]) expect(live).toContain(siteRoot + r);
    for (const bad of ["categories.html#health", "categories.html#converter", "calculators/ppf/", "calculators/roi/"]) expect(live.some((h) => h.includes(bad)), bad).toBe(false);
    await expect(page.locator(".directory-group")).toHaveCount(16); // the five live calculator categories, the six Time Tools tools, the four Developer Tools tools and the one Image Tools tool
    await expect(page.locator(".directory-soon__list li")).toHaveText([/Health\s*Coming soon/, /Converter\s*Coming soon/]);
    await expect(page.locator(".directory-soon .coming-soon-badge")).toHaveCount(2);
    await expect(page.locator(".directory-soon a")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Coming soon", level: 3 })).toBeVisible();
    // the Coming soon list sits below every live category
    const last = await page.locator(".directory-group").nth(4).boundingBox();
    const soon = await page.locator(".directory-soon").boundingBox();
    expect(soon.y).toBeGreaterThan(last.y + last.height);
    await expect(page.locator(".directory-section__more a")).toHaveAttribute("href", `${siteRoot}calculators.html`);
    await expect(page.locator("h1, h2, h3").filter({ hasText: /^Popular/ })).toHaveCount(0);
    expectClean(watch);
  });

  test("the All Tools search is a plain GET form to /tools.html?q=: results are shareable, and Back works", async ({ page, go, siteRoot }) => {
    await go("tools.html");
    await expect(page.getByLabel("Search tools", { exact: true })).toBeVisible();
    await expect(page.locator("form[data-tools-search]")).toHaveAttribute("method", "get");
    await page.getByLabel("Search tools", { exact: true }).fill("sip");
    await page.getByLabel("Search tools", { exact: true }).press("Enter");
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html` && u.searchParams.get("q") === "sip");
    await expect(page.locator(".directory-result")).toHaveCount(1);
    await expect(page.locator(".directory-result")).toHaveAttribute("href", `${siteRoot}calculators/sip/`);
    await expect(page.locator(".directory-result__meta")).toHaveText("Calculators › Investment");
    await expect(page.getByLabel("Search tools", { exact: true })).toHaveValue("sip"); // the field keeps the query
    await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", "noindex, follow"); // a result URL is not a page to index
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", "https://toolzenhub.in/tools.html");
    await page.goBack();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html` && !u.searchParams.has("q"));
  });

  test("All Tools search matrix: names, partials, case, spacing and aliases find live tools; nothing else is found", async ({ page, go }) => {
    const titles = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator("#tools-results")).not.toBeEmpty();
      return page.locator(".directory-result__title").allInnerTexts();
    };
    for (const [q, first] of [["emi", "EMI Calculator"], ["sip", "SIP Calculator"], ["gst", "GST Calculator"], ["margin", "Margin Calculator"], ["percentage", "Percentage Calculator"], ["home loan", "Home Loan Calculator"], ["fd", "FD Calculator"], ["cagr", "CAGR Calculator"], ["profit", "Profit Calculator"], ["EMI", "EMI Calculator"], ["Sip", "SIP Calculator"], ["GST", "GST Calculator"], ["  emi  ", "EMI Calculator"], ["percent", "Percentage Calculator"], ["percentage change", "Percentage Calculator"], ["reverse percentage", "Percentage Calculator"], ["fixed deposit", "FD Calculator"]]) {
      expect((await titles(q))[0], q).toBe(first);
    }
    expect((await titles("loan")).length).toBe(5);
    expect(await titles("invest")).toEqual(expect.arrayContaining(["SIP Calculator", "FD Calculator", "CAGR Calculator"]));
    for (const q of ["asdfgh", "xyztool", "pomodoro", "ppf", "personal loan"]) {
      expect(await titles(q), `${q}: no live tool`).toEqual([]);
      await expect(page.locator("#tools-results")).toContainText(`No tools found for “${q}”`);
      await expect(page.locator("#tools-directory")).toBeVisible();
    }
    // an empty query is the plain directory
    await go("tools.html?q=");
    await expect(page.locator("#tools-results")).toBeEmpty();
    await expect(page.locator("#tools-directory")).toBeVisible();
  });

  test("All Tools search results are keyboard-reachable links with an accessible live region, and do not overflow", async ({ page, go }) => {
    await go("tools.html?q=loan");
    await expect(page.locator("#tools-results")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#tools-results")).toHaveAttribute("role", "status");
    const first = page.locator(".directory-result").first();
    await first.focus();
    await expect(first).toBeFocused();
    await expectNoHorizontalOverflow(page);
    await go("tools.html?q=zzzz");
    await expectNoHorizontalOverflow(page);
  });

  test("Home > View all tools > All Tools; All Tools > Business > Margin; Tax > GST; Math > Percentage; Loans > EMI", async ({ page, go, siteRoot }) => {
    await go("");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    for (const [cat, tool] of [["business", "margin"], ["tax", "gst"], ["math", "percentage"]]) {
      await go("tools.html");
      await page.locator(`.directory-group__title a[href$="/${cat}.html"]`).click();
      await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}${cat}.html`);
      await page.locator(`.category-page-card[href$="calculators/${tool}/"]`).click();
      await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/${tool}/`);
    }
    await go("tools.html");
    await page.locator('.directory-group__title a[href$="/loans.html"]').click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}loans.html`);
    await page.locator('a[href$="calculators/emi/"]').first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}calculators/emi/`);
  });

  test("the three destinations have different jobs: All Tools (platform), Calculator Categories (the section) and All Calculators (the flat list)", async ({ page, go }) => {
    await go("tools.html");
    await expect(page.locator(".directory-section__label")).toHaveText(["Section", "Section", "Section", "Section"]);
    await expect(page.locator(".directory-section__count")).toHaveText([/^\d+ tools$/, /^6 tools$/, /^4 tools$/, /^1 tool$/]);
    await go("categories.html");
    await expect(page.locator("h1")).toHaveText("Calculator Categories");
    await expect(page.locator(".categories-search__content p")).toHaveText("Search calculators"); // this search is scoped to calculators, and says so
    await go("calculators.html");
    await expect(page.locator("#calculators-grid .calculator-card").first()).toBeVisible();
    await go("loans.html");
    await expect(page.locator(".loans-search__input")).toHaveAttribute("aria-label", "Search loan calculators");
  });

  test("the category pages have their own title, description and canonical on the production domain; Loans keeps its page and links back to Calculators", async ({ page, go, siteRoot }) => {
    for (const [id, name] of [["investment", "Investment"], ["tax", "Tax"], ["business", "Business"], ["math", "Math"]]) {
      await go(`${id}.html`);
      await expect(page).toHaveTitle(`${name} Calculators | ToolZen Hub`);
      await expect(page.locator("h1")).toHaveText(`${name} Calculators`);
      expect(await page.locator("meta[name=description]").getAttribute("content")).toContain(`${name} calculators`);
      await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `https://toolzenhub.in/${id}.html`);
    }
    await go("loans.html");
    await expect(page.locator("h1")).toContainText("Loans");
    await expect(page.locator(".loans-breadcrumb")).toContainText("Calculators");
  });

  test("every page in the Calculators area lights All Tools in the header", async ({ page, go, isMobile }) => {
    test.skip(isMobile, "desktop navigation bar");
    for (const path of ["tools.html", "categories.html", "calculators.html", "loans.html", "investment.html", "calculators/emi/"]) {
      await go(path);
      await expect(page.locator(".navbar__menu .navbar__link.active"), path).toHaveText("All Tools");
    }
  });

  test("no horizontal overflow on All Tools and a category page", async ({ page, go }) => {
    for (const path of ["tools.html", "investment.html"]) {
      await go(path);
      await expectNoHorizontalOverflow(page);
    }
  });
});

test.describe("search boxes share one look", () => {
  const BOXES = [["", "#calculator-search"], ["tools.html", ".directory-search__row"], ["categories.html", "#categories-search-form"], ["loans.html", "#loans-search-form"]];

  test("Home, All Tools, Calculator Categories and Loans: same height, border, radius, icon, field and green icon button", async ({ page, go }) => {
    const looks = [];
    for (const [path, sel] of BOXES) {
      await go(path);
      const box = page.locator(sel).first();
      await expect(box).toBeVisible();
      await expect(box).toHaveClass(/tz-search/);
      looks.push(await box.evaluate((el) => {
        const cs = getComputedStyle(el);
        const button = el.querySelector(".tz-search__button");
        const input = el.querySelector(".tz-search__input");
        return {
          height: Math.round(el.getBoundingClientRect().height), radius: cs.borderTopLeftRadius, border: cs.borderTopColor,
          icon: Boolean(el.querySelector(".tz-search__icon")), button: getComputedStyle(button).backgroundColor, buttonLabel: button.getAttribute("aria-label"), inputFont: getComputedStyle(input).fontSize,
        };
      }));
    }
    const same = ({ buttonLabel, ...look }) => look; // the button's name differs on purpose: it says what that box searches
    for (const look of looks.slice(1)) expect(same(look)).toEqual(same(looks[0]));
    expect(looks[0].icon).toBe(true);
    for (const look of looks) expect(look.buttonLabel).toBeTruthy(); // an icon button has an accessible name
  });

  test("on a phone each box keeps its height, uses the width it has and does not overflow", async ({ page, go, isMobile }) => {
    test.skip(!isMobile, "narrow screens");
    for (const [path, sel] of BOXES) {
      await go(path);
      const box = page.locator(sel).first();
      const b = await box.boundingBox();
      expect(b.height, path).toBeGreaterThanOrEqual(46);
      const input = await box.locator(".tz-search__input").boundingBox();
      expect(input.width, `${path}: the field is not squeezed`).toBeGreaterThan(80);
      expect(b.x + b.width, path).toBeLessThanOrEqual(page.viewportSize().width);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("the scope of each search stays what its label says", async ({ page, go }) => {
    await go("");
    await expect(page.locator('#calculator-search input[name="q"]')).toHaveAttribute("aria-label", "Search tools");
    await go("categories.html");
    await expect(page.locator("#categories-search-input")).toHaveAttribute("aria-label", "Search calculators");
    await go("loans.html");
    await expect(page.locator("#loans-search-input")).toHaveAttribute("aria-label", "Search loan calculators");
  });
});
