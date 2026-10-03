/**
 * E4: the shared tool UX primitives (assets/js/ui/).
 *
 * They are small, framework-free and independent of any one tool. These tests pin what each one
 * emits (accessible wiring, escaping), that they stay independent of Loans/calculators, that the
 * Loan Comparison modal really uses the shared dialog helper, and that the primitives can describe
 * other kinds of tool (using synthetic markup only: no such tool is built).
 * Behaviour that needs a real browser (focus, inert, Tab trap) is covered in
 * tests/browser/accessibility.spec.js.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => fs.readFileSync(path.join(PROJECT, rel), "utf8");

let esc, field, result;
before(async () => {
  esc = await import("../../assets/js/ui/escape.js");
  field = await import("../../assets/js/ui/field.js");
  result = await import("../../assets/js/ui/result.js");
});

// collapse whitespace so assertions are about structure, not indentation
const flat = (html) => html.replace(/\s+/g, " ").replace(/ >/g, ">").replace(/> /g, ">").replace(/ </g, "<").trim();
const idsIn = (html) => [...html.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]);

// a minimal stand-in for an element: attributes only
function el(attrs = {}) {
  const a = new Map(Object.entries(attrs));
  return {
    getAttribute: (n) => (a.has(n) ? a.get(n) : null),
    setAttribute: (n, v) => void a.set(n, String(v)),
    removeAttribute: (n) => void a.delete(n),
    has: (n) => a.has(n),
  };
}

describe("escape", () => {
  test("escapes the five characters that can break markup", () => {
    assert.equal(esc.escapeHTML(`<b a="x" b='y'>&`), "&lt;b a=&quot;x&quot; b=&#39;y&#39;&gt;&amp;");
    assert.equal(esc.escapeHTML(), "");
    assert.equal(esc.escapeHTML(0), "0");
  });
});

describe("numberField", () => {
  const base = { id: "t-amount", label: "Amount", unit: "₹", hint: "How much.", min: 1, max: 9, step: 1, value: 5 };

  test("the label is tied to the input, and the hint is linked to it", () => {
    const html = flat(field.numberField(base));
    assert.match(html, /<label class="calculator-form__label" for="t-amount">Amount<\/label>/);
    assert.match(html, /<input id="t-amount" class="calculator-form__input" type="number" min="1" max="9" step="1" value="5" required aria-describedby="t-amount-hint">/);
    assert.match(html, /<span class="calculator-form__help" id="t-amount-hint">How much\.<\/span>/);
    assert.equal(field.hintIdOf("t-amount"), "t-amount-hint");
  });

  test("the unit sits beside the control and is optional", () => {
    assert.match(flat(field.numberField(base)), /calculator-form__field calculator-form__field--unit.*<span class="calculator-form__unit">₹<\/span>/);
    const bare = flat(field.numberField({ id: "t-x", label: "X" }));
    assert.ok(!bare.includes("calculator-form__unit") && !bare.includes("--unit"));
  });

  test("without a hint there is no hint element and no aria-describedby", () => {
    const html = flat(field.numberField({ id: "t-x", label: "X", min: 0 }));
    assert.ok(!html.includes("aria-describedby") && !html.includes("t-x-hint") && !html.includes("calculator-form__help"));
    assert.match(html, /<input id="t-x" class="calculator-form__input" type="number" min="0" required>/);
  });

  test("only the constraints you give are written; required can be turned off", () => {
    const html = flat(field.numberField({ id: "t-y", label: "Y", required: false }));
    assert.match(html, /<input id="t-y" class="calculator-form__input" type="number">/);
    assert.ok(!/ (min|max|step|value|required)=?/.test(html.replace("t-y", "")));
  });

  test("a value of 0 is kept (not treated as missing)", () => {
    assert.match(flat(field.numberField({ id: "t-z", label: "Z", min: 0, value: 0 })), /min="0" value="0"/);
  });

  test("text is escaped, so a tool can pass anything", () => {
    const html = flat(field.numberField({ id: "t-e", label: "<img onerror=x>", hint: "a & b", unit: '"' }));
    assert.ok(!html.includes("<img"));
    assert.match(html, /&lt;img onerror=x&gt;/);
    assert.match(html, /a &amp; b/);
  });

  test("ids are predictable and unique across fields", () => {
    const html = field.numberField(base) + field.numberField({ ...base, id: "t-rate" });
    const ids = idsIn(html);
    assert.deepEqual(ids.sort(), ["t-amount", "t-amount-hint", "t-rate", "t-rate-hint"]);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe("error wiring (aria-invalid + aria-describedby)", () => {
  test("setFieldsInvalid marks the fields and links the error, keeping the hint", () => {
    const a = el({ "aria-describedby": "a-hint" });
    const b = el();
    field.setFieldsInvalid([a, b, null], "form-error");
    assert.equal(a.getAttribute("aria-invalid"), "true");
    assert.equal(a.getAttribute("aria-describedby"), "a-hint form-error");
    assert.equal(b.getAttribute("aria-describedby"), "form-error");
  });

  test("setting twice does not duplicate the link", () => {
    const a = el({ "aria-describedby": "a-hint" });
    field.setFieldsInvalid([a], "form-error");
    field.setFieldsInvalid([a], "form-error");
    assert.equal(a.getAttribute("aria-describedby"), "a-hint form-error");
  });

  test("clearFieldsInvalid removes only the error, and the attribute when nothing is left", () => {
    const a = el({ "aria-invalid": "true", "aria-describedby": "a-hint form-error" });
    const b = el({ "aria-invalid": "true", "aria-describedby": "form-error" });
    field.clearFieldsInvalid([a, b, null], "form-error");
    assert.equal(a.has("aria-invalid"), false);
    assert.equal(a.getAttribute("aria-describedby"), "a-hint");
    assert.equal(b.has("aria-invalid"), false);
    assert.equal(b.has("aria-describedby"), false);
  });

  test("clearing a field that was never invalid changes nothing it should not", () => {
    const a = el({ "aria-describedby": "a-hint" });
    field.clearFieldsInvalid([a], "form-error");
    assert.equal(a.getAttribute("aria-describedby"), "a-hint");
  });
});

describe("result primitives", () => {
  test("resultMetric: a label and a display value; primary only when asked", () => {
    const plain = flat(result.resultMetric({ label: "Total", value: "₹1,00,000" }));
    assert.equal(plain, '<div class="calculator-results__item"><span class="calculator-results__label">Total</span><strong class="calculator-results__value">₹1,00,000</strong></div>');
    assert.match(flat(result.resultMetric({ label: "Headline", value: "1", primary: true })), /calculator-results__item calculator-results__item--primary/);
  });

  test("a value is just text: a percentage, a duration, a unit or a word all work", () => {
    for (const value of ["8.5%", "20 years", "98.6 °F", "00:05:00", "Yes"]) {
      assert.ok(flat(result.resultMetric({ label: "L", value })).includes(`>${value}<`), value);
    }
  });

  test("label and value are escaped", () => {
    const html = flat(result.resultMetric({ label: "<i>", value: "<script>" }));
    assert.ok(!html.includes("<script>") && !html.includes("<i>"));
  });

  test("empty state and error; the error can carry an id for aria-describedby", () => {
    assert.equal(flat(result.resultEmpty("Nothing yet.")), '<div class="calculator-results__empty">Nothing yet.</div>');
    assert.equal(flat(result.resultError("Bad input.")), '<div class="calculator-results__error">Bad input.</div>');
    assert.equal(flat(result.resultError("Bad input.", { id: "e-1" })), '<div class="calculator-results__error" id="e-1">Bad input.</div>');
    assert.ok(!flat(result.resultError("<b>")).includes("<b>"));
  });
});

describe("the primitives fit other kinds of tool (synthetic markup, nothing is built)", () => {
  test("converter: a number, a unit chosen by the tool, an instant result, a copy action the tool owns", () => {
    const select = `<select id="c-unit" class="calculator-form__select"><option>°C</option><option>°F</option></select>`;
    const html = field.fieldShell({ id: "c-unit", label: "From", control: select, hint: "Pick a unit." }) + field.numberField({ id: "c-value", label: "Value", step: "any" });
    const ids = idsIn(html);
    assert.equal(new Set(ids).size, ids.length);
    assert.match(flat(html), /<label class="calculator-form__label" for="c-unit">From<\/label>/);
    assert.ok(flat(result.resultMetric({ label: "Converted", value: "98.6 °F", primary: true })).includes("98.6 °F"));
  });

  test("date tool: date inputs through the shell, several text results", () => {
    const control = (id) => `<input id="${id}" class="calculator-form__input" type="date" aria-describedby="${field.hintIdOf(id)}">`;
    const html = field.fieldShell({ id: "d-from", label: "From", hint: "Start date.", control: control("d-from") }) + field.fieldShell({ id: "d-to", label: "To", control: control("d-to") });
    assert.match(flat(html), /for="d-from"/);
    for (const value of ["1 year, 2 months, 3 days", "428 days"]) assert.ok(flat(result.resultMetric({ label: "Difference", value })).includes(value));
  });

  test("developer utility: a textarea through the shell, an error linked to it, content escaped", () => {
    const control = `<textarea id="j-in" class="calculator-form__input" aria-describedby="j-in-hint"></textarea>`;
    const html = flat(field.fieldShell({ id: "j-in", label: "JSON", hint: "Paste JSON.", control }));
    assert.match(html, /<label class="calculator-form__label" for="j-in">JSON<\/label>/);
    assert.match(html, /<span class="calculator-form__help" id="j-in-hint">Paste JSON\.<\/span>/);
    const error = flat(result.resultError('Unexpected token < in JSON at position 3', { id: "j-error" }));
    assert.ok(!error.includes("token <") && error.includes("&lt;"));
    const t = el({ "aria-describedby": "j-in-hint" });
    field.setFieldsInvalid([t], "j-error");
    assert.equal(t.getAttribute("aria-describedby"), "j-in-hint j-error");
  });

  test("timer: a duration field and a live result without any money or currency", () => {
    assert.match(flat(field.numberField({ id: "t-min", label: "Minutes", min: 1, unit: "min" })), /calculator-form__unit">min</);
    assert.ok(flat(result.resultMetric({ label: "Remaining", value: "04:59" })).includes("04:59"));
  });

  test("loan-style calculator: the pattern EMI uses", () => {
    const html = ["a", "b", "c"].map((id) => field.numberField({ id: `l-${id}`, label: id, unit: "%", hint: "h", min: 1 })).join("");
    const ids = idsIn(html);
    assert.equal(ids.length, 6);
    assert.equal(new Set(ids).size, 6);
  });
});

describe("independence and honesty", () => {
  const UI = ["escape.js", "field.js", "result.js", "dialog-focus.js"];

  test("the shared layer imports nothing from calculators, loans, data or pages", () => {
    for (const f of UI) {
      const imports = [...read(`assets/js/ui/${f}`).matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
      for (const i of imports) assert.match(i, /^\.\/(escape|field|result|dialog-focus)\.js$/, `${f} imports ${i}`);
    }
  });

  test("the shared layer touches no DOM when imported (safe for the site build)", () => {
    for (const f of UI) {
      const src = read(`assets/js/ui/${f}`).replace(/\/\*[\s\S]*?\*\//g, "");
      // top level (not inside a function) must not reach document/window
      const topLevel = src.split("\n").filter((l) => /^(const|let|var|document|window)\b/.test(l));
      for (const l of topLevel) assert.ok(!/document|window/.test(l), `${f}: ${l}`);
    }
  });

  test("Loan Comparison's modal uses the shared dialog helper and has no focus-trap code of its own", () => {
    const modal = read("loans/loan-comparison/components/AmortizationModal.js");
    assert.match(modal, /from "\.\.\/\.\.\/\.\.\/assets\/js\/ui\/dialog-focus\.js"/);
    assert.match(modal, /activateDialog\(/);
    for (const gone of ["FOCUSABLE", "handleKeydown", "setBackgroundInert", "openerElement"]) assert.ok(!modal.includes(gone), `${gone} still in the modal`);
  });

  test("EMI uses the shared field and result primitives instead of repeating their markup", () => {
    const emi = read("assets/js/calculators/emi/index.js");
    assert.equal((emi.match(/numberField\(/g) || []).length, 3);
    assert.equal((emi.match(/resultMetric\(/g) || []).length, 4);
    for (const gone of ['class="calculator-form__group"', 'class="calculator-results__item', 'class="calculator-results__empty"', 'class="calculator-results__error"']) assert.ok(!emi.includes(gone), `${gone} still hand-written in EMI`);
  });

  test("the formulas and the tool modules' calculation code were not touched by the shared layer", () => {
    const emi = read("assets/js/calculators/emi/index.js");
    assert.match(emi, /calculateEMI\(\s*loan,\s*rate,\s*years\s*\)/);
    for (const f of ["field.js", "result.js", "dialog-focus.js", "escape.js"]) {
      const src = read(`assets/js/ui/${f}`);
      assert.ok(!/formulas\/|calculateEMI|calculateTotal|calculateAmortization/.test(src), `${f} contains calculation logic`);
    }
  });
});
