/**
 * Tool Pack 29, G9 refinement: the automatic calculation and the service block, the parts that are pure.
 *
 * The page now calculates by itself once the entries are complete and valid, and shows the dates, the actual service and the
 * years counted for the formula in the main result. This file pins the pure parts: which engine answers are shown and which
 * are held back (autoOutcome), the comparable entries key, the guidance given while entries are not ready (holdMessage), the
 * service view and its HTML, and the markup contract (no Calculate button, Reset kept). It does not change any figure: the
 * amounts below are the specification's M1 to M8 values (section 25), also pinned by gratuity-golden.test.mjs.
 *
 * What cannot be checked here, and is checked on a GitHub-hosted runner instead (tests/browser/gratuity-auto.spec.js): the
 * pause before a typed wage is read, Reset during that pause, focus staying put, the announcements, the comparison refresh
 * and the layout.
 *
 * Run directly: node --test tests/unit/gratuity-auto.test.mjs
 */
import { describe, test, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let ui, engine, rules;

before(async () => {
  ui = await import("../../assets/js/calculators/gratuity/index.js");
  engine = await import("../../assets/js/calculators/formulas/gratuity.js");
  rules = await import("../../assets/js/calculators/formulas/gratuity-rules.js");
});

const regular = { employeeType: "regular", contractEnd: "", wages: "50000", joiningDate: "2021-01-01", exitDate: "2026-06-30" };
const view = (input) => ui.describeResult(engine.calculateGratuity({ ...regular, ...input }));

describe("which answers are shown and which are held back", () => {
  test("a complete result, an explanation and the engine's own error are shown", () => {
    assert.equal(ui.autoOutcome(engine.calculateGratuity(regular)), "show");
    assert.equal(ui.autoOutcome(engine.calculateGratuity({ employeeType: "other" })), "show");
    assert.equal(ui.autoOutcome(engine.calculateGratuity({ ...regular, exitDate: "2025-10-31" })), "show");
    assert.equal(ui.autoOutcome({ status: "error", code: "INTERNAL_ERROR", errors: [] }), "show");
  });

  test("incomplete and invalid entries are held back: they never produce a figure", () => {
    for (const input of [{ employeeType: "" }, { wages: "" }, { joiningDate: "" }, { exitDate: "" }, { wages: "abc" }, { wages: "0" }, { exitDate: "2020-12-31" }, { joiningDate: "2021-02-30" }]) {
      const result = engine.calculateGratuity({ ...regular, ...input });
      assert.equal(ui.autoOutcome(result), "hold", JSON.stringify(input));
      assert.equal(result.amount?.paise ?? null, null, "no amount");
    }
    assert.equal(ui.autoOutcome(engine.calculateGratuity({ employeeType: "fixedTerm", contractEnd: "", wages: "50000", joiningDate: "2025-01-01", exitDate: "2025-12-31" })), "hold");
  });

  test("a missing answer is not mistaken for a result", () => {
    assert.equal(ui.autoOutcome(null), "show", "no engine answer to hold back");
    assert.equal(ui.autoOutcome({ status: "incomplete" }), "hold");
    assert.equal(ui.autoOutcome({ status: "invalid" }), "hold");
  });
});

describe("the entries key: unchanged entries are not calculated twice", () => {
  test("the same entries give the same key; any changed entry gives another; spaces around the wages do not matter", () => {
    const key = ui.inputsKey(regular);
    assert.equal(ui.inputsKey({ ...regular }), key);
    assert.equal(ui.inputsKey({ ...regular, wages: " 50000 " }), key);
    for (const change of [{ employeeType: "fixedTerm" }, { contractEnd: "expires" }, { wages: "50001" }, { joiningDate: "2021-01-02" }, { exitDate: "2026-07-01" }]) {
      assert.notEqual(ui.inputsKey({ ...regular, ...change }), key, JSON.stringify(change));
    }
  });
});

describe("the guidance while the entries are not ready", () => {
  const hold = (input) => ui.describeResult(engine.calculateGratuity(input));

  test("it says what is still needed and promises no figure", () => {
    const text = ui.holdMessage(hold({ employeeType: "regular", wages: "", joiningDate: "", exitDate: "" }), "regular");
    assert.equal(text, "Still needed: the qualifying monthly wages, the joining date and the exit date. The result appears here as soon as they are complete.");
    assert.ok(!/₹|\d/.test(text), "no figure");
    assert.equal(ui.holdMessage(hold({ employeeType: "" }), ""), "Still needed: the employee type. The result appears here as soon as they are complete.");
  });

  test("a fixed-term contract names its own dates", () => {
    const text = ui.holdMessage(hold({ employeeType: "fixedTerm", contractEnd: "expires", wages: "", joiningDate: "", exitDate: "" }), "fixedTerm");
    assert.match(text, /the contract start date and the contract end date/);
    assert.match(ui.holdMessage(hold({ employeeType: "fixedTerm", contractEnd: "", wages: "1", joiningDate: "2025-01-01", exitDate: "2025-12-31" }), "fixedTerm"), /^Still needed: how the contract ends\./);
  });

  test("an invalid entry points to the highlighted fields instead", () => {
    const text = ui.holdMessage(hold({ ...regular, wages: "abc" }), "regular");
    assert.match(text, /^Check the highlighted fields\./);
  });

  test("with nothing to name it falls back to the starting guidance", () => {
    assert.match(ui.holdMessage({ errors: [] }, "regular"), /^Choose the employee type and enter your wages and dates\./);
    assert.match(ui.holdMessage(undefined, "regular"), /^Choose the employee type/);
  });
});

describe("the service in the main result", () => {
  test("M2: the actual service and the counted years are different items (5 years 6 months, counted 5)", () => {
    const v = view({});
    assert.deepEqual(v.service, {
      startLabel: "Joining date",
      endLabel: "Exit date",
      start: "1 January 2021",
      end: "30 June 2026",
      duration: "5 years, 6 months and 0 days",
      countedYears: "5"
    });
    assert.equal(v.amount.text, "₹1,44,230.77");
  });

  test("M3: one day more service counts one more year (5 years 6 months 1 day, counted 6)", () => {
    const v = view({ exitDate: "2026-07-01" });
    assert.equal(v.service.duration, "5 years, 6 months and 1 day");
    assert.equal(v.service.countedYears, "6");
    assert.equal(v.amount.text, "₹1,73,076.92");
  });

  test("M5: below the threshold there is no amount and no counted years, but the service is shown", () => {
    const v = view({ joiningDate: "2022-01-01", exitDate: "2025-12-30" });
    assert.equal(v.amount, null);
    assert.equal(v.service.duration, "3 years, 11 months and 30 days");
    assert.equal(v.service.countedYears, null);
  });

  test("M8: a fixed-term contract uses its own date labels; the amount stays illustrative", () => {
    const v = ui.describeResult(engine.calculateGratuity({ employeeType: "fixedTerm", contractEnd: "expires", wages: "50000", joiningDate: "2025-01-01", exitDate: "2025-12-31" }));
    assert.equal(v.service.startLabel, "Contract start date");
    assert.equal(v.service.endLabel, "Contract end date");
    assert.equal(v.amount.kind, "illustrative");
    assert.equal(v.amount.text, "₹28,846.15");
  });

  test("an explanation (other type, earlier law, early end) has no service block and no figure", () => {
    for (const input of [{ employeeType: "other" }, { ...regular, exitDate: "2025-10-31" }, { employeeType: "fixedTerm", contractEnd: "earlier", wages: "50000", joiningDate: "2025-01-01", exitDate: "2025-12-31" }]) {
      const v = ui.describeResult(engine.calculateGratuity(input));
      assert.equal(v.service, null);
      assert.equal(v.amount, null);
    }
  });

  test("the HTML shows the dates, the service and the counted years under the amount and before the notes, with the approved sentence", () => {
    const html = ui.renderResultHtml(view({}));
    const at = (text) => html.indexOf(text);
    assert.ok(at("Your gratuity result") < at("₹1,44,230.77"), "the amount comes after the heading");
    assert.ok(at("₹1,44,230.77") < at('id="gratuity-service-heading"'), "the service block follows the amount");
    for (const text of ["Joining date", "1 January 2021", "Exit date", "30 June 2026", "Service on these dates", "5 years, 6 months and 0 days", "Years counted for the formula"]) {
      assert.ok(at(text) > at('id="gratuity-service-heading"'), text);
    }
    assert.ok(html.includes("Years counted for the formula may differ from your actual service duration. This rounding does not determine eligibility."));
    assert.equal(ui.COUNTED_YEARS_NOTE, "Years counted for the formula may differ from your actual service duration. This rounding does not determine eligibility.");
    assert.ok(at('class="gratuity-status"') < at('id="gratuity-service-heading"'), "the status sentence is its own paragraph, apart from the service block");
  });

  test("with no amount the counted years and their sentence are not shown", () => {
    const html = ui.renderResultHtml(view({ joiningDate: "2022-01-01", exitDate: "2025-12-30" }));
    assert.ok(html.includes("Service on these dates"));
    assert.ok(!html.includes("Years counted for the formula"));
    assert.ok(!html.includes("This rounding does not determine eligibility"));
  });

  test("the page still shows the engine's amount only; the service view adds no figure", () => {
    const v = view({});
    const result = engine.calculateGratuity(regular);
    assert.equal(v.amount.text, ui.formatPaise(result.amount.paise));
    assert.equal(v.service.countedYears, String(result.countedYears));
  });
});

describe("the markup contract after this change", () => {
  test("no Calculate button; Reset is kept and is not a submit button; the form cannot reload the page", () => {
    const html = ui.markup();
    assert.ok(!/id="gratuity-calculate"/.test(html));
    assert.ok(!/type="submit"/.test(html));
    assert.match(html, /<button\s+type="button"\s+id="gratuity-reset"/);
    assert.match(html, /<form\s+id="gratuity-form"\s+class="calculator-form"\s+novalidate/);
    assert.ok(!/press Calculate/i.test(html));
  });

  test("the delays are the approved ones", () => {
    assert.equal(ui.AUTO_DELAY_MS, 600);
    assert.ok(ui.ANNOUNCE_DELAY_MS >= 1000);
  });

  test("the ceiling, the rules date and the engine constants are untouched", () => {
    assert.equal(rules.CEILING_PAISE, 2000000_00);
    assert.equal(rules.RULES_CHECKED_ON, "2026-10-21");
  });
});
