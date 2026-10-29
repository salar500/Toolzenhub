/**
 * M9: design tokens (assets/css/base/variables.css).
 *
 * The four colours below are the literals the stylesheets repeated most (brand green 92x, soft border grey 38x,
 * text ink 36x, muted text 32x). They were replaced by tokens with EXACTLY the same values, so no pixel changed.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CSS_DIR = path.join(PROJECT, "assets", "css");
// Design System 2.0, approved Design C (docs/ecosystem-review/ui-ux-design-system/05-...). Semantic tokens carry literals;
// the older names are aliases that must keep resolving until no stylesheet reads them.
const TOKENS = {
  "--surface-page": "#fafaf9", "--surface-card": "#ffffff", "--line": "#e7e5e4", "--line-control": "#78716c",
  "--ink": "#1c1917", "--ink-muted": "#57534e", "--action": "#1c1917", "--accent": "#4338ca",
  "--state-success": "#166534", "--state-error": "#b91c1c", "--state-warning": "#92400e",
};
const ALIASES = { "--color-brand-green": "--accent", "--color-action-green": "--action", "--color-ink": "--ink", "--color-ink-muted": "--ink-muted", "--color-slate-200": "--line", "--color-primary": "--accent", "--text-primary": "--ink", "--bg-body": "--surface-page" };
const RETIRED_GREEN = ["#0b9f58", "#087f47", "#07733f", "#066b3b"];

const cssFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".css")) cssFiles.push(p);
  }
})(CSS_DIR);
const read = (f) => fs.readFileSync(f, "utf8");
const rel = (f) => path.relative(CSS_DIR, f).split(path.sep).join("/");
const variablesFile = path.join(CSS_DIR, "base", "variables.css");

describe("colour tokens", () => {
  it("semantic tokens are declared with the approved Design C values", () => {
    const vars = read(variablesFile);
    for (const [name, value] of Object.entries(TOKENS)) assert.match(vars, new RegExp(`${name}:\\s*${value};`, "i"), name);
  });

  it("the older names are aliases of the semantic tokens", () => {
    const vars = read(variablesFile);
    for (const [name, target] of Object.entries(ALIASES)) assert.match(vars, new RegExp(`${name}:\\s*var\\(${target}\\);`), name);
  });

  it("the semantic literals live only in variables.css: nowhere else in the stylesheets", () => {
    const offenders = [];
    for (const f of cssFiles.filter((x) => x !== variablesFile)) {
      for (const name of ["--surface-page", "--ink", "--accent", "--line-control"]) if (new RegExp(`${TOKENS[name]}(?![0-9a-f])`, "i").test(read(f))) offenders.push(`${rel(f)} has ${TOKENS[name]}`);
    }
    assert.deepEqual(offenders, []);
  });

  it("the retired brand greens appear in no stylesheet", () => {
    const offenders = [];
    for (const f of cssFiles) for (const value of RETIRED_GREEN) if (new RegExp(`${value}(?![0-9a-f])`, "i").test(read(f))) offenders.push(`${rel(f)} has ${value}`);
    assert.deepEqual(offenders, []);
  });
});

describe("fonts", () => {
  it("Inter is self-hosted: the @font-face points at a file that exists and is within the 70 KB budget", () => {
    const vars = read(variablesFile);
    const m = vars.match(/url\("\.\.\/\.\.\/fonts\/([a-z0-9.-]+\.woff2)"\)/);
    assert.ok(m, "@font-face url");
    const size = fs.statSync(path.join(PROJECT, "assets", "fonts", m[1])).size;
    assert.ok(size > 10000 && size <= 70 * 1024, `${m[1]} is ${size} bytes`);
    assert.ok(fs.existsSync(path.join(PROJECT, "assets", "fonts", "OFL.txt")), "licence file ships beside the font");
  });

  it("no stylesheet or template requests a third-party font host", () => {
    const hits = [];
    for (const f of cssFiles) if (/fonts\.(googleapis|gstatic)\.com/.test(read(f))) hits.push(rel(f));
    for (const dir of ["src", "assets/js"]) (function walk(d) { for (const e of fs.readdirSync(path.join(PROJECT, d), { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(njk|js|json|css)$/.test(e.name) && /fonts\.(googleapis|gstatic)\.com/.test(read(path.join(PROJECT, p))) && !p.endsWith("404.njk")) hits.push(p); } })(dir);
    assert.deepEqual(hits, []);
  });
});

describe("custom properties", () => {
  it("every var(--x) is defined somewhere, except the four pre-existing undefined ones (documented debt)", () => {
    const defined = new Set();
    const used = new Set();
    for (const f of cssFiles) {
      const css = read(f);
      for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) defined.add(m[1]);
      for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) used.add(m[1]);
    }
    // These are referenced without a fallback and never declared, so those declarations are ignored by the browser
    // (no transition, z-index auto). Defining them would switch on behaviour that has never run: left as is.
    const KNOWN_UNDEFINED = ["--transition-fast", "--transition-normal", "--z-dropdown", "--z-modal"];
    assert.deepEqual([...used].filter((n) => !defined.has(n)).sort(), KNOWN_UNDEFINED.sort());
  });
});

describe("every generated page can use the tokens", () => {
  let inventory;
  before(() => {
    inventory = JSON.parse(read(path.join(PROJECT, "tests", "inventory", "url-inventory.json")));
  });

  for (const build of ["dist", "dist-ghpages"]) {
    it(`${build}/: every live page loads base/variables.css before its other stylesheets`, () => {
      for (const p of inventory.live) {
        const html = read(path.join(PROJECT, build, p.file));
        const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h.includes("/assets/css/"));
        assert.ok(sheets.length > 0, p.file);
        assert.match(sheets[0], /\/assets\/css\/base\/variables\.css$/, `${p.file} first stylesheet is ${sheets[0]}`);
      }
    });
  }
});
