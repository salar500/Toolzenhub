/**
 * Tool Pack 21: the SWP engine (assets/js/calculators/formulas/swp.js).
 *
 * GOLDEN holds the expected values of the independent reference, tests/fixtures/swp-golden.py (Python decimal, 60
 * digits). It SIMULATES each plan period by period, finds each number a second way (the present-value factor, with
 * a closed form for whole years) and a third way (bisection on the first withdrawal), and asserts that they agree.
 * They were NOT produced by the code under test. Regenerate with:  python tests/fixtures/swp-golden.py
 *
 * Rows are written "year|withdrawals|growth|closing". Money is compared to a tenth of a paisa plus double precision,
 * counts of withdrawals exactly.
 */
const GOLDEN = {
 "A": {
  "A1": {
   "input": { "corpus": 10000000, "withdrawal": 80000, "rate": "8", "m": 12, "increase": "0" },
   "full": 250,
   "months": 250,
   "state": "used-up",
   "partial": "20680.4637",
   "withdrawn": "20020680.4637",
   "growth": "10020680.4637",
   "ending": "0.0000",
   "rowCount": 21,
   "rows": [
  "1|960000.0000|758889.0816|9798889.0816",
  "2|960000.0000|742800.2081|9581689.2896",
  "3|960000.0000|725424.2247|9347113.5144",
  "4|960000.0000|706658.1627|9093771.6771",
  "5|960000.0000|686390.8157|8820162.4928",
  "6|960000.0000|664502.0810|8524664.5738",
  "7|960000.0000|640862.2475|8205526.8213",
  "8|960000.0000|615331.2273|7860858.0485",
  "9|960000.0000|587757.7254|7488615.7739",
  "10|960000.0000|557978.3435|7086594.1174",
  "11|960000.0000|525816.6110|6652410.7284",
  "12|960000.0000|491081.9398|6183492.6682",
  "13|960000.0000|453568.4950|5677061.1632",
  "14|960000.0000|413053.9746|5130115.1378",
  "15|960000.0000|369298.2926|4539413.4304",
  "16|960000.0000|322042.1560|3901455.5864",
  "17|960000.0000|271005.5285|3212461.1149",
  "18|960000.0000|215885.9707|2468347.0856",
  "19|960000.0000|156356.8484|1664703.9340",
  "20|960000.0000|92065.3963|796769.3303",
  "21|820680.4637|23911.1334|0.0000" ]
  },
  "A1-6": {
   "input": { "corpus": 10000000, "withdrawal": 80000, "rate": "6", "m": 12, "increase": "0" },
   "full": 191,
   "months": 191,
   "state": "used-up",
   "partial": "44211.3180",
   "withdrawn": "15324211.3180",
   "growth": "5324211.3180",
   "ending": "0.0000",
   "rowCount": 16
  },
  "A1-10": {
   "input": { "corpus": 10000000, "withdrawal": 80000, "rate": "10", "m": 12, "increase": "0" },
   "full": 566,
   "months": 566,
   "state": "used-up",
   "partial": "37675.2883",
   "withdrawn": "45317675.2883",
   "growth": "35317675.2883",
   "ending": "0.0000",
   "rowCount": 48
  },
  "A2": {
   "input": { "corpus": 1200000, "withdrawal": 10000, "rate": "0", "m": 12, "increase": "0" },
   "full": 120,
   "months": 120,
   "state": "used-up",
   "partial": "0.0000",
   "withdrawn": "1200000.0000",
   "growth": "0.0000",
   "ending": "0.0000",
   "rowCount": 10
  },
  "A3": {
   "input": { "corpus": 10000000, "withdrawal": 30000, "rate": "10", "m": 12, "increase": "0" },
   "full": 600,
   "months": 600,
   "state": "not-used-up",
   "partial": "0.0000",
   "withdrawn": "18000000.0000",
   "growth": "740535677.6494",
   "ending": "732535677.6494",
   "rowCount": 50
  },
  "A4": {
   "input": { "corpus": 10000000, "withdrawal": 50000, "rate": "8", "m": 12, "increase": "5" },
   "full": 278,
   "months": 278,
   "state": "used-up",
   "partial": "11732.1836",
   "withdrawn": "25177169.6302",
   "growth": "15177169.6302",
   "ending": "0.0000",
   "rowCount": 24,
   "rows": [
  "1|600000.0000|774305.6760|10174305.6760",
  "2|630000.0000|786965.4139|10331271.0898",
  "3|661500.0000|798173.6949|10467944.7848",
  "4|694575.0000|807691.1909|10581060.9757",
  "5|729303.7500|815253.2666|10667010.4923",
  "6|765768.9375|820567.6474|10721809.2022",
  "7|804057.3844|823311.8846|10741063.7024",
  "8|844260.2536|823130.6020|10719934.0508",
  "9|886473.2663|819632.5052|10653093.2897",
  "10|930796.9296|812387.1333|10534683.4934",
  "11|977336.7761|800921.3331|10358268.0504",
  "12|1026203.6149|784715.4304|10116779.8660",
  "13|1077513.7956|763199.0749|9802465.1453",
  "14|1131389.4854|735746.7316|9406822.3914",
  "15|1187958.9597|701672.7873|8920536.2190",
  "16|1247356.9076|660226.2433|8333405.5546",
  "17|1309724.7530|610584.9574|7634265.7590",
  "18|1375210.9907|551849.3994|6810904.1677",
  "19|1443971.5402|483035.8790|5849968.5065",
  "20|1516170.1172|403069.2034|4736867.5927",
  "21|1591978.6231|310774.7164|3455663.6860",
  "22|1671577.5542|204869.6694|1988955.8012",
  "23|1755156.4320|83953.8673|317753.2365",
  "24|318884.5592|1131.3227|0.0000" ]
  },
  "A5": {
   "input": { "corpus": 50000, "withdrawal": 60000, "rate": "8", "m": 12, "increase": "0" },
   "full": 0,
   "months": 0,
   "state": "first-exceeds",
   "partial": "50000.0000",
   "withdrawn": "50000.0000",
   "growth": "0.0000",
   "ending": "0.0000",
   "rowCount": 1,
   "rows": [
  "1|50000.0000|0.0000|0.0000" ]
  },
  "A6": {
   "input": { "corpus": 10000000, "withdrawal": 100, "rate": "8", "m": 12, "increase": "0" },
   "full": 600,
   "months": 600,
   "state": "not-used-up",
   "partial": "0.0000",
   "withdrawn": "60000.0000",
   "growth": "458358115.6720",
   "ending": "468298115.6720",
   "rowCount": 50
  },
  "A7": {
   "input": { "corpus": 5000000, "withdrawal": 100000, "rate": "7", "m": 4, "increase": "0" },
   "full": 107,
   "months": 321,
   "state": "used-up",
   "partial": "83643.8971",
   "withdrawn": "10783643.8971",
   "growth": "5783643.8971",
   "ending": "0.0000",
   "rowCount": 27,
   "rows": [
  "1|400000.0000|332647.9913|4932647.9913",
  "2|400000.0000|327933.3507|4860581.3420",
  "3|400000.0000|322888.6852|4783470.0272",
  "4|400000.0000|317490.8932|4700960.9204",
  "5|400000.0000|311715.2557|4612676.1762",
  "6|400000.0000|305535.3236|4518211.4998",
  "7|400000.0000|298922.7963|4417134.2961",
  "8|400000.0000|291847.3920|4308981.6881",
  "9|400000.0000|284276.7095|4193258.3975",
  "10|400000.0000|276176.0791|4069434.4767",
  "11|400000.0000|267508.4047|3936942.8813",
  "12|400000.0000|258233.9930|3795176.8743",
  "13|400000.0000|248310.3725|3643487.2468",
  "14|400000.0000|237692.0986|3481179.3454",
  "15|400000.0000|226330.5455|3307509.8909",
  "16|400000.0000|214173.6837|3121683.5745",
  "17|400000.0000|201165.8415|2922849.4160",
  "18|400000.0000|187247.4504|2710096.8665",
  "19|400000.0000|172354.7720|2482451.6384",
  "20|400000.0000|156419.6060|2238871.2444",
  "21|400000.0000|139368.9784|1978240.2228",
  "22|400000.0000|121124.8069|1699365.0297",
  "23|400000.0000|101603.5434|1400968.5731",
  "24|400000.0000|80715.7914|1081684.3645",
  "25|400000.0000|58365.8968|740050.2613",
  "26|400000.0000|34451.5096|374501.7709",
  "27|383643.8971|9142.1262|0.0000" ]
  },
  "A8": {
   "input": { "corpus": 8000000, "withdrawal": 600000, "rate": "7", "m": 1, "increase": "3" },
   "full": 18,
   "months": 216,
   "state": "used-up",
   "partial": "115595.8133",
   "withdrawn": "14164257.0381",
   "growth": "6164257.0381",
   "ending": "0.0000",
   "rowCount": 19,
   "rows": [
  "1|600000.0000|518000.0000|7918000.0000",
  "2|618000.0000|511000.0000|7811000.0000",
  "3|636540.0000|502212.2000|7676672.2000",
  "4|655636.2000|491472.5200|7512508.5200",
  "5|675305.2860|478604.2264|7315807.4604",
  "6|695564.4446|463417.0111|7083660.0269",
  "7|716431.3779|445706.0054|6812934.6544",
  "8|737924.3193|425250.7235|6500261.0586",
  "9|760062.0488|401813.9307|6142012.9405",
  "10|782863.9103|375140.4321|5734289.4623",
  "11|806349.8276|344955.7744|5272895.4091",
  "12|830540.3224|310964.8561|4753319.9427",
  "13|855456.5321|272850.4387|4170713.8494",
  "14|881120.2281|230271.5535|3519865.1748",
  "15|907553.8349|182861.7938|2795173.1337",
  "16|934780.4500|130227.4879|1990620.1716",
  "17|962823.8635|71945.7416|1099742.0497",
  "18|991708.5794|7562.3429|115595.8133",
  "19|115595.8133|0.0000|0.0000" ]
  },
  "A9": {
   "input": { "corpus": 6000000, "withdrawal": 10000, "rate": "0", "m": 12, "increase": "0" },
   "full": 600,
   "months": 600,
   "state": "used-up-at-horizon",
   "partial": "0.0000",
   "withdrawn": "6000000.0000",
   "growth": "0.0000",
   "ending": "0.0000",
   "rowCount": 50
  },
  "A10": {
   "input": { "corpus": 100000, "withdrawal": 100000, "rate": "8", "m": 12, "increase": "0" },
   "full": 1,
   "months": 1,
   "state": "used-up",
   "partial": "0.0000",
   "withdrawn": "100000.0000",
   "growth": "0.0000",
   "ending": "0.0000",
   "rowCount": 1
  },
  "R-low": {
   "input": { "corpus": 10000000, "withdrawal": 74859, "rate": "8", "m": 12, "increase": "0" },
   "full": 300,
   "months": 300,
   "state": "used-up",
   "partial": "786.8008",
   "withdrawn": "22458486.8008",
   "growth": "12458486.8008",
   "ending": "0.0000",
   "rowCount": 26
  },
  "R-high": {
   "input": { "corpus": 10000000, "withdrawal": 74860, "rate": "8", "m": 12, "increase": "0" },
   "full": 299,
   "months": 299,
   "state": "used-up",
   "partial": "74732.7799",
   "withdrawn": "22457872.7799",
   "growth": "12457872.7799",
   "ending": "0.0000",
   "rowCount": 25
  }
 },
 "BC": {
  "B1": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "8", "m": 12, "years": 25, "increase": "0" },
   "F": "133.582937",
   "B": {
    "withdrawal": "74859.8600",
    "withdrawn": "22457958.0128",
    "growth": "12457958.0128",
    "finalYearWithdrawal": "74859.8600"
   },
   "C": {
    "corpus": "6679146.8714"
   }
  },
  "B2": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "8", "m": 12, "years": 25, "increase": "5" },
   "F": "210.872146",
   "B": {
    "withdrawal": "47422.1000",
    "withdrawn": "27159831.0400",
    "growth": "17159831.0400",
    "finalYearWithdrawal": "152941.0121"
   },
   "C": {
    "corpus": "10543607.3032"
   }
  },
  "B3": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "7", "m": 1, "years": 20, "increase": "3" },
   "F": "14.264880",
   "B": {
    "withdrawal": "701022.3793",
    "withdrawn": "18836733.8568",
    "growth": "8836733.8568",
    "finalYearWithdrawal": "1229246.9854"
   },
   "C": {
    "corpus": "713243.9916"
   }
  },
  "B4": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "0", "m": 12, "years": 1, "increase": "0" },
   "F": "12.000000",
   "B": {
    "withdrawal": "833333.3333",
    "withdrawn": "10000000.0000",
    "growth": "0.0000",
    "finalYearWithdrawal": "833333.3333"
   },
   "C": {
    "corpus": "600000.0000"
   }
  },
  "B5": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "0", "m": 12, "years": 50, "increase": "0" },
   "F": "600.000000",
   "B": {
    "withdrawal": "16666.6667",
    "withdrawn": "10000000.0000",
    "growth": "0.0000",
    "finalYearWithdrawal": "16666.6667"
   },
   "C": {
    "corpus": "30000000.0000"
   }
  },
  "B6": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "6", "m": 4, "years": 30, "increase": "2" },
   "F": "71.011000",
   "B": {
    "withdrawal": "140823.2530",
    "withdrawn": "22851715.5287",
    "growth": "12851715.5287",
    "finalYearWithdrawal": "250080.2261"
   },
   "C": {
    "corpus": "3550549.9930"
   }
  },
  "B7": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "12", "m": 12, "years": 10, "increase": "0" },
   "F": "72.133560",
   "B": {
    "withdrawal": "138631.7261",
    "withdrawn": "16635807.1349",
    "growth": "6635807.1349",
    "finalYearWithdrawal": "138631.7261"
   },
   "C": {
    "corpus": "3606678.0237"
   }
  },
  "B-6": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "6", "m": 12, "years": 25, "increase": "0" },
   "F": "158.341403",
   "B": {
    "withdrawal": "63154.6758",
    "withdrawn": "18946402.7495",
    "growth": "8946402.7495",
    "finalYearWithdrawal": "63154.6758"
   },
   "C": {
    "corpus": "7917070.1680"
   }
  },
  "B-10": {
   "input": { "corpus": 10000000, "withdrawalForC": 50000, "rate": "10", "m": 12, "years": 25, "increase": "0" },
   "F": "114.738657",
   "B": {
    "withdrawal": "87154.5849",
    "withdrawn": "26146375.4829",
    "growth": "16146375.4829",
    "finalYearWithdrawal": "87154.5849"
   },
   "C": {
    "corpus": "5736932.8341"
   }
  }
 },
 "monthlyReturn8": "0.00643403011000345483391717928725186506402042734200809768181",
 "quarterlyReturn7": "0.01705852500181131266455716666311358613666810105249287690053",
 "monthlyReturn12": "0.00948879293458297412635506919349395639446070084578947568747"
};

import test from "node:test";
import assert from "node:assert/strict";

const swp = await import("../../assets/js/calculators/formulas/swp.js");

const FREQ = { 12: "monthly", 4: "quarterly", 1: "yearly" };
const num = (s) => Number(s);

function near(actual, expected, label, tolerance = 0.001) {
  const want = num(expected);
  assert.ok(
    Math.abs(actual - want) <= tolerance + 1e-12 * Math.abs(want),
    `${label}: got ${actual}, expected ${want}`
  );
}

const lasts = (c) =>
  swp.calculateSwp({
    mode: "lasts",
    corpus: c.input.corpus,
    withdrawal: c.input.withdrawal,
    annualReturn: num(c.input.rate),
    increase: num(c.input.increase),
    periodsPerYear: c.input.m
  });

const base = (over = {}) => ({
  mode: "lasts",
  corpus: 10000000,
  withdrawal: 80000,
  years: 25,
  annualReturn: 8,
  increase: 0,
  periodsPerYear: 12,
  ...over
});

/* ---------- the return per period ---------- */

test("period return: effective-annual conversion, 0 stays exactly 0", () => {
  near(swp.periodReturn(8, 12), GOLDEN.monthlyReturn8, "8% monthly", 1e-12);
  near(swp.periodReturn(7, 4), GOLDEN.quarterlyReturn7, "7% quarterly", 1e-12);
  near(swp.periodReturn(12, 12), GOLDEN.monthlyReturn12, "12% monthly", 1e-12);
  assert.equal(swp.periodReturn(0, 12), 0);
  assert.equal(swp.periodReturn(8, 1), 0.08);
});

test("frequency independence: with negligible withdrawals a corpus grows by the entered return over a year, whatever the frequency", () => {
  for (const m of [12, 4, 1]) {
    const r = swp.calculateSwp(base({ corpus: 1e9, withdrawal: 100, annualReturn: 9.5, periodsPerYear: m }));
    near(r.yearly[0].closing / 1e9, 1.095, `closing after one year at ${m} a year`, 1e-5);
  }
});

/* ---------- Mode A, golden ---------- */

for (const [id, c] of Object.entries(GOLDEN.A)) {
  test(`Mode A ${id}: golden values`, () => {
    const r = lasts(c);
    assert.equal(r.mode, "lasts");
    assert.equal(r.answer.state, c.state, "state");
    assert.equal(r.answer.fullWithdrawals, c.full, "full withdrawals");
    assert.equal(r.answer.months, c.months, "months");
    near(r.answer.partialWithdrawal, c.partial, "partial");
    near(r.totals.withdrawn, c.withdrawn, "withdrawn");
    near(r.totals.growth, c.growth, "growth");
    near(r.totals.ending, c.ending, "ending");
    assert.equal(r.yearly.length, c.rowCount, "rows");
    if (c.rows) {
      c.rows.forEach((line, k) => {
        const [year, withdrawals, growth, closing] = line.split("|");
        const row = r.yearly[k];
        assert.equal(row.year, Number(year), `row ${k} year`);
        near(row.withdrawals, withdrawals, `row ${year} withdrawals`);
        near(row.growth, growth, `row ${year} growth`);
        near(row.closing, closing, `row ${year} closing`);
      });
    }
  });
}

test("Mode A: the four states are distinguished", () => {
  assert.equal(lasts(GOLDEN.A.A1).answer.state, "used-up");
  assert.equal(lasts(GOLDEN.A.A2).answer.state, "used-up");
  assert.equal(lasts(GOLDEN.A.A3).answer.state, "not-used-up");
  assert.equal(lasts(GOLDEN.A.A9).answer.state, "used-up-at-horizon");
  assert.equal(lasts(GOLDEN.A.A5).answer.state, "first-exceeds");
});

test("Mode A: exact exhaustion at zero return is exact integer behaviour (no tolerance needed)", () => {
  const r = lasts(GOLDEN.A.A2);
  assert.equal(r.answer.fullWithdrawals, 120);
  assert.equal(r.answer.partialWithdrawal, 0);
  assert.equal(r.totals.withdrawn, 1200000);
  assert.equal(r.totals.growth, 0);
  assert.equal(r.totals.ending, 0);
});

test("Mode A: used up exactly at the 50-year horizon has no partial withdrawal", () => {
  const r = lasts(GOLDEN.A.A9);
  assert.equal(r.answer.fullWithdrawals, 600);
  assert.equal(r.answer.partialWithdrawal, 0);
  assert.equal(r.totals.ending, 0);
  assert.equal(r.yearly.length, 50);
});

test("Mode A: a withdrawal equal to the corpus is one full withdrawal, and the second is not funded", () => {
  const r = lasts(GOLDEN.A.A10);
  assert.equal(r.answer.fullWithdrawals, 1);
  assert.equal(r.answer.partialWithdrawal, 0);
  assert.equal(r.totals.ending, 0);
});

test("Mode A: a first withdrawal larger than the corpus pays the whole corpus as a partial, lasting 0 months", () => {
  const r = lasts(GOLDEN.A.A5);
  assert.equal(r.answer.fullWithdrawals, 0);
  assert.equal(r.answer.months, 0);
  assert.equal(r.answer.partialWithdrawal, 50000);
  assert.equal(r.yearly.length, 1);
  assert.equal(r.yearly[0].closing, 0);
});

test("Mode A: the partial final withdrawal is counted in the total withdrawn but never as time", () => {
  const r = lasts(GOLDEN.A.A4);
  assert.equal(r.answer.fullWithdrawals, 278);
  assert.equal(r.answer.months, 278);
  near(r.answer.partialWithdrawal, GOLDEN.A.A4.partial, "partial");
  assert.equal(r.yearly.at(-1).final, true);
  assert.equal(r.yearly.slice(0, -1).some((row) => row.final), false);
});

test("Mode A: the duration of quarterly and yearly plans is in months", () => {
  assert.equal(lasts(GOLDEN.A.A7).answer.months, 321);
  assert.equal(lasts(GOLDEN.A.A8).answer.months, 216);
});

test("Mode A: the rounding-sensitive pair (a rupee moves the result by a whole withdrawal)", () => {
  const low = lasts(GOLDEN.A["R-low"]);
  const high = lasts(GOLDEN.A["R-high"]);
  assert.equal(low.answer.fullWithdrawals, 300);
  assert.equal(high.answer.fullWithdrawals, 299);
  near(low.answer.partialWithdrawal, GOLDEN.A["R-low"].partial, "partial at 74,859");
  near(high.answer.partialWithdrawal, GOLDEN.A["R-high"].partial, "partial at 74,860");
});

/* ---------- Modes B and C, golden ---------- */

for (const [id, c] of Object.entries(GOLDEN.BC)) {
  const input = (mode) => ({
    mode,
    corpus: c.input.corpus,
    withdrawal: c.input.withdrawalForC,
    years: c.input.years,
    annualReturn: num(c.input.rate),
    increase: num(c.input.increase),
    periodsPerYear: c.input.m
  });

  test(`Mode B ${id}: first withdrawal that uses up the corpus`, () => {
    const r = swp.calculateSwp(input("withdraw"));
    near(r.answer.firstWithdrawal, c.B.withdrawal, "first withdrawal");
    near(r.answer.finalYearWithdrawal, c.B.finalYearWithdrawal, "final-year withdrawal");
    near(r.totals.withdrawn, c.B.withdrawn, "withdrawn");
    near(r.totals.growth, c.B.growth, "growth");
    assert.equal(r.totals.ending, 0);
    assert.equal(r.yearly.length, c.input.years);
    assert.equal(r.yearly.at(-1).closing, 0);
  });

  test(`Mode C ${id}: corpus a withdrawal plan needs`, () => {
    const r = swp.calculateSwp(input("corpus"));
    near(r.answer.corpus, c.C.corpus, "corpus");
    assert.equal(r.yearly.length, c.input.years);
    assert.equal(r.totals.ending, 0);
  });

  test(`B and C ${id}: round trip`, () => {
    const b = swp.calculateSwp(input("withdraw"));
    const back = swp.calculateSwp({ ...input("corpus"), withdrawal: b.answer.firstWithdrawal });
    near(back.answer.corpus / c.input.corpus, 1, "C(B(corpus))", 1e-9);
    const c2 = swp.calculateSwp(input("corpus"));
    const again = swp.calculateSwp({ ...input("withdraw"), corpus: c2.answer.corpus });
    near(again.answer.firstWithdrawal / c.input.withdrawalForC, 1, "B(C(withdrawal))", 1e-9);
  });
}

test("Mode B and C: the shortest and longest duration", () => {
  const short = swp.calculateSwp(base({ mode: "withdraw", years: 1, annualReturn: 0 }));
  assert.equal(short.yearly.length, 1);
  near(short.answer.firstWithdrawal, 10000000 / 12, "1 year", 1e-6);
  const long = swp.calculateSwp(base({ mode: "withdraw", years: 50, annualReturn: 0 }));
  assert.equal(long.yearly.length, 50);
  near(long.answer.firstWithdrawal, 10000000 / 600, "50 years", 1e-6);
});

/* ---------- scenarios ---------- */

test("scenarios: the assumed return plus and minus two points, clipped to 0 and 30, never repeated", () => {
  const keys = (rate) => swp.scenarioRates(rate).map((s) => `${s.key}:${s.rate}`);
  assert.deepEqual(keys(8), ["lower:6", "assumed:8", "higher:10"]);
  assert.deepEqual(keys(1), ["lower:0", "assumed:1", "higher:3"]);
  assert.deepEqual(keys(0), ["assumed:0", "higher:2"]);
  assert.deepEqual(keys(30), ["lower:28", "assumed:30"]);
  assert.deepEqual(keys(29), ["lower:27", "assumed:29", "higher:30"]);
});

test("scenarios: golden values for Mode A, B and C", () => {
  const a = lasts(GOLDEN.A.A1);
  const byKey = Object.fromEntries(a.scenarios.map((s) => [s.key, s]));
  assert.equal(byKey.lower.answer.fullWithdrawals, GOLDEN.A["A1-6"].full);
  assert.equal(byKey.assumed.answer.fullWithdrawals, GOLDEN.A.A1.full);
  assert.equal(byKey.higher.answer.fullWithdrawals, GOLDEN.A["A1-10"].full);
  const b = swp.calculateSwp({ mode: "withdraw", corpus: 10000000, years: 25, annualReturn: 8, increase: 0, periodsPerYear: 12 });
  const bk = Object.fromEntries(b.scenarios.map((s) => [s.key, s]));
  near(bk.lower.answer.firstWithdrawal, GOLDEN.BC["B-6"].B.withdrawal, "B at 6%");
  near(bk.higher.answer.firstWithdrawal, GOLDEN.BC["B-10"].B.withdrawal, "B at 10%");
  const c = swp.calculateSwp({ mode: "corpus", withdrawal: 50000, years: 25, annualReturn: 8, increase: 0, periodsPerYear: 12 });
  const ck = Object.fromEntries(c.scenarios.map((s) => [s.key, s]));
  near(ck.lower.answer.corpus, GOLDEN.BC["B-6"].C.corpus, "C at 6%");
  near(ck.higher.answer.corpus, GOLDEN.BC["B-10"].C.corpus, "C at 10%");
  near(ck.assumed.answer.corpus, GOLDEN.BC.B1.C.corpus, "C as assumed");
});

/* ---------- invariants ---------- */

const GRID = [];
for (const m of [12, 4, 1])
  for (const rate of [0, 4.5, 8, 14])
    for (const inc of [0, 5, 12]) GRID.push({ m, rate, inc });

test("accounting: corpus - withdrawn + growth = ending balance, for every Mode A run", () => {
  for (const { m, rate, inc } of GRID) {
    for (const [corpus, withdrawal] of [[10000000, 80000], [2500000, 30000], [500000, 40000], [30000000, 5000]]) {
      const r = swp.calculateSwp(base({ corpus, withdrawal, annualReturn: rate, increase: inc, periodsPerYear: m }));
      const diff = corpus - r.totals.withdrawn + r.totals.growth - r.totals.ending;
      assert.ok(Math.abs(diff) < 1e-4, `m=${m} r=${rate} s=${inc} ${corpus}/${withdrawal}: ${diff}`);
      const rowDiff = r.yearly.reduce((acc, row) => acc - row.withdrawals + row.growth, corpus) - r.yearly.at(-1).closing;
      assert.ok(Math.abs(rowDiff) < 1e-4, "the yearly rows add up to the final balance");
    }
  }
});

test("monotonic: a bigger corpus never supports a smaller withdrawal; a bigger withdrawal never needs a smaller corpus", () => {
  for (const { m, rate, inc } of GRID) {
    let lastW = -1;
    for (const corpus of [1e5, 1e6, 5e6, 2e7, 1e8, 1e9]) {
      const w = swp.calculateSwp({ mode: "withdraw", corpus, years: 20, annualReturn: rate, increase: inc, periodsPerYear: m }).answer.firstWithdrawal;
      assert.ok(w > lastW, `B rises with the corpus (m=${m} r=${rate} s=${inc})`);
      lastW = w;
    }
    let lastC = -1;
    for (const withdrawal of [100, 5000, 50000, 5e5, 1e7]) {
      const c = swp.calculateSwp({ mode: "corpus", withdrawal, years: 20, annualReturn: rate, increase: inc, periodsPerYear: m }).answer.corpus;
      assert.ok(c > lastC, `C rises with the withdrawal (m=${m} r=${rate} s=${inc})`);
      lastC = c;
    }
  }
});

test("monotonic: the plan's response to each input points the right way", () => {
  const full = (over) => swp.calculateSwp(base(over)).answer.fullWithdrawals;
  const b = (over) => swp.calculateSwp(base({ mode: "withdraw", ...over })).answer.firstWithdrawal;
  const c = (over) => swp.calculateSwp(base({ mode: "corpus", withdrawal: 50000, ...over })).answer.corpus;
  assert.ok(full({ corpus: 12000000 }) >= full({ corpus: 10000000 }));
  assert.ok(full({ annualReturn: 9 }) >= full({ annualReturn: 8 }));
  assert.ok(full({ withdrawal: 90000 }) <= full({ withdrawal: 80000 }));
  assert.ok(full({ increase: 3 }) <= full({ increase: 0 }));
  assert.ok(b({ annualReturn: 9 }) > b({ annualReturn: 8 }));
  assert.ok(b({ increase: 5 }) < b({ increase: 0 }));
  assert.ok(b({ years: 30 }) < b({ years: 20 }));
  assert.ok(c({ years: 30 }) > c({ years: 20 }));
  assert.ok(c({ annualReturn: 9 }) < c({ annualReturn: 8 }));
  assert.ok(c({ increase: 5 }) > c({ increase: 0 }));
});

test("a yearly increase of 0 equals leaving it out; the increase applies once a year, not every period", () => {
  const withZero = swp.calculateSwp(base({ increase: 0 }));
  const without = swp.calculateSwp({ ...base(), increase: undefined });
  assert.deepEqual(withZero.answer, without.answer);
  const r = swp.calculateSwp(base({ increase: 10, corpus: 1e9 }));
  near(r.yearly[0].withdrawals, 960000, "year 1");
  near(r.yearly[1].withdrawals, 960000 * 1.1, "year 2");
  near(r.yearly[2].withdrawals, 960000 * 1.1 * 1.1, "year 3", 0.01);
});

test("scenarios are ordered: a lower return lasts no longer, a higher return no shorter", () => {
  const r = lasts(GOLDEN.A.A1);
  const [lower, assumed, higher] = r.scenarios;
  assert.ok(lower.answer.fullWithdrawals <= assumed.answer.fullWithdrawals);
  assert.ok(assumed.answer.fullWithdrawals <= higher.answer.fullWithdrawals);
});

test("hidden fields never change a result: years does not affect Mode A, corpus does not affect Mode C, withdrawal does not affect Mode B", () => {
  const a1 = swp.calculateSwp(base({ mode: "lasts", years: 5 }));
  const a2 = swp.calculateSwp(base({ mode: "lasts", years: 40 }));
  assert.deepEqual(a1, { ...a2, input: a1.input });
  const b1 = swp.calculateSwp(base({ mode: "withdraw", withdrawal: 1 }));
  const b2 = swp.calculateSwp(base({ mode: "withdraw", withdrawal: 999999 }));
  assert.deepEqual(b1, { ...b2, input: b1.input });
  const c1 = swp.calculateSwp(base({ mode: "corpus", corpus: 5 }));
  const c2 = swp.calculateSwp(base({ mode: "corpus", corpus: 7e8 }));
  assert.deepEqual(c1, { ...c2, input: c1.input });
});

test("closed form (whole years) and the summed factor agree: B and C give the same answers either way", () => {
  // Mode C at 1 withdrawal per year with no increase, return r: corpus = W * (1 - v^Y) / (1 - v)
  const r = swp.calculateSwp({ mode: "corpus", withdrawal: 1000, years: 10, annualReturn: 7, increase: 0, periodsPerYear: 1 });
  const v = 1 / 1.07;
  near(r.answer.corpus, (1000 * (1 - v ** 10)) / (1 - v), "annuity-due closed form", 1e-6);
});

/* ---------- validation ---------- */

const raw = (over = {}) => ({
  mode: "lasts",
  corpus: "10000000",
  withdrawal: "80000",
  frequency: "monthly",
  years: "25",
  annualReturn: "8",
  increase: "",
  ...over
});

const fieldsOf = (result) => (result.ok ? [] : result.errors.flatMap((e) => e.fields));

test("validation: a valid Mode A entry gives clean values, with a blank increase meaning 0", () => {
  const v = swp.validateSwpInputs(raw());
  assert.equal(v.ok, true);
  assert.deepEqual(v.values, {
    mode: "lasts",
    corpus: 10000000,
    withdrawal: 80000,
    years: null,
    annualReturn: 8,
    increase: 0,
    periodsPerYear: 12
  });
  assert.equal(swp.validateSwpInputs(raw({ frequency: "quarterly" })).values.periodsPerYear, 4);
  assert.equal(swp.validateSwpInputs(raw({ frequency: "yearly" })).values.periodsPerYear, 1);
});

test("validation: only the fields of the selected mode are checked and used", () => {
  const a = swp.validateSwpInputs(raw({ mode: "lasts", years: "", }));
  assert.equal(a.ok, true, "years is not needed in Mode A");
  const aBad = swp.validateSwpInputs(raw({ mode: "lasts", years: "999" }));
  assert.equal(aBad.ok, true, "a bad years value in a hidden field is ignored");
  assert.equal(aBad.values.years, null);
  const b = swp.validateSwpInputs(raw({ mode: "withdraw", withdrawal: "" }));
  assert.equal(b.ok, true, "the withdrawal is not needed in Mode B");
  assert.equal(b.values.withdrawal, null);
  assert.equal(b.values.years, 25);
  const c = swp.validateSwpInputs(raw({ mode: "corpus", corpus: "abc" }));
  assert.equal(c.ok, true, "the corpus is not needed in Mode C");
  assert.equal(c.values.corpus, null);
  assert.deepEqual(fieldsOf(swp.validateSwpInputs(raw({ mode: "withdraw", years: "" }))), ["years"]);
  assert.deepEqual(fieldsOf(swp.validateSwpInputs(raw({ mode: "corpus", withdrawal: "" }))), ["withdrawal"]);
});

test("validation: limits and bad values, each on its own field", () => {
  const bad = (over) => fieldsOf(swp.validateSwpInputs(raw(over)));
  assert.deepEqual(bad({ corpus: "9999" }), ["corpus"]);
  assert.deepEqual(bad({ corpus: "1000000001" }), ["corpus"]);
  assert.deepEqual(bad({ corpus: "" }), ["corpus"]);
  assert.deepEqual(bad({ corpus: "abc" }), ["corpus"]);
  assert.deepEqual(bad({ withdrawal: "99" }), ["withdrawal"]);
  assert.deepEqual(bad({ withdrawal: "100000001" }), ["withdrawal"]);
  assert.deepEqual(bad({ annualReturn: "-1" }), ["annualReturn"]);
  assert.deepEqual(bad({ annualReturn: "30.0001" }), ["annualReturn"]);
  assert.deepEqual(bad({ annualReturn: "" }), ["annualReturn"]);
  assert.deepEqual(bad({ increase: "-1" }), ["increase"]);
  assert.deepEqual(bad({ increase: "20.5" }), ["increase"]);
  assert.deepEqual(bad({ increase: "abc" }), ["increase"]);
  assert.deepEqual(bad({ mode: "withdraw", years: "0" }), ["years"]);
  assert.deepEqual(bad({ mode: "withdraw", years: "51" }), ["years"]);
  assert.deepEqual(bad({ mode: "withdraw", years: "2.5" }), ["years"]);
  assert.deepEqual(bad({ frequency: "weekly" }), ["frequency"]);
  assert.deepEqual(bad({ mode: "nonsense" }), ["mode"]);
  for (const ok of [{ corpus: "10000" }, { corpus: "1000000000" }, { withdrawal: "100" }, { annualReturn: "0" }, { annualReturn: "30" }, { increase: "20" }, { increase: "0" }]) {
    assert.deepEqual(bad(ok), [], JSON.stringify(ok));
  }
  assert.deepEqual(bad({ mode: "withdraw", years: "1" }), []);
  assert.deepEqual(bad({ mode: "withdraw", years: "50" }), []);
});

test("validation: several errors are all reported", () => {
  assert.deepEqual(fieldsOf(swp.validateSwpInputs(raw({ corpus: "1", withdrawal: "1", annualReturn: "99" }))).sort(), ["annualReturn", "corpus", "withdrawal"]);
});

test("the limits are the approved ones", () => {
  assert.deepEqual(swp.SWP_LIMITS.corpus, { min: 10000, max: 1000000000 });
  assert.deepEqual(swp.SWP_LIMITS.withdrawal, { min: 100, max: 100000000 });
  assert.deepEqual(swp.SWP_LIMITS.years, { min: 1, max: 50 });
  assert.deepEqual(swp.SWP_LIMITS.rate, { min: 0, max: 30 });
  assert.deepEqual(swp.SWP_LIMITS.increase, { min: 0, max: 20 });
  assert.equal(swp.SWP_LIMITS.horizonYears, 50);
  assert.equal(swp.EXHAUSTION_TOLERANCE, 0.005);
});
