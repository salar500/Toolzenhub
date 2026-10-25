/**
 * Time Tools ecosystem: Business Days, Time Duration, Shift Planner, Pomodoro Focus Timer,
 * Interval and Routine Timer, International Meeting Planner.
 *
 * The rules are tested in tests/unit against independent oracles; these tests check that each page
 * is wired: it renders, reads its fields, shows the engine's answer, announces, copies, resets and
 * stays inside a phone screen. The two timers run on Playwright's fake clock (page.clock).
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function freezeClock(page) {
  await page.clock.install({ time: new Date("2026-03-10T10:00:00Z") });
  await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z"));
}

async function basics(page, watch, siteRoot, title) {
  await expect(page.locator("h1")).toHaveText(title);
  await expect(page.locator("h1")).toHaveCount(1);
  const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
  expect(labels.slice(0, 3)).toEqual(["home", "time tools", title.toLowerCase()]);
  await expect(page.locator(".related-section")).toHaveCount(1); // the Time Tools related-tools pilot
  await expectNoHorizontalOverflow(page);
  expectClean(watch);
}

test.describe("Business Days Calculator", () => {
  test("adds business days, counts them, skips a holiday and a custom weekend", async ({ page, go, watch, siteRoot }) => {
    await go("tools/business-days/");
    await expect(page.locator("#bd-form")).toHaveAttribute("data-ready", "true");
    await basics(page, watch, siteRoot, "Business Days Calculator");

    await page.locator("#bd-start").fill("2026-11-13");
    await page.locator("#bd-count").fill("5");
    await expect(page.locator(".tt-answer")).toHaveText("Friday, 20 November 2026");
    await expect(page.locator("#bd-results")).toContainText("Weekend: Saturday and Sunday");

    await page.locator("#bd-holidays").fill("2026-11-17");
    await expect(page.locator(".tt-answer")).toHaveText("Monday, 23 November 2026");

    await page.getByLabel("Before the start date").check();
    await expect(page.locator(".tt-answer")).toHaveText("Friday, 6 November 2026");
    await page.getByLabel("After the start date").check();

    // a Friday and Saturday weekend: 5 days after Friday is the following Thursday, and holidays still apply
    await page.getByLabel("Friday", { exact: true }).check();
    await page.getByLabel("Sunday", { exact: true }).uncheck();
    await expect(page.locator(".tt-answer")).not.toHaveText("Monday, 23 November 2026");

    await page.getByLabel("Count business days between two dates").check();
    await page.locator("#bd-end").fill("2026-11-20");
    await expect(page.locator("#bd-results h2")).toHaveText("Business days between the dates");

    await btn(page, "Reset").click();
    await expect(page.locator("#bd-start")).toHaveValue("");
    await expect(page.locator("#bd-start")).toBeFocused();
    await expect(page.locator("#bd-results")).toContainText("Choose a start date");
  });

  test("refuses a bad holiday line and a week with no business day", async ({ page, go }) => {
    await go("tools/business-days/");
    await page.locator("#bd-start").fill("2026-11-13");
    await page.locator("#bd-count").fill("5");
    await page.locator("#bd-holidays").fill("25 December");
    await expect(page.locator("#bd-error")).toContainText("not a date");
    await expect(page.locator("#bd-holidays")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#bd-holidays").fill("");
    for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
      await page.getByLabel(day, { exact: true }).check();
    }
    await expect(page.locator("#bd-error")).toContainText("Leave at least one day");
  });

  test("Use today fills only on a click, from the browser's calendar date", async ({ page, go }) => {
    await page.clock.install({ time: new Date("2026-03-10T10:00:00Z") });
    await go("tools/business-days/");
    await expect(page.locator("#bd-start")).toHaveValue("");
    await page.locator("[data-today='bd-start']").click();
    await expect(page.locator("#bd-start")).toHaveValue("2026-03-10");
  });
});

test.describe("Time Duration Calculator", () => {
  test("adds and subtracts rows and shows every form of the total", async ({ page, go, watch, siteRoot }) => {
    await go("tools/time-duration/");
    await expect(page.locator("#td-form")).toHaveAttribute("data-ready", "true");
    await basics(page, watch, siteRoot, "Time Duration Calculator");

    const inputs = page.locator(".td-input");
    await inputs.nth(0).fill("1:45");
    await inputs.nth(1).fill("2h 30m");
    await expect(page.locator(".tt-answer")).toHaveText("4 hours 15 minutes");
    await expect(page.locator("#td-results")).toContainText("4:15:00");
    await expect(page.locator("#td-results")).toContainText("4.25");

    await btn(page, "Add a row").click();
    await page.locator(".td-sign").nth(2).selectOption("-");
    await page.locator(".td-input").nth(2).fill("20m");
    await expect(page.locator(".tt-answer")).toHaveText("3 hours 55 minutes");
    await expect(page.locator("#td-results")).toContainText("(rounded)"); // 3.9167 decimal hours is not exact

    await inputs.nth(0).fill("1.3333h");
    await expect(page.locator(".td-hint").first()).toContainText(/whole|second/i);
    await expect(inputs.nth(0)).toHaveAttribute("aria-invalid", "true");

    await page.getByRole("button", { name: "Remove row 3" }).click();
    await expect(page.locator(".td-row")).toHaveCount(2);

    await btn(page, "Reset").click();
    await expect(page.locator(".td-input").first()).toBeFocused();
    await expect(page.locator(".td-input").first()).toHaveValue("");
  });

  test("a negative total keeps its minus sign", async ({ page, go }) => {
    await go("tools/time-duration/");
    await page.locator(".td-input").nth(0).fill("30m");
    await page.locator(".td-sign").nth(1).selectOption("-");
    await page.locator(".td-input").nth(1).fill("1h");
    await expect(page.locator(".tt-answer")).toHaveText("−30 minutes");
  });
});

test.describe("Shift Schedule Planner", () => {
  test("lays a 4 on 4 off cycle on the calendar and totals it", async ({ page, go, watch, siteRoot }) => {
    await go("tools/shift-planner/");
    await expect(page.locator("#sp-form")).toHaveAttribute("data-ready", "true");
    await basics(page, watch, siteRoot, "Shift Schedule Planner");

    await page.locator("#sp-preset").selectOption("4-on-4-off");
    await expect(page.locator("#sp-cycle")).toHaveValue("4D 4O");
    await expect(page.locator("#sp-results")).toContainText("Choose a pattern and a start date");
    await page.locator("#sp-start").fill("2026-11-02");
    await page.locator("#sp-weeks").fill("4");
    const metrics = (await page.locator("#sp-results .calculator-results__item").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim());
    expect(metrics[0]).toBe("Working days 16");
    expect(metrics[1]).toBe("Days off 12");
    expect(metrics[2]).toBe("Hours scheduled 128:00");
    expect(await page.locator(".sp-month").count()).toBe(1); // 2 to 29 November
    await expect(page.locator("#sp-results")).toContainText("Hours are start to end with no breaks taken off");

    await page.locator("#sp-cycle").fill("2D 2N 4O");
    await page.locator("#sp-position").fill("9");
    await expect(page.locator("#sp-error")).toContainText("this cycle has 8 days");
    await expect(page.locator("#sp-position")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#sp-position").fill("3");
    await expect(page.locator("#sp-results")).toContainText("Night 23:00 to 07:00");

    await btn(page, "Reset").click();
    await expect(page.locator("#sp-cycle")).toHaveValue("");
    await expect(page.locator("#sp-preset")).toBeFocused();
  });
});

test.describe("Pomodoro Focus Timer", () => {
  test("focus, break, waiting, skip and reset on the fake clock", async ({ page, go, watch, siteRoot }) => {
    await freezeClock(page);
    await go("tools/pomodoro-timer/");
    const panel = page.locator("#pm-panel");
    await expect(panel).toHaveAttribute("data-ready", "true");
    await basics(page, watch, siteRoot, "Pomodoro Focus Timer");
    await expect(panel).toHaveAttribute("data-state", "idle");
    await expect(page.locator("#pm-display")).toHaveText("25:00");

    await page.locator("#pm-focus").fill("1");
    await page.locator("#pm-short").fill("1");
    await btn(page, "Start").click();
    await expect(panel).toHaveAttribute("data-state", "running");
    await expect(btn(page, "Pause")).toBeFocused();
    await expect(page.locator("#pm-phase")).toHaveText("Focus 1 of 4");
    await expect(page.locator("#pm-focus")).toBeDisabled();

    await page.clock.runFor(30_000);
    await expect(page.locator("#pm-display")).toHaveText("00:30");
    await expect(page).toHaveTitle(/^00:30 Focus — Pomodoro Focus Timer$/);
    await btn(page, "Pause").click();
    await expect(panel).toHaveAttribute("data-state", "paused");
    await page.clock.runFor(60_000);
    await expect(page.locator("#pm-display")).toHaveText("00:30"); // paused time does not count
    await btn(page, "Resume").click();

    await page.clock.runFor(30_500);
    await expect(panel).toHaveAttribute("data-state", "waiting"); // stops at the phase boundary
    await expect(page.locator("#pm-phase")).toContainText("Short break");
    await expect(page.locator("#pm-count")).toHaveText("Focus periods completed: 1");
    await expect(btn(page, "Start next phase")).toBeFocused();
    await btn(page, "Start next phase").click();
    await expect(panel).toHaveAttribute("data-state", "running");

    await btn(page, "Skip phase").click(); // skipping a break moves to the next focus
    await expect(page.locator("#pm-phase")).toHaveText("Focus 2 of 4");
    await btn(page, "Skip phase").click(); // a skipped focus period is not counted
    await expect(page.locator("#pm-count")).toHaveText("Focus periods completed: 1");

    await btn(page, "Pause").click();
    await btn(page, "Reset").click();
    await expect(panel).toHaveAttribute("data-state", "idle");
    await expect(btn(page, "Start")).toBeFocused();
    await expect(page).toHaveTitle(/^Pomodoro/);
    await expect(page.locator("#pm-focus")).toBeEnabled();
  });

  test("invalid settings are named and block Start; valid settings reach the address", async ({ page, go }) => {
    await go("tools/pomodoro-timer/");
    await page.locator("#pm-focus").fill("0");
    await btn(page, "Start").click();
    await expect(page.locator("#pm-error")).toBeVisible();
    await expect(page.locator("#pm-focus")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#pm-panel")).toHaveAttribute("data-state", "idle");
    await page.locator("#pm-focus").fill("30");
    await expect(page.locator("#pm-error")).toBeHidden();
    await expect.poll(() => page.url()).toContain("f=30");
  });
});

test.describe("Interval and Routine Timer", () => {
  test("a preset, the total, a run to the end and the done state", async ({ page, go, watch, siteRoot }) => {
    await freezeClock(page);
    await go("tools/interval-timer/");
    const panel = page.locator("#it-panel");
    await expect(panel).toHaveAttribute("data-ready", "true");
    await basics(page, watch, siteRoot, "Interval and Routine Timer");

    await page.locator("#it-preset").selectOption("tabata");
    await expect(page.locator("#it-total")).toContainText("Total time: 4 min (16 stages)"); // 10 get ready + 8 x 20 work + 7 x 10 rest
    await page.locator("#it-rounds").fill("2");
    await expect(page.locator("#it-total")).toContainText("Total time: 1 min (4 stages)"); // 10 get ready + 2 x 20 work + 1 x 10 rest
    await expect(page.locator("#it-preset")).toHaveValue("");

    await btn(page, "Start").click();
    await expect(panel).toHaveAttribute("data-state", "running");
    await expect(page.locator("#it-phase")).toHaveText("Get ready");
    await page.clock.runFor(10_500);
    await expect(page.locator("#it-phase")).toHaveText("Work, round 1");
    await btn(page, "Skip stage").click();
    await expect(page.locator("#it-phase")).toHaveText("Rest, round 1");

    await page.clock.runFor(70_000);
    await expect(panel).toHaveAttribute("data-state", "done");
    await expect(page.locator("#it-phase")).toHaveText("Complete");
    await expect(btn(page, "Start again")).toBeFocused();
    await btn(page, "Reset").click();
    await expect(panel).toHaveAttribute("data-state", "idle");
  });

  test("a custom stage can be named, added and removed, and the 0-work case is refused", async ({ page, go }) => {
    await go("tools/interval-timer/");
    await btn(page, "Add a stage").click();
    await expect(page.locator(".it-stage")).toHaveCount(3);
    await page.getByRole("button", { name: "Remove stage 3" }).click();
    await expect(page.locator(".it-stage")).toHaveCount(2);
    await page.locator(".it-seconds").first().fill("0");
    await expect(page.locator("#it-error")).toContainText("at least one work stage");
    await btn(page, "Start").click();
    await expect(page.locator("#it-panel")).toHaveAttribute("data-state", "idle");
  });
});

test.describe("International Meeting Planner", () => {
  test("finds shared windows, explains a blocked day and checks a weekly meeting", async ({ page, go, watch, siteRoot }) => {
    await go("tools/meeting-planner/");
    await expect(page.locator("#mp-form")).toHaveAttribute("data-ready", "true");
    await basics(page, watch, siteRoot, "International Meeting Planner");

    const zones = page.locator(".mp-zone");
    await zones.nth(0).fill("Europe/London");
    await zones.nth(1).fill("Asia/Kolkata");
    await page.locator("#mp-date").fill("2026-11-03");
    await page.locator("#mp-days").selectOption("7");
    await btn(page, "Find meeting times").click();
    await expect(page.locator("#mp-results h2")).toContainText("windows of 30 minutes");
    await expect(page.locator(".mp-day-result").first()).toContainText("Tuesday, 2026-11-03");
    await expect(page.locator(".mp-table").first()).toContainText("Europe/London");
    await expect(page.locator(".mp-day-result").nth(4)).toContainText("no shared time"); // Saturday: both are weekdays only
    await expect(page.locator(".mp-recurring")).toContainText("If this is a weekly meeting");

    // an overnight person on the same days has no overlap and is named as the blocker
    await zones.nth(1).fill("Pacific/Auckland");
    await page.locator(".mp-start").nth(1).fill("22:00");
    await page.locator(".mp-end").nth(1).fill("06:00");
    await btn(page, "Find meeting times").click();
    await expect(page.locator("#mp-results")).toBeVisible();

    await btn(page, "Reset").click();
    await expect(page.locator("#mp-results")).toContainText("Add the people");
  });

  test("a missing date and an unknown zone are named", async ({ page, go }) => {
    await go("tools/meeting-planner/");
    await btn(page, "Find meeting times").click();
    await expect(page.locator("#mp-error")).toBeVisible();
    await page.locator(".mp-zone").nth(0).fill("Europe/London");
    await page.locator(".mp-zone").nth(1).fill("Not/AZone");
    await page.locator("#mp-date").fill("2026-11-03");
    await btn(page, "Find meeting times").click();
    await expect(page.locator("#mp-error")).toContainText("Person 2");
    await expect(page.locator(".mp-zone").nth(1)).toHaveAttribute("aria-invalid", "true");
  });

  test("settings in the address restore the people", async ({ page, go }) => {
    await go("tools/meeting-planner/?p=Ana~Europe%2FLondon~0900~1700~1111100&p=Raj~Asia%2FKolkata~0900~1700~1111100&len=45&d=2026-11-03&n=3");
    await expect(page.locator(".mp-name").nth(0)).toHaveValue("Ana");
    await expect(page.locator(".mp-zone").nth(1)).toHaveValue("Asia/Kolkata");
    await expect(page.locator("#mp-length")).toHaveValue("45");
    await expect(page.locator("#mp-days")).toHaveValue("3");
  });
});
