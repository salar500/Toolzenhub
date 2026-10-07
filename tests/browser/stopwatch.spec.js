/**
 * Tool Pack 14: Stopwatch.
 *
 * Time is driven by Playwright's fake clock (page.clock), which controls performance.now() and requestAnimationFrame:
 *   runFor(ms)       advances the clock and runs every frame due on the way, like a foreground tab;
 *   fastForward(ms)  jumps the clock and runs due callbacks at most once, like a background tab whose frames were throttled.
 * One test at the end runs on the real clock.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const display = (page) => page.locator("#sw-display");
const panel = (page) => page.locator("#sw-panel");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const rows = (page) => page.locator("#sw-lap-rows tr");

// the fake clock is installed and then PAUSED, so time moves only when a test says so (otherwise real time keeps flowing into it)
async function freezeClock(page) {
  await page.clock.install({ time: new Date("2026-03-10T10:00:00Z") });
  await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z"));
}
const settle = (page) => page.clock.runFor(100); // fires the 50 ms announcement timer and a repaint
async function open(page, go) {
  await freezeClock(page);
  await go("tools/stopwatch/");
  await expect(btn(page, "Start")).toBeVisible();
  await expect(panel(page)).toHaveAttribute("data-ready", "true"); // the script has run
}
const shown = async (page) => (await page.locator(".sw-actions button:visible").allInnerTexts()).map((t) => t.trim());
const rowTexts = async (page) => (await rows(page).allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim());

test.describe("Stopwatch", () => {
  test("page, breadcrumb, the initial state and its single action", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Stopwatch");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 3)).toEqual(["home", "time tools", "stopwatch"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}time-tools.html`]);
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    await expect(display(page)).toHaveText("00:00.0");
    await expect(page.locator("#sw-status")).toHaveText("Ready");
    expect(await shown(page)).toEqual(["Start"]);
    await expect(page.locator("#sw-laps")).toBeHidden();
    await expect(page.locator(".related-section")).toHaveCount(0);
    expectClean(watch);
  });

  test("Start, Lap, Lap, Pause, Resume, Lap, Reset", async ({ page, go }) => {
    await open(page, go);
    const title = await page.title();
    await btn(page, "Start").click();
    await expect(panel(page)).toHaveAttribute("data-state", "running");
    expect(await shown(page)).toEqual(["Lap", "Pause"]);
    await expect(btn(page, "Pause")).toBeFocused(); // focus follows the toggle button, so Space means the same with or without focus on it
    await expect(page.locator("#sw-status")).toHaveText("Running");

    await page.clock.runFor(12_320); // a frame lands within 16 ms of the end, so the display shows the tenth just reached
    await expect(display(page)).toHaveText("00:12.3");
    await expect(page).toHaveTitle("00:12 — Stopwatch");
    await btn(page, "Lap").click();
    expect(await rowTexts(page)).toEqual(["1 00:12.3 00:12.3"]);

    await page.clock.fastForward(30_000);
    await btn(page, "Lap").click();
    expect(await rowTexts(page)).toEqual(["2 Slowest 00:30.0 00:42.3", "1 Fastest 00:12.3 00:12.3"]); // newest first; two different laps, so the extremes are marked
    await expect(page.locator("#sw-current")).toHaveText("Lap 3: 00:00.0");

    await page.clock.runFor(2_000);
    await expect(page.locator("#sw-current")).toHaveText(/^Lap 3: 00:0[12]\.\d$/);
    await btn(page, "Pause").click();
    await expect(panel(page)).toHaveAttribute("data-state", "paused");
    expect(await shown(page)).toEqual(["Resume", "Reset"]);
    await expect(display(page)).toHaveText("00:44.3");
    await expect(page).toHaveTitle("Paused 00:44 — Stopwatch");
    await page.clock.fastForward(60_000); // paused: the time stays
    await expect(display(page)).toHaveText("00:44.3");
    await expect(btn(page, "Resume")).toBeFocused();

    await btn(page, "Resume").click();
    await page.clock.runFor(5_720);
    await expect(display(page)).toHaveText("00:50.0");
    await btn(page, "Lap").click();
    expect((await rowTexts(page))[0]).toBe("3 Fastest 00:07.7 00:50.0");

    await btn(page, "Pause").click();
    await btn(page, "Reset").click();
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    await expect(display(page)).toHaveText("00:00.0");
    await expect(page.locator("#sw-laps")).toBeHidden();
    await expect(page.locator("#sw-lap-rows tr")).toHaveCount(0);
    expect(await shown(page)).toEqual(["Start"]);
    await expect(page).toHaveTitle(title);
    await expect(btn(page, "Start")).toBeFocused();
  });

  test("Reset is not offered while running (no accidental wipe) and nothing needs a confirmation dialog", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    await expect(btn(page, "Reset")).toBeHidden();
    await page.keyboard.press("r"); // the shortcut is paused-only too
    await expect(panel(page)).toHaveAttribute("data-state", "running");
  });

  test("a hidden tab: the time is right on return, and laps taken after the gap are right", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    await page.clock.runFor(5_000);
    // a background tab: the clock moves 1 hour 2 minutes 3.4 seconds but no frames run
    await page.clock.fastForward(3_723_400);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(display(page)).toHaveText("1:02:08.4");
    await expect(display(page)).toHaveAttribute("data-long", "true");
    await btn(page, "Lap").click();
    expect((await rowTexts(page))[0]).toBe("1 1:02:08.4 1:02:08.4");
    await page.clock.runFor(1_620);
    await expect(display(page)).toHaveText("1:02:10.0"); // painting resumed
  });

  test("repeated pause and resume lose and add no time", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    for (let i = 0; i < 6; i++) {
      await page.clock.fastForward(10_000);
      await btn(page, "Pause").click();
      await page.clock.fastForward(7_000 + i * 1000);
      await btn(page, "Resume").click();
    }
    await page.clock.runFor(520);
    await expect(display(page)).toHaveText("01:00.5"); // only the 60.5 s it was running
  });

  test("fastest and slowest are marked in words once there are two different laps", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    await page.clock.fastForward(10_000);
    await btn(page, "Lap").click();
    await expect(page.locator(".sw-mark")).toHaveCount(0); // one lap: nothing to compare
    await page.clock.fastForward(4_000);
    await btn(page, "Lap").click();
    await page.clock.fastForward(7_000);
    await btn(page, "Lap").click();
    expect(await rowTexts(page)).toEqual(["3 00:07.0 00:21.0", "2 Fastest 00:04.0 00:14.0", "1 Slowest 00:10.0 00:10.0"]);
    await expect(page.locator("#sw-lap-rows tr").nth(1).locator(".sw-mark")).toHaveText("Fastest");
    await expect(page.locator("#sw-lap-rows tr").nth(2).locator(".sw-mark")).toHaveText("Slowest");
    await expect(page.locator("#sw-lap-rows tr").nth(0).locator(".sw-mark")).toHaveCount(0);
  });

  test("the lap list is limited to 100 and says so, and the stopwatch carries on", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    await page.locator("h1").click();
    for (let i = 0; i < 100; i++) {
      await page.clock.fastForward(1_000);
      await page.keyboard.press("l");
    }
    await expect(rows(page)).toHaveCount(100);
    await expect(page.locator("#sw-lap-note")).toContainText("lap limit of 100");
    await page.clock.fastForward(1_000);
    await page.keyboard.press("l");
    await settle(page);
    await expect(rows(page)).toHaveCount(100); // no 101st row, no error
    await expect(page.locator("#sw-live")).toHaveText("The lap limit of 100 is reached.");
    await expect(display(page)).toHaveText(/^01:4[01]\.\d$/);
  });

  test("keyboard shortcuts: Space, L and R work from the page, never while typing, and are shown on the page", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator(".sw-keys")).toContainText("Space");
    await page.locator("h1").click();
    await page.keyboard.press("Space");
    await expect(panel(page)).toHaveAttribute("data-state", "running");
    await page.clock.runFor(3_000);
    await page.keyboard.press("l");
    await expect(rows(page)).toHaveCount(1);
    await page.keyboard.press("Space"); // focus is on Pause, so its own Space does the same as the shortcut
    await expect(panel(page)).toHaveAttribute("data-state", "paused");
    await page.keyboard.press("r");
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
    // a text field keeps its keys
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "probe";
      document.querySelector("main").appendChild(input);
    });
    await page.locator("#probe").focus();
    await page.keyboard.type("l r");
    await expect(page.locator("#probe")).toHaveValue("l r");
    await expect(panel(page)).toHaveAttribute("data-state", "idle");
  });

  test("accessibility semantics: a timer that is not live, one status region, no per-tenth announcement, a real table", async ({ page, go }) => {
    await open(page, go);
    await expect(display(page)).toHaveAttribute("role", "timer");
    await expect(display(page)).toHaveAttribute("aria-live", "off");
    await expect(page.locator("#sw-live")).toHaveAttribute("aria-live", "polite");
    await btn(page, "Start").click();
    await settle(page);
    await expect(page.locator("#sw-live")).toHaveText("Stopwatch started.");
    await page.clock.fastForward(5_000);
    await page.clock.runFor(1_000);
    await expect(page.locator("#sw-live")).toHaveText("Stopwatch started."); // seconds later: unchanged
    await page.clock.fastForward(0);
    await btn(page, "Lap").click();
    await settle(page);
    await expect(page.locator("#sw-live")).toHaveText(/^Lap 1: 00:0[56]\.\d\. Total 00:0[56]\.\d\.$/);
    await expect(page.getByRole("table", { name: "Laps, newest first" })).toBeVisible();
    await expect(page.getByRole("columnheader")).toHaveText(["Lap", "Lap time", "Total"]);
    await expect(page.getByRole("rowheader")).toHaveText(["1"]);
    await btn(page, "Pause").click();
    await settle(page);
    await expect(page.locator("#sw-live")).toHaveText(/^Stopwatch paused at 00:0[56]\.\d\.$/);
    await btn(page, "Resume").click();
    await settle(page);
    await expect(page.locator("#sw-live")).toHaveText("Stopwatch resumed.");
    await btn(page, "Pause").click();
    await btn(page, "Reset").click();
    await settle(page);
    await expect(page.locator("#sw-live")).toHaveText("Stopwatch reset.");
  });

  test("painting is economical: the text changes about ten times a second, not every frame, and stops when paused", async ({ page, go }) => {
    await open(page, go);
    await page.evaluate(() => {
      window.__mutations = 0;
      new MutationObserver((list) => { window.__mutations += list.length; }).observe(document.querySelector("#sw-display"), { childList: true, characterData: true, subtree: true });
    });
    await btn(page, "Start").click();
    await page.clock.runFor(10_000); // 10 s is about 600 frames
    const running = await page.evaluate(() => window.__mutations);
    expect(running).toBeGreaterThan(90);
    expect(running).toBeLessThan(130); // ~100 text changes, not ~600
    await btn(page, "Pause").click();
    const atPause = await page.evaluate(() => window.__mutations);
    await page.clock.runFor(10_000);
    expect(await page.evaluate(() => window.__mutations)).toBe(atPause); // paused: no painting at all
  });

  test("scope and copy: no notification, sound, account or accuracy-superlative claims", async ({ page, go }) => {
    await open(page, go);
    const body = page.locator("main");
    for (const h of ["How to Use the Stopwatch", "Lap Time and Total Time", "How the Stopwatch Stays Accurate", "Using the Stopwatch in Another Browser Tab", "Common Uses"]) {
      await expect(body.getByRole("heading", { name: h })).toBeVisible();
    }
    await expect(body.locator("details")).toHaveCount(5);
    await expect(body.locator('a[href$="tools/countdown-timer/"]')).toHaveCount(1);
    await expect(body).not.toContainText(/100% accurate|most accurate|\bbest\b|ultimate|streak|badge/i);
    await expect(page.locator("audio, input[type=checkbox]")).toHaveCount(0);
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: no overflow, long values fit, controls and laps are usable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 700 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      expect((await btn(page, "Start").boundingBox()).height).toBeGreaterThanOrEqual(44);
      await btn(page, "Start").click();
      for (const n of [3, 5, 7]) {
        await page.clock.fastForward(n * 1000);
        await btn(page, "Lap").click();
      }
      await page.clock.fastForward(99 * 3_600_000); // a very long value, just under the 100 hour limit
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect(display(page)).toHaveText(/^99:\d\d:\d\d\.\d$/);
      await expectNoHorizontalOverflow(page);
      const box = await display(page).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      await expect(page.locator(".sw-mark").first()).toBeVisible();
      for (const name of ["Lap", "Pause"]) expect((await btn(page, name).boundingBox()).height).toBeGreaterThanOrEqual(44);
      await btn(page, "Lap").click();
      await btn(page, "Pause").click();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("it stops by itself at 99:59:59.9, says so, and offers Reset", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Start").click();
    await page.clock.fastForward(101 * 3_600_000);
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await page.clock.runFor(100);
    await expect(display(page)).toHaveText("99:59:59.9");
    await expect(page.locator("#sw-status")).toContainText("100 hour limit");
    expect(await shown(page)).toEqual(["Resume", "Reset"]);
    await btn(page, "Resume").click(); // nothing more to measure: it stays stopped
    await page.clock.runFor(5_000);
    await expect(display(page)).toHaveText("99:59:59.9");
  });
});

test.describe("Stopwatch on the real clock", () => {
  test("it counts real time, and a paused stopwatch stays put", async ({ page, go }) => {
    await go("tools/stopwatch/");
    await btn(page, "Start").click();
    await page.waitForTimeout(1300);
    await btn(page, "Pause").click();
    const text = await display(page).innerText();
    expect(text).toMatch(/^00:0[12]\.\d$/);
    const seconds = Number(text.slice(3));
    expect(seconds).toBeGreaterThanOrEqual(1.1);
    expect(seconds).toBeLessThan(2.5);
    await page.waitForTimeout(500);
    await expect(display(page)).toHaveText(text);
  });
});

test.describe("Stopwatch in Time Tools and search", () => {
  test("Time Tools and All Tools list it directly under the section; Countdown Timer and Stopwatch link each other", async ({ page, go }) => {
    await go("time-tools.html");
    for (const slug of ["stopwatch", "countdown-timer", "date-difference", "date-calculator"]) await expect(page.locator(`a[href$="tools/${slug}/"]`)).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(/coming soon|timers|measurement/i);
    await go("tools.html");
    await expect(page.locator('.directory-section a[href$="tools/stopwatch/"]')).toHaveCount(1);
    await expect(page.locator(".directory-section__count").nth(1)).toHaveText("5 tools"); // the Time Tools section is the second of three
    await go("tools/countdown-timer/");
    await expect(page.locator('main a[href$="tools/stopwatch/"]')).toHaveCount(1);
  });

  test("the path Home > All Tools > Time Tools > Stopwatch works by clicking", async ({ page, go, siteRoot }) => {
    await go("");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Time Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}time-tools.html`);
    await page.locator('a[href$="tools/stopwatch/"]').first().click();
    await expect(page.locator("h1")).toHaveText("Stopwatch");
  });

  test("search: Stopwatch for its names, and the other Time Tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["stopwatch", "online stopwatch", "lap timer", "split timer", "elapsed time", "timer stopwatch"]) await expect(await first(q), q).toContainText("Stopwatch");
    for (const q of ["countdown timer", "timer", "online timer", "study timer"]) await expect(await first(q), q).toContainText("Countdown Timer");
    for (const q of ["date difference", "days between dates"]) await expect(await first(q), q).toContainText("Date Difference Calculator");
    for (const q of ["date calculator", "add days to date"]) await expect(await first(q), q).toContainText("Date Calculator");
  });

  test("calculator searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("stopwatch");
    await expect(page.locator("main")).not.toContainText("Stopwatch");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("lap timer");
    await expect(page.locator("#calculators-grid")).not.toContainText("Stopwatch");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("stopwatch");
    await expect(page.locator("main")).not.toContainText("Stopwatch");
  });
});
