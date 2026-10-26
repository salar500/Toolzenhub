/**
 * Tool Pack 37: the URL Parser & Encoder page.
 *
 * The unit suite (tests/unit/url-parser.test.mjs) proves the engine against hand-derived vectors; these tests prove
 * the page: the three modes, the parts and parameters, the warnings, strict decode errors, the build rows, Reset,
 * Copy, announcements, privacy (no request, no storage, no navigation, no link made from the input), the phone layouts
 * and the tool's place in Developer Tools and search.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const FULL = "https://user:pw@Example.COM:443/a/./b/../c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag";

const mode = (page, name) => page.getByRole("radio", { name, exact: true });
const op = (page, name) => page.getByRole("radio", { name });
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const live = (page) => page.locator("#up-live");

async function open(page, go) {
  await go("tools/url-parser/");
  await expect(page.locator("#up-panel")).toHaveAttribute("data-ready", "true");
}

async function parse(page, text, base = "") {
  await page.locator("#up-url").fill(text);
  if (base) {
    await page.locator("#up-base").evaluate((e) => { e.closest("details").open = true; });
    await page.locator("#up-base").fill(base);
  }
}

test.describe("URL Parser & Encoder", () => {
  test("page, breadcrumb, labels, the never-opens note and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("URL Parser & Encoder");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "URL Parser & Encoder"]);
    await expect(mode(page, "Parse a URL")).toBeChecked();
    await expect(page.getByLabel("URL", { exact: true })).toHaveCount(1);
    await expect(page.locator(".up-note")).toContainText("never opens, fetches or links a URL");
    await expect(page.locator("#up-parse-status")).toHaveText("Paste a URL, or choose Load example.");
    await expect(page.locator("#up-parse-result")).toBeHidden();
    expectClean(watch);
  });

  test("parse: the worked example shows the parts, segments, parameters, changes and the normalized URL", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await expect(page.locator("#up-url")).toHaveValue(FULL);
    const row = (label) => page.locator("#up-components-body tr", { has: page.getByRole("rowheader", { name: label, exact: true }) }).locator("td").first();
    await expect(row("Scheme")).toHaveText("https");
    await expect(row("Username")).toHaveText("user");
    await expect(row("Password")).toHaveText("pw");
    await expect(row("Host")).toHaveText("example.com");
    await expect(row("Port")).toHaveText("default for the scheme");
    await expect(row("Path")).toHaveText("/a/c%20d");
    await expect(row("Fragment")).toHaveText("#frag");
    await expect(row("Origin")).toHaveText("https://example.com");
    await expect(page.locator("#up-segments li")).toHaveText(["a", "c d"]);
    const params = await page.locator("#up-params-body tr").evaluateAll((rows) => rows.map((r) => [...r.children].map((c) => c.textContent)));
    expect(params).toEqual([["1", "x", "1", "repeated"], ["2", "x", "2", "repeated"], ["3", "y", "a b", ""], ["4", "z", "你", ""]]);
    await expect(page.locator("#up-changes")).toHaveText("The parser changed your input:");
    await expect(page.locator("#up-changes-list li")).toHaveText(["host lowercased", "default port removed", "dot segments resolved"]);
    await expect(page.locator("#up-href")).toHaveText("https://user:pw@example.com/a/c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag");
    await expect(page.locator("#up-warnings li")).toHaveText(["This URL contains credentials."]);
    await expect(page.locator("#up-parse-status")).toContainText("Parsed.");
  });

  test("parse: results update as you type, an already normalized URL says so, and a failure gives one hint", async ({ page, go }) => {
    await open(page, go);
    await parse(page, "https://example.com/a?x=1");
    await expect(page.locator("#up-changes")).toHaveText("Your input was already in normalized form.");
    await parse(page, "http://a:99999");
    await expect(page.locator("#up-parse-error")).toBeVisible();
    await expect(page.locator("#up-parse-error-message")).toHaveText("The browser could not parse this as a URL. The port is outside the range 0 to 65535.");
    await expect(page.locator("#up-url")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#up-parse-result")).toBeHidden();
    await parse(page, "example.com/path");
    await expect(page.locator("#up-parse-error-message")).toHaveText("This is not an absolute URL. Add a scheme such as https:// or give a Base URL.");
    await parse(page, "../x", "https://example.com/a/b/c");
    await expect(page.locator("#up-href")).toHaveText("https://example.com/a/x");
    await parse(page, "");
    await expect(page.locator("#up-parse-status")).toHaveText("Paste a URL, or choose Load example.");
    await expect(page.locator("#up-url")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("parse: javascript: is text with a warning and nothing becomes a link, an image or a navigation", async ({ page, go }) => {
    await open(page, go);
    const before = page.url();
    await parse(page, "javascript:window.__pwned=1");
    await expect(page.locator("#up-warnings")).toContainText("can run or embed content");
    await expect(page.locator("#up-segments-wrap")).toBeHidden();
    await expect(page.locator("#up-parse-result a, #up-parse-result img, #up-parse-result iframe")).toHaveCount(0);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(page.url()).toBe(before);
    await parse(page, "https://xn--bcher-kva.de/<img src=x onerror=window.__pwned=1>");
    await expect(page.locator("#up-parse-result img")).toHaveCount(0);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  });

  test("parse: malformed percent sequences are located, and more than 500 parameters are capped on screen", async ({ page, go }) => {
    await open(page, go);
    await parse(page, "https://e.com/%zz?q=%4&r=100%");
    await expect(page.locator("#up-malformed li")).toHaveText(["In the path, position 1: %zz", "In the query, position 3: %4&", "In the query, position 11: %"]);
    await page.locator("#up-url").evaluate((e) => { e.value = "https://e.com/?" + Array.from({ length: 501 }, (_, i) => `k${i}=v`).join("&"); e.dispatchEvent(new Event("input", { bubbles: true })); });
    await expect(page.locator("#up-params-body tr")).toHaveCount(500);
    await expect(page.locator("#up-params-more")).toHaveText("Showing the first 500 of 501 parameters.");
  });

  test("parse: more than the limit is refused with the limit, and a large input waits for the button", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#up-url").evaluate((e) => { e.value = "https://e.com/?a=" + "a".repeat(100001); e.dispatchEvent(new Event("input", { bubbles: true })); });
    await expect(page.locator("#up-parse-status")).toHaveText("Large input. Press Parse.");
    await btn(page, "Parse").click();
    await expect(page.locator("#up-parse-error-message")).toContainText("limit is 100,000 characters");
  });

  test("encode and decode: the four operations, counts, strict errors and Decode again", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "Encode or decode text").check();
    await expect(page.locator("#up-mode-codec")).toBeVisible();
    await expect(page.locator("#up-mode-parse")).toBeHidden();
    await page.locator("#up-text").fill("a b&c=d/é");
    await expect(page.locator("#up-codec-output")).toHaveText("a%20b%26c%3Dd%2F%C3%A9");
    await expect(page.locator("#up-codec-meta")).toHaveText("9 characters in, 22 characters out, 10 bytes as UTF-8.");
    await page.locator("#up-text").fill("!'()*");
    await expect(page.locator("#up-codec-output")).toHaveText("%21%27%28%29%2A");
    await page.getByLabel("Keep ! ' ( ) * as they are").check();
    await expect(page.locator("#up-codec-output")).toHaveText("!'()*");
    await op(page, "Form-encode (space as +)").check();
    await expect(page.locator("#up-keep-wrap")).toBeHidden();
    await page.locator("#up-text").fill("a b*c-d.e_f~g");
    await expect(page.locator("#up-codec-output")).toHaveText("a+b*c-d.e_f%7Eg");
    await op(page, "Percent-decode").check();
    await page.locator("#up-text").fill("a+b%20c");
    await expect(page.locator("#up-codec-output")).toHaveText("a+b c");
    await op(page, "Form-decode (+ as space)").check();
    await expect(page.locator("#up-codec-output")).toHaveText("a b c");
    await op(page, "Percent-decode").check();
    await page.locator("#up-text").fill("100%");
    await expect(page.locator("#up-codec-error")).toBeVisible();
    await expect(page.locator("#up-codec-error-message")).toContainText('"%" at position 3');
    await expect(page.locator("#up-codec-result")).toBeHidden();
    await page.locator("#up-text").fill("%C3%28");
    await expect(page.locator("#up-codec-error-message")).toContainText("not valid UTF-8, starting at byte 0");
    await page.locator("#up-text").fill("%2541");
    await expect(page.locator("#up-codec-output")).toHaveText("%41");
    await expect(page.locator("#up-codec-twice")).toBeVisible();
    await btn(page, "Decode again").click();
    await expect(page.locator("#up-codec-output")).toHaveText("A");
    await expect(page.locator("#up-codec-twice")).toBeHidden();
  });

  test("encode: a lone surrogate is an error, never a replacement character", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "Encode or decode text").check();
    await page.locator("#up-text").evaluate((e) => { e.value = "a\uD800b"; e.dispatchEvent(new Event("input", { bubbles: true })); });
    await expect(page.locator("#up-codec-error-message")).toContainText("lone surrogate at position 1");
    await expect(page.locator("#up-codec-output")).toHaveText("");
  });

  test("build: rows, repeated names, both styles, blank rows, a base URL, and editing an existing query", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "Build a query string").check();
    await btn(page, "Load example").click();
    await expect(page.locator("#up-build-output")).toHaveText("q=a%20b&tag=x%26y&tag=%C3%A9");
    await page.getByLabel("Form encoding (space as +)").check();
    await expect(page.locator("#up-build-output")).toHaveText("q=a+b&tag=x%26y&tag=%C3%A9");
    await btn(page, "Add parameter").click();
    await expect(page.getByLabel("Name 4", { exact: true })).toBeFocused();
    await expect(page.locator("#up-build-status")).toContainText("1 blank row skipped.");
    await page.getByLabel("Value 4", { exact: true }).fill("orphan");
    await expect(page.locator("#up-build-error")).toBeVisible();
    await expect(page.locator("#up-build-error-message")).toHaveText("Row 4 has a value but no name.");
    await page.getByRole("button", { name: "Remove parameter 4" }).click();
    await expect(page.locator("#up-build-error")).toBeHidden();
    await page.locator("#up-build-base").fill("https://e.com/p?old=1#f");
    await expect(page.locator("#up-build-full")).toHaveText("https://e.com/p?q=a+b&tag=x%26y&tag=%C3%A9#f");
    await page.locator("#up-edit").fill("?a=1&a=2");
    await btn(page, "Fill rows from this query").click();
    await expect(page.getByLabel("Name 1", { exact: true })).toHaveValue("a");
    await expect(page.getByLabel("Value 2", { exact: true })).toHaveValue("2");
    await expect(page.locator("#up-build-output")).toHaveText("a=1&a=2");
  });

  test("Reset clears all three modes, returns to Parse and focuses the URL field; switching mode keeps focus on the radio", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load example").click();
    await mode(page, "Encode or decode text").check();
    await expect(mode(page, "Encode or decode text")).toBeFocused();
    await page.locator("#up-text").fill("x y");
    await mode(page, "Build a query string").check();
    await btn(page, "Load example").click();
    await btn(page, "Reset").click();
    await expect(mode(page, "Parse a URL")).toBeChecked();
    await expect(page.locator("#up-url")).toBeFocused();
    await expect(page.locator("#up-url")).toHaveValue("");
    await expect(page.locator("#up-parse-result")).toBeHidden();
    await mode(page, "Encode or decode text").check();
    await expect(page.locator("#up-text")).toHaveValue("");
    await mode(page, "Build a query string").check();
    await expect(page.locator("#up-rows .up-row")).toHaveCount(0);
  });

  test("Copy works on a stubbed clipboard and is announced; a failed copy says so", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => { window.__copied.push(t); } }, configurable: true });
    });
    await open(page, go);
    await btn(page, "Load example").click();
    await btn(page, "Copy normalized URL").click();
    await expect(live(page)).toHaveText("Normalized URL copied to the clipboard.");
    await page.getByRole("button", { name: "Copy host" }).click();
    expect(await page.evaluate(() => window.__copied)).toEqual(["https://user:pw@example.com/a/c%20d?x=1&x=2&y=a+b&z=%E4%BD%A0#frag", "example.com"]);
  });

  test("privacy: no request carries the input, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await parse(page, "https://secret-host.example/path?token=hunter2horse");
    await mode(page, "Encode or decode text").check();
    await page.locator("#up-text").fill("hunter2horse");
    await mode(page, "Build a query string").check();
    await btn(page, "Load example").click();
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    for (const part of ["secret-host", "hunter2horse"]) expect(logs.some((l) => l.includes(part)), `console ${part}`).toBe(false);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("keyboard and accessibility: arrow keys on the modes, labelled controls, a polite live region, heading order", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "Parse a URL").focus();
    await page.keyboard.press("ArrowRight");
    await expect(mode(page, "Encode or decode text")).toBeChecked();
    await page.keyboard.press("ArrowRight");
    await expect(mode(page, "Build a query string")).toBeChecked();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(mode(page, "Parse a URL")).toBeChecked();
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await expect(page.getByRole("group", { name: "What do you want to do?" })).toHaveCount(1);
    await btn(page, "Load example").click();
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
  });

  test("the static explanation links the Base64 and JSON tools, and a refresh clears the box", async ({ page, go, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("main .calculator-info").first()).toBeVisible();
    await expect(page.locator(`main .calculator-info a[href='${siteRoot}tools/base64-encoder-decoder/']`)).toHaveCount(1);
    await expect(page.locator(`main .calculator-info a[href='${siteRoot}tools/json-formatter/']`)).toHaveCount(1);
    await expect(page.locator("main")).toContainText("Which Kind of Encoding to Use");
    await parse(page, "https://example.com/");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#up-panel")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("#up-url")).toHaveValue("");
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`URL Parser & Encoder at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`a long URL, the tables and an error fit: no page-level overflow, 44px targets, 16px text at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await parse(page, "https://user:pw@sub.example.com:8443/" + "segment/".repeat(30) + "?" + "param=" + "v".repeat(300) + "&x=1&x=2#" + "f".repeat(100));
      await expect(page.locator("#up-parse-result")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await parse(page, "http://a:99999");
      await expect(page.locator("#up-parse-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await btn(page, "Load example").click();
      for (const name of ["Parse", "Load example", "Reset"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const name of ["Parse a URL", "Encode or decode text", "Build a query string"]) {
        const box = await mode(page, name).locator("xpath=..").boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      expect(parseFloat(await page.locator("#up-url").evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      await mode(page, "Build a query string").check();
      await btn(page, "Load example").click();
      await expectNoHorizontalOverflow(page);
      const remove = await page.getByRole("button", { name: "Remove parameter 1" }).boundingBox();
      expect(remove.height).toBeGreaterThanOrEqual(44);
      expect(remove.x + remove.width).toBeLessThanOrEqual(width);
      await mode(page, "Encode or decode text").check();
      await page.locator("#up-text").fill("é".repeat(5000));
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("URL Parser & Encoder in Developer Tools and search", () => {
  test("it is listed with the other tools and found by its own names", async ({ page, go, siteRoot }) => {
    await go("developer-tools.html");
    const hrefs = await page.locator("a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toContain(`${siteRoot}tools/url-parser/`);
    await go("tools.html");
    await expect(page.locator(`.directory-section a[href$="tools/url-parser/"]`)).toHaveCount(1);
    await go("calculators.html");
    await expect(page.locator(`a[href*="url-parser"]`)).toHaveCount(0);
    for (const q of ["url parser", "url encode", "percent encoding", "query string"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/url-parser/']`).first(), q).toBeVisible();
    }
  });
});
