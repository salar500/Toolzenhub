/**
 * Tool Pack 42: Image Compressor & Resizer, several images at once.
 *
 * What only a real browser can show: the list and its thumbnails, one-at-a-time processing and progress,
 * the downloaded files (read back and measured), a failure on one image leaving the others alone, Cancel,
 * stale results after a change of settings, object URL cleanup, names, keyboard use and three phone widths.
 * The numbers around a batch (limits, sizes, names, totals) are in tests/unit/image-batch.test.mjs, and one
 * image keeps working as before (tests/browser/image-compressor-resizer.spec.js).
 *
 * NOT covered here: any physical phone (memory with 20 large photos is UNKNOWN), Safari/WebKit and Firefox.
 */
import fs from "node:fs";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { sniffFormat, readSize } from "../../assets/js/tools/image-compressor-resizer/image-engine.js";

const FIX = "tests/fixtures/images/";
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", svg: "image/svg+xml" };
const asFile = (name, as = name) => ({ name: as, mimeType: MIME[name.split(".").pop()] || "application/octet-stream", buffer: fs.readFileSync(FIX + name) });

const panel = (page) => page.locator("#ic-panel");
const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);
const rows = (page) => page.locator("#ic-batch-list > li");
const live = (page) => page.locator("#ic-live");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/image-compressor-resizer/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function chooseMany(page, files) {
  await page.locator("#ic-file").setInputFiles(files);
}

async function chooseReady(page, files, count = files.length) {
  await chooseMany(page, files);
  await state(page, "ready");
  await expect(rows(page)).toHaveCount(count);
}

async function downloadFrom(page, row, name) {
  const [d] = await Promise.all([page.waitForEvent("download"), row.getByRole("link", { name: `Download ${name}` }).click()]);
  const bytes = new Uint8Array(fs.readFileSync(await d.path()));
  const format = sniffFormat(bytes);
  return { name: d.suggestedFilename(), bytes, format, size: readSize(bytes, format) };
}

// n images made in the page, put into the file input like a real choice
async function chooseGeneratedMany(page, { count, w, h, type = "image/jpeg" }) {
  await page.evaluate(async ({ count, w, h, type }) => {
    const dt = new DataTransfer();
    for (let n = 0; n < count; n++) {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d");
      const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, `hsl(${n * 40},60%,35%)`); g.addColorStop(1, "#e6b17e"); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 80; i++) { x.fillStyle = `hsla(${(i * 47 + n) % 360},60%,50%,0.5)`; x.beginPath(); x.arc((i * 7919 + n * 31) % w, (i * 104729) % h, 30 + (i * 13) % 200, 0, 6.283); x.fill(); }
      const blob = await new Promise((r) => c.toBlob(r, type, 0.85));
      c.width = 0; c.height = 0;
      dt.items.add(new File([blob], `gen-${n + 1}.jpg`, { type }));
    }
    const input = document.querySelector("#ic-file"); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
  }, { count, w, h, type });
}

const PHOTOS = ["photo.jpg", "screenshot.png", "photo.webp"];

test.describe("Image Compressor & Resizer: batch", () => {

  test("several images are listed with thumbnails, details and a Remove button each; one image keeps the old page", async ({ page, go, watch }) => {
    await open(page, go);
    expect(await page.locator("#ic-file").getAttribute("multiple")).not.toBeNull();
    await chooseReady(page, PHOTOS.map((n) => asFile(n)));
    await expect(panel(page)).toHaveAttribute("data-mode", "batch");
    await expect(page.locator("#ic-batch")).toBeVisible();
    await expect(page.locator("#ic-original")).toBeHidden();
    await expect(page.locator("#ic-batch-summary")).toContainText("3 images");
    await expect(rows(page).first().locator(".ic-batch__name")).toHaveText("photo.jpg");
    await expect(rows(page).first().locator(".ic-batch__meta")).toContainText("640 × 480");
    await expect(rows(page).first().locator(".ic-batch__status")).toHaveText("Waiting");
    await expect(rows(page).first().getByRole("button", { name: "Remove photo.jpg" })).toBeVisible();
    // thumbnails are drawn one at a time, each at most 160 px
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("#ic-batch-list canvas")].map((c) => c.width > 1 && Math.max(c.width, c.height) <= 160))).toEqual([true, true, true]);
    // the batch controls: size is "longest side", not exact width and height
    await expect(page.locator("#ic-size-group")).toBeHidden();
    await expect(page.locator("#ic-batch-size")).toBeVisible();
    await expect(page.locator("#ic-format")).toHaveValue("same");
    await expect(btn(page, "Compress images")).toBeVisible();
    // one image goes back to the single-image page
    await page.locator("#ic-file").setInputFiles(asFile("photo.jpg"));
    await expect(panel(page)).not.toHaveAttribute("data-mode", "batch");
    await expect(page.locator("#ic-batch")).toBeHidden();
    await expect(page.locator("#ic-original")).toBeVisible();
    await expect(page.locator("#ic-size-group")).toBeVisible();
    await expect(btn(page, "Compress image")).toBeVisible();
    expectClean(watch);
  });

  test("Longest side 320: every output measured; names; totals; one announcement at the end; nothing leaves the page", async ({ page, go, watch }) => {
    await open(page, go);
    await chooseReady(page, PHOTOS.map((n) => asFile(n)));
    await page.getByLabel("Longest side", { exact: true }).check();
    await page.locator("#ic-side").fill("320");
    await btn(page, "Compress images").click();
    await state(page, "done");
    await expect(live(page)).toHaveText("3 of 3 images done.");
    await expect(page.locator("#ic-batch-title")).toBeFocused();
    for (const row of await rows(page).all()) await expect(row.locator(".ic-batch__status")).toHaveText("Done");
    await expect(page.locator("#ic-batch-totals")).toContainText("3 images:");

    // a link styled as a button must stay readable (white on the green button, not green on green)
    expect(await rows(page).nth(0).getByRole("link").evaluate((a) => getComputedStyle(a).color)).toBe("rgb(255, 255, 255)");
    const first = await downloadFrom(page, rows(page).nth(0), "photo-resized.jpg");
    expect(first.name).toBe("photo-resized.jpg");
    expect([first.format, first.size.width, first.size.height]).toEqual(["jpeg", 320, 240]);
    const second = await downloadFrom(page, rows(page).nth(1), "screenshot-resized.png");
    expect([second.format, second.size.width, second.size.height]).toEqual(["png", 320, 240]);
    const third = await downloadFrom(page, rows(page).nth(2), "photo-compressed.webp"); // already 320 wide: not enlarged, size unchanged
    expect([third.format, third.size.width, third.size.height]).toEqual(["webp", 320, 240]);
    expectClean(watch);
  });

  test("a different format for all: JPEG for a PNG with transparency is skipped with a reason, the others go on", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, [asFile("photo.jpg"), asFile("logo-alpha.png"), asFile("screenshot.png")]);
    await page.locator("#ic-format").selectOption("image/jpeg");
    await btn(page, "Compress images").click();
    await state(page, "done");
    await expect(live(page)).toHaveText("2 of 3 images done; 1 skipped.");
    const skipped = rows(page).nth(1);
    await expect(skipped.locator(".ic-batch__status")).toHaveText("Skipped");
    await expect(skipped.locator(".ic-batch__detail")).toContainText("transparent areas");
    await expect(skipped.getByRole("link")).toHaveCount(0);
    const ok = await downloadFrom(page, rows(page).nth(2), "screenshot-compressed.jpg");
    expect(ok.format).toBe("jpeg");
  });

  test("a file that cannot be decoded fails alone; a refused type is named; the rest finish", async ({ page, go }) => {
    await open(page, go);
    // truncated.jpg has a readable header but no decodable data; heic and a text file are refused up front
    await chooseMany(page, [asFile("photo.jpg"), asFile("truncated.jpg"), asFile("heic-stub.heic"), asFile("not-an-image.jpg"), asFile("screenshot.png")]);
    await state(page, "ready");
    await expect(page.locator("#ic-error")).toContainText("heic-stub.heic");
    await expect(page.locator("#ic-error")).toContainText("not-an-image.jpg");
    const count = await rows(page).count();
    expect(count).toBeGreaterThanOrEqual(2);
    await btn(page, "Compress images").click();
    await state(page, "done");
    const statuses = await rows(page).locator(".ic-batch__status").allTextContents();
    expect(statuses.filter((s) => s === "Done").length).toBeGreaterThanOrEqual(2);
    if (count === 3) {
      expect(statuses).toEqual(["Done", "Failed", "Done"]);
      await expect(rows(page).nth(1).locator(".ic-batch__detail")).toContainText("Failed:");
    }
  });

  test("more than 20 images: the first 20 are listed and the rest are named as not added", async ({ page, go }) => {
    await open(page, go);
    const many = Array.from({ length: 22 }, (_, i) => ({ name: `p${String(i + 1).padStart(2, "0")}.png`, mimeType: "image/png", buffer: fs.readFileSync(FIX + "logo-alpha.png") }));
    await chooseMany(page, many);
    await state(page, "ready");
    await expect(rows(page)).toHaveCount(20);
    await expect(page.locator("#ic-error")).toContainText("p21.png");
    await expect(page.locator("#ic-error")).toContainText("up to 20 images");
  });

  test("the same name twice gets -2 and the downloads are different files", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, [asFile("photo.jpg"), asFile("lowq.jpg", "photo.jpg")]);
    await btn(page, "Compress images").click();
    await state(page, "done");
    await expect(rows(page).nth(0).getByRole("link", { name: "Download photo-compressed.jpg" })).toBeVisible();
    await expect(rows(page).nth(1).getByRole("link", { name: "Download photo-compressed-2.jpg" })).toBeVisible();
  });

  test("Up to a file size applies to every JPEG and WebP, a PNG ignores it, and each row says whether it was reached", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, [asFile("photo.jpg"), asFile("screenshot.png")]);
    await page.getByLabel("Up to a file size").check();
    await page.locator("#ic-target").fill("30");
    await btn(page, "Compress images").click();
    await state(page, "done");
    await expect(rows(page).nth(0).locator(".ic-batch__detail")).toContainText("Up to 30 KB: reached");
    const out = await downloadFrom(page, rows(page).nth(0), "photo-compressed.jpg");
    expect(out.bytes.length).toBeLessThanOrEqual(30 * 1024);
    await expect(rows(page).nth(1).locator(".ic-batch__detail")).not.toContainText("Up to");
  });

  test("a bad value is refused on its field and nothing starts", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, [asFile("photo.jpg"), asFile("screenshot.png")]);
    await page.getByLabel("Longest side", { exact: true }).check();
    await page.locator("#ic-side").fill("12.5");
    await btn(page, "Compress images").click();
    await expect(page.locator("#ic-side-error")).toContainText("whole number");
    await expect(page.locator("#ic-side")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#ic-side")).toBeFocused();
    await state(page, "ready");
    await expect(rows(page).first().locator(".ic-batch__status")).toHaveText("Waiting");
    await page.locator("#ic-side").fill("9000");
    await btn(page, "Compress images").click();
    await expect(page.locator("#ic-side-error")).toContainText("8,192");
  });

  test("changing a setting after a run removes the results; nothing stale can be downloaded", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, [asFile("photo.jpg"), asFile("screenshot.png")]);
    await btn(page, "Compress images").click();
    await state(page, "done");
    await expect(page.locator("#ic-batch-list a")).toHaveCount(2);
    await page.getByLabel("Smaller file").check();
    await state(page, "ready");
    await expect(page.locator("#ic-batch-list a")).toHaveCount(0);
    await expect(page.locator("#ic-batch-totals")).toBeHidden();
    await expect(rows(page).first().locator(".ic-batch__status")).toHaveText("Waiting");
    await expect(live(page)).toContainText("removed because the settings changed");
    // and it can be run again
    await btn(page, "Compress images").click();
    await state(page, "done");
    await expect(page.locator("#ic-batch-list a")).toHaveCount(2);
  });

  test("Remove, Reset and the keyboard: focus moves sensibly, results of others stay, Reset clears everything", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__live = new Set();
      const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (b) => { const u = create(b); window.__live.add(u); return u; };
      URL.revokeObjectURL = (u) => { window.__live.delete(u); revoke(u); };
    });
    await open(page, go);
    await chooseReady(page, PHOTOS.map((n) => asFile(n)));
    await btn(page, "Compress images").click();
    await state(page, "done");
    const urls = await page.evaluate(() => window.__live.size);
    expect(urls).toBeGreaterThanOrEqual(3); // one download link each

    await rows(page).nth(1).getByRole("button", { name: "Remove screenshot.png" }).focus();
    await page.keyboard.press("Enter");
    await expect(rows(page)).toHaveCount(2);
    await expect(rows(page).nth(1).getByRole("button", { name: /^Remove/ })).toBeFocused();
    await expect(live(page)).toContainText("screenshot.png removed. 2 images left.");
    expect(await page.evaluate(() => window.__live.size)).toBe(urls - 1);
    await expect(page.locator("#ic-batch-totals")).toContainText("2 images:");

    // preview of the selected result only
    await rows(page).first().getByRole("button", { name: "Preview photo-compressed.jpg" }).click();
    await expect(page.locator("#ic-batch-preview-img")).toBeVisible();
    await expect(rows(page).first().getByRole("button", { name: "Preview photo-compressed.jpg" })).toHaveAttribute("aria-pressed", "true");
    await rows(page).nth(1).getByRole("button", { name: /^Preview/ }).click();
    await expect(page.locator("#ic-batch-preview-caption")).toContainText("photo-compressed.webp");
    expect(await page.evaluate(() => window.__live.size)).toBe(urls - 1 + 1);

    await btn(page, "Reset").click();
    await state(page, "empty");
    await expect(page.locator("#ic-batch")).toBeHidden();
    await expect(rows(page)).toHaveCount(0);
    await expect(page.locator("#ic-settings")).toBeHidden();
    expect(await page.evaluate(() => window.__live.size)).toBe(0);
    await expect(page.locator("#ic-file")).toBeFocused();
  });

  test("Cancel: the run stops, finished results stay downloadable, the rest are marked, and a new run works", async ({ page, go }) => {
    await open(page, go);
    await chooseGeneratedMany(page, { count: 5, w: 5000, h: 3500 });
    await state(page, "ready");
    await expect(rows(page)).toHaveCount(5);
    await page.getByLabel("Up to a file size").check();
    await page.locator("#ic-target").fill("100");
    await page.locator("#ic-format").selectOption("image/webp"); // the slowest thing the tool does
    await btn(page, "Compress images").click();
    await state(page, "busy");
    await expect(page.locator("#ic-status")).toContainText(/File \d of 5/);
    await expect(page.locator("#ic-batch-list")).toHaveJSProperty("inert", true);
    await expect(rows(page).first().locator(".ic-batch__status")).not.toHaveText("Waiting");
    await btn(page, "Cancel").click();
    await expect(live(page)).toContainText("Cancelled.");
    await expect(panel(page)).toHaveAttribute("data-state", /^(ready|done)$/);
    await expect(page.locator("#ic-cancel")).toBeHidden();
    const statuses = await rows(page).locator(".ic-batch__status").allTextContents();
    expect(statuses.filter((s) => s === "Cancelled").length).toBeGreaterThanOrEqual(1);
    expect(statuses.every((s) => s === "Done" || s === "Cancelled")).toBe(true);
    expect(await page.locator("#ic-batch-list a").count()).toBe(statuses.filter((s) => s === "Done").length);
    await page.waitForTimeout(1500); // the abandoned work never shows up late
    expect(await rows(page).locator(".ic-batch__status").allTextContents()).toEqual(statuses);
    // a new run, on a fresh worker, completes
    await page.getByLabel("Set the quality").check();
    await page.locator("#ic-format").selectOption("image/jpeg");
    await btn(page, "Compress images").click();
    await expect(live(page)).toHaveText("5 of 5 images done.", { timeout: 60000 });
  });

  test("320, 360 and 390 px: no overflow, buttons at least 44 px, long names stay inside their row", async ({ page, go }) => {
    await open(page, go);
    const long = "a-very-long-file-name-for-a-passport-photo-front-side-scan-final-version-2.jpg";
    await chooseReady(page, [asFile("photo.jpg", long), asFile("screenshot.png")]);
    await btn(page, "Compress images").click();
    await state(page, "done");
    for (const width of [320, 360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await expectNoHorizontalOverflow(page);
      for (const control of await page.locator("#ic-batch-list").locator("button, a").all()) {
        const box = await control.boundingBox();
        expect(box.height, `${width}px control height`).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, `${width}px right edge`).toBeLessThanOrEqual(width);
      }
      for (const row of await rows(page).all()) {
        const box = await row.boundingBox();
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      for (const input of await page.locator("#ic-settings input[type=text], #ic-settings select").all()) {
        if (await input.isVisible()) expect(await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
      }
    }
  });

});
