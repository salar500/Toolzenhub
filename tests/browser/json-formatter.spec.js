/**
 * Tool Pack 15: JSON Formatter & Validator and the Developer Tools section.
 *
 * Focused on what this change can break: the tool's own workflow, the new section's page, All Tools, Home's section
 * cards, global search and its isolation from Calculators and Time Tools. The engine's rules are covered by
 * tests/unit/json-formatter.test.mjs; here the page is checked.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#jf-input");
const output = (page) => page.locator("#jf-output");
const status = (page) => page.locator("#jf-status-text");
const errorBox = (page) => page.locator("#jf-error");
const live = (page) => page.locator("#jf-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/json-formatter/");
  await expect(page.locator("#jf-panel")).toHaveAttribute("data-ready", "true"); // the script has run
}

const GOLDEN_IN = '{"a":1,"b":[true,null]}';
const GOLDEN_FORMATTED = '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}';

test.describe("JSON Formatter & Validator", () => {
  test("page, breadcrumb, labels and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("JSON Formatter & Validator");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "JSON Formatter & Validator"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}developer-tools.html`]);
    await expect(page.getByLabel("JSON input")).toHaveCount(1);
    await expect(page.getByLabel("Output")).toHaveCount(1);
    await expect(output(page)).toHaveAttribute("readonly", "");
    await expect(input(page)).toHaveValue("");
    await expect(btn(page, "Copy output")).toBeDisabled();
    await expect(btn(page, "Load an example")).toBeVisible();
    await expect(status(page)).toHaveText("Paste JSON, or load an example.");
    await expect(errorBox(page)).toBeHidden();
    await expect(page.locator(".related-section")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("Your JSON is processed in your browser");
    await expect(page.locator("main")).not.toContainText(/\bbest\b|ultimate|most accurate|AI-powered|smart/i);
    expectClean(watch);
  });

  test("valid JSON: Validate, Format, Minify, Copy, Clear", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill(GOLDEN_IN);
    await expect(page.locator("#jf-count")).toHaveText("23 characters");

    await btn(page, "Validate").click();
    await expect(status(page)).toHaveText("Valid JSON · Object with 2 keys, 2 levels deep · 23 characters");
    await expect(output(page)).toHaveValue(""); // Validate only checks
    await expect(live(page)).toHaveText("Valid JSON · Object with 2 keys, 2 levels deep · 23 characters");

    await btn(page, "Format").click();
    await expect(output(page)).toHaveValue(GOLDEN_FORMATTED);
    await expect(input(page)).toHaveValue(GOLDEN_IN); // the input is never rewritten
    await expect(page.locator("#jf-output-meta")).toContainText("Formatted, 2 spaces");
    await expect(live(page)).toHaveText("Valid JSON. Formatted.");

    await btn(page, "Minify").click();
    await expect(output(page)).toHaveValue(GOLDEN_IN);
    await expect(page.locator("#jf-output-meta")).toContainText("Minified");
    await expect(live(page)).toHaveText("Valid JSON. Minified.");

    await btn(page, "Format").click();
    await expect(btn(page, "Copy output")).toBeEnabled();
    await btn(page, "Copy output").click();
    await expect(page.locator("#jf-output-meta")).toHaveText("Copied to the clipboard.");
    await expect(live(page)).toHaveText("Copied to the clipboard.");
    // the test origin is plain http (no Clipboard API), so this also exercises the fallback copy; paste what was copied to prove it
    await input(page).fill("");
    await input(page).press("Control+V");
    await expect(input(page)).toHaveValue(GOLDEN_FORMATTED);

    await btn(page, "Clear").click();
    await expect(input(page)).toHaveValue("");
    await expect(output(page)).toHaveValue("");
    await expect(btn(page, "Copy output")).toBeDisabled();
    await expect(errorBox(page)).toBeHidden();
    await expect(status(page)).toHaveText("Paste JSON, or load an example.");
    await expect(input(page)).toBeFocused();
    await expect(live(page)).toHaveText("Cleared.");
  });

  test("copy that cannot happen says so instead of claiming success", async ({ page, go }) => {
    await open(page, go);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) }, configurable: true });
      document.execCommand = () => false;
    });
    await input(page).fill(GOLDEN_IN);
    await btn(page, "Format").click();
    await btn(page, "Copy output").click();
    await expect(page.locator("#jf-output-meta")).toContainText("Could not copy automatically");
    await expect(page.locator("#jf-output-meta")).not.toContainText("Copied");
  });

  test("invalid JSON: where it breaks, the input is kept and stays editable, fixing it validates", async ({ page, go }) => {
    await open(page, go);
    const broken = '{\n  "a": 1,\n  "b": 2,\n}';
    await input(page).fill(broken);
    await btn(page, "Validate").click();

    await expect(errorBox(page)).toBeVisible();
    await expect(errorBox(page)).toContainText("Not valid JSON");
    await expect(page.locator("#jf-error-message")).toContainText("trailing comma");
    await expect(page.locator("#jf-error-where")).toHaveText("Line 3, column 9 (character 21)");
    await expect(page.locator("#jf-error-context")).toHaveText(['2 |   "a": 1,', '3 |   "b": 2,', '  |         ^', '4 | }'].join("\n"));
    await expect(status(page)).toHaveText("Not valid JSON. Line 3, column 9.");
    await expect(page.locator("#jf-live")).toContainText("Line 3, column 9");
    await expect(input(page)).toHaveValue(broken); // never replaced
    await expect(input(page)).toHaveAttribute("aria-invalid", "true");
    await expect(output(page)).toHaveValue("");
    await expect(btn(page, "Copy output")).toBeDisabled();

    // Format on invalid input produces no output either
    await btn(page, "Format").click();
    await expect(output(page)).toHaveValue("");
    await expect(errorBox(page)).toBeVisible();

    // Go to error selects the character
    await btn(page, "Go to error").click();
    await expect(input(page)).toBeFocused();
    const sel = await input(page).evaluate((el) => [el.selectionStart, el.selectionEnd, el.value.slice(el.selectionStart, el.selectionEnd)]);
    expect(sel).toEqual([20, 21, ","]);

    // fix it: the typing marks the panel as out of date, and the pause then clears it (valid again)
    await page.keyboard.press("Delete");
    await expect(errorBox(page)).toHaveAttribute("data-stale", "true");
    await expect(status(page)).toContainText("Valid JSON", { timeout: 4000 });
    await expect(errorBox(page)).toBeHidden();
    await expect(input(page)).not.toHaveAttribute("aria-invalid", "true");
    await btn(page, "Validate").click();
    await expect(status(page)).toContainText("Valid JSON · Object with 2 keys");
  });

  test("strict JSON: what JavaScript allows is rejected; every root type is accepted", async ({ page, go }) => {
    await open(page, go);
    const invalid = ["{'a':1}", '{"a":1,}', "[1,2,]", "{a:1}", '{"a":undefined}', "[NaN]", '// c\n{}', '{"a":1} {"b":2}', '{"a":"x\ny"}', "[01]", '{"a":1', "[1 2]"];
    for (const text of invalid) {
      await input(page).fill(text);
      await btn(page, "Validate").click();
      await expect(errorBox(page), JSON.stringify(text)).toBeVisible();
      await expect(status(page), JSON.stringify(text)).toContainText("Not valid JSON");
    }
    const valid = [["42", "A number"], ['"text"', "A string"], ["true", "A boolean"], ["null", "null"], ["[]", "Array with 0 items"], ["{}", "Object with 0 keys"], ["-0.5e+3", "A number"]];
    for (const [text, summary] of valid) {
      await input(page).fill(text);
      await btn(page, "Validate").click();
      await expect(status(page), text).toContainText(`Valid JSON · ${summary}`);
      await expect(errorBox(page)).toBeHidden();
    }
  });

  test("numbers and strings are kept exactly; duplicate keys and big integers are notes, not errors", async ({ page, go }) => {
    await open(page, go);
    const text = '{"id":12345678901234567890,"price":1.0,"a":1,"a":2,"s":"\\u00e9"}';
    await input(page).fill(text);
    await btn(page, "Format").click();
    await expect(status(page)).toContainText("Valid JSON");
    const out = await output(page).inputValue();
    for (const token of ["12345678901234567890", "1.0", '"\\u00e9"']) expect(out).toContain(token);
    await expect(page.locator("#jf-notes")).toBeVisible();
    await expect(page.locator("#jf-notes li")).toHaveCount(2);
    await expect(page.locator("#jf-notes")).toContainText("appears more than once");
    await expect(page.locator("#jf-notes")).toContainText("beyond 15 digits");
    await btn(page, "Minify").click();
    await expect(output(page)).toHaveValue(text);
  });

  test("security: HTML and script text in JSON stays inert text, in the output and in the error", async ({ page, go }) => {
    const dialogs = [];
    page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss(); });
    await open(page, go);
    const payload = '{"a":"<script>window.__pwned=1</script>","b":"<img src=x onerror=window.__pwned=1>","c":"\\"quoted\\" and back\\\\slash","d":"<b>bold</b>","e":"ünï 😀"}';
    await input(page).fill(payload);
    await btn(page, "Format").click();
    const out = await output(page).inputValue();
    expect(out).toContain("<script>window.__pwned=1</script>");
    expect(out).toContain('<img src=x onerror=window.__pwned=1>');
    expect(out).toContain('"\\"quoted\\" and back\\\\slash"');
    expect(out).toContain("ünï 😀");
    // the same text, made invalid: the error and its context are text as well
    await input(page).fill(payload.replace("}", ",}"));
    await btn(page, "Validate").click();
    await expect(page.locator("#jf-error-context")).toContainText("<b>bold</b>"); // the line is clipped around the error, so the start is not shown
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(dialogs).toEqual([]);
    await expect(page.locator("#jf-panel img, #jf-panel script, #jf-panel b")).toHaveCount(0);
    await expect(page.locator("#jf-error img, #jf-error script, #jf-notes img")).toHaveCount(0);
  });

  test("live check: only the status line, after a pause; no panel, no announcement, input untouched", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill('{"a": [1, 2');
    await expect(status(page)).toContainText("Not valid JSON · line 1, column 12", { timeout: 4000 });
    await expect(errorBox(page)).toBeHidden();
    await expect(live(page)).toHaveText("");
    await expect(input(page)).toHaveValue('{"a": [1, 2');
    await input(page).fill('{"a": [1, 2]}');
    await expect(status(page)).toContainText("Valid JSON · Object with 1 key, 2 levels deep", { timeout: 4000 });
    await expect(live(page)).toHaveText("");
  });

  test("keyboard: Ctrl+Enter formats, a plain Enter only types a line break", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill(GOLDEN_IN);
    await input(page).press("Enter");
    await expect(output(page)).toHaveValue("");
    await expect(input(page)).toHaveValue(`${GOLDEN_IN}\n`);
    await input(page).press("Control+Enter");
    await expect(output(page)).toHaveValue(GOLDEN_FORMATTED);
    await expect(input(page)).toBeFocused();
  });

  test("example: offered on an empty box only, valid, easy to clear", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load an example").click();
    const text = await input(page).inputValue();
    expect(() => JSON.parse(text)).not.toThrow();
    await expect(status(page)).toContainText("Valid JSON · Object with 8 keys");
    await expect(btn(page, "Load an example")).toBeHidden();
    await expect(btn(page, "Format")).toBeFocused();
    await expect(live(page)).toHaveText("Example loaded.");
    await btn(page, "Format").click();
    await expect((await output(page).inputValue()).split("\n").length).toBeGreaterThan(20);
    await btn(page, "Clear").click();
    await expect(btn(page, "Load an example")).toBeVisible();
  });

  test("empty input: an action explains itself instead of failing silently", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Format").click();
    await expect(status(page)).toHaveText("There is nothing to check yet. Paste or type some JSON first.");
    await expect(live(page)).toHaveText("There is nothing to check yet. Paste or type some JSON first.");
    await expect(errorBox(page)).toBeHidden();
  });

  test("a large payload: formatted without freezing; over the live limit it is checked on a button; over the size limit it is refused", async ({ page, go }) => {
    await open(page, go);
    const big = JSON.stringify({ rows: Array.from({ length: 5000 }, (_, i) => ({ id: i, name: `item ${i}`, tags: ["a", "b"], ok: i % 2 === 0 })) });
    expect(big.length).toBeGreaterThan(250_000);
    await input(page).fill(big);
    await expect(status(page)).toContainText("Large input", { timeout: 4000 }); // not parsed while typing
    await expect(status(page)).toContainText("press Validate, Format or Minify");
    const started = Date.now();
    await btn(page, "Format").click();
    await expect(status(page)).toContainText("Valid JSON · Object with 1 key");
    expect(Date.now() - started).toBeLessThan(4000);
    expect((await output(page).inputValue()).split("\n").length).toBeGreaterThan(40_000);
    await expect(btn(page, "Copy output")).toBeEnabled();
    // typing in the page still responds
    await btn(page, "Clear").click();
    await expect(input(page)).toHaveValue("");

    await input(page).fill("[" + "1,".repeat(1_000_001) + "1]");
    await btn(page, "Validate").click();
    await expect(status(page)).toContainText("Too large: this tool works on up to 2.0 million characters");
    await expect(output(page)).toHaveValue("");
  });

  test("no network request carries the input", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    await open(page, go);
    await input(page).fill('{"secret":"do-not-send"}');
    await btn(page, "Format").click();
    await btn(page, "Minify").click();
    await btn(page, "Validate").click();
    await btn(page, "Copy output").click();
    await btn(page, "Clear").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  });

  test("accessibility semantics: named boxes, polite announcements only, a status that is not live, visible focus", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#jf-live")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#jf-live")).toHaveAttribute("role", "status");
    await expect(page.locator("#jf-status")).not.toHaveAttribute("aria-live", /.+/);
    await expect(page.locator("#jf-status")).not.toHaveAttribute("role", /.+/);
    await expect(page.locator("#jf-error-context")).toHaveAttribute("aria-label", /error/i);
    const names = await page.locator(".jf-actions button").allInnerTexts();
    expect(names.map((n) => n.trim())).toEqual(["Format", "Minify", "Validate", "Copy output", "Clear"]);
    await input(page).fill("[1,]");
    await btn(page, "Validate").click();
    await expect(input(page)).toHaveAttribute("aria-describedby", /jf-error-message/);
    // keyboard focus is visible on the text box and on the buttons (the example button is hidden while the box has text, so Format follows the box)
    const outlineOf = (loc) => loc.evaluate((el) => { const s = getComputedStyle(el); return [s.outlineStyle, parseFloat(s.outlineWidth)]; });
    await input(page).focus();
    await page.keyboard.press("Tab");
    await expect(btn(page, "Format")).toBeFocused();
    expect((await outlineOf(btn(page, "Format")))[1]).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Shift+Tab");
    await expect(input(page)).toBeFocused();
    expect((await outlineOf(input(page)))[1]).toBeGreaterThanOrEqual(2);
    // each state is a word, not only a colour
    await expect(status(page)).toContainText("Not valid JSON");
    await input(page).fill("[1]");
    await btn(page, "Validate").click();
    await expect(status(page)).toContainText("Valid JSON");
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: no page overflow, long lines stay inside the boxes, controls are tappable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      const longLine = JSON.stringify({ values: Array.from({ length: 800 }, (_, i) => i), text: "x".repeat(600) });
      await input(page).fill(longLine);
      await btn(page, "Format").click();
      await expect(status(page)).toContainText("Valid JSON");
      await expectNoHorizontalOverflow(page);
      for (const name of ["Format", "Minify", "Validate", "Copy output", "Clear"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x, name).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const loc of [input(page), output(page)]) {
        const box = await loc.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      expect(await input(page).evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true); // it scrolls inside the box
      await input(page).fill(`{"message": "${"long ".repeat(60)}",\n  "next": ${"9".repeat(80)},}`);
      await btn(page, "Validate").click();
      await expect(errorBox(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const err = await errorBox(page).boundingBox();
      expect(err.x + err.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.querySelector("#jf-error-message").scrollWidth <= document.querySelector("#jf-error-message").clientWidth + 1)).toBe(true);
    });
  }
});

test.describe("Developer Tools in the site", () => {
  test("the section page lists the real tools, with no future placeholders", async ({ page, go, watch, siteRoot }) => {
    await go("developer-tools.html");
    await expect(page.locator("h1")).toHaveText("Developer Tools");
    await expect(page.locator(`a[href$="tools/json-formatter/"]`)).toHaveCount(1);
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(3);
    await expect(page.locator("main")).not.toContainText(/coming soon|base64|uuid|regex/i);
    const crumbs = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(crumbs).toEqual(["Home", "All Tools", "Developer Tools"]);
    expect(await page.title()).toBe("Developer Tools | ToolZen Hub");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe("https://toolzenhub.in/developer-tools.html");
    expectClean(watch);
    void siteRoot;
  });

  test("All Tools shows three sections; Developer Tools holds the JSON tool and the timestamp converter; Time Tools is unchanged", async ({ page, go }) => {
    await go("tools.html");
    await expect(page.locator(".directory-section__title a")).toHaveText(["Calculators", "Time Tools", "Developer Tools", "Image Tools"]);
    const dev = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Developer Tools")') });
    await expect(dev.locator(".directory-section__count")).toHaveText("3 tools");
    await expect(dev.locator('a[href$="tools/json-formatter/"]')).toHaveCount(1);
    const time = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Time Tools")') });
    await expect(time.locator(".directory-section__count")).toHaveText("5 tools");
    await expect(time.locator('a[href$="tools/json-formatter/"]')).toHaveCount(0);
    await go("time-tools.html");
    await expect(page.locator("main")).not.toContainText(/json/i);
    await expect(page.locator("main a[href*='tools/']")).toHaveCount(5);
  });

  test("Home to the tool by clicking: Home, All Tools, Developer Tools, JSON Formatter & Validator", async ({ page, go, siteRoot }) => {
    await go("");
    await expect(page.locator("#categories .category-card").nth(2)).toContainText("Developer Tools");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Developer Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}developer-tools.html`);
    await page.locator('a[href$="tools/json-formatter/"]').first().click();
    await expect(page.locator("h1")).toHaveText("JSON Formatter & Validator");
  });

  test("global search: JSON queries lead with the tool, and the other tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["json", "json formatter", "json validator", "format json", "pretty json", "beautify json", "minify json", "validate json", "json viewer", "JSON"]) await expect(await first(q), q).toContainText("JSON Formatter & Validator");
    await expect(await first("json"), "meta").toContainText("Developer Tools");
    await expect(await first("stopwatch")).toContainText("Stopwatch");
    await expect(await first("countdown timer")).toContainText("Countdown Timer");
    await expect(await first("date calculator")).toContainText("Date Calculator");
    await expect(await first("date difference")).toContainText("Date Difference Calculator");
    await expect(await first("emi")).toContainText("EMI Calculator");
  });

  test("calculator searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("json");
    await expect(page.locator("main")).not.toContainText("JSON");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("json formatter");
    await expect(page.locator("#calculators-grid")).not.toContainText("JSON");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("json");
    await expect(page.locator("main")).not.toContainText("JSON");
  });
});
