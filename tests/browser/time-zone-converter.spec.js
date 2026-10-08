/**
 * Tool Pack 19: Time Zone Converter.
 *
 * Focused on what this change can break: the tool's own workflow and states (defaults, the zone picker, daylight-saving
 * gaps and repeats, swap, the zone board, meeting overlap, copy, the address), hostile address values, privacy, the
 * mobile layout, accessibility of the new surface, and its place in the site (Time Tools, All Tools, search, and its
 * absence from Developer Tools and the calculator pages). The rules are covered by tests/unit/time-zone.test.mjs and an
 * independent Python reference; here the page is checked.
 *
 * The browser is pinned to Asia/Kolkata and the clock to 2026-10-13 09:30 UTC (15:00 in India) so every default is known.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

test.use({ timezoneId: "Asia/Kolkata", locale: "en-US" });

const NOW = new Date("2026-10-13T09:30:00Z");

const panel = (page) => page.locator("#tz-panel");
const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);
const rows = (page) => page.locator("#tz-board .tz-row");
const live = (page) => page.locator("#tz-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go, query = "") {
  await page.clock.install({ time: NOW });
  await go(`tools/time-zone-converter/${query}`);
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

const option = (page, picker, zone) => page.locator(`#tz-${picker}-list .tz-list__option`, { hasText: new RegExp(`^${zone}$`) });

async function addZone(page, query, zone) {
  await page.locator("#tz-add-input").fill(query);
  await option(page, "add", zone).click();
}

async function setSource(page, query, zone) {
  await page.locator("#tz-source-input").fill(query);
  await option(page, "source", zone).click();
}

async function when(page, date, time) {
  await page.locator("#tz-date").fill(date);
  await page.locator("#tz-time").fill(time);
}

const rowText = async (page, index = 0) => ({
  time: (await rows(page).nth(index).locator(".tz-clock").innerText()).trim(),
  relation: (await rows(page).nth(index).locator(".tz-relation").innerText()).trim(),
  zone: (await rows(page).nth(index).locator(".tz-zone").innerText()).trim(),
  offset: (await rows(page).nth(index).locator(".tz-offset").innerText()).trim(),
  date: (await rows(page).nth(index).locator(".tz-date").innerText()).trim(),
});

test.describe("Time Zone Converter", () => {
  test("page, breadcrumb, labels and the defaults: now, read in the browser zone, nothing chosen to convert to", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Time Zone Converter");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Time Tools", "Time Zone Converter"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}time-tools.html`]);
    // the system clock (09:30 UTC) is shown as 15:00 India time, not read as UTC
    await expect(page.locator("#tz-date")).toHaveValue("2026-10-13");
    await expect(page.locator("#tz-time")).toHaveValue("15:00");
    await expect(page.locator("#tz-source-input")).toHaveValue(/^Asia\/(Kolkata|Calcutta)$/);
    await expect(page.locator("#tz-source-hint")).toContainText("Your time zone:");
    await expect(page.locator("#tz-local-zone")).toHaveText(/^Asia\/(Kolkata|Calcutta)$/);
    await expect(page.locator("main")).not.toContainText(/you are in /i);
    await expect(page.getByLabel("Date", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Time", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("From time zone", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Add a time zone", { exact: true })).toHaveCount(1);
    await state(page, "no-targets");
    await expect(page.locator("#tz-empty")).toHaveText("Choose a time zone to convert to.");
    await expect(rows(page)).toHaveCount(0);
    await expect(btn(page, "Swap")).toBeDisabled();
    await expect(page.locator("#tz-meeting")).not.toHaveAttribute("open", "");
    await expect(page.locator(".related-section, .report-issue")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("Calculated in your browser");
    await expect(page.locator("main")).not.toContainText(/\bbest\b|most accurate|AI-powered|real-time global/i);
    expectClean(watch);
  });

  test("the default is the same instant as the clock in another browser zone too (no double conversion)", async ({ page, go, browser }) => {
    const context = await browser.newContext({ timezoneId: "America/Los_Angeles", locale: "en-US" });
    const la = await context.newPage();
    await la.clock.install({ time: NOW });
    const base = page.url().startsWith("http") ? new URL(page.url()).origin : null;
    void base;
    await go("tools/time-zone-converter/");
    const url = page.url();
    await la.goto(url);
    await expect(la.locator("#tz-panel")).toHaveAttribute("data-ready", "true");
    await expect(la.locator("#tz-date")).toHaveValue("2026-10-13");
    await expect(la.locator("#tz-time")).toHaveValue("02:30"); // 09:30 UTC is 02:30 in Los Angeles (UTC-7)
    await expect(la.locator("#tz-source-input")).toHaveValue("America/Los_Angeles");
    await context.close();
  });

  test("India to London: 15:00 IST is 10:30 AM, the same day, with the offset in force", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "london", "Europe/London");
    await state(page, "ok");
    await expect(rows(page)).toHaveCount(1);
    expect(await rowText(page)).toEqual({ time: "10:30 AM", relation: "Same day", zone: "Europe/London", offset: "UTC+01:00", date: "Tuesday, 13 October 2026" });
    await expect(rows(page).first()).toHaveClass(/tz-row--primary/);
    await expect(live(page)).toContainText("10:30 AM in Europe/London, same day, UTC+01:00.");
  });

  test("India to New York: 5:30 AM, and the quick-add button adds a zone and then goes away", async ({ page, go }) => {
    await open(page, go);
    await page.getByRole("button", { name: "Add America/New_York", exact: true }).click();
    await state(page, "ok");
    const ny = await rowText(page);
    expect([ny.time, ny.relation, ny.offset.startsWith("UTC−04:00")]).toEqual(["5:30 AM", "Same day", true]);
    await expect(page.getByRole("button", { name: "Add America/New_York", exact: true })).toHaveCount(0);
    // an old and a new spelling of the browser's own zone are one zone: the quick button for Kolkata does not appear
    await expect(page.getByRole("button", { name: "Add Asia/Kolkata", exact: true })).toHaveCount(0);
  });

  test("a later date in the destination is told in words: Next day and Previous day", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "los angeles", "America/Los_Angeles");
    await addZone(page, "tokyo", "Asia/Tokyo");
    await when(page, "2026-10-13", "03:00");
    const la = await rowText(page, 0);
    const tokyo = await rowText(page, 1);
    expect([la.relation, la.date, la.time]).toEqual(["Previous day", "Monday, 12 October 2026", "2:30 PM"]);
    expect([tokyo.relation, tokyo.time]).toEqual(["Same day", "6:30 AM"]);
    await when(page, "2026-10-13", "22:00");
    expect((await rowText(page, 1)).relation).toBe("Next day");
  });

  test("Nepal's +05:45 and the 24-hour clock", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "kathmandu", "Asia/Kathmandu");
    const n = await rowText(page);
    expect([n.time, n.offset.startsWith("UTC+05:45")]).toEqual(["3:15 PM", true]);
    await page.locator("#tz-24h").check();
    expect((await rowText(page)).time).toBe("15:15");
    await page.locator("#tz-24h").uncheck();
    expect((await rowText(page)).time).toBe("3:15 PM");
  });

  test("the zone picker: case, underscores and spaces, the keyboard, an empty result, and nothing unsupported gets in", async ({ page, go }) => {
    await open(page, go);
    const input = page.locator("#tz-add-input");
    await expect(input).toHaveAttribute("role", "combobox");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await input.fill("NEW york");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#tz-add-list .tz-list__option").first()).toHaveText("America/New_York");
    await expect(page.locator("#tz-add-list .tz-list__option")).toHaveCount(await page.locator("#tz-add-list .tz-list__option").count());
    expect(await page.locator("#tz-add-list .tz-list__option").count()).toBeLessThanOrEqual(8);
    await expect(input).toHaveAttribute("aria-activedescendant", /option-0$/);
    await input.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await input.fill("kolkata");
    await input.press("Enter");
    await expect(input).toHaveValue(""); // chosen and cleared
    await state(page, "no-targets"); // Kolkata is the starting zone already
    await expect(page.locator("#tz-zone-message")).toContainText("already in the list");
    await input.fill("lord howe");
    await input.press("ArrowDown");
    await input.press("Enter");
    await state(page, "ok");
    expect((await rowText(page)).zone).toBe("Australia/Lord_Howe");
    await input.fill("zzzzzz");
    await expect(page.locator("#tz-add-list")).toContainText("No time zone matches that.");
    await input.press("Enter");
    await expect(rows(page)).toHaveCount(1);
    // the whole zone name is typed, with no list: Enter accepts it only if the browser supports it
    await input.fill("Mars/Olympus");
    await input.press("Enter");
    await expect(rows(page)).toHaveCount(1);
    await input.fill("Pacific/Auckland");
    await input.press("Escape");
    await input.press("Enter");
    await expect(rows(page)).toHaveCount(2);
  });

  test("a time that does not exist (US spring forward) is explained and nothing is converted or moved", async ({ page, go }) => {
    await open(page, go);
    await setSource(page, "new york", "America/New_York");
    await addZone(page, "london", "Europe/London");
    await when(page, "2026-03-08", "02:30");
    await state(page, "gap");
    await expect(page.locator("#tz-problem")).toBeVisible();
    await expect(page.locator("#tz-problem-title")).toHaveText("This local time does not exist in this time zone because of a daylight-saving transition.");
    await expect(page.locator("#tz-problem-detail")).toContainText("On 2026-03-08 the clocks in America/New_York went from 1:59 AM (UTC−05:00) to 3:00 AM (UTC−04:00).");
    await expect(page.locator("#tz-problem-detail")).toContainText("The nearest times that exist are 1:59 AM and 3:00 AM.");
    await expect(rows(page)).toHaveCount(0);
    await expect(page.locator("#tz-time")).toHaveValue("02:30"); // never silently moved
    await expect(live(page)).toContainText("does not exist");
    await when(page, "2026-03-08", "03:00");
    await state(page, "ok");
    await expect(page.locator("#tz-problem")).toBeHidden();
  });

  test("a repeated time (US fall back) shows both and requires a choice; the choice can be changed", async ({ page, go }) => {
    await open(page, go);
    await setSource(page, "new york", "America/New_York");
    await page.getByRole("button", { name: "Add UTC", exact: true }).click();
    await when(page, "2026-11-01", "01:30");
    await state(page, "ambiguous");
    await expect(rows(page)).toHaveCount(0); // nothing is chosen for the visitor
    await expect(page.locator("#tz-problem-title")).toHaveText("This time happens twice.");
    const group = page.locator("#tz-choice");
    await expect(group).toBeVisible();
    await expect(page.getByRole("radio")).toHaveCount(2);
    await expect(page.locator("#tz-choice label").nth(0)).toContainText("Earlier occurrence: 1:30 AM UTC−04:00");
    await expect(page.locator("#tz-choice label").nth(1)).toContainText("Later occurrence: 1:30 AM UTC−05:00");
    expect(await page.getByRole("radio").evaluateAll((r) => r.map((x) => x.checked))).toEqual([false, false]);
    await page.getByRole("radio").nth(0).check();
    await state(page, "ok");
    expect((await rowText(page)).time).toBe("5:30 AM");
    expect(new URL(page.url()).searchParams.get("c")).toBe("earlier");
    await expect(page.getByRole("radio")).toHaveCount(2); // still there, so it can be changed
    await page.getByRole("radio").nth(1).check();
    expect((await rowText(page)).time).toBe("6:30 AM");
    expect(new URL(page.url()).searchParams.get("c")).toBe("later");
    // editing the time forgets the choice
    await page.locator("#tz-time").fill("02:30");
    await state(page, "ok");
    await expect(page.getByRole("radio")).toHaveCount(0);
  });

  test("Lord Howe's 30-minute shift: the gap and the repeat", async ({ page, go }) => {
    await open(page, go);
    await setSource(page, "lord howe", "Australia/Lord_Howe");
    await when(page, "2026-10-04", "02:15");
    await state(page, "gap");
    await expect(page.locator("#tz-problem-detail")).toContainText("went from 1:59 AM (UTC+10:30) to 2:30 AM (UTC+11:00)");
    await when(page, "2026-04-05", "01:45");
    await state(page, "ambiguous");
    await expect(page.locator("#tz-choice label").nth(0)).toContainText("UTC+11:00");
    await expect(page.locator("#tz-choice label").nth(1)).toContainText("UTC+10:30");
  });

  test("changing the source zone keeps the typed reading and re-reads it in the new zone", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "utc", "UTC");
    expect((await rowText(page)).time).toBe("9:30 AM");
    await setSource(page, "london", "Europe/London");
    await expect(page.locator("#tz-time")).toHaveValue("15:00");
    expect((await rowText(page)).time).toBe("2:00 PM"); // 15:00 BST is 14:00 UTC
  });

  test("swap keeps the instant: the new source reads the old destination's local time", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "london", "Europe/London");
    await addZone(page, "tokyo", "Asia/Tokyo");
    await btn(page, "Swap").click();
    await expect(page.locator("#tz-source-input")).toHaveValue("Europe/London");
    await expect(page.locator("#tz-time")).toHaveValue("10:30");
    await expect(page.locator("#tz-date")).toHaveValue("2026-10-13");
    expect((await rowText(page, 0)).zone).toMatch(/^Asia\/(Kolkata|Calcutta)$/);
    expect((await rowText(page, 0)).time).toBe("3:00 PM");
    expect((await rowText(page, 1)).time).toBe("6:30 PM"); // Tokyo is unchanged: same instant
    await expect(page.locator("#tz-zone-message")).toContainText("same moment");
    await btn(page, "Swap").click();
    await expect(page.locator("#tz-time")).toHaveValue("15:00");
    // across a date change
    await when(page, "2026-10-13", "03:00");
    await page.locator("#tz-add-input").fill("los angeles");
    await option(page, "add", "America/Los_Angeles").click();
    await page.locator("#tz-board .tz-remove").first().click(); // London goes; Tokyo then LA remain
    await expect(page.getByRole("button", { name: /^Remove / })).toHaveCount(2);
  });

  test("the zone board: up to six zones in all, no duplicates, remove buttons are named and nothing else changes", async ({ page, go }) => {
    await open(page, go);
    for (const [q, z] of [["london", "Europe/London"], ["new york", "America/New_York"], ["tokyo", "Asia/Tokyo"], ["sydney", "Australia/Sydney"], ["auckland", "Pacific/Auckland"]]) await addZone(page, q, z);
    await expect(rows(page)).toHaveCount(5);
    await page.locator("#tz-add-input").fill("honolulu");
    await option(page, "add", "Pacific/Honolulu").click();
    await expect(rows(page)).toHaveCount(5);
    await expect(page.locator("#tz-zone-message")).toContainText("up to 6 time zones");
    await addZone(page, "london", "Europe/London");
    await expect(page.locator("#tz-zone-message")).toContainText("already in the list");
    await expect(rows(page)).toHaveCount(5);
    await expect(page.getByRole("button", { name: "Remove Asia/Tokyo", exact: true })).toBeVisible();
    const before = await page.locator("#tz-board .tz-clock").allInnerTexts();
    await page.getByRole("button", { name: "Remove Asia/Tokyo", exact: true }).click();
    await expect(rows(page)).toHaveCount(4);
    const after = await page.locator("#tz-board .tz-clock").allInnerTexts();
    expect(after).toEqual(before.filter((_, i) => i !== 2));
    await expect(page.locator("#tz-time")).toHaveValue("15:00"); // the source reading is untouched
    await expect(page.locator("#tz-zone-message")).toContainText("Asia/Tokyo removed.");
    await page.locator("#tz-add-input").fill("honolulu");
    await option(page, "add", "Pacific/Honolulu").click(); // there is room again
    await expect(rows(page)).toHaveCount(5);
  });

  test("the date line: a zone two calendar days away is told as '2 days later'", async ({ page, go }) => {
    await open(page, go);
    await setSource(page, "pago", "Pacific/Pago_Pago");
    await addZone(page, "kiritimati", "Pacific/Kiritimati");
    await when(page, "2026-06-15", "23:30");
    const k = await rowText(page);
    expect([k.relation, k.date, k.time]).toEqual(["2 days later", "Wednesday, 17 June 2026", "12:30 AM"]);
  });

  test("copy times and copy link: plain text with the chosen clock, and a link that carries only date, time and zones", async ({ page, go }) => {
    await open(page, go, "?d=2026-10-13&t=15:00&from=Asia/Kolkata&to=Europe/London,America/New_York");
    await page.evaluate(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: (t) => { window.__copied.push(t); return Promise.resolve(); } }, configurable: true });
    });
    await btn(page, "Copy times").click();
    await expect(live(page)).toHaveText("Times copied.");
    const times = (await page.evaluate(() => window.__copied)).pop();
    expect(times).toMatch(/^Time conversion, 13 Oct 2026\n3:00 PM Asia\/\w+ UTC\+05:30\n10:30 AM Europe\/London UTC\+01:00\n5:30 AM America\/New_York UTC-04:00\n$/);
    await page.locator("#tz-24h").check();
    await btn(page, "Copy times").click();
    expect((await page.evaluate(() => window.__copied)).pop().split("\n")[2]).toBe("10:30 Europe/London UTC+01:00");
    await btn(page, "Copy link").click();
    const link = new URL((await page.evaluate(() => window.__copied)).pop());
    expect(link.search).toBe("?d=2026-10-13&t=15%3A00&from=Asia/Kolkata&to=Europe/London,America/New_York");
    // a failed copy says so
    await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("no")) }, configurable: true }); document.execCommand = () => false; });
    await btn(page, "Copy times").click();
    await expect(live(page)).toHaveText("It could not be copied automatically.");
  });

  test("the address: valid values are used, kept in step without history entries, and the canonical stays clean", async ({ page, go }) => {
    await open(page, go, "?d=2026-12-24&t=18:45&from=Europe/London&to=Asia/Kolkata,Australia/Sydney");
    await expect(page.locator("#tz-date")).toHaveValue("2026-12-24");
    await expect(page.locator("#tz-time")).toHaveValue("18:45");
    await expect(page.locator("#tz-source-input")).toHaveValue("Europe/London");
    await expect(rows(page)).toHaveCount(2);
    expect((await rowText(page, 0)).time).toBe("12:15 AM"); // 18:45 GMT is 00:15 the next day in India
    expect((await rowText(page, 0)).relation).toBe("Next day");
    const history = await page.evaluate(() => history.length);
    await page.locator("#tz-time").fill("19:00");
    await page.getByRole("button", { name: /^Remove Australia\/Sydney$/ }).click();
    expect(new URL(page.url()).search).toBe("?d=2026-12-24&t=19%3A00&from=Europe/London&to=Asia/Kolkata");
    expect(await page.evaluate(() => history.length)).toBe(history);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe("https://toolzenhub.in/tools/time-zone-converter/");
  });

  test("security: hostile or invalid address values are ignored and never rendered as HTML", async ({ page, go, watch }) => {
    await page.addInitScript(() => { window.__xss = 0; });
    const hostile = "?d=2026-02-31&t=99:99&from=%3Cscript%3Ewindow.__xss%3D1%3C%2Fscript%3E&to=%22%3E%3Cimg%20src%3Dx%20onerror%3Dwindow.__xss%3D2%3E,Mars/Olympus,%2B05%3A30&c=%3Cb%3E";
    await open(page, go, hostile);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__xss)).toBe(0);
    await expect(page.locator("#tz-date")).toHaveValue("2026-10-13"); // defaults
    await expect(page.locator("#tz-time")).toHaveValue("15:00");
    await expect(page.locator("#tz-source-input")).toHaveValue(/^Asia\/(Kolkata|Calcutta)$/);
    await expect(rows(page)).toHaveCount(0);
    await expect(page.locator("#tz-panel img, #tz-panel script, #tz-panel b")).toHaveCount(0);
    // typed text in a picker is text, too
    await page.locator("#tz-add-input").fill('<img src=x onerror="window.__xss=3">');
    await expect(page.locator("#tz-add-list")).toContainText("No time zone matches that.");
    await expect(page.locator("#tz-add-list img")).toHaveCount(0);
    expect(await page.evaluate(() => window.__xss)).toBe(0);
    expectClean(watch);
  });

  test("privacy: no request carries the data, nothing is stored, and the location is never asked for", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    await page.addInitScript(() => {
      window.__geo = 0;
      if (navigator.geolocation) { navigator.geolocation.getCurrentPosition = () => { window.__geo++; }; navigator.geolocation.watchPosition = () => { window.__geo++; return 0; }; }
    });
    await open(page, go);
    await addZone(page, "london", "Europe/London");
    await btn(page, "Swap").click();
    await btn(page, "Use current time").click();
    await page.locator("#tz-meeting > summary").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie, window.__geo])).toEqual([0, 0, "", 0]);
  });

  test("use current time takes the current minute once and keeps no running clock", async ({ page, go }) => {
    await open(page, go);
    await when(page, "2026-01-01", "00:00");
    await btn(page, "Use current time").click();
    await expect(page.locator("#tz-date")).toHaveValue("2026-10-13");
    await expect(page.locator("#tz-time")).toHaveValue(/^15:0[0-2]$/);
    const first = await page.locator("#tz-time").inputValue();
    await page.clock.fastForward(125000);
    await expect(page.locator("#tz-time")).toHaveValue(first); // nothing ticks
  });
});

test.describe("Time Zone Converter: meeting overlap", () => {
  const dates = async (page, text) => expect(page.locator("#tz-meeting-date")).toHaveText(text);

  test("a shared window is listed in every zone's own time, for the meeting length chosen", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "london", "Europe/London");
    await page.locator("#tz-meeting > summary").click();
    await expect(page.locator("#tz-hours .tz-hours__row")).toHaveCount(2);
    await dates(page, /^Date: 2026-10-13 in Asia\/(Kolkata|Calcutta)$/);
    const window = page.locator(".tz-window").first();
    await expect(page.locator(".tz-window")).toHaveCount(1);
    await expect(window.locator(".tz-window__head strong")).toHaveText("Start between 1:30 PM and 4:30 PM");
    await expect(window.locator(".tz-window__zone").nth(0).locator(".tz-window__times")).toHaveText("1:30 PM to 5:00 PM");
    await expect(window.locator(".tz-window__zone").nth(1).locator(".tz-window__times")).toHaveText("9:00 AM to 12:30 PM");
    await page.locator("#tz-duration").selectOption("90");
    await expect(page.locator(".tz-window .tz-window__head strong")).toHaveText("Start between 1:30 PM and 3:30 PM");
    await expect(page.locator("#tz-overlap")).toContainText("Times inside everyone's preferred hours");
    await expect(page.locator("#tz-overlap")).not.toContainText(/best/i);
  });

  test("no overlap is said honestly, with each zone's hours in the starting zone's time; adding hours or moving the date changes it", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "new york", "America/New_York");
    await page.locator("#tz-meeting > summary").click();
    await expect(page.locator(".tz-none")).toHaveText("No time falls inside everyone's preferred hours on this date.");
    await expect(page.locator(".tz-preferred__item")).toHaveCount(2);
    await expect(page.locator(".tz-preferred__item").nth(1)).toContainText("12:00 AM to 2:30 AM, 6:30 PM to 12:00 AM (next day)");
    await expect(page.locator(".tz-window")).toHaveCount(0);
    // widen New York's hours: now there is a shared window
    const ny = page.locator('.tz-hours__row[data-zone="America/New_York"]');
    await ny.locator("input").nth(0).fill("06:00");
    await ny.locator("input").nth(1).fill("23:45");
    await expect(page.locator(".tz-window")).toHaveCount(1);
    await expect(page.locator(".tz-none")).toHaveCount(0);
    await expect(page.locator(".tz-window .tz-window__head")).toContainText("Asia/");
  });

  test("an invalid range is explained (overnight ranges are not supported), and the date buttons move the shared date", async ({ page, go }) => {
    await open(page, go);
    await addZone(page, "london", "Europe/London");
    await page.locator("#tz-meeting > summary").click();
    const india = page.locator(".tz-hours__row").first();
    await india.locator("input").nth(0).fill("22:00");
    await india.locator("input").nth(1).fill("02:00");
    await expect(page.locator(".tz-issues")).toContainText("must start before they end on the same day. Ranges that cross midnight are not supported");
    await india.locator("input").nth(0).fill("09:00");
    await india.locator("input").nth(1).fill("17:00");
    await expect(page.locator(".tz-window")).toHaveCount(1);
    await btn(page, "Next day").click();
    await expect(page.locator("#tz-date")).toHaveValue("2026-10-14");
    await dates(page, /^Date: 2026-10-14 in/);
    await btn(page, "Previous day").click();
    await btn(page, "Previous day").click();
    await expect(page.locator("#tz-date")).toHaveValue("2026-10-12");
  });

  test("it depends on the date: London and New York share a different number of hours on 4 March and on 10 March", async ({ page, go }) => {
    await open(page, go, "?d=2026-03-04&t=12:00&from=Europe/London&to=America/New_York");
    await page.locator("#tz-meeting > summary").click();
    await expect(page.locator(".tz-window .tz-window__head strong")).toHaveText("Start between 2:00 PM and 4:30 PM");
    await page.locator("#tz-date").fill("2026-03-10");
    await expect(page.locator(".tz-window .tz-window__head strong")).toHaveText("Start between 1:00 PM and 4:30 PM");
  });

  test("one zone only asks for another; copy meeting times lists the earliest start in every zone", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#tz-meeting > summary").click();
    await expect(page.locator("#tz-overlap")).toContainText("Add at least one more time zone");
    await addZone(page, "london", "Europe/London");
    await page.evaluate(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: (t) => { window.__copied.push(t); return Promise.resolve(); } }, configurable: true });
    });
    await btn(page, "Copy meeting times").click();
    await expect(live(page)).toHaveText("Meeting times copied.");
    const text = (await page.evaluate(() => window.__copied)).pop();
    expect(text).toMatch(/^Meeting time, 13 Oct 2026 \(earliest start, 30 minutes\)\n1:30 PM Asia\/\w+ UTC\+05:30\n9:00 AM Europe\/London UTC\+01:00\n$/);
  });
});

test.describe("Time Zone Converter: accessibility and layout", () => {
  test("semantics: labelled controls, a combobox, named buttons, one polite status, headings in order, focus rings", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(page.locator("#tz-zone-message")).toHaveAttribute("aria-live", "polite");
    for (const id of ["source", "add"]) {
      const input = page.locator(`#tz-${id}-input`);
      await expect(input).toHaveAttribute("aria-controls", `tz-${id}-list`);
      await expect(input).toHaveAttribute("aria-autocomplete", "list");
      await expect(page.locator(`#tz-${id}-list`)).toHaveAttribute("role", "listbox");
    }
    await addZone(page, "london", "Europe/London");
    await expect(page.getByRole("button", { name: "Remove Europe/London", exact: true })).toBeVisible();
    await expect(page.locator("#tz-board")).toHaveAttribute("aria-label", "Converted times");
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    for (const target of [page.locator("#tz-date"), page.locator("#tz-time"), page.locator("#tz-source-input"), btn(page, "Use current time"), btn(page, "Swap"), page.locator("#tz-add-input")]) {
      await target.focus();
      expect(await outline(target)).toBeGreaterThanOrEqual(2);
    }
    // the day relation is text, not colour
    await expect(page.locator(".tz-relation").first()).toHaveText(/Same day|Next day|Previous day|days (later|earlier)/);
    await page.locator("#tz-meeting > summary").click();
    for (const input of await page.locator(".tz-hours input").all()) expect(await input.getAttribute("aria-label")).toMatch(/preferred hours (start|end)$/);
    await expect(page.getByLabel("Meeting length")).toHaveCount(1);
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: everything stacks, no state widens the page, controls are tappable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go, "?to=Europe/London,America/New_York,Asia/Kathmandu,Pacific/Kiritimati,Australia/Lord_Howe");
      await expectNoHorizontalOverflow(page);
      await page.locator("#tz-meeting > summary").click();
      await expectNoHorizontalOverflow(page);
      for (const name of ["Use current time", "Swap", "Copy times", "Copy link", "Next day", "Previous day"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const remove of await page.locator(".tz-remove").all()) {
        const box = await remove.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      for (const input of ["#tz-date", "#tz-time", "#tz-source-input", "#tz-add-input"]) expect(await page.locator(input).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
      // the picker list opens inside the screen
      await page.locator("#tz-add-input").fill("a");
      const list = await page.locator("#tz-add-list").boundingBox();
      expect(list.x).toBeGreaterThanOrEqual(0);
      expect(list.x + list.width).toBeLessThanOrEqual(width);
      await expectNoHorizontalOverflow(page);
      await page.locator("#tz-add-input").press("Escape");
      // the problem states
      await setSource(page, "new york", "America/New_York");
      await when(page, "2026-03-08", "02:30");
      await state(page, "gap");
      await expectNoHorizontalOverflow(page);
      await when(page, "2026-11-01", "01:30");
      await state(page, "ambiguous");
      await expectNoHorizontalOverflow(page);
      const rowBox = await page.locator("#tz-choice label").first().boundingBox();
      expect(rowBox.height).toBeGreaterThanOrEqual(44);
    });
  }

  test("desktop: date, time and zone sit in one row, and rows show the time beside the details", async ({ page, go }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, go, "?to=Europe/London");
    const a = await page.locator("#tz-date").boundingBox();
    const b = await page.locator("#tz-time").boundingBox();
    const c = await page.locator("#tz-source-input").boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(Math.abs(a.y - c.y)).toBeLessThan(2);
    const clock = await rows(page).first().locator(".tz-clock").boundingBox();
    const meta = await rows(page).first().locator(".tz-date").boundingBox();
    expect(meta.x).toBeGreaterThan(clock.x + clock.width - 1);
  });
});

test.describe("Time Zone Converter in the site", () => {
  test("Time Tools lists it as one of its tools, flat, and Developer Tools does not", async ({ page, go }) => {
    await go("time-tools.html");
    await expect(page.locator(`a[href$="tools/time-zone-converter/"]`)).toHaveCount(1);
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(6);
    await expect(page.locator("main")).not.toContainText(/coming soon/i);
    await expect(page.locator("main")).toContainText("Time Zone Converter");
    await go("developer-tools.html");
    await expect(page.locator('a[href$="tools/time-zone-converter/"]')).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/time zone converter/i);
  });

  test("All Tools: Time Tools has 6 tools and Developer Tools still has 4", async ({ page, go }) => {
    await go("tools.html");
    const time = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Time Tools")') });
    await expect(time.locator(".directory-section__count")).toHaveText("6 tools");
    await expect(time.locator('a[href$="tools/time-zone-converter/"]')).toHaveCount(1);
    const dev = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Developer Tools")') });
    await expect(dev.locator(".directory-section__count")).toHaveText("4 tools");
    await expect(dev.locator('a[href$="tools/time-zone-converter/"]')).toHaveCount(0);
  });

  test("Home to the tool by clicking: Home, All Tools, Time Tools, Time Zone Converter", async ({ page, go, siteRoot }) => {
    await go("");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Time Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}time-tools.html`);
    await page.locator('a[href$="tools/time-zone-converter/"]').first().click();
    await expect(page.locator("h1")).toHaveText("Time Zone Converter");
  });

  test("global search: the zone queries lead with the tool, and every other tool keeps its queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["time zone converter", "timezone converter", "convert time zones", "world time converter", "meeting time converter", "meeting overlap", "time difference between countries", "Time Zone Converter"]) await expect(await first(q), q).toContainText("Time Zone Converter");
    await expect(await first("time zone converter"), "meta").toContainText("Time Tools");
    await expect(await first("countdown timer")).toContainText("Countdown Timer");
    await expect(await first("stopwatch")).toContainText("Stopwatch");
    await expect(await first("date calculator")).toContainText("Date Calculator");
    await expect(await first("unix timestamp")).toContainText("Unix Timestamp Converter");
    await expect(await first("text diff")).toContainText("Text Diff / Compare");
    await expect(await first("json")).toContainText("JSON Formatter & Validator");
    await expect(await first("income tax")).toContainText("Old vs New Tax Regime Calculator");
    await expect(await first("emi")).toContainText("EMI Calculator");
  });

  test("calculator, loan and category searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("time zone");
    await expect(page.locator("main")).not.toContainText("Time Zone Converter");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("time zone converter");
    await expect(page.locator("#calculators-grid")).not.toContainText("Time Zone Converter");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("meeting");
    await expect(page.locator("main")).not.toContainText("Time Zone Converter");
  });

  test("it links the Unix Timestamp Converter, which is not changed and does not name it; other Time Tools are not related to it", async ({ page, go }) => {
    await go("tools/time-zone-converter/");
    await expect(page.locator('main a[href$="tools/unix-timestamp-converter/"]')).toHaveCount(1);
    await go("tools/unix-timestamp-converter/");
    await expect(page.locator("main")).not.toContainText(/time zone converter/i);
    await go("tools/countdown-timer/");
    await expect(page.locator("main")).not.toContainText(/time zone converter/i);
  });

  test("two existing Time Tools still load after the shared catalog change", async ({ page, go, watch }) => {
    await go("tools/countdown-timer/");
    await expect(page.locator("h1")).toHaveText("Countdown Timer");
    await go("tools/date-calculator/");
    await expect(page.locator("h1")).toHaveText("Date Calculator");
    await go("tools/unix-timestamp-converter/");
    await expect(page.locator("h1")).toHaveText("Unix Timestamp Converter");
    expectClean(watch);
  });
});
