/**
 * Loan Comparison PDF (Calculators Ecosystem 2.0, pack 46): the PDF libraries and the font are served from
 * assets/js/vendor/jspdf/, pinned by hash, and nothing in the PDF code names another host.
 * The hashes are LITERALS recorded when the files were obtained (cdnjs SRI values were compared at that time).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "assets", "js", "vendor", "jspdf");
const PDF = path.join(ROOT, "assets", "js", "calculators", "common", "pdf");

const PINNED = {
    "jspdf.umd.min.js": {
        sha256: "98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875",
        sha512: "sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA=="
    },
    "jspdf.plugin.autotable.min.js": {
        sha256: "27a9c3b61843c6312b87f142d40fe77c0f0f054c9f3cdeccc4bfd5f3322859c8",
        sha512: "sha512-2/YdOMV+YNpanLCF5MdQwaoFRVbTmrJ4u4EpqS/USXAQNUDgI5uwYi6J98WVtJKcfe1AbgerygzDFToxAlOGEQ=="
    },
    "NotoSans-Regular.ttf": {
        sha256: "b85c38ecea8a7cfb39c24e395a4007474fa5a4fc864f6ee33309eb4948d232d5"
    }
};

test("each vendored PDF file matches its pinned hashes and is named in the notice", () => {
    const notice = fs.readFileSync(path.join(DIR, "NOTICE.txt"), "utf8");
    for (const [name, want] of Object.entries(PINNED)) {
        const bytes = fs.readFileSync(path.join(DIR, name));
        assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), want.sha256, name);
        assert.ok(notice.includes(want.sha256), `${name}: NOTICE.txt must state the SHA-256`);
        if (want.sha512) {
            assert.equal("sha512-" + crypto.createHash("sha512").update(bytes).digest("base64"), want.sha512, name);
            assert.ok(notice.includes(want.sha512), `${name}: NOTICE.txt must state the SRI value`);
        }
    }
    assert.match(notice, /jsPDF 2\.5\.1/);
    assert.match(notice, /jsPDF-AutoTable 3\.8\.2/);
    assert.match(notice, /SIL Open Font License/);
});

test("the font is a TrueType file", () => {
    const head = fs.readFileSync(path.join(DIR, "NotoSans-Regular.ttf")).subarray(0, 4);
    assert.deepEqual([...head], [0, 1, 0, 0]);
});

test("the PDF code requests no other host (no http(s) URL outside comments)", () => {
    for (const file of fs.readdirSync(PDF).filter((f) => f.endsWith(".js"))) {
        const code = fs.readFileSync(path.join(PDF, file), "utf8")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/(^|[^:])\/\/.*$/gm, "$1");
        assert.doesNotMatch(code, /https?:\/\//, `${file} must not name a remote host`);
    }
    const loader = fs.readFileSync(path.join(PDF, "pdfLoader.js"), "utf8");
    assert.match(loader, /vendor\/jspdf\//);
});

test("Loan Comparison has no Compare button; results are live", () => {
    const page = fs.readFileSync(path.join(ROOT, "loans", "loan-comparison", "index.js"), "utf8");
    assert.doesNotMatch(page, /compare-loans/);
    assert.match(page, /reset-loans/);
});
