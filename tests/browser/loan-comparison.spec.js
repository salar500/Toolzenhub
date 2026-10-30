/**
 * M0.8 — Loan Comparison Calculator, realistic user flows.
 *
 * Expected figures come from the shared loan formulas (golden-tested in tests/unit) formatted with
 * Intl like the page does. PDF generation itself is NOT exercised: it loads jsPDF and a font from
 * public CDNs at click time, and the suite deliberately uses no external network. The test checks
 * that the PDF control exists and is usable instead (see tests/README.md).
 */
import { test, expect, expectClean, expectNoHorizontalOverflow, inr } from "../helpers/test-base.mjs";
import { calculateEMI, calculateTotalRepayment, calculateTotalInterest } from "../../assets/js/calculators/formulas/loan.js";

const LAKH = 100000;

/** set one loan card (a | b) the way a user would */
async function setLoan(page, which, { amount, unit = LAKH, rate, years }) {
  await page.locator(`#${which}-amount`).selectOption(String(amount));
  await page.locator(`#${which}-unit`).selectOption(String(unit));
  await page.locator(`#${which}-rate`).fill(String(rate));
  await page.locator(`#${which}-years`).fill(String(years));
}

const figures = (amount, unit, rate, years) => {
  const principal = amount * unit;
  return {
    principal,
    emi: calculateEMI(principal, rate, years),
    interest: calculateTotalInterest(principal, rate, years),
    repayment: calculateTotalRepayment(principal, rate, years),
  };
};

const resultText = (page) => page.locator("#comparison-result");

test.describe("Loan Comparison calculator", () => {
  test("page, breadcrumb, and both loan input groups", async ({ page, go, watch, siteRoot }) => {
    await go("calculators/loan-comparison/");
    await expect(page.locator("h1")).toHaveText("Loan Comparison Calculator");

    const crumb = page.locator(".calculator-breadcrumb").first();
    await expect(crumb).toContainText("Home");
    await expect(crumb).toContainText("Calculators");
    await expect(crumb).toContainText("Loan Comparison Calculator");
    const hrefs = await crumb.locator("a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}categories.html`, `${siteRoot}loans.html`]);

    // two loan groups, each with amount / unit / rate / tenure (+ sliders)
    for (const which of ["a", "b"]) {
      for (const id of ["amount", "unit", "rate", "years", "amount-slider", "rate-slider", "years-slider"]) {
        await expect(page.locator(`#${which}-${id}`), `#${which}-${id}`).toBeVisible();
      }
    }
    await expect(page.getByRole("heading", { name: "Loan A", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Loan B", exact: true })).toBeVisible();

    // defaults: ₹50 lakh; A 8.5%, B 9%; 20 years — and a comparison is already shown
    await expect(page.locator("#a-amount")).toHaveValue("50");
    await expect(page.locator("#a-unit")).toHaveValue(String(LAKH));
    await expect(page.locator("#a-rate")).toHaveValue("8.5");
    await expect(page.locator("#a-years")).toHaveValue("20");
    await expect(page.locator("#b-rate")).toHaveValue("9");
    const a = figures(50, LAKH, 8.5, 20);
    const b = figures(50, LAKH, 9, 20);
    await expect(resultText(page)).toContainText(inr(a.emi));
    await expect(resultText(page)).toContainText(inr(b.emi));
    expectClean(watch);
  });

  test("enter Loan A and Loan B, compare, verify EMI / interest / repayment / winner", async ({ page, go, watch }) => {
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 30, rate: 8, years: 15 });
    await setLoan(page, "b", { amount: 30, rate: 9.5, years: 15 });

    const a = figures(30, LAKH, 8, 15);
    const b = figures(30, LAKH, 9.5, 15);
    const out = resultText(page);
    for (const v of [a.emi, b.emi, a.interest, b.interest, a.repayment, b.repayment]) await expect(out).toContainText(inr(v));
    // winner = lower total interest => Loan A, with the saving shown
    await expect(out).toContainText("Lower Interest Cost");
    await expect(out.locator(".loan-summary-card").first()).toContainText("Loan A");
    await expect(out).toContainText(inr(Math.abs(a.interest - b.interest)));
    // figures are labelled
    for (const label of ["EMI (Monthly)", "Total Interest", "Total Repayment", "Interest Difference"]) await expect(out).toContainText(label);
    // "First 12 months" tables for both loans, 12 rows each
    const tables = out.locator(".loan-table-scroll");
    await expect(tables).toHaveCount(2);
    for (let i = 0; i < 2; i++) await expect(tables.nth(i).locator("tbody tr")).toHaveCount(12);

    // swap the rates: now Loan B wins
    await page.locator("#a-rate").fill("10");
    await page.locator("#b-rate").fill("7");
    await expect(out.locator(".loan-summary-card").first()).toContainText("Loan B");
    expectClean(watch);
  });

  test("identical loans are reported as a tie", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 20, rate: 9, years: 10 });
    await setLoan(page, "b", { amount: 20, rate: 9, years: 10 });
    await expect(resultText(page).locator(".loan-summary-card").first()).toContainText("Both Loans");
  });

  test("results update live as inputs change (no button needed)", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await page.locator("#a-rate").fill("6");
    await expect(resultText(page)).toContainText(inr(figures(50, LAKH, 6, 20).emi));
  });

  test("full amortization schedule modal: open, contents, close (button, Escape, overlay, footer)", async ({ page, go, watch, isMobile }) => {
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 25, rate: 8, years: 15 });
    const a = figures(25, LAKH, 8, 15);
    const modal = page.locator("#amortization-modal");
    const open = (which) => page.locator(`.loan-view-link[data-loan="${which}"]`).click();

    await open("a");
    await expect(modal).toBeVisible();
    const dialog = modal.locator(".loan-amortization-dialog");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByRole("heading", { name: "Full Amortization Schedule" })).toBeVisible();
    await expect(dialog).toContainText("Loan A");
    // summary cards
    for (const v of [a.emi, a.interest, a.repayment]) await expect(dialog.locator(".loan-amortization-summary")).toContainText(inr(v));
    // full schedule: 15 years = 180 monthly rows, numbered 1..180, ending at a ~zero balance
    const rows = dialog.locator(".loan-amortization-table tbody tr");
    await expect(rows).toHaveCount(180);
    await expect(rows.first().locator("td").first()).toHaveText("1");
    await expect(rows.last().locator("td").first()).toHaveText("180");
    await expect(rows.last().locator("td").last()).toHaveText(inr(0));
    await expect(page.locator("body")).toHaveClass(/amortization-modal-open/);

    // the PDF control exists and is usable (generation needs public CDNs, so it is not clicked here)
    const pdf = dialog.locator("[data-download-amortization-pdf]");
    await expect(pdf).toBeVisible();
    await expect(pdf).toBeEnabled();
    await expect(pdf).toHaveText(/Download PDF/);

    // close with the × button
    await dialog.getByLabel("Close").click(); // the × button (the footer button is covered separately below)
    await expect(modal).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveClass(/amortization-modal-open/);

    // close with Escape
    await open("b");
    await expect(modal).toBeVisible();
    await expect(modal.locator(".loan-amortization-dialog")).toContainText("Loan B");
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);

    // close by clicking the overlay (baseline: on a phone-width viewport the dialog fills the whole
    // screen, so there is no exposed overlay to click — only meaningful on larger viewports)
    if (!isMobile) {
      await open("a");
      await expect(modal).toBeVisible();
      await modal.locator(".loan-amortization-overlay").click({ position: { x: 5, y: 5 } });
      await expect(modal).toHaveCount(0);
    }

    // close with the footer button
    await open("a");
    await modal.locator(".loan-amortization-footer [data-close-amortization]").click();
    await expect(modal).toHaveCount(0);
    expectClean(watch);
  });

  test("reset restores both loans to their defaults and recomputes", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 12, rate: 5, years: 7 });
    await setLoan(page, "b", { amount: 90, unit: 10000000, rate: 14, years: 30 });
    await page.locator("#reset-loans").click();

    for (const [which, rate] of [["a", "8.5"], ["b", "9"]]) {
      await expect(page.locator(`#${which}-amount`)).toHaveValue("50");
      await expect(page.locator(`#${which}-unit`)).toHaveValue(String(LAKH));
      await expect(page.locator(`#${which}-rate`)).toHaveValue(rate);
      await expect(page.locator(`#${which}-years`)).toHaveValue("20");
    }
    await expect(resultText(page)).toContainText(inr(figures(50, LAKH, 8.5, 20).emi));
    await expect(resultText(page)).toContainText(inr(figures(50, LAKH, 9, 20).emi));
  });

  test("baseline quirk: a rate above the slider maximum is still used for the calculation", async ({ page, go }) => {
    // The slider is clamped to 25 but the typed value (40) is what getLoanData() reads.
    await go("calculators/loan-comparison/");
    await page.locator("#a-rate").fill("40");
    await expect(page.locator("#a-rate-slider")).toHaveValue("25");
    await expect(resultText(page)).toContainText(inr(figures(50, LAKH, 40, 20).emi));
  });

  test("related calculators, related articles", async ({ page, go, siteRoot, api }) => {
    await go("calculators/loan-comparison/");
    const calcs = page.locator(".related-calculator-card");
    await expect(page.getByRole("heading", { name: "Related Calculators" })).toBeVisible();
    await expect(calcs).toHaveCount(5); // the curated list (pack 50) first: EMI, Prepayment, Balance Transfer; then Home Loan and Credit Card Payoff from the automatic Loans relationship
    await expect(calcs.first()).toHaveAttribute("href", `${siteRoot}calculators/emi/`);
    await expect(calcs.nth(1)).toHaveAttribute("href", `${siteRoot}calculators/prepayment/`);
    await expect(calcs.nth(2)).toHaveAttribute("href", `${siteRoot}calculators/balance-transfer/`);
    await expect(calcs.nth(3)).toHaveAttribute("href", `${siteRoot}calculators/home-loan/`);
    await expect(calcs.nth(4)).toHaveAttribute("href", `${siteRoot}calculators/credit-card-payoff/`);
    await expect(page.getByRole("heading", { name: "Related Articles" })).toBeVisible();
    const hrefs = await page.locator(".related-article-card").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const h of hrefs) expect((await api.get(h)).status(), h).toBe(200);
  });

  test("explanatory content sections are present", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    for (const name of [/How to Use This Calculator/, /Why Compare Loans/, /How Does Loan Comparison Work/, /^Example$/, /Things to Consider/, /FAQs/]) {
      await expect(page.getByRole("heading", { name }).first()).toBeVisible();
    }
    expect(await page.locator("details").count()).toBeGreaterThanOrEqual(3);
  });

  test("layout fits the viewport (no horizontal scroll)", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await expect(page.locator("#reset-loans")).toBeVisible();
    await expect(page.locator("#compare-loans")).toHaveCount(0); // no redundant button: results are live
    await expectNoHorizontalOverflow(page);
  });
});

/* ---------------------------------------------------------------------------------------------------------
 * M4 — Loan Comparison on the shared tool architecture.
 * Literal figures below were captured from the live page BEFORE the migration (not derived from the code
 * under test). Scenarios cover: cheaper A, cheaper B, tie (above), different amounts, terms and amount units.
 * ------------------------------------------------------------------------------------------------------- */
test.describe("Loan Comparison — M4 shared architecture and regression", () => {
  const CRORE = 10000000;

  test("shared page structure: one breadcrumb first, tool content, related sections last", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
    const order = await page.locator("#app .calculator-page > *").evaluateAll((els) => els.map((e) => e.className));
    expect(order[0]).toBe("calculator-breadcrumb");
    expect(order.slice(-2)).toEqual(["related-section", "related-section"]);
    expect(order).toContain("loan-comparison-tool"); // tool-specific content stays in between
    await expect(page.locator("h1")).toHaveText("Loan Comparison Calculator");
    await expect(page.locator(".calculator-breadcrumb")).toHaveCount(1);
  });

  test("golden scenarios: different terms, different amounts / units", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    const out = resultText(page);

    // different terms (same amount and rate): 10 vs 25 years
    await setLoan(page, "a", { amount: 50, rate: 8.5, years: 10 });
    await setLoan(page, "b", { amount: 50, rate: 8.5, years: 25 });
    for (const v of ["₹61,993", "₹40,261", "₹24,39,141", "₹70,78,406", "₹74,39,141", "₹1,20,78,406", "₹46,39,265"]) await expect(out).toContainText(v);
    await expect(out.locator(".loan-summary-card").first()).toContainText("Loan A");

    // lakh vs crore amounts
    await setLoan(page, "a", { amount: 25, rate: 8, years: 15 });
    await setLoan(page, "b", { amount: 90, unit: CRORE, rate: 8, years: 15 });
    for (const v of ["₹23,891", "₹86,00,869", "₹18,00,434", "₹64,81,56,377", "₹43,00,434", "₹1,54,81,56,377", "₹64,63,55,942"]) await expect(out).toContainText(v);

    // mixed units and terms
    await setLoan(page, "a", { amount: 12, rate: 7, years: 5 });
    await setLoan(page, "b", { amount: 90, unit: CRORE, rate: 11, years: 30 });
    for (const v of ["₹23,761", "₹85,70,911", "₹2,25,686", "₹2,18,55,27,802", "₹14,25,686", "₹3,08,55,27,802", "₹2,18,53,02,115"]) await expect(out).toContainText(v);
  });

  test("amortization: first-month row, 12-month preview, full schedule, final balance", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 50, rate: 8.5, years: 10 });
    await setLoan(page, "b", { amount: 50, rate: 8.5, years: 25 });
    // preview tables: 12 rows each; Loan B (25y) month 1 = principal 4,845 / interest 35,417 / balance 49,95,155
    const previewB = resultText(page).locator(".loan-table-scroll").nth(1).locator("tbody tr");
    await expect(previewB).toHaveCount(12);
    await expect(previewB.first().locator("td")).toHaveText(["1", "₹4,845", "₹35,417", "₹49,95,155"]);
    await expect(previewB.nth(11).locator("td")).toHaveText(["12", "₹5,236", "₹35,026", "₹49,39,545"]);

    // full schedule in the modal: 300 rows, last balance zero, rows 1 and 12 match the preview
    await page.locator('.loan-view-link[data-loan="b"]').click();
    const rows = page.locator("#amortization-modal .loan-amortization-table tbody tr");
    await expect(rows).toHaveCount(300);
    await expect(rows.first().locator("td")).toHaveText(["1", "₹4,845", "₹35,417", "₹49,95,155"]);
    await expect(rows.nth(11).locator("td")).toHaveText(["12", "₹5,236", "₹35,026", "₹49,39,545"]);
    await expect(rows.last().locator("td").first()).toHaveText("300");
    await expect(rows.last().locator("td").last()).toHaveText("₹0");
  });

  test("modal accessibility: dialog semantics, labelled close button, scroll lock, Escape closes", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await page.locator('.loan-view-link[data-loan="a"]').click();
    const dialog = page.locator("#amortization-modal .loan-amortization-dialog");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    const labelId = await dialog.getAttribute("aria-labelledby");
    await expect(page.locator(`#${labelId}`)).toHaveText("Full Amortization Schedule");
    await expect(dialog.getByLabel("Close")).toBeVisible();
    await expect(page.locator("body")).toHaveClass(/amortization-modal-open/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#amortization-modal")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveClass(/amortization-modal-open/);
  });

  test("PDF download (functional; jsPDF replaced by a recorder): file name, content, button state", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__pdf = [];
      const rec = (n, a) => window.__pdf.push([n, JSON.parse(JSON.stringify(a, (k, v) => (typeof v === "function" ? "[fn]" : v)))]);
      class FakeDoc {
        constructor() {
          this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 }, getNumberOfPages: () => 1 };
          this.lastAutoTable = { finalY: 100 };
          return new Proxy(this, { get: (t, p) => (p in t ? t[p] : p === "then" ? undefined : (...a) => { rec(String(p), a); return p === "splitTextToSize" ? [String(a[0])] : p === "getTextWidth" ? 10 : t; }) });
        }
        autoTable(o) { rec("autoTable", [{ head: o.head, body: o.body }]); }
        save(f) { rec("save", [f]); }
      }
      window.jspdf = { jsPDF: FakeDoc };
    });
    await page.route("https://cdn.jsdelivr.net/**", (route) => route.fulfill({ status: 200, body: Buffer.from([1, 2, 3, 4]) }));
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 30, rate: 8, years: 15 });
    await page.locator('.loan-view-link[data-loan="a"]').click();
    const button = page.locator("[data-download-amortization-pdf]");
    await button.click();
    await expect.poll(() => page.evaluate(() => window.__pdf.some((c) => c[0] === "save"))).toBe(true);
    const calls = await page.evaluate(() => window.__pdf);
    expect(calls.find((c) => c[0] === "save")[1][0]).toBe("loan-a-3000000-8-percent-15-years-amortization-schedule.pdf");
    const texts = calls.filter((c) => c[0] === "text").map((c) => JSON.stringify(c[1][0]));
    expect(texts).toContain('"Full Amortization Schedule"');
    expect(texts.join(" ")).toContain("Loan A");
    expect(texts.join(" ")).toContain("₹30,00,000");
    const table = calls.find((c) => c[0] === "autoTable")[1][0];
    expect(table.body).toHaveLength(180);
    await expect(button).toHaveText(/Download PDF/); // restored after generation
    await expect(button).toBeEnabled();
  });
  test("PDF download (real jsPDF, vendored): a valid PDF is produced and no other host is contacted", async ({ page, go }) => {
    // Only what the export itself asks for is counted: requests made after the click, images excluded. The shared article thumbnails
    // come from another host (a site-wide matter recorded in the ledger) and arrive at unpredictable times, so they are not part of this claim.
    const seen = [];
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 30, rate: 8, years: 15 });
    await page.locator('.loan-view-link[data-loan="a"]').click();
    await page.waitForLoadState("networkidle");
    page.on("request", (r) => { if (/^https?:/.test(r.url()) && r.resourceType() !== "image") seen.push(r.url()); });
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("[data-download-amortization-pdf]").click()]);
    expect(download.suggestedFilename()).toBe("loan-a-3000000-8-percent-15-years-amortization-schedule.pdf");
    const bytes = await (await import("node:fs/promises")).readFile(await download.path());
    expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(20000);
    const origin = new URL(page.url()).origin;
    expect(seen.filter((u) => new URL(u).origin !== origin), "no request to another host").toEqual([]);
  });
  // Stage 3: the vendored library is real here; only its text() calls are observed, so the figures that reach the page of the PDF are checked.
  // Expected values: python -I, Decimal, 30,00,000 at 8% over 180 months: EMI 28,669.56; month 1 principal 8,670 and interest 20,000; month 180 principal 28,480 and interest 190; balance 0.
  test("PDF content (real jsPDF, text observed): the summary and the first and last schedule rows match an independent calculation", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__text = [];
      let lib;
      let wrapped = false;
      // the UMD build assigns an empty object first and fills it in afterwards, so the wrap happens on first read of a complete library
      Object.defineProperty(window, "jspdf", {
        configurable: true,
        get: () => {
          if (lib && lib.jsPDF && !wrapped) {
            wrapped = true;
            // jsPDF builds its methods per document, so the constructor is wrapped and each new document's text() is observed
            const Original = lib.jsPDF;
            const Spy = function (...args) {
              const doc = new Original(...args);
              const text = doc.text;
              doc.text = function (t, ...rest) { window.__text.push(Array.isArray(t) ? t.join(" ") : String(t)); return text.call(this, t, ...rest); };
              return doc;
            };
            Object.assign(Spy, Original);
            Spy.API = Original.API;
            Spy.prototype = Original.prototype;
            lib.jsPDF = Spy;
          }
          return lib;
        },
        set: (v) => { lib = v; }
      });
    });
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 30, rate: 8, years: 15 });
    await page.locator('.loan-view-link[data-loan="a"]').click();
    await Promise.all([page.waitForEvent("download"), page.locator("[data-download-amortization-pdf]").click()]);
    const text = (await page.evaluate(() => window.__text)).join(" | ");
    for (const expected of ["₹30,00,000", "₹28,670", "₹21,60,521", "₹51,60,521", "8% p.a.", "15 years", "Full Amortization Schedule"]) {
      expect(text, expected).toContain(expected);
    }
    // month 1 and month 180 rows (autoTable draws each cell with text())
    for (const cell of ["₹8,670", "₹20,000", "₹29,91,330", "₹28,480", "₹190", "₹0"]) expect(text, cell).toContain(cell);
    // no markup or script text can reach the document from a loan name
    expect(text).not.toMatch(/<script|onerror|undefined|NaN|Infinity/);
  });

  test("PDF failure is explained on the page, the button is restored and no raw error text is shown", async ({ page, go }) => {
    await page.route("**/vendor/jspdf/jspdf.umd.min.js", (route) => route.abort());
    await go("calculators/loan-comparison/");
    await setLoan(page, "a", { amount: 30, rate: 8, years: 15 });
    await page.locator('.loan-view-link[data-loan="a"]').click();
    const button = page.locator("[data-download-amortization-pdf]");
    await button.click();
    const alert = page.locator("[data-pdf-error]");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("role", "alert");
    await expect(alert).toContainText("The PDF could not be created");
    await expect(alert).not.toContainText(/Error|undefined|http/);
    await expect(button).toBeEnabled();
    await expect(button).toHaveText(/Download PDF/);
  });
});

test.describe("summary cards at tablet width (Design System 2.0)", () => {
  test("all five summary cards fit inside the page at 820px", async ({ page, go }) => {
    await page.setViewportSize({ width: 820, height: 900 });
    await go("calculators/loan-comparison/");
    const cards = page.locator(".loan-summary-card");
    await expect(cards).toHaveCount(5);
    const boxes = await cards.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right }; }));
    for (const b of boxes) { expect(b.l).toBeGreaterThanOrEqual(0); expect(b.r).toBeLessThanOrEqual(820); }
  });
});
