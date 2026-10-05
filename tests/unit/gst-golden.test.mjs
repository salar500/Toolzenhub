/**
 * Tool Pack 8: the GST engine against the independent reference.
 *
 * GOLDEN holds the output of tests/fixtures/gst-golden.py (Python Fraction / Decimal, whole paise). The reference rounds ADD
 * mode with exact Fractions and finds REMOVE mode by a search over whole paise (the paisa nearest T x 100 / (100 + rate), a
 * tie going up); it does not use the engine's integer formulas. Regenerate the literal by running the script
 * (`--full` for the 2,000.00 round trip quoted in `roundTrip`).
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateGst,
  validateGstInputs,
  GST_LIMITS,
} from "../../assets/js/calculators/formulas/gst.js";

const GOLDEN = {
 "scenarios": {
  "A_add_1000_18": {
   "mode": "add",
   "items": [
    {
     "amount": "1000",
     "rate": "18",
     "before": "1000.00",
     "gst": "180.00",
     "with": "1180.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "18",
     "before": "1000.00",
     "gst": "180.00",
     "with": "1180.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "1000.00",
    "gst": "180.00",
    "with": "1180.00",
    "sharePercent": "15.25"
   }
  },
  "B_remove_1180_18": {
   "mode": "remove",
   "items": [
    {
     "amount": "1180",
     "rate": "18",
     "before": "1000.00",
     "gst": "180.00",
     "with": "1180.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "18",
     "before": "1000.00",
     "gst": "180.00",
     "with": "1180.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "1000.00",
    "gst": "180.00",
    "with": "1180.00",
    "sharePercent": "15.25"
   }
  },
  "C_remove_1000_18": {
   "mode": "remove",
   "items": [
    {
     "amount": "1000",
     "rate": "18",
     "before": "847.46",
     "gst": "152.54",
     "with": "1000.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "18",
     "before": "847.46",
     "gst": "152.54",
     "with": "1000.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "847.46",
    "gst": "152.54",
    "with": "1000.00",
    "sharePercent": "15.25"
   }
  },
  "D_add_99.99_5": {
   "mode": "add",
   "items": [
    {
     "amount": "99.99",
     "rate": "5",
     "before": "99.99",
     "gst": "5.00",
     "with": "104.99",
     "sharePercent": "4.76"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "99.99",
     "gst": "5.00",
     "with": "104.99",
     "sharePercent": "4.76"
    }
   ],
   "total": {
    "before": "99.99",
    "gst": "5.00",
    "with": "104.99",
    "sharePercent": "4.76"
   }
  },
  "E_add_100.10_5_odd_paisa": {
   "mode": "add",
   "items": [
    {
     "amount": "100.10",
     "rate": "5",
     "before": "100.10",
     "gst": "5.01",
     "with": "105.11",
     "sharePercent": "4.77"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "100.10",
     "gst": "5.01",
     "with": "105.11",
     "sharePercent": "4.77"
    }
   ],
   "total": {
    "before": "100.10",
    "gst": "5.01",
    "with": "105.11",
    "sharePercent": "4.77"
   }
  },
  "F_add_1000_0": {
   "mode": "add",
   "items": [
    {
     "amount": "1000",
     "rate": "0",
     "before": "1000.00",
     "gst": "0.00",
     "with": "1000.00",
     "sharePercent": "0.00"
    }
   ],
   "byRate": [
    {
     "rate": "0",
     "before": "1000.00",
     "gst": "0.00",
     "with": "1000.00",
     "sharePercent": "0.00"
    }
   ],
   "total": {
    "before": "1000.00",
    "gst": "0.00",
    "with": "1000.00",
    "sharePercent": "0.00"
   }
  },
  "F2_remove_1000_0": {
   "mode": "remove",
   "items": [
    {
     "amount": "1000",
     "rate": "0",
     "before": "1000.00",
     "gst": "0.00",
     "with": "1000.00",
     "sharePercent": "0.00"
    }
   ],
   "byRate": [
    {
     "rate": "0",
     "before": "1000.00",
     "gst": "0.00",
     "with": "1000.00",
     "sharePercent": "0.00"
    }
   ],
   "total": {
    "before": "1000.00",
    "gst": "0.00",
    "with": "1000.00",
    "sharePercent": "0.00"
   }
  },
  "G_add_0.01_18": {
   "mode": "add",
   "items": [
    {
     "amount": "0.01",
     "rate": "18",
     "before": "0.01",
     "gst": "0.00",
     "with": "0.01",
     "sharePercent": "0.00"
    }
   ],
   "byRate": [
    {
     "rate": "18",
     "before": "0.01",
     "gst": "0.00",
     "with": "0.01",
     "sharePercent": "0.00"
    }
   ],
   "total": {
    "before": "0.01",
    "gst": "0.00",
    "with": "0.01",
    "sharePercent": "0.00"
   }
  },
  "H_remove_0.01_18": {
   "mode": "remove",
   "items": [
    {
     "amount": "0.01",
     "rate": "18",
     "before": "0.01",
     "gst": "0.00",
     "with": "0.01",
     "sharePercent": "0.00"
    }
   ],
   "byRate": [
    {
     "rate": "18",
     "before": "0.01",
     "gst": "0.00",
     "with": "0.01",
     "sharePercent": "0.00"
    }
   ],
   "total": {
    "before": "0.01",
    "gst": "0.00",
    "with": "0.01",
    "sharePercent": "0.00"
   }
  },
  "I_add_1crore_28": {
   "mode": "add",
   "items": [
    {
     "amount": "10000000",
     "rate": "28",
     "before": "10000000.00",
     "gst": "2800000.00",
     "with": "12800000.00",
     "sharePercent": "21.88"
    }
   ],
   "byRate": [
    {
     "rate": "28",
     "before": "10000000.00",
     "gst": "2800000.00",
     "with": "12800000.00",
     "sharePercent": "21.88"
    }
   ],
   "total": {
    "before": "10000000.00",
    "gst": "2800000.00",
    "with": "12800000.00",
    "sharePercent": "21.88"
   }
  },
  "J_add_max_28": {
   "mode": "add",
   "items": [
    {
     "amount": "9999999999.99",
     "rate": "28",
     "before": "9999999999.99",
     "gst": "2800000000.00",
     "with": "12799999999.99",
     "sharePercent": "21.88"
    }
   ],
   "byRate": [
    {
     "rate": "28",
     "before": "9999999999.99",
     "gst": "2800000000.00",
     "with": "12799999999.99",
     "sharePercent": "21.88"
    }
   ],
   "total": {
    "before": "9999999999.99",
    "gst": "2800000000.00",
    "with": "12799999999.99",
    "sharePercent": "21.88"
   }
  },
  "J2_remove_max_28": {
   "mode": "remove",
   "items": [
    {
     "amount": "9999999999.99",
     "rate": "28",
     "before": "7812499999.99",
     "gst": "2187500000.00",
     "with": "9999999999.99",
     "sharePercent": "21.88"
    }
   ],
   "byRate": [
    {
     "rate": "28",
     "before": "7812499999.99",
     "gst": "2187500000.00",
     "with": "9999999999.99",
     "sharePercent": "21.88"
    }
   ],
   "total": {
    "before": "7812499999.99",
    "gst": "2187500000.00",
    "with": "9999999999.99",
    "sharePercent": "21.88"
   }
  },
  "K_remove_12345.67_12": {
   "mode": "remove",
   "items": [
    {
     "amount": "12345.67",
     "rate": "12",
     "before": "11022.92",
     "gst": "1322.75",
     "with": "12345.67",
     "sharePercent": "10.71"
    }
   ],
   "byRate": [
    {
     "rate": "12",
     "before": "11022.92",
     "gst": "1322.75",
     "with": "12345.67",
     "sharePercent": "10.71"
    }
   ],
   "total": {
    "before": "11022.92",
    "gst": "1322.75",
    "with": "12345.67",
    "sharePercent": "10.71"
   }
  },
  "P_add_fractional_rate_2.5": {
   "mode": "add",
   "items": [
    {
     "amount": "1000",
     "rate": "2.5",
     "before": "1000.00",
     "gst": "25.00",
     "with": "1025.00",
     "sharePercent": "2.44"
    }
   ],
   "byRate": [
    {
     "rate": "2.5",
     "before": "1000.00",
     "gst": "25.00",
     "with": "1025.00",
     "sharePercent": "2.44"
    }
   ],
   "total": {
    "before": "1000.00",
    "gst": "25.00",
    "with": "1025.00",
    "sharePercent": "2.44"
   }
  },
  "P2_add_fractional_rate_0.25": {
   "mode": "add",
   "items": [
    {
     "amount": "333.33",
     "rate": "0.25",
     "before": "333.33",
     "gst": "0.83",
     "with": "334.16",
     "sharePercent": "0.25"
    }
   ],
   "byRate": [
    {
     "rate": "0.25",
     "before": "333.33",
     "gst": "0.83",
     "with": "334.16",
     "sharePercent": "0.25"
    }
   ],
   "total": {
    "before": "333.33",
    "gst": "0.83",
    "with": "334.16",
    "sharePercent": "0.25"
   }
  },
  "Q_remove_rate_50": {
   "mode": "remove",
   "items": [
    {
     "amount": "1500",
     "rate": "50",
     "before": "1000.00",
     "gst": "500.00",
     "with": "1500.00",
     "sharePercent": "33.33"
    }
   ],
   "byRate": [
    {
     "rate": "50",
     "before": "1000.00",
     "gst": "500.00",
     "with": "1500.00",
     "sharePercent": "33.33"
    }
   ],
   "total": {
    "before": "1000.00",
    "gst": "500.00",
    "with": "1500.00",
    "sharePercent": "33.33"
   }
  }
 },
 "invoices": {
  "L_add_mixed": {
   "mode": "add",
   "items": [
    {
     "amount": "1000",
     "rate": "5",
     "before": "1000.00",
     "gst": "50.00",
     "with": "1050.00",
     "sharePercent": "4.76"
    },
    {
     "amount": "2000",
     "rate": "18",
     "before": "2000.00",
     "gst": "360.00",
     "with": "2360.00",
     "sharePercent": "15.25"
    },
    {
     "amount": "500",
     "rate": "18",
     "before": "500.00",
     "gst": "90.00",
     "with": "590.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "1000.00",
     "gst": "50.00",
     "with": "1050.00",
     "sharePercent": "4.76"
    },
    {
     "rate": "18",
     "before": "2500.00",
     "gst": "450.00",
     "with": "2950.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "3500.00",
    "gst": "500.00",
    "with": "4000.00",
    "sharePercent": "12.50"
   }
  },
  "M_remove_mixed": {
   "mode": "remove",
   "items": [
    {
     "amount": "1050",
     "rate": "5",
     "before": "1000.00",
     "gst": "50.00",
     "with": "1050.00",
     "sharePercent": "4.76"
    },
    {
     "amount": "2360",
     "rate": "18",
     "before": "2000.00",
     "gst": "360.00",
     "with": "2360.00",
     "sharePercent": "15.25"
    },
    {
     "amount": "590",
     "rate": "18",
     "before": "500.00",
     "gst": "90.00",
     "with": "590.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "1000.00",
     "gst": "50.00",
     "with": "1050.00",
     "sharePercent": "4.76"
    },
    {
     "rate": "18",
     "before": "2500.00",
     "gst": "450.00",
     "with": "2950.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "3500.00",
    "gst": "500.00",
    "with": "4000.00",
    "sharePercent": "12.50"
   }
  },
  "N_three_items_10.10_5": {
   "mode": "add",
   "items": [
    {
     "amount": "10.10",
     "rate": "5",
     "before": "10.10",
     "gst": "0.51",
     "with": "10.61",
     "sharePercent": "4.81"
    },
    {
     "amount": "10.10",
     "rate": "5",
     "before": "10.10",
     "gst": "0.51",
     "with": "10.61",
     "sharePercent": "4.81"
    },
    {
     "amount": "10.10",
     "rate": "5",
     "before": "10.10",
     "gst": "0.51",
     "with": "10.61",
     "sharePercent": "4.81"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "30.30",
     "gst": "1.53",
     "with": "31.83",
     "sharePercent": "4.81"
    }
   ],
   "total": {
    "before": "30.30",
    "gst": "1.53",
    "with": "31.83",
    "sharePercent": "4.81"
   }
  },
  "O_inherited_rate": {
   "mode": "add",
   "items": [
    {
     "amount": "1000",
     "rate": "18",
     "before": "1000.00",
     "gst": "180.00",
     "with": "1180.00",
     "sharePercent": "15.25"
    },
    {
     "amount": "500",
     "rate": "18",
     "before": "500.00",
     "gst": "90.00",
     "with": "590.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "18",
     "before": "1500.00",
     "gst": "270.00",
     "with": "1770.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "1500.00",
    "gst": "270.00",
    "with": "1770.00",
    "sharePercent": "15.25"
   }
  },
  "R_rate_formatting_5_5.0_5.00": {
   "mode": "add",
   "items": [
    {
     "amount": "100",
     "rate": "5",
     "before": "100.00",
     "gst": "5.00",
     "with": "105.00",
     "sharePercent": "4.76"
    },
    {
     "amount": "100",
     "rate": "5.0",
     "before": "100.00",
     "gst": "5.00",
     "with": "105.00",
     "sharePercent": "4.76"
    },
    {
     "amount": "100",
     "rate": "5.00",
     "before": "100.00",
     "gst": "5.00",
     "with": "105.00",
     "sharePercent": "4.76"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "300.00",
     "gst": "15.00",
     "with": "315.00",
     "sharePercent": "4.76"
    }
   ],
   "total": {
    "before": "300.00",
    "gst": "15.00",
    "with": "315.00",
    "sharePercent": "4.76"
   }
  },
  "S_four_rates_sorted": {
   "mode": "add",
   "items": [
    {
     "amount": "100",
     "rate": "18",
     "before": "100.00",
     "gst": "18.00",
     "with": "118.00",
     "sharePercent": "15.25"
    },
    {
     "amount": "100",
     "rate": "5",
     "before": "100.00",
     "gst": "5.00",
     "with": "105.00",
     "sharePercent": "4.76"
    },
    {
     "amount": "100",
     "rate": "28",
     "before": "100.00",
     "gst": "28.00",
     "with": "128.00",
     "sharePercent": "21.88"
    },
    {
     "amount": "100",
     "rate": "12",
     "before": "100.00",
     "gst": "12.00",
     "with": "112.00",
     "sharePercent": "10.71"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "100.00",
     "gst": "5.00",
     "with": "105.00",
     "sharePercent": "4.76"
    },
    {
     "rate": "12",
     "before": "100.00",
     "gst": "12.00",
     "with": "112.00",
     "sharePercent": "10.71"
    },
    {
     "rate": "18",
     "before": "100.00",
     "gst": "18.00",
     "with": "118.00",
     "sharePercent": "15.25"
    },
    {
     "rate": "28",
     "before": "100.00",
     "gst": "28.00",
     "with": "128.00",
     "sharePercent": "21.88"
    }
   ],
   "total": {
    "before": "400.00",
    "gst": "63.00",
    "with": "463.00",
    "sharePercent": "13.61"
   }
  }
 },
 "grandTotalRounding": {
  "itemByItemGst": "1.53",
  "onGrandTotalGst": "1.52"
 },
 "roundTrip": {
  "0": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  },
  "5": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  },
  "12": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  },
  "18": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  },
  "28": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  },
  "2.5": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  },
  "0.25": {
   "amounts": 200000,
   "recoveredExactly": 200000,
   "recoveredExactlyPercent": "100.0000",
   "withinOnePaise": 200000,
   "worstDifferencePaise": 0,
   "removeInvariantHolds": true
  }
 },
 "articles": {
  "add1000at18": {
   "before": "1000.00",
   "gst": "180.00",
   "with": "1180.00",
   "sharePercent": "15.25"
  },
  "removeBySubtractingPercent_1180_18": "967.60",
  "shareAt": {
   "5": "4.76",
   "12": "10.71",
   "18": "15.25",
   "28": "21.88"
  },
  "mixed": {
   "mode": "add",
   "items": [
    {
     "amount": "1000",
     "rate": "5",
     "before": "1000.00",
     "gst": "50.00",
     "with": "1050.00",
     "sharePercent": "4.76"
    },
    {
     "amount": "2000",
     "rate": "18",
     "before": "2000.00",
     "gst": "360.00",
     "with": "2360.00",
     "sharePercent": "15.25"
    },
    {
     "amount": "500",
     "rate": "18",
     "before": "500.00",
     "gst": "90.00",
     "with": "590.00",
     "sharePercent": "15.25"
    }
   ],
   "byRate": [
    {
     "rate": "5",
     "before": "1000.00",
     "gst": "50.00",
     "with": "1050.00",
     "sharePercent": "4.76"
    },
    {
     "rate": "18",
     "before": "2500.00",
     "gst": "450.00",
     "with": "2950.00",
     "sharePercent": "15.25"
    }
   ],
   "total": {
    "before": "3500.00",
    "gst": "500.00",
    "with": "4000.00",
    "sharePercent": "12.50"
   }
  }
 }
};

const rupees = (paise) => (paise / 100).toFixed(2);
const items = (list) => list.map((x) => ({ amount: x.amount, rate: x.rate }));

function run(mode, list) {
  const check = validateGstInputs({ mode, items: items(list) });
  assert.equal(check.ok, true, JSON.stringify(check.errors));
  return calculateGst(check.values);
}

function matches(label, g, r) {
  assert.equal(r.itemCount, g.items.length, `${label}: item count`);
  g.items.forEach((gi, i) => {
    const ri = r.items[i];
    assert.equal(rupees(ri.beforePaise), gi.before, `${label} item ${i + 1} before`);
    assert.equal(rupees(ri.gstPaise), gi.gst, `${label} item ${i + 1} GST`);
    assert.equal(rupees(ri.withPaise), gi.with, `${label} item ${i + 1} with`);
    assert.equal((ri.shareHundredths / 100).toFixed(2), gi.sharePercent, `${label} item ${i + 1} share`);
    assert.equal(ri.beforePaise + ri.gstPaise, ri.withPaise, `${label} item ${i + 1}: before + GST = with`);
  });
  assert.equal(r.byRate.length, g.byRate.length, `${label}: rate groups`);
  g.byRate.forEach((gr, i) => {
    const rr = r.byRate[i];
    assert.equal((rr.rateHundredths / 100).toString(), String(Number(gr.rate)), `${label} rate group ${i + 1}`);
    assert.equal(rupees(rr.beforePaise), gr.before, `${label} group ${gr.rate} before`);
    assert.equal(rupees(rr.gstPaise), gr.gst, `${label} group ${gr.rate} GST`);
    assert.equal(rupees(rr.withPaise), gr.with, `${label} group ${gr.rate} with`);
  });
  assert.equal(rupees(r.total.beforePaise), g.total.before, `${label}: total before`);
  assert.equal(rupees(r.total.gstPaise), g.total.gst, `${label}: total GST`);
  assert.equal(rupees(r.total.withPaise), g.total.with, `${label}: total with`);
  assert.equal((r.total.shareHundredths / 100).toFixed(2), g.total.sharePercent, `${label}: total share`);
}

describe("every single-item scenario matches the independent reference", () => {
  for (const [name, g] of Object.entries(GOLDEN.scenarios)) {
    test(name, () => matches(name, g, run(g.mode, g.items)));
  }
});

describe("every invoice matches the independent reference", () => {
  for (const [name, g] of Object.entries(GOLDEN.invoices)) {
    test(name, () => matches(name, g, run(g.mode, g.items)));
  }
});

describe("the planning goldens", () => {
  test("Add 1,000 at 18%: 180.00 of GST, 1,180.00 with GST, and the tax is 15.25% of the final amount", () => {
    const r = run("add", [{ amount: "1000", rate: "18" }]);
    assert.deepEqual([r.total.beforePaise, r.total.gstPaise, r.total.withPaise, r.total.shareHundredths], [100000, 18000, 118000, 1525]);
  });

  test("Remove 1,180 at 18% is 1,000.00 and 180.00, NOT 967.60 (subtracting the rate) and NOT 212.40 of tax", () => {
    const r = run("remove", [{ amount: "1180", rate: "18" }]);
    assert.deepEqual([r.total.beforePaise, r.total.gstPaise], [100000, 18000]);
    assert.notEqual(r.total.beforePaise, 96760);
    assert.notEqual(r.total.gstPaise, 21240);
    assert.equal(GOLDEN.articles.removeBySubtractingPercent_1180_18, "967.60");
  });

  test("Remove 1,000 at 18% is 847.46 and 152.54", () => {
    const r = run("remove", [{ amount: "1000", rate: "18" }]);
    assert.deepEqual([r.total.beforePaise, r.total.gstPaise], [84746, 15254]);
  });

  test("half up: 99.99 at 5% is 4.9995 and rounds to 5.00; 100.10 at 5% is 5.005 and rounds up to 5.01", () => {
    assert.equal(run("add", [{ amount: "99.99", rate: "5" }]).total.gstPaise, 500);
    assert.equal(run("add", [{ amount: "100.10", rate: "5" }]).total.gstPaise, 501);
  });

  test("zero rate: nothing is added or taken out, in both modes", () => {
    for (const mode of ["add", "remove"]) {
      const r = run(mode, [{ amount: "1000", rate: "0" }]);
      assert.deepEqual([r.total.beforePaise, r.total.gstPaise, r.total.withPaise, r.total.shareHundredths], [100000, 0, 100000, 0]);
    }
  });

  test("the smallest amount and the largest amount are exact", () => {
    assert.equal(run("add", [{ amount: "0.01", rate: "18" }]).total.gstPaise, 0);
    const big = run("add", [{ amount: "9999999999.99", rate: "28" }]);
    assert.equal(big.total.gstPaise, 280000000000);
    assert.equal(big.total.withPaise, 1279999999999);
    assert.ok(Number.isSafeInteger(big.total.withPaise));
    const remove = run("remove", [{ amount: "9999999999.99", rate: "28" }]);
    assert.equal(remove.total.beforePaise + remove.total.gstPaise, 999999999999);
  });
});

describe("Remove mode keeps its invariant: before + GST = the amount entered, to the paisa", () => {
  test("every amount from 0.01 to 20.00 at many rates, and a spread of large ones", () => {
    const rates = ["0", "0.01", "0.25", "1", "2.5", "5", "7.5", "12", "12.5", "18", "28", "33.33", "50"];
    for (const rate of rates) {
      for (let paise = 1; paise <= 2000; paise++) {
        const r = run("remove", [{ amount: (paise / 100).toFixed(2), rate }]);
        assert.equal(r.total.beforePaise + r.total.gstPaise, paise, `${paise} at ${rate}`);
        assert.ok(r.total.gstPaise >= 0 && r.total.beforePaise >= 0);
      }
    }
    for (const paise of [123456789, 987654321, 555555555555, 999999999999]) {
      for (const rate of rates) {
        const r = run("remove", [{ amount: (paise / 100).toFixed(2), rate }]);
        assert.equal(r.total.beforePaise + r.total.gstPaise, paise);
      }
    }
  });

  test("it is the nearest paisa to T x 100 / (100 + rate), a tie going up (checked with exact fractions)", () => {
    for (const rate of ["18", "5", "12.5", "0.25", "50"]) {
      const [whole, fraction = ""] = rate.split(".");
      const rh = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
      for (let t = 1n; t <= 3000n; t++) {
        const r = run("remove", [{ amount: (Number(t) / 100).toFixed(2), rate }]);
        const b = BigInt(r.total.beforePaise);
        const den = 10000n + rh;
        // |b - t*10000/den| <= 1/2, i.e. |b*den - t*10000| * 2 <= den, strictly < for b below the tie
        const distance2 = 2n * (b * den > t * 10000n ? b * den - t * 10000n : t * 10000n - b * den);
        assert.ok(distance2 <= den, `${t} at ${rate}`);
      }
    }
  });
});

describe("Add then Remove at the same rate gives back the amount entered", () => {
  test("the reference measured every amount from 0.01 to 2,000.00 at seven rates: all recovered", () => {
    for (const [rate, stats] of Object.entries(GOLDEN.roundTrip)) {
      assert.equal(stats.amounts, 200000, rate);
      assert.equal(stats.recoveredExactly, stats.amounts, `${rate}: recovered exactly`);
      assert.equal(stats.worstDifferencePaise, 0, rate);
      assert.equal(stats.removeInvariantHolds, true, rate);
    }
  });

  test("and the engine does the same, over a dense range at several rates", () => {
    for (const rate of ["0", "5", "12", "18", "28", "2.5", "0.25", "50"]) {
      for (let paise = 1; paise <= 3000; paise++) {
        const amount = (paise / 100).toFixed(2);
        const added = run("add", [{ amount, rate }]).total.withPaise;
        const back = run("remove", [{ amount: (added / 100).toFixed(2), rate }]).total.beforePaise;
        assert.equal(back, paise, `${amount} at ${rate}`);
      }
    }
  });
});

describe("invoices", () => {
  test("totals are the sums of the items rounded one by one, NOT GST on the grand total", () => {
    const r = run("add", [{ amount: "10.10", rate: "5" }, { amount: "10.10", rate: "5" }, { amount: "10.10", rate: "5" }]);
    assert.equal(r.total.gstPaise, 153);
    assert.equal(GOLDEN.grandTotalRounding.itemByItemGst, "1.53");
    assert.equal(GOLDEN.grandTotalRounding.onGrandTotalGst, "1.52");
    assert.notEqual(r.total.gstPaise, 152);
  });

  test("a blank rate on a later item is Item 1's rate; a blank amount ignores the row, with no error", () => {
    const inherits = validateGstInputs({ mode: "add", items: [{ amount: "1000", rate: "18" }, { amount: "500", rate: "" }] });
    assert.equal(inherits.ok, true);
    assert.equal(inherits.values.items[1].rateHundredths, 1800);
    const ignored = validateGstInputs({ mode: "add", items: [{ amount: "1000", rate: "18" }, { amount: "", rate: "5" }, { amount: "  ", rate: "abc" }, { amount: "", rate: "" }] });
    assert.equal(ignored.ok, true);
    assert.equal(ignored.values.items.length, 1);
  });

  test("rates are grouped by their value, so 5, 5.0 and 5.00 are one row, and rows ascend", () => {
    const r = run("add", [{ amount: "100", rate: "5" }, { amount: "100", rate: "5.0" }, { amount: "100", rate: "5.00" }]);
    assert.equal(r.byRate.length, 1);
    assert.equal(r.byRate[0].rateHundredths, 500);
    const sorted = run("add", [{ amount: "100", rate: "18" }, { amount: "100", rate: "5" }, { amount: "100", rate: "28" }, { amount: "100", rate: "12" }]);
    assert.deepEqual(sorted.byRate.map((x) => x.rateHundredths), [500, 1200, 1800, 2800]);
  });

  test("the by-rate rows add up to the invoice total", () => {
    for (const g of [...Object.values(GOLDEN.invoices)]) {
      const r = run(g.mode, g.items);
      for (const key of ["beforePaise", "gstPaise", "withPaise"]) {
        assert.equal(r.byRate.reduce((s, x) => s + x[key], 0), r.total[key], `${key}`);
        assert.equal(r.items.reduce((s, x) => s + x[key], 0), r.total[key], `${key} items`);
      }
    }
  });

  test("at most four items are used", () => {
    const five = Array.from({ length: 5 }, () => ({ amount: "100", rate: "5" }));
    assert.equal(validateGstInputs({ mode: "add", items: five }).values.items.length, 4);
  });
});

describe("invariants", () => {
  test("GST is never negative and rises with the rate; with GST never falls below before GST", () => {
    for (const amount of ["0.01", "1", "99.99", "1000", "123456.78"]) {
      let last = -1;
      for (const rate of ["0", "1", "5", "12", "18", "28", "50"]) {
        const r = run("add", [{ amount, rate }]).total;
        assert.ok(r.gstPaise >= last, `${amount} at ${rate}`);
        assert.ok(r.withPaise >= r.beforePaise);
        last = r.gstPaise;
      }
    }
  });

  test("the GST share is about rate / (100 + rate)", () => {
    for (const [rate, share] of [["5", 476], ["12", 1071], ["18", 1525], ["28", 2188], ["50", 3333]]) {
      assert.equal(run("add", [{ amount: "100000", rate }]).total.shareHundredths, share, rate);
    }
  });
});

describe("validation", () => {
  const ok = { mode: "add", items: [{ amount: "10000", rate: "18" }] };
  const check = (patch) => validateGstInputs({ ...ok, ...patch });
  const first = (patch) => check({ items: [{ ...ok.items[0], ...patch }] });
  const fields = (r) => r.errors.flatMap((e) => e.fields);

  test("the defaults are valid", () => {
    const r = validateGstInputs(ok);
    assert.equal(r.ok, true);
    assert.deepEqual(r.values.items, [{ n: 1, amountPaise: 1000000, rateHundredths: 1800 }]);
  });

  test("mode must be add or remove", () => {
    assert.deepEqual(fields(check({ mode: "both" })), ["mode"]);
    assert.equal(check({ mode: "remove" }).ok, true);
  });

  test("amount limits and precision", () => {
    assert.deepEqual(fields(first({ amount: "0" })), ["amount1"]);
    assert.deepEqual(fields(first({ amount: "0.00" })), ["amount1"]);
    assert.equal(first({ amount: "0.01" }).ok, true);
    assert.equal(first({ amount: "9999999999.99" }).ok, true);
    assert.deepEqual(fields(first({ amount: "10000000000" })), ["amount1"]);
    assert.deepEqual(fields(first({ amount: "-5" })), ["amount1"]);
    assert.deepEqual(fields(first({ amount: "10.005" })), ["amount1"]);
    assert.deepEqual(fields(first({ amount: "1e3" })), ["amount1"]);
    assert.deepEqual(fields(first({ amount: "" })), ["amount1"]);
  });

  test("rate limits and precision", () => {
    assert.equal(first({ rate: "0" }).ok, true);
    assert.equal(first({ rate: "50" }).ok, true);
    assert.equal(first({ rate: "0.01" }).ok, true);
    assert.deepEqual(fields(first({ rate: "50.01" })), ["rate1"]);
    assert.deepEqual(fields(first({ rate: "-1" })), ["rate1"]);
    assert.deepEqual(fields(first({ rate: "18.005" })), ["rate1"]);
    assert.deepEqual(fields(first({ rate: "" })), ["rate1"]);
  });

  test("an item with an amount is checked; its own fields are marked, and a later item's message names it", () => {
    const r = validateGstInputs({ mode: "add", items: [ok.items[0], { amount: "5", rate: "60" }, { amount: "x", rate: "" }] });
    assert.deepEqual(fields(r), ["rate2", "amount3"]);
    assert.match(r.errors[0].message, /^Item 2: /);
    assert.match(r.errors[1].message, /^Item 3: /);
  });

  test("the limits are the documented ones", () => {
    assert.deepEqual(GST_LIMITS.amountPaise, { min: 1, max: 999999999999 });
    assert.deepEqual(GST_LIMITS.rateHundredths, { min: 0, max: 5000 });
    assert.equal(GST_LIMITS.items, 4);
  });
});
