/**
 * Tool Pack 16: Unix Timestamp Converter and its place in Developer Tools.
 *
 * The engine's rules (units, precision, zones, daylight saving, batch) are covered by tests/unit/unix-timestamp.test.mjs against an
 * independent Python reference; here the page is checked. The browser's time zone is fixed so "local" is the same everywhere, and the
 * live clock is driven by Playwright's fake clock (installed and paused, so time moves only when a test says).
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

test.use({ timezoneId: "Asia/Kolkata", locale: "en-US" });

const input = (page) => page.locator("#ts-input");
const unit = (page) => page.locator("#ts-unit");
const zoneSelect = (page) => page.locator("#ts-zone");
const aOut = (page) => page.locator("#ts-a-out");
const bOut = (page) => page.locator("#ts-b-out");
const date = (page) => page.locator("#ts-date");
const batch = (page) => page.locator("#ts-batch");
const live = (page) => page.locator("#ts-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

/* the value text of a result row, found by its label */
const val = (scope, label) => scope.locator(".ts-row", { has: scope.page().locator(`dt:text-is("${label}")`) }).locator(".ts-row__text").first();

async function open(page, go) {
  await go("tools/unix-timestamp-converter/");
  await expect(page.locator("#ts-panel")).toHaveAttribute("data-ready", "true");
}

async function openFrozen(page, go) {
  await page.clock.install({ time: new Date("2026-03-10T09:59:59Z") });
  await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z"));
  await go("tools/unix-timestamp-converter/");
  await expect(page.locator("#ts-panel")).toHaveAttribute("data-ready", "true");
}

const NOW_SECONDS = Math.floor(Date.parse("2026-03-10T10:00:01Z") / 1000);

test.describe("Unix Timestamp Converter", () => {
  test("page, breadcrumb, labels and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Unix Timestamp Converter");
    await expect(page.locator("h1")).toHaveCount(1);
    const crumbs = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(crumbs).toEqual(["Home", "Developer Tools", "Unix Timestamp Converter"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}developer-tools.html`]);
    for (const label of ["Unix timestamp", "Date and time", "Time zone", "Timestamps, one per line, or paste log lines"]) await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Unit", { exact: true })).toHaveCount(2);
    await expect(zoneSelect(page)).toHaveValue(/^Asia\/(Kolkata|Calcutta)$/);
    await expect(page.locator("#ts-now-zone")).toContainText("UTC+05:30");
    await expect(aOut(page)).toBeHidden();
    await expect(page.locator("#ts-board")).toBeHidden();
    await expect(page.locator(".related-section")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("Your timestamps and dates are processed in your browser");
    await expect(page.locator("main")).not.toContainText(/\bbest\b|ultimate|most accurate|AI-powered|smart/i);
    expectClean(watch);
  });

  test("live now: once a second, never announced, copy takes the exact moment, and it rests in a hidden tab", async ({ page, go }) => {
    await openFrozen(page, go);
    const seconds = page.locator("#ts-now-seconds");
    await expect(seconds).toHaveText(String(NOW_SECONDS));
    await expect(seconds).toHaveAttribute("role", "timer");
    await expect(seconds).toHaveAttribute("aria-live", "off");
    await expect(page.locator("#ts-now-ms")).toHaveText(String(NOW_SECONDS * 1000));

    // the display changes once a second, on the second, and nothing is announced
    await page.clock.runFor(1100); // the repaint is due 15 ms after the second changes
    await expect(seconds).toHaveText(String(NOW_SECONDS + 1));
    await page.clock.runFor(3000);
    await expect(seconds).toHaveText(String(NOW_SECONDS + 4));
    await expect(live(page)).toHaveText("");

    // writes to the page are about one a second, not one per frame
    await page.evaluate(() => {
      window.__mutations = 0;
      new MutationObserver((list) => { window.__mutations += list.length; }).observe(document.querySelector("#ts-now-seconds").closest(".ts-now"), { subtree: true, childList: true, characterData: true });
    });
    await page.clock.runFor(10_000);
    const writes = await page.evaluate(() => window.__mutations);
    expect(writes).toBeGreaterThanOrEqual(10);
    expect(writes).toBeLessThanOrEqual(40);

    // copy takes the exact value at the click (the test origin is plain http, so this uses the fallback copy)
    await page.clock.runFor(500);
    await btn(page, "Copy seconds").click();
    await expect(btn(page, "Copied")).toHaveCount(1);
    await expect(live(page)).toHaveText("Copied Unix seconds.", { timeout: 2000 }).catch(async () => {
      await page.clock.runFor(100);
      await expect(live(page)).toHaveText("Copied Unix seconds.");
    });
    await batch(page).focus();
    await batch(page).press("Control+V");
    await expect(batch(page)).toHaveValue(String(NOW_SECONDS + 14));
    await batch(page).fill("");

    // a hidden tab does no work; coming back catches up at once
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { value: true, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const before = await seconds.innerText();
    await page.clock.runFor(30_000);
    await expect(seconds).toHaveText(before);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { value: false, configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(seconds).toHaveText(String(NOW_SECONDS + 44));
  });

  test("Convert now fills the converter with the current second", async ({ page, go }) => {
    await openFrozen(page, go);
    await btn(page, "Convert now").click();
    await expect(input(page)).toHaveValue(String(NOW_SECONDS));
    await expect(unit(page)).toHaveValue("s");
    await expect(val(aOut(page), "UTC")).toHaveText("2026-03-10T10:00:01Z");
    await expect(val(aOut(page), "Relative")).toHaveText("now");
  });

  test("timestamp to date: UTC, the zone, the unit and its reason, exact Unix values, a relative time", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("1700000000");
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-14T22:13:20Z");
    await expect(page.locator("#ts-a-out .ts-row__label", { hasText: /^Asia\/(Kolkata|Calcutta) \(your local time\)$/ })).toHaveCount(1);
    await expect(aOut(page).locator(".ts-row__text", { hasText: "Wednesday, 15 November 2023 at 03:43:20" })).toHaveCount(1);
    await expect(aOut(page)).toContainText("2023-11-15T03:43:20+05:30 · UTC+05:30");
    await expect(val(aOut(page), "Unit")).toHaveText("seconds");
    await expect(aOut(page)).toContainText("10 digits: up to 10 digits are read as seconds");
    await expect(val(aOut(page), "Unix seconds")).toHaveText("1700000000");
    await expect(val(aOut(page), "Unix milliseconds")).toHaveText("1700000000000");
    await expect(val(aOut(page), "Relative")).toContainText(/ago$/);
    await expect(page.locator("#ts-a-error")).toBeHidden();
  });

  test("units: milliseconds, microseconds and nanoseconds, with every digit kept; negative and fractional values", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("1700000000123");
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-14T22:13:20.123Z");
    await expect(val(aOut(page), "Unit")).toHaveText("milliseconds");
    await input(page).fill("1700000000123456");
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-14T22:13:20.123456Z");
    await input(page).fill("1700000000123456789");
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-14T22:13:20.123456789Z");
    await expect(val(aOut(page), "Unix milliseconds")).toHaveText("1700000000123.456789");
    await expect(val(aOut(page), "Unix seconds")).toHaveText("1700000000.123456789");
    await input(page).fill("-1");
    await expect(val(aOut(page), "UTC")).toHaveText("1969-12-31T23:59:59Z");
    await input(page).fill("-1.5");
    await expect(val(aOut(page), "UTC")).toHaveText("1969-12-31T23:59:58.5Z");
    await input(page).fill("  1700000000  ");
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-14T22:13:20Z");
  });

  test("ambiguous units are shown and chosen, never guessed; a lone possible reading says why", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("170000000012");
    await expect(aOut(page)).toContainText("Which unit is this?");
    await expect(aOut(page)).toContainText("12 digits could be seconds or milliseconds");
    await expect(aOut(page)).toContainText("As seconds: 7357-01-31T14:13:32Z");
    await expect(aOut(page)).toContainText("As milliseconds: 1975-05-22T14:13:20.012Z");
    await expect(aOut(page).locator(".ts-row")).toHaveCount(0); // nothing is converted until the user chooses
    await expect(page.locator("#ts-board")).toBeHidden();
    await btn(page, "Use milliseconds").click();
    await expect(unit(page)).toHaveValue("ms");
    await expect(unit(page)).toBeFocused();
    await expect(val(aOut(page), "UTC")).toHaveText("1975-05-22T14:13:20.012Z");
    await expect(aOut(page)).toContainText("You chose milliseconds");
    await unit(page).selectOption("auto");
    await input(page).fill("999999999999");
    await expect(val(aOut(page), "UTC")).toHaveText("2001-09-09T01:46:39.999Z");
    await expect(aOut(page)).toContainText("as seconds it is outside the supported range, so it is read as milliseconds");
  });

  test("errors: specific, shown after a pause, the input stays editable, fixing it clears them", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("1.7e9");
    await expect(page.locator("#ts-a-error")).toContainText("Scientific notation is not accepted", { timeout: 4000 });
    await expect(input(page)).toHaveAttribute("aria-invalid", "true");
    await expect(input(page)).toHaveAttribute("aria-describedby", /ts-a-error/);
    await expect(aOut(page)).toBeHidden();
    await expect(input(page)).toHaveValue("1.7e9");
    await input(page).fill("1700000000");
    await expect(page.locator("#ts-a-error")).toBeHidden();
    await expect(input(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-14T22:13:20Z");
    for (const [text, message] of [["253402300800", null], ["1,700,000,000", /separators/], ["2023-11-14", /looks like a date/], ["12345678901234567890123", /choose Nanoseconds/]]) {
      await input(page).fill(text);
      await input(page).press("Enter");
      if (message) await expect(page.locator("#ts-a-error"), text).toContainText(message);
    }
    await unit(page).selectOption("s");
    await input(page).fill("253402300800");
    await input(page).press("Enter");
    await expect(page.locator("#ts-a-error")).toContainText("after 9999-12-31T23:59:59Z");
  });

  test("an error is not flashed while typing a value that is valid at each step", async ({ page, go }) => {
    await open(page, go);
    await input(page).pressSequentially("17000000", { delay: 30 });
    await expect(page.locator("#ts-a-error")).toBeHidden();
    await expect(val(aOut(page), "UTC")).toHaveText("1970-07-16T18:13:20Z");
  });

  test("the same instant in other zones: UTC and local always, add, remove, no duplicates, a limit", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("1700000000");
    const rows = page.locator("#ts-board-rows tr");
    await expect(page.locator("#ts-board")).toBeVisible();
    await expect(rows.first().locator("th")).toHaveText("UTC");
    await expect(rows.nth(1).locator("th")).toContainText("Your local time");
    const ny = rows.filter({ has: page.locator('th:text-is("America/New_York")') });
    await expect(ny.locator("td").first()).toHaveText("Tuesday, 14 November 2023 at 17:13:20");
    await expect(ny.locator("td").nth(1)).toHaveText("UTC-05:00");
    const tokyo = rows.filter({ has: page.locator('th:text-is("Asia/Tokyo")') });
    await expect(tokyo.locator("td").first()).toHaveText("Wednesday, 15 November 2023 at 07:13:20");
    // add, no duplicate, remove
    await page.locator("#ts-board-add").selectOption("Australia/Sydney");
    await btn(page, "Add").click();
    await expect(rows.filter({ has: page.locator('th:text-is("Australia/Sydney")') }).locator("td").first()).toHaveText("Wednesday, 15 November 2023 at 09:13:20");
    const count = await rows.count();
    await btn(page, "Add").click();
    await expect(rows).toHaveCount(count);
    await expect(live(page)).toContainText("already shown");
    await page.getByRole("button", { name: "Remove Asia/Tokyo" }).click();
    await expect(tokyo).toHaveCount(0);
    // the limit
    for (const z of ["Pacific/Auckland", "Asia/Dubai", "America/Chicago", "Africa/Johannesburg", "Europe/Paris", "Asia/Singapore"]) {
      if (await btn(page, "Add").isDisabled()) break;
      await page.locator("#ts-board-add").selectOption(z);
      await btn(page, "Add").click();
    }
    await expect(btn(page, "Add")).toBeDisabled();
    await expect(page.locator("#ts-board-note")).toContainText("The most time zones you can add is 6");
    await expect(page.locator("#ts-board-rows tr")).toHaveCount(2 + 6);
    // and the board follows the instant
    await input(page).fill("0");
    await expect(rows.filter({ has: page.locator('th:text-is("Europe/London")') }).locator("td").first()).toHaveText("Thursday, 1 January 1970 at 01:00:00");
    await input(page).fill("");
    await expect(page.locator("#ts-board")).toBeHidden();
  });

  test("changing the time zone updates the results", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("1700000000");
    await zoneSelect(page).selectOption("America/New_York");
    await expect(aOut(page).locator(".ts-row__label", { hasText: /^America\/New_York$/ })).toHaveCount(1);
    await expect(aOut(page).locator(".ts-row__text", { hasText: "Tuesday, 14 November 2023 at 17:13:20" })).toHaveCount(1);
    await expect(aOut(page)).toContainText("2023-11-14T17:13:20-05:00 · UTC-05:00");
    await expect(aOut(page).locator(".ts-row__label", { hasText: /^Your local time/ })).toHaveCount(1);
    await zoneSelect(page).selectOption("UTC");
    await expect(aOut(page).locator(".ts-row__label", { hasText: /^America\/New_York$/ })).toHaveCount(0);
  });

  test("date to timestamp: explicit offset, the selected zone, RFC 2822, the picker; nothing fuzzy", async ({ page, go }) => {
    await open(page, go);
    await date(page).fill("2023-11-14T22:13:20Z");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1700000000");
    await expect(val(bOut(page), "Unix milliseconds")).toHaveText("1700000000000");
    await expect(bOut(page)).toContainText("includes its own offset, so the time zone selection is not used");
    await date(page).fill("2023-11-15 03:43:20");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1700000000");
    await expect(bOut(page)).toContainText(/Read in Asia\/(Kolkata|Calcutta) \(UTC\+05:30\)/);
    await expect(val(bOut(page), "Offset used")).toHaveText("UTC+05:30");
    await date(page).fill("Tue, 14 Nov 2023 22:13:20 +0000");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1700000000");
    await date(page).fill("2023-11-14");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1699900200");
    await expect(bOut(page)).toContainText("No time was given, so midnight (00:00:00) is used");
    await date(page).fill("2023-11-14T22:13:20.123456789Z");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1700000000.123456789");
    for (const [text, message] of [["tomorrow evening", /Natural-language dates are not accepted/], ["11/14/2023", /ambiguous/], ["2023-02-29", /does not have a day 29/], ["2023-11-14T23:59:60Z", /leap second/], ["1700000000", /That is a Unix timestamp/]]) {
      await date(page).fill(text);
      await date(page).press("Enter");
      await expect(page.locator("#ts-b-error"), text).toContainText(message);
      await expect(bOut(page)).toBeHidden();
    }
    await page.locator("#ts-date-pick").fill("2023-11-15T03:43:20");
    await expect(date(page)).toHaveValue("2023-11-15 03:43:20");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1700000000");
  });

  test("a daylight-saving GAP is named, not shifted: no result until the user corrects it", async ({ page, go }) => {
    await open(page, go);
    await zoneSelect(page).selectOption("America/New_York");
    await date(page).fill("2023-03-12 02:30:00");
    await date(page).press("Enter");
    const error = page.locator("#ts-b-error");
    await expect(error).toContainText("This local time does not exist in the selected time zone because of a daylight-saving transition.");
    await expect(error).toContainText("At that moment the clocks in America/New_York went from 01:59:59 (UTC-05:00) to 03:00:00 (UTC-04:00) on 2023-03-12.");
    await expect(error).toContainText("Choose a time that exists, or include an offset");
    await expect(bOut(page)).toBeHidden();
    await expect(date(page)).toHaveAttribute("aria-invalid", "true");
    await expect(date(page)).toHaveValue("2023-03-12 02:30:00"); // the input is left as it was
    await date(page).fill("2023-03-12 03:30:00");
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1678606200");
    await expect(error).toBeHidden();
  });

  test("a daylight-saving OVERLAP shows both instants, earlier and later, and chooses neither", async ({ page, go }) => {
    await open(page, go);
    await zoneSelect(page).selectOption("America/New_York");
    await date(page).fill("2023-11-05 01:30:00");
    await expect(bOut(page)).toContainText("This local time happens twice");
    await expect(bOut(page)).toContainText("Both instants are shown; neither is chosen for you");
    const groups = bOut(page).locator(".ts-instant");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0).locator("h3")).toHaveText("Earlier occurrence (UTC-04:00)");
    await expect(val(groups.nth(0), "Unix seconds")).toHaveText("1699162200");
    await expect(val(groups.nth(0), "UTC")).toHaveText("2023-11-05T05:30:00Z");
    await expect(groups.nth(1).locator("h3")).toHaveText("Later occurrence (UTC-05:00)");
    await expect(val(groups.nth(1), "Unix seconds")).toHaveText("1699165800");
    await expect(val(groups.nth(1), "UTC")).toHaveText("2023-11-05T06:30:00Z");
    // each can be opened in the converter
    await groups.nth(1).getByRole("button", { name: "Show in Timestamp to date" }).click();
    await expect(input(page)).toHaveValue("1699165800");
    await expect(input(page)).toBeFocused();
    await expect(val(aOut(page), "UTC")).toHaveText("2023-11-05T06:30:00Z");
    await expect(page.locator("#ts-board")).toBeVisible();
    // an offset in the text removes the question
    await date(page).fill("2023-11-05 01:30:00-04:00");
    await expect(bOut(page).locator(".ts-instant")).toHaveCount(1);
    await expect(val(bOut(page), "Unix seconds")).toHaveText("1699162200");
  });

  test("batch: values, log lines, mixed units, an ambiguous value and a line with nothing are each shown; nothing aborts", async ({ page, go }) => {
    await open(page, go);
    await batch(page).fill([
      "1700000000",
      "",
      "2023-11-14 22:13:20 INFO ts=1700000000123 user=42 order=12345",
      "no timestamp here",
      "12345678901",
      "1700000000123456789",
      "   ",
    ].join("\n"));
    const rows = page.locator("#ts-batch-rows tr");
    await expect(rows).toHaveCount(5);
    await expect(page.locator("#ts-batch-status")).toHaveText("3 converted, 2 not converted.");
    await expect(rows.nth(0).locator("td").nth(2)).toHaveText("2023-11-14T22:13:20Z");
    await expect(rows.nth(0).locator("td").nth(3)).toHaveText("2023-11-15T03:43:20+05:30");
    await expect(rows.nth(1).locator("th")).toHaveText("3"); // the source line number
    await expect(rows.nth(1).locator("td").first()).toHaveText("1700000000123");
    await expect(rows.nth(1).locator("td").nth(1)).toHaveText("milliseconds");
    await expect(rows.nth(2)).toContainText("Not converted: No timestamp found in this line");
    await expect(rows.nth(3)).toContainText("Not converted: Ambiguous unit: 11 digits could be seconds or milliseconds. Choose a unit above.");
    await expect(rows.nth(4).locator("td").nth(1)).toHaveText("nanoseconds");
    await expect(page.locator("#ts-batch-out thead th")).toHaveText(["Line", "Value", "Unit", "UTC", /^Asia\/(Kolkata|Calcutta)$/]);
    // a chosen unit applies to every value
    await page.locator("#ts-batch-unit").selectOption("ms");
    await expect(rows.nth(3).locator("td").nth(1)).toHaveText("milliseconds (chosen)");
    await expect(rows.nth(4)).toContainText("Not converted: Out of range");
    await expect(page.locator("#ts-batch-status")).toHaveText("3 converted, 2 not converted.");
    // the zone applies to the batch too
    await zoneSelect(page).selectOption("America/New_York");
    await expect(page.locator("#ts-batch-out thead th").last()).toHaveText("America/New_York");
  });

  test("batch limit: only the first 200 are shown, and the page says so; copy gives a tab-separated table", async ({ page, go }) => {
    await open(page, go);
    await batch(page).fill(Array.from({ length: 250 }, (_, i) => String(1700000000 + i)).join("\n"));
    await expect(page.locator("#ts-batch-rows tr")).toHaveCount(200);
    await expect(page.locator("#ts-batch-status")).toHaveText("200 converted, 0 not converted, showing the first 200 of 250 entries.");
    await batch(page).fill("1700000000\nhello");
    await expect(page.locator("#ts-batch-rows tr")).toHaveCount(2);
    await btn(page, "Copy table").click();
    await expect(btn(page, "Copied")).toHaveCount(1);
    await batch(page).fill("");
    await batch(page).press("Control+V");
    const pasted = await batch(page).inputValue();
    expect(pasted.split("\n")[0]).toMatch(/^Line\tValue\tUnit\tUTC\tAsia\/(Kolkata|Calcutta)$/);
    expect(pasted.split("\n")[1]).toMatch(/^1\t1700000000\tseconds\t2023-11-14T22:13:20Z\t2023-11-15T03:43:20\+05:30$/);
    expect(pasted.split("\n")[2]).toMatch(/^2\thello\t\tNot converted: No timestamp found/);
    await btn(page, "Clear").click();
    await expect(batch(page)).toHaveValue("");
    await expect(page.locator("#ts-batch-out")).toBeHidden();
    await expect(btn(page, "Copy table")).toBeDisabled();
  });

  test("security: pasted text in the batch and the date field stays inert text", async ({ page, go }) => {
    const dialogs = [];
    page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss(); });
    await open(page, go);
    await batch(page).fill('<script>window.__pwned=1</script> "quoted" ünï 😀\n<img src=x onerror=window.__pwned=1> 1700000000\n<b>bold</b>');
    await expect(page.locator("#ts-batch-rows tr")).toHaveCount(3);
    await expect(page.locator("#ts-batch-rows")).toContainText('<script>window.__pwned=1</script> "quoted" ünï 😀');
    await date(page).fill('<img src=x onerror=window.__pwned=1>');
    await date(page).press("Enter");
    await expect(page.locator("#ts-b-error")).toBeVisible();
    await input(page).fill("<script>window.__pwned=1</script>");
    await input(page).press("Enter");
    await expect(page.locator("#ts-a-error")).toBeVisible();
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(dialogs).toEqual([]);
    await expect(page.locator("#ts-panel img, #ts-panel script, #ts-panel b")).toHaveCount(0);
  });

  test("no network request carries the input, and nothing is stored", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    await open(page, go);
    await input(page).fill("1700000000");
    await date(page).fill("2023-11-14T22:13:20Z");
    await batch(page).fill("1700000000");
    await expect(page.locator("#ts-batch-rows tr")).toHaveCount(1);
    await btn(page, "Copy table").click();
    await btn(page, "Clear").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  });

  test("accessibility semantics: names, one polite region that announces a settled result once, tables, a labelled scroll region", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(page.locator("#ts-now-seconds")).toHaveAttribute("aria-live", "off");
    await expect(page.locator("#ts-relative")).toHaveCount(0);
    await input(page).pressSequentially("1700000000", { delay: 40 });
    await expect(live(page)).toHaveText("1700000000 seconds is 2023-11-14T22:13:20Z.", { timeout: 4000 });
    await expect(page.locator("#ts-relative")).not.toHaveAttribute("aria-live", /.+/);
    await expect(page.locator("#ts-board table caption")).toHaveText("The same instant in several time zones");
    await expect(page.locator("#ts-board").getByRole("columnheader")).toHaveText(["Time zone", "Date and time", "Offset", "Remove"]);
    await batch(page).fill("1700000000");
    const region = page.locator("#ts-batch-out");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("aria-label", "Batch results");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(page.getByRole("table", { name: "Converted timestamps" })).toBeVisible();
    await expect(page.locator("#ts-batch-rows th[scope=row]")).toHaveCount(1);
    // an error is a sentence, tied to the field, and states are words
    await input(page).fill("abc");
    await input(page).press("Enter");
    await expect(input(page)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#ts-a-error")).toContainText("digits only");
    await expect(live(page)).toContainText("Not converted.", { timeout: 4000 });
    // visible keyboard focus on a field and a button
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    await input(page).focus();
    await page.keyboard.press("Shift+Tab");
    expect(await outline(page.locator("#ts-zone"))).toBeGreaterThanOrEqual(1);
    await btn(page, "Clear").focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    expect(await outline(btn(page, "Clear"))).toBeGreaterThanOrEqual(2);
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: no page overflow in any state, controls tappable, long values contained`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      for (const name of ["Copy seconds", "Copy milliseconds", "Convert now"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      await input(page).fill("1700000000123456789");
      await expect(aOut(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await zoneSelect(page).selectOption("America/Argentina/Rio_Gallegos"); // a long zone name
      await expectNoHorizontalOverflow(page);
      for (const loc of [aOut(page), page.locator("#ts-board")]) {
        const box = await loc.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      for (const copy of await aOut(page).getByRole("button", { name: /^Copy / }).all()) expect((await copy.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await input(page).fill("170000000012");
      await expect(aOut(page)).toContainText("Which unit is this?");
      await expectNoHorizontalOverflow(page);
      await btn(page, "Use seconds").scrollIntoViewIfNeeded();
      expect((await btn(page, "Use seconds").boundingBox()).height).toBeGreaterThanOrEqual(44);
      await date(page).fill("2023-11-05 01:30:00");
      await zoneSelect(page).selectOption("America/New_York");
      await expect(bOut(page).locator(".ts-instant")).toHaveCount(2);
      await expectNoHorizontalOverflow(page);
      await batch(page).fill(["1700000000123456789", "ts=1700000000123 " + "x".repeat(300), "nothing here"].join("\n"));
      await expect(page.locator("#ts-batch-rows tr")).toHaveCount(3);
      await expectNoHorizontalOverflow(page);
      const region = await page.locator("#ts-batch-out").boundingBox();
      expect(region.x + region.width).toBeLessThanOrEqual(width);
      expect(await page.locator("#ts-batch-out").evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true); // the table scrolls inside its own region
      await date(page).fill("2023-03-12 02:30:00");
      await zoneSelect(page).selectOption("America/New_York");
      await date(page).press("Enter");
      await expect(page.locator("#ts-b-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe("Developer Tools in the site", () => {
  test("the section page lists the real tools", async ({ page, go }) => {
    await go("developer-tools.html");
    await expect(page.locator("h1")).toHaveText("Developer Tools");
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(4);
    for (const slug of ["json-formatter", "unix-timestamp-converter"]) await expect(page.locator(`a[href$="tools/${slug}/"]`)).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(/coming soon|base64|uuid|regex/i);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe("https://toolzenhub.in/developer-tools.html");
  });

  test("All Tools: Developer Tools has 4 tools; Time Tools is unchanged and holds no developer tool", async ({ page, go }) => {
    await go("tools.html");
    await expect(page.locator(".directory-section__title a")).toHaveText(["Calculators", "Time Tools", "Developer Tools", "Image Tools"]);
    const dev = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Developer Tools")') });
    await expect(dev.locator(".directory-section__count")).toHaveText("4 tools");
    await expect(dev.locator('a[href$="tools/unix-timestamp-converter/"]')).toHaveCount(1);
    const time = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Time Tools")') });
    await expect(time.locator(".directory-section__count")).toHaveText("6 tools");
    await expect(time.locator('a[href$="tools/unix-timestamp-converter/"]')).toHaveCount(0);
    await go("time-tools.html");
    await expect(page.locator("main a[href*='tools/']")).toHaveCount(6);
    await expect(page.locator("main")).not.toContainText(/timestamp|epoch|json/i);
  });

  test("Home to the tool by clicking", async ({ page, go, siteRoot }) => {
    await go("");
    await expect(page.locator("#categories .category-card").nth(2)).toContainText("Developer Tools");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Developer Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}developer-tools.html`);
    await page.locator('a[href$="tools/unix-timestamp-converter/"]').first().click();
    await expect(page.locator("h1")).toHaveText("Unix Timestamp Converter");
  });

  test("global search: epoch and timestamp queries lead with the converter; the other tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["unix timestamp", "epoch converter", "epoch time", "timestamp converter", "unix time converter", "timestamp to date", "date to timestamp", "epoch to date", "milliseconds timestamp", "unix milliseconds", "epoch", "timestamp"]) await expect(await first(q), q).toContainText("Unix Timestamp Converter");
    await expect(await first("unix timestamp"), "meta").toContainText("Developer Tools");
    await expect(await first("json")).toContainText("JSON Formatter & Validator");
    for (const q of ["json formatter", "json validator", "format json"]) await expect(await first(q), q).toContainText("JSON Formatter & Validator");
    await expect(await first("stopwatch")).toContainText("Stopwatch");
    await expect(await first("countdown timer")).toContainText("Countdown Timer");
    await expect(await first("date calculator")).toContainText("Date Calculator");
    await expect(await first("date difference")).toContainText("Date Difference Calculator");
    await expect(await first("emi")).toContainText("EMI Calculator");
  });

  test("calculator searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("timestamp");
    await expect(page.locator("main")).not.toContainText("Timestamp");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("epoch converter");
    await expect(page.locator("#calculators-grid")).not.toContainText("Timestamp");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("unix timestamp");
    await expect(page.locator("main")).not.toContainText("Timestamp");
  });

  test("the JSON Formatter and the converter link each other, and no Time Tool links to either", async ({ page, go }) => {
    await go("tools/json-formatter/");
    await expect(page.locator('main a[href$="tools/unix-timestamp-converter/"]')).toHaveCount(1);
    await go("tools/unix-timestamp-converter/");
    await expect(page.locator('main a[href$="tools/json-formatter/"]')).toHaveCount(1);
    for (const slug of ["date-difference", "date-calculator", "countdown-timer", "stopwatch"]) {
      await go(`tools/${slug}/`);
      await expect(page.locator('main a[href$="tools/unix-timestamp-converter/"], main a[href$="tools/json-formatter/"]')).toHaveCount(0);
    }
  });
});
