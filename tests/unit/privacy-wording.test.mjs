import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const flat = (file) => fs.readFileSync(new URL(file, import.meta.url), "utf8").replace(/&ldquo;|&rdquo;/g, '"').replace(/\s+/g, " ");

test("privacy page: calculator input stays local, the third-party disclosure matches what the site loads, consent analytics wording is kept", () => {
    const page = flat("../../src/privacy.njk");
    assert.match(page, /What you type into them, and any file you choose, stays on your device and is not sent to us or to Google/);
    assert.match(page, /loads its fonts, pictures and scripts from this site, not from other sites/);
    assert.match(page, /The one third-party service the site can load is Google Analytics, and only if you press "Accept analytics"/);
    assert.doesNotMatch(page, /Unsplash/);
    assert.match(page, /It stays switched off until you press "Accept analytics"/);
    assert.match(page, /If you press "Reject analytics", Google Analytics is not loaded and no analytics cookies are set/);
});

test("PPF and XIRR answers speak about what the visitor types, not about the whole page, and point to the privacy page", () => {
    for (const file of ["../../assets/js/calculators/ppf/index.js", "../../assets/js/calculators/xirr/index.js"]) {
        const text = flat(file);
        assert.match(text, /nothing you type is stored,? (or )?sent anywhere|Nothing you type is stored, sent anywhere/i, file);
        assert.match(text, /loads its own files from this site; see the privacy page/, file);
    }
});
