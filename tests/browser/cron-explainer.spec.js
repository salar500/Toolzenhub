/**
 * Tool Pack 25, Phase 2: the Cron Expression Explainer page.
 *
 * Only what this change can break: the page's own workflow (explain only on Explain, Enter or an example; errors; Reset),
 * the safe rendering of hostile text, explicit and limited copying, the privacy boundaries (no request, no storage, no URL
 * or title change, no logging, no clipboard reads), the keyboard path, focus and announcements, narrow phone layouts, and
 * the tool's place in the Developer Tools section. The rules themselves (syntax, the day rule, the next runs, the summary
 * and the notes) are pinned by tests/unit/cron-explainer.test.mjs against the independent Python reference, so this file
 * checks the page shows what the engine returns, not the engine again.
 *
 * The clock is fixed (page.clock.setFixedTime) so the next five times are exact: Monday 12 October 2026, 10:00:30 UTC.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#ce-input");
const status = (page) => page.locator("#ce-status-text");
const results = (page) => page.locator("#ce-results");
const errorBox = (page) => page.locator("#ce-error");
const runs = (page) => page.locator("#ce-runs li");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

const NOW = "2026-10-12T10:00:30Z";

async function open(page, go, now = NOW) {
  if (now) await page.clock.setFixedTime(new Date(now)); // only Date is fixed; timers still run
  await go("tools/cron-expression-explainer/");
  await expect(page.locator("#ce-panel")).toHaveAttribute("data-ready", "true"); // the script has run
}

async function explain(page, text) {
  await input(page).fill(text);
  await btn(page, "Explain").click();
}

test.describe("Cron Expression Explainer", () => {
  test("page, breadcrumb, label, the dialect line and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Cron Expression Explainer");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "Cron Expression Explainer"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}developer-tools.html`]);

    await expect(page.getByLabel("Cron expression", { exact: true })).toHaveCount(1);
    await expect(input(page)).toHaveValue("");
    for (const [name, value] of [["spellcheck", "false"], ["autocomplete", "off"], ["autocapitalize", "off"]]) {
      await expect(input(page)).toHaveAttribute(name, value);
    }
    await expect(page.locator("#ce-count")).toHaveText("0 characters");
    await expect(status(page)).toHaveText("Enter an expression, or choose an example.");
    await expect(results(page)).toBeHidden();
    await expect(errorBox(page)).toBeHidden();
    // the dialect is named above the box, before anything is explained, and does not overclaim
    await expect(page.locator("#ce-dialect")).toContainText("Cronie crontab syntax, five time fields.");
    await expect(page.locator("#ce-dialect")).toContainText("Not Kubernetes, GitHub Actions, Quartz or AWS syntax");
    await expect(page.locator("#ce-dialect")).toContainText("Other cron programs may differ too.");
    // the six examples, each a button
    const examples = await page.locator(".ce-chip").allInnerTexts();
    expect(examples).toEqual(["*/15 * * * *", "30 4 * * mon-fri", "0 0 1,15 * 5", "0 */2 * * *", "@daily", "0 0 29 2 *"]);
    // the buttons that cannot act yet are present and enabled where they act; the Copy buttons wait for a result
    await expect(btn(page, "Explain")).toBeEnabled();
    await expect(btn(page, "Reset")).toBeEnabled();
    expectClean(watch);
  });

  test("typing, pasting and editing never explain; only Explain, Enter and an example do", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("30 4 * * mon-fri");
    await input(page).dispatchEvent("paste");
    await input(page).press("a");
    await expect(results(page)).toBeHidden();
    await expect(errorBox(page)).toBeHidden();
    await expect(status(page)).toHaveText("Enter an expression, or choose an example."); // nothing ran
    await expect(page.locator("#ce-live")).toHaveText(""); // and nothing was announced
    await expect(page.locator("#ce-count")).toHaveText("17 characters");
    await btn(page, "Explain").click();
    await expect(errorBox(page)).toBeVisible(); // the extra "a" makes the day-of-week text unreadable, and Explain reports it
  });

  test("an example fills the box and explains it at once, with focus on the result", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "30 4 * * mon-fri").click();
    await expect(input(page)).toHaveValue("30 4 * * mon-fri");
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#ce-results-heading")).toBeFocused();
    await expect(status(page)).toHaveText("Explained.");
  });

  test("a valid expression: summary, the five fields, notes and the next five UTC times", async ({ page, go, watch }) => {
    await open(page, go);
    await explain(page, "30 4 * * mon-fri");
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#ce-summary")).toHaveText("At 04:30, on Monday through Friday.");
    await expect(page.locator("#ce-expression")).toContainText("Cronie crontab syntax, five time fields");
    await expect(page.locator("#ce-expression")).toContainText("30 4 * * mon-fri");
    // the field table: five rows, the text as written, a meaning and the values
    const rows = page.locator(".ce-table__row");
    await expect(rows).toHaveCount(5);
    const cell = (row, label) => rows.nth(row).locator(`[data-label="${label}"]`);
    await expect(cell(0, "Field")).toHaveText("minute");
    await expect(cell(0, "As written")).toHaveText("30");
    await expect(cell(1, "Field")).toHaveText("hour");
    await expect(cell(2, "As written")).toHaveText("*");
    await expect(cell(2, "Meaning")).toHaveText("every value");
    await expect(cell(4, "Field")).toHaveText("day of week");
    await expect(cell(4, "As written")).toHaveText("mon-fri");
    await expect(cell(4, "Meaning")).toHaveText("Monday through Friday");
    await expect(cell(4, "Values")).toHaveText("1, 2, 3, 4 and 5");
    // a note that applies (one day field is a star and the other is restricted)
    await expect(page.locator("#ce-notes li")).toHaveText(["A day field written with * (including */2) makes cron require both day fields to match."]);
    // the next five times, UTC, 24-hour, strictly after the (fixed) current time
    await expect(runs(page)).toHaveText([
      "Tue 13 Oct 2026, 04:30 UTC",
      "Wed 14 Oct 2026, 04:30 UTC",
      "Thu 15 Oct 2026, 04:30 UTC",
      "Fri 16 Oct 2026, 04:30 UTC",
      "Mon 19 Oct 2026, 04:30 UTC",
    ]);
    // the assumptions sit beside the list
    await expect(page.locator("#ce-assumptions")).toContainText("The times are UTC.");
    await expect(page.locator("#ce-assumptions")).toContainText("daylight saving is not modelled");
    await expect(page.locator("#ce-assumptions")).toContainText("this device's clock");
    expectClean(watch);
  });

  test("the first run is strictly after now: a run exactly on the current minute is left out", async ({ page, go }) => {
    await open(page, go, "2026-10-12T10:15:00.000Z");
    await explain(page, "*/15 * * * *");
    await expect(runs(page).first()).toHaveText("Mon 12 Oct 2026, 10:30 UTC");
    await expect(runs(page)).toHaveCount(5);
    await open(page, go, "2026-10-12T10:14:59.999Z");
    await explain(page, "*/15 * * * *");
    await expect(runs(page).first()).toHaveText("Mon 12 Oct 2026, 10:15 UTC");
  });

  test("a schedule without a summary says so and is explained field by field", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "0 0 */2 * 1");
    await expect(page.locator("#ce-summary")).toHaveText("This schedule is explained field by field below.");
    await expect(page.locator(".ce-table__row")).toHaveCount(5);
    await expect(page.locator("#ce-notes")).toContainText("A day field written with * (including */2) makes cron require both day fields to match.");
  });

  test("the day rule: when both day fields are restricted, the OR note and sentence appear", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "0 0 1,15 * 5");
    await expect(page.locator("#ce-summary")).toHaveText("At 00:00, on day 1 and 15 of the month, or on Friday (either).");
    await expect(page.locator("#ce-notes")).toContainText("both restricted, so the command runs when either one matches");
    await expect(runs(page).first()).toHaveText("Thu 15 Oct 2026, 00:00 UTC");
    await expect(runs(page).nth(1)).toHaveText("Fri 16 Oct 2026, 00:00 UTC");
  });

  test("an alias shows its expansion; @midnight carries the manual-page note", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "@daily");
    await expect(page.locator("#ce-expression")).toContainText("@daily is the same as");
    await expect(page.locator("#ce-expression")).toContainText("0 0 * * *");
    await expect(page.locator("#ce-summary")).toHaveText("At 00:00, every day.");
    await explain(page, "@midnight");
    await expect(page.locator("#ce-notes")).toContainText("listed by Kubernetes and accepted by cronie, but is not in the cronie manual page");
  });

  test("rare and impossible schedules: 29 February shows the next leap years; day 31 of February never runs", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "0 0 29 2 *");
    await expect(runs(page)).toHaveText([
      "Tue 29 Feb 2028, 00:00 UTC",
      "Sun 29 Feb 2032, 00:00 UTC",
      "Fri 29 Feb 2036, 00:00 UTC",
      "Wed 29 Feb 2040, 00:00 UTC",
      "Mon 29 Feb 2044, 00:00 UTC",
    ]);
    await expect(page.locator("#ce-notes")).toContainText("Runs only in leap years.");
    await expect(page.locator("#ce-runs-never")).toBeHidden();
    await explain(page, "0 0 31 2 *");
    await expect(runs(page)).toHaveCount(0);
    await expect(page.locator("#ce-runs-never")).toBeVisible();
    await expect(page.locator("#ce-runs-never")).toContainText("This schedule never runs");
    await expect(page.locator("#ce-runs-never")).toContainText("full 400-year calendar cycle");
    await expect(page.locator("#ce-notes")).toContainText("No month in this schedule has day 31, so it never runs.");
    await expect(page.locator("#ce-live")).toContainText("This schedule never runs.");
  });

  test("Enter in the box explains, and focus moves to the result heading", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("*/15 * * * *");
    await input(page).press("Enter");
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#ce-results-heading")).toBeFocused();
    await expect(page.locator("#ce-summary")).toContainText("Every 15 minutes, restarting at the start of each hour: at minutes 0, 15, 30 and 45");
    await expect(page.locator("#ce-notes")).toContainText("Steps restart in each field");
  });

  test("unreadable input: a specific message tied to the box, no results, focus stays in the box, the text stays editable", async ({ page, go }) => {
    await open(page, go);
    const cases = [
      ["0/35 * * * *", /Field 1 \(minute\): 0\/35: in cronie crontab syntax, a step must follow \* or a range, such as 0-59\/35\./, "Position 2"],
      ["60 * * * *", /^Field 1 \(minute\): 60 is outside 0 to 59 for the minute field\.$/, "Position 1"],
      ["5-3 * * * *", /runs backwards\. In crontab the first number must be at most the second\./, "Position 1"],
      ["0 0 ? * *", /\? is not valid in cronie crontab syntax/, "Position 5"],
      ["* * * * * *", /a sixth field is the command/, null],
      ["1 2 3 4", /needs five fields.*this has 4\./, null],
      ["@reboot", /no schedule to explain/, "Position 1"],
      ["0 0 * * monday", /monday is not valid: use mon/, "Position 9"],
    ];
    for (const [text, message, where] of cases) {
      await explain(page, text);
      await expect(errorBox(page)).toBeVisible();
      await expect(page.locator("#ce-error-message")).toHaveText(message);
      if (where) await expect(page.locator("#ce-error-where")).toHaveText(where);
      else await expect(page.locator("#ce-error-where")).toBeHidden();
      await expect(results(page)).toBeHidden();
      await expect(status(page)).toHaveText("Could not read this as a cron expression.");
      await expect(input(page)).toHaveValue(text);
      await expect(input(page)).toBeFocused();
      await expect(input(page)).toHaveAttribute("aria-invalid", "true");
      const described = (await input(page).getAttribute("aria-describedby")).split(" ");
      expect(described).toContain("ce-error-message");
    }
    // a valid expression clears the error state completely
    await explain(page, "0 0 * * *");
    await expect(errorBox(page)).toBeHidden();
    await expect(input(page)).not.toHaveAttribute("aria-invalid", /.+/);
    expect(await input(page).getAttribute("aria-describedby")).toBe("ce-hint");
    // empty input is not an error
    await explain(page, "");
    await expect(errorBox(page)).toBeHidden();
    await expect(status(page)).toHaveText("Enter an expression, or choose an example.");
    await expect(page.locator("#ce-live")).toContainText("There is no expression to explain.");
  });

  test("code in messages and notes is shown as code, not as literal backtick marks, and is not read aloud with them", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "0/35 * * * *");
    expect(await page.locator("#ce-error-message code").allInnerTexts()).toEqual(["0/35", "*", "0-59/35", "20/15", "0/15", "1/10"]);
    expect(await page.locator("#ce-error-message").innerText()).not.toContain("`");
    await expect(page.locator("#ce-live")).not.toContainText("`");
    await expect(page.locator("#ce-live")).toContainText("a step must follow * or a range");
    await explain(page, "0 0 */2 * 1");
    expect(await page.locator("#ce-notes").innerText()).not.toContain("`");
    expect(await page.locator("#ce-notes code").allInnerTexts()).toEqual(["*", "*/2"]);
    // text that held its own backtick (so the marks do not pair up) is shown exactly as typed, and nothing is lost
    await explain(page, "`x * * * *");
    await expect(page.locator("#ce-error-message")).toContainText("`x");
    expect(await page.locator("#ce-error-message code").count()).toBe(0);
  });

  test("the other dialects are refused, not guessed (Quartz, AWS, Kubernetes and GitHub forms)", async ({ page, go }) => {
    await open(page, go);
    for (const text of ["0 0 12 * * ?", "0 0 L * *", "0 0 * * 5#2", "cron(0 12 * * ? *)", "H/15 * * * *"]) {
      await explain(page, text);
      await expect(errorBox(page), text).toBeVisible();
      await expect(results(page), text).toBeHidden();
    }
  });

  test("Reset empties the box, every result, the copy source and the error, and returns focus to the box", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "41 7 * * thu");
    await expect(results(page)).toBeVisible();
    await btn(page, "Reset").click();
    await expect(input(page)).toHaveValue("");
    await expect(input(page)).toBeFocused();
    await expect(results(page)).toBeHidden();
    await expect(errorBox(page)).toBeHidden();
    await expect(page.locator("#ce-count")).toHaveText("0 characters");
    await expect(status(page)).toContainText("Cleared");
    for (const id of ["#ce-summary", "#ce-expression", "#ce-fields", "#ce-notes", "#ce-runs", "#ce-assumptions"]) {
      expect((await page.locator(id).textContent()).trim(), id).toBe("");
    }
    expect(await page.locator("body").innerText()).not.toContain("41 7");
    // the same after an error
    await explain(page, "60 * * * *");
    await expect(errorBox(page)).toBeVisible();
    await btn(page, "Reset").click();
    await expect(errorBox(page)).toBeHidden();
    expect((await page.locator("#ce-error-message").textContent()).trim()).toBe("");
    await expect(input(page)).not.toHaveAttribute("aria-invalid", /.+/);
    expect(await input(page).getAttribute("aria-describedby")).toBe("ce-hint");
  });

  test("editing after an explanation says the results are for the earlier text, and Explain updates them", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "0 0 * * *");
    await expect(page.locator("#ce-stale")).toBeHidden();
    await input(page).press("End");
    await input(page).pressSequentially("x");
    await expect(page.locator("#ce-stale")).toBeVisible();
    await expect(results(page)).toBeVisible(); // the earlier result is still shown, labelled as earlier
    await btn(page, "Explain").click();
    await expect(page.locator("#ce-stale")).toBeHidden();
  });

  test("hostile text is shown as plain text: nothing runs, nothing is created, nothing becomes a link", async ({ page, go }) => {
    await page.addInitScript(() => { window.__pwned = 0; });
    await open(page, go);
    for (const text of ["<svg/onload=window.__pwned=1> * * * *", "<img src=x onerror=window.__pwned=2> * * * *", "javascript:window.__pwned=3 * * * *", "'\"><script>window.__pwned=4</script> * * * *"]) {
      await explain(page, text);
      await expect(errorBox(page)).toBeVisible();
    }
    await explain(page, "<svg/onload=window.__pwned=1> * * * *");
    await expect(page.locator("#ce-error-message")).toContainText("<svg/onload=window.__pwned=1>");
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__pwned)).toBe(0);
    expect(await page.locator("#ce-error, #ce-results").locator("img, script, svg, iframe, a, b").count()).toBe(0);
    expect(await page.locator('img[src="x"]').count()).toBe(0);
  });

  test("Copy expression and Copy summary copy the text shown, only on a click; the clipboard is never read", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      window.__reads = 0;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (t) => { window.__copied.push(t); }, readText: async () => { window.__reads++; return ""; }, read: async () => { window.__reads++; return []; } },
      });
    });
    await open(page, go);
    await expect(page.locator("#ce-copy-expression")).toBeDisabled(); // the Copy buttons wait for a result
    await expect(page.locator("#ce-copy-summary")).toBeDisabled();
    await explain(page, "  30   4 * * MON-fri ");
    expect(await page.evaluate(() => window.__copied)).toEqual([]); // nothing is copied until a click
    await btn(page, "Copy expression").click();
    await expect(status(page)).toHaveText("Expression copied to the clipboard.");
    await btn(page, "Copy summary").click();
    await expect(status(page)).toHaveText("Summary copied to the clipboard.");
    // a schedule with no summary copies the field table as text
    await explain(page, "0 0 */2 * 1");
    await btn(page, "Copy summary").click();
    const copied = await page.evaluate(() => window.__copied);
    expect(copied[0]).toBe("30 4 * * MON-fri"); // the normalised expression, names kept as typed
    expect(copied[1]).toBe("At 04:30, on Monday through Friday.");
    expect(copied[2].split("\n")).toHaveLength(5);
    expect(copied[2]).toContain("day of month: */2 = every 2nd from 1 through 31");
    expect(await page.evaluate(() => window.__reads)).toBe(0);
  });

  test("privacy: no request carries the expression, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {}, readText: async () => "" } });
    });
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    const secret = "17 3 7 1 SECRET-X";
    await explain(page, "17 3 7 1 *");
    await btn(page, "Copy expression").click();
    await btn(page, "Copy summary").click();
    await explain(page, secret);
    await btn(page, "0 0 29 2 *").click();
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).length : 0))).toBe(0);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    for (const part of ["17 3 7 1", "SECRET-X"]) expect(logs.some((l) => l.includes(part)), "console").toBe(false);
    // the only outside traffic the page ever makes is its font stylesheet
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("keyboard: the box, an example and the result are reachable without a mouse, and focus lands on the result", async ({ page, go }) => {
    await open(page, go);
    await input(page).focus();
    await page.keyboard.press("Tab");
    await expect(btn(page, "*/15 * * * *")).toBeFocused(); // the first example follows the box
    await page.keyboard.press("Enter");
    await expect(page.locator("#ce-results-heading")).toBeFocused();
    await expect(results(page)).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(btn(page, "Copy expression")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(btn(page, "Copy summary")).toBeFocused();
    // visible focus on the main action and on an example
    for (const name of ["Explain", "Reset", "@daily"]) {
      await btn(page, name).focus();
      const outline = await btn(page, name).evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect((outline.style !== "none" && outline.width > 0) || outline.shadow !== "none", name).toBe(true);
    }
  });

  test("accessibility semantics: labelled box, one polite announcement per Explain, nothing while typing, ordered headings, named controls", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#ce-live")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#ce-live")).toHaveAttribute("role", "status");
    await expect(page.locator("#ce-status")).not.toHaveAttribute("aria-live", /.+/);
    await input(page).pressSequentially("30 4 * * mon-fri");
    await expect(page.locator("#ce-live")).toHaveText(""); // typing announces nothing
    await btn(page, "Explain").click();
    await expect(page.locator("#ce-live")).toHaveText("Explained. 1 note. Next run Tue 13 Oct 2026, 04:30 UTC.");
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
    for (const name of ["Explain", "Reset", "Copy expression", "Copy summary"]) await expect(btn(page, name)).toHaveCount(1);
    // the field table is announced as a table with named columns
    await expect(page.getByRole("table", { name: "What each of the five fields means" })).toBeVisible();
    await expect(page.getByRole("table", { name: "What each of the five fields means" }).getByRole("columnheader")).toHaveText(["Field", "As written", "Meaning", "Values"]);
    // an unreadable expression is announced once, with its message
    await input(page).fill("60 * * * *");
    await btn(page, "Explain").click();
    await expect(page.locator("#ce-live")).toContainText("Could not read this as a cron expression. Field 1 (minute): 60 is outside 0 to 59");
  });

  test("the comparison table makes sourced claims only, and the page never claims a binary was run", async ({ page, go }) => {
    await open(page, go);
    const text = await page.locator("main").innerText();
    expect(text).toContain("No cronie program was run to confirm it.");
    expect(text).not.toMatch(/Spring/); // not read, so not mentioned
    expect(text).not.toMatch(/Jenkins/);
    expect(text).not.toMatch(/guaranteed/i);
    expect(text).not.toMatch(/compatible with (all|every) /i);
    const table = page.getByRole("region", { name: "Cron dialects compared" });
    await expect(table).toContainText("The controller's local zone unless .spec.timeZone is set");
    await expect(table).toContainText("Not supported"); // GitHub Actions macros
    await expect(table).toContainText("20/15 * * * *");
  });
});

test.describe("Cron Expression Explainer on a desktop width", () => {
  test.use({ viewport: { width: 1100, height: 900 } });

  test("the field table is a real table with a header row, and the cards sit in two columns", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "*/15 9-17 1,15 jan-mar mon,wed");
    await expect(page.locator(".ce-table__head")).toBeVisible();
    const head = await page.locator(".ce-table__head").boundingBox();
    const row = await page.locator(".ce-table__row").first().boundingBox();
    expect(row.y).toBeGreaterThan(head.y);
    const cells = await page.locator(".ce-table__row").first().locator(".ce-table__cell").evaluateAll((c) => c.map((x) => x.getBoundingClientRect().left));
    expect(cells[0]).toBeLessThan(cells[1]);
    expect(cells[1]).toBeLessThan(cells[2]); // side by side, not stacked
    const notes = await page.locator("#ce-notes-heading").boundingBox();
    const runs = await page.locator("#ce-runs-heading").boundingBox();
    expect(Math.abs(notes.y - runs.y)).toBeLessThan(5); // two columns
    await expectNoHorizontalOverflow(page);
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`Cron Expression Explainer at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`the longest accepted expression and a full result fit: no page-level overflow, readable text and 44px targets at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      const list = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i).join(",");
      const longest = `${list(1, 22)} ${list(0, 23)} ${list(1, 23)} jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec mon,tue,wed,thu,fri,sat,sun`;
      expect(longest.length).toBeLessThanOrEqual(256); // the longest the tool accepts, every field near its 64-character limit
      await input(page).fill(longest);
      await btn(page, "Explain").click();
      await expect(results(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const wide = await page.locator("#ce-results *").evaluateAll((els, w) => els.filter((e) => e.getBoundingClientRect().right > w + 1).map((e) => e.tagName + "." + e.className), width);
      expect(wide).toEqual([]);
      // the stacked list: each row shows its label before the value
      const rowBox = await page.locator(".ce-table__row").first().boundingBox();
      expect(rowBox.width).toBeLessThanOrEqual(width);
      const sizes = await page.locator(".ce-table__cell, #ce-summary, #ce-status-text, .ce-notes li, .ce-runs li").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      for (const s of sizes) expect(s).toBeGreaterThanOrEqual(13);
      expect(parseFloat(await input(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      for (const name of ["Explain", "Reset", "Copy expression", "Copy summary", "@daily", "30 4 * * mon-fri"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
    });

    test(`the 256-character limit, the error panel and the static tables fit at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page); // the empty state, with the comparison table inside its own scroll box
      await input(page).fill("0" + " ".repeat(248) + "0 * * *");
      await btn(page, "Explain").click();
      await expect(results(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await input(page).fill("1".repeat(300));
      await btn(page, "Explain").click();
      await expect(errorBox(page)).toBeVisible();
      await expect(page.locator("#ce-error-message")).toContainText("limit of this tool, not of cron");
      await expectNoHorizontalOverflow(page);
      await input(page).fill("<" + "x".repeat(60) + "> * * * *");
      await btn(page, "Explain").click();
      await expect(errorBox(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      // the wide comparison table scrolls inside its own region, which is keyboard-reachable
      const region = page.getByRole("region", { name: "Cron dialects compared" });
      await expect(region).toHaveAttribute("tabindex", "0");
      expect(await region.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
    });
  });
}

test.describe("Cron Expression Explainer with larger text", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("text enlarged to 200%: the box, the result and the tables still fit the page and the buttons stay reachable", async ({ page, go }) => {
    await open(page, go);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" }); // the browser's text-size setting
    await expectNoHorizontalOverflow(page);
    await explain(page, "*/15 9-17 1,15 jan-mar mon,wed");
    await expect(results(page)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    for (const name of ["Explain", "Reset", "Copy expression", "Copy summary"]) {
      const box = await btn(page, name).boundingBox();
      expect(box.height, name).toBeGreaterThanOrEqual(44);
      expect(box.x + box.width, name).toBeLessThanOrEqual(390);
    }
    await explain(page, "60 * * * *");
    await expect(errorBox(page)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("Cron Expression Explainer in the Developer Tools section", () => {
  test("it is listed with the other four, and its related tool is the Unix converter only, linked from its own text", async ({ page, go, siteRoot }) => {
    await go("developer-tools.html");
    const hrefs = await page.locator("a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    for (const id of ["json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder", "cron-expression-explainer"]) expect(hrefs).toContain(`${siteRoot}tools/${id}/`);
    await expect(page.locator("body")).toContainText("Cron Expression Explainer");
    // the older pages are unchanged: they do not mention the new tool
    for (const id of ["json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder"]) {
      await go(`tools/${id}/`);
      await expect(page.locator("main")).not.toContainText("Cron Expression");
    }
    await go("tools/cron-expression-explainer/");
    const links = await page.locator("main .calculator-info a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(links).toEqual([`${siteRoot}tools/unix-timestamp-converter/`]);
    await page.locator("main .calculator-info a").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools/unix-timestamp-converter/`);
  });

  test("global search finds it by its own names", async ({ page, go, siteRoot }) => {
    for (const q of ["cron expression explainer", "explain cron expression", "crontab syntax", "cron next run times"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/cron-expression-explainer/']`).first(), q).toBeVisible();
    }
  });

  test("a direct visit and a refresh both load the page, and a refresh clears the box", async ({ page, go }) => {
    await open(page, go);
    await explain(page, "30 4 * * mon-fri");
    await expect(results(page)).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#ce-panel")).toHaveAttribute("data-ready", "true");
    await expect(input(page)).toHaveValue("");
    await expect(results(page)).toBeHidden();
    await expect(page.locator("h1")).toHaveText("Cron Expression Explainer");
    expect(page.url()).toMatch(/\/tools\/cron-expression-explainer\/$/);
  });
});
