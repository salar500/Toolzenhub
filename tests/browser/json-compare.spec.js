/**
 * Tool Pack 35: the JSON Compare page.
 *
 * The unit suite (tests/unit/json-compare.test.mjs) proves the engine against hand-derived vectors and an independent
 * patch applier; these tests prove the page: both inputs, located errors per side, the debounce and the explicit
 * Compare, the table of differences, ignore-order, Swap, Reset, Copy and its fallback, announcements, privacy,
 * hostile text, the phone layouts and the tool's place in Developer Tools and search.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const FIRST = '{"a":1,"b":[1,2,3],"d":"x"}';
const SECOND = '{"b":[1,2,4],"a":1.0,"c":true,"d":1}';

const first = (page) => page.locator("#jc-first");
const second = (page) => page.locator("#jc-second");
const status = (page) => page.locator("#jc-status");
const live = (page) => page.locator("#jc-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/json-compare/");
  await expect(page.locator("#jc-panel")).toHaveAttribute("data-ready", "true");
}

async function fill(page, a, b) {
  await first(page).fill(a);
  await second(page).fill(b);
}

const tableRows = (page) => page.locator("#jc-rows tr").evaluateAll((rows) => rows.map((r) => [...r.children].map((c) => c.textContent.replace(/Show full value|Show less/g, "").trim())));

test.describe("JSON Compare", () => {
  test("page, breadcrumb, labels, the initial state", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("JSON Compare");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "JSON Compare"]);
    await expect(page.getByLabel("First JSON", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Second JSON", { exact: true })).toHaveCount(1);
    await expect(status(page)).toHaveText("Paste both JSON documents, or choose Load example.");
    await expect(page.locator("#jc-result")).toBeHidden();
    await expect(page.getByLabel("Ignore array order", { exact: false })).not.toBeChecked();
    expectClean(watch);
  });

  test("the worked example: summary, rows in order, values, and the patch note", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(first(page)).toHaveValue(FIRST);
    await expect(status(page)).toHaveText("3 differences: 1 added, 0 removed, 1 changed, 1 type changed.");
    expect(await tableRows(page)).toEqual([
      ["Changed", "$['b'][2]", "3", "4"],
      ["Type changed", "$['d']", '"x"', "1"],
      ["Added", "$['c']", "(none)", "true"]
    ]);
    await expect(page.locator("#jc-first-status")).toHaveText("Valid JSON.");
    await expect(page.locator("#jc-patch-note")).toContainText("applied to the first document");
    await expect(page.locator("#jc-table th[scope='col']")).toHaveText(["Difference", "Path", "First", "Second"]);
  });

  test("comparison runs as you type after a short pause, and equal documents say so", async ({ page, go }) => {
    await open(page, go);
    await fill(page, '{"a":1,"b":2}', '{"b":2,"a":1.0}');
    await expect(status(page)).toHaveText("No differences. Compared 3 values on each side.");
    await expect(page.locator("#jc-result-heading")).toHaveText("No differences");
    await expect(btn(page, "Copy differences")).toBeDisabled();
    await expect(btn(page, "Copy JSON Patch")).toBeEnabled();
    await second(page).fill('{"b":3,"a":1}');
    await expect(status(page)).toHaveText("1 difference: 0 added, 0 removed, 1 changed, 0 type changed.");
  });

  test("one empty side is a neutral prompt naming it, not an error", async ({ page, go }) => {
    await open(page, go);
    await first(page).fill("[1]");
    await expect(status(page)).toHaveText("Paste the second JSON to compare.");
    await expect(page.locator("#jc-second-status")).toHaveText("Empty.");
    await expect(second(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#jc-result")).toBeHidden();
  });

  test("invalid input: each side's error is located and linked, nothing is compared, both inputs stay intact", async ({ page, go }) => {
    await open(page, go);
    await fill(page, '{"a":1,}', "[1,2");
    await expect(status(page)).toHaveText("Nothing was compared: fix the problem below.");
    await expect(page.locator("#jc-first-status")).toContainText("First JSON, line 1, column 7: A trailing comma");
    await expect(page.locator("#jc-second-status")).toContainText("Second JSON, line 1, column 5:");
    await expect(page.locator("#jc-first-context")).toBeVisible();
    await expect(first(page)).toHaveAttribute("aria-invalid", "true");
    await expect(first(page)).toHaveAttribute("aria-describedby", "jc-first-status jc-first-context");
    await expect(first(page)).toHaveValue('{"a":1,}');
    await expect(second(page)).toHaveValue("[1,2");
    await expect(page.locator("#jc-result")).toBeHidden();
    await second(page).fill("[1,2]");
    await first(page).fill('{"a":1}');
    await expect(first(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#jc-first-context")).toBeHidden();
  });

  test("strict grammar: a BOM, comments and NaN are errors, never silently repaired", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "﻿{}", "{}");
    await expect(page.locator("#jc-first-status")).toContainText("byte order mark");
    await fill(page, "{/*c*/}", "NaN");
    await expect(page.locator("#jc-first-status")).toContainText("First JSON, line 1");
    await expect(page.locator("#jc-second-status")).toContainText("Second JSON, line 1");
  });

  test("ignore array order: unordered lists, no patch, with the reason", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "[1,2,3]", "[3,1,2,9]");
    await expect(status(page)).toContainText("4 differences");
    await page.getByLabel("Ignore array order").check();
    await expect(status(page)).toHaveText("1 difference: 1 added, 0 removed, 0 changed, 0 type changed. Array order was ignored.");
    expect(await tableRows(page)).toEqual([["Added", "$[3]", "(none)", "9"]]);
    await expect(btn(page, "Copy JSON Patch")).toBeDisabled();
    await expect(page.locator("#jc-patch-note")).toHaveText("A patch cannot express an ignored order.");
  });

  test("notes for duplicate keys, precision and lone surrogates appear above the result", async ({ page, go }) => {
    await open(page, go);
    await fill(page, '{"a":1,"a":2,"n":12345678901234567890,"s":"\\ud800"}', '{"a":2,"n":12345678901234567891,"s":"\\ud800"}');
    await expect(page.locator("#jc-notes li")).toHaveCount(5);
    await expect(page.locator("#jc-notes li").first()).toContainText("First JSON: 1 key appears more than once");
    expect(await tableRows(page)).toEqual([["Changed", "$['n']", "12345678901234567890", "12345678901234567891"]]);
  });

  test("a long value is truncated with a control to show it in full, and the rows cap at 1,000 while copy keeps all", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    const long = "x".repeat(500);
    await fill(page, `{"v":"${long}"}`, '{"v":"y"}');
    const cell = page.locator("#jc-rows tr").first().locator("td").nth(1);
    await expect(cell.locator(".jc-value__text")).toHaveText(`"${"x".repeat(199)}…`);
    const more = cell.getByRole("button", { name: "Show full first value for difference 1" });
    await more.click();
    await expect(cell.locator(".jc-value__text")).toHaveText(`"${long}"`);
    await expect(cell.getByRole("button", { name: "Show less of the first value for difference 1" })).toHaveAttribute("aria-expanded", "true");
    const arr = (n, f) => "[" + Array.from({ length: n }, (_, i) => f(i)).join(",") + "]";
    await first(page).fill(arr(1200, (i) => i));
    await second(page).fill(arr(1200, (i) => i + 1));
    await expect(page.locator("#jc-rows tr")).toHaveCount(1000);
    await expect(page.locator("#jc-more")).toHaveText("Showing the first 1,000 of 1,200 differences. Copying includes all of them.");
    await btn(page, "Copy differences").click();
    const copied = await page.evaluate(() => window.__copied.at(-1));
    expect(copied.split("\n").length).toBe(1 + 1200);
    expect(copied.split("\n")[0]).toBe("1,200 differences: 0 added, 0 removed, 1,200 changed, 0 type changed.".replace("1,200 d", "1200 d").replace("1,200 changed", "1200 changed"));
  });

  test("large pairs wait for the Compare button", async ({ page, go }) => {
    await open(page, go);
    const big = "[" + "1,".repeat(60000) + "1]";
    await first(page).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, big);
    await second(page).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, big.replace("[1,", "[2,"));
    await expect(status(page)).toHaveText("Large input. Press Compare.");
    await expect(page.locator("#jc-result")).toBeHidden();
    await btn(page, "Compare").click();
    await expect(status(page)).toHaveText("1 difference: 0 added, 0 removed, 1 changed, 0 type changed.");
  });

  test("over the size limit is refused with the limit and the side, nothing truncated", async ({ page, go }) => {
    await open(page, go);
    await first(page).evaluate((e) => { e.value = "[" + "1".repeat(1000000) + "]"; e.dispatchEvent(new Event("input", { bubbles: true })); });
    await second(page).evaluate((e) => { e.value = "[1]"; e.dispatchEvent(new Event("input", { bubbles: true })); });
    await btn(page, "Compare").click();
    await expect(page.locator("#jc-first-status")).toHaveText("First JSON is over the limit of 1,000,000 characters, so nothing was compared.");
    await expect(page.locator("#jc-first-count")).toHaveText("1,000,002 characters");
  });

  test("Swap exchanges the documents and recomputes; Reset clears everything and focuses the first box", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "[1]", "[1,2]");
    await expect(status(page)).toContainText("1 difference: 1 added");
    await btn(page, "Swap").click();
    await expect(first(page)).toHaveValue("[1,2]");
    await expect(second(page)).toHaveValue("[1]");
    await expect(status(page)).toContainText("1 difference: 0 added, 1 removed");
    await btn(page, "Reset").click();
    await expect(first(page)).toBeFocused();
    await expect(first(page)).toHaveValue("");
    await expect(second(page)).toHaveValue("");
    await expect(page.locator("#jc-result")).toBeHidden();
    await expect(status(page)).toHaveText("Paste both JSON documents, or choose Load example.");
    await expect(page.getByLabel("Ignore array order")).not.toBeChecked();
  });

  test("Copy works on a stubbed clipboard; a failed copy shows a selectable text area and focuses it", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await btn(page, "Load example").click();
    await btn(page, "Copy differences").click();
    await expect(live(page)).toHaveText("Differences copied to the clipboard.");
    await btn(page, "Copy JSON Patch").click();
    await expect(live(page)).toHaveText("JSON Patch copied to the clipboard.");
    const [diffs, patch] = await page.evaluate(() => window.__copied);
    expect(diffs).toBe("3 differences: 1 added, 0 removed, 1 changed, 1 type changed.\nChanged\t$['b'][2]\t3\t4\nType changed\t$['d']\t\"x\"\t1\nAdded\t$['c']\t-\ttrue");
    expect(patch).toBe('[{"op":"replace","path":"/b/2","value":4},{"op":"replace","path":"/d","value":1},{"op":"add","path":"/c","value":true}]');
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("denied"); } }, configurable: true });
      document.execCommand = () => false;
    });
    await btn(page, "Copy JSON Patch").click();
    await expect(page.locator("#jc-fallback-wrap")).toBeVisible();
    await expect(page.locator("#jc-fallback")).toBeFocused();
    await expect(page.locator("#jc-fallback")).toHaveValue(patch);
  });

  test("privacy: no request carries the documents, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await fill(page, '{"secret":"hunter2horse"}', '{"secret":"correct-battery"}');
    await expect(status(page)).toContainText("1 difference");
    await btn(page, "Swap").click();
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    for (const part of ["hunter2horse", "correct-battery"]) expect(logs.some((l) => l.includes(part)), `console ${part}`).toBe(false);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("hostile text is shown as text, never as markup", async ({ page, go }) => {
    await open(page, go);
    const evil = '<img src=x onerror=window.__pwned=1>';
    await fill(page, `{"${evil}":"<script>window.__pwned=2</script>"}`, `{"${evil}":"<b>x</b>"}`);
    await expect(page.locator("#jc-rows tr")).toHaveCount(1);
    await expect(page.locator("#jc-rows")).toContainText("<script>window.__pwned=2</script>");
    await expect(page.locator("#jc-result img, #jc-result script, #jc-result b")).toHaveCount(0);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    await fill(page, "<b>x</b>", "{}");
    await expect(page.locator("#jc-first-context b")).toHaveCount(0);
  });

  test("keyboard and accessibility: labelled controls, a polite live region, visible focus, heading order", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await first(page).focus();
    await page.keyboard.press("Tab");
    await expect(second(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#jc-panel")).toHaveAttribute("data-ready", "true");
    await page.keyboard.press("Shift");
    for (const name of ["Compare", "Swap", "Load example", "Reset"]) {
      await btn(page, name).focus();
      const o = await btn(page, name).evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect((o.style !== "none" && o.width > 0) || o.shadow !== "none", `${name} focus ring`).toBe(true);
    }
    await btn(page, "Load example").click();
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
  });

  test("the static explanation links the JSON Formatter and Text Diff, and a refresh clears the boxes", async ({ page, go, siteRoot }) => {
    await open(page, go);
    await expect(page.locator(`main .calculator-info a[href='${siteRoot}tools/json-formatter/']`)).toHaveCount(1);
    await expect(page.locator(`main .calculator-info a[href='${siteRoot}tools/text-diff/']`)).toHaveCount(1);
    await expect(page.locator("main")).toContainText("How Two Documents Are Compared");
    await btn(page, "Load example").click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#jc-panel")).toHaveAttribute("data-ready", "true");
    await expect(first(page)).toHaveValue("");
    await expect(page.locator("#jc-result")).toBeHidden();
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`JSON Compare at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`long paths, long values, an error and the table fit: no page-level overflow, 44px targets, 16px text at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      const key = "k".repeat(120);
      await fill(page, `{"${key}":{"${key}":"${"v".repeat(400)}"},"b":[1,2,3]}`, `{"${key}":{"${key}":"w"},"b":[1,2,4],"c":${"1".repeat(80)}}`);
      await expect(page.locator("#jc-result")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.locator("#jc-rows .jc-more-button").first().click();
      await expectNoHorizontalOverflow(page);
      await fill(page, '{"a":1,}', "[1");
      await expect(page.locator("#jc-first-context")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await btn(page, "Load example").click();
      for (const name of ["Compare", "Swap", "Load example", "Reset", "Copy differences", "Copy JSON Patch"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      expect(parseFloat(await first(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      const a = await first(page).boundingBox();
      const b = await second(page).boundingBox();
      expect(b.y, "inputs stack").toBeGreaterThan(a.y + a.height - 1);
    });
  });
}

test.describe("JSON Compare in Developer Tools and search", () => {
  test("it is listed with the other tools and found by its own names; the older tools do not mention it", async ({ page, go, siteRoot }) => {
    await go("developer-tools.html");
    const hrefs = await page.locator("a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toContain(`${siteRoot}tools/json-compare/`);
    await go("tools.html");
    await expect(page.locator(`.directory-section a[href$="tools/json-compare/"]`)).toHaveCount(1);
    await go("calculators.html");
    await expect(page.locator(`a[href*="json-compare"]`)).toHaveCount(0);
    for (const q of ["json compare", "compare json", "json diff"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/json-compare/']`).first(), q).toBeVisible();
    }
  });
});
