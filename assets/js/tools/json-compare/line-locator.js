/* =========================================================
   ToolZen Hub
   JSON Compare: where a value sits in the text

   locateLines(text) reads text that has already been accepted as strict JSON and returns a function line(path) giving the
   1-based line on which the value at that path starts (for an object member, the line of its key). A path is the list of
   keys (strings) and positions (numbers) used by the comparison. With a repeated key the first occurrence is used, as the
   comparison does. Nothing runs at import; no DOM; no eval.
========================================================= */

const SEP = "\u0000";

export function locateLines(text) {

    const lines = new Map();
    let i = 0;
    let line = 1;

    function skip() {
        for (; i < text.length; i += 1) {
            const c = text[i];
            if (c === "\n") line += 1;
            else if (c !== " " && c !== "\t" && c !== "\r") return;
        }
    }

    function string() {
        // at the opening quote
        let out = "";
        i += 1;
        while (i < text.length && text[i] !== '"') {
            if (text[i] === "\\") {
                const n = text[i + 1];
                if (n === "u") { out += String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16)); i += 6; continue; }
                out += { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" }[n] ?? n;
                i += 2;
                continue;
            }
            out += text[i];
            i += 1;
        }
        i += 1;
        return out;
    }

    function value(path, startLine) {
        const key = path.map((p) => (typeof p === "number" ? `#${p}` : `k${p}`)).join(SEP);
        if (!lines.has(key)) lines.set(key, startLine);
        const c = text[i];
        if (c === "{") {
            i += 1;
            skip();
            if (text[i] === "}") { i += 1; return; }
            for (;;) {
                skip();
                const keyLine = line;
                const name = string();
                skip();
                i += 1; // the colon
                skip();
                value([...path, name], keyLine);
                skip();
                if (text[i] === ",") { i += 1; continue; }
                i += 1; // the closing brace
                return;
            }
        }
        if (c === "[") {
            i += 1;
            skip();
            if (text[i] === "]") { i += 1; return; }
            for (let n = 0; ; n += 1) {
                skip();
                value([...path, n], line);
                skip();
                if (text[i] === ",") { i += 1; continue; }
                i += 1; // the closing bracket
                return;
            }
        }
        if (c === '"') { string(); return; }
        while (i < text.length && !" \t\r\n,]}".includes(text[i])) i += 1;
    }

    try {
        skip();
        value([], line);
    } catch {
        return () => null;
    }

    return (path) => lines.get(path.map((p) => (typeof p === "number" ? `#${p}` : `k${p}`)).join(SEP)) ?? null;
}
