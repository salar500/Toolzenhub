/**
 * Tool Pack 18: Text Diff / Compare.
 *
 * Focused on what this change can break: the tool's own workflow and states, hostile text, size limits, the
 * mobile layout, accessibility of the new surface, and its place in the site (Developer Tools, All Tools, search,
 * and its absence from the calculator and time pages). The diff rules are covered by tests/unit/text-diff.test.mjs;
 * here the page is checked.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const original = (page) => page.locator("#td-original");
const changed = (page) => page.locator("#td-changed");
const panel = (page) => page.locator("#td-panel");
const status = (page) => page.locator("#td-status");
const live = (page) => page.locator("#td-live");
const chips = (page) => page.locator("#td-summary .td-chip");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/text-diff/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true"); // the script has run
}

const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);

async function both(page, a, b) {
  await original(page).fill(a);
  await changed(page).fill(b);
}

const lines = (n, fn = (i) => `line ${i}`) => Array.from({ length: n }, (_, i) => fn(i + 1)).join("\n");

// a paste is one input event; Playwright's fill() of thousands of lines takes many seconds in this environment
async function put(page, selector, value) {
  await page.evaluate(([sel, v]) => {
    const el = document.querySelector(sel);
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [selector, value]);
}
const putBoth = async (page, a, b) => { await put(page, "#td-original", a); await put(page, "#td-changed", b); };

test.describe("Text Diff / Compare", () => {
  test("page, breadcrumb, labels and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Text Diff / Compare");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "Text Diff / Compare"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}developer-tools.html`]);
    await expect(page.getByLabel("Original", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Changed", { exact: true })).toHaveCount(1);
    await expect(original(page)).toHaveValue("");
    await expect(status(page)).toHaveText("Paste text into both boxes to compare, or try an example.");
    await expect(page.locator("#td-scroll")).toBeHidden();
    await expect(btn(page, "Copy diff")).toBeDisabled();
    await expect(btn(page, "Try an example")).toBeVisible();
    await expect(page.locator(".td-limit")).toContainText("Up to 300,000 characters and 20,000 lines per side.");
    await expect(page.locator("#td-ignore")).not.toBeChecked();
    await expect(page.locator("#td-wrap")).toBeChecked();
    await expect(page.locator(".related-section")).toHaveCount(0);
    await expect(page.locator(".report-issue")).toHaveCount(0);
    await expect(page.locator("main")).toContainText("Your text is compared in your browser");
    await expect(page.locator("main")).not.toContainText(/\bbest\b|ultimate|most accurate|AI-powered|intelligent|smart/i);
    expectClean(watch);
  });

  test("prose: compares by itself, and what was added, removed and changed is told in words", async ({ page, go }) => {
    await open(page, go);
    await both(page, "The quick brown fox\njumps over\nthe lazy dog\nend", "The quick red fox\njumps over\nthe lazy dog\nnew last line\nend");
    await state(page, "result");
    await expect(chips(page)).toHaveText(["+1 added", "~1 changed", "3 unchanged"]);
    await expect(status(page)).toHaveText("1 added, 1 changed, 3 unchanged");
    const rows = page.locator("#td-lines .td-row");
    await expect(rows).toHaveCount(5);
    // the changed line is the old line over the new one, with the words marked and spoken
    const mod = rows.nth(0);
    await expect(mod.locator(".td-line")).toHaveCount(2);
    await expect(mod.locator("del.td-w")).toHaveText("brown");
    await expect(mod.locator("ins.td-w")).toHaveText("red");
    await expect(mod.locator(".td-sr").nth(0)).toHaveText("Changed, old line 1: ");
    await expect(mod.locator(".td-sr").nth(1)).toHaveText("Changed, new line 1: ");
    await expect(mod.locator(".td-mark").nth(0)).toHaveText("−");
    await expect(mod.locator(".td-mark").nth(1)).toHaveText("+");
    // an added line has a symbol AND a spoken label
    const added = page.locator(".td-row--add");
    await expect(added).toHaveCount(1);
    await expect(added.locator(".td-sr")).toHaveText("Added, line 4: ");
    await expect(added.locator(".td-mark")).toHaveText("+");
    await expect(added).toContainText("new last line");
    // meaning does not depend on colour: the words are crossed out and underlined
    expect(await mod.locator("del.td-w").evaluate((e) => getComputedStyle(e).textDecorationLine)).toBe("line-through");
    expect(await mod.locator("ins.td-w").evaluate((e) => getComputedStyle(e).textDecorationLine)).toBe("underline");
    // a settled result is announced once, politely
    await expect(live(page)).toHaveText("1 added, 1 changed, 3 unchanged");
  });

  test("removed lines are marked, numbered by their own side, and the summary matches the rows", async ({ page, go }) => {
    await open(page, go);
    await both(page, "a\nb\nc\nd", "a\nd");
    await state(page, "result");
    await expect(page.locator(".td-row--del")).toHaveCount(2);
    await expect(page.locator(".td-row--del .td-sr")).toHaveText(["Removed, line 2: ", "Removed, line 3: "]);
    await expect(page.locator(".td-row--del .td-mark")).toHaveText(["−", "−"]);
    await expect(chips(page)).toHaveCount(2); // removed and unchanged only: no empty chips
    await expect(status(page)).toHaveText("2 removed, 2 unchanged");
    expect(await page.locator(".td-row").count()).toBe(4);
  });

  test("code and config: indentation counts by default; 'ignore whitespace-only changes' hides only that", async ({ page, go }) => {
    await open(page, go);
    const a = "server:\n  port: 8080\n  host: localhost\n";
    const b = "server:\n    port: 8080\n  host:  localhost\n";
    await both(page, a, b);
    await state(page, "result");
    await expect(page.locator(".td-row--mod, .td-row--add, .td-row--del")).not.toHaveCount(0);
    await page.locator("#td-ignore").check();
    await state(page, "identical");
    await expect(status(page)).toHaveText("No differences found.");
    await expect(page.locator("#td-note")).toHaveText("Whitespace-only differences are ignored.");
    await expect(page.locator("#td-scroll")).toBeHidden();
    // it never joins words
    await both(page, "hello world", "helloworld");
    await state(page, "result");
    await expect(page.locator(".td-row--del")).toHaveCount(1); // no shared word, so Removed and Added, never "Changed"
    await expect(page.locator(".td-row--add")).toHaveCount(1);
    await expect(page.locator(".td-row--mod")).toHaveCount(0);
    await page.locator("#td-ignore").uncheck();
    await state(page, "result");
  });

  test("identical text, and the same text with Windows line endings, report no differences", async ({ page, go }) => {
    await open(page, go);
    await both(page, "one\ntwo\nthree\n", "one\ntwo\nthree\n");
    await state(page, "identical");
    await expect(status(page)).toHaveText("No differences found.");
    await expect(page.locator("#td-lines .td-row")).toHaveCount(0);
    await expect(btn(page, "Copy diff")).toBeDisabled();
    await changed(page).fill("one\r\ntwo\r\nthree");
    await state(page, "identical");
    await expect(live(page)).toHaveText("No differences found.");
  });

  test("an empty side is a valid comparison: all added, or all removed (explicit Compare)", async ({ page, go }) => {
    await open(page, go);
    await changed(page).fill("x\ny\nz");
    await state(page, "waiting");
    await expect(status(page)).toContainText("Add the Original text");
    await btn(page, "Compare").click();
    await state(page, "result");
    await expect(page.locator(".td-row--add")).toHaveCount(3);
    await expect(page.locator("#td-note")).toHaveText("Original is empty, so every line of Changed is shown as added.");
    await original(page).fill("x\ny\nz");
    await changed(page).fill("");
    await btn(page, "Compare").click();
    await state(page, "result");
    await expect(page.locator(".td-row--del")).toHaveCount(3);
    await expect(page.locator("#td-note")).toHaveText("Changed is empty, so every line of Original is shown as removed.");
  });

  test("swap exchanges the boxes and reverses what was added and removed", async ({ page, go }) => {
    await open(page, go);
    await both(page, "keep\nonly in original", "keep\nonly in changed words here");
    await state(page, "result");
    await expect(page.locator(".td-row--del, .td-row--mod")).not.toHaveCount(0);
    await btn(page, "Swap").click();
    await expect(original(page)).toHaveValue("keep\nonly in changed words here");
    await expect(changed(page)).toHaveValue("keep\nonly in original");
    await state(page, "result");
    const mod = page.locator(".td-row--mod");
    await expect(mod.locator("del.td-w").first()).toBeVisible();
    await expect(mod).toContainText("only in changed words here");
    // a pure addition becomes a pure removal
    await both(page, "a\nb", "a\nb\nc");
    await expect(page.locator(".td-row--add")).toHaveCount(1);
    await btn(page, "Swap").click();
    await expect(page.locator(".td-row--del")).toHaveCount(1);
    await expect(page.locator(".td-row--add")).toHaveCount(0);
  });

  test("reset clears both boxes, the result and the options, and returns focus to Original", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#td-ignore").check();
    await page.locator("#td-wrap").uncheck();
    await both(page, "a\nb", "a\nc");
    await state(page, "result");
    await btn(page, "Reset").click();
    await expect(original(page)).toHaveValue("");
    await expect(changed(page)).toHaveValue("");
    await expect(original(page)).toBeFocused();
    await state(page, "empty");
    await expect(status(page)).toHaveText("Paste text into both boxes to compare, or try an example.");
    await expect(page.locator("#td-scroll")).toBeHidden();
    await expect(page.locator("#td-summary")).toBeHidden();
    await expect(page.locator("#td-ignore")).not.toBeChecked();
    await expect(page.locator("#td-wrap")).toBeChecked();
    await expect(btn(page, "Copy diff")).toBeDisabled();
    await expect(page.locator("#td-original-meta")).toHaveText("0 lines · 0 characters");
    await expect(btn(page, "Try an example")).toBeVisible();
  });

  test("example: offered while both boxes are empty, small, and it shows added, removed and changed", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Try an example").click();
    await state(page, "result");
    expect((await original(page).inputValue()).length).toBeLessThan(400);
    await expect(page.locator(".td-row--add").first()).toBeVisible();
    await expect(page.locator(".td-row--del").first()).toBeVisible();
    await expect(page.locator(".td-row--mod").first()).toBeVisible();
    await expect(btn(page, "Try an example")).toBeHidden();
  });

  test("copy diff puts a standard unified diff on the clipboard; a failed copy says so", async ({ page, go }) => {
    await open(page, go);
    await both(page, "a\nb\nc", "a\nB\nc");
    await state(page, "result");
    const UNIFIED = "--- Original\n+++ Changed\n@@ -1,3 +1,3 @@\n a\n-b\n+B\n c\n";
    // 1. the clipboard API (not present on a plain-http page, present on https): it receives the unified diff
    await page.evaluate(() => {
      window.__copied = null;
      Object.defineProperty(navigator, "clipboard", { value: { writeText: (t) => { window.__copied = t; return Promise.resolve(); } }, configurable: true });
    });
    await btn(page, "Copy diff").click();
    await expect(live(page)).toHaveText("Diff copied to the clipboard.");
    expect(await page.evaluate(() => window.__copied)).toBe(UNIFIED);
    // 2. no clipboard API: the page selects a hidden box and asks the browser to copy it
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
      document.execCommand = (cmd) => {
        window.__copied = cmd === "copy" ? document.activeElement.value ?? document.getSelection().toString() : null;
        return true;
      };
    });
    await btn(page, "Copy diff").click();
    await expect.poll(() => page.evaluate(() => window.__copied)).toBe(UNIFIED);
    expect(await page.locator("textarea").count()).toBe(2); // the hidden box was removed again
    // 3. nothing works: the page does not claim success
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("no")) }, configurable: true });
      document.execCommand = () => false;
    });
    await btn(page, "Copy diff").click();
    await expect(live(page)).toHaveText("The diff could not be copied automatically.");
    await expect(btn(page, "Copy failed")).toBeVisible();
  });

  test("security: HTML and script text stays inert text in the boxes, the result and the copied diff", async ({ page, go, watch }) => {
    const requests = [];
    page.on("request", (r) => { if (/evil\.test|\/x$/.test(r.url())) requests.push(r.url()); });
    await open(page, go);
    await page.evaluate(() => { window.__xss = 0; });
    const a = '<script>window.__xss=1</script>\n<img src=x onerror="window.__xss=2">\n<svg onload="window.__xss=3"></svg>\n<a href="javascript:window.__xss=4">x</a>';
    const b = '<script>window.__xss=9</script>\n<img src="http://evil.test/a.png" onerror="window.__xss=5">\n<b>bold</b>\n&lt;i&gt; &amp;';
    await both(page, a, b);
    await state(page, "result");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__xss)).toBe(0);
    expect(requests).toEqual([]);
    const lines = page.locator("#td-lines");
    await expect(lines.locator("img, script, svg, a, b, iframe")).toHaveCount(0);
    await expect(lines).toContainText("<script>window.__xss=9</script>");
    await expect(lines).toContainText('<img src="http://evil.test/a.png" onerror="window.__xss=5">');
    await expect(lines).toContainText("&lt;i&gt; &amp;"); // entities are not decoded
    expectClean(watch);
  });

  test("limits: over the size limit it says so, compares nothing and truncates nothing", async ({ page, go }) => {
    await open(page, go);
    const big = Array.from({ length: 15001 }, () => "abcdefghijklmnopqrs").join("\n"); // 300,020 characters in 15,001 lines
    await putBoth(page, big, "y");
    await state(page, "waiting"); // large: waits for Compare
    await btn(page, "Compare").click();
    await state(page, "refused");
    await expect(status(page)).toHaveText("Original is over the limit of 300,000 characters per side. Nothing was compared; shorten it or compare it in parts.");
    await expect(page.locator("#td-original-meta")).toContainText("over the limit");
    await expect(original(page)).toHaveAttribute("aria-invalid", "true");
    expect((await original(page).inputValue()).length).toBe(big.length);
    await expect(page.locator("#td-scroll")).toBeHidden();
    await putBoth(page, "a", "\n".repeat(20001));
    await btn(page, "Compare").click();
    await expect(status(page)).toContainText("Changed is over the limit of 20,000 lines per side");
    await expect(original(page)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("a large comparison waits for Compare, shows Comparing…, stays usable, and Ctrl+Enter also runs it", async ({ page, go }) => {
    await open(page, go);
    const base = Array.from({ length: 5000 }, (_, i) => `row ${i} some ordinary text for the line ${i * 7}`);
    const edited = base.map((l, i) => (i % 25 === 0 ? `${l} (edited)` : l)).filter((_, i) => i % 40 !== 7);
    await putBoth(page, base.join("\n"), edited.join("\n"));
    await state(page, "waiting");
    await expect(status(page)).toHaveText("This is a large comparison. Press Compare to run it.");
    const started = Date.now();
    await btn(page, "Compare").click();
    await state(page, "result");
    const elapsed = Date.now() - started;
    expect(elapsed).toBeLessThan(4000);
    await expect(chips(page).first()).toBeVisible();
    // the DOM stays small: only the first chunk of rows and the gaps are built
    expect(await page.locator("#td-lines > li").count()).toBeLessThanOrEqual(500);
    await expect(page.locator(".td-gap").first()).toBeVisible();
    // the page still responds
    await btn(page, "Swap").click();
    await state(page, "result");
    // Ctrl/Cmd+Enter in a box compares
    await page.locator("#td-ignore").check();
    await put(page, "#td-original", base.join("\n") + "\nextra");
    await state(page, "waiting");
    await original(page).press("Control+Enter");
    await state(page, "result");
  });

  test("unchanged runs collapse to three lines of context and a button shows them; long results come in chunks", async ({ page, go }) => {
    await open(page, go);
    const base = lines(40);
    await putBoth(page, base, base.replace("line 20", "line twenty"));
    await state(page, "result");
    const gaps = page.locator(".td-gap__button");
    await expect(gaps).toHaveText(["Show 16 unchanged lines", "Show 17 unchanged lines"]);
    expect(await page.locator("#td-lines > li").count()).toBe(1 + 3 + 1 + 3 + 1); // gap, 3 context, the change, 3 context, gap
    await gaps.first().click();
    await expect(gaps).toHaveCount(1);
    await expect(page.locator("#td-lines > li").nth(0)).toBeFocused();
    await expect(page.locator("#td-lines")).toContainText("line 1");
    await expect(live(page)).toHaveText("Showing 16 unchanged lines.");
    // chunks
    const many = lines(1500, (i) => `a${i}`);
    const other = lines(1500, (i) => `b${i}`);
    await putBoth(page, many, other);
    await btn(page, "Compare").click();
    await state(page, "result");
    expect(await page.locator("#td-lines > li").count()).toBe(500);
    const more = page.locator("#td-more");
    await expect(more).toHaveText("Show more (2,500 more items)");
    await more.click();
    expect(await page.locator("#td-lines > li").count()).toBe(1000);
  });

  test("wrap long lines: on by default; off scrolls inside the result and never widens the page", async ({ page, go }) => {
    await open(page, go);
    const long = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
    await both(page, `${long}\nsame`, `${long} extra\nsame`);
    await state(page, "result");
    const scroll = page.locator("#td-scroll");
    expect(await scroll.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.locator("#td-wrap").uncheck();
    await expect(scroll).toHaveAttribute("data-wrap", "false");
    expect(await scroll.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await expectNoHorizontalOverflow(page);
    await page.locator("#td-wrap").check();
    await expect(scroll).toHaveAttribute("data-wrap", "true");
  });

  test("Unicode: accents, scripts and emoji are shown exactly", async ({ page, go }) => {
    await open(page, go);
    await both(page, "héllo wörld\n日本語のテキスト\nemoji 😀 done", "héllo wörld\n日本語のテキスト!\nemoji 😃 done");
    await state(page, "result");
    await expect(page.locator("del.td-w")).toContainText(["😀"]);
    await expect(page.locator("ins.td-w")).toContainText(["😃"]);
    await expect(page.locator("#td-lines")).toContainText("héllo wörld");
    await expect(page.locator("#td-lines")).toContainText("日本語のテキスト");
  });

  test("a very long single line stays inside the page", async ({ page, go }) => {
    await open(page, go);
    const long = "x".repeat(60000);
    await putBoth(page, long, `${long}y`);
    await state(page, "waiting");
    await btn(page, "Compare").click();
    await state(page, "result");
    await expectNoHorizontalOverflow(page);
    await page.locator("#td-wrap").uncheck();
    await expectNoHorizontalOverflow(page);
  });

  test("no network request carries the text, nothing is stored, the address does not change", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    await open(page, go);
    const url = page.url();
    const history = await page.evaluate(() => history.length);
    await both(page, "secret-one\nsecret-two", "secret-one\nsecret-three");
    await state(page, "result");
    await btn(page, "Swap").click();
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => history.length)).toBe(history);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
    await page.reload();
    await expect(original(page)).toHaveValue("");
  });

  test("accessibility semantics: labelled boxes and result, one polite announcement, visible focus, keyboard order", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(status(page)).not.toHaveAttribute("aria-live", /.+/);
    await expect(page.locator("#td-scroll")).toHaveAttribute("role", "region");
    await expect(page.locator("#td-scroll")).toHaveAttribute("aria-label", "Line by line differences");
    await expect(page.locator(".td-result")).toHaveAttribute("aria-labelledby", "td-result-title");
    await expect(original(page)).toHaveAttribute("aria-describedby", "td-original-meta");
    expect(await page.locator(".td-actions button").allInnerTexts()).toEqual(["Compare", "Swap", "Copy diff", "Reset"]);
    await both(page, "a b c", "a x c");
    await state(page, "result");
    // heading order: one h1, the result heading is an h2 and no level is skipped
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    // the list is an ordered list in reading order; line numbers are not read out, labels are
    expect(await page.locator("#td-lines").evaluate((el) => el.tagName)).toBe("OL");
    await expect(page.locator(".td-no").first()).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator(".td-mark").first()).toHaveAttribute("aria-hidden", "true");
    // keyboard: tab order and a visible focus ring on the controls
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    await original(page).focus();
    expect(await outline(original(page))).toBeGreaterThanOrEqual(2);
    for (const target of [changed(page), page.locator("#td-ignore"), page.locator("#td-wrap"), btn(page, "Compare"), btn(page, "Swap"), btn(page, "Copy diff"), btn(page, "Reset")]) {
      await page.keyboard.press("Tab");
      await expect(target).toBeFocused();
      expect(await outline(target)).toBeGreaterThanOrEqual(2);
    }
    await page.keyboard.press("Tab");
    await expect(page.locator("#td-scroll")).toBeFocused(); // a scroll box is reachable by keyboard
    expect(await outline(page.locator("#td-scroll"))).toBeGreaterThanOrEqual(2);
    // each state is a word, not only a colour
    await both(page, "same", "same");
    await state(page, "identical");
    await expect(status(page)).toHaveText("No differences found.");
    await expect(page.locator("main")).not.toContainText(/guaranteed|100% accurate/i);
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: boxes stack, the result wraps, nothing widens the page, controls are tappable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      const a = `${lines(14)}\nconst veryLongIdentifierName = someFunction(argumentNumberOne, argumentNumberTwo, argumentNumberThree);`;
      const b = `${lines(14)}\nconst veryLongIdentifierName = someFunction(argumentNumberOne, changedArgument, argumentNumberThree);`;
      await both(page, a, b);
      await state(page, "result");
      await expectNoHorizontalOverflow(page);
      const boxA = await original(page).boundingBox();
      const boxB = await changed(page).boundingBox();
      expect(boxB.y).toBeGreaterThan(boxA.y + boxA.height - 1); // stacked, not side by side
      for (const box of [boxA, boxB]) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      for (const name of ["Compare", "Swap", "Copy diff", "Reset"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const el of [page.locator("#td-ignore"), page.locator("#td-wrap")]) {
        expect((await el.locator("xpath=ancestor::label").boundingBox()).height).toBeGreaterThanOrEqual(44);
      }
      const scroll = await page.locator("#td-scroll").boundingBox();
      expect(scroll.x + scroll.width).toBeLessThanOrEqual(width);
      expect(await page.locator("#td-scroll").evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true); // wraps by default
      await page.locator("#td-wrap").uncheck();
      await expectNoHorizontalOverflow(page); // a no-wrap line scrolls inside its own box
      await put(page, "#td-original", "a".repeat(300001));
      await btn(page, "Compare").click();
      await state(page, "refused");
      await expectNoHorizontalOverflow(page);
      // 16px text in the boxes so a phone does not zoom on focus
      expect(await original(page).evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    });
  }

  test("desktop: the boxes sit side by side", async ({ page, go }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, go);
    const a = await original(page).boundingBox();
    const b = await changed(page).boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(b.x).toBeGreaterThan(a.x + a.width - 1);
  });
});

test.describe("Text Diff / Compare in the site", () => {
  test("Developer Tools lists it as the third tool, flat, with no future placeholders", async ({ page, go }) => {
    await go("developer-tools.html");
    await expect(page.locator(`a[href$="tools/text-diff/"]`)).toHaveCount(1);
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(3);
    await expect(page.locator("main")).not.toContainText(/coming soon|base64|uuid|regex/i);
    await expect(page.locator("main")).toContainText("Text Diff / Compare");
    expect(await page.locator("h2, h3").allInnerTexts()).not.toContain("Subcategories");
  });

  test("All Tools: Developer Tools has 3 tools; Time Tools and Calculators do not list it", async ({ page, go }) => {
    await go("tools.html");
    await expect(page.locator(".directory-section__title a")).toHaveText(["Calculators", "Time Tools", "Developer Tools", "Image Tools"]);
    const dev = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Developer Tools")') });
    await expect(dev.locator(".directory-section__count")).toHaveText("3 tools");
    await expect(dev.locator('a[href$="tools/text-diff/"]')).toHaveCount(1);
    for (const section of ["Calculators", "Time Tools"]) {
      const other = page.locator(".directory-section", { has: page.locator(`.directory-section__title a:text-is("${section}")`) });
      await expect(other.locator('a[href$="tools/text-diff/"]')).toHaveCount(0);
    }
  });

  test("Home to the tool by clicking: Home, All Tools, Developer Tools, Text Diff / Compare", async ({ page, go, siteRoot }) => {
    await go("");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Developer Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}developer-tools.html`);
    await page.locator('a[href$="tools/text-diff/"]').first().click();
    await expect(page.locator("h1")).toHaveText("Text Diff / Compare");
  });

  test("global search: the diff queries lead with the tool, and the other tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["text diff", "compare text", "diff checker", "text compare", "compare two texts", "code diff", "prompt comparison", "Diff Checker"]) await expect(await first(q), q).toContainText("Text Diff / Compare");
    await expect(await first("text diff"), "meta").toContainText("Developer Tools");
    await expect(await first("json")).toContainText("JSON Formatter & Validator");
    await expect(await first("unix timestamp")).toContainText("Unix Timestamp Converter");
    await expect(await first("countdown timer")).toContainText("Countdown Timer");
    await expect(await first("stopwatch")).toContainText("Stopwatch");
    await expect(await first("income tax")).toContainText("Old vs New Tax Regime Calculator");
    await expect(await first("emi")).toContainText("EMI Calculator");
  });

  test("calculator, loan, category and time searches never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("diff");
    await expect(page.locator("main")).not.toContainText("Text Diff");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("text diff");
    await expect(page.locator("#calculators-grid")).not.toContainText("Text Diff");
    await expect(page.locator("#calculators-grid")).not.toContainText("diff checker");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("compare text");
    await expect(page.locator("main")).not.toContainText("Text Diff");
    await go("time-tools.html");
    await expect(page.locator("main")).not.toContainText(/diff checker|text diff/i);
    await expect(page.locator("main a[href*='tools/']")).toHaveCount(5);
  });

  test("it links the JSON Formatter, and the Unix converter is not related to it", async ({ page, go }) => {
    await go("tools/text-diff/");
    await expect(page.locator('main a[href$="tools/json-formatter/"]')).toHaveCount(1);
    await expect(page.locator('main a[href$="tools/unix-timestamp-converter/"]')).toHaveCount(0);
    await go("tools/unix-timestamp-converter/");
    await expect(page.locator("main")).not.toContainText(/text diff/i);
  });

  test("the two existing Developer Tools still load and work after the shared catalog change", async ({ page, go, watch }) => {
    await go("tools/json-formatter/");
    await expect(page.locator("h1")).toHaveText("JSON Formatter & Validator");
    await expect(page.locator("#jf-panel")).toHaveAttribute("data-ready", "true");
    await page.locator("#jf-input").fill('{"a":1}');
    await page.getByRole("button", { name: "Format", exact: true }).click();
    await expect(page.locator("#jf-output")).toHaveValue('{\n  "a": 1\n}');
    await go("tools/unix-timestamp-converter/");
    await expect(page.locator("h1")).toHaveText("Unix Timestamp Converter");
    expectClean(watch);
  });
});
