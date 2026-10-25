/**
 * Builds tests/fixtures/pdf-tools-fixtures.json: small, synthetic PDFs for the PDF tools tests.
 * Disposable documents only; never use a real or personal file.
 *
 *   node tests/fixtures/pdf-tools-fixtures.mjs [python]
 *
 * Needs Python with `pypdf` and `cryptography` (a throwaway virtual environment is fine; pass its
 * python as the argument). The labelled pages ("A-P1" ...) are drawn with the vendored pdf-lib; the
 * decorated and the protected variants are made by pypdf, so they do not come from the code under test.
 * The generated JSON is committed; this script only needs to run again to change the fixtures.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const { PDFDocument, StandardFonts, rgb } = await import(pathToFileURL(path.join(here, "..", "..", "assets", "js", "vendor", "pdf-lib", "pdf-lib.esm.min.js")).href);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-tools-fixtures-"));

async function make(name, label, sizes, objectStreams) {

    const doc = await PDFDocument.create({ updateMetadata: false });
    const font = await doc.embedFont(StandardFonts.Helvetica);

    sizes.forEach(([w, h], i) => {
        const page = doc.addPage([w, h]);
        page.drawText(`${label}-P${i + 1}`, { x: 20, y: h - 60, size: 30, font, color: rgb(0, 0, 0) });
    });

    fs.writeFileSync(path.join(dir, `${name}.pdf`), await doc.save({ useObjectStreams: objectStreams }));

}

await make("a", "A", [[595, 842], [612, 792], [300, 400]], false);
await make("b", "B", [[595, 842], [842, 595]], true);
await make("c", "C", [[200, 200]], false);

const python = process.argv[2] || "python";
const run = spawnSync(python, [path.join(here, "pdf-tools-fixtures.py"), dir, path.join(here, "pdf-tools-fixtures.json")], { stdio: "inherit" });

fs.rmSync(dir, { recursive: true, force: true });

process.exit(run.status ?? 1);
