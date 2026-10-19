/**
 * World Clock (Tool Pack 28): what a typed query means (refinement of 2026-10-19).
 *
 * The first release matched words inside other words ("usa" found Jerusalem and Lusaka), took "uk" for Ukraine, let "india" find
 * America/Indiana, and returned zone fragments for continent words. These tests pin the corrected behaviour: explicit, predictable
 * matching; countries by name, alias or code; continent words as regional lists; abbreviations explained instead of guessed;
 * a country's own time zones from the lazily loaded country data; and the row details (time, offset) shown beside results.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  runSearch, searchPlaces, countryPlaces, countriesIn, resolveCountry, countryLabel, describeRow, displayZone, placeFromZone, handoffQuery,
  warmZoneList, warmDirectory, abbreviationNote, MAX_BROWSE,
} from "../../assets/js/tools/world-clock/clock-engine.js";
import {
  DIRECTORY, COUNTRY_ALIASES, COUNTRY_NAMES, ABBREVIATIONS, REGIONS, normalizeText, regionsForWord, searchDirectory,
} from "../../assets/js/tools/world-clock/city-directory.js";
import * as countryData from "../../assets/js/tools/world-clock/country-zones.js";
import { canonicalZone } from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const utc = (y, mo, d, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h, mi);
const keys = (r) => r.places.map((p) => p.key);
const ids = (q, opts) => searchPlaces(q, { countryData, ...opts }).map((p) => p.key);

describe("false matches are gone", () => {
  test("'usa' is the United States, not Jerusalem or Lusaka; 'uk' is the United Kingdom, not Ukraine", () => {
    const usa = runSearch("usa", { countryData });
    assert.equal(usa.mode, "country");
    assert.equal(usa.country, "US");
    assert.ok(keys(usa).includes("new-york-us") && keys(usa).includes("honolulu-us"));
    assert.ok(!keys(usa).some((k) => k === "jerusalem-il" || k === "lusaka-zm"));
    const uk = runSearch("UK", { countryData });
    assert.deepEqual([uk.mode, uk.country], ["country", "GB"]);
    assert.deepEqual(keys(uk).slice(0, 3), ["london-gb", "birmingham-gb", "edinburgh-gb"]);
    assert.ok(!keys(uk).includes("kyiv-ua"));
  });

  test("a short word is never found inside another word: three letters match only the start of a word or exactly, never the middle", () => {
    assert.deepEqual(searchDirectory("usa").map((e) => e.id), []);
    assert.ok(!searchDirectory("uk").some((e) => e.id === "kyiv-ua"));
    assert.ok(!searchDirectory("ist").some((e) => e.id === "kiritimati-ki"), "'ist' is inside 'christmas island'");
    // the middle of a longer word still matches from four letters
    assert.ok(searchDirectory("alem").some((e) => e.id === "jerusalem-il"));
    // the start of a word matches from three letters, as autocomplete needs
    assert.ok(searchDirectory("lus").some((e) => e.id === "lusaka-zm"));
    assert.ok(searchDirectory("aus").some((e) => e.country === "AU") && searchDirectory("aus").some((e) => e.country === "AT"));
  });

  test("'india' is the country: its cities and nothing from America/Indiana; a half-typed 'indi' may still look further", () => {
    const india = runSearch("india", { countryData });
    assert.equal(india.mode, "country");
    assert.ok(keys(india).length >= 8 && keys(india).every((k) => k.endsWith("-in")));
    assert.equal(india.header, "India · 1 time zone");
  });

  test("abbreviations are not searched; the answer explains why and names no place", () => {
    for (const word of ["IST", "est", "PST", "CST", "bst", "cet", "jst", "AEST", "msk"]) {
      const r = runSearch(word, { countryData });
      assert.equal(r.mode, "abbreviation", word);
      assert.deepEqual(r.places, [], word);
      assert.match(r.note, /time-zone abbreviation/);
      assert.match(r.note, /several places/);
    }
    assert.equal(abbreviationNote("x".repeat(50)).startsWith(`"${"x".repeat(12)}"`), true, "the typed text is clipped, not echoed whole");
    // UTC is a real zone name and still works; a longer word that starts like an abbreviation is an ordinary search
    assert.equal(runSearch("UTC", { countryData }).mode, "cities");
    assert.ok(ids("istanbul").includes("istanbul-tr"));
    assert.ok(ids("estonia").includes("tallinn-ee"));
    assert.ok([...ABBREVIATIONS].every((a) => a === normalizeText(a) && a.length >= 3 && a.length <= 4));
  });
});

describe("country names, aliases and codes", () => {
  test("every alias is already normalised, points at one real country, and no alias hides a listed city", () => {
    const cities = new Set(DIRECTORY.flatMap((e) => [e.city, ...e.aliases].map(normalizeText)));
    for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) {
      assert.equal(normalizeText(alias), alias, alias);
      assert.ok(COUNTRY_NAMES[code], `${alias} -> ${code} has no country name`);
      assert.equal(resolveCountry(alias), code, alias);
      assert.ok(!cities.has(alias), `${alias} is also a city name`);
    }
    for (const must of ["usa", "uk", "uae", "england", "great britain", "holland", "czech republic", "burma", "u k", "u s a"]) assert.ok(must in COUNTRY_ALIASES, must);
  });

  test("the aliases the audit named find the right country", () => {
    const want = { USA: "US", UK: "GB", UAE: "AE", England: "GB", "Great Britain": "GB", Holland: "NL", "Czech Republic": "CZ", Burma: "MM", "U.K.": "GB", "U.S.A.": "US", "Ivory Coast": "CI", "Côte d'Ivoire": "CI", Türkiye: "TR" };
    for (const [typed, code] of Object.entries(want)) assert.equal(runSearch(typed, { countryData }).country, code, typed);
  });

  test("a name that could mean two countries is not an alias: 'korea' is found by prefix, not claimed", () => {
    assert.ok(!("korea" in COUNTRY_ALIASES));
    assert.ok(!("georgia" in COUNTRY_ALIASES));
    assert.equal(runSearch("korea", { countryData }).mode, "cities");
    assert.ok(ids("korea").includes("seoul-kr"));
  });

  test("countries are found by their full name or an alias, never by a bare two-letter code; countries without a listed city need the country data", () => {
    assert.equal(resolveCountry("kenya"), "KE");
    assert.equal(resolveCountry("ke"), null, "a bare code is not a country query");
    assert.equal(resolveCountry("la", countryData), null, "'la' is Los Angeles, not Laos");
    assert.equal(runSearch("la", { countryData }).mode, "cities");
    assert.equal(keys(runSearch("la", { countryData }))[0], "los-angeles-us");
    assert.equal(resolveCountry("us"), "US");
    assert.equal(resolveCountry("botswana"), null, "no listed city and no data yet");
    assert.equal(resolveCountry("botswana", countryData), "BW");
    assert.equal(resolveCountry("xx", countryData), null);
    assert.equal(countryLabel("IN"), "India");
    assert.equal(countryLabel("BW"), "Botswana");
    assert.equal(countryLabel("ZZ"), "ZZ");
  });
});

describe("continents are filters, not zone fragments", () => {
  test("a continent word lists that region's cities, with a count and no IANA path fragments", () => {
    for (const [word, region] of [["asia", "Asia"], ["Europe", "Europe"], ["AFRICA", "Africa"], ["oceania", "Oceania"], ["north america", "North America"], ["South America", "South America"]]) {
      const r = runSearch(word, { countryData });
      assert.equal(r.mode, "region", word);
      assert.ok(r.places.length > 10 && r.places.every((p) => p.kind === "city"), word);
      assert.equal(r.total, DIRECTORY.filter((e) => e.region === region).length, word);
      assert.equal(r.header, `${region} · ${r.total} listed cities`, word);
      assert.ok(keys(r).every((k) => DIRECTORY.find((e) => e.id === k).region === region), word);
    }
  });

  test("'americas' means both American regions", () => {
    assert.deepEqual(regionsForWord("americas"), ["North America", "South America"]);
    const r = runSearch("americas", { countryData });
    assert.equal(r.total, DIRECTORY.filter((e) => e.region === "North America" || e.region === "South America").length);
    assert.match(r.header, /^North America and South America ·/);
  });

  test("the regions are exactly the six the page offers, each with at least ten listed cities", () => {
    assert.equal(REGIONS.length, 6);
    for (const region of REGIONS) assert.ok(DIRECTORY.filter((e) => e.region === region).length >= 10, region);
  });
});

describe("a country with several time zones", () => {
  test("Australia: the listed cities first, then the other zones IANA lists for it, each described; the header counts distinct zones", () => {
    const au = runSearch("Australia", { countryData });
    assert.equal(au.mode, "country");
    const cities = au.places.filter((p) => p.kind === "city");
    const zones = au.places.filter((p) => p.kind === "zone");
    assert.ok(cities.length >= 9);
    assert.deepEqual(au.places.slice(0, cities.length).map((p) => p.kind), cities.map(() => "city"), "cities come first");
    assert.ok(zones.some((p) => p.zone === "Australia/Eucla") && zones.some((p) => p.zone === "Australia/Broken_Hill"));
    assert.ok(zones.every((p) => p.note && p.country === "AU"), "every extra zone carries zone.tab's own description");
    assert.equal(au.header, "Australia · 12 time zones");
    const distinct = new Set(au.places.map((p) => canonicalZone(p.zone)));
    assert.equal(distinct.size, 12);
  });

  test("the United States: 29 zones, 20 listed cities first, then the rest; the full list is available beyond the first ten", () => {
    const us = runSearch("united states", { countryData, cap: 10 });
    assert.equal(us.places.length, 10);
    assert.equal(us.total, 20 + (29 - 8));
    assert.equal(us.header, "United States · 29 time zones");
    const all = runSearch("united states", { countryData });
    assert.equal(all.places.length, all.total);
    assert.ok(all.places.some((p) => p.zone === "America/Boise" && /Mountain/.test(p.note)));
    assert.ok(all.total <= MAX_BROWSE);
  });

  test("Russia, Canada, Brazil: many zones, few listed cities, all reachable", () => {
    assert.equal(runSearch("russia", { countryData }).header, "Russia · 26 time zones");
    assert.equal(runSearch("canada", { countryData }).header, "Canada · 23 time zones");
    assert.equal(runSearch("brazil", { countryData }).header, "Brazil · 16 time zones");
  });

  test("a country with no listed city shows its zones (Botswana), and without the data only a country with listed cities is understood", () => {
    const bw = runSearch("botswana", { countryData });
    assert.deepEqual([bw.mode, bw.places.map((p) => p.zone)], ["country", ["Africa/Gaborone"]]);
    assert.equal(runSearch("botswana").mode, "cities");
    assert.deepEqual(keys(runSearch("botswana")), []);
    const noData = runSearch("australia");
    assert.equal(noData.mode, "country");
    assert.ok(noData.places.every((p) => p.kind === "city"));
    assert.match(noData.header, /listed cities only/);
  });

  test("countryPlaces keeps IANA's own relationship: every zone it returns is listed for that country in the country data", () => {
    for (const code of ["AU", "US", "RU", "BR", "ID", "MX", "CA", "AR", "KZ", "CL"]) {
      const found = countryPlaces(code, { countryData });
      const listed = new Set(countryData.COUNTRY_ZONES[code].map((item) => item.split("|")[0]));
      for (const place of [...found.cities, ...found.zones]) assert.ok(listed.has(place.zone) || DIRECTORY.some((e) => e.id === place.key && e.country === code), `${code} ${place.zone}`);
    }
  });
});

describe("regions and countries for browsing", () => {
  test("countriesIn lists the countries that have a zone in a region (the United States and Chile appear in Oceania for Hawaii and Easter Island)", () => {
    const names = (region) => countriesIn(region, countryData).map((c) => c.name);
    const oceania = names("Oceania");
    for (const n of ["Australia", "New Zealand", "Fiji", "United States", "Chile"]) assert.ok(oceania.includes(n), n);
    assert.ok(!oceania.includes("Mexico"));
    const sa = names("South America");
    for (const n of ["Brazil", "Argentina", "Peru", "Chile"]) assert.ok(sa.includes(n), n);
    assert.ok(!sa.includes("Mexico") && !sa.includes("United States"));
    assert.ok(names("North America").includes("Mexico") && names("North America").includes("Canada"));
    assert.ok(names(null).length > 200);
    assert.deepEqual(names("Asia"), [...names("Asia")].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)), "sorted by name");
    assert.deepEqual(countriesIn("Asia", null), [], "no data, no list");
  });
});

describe("what a row shows", () => {
  const NOW = utc(2026, 10, 19, 14, 20);

  test("local time, weekday and UTC offset at one instant, in 12 or 24 hours", () => {
    const sydney = DIRECTORY.find((e) => e.id === "sydney-au");
    const p = { zone: sydney.zone };
    assert.deepEqual(describeRow(p, NOW, true), { time: "1:20 AM", weekday: "Tue", offset: "UTC+11:00", dayNumber: describeRow(p, NOW).dayNumber });
    assert.equal(describeRow(p, NOW, false).time, "01:20");
    assert.equal(describeRow({ zone: "Asia/Kathmandu" }, NOW).offset, "UTC+05:45");
    assert.equal(describeRow({ zone: "America/St_Johns" }, utc(2026, 7, 15)).offset, "UTC−02:30");
    assert.equal(describeRow({ zone: "Not/AZone" }, NOW), null);
  });

  test("the day number lets the page show a weekday only where the date differs from the visitor's", () => {
    const here = describeRow({ zone: "Asia/Kolkata" }, NOW).dayNumber;
    assert.equal(describeRow({ zone: "Australia/Sydney" }, NOW).dayNumber - here, 1);
    assert.equal(describeRow({ zone: "America/New_York" }, NOW).dayNumber - here, 0);
  });
});

describe("the modern name for the old spellings", () => {
  test("the page shows Asia/Kolkata for Asia/Calcutta without changing the zone's identity", () => {
    assert.equal(displayZone("Asia/Calcutta"), "Asia/Kolkata");
    assert.equal(displayZone("Europe/Kiev"), "Europe/Kyiv");
    assert.equal(displayZone("Asia/Kolkata"), "Asia/Kolkata");
    assert.equal(displayZone("America/New_York"), "America/New_York");
    const p = placeFromZone("Asia/Calcutta");
    assert.deepEqual([p.title, p.subtitle, p.label, p.key, p.zone], ["Kolkata", "Asia/Kolkata", "Asia/Kolkata", "Asia/Calcutta", "Asia/Calcutta"]);
    // the hand-off still names the zone the browser knows
    assert.equal(handoffQuery([p], "Europe/London"), "?from=Europe/London&to=Asia/Calcutta");
  });
});

describe("warming the search", () => {
  test("warmed structures make the first search fast; an unwarmed search still works (just slower the first time)", () => {
    const cold = [...DIRECTORY];
    let t = performance.now();
    const a = searchPlaces("london", { directory: cold });
    const coldMs = performance.now() - t;
    assert.ok(a.length > 0);
    const warmed = [...DIRECTORY];
    assert.ok(warmZoneList() > 50);
    assert.equal(warmDirectory(warmed), DIRECTORY.length);
    t = performance.now();
    const b = searchPlaces("london", { directory: warmed });
    const warmedMs = performance.now() - t;
    assert.deepEqual(b.map((p) => p.key), a.map((p) => p.key));
    assert.ok(warmedMs <= coldMs || warmedMs < 15, `warmed ${warmedMs.toFixed(1)} ms, unwarmed ${coldMs.toFixed(1)} ms`);
    assert.ok(warmedMs < 25, `a warmed first search took ${warmedMs.toFixed(1)} ms`);
  });
});
