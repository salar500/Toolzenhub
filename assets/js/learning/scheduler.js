/* =========================================================
   ToolZen Hub
   Learning: fixed-interval revision scheduler (Leitner boxes)

   A pure module: no DOM, no storage, no clock. Every function takes
   the day as an argument, so the same inputs always give the same
   answer.

   The rule is a product design choice, not a measured optimum, and it
   makes no promise about memory:

     - A card is in one of five boxes. A card never reviewed has none.
     - Known moves it up one box (at most box 5). Not known puts it in
       box 1. A first grade of "known" therefore puts a new card in box 2.
     - The next review is the review day plus the interval of the new
       box: boxes 1, 2, 3, 4 and 5 wait 1, 3, 7, 14 and 30 days.
     - A day is a whole local calendar day, a number counted from
       1970-01-01. Counting calendar days (never milliseconds) keeps
       month ends, leap days and daylight-saving changes from moving a
       review.
     - A card is due when today is on or after its next review day. A
       last review day later than today (the device date was set back)
       is treated as due today.
========================================================= */

export const INTERVAL_DAYS = Object.freeze([1, 3, 7, 14, 30]);
export const MAX_BOX = INTERVAL_DAYS.length;

/* year 9999 is far beyond anything a device date will hold; the bound only rejects garbage */
export const MAX_DAY = 2_932_896;


/* days from 1970-01-01 to a calendar date (proleptic Gregorian) */
export function dayNumber(year, month, day) {
    const y = month <= 2 ? year - 1 : year;
    const era = Math.floor(y / 400);
    const yoe = y - era * 400;
    const mp = (month + 9) % 12;
    const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
}

/* the local calendar day of a Date */
export function localDay(date = new Date()) {
    return dayNumber(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function isDay(value) {
    return Number.isInteger(value) && value >= 0 && value <= MAX_DAY;
}

export function isBox(value) {
    return Number.isInteger(value) && value >= 1 && value <= MAX_BOX;
}

export function isEntry(entry) {
    return entry !== null && typeof entry === "object" && isBox(entry.box) && isDay(entry.day);
}

export function intervalOf(box) {
    if (!isBox(box)) throw new RangeError("box must be 1 to 5");
    return INTERVAL_DAYS[box - 1];
}

/**
 * The entry after grading a card on `today`.
 * @param {{box:number,day:number}|undefined} entry the card's saved entry, if any
 */
export function grade(entry, known, today) {
    if (!isDay(today)) throw new RangeError("today must be a valid day number");
    const box = known ? Math.min(MAX_BOX, (isEntry(entry) ? entry.box : 1) + 1) : 1;
    return { box, day: today };
}

/** The first day the card is due again. */
export function dueDay(entry) {
    if (!isEntry(entry)) throw new TypeError("entry must have a box and a day");
    return entry.day + intervalOf(entry.box);
}

export function isDue(entry, today) {
    if (!isEntry(entry)) return false;
    if (entry.day > today) return true;
    return today >= dueDay(entry);
}

function entryOf(entries, id) {
    return Object.hasOwn(entries, id) ? entries[id] : undefined;
}

/**
 * The reviewed cards of a deck that are due, lowest box first and then in deck order.
 * @param {string[]} cardIds in deck order
 * @param {Record<string,{box:number,day:number}>} entries
 */
export function dueCards(cardIds, entries, today) {
    const due = [];
    cardIds.forEach((id, order) => {
        const entry = entryOf(entries, id);
        if (isDue(entry, today)) due.push({ id, box: entry.box, order });
    });
    due.sort((a, b) => a.box - b.box || a.order - b.order);
    return due.map((d) => d.id);
}

/** The earliest future due day among reviewed cards, or null when none is waiting. */
export function nextDueAfter(cardIds, entries, today) {
    let best = null;
    for (const id of cardIds) {
        const entry = entryOf(entries, id);
        if (!isEntry(entry) || isDue(entry, today)) continue;
        const d = dueDay(entry);
        if (best === null || d < best) best = d;
    }
    return best;
}

export function countBoxes(cardIds, entries) {
    const boxes = [0, 0, 0, 0, 0];
    let unseen = 0;
    for (const id of cardIds) {
        const entry = entryOf(entries, id);
        if (isEntry(entry)) boxes[entry.box - 1] += 1;
        else unseen += 1;
    }
    return { boxes, unseen };
}

/* "2028-03-02" for a day number, used in messages and tests */
export function dayToIso(day) {
    const z = day + 719468;
    const era = Math.floor(z / 146097);
    const doe = z - era * 146097;
    const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
    const mp = Math.floor((5 * doy + 2) / 153);
    const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
    const m = mp < 10 ? mp + 3 : mp - 9;
    const y = yoe + era * 400 + (m <= 2 ? 1 : 0);
    return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
