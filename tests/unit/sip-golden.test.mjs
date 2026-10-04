/**
 * Tool Pack 3: the SIP engine (formulas/sip.js).
 *
 * GOLDEN holds the expected values of the independent reference, tests/fixtures/sip-golden.py (Python decimal, 60
 * digits). It SIMULATES each plan month by month, finds the required SIP by bisection on a simulation (no linearity
 * assumed) and asserts that its own closed form, its yearly rows and its target answer agree. They were NOT produced
 * by the code under test. Regenerate with:  python tests/fixtures/sip-golden.py
 *
 * Money is compared to a cent plus double precision, months exactly, rates to 1e-12.
 */
const GOLDEN = {
  "A-ordinary-15y": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 180,
      "stepUp": "0",
      "target": 10000000
    },
    "invested": "1800000.0000",
    "value": "4179242.6576",
    "growth": "2379242.6576",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "3483451.4309"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "4179242.6576"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "5045759.9951"
      }
    ],
    "target": {
      "amount": 10000000,
      "reached": false,
      "difference": "-5820757.3424",
      "requiredStartingSip": "23927.7803"
    },
    "yearly": [
      {
        "year": 1,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "120000.0000",
        "value": "126702.8116"
      },
      {
        "year": 2,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "240000.0000",
        "value": "266673.0633"
      },
      {
        "year": 3,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "360000.0000",
        "value": "421300.0293"
      },
      {
        "year": 4,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "480000.0000",
        "value": "592118.4593"
      },
      {
        "year": 5,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "600000.0000",
        "value": "780823.8111"
      },
      {
        "year": 6,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "720000.0000",
        "value": "989289.0791"
      },
      {
        "year": 7,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "840000.0000",
        "value": "1219583.3847"
      },
      {
        "year": 8,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "960000.0000",
        "value": "1473992.5136"
      },
      {
        "year": 9,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1080000.0000",
        "value": "1755041.6026"
      },
      {
        "year": 10,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1200000.0000",
        "value": "2065520.2039"
      },
      {
        "year": 11,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1320000.0000",
        "value": "2408509.9720"
      },
      {
        "year": 12,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1440000.0000",
        "value": "2787415.2507"
      },
      {
        "year": 13,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1560000.0000",
        "value": "3205996.8634"
      },
      {
        "year": 14,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1680000.0000",
        "value": "3668409.4408"
      },
      {
        "year": 15,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "1800000.0000",
        "value": "4179242.6576"
      }
    ]
  },
  "B-zero-return-10y": {
    "input": {
      "monthlySip": 5000,
      "annualReturn": "0",
      "months": 120,
      "stepUp": "0",
      "target": null
    },
    "invested": "600000.0000",
    "value": "600000.0000",
    "growth": "0.0000",
    "finalMonthlySip": "5000.0000",
    "scenarios": [
      {
        "key": "assumed",
        "rate": "0",
        "value": "600000.0000"
      },
      {
        "key": "higher",
        "rate": "2",
        "value": "664704.2988"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "60000.0000",
        "value": "60000.0000"
      },
      {
        "year": 2,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "120000.0000",
        "value": "120000.0000"
      },
      {
        "year": 3,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "180000.0000",
        "value": "180000.0000"
      },
      {
        "year": 4,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "240000.0000",
        "value": "240000.0000"
      },
      {
        "year": 5,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "300000.0000",
        "value": "300000.0000"
      },
      {
        "year": 6,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "360000.0000",
        "value": "360000.0000"
      },
      {
        "year": 7,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "420000.0000",
        "value": "420000.0000"
      },
      {
        "year": 8,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "480000.0000",
        "value": "480000.0000"
      },
      {
        "year": 9,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "540000.0000",
        "value": "540000.0000"
      },
      {
        "year": 10,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "600000.0000",
        "value": "600000.0000"
      }
    ]
  },
  "C-short-12-months": {
    "input": {
      "monthlySip": 5000,
      "annualReturn": "8",
      "months": 12,
      "stepUp": "0",
      "target": null
    },
    "invested": "60000.0000",
    "value": "62664.6276",
    "growth": "2664.6276",
    "finalMonthlySip": "5000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "6",
        "value": "61986.2009"
      },
      {
        "key": "assumed",
        "rate": "8",
        "value": "62664.6276"
      },
      {
        "key": "higher",
        "rate": "10",
        "value": "63351.4058"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "months": 12,
        "monthlySip": "5000.0000",
        "invested": "60000.0000",
        "value": "62664.6276"
      }
    ]
  },
  "D-one-month": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 1,
      "stepUp": "0",
      "target": null
    },
    "invested": "10000.0000",
    "value": "10083.3333",
    "growth": "83.3333",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "10066.6667"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "10083.3333"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "10100.0000"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "months": 1,
        "monthlySip": "10000.0000",
        "invested": "10000.0000",
        "value": "10083.3333"
      }
    ]
  },
  "E-high-return-10y": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "30",
      "months": 120,
      "stepUp": "0",
      "target": null
    },
    "invested": "1200000.0000",
    "value": "7526841.4318",
    "growth": "6326841.4318",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "28",
        "value": "6545277.3396"
      },
      {
        "key": "assumed",
        "rate": "30",
        "value": "7526841.4318"
      }
    ]
  },
  "F-long-40y": {
    "input": {
      "monthlySip": 1000,
      "annualReturn": "10",
      "months": 480,
      "stepUp": "0",
      "target": null
    },
    "invested": "480000.0000",
    "value": "6376780.2441",
    "growth": "5896780.2441",
    "finalMonthlySip": "1000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "3514281.2169"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "6376780.2441"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "11882420.2354"
      }
    ]
  },
  "G-stepup-10pct-15y": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 180,
      "stepUp": "10",
      "target": 10000000
    },
    "invested": "3812697.8033",
    "value": "7437840.1044",
    "growth": "3625142.3011",
    "finalMonthlySip": "37974.9834",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "6416131.2806"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "7437840.1044"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "8683849.4310"
      }
    ],
    "target": {
      "amount": 10000000,
      "reached": false,
      "difference": "-2562159.8956",
      "requiredStartingSip": "13444.7633"
    },
    "yearly": [
      {
        "year": 1,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "120000.0000",
        "value": "126702.8116"
      },
      {
        "year": 2,
        "months": 12,
        "monthlySip": "11000.0000",
        "invested": "252000.0000",
        "value": "279343.3444"
      },
      {
        "year": 3,
        "months": 12,
        "monthlySip": "12100.0000",
        "invested": "397200.0000",
        "value": "461904.6449"
      },
      {
        "year": 4,
        "months": 12,
        "monthlySip": "13310.0000",
        "invested": "556920.0000",
        "value": "678913.5394"
      },
      {
        "year": 5,
        "months": 12,
        "monthlySip": "14641.0000",
        "invested": "732612.0000",
        "value": "935510.2451"
      },
      {
        "year": 6,
        "months": 12,
        "monthlySip": "16105.1000",
        "invested": "925873.2000",
        "value": "1237526.5376"
      },
      {
        "year": 7,
        "months": 12,
        "monthlySip": "17715.6100",
        "invested": "1138460.5200",
        "value": "1591573.4970"
      },
      {
        "year": 8,
        "months": 12,
        "monthlySip": "19487.1710",
        "invested": "1372306.5720",
        "value": "2005139.9756"
      },
      {
        "year": 9,
        "months": 12,
        "monthlySip": "21435.8881",
        "invested": "1629537.2292",
        "value": "2486703.0622"
      },
      {
        "year": 10,
        "months": 12,
        "monthlySip": "23579.4769",
        "invested": "1912490.9521",
        "value": "3045851.9697"
      },
      {
        "year": 11,
        "months": 12,
        "monthlySip": "25937.4246",
        "invested": "2223740.0473",
        "value": "3693426.9347"
      },
      {
        "year": 12,
        "months": 12,
        "monthlySip": "28531.1671",
        "invested": "2566114.0521",
        "value": "4441674.9069"
      },
      {
        "year": 13,
        "months": 12,
        "monthlySip": "31384.2838",
        "invested": "2942725.4573",
        "value": "5304424.0104"
      },
      {
        "year": 14,
        "months": 12,
        "monthlySip": "34522.7121",
        "invested": "3356998.0030",
        "value": "6297278.9888"
      },
      {
        "year": 15,
        "months": 12,
        "monthlySip": "37974.9834",
        "invested": "3812697.8033",
        "value": "7437840.1044"
      }
    ]
  },
  "H-stepup-5pct-20y": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 240,
      "stepUp": "5",
      "target": null
    },
    "invested": "3967914.4923",
    "value": "10825699.9910",
    "growth": "6857785.4987",
    "finalMonthlySip": "25269.5020",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "8634574.4018"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "10825699.9910"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "13737623.2849"
      }
    ]
  },
  "I-target-reached": {
    "input": {
      "monthlySip": 50000,
      "annualReturn": "12",
      "months": 240,
      "stepUp": "0",
      "target": 10000000
    },
    "invested": "12000000.0000",
    "value": "49957395.9521",
    "growth": "37957395.9521",
    "finalMonthlySip": "50000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "10",
        "value": "38284845.4812"
      },
      {
        "key": "assumed",
        "rate": "12",
        "value": "49957395.9521"
      },
      {
        "key": "higher",
        "rate": "14",
        "value": "65817313.7557"
      }
    ],
    "target": {
      "amount": 10000000,
      "reached": true,
      "difference": "39957395.9521",
      "requiredStartingSip": "10008.5281"
    }
  },
  "J-partial-year-18-months": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 18,
      "stepUp": "10",
      "target": null
    },
    "invested": "186000.0000",
    "value": "201123.3700",
    "growth": "15123.3700",
    "finalMonthlySip": "11000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "197983.9504"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "201123.3700"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "204322.4857"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "months": 12,
        "monthlySip": "10000.0000",
        "invested": "120000.0000",
        "value": "126702.8116"
      },
      {
        "year": 2,
        "months": 6,
        "monthlySip": "11000.0000",
        "invested": "186000.0000",
        "value": "201123.3700"
      }
    ]
  },
  "K-11-months": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 11,
      "stepUp": "0",
      "target": null
    },
    "invested": "110000.0000",
    "value": "115655.6809",
    "growth": "5655.6809",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "114499.2602"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "115655.6809"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "116825.0301"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "months": 11,
        "monthlySip": "10000.0000",
        "invested": "110000.0000",
        "value": "115655.6809"
      }
    ]
  },
  "L-stepup-50pct-5y": {
    "input": {
      "monthlySip": 1000,
      "annualReturn": "10",
      "months": 60,
      "stepUp": "50",
      "target": null
    },
    "invested": "158250.0000",
    "value": "190667.6253",
    "growth": "32417.6253",
    "finalMonthlySip": "5062.5000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "183452.4879"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "190667.6253"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "198298.8593"
      }
    ],
    "yearly": [
      {
        "year": 1,
        "months": 12,
        "monthlySip": "1000.0000",
        "invested": "12000.0000",
        "value": "12670.2812"
      },
      {
        "year": 2,
        "months": 12,
        "monthlySip": "1500.0000",
        "invested": "30000.0000",
        "value": "33002.4469"
      },
      {
        "year": 3,
        "months": 12,
        "monthlySip": "2250.0000",
        "invested": "57000.0000",
        "value": "64966.3670"
      },
      {
        "year": 4,
        "months": 12,
        "monthlySip": "3375.0000",
        "invested": "97500.0000",
        "value": "114531.3934"
      },
      {
        "year": 5,
        "months": 12,
        "monthlySip": "5062.5000",
        "invested": "158250.0000",
        "value": "190667.6253"
      }
    ]
  },
  "M-return-1pct": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "1",
      "months": 60,
      "stepUp": "0",
      "target": null
    },
    "invested": "600000.0000",
    "value": "615502.9795",
    "growth": "15502.9795",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "0",
        "value": "600000.0000"
      },
      {
        "key": "assumed",
        "rate": "1",
        "value": "615502.9795"
      },
      {
        "key": "higher",
        "rate": "3",
        "value": "648083.2940"
      }
    ]
  },
  "N-return-29pct": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "29",
      "months": 60,
      "stepUp": "0",
      "target": null
    },
    "invested": "600000.0000",
    "value": "1351998.8973",
    "growth": "751998.8973",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "27",
        "value": "1272505.6972"
      },
      {
        "key": "assumed",
        "rate": "29",
        "value": "1351998.8973"
      },
      {
        "key": "higher",
        "rate": "30",
        "value": "1393913.7970"
      }
    ]
  },
  "O-return-30pct": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "30",
      "months": 60,
      "stepUp": "0",
      "target": null
    },
    "invested": "600000.0000",
    "value": "1393913.7970",
    "growth": "793913.7970",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "28",
        "value": "1311547.5763"
      },
      {
        "key": "assumed",
        "rate": "30",
        "value": "1393913.7970"
      }
    ]
  },
  "P-small-amount": {
    "input": {
      "monthlySip": 100,
      "annualReturn": "10",
      "months": 12,
      "stepUp": "0",
      "target": null
    },
    "invested": "1200.0000",
    "value": "1267.0281",
    "growth": "67.0281",
    "finalMonthlySip": "100.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "1253.2926"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "1267.0281"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "1280.9328"
      }
    ]
  },
  "Q-large-amount": {
    "input": {
      "monthlySip": 1000000,
      "annualReturn": "30",
      "months": 480,
      "stepUp": "0",
      "target": null
    },
    "invested": "480000000.0000",
    "value": "5757529238506.4686",
    "growth": "5757049238506.4686",
    "finalMonthlySip": "1000000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "28",
        "value": "2820015821726.5274"
      },
      {
        "key": "assumed",
        "rate": "30",
        "value": "5757529238506.4686"
      }
    ]
  },
  "R-target-just-met": {
    "input": {
      "monthlySip": 10000,
      "annualReturn": "10",
      "months": 180,
      "stepUp": "0",
      "target": 4179242
    },
    "invested": "1800000.0000",
    "value": "4179242.6576",
    "growth": "2379242.6576",
    "finalMonthlySip": "10000.0000",
    "scenarios": [
      {
        "key": "lower",
        "rate": "8",
        "value": "3483451.4309"
      },
      {
        "key": "assumed",
        "rate": "10",
        "value": "4179242.6576"
      },
      {
        "key": "higher",
        "rate": "12",
        "value": "5045759.9951"
      }
    ],
    "target": {
      "amount": 4179242,
      "reached": true,
      "difference": "0.6576",
      "requiredStartingSip": "9999.9984"
    }
  }
};

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateSip,
  validateSipInputs,
  scenarioRates,
  SIP_LIMITS,
  SCENARIO_SPREAD,
} from "../../assets/js/calculators/formulas/sip.js";

const num = (s) => Number(s);
const near = (actual, expected, label, tolerance = 0.0101) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected} (tolerance ${tolerance})`);

const run = (g) => calculateSip({
  monthlySip: g.input.monthlySip, annualReturn: num(g.input.annualReturn), months: g.input.months,
  stepUp: num(g.input.stepUp), target: g.input.target,
});
const base = (over = {}) => ({ monthlySip: 10000, annualReturn: 10, months: 180, stepUp: 0, target: null, ...over });

/* the closed form of the fixed-payment plan, written separately from the month-by-month projection */
const closedForm = (P, rate, n) => {
  const i = rate / 12 / 100;
  return i === 0 ? P * n : P * ((1 + i) ** n - 1) / i * (1 + i);
};

describe("golden scenarios: the engine equals the independent reference (to the paisa)", () => {
  for (const [name, g] of Object.entries(GOLDEN)) {
    test(name, () => {
      const r = run(g);
      // large plans: allow for double precision (relative 1e-12) on top of a cent
      const tol = (x) => 0.0101 + Math.abs(x) * 1e-12;
      near(r.plan.totalInvested, num(g.invested), "invested", tol(num(g.invested)));
      near(r.plan.estimatedValue, num(g.value), "value", tol(num(g.value)));
      near(r.plan.estimatedGrowth, num(g.growth), "growth", tol(num(g.growth)));
      near(r.plan.finalMonthlySip, num(g.finalMonthlySip), "final monthly SIP", 0.0002);
      assert.deepEqual(r.scenarios.map((s) => s.key), g.scenarios.map((s) => s.key), "scenario keys");
      g.scenarios.forEach((s, i) => {
        near(r.scenarios[i].rate, num(s.rate), `${s.key} rate`, 1e-12);
        near(r.scenarios[i].value, num(s.value), `${s.key} value`, tol(num(s.value)));
      });
      if (g.target) {
        assert.ok(r.target, "target analysis present");
        assert.equal(r.target.reached, g.target.reached, "reached");
        near(r.target.difference, num(g.target.difference), "surplus or shortfall", tol(num(g.target.difference)));
        near(r.target.requiredStartingSip, num(g.target.requiredStartingSip), "required starting SIP", 0.0002 + num(g.target.requiredStartingSip) * 1e-12);
      } else {
        assert.equal(r.target, null, "no target analysis without a target");
      }
      if (g.yearly) {
        assert.equal(r.yearly.length, g.yearly.length, "yearly rows");
        g.yearly.forEach((row, i) => {
          assert.equal(r.yearly[i].year, row.year);
          assert.equal(r.yearly[i].months, row.months);
          near(r.yearly[i].monthlySip, num(row.monthlySip), `year ${row.year} monthly SIP`, 0.0002);
          near(r.yearly[i].invested, num(row.invested), `year ${row.year} invested`, tol(num(row.invested)));
          near(r.yearly[i].value, num(row.value), `year ${row.year} value`, tol(num(row.value)));
          near(r.yearly[i].growth, num(row.value) - num(row.invested), `year ${row.year} growth`, tol(num(row.value)));
        });
      }
    });
  }
});

describe("the cases the product has to get right", () => {
  test("the ordinary plan: ₹10,000 a month at an assumed 10% for 15 years", () => {
    const r = calculateSip(base());
    near(r.plan.totalInvested, 1800000, "invested", 1e-6);
    near(r.plan.estimatedValue, 4179242.66, "value");
    near(r.plan.estimatedGrowth, 2379242.66, "growth");
    near(r.plan.multiple, 2.32, "multiple", 0.005);
    assert.equal(r.yearly.length, 15);
    assert.equal(r.target, null);
  });

  test("zero return: the value is what you invest, and there is no lower scenario", () => {
    const r = calculateSip(base({ annualReturn: 0, monthlySip: 5000, months: 120 }));
    assert.equal(r.plan.estimatedValue, 600000);
    assert.equal(r.plan.totalInvested, 600000);
    assert.equal(r.plan.estimatedGrowth, 0);
    assert.deepEqual(r.scenarios.map((s) => [s.key, s.rate]), [["assumed", 0], ["higher", 2]]);
  });

  test("one month: the instalment grows for that one month", () => {
    const r = calculateSip(base({ months: 1 }));
    near(r.plan.estimatedValue, 10000 * (1 + 0.1 / 12), "value", 1e-9);
    assert.equal(r.yearly.length, 1);
    assert.equal(r.yearly[0].months, 1);
  });

  test("a step-up raises the monthly amount once a year, from month 13", () => {
    const r = calculateSip(base({ stepUp: 10 }));
    const pays = r.yearly.map((row) => row.monthlySip);
    near(pays[0], 10000, "year 1", 1e-6);
    near(pays[1], 11000, "year 2", 1e-6);
    near(pays[2], 12100, "year 3", 1e-6);
    near(pays[14], 10000 * 1.1 ** 14, "year 15", 1e-6);
    near(r.plan.finalMonthlySip, 37974.9834, "final monthly SIP", 0.0002);
    // total invested: twelve payments a year at each year's amount
    near(r.plan.totalInvested, pays.reduce((a, p) => a + p * 12, 0), "invested", 1e-6);
    assert.ok(r.plan.estimatedValue > calculateSip(base()).plan.estimatedValue);
  });

  test("a step-up of 0 is exactly the plain plan", () => {
    assert.deepEqual(calculateSip(base({ stepUp: 0 })), calculateSip({ monthlySip: 10000, annualReturn: 10, months: 180 }));
  });

  test("the fixed plan equals the closed form (a second, separate formula)", () => {
    for (const [P, rate, n] of [[10000, 10, 180], [500, 7.5, 37], [100, 0, 12], [999999, 29.9, 479], [1234, 0.1, 1]]) {
      near(calculateSip({ monthlySip: P, annualReturn: rate, months: n }).plan.estimatedValue, closedForm(P, rate, n), `${P}/${rate}/${n}`, 1e-6 + closedForm(P, rate, n) * 1e-12);
    }
  });

  test("a partial final year is a row of its own, with its months", () => {
    const r = calculateSip(base({ months: 18, stepUp: 10 }));
    assert.deepEqual(r.yearly.map((row) => [row.year, row.months]), [[1, 12], [2, 6]]);
    near(r.yearly[1].monthlySip, 11000, "year 2", 1e-6);
    near(r.yearly[1].value, r.plan.estimatedValue, "last row equals the result", 1e-9);
    const eleven = calculateSip(base({ months: 11 }));
    assert.deepEqual(eleven.yearly.map((row) => [row.year, row.months]), [[1, 11]]);
  });

  test("the long plan: ₹1,000 a month for 40 years", () => {
    const r = calculateSip({ monthlySip: 1000, annualReturn: 10, months: 480 });
    near(r.plan.estimatedValue, 6376780.24, "value");
    assert.equal(r.yearly.length, 40);
  });
});

describe("scenarios", () => {
  test("lower, as assumed, higher: the assumption minus and plus two points", () => {
    assert.equal(SCENARIO_SPREAD, 2);
    assert.deepEqual(scenarioRates(10), [{ key: "lower", rate: 8 }, { key: "assumed", rate: 10 }, { key: "higher", rate: 12 }]);
    const r = calculateSip(base());
    assert.deepEqual(r.scenarios.map((s) => s.key), ["lower", "assumed", "higher"]);
    near(r.scenarios[0].value, 3483451.43, "lower");
    near(r.scenarios[1].value, r.plan.estimatedValue, "assumed", 1e-9);
    near(r.scenarios[2].value, 5045760.0, "higher");
  });

  test("the lower rate stops at 0% and the higher at 30%; a scenario equal to the assumption is left out", () => {
    assert.deepEqual(scenarioRates(0).map((s) => s.key), ["assumed", "higher"]);
    assert.deepEqual(scenarioRates(1), [{ key: "lower", rate: 0 }, { key: "assumed", rate: 1 }, { key: "higher", rate: 3 }]);
    assert.deepEqual(scenarioRates(29), [{ key: "lower", rate: 27 }, { key: "assumed", rate: 29 }, { key: "higher", rate: 30 }]);
    assert.deepEqual(scenarioRates(30).map((s) => s.key), ["lower", "assumed"]);
  });

  test("the scenarios are ordered, and the labels never say best or worst", () => {
    for (const rate of [0, 0.5, 5, 12.5, 28, 30]) {
      const r = calculateSip(base({ annualReturn: rate }));
      const values = r.scenarios.map((s) => s.value);
      assert.deepEqual([...values].sort((a, b) => a - b), values, String(rate));
      for (const s of r.scenarios) assert.ok(["lower", "assumed", "higher"].includes(s.key));
    }
  });
});

describe("the target", () => {
  test("absent: no analysis", () => {
    assert.equal(calculateSip(base()).target, null);
  });

  test("missed: a shortfall, and the starting SIP that would reach it", () => {
    const r = calculateSip(base({ target: 10000000 }));
    assert.equal(r.target.reached, false);
    near(r.target.difference, -5820757.34, "shortfall");
    near(r.target.requiredStartingSip, 23927.78, "required SIP");
  });

  test("with a step-up the required starting SIP uses the same step-up", () => {
    const r = calculateSip(base({ stepUp: 10, target: 10000000 }));
    near(r.target.requiredStartingSip, 13444.76, "required starting SIP");
    near(r.target.difference, -2562159.90, "shortfall");
    // feeding the answer back reaches the target exactly, with the same step-up
    const back = calculateSip(base({ stepUp: 10, monthlySip: r.target.requiredStartingSip }));
    near(back.plan.estimatedValue, 10000000, "reached", 1e-4);
  });

  test("reached: a surplus, and a smaller required SIP than the plan's", () => {
    const r = calculateSip({ monthlySip: 50000, annualReturn: 12, months: 240, stepUp: 0, target: 10000000 });
    assert.equal(r.target.reached, true);
    assert.ok(r.target.difference > 0);
    near(r.target.requiredStartingSip, 10008.53, "required SIP");
    assert.ok(r.target.requiredStartingSip < 50000);
  });

  test("just met: a target just below the value is reached", () => {
    const r = calculateSip(base({ target: 4179242 }));
    assert.equal(r.target.reached, true);
    near(r.target.difference, 0.66, "surplus");
    assert.equal(calculateSip(base({ target: 4179243 })).target.reached, false);
  });

  test("zero return, short and large targets stay stable", () => {
    near(calculateSip(base({ annualReturn: 0, months: 120, target: 1200000 })).target.requiredStartingSip, 10000, "zero return: target / months", 1e-6);
    const short = calculateSip(base({ months: 1, target: 50000 }));
    near(short.target.requiredStartingSip, 50000 / (1 + 0.1 / 12), "one month", 1e-6);
    const huge = calculateSip({ monthlySip: 100, annualReturn: 1, months: 12, stepUp: 0, target: 10000000000 });
    assert.ok(Number.isFinite(huge.target.requiredStartingSip) && huge.target.requiredStartingSip > 1e8);
  });
});

describe("invariants over a wide grid", () => {
  const grid = [];
  for (const monthlySip of [100, 5000, 1000000])
    for (const annualReturn of [0, 0.1, 6, 12, 30])
      for (const months of [1, 7, 12, 13, 60, 241, 480])
        for (const stepUp of [0, 5, 50])
          grid.push({ monthlySip, annualReturn, months, stepUp });

  test("the grid is large", () => {
    assert.ok(grid.length > 300, String(grid.length));
  });

  test("the last row of the table equals the result; the rows are consecutive years; invested adds up", () => {
    for (const v of grid) {
      const r = calculateSip({ ...v, target: null });
      const last = r.yearly.at(-1);
      assert.equal(last.value, r.plan.estimatedValue);
      assert.equal(last.invested, r.plan.totalInvested);
      assert.equal(r.yearly.length, Math.ceil(v.months / 12));
      r.yearly.forEach((row, i) => assert.equal(row.year, i + 1));
      assert.equal(last.months, v.months - 12 * (r.yearly.length - 1));
      // the invested amount is the sum of the months at each year's payment
      near(r.plan.totalInvested, r.yearly.reduce((a, row) => a + row.monthlySip * row.months, 0), "invested", 1e-6 * r.plan.totalInvested + 1e-9);
      for (let k = 1; k < r.yearly.length; k++) assert.ok(r.yearly[k].value >= r.yearly[k - 1].value && r.yearly[k].invested > r.yearly[k - 1].invested);
    }
  });

  test("growth is never negative at a return of 0 or more, and is exactly 0 at 0%", () => {
    for (const v of grid) {
      const r = calculateSip(v);
      assert.ok(r.plan.estimatedGrowth >= -1e-9, JSON.stringify(v));
      if (v.annualReturn === 0) near(r.plan.estimatedGrowth, 0, "zero return", 1e-9 * r.plan.totalInvested);
      near(r.plan.estimatedValue - r.plan.totalInvested, r.plan.estimatedGrowth, "growth", 1e-9 * r.plan.estimatedValue + 1e-9);
      assert.ok(r.plan.multiple >= 1 - 1e-12);
    }
  });

  test("the value rises with the amount, the return, the period and the step-up", () => {
    for (const v of grid.filter((_, i) => i % 7 === 0)) {
      const value = (o) => calculateSip({ ...v, ...o }).plan.estimatedValue;
      const here = value({});
      assert.ok(value({ monthlySip: v.monthlySip * 2 }) > here);
      if (v.annualReturn + 1 <= 30) assert.ok(value({ annualReturn: v.annualReturn + 1 }) > here);
      if (v.months < 480) assert.ok(value({ months: v.months + 1 }) > here);
      if (v.months > 12) assert.ok(value({ stepUp: v.stepUp + 1 }) > here);
    }
  });

  test("the value is linear in the monthly amount, so the required SIP reproduces the target", () => {
    for (const v of grid.filter((_, i) => i % 11 === 0)) {
      const r = calculateSip({ ...v, target: 1234567 });
      const back = calculateSip({ ...v, monthlySip: r.target.requiredStartingSip });
      near(back.plan.estimatedValue, 1234567, "target reproduced", 1e-6 + 1234567 * 1e-12);
      near(calculateSip({ ...v, monthlySip: v.monthlySip * 3 }).plan.estimatedValue, 3 * r.plan.estimatedValue, "linearity", r.plan.estimatedValue * 1e-12);
    }
  });

  test("the same input always gives the same answer, and the input is not changed", () => {
    const v = base({ stepUp: 5, target: 5000000 });
    const copy = JSON.stringify(v);
    assert.deepEqual(calculateSip(v), calculateSip(v));
    assert.equal(JSON.stringify(v), copy);
  });
});

describe("validation (the rules and messages belong to the tool)", () => {
  const raw = (over = {}) => ({ monthlySip: "10000", annualReturn: "10", years: "15", months: "0", stepUp: "0", target: "", ...over });
  const fieldsOf = (result) => result.errors.flatMap((e) => e.fields).sort();

  test("valid input gives the values; the period is in months; a blank target is none; a blank step-up is 0", () => {
    const r = validateSipInputs(raw({ years: "12", months: "6" }));
    assert.equal(r.ok, true);
    assert.deepEqual(r.values, { monthlySip: 10000, annualReturn: 10, months: 150, stepUp: 0, target: null });
    assert.deepEqual(validateSipInputs(raw({ stepUp: "", target: "5000000" })).values, { monthlySip: 10000, annualReturn: 10, months: 180, stepUp: 0, target: 5000000 });
    assert.equal(validateSipInputs(raw({ target: undefined })).values.target, null);
    assert.equal(validateSipInputs(raw({ target: null, stepUp: null })).ok, true);
  });

  test("numbers as numbers work too, and 0% is a valid return", () => {
    assert.equal(validateSipInputs({ monthlySip: 500, annualReturn: 0, years: 1, months: 0, stepUp: 0, target: 20000 }).ok, true);
  });

  test("each field has its own message", () => {
    for (const [over, field] of [
      [{ monthlySip: "99" }, "monthlySip"], [{ monthlySip: "1000001" }, "monthlySip"], [{ monthlySip: "" }, "monthlySip"], [{ monthlySip: "abc" }, "monthlySip"],
      [{ annualReturn: "-1" }, "annualReturn"], [{ annualReturn: "30.1" }, "annualReturn"], [{ annualReturn: "" }, "annualReturn"],
      [{ years: "41" }, "years"], [{ years: "1.5" }, "years"], [{ years: "-1" }, "years"],
      [{ months: "12" }, "months"], [{ months: "2.5" }, "months"], [{ months: "" }, "months"],
      [{ stepUp: "-1" }, "stepUp"], [{ stepUp: "51" }, "stepUp"], [{ stepUp: "x" }, "stepUp"],
      [{ target: "9999" }, "target"], [{ target: "10000000001" }, "target"], [{ target: "0" }, "target"], [{ target: "-5" }, "target"], [{ target: "abc" }, "target"],
    ]) {
      const r = validateSipInputs(raw(over));
      assert.equal(r.ok, false, JSON.stringify(over));
      assert.ok(fieldsOf(r).includes(field), `${JSON.stringify(over)} -> ${fieldsOf(r)}`);
      assert.ok(r.errors.every((e) => typeof e.message === "string" && e.message.length > 10));
    }
  });

  test("a zero period is an error on both fields", () => {
    assert.deepEqual(fieldsOf(validateSipInputs(raw({ years: "0", months: "0" }))), ["months", "years"]);
  });

  test("several problems are reported together", () => {
    assert.deepEqual(fieldsOf(validateSipInputs(raw({ monthlySip: "", annualReturn: "99", target: "5" }))), ["annualReturn", "monthlySip", "target"]);
  });

  test("the limits are the documented ones", () => {
    assert.deepEqual(SIP_LIMITS.monthlySip, { min: 100, max: 1000000 });
    assert.deepEqual(SIP_LIMITS.rate, { min: 0, max: 30 });
    assert.deepEqual(SIP_LIMITS.totalMonths, { min: 1, max: 480 });
    assert.deepEqual(SIP_LIMITS.stepUp, { min: 0, max: 50 });
    assert.deepEqual(SIP_LIMITS.target, { min: 10000, max: 10000000000 });
  });
});
