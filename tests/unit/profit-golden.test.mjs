/**
 * Tool Pack 5: the Profit engine (formulas/profit.js).
 *
 * GOLDEN holds the expected values of the independent reference, tests/fixtures/profit-golden.py (Python decimal, 60
 * digits). It works from the DEFINITIONS (profit = revenue - variable costs - fixed costs), finds the break-even and the
 * target units by an integer search over whole units (the closed forms are asserted equal) and recomputes every what-if row
 * from scratch. They were NOT produced by the code under test. Regenerate with:  python tests/fixtures/profit-golden.py
 *
 * Money is compared to 1e-4 of a rupee, units exactly, shares to 1e-8.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateProfit,
  validateProfitInputs,
  PROFIT_LIMITS,
  WHAT_IF_LEVERS,
  WHAT_IF_CHANGES,
} from "../../assets/js/calculators/formulas/profit.js";

const GOLDEN = {
  "A-default": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "400",
      "target": "100000"
    },
    "contribution": "200.0000",
    "revenue": "320000.0000",
    "variableCosts": "240000.0000",
    "profit": "30000.0000",
    "profitShare": "9.375000",
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "above",
      "units": 150,
      "shareOfUnitsSold": "37.500000"
    },
    "target": {
      "units": 750,
      "revenue": "600000.0000",
      "additional": 350,
      "reached": false
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "30000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "-2000.0000",
        "delta": "-32000.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "62000.0000",
        "delta": "32000.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "54000.0000",
        "delta": "24000.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "6000.0000",
        "delta": "-24000.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "360.000000",
        "profit": "22000.0000",
        "delta": "-8000.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "440.000000",
        "profit": "38000.0000",
        "delta": "8000.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "35000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "25000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "B-loss": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "200",
      "target": null
    },
    "contribution": "200.0000",
    "revenue": "160000.0000",
    "variableCosts": "120000.0000",
    "profit": "-10000.0000",
    "profitShare": "-6.250000",
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "short",
      "units": 50,
      "shareOfUnitsSold": "-25.000000"
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "-10000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "-26000.0000",
        "delta": "-16000.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "6000.0000",
        "delta": "16000.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "2000.0000",
        "delta": "12000.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-22000.0000",
        "delta": "-12000.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "180.000000",
        "profit": "-14000.0000",
        "delta": "-4000.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "220.000000",
        "profit": "-6000.0000",
        "delta": "4000.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "-5000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "-15000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "C-exact-break-even": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "250",
      "target": null
    },
    "contribution": "200.0000",
    "revenue": "200000.0000",
    "variableCosts": "150000.0000",
    "profit": "0.0000",
    "profitShare": "0.000000",
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "at",
      "units": 0,
      "shareOfUnitsSold": "0.000000"
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "-20000.0000",
        "delta": "-20000.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "20000.0000",
        "delta": "20000.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "15000.0000",
        "delta": "15000.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-15000.0000",
        "delta": "-15000.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "225.000000",
        "profit": "-5000.0000",
        "delta": "-5000.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "275.000000",
        "profit": "5000.0000",
        "delta": "5000.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "5000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "-5000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "D-rounds-up": {
    "input": {
      "price": "730",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "500",
      "target": null
    },
    "contribution": "130.0000",
    "revenue": "365000.0000",
    "variableCosts": "300000.0000",
    "profit": "15000.0000",
    "profitShare": "4.109589",
    "breakEvenUnits": 385,
    "breakEvenRevenue": "281050.0000",
    "position": {
      "state": "above",
      "units": 115,
      "shareOfUnitsSold": "23.000000"
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "15000.0000",
        "delta": "0.0000",
        "breakEven": 385
      },
      {
        "key": "price",
        "change": -10,
        "value": "657.000000",
        "profit": "-21500.0000",
        "delta": "-36500.0000",
        "breakEven": 878
      },
      {
        "key": "price",
        "change": 10,
        "value": "803.000000",
        "profit": "51500.0000",
        "delta": "36500.0000",
        "breakEven": 247
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "45000.0000",
        "delta": "30000.0000",
        "breakEven": 264
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-15000.0000",
        "delta": "-30000.0000",
        "breakEven": 715
      },
      {
        "key": "units",
        "change": -10,
        "value": "450.000000",
        "profit": "8500.0000",
        "delta": "-6500.0000",
        "breakEven": 385
      },
      {
        "key": "units",
        "change": 10,
        "value": "550.000000",
        "profit": "21500.0000",
        "delta": "6500.0000",
        "breakEven": 385
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "20000.0000",
        "delta": "5000.0000",
        "breakEven": 347
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "10000.0000",
        "delta": "-5000.0000",
        "breakEven": 424
      }
    ]
  },
  "E-zero-contribution": {
    "input": {
      "price": "600",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "400",
      "target": "10000"
    },
    "contribution": "0.0000",
    "revenue": "240000.0000",
    "variableCosts": "240000.0000",
    "profit": "-50000.0000",
    "profitShare": "-20.833333",
    "breakEvenUnits": null,
    "breakEvenRevenue": null,
    "position": null,
    "target": {
      "units": null,
      "revenue": null,
      "additional": null,
      "reached": false
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": null
      },
      {
        "key": "price",
        "change": -10,
        "value": "540.000000",
        "profit": "-74000.0000",
        "delta": "-24000.0000",
        "breakEven": null
      },
      {
        "key": "price",
        "change": 10,
        "value": "660.000000",
        "profit": "-26000.0000",
        "delta": "24000.0000",
        "breakEven": 834
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "-26000.0000",
        "delta": "24000.0000",
        "breakEven": 834
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-74000.0000",
        "delta": "-24000.0000",
        "breakEven": null
      },
      {
        "key": "units",
        "change": -10,
        "value": "360.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": null
      },
      {
        "key": "units",
        "change": 10,
        "value": "440.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": null
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "-45000.0000",
        "delta": "5000.0000",
        "breakEven": null
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "-55000.0000",
        "delta": "-5000.0000",
        "breakEven": null
      }
    ]
  },
  "E2-negative-contribution": {
    "input": {
      "price": "500",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "400",
      "target": "10000"
    },
    "contribution": "-100.0000",
    "revenue": "200000.0000",
    "variableCosts": "240000.0000",
    "profit": "-90000.0000",
    "profitShare": "-45.000000",
    "breakEvenUnits": null,
    "breakEvenRevenue": null,
    "position": null,
    "target": {
      "units": null,
      "revenue": null,
      "additional": null,
      "reached": false
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "-90000.0000",
        "delta": "0.0000",
        "breakEven": null
      },
      {
        "key": "price",
        "change": -10,
        "value": "450.000000",
        "profit": "-110000.0000",
        "delta": "-20000.0000",
        "breakEven": null
      },
      {
        "key": "price",
        "change": 10,
        "value": "550.000000",
        "profit": "-70000.0000",
        "delta": "20000.0000",
        "breakEven": null
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "-66000.0000",
        "delta": "24000.0000",
        "breakEven": null
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-114000.0000",
        "delta": "-24000.0000",
        "breakEven": null
      },
      {
        "key": "units",
        "change": -10,
        "value": "360.000000",
        "profit": "-86000.0000",
        "delta": "4000.0000",
        "breakEven": null
      },
      {
        "key": "units",
        "change": 10,
        "value": "440.000000",
        "profit": "-94000.0000",
        "delta": "-4000.0000",
        "breakEven": null
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "-85000.0000",
        "delta": "5000.0000",
        "breakEven": null
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "-95000.0000",
        "delta": "-5000.0000",
        "breakEven": null
      }
    ]
  },
  "F-zero-fixed-costs": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "0",
      "units": "100",
      "target": "5000"
    },
    "contribution": "200.0000",
    "revenue": "80000.0000",
    "variableCosts": "60000.0000",
    "profit": "20000.0000",
    "profitShare": "25.000000",
    "breakEvenUnits": 0,
    "breakEvenRevenue": "0.0000",
    "position": {
      "state": "above",
      "units": 100,
      "shareOfUnitsSold": "100.000000"
    },
    "target": {
      "units": 25,
      "revenue": "20000.0000",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "12000.0000",
        "delta": "-8000.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "28000.0000",
        "delta": "8000.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "26000.0000",
        "delta": "6000.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "14000.0000",
        "delta": "-6000.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": -10,
        "value": "90.000000",
        "profit": "18000.0000",
        "delta": "-2000.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": 10,
        "value": "110.000000",
        "profit": "22000.0000",
        "delta": "2000.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "0.000000",
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "0.000000",
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 0
      }
    ]
  },
  "G-zero-units": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "0",
      "target": "20000"
    },
    "contribution": "200.0000",
    "revenue": "0.0000",
    "variableCosts": "0.0000",
    "profit": "-50000.0000",
    "profitShare": null,
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "short",
      "units": 250,
      "shareOfUnitsSold": null
    },
    "target": {
      "units": 350,
      "revenue": "280000.0000",
      "additional": 350,
      "reached": false
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "0.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "0.000000",
        "profit": "-50000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "-45000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "-55000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "H-tiny-contribution": {
    "input": {
      "price": "0.01",
      "variableCost": "0",
      "fixedCosts": "100000000",
      "units": "1000",
      "target": null
    },
    "contribution": "0.0100",
    "revenue": "10.0000",
    "variableCosts": "0.0000",
    "profit": "-99999990.0000",
    "profitShare": "-999999900.000000",
    "breakEvenUnits": 10000000000,
    "breakEvenRevenue": "100000000.0000",
    "position": {
      "state": "short",
      "units": 9999999000,
      "shareOfUnitsSold": "-999999900.000000"
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "-99999990.0000",
        "delta": "0.0000",
        "breakEven": 10000000000
      },
      {
        "key": "price",
        "change": -10,
        "value": "0.009000",
        "profit": "-99999991.0000",
        "delta": "-1.0000",
        "breakEven": 11111111112
      },
      {
        "key": "price",
        "change": 10,
        "value": "0.011000",
        "profit": "-99999989.0000",
        "delta": "1.0000",
        "breakEven": 9090909091
      },
      {
        "key": "variable",
        "change": -10,
        "value": "0.000000",
        "profit": "-99999990.0000",
        "delta": "0.0000",
        "breakEven": 10000000000
      },
      {
        "key": "variable",
        "change": 10,
        "value": "0.000000",
        "profit": "-99999990.0000",
        "delta": "0.0000",
        "breakEven": 10000000000
      },
      {
        "key": "units",
        "change": -10,
        "value": "900.000000",
        "profit": "-99999991.0000",
        "delta": "-1.0000",
        "breakEven": 10000000000
      },
      {
        "key": "units",
        "change": 10,
        "value": "1100.000000",
        "profit": "-99999989.0000",
        "delta": "1.0000",
        "breakEven": 10000000000
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "90000000.000000",
        "profit": "-89999990.0000",
        "delta": "10000000.0000",
        "breakEven": 9000000000
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "110000000.000000",
        "profit": "-109999990.0000",
        "delta": "-10000000.0000",
        "breakEven": 11000000000
      }
    ]
  },
  "I-large": {
    "input": {
      "price": "1000000",
      "variableCost": "400000",
      "fixedCosts": "500000000",
      "units": "5000",
      "target": "900000000"
    },
    "contribution": "600000.0000",
    "revenue": "5000000000.0000",
    "variableCosts": "2000000000.0000",
    "profit": "2500000000.0000",
    "profitShare": "50.000000",
    "breakEvenUnits": 834,
    "breakEvenRevenue": "834000000.0000",
    "position": {
      "state": "above",
      "units": 4166,
      "shareOfUnitsSold": "83.320000"
    },
    "target": {
      "units": 2334,
      "revenue": "2334000000.0000",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "2500000000.0000",
        "delta": "0.0000",
        "breakEven": 834
      },
      {
        "key": "price",
        "change": -10,
        "value": "900000.000000",
        "profit": "2000000000.0000",
        "delta": "-500000000.0000",
        "breakEven": 1000
      },
      {
        "key": "price",
        "change": 10,
        "value": "1100000.000000",
        "profit": "3000000000.0000",
        "delta": "500000000.0000",
        "breakEven": 715
      },
      {
        "key": "variable",
        "change": -10,
        "value": "360000.000000",
        "profit": "2700000000.0000",
        "delta": "200000000.0000",
        "breakEven": 782
      },
      {
        "key": "variable",
        "change": 10,
        "value": "440000.000000",
        "profit": "2300000000.0000",
        "delta": "-200000000.0000",
        "breakEven": 893
      },
      {
        "key": "units",
        "change": -10,
        "value": "4500.000000",
        "profit": "2200000000.0000",
        "delta": "-300000000.0000",
        "breakEven": 834
      },
      {
        "key": "units",
        "change": 10,
        "value": "5500.000000",
        "profit": "2800000000.0000",
        "delta": "300000000.0000",
        "breakEven": 834
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "450000000.000000",
        "profit": "2550000000.0000",
        "delta": "50000000.0000",
        "breakEven": 750
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "550000000.000000",
        "profit": "2450000000.0000",
        "delta": "-50000000.0000",
        "breakEven": 917
      }
    ]
  },
  "J-service-no-variable-cost": {
    "input": {
      "price": "2000",
      "variableCost": "0",
      "fixedCosts": "60000",
      "units": "40",
      "target": "50000"
    },
    "contribution": "2000.0000",
    "revenue": "80000.0000",
    "variableCosts": "0.0000",
    "profit": "20000.0000",
    "profitShare": "25.000000",
    "breakEvenUnits": 30,
    "breakEvenRevenue": "60000.0000",
    "position": {
      "state": "above",
      "units": 10,
      "shareOfUnitsSold": "25.000000"
    },
    "target": {
      "units": 55,
      "revenue": "110000.0000",
      "additional": 15,
      "reached": false
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 30
      },
      {
        "key": "price",
        "change": -10,
        "value": "1800.000000",
        "profit": "12000.0000",
        "delta": "-8000.0000",
        "breakEven": 34
      },
      {
        "key": "price",
        "change": 10,
        "value": "2200.000000",
        "profit": "28000.0000",
        "delta": "8000.0000",
        "breakEven": 28
      },
      {
        "key": "variable",
        "change": -10,
        "value": "0.000000",
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 30
      },
      {
        "key": "variable",
        "change": 10,
        "value": "0.000000",
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 30
      },
      {
        "key": "units",
        "change": -10,
        "value": "36.000000",
        "profit": "12000.0000",
        "delta": "-8000.0000",
        "breakEven": 30
      },
      {
        "key": "units",
        "change": 10,
        "value": "44.000000",
        "profit": "28000.0000",
        "delta": "8000.0000",
        "breakEven": 30
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "54000.000000",
        "profit": "26000.0000",
        "delta": "6000.0000",
        "breakEven": 27
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "66000.000000",
        "profit": "14000.0000",
        "delta": "-6000.0000",
        "breakEven": 33
      }
    ]
  },
  "K-target-already-reached": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "1000",
      "target": "100000"
    },
    "contribution": "200.0000",
    "revenue": "800000.0000",
    "variableCosts": "600000.0000",
    "profit": "150000.0000",
    "profitShare": "18.750000",
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "above",
      "units": 750,
      "shareOfUnitsSold": "75.000000"
    },
    "target": {
      "units": 750,
      "revenue": "600000.0000",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "150000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "70000.0000",
        "delta": "-80000.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "230000.0000",
        "delta": "80000.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "210000.0000",
        "delta": "60000.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "90000.0000",
        "delta": "-60000.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "900.000000",
        "profit": "130000.0000",
        "delta": "-20000.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "1100.000000",
        "profit": "170000.0000",
        "delta": "20000.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "155000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "145000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "L-target-equals-profit": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "400",
      "target": "30000"
    },
    "contribution": "200.0000",
    "revenue": "320000.0000",
    "variableCosts": "240000.0000",
    "profit": "30000.0000",
    "profitShare": "9.375000",
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "above",
      "units": 150,
      "shareOfUnitsSold": "37.500000"
    },
    "target": {
      "units": 400,
      "revenue": "320000.0000",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "30000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "-2000.0000",
        "delta": "-32000.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "62000.0000",
        "delta": "32000.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "54000.0000",
        "delta": "24000.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "6000.0000",
        "delta": "-24000.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "360.000000",
        "profit": "22000.0000",
        "delta": "-8000.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "440.000000",
        "profit": "38000.0000",
        "delta": "8000.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "35000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "25000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "M-units-half-rounding": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "50000",
      "units": "95",
      "target": null
    },
    "contribution": "200.0000",
    "revenue": "76000.0000",
    "variableCosts": "57000.0000",
    "profit": "-31000.0000",
    "profitShare": "-40.789474",
    "breakEvenUnits": 250,
    "breakEvenRevenue": "200000.0000",
    "position": {
      "state": "short",
      "units": 155,
      "shareOfUnitsSold": "-163.157895"
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "-31000.0000",
        "delta": "0.0000",
        "breakEven": 250
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "-38600.0000",
        "delta": "-7600.0000",
        "breakEven": 417
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "-23400.0000",
        "delta": "7600.0000",
        "breakEven": 179
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "-25300.0000",
        "delta": "5700.0000",
        "breakEven": 193
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "-36700.0000",
        "delta": "-5700.0000",
        "breakEven": 358
      },
      {
        "key": "units",
        "change": -10,
        "value": "86.000000",
        "profit": "-32800.0000",
        "delta": "-1800.0000",
        "breakEven": 250
      },
      {
        "key": "units",
        "change": 10,
        "value": "105.000000",
        "profit": "-29000.0000",
        "delta": "2000.0000",
        "breakEven": 250
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "45000.000000",
        "profit": "-26000.0000",
        "delta": "5000.0000",
        "breakEven": 225
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "55000.000000",
        "profit": "-36000.0000",
        "delta": "-5000.0000",
        "breakEven": 275
      }
    ]
  },
  "N-one-unit": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "0",
      "units": "1",
      "target": "100"
    },
    "contribution": "200.0000",
    "revenue": "800.0000",
    "variableCosts": "600.0000",
    "profit": "200.0000",
    "profitShare": "25.000000",
    "breakEvenUnits": 0,
    "breakEvenRevenue": "0.0000",
    "position": {
      "state": "above",
      "units": 1,
      "shareOfUnitsSold": "100.000000"
    },
    "target": {
      "units": 1,
      "revenue": "800.0000",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "200.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "120.0000",
        "delta": "-80.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "280.0000",
        "delta": "80.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "260.0000",
        "delta": "60.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "140.0000",
        "delta": "-60.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": -10,
        "value": "1.000000",
        "profit": "200.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": 10,
        "value": "1.000000",
        "profit": "200.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "0.000000",
        "profit": "200.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "0.000000",
        "profit": "200.0000",
        "delta": "0.0000",
        "breakEven": 0
      }
    ]
  },
  "O-fractional-money": {
    "input": {
      "price": "99.99",
      "variableCost": "45.55",
      "fixedCosts": "12345.67",
      "units": "321",
      "target": "1000.5"
    },
    "contribution": "54.4400",
    "revenue": "32096.7900",
    "variableCosts": "14621.5500",
    "profit": "5129.5700",
    "profitShare": "15.981567",
    "breakEvenUnits": 227,
    "breakEvenRevenue": "22697.7300",
    "position": {
      "state": "above",
      "units": 94,
      "shareOfUnitsSold": "29.283489"
    },
    "target": {
      "units": 246,
      "revenue": "24597.5400",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "5129.5700",
        "delta": "0.0000",
        "breakEven": 227
      },
      {
        "key": "price",
        "change": -10,
        "value": "89.991000",
        "profit": "1919.8910",
        "delta": "-3209.6790",
        "breakEven": 278
      },
      {
        "key": "price",
        "change": 10,
        "value": "109.989000",
        "profit": "8339.2490",
        "delta": "3209.6790",
        "breakEven": 192
      },
      {
        "key": "variable",
        "change": -10,
        "value": "40.995000",
        "profit": "6591.7250",
        "delta": "1462.1550",
        "breakEven": 210
      },
      {
        "key": "variable",
        "change": 10,
        "value": "50.105000",
        "profit": "3667.4150",
        "delta": "-1462.1550",
        "breakEven": 248
      },
      {
        "key": "units",
        "change": -10,
        "value": "289.000000",
        "profit": "3387.4900",
        "delta": "-1742.0800",
        "breakEven": 227
      },
      {
        "key": "units",
        "change": 10,
        "value": "353.000000",
        "profit": "6871.6500",
        "delta": "1742.0800",
        "breakEven": 227
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "11111.103000",
        "profit": "6364.1370",
        "delta": "1234.5670",
        "breakEven": 205
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "13580.237000",
        "profit": "3895.0030",
        "delta": "-1234.5670",
        "breakEven": 250
      }
    ]
  },
  "P-no-variable-cost-no-fixed": {
    "input": {
      "price": "10",
      "variableCost": "0",
      "fixedCosts": "0",
      "units": "0",
      "target": null
    },
    "contribution": "10.0000",
    "revenue": "0.0000",
    "variableCosts": "0.0000",
    "profit": "0.0000",
    "profitShare": null,
    "breakEvenUnits": 0,
    "breakEvenRevenue": "0.0000",
    "position": {
      "state": "at",
      "units": 0,
      "shareOfUnitsSold": null
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": -10,
        "value": "9.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": 10,
        "value": "11.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": -10,
        "value": "0.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": 10,
        "value": "0.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": -10,
        "value": "0.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": 10,
        "value": "0.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "0.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "0.000000",
        "profit": "0.0000",
        "delta": "0.0000",
        "breakEven": 0
      }
    ]
  },
  "Q-target-with-zero-fixed": {
    "input": {
      "price": "800",
      "variableCost": "600",
      "fixedCosts": "0",
      "units": "100",
      "target": "1"
    },
    "contribution": "200.0000",
    "revenue": "80000.0000",
    "variableCosts": "60000.0000",
    "profit": "20000.0000",
    "profitShare": "25.000000",
    "breakEvenUnits": 0,
    "breakEvenRevenue": "0.0000",
    "position": {
      "state": "above",
      "units": 100,
      "shareOfUnitsSold": "100.000000"
    },
    "target": {
      "units": 1,
      "revenue": "800.0000",
      "additional": 0,
      "reached": true
    },
    "whatIf": [
      {
        "key": "base",
        "change": 0,
        "value": null,
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": -10,
        "value": "720.000000",
        "profit": "12000.0000",
        "delta": "-8000.0000",
        "breakEven": 0
      },
      {
        "key": "price",
        "change": 10,
        "value": "880.000000",
        "profit": "28000.0000",
        "delta": "8000.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": -10,
        "value": "540.000000",
        "profit": "26000.0000",
        "delta": "6000.0000",
        "breakEven": 0
      },
      {
        "key": "variable",
        "change": 10,
        "value": "660.000000",
        "profit": "14000.0000",
        "delta": "-6000.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": -10,
        "value": "90.000000",
        "profit": "18000.0000",
        "delta": "-2000.0000",
        "breakEven": 0
      },
      {
        "key": "units",
        "change": 10,
        "value": "110.000000",
        "profit": "22000.0000",
        "delta": "2000.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": -10,
        "value": "0.000000",
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 0
      },
      {
        "key": "fixed",
        "change": 10,
        "value": "0.000000",
        "profit": "20000.0000",
        "delta": "0.0000",
        "breakEven": 0
      }
    ]
  },
  "articles": {
    "contribution": "200.0000",
    "breakEven": {
      "units": 250,
      "revenue": "200000.0000"
    },
    "roundingExample": {
      "contribution": "130.0000",
      "fixedOverContribution": "384.6",
      "units": 385
    },
    "targets": {
      "50000": {
        "units": 500,
        "revenue": "400000.0000"
      },
      "100000": {
        "units": 750,
        "revenue": "600000.0000"
      },
      "200000": {
        "units": 1250,
        "revenue": "1000000.0000"
      }
    },
    "profitAt400": "30000.0000",
    "levers": {
      "price-10": {
        "profit": "-2000.0000",
        "delta": "-32000.0000",
        "breakEven": 417,
        "value": "720.000000"
      },
      "price+10": {
        "profit": "62000.0000",
        "delta": "32000.0000",
        "breakEven": 179,
        "value": "880.000000"
      },
      "variable-10": {
        "profit": "54000.0000",
        "delta": "24000.0000",
        "breakEven": 193,
        "value": "540.000000"
      },
      "variable+10": {
        "profit": "6000.0000",
        "delta": "-24000.0000",
        "breakEven": 358,
        "value": "660.000000"
      },
      "units-10": {
        "profit": "22000.0000",
        "delta": "-8000.0000",
        "breakEven": 250,
        "value": "360.000000"
      },
      "units+10": {
        "profit": "38000.0000",
        "delta": "8000.0000",
        "breakEven": 250,
        "value": "440.000000"
      },
      "fixed-10": {
        "profit": "35000.0000",
        "delta": "5000.0000",
        "breakEven": 225,
        "value": "45000.000000"
      },
      "fixed+10": {
        "profit": "25000.0000",
        "delta": "-5000.0000",
        "breakEven": 275,
        "value": "55000.000000"
      }
    }
  }
};

const N = Number;
const near = (a, b, label, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const frac = (percentString) => N(percentString) / 100;
const run = (g) => calculateProfit({
  price: N(g.input.price), variableCost: N(g.input.variableCost), fixedCosts: N(g.input.fixedCosts), units: N(g.input.units),
  target: g.input.target === null ? null : N(g.input.target),
});
const calc = (price, variableCost, fixedCosts, units, target = null) => calculateProfit({ price, variableCost, fixedCosts, units, target });
const SCENARIOS = Object.entries(GOLDEN).filter(([key]) => key !== "articles");

describe("golden scenarios: the engine equals the independent reference", () => {
  for (const [name, g] of SCENARIOS) {
    test(name, () => {
      const r = run(g);
      near(r.contribution, N(g.contribution), "contribution");
      near(r.revenue, N(g.revenue), "revenue");
      near(r.variableCosts, N(g.variableCosts), "variable costs");
      near(r.profit, N(g.profit), "profit");
      if (g.profitShare === null) assert.equal(r.profitShare, null);
      else near(r.profitShare, frac(g.profitShare), "profit share", 1e-8);
      assert.equal(r.breakEvenUnits, g.breakEvenUnits, "break-even units");
      if (g.breakEvenRevenue === null) assert.equal(r.breakEvenRevenue, null);
      else near(r.breakEvenRevenue, N(g.breakEvenRevenue), "break-even revenue");
      if (g.position === null) assert.equal(r.position, null);
      else {
        assert.equal(r.position.state, g.position.state);
        assert.equal(r.position.units, g.position.units);
        if (g.position.shareOfUnitsSold === null) assert.equal(r.position.shareOfUnitsSold, null);
        else near(r.position.shareOfUnitsSold, frac(g.position.shareOfUnitsSold), "share of units sold", 1e-8);
      }
      if (g.target) {
        assert.ok(r.target, "a target block");
        assert.equal(r.target.units, g.target.units);
        assert.equal(r.target.additional, g.target.additional);
        assert.equal(r.target.reached, g.target.reached);
        if (g.target.revenue === null) assert.equal(r.target.revenue, null);
        else near(r.target.revenue, N(g.target.revenue), "target revenue");
      } else {
        assert.equal(r.target, null);
      }
      assert.equal(r.whatIf.length, 9);
      g.whatIf.forEach((expected, i) => {
        const row = r.whatIf[i];
        const label = `${name} what-if ${expected.key} ${expected.change}`;
        assert.equal(row.key, expected.key, label);
        assert.equal(row.change, expected.change, label);
        near(row.profit, N(expected.profit), `${label} profit`);
        near(row.delta, N(expected.delta), `${label} change in profit`);
        assert.equal(row.breakEven, expected.breakEven, `${label} break-even`);
        if (expected.value !== null) near(row.value, N(expected.value), `${label} value`, 1e-6);
      });
    });
  }
});

describe("the cases the product has to get right", () => {
  test("the default: profit 30,000, contribution 200, break-even 250 units, 150 units above it", () => {
    const r = calc(800, 600, 50000, 400);
    assert.equal(r.contribution, 200);
    assert.equal(r.revenue, 320000);
    assert.equal(r.variableCosts, 240000);
    assert.equal(r.profit, 30000);
    assert.equal(r.state, "profit");
    near(r.profitShare, 0.09375, "profit share", 1e-12);
    assert.equal(r.breakEvenUnits, 250);
    assert.equal(r.breakEvenRevenue, 200000);
    assert.deepEqual(r.position, { state: "above", units: 150, shareOfUnitsSold: 0.375 });
    assert.equal(r.target, null);
  });

  test("the breakdown reconciles: revenue - variable costs - fixed costs = profit", () => {
    for (const [p, v, f, q] of [[800, 600, 50000, 400], [730, 600, 50000, 500], [99.99, 45.55, 12345.67, 321], [500, 600, 50000, 400]]) {
      const r = calc(p, v, f, q);
      near(r.revenue - r.variableCosts - r.fixedCosts, r.profit, `${p}/${v}/${f}/${q}`, 1e-6);
    }
  });

  test("a loss is a result: profit negative, still a break-even, units short of it", () => {
    const r = calc(800, 600, 50000, 200);
    assert.equal(r.profit, -10000);
    assert.equal(r.state, "loss");
    assert.equal(r.breakEvenUnits, 250);
    assert.deepEqual(r.position, { state: "short", units: 50, shareOfUnitsSold: -0.25 });
  });

  test("exactly at break-even: profit 0 and 'at'", () => {
    const r = calc(800, 600, 50000, 250);
    assert.equal(r.profit, 0);
    assert.equal(r.state, "zero");
    assert.deepEqual(r.position, { state: "at", units: 0, shareOfUnitsSold: 0 });
  });

  test("a break-even that is not whole is rounded UP, and the profit there is not negative", () => {
    const r = calc(730, 600, 50000, 500);
    assert.equal(r.breakEvenUnits, 385); // 50,000 / 130 = 384.6
    assert.ok(calc(730, 600, 50000, 385).profit >= 0);
    assert.ok(calc(730, 600, 50000, 384).profit < 0);
  });

  test("floating point does not push an exact break-even up a unit", () => {
    assert.equal(calc(0.3, 0.1, 10, 1).breakEvenUnits, 50); // 0.3 - 0.1 = 0.19999999999999998 in doubles
    assert.equal(calc(800.1, 600.1, 50000, 1).breakEvenUnits, 250);
    assert.equal(calc(99.99, 45.55, 12345.67, 321).breakEvenUnits, 227);
  });

  test("zero or negative contribution: no finite break-even and no finite target, and neither is an error", () => {
    for (const [p, v] of [[600, 600], [500, 600]]) {
      const r = calc(p, v, 50000, 400, 10000);
      assert.equal(r.breakEvenUnits, null);
      assert.equal(r.breakEvenRevenue, null);
      assert.equal(r.position, null);
      assert.equal(r.target.units, null);
      assert.equal(r.target.additional, null);
      assert.equal(r.target.reached, false);
      assert.equal(r.state, "loss");
      assert.ok(r.whatIf.every((row) => typeof row.profit === "number"));
    }
    assert.equal(validateProfitInputs({ price: "500", variableCost: "600", fixedCosts: "50000", units: "400", target: "" }).ok, true);
    // zero fixed costs and a non-positive contribution still has no break-even (more units never gain)
    assert.equal(calc(600, 600, 0, 100).breakEvenUnits, null);
    assert.equal(calc(500, 600, 0, 100).breakEvenUnits, null);
  });

  test("zero fixed costs: break-even 0 units and everything sold is above it", () => {
    const r = calc(800, 600, 0, 100);
    assert.equal(r.breakEvenUnits, 0);
    assert.equal(r.breakEvenRevenue, 0);
    assert.deepEqual(r.position, { state: "above", units: 100, shareOfUnitsSold: 1 });
    assert.equal(r.profit, 20000);
  });

  test("zero units: a loss equal to the fixed costs, no profit share, no share of units sold", () => {
    const r = calc(800, 600, 50000, 0);
    assert.equal(r.profit, -50000);
    assert.equal(r.revenue, 0);
    assert.equal(r.profitShare, null);
    assert.equal(r.breakEvenUnits, 250);
    assert.deepEqual(r.position, { state: "short", units: 250, shareOfUnitsSold: null });
    assert.equal(calc(10, 0, 0, 0).position.state, "at");
  });

  test("a service with no variable cost, and a tiny contribution", () => {
    const service = calc(2000, 0, 60000, 40, 50000);
    assert.equal(service.breakEvenUnits, 30);
    assert.equal(service.target.units, 55);
    const tiny = calc(0.01, 0, 100000000, 1000);
    assert.equal(tiny.breakEvenUnits, 10000000000);
    near(tiny.profit, -99999990, "profit", 1e-6);
  });

  test("large valid values do not overflow or lose precision", () => {
    const r = calc(1000000, 400000, 500000000, 5000, 900000000);
    assert.equal(r.profit, 2500000000);
    assert.equal(r.breakEvenUnits, 834);
    assert.equal(r.target.units, 2334);
    const max = calc(100000000, 0, 1000000000, 100000000);
    assert.equal(max.revenue, 1e16);
    assert.equal(max.breakEvenUnits, 10);
  });
});

describe("target profit", () => {
  test("units for a target: the smallest whole number that reaches it, with the additional units", () => {
    const r = calc(800, 600, 50000, 400, 100000);
    assert.equal(r.target.units, 750);
    assert.equal(r.target.revenue, 600000);
    assert.equal(r.target.additional, 350);
    assert.equal(r.target.reached, false);
    assert.ok(calc(800, 600, 50000, 750).profit >= 100000 && calc(800, 600, 50000, 749).profit < 100000);
    assert.deepEqual([50000, 100000, 200000].map((t) => calc(800, 600, 50000, 400, t).target.units), [500, 750, 1250]);
  });

  test("a target already reached needs no additional units; one that equals the profit counts as reached", () => {
    const more = calc(800, 600, 50000, 1000, 100000);
    assert.equal(more.target.additional, 0);
    assert.equal(more.target.reached, true);
    const equal = calc(800, 600, 50000, 400, 30000);
    assert.equal(equal.target.units, 400);
    assert.equal(equal.target.additional, 0);
    assert.equal(equal.target.reached, true);
  });

  test("blank means no target block", () => {
    assert.equal(calc(800, 600, 50000, 400).target, null);
    assert.equal(calc(800, 600, 50000, 400, null).target, null);
  });
});

describe("what-if rows", () => {
  test("nine rows, in order, each a fresh calculation", () => {
    const r = calc(800, 600, 50000, 400);
    assert.deepEqual(WHAT_IF_LEVERS, ["price", "variable", "units", "fixed"]);
    assert.deepEqual(WHAT_IF_CHANGES, [-10, 10]);
    assert.deepEqual(r.whatIf.map((row) => `${row.key}${row.change}`), ["base0", "price-10", "price10", "variable-10", "variable10", "units-10", "units10", "fixed-10", "fixed10"]);
    assert.deepEqual(r.whatIf.map((row) => row.profit), [30000, -2000, 62000, 54000, 6000, 22000, 38000, 35000, 25000]);
    assert.deepEqual(r.whatIf.map((row) => row.delta), [0, -32000, 32000, 24000, -24000, -8000, 8000, 5000, -5000]);
    assert.deepEqual(r.whatIf.map((row) => row.breakEven), [250, 417, 179, 193, 358, 250, 250, 225, 275]);
  });

  test("each row equals a calculation with the changed input", () => {
    const r = calc(800, 600, 50000, 400);
    near(r.whatIf[1].profit, calc(720, 600, 50000, 400).profit, "price -10%", 1e-9);
    near(r.whatIf[4].profit, calc(800, 660, 50000, 400).profit, "variable +10%", 1e-9);
    near(r.whatIf[5].profit, calc(800, 600, 50000, 360).profit, "units -10%", 1e-9);
    near(r.whatIf[8].profit, calc(800, 600, 55000, 400).profit, "fixed +10%", 1e-9);
    assert.equal(r.whatIf[3].value, 540);
    assert.equal(r.whatIf[5].value, 360);
  });

  test("units are rounded to the nearest whole unit, half up", () => {
    const r = calc(800, 600, 50000, 95);
    assert.equal(r.whatIf[5].value, 86); // 85.5
    assert.equal(r.whatIf[6].value, 105); // 104.5
    assert.equal(calc(800, 600, 0, 1).whatIf[5].value, 1); // 0.9
    assert.equal(calc(800, 600, 0, 5).whatIf[5].value, 5); // 4.5 -> 5
  });

  test("a changed case with no contribution has no break-even", () => {
    const r = calc(650, 600, 50000, 400);
    assert.equal(r.whatIf[1].breakEven, null); // price -10% = 585, below the cost
    assert.ok(r.whatIf[2].breakEven > 0);
    const base = calc(600, 600, 50000, 400);
    assert.equal(base.whatIf[0].breakEven, null);
  });

  test("the break-even does not move with the units sold", () => {
    const r = calc(800, 600, 50000, 400);
    assert.equal(r.whatIf[5].breakEven, r.breakEvenUnits);
    assert.equal(r.whatIf[6].breakEven, r.breakEvenUnits);
  });
});

describe("invariants over a wide grid", () => {
  const prices = [0.01, 1, 99.99, 800, 12345.67];
  const costs = [0, 0.5, 600, 5000];
  const fixeds = [0, 1000, 50000, 12345678.9];
  const units = [0, 1, 400, 1234567];

  test("profit = contribution x units - fixed costs, and the break-even is the smallest whole number of units that covers them", () => {
    for (const p of prices) for (const v of costs) for (const f of fixeds) {
      const c = calc(p, v, f, 400);
      const unitsCovered = (n) => (p - v) * n - f;
      if (p - v > 0) {
        const be = c.breakEvenUnits;
        assert.ok(Number.isInteger(be) && be >= 0, `${p}/${v}/${f}`);
        // exact comparison would be a restatement; a tolerance proportional to the magnitude is enough for a double
        assert.ok(unitsCovered(be) >= -1e-6 * Math.max(1, f), `covers ${p}/${v}/${f}`);
        if (be > 0) assert.ok(unitsCovered(be - 1) < 1e-6 * Math.max(1, f), `one fewer does not ${p}/${v}/${f}`);
      } else {
        assert.equal(c.breakEvenUnits, null, `${p}/${v}/${f}`);
      }
    }
  });

  test("profit rises with price and units and falls with variable and fixed costs", () => {
    const base = calc(800, 600, 50000, 400).profit;
    assert.ok(calc(801, 600, 50000, 400).profit > base);
    assert.ok(calc(800, 600, 50000, 401).profit > base);
    assert.ok(calc(800, 601, 50000, 400).profit < base);
    assert.ok(calc(800, 600, 50001, 400).profit < base);
  });

  test("break-even is unaffected by the units sold, and the target units are at least the break-even", () => {
    for (const q of units) {
      const r = calc(800, 600, 50000, q, 1000);
      assert.equal(r.breakEvenUnits, 250);
      assert.ok(r.target.units >= r.breakEvenUnits);
    }
  });
});

describe("validation (the rules and messages belong to the tool)", () => {
  const ok = { price: "800", variableCost: "600", fixedCosts: "50000", units: "400", target: "" };

  test("valid input comes back as numbers; a blank target means none", () => {
    const v = validateProfitInputs(ok);
    assert.equal(v.ok, true);
    assert.deepEqual(v.values, { price: 800, variableCost: 600, fixedCosts: 50000, units: 400, target: null });
    assert.equal(validateProfitInputs({ ...ok, target: "100000" }).values.target, 100000);
  });

  test("the limits are the documented ones, and the boundaries are valid", () => {
    assert.deepEqual(PROFIT_LIMITS.price, { min: 0.01, max: 100000000 });
    assert.deepEqual(PROFIT_LIMITS.variableCost, { min: 0, max: 100000000 });
    assert.deepEqual(PROFIT_LIMITS.fixedCosts, { min: 0, max: 1000000000 });
    assert.deepEqual(PROFIT_LIMITS.units, { min: 0, max: 100000000 });
    assert.deepEqual(PROFIT_LIMITS.target, { min: 0.01, max: 1000000000 });
    for (const input of [
      { ...ok, price: "0.01" }, { ...ok, price: "100000000" }, { ...ok, variableCost: "0" }, { ...ok, variableCost: "100000000" },
      { ...ok, fixedCosts: "0" }, { ...ok, fixedCosts: "1000000000" }, { ...ok, units: "0" }, { ...ok, units: "100000000" },
      { ...ok, target: "0.01" }, { ...ok, target: "1000000000" },
    ]) assert.equal(validateProfitInputs(input).ok, true, JSON.stringify(input));
  });

  test("each field has its own error and negative values are rejected everywhere", () => {
    const bad = (input, field) => {
      const v = validateProfitInputs(input);
      assert.equal(v.ok, false, JSON.stringify(input));
      assert.ok(v.errors.some((e) => e.fields.includes(field) && e.message.length > 10), `${field}: ${JSON.stringify(v.errors)}`);
    };
    for (const price of ["", "0", "-1", "0.009", "100000001", "abc"]) bad({ ...ok, price }, "price");
    for (const variableCost of ["", "-1", "-0.01", "100000001", "x"]) bad({ ...ok, variableCost }, "variableCost");
    for (const fixedCosts of ["", "-1", "1000000001", "x"]) bad({ ...ok, fixedCosts }, "fixedCosts");
    for (const units of ["", "-1", "1.5", "0.5", "100000001", "x"]) bad({ ...ok, units }, "units");
    for (const target of ["0", "-5", "0.009", "1000000001", "x"]) bad({ ...ok, target }, "target");
  });

  test("a variable cost above the price, zero units and zero fixed costs are valid input", () => {
    assert.equal(validateProfitInputs({ ...ok, variableCost: "900" }).ok, true);
    assert.equal(validateProfitInputs({ ...ok, units: "0" }).ok, true);
    assert.equal(validateProfitInputs({ ...ok, fixedCosts: "0" }).ok, true);
  });

  test("several problems are reported together", () => {
    const v = validateProfitInputs({ price: "0", variableCost: "-1", fixedCosts: "-1", units: "1.5", target: "0" });
    assert.equal(v.ok, false);
    assert.deepEqual(v.errors.flatMap((e) => e.fields).sort(), ["fixedCosts", "price", "target", "units", "variableCost"]);
  });
});
