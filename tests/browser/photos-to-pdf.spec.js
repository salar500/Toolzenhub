/**
 * Tool Pack 31: Photos to PDF (Image Tools).
 *
 * Focused on what a browser can break that the unit tests cannot see: the real flow (choose, order,
 * create, download) on small synthetic fixtures; the redraw path (PNG, WebP, a JPEG turned by EXIF, CMYK) in
 * a real decoder; refusal of unsupported files; stale results; Reset; object URL cleanup; keyboard use and the
 * accessible names; no external request; and three phone widths. The downloaded file is read back with the
 * strict reader in tests/helpers/pdf-structure.mjs, which knows nothing about the tool.
 * The rules and the PDF writer are covered by tests/unit/photos-to-pdf.test.mjs.
 *
 * NOT covered here: any physical phone, Safari/WebKit and Firefox (spec section 15: unverified).
 */
import fs from "node:fs";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { parsePdf } from "../helpers/pdf-structure.mjs";

const fixtures = JSON.parse(fs.readFileSync("tests/fixtures/photos-to-pdf-fixtures.json", "utf8")).items;
const fx = (name) => fixtures.find((f) => f.name === name);
const MIME = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", unknown: "application/octet-stream" };
const file = (name) => ({ name: `${name}.${fx(name).format === "jpeg" ? "jpg" : fx(name).format === "unknown" ? "txt" : fx(name).format}`, mimeType: MIME[fx(name).format], buffer: Buffer.from(fx(name).base64, "base64") });

const panel = (page) => page.locator("#pp-panel");
const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);
const items = (page) => page.locator("#pp-list > li");
const names = (page) => page.locator("#pp-list .pp-item__name").allTextContents();

async function open(page, go) {
  await go("tools/photos-to-pdf/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function choose(page, ...list) {
  await page.locator("#pp-file").setInputFiles(list.map(file));
}

async function download(page) {
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#pp-download").click()]);
  return { name: d.suggestedFilename(), bytes: new Uint8Array(fs.readFileSync(await d.path())) };
}

async function createAndRead(page) {
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await state(page, "done");
  return download(page);
}

test.describe("Photos to PDF", () => {

  test("page, breadcrumb, labels and the empty state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Photos to PDF");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Image Tools", "Photos to PDF"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}image-tools.html`]);
    await expect(page.locator("main")).not.toContainText(/lossless|no quality loss|zero quality loss|best|AI-powered|guaranteed|100% private/i);
    await state(page, "empty");
    await expect(page.locator("#pp-empty")).toBeVisible();
    await expect(page.locator("#pp-list")).toBeHidden();
    await expect(page.getByLabel("Add JPEG, PNG or WebP photos")).toBeVisible();
    await expect(page.getByLabel("Page size")).toHaveValue("a4");
    await expect(page.getByLabel("Page direction")).toHaveValue("auto");
    await expect(page.getByLabel("Margin")).toHaveValue("small");
    await expect(page.getByRole("button", { name: "Create PDF", exact: true })).toBeDisabled();
    await expect(page.locator("#pp-create-hint")).toContainText("Add at least one photo");
    await expect(page.locator("#pp-cancel")).toBeHidden();
    expect(page.url()).toContain(`${siteRoot}tools/photos-to-pdf/`);
    expectClean(watch);
  });

  test("choose, reorder and remove: the list, the page numbers and the announcements", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "rgb-baseline", "rgb-progressive", "gray-baseline");
    await state(page, "ready");
    await expect(items(page)).toHaveCount(3);
    expect(await names(page)).toEqual(["rgb-baseline.jpg", "rgb-progressive.jpg", "gray-baseline.jpg"]);
    await expect(page.locator("#pp-summary")).toContainText("3 photos");
    await expect(page.locator("#pp-list .pp-item__meta").first()).toContainText("Page 1 of 3");
    await expect(page.locator("#pp-list canvas")).toHaveCount(3);

    // the first Move up and the last Move down are inert and say so
    await expect(items(page).first().getByRole("button", { name: /^Move up/ })).toHaveAttribute("aria-disabled", "true");
    await expect(items(page).last().getByRole("button", { name: /^Move down/ })).toHaveAttribute("aria-disabled", "true");

    await items(page).nth(2).getByRole("button", { name: "Move up: gray-baseline.jpg" }).click();
    expect(await names(page)).toEqual(["rgb-baseline.jpg", "gray-baseline.jpg", "rgb-progressive.jpg"]);
    await expect(page.locator("#pp-live")).toContainText("gray-baseline.jpg is now photo 2 of 3");
    // focus stays on the control that was used, so repeated presses keep working
    await expect(page.getByRole("button", { name: "Move up: gray-baseline.jpg" })).toBeFocused();

    await page.getByRole("button", { name: "Remove: rgb-baseline.jpg" }).click();
    expect(await names(page)).toEqual(["gray-baseline.jpg", "rgb-progressive.jpg"]);
    await expect(page.locator("#pp-live")).toContainText("rgb-baseline.jpg removed. 2 photos left.");
    await expect(page.locator("#pp-list .pp-item__meta").first()).toContainText("Page 1 of 2");

    // more photos can be added later and go at the end
    await choose(page, "exif-turn-1");
    await expect(items(page)).toHaveCount(3);
    expect((await names(page))[2]).toBe("exif-turn-1.jpg");
  });

  test("the whole flow by keyboard: Tab to a control, Space or Enter to use it", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "rgb-baseline", "gray-baseline");
    await state(page, "ready");
    await page.getByRole("button", { name: "Move down: rgb-baseline.jpg" }).focus();
    await page.keyboard.press("Enter");
    expect(await names(page)).toEqual(["gray-baseline.jpg", "rgb-baseline.jpg"]);
    await page.getByRole("button", { name: "Create PDF", exact: true }).focus();
    await page.keyboard.press("Space");
    await state(page, "done");
    await expect(page.locator("#pp-result-title")).toBeFocused();
    await expect(page.locator("#pp-download")).toHaveAttribute("href", /^blob:/);
  });

  test("the PDF has the pages in the list order, the original JPEG bytes and the chosen page settings", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "rgb-baseline", "rgb-progressive", "gray-baseline");
    await state(page, "ready");
    await page.getByRole("button", { name: "Move up: gray-baseline.jpg" }).click();
    await page.getByRole("button", { name: "Move up: gray-baseline.jpg" }).click();
    await page.getByLabel("Page size").selectOption("letter");
    await page.getByLabel("Page direction").selectOption("portrait");
    await page.getByLabel("Margin").selectOption("none");

    const out = await createAndRead(page);
    const pdf = parsePdf(out.bytes);
    const order = ["gray-baseline", "rgb-baseline", "rgb-progressive"];

    expect(out.name).toBe("photos.pdf");
    expect(pdf.pages).toHaveLength(3);
    expect(pdf.pages.map((p) => p.image.width)).toEqual(order.map((n) => fx(n).width));
    expect(pdf.pages.map((p) => p.image.sha256), "kept JPEGs are embedded unchanged").toEqual(order.map((n) => fx(n).sha256));
    for (const p of pdf.pages) {
      expect(p.mediaBox[0]).toBeCloseTo(612, 1);
      expect(p.mediaBox[1]).toBeCloseTo(792, 1);
    }
    expect(pdf.hasProducer || pdf.hasCreationDate || pdf.mentionsLibrary).toBe(false);
    await expect(page.locator("#pp-result-summary")).toContainText("3 pages");
  });

  test("PNG, WebP, a JPEG turned by EXIF and a CMYK JPEG are redrawn upright as JPEG; the rest stays unchanged", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "png-rgba", "webp", "exif-turn-6", "cmyk", "rgb-baseline");
    await state(page, "ready");
    await expect(items(page)).toHaveCount(5);
    const out = await createAndRead(page);
    const pdf = parsePdf(out.bytes);

    expect(pdf.pages).toHaveLength(5);
    expect(pdf.pages.every((p) => p.image.filter === "DCTDecode")).toBe(true);
    expect(pdf.pages.map((p) => [p.image.width, p.image.height])).toEqual([[52, 30], [44, 44], [50, 80], [40, 40], [64, 40]]); // the EXIF turn (80 x 50) is applied: 50 x 80
    expect(pdf.pages[4].image.sha256).toBe(fx("rgb-baseline").sha256);
    await expect(page.locator("#pp-result-summary")).toContainText("4 photos were saved again as JPEG");
  });

  test("unsupported, empty and broken files are refused by name with a reason and the good ones are kept", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "gif", "not-an-image", "truncated-jpeg", "rgb-baseline");
    await expect(items(page)).toHaveCount(1);
    expect(await names(page)).toEqual(["rgb-baseline.jpg"]);
    const message = await page.locator("#pp-error").innerText();
    expect(message).toContain("gif.gif");
    expect(message).toContain("GIF");
    expect(message).toContain("not-an-image.txt");
    expect(message).toContain("truncated-jpeg.jpg");
    await expect(page.locator("#pp-error")).toHaveAttribute("role", "alert");
    // an empty file
    await page.locator("#pp-file").setInputFiles({ name: "empty.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(0) });
    await expect(page.locator("#pp-error")).toContainText("empty.jpg");
    await expect(items(page)).toHaveCount(1);
  });

  test("a change after the PDF exists removes it, revokes its address and says so", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__urls = { made: [], revoked: [] };
      const make = URL.createObjectURL.bind(URL);
      const revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (o) => { const u = make(o); window.__urls.made.push(u); return u; };
      URL.revokeObjectURL = (u) => { window.__urls.revoked.push(u); return revoke(u); };
    });
    await open(page, go);
    await choose(page, "rgb-baseline", "gray-baseline");
    await state(page, "ready");
    await page.getByRole("button", { name: "Create PDF", exact: true }).click();
    await state(page, "done");
    const first = await page.locator("#pp-download").getAttribute("href");

    await page.getByLabel("Margin").selectOption("medium");
    await state(page, "ready");
    await expect(page.locator("#pp-result")).toBeHidden();
    await expect(page.locator("#pp-live")).toContainText("The PDF was removed");
    expect(await page.evaluate(() => window.__urls.revoked)).toContain(first);

    // again, then Reset: every address ever made is revoked at the end, and nothing is left in the page
    await page.getByRole("button", { name: "Create PDF", exact: true }).click();
    await state(page, "done");
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await state(page, "empty");
    const urls = await page.evaluate(() => window.__urls);
    expect(urls.made.length).toBe(2);
    expect([...urls.revoked].sort()).toEqual([...urls.made].sort());
    await expect(items(page)).toHaveCount(0);
    await expect(page.locator("#pp-result")).toBeHidden();
    await expect(page.getByLabel("Margin")).toHaveValue("small");
    await expect(page.locator("#pp-file")).toBeFocused();
  });

  test("'Same shape as each image' ignores the direction; Reset restores every control", async ({ page, go }) => {
    await open(page, go);
    await page.getByLabel("Page size").selectOption("image");
    await expect(page.getByLabel("Page direction")).toBeDisabled();
    await expect(page.locator("#pp-orientation-note")).toContainText("Not used");
    await choose(page, "rgb-baseline");
    const pdf = parsePdf((await createAndRead(page)).bytes);
    expect(pdf.pages[0].mediaBox[0] / pdf.pages[0].mediaBox[1]).toBeGreaterThan(1.2);
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(page.getByLabel("Page size")).toHaveValue("a4");
    await expect(page.getByLabel("Page direction")).toBeEnabled();
  });

  test("at the limit: the 31st photo is refused by name and nothing else changes", async ({ page, go }) => {
    await open(page, go);
    const one = file("rgb-baseline");
    const many = Array.from({ length: 31 }, (_, i) => ({ ...one, name: `photo-${String(i + 1).padStart(2, "0")}.jpg` }));
    await page.locator("#pp-file").setInputFiles(many);
    await expect(items(page)).toHaveCount(30);
    await expect(page.locator("#pp-error")).toContainText("photo-31.jpg");
    await expect(page.locator("#pp-error")).toContainText("up to 30 photos");
  });

  test("the page makes no request to another site and keeps nothing in the address or in storage", async ({ page, go, context, watch }) => {
    await open(page, go);
    await choose(page, "rgb-baseline", "gray-baseline");
    await state(page, "ready");
    await createAndRead(page);
    // the site-wide shell asks Google Fonts for its typeface on every page (docs/design-follow-ups.md); the tool itself, the PDF library and the download add nothing
    expect((context.__external ?? []).filter((r) => !/fonts\.(googleapis|gstatic)\.com/.test(r))).toEqual([]);
    expect(page.url()).not.toMatch(/[?#]/);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    expectClean(watch);
  });

  for (const [label, width, height] of [["375 px", 375, 740], ["360 px", 360, 740], ["320 px", 320, 640]]) {
    test(`phone width ${label}: no horizontal overflow, buttons and controls at least 44 px`, async ({ page, go }) => {
      await page.setViewportSize({ width, height });
      await open(page, go);
      await choose(page, "rgb-baseline", "rgb-progressive");
      await state(page, "ready");
      await expectNoHorizontalOverflow(page);
      for (const locator of [page.getByRole("button", { name: "Create PDF", exact: true }), page.getByRole("button", { name: "Reset", exact: true }), page.locator("#pp-list button").first(), page.locator("#pp-page-size")]) {
        const box = await locator.boundingBox();
        expect(box.height, await locator.evaluate((e) => e.id || e.textContent.trim())).toBeGreaterThanOrEqual(44);
      }
      await page.getByRole("button", { name: "Create PDF", exact: true }).click();
      await state(page, "done");
      await expectNoHorizontalOverflow(page);
    });
  }

});
