/**
 * Tool Pack 20: Image Compressor & Resizer and the Image Tools section.
 *
 * Focused on what this change can break: the real flow (choose, resize, compress, download) on small committed
 * fixtures and on large images generated in the page; refusal of unsupported, corrupt and oversized files; the "up to N KB"
 * mode; transparency and orientation; metadata; privacy; stale results; cleanup (object URLs, bitmaps) over repeated runs;
 * the worker path and the main-thread fallback; accessibility and three phone widths; and the new section's place in the
 * site. The rules themselves are covered by tests/unit/image-engine.test.mjs.
 */
import fs from "node:fs";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { sniffFormat, readSize, formatBytes, outputFileName } from "../../assets/js/tools/image-compressor-resizer/image-engine.js";

const FIX = "tests/fixtures/images/";
const panel = (page) => page.locator("#ic-panel");
const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);
const error = (page) => page.locator("#ic-error");
const btn = (page, name) => page.getByRole("button", { name, exact: true });

async function open(page, go) {
  await go("tools/image-compressor-resizer/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function choose(page, name) {
  await page.locator("#ic-file").setInputFiles(FIX + name);
}

async function chooseReady(page, name) {
  await choose(page, name);
  await state(page, "ready");
}

async function chooseBuffer(page, file) {
  await page.locator("#ic-file").setInputFiles(file);
}

// an image made in the page (large ones are never committed): a File put into the file input like a real choice
async function chooseGenerated(page, { w, h, type = "image/jpeg", name = "generated.jpg", quality = 0.8 }) {
  await page.evaluate(async ({ w, h, type, name, quality }) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#2b5876"); g.addColorStop(1, "#e6b17e"); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { x.fillStyle = `hsla(${(i * 47) % 360},60%,50%,0.5)`; x.beginPath(); x.arc((i * 7919) % w, (i * 104729) % h, 30 + (i * 13) % 200, 0, 6.283); x.fill(); }
    const blob = await new Promise((r) => c.toBlob(r, type, quality));
    c.width = 0; c.height = 0;
    const dt = new DataTransfer(); dt.items.add(new File([blob], name, { type }));
    const input = document.querySelector("#ic-file"); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
  }, { w, h, type, name, quality });
}

async function compress(page) {
  await btn(page, "Compress image").click();
  await state(page, "done");
}

async function download(page) {
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#ic-download").click()]);
  const bytes = new Uint8Array(fs.readFileSync(await d.path()));
  const format = sniffFormat(bytes);
  return { name: d.suggestedFilename(), bytes, format, size: readSize(bytes, format) };
}

const text = (loc) => loc.innerText().then((t) => t.trim());

// the colour of a pixel of a file's decoded image, as R, G, B, Y or a transparent mark
async function colourAt(page, bytes, type, x, y) {
  return page.evaluate(async ({ data, type, x, y }) => {
    const bmp = await createImageBitmap(new Blob([new Uint8Array(data)], { type }));
    const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height; const cx = c.getContext("2d"); cx.drawImage(bmp, 0, 0);
    const px = cx.getImageData(x < 0 ? bmp.width + x : x, y < 0 ? bmp.height + y : y, 1, 1).data; bmp.close();
    if (px[3] < 128) return "transparent";
    return px[0] > 128 && px[1] < 128 ? "R" : px[1] > 128 && px[2] < 128 && px[0] < 128 ? "G" : px[2] > 128 && px[0] < 128 ? "B" : "Y";
  }, { data: [...bytes], type, x, y });
}

test.describe("Image Compressor & Resizer", () => {
  test("page, breadcrumb, labels and the empty state", async ({ page, go, watch, siteRoot }) => {
    await open(page, go);
    await expect(page.locator("h1")).toHaveText("Image Compressor & Resizer");
    await expect(page.locator("h1")).toHaveCount(1);
    const labels = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(labels).toEqual(["Home", "Image Tools", "Image Compressor & Resizer"]);
    const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
    expect(hrefs).toEqual([siteRoot, `${siteRoot}image-tools.html`]);
    await state(page, "empty");
    const input = page.locator("#ic-file");
    await expect(page.getByLabel("Choose a JPEG, PNG or WebP image")).toHaveCount(1);
    await expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(await input.getAttribute("multiple")).toBeNull(); // one image at a time
    await expect(page.locator("#ic-settings")).toBeHidden();
    await expect(page.locator("#ic-original")).toBeHidden();
    await expect(page.locator("#ic-result")).toBeHidden();
    await expect(page.locator("#ic-download")).toBeHidden();
    await expect(page.locator("#ic-drop-hint")).toContainText("up to 25.0 MB and 40 megapixels");
    await expect(page.locator("#ic-drop-hint")).toContainText("processed in your browser and is not uploaded by this tool");
    await expect(page.locator(".related-section")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/lossless compression|no quality loss|zero quality loss|\bbest\b|AI-powered|AI optimi|guaranteed/i);
    expectClean(watch);
  });

  test("JPEG: choose, see the original, compress at the original size, download a real JPEG", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await expect(page.locator("#ic-original-name")).toHaveText("photo.jpg");
    await expect(page.locator("#ic-original-dimensions")).toHaveText("640 × 480");
    await expect(page.locator("#ic-original-size")).toHaveText(formatBytes(fs.statSync(FIX + "photo.jpg").size));
    await expect(page.locator("#ic-original-format")).toHaveText("JPEG");
    // the preview is a small picture, not the full decode
    const preview = page.locator("#ic-original-img");
    await expect(preview).toHaveAttribute("src", /^blob:/);
    expect(await preview.evaluate((i) => Math.max(i.naturalWidth, i.naturalHeight))).toBeLessThanOrEqual(640);
    // defaults: the original size, aspect locked, the original format, Balanced
    await expect(page.locator("#ic-width")).toHaveValue("640");
    await expect(page.locator("#ic-height")).toHaveValue("480");
    await expect(page.locator("#ic-lock")).toBeChecked();
    await expect(page.locator("#ic-format")).toHaveValue("image/jpeg");
    await expect(page.getByLabel("Balanced")).toBeChecked();
    await compress(page);
    await expect(page.locator("#ic-result-dimensions")).toHaveText("640 × 480");
    await expect(page.locator("#ic-result-format")).toHaveText("JPEG");
    await expect(page.locator("#ic-result-quality")).toHaveText("80");
    await expect(page.locator("#ic-result-img")).toHaveAttribute("src", /^blob:/);
    const file = await download(page);
    expect(file.name).toBe("photo-compressed.jpg");
    expect(file.format).toBe("jpeg");
    expect(file.size).toEqual({ width: 640, height: 480 });
    await expect(page.locator("#ic-result-size")).toHaveText(formatBytes(file.bytes.length)); // the figure shown is the file's real size
    await expect(page.locator("#ic-download")).toHaveText("Download photo-compressed.jpg");
  });

  test("resize: the aspect ratio is locked by default; unlocking allows a stretch with a warning; enlarging is warned; presets fill the fields", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.locator("#ic-width").fill("320");
    await expect(page.locator("#ic-height")).toHaveValue("240");
    await page.locator("#ic-height").fill("120");
    await expect(page.locator("#ic-width")).toHaveValue("160");
    await expect(page.locator("#ic-size-notes")).toHaveText("");
    await page.locator("#ic-lock").uncheck();
    await page.locator("#ic-width").fill("400");
    await expect(page.locator("#ic-height")).toHaveValue("120"); // independent now
    await expect(page.locator("#ic-size-notes")).toContainText("Changing width and height independently may stretch the image.");
    await page.locator("#ic-lock").check();
    await expect(page.locator("#ic-height")).toHaveValue("300"); // locking again follows the width: 400 x 480/640
    await page.locator("#ic-width").fill("1000");
    await expect(page.locator("#ic-size-notes")).toContainText("Enlarging an image does not create new detail.");
    // presets
    const preset = (name) => page.getByRole("button", { name, exact: true });
    await preset("50%").click();
    await expect(page.locator("#ic-width")).toHaveValue("320");
    await expect(page.locator("#ic-height")).toHaveValue("240");
    await expect(preset("50%")).toHaveAttribute("aria-pressed", "true");
    await preset("75%").click();
    await expect(page.locator("#ic-width")).toHaveValue("480");
    await expect(page.locator("#ic-height")).toHaveValue("360");
    await preset("Original size").click();
    await expect(page.locator("#ic-width")).toHaveValue("640");
    // a long-side preset that would enlarge is not available
    await expect(preset("Long side 1920")).toBeDisabled();
    await expect(preset("Long side 1280")).toBeDisabled();
    // nothing was processed by any of that
    await state(page, "ready");
    await expect(page.locator("#ic-result")).toBeHidden();
  });

  test("a resized download: smaller dimensions, the resized name, the right size in the file", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.getByRole("button", { name: "50%", exact: true }).click();
    await compress(page);
    await expect(page.locator("#ic-result-dimensions")).toHaveText("320 × 240");
    await expect(page.locator("#ic-change")).toHaveAttribute("data-kind", "smaller");
    await expect(page.locator("#ic-change")).toHaveText(/^Reduced by .+ \(\d+%\)\.$/);
    const file = await download(page);
    expect(file.name).toBe("photo-resized.jpg");
    expect(file.size).toEqual({ width: 320, height: 240 });
  });

  test("long-side presets fit a big image and keep its proportions (generated, 4000 x 3000)", async ({ page, go }) => {
    await open(page, go);
    await chooseGenerated(page, { w: 4000, h: 3000, name: "big.jpg" });
    await state(page, "ready");
    await expect(page.locator("#ic-original-dimensions")).toHaveText("4,000 × 3,000");
    await page.getByRole("button", { name: "Long side 1920", exact: true }).click();
    await expect(page.locator("#ic-width")).toHaveValue("1920");
    await expect(page.locator("#ic-height")).toHaveValue("1440");
    await page.getByRole("button", { name: "Long side 1280", exact: true }).click();
    await expect(page.locator("#ic-height")).toHaveValue("960");
    await compress(page);
    const file = await download(page);
    expect(file.size).toEqual({ width: 1280, height: 960 });
  });

  test("invalid sizes are refused on the field with a message, and nothing is processed", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    for (const bad of ["abc", "1.5", "0", "1e3", "-5", "99999", "12px"]) {
      await page.locator("#ic-width").fill(bad);
      await expect(page.locator("#ic-width")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#ic-width-error")).not.toHaveText("");
      if (bad === "99999") await expect(page.locator("#ic-width-error")).toHaveText("The width can't be more than 8,192 pixels.");
      await btn(page, "Compress image").click();
      await state(page, "ready");
      await expect(page.locator("#ic-width")).toBeFocused();
      await expect(page.locator("#ic-result")).toBeHidden();
    }
    await page.locator("#ic-width").fill("8192");
    await page.locator("#ic-lock").uncheck();
    await page.locator("#ic-height").fill("4096");
    await btn(page, "Compress image").click();
    await expect(page.locator("#ic-width-error")).toContainText("megapixels"); // 33.5 MP is over the output limit
    await expect(page.locator("#ic-width")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#ic-width").fill("640");
    await expect(page.locator("#ic-width")).not.toHaveAttribute("aria-invalid", "true");
  });

  test("PNG: quality does not apply, the page says so, and the output is a real PNG; switching to WebP brings quality back", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "screenshot.png");
    await expect(page.locator("#ic-original-format")).toHaveText("PNG");
    await expect(page.locator("#ic-format")).toHaveValue("image/png");
    await expect(page.locator("#ic-lossy")).toBeHidden();
    await expect(page.locator("#ic-png-note")).toHaveText("PNG is lossless here; reduce dimensions or choose WebP/JPEG for smaller files.");
    await compress(page);
    await expect(page.locator("#ic-result-quality-row")).toBeHidden(); // no "quality used" for PNG
    await expect(page.locator("#ic-result-format")).toHaveText("PNG");
    const file = await download(page);
    expect(file.name).toBe("screenshot-compressed.png");
    expect(file.format).toBe("png");
    await page.locator("#ic-format").selectOption("image/webp");
    await expect(page.locator("#ic-lossy")).toBeVisible();
    await expect(page.locator("#ic-png-note")).toBeHidden();
    await compress(page);
    await expect(page.locator("#ic-result-quality")).toHaveText("80");
    const webp = await download(page);
    expect(webp.name).toBe("screenshot-compressed.webp");
    expect(webp.format).toBe("webp");
  });

  test("transparent PNG: JPEG is not offered, with the reason; WebP keeps the transparency", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "logo-alpha.png");
    const jpeg = page.locator('#ic-format option[value="image/jpeg"]');
    await expect(jpeg).toBeDisabled();
    await expect(page.locator("#ic-format-help")).toHaveText("JPEG doesn't support transparency. Keep PNG or use WebP.");
    await expect(page.locator('#ic-format option[value="image/png"]')).toBeEnabled();
    await expect(page.locator('#ic-format option[value="image/webp"]')).toBeEnabled();
    await expect(page.locator("#ic-format")).toHaveValue("image/png");
    await page.locator("#ic-format").selectOption("image/webp");
    await compress(page);
    const file = await download(page);
    expect(file.format).toBe("webp");
    expect(await colourAt(page, file.bytes, "image/webp", 2, 2)).toBe("transparent"); // the corner is still transparent
    expect(await colourAt(page, file.bytes, "image/webp", 100, 50)).not.toBe("transparent");
  });

  test("an alpha channel with fully opaque pixels is checked, and JPEG is then allowed", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "opaque-rgba.png");
    await expect(page.locator('#ic-format option[value="image/jpeg"]')).toBeEnabled();
    await expect(page.locator("#ic-format-help")).toHaveText("");
    await page.locator("#ic-format").selectOption("image/jpeg");
    await compress(page);
    const file = await download(page);
    expect(file.format).toBe("jpeg");
    expect(file.name).toBe("opaque-rgba-compressed.jpg");
  });

  test("WebP in, WebP out", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.webp");
    await expect(page.locator("#ic-original-format")).toHaveText("WebP");
    await expect(page.locator("#ic-format")).toHaveValue("image/webp");
    await compress(page);
    const file = await download(page);
    expect(file.format).toBe("webp");
    expect(file.size).toEqual({ width: 320, height: 240 });
  });

  test("a larger output is reported plainly, with no success styling, and can still be downloaded", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "lowq.jpg"); // saved at quality 35 and optimised: re-encoding at a higher quality grows it
    await page.getByLabel("High quality").check();
    await compress(page);
    const change = page.locator("#ic-change");
    await expect(change).toHaveAttribute("data-kind", "larger");
    await expect(change).toHaveText(/^Larger by .+ \(\d+%\)\.$/);
    await expect(page.locator("#ic-change-detail")).toHaveText(/^Output is .+ larger than the original\.$/);
    await expect(page.locator("#ic-result")).not.toContainText(/Reduced by/);
    const colour = await change.evaluate((el) => getComputedStyle(el).borderLeftColor);
    expect(colour).not.toBe("rgb(6, 118, 71)"); // not the success colour
    await expect(page.locator("#ic-download")).toBeVisible();
    const file = await download(page);
    expect(file.format).toBe("jpeg");
  });

  test("up to N KB: a reachable target shows the target, the actual size and the quality used; at most 8 encodes", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.getByLabel("Up to a file size").check();
    await expect(page.locator("#ic-target-block")).toBeVisible();
    await expect(page.locator("#ic-quality-block")).toBeHidden();
    await page.locator("#ic-target").fill("40");
    await compress(page);
    const file = await download(page);
    expect(file.bytes.length).toBeLessThanOrEqual(40 * 1024);
    const target = page.locator("#ic-target-result");
    await expect(target).toBeVisible();
    await expect(target).toHaveText(new RegExp(`^Target: Up to 40 KB\\. Result: ${formatBytes(file.bytes.length).replace(".", "\\.")} at quality \\d+\\.$`));
    const quality = Number(await text(page.locator("#ic-result-quality")));
    expect(quality).toBeGreaterThanOrEqual(30);
    expect(quality).toBeLessThanOrEqual(95);
    expect(Number(await panel(page).getAttribute("data-attempts"))).toBeLessThanOrEqual(8);
    await expect(page.locator("#ic-result")).not.toContainText(/exactly/i);
  });

  test("a target the image already fits is done at the highest quality in one encode", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.getByLabel("Up to a file size").check();
    await page.locator("#ic-target").fill("2000");
    await compress(page);
    await expect(page.locator("#ic-result-quality")).toHaveText("95");
    expect(await panel(page).getAttribute("data-attempts")).toBe("1");
  });

  test("an unreachable target says so, names the fix, and shows the smallest it could make", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.getByLabel("Up to a file size").check();
    await page.locator("#ic-target").fill("10");
    await compress(page);
    const note = page.locator("#ic-target-result");
    await expect(note).toContainText("Couldn't get under 10 KB at these dimensions. Try smaller dimensions.");
    await expect(page.locator("#ic-result-quality")).toHaveText("30"); // the floor, never lower
    expect(Number(await panel(page).getAttribute("data-attempts"))).toBe(2);
    await expect(live(page)).toContainText("Couldn't get under 10 KB");
    // and smaller dimensions do reach it
    await page.getByRole("button", { name: "50%", exact: true }).click();
    await page.locator("#ic-target").fill("12");
    await compress(page);
    await expect(page.locator("#ic-target-result")).toContainText("Target: Up to 12 KB. Result:");
  });

  test("an invalid target is refused on the field", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.getByLabel("Up to a file size").check();
    for (const bad of ["abc", "9", "20001", "1.5", ""]) {
      await page.locator("#ic-target").fill(bad);
      await btn(page, "Compress image").click();
      await expect(page.locator("#ic-target")).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#ic-target-error")).not.toHaveText("");
      await state(page, "ready");
    }
    await expect(page.locator("#ic-target-error")).toHaveText("Enter the most you want, in whole KB, such as 500.");
  });

  test("quality: presets set the slider, the slider is named and valued, and a manual value is used", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.locator(".ic-advanced > summary").click();
    const slider = page.getByLabel("Quality", { exact: false }).filter({ has: page.locator("xpath=self::input[@type='range']") });
    await expect(page.locator("#ic-quality")).toHaveAttribute("min", "30");
    await expect(page.locator("#ic-quality")).toHaveAttribute("max", "95");
    await expect(page.locator("#ic-quality")).toHaveValue("80");
    await page.getByLabel("Smaller file").check();
    await expect(page.locator("#ic-quality")).toHaveValue("60");
    await page.getByLabel("High quality").check();
    await expect(page.locator("#ic-quality")).toHaveValue("90");
    await page.locator("#ic-quality").fill("47");
    await expect(page.locator("#ic-quality-value")).toHaveText("47");
    await expect(page.locator("#ic-quality")).toHaveAttribute("aria-valuetext", "Quality 47");
    expect(await page.getByRole("radio", { name: /Balanced|High quality|Smaller file/ }).evaluateAll((r) => r.map((x) => x.checked))).toEqual([false, false, false]);
    await expect(page.locator("#ic-quality-help")).toHaveText("Higher values usually preserve more detail but may produce a larger file.");
    await compress(page);
    await expect(page.locator("#ic-result-quality")).toHaveText("47");
    void slider;
  });

  test("EXIF orientation: a camera photo comes out the way up it is shown, in the preview and in the file", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "portrait-exif6.jpg"); // stored 320 x 240, turned by EXIF to 240 x 320
    await expect(page.locator("#ic-original-dimensions")).toHaveText("240 × 320");
    await expect(page.locator("#ic-width")).toHaveValue("240");
    await expect(page.locator("#ic-height")).toHaveValue("320");
    const previewTopLeft = await page.locator("#ic-original-img").evaluate(async (img) => { const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(4, 4, 1, 1).data; return [img.naturalWidth, img.naturalHeight, d[2] > 128 && d[0] < 128 ? "B" : "other"]; });
    expect(previewTopLeft).toEqual([240, 320, "B"]);
    await compress(page);
    await expect(page.locator("#ic-result-dimensions")).toHaveText("240 × 320");
    const file = await download(page);
    expect(file.size).toEqual({ width: 240, height: 320 });
    expect(await colourAt(page, file.bytes, "image/jpeg", 4, 4)).toBe("B"); // top-left: the stored bottom-left, blue
    expect(await colourAt(page, file.bytes, "image/jpeg", -5, 4)).toBe("R");
  });

  test("metadata: planted camera text does not survive re-encoding to JPEG or WebP", async ({ page, go }) => {
    const source = fs.readFileSync(FIX + "exif-secret.jpg").toString("latin1");
    expect(source).toContain("SECRET-GPS-MARKER"); // the fixture really has it
    await open(page, go);
    await chooseReady(page, "exif-secret.jpg");
    await compress(page);
    const jpeg = await download(page);
    const jpegText = Buffer.from(jpeg.bytes).toString("latin1");
    expect(jpegText).not.toContain("SECRET-GPS-MARKER");
    expect(jpegText).not.toContain("ACME-CAMERA");
    await page.locator("#ic-format").selectOption("image/webp");
    await compress(page);
    const webp = Buffer.from((await download(page)).bytes).toString("latin1");
    expect(webp).not.toContain("SECRET-GPS-MARKER");
    await expect(page.locator("#ic-result")).toContainText("Re-encoding normally removes embedded camera metadata, such as location.");
  });

  test("a file named .jpg that is really a PNG is treated as the PNG it is", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "png-named-jpg.jpg");
    await expect(page.locator("#ic-original-format")).toHaveText("PNG");
    await expect(page.locator("#ic-format")).toHaveValue("image/png");
    await compress(page);
    const file = await download(page);
    expect(file.format).toBe("png");
    expect(file.name).toBe("png-named-jpg-compressed.png"); // the extension of the bytes, never .jpg
  });
});

const live = (page) => page.locator("#ic-live");

test.describe("Image Compressor & Resizer: refusals", () => {
  test("HEIC, GIF, AVIF and SVG each get their own plain message and nothing is shown", async ({ page, go }) => {
    await open(page, go);
    const cases = [
      ["heic-stub.heic", "HEIC/HEIF isn't supported in this version. Export or save the image as JPEG, PNG or WebP first."],
      ["anim.gif", "GIF isn't supported because this tool does not preserve animation."],
      ["avif-stub.avif", "AVIF isn't supported in this version. Export or save the image as JPEG, PNG or WebP first."],
      ["icon.svg", "SVG isn't supported. This tool works on JPEG, PNG and WebP photos and screenshots."],
    ];
    for (const [name, message] of cases) {
      await choose(page, name);
      await state(page, "error");
      await expect(error(page)).toHaveText(message);
      await expect(page.locator("#ic-settings")).toBeHidden();
      await expect(page.locator("#ic-original")).toBeHidden();
      await expect(page.locator("#ic-result")).toBeHidden();
    }
  });

  test("a corrupt, truncated, empty or non-image file fails cleanly with the same plain message", async ({ page, go, watch }) => {
    await open(page, go);
    for (const name of ["not-an-image.jpg", "truncated.jpg"]) {
      await choose(page, name);
      await state(page, "error");
      await expect(error(page)).toHaveText("This file could not be decoded as a supported image.");
      await expect(page.locator("#ic-settings")).toBeHidden();
      await expect(page.locator("#ic-status")).toBeHidden(); // never left "processing"
    }
    await choose(page, "empty.jpg");
    await expect(error(page)).toHaveText("This file is empty.");
    // after an error a good file works
    await chooseReady(page, "photo.jpg");
    await expect(error(page)).toBeHidden();
    expect(watch.pageErrors).toEqual([]);
  });

  test("an image with too many pixels is refused from its header, before it is decoded", async ({ page, go }) => {
    await open(page, go);
    const patched = Buffer.from(fs.readFileSync(FIX + "photo.jpg"));
    for (let i = 0; i < patched.length - 9; i++) if (patched[i] === 0xff && patched[i + 1] === 0xc0) { patched.writeUInt16BE(5000, i + 5); patched.writeUInt16BE(10000, i + 7); break; }
    await page.evaluate(() => { window.__bitmaps = 0; const orig = window.createImageBitmap; window.createImageBitmap = function (...a) { window.__bitmaps++; return orig.apply(this, a); }; });
    await chooseBuffer(page, { name: "huge.jpg", mimeType: "image/jpeg", buffer: patched });
    await state(page, "error");
    await expect(error(page)).toContainText("This image is 50.0 megapixels. The limit is 40 megapixels");
    expect(await page.evaluate(() => window.__bitmaps)).toBe(0); // never decoded
    await expect(page.locator("#ic-settings")).toBeHidden();
  });

  test("a file over 25 MB is refused before anything is read", async ({ page, go }) => {
    await open(page, go);
    const big = Buffer.alloc(26 * 1024 * 1024);
    fs.readFileSync(FIX + "photo.jpg").copy(big);
    await chooseBuffer(page, { name: "big.jpg", mimeType: "image/jpeg", buffer: big });
    await state(page, "error");
    await expect(error(page)).toContainText("26.0 MB, over the 25.0 MB limit");
    await expect(page.locator("#ic-settings")).toBeHidden();
  });

  test("dropping several files is refused; dropping one image works; the file input remains the primary path", async ({ page, go }) => {
    await open(page, go);
    const dropFiles = (names) => page.evaluate(async (names) => {
      const dt = new DataTransfer();
      for (const n of names) dt.items.add(new File([await (await fetch(n.url)).blob()], n.name, { type: n.type }));
      document.querySelector("#ic-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    }, names);
    // build two small images in the page for the drop events
    await page.evaluate(async () => {
      window.__urls = [];
      for (let i = 0; i < 2; i++) { const c = document.createElement("canvas"); c.width = 40; c.height = 30; c.getContext("2d").fillRect(0, 0, 20, 15); window.__urls.push(URL.createObjectURL(await new Promise((r) => c.toBlob(r, "image/png")))); }
    });
    const urls = await page.evaluate(() => window.__urls);
    await dropFiles([{ url: urls[0], name: "one.png", type: "image/png" }, { url: urls[1], name: "two.png", type: "image/png" }]);
    await state(page, "error");
    await expect(error(page)).toHaveText("Please add one image at a time.");
    await dropFiles([{ url: urls[0], name: "dropped.png", type: "image/png" }]);
    await state(page, "ready");
    await expect(page.locator("#ic-original-name")).toHaveText("dropped.png");
    await expect(page.locator("#ic-original-dimensions")).toHaveText("40 × 30");
  });
});

test.describe("Image Compressor & Resizer: cleanup, stale results, privacy, engines", () => {
  test("reset clears everything: previews, download, result, input, settings, and returns focus", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await page.locator("#ic-width").fill("200");
    await page.getByLabel("Up to a file size").check();
    await compress(page);
    await btn(page, "Reset").click();
    await state(page, "empty");
    expect(await page.locator("#ic-file").inputValue()).toBe("");
    await expect(page.locator("#ic-file")).toBeFocused();
    for (const id of ["#ic-original", "#ic-settings", "#ic-result", "#ic-download", "#ic-status"]) await expect(page.locator(id)).toBeHidden();
    expect(await page.locator("#ic-original-img").getAttribute("src")).toBeNull();
    expect(await page.locator("#ic-result-img").getAttribute("src")).toBeNull();
    expect(await page.locator("#ic-download").getAttribute("href")).toBeNull();
    await expect(live(page)).toHaveText("Cleared. Choose an image to start again.");
    // defaults are back for the next image
    await chooseReady(page, "screenshot.png");
    await expect(page.locator("#ic-width")).toHaveValue("400");
    await expect(page.locator('input[name="ic-mode"][value="quality"]')).toBeChecked();
    await expect(page.locator("#ic-lock")).toBeChecked();
    await expect(page.locator("#ic-target")).toHaveValue("500");
  });

  test("a late result from an earlier image never overwrites the newer one", async ({ page, go }) => {
    await open(page, go);
    await chooseGenerated(page, { w: 6000, h: 4000, name: "slow-large.jpg" }); // 24 MP: starts at the largest size that can be output
    await state(page, "ready");
    await expect(page.locator("#ic-width")).toHaveValue("5016");
    await expect(page.locator("#ic-height")).toHaveValue("3344");
    await expect(page.locator("#ic-size-notes")).toContainText("output limit, so the size starts reduced to fit");
    await expect(page.getByRole("button", { name: "Original size", exact: true })).toBeDisabled(); // it cannot be output
    await btn(page, "Compress image").click();
    await state(page, "busy");
    await expect(page.locator("#ic-status")).toHaveText("Processing image…");
    await choose(page, "screenshot.png"); // a new image while the first is still being processed
    await state(page, "ready");
    await expect(page.locator("#ic-original-name")).toHaveText("screenshot.png");
    await page.waitForTimeout(3500); // long enough for the first run to finish in the background
    await state(page, "ready");
    await expect(page.locator("#ic-result")).toBeHidden();
    await expect(page.locator("#ic-download")).toBeHidden();
    await expect(page.locator("#ic-original-name")).toHaveText("screenshot.png");
    await expect(error(page)).toBeHidden();
    // and the new image works normally
    await compress(page);
    await expect(page.locator("#ic-result-dimensions")).toHaveText("400 × 300");
  });

  test("resetting while a run is in flight drops its result", async ({ page, go }) => {
    await open(page, go);
    await chooseGenerated(page, { w: 6000, h: 4000, name: "slow-large.jpg" });
    await state(page, "ready");
    await btn(page, "Compress image").click();
    await state(page, "busy");
    await expect(page.locator("#ic-reset")).toBeEnabled(); // reset works while processing
    await expect(page.locator("#ic-process")).toBeDisabled();
    await expect(page.locator("#ic-width")).toBeDisabled();
    await btn(page, "Reset").click();
    await state(page, "empty");
    await page.waitForTimeout(3500);
    await state(page, "empty");
    await expect(page.locator("#ic-result")).toBeHidden();
    await expect(page.locator("#ic-download")).toBeHidden();
  });

  test("a long run can be cancelled: the worker is stopped, the settings are kept, and the tool works again", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#ic-cancel")).toBeHidden(); // only while processing
    await chooseGenerated(page, { w: 6000, h: 4000, name: "slow.jpg" });
    await state(page, "ready");
    await page.locator("#ic-width").fill("3000");
    await page.getByLabel("Up to a file size").check();
    await page.locator("#ic-target").fill("300");
    await page.locator("#ic-format").selectOption("image/webp"); // eight WebP encodes: the slowest thing the tool does
    await btn(page, "Compress image").click();
    await state(page, "busy");
    await expect(page.locator("#ic-cancel")).toBeVisible();
    await btn(page, "Cancel").click();
    await state(page, "ready");
    await expect(page.locator("#ic-cancel")).toBeHidden();
    await expect(page.locator("#ic-status")).toBeHidden();
    await expect(page.locator("#ic-width")).toBeEnabled();
    await expect(page.locator("#ic-width")).toHaveValue("3000"); // settings unchanged
    await expect(page.locator("#ic-target")).toHaveValue("300");
    await expect(live(page)).toHaveText("Cancelled. Your settings are unchanged.");
    await expect(btn(page, "Compress image")).toBeFocused();
    await page.waitForTimeout(1500); // the abandoned run never shows up late
    await state(page, "ready");
    await expect(page.locator("#ic-result")).toBeHidden();
    // and a new run, on a fresh worker, completes
    await page.locator("#ic-format").selectOption("image/jpeg");
    await page.locator("#ic-target").fill("2000");
    await compress(page);
    await expect(panel(page)).toHaveAttribute("data-engine", "worker");
    await expect(page.locator("#ic-result-dimensions")).toHaveText("3,000 × 2,000");
  });

  test("busy and done are each announced once, politely; the status is visible while processing", async ({ page, go }) => {
    await open(page, go);
    await expect(live(page)).toHaveAttribute("aria-live", "polite");
    await expect(live(page)).toHaveAttribute("role", "status");
    await chooseGenerated(page, { w: 4000, h: 3000, name: "a.jpg" });
    await state(page, "ready");
    await expect(live(page)).toHaveText("Image loaded. Choose a size and an output, then press Compress image.");
    await btn(page, "Compress image").click();
    await expect(page.locator("#ic-status")).toBeVisible();
    await expect(panel(page)).toHaveAttribute("aria-busy", "true");
    await state(page, "done");
    await expect(panel(page)).not.toHaveAttribute("aria-busy", /.+/);
    await expect(live(page)).toHaveText(/^Done\. (Reduced|Larger) by .+ Output is .+, 4,000 × 3,000\.$/);
  });

  test("privacy: no request carries the image, nothing is stored, the address never changes", async ({ page, go }) => {
    const requests = [];
    page.on("request", (r) => { if (["fetch", "xhr", "websocket", "ping", "beacon", "eventsource"].includes(r.resourceType()) || r.method() !== "GET" || r.postData()) requests.push(`${r.method()} ${r.resourceType()} ${r.url()}`); });
    await open(page, go);
    const url = page.url();
    await chooseReady(page, "exif-secret.jpg");
    await page.getByLabel("Up to a file size").check();
    await compress(page);
    await download(page);
    await btn(page, "Reset").click();
    expect(requests).toEqual([]);
    expect(page.url()).toBe(url);
    expect(await page.evaluate(async () => [localStorage.length, sessionStorage.length, document.cookie, (await indexedDB.databases()).length, location.search + location.hash])).toEqual([0, 0, "", 0, ""]);
  });

  test("security: a hostile file name is only ever text, and the download name is sanitised", async ({ page, go }) => {
    await page.addInitScript(() => { window.__xss = 0; });
    await open(page, go);
    const buffer = fs.readFileSync(FIX + "photo.jpg");
    await chooseBuffer(page, { name: '<img src=x onerror="window.__xss=1">.jpg', mimeType: "image/jpeg", buffer });
    await state(page, "ready");
    await expect(page.locator("#ic-original-name")).toContainText('<img src=x onerror="window.__xss=1">.jpg');
    await expect(page.locator("#ic-original img[src=x], #ic-original-name img, #ic-original-name script")).toHaveCount(0);
    await compress(page);
    const file = await download(page);
    expect(file.name).toBe("img src=x onerror=window.__xss=1-compressed.jpg");
    await expect(page.locator("#ic-download")).toHaveText(`Download ${file.name}`);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.__xss)).toBe(0);
    await choose(page, "icon.svg"); // an SVG is refused, never rendered
    await expect(page.locator("main svg")).toHaveCount(0);
  });

  test("repeated processing does not accumulate: object URLs are revoked, the DOM is stable, and a reset releases everything", async ({ page, go }) => {
    await page.addInitScript(() => {
      window.__live = new Set(); window.__created = 0; window.__revoked = 0;
      const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (b) => { const u = create(b); window.__live.add(u); window.__created++; return u; };
      URL.revokeObjectURL = (u) => { if (window.__live.delete(u)) window.__revoked++; revoke(u); };
    });
    await open(page, go);
    await chooseGenerated(page, { w: 3000, h: 2000, name: "loop.jpg" });
    await state(page, "ready");
    const nodes = () => page.evaluate(() => document.getElementsByTagName("*").length);
    await compress(page);
    const baseNodes = await nodes();
    const liveAfterFirst = await page.evaluate(() => window.__live.size);
    expect(liveAfterFirst).toBeLessThanOrEqual(3); // the original preview, the result preview and the download
    for (let i = 0; i < 11; i++) {
      await page.locator("#ic-width").fill(String(1800 - i * 100));
      await page.getByLabel(i % 2 ? "Smaller file" : "High quality").check();
      await compress(page);
    }
    expect(await page.evaluate(() => window.__live.size)).toBeLessThanOrEqual(3); // still just those, after 12 runs
    expect(await page.evaluate(() => window.__created)).toBeGreaterThan(12);
    expect(Math.abs((await nodes()) - baseNodes)).toBeLessThanOrEqual(6);
    await btn(page, "Reset").click();
    expect(await page.evaluate(() => window.__live.size)).toBe(0);
    // a second image after the reset behaves normally and holds only its own URLs
    await chooseReady(page, "photo.jpg");
    await compress(page);
    expect(await page.evaluate(() => window.__live.size)).toBeLessThanOrEqual(3);
    // choosing yet another image revokes the old ones
    await chooseReady(page, "screenshot.png");
    expect(await page.evaluate(() => window.__live.size)).toBe(1);
  });

  test("the worker does the pixel work when the browser has one", async ({ page, go }) => {
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await compress(page);
    await expect(panel(page)).toHaveAttribute("data-engine", "worker");
  });

  test("without OffscreenCanvas the same steps run on the main thread: it works, and every bitmap is closed", async ({ page, go }) => {
    await page.addInitScript(() => {
      delete window.OffscreenCanvas; // a browser with no worker-side canvas
      window.__bitmaps = { made: 0, closed: 0 };
      const orig = window.createImageBitmap.bind(window);
      window.createImageBitmap = async (...a) => { const b = await orig(...a); window.__bitmaps.made++; const close = b.close.bind(b); let done = false; b.close = () => { if (!done) { done = true; window.__bitmaps.closed++; } close(); }; return b; };
    });
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    for (let i = 0; i < 4; i++) { await page.locator("#ic-width").fill(String(600 - i * 50)); await compress(page); }
    await expect(panel(page)).toHaveAttribute("data-engine", "main");
    const file = await download(page);
    expect(file.format).toBe("jpeg");
    expect(file.size.width).toBe(450);
    const counts = await page.evaluate(() => window.__bitmaps);
    expect(counts.made).toBeGreaterThanOrEqual(5); // one to inspect, four to process
    expect(counts.closed).toBe(counts.made); // none left open
    await chooseReady(page, "logo-alpha.png"); // the transparency scan also works here
    await expect(page.locator('#ic-format option[value="image/jpeg"]')).toBeDisabled();
  });

  test("a worker that cannot start falls back to the main thread without breaking the tool", async ({ page, go }) => {
    await page.addInitScript(() => { window.Worker = class { constructor() { throw new Error("blocked"); } }; });
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await compress(page);
    await expect(panel(page)).toHaveAttribute("data-engine", "main");
    expect((await download(page)).format).toBe("jpeg");
  });

  test("a format this browser cannot encode is not offered", async ({ page, go }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (cb, type, q) { return orig.call(this, cb, type === "image/webp" ? "image/png" : type, q); }; // answers PNG when asked for WebP
    });
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    await expect(page.locator('#ic-format option[value="image/webp"]')).toHaveCount(0);
    await expect(page.locator('#ic-format option[value="image/jpeg"]')).toHaveCount(1);
    await expect(page.locator('#ic-format option[value="image/png"]')).toHaveCount(1);
  });
});

test.describe("Image Compressor & Resizer: accessibility and layout", () => {
  test("semantics: labelled controls, a described file input, headings in order, named download, visible focus", async ({ page, go }) => {
    await open(page, go);
    await expect(page.locator("#ic-file")).toHaveAttribute("aria-describedby", "ic-drop-hint");
    await chooseReady(page, "photo.jpg");
    for (const label of ["Width", "Height", "Keep aspect ratio", "Format", "Set the quality", "Up to a file size", "High quality", "Balanced", "Smaller file"]) await expect(page.getByLabel(label, { exact: true }), label).toHaveCount(1);
    await expect(page.getByRole("group", { name: "Size in pixels" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Output" })).toBeVisible();
    await expect(page.locator("#ic-original-img")).toHaveAttribute("alt", "Scaled preview of the original image");
    // metrics are text in a description list
    expect(await page.locator("#ic-original .ic-metrics").evaluate((el) => el.tagName)).toBe("DL");
    await compress(page);
    await expect(page.locator("#ic-result-img")).toHaveAttribute("alt", "Scaled preview of the processed image");
    await expect(page.getByRole("link", { name: /^Download photo-compressed\.jpg$/ })).toBeVisible();
    const levels = await page.locator("main h1, main h2, main h3").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    const outline = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    for (const target of [page.locator("#ic-file"), page.locator("#ic-width"), page.locator("#ic-height"), page.locator("#ic-lock"), page.locator("#ic-format"), btn(page, "Compress image"), page.locator("#ic-download")]) {
      await target.focus();
      expect(await outline(target), await target.evaluate((e) => e.id || e.tagName)).toBeGreaterThanOrEqual(2);
    }
    // errors are linked to their field
    await page.locator("#ic-width").fill("abc");
    await expect(page.locator("#ic-width")).toHaveAttribute("aria-describedby", "ic-width-error");
    await expect(page.locator("#ic-width-error")).toHaveText(/whole number of pixels/);
    // a refusal is an alert
    await expect(error(page)).toHaveAttribute("role", "alert");
  });

  for (const width of [320, 360, 390]) {
    test(`${width} px: one column, nothing widens the page, controls are tappable, the result is readable`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      await expectNoHorizontalOverflow(page);
      await chooseBuffer(page, { name: `${"a-very-long-photo-name-".repeat(6)}.jpg`, mimeType: "image/jpeg", buffer: fs.readFileSync(FIX + "photo.jpg") });
      await state(page, "ready");
      await expectNoHorizontalOverflow(page);
      await page.getByLabel("Up to a file size").check();
      await expectNoHorizontalOverflow(page);
      for (const name of ["Compress image", "Reset"]) { const b = await btn(page, name).boundingBox(); expect(b.height, name).toBeGreaterThanOrEqual(44); expect(b.x + b.width, name).toBeLessThanOrEqual(width); }
      for (const chip of await page.locator(".ic-chip:not(:disabled)").all()) { const b = await chip.boundingBox(); expect(b.height).toBeGreaterThanOrEqual(44); expect(b.x + b.width).toBeLessThanOrEqual(width); }
      for (const label of await page.locator(".ic-radio:visible, .ic-check:visible").all()) expect((await label.boundingBox()).height).toBeGreaterThanOrEqual(44);
      for (const id of ["#ic-width", "#ic-height", "#ic-target", "#ic-format", "#ic-file"]) expect(await page.locator(id).evaluate((el) => parseFloat(getComputedStyle(el).fontSize)), id).toBeGreaterThanOrEqual(16);
      await compress(page);
      await expectNoHorizontalOverflow(page);
      const dl = await page.locator("#ic-download").boundingBox();
      expect(dl.height).toBeGreaterThanOrEqual(44);
      expect(dl.x + dl.width).toBeLessThanOrEqual(width);
      for (const img of ["#ic-original-img", "#ic-result-img"]) { const b = await page.locator(img).boundingBox(); expect(b.x + b.width, img).toBeLessThanOrEqual(width); }
      await choose(page, "heic-stub.heic");
      await expectNoHorizontalOverflow(page);
      await choose(page, "logo-alpha.png"); // transparent preview
      await state(page, "ready");
      await expectNoHorizontalOverflow(page);
    });
  }

  // real-device finding: a long download name wrapped inside a fixed-height button and spilled over the content below
  for (const width of [320, 360, 390]) {
    test(`${width} px: a very long file name stays inside its button and card, nothing overlaps, and the download keeps the full generated name`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 740 });
      await open(page, go);
      const names = [
        `IMG${"20240101123456789".repeat(9)}.jpg`, // 150+ characters, no break points at all
        `${"holiday_photo_".repeat(11)}.jpg`,
        `${"a-very-long-photo-name-".repeat(7)}.jpg`,
        `Zażółć gęślą jaźń ${"word ".repeat(30)}.jpg`,
      ];
      for (const name of names) {
        await chooseBuffer(page, { name, mimeType: "image/jpeg", buffer: fs.readFileSync(FIX + "photo.jpg") });
        await state(page, "ready");
        await compress(page);
        const expectedName = outputFileName(name, "image/jpeg", false);
        const link = page.locator("#ic-download");
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeVisible();
        await expect(link).toHaveText(`Download ${expectedName}`); // the text is the full generated name
        await expect(link).toHaveAttribute("download", expectedName); // and so is the saved one
        await expectNoHorizontalOverflow(page);
        const box = await page.evaluate(() => {
          const rect = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom }; };
          const a = document.querySelector("#ic-download");
          return { button: rect("#ic-download"), card: rect("#ic-result"), note: rect("#ic-result > p:last-of-type"), textFits: a.scrollHeight <= a.clientHeight + 1 && a.scrollWidth <= a.clientWidth + 1, height: a.getBoundingClientRect().height };
        });
        expect(box.textFits, "the text is inside the button").toBe(true);
        expect(box.button.left).toBeGreaterThanOrEqual(box.card.left - 1);
        expect(box.button.right).toBeLessThanOrEqual(box.card.right + 1);
        expect(box.button.right).toBeLessThanOrEqual(width);
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.note.top, "the note below starts after the button ends").toBeGreaterThanOrEqual(box.button.bottom - 1);
        expect(box.button.bottom).toBeLessThanOrEqual(box.card.bottom + 1);
        // the result is still usable, and the real download carries the full name
        await expect(page.locator("#ic-result-dimensions")).toHaveText("640 × 480");
        const file = await download(page);
        expect(file.name).toBe(expectedName);
        expect(file.name.length).toBeGreaterThan(80);
        expect(file.format).toBe("jpeg");
      }
    });
  }

  test("desktop: the original sits beside the settings; the result runs across", async ({ page, go }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, go);
    await chooseReady(page, "photo.jpg");
    const at = (id) => page.locator(id).evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; });
    const a = await at("#ic-original");
    const b = await at("#ic-settings");
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(b.x).toBeGreaterThan(a.x + a.w - 1);
    await compress(page);
    const r = await at("#ic-result");
    expect(r.y).toBeGreaterThan(Math.max(a.y + a.h, b.y + b.h) - 1);
  });
});

test.describe("Image Tools in the site", () => {
  test("the Image Tools page: one real tool, no placeholders, the right title and trail", async ({ page, go, siteRoot, watch }) => {
    await go("image-tools.html");
    await expect(page.locator("h1")).toHaveText("Image Tools");
    expect(await page.title()).toBe("Image Tools | ToolZen Hub");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe("https://toolzenhub.in/image-tools.html");
    const crumbs = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
    expect(crumbs).toEqual(["Home", "All Tools", "Image Tools"]);
    await expect(page.locator(`a[href$="tools/image-compressor-resizer/"]`)).toHaveCount(1);
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(/coming soon/i);
    await expect(page.locator("main")).toContainText("Private browser-based tools for resizing and optimizing images.");
    expectClean(watch);
    void siteRoot;
  });

  test("All Tools lists Image Tools as a fourth section with one tool, from the metadata; the other sections keep their counts", async ({ page, go }) => {
    await go("tools.html");
    await expect(page.locator(".directory-section__title a")).toHaveText(["Calculators", "Time Tools", "Developer Tools", "Image Tools"]);
    await expect(page.locator(".directory-section__count")).toHaveText([/^\d+ tools$/, "5 tools", "4 tools", "1 tool"]);
    const image = page.locator(".directory-section", { has: page.locator('.directory-section__title a:text-is("Image Tools")') });
    await expect(image.locator('a[href$="tools/image-compressor-resizer/"]')).toHaveCount(1);
    for (const section of ["Calculators", "Time Tools", "Developer Tools"]) {
      const other = page.locator(".directory-section", { has: page.locator(`.directory-section__title a:text-is("${section}")`) });
      await expect(other.locator('a[href$="tools/image-compressor-resizer/"]')).toHaveCount(0);
    }
  });

  test("Home shows the new section from the metadata, and Home to the tool works by clicking", async ({ page, go, siteRoot }) => {
    await go("");
    await expect(page.locator("#categories .category-card").filter({ hasText: "Image Tools" })).toHaveCount(1);
    await expect(page.locator("#categories .category-card").filter({ hasText: "Image Tools" })).toContainText("Compress and resize images in your browser");
    await page.locator("#popular-calculators .section-link").click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}tools.html`);
    await page.locator(".directory-section__title a", { hasText: "Image Tools" }).click();
    await expect(page).toHaveURL((u) => u.pathname === `${siteRoot}image-tools.html`);
    await page.locator('a[href$="tools/image-compressor-resizer/"]').first().click();
    await expect(page.locator("h1")).toHaveText("Image Compressor & Resizer");
  });

  test("global search: the image queries lead with the tool, and the other tools keep their queries", async ({ page, go }) => {
    const first = async (q) => {
      await go(`tools.html?q=${encodeURIComponent(q)}`);
      return page.locator("#tools-results a.directory-result").first();
    };
    for (const q of ["image compressor", "compress image", "image resizer", "resize image", "reduce image size", "image size reducer", "compress jpg", "compress png", "resize photo", "compress image online", "Image Compressor"]) await expect(await first(q), q).toContainText("Image Compressor & Resizer");
    await expect(await first("image compressor"), "meta").toContainText("Image Tools");
    await expect(await first("text diff")).toContainText("Text Diff / Compare");
    await expect(await first("time zone converter")).toContainText("Time Zone Converter");
    await expect(await first("json")).toContainText("JSON Formatter & Validator");
    await expect(await first("income tax")).toContainText("Old vs New Tax Regime Calculator");
    await expect(await first("emi")).toContainText("EMI Calculator");
    await expect(await first("unix timestamp")).toContainText("Unix Timestamp Converter");
    await expect(await first("stopwatch")).toContainText("Stopwatch");
  });

  test("calculator, loan, category, time and developer pages never show it", async ({ page, go }) => {
    await go("categories.html");
    await page.locator("#categories-search-input").fill("image");
    await expect(page.locator("main")).not.toContainText("Image Compressor");
    await go("calculators.html");
    await page.locator("#calculators-search-input").fill("compress image");
    await expect(page.locator("#calculators-grid")).not.toContainText("Image Compressor");
    await go("loans.html");
    await page.locator("#loans-search-input").fill("resize image");
    await expect(page.locator("main")).not.toContainText("Image Compressor");
    for (const route of ["time-tools.html", "developer-tools.html"]) {
      await go(route);
      await expect(page.locator('a[href$="tools/image-compressor-resizer/"]')).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(/image compressor/i);
    }
  });

  test("the other three sections still render and navigate", async ({ page, go, watch }) => {
    await go("calculators/emi/");
    await expect(page.locator("h1")).toContainText("EMI");
    await go("categories.html");
    await expect(page.locator("h1")).toHaveText("Calculator Categories");
    await go("time-tools.html");
    await expect(page.locator("h1")).toHaveText("Time Tools");
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(5);
    await go("developer-tools.html");
    await expect(page.locator("h1")).toHaveText("Developer Tools");
    await expect(page.locator(".directory-tools a, .category-page-card")).toHaveCount(4);
    await go("tools/time-zone-converter/");
    await expect(page.locator("h1")).toHaveText("Time Zone Converter");
    expectClean(watch);
  });
});
