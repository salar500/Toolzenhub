/* =========================================================
   ToolZen Hub
   Smart Flashcards deck: Software Testing

   Plain data (see learning/content-schema.js). Original questions
   and explanations. Terms follow common usage as set out in the
   ISTQB Glossary and ISO/IEC/IEEE 29119-1; where practice differs
   between teams the card says so. Boundary value cards state their
   own domain, so the answer never depends on an unstated convention.
   Not an exam preparation product and not affiliated with ISTQB.
========================================================= */

export const deck = {
    id: "software-testing",
    version: "1.0.0",
    title: "Software Testing",
    description: "Basic terms, test levels and types, test design with partitions and boundaries, defect reports, and the habits of a careful tester.",
    reviewed: {
        date: "2026-10-29",
        method: "Written and checked by the author against the ISTQB Glossary and ISO/IEC/IEEE 29119-1 definitions; every boundary and partition example worked by hand and re-checked by a script in the unit tests. No second reviewer yet."
    },
    topics: [
        { id: "basics", title: "Basic terms" },
        { id: "levels", title: "Levels and types" },
        { id: "design", title: "Test design" },
        { id: "defects", title: "Defects and reports" },
        { id: "practice", title: "Practice and judgement" }
    ],
    cards: [
        {
            id: "st-error-defect-failure", topic: "basics", kind: "choice", difficulty: "beginner",
            prompt: "In common testing vocabulary, which sequence describes how a mistake becomes something a user sees?",
            options: [
                "A failure in the code leads to an error in the user, which in the end is recorded as a defect.",
                "A person makes an error, which puts a defect in the software, which may cause a failure when it runs.",
                "A defect in the user's understanding causes a failure on the screen, which then leads to an error in the code.",
                "A failure is first written into the code, and that failure then causes the person to make an error."
            ],
            correct: 1,
            explanation: "An error (a mistake by a person) can introduce a defect (a fault) into the work product. When the defect is executed under the right conditions the system may fail, meaning its behaviour departs from what is expected. A defect that is never executed causes no failure.",
            source: "ISTQB Glossary: error, defect, failure"
        },
        {
            id: "st-verification-validation", topic: "basics", kind: "recall", difficulty: "intermediate",
            prompt: "What is the difference between verification and validation?",
            answer: "Verification checks that the product is built according to its specification (are we building it right?). Validation checks that it meets the needs of its users (are we building the right thing?).",
            explanation: "A product can pass verification and fail validation: it may match a specification exactly while that specification misses what users need. Reviews, static analysis and tests against requirements mostly verify; trials with real users, and acceptance testing, mostly validate.",
            source: "ISTQB Glossary: verification, validation"
        },
        {
            id: "st-testing-shows-presence", topic: "basics", kind: "choice", difficulty: "intermediate",
            prompt: "A team ran every planned test and none failed. Which conclusion is justified?",
            options: [
                "The software has no defects, because every planned test has passed.",
                "No defects were found by those tests; testing can show that defects exist but cannot prove that none remain.",
                "The software is ready for release in every environment, since the plan was completed.",
                "The tests were certainly well designed and complete, because nothing at all failed."
            ],
            correct: 1,
            explanation: "Testing samples behaviour; it does not cover every input, state and environment. Passing tests lower the risk and raise confidence but cannot prove absence of defects. A suite that never fails may also simply be missing the cases that would.",
            source: "ISTQB Foundation syllabus: testing principles"
        },
        {
            id: "st-test-case-parts", topic: "basics", kind: "recall", difficulty: "beginner",
            prompt: "Name the parts a good test case needs, besides its title.",
            answer: "Preconditions (the starting state), the inputs or steps, and the expected result. Often also a way to see the actual result and a link to the requirement it covers.",
            explanation: "The expected result must be decided before the test is run, from the specification and not from what the program happens to do. A test with no expected result cannot fail, so it cannot find anything.",
            source: "ISO/IEC/IEEE 29119-3 (test case specification)"
        },
        {
            id: "st-oracle", topic: "basics", kind: "choice", difficulty: "advanced",
            prompt: "What is a test oracle?",
            options: [
                "A tool that runs the whole set of tests automatically every night on a build server.",
                "A report that lists all of the open defects together with their owners and dates.",
                "A source of the expected result, such as a specification or a hand calculation.",
                "A senior person who approves the release after reading the test summary."
            ],
            correct: 2,
            explanation: "To say a result is wrong you need something to compare it with. Using the code under test to produce its own expected values proves only that the code agrees with itself, so an independent oracle matters most for calculations.",
            source: "ISTQB Glossary: test oracle"
        },
        {
            id: "st-levels-order", topic: "levels", kind: "choice", difficulty: "beginner",
            prompt: "Which list of test levels runs from the smallest piece of software to the whole delivered product?",
            options: [
                "Acceptance, system, integration, component",
                "System, component, acceptance, integration",
                "Component (unit), integration, system, acceptance",
                "Integration, acceptance, component, system"
            ],
            correct: 2,
            explanation: "Component or unit tests check small parts alone, integration tests check how parts work together, system tests check the whole product against its requirements, and acceptance tests decide whether it is fit for its users or customer.",
            source: "ISTQB Foundation syllabus: test levels"
        },
        {
            id: "st-integration-focus", topic: "levels", kind: "choice", difficulty: "intermediate",
            prompt: "Two modules each pass their own unit tests, yet the feature fails when they are combined. Which level of testing is meant to find this kind of problem?",
            options: [
                "Integration testing, which targets interfaces and the interaction between parts.",
                "Usability testing, which targets how pleasant the screens are.",
                "Smoke testing, which targets a single yes or no answer after each build.",
                "Static review, which targets the formatting of the source files."
            ],
            correct: 0,
            explanation: "Typical integration defects are mismatched data formats, wrong assumptions about units or order of calls, and missing error handling at the boundary between parts. Unit tests with replaced neighbours cannot reveal them.",
            source: "ISTQB Foundation syllabus: integration testing"
        },
        {
            id: "st-smoke-vs-regression", topic: "levels", kind: "choice", difficulty: "intermediate",
            prompt: "A new build arrives. Which description fits a smoke test, compared with a regression test?",
            options: [
                "A smoke test runs every test ever written for the product, while a regression test runs only a single case.",
                "A smoke test checks whether defects that were fixed in earlier releases have returned, one by one.",
                "A smoke test checks that the main functions work at all; a regression test checks that a change has not broken older behaviour.",
                "A smoke test is done only by customers on site, and a regression test is done only by developers."
            ],
            correct: 2,
            explanation: "A smoke test is a quick, shallow check of the critical paths, and a failing smoke test sends the build back. A regression suite is broader and exists to detect unwanted side effects of change. Teams use the words loosely, so agree what each one means locally.",
            source: "ISTQB Glossary: smoke test, regression testing"
        },
        {
            id: "st-confirmation-testing", topic: "levels", kind: "recall", difficulty: "intermediate",
            prompt: "After a developer says a defect is fixed, which two kinds of test do you run, and why both?",
            answer: "Confirmation (re-test) testing, to check that the failing case now passes; and regression testing, to check that the fix did not break something else.",
            explanation: "The first answers whether the fix works, the second whether it did harm. Running only the original failing case can miss a new fault introduced nearby.",
            source: "ISTQB Glossary: confirmation testing, regression testing"
        },
        {
            id: "st-black-white-box", topic: "levels", kind: "choice", difficulty: "beginner",
            prompt: "A tester designs cases from the requirements without reading the code. What is this approach called?",
            options: [
                "Black-box (specification-based) testing",
                "White-box (structure-based) testing",
                "Mutation testing",
                "Static analysis"
            ],
            correct: 0,
            explanation: "Black-box techniques derive cases from what the software should do: requirements, models and examples of use. White-box techniques use the internal structure, such as statements and branches, to decide what to cover. Good practice uses both.",
            source: "ISTQB Glossary: black-box testing, white-box testing"
        },
        {
            id: "st-functional-vs-nonfunctional", topic: "levels", kind: "choice", difficulty: "intermediate",
            prompt: "Which of these is a non-functional test objective?",
            options: [
                "Check that the discount equals 10 percent for a gold member.",
                "Check that the login page responds within two seconds with fifty users at once.",
                "Check that an invalid email address is refused.",
                "Check that the report contains the selected date range."
            ],
            correct: 1,
            explanation: "Functional testing asks what the system does; non-functional testing asks how well it does it, for example speed under load, security, usability, reliability or accessibility. All three of the other statements are about a specific behaviour.",
            source: "ISO/IEC 25010 (product quality characteristics)"
        },
        {
            id: "st-bva-two-value", topic: "design", kind: "choice", difficulty: "intermediate",
            prompt: "An age field accepts whole numbers from 18 to 65 inclusive. Using two-value boundary value analysis, which set tests each boundary and its nearest neighbour outside the range?",
            options: [
                "18, 65",
                "18, 41, 65",
                "17, 18, 65, 66",
                "17, 19, 64, 66"
            ],
            correct: 2,
            explanation: "Two-value analysis takes each edge of the valid partition and the nearest value just outside it: 17 and 18 at the lower edge, 65 and 66 at the upper edge. Three-value analysis also adds the value just inside each edge (19 and 64). Always check which version a course or team uses.",
            source: "ISTQB Foundation syllabus: boundary value analysis"
        },
        {
            id: "st-bva-three-value", topic: "design", kind: "choice", difficulty: "advanced",
            prompt: "The same age field accepts whole numbers from 18 to 65 inclusive. Which set is the full three-value boundary set?",
            options: [
                "17, 18, 19, 64, 65, 66",
                "18, 19, 64, 65",
                "17, 18, 65, 66",
                "0, 18, 41, 65, 100"
            ],
            correct: 0,
            explanation: "Three-value analysis uses, at each boundary, the value below, on and above it: 17, 18, 19 and 64, 65, 66. Six values in all. The last option mixes arbitrary values and is closer to equivalence partitioning.",
            source: "ISTQB Foundation syllabus: boundary value analysis"
        },
        {
            id: "st-bva-exclusive", topic: "design", kind: "choice", difficulty: "advanced",
            prompt: "A discount applies when the order total is greater than 100 and at most 500, in whole currency units. Using two-value analysis, which values are the boundary tests?",
            options: [
                "100, 101, 499, 500",
                "100, 101, 500, 501",
                "99, 100, 500, 501",
                "101, 500"
            ],
            correct: 1,
            explanation: "The valid range is 101 to 500, because 100 is excluded and 500 is included. The lower edge is therefore 100 (invalid) and 101 (valid); the upper edge is 500 (valid) and 501 (invalid). Reading the words greater than and at most carefully is the whole skill here.",
            source: "ISTQB Foundation syllabus: boundary value analysis"
        },
        {
            id: "st-bva-decimal", topic: "design", kind: "recall", difficulty: "advanced",
            prompt: "A field accepts a weight from 0.5 to 20.0 kg inclusive, with one decimal place. Give the two-value boundary tests.",
            answer: "0.4 and 0.5 at the lower edge; 20.0 and 20.1 at the upper edge.",
            explanation: "With one decimal place the smallest step is 0.1, so the nearest values outside the range are 0.4 and 20.1. If the field allowed two decimal places the neighbours would be 0.49 and 20.01. The step size is part of the domain and must be known before choosing boundary values.",
            source: "ISTQB Foundation syllabus: boundary value analysis"
        },
        {
            id: "st-equivalence-partition", topic: "design", kind: "choice", difficulty: "intermediate",
            prompt: "What is the idea of equivalence partitioning?",
            options: [
                "Test every possible input once, and then repeat the whole set of inputs again on every later build.",
                "Divide the inputs into groups that the software should treat in the same way, and test at least one value from each group.",
                "Pick only the values at the very edges of each input range, and ignore the values in the middle.",
                "Split the test team into two halves, so that each half tests the same thing independently of the other."
            ],
            correct: 1,
            explanation: "If all values in a group are expected to behave alike, one representative stands for the group, which cuts the number of tests. The method relies on the partitions being right; a wrongly drawn partition hides defects.",
            source: "ISTQB Foundation syllabus: equivalence partitioning"
        },
        {
            id: "st-partitions-count", topic: "design", kind: "choice", difficulty: "intermediate",
            prompt: "A form accepts a quantity from 1 to 10 inclusive as a whole number. How many equivalence partitions does it have when invalid values are included?",
            options: [
                "One, the valid range from 1 to 10.",
                "Two, valid and invalid.",
                "Three: below 1, from 1 to 10, and above 10.",
                "Ten, one for every valid number."
            ],
            correct: 2,
            explanation: "The invalid values fall on two sides of the valid range and are handled separately, so there are three partitions: 0 and below, 1 to 10, and 11 and above. A careful tester would add partitions for non-numeric text and decimals if the field can receive them.",
            source: "ISTQB Foundation syllabus: equivalence partitioning"
        },
        {
            id: "st-decision-table", topic: "design", kind: "choice", difficulty: "advanced",
            prompt: "A rule has two independent yes or no conditions. How many columns does a complete decision table need?",
            options: [
                "2",
                "3",
                "4",
                "8"
            ],
            correct: 2,
            explanation: "Each condition has two values, so the combinations are 2 times 2, which is 4. With three conditions it would be 8. Decision tables suit rules where combinations of conditions give different outcomes; they can be reduced by merging columns whose outcome does not depend on one condition.",
            source: "ISTQB Foundation syllabus: decision table testing"
        },
        {
            id: "st-state-transition", topic: "design", kind: "recall", difficulty: "advanced",
            prompt: "When is state transition testing a good fit? Give one example.",
            answer: "When the behaviour depends on the current state as well as the input. Example: a login that locks the account after three failed attempts, or an order that moves from placed to paid to shipped.",
            explanation: "The same input can give different results in different states, so a test must set up the state first, apply the event, and check the new state and output. Invalid transitions, such as shipping an unpaid order, deserve tests too.",
            source: "ISTQB Foundation syllabus: state transition testing"
        },
        {
            id: "st-exploratory", topic: "design", kind: "recall", difficulty: "intermediate",
            prompt: "What is exploratory testing, and what keeps it from being random clicking?",
            answer: "Simultaneous learning, test design and execution, with each result steering the next test. A charter that names the goal and a time box, plus notes of what was tried and found, keep it disciplined.",
            explanation: "It is strong where requirements are thin and where the unexpected matters. Because the steps are not scripted in advance, the notes are what make the work repeatable and reportable.",
            source: "ISTQB Glossary: exploratory testing"
        },
        {
            id: "st-severity-priority", topic: "defects", kind: "choice", difficulty: "intermediate",
            prompt: "Which statement correctly separates the severity of a defect from its priority?",
            options: [
                "Severity is how urgently it should be fixed, and priority is how badly it harms the system or the user.",
                "Severity is how badly the defect harms the system or user, and priority is the order in which the business wants it fixed.",
                "Severity is always set by the developer alone, and priority is always exactly the same as severity.",
                "Severity applies only to security defects, and priority applies only to cosmetic or spelling defects."
            ],
            correct: 1,
            explanation: "They are separate. A crash in a rarely used export is severe but may be low priority; a misspelt company name on the home page is minor in severity but may be fixed first. Some teams use a single scale, so follow the local definition.",
            source: "ISTQB Glossary: severity, priority"
        },
        {
            id: "st-defect-report-parts", topic: "defects", kind: "recall", difficulty: "beginner",
            prompt: "What should a defect report contain so that someone else can act on it?",
            answer: "A clear title, the steps to reproduce, the expected result, the actual result, the environment (version, browser or device, data used), and evidence such as a screenshot or log.",
            explanation: "A reader should be able to reproduce the problem without asking questions. Giving expected and actual results side by side separates a defect from a misunderstanding.",
            source: "ISO/IEC/IEEE 29119-3 (incident report)"
        },
        {
            id: "st-not-reproducible", topic: "defects", kind: "choice", difficulty: "intermediate",
            prompt: "A defect happened once and cannot be reproduced. What is the most useful next step?",
            options: [
                "Close it at once, because a defect that cannot be reproduced on request is not a real defect.",
                "Record what is known (time, environment, data, logs) and keep the report open for a while, collecting any further occurrence.",
                "Raise its severity to the highest level, so that someone is forced to look at it straight away.",
                "Delete the report completely, so that it does not distort the defect metrics of the team."
            ],
            correct: 1,
            explanation: "Intermittent defects are often caused by timing, data or environment differences. Logs and the exact conditions let a later occurrence be matched with the first. Closing it loses evidence; inflating severity or deleting it distorts the record.",
            source: "ISTQB Foundation syllabus: defect management"
        },
        {
            id: "st-defect-cluster", topic: "defects", kind: "choice", difficulty: "advanced",
            prompt: "Most defects found so far are in one module. What does the principle of defect clustering suggest?",
            options: [
                "Stop testing that module altogether, since it has already had more than its share of attention.",
                "Look more closely at that module, because a small number of modules tend to hold most of the defects.",
                "Assume that all of the other modules contain no defects at all, and skip them.",
                "Move the developers of that module to another team, as a way of punishing the poor quality."
            ],
            correct: 1,
            explanation: "Defects are often concentrated in complex, changed or poorly understood areas, so extra testing there is a sensible use of effort. It is a heuristic about where to look, not proof that other areas are clean.",
            source: "ISTQB Foundation syllabus: testing principles"
        },
        {
            id: "st-pesticide-paradox", topic: "practice", kind: "recall", difficulty: "advanced",
            prompt: "What is the pesticide paradox in testing, and how do you respond to it?",
            answer: "Running the same tests again and again stops finding new defects, as insects become resistant to one pesticide. Review and change the tests, and add new ones, as the software changes.",
            explanation: "A regression suite is valuable because it keeps known behaviour safe, but it will not find new kinds of defect by itself. Exploratory sessions and new design techniques bring fresh coverage.",
            source: "ISTQB Foundation syllabus: testing principles"
        },
        {
            id: "st-automation-fit", topic: "practice", kind: "choice", difficulty: "intermediate",
            prompt: "Which test is the best candidate for automation?",
            options: [
                "A one-off check of a page layout that is about to be redesigned next week.",
                "A stable, repeated check of a core calculation run on every build.",
                "An exploration of a brand-new feature that nobody on the team has seen yet.",
                "A judgement of whether the new colours and fonts look pleasant to users."
            ],
            correct: 1,
            explanation: "Automation pays back through repetition on stable behaviour. Tests that change often cost more to maintain than they save, and judgements of taste or discovery need a person. Automated tests also need their own review, since a wrong expected value is repeated on every run.",
            source: "ISTQB Foundation syllabus: test automation"
        },
        {
            id: "st-flaky-test", topic: "practice", kind: "choice", difficulty: "advanced",
            prompt: "An automated test passes on most runs and fails on some, with no change to the code. What is the best response?",
            options: [
                "Re-run it until it passes, and then ignore the failures that happened on earlier runs.",
                "Delete it at once, because flaky tests are never useful to any team in any situation.",
                "Investigate the cause (timing, shared data, environment) and quarantine it visibly.",
                "Add a much longer fixed waiting time to every single test in the whole suite."
            ],
            correct: 2,
            explanation: "A test that fails randomly teaches the team to ignore failures, which hides real ones. Find the cause, such as waiting for a time instead of a condition, tests that share state, or dependence on an external service. Quarantine keeps the suite trustworthy while the work is done.",
            source: "ISTQB Foundation syllabus: test automation"
        },
        {
            id: "st-test-data", topic: "practice", kind: "recall", difficulty: "intermediate",
            prompt: "Why should test data not be copied from a production database without care?",
            answer: "It can contain personal or confidential information, so using it may break privacy rules. Mask or generate data instead, and keep it small and deliberate.",
            explanation: "Real data is also messy and hard to control: you cannot predict which cases it contains. Generated data lets you build the exact boundary and error cases a test needs, and it can be recreated for every run.",
            source: "ISTQB Foundation syllabus: test data"
        },
        {
            id: "st-independence", topic: "practice", kind: "choice", difficulty: "intermediate",
            prompt: "Why is it useful that someone other than the author of a piece of code also tests it?",
            options: [
                "Authors are not allowed to run their own programs until a reviewer has signed them off.",
                "A different person is less likely to share the author's blind spots.",
                "It guarantees that no defects remain once the second person has finished.",
                "It removes the need for any written requirements or other documents."
            ],
            correct: 1,
            explanation: "Authors tend to test what they intended, and so confirm their own assumptions. A fresh reader asks different questions. Developers should still write their own unit tests; independence adds a second view, it does not replace the first.",
            source: "ISTQB Foundation syllabus: independence of testing"
        }
    ]
};
