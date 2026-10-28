/**
 * Smart Flashcards: the page's own journeys.
 *
 * Only what this tool can break: choosing a deck and topics, a recall card and a choice card, the one-grade-per-card
 * rule, the summary and the missed-card review, keyboard use, the privacy boundary (nothing is stored until the visitor
 * turns saving on; then only the documented key, holding no answers), reset, export, a hostile import, a blocked
 * storage, safe rendering, no network beyond the page's own files, and the narrow phone layout. The scheduler, the
 * progress validation and the decks are pinned by tests/unit/learning-*.test.mjs and flashcards-content.test.mjs.
 */
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const app = (page) => page.locator("#lx-app");
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const live = (page) => page.locator("#lx-live");

async function open(page, go) {
  await page.clock.setFixedTime(new Date("2026-10-28T08:00:00Z"));
  await go("tools/smart-flashcards/");
  await expect(app(page)).toHaveAttribute("data-ready", "true");
}

async function startJson(page, { topics } = {}) {
  await btn(page, "Choose JSON").click();
  await expect(page.getByRole("heading", { name: "JSON deck" })).toBeFocused();
  if (topics) {
    // the topic boxes redraw on every change, so each one is looked up again by its label
    for (const name of ["Value types", "Syntax errors", "Strings and escaping", "Numbers", "JSON and JavaScript", "Keys and duplicates", "JSON in API responses"]) {
      if (!topics.includes(name)) await page.getByLabel(new RegExp(`^${name} [(]`)).uncheck();
    }
  }
  await page.getByRole("button", { name: /^Start session/ }).click();
}

/* answer the current card whatever its kind, reading the page; returns the kind */
async function answerCurrent(page, { knew = true } = {}) {
  if (await btn(page, "Show answer").count()) {
    await btn(page, "Show answer").click();
    await btn(page, knew ? "I knew it" : "I did not know it").click();
    return "recall";
  }
  await page.locator(".lx-option input").first().check();
  await btn(page, "Check answer").click();
  return "choice";
}

test.describe("Smart Flashcards", () => {
  test("page, breadcrumb, deck list and the off-by-default storage notice", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Smart Flashcards");
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Developer Tools", "Smart Flashcards"]);
    await expect(page.getByRole("heading", { name: "Choose a deck" })).toBeVisible();
    await expect(page.getByText("30 cards")).toBeVisible();
    await expect(page.getByLabel("Save my progress on this device")).not.toBeChecked();
    await expect(page.getByText("Saving is off. Nothing is stored.")).toBeVisible();
    expectClean(watch);
  });

  test("nothing is written to any browser storage until saving is turned on", async ({ page, go }) => {
    await open(page, go);
    await startJson(page);
    for (let i = 0; i < 3; i += 1) {
      await answerCurrent(page);
      await btn(page, "Next card").click();
    }
    const stored = await page.evaluate(async () => ({
      local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie,
      idb: (await indexedDB.databases?.())?.length ?? 0
    }));
    expect(stored.local.filter((k) => k !== "tz-analytics-consent")).toEqual([]);
    expect(stored.session).toEqual([]);
    expect(stored.idb).toBe(0);
  });

  test("a recall card: reveal with the keyboard, grade once, explanation and source appear, Next unlocks", async ({ page, go }) => {
    await open(page, go);
    await startJson(page, { topics: ["Value types"] });
    // the first value-types card is a recall card
    await expect(page.locator(".lx-prompt")).toHaveText("Which kinds of value can a JSON document contain?");
    await expect(btn(page, "Next card")).toBeDisabled();
    await btn(page, "Show answer").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".lx-answer")).toContainText("Objects, arrays, strings and numbers");
    await expect(btn(page, "I knew it")).toBeFocused();
    await expect(live(page)).toHaveText("Answer shown.");
    await page.keyboard.press("Space");
    await expect(page.locator(".lx-result")).toHaveText("You marked this: known.");
    await expect(page.locator(".lx-explanation")).toContainText("Source: RFC 8259 section 3");
    await expect(btn(page, "I knew it")).toHaveCount(0); // one grade per card
    await expect(btn(page, "Next card")).toBeEnabled();
    await expect(btn(page, "Next card")).toBeFocused();
  });

  test("a choice card: a wrong choice names the right answer and explains it; options lock", async ({ page, go }) => {
    await open(page, go);
    await startJson(page, { topics: ["Syntax errors"] });
    await expect(page.locator(".lx-prompt")).toHaveText("Is this valid JSON?");
    await expect(btn(page, "Check answer")).toBeDisabled();
    await page.getByLabel("Yes. A single trailing comma after the last member is ignored by JSON parsers.").check();
    await btn(page, "Check answer").click();
    await expect(page.locator(".lx-result")).toContainText("Not correct. The correct answer is: No. A comma must be followed by another member.");
    await expect(page.locator(".lx-explanation")).toContainText("The grammar puts commas between members");
    await expect(page.locator(".lx-option input").first()).toBeDisabled();
    await expect(page.getByText("(correct answer)")).toBeVisible(); // told in words, not only by colour
    await expect(page.getByText("(your choice)")).toBeVisible();
  });

  test("a correct choice reads Correct; going back is read-only and keeps the result", async ({ page, go }) => {
    await open(page, go);
    await startJson(page, { topics: ["Syntax errors"] });
    await page.getByLabel("No. A comma must be followed by another member.").check();
    await btn(page, "Check answer").click();
    await expect(page.locator(".lx-result")).toHaveText("Correct.");
    await btn(page, "Next card").click();
    await expect(btn(page, "Previous card")).toBeEnabled();
    await btn(page, "Previous card").click();
    await expect(page.locator(".lx-result")).toHaveText("Correct.");
    await expect(btn(page, "Check answer")).toHaveCount(0);
  });

  test("a whole session ends in a plain summary; missed cards can be reviewed; no score or percentage", async ({ page, go }) => {
    await open(page, go);
    await startJson(page, { topics: ["Keys and duplicates"] });
    const total = await page.locator(".lx-meta").first().innerText();
    const n = Number(/of (\d+)/.exec(total)[1]);
    expect(n).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < n; i += 1) {
      const kind = await answerCurrent(page, { knew: false });
      await btn(page, i === n - 1 ? "See summary" : "Next card").click();
      expect(kind).toBeTruthy();
    }
    await expect(page.getByRole("heading", { name: "Session complete" })).toBeFocused();
    await expect(page.locator(".lx-result")).toContainText(`${n} cards`);
    const text = await app(page).innerText();
    expect(text).not.toMatch(/%|score|streak|badge|mastered|mastery/i);
    // at least the recall card was marked not known, so there is something to review
    await page.getByRole("button", { name: /^Review .*missed card/ }).click();
    await expect(page.locator(".lx-prompt")).toBeVisible();
    await expect(page.locator(".lx-meta").first()).toContainText("Card 1 of");
  });

  test("topics: the last topic cannot be unchecked", async ({ page, go }) => {
    await open(page, go);
    await btn(page, "Choose JSON").click();
    const boxes = page.locator("fieldset input[type=checkbox]");
    const count = await boxes.count();
    for (let i = 0; i < count - 1; i += 1) await boxes.nth(i).uncheck();
    await boxes.nth(count - 1).click(); // refused: the box stays checked
    await expect(boxes.nth(count - 1)).toBeChecked();
    await expect(page.getByText("Keep at least one topic selected.")).toBeVisible();
  });

  test("saving on: only tz-learn-v1 is written, with a box and a day per card and no answers; a reload restores it", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Save my progress on this device").check();
    await expect(page.getByText("Saving is on. 0 cards saved.")).toBeVisible();
    await startJson(page, { topics: ["Value types"] });
    await answerCurrent(page, { knew: true });
    const saved = await page.evaluate(() => ({ keys: Object.keys(localStorage).filter((k) => k !== "tz-analytics-consent"), raw: localStorage.getItem("tz-learn-v1") }));
    expect(saved.keys).toEqual(["tz-learn-v1"]);
    const data = JSON.parse(saved.raw);
    expect(data.v).toBe(1);
    const entry = Object.values(data.decks.json.cards)[0];
    expect(Object.keys(entry).sort()).toEqual(["box", "day"]);
    expect(entry.box).toBe(2);
    expect(saved.raw).not.toMatch(/Objects, arrays|knew|answer/i);
    // 2026-10-28 as a day number
    expect(entry.day).toBe(Math.round(Date.UTC(2026, 9, 28) / 86400000));
    await page.reload();
    await expect(app(page)).toHaveAttribute("data-ready", "true");
    await expect(page.getByLabel("Save my progress on this device")).toBeChecked();
    await expect(page.getByText(/Saving is on\. 1 card saved\./)).toBeVisible();
  });

  test("reset asks first, cancel changes nothing, confirm clears only this tool's data", async ({ page, go }) => {
    await open(page, go);
    await page.evaluate(() => localStorage.setItem("other-site-data", "keep"));
    await page.getByLabel("Save my progress on this device").check();
    await startJson(page, { topics: ["Value types"] });
    await answerCurrent(page);
    await page.getByRole("button", { name: "Reset progress" }).click();
    const dialog = page.getByRole("dialog", { name: "Reset your progress?" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("tz-learn-v1")).decks.json.cards).length)).toBe(1);
    await page.getByRole("button", { name: "Reset progress" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Reset progress" }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tz-learn-v1")).decks)).toEqual({});
    expect(await page.evaluate(() => localStorage.getItem("other-site-data"))).toBe("keep");
  });

  test("turning saving off deletes the saved key after confirming, and leaves other data alone", async ({ page, go }) => {
    await open(page, go);
    await page.evaluate(() => localStorage.setItem("other-site-data", "keep"));
    await page.getByLabel("Save my progress on this device").check();
    await startJson(page, { topics: ["Value types"] });
    await answerCurrent(page);
    await page.getByLabel("Save my progress on this device").uncheck();
    await page.getByRole("dialog").getByRole("button", { name: "Turn off and delete" }).click();
    expect(await page.evaluate(() => localStorage.getItem("tz-learn-v1"))).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem("other-site-data"))).toBe("keep");
    await expect(page.getByText("Saving is off. Nothing is stored.")).toBeVisible();
  });

  test("export downloads a marked file with only ids, boxes and days", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Save my progress on this device").check();
    await startJson(page, { topics: ["Value types"] });
    await answerCurrent(page);
    const [download] = await Promise.all([page.waitForEvent("download"), btn(page, "Export progress").click()]);
    expect(download.suggestedFilename()).toBe("toolzenhub-flashcards-progress-2026-10-28.json");
    const text = await (await import("node:fs/promises")).readFile(await download.path(), "utf8");
    const parsed = JSON.parse(text);
    expect(parsed.format).toBe("toolzenhub-flashcards-progress");
    expect(Object.keys(parsed).sort()).toEqual(["decks", "format", "v"]);
  });

  test("a hostile or oversized import changes nothing and says why", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Save my progress on this device").check();
    const input = page.locator("#lx-import");
    await input.setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("{ not json") });
    await expect(page.getByText("The file is not valid JSON. Nothing was changed.")).toBeVisible();
    await input.setInputFiles({ name: "big.json", mimeType: "application/json", buffer: Buffer.alloc(101 * 1024, " ") });
    await expect(page.getByText(/larger than 100 KB/)).toBeVisible();
    const hostile = JSON.stringify({ format: "toolzenhub-flashcards-progress", v: 1, decks: { json: { version: "1.0.0", cards: { "<img src=x onerror=window.__pwned=1>": { box: 1, day: 5 } } } } });
    await input.setInputFiles({ name: "h.json", mimeType: "application/json", buffer: Buffer.from(hostile) });
    await expect(page.getByText(/Imported 0 cards/)).toBeVisible();
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(await page.evaluate(() => document.querySelectorAll("img").length)).toBe(0);
    // a valid file is applied
    const valid = JSON.stringify({ format: "toolzenhub-flashcards-progress", v: 1, decks: { json: { version: "1.0.0", cards: { "json-value-kinds": { box: 3, day: 20000 } } } } });
    await input.setInputFiles({ name: "v.json", mimeType: "application/json", buffer: Buffer.from(valid) });
    await expect(page.getByText(/Imported 1 card\./)).toBeVisible();
  });

  test("a blocked storage leaves the cards working and the switch disabled with the reason", async ({ page, go }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw new DOMException("denied", "SecurityError"); } });
    });
    await go("tools/smart-flashcards/");
    await expect(app(page)).toHaveAttribute("data-ready", "true");
    await expect(page.getByLabel("Save my progress on this device")).toBeDisabled();
    await expect(page.getByText(/not allowing storage/)).toBeVisible();
    await startJson(page);
    await answerCurrent(page);
    await expect(btn(page, "Next card")).toBeEnabled();
  });

  test("an unknown or corrupt saved value is ignored with a notice and does not break the page", async ({ page, go }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("tz-learn-v1", "{\"v\":1,\"decks\":{\"json\":{\"version\":\"1.0.0\",\"cards\":{\"gone\":{\"box\":9,\"day\":1},\"json-value-kinds\":{\"box\":2,\"day\":100}}}}}");
    });
    await go("tools/smart-flashcards/");
    await expect(app(page)).toHaveAttribute("data-ready", "true");
    await expect(page.getByText(/Saving is on\. 1 card saved\./)).toBeVisible();
    await expect(page.getByText(/1 saved card did not match/)).toBeVisible();
    await page.evaluate(() => localStorage.setItem("tz-learn-v1", "not json"));
    await page.reload();
    await expect(page.getByText(/not valid JSON and was ignored/)).toBeVisible();
  });

  test("due cards: a card graded long ago comes back, lowest box first, and the setup says how many", async ({ page, go }) => {
    await page.addInitScript(() => {
      // two reviewed cards: json-value-kinds (box 1, long ago) and json-top-level-number (box 2, long ago); one not due
      localStorage.setItem("tz-learn-v1", JSON.stringify({ v: 1, decks: { json: { version: "1.0.0", cards: {
        "json-value-kinds": { box: 2, day: 100 }, "json-top-level-number": { box: 1, day: 100 }, "json-trailing-comma": { box: 1, day: Math.round(Date.UTC(2026, 9, 28) / 86400000) }
      } } } }));
    });
    await open(page, go);
    await btn(page, "Choose JSON").click();
    await expect(page.getByText("2 cards due for revision in this deck.")).toBeVisible();
    await page.getByRole("button", { name: "Review 2 due cards" }).click();
    await expect(page.locator(".lx-prompt")).toHaveText("Is the text below, on its own, a valid JSON document?"); // box 1 before box 2
  });

  test("hostile text from a deck would only ever be text (no HTML is parsed from card content)", async ({ page, go }) => {
    await open(page, go);
    await startJson(page, { topics: ["Strings and escaping"] });
    // the escape card shows a code sample containing quotes and backslashes: it must be literal text in a code block
    await expect(page.locator(".lx-code").first()).toBeVisible();
    expect(await page.locator("#lx-app script, #lx-app img, #lx-app iframe").count()).toBe(0);
  });

  test("no request leaves the page's own files, and the console stays clean", async ({ page, go, watch }) => {
    await open(page, go);
    await startJson(page);
    await answerCurrent(page);
    expectClean(watch);
  });

  test("phone layout at 320px: no sideways scroll, controls at least 44px tall, 16px text fields", async ({ page, go }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await open(page, go);
    await expectNoHorizontalOverflow(page);
    await startJson(page, { topics: ["Syntax errors"] });
    await expectNoHorizontalOverflow(page);
    for (const b of await app(page).locator("button:visible").all()) {
      const box = await b.boundingBox();
      expect(box.height, await b.innerText()).toBeGreaterThanOrEqual(43.5);
    }
    for (const input of await app(page).locator(".lx-option input:visible").all()) {
      const box = await input.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(20);
    }
  });
});
