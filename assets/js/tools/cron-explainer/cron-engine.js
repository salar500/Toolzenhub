/* =========================================================
   ToolZen Hub
   Cron Expression Explainer: the engine

   Reads ONE dialect: cronie crontab syntax with five time fields
   (the cronie project, pinned in docs/tool-packs/25-cron-expression-explainer.md).
   It is not Kubernetes, GitHub Actions, Quartz, AWS or any other
   scheduler's syntax, and nothing here guesses at those.

   Pure: no DOM, no network, no storage, no eval, no Date object, no
   clock of its own (the time is an argument). The same text always
   gives the same answer, and every loop has a fixed bound.

   Parts (kept apart on purpose):
     1. calendar    integer civil-date routines (no Date)
     2. parsing     a hand-written scanner -> an intermediate result
     3. matching    the day-of-month / day-of-week rule and the next runs
     4. explaining  field meanings, a summary for a few exact shapes, notes

   Contract:

     parseCron(text)
       { state: "empty" }
       { state: "invalid", error: { key, message, field?, fieldName?, text?, position?, limit? } }
       { state: "valid", dialect, input, normalized, alias, expansion, fields, flags }

     nextRuns(parsed, nowMs, count = 5)
       { runs: [ { ms, year, month, day, hour, minute, weekday, text } ], never, complete, ... }

     explainCron(text, { nowMs })
       { state: "empty" } | { state: "invalid", error } | { state: "explained", ... }

   "Never repair": nothing is corrected, reordered or guessed. Positions
   are 1-based character positions in the text as typed.
========================================================= */

export const DIALECT = "Cronie crontab syntax, five time fields";

/* Safety limits of THIS tool. Cronie itself allows far more. */
export const MAX_INPUT_CHARS = 256;
export const MAX_FIELD_CHARS = 64;
/* A defensive limit. In practice the 64-character field limit above speaks first: 33 items need at least
   65 characters (33 digits and 32 commas), so the list-count error is normally unreachable. Both limits are kept. */
export const MAX_LIST_ITEMS = 32;
export const MAX_NUMBER_DIGITS = 3;
/* One full 400-year Gregorian cycle, 20,871 whole weeks. */
export const SEARCH_DAYS = 146097;
export const DEFAULT_RUN_COUNT = 5;
export const MAX_SUMMARY_VALUES = 6;
const MAX_ABS_MS = 8.64e15;

const MS_PER_MINUTE = 60000;
const MS_PER_DAY = 86400000;

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DOW_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const FIELDS = [
    { key: "minute", name: "minute", low: 0, high: 59 },
    { key: "hour", name: "hour", low: 0, high: 23 },
    { key: "dayOfMonth", name: "day of month", low: 1, high: 31 },
    { key: "month", name: "month", low: 1, high: 12, names: MONTH_NAMES, nameBase: 1 },
    { key: "dayOfWeek", name: "day of week", low: 0, high: 7, names: DOW_NAMES, nameBase: 0 }
];

/*
   Whole-expression aliases. The star flags are cronie's own (entry.c):
   @yearly, @annually and @monthly set the day-of-week flag, @weekly sets
   the day-of-month flag, @daily, @midnight and @hourly set neither.
*/
export const ALIASES = {
    yearly: { expansion: "0 0 1 1 *", domStar: false, dowStar: true },
    annually: { expansion: "0 0 1 1 *", domStar: false, dowStar: true },
    monthly: { expansion: "0 0 1 * *", domStar: false, dowStar: true },
    weekly: { expansion: "0 0 * * 0", domStar: true, dowStar: false },
    daily: { expansion: "0 0 * * *", domStar: false, dowStar: false },
    midnight: { expansion: "0 0 * * *", domStar: false, dowStar: false, notInManual: true },
    hourly: { expansion: "0 * * * *", domStar: false, dowStar: false }
};

export const ASSUMPTIONS = [
    "The times are UTC. They are not the time zone of any server, and daylight saving is not modelled.",
    "The expression is read as cronie crontab syntax with five time fields, not as Kubernetes, GitHub Actions, Quartz or AWS syntax.",
    "\"Now\" is this device's clock, read once when you explain.",
    "A real scheduler may start a job later than the minute shown."
];

/* ------------------------------------------------------------
   1. Calendar: integer civil-date routines (proleptic Gregorian)
------------------------------------------------------------ */

export function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
    if (month === 2) return isLeapYear(year) ? 29 : 28;
    return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/** Days since 1970-01-01 of a civil date. */
export function daysFromCivil(year, month, day) {
    const y = month <= 2 ? year - 1 : year;
    const era = Math.floor(y / 400);
    const yoe = y - era * 400;
    const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
}

/** The civil date of a day count since 1970-01-01. */
export function civilFromDays(days) {
    const z = days + 719468;
    const era = Math.floor(z / 146097);
    const doe = z - era * 146097;
    const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
    const mp = Math.floor((5 * doy + 2) / 153);
    const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
    const month = mp < 10 ? mp + 3 : mp - 9;
    return { year: yoe + era * 400 + (month <= 2 ? 1 : 0), month, day };
}

/** Day of the week of a day count since 1970-01-01: 0 is Sunday (1970-01-01 was a Thursday). */
export function weekdayFromDays(days) {
    return (((days % 7) + 7) + 4) % 7;
}

/* ------------------------------------------------------------
   2. Parsing
------------------------------------------------------------ */

const isBlank = (c) => c === " " || c === "\t";
const isDigit = (c) => c >= "0" && c <= "9";
const isAlnum = (c) => isDigit(c) || (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");

function allDigits(s) {
    if (s.length === 0) return false;
    for (let i = 0; i < s.length; i += 1) if (!isDigit(s[i])) return false;
    return true;
}

function allLetters(s) {
    if (s.length === 0) return false;
    for (let i = 0; i < s.length; i += 1) {
        const c = s[i];
        if (!((c >= "a" && c <= "z") || (c >= "A" && c <= "Z"))) return false;
    }
    return true;
}

function runEnd(s, from) {
    let i = from;
    while (i < s.length && isAlnum(s[i])) i += 1;
    return i;
}

function hex4(code) {
    return code.toString(16).toUpperCase().padStart(4, "0");
}

function failure(key, message, info = {}) {
    return { error: { key, message, ...info } };
}

const fieldLabel = (i) => `Field ${i + 1} (${FIELDS[i].name})`;

function joinAnd(list) {
    if (list.length <= 1) return list.join("");
    return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

function ordinal(n) {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return `${n}th`;
    const last = n % 10;
    return `${n}${last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th"}`;
}

function errorContext(i, ctx) {
    return { field: i + 1, fieldName: FIELDS[i].name, ...ctx };
}

/** A number token or name token to its value, or a failure. */
function resolveAtom(i, token, position) {
    const f = FIELDS[i];
    const where = fieldLabel(i);
    if (allDigits(token)) {
        if (token.length > MAX_NUMBER_DIGITS) {
            return failure("number-too-long",
                `${where}: \`${token.slice(0, 20)}\` has more than ${MAX_NUMBER_DIGITS} digits. Numbers have at most ${MAX_NUMBER_DIGITS} digits here; this is a limit of this tool, not of cron.`,
                errorContext(i, { text: token.slice(0, 20), position, limit: MAX_NUMBER_DIGITS }));
        }
        const n = parseInt(token, 10);
        if (n < f.low || n > f.high) {
            return failure("out-of-range",
                `${where}: ${n} is outside ${f.low} to ${f.high} for the ${f.name} field.`,
                errorContext(i, { text: token, position }));
        }
        return { value: n };
    }
    if (allLetters(token)) {
        const lower = token.toLowerCase();
        if (lower === "l" || lower === "w" || lower === "lw") {
            return failure("lw-extension",
                `${where}: \`${token}\`: \`L\`, \`W\` and \`#\` are Quartz and AWS cron extensions and are not valid in cronie crontab syntax.`,
                errorContext(i, { text: token, position }));
        }
        if (lower === "h") {
            return failure("hash-h",
                `${where}: \`${token}\`: \`H\` is not valid in cronie crontab syntax.`,
                errorContext(i, { text: token, position }));
        }
        if (f.names) {
            const idx = f.names.indexOf(lower);
            if (token.length === 3 && idx >= 0) return { value: idx + f.nameBase };
            if (token.length > 3) {
                for (const n of f.names) {
                    if (lower.startsWith(n)) {
                        return failure("name-full",
                            `${where}: \`${token}\` is not valid: use \`${n}\`. Names are exactly three letters.`,
                            errorContext(i, { text: token, position }));
                    }
                }
            }
            return failure("name-invalid",
                `${where}: \`${token}\` is not a ${f.name} name. Use three letters, such as \`${f.names[0]}\`, or a number.`,
                errorContext(i, { text: token, position }));
        }
        if (token.length === 3 && (MONTH_NAMES.includes(lower) || DOW_NAMES.includes(lower))) {
            return failure("name-wrong-field",
                `${where}: \`${token}\` is a name. Names are valid only in the month and day-of-week fields.`,
                errorContext(i, { text: token, position }));
        }
        return failure("bad-token",
            `${where}: \`${token}\` is not a number.`,
            errorContext(i, { text: token, position }));
    }
    /* digits and letters mixed */
    const last = token[token.length - 1];
    if ((last === "L" || last === "l" || last === "W" || last === "w") && allDigits(token.slice(0, -1))) {
        return failure("lw-extension",
            `${where}: \`${token}\`: \`L\`, \`W\` and \`#\` are Quartz and AWS cron extensions and are not valid in cronie crontab syntax.`,
            errorContext(i, { text: token, position }));
    }
    return failure("bad-token",
        `${where}: \`${token}\` is not a number${f.names ? " or a name" : ""}.`,
        errorContext(i, { text: token, position }));
}

/** The number after a "/" : digits only, 1 to 3 characters, at least 1. */
function resolveStep(i, token, position, itemText) {
    const where = fieldLabel(i);
    if (!allDigits(token)) {
        return failure("bad-step",
            `${where}: \`${token}\` is not a valid step; a step is a whole number of at least 1.`,
            errorContext(i, { text: token, position }));
    }
    if (token.length > MAX_NUMBER_DIGITS) {
        return failure("number-too-long",
            `${where}: \`${token.slice(0, 20)}\` has more than ${MAX_NUMBER_DIGITS} digits. Numbers have at most ${MAX_NUMBER_DIGITS} digits here; this is a limit of this tool, not of cron.`,
            errorContext(i, { text: token.slice(0, 20), position, limit: MAX_NUMBER_DIGITS }));
    }
    const n = parseInt(token, 10);
    if (n === 0) {
        return failure("step-zero",
            `${where}: \`${itemText}\` has a step of 0; a step must be at least 1.`,
            errorContext(i, { text: itemText, position }));
    }
    return { value: n };
}

function badCharFailure(i, ch, position, itemText) {
    return failure("bad-char",
        `${fieldLabel(i)}: \`${ch}\` is not valid in \`${itemText}\`.`,
        errorContext(i, { text: itemText, position }));
}

/** One list item of one field. `pos` is the 1-based position of the item's first character. */
function parseItem(i, s, pos) {
    const f = FIELDS[i];
    const where = fieldLabel(i);

    for (let k = 0; k < s.length; k += 1) {
        const c = s[k];
        if (c === "?") {
            return failure("question-mark",
                `${where}: \`?\` is not valid in cronie crontab syntax. Quartz and AWS use it in the day fields, and Kubernetes reads it as \`*\`. Here, use \`*\`.`,
                errorContext(i, { text: s, position: pos + k }));
        }
        if (c === "#") {
            return failure("lw-extension",
                `${where}: \`${s}\`: \`L\`, \`W\` and \`#\` are Quartz and AWS cron extensions and are not valid in cronie crontab syntax.`,
                errorContext(i, { text: s, position: pos + k }));
        }
        if (c === "~") {
            return failure("tilde",
                `${where}: \`~\` picks a random value when cronie reads the file, so it is not a fixed schedule. This tool does not explain it.`,
                errorContext(i, { text: s, position: pos + k }));
        }
    }

    /* A step after "*" or after a range; shared tail */
    const stepTail = (start, base) => {
        /* s[start] === "/" */
        const end = runEnd(s, start + 1);
        if (end === start + 1) {
            return failure("step-missing",
                `${where}: \`${s}\`: the \`/\` needs a step number after it.`,
                errorContext(i, { text: s, position: pos + start }));
        }
        const step = resolveStep(i, s.slice(start + 1, end), pos + start + 1, s);
        if (step.error) return step;
        if (end < s.length) {
            if (s[end] === "/") {
                return failure("step-trailing",
                    `${where}: \`${s}\`: after a step the item must end; a second \`/\` is not valid.`,
                    errorContext(i, { text: s, position: pos + end }));
            }
            return badCharFailure(i, s[end], pos + end, s);
        }
        return { item: { ...base, step: step.value } };
    };

    if (s[0] === "*") {
        const base = { kind: "star", text: s, from: f.low, to: f.high, step: 1 };
        if (s.length === 1) return { item: base };
        if (s[1] === "/") return stepTail(1, base);
        if (s[1] === "-") {
            return failure("star-range",
                `${where}: \`${s}\`: a range cannot start with \`*\`.`,
                errorContext(i, { text: s, position: pos + 1 }));
        }
        return badCharFailure(i, s[1], pos + 1, s);
    }

    const end1 = runEnd(s, 0);
    if (end1 === 0) {
        return failure("bad-char",
            `${where}: \`${s[0]}\` is not valid at the start of \`${s}\`.`,
            errorContext(i, { text: s, position: pos }));
    }
    const first = resolveAtom(i, s.slice(0, end1), pos);
    if (first.error) return first;
    if (end1 === s.length) {
        return { item: { kind: "number", text: s, from: first.value, to: first.value, step: 1 } };
    }
    if (s[end1] === "/") {
        return failure("step-after-number",
            `${where}: \`${s}\`: in cronie crontab syntax, a step must follow \`*\` or a range, such as \`0-59/35\`. Some other schedulers document a start value with a step (GitHub Actions \`20/15\`, Quartz \`0/15\`, AWS \`1/10\`); that form is not read here.`,
            errorContext(i, { text: s, position: pos + end1 }));
    }
    if (s[end1] !== "-") return badCharFailure(i, s[end1], pos + end1, s);

    const end2 = runEnd(s, end1 + 1);
    if (end2 === end1 + 1) {
        return failure("range-missing-end",
            `${where}: \`${s}\`: the \`-\` needs an end value after it.`,
            errorContext(i, { text: s, position: pos + end1 }));
    }
    const second = resolveAtom(i, s.slice(end1 + 1, end2), pos + end1 + 1);
    if (second.error) return second;
    if (first.value > second.value) {
        const rangeText = s.slice(0, end2);
        return failure("reversed-range",
            `${where}: the range \`${rangeText}\` runs backwards. In crontab the first number must be at most the second.`,
            errorContext(i, { text: rangeText, position: pos }));
    }
    const base = { kind: "range", text: s, from: first.value, to: second.value, step: 1 };
    if (end2 === s.length) return { item: { ...base, text: s } };
    if (s[end2] === "/") return stepTail(end2, base);
    if (s[end2] === "-") {
        return failure("range-chain",
            `${where}: \`${s}\`: a range has two ends only; \`-\` cannot appear twice.`,
            errorContext(i, { text: s, position: pos + end2 }));
    }
    return badCharFailure(i, s[end2], pos + end2, s);
}

/** One whole field. `pos` is the 1-based position of its first character. */
function parseField(i, text, pos) {
    const f = FIELDS[i];
    if (text.length > MAX_FIELD_CHARS) {
        return failure("field-too-long",
            `${fieldLabel(i)} has ${text.length} characters; this tool accepts at most ${MAX_FIELD_CHARS} per field. This is a limit of this tool, not of cron.`,
            errorContext(i, { text: text.slice(0, 20), position: pos, limit: MAX_FIELD_CHARS }));
    }

    const raws = [];
    let start = 0;
    for (let k = 0; k <= text.length; k += 1) {
        if (k === text.length || text[k] === ",") {
            raws.push({ s: text.slice(start, k), at: start });
            start = k + 1;
        }
    }
    if (raws.length > MAX_LIST_ITEMS) {
        return failure("list-too-many",
            `${fieldLabel(i)} has ${raws.length} list items; this tool accepts at most ${MAX_LIST_ITEMS}. This is a limit of this tool, not of cron.`,
            errorContext(i, { text: text.slice(0, 20), position: pos, limit: MAX_LIST_ITEMS }));
    }

    const items = [];
    const counts = new Map();
    const warnings = [];
    let sundayWritten = false;
    for (const raw of raws) {
        if (raw.s === "") {
            return failure("empty-item",
                `${fieldLabel(i)}: \`${text}\` has an empty list item (a comma with nothing beside it).`,
                errorContext(i, { text, position: pos + raw.at }));
        }
        const parsed = parseItem(i, raw.s, pos + raw.at);
        if (parsed.error) return parsed;
        const item = parsed.item;
        items.push(item);
        for (let v = item.from; v <= item.to; v += item.step) {
            counts.set(v, (counts.get(v) || 0) + 1);
            if (i === 4 && item.kind !== "star" && (v === 0 || v === 7)) sundayWritten = true;
        }
        if (item.step > 1 && item.step > item.to - item.from) {
            warnings.push({
                key: "step-larger",
                step: item.step,
                text: `The step ${item.step} is larger than the range, so only the first value matches.`
            });
        }
    }

    const valueSet = new Set(counts.keys());
    if (i === 4 && (valueSet.has(0) || valueSet.has(7))) {
        valueSet.add(0);
        valueSet.add(7);
    }
    const values = [...valueSet].sort((a, b) => a - b);
    const duplicates = [...counts.entries()].filter(([, n]) => n > 1).sort((a, b) => a[0] - b[0])
        .map(([value, n]) => ({ value, count: n }));

    return {
        field: {
            key: f.key,
            name: f.name,
            text,
            startsWithStar: text[0] === "*",
            items,
            values,
            duplicates,
            warnings,
            sundayWritten
        }
    };
}

function aliasFailure(key, message, text, position) {
    return failure(key, message, { text, position });
}

function normalizeFields(fields) {
    return fields.map((f) => f.text).join(" ");
}

/**
 * Read one cron expression.
 * @param {string} input
 */
export function parseCron(input) {
    if (typeof input !== "string") throw new TypeError("parseCron expects a string");

    let a = 0;
    let b = input.length;
    while (a < b && isBlank(input[a])) a += 1;
    while (b > a && isBlank(input[b - 1])) b -= 1;
    if (a === b) return { state: "empty" };

    if (b - a > MAX_INPUT_CHARS) {
        return {
            state: "invalid",
            error: {
                key: "input-too-long",
                message: `The expression has ${b - a} characters; this tool accepts at most ${MAX_INPUT_CHARS}. This is a limit of this tool, not of cron.`,
                limit: MAX_INPUT_CHARS
            }
        };
    }

    const text = input.slice(a, b);
    for (let k = 0; k < text.length; k += 1) {
        const code = text.charCodeAt(k);
        if (code === 0x20 || code === 0x09 || (code >= 0x21 && code <= 0x7e)) continue;
        const cp = text.codePointAt(k);
        const kind = cp < 0x20 || cp === 0x7f ? "a control character" : cp === 0xa0 ? "a no-break space" : cp < 0x80 ? "a character" : "a non-ASCII character";
        return {
            state: "invalid",
            error: {
                key: "bad-character",
                message: `The character U+${hex4(cp)} (${kind}) at position ${a + k + 1} is not allowed. Use plain ASCII letters, digits, spaces and the symbols * / , -.`,
                position: a + k + 1
            }
        };
    }

    let alias = null;
    let fieldSources;

    if (text[0] === "@") {
        const lower = text.toLowerCase();
        const word = lower.slice(1);
        if (text.indexOf(" ") >= 0 || text.indexOf("\t") >= 0) {
            return { state: "invalid", error: aliasFailure("alias-extra",
                "An alias such as `@daily` must stand alone; nothing may follow it.", text, a + 1).error };
        }
        if (lower !== text && (word === "reboot" || Object.prototype.hasOwnProperty.call(ALIASES, word))) {
            return { state: "invalid", error: aliasFailure("alias-case",
                `\`${text}\` is not valid: aliases are lowercase, so use \`${lower}\`.`, text, a + 1).error };
        }
        if (word === "reboot") {
            return { state: "invalid", error: aliasFailure("alias-reboot",
                "`@reboot` runs once at start-up, so there is no schedule to explain.", text, a + 1).error };
        }
        if (!Object.prototype.hasOwnProperty.call(ALIASES, word)) {
            return { state: "invalid", error: aliasFailure("alias-unknown",
                `\`${text}\` is not a supported alias. The aliases read here are @yearly, @annually, @monthly, @weekly, @daily, @midnight and @hourly.`, text, a + 1).error };
        }
        const def = ALIASES[word];
        alias = { name: `@${word}`, expansion: def.expansion, notInManual: def.notInManual === true };
        fieldSources = def.expansion.split(" ").map((t) => ({ t, at: 0 }));
    } else {
        const sources = [];
        let k = 0;
        while (k < text.length) {
            while (k < text.length && isBlank(text[k])) k += 1;
            if (k >= text.length) break;
            const from = k;
            while (k < text.length && !isBlank(text[k])) k += 1;
            sources.push({ t: text.slice(from, k), at: from });
        }
        if (sources.length < 5) {
            return { state: "invalid", error: {
                key: "too-few-fields",
                message: `A crontab time needs five fields (minute, hour, day of month, month, day of week); this has ${sources.length}.`
            } };
        }
        if (sources.length > 5) {
            return { state: "invalid", error: {
                key: "too-many-fields",
                message: "In a crontab file a sixth field is the command, so this tool explains only the five time fields. If this is Quartz or AWS syntax (six or seven fields), it is not supported here."
            } };
        }
        fieldSources = sources;
    }

    const fields = [];
    for (let i = 0; i < 5; i += 1) {
        const src = fieldSources[i];
        const parsed = parseField(i, src.t, alias ? 1 : a + src.at + 1);
        if (parsed.error) {
            if (alias) delete parsed.error.position;
            return { state: "invalid", error: parsed.error };
        }
        fields.push(parsed.field);
    }

    let domStar = fields[2].startsWithStar;
    let dowStar = fields[4].startsWithStar;
    if (alias) {
        const def = ALIASES[alias.name.slice(1)];
        domStar = def.domStar;
        dowStar = def.dowStar;
    }
    fields[2].startsWithStar = domStar;
    fields[4].startsWithStar = dowStar;

    return {
        state: "valid",
        dialect: DIALECT,
        input: text,
        normalized: alias ? alias.name : normalizeFields(fields),
        alias,
        expansion: alias ? alias.expansion : null,
        fields,
        flags: { domStar, dowStar }
    };
}

/* ------------------------------------------------------------
   3. Matching and the next runs
------------------------------------------------------------ */

function flagSet(values, size) {
    const out = new Array(size).fill(false);
    for (const v of values) out[v] = true;
    return out;
}

function matchTables(parsed) {
    const f = parsed.fields;
    const dow = new Array(7).fill(false);
    for (const v of f[4].values) dow[v % 7] = true;
    return {
        minute: flagSet(f[0].values, 60),
        hour: flagSet(f[1].values, 24),
        dom: flagSet(f[2].values, 32),
        month: flagSet(f[3].values, 13),
        dow,
        and: parsed.flags.domStar || parsed.flags.dowStar
    };
}

/* cronie (cron.c): AND when either day field is a star field, otherwise OR. */
function dayOk(t, dom, weekday) {
    return t.and ? (t.dow[weekday] && t.dom[dom]) : (t.dow[weekday] || t.dom[dom]);
}

/** Whether a calendar date matches the month and day fields (the time of day is not considered). */
export function matchesDate(parsed, year, month, day) {
    const t = matchTables(parsed);
    if (!t.month[month]) return false;
    return dayOk(t, day, weekdayFromDays(daysFromCivil(year, month, day)));
}

export function formatRun(run) {
    const hh = String(run.hour).padStart(2, "0");
    const mm = String(run.minute).padStart(2, "0");
    return `${DOW_SHORT[run.weekday]} ${run.day} ${MONTH_SHORT[run.month - 1]} ${run.year}, ${hh}:${mm} UTC`;
}

/**
 * The next matching minutes in UTC, strictly after `nowMs`.
 * Searches at most one 400-year cycle (SEARCH_DAYS days), so "never" is exact.
 */
export function nextRuns(parsed, nowMs, count = DEFAULT_RUN_COUNT) {
    if (!parsed || parsed.state !== "valid") throw new TypeError("nextRuns expects a valid parse result");
    if (typeof nowMs !== "number" || !Number.isFinite(nowMs) || Math.abs(nowMs) > MAX_ABS_MS) {
        throw new RangeError("nowMs must be a finite number of Unix milliseconds");
    }
    const t = matchTables(parsed);
    const minutes = parsed.fields[0].values;
    const hours = parsed.fields[1].values;

    const startMs = Math.floor(nowMs / MS_PER_MINUTE) * MS_PER_MINUTE + MS_PER_MINUTE;
    const startDay = Math.floor(startMs / MS_PER_DAY);
    const startMinuteOfDay = (startMs - startDay * MS_PER_DAY) / MS_PER_MINUTE;

    const runs = [];
    let anyDay = false;
    let { year, month, day } = civilFromDays(startDay);
    let dayNumber = startDay;
    let scanned = 0;

    while (scanned < SEARCH_DAYS && runs.length < count) {
        if (!t.month[month]) {
            /* jump to the first day of the next month; the days skipped still count toward the bound */
            const skip = daysInMonth(year, month) - day + 1;
            scanned += skip;
            dayNumber += skip;
            day = 1;
            month += 1;
            if (month > 12) { month = 1; year += 1; }
            continue;
        }
        const weekday = weekdayFromDays(dayNumber);
        if (dayOk(t, day, weekday)) {
            anyDay = true;
            for (const h of hours) {
                for (const m of minutes) {
                    if (scanned === 0 && h * 60 + m < startMinuteOfDay) continue;
                    runs.push({
                        ms: dayNumber * MS_PER_DAY + (h * 60 + m) * MS_PER_MINUTE,
                        year, month, day, hour: h, minute: m, weekday,
                        text: ""
                    });
                    if (runs.length === count) break;
                }
                if (runs.length === count) break;
            }
        }
        scanned += 1;
        dayNumber += 1;
        day += 1;
        if (day > daysInMonth(year, month)) {
            day = 1;
            month += 1;
            if (month > 12) { month = 1; year += 1; }
        }
    }
    for (const r of runs) r.text = formatRun(r);

    const exhausted = scanned >= SEARCH_DAYS && runs.length < count;
    return {
        startMs,
        runs,
        never: exhausted && runs.length === 0 && !anyDay,
        complete: runs.length === count,
        searchedDays: Math.min(scanned, SEARCH_DAYS)
    };
}

/* ------------------------------------------------------------
   4. Explaining: field meanings, summary, notes
------------------------------------------------------------ */

function valueLabel(i, v) {
    if (i === 3) return MONTH_FULL[v - 1];
    if (i === 4) return DOW_FULL[v % 7];
    return String(v);
}

function itemMeaning(i, item) {
    const f = FIELDS[i];
    if (item.kind === "star") {
        if (item.step === 1) return "every value";
        return `every ${ordinal(item.step)} from ${f.low} through ${f.high}`;
    }
    if (item.kind === "number") return valueLabel(i, item.from);
    const range = `${valueLabel(i, item.from)} through ${valueLabel(i, item.to)}`;
    return item.step === 1 ? range : `every ${ordinal(item.step)} from ${range}`;
}

function fieldMeaning(i, field) {
    const allNumbers = field.items.every((it) => it.kind === "number");
    if (allNumbers) {
        const seen = [];
        for (const it of field.items) {
            const label = valueLabel(i, it.from);
            if (!seen.includes(label)) seen.push(label);
        }
        return joinAnd(seen);
    }
    const parts = field.items.map((it) => {
        const base = itemMeaning(i, it);
        if (it.step > 1) {
            const vals = [];
            for (let v = it.from; v <= it.to; v += it.step) vals.push(valueLabel(i, v));
            return `${base}: ${vals.join(", ")}`;
        }
        return base;
    });
    return parts.join("; ");
}

/* ---- the summary: only for shapes whose meaning a template states exactly ---- */

const isPlainStar = (field) => field.text === "*";
const numberOnly = (field) => field.items.every((it) => it.kind === "number");
const hh = (n) => String(n).padStart(2, "0");

function explicitList(field, max = MAX_SUMMARY_VALUES) {
    if (field.startsWithStar || !numberOnly(field)) return null;
    const vals = [...new Set(field.items.map((it) => it.from))].sort((x, y) => x - y);
    return vals.length >= 1 && vals.length <= max ? vals : null;
}

function singleRange(field) {
    if (field.items.length !== 1) return null;
    const it = field.items[0];
    return it.kind === "range" && it.step === 1 ? it : null;
}

function timePart(minuteField, hourField) {
    if (isPlainStar(minuteField) && isPlainStar(hourField)) {
        return { kind: "every-minute" };
    }
    if (isPlainStar(hourField) && minuteField.items.length === 1) {
        const it = minuteField.items[0];
        if (it.kind === "star" && it.step >= 2 && minuteField.warnings.length === 0) {
            return { kind: "step-minutes", step: it.step, minutes: [...minuteField.values] };
        }
        if (it.kind === "number") return { kind: "minute-of-hour", minute: it.from };
    }
    if (isPlainStar(minuteField)) {
        const hv = explicitList(hourField);
        if (hv && hv.length === 1) return { kind: "every-minute-in-hour", hour: hv[0] };
        return null;
    }
    const mv = explicitList(minuteField);
    const hv = explicitList(hourField);
    if (mv && hv && mv.length * hv.length <= MAX_SUMMARY_VALUES) {
        const times = [];
        for (const h of hv) for (const m of mv) times.push({ hour: h, minute: m });
        return { kind: "times", times };
    }
    return null;
}

function dowSelection(field) {
    const list = explicitList(field);
    if (list) {
        const days = [...new Set(list.map((v) => v % 7))];
        days.sort((x, y) => (x === 0 ? 7 : x) - (y === 0 ? 7 : y));
        return { kind: "list", days };
    }
    const r = singleRange(field);
    if (r && r.to - r.from <= 6) {
        const days = [];
        for (let v = r.from; v <= r.to; v += 1) days.push(v % 7);
        return { kind: "range", from: r.from % 7, to: r.to % 7, days };
    }
    return null;
}

function monthSelection(field) {
    const list = explicitList(field, 12);
    if (list) return { kind: "list", months: list };
    const r = singleRange(field);
    if (r) {
        const months = [];
        for (let v = r.from; v <= r.to; v += 1) months.push(v);
        return { kind: "range", from: r.from, to: r.to, months };
    }
    return null;
}

/**
 * A structured description and a sentence, only for the approved shapes; otherwise null.
 * The sentence is rendered from the structured form alone.
 */
export function summarize(parsed) {
    if (!parsed || parsed.state !== "valid") return null;
    const [minuteField, hourField, domField, monthField, dowField] = parsed.fields;

    const time = timePart(minuteField, hourField);
    if (!time) return null;

    let months = { kind: "any" };
    if (!isPlainStar(monthField)) {
        const sel = monthSelection(monthField);
        if (!sel) return null;
        months = sel;
    }

    const domAny = isPlainStar(domField);
    const dowAny = isPlainStar(dowField);
    let dom = { kind: "any" };
    let dow = { kind: "any" };
    let dayRule = "and";
    if (domAny && dowAny) {
        /* every day */
    } else if (domAny) {
        const sel = dowSelection(dowField);
        if (!sel) return null;
        dow = sel;
    } else if (dowAny) {
        const vals = explicitList(domField);
        if (!vals) return null;
        dom = { kind: "list", days: vals };
    } else {
        if (domField.startsWithStar || dowField.startsWithStar) return null;
        const vals = explicitList(domField);
        const sel = dowSelection(dowField);
        if (!vals || !sel) return null;
        dom = { kind: "list", days: vals };
        dow = sel;
        dayRule = "or";
    }

    const structured = { time, dom, dow, months, dayRule };
    return { structured, sentence: renderSummary(structured) };
}

function timeText(time) {
    switch (time.kind) {
        case "every-minute":
            return "Every minute";
        case "minute-of-hour":
            return `At minute ${time.minute} of every hour`;
        case "every-minute-in-hour":
            return `Every minute from ${hh(time.hour)}:00 to ${hh(time.hour)}:59`;
        case "step-minutes":
            return `Every ${time.step} minutes, restarting at the start of each hour: at minutes ${joinAnd(time.minutes.map(String))}`;
        default:
            return `At ${joinAnd(time.times.map((t) => `${hh(t.hour)}:${hh(t.minute)}`))}`;
    }
}

function dowText(dow) {
    if (dow.kind === "range") return `${DOW_FULL[dow.from]} through ${DOW_FULL[dow.to]}`;
    return joinAnd(dow.days.map((d) => DOW_FULL[d]));
}

function monthText(months) {
    if (months.kind === "range") return `in ${MONTH_FULL[months.from - 1]} through ${MONTH_FULL[months.to - 1]}`;
    return `in ${joinAnd(months.months.map((m) => MONTH_FULL[m - 1]))}`;
}

/** The sentence, from the structured form only. */
export function renderSummary(s) {
    const monthPart = s.months.kind === "any" ? "" : monthText(s.months);
    let date;
    if (s.dayRule === "or") {
        date = `on day ${joinAnd(s.dom.days.map(String))} of the month, or on ${dowText(s.dow)} (either)`;
        return `${timeText(s.time)}, ${date}${monthPart ? `, ${monthPart}` : ""}`;
    }
    if (s.dom.kind === "list") date = `on day ${joinAnd(s.dom.days.map(String))} of the month`;
    else if (s.dow.kind !== "any") date = `on ${dowText(s.dow)}`;
    else date = "every day";
    return `${timeText(s.time)}, ${date}${monthPart ? ` ${monthPart}` : ""}`;
}

/* ---- notes: exact strings, only those that apply ---- */

function maxDayInMonths(monthValues) {
    let max = 0;
    for (const m of monthValues) max = Math.max(max, m === 2 ? 29 : daysInMonth(2001, m));
    return max;
}

function notesFor(parsed) {
    const [minuteField, hourField, domField, monthField, dowField] = parsed.fields;
    const notes = [];
    const add = (key, text) => notes.push({ key, text });

    const domStar = domField.startsWithStar;
    const dowStar = dowField.startsWithStar;
    if (!parsed.alias) {
        if (!domStar && !dowStar) {
            add("both-restricted", "Day of month and day of week are both restricted, so the command runs when either one matches (not only when both do).");
        } else if (domStar !== dowStar) {
            add("star-requires-both", "A day field written with `*` (including `*/2`) makes cron require both day fields to match.");
        }
    }
    if (domField.values.length === 31 && domField.text[0] !== "*") {
        add("full-range-dom", `\`${domField.text}\` selects every day but is not written with \`*\`, so cron treats the field as restricted.`);
    }
    if (new Set(dowField.values.map((v) => v % 7)).size === 7 && dowField.text[0] !== "*") {
        add("full-range-dow", `\`${dowField.text}\` selects every day but is not written with \`*\`, so cron treats the field as restricted.`);
    }
    if (minuteField.items.some((it) => it.step > 1) || hourField.items.some((it) => it.step > 1)) {
        add("steps-restart", "Steps restart in each field: `*/35` in minutes is minutes 0 and 35 of every hour, not every 35 minutes.");
    }
    for (const f of parsed.fields) {
        for (const w of f.warnings) add("step-larger", `${f.name}: the step is larger than the range, so only the first value matches.`);
    }
    if (dowField.sundayWritten) add("sunday", "0 and 7 are both Sunday.");
    for (const f of parsed.fields) {
        for (const d of f.duplicates) {
            add("duplicate", `\`${f.text}\` lists ${d.value} ${d.count === 2 ? "twice" : `${d.count} times`}.`);
        }
    }
    if (parsed.alias) {
        add("alias", `\`${parsed.alias.name}\` is the same as \`${parsed.alias.expansion}\`.`);
        if (parsed.alias.notInManual) {
            add("midnight", "`@midnight` is listed by Kubernetes and accepted by cronie, but is not in the cronie manual page.");
        }
    }

    /* Dates that cannot exist: only when the day fields combine as AND, so no weekday can add a date. */
    const andMode = parsed.flags.domStar || parsed.flags.dowStar;
    if (andMode) {
        const reach = maxDayInMonths(monthField.values);
        const wanted = domField.values;
        if (wanted.length > 0 && wanted[0] > reach) {
            const shown = wanted.length <= 3 ? wanted.join(" or ") : "any of the requested days";
            add("never-day", `No month in this schedule has day ${shown}, so it never runs.`);
        } else if (monthField.values.length === 1 && monthField.values[0] === 2 && wanted.length > 0 && wanted[0] === 29 && wanted.length === 1) {
            add("leap-only", "Runs only in leap years.");
        }
    }
    return notes;
}

/**
 * Everything the page shows for one expression.
 * @param {string} text
 * @param {{ nowMs: number }} options
 */
export function explainCron(text, { nowMs } = {}) {
    const parsed = parseCron(text);
    if (parsed.state !== "valid") return parsed;
    const summary = summarize(parsed);
    return {
        state: "explained",
        dialect: parsed.dialect,
        input: parsed.input,
        normalized: parsed.normalized,
        alias: parsed.alias,
        expansion: parsed.expansion,
        flags: parsed.flags,
        fields: parsed.fields.map((f, i) => ({
            key: f.key,
            name: f.name,
            text: f.text,
            startsWithStar: f.startsWithStar,
            meaning: fieldMeaning(i, f),
            values: f.values,
            valuesText: joinAnd(f.values.map(String)),
            warnings: f.warnings
        })),
        summary: summary ? { sentence: summary.sentence, structured: summary.structured } : null,
        notes: notesFor(parsed),
        nextRuns: nextRuns(parsed, nowMs),
        assumptions: ASSUMPTIONS
    };
}
