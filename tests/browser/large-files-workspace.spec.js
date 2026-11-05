/**
 * Large files at the sidebar workspace widths (2026-11-05).
 *
 * The rules for big images and PDFs (limits, refusals, 600-page merges) are covered by
 * image-compressor-resizer.spec.js and pdf-tools.spec.js. What this file adds is the new page shape: the tool
 * beside the sidebar at 1000 to 1600 px, no sideways scroll with a large preview or a long file list, and the
 * promise that hiding and showing the sidebar in the middle of work changes nothing the visitor has done
 * (chosen file, typed settings, result, download).
 *
 * Files are made in the page or in the test; nothing large is committed. Sizes are kept modest (12 MP, 2 x 150 pages)
 * because the machine running the tests has little memory. Not covered: a physical phone, Safari, Firefox.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { readPages } from "../helpers/pdf-pages.mjs";

const pdfLib = await import(pathToFileURL(path.resolve("assets/js/vendor/pdf-lib/pdf-lib.esm.min.js")).href);

async function numbered(n, name) {
    const d = await pdfLib.PDFDocument.create({ updateMetadata: false });
    const f = await d.embedFont(pdfLib.StandardFonts.Helvetica);
    for (let i = 1; i <= n; i += 1) d.addPage([300, 300]).drawText(`N${i}`, { x: 10, y: 10, size: 20, font: f });
    return { name, mimeType: "application/pdf", buffer: Buffer.from(await d.save({ useObjectStreams: false })) };
}

const hide = (page) => page.locator(".section-rail__hide").click();
const show = (page) => page.locator(".section-rail__show").click();

async function generate(page, { w, h, name }) {
    await page.evaluate(async ({ w, h, name }) => {
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const x = c.getContext("2d");
        const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#2b5876"); g.addColorStop(1, "#e6b17e"); x.fillStyle = g; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 60; i++) { x.fillStyle = `hsla(${(i * 47) % 360},60%,50%,0.5)`; x.beginPath(); x.arc((i * 7919) % w, (i * 104729) % h, 30 + (i * 13) % 200, 0, 6.283); x.fill(); }
        const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
        c.width = 0; c.height = 0;
        const dt = new DataTransfer(); dt.items.add(new File([blob], name, { type: "image/jpeg" }));
        const input = document.querySelector("#ic-file"); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
    }, { w, h, name });
}

for (const width of [1000, 1280, 1600]) {
    test.describe(`at ${width} px`, () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
        });

        test("Image Compressor: a 12 MP photo is previewed, resized and downloaded; hiding the sidebar changes nothing", async ({ page, go }) => {
            await go("tools/image-compressor-resizer/");
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-ready", "true");
            await generate(page, { w: 4000, h: 3000, name: "big.jpg" });
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "ready");
            await expect(page.locator("#ic-original-dimensions")).toHaveText("4,000 × 3,000");
            await expectNoHorizontalOverflow(page);

            await page.getByRole("button", { name: "Long side 1920", exact: true }).click();
            await expect(page.locator("#ic-width")).toHaveValue("1920");

            const before = await page.locator("#ic-original").boundingBox();
            await hide(page);
            await expect(page.locator("#ic-width")).toHaveValue("1920");
            await expect(page.locator("#ic-original-dimensions")).toHaveText("4,000 × 3,000");
            const wide = await page.locator("#ic-original").boundingBox();
            expect(wide.width).toBeGreaterThanOrEqual(before.width); // the freed column goes to the tool
            await expectNoHorizontalOverflow(page);
            await show(page);
            await expect(page.locator("#ic-width")).toHaveValue("1920");
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "ready");

            await page.getByRole("button", { name: "Compress image", exact: true }).click();
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "done");
            await hide(page); // a finished result survives hiding too
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "done");
            await expect(page.locator("#ic-download")).toBeVisible();
            await expectNoHorizontalOverflow(page);
            const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#ic-download").click()]);
            expect(fs.statSync(await d.path()).size).toBeGreaterThan(1000);
            expect(d.suggestedFilename()).toBe("big-resized.jpg");

            await page.getByRole("button", { name: "Reset", exact: true }).click();
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "empty");
            await expect(page.locator("#ic-download")).toBeHidden();
        });

        test("Merge PDF: 2 x 150 pages listed and merged with the sidebar open, hidden and shown again", async ({ page, go }) => {
            await go("tools/merge-pdf/");
            await expect(page.locator("#mp-panel")).toHaveAttribute("data-ready", "true");
            const big = await numbered(150, "big.pdf");
            await page.locator("#mp-file").setInputFiles([big, { ...big, name: "big-2.pdf" }]);
            await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "ready");
            await expect(page.locator("#mp-summary")).toContainText("300 pages");
            await expectNoHorizontalOverflow(page);

            await hide(page);
            await expect(page.locator("#mp-summary")).toContainText("300 pages");
            await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "ready");
            await expectNoHorizontalOverflow(page);
            await show(page);
            await expect(page.locator("#mp-summary")).toContainText("300 pages");

            await page.getByRole("button", { name: "Merge PDF", exact: true }).click();
            await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "done");
            const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#mp-download").click()]);
            const pages = readPages(new Uint8Array(fs.readFileSync(await d.path()))).pages.map((p) => p.label);
            expect(pages).toHaveLength(300);
            expect([pages[0], pages[149], pages[150], pages[299]]).toEqual(["N1", "N150", "N1", "N150"]);

            await page.getByRole("button", { name: "Reset", exact: true }).click();
            await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "empty");
        });

        test("refusals read well beside the sidebar: a 26 MB file and an unreadable PDF", async ({ page, go }) => {
            await go("tools/image-compressor-resizer/");
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-ready", "true");
            await page.locator("#ic-file").setInputFiles({ name: "huge.jpg", mimeType: "image/jpeg", buffer: Buffer.alloc(26 * 1024 * 1024, 1) });
            await expect(page.locator("#ic-error")).toContainText("over the 25.0 MB limit");
            await expectNoHorizontalOverflow(page);

            await go("tools/merge-pdf/");
            await expect(page.locator("#mp-panel")).toHaveAttribute("data-ready", "true");
            await page.locator("#mp-file").setInputFiles({ name: "broken.pdf", mimeType: "application/pdf", buffer: Buffer.from("not a pdf at all") });
            await expect(page.locator("#mp-error")).toBeVisible();
            await expectNoHorizontalOverflow(page);
        });
    });
}

test.describe("A running timer and its laps are untouched by hiding and showing the sidebar", () => {
    test("Stopwatch keeps running and keeps its laps", async ({ page, go }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.clock.install({ time: new Date("2026-03-10T10:00:00Z") });
        await page.clock.pauseAt(new Date("2026-03-10T10:00:01Z"));
        await go("tools/stopwatch/");
        await expect(page.locator("#sw-panel")).toHaveAttribute("data-ready", "true");
        await page.getByRole("button", { name: "Start", exact: true }).click();
        await page.clock.runFor(5000);
        await page.getByRole("button", { name: "Lap", exact: true }).click();
        await expect(page.locator("#sw-lap-rows tr")).toHaveCount(1);
        await hide(page);
        await page.clock.runFor(5000);
        await expect(page.locator("#sw-panel")).toHaveAttribute("data-state", "running");
        await show(page);
        await page.clock.runFor(1000);
        await expect(page.locator("#sw-lap-rows tr")).toHaveCount(1);
        await expect(page.locator("#sw-display")).toHaveText(/^00:(10\.[5-9]|11\.[0-5])$/); // about 11 s of fake time has passed, none lost while hidden
    });
});
