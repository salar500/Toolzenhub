/**
 * Tool Pack 6: the Home Loan engine (formulas/home-loan.js).
 *
 * GOLDEN holds the expected values of the independent reference, tests/fixtures/home-loan-golden.py (Python decimal, 80
 * digits). It SIMULATES the repayment month by month and searches whole rupees for the largest loan that the EMI room clears
 * (the closed form is asserted equal), checks that one rupee more is not repaid, and cross-checks each EMI by simulating the
 * loan with it. They were NOT produced by the code under test. Regenerate with:  python tests/fixtures/home-loan-golden.py
 *
 * The loan is compared EXACTLY (a whole rupee); money to 1e-3 of a rupee, shares to 1e-8.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateHomeLoan,
  validateHomeLoanInputs,
  HOME_LOAN_LIMITS,
  TENURE_ROWS,
} from "../../assets/js/calculators/formulas/home-loan.js";

const GOLDEN = {
  "A-defaults": {
    "input": {
      "income": "100000",
      "existing": "0",
      "share": "40",
      "rate": "8.5",
      "years": 20,
      "own": null
    },
    "capacity": "40000.0000",
    "room": "40000.0000",
    "loan": 4609233,
    "emi": "39999.9949",
    "repaid": "9599998.7649",
    "interest": "4990765.7649",
    "existingShare": "0.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 3226178,
        "interest": "1573820.8211",
        "repaid": "4799998.8211",
        "yours": false
      },
      {
        "years": 15,
        "loan": 4061987,
        "interest": "3138011.7088",
        "repaid": "7199998.7088",
        "yours": false
      },
      {
        "years": 20,
        "loan": 4609233,
        "interest": "4990765.7649",
        "repaid": "9599998.7649",
        "yours": true
      },
      {
        "years": 25,
        "loan": 4967542,
        "interest": "7032456.0699",
        "repaid": "11999998.0699",
        "yours": false
      },
      {
        "years": 30,
        "loan": 5202145,
        "interest": "9197852.9626",
        "repaid": "14399997.9626",
        "yours": false
      }
    ]
  },
  "B-existing-and-own-funds": {
    "input": {
      "income": "100000",
      "existing": "10000",
      "share": "40",
      "rate": "8.5",
      "years": 20,
      "own": "500000"
    },
    "capacity": "40000.0000",
    "room": "30000.0000",
    "loan": 3456925,
    "emi": "29999.9983",
    "repaid": "7199999.5944",
    "interest": "3743074.5944",
    "existingShare": "10.000000",
    "noRoom": false,
    "property": "3956925.0000",
    "tenureRows": [
      {
        "years": 10,
        "loan": 2419634,
        "interest": "1180365.8598",
        "repaid": "3599999.8598",
        "yours": false
      },
      {
        "years": 15,
        "loan": 3046490,
        "interest": "2353508.5885",
        "repaid": "5399998.5885",
        "yours": false
      },
      {
        "years": 20,
        "loan": 3456925,
        "interest": "3743074.5944",
        "repaid": "7199999.5944",
        "yours": true
      },
      {
        "years": 25,
        "loan": 3725657,
        "interest": "5274342.7603",
        "repaid": "8999999.7603",
        "yours": false
      },
      {
        "years": 30,
        "loan": 3901609,
        "interest": "6898390.1640",
        "repaid": "10799999.1640",
        "yours": false
      }
    ]
  },
  "C-existing-above-capacity": {
    "input": {
      "income": "50000",
      "existing": "25000",
      "share": "40",
      "rate": "8.5",
      "years": 20,
      "own": null
    },
    "capacity": "20000.0000",
    "room": "0.0000",
    "loan": 0,
    "emi": "0.0000",
    "repaid": "0.0000",
    "interest": "0.0000",
    "existingShare": "50.000000",
    "noRoom": true,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 15,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 20,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": true
      },
      {
        "years": 25,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 30,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      }
    ]
  },
  "D-room-exactly-zero": {
    "input": {
      "income": "50000",
      "existing": "20000",
      "share": "40",
      "rate": "8.5",
      "years": 20,
      "own": null
    },
    "capacity": "20000.0000",
    "room": "0.0000",
    "loan": 0,
    "emi": "0.0000",
    "repaid": "0.0000",
    "interest": "0.0000",
    "existingShare": "40.000000",
    "noRoom": true,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 15,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 20,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": true
      },
      {
        "years": 25,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 30,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      }
    ]
  },
  "E-zero-rate": {
    "input": {
      "income": "100000",
      "existing": "10000",
      "share": "40",
      "rate": "0",
      "years": 20,
      "own": null
    },
    "capacity": "40000.0000",
    "room": "30000.0000",
    "loan": 7200000,
    "emi": "30000.0000",
    "repaid": "7200000.0000",
    "interest": "0.0000",
    "existingShare": "10.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 3600000,
        "interest": "0.0000",
        "repaid": "3600000.0000",
        "yours": false
      },
      {
        "years": 15,
        "loan": 5400000,
        "interest": "0.0000",
        "repaid": "5400000.0000",
        "yours": false
      },
      {
        "years": 20,
        "loan": 7200000,
        "interest": "0.0000",
        "repaid": "7200000.0000",
        "yours": true
      },
      {
        "years": 25,
        "loan": 9000000,
        "interest": "0.0000",
        "repaid": "9000000.0000",
        "yours": false
      },
      {
        "years": 30,
        "loan": 10800000,
        "interest": "0.0000",
        "repaid": "10800000.0000",
        "yours": false
      }
    ]
  },
  "F-thirty-years": {
    "input": {
      "income": "100000",
      "existing": "10000",
      "share": "40",
      "rate": "8.5",
      "years": 30,
      "own": null
    },
    "capacity": "40000.0000",
    "room": "30000.0000",
    "loan": 3901609,
    "emi": "29999.9977",
    "repaid": "10799999.1640",
    "interest": "6898390.1640",
    "existingShare": "10.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 2419634,
        "interest": "1180365.8598",
        "repaid": "3599999.8598",
        "yours": false
      },
      {
        "years": 15,
        "loan": 3046490,
        "interest": "2353508.5885",
        "repaid": "5399998.5885",
        "yours": false
      },
      {
        "years": 20,
        "loan": 3456925,
        "interest": "3743074.5944",
        "repaid": "7199999.5944",
        "yours": false
      },
      {
        "years": 25,
        "loan": 3725657,
        "interest": "5274342.7603",
        "repaid": "8999999.7603",
        "yours": false
      },
      {
        "years": 30,
        "loan": 3901609,
        "interest": "6898390.1640",
        "repaid": "10799999.1640",
        "yours": true
      }
    ]
  },
  "G-one-year": {
    "input": {
      "income": "100000",
      "existing": "10000",
      "share": "40",
      "rate": "8.5",
      "years": 1,
      "own": null
    },
    "capacity": "40000.0000",
    "room": "30000.0000",
    "loan": 343958,
    "emi": "29999.9419",
    "repaid": "359999.3032",
    "interest": "16041.3032",
    "existingShare": "10.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 1,
        "loan": 343958,
        "interest": "16041.3032",
        "repaid": "359999.3032",
        "yours": true
      },
      {
        "years": 10,
        "loan": 2419634,
        "interest": "1180365.8598",
        "repaid": "3599999.8598",
        "yours": false
      },
      {
        "years": 15,
        "loan": 3046490,
        "interest": "2353508.5885",
        "repaid": "5399998.5885",
        "yours": false
      },
      {
        "years": 20,
        "loan": 3456925,
        "interest": "3743074.5944",
        "repaid": "7199999.5944",
        "yours": false
      },
      {
        "years": 25,
        "loan": 3725657,
        "interest": "5274342.7603",
        "repaid": "8999999.7603",
        "yours": false
      },
      {
        "years": 30,
        "loan": 3901609,
        "interest": "6898390.1640",
        "repaid": "10799999.1640",
        "yours": false
      }
    ]
  },
  "H-tiny-room": {
    "input": {
      "income": "1000",
      "existing": "0",
      "share": "5",
      "rate": "30",
      "years": 1,
      "own": null
    },
    "capacity": "50.0000",
    "room": "50.0000",
    "loan": 512,
    "emi": "49.9134",
    "repaid": "598.9609",
    "interest": "86.9609",
    "existingShare": "0.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 1,
        "loan": 512,
        "interest": "86.9609",
        "repaid": "598.9609",
        "yours": true
      },
      {
        "years": 10,
        "loan": 1896,
        "interest": "4101.8351",
        "repaid": "5997.8351",
        "yours": false
      },
      {
        "years": 15,
        "loan": 1976,
        "interest": "7021.6411",
        "repaid": "8997.6411",
        "yours": false
      },
      {
        "years": 20,
        "loan": 1994,
        "interest": "10002.0117",
        "repaid": "11996.0117",
        "yours": false
      },
      {
        "years": 25,
        "loan": 1998,
        "interest": "12996.0941",
        "repaid": "14994.0941",
        "yours": false
      },
      {
        "years": 30,
        "loan": 1999,
        "interest": "15994.4804",
        "repaid": "17993.4804",
        "yours": false
      }
    ]
  },
  "I-large": {
    "input": {
      "income": "10000000",
      "existing": "500000",
      "share": "90",
      "rate": "6.75",
      "years": 30,
      "own": null
    },
    "capacity": "9000000.0000",
    "room": "8500000.0000",
    "loan": 1310518801,
    "emi": "8499999.9985",
    "repaid": "3059999999.4437",
    "interest": "1749481198.4437",
    "existingShare": "5.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 740262621,
        "interest": "279737378.2296",
        "repaid": "1019999999.2296",
        "yours": false
      },
      {
        "years": 15,
        "loan": 960550244,
        "interest": "569449755.7948",
        "repaid": "1529999999.7948",
        "yours": false
      },
      {
        "years": 20,
        "loan": 1117885629,
        "interest": "922114369.3750",
        "repaid": "2039999998.3750",
        "yours": false
      },
      {
        "years": 25,
        "loan": 1230258823,
        "interest": "1319741176.4157",
        "repaid": "2549999999.4157",
        "yours": false
      },
      {
        "years": 30,
        "loan": 1310518801,
        "interest": "1749481198.4437",
        "repaid": "3059999999.4437",
        "yours": true
      }
    ]
  },
  "J-paise-room": {
    "input": {
      "income": "87654.32",
      "existing": "1234.56",
      "share": "37.5",
      "rate": "9.25",
      "years": 15,
      "own": null
    },
    "capacity": "32870.3700",
    "room": "31635.8100",
    "loan": 3073848,
    "emi": "31635.8066",
    "repaid": "5694445.1909",
    "interest": "2620597.1909",
    "existingShare": "1.408442",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 2470915,
        "interest": "1325380.6787",
        "repaid": "3796295.6787",
        "yours": false
      },
      {
        "years": 15,
        "loan": 3073848,
        "interest": "2620597.1909",
        "repaid": "5694445.1909",
        "yours": true
      },
      {
        "years": 20,
        "loan": 3454193,
        "interest": "4138400.9353",
        "repaid": "7592593.9353",
        "yours": false
      },
      {
        "years": 25,
        "loan": 3694124,
        "interest": "5796618.1553",
        "repaid": "9490742.1553",
        "yours": false
      },
      {
        "years": 30,
        "loan": 3845478,
        "interest": "7543410.8997",
        "repaid": "11388888.8997",
        "yours": false
      }
    ]
  },
  "K-custom-tenure-18": {
    "input": {
      "income": "100000",
      "existing": "10000",
      "share": "40",
      "rate": "8.5",
      "years": 18,
      "own": null
    },
    "capacity": "40000.0000",
    "room": "30000.0000",
    "loan": 3313242,
    "emi": "29999.9967",
    "repaid": "6479999.2821",
    "interest": "3166757.2821",
    "existingShare": "10.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 2419634,
        "interest": "1180365.8598",
        "repaid": "3599999.8598",
        "yours": false
      },
      {
        "years": 15,
        "loan": 3046490,
        "interest": "2353508.5885",
        "repaid": "5399998.5885",
        "yours": false
      },
      {
        "years": 18,
        "loan": 3313242,
        "interest": "3166757.2821",
        "repaid": "6479999.2821",
        "yours": true
      },
      {
        "years": 20,
        "loan": 3456925,
        "interest": "3743074.5944",
        "repaid": "7199999.5944",
        "yours": false
      },
      {
        "years": 25,
        "loan": 3725657,
        "interest": "5274342.7603",
        "repaid": "8999999.7603",
        "yours": false
      },
      {
        "years": 30,
        "loan": 3901609,
        "interest": "6898390.1640",
        "repaid": "10799999.1640",
        "yours": false
      }
    ]
  },
  "L-existing-above-income": {
    "input": {
      "income": "10000",
      "existing": "20000",
      "share": "40",
      "rate": "8.5",
      "years": 20,
      "own": null
    },
    "capacity": "4000.0000",
    "room": "0.0000",
    "loan": 0,
    "emi": "0.0000",
    "repaid": "0.0000",
    "interest": "0.0000",
    "existingShare": "200.000000",
    "noRoom": true,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 15,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 20,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": true
      },
      {
        "years": 25,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      },
      {
        "years": 30,
        "loan": 0,
        "interest": "0.0000",
        "repaid": "0.0000",
        "yours": false
      }
    ]
  },
  "M-zero-rate-thirty-years": {
    "input": {
      "income": "60000",
      "existing": "0",
      "share": "50",
      "rate": "0",
      "years": 30,
      "own": null
    },
    "capacity": "30000.0000",
    "room": "30000.0000",
    "loan": 10800000,
    "emi": "30000.0000",
    "repaid": "10800000.0000",
    "interest": "0.0000",
    "existingShare": "0.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 3600000,
        "interest": "0.0000",
        "repaid": "3600000.0000",
        "yours": false
      },
      {
        "years": 15,
        "loan": 5400000,
        "interest": "0.0000",
        "repaid": "5400000.0000",
        "yours": false
      },
      {
        "years": 20,
        "loan": 7200000,
        "interest": "0.0000",
        "repaid": "7200000.0000",
        "yours": false
      },
      {
        "years": 25,
        "loan": 9000000,
        "interest": "0.0000",
        "repaid": "9000000.0000",
        "yours": false
      },
      {
        "years": 30,
        "loan": 10800000,
        "interest": "0.0000",
        "repaid": "10800000.0000",
        "yours": true
      }
    ]
  },
  "N-smallest-income-smallest-share": {
    "input": {
      "income": "1000",
      "existing": "0",
      "share": "1",
      "rate": "8.5",
      "years": 20,
      "own": null
    },
    "capacity": "10.0000",
    "room": "10.0000",
    "loan": 1152,
    "emi": "9.9973",
    "repaid": "2399.3577",
    "interest": "1247.3577",
    "existingShare": "0.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 806,
        "interest": "393.1896",
        "repaid": "1199.1896",
        "yours": false
      },
      {
        "years": 15,
        "loan": 1015,
        "interest": "784.1192",
        "repaid": "1799.1192",
        "yours": false
      },
      {
        "years": 20,
        "loan": 1152,
        "interest": "1247.3577",
        "repaid": "2399.3577",
        "yours": true
      },
      {
        "years": 25,
        "loan": 1241,
        "interest": "1756.8604",
        "repaid": "2997.8604",
        "yours": false
      },
      {
        "years": 30,
        "loan": 1300,
        "interest": "2298.5151",
        "repaid": "3598.5151",
        "yours": false
      }
    ]
  },
  "O-own-funds-zero": {
    "input": {
      "income": "100000",
      "existing": "10000",
      "share": "40",
      "rate": "8.5",
      "years": 20,
      "own": "0"
    },
    "capacity": "40000.0000",
    "room": "30000.0000",
    "loan": 3456925,
    "emi": "29999.9983",
    "repaid": "7199999.5944",
    "interest": "3743074.5944",
    "existingShare": "10.000000",
    "noRoom": false,
    "property": "3456925.0000",
    "tenureRows": [
      {
        "years": 10,
        "loan": 2419634,
        "interest": "1180365.8598",
        "repaid": "3599999.8598",
        "yours": false
      },
      {
        "years": 15,
        "loan": 3046490,
        "interest": "2353508.5885",
        "repaid": "5399998.5885",
        "yours": false
      },
      {
        "years": 20,
        "loan": 3456925,
        "interest": "3743074.5944",
        "repaid": "7199999.5944",
        "yours": true
      },
      {
        "years": 25,
        "loan": 3725657,
        "interest": "5274342.7603",
        "repaid": "8999999.7603",
        "yours": false
      },
      {
        "years": 30,
        "loan": 3901609,
        "interest": "6898390.1640",
        "repaid": "10799999.1640",
        "yours": false
      }
    ]
  },
  "P-high-rate-high-share": {
    "input": {
      "income": "250000",
      "existing": "0",
      "share": "90",
      "rate": "30",
      "years": 30,
      "own": null
    },
    "capacity": "225000.0000",
    "room": "225000.0000",
    "loan": 8998759,
    "emi": "224999.9914",
    "repaid": "80999996.8930",
    "interest": "72001237.8930",
    "existingShare": "0.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 8535079,
        "interest": "18464919.3039",
        "repaid": "26999998.3039",
        "yours": false
      },
      {
        "years": 15,
        "loan": 8894331,
        "interest": "31605668.0488",
        "repaid": "40499999.0488",
        "yours": false
      },
      {
        "years": 20,
        "loan": 8975983,
        "interest": "45024015.6883",
        "repaid": "53999998.6883",
        "yours": false
      },
      {
        "years": 25,
        "loan": 8994541,
        "interest": "58505456.1511",
        "repaid": "67499997.1511",
        "yours": false
      },
      {
        "years": 30,
        "loan": 8998759,
        "interest": "72001237.8930",
        "repaid": "80999996.8930",
        "yours": true
      }
    ]
  },
  "Q-fraction-of-a-rupee": {
    "input": {
      "income": "33333.33",
      "existing": "0",
      "share": "33.3",
      "rate": "7.35",
      "years": 25,
      "own": null
    },
    "capacity": "11099.9989",
    "room": "11099.9989",
    "loan": 1522086,
    "emi": "11099.9945",
    "repaid": "3329998.3523",
    "interest": "1807912.3523",
    "existingShare": "0.000000",
    "noRoom": false,
    "property": null,
    "tenureRows": [
      {
        "years": 10,
        "loan": 941313,
        "interest": "390686.5484",
        "repaid": "1331999.5484",
        "yours": false
      },
      {
        "years": 15,
        "loan": 1208480,
        "interest": "789519.4338",
        "repaid": "1997999.4338",
        "yours": false
      },
      {
        "years": 20,
        "loan": 1393691,
        "interest": "1270308.6297",
        "repaid": "2663999.6297",
        "yours": false
      },
      {
        "years": 25,
        "loan": 1522086,
        "interest": "1807912.3523",
        "repaid": "3329998.3523",
        "yours": true
      },
      {
        "years": 30,
        "loan": 1611095,
        "interest": "2384903.3059",
        "repaid": "3995998.3059",
        "yours": false
      }
    ]
  },
  "articles": {
    "example": {
      "income": 100000,
      "share": 40,
      "capacity": 40000,
      "existing": 10000,
      "room": 30000,
      "rate": "8.5",
      "years": 20,
      "loan": 3456925,
      "emi": "29999.9983",
      "own": 500000,
      "property": "3956925.0000"
    },
    "noExisting": {
      "room": 40000,
      "loan": 4609233
    },
    "existingEffect": {
      "without": 4609233,
      "with": 3456925,
      "difference": 1152308
    },
    "tenures": {
      "10": {
        "years": 10,
        "loan": 2419634,
        "emi": "29999.9988",
        "repaid": "3599999.8598",
        "interest": "1180365.8598"
      },
      "15": {
        "years": 15,
        "loan": 3046490,
        "emi": "29999.9922",
        "repaid": "5399998.5885",
        "interest": "2353508.5885"
      },
      "20": {
        "years": 20,
        "loan": 3456925,
        "emi": "29999.9983",
        "repaid": "7199999.5944",
        "interest": "3743074.5944"
      },
      "25": {
        "years": 25,
        "loan": 3725657,
        "emi": "29999.9992",
        "repaid": "8999999.7603",
        "interest": "5274342.7603"
      },
      "30": {
        "years": 30,
        "loan": 3901609,
        "emi": "29999.9977",
        "repaid": "10799999.1640",
        "interest": "6898390.1640"
      }
    },
    "tenureChange": {
      "loan10to30": "61.247899",
      "interest10to30Times": "5.84",
      "loan20to30": "12.863571",
      "interest20to30": "84.297427"
    },
    "rates": {
      "7.5": 3723963,
      "8.5": 3456925,
      "9.5": 3218431,
      "10.5": 3004868
    },
    "rateSteps": {
      "7.5to8.5": 267038,
      "8.5to9.5": 238494,
      "9.5to10.5": 213563
    },
    "incomeSplit": {
      "existing": 10000,
      "newEmiRoom": 30000,
      "rest": 60000
    }
  }
};

const N = Number;
const near = (a, b, label, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol, `${label}: ${a} vs ${b}`);
const run = (g) => calculateHomeLoan({
  income: N(g.input.income), existing: N(g.input.existing), share: N(g.input.share), rate: N(g.input.rate), years: g.input.years,
  own: g.input.own === null ? null : N(g.input.own),
});
const calc = (income, existing, share, rate, years, own = null) => calculateHomeLoan({ income, existing, share, rate, years, own });
const SCENARIOS = Object.entries(GOLDEN).filter(([key]) => key !== "articles");

describe("golden scenarios: the engine equals the independent reference", () => {
  for (const [name, g] of SCENARIOS) {
    test(name, () => {
      const r = run(g);
      near(r.capacity, N(g.capacity), "capacity");
      near(r.room, N(g.room), "room");
      assert.equal(r.noRoom, g.noRoom);
      assert.equal(r.loan, g.loan, "loan (exact)");
      near(r.emi, N(g.emi), "emi");
      near(r.totalRepayment, N(g.repaid), "total repayment");
      near(r.totalInterest, N(g.interest), "total interest");
      near(r.existingShare, N(g.existingShare) / 100, "existing share", 1e-8);
      if (g.property === null) assert.equal(r.property, null);
      else near(r.property, N(g.property), "property budget");
      assert.deepEqual(r.tenureRows.map((row) => row.years), g.tenureRows.map((row) => row.years));
      g.tenureRows.forEach((expected, i) => {
        const row = r.tenureRows[i];
        assert.equal(row.loan, expected.loan, `${name} ${expected.years}y loan (exact)`);
        near(row.interest, N(expected.interest), `${name} ${expected.years}y interest`);
        near(row.repaid, N(expected.repaid), `${name} ${expected.years}y repaid`);
        assert.equal(row.yours, expected.yours, `${name} ${expected.years}y marked`);
      });
    });
  }
});

describe("the cases the product has to get right", () => {
  test("the defaults: a 40,000 room fits a loan of 46,09,233 over 20 years at 8.5%", () => {
    const r = calc(100000, 0, 40, 8.5, 20);
    assert.equal(r.capacity, 40000);
    assert.equal(r.room, 40000);
    assert.equal(r.loan, 4609233);
    assert.equal(r.existingShare, 0);
    assert.equal(r.property, null);
    assert.ok(r.emi <= 40000 && r.emi > 39999.9);
  });

  test("existing EMIs reduce the room: 10,000 of them leave 30,000 and a loan of 34,56,925", () => {
    const r = calc(100000, 10000, 40, 8.5, 20, 500000);
    assert.equal(r.room, 30000);
    assert.equal(r.loan, 3456925);
    assert.equal(r.property, 3956925);
    near(r.existingShare, 0.1, "existing share", 1e-12);
    assert.equal(calc(100000, 0, 40, 8.5, 20).loan - r.loan, 1152308);
  });

  test("the loan is the LARGEST whole rupee whose EMI fits the room, and one rupee more does not", () => {
    // the EMI is worked out here with the plain formula in doubles, only to bracket the answer
    const emi = (p, rate, years) => {
      const i = rate / 1200;
      const n = years * 12;
      return i === 0 ? p / n : p * i * (1 + i) ** n / ((1 + i) ** n - 1);
    };
    for (const [income, existing, share, rate, years] of [[100000, 10000, 40, 8.5, 20], [87654.32, 1234.56, 37.5, 9.25, 15], [100000, 10000, 40, 8.5, 1], [33333.33, 0, 33.3, 7.35, 25], [250000, 0, 90, 30, 30]]) {
      const r = calc(income, existing, share, rate, years);
      assert.ok(emi(r.loan, rate, years) <= r.room + 1e-6, `${income}/${years}: the EMI is above the room`);
      assert.ok(emi(r.loan + 1, rate, years) > r.room - 1e-6, `${income}/${years}: one rupee more would still fit`);
      assert.ok(Number.isInteger(r.loan));
    }
  });

  test("the loan is rounded DOWN to a whole rupee, never to the nearest", () => {
    // 87,654.32 x 37.5% - 1,234.56 = 31,635.81 gives a loan of 30,73,848.xx over 15 years at 9.25%
    const r = calc(87654.32, 1234.56, 37.5, 9.25, 15);
    assert.equal(r.loan, 3073848);
    assert.ok(r.emi <= r.room);
  });

  test("no room is a valid result: existing EMIs at or above the chosen capacity give a loan of 0", () => {
    for (const [income, existing] of [[50000, 25000], [50000, 20000], [10000, 20000]]) {
      const r = calc(income, existing, 40, 8.5, 20);
      assert.equal(r.room, 0);
      assert.equal(r.noRoom, true);
      assert.equal(r.loan, 0);
      assert.equal(r.emi, 0);
      assert.equal(r.totalRepayment, 0);
      assert.equal(r.totalInterest, 0);
      assert.ok(r.tenureRows.every((row) => row.loan === 0 && row.interest === 0 && row.repaid === 0));
      assert.equal(validateHomeLoanInputs({ income: String(income), existing: String(existing), share: "40", rate: "8.5", years: "20", own: "" }).ok, true);
    }
    assert.equal(calc(10000, 20000, 40, 8.5, 20).existingShare, 2); // existing above income is a share above 100%
  });

  test("zero interest: the loan is the room times the months, with no interest and no division by zero", () => {
    const r = calc(100000, 10000, 40, 0, 20);
    assert.equal(r.loan, 7200000);
    assert.equal(r.totalInterest, 0);
    assert.equal(r.totalRepayment, 7200000);
    assert.equal(r.emi, 30000);
    assert.equal(calc(60000, 0, 50, 0, 30).loan, 10800000);
    assert.equal(calc(100001, 0, 33.3, 0, 7).loan, Math.floor(100001 * 33.3 / 100 * 84)); // floor(B * months) with a fractional room
  });

  test("a 1-year and a 30-year tenure, a tiny room and a large case", () => {
    assert.equal(calc(100000, 10000, 40, 8.5, 1).loan, 343958);
    assert.equal(calc(100000, 10000, 40, 8.5, 30).loan, 3901609);
    assert.equal(calc(1000, 0, 5, 30, 1).loan, 512); // a room of 50 a month
    assert.equal(calc(1000, 0, 1, 8.5, 20).loan, 1152); // the smallest income and share: a room of 10
    const big = calc(10000000, 500000, 90, 6.75, 30);
    assert.equal(big.loan, 1310518801);
    assert.ok(Number.isFinite(big.totalInterest) && big.totalInterest > 0);
  });

  test("total repayment is the EMI times the months and total interest is that less the loan", () => {
    for (const [income, existing, share, rate, years] of [[100000, 10000, 40, 8.5, 20], [100000, 0, 40, 8.5, 30], [87654.32, 1234.56, 37.5, 9.25, 15]]) {
      const r = calc(income, existing, share, rate, years);
      near(r.totalRepayment, r.emi * years * 12, "repayment = EMI x months", 0.01);
      near(r.totalInterest, r.totalRepayment - r.loan, "interest = repayment - loan", 1e-6);
      assert.ok(r.totalInterest > 0);
    }
  });
});

describe("own funds and the property budget", () => {
  test("blank means none; entered adds to the loan; zero adds nothing", () => {
    assert.equal(calc(100000, 10000, 40, 8.5, 20).property, null);
    assert.equal(calc(100000, 10000, 40, 8.5, 20, 500000).property, 3956925);
    assert.equal(calc(100000, 10000, 40, 8.5, 20, 0).property, 3456925);
    assert.equal(calc(50000, 25000, 40, 8.5, 20, 800000).property, 800000); // no loan fits, the own funds remain
  });
});

describe("the tenure rows", () => {
  test("10, 15, 20, 25 and 30 years with the same room, the entered tenure marked", () => {
    const r = calc(100000, 10000, 40, 8.5, 20);
    assert.deepEqual(TENURE_ROWS, [10, 15, 20, 25, 30]);
    assert.deepEqual(r.tenureRows.map((row) => row.years), [10, 15, 20, 25, 30]);
    assert.deepEqual(r.tenureRows.map((row) => row.loan), [2419634, 3046490, 3456925, 3725657, 3901609]);
    assert.deepEqual(r.tenureRows.map((row) => row.yours), [false, false, true, false, false]);
    assert.equal(r.tenureRows.find((row) => row.yours).loan, r.loan);
    near(r.tenureRows.find((row) => row.yours).interest, r.totalInterest, "the marked row equals the headline", 1e-6);
  });

  test("an entered tenure outside the five is added, sorted, and marked (at most six rows)", () => {
    const r = calc(100000, 10000, 40, 8.5, 18);
    assert.deepEqual(r.tenureRows.map((row) => row.years), [10, 15, 18, 20, 25, 30]);
    assert.deepEqual(r.tenureRows.map((row) => row.yours), [false, false, true, false, false, false]);
    assert.equal(r.tenureRows.length, 6);
    assert.equal(calc(100000, 10000, 40, 8.5, 1).tenureRows.length, 6);
    assert.equal(calc(100000, 10000, 40, 8.5, 25).tenureRows.length, 5);
  });

  test("a longer tenure never gives a smaller loan and always costs more interest", () => {
    for (const args of [[100000, 10000, 40, 8.5, 20], [100000, 0, 40, 0, 20], [250000, 0, 90, 30, 30], [87654.32, 1234.56, 37.5, 9.25, 15]]) {
      const rows = calc(...args).tenureRows;
      for (let i = 1; i < rows.length; i++) {
        assert.ok(rows[i].loan >= rows[i - 1].loan, `loan ${args}`);
        assert.ok(rows[i].interest >= rows[i - 1].interest - 1e-6, `interest ${args}`);
      }
    }
  });

  test("the trade-off in the example: 20 to 30 years adds about 13% to the loan and about 84% to the interest", () => {
    const rows = calc(100000, 10000, 40, 8.5, 20).tenureRows;
    const t20 = rows.find((row) => row.years === 20);
    const t30 = rows.find((row) => row.years === 30);
    near(t30.loan / t20.loan - 1, 0.12863571, "loan", 1e-8);
    near(t30.interest / t20.interest - 1, 0.84297427, "interest", 1e-8);
  });
});

describe("invariants over a wide grid", () => {
  test("the loan rises with income, share and tenure and falls with rate and with existing EMIs", () => {
    const base = calc(100000, 10000, 40, 8.5, 20).loan;
    assert.ok(calc(110000, 10000, 40, 8.5, 20).loan > base);
    assert.ok(calc(100000, 10000, 45, 8.5, 20).loan > base);
    assert.ok(calc(100000, 10000, 40, 8.5, 25).loan > base);
    assert.ok(calc(100000, 10000, 40, 9.5, 20).loan < base);
    assert.ok(calc(100000, 15000, 40, 8.5, 20).loan < base);
  });

  test("the rate effect: the same room borrows less as the rate rises", () => {
    assert.deepEqual([7.5, 8.5, 9.5, 10.5].map((rate) => calc(100000, 10000, 40, rate, 20).loan), [3723963, 3456925, 3218431, 3004868]);
  });

  test("a bigger loan than the room allows is never returned, over a grid", () => {
    for (const income of [1000, 33333.33, 100000, 9999999]) {
      for (const share of [1, 33.3, 90]) {
        for (const rate of [0, 0.5, 8.5, 30]) {
          for (const years of [1, 7, 30]) {
            const r = calc(income, 0, share, rate, years);
            assert.ok(Number.isInteger(r.loan) && r.loan >= 0);
            if (r.loan > 0) assert.ok(r.emi <= r.room + 1e-6, `${income}/${share}/${rate}/${years}`);
          }
        }
      }
    }
  });
});

describe("validation (the rules and messages belong to the tool)", () => {
  const ok = { income: "100000", existing: "", share: "40", rate: "8.5", years: "20", own: "" };

  test("valid input comes back as numbers; blank existing EMIs mean 0 and blank own funds mean none", () => {
    const v = validateHomeLoanInputs(ok);
    assert.equal(v.ok, true);
    assert.deepEqual(v.values, { income: 100000, existing: 0, share: 40, rate: 8.5, years: 20, own: null });
    assert.deepEqual(validateHomeLoanInputs({ ...ok, existing: "10000", own: "500000" }).values, { income: 100000, existing: 10000, share: 40, rate: 8.5, years: 20, own: 500000 });
  });

  test("the limits are the documented ones, and the boundaries are valid", () => {
    assert.deepEqual(HOME_LOAN_LIMITS.income, { min: 1000, max: 10000000 });
    assert.deepEqual(HOME_LOAN_LIMITS.existing, { min: 0, max: 10000000 });
    assert.deepEqual(HOME_LOAN_LIMITS.share, { min: 1, max: 90 });
    assert.deepEqual(HOME_LOAN_LIMITS.rate, { min: 0, max: 30 });
    assert.deepEqual(HOME_LOAN_LIMITS.years, { min: 1, max: 30 });
    assert.deepEqual(HOME_LOAN_LIMITS.own, { min: 0, max: 1000000000 });
    for (const input of [
      { ...ok, income: "1000" }, { ...ok, income: "10000000" }, { ...ok, existing: "0" }, { ...ok, existing: "10000000" },
      { ...ok, share: "1" }, { ...ok, share: "90" }, { ...ok, rate: "0" }, { ...ok, rate: "30" }, { ...ok, years: "1" }, { ...ok, years: "30" },
      { ...ok, own: "0" }, { ...ok, own: "1000000000" },
    ]) assert.equal(validateHomeLoanInputs(input).ok, true, JSON.stringify(input));
  });

  test("each field has its own error and negative values are rejected everywhere", () => {
    const bad = (input, field) => {
      const v = validateHomeLoanInputs(input);
      assert.equal(v.ok, false, JSON.stringify(input));
      assert.ok(v.errors.some((e) => e.fields.includes(field) && e.message.length > 10), `${field}: ${JSON.stringify(v.errors)}`);
    };
    for (const income of ["", "0", "999", "-5", "10000001", "abc"]) bad({ ...ok, income }, "income");
    for (const share of ["", "0", "0.9", "91", "-1", "x"]) bad({ ...ok, share }, "share");
    for (const rate of ["", "-0.1", "30.1", "x"]) bad({ ...ok, rate }, "rate");
    for (const years of ["", "0", "31", "1.5", "-2", "x"]) bad({ ...ok, years }, "years");
    for (const existing of ["-1", "10000001", "x"]) bad({ ...ok, existing }, "existing");
    for (const own of ["-1", "1000000001", "x"]) bad({ ...ok, own }, "own");
  });

  test("zero existing EMIs, zero rate and blank own funds are valid", () => {
    assert.equal(validateHomeLoanInputs({ ...ok, existing: "0", rate: "0" }).ok, true);
  });

  test("several problems are reported together", () => {
    const v = validateHomeLoanInputs({ income: "0", existing: "-1", share: "0", rate: "-1", years: "1.5", own: "-5" });
    assert.equal(v.ok, false);
    assert.deepEqual(v.errors.flatMap((e) => e.fields).sort(), ["existing", "income", "own", "rate", "share", "years"]);
  });
});
