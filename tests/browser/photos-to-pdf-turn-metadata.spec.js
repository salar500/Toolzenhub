/**
 * Tool Pack 44: Photos to PDF, turning a photo and the details inside a JPEG.
 *
 * What only a real browser can show: the Rotate buttons (names, state text, focus, announcements,
 * keyboard), the thumbnail turning, a turn making the earlier PDF stale, the downloaded PDF holding
 * the photo turned and none of the Exif/XMP/IPTC markers, and the redraw path (a JPEG with an EXIF
 * turn is saved again by the browser) carrying none of the markers either. The PDF is read back with
 * the strict reader in tests/helpers/pdf-structure.mjs. Photos are synthetic
 * (tests/fixtures/images/make-metadata-fixtures.py).
 *
 * NOT covered here: any physical phone, Safari/WebKit and Firefox, and how real PDF viewers draw a
 * turned page (the unit tests paint it from the matrix in the file with an independent Python reader).
 */
import fs from "node:fs";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { parsePdf } from "../helpers/pdf-structure.mjs";

const IMG = "tests/fixtures/images/";
const photo = (name) => ({ name, mimeType: "image/jpeg", buffer: fs.readFileSync(IMG + name) });
const MARKERS = ["ZZ-EXIF-MARKER", "ZZ-XMP-MARKER", "ZZ-IPTC-MARKER", "SECRET-GPS-MARKER", "ZZ-COM-MARKER"];

const panel = (page) => page.locator("#pp-panel");
const state = (page, value) => expect(panel(page)).toHaveAttribute("data-state", value);
const items = (page) => page.locator("#pp-list > li");

async function open(page, go) {
  await go("tools/photos-to-pdf/");
  await expect(panel(page)).toHaveAttribute("data-ready", "true");
}

async function choose(page, ...names) {
  await page.locator("#pp-file").setInputFiles(names.map(photo));
  await expect(items(page)).toHaveCount(names.length);
}

async function createAndRead(page) {
  await page.getByRole("button", { name: "Create PDF", exact: true }).click();
  await state(page, "done");
  const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#pp-download").click()]);
  return new Uint8Array(fs.readFileSync(await d.path()));
}

const latin = (bytes) => Buffer.from(bytes).toString("latin1");

test.describe("Photos to PDF: rotate and photo details", () => {

  test("Rotate left and right: names, state text, thumbnail, focus, announcement and Reset", async ({ page, go, watch }) => {
    await open(page, go);
    await choose(page, "meta-keep.jpg", "photo.jpg");
    const row = items(page).first();
    await expect(row.getByRole("button", { name: "Rotate left: meta-keep.jpg" })).toBeVisible();
    await expect(row.getByRole("button", { name: "Rotate right: meta-keep.jpg" })).toBeVisible();
    await expect(row.locator(".pp-item__meta")).not.toContainText("Rotated");

    await row.getByRole("button", { name: "Rotate right: meta-keep.jpg" }).click();
    await expect(row.locator(".pp-item__meta")).toContainText("Rotated 90 degrees right");
    await expect(row.locator(".pp-thumb")).toHaveAttribute("data-turn", "1");
    await expect(row.getByRole("button", { name: "Rotate right: meta-keep.jpg" })).toBeFocused();
    await expect(page.locator("#pp-live")).toContainText("meta-keep.jpg: rotated 90 degrees right");
    await expect(items(page).nth(1).locator(".pp-thumb")).toHaveAttribute("data-turn", "0");

    await row.getByRole("button", { name: "Rotate right: meta-keep.jpg" }).click();
    await expect(row.locator(".pp-item__meta")).toContainText("Rotated 180 degrees");
    await row.getByRole("button", { name: "Rotate left: meta-keep.jpg" }).click();
    await row.getByRole("button", { name: "Rotate left: meta-keep.jpg" }).click();
    await expect(row.locator(".pp-item__meta")).not.toContainText("Rotated");
    await row.getByRole("button", { name: "Rotate left: meta-keep.jpg" }).click();
    await expect(row.locator(".pp-item__meta")).toContainText("Rotated 90 degrees left");
    await expect(row.locator(".pp-thumb")).toHaveAttribute("data-turn", "3");

    /* the keyboard alone: Enter on a focused button */
    await row.getByRole("button", { name: "Rotate right: meta-keep.jpg" }).focus();
    await page.keyboard.press("Enter");
    await expect(row.locator(".pp-item__meta")).not.toContainText("Rotated");

    await page.getByRole("button", { name: /^Reset/ }).click();
    await expect(items(page)).toHaveCount(0);
    await choose(page, "meta-keep.jpg");
    await expect(items(page).first().locator(".pp-item__meta")).not.toContainText("Rotated");
    expectClean(watch);
  });

  test("a turn goes with its photo when the order changes, and makes an earlier PDF stale", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "meta-keep.jpg", "photo.jpg");
    await page.getByRole("button", { name: "Create PDF", exact: true }).click();
    await state(page, "done");

    await items(page).first().getByRole("button", { name: "Rotate right: meta-keep.jpg" }).click();
    await state(page, "ready");
    await expect(page.locator("#pp-result")).toBeHidden();
    await expect(page.locator("#pp-live")).toContainText("meta-keep.jpg: rotated 90 degrees right");

    await items(page).first().getByRole("button", { name: "Move down: meta-keep.jpg" }).click();
    const moved = items(page).nth(1);
    await expect(moved.locator(".pp-item__name")).toHaveText("meta-keep.jpg");
    await expect(moved.locator(".pp-item__meta")).toContainText("Rotated 90 degrees right");
    await expect(moved.locator(".pp-thumb")).toHaveAttribute("data-turn", "1");
  });

  test("the PDF: a kept JPEG has no Exif/XMP/IPTC markers, and a turned photo gives a turned page", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "meta-keep.jpg", "meta-keep.jpg");
    await items(page).nth(1).getByRole("button", { name: /^Rotate right/ }).click();

    const bytes = await createAndRead(page);
    const text = latin(bytes);
    for (const marker of MARKERS) expect(text, marker).not.toContain(marker);
    expect(text).toContain("ICC_PROFILE");

    const pages = parsePdf(bytes).pages;
    expect(pages).toHaveLength(2);
    expect(pages[0].mediaBox[0]).toBeGreaterThan(pages[0].mediaBox[1]); // landscape photo, A4 auto: landscape page
    expect(pages[1].mediaBox[0]).toBeLessThan(pages[1].mediaBox[1]);    // turned: portrait page
    expect(pages[1].placement.matrix[0]).toBeCloseTo(0, 6);             // a quarter turn has no x scale
    expect(Math.abs(pages[1].placement.matrix[2])).toBeGreaterThan(1);
    expect(pages[0].image.sha256).toBe(pages[1].image.sha256);          // the same stored picture, turned by placement
    await expect(page.locator("#pp-result-summary")).not.toContainText("saved again");
  });

  test("the redraw path (a JPEG with an EXIF turn) also carries none of the markers", async ({ page, go }) => {
    await open(page, go);
    await choose(page, "meta-rot6.jpg", "exif-secret.jpg");
    const bytes = await createAndRead(page);
    const text = latin(bytes);
    for (const marker of MARKERS) expect(text, marker).not.toContain(marker);
    expect(text).not.toContain("Exif");
    await expect(page.locator("#pp-result-summary")).toContainText("1 photo was saved again");
  });

  test("320, 360 and 390 px: no overflow, buttons at least 44 px, a long name stays inside", async ({ page, go }) => {
    await open(page, go);
    const long = { name: "a-very-long-file-name-for-a-passport-photo-front-side-scan-final-version-2.jpg", mimeType: "image/jpeg", buffer: fs.readFileSync(IMG + "photo.jpg") };
    await page.locator("#pp-file").setInputFiles([long]);
    await expect(items(page)).toHaveCount(1);
    for (const width of [320, 360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await expectNoHorizontalOverflow(page);
      for (const button of await items(page).first().locator("button").all()) {
        const box = await button.boundingBox();
        expect(box.height, `${width}px button height`).toBeGreaterThanOrEqual(44);
        expect(box.x + box.width, `${width}px button right edge`).toBeLessThanOrEqual(width);
      }
      const row = await items(page).first().boundingBox();
      expect(row.x + row.width).toBeLessThanOrEqual(width);
    }
  });

});
