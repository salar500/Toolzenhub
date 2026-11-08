/* =========================================================
   ToolZen Hub
   JavaScript path: exercises run against test cases in a Web Worker (js-worker.js). Each has a model that passes and
   buggy versions that must fail at least one test (unit-tested); the starter must not pass.
========================================================= */

export const JS_EXERCISES = Object.freeze([
    {
        id: "js-x-greet", fn: "greet",
        task: "Write greet(name) so it returns a greeting such as \"Hello, Asha!\" for the name given.",
        starter: "function greet(name) {\n  // return the greeting\n}",
        tests: [{ args: ["Asha"], expect: "Hello, Asha!" }, { args: ["Ravi"], expect: "Hello, Ravi!" }],
        model: "function greet(name) {\n  return `Hello, ${name}!`;\n}",
        buggy: ["function greet(name) {\n  return 'Hello, ' + name;\n}"],
        explain: "A template literal (backticks) inserts the value of name with ${...}. Return the string: printing it with console.log is not the same as returning it."
    },
    {
        id: "js-x-delivery", fn: "deliveryFee",
        task: "ShopLite charges ₹49 delivery, but orders over ₹999 ship free. Write deliveryFee(total) to return the fee.",
        starter: "function deliveryFee(total) {\n  \n}",
        tests: [{ args: [500], expect: 49 }, { args: [999], expect: 49 }, { args: [1000], expect: 0 }, { args: [2500], expect: 0 }],
        model: "function deliveryFee(total) {\n  if (total > 999) return 0;\n  return 49;\n}",
        buggy: ["function deliveryFee(total) {\n  return total >= 999 ? 0 : 49;\n}"],
        explain: "\"Over ₹999\" means greater than 999, so ₹999 itself still pays. The boundary test with exactly 999 catches the common >= mistake."
    },
    {
        id: "js-x-sum-to", fn: "sumTo",
        task: "Write sumTo(n) that adds the whole numbers from 1 to n using a loop. sumTo(0) is 0.",
        starter: "function sumTo(n) {\n  let total = 0;\n  // loop here\n  return total;\n}",
        tests: [{ args: [1], expect: 1 }, { args: [5], expect: 15 }, { args: [100], expect: 5050 }, { args: [0], expect: 0 }],
        model: "function sumTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) total += i;\n  return total;\n}",
        buggy: ["function sumTo(n) {\n  let total = 0;\n  for (let i = 1; i < n; i++) total += i;\n  return total;\n}"],
        explain: "Loop from 1 while i <= n. Using < n stops one early, the classic off-by-one error."
    },
    {
        id: "js-x-fizzbuzz", fn: "fizzBuzz",
        task: "Write fizzBuzz(n) returning an array of strings for 1 to n: \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5, \"FizzBuzz\" for both, otherwise the number as a string.",
        starter: "function fizzBuzz(n) {\n  const out = [];\n  return out;\n}",
        tests: [{ args: [5], expect: ["1", "2", "Fizz", "4", "Buzz"] }, { args: [15], expect: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] }],
        model: "function fizzBuzz(n) {\n  const out = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) out.push('FizzBuzz');\n    else if (i % 3 === 0) out.push('Fizz');\n    else if (i % 5 === 0) out.push('Buzz');\n    else out.push(String(i));\n  }\n  return out;\n}",
        buggy: ["function fizzBuzz(n) {\n  const out = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 3 === 0) out.push('Fizz');\n    else if (i % 5 === 0) out.push('Buzz');\n    else if (i % 15 === 0) out.push('FizzBuzz');\n    else out.push(String(i));\n  }\n  return out;\n}"],
        explain: "Check the combined case (divisible by 15) first: otherwise the multiple-of-3 branch catches 15 and FizzBuzz is never reached."
    },
    {
        id: "js-x-largest", fn: "largest",
        task: "Write largest(numbers) that returns the largest number in the array, or null for an empty array. Negative numbers are allowed.",
        starter: "function largest(numbers) {\n  \n}",
        tests: [{ args: [[3, 9, 2]], expect: 9 }, { args: [[-5, -2, -9]], expect: -2 }, { args: [[]], expect: null }, { args: [[7]], expect: 7 }],
        model: "function largest(numbers) {\n  if (numbers.length === 0) return null;\n  let best = numbers[0];\n  for (const n of numbers) if (n > best) best = n;\n  return best;\n}",
        buggy: ["function largest(numbers) {\n  let best = 0;\n  for (const n of numbers) if (n > best) best = n;\n  return best;\n}"],
        explain: "Start from the first element, not 0: with all-negative numbers a start of 0 would be returned wrongly. Handle the empty array explicitly."
    },
    {
        id: "js-x-count-words", fn: "countWords",
        task: "Write countWords(text) returning an object that counts each word, in lower case. Words are separated by spaces.",
        starter: "function countWords(text) {\n  const counts = {};\n  return counts;\n}",
        tests: [{ args: ["the cat and the hat"], expect: { the: 2, cat: 1, and: 1, hat: 1 } }, { args: ["Go go GO"], expect: { go: 3 } }, { args: [""], expect: {} }],
        model: "function countWords(text) {\n  const counts = {};\n  for (const word of text.toLowerCase().split(' ')) {\n    if (!word) continue;\n    counts[word] = (counts[word] ?? 0) + 1;\n  }\n  return counts;\n}",
        buggy: ["function countWords(text) {\n  const counts = {};\n  for (const word of text.split(' ')) counts[word] = (counts[word] ?? 0) + 1;\n  return counts;\n}"],
        explain: "Lower-case first so Go and GO count together, and skip empty strings, which split('') produces for an empty text."
    },
    {
        id: "js-x-cart-total", fn: "cartTotal",
        task: "Write cartTotal(items), where each item is { price, qty }, returning the total with reduce.",
        starter: "function cartTotal(items) {\n  \n}",
        tests: [{ args: [[{ price: 499, qty: 2 }, { price: 1299, qty: 1 }]], expect: 2297 }, { args: [[]], expect: 0 }],
        model: "function cartTotal(items) {\n  return items.reduce((sum, item) => sum + item.price * item.qty, 0);\n}",
        buggy: ["function cartTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}", "function cartTotal(items) {\n  return items.reduce((sum, item) => sum + item.price * item.qty);\n}"],
        explain: "reduce carries a running total; give it a starting value of 0, or an empty cart throws and the first item is added as an object."
    },
    {
        id: "js-x-in-stock", fn: "inStockNames",
        task: "Write inStockNames(products), where each product is { name, stock }, returning the names of products with stock above 0, sorted alphabetically.",
        starter: "function inStockNames(products) {\n  \n}",
        tests: [{ args: [[{ name: "Lamp", stock: 3 }, { name: "Backpack", stock: 0 }, { name: "Bottle", stock: 12 }]], expect: ["Bottle", "Lamp"] }, { args: [[]], expect: [] }],
        model: "function inStockNames(products) {\n  return products.filter((p) => p.stock > 0).map((p) => p.name).sort();\n}",
        buggy: ["function inStockNames(products) {\n  return products.filter((p) => p.stock >= 0).map((p) => p.name).sort();\n}"],
        explain: "filter keeps the matching items, map picks the field, sort orders the strings. Chain them in that order."
    },
    {
        id: "js-x-parse-qty", fn: "parseQty",
        task: "Write parseQty(text) that turns a quantity typed by a user into a whole number from 1 to 10, and throws new Error(\"Invalid quantity\") for anything else.",
        starter: "function parseQty(text) {\n  \n}",
        tests: [{ args: ["3"], expect: 3 }, { args: [" 10 "], expect: 10 }, { args: ["0"], throws: "Invalid quantity" }, { args: ["11"], throws: "Invalid quantity" }, { args: ["2.5"], throws: "Invalid quantity" }, { args: ["abc"], throws: "Invalid quantity" }],
        model: "function parseQty(text) {\n  const n = Number(text.trim());\n  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('Invalid quantity');\n  return n;\n}",
        buggy: ["function parseQty(text) {\n  const n = parseInt(text, 10);\n  if (n < 1 || n > 10) throw new Error('Invalid quantity');\n  return n;\n}"],
        explain: "parseInt('2.5') quietly returns 2 and parseInt('abc') returns NaN, which passes neither comparison. Number plus Number.isInteger rejects both."
    },
    {
        id: "js-x-palindrome", fn: "isPalindrome",
        task: "Write isPalindrome(text) returning true when the text reads the same backwards, ignoring case, spaces and punctuation.",
        starter: "function isPalindrome(text) {\n  \n}",
        tests: [{ args: ["Racecar"], expect: true }, { args: ["Never odd or even"], expect: true }, { args: ["ShopLite"], expect: false }, { args: [""], expect: true }],
        model: "function isPalindrome(text) {\n  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === [...clean].reverse().join('');\n}",
        buggy: ["function isPalindrome(text) {\n  return text === text.split('').reverse().join('');\n}"],
        explain: "Normalise first (lower case, letters and digits only), then compare with the reversed string."
    },
    {
        id: "js-x-two-sum", fn: "twoSum",
        task: "Write twoSum(nums, target) returning the indices [i, j] (i < j) of the two numbers that add up to target. Aim for one pass with a Map.",
        starter: "function twoSum(nums, target) {\n  \n}",
        tests: [{ args: [[2, 7, 11, 15], 9], expect: [0, 1] }, { args: [[3, 2, 4], 6], expect: [1, 2] }, { args: [[3, 3], 6], expect: [0, 1] }],
        model: "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let j = 0; j < nums.length; j++) {\n    const need = target - nums[j];\n    if (seen.has(need)) return [seen.get(need), j];\n    seen.set(nums[j], j);\n  }\n  return null;\n}",
        buggy: ["function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++)\n    for (let j = 0; j < nums.length; j++)\n      if (nums[i] + nums[j] === target) return [i, j];\n}"],
        explain: "Remember each number's index in a Map; for each new number, check whether its complement was seen. One pass is O(n). The buggy version can pair a number with itself ([3, 2, 4] gives [0, 0])."
    },
    {
        id: "js-x-unique", fn: "unique",
        task: "Write unique(values) returning the values without duplicates, keeping the first occurrence order.",
        starter: "function unique(values) {\n  \n}",
        tests: [{ args: [[3, 1, 3, 2, 1]], expect: [3, 1, 2] }, { args: [["a", "b", "a"]], expect: ["a", "b"] }, { args: [[]], expect: [] }],
        model: "function unique(values) {\n  return [...new Set(values)];\n}",
        buggy: ["function unique(values) {\n  return [...new Set(values)].sort();\n}"],
        explain: "A Set keeps one of each value in insertion order; spreading it back gives an array. Sorting changes the order the task asked to keep."
    },
    {
        id: "be-x-route", fn: "matchRoute",
        task: "Write matchRoute(pattern, path) for a tiny router: patterns such as \"/api/orders/:id\" match paths with the same number of segments, where :name captures that segment. Return an object of captured params, or null when the path does not match.",
        starter: "function matchRoute(pattern, path) {\n  \n}",
        tests: [{ args: ["/api/orders/:id", "/api/orders/SL-1004"], expect: { id: "SL-1004" } }, { args: ["/api/users/:userId/orders/:orderId", "/api/users/7/orders/SL-1"], expect: { userId: "7", orderId: "SL-1" } }, { args: ["/api/orders/:id", "/api/orders"], expect: null }, { args: ["/api/orders/:id", "/api/products/3"], expect: null }, { args: ["/health", "/health"], expect: {} }],
        model: "function matchRoute(pattern, path) {\n  const p = pattern.split('/'), s = path.split('/');\n  if (p.length !== s.length) return null;\n  const params = {};\n  for (let i = 0; i < p.length; i++) {\n    if (p[i].startsWith(':')) params[p[i].slice(1)] = s[i];\n    else if (p[i] !== s[i]) return null;\n  }\n  return params;\n}",
        buggy: ["function matchRoute(pattern, path) {\n  const p = pattern.split('/'), s = path.split('/');\n  const params = {};\n  for (let i = 0; i < p.length; i++) {\n    if (p[i].startsWith(':')) params[p[i].slice(1)] = s[i];\n  }\n  return params;\n}"],
        explain: "Compare segment by segment: fixed segments must be equal and :name segments are captured. Checking the segment count first stops /api/orders matching /api/orders/:id."
    },
    {
        id: "be-x-validate", fn: "validateOrder",
        task: "Write validateOrder(body) for POST /api/orders. Return an array of error objects { field, message } (empty when valid): email must contain @, items must be a non-empty array, and every item needs a whole-number qty from 1 to 10.",
        starter: "function validateOrder(body) {\n  const errors = [];\n  return errors;\n}",
        tests: [{ args: [{ email: "asha@example.com", items: [{ id: 1, qty: 2 }] }], expect: [] }, { args: [{ email: "asha", items: [] }], expect: [{ field: "email", message: "must be a valid email" }, { field: "items", message: "must contain at least one item" }] }, { args: [{ email: "a@b.in", items: [{ id: 1, qty: 0 }, { id: 2, qty: 2.5 }] }], expect: [{ field: "items[0].qty", message: "must be a whole number from 1 to 10" }, { field: "items[1].qty", message: "must be a whole number from 1 to 10" }] }, { args: [{}], expect: [{ field: "email", message: "must be a valid email" }, { field: "items", message: "must contain at least one item" }] }],
        model: "function validateOrder(body) {\n  const errors = [];\n  if (typeof body.email !== 'string' || !body.email.includes('@')) errors.push({ field: 'email', message: 'must be a valid email' });\n  if (!Array.isArray(body.items) || body.items.length === 0) {\n    errors.push({ field: 'items', message: 'must contain at least one item' });\n    return errors;\n  }\n  body.items.forEach((item, i) => {\n    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 10) errors.push({ field: `items[${i}].qty`, message: 'must be a whole number from 1 to 10' });\n  });\n  return errors;\n}",
        buggy: ["function validateOrder(body) {\n  if (!body.email.includes('@')) return [{ field: 'email', message: 'must be a valid email' }];\n  if (!body.items.length) return [{ field: 'items', message: 'must contain at least one item' }];\n  return [];\n}"],
        explain: "Collect every problem instead of stopping at the first, so the client can show all of them (the 422 pattern), and never assume fields exist: a missing email must not crash the server."
    },
    {
        id: "be-x-paginate", fn: "paginate",
        task: "Write paginate(items, page, size) returning { items, page, totalPages, hasNext } for 1-based pages. A page beyond the end returns an empty items array; page and size below 1 count as 1.",
        starter: "function paginate(items, page, size) {\n  \n}",
        tests: [{ args: [[1, 2, 3, 4, 5], 1, 2], expect: { items: [1, 2], page: 1, totalPages: 3, hasNext: true } }, { args: [[1, 2, 3, 4, 5], 3, 2], expect: { items: [5], page: 3, totalPages: 3, hasNext: false } }, { args: [[1, 2, 3], 9, 2], expect: { items: [], page: 9, totalPages: 2, hasNext: false } }, { args: [[1, 2, 3], 0, 0], expect: { items: [1], page: 1, totalPages: 3, hasNext: true } }, { args: [[], 1, 10], expect: { items: [], page: 1, totalPages: 0, hasNext: false } }],
        model: "function paginate(items, page, size) {\n  page = Math.max(1, page);\n  size = Math.max(1, size);\n  const totalPages = Math.ceil(items.length / size);\n  const start = (page - 1) * size;\n  return { items: items.slice(start, start + size), page, totalPages, hasNext: page < totalPages };\n}",
        buggy: ["function paginate(items, page, size) {\n  const start = page * size;\n  const totalPages = Math.ceil(items.length / size);\n  return { items: items.slice(start, start + size), page, totalPages, hasNext: page < totalPages };\n}"],
        explain: "For 1-based pages the first item is at (page − 1) × size. Clamping bad input and computing totalPages with Math.ceil gives clients what they need to show navigation."
    },
    {
        id: "be-x-money", fn: "orderTotalPaise",
        task: "Money must not use floating point. Write orderTotalPaise(lines), where each line is { pricePaise, qty }, returning the total in paise plus 18% GST rounded to the nearest paisa (halves round up). Delivery is 4900 paise unless the items total exceeds 99900 paise.",
        starter: "function orderTotalPaise(lines) {\n  \n}",
        tests: [{ args: [[{ pricePaise: 49900, qty: 2 }]], expect: 117764 + 4900 }, { args: [[{ pricePaise: 49950, qty: 2 }]], expect: 122782 }, { args: [[{ pricePaise: 10, qty: 3 }]], expect: 35 + 4900 }],
        model: "function orderTotalPaise(lines) {\n  const items = lines.reduce((sum, l) => sum + l.pricePaise * l.qty, 0);\n  const gst = Math.round((items * 18) / 100);\n  const delivery = items > 99900 ? 0 : 4900;\n  return items + gst + delivery;\n}",
        buggy: ["function orderTotalPaise(lines) {\n  const rupees = lines.reduce((sum, l) => sum + (l.pricePaise / 100) * l.qty, 0);\n  const total = rupees * 1.18 + (rupees > 999 ? 0 : 49);\n  return total * 100;\n}"],
        explain: "Keep money as integers in the smallest unit and round once, at a defined step. Converting to rupees and multiplying by 1.18 produces values like 122664.00000000001, which break comparisons and reports."
    },
    {
        id: "be-x-idempotency", fn: "createPaymentHandler",
        task: "Retries must not charge twice. Write createPaymentHandler() returning a function pay(idempotencyKey, amount) that returns { paymentId, amount, replayed }. The first call with a key creates payment P1, P2 and so on; a repeat with the same key returns the original result with replayed: true and creates nothing. Reusing a key with a different amount throws Error(\"Idempotency key reused with a different request\").",
        starter: "function createPaymentHandler() {\n  return function pay(key, amount) {\n  };\n}",
        tests: [{ args: [], expect: "P1,P1,P2,true", call: "pay k1, repeat k1, pay k2, reuse k1 with 900" }],
        model: "function createPaymentHandler() {\n  const seen = new Map();\n  let next = 1;\n  return function pay(key, amount) {\n    if (seen.has(key)) {\n      const first = seen.get(key);\n      if (first.amount !== amount) throw new Error('Idempotency key reused with a different request');\n      return { ...first, replayed: true };\n    }\n    const result = { paymentId: `P${next++}`, amount, replayed: false };\n    seen.set(key, result);\n    return result;\n  };\n}",
        buggy: ["function createPaymentHandler() {\n  let next = 1;\n  return function pay(key, amount) {\n    return { paymentId: `P${next++}`, amount, replayed: false };\n  };\n}"],
        explain: "Store the result under the idempotency key and return it for repeats, so a network retry cannot create a second charge; a different request with the same key is a client bug and is refused.",
        harness: "const pay = createPaymentHandler();\nconst a = pay('k1', 500), b = pay('k1', 500), c = pay('k2', 500);\nlet threw = false;\ntry { pay('k1', 900); } catch (e) { threw = e.message === 'Idempotency key reused with a different request'; }\nreturn [a.paymentId, b.paymentId, c.paymentId, b.replayed && !a.replayed && threw].join(',');"
    },
    {
        id: "dsa-x-brackets", fn: "isBalanced",
        task: "Write isBalanced(text) returning true when every (, [ and { is closed by the matching bracket in the right order. Other characters are ignored. Use a stack.",
        starter: "function isBalanced(text) {\n  const stack = [];\n  return true;\n}",
        tests: [{ args: ["(a[b]{c})"], expect: true }, { args: ["([)]"], expect: false }, { args: ["(("], expect: false }, { args: ["())"], expect: false }, { args: [""], expect: true }],
        model: "function isBalanced(text) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const ch of text) {\n    if ('([{'.includes(ch)) stack.push(ch);\n    else if (ch in pairs && stack.pop() !== pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}",
        buggy: ["function isBalanced(text) {\n  let open = 0;\n  for (const ch of text) {\n    if ('([{'.includes(ch)) open++;\n    else if (')]}'.includes(ch)) open--;\n  }\n  return open === 0;\n}"],
        explain: "A stack remembers the order of opening brackets, so ([)] fails; counting alone cannot see order. A closer with nothing to pop is unmatched, and leftovers at the end mean unclosed brackets."
    },
    {
        id: "dsa-x-binary-search", fn: "binarySearch",
        task: "Write binarySearch(sorted, target) returning the index of target in a sorted array, or -1. It must take O(log n) steps.",
        starter: "function binarySearch(sorted, target) {\n  \n}",
        tests: [{ args: [[2, 5, 8, 12, 16, 23, 38], 23], expect: 5 }, { args: [[2, 5, 8], 2], expect: 0 }, { args: [[2, 5, 8], 8], expect: 2 }, { args: [[2, 5, 8], 6], expect: -1 }, { args: [[], 1], expect: -1 }],
        model: "function binarySearch(sorted, target) {\n  let lo = 0, hi = sorted.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (sorted[mid] === target) return mid;\n    if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}",
        buggy: ["function binarySearch(sorted, target) {\n  let lo = 0, hi = sorted.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (sorted[mid] === target) return mid;\n    if (sorted[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}"],
        explain: "Keep searching while lo <= hi: with lo < hi the last remaining candidate is never checked, so targets at some positions are missed."
    },
    {
        id: "dsa-x-merge", fn: "mergeSorted",
        task: "Write mergeSorted(a, b) that merges two sorted arrays into one sorted array in O(n + m), without calling sort.",
        starter: "function mergeSorted(a, b) {\n  const out = [];\n  return out;\n}",
        tests: [{ args: [[1, 4, 9], [2, 3, 10, 11]], expect: [1, 2, 3, 4, 9, 10, 11] }, { args: [[], [1]], expect: [1] }, { args: [[5, 5], [5]], expect: [5, 5, 5] }],
        model: "function mergeSorted(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);\n  while (i < a.length) out.push(a[i++]);\n  while (j < b.length) out.push(b[j++]);\n  return out;\n}",
        buggy: ["function mergeSorted(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);\n  return out;\n}"],
        explain: "Two pointers walk both arrays; when one runs out, the rest of the other must be copied. This is the merge step of merge sort."
    },
    {
        id: "dsa-x-top-k", fn: "topK",
        task: "Write topK(words, k) returning the k most frequent words, most frequent first, breaking ties alphabetically.",
        starter: "function topK(words, k) {\n  \n}",
        tests: [{ args: [["lamp", "mug", "lamp", "pen", "mug", "lamp"], 2], expect: ["lamp", "mug"] }, { args: [["b", "a", "c", "a", "b"], 2], expect: ["a", "b"] }, { args: [["x"], 3], expect: ["x"] }],
        model: "function topK(words, k) {\n  const counts = new Map();\n  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);\n  return [...counts].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, k).map(([w]) => w);\n}",
        buggy: ["function topK(words, k) {\n  const counts = new Map();\n  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);\n  return [...counts].sort((x, y) => y[1] - x[1]).slice(0, k).map(([w]) => w);\n}"],
        explain: "Count with a Map in O(n), then sort the distinct words by count and name. Without the tie-break, equal counts keep insertion order, which the task does not ask for."
    },
    {
        id: "dsa-x-bfs", fn: "shortestPath",
        task: "Write shortestPath(grid) returning the fewest steps from the top-left to the bottom-right of a grid of strings, where '.' is open and '#' is a wall, moving up, down, left or right; return -1 if unreachable. Use breadth-first search.",
        starter: "function shortestPath(grid) {\n  \n}",
        tests: [{ args: [["..#", "#..", "..."]], expect: 4 }, { args: [[".#", "#."]], expect: -1 }, { args: [["."]], expect: 0 }, { args: [["....", ".##.", "...."]], expect: 5 }, { args: [["..#.", ".#..", "...."]], expect: 5 }],
        model: "function shortestPath(grid) {\n  const rows = grid.length, cols = grid[0].length;\n  if (grid[0][0] === '#' || grid[rows - 1][cols - 1] === '#') return -1;\n  const seen = new Set(['0,0']);\n  let frontier = [[0, 0]], steps = 0;\n  while (frontier.length) {\n    const next = [];\n    for (const [r, c] of frontier) {\n      if (r === rows - 1 && c === cols - 1) return steps;\n      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n        const nr = r + dr, nc = c + dc, key = `${nr},${nc}`;\n        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === '.' && !seen.has(key)) { seen.add(key); next.push([nr, nc]); }\n      }\n    }\n    frontier = next;\n    steps++;\n  }\n  return -1;\n}",
        buggy: ["function shortestPath(grid) {\n  const rows = grid.length, cols = grid[0].length;\n  let r = 0, c = 0, steps = 0;\n  while (r < rows - 1 || c < cols - 1) {\n    if (c < cols - 1 && grid[r][c + 1] === '.') c++;\n    else if (r < rows - 1 && grid[r + 1][c] === '.') r++;\n    else return -1;\n    steps++;\n  }\n  return steps;\n}"],
        explain: "Breadth-first search explores all cells at distance 1, then 2, and so on, so the first time it reaches the goal is the shortest path. A greedy walk can get stuck or take a longer route."
    },
    {
        id: "dsa-x-lru", fn: "createLRU",
        task: "Write createLRU(capacity) returning { get(key), put(key, value) }: a least-recently-used cache. get returns the value or -1 and marks the key as used; put inserts or updates and, when over capacity, evicts the least recently used key. Both in O(1).",
        starter: "function createLRU(capacity) {\n  return { get(key) { return -1; }, put(key, value) {} };\n}",
        tests: [{ args: [], expect: "1,-1,3,4,-1", call: "capacity 2: put 1, put 2, get 1, put 3, get 2, get 3, put 4, get 4, get 1" }],
        model: "function createLRU(capacity) {\n  const map = new Map();\n  return {\n    get(key) {\n      if (!map.has(key)) return -1;\n      const v = map.get(key);\n      map.delete(key);\n      map.set(key, v);\n      return v;\n    },\n    put(key, value) {\n      map.delete(key);\n      map.set(key, value);\n      if (map.size > capacity) map.delete(map.keys().next().value);\n    }\n  };\n}",
        buggy: ["function createLRU(capacity) {\n  const map = new Map();\n  return {\n    get(key) { return map.has(key) ? map.get(key) : -1; },\n    put(key, value) {\n      map.set(key, value);\n      if (map.size > capacity) map.delete(map.keys().next().value);\n    }\n  };\n}"],
        harness: "const c = createLRU(2);\nc.put(1, 1); c.put(2, 2);\nconst a = c.get(1);\nc.put(3, 3);\nconst b = c.get(2), d = c.get(3);\nc.put(4, 4);\nconst e = c.get(4), f = c.get(1);\nreturn [a, b, d, e, f].join(',');",
        explain: "A JavaScript Map keeps insertion order, so deleting and re-inserting a key on every use moves it to the end; the first key is then always the least recently used. The buggy version never refreshes keys on get, so it evicts the wrong one."
    },
    {
        id: "llm-x-chunk", fn: "chunkWords",
        task: "RAG systems split documents into overlapping chunks. Write chunkWords(text, size, overlap) that splits text into words and returns chunks of size words, each starting size − overlap words after the previous one, joined with spaces. Stop once a chunk reaches the last word.",
        starter: "function chunkWords(text, size, overlap) {\n  const words = text.split(/\\s+/).filter(Boolean);\n  const chunks = [];\n  return chunks;\n}",
        tests: [{ args: ["a b c d e f g", 3, 1], expect: ["a b c", "c d e", "e f g"] }, { args: ["a b c d", 2, 0], expect: ["a b", "c d"] }, { args: ["a b", 5, 2], expect: ["a b"] }, { args: ["", 3, 1], expect: [] }],
        model: "function chunkWords(text, size, overlap) {\n  const words = text.split(/\\s+/).filter(Boolean);\n  const chunks = [];\n  const step = size - overlap;\n  for (let start = 0; start < words.length; start += step) {\n    chunks.push(words.slice(start, start + size).join(' '));\n    if (start + size >= words.length) break;\n  }\n  return chunks;\n}",
        buggy: ["function chunkWords(text, size, overlap) {\n  const words = text.split(/\\s+/).filter(Boolean);\n  const chunks = [];\n  for (let start = 0; start < words.length; start += size - overlap) chunks.push(words.slice(start, start + size).join(' '));\n  return chunks;\n}"],
        explain: "Overlap keeps sentences that straddle a boundary in both chunks. Without the stop condition, the loop also emits short tail chunks that only repeat words already covered."
    },
    {
        id: "llm-x-topk", fn: "topKBySimilarity",
        task: "Write topKBySimilarity(query, docs, k) where query is a vector and each doc is { id, vector }. Return the ids of the k docs with the highest cosine similarity, best first.",
        starter: "function topKBySimilarity(query, docs, k) {\n  \n}",
        tests: [{ args: [[1, 0], [{ id: "ship", vector: [0.9, 0.1] }, { id: "refund", vector: [0.1, 0.9] }, { id: "fee", vector: [2, 0.4] }], 2], expect: ["ship", "fee"] }, { args: [[0, 1], [{ id: "a", vector: [1, 0] }, { id: "b", vector: [0, 5] }], 1], expect: ["b"] }],
        model: "function topKBySimilarity(query, docs, k) {\n  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);\n  const norm = (a) => Math.sqrt(dot(a, a));\n  return docs\n    .map((d) => ({ id: d.id, score: dot(query, d.vector) / (norm(query) * norm(d.vector)) }))\n    .sort((x, y) => y.score - x.score)\n    .slice(0, k)\n    .map((d) => d.id);\n}",
        buggy: ["function topKBySimilarity(query, docs, k) {\n  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);\n  return docs.map((d) => ({ id: d.id, score: dot(query, d.vector) })).sort((x, y) => y.score - x.score).slice(0, k).map((d) => d.id);\n}"],
        explain: "Cosine similarity divides by the vectors' lengths, so a long vector does not win just for being long: [2, 0.4] points slightly away from the query and ranks below [0.9, 0.1] even though its dot product is larger."
    },
    {
        id: "llm-x-budget", fn: "fitContext",
        task: "Write fitContext(chunks, budget, reserved) where chunks are { text, tokens } in relevance order. Return the texts that fit in budget − reserved tokens, taking chunks in order and skipping any that would overflow (a later, smaller chunk may still fit).",
        starter: "function fitContext(chunks, budget, reserved) {\n  \n}",
        tests: [{ args: [[{ text: "A", tokens: 300 }, { text: "B", tokens: 600 }, { text: "C", tokens: 150 }], 1000, 200], expect: ["A", "C"] }, { args: [[{ text: "A", tokens: 900 }], 1000, 200], expect: [] }, { args: [[], 1000, 0], expect: [] }],
        model: "function fitContext(chunks, budget, reserved) {\n  let left = budget - reserved;\n  const out = [];\n  for (const c of chunks) {\n    if (c.tokens <= left) { out.push(c.text); left -= c.tokens; }\n  }\n  return out;\n}",
        buggy: ["function fitContext(chunks, budget, reserved) {\n  let left = budget;\n  const out = [];\n  for (const c of chunks) {\n    if (c.tokens <= left) { out.push(c.text); left -= c.tokens; }\n  }\n  return out;\n}"],
        explain: "Reserve space for the instructions and the answer before adding retrieved text, or the model's reply is cut off. Skipping a chunk that does not fit lets a smaller, still relevant one in."
    },
    {
        id: "llm-x-validate-call", fn: "validateToolCall",
        task: "The model proposes tool calls as JSON text. Write validateToolCall(text) for a single tool cancel_order(order_id) where order_id must look like SL- and four digits. Return { ok: true, orderId } or { ok: false, reason } with reason \"not json\", \"unknown tool\" or \"bad order_id\". Never throw.",
        starter: "function validateToolCall(text) {\n  \n}",
        tests: [{ args: ["{\"name\":\"cancel_order\",\"arguments\":{\"order_id\":\"SL-1004\"}}"], expect: { ok: true, orderId: "SL-1004" } }, { args: ["cancel SL-1004"], expect: { ok: false, reason: "not json" } }, { args: ["{\"name\":\"refund_all\",\"arguments\":{}}"], expect: { ok: false, reason: "unknown tool" } }, { args: ["{\"name\":\"cancel_order\",\"arguments\":{\"order_id\":\"1004; DROP\"}}"], expect: { ok: false, reason: "bad order_id" } }, { args: ["{\"name\":\"cancel_order\"}"], expect: { ok: false, reason: "bad order_id" } }],
        model: "function validateToolCall(text) {\n  let call;\n  try { call = JSON.parse(text); } catch { return { ok: false, reason: 'not json' }; }\n  if (call?.name !== 'cancel_order') return { ok: false, reason: 'unknown tool' };\n  const id = call.arguments?.order_id;\n  if (typeof id !== 'string' || !/^SL-\\d{4}$/.test(id)) return { ok: false, reason: 'bad order_id' };\n  return { ok: true, orderId: id };\n}",
        buggy: ["function validateToolCall(text) {\n  const call = JSON.parse(text);\n  if (call.name !== 'cancel_order') return { ok: false, reason: 'unknown tool' };\n  return { ok: true, orderId: call.arguments.order_id };\n}"],
        explain: "Treat model output as untrusted input: parse safely, allow only known tools and validate every argument before acting. The buggy version throws on non-JSON and passes injected text straight through."
    },
    {
        id: "llm-x-backoff", fn: "retryDelays",
        task: "LLM APIs rate-limit with 429 responses. Write retryDelays(attempts, baseMs, capMs) returning the wait before each retry using exponential backoff: baseMs, then doubling, never above capMs. (Production code also adds random jitter; leave it out here so the result is testable.)",
        starter: "function retryDelays(attempts, baseMs, capMs) {\n  \n}",
        tests: [{ args: [5, 500, 4000], expect: [500, 1000, 2000, 4000, 4000] }, { args: [3, 100, 10000], expect: [100, 200, 400] }, { args: [0, 100, 1000], expect: [] }],
        model: "function retryDelays(attempts, baseMs, capMs) {\n  return Array.from({ length: attempts }, (_, i) => Math.min(capMs, baseMs * 2 ** i));\n}",
        buggy: ["function retryDelays(attempts, baseMs, capMs) {\n  return Array.from({ length: attempts }, (_, i) => baseMs * 2 ** i);\n}"],
        explain: "Doubling spreads retries out so a struggling service can recover; the cap keeps waits reasonable. Respect a Retry-After header when the API sends one."
    },
    {
        id: "fe-x-reducer", fn: "cartReducer",
        task: "Write cartReducer(state, action) in the reducer style used by React's useReducer and Redux. state is { items: [{ id, qty }] }. Handle { type: \"add\", id } (add qty 1 or increase it), { type: \"remove\", id } and unknown actions (return the same state). Never mutate state: return new objects.",
        starter: "function cartReducer(state, action) {\n  return state;\n}",
        tests: [{ args: [{ items: [] }, { type: "add", id: 1 }], expect: { items: [{ id: 1, qty: 1 }] } }, { args: [{ items: [{ id: 1, qty: 1 }] }, { type: "add", id: 1 }], expect: { items: [{ id: 1, qty: 2 }] } }, { args: [{ items: [{ id: 1, qty: 2 }, { id: 2, qty: 1 }] }, { type: "remove", id: 1 }], expect: { items: [{ id: 2, qty: 1 }] } }, { args: [], expect: true, call: "the original state object is unchanged after add" }],
        model: "function cartReducer(state, action) {\n  switch (action.type) {\n    case 'add': {\n      const found = state.items.some((i) => i.id === action.id);\n      return { ...state, items: found ? state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i)) : [...state.items, { id: action.id, qty: 1 }] };\n    }\n    case 'remove':\n      return { ...state, items: state.items.filter((i) => i.id !== action.id) };\n    default:\n      return state;\n  }\n}",
        buggy: ["function cartReducer(state, action) {\n  if (action.type === 'add') {\n    const item = state.items.find((i) => i.id === action.id);\n    if (item) item.qty += 1; else state.items.push({ id: action.id, qty: 1 });\n  }\n  if (action.type === 'remove') state.items = state.items.filter((i) => i.id !== action.id);\n  return state;\n}"],
        harness: "if (arguments.length) return cartReducer(...arguments);\nconst before = { items: [{ id: 1, qty: 1 }] };\nconst snapshot = JSON.stringify(before);\nconst after = cartReducer(before, { type: 'add', id: 1 });\nreturn JSON.stringify(before) === snapshot && after !== before;",
        explain: "Frameworks detect changes by comparing references, so a reducer must return new objects instead of mutating; the mutating version changes the old state and the screen may not update."
    },
    {
        id: "fe-x-render", fn: "renderList",
        task: "Write renderList(products) returning an HTML string <ul> with one <li> per product name, as a template or component would. Names come from users, so escape &, <, >, \" and ' to keep the markup safe. An empty list renders <p>No products</p>.",
        starter: "function renderList(products) {\n  return '';\n}",
        tests: [{ args: [[{ name: "Lamp" }, { name: "Mug" }]], expect: "<ul><li>Lamp</li><li>Mug</li></ul>" }, { args: [[{ name: "<img src=x onerror=alert(1)>" }]], expect: "<ul><li>&lt;img src=x onerror=alert(1)&gt;</li></ul>" }, { args: [[{ name: "Tom & Jerry's \"Mug\"" }]], expect: "<ul><li>Tom &amp; Jerry&#39;s &quot;Mug&quot;</li></ul>" }, { args: [[]], expect: "<p>No products</p>" }],
        model: "function renderList(products) {\n  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');\n  if (products.length === 0) return '<p>No products</p>';\n  return `<ul>${products.map((p) => `<li>${esc(p.name)}</li>`).join('')}</ul>`;\n}",
        buggy: ["function renderList(products) {\n  if (products.length === 0) return '<p>No products</p>';\n  return `<ul>${products.map((p) => `<li>${p.name}</li>`).join('')}</ul>`;\n}", "function renderList(products) {\n  const esc = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');\n  if (products.length === 0) return '<p>No products</p>';\n  return `<ul>${products.map((p) => `<li>${esc(p.name)}</li>`).join('')}</ul>`;\n}"],
        explain: "Frameworks escape text by default, which is why they resist XSS; raw HTML options such as innerHTML or dangerouslySetInnerHTML switch that off. Escape & first, or the &lt; you just produced becomes &amp;lt;."
    },
    {
        id: "fe-x-derived", fn: "cartSummary",
        task: "Derived state should be computed, not stored twice. Write cartSummary(items, prices) where items is [{ id, qty }] and prices is an object of id to price; return { count, total } computed from the items each time.",
        starter: "function cartSummary(items, prices) {\n  \n}",
        tests: [{ args: [[{ id: "lamp", qty: 2 }, { id: "mug", qty: 1 }], { lamp: 1299, mug: 349 }], expect: { count: 3, total: 2947 } }, { args: [[], { lamp: 1299 }], expect: { count: 0, total: 0 } }],
        model: "function cartSummary(items, prices) {\n  return items.reduce((s, i) => ({ count: s.count + i.qty, total: s.total + i.qty * prices[i.id] }), { count: 0, total: 0 });\n}",
        buggy: ["function cartSummary(items, prices) {\n  return { count: items.length, total: items.reduce((s, i) => s + prices[i.id], 0) };\n}"],
        explain: "Count and total follow from the items; computing them (with memoisation if expensive) avoids the classic bug where a stored total drifts out of sync with the cart."
    }
]);
