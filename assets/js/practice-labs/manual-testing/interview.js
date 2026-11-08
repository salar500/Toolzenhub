/* =========================================================
   ToolZen Hub
   Manual Software Testing path: interview practice (scenario-based concept questions, original to this site)
========================================================= */

export const interview = {
    howTo: "Choose an answer before opening the explanation. Most questions are scenarios from real testing work: say how you would act and why, as you would in an interview.",
    description: "15 manual testing interview questions with explained answers: scenarios on severity and priority, regression, risk, bug reports and Agile.",
    coding: [],
    quiz: [
        { q: "You find a defect an hour before release. What do you do first?", options: ["Fix it yourself", "Report it at once with severity, impact and steps so the team can decide", "Say nothing to avoid delaying the release"], answer: 1, explain: "The release decision belongs to the team and product owner; your job is fast, clear information on impact and risk." },
        { q: "A developer says your defect 'works on my machine'. What is your best response?", options: ["Close the defect", "Compare environments and data, and add exact build, browser and steps, with evidence", "Escalate to the manager immediately"], answer: 1, explain: "Most 'cannot reproduce' cases come from a different environment, data or state. Narrow it down together." },
        { q: "Difference between severity and priority?", options: ["They are the same", "Severity is impact on the system; priority is how soon it must be fixed", "Priority is set by testers, severity by developers"], answer: 1, explain: "A cosmetic home-page typo can be low severity but high priority." },
        { q: "How would you test a login page with no written requirements?", options: ["Refuse until requirements exist", "Ask questions, use common expectations and similar products as oracles, and explore, documenting assumptions", "Test only valid logins"], answer: 1, explain: "Testers often work with incomplete information; make assumptions explicit and confirm them." },
        { q: "What is the main purpose of regression testing?", options: ["To test new features only", "To check that changes have not broken existing behaviour", "To measure performance"], answer: 1, explain: "Regression testing protects what already worked." },
        { q: "Which test design technique fits a field accepting ages 18 to 60?", options: ["Boundary value analysis with 17, 18, 60 and 61", "Only 30", "Random values"], answer: 0, explain: "Boundaries are where off-by-one defects hide; equivalence partitions add one value from each range." },
        { q: "What makes an expected result good?", options: ["It says the feature works", "It states observable outcomes: messages, values, states", "It is short"], answer: 1, explain: "Anyone running the test must reach the same verdict without guessing." },
        { q: "Smoke versus sanity testing?", options: ["Smoke: broad and shallow on a new build; sanity: narrow and deep around a change", "They are identical", "Sanity is always automated"], answer: 0, explain: "Smoke decides if a build is testable; sanity checks a specific fix or change." },
        { q: "You have two days to test a release that normally needs a week. What do you do?", options: ["Test everything quickly and superficially", "Prioritise by risk, agree the reduced scope and report remaining risk", "Ask for the release to be cancelled"], answer: 1, explain: "Risk-based prioritisation plus transparent reporting is the professional answer." },
        { q: "What is a test charter?", options: ["A contract with the client", "The mission and scope of an exploratory testing session", "A list of test cases"], answer: 1, explain: "A charter focuses a time-boxed exploratory session." },
        { q: "A test passes but users complain the feature is hard to use. What kind of issue is this?", options: ["A functional defect", "A usability issue, a non-functional quality", "Not an issue"], answer: 1, explain: "Software can meet its functional requirements and still fail its users." },
        { q: "What is defect leakage?", options: ["Defects found after release as a share of all defects found", "Defects reported twice", "Defects in the test environment only"], answer: 0, explain: "High leakage means testing is missing defects that customers then find." },
        { q: "When should a tester close a defect?", options: ["When the developer marks it fixed", "After retesting the fix on the right build and confirming it works", "At the end of the sprint"], answer: 1, explain: "Closing requires your own verification." },
        { q: "What is the definition of done in Scrum, from a tester's view?", options: ["Code is written", "The story meets agreed criteria, including tests passing and defects resolved", "The demo went well"], answer: 1, explain: "Testing is part of done, not a later phase." },
        { q: "Which is a non-functional requirement?", options: ["SAVE10 gives 10% off", "The checkout page loads within 2 seconds on 4G", "Remove deletes the chosen line"], answer: 1, explain: "Speed is a quality of how the system works, not a feature rule." }
    ]
};
