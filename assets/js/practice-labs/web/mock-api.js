/* =========================================================
   ToolZen Hub
   HTTP and REST path: a deterministic model of a small ShopLite API that answers requests inside the page. Nothing is
   sent over the network; the host name api.shoplite.example is reserved for examples and does not exist. It is
   stateless: every request is answered from the same fixed data, so results are repeatable.
========================================================= */

export const API_HOST = "https://api.shoplite.example";
export const DEMO_TOKEN = "demo-token-123";

const PRODUCTS = Object.freeze([
    { id: 1, name: "LED Desk Lamp", category: "home", price: 1299, stock: 14 },
    { id: 2, name: "Steel Water Bottle", category: "kitchen", price: 499, stock: 40 },
    { id: 3, name: "Laptop Backpack", category: "bags", price: 1799, stock: 6 },
    { id: 4, name: "Cotton Cushion Cover", category: "home", price: 349, stock: 0 },
    { id: 5, name: "Ceramic Mug Set", category: "kitchen", price: 899, stock: 22 },
    { id: 6, name: "Wall Clock", category: "home", price: 1450, stock: 9 }
]);
const ORDERS = Object.freeze([
    { id: "SL-1004", status: "delivered", total: 1848, items: 2 },
    { id: "SL-1011", status: "shipped", total: 1299, items: 1 }
]);

const json = (status, body, extra = {}) => ({ status, headers: { "Content-Type": "application/json", ...extra }, body });
const error = (status, message, extra) => json(status, { error: message }, extra);
export const REASONS = { 200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found", 405: "Method Not Allowed", 415: "Unsupported Media Type", 422: "Unprocessable Content" };

/** split "/api/products?category=home" into a path and a query object */
export function parseTarget(target) {
    const raw = String(target ?? "").trim().replace(/^https?:\/\/[^/]+/i, "");
    const [path, query = ""] = raw.split("?");
    const params = {};
    for (const pair of query.split("&").filter(Boolean)) {
        const [k, v = ""] = pair.split("=");
        params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
    }
    return { path: path.replace(/\/+$/, "") || "/", query: params };
}

/** "Name: value" lines into an object with lower-case names */
export function parseHeaders(text) {
    const headers = {};
    for (const line of String(text ?? "").split(/\r?\n/)) {
        const i = line.indexOf(":");
        if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
    }
    return headers;
}

const ROUTES = [
    { pattern: /^\/api\/products$/, allow: ["GET"] },
    { pattern: /^\/api\/products\/(\d+)$/, allow: ["GET"] },
    { pattern: /^\/api\/orders$/, allow: ["GET"] },
    { pattern: /^\/api\/cart\/items$/, allow: ["POST"] },
    { pattern: /^\/api\/cart\/items\/(\d+)$/, allow: ["DELETE"] }
];

/** request: { method, target, headers (object, lower-case names), body (string) } → { status, headers, body } */
export function handle(request) {
    const method = String(request.method ?? "GET").toUpperCase();
    const { path, query } = parseTarget(request.target);
    const headers = request.headers ?? {};
    const route = ROUTES.find((r) => r.pattern.test(path));
    if (!route) return error(404, `No endpoint at ${path}. Try /api/products.`);
    if (!route.allow.includes(method)) return error(405, `${method} is not allowed on ${path}.`, { Allow: route.allow.join(", ") });
    const id = Number(path.match(route.pattern)[1]);

    if (route === ROUTES[0]) {
        let list = PRODUCTS;
        if (query.category) list = list.filter((p) => p.category === query.category.toLowerCase());
        if (query.maxPrice !== undefined) {
            const max = Number(query.maxPrice);
            if (!Number.isFinite(max)) return error(400, "maxPrice must be a number.");
            list = list.filter((p) => p.price <= max);
        }
        if (query.inStock === "true") list = list.filter((p) => p.stock > 0);
        return json(200, { count: list.length, products: list });
    }
    if (route === ROUTES[1]) {
        const product = PRODUCTS.find((p) => p.id === id);
        return product ? json(200, product) : error(404, `Product ${id} does not exist.`);
    }
    if (route === ROUTES[2]) {
        const auth = headers.authorization ?? "";
        if (!auth) return error(401, "Sign in required: send Authorization: Bearer <token>.", { "WWW-Authenticate": "Bearer" });
        if (auth !== `Bearer ${DEMO_TOKEN}`) return error(401, "The token is not valid.", { "WWW-Authenticate": "Bearer" });
        return json(200, { orders: ORDERS });
    }
    if (route === ROUTES[3]) {
        if (!/^application\/json\b/i.test(headers["content-type"] ?? "")) return error(415, "Send the body as JSON with Content-Type: application/json.");
        let body;
        try { body = JSON.parse(request.body ?? ""); } catch { return error(400, "The body is not valid JSON."); }
        const errors = [];
        const product = PRODUCTS.find((p) => p.id === body?.productId);
        if (!product) errors.push({ field: "productId", message: "No product with this id." });
        if (!Number.isInteger(body?.qty) || body.qty < 1 || body.qty > 10) errors.push({ field: "qty", message: "qty must be a whole number from 1 to 10." });
        if (product && product.stock === 0) errors.push({ field: "productId", message: `${product.name} is out of stock.` });
        if (errors.length) return json(422, { errors });
        return json(201, { productId: product.id, name: product.name, qty: body.qty, lineTotal: product.price * body.qty }, { Location: `/api/cart/items/${product.id}` });
    }
    return { status: 204, headers: {}, body: null };
}

/** does a request and its response meet a task's goal? → { met, reasons[] } */
export function meetsGoal(goal, request, response) {
    const reasons = [];
    const { path, query } = parseTarget(request.target);
    if (goal.method && String(request.method).toUpperCase() !== goal.method) reasons.push(`Use the ${goal.method} method.`);
    if (goal.path && !new RegExp(goal.path).test(path)) reasons.push(goal.pathHint ?? "Check the path.");
    for (const [k, v] of Object.entries(goal.query ?? {})) if (query[k] !== v) reasons.push(`Add the query parameter ${k}=${v}.`);
    if (response.status !== goal.status) reasons.push(`The goal is a ${goal.status} ${REASONS[goal.status]} response; this one is ${response.status}.`);
    for (const [k, v] of Object.entries(goal.body ?? {})) if (response.body?.[k] !== v) reasons.push(`The response should show ${k}: ${JSON.stringify(v)}.`);
    return { met: reasons.length === 0, reasons };
}

export const API_TASKS = Object.freeze([
    { id: "api-t-list", task: "Get the list of all products.", start: { method: "GET", target: "/api/", headers: "", body: "" },
        goal: { method: "GET", path: "^/api/products$", status: 200, pathHint: "The products collection is at /api/products." },
        model: { method: "GET", target: "/api/products", headers: "Accept: application/json", body: "" },
        explain: "GET reads a resource without changing anything. A collection such as /api/products returns a list." },
    { id: "api-t-one", task: "Get only the product with id 3.", start: { method: "GET", target: "/api/products", headers: "", body: "" },
        goal: { method: "GET", path: "^/api/products/3$", status: 200, pathHint: "One item of a collection is addressed by its id: /api/products/3." },
        model: { method: "GET", target: "/api/products/3", headers: "", body: "" },
        explain: "REST APIs address a single resource by adding its id to the collection path." },
    { id: "api-t-404", task: "Ask for a product that does not exist and read the 404 response.", start: { method: "GET", target: "/api/products/1", headers: "", body: "" },
        goal: { method: "GET", path: "^/api/products/\\d+$", status: 404, pathHint: "Request /api/products/ followed by an id that is not in the list." },
        model: { method: "GET", target: "/api/products/99", headers: "", body: "" },
        explain: "404 Not Found means the resource is not there. A good API also explains in the body; testers check both the code and the message." },
    { id: "api-t-filter", task: "List only home products that cost ₹1,500 or less, using query parameters category and maxPrice.", start: { method: "GET", target: "/api/products", headers: "", body: "" },
        goal: { method: "GET", path: "^/api/products$", status: 200, query: { category: "home", maxPrice: "1500" } },
        model: { method: "GET", target: "/api/products?category=home&maxPrice=1500", headers: "", body: "" },
        explain: "Query parameters after ? filter or page a collection; several are joined with &. Here they return the lamp, the cushion cover and the clock." },
    { id: "api-t-orders", task: `Get your orders. The endpoint /api/orders needs a token: send the header Authorization: Bearer ${DEMO_TOKEN}. Try it first without the header to see 401.`, start: { method: "GET", target: "/api/orders", headers: "", body: "" },
        goal: { method: "GET", path: "^/api/orders$", status: 200 },
        model: { method: "GET", target: "/api/orders", headers: `Authorization: Bearer ${DEMO_TOKEN}`, body: "" },
        explain: "401 Unauthorized means 'who are you?': credentials are missing or invalid. A bearer token in the Authorization header identifies the caller." },
    { id: "api-t-add", task: "Add 2 of product 1 to the cart: POST JSON {\"productId\": 1, \"qty\": 2} to /api/cart/items with the right Content-Type.", start: { method: "GET", target: "/api/cart/items", headers: "", body: "" },
        goal: { method: "POST", path: "^/api/cart/items$", status: 201, body: { productId: 1, qty: 2 } },
        model: { method: "POST", target: "/api/cart/items", headers: "Content-Type: application/json", body: "{\"productId\": 1, \"qty\": 2}" },
        explain: "POST creates something. 201 Created comes with the new item and a Location header pointing to it. Without Content-Type: application/json the API answers 415." },
    { id: "api-t-422", task: "Send a cart request that is valid JSON but breaks the rules (for example qty 0, or an out-of-stock product) and read the 422 response.", start: { method: "POST", target: "/api/cart/items", headers: "Content-Type: application/json", body: "{\"productId\": 1, \"qty\": 2}" },
        goal: { method: "POST", path: "^/api/cart/items$", status: 422 },
        model: { method: "POST", target: "/api/cart/items", headers: "Content-Type: application/json", body: "{\"productId\": 4, \"qty\": 0}" },
        explain: "400 means the request could not be read (broken JSON); 422 means it was read but its values break the rules, with an error per field. Tests should check each rule." },
    { id: "api-t-405", task: "Try to delete the whole products collection with DELETE /api/products and read the response, including the Allow header.", start: { method: "GET", target: "/api/products", headers: "", body: "" },
        goal: { method: "DELETE", path: "^/api/products$", status: 405 },
        model: { method: "DELETE", target: "/api/products", headers: "", body: "" },
        explain: "405 Method Not Allowed: the resource exists but not that method; the Allow header lists what is allowed (GET)." }
]);

/** build the request object from a task's text fields, as the page does */
export const toRequest = (fields) => ({ method: fields.method, target: fields.target, headers: parseHeaders(fields.headers), body: fields.body });
