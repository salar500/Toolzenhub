/* =========================================================
   ToolZen Hub
   Cron Challenge Lab (Developer Tools)

   Write a five-field cron expression for a schedule described in
   words. The expression is read by the same engine as the Cron
   Expression Explainer (Cronie crontab syntax, run times in UTC) and
   judged by the schedule it describes, not by how it is written.
========================================================= */

import { labMarkup, initLab } from "../../learning/lab-page.js";
import { evaluate, MAX_RESPONSE_CHARS } from "./evaluator.js";
import { set } from "./exercises.js";

export const showRelatedCalculators = true;
export const showRelatedArticles = false;

const TITLE = "Cron Challenge Lab";

export function markup() {

    return labMarkup({
        id: "cron-challenge-lab",
        title: TITLE,
        intro: "Practise writing cron schedules. Each exercise describes when a job should run. Write the five-field expression, check it, and see when your expression would actually run next. The checker uses the same engine as the Cron Expression Explainer.",
        worked: {
            heading: "A Worked Example",
            intro: "Task: run a job at 08:30 every weekday. This example cannot be submitted; it shows the reasoning you will use.",
            example: "30 8 * * 1-5",
            steps: [
                "Write the five fields in order: minute, hour, day of month, month, day of week.",
                "08:30 is minute 30 of hour 8, so the first two fields are 30 and 8.",
                "Any day of the month and any month is allowed, so those two fields are stars.",
                "Weekdays are Monday to Friday, which are the numbers 1 to 5, so the last field is 1-5."
            ]
        },
        howTo: [
            "Read the schedule in words. Each exercise also gives a reference time, which is used only to show when a wrong expression would run next.",
            "Type a five-field cron expression.",
            "Press Check answer. The engine reads your expression and compares the schedule it describes with the schedule asked for.",
            "If it is valid but different, you are told which parts differ (minutes, hours, months or days) and shown its next three run times from the reference time, never the expression that was wanted.",
            "Use a hint if you are stuck, or show the solution. An exercise whose solution you viewed is counted as solution viewed, not completed."
        ],
        sections: [
            {
                heading: "Dialect, Time and What Counts as Correct",
                paragraphs: [
                    "The lab uses the crontab syntax of Cronie, with five time fields and times in UTC. Other schedulers use different syntax and rules: Quartz has a seconds field, AWS has a year field and its own day rules, and Kubernetes and many cloud services have their own details. Nothing here is a claim about them. The lab does not model time zones or daylight saving time, because the expression itself has no time zone.",
                    "An answer is correct when it describes the same schedule as the one asked for: the same minutes, the same hours, the same months, and the same days. The days are compared with Cronie's rule, which runs a job when both the day of the month and the day of the week match if either of them is a star, and when either one matches if neither is a star. Spelling does not matter, so */15 and 0,15,30,45 are the same, and 0 and 7 both mean Sunday. Two expressions that never match any real date are not compared as equal, and no exercise asks for one. Answers can be up to 256 characters."
                ]
            },
            {
                heading: "About This Lab",
                paragraphs: [
                    "The exercises are written for this site and follow the crontab manual page of Cronie. They are practice, not a course and not a qualification. Nothing is saved when you leave the page, and nothing you type is sent anywhere."
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
            id: "cron-challenge-lab",
            limit: MAX_RESPONSE_CHARS,
            inputLabel: "Your cron expression",
            rows: 2,
            evaluate
        }
    });

}
