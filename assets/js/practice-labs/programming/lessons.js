/* =========================================================
   ToolZen Hub
   JavaScript Programming path: lessons (original to this site; language facts checked against MDN). Code exercises run
   in the learner's browser in an isolated Web Worker (jsrun blocks).
========================================================= */

export const lessons = [
    {
        id: "js-first-steps", title: "Values, variables and your first function", level: "beginner", prerequisite: "None. This is a first programming lesson.",
        objectives: ["Store values in variables with const and let", "Recognise strings, numbers and booleans", "Write and return from a function"],
        intro: "A program works with values: text (strings), numbers and true or false (booleans). Variables give values names; use const when a name will not be reassigned and let when it will. A function is a named, reusable piece of code that takes inputs (parameters) and returns a result.",
        blocks: [
            { type: "example", title: "Values, variables and a function", text: "const shop = 'ShopLite';     // a string\nlet itemsInCart = 2;          // a number that will change\nconst signedIn = true;        // a boolean\nitemsInCart = itemsInCart + 1;\n\nfunction double(x) {\n  return x * 2;\n}\ndouble(21);   // 42" },
            { type: "jsrun", heading: "Your turn: write a function", exercise: "js-x-greet" }
        ],
        why: "Every program, test script and automation is built from values, variables and functions. Testers who automate need exactly these foundations.",
        analogy: "A variable is a labelled box; a function is a recipe card: give it ingredients, it gives back a dish.",
        mistakes: ["Printing with console.log when the task says return.", "Using let everywhere, so values change by accident.", "Forgetting the quotes around text."],
        check: [
            { q: "When should you use const?", a: "When the name will not be given a new value; it is the safer default." },
            { q: "What does return do?", a: "It ends the function and gives a value back to the code that called it." }
        ],
        summary: "Values are strings, numbers or booleans; const and let name them; functions take parameters and return results."
    },
    {
        id: "js-conditions", title: "Comparisons and conditions", level: "beginner",
        objectives: ["Compare values with === and the ordering operators", "Branch with if, else if and else", "Test boundaries"],
        intro: "Programs make decisions with comparisons that produce true or false: === (equal), !== (not equal), <, <=, > and >=. An if statement runs code only when its condition is true. Always use === rather than ==, which converts types in surprising ways.",
        blocks: [
            { type: "example", title: "Branching", text: "function shippingLabel(days) {\n  if (days <= 2) return 'Fast';\n  else if (days <= 5) return 'Standard';\n  else return 'Slow';\n}\n0 == ''    // true (!) because == converts types\n0 === ''   // false: different types" },
            { type: "jsrun", heading: "Your turn: a business rule", exercise: "js-x-delivery" }
        ],
        why: "Business rules are conditions, and boundaries are where they break. A tester who writes code thinks about the exact value at the edge.",
        analogy: "A condition is a fork in the road with a signpost: true goes left, false goes right.",
        mistakes: ["Using == instead of ===.", "> where the rule says 'or more' (>=), or the reverse.", "Putting a broader condition before a narrower one."],
        check: [
            { q: "What is the difference between == and ===?", a: "=== compares value and type without conversion; == converts types first." },
            { q: "\"Orders of ₹500 or more\" uses which operator?", a: ">= 500." }
        ],
        summary: "Compare with === and the ordering operators, branch with if and else, and test the exact boundary values."
    },
    {
        id: "js-loops", title: "Loops", level: "beginner",
        objectives: ["Repeat work with for and for...of", "Accumulate a total in a loop", "Avoid off-by-one errors and endless loops"],
        intro: "Loops repeat code. A for loop counts (start; condition; step). A for...of loop visits each item of an array. Inside a loop you often update an accumulator, such as a running total. If the condition never becomes false, the loop never ends; this page stops your code after 2 seconds if that happens.",
        blocks: [
            { type: "example", title: "Two kinds of loop", text: "for (let i = 1; i <= 3; i++) console.log(i);   // 1, 2, 3\n\nconst prices = [499, 1299, 349];\nlet total = 0;\nfor (const p of prices) total += p;              // 2147" },
            { type: "jsrun", heading: "Your turn: add with a loop", exercise: "js-x-sum-to" },
            { type: "jsrun", heading: "Your turn: the classic FizzBuzz", exercise: "js-x-fizzbuzz" }
        ],
        why: "Repetition over data (rows, products, test cases) is in every program. FizzBuzz is still asked in interviews to check loops and conditions together.",
        analogy: "A loop is a cashier scanning items one by one until the basket is empty.",
        mistakes: ["< instead of <= (one too few).", "Forgetting to update the counter, so the loop never ends.", "Checking a broad condition before the special case."],
        check: [
            { q: "What does for...of give you on each pass?", a: "The next item of the array (or other iterable)." },
            { q: "What makes a loop endless?", a: "A condition that never becomes false, for example a counter that is never updated." }
        ],
        summary: "Use for to count and for...of to visit items; update an accumulator, mind the boundary and make sure the loop ends."
    },
    {
        id: "js-arrays", title: "Arrays", level: "beginner",
        objectives: ["Create and index arrays", "Loop through arrays", "Handle empty arrays and negative numbers"],
        intro: "An array is an ordered list: [3, 9, 2]. Items are numbered from 0, so the first is numbers[0] and the length is numbers.length. push adds to the end. Functions that take arrays must cope with edge cases: an empty array, one item, negative numbers.",
        blocks: [
            { type: "jsrun", heading: "Your turn: find the largest", exercise: "js-x-largest" }
        ],
        why: "Lists of things (orders, test results, users) are everywhere. Edge cases with arrays cause many real bugs.",
        analogy: "An array is a row of numbered lockers, starting at locker 0.",
        mistakes: ["Starting an index at 1.", "Assuming the array is never empty.", "Initialising a 'largest so far' with 0."],
        check: [
            { q: "What is the index of the last item?", a: "length − 1." },
            { q: "Why test with negative numbers?", a: "Code that starts from 0 as the 'largest so far' fails when every value is negative." }
        ],
        summary: "Arrays are zero-indexed lists; loop through them, and always test empty, single-item and negative-number cases."
    },
    {
        id: "js-objects-strings", title: "Objects and strings", level: "beginner",
        objectives: ["Store related values in objects", "Use string methods", "Count with an object"],
        intro: "An object groups named values: { name: 'Lamp', price: 1299 }. Read a property with product.name or product['name']. Strings have methods such as toLowerCase, trim, split and includes. An object can also act as a tally, with each key counting how often it appears.",
        blocks: [
            { type: "example", title: "Objects and string methods", text: "const product = { name: 'LED Desk Lamp', price: 1299 };\nproduct.price;                 // 1299\n'  SAVE10 '.trim();            // 'SAVE10'\n'a b c'.split(' ');            // ['a', 'b', 'c']\nconst counts = {};\ncounts.pune = (counts.pune ?? 0) + 1;" },
            { type: "jsrun", heading: "Your turn: count words", exercise: "js-x-count-words" }
        ],
        why: "Data from APIs arrives as objects (JSON), and user input arrives as strings that must be cleaned. Both are daily work.",
        analogy: "An object is a form with labelled fields; a string method is a tool that tidies what someone wrote in a field.",
        mistakes: ["Forgetting that string comparison is case-sensitive.", "Not trimming user input.", "Reading a property that does not exist, which quietly gives an empty value instead of an error."],
        check: [
            { q: "What does ?? do in counts[w] ?? 0?", a: "Uses 0 when the left side has no value (null, or a key not counted yet)." },
            { q: "Why lower-case words before counting?", a: "So 'Go' and 'go' count as the same word." }
        ],
        summary: "Objects hold named values and work as tallies; string methods clean and split text. Normalise text before comparing it."
    },
    {
        id: "js-array-methods", title: "map, filter, reduce and sort", level: "intermediate",
        objectives: ["Transform arrays with map", "Select items with filter", "Combine values with reduce", "Chain methods"],
        intro: "Array methods replace many loops with a clear statement of intent. map transforms each item, filter keeps items that pass a test, reduce combines all items into one value and sort orders them. They can be chained: products.filter(...).map(...).sort().",
        blocks: [
            { type: "jsrun", heading: "Your turn: total a cart with reduce", exercise: "js-x-cart-total" },
            { type: "jsrun", heading: "Your turn: chain filter, map and sort", exercise: "js-x-in-stock" }
        ],
        why: "Modern JavaScript, including test code and front-end frameworks, is written with these methods. Reading them fluently is essential.",
        analogy: "map is a stamping machine, filter is a sieve, reduce is a till adding up the basket.",
        mistakes: ["reduce without a starting value.", "Forgetting that sort changes the original array.", "Using map when you meant filter."],
        check: [
            { q: "What does filter return?", a: "A new array with only the items for which the test returned true." },
            { q: "Why give reduce a starting value?", a: "Without it, an empty array throws and the first item is used as the start, which is wrong when items are objects." }
        ],
        summary: "map transforms, filter selects, reduce combines and sort orders; chain them and always give reduce a starting value."
    },
    {
        id: "js-errors", title: "Errors, validation and debugging", level: "intermediate",
        objectives: ["Throw and catch errors", "Validate user input", "Debug with console.log and reading error messages"],
        intro: "When code cannot continue, it throws an error, and try...catch handles it. Validate input at the edge: turn text into the type you need and reject anything outside the rules with a clear error. When something goes wrong, read the error message and line, then add console.log to see actual values.",
        blocks: [
            { type: "example", title: "Throwing and catching", text: "function checkCoupon(code) {\n  if (code !== 'SAVE10') throw new Error('Unknown coupon');\n  return 10;\n}\ntry {\n  checkCoupon('SAVE99');\n} catch (error) {\n  console.log(error.message);   // 'Unknown coupon'\n}" },
            { type: "jsrun", heading: "Your turn: validate a quantity", exercise: "js-x-parse-qty" }
        ],
        why: "Most security and reliability bugs come from trusting input. Clear validation and good debugging habits save hours.",
        analogy: "Validation is the bouncer at the door: problems are stopped at the entrance, not discovered inside.",
        mistakes: ["Using parseInt, which silently accepts '2.5' and '3abc'.", "Catching errors and ignoring them.", "Debugging by guessing instead of looking at values."],
        check: [
            { q: "What does parseInt('3abc') return?", a: "3: it stops at the first non-digit, which is why it is unsafe for validation." },
            { q: "What is the first thing to read when code fails?", a: "The error message and the line it points to." }
        ],
        summary: "Validate input strictly, throw clear errors, handle them with try...catch and debug from the error message and actual values."
    },
    {
        id: "js-async", title: "Asynchronous JavaScript: promises and await", level: "intermediate",
        objectives: ["Explain why JavaScript is asynchronous", "Use async functions and await", "Handle errors in async code"],
        intro: "Network requests, timers and file reads take time. Instead of blocking, JavaScript returns a promise, a value that arrives later. An async function can await a promise, which pauses that function until the value is ready without freezing the page. Errors in awaited promises are caught with try...catch.",
        blocks: [
            { type: "example", title: "async and await", text: "async function loadProducts() {\n  try {\n    const response = await fetch('/api/products');\n    if (!response.ok) throw new Error(`HTTP ${response.status}`);\n    return await response.json();\n  } catch (error) {\n    console.log('Could not load products:', error.message);\n    return [];\n  }\n}" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "What does an async function always return?", options: ["A promise", "The value directly"], answer: 0, explain: "Even return 5 inside an async function gives a promise that resolves to 5." },
                { q: "You forget await before fetch(...). What do you get?", options: ["A pending promise instead of the response", "The response anyway"], answer: 0, explain: "This is the same mistake as a missing await in Playwright tests." },
                { q: "Two independent requests: how do you run them at the same time?", options: ["await Promise.all([a(), b()])", "await a(); await b();"], answer: 0, explain: "Promise.all waits for both while they run in parallel." }
            ] }
        ],
        why: "Every web app and every Playwright test is asynchronous. Missing or misplaced await is one of the most common bugs.",
        analogy: "A promise is a restaurant buzzer: you get it now, and it tells you when the food is ready.",
        mistakes: ["Forgetting await.", "Not checking response.ok.", "Awaiting independent tasks one after another."],
        check: [
            { q: "What does await do?", a: "Pauses the async function until the promise settles, then gives its value (or throws its error)." },
            { q: "How do you catch an error from an awaited promise?", a: "Wrap the await in try...catch." }
        ],
        summary: "Slow operations return promises; async functions await them without blocking. Always await, check responses and catch errors."
    },
    {
        id: "js-problem-solving", title: "Problem solving and complexity", level: "advanced",
        objectives: ["Break a problem into steps", "Estimate time complexity with Big O", "Use a Map or Set to speed up a solution"],
        intro: "Solve problems by restating them, working through a small example by hand, writing the simplest correct solution and then improving it. Big O describes how work grows with input size: one loop is O(n), a loop inside a loop is O(n²). A Map or Set lookup is close to constant time, which turns many O(n²) solutions into O(n).",
        blocks: [
            { type: "jsrun", heading: "Your turn: palindromes", exercise: "js-x-palindrome" },
            { type: "jsrun", heading: "Your turn: two sum in one pass", exercise: "js-x-two-sum" },
            { type: "jsrun", heading: "Your turn: remove duplicates", exercise: "js-x-unique" }
        ],
        why: "Coding interviews are built on these problems, and real systems slow down badly when an O(n²) loop meets a large list.",
        analogy: "Looking a name up in a phone book's index (a Map) is far faster than reading every page (a loop).",
        mistakes: ["Writing code before understanding the example.", "Nested loops over large data.", "Ignoring edge cases: empty input, duplicates, one item."],
        check: [
            { q: "What is the complexity of checking every pair in an array?", a: "O(n²)." },
            { q: "Why does a Map make two-sum O(n)?", a: "Each complement lookup is near constant time, so one pass suffices." }
        ],
        summary: "Understand the problem with an example, write a correct solution, then improve it; Maps and Sets often replace nested loops."
    },
    {
        id: "js-clean-code", title: "Clean code, modules and testing your code", level: "advanced",
        objectives: ["Write readable functions", "Split code into modules", "Write unit tests for your functions"],
        intro: "Code is read far more often than written. Give functions one job and clear names, avoid repeating yourself and keep side effects at the edges. ES modules split code into files with export and import. Unit tests call functions with known inputs and check outputs, exactly as the exercises on these pages do.",
        blocks: [
            { type: "example", title: "A module and its test (Node's built-in test runner)", text: "// cart.js\nexport function cartTotal(items) {\n  return items.reduce((sum, i) => sum + i.price * i.qty, 0);\n}\n\n// cart.test.js\nimport test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { cartTotal } from './cart.js';\n\ntest('empty cart totals 0', () => {\n  assert.equal(cartTotal([]), 0);\n});" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which name is clearer?", options: ["calc(d)", "deliveryFee(orderTotal)"], answer: 1, explain: "Names should say what a function does and what it takes." },
                { q: "A function fetches data, calculates a discount and updates the page. What would improve it?", options: ["Split it so the discount calculation is a separate, pure function you can unit-test", "Add comments"], answer: 0, explain: "Pure functions with one job are easy to test and reuse." },
                { q: "What should a unit test include besides typical inputs?", options: ["Edge cases and boundaries", "Nothing else"], answer: 0, explain: "Empty input, boundaries and invalid values are where bugs live." }
            ] }
        ],
        why: "Teams judge developers and automation engineers by code others can read, change and trust. Tests are the safety net for change.",
        analogy: "Clean code is a well-labelled kitchen: anyone can find the knives and cook without asking.",
        mistakes: ["Functions that do several unrelated things.", "Copy-pasted logic.", "No tests for edge cases."],
        check: [
            { q: "What makes a function easy to unit-test?", a: "It is pure: the same inputs always give the same output, with no hidden side effects." },
            { q: "What do export and import do?", a: "Share functions and values between module files." }
        ],
        summary: "Write small, well-named, pure functions, organise them in modules and protect them with unit tests that include edge cases."
    }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. JavaScript interviews often probe the language's surprises, so read why.",
    description: "12 JavaScript interview questions with explained answers: types and equality, scope, arrays, closures, promises, the event loop and complexity.",
    coding: [],
    quiz: [
        { q: "What is the difference between == and ===?", options: ["=== compares without type conversion", "None"], answer: 0, explain: "Prefer ===." },
        { q: "let versus const?", options: ["const cannot be reassigned; let can", "const makes objects immutable"], answer: 0, explain: "const prevents reassignment, but an object's properties can still change." },
        { q: "What is typeof null?", options: ["\"object\"", "\"null\""], answer: 0, explain: "A long-standing quirk of the language." },
        { q: "What is a closure?", options: ["A function that remembers the variables of the scope where it was created", "A closed loop"], answer: 0, explain: "Closures power callbacks, private state and factories." },
        { q: "What does [1, 2, 3].map(x => x * 2) return?", options: ["[2, 4, 6]", "12"], answer: 0, explain: "map returns a new array." },
        { q: "What does [10, 9, 1].sort() return?", options: ["[1, 10, 9]", "[1, 9, 10]"], answer: 0, explain: "Default sort compares strings; use sort((a, b) => a - b) for numbers." },
        { q: "0.1 + 0.2 === 0.3?", options: ["false", "true"], answer: 0, explain: "Floating-point rounding; compare with a tolerance or use integers (paise, not rupees)." },
        { q: "What does an async function return?", options: ["A promise", "Its value directly"], answer: 0, explain: "Callers must await it." },
        { q: "What order is logged? console.log('a'); setTimeout(() => console.log('b'), 0); console.log('c');", options: ["a, c, b", "a, b, c"], answer: 0, explain: "The timer callback waits for the current code to finish (the event loop)." },
        { q: "Promise.all fails when?", options: ["As soon as any of the promises rejects", "Only if all reject"], answer: 0, explain: "Use Promise.allSettled to get every outcome." },
        { q: "Complexity of a loop inside a loop over n items?", options: ["O(n²)", "O(n)"], answer: 0, explain: "Work grows with the square of the input." },
        { q: "How do you remove duplicates from an array simply?", options: ["[...new Set(arr)]", "arr.unique()"], answer: 0, explain: "There is no built-in unique method; a Set does it." }
    ]
};
