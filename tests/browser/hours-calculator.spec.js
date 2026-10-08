/**
 * Tool Pack 23: the Hours & Timesheet Calculator page.
 *
 * Only what this change can break: live results per row and in total, add, remove and clear with their focus and
 * announcements, the four row states (empty, incomplete, invalid, counted) and the included and excluded counts, the
 * 31-row limit and the largest total, the privacy boundaries, accessible names and heading order, 320, 360 and 390 px
 * layouts, and the tool's place in Time Tools, All Tools and search. The arithmetic is pinned by
 * tests/unit/hours-calculator.test.mjs against a Python reference with exhaustive sweeps.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const rows = (page) => page.locator(".hc-row");
const row = (page, n) => rows(page).nth(n - 1);
const start = (page, n) => row(page, n).locator("input[type=time]").nth(0);
const end = (page, n) => row(page, n).locator("input[type=time]").nth(1);
const brk = (page, n) => row(page, n).locator("input[type=text]");
const live = (page) => page.locator("#hc-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/hours-calculator/");
  await expect(page.locator("#hc-panel")).toHaveAttribute("data-ready", "true");
}

async function fillRow(page, n, s, e, b = "") {
  await start(page, n).fill(s);
  await end(page, n).fill(e);
  await brk(page, n).fill(b);
}

test.describe("Hours & Timesheet Calculator", () => {
  test("page, breadcrumb, one empty row, the stated limits and the empty total", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Hours & Timesheet Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Time Tools", "Hours & Timesheet Calculator"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}time-tools.html`]);

    await expect(rows(page)).toHaveCount(1);
    await expect(start(page, 1)).toHaveAttribute("step", "60");
    await expect(brk(page, 1)).toHaveAttribute("inputmode", "numeric");
    await expect(row(page, 1).locator(".hc-row__status")).toBeHidden();
    await expect(row(page, 1).locator(".hc-row__message")).toBeHidden();
    // the two approved clarifications are on the page before anything is typed
    await expect(page.locator(".hc-limits")).toContainText("23 hours 59 minutes");
    await expect(page.locator(".hc-limits")).toContainText("no dates or time zones");
    await expect(page.locator(".hc-limits")).toContainText("ends the next day");
    await expect(page.locator(".hc-limits")).toContainText("Daylight-saving changes are not adjusted");
    await expect(page.locator("#hc-total-empty")).toBeVisible();
    await expect(page.locator("#hc-total-figures")).toBeHidden();
    await expect(page.locator("#hc-included")).toHaveText("0 rows included in the total");
    await expect(page.locator("#hc-excluded")).toHaveText("No rows excluded");
    await expect(btn(page, "Add shift")).toBeEnabled();
    expectClean(watch);
  });

  test("a row updates live: shift, break and worked time, in both forms, and the total follows", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 1, "09:00", "17:30", "30");
    const dd = row(page, 1).locator(".hc-result dd");
    await expect(dd).toHaveText(["8:30", "0:30", "8:00", "8.00"]);
    await expect(row(page, 1).locator(".hc-row__status")).toHaveText("Counted");
    await expect(row(page, 1).locator(".hc-row__tag")).toBeHidden();
    await expect(page.locator("#hc-total-hm")).toHaveText("8:00");
    await expect(page.locator("#hc-total-dec")).toHaveText("8.00");
    await expect(page.locator("#hc-included")).toHaveText("1 row included in the total");
    await expect(page.locator("#hc-excluded")).toHaveText("No rows excluded");
    await expect(page.locator("#hc-excluded-note")).toBeHidden();
    // changing a field changes the answer at once
    await end(page, 1).fill("18:00");
    await expect(dd).toHaveText(["9:00", "0:30", "8:30", "8.50"]);
  });

  test("Load example: three shifts, one overnight, total 19:15 = 19.25, shift time 20:30, breaks 1:15", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(rows(page)).toHaveCount(3);
    await expect(row(page, 2).locator(".hc-row__tag")).toHaveText("Ends next day");
    await expect(row(page, 1).locator(".hc-row__tag")).toBeHidden();
    await expect(row(page, 2).locator(".hc-result dd")).toHaveText(["8:00", "0:45", "7:15", "7.25"]);
    await expect(page.locator("#hc-total-hm")).toHaveText("19:15");
    await expect(page.locator("#hc-total-dec")).toHaveText("19.25");
    await expect(page.locator("#hc-total-gross")).toHaveText("20:30");
    await expect(page.locator("#hc-total-break")).toHaveText("1:15");
    await expect(page.locator("#hc-included")).toHaveText("3 rows included in the total");
    await expect(live(page)).toContainText("Example loaded. Total 19 hours 15 minutes, 19.25 decimal hours, from 3 shifts.");
  });

  test("empty, incomplete and invalid rows are told apart, left out of the total, and counted as included or excluded", async ({ page, go }) => {
    await open(page, go);
    for (let i = 0; i < 4; i++) await btn(page, "Add shift").click();
    await expect(rows(page)).toHaveCount(5);
    await fillRow(page, 1, "09:00", "17:00", "30"); // counted
    await start(page, 2).fill("09:00"); // incomplete: no end
    await fillRow(page, 3, "09:00", "09:00", "0"); // invalid: equal times
    await fillRow(page, 4, "09:00", "10:00", "90"); // invalid: break longer than the shift
    // row 5 stays empty

    await expect(row(page, 1).locator(".hc-row__status")).toHaveText("Counted");
    await expect(row(page, 2).locator(".hc-row__status")).toHaveText("Incomplete, not counted");
    await expect(row(page, 2).locator(".hc-row__message")).toHaveText("Enter an end time.");
    await expect(row(page, 3).locator(".hc-row__status")).toHaveText("Invalid, not counted");
    await expect(row(page, 3).locator(".hc-row__message")).toHaveText("Start and end are the same time. A shift must be at least 1 minute and less than 24 hours.");
    await expect(row(page, 4).locator(".hc-row__message")).toHaveText("Break is 90 minutes but the shift is 60 minutes. The break cannot be longer than the shift.");
    await expect(row(page, 5).locator(".hc-row__status")).toBeHidden();
    await expect(row(page, 5).locator(".hc-row__message")).toBeHidden();

    // an incomplete row is a hint, not an error; an invalid row marks the field and links the message
    await expect(end(page, 2)).not.toHaveAttribute("aria-invalid", "true");
    await expect(end(page, 3)).toHaveAttribute("aria-invalid", "true");
    const msg3 = await row(page, 3).locator(".hc-row__message").getAttribute("id");
    await expect(end(page, 3)).toHaveAttribute("aria-describedby", msg3);
    await expect(brk(page, 4)).toHaveAttribute("aria-invalid", "true");
    await expect(start(page, 4)).not.toHaveAttribute("aria-invalid", "true");

    // the total holds the one counted row only, and says so
    await expect(page.locator("#hc-total-hm")).toHaveText("7:30");
    await expect(page.locator("#hc-included")).toHaveText("1 row included in the total");
    await expect(page.locator("#hc-excluded")).toHaveText("3 rows excluded: 1 incomplete, 2 invalid");
    await expect(page.locator("#hc-excluded-note")).toBeVisible();
    await expect(page.locator("#hc-excluded-note")).toContainText("The total includes only the 1 counted row.");
    await expect(page.locator("#hc-excluded-note")).toContainText("3 rows are not included (1 incomplete, 2 invalid).");
    await expect(live(page)).toContainText("Total 7 hours 30 minutes, 7.50 decimal hours, from 1 shift. 3 rows not counted: 1 incomplete, 2 invalid.");

    // fixing a row moves it into the total
    await end(page, 2).fill("12:00");
    await expect(page.locator("#hc-included")).toHaveText("2 rows included in the total");
    await expect(page.locator("#hc-excluded")).toHaveText("2 rows excluded: 2 invalid");
    await expect(page.locator("#hc-total-hm")).toHaveText("10:30");
  });

  test("with nothing counted the page shows no total and says what is excluded", async ({ page, go }) => {
    await open(page, go);
    await start(page, 1).fill("09:00");
    await expect(page.locator("#hc-total-figures")).toBeHidden();
    await expect(page.locator("#hc-total-empty")).toBeVisible();
    await expect(page.locator("#hc-excluded")).toHaveText("1 row excluded: 1 incomplete");
    await expect(page.locator("#hc-excluded-note")).toContainText("Nothing is counted yet.");
    await expect(live(page)).toContainText("No shifts counted yet. 1 row not counted: 1 incomplete.");
  });

  test("break text: blank, spaces and leading zeros are fine; anything that is not whole minutes is invalid with its message", async ({ page, go }) => {
    await open(page, go);
    await start(page, 1).fill("09:00");
    await end(page, 1).fill("10:00");
    for (const [text, ok] of [["", true], [" 30 ", true], ["05", true], ["abc", false], ["-5", false], ["1.5", false], ["1e2", false], ["30m", false], ["12345", false], ["1440", false]]) {
      await brk(page, 1).fill(text);
      await expect(row(page, 1).locator(".hc-row__status")).toHaveText(ok ? "Counted" : "Invalid, not counted");
      if (!ok) await expect(row(page, 1).locator(".hc-row__message")).toHaveText("Break must be a whole number of minutes from 0 to 1,439.");
    }
    await brk(page, 1).fill("60"); // equal to the shift: counted, 0:00 worked
    await expect(row(page, 1).locator(".hc-result dd").nth(2)).toHaveText("0:00");
    await brk(page, 1).fill("61");
    await expect(row(page, 1).locator(".hc-row__message")).toContainText("Break is 61 minutes but the shift is 60 minutes");
  });

  test("overnight and midnight: 22:00 to 06:00 is 8:00 and tagged; 23:59 to 00:00 is 0:01; the longest shift is 23:59", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 1, "22:00", "06:00");
    await expect(row(page, 1).locator(".hc-result dd").nth(2)).toHaveText("8:00");
    await expect(row(page, 1).locator(".hc-row__tag")).toBeVisible();
    await fillRow(page, 1, "23:59", "00:00");
    await expect(row(page, 1).locator(".hc-result dd")).toHaveText(["0:01", "0:00", "0:01", "0.02"]);
    await fillRow(page, 1, "00:00", "23:59");
    await expect(row(page, 1).locator(".hc-result dd")).toHaveText(["23:59", "0:00", "23:59", "23.98"]);
  });

  test("add, remove and clear: numbering, focus, announcements, and the only row is cleared rather than removed", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 1, "09:00", "17:00", "30");
    await btn(page, "Add shift").click();
    await expect(rows(page)).toHaveCount(2);
    await expect(row(page, 2).locator(".hc-row__title")).toHaveText("Shift 2");
    await expect(start(page, 2)).toBeFocused();
    await expect(live(page)).toHaveText("Shift 2 added.");
    await fillRow(page, 2, "10:00", "12:00");

    await page.getByRole("button", { name: "Remove shift 1", exact: true }).click();
    await expect(rows(page)).toHaveCount(1);
    await expect(row(page, 1).locator(".hc-row__title")).toHaveText("Shift 1"); // renumbered
    await expect(start(page, 1)).toHaveValue("10:00"); // it was the other row that stayed
    await expect(start(page, 1)).toBeFocused();
    await expect(live(page)).toHaveText("Shift 1 removed. 1 shift remains.");
    await expect(page.locator("#hc-total-hm")).toHaveText("2:00");

    // the only row is cleared, not removed
    await page.getByRole("button", { name: "Remove shift 1", exact: true }).click();
    await expect(rows(page)).toHaveCount(1);
    await expect(start(page, 1)).toHaveValue("");
    await expect(end(page, 1)).toHaveValue("");
    await expect(live(page)).toHaveText("Shift 1 cleared.");
    await expect(page.locator("#hc-total-figures")).toBeHidden();

    await btn(page, "Load example").click();
    await expect(rows(page)).toHaveCount(3);
    await btn(page, "Clear all").click();
    await expect(rows(page)).toHaveCount(1);
    await expect(start(page, 1)).toHaveValue("");
    await expect(brk(page, 1)).toHaveValue("");
    await expect(start(page, 1)).toBeFocused();
    await expect(live(page)).toHaveText("All shifts cleared.");
    await expect(page.locator("#hc-included")).toHaveText("0 rows included in the total");
    await expect(page.locator("#hc-excluded")).toHaveText("No rows excluded");
    expect(await page.locator(".hc-row__message:not([hidden])").count()).toBe(0);
  });

  test("31 rows: Add is disabled with a note, the largest total is 743:29 = 743.48, and removing a row re-enables Add", async ({ page, go }) => {
    await open(page, go);
    for (let i = 0; i < 30; i++) await btn(page, "Add shift").click();
    await expect(rows(page)).toHaveCount(31);
    await expect(btn(page, "Add shift")).toBeDisabled();
    await expect(page.locator("#hc-limit-note")).toHaveText("You can add up to 31 shifts.");
    for (let n = 1; n <= 31; n++) {
      await start(page, n).fill("00:00");
      await end(page, n).fill("23:59");
    }
    await expect(page.locator("#hc-total-hm")).toHaveText("743:29");
    await expect(page.locator("#hc-total-dec")).toHaveText("743.48");
    await expect(page.locator("#hc-included")).toHaveText("31 rows included in the total");
    await page.getByRole("button", { name: "Remove shift 31", exact: true }).click();
    await expect(btn(page, "Add shift")).toBeEnabled();
    await expect(page.locator("#hc-limit-note")).toBeHidden();
    await expect(page.locator("#hc-total-hm")).toHaveText("719:30");
  });

  test("announcements are one polite sentence after a pause, and an error is announced once with its row", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await fillRow(page, 1, "09:00", "17:00", "30");
    await expect(live(page)).toHaveText("Total 7 hours 30 minutes, 7.50 decimal hours, from 1 shift.");
    await brk(page, 1).fill("999");
    await expect(live(page)).toContainText("Shift 1: Break is 999 minutes but the shift is 480 minutes.");
    await expect(live(page)).toContainText("No shifts counted yet. 1 row not counted: 1 invalid.");
  });

  test("accessible names, groups and heading order; the status line is not itself live", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    for (const n of [1, 2, 3]) {
      // the accessible name of each field is the row heading plus its label ("Shift 2 Start"), through aria-labelledby
      const names = await row(page, n).locator("input").evaluateAll((inputs) => inputs.map((i) => i.getAttribute("aria-labelledby").split(" ").map((id) => document.getElementById(id).textContent.trim()).join(" ")));
      expect(names).toEqual([`Shift ${n} Start`, `Shift ${n} End`, `Shift ${n} Unpaid break (minutes)`]);
      await expect(page.getByRole("textbox", { name: `Shift ${n} Unpaid break (minutes)`, exact: true })).toHaveCount(1);
      await expect(page.getByRole("group", { name: `Shift ${n}` })).toHaveCount(1);
      await expect(page.getByRole("button", { name: `Remove shift ${n}`, exact: true })).toHaveCount(1);
    }
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
    await expect(page.locator("#hc-total")).toHaveAttribute("aria-labelledby", "hc-total-heading");
  });

  test("keyboard: every control is reachable and operable without a mouse, with visible focus", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Add shift").focus();
    await page.keyboard.press("Enter");
    await expect(rows(page)).toHaveCount(2);
    await expect(start(page, 2)).toBeFocused();
    await btn(page, "Load example").focus();
    await page.keyboard.press("Space");
    await expect(rows(page)).toHaveCount(3);
    await page.getByRole("button", { name: "Remove shift 3", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(rows(page)).toHaveCount(2);
    await expect(start(page, 2)).toBeFocused();
    await btn(page, "Clear all").focus();
    await page.keyboard.press("Enter");
    await expect(rows(page)).toHaveCount(1);
    for (const control of [btn(page, "Add shift"), start(page, 1), brk(page, 1), btn(page, "Clear all")]) {
      await control.focus();
      const outline = await control.evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect((outline.style !== "none" && outline.width > 0) || outline.shadow !== "none").toBe(true);
    }
    // typing in a field does not submit or move anything
    await brk(page, 1).fill("5");
    await brk(page, 1).press("Enter");
    await expect(rows(page)).toHaveCount(1);
  });

  test("typed text is never markup: nothing runs, nothing is created", async ({ page, go }) => {
    await page.addInitScript(() => { window.__pwned = 0; });
    await open(page, go);
    await brk(page, 1).fill("<img src=x onerror=window.__pwned=1><script>window.__pwned=2</script>");
    await start(page, 1).fill("09:00");
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__pwned)).toBe(0);
    expect(await page.locator("main img, main script").count()).toBe(0);
    await expect(row(page, 1).locator(".hc-row__message")).toHaveText("Break must be a whole number of minutes from 0 to 1,439.");
  });

  test("privacy: no request carries the times, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await fillRow(page, 1, "09:17", "17:43", "29");
    await btn(page, "Add shift").click();
    await btn(page, "Load example").click();
    await page.getByRole("button", { name: "Remove shift 1", exact: true }).click();
    await btn(page, "Clear all").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).length : 0))).toBe(0);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    expect(logs.filter((l) => l.includes("09:17") || l.includes("17:43"))).toEqual([]);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`Hours & Timesheet Calculator at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`31 rows with counted, incomplete and invalid states: no page-level overflow, readable text and 44px controls at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      for (let i = 0; i < 30; i++) await btn(page, "Add shift").click();
      for (let n = 1; n <= 31; n++) {
        if (n % 3 === 1) await fillRow(page, n, "00:00", "23:59", "1439"); // counted, worked 0:00? no: break 1439 equals the shift
        else if (n % 3 === 2) await start(page, n).fill("22:00"); // incomplete
        else await fillRow(page, n, "09:00", "09:00", "9999"); // invalid
      }
      await expectNoHorizontalOverflow(page);
      await expect(page.locator("#hc-excluded-note")).toBeVisible();
      const wide = await page.locator("main *").evaluateAll((els, w) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > w + 1; }).map((e) => e.tagName + "." + e.className), width);
      expect(wide).toEqual([]);
      const sizes = await page.locator(".hc-input, .hc-row__message, .hc-result dd, #hc-total-hm, .hc-limits").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      for (const s of sizes) expect(s).toBeGreaterThanOrEqual(14);
      for (const input of await row(page, 1).locator("input").all()) expect((await input.boundingBox()).height).toBeGreaterThanOrEqual(44);
      for (const name of ["Add shift", "Load example", "Clear all", "Remove shift 1"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
    });

    test(`the example and a long total fit at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await btn(page, "Load example").click();
      await expectNoHorizontalOverflow(page);
      await expect(page.locator("#hc-total-hm")).toBeVisible();
      const box = await page.locator("#hc-total").boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    });
  });
}

test.describe("Hours & Timesheet Calculator in Time Tools", () => {
  test("it is listed with the other Time Tools, not with Calculators, and has no related-tools block", async ({ page, go, siteRoot }) => {
    await go("time-tools.html");
    await expect(page.locator(`a[href$="tools/hours-calculator/"]`)).toHaveCount(1);
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(6);
    await go("calculators.html");
    await expect(page.locator(`#calculators-grid a[href*="hours-calculator"]`)).toHaveCount(0);
    await go("tools/hours-calculator/");
    await expect(page.locator(".related-calculators, .related-tools, .related-content")).toHaveCount(0);
    // the one text link, to the Date Difference Calculator
    const links = await page.locator("main .calculator-info a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(links).toEqual([`${siteRoot}tools/date-difference/`]);
    // an older Time Tool does not gain it
    await go("tools/stopwatch/");
    await expect(page.locator("main")).not.toContainText("Hours & Timesheet");
  });

  test("global search finds it by its own names, and the stopwatch still leads 'elapsed time'", async ({ page, go, siteRoot }) => {
    for (const q of ["hours calculator", "timesheet calculator", "overnight hours calculator", "calculate hours worked"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/hours-calculator/']`).first(), q).toBeVisible();
    }
    await go(`tools.html?q=${encodeURIComponent("elapsed time")}`);
    const hrefs = await page.locator("main a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    const sw = hrefs.indexOf(`${siteRoot}tools/stopwatch/`);
    const hc = hrefs.indexOf(`${siteRoot}tools/hours-calculator/`);
    expect(sw).toBeGreaterThanOrEqual(0);
    if (hc >= 0) expect(hc, "the new tool never outranks the Stopwatch for this phrase").toBeGreaterThan(sw);
  });
});
