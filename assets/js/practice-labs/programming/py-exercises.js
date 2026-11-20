/* =========================================================
   ToolZen Hub
   Python path: exercises run against test cases in real Python (Pyodide in a Web Worker, loaded on request). Each has a
   model that passes and buggy versions that fail at least one test; pinned with CPython by tests/unit/py-exercises.test.mjs.
========================================================= */

export const PY_EXERCISES = Object.freeze([
    {
        id: "py-x-greet", fn: "greet",
        task: "Write greet(name) so it returns a greeting such as \"Hello, Asha!\".",
        starter: "def greet(name):\n    # return the greeting\n    pass\n",
        tests: [{ args: ["Asha"], expect: "Hello, Asha!" }, { args: ["Ravi"], expect: "Hello, Ravi!" }],
        model: "def greet(name):\n    return f\"Hello, {name}!\"\n",
        buggy: ["def greet(name):\n    print(f\"Hello, {name}!\")\n"],
        explain: "An f-string inserts values with {name}. print shows text but returns None; the tests need the value returned."
    },
    {
        id: "py-x-delivery", fn: "delivery_fee",
        task: "ShopLite charges ₹49 delivery, but orders over ₹999 ship free. Write delivery_fee(total).",
        starter: "def delivery_fee(total):\n    pass\n",
        tests: [{ args: [500], expect: 49 }, { args: [999], expect: 49 }, { args: [1000], expect: 0 }],
        model: "def delivery_fee(total):\n    if total > 999:\n        return 0\n    return 49\n",
        buggy: ["def delivery_fee(total):\n    return 0 if total >= 999 else 49\n"],
        explain: "\"Over ₹999\" is total > 999; the exact boundary, 999, still pays. Indentation marks the body of if in Python."
    },
    {
        id: "py-x-sum-evens", fn: "sum_evens",
        task: "Write sum_evens(numbers) returning the sum of the even numbers in the list (0 for an empty list).",
        starter: "def sum_evens(numbers):\n    total = 0\n    # loop here\n    return total\n",
        tests: [{ args: [[1, 2, 3, 4]], expect: 6 }, { args: [[]], expect: 0 }, { args: [[-2, 5, 8]], expect: 6 }],
        model: "def sum_evens(numbers):\n    total = 0\n    for n in numbers:\n        if n % 2 == 0:\n            total += n\n    return total\n",
        buggy: ["def sum_evens(numbers):\n    total = 0\n    for n in numbers:\n        if n % 2 == 1:\n            total += n\n    return total\n"],
        explain: "n % 2 == 0 tests evenness (also for negatives in Python). for n in numbers visits each item."
    },
    {
        id: "py-x-word-count", fn: "word_count",
        task: "Write word_count(text) returning a dictionary of how often each word appears, in lower case. Words are separated by whitespace.",
        starter: "def word_count(text):\n    counts = {}\n    return counts\n",
        tests: [{ args: ["the cat and the hat"], expect: { the: 2, cat: 1, and: 1, hat: 1 } }, { args: ["Go go  GO"], expect: { go: 3 } }, { args: [""], expect: {} }],
        model: "def word_count(text):\n    counts = {}\n    for word in text.lower().split():\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n",
        buggy: ["def word_count(text):\n    counts = {}\n    for word in text.split(' '):\n        counts[word] = counts.get(word, 0) + 1\n    return counts\n"],
        explain: "split() with no argument splits on any run of whitespace and drops empty strings; dict.get(word, 0) gives 0 for unseen words."
    },
    {
        id: "py-x-grade", fn: "grade",
        task: "Write grade(score): \"A\" for 90 and above, \"B\" for 75 to 89, \"C\" for 50 to 74, otherwise \"F\". Raise ValueError for scores below 0 or above 100.",
        starter: "def grade(score):\n    pass\n",
        tests: [{ args: [95], expect: "A" }, { args: [90], expect: "A" }, { args: [89], expect: "B" }, { args: [50], expect: "C" }, { args: [49], expect: "F" }, { args: [101], raises: "ValueError" }, { args: [-1], raises: "ValueError" }],
        model: "def grade(score):\n    if score < 0 or score > 100:\n        raise ValueError(\"score must be from 0 to 100\")\n    if score >= 90:\n        return \"A\"\n    if score >= 75:\n        return \"B\"\n    if score >= 50:\n        return \"C\"\n    return \"F\"\n",
        buggy: ["def grade(score):\n    if score > 90:\n        return \"A\"\n    if score > 75:\n        return \"B\"\n    if score > 50:\n        return \"C\"\n    return \"F\"\n"],
        explain: "Check invalid input first, then the bands from highest down with >=; each boundary (90, 75, 50) belongs to the higher grade."
    },
    {
        id: "py-x-even-squares", fn: "even_squares",
        task: "Write even_squares(n) with a list comprehension: the squares of the even numbers from 1 to n inclusive.",
        starter: "def even_squares(n):\n    return []\n",
        tests: [{ args: [6], expect: [4, 16, 36] }, { args: [1], expect: [] }, { args: [4], expect: [4, 16] }],
        model: "def even_squares(n):\n    return [x * x for x in range(1, n + 1) if x % 2 == 0]\n",
        buggy: ["def even_squares(n):\n    return [x * x for x in range(1, n) if x % 2 == 0]\n"],
        explain: "range(1, n + 1) includes n; range stops before its end value, a common off-by-one in Python."
    },
    {
        id: "py-x-unique-sorted", fn: "unique_sorted",
        task: "Write unique_sorted(items) returning the distinct values in ascending order.",
        starter: "def unique_sorted(items):\n    pass\n",
        tests: [{ args: [[3, 1, 3, 2]], expect: [1, 2, 3] }, { args: [[]], expect: [] }, { args: [["b", "a", "b"]], expect: ["a", "b"] }, { args: [[100, 3, 50]], expect: [3, 50, 100] }],
        model: "def unique_sorted(items):\n    return sorted(set(items))\n",
        buggy: ["def unique_sorted(items):\n    return list(set(items))\n"],
        explain: "A set removes duplicates but has no order; sorted() returns a new sorted list."
    },
    {
        id: "py-x-cart-class", fn: "cart_total",
        task: "Write a class Cart with add(price, qty) and total(), then cart_total(lines) that adds each (price, qty) pair to a Cart and returns its total.",
        starter: "class Cart:\n    def __init__(self):\n        self.lines = []\n\n\ndef cart_total(lines):\n    cart = Cart()\n    return 0\n",
        tests: [{ args: [[[499, 2], [1299, 1]]], expect: 2297 }, { args: [[]], expect: 0 }],
        model: "class Cart:\n    def __init__(self):\n        self.lines = []\n\n    def add(self, price, qty):\n        self.lines.append((price, qty))\n\n    def total(self):\n        return sum(price * qty for price, qty in self.lines)\n\n\ndef cart_total(lines):\n    cart = Cart()\n    for price, qty in lines:\n        cart.add(price, qty)\n    return cart.total()\n",
        buggy: ["class Cart:\n    lines = []\n\n    def add(self, price, qty):\n        self.lines.append((price, qty))\n\n    def total(self):\n        return sum(p * q for p, q in self.lines)\n\n\ndef cart_total(lines):\n    cart = Cart()\n    for price, qty in lines:\n        cart.add(price, qty)\n    return cart.total()\n"],
        explain: "Create per-object state in __init__ with self. A list defined on the class itself is shared by every Cart, so the second test sees the first test's items."
    },
    {
        id: "py-x-file-lines", fn: "count_matching_lines",
        task: "Write count_matching_lines(text, word): save text to a file called orders.log, open it again and return how many lines contain word. Use with blocks so the file is closed.",
        starter: "def count_matching_lines(text, word):\n    pass\n",
        tests: [{ args: ["SL-1 paid\nSL-2 failed\nSL-3 paid\n", "paid"], expect: 2 }, { args: ["", "paid"], expect: 0 }],
        model: "def count_matching_lines(text, word):\n    with open(\"orders.log\", \"w\", encoding=\"utf-8\") as f:\n        f.write(text)\n    count = 0\n    with open(\"orders.log\", encoding=\"utf-8\") as f:\n        for line in f:\n            if word in line:\n                count += 1\n    return count\n",
        buggy: ["def count_matching_lines(text, word):\n    with open(\"orders.log\", \"a\", encoding=\"utf-8\") as f:\n        f.write(text)\n    with open(\"orders.log\", encoding=\"utf-8\") as f:\n        return sum(1 for line in f if word in line)\n"],
        explain: "Mode \"w\" replaces the file; \"a\" appends, so earlier runs leak into the count. In the browser the file lives in Python's in-memory file system and disappears when the page closes."
    },
    {
        id: "py-x-parse-qty", fn: "parse_qty",
        task: "Write parse_qty(text) that turns typed text into a whole number from 1 to 10 and raises ValueError for anything else.",
        starter: "def parse_qty(text):\n    pass\n",
        tests: [{ args: ["3"], expect: 3 }, { args: [" 10 "], expect: 10 }, { args: ["0"], raises: "ValueError" }, { args: ["2.5"], raises: "ValueError" }, { args: ["abc"], raises: "ValueError" }],
        model: "def parse_qty(text):\n    n = int(text.strip())\n    if not 1 <= n <= 10:\n        raise ValueError(\"quantity must be 1 to 10\")\n    return n\n",
        buggy: ["def parse_qty(text):\n    return int(float(text))\n"],
        explain: "int(\"2.5\") and int(\"abc\") raise ValueError themselves; the range check rejects 0 and 11. Python's chained comparison 1 <= n <= 10 reads like maths."
    },
    {
        id: "py-x-two-sum", fn: "two_sum",
        task: "Write two_sum(nums, target) returning [i, j] (i < j), the indices of two numbers that add up to target, in one pass with a dictionary.",
        starter: "def two_sum(nums, target):\n    pass\n",
        tests: [{ args: [[2, 7, 11, 15], 9], expect: [0, 1] }, { args: [[3, 2, 4], 6], expect: [1, 2] }, { args: [[3, 3], 6], expect: [0, 1] }],
        model: "def two_sum(nums, target):\n    seen = {}\n    for j, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], j]\n        seen[n] = j\n    return None\n",
        buggy: ["def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n"],
        explain: "enumerate gives index and value; the dictionary remembers where each number was seen, so each lookup is fast and the solution is O(n)."
    }
]);
