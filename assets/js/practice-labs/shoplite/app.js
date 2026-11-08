/* =========================================================
   ToolZen Hub
   ShopLite: the practice shop (a small single-page app for software-testing practice)

   Everything lives in memory for the time the page is open: carts, sign-ins, new accounts and orders disappear on reload
   (nothing is stored or sent). The release comes from ?release= (stable when absent or unknown); its seeded bugs are
   switched on through logic.js. All text is set with DOM methods, never as HTML. Routes are in the address hash
   (#/, #/product/7, #/cart, #/checkout, #/orders, #/signin, #/signup, #/account, #/requirements) so a tester can link to
   a screen and use Back and Forward.
========================================================= */

import * as L from "./logic.js";
import { PRODUCTS, CATEGORIES, ACCOUNTS, PAST_ORDERS } from "./data.js";
import { BUGS, RELEASES } from "./bugs.js";

const params = new URLSearchParams(location.search);
const release = RELEASES[params.get("release")] ? params.get("release") : "stable";
const active = L.releaseBugs(release, BUGS);
const bug = (id) => active.has(id);

const state = {
    accounts: ACCOUNTS.map((a) => ({ ...a })),
    orders: PAST_ORDERS.map((o) => ({ ...o })),
    user: null,
    cart: [],
    coupon: null,
    filters: { q: "", category: "", sort: "" },
    message: null
};

const money = (n) => `₹${n.toLocaleString("en-IN")}`;
const product = (id) => PRODUCTS.find((p) => p.id === id);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

/* a tiny element builder: h("p", { class: "x" }, "text", child) */
function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v === false || v === null || v === undefined) continue;
        if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
        else if (k === "class") el.className = v;
        else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c));
    return el;
}

const field = (id, label, input, hint) => h("div", { class: "sl-field" }, h("label", { for: id }, label), input, hint ? h("p", { class: "sl-hint", id: `${id}-hint` }, hint) : null);

function flash(text, kind = "info") { state.message = { text, kind }; }

function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

/* ---------- screens ---------- */

function shopScreen() {
    const list = L.sortProducts(L.searchProducts(PRODUCTS, state.filters.q, bug).filter((p) => !state.filters.category || p.category === state.filters.category), state.filters.sort, bug);
    const search = h("input", { id: "sl-search", type: "search", value: state.filters.q, placeholder: "Search products", autocomplete: "off" });
    const category = h("select", { id: "sl-category" }, h("option", { value: "" }, "All categories"), CATEGORIES.map((c) => h("option", { value: c, selected: c === state.filters.category }, c)));
    const sort = h("select", { id: "sl-sort" }, h("option", { value: "" }, "Featured"), h("option", { value: "price-asc", selected: state.filters.sort === "price-asc" }, "Price: low to high"), h("option", { value: "price-desc", selected: state.filters.sort === "price-desc" }, "Price: high to low"));
    const apply = (event) => { event.preventDefault(); state.filters = { q: search.value, category: category.value, sort: sort.value }; render(); };
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "Shop"),
        h("form", { class: "sl-filters", role: "search", onsubmit: apply },
            field("sl-search", "Search", search),
            field("sl-category", "Category", category),
            field("sl-sort", "Sort", sort),
            h("button", { type: "submit", class: "sl-btn" }, "Show products")),
        h("p", { class: "sl-count", role: "status" }, `${list.length} ${list.length === 1 ? "product" : "products"}`),
        h("ul", { class: "sl-grid" }, list.map((p) => h("li", { class: "sl-card" },
            h("a", { href: `#/product/${p.id}` }, p.name),
            h("span", { class: "sl-cat" }, p.category),
            h("strong", { class: "sl-price" }, money(p.price)),
            h("button", { type: "button", class: "sl-btn", "data-testid": `add-${p.id}`, onclick: () => addToCart(p.id) }, "Add to cart")))));
}

function productScreen(id) {
    const p = product(id);
    if (!p) return h("section", {}, h("h1", {}, "Product not found"), h("p", {}, h("a", { href: "#/" }, "Back to the shop")));
    return h("section", { "aria-labelledby": "sl-h" },
        h("p", {}, h("a", { href: "#/" }, "← Back to the shop")),
        h("h1", { id: "sl-h" }, p.name),
        h("p", {}, `${p.category} · `, h("strong", {}, money(p.price))),
        h("p", {}, "Quantity limit: 1 to 10 per order line."),
        h("button", { type: "button", class: "sl-btn", onclick: () => addToCart(p.id) }, "Add to cart"));
}

function addToCart(id) {
    const line = state.cart.find((l) => l.productId === id);
    if (line) line.quantity = Math.min(L.MAX_QTY, line.quantity + 1);
    else state.cart.push({ productId: id, quantity: 1 });
    flash(`${product(id).name} added to the cart.`, "ok");
    render();
}

function summaryBlock() {
    const account = { firstOrder: !state.user || !state.orders.some((o) => o.email === state.user.email) };
    const s = L.orderSummary(state.cart, PRODUCTS, state.coupon, account, bug);
    return h("dl", { class: "sl-summary" },
        h("dt", {}, "Items"), h("dd", { "data-testid": "items-total" }, money(s.items)),
        h("dt", {}, `Discount${state.coupon ? ` (${state.coupon})` : ""}`), h("dd", { "data-testid": "discount" }, s.discount ? `− ${money(s.discount)}` : money(0)),
        h("dt", {}, "Delivery"), h("dd", { "data-testid": "delivery" }, s.delivery ? money(s.delivery) : "Free"),
        h("dt", { class: "sl-total" }, "Total"), h("dd", { class: "sl-total", "data-testid": "order-total" }, money(s.total)));
}

function cartScreen() {
    if (state.cart.length === 0) return h("section", {}, h("h1", { id: "sl-h" }, "Your cart"), h("p", {}, "Your cart is empty. ", h("a", { href: "#/" }, "Go shopping.")));
    const couponInput = h("input", { id: "sl-coupon", value: state.coupon ?? "", autocomplete: "off" });
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "Your cart"),
        h("table", { class: "sl-table" },
            h("caption", { class: "sl-sr" }, "Cart lines"),
            h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Product"), h("th", { scope: "col" }, "Price"), h("th", { scope: "col" }, "Quantity"), h("th", { scope: "col" }, "Line total"), h("th", { scope: "col" }, h("span", { class: "sl-sr" }, "Actions")))),
            h("tbody", {}, state.cart.map((line) => {
                const p = product(line.productId);
                const qty = h("input", { id: `sl-qty-${p.id}`, type: "number", value: String(line.quantity), inputmode: "numeric", "aria-label": `Quantity of ${p.name}` });
                return h("tr", { "data-testid": `line-${p.id}` },
                    h("td", {}, p.name), h("td", {}, money(p.price)),
                    h("td", {}, qty, h("button", { type: "button", class: "sl-btn sl-btn--small", onclick: () => {
                        const r = L.checkQuantity(qty.value, bug);
                        if (!r.ok) { flash(r.message, "error"); render(); return; }
                        line.quantity = r.quantity; flash("Quantity updated.", "ok"); render();
                    } }, "Update")),
                    h("td", {}, money(p.price * line.quantity)),
                    h("td", {}, h("button", { type: "button", class: "sl-btn sl-btn--quiet sl-btn--small", "aria-label": `Remove ${p.name}`, onclick: () => {
                        state.cart = L.removeLine(state.cart, p.id, bug); flash(`Removed from the cart.`, "ok"); render();
                    } }, "Remove")));
            }))),
        h("form", { class: "sl-inline", onsubmit: (event) => {
            event.preventDefault();
            const account = { firstOrder: !state.user || !state.orders.some((o) => o.email === state.user.email) };
            const r = L.applyCoupon(couponInput.value, L.itemsTotal(state.cart, PRODUCTS), account, bug);
            state.coupon = r.ok ? couponInput.value.trim().toUpperCase() : null;
            flash(r.message, r.ok ? "ok" : "error"); render();
        } }, field("sl-coupon", "Coupon code", couponInput), h("button", { type: "submit", class: "sl-btn" }, "Apply")),
        summaryBlock(),
        h("p", {}, h("a", { class: "sl-btn sl-btn--link", href: "#/checkout" }, "Go to checkout")));
}

function checkoutScreen() {
    if (!state.user) { flash("Sign in to check out.", "info"); return signinScreen("#/checkout"); }
    if (state.cart.length === 0) return h("section", {}, h("h1", { id: "sl-h" }, "Checkout"), h("p", {}, "Your cart is empty."));
    const address = h("textarea", { id: "sl-address", rows: "3" });
    const date = h("input", { id: "sl-date", type: "date" });
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "Checkout"),
        summaryBlock(),
        h("form", { class: "sl-form", novalidate: true, onsubmit: (event) => {
            event.preventDefault();
            if (!address.value.trim()) { flash("Enter a delivery address.", "error"); render(); return; }
            const d = L.checkDeliveryDate(date.value, today(), bug);
            if (!d.ok) { flash(d.message, "error"); render(); return; }
            const account = { firstOrder: !state.orders.some((o) => o.email === state.user.email) };
            const s = L.orderSummary(state.cart, PRODUCTS, state.coupon, account, bug);
            const id = `SL-${1001 + state.orders.length}`;
            state.orders.push({ id, email: state.user.email, date: today(), delivery: date.value, lines: state.cart.map((l) => ({ ...l })), total: s.total });
            state.cart = []; state.coupon = null;
            flash(`Order ${id} placed. Pay ${money(s.total)} on delivery.`, "ok"); go("#/orders");
        } },
            field("sl-address", "Delivery address", address),
            field("sl-date", "Delivery date", date, "From tomorrow up to 14 days ahead."),
            h("p", {}, "Payment: pay on delivery (cash or UPI to the courier). No card details are ever asked for."),
            h("button", { type: "submit", class: "sl-btn" }, "Place order")));
}

function ordersScreen() {
    if (!state.user) { flash("Sign in to see your orders.", "info"); return signinScreen("#/orders"); }
    const mine = L.visibleOrders(state.orders, state.user.email, bug);
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "My orders"),
        mine.length === 0 ? h("p", {}, "No orders yet.") : h("table", { class: "sl-table" },
            h("thead", {}, h("tr", {}, ["Order", "Date", "Items", "Total"].map((t) => h("th", { scope: "col" }, t)))),
            h("tbody", {}, mine.map((o) => h("tr", { "data-testid": `order-${o.id}` },
                h("td", {}, o.id), h("td", {}, o.date), h("td", {}, o.lines.map((l) => `${product(l.productId).name} × ${l.quantity}`).join(", ")), h("td", {}, money(o.total)))))));
}

function signinScreen(next = "#/") {
    const email = h("input", { id: "sl-email", type: "email", autocomplete: "off" });
    const password = h("input", { id: "sl-password", type: "password", autocomplete: "off" });
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "Sign in"),
        h("form", { class: "sl-form", novalidate: true, onsubmit: (event) => {
            event.preventDefault();
            const account = state.accounts.find((a) => a.email === email.value.trim().toLowerCase() && a.password === password.value);
            if (!account) { flash("Email or password is not right.", "error"); render(); return; }
            state.user = account; flash(`Signed in as ${account.name}.`, "ok"); go(next === "#/signin" ? "#/" : next);
        } }, field("sl-email", "Email", email), field("sl-password", "Password", password), h("button", { type: "submit", class: "sl-btn" }, "Sign in")),
        h("p", { class: "sl-hint" }, "Practice accounts: asha@example.com / shoplite1 and ravi@example.com / practice2. ", h("a", { href: "#/signup" }, "Or create an account.")));
}

function signupScreen() {
    const name = h("input", { id: "sl-name", autocomplete: "off" });
    const email = h("input", { id: "sl-new-email", type: "email", autocomplete: "off" });
    const password = h("input", { id: "sl-new-password", type: "password", autocomplete: "off" });
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "Create an account"),
        h("form", { class: "sl-form", novalidate: true, onsubmit: (event) => {
            event.preventDefault();
            if (!name.value.trim()) { flash("Enter your name.", "error"); render(); return; }
            const e = L.checkEmail(email.value, bug); if (!e.ok) { flash(e.message, "error"); render(); return; }
            const pw = L.checkPassword(password.value); if (!pw.ok) { flash(pw.message, "error"); render(); return; }
            const addr = email.value.trim().toLowerCase();
            if (state.accounts.some((a) => a.email === addr)) { flash("An account with this email already exists.", "error"); render(); return; }
            const account = { email: addr, name: name.value.trim(), password: password.value };
            state.accounts.push(account); state.user = account; flash("Account created. You are signed in.", "ok"); go("#/");
        } }, field("sl-name", "Name", name), field("sl-new-email", "Email", email), field("sl-new-password", "Password", password, "At least 8 characters including a digit."), h("button", { type: "submit", class: "sl-btn" }, "Create account")));
}

function accountScreen() {
    if (!state.user) { flash("Sign in to open your account.", "info"); return signinScreen("#/account"); }
    const first = h("input", { id: "sl-pass1", type: "password", autocomplete: "off" });
    const second = h("input", { id: "sl-pass2", type: "password", autocomplete: "off" });
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "My account"),
        h("p", {}, `${state.user.name} · ${state.user.email}`),
        h("h2", {}, "Change password"),
        h("form", { class: "sl-form", novalidate: true, onsubmit: (event) => {
            event.preventDefault();
            const r = L.checkPasswordChange(first.value, second.value, bug);
            if (!r.ok) { flash(r.message, "error"); render(); return; }
            state.user.password = first.value; flash("Password changed.", "ok"); render();
        } }, field("sl-pass1", "New password", first), field("sl-pass2", "Repeat the new password", second), h("button", { type: "submit", class: "sl-btn" }, "Save password")),
        h("p", {}, h("button", { type: "button", class: "sl-btn sl-btn--quiet", onclick: () => { state.user = null; state.cart = []; state.coupon = null; flash("Signed out.", "ok"); go("#/"); } }, "Sign out")));
}

function requirementsScreen() {
    return h("section", { "aria-labelledby": "sl-h" },
        h("h1", { id: "sl-h" }, "Requirements"),
        h("p", {}, "How ShopLite must behave. A behaviour that differs from these is a bug."),
        h("ol", { class: "sl-reqs" }, L.REQUIREMENTS.map((r) => h("li", { id: r.id }, h("strong", {}, `${r.id} ${r.area}. `), r.text))));
}

/* ---------- frame ---------- */

function render(screenChanged = false) {
    const root = document.getElementById("shoplite");
    const route = location.hash.replace(/^#/, "") || "/";
    const [, screen, arg] = route.split("/");
    const view = { "": shopScreen, product: () => productScreen(Number(arg)), cart: cartScreen, checkout: checkoutScreen, orders: ordersScreen, signin: () => signinScreen(), signup: signupScreen, account: accountScreen, requirements: requirementsScreen }[screen ?? ""] ?? shopScreen;
    const content = view();
    const count = state.cart.reduce((n, l) => n + l.quantity, 0);
    const message = state.message;
    state.message = null;
    root.replaceChildren(
        h("p", { class: "sl-banner" }, `Practice app for software testing · ${RELEASES[release].title} · Do not enter real personal details: nothing is saved or sent.`),
        h("header", { class: "sl-header" },
            h("a", { class: "sl-logo", href: "#/" }, "ShopLite"),
            h("nav", { "aria-label": "ShopLite" },
                h("a", { href: "#/" }, "Shop"),
                h("a", { href: "#/cart" }, `Cart (${count})`),
                h("a", { href: "#/orders" }, "My orders"),
                state.user ? h("a", { href: "#/account" }, "My account") : h("a", { href: "#/signin" }, "Sign in"),
                h("a", { href: "#/requirements" }, "Requirements"))),
        h("div", { class: `sl-message${message ? ` sl-message--${message.kind}` : ""}`, role: "status", "aria-live": "polite" }, message ? message.text : ""),
        h("main", { class: "sl-main" }, content));
    /* on a new screen, move focus to its heading so keyboard and screen-reader users start at the top; not after in-screen updates */
    const heading = root.querySelector("#sl-h");
    if (screenChanged && heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

window.addEventListener("hashchange", () => render(true));
render();
