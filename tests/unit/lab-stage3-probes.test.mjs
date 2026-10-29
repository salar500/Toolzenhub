/**
 * Stage 3 probes: cases written from the requirements and from RFC 8259, not from the implementation.
 *
 * - JSON lab: equal numbers written differently are the same value (RFC 8259 leaves precision to the receiver; the page says
 *   numbers are compared as double-precision values); a code kept as text is not a number; the Windows-path trap, where fixing only
 *   the invalid escapes leaves a valid \n that silently becomes a line break.
 * - Python's json module reads the same answers (an independent parser) and must agree with the lab on every verdict here.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

globalThis.window = { location: { hostname: "salar500.github.io", pathname: "/" } };

let set, evaluate;
before(async () => {
    ({ set } = await import("../../assets/js/tools/json-error-fixing-lab/exercises.js"));
    ({ evaluate } = await import("../../assets/js/tools/json-error-fixing-lab/evaluator.js"));
});

const ex = (id) => set.exercises.find((e) => e.id === id);
const verdict = (id, text) => evaluate(ex(id), text).verdict;

const probe = spawnSync("python", ["-I", "-c", "print('ok')"], { encoding: "utf8" });
const skip = probe.status === 0 ? false : "python is not available on this machine";

describe("JSON lab: number forms and the escape trap", () => {

    it("the same number written in other forms is correct; a different number is not", () => {
        for (const b of ["1", "1.0", "1e0", "1E0", "10e-1", "0.1e1"]) assert.equal(verdict("jef-number-forms", `{"a":0.5,"b":${b},"c":3,"d":31}`), "correct", b);
        for (const b of ["2", "0", "-1", "1.1", '"1"', "true", "null"]) assert.notEqual(verdict("jef-number-forms", `{"a":0.5,"b":${b},"c":3,"d":31}`), "correct", b);
    });

    it("a code kept as text is not the same as the number", () => {
        assert.equal(verdict("jef-leading-zero", '{"zip":"07030","qty":7}'), "correct");
        for (const bad of ['{"zip":7030,"qty":7}', '{"zip":"7030","qty":7}', '{"zip":"07030","qty":"7"}', '{"zip":"07030","qty":"007"}']) assert.equal(verdict("jef-leading-zero", bad), "not-yet", bad);
    });

    it("the Windows-path trap: fixing only the invalid escapes still holds a line break and is not the asked value", () => {
        const wanted = '{"path": "C:\\\\Users\\\\amy\\\\notes.txt"}';
        assert.equal(verdict("jef-bad-escape", wanted), "correct");
        const onlyInvalidFixed = '{"path": "C:\\\\Users\\\\amy\\notes.txt"}'; // \\ \\ then a single \n
        assert.equal(verdict("jef-bad-escape", onlyInvalidFixed), "not-yet");
        assert.equal(verdict("jef-bad-escape", '{"path": "C:\\Users\\amy\\notes.txt"}'), "not-yet"); // still invalid JSON
    });

    it("Python's json module agrees with the lab on whether each of these answers is valid", { skip }, () => {
        const answers = [
            '{"a":0.5,"b":1.0,"c":3,"d":31}', '{"a":5e-1,"b":1e0,"c":3.00,"d":31}', '{"a":0.5,"b":1.,"c":3,"d":31}', '{"a":.5,"b":1,"c":3,"d":31}',
            '{"a":0.5,"b":1,"c":+3,"d":31}', '{"a":0.5,"b":1,"c":3,"d":0x1F}', '{"a":0.5,"b":1,"c":3,"d":31,}', "{'a':0.5}", '{"a":0.5 "b":1}',
            '{"zip":"07030","qty":007}', '{"path":"C:\\\\Users"}', '{"path":"C:\\Users"}', '{"a":[1,2,,3]}', '{"x":NaN}', '{"x":01}', '{"x":-0}'
        ];
        const script = String.raw`
import sys, json
def reject(c): raise ValueError("constant")
out = []
for t in json.loads(sys.stdin.buffer.read().decode("utf-8")):
    try:
        json.loads(t, parse_constant=reject)
        out.append(True)
    except ValueError:
        out.append(False)
sys.stdout.write(json.dumps(out))
`;
        const run = spawnSync("python", ["-I", "-c", script], { input: JSON.stringify(answers), encoding: "utf8" });
        assert.equal(run.status, 0, run.stderr);
        const py = JSON.parse(run.stdout);
        const dummy = ex("jef-trailing-comma");
        answers.forEach((t, i) => {
            const mine = evaluate(dummy, t).summary !== "The text is still not valid JSON.";
            assert.equal(mine, py[i], t);
        });
        assert.ok(py.some(Boolean) && py.some((v) => !v));
    });

});
