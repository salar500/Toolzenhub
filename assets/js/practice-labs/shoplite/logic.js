/* =========================================================
   ToolZen Hub
   ShopLite: the shop's rules (pure, no DOM, no storage)

   ShopLite is a small, original practice web shop for software-testing lessons. Its written requirements (REQUIREMENTS) say
   how it must behave. A "release" may switch on seeded bugs: every rule below takes `bug(id)`, which is true only when the
   chosen release contains that bug, so the stable release follows the requirements exactly and a unit test can prove that
   each bug changes exactly the behaviour it claims (tests/unit/shoplite.test.mjs). Money is in whole rupees.
========================================================= */

export const DELIVERY_FEE = 49;
export const FREE_DELIVERY_FROM = 999;
export const MAX_QTY = 10;

export const REQUIREMENTS = Object.freeze([
    { id: "R1", area: "Search", text: "Search matches products whose name contains the words typed, ignoring capital letters. An empty search shows every product." },
    { id: "R2", area: "Sorting", text: "Products can be sorted by price, lowest first or highest first, comparing prices as amounts of money." },
    { id: "R3", area: "Cart", text: "Each cart line has a quantity from 1 to 10. Other values are refused with a message and the quantity is not changed." },
    { id: "R4", area: "Cart", text: "Remove takes out exactly the line it belongs to." },
    { id: "R5", area: "Coupons", text: "SAVE10 gives 10% off the items total (rounded down to whole rupees) on orders whose items total is ₹500 or more. WELCOME50 gives ₹50 off a customer's first order. One coupon per order; an unknown or ineligible code is refused with a reason." },
    { id: "R6", area: "Delivery", text: "Delivery costs ₹49. It is free when the items total after any discount is ₹999 or more." },
    { id: "R7", area: "Checkout", text: "The delivery date must be from tomorrow up to 14 days ahead. Payment is collected on delivery." },
    { id: "R8", area: "Sign-up", text: "An email address needs text before an @, a domain after it, and a dot in the domain (for example name@example.com). A password has at least 8 characters including a digit." },
    { id: "R9", area: "Account", text: "Changing the password requires the new password twice; both entries must be identical and follow the password rule." },
    { id: "R10", area: "Orders", text: "Order history shows only the orders of the signed-in customer." }
]);

export const releaseBugs = (release, registry) => new Set(registry.filter((b) => b.release === release).map((b) => b.id));

/* ---------- search and sort ---------- */

export function searchProducts(products, text, bug = () => false) {
    const q = String(text ?? "").trim();
    if (!q) return products.slice();
    return products.filter((p) => bug("RB1-03") ? p.name.includes(q) : p.name.toLowerCase().includes(q.toLowerCase()));
}

export function sortProducts(products, order, bug = () => false) {
    const list = products.slice();
    if (order !== "price-asc" && order !== "price-desc") return list;
    const cmp = bug("RB1-04")
        ? (a, b) => String(a.price).localeCompare(String(b.price))
        : (a, b) => a.price - b.price;
    list.sort(cmp);
    return order === "price-desc" ? list.reverse() : list;
}

/* ---------- cart ---------- */

/** { ok, quantity, message } for a quantity typed by the customer */
export function checkQuantity(value, bug = () => false) {
    const n = Number(value);
    if (!Number.isInteger(n)) return { ok: false, message: "Enter a whole number." };
    if (bug("RB1-02")) return n > MAX_QTY ? { ok: false, message: `At most ${MAX_QTY} of one item.` } : { ok: true, quantity: n };
    if (n < 1 || n > MAX_QTY) return { ok: false, message: `Choose a quantity from 1 to ${MAX_QTY}.` };
    return { ok: true, quantity: n };
}

/** the cart after removing the line with `productId` */
export function removeLine(lines, productId, bug = () => false) {
    if (bug("RB1-10") && lines.length > 2) return lines.slice(1);
    return lines.filter((line) => line.productId !== productId);
}

export const itemsTotal = (lines, products) => lines.reduce((sum, line) => sum + products.find((p) => p.id === line.productId).price * line.quantity, 0);

/** { ok, discount, message } for a coupon code on a cart */
export function applyCoupon(code, total, { firstOrder }, bug = () => false) {
    const c = String(code ?? "").trim().toUpperCase();
    if (!c) return { ok: false, discount: 0, message: "Enter a coupon code." };
    if (c === "SAVE10") {
        if (total < 500 && !bug("RB1-01")) return { ok: false, discount: 0, message: "SAVE10 needs an items total of ₹500 or more." };
        return { ok: true, discount: Math.floor(total * 0.1), message: "SAVE10 applied: 10% off." };
    }
    if (c === "WELCOME50") {
        if (!firstOrder) return { ok: false, discount: 0, message: "WELCOME50 is only for a first order." };
        return { ok: true, discount: Math.min(50, total), message: "WELCOME50 applied: ₹50 off." };
    }
    return { ok: false, discount: 0, message: "This coupon code does not exist." };
}

export function deliveryFee(afterDiscount, bug = () => false) {
    if (afterDiscount === 0) return 0;
    const free = bug("RB1-06") ? afterDiscount > FREE_DELIVERY_FROM : afterDiscount >= FREE_DELIVERY_FROM;
    return free ? 0 : DELIVERY_FEE;
}

export function orderSummary(lines, products, coupon, account, bug = () => false) {
    const items = itemsTotal(lines, products);
    const applied = coupon ? applyCoupon(coupon, items, account, bug) : { ok: false, discount: 0 };
    const discount = applied.ok ? applied.discount : 0;
    const afterDiscount = items - discount;
    const delivery = deliveryFee(afterDiscount, bug);
    return { items, discount, delivery, total: afterDiscount + delivery };
}

/* ---------- dates (calendar dates as YYYY-MM-DD, compared as text) ---------- */

const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (isoDate, n) => { const d = new Date(`${isoDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return iso(d); };

export function checkDeliveryDate(value, today, bug = () => false) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""))) return { ok: false, message: "Choose a delivery date." };
    const latest = addDays(today, 14);
    if (bug("RB1-09")) return value <= latest ? { ok: true } : { ok: false, message: "Choose a date within the next 14 days." };
    if (value <= today) return { ok: false, message: "Delivery can start tomorrow at the earliest." };
    if (value > latest) return { ok: false, message: "Choose a date within the next 14 days." };
    return { ok: true };
}

/* ---------- accounts ---------- */

export function checkEmail(value, bug = () => false) {
    const v = String(value ?? "").trim();
    const ok = bug("RB1-07") ? /^[^\s@]+@[^\s@]+$/.test(v) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return ok ? { ok: true } : { ok: false, message: "Enter an email address such as name@example.com." };
}

export function checkPassword(value) {
    const v = String(value ?? "");
    return v.length >= 8 && /\d/.test(v) ? { ok: true } : { ok: false, message: "Use at least 8 characters including a digit." };
}

export function checkPasswordChange(first, second, bug = () => false) {
    const rule = checkPassword(first);
    if (!rule.ok) return rule;
    if (!bug("RB1-05") && first !== second) return { ok: false, message: "The two new passwords do not match." };
    return { ok: true };
}

export function visibleOrders(orders, userEmail, bug = () => false) {
    return bug("RB1-08") ? orders.slice() : orders.filter((o) => o.email === userEmail);
}
