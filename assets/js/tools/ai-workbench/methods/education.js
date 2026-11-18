/* =========================================================
   ToolZen Hub
   AI Workbench methods: teaching and learning (D19)

   See method.js for the contract. Built on widely used practice:
   learning objectives first, assessment aligned to them, active
   learning; facts are for the teacher to check.
========================================================= */

export const FAMILY = {
    review: "Check every fact, example and answer before using it with learners; mark anything you are unsure of.",
    sections: [
        {
            id: "alignment", at: "detailed", title: "Alignment",
            lines: ["Write measurable learning objectives (what learners will be able to do), and make every activity and assessment serve one of them."]
        },
        {
            id: "inclusion", at: "comprehensive", kind: "edges", title: "Different learners",
            lines: ["Support for learners who struggle, extension for those who finish early, accessible materials, and the misconceptions learners commonly have on this topic."]
        }
    ]
};

export const METHODS = {
    "lesson-plan": {
        role: "Act as an experienced teacher who plans engaging, well-paced lessons.",
        approach: ["Objectives first, then the activities and checks that reach them.", "Mix explanation, practice and feedback.", "Time every part to the lesson length."],
        sections: [
            { at: "detailed", kind: "deliverables", title: "The plan must contain", lines: ["Objectives, prior knowledge, materials, a timed sequence (starter, teaching, guided practice, independent practice, plenary), checks for understanding, differentiation, and homework if any."] },
            { at: "comprehensive", kind: "examples", title: "Examples to include", lines: ["A worked example for the teaching part, a practice question at each level of difficulty with its answer, and the misconception each question is designed to reveal."] }
        ]
    },
    assessment: {
        role: "Act as an experienced assessment designer.",
        approach: ["Map each question to an objective and a level of thinking.", "Write clear questions with one defensible answer, or a mark scheme for open ones.", "Balance difficulty and coverage."],
        sections: [
            { at: "detailed", title: "Assessment design", lines: [
                "Write the learning objectives being assessed, and plan the questions against them in a table (objective, level of thinking from recall to application and analysis, number of questions, marks), so coverage is visible before writing.",
                "Decide what counts as evidence of each objective, and keep questions about one objective each so a wrong answer shows which one is not yet met."
            ] },
            { when: (a) => /multiple choice|mixed/i.test(a.type), at: "detailed", title: "Multiple-choice questions", lines: ["One correct answer and wrong options built from real misconceptions, of similar length and form; no \"all of the above\" or double negatives; the reason each wrong option is wrong, for feedback."] },
            { when: (a) => /short answer|long answer|essay|mixed/i.test(a.type), at: "detailed", title: "Open questions", lines: ["A mark scheme for each: the points that earn marks, acceptable alternatives, and what a full, partial and weak answer looks like, so two markers would agree."] },
            { at: "detailed", title: "Fairness and feedback", lines: ["Language suited to the learners and free of cultural or background knowledge the test does not intend to measure; access arrangements (time, format) stated.", "Feedback for each question or objective that tells the learner what to do next, and a short note on what the results can and cannot show about learning."] },
            { at: "comprehensive", kind: "deliverables", title: "Deliverables", lines: ["The blueprint table, the questions, the answer key or mark scheme, feedback per objective, and a results summary template by objective."] },
            { at: "comprehensive", kind: "edges", title: "Question quality", lines: ["No clues in the wording, plausible wrong options in multiple choice, no trick questions, and language suited to the learners."] }
        ]
    },
    rubric: {
        role: "Act as an experienced educator who writes clear, fair rubrics.",
        approach: ["Choose criteria that match the objectives.", "Describe each level in observable terms.", "Make the levels distinct so two markers agree."]
    },
    "explain-concept": {
        role: "Act as a patient, expert teacher.",
        approach: ["Start from what the learner already knows.", "Explain in steps, with an example and a non-example.", "End with a question that checks understanding."]
    }
};

/* Sections added after the D21 coverage audit (24-STRATEGY-ENGINE.md section 5): tasks that had only a role and an
   approach now carry their own professional method. */
METHODS["rubric"].sections = [...(METHODS["rubric"].sections ?? []),
    { at: "detailed", title: "Rubric structure", lines: [
        "Criteria as rows and performance levels as columns, with a descriptor in every cell that names what can be observed.",
        "The same scale for every criterion, a weight where criteria matter differently, and an anchor example for each level where possible."
    ] }
];
METHODS["explain-concept"].sections = [...(METHODS["explain-concept"].sections ?? []),
    { at: "detailed", title: "Explanation method", lines: [
        "A one-sentence definition, why it matters, an intuition (an analogy marked as an analogy), a worked example, a common misconception, and a question with its answer to check understanding."
    ] }
];
