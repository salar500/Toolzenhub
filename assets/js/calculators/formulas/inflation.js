/* =========================================================
   ToolZen Hub
   Inflation view (SIP and SWP)

   Pure helpers for "what is this amount worth in today's money,
   if prices rise by the rate the visitor assumes". It changes no
   engine figure: the nominal results stay exactly as they were
   and this only restates them.

     real value = nominal / (1 + f) ^ years        (f = inflation / 100)
     return after inflation = (1 + r) / (1 + f) - 1

   The inflation rate is the visitor's assumption, not a forecast.
========================================================= */

export const INFLATION_LIMITS = {
    min: 0,
    max: 30,
    decimals: 2
};

export const INFLATION_MESSAGE =
    "Expected inflation must be from 0% to 30% a year, with up to 2 decimal places. Leave it blank to skip.";

/*
 * A blank field means the view is off. A value of 0 also shows
 * nothing (today's money would equal the nominal figure).
 * Returns { ok: true, value: number | null } or { ok: false, message }.
 */
export function validateInflation(raw) {

    const text = String(raw ?? "").trim();

    if (text === "") {
        return { ok: true, value: null };
    }

    if (!/^\d+(\.\d+)?$/.test(text)) {
        return { ok: false, message: INFLATION_MESSAGE };
    }

    const value = Number(text);
    const places = (text.split(".")[1] || "").length;

    if (
        !Number.isFinite(value) ||
        value < INFLATION_LIMITS.min ||
        value > INFLATION_LIMITS.max ||
        places > INFLATION_LIMITS.decimals
    ) {
        return { ok: false, message: INFLATION_MESSAGE };
    }

    return { ok: true, value: value > 0 ? value : null };
}

/* an amount `years` from now, restated in today's money (years may be fractional) */
export function realValue(nominal, inflationPercent, years) {

    return nominal / Math.pow(1 + inflationPercent / 100, years);

}

/* the yearly return left after inflation, in percent */
export function realReturnPercent(returnPercent, inflationPercent) {

    return ((1 + returnPercent / 100) / (1 + inflationPercent / 100) - 1) * 100;

}
