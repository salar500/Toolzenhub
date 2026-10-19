/**
 * Tool Pack 28: World Clock.
 *
 * Focused on what this change can break: the board and its cards, search (cities, aliases, countries, zones, regions, no results),
 * the 12-city limit, the comparison reference, the 12/24-hour switch, the address (valid, mixed, hostile), the hand-off to the Time
 * Zone Converter, the one coordinated timer (and what it does while the page is hidden), accessibility of the new surface, the phone
 * layout, privacy, and the tool's place in the site (Time Tools, All Tools, search). The calculations are covered by
 * tests/unit/world-clock-*.test.mjs and an independent Python reference; here the page is checked.
 *
 * The browser is pinned to Asia/Kolkata and the clock to Monday 2026-10-19 14:20 UTC (19:50 in India) so every default is known.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

test.use({ timezoneId: "Asia/Kolkata", locale: "en-US" });

const NOW = new Date("2026-10-19T14:20:00Z");

const panel = (page) => page.locator("#wc-panel");
const cards = (page) => page.locator("#wc-board > .wc-card");
const card = (page, title) => cards(page).filter({ has: page.locator(".wc-card__title", { hasText: new RegExp(`^${title}$`) }) });
const live = (page) => page.locator("#wc-live");
const search = (page) => page.locator("#wc-search");
const options = (page) => page.locator("#wc-list [role='option']");
const titles = async (page) => (await cards(page).locator(".wc-card__title").allInnerTexts()).map((t) => t.trim());

async function open(page, go, query = "", time = NOW) {
  await page.clock.install({ time });
  await go(`tools/world-clock/${query}`);
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function addCity(page, query, name) {
  await search(page).fill(query);
  await options(page).filter({ hasText: name }).first().click();
}

test.describe("World Clock", () => {
  test("page, breadcrumb, labels, and the default board: Your time first, then four starter cities, all read from one clock", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("World Clock");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Time Tools", "World Clock"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}time-tools.html`]);
    await expect(page.getByLabel("Add a city", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Region", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Country", { exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /Browse places/ })).toHaveCount(1);
    await expect(page.getByLabel("Compare with", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("24-hour clock", { exact: true })).toHaveCount(1);
    expect(await titles(page)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore"]);
    await expect(page.locator(".wc-card__sub").first()).toHaveText("Time zone · Asia/Kolkata"); // the modern spelling, although Chromium calls the zone Asia/Calcutta
    // 14:20 UTC is 19:50 in India
    await expect(card(page, "Your time").locator("time")).toHaveText("7:50 PM");
    await expect(card(page, "Your time").locator("time")).toHaveAttribute("datetime", "2026-10-19T19:50+05:30");
    await expect(card(page, "Your time").locator(".wc-card__difference")).toHaveText("This is the comparison reference");
    await expect(card(page, "New York").locator("time")).toHaveText("10:20 AM");
    await expect(card(page, "New York").locator(".wc-card__offset")).toHaveText("UTC−04:00");
    await expect(card(page, "New York").locator(".wc-card__difference")).toHaveText("9h 30m behind Your time");
    await expect(card(page, "New York").locator(".wc-card__date")).toContainText("Mon, 19 Oct 2026");
    await expect(card(page, "New York").locator(".wc-card__relation")).toHaveText("Today");
    await expect(card(page, "Dubai").locator(".wc-card__difference")).toHaveText("1h 30m behind Your time");
    await expect(card(page, "Singapore").locator(".wc-card__difference")).toHaveText("2h 30m ahead of Your time");
    await expect(card(page, "London").locator(".wc-day__word")).toHaveText("Daytime");
    await expect(card(page, "Your time").locator(".wc-day__word")).toHaveText("Night-time");
    await expect(page.locator(".related-section, .report-issue")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/\bbest\b|most accurate|AI-powered|real-time global|worldwide coverage|all cities/i);
    expectClean(watch);
  });

  test("every card has the same structure and, on a wide screen, the cards in a row are the same height", async ({ page, go }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, go);
    const shapes = await cards(page).evaluateAll((lis) => lis.map((li) => [...li.querySelectorAll(":scope > *")].map((c) => c.className.split(" ")[0]).join(",")));
    expect(new Set(shapes).size).toBe(1);
    const tops = await cards(page).evaluateAll((lis) => lis.map((li) => [Math.round(li.getBoundingClientRect().top), Math.round(li.getBoundingClientRect().height)]));
    const firstRow = tops.filter(([top]) => top === tops[0][0]);
    expect(firstRow.length).toBeGreaterThanOrEqual(3);
    expect(new Set(firstRow.map(([, h]) => h)).size).toBe(1);
    await expect(page.locator("#wc-board")).toHaveAttribute("aria-label", "World clocks");
  });

  test("the first clock is on screen on a phone without scrolling far, and nothing overflows sideways at 320, 360 and 390", async ({ page, go }) => {
    await open(page, go);
    for (const [w, h] of [[390, 844], [360, 780], [320, 700]]) {
      await page.setViewportSize({ width: w, height: h });
      await expectNoHorizontalOverflow(page);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const top = await cards(page).first().evaluate((li) => li.getBoundingClientRect().top);
    expect(top).toBeLessThan(844 - 100);
    await expect(cards(page).first().locator("time")).toBeVisible();
    for (const target of await page.locator(".wc-input, .wc-card__remove, .wc-check, #wc-copy").all()) {
      const box = await target.boundingBox();
      if (box) expect(box.height, "touch target height").toBeGreaterThanOrEqual(40);
    }
    await expect(search(page)).toHaveCSS("font-size", "16px");
  });

  test("add a city by its everyday name, an old name, a short alias and a country; the box keeps focus and the choice is announced once", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("mumbai");
    await expect(options(page).first()).toContainText("Mumbai");
    await expect(options(page).first()).toContainText("India");
    await options(page).first().click();
    await expect(card(page, "Mumbai")).toBeVisible();
    await expect(card(page, "Mumbai").locator(".wc-card__difference")).toHaveText("Same time as Your time");
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).toBeFocused();
    await expect(live(page)).toHaveText("Added Mumbai, India. 5 of 12 cities.");
    await expect(search(page)).toHaveAttribute("aria-expanded", "false");

    await addCity(page, "bombay", "Mumbai"); // already there
    await expect(live(page)).toHaveText("Mumbai, India is already on your board.");
    await expect(cards(page).filter({ hasText: "Mumbai" })).toHaveCount(1);

    await addCity(page, "NYC", "New York"); // already a starter
    await addCity(page, "LA", "Los Angeles");
    await expect(card(page, "Los Angeles")).toBeVisible();
    await search(page).fill("kenya");
    await expect(options(page).first()).toContainText("Nairobi");
    await options(page).first().click();
    await expect(card(page, "Nairobi")).toBeVisible();
    await expect(card(page, "Nairobi").locator(".wc-card__sub")).toHaveText("Kenya");
  });

  test("two cities with one name are both offered, the better-known first, each with its country", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("london");
    await expect(options(page)).toHaveCount(2);
    await expect(options(page).nth(0)).toContainText("United Kingdom");
    await expect(options(page).nth(1)).toContainText("Canada");
    await expect(options(page).nth(0)).toContainText("On your board");
    await options(page).nth(1).click();
    await expect(page.locator(".wc-card__sub", { hasText: "Canada" })).toHaveCount(1);
  });

  test("a browser time zone that no listed city covers can be added by name", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("indiana knox");
    await expect(options(page).first()).toContainText("Knox");
    await expect(options(page).first()).toContainText("Time zone · America/Indiana/Knox");
    await options(page).first().click();
    await expect(card(page, "Knox")).toBeVisible();
    await expect(card(page, "Knox").locator(".wc-card__sub")).toHaveText("America/Indiana/Knox");
    await expect(card(page, "Knox").locator(".wc-card__offset")).toHaveText("UTC−05:00");
  });

  test("no match: a clear message that says the list is not every city, with a way into Browse places", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("jaipur");
    await expect(options(page)).toHaveCount(0);
    await expect(page.locator("#wc-list")).toContainText('No match for "jaipur"');
    await expect(page.locator("#wc-list")).toContainText("does not include every city in the world");
    await page.locator("#wc-list").getByRole("button", { name: "Browse by region or country" }).dispatchEvent("mousedown");
    await expect(page.locator("#wc-browse")).toBeVisible();
    await expect(page.locator("#wc-browse-toggle")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#wc-list")).toBeHidden();
  });

  test("Browse places by region: six regions, the region's listed cities alphabetically with their times, and a Clear that resets", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#wc-browse")).toBeHidden();
    await page.locator("#wc-browse-toggle").click();
    await expect(page.locator("#wc-browse")).toBeVisible();
    await expect(page.locator("#wc-region option")).toHaveText(["All regions", "Africa", "Asia", "Europe", "North America", "Oceania", "South America"]);
    await expect(page.locator("#wc-browse-header")).toHaveText("Choose a region or country to list places.");
    await page.locator("#wc-region").selectOption("Oceania");
    await expect(page.locator("#wc-browse-header")).toContainText("Oceania · 22 listed cities");
    await expect(live(page)).toContainText("Oceania · 22 listed cities");
    const names = await page.locator(".wc-browse__row .wc-row__main").allInnerTexts();
    expect(names).toHaveLength(10);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    await expect(page.locator(".wc-browse__row").first()).toContainText("Adelaide");
    await expect(page.locator(".wc-browse__row").first()).toContainText("UTC+10:30");
    await page.locator("#wc-browse-more").click();
    await expect(page.locator(".wc-browse__row")).toHaveCount(22);
    await expect(page.locator("#wc-browse-more")).toBeHidden();
    await page.locator("#wc-browse-clear").click();
    await expect(page.locator(".wc-browse__row")).toHaveCount(0);
    await expect(page.locator("#wc-region")).toHaveValue("");
    await expect(page.locator("#wc-browse-clear")).toBeHidden();
  });

  test("Browse places by country: the countries of a region, then a country's cities and every other zone with its own time; choosing a row adds it", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#wc-browse-toggle").click();
    await expect(page.locator("#wc-country")).toBeEnabled();
    const all = await page.locator("#wc-country option").allInnerTexts();
    expect(all.length).toBeGreaterThan(200);
    await page.locator("#wc-region").selectOption("South America");
    const sa = await page.locator("#wc-country option").allInnerTexts();
    expect(sa).toEqual(expect.arrayContaining(["Brazil", "Argentina", "Peru"]));
    expect(sa).not.toContain("Mexico");
    await page.locator("#wc-region").selectOption("");
    await page.locator("#wc-country").selectOption("AU");
    await expect(page.locator("#wc-browse-header")).toHaveText("Australia · 12 time zones");
    await expect(page.locator(".wc-browse__row")).toHaveCount(10);
    await page.locator("#wc-browse-more").click();
    await expect(page.locator(".wc-browse__row")).toHaveCount(13);
    await expect(page.locator(".wc-browse__row", { hasText: "Eucla" })).toContainText("Western Australia (Eucla)");
    await expect(page.locator(".wc-browse__row", { hasText: "Perth" })).toContainText("UTC+08:00");
    await page.locator(".wc-browse__row", { hasText: "Perth" }).click();
    await expect(card(page, "Perth")).toBeVisible();
    await expect(page.locator("#wc-search-hint")).toContainText("Added Perth, Australia. 5 of 12 cities.");
    await expect(page.locator(".wc-browse__row", { hasText: "Perth" })).toBeDisabled();
    await expect(page.locator(".wc-browse__row", { hasText: "Perth" })).toContainText("On your board");
  });

  test("the board holds 12 cities besides Your time: then the box is off, a message says so, and removing one restores it", async ({ page, go }) => {
    const ids = ["mumbai-in", "delhi-in", "tokyo-jp", "paris-fr", "berlin-de", "cairo-eg", "lagos-ng", "sydney-au", "toronto-ca", "lima-pe", "seoul-kr", "rome-it"];
    await open(page, go, `?cities=${ids.join(",")}`);
    await expect(cards(page)).toHaveCount(13);
    await expect(search(page)).toBeDisabled();
    await expect(page.locator("#wc-search-hint")).toContainText("The board is full (12 cities)");
    await card(page, "Rome").getByRole("button", { name: "Remove Rome, Italy" }).click();
    await expect(search(page)).toBeEnabled();
    await expect(cards(page)).toHaveCount(12);
  });

  test("remove: the card goes, focus moves to the next card's button (or the heading), and the choice is announced", async ({ page, go }) => {
    await open(page, go);
    await card(page, "New York").getByRole("button", { name: "Remove New York, United States" }).click();
    await expect(card(page, "New York")).toHaveCount(0);
    await expect(live(page)).toHaveText("Removed New York, United States. 3 of 12 cities.");
    await expect(card(page, "London").getByRole("button", { name: /^Remove/ })).toBeFocused();
    for (const name of ["London", "Dubai", "Singapore"]) await card(page, name).getByRole("button", { name: /^Remove/ }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(page.locator("#wc-board-heading")).toBeFocused();
    await expect(page.locator("#wc-empty")).toBeVisible();
    await expect(page.locator("#wc-empty")).toContainText("Add a city above to see its time here.");
    await expect(page.locator("#wc-quick button")).toHaveCount(4);
    await page.locator("#wc-quick button").first().click();
    await expect(cards(page)).toHaveCount(2);
    await expect(page.locator("#wc-empty")).toBeHidden();
  });

  test("Your time has no remove button", async ({ page, go }) => {
    await open(page, go);
    await expect(card(page, "Your time").getByRole("button")).toHaveCount(0);
  });

  test("Compare with: every difference and every Today, Tomorrow or Yesterday is measured from the chosen city; removing it falls back to Your time", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Compare with").selectOption({ label: "London, United Kingdom" });
    await expect(live(page)).toHaveText("Comparing with London, United Kingdom.");
    await expect(card(page, "London").locator(".wc-card__difference")).toHaveText("This is the comparison reference");
    await expect(card(page, "London")).toHaveClass(/wc-card--reference/);
    await expect(card(page, "Your time")).not.toHaveClass(/wc-card--reference/);
    await expect(card(page, "Your time").locator(".wc-card__difference")).toHaveText("4h 30m ahead of London, United Kingdom");
    await expect(card(page, "New York").locator(".wc-card__difference")).toHaveText("5h behind London, United Kingdom");
    expect(page.url()).toContain("ref=london-gb");
    await card(page, "London").getByRole("button", { name: /^Remove/ }).click();
    await expect(page.getByLabel("Compare with")).toHaveValue("");
    await expect(live(page)).toHaveText("Removed London, United Kingdom. Comparing with Your time. 3 of 12 cities.");
    await expect(card(page, "Your time")).toHaveClass(/wc-card--reference/);
    expect(page.url()).not.toContain("ref=");
  });

  test("the 24-hour switch changes every time and its clock-change line; AM and PM are always shown in the 12-hour form", async ({ page, go }) => {
    await open(page, go);
    await expect(card(page, "Your time").locator(".wc-time__ampm")).toHaveText("PM");
    await page.getByLabel("24-hour clock").check();
    await expect(card(page, "Your time").locator("time")).toHaveText("19:50");
    await expect(card(page, "Your time").locator(".wc-time__ampm")).toBeHidden();
    await expect(card(page, "New York").locator("time")).toHaveText("10:20");
    await expect(card(page, "New York").locator(".wc-card__change")).toContainText("(at 02:00)");
    await page.getByLabel("24-hour clock").uncheck();
    await expect(card(page, "New York").locator(".wc-card__change")).toContainText("(at 2:00 AM)");
  });

  test("the optional clock-change line appears after the first paint for a zone that has a change, and a card with none says nothing", async ({ page, go }) => {
    await open(page, go);
    await expect(card(page, "New York").locator(".wc-card__change")).toHaveText("Clocks change Sun 1 Nov: UTC−04:00 → UTC−05:00 (at 2:00 AM)");
    await expect(card(page, "London").locator(".wc-card__change")).toHaveText("Clocks change Sun 25 Oct: UTC+01:00 → UTC+00:00 (at 2:00 AM)");
    await expect(card(page, "Dubai").locator(".wc-card__change")).toBeHidden();
    await expect(card(page, "Your time").locator(".wc-card__change")).toBeHidden();
    await expect(page.locator("#wc-board")).not.toContainText("No clock change found");
  });

  test("the address: valid cities and a reference load exactly; it is kept tidy without adding history; every add and remove updates it", async ({ page, go }) => {
    await open(page, go, "?cities=mumbai-in,America/Indiana/Knox,tokyo-jp&ref=tokyo-jp");
    expect(await titles(page)).toEqual(["Your time", "Mumbai", "Knox", "Tokyo"]);
    await expect(page.getByLabel("Compare with")).toHaveValue("tokyo-jp");
    await expect(card(page, "Tokyo")).toHaveClass(/wc-card--reference/);
    const before = await page.evaluate(() => history.length);
    await addCity(page, "paris", "Paris");
    expect(page.url()).toContain("cities=mumbai-in,America/Indiana/Knox,tokyo-jp,paris-fr");
    expect(page.url()).toContain("ref=tokyo-jp");
    expect(await page.evaluate(() => history.length)).toBe(before);
    expect(page.url()).not.toContain("%2C");
    expect(page.url()).not.toContain("%2F");
  });

  test("an address with some valid and some invalid items shows the valid ones and says how many were skipped, without echoing them", async ({ page, go }) => {
    await open(page, go, "?cities=mumbai-in,not-a-city-xx,Nowhere/Land,tokyo-jp");
    expect(await titles(page)).toEqual(["Your time", "Mumbai", "Tokyo"]);
    await expect(page.locator("#wc-message")).toHaveText("2 items in this link were not recognised and were skipped.");
    await expect(page.locator("#wc-message")).not.toContainText("Nowhere");
    await expect(live(page)).toHaveText("2 items in this link were not recognised and were skipped.");
    expect(page.url()).toContain("cities=mumbai-in,tokyo-jp");
    expect(page.url()).not.toContain("Nowhere");
  });

  test("hostile and empty addresses fall back to the starter board, run nothing, and put nothing in the page as HTML", async ({ page, go, watch }) => {
    await page.addInitScript(() => { window.__xss = 0; });
    const hostile = [
      "<img src=x onerror=window.__xss=1>", "<script>window.__xss=1</script>", "javascript:window.__xss=1", "__proto__", "constructor",
      "%00", "a".repeat(5000), "mumbai-in%22%3E%3Cimg%20src=x%20onerror=window.__xss=1%3E",
    ];
    for (const value of hostile) {
      await page.clock.install({ time: NOW });
      await go(`tools/world-clock/?cities=${value}&ref=${value}`);
      await expect(panel(page)).toHaveAttribute("data-ready", "true");
      expect(await titles(page), value.slice(0, 40)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore"]);
      expect(await page.evaluate(() => window.__xss)).toBe(0);
      expect(await page.locator("#wc-board img, #wc-board script, #wc-message img, #wc-message script").count()).toBe(0);
    }
    for (const q of ["?cities=", "?cities=,,,", "?ref=london-gb", "?x=1"]) {
      await page.clock.install({ time: NOW });
      await go(`tools/world-clock/${q}`);
      await expect(panel(page)).toHaveAttribute("data-ready", "true");
      expect(await titles(page)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore"]);
    }
    expectClean(watch);
  });

  test("a board longer than 12 in the address keeps the first 12 and says the rest were skipped", async ({ page, go }) => {
    const ids = ["mumbai-in", "delhi-in", "tokyo-jp", "paris-fr", "berlin-de", "cairo-eg", "lagos-ng", "sydney-au", "toronto-ca", "lima-pe", "seoul-kr", "rome-it", "oslo-no", "kyiv-ua"];
    await open(page, go, `?cities=${ids.join(",")}`);
    await expect(cards(page)).toHaveCount(13);
    await expect(page.locator("#wc-message")).toHaveText("2 items in this link were not recognised and were skipped.");
  });

  test("the hand-off link names your zone and the board's zones, and the Time Zone Converter opens with them", async ({ page, go }) => {
    await open(page, go);
    const link = page.locator("#wc-plan");
    await expect(link).toContainText("Plan a meeting or convert a specific time across these cities");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/\/tools\/time-zone-converter\/\?from=Asia\/(Kolkata|Calcutta)&to=America\/New_York,Europe\/London,Asia\/Dubai,Asia\/Singapore$/);
    await link.click();
    await expect(page.locator("#tz-panel")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#tz-source-input")).toHaveValue(/^Asia\/(Kolkata|Calcutta)$/);
    await expect(page.locator("#tz-board .tz-row")).toHaveCount(4);
    await expect(page.locator("main")).not.toContainText("World Clock"); // the converter does not link back (a separate decision)
  });

  test("Copy link: the address is copied (nothing is read from the clipboard); a refusing clipboard shows it in a box to copy by hand", async ({ page, go }) => {
    // the preview is served over http, where the real clipboard does not exist, so a stand-in records what would be written
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text) => { window.__copied.push(text); }, readText: async () => { window.__read = true; return ""; } } });
    });
    await open(page, go);
    await addCity(page, "mumbai", "Mumbai");
    await page.locator("#wc-copy").click();
    await expect(live(page)).toHaveText("Link copied.");
    expect(await page.evaluate(() => window.__copied)).toEqual([page.url()]);
    expect(await page.evaluate(() => window.__read)).toBeUndefined();
    expect(page.url()).toContain("cities=new-york-us,london-gb,dubai-ae,singapore-sg,mumbai-in");
    await expect(page.locator("#wc-link-box")).toBeHidden();
    await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); });
    await page.locator("#wc-copy").click();
    await expect(page.locator("#wc-link-box")).toBeVisible();
    await expect(page.locator("#wc-link")).toHaveValue(page.url());
    await expect(live(page)).toHaveText("Copy this link from the box below.");
  });

  test("one timer: no interval, one pending timeout once settled; a minute later every card has moved; nothing is announced on the tick", async ({ page, go }) => {
    await page.clock.install({ time: NOW });
    await page.addInitScript(() => {
      const pending = new Set();
      const t = { intervals: 0 };
      const st = window.setTimeout.bind(window), ct = window.clearTimeout.bind(window), si = window.setInterval.bind(window);
      window.setTimeout = (fn, ms, ...a) => { let id; id = st((...x) => { pending.delete(id); return fn(...x); }, ms, ...a); pending.add(id); return id; };
      window.clearTimeout = (id) => { pending.delete(id); return ct(id); };
      window.setInterval = (...a) => { t.intervals += 1; return si(...a); };
      window.__timers = { get intervals() { return t.intervals; }, get pending() { return pending.size; } };
    });
    await go("tools/world-clock/");
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await page.clock.runFor(100); // let the settled work (the clock-change lines) finish
    await expect(card(page, "New York").locator(".wc-card__change")).toContainText("Clocks change");
    await expect.poll(() => page.evaluate(() => window.__timers.pending)).toBe(1);
    expect(await page.evaluate(() => window.__timers.intervals)).toBe(0);
    await expect(card(page, "Your time").locator("time")).toHaveText("7:50 PM");
    const spoken = await live(page).innerText();
    await page.clock.runFor(61000);
    await expect(card(page, "Your time").locator("time")).toHaveText("7:51 PM");
    await expect(card(page, "New York").locator("time")).toHaveText("10:21 AM");
    await expect(card(page, "Singapore").locator("time")).toHaveText("10:21 PM");
    expect(await live(page).innerText()).toBe(spoken);
    expect(await page.evaluate(() => window.__timers.intervals)).toBe(0);
    await expect.poll(() => page.evaluate(() => window.__timers.pending)).toBe(1);
    await expect(page.locator("[aria-live]")).toHaveCount(1);
    for (const node of await page.locator("#wc-board *").all()) {
      expect(await node.getAttribute("aria-live")).toBeNull();
    }
  });

  test("while the page is hidden the timer is cleared and nothing runs; on return the board is redrawn at once from a fresh clock", async ({ page, go }) => {
    await page.clock.install({ time: NOW });
    await page.addInitScript(() => {
      const pending = new Set();
      const st = window.setTimeout.bind(window), ct = window.clearTimeout.bind(window);
      window.setTimeout = (fn, ms, ...a) => { let id; id = st((...x) => { pending.delete(id); return fn(...x); }, ms, ...a); pending.add(id); return id; };
      window.clearTimeout = (id) => { pending.delete(id); return ct(id); };
      window.__timers = { get pending() { return pending.size; } };
      window.__hide = (hidden) => { Object.defineProperty(document, "hidden", { value: hidden, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); };
    });
    await go("tools/world-clock/");
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await page.clock.runFor(100);
    await expect.poll(() => page.evaluate(() => window.__timers.pending)).toBe(1);
    await page.evaluate(() => window.__hide(true));
    expect(await page.evaluate(() => window.__timers.pending)).toBe(0);
    await page.clock.runFor(10 * 60000);
    await expect(card(page, "Your time").locator("time")).toHaveText("7:50 PM"); // nothing ran while hidden
    await page.evaluate(() => window.__hide(false));
    await expect(card(page, "Your time").locator("time")).toHaveText("8:00 PM"); // redrawn at once
    await expect(card(page, "New York").locator("time")).toHaveText("10:30 AM");
    await expect.poll(() => page.evaluate(() => window.__timers.pending)).toBe(1);
  });

  test("a clock that jumps is corrected on the next tick, and a card crosses local midnight with its date and relation", async ({ page, go }) => {
    await open(page, go, "", new Date("2026-10-19T18:28:30Z")); // 23:58:30 in India
    await expect(card(page, "Your time").locator(".wc-card__date")).toContainText("Mon, 19 Oct 2026");
    await page.clock.runFor(91000); // past local midnight in India
    await expect(card(page, "Your time").locator("time")).toHaveText("12:00 AM");
    await expect(card(page, "Your time").locator(".wc-card__date")).toContainText("Tue, 20 Oct 2026");
    await expect(card(page, "New York").locator(".wc-card__date")).toContainText("Mon, 19 Oct 2026");
    await expect(card(page, "New York").locator(".wc-card__relation")).toHaveText("Yesterday");
    await expect(card(page, "Singapore").locator(".wc-card__relation")).toHaveText("Today");
    await page.clock.setSystemTime(new Date("2026-10-20T06:00:00Z"));
    await page.clock.runFor(61000);
    await expect(card(page, "Your time").locator("time")).toHaveText("11:31 AM");
  });

  test("keyboard: the box is a combobox; arrows move through the matches, Enter adds, Escape closes, and the listbox is linked to the box", async ({ page, go }) => {
    await open(page, go);
    const box = search(page);
    await expect(box).toHaveAttribute("role", "combobox");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(box).toHaveAttribute("aria-controls", "wc-list");
    await expect(box).toHaveAttribute("aria-describedby", "wc-search-hint");
    await box.focus();
    await page.keyboard.type("sou");
    await expect(box).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#wc-list")).toHaveAttribute("role", "listbox");
    const first = await options(page).first().getAttribute("id");
    await expect(box).toHaveAttribute("aria-activedescendant", first);
    await page.keyboard.press("ArrowDown");
    const second = await options(page).nth(1).getAttribute("id");
    await expect(box).toHaveAttribute("aria-activedescendant", second);
    await page.keyboard.press("ArrowUp");
    await expect(options(page).first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(options(page).last()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await page.keyboard.press("Escape");
    await expect(box).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#wc-list")).toBeHidden();
    await expect(box).toHaveValue("sou");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#wc-list")).toBeVisible();
    const name = await options(page).first().locator(".wc-row__main").innerText();
    await page.keyboard.press("Enter");
    await expect(card(page, name)).toBeVisible();
    await expect(box).toBeFocused();
    await expect(box).toHaveValue("");
  });

  test("accessibility of the surface: one h1, headings in order, a labelled list of cards, <time> elements, named buttons, visible focus", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("main h1")).toHaveCount(1);
    expect(await page.locator("main h2, main h3").evaluateAll((hs) => hs.map((h) => h.tagName))).toEqual(expect.arrayContaining(["H2", "H3"]));
    await expect(page.locator("ul#wc-board > li")).toHaveCount(5);
    await expect(page.locator("#wc-board time")).toHaveCount(5);
    for (const button of await page.locator(".wc-card__remove").all()) {
      expect(await button.getAttribute("aria-label")).toMatch(/^Remove .+, .+$/);
    }
    await expect(page.locator("#wc-live")).toHaveAttribute("role", "status");
    await expect(page.locator("#wc-live")).toHaveAttribute("aria-live", "polite");
    await search(page).focus();
    const outline = await search(page).evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).outlineWidth);
    expect(outline).toBe("solid 3px");
    // meaning is carried by words, not colour alone
    for (const li of await cards(page).all()) {
      await expect(li.locator(".wc-day__word")).toHaveText(/^(Daytime|Night-time)$/);
      await expect(li.locator(".wc-card__relation")).toHaveText(/^(Today|Tomorrow|Yesterday|\d+ days (later|earlier))$/);
    }
    // the sections that explain the limits are on the page
    await expect(page.locator("main")).toContainText("not every city in the world");
    await expect(page.locator("main")).toContainText("device's clock");
  });

  test("privacy: no storage, no cookie, no request beyond the site's own files", async ({ page, go, context }) => {
    const external = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (!["localhost", "salar500.github.io", "tools.example.test", "toolzenhub.in"].includes(u.hostname) && !/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) external.push(r.url());
    });
    await open(page, go);
    await addCity(page, "mumbai", "Mumbai");
    await page.getByLabel("24-hour clock").check();
    await page.getByLabel("Compare with").selectOption({ label: "Mumbai, India" });
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
    expect(await page.evaluate(async () => (await indexedDB.databases?.())?.length ?? 0)).toBe(0);
    expect(external).toEqual([]);
    expect((await context.cookies()).length).toBe(0);
    await page.reload();
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await expect(page.getByLabel("24-hour clock")).not.toBeChecked(); // nothing was remembered
  });

  test("its place in the site: Time Tools and All Tools list it, search finds it by its names, and the converter is unchanged", async ({ page, go }) => {
    await go("time-tools.html");
    await expect(page.locator(".category-page-card", { hasText: "World Clock" })).toHaveCount(1);
    await expect(page.locator(".category-page-card")).toHaveCount(7);
    await go("tools.html");
    const time = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Time Tools")') });
    await expect(time.locator(".directory-section__count")).toHaveText("7 tools");
    for (const q of ["world clock", "city clocks", "multiple clocks"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator("main a", { hasText: "World Clock" }).first(), q).toBeVisible();
    }
    await go("tools.html?q=time%20zone%20converter");
    await expect(page.locator("main a", { hasText: "Time Zone Converter" }).first()).toBeVisible();
  });

  test("a zone path typed as the hint suggests finds the cities that keep that clock, the namesake first", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("America/Chicago");
    await expect(options(page).first()).toContainText("Chicago");
    await expect(options(page).first()).toContainText("United States");
    await search(page).fill("Asia/Tokyo");
    await expect(options(page).first()).toContainText("Tokyo");
    await search(page).fill("kolkata");
    await expect(options(page).first()).toContainText("Kolkata");
  });

  test("country names and aliases give the country's places, never a word found inside another: USA, UK, UAE, England, India", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("usa");
    await expect(page.locator(".wc-list__header")).toHaveText("United States · 29 time zones");
    await expect(options(page).first()).toContainText("New York");
    await expect(page.locator("#wc-list")).not.toContainText("Jerusalem");
    await expect(page.locator("#wc-list")).not.toContainText("Lusaka");
    await search(page).fill("UK");
    await expect(page.locator(".wc-list__header")).toHaveText("United Kingdom · 1 time zone");
    await expect(options(page).first()).toContainText("London");
    await expect(page.locator("#wc-list")).not.toContainText("Kyiv");
    for (const [typed, header] of [["UAE", "United Arab Emirates · 1 time zone"], ["England", "United Kingdom · 1 time zone"], ["Holland", "Netherlands · 1 time zone"], ["Czech Republic", "Czechia · 1 time zone"], ["india", "India · 1 time zone"]]) {
      await search(page).fill(typed);
      await expect(page.locator(".wc-list__header"), typed).toHaveText(header);
    }
    await expect(page.locator("#wc-list")).not.toContainText("Indiana");
    await expect(page.locator("#wc-list")).not.toContainText("Knox");
    // "la" is a short name for Los Angeles, not the country code for Laos
    await search(page).fill("la");
    await expect(options(page).first()).toContainText("Los Angeles");
  });

  test("a time-zone abbreviation is explained, not guessed", async ({ page, go }) => {
    await open(page, go);
    for (const word of ["IST", "EST", "pst"]) {
      await search(page).fill(word);
      await expect(options(page), word).toHaveCount(0);
      await expect(page.locator("#wc-list")).toContainText("time-zone abbreviation");
      await expect(page.locator("#wc-list")).toContainText("Search for a city or country instead");
    }
    await search(page).fill("istanbul");
    await expect(options(page).first()).toContainText("Istanbul");
  });

  test("a continent word lists that region's cities, without zone fragments", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("asia");
    await expect(page.locator(".wc-list__header")).toHaveText("Asia · 56 listed cities");
    await expect(page.locator("#wc-list")).not.toContainText("Asia/");
    await expect(page.locator("#wc-list")).not.toContainText("Time zone ·");
    await expect(options(page)).toHaveCount(11); // ten cities and "Show all 56"
    await search(page).fill("south america");
    await expect(page.locator(".wc-list__header")).toHaveText("South America · 13 listed cities");
    await search(page).fill("americas");
    await expect(page.locator(".wc-list__header")).toContainText("North America and South America · 53 listed cities");
  });

  test("results show each place's time and UTC offset now, and the weekday only where the date differs from yours", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("australia");
    await expect(page.locator(".wc-list__header")).toHaveText("Australia · 12 time zones");
    const row = (name) => options(page).filter({ hasText: name }).first();
    await expect(row("Sydney")).toContainText("Tue 1:20 AM");
    await expect(row("Sydney")).toContainText("UTC+11:00");
    await expect(row("Adelaide")).toContainText("Tue 12:50 AM");
    await expect(row("Adelaide")).toContainText("UTC+10:30");
    await expect(row("Darwin")).toContainText("Mon 11:50 PM".replace("Mon ", "")); // the same date as Kolkata: no weekday
    await expect(row("Darwin")).not.toContainText("Mon");
    await expect(row("Darwin")).toContainText("UTC+09:30");
    await search(page).fill("kathmandu");
    await expect(options(page).first()).toContainText("UTC+05:45");
    await page.getByLabel("24-hour clock").check();
    await search(page).fill("sydney");
    await expect(options(page).first()).toContainText("01:20");
  });

  test("Show all: the first ten, then every match; the keyboard reaches it and keeps the box focused", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("united states");
    await expect(options(page)).toHaveCount(11);
    await expect(options(page).last()).toHaveText("Show all 41");
    await page.keyboard.press("End");
    await expect(options(page).last()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(search(page)).toBeFocused();
    await expect(page.locator("#wc-list")).toBeVisible();
    await expect(options(page)).toHaveCount(41);
    await expect(options(page).filter({ hasText: "Boise" })).toContainText("Mountain - ID (south)");
    await expect(options(page).filter({ hasText: "Boise" })).toContainText("UTC−06:00");
    await expect(options(page).filter({ hasText: "Show all" })).toHaveCount(0);
    expect(await cards(page).count()).toBe(5);
    await options(page).filter({ hasText: "Boise" }).click();
    await expect(card(page, "Boise")).toBeVisible();
    await expect(card(page, "Boise").locator(".wc-card__sub")).toHaveText("America/Boise");
  });

  test("adding is confirmed where you are looking, marks the new clock, and never moves a keyboard user", async ({ page, go }) => {
    await open(page, go);
    await search(page).fill("sydney");
    await page.keyboard.press("ArrowDown");
    const before = await page.evaluate(() => scrollY);
    await page.keyboard.press("Enter");
    await expect(page.locator("#wc-search-hint")).toContainText("Added Sydney, Australia. 5 of 12 cities.");
    await expect(live(page)).toHaveText("Added Sydney, Australia. 5 of 12 cities.");
    await expect(card(page, "Sydney")).toHaveClass(/wc-card--new/);
    await expect(card(page, "Sydney").locator(".wc-card__fresh")).toHaveText("Just added");
    expect(await page.evaluate(() => scrollY)).toBe(before);
    await expect(search(page)).toBeFocused();
    // the next thing you do clears the mark and the confirmation
    await search(page).fill("t");
    await expect(page.locator("#wc-search-hint")).toContainText("Search well-known cities");
    await expect(card(page, "Sydney")).not.toHaveClass(/wc-card--new/);
    await expect(card(page, "Sydney").locator(".wc-card__fresh")).toBeHidden();
    // an existing clock is said so, in the same place
    await search(page).fill("london");
    await page.keyboard.press("Enter"); // the first match, London in the United Kingdom, is highlighted already
    await expect(page.locator("#wc-search-hint")).toHaveText("London, United Kingdom is already on your board.");
    await expect(cards(page)).toHaveCount(6);
  });

  test("on a phone, a touch or mouse choice scrolls the off-screen new clock into view; a 'Show clock' button does it on request and moves focus to the clock", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, go);
    await search(page).fill("tokyo");
    await options(page).first().click();
    await expect(card(page, "Tokyo")).toBeVisible();
    await expect.poll(async () => card(page, "Tokyo").evaluate((li) => { const r = li.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; })).toBe(true);
    // a keyboard choice with the clock off screen: no scroll, but the offer is there
    await page.evaluate(() => scrollTo(0, 0));
    await search(page).fill("seoul");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => scrollY)).toBe(0);
    const show = page.locator("#wc-search-hint").getByRole("button", { name: "Show clock" });
    await expect(show).toBeVisible();
    await show.click();
    await expect(card(page, "Seoul").locator(".wc-card__title")).toBeFocused();
    await expect.poll(async () => card(page, "Seoul").evaluate((li) => { const r = li.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; })).toBe(true);
  });

  test("the hand-off link meets the text contrast requirement and keeps the action colour", async ({ page, go }) => {
    await open(page, go);
    const result = await page.locator("#wc-plan").evaluate((a) => {
      const lum = (c) => { const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      let bg = "rgba(0, 0, 0, 0)"; for (let el = a; el && bg === "rgba(0, 0, 0, 0)"; el = el.parentElement) bg = getComputedStyle(el).backgroundColor;
      const fg = getComputedStyle(a).color;
      const [hi, lo] = [lum(fg), lum(bg === "rgba(0, 0, 0, 0)" ? "rgb(255, 255, 255)" : bg)].sort((x, y) => y - x);
      return { fg, ratio: (hi + 0.05) / (lo + 0.05) };
    });
    expect(result.fg).toBe("rgb(8, 127, 71)");
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    // the rest of the page's links keep the shared theme colour
    expect(await page.locator(".calculator-info a").first().evaluate((a) => getComputedStyle(a).color)).toBe("rgb(11, 159, 88)");
  });

  test("the search is warmed while the page is idle, so the first keystroke is quick; the country data follows only after that", async ({ page, go }) => {
    const requested = [];
    page.on("request", (r) => { if (/country-zones\.js/.test(r.url())) requested.push(r.url()); });
    await open(page, go);
    expect(requested).toEqual([]); // not with the first paint
    await page.clock.runFor(3000);
    await expect(panel(page)).toHaveAttribute("data-warm", "true");
    await expect.poll(() => requested.length).toBe(1);
    const ms = await page.evaluate(() => { const input = document.querySelector("#wc-search"); input.focus(); input.value = "l"; const a = performance.now(); input.dispatchEvent(new Event("input", { bubbles: true })); return performance.now() - a; });
    expect(ms, `the first keystroke took ${ms.toFixed(0)} ms`).toBeLessThan(60);
  });

  test("if the country data cannot load, the board, the city search and the listed countries still work, and Browse says so", async ({ page, go }) => {
    await page.route("**/country-zones.js", (route) => route.abort());
    await open(page, go);
    await page.clock.runFor(3000);
    await search(page).fill("sydney");
    await expect(options(page).first()).toContainText("Sydney");
    await search(page).fill("australia");
    await expect(page.locator(".wc-list__header")).toHaveText("Australia · 8 time zones (listed cities only)");
    await expect(options(page).filter({ hasText: "Eucla" })).toHaveCount(0);
    await search(page).fill("botswana");
    await expect(page.locator("#wc-list")).toContainText('No match for "botswana"');
    await page.keyboard.press("Escape"); // the open list covers the toggle on a phone
    await page.locator("#wc-browse-toggle").click();
    await expect(page.locator("#wc-country")).toBeDisabled();
    await expect(page.locator("#wc-country option").first()).toHaveText("Country list unavailable");
    await page.locator("#wc-region").selectOption("Africa"); // regions still work without the country data
    await expect(page.locator("#wc-browse-header")).toContainText("Africa · 24 listed cities");
  });
});
