/* =========================================================
   ToolZen Hub
   Manual Software Testing path: lessons (build-time content, original to this site)

   Each lesson: the teaching fields every path lesson has (objectives, intro, why, analogy, mistakes, check, summary) and
   `blocks`, rendered in order by practice-labs/blocks-html.js. Practice blocks: quiz (checked in the browser), order
   (put steps in sequence), write (a structured writing lab, writing.js), shoplite (a task on the practice shop).
   Terms follow common industry usage (ISTQB vocabulary); no syllabus text is reproduced.
========================================================= */

export const lessons = [

    /* ---------------- Module 1: What Testing Is ---------------- */

    {
        id: "mt-what-is-testing", title: "What software testing is", level: "beginner", prerequisite: "None. A complete beginner can start here.",
        objectives: ["Explain what testing is for", "Tell an error, a defect and a failure apart", "Say what testing can and cannot prove"],
        intro: "Software testing is checking how software actually behaves and comparing it with how it should behave, so that problems are found before the people who rely on it find them. Testing produces information: what works, what does not, and how risky it would be to release.",
        blocks: [
            { type: "text", heading: "Error, defect, failure", paragraphs: [
                "A person makes an error: a mistake, such as misreading a requirement. The error can leave a defect (also called a bug or a fault) in the code or in a document. When the defective code runs, it can cause a failure: the software does something it should not, or does not do something it should.",
                "Not every defect causes a failure. Code with a defect may never run in the way that triggers it, which is why a defect can hide for months."
            ] },
            { type: "example", title: "One mistake, three names", text: "Error:   a developer reads \"free delivery from ₹999\" as \"above ₹999\".\nDefect:  the code says  total > 999  instead of  total >= 999.\nFailure: a customer whose order is exactly ₹999 is charged ₹49 delivery." },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A tester sees the cart total shown as ₹-50 after entering a quantity of -1. What is this?", options: ["An error", "A defect", "A failure"], answer: 2, explain: "It is a failure: wrong behaviour seen while the software runs. Its cause is a defect in the quantity check, which came from someone's error." },
                { q: "A product owner wrote 'minimum ₹50' in the requirement when they meant ₹500. What is that?", options: ["An error", "A failure", "Not a problem until a customer complains"], answer: 0, explain: "It is an error, a human mistake. It will become a defect in any code or test written from that requirement, and a failure when that code runs." }
            ] },
            { type: "text", heading: "What testing can and cannot do", paragraphs: [
                "Testing can show that defects are present, but it cannot prove that there are none: there are too many possible inputs, devices and situations to try them all. What testing does is reduce risk, by trying the situations most likely to fail and the ones that would cost most if they did.",
                "Testing is also more than running the software. Reviewing a requirement, a design or code without running anything is testing too (static testing), and so are planning, designing test cases, preparing data and reporting results."
            ] }
        ],
        why: "Every change to software carries a risk that something stops working or that a feature does not do what users need. Testing turns that risk into facts the team can act on. A defect found while reading a requirement costs minutes; the same defect found by customers can cost money, data and trust.",
        analogy: "Testing is like a pre-flight check. The crew cannot prove the aircraft will never have a problem, but they check the things most likely to go wrong and most dangerous if they did, and they report anything unusual before take-off.",
        mistakes: [
            "Thinking testing only means clicking through the software. Reviewing a requirement is testing too, and often the cheapest.",
            "Reporting \"it works\" after a few tries. Say what was tested, with which data, and what was not tested.",
            "Using bug, defect, error and failure loosely. In a report, describe the failure you saw; name the cause only if you know it."
        ],
        check: [
            { q: "A defect sits in code that never runs. Has a failure happened?", a: "No. A failure is the wrong behaviour you can see when defective code runs; this defect has not caused one yet." },
            { q: "Can testing prove that software has no bugs?", a: "No. It can show bugs are present and reduce risk, but it cannot try every input and situation." }
        ],
        summary: "Testing compares actual behaviour with expected behaviour to find problems early. A human error can leave a defect, which can cause a failure when it runs. Testing reduces risk but can never prove the absence of defects."
    },

    {
        id: "mt-principles", title: "Seven principles of testing", level: "beginner",
        objectives: ["Name the seven widely used testing principles", "Apply each principle to a real situation", "Explain why exhaustive testing is impossible"],
        intro: "Over decades, testers have noticed patterns that hold on almost every project. Seven of them are taught as principles. They are not rules to memorise for an exam; they explain why testers make the choices they do.",
        blocks: [
            { type: "list", heading: "The seven principles", ordered: true, items: [
                "Testing shows the presence of defects, not their absence.",
                "Exhaustive testing is impossible: even a single field accepting 1 to 10 has endless invalid inputs, and a whole application has more combinations than there is time to try.",
                "Early testing saves time and money: a defect found in a requirement is far cheaper than the same defect found in production.",
                "Defects cluster together: a small number of features usually holds most of the defects, often the newest or most complex ones.",
                "Tests wear out (the pesticide paradox): repeating the same tests finds fewer new defects over time, so tests must be reviewed and new ones added.",
                "Testing depends on context: a banking app, a game and a hospital system need different testing.",
                "Absence of errors is a fallacy: software with no known defects can still fail its users if it does the wrong thing."
            ] },
            { type: "quiz", heading: "Your turn: which principle?", questions: [
                { q: "Most bugs found this release are in the new checkout code, very few elsewhere.", options: ["Defects cluster together", "Testing depends on context", "Early testing"], answer: 0, explain: "Defects cluster: new and complex areas tend to hold most of them, so testers spend more time there." },
                { q: "The regression suite has passed unchanged for a year, yet customers keep reporting new bugs.", options: ["Absence of errors is a fallacy", "Tests wear out (pesticide paradox)", "Exhaustive testing is impossible"], answer: 1, explain: "Unchanged tests stop finding new defects. Review the suite and add tests for new risks." },
                { q: "Every test passes, but users say the new report shows the wrong figures for their needs.", options: ["Absence of errors is a fallacy", "Defects cluster together", "Testing shows presence of defects"], answer: 0, explain: "Passing tests do not make software useful if it was built to the wrong requirement." },
                { q: "A tester questions a requirement before any code is written and a misunderstanding is fixed in minutes.", options: ["Early testing saves time and money", "Testing depends on context", "Tests wear out"], answer: 0, explain: "The earlier a defect is found, the cheaper it is to fix." }
            ] }
        ],
        why: "The principles explain everyday decisions: why testers prioritise by risk, why they review requirements, why test suites need maintenance and why 'all tests pass' is not the same as 'ready'. They are also a common interview topic.",
        analogy: "A doctor's check-up follows similar principles: it cannot test for every disease (exhaustive testing is impossible), it focuses where problems are likely (clustering), it adapts to the patient (context), and an early check catches problems while they are cheap to treat.",
        mistakes: [
            "Quoting the principles without applying them. Be ready to give a real example of each.",
            "Treating 'exhaustive testing is impossible' as an excuse to test little. It is the reason to choose tests by risk.",
            "Never changing a regression suite. Old tests guard against old defects; new risks need new tests."
        ],
        check: [
            { q: "Why can a tester never try every possible input?", a: "The number of inputs and combinations is effectively unlimited, so testers choose representative values by risk and technique." },
            { q: "What does the pesticide paradox mean for a regression suite?", a: "Running the same tests repeatedly finds fewer new defects, so the suite must be reviewed and extended." }
        ],
        summary: "Testing shows defects but cannot prove their absence; exhaustive testing is impossible; test early; defects cluster; tests wear out; testing depends on context; and passing tests do not guarantee useful software."
    },

    {
        id: "mt-static-dynamic", title: "Static and dynamic testing", level: "beginner",
        objectives: ["Tell static testing from dynamic testing", "Name work products that can be reviewed", "Explain verification and validation"],
        intro: "Dynamic testing runs the software and watches what it does. Static testing examines something without running it: a requirement, a design, a test case or the code itself. Both find defects, but at different times and costs.",
        blocks: [
            { type: "text", heading: "Static testing", paragraphs: [
                "Static testing includes reading and discussing documents (reviews) and tools that analyse code without running it. It finds problems such as ambiguous requirements, missing rules, contradictions and code that will always fail, often before any code exists.",
                "Reviews range from an informal read by a colleague to a structured inspection with roles and checklists. Whatever the form, the goal is the same: find problems while they are cheap to fix."
            ] },
            { type: "text", heading: "Dynamic testing", paragraphs: [
                "Dynamic testing executes the software with chosen inputs and compares the actual result with the expected one. It finds failures that only appear when the software runs: wrong calculations, crashes, slow pages, broken flows between screens."
            ] },
            { type: "text", heading: "Verification and validation", paragraphs: [
                "Verification asks: did we build the product right, according to its specification? Validation asks: did we build the right product, the one users actually need? A shop can follow every written rule (verified) and still confuse its customers (not validated)."
            ] },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "Reading ShopLite's requirement R1 and noticing it does not say what happens when a customer types two words.", options: ["Static testing", "Dynamic testing"], answer: 0, explain: "Nothing was run: a document was examined. This is a review, a kind of static testing." },
                { q: "Adding the ₹999 cushion to the cart and checking the delivery charge.", options: ["Static testing", "Dynamic testing"], answer: 1, explain: "The software was run with chosen input and its behaviour observed." },
                { q: "Checking that the checkout really helps customers finish a purchase without confusion.", options: ["Verification", "Validation"], answer: 1, explain: "This asks whether it is the right product for its users: validation." }
            ] }
        ],
        why: "The cheapest defect is the one never coded. Teams that review requirements and designs early spend less time fixing defects late. Interviewers often ask for the difference between static and dynamic testing and between verification and validation.",
        analogy: "Static testing is proofreading a recipe before cooking: you can spot a missing ingredient without lighting the stove. Dynamic testing is cooking it and tasting the result.",
        mistakes: [
            "Waiting for a build before testing anything. Requirements can be tested on day one.",
            "Treating reviews as a formality. A review without preparation finds little.",
            "Mixing up verification (to the specification) and validation (fit for users)."
        ],
        check: [
            { q: "Give one defect static testing can find that dynamic testing cannot find yet.", a: "An ambiguous or contradictory requirement, before any code exists." },
            { q: "Can software pass verification and fail validation?", a: "Yes: it can meet its specification exactly and still not meet users' real needs." }
        ],
        summary: "Static testing examines work products without running them; dynamic testing runs the software. Verification checks against the specification; validation checks fitness for users. Both kinds of testing are needed."
    },

    /* ---------------- Module 2: Testing in the Life Cycle ---------------- */

    {
        id: "mt-sdlc", title: "Software development life cycles", level: "beginner",
        objectives: ["Describe the waterfall, V-model, iterative and Agile life cycles", "Place testing activities in each", "Explain why testing starts early in every model"],
        intro: "A software development life cycle (SDLC) is the order in which a team moves from an idea to working software. The model a team follows changes when and how testing happens, but in every model testing works best when it starts early.",
        blocks: [
            { type: "list", heading: "Common models", items: [
                "Waterfall: requirements, design, build, test and release happen one after another. Testing comes late, so defects found then are expensive.",
                "V-model: each development stage has a matching test level planned at the same time (requirements with acceptance testing, design with system and integration testing, code with unit testing).",
                "Iterative and incremental: the product is built in repeated cycles, each adding features that are designed, built and tested within the cycle.",
                "Agile (for example Scrum): short iterations of one to four weeks; testers work alongside developers every day and testing is part of finishing each item."
            ] },
            { type: "order", heading: "Your turn: the left side of the V", prompt: "Put the V-model's development stages in the order they happen, from the first to the last before testing begins.", items: ["Requirements analysis", "System design", "Detailed design", "Coding"], explain: "Each of these stages has a matching test level on the right side of the V: acceptance testing for requirements, system testing for system design, integration testing for detailed design and unit testing for coding." }
        ],
        why: "Testers join teams that use different life cycles. Knowing the model tells you when your work starts, which documents exist and how releases are decided. Most teams today work iteratively, which means testing every few weeks instead of once at the end.",
        analogy: "Waterfall is building a whole house and then inspecting it. Agile is inspecting each room as it is finished, while the next room is being built.",
        mistakes: [
            "Assuming testing starts when coding ends. In every model, requirements can be tested first.",
            "Thinking Agile means no documentation or no test planning. It means light, continuous planning.",
            "Confusing the V-model with a separate testing phase: its point is that test planning happens alongside each development stage."
        ],
        check: [
            { q: "In the V-model, which test level matches requirements analysis?", a: "Acceptance testing." },
            { q: "Why is a defect found in a waterfall test phase often expensive?", a: "It may have been introduced at the requirements stage, so design and code built on it must change too." }
        ],
        summary: "Life cycles range from sequential (waterfall, V-model) to iterative and Agile. They change when testing happens, but in every model, early testing (starting with requirements) makes defects cheaper."
    },

    {
        id: "mt-stlc", title: "The software testing life cycle", level: "beginner",
        objectives: ["List the phases of the software testing life cycle", "Explain entry and exit criteria", "Know what each phase produces"],
        intro: "The software testing life cycle (STLC) is the sequence of testing activities on a project: understanding what to test, planning, designing tests, preparing the environment, running the tests and closing the work. Each phase has inputs it needs and outputs it produces.",
        blocks: [
            { type: "list", heading: "The phases and what they produce", ordered: true, items: [
                "Requirement analysis: read requirements, ask questions, list what can be tested. Output: testable requirements and open questions.",
                "Test planning: decide scope, approach, people, environments, schedule and risks. Output: the test plan.",
                "Test design: write test scenarios, test cases and test data. Output: reviewed test cases and a traceability matrix.",
                "Test environment setup: prepare the system, data and tools. Output: a working, checked environment.",
                "Test execution: run the tests, record results, report defects, retest fixes. Output: results and defect reports.",
                "Test closure: summarise results, lessons learned and remaining risks. Output: a test summary report."
            ] },
            { type: "text", heading: "Entry and exit criteria", paragraphs: [
                "Entry criteria say what must be true before a phase can start, for example 'the build is installed and the smoke test passes' before execution begins. Exit criteria say when a phase is done, for example 'all critical test cases run, no open critical defects'. They stop teams from starting too early or finishing on a feeling."
            ] },
            { type: "order", heading: "Your turn", prompt: "Put the STLC phases in order.", items: ["Requirement analysis", "Test planning", "Test design", "Test environment setup", "Test execution", "Test closure"], explain: "Each phase uses what the previous one produced: questions answered before planning, a plan before designing, designed tests and a ready environment before running." },
            { type: "quiz", questions: [
                { q: "\"No open critical defects and 95% of planned tests run\" is an example of:", options: ["An entry criterion for test execution", "An exit criterion", "A test case"], answer: 1, explain: "It decides when testing (or a phase) can end, so it is an exit criterion." }
            ] }
        ],
        why: "The STLC gives testing a structure that managers, developers and testers share. In interviews, freshers are often asked to describe it; at work, entry and exit criteria prevent arguments about whether testing is finished.",
        analogy: "It is like preparing a meal for guests: find out what they can eat, plan the menu, write the recipes, set up the kitchen, cook and serve, then note what to do differently next time.",
        mistakes: [
            "Starting execution in a broken environment. A smoke test as an entry criterion prevents wasted days.",
            "Skipping closure. The summary report and lessons learned are what make the next release smoother.",
            "Writing exit criteria nobody can measure, such as 'quality is good'."
        ],
        check: [
            { q: "What is the main output of test planning?", a: "The test plan: scope, approach, resources, environments, schedule, risks and criteria." },
            { q: "Why have entry criteria for test execution?", a: "So testing starts only when the build and environment are ready, instead of failing for reasons unrelated to the product." }
        ],
        summary: "The STLC runs from requirement analysis through planning, design, environment setup and execution to closure. Entry and exit criteria make the start and end of each phase objective."
    },

    {
        id: "mt-test-levels", title: "Test levels", level: "beginner",
        objectives: ["Describe unit, integration, system and acceptance testing", "Say who usually performs each level", "Choose the right level for a problem"],
        intro: "Software is tested at different levels, from the smallest piece of code to the whole system in the hands of its users. Each level looks for different kinds of defects.",
        blocks: [
            { type: "list", heading: "The four levels", items: [
                "Unit (component) testing: one function or class on its own, usually automated by developers. Finds logic mistakes, such as the wrong comparison in a delivery-fee function.",
                "Integration testing: how parts work together, such as the cart and the coupon service, or the shop and a payment provider. Finds wrong data passed between parts.",
                "System testing: the whole application, end to end, against its requirements. Mostly done by testers. Finds missing or wrong behaviour of complete features.",
                "Acceptance testing: whether the system is acceptable to its users or customer, often user acceptance testing (UAT) by business users. Finds gaps between what was built and what is needed."
            ] },
            { type: "quiz", heading: "Your turn: which level would most likely catch it?", questions: [
                { q: "The deliveryFee function returns ₹49 for an input of exactly 999.", options: ["Unit testing", "Acceptance testing"], answer: 0, explain: "A unit test of that one function with the boundary value 999 catches it fastest and cheapest." },
                { q: "The cart sends the price in paise but the coupon service expects rupees.", options: ["Unit testing", "Integration testing", "Acceptance testing"], answer: 1, explain: "Each part may be correct on its own; the defect is in how they work together." },
                { q: "Shop staff say the order history does not show what they need to answer customer calls.", options: ["System testing", "Acceptance testing"], answer: 1, explain: "This is about fitness for the users' real work, found in acceptance testing." }
            ] }
        ],
        why: "Knowing the levels helps you decide where a test belongs and who should write it. A defect caught by a unit test costs the least; relying on system tests for everything makes suites slow and fragile.",
        analogy: "Building a car: each part is checked on its own (unit), then assembled parts are checked together (integration), then the whole car is road-tested (system), and finally the customer test-drives it (acceptance).",
        mistakes: [
            "Testing everything through the user interface. Many checks are cheaper and more reliable at lower levels.",
            "Assuming integration is covered because each part passed its unit tests.",
            "Leaving acceptance testing until the last day before release."
        ],
        check: [
            { q: "Who usually writes unit tests?", a: "Developers, usually as automated tests alongside the code." },
            { q: "What does UAT stand for, and who does it?", a: "User acceptance testing, done by business users or customers to confirm the system meets their needs." }
        ],
        summary: "Unit testing checks pieces of code, integration testing checks how they work together, system testing checks the whole application against requirements and acceptance testing checks fitness for users."
    },

    /* ---------------- Module 3: Writing Test Cases ---------------- */

    {
        id: "mt-reading-requirements", title: "Reading a requirement like a tester", level: "beginner",
        objectives: ["Find ambiguity and missing rules in a requirement", "Turn a requirement into testable conditions", "Ask questions before designing tests"],
        intro: "Testing starts with the requirement. A tester reads it looking for what is unclear, what is missing and what can be checked, and turns it into questions and test conditions before any test case is written.",
        blocks: [
            { type: "text", heading: "What to look for", paragraphs: [
                "Ambiguous words: 'fast', 'user-friendly', 'large orders'. Missing limits: a minimum, a maximum, a date range. Missing rules for special cases: what if two rules apply at once, or none? Missing behaviour on failure: what does the user see when something is refused?",
                "A test condition is something specific that can be checked, such as 'SAVE10 is refused when the items total is ₹499'. Each requirement usually gives several."
            ] },
            { type: "example", title: "From requirement to test conditions (ShopLite R6)", text: "R6: Delivery costs ₹49. It is free when the items total after any discount is ₹999 or more.\n\nTest conditions:\n- Items total ₹998 → delivery ₹49\n- Items total ₹999 → delivery free\n- Items total ₹1,000 or more → delivery free\n- Items ₹1,100, SAVE10 discount ₹110 → total after discount ₹990 → delivery ₹49\n- Empty cart → no delivery charge shown" },
            { type: "write", heading: "Your turn", exercise: "mt-w-questions-coupon" }
        ],
        why: "Many defects begin as unclear requirements. A tester who asks the right questions early prevents defects that would otherwise be built, tested, found and fixed, which is the most expensive path.",
        analogy: "Reading a requirement like a tester is like reading a contract before signing it: you look for what is vague, what is missing and what could be read two ways.",
        mistakes: [
            "Accepting vague words such as 'fast' or 'large' without asking for a number.",
            "Only testing what the requirement says, never what it forgot.",
            "Keeping questions to yourself. Write them down and get answers in writing."
        ],
        check: [
            { q: "What is a test condition?", a: "A specific, checkable item derived from a requirement, such as one rule with one value." },
            { q: "Why is 'the page must load fast' not testable as written?", a: "'Fast' has no measurable limit; ask for a number, such as within 2 seconds on a given connection." }
        ],
        summary: "Read requirements for ambiguity, missing limits, special cases and failure behaviour. Turn them into specific test conditions and write down questions before designing tests."
    },

    {
        id: "mt-test-scenarios", title: "Test scenarios", level: "beginner",
        objectives: ["Explain what a test scenario is", "Derive scenarios for a feature", "Cover success, failure and surrounding behaviour"],
        intro: "A test scenario is a one-line description of something to test, such as 'Sign in with a wrong password'. Scenarios give a quick, reviewable map of coverage before detailed test cases are written.",
        blocks: [
            { type: "text", heading: "How to find scenarios", paragraphs: [
                "Start from the main success path, then ask how each input can be wrong, missing or unusual, then look around the feature: what happens before and after, on other devices, for other users. Each answer is a scenario.",
                "One scenario often becomes several test cases with different data, but a list of scenarios is short enough for a product owner or developer to review in minutes, which catches gaps early."
            ] },
            { type: "example", title: "Scenarios for ShopLite's cart quantity", text: "Change the quantity to a valid value\nChange the quantity to the largest allowed value (10)\nChange the quantity to 0\nChange the quantity to a value above 10\nType letters into the quantity\nUpdate the quantity of one line when the cart has several lines" },
            { type: "write", heading: "Your turn", exercise: "mt-w-scenarios-signin" }
        ],
        why: "Scenarios are fast to write and fast to review. Many teams agree scenarios first and write detailed test cases only for the important ones, which saves time and keeps coverage visible.",
        analogy: "Scenarios are the chapter titles of a test suite: they show what the book covers before anyone writes the pages.",
        mistakes: [
            "Writing only success scenarios.",
            "Writing scenarios that are really steps ('Click the button').",
            "Repeating the same scenario with trivial differences instead of covering new behaviour."
        ],
        check: [
            { q: "How is a test scenario different from a test case?", a: "A scenario is a one-line description of what to test; a test case adds preconditions, steps, data and an expected result." },
            { q: "Name three kinds of scenario to cover for any input field.", a: "A valid value, an invalid value (wrong or out of range) and a missing (empty) value." }
        ],
        summary: "Test scenarios are short descriptions of what to test. Cover the success path, each way input can be wrong or missing, and the behaviour around the feature, then expand the important ones into test cases."
    },

    {
        id: "mt-test-cases", title: "Writing a good test case", level: "beginner",
        objectives: ["Write a test case with ID, title, preconditions, steps, data and expected result", "Make steps single actions", "Write an expected result someone can observe"],
        intro: "A test case is a set of instructions precise enough that another person can run it and reach the same verdict. It names what is tested, what must be true first, the exact steps and data, and the result that counts as a pass.",
        blocks: [
            { type: "list", heading: "The parts of a test case", items: [
                "ID: a unique reference such as TC-COUPON-03, used by results and bug reports.",
                "Title: what is checked, in one line.",
                "Preconditions: what must be true before step 1, such as an empty cart or a signed-in customer.",
                "Steps: numbered, one action each, so a failure can be pinned to one step.",
                "Test data: the exact values used.",
                "Expected result: what you will see if the software is right, stated so anyone can observe it."
            ] },
            { type: "example", title: "Weak and strong expected results", text: "Weak:   The coupon works correctly.\nStrong: The message \"SAVE10 needs an items total of ₹500 or more.\" appears and the discount stays ₹0." },
            { type: "write", heading: "Your turn: a test case for ShopLite", exercise: "mt-w-testcase-save10" },
            { type: "shoplite", text: "Run your test case in ShopLite. In the stable release the coupon is refused. Then open release 1.1 and run it again: your test case should now fail, because that release has a seeded bug here.", release: "r-bugs-1" }
        ],
        why: "A test case is a contract between the person who wrote it and the person who runs it, often months later. Precise steps and observable results make results trustworthy and make failures quick to investigate.",
        analogy: "A good test case is like a good recipe: exact quantities, one step at a time, and a clear picture of what the dish should look like when it is done.",
        mistakes: [
            "Expected results like 'works fine' or 'as expected'. Say exactly what should appear.",
            "Steps that bundle several actions ('add the product and then apply the coupon'). Split them.",
            "Missing preconditions, so the test only passes on the author's machine."
        ],
        check: [
            { q: "Why should each step contain one action?", a: "So that when a test fails, you know exactly which action failed." },
            { q: "Rewrite 'The page works properly' as an observable expected result for a sign-in page.", a: "For example: 'The shop page opens and the header shows My account instead of Sign in.'" }
        ],
        summary: "A good test case has an ID, a precise title, preconditions, single-action steps, concrete data and an observable expected result, so anyone can run it and reach the same verdict."
    },

    {
        id: "mt-positive-negative", title: "Positive and negative testing", level: "beginner",
        objectives: ["Explain positive and negative testing", "Choose valid and invalid test data", "State expected results for invalid input"],
        intro: "Positive testing checks that the software does what it should with valid input. Negative testing checks that it refuses invalid input safely, with a clear message and without damaging data. Both are needed: many serious defects only appear with input nobody expected.",
        blocks: [
            { type: "text", heading: "Choosing the data", paragraphs: [
                "Valid data: typical values and the edges of what is allowed. Invalid data: values just outside the limits, the wrong kind of value (letters in a number field, a decimal where a whole number is needed), empty values and values far outside the range.",
                "A negative test still has an expected result: usually that the input is refused, a helpful message is shown and nothing else changes."
            ] },
            { type: "write", heading: "Your turn", exercise: "mt-w-positive-negative-qty" },
            { type: "shoplite", text: "Try your negative values in ShopLite release 1.1: one of them reveals a seeded bug. Note which one, and what happened instead of the expected result.", release: "r-bugs-1" }
        ],
        why: "Real users mistype, paste, leave fields empty and use the back button at odd moments; attackers send unexpected input on purpose. Negative tests protect data, security and the customer's experience.",
        analogy: "A positive test checks that the door opens with the right key. A negative test checks that it stays locked with the wrong key, a bent key or no key at all.",
        mistakes: [
            "Testing only typical valid values such as 3 or 5, and never the edges.",
            "Writing negative tests without an expected result.",
            "Checking only that an error appears, not that the data stayed unchanged."
        ],
        check: [
            { q: "Give two positive and two negative values for a field that accepts 1 to 10.", a: "Positive: 1 and 10 (the edges). Negative: 0 and 11 (just outside), or a decimal or text." },
            { q: "What should a negative test's expected result usually include?", a: "That the input is refused, a clear message is shown, and the existing data is unchanged." }
        ],
        summary: "Positive tests confirm valid input works; negative tests confirm invalid input is refused safely. Use the edges of the valid range, values just outside it and values of the wrong kind, and always state the expected result."
    }
];
