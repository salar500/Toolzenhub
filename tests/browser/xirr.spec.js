/**
 * Calculators Ecosystem 2.0, pack 49: XIRR Calculator.
 *
 * Expected figures are the independent reference values of docs/ecosystem-review/calculators/formula-reference-check.py
 * (Python decimal, 300-step bisection, run with python -I): the four-flow example is 14.394394%, the two flows over
 * 1,827 days are 14.852405%, and the flows -1,000 / +2,300 / -1,320 on days 0, 365, 730 have roots 10% and 20%.
 * No spreadsheet was run for these tests.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const rows = (page) => page.locator("#xirr-rows .xirr-row");
const results = (page) => page.locator("#xirr-results");
const live = (page) => page.locator("#xirr-live");
const metric = (page, label) =>
  page.locator(`#xirr-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);

async function open(page, go) {
  await go("calculators/xirr/");
  await expect(page.locator("#xirr-form")).toHaveAttribute("data-ready", "true");
}

async function fillRow(page, index, date, amount, kind = "out") {
  const row = rows(page).nth(index);
  await row.locator(".xirr-date").fill(date);
  await row.locator(".xirr-amount").fill(String(amount));
  await row.locator(".xirr-kind").selectOption(kind);
}

async function leave(page) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}

async function pasteRows(page, text) {
  if (!(await page.locator("#xirr-paste-details").evaluate((d) => d.open))) await page.locator("#xirr-paste-details summary").click();
  await page.locator("#xirr-paste").fill(text);
  await page.getByRole("button", { name: "Add these rows" }).click();
}

test.describe("XIRR Calculator", () => {
  test("page shell: heading, breadcrumb, two empty rows, a prompt, and no Calculate button", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("XIRR Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs[0]).toBe(siteRoot);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("XIRR Calculator");
    await expect(rows(page)).toHaveCount(2);
    await expect(results(page)).toContainText("Enter at least one amount you paid and one you received");
    await expect(page.getByRole("button", { name: "Calculate" })).toHaveCount(0);
    await expect(page.locator("#xirr-results .calculator-results__card")).toHaveCount(0);
    expectClean(watch);
  });

  test("the example: 14.39% a year, the totals, the period, and the cash flows in date order", async ({ page, go, watch }) => {
    await open(page, go);
    await page.getByRole("button", { name: "Fill in an example" }).click();
    await expect(rows(page)).toHaveCount(4);
    await expect(metric(page, "XIRR (a year)")).toHaveText("14.39%");
    await expect(metric(page, "Total money out")).toHaveText("₹1,50,000");
    await expect(metric(page, "Total money in")).toHaveText("₹1,90,000");
    await expect(metric(page, "Net gain or loss")).toHaveText("₹40,000");
    await expect(metric(page, "Period")).toHaveText("731 days (2.00 years)");
    await expect(live(page)).toHaveText("Example loaded: four cash flows.");
    await page.locator(".xirr-flows summary").click();
    const dates = await page.locator(".xirr-flows tbody th").allTextContents();
    expect(dates).toEqual(["2023-01-01", "2023-07-01", "2024-03-31", "2025-01-01"]);
    await expect(results(page)).toContainText("not a forecast");
    expectClean(watch);
  });

  test("typing two dated amounts gives the rate live, with the closed-form cross-check; no button is pressed", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 0, "2020-01-01", 100000, "out");
    await expect(results(page).locator(".calculator-results__card")).toHaveCount(0);
    await fillRow(page, 1, "2025-01-01", 200000, "in");
    await expect(metric(page, "XIRR (a year)")).toHaveText("14.85%");
    await expect(results(page)).toContainText("Cross-check: with one amount out and one in");
    await expect(results(page)).toContainText("= 14.85%");
    await expect(results(page)).toContainText("1,827 days");
  });

  test("order of rows does not matter, and a loss is a negative rate", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 0, "2023-01-01", 1000, "in"); // money in first
    await fillRow(page, 1, "2024-01-01", 500, "out");
    await expect(metric(page, "XIRR (a year)")).toHaveText("-50.00%");
    await expect(metric(page, "Net gain or loss")).toHaveText("₹500");
  });

  test("more than one rate fits: both are listed, the one nearest zero is shown, with a caution", async ({ page, go }) => {
    await open(page, go);
    await page.getByRole("button", { name: "Add a row" }).click();
    await fillRow(page, 0, "2023-01-01", 1000, "out");
    await fillRow(page, 1, "2024-01-01", 2300, "in");
    await fillRow(page, 2, "2024-12-31", 1320, "out");
    await expect(metric(page, "XIRR (a year)")).toHaveText("10.00%");
    const caution = page.locator(".xirr-note--caution");
    await expect(caution).toContainText("more than one yearly rate");
    await expect(caution).toContainText("10.00%, 20.00%");
    await expect(live(page)).toContainText("More than one rate fits these cash flows");
  });

  test("problems are reported when the row is left, name the row and the field, and remove the old figure", async ({ page, go }) => {
    await open(page, go);
    await page.getByRole("button", { name: "Fill in an example" }).click();
    await expect(metric(page, "XIRR (a year)")).toHaveText("14.39%");
    const amount = rows(page).nth(1).locator(".xirr-amount");
    await amount.fill("-5");
    // still editing this row: nothing is reported, and the figure for other inputs is gone
    await expect(page.locator("#xirr-error")).toHaveCount(0);
    await expect(results(page).locator(".calculator-results__card")).toHaveCount(0);
    await rows(page).nth(2).locator(".xirr-date").focus();
    await expect(page.locator("#xirr-error")).toContainText("Cash flow 2: enter the amount without a minus sign");
    await expect(amount).toHaveAttribute("aria-invalid", "true");
    expect(await amount.getAttribute("aria-describedby")).toContain("xirr-error");
    await expect(rows(page).nth(0).locator(".xirr-amount")).not.toHaveAttribute("aria-invalid", /.+/);
    await amount.fill("50000");
    await expect(page.locator("#xirr-error")).toHaveCount(0);
    await expect(metric(page, "XIRR (a year)")).toHaveText("14.39%");
    // a half-filled row
    await rows(page).nth(3).locator(".xirr-amount").fill("");
    await rows(page).nth(0).locator(".xirr-date").focus();
    await expect(page.locator("#xirr-error")).toContainText("Cash flow 4: enter both a date and an amount.");
  });

  test("only money out, or only one day: a neutral prompt while editing, an error once focus leaves the form", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 0, "2023-01-01", 1000, "out");
    await fillRow(page, 1, "2023-06-01", 500, "out");
    await expect(results(page)).toContainText("Add at least one money-in amount");
    await expect(page.locator("#xirr-error")).toHaveCount(0);
    await leave(page);
    await expect(page.locator("#xirr-error")).toContainText("Add at least one money-in amount");
    await rows(page).nth(1).locator(".xirr-kind").selectOption("in");
    await rows(page).nth(1).locator(".xirr-date").fill("2023-01-01");
    await leave(page);
    await expect(page.locator("#xirr-error")).toContainText("must not all be the same day");
  });

  test("rows: add, remove, keep two, stop at 100", async ({ page, go }) => {
    await open(page, go);
    await expect(rows(page)).toHaveCount(2);
    await page.getByRole("button", { name: "Remove cash flow 1" }).click(); // at the minimum: cleared, not removed
    await expect(rows(page)).toHaveCount(2);
    await page.getByRole("button", { name: "Add a row" }).click();
    await expect(rows(page)).toHaveCount(3);
    await expect(rows(page).nth(2)).toHaveAttribute("aria-label", "Cash flow 3");
    await page.getByRole("button", { name: "Remove cash flow 2" }).click();
    await expect(rows(page)).toHaveCount(2);
    await expect(rows(page).nth(1)).toHaveAttribute("aria-label", "Cash flow 2");
    for (let i = 0; i < 98; i++) await page.getByRole("button", { name: "Add a row" }).click();
    await expect(rows(page)).toHaveCount(100);
    await expect(page.getByRole("button", { name: "Add a row" })).toBeDisabled();
    // every id is unique
    const ids = await page.locator("#xirr-rows [id]").evaluateAll((els) => els.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("paste: the three date formats, negative or brackets is out, header skipped, rows fill blanks first", async ({ page, go }) => {
    await open(page, go);
    await pasteRows(page, "Date,Amount\n2023-01-01, -1,00,000\n01/07/2023\t(50,000)\n31-03-2024;20000\n\n2025-01-01 170000");
    await expect(rows(page)).toHaveCount(4);
    await expect(metric(page, "XIRR (a year)")).toHaveText("14.39%");
    await expect(live(page)).toHaveText("Added 4 rows.");
    await expect(page.locator("#xirr-paste")).toHaveValue("");
    await expect(rows(page).nth(1).locator(".xirr-kind")).toHaveValue("out");
    await expect(rows(page).nth(3).locator(".xirr-kind")).toHaveValue("in");
  });

  test("paste: a bad line stops the whole paste, names the line and adds nothing; limits are explained", async ({ page, go }) => {
    await open(page, go);
    await pasteRows(page, "2023-01-01 -100\nhello 5\n2023-02-30 100");
    const error = page.locator("#xirr-paste-error");
    await expect(error).toContainText("Nothing was added.");
    await expect(error).toContainText("Line 2");
    await expect(error).toContainText("Line 3");
    await expect(rows(page)).toHaveCount(2);
    await expect(rows(page).first().locator(".xirr-date")).toHaveValue("");
    // over the row limit
    const many = Array.from({ length: 101 }, (_, i) => `2023-01-${String((i % 28) + 1).padStart(2, "0")} ${i % 2 ? "" : "-"}100`).join("\n");
    await page.locator("#xirr-paste").fill(many);
    await page.getByRole("button", { name: "Add these rows" }).click();
    await expect(error).toContainText("The most is 100. Nothing was added.");
    // over the length limit
    await page.locator("#xirr-paste").fill("2023-01-01 -100\n".repeat(1300));
    await page.getByRole("button", { name: "Add these rows" }).click();
    await expect(error).toContainText("longer than 20,000 characters");
    await expect(rows(page)).toHaveCount(2);
    // empty
    await page.locator("#xirr-paste").fill("  ");
    await page.getByRole("button", { name: "Add these rows" }).click();
    await expect(error).toContainText("Paste at least one row first.");
  });

  test("100 pasted rows give a result quickly", async ({ page, go }) => {
    await open(page, go);
    const lines = [];
    for (let i = 0; i < 99; i++) lines.push(`${2010 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-05 -1000`);
    lines.push("2022-12-31 200000");
    const t0 = Date.now();
    await pasteRows(page, lines.join("\n"));
    await expect(rows(page)).toHaveCount(100);
    await expect(metric(page, "XIRR (a year)")).toBeVisible();
    expect(Date.now() - t0).toBeLessThan(5000);
  });

  test("Reset clears the rows and the result, announces once and returns focus to the first date", async ({ page, go }) => {
    await open(page, go);
    await page.getByRole("button", { name: "Fill in an example" }).click();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(rows(page)).toHaveCount(2);
    await expect(results(page)).toContainText("Enter at least one amount");
    await expect(rows(page).first().locator(".xirr-date")).toBeFocused();
    await expect(live(page)).toHaveText("All rows cleared.");
  });

  test("typing announces at most once, and updates never move focus", async ({ page, go }) => {
    await open(page, go);
    await fillRow(page, 0, "2020-01-01", 100000, "out");
    await rows(page).nth(1).locator(".xirr-date").fill("2025-01-01");
    await rows(page).nth(1).locator(".xirr-kind").selectOption("in");
    await page.evaluate(() => {
      window.__live = [];
      new MutationObserver(() => window.__live.push(document.querySelector("#xirr-live").textContent))
        .observe(document.querySelector("#xirr-live"), { childList: true, characterData: true, subtree: true });
    });
    const amount = rows(page).nth(1).locator(".xirr-amount");
    await amount.pressSequentially("200000", { delay: 20 });
    await expect(metric(page, "XIRR (a year)")).toHaveText("14.85%");
    await expect(amount).toBeFocused();
    await page.waitForTimeout(900);
    const spoken = await page.evaluate(() => window.__live.filter((t) => t !== ""));
    expect(spoken.length).toBeLessThanOrEqual(1);
    expect(spoken[0]).toMatch(/^XIRR 14\.85% a year\./);
  });

  test("copy summary: success with a clipboard, and a selected-text fallback without one", async ({ page, go, context }) => {
    await page.addInitScript(() => {
      window.__copied = null;
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (t) => { window.__copied = t; } } });
    });
    await open(page, go);
    await page.getByRole("button", { name: "Fill in an example" }).click();
    await page.getByRole("button", { name: "Copy summary" }).click();
    await expect(page.locator("#xirr-copy-note")).toHaveText("Summary copied.");
    const copied = await page.evaluate(() => window.__copied);
    expect(copied).toContain("Annualised rate (XIRR, 365-day year): 14.39%");
    expect(copied).toContain("2023-01-01 to 2025-01-01 (731 days)");
    expect(copied).toContain("not a forecast or advice");
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }));
    await page.getByRole("button", { name: "Copy summary" }).click();
    await expect(page.locator("#xirr-copy-fallback")).toBeFocused();
    await expect(page.locator("#xirr-copy-note")).toContainText("press Ctrl+C");
  });

  test("nothing is stored, sent or put in the address", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (r.resourceType() !== "image") requests.push(r.url()); });
    await open(page, go);
    await page.waitForLoadState("networkidle");
    const before = requests.length;
    const url = page.url();
    await page.getByRole("button", { name: "Fill in an example" }).click();
    await expect(metric(page, "XIRR (a year)")).toBeVisible();
    await page.getByRole("button", { name: "Copy summary" }).click();
    expect(requests.length).toBe(before);
    expect(page.url()).toBe(url);
    const stored = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }));
    expect(stored).toEqual({ local: 0, session: 0, cookies: "" });
  });

  test("keyboard: the controls are reachable in order and the focus ring is visible", async ({ page, go }) => {
    await open(page, go);
    // a native date field has a tab stop for each of its parts, so the order is checked from the amount onward
    await rows(page).first().locator(".xirr-amount").focus();
    const order = [];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => document.activeElement.className.split(" ").find((c) => c.startsWith("xirr-")) || document.activeElement.id));
    }
    expect(order).toEqual(["xirr-kind", "xirr-remove", "xirr-date"]);
    await page.keyboard.press("Shift");
    await page.locator("#xirr-add").focus();
    const outline = await page.locator("#xirr-add").evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
    expect((outline.style !== "none" && outline.width > 0) || outline.shadow !== "none").toBe(true);
  });

  test("labels: every row field has a name that includes its row", async ({ page, go }) => {
    await open(page, go);
    await expect(page.getByRole("group", { name: "Cash flow 1" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Cash flow 2" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Cash flow 1" }).getByLabel("Date")).toHaveCount(1);
    await expect(page.getByRole("group", { name: "Cash flow 1" }).getByLabel("Amount (₹)")).toHaveCount(1);
    await expect(page.getByRole("group", { name: "Cash flow 1" }).getByLabel("Money out or in")).toHaveCount(1);
    await expect(live(page)).toHaveAttribute("role", "status");
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
  });

  for (const width of [320, 360, 390]) {
    test.describe(`at ${width}px`, () => {
      test.use({ viewport: { width, height: 800 } });

      test("rows, result, paste and the table fit without sideways scrolling; targets are large enough", async ({ page, go }) => {
        await open(page, go);
        await expectNoHorizontalOverflow(page);
        await page.getByRole("button", { name: "Fill in an example" }).click();
        await expect(metric(page, "XIRR (a year)")).toBeVisible();
        await page.locator("#xirr-paste-details summary").click();
        await page.locator(".xirr-flows summary").click();
        await expectNoHorizontalOverflow(page);
        for (const sel of ["#xirr-add", "#xirr-example", "#xirr-reset", ".xirr-remove", "#xirr-paste-add", "#xirr-copy"]) {
          const box = await page.locator(sel).first().boundingBox();
          expect(box.height, sel).toBeGreaterThanOrEqual(44);
          expect(box.x + box.width, sel).toBeLessThanOrEqual(width);
        }
        expect(parseFloat(await rows(page).first().locator(".xirr-amount").evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
        await page.locator("#xirr-paste").fill("2023-01-01 -1");
        await page.getByRole("button", { name: "Add these rows" }).click();
        await page.locator("#xirr-paste").fill("bad");
        await page.getByRole("button", { name: "Add these rows" }).click();
        await expectNoHorizontalOverflow(page);
      });
    });
  }
  // Stage 3: hostile text in the paste box and in the fields is shown (or refused) as text and never becomes markup, a dialog or a request.
  test("hostile paste and field text is inert: no markup, no dialog, no outside request, nothing stored", async ({ page, go }) => {
    const dialogs = [];
    const outside = [];
    page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss(); });
    await open(page, go);
    await page.waitForLoadState("networkidle");
    const origin = new URL(page.url()).origin;
    page.on("request", (r) => { if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== origin && r.resourceType() !== "image") outside.push(r.url()); });
    await pasteRows(page, ['<img src=x onerror="alert(1)">', "2023-01-01 <script>alert(2)</script>", '"><svg onload=alert(3)> 5'].join("\n"));
    await rows(page).nth(0).locator(".xirr-amount").fill("12");
    await leave(page);
    await page.waitForTimeout(900);
    expect(await page.locator("#xirr-form img[src='x'], #xirr-results img, #xirr-form svg[onload], #xirr-form script").count()).toBe(0);
    expect(dialogs).toEqual([]);
    expect(outside).toEqual([]);
    const stored = await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length);
    expect(stored).toBe(0);
    expect(new URL(page.url()).search).toBe("");
  });
});
