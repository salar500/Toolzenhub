/**
 * Tool Pack 34: optional rounding and the copied summary of the Hours & Timesheet Calculator.
 *
 * Rounding is checked by PROPERTY rather than by repeating the formula: for every whole number of minutes and every step, the result is a
 * multiple of the step, is no further than half a step from the input, and when the input is exactly halfway the result is the upper
 * neighbour. Run with:
 *   node --test tests/unit/hours-rounding.test.mjs
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ROUNDING_STEPS,
  roundMinutes,
  applyRounding,
  roundingWords,
  differenceWords,
  copySummary,
  summarize,
  EXAMPLE_ROWS,
} from "../../assets/js/tools/hours-calculator/hours-engine.js";

describe("rounding to the nearest step, halfway up", () => {
  test("every minute count from 0 to 6000 and every step", () => {
    for (const step of ROUNDING_STEPS.filter((s) => s > 0)) {
      for (let m = 0; m <= 6000; m++) {
        const r = roundMinutes(m, step);
        assert.equal(r % step, 0, `${m}/${step}`);
        assert.ok(Math.abs(r - m) * 2 <= step, `${m}/${step} moved more than half a step`);
        if (m % step === 0) assert.equal(r, m, `${m}/${step} already on a step`);
        if ((m * 2) % step === 0 && m % step !== 0) assert.equal(r, m + step / 2, `${m}/${step} exactly halfway goes up`);
      }
    }
  });

  test("known values", () => {
    assert.equal(roundMinutes(7, 15), 0);
    assert.equal(roundMinutes(8, 15), 15);
    assert.equal(roundMinutes(22, 15), 15);
    assert.equal(roundMinutes(23, 15), 30);
    assert.equal(roundMinutes(15, 30), 30);
    assert.equal(roundMinutes(14, 30), 0);
    assert.equal(roundMinutes(2, 5), 0);
    assert.equal(roundMinutes(3, 5), 5);
    assert.equal(roundMinutes(1439, 15), 1440);
  });

  test("no rounding, and a step that is not offered, change nothing", () => {
    assert.equal(roundMinutes(487, 0), 487);
    assert.equal(roundMinutes(487, 7), 487);
    assert.equal(roundMinutes(487, undefined), 487);
  });
});

describe("applied to a summary", () => {
  const rows = (...shifts) => shifts.map(([start, end, breakText]) => ({ start, end, breakText }));
  // 09:00-17:08 = 488 minutes; 09:00-12:08 = 188 minutes
  const summary = summarize(rows(["09:00", "17:08", ""], ["09:00", "12:08", ""]));

  test("each shift is rounded before adding up; the total is rounded once", () => {
    assert.equal(summary.totals.net, 676);
    const each = applyRounding(summary, 15, "shift");
    assert.equal(each.rounded, 495 + 195);
    assert.equal(each.exact, 676);
    assert.equal(each.difference, 14);
    const total = applyRounding(summary, 15, "total");
    assert.equal(total.rounded, 675);
    assert.equal(total.changed, true);
    assert.equal(total.difference, -1);
  });

  test("the exact total is never lost, and off is the default behaviour", () => {
    const off = applyRounding(summary, 0, "shift");
    assert.equal(off.rounded, off.exact);
    assert.equal(off.changed, false);
    assert.equal(applyRounding(summary, 9, "shift").step, 0);
    assert.equal(applyRounding(summarize(rows(["", "", ""])), 15, "shift"), null);
  });

  test("rows that are not counted are not rounded in", () => {
    const withBad = summarize(rows(["09:00", "17:08", ""], ["09:00", "", ""], ["12:00", "12:00", ""]));
    assert.equal(withBad.totals.net, 488);
    assert.equal(applyRounding(withBad, 15, "shift").rounded, 495);
  });

  test("words", () => {
    assert.equal(roundingWords(applyRounding(summary, 15, "shift")), "Rounded to the nearest 15 minutes, each shift");
    assert.equal(roundingWords(applyRounding(summary, 10, "total")), "Rounded to the nearest 10 minutes, the total");
    assert.equal(roundingWords(applyRounding(summary, 0, "total")), "No rounding");
    assert.equal(roundingWords(null), "No rounding");
    assert.equal(differenceWords(15), "+15 minutes");
    assert.equal(differenceWords(-1), "-1 minute");
    assert.equal(differenceWords(0), "no change");
  });
});

describe("the copied summary", () => {
  test("the worked example, exact", () => {
    const summary = summarize(EXAMPLE_ROWS.map((row) => ({ ...row })));
    assert.equal(
      copySummary(summary, null),
      [
        "Hours worked",
        "1. 09:00 to 17:30, break 30 min: 8:00",
        "2. 22:00 to 06:00 (ends next day), break 45 min: 7:15",
        "3. 13:00 to 17:00, break 0 min: 4:00",
        "",
        "Total: 19:15 (19.25 decimal hours) from 3 shifts",
        "",
      ].join("\n")
    );
  });

  test("a rounding choice is stated beside the exact total", () => {
    const summary = summarize([{ start: "09:00", end: "17:08", breakText: "" }, { start: "09:00", end: "12:08", breakText: "" }]);
    const text = copySummary(summary, applyRounding(summary, 15, "shift"));
    assert.match(text, /Total: 11:16 \(11\.27 decimal hours\) from 2 shifts/);
    assert.match(text, /Rounded to the nearest 15 minutes, each shift: 11:30 \(11\.50 decimal hours\), \+14 minutes/);
  });

  test("rows that are not counted are mentioned, and an empty sheet copies nothing", () => {
    const summary = summarize([{ start: "09:00", end: "17:00", breakText: "" }, { start: "09:00", end: "", breakText: "" }]);
    assert.match(copySummary(summary, null), /1 row not counted \(incomplete or invalid\)/);
    assert.equal(copySummary(summarize([{ start: "", end: "", breakText: "" }]), null), "");
  });
});
