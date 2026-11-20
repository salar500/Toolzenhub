/* =========================================================
   ToolZen Hub
   Regular Expressions, and Data Structures and Algorithms for Interviews: lessons (original to this site). Regex
   exercises run real JavaScript regular expressions in a time-limited worker; DSA exercises run JavaScript against
   tests in the isolated worker.
========================================================= */

export const regexLessons = [
    { id: "rx-basics", title: "Literal text, classes and quantifiers", level: "beginner", prerequisite: "None, though basic programming helps.",
        objectives: ["Match characters, classes and digits", "Repeat with quantifiers", "Anchor a match to the whole text"],
        intro: "A regular expression describes a text pattern. Letters match themselves; a class such as [0-9] or \\d matches one character from a set; quantifiers repeat the item before them: ? (optional), * (zero or more), + (one or more) and {n,m}. ^ and $ anchor a match to the start and end, which validation almost always needs.",
        blocks: [
            { type: "example", title: "Building blocks", text: "\\d      a digit           \\w   a letter, digit or _     \\s  whitespace\n[A-Z]   one capital       [^0-9] anything but a digit\nx?      optional x        x+  one or more    x{4}  exactly four\n^...$   the whole text" },
            { type: "regex", heading: "Your turn: an order number", exercise: "rx-digits" },
            { type: "regex", heading: "Your turn: a PIN code", exercise: "rx-pincode" }
        ],
        why: "Validation, searching logs, extracting data and find-and-replace in editors all use regular expressions.",
        analogy: "A regular expression is a stencil: text that fits the shape matches.",
        mistakes: ["Forgetting anchors in validation.", "\\d+ where an exact count was required.", "Unescaped dots matching any character."],
        check: [{ q: "What does \\d{4} match?", a: "Exactly four digits." }, { q: "Why use ^ and $ for validation?", a: "So the whole text must fit, not just a part of it." }],
        summary: "Combine literals, classes and quantifiers, and anchor validation patterns with ^ and $." },
    { id: "rx-groups", title: "Groups, alternation and flags", level: "beginner",
        objectives: ["Group with brackets", "Choose between options with |", "Use the i, g and m flags"],
        intro: "Brackets group parts of a pattern so a quantifier or alternation applies to the whole group. | means or, and binds loosely, so group the alternatives. Flags change behaviour: i ignores case, g finds every match, m makes ^ and $ work per line and s lets . match newlines.",
        blocks: [
            { type: "regex", heading: "Your turn: ignore case", exercise: "rx-case" },
            { type: "regex", heading: "Your turn: one of three statuses", exercise: "rx-alternation" }
        ],
        why: "Most regex bugs come from alternation without grouping and from forgotten flags.",
        analogy: "Brackets in a regex work like brackets in arithmetic: they decide what goes together.",
        mistakes: ["^a|b$ instead of ^(a|b)$.", "Forgetting the g flag when extracting all matches.", "Case-sensitive checks on user input."],
        check: [{ q: "What does the i flag do?", a: "Makes letters match regardless of case." }, { q: "Why group alternatives?", a: "Because | applies to everything on each side unless grouped." }],
        summary: "Group with brackets, group alternatives before anchoring, and set flags for case, global search and lines." },
    { id: "rx-extract", title: "Capturing and extracting data", level: "intermediate",
        objectives: ["Capture parts with groups", "Use non-capturing groups", "Extract every match from a text"],
        intro: "A capturing group (...) remembers what it matched, so code can pull out the number after ₹ or the domain of an email. (?:...) groups without capturing. With the g flag, matchAll returns every match and its groups. Named groups (?<year>\\d{4}) make the result easier to read.",
        blocks: [
            { type: "regex", heading: "Your turn: rupee amounts", exercise: "rx-extract-prices" },
            { type: "regex", heading: "Your turn: email addresses", exercise: "rx-extract-emails" },
            { type: "regex", heading: "Your turn: ISO dates", exercise: "rx-dates" }
        ],
        why: "Pulling structured values from logs, messages and exports is a daily scripting and testing task.",
        analogy: "Capturing groups are highlighter pens: the whole match is found, but only the highlighted part is copied out.",
        mistakes: ["Capturing groups you do not need.", "Trying to validate real dates with regex alone.", "Patterns that only work on the test sample."],
        check: [{ q: "Capturing versus non-capturing group?", a: "(...) stores the matched text; (?:...) only groups." }, { q: "Can a regex check that 31 February is invalid?", a: "Not sensibly; parse the date with a date library." }],
        summary: "Capture the parts you need, group the rest without capturing, and use the g flag to extract every match." },
    { id: "rx-advanced", title: "Greedy and lazy matching, lookarounds and performance", level: "advanced",
        objectives: ["Tell greedy from lazy quantifiers", "Use lookaheads for conditions", "Avoid catastrophic backtracking"],
        intro: "Quantifiers are greedy: .+ takes as much as possible, then gives back. Adding ? makes them lazy. Lookaheads (?=...) and (?!...) check conditions without consuming text, as in password rules. Nested quantifiers such as (a+)+ can backtrack exponentially on non-matching input and freeze a program (ReDoS), so keep patterns specific; this page stops patterns after 1 second.",
        blocks: [
            { type: "regex", heading: "Your turn: lazy brackets", exercise: "rx-greedy" },
            { type: "regex", heading: "Your turn: a password rule", exercise: "rx-lookahead" },
            { type: "quiz", questions: [
                { q: "Why is ^(a+)+$ dangerous on input such as 'aaaaaaaaaaaaaaaaaaaaaaaab'?", options: ["Nested quantifiers backtrack through exponentially many splits before failing", "It is not dangerous"], answer: 0, explain: "This is regular-expression denial of service (ReDoS); validate length first and avoid nested repetition." }
            ] }
        ],
        why: "Greedy surprises and ReDoS are real production bugs; lookarounds express rules that are otherwise awkward.",
        analogy: "A greedy quantifier eats the whole cake and gives slices back; a lazy one takes one slice at a time.",
        mistakes: ["Greedy .* across delimiters.", "Nested quantifiers on user input.", "Unreadable one-line patterns with no comments or tests."],
        check: [{ q: "What does .+? do?", a: "Matches as few characters as possible (lazy)." }, { q: "What is ReDoS?", a: "Denial of service caused by a regex that backtracks catastrophically on crafted input." }],
        summary: "Choose greedy or lazy deliberately, use lookarounds for conditions and avoid nested quantifiers on untrusted input." }
];

export const regexInterview = {
    howTo: "Answer each question before opening the explanation.",
    description: "8 regular-expression interview questions with explained answers: anchors, classes, groups, flags, greedy matching, lookarounds and ReDoS.",
    coding: [],
    quiz: [
        { q: "What does ^ mean outside a class?", options: ["Start of the text (or line with m)", "Not"], answer: 0, explain: "Inside [^...] it negates." },
        { q: "\\d+ versus \\d{4}?", options: ["One or more digits versus exactly four", "The same"], answer: 0, explain: "Quantifiers." },
        { q: "What does the g flag do in JavaScript?", options: ["Finds all matches", "Ignores case"], answer: 0, explain: "i ignores case." },
        { q: "Capturing versus non-capturing?", options: ["(...) stores; (?:...) only groups", "The same"], answer: 0, explain: "Use (?:) when you only need grouping." },
        { q: "Greedy versus lazy?", options: ["As much as possible versus as little as possible", "The same"], answer: 0, explain: "Add ? for lazy." },
        { q: "What is a lookahead?", options: ["A condition checked without consuming text", "A flag"], answer: 0, explain: "(?=...) and (?!...)." },
        { q: "What is ReDoS?", options: ["Catastrophic backtracking used for denial of service", "A regex library"], answer: 0, explain: "Avoid nested quantifiers." },
        { q: "Should emails be validated only by regex?", options: ["No: use a practical pattern plus a confirmation email", "Yes, a perfect regex exists"], answer: 0, explain: "The full standard is impractical in a regex." }
    ]
};

export const dsaLessons = [
    { id: "dsa-complexity", title: "Big O and choosing data structures", level: "intermediate", prerequisite: "JavaScript Programming up to array methods.",
        objectives: ["Estimate time and space complexity", "Pick arrays, maps, sets, stacks and queues for a task", "Recognise common complexity classes"],
        intro: "Big O describes how work grows with input size: O(1) constant, O(log n) halving, O(n) one pass, O(n log n) good sorting, O(n²) nested loops. Data structures trade operations: arrays index fast but search slowly, Maps and Sets look up in about O(1), stacks are last in first out and queues are first in first out.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Checking whether each of 100,000 order ids is in a list of 100,000 blocked ids, with includes, is about:", options: ["O(n²): ten billion comparisons", "O(n)"], answer: 0, explain: "Put the blocked ids in a Set for O(n) overall." },
                { q: "Undo history in an editor is naturally a:", options: ["Stack", "Queue"], answer: 0, explain: "The last action is undone first." },
                { q: "Printing jobs in arrival order use a:", options: ["Queue", "Stack"], answer: 0, explain: "First in, first out." }
            ] },
            { type: "jsrun", heading: "Your turn: a stack", exercise: "dsa-x-brackets" }
        ],
        why: "Interviews test this directly, and real systems slow down when the structure does not fit the access pattern.",
        analogy: "Big O is how a journey time grows with distance: walking, cycling and flying grow very differently.",
        mistakes: ["includes inside loops over large data.", "Ignoring space complexity.", "Optimising before measuring on real sizes."],
        check: [{ q: "Complexity of binary search?", a: "O(log n)." }, { q: "Which structure checks membership fastest?", a: "A Set (or Map)." }],
        summary: "Estimate growth with Big O and choose the data structure whose fast operations match the task." },
    { id: "dsa-searching-sorting", title: "Searching and sorting", level: "intermediate",
        objectives: ["Implement binary search", "Merge sorted arrays", "Explain merge sort and quicksort"],
        intro: "Binary search halves a sorted range on each step, finding an item among a million in about 20 comparisons; off-by-one errors in its bounds are the classic bug. Merge sort splits an array, sorts the halves and merges them in O(n log n) time; quicksort partitions around a pivot and is fast on average. JavaScript's sort compares as strings unless given a comparator.",
        blocks: [
            { type: "jsrun", heading: "Your turn: binary search", exercise: "dsa-x-binary-search" },
            { type: "jsrun", heading: "Your turn: the merge step", exercise: "dsa-x-merge" }
        ],
        why: "Searching and sorting underlie databases, indexes and almost every interview.",
        analogy: "Binary search is finding a word in a dictionary by opening it in the middle, then the middle of the half.",
        mistakes: ["lo < hi instead of lo <= hi.", "Binary search on unsorted data.", "[10, 9, 1].sort() without a comparator."],
        check: [{ q: "What does binary search require?", a: "Sorted data." }, { q: "Time complexity of merge sort?", a: "O(n log n)." }],
        summary: "Binary search sorted data with careful bounds, and know merge sort and quicksort and their costs." },
    { id: "dsa-hashing", title: "Hashing and counting problems", level: "intermediate",
        objectives: ["Count with Maps", "Solve frequency and top-k problems", "Break ties deterministically"],
        intro: "Many interview problems reduce to counting: duplicates, anagrams, most frequent items. A Map counts in one pass; sorting the distinct keys or using a heap gives the top k. Always define tie-breaking, or results change with input order.",
        blocks: [
            { type: "jsrun", heading: "Your turn: the k most frequent words", exercise: "dsa-x-top-k" },
            { type: "jsrun", heading: "Revisit: two sum with a Map", exercise: "js-x-two-sum" }
        ],
        why: "Hash maps are the most useful interview tool; they turn quadratic solutions into linear ones.",
        analogy: "A hash map is a cloakroom: every coat goes to a numbered hook found instantly by its ticket.",
        mistakes: ["Nested loops to count.", "Undefined tie order.", "Objects as maps with keys like __proto__."],
        check: [{ q: "Complexity of counting with a Map?", a: "O(n)." }, { q: "Why define a tie-break?", a: "So the output is deterministic." }],
        summary: "Count with Maps in one pass, then select the top results with an explicit tie-break." },
    { id: "dsa-graphs", title: "Graphs and breadth-first search", level: "advanced",
        objectives: ["Model grids and networks as graphs", "Find shortest paths with BFS", "Track visited nodes"],
        intro: "A graph is nodes connected by edges: cities and roads, users and friendships, grid cells and their neighbours. Breadth-first search explores in rings of increasing distance using a queue, so it finds the shortest path in unweighted graphs. Depth-first search goes deep first and suits exploring all paths; Dijkstra's algorithm handles weighted edges.",
        blocks: [
            { type: "jsrun", heading: "Your turn: shortest path in a grid", exercise: "dsa-x-bfs" }
        ],
        why: "Routing, dependency resolution, recommendations and many interview problems are graph problems.",
        analogy: "BFS is ripples on a pond: every point at distance 1 is reached before any at distance 2.",
        mistakes: ["Forgetting the visited set, looping forever.", "DFS when the shortest path is needed.", "Greedy walks that get stuck."],
        check: [{ q: "Why does BFS find shortest paths?", a: "It visits nodes in order of distance from the start." }, { q: "BFS uses a queue or a stack?", a: "A queue." }],
        summary: "Model problems as graphs, use BFS with a visited set for unweighted shortest paths and know when to use DFS or Dijkstra." },
    { id: "dsa-design", title: "Designing data structures: the LRU cache", level: "advanced",
        objectives: ["Combine structures to meet complexity targets", "Implement an LRU cache", "Explain caching trade-offs"],
        intro: "Some problems ask you to design a structure with given operations in O(1), such as a least-recently-used cache: get and put must be fast, and the least recently used entry is evicted when full. The classic answer combines a hash map with a doubly linked list; in JavaScript, a Map's insertion order gives the same behaviour.",
        blocks: [
            { type: "jsrun", heading: "Your turn: an LRU cache", exercise: "dsa-x-lru" }
        ],
        why: "LRU caches are a favourite interview question and are used in browsers, databases and CDNs.",
        analogy: "An LRU cache is a small desk: when it is full, the file you have not touched for longest goes back to the cabinet.",
        mistakes: ["Not refreshing an entry on get.", "O(n) eviction by scanning.", "Unbounded caches that grow forever."],
        check: [{ q: "What does LRU evict?", a: "The entry used least recently." }, { q: "How does a JavaScript Map help?", a: "It keeps insertion order, so re-inserting on use keeps the oldest key first." }],
        summary: "Combine a map with an ordering structure to get O(1) cache operations, refreshing entries on every use." }
];

export const dsaInterview = {
    howTo: "Answer each question before opening the explanation. Say the complexity out loud in interviews.",
    description: "8 data structures and algorithms interview questions with explained answers: Big O, stacks, queues, hashing, binary search, sorting, BFS and caches.",
    coding: [],
    quiz: [
        { q: "Complexity of a nested loop over n items?", options: ["O(n²)", "O(n)"], answer: 0, explain: "Quadratic growth." },
        { q: "Stack versus queue?", options: ["LIFO versus FIFO", "The same"], answer: 0, explain: "Undo versus print jobs." },
        { q: "Binary search needs?", options: ["Sorted data", "A hash map"], answer: 0, explain: "O(log n)." },
        { q: "Average lookup in a hash map?", options: ["O(1)", "O(n)"], answer: 0, explain: "Collisions aside." },
        { q: "Merge sort complexity?", options: ["O(n log n)", "O(n²)"], answer: 0, explain: "Also stable." },
        { q: "Shortest path in an unweighted graph?", options: ["Breadth-first search", "Depth-first search"], answer: 0, explain: "Rings of distance." },
        { q: "Weighted shortest path?", options: ["Dijkstra's algorithm", "BFS"], answer: 0, explain: "Non-negative weights." },
        { q: "LRU cache structures?", options: ["Hash map plus ordered list", "An array only"], answer: 0, explain: "O(1) get and put." }
    ]
};
