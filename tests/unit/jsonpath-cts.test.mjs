/**
 * JSONPath Tester against the community JSONPath Compliance Test Suite (RFC 9535), an independent oracle.
 * Fixture: tests/fixtures/jsonpath-cts (BSD-2; commit and licence in SOURCE.txt, LICENSE and NOTICE).
 *
 * The tool does not implement match() and search() (stated on the page), so the 56 tests whose selector uses
 * them are skipped and counted, not hidden. Every other test must pass: values, paths, and refused selectors.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { evaluateQuery, valuesText } from "../../assets/js/tools/jsonpath-tester/jsonpath-engine.js";
import { normalizedPath } from "../../assets/js/tools/json-tree/json-tree.js";

const cts = JSON.parse(readFileSync(new URL("../fixtures/jsonpath-cts/cts.json", import.meta.url), "utf8"));

const usesUnsupportedFunction = (selector) => /\b(match|search)\s*\(/.test(selector);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

test("the suite file is the one that was recorded", () => {
    assert.equal(cts.tests.length, 715);
});

test("every CTS test that does not use match() or search() passes (values, normalized paths, refused selectors)", () => {

    let passed = 0;
    let skipped = 0;
    const failures = [];

    for (const t of cts.tests) {

        if (usesUnsupportedFunction(t.selector)) {
            skipped++;
            continue;
        }

        const r = evaluateQuery(JSON.stringify("document" in t ? t.document : {}), t.selector);

        if (t.invalid_selector) {
            if (r.state === "blocked" && r.query.status === "invalid") passed++;
            else failures.push(`${t.name}: ${t.selector} should be refused, got ${r.state}`);
            continue;
        }

        if (r.state !== "done") {
            failures.push(`${t.name}: ${t.selector} gave ${r.state}`);
            continue;
        }

        const values = JSON.parse(valuesText(r));
        const paths = r.nodes.map((n) => normalizedPath(n.path));
        const okValues = t.result ? same(values, t.result) : t.results.some((x) => same(values, x));
        const wanted = t.result_paths ?? t.results_paths;
        const okPaths = !wanted || (t.result_paths ? same(paths, t.result_paths) : t.results_paths.some((x) => same(paths, x)));

        if (okValues && okPaths) passed++;
        else failures.push(`${t.name}: ${t.selector} ${okValues ? "paths differ" : "values differ"}`);
    }

    assert.deepEqual(failures, []);
    assert.equal(skipped, 56);
    assert.equal(passed, 659);
});
