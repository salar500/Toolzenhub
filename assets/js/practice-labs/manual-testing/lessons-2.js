/* =========================================================
   ToolZen Hub
   Manual Software Testing path: lessons 11 to 17 (intermediate: data and coverage, executing and reporting, types of
   testing). Same shape as lessons.js; original to this site.
========================================================= */

export const lessons = [

    {
        id: "mt-test-data", title: "Choosing test data", level: "intermediate",
        objectives: ["Choose test data that finds defects, not just data that passes", "Combine typical, boundary, invalid and special values", "Keep test data safe and private"],
        intro: "Test data is the input a test uses: the product, the quantity, the email, the date. Good test data is chosen on purpose, so that each value has a reason to be there and a chance to reveal a defect.",
        blocks: [
            { type: "list", heading: "Kinds of test data", items: [
                "Typical values: what most users enter, such as a quantity of 2.",
                "Boundary values: the edges of a rule and just beyond, such as ₹499, ₹500 and ₹999 in ShopLite.",
                "Invalid values: wrong type, wrong format, out of range: 'abc', 2.5, test@example.",
                "Special values: empty, very long text, leading or trailing spaces, apostrophes (O'Brien), non-English letters, emoji.",
                "State data: what must already exist, such as a customer with previous orders for a WELCOME50 test."
            ] },
            { type: "example", title: "Test data for ShopLite's SAVE10 rule (R5)", text: "Items total ₹499 → refused (just below)\nItems total ₹500 → 10% off = ₹50 (on the boundary)\nItems total ₹999 → ₹99 off (rounding down: 99.9 → 99)\nCode 'save10' in lower case → accepted (codes ignore case)\nCode 'SAVE 10' with a space → refused (unknown code)" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Which single value is most likely to reveal a mistake in 'free delivery from ₹999'?", options: ["₹250", "₹999", "₹5,000"], answer: 1, explain: "₹999 sits exactly on the boundary, where developers write > instead of >=. In ShopLite's release 1.1 it reveals a seeded bug." },
                { q: "A tester copies real customer emails from production into the test system. What is the problem?", options: ["None, real data is the most realistic", "It risks exposing personal data; use made-up or masked data", "Emails are not test data"], answer: 1, explain: "Personal data must be protected in test systems too. Use invented data (name@example.com) or properly masked copies." }
            ] }
        ],
        why: "Most tests pass with the first value that comes to mind. Defects hide at boundaries, in unusual characters and in particular states, so the choice of data decides whether a test finds anything.",
        analogy: "Choosing test data is like a quality inspector choosing which eggs to crack open: not just the ones that look fine, but the ones from the edge of the tray and the odd-shaped ones.",
        mistakes: [
            "Using the same 'happy' value in every test.",
            "Forgetting state: a test for a first-order discount needs a customer with no previous orders.",
            "Using real personal data in test environments."
        ],
        check: [
            { q: "Name one special value worth trying in a name field.", a: "For example an apostrophe (O'Brien), leading spaces, very long text or non-English letters." },
            { q: "Why test ₹500 as well as ₹499 for a ₹500 minimum?", a: "₹499 checks the refusal just below; ₹500 checks the rule applies exactly at the boundary." }
        ],
        summary: "Choose test data on purpose: typical, boundary, invalid and special values, plus the right starting state. Keep personal data out of test systems."
    },

    {
        id: "mt-traceability", title: "Coverage and the traceability matrix", level: "intermediate",
        objectives: ["Explain requirement coverage", "Build a simple traceability matrix", "Find requirements with no tests"],
        intro: "Coverage answers the question 'what have we tested?'. A traceability matrix links each requirement to the test cases that check it, so a gap (a requirement with no test) or an orphan (a test linked to nothing) is visible at a glance.",
        blocks: [
            { type: "example", title: "A traceability matrix for part of ShopLite", text: "Requirement | Test cases                | Status\nR1 Search   | TC-SEARCH-01, TC-SEARCH-02 | 2 pass\nR3 Cart qty | TC-CART-01, TC-CART-02     | 1 pass, 1 fail\nR5 Coupons  | TC-COUPON-01..04           | 4 pass\nR6 Delivery | (none)                     | not covered\nR7 Checkout | TC-CHECKOUT-01             | not run" },
            { type: "quiz", heading: "Your turn: read the matrix", questions: [
                { q: "Which requirement is not covered by any test?", options: ["R1", "R6", "R7"], answer: 1, explain: "R6 has no linked test cases: a coverage gap to fix before release." },
                { q: "R7 has a test that has not been run. What should the test summary say?", options: ["R7 is tested", "R7 is covered by a test that was not run, so its status is unknown", "R7 failed"], answer: 1, explain: "Being covered by a test is not the same as having passed it. Report it honestly as not run." },
                { q: "A test case links to no requirement. What is it called and what should you do?", options: ["An orphan: link it or ask whether it is still needed", "A gap: delete the requirement", "Nothing; it does not matter"], answer: 0, explain: "Orphan tests may test something no longer required, or a requirement nobody wrote down." }
            ] }
        ],
        why: "Managers ask 'is everything tested?'. A traceability matrix lets you answer with facts, find gaps before release and see which tests to rerun when a requirement changes.",
        analogy: "A traceability matrix is like a packing list with ticks: each item on the list is either packed, checked, or clearly missing.",
        mistakes: [
            "Counting tests instead of covered requirements: 50 tests on one feature and none on another is poor coverage.",
            "Reporting 'covered' for tests that were never run.",
            "Letting the matrix go stale when requirements change."
        ],
        check: [
            { q: "What is a coverage gap?", a: "A requirement with no test case linked to it." },
            { q: "Is 100% requirement coverage the same as no defects?", a: "No. It means every requirement has at least one test; those tests can still miss defects." }
        ],
        summary: "Coverage shows what is tested. A traceability matrix links requirements to test cases and results, exposing gaps, orphans and untested risk."
    },

    {
        id: "mt-execution", title: "Executing tests and recording results", level: "intermediate",
        objectives: ["Record a test result as pass, fail, blocked or not run", "Keep evidence for failures", "Separate a test result from a defect report"],
        intro: "Test execution is running test cases and recording exactly what happened. A good record lets anyone see what was run, on which build and environment, with what result, and where the evidence is.",
        blocks: [
            { type: "list", heading: "Result statuses", items: [
                "Pass: the actual result matched the expected result.",
                "Fail: it did not. Record the actual result and raise or link a defect.",
                "Blocked: the test could not be run, for example because a previous step or another defect stopped it.",
                "Not run: not attempted yet, or skipped on purpose (say why)."
            ] },
            { type: "quiz", heading: "Your turn: which status?", questions: [
                { q: "The checkout test cannot start because sign-in is broken in this build.", options: ["Fail", "Blocked", "Not run"], answer: 1, explain: "The test was prevented from running by another problem: blocked, with a link to the sign-in defect." },
                { q: "Delivery shows ₹49 for a ₹999 cart; the test case expects free delivery.", options: ["Fail", "Blocked", "Pass with a note"], answer: 0, explain: "Actual and expected differ: fail. Record the actual result and report the defect." },
                { q: "A test passed on the old build, and a new build arrived before it was rerun.", options: ["Still pass", "Not run on the new build", "Blocked"], answer: 1, explain: "Results belong to a build. On the new build it has not been run yet." }
            ] },
            { type: "shoplite", text: "Run the six-step test case from the 'Writing a good test case' lesson on both ShopLite releases and record a status and the actual result for each.", release: "r-bugs-1" }
        ],
        why: "Test results are evidence used to decide whether to release. Precise statuses with the build and environment let the team trust them and act quickly on failures.",
        analogy: "Recording results is like a referee's match report: what happened, when, who was involved and the evidence, not just 'it went fine'.",
        mistakes: [
            "Marking a test as failed when it was really blocked by something else.",
            "Not recording the build, browser or environment.",
            "Writing 'failed' without the actual result or a screenshot."
        ],
        check: [
            { q: "What is the difference between a failed and a blocked test?", a: "A failed test ran and the actual result differed; a blocked test could not be run." },
            { q: "Why record the build number with each result?", a: "Results apply to a specific build; a fix or a new defect in another build changes them." }
        ],
        summary: "Record each test as pass, fail, blocked or not run, with the build, environment, actual result and evidence. Link failures to defect reports."
    },

    {
        id: "mt-bug-reports", title: "Writing a bug report developers can act on", level: "intermediate",
        objectives: ["Write a bug report with title, environment, steps, expected and actual results", "Choose severity and priority", "Make a report reproducible by someone else"],
        intro: "A bug report is how a failure becomes a fix. A developer who has never seen the problem must be able to reproduce it from your report alone, understand why it is wrong and judge how urgent it is.",
        blocks: [
            { type: "list", heading: "The parts of a bug report", items: [
                "Title: what fails and where, in one line: 'Delivery fee charged on a cart of exactly ₹999'.",
                "Environment: build or release, browser and device.",
                "Steps to reproduce: numbered, one action each, from a known starting state.",
                "Expected result, with the requirement it comes from.",
                "Actual result: exactly what happened, with any message text.",
                "Severity (how bad the impact is) and priority (how soon it should be fixed).",
                "Evidence: a screenshot or recording, and the data used."
            ] },
            { type: "text", heading: "Severity and priority", paragraphs: [
                "Severity is about impact: critical (data loss, security, no workaround), major (a feature is wrong), minor (a small problem with a workaround), trivial (cosmetic). Priority is about urgency and is often set by the product owner. A spelling mistake on the home page can be minor severity but high priority; a crash in a rarely used admin screen can be critical severity but lower priority."
            ] },
            { type: "write", heading: "Your turn: report a ShopLite bug", exercise: "mt-w-bug-report-delivery" }
        ],
        why: "Unclear reports bounce back and forth between tester and developer, and real defects get closed as 'cannot reproduce'. A clear report gets fixed first.",
        analogy: "A bug report is like a good witness statement: what you saw, where and when, in the order it happened, without guessing at motives.",
        mistakes: [
            "Titles like 'Cart broken' or 'Bug in checkout'.",
            "Steps that skip the starting state or bundle actions.",
            "Mixing up severity (impact) and priority (urgency).",
            "Blaming a person or guessing the cause instead of describing the behaviour."
        ],
        check: [
            { q: "What must a developer be able to do with your steps?", a: "Reproduce the failure on their own, starting from the state you describe." },
            { q: "Can a low-severity bug have high priority?", a: "Yes, for example a visible typo on the home page: little impact on function, but fixed soon for the company's image." }
        ],
        summary: "A good bug report has a specific title, the environment, reproducible single-action steps, expected and actual results, severity, priority and evidence."
    },

    {
        id: "mt-bug-life-cycle", title: "The bug life cycle", level: "intermediate",
        objectives: ["Describe the states a defect passes through", "Know who moves a defect between states", "Explain retesting and closing"],
        intro: "A defect report moves through states from the moment it is raised until it is closed. Tools such as Jira name the states differently, but the life cycle is similar everywhere.",
        blocks: [
            { type: "order", heading: "Your turn: a typical life cycle", prompt: "Put the states of a defect that is fixed successfully in order.", items: ["New", "Assigned", "Open (being fixed)", "Fixed", "Retest", "Closed"], explain: "The tester raises it (New), a lead assigns it, the developer works on it (Open) and marks it Fixed; the tester retests on a new build and closes it if the fix works, or reopens it if not." },
            { type: "list", heading: "Other outcomes", items: [
                "Reopened: the retest failed; it goes back to the developer.",
                "Rejected or not a bug: the behaviour is correct per the requirements (link the requirement).",
                "Duplicate: already reported; link the original.",
                "Deferred: real, but fixed in a later release.",
                "Cannot reproduce: the developer could not see it; usually a sign the report needs better steps or environment details."
            ] }
        ],
        why: "Knowing the life cycle tells you what to do at each stage: retest promptly, reopen with evidence, and never close a defect without checking the fix yourself.",
        analogy: "It is like a parcel's tracking history: created, picked up, in transit, out for delivery, delivered, or returned to sender with a reason.",
        mistakes: [
            "Closing a defect because the developer said it is fixed, without retesting.",
            "Reopening without new evidence or the build number.",
            "Ignoring 'cannot reproduce' instead of improving the report."
        ],
        check: [
            { q: "What does a tester do when a defect is marked Fixed?", a: "Retest it on the build with the fix; close it if it works, reopen it with evidence if not." },
            { q: "When is a defect rejected?", a: "When the behaviour is correct according to the requirements, or the report was a misunderstanding." }
        ],
        summary: "Defects move from New through Assigned, Open and Fixed to Retest and Closed, or to Reopened, Rejected, Duplicate or Deferred. Testers retest before closing."
    },

    {
        id: "mt-functional-nonfunctional", title: "Functional and non-functional testing", level: "intermediate",
        objectives: ["Tell functional from non-functional testing", "Name common non-functional qualities", "Classify tests by what they check"],
        intro: "Functional testing checks what the software does: the features and rules. Non-functional testing checks how well it does it: speed, usability, security, accessibility, compatibility and reliability.",
        blocks: [
            { type: "quiz", heading: "Your turn: functional or non-functional?", questions: [
                { q: "SAVE10 gives 10% off orders of ₹500 or more.", options: ["Functional", "Non-functional"], answer: 0, explain: "It checks a business rule: functional." },
                { q: "The product page loads within 2 seconds on a 4G connection.", options: ["Functional", "Non-functional"], answer: 1, explain: "It checks speed (performance): non-functional." },
                { q: "The checkout form can be completed using only a keyboard.", options: ["Functional", "Non-functional"], answer: 1, explain: "Accessibility is a non-functional quality." },
                { q: "The shop works the same in Chrome, Firefox and Safari on a phone.", options: ["Functional", "Non-functional"], answer: 1, explain: "Compatibility is non-functional." }
            ] },
            { type: "list", heading: "Common non-functional qualities", items: ["Performance: speed and behaviour under load.", "Usability: how easy it is to use.", "Accessibility: whether people with disabilities can use it.", "Security: protection of data and access.", "Compatibility: browsers, devices, operating systems.", "Reliability: how it copes with failures and keeps working."] }
        ],
        why: "Users judge software by both: a correct checkout that takes 20 seconds or cannot be used with a screen reader still fails them. Many requirements documents forget non-functional needs, so testers ask about them.",
        analogy: "A car's functional test checks that the brakes stop it; its non-functional tests check how quickly it stops, how comfortable the ride is and whether it starts on a cold morning.",
        mistakes: [
            "Testing only features and never speed, accessibility or other browsers.",
            "Writing non-functional requirements without numbers ('fast', 'easy').",
            "Leaving performance testing until the week before launch."
        ],
        check: [
            { q: "Is 'the password must be at least 8 characters' functional or non-functional?", a: "Functional: it is a rule the software must enforce (it supports security, but the check itself is a feature rule)." },
            { q: "Name three non-functional qualities.", a: "For example performance, accessibility and compatibility (also usability, security, reliability)." }
        ],
        summary: "Functional testing checks what the software does; non-functional testing checks how well it does it, covering performance, usability, accessibility, security, compatibility and reliability."
    },

    {
        id: "mt-smoke-sanity-regression", title: "Smoke, sanity and regression testing", level: "intermediate",
        objectives: ["Explain smoke, sanity and regression testing", "Choose the right suite for a situation", "Explain why regression testing grows with every release"],
        intro: "Three kinds of test run are named by when and why they happen. A smoke test checks a new build is stable enough to test at all. A sanity test checks a specific fix or small change works. A regression test checks that changes have not broken what used to work.",
        blocks: [
            { type: "list", heading: "In practice", items: [
                "Smoke: a short, broad check of the most important flows on every new build: the shop opens, a product can be added, checkout starts. If it fails, the build goes back.",
                "Sanity: narrow and deep around one change: after a fix to the ₹999 delivery rule, check ₹998, ₹999 and ₹1,000 and the totals around them.",
                "Regression: rerunning existing tests across the product after changes, often automated, because a change in one place can break another."
            ] },
            { type: "quiz", heading: "Your turn: which run?", questions: [
                { q: "A new build has just been installed in the test environment.", options: ["Smoke test", "Full regression", "Exploratory testing only"], answer: 0, explain: "First check the build is testable at all with a short smoke test." },
                { q: "The developer fixed the coupon minimum. You check that exact behaviour and its neighbours.", options: ["Sanity test", "Smoke test"], answer: 0, explain: "A focused check of one fix is a sanity test (followed by a retest of the defect)." },
                { q: "A release changes how prices are stored. You rerun cart, coupon, delivery and order tests.", options: ["Regression testing", "Sanity testing"], answer: 0, explain: "A change with wide impact needs regression testing of everything that depends on prices." }
            ] }
        ],
        why: "Time is always short. Knowing which kind of run fits the moment avoids both wasting hours on a broken build and releasing a change that quietly broke something else.",
        analogy: "Smoke testing is switching on a new appliance to see that it powers up; sanity testing is checking the button that was just repaired; regression testing is checking every function still works after the repair.",
        mistakes: [
            "Starting detailed testing before a smoke test confirms the build works.",
            "Retesting only the fixed defect and never its surroundings.",
            "Letting the regression suite grow forever without pruning outdated tests."
        ],
        check: [
            { q: "Smoke versus sanity: which is broad and shallow?", a: "Smoke testing is broad and shallow; sanity testing is narrow and deep." },
            { q: "Why is regression testing often automated?", a: "It repeats the same checks on every release, which is costly by hand and well suited to automation." }
        ],
        summary: "Smoke tests check a build is testable, sanity tests check a specific change, and regression tests check that changes broke nothing else."
    }
];
