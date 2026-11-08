/* =========================================================
   ToolZen Hub
   ShopLite: the catalogue, coupons and demo accounts (original, made up; no real people or products)

   Prices are chosen so that the requirements' boundaries can be tested: ₹499 and ₹500 around the SAVE10 minimum, a ₹999
   item at the free-delivery threshold, and prices with different numbers of digits for sorting.
========================================================= */

export const PRODUCTS = Object.freeze([
    { id: 1, name: "Spiral Notebook", category: "Stationery", price: 60 },
    { id: 2, name: "Gel Pen Set", category: "Stationery", price: 120 },
    { id: 3, name: "Highlighter Pack", category: "Stationery", price: 90 },
    { id: 4, name: "Sticky Notes", category: "Stationery", price: 45 },
    { id: 5, name: "A4 Paper Ream", category: "Stationery", price: 280 },
    { id: 6, name: "Desk Organiser", category: "Home", price: 333 },
    { id: 7, name: "LED Desk Lamp", category: "Home", price: 1200 },
    { id: 8, name: "Steel Water Bottle", category: "Home", price: 499 },
    { id: 9, name: "Ceramic Mug", category: "Home", price: 250 },
    { id: 10, name: "Office Chair Cushion", category: "Home", price: 999 },
    { id: 11, name: "Laptop Backpack", category: "Bags", price: 1800 },
    { id: 12, name: "Canvas Tote Bag", category: "Bags", price: 350 },
    { id: 13, name: "Pencil Case", category: "Bags", price: 150 },
    { id: 14, name: "Travel Pouch", category: "Bags", price: 500 },
    { id: 15, name: "Wireless Mouse", category: "Electronics", price: 650 },
    { id: 16, name: "USB-C Cable", category: "Electronics", price: 299 },
    { id: 17, name: "Scientific Calculator", category: "Electronics", price: 700 },
    { id: 18, name: "Bluetooth Speaker", category: "Electronics", price: 2400 },
    { id: 19, name: "Laptop Stand", category: "Electronics", price: 950 },
    { id: 20, name: "Power Bank", category: "Electronics", price: 1500 },
    { id: 21, name: "Notebook Cover", category: "Stationery", price: 180 },
    { id: 22, name: "Lunch Box", category: "Home", price: 280 },
    { id: 23, name: "Earphones", category: "Electronics", price: 599 },
    { id: 24, name: "Whiteboard Markers", category: "Stationery", price: 110 }
]);

export const CATEGORIES = Object.freeze(["Stationery", "Home", "Bags", "Electronics"]);

/* demo accounts shown on the sign-in screen; passwords are practice values, never real ones */
export const ACCOUNTS = Object.freeze([
    { email: "asha@example.com", name: "Asha Rao", password: "shoplite1" },
    { email: "ravi@example.com", name: "Ravi Menon", password: "practice2" }
]);

export const PAST_ORDERS = Object.freeze([
    { id: "SL-1001", email: "asha@example.com", date: "2026-10-02", lines: [{ productId: 1, quantity: 3 }, { productId: 9, quantity: 1 }], total: 479 },
    { id: "SL-1002", email: "asha@example.com", date: "2026-10-19", lines: [{ productId: 15, quantity: 1 }], total: 699 },
    { id: "SL-1003", email: "ravi@example.com", date: "2026-10-25", lines: [{ productId: 11, quantity: 1 }], total: 1800 }
]);
