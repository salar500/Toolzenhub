/**
 * GA4 consent integration: the pure helpers of assets/js/analytics.js and what the two builds actually contain.
 * The consent behaviour in a browser is covered by tests/browser/analytics.spec.js.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isProductionHost, cleanPageLocation } from "../../assets/js/analytics.js";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ID = "G-YEJZMCXJ7V";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const htmlFiles = (dir) => walk(dir).filter((p) => p.endsWith(".html"));

describe("analytics helpers", () => {
  it("runs on the production host only", () => {
    assert.equal(isProductionHost("toolzenhub.in"), true);
    assert.equal(isProductionHost("www.toolzenhub.in"), true);
    for (const h of ["salar500.github.io", "localhost", "127.0.0.1", "tools.example.test", "toolzenhub.in.evil.test"]) {
      assert.equal(isProductionHost(h), false, h);
    }
  });
  it("sends the page address without query string or fragment", () => {
    assert.equal(
      cleanPageLocation({ origin: "https://toolzenhub.in", pathname: "/categories.html", search: "?q=salary+12000", hash: "#x" }),
      "https://toolzenhub.in/categories.html"
    );
  });
});

describe("build output", () => {
  it("production: every page except 404 carries the ID meta, the stylesheet and one analytics module; no inline tag", () => {
    const dist = path.join(PROJECT, "dist");
    const files = htmlFiles(dist);
    assert.ok(files.length > 50);
    for (const f of files) {
      const html = fs.readFileSync(f, "utf8");
      const name = path.relative(dist, f);
      assert.equal(/googletagmanager|gtag\(|dataLayer/.test(html), false, `${name}: no inline tag`);
      const has = html.includes(`name="tz-analytics-id" content="${ID}"`);
      if (name === "404.html") {
        assert.equal(has, false, "404 is not tracked");
        continue;
      }
      assert.equal(has, true, `${name}: id meta`);
      assert.equal((html.match(/tz-analytics-id/g) || []).length, 1, `${name}: one id meta`);
      assert.equal((html.match(/assets\/js\/analytics\.js/g) || []).length, 1, `${name}: one analytics module`);
      assert.ok(html.includes('href="/assets/css/components/consent.css"'), `${name}: consent css`);
    }
  });
  it("preview: no Measurement ID, analytics module or consent file anywhere", () => {
    const dir = path.join(PROJECT, "dist-ghpages");
    assert.equal(fs.existsSync(path.join(dir, "assets/js/analytics.js")), false);
    assert.equal(fs.existsSync(path.join(dir, "assets/css/components/consent.css")), false);
    for (const f of walk(dir).filter((p) => /\.(html|js|css|xml|txt)$/.test(p))) {
      assert.equal(/tz-analytics|analytics\.js|consent\.css|G-YEJZMCXJ7V|data-tz-analytics/.test(fs.readFileSync(f, "utf8")), false, f);
    }
  });
  it("the Measurement ID is not shipped in any production browser module", () => {
    for (const f of walk(path.join(PROJECT, "dist/assets")).filter((p) => /\.(js|css)$/.test(p))) {
      assert.equal(fs.readFileSync(f, "utf8").includes(ID), false, f);
    }
  });
});
