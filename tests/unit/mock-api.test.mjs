/* HTTP path: the mock API's responses and each task's goal (model meets it; the starting request does not). */
import test from "node:test";
import assert from "node:assert/strict";
import { handle, meetsGoal, toRequest, API_TASKS, parseTarget } from "../../assets/js/practice-labs/web/mock-api.js";

const send = (method, target, headers = "", body = "") => handle(toRequest({ method, target, headers, body }));

test("mock API responses", () => {
  assert.equal(send("GET", "/api/products").body.count, 6);
  assert.equal(send("GET", "/api/products?category=home&maxPrice=1500").body.count, 3);
  assert.equal(send("GET", "/api/products?maxPrice=abc").status, 400);
  assert.equal(send("GET", "/api/products/3").body.name, "Laptop Backpack");
  assert.equal(send("GET", "/api/products/99").status, 404);
  assert.equal(send("GET", "/nothing").status, 404);
  const d = send("DELETE", "/api/products");
  assert.equal(d.status, 405); assert.equal(d.headers.Allow, "GET");
  assert.equal(send("GET", "/api/orders").status, 401);
  assert.equal(send("GET", "/api/orders", "Authorization: Bearer wrong").status, 401);
  assert.equal(send("GET", "/api/orders", "Authorization: Bearer demo-token-123").status, 200);
  assert.equal(send("POST", "/api/cart/items", "", "{}").status, 415);
  assert.equal(send("POST", "/api/cart/items", "Content-Type: application/json", "{bad").status, 400);
  assert.equal(send("POST", "/api/cart/items", "Content-Type: application/json", '{"productId": 4, "qty": 1}').status, 422);
  const ok = send("POST", "/api/cart/items", "content-type: application/json; charset=utf-8", '{"productId": 1, "qty": 2}');
  assert.equal(ok.status, 201); assert.equal(ok.body.lineTotal, 2598); assert.equal(ok.headers.Location, "/api/cart/items/1");
  assert.equal(send("DELETE", "/api/cart/items/1").status, 204);
  assert.deepEqual(parseTarget("https://api.shoplite.example/api/products/?a=1&b=x+y"), { path: "/api/products", query: { a: "1", b: "x y" } });
});

test("every task: model meets the goal, the starting request does not", () => {
  assert.equal(new Set(API_TASKS.map((t) => t.id)).size, API_TASKS.length);
  for (const t of API_TASKS) {
    const m = toRequest(t.model);
    assert.equal(meetsGoal(t.goal, m, handle(m)).met, true, `${t.id} model`);
    const s = toRequest(t.start);
    assert.equal(meetsGoal(t.goal, s, handle(s)).met, false, `${t.id} start`);
  }
});
