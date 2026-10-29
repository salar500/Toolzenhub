/**
 * DQ1: the colours inside the shared tool buttons (components/buttons.css) meet WCAG 2.x contrast.
 *
 * The ratios are computed here from the tokens in base/variables.css with the WCAG relative-luminance formula,
 * so changing a token cannot silently drop a button state below the line:
 *   - text inside a control (normal size) needs 4.5:1 in every ENABLED state
 *   - the outline of a control and the keyboard focus ring need 3:1 (non-text UI components)
 * Disabled controls are exempt by WCAG (inactive components); they only need to look different, which the
 * browser tests check.
 *
 * Design System 2.0: the primary action is the near-black ink, the accent (indigo) is the link and focus colour.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CSS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "assets", "css");
const variables = fs.readFileSync(path.join(CSS, "base", "variables.css"), "utf8");
const buttons = fs.readFileSync(path.join(CSS, "components", "buttons.css"), "utf8");

// Resolves a token through var(--other) aliases down to its literal hex (Design System 2.0 keeps the older names as aliases).
const token = (name, seen = 0) => {
  const m = variables.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6}|var\\(--[a-z0-9-]+\\));`, "i"));
  assert.ok(m, `${name} is declared in variables.css`);
  if (m[1].startsWith("#")) return m[1];
  assert.ok(seen < 6, `${name} alias chain too long`);
  return token(m[1].slice(4, -1), seen + 1);
};

const channel = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255); };
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const WHITE = "#ffffff";
const PAGE = token("--surface-page"); // the page background the focus ring sits on
const ACTION = token("--color-action-green");
const HOVER = token("--color-action-green-hover");
const ACTIVE = token("--color-action-green-active");
const SOFT = token("--color-action-green-soft");
const PRESSED = token("--color-action-green-pressed");
const BRAND = token("--focus-ring");

describe("primary button: white text on the action green", () => {
  for (const [state, bg] of [["default", ACTION], ["hover", HOVER], ["active", ACTIVE]]) {
    it(`${state}: ${bg} with white text is at least 4.5:1`, () => {
      assert.ok(ratio(WHITE, bg) >= 4.5, `${state} ${ratio(WHITE, bg).toFixed(2)}`);
    });
  }

  it("no state of the near-black primary falls below 12:1 (a lighter hover is by design; only the floor matters)", () => {
    for (const bg of [ACTION, HOVER, ACTIVE]) assert.ok(ratio(WHITE, bg) >= 12, ratio(WHITE, bg).toFixed(2));
  });
});

describe("secondary button: green text on white and on its tints", () => {
  const cases = [
    ["default", ACTION, WHITE],
    ["hover", HOVER, SOFT],
    ["active", ACTIVE, PRESSED],
  ];
  for (const [state, fg, bg] of cases) {
    it(`${state}: ${fg} on ${bg} is at least 4.5:1`, () => {
      assert.ok(ratio(fg, bg) >= 4.5, `${state} ${ratio(fg, bg).toFixed(2)}`);
    });
  }

  it("the secondary outline is at least 3:1 against white", () => {
    assert.ok(ratio(ACTION, WHITE) >= 3);
  });
});

describe("keyboard focus", () => {
  it("the focus ring (accent) is at least 3:1 against the page and against white", () => {
    assert.ok(ratio(BRAND, PAGE) >= 3, ratio(BRAND, PAGE).toFixed(2));
    assert.ok(ratio(BRAND, WHITE) >= 3, ratio(BRAND, WHITE).toFixed(2));
  });
});

describe("the stylesheet uses the action tokens, not the brand green, inside controls", () => {
  it("buttons.css sets control backgrounds and text from the action tokens", () => {
    const toolButtons = buttons.slice(buttons.indexOf("TOOL BUTTONS"));
    assert.match(toolButtons, /background:\s*var\(--color-action-green\)/);
    assert.match(toolButtons, /color:\s*var\(--color-action-green\)/);
    assert.doesNotMatch(toolButtons, /(background|color):\s*var\(--color-brand-green\)/);
  });

  it("every action token resolves to a literal hex value", () => {
    for (const name of ["--action", "--action-hover", "--action-active", "--action-soft", "--action-pressed", "--color-action-green", "--color-action-green-hover", "--color-action-green-active", "--color-action-green-soft", "--color-action-green-pressed"]) token(name);
  });

  it("the documented ratios in variables.css are the measured ones", () => {
    assert.equal(ratio(WHITE, ACTION).toFixed(2), "17.49");
    assert.equal(ratio(WHITE, HOVER).toFixed(2), "15.17");
    assert.ok(ratio(WHITE, ACTIVE) > 18);
  });
});
