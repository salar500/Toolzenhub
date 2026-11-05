/**
 * Large files, measured (2026-11-05). Companion to large-files-workspace.spec.js, which proves behaviour beside the sidebar; this file
 * records what the work cost and checks each output against its input. Every case prints one `MEASURE {...}` line (sizes in bytes,
 * milliseconds, and the page's JavaScript heap in MB from performance.memory, which Chrome rounds and which does not include the
 * decoded bitmaps held by the browser outside the heap) and asserts what can be asserted exactly: the input size is in the range stated,
 * the output opens as the right format with the right dimensions or page count, Reset empties the tool, no sideways scroll.
 *
 * Files are made in the page or in the test; nothing large is committed. Image sources are random noise on purpose: it does not
 * compress, so the files are as large as a detailed photograph or a scan.
 * Not covered: a physical phone, Safari, Firefox, files at the limits (25 MB image, 40 MP, 50 MB PDF; the limit refusals are in
 * image-compressor-resizer.spec.js and large-files-workspace.spec.js).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import jpeg from "jpeg-js";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { readPages } from "../helpers/pdf-pages.mjs";
import { sniffFormat, readSize } from "../../assets/js/tools/image-compressor-resizer/image-engine.js";

const pdfLib = await import(pathToFileURL(path.resolve("assets/js/vendor/pdf-lib/pdf-lib.esm.min.js")).href);

const MB = (n) => Math.round((n / 1048576) * 10) / 10;
const heap = (page) => page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null));
const report = (row) => console.log(`MEASURE ${JSON.stringify(row)}`);

/* a file of random pixels, made in the page and put into the tool's file input like a real choice */
async function generateImage(page, { w, h, type, quality, name }) {
    return page.evaluate(async ({ w, h, type, quality, name }) => {
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const x = c.getContext("2d");
        const img = x.createImageData(w, h);
        const buf = img.data;
        for (let i = 0; i < buf.length; i += 65536) crypto.getRandomValues(buf.subarray(i, Math.min(i + 65536, buf.length)));
        for (let i = 3; i < buf.length; i += 4) buf[i] = 255;
        x.putImageData(img, 0, 0);
        const blob = await new Promise((r) => c.toBlob(r, type, quality));
        c.width = 0; c.height = 0;
        const dt = new DataTransfer(); dt.items.add(new File([blob], name, { type }));
        const input = document.querySelector("#ic-file"); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
        return blob.size;
    }, { w, h, type, quality, name });
}

const IMAGES = [
    { label: "JPEG 4000x3000 (12 MP, noise)", w: 4000, h: 3000, type: "image/jpeg", quality: 0.9, name: "noise-12mp.jpg", ext: "jpg", min: 5, max: 25 },
    { label: "JPEG 6000x4000 (24 MP, noise)", w: 6000, h: 4000, type: "image/jpeg", quality: 0.7, name: "noise-24mp.jpg", ext: "jpg", min: 5, max: 25 },
    { label: "PNG 2500x1800 (4.5 MP, noise)", w: 2500, h: 1800, type: "image/png", quality: undefined, name: "noise-scan.png", ext: "png", min: 8, max: 25 }
];

test.describe("Image Compressor and Resizer: large files, measured", () => {
    for (const c of IMAGES) {
        test(`${c.label}: chosen, previewed, resized to a 1920 long side, downloaded, reset`, async ({ page, go }, info) => {
            test.setTimeout(120_000);
            await go("tools/image-compressor-resizer/");
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-ready", "true");
            const before = await heap(page);

            const t0 = Date.now();
            const inBytes = await generateImage(page, c);
            expect(MB(inBytes), `${c.label}: input size in MB`).toBeGreaterThanOrEqual(c.min);
            expect(MB(inBytes)).toBeLessThanOrEqual(c.max);
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "ready");
            const readyMs = Date.now() - t0;
            await expect(page.locator("#ic-original-dimensions")).toHaveText(`${c.w.toLocaleString("en-US")} × ${c.h.toLocaleString("en-US")}`);
            const previewOk = await page.locator("#ic-original img, #ic-original canvas").first().evaluate((el) => (el.naturalWidth ?? el.width) > 0).catch(() => null);
            await expectNoHorizontalOverflow(page);
            const afterChoose = await heap(page);

            await page.getByRole("button", { name: "Long side 1920", exact: true }).click();
            const t1 = Date.now();
            await page.getByRole("button", { name: "Compress image", exact: true }).click();
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "done", { timeout: 90_000 });
            const processMs = Date.now() - t1;
            await expectNoHorizontalOverflow(page);
            const afterProcess = await heap(page);

            const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#ic-download").click()]);
            const bytes = new Uint8Array(fs.readFileSync(await d.path()));
            const format = sniffFormat(bytes);
            const size = readSize(bytes, format);
            expect(format, "output format").toBe(c.ext === "jpg" ? "jpeg" : "png");
            expect(size, "output dimensions").toEqual({ width: 1920, height: Math.round((1920 * c.h) / c.w) });

            await page.getByRole("button", { name: "Reset", exact: true }).click();
            await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "empty");
            await expect(page.locator("#ic-download")).toBeHidden();
            const afterReset = await heap(page);

            report({ tool: "image", viewport: info.project.name, case: c.label, inMB: MB(inBytes), outMB: MB(bytes.length), outFile: d.suggestedFilename(), out: `${size.width}x${size.height}`, readyMs, processMs, previewOk, heapMB: { before, afterChoose, afterProcess, afterReset } });
        });
    }
});

/* a PDF of `n` pages, each with its own random 1600x1200 JPEG (about 1.3 MB each), made here */
async function imagePdf(n, seed) {
    const doc = await pdfLib.PDFDocument.create({ updateMetadata: false });
    for (let i = 0; i < n; i += 1) {
        const w = 1600, h = 1200;
        const data = Buffer.alloc(w * h * 4);
        for (let k = 0; k < data.length; k += 4) { const v = (Math.random() * 256) | 0; data[k] = v; data[k + 1] = (v * 7 + seed) & 255; data[k + 2] = (v * 13 + i) & 255; data[k + 3] = 255; }
        const jpg = jpeg.encode({ data, width: w, height: h }, 75).data;
        const image = await doc.embedJpg(jpg);
        doc.addPage([600, 450]).drawImage(image, { x: 0, y: 0, width: 600, height: 450 });
    }
    return { name: `scan-${seed}.pdf`, mimeType: "application/pdf", buffer: Buffer.from(await doc.save({ useObjectStreams: false })) };
}

test.describe("PDF Tools: large files, measured", () => {
    test("Merge PDF: two image-heavy PDFs (6 pages each) become one 12-page PDF", async ({ page, go }, info) => {
        test.setTimeout(180_000);
        const a = await imagePdf(6, 1);
        const b = await imagePdf(6, 2);
        expect(MB(a.buffer.length)).toBeGreaterThanOrEqual(5);
        await go("tools/merge-pdf/");
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-ready", "true");
        const before = await heap(page);
        const t0 = Date.now();
        await page.locator("#mp-file").setInputFiles([a, b]);
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "ready");
        await expect(page.locator("#mp-summary")).toContainText("12 pages");
        await expectNoHorizontalOverflow(page);
        const t1 = Date.now();
        await page.getByRole("button", { name: "Merge PDF", exact: true }).click();
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "done", { timeout: 120_000 });
        const processMs = Date.now() - t1;
        const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#mp-download").click()]);
        const out = fs.readFileSync(await d.path());
        expect(readPages(new Uint8Array(out)).pages).toHaveLength(12);
        const afterProcess = await heap(page);
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "empty");
        report({ tool: "merge-pdf", viewport: info.project.name, case: "2 x 6 image pages", inMB: [MB(a.buffer.length), MB(b.buffer.length)], outMB: MB(out.length), pages: 12, readyMs: t1 - t0, processMs, heapMB: { before, afterProcess, afterReset: await heap(page) } });
    });

    test("Page Numbers and Watermark: a 6-page, image-heavy PDF keeps its pages and gets the marks", async ({ page, go }, info) => {
        test.setTimeout(180_000);
        const a = await imagePdf(6, 3);
        await go("tools/pdf-marks/");
        await expect(page.locator("#pm-panel")).toHaveAttribute("data-ready", "true");
        const before = await heap(page);
        const t0 = Date.now();
        await page.locator("#pm-file").setInputFiles(a);
        await expect(page.locator("#pm-panel")).toHaveAttribute("data-state", "ready");
        await expectNoHorizontalOverflow(page);
        const t1 = Date.now();
        await page.getByRole("button", { name: "Add marks", exact: true }).click();
        await expect(page.locator("#pm-panel")).toHaveAttribute("data-state", "done", { timeout: 120_000 });
        const processMs = Date.now() - t1;
        const [d] = await Promise.all([page.waitForEvent("download"), page.locator("a.pt-download").first().click()]);
        const out = fs.readFileSync(await d.path());
        expect(readPages(new Uint8Array(out)).pages).toHaveLength(6);
        expect(out.length, "the marked file is not smaller than the images it carries").toBeGreaterThan(a.buffer.length * 0.9);
        const afterProcess = await heap(page);
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(page.locator("#pm-panel")).toHaveAttribute("data-state", "empty");
        report({ tool: "pdf-marks", viewport: info.project.name, case: "6 image pages", inMB: MB(a.buffer.length), outMB: MB(out.length), pages: 6, readyMs: t1 - t0, processMs, heapMB: { before, afterProcess, afterReset: await heap(page) } });
    });
});
