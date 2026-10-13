/**
 * Tool Pack 27: the Base64 Encoder & Decoder page.
 *
 * The unit suite (tests/unit/base64-encoder-decoder.test.mjs) proves the codec against independent vectors; these
 * tests prove the page: both directions, the explicit action and Ctrl/Cmd+Enter, specific refusals with linked errors,
 * the out-of-date marker, Reset, Copy, announcements, privacy, the phone layouts and the tool's place in Developer
 * Tools, search and related links.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const input = (page) => page.locator("#b64-input");
const output = (page) => page.locator("#b64-output");
const status = (page) => page.locator("#b64-status-text");
const live = (page) => page.locator("#b64-live");
const errorMessage = (page) => page.locator("#b64-error-message");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const mode = (page, which) => page.getByRole("radio", { name: which === "encode" ? "Encode text to Base64" : "Decode Base64 to text" });

async function open(page, go) {
  await go("tools/base64-encoder-decoder/");
  await expect(page.locator("#b64-panel")).toHaveAttribute("data-ready", "true");
}

async function run(page, which, text) {
  await mode(page, which).check();
  await input(page).fill(text);
  await btn(page, which === "encode" ? "Encode" : "Decode").click();
}

test.describe("Base64 Encoder & Decoder", () => {
  test("page, breadcrumb, labels, the not-encryption note and the initial state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Base64 Encoder & Decoder");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "Base64 Encoder & Decoder"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}developer-tools.html`]);
    await expect(mode(page, "encode")).toBeChecked();
    await expect(page.getByLabel("Text to encode", { exact: true })).toHaveCount(1);
    await expect(input(page)).toHaveValue("");
    await expect(page.locator(".b64-note")).toContainText("Base64 is an encoding, not encryption");
    await expect(status(page)).toHaveText("Enter text, or choose Load example, then press Encode.");
    await expect(page.locator("#b64-output-wrap")).toBeHidden();
    await expect(btn(page, "Encode")).toBeEnabled();
    expectClean(watch);
  });

  test("encode: the action converts, nothing converts while typing, Ctrl+Enter converts", async ({ page, go }) => {
    await open(page, go);
    await input(page).fill("Hello, World!");
    await expect(page.locator("#b64-output-wrap")).toBeHidden(); // typing never converts
    await btn(page, "Encode").click();
    await expect(output(page)).toHaveText("SGVsbG8sIFdvcmxkIQ==");
    await expect(page.locator("#b64-meta")).toHaveText("13 bytes of UTF-8 became 20 characters of Base64.");
    await expect(status(page)).toHaveText("Encoded.");
    await expect(live(page)).toHaveText("Encoded. 13 bytes of UTF-8 became 20 characters of Base64.");
    await input(page).fill("foobar");
    await input(page).press("Control+Enter");
    await expect(output(page)).toHaveText("Zm9vYmFy");
    await input(page).fill("foob");
    await input(page).press("Enter"); // a plain Enter is a newline, not an action
    await expect(output(page)).toHaveText("Zm9vYmFy");
    await expect(input(page)).toHaveValue("foob\n");
  });

  test("encode: Unicode goes through UTF-8 exactly (accents, other scripts, emoji)", async ({ page, go }) => {
    await open(page, go);
    for (const [text, expected] of [["é€😀", "w6nigqzwn5iA"], ["नमस्ते", "4KSo4KSu4KS44KWN4KSk4KWH"], ["日本語", "5pel5pys6Kqe"]]) {
      await run(page, "encode", text);
      await expect(output(page)).toHaveText(expected);
    }
    await expect(page.locator("#b64-meta")).toHaveText("9 bytes of UTF-8 became 12 characters of Base64."); // 日本語 is 9 bytes
  });

  test("decode: the example, Unicode, missing padding and ignored whitespace, each with its note", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "decode").check();
    await btn(page, "Load example").click();
    await expect(input(page)).toHaveValue("SGVsbG8sIFdvcmxkIQ==");
    await expect(page.locator("#b64-output-wrap")).toBeHidden(); // an example is loaded, not run
    await btn(page, "Decode").click();
    await expect(output(page)).toHaveText("Hello, World!");
    await expect(page.locator("#b64-meta")).toHaveText("Decoded 13 bytes as UTF-8 text.");
    await expect(page.locator("#b64-notes li")).toHaveCount(0);
    await run(page, "decode", "w6nigqzwn5iA");
    await expect(output(page)).toHaveText("é€😀");
    await run(page, "decode", "SGVsbG8sIFdvcmxkIQ");
    await expect(output(page)).toHaveText("Hello, World!");
    await expect(page.locator("#b64-notes li")).toHaveText(["Padding was missing and is assumed."]);
    await run(page, "decode", "SGVs\nbG8s\r\nIFdv cmxkIQ==");
    await expect(output(page)).toHaveText("Hello, World!");
    await expect(page.locator("#b64-notes li")).toHaveText(["3 characters of whitespace were ignored."]); // a text box turns CRLF into LF, so the pasted line break counts once
    await expect(live(page)).toContainText("3 characters of whitespace were ignored.");
  });

  test("the strict refusals: specific message, no result, the box marked invalid and linked to the error", async ({ page, go }) => {
    await open(page, go);
    const cases = [
      ["Zm9v!", /"!" \(U\+0021\) at position 5/],
      ["Zm9v ", /no-break space \(U\+00A0\) at position 5/],
      ["-_8=", /looks like base64url/],
      ["Zg=", /The padding is wrong/],
      ["Z=g=", /at position 2 is followed by more characters/],
      ["Zm9vY", /single character over/],
      ["QR==", /carries extra bits[\s\S]*many other decoders accept it/],
      ["/w==", /1 byte are valid Base64 but not UTF-8 text/],
      ["", /Enter some Base64 to decode/],
    ];
    for (const [text, message] of cases) {
      await run(page, "decode", text);
      await expect(page.locator("#b64-error")).toBeVisible();
      await expect(errorMessage(page)).toHaveText(message);
      await expect(page.locator("#b64-output-wrap")).toBeHidden();
      await expect(input(page)).toHaveAttribute("aria-invalid", "true");
      expect(await input(page).getAttribute("aria-describedby")).toContain("b64-error-message");
      await expect(status(page)).toHaveText("The Base64 could not be decoded.");
      await expect(live(page)).toHaveText(await errorMessage(page).innerText());
    }
    await expect(output(page)).toHaveText("");
    // empty text to encode, and a clean run clears the error state completely
    await run(page, "encode", "");
    await expect(errorMessage(page)).toHaveText("Enter some text to encode.");
    await run(page, "encode", "ok");
    await expect(page.locator("#b64-error")).toBeHidden();
    await expect(input(page)).not.toHaveAttribute("aria-invalid", /.+/);
    expect(await input(page).getAttribute("aria-describedby")).toBe("b64-hint");
  });

  test("the limits are enforced in the page: 1,000,001 bytes to encode, 1,333,337 characters to decode", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "encode").check();
    await input(page).evaluate((el) => { el.value = "a".repeat(1000001); el.dispatchEvent(new Event("input", { bubbles: true })); });
    await btn(page, "Encode").click();
    await expect(errorMessage(page)).toContainText("longer than the limit of 1,000,000 bytes");
    await input(page).evaluate((el) => { el.value = "a".repeat(1000000); el.dispatchEvent(new Event("input", { bubbles: true })); });
    await btn(page, "Encode").click();
    await expect(page.locator("#b64-meta")).toHaveText("1,000,000 bytes of UTF-8 became 1,333,336 characters of Base64.");
    await mode(page, "decode").check();
    await input(page).evaluate((el) => { el.value = "A".repeat(1333337); el.dispatchEvent(new Event("input", { bubbles: true })); });
    await btn(page, "Decode").click();
    await expect(errorMessage(page)).toContainText("over the limit of 1,333,336 characters");
  });

  test("switching direction keeps the text, clears the result and the error, and announces it", async ({ page, go }) => {
    await open(page, go);
    await run(page, "encode", "foobar");
    await expect(output(page)).toHaveText("Zm9vYmFy");
    await mode(page, "decode").check();
    await expect(input(page)).toHaveValue("foobar");
    await expect(page.locator("#b64-output-wrap")).toBeHidden();
    await expect(page.getByLabel("Base64 to decode", { exact: true })).toHaveCount(1);
    await expect(btn(page, "Decode")).toBeVisible();
    await expect(page.locator("#b64-hint")).toContainText("the check is strict otherwise");
    await expect(live(page)).toHaveText("Decode Base64 to text selected.");
    await btn(page, "Decode").click(); // "foobar" is 6 characters: 6 % 4 = 2, but the last character carries bits
    await expect(page.locator("#b64-error")).toBeVisible();
    await mode(page, "encode").check();
    await expect(page.locator("#b64-error")).toBeHidden();
  });

  test("editing after a result marks it out of date until the action runs again", async ({ page, go }) => {
    await open(page, go);
    await run(page, "encode", "foo");
    await expect(page.locator("#b64-stale")).toBeHidden();
    await input(page).fill("fooo");
    await expect(page.locator("#b64-stale")).toBeVisible();
    await expect(output(page)).toHaveText("Zm9v"); // the earlier result stays, labelled
    await input(page).fill("foo");
    await expect(page.locator("#b64-stale")).toBeHidden(); // back to what was shown
    await input(page).fill("fooo");
    await btn(page, "Encode").click();
    await expect(page.locator("#b64-stale")).toBeHidden();
    await expect(output(page)).toHaveText("Zm9vbw==");
  });

  test("Reset empties the box, the result and the error, returns to Encode and focuses the box", async ({ page, go }) => {
    await open(page, go);
    await run(page, "decode", "Zm9v!");
    await btn(page, "Reset").click();
    await expect(mode(page, "encode")).toBeChecked();
    await expect(input(page)).toHaveValue("");
    await expect(input(page)).toBeFocused();
    await expect(page.locator("#b64-error")).toBeHidden();
    await expect(page.locator("#b64-output-wrap")).toBeHidden();
    await expect(live(page)).toHaveText("Reset.");
    await expect(page.locator("#b64-count")).toHaveText("0 characters");
    await expect(btn(page, "Encode")).toBeVisible();
  });

  test("Copy result copies exactly the result shown, only on a click, never reads the clipboard, and says when it cannot", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__copied = [];
      window.__reads = 0;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (t) => { window.__copied.push(t); }, readText: async () => { window.__reads++; return ""; }, read: async () => { window.__reads++; return []; } },
      });
    });
    await open(page, go);
    await expect(btn(page, "Copy result")).toBeHidden(); // no result, nothing to copy
    await run(page, "encode", "é€😀");
    expect(await page.evaluate(() => window.__copied)).toEqual([]);
    await btn(page, "Copy result").click();
    await expect(live(page)).toHaveText("Result copied to the clipboard.");
    await run(page, "decode", "w6nigqzwn5iA");
    await btn(page, "Copy result").click();
    expect(await page.evaluate(() => window.__copied)).toEqual(["w6nigqzwn5iA", "é€😀"]);
    expect(await page.evaluate(() => window.__reads)).toBe(0);
    // a clipboard that refuses: the page says so and does not pretend
    await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }); document.execCommand = () => false; });
    await btn(page, "Copy result").click();
    await expect(live(page)).toHaveText("Could not copy automatically. Select the result and copy it yourself.");
  });

  test("privacy: no request carries the text, nothing is stored, the address and title never change, nothing is logged", async ({ page, go, watch }) => {
    const requests = [];
    const logs = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon"].includes(r.resourceType()) || r.method() !== "GET") requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    page.on("console", (m) => logs.push(m.text()));
    await open(page, go);
    const url = page.url();
    const title = await page.title();
    await run(page, "encode", "correct horse battery staple 4137");
    await run(page, "decode", "Zm9v!");
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expect(await page.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).length : 0))).toBe(0);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(page.url()).toBe(url);
    expect(await page.title()).toBe(title);
    for (const part of ["horse", "4137", "Zm9v"]) expect(logs.some((l) => l.includes(part)), `console ${part}`).toBe(false);
    expect(watch.external.every((e) => e.includes("fonts.g"))).toBe(true);
    expectClean(watch);
  });

  test("hostile input is shown as text, never as markup", async ({ page, go }) => {
    await open(page, go);
    await run(page, "encode", "<img src=x onerror=window.__pwned=1>");
    await expect(output(page)).toHaveText("PGltZyBzcmM9eCBvbmVycm9yPXdpbmRvdy5fX3B3bmVkPTE+");
    await run(page, "decode", "PGltZyBzcmM9eCBvbmVycm9yPXdpbmRvdy5fX3B3bmVkPTE+");
    await expect(output(page)).toHaveText("<img src=x onerror=window.__pwned=1>");
    await expect(page.locator("#b64-output img")).toHaveCount(0);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    await run(page, "decode", "<b>x</b>");
    await expect(errorMessage(page)).toContainText('"<" (U+003C) at position 1');
    await expect(page.locator("#b64-error b")).toHaveCount(0);
  });

  test("keyboard and accessibility: arrow keys on the direction, labelled controls, a polite live region, visible focus, heading order", async ({ page, go }) => {
    await open(page, go);
    await mode(page, "encode").focus();
    await page.keyboard.press("ArrowRight");
    await expect(mode(page, "decode")).toBeChecked();
    await page.keyboard.press("ArrowLeft");
    await expect(mode(page, "encode")).toBeChecked();
    await expect(page.locator("#b64-live")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#b64-live")).toHaveAttribute("role", "status");
    await expect(page.getByRole("group", { name: "Direction" })).toHaveCount(1);
    await page.keyboard.press("Shift");
    for (const name of ["Encode", "Load example", "Reset"]) {
      await btn(page, name).focus();
      const o = await btn(page, name).evaluate((e) => { const s = getComputedStyle(e); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow }; });
      expect((o.style !== "none" && o.width > 0) || o.shadow !== "none", `${name} focus ring`).toBe(true);
    }
    await run(page, "encode", "abc");
    await page.keyboard.press("Shift"); // keyboard modality, so :focus-visible applies to the programmatic focus
    await output(page).focus();
    expect(await output(page).evaluate((e) => getComputedStyle(e).outlineStyle !== "none")).toBe(true);
    await expect(page.getByRole("region")).toHaveCount(0); // the result is a labelled, focusable block, not a landmark flood
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((l) => l.map((h) => Number(h.tagName[1])));
    expect(levels.filter((n) => n === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading order ${levels}`).toBeLessThanOrEqual(1);
  });

  test("the static explanation: not encryption, the strict rules, the related tools linked from the text, the FAQ", async ({ page, go, siteRoot }) => {
    await open(page, go);
    const info = page.locator("main .calculator-info");
    await expect(info.filter({ hasText: "What Base64 Is and Is Not" })).toContainText("not encryption");
    await expect(info.filter({ hasText: "How This Tool Reads Your Input" })).toContainText("QR==");
    await expect(info.filter({ hasText: "How This Tool Reads Your Input" })).toContainText("some decoders");
    const links = await page.locator("main .calculator-info a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(links).toEqual([`${siteRoot}tools/jwt-decoder/`, `${siteRoot}tools/json-formatter/`]);
    expect(await page.locator("main .calculator-info details").count()).toBe(5);
  });
});

for (const width of [320, 360, 390]) {
  test.describe(`Base64 Encoder & Decoder at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test(`a 100,000-character input, a long result and an error fit: no page-level overflow, 44px targets, 16px text at ${width}px`, async ({ page, go }) => {
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await input(page).evaluate((el) => { el.value = "Ab€😀 ".repeat(20000); el.dispatchEvent(new Event("input", { bubbles: true })); });
      await btn(page, "Encode").click();
      await expect(page.locator("#b64-meta")).toContainText("became");
      await expectNoHorizontalOverflow(page);
      expect(await output(page).evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true); // wraps; never scrolls sideways
      await run(page, "decode", "Zm9v!" + "A".repeat(200));
      await expect(page.locator("#b64-error")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      for (const name of ["Decode", "Load example", "Reset"]) {
        const box = await btn(page, name).boundingBox();
        expect(box.height, name).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, name).toBeLessThanOrEqual(width);
      }
      for (const which of ["encode", "decode"]) {
        const box = await mode(page, which).locator("xpath=..").boundingBox();
        expect(box.height, which).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, which).toBeLessThanOrEqual(width);
      }
      expect(parseFloat(await input(page).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
    });
  });
}

test.describe("Base64 Encoder & Decoder with larger text", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("text enlarged to 200%: the form and the result still fit and the buttons are not clipped", async ({ page, go }) => {
    await open(page, go);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expectNoHorizontalOverflow(page);
    await run(page, "encode", "Hello, World!");
    await expectNoHorizontalOverflow(page);
    for (const name of ["Encode", "Load example", "Reset"]) {
      const box = await btn(page, name).boundingBox();
      expect(box.height, name).toBeGreaterThanOrEqual(44);
      expect(box.x + box.width, name).toBeLessThanOrEqual(390);
    }
  });
});

test.describe("Base64 Encoder & Decoder in Developer Tools, search and related links", () => {
  test("it is listed with the other tools, the older pages do not mention it, and its links lead to the JWT Decoder and JSON Formatter", async ({ page, go, siteRoot }) => {
    await go("developer-tools.html");
    const hrefs = await page.locator("a[href*='/tools/']").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    for (const id of ["json-formatter", "unix-timestamp-converter", "text-diff", "jwt-decoder", "cron-expression-explainer", "base64-encoder-decoder"]) expect(hrefs).toContain(`${siteRoot}tools/${id}/`);
    await go("tools.html");
    await expect(page.locator(`.directory-section a[href$="tools/base64-encoder-decoder/"]`)).toHaveCount(1);
    await go("calculators.html");
    await expect(page.locator(`a[href*="base64"]`)).toHaveCount(0); // not a calculator
    for (const id of ["jwt-decoder", "json-formatter"]) {
      await go(`tools/${id}/`);
      await expect(page.locator("main")).not.toContainText("Base64 Encoder"); // one-way: the older pages are unchanged
    }
    await go("tools/base64-encoder-decoder/");
    await page.locator("main .calculator-info a", { hasText: "JWT Decoder" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools/jwt-decoder/`);
  });

  test("global search finds it by its own names", async ({ page, go, siteRoot }) => {
    for (const q of ["base64", "base64 decode", "text to base64", "base64 encoder", "base64 converter"]) {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      await expect(page.locator(`a[href='${siteRoot}tools/base64-encoder-decoder/']`).first(), q).toBeVisible();
    }
  });

  test("a direct visit and a refresh both load the page, and a refresh clears the box and the result", async ({ page, go }) => {
    await open(page, go);
    await run(page, "encode", "foo");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#b64-panel")).toHaveAttribute("data-ready", "true");
    await expect(input(page)).toHaveValue("");
    await expect(page.locator("#b64-output-wrap")).toBeHidden();
    expect(page.url()).toMatch(/\/tools\/base64-encoder-decoder\/$/);
  });
});
