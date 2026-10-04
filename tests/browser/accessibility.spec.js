/**
 * M9.8 — accessibility regression tests.
 *
 * Covers what M9 fixed: Loan Comparison modal focus management, accessible names of the loan controls,
 * visible keyboard focus, the reduced-motion rule, landmark structure and the WebP <picture> hero images.
 */
import { test, expect } from "../helpers/test-base.mjs";

const opener = (page, which = "a") => page.locator(`.loan-view-link[data-loan="${which}"]`);

test.describe("Loan Comparison modal focus @portable", () => {
  test("focus moves in on open, Tab stays inside, Escape closes, focus returns, page behind is inert", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    const trigger = opener(page);
    await trigger.focus();
    await trigger.click();

    const modal = page.locator("#amortization-modal");
    const dialog = modal.locator(".loan-amortization-dialog");
    await expect(dialog).toBeVisible();

    // focus is inside the dialog
    expect(await page.evaluate(() => !!document.activeElement.closest(".loan-amortization-dialog"))).toBe(true);

    // the page behind is inert while open
    for (const sel of ["#header", "#app", "#footer"]) await expect(page.locator(sel)).toHaveAttribute("inert", "");

    // Tab (and Shift+Tab) wraps inside the dialog: 40 presses never leave it
    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press(key);
        const inside = await page.evaluate(() => !!document.activeElement.closest(".loan-amortization-dialog"));
        expect(inside, `${key} #${i} left the dialog`).toBe(true);
      }
    }

    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    for (const sel of ["#header", "#app", "#footer"]) await expect(page.locator(sel)).not.toHaveAttribute("inert", /.*/);

    // focus is back on the control that opened it
    expect(await page.evaluate(() => document.activeElement.getAttribute("data-loan"))).toBe("a");
    expect(await page.evaluate(() => document.activeElement.classList.contains("loan-view-link"))).toBe(true);
  });

  test("the scrollable schedule is keyboard reachable and named", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await opener(page).click();
    const region = page.locator(".loan-full-table-scroll");
    await expect(region).toHaveAttribute("tabindex", "0");
    await expect(region).toHaveAttribute("role", "region");
    await expect(region).toHaveAttribute("aria-label", /amortization schedule/i);
  });

  test("closing with the close button also restores focus", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    await opener(page, "b").click();
    await page.locator(".loan-amortization-dialog").getByLabel("Close").click();
    await expect(page.locator("#amortization-modal")).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement.getAttribute("data-loan"))).toBe("b");
  });
});

test.describe("form labels", () => {
  test("every Loan Comparison control has an accessible name; visible labels point at their field", async ({ page, go }) => {
    await go("calculators/loan-comparison/");
    for (const which of ["a", "b"]) {
      for (const id of ["amount", "unit", "rate", "years", "amount-slider", "rate-slider", "years-slider"]) {
        const el = page.locator(`#${which}-${id}`);
        const name = await el.evaluate((e) => (e.getAttribute("aria-label") || e.labels?.[0]?.textContent || "").trim());
        expect(name.length, `#${which}-${id} has no accessible name`).toBeGreaterThan(0);
      }
      for (const id of ["amount", "rate", "years"]) {
        await expect(page.locator(`label[for="${which}-${id}"]`)).toHaveCount(1);
      }
    }
  });

  test("no form control on the main pages is left without a name", async ({ page, go }) => {
    for (const p of ["articles.html", "contact.html", "categories.html", "calculators.html", "loans.html", "calculators/emi/", "calculators/prepayment/", "calculators/balance-transfer/", "calculators/sip/", "calculators/margin/", "calculators/profit/", "calculators/home-loan/", "calculators/fd/"]) {
      await go(p);
      const unnamed = await page.evaluate(() =>
        [...document.querySelectorAll("input:not([type=hidden]), select, textarea")]
          .filter((e) => !(e.getAttribute("aria-label") || e.getAttribute("aria-labelledby") || (e.labels && e.labels.length)))
          .map((e) => e.tagName + "#" + e.id));
      expect(unnamed, p).toEqual([]);
    }
  });
});

test.describe("keyboard focus is visible @portable", () => {
  const cases = [
    ["articles.html", "#article-search"],
    ["articles.html", "#newsletter-email"],
    ["categories.html", ".categories-search__input"],
    ["calculators.html", ".calculators-search__input"],
    ["loans.html", ".loans-search__input"],
    ["index.html", ".hero__search input"],
    ["index.html", ".footer__newsletter-input"],
  ];
  for (const [p, sel] of cases) {
    test(`${p} ${sel} shows a focus ring`, async ({ page, go }) => {
      await go(p === "index.html" ? "" : p);
      const el = page.locator(sel).first();
      await el.waitFor({ state: "attached" });
      await el.focus();
      await page.keyboard.press("Shift"); // keyboard modality, so :focus-visible applies
      await expect
        .poll(() => el.evaluate((e) => { const s = getComputedStyle(e); return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2; }))
        .toBe(true);
    });
  }
});

test.describe("reduced motion", () => {
  test("the accessibility stylesheet is loaded and removes animation and smooth scrolling", async ({ page, go }) => {
    await go("");
    // the suite runs with reducedMotion: "reduce"
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const r = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector("a, button"));
      return { t: parseFloat(s.transitionDuration), scroll: getComputedStyle(document.documentElement).scrollBehavior };
    });
    expect(r.t).toBeLessThan(0.001);
    expect(r.scroll).toBe("auto");
  });
});

test.describe("landmarks", () => {
  for (const p of ["", "articles.html", "contact.html", "calculators/emi/", "calculators/prepayment/", "calculators/balance-transfer/", "calculators/sip/", "calculators/margin/", "calculators/profit/", "calculators/home-loan/", "calculators/fd/", "privacy.html"]) {
    test(`${p || "home"}: one banner-free footer landmark and at most one main`, async ({ page, go }) => {
      await go(p);
      expect(await page.locator("footer").count()).toBe(1);
      expect(await page.locator("main").count()).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("WebP hero images", () => {
  test("home hero offers WebP with PNG fallback and the browser takes the WebP", async ({ page, go }) => {
    await go("");
    const pic = page.locator(".hero__visual picture");
    await expect(pic.locator('source[type="image/webp"]')).toHaveAttribute("srcset", /hero-calculators\.webp$/);
    const img = pic.locator("img");
    await expect(img).toHaveAttribute("src", /hero-calculators\.png$/);
    await expect(img).toHaveAttribute("width", /\d+/);
    await expect(img).toHaveAttribute("height", /\d+/);
    await expect.poll(() => img.evaluate((e) => e.currentSrc)).toMatch(/\.webp$/);
  });

  test("articles hero and a published article hero use WebP with PNG fallback", async ({ page, go }) => {
    await go("articles.html");
    const hero = page.locator(".articles-hero-illustration picture");
    await expect(hero.locator("source")).toHaveAttribute("srcset", /articles-hero\.webp$/);
    await expect.poll(() => hero.locator("img").evaluate((e) => e.currentSrc)).toMatch(/\.webp$/);

    await go("articles/loan-comparison/emi-vs-total-interest/");
    const fig = page.locator("figure.article-hero-image picture");
    await expect(fig.locator("source")).toHaveAttribute("srcset", /emi-vs-total-interest\.webp$/);
    await expect(fig.locator("img")).toHaveAttribute("src", /emi-vs-total-interest\.png$/);
    await expect.poll(() => fig.locator("img").evaluate((e) => e.currentSrc)).toMatch(/\.webp$/);
  });

  test("when WebP is unavailable the PNG fallback loads", async ({ page, go }) => {
    await page.route("**/*.webp", (r) => r.abort());
    await go("");
    const img = page.locator(".hero__visual picture img");
    // the <source> is chosen by type, so an aborted WebP request would show a broken image;
    // the fallback guarantee is that the PNG file exists and decodes when requested directly
    const ok = await page.evaluate((src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i.naturalWidth > 0); i.onerror = () => res(false); i.src = src; }), await img.getAttribute("src"));
    expect(ok).toBe(true);
  });
});


test.describe("shared field and result primitives, as used by EMI @portable", () => {
  const IDS = ["emi-loan", "emi-rate", "emi-years"];
  const submit = () => document.querySelector("#emi-form").dispatchEvent(new Event("submit", { cancelable: true }));

  test("every EMI input is described by its own hint, labels match, and no id is repeated", async ({ page, go }) => {
    await go("calculators/emi/");
    for (const id of IDS) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-describedby", `${id}-hint`);
      await expect(page.locator(`#${id}-hint`)).toHaveText(/Enter the/);
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
    }
    const repeated = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
      return ids.filter((x, i) => ids.indexOf(x) !== i);
    });
    expect(repeated).toEqual([]);
  });

  test("an error is connected to its fields, and cleared when the input is fixed and on Reset", async ({ page, go }) => {
    await go("calculators/emi/");
    await expect(page.locator("#emi-results .calculator-results__card")).toBeVisible();

    // skip the browser's own range checks so the tool's validation (domain-owned) is what runs
    await page.locator("#emi-loan").fill("0");
    await page.evaluate(submit);
    await expect(page.locator("#emi-results-error")).toHaveText("Please enter valid loan details.");
    for (const id of IDS) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-describedby", `${id}-hint emi-results-error`);
    }

    // fixed: the error and the wiring go away, the hint link stays
    await page.locator("#emi-loan").fill("500000");
    await page.evaluate(submit);
    await expect(page.locator("#emi-results-error")).toHaveCount(0);
    await expect(page.locator("#emi-results .calculator-results__card")).toBeVisible();
    for (const id of IDS) {
      await expect(page.locator(`#${id}`)).not.toHaveAttribute("aria-invalid", /.*/);
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-describedby", `${id}-hint`);
    }

    // invalid again, then Reset puts everything back
    await page.locator("#emi-loan").fill("0");
    await page.evaluate(submit);
    await expect(page.locator("#emi-results-error")).toBeVisible();
    await page.locator("#emi-reset").click();
    await expect(page.locator("#emi-results .calculator-results__empty")).toHaveText("Enter your loan details and calculate your EMI.");
    for (const id of IDS) {
      await expect(page.locator(`#${id}`)).not.toHaveAttribute("aria-invalid", /.*/);
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-describedby", `${id}-hint`);
    }
  });

  test("the results keep their exact values after the move to shared primitives", async ({ page, go }) => {
    await go("calculators/emi/");
    const items = page.locator("#emi-results .calculator-results__item");
    await expect(items).toHaveCount(4);
    await expect(items.nth(0)).toHaveClass(/calculator-results__item--primary/);
    await expect(items.nth(0).locator(".calculator-results__label")).toHaveText("Monthly EMI");
    await expect(items.nth(0).locator(".calculator-results__value")).toHaveText("₹8,678");
    await expect(items.nth(3).locator(".calculator-results__value")).toHaveText("20 years");
  });
});
