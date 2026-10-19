/**
 * World Clock (Tool Pack 28): the country data the page loads when a country or region is searched or browsed.
 *
 * assets/js/tools/world-clock/country-zones.js is PRODUCT data, generated from the IANA zone.tab by
 * scripts/world-clock/generate-country-zones.py. tests/fixtures/zone-country.json is the pinned TEST record of the same relationships.
 * These tests hold the product file to the fixture: every country, every zone, nothing added and nothing missing.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import { TZDATA, COUNTRY_ZONES } from "../../assets/js/tools/world-clock/country-zones.js";
import { regionOf, REGIONS } from "../../assets/js/tools/world-clock/city-directory.js";
import { isValidZone } from "../../assets/js/tools/time-zone-converter/time-zone-engine.js";

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const snapshot = JSON.parse(fs.readFileSync(path.join(PROJECT, "tests", "fixtures", "zone-country.json"), "utf8"));
const FILE = path.join(PROJECT, "assets", "js", "tools", "world-clock", "country-zones.js");

const zoneOf = (item) => item.split("|")[0];

describe("the product data matches the pinned IANA record", () => {
  test("it comes from the same tzdata release as the fixture", () => {
    assert.equal(TZDATA, snapshot.tzdata);
    assert.match(fs.readFileSync(FILE, "utf8"), /GENERATED from the IANA zone\.tab in tzdata/);
  });

  test("the same countries, each with exactly the zones the fixture lists for it (none added, none missing)", () => {
    const fromFixture = {};
    for (const [zone, codes] of Object.entries(snapshot.zones)) for (const code of codes) (fromFixture[code] ||= []).push(zone);
    assert.deepEqual(Object.keys(COUNTRY_ZONES).sort(), Object.keys(fromFixture).sort());
    for (const [code, items] of Object.entries(COUNTRY_ZONES)) {
      assert.deepEqual(items.map(zoneOf).sort(), fromFixture[code].sort(), code);
    }
  });

  test("every country code is a real ISO code, and every zone is one this runtime accepts", () => {
    for (const [code, items] of Object.entries(COUNTRY_ZONES)) {
      assert.ok(snapshot.countries.includes(code), code);
      assert.ok(items.length >= 1, code);
      for (const item of items) assert.ok(isValidZone(zoneOf(item)), `${code} ${item}`);
    }
  });
});

describe("the descriptions", () => {
  test("zone.tab's own words are kept, only where it gives them, and never contain the separator", () => {
    const all = Object.values(COUNTRY_ZONES).flat();
    const noted = all.filter((item) => item.includes("|"));
    assert.ok(noted.length >= 150, `${noted.length} described zones`);
    for (const item of all) assert.equal(item.split("|").length <= 2, true, item);
    for (const item of noted) assert.ok(item.split("|")[1].trim() === item.split("|")[1] && item.split("|")[1].length > 0, item);
    const find = (code, zone) => COUNTRY_ZONES[code].find((item) => item.startsWith(`${zone}|`));
    assert.equal(find("US", "America/New_York"), "America/New_York|Eastern (most areas)");
    assert.equal(find("AU", "Australia/Sydney"), "Australia/Sydney|New South Wales (most areas)");
    assert.match(find("ID", "Asia/Makassar"), /Bali/);
  });

  test("a country with several zones describes them; a country with one zone needs no description", () => {
    for (const code of ["US", "AU", "CA", "BR", "RU", "MX", "ID", "AR"]) {
      assert.ok(COUNTRY_ZONES[code].length >= 3 && COUNTRY_ZONES[code].every((item) => item.includes("|") || code === "AR"), code);
    }
    assert.deepEqual(COUNTRY_ZONES.IN, ["Asia/Kolkata"]);
    assert.deepEqual(COUNTRY_ZONES.GB, ["Europe/London"]);
  });
});

describe("regions follow the zone (and, in the Americas, the country)", () => {
  test("every zone has a region except Antarctica and the Kerguelen islands, which belong to no region of this list", () => {
    const none = [];
    for (const [code, items] of Object.entries(COUNTRY_ZONES)) for (const item of items) {
      const zone = zoneOf(item);
      const region = regionOf(zone, code);
      if (region === "") none.push(zone);
      else assert.ok(REGIONS.includes(region), `${zone} -> ${region}`);
    }
    assert.ok(none.every((zone) => zone.startsWith("Antarctica/") || zone === "Indian/Kerguelen"), none.join(", "));
  });

  test("hand-checked: South America by country, North America for the rest of America/, islands by hand", () => {
    assert.equal(regionOf("America/Sao_Paulo", "BR"), "South America");
    assert.equal(regionOf("America/Argentina/Buenos_Aires", "AR"), "South America");
    assert.equal(regionOf("America/Mexico_City", "MX"), "North America");
    assert.equal(regionOf("America/Panama", "PA"), "North America");
    assert.equal(regionOf("America/Havana", "CU"), "North America");
    assert.equal(regionOf("Pacific/Honolulu", "US"), "Oceania");
    assert.equal(regionOf("Pacific/Galapagos", "EC"), "Oceania");
    assert.equal(regionOf("Atlantic/Azores", "PT"), "Europe");
    assert.equal(regionOf("Atlantic/Cape_Verde", "CV"), "Africa");
    assert.equal(regionOf("Indian/Maldives", "MV"), "Asia");
    assert.equal(regionOf("Europe/Istanbul", "TR"), "Europe");
    assert.equal(regionOf("Asia/Nicosia", "CY"), "Asia");
  });
});

describe("it is small and only loaded when needed", () => {
  test("under 20 KB raw and 7 KB gzip, and the generator that makes it is in the repository", () => {
    const raw = fs.readFileSync(FILE);
    assert.ok(raw.length < 20000, `${raw.length} bytes raw`);
    assert.ok(zlib.gzipSync(raw, { level: 9 }).length < 7000);
    assert.ok(fs.existsSync(path.join(PROJECT, "scripts", "world-clock", "generate-country-zones.py")));
  });

  test("the tool's own scripts load it by a dynamic import, never a static one, so it costs nothing until a country is searched", () => {
    const index = fs.readFileSync(path.join(PROJECT, "assets", "js", "tools", "world-clock", "index.js"), "utf8");
    const engine = fs.readFileSync(path.join(PROJECT, "assets", "js", "tools", "world-clock", "clock-engine.js"), "utf8");
    assert.match(index, /import\("\.\/country-zones\.js"\)/);
    assert.doesNotMatch(index + engine, /^import[^;]*country-zones/m);
  });
});
