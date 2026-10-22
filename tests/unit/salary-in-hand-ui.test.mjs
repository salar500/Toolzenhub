/**
 * Tool Pack 30, S4: the Salary / CTC to In-Hand Calculator page module (assets/js/calculators/salary-in-hand/index.js) and
 * its registration. The financial engine itself is pinned by tests/unit/salary-in-hand-golden.test.mjs against the independent
 * oracle; this file pins what the page does with the engine's results and never repeats the oracle's arithmetic. The only
 * figures here are read from the oracle's own fixture (tests/fixtures/salary-in-hand-golden.json) and compared with what the
 * page would show for the same entries, so the whole path from typed text to displayed text is checked once.
 *
 * Pinned: the typed-amount parser and the Indian rupee formatting; the engine's input built from the fields (a blank is
 * absent, a malformed amount is refused on its own field, nothing is preselected); the hold and error wording; the view
 * of every status; the escaping; the out-of-date, edit and Reset transitions (a pure reducer); the static markup contract
 * (one h1, labelled controls, nothing preselected, no Calculate button, a polite status region, every aria-describedby
 * resolving); the wording rules of specification 6.5 (estimate, average, annual liability, never a payslip or a deposit);
 * the out-of-date wording equal to the Gratuity Calculator's (owner decision D11); and the registration (catalog entry,
 * style list, Growth ledger, the finished page).
 *
 * What it does NOT cover: the DOM wiring in init() (focus, the live region, typed events, debounce) and the layout. Those need
 * a browser and are verified in the bounded remote run (specification section 21) and by hand on a phone.
 *
 * Run directly: node --test tests/unit/salary-in-hand-ui.test.mjs
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
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "salary-in-hand-golden.json"), "utf8"));

let ui, engine, gratuityUi, registry, toolsData, toolPage;

before(async () => {
  ui = await import("../../assets/js/calculators/salary-in-hand/index.js");
  engine = await import("../../assets/js/calculators/formulas/salary-in-hand.js");
  gratuityUi = await import("../../assets/js/calculators/gratuity/index.js");
  registry = await import("../../assets/js/calculator-registry.js");
  toolsData = await import("../../assets/js/data/tools.js");
  toolPage = await import("../../assets/js/pages/tool-page.js");
});

const fields = (extra = {}) => ({
  ctc: "1200000", basicPercent: "50", pfBasis: "capped", gratuity: "yes", professionalTax: "", otherEmployerCosts: "",
  oldEnabled: false, hraReceived: "", rentPaid: "", metro: "", other80C: "", ...extra
});

const run = (extra, asOf = "2026-10-22") => {
  const { input, typed } = ui.buildInput(fields(extra));
  return { result: engine.calculateSalary(input, { asOf }), typed };
};

const view = (extra) => {
  const { result, typed } = run(extra);
  return ui.describeResult(result, typed, fields(extra));
};

const html = (extra) => ui.renderResultHtml(view(extra));
const text = (markup) => markup.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

describe("typed amounts and rupee formatting", () => {
  test("Indian digit grouping from integers", () => {
    const cases = [[0, "₹0"], [5, "₹5"], [999, "₹999"], [1000, "₹1,000"], [12345, "₹12,345"], [100000, "₹1,00,000"], [1200000, "₹12,00,000"],
      [5000000, "₹50,00,000"], [1096754, "₹10,96,754"], [123456789, "₹12,34,56,789"], [-1500, "−₹1,500"]];
    for (const [n, want] of cases) assert.equal(ui.formatRupees(n), want);
  });

  test("a typed amount: digits with commas or spaces; empty, bad and ok are different states", () => {
    assert.deepEqual(ui.parseRupees("1200000"), { state: "ok", value: 1200000 });
    assert.deepEqual(ui.parseRupees("12,00,000"), { state: "ok", value: 1200000 });
    assert.deepEqual(ui.parseRupees(" 12 00 000 "), { state: "ok", value: 1200000 });
    assert.deepEqual(ui.parseRupees("0"), { state: "ok", value: 0 });
    for (const empty of ["", "   ", null, undefined]) assert.deepEqual(ui.parseRupees(empty), { state: "empty" });
    for (const bad of ["1.5", "1200000.50", "-5", "+5", "₹100", "1e6", "abc", "12a", ",,,", "9999999999999999", "0x10", "١٢٣"]) assert.deepEqual(ui.parseRupees(bad), { state: "bad" }, bad);
  });

  test("dates and the India date used for the validity check", () => {
    assert.equal(ui.formatIsoDate("2026-10-22"), "22 October 2026");
    assert.equal(ui.formatIsoDate("2026-09-17"), "17 September 2026");
    assert.equal(ui.todayIso(Date.parse("2026-10-22T10:00:00Z")), "2026-10-22");
    assert.equal(ui.todayIso(Date.parse("2026-03-31T18:29:59Z")), "2026-03-31");
    assert.equal(ui.todayIso(Date.parse("2026-03-31T18:30:00Z")), "2026-04-01"); // midnight in India
    assert.equal(ui.todayIso(Date.parse("2027-03-31T18:29:59Z")), "2027-03-31");
    assert.equal(ui.todayIso(Date.parse("2027-03-31T18:30:00Z")), "2027-04-01");
  });
});

describe("the engine's input is built from the fields", () => {
  test("a blank is absent, never defaulted: nothing is chosen for the user", () => {
    const { input } = ui.buildInput(fields({ ctc: "", basicPercent: "", pfBasis: "", gratuity: "" }));
    assert.deepEqual([input.ctc, input.basicPercent, input.pfBasis, input.gratuityIncluded], [undefined, undefined, undefined, undefined]);
    assert.equal("oldRegime" in input, false);
    const none = ui.buildInput(fields({ gratuity: "no" })).input;
    assert.equal(none.gratuityIncluded, false);
  });

  test("a malformed amount is refused on its own field and remembered as typed wrongly", () => {
    const { input, typed } = ui.buildInput(fields({ ctc: "12.5", professionalTax: "abc" }));
    assert.ok(Number.isNaN(input.ctc) && Number.isNaN(input.professionalTax));
    assert.deepEqual(typed, { ctc: true, professionalTax: true });
    const { result } = run({ ctc: "12.5" });
    assert.equal(result.status, "invalid");
    assert.deepEqual(Object.keys(result.errors), ["ctc"]);
  });

  test("the old-regime group is sent only while the comparison is on, with blanks absent and the city only when chosen", () => {
    const on = ui.buildInput(fields({ oldEnabled: true, hraReceived: "120000", rentPaid: "", metro: "yes", other80C: "0" })).input.oldRegime;
    assert.deepEqual(on, { enabled: true, hraReceived: 120000, rentPaid: undefined, other80C: 0, highCity: true });
    assert.equal(ui.buildInput(fields({ oldEnabled: true, metro: "no" })).input.oldRegime.highCity, false);
    assert.equal(ui.buildInput(fields({ oldEnabled: true })).input.oldRegime.highCity, undefined);
    assert.equal("oldRegime" in ui.buildInput(fields({ oldEnabled: false, hraReceived: "5" })).input, false);
  });

  test("the entries key ignores nothing that matters and ignores surrounding spaces", () => {
    assert.equal(ui.inputsKey(fields()), ui.inputsKey(fields({ ctc: " 1200000 " })));
    for (const change of [{ ctc: "1200001" }, { basicPercent: "51" }, { pfBasis: "none" }, { gratuity: "no" }, { professionalTax: "1" }, { otherEmployerCosts: "1" }, { oldEnabled: true }, { hraReceived: "1" }, { rentPaid: "1" }, { metro: "yes" }, { other80C: "1" }]) {
      assert.notEqual(ui.inputsKey(fields(change)), ui.inputsKey(fields()), JSON.stringify(change));
    }
  });

  test("hold for incomplete or invalid entries, show for anything else", () => {
    assert.equal(ui.autoOutcome({ status: "incomplete" }), "hold");
    assert.equal(ui.autoOutcome({ status: "invalid" }), "hold");
    assert.equal(ui.autoOutcome({ status: "ok" }), "show");
    assert.equal(ui.autoOutcome({ status: "unsupported" }), "show");
  });
});

describe("the whole path from typed text to displayed figures agrees with the independent oracle", () => {
  const rupees = (n) => ui.formatRupees(n);

  test("the displayed monthly and annual figures equal the oracle's, for every oracle case the page can express", () => {
    let compared = 0;
    const mismatches = [];
    for (const c of GOLD.cases) {
      const i = c.input;
      if (c.expect.status !== "ok" || c.options.asOf !== undefined) continue;
      if (![i.ctc, i.otherEmployerCosts ?? 0, i.professionalTax ?? 0].every(Number.isInteger)) continue;
      if (typeof i.basicPercent === "string" && !/^\d+(\.\d+)?$/.test(i.basicPercent)) continue;
      const f = fields({
        ctc: String(i.ctc), basicPercent: String(i.basicPercent), pfBasis: i.pfBasis, gratuity: i.gratuityIncluded ? "yes" : "no",
        professionalTax: i.professionalTax === undefined ? "" : String(i.professionalTax),
        otherEmployerCosts: i.otherEmployerCosts === undefined ? "" : String(i.otherEmployerCosts)
      });
      const { input, typed } = ui.buildInput(f);
      const v = ui.describeResult(engine.calculateSalary(input, { asOf: "2026-10-22" }), typed, f);
      try {
        assert.equal(v.kind, "ok");
        assert.equal(v.monthly, rupees(c.expect.new.monthlyAverage));
        assert.equal(v.annual, rupees(c.expect.new.annualTakeHome));
        assert.ok(v.rows.some((r) => r.label === "Annual CTC" && r.value === rupees(c.expect.ctc)));
        assert.ok(v.rows.some((r) => /^Gross salary/.test(r.label) && r.value === rupees(c.expect.gross)));
        assert.ok(v.rows.some((r) => /^Your PF/.test(r.label) && r.value === rupees(c.expect.employeePf)));
        assert.ok(v.rows.some((r) => /^Employer PF/.test(r.label) && r.value === rupees(c.expect.employerPf)));
        assert.ok(v.rows.some((r) => /^Estimated income tax/.test(r.label) && r.value === rupees(c.expect.new.tax)));
        compared += 1;
      } catch (error) {
        mismatches.push(c.id + ": " + error.message.split("\n")[0]);
      }
    }
    assert.deepEqual(mismatches.slice(0, 5), []);
    assert.ok(compared > 300, "compared " + compared);
  });

  test("the displayed old-regime figures equal the oracle's when the comparison is on and complete", () => {
    let compared = 0;
    for (const c of GOLD.cases) {
      const i = c.input;
      if (c.expect.status !== "ok" || c.expect.old.status !== "ok" || c.options.asOf !== undefined) continue;
      const o = i.oldRegime;
      if (![i.ctc, o.hraReceived, o.rentPaid, o.other80C].every(Number.isInteger)) continue;
      const f = fields({
        ctc: String(i.ctc), basicPercent: String(i.basicPercent), pfBasis: i.pfBasis, gratuity: i.gratuityIncluded ? "yes" : "no",
        professionalTax: i.professionalTax === undefined ? "" : String(i.professionalTax),
        otherEmployerCosts: i.otherEmployerCosts === undefined ? "" : String(i.otherEmployerCosts),
        oldEnabled: true, hraReceived: String(o.hraReceived), rentPaid: String(o.rentPaid), other80C: String(o.other80C),
        metro: o.highCity === true ? "yes" : o.highCity === false ? "no" : ""
      });
      const { input, typed } = ui.buildInput(f);
      const v = ui.describeResult(engine.calculateSalary(input, { asOf: "2026-10-22" }), typed, f);
      assert.equal(v.old.status, "ok", c.id);
      assert.equal(v.old.monthly, rupees(c.expect.old.monthlyAverage), c.id);
      assert.equal(v.old.annual, rupees(c.expect.old.annualTakeHome), c.id);
      assert.equal(v.old.tax, rupees(c.expect.old.tax), c.id);
      compared += 1;
    }
    assert.ok(compared > 100, "compared " + compared);
  });
});

describe("the engine's results as the page words them", () => {
  test("an empty form says what to do; nothing is invented", () => {
    const { result, typed } = run({ ctc: "", basicPercent: "", pfBasis: "", gratuity: "" });
    assert.equal(result.status, "incomplete");
    assert.match(ui.holdMessage(result, typed), /^Still needed: your annual CTC, your basic salary share, how your PF is worked out and whether gratuity is in your CTC\. The result appears here as soon as they are complete\.$/);
    assert.match(ui.holdMessage({ status: "ok" }), /^Enter your annual CTC/);
    assert.match(ui.holdMessage(run({ gratuity: "" }).result), /^Still needed: whether gratuity is in your CTC\./);
  });

  test("a wrong entry is located on its field with the page's wording; the rule is told only when the digits were fine", () => {
    const wrong = run({ ctc: "12.5", basicPercent: "0", professionalTax: "-1" });
    const list = ui.errorList(wrong.result, wrong.typed);
    assert.deepEqual(list.map((e) => e.field).sort(), ["basicPercent", "ctc", "professionalTax"]);
    assert.match(list.find((e) => e.field === "ctc").message, /digits only/);
    assert.match(list.find((e) => e.field === "basicPercent").message, /1 to 100.*two decimals/);
    assert.match(list.find((e) => e.field === "professionalTax").message, /whole number of rupees.*Enter 0 if none/);
    const big = run({ ctc: "100000", professionalTax: "95000" });
    const semantic = ui.errorList(big.result, big.typed);
    assert.deepEqual(semantic.map((e) => e.field), ["professionalTax"]);
    assert.match(semantic[0].message, /cannot be more than your gross salary/);
  });

  test("an impossible split is told in the engine's plain words and held, with no figure", () => {
    const { result, typed } = run({ basicPercent: "100" });
    assert.equal(result.status, "invalid");
    const v = ui.describeResult(result, typed, fields());
    assert.equal(v.kind, "hold");
    assert.deepEqual(v.errors.map((e) => e.field), ["decomposition"]);
    assert.match(v.message, /leave less than your basic salary/);
    assert.equal(/₹\d/.test(v.message), false);
  });

  test("a CTC above the cap and a date outside the tax year are refused with a stated reason and no figure", () => {
    const above = view({ ctc: "5000001" });
    assert.equal(above.kind, "unsupported");
    assert.match(above.message, /up to ₹50,00,000/);
    assert.match(ui.renderResultHtml(above), /calculator-results__error/);
    const late = run({}, "2027-04-01");
    assert.equal(late.result.reason, "outside-validity");
    assert.match(ui.unsupportedMessage(late.result), /tax year 2026-27 \(1 April 2026 to 31 March 2027\)/);
    assert.match(ui.unsupportedMessage({ reason: "internal" }), /reload the page/);
    assert.match(ui.unsupportedMessage({ reason: "x" }), /outside what this calculator can work out/);
  });

  test("the breakdown reads CTC, then employer-side costs, then gross, then your deductions, then take-home", () => {
    const v = view({ professionalTax: "2400", otherEmployerCosts: "12000" });
    assert.equal(v.kind, "ok");
    assert.deepEqual(v.rows.map((r) => r.type), ["total", "group", "row", "row", "row", "total", "group", "row", "row", "row", "total", "row"]);
    assert.match(v.rows[1].label, /employer-side costs \(not paid to you as cash\)/);
    assert.match(v.rows[6].label, /deducted from your pay/);
    assert.match(v.rows[3].label, /^Gratuity set aside/);
    assert.match(v.rows[4].label, /^Other employer-only costs/);
    const bare = view({ gratuity: "no", pfBasis: "none" });
    assert.equal(bare.rows.some((r) => /Gratuity/.test(r.label)), false);
    assert.equal(bare.rows.some((r) => /^Other employer-only/.test(r.label)), false);
    assert.match(bare.rows.find((r) => /^Professional tax/.test(r.label)).label, /none entered, so not included/);
  });

  test("the old-regime comparison is optional and independent: off shows nothing; incomplete or invalid leave the estimate", () => {
    assert.equal(view({}).old, null);
    const incomplete = view({ oldEnabled: true });
    assert.equal(incomplete.kind, "ok");
    assert.equal(incomplete.old.status, "incomplete");
    assert.match(incomplete.old.message, /Still needed for the old-regime figure: HRA received \(0 if none\), rent paid \(0 if none\) and other 80C investments \(0 if none\)\. Your new-regime estimate above does not depend on these\./);
    const invalid = view({ oldEnabled: true, hraReceived: "9999999", rentPaid: "0", other80C: "0" });
    assert.equal(invalid.kind, "ok");
    assert.equal(invalid.old.status, "invalid");
    assert.equal(invalid.monthly, view({}).monthly, "the new-regime figure is unchanged");
    const located = ui.errorList(run({ oldEnabled: true, hraReceived: "9999999", rentPaid: "0", other80C: "0" }).result, {});
    assert.deepEqual(located.map((e) => e.field), ["hraReceived"]);
    assert.match(located[0].message, /cannot be more than your gross salary/);
    const ok = view({ oldEnabled: true, hraReceived: "0", rentPaid: "0", other80C: "0" });
    assert.equal(ok.old.status, "ok");
    const markup = ui.renderResultHtml(ok);
    assert.match(text(markup), /Included: .*the old-regime standard deduction.*Not included: .*home loan interest/);
    assert.match(text(markup), /does not say which regime is better for you/);
    assert.match(markup, /href="\/Toolzenhub\/calculators\/income-tax\/"/);
  });

  test("the city is asked only when HRA and rent are both above zero (the engine reports it missing)", () => {
    const need = run({ oldEnabled: true, hraReceived: "120000", rentPaid: "240000", other80C: "0" });
    assert.deepEqual(need.result.old.missing, ["highCity"]);
    const answered = run({ oldEnabled: true, hraReceived: "120000", rentPaid: "240000", other80C: "0", metro: "yes" });
    assert.equal(answered.result.old.status, "ok");
    assert.equal(run({ oldEnabled: true, hraReceived: "0", rentPaid: "240000", other80C: "0" }).result.old.status, "ok");
  });
});

describe("what the page says and never says (specification 6.4, 6.5)", () => {
  let all;
  before(() => {
    all = text(html({ professionalTax: "2400", oldEnabled: true, hraReceived: "0", rentPaid: "0", other80C: "0" }) + ui.markup());
  });

  test("the estimate is an average, the tax is an annual liability, and nothing is a payslip or a deposit", () => {
    for (const must of [/Average per month \(estimate\)/, /Per year \(estimate\)/, /not an exact bank deposit/, /TDS/, /Estimated income tax for the year/,
      /not a payslip, payroll or tax advice/, /simplified estimate from your CTC, not a statutory wage calculation/, /has not yet been reviewed by an independent payroll or tax professional/,
      /Tax year 2026-27/, /checked on 22 October 2026/, /S\.O\. 5109\(E\) of 17 September 2026/]) {
      assert.match(all, must);
    }
    for (const never of [/credited to your/i, /will receive exactly/i, /guaranteed/i, /\bcertified\b/i, /approved by/i, /legal advice to/i, /\bbest regime\b/i, /\brecommend/i, /you should choose/i]) {
      assert.doesNotMatch(all, never, String(never));
    }
    assert.doesNotMatch(all, /\bexact\b(?! bank deposit)/i, "'exact' appears only in the negation 'not an exact bank deposit'");
    assert.doesNotMatch(all, /better(?! for you)/i, "'better' appears only in 'does not say which regime is better for you'");
  });

  test("the add-back is disclosed next to the figures without claiming compliance", () => {
    assert.match(all, /labour codes can add part of your allowances to wages when they are more than half of your total pay, which is not applied here/);
    assert.match(all, /your actual PF may be higher and your take-home lower/);
    assert.doesNotMatch(all, /complies|compliant with the (wage|labour)/i);
  });

  test("no unfilled placeholder, undefined or NaN reaches the page", () => {
    assert.doesNotMatch(all, /undefined|NaN|\[object|\$\{/);
  });

  test("the PF choice is described with its legal character, and the gratuity convention as a convention", () => {
    assert.match(all, /This is the statutory contribution/);
    assert.match(all, /voluntary or jointly agreed with your employer/);
    assert.match(all, /not a PF member or your employer is not covered/);
    assert.match(all, /a common employer convention, not a legal calculation|common employer convention you can check against your offer letter/);
  });

  test("the assumption lines follow the chosen PF basis and the gratuity choice", () => {
    const lines = (extra) => ui.assumptionLines(view(extra)).join(" ");
    assert.match(lines({ pfBasis: "capped" }), /capped at the wage ceiling \(12% on at most ₹25,000 a month\)/);
    assert.match(lines({ pfBasis: "full-basic" }), /12% of your whole basic salary \(a voluntary or jointly agreed arrangement\)/);
    assert.match(lines({ pfBasis: "none" }), /no PF contribution/);
    assert.match(lines({ gratuity: "yes" }), /about 4\.81% of basic salary/);
    assert.match(lines({ gratuity: "no" }), /No gratuity amount is taken out of your CTC\./);
    assert.match(lines({}), /since 17 September 2026/);
  });
});

describe("escaping", () => {
  test("every dynamic value is escaped: hostile text in any field cannot reach the markup", () => {
    const evil = '<img src=x onerror=alert(1)>';
    for (const extra of [{ ctc: evil }, { basicPercent: evil }, { professionalTax: evil }, { oldEnabled: true, hraReceived: evil }]) {
      const { result, typed } = run(extra);
      const v = ui.describeResult(result, typed, fields(extra));
      const out = v.kind === "ok" ? ui.renderResultHtml(v) : v.message + JSON.stringify(v.errors || []);
      assert.equal(out.includes(evil), false);
    }
    const sneaky = view({ basicPercent: "50" });
    assert.equal(/<script|onerror|javascript:/i.test(ui.renderResultHtml(sneaky)), false);
  });
});

describe("the out-of-date, edit and Reset transitions (the pure reducer)", () => {
  let ok, shown;
  before(() => {
    ok = run({}).result;
    shown = ui.reduceState(ui.INITIAL_STATE, { type: "calculate", result: ok, inputs: "k" });
  });

  test("a result is current after calculating, out of date after an edit, current again after a new calculation", () => {
    assert.deepEqual(shown, { result: ok, stale: false, inputs: "k" });
    assert.equal(ui.reduceState(shown, { type: "edit" }).stale, true);
    assert.deepEqual(ui.reduceState(ui.reduceState(shown, { type: "edit" }), { type: "calculate", result: ok, inputs: "k2" }), { result: ok, stale: false, inputs: "k2" });
  });

  test("an edit with no figure on screen marks nothing; an unsupported figure can be out of date; Reset clears everything", () => {
    assert.equal(ui.reduceState(ui.INITIAL_STATE, { type: "edit" }), ui.INITIAL_STATE);
    assert.equal(ui.reduceState({ result: { status: "invalid" }, stale: false, inputs: null }, { type: "edit" }).stale, false);
    assert.equal(ui.reduceState({ result: { status: "unsupported" }, stale: false, inputs: null }, { type: "edit" }).stale, true);
    assert.equal(ui.reduceState(ui.reduceState(shown, { type: "edit" }), { type: "reset" }), ui.INITIAL_STATE);
    assert.equal(ui.reduceState(shown, { type: "unknown" }), shown);
  });

  test("the out-of-date wording is the Gratuity Calculator's, so the two cannot drift (owner decision D11)", () => {
    assert.equal(ui.STALE_BADGE_LABEL, gratuityUi.STALE_BADGE_LABEL);
    assert.equal(ui.STALE_BADGE_TEXT, gratuityUi.STALE_BADGE_TEXT);
    assert.equal(ui.AUTO_DELAY_MS, gratuityUi.AUTO_DELAY_MS);
    assert.equal(ui.ANNOUNCE_DELAY_MS, gratuityUi.ANNOUNCE_DELAY_MS);
    assert.equal(ui.staleBadgeHtml().replace(/sih-/g, "gratuity-"), gratuityUi.staleBadgeHtml());
  });

  test("the label travels with the figures, hidden while current, on a result and on an unsupported result", () => {
    assert.match(html({}), /<p class="sih-stale-badge" data-stale-badge hidden><strong>Out of date\.<\/strong> These figures are not your current estimate\.<\/p>/);
    assert.match(ui.renderResultHtml(view({ ctc: "5000001" })), /data-stale-badge hidden/);
  });
});

describe("the static markup", () => {
  let markup;
  before(() => {
    markup = ui.markup();
  });

  test("one h1 with the tool's title, the intro first, a trust card, and the tax year with its date", () => {
    assert.equal((markup.match(/<h1>/g) || []).length, 1);
    assert.match(markup, /<h1>\s*Salary \/ CTC to In-Hand Calculator \(India\)\s*<\/h1>/);
    assert.ok(markup.indexOf("calculator-intro") < markup.indexOf("sih-form"));
    assert.match(markup, /Nothing is stored/);
    assert.match(markup, /Tax year 2026-27\. Rules checked on 22 October 2026\./);
  });

  test("the four required questions come first, are labelled, and nothing is preselected", () => {
    const order = ["sih-ctc", "sih-basic", "sih-pf-group", "sih-gratuity-group", "sih-pt", "sih-other", "sih-old-toggle"].map((id) => markup.indexOf(`id="${id}"`));
    assert.ok(order.every((n) => n > 0) && [...order].sort((a, b) => a - b).join() === order.join(), "in the documented order");
    for (const id of ["sih-ctc", "sih-basic", "sih-pt", "sih-other", "sih-hra", "sih-rent", "sih-80c"]) assert.match(markup, new RegExp(`<label[^>]*for="${id}"`), id);
    assert.equal(/<input[^>]*\schecked[\s>=]/.test(markup), false, "no radio or checkbox is checked");
    assert.equal(/value="[^"]+"\s*>/.test(markup.replace(/<input type="radio"[^>]*>/g, "")) && /<input[^>]*type="text"[^>]*value=/.test(markup), false, "no text field has a preset value");
    assert.equal((markup.match(/<legend/g) || []).length, 3, "PF basis, gratuity and the city: each group has a legend");
  });

  test("amount fields are text with a numeric keypad; the percentage has a decimal keypad", () => {
    for (const id of ["sih-ctc", "sih-pt", "sih-other", "sih-hra", "sih-rent", "sih-80c"]) assert.match(markup, new RegExp(`id="${id}"[^>]*type="text"[^>]*inputmode="numeric"`), id);
    assert.match(markup, /id="sih-basic"[^>]*inputmode="decimal"/);
  });

  test("there is no Calculate button; Reset is the only button and is a secondary action", () => {
    assert.equal((markup.match(/<button/g) || []).length, 1);
    assert.match(markup, /<button\s+type="button"\s+id="sih-reset"\s+class="calculator-form__button calculator-form__button--secondary"\s*>\s*Reset\s*<\/button>/);
    assert.doesNotMatch(markup, /Calculate</);
    assert.doesNotMatch(markup, /type="submit"/);
  });

  test("the old-regime fields and the city question start hidden; the stale sentence and the expiry notice start hidden", () => {
    for (const id of ["sih-old-fields", "sih-metro-group", "sih-stale", "sih-expired"]) assert.match(markup, new RegExp(`id="${id}"[^>]*hidden|id="${id}"[\\s\\S]{0,120}?hidden`), id);
    assert.match(markup, /id="sih-live"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.equal((markup.match(/aria-live=/g) || []).length, 1, "one live region");
  });

  test("every aria-describedby reference resolves to an element in the page", () => {
    const ids = new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const refs = [...markup.matchAll(/aria-describedby="([^"]+)"/g)].flatMap((m) => m[1].trim().split(/\s+/));
    assert.ok(refs.length >= 8);
    for (const ref of refs) assert.ok(ids.has(ref), `aria-describedby="${ref}" has no element`);
    for (const id of ids) assert.equal([...markup.matchAll(new RegExp(`\\sid="${id}"`, "g"))].length, 1, `duplicate id ${id}`);
  });

  test("the PF choices carry their legal description, and the unit labels are given", () => {
    assert.match(markup, /Capped at the wage ceiling: 12% of basic, on at most ₹25,000 a month, so at most ₹3,000 a month\. This is the statutory contribution\./);
    assert.match(markup, /12% of your whole basic salary\. This is a higher contribution that is voluntary or jointly agreed with your employer, who matches it\./);
    assert.match(markup, /Your offer letter or payslip shows which one applies/);
    assert.match(markup, /₹ a year/);
    assert.match(markup, /% of CTC/);
  });

  test("the explanation covers what CTC is, why in-hand pay is lower, why equal CTCs differ, and has a FAQ; no filler", () => {
    for (const heading of [/How to Use the Salary/, /What CTC Means, and Why In-Hand Pay Is Lower/, /Why Two Offers With the Same CTC Can Pay Differently/, /FAQ/]) assert.match(markup, heading);
    assert.equal((markup.match(/<details>/g) || []).length, 6);
    assert.ok(text(markup).length < 22000);
  });

  test("the legal claims in the page are limited to what the specification verified", () => {
    const t = text(markup);
    assert.doesNotMatch(t, /2,?500/, "no professional-tax amount is claimed");
    assert.match(t, /Delhi, Mumbai, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad or Bengaluru/);
    assert.match(t, /₹1,50,000 in total is applied for you/);
  });
});

describe("the tool module contract and the registration", () => {
  test("render, markup and init are functions", () => {
    for (const name of ["render", "markup", "init"]) assert.equal(typeof ui[name], "function", name);
  });

  test("the catalog entry: published, in the Tax category, with a lazy loader and the curated related tool", () => {
    const tool = toolsData.tools.find((t) => t.id === "salary-in-hand");
    assert.ok(tool);
    assert.deepEqual([tool.status, tool.category, tool.title], ["published", "tax", "Salary / CTC to In-Hand Calculator (India)"]);
    assert.equal(typeof tool.loader, "function");
    assert.deepEqual(tool.relatedTools, ["income-tax"]);
    assert.equal(tool.autoRelated, false);
    assert.equal(tool.sitePath, "/calculators/salary-in-hand/");
    for (const alias of ["ctc to in hand", "in hand salary", "take home salary"]) assert.ok(tool.aliases.includes(alias), alias);
    assert.ok(tool.seo.title.endsWith("| ToolZen Hub") && tool.seo.description.length > 80);
    assert.deepEqual(Object.entries(tool.capabilities).filter(([, on]) => on === true).map(([name]) => name).sort(), ["explanation", "localProcessing", "multipleInputs", "realtime", "reset", "validation"]);
  });

  test("the loader registry derives from the catalog and loads this module only on demand", async () => {
    assert.equal(typeof registry.calculatorRegistry["salary-in-hand"], "function");
    assert.equal(registry.calculatorMetadata["salary-in-hand"].category, "tax");
    const loaded = await registry.calculatorRegistry["salary-in-hand"]();
    assert.equal(loaded.markup, ui.markup);
  });

  test("the style list names the shared sheets and this tool's own sheet, and the file exists", () => {
    const styles = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "toolStyles.json"), "utf8"));
    const list = styles["salary-in-hand"].styles;
    assert.equal(list[list.length - 1], "/assets/css/calculators/salary-in-hand.css");
    assert.deepEqual(list.slice(0, -1), styles.gratuity.styles.slice(0, -1), "the same shared sheets as the nearest calculator");
    assert.ok(fs.existsSync(path.join(ROOT, "assets", "css", "calculators", "salary-in-hand.css")));
  });

  test("the stylesheet defines every sih- class the page uses, and no colour outside the existing palette variables or neutrals already in use", () => {
    const css = fs.readFileSync(path.join(ROOT, "assets", "css", "calculators", "salary-in-hand.css"), "utf8");
    const used = new Set([...(ui.markup() + html({ oldEnabled: true, hraReceived: "0", rentPaid: "0", other80C: "0" })).matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith("sih-")));
    for (const name of used) assert.ok(css.includes(`.${name}`), `.${name} is not styled`);
    const existing = ["gratuity.css", "calculator-results.css", "calculator-form.css"].map((name) => fs.readFileSync(path.join(ROOT, "assets", "css", "calculators", name), "utf8").toLowerCase()).join(String.fromCharCode(10));
    for (const colour of new Set(css.match(/#[0-9a-fA-F]{3,8}\b/g) || [])) assert.ok(existing.includes(colour.toLowerCase()), `${colour} is a new colour`);
  });

  test("the Growth ledger records the module", () => {
    const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "growth-manifest", "identity-ledger.json"), "utf8"));
    const entry = ledger.tools.find((t) => t.id === "salary-in-hand");
    assert.deepEqual(entry, { id: "salary-in-hand", module: "assets/js/calculators/salary-in-hand/index.js", moduleChanges: [], provenance: "added", state: "active" });
    assert.ok(fs.existsSync(path.join(ROOT, entry.module)));
  });

  test("the finished page: the tool's markup with the shared breadcrumb once and the related tool; no second breadcrumb", () => {
    const out = toolPage.buildToolPageHtml("salary-in-hand", ui, registry.calculatorMetadata["salary-in-hand"]);
    assert.equal((out.match(/class="calculator-breadcrumb"/g) || []).length, 1);
    assert.ok(out.indexOf("calculator-breadcrumb") < out.indexOf("calculator-intro"));
    assert.equal((ui.markup().match(/breadcrumb/gi) || []).length, 0);
    assert.match(out, /Home[\s\S]*Calculators[\s\S]*href="\/Toolzenhub\/tax\.html"[\s\S]*<strong>\s*Salary \/ CTC to In-Hand Calculator \(India\)/);
    assert.match(out, /class="related-section"/);
    assert.ok(out.includes("income-tax"));
  });

  test("the S3 engine and the Tool Pack 17 engine are unchanged by this phase (their files are not in the page module's own diff)", () => {
    const source = fs.readFileSync(path.join(ROOT, "assets", "js", "calculators", "salary-in-hand", "index.js"), "utf8");
    const imports = [...source.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]).sort();
    assert.deepEqual(imports, ["../../components/report-issue.js", "../../data/calculators.js", "../../routes.js", "../../ui/escape.js", "../../ui/field.js", "../../ui/result.js", "../formulas/salary-in-hand-config.js", "../formulas/salary-in-hand.js"]);
    assert.equal(/income-tax\.js|income-tax-config/.test(source), false, "the page does not reach into the tax engine");
    assert.equal(/\bMath\.(round|floor|ceil)\b|\*\s*0\.12|\/\s*12\b/.test(source.replace(/\/\*[\s\S]*?\*\//g, "")), false, "the page does no calculation of its own");
  });
});
