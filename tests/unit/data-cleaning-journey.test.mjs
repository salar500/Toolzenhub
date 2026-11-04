/**
 * The data cleaning journey across the SQL, Excel and Power BI labs: each cleaning lesson names the other two labs and states the same order
 * (keep the raw data, clean the text first, then remove duplicates, then check the counts). No fourth lab exists for it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };
const sql = (await import("../../assets/js/tools/sql-practice-lab/lessons.js")).lessons;
const xl = (await import("../../assets/js/tools/excel-practice-lab/lessons.js")).lessons;
const pbi = (await import("../../assets/js/tools/power-bi-practice-lab/lessons.js")).lessons;

const cleaning = (list) => list.find((l) => l.id === "cleaning");
const others = { sql: ["Excel Practice Lab", "Power BI Practice Lab"], xl: ["SQL Practice Lab", "Power BI Practice Lab"], pbi: ["SQL Practice Lab", "Excel Practice Lab"] };

for (const [key, list] of [["sql", sql], ["xl", xl], ["pbi", pbi]]) {
  test(`the ${key} cleaning lesson points at the other two labs and states the shared order`, () => {
    const last = cleaning(list).points.at(-1);
    for (const name of others[key]) assert.ok(last.includes(name), `${key}: ${name}`);
    assert.match(last, /keep the raw data, clean the text first, then remove duplicates, then check the counts/i);
  });
}

test("the shared people appear in each lab's cleaning data, so the story is one dataset in three tools", async () => {
  const { CLEANING_SETUP } = await import("../../assets/js/tools/sql-practice-lab/dataset.js");
  assert.match(CLEANING_SETUP.join(" "), /Asha Rao/);
  assert.match(CLEANING_SETUP.join(" "), /bilal khan/);
  const src = (await import("node:fs")).readFileSync("assets/js/tools/power-bi-practice-lab/lessons.js", "utf8");
  assert.match(src, /asha\s+rao/i);
  assert.match(src, /Bilal Khan/);
});
