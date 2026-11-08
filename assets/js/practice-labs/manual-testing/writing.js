/* =========================================================
   ToolZen Hub
   Manual Software Testing path: structured writing exercises (checked by practice-labs/writing-check.js)

   Each exercise has a task, its fields, a rubric, a model answer that meets the rubric, and weak answers with the rubric
   items they must miss (tests/unit/writing-check.test.mjs proves both). Scenarios use ShopLite's written requirements.
========================================================= */

const COUPON_DRAFT = "Draft requirement: \"Customers can use a discount code at checkout to get money off their order. Codes are given to loyal customers.\"";

export const WRITING = Object.freeze([
    {
        id: "mt-w-questions-coupon",
        template: "questions",
        task: "A product owner hands you this draft. Before any test can be designed, list the questions you would ask (one per line). Think about amounts, conditions, combinations, time limits, what the discount applies to and what the customer sees when a code fails.",
        scenario: COUPON_DRAFT,
        fields: [{ name: "questions", label: "Your questions (one per line)", lines: 7 }],
        rules: [
            { id: "count", type: "minLines", field: "questions", min: 4, label: "At least four questions", advice: "A draft this short hides many decisions. Aim for one question per decision a developer would have to guess." },
            { id: "amount", type: "covers", fields: ["questions"], groups: [["how much", "amount", "percent", "%", "value", "fixed"]], label: "Asks how much the discount is", advice: "Is the discount a percentage or a fixed amount, and how is it rounded?" },
            { id: "minimum", type: "covers", fields: ["questions"], groups: [["minimum", "at least", "threshold", "lowest", "smallest order"]], label: "Asks about a minimum order", advice: "Is there a minimum order value? Exactly at the minimum, does the code work?" },
            { id: "combine", type: "covers", fields: ["questions"], groups: [["more than one", "several", "combine", "two codes", "stack", "multiple"]], label: "Asks whether codes can be combined", advice: "Can a customer use two codes on one order?" },
            { id: "expiry", type: "covers", fields: ["questions"], groups: [["expire", "expiry", "valid until", "end date", "how long", "validity"]], label: "Asks about expiry", advice: "Do codes expire? What happens with an expired code?" },
            { id: "errors", type: "covers", fields: ["questions"], groups: [["message", "error", "invalid", "wrong code", "fails", "refused", "rejected"]], label: "Asks what the customer sees when a code fails", advice: "What message does a customer get for an unknown, expired or ineligible code?" }
        ],
        model: { questions: "Is the discount a fixed amount or a percentage, and how is it rounded?\nIs there a minimum order value, and does an order exactly at the minimum qualify?\nCan a customer combine two or more codes on one order?\nDo codes expire, and what happens with an expired code?\nDoes the discount apply to the delivery fee as well as the items?\nWhat message does the customer see for an unknown or ineligible code?\nWho counts as a loyal customer, and can other customers use a code they were given?" },
        weak: [
            { name: "too short", answer: { questions: "How much is the discount?\nDoes it expire?" }, missing: ["count", "minimum", "combine", "errors"] },
            { name: "only amounts", answer: { questions: "Is it a percentage?\nWhat is the amount?\nIs the value fixed?\nHow much off?" }, missing: ["minimum", "combine", "expiry", "errors"] }
        ],
        explain: "Each question names a decision the draft leaves open. Asking them before testing is static testing: it can prevent a defect instead of finding it later. ShopLite's final rule R5 answers most of them (10%, minimum ₹500, one coupon per order)."
    },
    {
        id: "mt-w-scenarios-signin",
        template: "scenarios",
        task: "Write at least five test scenarios for ShopLite's sign-in screen, one per line. A scenario says what to check, not the detailed steps (for example: \"Sign in with a valid email and password\").",
        scenario: "ShopLite's sign-in screen asks for an email and a password. After signing in, a customer who was sent to sign in from the checkout returns to the checkout.",
        fields: [{ name: "scenarios", label: "Test scenarios (one per line)", lines: 7 }],
        rules: [
            { id: "count", type: "minLines", field: "scenarios", min: 5, label: "At least five scenarios", advice: "Cover the successful path, the different ways sign-in can fail, and what happens afterwards." },
            { id: "valid", type: "covers", fields: ["scenarios"], groups: [["valid", "correct", "successful", "success", "right"]], label: "Covers a successful sign-in", advice: "Start with the main success path: valid email and password." },
            { id: "wrong-password", type: "covers", fields: ["scenarios"], groups: [["wrong password", "incorrect password", "invalid password", "bad password", "password is wrong", "password that is wrong"]], label: "Covers a wrong password", advice: "Check a registered email with a wrong password." },
            { id: "unknown-email", type: "covers", fields: ["scenarios"], groups: [["unknown", "unregistered", "not registered", "does not exist", "non-existent", "no account"]], label: "Covers an email with no account", advice: "Check an email that has no account." },
            { id: "empty", type: "covers", fields: ["scenarios"], groups: [["empty", "blank", "missing", "without"]], label: "Covers empty fields", advice: "Check what happens when a field is left empty." },
            { id: "after", type: "covers", fields: ["scenarios"], groups: [["checkout", "redirect", "return", "back to", "sent to"]], label: "Covers where the customer goes afterwards", advice: "The scenario description says a customer returns to the checkout. Check it." }
        ],
        model: { scenarios: "Sign in with a valid email and password\nSign in with a registered email and a wrong password\nSign in with an email that is not registered\nSign in with the email field empty\nSign in with the password field empty\nSign in with the email in capital letters\nSign in from the checkout and return to the checkout" },
        weak: [
            { name: "happy path only", answer: { scenarios: "Sign in with valid details\nSign in again with valid details\nSign in on a phone with valid details\nSign in in another browser with valid details\nSign in after signing out with valid details" }, missing: ["wrong-password", "unknown-email", "empty", "after"] },
            { name: "too few", answer: { scenarios: "Valid sign-in\nWrong password" }, missing: ["count", "unknown-email", "empty", "after"] }
        ],
        explain: "Good scenario lists cover the success path, each way the input can be wrong, and the behaviour around the feature (where the user goes next). A list of five variations of the success path tests one thing five times."
    },
    {
        id: "mt-w-testcase-save10",
        template: "test-case",
        task: "Write one complete test case that checks ShopLite refuses SAVE10 when the items total is just below ₹500 (requirement R5). Put each step on its own line.",
        scenario: "R5: SAVE10 gives 10% off the items total on orders whose items total is ₹500 or more. An ineligible code is refused with a reason. ShopLite sells the Steel Water Bottle at ₹499.",
        fields: [
            { name: "id", label: "Test case ID", lines: 1 },
            { name: "title", label: "Title", lines: 1 },
            { name: "preconditions", label: "Preconditions", lines: 2 },
            { name: "steps", label: "Steps (one action per line)", lines: 5 },
            { name: "data", label: "Test data", lines: 2 },
            { name: "expected", label: "Expected result", lines: 3 }
        ],
        rules: [
            { id: "id", type: "required", field: "id", label: "Has an ID", advice: "An ID such as TC-COUPON-03 lets results and bug reports refer to the test case." },
            { id: "title", type: "required", field: "title", label: "Has a title", advice: "The title says what is checked, for example: SAVE10 is refused when the items total is ₹499." },
            { id: "pre", type: "required", field: "preconditions", label: "States the preconditions", advice: "What must be true before step 1? For example: the cart is empty; the stable release is open." },
            { id: "steps", type: "minLines", field: "steps", min: 3, label: "At least three steps", advice: "Write the steps a person new to the shop could follow." },
            { id: "atomic", type: "oneAction", field: "steps", label: "One action per step", advice: "Split lines that chain actions with 'and then', 'then' or ';' so a failure can be pinned to one step." },
            { id: "data", type: "concrete", field: "data", label: "Test data is concrete", advice: "Name exact values: the ₹499 product, the code SAVE10." },
            { id: "boundary", type: "covers", fields: ["data", "steps"], groups: [["499"]], label: "Uses the value just below the minimum", advice: "₹499 is the boundary value just below ₹500 that this test is about." },
            { id: "observable", type: "noVague", fields: ["expected"], label: "Expected result is observable", advice: "Replace words like 'works correctly' with what you would see: the coupon is refused, this message appears, the discount stays ₹0." },
            { id: "refused", type: "covers", fields: ["expected"], groups: [["refused", "rejected", "not applied", "is not accepted", "error", "message"], ["500"]], label: "Expected result states the refusal and the ₹500 rule", advice: "Say that the code is refused and that the message mentions the ₹500 minimum." }
        ],
        model: {
            id: "TC-COUPON-03",
            title: "SAVE10 is refused when the items total is ₹499",
            preconditions: "ShopLite stable release is open. The cart is empty.",
            steps: "Open the Shop page.\nPress Add to cart on Steel Water Bottle.\nOpen the cart.\nType SAVE10 in Coupon code.\nPress Apply.",
            data: "Product: Steel Water Bottle, ₹499, quantity 1. Coupon: \"SAVE10\".",
            expected: "The message \"SAVE10 needs an items total of ₹500 or more.\" is shown. The discount stays ₹0 and the total is ₹548 (₹499 plus ₹49 delivery)."
        },
        weak: [
            { name: "vague and chained", answer: { id: "TC1", title: "Coupon test", preconditions: "Cart empty", steps: "Add the bottle to the cart and then open the cart\nApply SAVE10", data: "SAVE10 on ₹499", expected: "It works correctly" }, missing: ["steps", "atomic", "observable", "refused"] },
            { name: "missing parts", answer: { id: "", title: "SAVE10 below minimum", preconditions: "", steps: "Open cart\nType SAVE10\nPress Apply", data: "a cheap product", expected: "The coupon is refused with a message about the ₹500 minimum." }, missing: ["id", "pre", "data", "boundary"] }
        ],
        explain: "A test case another person can run without asking you anything has an ID, a precise title, preconditions, single-action steps, concrete data and an expected result someone can observe. ₹499 is the most valuable value here because it sits right next to the rule's boundary."
    },
    {
        id: "mt-w-positive-negative-qty",
        template: "pos-neg",
        task: "ShopLite's cart quantity must be a whole number from 1 to 10 (R3). Write the test data for two positive tests and three negative tests, each with what should happen.",
        scenario: "R3: Each cart line has a quantity from 1 to 10. Other values are refused with a message and the quantity is not changed.",
        fields: [
            { name: "positive", label: "Positive tests (valid data, one per line, with the expected result)", lines: 3 },
            { name: "negative", label: "Negative tests (invalid data, one per line, with the expected result)", lines: 4 }
        ],
        rules: [
            { id: "pos-count", type: "minLines", field: "positive", min: 2, label: "Two positive tests", advice: "Valid values: typical ones and the edges of the range." },
            { id: "neg-count", type: "minLines", field: "negative", min: 3, label: "Three negative tests", advice: "Invalid values: just outside the range and values of the wrong kind." },
            { id: "pos-edges", type: "covers", fields: ["positive"], groups: [["1", "10"]], label: "A positive test uses an edge of the range (1 or 10)", advice: "Edges are where developers make off-by-one mistakes." },
            { id: "neg-below", type: "covers", fields: ["negative"], groups: [["0", "-1", "-2", "negative", "zero"]], label: "A negative test goes below the range", advice: "Try 0 or a negative number." },
            { id: "neg-above", type: "covers", fields: ["negative"], groups: [["11", "above 10", "more than 10", "100"]], label: "A negative test goes above the range", advice: "Try 11." },
            { id: "neg-kind", type: "covers", fields: ["negative"], groups: [["abc", "letter", "text", "2.5", "1.5", "decimal", "empty", "blank", "symbol"]], label: "A negative test uses the wrong kind of value", advice: "Try a decimal, text or an empty field." },
            { id: "neg-expected", type: "covers", fields: ["negative"], groups: [["refused", "rejected", "error", "message", "not changed", "not accepted"]], label: "Negative tests say what should happen", advice: "A negative test still has an expected result: the value is refused with a message and the quantity stays the same." }
        ],
        model: { positive: "1: accepted, the line total equals one item\n10: accepted, the line total equals ten items", negative: "0: refused with a message, quantity not changed\n11: refused with a message, quantity not changed\n2.5: refused with a message, quantity not changed\nabc: refused with a message, quantity not changed" },
        weak: [
            { name: "only typical values", answer: { positive: "3: accepted\n5: accepted", negative: "0\n-1\n-2" }, missing: ["pos-edges", "neg-above", "neg-kind", "neg-expected"] }
        ],
        explain: "Positive tests confirm valid input is handled; negative tests confirm invalid input is refused safely. The most useful values sit at and just beyond the edges (1, 10, 0, 11), plus values of the wrong kind. In ShopLite's release 1.1, a quantity of 0 is wrongly accepted: try it."
    }
]);
