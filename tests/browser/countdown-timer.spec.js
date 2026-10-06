/**
 * Tool Pack 13: Countdown Timer.
 *
 * Time is driven by Playwright's fake clock (page.clock) so nothing waits in real time:
 *   runFor(ms)       advances the clock and fires every timer due on the way, like a foreground tab;
 *   fastForward(ms)  jumps the clock and fires due timers at most ONCE, like a background tab whose timers were throttled.
 * One test at the end runs a short timer on the real clock.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const display = (page) => page.locator("#ct-display");
const panel = (page) => page.locator("#ct-panel");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await page.clock.install({ time: new Date("2026-03-10T10:00:00Z") });
  await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z")); // paused: time moves only when a test says so
  await go("tools/countdown-timer/");
  await expect(page.locator("#ct-start")).toBeVisible();
  await expect(panel(page)).toHaveAttribute("data-ready", "true"); // the script has run
}
async function setTime(page, { hours = "", minutes = "", seconds = "" }) {
  await page.locator("#ct-hours").fill(String(hours));
  await page.locator("#ct-minutes").fill(String(minutes));
  await page.locator("#ct-seconds").fill(String(seconds));
}
const buttonsShown = async (page) =>
  (await page.locator(".ct-actions button:visible").allInnerTexts()).map((t) => t.trim());

test.describe("Countdown Timer", () => {
  test("page, breadcrumb, the initial state and its single action", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Countdown Timer");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 3)).toEqual(["home", "time tools", "countdown timer"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}time-tools.html`]);

    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    for (const label of ["Hours", "Minutes", "Seconds"]) await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    for (const id of ["#ct-hours", "#ct-minutes", "#ct-seconds"]) await expect(page.locator(id)).toHaveValue("");
    expect(await buttonsShown(page)).toEqual(["Start"]);
    await expect(page.locator("#ct-stage")).toBeHidden();
    await expect(page.getByRole("group", { name: "Quick presets" }).getByRole("button")).toHaveText(["1 min", "5 min", "10 min", "25 min", "30 min", "60 min"]);
    await expect(page.getByLabel("Play a short sound when the timer finishes")).toBeChecked();
    await expect(page.locator(".related-section")).toHaveCount(0);
    expectClean(watch);
  });

  test("set 10 seconds, start, pause, resume, finish, reset", async ({ page, go }) => {
    await open(page, go);
    const title = await page.title();
    await setTime(page, { seconds: 10 });
    await btn(page, "Start").click();

    await expect(panel(page)).toHaveAttribute("data-state", "running");
    await expect(display(page)).toHaveText("00:10");
    expect(await buttonsShown(page)).toEqual(["Pause", "Reset"]);
    await expect(page.locator("#ct-setup")).toBeHidden();
    await expect(page.locator("#ct-status")).toContainText("Running");
    await expect(btn(page, "Pause")).toBeFocused(); // focus follows the button that replaced Start

    await page.clock.runFor(3000);
    await expect(display(page)).toHaveText("00:07");
    await expect(page).toHaveTitle("00:07 — Countdown Timer");

    await btn(page, "Pause").click();
    await expect(panel(page)).toHaveAttribute("data-state", "paused");
    expect(await buttonsShown(page)).toEqual(["Resume", "Reset"]);
    await expect(page.locator("#ct-status")).toContainText("Paused");
    await expect(page).toHaveTitle("Paused 00:07 — Countdown Timer");
    await page.clock.runFor(60_000); // time passes while paused
    await expect(display(page)).toHaveText("00:07");
    await expect(btn(page, "Resume")).toBeFocused();

    await btn(page, "Resume").click();
    await expect(panel(page)).toHaveAttribute("data-state", "running");
    await page.clock.runFor(4000);
    await expect(display(page)).toHaveText("00:03");

    await page.clock.runFor(3000);
    await expect(panel(page)).toHaveAttribute("data-state", "finished");
    await expect(display(page)).toHaveText("00:00");
    await expect(page.locator("#ct-status")).toHaveText("Timer complete");
    expect(await buttonsShown(page)).toEqual(["Restart", "Reset"]);
    await expect(page).toHaveTitle(title); // the original title is back
    await page.clock.runFor(100); // fires the 50 ms announcement timer
    await expect(page.locator("#ct-live")).toHaveText("Timer complete.");
    await page.clock.runFor(20_000); // it stays at zero: never negative
    await expect(display(page)).toHaveText("00:00");
    await expect(display(page)).not.toContainText(/-|NaN|undefined/);

    await btn(page, "Reset").click();
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    await expect(page.locator("#ct-seconds")).toHaveValue("10"); // the time last used is kept for the next run
    await expect(page.locator("#ct-hours")).toBeFocused();
    expect(await buttonsShown(page)).toEqual(["Start"]);
  });

  test("a hidden tab: the time is right when the page is visible again", async ({ page, go }) => {
    await open(page, go);
    await setTime(page, { minutes: 5 });
    await btn(page, "Start").click();
    await expect(display(page)).toHaveText("05:00");
    // a background tab: the clock moves 100 seconds but the page's timers fire at most once
    await page.clock.fastForward(100_000);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(display(page)).toHaveText("03:20");
    await expect(page).toHaveTitle("03:20 — Countdown Timer");
    // and one that ran out while hidden is finished on the first look
    await page.clock.fastForward(10 * 60_000);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(panel(page)).toHaveAttribute("data-state", "finished");
    await expect(display(page)).toHaveText("00:00");
  });

  test("repeated pause and resume lose and add no time", async ({ page, go }) => {
    await open(page, go);
    await setTime(page, { minutes: 2 });
    await btn(page, "Start").click();
    for (let i = 0; i < 5; i++) {
      await page.clock.runFor(10_000);
      await btn(page, "Pause").click();
      await page.clock.runFor(7_000 + i * 1000);
      await btn(page, "Resume").click();
    }
    await expect(display(page)).toHaveText("01:10"); // 120 s minus the 50 s it was running
  });

  test("90 seconds is 1 minute 30 seconds, an hour shows hh:mm:ss, and Restart runs the same time again", async ({ page, go }) => {
    await open(page, go);
    await setTime(page, { seconds: 90 });
    await btn(page, "Start").click();
    await expect(display(page)).toHaveText("01:30");
    await btn(page, "Reset").click();
    await expect(page.locator("#ct-minutes")).toHaveValue("1");
    await expect(page.locator("#ct-seconds")).toHaveValue("30");
    await setTime(page, { hours: 1, minutes: 25 });
    await btn(page, "Start").click();
    await expect(display(page)).toHaveText("01:25:00");
    await btn(page, "Reset").click();
    await setTime(page, { seconds: 2 });
    await btn(page, "Start").click();
    await page.clock.runFor(2500);
    await expect(btn(page, "Restart")).toBeFocused();
    await btn(page, "Restart").click();
    await expect(panel(page)).toHaveAttribute("data-state", "running");
    await expect(display(page)).toHaveText("00:02");
  });

  test("presets fill the fields (they do not start the timer), and show which one is chosen", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "25 min").click();
    await expect(page.locator("#ct-minutes")).toHaveValue("25");
    await expect(page.locator("#ct-hours")).toHaveValue("");
    await expect(btn(page, "25 min")).toHaveAttribute("aria-pressed", "true");
    await expect(btn(page, "5 min")).toHaveAttribute("aria-pressed", "false");
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    await btn(page, "60 min").click();
    await expect(page.locator("#ct-hours")).toHaveValue("1");
    await expect(page.locator("#ct-minutes")).toHaveValue("");
    await page.locator("#ct-minutes").fill("5");
    await expect(btn(page, "60 min")).toHaveAttribute("aria-pressed", "false"); // typed over: no preset matches
    await btn(page, "Start").click();
    await expect(display(page)).toHaveText("01:05:00");
  });

  test("validation: zero, blank, negative, decimal, text and too long never start a timer or show NaN", async ({ page, go }) => {
    await open(page, go);
    const error = page.locator("#ct-error");
    await btn(page, "Start").click();
    await expect(error).toContainText("Set a time above zero");
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    await setTime(page, { hours: 0, minutes: 0, seconds: 0 });
    await btn(page, "Start").click();
    await expect(error).toContainText("above zero");
    for (const bad of ["-5", "1.5", "abc", "1e3"]) {
      await setTime(page, { minutes: bad });
      await btn(page, "Start").click();
      await expect(error, bad).toContainText("Minutes: enter a whole number");
      await expect(page.locator("#ct-minutes")).toHaveAttribute("aria-invalid", "true");
      await expect(panel(page)).toHaveAttribute("data-state", "idle");
    }
    await setTime(page, { hours: 24, seconds: 1 });
    await btn(page, "Start").click();
    await expect(error).toContainText("24 hours");
    await setTime(page, { hours: 24 });
    await btn(page, "Start").click(); // exactly 24 hours is allowed
    await expect(display(page)).toHaveText("24:00:00");
    await expect(page.locator("main")).not.toContainText(/NaN|undefined|Infinity/);
  });

  test("the error clears as soon as the visitor edits", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    await expect(page.locator("#ct-error")).toBeVisible();
    await page.locator("#ct-minutes").fill("1");
    await expect(page.locator("#ct-error")).toBeHidden();
  });

  test("Enter in a field starts the timer", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#ct-minutes").fill("3");
    await page.locator("#ct-minutes").press("Enter");
    await expect(display(page)).toHaveText("03:00");
  });

  test("accessibility semantics: a timer role that is not live, one status region, no per-second announcement", async ({ page, go }) => {
    await open(page, go);
    await expect(display(page)).toHaveAttribute("role", "timer");
    await expect(display(page)).toHaveAttribute("aria-live", "off");
    await expect(page.locator("#ct-live")).toHaveAttribute("aria-live", "polite");
    await setTime(page, { seconds: 20 });
    await btn(page, "Start").click();
    await page.clock.runFor(100); // fires the 50 ms announcement timer
    await expect(page.locator("#ct-live")).toHaveText("Timer started for 20 seconds.");
    await page.clock.runFor(5000);
    await page.clock.runFor(100); // fires the 50 ms announcement timer
    await expect(page.locator("#ct-live")).toHaveText("Timer started for 20 seconds."); // five ticks later: unchanged
    await btn(page, "Pause").click();
    await page.clock.runFor(100); // fires the 50 ms announcement timer
    await expect(page.locator("#ct-live")).toHaveText("Timer paused at 00:15.");
    await btn(page, "Resume").click();
    await page.clock.runFor(100); // fires the 50 ms announcement timer
    await expect(page.locator("#ct-live")).toHaveText("Timer resumed.");
    await btn(page, "Reset").click();
    await page.clock.runFor(100); // fires the 50 ms announcement timer
    await expect(page.locator("#ct-live")).toHaveText("Timer reset.");
  });

  test("scope and copy: no notification, account or accuracy-superlative claims", async ({ page, go }) => {
    await open(page, go);
    const body = page.locator("main");
    for (const h of ["How to Use the Countdown Timer", "How the Timer Stays Accurate", "Using the Timer in Another Browser Tab", "Common Uses"]) {
      await expect(body.getByRole("heading", { name: h })).toBeVisible();
    }
    await expect(body.locator("details")).toHaveCount(5);
    await expect(body).not.toContainText(/100% accurate|most accurate|\bbest\b|ultimate|streak|badge/i);
    expect(await page.evaluate(() => typeof Notification === "undefined" ? "none" : Notification.permission)).not.toBe("granted");
  });

  test("the layout does not overflow in any state, and the controls are easy to tap", async ({ page, go }) => {
    await open(page, go);
    await expectNoHorizontalOverflow(page);
    for (const sel of ["#ct-hours", "#ct-minutes", "#ct-seconds", "#ct-start"]) {
      expect((await page.locator(sel).boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    await setTime(page, { hours: 24 });
    await btn(page, "Start").click();
    await expectNoHorizontalOverflow(page);
    for (const name of ["Pause", "Reset"]) expect((await btn(page, name).boundingBox()).height).toBeGreaterThanOrEqual(44);
    await btn(page, "Pause").click();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("Countdown Timer on the real clock", () => {
  test("a 2 second timer runs and finishes in real time", async ({ page, go }) => {
    await go("tools/countdown-timer/");
    await setTime(page, { seconds: 2 });
    await btn(page, "Start").click();
    await expect(display(page)).toHaveText("00:02");
    await expect(panel(page)).toHaveAttribute("data-state", "finished", { timeout: 6000 });
    await expect(display(page)).toHaveText("00:00");
  });
});

test.describe("Countdown Timer in Time Tools and search", () => {
  test("Time Tools and All Tools list it, directly under the section", async ({ page, go }) => {
    await go("time-tools.html");
    await expect(page.locator('a[href$="tools/countdown-timer/"]')).toHaveCount(1);
    await expect(page.locator('a[href$="tools/date-difference/"]')).toHaveCount(1);
    await expect(page.locator('a[href$="tools/date-calculator/"]')).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(/coming soon|timers|productivity/i);
    await go("tools.html");
    await expect(page.locator('.directory-section a[href$="tools/countdown-timer/"]')).toHaveCount(1);
  });

  test("the path Home > All Tools > Time Tools > Countdown Timer works by clicking", async ({ page, go, siteRoot }) => {
    await go("");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Time Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}time-tools.html`);
    await page.locator('a[href$="tools/countdown-timer/"]').first().click();
    await expect(page.locator("h1")).toHaveText("Countdown Timer");
  });

  test("search: names and aliases lead with the right tool, and the date tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["countdown timer", "timer", "online timer", "minute timer", "study timer", "focus timer"]) {
      await expect(await first(q), q).toContainText("Countdown Timer");
    }
    for (const q of ["date difference", "days between dates"]) await expect(await first(q), q).toContainText("Date Difference Calculator");
    for (const q of ["date calculator", "add days to date"]) await expect(await first(q), q).toContainText("Date Calculator");
    await go("tools.html?q=timer");
    await expect(page.locator("#tools-results a.directory-result", { hasText: "Countdown Timer" })).toHaveCount(1);
  });

  test("calculator searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("timer");
    await expect(page.locator("main")).not.toContainText("Countdown Timer");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("countdown timer");
    await expect(page.locator("#calculators-grid")).not.toContainText("Countdown Timer");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("timer");
    await expect(page.locator("main")).not.toContainText("Countdown Timer");
  });
});
