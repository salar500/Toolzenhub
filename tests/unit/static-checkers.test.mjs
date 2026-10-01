/**
 * Mutation self-tests for the static checkers.
 *
 * A regression net is only trustworthy if it demonstrably FAILS when something breaks. These tests
 * copy the site into a temp folder, inject one realistic fault at a time, run the real checker
 * against that copy (TZ_REPO_ROOT), and assert it is detected. They never touch the working tree.
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SKIP = /(^|[\\/])(node_modules|\.git|tests|test-results|playwright-report)([\\/]|$)/;

let tmpRoot;
before(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tz-mutation-"));
});
after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

/** fresh copy of the deployable site */
function makeCopy(name) {
  const dest = path.join(tmpRoot, name);
  fs.cpSync(REPO, dest, { recursive: true, filter: (src) => !SKIP.test(path.relative(REPO, src)) });
  return dest;
}

function run(script, root) {
  const r = spawnSync(process.execPath, [path.join(REPO, "tests", "static", script)], {
    env: { ...process.env, TZ_REPO_ROOT: root },
    encoding: "utf8",
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}
const edit = (root, file, fn) => {
  const p = path.join(root, file);
  fs.writeFileSync(p, fn(fs.readFileSync(p, "utf8")));
};

describe("static checkers detect injected faults", () => {
  it("baseline: an untouched copy passes both checkers (proves the harness itself works)", () => {
    const root = makeCopy("clean");
    assert.equal(run("check-assets.mjs", root).code, 0, run("check-assets.mjs", root).out);
    assert.equal(run("check-links.mjs", root).code, 0, run("check-links.mjs", root).out);
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

  it("deployment: removing a dev-only path from _config.yml `exclude:` is reported (it would be published)", () => {
    const root = makeCopy("deploy-leak");
    edit(root, "_config.yml", (s) => s.replace(/ {2}- package\.json\r?\n/, ""));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /package\.json.*NOT excluded/);
  });

  it("deployment: excluding something the live site serves is reported", () => {
    const root = makeCopy("deploy-overreach");
    edit(root, "_config.yml", (s) => s.replace(/exclude:\r?\n/, "exclude:\n  - assets\n"));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /used by the live site but is excluded/);
  });

  it("deployment: a missing _config.yml is reported", () => {
    const root = makeCopy("deploy-noconfig");
    fs.rmSync(path.join(root, "_config.yml"));
    const r = run("check-assets.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /_config\.yml is missing/);
  });

  it("links: a dead <a href> in a live HTML page is reported", () => {
    const root = makeCopy("dead-link");
    edit(root, "privacy.html", (s) => s.replace("</main>", '<a href="no-such-page.html">x</a></main>'));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /no-such-page\.html/);
  });

  it("links: a root-relative href (breaks under /Toolzenhub/) is reported", () => {
    const root = makeCopy("root-relative");
    edit(root, "privacy.html", (s) => s.replace("</main>", '<a href="/terms.html">x</a></main>'));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /root-relative href/);
  });

  it("links: a published calculator whose page is removed is reported", () => {
    const root = makeCopy("calc-gone");
    fs.rmSync(path.join(root, "calculators/emi/index.html"));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /emi/);
  });

  it("links: marking a Coming-soon calculator 'available' without a page is reported", () => {
    const root = makeCopy("soon-leak");
    edit(root, "assets/js/data/calculators.js", (s) => s.replace('id: "sip",', 'id: "sip",\n        available: true,'));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /sip/);
  });

  it("links: a Coming-soon URL leaking into sitemap.xml is reported", () => {
    const root = makeCopy("sitemap-leak");
    edit(root, "sitemap.xml", (s) => s.replace("</urlset>", "  <url><loc>https://salar500.github.io/Toolzenhub/calculators/sip/</loc></url>\n</urlset>"));
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /sitemap/);
  });

  it("links: a NEW file that hard-codes the GitHub Pages path is reported", () => {
    const root = makeCopy("hardcode");
    edit(root, "assets/js/utils/dom.js", (s) => s + '\nexport const BAD = "/Toolzenhub/somewhere/";\n');
    const r = run("check-links.mjs", root);
    assert.equal(r.code, 1);
    assert.match(r.out, /hardcoded-prefix/);
    assert.match(r.out, /dom\.js/);
  });
});
