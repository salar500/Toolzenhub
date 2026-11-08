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
    }
]);
