/**
 * Revision scheduler: independent verification (Stage 3).
 *
 * Reference: Python's datetime module, which shares no code or formulas with assets/js/learning/scheduler.js.
 * - every calendar day from 1970-01-01 to 2100-12-31, plus the last day the scheduler accepts (9999-12-31), must give
 *   the same day number and round-trip through dayToIso;
 * - leap years: 2000 (divisible by 400, leap), 2100 (divisible by 100 only, not leap), 2024, 2028, 1900-style cases;
 * - a seeded random walk of 3,000 review histories is replayed by a small Leitner model written separately in Python
 *   (box 1 to 5, intervals 1, 3, 7, 14 and 30 days, a miss returns to box 1, box 5 stays at box 5) and compared on
 *   box, due date and the due/not-due answer for every day of the next 40 days;
 * - the local calendar day is read in four time zones, including the date line, using a child process with TZ set.
 * No claim is made that the schedule improves learning; this checks only that it does what the page says.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";

import {
    INTERVAL_DAYS, MAX_BOX, MAX_DAY, dayNumber, dayToIso, grade, dueDay, isDue, dueCards, nextDueAfter, intervalOf, isEntry, localDay
} from "../../assets/js/learning/scheduler.js";

const probe = spawnSync("python", ["-I", "-c", "print('ok')"], { encoding: "utf8" });
const havePython = probe.status === 0;
const skip = havePython ? false : "python is not available on this machine";

const PY_DAYS = String.raw`
import sys, json, datetime
epoch = datetime.date(1970, 1, 1)
out = []
d = epoch
end = datetime.date(2100, 12, 31)
while d <= end:
    out.append([d.year, d.month, d.day, (d - epoch).days])
    d += datetime.timedelta(days=1)
last = datetime.date(9999, 12, 31)
out.append([9999, 12, 31, (last - epoch).days])
sys.stdout.write(json.dumps(out))
`;

const PY_WALK = String.raw`
import sys, json, random
INTERVALS = [1, 3, 7, 14, 30]
rng = random.Random(20261030)
cases = []
for _ in range(3000):
    start = rng.randint(0, 40000)
    steps = []
    day = start
    box = None
    last = None
    for _s in range(rng.randint(1, 14)):
        day += rng.choice([0, 1, 1, 2, 3, 7, 10, 20, 31, 400])
        known = rng.random() < 0.7
        if known:
            box = 2 if box is None else min(5, box + 1)
        else:
            box = 1
        last = day
        steps.append([day, known])
    due = last + INTERVALS[box - 1]
    probes = [[last + k, (last + k) >= due] for k in range(-3, 41)]
    cases.append({"steps": steps, "box": box, "last": last, "due": due, "probes": probes})
sys.stdout.write(json.dumps(cases))
`;

describe("calendar arithmetic against Python datetime", () => {

    it("the intervals are exactly 1, 3, 7, 14 and 30 days and there are five boxes", () => {
        assert.deepEqual([...INTERVAL_DAYS], [1, 3, 7, 14, 30]);
        assert.equal(MAX_BOX, 5);
        assert.throws(() => intervalOf(0), RangeError);
        assert.throws(() => intervalOf(6), RangeError);
    });

    it("every day from 1970 to 2100 and the last accepted day agree", { skip }, () => {
        const run = spawnSync("python", ["-I", "-c", PY_DAYS], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        assert.equal(run.status, 0, run.stderr);
        const days = JSON.parse(run.stdout);
        assert.ok(days.length > 47000);
        let bad = 0;
        for (const [y, m, d, n] of days) {
            if (dayNumber(y, m, d) !== n || dayToIso(n) !== `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`) bad += 1;
        }
        assert.equal(bad, 0);
        assert.equal(days[days.length - 1][3], MAX_DAY);
    });

    it("leap years: 2000 and 2024 and 2028 have a 29 February; 2100 and 1900-style centuries do not", () => {
        assert.equal(dayNumber(2000, 3, 1) - dayNumber(2000, 2, 28), 2);
        assert.equal(dayNumber(2024, 3, 1) - dayNumber(2024, 2, 28), 2);
        assert.equal(dayNumber(2028, 3, 1) - dayNumber(2028, 2, 28), 2);
        assert.equal(dayNumber(2100, 3, 1) - dayNumber(2100, 2, 28), 1);
        assert.equal(dayNumber(2023, 3, 1) - dayNumber(2023, 2, 28), 1);
        assert.equal(dayToIso(dayNumber(2024, 2, 29) + 1), "2024-03-01");
        assert.equal(dayToIso(dayNumber(2100, 2, 28) + 1), "2100-03-01");
    });

    it("a review on 28 February 2024 comes due after the leap day (box 2: 3 days)", () => {
        const entry = grade({ box: 1, day: 0 }, true, dayNumber(2024, 2, 28));
        assert.equal(entry.box, 2);
        assert.equal(dayToIso(dueDay(entry)), "2024-03-02");
    });

    it("a 30-day interval across a year end", () => {
        const entry = { box: 5, day: dayNumber(2026, 12, 20) };
        assert.equal(dayToIso(dueDay(entry)), "2027-01-19");
    });

});

describe("the Leitner schedule against a separate Python model", () => {

    it("3,000 seeded review histories give the same box, due day and due/not-due answer on 44 probe days", { skip }, () => {
        const run = spawnSync("python", ["-I", "-c", PY_WALK], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
        assert.equal(run.status, 0, run.stderr);
        const cases = JSON.parse(run.stdout);
        let atMax = 0, misses = 0;
        cases.forEach((c, i) => {
            let entry;
            for (const [day, known] of c.steps) entry = grade(entry, known, day);
            assert.equal(entry.box, c.box, `case ${i} box`);
            assert.equal(entry.day, c.last, `case ${i} last day`);
            assert.equal(dueDay(entry), c.due, `case ${i} due day`);
            for (const [probeDay, expected] of c.probes) assert.equal(isDue(entry, probeDay), probeDay < c.last ? true : expected, `case ${i} day ${probeDay}`);
            if (entry.box === 5) atMax += 1;
            if (entry.box === 1) misses += 1;
        });
        assert.ok(atMax > 100 && misses > 100, `the walk reaches both ends: ${atMax} at the top box, ${misses} at the first`);
    });

    it("a card never goes past box 5, and one miss always returns it to box 1", () => {
        let entry;
        for (let d = 0; d < 20; d += 1) entry = grade(entry, true, d * 40);
        assert.equal(entry.box, 5);
        assert.equal(intervalOf(entry.box), 30);
        assert.deepEqual(grade(entry, false, 900), { box: 1, day: 900 });
    });

    it("a new card graded as known starts in box 2; graded as not known, box 1", () => {
        assert.deepEqual(grade(undefined, true, 100), { box: 2, day: 100 });
        assert.deepEqual(grade(undefined, false, 100), { box: 1, day: 100 });
    });

    it("a malformed saved entry is treated as new, never trusted", () => {
        for (const bad of [null, {}, { box: 9, day: 1 }, { box: 1, day: -1 }, { box: 1.5, day: 1 }, { box: "2", day: 1 }, { box: 1, day: 1e12 }, [], "x"]) {
            assert.equal(isEntry(bad), false);
            assert.deepEqual(grade(bad, true, 50), { box: 2, day: 50 });
            assert.equal(isDue(bad, 100), false);
        }
    });

    it("overdue cards are due, ordered lowest box first, then deck order", () => {
        const ids = ["a", "b", "c", "d"];
        const entries = { a: { box: 3, day: 0 }, b: { box: 1, day: 0 }, c: { box: 1, day: 1000 }, d: { box: 5, day: 0 } };
        assert.deepEqual(dueCards(ids, entries, 1000), ["b", "a", "d"]); // c reviewed on day 1000 is due on 1001, so not yet
        assert.deepEqual(dueCards(ids, entries, 1001), ["b", "c", "a", "d"]);
        assert.deepEqual(dueCards(ids, { ...entries, c: { box: 1, day: 1 } }, 1), ["b"]);
        assert.deepEqual(dueCards(ids, {}, 1), []);
    });

    it("a clock set back (last review later than today) is due today, not hidden for years", () => {
        assert.equal(isDue({ box: 5, day: 5000 }, 10), true);
    });

    it("the next due day ignores cards already due and unseen cards", () => {
        const ids = ["a", "b", "c"];
        const entries = { a: { box: 2, day: 10 }, b: { box: 1, day: 0 } };
        assert.equal(nextDueAfter(ids, entries, 11), 13);
        assert.equal(nextDueAfter(ids, entries, 50), null);
    });

    it("keys such as __proto__ are not read as saved entries", () => {
        const entries = JSON.parse('{"__proto__": {"box": 2, "day": 1}}');
        assert.deepEqual(dueCards(["__proto__", "constructor"], entries, 99).length, 1);
        assert.deepEqual(dueCards(["constructor", "toString"], {}, 99), []);
    });

    it("an invalid today is rejected", () => {
        for (const bad of [-1, 1.5, NaN, Infinity, MAX_DAY + 1, "5", null]) assert.throws(() => grade(undefined, true, bad), RangeError);
    });

});

describe("the local calendar day in four time zones", () => {

    const here = pathToFileURL(path.resolve("assets/js/learning/scheduler.js")).href;

    const dayIn = (tz, iso, mode) => {
        const script = `import(${JSON.stringify(here)}).then(m => { const d = new Date(${JSON.stringify(iso)}); process.stdout.write(m.dayToIso(m.localDay(d))); });`;
        const run = spawnSync(process.execPath, ["-e", script], { encoding: "utf8", env: { ...process.env, TZ: tz } });
        assert.equal(run.status, 0, run.stderr);
        return run.stdout;
    };

    it("just before and just after local midnight, the day is the local one and not the UTC one", () => {
        assert.equal(dayIn("UTC", "2026-03-10T23:59:30Z"), "2026-03-10");
        assert.equal(dayIn("Pacific/Kiritimati", "2026-03-10T23:59:30Z"), "2026-03-11"); // UTC+14, already tomorrow
        assert.equal(dayIn("Pacific/Pago_Pago", "2026-03-10T00:30:00Z"), "2026-03-09"); // UTC-11, still yesterday
        assert.equal(dayIn("Asia/Kolkata", "2026-03-10T18:29:59Z"), "2026-03-10");
        assert.equal(dayIn("Asia/Kolkata", "2026-03-10T18:30:00Z"), "2026-03-11");
    });

    it("a daylight-saving change does not skip or repeat a day", () => {
        assert.equal(dayIn("America/New_York", "2026-03-08T06:59:00Z"), "2026-03-08"); // 01:59 before the clocks go forward
        assert.equal(dayIn("America/New_York", "2026-03-08T07:00:00Z"), "2026-03-08"); // 03:00 after
        assert.equal(dayIn("America/New_York", "2026-03-09T03:59:59Z"), "2026-03-08"); // 23:59:59 that evening
        assert.equal(dayIn("America/New_York", "2026-03-09T04:00:00Z"), "2026-03-09");
        assert.equal(dayIn("America/New_York", "2026-11-01T05:30:00Z"), "2026-11-01"); // the repeated hour
        assert.equal(dayIn("America/New_York", "2026-11-02T04:59:59Z"), "2026-11-01");
    });

    it("localDay matches the host's own calendar for right now", () => {
        const now = new Date();
        assert.equal(dayToIso(localDay(now)), `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
    });

});
