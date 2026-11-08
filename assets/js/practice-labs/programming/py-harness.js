/* =========================================================
   ToolZen Hub
   Python exercises: the test harness, written in Python. The browser runs it in Pyodide (py-worker.js); the unit test
   runs the same text with the local CPython to pin every exercise, so both judge answers identically.
   __tz_run(code, fn, tests_json) -> JSON text { error, results: [{ call, ok, got, want }], passed, total, logs }
========================================================= */

export const HARNESS = String.raw`
import io as __tz_io, json as __tz_json, sys as __tz_sys

def __tz_show(v):
    try:
        return __tz_json.dumps(v)
    except Exception:
        return repr(v)

def __tz_body(code, fn, tests, res):
    ns = {"__name__": "__main__"}
    try:
        exec(compile(code, "<your code>", "exec"), ns)
    except Exception as e:
        res["error"] = type(e).__name__ + ": " + str(e)
        return
    f = ns.get(fn)
    if not callable(f):
        res["error"] = "No function named " + fn + " was found. Keep the name from the starter code."
        return
    for t in tests:
        args = __tz_json.loads(__tz_json.dumps(t["args"]))
        call = fn + "(" + ", ".join(__tz_show(a) for a in t["args"]) + ")"
        want = ("an error " + t["raises"]) if "raises" in t else __tz_show(t["expect"])
        try:
            got = f(*args)
            if "raises" in t:
                ok = False
            else:
                try:
                    norm = __tz_json.loads(__tz_json.dumps(got))
                    ok = norm == t["expect"] and type(norm) == type(t["expect"])
                except Exception:
                    ok = False
            shown = __tz_show(got)
        except Exception as e:
            ok = "raises" in t and type(e).__name__ == t["raises"]
            shown = "error " + type(e).__name__ + ": " + str(e)
        res["results"].append({"call": call, "ok": ok, "got": shown, "want": want})
    res["passed"] = sum(1 for r in res["results"] if r["ok"])

def __tz_run(code, fn, tests_json):
    tests = __tz_json.loads(tests_json)
    res = {"error": None, "results": [], "passed": 0, "total": len(tests), "logs": ""}
    out = __tz_io.StringIO()
    old = __tz_sys.stdout
    __tz_sys.stdout = out
    try:
        __tz_body(code, fn, tests, res)
    finally:
        __tz_sys.stdout = old
    res["logs"] = out.getvalue()[:4000]
    return __tz_json.dumps(res)
`;
