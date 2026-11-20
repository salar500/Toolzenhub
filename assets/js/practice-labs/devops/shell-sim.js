/* =========================================================
   ToolZen Hub
   Linux path: a teaching model of a Bash-like shell over an in-memory file system. Deterministic, nothing touches the
   learner's computer. It follows GNU coreutils behaviour for the subset it supports and says so for anything else.

   Commands: pwd, ls [-a] [-l], cd, cat, head/tail [-n N], wc [-l], grep [-i] [-n] [-c] [-v], sort [-r] [-n], uniq [-c],
   cut -d X -f N, echo, mkdir [-p], touch, cp, mv, rm [-r], find PATH -name GLOB, chmod (+x, -x or octal), whoami, clear.
   Pipes (|), output redirection (> and >>) and && work between them. Listings sort as in the C locale (capitals first).
========================================================= */

const HOME = "/home/asha";
const SUPPORTED = "pwd, ls, cd, cat, head, tail, wc, grep, sort, uniq, cut, echo, mkdir, touch, cp, mv, rm, find, chmod, whoami";

/** a shell from a scenario { files: { "/abs/path": "content" | null (directory) }, cwd? } */
export function createShell(scenario) {
    const fs = new Map([["/", { dir: true }], ["/home", { dir: true }], [HOME, { dir: true }]]);
    for (const [path, content] of Object.entries(scenario.files)) {
        const parts = path.split("/").filter(Boolean);
        for (let i = 1; i < parts.length; i++) { const d = `/${parts.slice(0, i).join("/")}`; if (!fs.has(d)) fs.set(d, { dir: true }); }
        fs.set(path, content === null ? { dir: true } : { dir: false, content, mode: path.endsWith(".sh") ? "644" : "644" });
    }
    return { fs, cwd: scenario.cwd ?? HOME, last: { command: "", output: "" } };
}

const parent = (p) => (p === "/" ? "/" : p.slice(0, p.lastIndexOf("/")) || "/");
const base = (p) => p.slice(p.lastIndexOf("/") + 1);

export function resolve(sh, path) {
    let p = path === "~" || path.startsWith("~/") ? HOME + path.slice(1) : path;
    if (!p.startsWith("/")) p = `${sh.cwd === "/" ? "" : sh.cwd}/${p}`;
    const out = [];
    for (const part of p.split("/")) { if (!part || part === ".") continue; if (part === "..") out.pop(); else out.push(part); }
    return `/${out.join("/")}`;
}

const children = (sh, dir) => [...sh.fs.keys()].filter((k) => k !== dir && parent(k) === dir).map(base).sort();
const lines = (text) => (text === "" ? [] : text.replace(/\n$/, "").split("\n"));
const join = (arr) => (arr.length ? `${arr.join("\n")}\n` : "");
const glob = (pattern) => new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`);

function tokenize(line) {
    const out = [];
    for (const m of line.matchAll(/"([^"]*)"|'([^']*)'|(\|)|(>>|>)|([^\s|>"']+)/g)) out.push(m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5]);
    return out;
}

class ShellError extends Error {}
const fail = (msg) => { throw new ShellError(msg); };

function readFile(sh, name, cmd) {
    const p = resolve(sh, name), node = sh.fs.get(p);
    if (!node) fail(`${cmd}: ${name}: No such file or directory`);
    if (node.dir) fail(`${cmd}: ${name}: Is a directory`);
    return node.content;
}

function inputOf(sh, files, stdin, cmd) {
    return files.length ? files.map((f) => readFile(sh, f, cmd)).join("") : stdin;
}

function flagsAndArgs(args) {
    const flags = new Set(), rest = [];
    for (const a of args) { if (/^-[a-zA-Z]+$/.test(a)) for (const c of a.slice(1)) flags.add(c); else rest.push(a); }
    return { flags, rest };
}

function numOpt(args, def) {
    const i = args.indexOf("-n");
    if (i >= 0) { const n = Number(args[i + 1]); args.splice(i, 2); return n; }
    const short = args.findIndex((a) => /^-\d+$/.test(a));
    if (short >= 0) { const n = Number(args[short].slice(1)); args.splice(short, 1); return n; }
    return def;
}

const COMMANDS = {
    pwd: (sh) => `${sh.cwd}\n`,
    whoami: () => "asha\n",
    clear: () => "",
    ls: (sh, args) => {
        const { flags, rest } = flagsAndArgs(args);
        const target = resolve(sh, rest[0] ?? ".");
        const node = sh.fs.get(target);
        if (!node) fail(`ls: cannot access '${rest[0]}': No such file or directory`);
        const names = node.dir ? children(sh, target).filter((n) => flags.has("a") || !n.startsWith(".")) : [base(target)];
        if (!flags.has("l")) return join(names);
        return join(names.map((n) => {
            const f = node.dir ? sh.fs.get(`${target === "/" ? "" : target}/${n}`) : node;
            const mode = f.dir ? "drwxr-xr-x" : `-${[...f.mode].map((d) => ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"][Number(d)]).join("")}`;
            return `${mode} asha asha ${String(f.dir ? 4096 : f.content.length).padStart(5)} ${n}`;
        }));
    },
    cd: (sh, args) => {
        const target = resolve(sh, args[0] ?? "~");
        const node = sh.fs.get(target);
        if (!node) fail(`cd: ${args[0]}: No such file or directory`);
        if (!node.dir) fail(`cd: ${args[0]}: Not a directory`);
        sh.cwd = target;
        return "";
    },
    cat: (sh, args, stdin) => inputOf(sh, args, stdin, "cat"),
    head: (sh, args, stdin) => { const a = [...args]; const n = numOpt(a, 10); return join(lines(inputOf(sh, a, stdin, "head")).slice(0, n)); },
    tail: (sh, args, stdin) => { const a = [...args]; const n = numOpt(a, 10); const l = lines(inputOf(sh, a, stdin, "tail")); return join(n === 0 ? [] : l.slice(-n)); },
    wc: (sh, args, stdin) => {
        const { flags, rest } = flagsAndArgs(args);
        const text = inputOf(sh, rest, stdin, "wc");
        const l = (text.match(/\n/g) ?? []).length, w = text.split(/\s+/).filter(Boolean).length, c = new TextEncoder().encode(text).length;
        const name = rest.length === 1 ? ` ${rest[0]}` : "";
        return flags.has("l") ? `${l}${name}\n` : `${l} ${w} ${c}${name}\n`;
    },
    grep: (sh, args, stdin) => {
        const { flags, rest } = flagsAndArgs(args);
        if (!rest.length) fail("grep: missing pattern. Usage: grep [-i] [-n] [-c] [-v] PATTERN [FILE]");
        const [pattern, ...files] = rest;
        let re;
        try { re = new RegExp(pattern, flags.has("i") ? "i" : ""); } catch { fail(`grep: invalid pattern '${pattern}'`); }
        const all = lines(inputOf(sh, files, stdin, "grep"));
        const hits = all.map((l, i) => [l, i + 1]).filter(([l]) => re.test(l) !== flags.has("v"));
        if (flags.has("c")) return `${hits.length}\n`;
        return join(hits.map(([l, n]) => (flags.has("n") ? `${n}:${l}` : l)));
    },
    sort: (sh, args, stdin) => {
        const { flags, rest } = flagsAndArgs(args);
        const l = lines(inputOf(sh, rest, stdin, "sort"));
        l.sort(flags.has("n") ? (a, b) => parseFloat(a) - parseFloat(b) : (a, b) => (a < b ? -1 : a > b ? 1 : 0));
        if (flags.has("r")) l.reverse();
        return join(l);
    },
    uniq: (sh, args, stdin) => {
        const { flags, rest } = flagsAndArgs(args);
        const out = [];
        for (const l of lines(inputOf(sh, rest, stdin, "uniq"))) { const last = out[out.length - 1]; if (last && last[0] === l) last[1]++; else out.push([l, 1]); }
        return join(out.map(([l, n]) => (flags.has("c") ? `${String(n).padStart(7)} ${l}` : l)));
    },
    cut: (sh, args, stdin) => {
        const a = [...args];
        let delim = "\t", field = null;
        for (let i = 0; i < a.length; i++) {
            if (a[i] === "-d") { delim = a[i + 1]; a.splice(i, 2); i--; } else if (a[i].startsWith("-d")) { delim = a[i].slice(2); a.splice(i, 1); i--; }
            else if (a[i] === "-f") { field = Number(a[i + 1]); a.splice(i, 2); i--; } else if (a[i].startsWith("-f")) { field = Number(a[i].slice(2)); a.splice(i, 1); i--; }
        }
        if (!field) fail("cut: you must specify a field with -f N (this simulator supports one field)");
        return join(lines(inputOf(sh, a, stdin, "cut")).map((l) => (l.includes(delim) ? l.split(delim)[field - 1] ?? "" : l)));
    },
    echo: (sh, args) => `${args.join(" ")}\n`,
    mkdir: (sh, args) => {
        const { flags, rest } = flagsAndArgs(args);
        for (const d of rest) {
            const p = resolve(sh, d);
            if (sh.fs.has(p)) { if (!flags.has("p")) fail(`mkdir: cannot create directory '${d}': File exists`); continue; }
            if (!sh.fs.has(parent(p))) {
                if (!flags.has("p")) fail(`mkdir: cannot create directory '${d}': No such file or directory`);
                const parts = p.split("/").filter(Boolean);
                for (let i = 1; i < parts.length; i++) { const q = `/${parts.slice(0, i).join("/")}`; if (!sh.fs.has(q)) sh.fs.set(q, { dir: true }); }
            }
            sh.fs.set(p, { dir: true });
        }
        return "";
    },
    touch: (sh, args) => { for (const f of args) { const p = resolve(sh, f); if (!sh.fs.has(parent(p))) fail(`touch: cannot touch '${f}': No such file or directory`); if (!sh.fs.has(p)) sh.fs.set(p, { dir: false, content: "", mode: "644" }); } return ""; },
    cp: (sh, args) => {
        const { flags, rest } = flagsAndArgs(args);
        if (rest.length !== 2) fail("cp: this simulator copies one source to one destination: cp SOURCE DEST");
        const src = resolve(sh, rest[0]), node = sh.fs.get(src);
        if (!node) fail(`cp: cannot stat '${rest[0]}': No such file or directory`);
        if (node.dir && !flags.has("r")) fail(`cp: -r not specified; omitting directory '${rest[0]}'`);
        let dest = resolve(sh, rest[1]);
        if (sh.fs.get(dest)?.dir) dest = `${dest === "/" ? "" : dest}/${base(src)}`;
        if (!sh.fs.has(parent(dest))) fail(`cp: cannot create '${rest[1]}': No such file or directory`);
        for (const [k, v] of [...sh.fs]) if (k === src || k.startsWith(`${src}/`)) sh.fs.set(dest + k.slice(src.length), { ...v });
        return "";
    },
    mv: (sh, args) => {
        if (args.length !== 2) fail("mv: usage: mv SOURCE DEST");
        const src = resolve(sh, args[0]);
        if (!sh.fs.has(src)) fail(`mv: cannot stat '${args[0]}': No such file or directory`);
        let dest = resolve(sh, args[1]);
        if (sh.fs.get(dest)?.dir) dest = `${dest === "/" ? "" : dest}/${base(src)}`;
        if (!sh.fs.has(parent(dest))) fail(`mv: cannot move to '${args[1]}': No such file or directory`);
        for (const [k, v] of [...sh.fs]) if (k === src || k.startsWith(`${src}/`)) { sh.fs.delete(k); sh.fs.set(dest + k.slice(src.length), v); }
        return "";
    },
    rm: (sh, args) => {
        const { flags, rest } = flagsAndArgs(args);
        for (const f of rest) {
            const p = resolve(sh, f), node = sh.fs.get(p);
            if (!node) fail(`rm: cannot remove '${f}': No such file or directory`);
            if (p === HOME || p === "/" || p === "/home") fail(`rm: refusing to remove '${f}' in this simulator`);
            if (node.dir && !flags.has("r")) fail(`rm: cannot remove '${f}': Is a directory`);
            for (const k of [...sh.fs.keys()]) if (k === p || k.startsWith(`${p}/`)) sh.fs.delete(k);
        }
        return "";
    },
    find: (sh, args) => {
        const start = args[0] && !args[0].startsWith("-") ? args[0] : ".";
        const i = args.indexOf("-name"), re = i >= 0 ? glob(args[i + 1] ?? "*") : null;
        const root = resolve(sh, start);
        if (!sh.fs.has(root)) fail(`find: '${start}': No such file or directory`);
        const hits = [...sh.fs.keys()].filter((k) => (k === root || k.startsWith(`${root === "/" ? "" : root}/`)) && (!re || re.test(base(k)))).sort();
        return join(hits.map((k) => (start.startsWith("/") ? k : `${start}${k.slice(root.length)}`)));
    },
    chmod: (sh, args) => {
        if (args.length !== 2) fail("chmod: usage: chmod +x FILE or chmod 755 FILE");
        const [mode, f] = args, p = resolve(sh, f), node = sh.fs.get(p);
        if (!node || node.dir) fail(`chmod: cannot access '${f}': No such file`);
        if (/^[0-7]{3}$/.test(mode)) node.mode = mode;
        else if (mode === "+x" || mode === "u+x") node.mode = [...node.mode].map((d, i) => String(Number(d) | (mode === "+x" || i === 0 ? 1 : 0))).join("");
        else if (mode === "-x") node.mode = [...node.mode].map((d) => String(Number(d) & 6)).join("");
        else fail(`chmod: this simulator supports +x, -x and three-digit octal modes`);
        return "";
    }
};

/** run one command line (with pipes and > / >>); returns the text the terminal shows */
export function run(sh, line) {
    const all = tokenize(line.trim());
    if (!all.length) return "";
    let shown = "";
    const groups = [[]];
    for (const t of all) { if (t === "&&") groups.push([]); else groups[groups.length - 1].push(t); }
    for (const tokens of groups) {
        const { output, failed } = runTokens(sh, tokens);
        shown += output;
        if (failed) break;
    }
    sh.last = { command: line.trim(), output: shown };
    return shown;
}

function runTokens(sh, tokens) {
    if (!tokens.length) return { output: "syntax error near unexpected token '&&'\n", failed: true };
    let redirect = null;
    const r = tokens.findIndex((t) => t === ">" || t === ">>");
    if (r >= 0) { redirect = { append: tokens[r] === ">>", file: tokens[r + 1] }; tokens.splice(r); }
    const stages = [[]];
    for (const t of tokens) { if (t === "|") stages.push([]); else stages[stages.length - 1].push(t); }
    let output = "";
    try {
        for (const [i, [cmd, ...args]] of stages.entries()) {
            if (!cmd) fail("syntax error near unexpected token '|'");
            const fn = COMMANDS[cmd];
            if (!fn) fail(`${cmd}: command not found in this simulator (supported: ${SUPPORTED})`);
            output = fn(sh, args, i === 0 ? "" : output);
        }
        if (redirect) {
            if (!redirect.file) fail("syntax error: missing file after redirect");
            const p = resolve(sh, redirect.file);
            if (!sh.fs.has(parent(p))) fail(`${redirect.file}: No such file or directory`);
            const old = sh.fs.get(p);
            if (old?.dir) fail(`${redirect.file}: Is a directory`);
            sh.fs.set(p, { dir: false, content: (redirect.append && old ? old.content : "") + output, mode: old?.mode ?? "644" });
            output = "";
        }
    } catch (error) {
        if (!(error instanceof ShellError)) throw error;
        return { output: `${error.message}\n`, failed: true };
    }
    return { output, failed: false };
}

export const fileContent = (sh, path) => { const n = sh.fs.get(path); return n && !n.dir ? n.content : null; };
export const isDir = (sh, path) => Boolean(sh.fs.get(path)?.dir);
