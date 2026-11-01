/**
 * Tool Pack 51: the Risk-Reward page module's static contract and registration.
 * The arithmetic is pinned by tests/unit/risk-reward.test.mjs. NOT covered: the DOM wiring in init()
 * (events, focus, the live region, Copy) and the layout; those need a browser and the owner's phone check.
 * Run directly: node --test tests/unit/risk-reward-ui.test.mjs
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
  mod = await import("../../assets/js/calculators/risk-reward/index.js");
  html = mod.markup();
});

describe("page markup", () => {
  test("one h1 and labelled controls", () => {
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    for (const id of ["rr-entry", "rr-stop", "rr-target", "rr-account", "rr-risk-percent"]) {
      assert.match(html, new RegExp(`for="${id}"`), id);
      assert.match(html, new RegExp(`id="${id}"`), id);
    }
    assert.match(html, /<legend/);
    assert.equal((html.match(/name="rr-side"/g) || []).length, 2);
  });

  test("decimal keypad on prices; no Calculate button; Reset and Copy present", () => {
    assert.ok((html.match(/inputmode="decimal"/g) || []).length >= 5);
    assert.doesNotMatch(html, />\s*Calculate\s*</);
    assert.match(html, /id="rr-reset"/);
    assert.match(html, /id="rr-copy"/);
  });

  test("polite live region and an error-free empty state", () => {
    assert.match(html, /id="rr-live"[^>]*aria-live="polite"/);
    assert.match(html, /Enter the entry, stop-loss and target prices/);
  });

  test("honest wording: arithmetic, not advice; no promise words", () => {
    assert.match(html, /not (a signal|advice)|not advice/i);
    assert.match(html, /Fees|fees/);
    for (const bad of [/guarantee(?!d to fill)/i, /\bsafe\b/i, /sure[- ]?(win|profit)/i, /you should (buy|sell)/i, /good (ratio|trade)/i]) {
      assert.doesNotMatch(html, bad, String(bad));
    }
  });
});

describe("registration", () => {
  test("catalog entry: published Investment calculator with true aliases", async () => {
    const tools = await import("../../assets/js/data/tools.js");
    const t = tools.getToolById("risk-reward");
    assert.equal(t.status, "published");
    assert.equal(t.category, "investment");
    assert.deepEqual(t.aliases, ["risk reward ratio", "position size calculator", "stop loss calculator", "trade risk calculator"]);
    assert.equal(t.capabilities.localProcessing, true);
  });

  test("style list and Growth ledger carry the tool", () => {
    const styles = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "toolStyles.json"), "utf8"));
    assert.ok(styles["risk-reward"].styles.includes("/assets/css/calculators/risk-reward.css"));
    assert.ok(fs.existsSync(path.join(ROOT, "assets", "css", "calculators", "risk-reward.css")));
    const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "growth-manifest", "identity-ledger.json"), "utf8"));
    const rec = ledger.tools.find((x) => x.id === "risk-reward");
    assert.equal(rec.module, "assets/js/calculators/risk-reward/index.js");
    assert.equal(rec.provenance, "added");
  });

  test("the module exports render and init, and the built page exists in both outputs when built", () => {
    assert.equal(typeof mod.render, "function");
    assert.equal(typeof mod.init, "function");
    for (const dir of ["dist", "dist-ghpages"]) {
      const f = path.join(ROOT, dir, "calculators", "risk-reward", "index.html");
      if (!fs.existsSync(path.join(ROOT, dir))) continue;
      assert.ok(fs.existsSync(f), f);
    }
  });
});
