/* =========================================================
   ToolZen Hub
   Test Design Techniques path: lessons (build-time content, original to this site). Practice comes from the Test Design
   Lab's own exercises (labset blocks, by id) plus quizzes and ordering tasks.
========================================================= */

const LAB = { lab: "test-design", labTool: "test-design-lab" };

export const lessons = [
    {
        id: "td-partitions", title: "Equivalence partitioning", level: "beginner", prerequisite: "Positive and negative testing (Manual Software Testing, lesson 10), or basic testing knowledge.",
        objectives: ["Split an input range into partitions that behave the same", "Choose one representative value per partition", "Include invalid partitions as well as valid ones"],
        intro: "Equivalence partitioning divides all possible inputs into groups (partitions) that the software should treat the same way. If one value from a partition works, the others very probably do too, so one representative per partition is enough. This cuts thousands of possible values down to a handful of meaningful tests.",
        blocks: [
            { type: "example", title: "ShopLite cart quantity (R3: 1 to 10)", text: "Invalid partition below: ... -1, 0      → one test, e.g. 0\nValid partition:       1 to 10          → one test, e.g. 5\nInvalid partition above: 11, 12 ...     → one test, e.g. 11\nInvalid kind:          2.5, 'abc', empty → one test each" },
            { type: "labset", ...LAB, heading: "Your turn: partitions from the Test Design Lab", ids: ["tdl-ep-age", "tdl-ep-quantity", "tdl-ep-seats", "tdl-ep-weight"], text: "For each value, choose the partition it belongs to. The lab checks every choice and explains the boundaries." }
        ],
        why: "No team can test every value. Partitioning gives a defensible, small set of tests that still covers every kind of behaviour, and it is the basis of almost every other technique.",
        analogy: "Partitioning is like testing one key from each batch a locksmith cuts: if one key from a batch works, the batch was cut correctly.",
        mistakes: ["Forgetting invalid partitions.", "Picking two values from the same partition and calling it two tests.", "Missing partitions created by a second rule (for example a different price band)."],
        check: [
            { q: "A field accepts 1 to 10. How many partitions for whole numbers, and which?", a: "Three: below 1 (invalid), 1 to 10 (valid), above 10 (invalid); plus invalid kinds such as text." },
            { q: "Why is one value per partition usually enough?", a: "All values in a partition should be treated the same way, so testing more of them rarely finds anything new." }
        ],
        summary: "Equivalence partitioning groups inputs that should behave the same, so one value per valid and invalid partition gives broad coverage with few tests."
    },
    {
        id: "td-boundaries", title: "Boundary value analysis", level: "beginner",
        objectives: ["Find the boundaries of a range", "Choose two-value and three-value boundary tests", "Handle limits that are included or excluded"],
        intro: "Defects cluster at the edges of partitions, where a developer can write < instead of <=. Boundary value analysis tests the values on each edge and just beyond it. With two-value boundaries you test the edge and its nearest neighbour outside; with three values you add the neighbour inside.",
        blocks: [
            { type: "example", title: "ShopLite free delivery (R6: ₹999 or more is free)", text: "Two-value BVA at the ₹999 boundary: 998 (fee) and 999 (free)\nThree-value BVA: 998, 999 and 1000\nThe seeded bug in release 1.1 (free only above ₹999) is found by 999 and missed by any typical value." },
            { type: "labset", ...LAB, heading: "Your turn: boundaries from the Test Design Lab", ids: ["tdl-bva-age", "tdl-bva-quantity", "tdl-bva-score", "tdl-bva-password", "tdl-bva-seats", "tdl-bva-shipping"], text: "Type the boundary values the specification asks for. The lab says which required values are present or missing." }
        ],
        why: "Boundary values find more defects per test than any other simple technique. Interviewers ask for them constantly.",
        analogy: "A boundary test is like checking a fence at its corners and gates, where it is most likely to be weak.",
        mistakes: ["Testing only the middle of a range.", "Ignoring whether a limit is included or excluded.", "Forgetting the upper boundary."],
        check: [
            { q: "Range 18 to 60 inclusive: two-value boundary tests?", a: "17 and 18 at the lower edge, 60 and 61 at the upper edge." },
            { q: "Why do defects cluster at boundaries?", a: "Comparisons such as < and <= are easy to confuse, and off-by-one mistakes appear exactly at the edges." }
        ],
        summary: "Test each edge of a partition and the value just beyond it (and, with three-value BVA, just inside), taking care whether limits are included."
    },
    {
        id: "td-decision-tables", title: "Decision tables", level: "intermediate",
        objectives: ["Build a decision table from combined conditions", "Derive one test per rule", "Spot missing or contradictory rules"],
        intro: "When the outcome depends on several conditions together, a decision table lists every combination of conditions (columns are rules) and the action each combination should cause. Each column becomes a test, and gaps or contradictions in the requirements become visible.",
        blocks: [
            { type: "example", title: "ShopLite coupons and delivery (R5, R6)", text: "Conditions                 | R1  | R2  | R3  | R4\nItems total ≥ ₹500?        | Yes | Yes | No  | No\nCode is SAVE10?            | Yes | No  | Yes | No\nActions\nApply 10% discount         | Yes | No  | No  | No\nShow 'needs ₹500' message  | No  | No  | Yes | No" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Three yes/no conditions: how many combinations does a full decision table have?", options: ["3", "6", "8"], answer: 2, explain: "2 × 2 × 2 = 8 rules. Impossible or equivalent combinations can then be merged or removed." },
                { q: "In the table above, which rule tests the seeded SAVE10 bug of release 1.1?", options: ["R1", "R3", "R4"], answer: 1, explain: "R3 (below ₹500 with SAVE10) must refuse the code; release 1.1 wrongly applies it." },
                { q: "A combination has no action defined in the requirement. What is it?", options: ["A gap to raise with the product owner", "Nothing to worry about"], answer: 0, explain: "Decision tables expose missing rules before they become defects." }
            ] }
        ],
        why: "Business rules combine conditions: discounts, eligibility, pricing. Decision tables make sure no combination is forgotten, by developers or by tests.",
        analogy: "A decision table is a truth table for business rules, like a menu of every possible order.",
        mistakes: ["Testing only the combinations someone thought of.", "Not merging rules that lead to the same action.", "Skipping the combinations the requirement forgot."],
        check: [
            { q: "What is a column in a decision table?", a: "A rule: one combination of condition values and the expected actions." },
            { q: "How many tests does a decision table give?", a: "Usually one per remaining rule after impossible ones are removed." }
        ],
        summary: "Decision tables list combinations of conditions and their actions, give one test per rule and reveal missing or contradictory requirements."
    },
    {
        id: "td-state-transition", title: "State transition testing", level: "intermediate",
        objectives: ["Model a feature as states and transitions", "Test valid and invalid transitions", "Cover each transition at least once"],
        intro: "Some software behaves differently depending on what happened before: an order is placed, paid, shipped, delivered or cancelled. State transition testing models those states and the events that move between them, then tests that allowed transitions work and forbidden ones are refused.",
        blocks: [
            { type: "order", heading: "Your turn: an order's normal life", prompt: "Put a ShopLite-style order's states in their normal order.", items: ["Placed", "Confirmed", "Shipped", "Delivered"], explain: "Each event moves the order forward. Invalid transitions to test include cancelling a delivered order or shipping a cancelled one." },
            { type: "quiz", questions: [
                { q: "Which is an invalid transition worth testing?", options: ["Placed → Confirmed", "Delivered → Shipped", "Confirmed → Shipped"], answer: 1, explain: "A delivered order cannot go back to shipped; the system must refuse it." },
                { q: "What does 'cover every transition' mean?", options: ["Each arrow in the state diagram is exercised by at least one test", "Each state is visited once"], answer: 0, explain: "Transition coverage is stronger than visiting each state." }
            ] }
        ],
        why: "Orders, payments, accounts and tickets all have states. Many serious defects come from transitions that should be impossible but are not.",
        analogy: "A traffic light: green to yellow to red is allowed; green straight to red without yellow is a defect.",
        mistakes: ["Testing only the happy path through the states.", "Forgetting invalid transitions.", "Not checking what the user sees when a transition is refused."],
        check: [
            { q: "Name a state and an event for a login feature.", a: "For example state 'Locked', event 'third wrong password'." },
            { q: "Why test invalid transitions?", a: "Because systems often allow actions they should forbid, such as refunding twice." }
        ],
        summary: "Model behaviour as states and transitions, test every valid transition and the important invalid ones."
    },
    {
        id: "td-pairwise", title: "Pairwise testing", level: "advanced",
        objectives: ["Explain why pairwise testing works", "Count the tests needed for all pairs", "Know when combinations need more than pairs"],
        intro: "When several parameters each have several values, testing every combination explodes: 3 browsers × 3 devices × 3 languages is 27 tests. Most defects are caused by a single value or an interaction between two values, so pairwise testing covers every pair of values at least once with far fewer tests (here 9).",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "4 parameters with 3 values each: how many tests for all combinations?", options: ["12", "81", "27"], answer: 1, explain: "3^4 = 81. An all-pairs set needs only 9." },
                { q: "When is pairwise not enough?", options: ["When a known defect needs three specific values together, or safety-critical software", "Never"], answer: 0, explain: "Pairwise is a risk trade-off; high-risk interactions may need specific triples." }
            ] }
        ],
        why: "Configuration testing (browsers, devices, settings) is where test counts explode. Pairwise gives strong coverage at a fraction of the cost.",
        analogy: "Like making sure every guest at a party meets every other guest at least once, without seating every possible group together.",
        mistakes: ["Building pairs by hand and missing some.", "Ignoring impossible combinations.", "Using pairwise for safety-critical combinations without thought."],
        check: [
            { q: "What does pairwise guarantee?", a: "Every pair of values from any two parameters appears in at least one test." },
            { q: "Why does it work in practice?", a: "Most defects are triggered by one value or by the interaction of two." }
        ],
        summary: "Pairwise testing covers every pair of parameter values with few tests, catching most interaction defects at a fraction of the full combination count."
    },
    {
        id: "td-use-case-error-guessing", title: "Use-case testing, error guessing and mixed practice", level: "advanced",
        objectives: ["Test complete user journeys from use cases", "Use experience to guess likely errors", "Combine techniques on harder specifications"],
        intro: "Use-case testing follows complete journeys, including alternative and error paths: a customer signs in, applies a coupon, checks out. Error guessing uses experience of where software usually fails (empty input, double submit, refresh, back button) to add tests no formal technique would produce.",
        blocks: [
            { type: "list", heading: "Error guesses that often pay off", items: ["Submit a form twice quickly.", "Use the Back button after placing an order.", "Leave a required field empty, or enter only spaces.", "Change data in another tab, then continue in the first.", "Use the largest and smallest values a field allows."] },
            { type: "labset", ...LAB, heading: "Your turn: advanced mixed practice", ids: ["tdl-bva-discount", "tdl-bva-temperature", "tdl-bva-shift", "tdl-bva-balance", "tdl-ep-grade", "tdl-ep-temperature", "tdl-ep-parking", "tdl-ep-discount", "tdl-ep-password", "tdl-ep-quarter"], text: "Harder specifications: negative ranges, excluded limits and several partitions. Use both techniques." }
        ],
        why: "Real defects often live in journeys and odd sequences that formal techniques miss. Experienced testers combine both.",
        analogy: "A use case is the main road; error guessing is checking the potholes you have hit before.",
        mistakes: ["Testing only the main success journey.", "Relying on guessing alone without systematic techniques.", "Not recording guesses that found defects, so the team loses the knowledge."],
        check: [
            { q: "What does a use case add that a single test case may not?", a: "A complete journey with alternative and error paths, as a user experiences it." },
            { q: "Give one error guess for a checkout page.", a: "For example pressing Place order twice, or going back after paying." }
        ],
        summary: "Use cases test complete journeys and their alternatives; error guessing adds experience-based tests; combine them with systematic techniques."
    }
];
