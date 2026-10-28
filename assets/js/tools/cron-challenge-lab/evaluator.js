/* =========================================================
   ToolZen Hub
   Cron Challenge Lab: the evaluator (pure)

   evaluate(exercise, text) -> { verdict, summary, findings?, lines? }

   The expression is parsed by the Cron Expression Explainer's own
   engine (Cronie crontab syntax, five fields, at most 256 characters,
   run times in UTC). It is judged by WHAT SCHEDULE it describes, not
   by how it is written: a step of 15 and the list 0, 15, 30, 45 are
   the same.

   How two schedules are compared (no time window, so the answer does
   not depend on how far ahead anyone looks):
     - the set of minutes, the set of hours and the set of months, and
     - a table that says, for every day of the month (1 to 31) and
       every day of the week (Sunday to Saturday), whether that day
       matches, using Cronie's rule: both day fields must match when
       either one is a star field, and either one is enough when
       neither is.
   Two expressions are the same schedule when all four agree.
   Not compared: time zones and daylight saving time (run times are
   UTC), and the length of a particular month. Two expressions that
   can never match a real date (such as 30 February and 31 February)
   would differ in the table, so no exercise asks for one.
   No eval, no regex built from the answer, no HTML.
========================================================= */

import { parseCron, nextRuns, formatRun, MAX_INPUT_CHARS } from "../cron-explainer/cron-engine.js";
import { stamp } from "./exercises.js";

export const MAX_RESPONSE_CHARS = MAX_INPUT_CHARS;
const RUNS_SHOWN = 3;

/** The canonical form of a valid parse: sorted value sets and the 31 x 7 day table. */
export function canonical(parsed) {

    const [minute, hour, dom, month, dow] = parsed.fields.map((f) => f.values);
    const and = parsed.flags.domStar || parsed.flags.dowStar;
    const dayOfWeek = new Set(dow.map((v) => v % 7));
    const dayOfMonth = new Set(dom);

    let table = "";
    for (let d = 1; d <= 31; d += 1) {
        for (let w = 0; w < 7; w += 1) {
            const a = dayOfMonth.has(d), b = dayOfWeek.has(w);
            table += (and ? a && b : a || b) ? "1" : "0";
        }
    }

    const sorted = (values) => [...new Set(values)].sort((x, y) => x - y).join(",");

    return { minute: sorted(minute), hour: sorted(hour), month: sorted(month), days: table };

}

const FIELD_WORD = { minute: "minutes", hour: "hours", month: "months", days: "days (the day of the month and day of the week together)" };

export function evaluate(exercise, text) {

    const given = parseCron(text);

    if (given.state === "empty") {
        return { verdict: "cannot-check", summary: "There is nothing to check yet. Type an expression first." };
    }

    if (given.state !== "valid") {
        return {
            verdict: "cannot-check",
            summary: "The expression could not be read, so it was not checked.",
            findings: [given.error?.message ?? "The expression is not valid."]
        };
    }

    const target = parseCron(exercise.solution);

    if (target.state !== "valid") throw new Error("the exercise solution is not a valid expression");

    const mine = canonical(given);
    const wanted = canonical(target);
    const differing = Object.keys(wanted).filter((k) => mine[k] !== wanted[k]);

    if (differing.length === 0) {
        return { verdict: "correct", summary: "The expression describes exactly the schedule this exercise asks for." };
    }

    const reference = Date.parse(exercise.reference);
    const upcoming = nextRuns(given, reference, RUNS_SHOWN);

    const findings = [`Compared with the schedule asked for, these parts differ: ${differing.map((k) => FIELD_WORD[k]).join("; ")}.`];

    if (upcoming.never || upcoming.runs.length === 0) {
        findings.push("This expression never matches a real date.");
    } else {
        findings.push(`From the reference time, ${stamp(exercise.reference)}, your expression runs next at:`);
    }

    return {
        verdict: "not-yet",
        summary: "The expression is valid, but it describes a different schedule.",
        findings,
        lines: upcoming.runs.map((r) => formatRun(r))
    };

}
