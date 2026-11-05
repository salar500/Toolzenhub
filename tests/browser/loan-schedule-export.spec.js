/**
 * EMI and Home Loan: the repayment schedule download (2026-11-05). A real click, a real download, and the file read back.
 * Expected figures come from an independent calculation (Python decimal, 50 digits), the same one tests/unit/schedule-csv.test.mjs
 * uses; they are not read from the page. Covered: the file's name, header, row count, chosen rows, totals, loan year, last balance;
 * a changed input changing the file; no button when there is nothing to export (empty, invalid, no EMI room); Reset removing it;
 * the other EMI modes that carry a schedule; and a phone width without sideways scroll.
 */
import fs from "node:fs";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const parse = (text) => text.replace(/^﻿/, "").split("\r\n").filter((l) => l !== "").map((l) => l.split(","));

async function saved(page, locator) {
  const [d] = await Promise.all([page.waitForEvent("download"), locator.click()]);
  return { name: d.suggestedFilename(), text: fs.readFileSync(await d.path(), "utf8") };
}

test.describe("EMI Calculator: schedule download", () => {
  const open = async (page, go) => {
    await go("calculators/emi/");
    await expect(page.locator("#emi-form")).toBeAttached();
  };
  const fill = async (page, loan, rate, years) => {
    await page.locator("#emi-loan").fill(String(loan));
    await page.locator("#emi-rate").fill(String(rate));
    await page.locator("#emi-years").fill(String(years));
  };

  test("1,000,000 at 8.5% for 20 years: the file has 240 payments that match the independent schedule", async ({ page, go }) => {
    await open(page, go);
    await fill(page, 1000000, 8.5, 20);
    const button = page.getByRole("button", { name: "Download schedule (CSV)", exact: true });
    await expect(button).toBeVisible();
    const file = await saved(page, button);
    expect(file.name).toBe("emi-repayment-schedule.csv");
    const lines = parse(file.text);
    expect(lines[0]).toEqual(["Payment", "Loan year", "EMI", "Principal", "Interest", "Balance"]);
    expect(lines).toHaveLength(242);
    expect(lines[1]).toEqual(["1", "1", "8678.23", "1594.90", "7083.33", "998405.10"]);
    expect(lines[120]).toEqual(["120", "10", "8678.23", "3694.17", "4984.06", "699938.23"]);
    expect(lines[240]).toEqual(["240", "20", "8678.23", "8617.19", "61.04", "0.00"]);
    expect(lines[241]).toEqual(["Total", "", "2082775.76", "1000000.00", "1082775.76", ""]);
    await expect(page.locator("#emi-copy-note")).toHaveText("Saved emi-repayment-schedule.csv: 240 payments.");
    // what the page shows and what the file holds are one calculation
    await expect(page.locator("#emi-results")).toContainText("8,678");
  });

  test("a changed input changes the file; an invalid or empty form offers no download; Reset removes it", async ({ page, go }) => {
    await open(page, go);
    await fill(page, 1000000, 8.5, 20);
    const button = page.getByRole("button", { name: "Download schedule (CSV)", exact: true });
    await expect(button).toBeVisible();
    await fill(page, 3456925, 8.5, 30);
    const file = await saved(page, button);
    const lines = parse(file.text);
    expect(lines).toHaveLength(362);
    expect(lines[1]).toEqual(["1", "1", "26580.76", "2094.21", "24486.55", "3454830.79"]);
    expect(lines[360]).toEqual(["360", "30", "26580.76", "26393.81", "186.96", "0.00"]);
    expect(lines[361]).toEqual(["Total", "", "9569074.48", "3456925.00", "6112149.48", ""]);

    await page.locator("#emi-loan").fill("-5");
    await expect(button).toHaveCount(0);
    await page.locator("#emi-loan").fill("");
    await expect(button).toHaveCount(0);

    await fill(page, 1000000, 8.5, 20);
    await expect(button).toBeVisible();
    // Reset restores the starting values, which give a result of their own: the file is that schedule, not the one before
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    const years = Number(await page.locator("#emi-years").inputValue());
    const reset = parse((await saved(page, button)).text);
    expect(reset).toHaveLength(years * 12 + 2);
    expect(reset[1][0]).toBe("1");
    expect(reset.at(-2)[5]).toBe("0.00");
  });

  test("the other two ways to ask: how long a payment takes to clear a loan, and what rate a payment implies", async ({ page, go }) => {
    await open(page, go);
    // 1,000,000 at 8.5% paid 10,000 a month: 175 payments, the last one smaller (independent Python simulation)
    await page.locator('input[name="emi-mode"][value="tenure"]').check({ force: true });
    await page.locator("#emi-loan").fill("1000000");
    await page.locator("#emi-rate").fill("8.5");
    await page.locator("#emi-payment").fill("10000");
    const button = page.getByRole("button", { name: "Download schedule (CSV)", exact: true });
    await expect(button).toBeVisible();
    const lines = parse((await saved(page, button)).text);
    expect(lines).toHaveLength(177);
    expect(lines[1]).toEqual(["1", "1", "10000.00", "2916.67", "7083.33", "997083.33"]);
    expect(lines[175]).toEqual(["175", "15", "5659.11", "5619.30", "39.80", "0.00"]);
    expect(lines[176]).toEqual(["Total", "", "1745659.11", "1000000.00", "745659.11", ""]);

    // a payment that does not cover the first month's interest never clears the loan: nothing to save
    await page.locator("#emi-payment").fill("5000");
    await expect(button).toHaveCount(0);

    // the rate a payment implies: the file's principal adds up to the loan and the balance ends at zero
    await page.locator('input[name="emi-mode"][value="rate"]').check({ force: true });
    await page.locator("#emi-loan").fill("1000000");
    await page.locator("#emi-years").fill("20");
    await page.locator("#emi-payment").fill("10000");
    await expect(button).toBeVisible();
    const byRate = parse((await saved(page, button)).text);
    expect(byRate.at(-1)[3]).toBe("1000000.00");
    expect(byRate.at(-2)[5]).toBe("0.00");
  });

  test("0% interest: every payment is principal, total interest is 0.00", async ({ page, go }) => {
    await open(page, go);
    await fill(page, 250000, 0, 2);
    const lines = parse((await saved(page, page.getByRole("button", { name: "Download schedule (CSV)", exact: true }))).text);
    expect(lines).toHaveLength(26);
    expect(lines[1]).toEqual(["1", "1", "10416.67", "10416.67", "0.00", "239583.33"]);
    expect(lines[24]).toEqual(["24", "2", "10416.67", "10416.67", "0.00", "0.00"]);
    expect(lines[25]).toEqual(["Total", "", "250000.00", "250000.00", "0.00", ""]);
  });

  test("390 px: the button is there, wraps with the others, and the page does not scroll sideways", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await open(page, go);
    await fill(page, 1000000, 8.5, 20);
    await expect(page.getByRole("button", { name: "Download schedule (CSV)", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("Home Loan Calculator: schedule download", () => {
  const open = async (page, go) => {
    await go("calculators/home-loan/");
    await expect(page.locator("#home-loan-form")).toBeAttached();
  };
  const fill = async (page, { income, existing, share, rate, years }) => {
    await page.locator("#home-loan-income").fill(String(income));
    await page.locator("#home-loan-existing").fill(String(existing));
    await page.locator("#home-loan-share").fill(String(share));
    await page.locator("#home-loan-rate").fill(String(rate));
    await page.locator("#home-loan-years").fill(String(years));
  };

  test("income 100,000, existing EMIs 10,000, 40%, 8.5%, 20 years: the loan that fits (3,456,925) has a 240-payment schedule", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20 });
    await expect(page.locator("#home-loan-results")).toContainText("34,56,925");
    const button = page.getByRole("button", { name: "Download repayment schedule (CSV)", exact: true });
    await expect(button).toBeVisible();
    const file = await saved(page, button);
    expect(file.name).toBe("home-loan-repayment-schedule.csv");
    const lines = parse(file.text);
    expect(lines).toHaveLength(242);
    expect(lines[1]).toEqual(["1", "1", "30000.00", "5513.45", "24486.55", "3451411.55"]);
    expect(lines[120]).toEqual(["120", "10", "30000.00", "12770.47", "17229.53", "2419633.96"]);
    expect(lines[240]).toEqual(["240", "20", "30000.00", "29788.99", "211.01", "0.00"]);
    expect(lines[241]).toEqual(["Total", "", "7199999.59", "3456925.00", "3743074.59", ""]);
    await expect(page.locator("#home-loan-download-note")).toHaveText("Saved home-loan-repayment-schedule.csv: 240 monthly payments.");
  });

  test("another tenure gives another schedule; no EMI room or invalid input gives no button", async ({ page, go }) => {
    await open(page, go);
    await fill(page, { income: 100000, existing: 10000, share: 40, rate: 8.5, years: 10 });
    const button = page.getByRole("button", { name: "Download repayment schedule (CSV)", exact: true });
    expect(parse((await saved(page, button)).text)).toHaveLength(122);

    await fill(page, { income: 100000, existing: 40000, share: 40, rate: 8.5, years: 20 }); // existing EMIs use all the room
    await expect(page.locator("#home-loan-results")).toContainText("₹0"); // a loan of nothing: no schedule to save
    await expect(button).toHaveCount(0);

    await fill(page, { income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20 });
    await expect(button).toBeVisible();
    await page.locator("#home-loan-share").fill("0");
    await expect(button).toHaveCount(0);

    await fill(page, { income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20 });
    await expect(button).toBeVisible();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    const years = Number(await page.locator("#home-loan-years").inputValue());
    const reset = parse((await saved(page, button)).text);
    expect(reset).toHaveLength(years * 12 + 2); // the starting values' own schedule
    expect(reset.at(-2)[5]).toBe("0.00");
  });

  test("390 px: the button is there and the page does not scroll sideways", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await open(page, go);
    await fill(page, { income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20 });
    await expect(page.getByRole("button", { name: "Download repayment schedule (CSV)", exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
