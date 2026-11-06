/**
 * Home hero, six ecosystem cards, logo and favicon (2026-11-06): the hero has a primary call to action and a local, inline illustration,
 * nothing is fetched from another origin, the header and footer draw the same logo mark as /favicon.svg, and the page does not overflow.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

test.describe("home hero and brand", () => {
  test("hero: headline, Browse all tools, Explore calculators, search and a decorative illustration", async ({ page, go, siteRoot }) => {
    const external = [];
    page.on("request", (r) => { const u = new URL(r.url()); if (u.origin !== new URL(page.url() === "about:blank" ? r.url() : page.url()).origin && !/^(data|blob):/.test(r.url())) external.push(r.url()); });
    await go("");
    await expect(page.locator("h1")).toContainText("Practical tools for");
    await expect(page.getByRole("link", { name: "Browse all tools" })).toHaveAttribute("href", `${siteRoot}tools.html`);
    await expect(page.getByRole("link", { name: "Explore calculators" })).toHaveAttribute("href", `${siteRoot}calculators.html`);
    await expect(page.getByRole("searchbox", { name: "Search tools" })).toBeVisible();
    const art = page.locator(".hero__visual svg.hero-art");
    await expect(art).toBeVisible();
    await expect(art).toHaveAttribute("aria-hidden", "true");
    expect(await page.locator(".hero__visual img").count()).toBe(0); // inline SVG, no image request
    await expectNoHorizontalOverflow(page);
    expect(external, "no request leaves the site").toEqual([]);
  });

  test("all six ecosystem cards are on the home page, in order", async ({ page, go }) => {
    await go("");
    await page.waitForSelector("#categories .category-card");
    const titles = await page.locator("#categories .category-card").evaluateAll((els) => els.map((e) => e.querySelector("h2, h3, .category-card__title, strong")?.textContent.trim()));
    expect(titles).toEqual(["Calculators", "Time Tools", "Developer Tools", "Image Tools", "PDF Tools", "Practice Labs"]);
  });

  test("the header and footer logo marks are the favicon's mark; the favicon and touch icon load", async ({ page, go, api }) => {
    await go("");
    const geometry = (html) => (html.match(/<g fill="#fff">[\s\S]*?<\/g>/) || [""])[0].replace(/\s+/g, "").replace(/><\/rect>/g, "/>");
    const fav = await (await api.get("favicon.svg")).text();
    const header = await page.locator(".navbar__brand .brand-logo").innerHTML();
    const footer = await page.locator(".footer__logo-mark").innerHTML();
    expect(geometry(header)).toBe(geometry(fav));
    expect(geometry(footer)).toBe(geometry(fav));
    for (const f of ["favicon.svg", "assets/icons/favicon-32.png", "assets/icons/apple-touch-icon.png"]) expect((await api.get(f)).status(), f).toBe(200);
  });

  test("a narrow phone: the logo and name fit on one line and nothing overflows", async ({ page, go }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await go("");
    const brand = await page.locator(".navbar__brand").boundingBox();
    expect(brand.height).toBeLessThan(60);
    await expectNoHorizontalOverflow(page);
  });
});
