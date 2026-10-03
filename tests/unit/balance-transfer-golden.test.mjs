/**
 * Tool Pack 2: the Loan Balance Transfer engine (formulas/balance-transfer.js).
 *
 * GOLDEN holds the expected values of the independent reference, tests/fixtures/balance-transfer-golden.py
 * (Python decimal, 60 digits; each loan is simulated month by month, the cumulative position is built by adding
 * month after month, the break-even month is found by scanning, the break-even rate by bisection; the script
 * asserts that its own schedules end at zero and that the final position equals the net saving). They were NOT
 * produced by the code under test. Regenerate with:  python tests/fixtures/balance-transfer-golden.py
 *
 * Money is compared to a cent (the reference prints four decimals), break-even months exactly, rates to 1e-6.
 */
const GOLDEN = {
  "base-same-tenure": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 180,
      "currentCharges": 0,
      "newCharges": 17500
    },
    "currentEmi": "26105.6171",
    "newEmi": "24618.4889",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "1931328.0107",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4448828.0107",
    "netSaving": "250183.0622",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 12
    },
    "emiChange": "1487.1281",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "9.435493684"
    },
    "yearly": [
      {
        "year": 0,
        "paidCurrent": "0.0000",
        "paidNew": "0.0000",
        "charges": "17500.0000",
        "position": "-17500.0000"
      },
      {
        "year": 1,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "345.5375"
      },
      {
        "year": 2,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "18191.0750"
      },
      {
        "year": 3,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "36036.6124"
      },
      {
        "year": 4,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "53882.1499"
      },
      {
        "year": 5,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "71727.6874"
      },
      {
        "year": 6,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "89573.2249"
      },
      {
        "year": 7,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "107418.7624"
      },
      {
        "year": 8,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "125264.2999"
      },
      {
        "year": 9,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "143109.8373"
      },
      {
        "year": 10,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "160955.3748"
      },
      {
        "year": 11,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "178800.9123"
      },
      {
        "year": 12,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "196646.4498"
      },
      {
        "year": 13,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "214491.9873"
      },
      {
        "year": 14,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "232337.5247"
      },
      {
        "year": 15,
        "paidCurrent": "313267.4049",
        "paidNew": "295421.8674",
        "charges": "0.0000",
        "position": "250183.0622"
      }
    ]
  },
  "longer-tenure": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 240,
      "currentCharges": 0,
      "newCharges": 17500
    },
    "currentEmi": "26105.6171",
    "newEmi": "21695.5808",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "2706939.4002",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "5224439.4002",
    "netSaving": "-525428.3273",
    "outcome": "temporary",
    "breakEven": {
      "kind": "months",
      "month": 4
    },
    "emiChange": "4410.0362",
    "sameTenure": {
      "emi": "24618.4889",
      "netSaving": "250183.0622",
      "outcome": "saving",
      "breakEven": {
        "kind": "months",
        "month": 12
      }
    },
    "breakEvenRate": {
      "kind": "rate",
      "rate": "7.082385402"
    },
    "yearly": [
      {
        "year": 0,
        "paidCurrent": "0.0000",
        "paidNew": "0.0000",
        "charges": "17500.0000",
        "position": "-17500.0000"
      },
      {
        "year": 1,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "35420.4348"
      },
      {
        "year": 2,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "88340.8697"
      },
      {
        "year": 3,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "141261.3045"
      },
      {
        "year": 4,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "194181.7394"
      },
      {
        "year": 5,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "247102.1742"
      },
      {
        "year": 6,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "300022.6091"
      },
      {
        "year": 7,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "352943.0439"
      },
      {
        "year": 8,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "405863.4788"
      },
      {
        "year": 9,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "458783.9136"
      },
      {
        "year": 10,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "511704.3485"
      },
      {
        "year": 11,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "564624.7833"
      },
      {
        "year": 12,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "617545.2182"
      },
      {
        "year": 13,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "670465.6530"
      },
      {
        "year": 14,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "723386.0879"
      },
      {
        "year": 15,
        "paidCurrent": "313267.4049",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "776306.5227"
      },
      {
        "year": 16,
        "paidCurrent": "0.0000",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "515959.5527"
      },
      {
        "year": 17,
        "paidCurrent": "0.0000",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "255612.5827"
      },
      {
        "year": 18,
        "paidCurrent": "0.0000",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "-4734.3873"
      },
      {
        "year": 19,
        "paidCurrent": "0.0000",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "-265081.3573"
      },
      {
        "year": 20,
        "paidCurrent": "0.0000",
        "paidNew": "260346.9700",
        "charges": "0.0000",
        "position": "-525428.3273"
      }
    ]
  },
  "shorter-tenure": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 120,
      "currentCharges": 0,
      "newCharges": 17500
    },
    "currentEmi": "26105.6171",
    "newEmi": "30996.4222",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "1219570.6662",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "3737070.6662",
    "netSaving": "961940.4067",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 144
    },
    "emiChange": "-4890.8051",
    "sameTenure": {
      "emi": "24618.4889",
      "netSaving": "250183.0622",
      "outcome": "saving",
      "breakEven": {
        "kind": "months",
        "month": 12
      }
    },
    "breakEvenRate": {
      "kind": "rate",
      "rate": "14.130222276"
    }
  },
  "zero-charges": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 180,
      "currentCharges": 0,
      "newCharges": 0
    },
    "currentEmi": "26105.6171",
    "newEmi": "24618.4889",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "1931328.0107",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4431328.0107",
    "netSaving": "267683.0622",
    "outcome": "saving",
    "breakEven": {
      "kind": "immediate",
      "month": 1
    },
    "emiChange": "1487.1281",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "9.500000000"
    }
  },
  "both-lenders-charge": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 180,
      "currentCharges": 50000,
      "newCharges": 17500
    },
    "currentEmi": "26105.6171",
    "newEmi": "24618.4889",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "1931328.0107",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4498828.0107",
    "netSaving": "200183.0622",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 46
    },
    "emiChange": "1487.1281",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "9.250540629"
    }
  },
  "same-rate": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "9.5",
      "newMonths": 180,
      "currentCharges": 0,
      "newCharges": 17500
    },
    "currentEmi": "26105.6171",
    "newEmi": "26105.6171",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "2199011.0729",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4716511.0729",
    "netSaving": "-17500.0000",
    "outcome": "loss",
    "breakEven": {
      "kind": "never",
      "month": null
    },
    "emiChange": "0.0000",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "9.435493684"
    }
  },
  "higher-rate": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "10.5",
      "newMonths": 180,
      "currentCharges": 0,
      "newCharges": 17500
    },
    "currentEmi": "26105.6171",
    "newEmi": "27634.9731",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "2474295.1566",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4991795.1566",
    "netSaving": "-292784.0838",
    "outcome": "loss",
    "breakEven": {
      "kind": "never",
      "month": null
    },
    "emiChange": "-1529.3560",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "9.435493684"
    }
  },
  "charges-eliminate-saving": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 180,
      "currentCharges": 0,
      "newCharges": 400000
    },
    "currentEmi": "26105.6171",
    "newEmi": "24618.4889",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "1931328.0107",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4831328.0107",
    "netSaving": "-132316.9378",
    "outcome": "loss",
    "breakEven": {
      "kind": "never",
      "month": null
    },
    "emiChange": "1487.1281",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "7.994520736"
    }
  },
  "small-drop": {
    "input": {
      "balance": 1000000,
      "currentRate": "8.5",
      "currentMonths": 120,
      "newRate": "8.4",
      "newMonths": 120,
      "currentCharges": 0,
      "newCharges": 5000
    },
    "currentEmi": "12398.5689",
    "newEmi": "12345.1502",
    "currentTotalInterest": "487828.2665",
    "newTotalInterest": "481418.0196",
    "currentOutgo": "1487828.2665",
    "effectiveNewOutgo": "1486418.0196",
    "netSaving": "1410.2469",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 94
    },
    "emiChange": "53.4187",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "8.422020473"
    }
  },
  "large-long": {
    "input": {
      "balance": 50000000,
      "currentRate": "11",
      "currentMonths": 360,
      "newRate": "8.5",
      "newMonths": 360,
      "currentCharges": 0,
      "newCharges": 250000
    },
    "currentEmi": "476161.6978",
    "newEmi": "384456.7418",
    "currentTotalInterest": "121418211.2061",
    "newTotalInterest": "88404427.0452",
    "currentOutgo": "171418211.2061",
    "effectiveNewOutgo": "138654427.0452",
    "netSaving": "32763784.1609",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 3
    },
    "emiChange": "91704.9560",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "10.981615945"
    },
    "yearly": [
      {
        "year": 0,
        "paidCurrent": "0.0000",
        "paidNew": "0.0000",
        "charges": "250000.0000",
        "position": "-250000.0000"
      },
      {
        "year": 1,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "850459.4720"
      },
      {
        "year": 2,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "1950918.9441"
      },
      {
        "year": 3,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "3051378.4161"
      },
      {
        "year": 4,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "4151837.8881"
      },
      {
        "year": 5,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "5252297.3602"
      },
      {
        "year": 6,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "6352756.8322"
      },
      {
        "year": 7,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "7453216.3042"
      },
      {
        "year": 8,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "8553675.7762"
      },
      {
        "year": 9,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "9654135.2483"
      },
      {
        "year": 10,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "10754594.7203"
      },
      {
        "year": 11,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "11855054.1923"
      },
      {
        "year": 12,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "12955513.6644"
      },
      {
        "year": 13,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "14055973.1364"
      },
      {
        "year": 14,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "15156432.6084"
      },
      {
        "year": 15,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "16256892.0805"
      },
      {
        "year": 16,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "17357351.5525"
      },
      {
        "year": 17,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "18457811.0245"
      },
      {
        "year": 18,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "19558270.4965"
      },
      {
        "year": 19,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "20658729.9686"
      },
      {
        "year": 20,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "21759189.4406"
      },
      {
        "year": 21,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "22859648.9126"
      },
      {
        "year": 22,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "23960108.3847"
      },
      {
        "year": 23,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "25060567.8567"
      },
      {
        "year": 24,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "26161027.3287"
      },
      {
        "year": 25,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "27261486.8008"
      },
      {
        "year": 26,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "28361946.2728"
      },
      {
        "year": 27,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "29462405.7448"
      },
      {
        "year": 28,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "30562865.2169"
      },
      {
        "year": 29,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "31663324.6889"
      },
      {
        "year": 30,
        "paidCurrent": "5713940.3735",
        "paidNew": "4613480.9015",
        "charges": "0.0000",
        "position": "32763784.1609"
      }
    ]
  },
  "short-remaining": {
    "input": {
      "balance": 200000,
      "currentRate": "12",
      "currentMonths": 6,
      "newRate": "10",
      "newMonths": 6,
      "currentCharges": 0,
      "newCharges": 2000
    },
    "currentEmi": "34509.6733",
    "newEmi": "34312.2788",
    "currentTotalInterest": "7058.0401",
    "newTotalInterest": "5873.6730",
    "currentOutgo": "207058.0401",
    "effectiveNewOutgo": "207873.6730",
    "netSaving": "-815.6330",
    "outcome": "loss",
    "breakEven": {
      "kind": "never",
      "month": null
    },
    "emiChange": "197.3945",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "8.619517347"
    }
  },
  "one-month-left": {
    "input": {
      "balance": 50000,
      "currentRate": "12",
      "currentMonths": 1,
      "newRate": "9",
      "newMonths": 1,
      "currentCharges": 0,
      "newCharges": 100
    },
    "currentEmi": "50500.0000",
    "newEmi": "50375.0000",
    "currentTotalInterest": "500.0000",
    "newTotalInterest": "375.0000",
    "currentOutgo": "50500.0000",
    "effectiveNewOutgo": "50475.0000",
    "netSaving": "25.0000",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 1
    },
    "emiChange": "125.0000",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "9.600000000"
    }
  },
  "higher-rate-shorter": {
    "input": {
      "balance": 2500000,
      "currentRate": "8.5",
      "currentMonths": 240,
      "newRate": "9.5",
      "newMonths": 120,
      "currentCharges": 0,
      "newCharges": 0
    },
    "currentEmi": "21695.5808",
    "newEmi": "32349.3894",
    "currentTotalInterest": "2706939.4002",
    "newTotalInterest": "1381926.7268",
    "currentOutgo": "5206939.4002",
    "effectiveNewOutgo": "3881926.7268",
    "netSaving": "1325012.6734",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 179
    },
    "emiChange": "-10653.8086",
    "sameTenure": {
      "emi": "23303.2797",
      "netSaving": "-385847.7268",
      "outcome": "loss",
      "breakEven": {
        "kind": "never",
        "month": null
      }
    },
    "breakEvenRate": {
      "kind": "rate",
      "rate": "16.963217677"
    }
  },
  "near-zero": {
    "input": {
      "balance": 2500000,
      "currentRate": "9.5",
      "currentMonths": 180,
      "newRate": "8.5",
      "newMonths": 180,
      "currentCharges": 0,
      "newCharges": 267683
    },
    "currentEmi": "26105.6171",
    "newEmi": "24618.4889",
    "currentTotalInterest": "2199011.0729",
    "newTotalInterest": "1931328.0107",
    "currentOutgo": "4699011.0729",
    "effectiveNewOutgo": "4699011.0107",
    "netSaving": "0.0622",
    "outcome": "neutral",
    "breakEven": {
      "kind": "none",
      "month": null
    },
    "emiChange": "1487.1281",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "8.500000236"
    }
  },
  "low-interest": {
    "input": {
      "balance": 3000000,
      "currentRate": "1",
      "currentMonths": 240,
      "newRate": "0.5",
      "newMonths": 240,
      "currentCharges": 0,
      "newCharges": 10000
    },
    "currentEmi": "13796.8292",
    "newEmi": "13138.0167",
    "currentTotalInterest": "311239.0101",
    "newTotalInterest": "153124.0196",
    "currentOutgo": "3311239.0101",
    "effectiveNewOutgo": "3163124.0196",
    "netSaving": "148114.9905",
    "outcome": "saving",
    "breakEven": {
      "kind": "months",
      "month": 16
    },
    "emiChange": "658.8125",
    "breakEvenRate": {
      "kind": "rate",
      "rate": "0.968837698"
    }
  }
};

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateBalanceTransfer,
  validateBalanceTransferInputs,
  findBreakEvenRate,
  BALANCE_TRANSFER_LIMITS,
  BREAK_EVEN_EPS,
  NEUTRAL_TOLERANCE,
} from "../../assets/js/calculators/formulas/balance-transfer.js";
import { calculateEMI, calculateTotalInterest } from "../../assets/js/calculators/formulas/loan.js";

const num = (s) => Number(s);
const near = (actual, expected, label, tolerance = 0.0101) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected} (tolerance ${tolerance})`);

const run = (g) => calculateBalanceTransfer({
  balance: g.input.balance, currentRate: num(g.input.currentRate), currentMonths: g.input.currentMonths,
  newRate: num(g.input.newRate), newMonths: g.input.newMonths, currentCharges: g.input.currentCharges, newCharges: g.input.newCharges,
});
const values = (over = {}) => ({ balance: 2500000, currentRate: 9.5, currentMonths: 180, newRate: 8.5, newMonths: 180, currentCharges: 0, newCharges: 17500, ...over });

describe("golden scenarios: the engine equals the independent reference (to the paisa)", () => {
  for (const [name, g] of Object.entries(GOLDEN)) {
    test(name, () => {
      const r = run(g);
      near(r.current.emi, num(g.currentEmi), "current EMI", 0.0002);
      near(r.proposed.emi, num(g.newEmi), "new EMI", 0.0002);
      near(r.current.totalInterest, num(g.currentTotalInterest), "current interest");
      near(r.proposed.totalInterest, num(g.newTotalInterest), "new interest");
      near(r.current.totalOutgo, num(g.currentOutgo), "current outgo");
      near(r.proposed.effectiveOutgo, num(g.effectiveNewOutgo), "effective new outgo");
      near(r.decision.netSaving, num(g.netSaving), "net saving");
      near(r.decision.emiChange, num(g.emiChange), "EMI change", 0.0002);
      assert.equal(r.decision.outcome, g.outcome, "outcome");
      assert.equal(r.decision.breakEven.kind, g.breakEven.kind, "break-even kind");
      assert.equal(r.decision.breakEven.month, g.breakEven.month, "break-even month");
      assert.equal(r.breakEvenRate.kind, g.breakEvenRate.kind, "break-even rate kind");
      if (g.breakEvenRate.rate !== null) near(r.breakEvenRate.rate, num(g.breakEvenRate.rate), "break-even rate", 1e-6);
      if (g.sameTenure) {
        assert.ok(r.sameTenure, "same-tenure comparison present when the tenures differ");
        near(r.sameTenure.emi, num(g.sameTenure.emi), "same-tenure EMI", 0.0002);
        near(r.sameTenure.netSaving, num(g.sameTenure.netSaving), "same-tenure net saving");
        assert.equal(r.sameTenure.outcome, g.sameTenure.outcome);
        assert.equal(r.sameTenure.breakEven.month, g.sameTenure.breakEven.month);
      } else {
        assert.equal(r.sameTenure, null, "no same-tenure comparison when the tenures match");
      }
      if (g.yearly) {
        assert.equal(r.yearly.length, g.yearly.length, "yearly rows");
        g.yearly.forEach((row, i) => {
          assert.equal(r.yearly[i].year, row.year);
          near(r.yearly[i].paidCurrent, num(row.paidCurrent), `year ${row.year} paid on the current loan`);
          near(r.yearly[i].paidNew, num(row.paidNew), `year ${row.year} paid on the new loan`);
          near(r.yearly[i].charges, num(row.charges), `year ${row.year} charges`);
          near(r.yearly[i].position, num(row.position), `year ${row.year} position`);
        });
      }
    });
  }
});

describe("the cases the product has to get right", () => {
  test("same-tenure positive saving: the base case of the specification", () => {
    const r = calculateBalanceTransfer(values());
    near(r.current.emi, 26105.6171, "current EMI", 0.001);
    near(r.proposed.emi, 24618.4889, "new EMI", 0.001);
    assert.equal(r.decision.outcome, "saving");
    assert.equal(r.decision.breakEven.month, 12);
    assert.equal(r.decision.breakEven.kind, "months");
    assert.equal(r.sameTenure, null);
    // the new loan's interest is the same figure the Prepayment tool's reference has for 25,00,000 at 8.5% over 15 years
    near(r.proposed.totalInterest, 1931328.01, "new total interest");
  });

  test("a longer tenure: lower EMI, higher overall cost, a temporary saving", () => {
    const r = calculateBalanceTransfer(values({ newMonths: 240 }));
    assert.ok(r.decision.emiChange > 4000, "the EMI falls by more than 4,000 a month");
    assert.ok(r.decision.netSaving < 0, "but the total is worse");
    assert.equal(r.decision.outcome, "temporary");
    assert.equal(r.decision.breakEven.month, 4);
    assert.equal(r.decision.longerTenure, true);
    assert.equal(r.decision.lowerEmiHigherCost, true);
    assert.equal(r.decision.tenureChangeMonths, -60);
    // the same-tenure check shows the lower rate really would save money
    assert.equal(r.sameTenure.outcome, "saving");
    near(r.sameTenure.netSaving, 250183.06, "same-tenure net saving");
  });

  test("a shorter tenure: a higher EMI and a real saving", () => {
    const r = calculateBalanceTransfer(values({ newMonths: 120 }));
    assert.ok(r.decision.emiChange < 0, "the EMI rises");
    assert.equal(r.decision.outcome, "saving");
    assert.equal(r.decision.shorterTenure, true);
    assert.equal(r.decision.lowerEmiHigherCost, false);
    assert.equal(r.decision.tenureChangeMonths, 60);
  });

  test("charges reduce the saving one for one; enough charges eliminate it (no break-even, lower EMI, higher cost)", () => {
    const none = calculateBalanceTransfer(values({ newCharges: 0 }));
    const some = calculateBalanceTransfer(values({ newCharges: 100000 }));
    near(none.decision.netSaving - some.decision.netSaving, 100000, "one for one", 1e-6);
    const heavy = calculateBalanceTransfer(values({ newCharges: 400000 }));
    assert.equal(heavy.decision.outcome, "loss");
    assert.equal(heavy.decision.breakEven.kind, "never");
    assert.equal(heavy.decision.lowerEmiHigherCost, true);
  });

  test("charges at either lender count the same", () => {
    const a = calculateBalanceTransfer(values({ currentCharges: 17500, newCharges: 0 }));
    const b = calculateBalanceTransfer(values({ currentCharges: 0, newCharges: 17500 }));
    assert.equal(a.decision.netSaving, b.decision.netSaving);
    assert.equal(a.proposed.charges, 17500);
  });

  test("zero charges and a lower rate: break-even is immediate (month 1)", () => {
    const r = calculateBalanceTransfer(values({ newCharges: 0 }));
    assert.deepEqual(r.decision.breakEven, { kind: "immediate", month: 1 });
  });

  test("the new rate equal to the current rate: only the charges are lost", () => {
    const r = calculateBalanceTransfer(values({ newRate: 9.5 }));
    near(r.decision.netSaving, -17500, "net saving", 1e-6);
    assert.equal(r.decision.outcome, "loss");
    assert.equal(r.decision.emiChange, 0);
    assert.equal(r.decision.lowerEmi, false);
    assert.equal(r.decision.lowerEmiHigherCost, false, "the EMI is not lower, so this is not the lower-EMI trap");
  });

  test("the new rate equal and no charges at all: no difference, no break-even to talk about", () => {
    const r = calculateBalanceTransfer(values({ newRate: 9.5, newCharges: 0 }));
    assert.equal(r.decision.outcome, "neutral");
    assert.equal(r.decision.breakEven.kind, "none");
  });

  test("the new rate higher than the current rate, same tenure: a loss that never breaks even", () => {
    const r = calculateBalanceTransfer(values({ newRate: 10.5 }));
    assert.equal(r.decision.outcome, "loss");
    assert.equal(r.decision.breakEven.kind, "never");
    assert.ok(r.decision.emiChange < 0);
  });

  test("a higher rate over a much shorter tenure can still cost less overall, and breaks even late", () => {
    const r = calculateBalanceTransfer({ balance: 2500000, currentRate: 8.5, currentMonths: 240, newRate: 9.5, newMonths: 120, currentCharges: 0, newCharges: 0 });
    assert.equal(r.decision.outcome, "saving");
    assert.equal(r.decision.breakEven.month, 179);
    assert.equal(r.sameTenure.outcome, "loss", "at the same tenure the higher rate loses");
  });
});

describe("tolerances are explicit", () => {
  test("a net saving smaller than one rupee is 'no difference'", () => {
    assert.equal(NEUTRAL_TOLERANCE, 1);
    const r = calculateBalanceTransfer(values({ newCharges: 267683 })); // 0.06 rupee short of the interest saved
    assert.equal(r.decision.outcome, "neutral");
    assert.ok(Math.abs(r.decision.netSaving) < 1);
    assert.equal(r.decision.breakEven.kind, "none");
  });

  test("one rupee or more is a difference", () => {
    const r = calculateBalanceTransfer(values({ newCharges: 267680 })); // about 3 rupees saved
    assert.equal(r.decision.outcome, "saving");
    const loss = calculateBalanceTransfer(values({ newCharges: 267686 }));
    assert.ok(["loss", "temporary"].includes(loss.decision.outcome));
    assert.ok(loss.decision.netSaving < -1);
  });

  test("a cumulative position within half a paisa of zero counts as zero (the break-even epsilon)", () => {
    assert.equal(BREAK_EVEN_EPS, 0.005);
  });

  test("floating-point noise cannot move the break-even month: charges of exactly k months of saving break even in month k", () => {
    // equal EMIs saved every month, so charges = k * saving breaks even exactly at month k
    for (const k of [1, 2, 3, 7, 12]) {
      const base = calculateBalanceTransfer(values({ newCharges: 0 }));
      const saving = base.decision.emiChange;
      const r = calculateBalanceTransfer(values({ newCharges: saving * k }));
      assert.equal(r.decision.breakEven.month, k, `k = ${k}`);
    }
  });
});

describe("the break-even rate", () => {
  test("it is the rate at which the net saving is zero, and a lower rate saves", () => {
    for (const over of [{}, { newMonths: 240 }, { newMonths: 120 }, { newCharges: 100000 }, { currentCharges: 50000 }]) {
      const v = values(over);
      const { kind, rate } = findBreakEvenRate(v);
      assert.equal(kind, "rate");
      near(calculateBalanceTransfer({ ...v, newRate: rate }).decision.netSaving, 0, "net saving at the break-even rate", 0.01);
      assert.ok(calculateBalanceTransfer({ ...v, newRate: rate - 0.05 }).decision.netSaving > 0);
      assert.ok(calculateBalanceTransfer({ ...v, newRate: rate + 0.05 }).decision.netSaving < 0);
    }
  });

  test("none: charges so large that even the lowest allowed rate does not pay back", () => {
    assert.deepEqual(findBreakEvenRate(values({ newCharges: 100000000 })), { kind: "none", rate: null });
  });

  test("always: a much shorter new tenure pays back even at the highest allowed rate", () => {
    const r = findBreakEvenRate({ balance: 2500000, currentRate: 30, currentMonths: 480, newRate: 8.5, newMonths: 12, currentCharges: 0, newCharges: 0 });
    assert.equal(r.kind, "always");
  });

  test("a longer new tenure lowers the break-even rate (the EMI relief has to come from the rate)", () => {
    assert.ok(findBreakEvenRate(values({ newMonths: 240 })).rate < findBreakEvenRate(values()).rate);
  });
});

describe("invariants over a wide grid of loans", () => {
  const grid = [];
  for (const balance of [50000, 2500000, 90000000])
    for (const r0 of [0.5, 8.5, 24])
      for (const drop of [-2, 0, 0.5, 3])
        for (const n0 of [1, 7, 60, 240, 480])
          for (const n1 of [1, 6, 60, 240, 480])
            for (const charges of [0, 1000, 150000]) {
              const r1 = Math.min(30, Math.max(0.1, r0 - drop));
              grid.push({ balance, currentRate: r0, currentMonths: n0, newRate: r1, newMonths: n1, currentCharges: charges / 2, newCharges: charges / 2 });
            }

  test("the grid is large", () => {
    assert.ok(grid.length > 2000, String(grid.length));
  });

  test("the last row of the yearly table equals the net saving; the first is minus the charges; the years are consecutive", () => {
    for (const v of grid) {
      const r = calculateBalanceTransfer(v);
      const last = r.yearly.at(-1);
      near(last.position, r.decision.netSaving, "last position", 1e-6 * v.balance);
      near(r.yearly[0].position, -(v.currentCharges + v.newCharges), "start row", 1e-9);
      r.yearly.forEach((row, i) => assert.equal(row.year, i));
      assert.equal(r.yearly.length, Math.ceil(Math.max(v.currentMonths, v.newMonths) / 12) + 1);
    }
  });

  test("the yearly payments add up to each loan's total", () => {
    for (const v of grid) {
      const r = calculateBalanceTransfer(v);
      near(r.yearly.reduce((a, row) => a + row.paidCurrent, 0), r.current.totalOutgo, "current payments", 1e-6 * v.balance);
      near(r.yearly.reduce((a, row) => a + row.paidNew, 0), r.proposed.totalRepayment, "new payments", 1e-6 * v.balance);
    }
  });

  test("the break-even month is the FIRST month the cumulative position is back at zero (found by direct summation)", () => {
    for (const v of grid) {
      const r = calculateBalanceTransfer(v);
      const e0 = calculateEMI(v.balance, v.currentRate, v.currentMonths / 12);
      const e1 = calculateEMI(v.balance, v.newRate, v.newMonths / 12);
      let s = -(v.currentCharges + v.newCharges);
      let first = null;
      for (let m = 1; m <= Math.max(v.currentMonths, v.newMonths); m++) {
        s += (m <= v.currentMonths ? e0 : 0) - (m <= v.newMonths ? e1 : 0);
        if (first === null && s >= -BREAK_EVEN_EPS) first = m;
      }
      const be = r.decision.breakEven;
      if (be.kind === "months" || be.kind === "immediate") assert.equal(be.month, first, JSON.stringify(v));
      else if (be.kind === "never") assert.equal(first, null, JSON.stringify(v));
    }
  });

  test("outcome, break-even and the lower-EMI flag agree with each other", () => {
    for (const v of grid) {
      const r = calculateBalanceTransfer(v);
      const net = r.decision.netSaving;
      if (Math.abs(net) < NEUTRAL_TOLERANCE) assert.equal(r.decision.outcome, "neutral");
      else if (net > 0) { assert.equal(r.decision.outcome, "saving"); assert.notEqual(r.decision.breakEven.kind, "never"); }
      else assert.ok(["loss", "temporary"].includes(r.decision.outcome));
      assert.equal(r.decision.outcome === "loss", r.decision.breakEven.kind === "never" && net < 0 && Math.abs(net) >= NEUTRAL_TOLERANCE);
      assert.equal(r.decision.lowerEmiHigherCost, r.decision.lowerEmi && net < 0 && Math.abs(net) >= NEUTRAL_TOLERANCE);
      assert.equal(r.sameTenure === null, v.newMonths === v.currentMonths);
    }
  });

  test("net saving falls as the charges rise, and as the new rate rises", () => {
    for (const v of grid.filter((_, i) => i % 40 === 0)) {
      const base = calculateBalanceTransfer(v).decision.netSaving;
      assert.ok(calculateBalanceTransfer({ ...v, newCharges: v.newCharges + 500 }).decision.netSaving < base);
      if (v.newRate + 0.5 <= 30) assert.ok(calculateBalanceTransfer({ ...v, newRate: v.newRate + 0.5 }).decision.netSaving < base);
    }
  });

  test("the totals are the existing loan formulas, not a second copy", () => {
    for (const v of grid.filter((_, i) => i % 25 === 0)) {
      const r = calculateBalanceTransfer(v);
      near(r.current.totalInterest, calculateTotalInterest(v.balance, v.currentRate, v.currentMonths / 12), "current interest", 1e-6 * v.balance);
      near(r.proposed.totalInterest, calculateTotalInterest(v.balance, v.newRate, v.newMonths / 12), "new interest", 1e-6 * v.balance);
    }
  });

  test("each loan's schedule ends at zero: the final balance does not drift", () => {
    for (const v of grid.filter((_, i) => i % 15 === 0)) {
      const r = calculateBalanceTransfer(v);
      for (const [rate, months, emi] of [[v.currentRate, v.currentMonths, r.current.emi], [v.newRate, v.newMonths, r.proposed.emi]]) {
        let balance = v.balance;
        for (let m = 0; m < months; m++) balance = balance * (1 + rate / 1200) - emi;
        assert.ok(Math.abs(balance) < 1e-6 * v.balance + 1e-6, `${JSON.stringify(v)}: ${balance}`);
      }
    }
  });

  test("the same input always gives the same answer, and the input is not changed", () => {
    const v = values();
    const copy = JSON.stringify(v);
    assert.deepEqual(calculateBalanceTransfer(v), calculateBalanceTransfer(v));
    assert.equal(JSON.stringify(v), copy);
  });
});

describe("boundaries", () => {
  test("the smallest and largest loans, rates and tenures calculate", () => {
    for (const v of [
      { balance: 1000, currentRate: 0.1, currentMonths: 1, newRate: 0.1, newMonths: 1, currentCharges: 0, newCharges: 0 },
      { balance: 100000000, currentRate: 30, currentMonths: 480, newRate: 30, newMonths: 480, currentCharges: 100000000, newCharges: 100000000 },
      { balance: 100000000, currentRate: 30, currentMonths: 480, newRate: 0.1, newMonths: 1, currentCharges: 0, newCharges: 0 },
    ]) {
      const r = calculateBalanceTransfer(v);
      for (const x of [r.current.emi, r.proposed.emi, r.decision.netSaving]) assert.ok(Number.isFinite(x));
    }
  });
});

describe("validation (the rules and messages belong to the tool)", () => {
  const raw = (over = {}) => ({ balance: "2500000", currentRate: "9.5", currentYears: "15", currentMonths: "0", newRate: "8.5", newYears: "15", newMonths: "0", currentCharges: "0", newCharges: "15000", ...over });
  const fieldsOf = (result) => result.errors.flatMap((e) => e.fields).sort();

  test("valid input gives the values, with the tenures in months", () => {
    const r = validateBalanceTransferInputs(raw({ currentYears: "12", currentMonths: "6", newYears: "20", newMonths: "3" }));
    assert.equal(r.ok, true);
    assert.deepEqual(r.values, { balance: 2500000, currentRate: 9.5, currentMonths: 150, newRate: 8.5, newMonths: 243, currentCharges: 0, newCharges: 15000 });
  });

  test("numbers as numbers work too", () => {
    assert.equal(validateBalanceTransferInputs({ balance: 100000, currentRate: 9, currentYears: 1, currentMonths: 0, newRate: 8, newYears: 1, newMonths: 0, currentCharges: 0, newCharges: 0 }).ok, true);
  });

  test("each field has its own message", () => {
    for (const [over, field] of [
      [{ balance: "999" }, "balance"], [{ balance: "100000001" }, "balance"], [{ balance: "" }, "balance"], [{ balance: "abc" }, "balance"],
      [{ currentRate: "0" }, "currentRate"], [{ currentRate: "31" }, "currentRate"],
      [{ newRate: "0.05" }, "newRate"], [{ newRate: "30.5" }, "newRate"],
      [{ currentYears: "41" }, "currentYears"], [{ currentYears: "1.5" }, "currentYears"], [{ currentYears: "-1" }, "currentYears"],
      [{ currentMonths: "12" }, "currentMonths"], [{ currentMonths: "2.5" }, "currentMonths"],
      [{ newYears: "41" }, "newYears"], [{ newMonths: "12" }, "newMonths"],
      [{ currentCharges: "-1" }, "currentCharges"], [{ currentCharges: "100000001" }, "currentCharges"], [{ currentCharges: "" }, "currentCharges"],
      [{ newCharges: "-5" }, "newCharges"], [{ newCharges: "x" }, "newCharges"],
    ]) {
      const r = validateBalanceTransferInputs(raw(over));
      assert.equal(r.ok, false, JSON.stringify(over));
      assert.ok(fieldsOf(r).includes(field), `${JSON.stringify(over)} -> ${fieldsOf(r)}`);
      assert.ok(r.errors.every((e) => typeof e.message === "string" && e.message.length > 10));
    }
  });

  test("a zero tenure is an error on both fields, for each loan", () => {
    assert.deepEqual(fieldsOf(validateBalanceTransferInputs(raw({ currentYears: "0", currentMonths: "0" }))), ["currentMonths", "currentYears"]);
    assert.deepEqual(fieldsOf(validateBalanceTransferInputs(raw({ newYears: "0", newMonths: "0" }))), ["newMonths", "newYears"]);
  });

  test("the limits are the documented ones", () => {
    assert.deepEqual(BALANCE_TRANSFER_LIMITS.balance, { min: 1000, max: 100000000 });
    assert.deepEqual(BALANCE_TRANSFER_LIMITS.rate, { min: 0.1, max: 30 });
    assert.deepEqual(BALANCE_TRANSFER_LIMITS.totalMonths, { min: 1, max: 480 });
    assert.deepEqual(BALANCE_TRANSFER_LIMITS.charges, { min: 0, max: 100000000 });
  });

  test("several problems are reported together", () => {
    const r = validateBalanceTransferInputs(raw({ balance: "", currentRate: "99", newCharges: "-1" }));
    assert.deepEqual(fieldsOf(r), ["balance", "currentRate", "newCharges"]);
  });
});
