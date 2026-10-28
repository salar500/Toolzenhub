/**
 * Tool Pack 43: Image Compressor & Resizer, rotate, flip, crop and exact size (one image).
 *
 * The risk is wrong pixels, so the downloaded FILES are decoded in the page and sampled: the test photo
 * (tests/fixtures/images/meta-keep.jpg, 320 x 240) has four differently coloured quadrants, red (top left),
 * green (top right), blue (bottom left) and yellow (bottom right). The geometry itself is checked against Pillow
 * in tests/unit/image-geometry.test.mjs; here is what the browser does with it: the controls, the fields and the
 * box on the preview agreeing, the keyboard and the pointer, the size fields and the file name, stale results,
 * and three phone widths.
 *
 * NOT covered here: a physical touch screen (the pointer path is driven with a mouse and with
 * dispatched pointer events), Safari/WebKit and Firefox.
 */
import fs from "node:fs";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { sniffFormat, readSize } from "../../assets/js/tools/image-compressor-resizer/image-engine.js";

const FIX = "tests/fixtures/images/";
const panel = (page) => page.locator("#ic-panel");
const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const val = (page, id) => page.locator(`#ic-crop-${id}`);

async function open(page, go) {
  await go("tools/image-compressor-resizer/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function loadQuadrants(page, name = "meta-keep.jpg") {
  await page.locator("#ic-file").setInputFiles(FIX + name);
  await state(page, "ready");
  await expect(page.locator("#ic-crop-canvas")).toBeAttached();
  await page.waitForFunction(() => document.querySelector("#ic-original-img")?.complete);
}

async function mode(page, label) {
  await page.getByLabel(label, { exact: true }).check();
}

async function setRect(page, x, y, w, h) {
  // size first, then position, so every step stays inside the picture
  for (const [id, v] of [["w", w], ["h", h], ["x", x], ["y", y]]) await val(page, id).fill(String(v));
}

async function compressAndDownload(page) {
  await btn(page, "Compress image").click();
  await state(page, "done");
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#ic-download").click()]);
  const bytes = new Uint8Array(fs.readFileSync(await d.path()));
  const format = sniffFormat(bytes);
  return { name: d.suggestedFilename(), bytes, format, size: readSize(bytes, format) };
}

// the quadrant colour at a fraction of a decoded file: R, G, B or Y
async function colours(page, bytes, type, points) {
  return page.evaluate(async ({ data, type, points }) => {
    const bmp = await createImageBitmap(new Blob([new Uint8Array(data)], { type }));
    const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height; const cx = c.getContext("2d"); cx.drawImage(bmp, 0, 0);
    const out = points.map(([fx, fy]) => {
      const px = cx.getImageData(Math.min(bmp.width - 1, Math.floor(fx * bmp.width)), Math.min(bmp.height - 1, Math.floor(fy * bmp.height)), 1, 1).data;
      return px[0] > 150 && px[1] < 110 && px[2] < 110 ? "R" : px[1] > 110 && px[0] < 110 && px[2] < 130 ? "G" : px[2] > 150 && px[0] < 110 ? "B" : px[0] > 150 && px[1] > 150 && px[2] < 120 ? "Y" : `?${px[0]},${px[1]},${px[2]}`;
    });
    bmp.close();
    return out;
  }, { data: [...bytes], type, points });
}

const CORNERS = [[0.06, 0.06], [0.94, 0.06], [0.06, 0.94], [0.94, 0.94]]; // TL TR BL BR, just inside each corner

test.describe("Image Compressor & Resizer: rotate, flip and crop", () => {

  test("the controls exist for one image, start untouched, and are hidden in a batch", async ({ page, go, watch }) => {
    await open(page, go);
    await expect(page.locator("#ic-geometry")).toBeHidden(); // no image yet: the whole settings form is hidden
    await loadQuadrants(page);
    await expect(page.locator("#ic-geometry")).toBeVisible();
    for (const name of ["Rotate left", "Rotate right", "Flip horizontally", "Flip vertically", "Reset picture"]) await expect(btn(page, name)).toBeVisible();
    await expect(page.locator("#ic-geo-state")).toHaveText("The picture is not rotated, flipped or cropped.");
    await expect(page.getByLabel("No crop")).toBeChecked();
    await expect(page.locator("#ic-crop-block")).toBeHidden();
    await page.locator("#ic-file").setInputFiles([FIX + "photo.jpg", FIX + "screenshot.png"]);
    await expect(page.locator("#ic-batch-list > li")).toHaveCount(2);
    await expect(page.locator("#ic-geometry")).toBeHidden();
    await expect(page.locator("#ic-batch-size")).toContainText("Rotate, flip, crop and an exact width and height are for one image at a time");
    expectClean(watch);
  });

  test("rotate right: 240 x 320, and the corners are the turned colours (blue, red, yellow, green)", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await btn(page, "Rotate right").click();
    await expect(page.locator("#ic-geo-state")).toHaveText("The picture is rotated 90 degrees right.");
    await expect(page.locator("#ic-width")).toHaveValue("240");
    await expect(page.locator("#ic-height")).toHaveValue("320");
    const out = await compressAndDownload(page);
    expect(out.name).toBe("meta-keep-cropped.jpg");
    expect([out.size.width, out.size.height]).toEqual([240, 320]);
    expect(await colours(page, out.bytes, "image/jpeg", CORNERS)).toEqual(["B", "R", "Y", "G"]);
    await expect(page.locator("#ic-edit-result")).toContainText("Edit: rotated 90 degrees right.");
  });

  test("rotate left, 180 degrees, and both flips each put the colours where Pillow puts them", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    const cases = [
      { act: async () => { await btn(page, "Rotate left").click(); }, size: [240, 320], want: ["G", "Y", "R", "B"] },
      { act: async () => { await btn(page, "Rotate left").click(); await btn(page, "Rotate left").click(); }, size: [320, 240], want: ["Y", "B", "G", "R"] },
      { act: async () => { await btn(page, "Reset picture").click(); await btn(page, "Flip horizontally").click(); }, size: [320, 240], want: ["G", "R", "Y", "B"] },
      { act: async () => { await btn(page, "Reset picture").click(); await btn(page, "Flip vertically").click(); }, size: [320, 240], want: ["B", "Y", "R", "G"] },
      { act: async () => { await btn(page, "Reset picture").click(); await btn(page, "Rotate right").click(); await btn(page, "Flip horizontally").click(); }, size: [240, 320], want: ["R", "B", "G", "Y"] }
    ];
    for (const c of cases) {
      await btn(page, "Reset picture").click();
      await c.act();
      const out = await compressAndDownload(page);
      expect([out.size.width, out.size.height]).toEqual(c.size);
      expect(await colours(page, out.bytes, "image/jpeg", CORNERS)).toEqual(c.want);
    }
  });

  test("crop by numbers: the green quadrant exactly; the fields, the box and the preview agree to the pixel", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Aspect ratio");
    await expect(page.locator("#ic-crop-block")).toBeVisible();
    await expect(page.locator("#ic-ratio")).toHaveValue("free");
    await setRect(page, 160, 0, 160, 120);
    for (const [id, v] of [["x", "160"], ["y", "0"], ["w", "160"], ["h", "120"]]) await expect(val(page, id)).toHaveValue(v);
    await expect(page.locator("#ic-width")).toHaveValue("160");
    await expect(page.locator("#ic-height")).toHaveValue("120");
    // the box on the preview maps to the same source pixels
    const map = await page.evaluate(() => {
      const c = document.querySelector("#ic-crop-canvas").getBoundingClientRect();
      const b = document.querySelector("#ic-crop-box").getBoundingClientRect();
      const s = c.width / 320;
      return { x: (b.left - c.left) / s, y: (b.top - c.top) / s, w: b.width / s, h: b.height / s };
    });
    expect(Math.abs(map.x - 160)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(map.y - 0)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(map.w - 160)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(map.h - 120)).toBeLessThanOrEqual(1.5);
    await expect(page.locator("#ic-geo-state")).toContainText("cropped to 160 × 120 at 160, 0");
    const out = await compressAndDownload(page);
    expect(out.name).toBe("meta-keep-cropped.jpg");
    expect([out.size.width, out.size.height]).toEqual([160, 120]);
    expect(await colours(page, out.bytes, "image/jpeg", CORNERS)).toEqual(["G", "G", "G", "G"]);
    await expect(page.locator("#ic-edit-result")).toContainText("cropped to 160 × 120 at 160, 0");
  });

  test("a crop after a rotation is in the picture as shown: the top-left quadrant of the turned picture", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await btn(page, "Rotate right").click(); // now 240 x 320 with blue on top left
    await mode(page, "Aspect ratio");
    await setRect(page, 0, 0, 120, 160);
    const out = await compressAndDownload(page);
    expect([out.size.width, out.size.height]).toEqual([120, 160]);
    expect(await colours(page, out.bytes, "image/jpeg", CORNERS)).toEqual(["B", "B", "B", "B"]);
  });

  test("a bad crop is refused on its field with a message, and the last good box is kept", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Aspect ratio");
    await setRect(page, 10, 10, 100, 100);
    await val(page, "x").fill("300");
    await expect(page.locator("#ic-crop-x-error")).toContainText("inside the picture");
    await expect(val(page, "x")).toHaveAttribute("aria-invalid", "true");
    await val(page, "w").fill("0");
    await expect(page.locator("#ic-crop-w-error")).toContainText("at least 1 pixel");
    await val(page, "h").fill("12.5");
    await expect(page.locator("#ic-crop-h-error")).toContainText("whole number");
    await expect(page.locator("#ic-geo-state")).toContainText("cropped to 100 × 100 at 10, 10");
    await val(page, "x").fill("20");
    await expect(page.locator("#ic-crop-x-error")).toHaveText("");
  });

  test("shapes: 1:1 gives the largest centred square; Custom 5:7 follows its fields; Free gives the whole picture", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Aspect ratio");
    await page.locator("#ic-ratio").selectOption("1:1");
    for (const [id, v] of [["x", "40"], ["y", "0"], ["w", "240"], ["h", "240"]]) await expect(val(page, id)).toHaveValue(v);
    await expect(page.locator("#ic-width")).toHaveValue("240");
    await expect(page.locator("#ic-height")).toHaveValue("240");
    // with a fixed shape, changing the width changes the height
    await val(page, "w").fill("120");
    await expect(val(page, "h")).toHaveValue("120");
    await page.locator("#ic-ratio").selectOption("custom");
    await expect(page.locator("#ic-ratio-custom")).toBeVisible();
    await page.locator("#ic-ratio-w").fill("5");
    await page.locator("#ic-ratio-h").fill("7");
    await expect(val(page, "h")).toHaveValue("240");
    await expect(val(page, "w")).toHaveValue("171"); // round(240 * 5 / 7)
    await page.locator("#ic-ratio").selectOption("free");
    for (const [id, v] of [["x", "0"], ["y", "0"], ["w", "320"], ["h", "240"]]) await expect(val(page, id)).toHaveValue(v);
  });

  test("Exact size 100 x 100 from 320 x 240: a centred 240 x 240 crop, scaled to exactly 100 x 100, never stretched", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Exact size");
    await expect(page.locator("#ic-lock")).toBeDisabled();
    await expect(page.locator("#ic-lock")).not.toBeChecked();
    await expect(page.locator("#ic-exact-note")).toContainText("Cropped to fit, not stretched");
    await page.locator("#ic-width").fill("100");
    await page.locator("#ic-height").fill("100");
    for (const [id, v] of [["x", "40"], ["y", "0"], ["w", "240"], ["h", "240"]]) await expect(val(page, id)).toHaveValue(v);
    await expect(page.locator("#ic-size-notes")).not.toContainText("stretch");
    const out = await compressAndDownload(page);
    expect([out.size.width, out.size.height]).toEqual([100, 100]);
    expect(await colours(page, out.bytes, "image/jpeg", CORNERS)).toEqual(["R", "G", "B", "Y"]);
    // a shape that is not a standard one, in the worked-example style
    await page.locator("#ic-width").fill("200");
    await page.locator("#ic-height").fill("230");
    await expect(val(page, "h")).toHaveValue("240");
    await expect(val(page, "w")).toHaveValue("209"); // round(240 * 200 / 230)
    const second = await compressAndDownload(page);
    expect([second.size.width, second.size.height]).toEqual([200, 230]);
    // leaving Exact size gives the lock back
    await mode(page, "No crop");
    await expect(page.locator("#ic-lock")).toBeEnabled();
    await expect(page.locator("#ic-lock")).toBeChecked();
    await expect(page.locator("#ic-width")).toHaveValue("320");
  });

  test("a bigger output than the crop says so; the form note is the user's to check", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Exact size");
    await page.locator("#ic-width").fill("600");
    await page.locator("#ic-height").fill("600");
    await expect(page.locator("#ic-size-notes")).toContainText("Enlarged: this can look soft.");
    await expect(page.locator("#ic-crop-block")).toContainText("ToolZen Hub does not know it");
    const out = await compressAndDownload(page);
    expect([out.size.width, out.size.height]).toEqual([600, 600]);
    await expect(page.locator("#ic-edit-result")).toContainText("Enlarged: this can look soft.");
  });

  test("the keyboard moves the box: arrows by 1 pixel, Shift by 10, never outside the picture; one calm announcement", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Aspect ratio");
    await setRect(page, 100, 100, 50, 50);
    await page.locator("#ic-crop-box").focus();
    await page.keyboard.press("ArrowRight");
    await expect(val(page, "x")).toHaveValue("101");
    await page.keyboard.press("Shift+ArrowDown");
    await expect(val(page, "y")).toHaveValue("110");
    for (let i = 0; i < 40; i++) await page.keyboard.press("Shift+ArrowLeft");
    await expect(val(page, "x")).toHaveValue("0");
    for (let i = 0; i < 40; i++) await page.keyboard.press("Shift+ArrowDown");
    await expect(val(page, "y")).toHaveValue("190"); // 240 - 50
    await expect(page.locator("#ic-live")).toHaveText("Crop 50 by 50 pixels, left 0, top 190.");
    await page.keyboard.press("PageDown"); // not captured
    await expect(val(page, "y")).toHaveValue("190");
  });

  test("the pointer moves the box and resizes it by a corner, and the fields follow", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Aspect ratio");
    await setRect(page, 20, 20, 100, 80);
    const geo = async () => page.evaluate(() => {
      const c = document.querySelector("#ic-crop-canvas").getBoundingClientRect();
      const b = document.querySelector("#ic-crop-box").getBoundingClientRect();
      return { s: c.width / 320, bx: b.left, by: b.top, bw: b.width, bh: b.height };
    });
    let g = await geo();
    await page.mouse.move(g.bx + g.bw / 2, g.by + g.bh / 2);
    await page.mouse.down();
    await page.mouse.move(g.bx + g.bw / 2 + 40 * g.s, g.by + g.bh / 2 + 30 * g.s, { steps: 4 });
    await page.mouse.up();
    expect(Math.abs(Number(await val(page, "x").inputValue()) - 60)).toBeLessThanOrEqual(2);
    expect(Math.abs(Number(await val(page, "y").inputValue()) - 50)).toBeLessThanOrEqual(2);
    expect([await val(page, "w").inputValue(), await val(page, "h").inputValue()]).toEqual(["100", "80"]);
    g = await geo();
    const handle = page.locator('.ic-crop-handle[data-corner="se"]');
    const hb = await handle.boundingBox();
    expect(hb.width).toBeGreaterThanOrEqual(44);
    expect(hb.height).toBeGreaterThanOrEqual(44);
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb.x + hb.width / 2 + 20 * g.s, hb.y + hb.height / 2 + 10 * g.s, { steps: 4 });
    await page.mouse.up();
    expect(Math.abs(Number(await val(page, "w").inputValue()) - 120)).toBeLessThanOrEqual(2);
    expect(Math.abs(Number(await val(page, "h").inputValue()) - 90)).toBeLessThanOrEqual(2);
    // and the box and the fields still agree
    const g2 = await geo();
    expect(Math.abs(g2.bw / g2.s - Number(await val(page, "w").inputValue()))).toBeLessThanOrEqual(1.5);
  });

  test("a change to the picture removes the earlier result; Reset picture goes back; a new image starts clean", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await btn(page, "Compress image").click();
    await state(page, "done");
    await btn(page, "Flip vertically").click();
    await state(page, "ready");
    await expect(page.locator("#ic-result")).toBeHidden();
    await expect(page.locator("#ic-live")).toContainText("flipped vertically");
    await btn(page, "Reset picture").click();
    await expect(page.locator("#ic-geo-state")).toHaveText("The picture is not rotated, flipped or cropped.");
    await btn(page, "Rotate right").click();
    await page.locator("#ic-file").setInputFiles(FIX + "photo.jpg");
    await expect(page.locator("#ic-original-name")).toHaveText("photo.jpg");
    await expect(page.locator("#ic-geo-state")).toHaveText("The picture is not rotated, flipped or cropped.");
    await expect(page.getByLabel("No crop")).toBeChecked();
    await expect(page.locator("#ic-width")).toHaveValue("640");
    // with no edit the file name is as before
    const out = await compressAndDownload(page);
    expect(out.name).toBe("photo-compressed.jpg");
  });

  test("an EXIF-turned photo is the picture as shown: rotate is relative to what the user sees", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page, "portrait-exif6.jpg"); // shown 240 x 320
    await expect(page.locator("#ic-original-dimensions")).toHaveText("240 × 320");
    await btn(page, "Rotate right").click();
    await expect(page.locator("#ic-width")).toHaveValue("320");
    const out = await compressAndDownload(page);
    expect([out.size.width, out.size.height]).toEqual([320, 240]);
  });

  test("320, 360 and 390 px: no overflow, controls at least 44 px, fields at least 16 px", async ({ page, go }) => {
    await open(page, go);
    await loadQuadrants(page);
    await mode(page, "Aspect ratio");
    await page.locator("#ic-ratio").selectOption("custom");
    for (const width of [320, 360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await expectNoHorizontalOverflow(page);
      for (const chip of await page.locator("#ic-geometry .ic-chip").all()) {
        const box = await chip.boundingBox();
        expect(box.height, `${width}px chip height`).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, `${width}px chip right edge`).toBeLessThanOrEqual(width);
      }
      for (const input of await page.locator("#ic-geometry input[type=text], #ic-geometry select").all()) {
        if (await input.isVisible()) expect(await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
      }
      const stage = await page.locator("#ic-crop-stage").boundingBox();
      expect(stage.x + stage.width).toBeLessThanOrEqual(width);
    }
  });

});
