/**
 * World Clock 2.0 (Tool Pack 28, section 20): what a typed time means.
 *
 * time-query.js is pure: it reads a string, and given the local minute (and offset) of a place says whether the place matches.
 * These tests pin the grammar of section 20.4 to 20.6 row by row, including every precedence conflict that matters (a bare number,
 * a sign, a range against a negative offset, the words noon and midnight), the boundaries of every window (both ends included, a
 * window that wraps midnight, the minute just outside), the tolerance steps, the offset limits, and the wording of the headings.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { DIRECTORY, normalizeText } from "../../assets/js/tools/world-clock/city-directory.js";
import { countryLabel } from "../../assets/js/tools/world-clock/clock-engine.js";
import * as countryData from "../../assets/js/tools/world-clock/country-zones.js";

import {
  parseTimeQuery, buildGroups, normalizeQuery, formatMinute, formatOffset, widerTolerance, describeSpan,
  DEFAULT_TOLERANCE, TOLERANCES, HINTS, NAMED_PERIODS,
} from "../../assets/js/tools/world-clock/time-query.js";

const kind = (q) => parseTimeQuery(q)?.kind ?? null;
const hours = (q) => parseTimeQuery(q).hours;
const mins = (n, m = 0) => n * 60 + m;

describe("normalising", () => {
  test("case, spaces, dots in a.m., and every dash read alike", () => {
    assert.equal(normalizeQuery("  8   P.M. "), "8 pm");
    assert.equal(normalizeQuery("9 AM – 12 PM"), "9 am - 12 pm");
    assert.equal(normalizeQuery("UTC−04:00"), "utc-04:00");
    assert.equal(normalizeQuery(null), "");
  });
});

describe("an hour", () => {
  test("with am or pm it is one hour, whatever the spacing or zero padding", () => {
    for (const q of ["8 am", "8am", "08 am", "8 AM", "8 a.m."]) assert.deepEqual(hours(q), [8], q);
    for (const q of ["8 pm", "8pm", "08 pm", "8 P.M."]) assert.deepEqual(hours(q), [20], q);
  });
  test("12 AM is the hour from midnight and 12 PM the hour from noon", () => {
    assert.deepEqual(hours("12 am"), [0]);
    assert.deepEqual(hours("12 pm"), [12]);
  });
  test("a 24-hour number, or one with a leading zero, is one hour", () => {
    assert.deepEqual(hours("20"), [20]);
    assert.deepEqual(hours("08"), [8]);
    assert.deepEqual(hours("00"), [0]);
    assert.deepEqual(hours("0"), [0]);
    assert.deepEqual(hours("13"), [13]);
  });
  test("a bare 1 to 12 is both readings, in order: 8 is 8 AM and 8 PM; 12 is midnight and noon", () => {
    assert.deepEqual(hours("8"), [8, 20]);
    assert.deepEqual(hours("1"), [1, 13]);
    assert.deepEqual(hours("12"), [0, 12]);
  });
  test("noon and midnight are the current local hours 12:00 to 12:59 and 00:00 to 00:59, never an exact minute", () => {
    const noon = parseTimeQuery("noon");
    const midnight = parseTimeQuery("midnight");
    assert.deepEqual([noon.kind, noon.hours, noon.word], ["hour", [12], "noon"]);
    assert.deepEqual([midnight.kind, midnight.hours, midnight.word], ["hour", [0], "midnight"]);
    const [n] = buildGroups(noon);
    assert.equal(n.test(mins(12)), true);
    assert.equal(n.test(mins(12, 59)), true);
    assert.equal(n.test(mins(11, 59)), false);
    assert.equal(n.test(mins(13)), false);
    const [m] = buildGroups(midnight);
    assert.equal(m.test(0), true);
    assert.equal(m.test(59), true);
    assert.equal(m.test(60), false);
    assert.equal(m.test(1439), false);
    assert.equal(n.heading(true), "Places currently between 12:00 PM and 12:59 PM");
    assert.equal(m.heading(true), "Places currently between 12:00 AM and 12:59 AM");
  });
  test("noon and midnight take no minutes and no tolerance", () => {
    assert.equal(kind("noon:30"), "invalid");
    assert.equal(kind("midnight:15"), "invalid");
    assert.equal(kind("noon pm"), "invalid");
  });
  test("an hour window includes its first and last minute and nothing else", () => {
    const [g] = buildGroups(parseTimeQuery("8 pm"));
    assert.equal(g.test(mins(19, 59)), false);
    assert.equal(g.test(mins(20)), true);
    assert.equal(g.test(mins(20, 59)), true);
    assert.equal(g.test(mins(21)), false);
    assert.equal(g.heading(true), "Places currently between 8:00 PM and 8:59 PM");
    assert.equal(g.heading(false), "Places currently between 20:00 and 20:59");
  });
  test("a bare 8 is two groups, each with its own heading", () => {
    const groups = buildGroups(parseTimeQuery("8"));
    assert.equal(groups.length, 2);
    assert.equal(groups[0].test(mins(8, 30)), true);
    assert.equal(groups[0].test(mins(20, 30)), false);
    assert.equal(groups[1].test(mins(20, 30)), true);
    assert.notEqual(groups[0].heading(true), groups[1].heading(true));
  });
});

describe("AM and PM on their own", () => {
  test("am is 00:00 to 11:59 and pm is 12:00 to 23:59, case-insensitive", () => {
    const [am] = buildGroups(parseTimeQuery("AM"));
    const [pm] = buildGroups(parseTimeQuery("pm"));
    for (const [m, a, p] of [[0, true, false], [mins(11, 59), true, false], [mins(12), false, true], [mins(23, 59), false, true]]) {
      assert.equal(am.test(m), a, `am ${m}`);
      assert.equal(pm.test(m), p, `pm ${m}`);
    }
  });
});

describe("a specific time", () => {
  test("is read with minutes, and a bare one is both readings", () => {
    assert.deepEqual(parseTimeQuery("8:30 am").minutes, [mins(8, 30)]);
    assert.deepEqual(parseTimeQuery("8:30 pm").minutes, [mins(20, 30)]);
    assert.deepEqual(parseTimeQuery("20:30").minutes, [mins(20, 30)]);
    assert.deepEqual(parseTimeQuery("08:30").minutes, [mins(8, 30)]);
    assert.deepEqual(parseTimeQuery("8:30").minutes, [mins(8, 30), mins(20, 30)]);
    assert.deepEqual(parseTimeQuery("12:15").minutes, [15, mins(12, 15)]);
  });
  test("the default window is 15 minutes either side, both ends included, and never silently wider", () => {
    assert.equal(DEFAULT_TOLERANCE, 15);
    const [g] = buildGroups(parseTimeQuery("8:30 am"), 15);
    assert.equal(g.test(mins(8, 14)), false);
    assert.equal(g.test(mins(8, 15)), true);
    assert.equal(g.test(mins(8, 30)), true);
    assert.equal(g.test(mins(8, 45)), true);
    assert.equal(g.test(mins(8, 46)), false);
    assert.match(g.heading(true), /around 8:30 AM \(8:15 AM to 8:45 AM, ±15 minutes\)/);
  });
  test("each tolerance is exactly its own width", () => {
    for (const t of TOLERANCES) {
      const [g] = buildGroups(parseTimeQuery("13:00"), t);
      assert.equal(g.test(mins(13) + t), true, `+${t}`);
      assert.equal(g.test(mins(13) - t), true, `-${t}`);
      assert.equal(g.test(mins(13) + t + 1), false, `+${t + 1}`);
      assert.equal(g.test(mins(13) - t - 1), false, `-${t + 1}`);
    }
  });
  test("a window wraps across midnight in both directions", () => {
    const [g] = buildGroups(parseTimeQuery("00:05"), 15);
    assert.equal(g.test(mins(23, 50)), true);
    assert.equal(g.test(mins(23, 49)), false);
    assert.equal(g.test(20), true);
    assert.equal(g.test(21), false);
    const [late] = buildGroups(parseTimeQuery("23:55"), 15);
    assert.equal(late.test(5), true);
    assert.equal(late.test(11), false);
  });
  test("the next wider tolerance exists until the widest", () => {
    assert.equal(widerTolerance(5), 15);
    assert.equal(widerTolerance(15), 30);
    assert.equal(widerTolerance(30), 60);
    assert.equal(widerTolerance(60), null);
  });
  test("the nearest place sorts first, by distance round the clock", () => {
    const [g] = buildGroups(parseTimeQuery("23:55"), 15);
    assert.ok(g.sortKey(mins(23, 55)) < g.sortKey(5));
    assert.ok(g.sortKey(5) < g.sortKey(mins(23, 40)));
  });
});

describe("a range", () => {
  test("reads two times, with am or pm on both or on the 24-hour clock", () => {
    assert.deepEqual(parseTimeQuery("9 am-12 pm"), { kind: "range", start: mins(9), end: mins(12) });
    assert.deepEqual(parseTimeQuery("9 am to 5 pm"), { kind: "range", start: mins(9), end: mins(17) });
    assert.deepEqual(parseTimeQuery("08:00-10:00"), { kind: "range", start: mins(8), end: mins(10) });
    assert.deepEqual(parseTimeQuery("9:00-17:00"), { kind: "range", start: mins(9), end: mins(17) });
    assert.deepEqual(parseTimeQuery("22:00 – 02:00"), { kind: "range", start: mins(22), end: mins(2) });
    assert.deepEqual(parseTimeQuery("9:30 am-5:45 pm"), { kind: "range", start: mins(9, 30), end: mins(17, 45) });
  });
  test("an end that could be either half of the day is refused, not guessed", () => {
    for (const q of ["9-12", "9 am-12", "8-10 pm", "3-5"]) {
      const p = parseTimeQuery(q);
      assert.equal(p.kind, "invalid", q);
      assert.equal(p.hint, "range-halves", q);
    }
  });
  test("a range with equal ends, or an impossible end, is invalid", () => {
    assert.equal(parseTimeQuery("08:00-08:00").hint, "range-equal");
    assert.equal(parseTimeQuery("8 am-8 am").hint, "range-equal");
    assert.equal(kind("25:00-26:00"), "invalid");
    assert.equal(kind("9 am-13 pm"), "invalid");
  });
  test("both ends are included; a range from the start up to and including the end", () => {
    const [g] = buildGroups(parseTimeQuery("9 am-12 pm"));
    assert.equal(g.test(mins(8, 59)), false);
    assert.equal(g.test(mins(9)), true);
    assert.equal(g.test(mins(12)), true);
    assert.equal(g.test(mins(12, 1)), false);
  });
  test("a range may cross midnight, and says so", () => {
    const [g] = buildGroups(parseTimeQuery("22:00-02:00"));
    for (const m of [mins(22), mins(23, 59), 0, mins(2)]) assert.equal(g.test(m), true, String(m));
    for (const m of [mins(21, 59), mins(2, 1), mins(12)]) assert.equal(g.test(m), false, String(m));
    assert.match(g.heading(false), /crossing midnight/);
    assert.doesNotMatch(buildGroups(parseTimeQuery("9 am-5 pm"))[0].heading(true), /crossing midnight/);
  });
  test("noon and midnight are times at the end of a range", () => {
    assert.deepEqual(parseTimeQuery("midnight-6 am"), { kind: "range", start: 0, end: mins(6) });
    assert.deepEqual(parseTimeQuery("6 am-noon"), { kind: "range", start: mins(6), end: mins(12) });
  });
});

describe("a UTC offset", () => {
  test("needs a sign or utc/gmt, and reads hours, hours and minutes, with or without a colon", () => {
    const cases = { "utc+05:30": 19800, "+05:30": 19800, "+5:30": 19800, "+0530": 19800, "-4": -14400, "-04:00": -14400, "UTC-4": -14400, "gmt+1": 3600, "utc −4": -14400, "+14": 50400, "-12": -43200, "+0": 0, "+5:45": 20700 };
    for (const [q, seconds] of Object.entries(cases)) assert.equal(parseTimeQuery(q)?.seconds, seconds, q);
  });
  test("bare utc and gmt are offset zero, remembered so the note can explain them", () => {
    assert.deepEqual(parseTimeQuery("utc"), { kind: "offset", seconds: 0, bare: "utc" });
    assert.deepEqual(parseTimeQuery("GMT"), { kind: "offset", seconds: 0, bare: "gmt" });
  });
  test("a real offset has limits: -12:00 to +14:00, in 15-minute steps", () => {
    for (const q of ["+15", "+14:15", "-12:15", "-13", "+5:10", "+5:75"]) assert.equal(parseTimeQuery(q).hint, "offset", q);
  });
  test("matches the places whose offset NOW is exactly that one, and only those", () => {
    const [g] = buildGroups(parseTimeQuery("utc+05:30"));
    assert.equal(g.test(0, 19800), true);
    assert.equal(g.test(0, 19799), false);
    assert.equal(g.test(0, 20700), false);
    assert.equal(g.heading(true), "Places currently using UTC+05:30");
  });
  test("a negative offset is an offset, not a range, and a negative range is not read as an offset", () => {
    assert.equal(kind("-4"), "offset");
    assert.equal(kind("-04:00"), "offset");
    assert.equal(kind("09:00-10:00"), "range");
  });
});

describe("what is not a time", () => {
  test("names, words with digits that are not times, and the empty string are left to the name search", () => {
    for (const q of ["", "   ", "london", "amman", "amsterdam", "am pm", "new york", "mumbai", "sao paulo", "kenya", "asia/kolkata", "pm2", "noonday"]) {
      const p = parseTimeQuery(q);
      assert.ok(p === null || p.kind === "invalid" && /^(noon|midnight)/.test(q), `${JSON.stringify(q)} -> ${JSON.stringify(p)}`);
    }
    assert.equal(parseTimeQuery("london"), null);
    assert.equal(parseTimeQuery("amman"), null);
    assert.equal(parseTimeQuery("amsterdam"), null);
    assert.equal(parseTimeQuery(""), null);
  });
  test("something that starts like a time or an offset but is not one is invalid with a hint, never a silent name search", () => {
    for (const q of ["25:00", "13 pm", "8:75", "123", "8:", "-", "utc+", "gmt -", "8 pm europe", "12 noon"]) {
      assert.equal(parseTimeQuery(q).kind, "invalid", q);
      assert.ok(HINTS[parseTimeQuery(q).hint], q);
    }
  });
});

describe("wording and helpers", () => {
  test("clock text, in both styles, and offsets with a real minus", () => {
    assert.equal(formatMinute(0, true), "12:00 AM");
    assert.equal(formatMinute(mins(12, 5), true), "12:05 PM");
    assert.equal(formatMinute(mins(23, 59), true), "11:59 PM");
    assert.equal(formatMinute(mins(8, 5), false), "08:05");
    assert.equal(formatMinute(-15, false), "23:45");
    assert.equal(formatOffset(19800), "UTC+05:30");
    assert.equal(formatOffset(-14400), "UTC−04:00");
    assert.equal(formatOffset(0), "UTC+00:00");
  });
  test("a span of minutes reads as hours and minutes", () => {
    assert.equal(describeSpan(8), "8 minutes");
    assert.equal(describeSpan(1), "1 minute");
    assert.equal(describeSpan(60), "1 hour");
    assert.equal(describeSpan(65), "1 hour 5 minutes");
    assert.equal(describeSpan(120), "2 hours");
  });
  test("gap is how far outside a window, 0 inside, measured the short way round the clock", () => {
    const [g] = buildGroups(parseTimeQuery("5 am"));
    assert.equal(g.gap(mins(5, 30)), 0);
    assert.equal(g.gap(mins(4, 52)), 8);
    assert.equal(g.gap(mins(6, 7)), 8);
    const [wrap] = buildGroups(parseTimeQuery("00:00-01:00"));
    assert.equal(wrap.gap(mins(23, 50)), 10);
  });
});

describe("named periods (section 22.5)", () => {
  const PHRASES = ["before noon", "12 pm onward", "morning", "afternoon", "evening", "night"];

  test("the six phrases are recognised only as the whole query, in any case and spacing", () => {
    assert.deepEqual(NAMED_PERIODS.map((p) => p.phrase), PHRASES);
    for (const phrase of PHRASES) {
      for (const variant of [phrase, phrase.toUpperCase(), `  ${phrase}  `, phrase.replace(/ /g, "   ")]) {
        assert.equal(kind(variant), "named", JSON.stringify(variant));
      }
    }
    assert.equal(parseTimeQuery("Before Noon").id, "before-noon");
    assert.equal(parseTimeQuery("12 PM onward").id, "noon-onward");
  });

  test("a fragment, or the phrase with anything added, is not a named period", () => {
    for (const text of ["even", "eve", "evenin", "morn", "mornin", "after", "afternoo", "before", "before no", "nigh", "night shift", "evening star", "the evening", "good morning", "afternoons"]) {
      assert.notEqual(kind(text), "named", text);
      assert.equal(kind(text), null, text); // an ordinary name search: not a time query at all
    }
    // starting with a digit, an unfinished "12 pm onward" is the existing invalid-time hint, never a named period
    for (const text of ["12 pm onw", "12 pm onward now", "12 onward"]) assert.notEqual(kind(text), "named", text);
  });

  test("the existing classes are unchanged", () => {
    assert.equal(kind("12 pm"), "hour");
    assert.equal(kind("12 PM"), "hour");
    assert.equal(kind("am"), "period");
    assert.equal(kind("pm"), "period");
    assert.equal(kind("noon"), "hour");
    assert.equal(kind("midnight"), "hour");
    assert.equal(kind("8 pm"), "hour");
    assert.equal(kind("8:30 am"), "time");
    assert.equal(kind("9 am-12 pm"), "range");
    assert.equal(kind("utc+05:30"), "offset");
    assert.equal(kind("25:00"), "invalid");
    assert.equal(kind("mumbai"), null);
    assert.equal(kind("australia"), null);
  });

  test("each interval includes both ends and excludes the minute outside, and Night wraps midnight", () => {
    const edges = {
      "before noon": [[0, 719], [-1, 720]],
      "12 pm onward": [[720, 1439], [719, 0]],
      morning: [[360, 719], [359, 720]],
      afternoon: [[720, 1079], [719, 1080]],
      evening: [[1080, 1259], [1079, 1260]],
      night: [[1260, 359], [1259, 360]]
    };
    for (const [phrase, [[start, end], [before, after]]] of Object.entries(edges)) {
      const [g] = buildGroups(parseTimeQuery(phrase));
      const at = (m) => ((m % 1440) + 1440) % 1440;
      assert.equal(g.test(at(start)), true, `${phrase} start`);
      assert.equal(g.test(at(end)), true, `${phrase} end`);
      assert.equal(g.test(at(before)), false, `${phrase} just before`);
      assert.equal(g.test(at(after)), false, `${phrase} just after`);
    }
    const [night] = buildGroups(parseTimeQuery("night"));
    for (const m of [1260, 1380, 1439, 0, 120, 359]) assert.equal(night.test(m), true, String(m));
    for (const m of [360, 720, 1080, 1259]) assert.equal(night.test(m), false, String(m));
  });

  test("the overlaps are deliberate: Before noon holds Morning, 12 PM onward holds Afternoon and Evening", () => {
    const inside = (phrase, m) => buildGroups(parseTimeQuery(phrase))[0].test(m);
    for (let m = 0; m < 1440; m++) {
      if (inside("morning", m)) assert.equal(inside("before noon", m), true, String(m));
      if (inside("afternoon", m) || inside("evening", m)) assert.equal(inside("12 pm onward", m), true, String(m));
      assert.equal(inside("before noon", m) !== inside("12 pm onward", m), true, `exactly one half at ${m}`);
    }
  });

  test("the headings say the interval in 12-hour and in 24-hour display", () => {
    const heading = (phrase, hour12) => buildGroups(parseTimeQuery(phrase))[0].heading(hour12);
    assert.equal(heading("before noon", true), "Places where it is currently before noon (midnight to 11:59 AM)");
    assert.equal(heading("12 pm onward", true), "Places where it is currently 12 PM onward (noon to 11:59 PM)");
    assert.equal(heading("morning", true), "Places where it is currently morning (6:00 AM to 11:59 AM)");
    assert.equal(heading("afternoon", true), "Places where it is currently afternoon (12:00 PM to 5:59 PM)");
    assert.equal(heading("evening", true), "Places where it is currently evening (6:00 PM to 8:59 PM)");
    assert.equal(heading("night", true), "Places where it is currently night (9:00 PM to 5:59 AM, crossing midnight)");
    assert.equal(heading("night", false), "Places where it is currently night (21:00 to 05:59, crossing midnight)");
    assert.equal(heading("evening", false), "Places where it is currently evening (18:00 to 20:59)");
  });

  test("collision guard: no city, alias or country name is one of the six phrases", () => {
    const names = new Set();
    for (const entry of DIRECTORY) {
      names.add(normalizeText(entry.city));
      names.add(normalizeText(entry.country));
      for (const alias of entry.aliases ?? []) names.add(normalizeText(alias));
    }
    for (const code of Object.keys(countryData.COUNTRY_ZONES)) names.add(normalizeText(countryLabel(code)));
    for (const phrase of PHRASES) assert.equal(names.has(phrase), false, `a place is named "${phrase}"`);
  });
});
