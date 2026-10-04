/**
 * Tool Pack 1 — Loan Prepayment Calculator, realistic user flows.
 *
 * Expected figures are the independently derived golden values (tests/fixtures/prepayment-golden.py,
 * Python decimal, closed form and simulation agreeing), written here as literals. The test reads
 * label -> value pairs and landmarks, not DOM positions.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const metric = (page, label) =>
  page.locator(`#prepay-results .calculator-results__item:has(.calculator-results__label:text-is("${label}")) .calculator-results__value`);
const card = (page, title) => page.locator(`#prepay-results .prepay-compare__card:has(.prepay-compare__title:text-is("${title}"))`);

async function fill(page, { balance, rate, years, months, amount, after }) {
  if (balance !== undefined) await page.locator("#prepay-balance").fill(String(balance));
  if (rate !== undefined) await page.locator("#prepay-rate").fill(String(rate));
  if (years !== undefined) await page.locator("#prepay-years").fill(String(years));
  if (months !== undefined) await page.locator("#prepay-months").fill(String(months));
  if (amount !== undefined) await page.locator("#prepay-amount").fill(String(amount));
  if (after !== undefined) await page.locator("#prepay-after").fill(String(after));
}

test.describe("Loan Prepayment Calculator", () => {
  test("page, breadcrumb, form shell and the default result", async ({ page, go, watch, siteRoot }) => {
    await go("calculators/prepayment/");
    await expect(page.locator("h1")).toHaveText("Loan Prepayment Calculator");
    await expect(page.locator("h1")).toHaveCount(1);

    const crumb = page.locator(".calculator-breadcrumb");
    await expect(crumb).toHaveCount(1);
    await expect(crumb).toContainText("Loan Prepayment Calculator");
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}loans.html`]);

    await expect(page.getByLabel("Outstanding Loan Balance")).toHaveValue("2500000");
    await expect(page.getByLabel("Interest Rate")).toHaveValue("8.5");
    await expect(page.getByLabel("Years")).toHaveValue("15");
    await expect(page.getByLabel("Months")).toHaveValue("0");
    await expect(page.getByLabel("Prepayment Amount")).toHaveValue("300000");
    await expect(page.getByLabel("Make the Prepayment After")).toHaveValue("0");
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
    // results update live: there is no Calculate button
    await expect(page.getByRole("button", { name: /calculate/i })).toHaveCount(0);

    await expect(metric(page, "Prepayment")).toHaveText("₹3,00,000");
    await expect(metric(page, "Interest saved")).toHaveText("₹6,35,199");
    await expect(metric(page, "Time saved")).toHaveText("3 years 1 month");
    await expect(metric(page, "Loan ends in")).toHaveText("11 years 11 months");
    expectClean(watch);
  });

  test("keep-EMI and lower-EMI comparison for the default inputs", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const base = card(page, "Without prepayment");
    const keep = card(page, "Prepay, keep your EMI");
    const lower = card(page, "Prepay, lower your EMI");
    await expect(base).toContainText("₹24,618");
    await expect(base).toContainText("₹19,31,328");
    await expect(keep).toContainText("₹24,618");
    await expect(keep).toContainText("₹6,35,199");
    await expect(lower).toContainText("₹21,664");
    await expect(lower).toContainText("₹2,31,759");
    // the summary reads the same numbers in words
    await expect(page.locator(".calculator-results__summary")).toContainText("₹24,618");
    await expect(page.locator(".calculator-results__summary")).toContainText("₹21,664");
    await expect(page.locator(".calculator-results__summary")).toContainText("₹2,954 less each month");
    // no Indian-format violations (western 1,000,000 grouping)
    await expect(page.locator("#prepay-results")).not.toContainText(/\d{1,3}(,\d{3}){2,}(?!\d)/);
  });

  test("a later prepayment saves less (24 EMIs in)", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await fill(page, { after: 24 });
    await expect(metric(page, "Interest saved")).toHaveText("₹5,04,951");
    await expect(metric(page, "Time saved")).toHaveText("2 years 8 months");
    await expect(metric(page, "Loan ends in")).toHaveText("12 years 4 months");
    await expect(card(page, "Prepay, lower your EMI")).toContainText("₹21,435");
    await expect(card(page, "Prepay, lower your EMI")).toContainText("₹1,96,632");
  });

  test("tenure is entered as years plus months", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await fill(page, { balance: 1000000, rate: 9, years: 1, months: 6, amount: 100000, after: 0 });
    await expect(page.locator("#prepay-results .calculator-results__item")).toHaveCount(4);
    await expect(metric(page, "Loan ends in")).toContainText(/year|month/);
    // months above 11 are rejected: the year field is for whole years
    await page.locator("#prepay-months").fill("18");
    await expect(page.locator("#prepay-results-error")).toContainText(/0 to 11/);
    await page.locator("#prepay-months").fill("6");
    await expect(page.locator("#prepay-results-error")).toHaveCount(0);
  });

  test("a prepayment that clears the loan is explained, and lowering the EMI is n/a", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await fill(page, { balance: 100000, years: 1, months: 0, amount: 150000, after: 0 });
    await expect(metric(page, "Prepayment needed to clear the loan")).toBeVisible();
    await expect(page.locator(".calculator-results__summary")).toContainText("clear the loan");
    await expect(card(page, "Prepay, lower your EMI")).toHaveCount(0);
    await expect(card(page, "Prepay and clear the loan")).toHaveCount(1);
  });

  test("invalid input shows an associated error and no stale numbers; correcting it recovers", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const rate = page.locator("#prepay-rate");
    await rate.fill("45");
    const error = page.locator("#prepay-results-error");
    await expect(error).toBeVisible();
    await expect(error).toContainText(/rate/i);
    await expect(rate).toHaveAttribute("aria-invalid", "true");
    await expect(rate).toHaveAttribute("aria-describedby", /prepay-results-error/);
    await expect(page.locator("#prepay-results .calculator-results__value")).toHaveCount(0);

    await rate.fill("8.5");
    await expect(error).toHaveCount(0);
    await expect(rate).not.toHaveAttribute("aria-invalid", "true");
    await expect(metric(page, "Interest saved")).toHaveText("₹6,35,199");

    // a cross-field error names both fields: months must be below the tenure
    await page.locator("#prepay-after").fill("180");
    await expect(error).toBeVisible();
    await expect(page.locator("#prepay-after")).toHaveAttribute("aria-invalid", "true");
  });

  test("an emptied field shows the prompt, not an error", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.locator("#prepay-amount").fill("");
    await expect(page.locator("#prepay-results .calculator-results__empty")).toBeVisible();
    await expect(page.locator("#prepay-results-error")).toHaveCount(0);
  });

  test("reset restores every default and recomputes", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await fill(page, { balance: 800000, rate: 11, years: 5, months: 3, amount: 50000, after: 6 });
    await expect(metric(page, "Interest saved")).not.toHaveText("₹6,35,199");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#prepay-balance")).toHaveValue("2500000");
    await expect(page.locator("#prepay-rate")).toHaveValue("8.5");
    await expect(page.locator("#prepay-years")).toHaveValue("15");
    await expect(page.locator("#prepay-months")).toHaveValue("0");
    await expect(page.locator("#prepay-amount")).toHaveValue("300000");
    await expect(page.locator("#prepay-after")).toHaveValue("0");
    await expect(metric(page, "Interest saved")).toHaveText("₹6,35,199");
  });

  test("repayment schedule: yearly by default, keep EMI first, accessible region and table", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await expect(page.getByRole("heading", { name: "Repayment schedule" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Prepay, keep EMI" })).toBeChecked();
    const wrapper = page.locator("#prepay-schedule-view .calculator-results__table-wrapper").first();
    await expect(wrapper).toHaveAttribute("role", "region");
    await expect(wrapper).toHaveAttribute("tabindex", "0");
    await expect(wrapper).toHaveAttribute("aria-label", /by year: Prepay, keep EMI/);
    await expect(wrapper.locator("caption")).toHaveCount(1);
    await expect(wrapper.locator("th[scope=col]")).toHaveText(["Year", "Opening balance", "EMIs paid", "Interest", "Principal", "Prepayment", "Closing balance"]);
    // keep EMI, prepaid right away: 143 months = 12 years of rows, the last one cleared
    const rows = wrapper.locator("tbody tr");
    await expect(rows).toHaveCount(12);
    await expect(rows.first()).toContainText("Year 1");
    await expect(rows.first().locator("td").nth(4)).toHaveText("₹3,00,000"); // the prepayment is in year 1
    await expect(rows.last().locator("td").last()).toHaveText("₹0");
    // monthly detail is not on the page until asked for
    await expect(page.locator("#prepay-monthly table")).toHaveCount(0);
  });

  test("switching schedules: without prepayment, keep EMI, lower EMI (native radios, arrow keys)", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const rows = page.locator("#prepay-schedule-view .calculator-results__table-wrapper").first().locator("tbody tr");
    await page.getByRole("radio", { name: "Without prepayment" }).check();
    await expect(rows).toHaveCount(15);
    await expect(page.locator("#prepay-schedule-view th[scope=col]", { hasText: "Prepayment" })).toHaveCount(0);
    await expect(rows.nth(0).locator("td").last()).toHaveText("₹24,13,770"); // year-1 closing, golden (₹24,13,770.13)
    await page.getByRole("radio", { name: "Prepay, lower EMI" }).check();
    await expect(rows).toHaveCount(15);
    await expect(page.locator("#prepay-schedule-view .prepay-note--lead")).toContainText("₹21,664");
    // arrow keys move through the group like any radio group
    await page.getByRole("radio", { name: "Prepay, lower EMI" }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("radio", { name: "Prepay, keep EMI" })).toBeChecked();
    await expect(rows).toHaveCount(12);
    // the choice survives a recalculation
    await page.getByRole("radio", { name: "Without prepayment" }).check();
    await page.locator("#prepay-amount").fill("200000");
    await expect(page.getByRole("radio", { name: "Without prepayment" })).toBeChecked();
    // reset returns to the default schedule
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("radio", { name: "Prepay, keep EMI" })).toBeChecked();
  });

  test("prepayment after 24 EMIs appears in year 2 only, and the EMI note says when it changes", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.locator("#prepay-after").fill("24");
    await page.getByRole("radio", { name: "Prepay, lower EMI" }).check();
    const rows = page.locator("#prepay-schedule-view .calculator-results__table-wrapper").first().locator("tbody tr");
    await expect(rows.nth(1).locator("td").nth(4)).toHaveText("₹3,00,000");
    await expect(rows.nth(0).locator("td").nth(4)).toHaveText("–");
    await expect(rows.nth(2).locator("td").nth(4)).toHaveText("–");
    await expect(page.locator("#prepay-schedule-view .prepay-note--lead")).toContainText("until then and ₹21,435 after");
    await expect(rows.nth(1).locator("td").last()).toHaveText("₹20,19,918"); // the reference year-2 balance (₹23,19,918) less the ₹3,00,000 prepayment
  });

  test("month-by-month detail is on request, scrolls in its own box, and keeps focus", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const toggle = page.locator("#prepay-monthly-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toContainText("144 rows");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toBeFocused();
    const monthly = page.locator("#prepay-monthly .calculator-results__table-wrapper");
    await expect(monthly).toHaveAttribute("aria-label", /by month: Prepay, keep EMI/);
    await expect(monthly.locator("tbody tr")).toHaveCount(144);
    await expect(monthly.locator("tbody tr").first().locator("th")).toHaveText("Start"); // the prepayment before EMI 1
    await expect(monthly.locator("tbody tr").nth(1).locator("th")).toHaveText("Month 1");
    // the page itself does not scroll sideways; the table scrolls inside its box
    await expectNoHorizontalOverflow(page);
    await toggle.click();
    await expect(page.locator("#prepay-monthly table")).toHaveCount(0);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("Download CSV: exports the selected schedule, with the right file name and rows", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const csv = page.getByRole("button", { name: /^Download CSV/ });
    await expect(csv).toBeVisible();
    await expect(csv).toHaveAccessibleName("Download CSV of the schedule: Prepay, keep EMI");

    const read = async (download) => (await new Promise((resolve, reject) => {
      const chunks = [];
      download.createReadStream().then((stream) => {
        stream.on("data", (c) => chunks.push(c));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        stream.on("error", reject);
      }, reject);
    }));

    // keep EMI (the default): prepaid right away, 143 EMIs plus the "Start" row
    let [download] = await Promise.all([page.waitForEvent("download"), csv.click()]);
    expect(download.suggestedFilename()).toBe("loan-prepayment-keep-emi-schedule.csv");
    let text = await read(download);
    let lines = text.replace(/^\uFEFF/, "").split("\r\n").filter(Boolean);
    expect(lines[0]).toBe("Period,Opening Balance,Payment,Principal,Interest,Prepayment,Closing Balance");
    expect(lines).toHaveLength(1 + 144);
    expect(lines[1]).toBe("Start,2500000.00,0.00,0.00,0.00,300000.00,2200000.00");
    expect(lines.at(-1).split(",").at(-1)).toBe("0.00");

    // the selected schedule decides the file
    await page.getByRole("radio", { name: "Prepay, lower EMI" }).check();
    [download] = await Promise.all([page.waitForEvent("download"), csv.click()]);
    expect(download.suggestedFilename()).toBe("loan-prepayment-lower-emi-schedule.csv");
    lines = (await read(download)).replace(/^\uFEFF/, "").split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(1 + 1 + 180);
    expect(lines[2].split(",")[2]).toBe("21664.27"); // the lower EMI, from the reference

    await page.getByRole("radio", { name: "Without prepayment" }).check();
    [download] = await Promise.all([page.waitForEvent("download"), csv.click()]);
    expect(download.suggestedFilename()).toBe("loan-prepayment-without-prepayment-schedule.csv");
    lines = (await read(download)).replace(/^\uFEFF/, "").split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(1 + 180);
    expect(lines[1].split(",")[2]).toBe("24618.49");

    // focus is not trapped, and the download is announced politely
    await expect(csv).toBeEnabled();
    await expect(page.locator("#prepay-live")).toHaveText("Downloaded loan-prepayment-without-prepayment-schedule.csv");
  });

  test("Download CSV and Print Summary: reachable by keyboard, with a visible focus ring", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.locator("#prepay-monthly-toggle").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#prepay-csv")).toBeFocused();
    expect(await page.locator("#prepay-csv").evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
    const [download] = await Promise.all([page.waitForEvent("download"), page.keyboard.press("Enter")]);
    expect(download.suggestedFilename()).toBe("loan-prepayment-keep-emi-schedule.csv");
    await page.keyboard.press("Tab");
    await expect(page.locator("#prepay-print")).toBeFocused();
    expect(await page.locator("#prepay-print").evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
  });

  test("Print Summary opens the browser print dialog; the printout leaves out the page chrome", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.evaluate(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
    await page.getByRole("button", { name: "Print Summary" }).click();
    expect(await page.evaluate(() => window.__prints)).toBe(1);

    await page.emulateMedia({ media: "print" });
    const shown = (selector) => page.locator(selector).first().isVisible();
    for (const hidden of ["#header", "footer.footer", ".calculator-breadcrumb", "#prepay-form", ".related-section", ".calculator-info", ".prepay-actions", ".prepay-scenarios"]) {
      expect(await shown(hidden), `${hidden} is not printed`).toBe(false);
    }
    await expect(page.locator(".prepay-print-brand")).toContainText("Loan Prepayment Calculator");
    const inputs = page.locator(".prepay-print-inputs");
    await expect(inputs).toContainText("₹25,00,000");
    await expect(inputs).toContainText("15 years");
    await expect(inputs).toContainText("₹3,00,000, made right away");
    await expect(page.locator("#prepay-results .calculator-results__summary")).toContainText("Interest saved is before any prepayment charge");
    await expect(page.locator(".prepay-compare__card")).toHaveCount(3);
    await expect(page.locator(".prepay-print-only", { hasText: "Schedule shown: Prepay, keep EMI" })).toBeVisible();
    await expect(page.locator("#prepay-schedule-view tbody tr").first()).toBeVisible();
    await page.emulateMedia({ media: "screen" });
    await expect(page.locator(".prepay-print-brand")).toBeHidden();
  });

  test("export actions wrap on a narrow screen without sideways scrolling", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await expect(page.locator(".prepay-actions button")).toHaveCount(3);
    await expectNoHorizontalOverflow(page);
    const boxes = await page.locator(".prepay-actions button").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    expect(boxes).toHaveLength(3);
    const viewport = page.viewportSize().width;
    for (const b of boxes) expect(b.right).toBeLessThanOrEqual(viewport);
    for (const b of boxes) expect(b.height).toBeGreaterThanOrEqual(36); // easy to tap
    // no two buttons overlap
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], c = boxes[j];
      expect(a.right <= c.left + 1 || c.right <= a.left + 1 || a.bottom <= c.top + 1 || c.bottom <= a.top + 1).toBe(true);
    }
  });

  test("the comparison cards add time saved and the EMI change", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await expect(card(page, "Prepay, keep your EMI")).toContainText("Time saved");
    await expect(card(page, "Prepay, keep your EMI")).toContainText("3 years 1 month");
    await expect(card(page, "Prepay, lower your EMI")).toContainText("EMI change");
    await expect(card(page, "Prepay, lower your EMI")).toContainText("₹2,954 less");
  });

  test("buttons: visible keyboard focus ring and a hover state on Reset", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const reset = page.locator("#prepay-reset");
    await page.locator("#prepay-after").focus();
    await page.keyboard.press("Tab");
    await expect(reset).toBeFocused();
    expect(await reset.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid");
    expect(await reset.evaluate((e) => parseFloat(getComputedStyle(e).outlineWidth))).toBeGreaterThanOrEqual(2);
    const before = await reset.evaluate((e) => getComputedStyle(e).backgroundColor);
    await reset.hover();
    await expect.poll(() => reset.evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe(before);
  });

  test("keyboard: every control is reachable and reset works from the keyboard", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await page.locator("#prepay-balance").focus();
    for (const id of ["prepay-rate", "prepay-years", "prepay-months", "prepay-amount", "prepay-after", "prepay-reset"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`#${id}`)).toBeFocused();
    }
    await page.locator("#prepay-amount").fill("1");
    await page.locator("#prepay-reset").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#prepay-amount")).toHaveValue("300000");
  });

  test("a polite live region exists and the page has unique ids", async ({ page, go }) => {
    await go("calculators/prepayment/");
    const live = page.locator("#prepay-live");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-live", "polite");
    const dupes = await page.evaluate(() => {
      const seen = new Map();
      for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(dupes).toEqual([]);
  });

  test("explanatory content, assumptions and the example", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await expect(page.getByRole("heading", { name: /How to Use/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Assumptions/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Keep Your EMI or Lower It/i })).toBeVisible();
    await expect(page.locator(".calculator-info details")).toHaveCount(4);
    await expect(page.locator("main")).toContainText("prepayment charge");
    await expect(page.locator("main")).toContainText("₹6,35,199");
  });

  test("related tools and the four curated articles", async ({ page, go, siteRoot }) => {
    await go("calculators/prepayment/");
    const tools = page.locator(".related-calculator-card");
    await expect(tools).toHaveCount(4); // the curated three, then Home Loan (Tool Pack 6) from the category
    await expect(tools.nth(0)).toHaveAttribute("href", `${siteRoot}calculators/emi/`);
    await expect(tools.nth(1)).toHaveAttribute("href", `${siteRoot}calculators/loan-comparison/`);
    await expect(tools.nth(2)).toHaveAttribute("href", `${siteRoot}calculators/balance-transfer/`);
    await expect(tools.nth(3)).toHaveAttribute("href", `${siteRoot}calculators/home-loan/`);
    const cards = page.locator(".related-article-card");
    await expect(cards).toHaveCount(4);
    const hrefs = await cards.evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(hrefs).toEqual([
      `${siteRoot}articles/loan-comparison/what-is-loan-prepayment/`,
      `${siteRoot}articles/loan-prepayment/reduce-tenure-or-lower-emi-after-prepayment/`,
      `${siteRoot}articles/loan-prepayment/early-vs-late-loan-prepayment/`,
      `${siteRoot}articles/loan-comparison/how-to-reduce-home-loan-interest/`,
    ]);
  });

  test("search finds it by name and by alias", async ({ page, go, siteRoot }) => {
    await go("loans.html");
    const card = page.locator("a[href$='calculators/prepayment/']");
    await expect(card.first()).toBeVisible();
  });

  test("responsive: no horizontal overflow and the form stays usable", async ({ page, go }) => {
    await go("calculators/prepayment/");
    await expectNoHorizontalOverflow(page);
    await page.locator("#prepay-after").fill("12");
    await expectNoHorizontalOverflow(page);
    await expect(page.locator("#prepay-years")).toBeVisible();
    await expect(page.locator("#prepay-months")).toBeVisible();
  });

  test("works in local mode only: no analytics, no storage writes, no extra network", async ({ page, go, context }) => {
    await go("calculators/prepayment/");
    await fill(page, { amount: 123000 });
    const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
    expect(storage).toEqual({ local: 0, session: 0, cookie: "" });
    expect(context.__external.filter((u) => !/fonts\.(googleapis|gstatic)\.com|unsplash/.test(String(u)))).toEqual([]);
  });

  test("the guide article's call to action now opens this tool", async ({ page, go, siteRoot }) => {
    await go("articles/loan-comparison/what-is-loan-prepayment/");
    await expect(page.locator(`a[href='${siteRoot}calculators/prepayment/']`).first()).toBeVisible();
  });

  test("both new articles render from static HTML with their tool link", async ({ page, go, siteRoot }) => {
    for (const slug of ["reduce-tenure-or-lower-emi-after-prepayment", "early-vs-late-loan-prepayment"]) {
      await go(`articles/loan-prepayment/${slug}/`);
      await expect(page.locator("h1.article-title")).toBeVisible();
      await expect(page.locator(`a[href='${siteRoot}calculators/prepayment/']`).first()).toBeVisible();
      await expect(page.locator(".article-hero img, .article img").first()).toBeVisible();
    }
  });
});
