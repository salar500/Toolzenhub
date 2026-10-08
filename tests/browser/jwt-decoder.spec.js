/**
 * Tool Pack 22: the JWT Decoder page.
 *
 * Only what this change can break: the page's own workflow (explicit Decode only, the example, errors, Clear), the safe
 * rendering of hostile token text, explicit and limited copying, the privacy boundaries (no request, no storage, no URL
 * or title change, no logging, no clipboard reads), the keyboard path, narrow phone layouts, and the tool's place in
 * the Developer Tools section. The rules (structure, base64url, UTF-8, JSON, claims, time) are pinned by
 * tests/unit/jwt-decoder.test.mjs with reference vectors written in Python.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#jw-input");
const status = (page) => page.locator("#jw-status-text");
const results = (page) => page.locator("#jw-results");
const errorBox = (page) => page.locator("#jw-error");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

const b64 = (text) => Buffer.from(text, "utf8").toString("base64url");
const tok = (header, payload, signature = "c2lnbmF0dXJl") => `${b64(header)}.${b64(payload)}.${signature}`;
const HDR = '{"alg":"HS256","typ":"JWT"}';

// the made-up example, as the page builds it (kept in step with tests/unit/jwt-decoder.test.mjs by the unit test of the example)
const EXAMPLE_PAYLOAD_EXP_UTC = "2023-11-14T23:13:20Z";

async function open(page, go) {
  await go("tools/jwt-decoder/");
  await expect(page.locator("#jw-panel")).toHaveAttribute("data-ready", "true"); // the script has run
}

async function decodeExample(page) {
  await btn(page, "Load an example").click();
  await btn(page, "Decode").click();
  await expect(results(page)).toBeVisible();
}

test.describe("JWT Decoder", () => {
  test("page, breadcrumb, labels, the standing notice and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("JWT Decoder");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "JWT Decoder"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}developer-tools.html`]);

    await expect(page.getByLabel("JWT", { exact: true })).toHaveCount(1);
    await expect(input(page)).toHaveValue("");
    // the credential-safe input attributes
    for (const [name, value] of [["spellcheck", "false"], ["autocomplete", "off"], ["autocapitalize", "off"], ["autocorrect", "off"]]) {
      await expect(input(page)).toHaveAttribute(name, value);
    }
    await expect(page.locator("#jw-count")).toHaveText("0 characters");
    await expect(status(page)).toHaveText("Paste a token, or load the example.");
    await expect(results(page)).toBeHidden();
    await expect(errorBox(page)).toBeHidden();
    // the reminder is there before anything is decoded, and says what the tool does not do
    await expect(page.locator(".jw-notice")).toContainText("Signature not verified.");
    await expect(page.locator(".jw-notice")).toContainText("does not check the signature, the issuer or the algorithm");
    expectClean(watch);
  });

  test("loading the example, typing and pasting never decode; only Decode does", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Load an example").click();
    await expect(input(page)).not.toHaveValue("");
    await expect(page.locator("#jw-count")).not.toHaveText("0 characters");
    await expect(results(page)).toBeHidden();
    await expect(status(page)).toContainText("Example loaded");
    await input(page).fill(tok(HDR, '{"sub":"typed"}'));
    await input(page).dispatchEvent("paste");
    await input(page).press("a");
    await expect(results(page)).toBeHidden();
    await expect(errorBox(page)).toBeHidden();
    await expect(status(page)).toContainText("Example loaded"); // still the earlier message: nothing ran
    await btn(page, "Decode").click();
    await expect(errorBox(page)).toBeVisible(); // the extra "a" makes the signature part an impossible length, so Decode now reports it
  });

  test("decode the example: header, payload, claims, times and the not-verified wording", async ({ page, go, watch }) => {
    await page.clock.setFixedTime(new Date("2023-11-14T22:43:20Z")); // only Date is fixed; timers still run
    await open(page, go);
    await decodeExample(page);
    await expect(page.locator("#jw-header")).toContainText('"alg": "HS256"');
    await expect(page.locator("#jw-payload")).toContainText('"sub": "example-user-001"');
    await expect(page.locator("#jw-claims dt")).toHaveText(["iss: Issuer", "sub: Subject", "aud: Audience", "exp: Expiration time", "nbf: Not before", "iat: Issued at", "jti: JWT ID"]);
    await expect(page.locator("#jw-claims")).toContainText("The token says this is who issued the token");
    await expect(page.locator("#jw-times")).toContainText(EXAMPLE_PAYLOAD_EXP_UTC);
    await expect(page.locator("#jw-times")).toContainText("in 30 minutes");
    await expect(page.locator("#jw-times")).toContainText("The expiry time has not passed yet");
    await expect(page.locator("#jw-time-notes")).toContainText("clock of this device, which may be wrong");
    await expect(page.locator("#jw-time-notes")).toContainText("Checked at 2023-11-14T22:43:20Z UTC.");
    await expect(status(page)).toHaveText("Decoded. Nothing has been verified.");
    await expect(page.locator("#jw-signature-heading")).toHaveText("Signature: not verified");
    await expect(page.locator("#jw-structure")).toContainText("HS256 (declared by the token, not checked)");
    await expect(page.locator("#jw-live")).toContainText("Nothing has been verified");
    await expect(page.locator(".jw-untrusted")).toContainText("untrusted data");
    // never a verdict
    const text = await results(page).innerText();
    expect(/\b(valid token|invalid token|trusted|authenticated|genuine)\b/i.test(text)).toBe(false);
    expectClean(watch);
  });

  test("an integer claim beyond 2^53 is disclosed, not shown as a rounded number or a date", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill(tok(HDR, '{"exp":12345678901234567890,"iat":1700000000}'));
    await btn(page, "Decode").click();
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#jw-payload")).toContainText("12345678901234567890"); // exactly as written
    await expect(page.locator("#jw-claims")).toContainText("larger than JavaScript can hold exactly");
    await expect(page.locator("#jw-times")).toContainText("too large to read exactly, so no date is shown");
    expect(await results(page).innerText()).not.toContain("12345678901234567000");
    await expect(page.locator("#jw-times")).toContainText("2023-11-14T22:13:20Z"); // the ordinary iat beside it still works
  });

  test("Ctrl+Enter decodes from the box", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill(tok(HDR, '{"sub":"keys"}'));
    await input(page).press("Control+Enter");
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#jw-payload")).toContainText('"sub": "keys"');
  });

  test("unreadable input: a specific message, no results, and the text stays editable", async ({ page, go }) => {
    await open(page, go);
    const cases = [
      ["a.b", /A signed JWT has 3 parts.*This has 2 parts/],
      ["not-a-token", /1 part and no dots/],
      [`${b64(HDR)}.${b64("[1,2]")}.sig`, /payload \(part 2\) is valid JSON but it is an array/],
      [`${b64(HDR)}.${b64('{"a":}')}.sig`, /payload \(part 2\) is not valid JSON/],
      [`${b64(HDR)}.ab+cd.sig`, /Part 2 \(payload\) contains "\+"/],
      ["a.b.c.d.e", /encrypted token \(JWE\).*does not decrypt/],
    ];
    for (const [text, message] of cases) {
      await input(page).fill(text);
      await btn(page, "Decode").click();
      await expect(errorBox(page)).toBeVisible();
      await expect(page.locator("#jw-error-message")).toContainText(message);
      await expect(results(page)).toBeHidden();
      await expect(status(page)).toHaveText("Could not read this as a JWT.");
      await expect(input(page)).toHaveValue(text);
    }
    // the place of a JSON problem is shown with the text around it
    await input(page).fill(`${b64(HDR)}.${b64('{"a":}')}.sig`);
    await btn(page, "Decode").click();
    await expect(page.locator("#jw-error-where")).toHaveText(/^Line 1, column \d+$/);
    await expect(page.locator("#jw-error-context")).not.toBeEmpty();
    // empty input is not an error
    await input(page).fill("");
    await btn(page, "Decode").click();
    await expect(errorBox(page)).toBeHidden();
    await expect(status(page)).toHaveText("Paste a token, or load the example.");
  });

  test("a Bearer prefix and wrapped lines are accepted, and the page says it ignored them", async ({ page, go }) => {
    await open(page, go);
    const t = tok(HDR, '{"sub":"x"}');
    await input(page).fill(`Bearer ${t.slice(0, 15)}\n${t.slice(15)}`);
    await btn(page, "Decode").click();
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#jw-notes")).toContainText("The word Bearer at the start was ignored.");
    await expect(page.locator("#jw-notes")).toContainText("Spaces and line breaks inside the token were ignored.");
  });

  test("hostile token text is shown as plain text: nothing runs, nothing is created, nothing becomes a link", async ({ page, go }) => {
    await page.addInitScript(() => { window.__pwned = 0; });
    await open(page, go);
    const payload = JSON.stringify({
      sub: "<img src=x onerror=window.__pwned=1>",
      iss: "javascript:window.__pwned=2",
      aud: "<script>window.__pwned=3</script>",
      name: "<a href='https://example.invalid/'>click</a>",
      jti: "'\"><svg onload=window.__pwned=4>",
    });
    await input(page).fill(tok('{"alg":"none","kid":"<b>k</b>"}', payload, ""));
    await btn(page, "Decode").click();
    await expect(results(page)).toBeVisible();
    await expect(page.locator("#jw-claims")).toContainText("<img src=x onerror=window.__pwned=1>");
    await expect(page.locator("#jw-payload")).toContainText("<script>window.__pwned=3</script>");
    await expect(page.locator("#jw-header-fields")).toContainText("<b>k</b>");
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__pwned)).toBe(0);
    expect(await results(page).locator("img, script, svg, a, b, iframe").count()).toBe(0);
    expect(await page.locator('img[src="x"]').count()).toBe(0);
    // an address in a claim is text, not a link
    await expect(page.locator("#jw-claims a")).toHaveCount(0);
  });

  test("control and bidirectional characters are shown as visible escapes, not rendered", async ({ page, go }) => {
    await open(page, go);
    const rlo = String.fromCharCode(0x202e);
    const zwsp = String.fromCharCode(0x200b);
    await input(page).fill(tok(HDR, JSON.stringify({ sub: `evil${rlo}gpj.exe${zwsp}x` })));
    await btn(page, "Decode").click();
    const claimText = await page.locator("#jw-claims").innerText();
    expect(claimText.includes(rlo) || claimText.includes(zwsp)).toBe(false);
    expect(claimText).toContain("evil" + String.fromCharCode(92) + "u202egpj.exe" + String.fromCharCode(92) + "u200bx");
    const payloadText = await page.locator("#jw-payload").innerText();
    expect(payloadText.includes(rlo)).toBe(false);
  });

  test("Copy header and Copy payload copy exactly the decoded JSON on a click; the token and signature are never copied; the clipboard is never read", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      window.__reads = 0;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (t) => { window.__copied.push(t); }, readText: async () => { window.__reads++; return ""; }, read: async () => { window.__reads++; return []; } },
      });
    });
    await open(page, go);
    await btn(page, "Load an example").click();
    const token = await input(page).inputValue();
    await btn(page, "Decode").click();
    await expect(results(page)).toBeVisible();
    expect(await page.evaluate(() => window.__copied)).toEqual([]); // nothing is copied until a click
    await btn(page, "Copy header").click();
    await expect(status(page)).toHaveText("Header copied to the clipboard.");
    await btn(page, "Copy payload").click();
    await expect(status(page)).toHaveText("Payload copied to the clipboard.");
    const copied = await page.evaluate(() => window.__copied);
    expect(copied).toHaveLength(2);
    expect(copied[0]).toBe(await page.locator("#jw-header").textContent());
    expect(copied[1]).toBe(await page.locator("#jw-payload").textContent());
    const [, , signature] = token.split(".");
    for (const text of copied) {
      expect(text.includes(signature)).toBe(false);
      expect(text.includes(token)).toBe(false);
    }
    expect(await page.evaluate(() => window.__reads)).toBe(0);
  });

  test("Clear empties the box, every result and the copy source, and returns focus to the box", async ({ page, go }) => {
    await open(page, go);
    await decodeExample(page);
    await btn(page, "Clear").click();
    await expect(input(page)).toHaveValue("");
    await expect(input(page)).toBeFocused();
    await expect(results(page)).toBeHidden();
    await expect(errorBox(page)).toBeHidden();
    await expect(page.locator("#jw-count")).toHaveText("0 characters");
    await expect(status(page)).toContainText("Cleared");
    // nothing from the token is left in the page, even in hidden parts
    for (const id of ["#jw-header", "#jw-payload", "#jw-claims", "#jw-times", "#jw-structure"]) {
      expect((await page.locator(id).textContent()).trim(), id).toBe("");
    }
    expect(await page.locator("body").innerText()).not.toContain("example-user-001");
    // the same after an error
    await input(page).fill("a.b");
    await btn(page, "Decode").click();
    await btn(page, "Clear").click();
    await expect(errorBox(page)).toBeHidden();
    expect((await page.locator("#jw-error-message").textContent()).trim()).toBe("");
  });

  test("editing after a decode says the results are for the earlier text", async ({ page, go }) => {
    await open(page, go);
    await decodeExample(page);
    await expect(page.locator("#jw-stale")).toBeHidden();
    await input(page).press("End");
    await input(page).pressSequentially("x");
    await expect(page.locator("#jw-stale")).toBeVisible();
    await btn(page, "Decode").click();
    await expect(page.locator("#jw-stale")).toBeHidden();
  });

  test("privacy: no request carries the token, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await page.addInitScript(() => {
      window.__copied = [];
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (t) => { window.__copied.push(t); }, readText: async () => "" } });
    });
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    const secret = "SECRET-CLAIM-VALUE-do-not-send";
    const token = tok(HDR, JSON.stringify({ sub: secret, exp: 1700000000 }));
    await input(page).fill(token);
    await btn(page, "Decode").click();
    await btn(page, "Copy header").click();
    await btn(page, "Copy payload").click();
    await input(page).fill("a.b");
    await btn(page, "Decode").click();
    await btn(page, "Load an example").click();
    await btn(page, "Clear").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).length : 0))).toBe(0);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    for (const part of [...token.split("."), secret]) expect(logs.some((l) => l.includes(part)), "console").toBe(false);
    // the only outside traffic the page ever makes is its font stylesheet
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("keyboard: the example, Decode and Copy work without a mouse, and focus lands on the results", async ({ page, go }) => {
    await open(page, go);
    await input(page).focus();
    await page.keyboard.press("Tab"); // Load an example
    await expect(btn(page, "Load an example")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(btn(page, "Decode")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#jw-results-heading")).toBeFocused();
    await expect(results(page)).toBeVisible();
    await page.keyboard.press("Tab");
    // the first focusable thing after the heading is the header card's Copy button, then the header text, then Copy payload
    await expect(btn(page, "Copy header")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#jw-header")).toBeFocused();
    // visible focus on the main action
    await btn(page, "Decode").focus();
    const outline = await btn(page, "Decode").evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
    expect((outline.style !== "none" && outline.width > 0) || outline.shadow !== "none").toBe(true);
  });

  test("accessibility semantics: labelled box, polite announcements, one h1 in order, named regions and buttons", async ({ page, go }) => {
    await open(page, go);
    await decodeExample(page);
    await expect(page.locator("#jw-live")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#jw-live")).toHaveAttribute("role", "status");
    await expect(page.locator("#jw-status")).not.toHaveAttribute("aria-live", /.+/);
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
    for (const name of ["Decode", "Clear", "Load an example", "Copy header", "Copy payload"]) await expect(btn(page, name)).toHaveCount(1);
    for (const id of ["#jw-header", "#jw-payload"]) await expect(page.locator(id)).toHaveAttribute("tabindex", "0");
    // an unreadable token is announced
    await input(page).fill("a.b");
    await btn(page, "Decode").click();
    await expect(page.locator("#jw-live")).toContainText("Could not read this as a JWT");
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`JWT Decoder at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`long unbroken values wrap: no page-level overflow, readable text and 44px buttons at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      const longValue = "A".repeat(4000);
      const longUrl = "https://example.invalid/" + "segment/".repeat(300);
      const payload = JSON.stringify({ sub: longValue, iss: longUrl, aud: ["x".repeat(500), "y".repeat(500)], exp: 1700000000, big: "z".repeat(8000) });
      await input(page).fill(tok('{"alg":"HS256","kid":"' + "k".repeat(600) + '"}', payload, "s".repeat(1500)));
      await btn(page, "Decode").click();
      await expect(results(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
      // nothing in the results is wider than the viewport
      const wide = await page.locator("#jw-results *").evaluateAll((els, w) => els.filter((e) => e.getBoundingClientRect().right > w + 1).map((e) => e.tagName + "." + e.className), width);
      expect(wide).toEqual([]);
      // the formatted JSON wraps inside its box instead of scrolling sideways
      for (const id of ["#jw-header", "#jw-payload"]) {
        const fits = await page.locator(id).evaluate((e) => e.scrollWidth <= e.clientWidth + 1);
        expect(fits, id).toBe(true);
      }
      const sizes = await page.locator("#jw-claims dd, #jw-payload, .jw-notice, #jw-status-text").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      for (const s of sizes) expect(s).toBeGreaterThanOrEqual(13);
      expect(parseFloat(await input(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(width <= 640 ? 16 : 14);
      for (const name of ["Decode", "Clear", "Copy header", "Copy payload"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
    });

    test(`the error panel and the empty state fit at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await input(page).fill(tok(HDR, '{"a":' + "9".repeat(3000) + "}").replace(/\.[^.]*$/, ".sig"));
      await btn(page, "Decode").click();
      await expectNoHorizontalOverflow(page);
      await input(page).fill(`${b64(HDR)}.${b64("{" + '"k":"' + "v".repeat(5000) + '",}')}.sig`);
      await btn(page, "Decode").click();
      await expect(errorBox(page)).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("JWT Decoder in the Developer Tools section", () => {
  test("it is listed with the other three, links to its page, and its related tools are the JSON Formatter and the Unix converter only", async ({ page, go, siteRoot }) => {
    await go("developer-tools.html");
    const hrefs = await page.locator("a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    for (const id of ["json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder"]) expect(hrefs).toContain(`${siteRoot}tools/${id}/`);
    await expect(page.locator("body")).toContainText("JWT Decoder");
    // the JSON Formatter and Unix converter pages are unchanged: they do not mention the new tool
    for (const id of ["json-formatter", "unix-timestamp-converter"]) {
      await go(`tools/${id}/`);
      await expect(page.locator("main")).not.toContainText("JWT");
    }
    // the JWT page links to both, in its own text
    await go("tools/jwt-decoder/");
    const links = await page.locator("main .calculator-info a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(links).toEqual([`${siteRoot}tools/unix-timestamp-converter/`, `${siteRoot}tools/json-formatter/`]);
  });

  test("global search finds it by its own names", async ({ page, go, siteRoot }) => {
    for (const q of ["jwt decoder", "decode jwt", "jwt payload viewer", "json web token"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/jwt-decoder/']`).first(), q).toBeVisible();
    }
  });
});
