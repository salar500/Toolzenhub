/**
 * Tool Pack 29, G5: the Gratuity Calculator page module (assets/js/calculators/gratuity/index.js) and its minimal
 * registration. The engine itself is pinned by tests/unit/gratuity-golden.test.mjs; this file pins what the page does with
 * the engine's results.
 *
 * Pinned: exact paise formatting with Indian grouping and no floating-point conversion; the approved status statements
 * verbatim; the amount labels; that no wording calls a computed figure payable or guaranteed or says that anyone IS
 * eligible; the engine-to-page mapping for every status the engine can return; the escaping of every dynamic value; the
 * out-of-date, Calculate and Reset transitions (a pure reducer); the static markup contract (one h1, labelled controls,
 * no preselected type, a hidden contract-end group, a text wages field with a decimal keypad, a polite status region);
 * the tool module contract; and the registration (catalog entry, style list, Growth ledger, page build with the shared
 * breadcrumb and related content).
 *
 * What it does NOT cover: the DOM wiring in init() (focus, the live region, the typed events) and the layout. Those need a
 * browser and are verified by hand on a phone (specification section 25).
 *
 * Run directly: node --test tests/unit/gratuity-ui.test.mjs
 */
import { describe, test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* routes.js decides the URL prefix from window.location */
globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "gratuity-golden.json"), "utf8"));

let ui, engine, rules, registry, toolsData, toolPage;

before(async () => {
  ui = await import("../../assets/js/calculators/gratuity/index.js");
  engine = await import("../../assets/js/calculators/formulas/gratuity.js");
  rules = await import("../../assets/js/calculators/formulas/gratuity-rules.js");
  registry = await import("../../assets/js/calculator-registry.js");
  toolsData = await import("../../assets/js/data/tools.js");
  toolPage = await import("../../assets/js/pages/tool-page.js");
});

const base = { employeeType: "regular", wages: "50000", joiningDate: "2021-01-01", exitDate: "2026-06-30" };
const run = (input) => engine.calculateGratuity({ ...base, ...input });
const html = (input) => ui.renderResultHtml(ui.describeResult(run(input)));

/* every outcome the engine can produce, by its stable code */
const CASES = {
  STATUS_FIVE_YEARS_REACHED: { joiningDate: "2018-04-01", exitDate: "2026-03-31" },
  STATUS_FIFTH_YEAR_UNDETERMINED: { joiningDate: "2021-01-01", exitDate: "2025-12-30" },
  STATUS_THRESHOLD_NOT_REACHED: { joiningDate: "2022-01-01", exitDate: "2025-12-30" },
  FT_ONE_YEAR_MET: { employeeType: "fixedTerm", contractEnd: "expires", joiningDate: "2025-01-01", exitDate: "2025-12-31" },
  FT_UNDER_ONE_YEAR: { employeeType: "fixedTerm", contractEnd: "expires", joiningDate: "2025-01-01", exitDate: "2025-11-30" },
  UNSUPPORTED_OTHER_TYPE: { employeeType: "other" },
  UNSUPPORTED_EARLIER_LAW: { joiningDate: "2016-04-01", exitDate: "2024-03-31" },
  UNSUPPORTED_FT_EARLY_END: { employeeType: "fixedTerm", contractEnd: "earlier", joiningDate: "2025-01-01", exitDate: "2026-12-31" },
  INVALID: { wages: "0" },
  INCOMPLETE: { wages: "" }
};


describe("exact paise formatting", () => {
  test("rupees and paise with Indian grouping, from integer paise", () => {
    const f = ui.formatPaise;
    assert.equal(f(0), "₹0.00");
    assert.equal(f(1), "₹0.01");
    assert.equal(f(99), "₹0.99");
    assert.equal(f(100), "₹1.00");
    assert.equal(f(12345), "₹123.45");
    assert.equal(f(100000), "₹1,000.00");
    assert.equal(f(1234567), "₹12,345.67");
    assert.equal(f(23076923), "₹2,30,769.23");          /* the specification's anchor: 50,000 x 15 x 8 / 26 */
    assert.equal(f(14423077), "₹1,44,230.77");
    assert.equal(f(200000000), "₹20,00,000.00");        /* the ceiling */
    assert.equal(f(1000000000), "₹1,00,00,000.00");     /* the wage product limit */
    assert.equal(f(123456789012), "₹1,23,45,67,890.12");        /* groupings checked against an independent Python implementation */
    assert.equal(f(5), "₹0.05");
    assert.equal(f(Number.MAX_SAFE_INTEGER), "₹9,00,71,99,25,47,409.91");
  });

  test("anything that is not a non-negative whole number of paise is refused, never shown as zero", () => {
    for (const bad of [-1, 1.5, NaN, Infinity, -Infinity, "100", null, undefined, {}, [], true, Number.MAX_SAFE_INTEGER + 2, 0.1 + 0.2]) {
      assert.throws(() => ui.formatPaise(bad), RangeError, String(bad));
    }
  });

  test("the formatter does no floating-point conversion of the amount", () => {
    const code = fs.readFileSync(path.join(ROOT, "assets", "js", "calculators", "gratuity", "index.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.ok(!/formatINR|toFixed|parseFloat|Math\.round|Intl\.NumberFormat|toLocaleString/.test(code));
  });

  test("dates are written from the text, without a Date object", () => {
    assert.equal(ui.formatIsoDate("2026-12-31"), "31 December 2026");
    assert.equal(ui.formatIsoDate("2025-11-21"), "21 November 2025");
    assert.equal(ui.formatIsoDate("2024-02-29"), "29 February 2024");
    assert.equal(ui.formatIsoDate("10000-01-01"), "1 January 10000");
    for (const bad of ["2026-13-01", "26-12-31", "", "text"]) assert.throws(() => ui.formatIsoDate(bad), RangeError, bad);
  });

  test("the service is written with the right plurals", () => {
    assert.equal(ui.serviceText({ years: 5, months: 6, days: 1 }), "5 years, 6 months and 1 day");
    assert.equal(ui.serviceText({ years: 1, months: 1, days: 0 }), "1 year, 1 month and 0 days");
  });
});


describe("the engine's results as the page words them", () => {
  test("the three approved status statements are verbatim and are the only wording of those three outcomes", () => {
    const five = ui.describeResult(run(CASES.STATUS_FIVE_YEARS_REACHED));
    assert.equal(five.statement, "Five calendar years of service are reached on these dates. Whether you are eligible also depends on your service having been continuous and on the other conditions of the Code.");
    const fifth = ui.describeResult(run(CASES.STATUS_FIFTH_YEAR_UNDETERMINED));
    assert.equal(fifth.statement, "You are in your fifth year of service. Five calendar years are not yet reached on these dates, and this form cannot tell whether the Code's continuous-service rules would treat your last year as complete. The amount shown is illustrative only. Please ask your employer's payroll.");
    const not = ui.describeResult(run(CASES.STATUS_THRESHOLD_NOT_REACHED));
    assert.equal(not.statement, "Five calendar years of service are not yet reached on these dates. This is not a final legal determination.");
  });

  test("amount labels follow the engine's kind: estimated, illustrative, or no amount", () => {
    const five = ui.describeResult(run(CASES.STATUS_FIVE_YEARS_REACHED));
    assert.deepEqual([five.amount.kind, five.amount.label, five.amount.text], ["estimated", "Estimated gratuity (subject to the conditions stated)", "₹2,30,769.23"]);
    const fifth = ui.describeResult(run(CASES.STATUS_FIFTH_YEAR_UNDETERMINED));
    assert.deepEqual([fifth.amount.kind, fifth.amount.label, fifth.amount.text], ["illustrative", "Illustrative amount, not an entitlement", "₹1,44,230.77"]);
    assert.ok(fifth.notes.includes("This amount is illustrative. It does not mean you are owed it."));
    for (const code of ["STATUS_THRESHOLD_NOT_REACHED", "FT_UNDER_ONE_YEAR", "UNSUPPORTED_OTHER_TYPE", "UNSUPPORTED_EARLIER_LAW", "UNSUPPORTED_FT_EARLY_END", "INVALID", "INCOMPLETE"]) {
      assert.equal(ui.describeResult(run(CASES[code])).amount, null, code);
    }
    const ft = ui.describeResult(run(CASES.FT_ONE_YEAR_MET));
    assert.deepEqual([ft.amount.kind, ft.amount.text], ["illustrative", "₹28,846.15"]);
  });

  test("an amount is shown only when the engine returned an integer figure; a zero amount is never invented", () => {
    for (const [code, input] of Object.entries(CASES)) {
      const result = run(input);
      const view = ui.describeResult(result);
      if (result.amount.paise === null) assert.equal(view.amount, null, code);
      else assert.equal(view.amount.text, ui.formatPaise(result.amount.paise), code);
      assert.ok(!/₹0\.00/.test(ui.renderResultHtml(view)), code);
    }
  });

  test("the working shows the engine's own figures: wages, service, counted years, the formula and the amount", () => {
    const view = ui.describeResult(run(CASES.STATUS_FIVE_YEARS_REACHED));
    const lines = Object.fromEntries(view.working);
    assert.equal(lines["Qualifying monthly wages"], "₹50,000.00");
    assert.equal(lines["Service counted"], "8 years, 0 months and 0 days, with both days counted (to 31 March 2026)");
    assert.equal(lines["Years counted for the amount"], "8");
    assert.equal(lines["How the amount is worked out"], "₹50,000.00 ÷ 26 × 15 × 8 = ₹2,30,769.23");
  });

  test("the ceiling is described when it applied", () => {
    const view = ui.describeResult(run({ wages: "100000", joiningDate: "1990-04-01", exitDate: "2026-03-31" }));
    assert.equal(view.amount.ceilingApplied, true);
    assert.equal(view.amount.text, "₹20,00,000.00");
    assert.ok(view.notes.includes("The ceiling applied: the amount is capped at ₹20,00,000.00."));
    assert.match(Object.fromEntries(view.working)["How the amount is worked out"], /above the ceiling, so the amount is the ceiling, ₹20,00,000\.00$/);
  });

  test("the month-end disclosure is shown whenever the engine returns its identifier", () => {
    const view = ui.describeResult(run({ joiningDate: "2020-10-31", exitDate: "2026-04-30" }));
    assert.ok(view.notes.includes("We count both your joining day and your last day. If your joining day does not exist in a month (for example the 31st), that month's end completes the month. Your employer's payroll may count month-end dates differently, so please confirm with them."));
    assert.ok(!ui.describeResult(run(CASES.STATUS_FIVE_YEARS_REACHED)).notes.some((n) => n.startsWith("We count both")));
  });

  test("the five-year date is shown only when five years are not reached", () => {
    const view = ui.describeResult(run(CASES.STATUS_THRESHOLD_NOT_REACHED));
    assert.equal(view.fiveYearSentence, "Five calendar years of service are completed on 31 December 2026 for these dates.");
    assert.equal(ui.describeResult(run(CASES.STATUS_FIVE_YEARS_REACHED)).fiveYearSentence, null);
  });

  test("fixed-term results carry the contract assumptions and the contract check", () => {
    const view = ui.describeResult(run(CASES.FT_ONE_YEAR_MET));
    assert.ok(view.assumptions.some((a) => a.includes("service under a single contract")));
    assert.ok(view.assumptions.some((a) => a.includes("illustrative")));
    assert.ok(view.checks.some((c) => c.includes("fixed-term contract")));
    assert.match(view.statement, /^One year of service under the contract is reached on these dates/);
  });

  test("unsupported cases explain themselves and show no figure, no working and no lists", () => {
    for (const code of ["UNSUPPORTED_OTHER_TYPE", "UNSUPPORTED_EARLIER_LAW", "UNSUPPORTED_FT_EARLY_END"]) {
      const view = ui.describeResult(run(CASES[code]));
      assert.equal(view.status, "unsupported");
      assert.equal(view.amount, null);
      assert.equal(view.working, null);
      assert.deepEqual([view.assumptions, view.checks, view.notes], [[], [], []]);
      assert.ok(view.statement.length > 40);
    }
    assert.match(ui.describeResult(run(CASES.UNSUPPORTED_EARLIER_LAW)).statement, /21 November 2025/);
  });

  test("an engine error becomes a plain message, never a figure", () => {
    const view = ui.describeResult({ status: "error", code: "INTERNAL_ERROR", errors: [], amount: { kind: "none", paise: null } });
    assert.equal(view.amount, null);
    assert.match(view.statement, /^Something went wrong/);
    assert.ok(!/₹/.test(ui.renderResultHtml(view)));
  });

  test("the announcement is short, says the status once and carries the amount only when there is one", () => {
    const five = ui.describeResult(run(CASES.STATUS_FIVE_YEARS_REACHED));
    assert.equal(five.announcement, "Five calendar years of service are reached on these dates, subject to conditions. Estimated gratuity (subject to the conditions stated): ₹2,30,769.23.");
    const not = ui.describeResult(run(CASES.STATUS_THRESHOLD_NOT_REACHED));
    assert.equal(not.announcement, "Five calendar years of service are not yet reached on these dates.");
    for (const [code, input] of Object.entries(CASES)) {
      const text = ui.describeResult(run(input)).announcement;
      assert.ok(text.length > 10 && text.length < 220, `${code}: ${text.length}`);
    }
  });
});


describe("what the page never says", () => {
  const everything = () => Object.values(CASES).map((input) => html(input)).join("\n")
    + "\n" + ui.markup();

  test("no figure is called payable, guaranteed, approved or an entitlement", () => {
    const text = everything().replace(/<[^>]+>/g, " ");
    assert.ok(!/payable|guarantee|you will receive|you will get|you qualify|you are entitled|approved/i.test(text));
    /* "entitlement" appears only in the label and the note that deny it */
    for (const m of text.matchAll(/entitlement/gi)) {
      const around = text.slice(Math.max(0, m.index - 40), m.index + 20);
      assert.match(around, /not an entitlement/i);
    }
  });

  test('"you are eligible" appears only inside the qualified status sentences', () => {
    const text = everything().replace(/<[^>]+>/g, " ").replace(/&#39;|&apos;/g, "'");
    const all = [...text.matchAll(/you are eligible/gi)].length;
    const qualified = [...text.matchAll(/Whether you are eligible also depends/g)].length;
    assert.equal(all, qualified);
    assert.ok(!/you are not eligible|you are ineligible|not eligible|ineligible/i.test(text));
  });

  test("an illustrative amount is never shown without its label and its note", () => {
    for (const code of ["STATUS_FIFTH_YEAR_UNDETERMINED", "FT_ONE_YEAR_MET"]) {
      const out = html(CASES[code]);
      assert.match(out, /Illustrative amount, not an entitlement/);
      assert.match(out, /This amount is illustrative\. It does not mean you are owed it\./);
      assert.match(out, /data-kind="illustrative"/);
    }
  });
});


describe("escaping", () => {
  test("every dynamic string reaches the HTML escaped", () => {
    const hostile = `<img src=x onerror="alert(1)">`;
    const view = {
      status: "ok", code: hostile, statement: hostile, short: hostile, fiveYearSentence: hostile,
      amount: { kind: hostile, label: hostile, text: hostile, ceilingApplied: false },
      working: [[hostile, hostile]], assumptions: [hostile], checks: [hostile], notes: [hostile], errors: [], announcement: hostile
    };
    const out = ui.renderResultHtml(view);
    assert.ok(!out.includes("<img"), "no raw tag");
    assert.ok(!/onerror="alert/.test(out), "no live attribute");
    assert.ok(out.includes("&lt;img"));
    const errors = ui.renderResultHtml({ status: "invalid", statement: hostile, errors: [{ message: hostile }] });
    assert.ok(!errors.includes("<img"));
  });

  test("the page module never writes user text into the page: the wages text is not echoed", () => {
    const view = ui.describeResult(engine.calculateGratuity({ ...base, wages: `<b>1</b>` }));
    const out = ui.renderResultHtml(view);
    assert.ok(!out.includes("<b>1</b>"));
    assert.ok(!out.includes("&lt;b&gt;"));
  });
});


describe("validation messages", () => {
  test("every (field, code) the engine can report has its own message, and the separator message shows an example", () => {
    const seen = new Set();
    for (const { input } of GOLD.validation) {
      for (const e of engine.calculateGratuity(input).errors) seen.add(`${e.field}|${e.code}`);
    }
    assert.ok(seen.size >= 10);
    for (const key of seen) {
      const [field, code] = key.split("|");
      assert.notEqual(ui.errorMessage(field, code), "Check this entry.", key);
    }
    assert.equal(ui.errorMessage("wages", "WAGES_SEPARATOR"), "Enter digits only, with no commas or spaces, for example 150000 or 150000.50.");
    assert.equal(ui.errorMessage("exitDate", "EXIT_BEFORE_JOINING"), "The exit date cannot be before the joining date.");
    assert.equal(ui.errorMessage("wages", "WAGES_PRODUCT_LIMIT"), "This calculator accepts monthly wages up to ₹1,00,00,000.");
    assert.equal(ui.errorMessage("nope", "NOPE"), "Check this entry.");
  });

  test("an invalid or incomplete result is a list of messages, and it never carries a figure", () => {
    const view = ui.describeResult(engine.calculateGratuity({ employeeType: "regular", wages: "1,50,000", joiningDate: "", exitDate: "2026-06-30" }));
    assert.equal(view.status, "incomplete");
    assert.deepEqual(view.errors.map((e) => [e.field, e.code]), [["wages", "WAGES_SEPARATOR"], ["joiningDate", "REQUIRED"]]);
    const out = ui.renderResultHtml(view);
    assert.match(out, /Check the highlighted fields\./);
    assert.ok(!/₹[0-9]/.test(out.replace("₹1,00,00,000", "")));
  });
});


describe("what the page shows after Calculate, an edit and Reset (the pure reducer)", () => {
  /* built when a test runs: the modules are loaded by the before hook */
  const fixtures = () => ({
    ok: run(CASES.STATUS_FIVE_YEARS_REACHED),
    unsupported: run(CASES.UNSUPPORTED_EARLIER_LAW),
    invalid: run(CASES.INVALID)
  });

  test("a result is current after Calculate; an edit marks it out of date; a second Calculate makes it current again", () => {
    const { ok } = fixtures();
    let s = ui.INITIAL_STATE;
    assert.deepEqual([s.result, s.stale], [null, false]);
    s = ui.reduceState(s, { type: "calculate", result: ok });
    assert.deepEqual([s.result === ok, s.stale], [true, false]);
    s = ui.reduceState(s, { type: "edit" });
    assert.deepEqual([s.result === ok, s.stale], [true, true]);
    const again = run({ wages: "60000" });
    s = ui.reduceState(s, { type: "calculate", result: again });
    assert.deepEqual([s.result === again, s.stale], [true, false]);
  });

  test("an edit with no result, or after validation messages, marks nothing out of date", () => {
    const { invalid } = fixtures();
    assert.deepEqual(ui.reduceState(ui.INITIAL_STATE, { type: "edit" }), ui.INITIAL_STATE);
    let s = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result: invalid });
    s = ui.reduceState(s, { type: "edit" });
    assert.equal(s.stale, false);
  });

  test("an unsupported explanation also goes out of date when an input is edited", () => {
    const { unsupported } = fixtures();
    let s = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result: unsupported });
    s = ui.reduceState(s, { type: "edit" });
    assert.equal(s.stale, true);
  });

  test("Reset returns the initial state from every state; unknown actions change nothing", () => {
    const { ok } = fixtures();
    let s = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result: ok });
    s = ui.reduceState(s, { type: "edit" });
    assert.deepEqual(ui.reduceState(s, { type: "reset" }), ui.INITIAL_STATE);
    assert.equal(ui.reduceState(s, { type: "nope" }), s);
    assert.throws(() => { ui.INITIAL_STATE.stale = true; }, TypeError);
  });

  test("the reducer never changes the state it is given", () => {
    const s = Object.freeze({ result: fixtures().ok, stale: false });
    assert.doesNotThrow(() => ui.reduceState(s, { type: "edit" }));
    assert.equal(s.stale, false);
  });
});


describe("the static markup", () => {
  const page = () => ui.markup();
  const count = (re) => (page().match(re) || []).length;

  test("it needs no document, window or browser object", () => {
    const code = fs.readFileSync(path.join(ROOT, "assets", "js", "calculators", "gratuity", "index.js"), "utf8");
    const before = code.slice(0, code.indexOf("export function markup()"));
    assert.ok(!/document\./.test(before.replace(/\/\*[\s\S]*?\*\//g, "")));
    assert.ok(typeof ui.markup() === "string" && ui.markup().length > 3000);
  });

  test("one h1; the wrapper the shared layer expects; no inline script or handler", () => {
    assert.equal(count(/<h1[\s>]/g), 1);
    assert.ok(page().includes('<div class="calculator-page">'), "the shared layer looks for exactly this wrapper to place the breadcrumb and related content");
    assert.ok(!/<script|onclick=|onchange=|oninput=|javascript:/i.test(page()));
    assert.match(page(), /<h1>\s*Gratuity Calculator \(India\)\s*<\/h1>/);
  });

  test("no employee type is preselected, and the contract-end group starts hidden", () => {
    for (const input of page().match(/<input[\s\S]*?>/g)) assert.ok(!/\schecked(\s|>|=)/.test(input), input);
    assert.match(page(), /<fieldset class="gratuity-choices" id="gratuity-end-group" hidden>/);
    assert.equal(count(/name="gratuity-type"/g), 3);
    assert.equal(count(/name="gratuity-end"/g), 2);
    for (const value of ["regular", "fixedTerm", "other", "expires", "earlier"]) assert.ok(page().includes(`value="${value}"`), value);
  });

  test("a single qualifying-wages text field with a decimal keypad, and no component fields", () => {
    assert.match(page(), /<input\s+id="gratuity-wages"[^>]*type="text"[^>]*inputmode="decimal"/);
    assert.equal(count(/type="number"/g), 0);
    assert.equal(count(/type="date"/g), 2);
    const controlIds = [...page().matchAll(/<input[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(controlIds, ["gratuity-type-regular", "gratuity-type-fixed", "gratuity-type-other", "gratuity-end-expires", "gratuity-end-earlier", "gratuity-wages", "gratuity-joining", "gratuity-exit"]);
    assert.equal(count(/<select|<textarea/g), 0);
    assert.match(page(), /not your gross salary/);
    assert.match(page(), /no commas or spaces/);
  });

  test("every control has a label; every radio group is a fieldset with a legend; ids are unique", () => {
    for (const id of ["gratuity-wages", "gratuity-joining", "gratuity-exit"]) {
      assert.ok(page().includes(`for="${id}"`), `label for ${id}`);
      assert.ok(page().includes(`id="${id}-hint"`), `hint for ${id}`);
    }
    assert.equal(count(/<fieldset/g), 2);
    assert.equal(count(/<legend/g), 2);
    for (const input of page().match(/<input[\s\S]*?>/g)) {
      if (/type="radio"/.test(input)) assert.match(input, /id="gratuity-(type|end)-/);
    }
    const ids = [...page().matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, "duplicate id");
    const errorIds = ids.filter((id) => id.startsWith("gratuity-error-"));
    assert.equal(errorIds.length, 5);
  });

  test("there is no Calculate button (the result updates by itself); one polite status region; the stale marker starts hidden", () => {
    assert.ok(!/gratuity-calculate/.test(page()) && !/type="submit"/.test(page()), "no Calculate or submit button");
    assert.ok(!/press Calculate/i.test(page()), "no instruction to press Calculate");
    assert.match(page(), /<button\s+type="button"\s+id="gratuity-reset"/);
    assert.equal(count(/aria-live="polite"/g), 1);
    assert.match(page(), /id="gratuity-live"\s+class="gratuity-sr-only"\s+role="status"/);
    assert.match(page(), /id="gratuity-stale"\s+class="gratuity-stale"\s+hidden/);
    assert.match(page(), /<form\s+id="gratuity-form"\s+class="calculator-form"\s+novalidate/);
  });

  test("the page starts with the empty state, the rules-checked date and the privacy line", () => {
    assert.match(page(), /Choose the employee type and enter your wages and dates\. The result appears here as soon as they are complete\./);
    assert.match(page(), /Rules checked on 21 October 2026\./);
    assert.match(page(), /Calculated in your browser/);
    assert.ok(!page().includes("₹0.00"));
  });

  test("the wages hint describes the Code's definition and carries no advice", () => {
    assert.match(page(), /section 2\(88\)/);
    assert.match(page(), /does not add HRA, bonus or overtime for you/);
  });
});


describe("the tool module contract and the registration", () => {
  test("render, markup and init are functions", () => {
    for (const name of ["render", "markup", "init"]) assert.equal(typeof ui[name], "function", name);
  });

  test("the catalog entry: published, in the Tax category, with a lazy loader and curated related tools", () => {
    const tool = toolsData.tools.find((t) => t.id === "gratuity");
    assert.ok(tool);
    assert.deepEqual([tool.status, tool.category, tool.title], ["published", "tax", "Gratuity Calculator (India)"]);
    assert.equal(typeof tool.loader, "function");
    assert.deepEqual(tool.relatedTools, ["income-tax"]);
    assert.equal(tool.autoRelated, false);
    assert.ok(tool.aliases.includes("gratuity calculator"));
    assert.ok(tool.seo.title.endsWith("| ToolZen Hub") && tool.seo.description.length > 80);
    assert.deepEqual(Object.entries(tool.capabilities).filter(([, on]) => on === true).map(([name]) => name).sort(), ["explanation", "localProcessing", "multipleInputs", "reset", "validation"]);
  });

  test("the loader registry derives from the catalog and loads this module only on demand", async () => {
    assert.equal(typeof registry.calculatorRegistry.gratuity, "function");
    assert.deepEqual({ ...registry.calculatorMetadata.gratuity }.category, "tax");
    const loaded = await registry.calculatorRegistry.gratuity();
    assert.equal(loaded.markup, ui.markup);
  });

  test("the style list names the shared sheets and this tool's own sheet, and the file exists", () => {
    const styles = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "toolStyles.json"), "utf8"));
    const list = styles.gratuity.styles;
    assert.equal(list[list.length - 1], "/assets/css/calculators/gratuity.css");
    assert.deepEqual(list.slice(0, -1), styles.ppf.styles.slice(0, -1), "the same shared sheets as the nearest calculator");
    assert.ok(fs.existsSync(path.join(ROOT, "assets", "css", "calculators", "gratuity.css")));
  });

  test("the Growth ledger records the module", () => {
    const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "growth-manifest", "identity-ledger.json"), "utf8"));
    const entry = ledger.tools.find((t) => t.id === "gratuity");
    assert.deepEqual(entry, { id: "gratuity", module: "assets/js/calculators/gratuity/index.js", moduleChanges: [], provenance: "added", state: "active" });
    assert.ok(fs.existsSync(path.join(ROOT, entry.module)));
  });

  test("the finished page: the tool's markup with the shared breadcrumb once and the related tools; no second breadcrumb", () => {
    const meta = registry.calculatorMetadata.gratuity;
    const out = toolPage.buildToolPageHtml("gratuity", ui, meta);
    assert.ok(out.startsWith("\n        <div class=\"calculator-page\">") || out.includes('<div class="calculator-page">'));
    assert.equal((out.match(/class="calculator-breadcrumb"/g) || []).length, 1, "the shared layer places exactly one breadcrumb, first in the page wrapper");
    assert.ok(out.indexOf("calculator-breadcrumb") < out.indexOf("calculator-intro"));
    assert.equal((ui.markup().match(/breadcrumb/gi) || []).length, 0, "the tool draws no breadcrumb of its own");
    assert.match(out, /Home[\s\S]*Calculators[\s\S]*href="\/Toolzenhub\/tax\.html"[\s\S]*<strong>\s*Gratuity Calculator \(India\)/, "Home, Calculators, the Tax category, the tool");
    assert.match(out, /class="related-section"/);
    assert.ok(out.includes("income-tax"), "the curated related tool is placed by the shared layer");
    assert.ok(out.includes("Gratuity Calculator (India)"));
  });
});
