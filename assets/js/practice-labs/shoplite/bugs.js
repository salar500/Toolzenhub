/* =========================================================
   ToolZen Hub
   ShopLite: the seeded bugs and how a tester's finding is recognised

   Each bug belongs to a release, breaks one written requirement (logic.js REQUIREMENTS) and is switched on in the code by
   its id. A report is recognised when it names the bug's area and its words contain at least one term from every keyword
   group (the groups describe the essence of the failure, with common synonyms). This recognises what was found, not how
   well the report is written: the Bug Report lab checks the writing. Nothing here is stored or sent.
========================================================= */

export const AREAS = Object.freeze(["Search", "Sorting", "Cart quantity", "Cart remove", "Coupons", "Delivery fee", "Checkout date", "Sign-up", "Password change", "Order history"]);

export const BUGS = Object.freeze([
    { id: "RB1-01", release: "r-bugs-1", area: "Coupons", requirement: "R5", severity: "major",
      title: "SAVE10 is accepted on orders under ₹500",
      steps: ["Add the Steel Water Bottle (₹499) to the cart.", "Open the cart and apply the coupon SAVE10."],
      expected: "The coupon is refused: SAVE10 needs an items total of ₹500 or more.", actual: "The coupon is applied and ₹49 is taken off.",
      keywords: [["save10", "save 10"], ["499", "under", "below", "less than", "minimum", "min ", "<500", "< 500"]] },
    { id: "RB1-02", release: "r-bugs-1", area: "Cart quantity", requirement: "R3", severity: "major",
      title: "The cart accepts a quantity of 0 or a negative quantity",
      steps: ["Add any product to the cart.", "Change its quantity to 0 or -2 and press Update."],
      expected: "The quantity is refused: it must be from 1 to 10.", actual: "The quantity is saved; a negative quantity even reduces the total.",
      keywords: [["0", "zero", "negative", "-1", "-2", "minus", "below 1", "less than 1"]] },
    { id: "RB1-03", release: "r-bugs-1", area: "Search", requirement: "R1", severity: "minor",
      title: "Search is case-sensitive",
      steps: ["Search for notebook (all lower case)."],
      expected: "Spiral Notebook and Notebook Cover are listed.", actual: "Nothing is found; only 'Notebook' with a capital N finds them.",
      keywords: [["case", "capital", "lower", "upper", "small letter", "uppercase", "lowercase"]] },
    { id: "RB1-04", release: "r-bugs-1", area: "Sorting", requirement: "R2", severity: "major",
      title: "Sorting by price compares prices as text",
      steps: ["Sort products by price, lowest first."],
      expected: "Prices rise steadily: ₹45, ₹60, ₹90 …", actual: "₹1,200 and ₹1,500 appear before ₹250, and ₹2,400 before ₹45: prices are ordered like words.",
      keywords: [["sort", "order"], ["wrong", "incorrect", "not ", "text", "alphabet", "string", "1200", "1500", "1800", "2400", "jumbled", "mixed"]] },
    { id: "RB1-05", release: "r-bugs-1", area: "Password change", requirement: "R9", severity: "critical",
      title: "A password change is accepted when the two entries differ",
      steps: ["Sign in, open My account.", "Enter newpass123 and newpass124 as the new password and its confirmation, then save."],
      expected: "The change is refused because the two entries do not match.", actual: "The change is accepted; the customer may not know their own new password.",
      keywords: [["match", "mismatch", "different", "differ", "not the same", "same", "two "]] },
    { id: "RB1-06", release: "r-bugs-1", area: "Delivery fee", requirement: "R6", severity: "major",
      title: "Delivery is charged on an order of exactly ₹999",
      steps: ["Add only the Office Chair Cushion (₹999) to the cart."],
      expected: "Delivery is free (orders of ₹999 or more).", actual: "₹49 delivery is added: free delivery only starts above ₹999.",
      keywords: [["999"], ["fee", "charge", "49", "delivery", "free", "shipping"]] },
    { id: "RB1-07", release: "r-bugs-1", area: "Sign-up", requirement: "R8", severity: "minor",
      title: "Sign-up accepts an email address without a dot in the domain",
      steps: ["Open Sign up, enter test@example as the email and a valid password."],
      expected: "The email is refused: the domain needs a dot.", actual: "The account is created.",
      keywords: [["email", "e-mail", "mail"], ["dot", "domain", ".com", "without", "missing", "invalid", "@example", "a@b", "no ."]] },
    { id: "RB1-08", release: "r-bugs-1", area: "Order history", requirement: "R10", severity: "critical",
      title: "Order history shows other customers' orders",
      steps: ["Sign in as ravi@example.com and open My orders."],
      expected: "Only Ravi's order SL-1003 is listed.", actual: "Asha's orders SL-1001 and SL-1002 are listed as well.",
      keywords: [["other", "another", "someone", "not mine", "asha", "ravi", "all orders", "different user", "different customer", "sl-1001", "sl-1002", "sl-1003"]] },
    { id: "RB1-09", release: "r-bugs-1", area: "Checkout date", requirement: "R7", severity: "major",
      title: "Checkout accepts a delivery date today or in the past",
      steps: ["Add a product, go to Checkout and choose yesterday as the delivery date."],
      expected: "The date is refused: delivery starts tomorrow at the earliest.", actual: "The order is placed with a date in the past.",
      keywords: [["past", "yesterday", "today", "earlier", "before", "old", "previous"]] },
    { id: "RB1-10", release: "r-bugs-1", area: "Cart remove", requirement: "R4", severity: "major",
      title: "Remove deletes the first cart line instead of the chosen one",
      steps: ["Add three different products to the cart.", "Press Remove on the third line."],
      expected: "The third line is removed.", actual: "The first line is removed and the chosen one stays.",
      keywords: [["remove", "delete"], ["wrong", "different", "first", "another", "other", "not the", "instead"]] }
]);

export const RELEASES = Object.freeze({
    stable: { title: "Stable release", note: "Follows the requirements. Use it to learn the shop, or to confirm that a behaviour is a bug only in another release." },
    "r-bugs-1": { title: "Release 1.1 (test build)", note: `${BUGS.filter((b) => b.release === "r-bugs-1").length} bugs were introduced in this build. Find them.` }
});

const norm = (text) => ` ${String(text ?? "").toLowerCase().replace(/\s+/g, " ")} `;

/**
 * Which seeded bug a report describes, if any.
 * report = { area, title, steps, expected, actual }. Returns { bug } or { bug: null, reason }.
 */
export function matchReport(report, release, found = new Set()) {
    const candidates = BUGS.filter((b) => b.release === release && b.area === report.area);
    if (candidates.length === 0) return { bug: null, reason: "no-bug-in-area" };
    const text = norm([report.title, report.steps, report.expected, report.actual].join(" "));
    const hit = candidates.find((b) => b.keywords.every((group) => group.some((word) => text.includes(word))));
    if (!hit) return { bug: null, reason: "not-recognised" };
    return found.has(hit.id) ? { bug: hit, duplicate: true } : { bug: hit };
}
