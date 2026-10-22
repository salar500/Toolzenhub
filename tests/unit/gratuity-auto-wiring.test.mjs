/**
 * Tool Pack 29, G9 refinement: the wiring of the automatic calculation, run against a small stand-in for the page.
 *
 * There is no DOM library in this repository, so the page's init() is given stand-in elements (attributes, listeners, text)
 * and a controlled clock. This checks the order of events, not the look or a real browser: what is calculated and when,
 * that typed wages wait, that Reset during the wait leaves nothing behind, that an update never moves focus, that an
 * announcement is sent once per settled change, and that a comparison is worked out again. The real-browser behaviour is
 * checked on a runner by tests/browser/gratuity-auto.spec.js.
 *
 * Run directly: node --test tests/unit/gratuity-auto-wiring.test.mjs
 */
import { describe, test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

let ui;

/* ---------- a controlled clock ---------- */
let now = 0;
let queue = [];
let nextId = 1;
const realSetTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;
function installClock() {
  now = 0;
  queue = [];
  globalThis.setTimeout = (fn, ms = 0) => { const id = nextId++; queue.push({ id, at: now + ms, fn }); return id; };
  globalThis.clearTimeout = (id) => { queue = queue.filter((t) => t.id !== id); };
}
function advance(ms) {
  const end = now + ms;
  for (;;) {
    queue.sort((a, b) => a.at - b.at || a.id - b.id);
    const next = queue[0];
    if (!next || next.at > end) break;
    queue.shift();
    now = next.at;
    next.fn();
  }
  now = end;
}

/* ---------- stand-in elements ---------- */
function element(props = {}) {
  const attrs = {};
  const listeners = {};
  const el = {
    hidden: false, value: "", checked: false, textContent: "", dataset: {}, open: false,
    _html: "", children: {},
    attrs,
    listeners,
    focused: 0,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return k in attrs ? attrs[k] : null; },
    removeAttribute(k) { delete attrs[k]; },
    hasAttribute(k) { return k in attrs; },
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    focus() { page.focus = el; el.focused += 1; },
    select() {},
    closest() { return null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    ...props
  };
  return el;
}

let page;

function build() {
  const radios = (name, values) => values.map((value) => element({ value, name, id: `gratuity-${name}-${value}` }));
  const typeRadios = radios("type", ["regular", "fixedTerm", "other"]);
  const endRadios = radios("end", ["expires", "earlier"]);
  const wages = element({ id: "gratuity-wages" });
  const joining = element({ id: "gratuity-joining" });
  const exit = element({ id: "gratuity-exit" });
  const reset = element({ id: "gratuity-reset" });
  const live = element({ id: "gratuity-live" });
  const stale = element({ id: "gratuity-stale", hidden: true });
  const form = element({ id: "gratuity-form" });
  const errors = Object.fromEntries(["employeeType", "contractEnd", "wages", "joiningDate", "exitDate"].map((k) => [k, element({ hidden: true })]));

  /* the results region holds markup as text; the second-wages field and the compare output are found by id */
  const second = element({ id: "gratuity-wages-second" });
  const compareOutput = element({ id: "gratuity-compare-output" });
  const compareMessage = element({ hidden: true });
  const results = element({
    id: "gratuity-results",
    querySelector(sel) {
      const html = this._html;
      if (sel === "#gratuity-wages-second") return /id="gratuity-wages-second"/.test(html) ? second : null;
      if (sel === "#gratuity-compare-output") return /id="gratuity-compare-output"/.test(html) ? compareOutput : null;
      if (sel === "#gratuity-error-wages-second") return /id="gratuity-error-wages-second"/.test(html) ? compareMessage : null;
      if (sel === ".gratuity-working") return /class="gratuity-working"/.test(html) ? element({ open: false }) : null;
      if (sel === "#gratuity-result-heading") return /id="gratuity-result-heading"/.test(html) ? element({}) : null;
      return null;
    },
    querySelectorAll(sel) {
      /* one stand-in per out-of-date label in the markup, hidden at first as in the real markup */
      if (sel === "[data-stale-badge]") {
        const count = (this._html.match(/data-stale-badge/g) || []).length;
        if (this._badges.length !== count) this._badges = Array.from({ length: count }, () => element({ hidden: true }));
        return this._badges;
      }
      return [];
    }
  });
  results._badges = [];
  Object.defineProperty(results, "innerHTML", {
    get() { return this._html; },
    set(value) { this._html = value; this._badges = []; second.value = ""; compareOutput._html = ""; }
  });
  Object.defineProperty(compareOutput, "innerHTML", { get() { return this._html; }, set(v) { this._html = v; } });

  const byId = { "#gratuity-form": form, "#gratuity-results": results, "#gratuity-live": live, "#gratuity-stale": stale, "#gratuity-reset": reset, "#gratuity-wages": wages, "#gratuity-joining": joining, "#gratuity-exit": exit };
  const errorIds = {};
  const root = {
    querySelector(sel) {
      if (byId[sel]) return byId[sel];
      if (sel === "#gratuity-type-group" || sel === "#gratuity-end-group" || sel === "#gratuity-details") return element({});
      const m = sel.match(/^#gratuity-error-(.+)$/);
      if (m) return (errorIds[m[1]] ||= element({ hidden: true }));
      if (sel.startsWith("label[for=")) return element({});
      if (/-hint$/.test(sel)) return element({});
      return element({});
    },
    querySelectorAll(sel) {
      if (sel.includes('name="gratuity-type"')) return typeRadios;
      if (sel.includes('name="gratuity-end"')) return endRadios;
      return [];
    }
  };
  page = { root, form, wages, joining, exit, reset, results, live, stale, typeRadios, endRadios, second, compareOutput, focus: null, announcements: [] };
  return page;
}

const fire = (el, type, target = el) => { for (const fn of el.listeners[type] ?? []) fn({ target, key: undefined, preventDefault() {} }); };
const choose = (radio, group) => { for (const r of group) r.checked = r === radio; fire(page.form, "input", radio); fire(page.form, "change", radio); };
const setDate = (el, value) => { el.value = value; fire(page.form, "input", el); fire(page.form, "change", el); };
const typeWages = (text) => { page.wages.value = text; fire(page.form, "input", page.wages); };
const html = () => page.results._html;

before(async () => {
  ui = await import("../../assets/js/calculators/gratuity/index.js");
});

beforeEach(() => {
  installClock();
  build();
  /* read the live region as a log */
  let text = "";
  Object.defineProperty(page.live, "textContent", { get: () => text, set: (v) => { text = v; if (v) page.announcements.push(v); } });
  ui.init(page.root);
});

describe("automatic calculation, wired", () => {
  test("a type, two dates and typed wages: nothing is calculated until the wages have paused", () => {
    choose(page.typeRadios[0], page.typeRadios);
    assert.match(html(), /Still needed: the qualifying monthly wages, the joining date and the exit date\./);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    assert.match(html(), /Still needed: the qualifying monthly wages\./);

    typeWages("5");
    advance(300);
    typeWages("50");
    advance(300);
    typeWages("50000");
    advance(599);
    assert.ok(!html().includes("gratuity-result-heading"), "not yet: 599 ms since the last digit");
    assert.deepEqual(page.announcements, []);
    advance(1);
    assert.match(html(), /₹1,44,230\.77/);
    assert.match(html(), /gratuity-service/);
    assert.equal(page.focus, null, "focus never moved");

    advance(999);
    assert.deepEqual(page.announcements, []);
    advance(1);
    assert.equal(page.announcements.length, 1);
    assert.match(page.announcements[0], /₹1,44,230\.77/);
    advance(5000);
    assert.equal(page.announcements.length, 1, "no later duplicate");
  });

  test("a chosen date is read at once, and a result for the same entries is not announced twice", () => {
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    assert.match(html(), /₹1,44,230\.77/);
    advance(1000);
    assert.equal(page.announcements.length, 1);
    setDate(page.exit, "2026-07-01");
    assert.match(html(), /₹1,73,076\.92/);
    assert.match(html(), /5 years, 6 months and 1 day/);
    advance(5000);
    assert.equal(page.announcements.length, 2, "one per settled change");
    assert.match(page.announcements[1], /₹1,73,076\.92/);
    setDate(page.exit, "2026-07-01"); // the same entries again
    advance(5000);
    assert.equal(page.announcements.length, 2);
  });

  test("an incomplete or invalid entry keeps the earlier result, labelled out of date, with no new figure", () => {
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    const shown = html();
    setDate(page.exit, "");
    assert.equal(html(), shown, "the earlier result is kept as it was");
    assert.equal(page.results.dataset.stale, "true");
    assert.equal(page.stale.hidden, false);
    assert.equal(page.announcements.filter((t) => /out of date/i.test(t)).length, 0, "out of date is shown, not spoken");
    setDate(page.exit, "2020-12-31");
    assert.equal(html(), shown, "an exit before the joining date gives no figure either");
    setDate(page.exit, "2026-06-30");
    assert.equal(page.results.dataset.stale, undefined, "back to the same entries: current again");
    assert.equal(html(), shown);
  });

  test("Reset during the pause: no result appears afterwards, the fields are empty, focus goes to the first field", () => {
    choose(page.typeRadios[0], page.typeRadios);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    typeWages("50000");
    advance(300);
    fire(page.reset, "click");
    advance(10000);
    assert.ok(!html().includes("gratuity-result-heading"));
    assert.match(html(), /Choose the employee type and enter your wages and dates\./);
    assert.equal(page.wages.value, "");
    assert.equal(page.joining.value, "");
    assert.ok(page.typeRadios.every((r) => !r.checked));
    assert.equal(page.focus, page.typeRadios[0]);
    assert.deepEqual(page.announcements, ["Cleared. Choose the employee type and enter your wages and dates."]);
  });

  test("Reset after a result forgets the result and the comparison wages", () => {
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    assert.match(html(), /₹1,44,230\.77/);
    fire(page.reset, "click");
    assert.ok(!html().includes("gratuity-service"));
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    assert.equal(page.second.value, "");
  });

  test("a showing comparison is worked out again for a new result; the typed wages stay; none opens by itself", () => {
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    assert.equal(page.compareOutput._html, "", "nothing compared yet");

    page.second.value = "100000";
    fire(page.results, "input", page.second);
    fire(page.results, "submit", { id: "gratuity-compare-form" });
    assert.match(page.compareOutput._html, /₹2,88,461\.54/);

    setDate(page.exit, "2026-07-01");
    assert.equal(page.second.value, "100000", "the wages typed stay");
    assert.match(page.compareOutput._html, /₹3,46,153\.85/, "worked out again for the new result");
    assert.ok(!page.compareOutput._html.includes("₹2,88,461.54"));

    page.second.value = "100001";
    fire(page.results, "input", page.second);
    assert.equal(page.compareOutput._html, "", "figures for the old wages are cleared");
    setDate(page.exit, "2026-06-30");
    assert.equal(page.compareOutput._html, "", "and nothing opens by itself afterwards");
  });

  test("other type and a fixed-term contract: an explanation or an illustrative amount, without pressing anything", () => {
    choose(page.typeRadios[2], page.typeRadios);
    assert.match(html(), /gratuity-result-heading/);
    assert.ok(!html().includes("gratuity-amount"));
    assert.ok(!html().includes("gratuity-service"));
    fire(page.reset, "click");

    choose(page.typeRadios[1], page.typeRadios);
    assert.match(html(), /Still needed: how the contract ends/);
    choose(page.endRadios[0], page.endRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2025-01-01");
    setDate(page.exit, "2025-12-31");
    assert.match(html(), /₹28,846\.15/);
    assert.match(html(), /Contract start date/);
  });

  test("Enter in the wages field asks for the answer at once and never submits the page", () => {
    choose(page.typeRadios[0], page.typeRadios);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    page.wages.value = "50000";
    let prevented = 0;
    for (const fn of page.wages.listeners.keydown ?? []) fn({ key: "Enter", preventDefault() { prevented += 1; } });
    assert.equal(prevented, 1);
    assert.match(html(), /₹1,44,230\.77/);
    let submitPrevented = 0;
    for (const fn of page.form.listeners.submit ?? []) fn({ preventDefault() { submitPrevented += 1; } });
    assert.equal(submitPrevented, 1);
  });

  test("the Out of date label beside the figures is shown exactly while the result is out of date", () => {
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    const badges = () => page.results.querySelectorAll("[data-stale-badge]");
    assert.ok(badges().length >= 2, "one beside the amount and one in the explorer");
    assert.ok(badges().every((b) => b.hidden === true), "hidden while the result is current");

    setDate(page.exit, "");
    assert.ok(badges().every((b) => b.hidden === false), "shown with every figure once an entry is incomplete");
    setDate(page.exit, "2020-12-31");
    assert.ok(badges().every((b) => b.hidden === false), "and while an entry is invalid");
    setDate(page.exit, "2026-06-30");
    assert.ok(badges().every((b) => b.hidden === true), "gone when the entries are back to the shown result");
    setDate(page.exit, "2026-07-01");
    assert.ok(badges().every((b) => b.hidden === true), "a new result is current");
  });

  test("an invalid exit date gives no figure, moves no focus and keeps the earlier amount labelled", () => {
    choose(page.typeRadios[0], page.typeRadios);
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2021-01-01");
    setDate(page.exit, "2026-06-30");
    const shown = html();
    setDate(page.exit, "2020-12-31");
    advance(5000);
    assert.equal(html(), shown, "no new figure, no replacement");
    assert.equal(page.focus, null, "nothing took focus");
    assert.equal(page.announcements.filter((t) => /₹/.test(t)).length, 1, "only the first result was announced");
  });

  test("a fixed-term contract that ends earlier asks for the wages and dates first, then gives the approved explanation and no figure", () => {
    choose(page.typeRadios[1], page.typeRadios);
    choose(page.endRadios[1], page.endRadios);
    assert.match(html(), /Still needed: the qualifying monthly wages, the contract start date and the contract end date\./);
    assert.ok(!html().includes("gratuity-result-heading"));
    page.wages.value = "50000";
    fire(page.form, "change", page.wages);
    setDate(page.joining, "2025-01-01");
    setDate(page.exit, "2025-12-31");
    assert.match(html(), /When a fixed-term contract ends before its full term, whether gratuity is due depends on the contract and on your employer\./);
    assert.ok(!html().includes("gratuity-amount"));
    assert.ok(!html().includes("gratuity-service"));
    assert.ok(!html().includes("₹"));
    assert.equal(page.focus, null);
  });

  test("the pause is the approved 600 ms and the announcement waits at least a second", () => {
    assert.equal(ui.AUTO_DELAY_MS, 600);
    assert.ok(ui.ANNOUNCE_DELAY_MS >= 1000);
  });
});

/* leave the real timers as they were */
describe("clock restored", () => {
  test("real timers are back", () => {
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
    assert.equal(globalThis.setTimeout, realSetTimeout);
  });
});
