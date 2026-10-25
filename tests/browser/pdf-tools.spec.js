/**
 * Tool Pack 33: Merge PDF, Split PDF, Extract, Reorder and Rotate PDF Pages (PDF Tools).
 *
 * What a browser can break that the unit tests cannot see: the real flows (choose, arrange, create,
 * download) on synthetic documents, refusals, cancel, stale results and object URL cleanup, keyboard
 * use and accessible names, no external request, three phone widths, and the new section's page, its
 * listings and its search. Every downloaded file is read back with tests/helpers/pdf-pages.mjs, a strict
 * reader that knows nothing about the tools. The rules and the PDF operations are covered by
 * tests/unit/pdf-tools.test.mjs.
 *
 * NOT covered here: any physical phone, Safari/WebKit and Firefox (Tool Pack 33 section 7: unverified).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test, expect, expectClean, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { readPages } from "../helpers/pdf-pages.mjs";

const pdfLib = await import(pathToFileURL(path.resolve("assets/js/vendor/pdf-lib/pdf-lib.esm.min.js")).href);

const manifest = JSON.parse(fs.readFileSync("tests/fixtures/pdf-tools-fixtures.json", "utf8")).items;
const fx = (name) => manifest.find((f) => f.name === name);
const pdf = (name, as = `${name}.pdf`) => ({ name: as, mimeType: "application/pdf", buffer: Buffer.from(fx(name).base64, "base64") });
const raw = (name, text) => ({ name, mimeType: "application/pdf", buffer: Buffer.from(text) });

async function numbered(n, name) {
    const d = await pdfLib.PDFDocument.create({ updateMetadata: false });
    const f = await d.embedFont(pdfLib.StandardFonts.Helvetica);
    for (let i = 1; i <= n; i += 1) d.addPage([300, 300]).drawText(`N${i}`, { x: 10, y: 10, size: 20, font: f });
    return { name, mimeType: "application/pdf", buffer: Buffer.from(await d.save({ useObjectStreams: false })) };
}

const read = (bytes) => readPages(new Uint8Array(bytes));
const labels = (bytes) => read(bytes).pages.map((p) => p.label);

async function saved(page, locator) {
    const [d] = await Promise.all([page.waitForEvent("download"), locator.click()]);
    return { name: d.suggestedFilename(), bytes: fs.readFileSync(await d.path()) };
}

/* Each tool: its route, id prefix and the buttons' names */
const TOOLS = {
    merge: { route: "tools/merge-pdf/", p: "mp", h1: "Merge PDF", create: "Merge PDF" },
    split: { route: "tools/split-pdf/", p: "sp", h1: "Split PDF", create: "Split PDF" },
    pages: { route: "tools/pdf-pages/", p: "pg", h1: "Extract, Reorder and Rotate PDF Pages", create: "Create PDF" }
};

async function open(page, go, tool) {
    await go(tool.route);
    await expect(page.locator(`#${tool.p}-panel`)).toHaveAttribute("data-ready", "true");
}

const state = (page, tool, value) => expect(page.locator(`#${tool.p}-panel`)).toHaveAttribute("data-state", value);
const createButton = (page, tool) => page.getByRole("button", { name: tool.create, exact: true });
const resetButton = (page) => page.getByRole("button", { name: "Reset", exact: true });
const choose = (page, tool, ...files) => page.locator(`#${tool.p}-file`).setInputFiles(files.length === 1 ? files[0] : files);


for (const [key, tool] of Object.entries(TOOLS)) {

    test.describe(`${tool.h1}: the page`, () => {

        test("breadcrumb, labels, empty state and limits text", async ({ page, go, watch, siteRoot }) => {
            await open(page, go, tool);
            await expect(page.locator("h1")).toHaveText(tool.h1);
            await expect(page.locator("h1")).toHaveCount(1);
            const crumbs = (await page.locator(".calculator-breadcrumb").locator("a, strong").allInnerTexts()).map((t) => t.trim());
            expect(crumbs).toEqual(["Home", "PDF Tools", tool.h1]);
            const hrefs = await page.locator(".calculator-breadcrumb a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
            expect(hrefs).toEqual([siteRoot, `${siteRoot}pdf-tools.html`]);
            await state(page, tool, "empty");
            await expect(createButton(page, tool)).toBeDisabled();
            await expect(page.locator(`#${tool.p}-cancel`)).toBeHidden();
            await expect(page.locator(`#${tool.p}-result`)).toBeHidden();
            await expect(page.locator(`#${tool.p}-file`)).toHaveAttribute("accept", "application/pdf,.pdf");
            expect(await page.locator(`#${tool.p}-file`).getAttribute("multiple") !== null).toBe(key === "merge");
            await expect(page.locator(`#${tool.p}-file-hint`)).toContainText("not uploaded by this tool");
            await expect(page.locator(`#${tool.p}-file-hint`)).toContainText(/password-protected PDFs? (is|are) not accepted/i);
            await expect(page.locator(".calculator-info").filter({ hasText: "Limits and Privacy" })).toContainText("does not remove protection");
            await expect(page.locator("main")).not.toContainText(/lossless|no quality loss|100% private|AI-powered|guaranteed|works on every/i);
            expectClean(watch);
        });

        test("refuses protected, damaged, truncated, empty and non-PDF files by name, with a reason", async ({ page, go }) => {
            await open(page, go, tool);
            const a = fx("a");
            const truncated = Buffer.from(a.base64, "base64").subarray(0, Math.floor(a.bytes / 2));
            await choose(page, tool, ...(key === "merge" ? [pdf("enc-aes256"), pdf("enc-rc4"), pdf("enc-owner-only"), raw("garbage.pdf", "%PDF-1.7\n" + "x".repeat(300) + "\n%%EOF\n"), { name: "truncated.pdf", mimeType: "application/pdf", buffer: truncated }, raw("notes.pdf", "plain text, not a pdf"), { name: "empty.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(0) }] : [pdf("enc-aes256")]));
            await expect(page.locator(`#${tool.p}-error`)).toContainText("enc-aes256.pdf");
            const message = await page.locator(`#${tool.p}-error`).innerText();
            expect(message).toContain("protected");
            expect(message).toContain("does not remove protection");
            await expect(page.locator(`#${tool.p}-error`)).toHaveAttribute("role", "alert");
            await state(page, tool, "empty");
            if (key === "merge") {
                /* the box names the first five and counts the rest */
                for (const name of ["empty.pdf", "enc-rc4.pdf", "enc-owner-only.pdf", "garbage.pdf"]) expect(message).toContain(name);
                expect(message).toContain("2 more files were not added");
                await choose(page, tool, { name: "truncated.pdf", mimeType: "application/pdf", buffer: truncated }, raw("notes.pdf", "plain text, not a pdf"));
                await expect(page.locator("#mp-error")).toContainText("truncated.pdf: This PDF looks incomplete or damaged");
                await expect(page.locator("#mp-error")).toContainText("notes.pdf: This is not a PDF file");
                await expect(page.locator("#mp-list > li")).toHaveCount(0);
            } else {
                for (const [bad, text] of [[raw("garbage.pdf", "%PDF-1.7\n" + "x".repeat(300) + "\n%%EOF\n"), /could not be read/], [{ name: "truncated.pdf", mimeType: "application/pdf", buffer: truncated }, /incomplete or damaged/], [raw("notes.pdf", "plain text"), /not a PDF/], [{ name: "empty.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(0) }, /empty/]]) {
                    await choose(page, tool, bad);
                    await expect(page.locator(`#${tool.p}-error`)).toContainText(bad.name);
                    await expect(page.locator(`#${tool.p}-error`)).toContainText(text);
                    await state(page, tool, "empty");
                }
            }
        });

        test("no request to another site, nothing kept in the address or in storage", async ({ page, go, context, watch }) => {
            await open(page, go, tool);
            await choose(page, tool, ...(key === "merge" ? [pdf("a"), pdf("c")] : [pdf("a")]));
            await state(page, tool, "ready");
            await createButton(page, tool).click();
            await state(page, tool, "done");
            /* the download link is a button: its text must be white on green at rest (the shared link colour once won over a single class) */
            await expect(page.locator("a.pt-download").first()).toHaveCSS("color", "rgb(255, 255, 255)");
            /* the site-wide shell asks Google Fonts for its typeface on every page; the tool, the PDF library and the downloads add nothing */
            expect((context.__external ?? []).filter((r) => !/fonts\.(googleapis|gstatic)\.com/.test(r))).toEqual([]);
            expect(page.url()).not.toMatch(/[?#]/);
            expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
            expectClean(watch);
        });

        for (const [label, width, height] of [["375 px", 375, 740], ["360 px", 360, 740], ["320 px", 320, 640]]) {
            test(`phone width ${label}: no horizontal overflow, controls at least 44 px`, async ({ page, go }) => {
                await page.setViewportSize({ width, height });
                await open(page, go, tool);
                await expectNoHorizontalOverflow(page);
                await choose(page, tool, ...(key === "merge" ? [pdf("a"), pdf("b")] : [pdf("a")]));
                await state(page, tool, "ready");
                await expectNoHorizontalOverflow(page);
                const controls = [createButton(page, tool), resetButton(page)];
                if (key === "merge") controls.push(page.locator("#mp-list button").first());
                if (key === "pages") controls.push(page.locator("#pg-turn"), page.locator("#pg-keep"));
                if (key === "split") controls.push(page.locator("#sp-n"), page.locator("#sp-mode-ranges"));
                for (const locator of controls) {
                    const box = await locator.boundingBox();
                    expect(box.height, await locator.evaluate((e) => e.id || e.textContent.trim())).toBeGreaterThanOrEqual(key === "split" && (await locator.getAttribute("type")) === "radio" ? 20 : 44);
                }
                await createButton(page, tool).click();
                await state(page, tool, "done");
                await expectNoHorizontalOverflow(page);
            });
        }

    });

}


test.describe("Merge PDF: the flow", () => {

    const T = TOOLS.merge;
    const items = (page) => page.locator("#mp-list > li");
    const names = (page) => page.locator("#mp-list .pt-item__name").allTextContents();

    test("choose, reorder, remove: the list, the counts and the announcements", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a"), pdf("b"), pdf("c"));
        await state(page, T, "ready");
        expect(await names(page)).toEqual(["a.pdf", "b.pdf", "c.pdf"]);
        await expect(page.locator("#mp-summary")).toContainText("3 PDFs, 6 pages");
        await expect(items(page).first()).toContainText("PDF 1 of 3 · 3 pages");
        await expect(items(page).nth(1)).toContainText("2 pages");
        await expect(items(page).first().getByRole("button", { name: /^Move up/ })).toHaveAttribute("aria-disabled", "true");
        await expect(items(page).last().getByRole("button", { name: /^Move down/ })).toHaveAttribute("aria-disabled", "true");

        await page.getByRole("button", { name: "Move up: c.pdf" }).click();
        expect(await names(page)).toEqual(["a.pdf", "c.pdf", "b.pdf"]);
        await expect(page.locator("#mp-live")).toContainText("c.pdf is now PDF 2 of 3");
        await expect(page.getByRole("button", { name: "Move up: c.pdf" })).toBeFocused();

        await page.getByRole("button", { name: "Remove: a.pdf" }).click();
        expect(await names(page)).toEqual(["c.pdf", "b.pdf"]);
        await expect(page.locator("#mp-live")).toContainText("a.pdf removed. 2 PDFs left.");

        await page.getByRole("button", { name: "Remove: b.pdf" }).click();
        await expect(createButton(page, T)).toBeDisabled();
        await expect(page.locator("#mp-create-hint")).toContainText("Add one more PDF");
        await page.getByRole("button", { name: "Remove: c.pdf" }).click();
        await state(page, T, "empty");
        await expect(page.locator("#mp-file")).toBeFocused();
    });

    test("the merged PDF has every page of every file, in the list order, and the keyboard is enough", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a"), pdf("b"), pdf("c"), pdf("a-deco"));
        await state(page, T, "ready");
        await page.getByRole("button", { name: "Move down: a.pdf" }).focus();
        await page.keyboard.press("Enter"); // a now second: b, a, c, a-deco
        await createButton(page, T).focus();
        await page.keyboard.press("Space");
        await state(page, T, "done");
        await expect(page.locator("#mp-result-title")).toBeFocused();
        await expect(page.locator("#mp-download")).toHaveAttribute("href", /^blob:/);

        const out = await saved(page, page.locator("#mp-download"));
        const result = read(out.bytes);
        const expected = ["b", "a", "c", "a-deco"].flatMap((n) => fx(n).pages);

        expect(out.name).toBe("merged.pdf");
        expect(result.pages.map((p) => p.label)).toEqual(expected.map((p) => p.label));
        expect(result.pages.map((p) => [p.width, p.height, p.rotate])).toEqual(expected.map((p) => [p.width, p.height, p.rotate]));
        expect(result.bookmarks).toBe(false);
        expect(result.hasProducer || result.hasCreationDate || result.mentionsLibrary).toBe(false);
        await expect(page.locator("#mp-result-summary")).toContainText("4 PDFs joined into 9 pages");
        await expect(page.locator("#mp-result")).toContainText("Bookmarks are not kept");
    });

    test("a change after the file exists removes it and revokes its address; Reset leaves nothing", async ({ page, go }) => {
        await page.addInitScript(() => {
            window.__urls = { made: [], revoked: [] };
            const make = URL.createObjectURL.bind(URL);
            const revoke = URL.revokeObjectURL.bind(URL);
            URL.createObjectURL = (o) => { const u = make(o); window.__urls.made.push(u); return u; };
            URL.revokeObjectURL = (u) => { window.__urls.revoked.push(u); return revoke(u); };
        });
        await open(page, go, T);
        await choose(page, T, pdf("a"), pdf("c"));
        await createButton(page, T).click();
        await state(page, T, "done");
        const first = await page.locator("#mp-download").getAttribute("href");

        await page.getByRole("button", { name: "Move down: a.pdf" }).click();
        await state(page, T, "ready");
        await expect(page.locator("#mp-result")).toBeHidden();
        await expect(page.locator("#mp-live")).toContainText("The merged PDF was removed");
        expect(await page.evaluate(() => window.__urls.revoked)).toContain(first);

        await createButton(page, T).click();
        await state(page, T, "done");
        await resetButton(page).click();
        await state(page, T, "empty");
        const urls = await page.evaluate(() => window.__urls);
        expect(urls.made.length).toBe(2);
        expect([...urls.revoked].sort()).toEqual([...urls.made].sort());
        await expect(items(page)).toHaveCount(0);
        await expect(page.locator("#mp-file")).toBeFocused();
    });

    test("Cancel drops the job: no file, the page is usable again, and a late answer never appears", async ({ page, go }) => {
        await page.addInitScript(() => {
            window.__slow = false;
            const original = File.prototype.arrayBuffer;
            File.prototype.arrayBuffer = async function () { if (window.__slow) await new Promise((r) => setTimeout(r, 1500)); return original.call(this); };
            window.__made = 0;
            const make = URL.createObjectURL.bind(URL);
            URL.createObjectURL = (o) => { window.__made += 1; return make(o); };
        });
        await open(page, go, T);
        await choose(page, T, pdf("a"), pdf("b"));
        await state(page, T, "ready");
        await page.evaluate(() => { window.__slow = true; });
        await createButton(page, T).click();
        await state(page, T, "working");
        await expect(page.locator("#mp-progress")).toBeVisible();
        await expect(page.locator("#mp-editable")).toHaveJSProperty("inert", true);
        await expect(page.locator("#mp-cancel")).toBeFocused();
        await page.locator("#mp-cancel").click();
        await state(page, T, "ready");
        await expect(page.locator("#mp-live")).toContainText("Cancelled");
        await expect(createButton(page, T)).toBeEnabled();
        await page.waitForTimeout(2500); // longer than the slowed read: a late result must not show up
        await expect(page.locator("#mp-result")).toBeHidden();
        expect(await page.evaluate(() => window.__made)).toBe(0);
        await page.evaluate(() => { window.__slow = false; });
        await createButton(page, T).click();
        await state(page, T, "done");
    });

    test("a failure in the middle of the job names the file and leaves the page usable", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a"), pdf("c"));
        await state(page, T, "ready");
        /* make the second file unreadable at the moment of merging, as a file removed from disk would be */
        await page.evaluate(() => {
            let calls = 0;
            const original = File.prototype.arrayBuffer;
            File.prototype.arrayBuffer = function () { calls += 1; return this.name === "c.pdf" ? Promise.reject(new Error("gone")) : original.call(this); };
        });
        await createButton(page, T).click();
        await expect(page.locator("#mp-error")).toContainText("c.pdf");
        await expect(page.locator("#mp-error")).toContainText("could not be merged");
        await state(page, T, "ready");
        await expect(createButton(page, T)).toBeEnabled();
        await expect(page.locator("#mp-result")).toBeHidden();
    });

    test("limits: the 21st PDF is refused by name and the rest is kept", async ({ page, go }) => {
        await open(page, go, T);
        const one = pdf("c");
        await choose(page, T, ...Array.from({ length: 21 }, (_, i) => ({ ...one, name: `file-${String(i + 1).padStart(2, "0")}.pdf` })));
        await expect(items(page)).toHaveCount(20);
        await expect(page.locator("#mp-error")).toContainText("file-21.pdf");
        await expect(page.locator("#mp-error")).toContainText("up to 20 PDFs");
    });

    test("a large merge: 2 x 300 pages come out as 600 pages in order", async ({ page, go }) => {
        await open(page, go, T);
        const big = await numbered(300, "big.pdf");
        await choose(page, T, big, { ...big, name: "big-2.pdf" });
        await state(page, T, "ready");
        await expect(page.locator("#mp-summary")).toContainText("600 pages");
        const out = await saved(page, (await createAndWait(page, T), page.locator("#mp-download")));
        const result = labels(out.bytes);
        expect(result).toHaveLength(600);
        expect([result[0], result[299], result[300], result[599]]).toEqual(["N1", "N300", "N1", "N300"]);
    });

});

async function createAndWait(page, tool) {
    await createButton(page, tool).click();
    await state(page, tool, "done");
}


test.describe("Split PDF: the flow", () => {

    const T = TOOLS.split;

    test("the plan follows the settings and says what is wrong", async ({ page, go }) => {
        await open(page, go, T);
        await expect(page.locator("#sp-settings")).toBeHidden();
        await choose(page, T, pdf("a"));
        await state(page, T, "ready");
        await expect(page.locator("#sp-summary")).toContainText("a.pdf: 3 pages");
        await expect(page.locator("#sp-plan-note")).toHaveText("3 parts will be made.");
        await expect(page.locator("#sp-plan > li")).toHaveText(["part-1.pdf: page 1 (1 page)", "part-2.pdf: page 2 (1 page)", "part-3.pdf: page 3 (1 page)"]);

        await page.getByLabel("Pages in each part").fill("2");
        await expect(page.locator("#sp-plan > li")).toHaveText(["part-1.pdf: pages 1 to 2 (2 pages)", "part-2.pdf: page 3 (1 page)"]);
        await page.getByLabel("Pages in each part").fill("0");
        await expect(page.locator("#sp-plan-note")).toContainText("whole number");
        await expect(createButton(page, T)).toBeDisabled();
        await expect(page.locator("#sp-create-hint")).toContainText("Fix the way to cut it");

        await page.getByLabel("At page ranges").check();
        await expect(page.locator("#sp-every-field")).toBeHidden();
        await expect(page.locator("#sp-plan-note")).toHaveText("Write the ranges, one for each part.");
        await page.getByLabel("Page ranges, one part for each").fill("1-2, 9");
        await expect(page.locator("#sp-plan-note")).toHaveText("Page 9 does not exist: this PDF has 3 pages.");
        await page.getByLabel("Page ranges, one part for each").fill("3-1");
        await expect(page.locator("#sp-plan-note")).toContainText("counts down");
        await page.getByLabel("Page ranges, one part for each").fill("1-2, 2-3");
        await expect(page.locator("#sp-plan > li")).toHaveText(["part-1.pdf: pages 1 to 2 (2 pages)", "part-2.pdf: pages 2 to 3 (2 pages)"]);
        await expect(createButton(page, T)).toBeEnabled();
    });

    test("every part is its own download with exactly its pages; the parts add up to the source", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a-deco"));
        await state(page, T, "ready");
        await page.getByLabel("At page ranges").check();
        await page.getByLabel("Page ranges, one part for each").fill("1, 2-3");
        await createAndWait(page, T);
        await expect(page.locator("#sp-result-title")).toBeFocused();
        await expect(page.locator("#sp-result-summary")).toContainText("2 PDFs made from a-deco.pdf");
        await expect(page.locator("#sp-parts > li")).toHaveCount(2);

        const first = await saved(page, page.getByRole("link", { name: "Download part-1.pdf" }));
        const second = await saved(page, page.getByRole("link", { name: "Download part-2.pdf" }));

        expect([first.name, second.name]).toEqual(["part-1.pdf", "part-2.pdf"]);
        expect(labels(first.bytes)).toEqual(["A-P1"]);
        expect(read(second.bytes).pages.map((p) => [p.label, p.width, p.height, p.rotate])).toEqual([["A-P2", 612, 792, 90], ["A-P3", 300, 400, 0]]);
        expect(read(first.bytes).pages[0].annotations).toBe(1);
        expect(read(second.bytes).bookmarks).toBe(false);
        expect([...labels(first.bytes), ...labels(second.bytes)]).toEqual(fx("a-deco").pages.map((p) => p.label));
        await expect(page.locator("#sp-result")).toContainText("Bookmarks are not kept");
    });

    test("changing a setting or replacing the PDF removes the parts and revokes every address; Reset restores the defaults", async ({ page, go }) => {
        await page.addInitScript(() => {
            window.__urls = { made: [], revoked: [] };
            const make = URL.createObjectURL.bind(URL);
            const revoke = URL.revokeObjectURL.bind(URL);
            URL.createObjectURL = (o) => { const u = make(o); window.__urls.made.push(u); return u; };
            URL.revokeObjectURL = (u) => { window.__urls.revoked.push(u); return revoke(u); };
        });
        await open(page, go, T);
        await choose(page, T, pdf("a"));
        await createAndWait(page, T);
        await expect(page.locator("#sp-parts > li")).toHaveCount(3);

        await page.getByLabel("Pages in each part").fill("2");
        await state(page, T, "ready");
        await expect(page.locator("#sp-result")).toBeHidden();
        await expect(page.locator("#sp-live")).toContainText("The parts were removed");

        await createAndWait(page, T);
        await choose(page, T, pdf("b"));
        await expect(page.locator("#sp-summary")).toContainText("b.pdf: 2 pages");
        await expect(page.locator("#sp-result")).toBeHidden();

        await createAndWait(page, T);
        await page.getByLabel("At page ranges").check();
        await page.getByLabel("Page ranges, one part for each").fill("1");
        await resetButton(page).click();
        await state(page, T, "empty");
        const urls = await page.evaluate(() => window.__urls);
        expect(urls.made.length).toBe(3 + 2 + 1); // three parts, then two (after the setting changed), then one (for the second PDF)
        expect([...urls.revoked].sort()).toEqual([...urls.made].sort());
        await choose(page, T, pdf("a"));
        await expect(page.getByLabel("Every few pages")).toBeChecked();
        await expect(page.getByLabel("Pages in each part")).toHaveValue("1");
        await expect(page.getByLabel("Page ranges, one part for each")).toHaveValue("");
        await expect(page.locator("#sp-file")).not.toBeFocused();
    });

    test("limit: more than 20 parts is refused with the way out, and 20 is allowed", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, await numbered(30, "thirty.pdf"));
        await state(page, T, "ready");
        await expect(page.locator("#sp-plan-note")).toContainText("That would make 30 files. The most is 20.");
        await expect(createButton(page, T)).toBeDisabled();
        await page.getByLabel("Pages in each part").fill("2");
        await expect(page.locator("#sp-plan > li")).toHaveCount(15);
        await expect(createButton(page, T)).toBeEnabled();
    });

    test("Cancel drops the job and a late result never appears", async ({ page, go }) => {
        await page.addInitScript(() => {
            window.__slow = false;
            const original = File.prototype.arrayBuffer;
            File.prototype.arrayBuffer = async function () { if (window.__slow) await new Promise((r) => setTimeout(r, 1500)); return original.call(this); };
        });
        await open(page, go, T);
        await choose(page, T, pdf("a"));
        await page.evaluate(() => { window.__slow = true; });
        await createButton(page, T).click();
        await state(page, T, "working");
        await page.locator("#sp-cancel").click();
        await state(page, T, "ready");
        await page.waitForTimeout(2500);
        await expect(page.locator("#sp-result")).toBeHidden();
        await expect(page.locator("#sp-parts > li")).toHaveCount(0);
    });

});


test.describe("Extract, Reorder and Rotate PDF Pages: the flow", () => {

    const T = TOOLS.pages;
    const plan = (page) => page.locator("#pg-plan > li");

    test("the plan follows the settings: order, repeats, turns and where they apply", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a-deco"));
        await state(page, T, "ready");
        await expect(page.locator("#pg-summary")).toContainText("a-deco.pdf: 3 pages");
        await expect(page.getByLabel("Pages to keep, in order")).toHaveValue("all");
        await expect(plan(page)).toHaveText(["Page 1 = original page 1", "Page 2 = original page 2", "Page 3 = original page 3"]);
        await page.locator("#pg-facts").evaluate((e) => e.closest("details").open = true);
        await expect(page.locator("#pg-facts > li")).toHaveText(["Page 1: 595 × 842 points", "Page 2: 612 × 792 points, turned 90°", "Page 3: 300 × 400 points"]);

        await page.getByLabel("Pages to keep, in order").fill("3, 1, 1");
        await expect(plan(page)).toHaveText(["Page 1 = original page 3", "Page 2 = original page 1", "Page 3 = original page 1"]);
        await expect(page.locator("#pg-plan-note")).toHaveText("The new PDF will have 3 pages.");

        await expect(page.getByLabel("Turn", { exact: true })).toBeDisabled();
        await page.getByLabel("Turn the pages").selectOption("90");
        await expect(page.getByLabel("Turn", { exact: true })).toBeEnabled();
        await expect(plan(page).first()).toHaveText("Page 1 = original page 3, turned 90° clockwise");
        await page.getByLabel("Turn", { exact: true }).selectOption("some");
        await expect(page.getByLabel("Original pages to turn")).toBeVisible();
        await page.getByLabel("Original pages to turn").fill("1");
        await expect(plan(page)).toHaveText(["Page 1 = original page 3", "Page 2 = original page 1, turned 90° clockwise", "Page 3 = original page 1, turned 90° clockwise"]);
        await page.getByLabel("Original pages to turn").fill("7");
        await expect(page.locator("#pg-plan-note")).toHaveText("Pages to turn: Page 7 does not exist: this PDF has 3 pages.");
        await expect(createButton(page, T)).toBeDisabled();
        await page.getByLabel("Pages to keep, in order").fill("9");
        await expect(page.locator("#pg-plan-note")).toHaveText("Page 9 does not exist: this PDF has 3 pages.");
    });

    test("the new PDF has exactly the pages, order and turns in the plan", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a-deco"));
        await page.getByLabel("Pages to keep, in order").fill("3, 2, 2, 1");
        await page.getByLabel("Turn the pages").selectOption("90");
        await page.getByLabel("Turn", { exact: true }).selectOption("some");
        await page.getByLabel("Original pages to turn").fill("2, 3");
        await createAndWait(page, T);
        await expect(page.locator("#pg-result-title")).toBeFocused();
        await expect(page.locator("#pg-result-summary")).toContainText("4 pages");
        const out = await saved(page, page.locator("#pg-download"));
        const result = read(out.bytes);

        expect(out.name).toBe("pages.pdf");
        expect(result.pages.map((p) => [p.label, p.width, p.height, p.rotate])).toEqual([["A-P3", 300, 400, 90], ["A-P2", 612, 792, 180], ["A-P2", 612, 792, 180], ["A-P1", 595, 842, 0]]);
        expect(result.bookmarks).toBe(false);
        expect(result.hasProducer || result.hasCreationDate || result.mentionsLibrary).toBe(false);
        await expect(page.locator("#pg-result")).toContainText("Bookmarks are not kept");
    });

    test("deleting pages is keeping the rest; an anticlockwise turn is 270", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, await numbered(10, "ten.pdf"));
        await page.getByLabel("Pages to keep, in order").fill("1-2, 4-10");
        await page.getByLabel("Turn the pages").selectOption("270");
        await createAndWait(page, T);
        const result = read((await saved(page, page.locator("#pg-download"))).bytes);
        expect(result.pages.map((p) => p.label)).toEqual(["N1", "N2", "N4", "N5", "N6", "N7", "N8", "N9", "N10"]);
        expect(new Set(result.pages.map((p) => p.rotate))).toEqual(new Set([270]));
    });

    test("changing the pages after the file exists removes it, and Reset restores every control", async ({ page, go }) => {
        await open(page, go, T);
        await choose(page, T, pdf("a"));
        await createAndWait(page, T);
        await page.getByLabel("Pages to keep, in order").fill("1");
        await state(page, T, "ready");
        await expect(page.locator("#pg-result")).toBeHidden();
        await expect(page.locator("#pg-live")).toContainText("The PDF was removed");
        await page.getByLabel("Turn the pages").selectOption("180");
        await resetButton(page).click();
        await state(page, T, "empty");
        await choose(page, T, pdf("a"));
        await expect(page.getByLabel("Pages to keep, in order")).toHaveValue("all");
        await expect(page.getByLabel("Turn the pages")).toHaveValue("0");
        await expect(page.getByLabel("Turn", { exact: true })).toBeDisabled();
    });

    test("Cancel drops the job and a late result never appears", async ({ page, go }) => {
        await page.addInitScript(() => {
            window.__slow = false;
            const original = File.prototype.arrayBuffer;
            File.prototype.arrayBuffer = async function () { if (window.__slow) await new Promise((r) => setTimeout(r, 1500)); return original.call(this); };
        });
        await open(page, go, T);
        await choose(page, T, pdf("a"));
        await page.evaluate(() => { window.__slow = true; });
        await createButton(page, T).click();
        await state(page, T, "working");
        await page.locator("#pg-cancel").click();
        await state(page, T, "ready");
        await page.waitForTimeout(2500);
        await expect(page.locator("#pg-result")).toBeHidden();
    });

});


test.describe("PDF Tools: the section, its listings and search", () => {

    test("the section page lists exactly the three tools, with the central breadcrumb", async ({ page, go, siteRoot, watch }) => {
        await go("pdf-tools.html");
        await expect(page.locator("h1")).toHaveText("PDF Tools");
        await expect(page).toHaveTitle("PDF Tools | ToolZen Hub");
        const hrefs = await page.locator(".directory-group a, .directory-tools a, .category-page-card").evaluateAll((a) => a.map((x) => x.getAttribute("href")).filter(Boolean));
        for (const slug of ["merge-pdf", "split-pdf", "pdf-pages"]) expect(hrefs.some((h) => h === `${siteRoot}tools/${slug}/`), slug).toBe(true);
        expect(hrefs.some((h) => h.includes("photos-to-pdf")), "Photos to PDF stays in Image Tools").toBe(false);
        await expect(page.locator(".calculator-breadcrumb")).toContainText("PDF Tools");
        expectClean(watch);
    });

    test("Image Tools does not list the PDF tools, and All Tools has a PDF Tools section with all three", async ({ page, go, siteRoot }) => {
        await go("image-tools.html");
        const image = await page.locator("main a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
        expect(image.some((h) => /merge-pdf|split-pdf|pdf-pages/.test(h))).toBe(false);
        expect(image.some((h) => h.includes("photos-to-pdf"))).toBe(true);
        await go("tools.html");
        await expect(page.getByRole("heading", { name: "PDF Tools", level: 2 })).toBeVisible();
        const links = await page.locator('.directory-section a[href*="/tools/"]').evaluateAll((a) => a.map((x) => x.getAttribute("href")));
        for (const slug of ["merge-pdf", "split-pdf", "pdf-pages"]) expect(links).toContain(`${siteRoot}tools/${slug}/`);
    });

    test("search finds each tool first by its own name and aliases", async ({ page, go, siteRoot }) => {
        for (const [q, slug] of [["merge pdf", "merge-pdf"], ["combine pdf", "merge-pdf"], ["split pdf", "split-pdf"], ["rotate pdf", "pdf-pages"], ["reorder pdf pages", "pdf-pages"], ["jpg to pdf", "photos-to-pdf"]]) {
            await go(`tools.html?q=${encodeURIComponent(q)}`);
            await expect(page.locator("#tools-results")).not.toBeEmpty();
            await expect(page.locator(".directory-result__title").first(), q).toBeVisible();
            await expect(page.locator("a.directory-result").first(), q).toHaveAttribute("href", `${siteRoot}tools/${slug}/`);
        }
    });

    test("the Home page has the PDF Tools card", async ({ page, go, siteRoot }) => {
        await go("");
        await expect(page.locator("#categories .category-card").last()).toHaveAttribute("href", `${siteRoot}pdf-tools.html`);
        await expect(page.locator("#categories .category-card").last()).toContainText("PDF Tools");
    });

    test("each tool links to the other two in its text, and to nothing outside the section", async ({ page, go, siteRoot }) => {
        for (const [tool, others] of [["merge-pdf", ["split-pdf", "pdf-pages"]], ["split-pdf", ["pdf-pages", "merge-pdf"]], ["pdf-pages", ["merge-pdf", "split-pdf"]]]) {
            await go(`tools/${tool}/`);
            const hrefs = await page.locator("main a").evaluateAll((a) => a.map((x) => x.getAttribute("href")));
            for (const other of others) expect(hrefs, `${tool} -> ${other}`).toContain(`${siteRoot}tools/${other}/`);
            expect(hrefs.some((h) => /photos-to-pdf|image-compressor/.test(h)), tool).toBe(false);
        }
    });

});
