/**
 * M8: the shape of the build output (dist/ production, dist-ghpages/ preview).
 * Cheap structural checks on what would actually be deployed; `npm run build:all` runs before the unit tests.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const inventory = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "inventory", "url-inventory.json"), "utf8"));
const BUILDS = [
  { name: "dist", dir: path.join(PROJECT, "dist"), base: "/", root: true },
  { name: "dist-ghpages", dir: path.join(PROJECT, "dist-ghpages"), base: "/Toolzenhub/", root: false },
];

const list = (root) => {
  const out = [];
  (function go(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) go(p);
      else out.push(path.relative(root, p).split(path.sep).join("/"));
    }
  })(root);
  return out.sort();
};

before(() => {
  for (const b of BUILDS) assert.ok(fs.existsSync(b.dir), `${b.name}/ is missing: run \`npm run build:all\``);
});

for (const build of BUILDS) {
  describe(`${build.name}/ (base ${build.base})`, () => {
    let files;
    before(() => {
      files = list(build.dir);
    });

    it("has exactly the 18 live pages and the 404 document as HTML, once each", () => {
      const html = files.filter((f) => f.endsWith(".html")).sort();
      const want = [...inventory.live.map((p) => p.file), inventory.notFound.file].sort();
      assert.equal(html.length, 19);
      assert.deepEqual(html, want);
      assert.equal(new Set(html).size, html.length);
    });

    it("has no Coming-soon page: no folder for an unpublished tool or article", () => {
      for (const c of inventory.comingSoon) {
        const folder = c.wouldBeUrl.replace(/^\//, "");
        assert.ok(!fs.existsSync(path.join(build.dir, folder)), `${c.wouldBeUrl} exists in ${build.name}`);
      }
    });

    it("contains no sources, templates, tests, tooling or temporary files", () => {
      const bad = files.filter((f) => /\.(njk|md|map|log|tmp|bak|orig)$/.test(f) || /(^|\/)(node_modules|tests|src|scripts|test-results|playwright-report)(\/|$)/.test(f) || /^(package(-lock)?\.json|playwright\.config\.js|eleventy[^/]*\.js|\.gitignore|_config\.yml)$/.test(f) || /\.11tydata\.js$/.test(f));
      assert.deepEqual(bad, []);
    });

    it("has only the expected top-level entries", () => {
      const top = fs.readdirSync(build.dir).sort();
      const html = inventory.live.map((p) => p.file.split("/")[0]);
      const allowed = new Set([...html, inventory.notFound.file, "assets", "loans", "favicon.svg", "robots.txt", "sitemap.xml", ".htaccess"]);
      assert.deepEqual(top.filter((t) => !allowed.has(t)), []);
    });

    it("loans/ holds only the Loan Comparison browser modules", () => {
      const loans = files.filter((f) => f.startsWith("loans/"));
      assert.ok(loans.length > 5);
      assert.ok(loans.every((f) => f.startsWith("loans/loan-comparison/") && f.endsWith(".js")), loans.join(", "));
    });

    it(".htaccess exists in the root-domain build only", () => {
      assert.equal(files.includes(".htaccess"), build.root);
      if (build.root) assert.match(fs.readFileSync(path.join(build.dir, ".htaccess"), "utf8"), /^ErrorDocument 404 \/404\.html$/m);
    });

    it("declares its own base on every page, and the production origin as canonical", () => {
      for (const p of inventory.live) {
        const html = fs.readFileSync(path.join(build.dir, p.file), "utf8");
        assert.match(html, new RegExp(`<meta name="tz-site-base" content="${build.base}">`), p.file);
        assert.ok(html.includes(`<link rel="canonical" href="https://toolzenhub.in${p.url}">`), `${p.file} canonical`);
        assert.ok(!/github\.io/i.test(html.replace(/href="https:\/\/fonts[^"]*"/g, "")), `${p.file} mentions the preview host`);
      }
    });

    it("sitemap and robots are present and on the production origin", () => {
      const sitemap = fs.readFileSync(path.join(build.dir, "sitemap.xml"), "utf8");
      assert.equal((sitemap.match(/<loc>/g) || []).length, 18);
      assert.ok(!/github\.io|Toolzenhub/.test(sitemap));
      const robots = fs.readFileSync(path.join(build.dir, "robots.txt"), "utf8");
      assert.match(robots, /^Sitemap: https:\/\/toolzenhub\.in\/sitemap\.xml$/m);
    });
  });
}

describe("both builds are the same site", () => {
  it("the same files exist in both (apart from .htaccess), with the same sizes for everything that does not carry the base", () => {
    const a = list(BUILDS[0].dir).filter((f) => f !== ".htaccess");
    const b = list(BUILDS[1].dir);
    assert.deepEqual(a, b);
    // assets (CSS, images, JS modules) are byte-identical: only the generated HTML and artifacts carry the base
    const same = (f) => fs.readFileSync(path.join(BUILDS[0].dir, f)).equals(fs.readFileSync(path.join(BUILDS[1].dir, f)));
    for (const f of a.filter((x) => x.startsWith("assets/") || x.startsWith("loans/") || x === "favicon.svg")) assert.ok(same(f), f);
  });
});
