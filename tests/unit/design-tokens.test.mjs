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
const TOKENS = { "--color-brand-green": "#0b9f58", "--color-slate-200": "#e2e8f0", "--color-ink": "#101828", "--color-ink-muted": "#667085" };

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
  it("are declared with exactly the values they replaced", () => {
    const vars = read(variablesFile);
    for (const [name, value] of Object.entries(TOKENS)) assert.match(vars, new RegExp(`${name}:\\s*${value};`, "i"), name);
  });

  it("the original blue --color-primary is untouched (the green is a separate token)", () => {
    assert.match(read(variablesFile), /--color-primary:\s*#2563eb;/i);
  });

  it("the literals live only in variables.css: nowhere else in the stylesheets", () => {
    const offenders = [];
    for (const f of cssFiles.filter((x) => x !== variablesFile)) {
      for (const value of Object.values(TOKENS)) if (new RegExp(`${value}(?![0-9a-f])`, "i").test(read(f))) offenders.push(`${rel(f)} has ${value}`);
    }
    assert.deepEqual(offenders, []);
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
