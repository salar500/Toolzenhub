/**
 * Tool Pack 39: UUID Generator. The layouts and ordering rules are proven in
 * tests/unit/uuid-generator.test.mjs; here the page is checked: workflow, validation, the
 * absence of a weak random fallback, privacy, mobile layout, accessibility and its place in the site.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const panel = (page) => page.locator("#ug-panel");
const status = (page) => page.locator("#ug-status");
const live = (page) => page.locator("#ug-live");
const count = (page) => page.locator("#ug-count");
const items = (page) => page.locator("#ug-list .ug-item__text");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

async function open(page, go) {
  await go("tools/uuid-generator/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

test.describe("UUID Generator", () => {
  test("loads clean, says a UUID is not a secret, and starts empty", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("UUID Generator");
    await expect(page.locator(".ug-note")).toContainText("A UUID is an identifier, not a secret.");
    await expect(status(page)).toHaveText("Press Generate.");
    await expect(btn(page, "Copy all")).toBeDisabled();
    await expect(page.locator("#ug-list")).toBeHidden();
    expectClean(watch);
  });

  test("Generate makes the default five version 4 UUIDs, all different, and announces it", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Generate").click();
    const list = await items(page).allInnerTexts();
    expect(list).toHaveLength(5);
    for (const u of list) expect(u).toMatch(V4);
    expect(new Set(list).size).toBe(5);
    await expect(status(page)).toHaveText("5 version 4 (random) UUIDs generated.");
    await expect(live(page)).toHaveText("5 version 4 (random) UUIDs generated.");
    await btn(page, "Generate").click();
    const again = await items(page).allInnerTexts();
    expect(again.some((u) => list.includes(u))).toBe(false);
  });

  test("version 7 UUIDs carry the current time and sort in the order made", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel(/Version 7/).check();
    await count(page).fill("200");
    const before = Date.now();
    await btn(page, "Generate").click();
    const after = Date.now();
    const list = await items(page).allInnerTexts();
    expect(list).toHaveLength(200);
    for (const u of list) expect(u).toMatch(V7);
    expect([...list].sort()).toEqual(list);
    const ms = parseInt(list[0].replaceAll("-", "").slice(0, 12), 16);
    expect(ms).toBeGreaterThanOrEqual(before - 5);
    expect(ms).toBeLessThanOrEqual(after + 5);
  });

  test("nil is all zeros", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel(/Nil/).check();
    await count(page).fill("1");
    await btn(page, "Generate").click();
    await expect(items(page)).toHaveText(["00000000-0000-0000-0000-000000000000"]);
    await expect(status(page)).toHaveText("1 nil UUID generated.");
  });

  test("format options: uppercase, no hyphens, braces", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Uppercase").check();
    await page.getByLabel("Hyphens").uncheck();
    await page.getByLabel("Braces { }").check();
    await count(page).fill("3");
    await btn(page, "Generate").click();
    for (const u of await items(page).allInnerTexts()) expect(u).toMatch(/^\{[0-9A-F]{32}\}$/);
  });

  test("a bad count is refused next to the field and in the status; nothing is generated", async ({ page, go }) => {
    await open(page, go);
    for (const bad of ["0", "1001", "abc", "", "2.5", "-3"]) {
      await count(page).fill(bad);
      await btn(page, "Generate").click();
      await expect(panel(page)).toHaveAttribute("data-state", "invalid");
      await expect(page.locator("#ug-count-error")).toHaveText("Enter a whole number from 1 to 1000.");
      await expect(count(page)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#ug-list")).toBeHidden();
    }
    await count(page).fill("1000");
    await count(page).press("Enter");
    await expect(items(page)).toHaveCount(1000);
    await expect(count(page)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("Copy all and a single Copy use the clipboard text, one UUID per line", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await count(page).fill("3");
    await btn(page, "Generate").click();
    const list = await items(page).allInnerTexts();
    await btn(page, "Copy all").click();
    expect(await page.evaluate(() => window.__copied.at(-1))).toBe(list.join("\n"));
    await expect(live(page)).toHaveText("All UUIDs copied to the clipboard.");
    await page.getByRole("button", { name: `Copy ${list[1]}` }).click();
    expect(await page.evaluate(() => window.__copied.at(-1))).toBe(list[1]);
  });

  test("with no secure random source nothing is generated and no weaker source is used", async ({ page, go }) => {
    await page.addInitScript(() => {
      Object.defineProperty(crypto, "getRandomValues", { value: undefined, configurable: true });
      window.__math = 0;
      const orig = Math.random;
      Math.random = () => { window.__math++; return orig(); };
    });
    await open(page, go);
    await btn(page, "Generate").click();
    await expect(status(page)).toHaveText("This browser has no secure random number source, so no UUIDs were made.");
    await expect(page.locator("#ug-list")).toBeHidden();
    expect(await page.evaluate(() => window.__math)).toBe(0);
  });

  test("Reset restores the defaults and clears the list", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel(/Version 7/).check();
    await page.getByLabel("Uppercase").check();
    await count(page).fill("9");
    await btn(page, "Generate").click();
    await btn(page, "Reset").click();
    await expect(page.getByLabel(/Version 4/)).toBeChecked();
    await expect(page.getByLabel("Uppercase")).not.toBeChecked();
    await expect(count(page)).toHaveValue("5");
    await expect(page.locator("#ug-list")).toBeHidden();
    await expect(status(page)).toHaveText("Press Generate.");
  });

  test("privacy: no request carries a UUID, nothing is stored, address unchanged", async ({ page, go, watch }) => {
    await open(page, go);
    const before = page.url();
    await btn(page, "Generate").click();
    const first = (await items(page).allInnerTexts())[0];
    expect(page.url()).toBe(before);
    const stored = await page.evaluate(() => JSON.stringify({ l: Object.entries(localStorage), s: Object.entries(sessionStorage), c: document.cookie }));
    expect(stored).not.toContain(first);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("accessibility: labelled controls, polite live region, keyboard order, visible focus", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(page.getByRole("group", { name: "Version" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Format" })).toBeVisible();
    await expect(page.getByLabel(/How many/)).toBeVisible();
    await btn(page, "Generate").click();
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    await page.getByLabel(/Version 4/).focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByLabel(/Version 7/)).toBeChecked();
    await page.keyboard.press("Tab");
    await expect(count(page)).toBeFocused();
    expect(await outline(count(page))).toBeGreaterThanOrEqual(2);
    for (const target of [page.locator("#ug-upper"), page.locator("#ug-hyphens"), page.locator("#ug-braces"), btn(page, "Generate"), btn(page, "Copy all"), btn(page, "Reset")]) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
      expect(await outline(target)).toBeGreaterThanOrEqual(2);
    }
  });

  for (const width of [320, 390]) {
    test(`${width} px: nothing widens the page, controls are tappable, a long braced UUID fits`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await page.getByLabel("Braces { }").check();
      await page.getByLabel("Uppercase").check();
      await btn(page, "Generate").click();
      await expectNoHorizontalOverflow(page);
      for (const b of [btn(page, "Generate"), btn(page, "Reset")]) {
        expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      expect((await count(page).boundingBox()).height).toBeGreaterThanOrEqual(44);
    });
  }
});

test.describe("UUID Generator in the site", () => {
  test("it is a Developer Tool: listed there, absent from Calculators and Time Tools; title and canonical set", async ({ page, go }) => {
    await go("tools.html");
    const section = (name) => page.locator(".directory-section", { has: page.locator(`.directory-section__title a:text-is("${name}")`) });
    await expect(section("Developer Tools").locator('a[href$="tools/uuid-generator/"]')).toHaveCount(1);
    for (const other of ["Calculators", "Time Tools"]) {
      await expect(section(other).locator('a[href$="tools/uuid-generator/"]')).toHaveCount(0);
    }
    await go("tools/uuid-generator/");
    await expect(page).toHaveTitle(/UUID Generator/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tools\/uuid-generator\/$/);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("UUID Generator");
  });
});
