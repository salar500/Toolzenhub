/* =========================================================
   ToolZen Hub
   JSONPath Challenge Lab (Developer Tools)

   Write a JSONPath query against a built-in document. The query is
   run by the same RFC 9535 engine as the JSONPath Tester, and judged
   by which nodes it selects, not by how it is written.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { evaluate, MAX_RESPONSE_CHARS } from "./evaluator.js";
import { set } from "./exercises.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "JSONPath Challenge Lab";

export function markup() {

    return labMarkup({
        id: "jsonpath-challenge-lab",
        title: TITLE,
        intro: "Practise JSONPath on a small library document. Each exercise says which values to select. Write a query, check it, and see which nodes you selected and which you missed. The checker uses the same RFC 9535 engine as the JSONPath Tester.",
        worked: {
            heading: "A Worked Example",
            intro: "Task: select the price of every book that costs less than 20. This example cannot be submitted; it shows the reasoning you will use.",
            example: "$.library.books[?@.price<20].price",
            steps: [
                "Start from the root with $ and walk down: the document has a library, which has a books array.",
                "To look at every book and keep only some, add a filter in square brackets: [?...]. Inside it, @ is the book being tested.",
                "The condition is @.price<20, so books priced 20 or more are dropped.",
                "Finish with .price to take the price of each book that was kept."
            ]
        },
        howTo: [
            "Read the task and the list of values the query must select. The document is shown above the answer box, read only.",
            "Type a JSONPath query. Every query starts with $.",
            "Press Check answer. The engine runs your query on the document and compares the nodes it selects with the nodes the exercise wants.",
            "If it is not right, you are shown the paths that were selected but not wanted and the paths that were wanted but missed, never the query.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        sections: [
            {
                heading: "What Counts as Correct",
                paragraphs: [
                    "An answer is correct when the query selects exactly the nodes the exercise asks for, each once. The text of the query does not matter: the dot form and the bracket form of the same selection are both accepted. Two different nodes that hold the same value are different nodes, so a query that picks the wrong one of two equal values is not correct.",
                    "Where the task says to keep an order, the nodes must come in that order. Otherwise the order does not matter. A query with a syntax error, or one that uses the match() or search() functions, which this engine does not support, is not checked and is not counted as an attempt. Queries can be up to 1,000 characters and the engine stops work that is too large."
                ]
            },
            {
                heading: "About This Lab",
                paragraphs: [
                    "The exercises are written for this site and follow RFC 9535, the JSONPath standard. They are practice, not a course and not a qualification. Other JSONPath tools were written before the standard and may behave differently, especially in filters and on missing members. Nothing is saved when you leave the page, and nothing you type is sent anywhere."
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
            id: "jsonpath-challenge-lab",
            limit: MAX_RESPONSE_CHARS,
            inputLabel: "Your JSONPath query",
            rows: 3,
            documentLabel: "The document (read only)",
            evaluate
        }
    });

}
