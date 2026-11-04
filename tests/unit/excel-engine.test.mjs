/**
 * Excel Practice Lab: the parser and the calculation engine.
 *
 * Every expected value below was worked out by hand or with a separate calculation (not by running the engine), so these tests
 * pin the documented behaviour of each supported function, the error values, the limits and the refusal of what is unsupported.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseFormula, tokenize, shiftFormula, parseAddress, addressOf, FormulaSyntaxError, MAX_FORMULA_LENGTH } from "../../assets/js/tools/excel-practice-lab/formula/parser.js";
import { createSheet, display, SUPPORTED, isErr, ERROR_HELP } from "../../assets/js/tools/excel-practice-lab/formula/engine.js";

const calc = (formula, cells = {}) => {
    const s = createSheet(cells);
    return display(s.evaluate(formula, "Z99"));
};

describe("Excel engine: the parser", () => {

    it("reads addresses with and without dollar signs, and refuses cells outside the sheet", () => {
        assert.deepEqual(parseAddress("B3"), { col: 2, row: 3, absCol: false, absRow: false });
        assert.deepEqual(parseAddress("$AA$10"), { col: 27, row: 10, absCol: true, absRow: true });
        assert.equal(addressOf(28, 5), "AB5");
        assert.equal(parseAddress("A0"), null);
        assert.equal(parseAddress("AAA1"), null);
    });

    it("follows Excel's precedence: unary minus before power, power before multiply, and so on", () => {
        assert.equal(calc("=-2^2"), "4");
        assert.equal(calc("=2+3*4"), "14");
        assert.equal(calc("=(2+3)*4"), "20");
        assert.equal(calc("=2^3^2"), "64"); // left to right: (2^3)^2
        assert.equal(calc("=10-4-3"), "3");
        assert.equal(calc("=50%*2"), "1");
        assert.equal(calc('="a"&1+2'), "a3");
        assert.equal(calc("=1+2=3"), "TRUE");
    });

    it("gives plain-language messages for malformed formulas", () => {
        const bad = {
            "=SUM(A1:A3": /never closed/,
            "=(1+2": /not closed/,
            "=1+2)": /closing bracket without/,
            "=": /nothing after/,
            "=1+": /ends too early/,
            '="abc': /never ends/,
            "=1 2": /Unexpected/,
            "=SUM(1,,)": null,
            "=A1:": /range needs/,
            "=5 ? 3": /not allowed/
        };
        for (const [f, re] of Object.entries(bad)) {
            if (re === null) { assert.doesNotThrow(() => parseFormula(f), f); continue; }
            assert.throws(() => parseFormula(f), (e) => e instanceof FormulaSyntaxError && re.test(e.message), f);
        }
        assert.throws(() => parseFormula("=" + "1+".repeat(MAX_FORMULA_LENGTH)), /longer than/);
        assert.throws(() => parseFormula("=" + "(".repeat(40) + "1" + ")".repeat(40)), /nested/);
    });

    it("never runs formula text as code", () => {
        for (const f of ["=alert(1)", "=constructor", "=__proto__", "=SUM(constructor)", '=" + process.exit() + "', "=Function('return 1')()"]) {
            let out;
            assert.doesNotThrow(() => { out = calc(f); }, f);
            assert.match(String(out), /^(#NAME\?|#VALUE!|.*)$/s);
        }
        assert.equal(calc("=alert(1)"), "#NAME?");
    });

    it("shifts relative references when a formula is copied, keeps absolute ones, and gives #REF! off the sheet", () => {
        assert.equal(shiftFormula("=A1+B2", 1, 1), "=B2+C3");
        assert.equal(shiftFormula("=$A$1+B2", 2, 3), "=$A$1+E4");
        assert.equal(shiftFormula("=$A1+B$2", 1, 1), "=$A2+C$2");
        assert.equal(shiftFormula("=SUM(A1:A3)", 0, 1), "=SUM(B1:B3)");
        assert.equal(shiftFormula('="A1"&A1', 1, 0), '="A1"&A2');
        assert.equal(shiftFormula("=A1", -1, 0), "=#REF!");
        assert.equal(shiftFormula("hello", 1, 1), "hello");
    });

    it("tokenizes functions, references and names apart", () => {
        const types = tokenize("SUM(A1, b2:C3, TRUE, Tax)").map((t) => t.type);
        assert.deepEqual(types, ["func", "(", "ref", ",", "ref", ":", "ref", ",", "bool", ",", "name", ")"]);
    });

});

describe("Excel engine: arithmetic, comparison and text operators", () => {

    it("calculates numbers, and reports division by zero", () => {
        assert.equal(calc("=7/2"), "3.5");
        assert.equal(calc("=1/0"), "#DIV/0!");
        assert.equal(calc("=0.1+0.2"), "0.3");
        assert.equal(calc("=2^0.5*2^0.5"), "2");
        assert.equal(calc("=A1/B1", { A1: 6, B1: 4 }), "1.5");
        assert.equal(calc("=A1/B1", { A1: 6 }), "#DIV/0!");
    });

    it("treats text numbers as numbers in arithmetic, and other text as #VALUE!", () => {
        assert.equal(calc("=A1+1", { A1: " 5 " }), "6");
        assert.equal(calc('="3"+4'), "7");
        assert.equal(calc('="abc"+1'), "#VALUE!");
        assert.equal(calc("=TRUE+1"), "2");
        assert.equal(calc("=A1+1", { A1: "" }), "1");
    });

    it("compares text without regard to capitals, and orders numbers before text", () => {
        assert.equal(calc('="Pune"="PUNE"'), "TRUE");
        assert.equal(calc('=1<"a"'), "TRUE");
        assert.equal(calc('="a"<"b"'), "TRUE");
        assert.equal(calc("=A1=0", {}), "TRUE");
        assert.equal(calc('=A1=""', {}), "TRUE");
    });

    it("joins with & and writes numbers the way a general-format cell would", () => {
        assert.equal(calc('="Total: "&5'), "Total: 5");
        assert.equal(calc('=1/3&""'), "0.333333333333333");
        assert.equal(calc('=A1&B1', { A1: "x", B1: 2 }), "x2");
    });

});

describe("Excel engine: aggregate and counting functions", () => {

    const data = { A1: 10, A2: 20, A3: 30, A4: "text", A5: "", A6: 40 };

    it("SUM, AVERAGE, MIN, MAX, MEDIAN, PRODUCT ignore text and blanks inside a range", () => {
        assert.equal(calc("=SUM(A1:A6)", data), "100");
        assert.equal(calc("=AVERAGE(A1:A6)", data), "25");
        assert.equal(calc("=MIN(A1:A6)", data), "10");
        assert.equal(calc("=MAX(A1:A6)", data), "40");
        assert.equal(calc("=MEDIAN(A1:A6)", data), "25");
        assert.equal(calc("=PRODUCT(A1:A3)", data), "6000");
        assert.equal(calc("=MEDIAN(1,2,3)"), "2");
    });

    it("typed arguments are converted but text in a range is not", () => {
        assert.equal(calc('=SUM(1,"2",TRUE)'), "4");
        assert.equal(calc('=SUM("x",1)'), "#VALUE!");
        assert.equal(calc("=AVERAGE(A1:A2)", { A1: "a" }), "#DIV/0!");
        assert.equal(calc("=MAX(A1:A2)", {}), "0");
    });

    it("COUNT, COUNTA and COUNTBLANK count different things", () => {
        assert.equal(calc("=COUNT(A1:A6)", data), "4");
        assert.equal(calc("=COUNTA(A1:A6)", data), "5");
        assert.equal(calc("=COUNTBLANK(A1:A6)", data), "1");
        assert.equal(calc("=COUNTBLANK(B1:B3)", {}), "3");
    });

    it("an error value inside a range is returned by SUM", () => {
        assert.equal(calc("=SUM(A1:A2)", { A1: 1, A2: "=1/0" }), "#DIV/0!");
    });

});

describe("Excel engine: conditional functions", () => {

    const sales = {
        A1: "North", B1: 100, C1: "Pen",
        A2: "South", B2: 250, C2: "Pen",
        A3: "North", B3: 75, C3: "Book",
        A4: "East", B4: 300, C4: "Book",
        A5: "north", B5: 50, C5: "Pen"
    };

    it("SUMIF and COUNTIF match text without regard to capitals and accept comparison operators", () => {
        assert.equal(calc('=SUMIF(A1:A5,"North",B1:B5)', sales), "225");
        assert.equal(calc('=COUNTIF(A1:A5,"North")', sales), "3");
        assert.equal(calc('=COUNTIF(B1:B5,">100")', sales), "2");
        assert.equal(calc('=COUNTIF(B1:B5,">=100")', sales), "3");
        assert.equal(calc('=COUNTIF(B1:B5,"<>100")', sales), "4");
        assert.equal(calc('=SUMIF(B1:B5,">100")', sales), "550");
        assert.equal(calc("=COUNTIF(B1:B5,50)", sales), "1");
    });

    it("wildcards and blanks in criteria", () => {
        assert.equal(calc('=COUNTIF(A1:A5,"*th")', sales), "4");
        assert.equal(calc('=COUNTIF(A1:A5,"N?rth")', sales), "3");
        assert.equal(calc('=COUNTIF(A1:A5,"")', { ...sales, A6: "" }), "0");
        assert.equal(calc('=COUNTIF(D1:D3,"")', {}), "3");
    });

    it("SUMIFS, COUNTIFS, AVERAGEIF(S), MAXIFS and MINIFS combine conditions", () => {
        assert.equal(calc('=SUMIFS(B1:B5,A1:A5,"North",C1:C5,"Pen")', sales), "150");
        assert.equal(calc('=COUNTIFS(A1:A5,"North",B1:B5,">60")', sales), "2");
        assert.equal(calc('=AVERAGEIF(C1:C5,"Pen",B1:B5)', sales), "133.333333333333");
        assert.equal(calc('=AVERAGEIFS(B1:B5,C1:C5,"Book",B1:B5,">0")', sales), "187.5");
        assert.equal(calc('=MAXIFS(B1:B5,C1:C5,"Pen")', sales), "250");
        assert.equal(calc('=MINIFS(B1:B5,C1:C5,"Book")', sales), "75");
        assert.equal(calc('=AVERAGEIF(C1:C5,"Pencil",B1:B5)', sales), "#DIV/0!");
    });

    it("SUMPRODUCT multiplies matching cells and adds", () => {
        assert.equal(calc("=SUMPRODUCT(A1:A3,B1:B3)", { A1: 2, A2: 3, A3: 4, B1: 10, B2: 20, B3: 30 }), "200");
        assert.equal(calc("=SUMPRODUCT(A1:A3,B1:B2)", { A1: 1 }), "#VALUE!");
    });

});

describe("Excel engine: decisions", () => {

    it("IF, IFS, AND, OR, NOT and IFERROR", () => {
        assert.equal(calc('=IF(A1>=50,"Pass","Fail")', { A1: 50 }), "Pass");
        assert.equal(calc('=IF(A1>=50,"Pass","Fail")', { A1: 49 }), "Fail");
        assert.equal(calc("=IF(1>2,5)"), "FALSE");
        assert.equal(calc('=IFS(A1>=90,"A",A1>=75,"B",A1>=60,"C",TRUE,"D")', { A1: 80 }), "B");
        assert.equal(calc("=IFS(1>2,1)"), "#N/A");
        assert.equal(calc("=AND(1<2,2<3)"), "TRUE");
        assert.equal(calc("=AND(1<2,2>3)"), "FALSE");
        assert.equal(calc("=OR(1>2,2<3)"), "TRUE");
        assert.equal(calc("=NOT(1>2)"), "TRUE");
        assert.equal(calc('=IFERROR(1/0,"none")'), "none");
        assert.equal(calc('=IFERROR(4/2,"none")'), "2");
        assert.equal(calc('=IFNA(VLOOKUP(9,A1:B2,2,FALSE),"missing")', { A1: 1, B1: "x", A2: 2, B2: "y" }), "missing");
    });

    it("IF does not evaluate the branch it does not use", () => {
        assert.equal(calc("=IF(TRUE,1,1/0)"), "1");
        assert.equal(calc("=IF(FALSE,1/0,2)"), "2");
    });

    it("IS functions and CHOOSE", () => {
        assert.equal(calc("=ISNUMBER(A1)", { A1: 5 }), "TRUE");
        assert.equal(calc("=ISNUMBER(A1)", { A1: "5x" }), "FALSE");
        assert.equal(calc("=ISBLANK(A1)", {}), "TRUE");
        assert.equal(calc("=ISERROR(1/0)"), "TRUE");
        assert.equal(calc("=ISTEXT(A1)", { A1: "a" }), "TRUE");
        assert.equal(calc('=CHOOSE(2,"a","b","c")'), "b");
        assert.equal(calc('=CHOOSE(4,"a","b","c")'), "#VALUE!");
    });

});

describe("Excel engine: rounding and numbers", () => {

    it("ROUND rounds halves away from zero, including the classic 1.005 and negative cases", () => {
        assert.equal(calc("=ROUND(2.5,0)"), "3");
        assert.equal(calc("=ROUND(-2.5,0)"), "-3");
        assert.equal(calc("=ROUND(1.005,2)"), "1.01");
        assert.equal(calc("=ROUND(1234.567,-2)"), "1200");
        assert.equal(calc("=ROUND(3.14159,3)"), "3.142");
    });

    it("ROUNDUP and ROUNDDOWN move away from and toward zero", () => {
        assert.equal(calc("=ROUNDUP(3.141,2)"), "3.15");
        assert.equal(calc("=ROUNDUP(-3.141,2)"), "-3.15");
        assert.equal(calc("=ROUNDDOWN(3.999,2)"), "3.99");
        assert.equal(calc("=ROUNDDOWN(-3.999,2)"), "-3.99");
    });

    it("INT floors, MOD takes the sign of the divisor, ABS, POWER and SQRT", () => {
        assert.equal(calc("=INT(-3.2)"), "-4");
        assert.equal(calc("=INT(3.9)"), "3");
        assert.equal(calc("=MOD(10,3)"), "1");
        assert.equal(calc("=MOD(-10,3)"), "2");
        assert.equal(calc("=MOD(10,-3)"), "-2");
        assert.equal(calc("=MOD(5,0)"), "#DIV/0!");
        assert.equal(calc("=ABS(-4.5)"), "4.5");
        assert.equal(calc("=POWER(2,10)"), "1024");
        assert.equal(calc("=SQRT(81)"), "9");
        assert.equal(calc("=SQRT(-1)"), "#NUM!");
    });

});

describe("Excel engine: text functions", () => {

    it("LEFT, RIGHT, MID, LEN", () => {
        assert.equal(calc('=LEFT("Spreadsheet",6)'), "Spread");
        assert.equal(calc('=RIGHT("Spreadsheet",5)'), "sheet");
        assert.equal(calc('=MID("Spreadsheet",7,3)'), "she");
        assert.equal(calc('=LEFT("abc")'), "a");
        assert.equal(calc('=LEN("  hi ")'), "5");
        assert.equal(calc("=LEN(12345)"), "5");
        assert.equal(calc('=MID("abc",0,2)'), "#VALUE!");
    });

    it("TRIM removes outer spaces and collapses inner runs; UPPER, LOWER and PROPER", () => {
        assert.equal(calc('="["&TRIM("  a   b  ")&"]"'), "[a b]");
        assert.equal(calc('=UPPER("Mixed Case")'), "MIXED CASE");
        assert.equal(calc('=LOWER("Mixed Case")'), "mixed case");
        assert.equal(calc('=PROPER("jOHN o\'neil-smith")'), "John O'Neil-Smith");
    });

    it("FIND is case sensitive and SEARCH is not; both give #VALUE! when nothing is found", () => {
        assert.equal(calc('=FIND("b","abcB")'), "2");
        assert.equal(calc('=FIND("B","abcB")'), "4");
        assert.equal(calc('=SEARCH("B","abcB")'), "2");
        assert.equal(calc('=FIND("z","abc")'), "#VALUE!");
        assert.equal(calc('=FIND("a","banana",3)'), "4");
    });

    it("SUBSTITUTE replaces every match or only the chosen one", () => {
        assert.equal(calc('=SUBSTITUTE("a-b-c","-","/")'), "a/b/c");
        assert.equal(calc('=SUBSTITUTE("a-b-c","-","/",2)'), "a-b/c");
        assert.equal(calc('=SUBSTITUTE("abc","x","y")'), "abc");
    });

    it("CONCAT, CONCATENATE, TEXTJOIN, REPT, EXACT, VALUE", () => {
        assert.equal(calc('=CONCAT("a",1,TRUE)'), "a1TRUE");
        assert.equal(calc("=CONCATENATE(A1,\" \",B1)", { A1: "Ada", B1: "Lovelace" }), "Ada Lovelace");
        assert.equal(calc('=TEXTJOIN(", ",TRUE,A1:A4)', { A1: "x", A2: "", A3: "y", A4: "z" }), "x, y, z");
        assert.equal(calc('=TEXTJOIN("-",FALSE,A1:A3)', { A1: "x", A3: "z" }), "x--z");
        assert.equal(calc('=REPT("ab",3)'), "ababab");
        assert.equal(calc('=EXACT("a","A")'), "FALSE");
        assert.equal(calc('=VALUE("12.5")'), "12.5");
        assert.equal(calc('=VALUE("12%")'), "0.12");
        assert.equal(calc('=VALUE("abc")'), "#VALUE!");
    });

});

describe("Excel engine: dates", () => {

    it("DATE gives serial numbers (45292 is 1 January 2024) and carries overflow like Excel", () => {
        assert.equal(calc("=DATE(2024,1,1)"), "45292");
        assert.equal(calc("=DATE(2024,1,31)+1"), "45323");
        assert.equal(calc("=DATE(2024,13,1)"), "45658"); // 1 January 2025
        assert.equal(calc("=DATE(2024,3,0)"), "45351"); // 29 February 2024
        assert.equal(calc("=DATE(1900,1,1)"), "#NUM!");
    });

    it("YEAR, MONTH, DAY and WEEKDAY read a serial number", () => {
        assert.equal(calc("=YEAR(45292)"), "2024");
        assert.equal(calc("=MONTH(45292)"), "1");
        assert.equal(calc("=DAY(45322)"), "31");
        assert.equal(calc("=WEEKDAY(45292)"), "2"); // Monday, Sunday = 1
        assert.equal(calc("=WEEKDAY(45292,2)"), "1"); // Monday = 1
        assert.equal(calc("=WEEKDAY(45292,3)"), "0");
    });

    it("EDATE and EOMONTH move by months and clamp to the end of a shorter month", () => {
        assert.equal(calc("=DAY(EDATE(DATE(2024,1,31),1))"), "29");
        assert.equal(calc("=MONTH(EDATE(DATE(2024,1,31),1))"), "2");
        assert.equal(calc("=EDATE(DATE(2024,5,15),-5)"), calc("=DATE(2023,12,15)"));
        assert.equal(calc("=EOMONTH(DATE(2024,2,10),0)"), calc("=DATE(2024,2,29)"));
        assert.equal(calc("=EOMONTH(DATE(2024,11,10),2)"), calc("=DATE(2025,1,31)"));
    });

    it("DAYS counts the days between two dates", () => {
        assert.equal(calc("=DAYS(DATE(2024,3,1),DATE(2024,2,1))"), "29");
    });

});

describe("Excel engine: lookups", () => {

    const table = { A1: "ID", B1: "Name", C1: "Price", A2: 101, B2: "Pen", C2: 10, A3: 102, B3: "Book", C3: 120, A4: 105, B4: "Bag", C4: 900 };

    it("VLOOKUP exact and approximate match", () => {
        assert.equal(calc("=VLOOKUP(102,A2:C4,2,FALSE)", table), "Book");
        assert.equal(calc("=VLOOKUP(103,A2:C4,3,FALSE)", table), "#N/A");
        assert.equal(calc("=VLOOKUP(104,A2:C4,3,TRUE)", table), "120");
        assert.equal(calc("=VLOOKUP(104,A2:C4,3)", table), "120");
        assert.equal(calc("=VLOOKUP(100,A2:C4,3,TRUE)", table), "#N/A");
        assert.equal(calc("=VLOOKUP(101,A2:C4,4,FALSE)", table), "#REF!");
    });

    it("a text number does not match a real number in an exact lookup", () => {
        assert.equal(calc('=VLOOKUP("102",A2:C4,2,FALSE)', table), "#N/A");
        assert.equal(calc('=VLOOKUP("pen",B2:C4,2,FALSE)', table), "10");
        assert.equal(calc('=VLOOKUP("pen ",B2:C4,2,FALSE)', table), "#N/A");
    });

    it("INDEX and MATCH, alone and together", () => {
        assert.equal(calc("=MATCH(105,A2:A4,0)", table), "3");
        assert.equal(calc("=MATCH(104,A2:A4,1)", table), "2");
        assert.equal(calc("=MATCH(7,A2:A4,0)", table), "#N/A");
        assert.equal(calc("=INDEX(B2:C4,3,2)", table), "900");
        assert.equal(calc("=INDEX(B2:B4,2)", table), "Book");
        assert.equal(calc("=INDEX(B2:B4,9)", table), "#REF!");
        assert.equal(calc("=INDEX(C2:C4,MATCH(\"Bag\",B2:B4,0))", table), "900");
    });

    it("HLOOKUP and XLOOKUP", () => {
        const h = { A1: "Q1", B1: "Q2", C1: "Q3", A2: 10, B2: 20, C2: 30 };
        assert.equal(calc('=HLOOKUP("Q2",A1:C2,2,FALSE)', h), "20");
        assert.equal(calc("=XLOOKUP(102,A2:A4,C2:C4)", table), "120");
        assert.equal(calc('=XLOOKUP(7,A2:A4,C2:C4,"none")', table), "none");
        assert.equal(calc("=XLOOKUP(7,A2:A4,C2:C4)", table), "#N/A");
        assert.equal(calc("=XLOOKUP(104,A2:A4,C2:C4,\"none\",-1)", table), "120");
        assert.equal(calc("=XLOOKUP(104,A2:A4,C2:C4,\"none\",1)", table), "900");
    });

});

describe("Excel engine: finance", () => {

    it("PMT, FV and PV follow the standard annuity formulas", () => {
        // 5,00,000 over 60 months at 9% a year: payment 10,379.18 (worked out separately in Python)
        assert.equal(calc("=ROUND(PMT(0.09/12,60,-500000),2)"), "10379.18");
        assert.equal(calc("=ROUND(PMT(0,10,-1000),2)"), "100");
        // 1,000 a month for 12 months at 12% a year: future value 12,682.50
        assert.equal(calc("=ROUND(FV(0.01,12,-1000),2)"), "12682.5");
        assert.equal(calc("=ROUND(PV(0.01,12,-1000),2)"), "11255.08");
        assert.equal(calc("=ROUND(FV(0.05,2,0,-100),2)"), "110.25");
    });

});

describe("Excel engine: the sheet", () => {

    it("calculates cells that use other cells, and recalculates after a change", () => {
        const s = createSheet({ A1: 2, A2: 3, A3: "=A1*A2", A4: "=A3+1" });
        assert.equal(display(s.value("A4")), "7");
        s.set("A1", 10);
        assert.equal(display(s.value("A4")), "31");
    });

    it("detects circular references instead of looping", () => {
        const s = createSheet({ A1: "=B1+1", B1: "=A1+1" });
        assert.ok(isErr(s.value("A1")));
        assert.equal(display(s.evaluate("=Z99+1", "Z99")), "#REF!");
    });

    it("reports unsupported functions as #NAME? with a message, and never invents a value", () => {
        const s = createSheet({});
        const v = s.evaluate("=TODAY()", "A1");
        assert.equal(display(v), "#NAME?");
        assert.match(v.note, /does not support the function TODAY/);
        for (const f of ["NOW", "RAND", "FILTER", "UNIQUE", "SORT", "LET", "LAMBDA", "TEXT", "OFFSET", "INDIRECT", "SEQUENCE"]) assert.equal(display(s.evaluate(`=${f}(1)`, "A1")), "#NAME?", f);
    });

    it("limits a range to 2,000 cells", () => {
        assert.equal(calc("=SUM(A1:Z100)"), "#VALUE!");
    });

    it("a range used where one value is needed is an error, not a guess", () => {
        assert.equal(calc("=A1:A2+1", { A1: 1, A2: 2 }), "#VALUE!");
    });

    it("the supported list is the documented one and every error value has an explanation", () => {
        for (const f of ["SUM", "VLOOKUP", "XLOOKUP", "INDEX", "MATCH", "IF", "IFERROR", "SUMIFS", "COUNTIFS", "PMT", "TEXTJOIN", "EDATE"]) assert.ok(SUPPORTED.includes(f), f);
        for (const code of ["#DIV/0!", "#N/A", "#VALUE!", "#REF!", "#NAME?", "#NUM!"]) assert.ok(ERROR_HELP[code].length > 30, code);
    });

});
