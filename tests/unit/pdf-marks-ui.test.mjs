/**
 * Tool Pack 52: the PDF Page Numbers and Watermark page module's static contract and registration.
 * The rules and stamping are pinned by tests/unit/pdf-marks.test.mjs. NOT covered: the DOM wiring in init()
 * (file choice, focus, announcements, download) and the layout; those need a browser and a person.
 * Run directly: node --test tests/unit/pdf-marks-ui.test.mjs
 */
import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
let mod;
let html;

before(async () => {
  mod = await import("../../assets/js/tools/pdf-marks/index.js");
  html = mod.markup();
});

describe("page markup", () => {
  test("one h1; every control is labelled", () => {
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    for (const id of ["pm-file", "pm-numbers", "pm-format", "pm-position", "pm-start", "pm-size", "pm-skip", "pm-watermark", "pm-text", "pm-angle", "pm-opacity"]) {
      assert.match(html, new RegExp(`id="${id}"`), id);
    }
    for (const id of ["pm-format", "pm-position", "pm-start", "pm-size", "pm-text", "pm-angle", "pm-opacity"]) {
      assert.match(html, new RegExp(`for="${id}"`), `label for ${id}`);
    }
    assert.ok((html.match(/<legend/g) || []).length >= 2);
  });

  test("create, cancel and reset buttons; live region; result is hidden at first", () => {
    for (const id of ["pm-create", "pm-cancel", "pm-reset"]) assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, /id="pm-live"[^>]*aria-live="polite"/);
    assert.match(html, /id="pm-result"[\s\S]{0,80}hidden/);
  });

  test("honest wording: the original is unchanged, a watermark is not security, local processing", () => {
    assert.match(html, /original (is not changed|file[^.]*left as it is)/i);
    assert.match(html, /not security|does not encrypt/i);
    assert.match(html, /not uploaded/i);
    for (const bad of [/guarantee/i, /secure your/i, /protects? your document/i]) {
      assert.doesNotMatch(html, bad, String(bad));
    }
  });
});

describe("registration", () => {
  test("catalog entry: a published PDF Tools tool with true aliases and local processing", async () => {
    const tools = await import("../../assets/js/data/tools.js");
    const t = tools.getToolById("pdf-marks");
    assert.equal(t.status, "published");
    assert.equal(t.sectionId, "pdf-tools");
    assert.equal(t.capabilities.localProcessing, true);
    assert.ok(t.aliases.includes("add page numbers to pdf"));
    assert.ok(t.aliases.includes("add watermark to pdf"));
  });

  test("style list and Growth ledger carry the tool", () => {
    const styles = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "toolStyles.json"), "utf8"));
    assert.ok(styles["pdf-marks"].styles.includes("/assets/css/tools/pdf-tools.css"));
    const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "growth-manifest", "identity-ledger.json"), "utf8"));
    const rec = ledger.tools.find((x) => x.id === "pdf-marks");
    assert.equal(rec.module, "assets/js/tools/pdf-marks/index.js");
    assert.equal(rec.provenance, "added");
  });

  test("the module exports render and init; the built page exists in both outputs when built", () => {
    assert.equal(typeof mod.render, "function");
    assert.equal(typeof mod.init, "function");
    for (const dir of ["dist", "dist-ghpages"]) {
      if (!fs.existsSync(path.join(ROOT, dir))) continue;
      assert.ok(fs.existsSync(path.join(ROOT, dir, "tools", "pdf-marks", "index.html")), dir);
    }
  });
});
