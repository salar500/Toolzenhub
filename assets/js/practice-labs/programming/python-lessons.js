/* =========================================================
   ToolZen Hub
   Python Programming path: lessons (original to this site; language facts checked against docs.python.org). Exercises
   run real Python (Pyodide, loaded on request) or ask the learner to predict output recorded with CPython.
========================================================= */

const L = (o) => o;

export const lessons = [
    L({ id: "py-first-steps", title: "Python basics: values, variables and functions", level: "beginner", prerequisite: "None. This can be a first programming lesson.",
        objectives: ["Use strings, numbers and booleans", "Name values with variables", "Define and call a function that returns a value"],
        intro: "Python reads like plain English and is used for scripting, testing, data analysis and AI. Values have types (str, int, float, bool); a variable is a name that refers to a value; def defines a function, and indentation (four spaces) marks its body. f-strings such as f\"Hello, {name}!\" insert values into text.",
        blocks: [
            { type: "example", title: "A first script", text: "shop = \"ShopLite\"        # str\nitems = 2                 # int\nprice = 499.0             # float\nsigned_in = True          # bool\n\ndef total(price, qty):\n    return price * qty\n\nprint(f\"{shop}: {total(price, items)}\")   # ShopLite: 998.0" },
            { type: "pyrun", heading: "Your turn: write a function", exercise: "py-x-greet" }
        ],
        why: "Python is the most taught first language and the main language of data, AI and test scripting.",
        analogy: "Indentation is Python's paragraph structure: what is indented belongs to the line above.",
        mistakes: ["Mixing tabs and spaces.", "Printing instead of returning.", "Forgetting the colon after def or if."],
        check: [{ q: "What marks the body of a function in Python?", a: "Indentation after the line ending in a colon." }, { q: "What does an f-string do?", a: "Inserts the values of expressions in braces into the text." }],
        summary: "Python values have types, variables name them, def defines functions and indentation shapes the code." }),
    L({ id: "py-conditions-numbers", title: "Conditions and arithmetic", level: "beginner",
        objectives: ["Branch with if, elif and else", "Use //, % and / correctly", "Test boundaries"],
        intro: "if, elif and else choose between paths. Comparisons give True or False and can be chained (1 <= n <= 10). Python has three divisions: / always gives a float, // rounds down to a whole number and % gives the remainder. round() rounds halves to the nearest even number.",
        blocks: [
            { type: "pyrun", heading: "Your turn: a business rule", exercise: "py-x-delivery" },
            { type: "predict", heading: "Your turn: predict the arithmetic", exercise: "py-p-division" },
            { type: "pyrun", heading: "Your turn: grade bands", exercise: "py-x-grade" }
        ],
        why: "Business rules are conditions and many bugs sit at their boundaries or in rounding.",
        analogy: "elif is a queue of doors tried in order; the first one that opens is the one you go through.",
        mistakes: [">= where the rule says 'over'.", "Expecting / to give a whole number.", "Assuming round(2.5) is 3."],
        check: [{ q: "What is 7 // 2?", a: "3." }, { q: "What does -7 // 2 give?", a: "-4: floor division rounds down." }],
        summary: "Branch with if/elif/else, know the three divisions and test the exact boundary values." }),
    L({ id: "py-loops-lists", title: "Loops, lists and ranges", level: "beginner",
        objectives: ["Loop with for and range", "Build and change lists", "Slice sequences"],
        intro: "for item in items visits each element. range(start, stop) counts up to, but not including, stop. Lists are ordered and changeable: append adds, len counts, and slicing items[a:b] copies part of a list or string. Negative indexes count from the end.",
        blocks: [
            { type: "pyrun", heading: "Your turn: sum the even numbers", exercise: "py-x-sum-evens" },
            { type: "predict", heading: "Your turn: predict the slices", exercise: "py-p-slicing" }
        ],
        why: "Processing lists of records is the heart of scripting, data work and test automation.",
        analogy: "range(1, 5) is a ticket roll that stops before ticket 5.",
        mistakes: ["range(n) when 1 to n was meant.", "Changing a list while looping over it.", "Off-by-one slices."],
        check: [{ q: "What does range(1, 4) produce?", a: "1, 2, 3." }, { q: "How do you reverse a string s?", a: "s[::-1]." }],
        summary: "Loop with for, count with range (the stop is excluded), and slice lists and strings carefully." }),
    L({ id: "py-dicts-sets", title: "Dictionaries, sets and strings", level: "beginner",
        objectives: ["Count with a dictionary", "Remove duplicates with a set", "Clean text with string methods"],
        intro: "A dictionary maps keys to values: counts[\"pune\"] = 3. get(key, default) avoids errors for missing keys. A set holds unique values with no order. String methods such as lower, strip and split clean and break up text.",
        blocks: [
            { type: "pyrun", heading: "Your turn: count words", exercise: "py-x-word-count" },
            { type: "pyrun", heading: "Your turn: distinct values in order", exercise: "py-x-unique-sorted" }
        ],
        why: "Dictionaries are Python's most used data structure: JSON from APIs becomes dictionaries and lists.",
        analogy: "A dictionary is a phone book: look up by name (key), get the number (value).",
        mistakes: ["d[key] for keys that may be missing.", "Expecting a set to keep order.", "split(' ') on text with double spaces."],
        check: [{ q: "What does d.get(\"x\", 0) return when x is missing?", a: "0." }, { q: "How do you remove duplicates and sort?", a: "sorted(set(items))." }],
        summary: "Use dictionaries for lookups and counts, sets for uniqueness and string methods to normalise text." }),
    L({ id: "py-functions-scope", title: "Functions in depth: scope, defaults and comprehensions", level: "intermediate",
        objectives: ["Explain local and global scope", "Avoid mutable default arguments", "Write list comprehensions"],
        intro: "Variables assigned inside a function are local to it. Default argument values are created once, when the function is defined, so a mutable default such as [] is shared between calls. A list comprehension builds a list in one expression: [x * x for x in nums if x > 0].",
        blocks: [
            { type: "predict", heading: "Your turn: predict scope", exercise: "py-p-scope" },
            { type: "predict", heading: "Your turn: the mutable default trap", exercise: "py-p-mutable-default" },
            { type: "pyrun", heading: "Your turn: a comprehension", exercise: "py-x-even-squares" }
        ],
        why: "The mutable-default bug is a classic interview question and a real source of production bugs.",
        analogy: "A mutable default is one shared notepad left on the counter: every caller writes on the same page.",
        mistakes: ["def f(items=[]).", "Relying on global variables inside functions.", "Comprehensions so long they are unreadable."],
        check: [{ q: "What is the safe pattern for a list default?", a: "def f(items=None): then items = [] if items is None." }, { q: "When is a comprehension better than a loop?", a: "For short transformations and filters that read clearly in one line." }],
        summary: "Know local scope, never use mutable defaults and use comprehensions for clear, short transformations." }),
    L({ id: "py-errors", title: "Exceptions and input validation", level: "intermediate",
        objectives: ["Raise and catch exceptions", "Validate input strictly", "Use else and finally"],
        intro: "Errors in Python are exceptions. raise ValueError(\"...\") signals bad input; try/except handles it; else runs when nothing failed and finally always runs. Validate at the edge: convert text with int() and check ranges, and catch specific exceptions rather than everything.",
        blocks: [
            { type: "example", title: "Handling an error", text: "try:\n    qty = int(\"2.5\")\nexcept ValueError:\n    print(\"not a whole number\")\nelse:\n    print(\"qty\", qty)\nfinally:\n    print(\"checked\")" },
            { type: "pyrun", heading: "Your turn: validate a quantity", exercise: "py-x-parse-qty" }
        ],
        why: "Robust scripts and services fail clearly instead of silently producing wrong results.",
        analogy: "An exception is a fire alarm: it stops normal work and goes to whoever is set up to handle it.",
        mistakes: ["Bare except: that hides bugs.", "int(float(text)), which silently truncates.", "Returning None instead of raising."],
        check: [{ q: "Which exception does int(\"abc\") raise?", a: "ValueError." }, { q: "When does finally run?", a: "Always, whether or not an exception happened." }],
        summary: "Raise specific exceptions for bad input, catch only what you can handle and use finally for clean-up." }),
    L({ id: "py-oop", title: "Classes and objects", level: "intermediate",
        objectives: ["Define a class with __init__ and methods", "Keep state per object", "Explain class versus instance attributes"],
        intro: "A class bundles data and behaviour. __init__ sets up each new object's attributes on self; methods take self as their first parameter. Attributes defined on the class itself are shared by all objects, which is a common source of bugs with lists.",
        blocks: [
            { type: "pyrun", heading: "Your turn: a Cart class", exercise: "py-x-cart-class" }
        ],
        why: "Page objects in test automation, models in web frameworks and most libraries are classes.",
        analogy: "A class is a cookie cutter; each object is a cookie with its own decoration.",
        mistakes: ["Forgetting self.", "Shared lists as class attributes.", "Huge classes that do everything."],
        check: [{ q: "What does __init__ do?", a: "Initialises a new object's attributes." }, { q: "Why put lines = [] in __init__ rather than on the class?", a: "So each object gets its own list." }],
        summary: "Classes combine state and behaviour; create per-object state in __init__ on self." }),
    L({ id: "py-files-modules", title: "Files, modules and the standard library", level: "intermediate",
        objectives: ["Read and write files with with", "Import modules", "Use common standard-library modules"],
        intro: "open() returns a file; with open(...) as f closes it automatically. Mode \"w\" replaces, \"a\" appends and \"r\" (the default) reads; give encoding=\"utf-8\". import brings in modules: json for JSON, csv for CSV, datetime for dates, pathlib for paths. In this page, files live in Python's in-memory file system.",
        blocks: [
            { type: "example", title: "JSON and CSV", text: "import csv, json\n\nwith open(\"orders.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    rows = list(csv.DictReader(f))\n\nwith open(\"orders.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(rows, f, indent=2)" },
            { type: "pyrun", heading: "Your turn: write and read a file", exercise: "py-x-file-lines" }
        ],
        why: "Reading CSV and JSON files and writing reports is everyday Python work for analysts and testers.",
        analogy: "with is borrowing a library book with automatic return: when the block ends, the file goes back.",
        mistakes: ["Forgetting to close files.", "\"w\" where \"a\" was meant, or the reverse.", "Relying on the default encoding."],
        check: [{ q: "Why use with open(...)?", a: "The file is closed even if an error happens." }, { q: "Which module reads CSV files?", a: "csv." }],
        summary: "Open files in with blocks with an explicit mode and encoding, and lean on the standard library." }),
    L({ id: "py-algorithms", title: "Problem solving and complexity in Python", level: "advanced",
        objectives: ["Choose data structures for speed", "Reason about O(n) and O(n²)", "Use enumerate and dictionaries"],
        intro: "Membership tests are fast in sets and dictionaries and slow in lists for large data. Turning a nested loop into one pass with a dictionary changes O(n²) into O(n). enumerate gives index and value together, and the standard library (collections.Counter, heapq, bisect) solves many classic problems.",
        blocks: [
            { type: "pyrun", heading: "Your turn: two sum", exercise: "py-x-two-sum" }
        ],
        why: "Interviews test this directly, and data scripts slow to a crawl when they pick the wrong structure.",
        analogy: "Looking up in a dictionary is using the index of a book; scanning a list is reading every page.",
        mistakes: ["x in big_list inside a loop.", "Nested loops over large inputs.", "Rewriting what Counter already does."],
        check: [{ q: "Which is faster for membership: list or set?", a: "Set (near constant time)." }, { q: "What does enumerate return?", a: "Pairs of index and value." }],
        summary: "Use sets and dictionaries for lookups, aim for single passes and know the standard library's helpers." }),
    L({ id: "py-testing", title: "Testing Python code with pytest", level: "advanced",
        objectives: ["Write unit tests with assert", "Structure tests with pytest", "Test edge cases and exceptions"],
        intro: "pytest runs functions whose names start with test_ and reports any assert that fails. pytest.raises checks that code raises the right exception, and parametrize runs one test with many inputs. Tests for every function should cover typical values, boundaries, empty inputs and invalid inputs, the same thinking as manual test design.",
        blocks: [
            { type: "example", title: "A pytest file", text: "import pytest\nfrom shop import delivery_fee, parse_qty\n\n@pytest.mark.parametrize(\"total, fee\", [(500, 49), (999, 49), (1000, 0)])\ndef test_delivery_fee(total, fee):\n    assert delivery_fee(total) == fee\n\ndef test_parse_qty_rejects_decimals():\n    with pytest.raises(ValueError):\n        parse_qty(\"2.5\")" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which inputs best test delivery_fee?", options: ["500, 999, 1000 (below, at and above the boundary)", "500 only"], answer: 0, explain: "Boundary value analysis applies to unit tests too." },
                { q: "How do you test that a function raises ValueError?", options: ["with pytest.raises(ValueError):", "try/except and print"], answer: 0, explain: "pytest.raises fails the test if the exception does not happen." },
                { q: "What does @pytest.mark.parametrize do?", options: ["Runs the test once per set of inputs", "Makes it run faster"], answer: 0, explain: "One test function, many reported cases." }
            ] }
        ],
        why: "Unit tests let you change code without fear and are expected in every professional codebase.",
        analogy: "Tests are a safety net under a trapeze: you can attempt more because falls are caught.",
        mistakes: ["Testing only the happy path.", "Tests that depend on each other.", "Asserting nothing."],
        check: [{ q: "How does pytest find tests?", a: "Files and functions named test_*." }, { q: "Name three kinds of input to test.", a: "Typical, boundary and invalid (also empty)." }],
        summary: "Write pytest tests with plain asserts, parametrise boundary cases and check exceptions with pytest.raises." })
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Python interviews love the language's surprises, so read why.",
    description: "12 Python interview questions with explained answers: types, mutability, scope, comprehensions, exceptions, classes and complexity.",
    coding: [],
    quiz: [
        { q: "List versus tuple?", options: ["Lists can change; tuples cannot", "No difference"], answer: 0, explain: "Tuples are immutable and can be dictionary keys." },
        { q: "What is wrong with def f(items=[])?", options: ["The default list is shared between calls", "Nothing"], answer: 0, explain: "Use None and create the list inside." },
        { q: "is versus ==?", options: ["is checks identity; == checks equality", "The same"], answer: 0, explain: "Use is only for None and singletons." },
        { q: "What does 7 // 2 return?", options: ["3", "3.5"], answer: 0, explain: "Floor division." },
        { q: "What does round(2.5) return?", options: ["2", "3"], answer: 0, explain: "Round half to even." },
        { q: "Fast membership test for many items?", options: ["A set", "A list"], answer: 0, explain: "Hash-based lookups." },
        { q: "What is a list comprehension?", options: ["An expression that builds a list from a loop and optional filter", "A type of class"], answer: 0, explain: "[x for x in xs if cond]." },
        { q: "What does with open(...) guarantee?", options: ["The file is closed", "The file exists"], answer: 0, explain: "Context managers clean up." },
        { q: "What is self?", options: ["The object the method was called on", "A keyword for classes"], answer: 0, explain: "Passed automatically as the first argument." },
        { q: "How do you catch an error safely?", options: ["Catch the specific exception type", "Use a bare except"], answer: 0, explain: "Bare except hides bugs, even KeyboardInterrupt." },
        { q: "What is a generator?", options: ["A function that yields values one at a time", "A random number tool"], answer: 0, explain: "Memory-efficient iteration with yield." },
        { q: "How does pytest check exceptions?", options: ["with pytest.raises(...)", "assert raises"], answer: 0, explain: "The test fails if nothing is raised." }
    ]
};
