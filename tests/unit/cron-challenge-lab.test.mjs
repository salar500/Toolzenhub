/**
 * Cron Challenge Lab: the exercises and the evaluator.
 *
 * Independent oracle: a cron implementation written in Python (Cronie rules: names, ranges, lists, steps, Sunday as 0 or 7,
 * the day-of-month / day-of-week rule). It does two jobs the page's code does not do the same way:
 *   1. it lists the next runs from each exercise's reference time by walking real calendar dates, and
 *   2. it decides whether two expressions are the same schedule by comparing every run over four calendar years
 *      (2026 to 2029, which contains a leap day), where the page compares value sets and a day table.
 * A hand-written table of equivalent and different expressions is checked against both.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

import { validateExerciseSet } from "../../assets/js/learning/content-schema.js";

globalThis.window = { location: { hostname: process.env.TZ_HOST || "salar500.github.io", pathname: "/" } };

let set, evaluate, canonical, stamp, catalog, engine;

before(async () => {
    catalog = await import("../../assets/js/data/tools.js");
    ({ set, stamp } = await import("../../assets/js/tools/cron-challenge-lab/exercises.js"));
    ({ evaluate, canonical } = await import("../../assets/js/tools/cron-challenge-lab/evaluator.js"));
    engine = await import("../../assets/js/tools/cron-explainer/cron-engine.js");
});

const toolIds = { has: (id) => Boolean(catalog.getToolById(id)) };
const byId = (id) => set.exercises.find((e) => e.id === id);
const verdict = (ex, text) => evaluate(ex, text).verdict;

/* Hand-written: [exercise, another expression, is it the same schedule?]. Reasons in the comments. */
const CLAIMS = [
    ["crn-every-minute", "*/1 * * * *", true],              // a step of 1 is every value
    ["crn-every-minute", "0-59 0-23 1-31 1-12 0-7", true],  // every value written out; both day fields restricted, but every day matches either way
    ["crn-every-minute", "* * * * 1", false],               // Mondays only
    ["crn-daily-0230", "30 02 * * *", true],                // a leading zero
    ["crn-daily-0230", "30 2 * * 0-6", true],               // every weekday number written out
    ["crn-daily-0230", "30 3 * * *", false],                // 03:30 is not 02:30
    ["crn-daily-0230", "30 14 * * *", false],               // 14:30 is not 02:30
    ["crn-hourly", "0 */1 * * *", true],
    ["crn-hourly", "* * * * *", false],
    ["crn-quarter-hour", "0,15,30,45 * * * *", true],
    ["crn-quarter-hour", "0-59/15 * * * *", true],
    ["crn-quarter-hour", "*/10 * * * *", false],
    ["crn-quarter-hour", "15,30,45 * * * *", false],        // minute 0 missing
    ["crn-weekdays-8", "0 8 * * 1,2,3,4,5", true],
    ["crn-weekdays-8", "0 8 * * mon-fri", true],
    ["crn-weekdays-8", "0 8 * * 1-6", false],
    ["crn-weekdays-8", "0 8 * * 0-4", false],               // Sunday to Thursday
    ["crn-twice-daily", "0 17,9 * * *", true],
    ["crn-twice-daily", "0 9-17/8 * * *", true],            // 9 and 17
    ["crn-twice-daily", "0 9,17,18 * * *", false],
    ["crn-office-hours", "0,10,20,30,40,50 9,10,11,12,13,14,15,16,17 * * 1-5", true],
    ["crn-office-hours", "*/10 9-16 * * 1-5", false],       // stops an hour early
    ["crn-office-hours", "*/10 9-17 * * 1-6", false],       // Saturday as well
    ["crn-first-of-month", "0 0 1 */1 *", true],
    ["crn-first-of-month", "0 0 2 * *", false],
    ["crn-sunday-6", "0 6 * * 7", true],                    // 7 is Sunday in this dialect
    ["crn-sunday-6", "0 6 * * sun", true],
    ["crn-sunday-6", "0 6 * * 1", false],
    ["crn-quarterly", "0 0 1 */3 *", true],
    ["crn-quarterly", "0 0 1 jan,apr,jul,oct *", true],
    ["crn-quarterly", "0 0 1 3,6,9,12 *", false],
    ["crn-every-other-hour", "5 0-22/2 * * *", true],
    ["crn-every-other-hour", "5 1-23/2 * * *", false],      // odd hours
    ["crn-weekend-noon", "0 12 * * 0,6", true],
    ["crn-weekend-noon", "0 12 * * 6-7", true],
    ["crn-weekend-noon", "0 12 * * sat,sun", true],
    ["crn-weekend-noon", "0 12 * * 6", false],
    ["crn-dom-or-dow", "0 12 15 * mon", true],
    ["crn-dom-or-dow", "0 12 15 * 1", true],
    ["crn-dom-or-dow", "0 12 15 * *", false],               // the 15th only
    ["crn-dom-or-dow", "0 12 * * 1", false],                // Mondays only
    ["crn-dom-or-dow", "0 12 15 1-12 1", true],             // every month written out
    ["crn-summer-mondays", "0 12 * jun-aug mon", true],
    ["crn-summer-mondays", "0 12 * 6,7,8 1", true],
    ["crn-summer-mondays", "0 12 * 6-9 1", false],
    ["crn-summer-mondays", "0 12 1-31 6-8 1", false],       // both day fields restricted: any day OR Monday
    ["crn-leap-day", "0 0 29 feb *", true],
    ["crn-leap-day", "0 0 28 2 *", false],
    ["crn-leap-day", "0 0 29 3 *", false],
    ["crn-start-of-hour-range", "0,1,2,3,4,5 9 1,15 * *", true],
    ["crn-start-of-hour-range", "0-4 9 1,15 * *", false],   // five runs, not six
    ["crn-start-of-hour-range", "0-5 9 1-15 * *", false],
    ["crn-every-seven", "0,7,14,21,28,35,42,49,56 * * * *", true],
    ["crn-every-seven", "*/7 */1 * * *", true],
    ["crn-every-seven", "*/7 * * * 1-5", false],
    ["crn-odd-days", "0 0 */2 * *", true],
    ["crn-odd-days", "0 0 1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31 * *", true],
    ["crn-odd-days", "0 0 2-30/2 * *", false],              // even days
    ["crn-weekday-10-30", "40,10 8-11 * * mon-fri", true],
    ["crn-weekday-10-30", "10,30 8-11 * * 1-5", false]
];

describe("the exercise set", () => {

    it("is valid, with real tool ids", () => assert.deepEqual(validateExerciseSet(set, { toolIds }), []));

    it("has at least 14 exercises over three difficulty levels", () => {
        assert.ok(set.exercises.length >= 14);
        assert.deepEqual([...new Set(set.exercises.map((e) => e.difficulty))].sort(), ["advanced", "beginner", "intermediate"]);
    });

    it("the catalog and the set description state the real number of exercises", () => {
        const tool = catalog.getToolById("cron-challenge-lab");
        assert.ok(tool.seo.description.includes(`with ${set.exercises.length} exercises`), tool.seo.description);
        assert.ok(set.description.includes("Nineteen"), set.description);
    });

    it("every solution and every starting expression is valid", () => {
        for (const ex of set.exercises) {
            assert.equal(engine.parseCron(ex.solution).state, "valid", ex.id);
            assert.equal(engine.parseCron(ex.starting).state, "valid", ex.id);
        }
    });

    it("covers the combined day-of-month and day-of-week rule, a leap day, and a step that restarts", () => {
        for (const id of ["crn-dom-or-dow", "crn-leap-day", "crn-every-seven", "crn-summer-mondays"]) assert.ok(byId(id), id);
        assert.match(byId("crn-dom-or-dow").explanation, /either one matches/);
    });

    it("never asks for a schedule that cannot run", () => {
        for (const ex of set.exercises) {
            const runs = engine.nextRuns(engine.parseCron(ex.solution), Date.parse(ex.reference), 3);
            assert.equal(runs.never, false, ex.id);
            assert.equal(runs.runs.length, 3, ex.id);
        }
    });

    it("the reference time text is computed in UTC", () => {
        assert.equal(stamp("2026-03-10T09:30:00Z"), "Tue 10 Mar 2026, 09:30 UTC");
        assert.equal(stamp("2028-02-29T00:00:00Z"), "Tue 29 Feb 2028, 00:00 UTC");
    });

    it("the dialect and the UTC assumption are on the page copy that describes each schedule", () => {
        for (const ex of set.exercises) assert.match(ex.requirement, /Reference time for the run list: \w{3} \d+ \w{3} \d{4}, \d\d:\d\d UTC/, ex.id);
    });

});

describe("each exercise against the evaluator", () => {

    it("the starting expression is not already correct", () => {
        for (const ex of set.exercises) assert.notEqual(verdict(ex, ex.starting), "correct", ex.id);
    });

    it("the solution is correct", () => {
        for (const ex of set.exercises) assert.equal(verdict(ex, ex.solution), "correct", ex.id);
    });

    it("the hand-written table of same and different schedules is judged as written", () => {
        for (const [id, text, same] of CLAIMS) {
            assert.equal(verdict(byId(id), text), same ? "correct" : "not-yet", `${id}: ${text}`);
        }
    });

    it("every exercise has at least one different-schedule claim and one same-schedule claim in the table, or is single-spelling by nature", () => {
        const withBoth = new Set(CLAIMS.filter(([, , s]) => s).map(([id]) => id));
        const withWrong = new Set(CLAIMS.filter(([, , s]) => !s).map(([id]) => id));
        for (const ex of set.exercises) assert.ok(withWrong.has(ex.id), `${ex.id} has no negative case`);
        assert.ok(withBoth.size >= 15);
    });

    it("a wrong valid expression names the parts that differ and lists three real next runs, never the answer", () => {
        const ex = byId("crn-weekdays-8");
        const r = evaluate(ex, "0 8 * * 1-6");
        assert.equal(r.verdict, "not-yet");
        assert.match(r.findings[0], /these parts differ: days/);
        assert.deepEqual(r.lines, ["Wed 11 Mar 2026, 08:00 UTC", "Thu 12 Mar 2026, 08:00 UTC", "Fri 13 Mar 2026, 08:00 UTC"]);
        assert.ok(!JSON.stringify(r).includes(ex.solution));
        assert.match(r.findings[1], /Tue 10 Mar 2026, 09:30 UTC/);
    });

    it("says which of minutes, hours, months and days differ", () => {
        const ex = byId("crn-daily-0230");
        assert.match(evaluate(ex, "31 3 * * *").findings[0], /minutes; hours/);
        assert.match(evaluate(ex, "30 2 * 6 *").findings[0], /months/);
    });

    it("an expression that never matches a real date says so", () => {
        const r = evaluate(byId("crn-leap-day"), "0 0 31 2 *");
        assert.equal(r.verdict, "not-yet");
        assert.ok(r.findings.some((f) => /never matches a real date/.test(f)));
        assert.deepEqual(r.lines, []);
    });

    it("a schedule with a leap day lists the real next leap days", () => {
        const r = evaluate(byId("crn-start-of-hour-range"), "0 0 29 2 *");
        assert.equal(r.verdict, "not-yet");
        assert.deepEqual(r.lines, ["Tue 29 Feb 2028, 00:00 UTC", "Sun 29 Feb 2032, 00:00 UTC", "Fri 29 Feb 2036, 00:00 UTC"]);
    });

});

describe("input the engine refuses is Cannot check", () => {

    const ex = () => byId("crn-hourly");

    it("too few fields, a value out of range and a bad name give the engine's message", () => {
        for (const text of ["* * * *", "61 * * * *", "0 25 * * *", "0 0 0 * *", "0 0 * 13 *", "0 0 * * funday", "0 0 * * * *", "*/0 * * * *", "-5 * * * *"]) {
            const r = evaluate(ex(), text);
            assert.equal(r.verdict, "cannot-check", text);
            assert.ok(r.findings[0].length > 5, text);
        }
    });

    it("an empty answer cannot be checked", () => assert.equal(verdict(ex(), "   "), "cannot-check"));

    it("an answer over 256 characters cannot be checked and is quick", () => {
        const started = Date.now();
        assert.equal(verdict(ex(), "0," + "1,".repeat(200) + "1 * * * *"), "cannot-check");
        assert.ok(Date.now() - started < 1000);
    });

    it("script, markup and prototype text is only ever data", () => {
        for (const text of ["<img src=x onerror=alert(1)>", "__proto__ * * * *", "constructor.constructor('return 1')()", "0 0 * * *; rm -rf /", "$(reboot) * * * *"]) {
            assert.equal(verdict(ex(), text), "cannot-check", text);
        }
        assert.equal(({}).polluted, undefined);
    });

    it("aliases such as @daily are read by the engine and compared by schedule", () => {
        const daily = { ...ex(), solution: "0 0 * * *" };
        assert.equal(evaluate(daily, "@daily").verdict, "correct");
        assert.equal(evaluate(daily, "@hourly").verdict, "not-yet");
    });

    it("the same expression gives the same result every time", () => {
        const a = JSON.stringify(evaluate(ex(), "0 * * * 1"));
        for (let i = 0; i < 3; i += 1) assert.equal(JSON.stringify(evaluate(ex(), "0 * * * 1")), a);
    });

});

describe("canonical()", () => {

    const c = (t) => canonical(engine.parseCron(t));

    it("ignores spelling: lists, ranges, steps, names and Sunday as 7", () => {
        assert.deepEqual(c("*/15 * * * *"), c("0,15,30,45 * * * *"));
        assert.deepEqual(c("0 0 * * 7"), c("0 0 * * 0"));
        assert.deepEqual(c("0 0 * jan-mar *"), c("0 0 * 1,2,3 *"));
    });

    it("tells the AND rule from the OR rule for the two day fields", () => {
        assert.notDeepEqual(c("0 0 15 * mon"), c("0 0 15 * *"));
        assert.notDeepEqual(c("0 0 15 * mon"), c("0 0 * * mon"));
        assert.notDeepEqual(c("0 0 1-31 * mon"), c("0 0 * * mon"));
    });

    it("a star-started step counts as a star field for the rule, as Cronie does", () => {
        assert.deepEqual(c("0 0 */1 * mon"), c("0 0 * * mon"));
    });

});

describe("independent oracle: a cron implementation written in Python", () => {

    const probe = spawnSync("python", ["-I", "-c", "import sys; sys.stdout.write('ok')"], { encoding: "utf8" });
    const available = probe.status === 0 && probe.stdout === "ok";

    const SCRIPT = String.raw`
import sys, json, datetime as dt

MONTHS = {m: i + 1 for i, m in enumerate("jan feb mar apr may jun jul aug sep oct nov dec".split())}
DAYS = {d: i for i, d in enumerate("sun mon tue wed thu fri sat".split())}

def field(text, lo, hi, names=None):
    star = text.startswith("*")
    values = set()
    for part in text.split(","):
        step = 1
        if "/" in part:
            part, s = part.split("/"); step = int(s)
            if step < 1: raise ValueError("step")
        def num(t):
            t = t.lower()
            if names and t in names: return names[t]
            if not t.isdigit(): raise ValueError("number " + t)
            return int(t)
        if part == "*": a, b = lo, hi
        elif "-" in part: x, y = part.split("-"); a, b = num(x), num(y)
        else:
            a = num(part); b = hi if step != 1 else a
        if a < lo or b > hi or a > b: raise ValueError("range")
        values.update(range(a, b + 1, step))
    return values, star

def parse(expr):
    f = expr.split()
    if len(f) != 5: raise ValueError("fields")
    minute, _ = field(f[0], 0, 59)
    hour, _ = field(f[1], 0, 23)
    dom, dstar = field(f[2], 1, 31)
    month, _ = field(f[3], 1, 12, MONTHS)
    dow, wstar = field(f[4], 0, 7, DAYS)
    dow = {d % 7 for d in dow}
    return dict(minute=minute, hour=hour, dom=dom, month=month, dow=dow, anded=dstar or wstar)

def day_ok(c, d):
    wd = (d.weekday() + 1) % 7   # Python: Monday is 0; cron: Sunday is 0
    if d.month not in c["month"]: return False
    a, b = d.day in c["dom"], wd in c["dow"]
    return (a and b) if c["anded"] else (a or b)

def days_between(start, stop):
    d = start
    while d < stop:
        yield d
        d += dt.timedelta(days=1)

def schedule(c, start, stop):
    days = {d for d in days_between(start, stop) if day_ok(c, d)}
    return days, c["hour"], c["minute"]

def next_runs(c, after, n):
    out = []
    d = after.date()
    while len(out) < n and d.year < 2200:
        if day_ok(c, d):
            for h in sorted(c["hour"]):
                for m in sorted(c["minute"]):
                    t = dt.datetime(d.year, d.month, d.day, h, m)
                    if t > after: out.append(t)
                    if len(out) == n: break
                if len(out) == n: break
        d += dt.timedelta(days=1)
    return out

req = json.loads(sys.stdin.buffer.read().decode("utf-8"))
START, STOP = dt.date(2026, 1, 1), dt.date(2030, 1, 1)
res = {"runs": [], "claims": []}
for item in req["runs"]:
    c = parse(item["expr"])
    ref = dt.datetime.strptime(item["reference"], "%Y-%m-%dT%H:%M:%SZ")
    res["runs"].append([int((t - dt.datetime(1970, 1, 1)).total_seconds() * 1000) for t in next_runs(c, ref, 3)])
for a, b in req["claims"]:
    try:
        same = schedule(parse(a), START, STOP) == schedule(parse(b), START, STOP)
        res["claims"].append(same)
    except Exception as e:
        res["claims"].append("ERR " + str(e))
sys.stdout.buffer.write(json.dumps(res).encode("ascii"))
`;

    const ask = () => {
        const input = JSON.stringify({
            runs: set.exercises.map((e) => ({ expr: e.solution, reference: e.reference })),
            claims: CLAIMS.map(([id, text]) => [byId(id).solution, text])
        });
        const run = spawnSync("python", ["-I", "-c", SCRIPT], { input, encoding: "utf8" });
        assert.equal(run.status, 0, run.stderr);
        return JSON.parse(run.stdout);
    };

    it("Python lists the same next three runs as the page's engine for every solution", { skip: available ? false : "python is not available on this machine" }, () => {
        const got = ask().runs;
        set.exercises.forEach((ex, i) => {
            const mine = engine.nextRuns(engine.parseCron(ex.solution), Date.parse(ex.reference), 3).runs.map((r) => r.ms);
            assert.deepEqual(mine, got[i], ex.id);
        });
    });

    it("comparing every run over four real calendar years agrees with the hand-written table and with the page", { skip: available ? false : "python is not available on this machine" }, () => {
        const got = ask().claims;
        CLAIMS.forEach(([id, text, same], i) => {
            assert.equal(typeof got[i], "boolean", `${id}: ${text}: ${got[i]}`);
            assert.equal(got[i], same, `${id}: ${text}: Python says ${got[i]}, the table says ${same}`);
        });
    });

});
