/** How the two ends of a slider are worded: rupee amounts in Lakh and Crore, percentages, and words with a singular. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEndpoint } from "../../assets/js/ui/field-slider.js";

test("rupees: grouped below a lakh, Lakh and Crore above", () => {
  assert.equal(formatEndpoint(50000, "₹", 1), "₹50,000");
  assert.equal(formatEndpoint(100000, "₹", 1), "₹1 Lakh");
  assert.equal(formatEndpoint(2500000, "₹", 1), "₹25 Lakh");
  assert.equal(formatEndpoint(10000000, "₹", 1), "₹1 Crore");
  assert.equal(formatEndpoint(50000000, "₹", 1), "₹5 Crore");
  assert.equal(formatEndpoint(12500000, "₹", 1), "₹1.25 Crore");
  assert.equal(formatEndpoint(1000000, "₹ a month", 1), "₹10 Lakh a month");
});

test("percentages keep the step's decimals and any trailing words", () => {
  assert.equal(formatEndpoint(1, "%", 0.1), "1%");
  assert.equal(formatEndpoint(7.5, "%", 0.1), "7.5%");
  assert.equal(formatEndpoint(25, "% a year", 0.5), "25% a year");
  assert.equal(formatEndpoint(0.5, "% of income", 0.5), "0.5% of income");
});

test("words: singular for one, plain unit otherwise; no unit gives the bare number", () => {
  assert.equal(formatEndpoint(1, "Years", 1), "1 Year");
  assert.equal(formatEndpoint(30, "Years", 1), "30 Years");
  assert.equal(formatEndpoint(1, "years", 1), "1 year");
  assert.equal(formatEndpoint(100, "cm", 1), "100 cm");
  assert.equal(formatEndpoint(40, "kg", 1), "40 kg");
  assert.equal(formatEndpoint(12, "", 1), "12");
});
