/**
 * Home hero, six ecosystem cards, logo and favicon (2026-11-06): the hero has a primary call to action and a local, inline illustration,
 * nothing is fetched from another origin, the header and footer draw the same logo mark as /favicon.svg, and the page does not overflow.
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

/* WCAG contrast of an element's text against the first painted background behind it (runs in the page) */
const contrastOf = (el) => {
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b, a = 1] = m.map(Number); if (a === 0) return null; const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  let x = el, background = "rgb(255, 255, 255)";
  while (x && x !== document.documentElement) { const bg = getComputedStyle(x).backgroundColor; if (lum(bg) !== null) { background = bg; break; } x = x.parentElement; }
  const color = getComputedStyle(el).color;
  const [hi, lo] = [lum(color), lum(background)].sort((a, b) => b - a);
  return { contrast: +((hi + 0.05) / (lo + 0.05)).toFixed(2), color, background };
};

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

  test("all seven ecosystem cards are on the home page, in order", async ({ page, go }) => {
    await go("");
    await page.waitForSelector("#categories .category-card");
    const titles = await page.locator("#categories .category-card").evaluateAll((els) => els.map((e) => e.querySelector("h2, h3, .category-card__title, strong")?.textContent.trim()));
    expect(titles).toEqual(["Calculators", "Time Tools", "Developer Tools", "Image Tools", "PDF Tools", "Practice Labs", "AI Tools"]);
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

  /*
   * Owner finding (2026-11-11): "Browse all tools" went invisible on hover. The generic `a:hover` colour rule outranked the button's own
   * white text, so text and background became the same indigo. Every filled or link-styled control keeps readable text in every state.
   */
  for (const [url, name] of [["", "Browse all tools"], ["practice-labs/sql/", /^Start lesson 1/], ["about.html", /^Explore All Categories/]]) {
    test(`"${name}" on ${url || "home"} stays readable when hovered, focused and pressed`, async ({ page, go }) => {
      await go(url);
      const link = page.getByRole("link", { name }).first();
      await expect(link).toBeVisible();
      await link.scrollIntoViewIfNeeded();
      for (const state of ["hover", "focus", "active"]) {
        if (state === "hover") await link.hover();
        else if (state === "focus") await link.focus();
        else { await link.hover(); await page.mouse.down(); }
        await page.waitForTimeout(200); // the colour transition
        const { contrast, color, background } = await link.evaluate(contrastOf);
        if (state === "active") await page.mouse.up();
        expect(contrast, `${state}: text ${color} on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test("the footer logo link keeps its name readable on hover and focus", async ({ page, go }) => {
    await go("");
    const logo = page.locator(".footer__logo");
    await logo.scrollIntoViewIfNeeded();
    await logo.hover();
    await page.waitForTimeout(200);
    expect((await logo.evaluate(contrastOf)).contrast, "hover").toBeGreaterThanOrEqual(4.5);
    await logo.focus();
    await page.waitForTimeout(200);
    expect((await logo.evaluate(contrastOf)).contrast, "focus").toBeGreaterThanOrEqual(4.5);
  });

  test("a narrow phone: the logo and name fit on one line and nothing overflows", async ({ page, go }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await go("");
    const brand = await page.locator(".navbar__brand").boundingBox();
    expect(brand.height).toBeLessThan(60);
    await expectNoHorizontalOverflow(page);
  });
});
