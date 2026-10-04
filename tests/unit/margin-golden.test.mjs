/**
 * Tool Pack 4: the Margin engine (formulas/margin.js).
 *
 * GOLDEN holds the expected values of the independent reference, tests/fixtures/margin-golden.py (Python decimal, 60
 * digits). It works from the DEFINITIONS, finds every derived price by an integer search over paise (the closed form is
 * asserted equal), finds the price that keeps a margin by search, and counts units for the discount's volume multiple.
 * They were NOT produced by the code under test. Regenerate with:  python tests/fixtures/margin-golden.py
 *
 * Money is compared to 1e-4 of a rupee, percentages (as fractions) to 1e-8, derived prices to the paisa exactly.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateMargin,
  validateMarginInputs,
  MARGIN_LIMITS,
  COST_CHANGES,
} from "../../assets/js/calculators/formulas/margin.js";

const GOLDEN = {
  "A-price": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "800",
      "discount": null
    },
    "price": "800.0000",
    "profit": "200.0000",
    "margin": "25.000000",
    "markup": "33.333333",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "32.500000",
        "priceToKeep": "720.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "28.750000",
        "priceToKeep": "760.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "25.000000",
        "priceToKeep": "800.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "21.250000",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "17.500000",
        "priceToKeep": "880.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "B-margin-40": {
    "input": {
      "cost": "600",
      "basis": "margin",
      "value": "40",
      "discount": null
    },
    "price": "1000.0000",
    "profit": "400.0000",
    "margin": "40.000000",
    "markup": "66.666667",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "46.000000",
        "priceToKeep": "900.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "43.000000",
        "priceToKeep": "950.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "40.000000",
        "priceToKeep": "1000.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "37.000000",
        "priceToKeep": "1050.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "34.000000",
        "priceToKeep": "1100.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "C-markup-40": {
    "input": {
      "cost": "600",
      "basis": "markup",
      "value": "40",
      "discount": null
    },
    "price": "840.0000",
    "profit": "240.0000",
    "margin": "28.571429",
    "markup": "40.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "35.714286",
        "priceToKeep": "756.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "32.142857",
        "priceToKeep": "798.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "28.571429",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "25.000000",
        "priceToKeep": "882.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "21.428571",
        "priceToKeep": "924.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "D-margin-0-boundary": {
    "input": {
      "cost": "1",
      "basis": "margin",
      "value": "0",
      "discount": null
    },
    "price": "1.0000",
    "profit": "0.0000",
    "margin": "0.000000",
    "markup": "0.000000",
    "state": "zero",
    "rows": [
      {
        "change": -10,
        "cost": "0.900000",
        "margin": "10.000000",
        "priceToKeep": "0.9000",
        "kind": "cover",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "0.950000",
        "margin": "5.000000",
        "priceToKeep": "0.9500",
        "kind": "cover",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "1.000000",
        "margin": "0.000000",
        "priceToKeep": "1.0000",
        "kind": "cover",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "1.050000",
        "margin": "-5.000000",
        "priceToKeep": "1.0500",
        "kind": "cover",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "1.100000",
        "margin": "-10.000000",
        "priceToKeep": "1.1000",
        "kind": "cover",
        "priceChange": "10.000000"
      }
    ]
  },
  "E-loss": {
    "input": {
      "cost": "800",
      "basis": "price",
      "value": "700",
      "discount": null
    },
    "price": "700.0000",
    "profit": "-100.0000",
    "margin": "-14.285714",
    "markup": "-12.500000",
    "state": "loss",
    "rows": [
      {
        "change": -10,
        "cost": "720.000000",
        "margin": "-2.857143",
        "priceToKeep": "720.0000",
        "kind": "cover",
        "priceChange": "2.857143"
      },
      {
        "change": -5,
        "cost": "760.000000",
        "margin": "-8.571429",
        "priceToKeep": "760.0000",
        "kind": "cover",
        "priceChange": "8.571429"
      },
      {
        "change": 0,
        "cost": "800.000000",
        "margin": "-14.285714",
        "priceToKeep": "800.0000",
        "kind": "cover",
        "priceChange": "14.285714"
      },
      {
        "change": 5,
        "cost": "840.000000",
        "margin": "-20.000000",
        "priceToKeep": "840.0000",
        "kind": "cover",
        "priceChange": "20.000000"
      },
      {
        "change": 10,
        "cost": "880.000000",
        "margin": "-25.714286",
        "priceToKeep": "880.0000",
        "kind": "cover",
        "priceChange": "25.714286"
      }
    ]
  },
  "F-cost-limit-margin-95": {
    "input": {
      "cost": "100000000",
      "basis": "margin",
      "value": "95",
      "discount": null
    },
    "price": "2000000000.0000",
    "profit": "1900000000.0000",
    "margin": "95.000000",
    "markup": "1900.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "90000000.000000",
        "margin": "95.500000",
        "priceToKeep": "1800000000.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "95000000.000000",
        "margin": "95.250000",
        "priceToKeep": "1900000000.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "100000000.000000",
        "margin": "95.000000",
        "priceToKeep": "2000000000.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "105000000.000000",
        "margin": "94.750000",
        "priceToKeep": "2100000000.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "110000000.000000",
        "margin": "94.500000",
        "priceToKeep": "2200000000.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "G-rounding-up": {
    "input": {
      "cost": "333.33",
      "basis": "margin",
      "value": "35",
      "discount": null
    },
    "price": "512.8200",
    "profit": "179.4900",
    "margin": "35.000585",
    "markup": "53.847538",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "299.997000",
        "margin": "41.500527",
        "priceToKeep": "461.5400",
        "kind": "keep",
        "priceChange": "-9.999610"
      },
      {
        "change": -5,
        "cost": "316.663500",
        "margin": "38.250556",
        "priceToKeep": "487.1800",
        "kind": "keep",
        "priceChange": "-4.999805"
      },
      {
        "change": 0,
        "cost": "333.330000",
        "margin": "35.000585",
        "priceToKeep": "512.8200",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "349.996500",
        "margin": "31.750614",
        "priceToKeep": "538.4700",
        "kind": "keep",
        "priceChange": "5.001755"
      },
      {
        "change": 10,
        "cost": "366.663000",
        "margin": "28.500644",
        "priceToKeep": "564.1100",
        "kind": "keep",
        "priceChange": "10.001560"
      }
    ]
  },
  "H-smallest-cost": {
    "input": {
      "cost": "0.01",
      "basis": "margin",
      "value": "50",
      "discount": null
    },
    "price": "0.0200",
    "profit": "0.0100",
    "margin": "50.000000",
    "markup": "100.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "0.009000",
        "margin": "55.000000",
        "priceToKeep": "0.0200",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": -5,
        "cost": "0.009500",
        "margin": "52.500000",
        "priceToKeep": "0.0200",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 0,
        "cost": "0.010000",
        "margin": "50.000000",
        "priceToKeep": "0.0200",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "0.010500",
        "margin": "47.500000",
        "priceToKeep": "0.0300",
        "kind": "keep",
        "priceChange": "50.000000"
      },
      {
        "change": 10,
        "cost": "0.011000",
        "margin": "45.000000",
        "priceToKeep": "0.0300",
        "kind": "keep",
        "priceChange": "50.000000"
      }
    ]
  },
  "I-markup-limit": {
    "input": {
      "cost": "250",
      "basis": "markup",
      "value": "1000",
      "discount": null
    },
    "price": "2750.0000",
    "profit": "2500.0000",
    "margin": "90.909091",
    "markup": "1000.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "225.000000",
        "margin": "91.818182",
        "priceToKeep": "2475.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "237.500000",
        "margin": "91.363636",
        "priceToKeep": "2612.5000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "250.000000",
        "margin": "90.909091",
        "priceToKeep": "2750.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "262.500000",
        "margin": "90.454545",
        "priceToKeep": "2887.5000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "275.000000",
        "margin": "90.000000",
        "priceToKeep": "3025.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "J-price-equals-cost": {
    "input": {
      "cost": "450",
      "basis": "price",
      "value": "450",
      "discount": null
    },
    "price": "450.0000",
    "profit": "0.0000",
    "margin": "0.000000",
    "markup": "0.000000",
    "state": "zero",
    "rows": [
      {
        "change": -10,
        "cost": "405.000000",
        "margin": "10.000000",
        "priceToKeep": "405.0000",
        "kind": "cover",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "427.500000",
        "margin": "5.000000",
        "priceToKeep": "427.5000",
        "kind": "cover",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "450.000000",
        "margin": "0.000000",
        "priceToKeep": "450.0000",
        "kind": "cover",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "472.500000",
        "margin": "-5.000000",
        "priceToKeep": "472.5000",
        "kind": "cover",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "495.000000",
        "margin": "-10.000000",
        "priceToKeep": "495.0000",
        "kind": "cover",
        "priceChange": "10.000000"
      }
    ]
  },
  "K-price-three-decimals": {
    "input": {
      "cost": "100",
      "basis": "price",
      "value": "123.456",
      "discount": null
    },
    "price": "123.4560",
    "profit": "23.4560",
    "margin": "18.999482",
    "markup": "23.456000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "90.000000",
        "margin": "27.099533",
        "priceToKeep": "111.1200",
        "kind": "keep",
        "priceChange": "-9.992224"
      },
      {
        "change": -5,
        "cost": "95.000000",
        "margin": "23.049508",
        "priceToKeep": "117.2900",
        "kind": "keep",
        "priceChange": "-4.994492"
      },
      {
        "change": 0,
        "cost": "100.000000",
        "margin": "18.999482",
        "priceToKeep": "123.4600",
        "kind": "keep",
        "priceChange": "0.003240"
      },
      {
        "change": 5,
        "cost": "105.000000",
        "margin": "14.949456",
        "priceToKeep": "129.6300",
        "kind": "keep",
        "priceChange": "5.000972"
      },
      {
        "change": 10,
        "cost": "110.000000",
        "margin": "10.899430",
        "priceToKeep": "135.8100",
        "kind": "keep",
        "priceChange": "10.006804"
      }
    ]
  },
  "L-markup-from-margin-conversion": {
    "input": {
      "cost": "1000",
      "basis": "markup",
      "value": "25",
      "discount": null
    },
    "price": "1250.0000",
    "profit": "250.0000",
    "margin": "20.000000",
    "markup": "25.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "900.000000",
        "margin": "28.000000",
        "priceToKeep": "1125.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "950.000000",
        "margin": "24.000000",
        "priceToKeep": "1187.5000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "1000.000000",
        "margin": "20.000000",
        "priceToKeep": "1250.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "1050.000000",
        "margin": "16.000000",
        "priceToKeep": "1312.5000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "1100.000000",
        "margin": "12.000000",
        "priceToKeep": "1375.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "M-awkward-fractions": {
    "input": {
      "cost": "17.77",
      "basis": "markup",
      "value": "33.33",
      "discount": null
    },
    "price": "23.7000",
    "profit": "5.9300",
    "margin": "25.021097",
    "markup": "33.370850",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "15.993000",
        "margin": "32.518987",
        "priceToKeep": "21.3300",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "16.881500",
        "margin": "28.770042",
        "priceToKeep": "22.5200",
        "kind": "keep",
        "priceChange": "-4.978903"
      },
      {
        "change": 0,
        "cost": "17.770000",
        "margin": "25.021097",
        "priceToKeep": "23.7000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "18.658500",
        "margin": "21.272152",
        "priceToKeep": "24.8900",
        "kind": "keep",
        "priceChange": "5.021097"
      },
      {
        "change": 10,
        "cost": "19.547000",
        "margin": "17.523207",
        "priceToKeep": "26.0700",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "N-discount-10": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "800",
      "discount": "10"
    },
    "price": "800.0000",
    "profit": "200.0000",
    "margin": "25.000000",
    "markup": "33.333333",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "32.500000",
        "priceToKeep": "720.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "28.750000",
        "priceToKeep": "760.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "25.000000",
        "priceToKeep": "800.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "21.250000",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "17.500000",
        "priceToKeep": "880.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "10",
      "price": "720.0000",
      "profit": "120.0000",
      "margin": "16.666667",
      "state": "profit",
      "volumeMultiple": "1.666667",
      "unitsFor1000": 1667
    }
  },
  "O-discount-20": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "800",
      "discount": "20"
    },
    "price": "800.0000",
    "profit": "200.0000",
    "margin": "25.000000",
    "markup": "33.333333",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "32.500000",
        "priceToKeep": "720.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "28.750000",
        "priceToKeep": "760.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "25.000000",
        "priceToKeep": "800.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "21.250000",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "17.500000",
        "priceToKeep": "880.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "20",
      "price": "640.0000",
      "profit": "40.0000",
      "margin": "6.250000",
      "state": "profit",
      "volumeMultiple": "5.000000",
      "unitsFor1000": 5000
    }
  },
  "P-discount-removes-profit": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "800",
      "discount": "25"
    },
    "price": "800.0000",
    "profit": "200.0000",
    "margin": "25.000000",
    "markup": "33.333333",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "32.500000",
        "priceToKeep": "720.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "28.750000",
        "priceToKeep": "760.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "25.000000",
        "priceToKeep": "800.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "21.250000",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "17.500000",
        "priceToKeep": "880.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "25",
      "price": "600.0000",
      "profit": "0.0000",
      "margin": "0.000000",
      "state": "none"
    }
  },
  "Q-discount-below-cost": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "800",
      "discount": "30"
    },
    "price": "800.0000",
    "profit": "200.0000",
    "margin": "25.000000",
    "markup": "33.333333",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "32.500000",
        "priceToKeep": "720.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "28.750000",
        "priceToKeep": "760.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "25.000000",
        "priceToKeep": "800.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "21.250000",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "17.500000",
        "priceToKeep": "880.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "30",
      "price": "560.0000",
      "profit": "-40.0000",
      "margin": "-7.142857",
      "state": "none"
    }
  },
  "R-discount-40pct-margin-10": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "1000",
      "discount": "10"
    },
    "price": "1000.0000",
    "profit": "400.0000",
    "margin": "40.000000",
    "markup": "66.666667",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "46.000000",
        "priceToKeep": "900.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "43.000000",
        "priceToKeep": "950.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "40.000000",
        "priceToKeep": "1000.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "37.000000",
        "priceToKeep": "1050.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "34.000000",
        "priceToKeep": "1100.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "10",
      "price": "900.0000",
      "profit": "300.0000",
      "margin": "33.333333",
      "state": "profit",
      "volumeMultiple": "1.333333",
      "unitsFor1000": 1334
    }
  },
  "S-discount-40pct-margin-20": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "1000",
      "discount": "20"
    },
    "price": "1000.0000",
    "profit": "400.0000",
    "margin": "40.000000",
    "markup": "66.666667",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "46.000000",
        "priceToKeep": "900.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "43.000000",
        "priceToKeep": "950.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "40.000000",
        "priceToKeep": "1000.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "37.000000",
        "priceToKeep": "1050.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "34.000000",
        "priceToKeep": "1100.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "20",
      "price": "800.0000",
      "profit": "200.0000",
      "margin": "25.000000",
      "state": "profit",
      "volumeMultiple": "2.000000",
      "unitsFor1000": 2000
    }
  },
  "T-discount-base-loss": {
    "input": {
      "cost": "800",
      "basis": "price",
      "value": "700",
      "discount": "5"
    },
    "price": "700.0000",
    "profit": "-100.0000",
    "margin": "-14.285714",
    "markup": "-12.500000",
    "state": "loss",
    "rows": [
      {
        "change": -10,
        "cost": "720.000000",
        "margin": "-2.857143",
        "priceToKeep": "720.0000",
        "kind": "cover",
        "priceChange": "2.857143"
      },
      {
        "change": -5,
        "cost": "760.000000",
        "margin": "-8.571429",
        "priceToKeep": "760.0000",
        "kind": "cover",
        "priceChange": "8.571429"
      },
      {
        "change": 0,
        "cost": "800.000000",
        "margin": "-14.285714",
        "priceToKeep": "800.0000",
        "kind": "cover",
        "priceChange": "14.285714"
      },
      {
        "change": 5,
        "cost": "840.000000",
        "margin": "-20.000000",
        "priceToKeep": "840.0000",
        "kind": "cover",
        "priceChange": "20.000000"
      },
      {
        "change": 10,
        "cost": "880.000000",
        "margin": "-25.714286",
        "priceToKeep": "880.0000",
        "kind": "cover",
        "priceChange": "25.714286"
      }
    ],
    "discount": {
      "percent": "5",
      "price": "665.0000",
      "profit": "-135.0000",
      "margin": "-20.300752",
      "state": "base-loss"
    }
  },
  "U-discount-95": {
    "input": {
      "cost": "100",
      "basis": "price",
      "value": "1000",
      "discount": "95"
    },
    "price": "1000.0000",
    "profit": "900.0000",
    "margin": "90.000000",
    "markup": "900.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "90.000000",
        "margin": "91.000000",
        "priceToKeep": "900.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "95.000000",
        "margin": "90.500000",
        "priceToKeep": "950.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "100.000000",
        "margin": "90.000000",
        "priceToKeep": "1000.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "105.000000",
        "margin": "89.500000",
        "priceToKeep": "1050.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "110.000000",
        "margin": "89.000000",
        "priceToKeep": "1100.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "95",
      "price": "50.0000",
      "profit": "-50.0000",
      "margin": "-100.000000",
      "state": "none"
    }
  },
  "V-discount-rounding": {
    "input": {
      "cost": "333.33",
      "basis": "margin",
      "value": "35",
      "discount": "12.5"
    },
    "price": "512.8200",
    "profit": "179.4900",
    "margin": "35.000585",
    "markup": "53.847538",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "299.997000",
        "margin": "41.500527",
        "priceToKeep": "461.5400",
        "kind": "keep",
        "priceChange": "-9.999610"
      },
      {
        "change": -5,
        "cost": "316.663500",
        "margin": "38.250556",
        "priceToKeep": "487.1800",
        "kind": "keep",
        "priceChange": "-4.999805"
      },
      {
        "change": 0,
        "cost": "333.330000",
        "margin": "35.000585",
        "priceToKeep": "512.8200",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "349.996500",
        "margin": "31.750614",
        "priceToKeep": "538.4700",
        "kind": "keep",
        "priceChange": "5.001755"
      },
      {
        "change": 10,
        "cost": "366.663000",
        "margin": "28.500644",
        "priceToKeep": "564.1100",
        "kind": "keep",
        "priceChange": "10.001560"
      }
    ],
    "discount": {
      "percent": "12.5",
      "price": "448.7200",
      "profit": "115.3900",
      "margin": "25.715368",
      "state": "profit",
      "volumeMultiple": "1.555507",
      "unitsFor1000": 1556
    }
  },
  "W-discount-zero-is-none": {
    "input": {
      "cost": "600",
      "basis": "price",
      "value": "800",
      "discount": "0"
    },
    "price": "800.0000",
    "profit": "200.0000",
    "margin": "25.000000",
    "markup": "33.333333",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "32.500000",
        "priceToKeep": "720.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "28.750000",
        "priceToKeep": "760.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "25.000000",
        "priceToKeep": "800.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "21.250000",
        "priceToKeep": "840.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "17.500000",
        "priceToKeep": "880.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ]
  },
  "X-discount-fractional": {
    "input": {
      "cost": "600",
      "basis": "markup",
      "value": "50",
      "discount": "7.5"
    },
    "price": "900.0000",
    "profit": "300.0000",
    "margin": "33.333333",
    "markup": "50.000000",
    "state": "profit",
    "rows": [
      {
        "change": -10,
        "cost": "540.000000",
        "margin": "40.000000",
        "priceToKeep": "810.0000",
        "kind": "keep",
        "priceChange": "-10.000000"
      },
      {
        "change": -5,
        "cost": "570.000000",
        "margin": "36.666667",
        "priceToKeep": "855.0000",
        "kind": "keep",
        "priceChange": "-5.000000"
      },
      {
        "change": 0,
        "cost": "600.000000",
        "margin": "33.333333",
        "priceToKeep": "900.0000",
        "kind": "keep",
        "priceChange": "0.000000"
      },
      {
        "change": 5,
        "cost": "630.000000",
        "margin": "30.000000",
        "priceToKeep": "945.0000",
        "kind": "keep",
        "priceChange": "5.000000"
      },
      {
        "change": 10,
        "cost": "660.000000",
        "margin": "26.666667",
        "priceToKeep": "990.0000",
        "kind": "keep",
        "priceChange": "10.000000"
      }
    ],
    "discount": {
      "percent": "7.5",
      "price": "832.5000",
      "profit": "232.5000",
      "margin": "27.927928",
      "state": "profit",
      "volumeMultiple": "1.290323",
      "unitsFor1000": 1291
    }
  },
  "conversion": {
    "10": "9.090909",
    "25": "20.000000",
    "50": "33.333333",
    "100": "50.000000"
  },
  "articles": {
    "priceForMargin": {
      "25": "800.0000",
      "30": "857.1500",
      "40": "1000.0000"
    },
    "profitForMargin": {
      "25": "200.0000",
      "30": "257.1500",
      "40": "400.0000"
    },
    "markupAtMargin": {
      "25": "33.333333",
      "30": "42.858333",
      "40": "66.666667"
    },
    "addMarginToCost": {
      "25": {
        "price": "750.0000",
        "margin": "20.000000"
      },
      "40": {
        "price": "840.0000",
        "margin": "28.571429"
      }
    },
    "discountOn800": {
      "5": {
        "percent": "5",
        "price": "760.0000",
        "profit": "160.0000",
        "margin": "21.052632",
        "state": "profit",
        "volumeMultiple": "1.250000",
        "unitsFor1000": 1250
      },
      "10": {
        "percent": "10",
        "price": "720.0000",
        "profit": "120.0000",
        "margin": "16.666667",
        "state": "profit",
        "volumeMultiple": "1.666667",
        "unitsFor1000": 1667
      },
      "15": {
        "percent": "15",
        "price": "680.0000",
        "profit": "80.0000",
        "margin": "11.764706",
        "state": "profit",
        "volumeMultiple": "2.500000",
        "unitsFor1000": 2500
      },
      "20": {
        "percent": "20",
        "price": "640.0000",
        "profit": "40.0000",
        "margin": "6.250000",
        "state": "profit",
        "volumeMultiple": "5.000000",
        "unitsFor1000": 5000
      },
      "25": {
        "percent": "25",
        "price": "600.0000",
        "profit": "0.0000",
        "margin": "0.000000",
        "state": "none"
      }
    },
    "discountOn1000": {
      "10": {
        "percent": "10",
        "price": "900.0000",
        "profit": "300.0000",
        "margin": "33.333333",
        "state": "profit",
        "volumeMultiple": "1.333333",
        "unitsFor1000": 1334
      },
      "20": {
        "percent": "20",
        "price": "800.0000",
        "profit": "200.0000",
        "margin": "25.000000",
        "state": "profit",
        "volumeMultiple": "2.000000",
        "unitsFor1000": 2000
      },
      "30": {
        "percent": "30",
        "price": "700.0000",
        "profit": "100.0000",
        "margin": "14.285714",
        "state": "profit",
        "volumeMultiple": "4.000000",
        "unitsFor1000": 4000
      }
    },
    "costRise800": {
      "5": {
        "cost": "630.00",
        "margin": "21.250000",
        "keep": "840.0000"
      },
      "10": {
        "cost": "660.00",
        "margin": "17.500000",
        "keep": "880.0000"
      }
    }
  }
};

const N = Number;
const near = (a, b, label, tol = 1e-4) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const frac = (percentString) => N(percentString) / 100;
const run = (g) => calculateMargin({ cost: N(g.input.cost), basis: g.input.basis, value: N(g.input.value), discount: g.input.discount === null ? null : N(g.input.discount) });
const SCENARIOS = Object.entries(GOLDEN).filter(([key]) => key !== "conversion" && key !== "articles");

describe("golden scenarios: the engine equals the independent reference", () => {
  for (const [name, g] of SCENARIOS) {
    test(name, () => {
      const r = run(g);
      near(r.price, N(g.price), "price");
      near(r.profit, N(g.profit), "profit");
      near(r.margin, frac(g.margin), "margin", 1e-8);
      near(r.markup, frac(g.markup), "markup", 1e-8);
      assert.equal(r.state, g.state);
      assert.equal(r.rows.length, 5);
      assert.deepEqual(r.rows.map((row) => row.change), [-10, -5, 0, 5, 10]);
      g.rows.forEach((expected, i) => {
        const row = r.rows[i];
        near(row.cost, N(expected.cost), `${name} row ${expected.change} cost`, 1e-6);
        near(row.margin, frac(expected.margin), `${name} row ${expected.change} margin`, 1e-8);
        near(row.price, N(expected.priceToKeep), `${name} row ${expected.change} price`);
        near(row.priceChange, frac(expected.priceChange), `${name} row ${expected.change} price change`, 1e-8);
        assert.equal(row.kind, expected.kind, `${name} row ${expected.change} kind`);
      });
      if (g.discount) {
        const d = r.discount;
        assert.ok(d, "a discount block");
        assert.equal(d.state, g.discount.state);
        near(d.price, N(g.discount.price), "discounted price");
        near(d.profit, N(g.discount.profit), "discounted profit");
        if (g.discount.margin !== null) near(d.margin, frac(g.discount.margin), "discounted margin", 1e-8);
        if (g.discount.state === "profit") near(d.volumeMultiple, N(g.discount.volumeMultiple), "volume multiple", 1e-6);
        else assert.equal(d.volumeMultiple, null);
      } else {
        assert.equal(r.discount, null);
      }
    });
  }
});

describe("the cases the product has to get right", () => {
  test("price basis: cost 600, price 800 is a 25% margin and a 33.33% markup", () => {
    const r = calculateMargin({ cost: 600, basis: "price", value: 800 });
    assert.equal(r.price, 800);
    assert.equal(r.profit, 200);
    near(r.margin, 0.25, "margin", 1e-12);
    near(r.markup, 1 / 3, "markup", 1e-12);
    assert.equal(r.derived, false);
  });

  test("a margin is not a markup: 25% markup is a 20% margin, 100% markup is a 50% margin", () => {
    for (const [markup, margin] of [[10, "9.090909"], [25, "20.000000"], [50, "33.333333"], [100, "50.000000"]]) {
      assert.equal(GOLDEN.conversion[markup], margin);
      const r = calculateMargin({ cost: 1000, basis: "markup", value: markup });
      near(r.margin, frac(margin), `margin at ${markup}% markup`, 1e-8);
      near(r.markup, markup / 100, "markup", 1e-12);
    }
  });

  test("exact results are not pushed up a paisa by floating point (600 at 40% margin is 1,000.00, not 1,000.01)", () => {
    assert.equal(calculateMargin({ cost: 600, basis: "margin", value: 40 }).price, 1000);
    assert.equal(calculateMargin({ cost: 600, basis: "markup", value: 40 }).price, 840);
    assert.equal(calculateMargin({ cost: 450, basis: "margin", value: 0 }).price, 450);
    assert.equal(calculateMargin({ cost: 99999999.99, basis: "markup", value: 0 }).price, 99999999.99);
    assert.equal(calculateMargin({ cost: 1000, basis: "markup", value: 25 }).price, 1250);
  });

  test("a derived price is rounded UP to the paisa and the figures follow the rounded price", () => {
    const r = calculateMargin({ cost: 333.33, basis: "margin", value: 35 });
    assert.equal(r.price, 512.82); // the exact price is 512.8153846...
    near(r.profit, 179.49, "profit", 1e-9);
    assert.ok(r.margin >= 0.35, "never below the target");
    near(r.margin, 179.49 / 512.82, "margin from the rounded price", 1e-12);
    near(r.markup, 179.49 / 333.33, "markup from the rounded price", 1e-12);
    assert.equal(r.derived, true);
  });

  test("a loss and a zero profit are results, not errors", () => {
    const loss = calculateMargin({ cost: 800, basis: "price", value: 700 });
    assert.equal(loss.state, "loss");
    near(loss.profit, -100, "profit", 1e-9);
    assert.ok(loss.margin < 0 && loss.markup < 0);
    const zero = calculateMargin({ cost: 450, basis: "price", value: 450 });
    assert.equal(zero.state, "zero");
    assert.equal(zero.profit, 0);
    assert.equal(zero.margin, 0);
    assert.equal(validateMarginInputs({ cost: 800, basis: "price", value: 700, discount: "" }).ok, true);
  });

  test("the smallest cost and the largest valid margin", () => {
    assert.equal(calculateMargin({ cost: 0.01, basis: "margin", value: 50 }).price, 0.02);
    const big = calculateMargin({ cost: 100000000, basis: "margin", value: 95 });
    assert.equal(big.price, 2000000000);
    near(big.margin, 0.95, "margin", 1e-12);
    const wide = calculateMargin({ cost: 250, basis: "markup", value: 1000 });
    assert.equal(wide.price, 2750);
  });
});

describe("cost-change rows", () => {
  test("the five rows, in order, with the price that keeps the margin", () => {
    const r = calculateMargin({ cost: 600, basis: "price", value: 800 });
    assert.deepEqual(COST_CHANGES, [-10, -5, 0, 5, 10]);
    assert.deepEqual(r.rows.map((row) => row.price), [720, 760, 800, 840, 880]);
    assert.deepEqual(r.rows.map((row) => Math.round(row.margin * 10000) / 10000), [0.325, 0.2875, 0.25, 0.2125, 0.175]);
    assert.deepEqual(r.rows.map((row) => row.kind), ["keep", "keep", "keep", "keep", "keep"]);
    near(r.rows[2].priceChange, 0, "no change at 0%", 0);
  });

  test("the price that keeps the margin really keeps it (never below), and a paisa less would not", () => {
    for (const [cost, price] of [[600, 800], [333.33, 512.82], [17.77, 23.7], [1000, 1250.01]]) {
      const r = calculateMargin({ cost, basis: "price", value: price });
      for (const row of r.rows) {
        const newCost = cost * (100 + row.change) / 100;
        assert.ok((row.price - newCost) / row.price >= r.margin - 1e-12, `${cost}/${price} ${row.change}%`);
        const below = row.price - 0.01;
        assert.ok(below <= 0 || (below - newCost) / below < r.margin + 1e-12, `a paisa less ${cost}/${price} ${row.change}%`);
      }
    }
  });

  test("a margin of zero or less has nothing to keep: the row gives the price that covers the new cost", () => {
    const loss = calculateMargin({ cost: 800, basis: "price", value: 700 });
    assert.deepEqual(loss.rows.map((row) => row.kind), ["cover", "cover", "cover", "cover", "cover"]);
    assert.deepEqual(loss.rows.map((row) => row.price), [720, 760, 800, 840, 880]);
    const zero = calculateMargin({ cost: 450, basis: "price", value: 450 });
    assert.deepEqual(zero.rows.map((row) => row.kind), ["cover", "cover", "cover", "cover", "cover"]);
    assert.equal(zero.rows[2].price, 450);
  });

  test("the cost may fall below the smallest allowed cost in a row; it is calculated, not clamped", () => {
    const r = calculateMargin({ cost: 0.01, basis: "margin", value: 50 });
    near(r.rows[0].cost, 0.009, "cost", 1e-12);
    assert.ok(r.rows[0].price >= 0.01);
  });
});

describe("discount", () => {
  test("the volume multiple is the profit before over the profit after", () => {
    const r10 = calculateMargin({ cost: 600, basis: "price", value: 800, discount: 10 });
    near(r10.discount.price, 720, "price", 1e-9);
    near(r10.discount.profit, 120, "profit", 1e-9);
    near(r10.discount.volumeMultiple, 200 / 120, "multiple", 1e-12);
    const r20 = calculateMargin({ cost: 600, basis: "price", value: 800, discount: 20 });
    near(r20.discount.volumeMultiple, 5, "multiple", 1e-12);
  });

  test("a discount that removes the profit, or goes below cost, has no finite volume multiple", () => {
    for (const d of [25, 30, 95]) {
      const r = calculateMargin({ cost: 600, basis: "price", value: 800, discount: d });
      assert.equal(r.discount.state, "none", `${d}%`);
      assert.equal(r.discount.volumeMultiple, null);
    }
  });

  test("a price already at or below cost shows no multiple", () => {
    for (const price of [700, 800]) {
      const r = calculateMargin({ cost: 800, basis: "price", value: price, discount: 5 });
      assert.equal(r.discount.state, "base-loss");
      assert.equal(r.discount.volumeMultiple, null);
    }
  });

  test("blank or 0 means no discount block", () => {
    assert.equal(calculateMargin({ cost: 600, basis: "price", value: 800, discount: null }).discount, null);
    assert.equal(calculateMargin({ cost: 600, basis: "price", value: 800, discount: 0 }).discount, null);
  });

  test("the discounted price is rounded to the nearest paisa and the figures follow it", () => {
    const r = calculateMargin({ cost: 333.33, basis: "margin", value: 35, discount: 12.5 });
    near(r.discount.price, 448.72, "price", 1e-9); // 512.82 x 0.875 = 448.7175
    near(r.discount.profit, 448.72 - 333.33, "profit", 1e-9);
  });
});

describe("invariants over a wide grid", () => {
  const costs = [0.01, 1, 17.77, 333.33, 600, 12345.67, 100000000];
  test("price rises with the target; margin and markup determine each other; a derived price never misses", () => {
    for (const cost of costs) {
      let last = 0;
      for (const m of [0, 5, 10, 25, 33.33, 50, 75, 95]) {
        const r = calculateMargin({ cost, basis: "margin", value: m });
        assert.ok(r.price >= last, `${cost} at ${m}`);
        last = r.price;
        assert.ok(r.margin >= m / 100 - 1e-12, `${cost}: margin below target ${m}`);
        near(r.margin, r.markup / (1 + r.markup), "margin from markup", 1e-9);
      }
      last = 0;
      for (const k of [0, 5, 25, 50, 100, 500, 1000]) {
        const r = calculateMargin({ cost, basis: "markup", value: k });
        assert.ok(r.price >= last);
        last = r.price;
        assert.ok(r.markup >= k / 100 - 1e-12, `${cost}: markup below target ${k}`);
      }
    }
  });

  test("a derived price is the smallest paisa price that reaches the target", () => {
    for (const cost of [17.77, 333.33, 600, 12345.67]) {
      for (const m of [10, 25, 33.33, 60]) {
        const p = calculateMargin({ cost, basis: "margin", value: m }).price;
        assert.ok((p - cost) / p >= m / 100 - 1e-12);
        const below = Math.round((p - 0.01) * 100) / 100;
        assert.ok((below - cost) / below < m / 100, `${cost} at ${m}%: ${below} would already reach it`);
      }
    }
  });

  test("the discount multiple is at least 1, rises with the discount and with a lower margin", () => {
    let last = 1;
    for (const d of [1, 5, 10, 15, 20]) {
      const m = calculateMargin({ cost: 600, basis: "price", value: 800, discount: d }).discount.volumeMultiple;
      assert.ok(m >= last);
      last = m;
    }
    const high = calculateMargin({ cost: 600, basis: "price", value: 1000, discount: 20 }).discount.volumeMultiple;
    const low = calculateMargin({ cost: 600, basis: "price", value: 800, discount: 20 }).discount.volumeMultiple;
    assert.ok(high < low, "a higher margin needs less extra volume for the same discount");
  });

  test("the cost-change table is ordered: a higher cost means a lower margin and a higher price to keep", () => {
    const r = calculateMargin({ cost: 12345.67, basis: "margin", value: 30 });
    for (let i = 1; i < r.rows.length; i++) {
      assert.ok(r.rows[i].margin < r.rows[i - 1].margin);
      assert.ok(r.rows[i].price >= r.rows[i - 1].price);
    }
  });
});

describe("validation (the rules and messages belong to the tool)", () => {
  const ok = { cost: "600", basis: "margin", value: "40", discount: "" };

  test("valid input comes back as numbers; a blank discount means none", () => {
    const v = validateMarginInputs(ok);
    assert.equal(v.ok, true);
    assert.deepEqual(v.values, { cost: 600, basis: "margin", value: 40, discount: null });
    assert.equal(validateMarginInputs({ ...ok, discount: "12.5" }).values.discount, 12.5);
  });

  test("the limits are the documented ones, and the boundaries are valid", () => {
    assert.deepEqual(MARGIN_LIMITS.cost, { min: 0.01, max: 100000000 });
    assert.deepEqual(MARGIN_LIMITS.margin, { min: 0, max: 95 });
    assert.deepEqual(MARGIN_LIMITS.markup, { min: 0, max: 1000 });
    assert.deepEqual(MARGIN_LIMITS.discount, { min: 0, max: 95 });
    for (const input of [
      { ...ok, cost: "0.01" }, { ...ok, cost: "100000000" }, { ...ok, value: "0" }, { ...ok, value: "95" },
      { cost: "5", basis: "markup", value: "1000", discount: "95" }, { cost: "5", basis: "price", value: "0.01", discount: "0" },
    ]) assert.equal(validateMarginInputs(input).ok, true, JSON.stringify(input));
  });

  test("each field has its own error, with a message", () => {
    const bad = (input, field) => {
      const v = validateMarginInputs(input);
      assert.equal(v.ok, false, JSON.stringify(input));
      assert.ok(v.errors.some((e) => e.fields.includes(field) && e.message.length > 10), `${field}: ${JSON.stringify(v.errors)}`);
    };
    for (const cost of ["", "0", "-5", "0.009", "100000001", "abc"]) bad({ ...ok, cost }, "cost");
    for (const value of ["", "-1", "95.01", "100", "x"]) bad({ ...ok, value }, "value");
    bad({ ...ok, basis: "markup", value: "1000.5" }, "value");
    bad({ ...ok, basis: "price", value: "0" }, "value");
    bad({ ...ok, basis: "price", value: "-3" }, "value");
    bad({ ...ok, discount: "96" }, "discount");
    bad({ ...ok, discount: "-1" }, "discount");
    bad({ ...ok, discount: "abc" }, "discount");
    bad({ ...ok, basis: "nope" }, "basis");
  });

  test("the message for a margin of 100% or more says why", () => {
    const v = validateMarginInputs({ ...ok, value: "100" });
    assert.match(v.errors[0].message, /95%.*100%/);
  });

  test("a price below the cost is valid input (a loss is a result)", () => {
    assert.equal(validateMarginInputs({ cost: "800", basis: "price", value: "700", discount: "" }).ok, true);
  });

  test("the value is checked against the chosen basis only", () => {
    assert.equal(validateMarginInputs({ cost: "600", basis: "price", value: "800", discount: "" }).ok, true);
    assert.equal(validateMarginInputs({ cost: "600", basis: "margin", value: "800", discount: "" }).ok, false);
  });

  test("several problems are reported together", () => {
    const v = validateMarginInputs({ cost: "0", basis: "margin", value: "99", discount: "99" });
    assert.equal(v.ok, false);
    assert.deepEqual(v.errors.flatMap((e) => e.fields).sort(), ["cost", "discount", "value"]);
  });
});
