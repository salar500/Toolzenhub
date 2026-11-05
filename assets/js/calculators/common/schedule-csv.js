/* =========================================================
   ToolZen Hub
   Loan repayment schedule: CSV export (EMI and Home Loan)

   Turns the monthly schedule that is on screen into a CSV file,
   in the browser. The rows are the ones the page already holds
   (calculateAmortization() or payoffSchedule()), so the file and
   the screen cannot disagree. Nothing is sent anywhere.

   Values are plain numbers with two decimals so a spreadsheet
   can add them up (no rupee signs or digit grouping). The last
   row is the total of each column, added from the unrounded
   amounts exactly as the page's own totals are, so a column can
   differ from the sum of its rounded rows by a paisa or two.

   There are no payment dates: neither calculator asks for a
   start date, so the file numbers the payments (and the loan
   year each falls in) instead of inventing a calendar.
========================================================= */

export const SCHEDULE_COLUMNS = [
    "Payment",
    "Loan year",
    "EMI",
    "Principal",
    "Interest",
    "Balance"
];

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

/*
 * rows: [{ month, emi, principal, interest, balance }, ...].
 * Returns "" when there is nothing to export.
 */

export function buildScheduleCsv(
    rows
) {

    if (!Array.isArray(rows) || rows.length === 0) {
        return "";
    }

    const lines = [SCHEDULE_COLUMNS];

    let emi = 0;
    let principal = 0;
    let interest = 0;

    for (const row of rows) {

        emi += row.emi;
        principal += row.principal;
        interest += row.interest;

        lines.push([
            row.month,
            Math.ceil(row.month / 12),
            money(row.emi),
            money(row.principal),
            money(row.interest),
            money(row.balance)
        ]);

    }

    lines.push([
        "Total",
        "",
        money(emi),
        money(principal),
        money(interest),
        ""
    ]);

    /* a leading byte order mark so Excel reads the file as UTF-8; CRLF line ends are the CSV standard */

    return "﻿" +
        lines
            .map(line => line.map(csvCell).join(","))
            .join("\r\n") +
        "\r\n";

}

/*
 * Starts the download. Returns the file name that was offered, or
 * "" when there was nothing to save. The object URL is released
 * straight away; the browser keeps the data it needs.
 */

export function downloadScheduleCsv(
    rows,
    name
) {

    const csv = buildScheduleCsv(rows);

    if (!csv) {
        return "";
    }

    const blob =
        new Blob(
            [csv],
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
