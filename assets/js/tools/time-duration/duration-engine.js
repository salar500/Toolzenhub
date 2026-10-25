/* =========================================================
   ToolZen Hub
   Time Duration Calculator: the engine (pure, no DOM, no clock)

   The rules are frozen in docs/tool-packs/34-time-tools-ecosystem.md.

   A duration is a LENGTH of time, held as a whole number of
   seconds. It is not a clock time and not a calendar interval:
   no date, no time zone and no daylight-saving rule can touch it,
   and a day here is always exactly 24 hours. Every sum is integer
   arithmetic, so 0.1 + 0.2 style drift cannot happen.

   Accepted ways to write one length (a row):
       1:45        hours and minutes
       1:45:30     hours, minutes and seconds
       1h 45m 30s  any of h, m, s (also hr, hrs, hour(s), min,
                   mins, minute(s), sec, secs, second(s)), in
                   that order, each once
       90m  45s    a single unit
       1.75h       a decimal, only when it is a whole number of
                   seconds (1.75h is exactly 6300 seconds; 1.3333h
                   is refused rather than rounded)

   Checked against an independent reference
   (tests/fixtures/time-duration-golden.py, Python timedelta).
========================================================= */

export const LIMITS = Object.freeze({
    rows: 20,
    /* 99,999 hours 59 minutes 59 seconds in one row */
    maxRowSeconds: 99_999 * 3600 + 59 * 60 + 59,
    maxFractionDigits: 6
});

const UNIT_SECONDS = Object.freeze({ h: 3600, m: 60, s: 1 });

const UNIT_WORDS = Object.freeze({
    h: "h", hr: "h", hrs: "h", hour: "h", hours: "h",
    m: "m", min: "m", mins: "m", minute: "m", minutes: "m",
    s: "s", sec: "s", secs: "s", second: "s", seconds: "s"
});

const UNITS_HELP =
    "Write a length as 1:45, 1:45:30, 1h 45m, 90m or 45s.";

export const MESSAGES = Object.freeze({
    unreadable: `That is not a length of time. ${UNITS_HELP}`,
    tooLong: "That length is too long. The limit is 99,999 hours in one row.",
    fraction: "A decimal is accepted only when it is a whole number of seconds, for example 1.75h or 0.5m. Write the rest as minutes and seconds.",
    clockPart: "Minutes and seconds must be 0 to 59 in the 1:45 style.",
    order: "Write the units in the order hours, minutes, seconds, each once."
});


/* =========================================================
   READING ONE LENGTH
   { state: "blank" } | { state: "invalid", message } | { state: "valid", seconds }
========================================================= */

/* "1.75" of a unit worth `per` seconds to whole seconds, or null when it is not a whole number of seconds */
function scaled(numberText, per) {

    const [whole, fraction = ""] = numberText.split(".");

    if (fraction.length > LIMITS.maxFractionDigits) {
        return null;
    }

    const scale = 10 ** fraction.length;

    const numerator = Number(whole + fraction) * per;

    return numerator % scale === 0 ? numerator / scale : null;

}

export function parseDuration(text) {

    const value = String(text ?? "").trim().toLowerCase();

    if (value === "") {
        return { state: "blank" };
    }

    let seconds = null;

    let match = /^(\d{1,6}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value);

    if (match) {

        const minutes = Number(match[2]);
        const secs = match[3] === undefined ? 0 : Number(match[3]);

        if (minutes > 59 || secs > 59) {
            return { state: "invalid", message: MESSAGES.clockPart };
        }

        seconds = Number(match[1]) * 3600 + minutes * 60 + secs;

    } else {

        const parts = [];

        const rest = value.replace(
            /(\d+(?:\.\d+)?)\s*([a-z]+)/g,
            (whole, amount, word) => {
                parts.push({ amount, unit: UNIT_WORDS[word] ?? null, word });
                return " ";
            }
        );

        if (parts.length === 0 || rest.trim() !== "" || parts.some(part => part.unit === null)) {
            return { state: "invalid", message: MESSAGES.unreadable };
        }

        const order = parts.map(part => part.unit);

        if (new Set(order).size !== order.length || order.join("") !== ["h", "m", "s"].filter(u => order.includes(u)).join("")) {
            return { state: "invalid", message: MESSAGES.order };
        }

        seconds = 0;

        for (const part of parts) {

            const amount = scaled(part.amount, UNIT_SECONDS[part.unit]);

            if (amount === null) {
                return { state: "invalid", message: MESSAGES.fraction };
            }

            seconds += amount;

        }

    }

    if (!Number.isSafeInteger(seconds) || seconds > LIMITS.maxRowSeconds) {
        return { state: "invalid", message: MESSAGES.tooLong };
    }

    return { state: "valid", seconds };

}


/* =========================================================
   ADDING AND SUBTRACTING
   rows: [{ sign: "+" | "-", text }]
   { status: "empty" }
   { status: "invalid", errors: [{ index, message }] }
   { status: "ok", seconds (signed), negative, counted }
========================================================= */

export function sumRows(rows) {

    const errors = [];

    let total = 0;
    let counted = 0;

    rows.forEach((row, index) => {

        const parsed = parseDuration(row.text);

        if (parsed.state === "blank") {
            return;
        }

        if (parsed.state === "invalid") {
            errors.push({ index, message: parsed.message });
            return;
        }

        total += (row.sign === "-" ? -1 : 1) * parsed.seconds;

        counted += 1;

    });

    if (errors.length > 0) {
        return { status: "invalid", errors };
    }

    if (counted === 0) {
        return { status: "empty" };
    }

    return { status: "ok", seconds: total, negative: total < 0, counted };

}


/* =========================================================
   FORMATTING (always from the absolute value; the sign is separate)
========================================================= */

const pad2 = (n) => String(n).padStart(2, "0");

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* { days, hours, minutes, seconds } with a day of exactly 24 hours */
export function breakdown(totalSeconds) {

    const abs = Math.abs(totalSeconds);

    return {
        days: Math.floor(abs / 86400),
        hours: Math.floor((abs % 86400) / 3600),
        minutes: Math.floor((abs % 3600) / 60),
        seconds: abs % 60
    };

}

/* "1 day 2 hours 3 minutes 4 seconds", leaving out zero parts; "0 seconds" for none */
export function wordsText(totalSeconds) {

    const { days, hours, minutes, seconds } = breakdown(totalSeconds);

    const parts = [];

    if (days) parts.push(plural(days, "day"));
    if (hours) parts.push(plural(hours, "hour"));
    if (minutes) parts.push(plural(minutes, "minute"));
    if (seconds) parts.push(plural(seconds, "second"));

    return parts.length === 0 ? "0 seconds" : parts.join(" ");

}

/* total hours are not wrapped at 24: 125:30:00 */
export function clockText(totalSeconds) {

    const abs = Math.abs(totalSeconds);

    return `${Math.floor(abs / 3600)}:${pad2(Math.floor((abs % 3600) / 60))}:${pad2(abs % 60)}`;

}

/*
 * A quantity of `per` seconds per unit, to `places` decimals, rounded half up
 * on the absolute value by integer arithmetic. { text, exact } where `exact`
 * says the text is the value and not a rounding of it.
 */
export function decimalOf(totalSeconds, per, places) {

    const abs = Math.abs(totalSeconds);
    const scale = 10 ** places;

    const numerator = abs * scale;
    const scaledValue = Math.floor((2 * numerator + per) / (2 * per));

    const whole = Math.floor(scaledValue / scale);
    const fraction = String(scaledValue % scale).padStart(places, "0");

    return {
        text: places === 0 ? String(whole) : `${whole}.${fraction}`,
        exact: numerator % per === 0
    };

}

export function resultSet(totalSeconds) {

    const hours2 = decimalOf(totalSeconds, 3600, 2);
    const hours4 = decimalOf(totalSeconds, 3600, 4);
    const minutes = decimalOf(totalSeconds, 60, 2);

    return {
        negative: totalSeconds < 0,
        sign: totalSeconds < 0 ? "−" : "",
        words: wordsText(totalSeconds),
        clock: clockText(totalSeconds),
        decimalHours: hours2.text,
        decimalHoursLong: hours4.text,
        decimalHoursExact: hours4.exact,
        totalMinutes: minutes.text,
        totalMinutesExact: minutes.exact,
        totalSeconds: String(Math.abs(totalSeconds))
    };

}

export function copyText(totalSeconds) {

    const r = resultSet(totalSeconds);

    const sign = r.negative ? "-" : "";

    return [
        `Total: ${sign}${r.words} (${r.negative ? "-" : ""}${r.clock})`,
        `Decimal hours: ${sign}${r.decimalHours}${r.decimalHoursExact ? "" : " (rounded)"}`,
        `Total minutes: ${sign}${r.totalMinutes}${r.totalMinutesExact ? "" : " (rounded)"}`,
        `Total seconds: ${sign}${r.totalSeconds}`
    ].join("\n");

}
