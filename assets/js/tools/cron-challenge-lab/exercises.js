/* =========================================================
   ToolZen Hub
   Cron Challenge Lab: the exercises

   Plain data (see learning/content-schema.js, validateExerciseSet).
   Each exercise describes a schedule in words and asks for a
   five-field expression in the dialect of the Cron Expression
   Explainer (Cronie crontab syntax). `solution` is one accepted
   expression; any expression with the same schedule is accepted.
   `reference` is the fixed moment (UTC) from which a wrong
   expression's next runs are listed.

   Difficulty: beginner = one field set, intermediate = two or three
   fields combined or a step, advanced = a rule with an exception
   (the day-of-month and day-of-week rule, a leap day, how a step
   restarts).
========================================================= */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Tue 10 Mar 2026, 09:30 UTC" from an ISO instant, computed in UTC only. */
export function stamp(iso) {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, "0");
    return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

function exercise(e) {
    const full = { starting: "* * * * *", reference: "2026-03-10T09:30:00Z", tool: "cron-expression-explainer", ...e };
    return { ...full, requirement: `Schedule: ${full.schedule} Reference time for the run list: ${stamp(full.reference)}.` };
}

export const set = {
    id: "cron-challenge",
    version: "1.0.0",
    title: "Cron Challenge Lab",
    description: "Nineteen exercises in writing five-field cron expressions for a described schedule, checked by the same Cronie-dialect engine as the Cron Expression Explainer.",
    reviewed: {
        date: "2026-10-29",
        method: "Written by the author. Every solution was run through an independent cron implementation written in Python, which listed the runs from the reference time and compared equivalent spellings by brute force over four years. No second reviewer yet."
    },
    exercises: [
        exercise({
            id: "crn-every-minute", title: "Every minute", difficulty: "beginner",
            objective: "Know that a star in a field means every value of that field.",
            instructions: "Write a cron expression that runs once every minute.",
            schedule: "every minute of every day.",
            starting: "0 * * * *",
            solution: "* * * * *",
            hints: ["A cron expression has five fields: minute, hour, day of month, month, day of week.", "A star matches every value of its field.", "Use a star in all five fields."],
            explanation: "A star means every possible value. With a star in all five fields the job matches every minute of every day. The expression * * * * * is also the easiest one to write by mistake, and it runs far more often than most jobs need.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-daily-0230", title: "Once a day at 02:30", difficulty: "beginner",
            objective: "Fix the minute and the hour and leave the rest open.",
            instructions: "Write a cron expression that runs once a day at 02:30.",
            schedule: "every day at 02:30.",
            solution: "30 2 * * *",
            hints: ["The minute comes first, then the hour.", "A time of 02:30 is minute 30 of hour 2.", "Leave day of month, month and day of week as stars."],
            explanation: "The first field is the minute and the second is the hour, on a 24-hour clock. Fixing them and leaving the three date fields as stars makes the job run once on every day.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-hourly", title: "On the hour", difficulty: "beginner",
            objective: "Fix the minute and leave the hour open.",
            instructions: "Write a cron expression that runs at the start of every hour.",
            schedule: "at minute 0 of every hour, every day.",
            solution: "0 * * * *",
            hints: ["The start of the hour is minute 0.", "The hour field should match every hour.", "Write 0 for the minute and stars for the other four fields."],
            explanation: "Setting the minute to 0 and the hour to a star runs the job at 00:00, 01:00, 02:00 and so on. Forgetting the minute and writing a star there would run it sixty times in each of those hours.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-quarter-hour", title: "Every fifteen minutes", difficulty: "beginner",
            objective: "Use a step to repeat at a regular interval.",
            instructions: "Write a cron expression that runs every 15 minutes: at minute 0, 15, 30 and 45 of every hour.",
            schedule: "at minute 0, 15, 30 and 45 of every hour, every day.",
            solution: "*/15 * * * *",
            hints: ["A step is written with a slash after the range.", "*/15 means every 15th value, starting from the first.", "Put */15 in the minute field. The list 0,15,30,45 is another way to write it, and is accepted too."],
            explanation: "A step */15 in the minute field takes every fifteenth minute from 0, so 0, 15, 30 and 45. Writing the four minutes as a list gives the same schedule, and the checker accepts either, because it compares what the expression does and not how it is written.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-weekdays-8", title: "Weekdays at eight", difficulty: "beginner",
            objective: "Use a range in the day-of-week field.",
            instructions: "Write a cron expression that runs at 08:00 from Monday to Friday.",
            schedule: "at 08:00 on Monday, Tuesday, Wednesday, Thursday and Friday.",
            solution: "0 8 * * 1-5",
            hints: ["Days of the week are numbers: Sunday is 0, Monday is 1, and so on up to Saturday, 6.", "A range joins two values with a dash.", "Put 1-5 in the last field."],
            explanation: "The last field is the day of the week, where 1 is Monday and 5 is Friday. A range 1-5 covers both ends. The day-of-month field stays a star, so only the weekday limits the days.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-twice-daily", title: "Nine and five", difficulty: "intermediate",
            objective: "Use a list to run at more than one time.",
            instructions: "Write a cron expression that runs every day at 09:00 and at 17:00, and at no other time.",
            schedule: "every day at 09:00 and at 17:00.",
            solution: "0 9,17 * * *",
            hints: ["The two times have the same minute but different hours.", "A comma separates the values of a list.", "Put 9,17 in the hour field."],
            explanation: "A comma-separated list matches any of the values. Both times have minute 0, so one expression with a list of two hours covers them. Two times that differ in the minute as well would need two expressions.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-office-hours", title: "During office hours", difficulty: "intermediate",
            objective: "Combine a step, a range of hours and a range of weekdays.",
            instructions: "Write a cron expression that runs every 10 minutes (at minute 0, 10, 20, 30, 40 and 50) during the hours 09 to 17 inclusive, from Monday to Friday.",
            schedule: "at minute 0, 10, 20, 30, 40 and 50 of each hour from 09 to 17, on Monday to Friday. The last run of a day is 17:50.",
            solution: "*/10 9-17 * * 1-5",
            hints: ["Three fields are involved: minute, hour and day of week.", "The hour range 9-17 includes hour 17, so the last run is at 17:50.", "Write */10 9-17 * * 1-5."],
            explanation: "The hour range 9-17 is inclusive, so the job runs through the whole of hour 17 and the last run is 17:50. If the intention was to stop at 17:00 the range would have to end at 16 and a separate expression would add the 17:00 run.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-first-of-month", title: "The first of the month", difficulty: "intermediate",
            objective: "Fix the day of month.",
            instructions: "Write a cron expression that runs at midnight (00:00) on the first day of every month.",
            schedule: "at 00:00 on day 1 of every month.",
            solution: "0 0 1 * *",
            hints: ["Midnight is hour 0 and minute 0.", "The third field is the day of the month.", "Write 0 0 1 * *."],
            explanation: "The third field is the day of the month, from 1 to 31. With the minute and hour fixed at 0 and a star for the month and the day of the week, the job runs once in each month, on the first.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-sunday-6", title: "Sunday morning", difficulty: "intermediate",
            objective: "Write Sunday correctly: 0, and also 7 in this dialect.",
            instructions: "Write a cron expression that runs at 06:00 every Sunday.",
            schedule: "at 06:00 on Sunday.",
            solution: "0 6 * * 0",
            hints: ["Sunday is the first day of the week in the numbering.", "Counting starts at 0.", "Write 0 for Sunday. In this dialect 7 also means Sunday, and is accepted."],
            explanation: "Day-of-week numbers run from 0 (Sunday) to 6 (Saturday), and most implementations, including this dialect, also accept 7 for Sunday. Both spellings give the same schedule here. Some other schedulers number the days differently, so check before reusing an expression.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-quarterly", title: "Four times a year", difficulty: "intermediate",
            objective: "Choose months with a list or a step.",
            instructions: "Write a cron expression that runs at midnight on the first day of January, April, July and October.",
            schedule: "at 00:00 on day 1 of January, April, July and October.",
            solution: "0 0 1 1,4,7,10 *",
            hints: ["The month field is the fourth, and January is 1.", "The months are three apart.", "A list 1,4,7,10 works. So does a step starting from the first month."],
            explanation: "Months are numbered 1 to 12. The four months can be written as a list, 1,4,7,10, or as a step over the whole range, */3, which takes every third month starting at 1. Both give the same schedule.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-every-other-hour", title: "Every second hour", difficulty: "intermediate",
            objective: "Combine a fixed minute with a step in the hour field.",
            instructions: "Write a cron expression that runs at minute 5 of hours 0, 2, 4 and so on up to 22, every day.",
            schedule: "at 00:05, 02:05, 04:05, 06:05, 08:05, 10:05, 12:05, 14:05, 16:05, 18:05, 20:05 and 22:05 every day.",
            solution: "5 */2 * * *",
            hints: ["The hours go up in steps of two from 0.", "A step in the hour field is written */2.", "Write 5 */2 * * *."],
            explanation: "*/2 in the hour field takes the hours 0, 2, 4 and on up to 22. The minute is fixed at 5, so the job runs twelve times a day, at five minutes past each of those hours.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-weekend-noon", title: "Weekend noon", difficulty: "intermediate",
            objective: "List non-adjacent days of the week.",
            instructions: "Write a cron expression that runs at 12:00 on Saturday and Sunday.",
            schedule: "at 12:00 on Saturday and on Sunday.",
            solution: "0 12 * * 6,0",
            hints: ["Saturday is 6. Sunday is 0, or 7.", "A range cannot cross from 6 to 0, so use a list.", "Write 6,0 in the day-of-week field. The range 6-7 is accepted too."],
            explanation: "A range counts upwards, so 6-0 is not a valid range. Listing the two days, 6,0, works. In this dialect 7 also means Sunday, so 6-7 is another way to write the same two days.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-dom-or-dow", title: "The 15th, or a Monday", difficulty: "advanced",
            objective: "Know that when both day fields are restricted, a day matches if either one does.",
            instructions: "Write a cron expression that runs at 12:00 on the 15th of the month and also on every Monday.",
            schedule: "at 12:00 on the 15th of every month, and also at 12:00 on every Monday.",
            solution: "0 12 15 * 1",
            hints: ["There are two kinds of day to include: a day of the month and a day of the week.", "In this dialect, if both day fields are restricted (neither is a star), a day matches when it fits either of them.", "Write 15 in the third field and 1 in the fifth."],
            explanation: "When the day-of-month and day-of-week fields are both restricted, Cronie runs the job when either one matches, so the expression means the 15th or any Monday, not a Monday that is the 15th. If either field is a star, both must match. This exception surprises many people; the Cron Expression Explainer states the rule.",
            source: "crontab(5), Cronie (day of month and day of week)"
        }),
        exercise({
            id: "crn-summer-mondays", title: "Mondays in summer", difficulty: "advanced",
            objective: "Combine a month range with a weekday when the other day field is a star.",
            instructions: "Write a cron expression that runs at 12:00 on every Monday in June, July and August, and not in other months.",
            schedule: "at 12:00 on every Monday of June, July and August.",
            solution: "0 12 * 6-8 1",
            hints: ["Three things limit this schedule: the month, the weekday and the time.", "The day-of-month field is a star here, so the month and weekday both have to match.", "Write 0 12 * 6-8 1."],
            explanation: "Here the day-of-month field is a star, so a day must satisfy the weekday as well as the other fields: it must be a Monday, and the month must be one of 6, 7 or 8. This is different from the previous exercise, where both day fields were restricted.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-leap-day", title: "Only on a leap day", difficulty: "advanced",
            objective: "Schedule a date that exists only in some years.",
            instructions: "Write a cron expression that runs at 00:00 on 29 February.",
            schedule: "at 00:00 on 29 February. This happens only in leap years.",
            solution: "0 0 29 2 *",
            hints: ["Fix both the day of the month and the month.", "February is month 2.", "Write 0 0 29 2 *."],
            explanation: "The expression is valid and matches 29 February whenever it exists. In a year that is not a leap year nothing runs, so the next run from March 2026 is 29 February 2028. A schedule for 31 February would be valid to write and would never run at all.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-start-of-hour-range", title: "A few minutes, twice a month", difficulty: "advanced",
            objective: "Use a minute range together with a list of days of the month.",
            instructions: "Write a cron expression that runs every minute from 09:00 to 09:05 inclusive (six runs), on the 1st and on the 15th of every month.",
            schedule: "at 09:00, 09:01, 09:02, 09:03, 09:04 and 09:05 on the 1st and the 15th of every month.",
            solution: "0-5 9 1,15 * *",
            hints: ["The minute range includes both ends.", "Only hour 9 is wanted.", "Write 0-5 9 1,15 * *."],
            explanation: "The minute range 0-5 includes both ends, so there are six runs, not five. The days are a list. The day-of-week field is a star, so the job runs only on the 1st and the 15th.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-every-seven", title: "Every seven minutes?", difficulty: "advanced",
            objective: "Understand that a step restarts at the start of each hour.",
            instructions: "Write a cron expression that runs at minute 0, 7, 14, 21, 28, 35, 42, 49 and 56 of every hour. Note what happens after minute 56.",
            schedule: "at minute 0, 7, 14, 21, 28, 35, 42, 49 and 56 of every hour, every day.",
            solution: "*/7 * * * *",
            hints: ["This looks like 'every 7 minutes', but 60 is not a multiple of 7.", "The step counts from the start of each hour, so after 56 the next run is at minute 0 of the next hour, four minutes later.", "Write */7 in the minute field."],
            explanation: "A step applies within one field, not across the clock. */7 in the minute field gives the minutes 0, 7, 14 and on to 56, then the pattern restarts at minute 0 of the next hour, only 4 minutes after the last run. A true every-7-minutes schedule cannot be written as one cron expression.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-odd-days", title: "Odd days of the month", difficulty: "advanced",
            objective: "Use a step over a range of days.",
            instructions: "Write a cron expression that runs at midnight (00:00) on the odd days of the month: 1, 3, 5 and so on up to 31.",
            schedule: "at 00:00 on day 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29 and 31 of every month.",
            solution: "0 0 1-31/2 * *",
            hints: ["Days of the month start at 1.", "A step over the whole range 1-31 takes every second day starting from 1.", "Both */2 and 1-31/2 in the third field select the odd days."],
            explanation: "A step over a range takes every second value starting from the first one, which is 1, so the odd days are chosen. In months with 30 days, or in February, the days that do not exist are simply not matched. Two days in a row, such as the 31st and the 1st, can both run.",
            source: "crontab(5), Cronie"
        }),
        exercise({
            id: "crn-weekday-10-30", title: "Twice an hour on weekdays", difficulty: "advanced",
            objective: "Combine a minute list, an hour range and a weekday range.",
            instructions: "Write a cron expression that runs at minute 10 and minute 40 of every hour from 08 to 11 inclusive, on Monday to Friday.",
            schedule: "at 08:10, 08:40, 09:10, 09:40, 10:10, 10:40, 11:10 and 11:40 on Monday to Friday.",
            solution: "10,40 8-11 * * 1-5",
            hints: ["Two minutes in a list, four hours in a range.", "The weekday range is the same as in an earlier exercise.", "Write 10,40 8-11 * * 1-5."],
            explanation: "A list in the minute field, a range in the hour field and a range in the day-of-week field together give two runs in each of four hours, so eight runs a day, on five days a week.",
            source: "crontab(5), Cronie"
        })
    ]
};
