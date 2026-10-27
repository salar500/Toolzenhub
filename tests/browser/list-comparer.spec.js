/**
 * Tool Pack 38: List Comparer. The comparison rules are proven in tests/unit/list-comparer.test.mjs;
 * here the page is checked: workflow and states, hostile text, limits, mobile layout, accessibility,
 * and its place in the site.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const boxA = (page) => page.locator("#lc-a");
const boxB = (page) => page.locator("#lc-b");
const panel = (page) => page.locator("#lc-panel");
const status = (page) => page.locator("#lc-status");
const live = (page) => page.locator("#lc-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const items = (page, key) => page.locator(`#lc-list-${key} .lc-item__text`);

async function open(page, go) {
  await go("tools/list-comparer/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function both(page, a, b) {
  await boxA(page).fill(a);
  await boxB(page).fill(b);
}

// a paste is one input event
async function put(page, selector, value) {
  await page.evaluate(([sel, v]) => {
    const el = document.querySelector(sel);
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [selector, value]);
}

test.describe("List Comparer", () => {
  test("loads clean with an empty state and no network request of its own", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("List Comparer");
    await expect(status(page)).toHaveText("Paste two lists to compare them.");
    await expect(btn(page, "Copy result")).toBeDisabled();
    await expect(page.locator("#lc-result")).toBeHidden();
    expectClean(watch);
  });

  test("Load example shows the three groups, the repeat, and the sentence that says what was ignored", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    await expect(status(page)).toHaveText("A has 4 unique items and B has 4 unique items. 2 items are in both, 2 only in A and 2 only in B.");
    await expect(items(page, "onlyA")).toHaveText(["apple", "date"]);
    await expect(items(page, "both")).toHaveText(["banana", "cherry"]);
    await expect(items(page, "onlyB")).toHaveText(["elderberry", "fig"]);
    await expect(items(page, "repA")).toHaveText(["banana"]);
    await expect(page.locator("#lc-group-repB")).toBeHidden();
    await expect(page.locator("#lc-notes")).toContainText("Case is ignored");
    await expect(page.locator("#lc-title-onlyA")).toHaveText("Only in A (2)");
    await expect(live(page)).toContainText("2 items are in both");
  });

  test("small lists compare as you type; options re-run; case matters by default", async ({ page, go }) => {
    await open(page, go);
    await both(page, "banana\nkiwi", "Banana\nkiwi");
    await expect(items(page, "onlyA")).toHaveText(["banana"]);
    await expect(items(page, "both")).toHaveText(["kiwi"]);
    await page.getByLabel("Ignore case").check();
    await expect(items(page, "onlyA")).toHaveText([]);
    await expect(items(page, "both")).toHaveText(["banana", "kiwi"]);
    await page.getByLabel("Ignore case").uncheck();
    await expect(items(page, "onlyA")).toHaveText(["banana"]);
  });

  test("trim and empty-line options are applied and reported", async ({ page, go }) => {
    await open(page, go);
    await both(page, "a \n\n b", "a\nb");
    await expect(page.locator("#lc-notes")).toContainText("1 empty line was skipped in A.");
    await expect(items(page, "both")).toHaveText([]);
    await page.getByLabel("Ignore spaces at the start and end of each line").check();
    await expect(items(page, "both")).toHaveText(["a", "b"]);
    await expect(page.locator("#lc-notes")).toContainText("White space at the start and end of each line is ignored");
    await page.getByLabel("Skip empty lines").uncheck();
    await expect(items(page, "onlyA")).toHaveText([""].map(() => "(empty line)"));
  });

  test("Swap exchanges the lists and the groups; Reset restores the defaults", async ({ page, go }) => {
    await open(page, go);
    await both(page, "x\ny", "y\nz");
    await expect(items(page, "onlyA")).toHaveText(["x"]);
    await btn(page, "Swap").click();
    await expect(boxA(page)).toHaveValue("y\nz");
    await expect(items(page, "onlyA")).toHaveText(["z"]);
    await expect(items(page, "onlyB")).toHaveText(["x"]);
    await page.getByLabel("Ignore case").check();
    await btn(page, "Reset").click();
    await expect(boxA(page)).toHaveValue("");
    await expect(page.getByLabel("Ignore case")).not.toBeChecked();
    await expect(page.getByLabel("Skip empty lines")).toBeChecked();
    await expect(status(page)).toHaveText("Paste two lists to compare them.");
    await expect(page.locator("#lc-result")).toBeHidden();
  });

  test("an empty side is named, not compared", async ({ page, go }) => {
    await open(page, go);
    await boxA(page).fill("only a");
    await expect(status(page)).toHaveText("Paste two lists to compare them.");
    await btn(page, "Compare").click();
    await expect(status(page)).toHaveText("List B is empty. Paste two lists to compare them.");
    await expect(page.locator("#lc-result")).toBeHidden();
  });

  test("hostile text is shown as text and nothing runs", async ({ page, go, watch }) => {
    await open(page, go);
    const evil = `<img src=x onerror="window.__pwned=1">\n<script>window.__pwned=1</script>\n__proto__\n javascript:alert(1)`;
    await both(page, evil, "constructor");
    await expect(items(page, "onlyA").first()).toHaveText(`<img src=x onerror="window.__pwned=1">`);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    await expect(page.locator("#lc-list-onlyA img, #lc-list-onlyA script")).toHaveCount(0);
    expectClean(watch);
  });

  test("a large pair waits for the button; groups show a first chunk with a Show more button, and Copy uses every item", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    const a = Array.from({ length: 25000 }, (_, i) => `item${i}`).join("\n");
    const b = "item0";
    await put(page, "#lc-a", a);
    await put(page, "#lc-b", b);
    await expect(status(page)).toHaveText("Press Compare to compare these lists.");
    await btn(page, "Compare").click();
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    await expect(page.locator("#lc-list-onlyA .lc-item")).toHaveCount(1000);
    const more = page.locator("#lc-more-onlyA");
    await expect(more).toHaveText("Show more (23,999 more items)");
    await more.click();
    await expect(page.locator("#lc-list-onlyA .lc-item")).toHaveCount(2000);
    await page.locator("#lc-copy-onlyA").click();
    const copied = await page.evaluate(() => window.__copied.at(-1));
    expect(copied.split("\n")).toHaveLength(24999);
    await put(page, "#lc-b", "item0\nitem1");
    await expect(status(page)).toHaveText("The lists changed. Press Compare.");
    await expect(page.locator("#lc-result")).toBeHidden();
  });

  test("a list over the limit is refused with its size and limit", async ({ page, go }) => {
    await open(page, go);
    await put(page, "#lc-a", "x\n".repeat(100001));
    await put(page, "#lc-b", "x");
    await btn(page, "Compare").click();
    await expect(panel(page)).toHaveAttribute("data-state", "invalid");
    await expect(status(page)).toHaveText("List A has 100,001 lines; the limit is 100,000.");
    await expect(live(page)).toHaveText("List A has 100,001 lines; the limit is 100,000.");
  });

  test("Copy result puts the whole result on the clipboard", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await both(page, "a\nb", "b\nc");
    await btn(page, "Copy result").click();
    const text = await page.evaluate(() => window.__copied.at(-1));
    expect(text).toBe("A has 2 unique items and B has 2 unique items. 1 item is in both, 1 only in A and 1 only in B.\n\nOnly in A (1)\na\n\nIn both (1)\nb\n\nOnly in B (1)\nc");
    await expect(live(page)).toHaveText("Result copied to the clipboard.");
  });

  test("accessibility: labelled boxes, one polite live region, headings in order, keyboard order, visible focus", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(page.getByLabel("List A", { exact: true })).toBeVisible();
    await expect(page.getByLabel("List B", { exact: true })).toBeVisible();
    await both(page, "a", "b");
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    await boxA(page).focus();
    expect(await outline(boxA(page))).toBeGreaterThanOrEqual(2);
    for (const target of [boxB(page), btn(page, "Load example"), page.locator("#lc-case"), page.locator("#lc-trim"), page.locator("#lc-empty"), btn(page, "Compare"), btn(page, "Swap"), btn(page, "Copy result"), btn(page, "Reset")]) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
      expect(await outline(target)).toBeGreaterThanOrEqual(2);
    }
    await expect(page.locator("main")).not.toContainText(/guaranteed|100% accurate/i);
  });

  for (const width of [320, 390]) {
    test(`${width} px: boxes stack, a long line wraps, nothing widens the page, controls are tappable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await both(page, `${"averyveryverylongunbrokenitem".repeat(12)}\nshort`, "short");
      await expect(panel(page)).toHaveAttribute("data-state", "done");
      await expectNoHorizontalOverflow(page);
      for (const b of [btn(page, "Compare"), btn(page, "Swap"), btn(page, "Reset"), btn(page, "Load example")]) {
        const box = await b.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      const a = await boxA(page).boundingBox();
      const b = await boxB(page).boundingBox();
      expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    });
  }
});

test.describe("List Comparer in the site", () => {
  test("it is a Developer Tool: listed there, found by search aliases, absent from Calculators and Time Tools", async ({ page, go }) => {
    await go("tools.html");
    const section = (name) => page.locator(".directory-section", { has: page.locator(`.directory-section__title a:text-is("${name}")`) });
    await expect(section("Developer Tools").locator('a[href$="tools/list-comparer/"]')).toHaveCount(1);
    for (const other of ["Calculators", "Time Tools"]) {
      await expect(section(other).locator('a[href$="tools/list-comparer/"]')).toHaveCount(0);
    }
    await go("tools/list-comparer/");
    await expect(page).toHaveTitle(/List Comparer/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tools\/list-comparer\/$/);
    await expect(page.locator(".calculator-breadcrumb")).toContainText("List Comparer");
  });

  test("no stored data and no change to the address while using it", async ({ page, go }) => {
    await open(page, go);
    const before = page.url();
    await both(page, "secret-one\nsecret-two", "secret-two");
    await expect(panel(page)).toHaveAttribute("data-state", "done");
    expect(page.url()).toBe(before);
    const stored = await page.evaluate(() => JSON.stringify({ l: Object.entries(localStorage), s: Object.entries(sessionStorage), c: document.cookie }));
    expect(stored).not.toContain("secret");
  });
});
