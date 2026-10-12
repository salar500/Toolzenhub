/**
 * Tool Pack 25, Phase 1: the Cron Expression Explainer engine (assets/js/tools/cron-explainer/cron-engine.js).
 *
 * Reference values come from tests/fixtures/cron-golden.json, written ONLY by tests/fixtures/cron-golden.py. That
 * script is an independent reference: a port of cronie's field parser (src/entry.c, revision recorded in the fixture),
 * a brute-force datetime scan for the next runs, and values taken from the manual page and the cron.c comment. It does
 * not read or run the JavaScript, and no expected value here is a JavaScript output. Wherever a literal is typed in
 * this file (messages, notes, sentences) it is typed from the approved specification, not copied from the engine.
 *
 * No real cronie binary was run. Every claim is source-level.
 *
 * What is pinned: the pinned dialect (five fields, ranges, lists, steps, names, 0/7 Sunday, aliases), the refusals
 * (? L W # ~ H, n/s, reversed ranges, six fields, @reboot, non-ASCII), the day-of-month / day-of-week rule taken from
 * the text of the field (not from its values), the UTC next-run search (strictly after now, one 400-year cycle,
 * exact "never"), the safety limits, the summary sentences (checked against matching sets) and the notes.
 * Mutation tests break a copy of the engine in ten ways and require the golden checks to fail each time.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as Engine from "../../assets/js/tools/cron-explainer/cron-engine.js";

const {
  parseCron, nextRuns, explainCron, summarize, renderSummary, matchesDate, formatRun,
  daysFromCivil, civilFromDays, weekdayFromDays, isLeapYear, daysInMonth,
  MAX_INPUT_CHARS, MAX_FIELD_CHARS, MAX_LIST_ITEMS, MAX_NUMBER_DIGITS, SEARCH_DAYS, DIALECT, ALIASES,
} = Engine;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE_PATH = path.join(HERE, "..", "..", "assets", "js", "tools", "cron-explainer", "cron-engine.js");
const GOLD = JSON.parse(fs.readFileSync(path.join(HERE, "..", "fixtures", "cron-golden.json"), "utf8"));

const NOW = Date.UTC(2026, 9, 12, 10, 0, 30); // Mon 12 Oct 2026, 10:00:30 UTC
const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");
const err = (text) => {
  const r = parseCron(text);
  assert.equal(r.state, "invalid", `expected ${JSON.stringify(text)} to be refused`);
  return r.error;
};
const ok = (text) => {
  const r = parseCron(text);
  assert.equal(r.state, "valid", `expected ${JSON.stringify(text)} to be accepted: ${r.error && r.error.message}`);
  return r;
};

/* ------------------------------------------------------------------------------------------------------------
   The golden checks, written as a function of the engine so the mutation tests can run them on a broken copy.
------------------------------------------------------------------------------------------------------------ */

const V1_KEYS = new Set([
  "input-too-long", "bad-character", "alias-extra", "alias-case", "alias-unknown", "alias-reboot",
  "too-few-fields", "too-many-fields", "field-too-long", "list-too-many", "number-too-long", "reversed-range", "tilde",
]);

function goldenFailures(E) {
  const bad = [];
  const note = (what) => { if (bad.length < 25) bad.push(what); };
  try {
    for (const t of GOLD.truthTable) {
      const p = E.parseCron(t.expr);
      const days = [];
      for (let d = 1; d <= 31; d += 1) if (E.matchesDate(p, 2026, 3, d)) days.push(d);
      if (JSON.stringify(days) !== JSON.stringify(t.days)) note(`truth table ${t.expr}`);
    }
    for (const v of GOLD.parse) {
      const r = E.parseCron(v.input);
      if (v.v1 === "ok") {
        if (r.state !== "valid") { note(`should accept ${JSON.stringify(v.input).slice(0, 60)}`); continue; }
        if (JSON.stringify(r.fields.map((f) => f.values)) !== JSON.stringify(v.values)) note(`values ${v.input}`);
        if (r.flags.domStar !== v.domStar || r.flags.dowStar !== v.dowStar) note(`flags ${v.input}`);
      } else if (v.v1Reason === "empty") {
        if (r.state !== "empty") note(`should be empty ${JSON.stringify(v.input).slice(0, 30)}`);
      } else {
        if (r.state !== "invalid") { note(`should refuse ${JSON.stringify(v.input).slice(0, 60)}`); continue; }
        if (V1_KEYS.has(v.v1Reason) && r.error.key !== v.v1Reason) note(`key ${v.input.slice(0, 40)} ${r.error.key}`);
      }
    }
    for (const n of GOLD.nextRuns) {
      const p = E.parseCron(n.expr);
      const res = E.nextRuns(p, n.nowMs, 5);
      if (JSON.stringify(res.runs.map((x) => x.ms)) !== JSON.stringify(n.runsMs)) note(`runs ${n.expr} @${n.nowMs}`);
      if (res.never !== n.never) note(`never ${n.expr}`);
      if (res.startMs !== n.startMs) note(`start ${n.expr} @${n.nowMs}`);
    }
  } catch (e) {
    note(`threw: ${e && e.message}`);
  }
  return bad;
}

/* ------------------------------------------------------------------------------------------------------------ */

describe("source safety and shape", () => {
  const raw = fs.readFileSync(ENGINE_PATH, "utf8");
  const code = raw.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");

  test("the engine is pure: no eval, no Function, no Date, no network, no storage, no DOM, no dynamic import", () => {
    assert.ok(!/\bDate\b/.test(code), "engine code must not use Date");
    for (const banned of ["eval(", "new Function", "Function(", "fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket",
      "localStorage", "sessionStorage", "indexedDB", "document.", "window.", "navigator.", "import(", "require(", "setTimeout", "setInterval",
      "Worker", "console.", "process.", "Math.random"]) {
      assert.ok(!code.includes(banned), `engine code must not contain ${banned}`);
    }
    assert.ok(!/^import\s/m.test(code), "the engine imports nothing");
  });

  test("no regular expression is used (no nested quantifiers are possible) and no unbounded while(true)", () => {
    assert.ok(!code.includes("RegExp"));
    assert.ok(!/[=(,:!&|?]\s*\/[^/*\s]/.test(code), "no regular expression literal");
    assert.ok(!/while\s*\(\s*true\s*\)/.test(code));
    assert.ok(!/for\s*\(\s*;\s*;\s*\)/.test(code));
  });

  test("it never touches the Date global (a throwing stand-in is installed while it runs)", () => {
    const RealDate = globalThis.Date;
    globalThis.Date = new Proxy(RealDate, { construct() { throw new Error("Date used"); }, get(t, k) { if (k === "now" || k === "UTC") throw new Error("Date used"); return t[k]; }, apply() { throw new Error("Date used"); } });
    try {
      const out = explainCron("*/15 9-17 * * mon-fri", { nowMs: NOW });
      assert.equal(out.state, "explained");
      assert.equal(out.nextRuns.runs.length, 5);
      assert.equal(nextRuns(parseCron("0 0 29 2 *"), NOW).runs.length, 5);
    } finally {
      globalThis.Date = RealDate;
    }
  });

  test("constants are the approved limits", () => {
    assert.equal(MAX_INPUT_CHARS, 256);
    assert.equal(MAX_FIELD_CHARS, 64);
    assert.equal(MAX_LIST_ITEMS, 32);
    assert.equal(MAX_NUMBER_DIGITS, 3);
    assert.equal(SEARCH_DAYS, 146097);
    assert.equal(DIALECT, "Cronie crontab syntax, five time fields");
  });
});

describe("the golden file and its provenance", () => {
  test("it records the cronie revision it was written from, and does not claim a binary was run", () => {
    assert.match(GOLD.meta.cronieRevision, /^[0-9a-f]{40}$/);
    assert.equal(GOLD.meta.binaryVerified, false);
    assert.match(GOLD.meta.binaryNote, /No cronie binary/);
    for (const f of ["src/entry.c", "src/cron.c", "src/macros.h", "man/crontab.5"]) {
      assert.match(GOLD.meta.sourceFilesSha256[f], /^[0-9a-f]{64}$/);
    }
  });

  test("the reference is large enough to mean something", () => {
    const valid = GOLD.parse.filter((v) => v.v1 === "ok").length;
    const invalid = GOLD.parse.filter((v) => v.v1 === "no").length;
    assert.ok(valid >= 140, `valid vectors: ${valid}`);
    assert.ok(invalid >= 100, `invalid vectors: ${invalid}`);
    assert.ok(GOLD.parse.filter((v) => v.acceptedByCronieRefusedByV1).length >= 20, "cases cronie accepts but V1 refuses are labelled");
    assert.ok(GOLD.nextRuns.length >= 400);
    assert.ok(GOLD.nextRuns.filter((n) => n.never).length >= 5);
    assert.ok(GOLD.civil.length >= 500);
    assert.ok(GOLD.summary.length >= 60);
    assert.equal(GOLD.sweepMinute.count, 66429);
    assert.equal(GOLD.sweepDow.count, 111110);
  });

  test("the whole golden set passes against the engine", () => {
    assert.deepEqual(goldenFailures(Engine), []);
  });
});

describe("calendar: integer civil-date routines against Python's datetime", () => {
  test("the 400-year cycle is exactly 146,097 days, 20,871 whole weeks", () => {
    assert.equal(GOLD.cycle.days, 146097);
    assert.equal(GOLD.cycle.weeks, 20871);
    assert.equal(GOLD.cycle.weeksExact, true);
    assert.equal(GOLD.cycle.weekdayStart, GOLD.cycle.weekdayEnd);
    assert.equal(daysFromCivil(2400, 1, 1) - daysFromCivil(2000, 1, 1), SEARCH_DAYS);
    assert.equal(SEARCH_DAYS % 7, 0);
  });

  test("days, civil date and weekday agree with the reference for every sampled day", () => {
    for (const [z, y, m, d, wd] of GOLD.civil) {
      assert.deepEqual(civilFromDays(z), { year: y, month: m, day: d }, `civilFromDays(${z})`);
      assert.equal(daysFromCivil(y, m, d), z, `daysFromCivil(${y}-${m}-${d})`);
      assert.equal(weekdayFromDays(z), wd, `weekday of day ${z}`);
    }
  });

  test("leap years: 2000 and 2400 yes; 1900, 2100 no; 2096, 2104 yes", () => {
    assert.deepEqual([1900, 2000, 2024, 2025, 2096, 2100, 2104, 2400].map(isLeapYear), [false, true, true, false, true, false, true, true]);
    assert.equal(daysInMonth(2100, 2), 28);
    assert.equal(daysInMonth(2104, 2), 29);
    assert.deepEqual([1, 3, 4, 12].map((m) => daysInMonth(2026, m)), [31, 31, 30, 31]);
  });

  test("round trip over a wide range, including negative day counts", () => {
    for (let z = -800000; z <= 800000; z += 997) {
      const c = civilFromDays(z);
      assert.equal(daysFromCivil(c.year, c.month, c.day), z);
    }
    assert.deepEqual(civilFromDays(0), { year: 1970, month: 1, day: 1 });
    assert.equal(weekdayFromDays(0), 4); // Thursday
  });
});

describe("the day-of-month / day-of-week rule", () => {
  test("the truth table of the specification, executed (March 2026: 1 March is a Sunday)", () => {
    assert.equal(GOLD.truthTable.length, 12);
    for (const t of GOLD.truthTable) {
      const p = ok(t.expr);
      const days = [];
      for (let d = 1; d <= 31; d += 1) if (matchesDate(p, 2026, 3, d)) days.push(d);
      assert.deepEqual(days, t.days, t.expr);
      /* the same days through the next-run search: runs at 00:00, starting just before March */
      const start = Date.UTC(2026, 1, 28, 23, 59, 30);
      const res = nextRuns(p, start, 200);
      const march = res.runs.filter((r) => r.year === 2026 && r.month === 3).map((r) => r.day);
      assert.deepEqual(march, t.days, `${t.expr} through nextRuns`);
    }
  });

  test("documented expectations typed from the manual page and the cron.c comment, independent of the fixture", () => {
    /* the manual: "30 4 1,15 * 5" runs on the 1st, the 15th and every Friday (2026-03: Fridays 6, 13, 20, 27) */
    const days = [];
    const p = ok("30 4 1,15 * 5");
    for (let d = 1; d <= 31; d += 1) if (matchesDate(p, 2026, 3, d)) days.push(d);
    assert.deepEqual(days, [1, 6, 13, 15, 20, 27]);
    /* the cron.c comment: * * 1,15 * Sun -> the 1st and 15th AND every Sunday (OR); * * * * Sun -> only Sundays; * * 1,15 * * -> only the 1st and 15th */
    const sundays = [1, 8, 15, 22, 29];
    const collect = (expr) => { const q = ok(expr); const out = []; for (let d = 1; d <= 31; d += 1) if (matchesDate(q, 2026, 3, d)) out.push(d); return out; };
    assert.deepEqual(collect("* * 1,15 * Sun"), [1, 8, 15, 22, 29]);
    assert.deepEqual(collect("* * * * Sun"), sundays);
    assert.deepEqual(collect("* * 1,15 * *"), [1, 15]);
    // star-slash-23 hours is 0 and 23; star-slash-35 minutes is 0 and 35; 0-23/2; 8-11; jan-mar; mon,wed,fri
    assert.deepEqual(ok("0 */23 * * *").fields[1].values, [0, 23]);
    assert.deepEqual(ok("*/35 * * * *").fields[0].values, [0, 35]);
    assert.deepEqual(ok("0 0-23/2 * * *").fields[1].values, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
    assert.deepEqual(ok("0 8-11 * * *").fields[1].values, [8, 9, 10, 11]);
    assert.deepEqual(ok("0 0 * jan-mar *").fields[3].values, [1, 2, 3]);
    assert.deepEqual(ok("0 0 * * mon,wed,fri").fields[4].values, [1, 3, 5]);
  });

  test("the star status comes from the TEXT of the field, never from its values", () => {
    const flags = (e) => { const r = ok(e); return [r.fields[2].startsWithStar, r.fields[4].startsWithStar]; };
    assert.deepEqual(flags("0 0 * * 1"), [true, false]);
    assert.deepEqual(flags("0 0 */2 * 1"), [true, false]);
    assert.deepEqual(flags("0 0 *,3 * 1"), [true, false]);
    assert.deepEqual(flags("0 0 1-31 * 1"), [false, false]);
    assert.deepEqual(flags("0 0 1,* * 1"), [false, false]);
    assert.deepEqual(flags("0 0 1 * 0-7"), [false, false]);
    assert.deepEqual(flags("0 0 1 * */7"), [false, true]);
    assert.deepEqual(flags("0 0 1 * *"), [false, true]);
    /* equal value sets, different flags */
    const a = ok("0 0 */1 * 1");
    const b = ok("0 0 1-31 * 1");
    assert.deepEqual(a.fields[2].values, b.fields[2].values);
    assert.notEqual(a.fields[2].startsWithStar, b.fields[2].startsWithStar);
    const c = ok("0 0 1,* * 1");
    const d = ok("0 0 *,1 * 1");
    assert.deepEqual(c.fields[2].values, d.fields[2].values);
    assert.notEqual(c.fields[2].startsWithStar, d.fields[2].startsWithStar);
    assert.equal(matchesDate(c, 2026, 3, 3), true); // OR with every day
    assert.equal(matchesDate(d, 2026, 3, 3), false); // AND with Mondays
  });

  test("the minute, hour and month fields never change the day rule", () => {
    const base = ok("0 0 1,15 * 5");
    const other = ok("*/5 */2 1,15 6 5");
    for (let d = 1; d <= 30; d += 1) assert.equal(matchesDate(base, 2026, 6, d), matchesDate(other, 2026, 6, d));
    assert.equal(matchesDate(other, 2026, 3, 1), false, "month 3 is not selected");
  });

  test("the day pairs sweep: every accepted pair of day fields, a leap and a non-leap year (digest)", () => {
    const hash = crypto.createHash("sha256");
    let pairs = 0;
    let total = 0;
    for (const dom of GOLD.dayPairs.domTexts) {
      for (const dow of GOLD.dayPairs.dowTexts) {
        const p = parseCron(`0 0 ${dom} * ${dow}`);
        if (p.state !== "valid") continue;
        pairs += 1;
        for (const year of GOLD.dayPairs.years) {
          const first = daysFromCivil(year, 1, 1);
          const days = [];
          for (let m = 1; m <= 12; m += 1) {
            for (let d = 1; d <= daysInMonth(year, m); d += 1) {
              if (matchesDate(p, year, m, d)) days.push(daysFromCivil(year, m, d) - first + 1);
            }
          }
          total += days.length;
          hash.update(`${dom}|${dow}|${year}|${days.join(",")}\n`);
        }
      }
    }
    assert.equal(pairs, GOLD.dayPairs.pairs);
    assert.equal(total, GOLD.dayPairs.totalMatchingDays);
    assert.equal(hash.digest("hex"), GOLD.dayPairs.sha256);
  });
});

describe("parsing: what is accepted", () => {
  test("every accepted vector gives the reference value sets and star flags", () => {
    let n = 0;
    for (const v of GOLD.parse.filter((x) => x.v1 === "ok")) {
      const r = ok(v.input);
      assert.deepEqual(r.fields.map((f) => f.values), v.values, JSON.stringify(v.input));
      assert.equal(r.flags.domStar, v.domStar, v.input);
      assert.equal(r.flags.dowStar, v.dowStar, v.input);
      if (v.alias) assert.equal(r.alias.name, v.alias);
      n += 1;
    }
    assert.ok(n >= 140);
  });

  test("0 and 7 are both Sunday, and a range through 7 includes Sunday", () => {
    for (const e of ["0", "7", "sun", "SUN", "0,7", "7,0", "sun,7"]) {
      assert.deepEqual(ok(`0 0 * * ${e}`).fields[4].values, [0, 7], e);
    }
    assert.deepEqual(ok("0 0 * * 5-7").fields[4].values, [5, 6, 7, 0].sort((a, b) => a - b).filter((x, i, arr) => arr.indexOf(x) === i));
    assert.deepEqual(ok("0 0 * * 5-7").fields[4].values, [0, 5, 6, 7]);
    assert.deepEqual(ok("0 0 * * 1-7").fields[4].values, [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(ok("0 0 * * 1-6").fields[4].values, [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(ok("0 0 * * */7").fields[4].values, [0, 7]);
    assert.deepEqual(ok("0 0 * * */2").fields[4].values, [0, 2, 4, 6, 7]);
  });

  test("steps stay inside their field: */35 is minutes 0 and 35 in every hour", () => {
    assert.deepEqual(ok("*/35 * * * *").fields[0].values, [0, 35]);
    assert.deepEqual(ok("0 */12 * * *").fields[1].values, [0, 12]);
    assert.deepEqual(ok("0 0 */10 * *").fields[2].values, [1, 11, 21, 31]);
    assert.deepEqual(ok("0 0 * */5 *").fields[3].values, [1, 6, 11]);
    assert.deepEqual(ok("10-20/5 * * * *").fields[0].values, [10, 15, 20]);
    assert.deepEqual(ok("0 0 * * mon-fri/2").fields[4].values, [1, 3, 5]);
  });

  test("a step larger than the range is accepted, only the first value matches, and a warning is kept", () => {
    const r = ok("*/60 * * * *");
    assert.deepEqual(r.fields[0].values, [0]);
    assert.equal(r.fields[0].warnings.length, 1);
    assert.equal(r.fields[0].warnings[0].key, "step-larger");
    assert.deepEqual(ok("5-5/2 * * * *").fields[0].values, [5]);
    assert.equal(ok("*/59 * * * *").fields[0].warnings.length, 0);
    assert.equal(ok("*/1 * * * *").fields[0].warnings.length, 0);
  });

  test("names are three letters, any case, in the month and day-of-week fields only; leading zeros read as decimal", () => {
    assert.deepEqual(ok("0 0 * Jan,DEC *").fields[3].values, [1, 12]);
    assert.deepEqual(ok("0 0 * * MoN-fRi").fields[4].values, [1, 2, 3, 4, 5]);
    assert.deepEqual(ok("007 000 001 001 *").fields.slice(0, 4).map((f) => f.values), [[7], [0], [1], [1]]);
  });

  test("whitespace: runs of spaces and tabs separate fields; the ends are trimmed; the normalised text keeps names as typed", () => {
    const r = ok("  0 \t 0   *  * \t MON-fri\t");
    assert.equal(r.normalized, "0 0 * * MON-fri");
    assert.equal(r.input, "0 \t 0   *  * \t MON-fri");
    assert.equal(ok("0 0 * * *").normalized, "0 0 * * *");
  });

  test("duplicates are merged and recorded", () => {
    const r = ok("1,1,2 * * * *");
    assert.deepEqual(r.fields[0].values, [1, 2]);
    assert.deepEqual(r.fields[0].duplicates, [{ value: 1, count: 2 }]);
    assert.deepEqual(ok("1-5,3 * * * *").fields[0].duplicates, [{ value: 3, count: 2 }]);
  });

  test("the dialect is named, and the intermediate result carries text, items, values and flags", () => {
    const r = ok("*/15 9-17 1,15 jan-mar mon");
    assert.equal(r.dialect, "Cronie crontab syntax, five time fields");
    assert.equal(r.alias, null);
    assert.deepEqual(r.fields.map((f) => f.text), ["*/15", "9-17", "1,15", "jan-mar", "mon"]);
    assert.deepEqual(r.fields[0].items, [{ kind: "star", text: "*/15", from: 0, to: 59, step: 15 }]);
    assert.deepEqual(r.fields[2].items.map((i) => [i.kind, i.from]), [["number", 1], ["number", 15]]);
    assert.deepEqual(r.fields.map((f) => f.key), ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"]);
  });
});

describe("parsing: what is refused, and what each message says", () => {
  test("every refused vector is refused, with the reference's reason for the tool's own restrictions", () => {
    for (const v of GOLD.parse.filter((x) => x.v1 === "no")) {
      const r = parseCron(v.input);
      if (v.v1Reason === "empty") { assert.equal(r.state, "empty"); continue; }
      assert.equal(r.state, "invalid", JSON.stringify(v.input).slice(0, 80));
      assert.ok(typeof r.error.message === "string" && r.error.message.length > 0);
      if (V1_KEYS.has(v.v1Reason)) assert.equal(r.error.key, v.v1Reason, JSON.stringify(v.input).slice(0, 80));
      if (v.field && r.error.field) assert.equal(r.error.field, v.field, `${JSON.stringify(v.input).slice(0, 80)} (${r.error.key})`);
    }
  });

  test("things cronie accepts that V1 deliberately refuses are labelled and refused", () => {
    const labelled = GOLD.parse.filter((v) => v.acceptedByCronieRefusedByV1);
    const reasons = new Set(labelled.map((v) => v.acceptedByCronieRefusedByV1));
    /* "list-too-many" cannot be reached on its own: 33 items need at least 65 characters, and a field is limited to 64 */
    for (const need of ["reversed-range", "tilde", "alias-reboot", "too-many-fields", "number-too-long", "input-too-long", "field-too-long"]) {
      assert.ok(reasons.has(need), `fixture covers ${need}`);
    }
    for (const v of labelled) assert.equal(parseCron(v.input).state, "invalid", v.input.slice(0, 60));
  });

  test("single-value steps (0/35) are a syntax error, and the message names the other schedulers fairly", () => {
    for (const e of ["0/35 * * * *", "5/10 * * * *", "0 0/2 * * *", "0 0 1/2 * *", "0 0 * 1/2 *", "0 0 * * 1/2", "0 0 * * mon/2"]) {
      const x = err(e);
      assert.equal(x.key, "step-after-number", e);
      assert.ok(x.message.includes("a step must follow `*` or a range, such as `0-59/35`"));
      assert.ok(x.message.includes("GitHub Actions") && x.message.includes("Quartz") && x.message.includes("AWS"));
      assert.ok(!/Spring/.test(x.message));
    }
    assert.deepEqual(ok("0-59/35 * * * *").fields[0].values, [0, 35]);
    assert.deepEqual(ok("*/35 * * * *").fields[0].values, [0, 35]);
  });

  test("reversed ranges are refused in every field, including n-0", () => {
    for (const e of ["5-3 * * * *", "5-0 * * * *", "23-0 * * * *", "0 5-0 * * *", "0 0 5-1 * *", "0 0 * 12-1 *", "0 0 * * 5-0", "0 0 * * fri-sun", "5-3/2 * * * *"]) {
      const x = err(e);
      assert.equal(x.key, "reversed-range", e);
      assert.ok(x.message.includes("runs backwards. In crontab the first number must be at most the second."));
    }
  });

  test("? L W # LW ~ H and the Quartz/AWS forms are refused with their own messages (section 9)", () => {
    for (const e of ["? * * * *", "0 0 ? * *", "0 0 * * ?"]) {
      const x = err(e);
      assert.equal(x.key, "question-mark");
      assert.ok(x.message.includes("`?` is not valid in cronie crontab syntax") && x.message.includes("use `*`"));
    }
    for (const e of ["0 0 L * *", "0 0 15W * *", "0 0 * * 5L", "0 0 * * 5#2", "0 0 LW * *", "0 0 1,L * *"]) {
      const x = err(e);
      assert.equal(x.key, "lw-extension", e);
      assert.ok(x.message.includes("Quartz and AWS cron extensions and are not valid in cronie crontab syntax"));
    }
    for (const e of ["~ * * * *", "1~5 * * * *"]) {
      const x = err(e);
      assert.equal(x.key, "tilde");
      assert.ok(x.message.includes("picks a random value when cronie reads the file, so it is not a fixed schedule"));
    }
    for (const e of ["H * * * *", "H/15 * * * *"]) {
      const x = err(e);
      assert.equal(x.key, "hash-h");
      assert.ok(x.message.includes("`H` is not valid in cronie crontab syntax"));
      assert.ok(!/Jenkins/.test(x.message));
    }
  });

  test("field counts: fewer, and more (a sixth field is the command in a crontab)", () => {
    for (let n = 1; n <= 4; n += 1) {
      const x = err(Array(n).fill("*").join(" "));
      assert.equal(x.key, "too-few-fields");
      assert.equal(x.message, `A crontab time needs five fields (minute, hour, day of month, month, day of week); this has ${n}.`);
    }
    for (const e of ["* * * * * *", "* * * * * * *", "0 0 * * * /usr/bin/job"]) {
      const x = err(e);
      assert.equal(x.key, "too-many-fields");
      assert.ok(x.message.startsWith("In a crontab file a sixth field is the command, so this tool explains only the five time fields."));
      assert.ok(x.message.includes("Quartz or AWS syntax (six or seven fields), it is not supported here"));
      assert.ok(!/Spring/.test(x.message));
    }
  });

  test("out-of-range values name the value, the range and the field", () => {
    assert.equal(err("60 * * * *").message, "Field 1 (minute): 60 is outside 0 to 59 for the minute field.");
    assert.equal(err("* 24 * * *").message, "Field 2 (hour): 24 is outside 0 to 23 for the hour field.");
    assert.equal(err("* * 0 * *").message, "Field 3 (day of month): 0 is outside 1 to 31 for the day of month field.");
    assert.equal(err("* * * 13 *").message, "Field 4 (month): 13 is outside 1 to 12 for the month field.");
    assert.equal(err("* * * * 8").message, "Field 5 (day of week): 8 is outside 0 to 7 for the day of week field.");
  });

  test("a zero step, and malformed ranges and steps, each have a message that names the field and the text", () => {
    assert.equal(err("* * */0 * *").message, "Field 3 (day of month): `*/0` has a step of 0; a step must be at least 1.");
    assert.equal(err("0-59/0 * * * *").key, "step-zero");
    assert.equal(err("*-5 * * * *").key, "star-range");
    assert.equal(err("1-5-7 * * * *").key, "range-chain");
    assert.equal(err("*/5/2 * * * *").key, "step-trailing");
    assert.equal(err("*/ * * * *").key, "step-missing");
    assert.equal(err("1- * * * *").key, "range-missing-end");
    assert.equal(err("*/a * * * *").key, "bad-step");
    assert.equal(err("1,,2 * * * *").key, "empty-item");
    assert.equal(err("1, * * * *").key, "empty-item", "a trailing comma is an empty item, not a separator");
    assert.equal(err("1, * * * * *").key, "too-many-fields");
    assert.equal(err(",1 * * * *").key, "empty-item");
    assert.equal(err("-5 * * * *").key, "bad-char");
    assert.equal(err("a * * * *").key, "bad-token");
    assert.equal(err("1a * * * *").key, "bad-token");
  });

  test("names: full names, wrong fields and unknown names", () => {
    const m = err("0 0 * * monday");
    assert.equal(m.key, "name-full");
    assert.ok(m.message.includes("`monday` is not valid: use `mon`"));
    assert.equal(err("0 0 * january *").key, "name-full");
    assert.equal(err("0 0 * * mo").key, "name-invalid");
    assert.equal(err("jan * * * *").key, "name-wrong-field");
    assert.equal(err("0 0 * mon *").key, "name-invalid");
    assert.equal(err("0 0 * * jan").key, "name-invalid");
  });

  test("aliases: only the seven lowercase aliases; @reboot and the rest are refused", () => {
    assert.equal(err("@reboot").key, "alias-reboot");
    assert.ok(err("@reboot").message.includes("runs once at start-up, so there is no schedule to explain"));
    for (const e of ["@DAILY", "@Daily", "@REBOOT", "@Yearly"]) {
      const x = err(e);
      assert.equal(x.key, "alias-case", e);
      assert.ok(x.message.includes("aliases are lowercase"));
    }
    for (const e of ["@weekday", "@", "@every5m"]) assert.equal(err(e).key, "alias-unknown", e);
    for (const e of ["@daily extra", "@ daily", "@daily 0 0 * * *"]) assert.equal(err(e).key, "alias-extra", e);
  });

  test("non-ASCII, other whitespace, control and invisible characters are refused with the character and the position", () => {
    const cases = [["1 2 3 4 5", 2, "00A0"], ["١ * * * *", 1, "0661"], ["0 0 * * *​", 10, "200B"], ["0 0 * * *\n", 10, "000A"], ["0\u000b0 * * *", 2, "000B"], ["0 0 * * *\0", 10, "0000"]];
    for (const [text, position, hex] of cases) {
      const x = err(text);
      assert.equal(x.key, "bad-character");
      assert.equal(x.position, position, text);
      assert.ok(x.message.includes(`U+${hex}`), x.message);
    }
    const lead = err("   é * * * *");
    assert.equal(lead.position, 4, "positions count from the start of the text as typed, leading blanks included");
  });

  test("errors name the position of the offending text in the text as typed", () => {
    assert.equal(err("0 0 * * 99").position, 9);
    assert.equal(err("  60 * * * *").position, 3);
    assert.equal(err("0 0 5-3 * *").position, 5);
    assert.equal(err("0 0 1,2,77 * *").position, 9);
  });

  test("only the first error (left to right) is reported", () => {
    const x = err("99 99 99 99 99");
    assert.equal(x.field, 1);
    assert.equal(x.key, "out-of-range");
  });

  test("the empty and blank input is its own state, not an error", () => {
    assert.deepEqual(parseCron(""), { state: "empty" });
    assert.deepEqual(parseCron("   \t "), { state: "empty" });
    assert.throws(() => parseCron(null), TypeError);
  });

  test("no message calls an expression wrong for another scheduler, and none mentions Spring", () => {
    const text = GOLD.parse.filter((v) => v.v1 === "no").map((v) => parseCron(v.input)).filter((r) => r.state === "invalid").map((r) => r.error.message).join("\n");
    assert.ok(!/Spring/.test(text));
    assert.ok(!/\bwrong\b/i.test(text));
  });
});

describe("the safety limits", () => {
  const long = (n) => "0" + " ".repeat(n - 8) + "0 * * *";

  test("256 characters after trimming are accepted; 257 are not; blanks around the text do not count", () => {
    assert.equal(parseCron(long(255)).state, "valid");
    assert.equal(parseCron(long(256)).state, "valid");
    const x = err(long(257));
    assert.equal(x.key, "input-too-long");
    assert.equal(x.limit, 256);
    assert.ok(/limit of this tool, not of cron/.test(x.message));
    assert.equal(parseCron(`${" ".repeat(500)}0 0 * * *${"\t".repeat(500)}`).state, "valid");
  });

  test("64 characters per field and 32 items per list", () => {
    assert.equal(parseCron("007 * * * *").state, "valid");
    assert.equal(parseCron(`${Array(32).fill("1").join(",")} * * * *`).state, "valid", "32 items are 63 characters");
    assert.equal(err("1".repeat(65) + " * * * *").key, "field-too-long");
    assert.equal(err("1".repeat(65) + " * * * *").limit, 64);
    assert.equal(err("0-".repeat(40) + "0 * * * *").key, "field-too-long");
    /* 33 items need 65 characters, so the 64-character limit always speaks first: the 32-item limit is never the one reported */
    const x = err(`${Array(33).fill("1").join(",")} * * * *`);
    assert.equal(x.key, "field-too-long");
    assert.equal(x.limit, 64);
    assert.ok(/limit of this tool, not of cron/.test(x.message));
  });

  test("numbers have at most 3 characters: 007 is read as 7, 0007 is refused", () => {
    assert.deepEqual(ok("007 * * * *").fields[0].values, [7]);
    const x = err("0007 * * * *");
    assert.equal(x.key, "number-too-long");
    assert.equal(x.limit, 3);
    assert.ok(/at most 3 digits here/.test(x.message) && /limit of this tool, not of cron/.test(x.message));
    assert.equal(err("*/1000 * * * *").key, "number-too-long");
    assert.equal(err("1".repeat(1000) + " * * * *").key, "input-too-long");
    assert.equal(err("1".repeat(60) + " * * * *").key, "number-too-long");
  });

  test("hostile input is refused quickly and nothing is evaluated", () => {
    const started = process.hrtime.bigint();
    const samples = ["x".repeat(10000), "*/".repeat(5000), ",".repeat(20000), "1-".repeat(5000), "\u0000".repeat(300), "<script>alert(1)</script> * * * *",
      "0 0 * * *; rm -rf /", "$(reboot) * * * *", "`x` * * * *", "1".repeat(100000), "@" + "a".repeat(5000)];
    for (const s of samples) {
      const r = parseCron(s);
      assert.equal(r.state, "invalid", s.slice(0, 20));
    }
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    assert.ok(ms < 1500, `hostile input took ${ms} ms`);
  });
});

describe("aliases", () => {
  const EXPANSIONS = { "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *", "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0", "@daily": "0 0 * * *", "@midnight": "0 0 * * *", "@hourly": "0 * * * *" };

  test("each alias shows the expansion of the manual and equals it", () => {
    for (const [alias, expansion] of Object.entries(EXPANSIONS)) {
      const a = ok(alias);
      assert.equal(a.alias.name, alias);
      assert.equal(a.alias.expansion, expansion);
      assert.equal(a.expansion, expansion);
      assert.equal(a.normalized, alias);
      const b = ok(expansion);
      assert.deepEqual(a.fields.map((f) => f.values), b.fields.map((f) => f.values), alias);
      /* identical behaviour: the same next runs, because the flags differ only where every day matches anyway */
      assert.deepEqual(nextRuns(a, NOW, 12).runs.map((r) => r.ms), nextRuns(b, NOW, 12).runs.map((r) => r.ms), alias);
    }
    assert.deepEqual(Object.keys(ALIASES).sort(), ["annually", "daily", "hourly", "midnight", "monthly", "weekly", "yearly"]);
  });

  test("the star flags are cronie's: yearly and monthly set the day-of-week flag, weekly the day-of-month flag, daily and hourly neither", () => {
    const f = (a) => ok(a).flags;
    assert.deepEqual(f("@yearly"), { domStar: false, dowStar: true });
    assert.deepEqual(f("@annually"), { domStar: false, dowStar: true });
    assert.deepEqual(f("@monthly"), { domStar: false, dowStar: true });
    assert.deepEqual(f("@weekly"), { domStar: true, dowStar: false });
    assert.deepEqual(f("@daily"), { domStar: false, dowStar: false });
    assert.deepEqual(f("@midnight"), { domStar: false, dowStar: false });
    assert.deepEqual(f("@hourly"), { domStar: false, dowStar: false });
  });

  test("@midnight is accepted with the documented note; the others do not carry it", () => {
    const m = explainCron("@midnight", { nowMs: NOW });
    assert.equal(m.state, "explained");
    assert.ok(m.notes.some((n) => n.key === "midnight" && n.text === "`@midnight` is listed by Kubernetes and accepted by cronie, but is not in the cronie manual page."));
    assert.ok(!explainCron("@daily", { nowMs: NOW }).notes.some((n) => n.key === "midnight"));
    assert.ok(explainCron("@daily", { nowMs: NOW }).notes.some((n) => n.key === "alias" && n.text === "`@daily` is the same as `0 0 * * *`."));
  });
});

describe("next runs: UTC, strictly after now, one 400-year cycle, exact 'never'", () => {
  test("every reference vector: the five runs (and 'never') match the brute-force scan", () => {
    for (const n of GOLD.nextRuns) {
      const res = nextRuns(parseCron(n.expr), n.nowMs, 5);
      assert.deepEqual(res.runs.map((r) => r.ms), n.runsMs, `${n.expr} @ ${n.nowMs}`);
      assert.deepEqual(res.runs.map((r) => r.text), n.runsText, `${n.expr} text @ ${n.nowMs}`);
      assert.equal(res.never, n.never, `${n.expr} never`);
      assert.equal(res.startMs, n.startMs);
    }
  });

  test("the first minute boundary STRICTLY after now: a run exactly at the current minute is excluded", () => {
    const at = (h, mi, s, ms) => Date.UTC(2026, 9, 12, h, mi, s, ms);
    const p = ok("0 10 * * *");
    assert.equal(nextRuns(p, at(10, 0, 0, 0), 1).runs[0].day, 13, "now exactly on the boundary: that boundary is excluded");
    assert.equal(nextRuns(p, at(9, 59, 59, 999), 1).runs[0].day, 12, "1 ms before the boundary: included");
    assert.equal(nextRuns(p, at(9, 59, 0, 0), 1).runs[0].hour, 10);
    assert.equal(nextRuns(ok("* * * * *"), at(10, 0, 0, 0), 1).runs[0].minute, 1);
    assert.equal(nextRuns(ok("* * * * *"), at(10, 0, 59, 999), 1).runs[0].minute, 1);
    assert.equal(nextRuns(ok("* * * * *"), at(10, 0, 0, 1), 1).runs[0].minute, 1);
    assert.equal(nextRuns(ok("* * * * *"), at(10, 0, 0, 0), 1).startMs, at(10, 1, 0, 0));
  });

  test("leap years, including 2100 (not a leap year) and 2096 to 2104", () => {
    const text = (e, now) => nextRuns(ok(e), now, 5).runs.map((r) => `${r.year}-${r.month}-${r.day}`);
    assert.deepEqual(text("0 0 29 2 *", Date.UTC(2026, 0, 1)), ["2028-2-29", "2032-2-29", "2036-2-29", "2040-2-29", "2044-2-29"]);
    assert.deepEqual(text("0 0 29 2 *", Date.UTC(2096, 2, 1)), ["2104-2-29", "2108-2-29", "2112-2-29", "2116-2-29", "2120-2-29"]);
    assert.deepEqual(text("0 0 29 2 *", Date.UTC(2099, 0, 1)), ["2104-2-29", "2108-2-29", "2112-2-29", "2116-2-29", "2120-2-29"]);
    assert.deepEqual(text("0 0 * * *", Date.UTC(2100, 1, 27, 12)), ["2100-2-28", "2100-3-1", "2100-3-2", "2100-3-3", "2100-3-4"]);
    assert.deepEqual(text("0 0 * * *", Date.UTC(2028, 1, 28, 12)), ["2028-2-29", "2028-3-1", "2028-3-2", "2028-3-3", "2028-3-4"]);
    assert.deepEqual(text("0 0 * * *", Date.UTC(2027, 1, 27, 12)), ["2027-2-28", "2027-3-1", "2027-3-2", "2027-3-3", "2027-3-4"]);
  });

  test("impossible schedules are 'never', exactly, after searching the whole cycle", () => {
    for (const e of ["0 0 31 2 *", "0 0 30 2 *", "0 0 30,31 2 *", "0 0 31 4,6,9,11 *", "0 0 31 2,4,6,9,11 *"]) {
      const res = nextRuns(ok(e), NOW);
      assert.equal(res.never, true, e);
      assert.equal(res.runs.length, 0);
      assert.equal(res.searchedDays, SEARCH_DAYS, `${e} searched the whole cycle`);
      assert.equal(res.complete, false);
    }
    for (const e of ["0 0 29 2 *", "0 0 29 2 */7", "0 0 29 2 sun", "0 0 13 * 5", "0 0 31 * *"]) {
      const res = nextRuns(ok(e), NOW);
      assert.equal(res.never, false, e);
      assert.equal(res.runs.length, 5, e);
      assert.equal(res.complete, true);
    }
  });

  test("rare schedules still show five runs, however far ahead (Feb 29 that is a Sunday)", () => {
    const res = nextRuns(ok("0 0 29 2 */7"), Date.UTC(2026, 0, 1));
    assert.equal(res.runs.length, 5);
    for (const r of res.runs) {
      assert.equal(r.month, 2);
      assert.equal(r.day, 29);
      assert.equal(r.weekday, 0);
    }
    assert.ok(res.runs[4].year - 2026 > 56);
  });

  test("the text of a run: UTC, 24-hour, weekday, no zone choice", () => {
    const r = nextRuns(ok("30 9 * * *"), Date.UTC(2026, 9, 8, 12), 1).runs[0];
    assert.equal(r.text, "Fri 9 Oct 2026, 09:30 UTC");
    assert.equal(formatRun(r), "Fri 9 Oct 2026, 09:30 UTC");
    assert.equal(r.ms, Date.UTC(2026, 9, 9, 9, 30));
  });

  test("the count is honoured and the engine rejects a bad clock", () => {
    assert.equal(nextRuns(ok("* * * * *"), NOW, 3).runs.length, 3);
    assert.equal(nextRuns(ok("* * * * *"), NOW).runs.length, 5);
    for (const bad of [NaN, Infinity, "1", undefined, 9e15]) assert.throws(() => nextRuns(ok("* * * * *"), bad), RangeError);
    assert.throws(() => nextRuns({ state: "invalid" }, NOW), TypeError);
  });

  test("the search is bounded: the worst schedules finish at once", () => {
    const started = process.hrtime.bigint();
    for (let i = 0; i < 30; i += 1) {
      assert.equal(nextRuns(ok("0 0 31 2 *"), NOW + i).never, true);
      assert.equal(nextRuns(ok("59 23 31 12 *"), NOW + i).runs.length, 5);
      assert.equal(nextRuns(ok("0 0 29 2 */7"), NOW + i).runs.length, 5);
    }
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    assert.ok(ms < 3000, `90 worst-case searches took ${ms} ms`);
  });

  test("repeated execution gives identical results", () => {
    const a = JSON.stringify(explainCron("*/7 1-5 1,15 jan-mar mon", { nowMs: NOW }));
    for (let i = 0; i < 5; i += 1) assert.equal(JSON.stringify(explainCron("*/7 1-5 1,15 jan-mar mon", { nowMs: NOW })), a);
  });

  test("far dates keep exact civil arithmetic (year 2400 and 9999)", () => {
    const r = nextRuns(ok("0 0 29 2 *"), Date.UTC(2399, 11, 31), 2).runs;
    assert.deepEqual(r.map((x) => `${x.year}-${x.month}-${x.day}`), ["2400-2-29", "2404-2-29"]);
    const far = nextRuns(ok("0 0 1 1 *"), Date.UTC(9998, 11, 31, 12), 1).runs[0];
    assert.deepEqual([far.year, far.month, far.day, far.weekday], [9999, 1, 1, 5]);
  });
});

describe("explanation: field meanings, summaries and notes", () => {
  test("the field-by-field table: meaning and expanded values", () => {
    const x = explainCron("*/15 9-11 1,15 jan-mar mon,wed", { nowMs: NOW });
    assert.equal(x.state, "explained");
    const [mi, ho, dm, mo, dw] = x.fields;
    assert.equal(mi.meaning, "every 15th from 0 through 59: 0, 15, 30, 45");
    assert.equal(mi.valuesText, "0, 15, 30 and 45");
    assert.equal(ho.meaning, "9 through 11");
    assert.equal(ho.valuesText, "9, 10 and 11");
    assert.equal(dm.meaning, "1 and 15");
    assert.equal(mo.meaning, "January through March");
    assert.equal(dw.meaning, "Monday and Wednesday");
    assert.equal(explainCron("* * * * *", { nowMs: NOW }).fields[0].meaning, "every value");
    assert.equal(explainCron("0 0 * * 5-7", { nowMs: NOW }).fields[4].valuesText, "0, 5, 6 and 7");
    assert.equal(explainCron("0 0 * * *", { nowMs: NOW }).fields[1].valuesText, "0");
    assert.equal(explainCron("* * * * *", { nowMs: NOW }).fields[0].values.length, 60);
  });

  test("the summary sentences equal the specification's wording, and the structured form reproduces the reference's matching minutes", () => {
    const monthLens = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const timeMinutes = (t) => {
      switch (t.kind) {
        case "every-minute": return Array.from({ length: 1440 }, (_, i) => i);
        case "minute-of-hour": return Array.from({ length: 24 }, (_, h) => h * 60 + t.minute);
        case "every-minute-in-hour": return Array.from({ length: 60 }, (_, m) => t.hour * 60 + m);
        case "step-minutes": return Array.from({ length: 24 }, (_, h) => t.minutes.map((m) => h * 60 + m)).flat();
        default: return t.times.map((x) => x.hour * 60 + x.minute);
      }
    };
    const evaluate = (s) => {
      const out = [];
      let dayIdx = 0;
      for (let m = 1; m <= 12; m += 1) {
        for (let d = 1; d <= monthLens[m - 1]; d += 1) {
          const dow = (4 + dayIdx) % 7; // 2026-01-01 is a Thursday
          const monthOk = s.months.kind === "any" || s.months.months.includes(m);
          const domHit = s.dom.kind === "any" || s.dom.days.includes(d);
          const dowHit = s.dow.kind === "any" || s.dow.days.includes(dow);
          const dayHit = s.dayRule === "and" ? domHit && dowHit : domHit || dowHit;
          if (monthOk && dayHit) for (const mod of timeMinutes(s.time)) out.push(dayIdx * 1440 + mod);
          dayIdx += 1;
        }
      }
      return out;
    };
    let summarised = 0;
    for (const v of GOLD.summary) {
      const out = explainCron(v.expr, { nowMs: NOW });
      assert.equal(out.state, "explained", v.expr);
      if (v.sentence === null) {
        assert.equal(out.summary, null, `${v.expr} must not be summarised`);
        continue;
      }
      summarised += 1;
      assert.ok(out.summary, `${v.expr} must be summarised`);
      assert.equal(out.summary.sentence, v.sentence, v.expr);
      const minutes = evaluate(out.summary.structured);
      assert.equal(minutes.length, v.count, `${v.expr}: matching minutes`);
      assert.equal(sha256(minutes.join(",")), v.sha256, `${v.expr}: the structured form re-derives the reference's matching minutes`);
      assert.equal(renderSummary(out.summary.structured), v.sentence, "the sentence renders from the structured form alone");
    }
    assert.ok(summarised >= 45, `summarised vectors: ${summarised}`);
  });

  test("a day field that starts with * but has a step is never summarised; the rest of the table is explained field by field", () => {
    for (const e of ["0 0 */2 * 1", "0 0 1 * */2", "0 0 *,1 * 1", "0 0 1,* * 1"]) assert.equal(explainCron(e, { nowMs: NOW }).summary, null, e);
    assert.equal(summarize({ state: "invalid" }), null);
  });

  test("notes: only those that apply, with the specification's exact strings", () => {
    const keys = (e) => explainCron(e, { nowMs: NOW }).notes.map((n) => n.key);
    const text = (e, key) => explainCron(e, { nowMs: NOW }).notes.find((n) => n.key === key).text;
    assert.equal(text("0 0 1,15 * 5", "both-restricted"), "Day of month and day of week are both restricted, so the command runs when either one matches (not only when both do).");
    assert.equal(text("0 0 */2 * 1", "star-requires-both"), "A day field written with `*` (including `*/2`) makes cron require both day fields to match.");
    assert.equal(text("0 0 1-31 * 1", "full-range-dom"), "`1-31` selects every day but is not written with `*`, so cron treats the field as restricted.");
    assert.equal(text("0 0 1 * 0-7", "full-range-dow"), "`0-7` selects every day but is not written with `*`, so cron treats the field as restricted.");
    assert.equal(text("*/35 * * * *", "steps-restart"), "Steps restart in each field: `*/35` in minutes is minutes 0 and 35 of every hour, not every 35 minutes.");
    assert.equal(text("0 0 * * 7", "sunday"), "0 and 7 are both Sunday.");
    assert.equal(text("1,1,2 * * * *", "duplicate"), "`1,1,2` lists 1 twice.");
    assert.equal(text("0 0 31 2 *", "never-day"), "No month in this schedule has day 31, so it never runs.");
    assert.equal(text("0 0 29 2 *", "leap-only"), "Runs only in leap years.");
    assert.ok(text("*/60 * * * *", "step-larger").includes("the step is larger than the range, so only the first value matches"));

    assert.deepEqual(keys("0 0 * * *"), []);
    assert.deepEqual(keys("0 0 1,15 * 5"), ["both-restricted"]);
    assert.deepEqual(keys("0 0 * * 5"), ["star-requires-both"]);
    assert.deepEqual(keys("30 9 * * *"), []);
    assert.ok(!keys("0 0 1,15 * *").includes("both-restricted"));
    assert.ok(!keys("0 0 29 2,3 *").includes("leap-only"), "February is not the only month");
    assert.ok(!keys("0 0 28,29 2 *").includes("leap-only"), "day 28 exists every year");
    assert.ok(!keys("0 0 31 2 1").includes("never-day"), "with both day fields restricted a weekday can still add dates");
    assert.ok(!keys("0 0 31 1 *").includes("never-day"));
    assert.ok(keys("0 0 30 2 *").includes("never-day"));
    assert.equal(text("0 0 30,31 2 *", "never-day"), "No month in this schedule has day 30 or 31, so it never runs.");
    assert.ok(!keys("0 0 * * 1-5").includes("sunday"));
    assert.ok(!keys("0 0 * * */2").includes("sunday"), "a star step is not 'Sunday written'");
    assert.ok(keys("0 0 * * sun").includes("sunday"));
  });

  test("the result carries the assumptions, the dialect and the normalised text", () => {
    const x = explainCron("  30 4 * *  MON-fri ", { nowMs: NOW });
    assert.equal(x.dialect, DIALECT);
    assert.equal(x.normalized, "30 4 * * MON-fri");
    assert.ok(x.assumptions.some((a) => /UTC/.test(a)) && x.assumptions.some((a) => /device's clock/.test(a)));
    assert.ok(x.assumptions.some((a) => /daylight saving is not modelled/.test(a)));
    assert.equal(x.nextRuns.runs.length, 5);
    assert.equal(explainCron("", { nowMs: NOW }).state, "empty");
    assert.equal(explainCron("nope", { nowMs: NOW }).state, "invalid");
  });
});

describe("exhaustive sweeps: every string up to length 5 over a small alphabet (digests)", () => {
  const sweepDigest = (alphabet, maxLen, makeExpr, index) => {
    const hash = crypto.createHash("sha256");
    let total = 0;
    let okCount = 0;
    let frontier = [""];
    for (let length = 1; length <= maxLen; length += 1) {
      const next = [];
      for (const prefix of frontier) {
        for (const c of alphabet) {
          const s = prefix + c;
          next.push(s);
          const r = parseCron(makeExpr(s));
          const good = r.state === "valid";
          const values = good ? r.fields[index].values.join(",") : "";
          hash.update(`${s}\t${good ? "ok" : "no"}\t${values}\n`);
          total += 1;
          if (good) okCount += 1;
        }
      }
      frontier = next;
    }
    return { total, okCount, sha256: hash.digest("hex") };
  };

  test("a numeric field (minute): accepted or refused, and the value set", () => {
    const got = sweepDigest(GOLD.sweepMinute.alphabet, GOLD.sweepMinute.maxLen, (s) => `${s} * * * *`, 0);
    assert.equal(got.total, GOLD.sweepMinute.count);
    assert.equal(got.okCount, GOLD.sweepMinute.okCount);
    assert.equal(got.sha256, GOLD.sweepMinute.sha256);
  });

  test("the day-of-week field (names and the Sunday merge)", () => {
    const got = sweepDigest(GOLD.sweepDow.alphabet, GOLD.sweepDow.maxLen, (s) => `* * * * ${s}`, 4);
    assert.equal(got.total, GOLD.sweepDow.count);
    assert.equal(got.okCount, GOLD.sweepDow.okCount);
    assert.equal(got.sha256, GOLD.sweepDow.sha256);
  });
});

describe("mutation tests: a broken copy of the engine must fail the golden checks", () => {
  const source = fs.readFileSync(ENGINE_PATH, "utf8").replace(/\r\n/g, "\n");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cron-mutants-"));
  let counter = 0;

  const mutate = async (find, replacement) => {
    const parts = source.split(find);
    assert.equal(parts.length, 2, `the mutation target must occur exactly once: ${find.slice(0, 60)}`);
    const file = path.join(dir, `mutant-${counter += 1}.mjs`);
    fs.writeFileSync(file, parts.join(replacement));
    return import(`${pathToFileURL(file).href}?m=${counter}`);
  };

  test("control: the unmutated engine passes the same checks", () => {
    assert.deepEqual(goldenFailures(Engine), []);
  });

  const MUTANTS = [
    ["the AND branch of the day rule becomes OR", "t.and ? (t.dow[weekday] && t.dom[dom]) : (t.dow[weekday] || t.dom[dom])", "(t.dow[weekday] || t.dom[dom])"],
    ["the OR branch of the day rule becomes AND", "t.and ? (t.dow[weekday] && t.dom[dom]) : (t.dow[weekday] || t.dom[dom])", "(t.dow[weekday] && t.dom[dom])"],
    ["the day rule is chosen by the values, not by the text of the field", "and: parsed.flags.domStar || parsed.flags.dowStar", "and: parsed.fields[2].values.length === 31 || parsed.fields[4].values.length === 8"],
    ["startsWithStar is derived from the values, not from the text", "startsWithStar: text[0] === \"*\",", "startsWithStar: valueSet.size === (f.high - f.low + 1),"],
    ["the Sunday merge (0 and 7) is removed", "if (i === 4 && (valueSet.has(0) || valueSet.has(7))) {", "if (false) {"],
    ["a step after a single number (n/s) is accepted", "if (s[end1] === \"/\") {", "if (s[end1] === \"/\") {\n        return stepTail(end1, { kind: \"range\", text: s, from: first.value, to: f.high, step: 1 });\n    }\n    if (false) {"],
    ["the start is no longer strictly in the future", "Math.floor(nowMs / MS_PER_MINUTE) * MS_PER_MINUTE + MS_PER_MINUTE", "Math.ceil(nowMs / MS_PER_MINUTE) * MS_PER_MINUTE"],
    ["the search horizon is one century instead of a full cycle", "export const SEARCH_DAYS = 146097;", "export const SEARCH_DAYS = 36525;"],
    ["every fourth year is a leap year (2100 included)", "return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;", "return year % 4 === 0;"],
    ["reversed ranges are accepted", "if (first.value > second.value) {", "if (false) {"],
  ];

  for (const [name, find, replacement] of MUTANTS) {
    test(`caught: ${name}`, async () => {
      const mod = await mutate(find, replacement);
      const failures = goldenFailures(mod);
      assert.ok(failures.length > 0, `the golden checks did not notice: ${name}`);
    });
  }

  test("cleanup of the temporary copies", () => {
    fs.rmSync(dir, { recursive: true, force: true });
    assert.equal(fs.existsSync(dir), false);
  });
});
