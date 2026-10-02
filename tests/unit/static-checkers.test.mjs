/**
 * Mutation self-tests for the static checkers.
 *
 * A regression net is only trustworthy if it demonstrably FAILS when something breaks. These tests
 * copy the BUILD OUTPUT (dist/, made by `npm run build`) into a temp folder, inject one realistic
 * fault at a time, run the real checker against that copy (TZ_REPO_ROOT), and assert it is detected.
 * They never touch the working tree or the build output itself.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = path.join(PROJECT, "dist");
const PREVIEW = path.join(PROJECT, "dist-ghpages");

let tmpRoot;
before(() => {
  assert.ok(fs.existsSync(DIST) && fs.existsSync(PREVIEW), "build output is missing: run `npm run build:all` first");
  // Under the project (gitignored tests/.tmp), so the copies still resolve the project's package.json
  // ("type": "module") when the checkers import the site's own ES modules from them.
  const parent = path.join(PROJECT, "tests", ".tmp");
  fs.mkdirSync(parent, { recursive: true });
  tmpRoot = fs.mkdtempSync(path.join(parent, "mutation-"));
});
after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

/** fresh copy of a build (the deployable site) */
function makeCopy(name, from = DIST) {
  const dest = path.join(tmpRoot, name);
  fs.cpSync(from, dest, { recursive: true });
  return dest;
}

function run(script, root, base = "/") {
  const r = spawnSync(process.execPath, [path.join(PROJECT, "tests", "static", script)], {
    env: { ...process.env, TZ_REPO_ROOT: root, TZ_SITE_BASE: base },
    encoding: "utf8",
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}
const edit = (root, file, fn) => {
  const p = path.join(root, file);
  fs.writeFileSync(p, fn(fs.readFileSync(p, "utf8")));
};

describe("static checkers detect injected faults", () => {
  it("baseline: untouched copies of BOTH builds pass every checker (proves the harness itself works)", () => {
    const root = makeCopy("clean");
    for (const script of ["check-assets.mjs", "check-links.mjs", "check-seo.mjs"]) {
      const r = run(script, root);
      assert.equal(r.code, 0, `${script}\n${r.out}`);
    }
    const preview = makeCopy("clean-preview", PREVIEW);
    for (const script of ["check-assets.mjs", "check-links.mjs", "check-seo.mjs"]) {
      const r = run(script, preview, "/Toolzenhub/");
      assert.equal(r.code, 0, `${script} (preview)\n${r.out}`);
    }
  });

  it("assets: a wrong-CASE image reference is reported as CASE MISMATCH", () => {
    const root = makeCopy("case");
    fs.renameSync(path.join(root, "assets/Images/hero-calculators.png"), path.join(root, "assets/Images/Hero-Calculators.png"));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /CASE MISMATCH/);
    assert.match(r.out, /hero-calculators\.png/);
  });

  it("assets: a deleted stylesheet that a live page links is reported MISSING", () => {
    const root = makeCopy("missing-css");
    fs.rmSync(path.join(root, "assets/css/components/cards.css"));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /MISSING/);
    assert.match(r.out, /cards\.css/);
  });

  it("assets: a broken ES-module import in live JS is reported", () => {
    const root = makeCopy("broken-import");
    edit(root, "assets/js/app.js", (s) => s.replace('"./router.js"', '"./router-gone.js"'));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /router-gone\.js/);
  });

  it("build output: a development-only file in the output is reported (it would be published)", () => {
    const root = makeCopy("deploy-leak");
    fs.writeFileSync(path.join(root, "package.json"), "{}");
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /development-only path "package\.json" is in the build output/);
  });

  it("build output: an unexpected top-level entry is reported", () => {
    const root = makeCopy("deploy-stray");
    fs.writeFileSync(path.join(root, "notes.txt"), "scratch");
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /unexpected top-level entry "notes\.txt"/);
  });

  it("build output: a tool page whose tool module is missing is reported", () => {
    const root = makeCopy("tool-module-gone");
    fs.rmSync(path.join(root, "assets/js/calculators/emi/index.js"));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /tool module/);
  });

  it("links: a dead <a href> in a live HTML page is reported", () => {
    const root = makeCopy("dead-link");
    edit(root, "privacy.html", (s) => s.replace("</main>", '<a href="/no-such-page.html">x</a></main>'));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /no-such-page\.html/);
  });

  it("links: the preview base leaking into the root-domain build is reported", () => {
    const root = makeCopy("base-leak");
    edit(root, "privacy.html", (s) => s.replace("</main>", '<a href="/Toolzenhub/terms.html">x</a></main>'));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /preview base leaked into the root-domain build/);
  });

  it("links: in the preview build, a link without the base is reported", () => {
    const root = makeCopy("no-base", PREVIEW);
    edit(root, "privacy.html", (s) => s.replace("</main>", '<a href="/terms.html">x</a></main>'));
    const r = run("check-links.mjs", root, "/Toolzenhub/");
    assert.equal(r.code, 1);
    assert.match(r.out, /does not start with this build's base/);
  });

  it("links: a published calculator whose page is removed is reported", () => {
    const root = makeCopy("calc-gone");
    fs.rmSync(path.join(root, "calculators/emi/index.html"));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /emi/);
  });

  it("links: marking a Coming-soon calculator 'published' without a page is reported", () => {
    const root = makeCopy("soon-leak");
    edit(root, "assets/js/data/calculators.js", (s) => s.replace(/(id: "sip",\s+)status: "coming-soon"/, '$1status: "published"'));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /sip/);
  });

  it("links: a Coming-soon URL leaking into sitemap.xml is reported", () => {
    const root = makeCopy("sitemap-leak");
    edit(root, "sitemap.xml", (s) => s.replace("</urlset>", "  <url><loc>https://toolzenhub.in/calculators/sip/</loc></url>\n</urlset>"));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /sitemap/);
  });

  it("links: a sitemap entry on the GitHub Pages preview host is reported", () => {
    const root = makeCopy("sitemap-preview-host");
    edit(root, "sitemap.xml", (s) => s.replace("https://toolzenhub.in/about.html", "https://salar500.github.io/Toolzenhub/about.html"));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /not under the production URL/);
  });

  it("links: robots.txt pointing at the preview sitemap is reported", () => {
    const root = makeCopy("robots-preview");
    edit(root, "robots.txt", (s) => s.replace("https://toolzenhub.in/sitemap.xml", "https://salar500.github.io/Toolzenhub/sitemap.xml"));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /robots/);
  });

  it("links: a NEW file that hard-codes the GitHub Pages path is reported", () => {
    const root = makeCopy("hardcode");
    edit(root, "assets/js/utils/dom.js", (s) => s + '\nexport const BAD = "/Toolzenhub/somewhere/";\n');
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /hardcoded-prefix/);
    assert.match(r.out, /dom\.js/);
  });

  it("seo: a canonical on the preview host is reported", () => {
    const root = makeCopy("canonical-preview");
    edit(root, "about.html", (s) => s.replace('href="https://toolzenhub.in/about.html"', 'href="https://salar500.github.io/Toolzenhub/about.html"'));
    const r = run("check-seo.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /canonical/);
  });

  it("seo: a missing canonical is reported", () => {
    const root = makeCopy("canonical-gone");
    edit(root, "calculators/emi/index.html", (s) => s.replace(/<link rel="canonical"[^>]*>/, ""));
    const r = run("check-seo.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /canonical/);
  });

  it("seo: an article whose body is not in the HTML is reported", () => {
    const root = makeCopy("article-empty");
    edit(root, "articles/loan-comparison/emi-vs-total-interest/index.html", (s) => s.replace(/<article class="article">[\s\S]*?<\/article>/, '<article class="article"></article>'));
    const r = run("check-seo.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /article body/);
  });

  it("seo: a non-ISO structured-data date is reported", () => {
    const root = makeCopy("date-format");
    edit(root, "articles/loan-comparison/what-is-loan-prepayment/index.html", (s) => s.replace('"datePublished":"2026-08-25"', '"datePublished":"Aug 25, 2026"'));
    const r = run("check-seo.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /ISO/);
  });

  it("seo: a tool page that loads another tool's script is reported", () => {
    const root = makeCopy("tool-scope");
    edit(root, "calculators/emi/index.html", (s) => s.replace("</body>", '<script type="module" src="/assets/js/app.js"></script></body>'));
    const r = run("check-seo.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /scripts/);
  });
});
