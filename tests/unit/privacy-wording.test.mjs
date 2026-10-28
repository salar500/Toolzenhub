import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const flat = (file) => fs.readFileSync(new URL(file, import.meta.url), "utf8").replace(/&ldquo;|&rdquo;/g, '"').replace(/\s+/g, " ");

test("privacy page: calculator input stays local, third-party images are disclosed, consent analytics wording is kept", () => {
    const page = flat("../../src/privacy.njk");
    assert.match(page, /What you type into them, and any file you choose, stays on your device and is not sent to us or to Google/);
    assert.match(page, /third-party image host \(currently Unsplash\)/);
    assert.match(page, /happens whatever you choose about analytics/);
    assert.match(page, /It stays switched off until you press "Accept analytics"/);
    assert.match(page, /If you press "Reject analytics", Google Analytics is not loaded and no analytics cookies are set/);
});

test("PPF and XIRR answers speak about what the visitor types, not about the whole page, and point to the privacy page", () => {
    for (const file of ["../../assets/js/calculators/ppf/index.js", "../../assets/js/calculators/xirr/index.js"]) {
        const text = flat(file);
        assert.match(text, /nothing you type is stored,? (or )?sent anywhere|Nothing you type is stored, sent anywhere/i, file);
        assert.match(text, /some article pictures from another site; see the privacy page/, file);
    }
});
