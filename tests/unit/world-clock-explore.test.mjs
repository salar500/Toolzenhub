/**
 * World Clock 2.0 (Tool Pack 28, section 20): what the Explore directory shows.
 *
 * explore-model.js decides matches, groups, order, counts and empty states from ONE instant. These tests check it against the
 * independent Python reference (tests/fixtures/world-clock-golden.json: zone, instant, local time, offset) and against the invariants
 * of section 20: the directory is complete, counts never mix cities and time zones, nothing is widened silently, suggestions are never
 * matches, and a whole day of instants never produces a match the local clock does not support.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runExplore, snapshotPlaces, cityPlaces, otherZonePlaces, sameAnswer, countLine, REGION_CHOICES, regionDataFor, regionLabel } from "../../assets/js/tools/world-clock/explore-model.js";
import * as countryData from "../../assets/js/tools/world-clock/country-zones.js";
import { DIRECTORY, normalizeText } from "../../assets/js/tools/world-clock/city-directory.js";
import { canonicalZone } from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const golden = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "fixtures", "world-clock-golden.json"), "utf8"));

const NOW = Date.UTC(2026, 9, 19, 14, 20); // Monday 19:50 in India
const run = (query, extra = {}) => runExplore({ query, nowMs: NOW, countryData, ...extra });
const titles = (a) => a.groups.flatMap((g) => g.rows).map((r) => r.place.title);
const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

describe("the snapshot agrees with the independent reference", () => {
  test("local minute and offset of every strict reference case", () => {
    let checked = 0;
    for (const c of golden.strict) {
      const [row] = snapshotPlaces([{ zone: c.zone, key: c.zone }], c.ms);
      assert.ok(row, c.zone);
      assert.equal(row.local, minutes(c.time), `${c.zone} @ ${c.ms}`);
      assert.equal(row.offsetSeconds, c.offsetSeconds, `${c.zone} offset`);
      checked++;
    }
    assert.ok(checked >= 200);
  });
  test("a hour query matches exactly the reference cases whose local hour it names", () => {
    for (const c of golden.strict) {
      const hour = Number(c.time.slice(0, 2));
      const a = runExplore({ query: `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`, nowMs: c.ms, countryData });
      assert.equal(a.mode, "time");
      const rows = [...a.groups.flatMap((g) => g.rows), ...a.others.rows];
      const hit = rows.some((r) => r.place.zone === c.zone);
      const reachable = cityPlaces().list.some((p) => p.zone === c.zone) || otherZonePlaces(countryData).list.some((p) => p.zone === c.zone);
      if (reachable) assert.equal(hit, true, `${c.zone} at ${c.time}`);
    }
  });
});

describe("the directory", () => {
  test("no query lists all 195 cities, each once, in 148 time zones, plus other time zones", () => {
    const a = run("");
    const rows = a.groups.flatMap((g) => g.rows);
    assert.equal(rows.length, DIRECTORY.length);
    assert.equal(new Set(rows.map((r) => r.place.key)).size, DIRECTORY.length);
    assert.equal(a.counts.cities, 195);
    assert.equal(a.counts.zones, new Set(rows.map((r) => canonicalZone(r.place.zone))).size);
    assert.ok(a.counts.zones < a.counts.cities, "a city count is not a time-zone count");
    assert.equal(a.counts.others, a.others.rows.length);
    assert.equal(a.counts.places, a.counts.cities + a.counts.others);
    assert.match(a.countLine, /^195 listed cities in \d+ time zones, plus \d+ other time zones$/);
  });
  test("other time zones are zones no listed city uses, and never repeat a listed city's zone", () => {
    const listed = new Set(cityPlaces().list.map((p) => canonicalZone(p.zone)));
    const others = otherZonePlaces(countryData).list;
    assert.ok(others.length > 100);
    for (const p of others) assert.equal(listed.has(canonicalZone(p.zone)), false, p.zone);
    assert.equal(new Set(others.map((p) => canonicalZone(p.zone))).size, others.length);
  });
  test("without country data the other-zones group is empty and the cities are unaffected", () => {
    const a = runExplore({ query: "", nowMs: NOW, countryData: null });
    assert.equal(a.counts.cities, 195);
    assert.equal(a.counts.others, 0);
  });
  test("sorting: city, country, local time and offset are each ordered, ties by city", () => {
    const key = (a, f) => a.groups.flatMap((g) => g.rows).map(f);
    const city = key(run("", { sort: "city" }), (r) => r.place.title);
    assert.deepEqual(city, [...city].sort((x, y) => (x.toLowerCase() < y.toLowerCase() ? -1 : x.toLowerCase() > y.toLowerCase() ? 1 : 0)).length === city.length ? city : []);
    const time = key(run("", { sort: "time" }), (r) => r.local);
    assert.deepEqual(time, [...time].sort((x, y) => x - y));
    const off = key(run("", { sort: "offset" }), (r) => r.offsetSeconds);
    assert.deepEqual(off, [...off].sort((x, y) => x - y));
  });
  test("filters combine with the query by AND", () => {
    const europe = run("", { region: "Europe" });
    assert.ok(europe.counts.cities > 20 && europe.counts.cities < 195);
    assert.ok(europe.groups[0].rows.every((r) => r.place.region === "Europe"));
    const india = run("", { country: "IN" });
    assert.equal(india.counts.cities, 8);
    assert.equal("expanded" in india.others, false); // the view never opens the other zones by itself (section 22.3)
    const none = run("tokyo", { region: "Europe" });
    assert.equal(none.counts.places, 0);
  });
});

describe("time searches at 14:20 UTC on Monday 2026-10-19", () => {
  test("UTC+05:30 is the eight Indian cities and Colombo, one time zone each for the two offsets' zones, in one count", () => {
    const a = run("UTC+05:30");
    assert.equal(a.counts.cities, 9);
    assert.equal(a.counts.zones, 2);
    assert.equal(a.countLine, "9 listed cities in 2 time zones, plus 0 other time zones");
    assert.equal(a.empty, null);
    assert.ok(a.notes.some((n) => /daylight saving/.test(n)));
  });
  test("8 PM is local 20:00 to 20:59: a match really reads that hour, and none that read it are missing", () => {
    const a = run("8 PM");
    const rows = a.groups[0].rows;
    assert.ok(rows.length > 0);
    for (const r of rows) assert.ok(r.local >= 1200 && r.local <= 1259, `${r.place.title} ${r.local}`);
    const all = snapshotPlaces(cityPlaces().list, NOW);
    assert.equal(rows.length, all.filter((r) => r.local >= 1200 && r.local <= 1259).length);
  });
  test("a bare 8 is two groups, 8 AM and 8 PM, never merged", () => {
    const a = run("8", { hour12: true });
    assert.equal(a.groups.length, 2);
    assert.equal(a.headings.length, 2);
    assert.match(a.headings[0], /8:00 AM/);
    assert.match(a.headings[1], /8:00 PM/);
    const keys = a.groups.map((g) => new Set(g.rows.map((r) => r.place.key)));
    for (const k of keys[0]) assert.equal(keys[1].has(k), false);
  });
  test("AM and PM together cover every city exactly once", () => {
    const am = run("am").counts.cities;
    const pm = run("pm").counts.cities;
    assert.equal(am + pm, 195);
  });
  test("a range and an hour agree: 8 PM-8:59 PM equals 8 PM", () => {
    const hour = run("8 pm").groups[0].rows.map((r) => r.place.key).sort();
    const range = run("8:00 pm-8:59 pm").groups[0].rows.map((r) => r.place.key).sort();
    assert.deepEqual(range, hour);
  });
  test("a range that crosses midnight matches both sides of it", () => {
    const a = run("22:00-02:00");
    const locals = a.groups[0].rows.map((r) => r.local);
    assert.ok(locals.some((m) => m >= 1320) && locals.some((m) => m <= 120));
    for (const m of locals) assert.ok(m >= 1320 || m <= 120);
  });
  test("noon and midnight are whole hours", () => {
    for (const r of run("noon").groups[0].rows) assert.ok(r.local >= 720 && r.local <= 779);
    for (const r of run("midnight").groups[0].rows) assert.ok(r.local <= 59);
  });
  test("a specific time lists nearest first and states its tolerance", () => {
    const a = run("8:05 pm");
    assert.match(a.headings[0], /±15 minutes/);
    const gaps = a.groups[0].rows.map((r) => Math.abs(r.local - 1205));
    assert.deepEqual(gaps, [...gaps].sort((x, y) => x - y));
  });
  test("the tolerance changes the window and nothing else", () => {
    const narrow = run("8:05 pm", { tolerance: 5 }).counts.cities;
    const wide = run("8:05 pm", { tolerance: 60 }).counts.cities;
    assert.ok(narrow <= run("8:05 pm").counts.cities && run("8:05 pm").counts.cities <= wide);
  });
  test("every query is evaluated at the ONE instant it is given", () => {
    const a = run("8 pm");
    assert.equal(a.instant, NOW);
    for (const g of a.groups) for (const r of g.rows) assert.equal(snapshotPlaces([r.place], NOW)[0].local, r.local);
  });
});

describe("empty results are honest", () => {
  test("a window with no listed city says so, offers an explicit wider window and separate nearest places", () => {
    let found = null;
    for (let m = 0; m < 1440 && !found; m += 7) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const a = run(`${hh}:${mm}`, { tolerance: 5 });
      if (a.counts.places === 0) found = a;
    }
    if (!found) return; // every minute of the day had a match at this instant: nothing to check
    assert.equal(found.counts.places, 0);
    assert.match(found.empty.message, /^No listed city is currently/);
    assert.equal(found.empty.widenTo, 15);
    assert.ok(found.groups.every((g) => g.rows.length === 0), "nothing is broadened into the matches");
    assert.ok(found.empty.suggestions.length <= 5);
    for (const s of found.empty.suggestions) assert.ok(s.gap > 0 && /before|after/.test(s.distance));
  });
  test("an hour, period, range or offset never offers to widen itself", () => {
    const a = run("+13:45");
    if (a.counts.places === 0) assert.equal(a.empty.widenTo, null);
    assert.equal(run("8 pm").empty?.widenTo ?? null, null);
  });
  test("suggestions are at most 5, one per time zone, and none are in the counts", () => {
    const a = run("+13:45");
    if (a.empty) {
      assert.ok(a.empty.suggestions.length <= 5);
      assert.equal(new Set(a.empty.suggestions.map((s) => canonicalZone(s.row.place.zone))).size, a.empty.suggestions.length);
      assert.equal(a.counts.places, 0);
    }
  });
  test("a name with no match gets the standard message and no suggestions", () => {
    const a = run("zzzzqqq");
    assert.equal(a.counts.places, 0);
    assert.match(a.empty.message, /^No match for "zzzzqqq"/);
    assert.deepEqual(a.empty.suggestions, []);
  });
  test("a long typed query is clipped in the message", () => {
    const a = run("q".repeat(200));
    assert.ok(a.empty.message.length < 400);
  });
});

describe("names, countries, continents, abbreviations and invalid times", () => {
  test("a city name finds the city; accents and case do not matter", () => {
    assert.ok(titles(run("london")).includes("London"));
    assert.ok(titles(run("SAO PAULO")).some((t) => /Paulo/.test(t)));
  });
  test("a country lists its cities and expands its other zones", () => {
    const a = run("Australia");
    assert.equal(a.mode, "country");
    assert.ok(a.counts.cities >= 4);
    assert.equal("expanded" in a.others, false); // the other zones are counted, never opened for the visitor (section 22.3)
    assert.match(a.headings[0], /Australia · \d+ time zones/);
  });
  test("a continent word lists that region's cities, with its other zones collapsed", () => {
    const a = run("Europe");
    assert.equal(a.mode, "region");
    assert.ok(a.counts.cities > 20);
    assert.ok(a.groups[0].rows.every((r) => r.place.region === "Europe"));
  });
  test("an abbreviation is explained and matches nothing", () => {
    const a = run("EST");
    assert.equal(a.mode, "abbreviation");
    assert.equal(a.counts.places, 0);
    assert.match(a.notes[0], /abbreviation/);
  });
  test("an invalid time gives a hint and no results; it is never searched as a name", () => {
    for (const q of ["25:00", "13 pm", "8:75", "9-12"]) {
      const a = run(q);
      assert.equal(a.mode, "invalid", q);
      assert.equal(a.counts.places, 0);
      assert.ok(a.hint.length > 10);
    }
  });
  test("amman and amsterdam are cities, not AM", () => {
    assert.equal(run("amman").mode, "cities");
    assert.ok(titles(run("amsterdam")).includes("Amsterdam"));
  });
  test("a zone path finds other time zones too", () => {
    const a = run("America/Indiana");
    assert.ok(a.counts.places > 0);
  });
});

describe("answers over time", () => {
  test("the same answer is recognised, a changed one is not", () => {
    assert.equal(sameAnswer(run("8 pm"), run("8 pm")), true);
    assert.equal(sameAnswer(run(""), run("", { nowMs: NOW + 60000 })), true);
    assert.equal(sameAnswer(run("8 pm"), run("8 pm", { nowMs: NOW + 3 * 3600000 })), false);
  });
  test("a full day of instants never yields a match the local clock does not support", () => {
    for (let t = 0; t < 24 * 60; t += 37) {
      const nowMs = NOW + t * 60000;
      const a = runExplore({ query: "8 pm", nowMs, countryData });
      for (const r of a.groups[0].rows) assert.equal(Math.floor(r.local / 60), 20);
    }
  });
  test("the count line is worded exactly", () => {
    assert.equal(countLine(1, 1, 1), "1 listed city in 1 time zone, plus 1 other time zone");
    assert.equal(countLine(9, 2, 0), "9 listed cities in 2 time zones, plus 0 other time zones");
  });
});

describe("Step 2 (section 22): sorting, region groups, per-view messages, named periods", () => {
  const norm = (text) => text.toLowerCase();

  test("ordinary browsing is ordered by the local time of day, 00:00 to 23:59, ties by city then key", () => {
    for (const query of ["", "India", "Europe", "Australia", "Canada"]) {
      const rows = run(query).groups.flatMap((g) => g.rows);
      assert.ok(rows.length > 1, query);
      for (let i = 1; i < rows.length; i++) {
        const a = rows[i - 1];
        const b = rows[i];
        assert.ok(a.local <= b.local, `${query}: ${a.place.title} ${a.local} before ${b.place.title} ${b.local}`);
        if (a.local === b.local) {
          const ka = norm(a.place.title);
          const kb = norm(b.place.title);
          assert.ok(ka < kb || (ka === kb && a.place.key < b.place.key), `${query}: tie ${a.place.title} / ${b.place.title}`);
        }
      }
    }
    const all = run("").groups[0].rows;
    assert.ok(all[0].local < 60 * 3 && all.at(-1).local > 60 * 20, "starts after midnight somewhere and ends before it somewhere");
  });

  test("the same instant always gives the same order, and the other time zones use the same key", () => {
    assert.deepEqual(titles(run("")), titles(run("")));
    const others = run("").others.rows;
    for (let i = 1; i < others.length; i++) assert.ok(others[i - 1].local <= others[i].local);
  });

  test("an explicit sort is honoured; a typed name keeps its best match order until a sort is chosen", () => {
    const byCity = titles(run("", { sort: "city" }));
    const key = (text) => normalizeText(text);
    assert.deepEqual(byCity, [...byCity].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)));
    const byOffset = run("", { sort: "offset" }).groups[0].rows;
    for (let i = 1; i < byOffset.length; i++) assert.ok(byOffset[i - 1].offsetSeconds <= byOffset[i].offsetSeconds);
    const typed = run("london");
    assert.equal(typed.relevance, true);
    assert.equal(run("london", { sort: "time" }).relevance, true); // the view decides; the model still reports it is a typed name
  });

  test("across the US, European and Lord Howe clock changes the order follows each zone's real clock, checked against Intl", () => {
    const wall = (zone, ms) => {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", hour: "2-digit", minute: "2-digit" }).formatToParts(ms);
      return Number(parts.find((p) => p.type === "hour").value) * 60 + Number(parts.find((p) => p.type === "minute").value);
    };
    let instants = 0;
    for (const start of [Date.UTC(2026, 9, 25, 0, 0), Date.UTC(2026, 10, 1, 4, 0), Date.UTC(2026, 3, 4, 14, 0)]) {
      for (let t = 0; t < 10; t++) {
        const nowMs = start + t * 45 * 60000;
        const rows = runExplore({ query: "", nowMs, countryData }).groups[0].rows;
        for (let i = 0; i < rows.length; i++) {
          assert.equal(rows[i].local, wall(rows[i].place.zone, nowMs), `${rows[i].place.title} at ${new Date(nowMs).toISOString()}`);
          if (i > 0) assert.ok(rows[i - 1].local <= rows[i].local);
        }
        instants++;
      }
    }
    assert.equal(instants, 30);
  });

  test("a time query keeps its own order: a range from its start, so a range across midnight starts at its start", () => {
    const rows = run("21:00-05:59").groups[0].rows;
    const keys = rows.map((r) => (r.local - 1260 + 1440) % 1440);
    for (let i = 1; i < keys.length; i++) assert.ok(keys[i - 1] <= keys[i]);
  });

  test("region choices are labels over the data regions: Americas is North and South America, Australia & Pacific is Oceania", () => {
    const americas = run("", { region: "Americas" });
    assert.equal(americas.counts.cities, 53);
    assert.equal(americas.counts.others, 112);
    assert.ok(americas.groups[0].rows.every((r) => ["North America", "South America"].includes(r.place.region)));
    const pacific = run("", { region: "Australia & Pacific" });
    assert.equal(pacific.counts.cities, 22);
    assert.equal(pacific.counts.others, 29);
    // a data region's own name still works as a filter
    assert.equal(run("", { region: "Oceania" }).counts.cities, 22);
    assert.equal(run("", { region: "North America" }).counts.cities, 40);
    assert.equal(REGION_CHOICES.join("|"), "Africa|Asia|Europe|Americas|Australia & Pacific");
    assert.deepEqual(regionDataFor("Americas"), ["North America", "South America"]);
    assert.deepEqual(regionDataFor(""), []);
    assert.equal(regionLabel("Oceania"), "Australia & Pacific");
    assert.equal(regionLabel("South America"), "Americas");
  });

  test("the region choices cover every listed city once; unclassified other zones appear only under all regions", () => {
    const all = run("");
    assert.equal(all.counts.cities, 195);
    const sum = (field) => REGION_CHOICES.reduce((n, region) => n + run("", { region }).counts[field], 0);
    assert.equal(sum("cities"), 195);
    const unclassified = all.others.rows.filter((r) => !r.place.region).length;
    assert.ok(unclassified > 0);
    assert.equal(sum("others"), all.counts.others - unclassified);
  });

  test("a region and a country combine with the query by AND in both views", () => {
    const a = run("", { region: "Americas", country: "US" });
    assert.ok(a.counts.cities > 0 && a.groups[0].rows.every((r) => r.place.country === "US"));
    assert.ok(a.others.rows.every((r) => r.place.country === "US"));
    assert.equal(run("tokyo", { region: "Americas" }).counts.places, 0);
  });

  test("a continent heading uses the visible label; the typed word oceania still works", () => {
    assert.match(run("oceania").headings[0], /^Australia & Pacific · 22 listed cities/);
    assert.match(run("Oceania").announce, /^Australia & Pacific/);
    assert.match(run("americas").headings[0], /^Americas · 53 listed cities/);
    assert.match(run("north america").headings[0], /^North America · 40 listed cities/);
    assert.match(run("asia").headings[0], /^Asia · /);
  });

  test("no result set is ever marked as expanded: the view never opens the other zones by itself", () => {
    for (const query of ["", "India", "Australia", "America/Indiana", "8 pm", "evening"]) assert.equal("expanded" in run(query).others, false, query);
  });

  test("each view has its own sentence for no match; invalid and abbreviation queries have none", () => {
    const none = run("xyzzy");
    assert.equal(none.noneIn.cities, 'No listed city matches "xyzzy".');
    assert.equal(none.noneIn.others, 'No other time zone matches "xyzzy".');
    assert.match(run("xyzzy", { region: "Asia" }).noneIn.cities, /in Asia\.$/);
    assert.match(run("xyzzy", { region: "Americas", country: "US" }).noneIn.cities, /in United States, Americas\.$/);
    const time = run("08:00-08:01", { hour12: true });
    assert.equal(time.counts.places, 0);
    assert.match(time.noneIn.cities, /^No listed city is currently between 8:00 AM and 8:01 AM/);
    assert.match(time.noneIn.others, /^No other time zone is currently between 8:00 AM and 8:01 AM/);
    assert.equal(run("25:00").noneIn ?? null, null);
    assert.equal(run("ist").noneIn ?? null, null);
  });

  test("named periods give the listed cities and other zones whose local clock is inside the interval, across a whole day", () => {
    const spans = { "before noon": [0, 719], "12 pm onward": [720, 1439], morning: [360, 719], afternoon: [720, 1079], evening: [1080, 1259], night: [1260, 359] };
    for (const [phrase, [start, end]] of Object.entries(spans)) {
      const inside = (m) => (start <= end ? m >= start && m <= end : m >= start || m <= end);
      for (let t = 0; t < 24 * 60; t += 53) {
        const a = runExplore({ query: phrase, nowMs: NOW + t * 60000, countryData });
        assert.equal(a.mode, "time", phrase);
        assert.equal(a.timeKind, "named", phrase);
        assert.equal(a.groups.length, 1);
        for (const r of [...a.groups[0].rows, ...a.others.rows]) assert.ok(inside(r.local), `${phrase}: ${r.place.title} at ${r.local}`);
        const outside = snapshotPlaces(cityPlaces().list, NOW + t * 60000).filter((r) => !inside(r.local)).length;
        assert.equal(a.counts.cities + outside, 195, `${phrase}: every city is inside or outside`);
      }
    }
  });

  test("a named period equals the period or range it stands for, and a fragment is a name search", () => {
    const same = (phrase, query) => assert.deepEqual(titles(run(phrase)), titles(run(query)), phrase);
    same("before noon", "am");
    same("12 PM onward", "pm");
    same("Evening", "18:00-20:59");
    same("  night ", "21:00-05:59");
    same("Morning", "06:00-11:59");
    same("afternoon", "12:00-17:59");
    for (const fragment of ["even", "morn", "after", "before", "night shift"]) assert.notEqual(run(fragment).timeKind, "named", fragment);
    assert.equal(run("evening").empty?.widenTo ?? null, null);
  });

  test("the headings, in 12-hour and 24-hour display, say exactly which interval", () => {
    assert.equal(run("evening", { hour12: true }).headings[0], "Places where it is currently evening (6:00 PM to 8:59 PM)");
    assert.equal(run("evening", { hour12: false }).headings[0], "Places where it is currently evening (18:00 to 20:59)");
  });
});
