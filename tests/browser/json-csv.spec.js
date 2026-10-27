/**
 * Tool Pack 40: JSON and CSV Converter. The conversion rules are proven in tests/unit/json-csv.test.mjs
 * (with Python's csv module as the independent oracle); here the page is checked: both directions,
 * options, refusals, formula protection, privacy, mobile layout, accessibility and its place in the site.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const panel = (page) => page.locator("#jc-panel");
const input = (page) => page.locator("#jc-input");
const output = (page) => page.locator("#jc-output");
const status = (page) => page.locator("#jc-status");
const live = (page) => page.locator("#jc-live");
const notes = (page) => page.locator("#jc-notes li");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const csvMode = (page) => page.getByLabel(/CSV to JSON/);

async function open(page, go) {
  await go("tools/json-csv-converter/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function put(page, value) {
  await page.evaluate((v) => {
    const el = document.querySelector("#jc-input");
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test.describe("JSON and CSV Converter", () => {
  test("loads clean in JSON to CSV mode with an empty state", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("JSON and CSV Converter");
    await expect(page.getByLabel(/JSON to CSV/)).toBeChecked();
    await expect(status(page)).toHaveText("Paste JSON to convert it.");
    await expect(btn(page, "Copy result")).toBeDisabled();
    await expect(page.locator("#jc-result")).toBeHidden();
    expectClean(watch);
  });

  test("JSON to CSV: the example converts as you type, with quoting, a protected formula and the notes", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    await expect(status(page)).toHaveText("Converted 3 rows with 5 columns.");
    await expect(output(page)).toHaveText(`id,name,city,note,active
1,Asha,Pune,"likes ""tea"", coffee",
2,Ben,Delhi,,true
3,'=SUM(A1:A9),,,`);
    await expect(notes(page)).toHaveText([
      "1 null was written as an empty cell. CSV cannot tell null from an empty string.",
      "1 cell was written with a leading ' so a spreadsheet shows it as text, not a formula (text starting with = + - @ tab or CR)."
    ]);
    await expect(live(page)).toHaveText("Converted 3 rows with 5 columns.");
  });

  test("formula protection can be turned off and the output changes with it", async ({ page, go }) => {
    await open(page, go);
    await put(page, '[{"a":"=1+1"}]');
    await expect(output(page)).toHaveText("a\n'=1+1");
    await page.getByLabel("Protect against spreadsheet formulas").uncheck();
    await expect(output(page)).toHaveText("a\n=1+1");
    await expect(notes(page)).toHaveCount(0);
  });

  test("nested values are refused naming the cell; the option writes JSON text", async ({ page, go }) => {
    await open(page, go);
    await put(page, '[{"a":1},{"a":1,"b":{"c":[1,2]}}]');
    await expect(panel(page)).toHaveAttribute("data-state", "invalid");
    await expect(status(page)).toContainText('row 2, column "b" is an object');
    await expect(page.locator("#jc-result")).toBeHidden();
    await page.getByLabel("Write nested values as JSON text").check();
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    await expect(output(page)).toContainText('"{""c"":[1,2]}"');
  });

  test("delimiter and line-end options apply; Copy keeps CRLF", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await put(page, '[{"a":"x;y","b":"2"}]');
    await page.locator("#jc-delimiter").selectOption("tab");
    await expect(output(page)).toHaveText("a\tb\nx;y\t2");
    await page.locator("#jc-delimiter").selectOption(";");
    await page.locator("#jc-eol").selectOption("crlf");
    await btn(page, "Copy result").click();
    expect(await page.evaluate(() => window.__copied.at(-1))).toBe('a;b\r\n"x;y";2');
    await expect(live(page)).toHaveText("Result copied to the clipboard.");
  });

  test("CSV to JSON: switching direction keeps the text, converts it, and every value is a string", async ({ page, go }) => {
    await open(page, go);
    await csvMode(page).check();
    await expect(page.locator("label[for=jc-input]")).toHaveText("CSV");
    await btn(page, "Load example").click();
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    await expect(output(page)).toHaveText(`[
  {"id": "1", "name": "Asha", "city": "Pune", "note": "likes \\"tea\\", coffee"},
  {"id": "2", "name": "Ben", "city": "Delhi", "note": ""}
]`);
    await expect(notes(page).first()).toHaveText("Every value is a string. Numbers and true/false are not converted unless you choose it.");
    await page.getByLabel("Convert numbers and true/false").check();
    await expect(output(page)).toContainText('"id": 1');
    await page.getByLabel("First row is a header").uncheck();
    await expect(output(page)).toContainText('["id", "name", "city", "note"]');
  });

  test("refusals are specific and nothing is shown as a result", async ({ page, go }) => {
    await open(page, go);
    await put(page, "[1,2]");
    await expect(status(page)).toHaveText("Item 1 is a number, not an object. Every item must be an object.");
    await put(page, '[{"a":1,}]');
    await expect(status(page)).toContainText("This is not valid JSON");
    await csvMode(page).check();
    await put(page, 'a,b\n1,"open');
    await expect(status(page)).toContainText("is never closed");
    await put(page, "a,b\n1,2\n3");
    await expect(status(page)).toContainText("Record 3 has 1 field, but the first record has 2");
    await expect(page.locator("#jc-result")).toBeHidden();
    await expect(live(page)).toContainText("Record 3");
  });

  test("hostile text is shown as text; __proto__ is an ordinary column", async ({ page, go, watch }) => {
    await open(page, go);
    await put(page, '[{"__proto__":"<img src=x onerror=window.__pwned=1>","b":"<script>window.__pwned=1</script>"}]');
    await expect(output(page)).toContainText("<img src=x onerror=window.__pwned=1>");
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    await expect(page.locator("#jc-output img, #jc-output script")).toHaveCount(0);
    expectClean(watch);
  });

  test("a large input waits for Convert; Reset restores defaults", async ({ page, go }) => {
    await open(page, go);
    const big = "[" + Array.from({ length: 3000 }, (_, i) => `{"id":${i},"name":"item ${i}"}`).join(",") + "]";
    await put(page, big);
    await expect(status(page)).toHaveText("Press Convert to convert this input.");
    await btn(page, "Convert").click();
    await expect(status(page)).toHaveText("Converted 3,000 rows with 2 columns.");
    await page.locator("#jc-delimiter").selectOption("|");
    await csvMode(page).check();
    await btn(page, "Reset").click();
    await expect(input(page)).toHaveValue("");
    await expect(page.getByLabel(/JSON to CSV/)).toBeChecked();
    await expect(page.locator("#jc-delimiter")).toHaveValue(",");
    await expect(page.getByLabel("Protect against spreadsheet formulas")).toBeChecked();
    await expect(page.locator("#jc-result")).toBeHidden();
  });

  test("privacy: no request carries the data, nothing is stored, the address does not change", async ({ page, go, watch }) => {
    await open(page, go);
    const before = page.url();
    await put(page, '[{"secret":"hunter2"}]');
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    expect(page.url()).toBe(before);
    const stored = await page.evaluate(() => JSON.stringify({ l: Object.entries(localStorage), s: Object.entries(sessionStorage), c: document.cookie }));
    expect(stored).not.toContain("hunter2");
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("accessibility: labelled controls, one polite live region, headings in order, keyboard order, visible focus", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(page.getByRole("group", { name: "Direction" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Options" })).toBeVisible();
    await expect(page.getByLabel("JSON", { exact: true })).toBeVisible();
    await btn(page, "Load example").click();
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    await page.getByLabel(/JSON to CSV/).focus();
    await page.keyboard.press("ArrowDown");
    await expect(csvMode(page)).toBeChecked();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Tab");
    await expect(input(page)).toBeFocused();
    expect(await outline(input(page))).toBeGreaterThanOrEqual(2);
    for (const target of [btn(page, "Load example"), page.locator("#jc-delimiter"), page.locator("#jc-nested"), page.locator("#jc-guard"), page.locator("#jc-eol"), btn(page, "Convert"), btn(page, "Copy result"), btn(page, "Reset")]) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
      expect(await outline(target)).toBeGreaterThanOrEqual(2);
    }
    await expect(page.locator("main")).not.toContainText(/guaranteed|100% accurate/i);
  });

  for (const width of [320, 390]) {
    test(`${width} px: nothing widens the page, a long cell scrolls inside the result, controls are tappable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await put(page, `[{"long":"${"averyverylongunbrokenvalue".repeat(20)}","b":2}]`);
      await expect(panel(page)).toHaveAttribute("data-state", "done");
      await expectNoHorizontalOverflow(page);
      for (const b of [btn(page, "Convert"), btn(page, "Reset"), btn(page, "Load example")]) {
        expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      expect((await page.locator("#jc-delimiter").boundingBox()).height).toBeGreaterThanOrEqual(44);
    });
  }
});

test.describe("JSON and CSV Converter in the site", () => {
  test("it is a Developer Tool: listed there, absent from Calculators and Time Tools; title and canonical set", async ({ page, go }) => {
    await go("tools.html");
    const section = (name) => page.locator(".directory-section", { has: page.locator(`.directory-section__title a:text-is("${name}")`) });
    await expect(section("Developer Tools").locator('a[href$="tools/json-csv-converter/"]')).toHaveCount(1);
    for (const other of ["Calculators", "Time Tools"]) {
      await expect(section(other).locator('a[href$="tools/json-csv-converter/"]')).toHaveCount(0);
    }
    await go("tools/json-csv-converter/");
    await expect(page).toHaveTitle(/JSON to CSV and CSV to JSON/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tools\/json-csv-converter\/$/);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("JSON and CSV Converter");
  });
});
