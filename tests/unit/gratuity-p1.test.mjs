/**
 * Tool Pack 29, G6: the approved P1 features of the Gratuity Calculator page (assets/js/calculators/gratuity/index.js):
 * the date explorer, the wage comparison and the copied summary. The engine is pinned by gratuity-golden.test.mjs and the
 * page's other behaviour by gratuity-ui.test.mjs; this file pins what the page does with exploreExitDates, compareWages and
 * calculateGratuity for these three features.
 *
 * Pinned: the engine-to-page mapping of the explorer rows (ids, clamp dates, status wording, amounts and labels as the
 * engine returns them) and its absence for fixed-term and unsupported cases; the comparison (the engine's difference, as a
 * word and an unsigned amount, the ceiling, an invalid second wage, an illustrative fixed-term comparison); the copied text
 * (estimate wording, the validated inputs only, no hidden-field value, every qualification, no claim of eligibility); the
 * escaping of every dynamic value; the stale and Reset behaviour of the pure state; and the markup the buttons rely on.
 *
 * Expected rupee figures were computed independently with exact fractions in Python, not with the engine.
 *
 * What it does NOT cover: the DOM wiring in init() (the Compare submit, the Copy click, the clipboard, focus and the live
 * region) and the layout. There is no DOM here; those need a browser or a phone.
 *
 * Run directly: node --test tests/unit/gratuity-p1.test.mjs
 */
import { describe, test, before } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let ui, engine;

before(async () => {
  ui = await import("../../assets/js/calculators/gratuity/index.js");
  engine = await import("../../assets/js/calculators/formulas/gratuity.js");
});

const base = { employeeType: "regular", wages: "50000", joiningDate: "2021-01-01", exitDate: "2026-06-30" };
const input = (extra = {}) => ({ ...base, ...extra });
const explorer = (extra) => ui.describeExplorer(engine.exploreExitDates(input(extra)));
const compare = (second, extra) => ui.describeComparison(engine.compareWages(input(extra), second));
const fixed = { employeeType: "fixedTerm", contractEnd: "expires", joiningDate: "2025-01-01", exitDate: "2025-12-31" };

describe("the date explorer", () => {
  test("a regular employee gets the plus 6 and plus 12 month rows, with the engine's dates, wording and amounts", () => {
    const view = explorer();
    assert.deepEqual(view.rows.map((r) => r.id), ["PLUS_6_MONTHS", "PLUS_12_MONTHS"]);
    assert.deepEqual(view.rows.map((r) => r.dateText), ["30 December 2026", "30 June 2027"]);
    /* 5y 11m 30d is 6 counted years; 6y 6m 0d is also 6: 50,000 x 15 x 6 / 26 = 1,73,076.92 (independent) */
    assert.deepEqual(view.rows.map((r) => r.amount.text), ["₹1,73,076.92", "₹1,73,076.92"]);
    assert.ok(view.rows.every((r) => r.amount.label === "Estimated gratuity (subject to the conditions stated)"));
    assert.match(view.wageLine, /₹50,000\.00 a month/);
  });

  test("the rows call the engine: each row equals calculateGratuity for that exit date", () => {
    const view = explorer();
    for (const row of view.rows) {
      const direct = ui.describeResult(engine.calculateGratuity(input({ exitDate: new Date(row.dateText + " UTC").toISOString().slice(0, 10) })));
      assert.equal(row.amount.text, direct.amount.text);
      assert.equal(row.short, direct.short);
    }
  });

  test("the clamp rule, not the C-prime rule, picks the target dates: 31 August plus 6 months is 28 February", () => {
    const view = explorer({ joiningDate: "2018-01-01", exitDate: "2026-08-31" });
    assert.equal(view.rows.find((r) => r.id === "PLUS_6_MONTHS").dateText, "28 February 2027");
    assert.equal(view.rows.find((r) => r.id === "PLUS_12_MONTHS").dateText, "31 August 2027");
  });

  test("below five years the calendar five-year date is offered first, and shows the same qualified wording", () => {
    const view = explorer({ joiningDate: "2022-01-01", exitDate: "2025-12-30" });
    assert.deepEqual(view.rows.map((r) => r.id), ["FIVE_YEAR_DATE", "PLUS_6_MONTHS", "PLUS_12_MONTHS"]);
    assert.equal(view.rows[0].dateText, "31 December 2026");
    assert.match(view.rows[0].short, /subject to conditions/);
    assert.equal(view.rows[0].label, "On the calendar five-year date");
  });

  test("a row without an amount says so; no amount is invented", () => {
    const html = ui.renderExplorerHtml(explorer({ joiningDate: "2024-01-01", exitDate: "2025-12-30" }));
    assert.match(html, /No amount is shown for these dates\./);
  });

  test("no explorer for a fixed-term employee, an unsupported case or invalid input", () => {
    assert.equal(explorer(fixed), null);
    assert.equal(explorer({ employeeType: "other" }), null);
    assert.equal(explorer({ wages: "0" }), null);
    assert.equal(explorer({ exitDate: "2024-03-31", joiningDate: "2016-04-01" }), null);
    assert.equal(ui.renderExplorerHtml(null), "");
    assert.equal(ui.describeExplorer(null), null);
  });

  test("the panel states that the dates are hypothetical, is not advice, and promises no gratuity", () => {
    const html = ui.renderExplorerHtml(explorer());
    assert.match(html, /hypothetical/);
    assert.match(html, /not advice on when to leave/);
    assert.match(html, /not a promise of gratuity/);
    assert.ok(!/guarantee|payable|you are eligible/i.test(html.replace(/not a promise of gratuity/g, "")));
  });

  test("a month-end disclosure appears once when a row's result carries it", () => {
    const view = explorer({ joiningDate: "2018-01-31", exitDate: "2026-02-28" });
    const html = ui.renderExplorerHtml(view);
    assert.ok(view.notes.length > 0);
    assert.equal((html.match(/payroll may count month-end dates differently/g) || []).length, 1);
  });

  test("every dynamic value is escaped", () => {
    const html = ui.renderExplorerHtml({
      wageLine: "<b>w</b>", notes: ["<i>n</i>"],
      rows: [{ label: "<u>l</u>", dateText: "<s>d</s>", short: "<a>s</a>", serviceLine: "<em>v</em>", amount: { kind: "<x>", label: "<y>", text: "<z>" }, notes: [] }]
    });
    assert.ok(!/<(b|i|u|s|a|em|x|y|z)>/.test(html));
  });
});

describe("the wage comparison", () => {
  test("a higher second wage: the difference is the engine's, shown as an unsigned amount and a word", () => {
    const view = compare("100000");
    assert.deepEqual(view.rows.map((r) => r[2]), ["₹1,44,230.77", "₹2,88,461.54"]);
    assert.equal(view.sentence, "The second estimate is ₹1,44,230.77 higher than the first.");
    assert.equal(view.illustrative, false);
  });

  test("a lower second wage uses the word lower, never a minus sign", () => {
    const view = compare("25000");
    assert.deepEqual(view.rows.map((r) => r[2]), ["₹1,44,230.77", "₹72,115.38"]);
    assert.equal(view.sentence, "The second estimate is ₹72,115.39 lower than the first.");
    assert.ok(!/-/.test(view.sentence));
  });

  test("the difference is the difference of the two displayed amounts (the screen adds up)", () => {
    const view = compare("25000");
    const paise = (text) => Number(text.replace(/[₹,.]/g, ""));
    assert.equal(paise("₹1,44,230.77") - paise(view.rows[1][2]), 7211539);
  });

  test("the same wage: the amounts are the same", () => {
    assert.equal(compare("50000").sentence, "The two estimates are the same.");
  });

  test("the ceiling applies to the second figure and is disclosed on its row", () => {
    const view = compare("5000000");
    assert.equal(view.rows[1][2], "₹20,00,000.00");
    assert.equal(view.rows[1][3], true);
    assert.equal(view.rows[0][3], false);
    assert.equal(view.sentence, "The second estimate is ₹18,55,769.23 higher than the first.");
    assert.match(ui.renderComparisonHtml(view), /The ceiling applied/);
  });

  test("a fixed-term comparison is illustrative and never called an estimate", () => {
    const view = compare("60000", fixed);
    assert.equal(view.illustrative, true);
    assert.match(view.amountLabel, /Illustrative amount, not an entitlement/);
    assert.match(view.sentence, /illustrative amount/);
    assert.ok(!/estimate/.test(view.sentence));
  });

  test("an invalid second wage gives the same messages as the main field, not a number", () => {
    assert.deepEqual(compare("1,000").errors, ["Enter digits only, with no commas or spaces, for example 150000 or 150000.50."]);
    assert.deepEqual(compare("").errors, ["Enter the monthly wages."]);
    assert.deepEqual(compare("0").errors, ["The wages must be above zero."]);
    assert.deepEqual(compare("12.345").errors, ["Use at most two decimal places, for example 150000.50."]);
    assert.match(compare("20000000").errors[0], /up to ₹1,00,00,000/);
  });

  test("nothing is compared when the first calculation has no amount or is invalid", () => {
    assert.equal(compare("60000", { joiningDate: "2024-01-01", exitDate: "2025-12-30" }).unavailable, true);
    assert.equal(compare("60000", { wages: "0" }).unavailable, true);
  });

  test("the comparison markup is escaped and carries the labels", () => {
    const html = ui.renderComparisonHtml({
      unavailable: false, amountLabel: "<l>", sentence: "<s>",
      rows: [["<a>", "<b>", "<c>", false], ["<d>", "<e>", "<f>", false]]
    });
    assert.ok(!/<[a-f]>/.test(html));
    assert.match(ui.renderComparisonHtml({ unavailable: true }), /No amount can be compared/);
  });

  test("the form: a labelled text field with a decimal keypad, a Compare button that waits for a current result, no salary components", () => {
    const html = ui.renderCompareFormHtml();
    assert.match(html, /<label[^>]*for="gratuity-wages-second"/);
    assert.match(html, /type="text"[\s\S]*inputmode="decimal"/);
    assert.match(html, /<button type="submit"[^>]*data-needs-current>Compare<\/button>/);
    assert.equal((html.match(/<input/g) || []).length, 1);
    assert.ok(!/basic|allowance|hra|bonus/i.test(html.replace(/A higher gross salary[^<]*/g, "")));
    assert.match(html, /higher gross salary does not necessarily raise the qualifying wages/);
  });
});

describe("the copied summary", () => {
  const regular = () => engine.calculateGratuity(input());
  const text = (extra) => ui.summaryText(engine.calculateGratuity(input(extra)), input(extra));

  test("identifies an estimate, with the validated inputs, the amount and the approved qualifications", () => {
    const out = ui.summaryText(regular(), input());
    assert.match(out, /^Gratuity estimate \(ToolZen Hub Gratuity Calculator\)/);
    assert.match(out, /Rules checked on 21 October 2026/);
    assert.match(out, /Employee type: Regular employee/);
    assert.match(out, /Qualifying monthly wages: ₹50,000\.00/);
    assert.match(out, /Joining date: 1 January 2021/);
    assert.match(out, /Exit date: 30 June 2026/);
    assert.match(out, /Estimated gratuity \(subject to the conditions stated\): ₹1,44,230\.77/);
    assert.match(out, /Whether you are eligible also depends on your service having been continuous/);
    assert.match(out, /What this estimate assumes/);
    assert.match(out, /Check with your employer or payroll/);
    assert.match(out, /not legal advice and not a determination of entitlement/);
  });

  test("the month-end disclosure and the ceiling note are included when the engine returns them", () => {
    assert.match(text({ joiningDate: "2018-01-31", exitDate: "2026-02-28" }), /payroll may count month-end dates differently/);
    assert.match(text({ wages: "5000000" }), /The ceiling applied: the amount is capped at ₹20,00,000\.00/);
  });

  test("a fixed-term summary is illustrative, uses contract wording, and does not call the amount an estimate", () => {
    const out = text(fixed);
    assert.match(out, /Illustrative amount, not an entitlement/);
    assert.match(out, /Contract start date: 1 January 2025/);
    assert.match(out, /Contract end date: 31 December 2025/);
    assert.match(out, /Contract end: The contract runs to its end/);
    assert.ok(!/Estimated gratuity/.test(out));
    assert.match(out, /pro rata/);
  });

  test("a regular summary never carries the hidden contract-end value", () => {
    const out = ui.summaryText(regular(), input({ contractEnd: "earlier" }));
    assert.ok(!/Contract end/.test(out));
    assert.ok(!/earlier/i.test(out.replace(/an earlier/g, "")));
  });

  test("the below-threshold status gives no amount line and keeps its qualification", () => {
    const out = text({ joiningDate: "2022-01-01", exitDate: "2025-12-30" });
    assert.ok(!/Estimated gratuity|Illustrative amount/.test(out));
    assert.match(out, /This is not a final legal determination/);
    assert.match(out, /Five calendar years of service are completed on 31 December 2026/);
  });

  test("the fifth-year summary is illustrative and asks payroll", () => {
    const out = text({ joiningDate: "2021-01-01", exitDate: "2025-12-30" });
    assert.match(out, /Illustrative amount, not an entitlement/);
    assert.match(out, /Please ask your employer's payroll/);
  });

  test("no summary for a result with no figure to share: unsupported, invalid, incomplete or a missing input snapshot", () => {
    for (const extra of [{ employeeType: "other" }, { wages: "0" }, { wages: "" }, { joiningDate: "2016-04-01", exitDate: "2024-03-31" }]) {
      assert.equal(text(extra), "");
    }
    assert.equal(ui.summaryText(regular(), null), "");
  });

  test("it never claims eligibility, guarantees or payability, and never shows an error as a zero amount", () => {
    for (const extra of [{}, fixed, { joiningDate: "2021-01-01", exitDate: "2025-12-30" }, { joiningDate: "2022-01-01", exitDate: "2025-12-30" }]) {
      /* the approved qualified sentences ("Whether you are eligible also depends...") are the only place the words appear */
      const out = text(extra).replace(/Whether you are eligible also depends/g, "");
      assert.ok(!/guarantee|payable|you are eligible|you are entitled|₹0\.00/i.test(out), out);
    }
  });

  test("the summary is plain text with no markup and no address, and has no hidden value from the page", () => {
    const out = text({});
    assert.ok(!/<[a-z]/i.test(out));
    assert.ok(!/https?:|localhost/i.test(out));
  });

  test("the Copy markup: one button that waits for a current result, a status line that is not a second live region, an empty fallback", () => {
    const html = ui.renderCopyHtml();
    assert.match(html, /<button type="button"[^>]*id="gratuity-copy"[^>]*data-needs-current>Copy summary<\/button>/);
    assert.ok(!/aria-live|role="status"|role="alert"/.test(html));
    assert.match(html, /nothing is sent anywhere/);
    assert.match(html, /id="gratuity-copy-fallback"/);
  });
});

describe("stale and Reset", () => {
  test("the inputs a result was calculated from stay with it after an edit, and an edit makes it out of date", () => {
    const result = engine.calculateGratuity(input());
    let s = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result, inputs: input() });
    assert.equal(s.stale, false);
    assert.deepEqual(s.inputs, input());
    s = ui.reduceState(s, { type: "edit" });
    assert.equal(s.stale, true);
    assert.deepEqual(s.inputs, input());
  });

  test("a new Calculate replaces the inputs; Reset clears the result and the inputs", () => {
    const result = engine.calculateGratuity(input());
    let s = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result, inputs: input() });
    s = ui.reduceState(s, { type: "edit" });
    s = ui.reduceState(s, { type: "calculate", result, inputs: input({ wages: "60000" }) });
    assert.equal(s.stale, false);
    assert.equal(s.inputs.wages, "60000");
    assert.deepEqual(ui.reduceState(s, { type: "reset" }), ui.INITIAL_STATE);
    assert.equal(ui.INITIAL_STATE.inputs, null);
  });

  test("an edit after validation messages marks nothing out of date, so no feature appears or waits", () => {
    const invalid = engine.calculateGratuity(input({ wages: "0" }));
    const s = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result: invalid, inputs: input({ wages: "0" }) });
    assert.equal(ui.reduceState(s, { type: "edit" }).stale, false);
  });
});

describe("review corrections", () => {
  test("Enter in the second-wages field while the result is out of date explains why nothing changed, in plain words", () => {
    assert.match(ui.STALE_COMPARE_MESSAGE, /out of date/);
    assert.match(ui.STALE_COMPARE_MESSAGE, /Press Calculate first/);
    assert.ok(!/guarantee|payable|eligible/i.test(ui.STALE_COMPARE_MESSAGE));
  });

  test("the out-of-date messages for Compare and Copy name the action and promise nothing", () => {
    assert.match(ui.STALE_COPY_MESSAGE, /out of date/);
    assert.match(ui.STALE_COPY_MESSAGE, /Press Calculate first/);
    assert.ok(!/guarantee|payable|eligible/i.test(ui.STALE_COPY_MESSAGE));
  });

  test("each explorer row groups its date, status, service and amount in one list item under one heading", () => {
    const html = ui.renderExplorerHtml(explorer());
    const items = html.match(/<li class="gratuity-explorer__row">[\s\S]*?<\/li>/g);
    assert.equal(items.length, 2);
    for (const item of items) {
      assert.equal((item.match(/<h4/g) || []).length, 1);
      assert.match(item, /Estimated gratuity/);
      assert.match(item, /5 years|6 years|years, /);
    }
    assert.match(html, /<ol class="gratuity-explorer__list">/);
  });
});
