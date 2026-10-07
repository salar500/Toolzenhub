/**
 * Tool Pack 17: Old vs New Tax Regime Calculator, tax year 2026-27, realistic user flows and its place in the Tax category.
 *
 * The engine's rules are covered by tests/unit/income-tax-golden.test.mjs against an independent Python reference. The figures here are
 * the reference's, written as literals (salary Rs 15,00,000: new Rs 97,500, old Rs 2,57,400; with Rs 4,25,000 of common deductions the
 * old tax is Rs 1,24,800 and the difference Rs 27,300; the break-even is about Rs 5,44,000 of deductions).
 */
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const F = {
  salary: "#it-salary",
  other: "#it-other",
  basic: "#it-basic",
  c80: "#it-80c",
  nps: "#it-nps",
  healthSelf: "#it-health-self",
  healthParents: "#it-health-parents",
  parentsAge: "#it-parents-age",
  ptax: "#it-ptax",
  interest: "#it-home-interest",
  interestKind: "#it-home-kind",
  hra: "#it-hra",
  rent: "#it-rent",
  city: "#it-city",
  hraManual: "#it-hra-manual",
  employerNps: "#it-employer-nps",
  otherDed: "#it-other-ded",
};

const body = (page) => page.locator("#it-results-body");
const card = (page, n) => page.locator(".it-card").nth(n);
const newCard = (page) => card(page, 0);
const oldCard = (page) => card(page, 1);
const amount = (loc) => loc.locator(".it-card__amount");
const sentence = (page) => page.locator(".it-sentence");
const live = (page) => page.locator("#it-live");

async function open(page, go) {
  await go("calculators/income-tax/");
  await expect(page.locator("#it-form")).toHaveAttribute("data-ready", "true");
}

const fill = async (page, values) => {
  for (const [key, value] of Object.entries(values)) await page.locator(F[key]).fill(String(value));
};

const openDeductions = async (page) => {
  if (!(await page.locator("#it-deductions").evaluate((d) => d.open))) await page.locator("#it-deductions > summary").click();
};

const openAdvanced = async (page) => {
  await openDeductions(page);
  if (!(await page.locator(".it-advanced").evaluate((d) => d.open))) await page.locator(".it-advanced > summary").click();
};

const money = (text) => Number(text.replace(/[^\d]/g, ""));

test.describe("Old vs New Tax Regime Calculator", () => {
  test("page, breadcrumb, tax year, scope panel, sources and the empty state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Old vs New Tax Regime Calculator");
    await expect(page.locator("h1")).toHaveCount(1);
    const crumb = page.locator(".calculator-breadcrumb");
    const labels = (await crumb.locator("a, strong, span[aria-current]").allInnerTexts()).map((t) => t.trim().toLowerCase()).filter(Boolean);
    expect(labels.slice(0, 4)).toEqual(["home", "calculators", "tax", "old vs new tax regime calculator"]);
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.slice(0, 2)).toEqual([siteRoot, `${siteRoot}categories.html`]);
    // the year is explicit and prominent, and nothing claims to be the latest
    await expect(page.locator(".it-year")).toContainText("Tax year 2026-27 (FY 2026-27)");
    await expect(page.locator(".it-year")).toContainText("Rules checked on 7 October 2026");
    await expect(page.locator("main")).not.toContainText(/latest (tax )?rules|most accurate|\bbest\b|ultimate|you should (choose|opt)/i);
    // the scope is discoverable at the top, not only in the footer
    const scope = page.locator(".it-scope");
    await expect(scope).toBeVisible();
    for (const text of ["Resident individuals under 60", "₹50,00,000", "no surcharge", "not tax advice"]) await expect(scope).toContainText(text);
    // sources: official, linked, https
    const sources = page.locator(".it-sources a");
    await expect(sources).toHaveCount(5);
    for (const href of await sources.evaluateAll((a) => a.map((x) => x.getAttribute("href")))) expect(href).toMatch(/^https:\/\/(egazette\.gov\.in|www\.incometax\.gov\.in|www\.pib\.gov\.in)\//);
    // the empty state, and the deductions are not an ITR form on first view
    await expect(body(page)).toContainText("Enter your annual salary or pension income to compare the two regimes.");
    await expect(page.locator(".it-card")).toHaveCount(0);
    expect(await page.locator("#it-deductions").evaluate((d) => d.open)).toBe(false);
    await expect(page.locator("#it-form input:visible")).toHaveCount(3);
    await expect(page.locator(".related-calculator-card")).toHaveCount(1);
    expect(watch.pageErrors).toEqual([]);
  });

  test("a real, quiet way to report an issue sits under Rules and Sources, and the sources open safely", async ({ page, go, watch }) => {
    await open(page, go);
    const report = page.locator(".report-issue a");
    await expect(report).toHaveCount(1);
    await expect(report).toContainText("Report it");
    await expect(report).toContainText("opens GitHub in a new tab");
    await expect(report).toHaveAttribute("href", "https://github.com/salar500/Toolzenhub/issues/new?title=Income%20tax%20calculator%3A%20");
    await expect(report).toHaveAttribute("target", "_blank");
    expect(await report.getAttribute("rel")).toMatch(/noopener/);
    // honest about what it is: public, needs an account; and nothing pretends to send
    await expect(page.locator(".report-issue")).toContainText("public and need a free GitHub account");
    await expect(page.locator("main")).not.toContainText(/guaranteed|100% accurate|verified by tax experts/i);
    // it follows the sources, inside that section, and is not above the calculator
    const section = page.locator(".calculator-info", { has: page.locator(".it-sources") });
    await expect(section.locator(".report-issue")).toHaveCount(1);
    const box = async (loc) => (await loc.boundingBox()).y;
    expect(await box(page.locator(".report-issue"))).toBeGreaterThan(await box(page.locator(".it-sources")));
    expect(await box(page.locator(".report-issue"))).toBeGreaterThan(await box(page.locator("#it-form")));
    // source links: descriptive text, safe rel, same-tab https
    for (const link of await page.locator(".it-sources a").all()) {
      expect((await link.innerText()).trim().length).toBeGreaterThan(15);
      expect(await link.getAttribute("rel")).toMatch(/noopener/);
    }
    // keyboard: reachable and visibly focused
    await report.focus();
    await expect(report).toBeFocused();
    const outline = await report.evaluate((a) => getComputedStyle(a).outlineStyle + " " + getComputedStyle(a).outlineWidth);
    expect(outline).toMatch(/solid 3px/);
    // the touch target is comfortable
    expect((await report.boundingBox()).height).toBeGreaterThanOrEqual(40);
    await expectNoHorizontalOverflow(page);
    expect(watch.pageErrors).toEqual([]);
  });

  test("the tax year is never silently timeless: no banner during 2026-27, a clear one once the year has ended", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#it-stale")).toBeHidden();
    await page.clock.install({ time: new Date("2027-05-01T10:00:00+05:30") });
    await go("calculators/income-tax/");
    await expect(page.locator("#it-form")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#it-stale")).toBeVisible();
    await expect(page.locator("#it-stale")).toContainText("These rules are for Tax year 2026-27 (FY 2026-27), which has ended.");
  });

  test("a salaried scenario: salary, common deductions, comparison, breakdown, break-even, a change, reset", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { salary: 1500000 });
    await expect(newCard(page)).toContainText("New regime");
    await expect(amount(newCard(page))).toHaveText("₹97,500");
    await expect(oldCard(page)).toContainText("Old regime");
    await expect(amount(oldCard(page))).toHaveText("₹2,57,400");
    await expect(page.locator(".it-difference strong")).toHaveText("₹1,59,900");
    await expect(sentence(page)).toHaveText("Based on these inputs and assumptions, the New Regime results in an estimated ₹1,59,900 lower tax.");
    // "lower" is a word on one card (and a heavier border), not a colour alone
    await expect(page.locator(".it-card__badge")).toHaveCount(1);
    await expect(newCard(page).locator(".it-card__badge")).toHaveText("Lower estimated tax");
    await expect(oldCard(page).locator(".it-card__badge")).toHaveCount(0);
    await expect(newCard(page)).toContainText("Taxable income ₹14,25,000");
    await expect(oldCard(page)).toContainText("Taxable income ₹14,50,000");
    await expect(newCard(page)).toContainText("6.5% of your income");
    await expect(page.locator(".it-break")).toContainText("about ₹5,44,000");
    await expect(page.locator(".it-break")).toContainText("You have entered ₹0");

    // the common deductions
    await openDeductions(page);
    await fill(page, { c80: 150000, healthSelf: 25000, nps: 50000, interest: 200000 });
    await expect(amount(oldCard(page))).toHaveText("₹1,24,800");
    await expect(amount(newCard(page))).toHaveText("₹97,500"); // the new regime does not use them
    await expect(page.locator(".it-difference strong")).toHaveText("₹27,300");
    await expect(sentence(page)).toHaveText("Based on these inputs and assumptions, the New Regime results in an estimated ₹27,300 lower tax.");
    await expect(page.locator(".it-break")).toContainText("about ₹5,44,000");
    await expect(page.locator(".it-break")).toContainText("You have entered ₹4,25,000, which is about ₹1,19,000 short.");

    // the breakdown, secondary to the comparison
    await page.locator(".it-breakdown > summary").click();
    const rows = page.locator(".it-breakdown__grid > div").nth(1).locator(".it-row");
    await expect(rows.filter({ hasText: "Standard deduction" })).toContainText("−₹50,000");
    await expect(rows.filter({ hasText: "Section 123 (80C)" })).toContainText("−₹1,50,000");
    await expect(rows.filter({ hasText: "Home loan interest" })).toContainText("−₹2,00,000");
    await expect(rows.filter({ hasText: "Taxable income (rounded to the nearest ₹10)" })).toContainText("₹10,25,000");
    await expect(rows.filter({ hasText: "Estimated tax (rounded to the nearest ₹10)" })).toContainText("₹1,24,800");
    const newRows = page.locator(".it-breakdown__grid > div").nth(0).locator(".it-row");
    await expect(newRows.filter({ hasText: "Standard deduction" })).toContainText("−₹75,000");

    // above a limit: the entered and the used amounts are both shown, and nothing is an error
    await fill(page, { c80: 200000 });
    await expect(rows.filter({ hasText: "Section 123 (80C)" })).toContainText("−₹1,50,000");
    await expect(rows.filter({ hasText: "Section 123 (80C)" })).toContainText("You entered ₹2,00,000; the limit applied is ₹1,50,000");
    await expect(amount(oldCard(page))).toHaveText("₹1,24,800");
    await expect(page.locator(".it-error")).toHaveCount(0);

    // a change moves the result the predictable way
    await fill(page, { c80: 0 });
    expect(money(await amount(oldCard(page)).innerText())).toBeGreaterThan(124800);
    await fill(page, { c80: 150000, interest: 0 });
    expect(money(await amount(oldCard(page)).innerText())).toBeGreaterThan(124800);

    // reset
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator(F.salary)).toHaveValue("");
    await expect(page.locator(F.c80)).toHaveValue("");
    await expect(body(page)).toContainText("Enter your annual salary or pension income");
    await expect(page.locator(".it-card")).toHaveCount(0);
    await expect(page.locator(F.salary)).toBeFocused();
  });

  test("the rebate boundary: Rs 12,75,000 pays nothing in the new regime and Rs 10 more pays Rs 10; the old regime is a different story", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { salary: 1275000 });
    await expect(amount(newCard(page))).toHaveText("₹0");
    await expect(amount(oldCard(page))).toHaveText("₹1,87,200");
    await expect(newCard(page)).toContainText("Taxable income ₹12,00,000");
    await fill(page, { salary: 1275010 });
    await expect(amount(newCard(page))).toHaveText("₹10");
    await expect(page.locator(".it-difference strong")).toHaveText("₹1,87,190");
    await page.locator(".it-breakdown > summary").click();
    await expect(page.locator(".it-breakdown__grid > div").nth(0).locator(".it-row", { hasText: "Rebate (section 156)" })).toContainText("Includes marginal relief above ₹12 lakh");
  });

  test("the old regime wins: the Old card carries the label, and the sentence says so; no break-even is shown", async ({ page, go }) => {
    await open(page, go);
    await openDeductions(page);
    await fill(page, { salary: 2000000, basic: 800000, hra: 400000, rent: 600000, c80: 150000, nps: 50000, healthSelf: 25000, interest: 200000 });
    await page.locator(F.city).selectOption("yes");
    await openAdvanced(page);
    await fill(page, { otherDed: 600000 });
    await expect(amount(oldCard(page))).toHaveText("₹18,200");
    await expect(amount(newCard(page))).toHaveText("₹1,92,400");
    await expect(oldCard(page).locator(".it-card__badge")).toHaveText("Lower estimated tax");
    await expect(newCard(page).locator(".it-card__badge")).toHaveCount(0);
    await expect(sentence(page)).toHaveText("Based on these inputs and assumptions, the Old Regime results in an estimated ₹1,74,200 lower tax.");
    await expect(page.locator(".it-break")).toContainText("the old regime already gives the same or lower estimated tax");
  });

  test("equal: both regimes at zero say so, with no winner label", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { salary: 300000 });
    await expect(amount(newCard(page))).toHaveText("₹0");
    await expect(amount(oldCard(page))).toHaveText("₹0");
    await expect(page.locator(".it-card__badge")).toHaveCount(0);
    await expect(sentence(page)).toHaveText("Based on these inputs and assumptions, both regimes give the same estimated tax, ₹0.");
  });

  test("above Rs 50 lakh nothing is calculated: a clear limitation, exactly at Rs 50 lakh it is", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { salary: 5000000 });
    await expect(page.locator(".it-card")).toHaveCount(2);
    await expect(amount(newCard(page))).toHaveText("₹10,99,800");
    await fill(page, { salary: 5000001 });
    await expect(page.locator(".it-card")).toHaveCount(0);
    await expect(page.locator(".it-notice")).toContainText("This version supports total income up to ₹50 lakh. Higher incomes may require surcharge and marginal-relief calculations that are not included.");
    await expect(page.locator(".it-sentence")).toHaveCount(0);
    await fill(page, { salary: 3000000, other: 2000001 });
    await expect(page.locator(".it-notice")).toBeVisible();
    // a deduction does not bring it back into scope
    await openDeductions(page);
    await fill(page, { salary: 5200000, other: 0, c80: 150000 });
    await expect(page.locator(".it-notice")).toBeVisible();
    await expect(live(page)).toHaveText(/up to ₹50 lakh/, { timeout: 4000 });
  });

  test("validation: a message for the field, linked to it, the input kept, fixing it clears it", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { salary: -5 });
    await expect(page.locator(".it-error")).toContainText("Please check these values");
    await expect(page.locator(".it-error")).toContainText("Enter a whole number of rupees, 0 or more.");
    await expect(page.locator(F.salary)).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(F.salary)).toHaveAttribute("aria-describedby", /it-results-error/);
    await expect(page.locator(F.salary)).toHaveValue("-5");
    await fill(page, { salary: 1.5 });
    await expect(page.locator(".it-error")).toContainText("whole number of rupees");
    await fill(page, { salary: 1500000 });
    await expect(page.locator(".it-error")).toHaveCount(0);
    await expect(page.locator(F.salary)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator(F.salary)).not.toHaveAttribute("aria-describedby", /it-results-error/);
    await expect(amount(newCard(page))).toHaveText("₹97,500");
    // dependent fields
    await fill(page, { basic: 2000000 });
    await expect(page.locator(".it-error")).toContainText("Basic salary plus DA cannot be more than your annual salary.");
    await expect(page.locator(F.basic)).toHaveAttribute("aria-invalid", "true");
    await fill(page, { basic: 0 });
    await openAdvanced(page);
    await fill(page, { employerNps: 50000 });
    await expect(page.locator(".it-error")).toContainText("Enter your basic salary plus DA");
    await fill(page, { basic: 600000 });
    await expect(page.locator(".it-error")).toHaveCount(0);
  });

  test("HRA: worked out from rule 279 for the common case, or entered when the helper does not fit", async ({ page, go }) => {
    await open(page, go);
    await openDeductions(page);
    await fill(page, { salary: 1800000, basic: 600000, hra: 300000, rent: 150000 });
    await page.locator(F.city).selectOption("yes");
    await expect(page.locator("#it-hra-result")).toHaveText("HRA exemption worked out: ₹90,000"); // rent 1,50,000 - 10% of 6,00,000
    await page.locator(F.hra).fill("400000");
    await page.locator(F.rent).fill("500000");
    await expect(page.locator("#it-hra-result")).toHaveText("HRA exemption worked out: ₹3,00,000"); // 50% of salary, high-cost city
    await page.locator(F.city).selectOption("no");
    await expect(page.locator("#it-hra-result")).toHaveText("HRA exemption worked out: ₹2,40,000"); // 40% elsewhere
    await page.locator(F.rent).fill("60000");
    await expect(page.locator("#it-hra-result")).toHaveText("HRA exemption worked out: ₹0"); // rent is only 10% of salary
    // enter it yourself
    await page.getByLabel("I know my exemption").check();
    await expect(page.locator(F.hraManual)).toBeVisible();
    await expect(page.locator("#it-hra-calc")).toBeHidden();
    await expect(page.locator("#it-hra-result")).toBeHidden();
    await page.locator(F.hraManual).fill("250000");
    await page.locator(".it-breakdown > summary").click();
    await expect(page.locator(".it-breakdown__grid > div").nth(1).locator(".it-row", { hasText: "HRA exemption" })).toContainText("−₹2,50,000");
    // never taken in the new regime
    await expect(page.locator(".it-breakdown__grid > div").nth(0).locator(".it-row", { hasText: "HRA exemption" })).toHaveCount(0);
  });

  test("the new regime ignores every old-regime deduction", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { salary: 2000000 });
    const before = await amount(newCard(page)).innerText();
    await openAdvanced(page);
    await fill(page, { basic: 800000, c80: 150000, nps: 50000, healthSelf: 25000, interest: 200000, ptax: 2400, otherDed: 500000, hra: 300000, rent: 600000 });
    await expect(amount(newCard(page))).toHaveText(before);
  });

  test("health insurance caps and the parents' age; home loan interest caps", async ({ page, go }) => {
    await open(page, go);
    await openDeductions(page);
    await fill(page, { salary: 1800000, healthParents: 60000 });
    await page.locator(".it-breakdown > summary").click();
    const oldRows = page.locator(".it-breakdown__grid > div").nth(1).locator(".it-row");
    await expect(oldRows.filter({ hasText: "Health insurance, parents" })).toContainText("−₹25,000");
    await page.locator(F.parentsAge).selectOption("yes");
    await expect(oldRows.filter({ hasText: "Health insurance, parents" })).toContainText("−₹50,000");
    await fill(page, { interest: 250000 });
    await expect(oldRows.filter({ hasText: "Home loan interest" })).toContainText("−₹2,00,000");
    await page.locator(F.interestKind).selectOption("yes");
    await expect(oldRows.filter({ hasText: "Home loan interest" })).toContainText("−₹30,000");
    await expect(oldRows.filter({ hasText: "Home loan interest" })).toContainText("the limit applied is ₹30,000");
  });

  test("privacy: no network request carries the numbers, and nothing is stored", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    await open(page, go);
    await fill(page, { salary: 1500000, other: 12345 });
    await openDeductions(page);
    await fill(page, { c80: 150000 });
    await expect(amount(newCard(page))).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  });

  test("accessibility: labelled fields with linked hints, one polite announcement of a settled result, words for the winner, keyboard-operable steps", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(page.locator("#it-results-body")).not.toHaveAttribute("aria-live", /.+/);
    await openAdvanced(page);
    for (const key of Object.keys(F).filter((k) => !["parentsAge", "interestKind", "city"].includes(k))) {
      const input = page.locator(F[key]);
      const named = await input.evaluate((el) => !!(el.labels && el.labels[0] && el.labels[0].textContent.trim()));
      expect(named, key).toBe(true);
      const described = await input.getAttribute("aria-describedby");
      if (described) for (const id of described.split(/\s+/)) await expect(page.locator(`#${id}`), `${key} hint`).toHaveCount(1);
    }
    for (const key of ["parentsAge", "interestKind", "city"]) expect(await page.locator(F[key]).evaluate((el) => el.labels.length), key).toBe(1);
    // typing announces once, when it settles, not per keystroke
    await page.locator(F.salary).pressSequentially("1500000", { delay: 40 });
    await expect(live(page)).toHaveText("Tax year 2026-27 (FY 2026-27). New regime ₹97,500, old regime ₹2,57,400. Lower estimated tax: the new regime, by ₹1,59,900.", { timeout: 4000 });
    // headings stay in order: one h1, then h2 sections; no heading level is skipped
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((h) => h.map((x) => Number(x.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);
    // the step is a keyboard-operable disclosure with a visible focus ring
    await page.locator("#it-deductions > summary").focus();
    expect(await page.locator("#it-deductions > summary").evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
    const wasOpen = await page.locator("#it-deductions").evaluate((d) => d.open);
    await page.keyboard.press("Enter");
    expect(await page.locator("#it-deductions").evaluate((d) => d.open)).toBe(!wasOpen);
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: the comparison stacks, nothing overflows in any state, controls are tappable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 760 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await fill(page, { salary: 4900000 });
      await expect(page.locator(".it-card")).toHaveCount(2);
      const a = await newCard(page).boundingBox();
      const b = await oldCard(page).boundingBox();
      expect(b.y).toBeGreaterThanOrEqual(a.y + a.height - 1); // stacked, not side by side
      for (const box of [a, b]) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      await expectNoHorizontalOverflow(page);
      await openAdvanced(page);
      await fill(page, { basic: 2000000, c80: 150000, nps: 50000, healthSelf: 25000, healthParents: 50000, ptax: 2400, interest: 200000, hra: 800000, rent: 900000, employerNps: 100000, otherDed: 99999999 });
      await page.locator(F.city).selectOption("yes");
      await expectNoHorizontalOverflow(page);
      await page.locator(".it-breakdown > summary").click();
      await expectNoHorizontalOverflow(page);
      for (const heading of [page.locator("#it-deductions > summary"), page.locator(".it-advanced > summary"), page.locator(".it-breakdown > summary")]) expect((await heading.boundingBox()).height).toBeGreaterThanOrEqual(44);
      expect((await page.getByRole("button", { name: "Reset" }).boundingBox()).height).toBeGreaterThanOrEqual(40);
      await fill(page, { salary: 5000001 });
      await expect(page.locator(".it-notice")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await fill(page, { salary: -1 });
      await expect(page.locator(".it-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe("Old vs New Tax Regime Calculator in the site", () => {
  test("the Tax category lists GST and the new tool, with no Coming soon card; All Calculators shows it as a link", async ({ page, go, siteRoot }) => {
    await go("tax.html");
    const links = await page.locator("a.category-page-card, a.calculator-card").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(links).toEqual([`${siteRoot}calculators/gst/`, `${siteRoot}calculators/income-tax/`]);
    await expect(page.locator(".category-page-card--soon")).toHaveCount(0);
    await go("calculators.html");
    await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/income-tax/']`)).toContainText("Old vs New Tax Regime Calculator");
    await expect(page.locator("#calculators-grid .calculator-card--soon", { hasText: "Income Tax Calculator" })).toHaveCount(0);
    await go("tools.html");
    await expect(page.locator(`.directory-section a[href$="calculators/income-tax/"]`)).toHaveCount(1);
  });

  test("global search: the regime queries lead with the tool, and the other tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["old vs new tax regime", "income tax calculator", "new regime calculator", "old regime calculator", "tax regime comparison", "salary tax calculator india", "new vs old regime"]) await expect(await first(q), q).toContainText("Old vs New Tax Regime Calculator");
    await expect(await first("gst")).toContainText("GST Calculator");
    await expect(await first("emi")).toContainText("EMI Calculator");
    await expect(await first("date calculator")).toContainText("Date Calculator");
    await expect(await first("unix timestamp")).toContainText("Unix Timestamp Converter");
    await expect(await first("json")).toContainText("JSON Formatter & Validator");
    await expect(await first("home loan")).toContainText("Home Loan Calculator");
    await expect(await first("sip")).toContainText("SIP Calculator");
  });

  test("calculator search finds it; the other Tax tool and the loan tools do not list it as related", async ({ page, go, siteRoot }) => {
    await go("calculators.html");
    const input = page.locator("#calculators-search-input");
    for (const q of ["income tax", "old vs new tax regime", "tax regime"]) {
      await input.fill(q);
      await expect(page.locator(`#calculators-grid a.calculator-card[href='${siteRoot}calculators/income-tax/']`), q).toHaveCount(1);
    }
    for (const slug of ["gst", "home-loan", "emi"]) {
      await go(`calculators/${slug}/`);
      await expect(page.locator("a[href*='calculators/income-tax']"), slug).toHaveCount(0);
    }
    await go("calculators/income-tax/");
    const related = await page.locator(".related-calculator-card").evaluateAll((els) => els.map((e) => (e.matches("a") ? e : e.querySelector("a")).getAttribute("href")));
    expect(related).toEqual([`${siteRoot}calculators/home-loan/`]);
    await expect(page.locator(`main a[href$="calculators/gst/"]`)).toHaveCount(0);
  });
});
