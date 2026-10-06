/**
 * Tool Pack 16: Unix Timestamp Converter, the engine (assets/js/tools/unix-timestamp-converter/timestamp-engine.js).
 *
 * The GOLDEN values were produced by an INDEPENDENT reference, tests/fixtures/unix-timestamp-golden.py (Python datetime and zoneinfo,
 * fixed dates only) and are pinned here as literals; they share no code with the engine. Native Date is a second oracle for UTC.
 * Time-zone cases need the runtime's tz database to agree with the reference's for these fixed past dates, which it does.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  parseEpochText, detectUnit, resolveEpoch, epochToNs, formatUtcIso, formatUnix, splitNs, describeInZone, offsetSecondsAt,
  relativeText, relativeToNow, parseDateTimeText, dateTimeToInstants, resolveWallTime, extractBatch, convertBatch, batchToTsv,
  nowUnix, msToNextSecond, isValidZone, listZones, localZone, inRange,
  MIN_NS, MAX_NS, BATCH_MAX_ENTRIES, BATCH_MAX_CHARS, UNIT_LABEL,
} from "../../assets/js/tools/unix-timestamp-converter/timestamp-engine.js";

const GOLDEN = {
  instants: [
    {"ns":"0","utc":"1970-01-01T00:00:00Z","zone":"UTC","iso":"1970-01-01T00:00:00+00:00","offset":0},
    {"ns":"1700000000000000000","utc":"2023-11-14T22:13:20Z","zone":"UTC","iso":"2023-11-14T22:13:20+00:00","offset":0},
    {"ns":"1700000000000000000","utc":"2023-11-14T22:13:20Z","zone":"Asia/Kolkata","iso":"2023-11-15T03:43:20+05:30","offset":19800},
    {"ns":"1700000000000000000","utc":"2023-11-14T22:13:20Z","zone":"America/New_York","iso":"2023-11-14T17:13:20-05:00","offset":-18000},
    {"ns":"1700000000000000000","utc":"2023-11-14T22:13:20Z","zone":"Europe/London","iso":"2023-11-14T22:13:20+00:00","offset":0},
    {"ns":"1700000000000000000","utc":"2023-11-14T22:13:20Z","zone":"Australia/Lord_Howe","iso":"2023-11-15T09:13:20+11:00","offset":39600},
    {"ns":"1700000000000000000","utc":"2023-11-14T22:13:20Z","zone":"Asia/Kathmandu","iso":"2023-11-15T03:58:20+05:45","offset":20700},
    {"ns":"1700000000123456789","utc":"2023-11-14T22:13:20.123456789Z","zone":"Asia/Tokyo","iso":"2023-11-15T07:13:20.123456789+09:00","offset":32400},
    {"ns":"-1000000000","utc":"1969-12-31T23:59:59Z","zone":"UTC","iso":"1969-12-31T23:59:59+00:00","offset":0},
    {"ns":"-1000000000","utc":"1969-12-31T23:59:59Z","zone":"Asia/Kolkata","iso":"1970-01-01T05:29:59+05:30","offset":19800},
    {"ns":"-1000000000000000000","utc":"1938-04-24T22:13:20Z","zone":"UTC","iso":"1938-04-24T22:13:20+00:00","offset":0},
    {"ns":"-1000000000000000000","utc":"1938-04-24T22:13:20Z","zone":"America/New_York","iso":"1938-04-24T18:13:20-04:00","offset":-14400},
    {"ns":"-1000000000000000000","utc":"1938-04-24T22:13:20Z","zone":"Europe/London","iso":"1938-04-24T23:13:20+01:00","offset":3600},
    {"ns":"-1500000000","utc":"1969-12-31T23:59:58.5Z","zone":"UTC","iso":"1969-12-31T23:59:58.5+00:00","offset":0},
    {"ns":"-62135596800000000000","utc":"0001-01-01T00:00:00Z","zone":"UTC","iso":"0001-01-01T00:00:00+00:00","offset":0},
    {"ns":"-62135596800000000000","utc":"0001-01-01T00:00:00Z","zone":"Asia/Kolkata","iso":"0001-01-01T05:53:28+05:53:28","offset":21208},
    {"ns":"253402300799999999999","utc":"9999-12-31T23:59:59.999999999Z","zone":"UTC","iso":"9999-12-31T23:59:59.999999999+00:00","offset":0},
    {"ns":"253402300799000000000","utc":"9999-12-31T23:59:59Z","zone":"America/New_York","iso":"9999-12-31T18:59:59-05:00","offset":-18000},
    {"ns":"2147483647000000000","utc":"2038-01-19T03:14:07Z","zone":"UTC","iso":"2038-01-19T03:14:07+00:00","offset":0},
    {"ns":"2147483648000000000","utc":"2038-01-19T03:14:08Z","zone":"UTC","iso":"2038-01-19T03:14:08+00:00","offset":0},
    {"ns":"4102444800000000000","utc":"2100-01-01T00:00:00Z","zone":"UTC","iso":"2100-01-01T00:00:00+00:00","offset":0},
    {"ns":"32503680000000000000","utc":"3000-01-01T00:00:00Z","zone":"Europe/London","iso":"3000-01-01T00:00:00+00:00","offset":0},
    {"ns":"1678604399000000000","utc":"2023-03-12T06:59:59Z","zone":"America/New_York","iso":"2023-03-12T01:59:59-05:00","offset":-18000},
    {"ns":"1678604400000000000","utc":"2023-03-12T07:00:00Z","zone":"America/New_York","iso":"2023-03-12T03:00:00-04:00","offset":-14400},
    {"ns":"1699163999000000000","utc":"2023-11-05T05:59:59Z","zone":"America/New_York","iso":"2023-11-05T01:59:59-04:00","offset":-14400},
    {"ns":"1699164000000000000","utc":"2023-11-05T06:00:00Z","zone":"America/New_York","iso":"2023-11-05T01:00:00-05:00","offset":-18000},
    {"ns":"1679792400000000000","utc":"2023-03-26T01:00:00Z","zone":"Europe/London","iso":"2023-03-26T02:00:00+01:00","offset":3600},
    {"ns":"1698544800000000000","utc":"2023-10-29T02:00:00Z","zone":"Europe/Paris","iso":"2023-10-29T03:00:00+01:00","offset":3600},
  ],
  local: [
    {"wall":"2023-11-14T22:13:20","zone":"UTC","kind":"unique","instants":[{"seconds":1700000000,"offset":0}]},
    {"wall":"2023-11-14T22:13:20","zone":"Asia/Kolkata","kind":"unique","instants":[{"seconds":1699980200,"offset":19800}]},
    {"wall":"2023-03-12T02:30:00","zone":"Asia/Kolkata","kind":"unique","instants":[{"seconds":1678568400,"offset":19800}]},
    {"wall":"2023-03-12T02:30:00","zone":"America/New_York","kind":"gap","instants":[]},
    {"wall":"2023-03-12T01:59:59","zone":"America/New_York","kind":"unique","instants":[{"seconds":1678604399,"offset":-18000}]},
    {"wall":"2023-03-12T03:00:00","zone":"America/New_York","kind":"unique","instants":[{"seconds":1678604400,"offset":-14400}]},
    {"wall":"2023-11-05T01:30:00","zone":"America/New_York","kind":"overlap","instants":[{"seconds":1699162200,"offset":-14400},{"seconds":1699165800,"offset":-18000}]},
    {"wall":"2023-11-05T00:59:59","zone":"America/New_York","kind":"unique","instants":[{"seconds":1699160399,"offset":-14400}]},
    {"wall":"2023-11-05T02:00:00","zone":"America/New_York","kind":"unique","instants":[{"seconds":1699167600,"offset":-18000}]},
    {"wall":"2023-03-26T01:30:00","zone":"Europe/London","kind":"gap","instants":[]},
    {"wall":"2023-10-29T01:30:00","zone":"Europe/London","kind":"overlap","instants":[{"seconds":1698539400,"offset":3600},{"seconds":1698543000,"offset":0}]},
    {"wall":"2023-03-26T02:30:00","zone":"Europe/Paris","kind":"gap","instants":[]},
    {"wall":"2023-10-29T02:30:00","zone":"Europe/Paris","kind":"overlap","instants":[{"seconds":1698539400,"offset":7200},{"seconds":1698543000,"offset":3600}]},
    {"wall":"2023-10-01T02:30:00","zone":"Australia/Sydney","kind":"gap","instants":[]},
    {"wall":"2024-04-07T02:30:00","zone":"Australia/Sydney","kind":"overlap","instants":[{"seconds":1712417400,"offset":39600},{"seconds":1712421000,"offset":36000}]},
    {"wall":"2023-10-01T02:15:00","zone":"Australia/Lord_Howe","kind":"gap","instants":[]},
    {"wall":"2023-04-02T01:45:00","zone":"Australia/Lord_Howe","kind":"overlap","instants":[{"seconds":1680360300,"offset":39600},{"seconds":1680362100,"offset":37800}]},
    {"wall":"1969-12-31T23:59:59","zone":"UTC","kind":"unique","instants":[{"seconds":-1,"offset":0}]},
    {"wall":"1938-04-24T17:13:20","zone":"America/New_York","kind":"unique","instants":[{"seconds":-1000003600,"offset":-14400}]},
  ],
  parse: [
    {"text":"2023-11-14T22:13:20Z","ns":"1700000000000000000"},
    {"text":"2023-11-14T22:13:20+05:30","ns":"1699980200000000000"},
    {"text":"2023-11-14T22:13:20-08:00","ns":"1700028800000000000"},
    {"text":"2023-11-14T22:13:20.123456+00:00","ns":"1700000000123456000"},
    {"text":"2023-11-14T00:00:00+00:00","ns":"1699920000000000000"},
    {"text":"Tue, 14 Nov 2023 22:13:20 +0000","ns":"1700000000000000000"},
    {"text":"Wed, 15 Nov 2023 03:43:20 +0530","ns":"1700000000000000000"},
    {"text":"Sun, 31 Dec 2000 23:59:59 -0800","ns":"978335999000000000"},
  ],
};

const ns = (text, unit = "s") => {
  const r = resolveEpoch(text, unit);
  assert.equal(r.state, "ok", `${text} ${unit}: ${r.message ?? r.state}`);
  return r.ns;
};

describe("independent reference: instants (Python datetime + zoneinfo)", () => {
  for (const c of GOLDEN.instants) {
    test(`${c.ns} ns in ${c.zone}`, () => {
      const instant = BigInt(c.ns);
      assert.equal(formatUtcIso(instant), c.utc);
      const z = describeInZone(instant, c.zone);
      assert.equal(z.iso, c.iso);
      assert.equal(z.offsetSeconds, c.offset);
    });
  }
});

describe("independent reference: a local time in a zone (unique, gap, overlap)", () => {
  for (const c of GOLDEN.local) {
    test(`${c.wall} in ${c.zone} is ${c.kind}`, () => {
      const r = dateTimeToInstants(c.wall, c.zone);
      if (c.kind === "gap") {
        assert.equal(r.state, "gap");
        assert.match(r.message, /^This local time does not exist in the selected time zone because of a daylight-saving transition\.$/);
        assert.ok(r.detail.includes(c.zone), "the detail names the zone");
        return;
      }
      assert.equal(r.state, "ok");
      assert.equal(r.kind, c.kind);
      assert.deepEqual(
        r.candidates.map((x) => ({ seconds: Number(x.ns / 1_000_000_000n), offset: x.offsetSeconds })),
        c.instants,
      );
    });
  }
});

describe("independent reference: strict ISO 8601 and RFC 2822 text with an explicit offset", () => {
  for (const c of GOLDEN.parse) {
    test(c.text, () => {
      const r = dateTimeToInstants(c.text, "Asia/Tokyo"); // the zone must be ignored: the text carries its own offset
      assert.equal(r.state, "ok");
      assert.equal(r.kind, "offset");
      assert.equal(r.candidates[0].ns, BigInt(c.ns));
    });
  }
});

describe("native Date as a second oracle for UTC (seeded, years 1 to 9999, negatives included)", () => {
  test("5,000 random instants: formatUtcIso equals Date.toISOString, and seconds round-trip", () => {
    let seed = 20261007;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    const lo = -62135596800, hi = 253402300799;
    for (let i = 0; i < 5000; i++) {
      const seconds = Math.floor(lo + rand() * (hi - lo));
      const iso = new Date(seconds * 1000).toISOString().replace(".000Z", "Z");
      const instant = ns(String(seconds));
      assert.equal(formatUtcIso(instant), iso, String(seconds));
      assert.equal(formatUnix(instant, "s"), String(seconds));
      assert.equal(formatUnix(instant, "ms"), String(seconds * 1000));
    }
  });
});

describe("unit detection is a table on the digit count of the integer part", () => {
  const table = [
    [1, "certain", "s"], [5, "certain", "s"], [10, "certain", "s"],
    [11, "ambiguous", ["s", "ms"]], [12, "ambiguous", ["s", "ms"]],
    [13, "certain", "ms"],
    [14, "ambiguous", ["ms", "us"]], [15, "ambiguous", ["ms", "us"]],
    [16, "certain", "us"],
    [17, "ambiguous", ["us", "ns"]], [18, "ambiguous", ["us", "ns"]],
    [19, "certain", "ns"],
    [20, "none"], [25, "none"],
  ];
  for (const [digits, kind, expected] of table) {
    test(`${digits} digits is ${kind}${expected ? " " + JSON.stringify(expected) : ""}`, () => {
      const d = detectUnit(digits);
      assert.equal(d.kind, kind);
      if (kind === "certain") assert.equal(d.unit, expected);
      if (kind === "ambiguous") assert.deepEqual(d.candidates, expected);
    });
  }

  test("each certain length reads the same instant in its own unit", () => {
    const instant = ns("1700000000");
    assert.equal(resolveEpoch("1700000000").unit, "s");
    assert.equal(resolveEpoch("1700000000000").unit, "ms");
    assert.equal(resolveEpoch("1700000000000000").unit, "us");
    assert.equal(resolveEpoch("1700000000000000000").unit, "ns");
    for (const t of ["1700000000", "1700000000000", "1700000000000000", "1700000000000000000"]) assert.equal(resolveEpoch(t).ns, instant, t);
    assert.equal(resolveEpoch("1700000000").how, "digits");
    assert.match(resolveEpoch("1700000000").reason, /10 digits/);
  });

  test("an ambiguous length with both readings in range is reported, never converted", () => {
    for (const t of ["12345678901", "170000000012", "100000000000000", "123456789012345", "10000000000000000", "170000000000000000"]) {
      const r = resolveEpoch(t);
      assert.equal(r.state, "ambiguous", t);
      assert.equal(r.candidates.length, 2);
      assert.ok(r.candidates.every((c) => c.ns !== null), t);
      assert.match(r.reason, /could be/);
    }
  });

  test("an ambiguous length with only one reading in range uses it, and says so", () => {
    const r = resolveEpoch("999999999999"); // 12 digits: as seconds it is after the year 9999
    assert.equal(r.state, "ok");
    assert.equal(r.unit, "ms");
    assert.equal(r.how, "range");
    assert.match(r.reason, /outside the supported range, so it is read as milliseconds/);
    assert.equal(formatUtcIso(r.ns), "2001-09-09T01:46:39.999Z");
  });

  test("a manual unit overrides, and is labelled as chosen", () => {
    const r = resolveEpoch("170000000012", "ms");
    assert.equal(r.state, "ok");
    assert.equal(r.how, "chosen");
    assert.equal(formatUtcIso(r.ns), "1975-05-22T14:13:20.012Z");
    assert.equal(formatUtcIso(resolveEpoch("170000000012", "s").ns), "7357-01-31T14:13:32Z");
    assert.equal(resolveEpoch("5", "ns").state, "ok");
  });

  test("20 or more digits need an explicit unit; only nanoseconds can be that long and valid", () => {
    assert.equal(resolveEpoch("20000000000000000000").state, "invalid");
    assert.match(resolveEpoch("20000000000000000000").message, /choose Nanoseconds/);
    assert.equal(resolveEpoch("20000000000000000000", "ns").state, "ok"); // 20 digits of ns is the year 2603
    assert.equal(formatUtcIso(resolveEpoch("253402300799999999999", "ns").ns), "9999-12-31T23:59:59.999999999Z");
  });

  test("leading zeros and a sign do not change the digit count", () => {
    assert.equal(resolveEpoch("0001700000000").unit, "s");
    assert.equal(resolveEpoch("-1700000000").unit, "s");
    assert.equal(resolveEpoch("1700000000.123456789").unit, "s");
    assert.equal(resolveEpoch("0").unit, "s");
  });
});

describe("epoch text: strict, with a reason for each refusal", () => {
  const bad = [
    ["+1700000000", /plus sign/],
    ["1.7e9", /Scientific notation/],
    ["1E9", /Scientific notation/],
    ["0x65536f00", /Hex/],
    ["1,700,000,000", /separators/],
    ["1_700_000_000", /separators/],
    ["1700 000000", /separators/],
    ["17abc", /digits only/],
    ["abc", /digits only/],
    ["-", /minus sign/],
    ["1.", /decimal point/],
    [".5", /decimal point/],
    ["1..5", /decimal point/],
    ["2023-11-14", /looks like a date/],
    ["--5", /Not a valid/],
    ["1 2", /separators/],
  ];
  for (const [text, message] of bad) {
    test(JSON.stringify(text), () => {
      const r = resolveEpoch(text);
      assert.equal(r.state, "invalid");
      assert.match(r.message, message);
    });
  }

  test("empty, blank and whitespace-wrapped input", () => {
    assert.equal(resolveEpoch("").state, "empty");
    assert.equal(resolveEpoch("   \n\t").state, "empty");
    assert.equal(resolveEpoch(null).state, "empty");
    assert.equal(resolveEpoch("  \t1700000000 \n").state, "ok");
    assert.equal(resolveEpoch("  \t1700000000 \n").ns, ns("1700000000"));
  });
});

describe("precision: BigInt, never Number, never rounded", () => {
  test("a 19-digit nanosecond value keeps every digit (Number would not)", () => {
    const text = "1700000000123456789";
    assert.notEqual(String(Number(text)), text, "the case really is beyond Number");
    const instant = ns(text, "ns");
    assert.equal(instant, 1700000000123456789n);
    assert.equal(formatUnix(instant, "ns"), text);
    assert.equal(formatUnix(instant, "us"), "1700000000123456.789");
    assert.equal(formatUnix(instant, "ms"), "1700000000123.456789");
    assert.equal(formatUnix(instant, "s"), "1700000000.123456789");
    assert.equal(formatUtcIso(instant), "2023-11-14T22:13:20.123456789Z");
  });

  test("2^53 + 1 nanoseconds is exact", () => {
    const instant = ns("9007199254740993", "ns");
    assert.equal(instant, 9007199254740993n);
    assert.equal(formatUtcIso(instant), "1970-04-15T05:59:59.254740993Z".replace("05:59:59", "05:59:59"));
  });

  test("fractions are exact and never rounded", () => {
    assert.equal(formatUtcIso(ns("1700000000.5")), "2023-11-14T22:13:20.5Z");
    assert.equal(formatUtcIso(ns("1700000000.123456789")), "2023-11-14T22:13:20.123456789Z");
    assert.equal(formatUtcIso(ns("1700000000123.456", "ms")), "2023-11-14T22:13:20.123456Z");
    assert.equal(formatUtcIso(ns("1700000000.1234567890")), "2023-11-14T22:13:20.123456789Z"); // a trailing zero is not a loss
    assert.equal(resolveEpoch("1700000000.1234567891").state, "invalid");
    assert.match(resolveEpoch("1700000000.1234567891").message, /more precision than one nanosecond/);
    assert.equal(resolveEpoch("1700000000000.1234567", "ms").state, "invalid");
    assert.equal(resolveEpoch("5.5", "ns").state, "invalid");
  });

  test("negative timestamps: floor seconds and a positive fraction", () => {
    assert.equal(formatUtcIso(ns("-1")), "1969-12-31T23:59:59Z");
    assert.equal(formatUtcIso(ns("-1.5")), "1969-12-31T23:59:58.5Z");
    assert.equal(formatUnix(ns("-1.5"), "s"), "-1.5");
    assert.equal(formatUnix(ns("-1", "ms"), "ms"), "-1");
    assert.equal(formatUtcIso(ns("-1", "ms")), "1969-12-31T23:59:59.999Z");
    assert.equal(formatUtcIso(ns("-1000000000")), "1938-04-24T22:13:20Z");
    assert.deepEqual(splitNs(-1n), { seconds: -1n, nanos: 999999999 });
  });

  test("formatUnix is exact for any unit", () => {
    assert.equal(formatUnix(0n, "s"), "0");
    assert.equal(formatUnix(1n, "ns"), "1");
    assert.equal(formatUnix(1n, "s"), "0.000000001");
    assert.equal(formatUnix(1_500_000_000n, "s"), "1.5");
    assert.equal(formatUnix(-1_500_000_000n, "ms"), "-1500");
  });
});

describe("supported range: years 1 to 9999", () => {
  test("the first and last instants are accepted", () => {
    assert.equal(formatUtcIso(ns("-62135596800")), "0001-01-01T00:00:00Z");
    assert.equal(formatUtcIso(ns("253402300799")), "9999-12-31T23:59:59Z");
    assert.equal(formatUtcIso(MAX_NS), "9999-12-31T23:59:59.999999999Z");
    assert.equal(MIN_NS, -62135596800000000000n);
    assert.ok(inRange(MIN_NS) && inRange(MAX_NS) && !inRange(MIN_NS - 1n) && !inRange(MAX_NS + 1n));
  });

  test("one second beyond either end is a clear error with the direction", () => {
    const late = resolveEpoch("253402300800", "s"); // (Auto would read these 12 digits as milliseconds, the only reading in range)
    assert.equal(late.state, "invalid");
    assert.match(late.message, /after 9999-12-31T23:59:59Z/);
    const early = resolveEpoch("-62135596801", "s");
    assert.equal(early.state, "invalid");
    assert.match(early.message, /before 0001-01-01T00:00:00Z/);
    assert.equal(resolveEpoch("1000000000000", "s").state, "invalid");
  });

  test("a zone near the ends: a local year of 0 (1 BC) or 10000 is shown correctly, never misread", () => {
    const min = describeInZone(MIN_NS, "America/New_York"); // local time is the day before, in year 0
    assert.match(min.iso, /^0000-12-31T19:\d\d:\d\d-04:56:02$/);
    const max = describeInZone(ns("253402300799"), "Asia/Kolkata");
    assert.equal(max.iso, "10000-01-01T05:29:59+05:30");
  });
});

describe("zones and offsets come from Intl", () => {
  test("offsets at fixed instants", () => {
    assert.equal(offsetSecondsAt(1700000000000, "Asia/Kolkata"), 19800);
    assert.equal(offsetSecondsAt(1700000000000, "America/New_York"), -18000);
    assert.equal(offsetSecondsAt(1690000000000, "America/New_York"), -14400);
    assert.equal(offsetSecondsAt(1700000000000, "UTC"), 0);
    assert.equal(offsetSecondsAt(1700000000000, "Asia/Kathmandu"), 20700);
  });

  test("validation, listing and the local zone", () => {
    assert.ok(isValidZone("Asia/Kolkata") && isValidZone("UTC") && isValidZone("America/New_York"));
    assert.ok(!isValidZone("Mars/Olympus") && !isValidZone("") && !isValidZone(null) && !isValidZone("   "));
    const zones = listZones();
    assert.ok(zones.length > 50 && zones.includes("Europe/London"));
    assert.ok(isValidZone(localZone()));
  });

  test("the description has weekday, date, clock and a labelled offset", () => {
    const z = describeInZone(ns("1700000000"), "Asia/Kolkata");
    assert.equal(z.display, "Wednesday, 15 November 2023 at 03:43:20");
    assert.equal(z.weekday, "Wednesday");
    assert.equal(z.offset, "UTC+05:30");
    assert.equal(describeInZone(ns("1700000000"), "UTC").offset, "UTC+00:00");
    assert.equal(describeInZone(ns("0"), "UTC").display, "Thursday, 1 January 1970 at 00:00:00");
    assert.equal(describeInZone(ns("1700000000.25"), "UTC").iso, "2023-11-14T22:13:20.25+00:00");
  });
});

describe("a local time: daylight-saving gap and overlap", () => {
  test("a gap names the transition and gives no instant", () => {
    const r = dateTimeToInstants("2023-03-12T02:30:00", "America/New_York");
    assert.equal(r.state, "gap");
    assert.equal(r.message, "This local time does not exist in the selected time zone because of a daylight-saving transition.");
    assert.equal(r.detail, "At that moment the clocks in America/New_York went from 01:59:59 (UTC-05:00) to 03:00:00 (UTC-04:00) on 2023-03-12.");
    assert.equal(r.candidates, undefined);
  });

  test("an overlap gives both instants, earlier first, and chooses neither", () => {
    const r = dateTimeToInstants("2023-11-05T01:30:00", "America/New_York");
    assert.equal(r.state, "ok");
    assert.equal(r.kind, "overlap");
    assert.deepEqual(r.candidates.map((c) => [Number(c.ns / 1_000_000_000n), c.offsetSeconds]), [[1699162200, -14400], [1699165800, -18000]]);
    assert.ok(r.candidates[0].offsetSeconds > r.candidates[1].offsetSeconds, "the earlier occurrence has the larger offset");
  });

  test("the seconds on either side of a transition are not ambiguous", () => {
    assert.equal(dateTimeToInstants("2023-03-12T01:59:59", "America/New_York").kind, "unique");
    assert.equal(dateTimeToInstants("2023-03-12T03:00:00", "America/New_York").kind, "unique");
    assert.equal(dateTimeToInstants("2023-11-05T00:59:59", "America/New_York").kind, "unique");
    assert.equal(dateTimeToInstants("2023-11-05T02:00:00", "America/New_York").kind, "unique");
  });

  test("a zone without daylight saving never has a gap or an overlap", () => {
    for (const wall of ["2023-03-12T02:30:00", "2023-11-05T01:30:00", "2023-03-26T01:30:00", "2023-10-29T01:30:00"]) {
      assert.equal(dateTimeToInstants(wall, "Asia/Kolkata").kind, "unique", wall);
      assert.equal(dateTimeToInstants(wall, "UTC").kind, "unique", wall);
    }
  });

  test("an explicit offset or Z fixes the instant: no zone, no daylight-saving question", () => {
    const r = dateTimeToInstants("2023-03-12T02:30:00-05:00", "America/New_York");
    assert.equal(r.kind, "offset");
    assert.equal(r.candidates[0].ns, 1678606200n * 1_000_000_000n);
  });

  test("a missing zone is refused when one is needed", () => {
    assert.equal(dateTimeToInstants("2023-11-14 22:13:20", "Mars/Olympus").state, "invalid");
  });

  test("a 30-minute daylight-saving change (Lord Howe) is a gap and an overlap of 30 minutes", () => {
    assert.equal(dateTimeToInstants("2023-10-01T02:15:00", "Australia/Lord_Howe").state, "gap");
    assert.equal(dateTimeToInstants("2023-04-02T01:45:00", "Australia/Lord_Howe").kind, "overlap");
    assert.match(dateTimeToInstants("2023-10-01T02:15:00", "Australia/Lord_Howe").detail, /went from 01:59:59 \(UTC\+10:30\) to 02:30:00 \(UTC\+11:00\)/);
  });

  test("the date alone is midnight local", () => {
    const r = dateTimeToInstants("2023-11-14", "Asia/Kolkata");
    assert.equal(r.state, "ok");
    assert.equal(r.candidates[0].ns / 1_000_000_000n, 1699900200n);
  });

  test("resolveWallTime reports the candidates for a wall time", () => {
    const r = resolveWallTime({ y: 2023, mo: 11, d: 5, h: 1, mi: 30, s: 0, nanos: 123456789 }, "America/New_York");
    assert.equal(r.kind, "overlap");
    assert.equal(r.candidates[0].ns % 1_000_000_000n, 123456789n);
  });
});

describe("date text: strict ISO 8601 and RFC 2822, nothing fuzzy", () => {
  test("accepted ISO forms", () => {
    const ok = (t, nsExpected) => {
      const r = dateTimeToInstants(t, "UTC");
      assert.equal(r.state, "ok", t);
      assert.equal(r.candidates[0].ns, BigInt(nsExpected), t);
    };
    ok("2023-11-14T22:13:20Z", "1700000000000000000");
    ok("2023-11-14t22:13:20z", "1700000000000000000");
    ok("2023-11-14 22:13:20", "1700000000000000000");
    ok("2023-11-14T22:13", "1699999980000000000");
    ok("2023-11-14T22:13:20.5Z", "1700000000500000000");
    ok("2023-11-14T22:13:20,123456789Z", "1700000000123456789");
    ok("2023-11-14T22:13:20 +00:00", "1700000000000000000");
    ok("2023-11-14T22:13:20+0000", "1700000000000000000");
    ok("2023-11-15T03:43:20+05:30", "1700000000000000000");
    ok("2023-11-14T22:13:20+00", "1700000000000000000");
    ok("2024-02-29T00:00:00Z", "1709164800000000000");
  });

  const refused = [
    ["2023-02-29T00:00:00Z", /February 2023 does not have a day 29/],
    ["2023-13-01T00:00:00Z", /not a month/],
    ["2023-11-31T00:00:00Z", /November 2023 does not have a day 31/],
    ["2023-11-14T24:00:00Z", /Hour 24/],
    ["2023-11-14T25:00:00Z", /not an hour/],
    ["2023-11-14T22:60:00Z", /not a minute/],
    ["2023-11-14T23:59:60Z", /leap second/],
    ["0000-01-01T00:00:00Z", /year must be between 0001 and 9999/],
    ["2023-11-14Z", /without a time cannot have an offset/],
    ["2023-11-14T22:13:20+24:00", /offset/],
    ["2023-11-14T22:13:20+05:60", /offset/],
    ["tomorrow", /Natural-language dates are not accepted/],
    ["next Friday", /Natural-language dates are not accepted/],
    ["last Monday", /Natural-language dates are not accepted/],
    ["tomorrow evening", /Natural-language dates are not accepted/],
    ["11/14/2023", /ambiguous/],
    ["14.11.2023", /ambiguous/],
    ["Nov 14 2023", /Not recognised/],
    ["2023/11/14", /Not recognised/],
    ["1700000000", /That is a Unix timestamp/],
    ["2023-11-14T22:13:20.1234567891Z", /Not recognised/],
    ["Mon, 14 Nov 2023 22:13:20 +0000", /is a Tuesday, not a Mon/],
    ["Tue, 14 Nov 2023 22:13:60 +0000", /leap second/],
    ["Tue, 14 Nov 2023 22:13:20 EST", /Not recognised/],
    ["Tue, 31 Nov 2023 22:13:20 +0000", /does not have a day 31/],
  ];
  for (const [text, message] of refused) {
    test(`refuses ${JSON.stringify(text)}`, () => {
      const r = dateTimeToInstants(text, "UTC");
      assert.equal(r.state, "invalid");
      assert.match(r.message, message);
    });
  }

  test("RFC 2822 with and without a weekday and seconds, GMT and UT", () => {
    for (const t of ["14 Nov 2023 22:13:20 +0000", "Tue, 14 Nov 2023 22:13:20 GMT", "Tue, 14 Nov 2023 22:13:20 UT", "14 nov 2023 22:13 GMT"]) {
      const r = dateTimeToInstants(t, "Asia/Tokyo");
      assert.equal(r.state, "ok", t);
      assert.equal(r.kind, "offset");
    }
  });

  test("empty input is its own state", () => {
    assert.equal(dateTimeToInstants("", "UTC").state, "empty");
    assert.equal(dateTimeToInstants("  \n", "UTC").state, "empty");
    assert.equal(parseDateTimeText(undefined).empty, true);
  });

  test("an offset that pushes the instant outside the range is an error, not a wrong date", () => {
    assert.equal(dateTimeToInstants("0001-01-01T00:00:00+05:00", "UTC").state, "invalid");
    assert.equal(dateTimeToInstants("9999-12-31T23:59:59-05:00", "UTC").state, "invalid");
    assert.equal(dateTimeToInstants("0001-01-01T05:00:00+05:00", "UTC").state, "ok");
  });
});

describe("relative time", () => {
  const cases = [
    [0, "now"], [-1, "1 second ago"], [-59, "59 seconds ago"], [60, "in 1 minute"], [-3599, "59 minutes ago"],
    [-3600, "1 hour ago"], [7200, "in 2 hours"], [-86399, "23 hours ago"], [-86400, "1 day ago"], [86400 * 3, "in 3 days"],
    [-86400 * 29, "29 days ago"], [-86400 * 31, "about 1 month ago"], [86400 * 200, "in about 6 months"],
    [-86400 * 366, "about 1 year ago"], [-86400 * 800, "about 2 years ago"], [86400 * 3660, "in about 10 years"],
  ];
  for (const [delta, text] of cases) test(`${delta} s is "${text}"`, () => assert.equal(relativeText(delta), text));

  test("relativeToNow works from floor seconds", () => {
    assert.equal(relativeToNow(ns("1700000000"), 1700003600500), "1 hour ago");
    assert.equal(relativeToNow(ns("1700007200"), 1700000000000), "in 2 hours");
  });
});

describe("batch: extraction, conversion, limits and safe text", () => {
  test("a value per line, every unit, with the unit rule", () => {
    const { rows, total, converted, problems } = convertBatch("1700000000\n1700000000123\n1700000000123456\n1700000000123456789", "auto", "UTC");
    assert.deepEqual([total, converted, problems], [4, 4, 0]);
    assert.deepEqual(rows.map((r) => r.unitText), ["seconds", "milliseconds", "microseconds", "nanoseconds"]);
    assert.deepEqual(rows.map((r) => r.utc), ["2023-11-14T22:13:20Z", "2023-11-14T22:13:20.123Z", "2023-11-14T22:13:20.123456Z", "2023-11-14T22:13:20.123456789Z"]);
    assert.equal(rows[0].local, "2023-11-14T22:13:20+00:00");
  });

  test("timestamps are extracted from log lines; other numbers are left alone", () => {
    const text = [
      "2023-11-14 22:13:20 INFO ts=1700000000123 user=42 order=12345",
      "no numbers here",
      "",
      "   ",
      "a=1700000000 b=1700000001 (two in one line)",
      "id1700000000 x_1700000000 1700000000x 1700000000.5 -1000000000 v1.1700000000",
    ].join("\n");
    const { entries } = extractBatch(text);
    assert.deepEqual(entries.map((e) => [e.line, e.kind, e.token]), [
      [1, "value", "1700000000123"],
      [2, "none", "no numbers here"],
      [5, "value", "1700000000"],
      [5, "value", "1700000001"],
      [6, "value", "1700000000.5"],
      [6, "value", "-1000000000"],
    ]);
  });

  test("a mixed batch: invalid lines are marked, the rest still convert", () => {
    const r = convertBatch("1700000000\nhello\n12345678901\n99999999999999999999\n1700000000123", "auto", "Asia/Kolkata");
    assert.equal(r.total, 5);
    assert.equal(r.converted, 2);
    assert.equal(r.problems, 3);
    assert.match(r.rows[1].message, /No timestamp found/);
    assert.match(r.rows[2].message, /Ambiguous unit: 11 digits could be seconds or milliseconds/);
    assert.match(r.rows[3].message, /choose Nanoseconds/);
    assert.equal(r.rows[4].local, "2023-11-15T03:43:20.123+05:30");
  });

  test("a chosen unit applies to every value, including pure numbers of any length", () => {
    const r = convertBatch("1700000000123\n12345678901", "ms", "UTC");
    assert.equal(r.converted, 2);
    assert.equal(r.rows[1].unitText, "milliseconds (chosen)");
    assert.equal(r.rows[1].utc, "1970-05-23T21:21:18.901Z");
  });

  test("the entry limit is enforced and counted", () => {
    const text = Array.from({ length: BATCH_MAX_ENTRIES + 25 }, (_, i) => String(1700000000 + i)).join("\n");
    const r = convertBatch(text, "auto", "UTC");
    assert.equal(r.shown, BATCH_MAX_ENTRIES);
    assert.equal(r.total, BATCH_MAX_ENTRIES + 25);
    assert.equal(r.rows.length, BATCH_MAX_ENTRIES);
    assert.equal(r.rows.at(-1).token, String(1700000000 + BATCH_MAX_ENTRIES - 1));
  });

  test("input beyond the character limit is cut and flagged", () => {
    const r = convertBatch("1700000000\n".repeat(BATCH_MAX_CHARS / 11 + 100), "auto", "UTC");
    assert.equal(r.truncatedInput, true);
    assert.ok(r.shown <= BATCH_MAX_ENTRIES);
  });

  test("a 200-entry batch converts quickly", () => {
    const text = Array.from({ length: BATCH_MAX_ENTRIES }, (_, i) => String(1700000000000 + i * 86400000)).join("\n");
    const t = performance.now();
    const r = convertBatch(text, "auto", "America/New_York");
    const elapsed = performance.now() - t;
    assert.equal(r.converted, BATCH_MAX_ENTRIES);
    assert.ok(elapsed < 1500, `took ${elapsed} ms`);
  });

  test("HTML-like text in a log line is returned as plain text", () => {
    const r = convertBatch('<script>alert(1)</script> "quoted" 😀\n<img src=x onerror=alert(1)> 1700000000', "auto", "UTC");
    assert.equal(r.rows[0].ok, false);
    assert.equal(r.rows[0].token, '<script>alert(1)</script> "quoted" 😀');
    assert.equal(r.rows[1].token, "1700000000");
    for (const row of r.rows) for (const value of Object.values(row)) if (typeof value === "string") assert.ok(!/[<>]/.test(row.ok ? value : row.message), "the engine adds no markup");
  });

  test("a long unmatched line is shortened", () => {
    const r = convertBatch("x".repeat(500), "auto", "UTC");
    assert.ok(r.rows[0].token.length <= 60);
  });

  test("the TSV has a header with the zone and one row per entry", () => {
    const r = convertBatch("1700000000\nhello", "auto", "Asia/Kolkata");
    assert.equal(
      batchToTsv(r.rows, "Asia/Kolkata"),
      [
        "Line\tValue\tUnit\tUTC\tAsia/Kolkata",
        "1\t1700000000\tseconds\t2023-11-14T22:13:20Z\t2023-11-15T03:43:20+05:30",
        "2\thello\t\tNot converted: No timestamp found in this line. The batch looks for numbers of 10, 13, 16 or 19 digits.\t",
      ].join("\n"),
    );
  });

  test("empty input has no entries", () => {
    assert.deepEqual(extractBatch(""), { entries: [], total: 0, truncatedInput: false });
    assert.equal(convertBatch("\n\n  \n", "auto", "UTC").total, 0);
  });
});

describe("the live clock helpers (an injected clock, no waiting)", () => {
  test("nowUnix gives exact seconds and milliseconds", () => {
    assert.deepEqual(nowUnix(1700000000123), { seconds: "1700000000", milliseconds: "1700000000123" });
    assert.deepEqual(nowUnix(1999), { seconds: "1", milliseconds: "1999" });
    assert.deepEqual(nowUnix(0), { seconds: "0", milliseconds: "0" });
  });

  test("the next repaint is scheduled just after the next whole second", () => {
    assert.equal(msToNextSecond(1700000000000), 1015);
    assert.equal(msToNextSecond(1700000000250), 765);
    assert.equal(msToNextSecond(1700000000999), 16);
    for (let ms = 0; ms < 3000; ms += 37) {
      const delay = msToNextSecond(ms);
      assert.ok(delay > 0 && delay <= 1015);
      assert.equal(Math.floor((ms + delay) / 1000), Math.floor(ms / 1000) + 1, `lands in the next second from ${ms}`);
    }
  });
});

describe("labels and constants", () => {
  test("unit labels", () => {
    assert.deepEqual(UNIT_LABEL, { s: "seconds", ms: "milliseconds", us: "microseconds", ns: "nanoseconds" });
  });

  test("epochToNs rejects a parse that is out of range with the direction", () => {
    assert.match(epochToNs(parseEpochText("300000000000"), "s").error, /after 9999/);
    assert.equal(epochToNs(parseEpochText("1700000000"), "s").ns, 1700000000000000000n);
  });
});
