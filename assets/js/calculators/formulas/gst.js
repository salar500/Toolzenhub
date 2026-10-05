/* =========================================================
   ToolZen Hub
   GST: pure calculation and input validation

   No DOM and no formatting: plain functions, so they can be
   tested on their own. The page (calculators/gst/index.js) only
   reads fields, calls these functions and shows what they return.

   THIS CALCULATES FROM THE RATE THE VISITOR ENTERS. It does not know
   which rate applies to anything, never classifies a product or a
   service, and never says an invoice is correct or compliant.

   MONEY IS WHOLE PAISE (1 rupee = 100 paise), held as integers, so no
   floating point touches an amount. A rate is held in hundredths of a
   percent (18% = 1800), so it has at most two decimals.

   ADD GST    (the amount A is before GST)
       GST   = round( A x rate / 100 )       half up, to the paisa
       with  = A + GST

   REMOVE GST (the amount T already includes GST)
       before = the whole paisa b nearest to  T x 100 / (100 + rate)
                (a tie goes up);  GST = T - b
       so   before + GST = T   always, exactly. It is NOT T minus
       rate% of T (1,180 less 18% is 967.60, not 1,000), and the GST
       is not round(T x rate / 100).

   Each item is worked out and rounded ON ITS OWN, and the invoice
   totals are the SUMS of those rounded figures; GST is never
   recomputed on the grand total. (Another system may round the grand
   total and differ by a paisa.)

   GST SHARE = GST / amount with GST, in hundredths of a percent, half
   up (18% added to 1,000 is 180 of 1,180 = 15.25%). It is not the rate.

   Add then Remove at the same rate gave back the amount entered for every
   amount from 0.01 to 2,000.00 at the seven rates the reference tested
   (tests/fixtures/gst-golden.py --full). That tested range is the claim; it
   is not asserted beyond it.
========================================================= */


/* =========================================================
   LIMITS
========================================================= */

export const GST_LIMITS = Object.freeze({
    amountPaise: { min: 1, max: 999999999999 },          // 0.01 to 9,99,99,99,999.99 rupees
    rateHundredths: { min: 0, max: 5000 },               // 0% to 50%
    items: 4
});

export const GST_MODES = Object.freeze(["add", "remove"]);


/* =========================================================
   PARSING (private)
========================================================= */

const isBlank = (raw) =>
    raw === null ||
    raw === undefined ||
    String(raw).trim() === "";

/* "1234.5" -> 123450n paise; null when it is not a plain amount with at most two decimals */
function parseAmount(raw) {

    const text = String(raw).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
        return null;
    }

    const [whole, fraction = ""] = text.split(".");

    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));

}

/* "18" -> 1800n (hundredths of a percent); null when it has more than two decimals */
function parseRate(raw) {

    const text = String(raw).trim();

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
        return null;
    }

    const [whole, fraction = ""] = text.split(".");

    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));

}


/* =========================================================
   VALIDATION
   Input:  { mode, items: [{ amount, rate }, ...] }   (raw strings or numbers; up to four items)
   Output: { ok: true, values } or { ok: false, errors } where each
           error is { fields: ["amount1", "rate2", ...], message }

   Item 1 is required. A later item with no amount is ignored (even if a
   rate is typed, and without any message); an amount with no rate takes
   Item 1's rate.
========================================================= */

const AMOUNT_MESSAGE =
    "Enter an amount between ₹0.01 and ₹99,99,99,999.99, with at most two decimals.";

const RATE_MESSAGE =
    "Enter a GST rate between 0% and 50%, with at most two decimals.";

export function validateGstInputs(
    raw
) {

    const errors = [];

    const mode = String(raw.mode ?? "");

    if (!GST_MODES.includes(mode)) {

        errors.push({
            fields: ["mode"],
            message: "Choose whether to add or remove GST."
        });

    }

    const rows = Array.isArray(raw.items) ? raw.items.slice(0, GST_LIMITS.items) : [];

    const parsed = [];
    let firstRate = null;

    rows.forEach(
        (row, index) => {

            const n = index + 1;
            const first = index === 0;

            if (!first && isBlank(row?.amount)) {
                return;                                   // an unused optional row: quiet
            }

            const amount = isBlank(row?.amount) ? null : parseAmount(row.amount);

            if (
                amount === null ||
                amount < BigInt(GST_LIMITS.amountPaise.min) ||
                amount > BigInt(GST_LIMITS.amountPaise.max)
            ) {

                errors.push({
                    fields: [`amount${n}`],
                    message: first ? AMOUNT_MESSAGE : `Item ${n}: ${AMOUNT_MESSAGE}`
                });

            }

            let rate;

            if (isBlank(row?.rate)) {

                if (first) {
                    errors.push({ fields: ["rate1"], message: RATE_MESSAGE });
                }

                rate = undefined;                          // a later item inherits Item 1's rate

            } else {

                rate = parseRate(row.rate);

                if (rate === null || rate > BigInt(GST_LIMITS.rateHundredths.max)) {

                    errors.push({
                        fields: [`rate${n}`],
                        message: first ? RATE_MESSAGE : `Item ${n}: ${RATE_MESSAGE}`
                    });

                }

            }

            if (first && rate !== undefined && rate !== null) {
                firstRate = rate;
            }

            parsed.push({ n, amount, rate });

        }
    );

    if (errors.length > 0) {
        return { ok: false, errors };
    }

    return {
        ok: true,
        values: {
            mode,
            items: parsed.map(
                ({ n, amount, rate }) => ({
                    n,
                    amountPaise: Number(amount),
                    rateHundredths: Number(rate === undefined ? firstRate : rate)
                })
            )
        }
    };

}


/* =========================================================
   CALCULATION
   `values` must already be valid (validateGstInputs).
   Returns plain numbers (paise are exact integers); nothing is formatted.
========================================================= */

/* floor( a / b ) for non-negative BigInts, and the half-up rounding of a / b */
const roundHalfUp = (a, b) => (2n * a + b) / (2n * b);

function addItem(
    amountPaise,
    rateHundredths
) {

    const a = BigInt(amountPaise);

    // GST = round( A x rate / 100 ), with rate = rateHundredths / 100 per cent, so  A x rateHundredths / 10000
    const gst = roundHalfUp(a * BigInt(rateHundredths), 10000n);

    return { before: a, gst, total: a + gst };

}

function removeItem(
    totalPaise,
    rateHundredths
) {

    const t = BigInt(totalPaise);
    const denominator = 10000n + BigInt(rateHundredths);

    // the nearest whole paisa to  T x 10000 / (10000 + rate), a tie going up
    const before = roundHalfUp(t * 10000n, denominator);

    return { before, gst: t - before, total: t };

}

/* GST as a share of the amount with GST, in hundredths of a percent, half up */
function shareHundredths(
    gst,
    total
) {

    return total === 0n ? 0n : roundHalfUp(gst * 10000n, total);

}

export function calculateGst({
    mode,
    items
}) {

    const work = mode === "remove" ? removeItem : addItem;

    const rows = items.map(
        item => {

            const r = work(item.amountPaise, item.rateHundredths);

            return {
                n: item.n,
                rateHundredths: item.rateHundredths,
                beforePaise: Number(r.before),
                gstPaise: Number(r.gst),
                withPaise: Number(r.total),
                shareHundredths: Number(shareHundredths(r.gst, r.total)),
                before: r.before,
                gst: r.gst,
                total: r.total
            };

        }
    );

    /* group by the normalised rate (5, 5.0 and 5.00 are all 500 hundredths), ascending */
    const groups = new Map();

    for (const row of rows) {

        const g = groups.get(row.rateHundredths) ?? { before: 0n, gst: 0n, total: 0n };

        g.before += row.before;
        g.gst += row.gst;
        g.total += row.total;

        groups.set(row.rateHundredths, g);

    }

    const pack = (g) => ({
        beforePaise: Number(g.before),
        gstPaise: Number(g.gst),
        withPaise: Number(g.total),
        shareHundredths: Number(shareHundredths(g.gst, g.total))
    });

    const byRate =
        [...groups.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([rateHundredths, g]) => ({ rateHundredths, ...pack(g) }));

    const total = {
        before: rows.reduce((sum, r) => sum + r.before, 0n),
        gst: rows.reduce((sum, r) => sum + r.gst, 0n),
        total: rows.reduce((sum, r) => sum + r.total, 0n)
    };

    return {
        mode,
        itemCount: rows.length,
        items: rows.map(({ before, gst, total: t, ...rest }) => rest),
        byRate,
        total: pack(total)
    };

}
