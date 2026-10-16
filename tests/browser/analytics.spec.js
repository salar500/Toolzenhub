/**
 * GA4 consent behaviour on the production build (dist/), served to the browser as https://toolzenhub.in through request
 * interception, so the module's production-host rule runs for real. Requests to Google are stubbed and recorded;
 * nothing leaves the machine.
 */
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "dist");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png" };
const ORIGIN = "https://toolzenhub.in";

async function setup(page, hosts = ["toolzenhub.in"]) {
  const google = [];
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "www.googletagmanager.com") {
      google.push(url.href);
      return route.fulfill({ contentType: "text/javascript", body: "/* stub gtag */" });
    }
    if (!hosts.includes(url.hostname)) return route.abort();
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(DIST, p);
    if (!file.startsWith(DIST) || !fs.existsSync(file)) return route.fulfill({ status: 404, contentType: "text/html", body: "" });
    return route.fulfill({ contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file) });
  });
  return google;
}

test.describe("analytics consent @portable", () => {
  test("before any choice: banner with equal Accept/Reject, nothing from Google, no cookie, no storage", async ({ page }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/calculators/emi/?amount=5000000`);
    const banner = page.getByRole("region", { name: "Analytics cookies" });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("button", { name: "Accept analytics" })).toBeVisible();
    await expect(banner.getByRole("button", { name: "Reject analytics" })).toBeVisible();
    expect(google).toEqual([]);
    expect(await page.evaluate(() => [document.cookie, localStorage.length, !!window.dataLayer])).toEqual(["", 0, false]);
  });

  test("Reject: banner gone, nothing loads, choice remembered, still nothing after reload", async ({ page }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/`);
    await page.getByRole("button", { name: "Reject analytics" }).click();
    await expect(page.locator(".tz-consent")).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".tz-consent")).toHaveCount(0);
    expect(google).toEqual([]);
    expect(await page.evaluate(() => [localStorage.getItem("tz-analytics-consent"), !!window.dataLayer, document.cookie])).toEqual(["denied", false, ""]);
  });

  test("Accept: loads gtag once, one page_view config, query string and fragment never sent", async ({ page }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/categories.html?q=salary%2012000#top`);
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await expect.poll(() => google.length).toBe(1);
    expect(google[0]).toBe("https://www.googletagmanager.com/gtag/js?id=G-YEJZMCXJ7V");
    const configs = await page.evaluate(() => window.dataLayer.filter((a) => a[0] === "config").map((a) => [a[1], a[2].page_location, a[2].allow_google_signals]));
    expect(configs).toEqual([["G-YEJZMCXJ7V", `${ORIGIN}/categories.html`, false]]);
    // a later page with a remembered choice loads it again, once, without asking again
    await page.goto(`${ORIGIN}/about.html`);
    await expect.poll(() => google.length).toBe(2);
    expect(await page.evaluate(() => window.dataLayer.filter((a) => a[0] === "config").length)).toBe(1);
    await expect(page.locator(".tz-consent")).toHaveCount(0);
  });

  test("privacy page: changing the choice from accepted to rejected stops tracking and shows the status", async ({ page }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/privacy.html`);
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await expect(page.locator("[data-tz-analytics-status]")).toHaveText("Analytics: accepted.");
    await page.getByRole("button", { name: "Change analytics choice" }).click();
    await page.getByRole("button", { name: "Reject analytics" }).click();
    await expect(page.locator("[data-tz-analytics-status]")).toHaveText("Analytics: rejected.");
    expect(await page.evaluate(() => window["ga-disable-G-YEJZMCXJ7V"])).toBe(true);
    await page.goto(`${ORIGIN}/about.html`);
    expect(google.length).toBe(1); // only the load before the change
  });

  test("withdrawal clears Google cookies only, sends no further events, and survives a reload", async ({ page, context }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/privacy.html`);
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await expect.poll(() => google.length).toBe(1);
    // the stub sets no cookies, so plant what the real tag would set, plus an unrelated one
    await context.addCookies([
      { name: "_ga", value: "GA1.1.1", url: ORIGIN },
      { name: "_ga_YEJZMCXJ7V", value: "GS1.1.1", url: ORIGIN },
      { name: "unrelated", value: "keep", url: ORIGIN },
    ]);
    const events = () => page.evaluate(() => window.dataLayer.length);
    const before = await events();
    await page.getByRole("button", { name: "Change analytics choice" }).click();
    await page.getByRole("button", { name: "Reject analytics" }).click();
    expect((await context.cookies(ORIGIN)).map((c) => c.name).sort()).toEqual(["unrelated"]);
    expect(await events()).toBe(before); // nothing queued after withdrawal
    expect(await page.evaluate(() => window["ga-disable-G-YEJZMCXJ7V"])).toBe(true);
    await page.reload();
    await expect(page.locator(".tz-consent")).toHaveCount(0);
    await expect(page.locator("[data-tz-analytics-status]")).toHaveText("Analytics: rejected.");
    expect(google.length).toBe(1);
    expect(await page.evaluate(() => !!window.dataLayer)).toBe(false);
  });

  test("keyboard: the notice is reachable by Tab, buttons have a visible focus ring, Enter chooses", async ({ page }) => {
    await setup(page);
    await page.goto(`${ORIGIN}/about.html`);
    const reject = page.getByRole("button", { name: "Reject analytics" });
    const accept = page.getByRole("button", { name: "Accept analytics" });
    await reject.focus();
    expect(await reject.evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).outlineWidth)).toMatch(/solid 3px/);
    await page.keyboard.press("Tab");
    await expect(accept).toBeFocused();
    const [a, r] = await Promise.all([accept.boundingBox(), reject.boundingBox()]);
    expect([a.width, a.height]).toEqual([r.width, r.height]); // equal prominence
    const styleOf = (loc) => loc.evaluate((el) => { const s = getComputedStyle(el); return [s.backgroundColor, s.color, s.borderColor, s.fontWeight, s.fontSize].join("|"); });
    expect(await styleOf(accept)).toBe(await styleOf(reject));
    await page.keyboard.press("Enter");
    await expect(page.locator(".tz-consent")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("tz-analytics-consent"))).toBe("granted");
  });

  test("layout: the notice stays inside the viewport and is a small part of it, on a phone and on a desktop", async ({ page }) => {
    await setup(page);
    for (const [w, h] of [[360, 640], [1280, 800]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`${ORIGIN}/`);
      const box = await page.locator(".tz-consent").boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(w);
      expect(box.y + box.height).toBeLessThanOrEqual(h + 1);
      expect(box.height / h).toBeLessThan(w < 500 ? 0.4 : 0.2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });

  test("no tracking on the preview host, localhost or an unknown host, even with a remembered Accept", async ({ page }) => {
    const hosts = ["salar500.github.io", "localhost", "tools.example.test"];
    const google = await setup(page, hosts);
    await page.addInitScript(() => { try { localStorage.setItem("tz-analytics-consent", "granted"); } catch {} });
    for (const host of hosts) {
      await page.goto(`http://${host}/`);
      await expect(page.locator("meta[name=tz-analytics-id]")).toHaveCount(1); // the page IS the analytics build
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".tz-consent")).toHaveCount(0);
      expect(await page.evaluate(() => !!window.dataLayer)).toBe(false);
    }
    expect(google).toEqual([]);
  });

  test("history navigation: our code sends no page_view for pushState/replaceState (one config per document)", async ({ page }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/categories.html`);
    await page.getByRole("button", { name: "Accept analytics" }).click();
    await expect.poll(() => google.length).toBe(1);
    await page.evaluate(() => { history.pushState({}, "", "/categories.html?q=salary"); history.replaceState({}, "", "/categories.html?q=a"); });
    expect(await page.evaluate(() => window.dataLayer.filter((a) => a[0] === "config" || a[1] === "page_view").length)).toBe(1);
    expect(await page.evaluate(() => JSON.stringify(window.dataLayer).includes("salary"))).toBe(false);
  });

  test("the 404 page is not tracked and shows no banner", async ({ page }) => {
    const google = await setup(page);
    await page.goto(`${ORIGIN}/404.html`);
    await expect(page.locator(".tz-consent")).toHaveCount(0);
    expect(google).toEqual([]);
  });
});
