/* =========================================================
   ToolZen Hub
   Test Design Lab (Developer Tools)

   Practice in two test design techniques for whole numbers:
   boundary values and equivalence partitions. The required answer is
   worked out from a rule in the exercise, and the answer is checked
   by a pure function. The techniques are described as commonly
   taught. This is practice, not a syllabus, a course or an exam.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { evaluate, MAX_RESPONSE_CHARS } from "./evaluator.js";
import { partitionInput } from "./partition-input.js";
import { set } from "./exercises.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "Test Design Lab";

export function markup() {

    return labMarkup({
        id: "test-design-lab",
        title: TITLE,
        intro: "Practise two test design techniques on whole numbers: boundary values and equivalence partitions. Each exercise gives an exact specification and says whether each limit is included. Choose your test values, check them, and read why the boundaries sit where they do.",
        worked: {
            heading: "A Worked Example",
            intro: "Specification: a field accepts whole numbers from 10 to 20, and both 10 and 20 are accepted. Use two values at each boundary. This example cannot be submitted; it shows the reasoning you will use.",
            example: "9, 10, 20, 21",
            steps: [
                "Find the valid range from the specification: here 10 to 20, because both limits are included.",
                "There are two boundaries, the lower edge at 10 and the upper edge at 20.",
                "Two-value analysis takes, at each boundary, the edge of the valid range and the nearest value outside it. At the lower edge those are 10 and 9. At the upper edge they are 20 and 21.",
                "For partitions the idea is similar: the whole numbers split into groups that should be treated alike (below 10, 10 to 20, above 20), and one value from each group stands for the group."
            ]
        },
        howTo: [
            "Read the specification. It says which whole numbers are valid, whether each limit is included, and, for boundary exercises, whether to use two values or three at each boundary.",
            "For a boundary exercise, type your test values separated by commas, spaces or line breaks. For a partition exercise, choose a partition for each value shown.",
            "Press Check answer. The answer is checked against the rule in the exercise, not against a fixed list of text.",
            "For boundary values you are told how many required values are present and which roles are missing, such as the value just below the valid range. Extra values are listed and are neither wrong nor needed. For partitions you get one line per value.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        sections: [
            {
                heading: "What Counts as Correct",
                paragraphs: [
                    "In a boundary exercise an answer is correct when every required value is present. You may add other values; they are listed as extra and do not make the answer wrong. A value is required if it has a role at a boundary, such as the lowest valid value or the value just below the valid range. The required values are worked out from the exercise's rule, so any correct way to list them is accepted.",
                    "Two forms of boundary value analysis are used, and each exercise says which. Two-value analysis uses, at each boundary, the edge of the valid range and the nearest value outside it. Three-value analysis adds the value just inside the range. Textbooks and courses differ on this point, so check which form yours uses."
                ]
            },
            {
                heading: "What This Lab Does Not Cover",
                paragraphs: [
                    "Only whole numbers are covered, up to 1,000,000,000 in size and at most 30 values in an answer. Text, dates, decimal numbers and combinations of several fields are not assessed. A range that is empty or a field with no limits has no boundary to test.",
                    "The exercises are written for this site and describe the techniques as they are commonly taught. They are practice, not a course, not a certification and not preparation for any particular exam or syllabus. Nothing is saved when you leave the page, and nothing you type is sent anywhere."
                ]
            }
        ]
    });

}

export function render(mount = document.querySelector("#app")) {

    if (!mount) return;
    mount.innerHTML = markup();
    init();

}

const parsedChoices = (value) => {
    try {
        const v = JSON.parse(value);
        return Array.isArray(v) ? v : null;
    } catch {
        return null;
    }
};

export function init() {

    initLab({
        set,
        lab: {
            id: "test-design-lab",
            limit: MAX_RESPONSE_CHARS,
            inputLabel: "Your test values (whole numbers, separated by commas, spaces or line breaks)",
            rows: 3,
            input: partitionInput,
            startingOf: (ex) => (ex.mode === "ep" ? JSON.stringify(ex.samples.map(() => "")) : ""),
            isEmpty: (value, ex) => {
                if (ex.mode !== "ep") return value.trim() === "";
                const choices = parsedChoices(value);
                return !choices || choices.length !== ex.samples.length || choices.some((c) => c === "");
            },
            emptyMessage: (ex) => (ex.mode === "ep" ? "Choose a partition for every value before checking." : "There is nothing to check yet. Type your test values first."),
            toolNote: "The Software Testing flashcards revise these ideas. Nothing is carried over for you.",
            evaluate
        }
    });

}
