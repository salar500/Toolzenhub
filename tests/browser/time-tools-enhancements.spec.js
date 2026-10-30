/**
 * Time Tools ecosystem: the five enhancements to existing tools.
 *   A  Time Zone Converter: clock changes (daylight saving) around the converted time
 *   B  Countdown Timer: "Count down to a date" mode
 *   C  Date Calculator: ISO week panel
 *   D  Date Difference: "Use today"
 *   E  Hours & Timesheet Calculator: optional rounding and a copied summary
 * plus the Time Tools related-tools pilot on the older pages that gained a curated link.
 * The rules are in tests/unit; these tests check the pages are wired to them.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

test.use({ timezoneId: "Asia/Kolkata", locale: "en-US" });

const btn = (page, name) => page.getByRole("button", { name, exact: true });

test.describe("Time Zone Converter: clock changes", () => {
  test("names the next change of each zone and when the gap between them moves", async ({ page, go, watch }) => {
    await page.clock.install({ time: new Date("2026-03-01T12:00:00Z") });
    await go("tools/time-zone-converter/?d=2026-03-01&t=12:00&from=Europe/London&to=America/New_York");
    await expect(page.locator("#tz-panel")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#tz-dst")).toBeVisible();
    const text = await page.locator("#tz-dst-list").innerText();
    expect(text).toContain("America/New_York, next change");
    expect(text).toContain("Clocks go forward 1 hour on Sunday 8 March 2026: 02:00 becomes 03:00");
    expect(text).toContain("Europe/London, next change");
    expect(text).toContain("Clocks go forward 1 hour on Sunday 29 March 2026: 01:00 becomes 02:00");
    expect(text).toContain("America/New_York against Europe/London");
    expect(text).toContain("5 hours now, then 4 hours");
    await expect(page.locator(".calculator-info a[href*='meeting-planner']")).toHaveCount(1);
    await expectNoHorizontalOverflow(page);
    expectClean(watch);
  });

  test("a zone that never changes says so", async ({ page, go }) => {
    await page.clock.install({ time: new Date("2026-03-01T12:00:00Z") });
    await go("tools/time-zone-converter/?d=2026-03-01&t=12:00&from=Asia/Kolkata&to=Asia/Singapore");
    await expect(page.locator("#tz-dst-list")).toContainText("Asia/Kolkata: no clock change within 200 days");
    await expect(page.locator("#tz-dst-list")).not.toContainText("against");
  });
});

test.describe("Countdown Timer: count down to a date", () => {
  async function open(page, go, query = "") {
    await page.clock.install({ time: new Date("2026-03-10T10:00:00Z") });
    await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z"));
    await go(`tools/countdown-timer/${query}`);
    await expect(page.locator("#ct-panel")).toHaveAttribute("data-ready", "true");
  }

  test("the length mode stays the default, and the date mode counts to a moment in a zone", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("#ct-panel")).toBeVisible();
    await expect(page.locator("#cd-panel")).toBeHidden();
    await page.getByLabel("Count down to a date").check();
    await expect(page.locator("#ct-panel")).toBeHidden();
    await expect(page.locator("#cd-panel")).toBeVisible();

    await page.locator("#cd-name").fill("Launch");
    await page.locator("#cd-date").fill("2026-03-12");
    await page.locator("#cd-time").fill("10:00");
    await page.locator("#cd-zone").fill("UTC");
    await btn(page, "Start countdown").click();
    await expect(page.locator("#cd-panel")).toHaveAttribute("data-state", "running");
    await expect(page.locator("#cd-title")).toHaveText("Launch");
    await expect(page.locator("#cd-display")).toHaveText("1 day 23:59:59");
    await expect(page.locator("#cd-event")).toContainText("Thursday, 12 March 2026, 10:00");

    await page.clock.fastForward(3_600_000); // like a background tab: due timers run once
    await expect(page.locator("#cd-display")).toHaveText("1 day 22:59:59");
    await page.clock.fastForward(2 * 86_400_000);
    await expect(page.locator("#cd-panel")).toHaveAttribute("data-state", "reached");
    await expect(page.locator("#cd-status")).toContainText("reached");

    await btn(page, "Reset").click();
    await expect(page.locator("#cd-date")).toBeFocused();
    await expect(page.locator("#cd-stage")).toBeHidden();
    expectClean(watch);
  });

  test("a time that does not exist, a past time and a bad date are refused", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Count down to a date").check();
    await page.locator("#cd-zone").fill("America/New_York");
    await page.locator("#cd-date").fill("2026-03-08");
    await page.locator("#cd-time").fill("02:30");
    await btn(page, "Start countdown").click();
    await expect(page.locator("#cd-error")).toContainText("does not exist");
    await expect(page.locator("#cd-time")).toHaveAttribute("aria-invalid", "true");

    await page.locator("#cd-date").fill("2026-03-01");
    await page.locator("#cd-time").fill("09:00");
    await btn(page, "Start countdown").click();
    await expect(page.locator("#cd-error")).toContainText("already passed");
    await expect(page.locator("#cd-panel")).toHaveAttribute("data-state", "idle");
  });

  test("a time that happens twice asks which, and a link restores the countdown", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Count down to a date").check();
    await page.locator("#cd-zone").fill("America/New_York");
    await page.locator("#cd-date").fill("2026-11-01");
    await page.locator("#cd-time").fill("01:30");
    await btn(page, "Start countdown").click();
    await expect(page.locator("#cd-choice")).toBeVisible();
    await expect(page.locator("#cd-panel")).toHaveAttribute("data-state", "idle");
    await page.getByLabel("The second time").check();
    await btn(page, "Start countdown").click();
    await expect(page.locator("#cd-panel")).toHaveAttribute("data-state", "running");
    await expect(page.locator("#cd-event")).toContainText("the second time");
  });

  test("an address with a target opens in date mode and is validated", async ({ page, go }) => {
    await open(page, go, "?to=2026-12-25T09:30&tz=Europe/London&name=Holiday");
    await expect(page.locator("#cd-panel")).toBeVisible();
    await expect(page.locator("#cd-title")).toHaveText("Holiday");
    await expect(page.locator("#cd-panel")).toHaveAttribute("data-state", "running");
    await expect(page.locator("#cd-event")).toContainText("Friday, 25 December 2026, 09:30");
  });

  test("a hostile name is shown as text only", async ({ page, go }) => {
    await open(page, go, "?to=2026-12-25T09:30&name=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E");
    await expect(page.locator("#cd-title")).toHaveText("<img src=x onerror=alert(1)>");
    await expect(page.locator("#cd-title img")).toHaveCount(0);
  });
});

test.describe("Date Calculator: ISO week", () => {
  test("shows the ISO week and year of the result, across a year boundary", async ({ page, go, watch }) => {
    await go("tools/date-calculator/");
    await page.locator("#dcalc-start").fill("2026-12-30");
    await page.locator("#dcalc-days").fill("2");
    const panel = page.locator(".dcalc-iso");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("ISO week 53 of 2026, Friday");
    await expect(panel).toContainText("day 1 of the calendar year 2027");
    await expect(panel).toContainText("ISO year 2026 has 53 weeks");
    await expectNoHorizontalOverflow(page);
    expectClean(watch);
  });
});

test.describe("Date Difference: Use today", () => {
  test("fills a date only when pressed, from the browser's calendar date", async ({ page, go, watch }) => {
    await page.clock.install({ time: new Date("2026-03-10T20:00:00Z") }); // 01:30 on 11 March in India
    await go("tools/date-difference/");
    await expect(page.locator("#date-start")).toHaveValue("");
    const buttons = page.getByRole("button", { name: "Use today's date for this field" });
    await expect(buttons).toHaveCount(2);
    await buttons.first().click();
    await expect(page.locator("#date-start")).toHaveValue("2026-03-11");
    await expect(page.locator("#date-start")).toBeFocused();
    await expect(page.locator("#date-end")).toHaveValue("");
    await page.locator("#date-end").fill("2026-03-20");
    await expect(page.locator("#date-results")).toContainText("9 days");
    expectClean(watch);
  });
});

test.describe("Hours & Timesheet: rounding and copy", () => {
  // the test origin is not a secure context, so the clipboard is stubbed (as in the Time Zone Converter spec)
  const stubClipboard = (page, accept = true) => page.evaluate((ok) => {
    window.__copied = [];
    Object.defineProperty(navigator, "clipboard", { value: { writeText: (t) => (ok ? (window.__copied.push(t), Promise.resolve()) : Promise.reject(new Error("no"))) }, configurable: true });
  }, accept);

  test("the default is exact; rounding is optional and the exact total stays visible", async ({ page, go, watch }) => {
    await go("tools/hours-calculator/");
    await expect(page.locator("#hc-panel")).toHaveAttribute("data-ready", "true");
    await btn(page, "Load example").click();
    await expect(page.locator("#hc-total-hm")).toHaveText("19:15");
    await expect(page.locator("#hc-round-step")).toHaveValue("0");
    await expect(page.locator("#hc-round-scope")).toBeDisabled();
    await expect(page.locator("#hc-rounded")).toBeHidden();

    await page.locator("#hc-round-step").selectOption("30");
    await expect(page.locator("#hc-round-scope")).toBeEnabled();
    await expect(page.locator("#hc-rounded")).toContainText("Rounded to the nearest 30 minutes, each shift: 19:30");
    await expect(page.locator("#hc-rounded")).toContainText("exact total of 19:15");
    await expect(page.locator("#hc-total-hm")).toHaveText("19:15"); // the exact total never changes

    await page.locator("#hc-round-scope").selectOption("total");
    await expect(page.locator("#hc-rounded")).toContainText("the total: 19:30");

    await stubClipboard(page);
    await btn(page, "Copy summary").click();
    await expect(page.locator("#hc-copy-status")).toHaveText("Copied to the clipboard.");
    const copied = (await page.evaluate(() => window.__copied))[0];
    expect(copied).toContain("Total: 19:15 (19.25 decimal hours)");
    expect(copied).toContain("Rounded to the nearest 30 minutes, the total: 19:30");
    await expectNoHorizontalOverflow(page);
    expectClean(watch);
  });

  test("if the browser refuses the copy, the text is shown to copy by hand", async ({ page, go }) => {
    await go("tools/hours-calculator/");
    await expect(page.locator("#hc-panel")).toHaveAttribute("data-ready", "true");
    await btn(page, "Load example").click();
    await stubClipboard(page, false);
    await btn(page, "Copy summary").click();
    await expect(page.locator("#hc-copy-status")).toContainText("Copying is not available here");
    await expect(page.locator(".hc-manual")).toHaveValue(/Total: 19:15/);
  });

  test("with nothing counted there is nothing to copy", async ({ page, go }) => {
    await go("tools/hours-calculator/");
    await expect(page.locator("#hc-panel")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#hc-copy")).toBeDisabled();
  });
});

test.describe("Time Tools related-tools pilot", () => {
  const pairs = [
    ["tools/world-clock/", "meeting-planner"],
    ["tools/time-zone-converter/", "meeting-planner"],
    ["tools/date-calculator/", "business-days"],
    ["tools/hours-calculator/", "shift-planner"],
    ["tools/pomodoro-timer/", "interval-timer"],
    ["tools/interval-timer/", "pomodoro-timer"],
    ["tools/business-days/", "date-calculator"],
    ["tools/meeting-planner/", "world-clock"]
  ];

  for (const [path, linked] of pairs) {
    test(`${path} links to ${linked}, in its own section only`, async ({ page, go }) => {
      await go(path);
      const section = page.locator(".related-section");
      await expect(section).toHaveCount(1);
      await expect(section.locator("h2")).toHaveText("Related Time Tools");
      await expect(section.locator(`a[href*='/${linked}/']`)).toHaveCount(1);
      const hrefs = await section.locator(".related-calculator-card").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
      for (const href of hrefs) expect(href).toMatch(/\/tools\/[a-z-]+\/$/);
      await expect(section.locator("a[href*='/calculators/']")).toHaveCount(0);
    });
  }

  test("pages outside the pilot still show no related section", async ({ page, go }) => {
    // JSON Formatter joined the related-tools rollout with the Developer Tools (tests/browser/developer-tools-related.spec.js)
    for (const path of ["tools/stopwatch/"]) {
      await go(path);
      await expect(page.locator(".related-section")).toHaveCount(0);
    }
  });
});
