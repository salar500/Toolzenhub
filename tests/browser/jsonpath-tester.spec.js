/**
 * Tool Pack 36: the JSONPath Tester page.
 *
 * The unit suite (tests/unit/jsonpath-tester.test.mjs) proves the RFC 9535 engine; these tests prove the page: both
 * inputs, located document and query errors, the debounce and Enter, the table of nodes, the trace, Copy values/paths and
 * its fallback, the refused regex functions, announcements, privacy, hostile text, phone layouts and the tool's place in
 * Developer Tools and search.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const DOC = '{"store":{"book":[{"author":"A","price":8.95},{"author":"B","price":12.99},{"author":"C","price":8.99}]}}';

const doc = (page) => page.locator("#jp-document");
const query = (page) => page.locator("#jp-query");
const status = (page) => page.locator("#jp-status");
const live = (page) => page.locator("#jp-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/jsonpath-tester/");
  await expect(page.locator("#jp-panel")).toHaveAttribute("data-ready", "true");
}

async function fill(page, d, q) {
  await doc(page).fill(d);
  await query(page).fill(q);
}

const tableRows = (page) => page.locator("#jp-rows tr").evaluateAll((rows) => rows.map((r) => [...r.children].map((c) => c.textContent.replace(/Show full value|Show less/g, "").trim())));

test.describe("JSONPath Tester", () => {
  test("page, breadcrumb, labels and the initial state", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("JSONPath Tester");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "JSONPath Tester"]);
    await expect(page.getByLabel("JSON document", { exact: true })).toHaveCount(1);
    await expect(page.getByLabel("JSONPath query", { exact: true })).toHaveCount(1);
    await expect(query(page)).toHaveValue("");
    await expect(query(page)).toHaveAttribute("placeholder", "$");
    for (const f of [doc(page), query(page)]) {
      await expect(f).toHaveAttribute("spellcheck", "false");
      await expect(f).toHaveAttribute("autocapitalize", "off");
      await expect(f).toHaveAttribute("autocorrect", "off");
    }
    await expect(status(page)).toHaveText("Paste a JSON document and type a query, or choose Load example.");
    await expect(page.locator("#jp-result")).toBeHidden();
    await expect(page.locator("main")).toContainText("RFC 9535");
    await expect(page.locator("main")).toContainText("except the functions match() and search()");
    expectClean(watch);
  });

  test("the worked example: count, paths, values, the trace", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(query(page)).toHaveValue("$..book[?@.price<10]");
    await expect(status(page)).toHaveText("2 nodes matched.");
    const rows = await tableRows(page);
    expect(rows.map((r) => r[0])).toEqual(["$['store']['book'][0]", "$['store']['book'][2]"]);
    expect(rows[0][1]).toContain('"author":"Nigel Rees"');
    expect(rows[1][1]).toContain('"title":"Moby Dick"');
    await expect(page.locator("#jp-table th[scope='col']")).toHaveText(["Path", "Value"]);
    await expect(page.locator("#jp-trace")).not.toHaveAttribute("open", "");
    await page.locator("#jp-trace summary").click();
    await expect(page.locator("#jp-trace-list li")).toHaveText([
      "..book: descendant segment, name selector. 1 node in, 1 node out.",
      "[?@.price<10]: child segment, filter selector. 1 node in, 2 nodes out."
    ]);
  });

  test("evaluates as you type after a short pause; Enter runs immediately; one node is singular", async ({ page, go }) => {
    await open(page, go);
    await doc(page).fill(DOC);
    await query(page).fill("$.store.book[0].author");
    await expect(status(page)).toHaveText("1 node matched.");
    expect(await tableRows(page)).toEqual([["$['store']['book'][0]['author']", '"A"']]);
    await query(page).fill("$..price");
    await expect(status(page)).toHaveText("3 nodes matched.");
    await query(page).fill("$..author");
    await query(page).press("Enter");
    await expect(status(page)).toHaveText("3 nodes matched.");
  });

  test("empty result is not an error: the trace opens and names where it became empty", async ({ page, go }) => {
    await open(page, go);
    await fill(page, DOC, "$.store.book[1].publisher");
    await expect(status(page)).toHaveText("The query is valid and matched 0 nodes.");
    await expect(page.locator("#jp-result-heading")).toHaveText("No nodes matched");
    await expect(page.locator("#jp-trace")).toHaveAttribute("open", "");
    await expect(page.locator("#jp-trace-list li.jp-x, #jp-trace-list li").last()).toContainText(".publisher: child segment, name selector. 1 node in, 0 nodes out. This is where the result became empty.");
    await expect(btn(page, "Copy values")).toBeDisabled();
    await expect(btn(page, "Copy paths")).toBeDisabled();
    await expect(page.locator("#jp-query-status")).toHaveText("Valid query.");
  });

  test("a missing document or query is a neutral prompt naming it, not an error", async ({ page, go }) => {
    await open(page, go);
    await query(page).fill("$.a");
    await expect(status(page)).toHaveText("Paste the JSON document to query.");
    await expect(doc(page)).not.toHaveAttribute("aria-invalid", "true");
    await doc(page).fill("{}");
    await query(page).fill("");
    await expect(status(page)).toHaveText("Type a JSONPath query, starting with $.");
    await expect(query(page)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("a malformed query shows the position and a caret, is linked, and nothing is evaluated", async ({ page, go }) => {
    await open(page, go);
    await fill(page, DOC, "$.store b");
    await expect(status(page)).toHaveText("Nothing was evaluated: fix the problem below.");
    await expect(page.locator("#jp-query-status")).toHaveText('Query, position 9: Expected a segment such as .name, ..name or ["name"], found "b".');
    await expect(page.locator("#jp-query-context")).toHaveText("$.store b\n        ^");
    await expect(query(page)).toHaveAttribute("aria-invalid", "true");
    await expect(query(page)).toHaveAttribute("aria-describedby", "jp-query-status jp-query-context");
    await expect(page.locator("#jp-result")).toBeHidden();
    await expect(query(page)).toHaveValue("$.store b");
    await query(page).fill("$.store");
    await expect(query(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#jp-query-context")).toBeHidden();
    await expect(status(page)).toHaveText("1 node matched.");
  });

  test("an invalid document is located and the query is still checked", async ({ page, go }) => {
    await open(page, go);
    await fill(page, '{"a":1,}', "$.a[");
    await expect(page.locator("#jp-document-status")).toContainText("JSON document, line 1, column 7: A trailing comma");
    await expect(page.locator("#jp-document-context")).toBeVisible();
    await expect(page.locator("#jp-query-status")).toContainText("Query, position 5:");
    await expect(doc(page)).toHaveValue('{"a":1,}');
    await expect(page.locator("#jp-result")).toBeHidden();
  });

  test("match() and search() are refused with the stated message and the page explains why", async ({ page, go }) => {
    await open(page, go);
    await fill(page, '{"a":"x"}', "$[?match(@, 'x')]");
    await expect(page.locator("#jp-query-status")).toHaveText("Query, position 4: match() and search() are not supported in this version.");
    await query(page).fill("$[?search(@, 'x')]");
    await expect(page.locator("#jp-query-status")).toContainText("match() and search() are not supported in this version.");
    await expect(page.locator("main")).toContainText("Why is match() or search() refused?");
  });

  test("spaces around the whole query are refused with a hint; ill-typed functions name the function", async ({ page, go }) => {
    await open(page, go);
    await fill(page, "[1]", " $[0]");
    await expect(page.locator("#jp-query-status")).toContainText("Remove the spaces before and after the query");
    await query(page).fill("$[0] ");
    await expect(page.locator("#jp-query-status")).toContainText("Remove the spaces after the query");
    await query(page).fill("$[?length(@.*)>0]");
    await expect(page.locator("#jp-query-status")).toContainText("length() needs a single value");
  });

  test("filters, slices, negative indices and functions give the standard's results", async ({ page, go }) => {
    await open(page, go);
    const check = async (d, q, expected) => {
      await fill(page, d, q);
      await expect(status(page)).toHaveText(expected === 0 ? "The query is valid and matched 0 nodes." : expected === 1 ? "1 node matched." : `${expected} nodes matched.`);
    };
    await check("[0,1,2,3,4]", "$[::-1]", 5);
    await check("[0,1,2,3,4]", "$[3:0:-1]", 3);
    await check("[0,1,2,3,4]", "$[::0]", 0);
    await check("[0,1,2,3,4]", "$[-1]", 1);
    await check('[{"a":1},{"a":2},{}]', "$[?@.a==@.b]", 1);
    await check('[{"a":[1,2]},{"a":[]}]', "$[?count(@.a[*])==2]", 1);
    await check('["ab","abc"]', "$[?length(@)>2]", 1);
    await check("[12345678901234567890,12345678901234567891]", "$[?@>12345678901234567890]", 1);
  });

  test("the node list caps at 1,000 rows while Copy values and Copy paths keep all; long values truncate with a control", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await fill(page, "[" + Array.from({ length: 1500 }, (_, i) => i).join(",") + "]", "$[*]");
    await expect(status(page)).toHaveText("1,500 nodes matched.");
    await expect(page.locator("#jp-rows tr")).toHaveCount(1000);
    await expect(page.locator("#jp-more")).toHaveText("Showing the first 1,000 of 1,500 nodes. Copying includes all of them.");
    await btn(page, "Copy values").click();
    await expect(live(page)).toHaveText("Values copied to the clipboard.");
    await btn(page, "Copy paths").click();
    const [values, paths] = await page.evaluate(() => window.__copied);
    expect(JSON.parse(values)).toHaveLength(1500);
    expect(paths.split("\n")).toHaveLength(1500);
    expect(paths.split("\n").slice(0, 2)).toEqual(["$[0]", "$[1]"]);
    const long = "x".repeat(500);
    await fill(page, `{"v":"${long}"}`, "$.v");
    const cell = page.locator("#jp-rows tr").first().locator("td");
    await expect(cell.locator(".jp-value__text")).toHaveText(`"${"x".repeat(198)}…`);
    await cell.getByRole("button", { name: "Show full value for node 1" }).click();
    await expect(cell.locator(".jp-value__text")).toHaveText(`"${long}"`);
  });

  test("a large document waits for Evaluate or Enter; limits are refused with the stated messages", async ({ page, go }) => {
    await open(page, go);
    const big = "[" + "1,".repeat(110000) + "1]";
    await doc(page).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, big);
    await query(page).fill("$[0]");
    await expect(status(page)).toHaveText("Large document. Press Evaluate or Enter in the query box.");
    await query(page).press("Enter");
    await expect(status(page)).toHaveText("1 node matched.");
    await query(page).fill("$" + "[0]".repeat(334));
    await query(page).press("Enter");
    await expect(page.locator("#jp-query-status")).toHaveText("The query is over the limit of 1,000 characters, so it was not run.");
    await doc(page).evaluate((e) => { e.value = "[" + "1".repeat(1000000) + "]"; e.dispatchEvent(new Event("input", { bubbles: true })); });
    await query(page).fill("$");
    await query(page).press("Enter");
    await expect(page.locator("#jp-document-status")).toHaveText("The document is over the limit of 1,000,000 characters, so the query was not run.");
    const level = (n) => Array.from({ length: 16 }, () => (n === 0 ? 1 : level(n - 1)));
    await doc(page).fill(JSON.stringify(level(3)));
    await query(page).fill("$..*..*");
    await expect(status(page)).toHaveText("The query selected more than 100,000 nodes at segment 2; narrow it.");
    await expect(page.locator("#jp-result")).toBeHidden();
  });

  test("Reset clears everything and focuses the document box", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(status(page)).toHaveText("2 nodes matched.");
    await btn(page, "Reset").click();
    await expect(doc(page)).toBeFocused();
    await expect(doc(page)).toHaveValue("");
    await expect(query(page)).toHaveValue("");
    await expect(page.locator("#jp-result")).toBeHidden();
    await expect(status(page)).toHaveText("Paste a JSON document and type a query, or choose Load example.");
  });

  test("Copy on a stubbed clipboard; a failed copy shows a selectable text area and focuses it", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await fill(page, '{"a":[1.50,"x"]}', "$.a[*]");
    await btn(page, "Copy values").click();
    await btn(page, "Copy paths").click();
    const [values, paths] = await page.evaluate(() => window.__copied);
    expect(values).toBe('[1.50,"x"]');
    expect(paths).toBe("$['a'][0]\n$['a'][1]");
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("denied"); } }, configurable: true });
      document.execCommand = () => false;
    });
    await btn(page, "Copy paths").click();
    await expect(page.locator("#jp-fallback-wrap")).toBeVisible();
    await expect(page.locator("#jp-fallback")).toBeFocused();
    await expect(page.locator("#jp-fallback")).toHaveValue(paths);
  });

  test("privacy: no request carries the input, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await fill(page, '{"secret":"hunter2horse"}', "$.secret");
    await expect(status(page)).toHaveText("1 node matched.");
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    expect(logs.some((l) => l.includes("hunter2horse"))).toBe(false);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("hostile text is shown as text, never as markup; __proto__ is an ordinary name", async ({ page, go }) => {
    await open(page, go);
    const evil = "<img src=x onerror=window.__pwned=1>";
    await fill(page, `{"${evil}":"<script>window.__pwned=2</script>","__proto__":1}`, `$['${evil}']`);
    await expect(page.locator("#jp-rows tr")).toHaveCount(1);
    await expect(page.locator("#jp-rows")).toContainText("<script>window.__pwned=2</script>");
    await expect(page.locator("#jp-result img, #jp-result script")).toHaveCount(0);
    await query(page).fill("$.__proto__");
    await expect(status(page)).toHaveText("1 node matched.");
    await query(page).fill(`$[?@ == '<b>x</b>']<img src=x onerror=window.__pwned=3>`);
    await expect(page.locator("#jp-query-context")).toBeVisible();
    await expect(page.locator("#jp-query-context img, #jp-query-status img")).toHaveCount(0);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  });

  test("keyboard and accessibility: labelled controls, a polite live region, visible focus, heading order, trace is not announced", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await doc(page).focus();
    await page.keyboard.press("Tab");
    await expect(query(page)).toBeFocused();
    for (const name of ["Evaluate", "Load example", "Reset"]) {
      await btn(page, name).focus();
      const o = await btn(page, name).evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect((o.style !== "none" && o.width > 0) || o.shadow !== "none", `${name} focus ring`).toBe(true);
    }
    await btn(page, "Load example").click();
    await expect(live(page)).toHaveText("2 nodes matched.");
    await page.locator("#jp-trace summary").click();
    await expect(live(page)).toHaveText("2 nodes matched.");
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
  });

  test("the page links the JSON Formatter and JSON Compare, lists only supported syntax, and a refresh clears the boxes", async ({ page, go, siteRoot }) => {
    await open(page, go);
    await expect(page.locator(`main .calculator-info a[href='${siteRoot}tools/json-formatter/']`)).toHaveCount(1);
    await expect(page.locator(`main .calculator-info a[href='${siteRoot}tools/json-compare/']`)).toHaveCount(1);
    await expect(page.locator("main")).toContainText("$..book[?@.price<10]");
    await expect(page.locator("main")).toContainText("Supported Syntax");
    await expect(page.locator(".jp-ref")).not.toContainText("match(");
    await btn(page, "Load example").click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#jp-panel")).toHaveAttribute("data-ready", "true");
    await expect(doc(page)).toHaveValue("");
    await expect(page.locator("#jp-result")).toBeHidden();
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`JSONPath Tester at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`long paths, long values, an error and the table fit: no page-level overflow, 44px targets, 16px text at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      const key = "k".repeat(120);
      await fill(page, `{"${key}":{"${key}":"${"v".repeat(400)}"}}`, "$..*");
      await expect(page.locator("#jp-result")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.locator("#jp-rows .jp-more-button").first().click();
      await expectNoHorizontalOverflow(page);
      await query(page).fill("$." + "a".repeat(300) + " b");
      await expect(page.locator("#jp-query-context")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await fill(page, '{"a":1,}', "$[");
      await expectNoHorizontalOverflow(page);
      await btn(page, "Load example").click();
      await page.locator("#jp-trace summary").click();
      await expectNoHorizontalOverflow(page);
      for (const name of ["Evaluate", "Load example", "Reset", "Copy values", "Copy paths"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      const summary = await page.locator("#jp-trace summary").boundingBox();
      expect(summary.height).toBeGreaterThanOrEqual(44);
      expect(parseFloat(await query(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      expect(parseFloat(await doc(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
    });
  });
}

test.describe("JSONPath Tester in Developer Tools and search", () => {
  test("it is listed with the other tools and found by its own names; older tools are not mentioned in it", async ({ page, go, siteRoot }) => {
    await go("developer-tools.html");
    const hrefs = await page.locator("a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toContain(`${siteRoot}tools/jsonpath-tester/`);
    await go("tools.html");
    await expect(page.locator(`.directory-section a[href$="tools/jsonpath-tester/"]`)).toHaveCount(1);
    await go("calculators.html");
    await expect(page.locator(`a[href*="jsonpath"]`)).toHaveCount(0);
    for (const q of ["jsonpath", "json path", "jsonpath tester"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/jsonpath-tester/']`).first(), q).toBeVisible();
    }
  });
});
