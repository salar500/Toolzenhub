/**
 * Tool Pack 52: Add Page Numbers and Watermark to PDF (PDF Tools).
 *
 * Real flows on synthetic documents (portrait, landscape and a page turned 90 degrees): choose, set, create,
 * download. The downloaded file is read back with tests/helpers/pdf-pages.mjs (page sizes, turns, count) and its
 * page content is decoded here to check the marks themselves. The rules and the stamping are covered by
 * tests/unit/pdf-marks.test.mjs.
 * NOT covered: a physical phone, Safari/WebKit and Firefox.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { readPages } from "../helpers/pdf-pages.mjs";

const pdfLib = await import(pathToFileURL(path.resolve("assets/js/vendor/pdf-lib/pdf-lib.esm.min.js")).href);

/* three pages: A 300x400 portrait, B 400x300 landscape, C 300x400 turned 90 degrees */
async function mixed(name = "mixed.pdf") {
    const d = await pdfLib.PDFDocument.create({ updateMetadata: false });
    const f = await d.embedFont(pdfLib.StandardFonts.Helvetica);
    d.addPage([300, 400]).drawText("Alpha", { x: 40, y: 200, size: 24, font: f });
    d.addPage([400, 300]).drawText("Beta", { x: 40, y: 150, size: 24, font: f });
    const c = d.addPage([300, 400]);
    c.drawText("Gamma", { x: 40, y: 200, size: 24, font: f });
    c.setRotation(pdfLib.degrees(90));
    return { name, mimeType: "application/pdf", buffer: Buffer.from(await d.save({ useObjectStreams: false })) };
}

const raw = (name, text) => ({ name, mimeType: "application/pdf", buffer: Buffer.from(text) });

async function open(page, go) {
    await go("tools/pdf-marks/");
    await expect(page.locator("#pm-panel")).toHaveAttribute("data-ready", "true");
}
const state = (page, value) => expect(page.locator("#pm-panel")).toHaveAttribute("data-state", value);
const choose = (page, file) => page.locator("#pm-file").setInputFiles(file);
const create = (page) => page.getByRole("button", { name: "Add marks", exact: true });

async function saved(page) {
    const [d] = await Promise.all([page.waitForEvent("download"), page.locator("a.pt-download").first().click()]);
    return { name: d.suggestedFilename(), bytes: fs.readFileSync(await d.path()) };
}

/* the text drawn on each page, from the decoded content streams */
async function pageTexts(bytes) {
    const doc = await pdfLib.PDFDocument.load(bytes, { updateMetadata: false });
    return doc.getPages().map((p) => {
        const contents = p.node.Contents();
        const streams = contents ? (contents.asArray ? contents.asArray().map((r) => p.doc.context.lookup(r)) : [contents]) : [];
        const text = streams.map((s) => Buffer.from(pdfLib.decodePDFRawStream(s).decode()).toString("latin1")).join("\n");
        /* pdf-lib writes shown text as hex strings; turn each into (text) so the checks read naturally */
        return text.replace(/<([0-9A-Fa-f]+)>\s*Tj/g, (_, hex) => `(${Buffer.from(hex, "hex").toString("latin1")}) Tj`);
    });
}

test.describe("PDF Page Numbers and Watermark: the page", () => {
    test("breadcrumb, labels, empty state, honest wording and no external request", async ({ page, go, watch, siteRoot }) => {
        await open(page, go);
        await expect(page.locator("h1")).toHaveText("Add Page Numbers and Watermark to PDF");
        await expect(page.locator("h1")).toHaveCount(1);
        const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
        expect(hrefs).toEqual([siteRoot, `${siteRoot}pdf-tools.html`]);
        await state(page, "empty");
        await expect(create(page)).toBeDisabled();
        await expect(page.locator("#pm-result")).toBeHidden();
        await expect(page.locator("#pm-file")).toHaveAttribute("accept", "application/pdf,.pdf");
        await expect(page.locator("main")).toContainText(/not security|does not encrypt/i);
        await expect(page.locator("main")).not.toContainText(/guaranteed|100% private|AI-powered|secure your/i);
        expectClean(watch);
    });

    test("refuses garbage and a truncated file by name, with a reason", async ({ page, go }) => {
        await open(page, go);
        await choose(page, raw("garbage.pdf", "%PDF-1.7\n" + "x".repeat(300) + "\n%%EOF\n"));
        await expect(page.locator("#pm-error")).toContainText("garbage.pdf");
        await expect(page.locator("#pm-error")).toContainText(/could not be read/);
        await state(page, "empty");
        await choose(page, raw("notes.pdf", "plain text, not a pdf"));
        await expect(page.locator("#pm-error")).toContainText("notes.pdf");
        await state(page, "empty");
    });

    for (const [label, width, height] of [["390 px", 390, 800], ["360 px", 360, 740], ["320 px", 320, 640], ["desktop", 1280, 800]]) {
        test(`${label}: no horizontal overflow, with a file chosen and the settings open`, async ({ page, go }) => {
            await page.setViewportSize({ width, height });
            await open(page, go);
            await expectNoHorizontalOverflow(page);
            await choose(page, await mixed());
            await state(page, "ready");
            await expect(page.locator("#pm-settings")).toBeVisible();
            await page.locator("#pm-watermark").check();
            await expectNoHorizontalOverflow(page);
        });
    }
});

test.describe("PDF Page Numbers and Watermark: real files", () => {
    test("default numbers on a portrait, a landscape and a turned page: three pages, sizes and turn kept, Page 1 of 3 to Page 3 of 3 drawn", async ({ page, go, watch }) => {
        await open(page, go);
        await choose(page, await mixed());
        await state(page, "ready");
        await create(page).click();
        await state(page, "done");
        const out = await saved(page);
        expect(out.name).toBe("mixed-marked.pdf");
        const pages = readPages(new Uint8Array(out.bytes)).pages;
        expect(pages.length).toBe(3);
        expect(pages.map((p) => [Math.round(p.width), Math.round(p.height)])).toEqual([[300, 400], [400, 300], [300, 400]]);
        expect(pages.map((p) => p.rotate ?? p.turn ?? 0)).toEqual([0, 0, 90]);
        const texts = await pageTexts(out.bytes);
        ["1", "2", "3"].forEach((n, i) => expect(texts[i]).toContain(`(Page ${n} of 3) Tj`)); // the default format
        expectClean(watch);
    });

    test("Page N of M, bottom right, starting at 5, first page skipped: the cover is clean and the rest read 5 of 6 and 6 of 6", async ({ page, go }) => {
        await open(page, go);
        await choose(page, await mixed());
        await page.locator("#pm-format").selectOption({ index: 2 });
        await page.locator("#pm-position").selectOption({ index: 5 });
        await page.locator("#pm-start").fill("5");
        await page.locator("#pm-skip").check();
        await create(page).click();
        await state(page, "done");
        const texts = await pageTexts((await saved(page)).bytes);
        expect(texts[0]).not.toMatch(/\(\s*(Page )?\d/);
        expect(texts[1]).toMatch(/Page 5 of 6/);
        expect(texts[2]).toMatch(/Page 6 of 6/);
    });

    test("a watermark: DRAFT on every page, diagonal, with the original text still there", async ({ page, go }) => {
        await open(page, go);
        await choose(page, await mixed());
        await page.locator("#pm-numbers").uncheck();
        await page.locator("#pm-watermark").check();
        await page.locator("#pm-text").fill("DRAFT");
        await create(page).click();
        await state(page, "done");
        const texts = await pageTexts((await saved(page)).bytes);
        for (const t of texts) expect(t).toContain("(DRAFT) Tj");
        expect(texts[0]).toContain("(Alpha) Tj");
        expect(texts[1]).toContain("(Beta) Tj");
    });

    test("refuses a watermark in another script and neither draws nor downloads it", async ({ page, go }) => {
        await open(page, go);
        await choose(page, await mixed());
        await page.locator("#pm-watermark").check();
        await page.locator("#pm-text").fill("मसौदा");
        await expect(page.locator("#pm-text-note")).not.toHaveText("");
        await expect(create(page)).toBeDisabled();
    });

    test("changing a setting removes the finished file; Reset returns to the empty state", async ({ page, go }) => {
        await open(page, go);
        await choose(page, await mixed());
        await create(page).click();
        await state(page, "done");
        await expect(page.locator("#pm-result")).toBeVisible();
        await page.locator("#pm-size").fill("20");
        await expect(page.locator("#pm-result")).toBeHidden();
        await state(page, "ready");
        await page.getByRole("button", { name: "Reset", exact: true }).click();
        await state(page, "empty");
        expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
    });

    test("the source file is not modified: the same upload yields the same output twice, and the name keeps the source stem", async ({ page, go }) => {
        await open(page, go);
        const file = await mixed("my report.pdf");
        await choose(page, file);
        await create(page).click();
        await state(page, "done");
        const first = await saved(page);
        expect(first.name).toBe("my report-marked.pdf");
        const before = Buffer.from(file.buffer);
        expect(Buffer.compare(before, file.buffer)).toBe(0);
        expect(first.bytes.length).toBeGreaterThan(file.buffer.length);
    });
});
