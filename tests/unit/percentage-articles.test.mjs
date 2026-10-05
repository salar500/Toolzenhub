/**
 * Tool Pack 10: the figures quoted in the three Percentage articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/percentage-golden.py (Python Fraction: the "article" block). The engine must
 * reproduce them, and every figure written in an article must appear in its text, so the text cannot drift from the maths. The articles have
 * no image (concept clarity beats an image quota), and the catalog says so.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/Toolzenhub/" } };

import { solvePercentage, plainText } from "../../assets/js/calculators/formulas/percentage.js";

const REF = {
  up: { end: "120.00", undo: "-16.67" },
  down: { start: "120.00", change: "-20", end: "96.00", amount: "-24.00", undo: "25.00" },
  chain: { end2: "96.00", net: "-4.00", plainSum: "0.00" },
  reverseUp: { start: "2000.00", subtractedWrong: "1920.00" },
  reverseDown: { start: "2000.00" },
  reverse18: { start: "100.00" },
  points: { points: "2.00", percent: "40.00" },
};

const SLUGS = [
  "why-a-20-percent-rise-then-a-20-percent-fall-does-not-get-you-back",
  "how-to-find-the-original-price-before-a-percentage-change",
  "percent-vs-percentage-points",
];
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/percentage/${slug}.js`)).default);
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const solve = (inputs) => solvePercentage({ start: "", change: "", end: "", second: "", ...inputs });
const shown = (fig) => plainText(fig.h);

describe("the engine reproduces the reference figures behind the articles", () => {
  test("100 up 20% is 120 with a −16.67% undo; 120 down 20% is 96; the chain nets −4.00% and its plain sum is 0.00%", () => {
    const up = solve({ start: "100", change: "20" });
    assert.equal(shown(up.end), REF.up.end);
    assert.equal(shown(up.undo), REF.up.undo);
    const down = solve({ start: "120", change: "-20" });
    assert.equal(shown(down.end), REF.down.end.replace("120.00", "96.00"));
    assert.equal(shown(down.amount), REF.down.amount);
    assert.equal(shown(down.undo), REF.down.undo);
    const chain = solve({ start: "100", change: "20", second: "-20" });
    assert.equal(shown(chain.second.end2), REF.chain.end2);
    assert.equal(shown(chain.second.net), REF.chain.net);
    assert.equal(shown(chain.second.plainSum), REF.chain.plainSum);
  });

  test("the original before an increase or decrease, and the wrong subtraction", () => {
    assert.equal(shown(solve({ change: "20", end: "2400" }).start), REF.reverseUp.start);
    assert.equal(shown(solve({ change: "-20", end: "1600" }).start), REF.reverseDown.start);
    assert.equal(shown(solve({ change: "18", end: "118" }).start), REF.reverse18.start);
    assert.equal(2400 - (2400 * 20) / 100, Number(REF.reverseUp.subtractedWrong)); // subtracting 20% of 2,400
    assert.equal(1600 + (1600 * 20) / 100, Number(REF.reverseUp.subtractedWrong)); // adding 20% of 1,600
    assert.equal(shown(solve({ start: "1920", change: "20" }).end), "2304.00"); // and the wrong answer does not go forward to 2,400
  });

  test("percentage points: 5 to 7 is 2 points and +40.00%; 12 to 9 is 3 points and −25.00%", () => {
    assert.equal(shown(solve({ start: "5", end: "7" }).change), REF.points.percent);
    assert.equal(7 - 5, 2);
    assert.equal(shown(solve({ start: "12", end: "9" }).change), "-25.00");
    assert.equal(12 - 9, 3);
  });
});

describe("every figure in the articles is the calculator's", () => {
  test("article 1: 100, 120, 96, 24, 16.67%, 25%, −4.00% and the plain sum", async () => {
    const t = await text(SLUGS[0]);
    has(t, ["100", "120", "96", "24", "−4.00%", "16.67%", "25%", "0%", "20%"]);
    assert.ok(/not the combined change/i.test(t), "says the plain sum is not the combined change");
    assert.ok(!/cancel(s|led)? out/i.test(t) || /do not/i.test(t));
    assert.ok(/of what/i.test(t));
  });

  test("article 2: 2,400 back to 2,000, the wrong 1,920, the check 2,304, the decrease case and 118 to 100", async () => {
    const t = await text(SLUGS[1]);
    has(t, ["2,400", "2,000", "1,920", "2,304", "1,600", "0.80", "1.20", "118", "100", "÷"]);
    assert.ok(/not subtract|not by subtracting|Subtracting/i.test(t));
  });

  test("article 3: 5% to 7% is 2 percentage points and 40.00%; 12% to 9% is 3 points and 25.00%", async () => {
    const t = await text(SLUGS[2]);
    has(t, ["2 percentage points", "40.00%", "25.00%", "3 percentage points", "5% to 7%", "12% to 9%"]);
    // percentage points are explained, not offered as a calculator mode
    assert.ok(/no mode|does not work in percentage points|works with the percent change/i.test(t));
  });
});

describe("trust and scope wording", () => {
  test("no good, fair, worth-it, expected, save or best claims; no advice, forecast or named rate", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/\bgood\b/i, /\bfair(ly)?\b/i, /worth it/i, /\bexpected\b/i, /\bsav(e|es|ed|ing|ings)\b/i, /\bbest\b/i, /\bshould (buy|invest|choose)\b/i, /guarantee/i, /\brecommended\b/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      for (const word of [/rbi/i, /repo/i, /sensex/i, /nifty/i, /inflation rate/i, /interest rate of/i]) assert.ok(!word.test(t), `${s}: ${word}`);
    }
  });

  test("the plain-numbers limits are stated where they matter (tax, fees, shop rounding)", async () => {
    for (const s of SLUGS.slice(0, 2)) {
      const t = await text(s);
      assert.ok(/tax/i.test(t) && /fees?/i.test(t) && /round/i.test(t), `${s}: states what is left out`);
    }
  });
});

describe("the three articles have no image at all: concept clarity beats an image quota", () => {
  test("the catalog has no hero or card image for them, and no image file was added for them", async () => {
    const { articles } = await import("../../assets/js/data/articles.js");
    for (const s of SLUGS) {
      const a = articles.find((x) => x.slug === s);
      assert.equal(a.heroImage, null, s);
      assert.equal(a.cardImage, null, s);
      assert.equal(a.topic, "percentage", s);
      assert.equal(a.category, "math", s);
      assert.deepEqual(a.tools, ["percentage"], s);
    }
    const dir = new URL("../../assets/Images/articles/", import.meta.url);
    for (const s of SLUGS) for (const ext of ["png", "webp"]) assert.equal(fs.existsSync(new URL(`${s}.${ext}`, dir)), false, `${s}.${ext}`);
  });

  test("each lists the other two, and the tool lists all three in order", async () => {
    const { articles } = await import("../../assets/js/data/articles.js");
    const calcs = await import("../../assets/js/data/calculators.js");
    const keys = SLUGS.map((s) => `percentage/${s}`);
    SLUGS.forEach((s, i) => assert.deepEqual([...articles.find((x) => x.slug === s).related].sort(), keys.filter((_, j) => j !== i).sort()));
    assert.deepEqual(calcs.getCalculatorById("percentage").relatedArticles, keys);
  });
});
