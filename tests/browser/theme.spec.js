/**
 * Light and dark theme: the header toggle, the choice kept across a reload (the only thing stored),
 * the device setting as the default, and readable text in both themes. See assets/js/ui/theme.js.
 */
import { test, expect } from "../helpers/test-base.mjs";

const toggle = (page) => page.locator("#header [data-action='theme']");
const theme = (page) => page.evaluate(() => document.documentElement.dataset.theme);
const bg = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("Theme toggle", () => {
  test.use({ colorScheme: "light" });

  test("defaults to the device's light setting, with no saved choice", async ({ page, go }) => {
    await go("");
    expect(await theme(page)).toBe("light");
    expect(await page.evaluate(() => localStorage.getItem("tz-theme"))).toBeNull();
    await expect(toggle(page)).toHaveAttribute("aria-label", "Switch to dark theme");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("the toggle switches theme, announces the next action and keeps the choice after a reload", async ({ page, go }) => {
    await go("");
    const light = await bg(page);
    await toggle(page).click();
    expect(await theme(page)).toBe("dark");
    expect(await bg(page)).not.toBe(light);
    await expect(toggle(page)).toHaveAttribute("aria-label", "Switch to light theme");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => localStorage.getItem("tz-theme"))).toBe("dark");
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["tz-theme"]);
    await page.reload();
    expect(await theme(page)).toBe("dark");
    await go("tools/json-formatter/");
    expect(await theme(page)).toBe("dark");
    await toggle(page).click();
    expect(await theme(page)).toBe("light");
  });

  test("it can be reached and used from the keyboard", async ({ page, go }) => {
    await go("");
    await toggle(page).focus();
    await page.keyboard.press("Enter");
    expect(await theme(page)).toBe("dark");
    await page.keyboard.press("Space");
    expect(await theme(page)).toBe("light");
  });

  test("dark theme: page text keeps readable contrast on a calculator, a tool and an article page", async ({ page, go }) => {
    await page.addInitScript(() => localStorage.setItem("tz-theme", "dark"));
    for (const path of ["calculators/emi/", "tools/json-formatter/", "articles.html"]) {
      await go(path);
      await page.waitForTimeout(600);
      const worst = await page.evaluate(() => {
        const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const v = m.slice(0, 3).map((x) => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return { l: .2126 * v[0] + .7152 * v[1] + .0722 * v[2], a: m[3] ?? 1 }; };
        const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const x = lum(getComputedStyle(e).backgroundColor); if (x.a > .5) return x.l; } return 1; };
        let min = 21;
        for (const el of document.querySelectorAll("main *, #app *")) {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || !el.getBoundingClientRect().width || el.disabled) continue;
          if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
          const t = lum(cs.color).l, b = bgOf(el);
          min = Math.min(min, (Math.max(t, b) + .05) / (Math.min(t, b) + .05));
        }
        return min;
      });
      expect(worst, path).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe("Theme from the device setting", () => {
  test.use({ colorScheme: "dark" });

  test("a device in dark mode starts dark, and a saved light choice wins over it", async ({ page, go }) => {
    await go("");
    expect(await theme(page)).toBe("dark");
    await toggle(page).click();
    expect(await theme(page)).toBe("light");
    await page.reload();
    expect(await theme(page)).toBe("light");
  });
});

test.describe("Theme toggle on a phone", () => {
  test("it sits beside the menu button, is a 44 px target and does not widen the page", async ({ page, go }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await go("");
    const box = await toggle(page).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator("#header .menu-toggle")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
