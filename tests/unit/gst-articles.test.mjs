/**
 * Tool Pack 8: the figures quoted in the two GST articles are the calculator's own numbers.
 *
 * REF holds values of the independent reference, tests/fixtures/gst-golden.py (Python Fraction / Decimal in whole paise; the "articles"
 * block and the invoice scenarios). The engine must reproduce them, and every figure written in an article, formatted the way the tool
 * formats money, must appear in the article text, so the text cannot drift from the maths.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { calculateGst, validateGstInputs } from "../../assets/js/calculators/formulas/gst.js";

const REF = {
  add1000at18: { before: "1000.00", gst: "180.00", with: "1180.00", share: "15.25" },
  subtractingPercentFrom1180: "967.60",
  shareAt: { 5: "4.76", 12: "10.71", 18: "15.25", 28: "21.88" },
  mixed: {
    items: [["1000", "5", "50.00", "1050.00"], ["2000", "18", "360.00", "2360.00"], ["500", "18", "90.00", "590.00"]],
    byRate: [["5", "1000.00", "50.00", "1050.00"], ["18", "2500.00", "450.00", "2950.00"]],
    total: { before: "3500.00", gst: "500.00", with: "4000.00", share: "12.50" },
  },
  rounding: { itemByItem: "1.53", onGrandTotal: "1.52" },
};

const SLUGS = ["adding-and-removing-gst-why-the-tax-is-not-the-same-share-both-ways", "gst-on-a-mixed-invoice-how-the-tax-adds-up-across-rates"];
const text = async (slug) => JSON.stringify((await import(`../../assets/js/data/articles/gst/${slug}.js`)).default);
const money = (paise) => `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const plain = (s) => `₹${Number(s).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (hundredths) => `${(hundredths / 100).toFixed(2)}%`;
const has = (t, figures) => { for (const f of figures) assert.ok(t.includes(f), `the article is missing ${f}`); };
const run = (mode, items) => {
  const check = validateGstInputs({ mode, items });
  assert.equal(check.ok, true);
  return calculateGst(check.values);
};

describe("the engine reproduces the reference figures behind the articles", () => {
  test("Add 1,000 at 18%, the share at four rates, the mixed invoice and the rounding example", () => {
    const a = run("add", [{ amount: "1000", rate: "18" }]).total;
    assert.deepEqual([a.beforePaise, a.gstPaise, a.withPaise], [100000, 18000, 118000]);
    assert.equal((a.shareHundredths / 100).toFixed(2), REF.add1000at18.share);
    for (const [rate, share] of Object.entries(REF.shareAt)) {
      assert.equal((run("add", [{ amount: "1000", rate }]).total.shareHundredths / 100).toFixed(2), share, `${rate}%`);
    }
    const r = run("add", REF.mixed.items.map(([amount, rate]) => ({ amount, rate })));
    r.items.forEach((item, i) => {
      assert.equal(money(item.gstPaise), plain(REF.mixed.items[i][2]));
      assert.equal(money(item.withPaise), plain(REF.mixed.items[i][3]));
    });
    r.byRate.forEach((row, i) => {
      assert.equal(String(row.rateHundredths / 100), REF.mixed.byRate[i][0]);
      assert.deepEqual([money(row.beforePaise), money(row.gstPaise), money(row.withPaise)], REF.mixed.byRate[i].slice(1).map(plain));
    });
    assert.deepEqual([money(r.total.beforePaise), money(r.total.gstPaise), money(r.total.withPaise)], [REF.mixed.total.before, REF.mixed.total.gst, REF.mixed.total.with].map(plain));
    assert.equal((r.total.shareHundredths / 100).toFixed(2), REF.mixed.total.share);
    const three = run("add", Array.from({ length: 3 }, () => ({ amount: "10.10", rate: "5" }))).total;
    assert.equal((three.gstPaise / 100).toFixed(2), REF.rounding.itemByItem);
  });
});

describe("every figure in 'Adding and removing GST' is the calculator's", () => {
  test("add, remove, the wrong shortcut, the share and the other rates", async () => {
    const t = await text(SLUGS[0]);
    const add = run("add", [{ amount: "1000", rate: "18" }]).total;
    const remove = run("remove", [{ amount: "1180", rate: "18" }]).total;
    has(t, [money(add.beforePaise), money(add.gstPaise), money(add.withPaise), pct(add.shareHundredths), money(remove.beforePaise), money(remove.gstPaise)]);
    assert.equal(money(remove.beforePaise), "₹1,000.00");
    assert.equal(money(remove.gstPaise), "₹180.00");
    // the shortcut: subtract 18% of the inclusive amount (212.40) and get 967.60, which is not what the calculator returns
    const shortcut = 118000 - Math.round(118000 * 0.18);
    assert.equal(money(shortcut), plain(REF.subtractingPercentFrom1180));
    assert.notEqual(remove.beforePaise, shortcut);
    has(t, ["₹967.60", "₹212.40"]);
    for (const [rate, share] of Object.entries(REF.shareAt)) has(t, [`${share}%`]);
    for (const rate of Object.keys(REF.shareAt)) assert.equal(pct(run("add", [{ amount: "1000", rate }]).total.shareHundredths), `${REF.shareAt[rate]}%`);
    has(t, ["18%", "15.25%", "1.18"]);
  });
});

describe("every figure in 'GST on a mixed invoice' is the calculator's", () => {
  test("the three items, the two rate rows, the invoice total and the rounding note", async () => {
    const t = await text(SLUGS[1]);
    const r = run("add", REF.mixed.items.map(([amount, rate]) => ({ amount, rate })));
    for (const item of r.items) has(t, [money(item.gstPaise), money(item.withPaise)]);
    for (const row of r.byRate) has(t, [money(row.beforePaise), money(row.gstPaise), money(row.withPaise)]);
    has(t, [money(r.total.beforePaise), money(r.total.gstPaise), money(r.total.withPaise), pct(r.total.shareHundredths)]);
    assert.equal(pct(r.total.shareHundredths), "12.50%");
    // rounding note: item by item 1.53, once on the grand total 1.52
    const three = run("add", Array.from({ length: 3 }, () => ({ amount: "10.10", rate: "5" }))).total;
    const once = run("add", [{ amount: "30.30", rate: "5" }]).total;
    assert.equal(money(three.gstPaise), "₹1.53");
    assert.equal(money(once.gstPaise), "₹1.52");
    has(t, ["₹1.53", "₹1.52", "₹0.51", "₹30.30", "₹10.10"]);
    // the 12.50% share sits between the shares of the two rates, as the article says
    assert.ok(r.byRate[0].shareHundredths < r.total.shareHundredths && r.total.shareHundredths < r.byRate[1].shareHundredths);
  });
});

describe("trust and scope wording", () => {
  test("no rate, classification, compliance, credit or advice claim in either GST article", async () => {
    for (const s of SLUGS) {
      const t = await text(s);
      for (const bad of [/correct (gst )?rate/i, /current (gst )?rate/i, /applicable rate/i, /you must charge/i, /gst-compliant/i, /\bcompliant\b/i, /official/i, /legally/i, /you should (charge|use|pick|choose)/i, /standard rate/i, /\brecommended\b/i, /latest gst/i]) {
        assert.ok(!bad.test(t), `${s}: ${bad}`);
      }
      const unqualified = (word) => t.split(/(?<=[.!?"])\s+/).filter((x) => new RegExp(word, "i").test(x) && !/\b(not|no|nor|never|do not|does not)\b/i.test(x));
      assert.deepEqual(unqualified("tax advice"), [], `${s}: tax advice`);
      assert.deepEqual(unqualified("which rate applies"), [], `${s}: which rate applies`);
      assert.ok(/example/i.test(t) && /(you enter|you would enter|rates? you enter)/i.test(t), `${s}: says the rates are examples the reader enters`);
      assert.ok(/not tax advice/i.test(t), `${s}: says it is not tax advice`);
      assert.ok(/(place of supply|reverse charge|input tax credit)/i.test(t) && /(e-invoicing|returns)/i.test(t), `${s}: states what is left out`);
    }
  });

  test("the articles stay out of rate lists, classification codes, returns and credit guidance", async () => {
    for (const s of SLUGS) {
      const t = (await text(s)).toLowerCase();
      for (const word of ["hsn code of", "sac code of", "gstr-", "itc claim", "rate list", "slab", "composition scheme", "section 16", "cgst", "sgst", "igst"]) assert.ok(!t.includes(word), `${s}: ${word}`);
    }
  });
});

describe("the article images are the approved explanatory diagrams, small and not data charts", () => {
  const dir = new URL("../../assets/Images/articles/", import.meta.url);

  test("each has a PNG and a WebP, both lightweight", () => {
    for (const s of SLUGS) {
      for (const ext of ["png", "webp"]) {
        const size = fs.statSync(new URL(`${s}.${ext}`, dir)).size;
        assert.ok(size > 1000 && size < 40000, `${s}.${ext} is ${size} bytes`);
      }
    }
  });

  test("the catalog describes each as the concept it shows, and the two differ", async () => {
    const { articles } = await import("../../assets/js/data/articles.js");
    const alts = SLUGS.map((s) => articles.find((a) => a.slug === s).heroImage.alt);
    assert.match(alts[0], /base of 100/i);
    assert.match(alts[0], /tax of 18/i);
    assert.match(alts[0], /118/);
    assert.match(alts[1], /item blocks/i);
    assert.match(alts[1], /rate groups/i);
    assert.match(alts[1], /invoice total/i);
    for (const alt of alts) assert.ok(!/chart|graph|histogram|pie/i.test(alt), `alt text describes a diagram, not a chart: ${alt}`);
    assert.notEqual(alts[0], alts[1]);
  });
});
