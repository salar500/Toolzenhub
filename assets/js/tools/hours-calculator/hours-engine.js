/* =========================================================
   ToolZen Hub
   Hours & Timesheet Calculator: the engine

   Adds up the time worked across several shifts. It is pure: no
   DOM, no network, no storage, no clock, no Date object and no
   time zone, so the same input always gives the same answer.

   Every duration is a whole number of MINUTES. There is no
   floating point anywhere in a duration: the only divisions are
   integer floors (hours from minutes, and the decimal-hours text),
   and there is no toFixed, no Math.round and no parseFloat. A
   test checks that this file contains none of them.

   Model (docs/tool-packs/23-hours-calculator.md):
     gross  = ((end - start) mod 1440 + 1440) mod 1440
              end earlier than start means the shift ends the next
              day; end equal to start is invalid, so a valid shift
              is 1 to 1439 minutes (at most 23 h 59 min)
     net    = gross - break   (break is 0 to gross, whole minutes)
     totals = sums over VALID rows only

   These are clock-time sums: no dates, no time zones, and a
   daylight-saving change is not adjusted.

   A row is one of four states:
     empty       nothing entered; ignored, never counted
     incomplete  something entered but a time is missing; not counted
     invalid     something entered that breaks a rule; not counted
     valid       counted in the totals

   Layers (kept separate): parse (text to minutes), classify (one
   row), summarize (all rows and totals), format (text for the page).
========================================================= */

export const MINUTES_PER_DAY = 1440;

export const MAX_SHIFT_MINUTES = 1439;

export const MAX_BREAK_MINUTES = 1439;

export const MAX_ROWS = 31;


/* =========================================================
   MESSAGES
========================================================= */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const MESSAGES = Object.freeze({
    needEnd: "Enter an end time.",
    needStart: "Enter a start time.",
    needBoth: "Enter start and end times for this shift.",
    equal: "Start and end are the same time. A shift must be at least 1 minute and less than 24 hours.",
    timeText: "Use 24-hour time such as 09:00 or 17:30.",
    timePartial: "Enter a complete time, such as 09:00.",
    breakText: "Break must be a whole number of minutes from 0 to 1,439.",
    breakTooLong: (breakMinutes, shiftMinutes) =>
        `Break is ${plural(breakMinutes, "minute", "minutes")} but the shift is ${plural(shiftMinutes, "minute", "minutes")}. The break cannot be longer than the shift.`
});


/* =========================================================
   PARSE
========================================================= */

const TIME = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

const BREAK = /^[0-9]{1,4}$/;

/* "HH:MM" (24-hour) to minutes after midnight, or null */
export function parseTime(text) {

    const match = TIME.exec(String(text ?? ""));

    return match === null ? null : Number(match[1]) * 60 + Number(match[2]);

}

/* break text to whole minutes: blank is 0; null when it is not a whole number from 0 to 1,439 */
export function parseBreak(text) {

    const trimmed = String(text ?? "").trim();

    if (trimmed === "") {
        return 0;
    }

    if (!BREAK.test(trimmed)) {
        return null;
    }

    const minutes = Number(trimmed);

    return minutes <= MAX_BREAK_MINUTES ? minutes : null;

}

/* minutes of a shift from start to end (both 0 to 1439), or null when they are equal */
export function shiftMinutes(start, end) {

    if (start === end) {
        return null;
    }

    return ((end - start) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;

}


/* =========================================================
   CLASSIFY ONE ROW
========================================================= */

/*
 * row: { start, end, breakText, startPartial, endPartial }
 *   start, end   the value of a time input ("" when empty)
 *   breakText    what was typed in the break box
 *   *Partial     true when the browser says the time box is half filled
 *
 * { state: "empty" }
 * { state: "incomplete", message }
 * { state: "invalid", field: "start" | "end" | "break", message }
 * { state: "valid", start, end, gross, breakMinutes, net, overnight }
 */
export function classifyRow(row) {

    const start = String(row.start ?? "");
    const end = String(row.end ?? "");
    const breakText = String(row.breakText ?? "");

    const startPartial = row.startPartial === true;
    const endPartial = row.endPartial === true;

    const hasStart = start !== "" || startPartial;
    const hasEnd = end !== "" || endPartial;
    const hasBreak = breakText.trim() !== "";

    if (!hasStart && !hasEnd && !hasBreak) {
        return { state: "empty" };
    }

    /* something typed that is not a time or a whole number of minutes is wrong whatever else is missing */
    if (startPartial || (start !== "" && parseTime(start) === null)) {
        return { state: "invalid", field: "start", message: startPartial ? MESSAGES.timePartial : MESSAGES.timeText };
    }

    if (endPartial || (end !== "" && parseTime(end) === null)) {
        return { state: "invalid", field: "end", message: endPartial ? MESSAGES.timePartial : MESSAGES.timeText };
    }

    const breakMinutes = parseBreak(breakText);

    if (breakMinutes === null) {
        return { state: "invalid", field: "break", message: MESSAGES.breakText };
    }

    if (!hasStart || !hasEnd) {

        let message = MESSAGES.needBoth;

        if (hasStart) {
            message = MESSAGES.needEnd;
        } else if (hasEnd) {
            message = MESSAGES.needStart;
        }

        return { state: "incomplete", message };

    }

    const startMinutes = parseTime(start);
    const endMinutes = parseTime(end);

    const gross = shiftMinutes(startMinutes, endMinutes);

    if (gross === null) {
        return { state: "invalid", field: "end", message: MESSAGES.equal };
    }

    if (breakMinutes > gross) {
        return { state: "invalid", field: "break", message: MESSAGES.breakTooLong(breakMinutes, gross) };
    }

    return {
        state: "valid",
        start,
        end,
        gross,
        breakMinutes,
        net: gross - breakMinutes,
        overnight: endMinutes < startMinutes
    };

}


/* =========================================================
   SUMMARIZE ALL ROWS
========================================================= */

/*
 * { rows: [classification...],
 *   counts: { empty, incomplete, invalid, valid },
 *   included, excluded,            valid rows, and incomplete + invalid rows
 *   totals: null | { gross, breakMinutes, net } }   sums over valid rows only
 */
export function summarize(rows) {

    const classified = rows.map(classifyRow);

    const counts = { empty: 0, incomplete: 0, invalid: 0, valid: 0 };

    let gross = 0;
    let breakMinutes = 0;
    let net = 0;

    for (const row of classified) {

        counts[row.state] += 1;

        if (row.state === "valid") {
            gross += row.gross;
            breakMinutes += row.breakMinutes;
            net += row.net;
        }

    }

    return {
        rows: classified,
        counts,
        included: counts.valid,
        excluded: counts.incomplete + counts.invalid,
        totals: counts.valid === 0 ? null : { gross, breakMinutes, net }
    };

}


/* =========================================================
   FORMAT
========================================================= */

const pad2 = (n) => String(n).padStart(2, "0");

/* 450 -> "7:30", 0 -> "0:00", 44609 -> "743:29" */
export function formatHM(minutes) {

    return `${Math.floor(minutes / 60)}:${pad2(minutes % 60)}`;

}

/* 450 -> "7 hours 30 minutes", 60 -> "1 hour 0 minutes" */
export function spokenDuration(minutes) {

    return `${plural(Math.floor(minutes / 60), "hour", "hours")} ${plural(minutes % 60, "minute", "minutes")}`;

}

/*
 * Decimal hours to two places, from whole minutes, by integer arithmetic only:
 * hundredths = floor((minutes * 100 + 30) / 60)  (round half up to two places).
 * 20 -> "0.33", 440 -> "7.33", 525 -> "8.75", 1439 -> "23.98".
 */
export function decimalHours(minutes) {

    const hundredths = Math.floor((minutes * 100 + 30) / 60);

    return `${Math.floor(hundredths / 100)}.${pad2(hundredths % 100)}`;

}

/* "3 rows included", "1 row excluded: 1 incomplete" ... */
export function describeRows(summary) {

    const { counts, included, excluded } = summary;

    const includedText = `${plural(included, "row", "rows")} included in the total`;

    let excludedText = "No rows excluded";

    if (excluded > 0) {

        const parts = [];

        if (counts.incomplete > 0) {
            parts.push(`${counts.incomplete} incomplete`);
        }

        if (counts.invalid > 0) {
            parts.push(`${counts.invalid} invalid`);
        }

        excludedText = `${plural(excluded, "row", "rows")} excluded: ${parts.join(", ")}`;

    }

    return { includedText, excludedText };

}

/* the one sentence a screen reader hears after a change */
export function announcement(summary) {

    const { counts, included, excluded } = summary;

    let text = included === 0
        ? "No shifts counted yet."
        : `Total ${spokenDuration(summary.totals.net)}, ${decimalHours(summary.totals.net)} decimal hours, from ${plural(included, "shift", "shifts")}.`;

    if (excluded > 0) {

        const parts = [];

        if (counts.incomplete > 0) {
            parts.push(`${counts.incomplete} incomplete`);
        }

        if (counts.invalid > 0) {
            parts.push(`${counts.invalid} invalid`);
        }

        text += ` ${plural(excluded, "row", "rows")} not counted: ${parts.join(", ")}.`;

    }

    return text;

}


/* =========================================================
   EXAMPLE
========================================================= */

/* the worked example on the page: 8:00 + 7:15 + 4:00 = 19:15, which is 19.25 decimal hours */
export const EXAMPLE_ROWS = Object.freeze([
    Object.freeze({ start: "09:00", end: "17:30", breakText: "30" }),
    Object.freeze({ start: "22:00", end: "06:00", breakText: "45" }),
    Object.freeze({ start: "13:00", end: "17:00", breakText: "" })
]);
