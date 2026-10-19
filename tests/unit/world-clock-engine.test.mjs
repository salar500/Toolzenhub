/**
 * World Clock (Tool Pack 28). Pure engine only: no DOM.
 *
 * Hand-worked cases whose answers come from the rules (UTC offsets and the published change dates), not from the code. The independent
 * Python zoneinfo reference is in world-clock-oracle.test.mjs; the city directory in world-clock-directory.test.mjs; the address in
 * world-clock-url.test.mjs; the Time Zone Converter's behaviour in world-clock-contract.test.mjs.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_CITIES, MAX_RESULTS, DAY_STARTS_AT, DAY_ENDS_AT, STARTER_IDS, STARTER_COUNT,
  placeFromEntry, placeFromZone, resolveToken, dayPhase, dayWord, dayRelation, differenceText, clockParts, msUntilNextMinute,
  buildCard, nextClockChange, clockChangeText, createClockChangeCache, searchPlaces, browsePlaces, defaultBoard, handoffQuery,
  NO_CHANGE_TEXT,
} from "../../assets/js/tools/world-clock/clock-engine.js";
import { getEntry, DIRECTORY } from "../../assets/js/tools/world-clock/city-directory.js";
import { wallAt } from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const utc = (y, mo, d, h = 0, mi = 0, s = 0) => Date.UTC(y, mo - 1, d, h, mi, s);
const city = (id) => placeFromEntry(getEntry(id));
const card = (nowMs, id, refZone, extra = {}) =>
  buildCard({ nowMs, place: city(id), ref: wallAt(nowMs, refZone), refLabel: "Your time", ...extra });

const NOW = utc(2026, 10, 19, 14, 20); // Monday 19 October 2026, 14:20 UTC

describe("the card: one instant, many places", () => {
  test("New York and Mumbai at 14:20 UTC: local time, date, weekday, offset", () => {
    const ny = card(NOW, "new-york-us", "Asia/Kolkata", { hour12: false });
    assert.deepEqual([ny.timeText, ny.dateText, ny.offset, ny.offsetSeconds], ["10:20", "Mon, 19 Oct 2026", "UTC−04:00", -14400]);
    const mum = card(NOW, "mumbai-in", "Asia/Kolkata", { hour12: false });
    assert.deepEqual([mum.timeText, mum.dateText, mum.offset, mum.offsetSeconds], ["19:50", "Mon, 19 Oct 2026", "UTC+05:30", 19800]);
  });

  test("12-hour display splits the digits from AM or PM and the text keeps both", () => {
    const c = card(NOW, "new-york-us", "Asia/Kolkata", { hour12: true });
    assert.deepEqual([c.timeMain, c.timeSuffix, c.timeText], ["10:20", "AM", "10:20 AM"]);
    const noon = card(utc(2026, 10, 19, 4, 0), "new-york-us", "Asia/Kolkata", { hour12: true });
    assert.equal(noon.timeText, "12:00 AM");
    assert.deepEqual(clockParts(0, 5, true), { main: "12:05", suffix: "AM", text: "12:05 AM" });
    assert.deepEqual(clockParts(13, 5, false), { main: "13:05", suffix: "", text: "13:05" });
  });

  test("the difference from the reference is exact, including 15- and 30-minute offsets", () => {
    assert.equal(card(NOW, "new-york-us", "Asia/Kolkata").differenceText, "9h 30m behind Your time");
    assert.equal(card(NOW, "dubai-ae", "Asia/Kolkata").differenceText, "1h 30m behind Your time");
    assert.equal(card(NOW, "london-gb", "Asia/Kolkata").differenceText, "4h 30m behind Your time");
    assert.equal(card(NOW, "kathmandu-np", "Asia/Kolkata").differenceText, "15m ahead of Your time");
    assert.equal(card(NOW, "mumbai-in", "Asia/Kolkata").differenceText, "Same time as Your time");
    assert.equal(card(NOW, "adelaide-au", "Asia/Kolkata").deltaSeconds, 37800 - 19800); // +10:30 in October (daylight time) against +05:30
    assert.equal(differenceText(7200, "London, United Kingdom"), "2h ahead of London, United Kingdom");
    assert.equal(differenceText(-2700, "X"), "45m behind X");
    assert.equal(differenceText(59, "X"), "Same time as X");
  });

  test("the reference card says so instead of comparing with itself", () => {
    assert.equal(card(NOW, "mumbai-in", "Asia/Kolkata", { isReference: true }).differenceText, "This is the comparison reference");
  });

  test("every card in a board reads the same instant: the isoLocal value names the instant by its own offset", () => {
    const ms = utc(2026, 10, 19, 14, 20);
    for (const id of ["new-york-us", "mumbai-in", "kathmandu-np", "lord-howe-island-au", "chatham-islands-nz"]) {
      const c = card(ms, id, "UTC");
      assert.equal(new Date(c.isoLocal).getTime(), ms, id);
    }
  });

  test("day against night is the local clock 06:00 up to 18:00, and a word", () => {
    assert.equal(DAY_STARTS_AT, 360);
    assert.equal(DAY_ENDS_AT, 1080);
    assert.deepEqual([359, 360, 1079, 1080, 0, 720].map(dayPhase), ["night", "day", "day", "night", "night", "day"]);
    assert.deepEqual([dayWord("day"), dayWord("night")], ["Daytime", "Night-time"]);
    assert.equal(card(NOW, "new-york-us", "UTC").dayWord, "Daytime");
    assert.equal(card(NOW, "mumbai-in", "UTC").dayWord, "Night-time"); // 19:50
  });

  test("the day relation compares calendar dates, not 24-hour spans, and is not capped at one day", () => {
    assert.deepEqual([0, 1, -1, 2, -3].map(dayRelation), ["Today", "Tomorrow", "Yesterday", "2 days later", "3 days earlier"]);
    const ms = utc(2026, 10, 19, 10, 0); // Kiritimati +14 reads 00:00 on the 20th, Pago Pago -11 reads 23:00 on the 18th
    const kiri = buildCard({ nowMs: ms, place: city("kiritimati-ki"), ref: wallAt(ms, "Pacific/Pago_Pago"), refLabel: "Pago Pago" });
    assert.deepEqual([kiri.dateText, kiri.dayDelta, kiri.dayRelation], ["Tue, 20 Oct 2026", 2, "2 days later"]);
    const pago = buildCard({ nowMs: ms, place: city("pago-pago-as"), ref: wallAt(ms, "Pacific/Kiritimati"), refLabel: "Kiritimati" });
    assert.deepEqual([pago.dateText, pago.dayDelta, pago.dayRelation], ["Sun, 18 Oct 2026", -2, "2 days earlier"]);
    assert.equal(pago.differenceText, "25h behind Kiritimati");
  });

  test("local midnight rolls the date and the relation, minute by minute", () => {
    const base = utc(2026, 10, 19, 18, 29); // Mumbai 23:59 on the 19th
    const before = card(base, "mumbai-in", "UTC", { hour12: false });
    const after = card(base + 60000, "mumbai-in", "UTC", { hour12: false });
    assert.deepEqual([before.timeText, before.dateText], ["23:59", "Mon, 19 Oct 2026"]);
    assert.deepEqual([after.timeText, after.dateText, after.dayRelation], ["00:00", "Tue, 20 Oct 2026", "Tomorrow"]);
  });

  test("clock changes across the ticks: New York's spring change skips 02:00 to 03:00 with the right offsets", () => {
    const at = utc(2026, 3, 8, 7, 0); // 02:00 EST becomes 03:00 EDT
    const one = card(at - 60000, "new-york-us", "UTC", { hour12: false });
    const two = card(at, "new-york-us", "UTC", { hour12: false });
    assert.deepEqual([one.timeText, one.offset], ["01:59", "UTC−05:00"]);
    assert.deepEqual([two.timeText, two.offset], ["03:00", "UTC−04:00"]);
  });

  test("odd offsets read exactly: Kathmandu, Adelaide in summer and winter, Chatham, Lord Howe, St John's, Tehran", () => {
    const check = (id, ms, expected) => assert.equal(card(ms, id, "UTC").offset, expected, `${id} ${new Date(ms).toISOString()}`);
    check("kathmandu-np", NOW, "UTC+05:45");
    check("adelaide-au", utc(2026, 1, 15), "UTC+10:30");
    check("adelaide-au", utc(2026, 7, 15), "UTC+09:30");
    check("chatham-islands-nz", utc(2026, 1, 15), "UTC+13:45");
    check("chatham-islands-nz", utc(2026, 7, 15), "UTC+12:45");
    check("lord-howe-island-au", utc(2026, 1, 15), "UTC+11:00");
    check("lord-howe-island-au", utc(2026, 7, 15), "UTC+10:30");
    check("st-john-s-ca", utc(2026, 7, 15), "UTC−02:30");
    check("st-john-s-ca", utc(2026, 1, 15), "UTC−03:30");
    check("tehran-ir", utc(2026, 1, 15), "UTC+03:30");
    check("kabul-af", NOW, "UTC+04:30");
    check("yangon-mm", NOW, "UTC+06:30");
  });

  test("a card whose zone the browser rejects throws, so the page can show that one card as unavailable", () => {
    assert.throws(() => buildCard({ nowMs: NOW, place: placeFromZone("Not/AZone"), ref: wallAt(NOW, "UTC"), refLabel: "x" }));
  });
});

describe("time: the minute timer and the clock readings", () => {
  test("msUntilNextMinute counts to the next :00 and never returns zero", () => {
    assert.equal(msUntilNextMinute(utc(2026, 10, 19, 14, 20, 0)), 60000);
    assert.equal(msUntilNextMinute(utc(2026, 10, 19, 14, 20, 59) + 999), 1);
    assert.equal(msUntilNextMinute(utc(2026, 10, 19, 14, 20, 30)), 30000);
    assert.equal(msUntilNextMinute(0), 60000);
  });
});

describe("the next clock change (optional)", () => {
  test("New York in autumn: 02:00 EDT becomes 01:00 EST on Sunday 1 November 2026", () => {
    const change = nextClockChange("America/New_York", NOW);
    assert.deepEqual(change, { atMs: utc(2026, 11, 1, 6, 0), fromOffset: -14400, toOffset: -18000 });
    assert.equal(clockChangeText(change, false), "Clocks change Sun 1 Nov: UTC−04:00 → UTC−05:00 (at 02:00)");
    assert.equal(clockChangeText(change, true), "Clocks change Sun 1 Nov: UTC−04:00 → UTC−05:00 (at 2:00 AM)");
  });

  test("London: the clocks go back at 02:00 BST on Sunday 25 October 2026", () => {
    const change = nextClockChange("Europe/London", NOW);
    assert.deepEqual(change, { atMs: utc(2026, 10, 25, 1, 0), fromOffset: 3600, toOffset: 0 });
    assert.equal(clockChangeText(change), "Clocks change Sun 25 Oct: UTC+01:00 → UTC+00:00 (at 02:00)");
  });

  test("Lord Howe changes by 30 minutes, and the answer is found to the second", () => {
    const change = nextClockChange("Australia/Lord_Howe", NOW);
    assert.deepEqual(change, { atMs: utc(2027, 4, 3, 15, 0), fromOffset: 39600, toOffset: 37800 });
  });

  test("a spring change reads the OLD clock at the jump (02:00 becomes 03:00) and a midnight change reads 00:00", () => {
    assert.equal(clockChangeText({ atMs: utc(2027, 3, 14, 7, 0), fromOffset: -18000, toOffset: -14400 }), "Clocks change Sun 14 Mar: UTC−05:00 → UTC−04:00 (at 02:00)");
    // Cuba changes at 00:00 local: the old clock reads 00:00 on that Sunday, not 23:59 on Saturday
    assert.equal(clockChangeText({ atMs: utc(2027, 3, 14, 5, 0), fromOffset: -18000, toOffset: -14400 }), "Clocks change Sun 14 Mar: UTC−05:00 → UTC−04:00 (at 00:00)");
  });

  test("a zone with no change in the window gives null and a plain statement, never a promise", () => {
    assert.equal(nextClockChange("Asia/Kolkata", NOW), null);
    assert.equal(nextClockChange("UTC", NOW), null);
    assert.equal(clockChangeText(null), NO_CHANGE_TEXT);
    assert.match(NO_CHANGE_TEXT, /this browser's data/);
  });

  test("the window is bounded: a change beyond the horizon is not reported", () => {
    assert.equal(nextClockChange("America/New_York", NOW, { horizonDays: 5 }), null);
    assert.ok(nextClockChange("America/New_York", NOW, { horizonDays: 20 }));
  });

  test("the 72-hour step cannot see a change that is undone within one step (a stated limit)", () => {
    // a zone that flips and flips back inside one step is invisible to sampling; model it with a stand-in offset function through a tiny step test
    // at a 1-hour step the same change IS found, so the limit is the step, not the algorithm
    assert.ok(nextClockChange("America/New_York", NOW, { stepHours: 1 }));
    assert.equal(nextClockChange("America/New_York", NOW, { stepHours: 1 }).atMs, nextClockChange("America/New_York", NOW).atMs);
  });

  test("the cache computes once per browser identity of a zone, shares it between spellings, and reuses it on every tick", () => {
    let calls = 0;
    const cache = createClockChangeCache((zone, from) => { calls += 1; return nextClockChange(zone, from); });
    assert.equal(cache.peek("America/New_York", NOW), undefined);
    const first = cache.get("America/New_York", NOW);
    assert.equal(first.computed, true);
    assert.equal(calls, 1);
    for (let i = 1; i <= 200; i++) assert.equal(cache.get("America/New_York", NOW + i * 60000).computed, false);
    assert.equal(calls, 1);
    assert.ok(cache.peek("America/New_York", NOW + 3600000));
    // Asia/Kolkata and Asia/Calcutta are one zone to the browser
    cache.get("Asia/Kolkata", NOW);
    cache.get("Asia/Calcutta", NOW);
    assert.equal(calls, 2);
  });

  test("the cache recomputes after the change it found has passed, and when the clock jumps back by more than a day", () => {
    let calls = 0;
    const cache = createClockChangeCache((zone, from) => { calls += 1; return nextClockChange(zone, from); });
    const found = cache.get("America/New_York", NOW).result;
    assert.equal(cache.peek("America/New_York", found.atMs - 1000) !== undefined, true);
    assert.equal(cache.peek("America/New_York", found.atMs), undefined);
    assert.equal(cache.get("America/New_York", found.atMs + 1000).computed, true);
    assert.equal(calls, 2);
    assert.equal(cache.peek("America/New_York", found.atMs - 3 * 86400000), undefined); // jumped back by days
  });

  test("a result of null is cached too, until most of the window is used", () => {
    let calls = 0;
    const cache = createClockChangeCache((zone, from) => { calls += 1; return nextClockChange(zone, from); });
    assert.equal(cache.get("Asia/Kolkata", NOW).result, null);
    assert.equal(cache.get("Asia/Kolkata", NOW + 100 * 86400000).computed, false);
    assert.equal(cache.get("Asia/Kolkata", NOW + 380 * 86400000).computed, true);
    assert.equal(calls, 2);
  });
});

describe("search over the directory and the browser's zones", () => {
  const keys = (query, options) => searchPlaces(query, options).map((p) => p.key);

  test("everyday names, old names and short aliases find the city", () => {
    assert.equal(keys("mumbai")[0], "mumbai-in");
    assert.equal(keys("bombay")[0], "mumbai-in");
    assert.equal(keys("NYC")[0], "new-york-us");
    assert.equal(keys("LA")[0], "los-angeles-us");
    assert.equal(keys("sao paulo")[0], "sao-paulo-br");
    assert.equal(keys("zürich")[0], "zurich-ch");
    assert.equal(keys("  KYIV ")[0], "kyiv-ua");
    assert.equal(keys("Calcutta")[0], "kolkata-in");
  });

  test("a short alias matches only exactly, so 'la' does not claim every name that contains it", () => {
    const found = keys("la");
    assert.equal(found[0], "los-angeles-us");
    assert.ok(!found.includes("dallas-us") && !found.includes("atlanta-us"));
  });

  test("a country name finds its cities, ranked after exact and prefix city matches", () => {
    const india = keys("india");
    assert.ok(india.includes("mumbai-in") && india.includes("kolkata-in") && india.includes("bengaluru-in"));
    // the directory's Indian cities come first; room left over goes to browser zones whose name contains "india" (America/Indiana/...)
    const cities = india.filter((k) => !k.includes("/"));
    assert.ok(cities.length >= 8 && cities.every((k) => k.endsWith("-in")));
    assert.deepEqual(india, [...cities, ...india.filter((k) => k.includes("/"))]);
  });

  test("two cities with one name are both returned, the better-known first, and are told apart by country", () => {
    const found = searchPlaces("london");
    assert.deepEqual(found.map((p) => p.key), ["london-gb", "london-ca"]);
    assert.deepEqual(found.map((p) => p.label), ["London, United Kingdom", "London, Canada"]);
    assert.deepEqual(searchPlaces("birmingham").map((p) => p.label), ["Birmingham, United Kingdom", "Birmingham, United States"]);
  });

  test("a region narrows the directory results and hides the zone fallback", () => {
    assert.deepEqual(keys("london", { region: "Europe" }), ["london-gb"]);
    assert.deepEqual(keys("london", { region: "Americas" }), ["london-ca"]);
    assert.deepEqual(keys("knox", { region: "Americas" }), []);
  });

  test("the zone fallback adds zones no listed city covers, and leaves out the ones a city already does", () => {
    const knox = searchPlaces("indiana knox");
    assert.equal(knox[0].kind, "zone");
    assert.equal(knox[0].key, "America/Indiana/Knox");
    assert.equal(knox[0].subtitle, "America/Indiana/Knox");
    // America/Chicago is Chicago's zone: it is not offered a second time as a bare zone
    assert.ok(!searchPlaces("chicago").some((p) => p.kind === "zone" && p.zone === "America/Chicago"));
    // the old spelling finds the city, not a duplicate zone
    assert.ok(!searchPlaces("calcutta").some((p) => p.kind === "zone"));
  });

  test("an empty or unmatched query gives nothing, and the cap holds", () => {
    assert.deepEqual(searchPlaces(""), []);
    assert.deepEqual(searchPlaces("   "), []);
    assert.deepEqual(searchPlaces("zzzzqqqq"), []);
    assert.ok(searchPlaces("a").length <= MAX_RESULTS);
    assert.ok(searchPlaces("south", { limit: 3 }).length <= 3);
  });

  test("an empty directory still searches the browser's zones (the board does not depend on the list)", () => {
    const found = searchPlaces("kolkata", { directory: [] });
    assert.ok(found.length > 0 && found.every((p) => p.kind === "zone"));
    assert.ok(found.some((p) => /Kolkata|Calcutta/.test(p.zone)));
  });

  test("browsing a region lists its cities alphabetically, capped, with the full count", () => {
    const all = browsePlaces("Oceania", { limit: 1000 });
    assert.equal(all.places.length, all.total);
    const titles = all.places.map((p) => p.title);
    assert.deepEqual(titles, [...titles].sort((a, b) => a.localeCompare(b, "en")));
    const capped = browsePlaces("Asia", { limit: 5 });
    assert.equal(capped.places.length, 5);
    assert.ok(capped.total > 5);
  });
});

describe("tokens, the starter board and the hand-off to the Time Zone Converter", () => {
  test("resolveToken accepts a directory id or a browser zone and nothing else", () => {
    assert.equal(resolveToken("mumbai-in").key, "mumbai-in");
    assert.equal(resolveToken("Asia/Kolkata").kind, "zone");
    assert.equal(resolveToken("UTC").kind, "zone");
    for (const bad of ["", " ", "Mumbai", "mumbai", "mumbai-xx", "__proto__", "constructor", "toString", "a/../b", "Not/AZone", "+05:30", "<img src=x onerror=1>", "x".repeat(70), 5, null, undefined]) {
      assert.equal(resolveToken(bad), null, String(bad));
    }
  });

  test("the starter board takes the first four starter cities that do not keep the visitor's own clock", () => {
    const ids = (here) => defaultBoard(here).map((p) => p.key);
    assert.deepEqual(STARTER_IDS.slice(0, STARTER_COUNT), ["new-york-us", "london-gb", "dubai-ae", "singapore-sg"]);
    assert.deepEqual(ids("Asia/Kolkata"), ["new-york-us", "london-gb", "dubai-ae", "singapore-sg"]);
    assert.deepEqual(ids("Asia/Calcutta"), ids("Asia/Kolkata"));
    assert.deepEqual(ids("America/New_York"), ["london-gb", "dubai-ae", "singapore-sg", "sydney-au"]);
    assert.deepEqual(ids("Europe/London"), ["new-york-us", "dubai-ae", "singapore-sg", "sydney-au"]);
    assert.deepEqual(ids("Asia/Dubai"), ["new-york-us", "london-gb", "singapore-sg", "sydney-au"]);
    assert.equal(defaultBoard("UTC").length, STARTER_COUNT);
    assert.ok(defaultBoard("UTC").length <= MAX_CITIES);
  });

  test("the hand-off to the Time Zone Converter names the visitor's zone and up to five other distinct zones", () => {
    const places = ["new-york-us", "mumbai-in", "delhi-in", "london-gb", "dubai-ae", "singapore-sg", "sydney-au", "tokyo-jp"].map(city);
    assert.equal(
      handoffQuery(places, "Asia/Kolkata"),
      "?from=Asia/Kolkata&to=America/New_York,Europe/London,Asia/Dubai,Asia/Singapore,Australia/Sydney"
    );
    assert.equal(handoffQuery([], "Asia/Kolkata"), "?from=Asia/Kolkata");
    // a board city in the visitor's own zone is not a destination
    assert.equal(handoffQuery([city("delhi-in")], "Asia/Calcutta"), "?from=Asia/Calcutta");
  });

  test("the directory is used by id and a Map lookup: hostile ids find nothing", () => {
    for (const bad of ["__proto__", "constructor", "hasOwnProperty"]) assert.equal(getEntry(bad), null);
    assert.ok(DIRECTORY.length >= 150);
  });
});
