/* =========================================================
   ToolZen Hub
   JSON Error-Fixing Lab (Developer Tools)

   Broken JSON to repair, checked by the same strict JSON engine as
   the JSON Formatter and Validator. A repair is correct when the text
   is valid JSON and its parsed value is the value the exercise asks
   for; spacing and key order do not matter. The page runs nothing the
   visitor types except as data.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { evaluate, MAX_RESPONSE_CHARS } from "./evaluator.js";
import { set } from "./exercises.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "JSON Error-Fixing Lab";

export function markup() {

    return labMarkup({
        id: "json-error-fixing-lab",
        title: TITLE,
        intro: "Repair broken JSON the way you would in real work. Each exercise gives you text that does not parse and tells you what it should say. Check your repair, read what the validator reports, and learn why strict JSON refuses the original.",
        worked: {
            heading: "A Worked Example",
            intro: "Broken text: a trailing comma. This example cannot be submitted; it shows the reasoning you will use.",
            example: '{"name": "Asha", "age": 31,}',
            steps: [
                "Run the validator on the text. It reports the position of the first problem, here the closing brace after the last comma.",
                "Read the message: a closing brace was found where a new member was expected, because a comma promised one more.",
                "Decide the repair that keeps the meaning: the comma has nothing to separate, so remove it.",
                "Check again. The text parses, and it describes the same two members as before."
            ]
        },
        howTo: [
            "Read the instructions. They say which repair is wanted when more than one would parse.",
            "Edit the text in the box. Your edits are never changed for you.",
            "Press Check answer. The checker uses the same strict engine as the JSON Formatter and Validator, and compares the value the text has, not its spacing or key order.",
            "If the text is still not valid, the line and column of the first problem are shown. If it is valid but different, the paths that differ are listed, without the expected values.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        sections: [
            {
                heading: "What Counts as Correct",
                paragraphs: [
                    "An answer is correct when it is valid, strict JSON and its parsed value equals the value the exercise asks for. Spacing, indentation and the order of keys in an object do not matter. The order of items in an array does. Values are never converted: the number 1 is not the text \"1\", and true is not the text \"true\".",
                    "A text that repeats a key is not accepted, because what a repeated key means depends on the parser. Answers can be up to 20,000 characters. Nothing you type is run: it is only read as data."
                ]
            },
            {
                heading: "About This Lab",
                paragraphs: [
                    "The exercises are written for this site and cite the part of RFC 8259 behind each repair. They are practice, not a course and not a qualification. Nothing is saved when you leave the page, and nothing you type is sent anywhere."
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

export function init() {

    initLab({
        set,
        lab: {
            id: "json-error-fixing-lab",
            limit: MAX_RESPONSE_CHARS,
            inputLabel: "Your repaired JSON",
            rows: 9,
            evaluate
        }
    });

}
