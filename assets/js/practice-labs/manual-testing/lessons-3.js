/* =========================================================
   ToolZen Hub
   Manual Software Testing path: lessons 18 to 24 (exploratory testing with the Bug Hunting Simulator, usability and
   compatibility; advanced: test planning, risk, Agile, acceptance criteria, metrics). Original to this site.
========================================================= */

export const lessons = [

    {
        id: "mt-exploratory", title: "Exploratory testing and the bug hunt", level: "intermediate",
        objectives: ["Explain exploratory testing and when it pays off", "Write a test charter and work in a time-box", "Find and report real defects in a test release"],
        intro: "Exploratory testing is learning the software, designing tests and running them at the same time, guided by a goal rather than a script. It finds the defects nobody thought to write a test case for, which is why skilled testers use it alongside scripted tests.",
        blocks: [
            { type: "text", heading: "Charters and sessions", paragraphs: [
                "A charter states the mission of one session: 'Explore the cart with unusual quantities and coupons to find calculation errors.' A session is a time-box, often 30 to 90 minutes, with notes of what you tried, what you saw and what looked wrong.",
                "Useful tactics: compare behaviour with the written requirements; try boundaries and invalid values; repeat an action twice; use Back and refresh; switch users; change the order of steps."
            ] },
            { type: "bughunt", heading: "Your turn: hunt the bugs in ShopLite 1.1", release: "r-bugs-1", text: "Release 1.1 of ShopLite contains ten seeded defects. Explore it with the requirements beside you, and report each defect you find in the form: the area, a title, the steps, the expected and the actual result." }
        ],
        why: "Scripted tests check what someone predicted; real users do what nobody predicted. Exploratory sessions find defects in the gaps, quickly, and teach testers how the product really behaves.",
        analogy: "Scripted testing follows a map; exploratory testing is a guided walk off the path with a compass and a notebook.",
        mistakes: [
            "Exploring without a charter or time limit, and ending with nothing written down.",
            "Reporting impressions ('checkout feels buggy') instead of reproducible steps.",
            "Forgetting the requirements: a behaviour is only a bug if it differs from what should happen."
        ],
        check: [
            { q: "What does a test charter contain?", a: "The mission of a session: the area to explore and what kind of problems to look for, often with a time-box." },
            { q: "Does exploratory testing replace test cases?", a: "No. It complements them: scripted tests guard known behaviour, exploration finds the unexpected." }
        ],
        summary: "Exploratory testing combines learning, test design and execution, guided by a charter in a time-box. It finds defects nobody scripted; record what you tried and report findings precisely."
    },

    {
        id: "mt-usability-compatibility", title: "Usability and compatibility testing", level: "intermediate",
        objectives: ["Check usability with simple heuristics", "Plan a browser and device matrix", "Report usability findings objectively"],
        intro: "Usability testing asks whether people can use the software easily and without errors. Compatibility testing asks whether it works the same across the browsers, devices and screen sizes its users actually have.",
        blocks: [
            { type: "list", heading: "Quick usability heuristics", items: ["Users can see what state they are in (cart count, signed-in name).", "Error messages say what went wrong and how to fix it.", "Actions can be undone or cancelled.", "The same thing looks and works the same everywhere.", "Forms prevent errors (date pickers, sensible limits) instead of only reporting them."] },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "ShopLite says 'Choose a quantity from 1 to 10.' after an invalid quantity. Which heuristic does this satisfy?", options: ["Error messages explain the fix", "Undo is available"], answer: 0, explain: "The message says what is allowed, so the user knows how to correct it." },
                { q: "Analytics show 70% of shoppers use Chrome on Android phones. Which combination belongs first in the compatibility matrix?", options: ["Chrome on an Android phone", "An old desktop browser used by 0.5%"], answer: 0, explain: "Prioritise the combinations real users have, by usage and risk." }
            ] }
        ],
        why: "A feature that works but confuses users, or works in Chrome but not Safari, still loses customers. These checks are cheap compared with the cost of abandoned purchases.",
        analogy: "Usability is whether a door is obvious to open; compatibility is whether it opens for everyone's key.",
        mistakes: ["Reporting usability as opinion ('ugly') instead of the effect on users ('the Apply button is below the fold, three of five testers missed it').", "Testing only on the tester's own browser and screen.", "Ignoring phones."],
        check: [
            { q: "How do you choose which browsers and devices to test?", a: "From real usage data and risk: the most used combinations first, plus any that matter for important customers." },
            { q: "Make 'the form is confusing' objective.", a: "Describe the effect: for example, 'the coupon field has no label, so users typed the code into the search box'." }
        ],
        summary: "Usability testing checks that people can use the software easily; compatibility testing checks it works across the browsers and devices users have. Report findings by their effect on users."
    },

    {
        id: "mt-test-plan", title: "Writing a test plan", level: "advanced",
        objectives: ["List the sections of a test plan", "Define scope and out-of-scope clearly", "Set entry and exit criteria for a release"],
        intro: "A test plan explains how a release will be tested: what is in and out of scope, the approach, environments, people, schedule, risks and the criteria for starting and finishing. It is a shared agreement, not paperwork.",
        blocks: [
            { type: "list", heading: "Sections of a test plan", items: ["Scope and out of scope.", "Approach: levels, types and techniques; what is automated.", "Environments and test data.", "Roles and schedule.", "Risks and mitigations.", "Entry and exit criteria.", "Deliverables: test cases, defect reports, summary report."] },
            { type: "example", title: "Part of a plan for ShopLite release 1.2 (new coupon rules)", text: "In scope: coupons (R5), cart totals, delivery fee (R6), checkout.\nOut of scope: sign-up and account screens (unchanged this release).\nApproach: boundary-value tests for coupon and delivery thresholds; exploratory session on cart totals; regression of checkout.\nExit criteria: all coupon and delivery tests run; no open critical or major defects in scope." },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Why write 'Out of scope' explicitly?", options: ["To avoid misunderstandings about what was not tested", "It is optional decoration"], answer: 0, explain: "Stakeholders otherwise assume everything was tested." },
                { q: "Which is a measurable exit criterion?", options: ["Quality is good", "No open critical defects and 100% of planned high-priority tests run"], answer: 1, explain: "It can be checked objectively." }
            ] },
            { type: "write", heading: "Your turn: plan a release", exercise: "mt-w-test-plan-coupons" }
        ],
        why: "Without a plan, testers, developers and managers each assume something different about what will be tested. A short, clear plan prevents surprises at release time.",
        analogy: "A test plan is the trip itinerary: where you are going, what you will skip, how you travel, the budget and when you will be back.",
        mistakes: ["Copying a long template nobody reads.", "Leaving out-of-scope unstated.", "Exit criteria that cannot be measured."],
        check: [
            { q: "Name four sections of a test plan.", a: "For example scope, approach, environments, risks, schedule, entry and exit criteria." },
            { q: "Who should read and agree a test plan?", a: "The testers, developers and product owner or manager responsible for the release." }
        ],
        summary: "A test plan states scope, approach, environments, people, schedule, risks, entry and exit criteria and deliverables, so the whole team agrees how a release will be tested."
    },

    {
        id: "mt-risk", title: "Risk-based testing", level: "advanced",
        objectives: ["Rate risk by likelihood and impact", "Prioritise tests by risk", "Explain risk to stakeholders"],
        intro: "There is never time to test everything equally. Risk-based testing spends effort where failure is most likely and would hurt most, so the most important problems are found first.",
        blocks: [
            { type: "text", heading: "Likelihood times impact", paragraphs: ["Rate each feature for likelihood of failure (new, complex or often-changed code is riskier) and impact if it fails (money, data, safety, reputation, number of users). High-likelihood, high-impact areas are tested first and most deeply."] },
            { type: "order", heading: "Your turn: rank by risk", prompt: "Rank these ShopLite areas from highest to lowest risk for a release that rewrote the price calculation.", items: ["Cart totals and coupons (rewritten, money)", "Checkout delivery fee (depends on totals, money)", "Product search (unchanged)", "Requirements page text (unchanged, no money)"], explain: "Rewritten code that handles money is both likely to fail and costly if it does; unchanged, low-impact areas get a light check." }
        ],
        why: "Risk-based testing lets you say, honestly and early, which risks have been reduced and which remain, which is what managers need to decide on a release.",
        analogy: "Like checking the brakes before the paintwork: both matter, but a brake failure is far more dangerous.",
        mistakes: ["Testing in the order features appear in the menu.", "Rating risk once and never revisiting it after changes.", "Hiding remaining risks in the summary report."],
        check: [
            { q: "What two factors make up risk?", a: "Likelihood of failure and impact of failure." },
            { q: "Which is riskier: an unchanged help page or a rewritten payment calculation?", a: "The rewritten payment calculation: more likely to fail and costlier if it does." }
        ],
        summary: "Rate features by likelihood and impact, test the riskiest first and deepest, and report remaining risk openly."
    },

    {
        id: "mt-agile", title: "Testing in Agile and Scrum teams", level: "advanced",
        objectives: ["Describe the tester's role in Scrum", "Explain shift-left and the three amigos", "Use a definition of done that includes testing"],
        intro: "In Agile teams, testing is part of every short iteration rather than a phase at the end. Testers work with developers and the product owner from the first conversation about a story until it is done.",
        blocks: [
            { type: "list", heading: "Where testers contribute in Scrum", items: ["Refinement: question stories and add acceptance criteria.", "Three amigos: product owner, developer and tester agree examples before building.", "During the sprint: test each story as soon as it is ready, pair with developers, automate regression checks.", "Definition of done: a story is not done until its tests pass and its defects are resolved.", "Review and retrospective: show working software, improve the process."] },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "What does 'shift-left' mean?", options: ["Testing earlier in the life cycle", "Moving testers to another team"], answer: 0, explain: "Activities such as reviewing stories and agreeing examples move earlier, where defects are cheaper." },
                { q: "A developer says a story is done; its tests have not run. Under a good definition of done, is it done?", options: ["Yes", "No"], answer: 1, explain: "Done includes testing; untested work is not done." }
            ] }
        ],
        why: "Most teams work in an Agile way. Testers who join conversations early prevent defects instead of reporting them late, and are valued for it.",
        analogy: "Agile testing is a chef tasting while cooking instead of after the plate reaches the customer.",
        mistakes: ["Waiting for the end of the sprint to test everything.", "Staying silent in refinement.", "Letting 'done' mean 'coded'."],
        check: [
            { q: "Who are the three amigos?", a: "The product owner (business), a developer and a tester, agreeing what a story should do." },
            { q: "Why include testing in the definition of done?", a: "So stories are only counted as finished when they are verified, keeping quality visible every sprint." }
        ],
        summary: "In Agile, testers contribute from refinement to review, test continuously within the sprint and make testing part of the definition of done."
    },

    {
        id: "mt-acceptance-criteria", title: "Acceptance criteria and Given/When/Then", level: "advanced",
        objectives: ["Write testable acceptance criteria", "Use the Given/When/Then format", "Turn criteria into test cases"],
        intro: "Acceptance criteria are the conditions a user story must meet to be accepted. Written as concrete examples, they become shared tests that developers, testers and the product owner all understand.",
        blocks: [
            { type: "example", title: "Given/When/Then for ShopLite's SAVE10", text: "Given the items total is ₹500\nWhen the customer applies SAVE10\nThen ₹50 is taken off and the message says SAVE10 applied\n\nGiven the items total is ₹499\nWhen the customer applies SAVE10\nThen the coupon is refused with a message about the ₹500 minimum" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which acceptance criterion is testable?", options: ["Coupons should be user-friendly", "Given an expired code, when it is applied, then the message 'This code has expired' is shown"], answer: 1, explain: "It names a precondition, an action and an observable result." },
                { q: "In Given/When/Then, what does 'Given' describe?", options: ["The starting state", "The expected result"], answer: 0, explain: "Given sets the context, When is the action, Then is the observable outcome." }
            ] }
        ],
        why: "Clear acceptance criteria remove arguments at the end of a sprint and give testers ready-made test cases, often automated directly (behaviour-driven development).",
        analogy: "Acceptance criteria are the checklist a builder and customer agree on before work starts: when every item is ticked, the job is accepted.",
        mistakes: ["Vague criteria ('fast', 'easy').", "Only the happy path; no criteria for errors.", "Writing criteria after the code is built."],
        check: [
            { q: "Write a Then for: Given a cart of ₹999, When the customer opens the cart.", a: "Then delivery shows Free (R6)." },
            { q: "How do acceptance criteria help testers?", a: "They are concrete, agreed examples that become test cases directly." }
        ],
        summary: "Acceptance criteria are concrete, testable conditions for a story; Given/When/Then expresses them as shared examples that become tests."
    },

    {
        id: "mt-metrics", title: "Test metrics and reporting", level: "advanced",
        objectives: ["Calculate common test metrics", "Interpret metrics with care", "Write an honest test summary"],
        intro: "Metrics turn test activity into numbers that help decisions: how much is tested, how much passes, how many defects escape. Used carefully, they show progress and risk; used carelessly, they hide it.",
        blocks: [
            { type: "list", heading: "Common metrics", items: ["Execution progress: tests run ÷ tests planned.", "Pass rate: tests passed ÷ tests run.", "Defects by severity and status (open critical defects matter most).", "Defect leakage: defects found after release ÷ all defects found.", "Requirement coverage: requirements with at least one passing test ÷ all requirements."] },
            { type: "quiz", heading: "Your turn: calculate", questions: [
                { q: "120 tests planned, 100 run, 90 passed. What is the pass rate of tests run?", options: ["75%", "90%", "83%"], answer: 1, explain: "90 ÷ 100 = 90%. Of all planned tests, only 75% have passed, which is why both numbers belong in a report." },
                { q: "40 defects found in testing, 10 more by customers after release. What is the leakage?", options: ["20%", "25%", "10%"], answer: 0, explain: "10 ÷ 50 = 20% of all defects escaped to production." }
            ] }
        ],
        why: "Release decisions depend on clear, honest numbers. Good metrics show where risk remains; a single high pass rate can hide untested areas.",
        analogy: "Metrics are a car's dashboard: useful at a glance, but the speedometer says nothing about the tyres.",
        mistakes: ["Reporting a pass rate without how many tests were not run.", "Rewarding testers by number of bugs reported.", "Showing numbers without explaining the risks behind them."],
        check: [
            { q: "Why report execution progress alongside pass rate?", a: "A 100% pass rate on 10% of planned tests says little; progress shows how much is still untested." },
            { q: "What does a rising defect leakage suggest?", a: "More defects are escaping testing, so coverage or techniques need improving." }
        ],
        summary: "Use metrics such as progress, pass rate, defects by severity, leakage and coverage together, and pair numbers with an honest description of remaining risk."
    }
];
