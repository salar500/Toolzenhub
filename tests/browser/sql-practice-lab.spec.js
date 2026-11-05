/**
 * SQL Practice Lab: the shared lab behaviour (tests/helpers/lab-contract.mjs) plus what is particular to it: the statements really
 * run (SQLite in a worker), every one of the 49 stated solutions is accepted, a wrong query is told apart (columns, rows,
 * values, order), a SQL error and a runaway statement are reported without breaking the page, and an exercise that changes data
 * is judged by the lab's own check query. The expected results come from an independent SQLite build (Python's sqlite3), see
 * tests/unit/sql-practice-lab.test.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, expectNoHorizontalOverflow } from "../helpers/test-base.mjs";
import { pickExercise, defineShellTests, openLab, app, answerBox, checkButton, verdictOf } from "../helpers/lab-contract.mjs";
import { set } from "../../assets/js/tools/sql-practice-lab/exercises.js";
import { lessons } from "../../assets/js/tools/sql-practice-lab/lessons.js";

const ROUTE = "tools/sql-practice-lab/";
const AXE = path.resolve("node_modules/axe-core/axe.min.js");

defineShellTests({
  route: ROUTE,
  title: "SQL Practice Lab",
  count: 49,
  limit: 4000,
  correct: "SELECT * FROM customers;",
  wrong: "SELECT name FROM customers;"
});

async function type(page, sql) {
  await answerBox(page).fill(sql);
  await checkButton(page).click();
}

test.describe("SQL Practice Lab: this lab", () => {

  test("every one of the 49 solutions is accepted by the real engine", async ({ page, go }) => {
    test.setTimeout(420000);
    await openLab(page, go, ROUTE);
    const failures = [];
    for (let i = 0; i < set.exercises.length; i += 1) {
      const ex = set.exercises[i];
      await type(page, ex.solution);
      await expect(page.locator(".lx-feedback h4")).not.toHaveText("Cannot check", { timeout: 20000 }).catch(() => {});
      const word = await verdictOf(page).innerText();
      if (word !== "Correct") failures.push(`${ex.id}: ${word} ${await page.locator(".lx-feedback").innerText()}`);
      if (i < set.exercises.length - 1) await page.getByRole("button", { name: "Next exercise" }).click();
    }
    expect(failures).toEqual([]);
  });

  test("a query returns the right rows is Correct and shows the first rows of the result @portable", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await type(page, "SELECT * FROM customers;");
    await expect(verdictOf(page)).toHaveText("Correct");
    await expect(page.locator('.lx-feedback [aria-label="Details"]')).toContainText("Asha Rao");
  });

  test("column names, capitals in keywords and the order of rows do not matter for an unordered exercise", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await pickExercise(page, /^Exercise 3:/);
    await type(page, "select name as who from customers where city = 'Pune' order by name desc");
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("the feedback says what differs without showing the expected rows", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await pickExercise(page, /^Exercise 3:/);
    await type(page, "SELECT name, city FROM customers WHERE city = 'Pune'");
    await expect(page.locator(".lx-feedback")).toContainText("returns 2 columns; this exercise asks for 1");
    await type(page, "SELECT name FROM customers WHERE city = 'Mumbai' OR city = 'Pune'");
    await expect(page.locator(".lx-feedback")).toContainText("returns 5 rows; this exercise expects 3");
    await type(page, "SELECT name FROM customers WHERE city IN ('Mumbai', 'Kochi')");
    await expect(page.locator(".lx-feedback")).toContainText("some values differ");
    await expect(page.locator(".lx-feedback")).not.toContainText("Jatin Verma");
  });

  test("an exercise that needs an order says when the rows are right but the order is not", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await pickExercise(page, /^Exercise 8:/);
    await type(page, "SELECT name, price FROM products ORDER BY price ASC LIMIT 3");
    await expect(page.locator(".lx-feedback")).toContainText("some values differ");
    await type(page, "SELECT name, price FROM products WHERE price > 900 ORDER BY price ASC");
    await expect(page.locator(".lx-feedback")).toContainText("not in the order");
  });

  test("a SQL mistake is reported with SQLite's own message, as Cannot check, and the next try works", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await type(page, "SELEKT * FROM customers");
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await expect(page.locator(".lx-feedback")).toContainText("SQLite says:");
    await expect(app(page).locator("[data-role=counts]")).toContainText("0 completed");
    await type(page, "SELECT * FROM missing_table");
    await expect(page.locator(".lx-feedback")).toContainText("no such table: missing_table");
    await type(page, "SELECT * FROM customers");
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("a runaway statement is stopped after three seconds, and the lab still works afterwards", async ({ page, go }) => {
    test.setTimeout(90000);
    await openLab(page, go, ROUTE);
    await type(page, "WITH RECURSIVE r(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM r) SELECT COUNT(*) FROM r;");
    await expect(page.locator(".lx-feedback")).toContainText("longer than 3 seconds", { timeout: 30000 });
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await type(page, "SELECT * FROM customers");
    await expect(verdictOf(page)).toHaveText("Correct", { timeout: 30000 });
  });

  test("a statement that changes data is judged by the lab's own query, on a fresh copy each time", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await pickExercise(page, /^Exercise 24:/); // INSERT
    await type(page, "SELECT 1");
    await expect(page.locator(".lx-feedback")).toContainText("result is empty");
    await expect(page.locator(".lx-feedback")).toContainText("After your statements the lab ran this query");
    await type(page, "INSERT INTO customers (id, name, city, joined) VALUES (13, 'Lata Menon', 'Kochi', '2024-01-01'); INSERT INTO customers (id, name, city, joined) VALUES (14, 'Extra', 'Kochi', '2024-01-01');");
    await expect(verdictOf(page)).toHaveText("Correct"); // the check reads id 13 only
    await type(page, "INSERT INTO customers (id, name, city, joined) VALUES (13, 'Lata Menon', 'Kochi', '2024-01-01');");
    await expect(verdictOf(page)).toHaveText("Correct"); // id 13 is free again: nothing carried over from the last check
  });

  test("a dropped table does not carry over to the next check", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await type(page, "DROP TABLE customers; SELECT 1;");
    await expect(page.locator(".lx-feedback")).toBeVisible();
    await type(page, "SELECT * FROM customers");
    await expect(verdictOf(page)).toHaveText("Correct");
  });

  test("the engine and the practice data are served from this site: no other host is contacted", async ({ page, go }) => {
    const hosts = new Set();
    page.on("request", (r) => hosts.add(new URL(r.url()).host));
    await openLab(page, go, ROUTE);
    await type(page, "SELECT * FROM customers");
    await expect(verdictOf(page)).toHaveText("Correct");
    const own = new URL(page.url()).host;
    expect([...hosts].filter((h) => h && h !== own && !/fonts\.(googleapis|gstatic)\.com/.test(h))).toEqual([]);
  });

  test("the page states what the lab is and is not", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    await expect(page.locator("body")).toContainText("SQLite does not enforce foreign keys unless you turn them on");
    await expect(page.locator("body")).toContainText("Nothing here is a claim about MySQL, PostgreSQL, SQL Server or Oracle");
    await expect(page.locator("body")).toContainText("not a course and not a qualification");
  });

  test("every lesson example runs in the real engine and gives the result printed beside it", async ({ page, go }) => {
    test.setTimeout(240000);
    await openLab(page, go, ROUTE);
    const problems = [];
    const details = page.locator("details.lx-lesson");
    expect(await details.count()).toBe(lessons.length);
    for (let li = 0; li < lessons.length; li += 1) {
      const lesson = details.nth(li);
      await lesson.locator("summary").click();
      for (let ei = 0; ei < lessons[li].examples.length; ei += 1) {
        const example = lessons[li].examples[ei];
        const block = lesson.locator(".lx-lesson__body > div").nth(ei);
        await block.getByRole("button", { name: "Run this example" }).click();
        const out = block.locator("[data-sql-out]");
        await expect(out).not.toHaveText("Running...", { timeout: 20000 });
        const text = await out.innerText();
        if (example.error) { if (!text.includes("SQLite says:")) problems.push(`${lessons[li].id}: expected an error, got ${text}`); continue; }
        if (example.sql.includes("sqlite_version")) { if (!/\d+\.\d+\.\d+/.test(text)) problems.push(`${lessons[li].id}: no version`); continue; }
        const live = await out.locator("table").evaluate((t) => [...t.rows].map((r) => [...r.cells].map((c) => c.textContent)));
        const expected = [example.columns, ...example.rows.map((r) => r.map((v) => (v === null ? "NULL" : String(v))))];
        const shown = live.slice(0, expected.length);
        if (JSON.stringify(shown) !== JSON.stringify(expected)) problems.push(`${lessons[li].id}: ${JSON.stringify(shown)} != ${JSON.stringify(expected)}`);
      }
      await lesson.locator("summary").click();
    }
    expect(problems).toEqual([]);
  });

  test("the sandbox runs any SQL, shows an error or a timeout, and starts fresh each time @portable", async ({ page, go }) => {
    await openLab(page, go, ROUTE);
    const run = page.locator("#sql-sandbox-run");
    const out = page.locator("#sql-sandbox-out");
    const box = page.locator("#sql-sandbox-input");
    await run.click();
    await expect(out.locator("table")).toBeVisible({ timeout: 20000 });
    await expect(out).toContainText("Asha Rao");
    await box.fill("DELETE FROM customers; SELECT COUNT(*) FROM customers;");
    await run.click();
    await expect(out).toContainText("0 ");
    await box.fill("SELECT COUNT(*) AS n FROM customers");
    await run.click();
    await expect(out.locator("td")).toHaveText("12");
    await box.fill("SELECT * FROM nothing_here");
    await run.click();
    await expect(out).toContainText("no such table: nothing_here");
    await box.fill("SELECT COUNT(*) FROM contacts_raw");
    await run.click();
    await expect(out.locator("td")).toHaveText("8");
  });

  test("axe finds nothing at start, after a wrong, a correct, an error and a data-changing result", async ({ page, go }) => {
    test.skip(!fs.existsSync(AXE), "axe-core is not installed");
    await openLab(page, go, ROUTE);
    await page.addScriptTag({ path: AXE });
    const scan = async (label) => {
      const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
      expect(result.violations.map((v) => `${label}: ${v.id}`), label).toEqual([]);
    };
    await scan("start");
    await page.locator("details.lx-lesson summary").nth(8).click(); // joins: a table of results
    await page.locator("details.lx-lesson").nth(8).getByRole("button", { name: "Run this example" }).first().click();
    await expect(page.locator("details.lx-lesson").nth(8).locator("[data-sql-out] table").first()).toBeVisible({ timeout: 20000 });
    await scan("a lesson open with a live result");
    await type(page, "SELECT name FROM customers");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await scan("not yet");
    await type(page, "SELECT * FROM customers");
    await expect(verdictOf(page)).toHaveText("Correct");
    await scan("correct");
    await type(page, "SELEKT");
    await expect(verdictOf(page)).toHaveText("Cannot check");
    await scan("error");
    await pickExercise(page, /^Exercise 24:/);
    await type(page, "SELECT 1");
    await expect(verdictOf(page)).toHaveText("Not yet");
    await scan("modify, not yet");
  });

  for (const width of [320, 390, 820, 1180]) {
    test(`layout at ${width}px: a long one-line statement and a 20-row result cause no sideways scroll`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 900 });
      await openLab(page, go, ROUTE);
      await pickExercise(page, /^Exercise 14:/);
      await type(page, "SELECT orders.id, customers.name FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.id > 0 AND customers.name <> 'a very long name that is not in the data at all and keeps going on and on' ORDER BY orders.id");
      await expect(verdictOf(page)).toHaveText("Correct");
      await expect(page.locator('.lx-feedback [aria-label="Details"]')).toContainText("more rows");
      await expectNoHorizontalOverflow(page);
    });

    test(`lessons at ${width}px: the longest lesson open with a live result causes no sideways scroll`, async ({ page, go }) => {
      await page.setViewportSize({ width, height: 900 });
      await openLab(page, go, ROUTE);
      const lesson = page.locator("details.lx-lesson").nth(14); // cleaning: wide results
      await lesson.locator("summary").click();
      await lesson.getByRole("button", { name: "Run this example" }).first().click();
      await expect(lesson.locator("[data-sql-out] table").first()).toBeVisible({ timeout: 20000 });
      await expectNoHorizontalOverflow(page);
    });
  }

});
