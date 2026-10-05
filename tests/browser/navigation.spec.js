/**
 * Navigation and search behaviour of the interactive pages:
 *   home hero search -> categories page, categories / calculators / loans live search,
 *   header links + active state, mobile menu, and "Coming soon" cards being non-clickable.
 */
import { test, expect, expectClean } from "../helpers/test-base.mjs";
import { getComingSoonTool } from "../helpers/coming-soon.mjs";

// the categories that have a card. "More" is still a category in the data (see the unit tests) but it has no tools, so it has no card.
const CATEGORY_IDS = ["loans", "investment", "tax", "health", "business", "math", "converter"];
const SECTION_IDS = CATEGORY_IDS.filter((id) => id !== "loans"); // Loans has its own page; the others open a section of the categories page

test.describe("home page", () => {
  test("hero, category card, featured tools, latest articles", async ({ page, go, watch, siteRoot }) => {
    await go("");
    await expect(page.locator("h1.hero__title")).toContainText("Smart Financial");
    // one major section today (Calculators): one card, and no "More" card that opens nothing of its own
    await expect(page.locator("#categories .category-card")).toHaveCount(1);
    await expect(page.locator("#categories .category-card")).toContainText("Calculators");
    await expect(page.locator("#categories")).not.toContainText("More");
    await expect(page.locator("#categories .category-card")).toHaveAttribute("href", `${siteRoot}categories.html`);
    // Featured Tools: a short curated list of live tools (no usage data, so it is not called "popular"), all links
    await expect(page.getByRole("heading", { name: "Featured Tools" })).toBeVisible();
    await expect(page.locator("#popular-calculators").getByRole("heading", { name: "Popular Calculators" })).toHaveCount(0);
    await expect(page.locator("#popular-calculators .calculator-card")).toHaveCount(6);
    await expect(page.locator("#popular-calculators a.calculator-card")).toHaveCount(6);
    await expect(page.locator("#popular-calculators .calculator-card--soon")).toHaveCount(0);
    await expect(page.locator("#popular-calculators a.calculator-card").first()).toHaveAttribute("href", `${siteRoot}calculators/emi/`);
    // the two "view all" links keep their own, different meanings: the calculator categories page and the all-calculators listing
    await expect(page.locator("#categories .section-link")).toHaveAttribute("href", `${siteRoot}categories.html`);
    await expect(page.locator("#popular-calculators .section-link")).toHaveAttribute("href", `${siteRoot}calculators.html`);
    await expect(page.locator("#popular-calculators .section-link")).toContainText("View all calculators");
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
  test("seven category cards (no empty \"More\" card); Loans goes to its page, the others to their section of this page", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    const cards = page.locator("#categories-grid a.category-page-card");
    await expect(cards).toHaveCount(7);
    await expect(page.locator("#categories-grid")).not.toContainText("More");
    const hrefs = await cards.evaluateAll((l) => l.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual(CATEGORY_IDS.map((id) => (id === "loans" ? `${siteRoot}loans.html` : `${siteRoot}categories.html#${id}`)));
    await expect(page.locator(".calculator-breadcrumb")).toContainText("Calculators");
    await cards.first().click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}loans.html`);
  });

  test("every category card without a page of its own opens its section: the anchor exists, the heading is in view, and it lists the category's tools", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    for (const id of SECTION_IDS) {
      await go("categories.html");
      await page.locator(`#categories-grid a[href$="categories.html#${id}"]`).click();
      await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}categories.html` && u.hash === `#${id}`);
      const heading = page.locator(`#${id}-heading`);
      await expect(heading).toBeVisible();
      const top = await heading.evaluate((el) => Math.round(el.getBoundingClientRect().top));
      expect(top, `${id}: the heading is on screen after the jump`).toBeGreaterThanOrEqual(0);
      expect(top, `${id}: the heading is on screen after the jump`).toBeLessThan(400);
      expect(await page.locator(`#${id} .category-page-card`).count(), `${id}: lists its tools`).toBeGreaterThan(0);
    }
  });

  test("a direct link with the hash lands on the section and focuses its heading; the section is a labelled region", async ({ page, go }) => {
    await go("categories.html#tax");
    const heading = page.locator("#tax-heading");
    await expect(heading).toBeVisible();
    await expect.poll(async () => heading.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(400);
    await expect(heading).toBeFocused();
    await expect(page.locator("#tax")).toHaveAttribute("aria-labelledby", "tax-heading");
    await expect(page.getByRole("region", { name: "Tax" })).toHaveCount(1);
  });

  test("the sections list the live tools as links and the others as Coming soon cards that are not links (Investment, Tax, Business and Math)", async ({ page, go, siteRoot }) => {
    await go("categories.html");
    const links = (id) => page.locator(`#${id} a.category-page-card`).evaluateAll((l) => l.map((x) => x.getAttribute("href")));
    expect(await links("investment")).toEqual([`${siteRoot}calculators/sip/`, `${siteRoot}calculators/fd/`, `${siteRoot}calculators/cagr/`]);
    await expect(page.locator("#investment .category-page-card--soon")).toHaveCount(1);
    await expect(page.locator("#investment .category-page-card--soon")).toContainText("PPF Calculator");
    expect(await links("tax")).toEqual([`${siteRoot}calculators/gst/`]);
    await expect(page.locator("#tax .category-page-card--soon")).toContainText("Income Tax Calculator");
    expect(await links("business")).toEqual([`${siteRoot}calculators/profit/`, `${siteRoot}calculators/margin/`]);
    // Math gained its first live tool in Tool Pack 10 (Ratio and Age stay Coming soon)
    expect(await links("math")).toEqual([`${siteRoot}calculators/percentage/`]);
    await expect(page.locator("#math .category-page-card--soon")).toHaveCount(2);
    for (const id of ["health", "converter"]) {
      expect(await links(id), `${id} has no live tool yet`).toEqual([]);
      expect(await page.locator(`#${id} .category-page-card--soon`).count()).toBeGreaterThan(0);
    }
    // Loans has a page of its own, so it has no section here
    await expect(page.locator("#loans")).toHaveCount(0);
  });

  test("a search hides the sections and clearing it brings them back", async ({ page, go }) => {
    await go("categories.html");
    await expect(page.locator("#categories-sections")).toBeVisible();
    await page.locator("#categories-search-input").fill("emi");
    await expect(page.locator("#categories-sections")).toBeHidden();
    await page.locator("#categories-search-input").fill("");
    await expect(page.locator("#categories-sections")).toBeVisible();
    await expect(page.locator("#investment")).toBeVisible();
  });

  test("category cards and section cards are keyboard-reachable links, and a section jump leaves no dead focus target", async ({ page, go }) => {
    await go("categories.html");
    const card = page.locator('#categories-grid a[href$="categories.html#investment"]');
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#investment-heading")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator("#investment a.category-page-card").first()).toBeFocused(); // focus continues from the section
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
    await expect(page.locator("#categories-grid .category-page-card")).toHaveCount(7);
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
  test("calculators page: 26 entries (12 built), search, empty state, deep link", async ({ page, go }) => {
    await go("calculators.html");
    const cards = page.locator("#calculators-grid .calculator-card");
    await expect(cards).toHaveCount(26);
    await expect(page.locator("#calculators-results-count")).toHaveText("26 calculators");
    await expect(page.locator("#calculators-grid a.calculator-card")).toHaveCount(12);
    await expect(page.locator("#calculators-grid .calculator-card--soon")).toHaveCount(14);

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
    ["categories.html", "#categories-sections .category-page-card--soon", 11],
    ["loans.html", "#loans-calculators-grid .calculator-card--soon", 3],
    ["calculators.html", "#calculators-grid .calculator-card--soon", 14],
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

test.describe("calculator catalog drives tool identity (M1)", () => {
  test("home Featured Tools: a curated list of live tools across the categories, each linking to its route, none Coming soon, none twice", async ({ page, go, siteRoot }) => {
    await go("");
    const links = page.locator("#popular-calculators a.calculator-card");
    await expect(links).toHaveCount(6);
    const expected = [["emi", "EMI Calculator"], ["sip", "SIP Calculator"], ["gst", "GST Calculator"], ["margin", "Margin Calculator"], ["fd", "FD Calculator"], ["home-loan", "Home Loan Calculator"]];
    for (const [i, [slug, title]] of expected.entries()) {
      await expect(links.nth(i)).toHaveAttribute("href", `${siteRoot}calculators/${slug}/`);
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
    // GST (live) is a link; Income Tax (Coming soon) is listed but is not
    await expect(page.locator("#categories-grid .category-page-card--soon").first()).toBeVisible();
    await expect(page.locator("#categories-grid .category-page-card--soon")).toContainText("Income Tax Calculator");
    await expect(page.locator("#categories-grid .category-page-card--soon a")).toHaveCount(0);
    await expect(page.locator('#categories-grid a.category-page-card[href$="calculators/gst/"]')).toHaveCount(1);
    await expect(page.locator('#categories-grid a[href*="income-tax"]')).toHaveCount(0);
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

