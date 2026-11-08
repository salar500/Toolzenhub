/* =========================================================
   ToolZen Hub
   Git path: a teaching model of a Git repository (working tree, index, commits, branches) and a subset of commands.
   Deterministic and in memory; it follows Git's behaviour for what it supports and says so for anything else.

   Supported: git status, git add <file>|.|-A, git commit -m "message", git restore [--staged] <file>,
   git branch [name], git switch [-c] <name>, git checkout [-b] <name>, git merge <branch>, git log [--oneline].
========================================================= */

const SUPPORTED = "git status, git add, git commit -m, git restore, git restore --staged, git branch, git switch, git switch -c, git checkout, git checkout -b, git merge, git log";

const sameTree = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every((k) => a[k] === b[k]); };

function hashId(text) {
    let h = 0x811c9dc5;
    for (const c of text) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, "0").slice(0, 7);
}

/** a fresh repository from a scenario: { commits: [{ msg, tree }], work?, index? } (index defaults to the HEAD tree) */
export function createRepo(scenario) {
    const repo = { commits: {}, order: [], branches: {}, head: "main", work: {}, index: {} };
    let parent = null;
    for (const c of scenario.commits) {
        const id = hashId(`${c.msg}|${parent}|${repo.order.length}`);
        repo.commits[id] = { id, msg: c.msg, parents: parent ? [parent] : [], tree: { ...c.tree } };
        repo.order.push(id);
        parent = id;
    }
    repo.branches.main = parent;
    for (const [name, b] of Object.entries(scenario.branches ?? {})) {
        let p = repo.branches[b.from ?? "main"];
        for (const c of b.commits) {
            const id = hashId(`${c.msg}|${p}|${repo.order.length}`);
            repo.commits[id] = { id, msg: c.msg, parents: [p], tree: { ...repo.commits[p].tree, ...c.tree } };
            repo.order.push(id);
            p = id;
        }
        repo.branches[name] = p;
    }
    if (scenario.head) repo.head = scenario.head;
    const tree = headTree(repo);
    repo.index = { ...tree, ...(scenario.index ?? {}) };
    repo.work = { ...repo.index, ...(scenario.work ?? {}) };
    for (const f of scenario.deleted ?? []) delete repo.work[f];
    return repo;
}

export const headCommit = (repo) => repo.commits[repo.branches[repo.head]];
export const headTree = (repo) => headCommit(repo)?.tree ?? {};

/** { staged: [{file, kind}], unstaged: [{file, kind}], untracked: [file] } */
export function status(repo) {
    const head = headTree(repo), staged = [], unstaged = [], untracked = [];
    for (const f of new Set([...Object.keys(head), ...Object.keys(repo.index)])) {
        if (!(f in repo.index)) staged.push({ file: f, kind: "deleted" });
        else if (!(f in head)) staged.push({ file: f, kind: "new file" });
        else if (head[f] !== repo.index[f]) staged.push({ file: f, kind: "modified" });
    }
    for (const f of Object.keys(repo.index)) {
        if (!(f in repo.work)) unstaged.push({ file: f, kind: "deleted" });
        else if (repo.work[f] !== repo.index[f]) unstaged.push({ file: f, kind: "modified" });
    }
    for (const f of Object.keys(repo.work)) if (!(f in repo.index)) untracked.push(f);
    const by = (a, b) => (a.file ?? a).localeCompare(b.file ?? b);
    return { staged: staged.sort(by), unstaged: unstaged.sort(by), untracked: untracked.sort() };
}

const ancestors = (repo, id) => { const seen = new Set(), stack = [id]; while (stack.length) { const c = stack.pop(); if (c && !seen.has(c)) { seen.add(c); stack.push(...repo.commits[c].parents); } } return seen; };

function tokenize(line) {
    const out = [];
    for (const m of line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) out.push(m[1] ?? m[2] ?? m[3]);
    return out;
}

function statusText(repo) {
    const s = status(repo);
    const lines = [`On branch ${repo.head}`];
    if (s.staged.length) lines.push("Changes to be committed:", ...s.staged.map((x) => `\t${x.kind}:   ${x.file}`));
    if (s.unstaged.length) lines.push("Changes not staged for commit:", ...s.unstaged.map((x) => `\t${x.kind}:   ${x.file}`));
    if (s.untracked.length) lines.push("Untracked files:", ...s.untracked.map((f) => `\t${f}`));
    if (!s.staged.length && !s.unstaged.length && !s.untracked.length) lines.push("nothing to commit, working tree clean");
    return lines.join("\n");
}

function switchTo(repo, name) {
    const s = status(repo);
    if (s.staged.length || s.unstaged.length) return `error: Your local changes would be overwritten by switching branches.\nPlease commit your changes or restore them before you switch branches.`;
    const untracked = Object.fromEntries(s.untracked.map((f) => [f, repo.work[f]]));
    repo.head = name;
    repo.index = { ...headTree(repo) };
    repo.work = { ...repo.index, ...untracked };
    return `Switched to branch '${name}'`;
}

/** run one command line; mutates repo; returns the output text */
export function run(repo, line) {
    const args = tokenize(line.trim());
    if (!args.length) return "";
    if (args[0] !== "git") return `${args[0]}: this simulator only runs git commands (${SUPPORTED}).`;
    const [, cmd, ...rest] = args;
    switch (cmd) {
        case "status": return statusText(repo);
        case "add": {
            if (!rest.length) return "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?";
            const files = rest.includes(".") || rest.includes("-A") || rest.includes("--all") ? [...new Set([...Object.keys(repo.work), ...Object.keys(repo.index)])] : rest;
            for (const f of files) {
                if (f in repo.work) repo.index[f] = repo.work[f];
                else if (f in repo.index) delete repo.index[f];
                else return `fatal: pathspec '${f}' did not match any files`;
            }
            return "";
        }
        case "commit": {
            const i = rest.indexOf("-m");
            if (i < 0 || !rest[i + 1]) return "error: this simulator needs a message: git commit -m \"Describe the change\"";
            const head = headCommit(repo);
            if (sameTree(repo.index, head?.tree ?? {})) return `On branch ${repo.head}\nnothing to commit (use "git add" to stage changes)`;
            const id = hashId(`${rest[i + 1]}|${head?.id}|${repo.order.length}`);
            repo.commits[id] = { id, msg: rest[i + 1], parents: head ? [head.id] : [], tree: { ...repo.index } };
            repo.order.push(id);
            repo.branches[repo.head] = id;
            const changed = status({ ...repo, branches: { ...repo.branches, [repo.head]: head?.id } }).staged.length;
            return `[${repo.head} ${id}] ${rest[i + 1]}\n ${changed} file${changed === 1 ? "" : "s"} changed`;
        }
        case "restore": {
            const staged = rest.includes("--staged") || rest.includes("-S");
            const files = rest.filter((r) => !r.startsWith("-"));
            if (!files.length) return "fatal: you must specify path(s) to restore";
            for (const f of files) {
                if (staged) {
                    const head = headTree(repo);
                    if (f in head) repo.index[f] = head[f]; else if (f in repo.index) delete repo.index[f]; else return `error: pathspec '${f}' did not match any file(s) known to git`;
                } else {
                    if (!(f in repo.index)) return `error: pathspec '${f}' did not match any file(s) known to git`;
                    repo.work[f] = repo.index[f];
                }
            }
            return "";
        }
        case "branch": {
            if (!rest.length) return Object.keys(repo.branches).sort().map((b) => `${b === repo.head ? "*" : " "} ${b}`).join("\n");
            const name = rest[0];
            if (name.startsWith("-")) return `This simulator supports git branch and git branch <name> only.`;
            if (repo.branches[name]) return `fatal: a branch named '${name}' already exists`;
            repo.branches[name] = repo.branches[repo.head];
            return "";
        }
        case "switch": case "checkout": {
            const create = rest[0] === "-c" || rest[0] === "-b";
            const name = create ? rest[1] : rest[0];
            if (!name) return `fatal: missing branch name`;
            if (create) {
                if (repo.branches[name]) return `fatal: a branch named '${name}' already exists`;
                repo.branches[name] = repo.branches[repo.head];
                repo.head = name;
                return `Switched to a new branch '${name}'`;
            }
            if (!repo.branches[name]) return `fatal: invalid reference: ${name}`;
            if (name === repo.head) return `Already on '${name}'`;
            return switchTo(repo, name);
        }
        case "merge": {
            const name = rest[0];
            if (!repo.branches[name]) return `merge: ${name ?? ""} - not something we can merge`;
            const s = status(repo);
            if (s.staged.length || s.unstaged.length) return "error: Your local changes would be overwritten by merge. Commit or restore them first.";
            const ours = repo.branches[repo.head], theirs = repo.branches[name];
            if (ancestors(repo, ours).has(theirs)) return "Already up to date.";
            if (ancestors(repo, theirs).has(ours)) {
                repo.branches[repo.head] = theirs;
                const untracked = Object.fromEntries(s.untracked.map((f) => [f, repo.work[f]]));
                repo.index = { ...headTree(repo) }; repo.work = { ...repo.index, ...untracked };
                return `Updating ${ours}..${theirs}\nFast-forward`;
            }
            const a = ancestors(repo, ours), b = ancestors(repo, theirs);
            const base = [...repo.order].reverse().find((id) => a.has(id) && b.has(id));
            const tb = repo.commits[base].tree, to = repo.commits[ours].tree, tt = repo.commits[theirs].tree;
            const merged = {}, conflicts = [];
            for (const f of new Set([...Object.keys(tb), ...Object.keys(to), ...Object.keys(tt)])) {
                const o = to[f], t = tt[f], bse = tb[f];
                if (o === t) { if (o !== undefined) merged[f] = o; }
                else if (o === bse) { if (t !== undefined) merged[f] = t; }
                else if (t === bse) { if (o !== undefined) merged[f] = o; }
                else conflicts.push(f);
            }
            if (conflicts.length) return `${conflicts.map((f) => `CONFLICT (content): Merge conflict in ${f}`).join("\n")}\nAutomatic merge failed. (This simulator stops here and leaves the repository unchanged; resolving conflicts is explained in the lesson.)`;
            const id = hashId(`merge ${name}|${ours}|${repo.order.length}`);
            repo.commits[id] = { id, msg: `Merge branch '${name}'`, parents: [ours, theirs], tree: merged };
            repo.order.push(id);
            repo.branches[repo.head] = id;
            repo.index = { ...merged }; repo.work = { ...merged, ...Object.fromEntries(s.untracked.map((f) => [f, repo.work[f]])) };
            return `Merge made by the 'ort' strategy.`;
        }
        case "log": {
            const lines = [];
            let c = headCommit(repo);
            while (c) { lines.push(rest.includes("--oneline") ? `${c.id} ${c.msg}` : `commit ${c.id}\n    ${c.msg}`); c = repo.commits[c.parents[0]]; }
            return lines.join("\n");
        }
        default: return `git: '${cmd ?? ""}' is not supported in this simulator. Supported: ${SUPPORTED}.`;
    }
}

/** a commit's tree on a branch contains these file contents */
export const branchHas = (repo, branch, files) => Boolean(repo.branches[branch]) && Object.entries(files).every(([f, v]) => repo.commits[repo.branches[branch]].tree[f] === v);
