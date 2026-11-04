/**
 * Power BI Practice Lab engines: query steps, relationships and the DAX subset. Values are worked out by hand from the
 * Sakhi Stores data (6,800 in all: Electronics 3,300, Grocery 2,550, Stationery 950; 2024 sales 4,200; 2023 sales 2,600).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runScript, toNumber, toDate, ERROR, MAX_STEPS } from "../../assets/js/tools/power-bi-practice-lab/pq/engine.js";
import { checkRelationships, ModelError } from "../../assets/js/tools/power-bi-practice-lab/model.js";
import { evaluateMeasure, evaluateColumn, SUPPORTED } from "../../assets/js/tools/power-bi-practice-lab/dax/engine.js";
import { SAKHI } from "../../assets/js/tools/power-bi-practice-lab/datasets.js";

const T = (columns, rows) => ({ columns, rows });
const run = (t, s, o) => runScript(t, s, o);
const val = (script, opts) => evaluateMeasure(SAKHI, script, opts);
const ctx = (table, col, ...values) => ({ table, col, values });

describe("query steps", () => {

    it("values: numbers with commas, blanks and errors; dates in three styles, invalid dates are errors", () => {
        assert.equal(toNumber("1,250"), 1250);
        assert.equal(toNumber("  "), null);
        assert.equal(toNumber("abc"), ERROR);
        assert.equal(toDate("07/03/2024"), "2024-03-07");
        assert.equal(toDate("9-Mar-2024"), "2024-03-09");
        assert.equal(toDate("31/02/2024"), ERROR);
        assert.equal(toDate("2024-13-01"), ERROR);
    });

    it("trim collapses runs of spaces; proper capitalises each word", () => {
        const t = T(["A"], [["  a   b "], ["mUMBAI city"]]);
        assert.deepEqual(run(t, "trim A\nproper A").table.rows, [["A B"], ["Mumbai City"]]);
    });

    it("an unknown column, an unknown step and an unclosed quote name the line and the problem", () => {
        const t = T(["A"], [["x"]]);
        assert.match(run(t, "trim B").error.message, /no column named "B"/);
        assert.equal(run(t, "trim A\nfrobnicate A").error.line, 2);
        assert.match(run(t, "replace A \"x").error.message, /quote/);
        assert.match(run(t, "trim A extra").error.message, /more text/);
    });

    it("remove duplicates keeps the first; on a column it compares only that column", () => {
        const t = T(["K", "V"], [["a", 1], ["a", 2], ["b", 1]]);
        assert.deepEqual(run(t, "remove duplicates K").table.rows, [["a", 1], ["b", 1]]);
        assert.equal(run(t, "remove duplicates").table.rows.length, 3);
    });

    it("group by, merge queries (left join), append with a new column, unpivot", () => {
        const t = T(["C", "N"], [["x", 1], ["y", 2], ["x", 3]]);
        assert.deepEqual(run(t, "group by C sum N as S").table, T(["C", "S"], [["x", 4], ["y", 2]]));
        assert.deepEqual(run(t, "group by C count N as K").table.rows, [["x", 2], ["y", 1]]);
        const lk = T(["C", "L"], [["x", "X!"]]);
        assert.deepEqual(run(t, "merge queries Lk on C = C add L", { Lk: lk }).table.rows, [["x", 1, "X!"], ["y", 2, null], ["x", 3, "X!"]]);
        const o = T(["C", "Z"], [["q", 9]]);
        assert.deepEqual(run(t, "append O", { O: o }).table, T(["C", "N", "Z"], [["x", 1, null], ["y", 2, null], ["x", 3, null], ["q", null, 9]]));
        const w = T(["R", "J", "F"], [["n", 1, 2]]);
        assert.deepEqual(run(w, "unpivot J, F into M, V").table, T(["R", "M", "V"], [["n", "J", 1], ["n", "F", 2]]));
    });

    it("type change makes errors; remove errors drops them; division by zero in a custom column is an error", () => {
        const t = T(["A"], [["5"], ["x"]]);
        assert.deepEqual(run(t, "change type A as number").table.rows, [[5], [ERROR]]);
        assert.deepEqual(run(t, "change type A as number\nremove errors A").table.rows, [[5]]);
        const d = T(["A", "B"], [[1, 0]]);
        assert.deepEqual(run(d, "add column C = A / B").table.rows, [[1, 0, ERROR]]);
    });

    it("split keeps extra parts in the last column; fill down copies the last value; filter compares numbers as numbers", () => {
        assert.deepEqual(run(T(["N"], [["a b c"]]), "split N by \" \" into F, L").table.rows, [["a", "b c"]]);
        assert.deepEqual(run(T(["R"], [["n"], [null], [""]]), "fill down R").table.rows, [["n"], ["n"], ["n"]]);
        assert.deepEqual(run(T(["Q"], [[10], [9], [100]]), "filter Q > 9").table.rows, [[10], [100]]);
    });

    it("limits: too many steps and too long a script are refused", () => {
        const t = T(["A"], [["x"]]);
        assert.match(run(t, Array(MAX_STEPS + 1).fill("trim A").join("\n")).error.message, /More than/);
        assert.match(run(t, "trim A\n".repeat(1000)).error.message, /longer/);
    });

    it("the input table is never changed", () => {
        const t = T(["A"], [["  x "]]);
        run(t, "trim A");
        assert.deepEqual(t.rows, [["  x "]]);
    });
});

describe("relationships", () => {

    const tables = {
        Orders: T(["ID", "P"], [[1, "a"], [2, "a"], [3, "b"]]),
        Products: T(["P", "N"], [["a", "x"], ["b", "y"], ["c", "z"]]),
        Dup: T(["P"], [["a"], ["a"]]),
        Num: T(["P"], [[1], [2]])
    };

    it("many to one is accepted; reversed is refused and the checker says which way round it goes", () => {
        assert.equal(checkRelationships(tables, "Orders[P] -> Products[P]").relationships.length, 1);
        assert.throws(() => checkRelationships(tables, "Products[P] -> Orders[P]"), /not unique.*wrong way round/s);
    });

    it("duplicate keys, a type mismatch, a missing column, a missing table and a second active link are refused", () => {
        assert.throws(() => checkRelationships(tables, "Orders[P] -> Dup[P]"), /appears 2 times/);
        assert.throws(() => checkRelationships(tables, "Orders[P] -> Num[P]"), /different kinds/);
        assert.throws(() => checkRelationships(tables, "Orders[Z] -> Products[P]"), /no column named Z/);
        assert.throws(() => checkRelationships(tables, "Nope[P] -> Products[P]"), /no table named Nope/);
        assert.throws(() => checkRelationships(tables, "Orders[P] -> Products[P]\nOrders[ID] -> Products[P]"), ModelError);
    });

    it("orphans are reported as a note, and an inactive link is allowed beside an active one", () => {
        const t = { F: T(["K", "L"], [["a", "a"], ["z", "b"]]), D: T(["K"], [["a"], ["b"]]) };
        const r = checkRelationships(t, "F[K] -> D[K]\nF[L] -> D[K] inactive");
        assert.match(r.notes[0], /1 value with no match/);
        assert.equal(r.relationships[1].active, false);
    });
});

describe("DAX: the Sakhi Stores model, worked by hand", () => {

    it("aggregations", () => {
        assert.equal(val("SUM(Orders[Amount])").value, 6800);
        assert.equal(val("COUNTROWS(Orders)").value, 17);
        assert.equal(val("DISTINCTCOUNT(Orders[CustomerID])").value, 5);
        assert.equal(val("AVERAGE(Orders[Amount])").value, 400);
        assert.equal(val("MAX(Orders[Amount])").value, 1000);
        assert.equal(val("MIN(Orders[Qty])").value, 1);
    });

    it("a dimension filter reaches the fact table; filters on two tables combine", () => {
        assert.equal(val("SUM(Orders[Amount])", { context: [ctx("Products", "Category", "Electronics")] }).value, 3300);
        assert.equal(val("SUM(Orders[Amount])", { context: [ctx("Customers", "City", "Pune")] }).value, 2850);
        assert.equal(val("SUM(Orders[Amount])", { context: [ctx("Products", "Category", "Electronics"), ctx("Customers", "City", "Delhi")] }).value, 500);
        assert.equal(val("SUM(Orders[Amount])", { context: [ctx("Date", "YearMonth", "2024-03")] }).value, 1650);
    });

    it("an empty context gives blank for SUM and zero for COUNTROWS", () => {
        const none = [ctx("Date", "YearMonth", "2030-01")];
        assert.equal(val("SUM(Orders[Amount])", { context: none }).value, null);
        assert.equal(val("COUNTROWS(Orders)", { context: none }).value, 0);
    });

    it("CALCULATE replaces a filter on the same column but keeps others; ALL and ALLEXCEPT remove", () => {
        const f = "CALCULATE(SUM(Orders[Amount]), Products[Category] = \"Grocery\")";
        assert.equal(val(f).value, 2550);
        assert.equal(val(f, { context: [ctx("Products", "Category", "Electronics")] }).value, 2550);
        assert.equal(val(f, { context: [ctx("Customers", "City", "Delhi")] }).value, 1050);
        assert.equal(val("CALCULATE(SUM(Orders[Amount]), ALL(Products))", { context: [ctx("Products", "Category", "Grocery")] }).value, 6800);
        assert.equal(val("CALCULATE(SUM(Orders[Amount]), ALLEXCEPT(Products, Products[Category]))", { context: [ctx("Products", "Category", "Grocery"), ctx("Customers", "City", "Delhi")] }).value, 1050);
    });

    it("FILTER, COUNTROWS, iterators, RELATED and context transition", () => {
        assert.equal(val("COUNTROWS(FILTER(Orders, Orders[Amount] >= 500))").value, 6);
        assert.equal(val("SUMX(Orders, Orders[Qty] * RELATED(Products[Price]))").value, 6800);
        // a plain SUM inside an iterator does not turn the current row into a filter; CALCULATE (or a measure) does
        assert.equal(val("AVERAGEX(Customers, SUM(Orders[Amount]))").value, 6800);
        assert.equal(val("AVERAGEX(Customers, CALCULATE(SUM(Orders[Amount])))").value, 1360);
        assert.equal(val("MAXX(Products, CALCULATE(SUM(Orders[Amount])))").value, 2500);
    });

    it("variables, DIVIDE, IF, SWITCH, SELECTEDVALUE and text", () => {
        assert.equal(val("VAR a = 10\nVAR b = 4\nRETURN a / b").value, 2.5);
        assert.equal(val("DIVIDE(1, 0)").value, null);
        assert.equal(val("DIVIDE(1, 0, -1)").value, -1);
        assert.equal(val("IF(SUM(Orders[Amount]) > 5000, \"big\", \"small\")").value, "big");
        assert.equal(val("SWITCH(TRUE(), SUM(Orders[Amount]) > 9000, \"a\", SUM(Orders[Amount]) > 5000, \"b\", \"c\")").value, "b");
        assert.equal(val("SELECTEDVALUE(Products[Category], \"many\")").value, "many");
        assert.equal(val("SELECTEDVALUE(Products[Category], \"many\")", { context: [ctx("Products", "Category", "Grocery")] }).value, "Grocery");
        assert.equal(val("\"a\" & \"b\"").value, "ab");
    });

    it("time intelligence: year to date, same period last year, previous month, date add", () => {
        const m = (ym) => [ctx("Date", "YearMonth", ym)];
        assert.equal(val("TOTALYTD(SUM(Orders[Amount]), Date[Date])", { context: m("2024-03") }).value, 3800);
        assert.equal(val("CALCULATE(SUM(Orders[Amount]), SAMEPERIODLASTYEAR(Date[Date]))", { context: m("2024-03") }).value, 500);
        assert.equal(val("CALCULATE(SUM(Orders[Amount]), PREVIOUSMONTH(Date[Date]))", { context: m("2024-02") }).value, 1000);
        assert.equal(val("CALCULATE(SUM(Orders[Amount]), DATEADD(Date[Date], -1, MONTH))", { context: m("2024-02") }).value, 1000);
        assert.match(val("TOTALYTD(SUM(Orders[Amount]), Orders[OrderDate])").error, /date column/);
    });

    it("measures can call measures, helpers are provided, and a measure cannot call itself", () => {
        assert.equal(val("Twice = [Base] * 2", { helpers: { Base: "SUM(Orders[Amount])" } }).value, 13600);
        assert.match(val("A = [B]\nB = [A]").error, /refers to itself/);
    });

    it("a calculated column is evaluated per row", () => {
        const r = evaluateColumn(SAKHI, "Orders", "Orders[Qty] * RELATED(Products[Price])");
        assert.equal(r.values.length, 17);
        assert.deepEqual(r.values.slice(0, 3), [600, 500, 200]);
    });

    it("errors are explained, not guessed", () => {
        assert.match(val("SUMM(Orders[Amount])").error, /SUMM is not supported in this lab/);
        assert.match(val("SUM(Orders[Nope])").error, /no column named \[Nope\]/);
        assert.match(val("SUM(Nowhere[X])").error, /no table named 'Nowhere'/);
        assert.match(val("SUM(Orders[Amount]").error, /closing bracket/);
        assert.match(val("Orders[Amount]").error, /whole column/);
        assert.match(val("1 / 0").error, /Division by zero/);
        assert.match(val("SUM(Products[Name])").error, /text/);
        assert.match(val("FILTER(Orders, TRUE())").error, /returns a table/);
        assert.match(val("EARLIER(Orders[Amount])").error, /not supported/);
        assert.match(val("").error, /Write a measure/);
    });

    it("limits: very long text and deep nesting are refused; heavy iteration stops", () => {
        assert.match(val("1" + "+1".repeat(500)).error, /longer than/);
        assert.match(val("(".repeat(40) + "1" + ")".repeat(40)).error, /nested/);
        assert.match(val("SUMX(Orders, SUMX(Orders, SUMX(Orders, SUMX(Orders, 1))))").error, /too much work/);
    });

    it("every function on the supported list is recognised by the engine", () => {
        for (const f of SUPPORTED) {
            if (["TRUE", "FALSE", "BLANK"].includes(f)) continue;
            const r = val(`${f}(Orders[Amount])`);
            assert.doesNotMatch(r.error ?? "", /is not supported in this lab/, f);
        }
    });
});
