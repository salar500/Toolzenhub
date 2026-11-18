/* =========================================================
   ToolZen Hub
   AI Workbench blueprints: teaching and learning (AI programme
   D18)

   A lesson plan, a quiz or assessment, a marking rubric, and an
   explanation for a learner. Teaching material follows the
   teacher's curriculum and level; answer keys are checked by the
   teacher; an explanation for a learner asks them to try first.
========================================================= */

import { text, area, choose, more } from "./shared.js";

const CATS = [{ id: "learning" }, { id: "assistants" }];

export const BLUEPRINTS = {

    "lesson-plan": {
        deliverable: "a lesson plan",
        categories: CATS,
        depth: "standard",
        questions: [
            text("topic", "Subject and topic", { essential: true, placeholder: "Science: photosynthesis" }),
            text("learners", "Class, age or level", { essential: true, placeholder: "Class 7, CBSE, 35 students" }),
            text("time", "Lesson length", { placeholder: "40 minutes" }),
            area("objectives", "Learning objectives or curriculum outcome", { rows: 3, placeholder: "Explain inputs and outputs of photosynthesis; label a leaf diagram" }),
            text("setting", "Setting and resources", { placeholder: "Classroom, projector, no lab" }),
            more(area("needs", "Learners who need support or extension", { rows: 2 }))
        ],
        brief: (a) => ({
            goal: `Write a lesson plan on ${a.topic} for ${a.learners}.`,
            context: [["Length", a.time], ["Objectives", a.objectives], ["Setting and resources", a.setting], ["Differentiation needs", a.needs]],
            requirements: [
                "State measurable objectives (students will be able to...) tied to the curriculum outcome.",
                "Sequence: starter, teaching, guided practice, independent practice, check for understanding, plenary, with timings that add up to the lesson length.",
                "Include questions to ask, common misconceptions to watch for, and support and stretch for different learners.",
                "Use only the resources I have."
            ],
            format: ["A table by phase: time, teacher activity, student activity, resources, check; then homework if useful."],
            avoid: ["Facts the students will learn that you have not checked; flag any you are unsure of."]
        }),
        stages: [],
        refine: ["accuracy", "completeness"],
        quality: ["The timings add up and the activities fit your room and resources.", "You have checked every fact taught."],
        prepare: { required: ["The topic, class level and curriculum outcome."], optional: ["Your scheme of work."] },
        next: ["Make the check for understanding with \"A quiz or assessment\"."]
    },

    assessment: {
        deliverable: "a quiz or assessment with an answer key",
        categories: CATS,
        depth: "standard",
        questions: [
            text("topic", "Subject and topic", { essential: true }),
            text("learners", "Class, age or level", { essential: true }),
            choose("type", "Question types", ["Multiple choice", "Short answer", "Mixed", "Long answer or essay"], { essential: true }),
            text("count", "Number of questions and time", { placeholder: "15 questions, 20 minutes" }),
            area("covers", "What it must cover", { rows: 3, hint: "Objectives or chapter sections; questions stay within these." })
        ],
        brief: (a) => ({
            goal: `Write a ${a.type ? a.type.toLowerCase() : ""} assessment on ${a.topic} for ${a.learners}.`,
            context: [["Length", a.count], ["Must cover", a.covers]],
            requirements: [
                "Cover the objectives evenly; tag each question with the objective it tests and its difficulty (recall, application, analysis).",
                "For multiple choice, write plausible wrong options based on common misconceptions, with one clearly correct answer.",
                "Give an answer key with marks and, for open questions, what a full-mark answer contains.",
                "Use language suited to the level; no trick questions."
            ],
            format: ["The assessment as students will see it, then the answer key and marking notes separately."],
            avoid: ["Questions outside what was taught.", "Ambiguous questions with more than one defensible answer."]
        }),
        stages: [],
        refine: ["accuracy", "clarity"],
        quality: ["You have answered every question yourself and agree with the key.", "Each question tests an objective that was taught."],
        prepare: { required: ["The objectives or sections to cover."], optional: [] },
        next: ["Mark a few papers against the key before marking the rest, and adjust unclear items."]
    },

    rubric: {
        deliverable: "a marking rubric",
        categories: CATS,
        depth: "short",
        questions: [
            area("task", "The assignment students do", { essential: true, rows: 3, placeholder: "A 1,000-word argumentative essay on renewable energy" }),
            text("learners", "Class or level", { essential: true }),
            area("criteria", "What you will assess", { rows: 3, placeholder: "Argument, use of evidence, structure, language" }),
            text("scale", "Levels and marks", { placeholder: "4 levels, 20 marks" })
        ],
        brief: (a) => ({
            goal: "Write a marking rubric for this assignment.",
            context: [["Assignment", a.task], ["Level", a.learners], ["Criteria", a.criteria], ["Levels and marks", a.scale]],
            requirements: [
                "For each criterion and level, describe observable features of the work, not vague words like 'good' or 'excellent'.",
                "Levels must differ by quality, not quantity alone, and not overlap.",
                "Give marks per level and show the total.",
                "Add a student-friendly version in plain language."
            ],
            format: ["A table: criteria as rows, levels as columns; then the student version."],
            avoid: ["Criteria the assignment does not ask for."]
        }),
        stages: [],
        refine: ["clarity", "consistency"],
        quality: ["Two teachers marking the same work with this rubric would give the same level."],
        prepare: { required: ["The assignment brief."], optional: [] },
        next: ["Try the rubric on two or three real pieces of work and tighten unclear descriptors."]
    },

    "explain-concept": {
        deliverable: "an explanation with practice questions",
        categories: CATS,
        depth: "short",
        questions: [
            text("concept", "What you want to understand", { essential: true, placeholder: "Recursion in programming" }),
            text("level", "Your level and course", { essential: true, placeholder: "First-year B.Tech, know loops and functions" }),
            area("stuck", "What confuses you", { rows: 2, placeholder: "How the function knows when to stop" }),
            choose("style", "How you learn best", ["Examples first", "Step-by-step", "Analogy then detail", "Visual description"])
        ],
        brief: (a) => ({
            goal: `Help me understand: ${a.concept}`,
            context: [["My level", a.level], ["What confuses me", a.stuck], ["How I learn best", a.style]],
            requirements: [
                "Start from what I already know and build up in small steps; define every new term.",
                "Use one worked example, then a slightly harder one.",
                "Address what confuses me directly.",
                "Give three practice questions of rising difficulty and wait for my answers before giving the solutions."
            ],
            format: ["Short sections; the practice questions at the end."],
            avoid: ["Doing graded coursework for me; explain so I can do it myself.", "Facts you are not sure of: say so."]
        }),
        stages: [],
        refine: ["clarity", "accuracy"],
        quality: ["You can explain the idea in your own words and solve the practice questions.", "You have checked anything important against your textbook or teacher."],
        prepare: { required: ["What you already know about the topic."], optional: ["Your course notes."] },
        next: ["Plan more practice with \"A learning plan\"."]
    }

};
