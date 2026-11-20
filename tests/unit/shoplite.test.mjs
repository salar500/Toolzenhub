/*
 * ShopLite (Practice Labs practice app): the stable release follows its written requirements, and each seeded bug changes
 * exactly the behaviour its registry entry describes. Expected values are worked from the requirements by hand.
 */
import test from "node:test";
import assert from "node:assert/strict";

import * as L from "../../assets/js/practice-labs/shoplite/logic.js";
import { PRODUCTS, PAST_ORDERS } from "../../assets/js/practice-labs/shoplite/data.js";
import { BUGS, AREAS, matchReport } from "../../assets/js/practice-labs/shoplite/bugs.js";

const off = () => false;
const on = (id) => (x) => x === id;

test("registry: ten bugs in release r-bugs-1, unique ids, known areas and requirements", () => {
  assert.equal(BUGS.filter((b) => b.release === "r-bugs-1").length, 10);
  assert.equal(new Set(BUGS.map((b) => b.id)).size, BUGS.length);
  const reqs = new Set(L.REQUIREMENTS.map((r) => r.id));
  for (const b of BUGS) { assert.ok(AREAS.includes(b.area), b.id); assert.ok(reqs.has(b.requirement), b.id); }
});

test("RB1-03 search: case-insensitive in stable, case-sensitive with the bug", () => {
  assert.deepEqual(L.searchProducts(PRODUCTS, "notebook", off).map((p) => p.id), [1, 21]);
  assert.deepEqual(L.searchProducts(PRODUCTS, "notebook", on("RB1-03")).map((p) => p.id), []);
  assert.equal(L.searchProducts(PRODUCTS, "", off).length, 24);
});

test("RB1-04 sorting: numeric in stable, text order with the bug", () => {
  const prices = (bug) => L.sortProducts(PRODUCTS, "price-asc", bug).map((p) => p.price);
  assert.deepEqual(prices(off).slice(0, 4), [45, 60, 90, 110]);
  assert.deepEqual(prices(on("RB1-04")).slice(0, 4), [110, 120, 1200, 150]);
});

test("RB1-02 quantity: 1 to 10 in stable; 0 and negatives accepted with the bug", () => {
  for (const v of [0, -2, 11, 2.5]) assert.equal(L.checkQuantity(v, off).ok, false, String(v));
  assert.equal(L.checkQuantity(10, off).ok, true);
  assert.equal(L.checkQuantity(0, on("RB1-02")).ok, true);
  assert.equal(L.checkQuantity(-2, on("RB1-02")).ok, true);
  assert.equal(L.checkQuantity(11, on("RB1-02")).ok, false);
});

test("RB1-10 remove: removes the chosen line in stable, the first line with the bug (3+ lines)", () => {
  const lines = [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }, { productId: 3, quantity: 1 }];
  assert.deepEqual(L.removeLine(lines, 3, off).map((l) => l.productId), [1, 2]);
  assert.deepEqual(L.removeLine(lines, 3, on("RB1-10")).map((l) => l.productId), [2, 3]);
  assert.deepEqual(L.removeLine(lines.slice(0, 2), 2, on("RB1-10")).map((l) => l.productId), [1]);
});

test("RB1-01 SAVE10: refused under ₹500 in stable, accepted with the bug; boundary ₹500 accepted", () => {
  assert.equal(L.applyCoupon("SAVE10", 499, { firstOrder: false }, off).ok, false);
  assert.equal(L.applyCoupon("SAVE10", 500, { firstOrder: false }, off).discount, 50);
  assert.equal(L.applyCoupon("save10", 999, { firstOrder: false }, off).discount, 99);
  assert.equal(L.applyCoupon("SAVE10", 499, { firstOrder: false }, on("RB1-01")).discount, 49);
  assert.equal(L.applyCoupon("WELCOME50", 300, { firstOrder: false }, off).ok, false);
  assert.equal(L.applyCoupon("WELCOME50", 300, { firstOrder: true }, off).discount, 50);
  assert.equal(L.applyCoupon("NOPE", 300, { firstOrder: true }, off).ok, false);
});

test("RB1-06 delivery: free from ₹999 in stable, only above ₹999 with the bug", () => {
  assert.equal(L.deliveryFee(998, off), 49);
  assert.equal(L.deliveryFee(999, off), 0);
  assert.equal(L.deliveryFee(999, on("RB1-06")), 49);
  assert.equal(L.deliveryFee(1000, on("RB1-06")), 0);
  const s = L.orderSummary([{ productId: 10, quantity: 1 }], PRODUCTS, null, { firstOrder: false }, off);
  assert.deepEqual(s, { items: 999, discount: 0, delivery: 0, total: 999 });
});

test("RB1-09 delivery date: tomorrow to 14 days in stable; today and the past accepted with the bug", () => {
  const today = "2026-11-08";
  assert.equal(L.checkDeliveryDate("2026-11-08", today, off).ok, false);
  assert.equal(L.checkDeliveryDate("2026-11-09", today, off).ok, true);
  assert.equal(L.checkDeliveryDate("2026-11-22", today, off).ok, true);
  assert.equal(L.checkDeliveryDate("2026-11-23", today, off).ok, false);
  assert.equal(L.checkDeliveryDate("2026-11-07", today, on("RB1-09")).ok, true);
  assert.equal(L.checkDeliveryDate("2026-11-23", today, on("RB1-09")).ok, false);
});

test("RB1-07 email, RB1-05 password change, RB1-08 order history", () => {
  assert.equal(L.checkEmail("test@example", off).ok, false);
  assert.equal(L.checkEmail("test@example.com", off).ok, true);
  assert.equal(L.checkEmail("test@example", on("RB1-07")).ok, true);
  assert.equal(L.checkPasswordChange("newpass123", "newpass124", off).ok, false);
  assert.equal(L.checkPasswordChange("newpass123", "newpass124", on("RB1-05")).ok, true);
  assert.equal(L.checkPasswordChange("short1", "short1", on("RB1-05")).ok, false);
  assert.equal(L.visibleOrders(PAST_ORDERS, "ravi@example.com", off).length, 1);
  assert.equal(L.visibleOrders(PAST_ORDERS, "ravi@example.com", on("RB1-08")).length, 3);
});

test("matcher: each bug is recognised from a plain report of its own symptom; others are not", () => {
  const plain = {
    "RB1-01": "Applied SAVE10 on a cart of 499 and it was accepted",
    "RB1-02": "Changed quantity to 0 and it was saved",
    "RB1-03": "Searching notebook in lower case finds nothing",
    "RB1-04": "Sort by price low to high gives 1200 before 250, the order is wrong",
    "RB1-05": "Password change accepted although the two entries are different",
    "RB1-06": "Delivery fee of 49 charged on a 999 order",
    "RB1-07": "Sign up accepted the email test@example without a dot",
    "RB1-08": "My orders shows another customer's orders",
    "RB1-09": "Checkout allowed a delivery date in the past",
    "RB1-10": "Remove deleted the first item instead of the one I chose"
  };
  for (const b of BUGS) {
    const r = matchReport({ area: b.area, title: "", steps: plain[b.id], expected: "", actual: "" }, "r-bugs-1");
    assert.equal(r.bug?.id, b.id, b.id);
    assert.equal(matchReport({ area: b.area, title: "", steps: plain[b.id], expected: "", actual: "" }, "r-bugs-1", new Set([b.id])).duplicate, true);
  }
  assert.equal(matchReport({ area: "Search", title: "The page looks nice", steps: "", expected: "", actual: "" }, "r-bugs-1").bug, null);
  assert.equal(matchReport({ area: "Search", title: "", steps: plain["RB1-03"], expected: "", actual: "" }, "stable").reason, "no-bug-in-area");
});
