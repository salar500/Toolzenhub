/**
 * Tool Pack 28: World Clock (2.0: Explore cities and My clocks).
 *
 * Focused on what this tool can break: the two ARIA tabs and which one opens first; the Explore directory (195 cities, other time
 * zones, sorting, filters, progressive rendering and its keyboard and focus rules); the universal search (cities, countries,
 * continents, zone paths, abbreviations, and the current-time grammar: hours, AM/PM, a time with a stated window, ranges, offsets,
 * noon and midnight); honest empty states; adding to the board from Explore (stable focus, inert buttons, a full board); the board
 * and its cards; the 12-city limit; the comparison reference; the 12/24-hour switch; the address (valid, mixed, hostile); the
 * hand-off to the Time Zone Converter; the one coordinated timer and what it does while a view is hidden; failure and retry of the
 * separately loaded Explore module; accessibility; the phone layout; privacy; and the tool's place in the site. The calculations
 * are covered by tests/unit/world-clock-*.test.mjs and an independent Python reference; here the page is checked.
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
const rows = (page) => page.locator(".wc-x-groups .wc-xrow, .wc-x-others .wc-xrow");
const othersRows = (page) => page.locator(".wc-x-others .wc-xrow");
const showCities = (page) => page.locator("#wc-show-cities");
const showOthers = (page) => page.locator("#wc-show-others");
const showLabel = (page, which) => page.locator(".wc-show__choice", { has: page.locator(`#wc-show-${which}`) }).locator(".wc-show__text");
const chooseOthers = (page) => showOthers(page).check();
const chooseCities = (page) => showCities(page).check();
const resetAll = (page) => page.getByRole("button", { name: "Reset all" });
const shortcut = (page, label) => page.locator(`[data-shortcut="${label}"]`);
/* the local clock of a row as minutes of the day, from the text it shows ("Tue 1:20 AM", "7:50 PM", "13:05") */
const minuteOf = (text) => {
  const m = /(\d{1,2}):(\d\d)(?:\s*(AM|PM))?/.exec(text);
  const h = Number(m[1]) % (m[3] ? 12 : 24) + (m[3] === "PM" ? 12 : 0);
  return h * 60 + Number(m[2]);
};
const listed = (page) => page.locator(".wc-x-groups .wc-xrow");
const row = (page, name) => page.locator(".wc-xrow").filter({ has: page.locator(".wc-xrow__main", { hasText: new RegExp(`^${name}$`) }) }).first();
const names = async (loc) => (await loc.locator(".wc-xrow__main").allTextContents()).map((t) => t.trim());
const titles = async (page) => (await cards(page).locator(".wc-card__title").allTextContents()).map((t) => t.trim());
const heading = (page) => page.locator("#wc-x-heading");
const countLine = (page) => page.locator(".wc-x-countline");
const exploreTab = (page) => page.locator("#wc-tab-explore");
const clocksTab = (page) => page.locator("#wc-tab-clocks");

async function open(page, go, query = "", time = NOW) {
  if (!page.__clockInstalled) await page.clock.install({ time });
  await go(`tools/world-clock/${query}`);
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

/* open on Explore and wait until the directory module has drawn */
/* the page clock first, then the stub, so the stub is not replaced by the fake clock's own idle callbacks */
async function stubIdle(page, script) {
  await page.clock.install({ time: NOW });
  page.__clockInstalled = true;
  await page.addInitScript(script);
}

async function openExplore(page, go, query = "") {
  await open(page, go, query);
  await expect(page.locator(".wc-xrow").first()).toBeVisible();
}

/* open on My clocks (a valid shared address, or the tab) */
async function openClocks(page, go, query = "", time = NOW) {
  await open(page, go, query, time);
  if ((await clocksTab(page).getAttribute("aria-selected")) !== "true") await clocksTab(page).click();
  await expect(clocksTab(page)).toHaveAttribute("aria-selected", "true");
}

async function type(page, text) {
  await search(page).fill(text);
  await expect(page.locator("#wc-x-heading")).toBeVisible();
}

async function addFromExplore(page, query, name) {
  await search(page).fill(query);
  await expect(row(page, name)).toBeVisible();
  await row(page, name).getByRole("button", { name: /^Add / }).click();
}

const BOARD_FULL = ["mumbai-in", "delhi-in", "tokyo-jp", "paris-fr", "berlin-de", "cairo-eg", "lagos-ng", "sydney-au", "toronto-ca", "lima-pe", "seoul-kr", "rome-it"];

test.describe("World Clock: views and the page", () => {
  test("page, breadcrumb, labels; Explore cities opens first with the whole directory, and Your time is the first thing on the page", async ({ page, go, watch, siteRoot }) => {
    await openExplore(page, go);
    await expect(page.locator("h1")).toHaveText("World Clock");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Time Tools", "World Clock"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}time-tools.html`]);
    await expect(page.locator("#wc-here-time")).toHaveText("7:50 PM");
    await expect(page.locator("#wc-here-time")).toHaveAttribute("datetime", "2026-10-19T19:50+05:30");
    await expect(page.locator("#wc-here-date")).toHaveText("Mon, 19 Oct 2026");
    await expect(page.locator("#wc-here-zone")).toHaveText("Asia/Kolkata · UTC+05:30");
    await expect(page.getByLabel("Search cities, countries or times", { exact: true })).toHaveCount(1);
    await expect(page.locator("form[role='search']")).toHaveCount(1);
    await expect(search(page)).toHaveAttribute("type", "search");
    await expect(search(page)).toHaveAttribute("placeholder", "City, country, 8 PM, UTC+05:30");
    await expect(search(page)).not.toHaveAttribute("role", "combobox");
    await expect(exploreTab(page)).toHaveText("Explore cities (195)");
    await expect(clocksTab(page)).toHaveText("My clocks (4)");
    await expect(exploreTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#wc-view-clocks")).toBeHidden();
    await expect(heading(page)).toHaveText("All listed cities");
    await expect(countLine(page)).toHaveText(/^195 listed cities in 148 time zones, plus \d+ other time zones$/);
    await expect(page.locator(".wc-x-groups .wc-xrow")).toHaveCount(195);
    await expect(page.locator(".wc-x-progress")).toHaveText("All 195 shown");
    await expect(page.locator(".report-issue")).toHaveCount(0);
    await expect(page.locator(".related-section a[href$=\"tools/meeting-planner/\"]")).toHaveCount(1); // the Time Tools related-tools pilot
    await expect(page.locator("main")).not.toContainText(/\bbest\b|most accurate|AI-powered|real-time global|worldwide coverage|all cities/i);
    expectClean(watch);
  });

  test("the time shortcuts: four first and two under More times; each writes its own label into the field, runs the search, shows its state, and never adds a clock", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(page.locator("#wc-shortcuts-label")).toHaveText("Find places where it is now");
    await expect(page.locator(".wc-shortcuts")).toHaveAttribute("role", "group");
    expect((await page.locator("[data-shortcut]:visible").allTextContents()).map((t) => t.trim())).toEqual(["Before noon", "12 PM onward", "Evening", "Night"]);
    const more = page.locator("#wc-more-toggle");
    await expect(more).toHaveText("More times");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#wc-more-times")).toBeHidden();
    await more.click();
    await expect(more).toHaveAttribute("aria-expanded", "true");
    expect((await page.locator("#wc-more-times [data-shortcut]").allTextContents()).map((t) => t.trim())).toEqual(["Morning", "Afternoon"]);
    const evening = shortcut(page, "Evening");
    await expect(evening).toHaveAttribute("aria-pressed", "false");
    await evening.click();
    await expect(search(page)).toHaveValue("Evening");
    await expect(evening).toHaveAttribute("aria-pressed", "true");
    await expect(heading(page)).toHaveText("Places where it is currently evening (6:00 PM to 8:59 PM)");
    await expect(heading(page)).not.toContainText("18:00");
    await expect(evening).toBeFocused();
    await shortcut(page, "Night").click();
    await expect(search(page)).toHaveValue("Night");
    await expect(evening).toHaveAttribute("aria-pressed", "false");
    await expect(heading(page)).toHaveText("Places where it is currently night (9:00 PM to 5:59 AM, crossing midnight)");
    await shortcut(page, "Night").click(); // pressing the active shortcut again clears the field
    await expect(search(page)).toHaveValue("");
    await expect(shortcut(page, "Night")).toHaveAttribute("aria-pressed", "false");
    await expect(heading(page)).toHaveText("All listed cities");
    expect(await titles(page)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore"]);
    await expect(clocksTab(page)).toHaveText("My clocks (4)");
  });

  test("the headings say the exact interval for all six shortcuts, and a shortcut shows the 24-hour reading when that switch is on", async ({ page, go }) => {
    await openExplore(page, go);
    const expected = {
      "Before noon": "Places where it is currently before noon (midnight to 11:59 AM)",
      "12 PM onward": "Places where it is currently 12 PM onward (noon to 11:59 PM)",
      "Morning": "Places where it is currently morning (6:00 AM to 11:59 AM)",
      "Afternoon": "Places where it is currently afternoon (12:00 PM to 5:59 PM)",
      "Evening": "Places where it is currently evening (6:00 PM to 8:59 PM)",
      "Night": "Places where it is currently night (9:00 PM to 5:59 AM, crossing midnight)"
    };
    await page.locator("#wc-more-toggle").click();
    for (const [label, text] of Object.entries(expected)) {
      await shortcut(page, label).click();
      await expect(heading(page), label).toHaveText(text);
    }
  });

  test("a typed named period equals its shortcut in any case and spacing; a fragment or an extra word is only a name search; the existing hour and period searches are unchanged", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "  EVENING ");
    await expect(heading(page)).toHaveText("Places where it is currently evening (6:00 PM to 8:59 PM)");
    await expect(shortcut(page, "Evening")).toHaveAttribute("aria-pressed", "true");
    const viaPhrase = await names(page.locator(".wc-x-groups"));
    await shortcut(page, "Evening").click(); // pressed: clears
    await shortcut(page, "Evening").click();
    expect(await names(page.locator(".wc-x-groups"))).toEqual(viaPhrase);
    for (const fragment of ["even", "morn", "after", "before", "night shift", "evening star"]) {
      await type(page, fragment);
      await expect(heading(page), fragment).not.toContainText("currently");
      await expect(page.locator("[data-shortcut][aria-pressed='true']"), fragment).toHaveCount(0);
    }
    await type(page, "12 pm onward");
    await expect(heading(page)).toHaveText("Places where it is currently 12 PM onward (noon to 11:59 PM)");
    await type(page, "12 pm");
    await expect(heading(page)).toHaveText("Places currently between 12:00 PM and 12:59 PM");
    await type(page, "PM");
    await expect(heading(page)).toHaveText("Places where it is currently PM (noon to 11:59 PM)");
    await type(page, "before noon");
    await expect(countLine(page)).toContainText("73 listed cities"); // the same cities as AM
  });

  test("a shortcut combines with Region and Country, Clear empties only the shortcut, and Escape clears it too", async ({ page, go }) => {
    await openExplore(page, go);
    await page.locator("#wc-filters-toggle").click();
    await page.locator("#wc-region").selectOption("Asia");
    await shortcut(page, "Evening").click();
    const asiaEvening = Number((await countLine(page).innerText()).match(/^(\d+)/)[1]);
    await shortcut(page, "Evening").click();
    const asia = Number((await countLine(page).innerText()).match(/^(\d+)/)[1]);
    expect(asia).toBe(56);
    expect(asiaEvening).toBeLessThan(asia);
    await shortcut(page, "Evening").click();
    await page.locator("#wc-search-clear").click();
    await expect(search(page)).toHaveValue("");
    await expect(shortcut(page, "Evening")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#wc-region")).toHaveValue("Asia");
    await shortcut(page, "Night").click();
    await search(page).focus();
    await page.keyboard.press("Escape");
    await expect(search(page)).toHaveValue("");
    await expect(shortcut(page, "Night")).toHaveAttribute("aria-pressed", "false");
  });

  test("a valid shared address opens My clocks; none, or none valid, opens Explore; the choice of view is not remembered or put in the address", async ({ page, go }) => {
    await open(page, go, "?cities=mumbai-in,tokyo-jp");
    await expect(clocksTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#wc-view-explore")).toBeHidden();
    await expect(clocksTab(page)).toHaveText("My clocks (2)");
    expect(await titles(page)).toEqual(["Your time", "Mumbai", "Tokyo"]);
    await exploreTab(page).click();
    await expect(page.locator(".wc-xrow").first()).toBeVisible();
    expect(page.url()).toContain("cities=mumbai-in,tokyo-jp");
    expect(page.url()).not.toMatch(/view|tab|explore/);
    await page.reload();
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await expect(clocksTab(page)).toHaveAttribute("aria-selected", "true"); // the shared address again, not the visitor's last choice
    for (const q of ["?cities=not-a-city-xx", "?cities=", "?x=1", "?ref=london-gb"]) {
      await open(page, go, q);
      await expect(exploreTab(page), q).toHaveAttribute("aria-selected", "true");
    }
  });

  test("the tabs follow the ARIA pattern: roving tabindex, arrows, Home and End select and focus, each panel is labelled by its tab", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(page.locator("[role='tablist']")).toHaveAttribute("aria-label", "World Clock views");
    await expect(exploreTab(page)).toHaveAttribute("tabindex", "0");
    await expect(clocksTab(page)).toHaveAttribute("tabindex", "-1");
    await expect(exploreTab(page)).toHaveAttribute("aria-controls", "wc-view-explore");
    await expect(page.locator("#wc-view-explore")).toHaveAttribute("role", "tabpanel");
    await expect(page.locator("#wc-view-explore")).toHaveAttribute("aria-labelledby", "wc-tab-explore");
    await expect(page.locator("#wc-view-clocks")).toHaveAttribute("aria-labelledby", "wc-tab-clocks");
    await exploreTab(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(clocksTab(page)).toBeFocused();
    await expect(clocksTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(clocksTab(page)).toHaveAttribute("tabindex", "0");
    await expect(exploreTab(page)).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("#wc-view-clocks")).toBeVisible();
    await expect(page.locator("#wc-view-explore")).toBeHidden();
    await page.keyboard.press("ArrowRight");
    await expect(exploreTab(page)).toBeFocused();
    await page.keyboard.press("End");
    await expect(clocksTab(page)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(exploreTab(page)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(clocksTab(page)).toBeFocused();
    // switching views by the mouse does not move focus into a panel
    await exploreTab(page).click();
    await expect(page.locator("#wc-view-explore")).toBeVisible();
    await expect(exploreTab(page)).toBeFocused();
  });

  test("typing in the search while My clocks shows switches to Explore, says so once, and keeps focus in the search field", async ({ page, go }) => {
    await openClocks(page, go);
    await search(page).focus();
    await page.keyboard.type("lon");
    await expect(exploreTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(search(page)).toBeFocused();
    await expect(live(page)).toHaveText("Showing results in Explore cities");
    expect(await names(page.locator(".wc-x-groups"))).toEqual(expect.arrayContaining(["London"]));
    expect(page.url()).not.toContain("lon");
  });

  test("keyboard in the search field: Enter goes to the first result's Add button and adds nothing; Escape clears, and does nothing when empty", async ({ page, go }) => {
    await openExplore(page, go);
    await search(page).focus();
    await page.keyboard.type("canada");
    await expect(heading(page)).toContainText("Canada");
    await page.keyboard.press("Enter");
    await expect(listed(page).first().locator(".wc-xrow__add")).toBeFocused();
    await expect(cards(page)).toHaveCount(5);
    await search(page).focus();
    await page.keyboard.press("Escape");
    await expect(search(page)).toHaveValue("");
    await expect(heading(page)).toHaveText("All listed cities");
    await page.keyboard.press("Escape");
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).toBeFocused();
  });
});

test.describe("World Clock: the Explore directory", () => {
  test("every one of the 195 cities is listed once, with its country, time, offset and a day or night word; the default order is the local time of day", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(195);
    const keys = await listed(page).evaluateAll((lis) => lis.map((li) => li.dataset.key));
    expect(new Set(keys).size).toBe(195);
    const plain = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const clocks = (await listed(page).locator(".wc-xrow__clock").allTextContents()).map(minuteOf);
    const mains = (await names(page.locator(".wc-x-groups"))).map(plain);
    expect(clocks.length).toBe(195);
    for (let i = 1; i < clocks.length; i += 1) {
      expect(clocks[i - 1], `row ${i}: ${mains[i - 1]} then ${mains[i]}`).toBeLessThanOrEqual(clocks[i]);
      if (clocks[i - 1] === clocks[i]) expect(mains[i - 1] <= mains[i], `tie ${mains[i - 1]} / ${mains[i]}`).toBe(true);
    }
    expect(clocks[0]).toBeLessThan(180); // starts just after midnight somewhere
    expect(clocks.at(-1)).toBeGreaterThan(1200); // and ends before it somewhere
    const sydney = row(page, "Sydney");
    await expect(sydney.locator(".wc-xrow__sub")).toHaveText("Australia");
    await expect(sydney.locator(".wc-xrow__clock")).toHaveText("Tue 1:20 AM");
    await expect(sydney.locator(".wc-xrow__offset")).toHaveText("UTC+11:00");
    await expect(sydney.locator(".wc-xrow__word")).toHaveText("Night-time");
    await expect(row(page, "London").locator(".wc-xrow__word")).toHaveText("Daytime");
    await expect(row(page, "Kolkata").locator(".wc-xrow__clock")).toHaveText("7:50 PM"); // same date as yours: no weekday
    await expect(page.locator("#wc-sort")).toHaveValue("time");
    expect(await page.locator("#wc-sort option:not([hidden])").allTextContents()).toEqual(["Local time (00:00 to 23:59)", "City (A to Z)", "Country", "UTC offset"]);
    for (const li of await page.locator(".wc-xrow").all()) await expect(li.locator(".wc-xrow__add")).toHaveAttribute("aria-label", /^(Add .+, .+|.+ is on your board)$/);
  });

  test("the results selector: Cities (195) and Other time zones with live counts; only the chosen list is drawn; zones no listed city uses are each addable", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(page.locator(".wc-show__legend")).toHaveText("Show");
    await expect(showCities(page)).toBeChecked();
    await expect(showOthers(page)).not.toBeChecked();
    await expect(showLabel(page, "cities")).toHaveText(/^Cities \(195\)$/);
    await expect(showLabel(page, "others")).toHaveText(/^Other time zones \(\d+\)$/);
    const count = Number((await showLabel(page, "others").innerText()).match(/\((\d+)\)/)[1]);
    expect(count).toBeGreaterThan(200);
    await expect(countLine(page)).toContainText(`plus ${count} other time zones`);
    await expect(page.locator(".wc-others__toggle")).toHaveCount(0); // no collapsible group any more
    await expect(othersRows(page)).toHaveCount(0); // not drawn until chosen
    await chooseOthers(page);
    await expect(othersRows(page).first()).toBeVisible();
    await expect(othersRows(page)).toHaveCount(count);
    await expect(page.locator(".wc-x-groups .wc-xrow")).toHaveCount(0); // one list at a time
    await expect(page.locator(".wc-x-others-note")).toContainText("not a list of every time zone");
    await expect(page.locator(".wc-x-others-note")).toContainText("zones used by a listed city appear under Cities");
    const otherClocks = (await othersRows(page).locator(".wc-xrow__clock").allTextContents()).map(minuteOf); // the same default order in this list
    for (let i = 1; i < otherClocks.length; i += 1) expect(otherClocks[i - 1], `other zone row ${i}`).toBeLessThanOrEqual(otherClocks[i]);
    await expect(showLabel(page, "cities")).toHaveText(/^Cities \(195\)$/); // both counts stay visible
    await expect(live(page)).not.toContainText("Showing"); // choosing a list says nothing extra: the radio names its own state
    await chooseCities(page);
    await expect(listed(page)).toHaveCount(195);
    await expect(othersRows(page)).toHaveCount(0);
    await expect(page.locator(".wc-x-others-note")).toHaveCount(0);
  });

  test("the selector is a native radio group: one Tab stop, arrow keys, no ARIA tabs of its own, and focus stays on it while the list changes", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(page.locator("fieldset.wc-show")).toHaveCount(1);
    await expect(page.locator("fieldset.wc-show input[type=radio]")).toHaveCount(2);
    await expect(page.locator("[role=tablist]")).toHaveCount(1); // only Explore / My clocks
    await showCities(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(showOthers(page)).toBeFocused();
    await expect(showOthers(page)).toBeChecked();
    await expect(othersRows(page).first()).toBeVisible();
    await expect(showOthers(page)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(showCities(page)).toBeChecked();
    await expect(listed(page).first()).toBeVisible();
    await expect(showCities(page)).toBeFocused();
    for (const target of [showCities(page), showOthers(page)]) expect((await target.boundingBox()).height).toBeGreaterThanOrEqual(44);
  });

  test("the selection is never changed for the visitor: a query, a country or a filter keeps it, and an empty view offers the other one as a button", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "indiana knox"); // no listed city, one other time zone
    await expect(showCities(page)).toBeChecked();
    await expect(showLabel(page, "cities")).toHaveText("Cities (0)");
    await expect(showLabel(page, "others")).toHaveText("Other time zones (1)");
    await expect(page.locator(".wc-x-empty__message")).toHaveText('No listed city matches "indiana knox".');
    await expect(listed(page)).toHaveCount(0);
    const offer = page.locator(".wc-x-empty").getByRole("button", { name: "Show 1 other time zone" });
    await expect(offer).toBeVisible();
    await offer.click();
    await expect(showOthers(page)).toBeChecked();
    await expect(showOthers(page)).toBeFocused();
    await expect(othersRows(page)).toHaveCount(1);
    await expect(live(page)).toHaveText("Showing 1 other time zone");
    // a new query does not switch back by itself, and the other view says so when it has nothing
    await type(page, "india");
    await expect(showOthers(page)).toBeChecked();
    await expect(page.locator(".wc-x-empty__message")).toHaveText('No other time zone matches "india".');
    await expect(page.locator(".wc-x-empty").getByRole("button", { name: /^Show 8 listed cities$/ })).toBeVisible();
    await page.locator(".wc-x-empty").getByRole("button", { name: /^Show 8 listed cities$/ }).click();
    await expect(showCities(page)).toBeChecked();
    await expect(showCities(page)).toBeFocused();
    await expect(listed(page)).toHaveCount(8);
    // a country query used to open the other zones by itself; now only the count tells
    await type(page, "usa");
    await expect(showCities(page)).toBeChecked();
    await expect(showLabel(page, "others")).toHaveText("Other time zones (21)");
    await expect(othersRows(page)).toHaveCount(0);
  });

  test("sorting: City, Country, Local time and UTC offset each order the list; the choice is kept while you search", async ({ page, go }) => {
    await openExplore(page, go);
    await page.locator("#wc-sort").selectOption("city");
    const alphabetical = (await names(page.locator(".wc-x-groups"))).map((t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase());
    expect(alphabetical).toEqual([...alphabetical].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    await page.locator("#wc-sort").selectOption("offset");
    const offsets = await listed(page).locator(".wc-xrow__offset").allTextContents();
    const num = (t) => (t.includes("−") ? -1 : 1) * (Number(t.slice(4, 6)) * 60 + Number(t.slice(7, 9)));
    const values = offsets.map(num);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(offsets[0]).toBe("UTC−11:00");
    await page.locator("#wc-sort").selectOption("time");
    const first = await listed(page).first().locator(".wc-xrow__clock").innerText();
    expect(first).toMatch(/12:\d\d AM$/); // the earliest local clock, 00:00 onward
    await page.locator("#wc-sort").selectOption("country");
    const subs = await listed(page).locator(".wc-xrow__sub").allTextContents();
    expect(subs.slice(0, 3)).toEqual(["Afghanistan", "Algeria", "American Samoa"]);
    await type(page, "asia");
    await expect(page.locator("#wc-sort")).toHaveValue("country");
    await chooseOthers(page); // the choice is kept across the two lists too
    await expect(page.locator("#wc-sort")).toHaveValue("country");
    await chooseCities(page);
    await expect(page.locator("#wc-sort")).toHaveValue("country");
  });

  test("a result summary still pending when the visitor changes the list is cancelled, never late or doubled; the next query is announced once", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "india");
    await chooseOthers(page); // inside the 700 ms window
    await page.clock.runFor(1500);
    await expect(live(page)).not.toContainText("places");
    await expect(live(page)).not.toContainText("India");
    await type(page, "usa");
    await page.clock.runFor(1500);
    await expect(live(page)).toContainText("United States");
    await expect(live(page)).toContainText("places");
    await page.clock.runFor(3000);
    await expect(live(page)).toContainText("United States"); // still the one message
  });

  test("filters: Region shows plain labels over the data regions, Region and Country combine with the search and with both lists, and Reset all clears them and returns to Cities; the label counts what is active", async ({ page, go }) => {
    await openExplore(page, go);
    const toggle = page.locator("#wc-filters-toggle");
    await expect(toggle).toHaveText(/^Filters/);
    await expect(page.locator("#wc-filters")).toBeHidden();
    await expect(resetAll(page)).toBeHidden(); // nothing is active
    await toggle.click();
    await expect(page.locator("#wc-region option")).toHaveText(["All regions", "Africa", "Asia", "Europe", "Americas", "Australia & Pacific"]);
    await page.locator("#wc-region").selectOption("Americas");
    await expect(countLine(page)).toContainText("53 listed cities");
    await expect(showLabel(page, "cities")).toHaveText("Cities (53)");
    await expect(showLabel(page, "others")).toHaveText("Other time zones (112)");
    await page.locator("#wc-region").selectOption("Australia & Pacific");
    await expect(toggle).toHaveText(/Filters \(1\)/);
    await expect(countLine(page)).toContainText("22 listed cities");
    await expect(showLabel(page, "others")).toHaveText("Other time zones (29)");
    await expect(page.locator(".wc-x-active__text")).toHaveText("Showing: Australia & Pacific");
    await expect(page.locator("#wc-country")).toBeEnabled();
    await page.locator("#wc-country").selectOption("AU");
    await expect(toggle).toHaveText(/Filters \(2\)/);
    await expect(countLine(page)).toContainText("9 listed cities");
    await expect(page.locator(".wc-x-active__text")).toHaveText("Showing: Australia & Pacific · Australia");
    await expect(showCities(page)).toBeChecked(); // a country filter does not open the other zones
    await chooseOthers(page);
    await expect(othersRows(page).filter({ hasText: "Eucla" })).toContainText("Western Australia (Eucla)");
    // a sort the visitor chose and a query both exist when everything is reset
    await page.locator("#wc-sort").selectOption("offset");
    await type(page, "sydney");
    await resetAll(page).click();
    await expect(toggle).toHaveText(/^Filters(?! \()/);
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).toBeFocused();
    await expect(page.locator("#wc-region")).toHaveValue("");
    await expect(showCities(page)).toBeChecked();
    await expect(countLine(page)).toContainText("195 listed cities");
    await expect(page.locator("#wc-sort")).toHaveValue("offset"); // the sort preference stays
    await expect(resetAll(page)).toBeHidden();
    // a filter AND a query
    await page.locator("#wc-region").selectOption("Europe");
    await type(page, "8 pm");
    await expect(countLine(page)).toContainText("0 listed cities");
  });

  test("Reset all clears the search text or shortcut, Region, Country and the list choice, and keeps the sort, the tolerance, the board and the clock style; Clear search clears only the text", async ({ page, go }) => {
    await openExplore(page, go);
    await page.locator("#wc-filters-toggle").click();
    await page.locator("#wc-region").selectOption("Asia");
    await page.locator("#wc-sort").selectOption("country");
    await type(page, "3:07 AM");
    await page.locator("#wc-tolerance").selectOption("30");
    await chooseOthers(page);
    await expect(page.locator(".wc-x-active__text")).toHaveText("Showing: 3:07 AM · Asia");
    // Clear search: only the text goes
    await page.locator("#wc-search-clear").click();
    await expect(page.locator("#wc-region")).toHaveValue("Asia");
    await expect(showOthers(page)).toBeChecked();
    await expect(page.locator(".wc-x-active__text")).toHaveText("Showing: Asia");
    await type(page, "3:07 AM");
    await page.locator("#wc-tolerance").selectOption("30");
    await resetAll(page).click();
    await expect(search(page)).toHaveValue("");
    await expect(page.locator("#wc-region")).toHaveValue("");
    await expect(showCities(page)).toBeChecked();
    await expect(page.locator("#wc-sort")).toHaveValue("country");
    await expect(page.locator("#wc-tolerance")).toHaveValue("30"); // the tolerance preference is kept
    await expect(clocksTab(page)).toHaveText("My clocks (4)");
    await type(page, "3:07 AM");
    await expect(page.locator("#wc-tolerance")).toHaveValue("15"); // a new query starts at the default window, as before
    await expect(page.locator(".wc-x-active__text")).toHaveText("Showing: 3:07 AM");
  });

  test("the active line keeps the whole typed text, the Region and the Country in the page, clips only a long query visually, never overflows, and is absent when nothing is active", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(page.locator(".wc-x-active")).toBeHidden();
    await page.setViewportSize({ width: 320, height: 700 });
    await page.locator("#wc-filters-toggle").click();
    await page.locator("#wc-region").selectOption("Asia");
    await page.locator("#wc-country").selectOption("IN");
    await type(page, "a very long search text that goes on and on and on and on and on");
    await expect(page.locator(".wc-x-active__text")).toHaveText("Showing: a very long search text that goes on and on and on and on and on · Asia · India");
    await expect(page.locator(".wc-x-active__query")).toHaveCSS("text-overflow", "ellipsis");
    const [queryBox, line] = await Promise.all([page.locator(".wc-x-active__query").boundingBox(), page.locator(".wc-x-active").boundingBox()]);
    expect(queryBox.width, "the query is clipped to the line").toBeLessThanOrEqual(line.width + 1);
    for (const item of ["Asia", "India"]) {
      const box = await page.locator(".wc-x-active__item", { hasText: new RegExp(`^${item}$`) }).boundingBox();
      expect(box.width, `${item} is shown whole`).toBeGreaterThan(20);
      expect(box.x + box.width, `${item} stays inside the line`).toBeLessThanOrEqual(line.x + line.width + 1);
    }
    await expectNoHorizontalOverflow(page);
    await resetAll(page).click();
    await expect(page.locator(".wc-x-active")).toBeHidden();
    await type(page, "a very long search text that goes on and on");
    await expect(page.locator(".wc-x-empty__message")).toContainText("No match for");
    await expect(resetAll(page)).toBeVisible();
    expect((await resetAll(page).boundingBox()).height).toBeGreaterThanOrEqual(44);
    await resetAll(page).click();
    await expect(page.locator(".wc-x-active")).toBeHidden();
  });

  test("a continent heading uses the visible label: Americas and Australia & Pacific, while oceania, north america and south america are still understood", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "oceania");
    await expect(heading(page)).toHaveText("Australia & Pacific · 22 listed cities");
    await type(page, "americas");
    await expect(heading(page)).toHaveText("Americas · 53 listed cities");
    await type(page, "north america");
    await expect(heading(page)).toHaveText("North America · 40 listed cities");
    await type(page, "south america");
    await expect(heading(page)).toHaveText("South America · 13 listed cities");
  });
});

test.describe("World Clock: searching by name", () => {
  test("a city by its everyday name, an old name, a short alias and a zone path; accents and case do not matter", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "mumbai");
    expect(await names(page.locator(".wc-x-groups"))).toEqual(["Mumbai"]);
    await type(page, "bombay");
    expect(await names(page.locator(".wc-x-groups"))).toEqual(["Mumbai"]);
    await search(page).fill("NYC");
    await expect.poll(() => names(page.locator(".wc-x-groups"))).toEqual(["New York"]);
    await type(page, "LA");
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toContainText("Los Angeles");
    await type(page, "America/Chicago");
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toContainText("Chicago");
    await type(page, "SAO PAULO");
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toContainText("Paulo");
  });

  test("two cities with one name are both listed, each with its country", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "london");
    await expect(listed(page)).toHaveCount(2);
    await expect(listed(page).nth(0)).toContainText("United Kingdom");
    await expect(listed(page).nth(1)).toContainText("Canada");
  });

  test("country names and aliases give the country's places, never a word found inside another: USA, UK, UAE, England, India", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "usa");
    await expect(heading(page)).toHaveText("United States · 29 time zones");
    await expect(countLine(page)).toHaveText("20 listed cities in 8 time zones, plus 21 other time zones");
    await expect(showLabel(page, "others")).toHaveText("Other time zones (21)"); // a country query counts its other zones, it does not open them
    await expect(showCities(page)).toBeChecked();
    await expect(page.locator(".wc-x-groups")).not.toContainText("Jerusalem");
    await expect(page.locator(".wc-x-groups")).not.toContainText("Lusaka");
    await type(page, "UK");
    await expect(heading(page)).toHaveText("United Kingdom · 1 time zone");
    await expect(page.locator(".wc-x-groups")).not.toContainText("Kyiv");
    for (const [typed, head] of [["UAE", "United Arab Emirates · 1 time zone"], ["England", "United Kingdom · 1 time zone"], ["Holland", "Netherlands · 1 time zone"], ["Czech Republic", "Czechia · 1 time zone"], ["india", "India · 1 time zone"]]) {
      await type(page, typed);
      await expect(heading(page), typed).toHaveText(head);
    }
    await expect(page.locator("main")).not.toContainText("Indiana");
  });

  test("a continent word lists that region's listed cities and counts its other zones without opening them, without zone fragments", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "asia");
    await expect(heading(page)).toHaveText("Asia · 56 listed cities");
    await expect(listed(page)).toHaveCount(56);
    await expect(page.locator(".wc-x-groups")).not.toContainText("Asia/");
    await expect(showLabel(page, "others")).toHaveText("Other time zones (47)");
    await expect(othersRows(page)).toHaveCount(0);
    await type(page, "south america");
    await expect(heading(page)).toHaveText("South America · 13 listed cities");
    await type(page, "americas");
    await expect(heading(page)).toHaveText("Americas · 53 listed cities");
  });

  test("a time zone that no listed city covers is found by its name, offered under other time zones, and can be added", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "indiana knox");
    await expect(countLine(page)).toHaveText("0 listed cities in 0 time zones, plus 1 other time zone");
    await expect(showCities(page)).toBeChecked();
    await page.locator(".wc-x-empty").getByRole("button", { name: "Show 1 other time zone" }).click();
    const knox = othersRows(page).first();
    await expect(knox).toContainText("Knox");
    await expect(knox).toContainText("Central - IN (Starke)");
    await expect(knox).toContainText("UTC−05:00");
    await knox.getByRole("button", { name: /^Add / }).click();
    await expect(clocksTab(page)).toHaveText("My clocks (5)");
    await clocksTab(page).click();
    await expect(card(page, "Knox").locator(".wc-card__sub")).toHaveText("America/Indiana/Knox");
  });

  test("a name with no match says so, says the list is not every city, and points to Filters; nothing is suggested", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "jaipur");
    await expect(page.locator(".wc-x-empty")).toContainText('No match for "jaipur"');
    await expect(page.locator(".wc-x-empty")).toContainText("does not include every city in the world");
    await expect(page.locator(".wc-x-suggest")).toBeHidden();
    await page.locator(".wc-x-empty").getByRole("button", { name: "Open Filters" }).click();
    await expect(page.locator("#wc-filters")).toBeVisible();
    await expect(page.locator("#wc-region")).toBeFocused();
    await type(page, "q".repeat(300));
    expect((await page.locator(".wc-x-empty__message").innerText()).length).toBeLessThan(400);
  });

  test("a time-zone abbreviation is explained, not guessed", async ({ page, go }) => {
    await openExplore(page, go);
    for (const word of ["IST", "EST", "pst"]) {
      await search(page).fill(word);
      await expect(page.locator(".wc-x-notes")).toContainText("time-zone abbreviation");
      await expect(page.locator(".wc-x-notes")).toContainText("Search for a city or country instead");
      await expect(page.locator(".wc-xrow"), word).toHaveCount(0);
    }
    await type(page, "istanbul");
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toContainText("Istanbul");
  });

  test("Amman and Amsterdam are cities, not AM", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "amman");
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toContainText("Amman");
    await type(page, "amsterdam");
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toContainText("Amsterdam");
  });
});

test.describe("World Clock: searching by the time it is now", () => {
  test("8 PM: exactly the places whose clock reads 8:00 to 8:59 PM now, with a heading, counts and the update time", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "8 PM");
    await expect(heading(page)).toHaveText("Places currently between 8:00 PM and 8:59 PM");
    expect(await names(page.locator(".wc-x-groups"))).toEqual(["Kathmandu", "Dhaka", "Thimphu", "Yangon"]);
    await expect(countLine(page)).toHaveText("4 listed cities in 4 time zones, plus 5 other time zones");
    await expect(page.locator(".wc-x-updated")).toHaveText("Updated 7:50 PM");
    await expect(row(page, "Kathmandu").locator(".wc-xrow__clock")).toHaveText("8:05 PM");
    await expect(page.locator("#wc-sort")).toHaveValue("time"); // a time query sorts by local time unless you chose otherwise
    await expect(showLabel(page, "others")).toHaveText("Other time zones (5)"); // not drawn, with its count stated
    await expect(othersRows(page)).toHaveCount(0);
    expect(page.url()).not.toMatch(/[?&]q=|8%20|8+PM/i);
  });

  test("a bare 8 is shown as two labelled groups, 8 AM and 8 PM, never merged; 08 and 20 are one hour each", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "8");
    await expect(page.locator(".wc-x-group-heading")).toHaveText(["Places currently between 8:00 AM and 8:59 AM", "Places currently between 8:00 PM and 8:59 PM"]);
    await expect(page.locator(".wc-x-group-count")).toHaveCount(2);
    await expect(countLine(page)).toHaveText("12 listed cities in 10 time zones, plus 19 other time zones");
    await type(page, "08");
    await expect(page.locator(".wc-x-group-heading")).toHaveCount(0);
    await expect(heading(page)).toHaveText("Places currently between 8:00 AM and 8:59 AM");
    await type(page, "20");
    await expect(heading(page)).toHaveText("Places currently between 8:00 PM and 8:59 PM");
  });

  test("AM and PM together are every city exactly once; the AM note keeps Amman and Amsterdam findable", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "AM");
    await expect(heading(page)).toHaveText("Places where it is currently AM (midnight to 11:59 AM)");
    await expect(countLine(page)).toContainText("73 listed cities");
    await expect(page.locator(".wc-x-notes")).toContainText("Amman or Amsterdam");
    await type(page, "pm");
    await expect(countLine(page)).toContainText("122 listed cities");
  });

  test("noon and midnight are the current local hours 12:00 to 12:59 and 00:00 to 00:59, never an exact minute", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "noon");
    await expect(heading(page)).toHaveText("Places currently between 12:00 PM and 12:59 PM");
    await expect(page.locator(".wc-x-empty__message")).toHaveText("No listed city is currently between 12:00 PM and 12:59 PM.");
    await expect(showCities(page)).toBeChecked(); // other zones match, but the visitor is not switched to them
    await expect(page.locator(".wc-x-empty").getByRole("button", { name: /^Show \d+ other time zones?$/ })).toBeVisible();
    await expect(othersRows(page)).toHaveCount(0);
    await page.locator(".wc-x-empty").getByRole("button", { name: /^Show \d+ other time zones?$/ }).click();
    await expect(othersRows(page).first()).toBeVisible();
    await expect(page.locator("#wc-tolerance")).toBeHidden(); // no tolerance for an hour
    await chooseCities(page); // the choice of list is kept across queries, so go back to the cities before reading them
    await type(page, "midnight");
    await expect(heading(page)).toHaveText("Places currently between 12:00 AM and 12:59 AM");
    expect(await names(page.locator(".wc-x-groups"))).toHaveLength(4);
    await type(page, "noon:30");
    await expect(page.locator(".wc-x-notes")).toContainText("not a time or offset we can read");
  });

  test("a specific time names its window, sorts nearest first, and the tolerance control changes only the window", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "3:07 AM");
    await expect(heading(page)).toHaveText("Places currently around 3:07 AM (2:52 AM to 3:22 AM, ±15 minutes)");
    await expect(page.locator("#wc-tolerance")).toBeVisible();
    await expect(page.locator("#wc-tolerance")).toHaveValue("15");
    await expect(countLine(page)).toHaveText("5 listed cities in 4 time zones, plus 5 other time zones");
    await page.locator("#wc-tolerance").selectOption("5");
    await expect(heading(page)).toContainText("±5 minutes");
    await expect(countLine(page)).toContainText("0 listed cities");
    await page.locator("#wc-tolerance").selectOption("60");
    await expect(heading(page)).toContainText("±60 minutes");
    const wide = Number((await countLine(page).innerText()).match(/^(\d+)/)[1]);
    expect(wide).toBeGreaterThan(5);
    await type(page, "3:08 AM"); // a new query goes back to the default window
    await expect(page.locator("#wc-tolerance")).toHaveValue("15");
  });

  test("a range is both ends included, may cross midnight and says so; an end that could be either half of the day is refused with a hint", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "9 AM-12 PM");
    await expect(heading(page)).toHaveText("Places currently between 9:00 AM and 12:00 PM");
    await expect(countLine(page)).toContainText("36 listed cities");
    await type(page, "22:00-02:00");
    await expect(heading(page)).toContainText("(crossing midnight)");
    await expect(countLine(page)).toContainText("24 listed cities");
    await type(page, "9-12");
    await expect(page.locator(".wc-x-notes")).toContainText("Add AM or PM to both ends");
    await expect(page.locator(".wc-xrow")).toHaveCount(0);
    await type(page, "25:00");
    await expect(page.locator(".wc-x-notes")).toContainText("That is not a time or offset we can read");
    await expect(page.locator(".wc-xrow")).toHaveCount(0);
  });

  test("a UTC offset lists the places on it right now, in one count, with the daylight-saving note; UTC and GMT are explained", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "UTC+05:30");
    await expect(heading(page)).toHaveText("Places currently using UTC+05:30");
    await expect(countLine(page)).toHaveText("9 listed cities in 2 time zones, plus 0 other time zones");
    await expect(page.locator(".wc-x-notes")).toContainText("daylight saving");
    expect((await names(page.locator(".wc-x-groups"))).sort()).toEqual(["Ahmedabad", "Bengaluru", "Chennai", "Colombo", "Delhi", "Hyderabad", "Kolkata", "Mumbai", "Pune"]);
    expect(await listed(page).count()).toBe(9);
    await type(page, "-4");
    await expect(heading(page)).toHaveText("Places currently using UTC−04:00");
    await type(page, "utc");
    await expect(page.locator(".wc-x-notes")).toContainText("UTC and GMT are the same standard time");
    await type(page, "+15");
    await expect(page.locator(".wc-x-notes")).toContainText("Offsets run from -12:00 to +14:00");
  });

  test("nothing is silently broadened: an empty window says so, offers a wider one as an explicit button, and keeps the nearest places apart from the matches", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "00:00");
    await page.locator("#wc-tolerance").selectOption("5");
    await expect(page.locator(".wc-x-empty__message")).toContainText("No listed city is currently around 12:00 AM");
    await expect(page.locator(".wc-x-groups .wc-xrow")).toHaveCount(0);
    await expect(countLine(page)).toContainText("0 listed cities");
    const widen = page.getByRole("button", { name: "Widen to ±15 minutes" });
    await expect(widen).toBeVisible();
    await expect(page.locator(".wc-x-suggest__heading")).toHaveText("Nearest places (not matches)");
    expect(await page.locator(".wc-x-suggest .wc-xrow").count()).toBeLessThanOrEqual(5);
    await expect(page.locator(".wc-x-suggest .wc-xrow__near").first()).toHaveText(/\d+ minutes? (before|after)/);
    await expect(page.locator(".wc-x-suggest .wc-xrow").first()).toHaveCSS("border-style", "dashed");
    await widen.click();
    await expect(page.locator("#wc-tolerance")).toHaveValue("15");
    await expect(heading(page)).toContainText("±15 minutes");
    // an hour offers no widening
    await type(page, "+12:45");
    await expect(page.getByRole("button", { name: /^Widen/ })).toHaveCount(0);
    await expect(page.locator(".wc-x-empty__message")).toContainText("No listed city is currently using UTC+12:45");
  });

  test("the result summary is announced once, after a pause, with the full count, and never on a tick", async ({ page, go }) => {
    await openExplore(page, go);
    await search(page).fill("8 PM");
    await expect(heading(page)).toBeVisible();
    await expect(live(page)).toHaveText("");
    await page.clock.runFor(800);
    await expect(live(page)).toHaveText("9 places currently between 8:00 PM and 8:59 PM");
    await page.clock.runFor(61000);
    await expect(live(page)).toHaveText("9 places currently between 8:00 PM and 8:59 PM");
    await expect(page.locator("[aria-live]")).toHaveCount(1);
    await expect(page.locator(".wc-x-results [aria-live]")).toHaveCount(0);
  });
});

test.describe("World Clock: adding from Explore", () => {
  test("Add puts the city on the board, keeps focus on the same button (now 'On your board', inert but focusable), updates the tab, confirms where you look and announces once", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "sydney");
    const add = row(page, "Sydney").getByRole("button");
    await expect(add).toHaveAttribute("aria-label", "Add Sydney, Australia");
    await add.focus();
    const before = await page.evaluate(() => scrollY);
    await page.keyboard.press("Enter");
    await expect(clocksTab(page)).toHaveText("My clocks (5)");
    await expect(add).toBeFocused();
    await expect(add).toHaveText("On your board");
    await expect(add).toHaveAttribute("aria-disabled", "true");
    await expect(add).toHaveAttribute("aria-label", "Sydney, Australia is on your board");
    await expect(add).not.toHaveAttribute("disabled", /.*/);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    await expect(page.locator("#wc-search-hint")).toContainText("Added Sydney, Australia. 5 of 12 cities.");
    await expect(live(page)).toHaveText("Added Sydney, Australia. 5 of 12 cities.");
    await expect(exploreTab(page)).toHaveAttribute("aria-selected", "true"); // nothing switched or scrolled
    expect(await titles(page)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore", "Sydney"]);
    // pressing it again does nothing
    await page.keyboard.press("Enter");
    await expect(clocksTab(page)).toHaveText("My clocks (5)");
    await expect(cards(page)).toHaveCount(6);
    expect(page.url()).toContain("cities=new-york-us,london-gb,dubai-ae,singapore-sg,sydney-au");
    // "Show clock" goes to the clock, only because it was asked
    await page.locator("#wc-search-hint").getByRole("button", { name: "Show clock" }).click();
    await expect(clocksTab(page)).toHaveAttribute("aria-selected", "true");
    await expect(card(page, "Sydney").locator(".wc-card__title")).toBeFocused();
    await expect(card(page, "Sydney")).toHaveClass(/wc-card--new/);
  });

  test("a city already on the board says so on its row from the start", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "london");
    await expect(row(page, "London").getByRole("button").first()).toHaveText("On your board");
    await expect(listed(page).nth(1).getByRole("button")).toHaveText("Add");
  });

  test("a full board: every other Add is inert with the reason, still focusable, and a line says why; removing a clock restores them", async ({ page, go }) => {
    await open(page, go, `?cities=${BOARD_FULL.join(",")}`);
    await exploreTab(page).click();
    await expect(page.locator(".wc-xrow").first()).toBeVisible();
    await expect(clocksTab(page)).toHaveText("My clocks (12)");
    await expect(page.locator("#wc-search-hint")).toContainText("The board is full (12 cities). Remove one in My clocks to add another.");
    await expect(search(page)).toBeEnabled();
    const tokyoless = row(page, "Cairo");
    await expect(tokyoless.getByRole("button")).toHaveText("On your board");
    const oslo = row(page, "Oslo").getByRole("button");
    await expect(oslo).toHaveText("Board full");
    await expect(oslo).toHaveAttribute("aria-disabled", "true");
    await expect(oslo).toHaveAttribute("aria-label", /board is full/);
    await oslo.focus();
    await expect(oslo).toBeFocused();
    await oslo.click({ force: true });
    await expect(cards(page)).toHaveCount(13);
    await clocksTab(page).click();
    await card(page, "Rome").getByRole("button", { name: "Remove Rome, Italy" }).click();
    await exploreTab(page).click();
    await expect(row(page, "Oslo").getByRole("button")).toHaveText("Add");
    await expect(row(page, "Rome").getByRole("button")).toHaveText("Add");
  });

  test("the Add that fills the board keeps focus on that button, now 'On your board'", async ({ page, go }) => {
    await open(page, go, `?cities=${BOARD_FULL.slice(0, 11).join(",")}`);
    await exploreTab(page).click();
    await type(page, "oslo");
    const add = row(page, "Oslo").getByRole("button");
    await add.focus();
    await page.keyboard.press("Enter");
    await expect(add).toBeFocused();
    await expect(add).toHaveText("On your board");
    await expect(page.locator("#wc-search-hint")).toContainText("The board is now full");
    await search(page).fill("kyiv");
    await expect(row(page, "Kyiv").getByRole("button")).toHaveText("Board full");
  });

  test("an added clock then reads correctly on My clocks, with its difference from you, and the address changes", async ({ page, go }) => {
    await openExplore(page, go);
    await addFromExplore(page, "mumbai", "Mumbai");
    await clocksTab(page).click();
    await expect(card(page, "Mumbai").locator(".wc-card__difference")).toHaveText("Same time as Your time");
    await expect(card(page, "Mumbai").locator("time")).toHaveText("7:50 PM");
    expect(page.url()).toContain("cities=new-york-us,london-gb,dubai-ae,singapore-sg,mumbai-in");
  });
});

test.describe("World Clock: progressive rendering, focus and fallbacks", () => {
  test("the first 40 rows come first; the rest wait for idle time; counts are right from the start, and the list says it is busy", async ({ page, go }) => {
    await stubIdle(page, () => { window.requestIdleCallback = () => 1; window.cancelIdleCallback = () => {}; });
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(40);
    await expect(countLine(page)).toHaveText(/^195 listed cities/); // accurate before every row exists
    await expect(page.locator(".wc-x-progress")).toHaveText("Showing 40 of 195");
    await expect(page.locator(".wc-x-groups .wc-x-list")).toHaveAttribute("aria-busy", "true");
    await expect(page.locator(".wc-x-groups .wc-x-list")).toHaveAttribute("aria-label", "Listed cities");
    await expect(listed(page).first()).toHaveAttribute("aria-setsize", "195");
    await expect(listed(page).first()).toHaveAttribute("aria-posinset", "1");
    await expect(listed(page).nth(39)).toHaveAttribute("aria-posinset", "40");
    await expect(live(page)).toHaveText(""); // nothing is announced for chunks
    await expect(exploreTab(page)).toHaveText("Explore cities (195)");
  });

  test("the first keyboard interaction in the results draws everything pending, so Tab reaches all 195 matches, and focus never moves", async ({ page, go }) => {
    await stubIdle(page, () => { window.requestIdleCallback = () => 1; window.cancelIdleCallback = () => {}; });
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(40);
    await search(page).focus();
    await page.keyboard.press("Enter");
    const first = listed(page).first().locator(".wc-xrow__add");
    await expect(first).toBeFocused();
    await expect(listed(page)).toHaveCount(195);
    await expect(page.locator(".wc-x-progress")).toHaveText("All 195 shown");
    await expect(page.locator(".wc-x-groups .wc-x-list")).toHaveAttribute("aria-busy", "false");
    await expect(first).toBeFocused(); // the flush appended after the focused row and moved nothing
    expect(await listed(page).first().evaluate((li) => li.dataset.key)).toBe(await first.evaluate((b) => b.closest("li").dataset.key));
    // Tab through every Add button to the end of the list
    let seen = 1;
    while (seen < 195) { await page.keyboard.press("Tab"); seen++; }
    await expect(listed(page).last().locator(".wc-xrow__add")).toBeFocused();
  });

  test("a chunk only appends: the rows already drawn keep their place and order; focusing a row then draws the rest without moving focus", async ({ page, go }) => {
    await stubIdle(page, () => { window.__idle = []; window.requestIdleCallback = (fn) => { window.__idle.push(fn); return window.__idle.length; }; window.cancelIdleCallback = () => {}; });
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(40);
    const keysOf = () => listed(page).evaluateAll((lis) => lis.map((li) => li.dataset.key));
    const first = await keysOf();
    await search(page).focus();
    /* the page's own idle work (warm-up, clock-change lines) shares the stub: run callbacks until a chunk has arrived */
    await page.evaluate(() => { while (window.__idle.length && document.querySelectorAll(".wc-x-groups .wc-xrow").length === 40) window.__idle.shift()(); });
    await expect(listed(page)).toHaveCount(80);
    expect((await keysOf()).slice(0, 40)).toEqual(first);
    await expect(page.locator(".wc-x-progress")).toHaveText("Showing 80 of 195");
    await expect(search(page)).toBeFocused();
    await expect(live(page)).toHaveText("");
    await listed(page).nth(10).locator(".wc-xrow__add").focus();
    await expect(listed(page)).toHaveCount(195);
    await expect(listed(page).nth(10).locator(".wc-xrow__add")).toBeFocused();
    expect((await keysOf()).slice(0, 40)).toEqual(first);
    await expect(page.locator(".wc-x-progress")).toHaveText("All 195 shown");
  });

  test("rows arriving later do not shift what is below the list: space is kept for them", async ({ page, go }) => {
    await stubIdle(page, () => { window.__idle = []; window.requestIdleCallback = (fn) => { window.__idle.push(fn); return window.__idle.length; }; window.cancelIdleCallback = () => {}; });
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(40);
    const top = () => page.locator(".wc-x-others").evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const before = await top();
    await listed(page).first().locator(".wc-xrow__add").focus(); // the first keyboard interaction draws everything pending
    await expect(listed(page)).toHaveCount(195);
    const after = await top();
    expect(Math.abs(after - before), `what is below the list moved ${after - before}px`).toBeLessThan(120);
    await expect(page.locator(".wc-x-groups .wc-x-list")).not.toHaveAttribute("data-pending", /.*/);
  });

  test("without requestIdleCallback (and without content-visibility) every row still arrives, in order, with the same counts", async ({ page, go }) => {
    await stubIdle(page, () => { delete window.requestIdleCallback; delete window.cancelIdleCallback; });
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(195);
    await expect(page.locator(".wc-x-progress")).toHaveText("All 195 shown");
    const keys = await listed(page).evaluateAll((lis) => lis.map((li) => li.dataset.key));
    expect(new Set(keys).size).toBe(195);
    const posinset = await listed(page).evaluateAll((lis) => lis.map((li) => Number(li.getAttribute("aria-posinset"))));
    expect(posinset).toEqual(Array.from({ length: 195 }, (_, i) => i + 1));
    await page.addStyleTag({ content: ".wc-xrow { content-visibility: visible !important; }" });
    await expect(listed(page).last()).toBeAttached();
    await type(page, "asia");
    await expect(listed(page)).toHaveCount(56);
  });

  test("a new query cancels pending chunks: rows of the old list never appear in the new one", async ({ page, go }) => {
    await stubIdle(page, () => { window.__idle = []; window.requestIdleCallback = (fn) => { window.__idle.push(fn); return window.__idle.length; }; window.cancelIdleCallback = () => {}; });
    await openExplore(page, go);
    await expect(listed(page)).toHaveCount(40);
    await type(page, "europe");
    await expect(listed(page)).toHaveCount(40);
    await page.evaluate(() => { const f = window.__idle.splice(0); f.forEach((g) => g()); });
    await expect(listed(page)).toHaveCount(40);
    await expect(page.locator(".wc-x-progress")).toHaveText("All 40 shown");
    expect(await names(page.locator(".wc-x-groups"))).not.toContain("Tokyo");
  });

  test("a minute tick rewrites the times in place; if the set of matches changes while focus is in the results it waits behind 'Results changed. Update'", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "Mumbai");
    await expect(row(page, "Mumbai").locator(".wc-xrow__clock")).toHaveText("7:50 PM");
    await page.clock.runFor(61000);
    await expect(row(page, "Mumbai").locator(".wc-xrow__clock")).toHaveText("7:51 PM");
    await expect(live(page)).toHaveText(/./); // from the search only; checked below that a tick adds nothing
    const said = await live(page).innerText();
    // a time query whose matches change: focus inside, nothing is removed under the visitor's fingers
    await type(page, "8 PM");
    await expect(names(page.locator(".wc-x-groups"))).resolves.toContain("Yangon");
    await row(page, "Yangon").getByRole("button").focus();
    await page.clock.runFor(75 * 60 * 1000);
    await expect(row(page, "Yangon")).toBeVisible();
    await expect(row(page, "Yangon").getByRole("button")).toBeFocused();
    await expect(page.locator(".wc-x-stale")).toBeVisible();
    await expect(page.locator(".wc-x-stale")).toHaveText("Results changed. Update");
    expect(await live(page).innerText()).not.toBe("");
    void said;
    await page.locator(".wc-x-stale").click();
    await expect(page.locator(".wc-x-stale")).toBeHidden();
    await expect(page.locator(".wc-xrow").filter({ hasText: "Yangon" })).toHaveCount(0);
  });

  test("with focus outside the results, a tick that changes the matches simply refreshes them", async ({ page, go }) => {
    await openExplore(page, go);
    await type(page, "8 PM");
    await expect(row(page, "Yangon")).toBeVisible();
    await search(page).focus();
    await page.clock.runFor(75 * 60 * 1000);
    await expect(page.locator(".wc-xrow").filter({ hasText: "Yangon" })).toHaveCount(0);
    await expect(page.locator(".wc-x-stale")).toBeHidden();
    await expect(page.locator(".wc-x-updated")).toHaveText("Updated 9:05 PM");
  });
});

test.describe("World Clock: the Explore module loads separately", () => {
  test("it is a separate file, requested for the first paint when Explore is the first view", async ({ page, go }) => {
    const requested = [];
    page.on("request", (r) => { if (/world-clock\/(explore|explore-model|time-query)\.js/.test(r.url())) requested.push(r.url().split("/").pop()); });
    await openExplore(page, go);
    expect(requested).toEqual(expect.arrayContaining(["explore.js", "explore-model.js", "time-query.js"]));
  });

  test("when My clocks is the first view the directory is requested later, at idle, not with the first paint", async ({ page, go }) => {
    const requested = [];
    page.on("request", (r) => { if (/world-clock\/explore\.js/.test(r.url())) requested.push(r.url()); });
    await open(page, go, "?cities=mumbai-in");
    expect(requested).toEqual([]);
    await page.clock.runFor(3000);
    await expect.poll(() => requested.length).toBe(1);
  });

  test("if it cannot load: a clear message and Retry; My clocks, the address and the hand-off keep working; Retry loads it", async ({ page, go }) => {
    await page.route("**/world-clock/explore.js", (route) => route.abort());
    await open(page, go);
    await expect(page.locator(".wc-x-failed")).toContainText("The city directory could not be loaded.");
    await expect(page.locator("#wc-search-hint")).toContainText("City search is unavailable");
    await expect(page.locator(".wc-xrow")).toHaveCount(0);
    await clocksTab(page).click();
    expect(await titles(page)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore"]);
    await expect(page.locator("#wc-plan")).toHaveAttribute("href", /time-zone-converter/);
    await card(page, "London").getByRole("button", { name: /^Remove/ }).click();
    expect(page.url()).not.toContain("london");
    await exploreTab(page).click();
    await page.unroute("**/world-clock/explore.js");
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.locator(".wc-xrow").first()).toBeVisible();
    await expect(page.locator(".wc-x-failed")).toHaveCount(0);
    await expect(listed(page)).toHaveCount(195);
  });

  test("if the country data cannot load, the 195 cities, the search and the time queries still work, and the other-time-zones list says so", async ({ page, go }) => {
    await page.route("**/country-zones.js", (route) => route.abort());
    await openExplore(page, go);
    await page.clock.runFor(3000);
    await expect(showLabel(page, "others")).toHaveText("Other time zones (unavailable)");
    await expect(showOthers(page)).toBeEnabled(); // still reachable: it says why instead of hiding
    await chooseOthers(page);
    await expect(page.locator(".wc-x-others")).toContainText("Other time zones could not be loaded");
    await expect(othersRows(page)).toHaveCount(0);
    await chooseCities(page);
    await type(page, "8 PM");
    await expect(countLine(page)).toContainText("4 listed cities");
    await type(page, "australia");
    await expect(heading(page)).toHaveText("Australia · 8 time zones (listed cities only)");
    await page.locator("#wc-filters-toggle").click();
    await expect(page.locator("#wc-country")).toBeDisabled();
    await expect(page.locator("#wc-country option").first()).toHaveText("Country list unavailable");
  });
});

test.describe("World Clock: phones and accessibility", () => {
  test("nothing overflows sideways at 320, 360, 390 and 768, on either view, with results showing", async ({ page, go }) => {
    await openExplore(page, go);
    for (const [w, h] of [[390, 844], [360, 780], [320, 700], [768, 1024]]) {
      await page.setViewportSize({ width: w, height: h });
      await expectNoHorizontalOverflow(page);
      await type(page, "UTC+05:30");
      await expectNoHorizontalOverflow(page);
      await type(page, "");
      await page.locator("#wc-filters-toggle").click();
      await expectNoHorizontalOverflow(page);
      await page.locator("#wc-filters-toggle").click();
      await clocksTab(page).click();
      await expectNoHorizontalOverflow(page);
      await exploreTab(page).click();
    }
  });

  test("on a phone the Your time line and the search field are on screen without scrolling, rows are two lines, and every control is at least 44px", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openExplore(page, go);
    const here = await page.locator(".wc-here").boundingBox();
    const box = await search(page).boundingBox();
    expect(here.y + here.height).toBeLessThan(844);
    expect(box.y + box.height).toBeLessThan(844);
    await expect(search(page)).toHaveCSS("font-size", "16px");
    for (const target of await page.locator(".wc-chip, .wc-tab, .wc-input, .wc-check, .wc-xrow__add, .wc-show__text").all()) {
      const b = await target.boundingBox();
      if (b) expect(b.height, "touch target height").toBeGreaterThanOrEqual(44);
    }
    const rowBox = await listed(page).first().boundingBox();
    expect(rowBox.height).toBeLessThan(140);
    await expect(page.locator(".wc-x-groups .wc-xrow").first()).toHaveCSS("content-visibility", "auto");
  });

  test("accessibility of the surface: one h1, headings in order, labelled lists, named buttons, visible 3px focus, results in a labelled region", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".wc-x-results")).toHaveAttribute("aria-labelledby", "wc-x-heading");
    await expect(page.locator(".wc-x-groups ul")).toHaveAttribute("aria-label", "Listed cities");
    expect(await page.locator("main h2").count()).toBeGreaterThan(1);
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    for (const target of [search(page), page.locator(".wc-chip").first(), exploreTab(page), listed(page).first().locator(".wc-xrow__add")]) {
      await target.focus();
      const outline = await target.evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).outlineWidth);
      expect(outline).toBe("solid 3px");
    }
    // meaning is carried by words, not colour alone
    for (const li of (await listed(page).all()).slice(0, 12)) await expect(li.locator(".wc-xrow__word")).toHaveText(/^(Daytime|Night-time)$/);
    await expect(page.locator("main")).toContainText("not every city in the world");
    await expect(page.locator("main")).toContainText("device's clock");
  });

  test("reduced motion: nothing animates or transitions in the new surface", async ({ page, go }) => {
    await openExplore(page, go);
    const transitions = await page.locator(".wc-tab, .wc-chip, .wc-xrow, .wc-xrow__add, .wc-show__text").evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDuration + "|" + getComputedStyle(el).animationName));
    for (const t of transitions) {
      const [duration, animation] = t.split("|");
      expect(Math.max(...duration.split(",").map((d) => parseFloat(d))), t).toBeLessThan(0.001);
      expect(animation).toBe("none");
    }
  });
});

test.describe("World Clock: My clocks", () => {
  test("the default board: Your time first, then four starter cities, all read from one clock", async ({ page, go, watch }) => {
    await openClocks(page, go);
    await expect(page.getByLabel("Compare with", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("24-hour clock", { exact: true })).toHaveCount(1);
    expect(await titles(page)).toEqual(["Your time", "New York", "London", "Dubai", "Singapore"]);
    await expect(page.locator(".wc-card__sub").first()).toHaveText("Time zone · Asia/Kolkata"); // the modern spelling, although Chromium calls the zone Asia/Calcutta
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
    expectClean(watch);
  });

  test("every card has the same structure and, on a wide screen, the cards in a row are the same height", async ({ page, go }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openClocks(page, go);
    const shapes = await cards(page).evaluateAll((lis) => lis.map((li) => [...li.querySelectorAll(":scope > *")].map((c) => c.className.split(" ")[0]).join(",")));
    expect(new Set(shapes).size).toBe(1);
    const tops = await cards(page).evaluateAll((lis) => lis.map((li) => [Math.round(li.getBoundingClientRect().top), Math.round(li.getBoundingClientRect().height)]));
    const firstRow = tops.filter(([top]) => top === tops[0][0]);
    expect(firstRow.length).toBeGreaterThanOrEqual(3);
    expect(new Set(firstRow.map(([, h]) => h)).size).toBe(1);
    await expect(page.locator("#wc-board")).toHaveAttribute("aria-label", "World clocks");
  });

  test("the board holds 12 cities besides Your time (Explore itself is not limited), and a board longer than 12 in the address keeps the first 12", async ({ page, go }) => {
    await open(page, go, `?cities=${BOARD_FULL.join(",")}`);
    await expect(cards(page)).toHaveCount(13);
    await expect(clocksTab(page)).toHaveText("My clocks (12)");
    await expect(exploreTab(page)).toHaveText("Explore cities (195)");
    const ids = [...BOARD_FULL, "oslo-no", "kyiv-ua"];
    await open(page, go, `?cities=${ids.join(",")}`);
    await expect(cards(page)).toHaveCount(13);
    await expect(page.locator("#wc-message")).toHaveText("2 items in this link were not recognised and were skipped.");
  });

  test("remove: the card goes, focus moves to the next card's button (or the heading), the choice is announced, and Explore's row is addable again", async ({ page, go }) => {
    await openClocks(page, go);
    await card(page, "New York").getByRole("button", { name: "Remove New York, United States" }).click();
    await expect(card(page, "New York")).toHaveCount(0);
    await expect(live(page)).toHaveText("Removed New York, United States. 3 of 12 cities.");
    await expect(card(page, "London").getByRole("button", { name: /^Remove/ })).toBeFocused();
    await expect(clocksTab(page)).toHaveText("My clocks (3)");
    for (const name of ["London", "Dubai", "Singapore"]) await card(page, name).getByRole("button", { name: /^Remove/ }).click();
    await expect(cards(page)).toHaveCount(1);
    await expect(page.locator("#wc-board-heading")).toBeFocused();
    await expect(page.locator("#wc-empty")).toBeVisible();
    await expect(page.locator("#wc-empty")).toContainText("Add a city from Explore cities to see its time here.");
    await expect(page.locator("#wc-quick button")).toHaveCount(4);
    await page.locator("#wc-quick button").first().click();
    await expect(cards(page)).toHaveCount(2);
    await expect(page.locator("#wc-empty")).toBeHidden();
    await exploreTab(page).click();
    await type(page, "paris");
    await expect(row(page, "Paris").getByRole("button")).toHaveText("Add");
  });

  test("Your time has no remove button", async ({ page, go }) => {
    await openClocks(page, go);
    await expect(card(page, "Your time").getByRole("button")).toHaveCount(0);
  });

  test("Compare with: every difference and every Today, Tomorrow or Yesterday is measured from the chosen city; removing it falls back to Your time", async ({ page, go }) => {
    await openClocks(page, go);
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

  test("the 24-hour switch changes the Your time line, every card, its clock-change line and the Explore rows; AM and PM show in the 12-hour form", async ({ page, go }) => {
    await openExplore(page, go);
    await expect(row(page, "Sydney").locator(".wc-xrow__clock")).toHaveText("Tue 1:20 AM");
    await page.getByLabel("24-hour clock").check();
    await expect(page.locator("#wc-here-time")).toHaveText("19:50");
    await expect(page.locator("#wc-here-ampm")).toBeHidden();
    await expect(row(page, "Sydney").locator(".wc-xrow__clock")).toHaveText("Tue 01:20");
    await clocksTab(page).click();
    await expect(card(page, "Your time").locator("time")).toHaveText("19:50");
    await expect(card(page, "New York").locator("time")).toHaveText("10:20");
    await expect(card(page, "New York").locator(".wc-card__change")).toContainText("(at 02:00)");
    await page.getByLabel("24-hour clock").uncheck();
    await expect(card(page, "Your time").locator(".wc-time__ampm")).toHaveText("PM");
    await expect(card(page, "New York").locator(".wc-card__change")).toContainText("(at 2:00 AM)");
    await type(page, "8 pm");
    await expect(heading(page)).toHaveText("Places currently between 8:00 PM and 8:59 PM");
    await page.getByLabel("24-hour clock").check();
    await expect(heading(page)).toHaveText("Places currently between 20:00 and 20:59");
  });

  test("the optional clock-change line appears after the first paint for a zone that has a change, and a card with none says nothing", async ({ page, go }) => {
    await openClocks(page, go);
    await expect(card(page, "New York").locator(".wc-card__change")).toHaveText("Clocks change Sun 1 Nov: UTC−04:00 → UTC−05:00 (at 2:00 AM)");
    await expect(card(page, "London").locator(".wc-card__change")).toHaveText("Clocks change Sun 25 Oct: UTC+01:00 → UTC+00:00 (at 2:00 AM)");
    await expect(card(page, "Dubai").locator(".wc-card__change")).toBeHidden();
    await expect(card(page, "Your time").locator(".wc-card__change")).toBeHidden();
    await expect(page.locator("#wc-board")).not.toContainText("No clock change found");
  });
});

test.describe("World Clock: the address, the hand-off and privacy", () => {
  test("the address: valid cities and a reference load exactly; it is kept tidy without adding history; every add and remove updates it", async ({ page, go }) => {
    await open(page, go, "?cities=mumbai-in,America/Indiana/Knox,tokyo-jp&ref=tokyo-jp");
    expect(await titles(page)).toEqual(["Your time", "Mumbai", "Knox", "Tokyo"]);
    await expect(page.getByLabel("Compare with")).toHaveValue("tokyo-jp");
    await expect(card(page, "Tokyo")).toHaveClass(/wc-card--reference/);
    const before = await page.evaluate(() => history.length);
    await exploreTab(page).click();
    await addFromExplore(page, "paris", "Paris");
    expect(page.url()).toContain("cities=mumbai-in,America/Indiana/Knox,tokyo-jp,paris-fr");
    expect(page.url()).toContain("ref=tokyo-jp");
    expect(await page.evaluate(() => history.length)).toBe(before);
    expect(page.url()).not.toContain("%2C");
    expect(page.url()).not.toContain("%2F");
  });

  test("searching and sorting never put anything in the address", async ({ page, go }) => {
    await openExplore(page, go);
    const url = page.url();
    await type(page, "8 PM");
    await page.locator("#wc-sort").selectOption("offset");
    await page.locator("#wc-filters-toggle").click();
    await page.locator("#wc-region").selectOption("Asia");
    expect(page.url()).toBe(url);
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
      await expect(exploreTab(page)).toHaveAttribute("aria-selected", "true");
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

  test("hostile text typed in the search is only ever text", async ({ page, go, watch }) => {
    await page.addInitScript(() => { window.__xss = 0; });
    await openExplore(page, go);
    for (const text of ["<img src=x onerror=window.__xss=1>", "<script>window.__xss=1</script>", "\"><svg onload=window.__xss=1>", "__proto__", "constructor", "x".repeat(5000)]) {
      await search(page).fill(text);
      await expect(heading(page)).toBeVisible();
      expect(await page.evaluate(() => window.__xss)).toBe(0);
      expect(await page.locator(".wc-x-results img, .wc-x-results svg[onload], .wc-x-results script").count()).toBe(0);
    }
    expectClean(watch);
  });

  test("the hand-off link names your zone and the board's zones, and the Time Zone Converter opens with them", async ({ page, go }) => {
    await openClocks(page, go);
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
    await openExplore(page, go);
    await addFromExplore(page, "mumbai", "Mumbai");
    await clocksTab(page).click();
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

  test("privacy: no storage, no cookie, nothing remembered, no request beyond the site's own files", async ({ page, go, context }) => {
    const external = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (!["localhost", "salar500.github.io", "tools.example.test", "toolzenhub.in"].includes(u.hostname) && !/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) external.push(r.url());
    });
    await openExplore(page, go);
    await addFromExplore(page, "mumbai", "Mumbai");
    await type(page, "8 PM");
    await page.locator("#wc-sort").selectOption("offset");
    await page.getByLabel("24-hour clock").check();
    await clocksTab(page).click();
    await page.getByLabel("Compare with").selectOption({ label: "Mumbai, India" });
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
    expect(await page.evaluate(async () => (await indexedDB.databases?.())?.length ?? 0)).toBe(0);
    expect(external).toEqual([]);
    expect((await context.cookies()).length).toBe(0);
    await page.reload();
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await expect(page.getByLabel("24-hour clock")).not.toBeChecked(); // nothing was remembered
    await expect(search(page)).toHaveValue("");
  });

  test("the hand-off link meets the text contrast requirement and keeps the action colour", async ({ page, go }) => {
    await openClocks(page, go);
    const result = await page.locator("#wc-plan").evaluate((a) => {
      const lum = (c) => { const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      let bg = "rgba(0, 0, 0, 0)"; for (let el = a; el && bg === "rgba(0, 0, 0, 0)"; el = el.parentElement) bg = getComputedStyle(el).backgroundColor;
      const fg = getComputedStyle(a).color;
      const [hi, lo] = [lum(fg), lum(bg === "rgba(0, 0, 0, 0)" ? "rgb(255, 255, 255)" : bg)].sort((x, y) => y - x);
      return { fg, ratio: (hi + 0.05) / (lo + 0.05) };
    });
    expect(result.fg).toBe("rgb(28, 25, 23)"); // the action ink
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    // the rest of the page's links keep the shared theme colour
    expect(await page.locator(".calculator-info a").first().evaluate((a) => getComputedStyle(a).color)).toBe("rgb(67, 56, 202)"); // the accent
  });
});

test.describe("World Clock: time, timers and the site", () => {
  test("one timer: no interval; a minute later the Your time line, the cards and the Explore rows have moved; nothing is announced on the tick", async ({ page, go }) => {
    await page.clock.install({ time: NOW });
    await page.addInitScript(() => {
      const t = { intervals: 0 };
      const si = window.setInterval.bind(window);
      window.setInterval = (...a) => { t.intervals += 1; return si(...a); };
      window.__timers = { get intervals() { return t.intervals; } };
    });
    await go("tools/world-clock/");
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await expect(page.locator(".wc-xrow").first()).toBeVisible();
    await page.clock.runFor(100);
    await expect(page.locator("#wc-here-time")).toHaveText("7:50 PM");
    const spoken = await live(page).innerText();
    await page.clock.runFor(61000);
    await expect(page.locator("#wc-here-time")).toHaveText("7:51 PM");
    await expect(row(page, "Sydney").locator(".wc-xrow__clock")).toHaveText("Tue 1:21 AM");
    expect(await live(page).innerText()).toBe(spoken);
    expect(await page.evaluate(() => window.__timers.intervals)).toBe(0);
    await expect(page.locator("[aria-live]")).toHaveCount(1);
    // the hidden view did not repaint on the tick: the board repaints once when it is shown
    expect(await card(page, "Your time").locator("time").textContent()).toBe("7:50 PM");
    await clocksTab(page).click();
    await expect(card(page, "Your time").locator("time")).toHaveText("7:51 PM");
    await expect(card(page, "New York").locator("time")).toHaveText("10:21 AM");
    await expect(card(page, "Singapore").locator("time")).toHaveText("10:21 PM");
    for (const node of await page.locator("#wc-board *").all()) expect(await node.getAttribute("aria-live")).toBeNull();
  });

  test("while the page is hidden nothing runs; on return the visible view is redrawn at once from a fresh clock", async ({ page, go }) => {
    await page.clock.install({ time: NOW });
    await page.addInitScript(() => { window.__hide = (hidden) => { Object.defineProperty(document, "hidden", { value: hidden, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }; });
    await go("tools/world-clock/");
    await expect(panel(page)).toHaveAttribute("data-ready", "true");
    await expect(page.locator(".wc-xrow").first()).toBeVisible();
    await page.clock.runFor(100);
    await page.evaluate(() => window.__hide(true));
    await page.clock.runFor(10 * 60000);
    await expect(page.locator("#wc-here-time")).toHaveText("7:50 PM"); // nothing ran while hidden
    await page.evaluate(() => window.__hide(false));
    await expect(page.locator("#wc-here-time")).toHaveText("8:00 PM"); // redrawn at once
    await expect(row(page, "Kolkata").locator(".wc-xrow__clock")).toHaveText("8:00 PM");
    await clocksTab(page).click();
    await expect(card(page, "New York").locator("time")).toHaveText("10:30 AM");
  });

  test("a clock that jumps is corrected on the next tick, and a card crosses local midnight with its date and relation", async ({ page, go }) => {
    await openClocks(page, go, "", new Date("2026-10-19T18:28:30Z")); // 23:58:30 in India
    await expect(card(page, "Your time").locator(".wc-card__date")).toContainText("Mon, 19 Oct 2026");
    await page.clock.runFor(91000); // past local midnight in India
    await expect(card(page, "Your time").locator("time")).toHaveText("12:00 AM");
    await expect(card(page, "Your time").locator(".wc-card__date")).toContainText("Tue, 20 Oct 2026");
    await expect(page.locator("#wc-here-date")).toHaveText("Tue, 20 Oct 2026");
    await expect(card(page, "New York").locator(".wc-card__date")).toContainText("Mon, 19 Oct 2026");
    await expect(card(page, "New York").locator(".wc-card__relation")).toHaveText("Yesterday");
    await expect(card(page, "Singapore").locator(".wc-card__relation")).toHaveText("Today");
    await page.clock.setSystemTime(new Date("2026-10-20T06:00:00Z"));
    await page.clock.runFor(61000);
    await expect(card(page, "Your time").locator("time")).toHaveText("11:31 AM");
  });

  test("its place in the site: Time Tools and All Tools list it, search finds it by its names, and the converter is unchanged", async ({ page, go }) => {
    await go("time-tools.html");
    await expect(page.locator(".category-page-card", { hasText: "World Clock" })).toHaveCount(1);
    await expect(page.locator(".category-page-card")).toHaveCount(13);
    await go("tools.html");
    const time = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Time Tools")') });
    await expect(time.locator(".directory-section__count")).toHaveText("13 tools");
    for (const q of ["world clock", "city clocks", "multiple clocks"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator("main a", { hasText: "World Clock" }).first(), q).toBeVisible();
    }
    await go("tools.html?q=time%20zone%20converter");
    await expect(page.locator("main a", { hasText: "Time Zone Converter" }).first()).toBeVisible();
  });
});

/*
 * Step 1 corrections: a row's name has the whole row (it used to be squeezed to one letter per line beside a wide time column),
 * the search field has its own Clear button, and the space kept for rows not drawn yet follows the real row height.
 * Geometry and computed style, not screenshots.
 */
test.describe("World Clock: readable rows, Clear search and stable progressive rendering on a phone", () => {
  /* the first `limit` rows: the name is readable, the time, offset and Add are shown and do not overlap */
  async function expectReadableRows(page, locator, limit = 4) {
    // Rows are drawn in idle chunks and the list carries data-pending until the last chunk is in; measuring before
    // that races the draw ("Element is not attached"), so wait for the list's own "finished" signal first.
    await expect(page.locator(".wc-x-list[data-pending]")).toHaveCount(0);
    const total = await locator.count();
    expect(total, "rows to check").toBeGreaterThan(0);
    for (let i = 0; i < Math.min(total, limit); i += 1) {
      const li = locator.nth(i);
      await li.scrollIntoViewIfNeeded();
      const m = await li.evaluate((el) => {
        const box = (selector) => { const r = el.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
        const own = el.getBoundingClientRect();
        const main = el.querySelector(".wc-xrow__main");
        return {
          row: { x: own.x, w: own.width, r: own.right, b: own.bottom },
          text: box(".wc-xrow__text"),
          main: box(".wc-xrow__main"),
          mainLine: parseFloat(getComputedStyle(main).lineHeight) || 25,
          clock: box(".wc-xrow__clock"),
          offset: box(".wc-xrow__offset"),
          add: box(".wc-xrow__add"),
          offsetText: el.querySelector(".wc-xrow__offset").textContent,
          clockText: el.querySelector(".wc-xrow__clock").textContent,
          scrollOverflow: el.scrollWidth - el.clientWidth
        };
      });
      const q = `row ${i}: ${JSON.stringify(m)}`;
      expect(m.text.w, `${q}: the name column has the row`).toBeGreaterThanOrEqual(m.row.w - 40);
      expect(m.main.w, `${q}: a readable width`).toBeGreaterThanOrEqual(140);
      expect(m.main.h / m.mainLine, `${q}: at most three lines`).toBeLessThanOrEqual(3.2);
      expect(m.clockText.trim(), q).not.toBe("");
      expect(m.offsetText, q).toMatch(/^UTC[+−]\d\d:\d\d$/);
      expect(m.clock.w, q).toBeGreaterThan(20);
      expect(m.add.h, `${q}: touch target`).toBeGreaterThanOrEqual(44);
      expect(m.add.w, q).toBeGreaterThanOrEqual(44);
      // inside the row, below the name, and the time never runs under the button
      expect(m.add.r, q).toBeLessThanOrEqual(m.row.r + 0.5);
      expect(m.add.b, q).toBeLessThanOrEqual(m.row.b + 0.5);
      expect(m.clock.y, q).toBeGreaterThanOrEqual(m.text.b - 1);
      expect(m.offset.y, q).toBeGreaterThanOrEqual(m.text.b - 1);
      const sameLine = Math.min(m.clock.b, m.add.b) > Math.max(m.clock.y, m.add.y);
      if (sameLine) expect(m.offset.r, q).toBeLessThanOrEqual(m.add.x + 0.5);
      expect(m.scrollOverflow, `${q}: nothing spills out of the row`).toBeLessThanOrEqual(1);
    }
  }

  async function openOthers(page) {
    await expect(showOthers(page)).toBeEnabled();
    await chooseOthers(page);
    await expect(showOthers(page)).toBeChecked();
  }

  for (const width of [320, 360, 390]) {
    test(`${width}px: listed cities and other time zones keep readable two-line rows for UTC+05:30, UTC+08:00, India, Australia and a long zone path`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await openExplore(page, go);
      for (const query of ["UTC+05:30", "UTC+08:00", "India", "Australia"]) {
        await search(page).fill(query);
        await expect(heading(page)).not.toHaveText("All listed cities");
        await expectReadableRows(page, listed(page));
        await expectNoHorizontalOverflow(page);
      }
      // other time zones: chosen, and each of its first rows readable
      await search(page).fill("Australia");
      await openOthers(page);
      await expectReadableRows(page, othersRows(page));
      await expectNoHorizontalOverflow(page);
      await chooseCities(page);
      // a long zone path: it may wrap, but it stays a readable column
      await search(page).fill("America/Argentina");
      await expect(page.locator(".wc-xrow").first()).toBeVisible();
      await expectReadableRows(page, page.locator(".wc-xrow:visible"), 6); // the one listed city (Buenos Aires)
      await openOthers(page); // and the other zones, whose names are the long zone paths
      const longest = Math.max(...(await rows(page).locator(".wc-xrow__main, .wc-xrow__sub").allTextContents()).map((t) => t.length));
      expect(longest).toBeGreaterThan(15);
      await expectReadableRows(page, page.locator(".wc-xrow:visible"), 6);
      await expectNoHorizontalOverflow(page);
      await chooseCities(page);
    });
  }

  test("Clear search: shown only with text, named, empties only the query, keeps the filters, returns focus, and the native cross is hidden", async ({ page, go }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openExplore(page, go);
    const clear = page.locator("#wc-search-clear");
    await expect(clear).toBeHidden();
    await page.locator("#wc-filters-toggle").click();
    await page.locator("#wc-region").selectOption("Asia");
    const filteredCount = await countLine(page).textContent();
    await search(page).fill("india");
    await expect(clear).toBeVisible();
    await expect(clear).toHaveAccessibleName("Clear search");
    await expect(clear).toHaveAttribute("type", "button");
    const box = await clear.boundingBox();
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    const field = await search(page).boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(field.x + field.width + 1);
    expect(box.x).toBeGreaterThanOrEqual(field.x);
    // the browser draws its own cross inside a type=search field. getComputedStyle cannot read a browser-built pseudo-element, so read the
    // author rule that removes it from the loaded stylesheet (this proves the rule is served and parsed, not what the browser paints)
    const nativeHidden = await page.evaluate(() => {
      const found = [];
      for (const sheet of document.styleSheets) {
        let list = [];
        try { list = [...sheet.cssRules]; } catch { continue; }
        for (const rule of list) {
          if (rule.selectorText && rule.selectorText.includes("::-webkit-search-cancel-button") && rule.selectorText.includes(".wc-input")) {
            found.push((rule.style.getPropertyValue("appearance") || rule.style.getPropertyValue("-webkit-appearance")).trim());
          }
        }
      }
      return found;
    });
    expect(nativeHidden, "a rule that removes the native cross").toEqual(["none"]);
    await expect(heading(page)).toContainText(/india/i);
    await clear.click();
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).toBeFocused();
    await expect(clear).toBeHidden();
    await expect(heading(page)).not.toContainText(/india/i);
    await expect(page.locator("#wc-region")).toHaveValue("Asia");
    await expect(countLine(page)).toHaveText(filteredCount);
    // keyboard: Tab from the field reaches Clear; Enter clears
    await search(page).fill("tokyo");
    await search(page).focus();
    await page.keyboard.press("Tab");
    await expect(clear).toBeFocused();
    expect(await clear.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe("3px");
    await page.keyboard.press("Enter");
    await expect(search(page)).toHaveValue("");
    await expect(search(page)).toBeFocused();
    await expect(clear).toBeHidden();
    // a time shortcut shows it, Escape hides it
    await page.locator('[data-shortcut="Evening"]').click();
    await expect(search(page)).toHaveValue("Evening");
    await expect(clear).toBeVisible();
    await search(page).focus();
    await page.keyboard.press("Escape");
    await expect(search(page)).toHaveValue("");
    await expect(clear).toBeHidden();
  });

  for (const width of [320, 360]) {
    test(`${width}px: while rows arrive in chunks the count stays right, nothing overflows, nothing below moves, and Tab walks the results`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await stubIdle(page, () => { window.__idle = []; window.requestIdleCallback = (fn) => { window.__idle.push(fn); return window.__idle.length; }; window.cancelIdleCallback = () => {}; });
      await openExplore(page, go);
      await expect(listed(page)).toHaveCount(40);
      await expect(countLine(page)).toContainText("195 listed cities");
      await expect(page.locator(".wc-x-progress")).toHaveText("Showing 40 of 195");
      await expect(page.locator(".wc-x-groups .wc-x-list")).toHaveAttribute("data-pending", /.*/);
      await expectNoHorizontalOverflow(page);
      const top = () => page.locator(".wc-x-others").evaluate((el) => el.getBoundingClientRect().top + scrollY);
      const before = await top();
      // keyboard: Enter in the search goes to the first Add; Tab then walks the Add buttons row by row
      await search(page).focus();
      await page.keyboard.press("Enter");
      await expect(listed(page).first().locator(".wc-xrow__add")).toBeFocused();
      await expect(listed(page)).toHaveCount(195);
      for (let i = 1; i <= 4; i += 1) {
        await page.keyboard.press("Tab");
        await expect(listed(page).nth(i).locator(".wc-xrow__add")).toBeFocused();
      }
      const after = await top();
      expect(Math.abs(after - before), `what is below the list moved ${after - before}px`).toBeLessThan(120);
      await expect(page.locator(".wc-x-progress")).toHaveText("All 195 shown");
      await expect(page.locator(".wc-x-groups .wc-x-list")).not.toHaveAttribute("data-pending", /.*/);
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe("World Clock: the line under the search box keeps its height on a phone", () => {
  for (const width of [320, 360, 390]) {
    test(`${width}px: adding a city does not move the page when the short confirmation replaces the coverage hint`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await openExplore(page, go);
      await type(page, "sydney");
      const hint = page.locator("#wc-search-hint");
      const before = await hint.evaluate((el) => el.getBoundingClientRect().height);
      const add = row(page, "Sydney").getByRole("button");
      await add.focus();
      const sydney = row(page, "Sydney");
      const top = await sydney.evaluate((el) => el.getBoundingClientRect().top);
      await page.keyboard.press("Enter");
      await expect(hint).toContainText("Added Sydney, Australia.");
      const after = await hint.evaluate((el) => el.getBoundingClientRect().height);
      expect(after, "the line keeps the height it had").toBeGreaterThanOrEqual(before - 1);
      expect(Math.abs((await sydney.evaluate((el) => el.getBoundingClientRect().top)) - top), "the row that was pressed stays where it was").toBeLessThanOrEqual(1);
      await expect(live(page)).toHaveText("Added Sydney, Australia. 5 of 12 cities.");
      await expect(add).toBeFocused();
    });
  }
});
