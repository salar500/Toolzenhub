/**
 * Photo Metadata Viewer and Remover (Tool Pack 57) in the browser: the findings are shown as text, the copy downloads
 * with the right name, the browser decodes the copy to exactly the pixels of the original (lossless), a photo stored
 * sideways still shows upright, a PNG loses its text, unsupported files are refused, nothing is requested from another
 * site, and the page fits a phone. Fixtures: tests/fixtures/images/make-image-metadata-fixtures.py (synthetic, Pillow).
 */
import fs from "node:fs";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";

const img = (name, mimeType) => ({ name, mimeType, buffer: fs.readFileSync(`tests/fixtures/images/${name}`) });
const JPG = () => img("md-gps-rot6.jpg", "image/jpeg");
const PNG = () => img("md-text.png", "image/png");

async function open(page, go) {
  await go("tools/image-metadata/");
  await expect(page.locator("#im-panel")).toHaveAttribute("data-ready", "true");
}

async function download(page, card) {
  const [d] = await Promise.all([page.waitForEvent("download"), card.locator(".im-download").click()]);
  return { name: d.suggestedFilename(), bytes: fs.readFileSync(await d.path()) };
}

/* decode bytes in the page: [width, height, sha-like checksum of the RGBA pixels], with and without the file's orientation */
async function decode(page, bytes, type) {
  return page.evaluate(async ({ b64, type }) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blob = new Blob([bin], { type });
    const out = {};
    for (const orientation of ["none", "from-image"]) {
      const bmp = await createImageBitmap(blob, { imageOrientation: orientation });
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const g = c.getContext("2d");
      g.drawImage(bmp, 0, 0);
      const px = g.getImageData(0, 0, bmp.width, bmp.height).data;
      let sum = 0;
      for (let i = 0; i < px.length; i++) sum = (sum * 31 + px[i]) % 2147483647;
      out[orientation] = [bmp.width, bmp.height, sum];
    }
    return out;
  }, { b64: Buffer.from(bytes).toString("base64"), type });
}

test.describe("Photo Metadata Viewer and Remover", () => {

  test("a JPEG: the location, camera and dates are shown; the copy has none of it, the same pixels and stays upright", async ({ page, go, watch }) => {
    await open(page, go);
    await page.locator("#im-file").setInputFiles([JPG()]);
    const card = page.locator(".im-card").first();
    await expect(card).toContainText("12.345600, -65.432100");
    await expect(card).toContainText("altitude 123 m");
    await expect(card).toContainText("ZZ-MAKE ZZ-MODEL-42");
    await expect(card).toContainText("2031:02:03 04:05:06");
    await expect(card).toContainText("ZZ-EDITOR 1.0");
    await expect(card).toContainText("turned a quarter");
    await expect(page.locator("#im-live")).toContainText("1 file read; 1 with metadata that can be removed.");
    await card.getByRole("button", { name: "Remove metadata from md-gps-rot6.jpg" }).click();
    await expect(card).toContainText("Kept the upright setting only.");
    await expect(page.locator(".im-download")).toBeFocused();
    const copy = await download(page, card);
    expect(copy.name).toBe("md-gps-rot6-no-metadata.jpg");
    const text = copy.bytes.toString("latin1");
    for (const marker of ["ZZ-MAKE", "ZZ-MODEL", "ZZ-EDITOR", "2031:02:03", "ZZ-COMMENT", "ZZ-XMP"]) expect(text, marker).not.toContain(marker);
    const before = await decode(page, fs.readFileSync("tests/fixtures/images/md-gps-rot6.jpg"), "image/jpeg");
    const after = await decode(page, copy.bytes, "image/jpeg");
    expect(after.none).toEqual(before.none); // the same pixels: the picture data was copied, not recompressed
    expect(after["from-image"]).toEqual(before["from-image"]); // still turned upright: 48 x 64
    expect(after["from-image"].slice(0, 2)).toEqual([48, 64]);
    expectClean(watch);
  });

  test("without 'Keep the photo upright' the copy has no Exif at all, and shows as stored", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#im-keep-turn").uncheck();
    await page.locator("#im-file").setInputFiles([JPG()]);
    const card = page.locator(".im-card").first();
    await card.getByRole("button", { name: /Remove metadata/ }).click();
    await expect(card).not.toContainText("Kept the upright setting");
    const copy = await download(page, card);
    expect(copy.bytes.toString("latin1")).not.toContain("Exif");
    expect((await decode(page, copy.bytes, "image/jpeg"))["from-image"].slice(0, 2)).toEqual([64, 48]);
  });

  test("a PNG loses its text, Exif and time; pixels are unchanged; a clean PNG says nothing was found", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#im-file").setInputFiles([PNG(), img("md-plain.png", "image/png")]);
    const cards = page.locator(".im-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("ZZ-AUTHOR");
    await expect(cards.nth(1)).toContainText("Nothing found");
    await page.getByRole("button", { name: "Remove metadata from all" }).click();
    await expect(page.locator("#im-live")).toContainText("Metadata removed from 1 file.");
    const copy = await download(page, cards.nth(0));
    expect(copy.name).toBe("md-text-no-metadata.png");
    for (const marker of ["ZZ-AUTHOR", "ZZ-DESCRIPTION", "tEXt", "iTXt", "eXIf", "tIME"]) expect(copy.bytes.toString("latin1"), marker).not.toContain(marker);
    expect((await decode(page, copy.bytes, "image/png")).none).toEqual((await decode(page, fs.readFileSync("tests/fixtures/images/md-text.png"), "image/png")).none);
  });

  test("unsupported and damaged files are refused with a reason, text is never markup, and Reset clears", async ({ page, go }) => {
    await open(page, go);
    await page.locator("#im-file").setInputFiles([img("photo.webp", "image/webp"), img("truncated.jpg", "image/jpeg"), { name: '<img src=x onerror="window.__x=1">.jpg', mimeType: "image/jpeg", buffer: fs.readFileSync("tests/fixtures/images/md-gps-rot6.jpg") }]);
    const cards = page.locator(".im-card");
    await expect(cards.nth(0)).toContainText("WebP, HEIC, GIF and AVIF are not supported yet");
    await expect(cards.nth(1)).toContainText("could not be read safely");
    await expect(cards.nth(2).locator("h3")).toHaveText('<img src=x onerror="window.__x=1">.jpg');
    await expect(page.locator(".im-card img")).toHaveCount(0);
    expect(await page.evaluate(() => window.__x)).toBeUndefined();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(cards).toHaveCount(0);
    await expect(page.locator("#im-file")).toBeFocused();
  });

  for (const width of [320, 390]) {
    test(`${width} px: no sideways scroll, 44 px controls, 16 px input text`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 800 });
      await open(page, go);
      await page.locator("#im-file").setInputFiles([JPG()]);
      await expect(page.locator(".im-card")).toHaveCount(1);
      await expectNoHorizontalOverflow(page);
      for (const b of await page.locator("#im-panel button:visible, .im-card button").all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
      expect(await page.locator("#im-file").evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
    });
  }

});
