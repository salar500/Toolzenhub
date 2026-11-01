/**
 * Slider beside a number field: the pure rules (the slider range is the practical range inside the field's own
 * limits) and the markup option. The DOM wiring (dragging, keys, sync, disabled, reset) needs a browser and is in
 * tests/browser/field-slider.spec.js.
 * Run directly: node --test tests/unit/field-slider.test.mjs
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { sliderRange } from "../../assets/js/ui/field-slider.js";
import { numberField } from "../../assets/js/ui/field.js";

const input = (attrs, data) => ({
  getAttribute: (name) => (name in attrs ? String(attrs[name]) : null),
  dataset: data
});

describe("sliderRange", () => {
  test("the practical range is used when it sits inside the field's limits", () => {
    assert.deepEqual(sliderRange(input({ min: 0, max: 30 }, { sliderMin: "1", sliderMax: "20", sliderStep: "0.1" })), { min: 1, max: 20, step: 0.1 });
  });

  test("it is clamped to the field's own min and max, so it never offers a refused value", () => {
    assert.deepEqual(sliderRange(input({ min: 5, max: 12 }, { sliderMin: "1", sliderMax: "20", sliderStep: "1" })), { min: 5, max: 12, step: 1 });
  });

  test("no range (and no slider) without both ends, with an empty range, or with a bad step", () => {
    assert.equal(sliderRange(input({}, { sliderMax: "10" })), null);
    assert.equal(sliderRange(input({ min: 0, max: 5 }, { sliderMin: "6", sliderMax: "10", sliderStep: "1" })), null);
    assert.equal(sliderRange(input({}, { sliderMin: "1", sliderMax: "10", sliderStep: "0" })), null);
    assert.equal(sliderRange(input({}, { sliderMin: "x", sliderMax: "10", sliderStep: "1" })), null);
  });

  test("the step defaults to 1", () => {
    assert.equal(sliderRange(input({}, { sliderMin: "1", sliderMax: "10" })).step, 1);
  });
});

describe("numberField slider option", () => {
  const base = { id: "t-rate", label: "Rate", min: 0, max: 30, step: 0.01, value: 8 };

  test("an opted-in field carries the three data attributes, including a zero minimum", () => {
    const html = numberField({ ...base, slider: { min: 0, max: 28, step: 0.5 } });
    assert.match(html, /data-slider-min="0"/);
    assert.match(html, /data-slider-max="28"/);
    assert.match(html, /data-slider-step="0.5"/);
  });

  test("a field that did not opt in is unchanged", () => {
    assert.doesNotMatch(numberField(base), /data-slider/);
  });
});
