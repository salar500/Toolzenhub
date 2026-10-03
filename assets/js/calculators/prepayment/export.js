/* =========================================================
   ToolZen Hub
   Loan Prepayment Calculator: CSV export

   Turns the schedule that is on screen into a CSV file, in the
   browser. The rows come from buildSchedule() (the same rows the
   tables show), so the file and the screen cannot disagree.
   Nothing is sent anywhere.

   Values are plain numbers with two decimals so a spreadsheet can
   add them up (no rupee signs or digit grouping); the labels in
   the first column are readable text. Every column is present for
   every schedule: a figure that does not apply is 0.00.
========================================================= */

import {
    buildSchedule
} from "../formulas/prepayment.js";

export const CSV_COLUMNS = [
    "Period",
    "Opening Balance",
    "Payment",
    "Principal",
    "Interest",
    "Prepayment",
    "Closing Balance"
];

const FILE_PARTS = {
    baseline: "without-prepayment",
    keep: "keep-emi",
    reduce: "lower-emi"
};

/*
 * A name that is safe on every system and says which schedule it
 * holds, for example loan-prepayment-keep-emi-schedule.csv. A
 * prepayment that clears the loan is its own case.
 */

export function scheduleFilename(
    result,
    scenario
) {

    const part =
        scenario === "keep" && result.prepaymentPoint.clearsLoan
            ? "clear-loan"
            : FILE_PARTS[scenario];

    return `loan-prepayment-${part ?? "schedule"}-schedule.csv`;

}

/* a cell is quoted only when it has to be (comma, quote or line break) */

export function csvCell(
    value
) {

    const text = String(value);

    return /[",\r\n]/.test(text)
        ? `"${text.replace(/"/g, '""')}"`
        : text;

}

const money = (value) =>
    (Math.round(value * 100) / 100).toFixed(2);

export function buildScheduleCsv(
    result,
    scenario
) {

    const lines = [CSV_COLUMNS];

    for (const row of buildSchedule(result, scenario)) {

        lines.push([
            row.month === 0 ? "Start" : `Month ${row.month}`,
            money(row.opening),
            money(row.payment),
            money(row.principal),
            money(row.interest),
            money(row.prepayment),
            money(row.closing)
        ]);

    }

    /* a leading byte order mark so Excel reads the file as UTF-8; CRLF line ends are the CSV standard */

    return "﻿" +
        lines
            .map(line => line.map(csvCell).join(","))
            .join("\r\n") +
        "\r\n";

}

/*
 * Starts the download. Returns the file name that was offered.
 * The object URL is released straight away; the browser keeps the
 * data it needs for the download.
 */

export function downloadScheduleCsv(
    result,
    scenario
) {

    const name = scheduleFilename(result, scenario);

    const blob =
        new Blob(
            [buildScheduleCsv(result, scenario)],
            { type: "text/csv;charset=utf-8" }
        );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = name;
    link.hidden = true;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return name;

}
