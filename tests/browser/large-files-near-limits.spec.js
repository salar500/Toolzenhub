/**
 * Large files near their limits, as SUCCESSFUL operations (2026-11-05). The earlier large-files specs measured 4.5 to 24 MP images and 14 to
 * 27 MB PDFs and covered the limits only by refusals. Configured limits: images 25 MB and 40 MP (image-engine.js); PDFs 20 files, 50 MB each,
 * 100 MB in all, 1000 pages (pdf-rules.js). Here: a 35 MP image of about 20 MB that is accepted, previewed, resized and downloaded; a Merge PDF
 * of a PDF of about 41 MB with a 14 MB one (about 55 MB in all, under both PDF limits); and a merge of exactly 20 files (the file-count limit),
 * with the 21st refused with the limit named. Each case reads the output back and prints one `MEASURE {...}` line (heap from
 * performance.memory in MB, rounded by Chrome, excluding decoded bitmaps held outside the heap).
 * Test inputs are random noise (does not compress). Not covered: the exact 25 MB / 40 MP / 50 MB / 100 MB boundaries, a phone, Safari, Firefox.
 */
import fs from "node:fs";
import os from "node:os";
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

async function imagePdf(n, seed) {
    const doc = await pdfLib.PDFDocument.create({ updateMetadata: false });
    for (let i = 0; i < n; i += 1) {
        const w = 1600, h = 1200;
        const data = Buffer.alloc(w * h * 4);
        for (let k = 0; k < data.length; k += 4) { const v = (Math.random() * 256) | 0; data[k] = v; data[k + 1] = (v * 7 + seed) & 255; data[k + 2] = (v * 13 + i) & 255; data[k + 3] = 255; }
        const image = await doc.embedJpg(jpeg.encode({ data, width: w, height: h }, 75).data);
        doc.addPage([600, 450]).drawImage(image, { x: 0, y: 0, width: 600, height: 450 });
    }
    return { name: `scan-${seed}.pdf`, mimeType: "application/pdf", buffer: Buffer.from(await doc.save({ useObjectStreams: false })) };
}

async function textPdf(i) {
    const doc = await pdfLib.PDFDocument.create({ updateMetadata: false });
    doc.addPage([300, 200]).drawText(`File ${i}`, { x: 20, y: 100, size: 18 });
    return { name: `small-${String(i).padStart(2, "0")}.pdf`, mimeType: "application/pdf", buffer: Buffer.from(await doc.save({ useObjectStreams: false })) };
}

test.describe("Image Compressor and Resizer: a large image within the limits", () => {
    test("JPEG 7000x5000 (35 MP, under the 40 MP limit), about 20 MB (under 25 MB): accepted, previewed, resized, downloaded, reset", async ({ page, go }, info) => {
        test.setTimeout(240_000);
        await go("tools/image-compressor-resizer/");
        await expect(page.locator("#ic-panel")).toHaveAttribute("data-ready", "true");
        const before = await heap(page);
        const t0 = Date.now();
        const inBytes = await page.evaluate(async () => {
            const w = 7000, h = 5000;
            const c = document.createElement("canvas"); c.width = w; c.height = h;
            const x = c.getContext("2d");
            const img = x.createImageData(w, h);
            for (let i = 0; i < img.data.length; i += 65536) crypto.getRandomValues(img.data.subarray(i, Math.min(i + 65536, img.data.length)));
            for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
            x.putImageData(img, 0, 0);
            const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.8));
            c.width = 0; c.height = 0;
            const dt = new DataTransfer(); dt.items.add(new File([blob], "noise-35mp.jpg", { type: "image/jpeg" }));
            const input = document.querySelector("#ic-file"); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
            return blob.size;
        });
        expect(MB(inBytes), "input size in MB").toBeGreaterThanOrEqual(15);
        expect(inBytes, "under the 25 MB limit").toBeLessThan(25 * 1024 * 1024);
        await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "ready", { timeout: 90_000 });
        const readyMs = Date.now() - t0;
        await expect(page.locator("#ic-original-dimensions")).toHaveText("7,000 × 5,000");
        await expectNoHorizontalOverflow(page);
        const afterChoose = await heap(page);
        await page.getByRole("button", { name: "Long side 1920", exact: true }).click();
        const t1 = Date.now();
        await page.getByRole("button", { name: "Compress image", exact: true }).click();
        await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "done", { timeout: 150_000 });
        const processMs = Date.now() - t1;
        const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#ic-download").click()]);
        const bytes = new Uint8Array(fs.readFileSync(await d.path()));
        const format = sniffFormat(bytes);
        expect(format).toBe("jpeg");
        expect(readSize(bytes, format)).toEqual({ width: 1920, height: 1371 });
        const afterProcess = await heap(page);
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(page.locator("#ic-panel")).toHaveAttribute("data-state", "empty");
        await expect(page.locator("#ic-download")).toBeHidden();
        report({ tool: "image", viewport: info.project.name, case: "JPEG 7000x5000 (35 MP)", inMB: MB(inBytes), outMB: MB(bytes.length), out: "1920x1371", readyMs, processMs, heapMB: { before, afterChoose, afterProcess, afterReset: await heap(page) } });
    });
});

test.describe("PDF Tools: Merge PDF with large and many files", () => {
    test("a PDF of about 41 MB and one of about 14 MB (about 55 MB in all) merge into one 24-page PDF", async ({ page, go }, info) => {
        test.setTimeout(420_000);
        const big = await imagePdf(18, 11);
        const small = await imagePdf(6, 12);
        expect(MB(big.buffer.length), "the large PDF is near 41 MB").toBeGreaterThanOrEqual(35);
        expect(big.buffer.length, "under the 50 MB per-file limit").toBeLessThan(50 * 1024 * 1024);
        expect(big.buffer.length + small.buffer.length, "under the 100 MB total").toBeLessThan(100 * 1024 * 1024);
        await go("tools/merge-pdf/");
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-ready", "true");
        const before = await heap(page);
        const t0 = Date.now();
        // Playwright refuses an in-memory buffer over 50 MB, so the two files go through a temporary folder (removed afterwards)
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tzh-large-"));
        try {
            const paths = [big, small].map((f) => { const file = path.join(dir, f.name); fs.writeFileSync(file, f.buffer); return file; });
            await page.locator("#mp-file").setInputFiles(paths);
        } finally {
            test.info().attach("temp-folder", { body: dir });
        }
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "ready", { timeout: 120_000 });
        await expect(page.locator("#mp-summary")).toContainText("24 pages");
        await expectNoHorizontalOverflow(page);
        const t1 = Date.now();
        await page.getByRole("button", { name: "Merge PDF", exact: true }).click();
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "done", { timeout: 240_000 });
        const processMs = Date.now() - t1;
        const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#mp-download").click()]);
        const out = fs.readFileSync(await d.path());
        expect(readPages(new Uint8Array(out)).pages).toHaveLength(24);
        const afterProcess = await heap(page);
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "empty");
        fs.rmSync(dir, { recursive: true, force: true });
        report({ tool: "merge-pdf", viewport: info.project.name, case: "41 MB + 14 MB", inMB: [MB(big.buffer.length), MB(small.buffer.length)], outMB: MB(out.length), pages: 24, readyMs: t1 - t0, processMs, heapMB: { before, afterProcess, afterReset: await heap(page) } });
    });

    test("20 files (the file-count limit) merge in the order chosen; a 21st file is refused with the limit named", async ({ page, go }, info) => {
        test.setTimeout(240_000);
        const files = [];
        for (let i = 1; i <= 21; i += 1) files.push(await textPdf(i));
        await go("tools/merge-pdf/");
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-ready", "true");
        await page.locator("#mp-file").setInputFiles(files.slice(0, 20));
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "ready", { timeout: 60_000 });
        await expect(page.locator("#mp-summary")).toContainText("20 pages");
        await page.getByRole("button", { name: "Merge PDF", exact: true }).click();
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "done", { timeout: 120_000 });
        const [d] = await Promise.all([page.waitForEvent("download"), page.locator("#mp-download").click()]);
        const out = fs.readFileSync(await d.path());
        expect(readPages(new Uint8Array(out)).pages).toHaveLength(20);
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await expect(page.locator("#mp-panel")).toHaveAttribute("data-state", "empty");
        // a 21st file: the limit is named and nothing is merged
        await page.locator("#mp-file").setInputFiles(files);
        await expect(page.locator("#mp-panel")).toContainText("Not added: up to 20 PDFs can be joined at once");
        await expect(page.locator("#mp-panel")).toContainText("small-21.pdf");
        await expect(page.locator("#mp-summary")).toContainText("20 pages"); // the first twenty stay; the 21st is not in the list
        report({ tool: "merge-pdf", viewport: info.project.name, case: "20 files merged, 21 refused", pages: 20 });
    });
});
